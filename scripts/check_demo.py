"""Read-only D1 numeric, archive, membership and manifest verification."""
from __future__ import annotations
import argparse
import math
import sys
from demo_common import ROOT,assert_known_topics,digest,load_json,save_json,target
sys.path.insert(0,str(ROOT))
import relevance_evaluator as R
import expertise as E
import isr_core as ISR
from migrate_a4 import member_expertise

TOL=0.00100001  # Stored fields are rounded to 3 decimals; JS/Python tie rounding may differ.
USER_FIELDS=['uid','displayName','birthDate','geography','skills','socialRelations','post','features','gender']

def vec(value):
    if isinstance(value,list):return value
    if hasattr(value,'to_map'):return value.to_map().get('value',[])
    return list(value or [])

def compare_member(user,vectors,member,issue,issue_vector,creator):
    problems=[]
    def equal(field,expected,tolerance=TOL):
        actual=member.get(field)
        if not isinstance(actual,(int,float)) or not math.isfinite(actual) or abs(actual-expected)>tolerance:problems.append(field)
    year=E.to_date(issue['created_at']).year
    d,_,_=R.evaluate_demographic_rules(user,issue.get('demographics'),year)
    near=R.nearest_anchor(user.get('geography'),issue.get('location'))
    g=R.g_score(near[0],issue['mu_distance_meters'],issue['sigma_decay_meters']) if near else 0
    equal('D_score',d);equal('G_score',g)
    # Automatic S is deliberately fetched for at most 300 candidates. A stored zero
    # can mean it was not fetched; do not invent a full-ranking claim for that path.
    if member.get('S_score') or member.get('membership_source')=='explicit_join':
        equal('S_score',max(0,E.cosine_similarity(vec(vectors.get('profile_vector')),issue_vector)))
    equal('X_score',R.evaluate_social(user,(creator or {}).get('socialRelations')))
    weights=dict(zip(('w_D','w_G','w_S','w_X'),(issue.get(k,0) for k in ('w_demographic','w_geographic','w_semantic','w_social'))))
    components={c:member.get(c+'_score',0) for c in ('D','G','S','X')}
    equal('relevance_score',ISR.relevance(components,weights,member.get('membership_source')=='explicit_join'))
    skills={k:vec(v) for k,v in (vectors.get('experience_vectors') or {}).items()}
    edu,exp,total=member_expertise(user,skills,issue_vector,(issue.get('expertise_domain_parameters') or {}).get('CBC_adjustment_factor') or 1,issue['created_at'])
    for field,value in [('education_expertise',edu),('experience_expertise',exp),('expertise_score',total)]:equal(field,value)
    return problems

