"""D1 target guards, atomic local journal and synthetic-data inventory."""
from __future__ import annotations
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),default=str).encode()).hexdigest()

def load_json(path):
    return json.loads(Path(path).read_text(encoding='utf8'))

def save_json(path,value):
    """Same-filesystem replace; fsync before advertising the next journal state."""
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_name(path.name+'.tmp')
    with tmp.open('w',encoding='utf8',newline='\n') as stream:
        json.dump(value,stream,indent=2,sort_keys=True);stream.write('\n');stream.flush();os.fsync(stream.fileno())
    os.replace(tmp,path)

def target(project,live=False,functions_url=None):
    host=os.environ.get('FIRESTORE_EMULATOR_HOST')
    if not project: raise ValueError('Explicit --project is required')
    if host:
        if live: raise ValueError('Unset FIRESTORE_EMULATOR_HOST before an acknowledged live run')
        if not re.fullmatch(r'(127\.0\.0\.1|localhost):\d+',host): raise ValueError('Emulator host must be loopback with an explicit port')
    elif not live: raise ValueError('Refusing live access: set the emulator or pass --project and --i-know-this-is-live')
    url=functions_url or (f'http://127.0.0.1:5001/{project}/us-central1' if host else f'https://us-central1-{project}.cloudfunctions.net')
    parsed=urllib.parse.urlparse(url)
    if parsed.query or parsed.fragment or parsed.username or parsed.password: raise ValueError('Invalid function base URL')
    if host and (parsed.scheme!='http' or parsed.hostname not in ('127.0.0.1','localhost')): raise ValueError('Emulator functions must be local HTTP')
    if not host and url.rstrip('/')!=f'https://us-central1-{project}.cloudfunctions.net': raise ValueError('Live function URL must match the acknowledged project')
    return {'project':project,'emulator':host,'functions_url':url.rstrip('/')}

def call(target_info,name,body):
    req=urllib.request.Request(target_info['functions_url']+'/'+name,data=json.dumps(body).encode(),
        headers={'Content-Type':'application/json'},method='POST')
    # Deliberately no automatic retry: Check spends budget; Create is replayed from its draft.
    with urllib.request.urlopen(req,timeout=180) as response:
        data=json.load(response)
    if not data.get('success'): raise ValueError('Function did not return success')
    return data

TOPIC_FIELDS=['status','demo_run_id','demo_archive','demo_scenario','demo_plan_hash']
def inventory(db):
    result={'topics':{},'publics':{},'member_count':0,'vectors':0,'messages':{},'protected_counts':{}}
    for name in ('issues','discussions'):
        result['topics'][name]={s.id:{'status':s.to_dict().get('status'),'update_time':s.update_time.isoformat(),
            'demo_run_id':s.to_dict().get('demo_run_id')} for s in db.collection(name).select(TOPIC_FIELDS).stream()}
    result['publics']={s.id:str(s.to_dict().get('issue_id') or s.id) for s in db.collection('microcommunities').select(['issue_id']).stream()}
    result['member_count']=len(list(db.collection('microcommunity_members').select([]).stream()))
    result['vectors']=len(list(db.collection('issue_vectors').select([]).stream()))
    for topic_id in result['topics']['discussions']:
        ids=sorted(s.id for s in db.collection('discussions').document(topic_id).collection('messages').select([]).stream())
        result['messages'][topic_id]={'count':len(ids),'ids_sha256':digest(ids)}
    for name in ('users','user_packs','user_vectors'):
        result['protected_counts'][name]=len(list(db.collection(name).select([]).stream()))
    issue_ids=set(result['topics']['issues']);disc_ids=set(result['topics']['discussions'])
    result['orphans']={'issue_only':sorted(issue_ids-disc_ids),'discussion_only':sorted(disc_ids-issue_ids),
        'public_without_topic':sorted(p for p,i in result['publics'].items() if i not in issue_ids|disc_ids)}
    return result

