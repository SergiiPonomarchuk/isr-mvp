"""Scoped read-only completeness audit; output never includes projected field values."""
from __future__ import annotations
import argparse, collections, datetime as dt, hashlib, json, math, os, sys
from pathlib import Path
import inventory_values_grounding as I
import embedding_templates as T
import ai_config as AI

FIELDS={
 'users':('uid','birthDate','gender','nationality','post','skills','features','geography','socialRelations','social_relations_version','isVerified','values_description','values_taxonomy','marks'),
 'user_vectors':('uid','profile_vector','experience_vectors','embedding_model','embedding_dims','embedding_template','embedding_task_type','embedding_text_sha256','embedded_at'),
 'issues':('issue_id','status','submitter_id','created_at','starts','ends','options','votes','isr_scores','relevance_scores','scoring_version','location','winning_option'),
 'discussions':('discussion_id','issue_id','status','creator_uid','created_at','ends','participants','message_count','isr_scores','relevance_scores','scoring_version'),
 'microcommunities':('microcommunity_id','issue_id','member_count','values_taxonomy','status','scoring_version'),
 'microcommunity_members':('user_id','microcommunity_id','relevance_score','expertise_score','isr_score','scoring_version','membership_source','cohort'),
 'actions':('action_id','user_id','uid','issue_id','status','created_at','contribution_score'),
 'issue_drafts':('submitter_id','state','status','version','created_at','expires_at','issue_id','scoring_version'),
 'analyzer_logs':('model','prompt_version','status','created_at','usage','token_count'),
 'voting':('issue_id','status','submitter_id'), 'tasks':('issue_id','user_id','status'),
 'values':('uid','values_taxonomy','meta'),
 'discussions__messages':('sender_uid','user_id','created_at','timestamp','marks'),
}
ROOTS=tuple(k for k in FIELDS if '__' not in k)
EXCLUDED=('issue_vectors','user_packs','geocode_cache','config','membership_events')