def check_plan(db,plan):
    problems=[];checked=0;member_count=0;visible=0;users={};vectors={}
    try:assert_known_topics(db,plan)
    except ValueError:problems.append('unplanned topics')
    for collection,roots in plan['inventory']['topics'].items():
        for ident in roots:
            snap=db.collection(collection).document(ident).get()
            if not snap.exists or snap.to_dict().get('status')!='archived':problems.append(f'legacy not archived: {collection}/{ident}')
    for key,entry in plan['scenarios'].items():
        if entry['stage']!='complete':problems.append(key+': incomplete');continue
        ident=entry['issue_id'];snap=db.collection('issues').document(ident).get();disc_snap=db.collection('discussions').document(ident).get()
        if not snap.exists or not disc_snap.exists:problems.append(key+': topic pair missing');continue
        issue=snap.to_dict();disc=disc_snap.to_dict();checked+=1
        phase=entry['phase'];expected={'chat':('open','discussion'),'voting':('in_process','Voting'),'todo':('approved','approved'),'standby':('archived','archived')}[phase]
        if (issue.get('status'),disc.get('status'))!=expected:problems.append(key+': phase drift')
        if phase!='standby':visible+=1
        if issue.get('demo_plan_hash')!=entry.get('demo_plan_hash') or disc.get('demo_plan_hash')!=entry.get('demo_plan_hash'):problems.append(key+': plan marker drift')
        if issue.get('title')!=entry['input']['title'] or issue.get('description')!=entry['input']['description']:problems.append(key+': text drift')
        public=db.collection('microcommunities').document(entry['microcommunity_id']).get()
        if not public.exists or public.to_dict().get('issue_id')!=ident:problems.append(key+': public link');continue
        rows=[m.to_dict() for m in db.collection('microcommunity_members').where('microcommunity_id','==',entry['microcommunity_id']).stream()]
        ids=[str(m['user_id']) for m in rows];member_count+=len(rows)
        if len(ids)!=len(set(ids)) or public.to_dict().get('member_count')!=len(rows):problems.append(key+': member count/duplicates')
        if set(map(str,disc.get('participants',[])))!=set(ids):problems.append(key+': participants')
        for uid in set(ids)|{entry['creator']['uid']}:
            if uid not in users:
                u=db.collection('users').document(uid).get(field_paths=USER_FIELDS)
                v=db.collection('user_vectors').document(uid).get()
                users[uid]=u.to_dict() if u.exists else None;vectors[uid]=v.to_dict() if v.exists else None
        iv=db.collection('issue_vectors').document(ident).get()
        if not iv.exists:problems.append(key+': issue vector missing');continue
        issue_vector=vec(iv.to_dict().get('vector'))
        if len(issue_vector)!=768 or not all(isinstance(x,(int,float)) and math.isfinite(x) for x in issue_vector):problems.append(key+': bad vector');continue
        expected_isr=ISR.isr_for_public([{'uid':m['user_id'],'R':m['relevance_score'],'E':m['expertise_score']} for m in rows],issue)
        for m,b in zip(rows,expected_isr):
            uid=str(m['user_id'])
            if not users[uid] or not vectors[uid]:problems.append(key+': profile/vector missing '+uid);continue
            problems.extend(f'{key}/{uid}: {field}' for field in compare_member(users[uid],vectors[uid],m,issue,issue_vector,users.get(entry['creator']['uid'])))
            for stored,recomputed in [('normalized_relevance','R_norm'),('normalized_experience','E_norm'),('normalized_contribution','C_norm'),('isr_score','isr')]:
                if abs(m.get(stored,float('inf'))-b[recomputed])>TOL:problems.append(f'{key}/{uid}: {stored}')
            for topic in (issue,disc):
                for field,source in [('relevance_scores','relevance_score'),('isr_scores','isr_score')]:
                    if abs((topic.get(field) or {}).get(uid,float('inf'))-m[source])>TOL:problems.append(f'{key}/{uid}: {field}')
        for topic in (issue,disc):
            if set(topic.get('isr_scores',{}))!=set(ids) or set(topic.get('relevance_scores',{}))!=set(ids):problems.append(key+': map membership')
        message_ids={s.id for s in db.collection('discussions').document(ident).collection('messages').select([]).stream()}
        expected_messages={'msg_init'}|{f'{key}-message-{i+1}' for i in range(len(entry['content']['messages']))}
        if message_ids!=expected_messages or disc.get('message_count')!=len(message_ids):problems.append(key+': message identity/count')
        if phase=='todo':
            result=ISR.tally(issue.get('votes'),{str(m['user_id']):m['isr_score'] for m in rows},len(issue.get('options',[])))
            if result['winner']!=issue.get('winning_option_index') or not issue.get('tally'):problems.append(key+': tally/winner')
            for option,score in zip(issue.get('options',[]),result['scores']):
                if abs(option.get('score',float('inf'))-score)>TOL:problems.append(key+': option score')
            if result['winner'] is not None:
                steps=issue['options'][result['winner']].get('description',[])
                if [x.get('step') for x in issue.get('tasks',[])]!=[x.get('step') for x in steps]:problems.append(key+': winning tasks')
    return {'scenarios':checked,'visible_scenarios_before_flagship':visible,'members':member_count,'tolerance':TOL,'problems':problems}

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--project',required=True)
    parser.add_argument('--i-know-this-is-live',action='store_true',dest='live');parser.add_argument('--manifest',default=str(ROOT/'specs/demo/manifest.json'));parser.add_argument('--report')
    args=parser.parse_args(argv);target(args.project,args.live)
    from google.cloud import firestore
    plan=load_json(args.manifest)
    if plan['project']!=args.project:raise ValueError('Manifest project differs')
    report=check_plan(firestore.Client(project=args.project),plan)
    if args.report:save_json(args.report,report)
    print(json.dumps(report));return bool(report['problems'])

if __name__=='__main__':sys.exit(main())