def archive_inventory(db,original,run_id,apply=False):
    """Archive both roots atomically per topic; never touch linked history."""
    from google.cloud import firestore
    @firestore.transactional
    def one(tx,topic_id,writing):
        roots=[]
        for collection in ('issues','discussions'):
            expected=original['topics'][collection].get(topic_id)
            if expected is None: continue
            ref=db.collection(collection).document(topic_id);snap=ref.get(transaction=tx)
            if not snap.exists: raise ValueError('Planned topic disappeared: '+topic_id)
            data=snap.to_dict()
            archived=data.get('status')=='archived'
            if archived:
                if expected['status']=='archived' or (data.get('demo_archive') or {}).get('run_id')==run_id: continue
                raise ValueError('Topic archived by another run: '+topic_id)
            if snap.update_time.isoformat()!=expected['update_time']: raise ValueError('Topic changed after inventory: '+topic_id)
            roots.append((ref,data))
        if writing:
            for ref,data in roots:
                tx.update(ref,{'status':'archived','demo_archive':{'run_id':run_id,'previous_status':data.get('status'),
                    'reason':'D1 historical data','at':firestore.SERVER_TIMESTAMP}})
        return len(roots)
    ids=sorted(set(original['topics']['issues'])|set(original['topics']['discussions']))
    # Read/validate every planned root before starting any archive writes.
    for ident in ids: one(db.transaction(),ident,False)
    if not apply:return sum(1 for c in original['topics'].values() for v in c.values() if v['status']!='archived')
    return sum(one(db.transaction(),ident,True) for ident in ids)

def assert_known_topics(db,manifest):
    known={name:set(manifest['inventory']['topics'][name]) for name in ('issues','discussions')}
    for entry in manifest['scenarios'].values():
        if entry.get('issue_id'):
            for ids in known.values(): ids.add(entry['issue_id'])
    for name,ids in known.items():
        current={s.id for s in db.collection(name).select([]).stream()}
        if current-ids:raise ValueError('Unplanned topics appeared; inspect and repair before continuing')

def point(value):
    if hasattr(value,'latitude'):return [value.latitude,value.longitude]
    if isinstance(value,(list,tuple)) and len(value)==2:return list(value)
    return None

def select_creators(users,today):
    users=sorted((u for u in users if str(u.get('uid','')).isdigit() and u.get('birthDate') and
        any(g.get('type')=='home' and point(g.get('geo')) and g.get('building') for g in u.get('geography',[]))),key=lambda u:int(u['uid']))
    if not users:raise ValueError('No complete P2 profiles with a building/home; do not seed old coordinates')
    from expertise import age_in_years
    def age(u):return age_in_years(u['birthDate'],today)
    adults=[u for u in users if age(u)>=18]
    def choose(candidates,label):
        if not candidates:raise ValueError('No suitable creator: '+label)
        return candidates[0]
    def skill(u,words):return any(any(word in str(s.get('name','')).lower()+' '+str(s.get('specialization','')).lower() for word in words) for s in u.get('skills',[]))
    parent=lambda u:any(str(r.get('type','')).lower() in ('child','son','daughter') for r in u.get('socialRelations',[]))
    work=lambda u:next((g for g in u.get('geography',[]) if g.get('type')=='work' and 'argo' in str(g.get('place','')).lower()),None)
    def estate(u):
        home=next(g for g in u['geography'] if g.get('type')=='home')
        return str(home['building']).split(', h')[0]
    from collections import Counter
    counts=Counter(estate(u) for u in users)
    def original_group(size):
        names=sorted(k for k,v in counts.items() if v==size)
        if len(names)!=1:raise ValueError('Cannot uniquely map original estate population '+str(size))
        return [u for u in adults if estate(u)==names[0]]
    selectors=[original_group(2154),original_group(2840),[u for u in original_group(2087) if parent(u)],[u for u in adults if age(u)>=65],
        [u for u in adults if work(u)],[u for u in adults if skill(u,('music','art','choir'))],
        [u for u in adults if skill(u,('software','program','developer'))],adults,
        sorted(adults,key=lambda u:(-len(u.get('socialRelations',[])),int(u['uid']))),adults]
    result={}
    for number,candidates in enumerate(selectors,1):
        u=choose(candidates,str(number));anchor=work(u) if number==5 else next(g for g in u['geography'] if g.get('type')=='home')
        result[f'D1-{number:02}']={'uid':str(u['uid']),'name':u.get('displayName') or 'Synthetic '+str(u['uid']),
            'location':point(anchor['geo']),'anchor':anchor.get('building') or anchor.get('place'),
            'selection_input_sha256':digest({k:u.get(k) for k in ('uid','birthDate','geography','skills','socialRelations')})}
    return result