def canonical(v):
    if hasattr(v,'to_map'):return {'__type':'vector','values':canonical(v.to_map()['value'])}
    if type(v).__name__=='Vector':return {'__type':'vector','values':canonical(list(v))}
    if isinstance(v,dt.datetime):return {'__type':'timestamp','value':v.isoformat()}
    if hasattr(v,'latitude') and hasattr(v,'longitude'):return {'__type':'geopoint','latitude':v.latitude,'longitude':v.longitude}
    if isinstance(v,dict):return {str(k):canonical(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [canonical(x) for x in v]
    if v is None or isinstance(v,(str,bool,int)):return v
    if isinstance(v,float):return v if math.isfinite(v) else {'__audit_nonfinite':str(v)}
    raise ValueError('unsupported_projected_type')

def summary(v):
    c=canonical(v)
    return {'type':('tag:'+c['__type']) if isinstance(c,dict) and isinstance(c.get('__type'),str) else type(c).__name__,
            'empty':v is None or v=='' or v==[] or v=={},'sha256':I.digest(c)}

def summarize(data,fields):return {k:summary(data[k]) for k in fields if k in data}

def vec(v):
    if isinstance(v,dict) and v.get('__type')=='vector':v=v.get('values')
    if hasattr(v,'to_map'):v=v.to_map().get('value')
    if type(v).__name__=='Vector':v=list(v)
    return v if isinstance(v,(list,tuple)) else []

def valid_vector(v):
    a=vec(v)
    return len(a)==AI.EMBED_DIMS and all(I.finite_number(x) for x in a) and any(x!=0 for x in a)

def profile_problems(uid,u):
    out=[]
    if not uid.isdigit():return ['nonparticipant_profile']
    if type(u.get('uid')) not in (str,int) or str(u['uid'])!=uid:out.append('uid_mismatch')
    for key in ('skills','post','features','geography','socialRelations'):
        if not isinstance(u.get(key),list):out.append(key+'_not_array')
    try:
        birth=dt.date.fromisoformat(u.get('birthDate',''))
        if not dt.date(1900,1,1)<=birth<=dt.date(2026,11,23):out.append('birth_date_out_of_range')
    except (ValueError,TypeError):out.append('invalid_birth_date')
    skills=u.get('skills') if isinstance(u.get('skills'),list) else []
    seen=set()
    for s in skills:
        if not isinstance(s,dict):out.append('invalid_skill_entry');continue
        sid=s.get('id')
        if sid is None or isinstance(sid,(dict,list,bool)):out.append('invalid_skill_id')
        elif str(sid) in seen:out.append('duplicate_skill_id')
        else:seen.add(str(sid))
        if s.get('type') not in ('education','work experience','activity'):out.append('unknown_skill_type')
    geo=u.get('geography') if isinstance(u.get('geography'),list) else []
    if not geo:out.append('no_geography')
    for a in geo:
        g=a.get('geo') if isinstance(a,dict) else None
        if not isinstance(g,(list,tuple)) or len(g)!=2 or not all(I.finite_number(x) for x in g) or not (-90<=g[0]<=90 and -180<=g[1]<=180):out.append('invalid_anchor_coordinates')
    relations=u.get('socialRelations') if isinstance(u.get('socialRelations'),list) else []
    for r in relations:
        if not isinstance(r,dict) or type(r.get('relative')) not in (str,int):out.append('invalid_relation_entry')
        elif str(r['relative'])==uid:out.append('self_relation')
        if isinstance(r,dict) and 'x_eligible' in r and type(r['x_eligible']) is not bool:out.append('invalid_x_flag')
    return sorted(set(out))

def embedding_problems(uid,u,v):
    if not isinstance(u.get('skills'),list):return ['incomplete_profile_not_embedding_candidate']
    if v is None:return ['missing_embedding_document']
    out=[]
    expected={'embedding_model':AI.EMBED_MODEL,'embedding_dims':AI.EMBED_DIMS,'embedding_template':T.VERSION,'embedding_task_type':AI.TASK_TYPE_DOCUMENT}
    if any(type(v.get(k)) is not type(value) or v.get(k)!=value for k,value in expected.items()):out.append('embedding_metadata_not_current')
    if not valid_vector(v.get('profile_vector')):out.append('invalid_profile_vector')
    skills=u['skills']
    if any(not isinstance(s,dict) for s in skills):return out+['cannot_check_malformed_skills']
    try:
        texts=T.skill_texts(u);profile=T.profile_text(u)
    except (TypeError,AttributeError,IndexError):return out+['cannot_build_embedding_template']
    if profile:texts['profile']=profile
    hashes={k:hashlib.sha256(t.encode()).hexdigest() for k,t in texts.items()}
    if v.get('embedding_text_sha256')!=hashes:out.append('embedding_source_hash_mismatch')
    vectors=v.get('experience_vectors')
    if not isinstance(vectors,dict):out.append('invalid_skill_vectors_map');vectors={}
    expected_skills=set(texts)-{'profile'}
    if any(k not in vectors for k in expected_skills):out.append('missing_skill_vector')
    if any(not valid_vector(vectors[k]) for k in expected_skills if k in vectors):out.append('invalid_skill_vector')
    if set(vectors)-expected_skills:out.append('extra_skill_vector')
    if v.get('uid') is not None and str(v['uid'])!=uid:out.append('embedding_uid_mismatch')
    return sorted(set(out))

def pages(db,root,page_size,parent=None):
    if root not in FIELDS or (root=='discussions__messages')!=(parent is not None):raise ValueError('unapproved_path')
    if type(page_size) is not int or not 1<=page_size<=500:raise ValueError('invalid_page_size')
    q=(db.collection('discussions').document(parent).collection('messages') if parent is not None else db.collection(root)).select(FIELDS[root]).order_by('__name__')
    last=None;seen=set()
    while True:
        p=q.limit(page_size)
        if last is not None:p=p.start_after(last)
        batch=p.get(timeout=60)
        for snap in batch:
            if snap.id in seen:raise ValueError('duplicate_scan_id')
            seen.add(snap.id);yield snap
        if len(batch)<page_size:return
        last=batch[-1]

def compare_backup(current,old):
    missing=sorted(set(old)-set(current));added=sorted(set(current)-set(old));fields=[];changed=0
    for uid in sorted(set(old)&set(current)):
        a,b=current[uid]['fields'],old[uid]['fields']
        gaps=[k for k,x in b.items() if not x['empty'] and (k not in a or a[k]['empty'])]
        if gaps:fields.append({'id':uid,'fields':gaps})
        if a!=b:changed+=1
    return {'missing_documents_review':missing,'added_documents':added,'previously_populated_now_empty_review':fields,'changed_projected_documents':changed}

def backup_index(folder):
    folder=Path(folder);manifest=G_json((folder/'manifest.json').read_bytes())
    if manifest.get('project')!=I.LIVE_PROJECT or manifest.get('script')!='scripts/backup_firestore.py (R0)' or not manifest.get('finished_utc'):raise ValueError('invalid_backup_manifest')
    if type(manifest.get('total')) is not int or manifest['total']!=sum(manifest.get('documents',{}).values()):raise ValueError('invalid_backup_counts')
    result={};receipts={}
    for name,fields in FIELDS.items():
        if name not in manifest['documents']:continue
        rows={};h=hashlib.sha256();count=0
        with (folder/(name+'.jsonl')).open('rb') as f:
            for line in f:
                h.update(line);record=G_json(line);path=record.get('path');data=record.get('data')
                parts=path.split('/') if isinstance(path,str) else []
                good=(len(parts)==4 and parts[0]=='discussions' and parts[2]=='messages') if name=='discussions__messages' else (len(parts)==2 and parts[0]==name)
                if not good or not isinstance(data,dict):raise ValueError('invalid_backup_record')
                key=I.safe_id(parts[1])+('/'+I.safe_id(parts[3]) if name=='discussions__messages' else '')
                if key in rows:raise ValueError('duplicate_backup_path')
                rows[key]={'fields':summarize(data,fields)};count+=1
        if count!=manifest['documents'][name]:raise ValueError('backup_count_mismatch')
        result[name]=rows;receipts[name]={'documents':count,'sha256':h.hexdigest()}
    return result,{'manifest_sha256':hashlib.sha256((folder/'manifest.json').read_bytes()).hexdigest(),'finished_utc':manifest['finished_utc'],'files':receipts,'unassessed_manifest_entries':sorted(set(manifest['documents'])-set(FIELDS))}

def G_json(raw):
    def unique(pairs):
        out={}
        for k,v in pairs:
            if k in out:raise ValueError('duplicate_json_key')
            out[k]=v
        return out
    return json.loads(raw,object_pairs_hook=unique)

def audit(db,sources,source_receipts,backup=None,page_size=200,progress=None):
    rows={};raw={};findings=[];observations=collections.Counter();grounding=collections.Counter()
    def flag(root,uid,reason):findings.append({'collection':root,'id':I.safe_id(uid),'reason':reason})
    for root in ROOTS:
        rows[root]={};raw[root]={}
        for snap in pages(db,root,page_size):
            uid=snap.id;data=snap.to_dict();key=I.safe_id(uid)
            rows[root][key]={'fields':summarize(data,FIELDS[root]),'update_time':snap.update_time.isoformat()}
            if root=='user_vectors':
                user=raw['users'].get(uid)
                if user is None:flag(root,uid,'embedding_without_profile')
                else:
                    for reason in embedding_problems(uid,user,data):flag(root,uid,reason)
            else:raw[root][uid]=data
        if progress:progress(root,len(rows[root]))
    users=raw['users']
    for uid,u in users.items():
        for reason in profile_problems(uid,u):flag('users',uid,reason)
        if isinstance(u.get('skills'),list) and I.safe_id(uid) not in rows['user_vectors']:flag('user_vectors',uid,'missing_embedding_document')
        g=I.classify(uid,u,sources.get(uid,[]));grounding[g['state']]+=1
        for reason in g.get('reasons',[]):flag('users',uid,'values_'+reason)
        if u.get('values_description') and not u.get('values_taxonomy'):observations['narrative_without_values_vector']+=1
        if g['state']=='not_vectorized':observations['not_vectorized_coverage']+=1
        meta=u.get('values_taxonomy',{});meta=meta.get('meta') if isinstance(meta,dict) else None
        if isinstance(meta,dict):
            for field in ('timestamp','vector_id','overall_confidence'):
                if field not in meta:observations['values_metadata_missing_'+field]+=1
        rels=u.get('socialRelations')
        if isinstance(rels,list):
            if u.get('social_relations_version')!='x-links-1':observations['pending_x_version_profiles']+=1
            for rel in rels:
                if not isinstance(rel,dict):continue
                target=rel.get('relative')
                if type(target) in (str,int) and str(target) not in users:flag('users',uid,'relation_target_missing')
                if type(rel.get('x_eligible')) is not bool:observations['pending_x_flag_links']+=1
    publics=raw['microcommunities'];members=raw['microcommunity_members'];counts=collections.Counter();pairs=set()
    topics=set(raw['issues'])|set(raw['discussions'])
    for mid,m in members.items():
        pub=str(m.get('microcommunity_id',''));uid=str(m.get('user_id',''));counts[pub]+=1
        if pub not in publics:flag('microcommunity_members',mid,'public_target_missing')
        if uid not in users:flag('microcommunity_members',mid,'user_target_missing')
        if (pub,uid) in pairs:flag('microcommunity_members',mid,'duplicate_public_user_pair')
        pairs.add((pub,uid))
        for field in ('relevance_score','expertise_score','isr_score'):
            if field in m and not I.finite_number(m[field]):flag('microcommunity_members',mid,'invalid_'+field)
    for pid,p in publics.items():
        if p.get('issue_id') is not None and str(p['issue_id']) not in topics:flag('microcommunities',pid,'topic_target_missing')
        if 'member_count' in p and (type(p['member_count']) is not int or p['member_count']!=counts[pid]):flag('microcommunities',pid,'member_count_mismatch')
    for root,field in (('issues','submitter_id'),('discussions','creator_uid'),('actions','user_id')):
        for uid,data in raw[root].items():
            if data.get(field) is not None and str(data[field]) not in users:flag(root,uid,'user_target_missing')
    rows['discussions__messages']={}
    for parent,data in raw['discussions'].items():
        count=0
        for snap in pages(db,'discussions__messages',page_size,parent):
            rows['discussions__messages'][I.safe_id(parent)+'/'+I.safe_id(snap.id)]={'fields':summarize(snap.to_dict(),FIELDS['discussions__messages']),'update_time':snap.update_time.isoformat()};count+=1
        if 'message_count' in data and data['message_count']!=count:flag('discussions',parent,'message_count_mismatch')
    if progress:progress('discussions__messages',len(rows['discussions__messages']))
    comparisons={};backup_receipt=None
    if backup:
        old,backup_receipt=backup_index(backup)
        comparisons={name:compare_backup(rows[name],old.get(name,{})) for name in FIELDS}
    return {'version':'db-completeness-audit-1','complete_for_scoped_paths':True,'atomic_snapshot':False,'collections':rows,'counts':{k:len(v) for k,v in rows.items()},'findings':findings,'finding_counts':dict(collections.Counter(x['reason'] for x in findings)),'observations':dict(observations),'grounding_counts':dict(grounding),'source_receipts':source_receipts,'backup_receipt':backup_receipt,'backup_comparison':comparisons,'unassessed_paths':list(EXCLUDED),'limitations':['not_full_database','no_atomic_snapshot','subcollections_only_for_existing_discussion_parents','no_scoring_or_semantic_quality_audit','differences_are_review_candidates_not_restore_authorization'],'production_writes':0,'provider_calls':0}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',required=True);p.add_argument('--i-know-this-is-live',action='store_true',dest='live');p.add_argument('--artifact',action='append',default=[]);p.add_argument('--backup');p.add_argument('--report',required=True);p.add_argument('--page-size',type=int,default=200);a=p.parse_args(argv)
    try:
        mode=I.check_target(a.project,a.live)
        if Path(a.report).exists():raise ValueError('existing_report')
        if type(a.page_size) is not int or not 1<=a.page_size<=500:raise ValueError('invalid_page_size')
        sources,receipts=I.load_artifacts(a.artifact)
        if any('error' in x for x in receipts):raise ValueError('invalid_source_file')
        from google.cloud import firestore
        db=firestore.Client(project=a.project)
        try:r=audit(db,sources,receipts,a.backup,a.page_size,lambda path,n:print(json.dumps({'scanned_collection':path,'documents':n}),flush=True))
        finally:db.close()
        r={**r,'project':a.project,'target':mode,'generated_at':dt.datetime.now(dt.timezone.utc).isoformat()};I.save_report(r,a.report)
        print(json.dumps({k:r[k] for k in ('complete_for_scoped_paths','counts','finding_counts','observations','grounding_counts','production_writes','provider_calls')}));return 0
    except Exception as error:
        print(json.dumps({'stopped':True,'error_class':type(error).__name__,'production_writes':0}),file=sys.stderr);return 1

if __name__=='__main__':sys.exit(main())
