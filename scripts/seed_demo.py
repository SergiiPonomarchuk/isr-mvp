"""D1: metadata inventory, durable seed plan and resumable real Check/Create driver.

Dry run by default. Live writes require --project and --i-know-this-is-live and are
the author's steps. Stored content is prepared separately; a rerun spends no AI.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import sys
from demo_common import (ROOT,archive_inventory,assert_known_topics,call,digest,inventory,load_json,
                         save_json,select_creators,target,exclusive)

PHASES={1:'standby',2:'chat',3:'voting',4:'todo',5:'voting',6:'chat',7:'todo',8:'voting',9:'chat',10:'todo'}
USER_FIELDS=['uid','displayName','birthDate','geography','skills','socialRelations']

def make_plan(db,content,run_id,project,creators=None):
    if not run_id or not all(c.isalnum() or c in '-_' for c in run_id):raise ValueError('Use a simple nonempty run id')
    if content.get('version')!='d1-content-v1' or len(content.get('scenarios',{}))!=10:raise ValueError('Ten stored content scenarios are required')
    if content.get('test_fixture') and not os.environ.get('FIRESTORE_EMULATOR_HOST'):raise ValueError('Mock content is emulator-only')
    from prepare_demo import validate_scenario
    for value in content['scenarios'].values():validate_scenario(value)
    creators=creators or content.get('creators')
    if not creators:
        users=[s.to_dict() for s in db.collection('users').select(USER_FIELDS).stream()]
        creators=select_creators(users,dt.date.today().isoformat())
    current=inventory(db)
    if any(x.get('demo_run_id') for roots in current['topics'].values() for x in roots.values()):
        raise ValueError('A demo run already exists; resume its manifest or make an explicit reset plan')
    dirty=bool(subprocess.check_output(['git','diff','HEAD','--','functions','prototype','scripts'],cwd=ROOT)) or bool(subprocess.check_output(['git','ls-files','--others','--exclude-standard','functions','prototype','scripts'],cwd=ROOT))
    if dirty and not content.get('test_fixture'):raise ValueError('Commit the runtime code before recording a real seed provenance')
    plan={'version':'d1-plan-v1','test_fixture':bool(content.get('test_fixture')),'source_worktree_clean':not dirty,'run_id':run_id,'project':project,'content_sha256':digest(content),
        'source_release':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
        'inventory':current,'usage':{'checks':0,'content_text_requests':content.get('usage',{}).get('requests',0)},'scenarios':{}}
    for number,phase in PHASES.items():
        key=f'D1-{number:02}';source=content['scenarios'][key];creator=creators[key]
        if not source.get('title') or not source.get('description'):raise ValueError('Scenario text missing: '+key)
        plan['scenarios'][key]={'phase':phase,'creator':creator,'content':source,'stage':'planned',
            'input':{'title':source['title'],'description':source['description'],'location':creator['location'],
                     'submitterId':creator['uid']}}
    return plan

def recover_results(db,plan,save):
    """Recover a lost response from the exact saved server-only draft, without new AI."""
    for entry in plan['scenarios'].values():
        if entry.get('draft_id') and not entry.get('issue_id'):
            snap=db.collection('issue_drafts').document(entry['draft_id']).get()
            if not snap.exists:raise ValueError('Saved draft missing; do not derive another automatically')
            result=snap.to_dict().get('creation_result')
            if result:
                entry.update(issue_id=result['issue_id'],microcommunity_id=result['microcommunity_id'],stage='created')
                save(plan)

def arrange(target_info,plan,key,entry,live):
    request={'project':target_info['project'],'issueId':entry['issue_id'],'runId':plan['run_id'],
        'scenarioKey':key,'creatorName':entry['creator']['name'],'content':entry['content'],'phase':entry['phase']}
    command=['node',str(ROOT/'functions/tools/demo-phase.cjs')]
    if live:command.append('--i-know-this-is-live')
    result=subprocess.run(command,input=json.dumps(request),text=True,capture_output=True,env=os.environ.copy())
    if result.returncode:raise ValueError('Server phase arrangement failed; saved issue/draft retained. Inspect the emulator logs.')
    return json.loads(result.stdout)

def run_seed(db,plan,target_info,save,apply=False,request=call,phase_writer=arrange,live=False):
    if plan.get('presentation_started'):raise ValueError('Presentation has started; use read-only checks or an explicit reset plan')
    if plan.get('project')!=target_info['project']:raise ValueError('Manifest project differs from target')
    recover_results(db,plan,save)
    assert_known_topics(db,plan)
    for entry in plan['scenarios'].values():
        creator=entry['creator']
        if creator.get('selection_input_sha256'):
            snapshot=db.collection('users').document(creator['uid']).get(field_paths=USER_FIELDS)
            user=snapshot.to_dict() if snapshot.exists else {}
            actual=digest({k:user.get(k) for k in ('uid','birthDate','geography','skills','socialRelations')})
            if actual!=creator['selection_input_sha256']:raise ValueError('Creator changed after content preparation; review before seeding')
    if not apply:
        count=archive_inventory(db,plan['inventory'],plan['run_id'],False)
        return {'archive_documents':count,'scenarios_left':sum(e['stage']!='complete' for e in plan['scenarios'].values()),'writes':0,'requests':0}
    if all(e['stage']=='complete' for e in plan['scenarios'].values()):
        from check_demo import check_plan
        report=check_plan(db,plan)
        if report['problems']:raise ValueError('Completed demo drifted; explicit repair required: '+str(report['problems'][:3]))
        return {'complete':True,'writes':0,'requests':0}
    archive_inventory(db,plan['inventory'],plan['run_id'],True)
    requests=0
    for key,entry in plan['scenarios'].items():
        if entry['stage']=='complete':continue
        if entry['stage']=='checking':raise ValueError('Interrupted Check needs explicit review before spending another request')
        if entry['stage']=='planned':
            if plan['usage']['checks']>=15:raise ValueError('D1 Check ceiling reached')
            entry['stage']='checking';plan['usage']['checks']+=1;save(plan)
            checked=request(target_info,'checkIssue',entry['input']);requests+=1
            if not checked.get('draftId'):raise ValueError('Check returned no durable draft')
            # Params/location are the server's answer, never a hand-entered score/weight.
            entry.update(draft_id=checked['draftId'],check_result=checked,stage='checked')
            entry['create_input']={**entry['input'],'location':checked['location']}
            log_id=(checked.get('ai') or {}).get('log_id')
            if log_id:
                log=db.collection('analyzer_logs').document(log_id).get()
                if log.exists:entry['analyzer_usage']=log.to_dict().get('usage')
            entry['embedding_estimated_tokens']=(len(entry['input']['title'])+len(entry['input']['description'])+3)//4
            save(plan)
        if not plan.get('test_fixture') and (entry.get('check_result',{}).get('ai') or {}).get('source')!='model':raise ValueError('Real seed requires a model result; inspect the saved fallback instead of creating')
        if not plan.get('test_fixture') and key=='D1-02' and entry.get('check_result',{}).get('location_source')!='named_place':raise ValueError('Pothole must resolve the approved named place before creation')
        if not plan.get('test_fixture') and key=='D1-05' and entry['check_result'].get('location_source')!='work':raise ValueError('Shift scenario must resolve the creator workplace')
        if not plan.get('test_fixture') and key in ('D1-01','D1-05') and any(abs(a-b)>1e-7 for a,b in zip(entry['check_result']['location'],entry['creator']['location'])):raise ValueError('Resolved point differs from the approved home/work creator anchor')
        if entry.get('check_result',{}).get('title_conflicts'):raise ValueError('Active title conflict: inspect the saved Check; do not create')
        if not entry.get('issue_id'):
            body={**entry['create_input'],'draftId':entry['draft_id']}
            matches=entry['check_result'].get('similar_issues') or []
            if matches:body['duplicate_review']={'reason':f"Approved distinct D1 scenario {key}: {entry['content']['purpose']}",
                'matches':[{'issue_id':m['issue_id'],'version':m['version']} for m in matches]}
            result=request(target_info,'createIssue',body)
            entry.update(issue_id=result['issue_id'],microcommunity_id=result['microcommunity_id'],stage='created');save(plan)
        phase_writer(target_info,plan,key,entry,live)
        issue=db.collection('issues').document(entry['issue_id']).get().to_dict()
        entry.update(stage='complete',created_at=issue['created_at'].isoformat() if hasattr(issue['created_at'],'isoformat') else issue['created_at'],
            demo_plan_hash=issue['demo_plan_hash'],ends=issue['ends'])
        save(plan)
    from check_demo import check_plan
    report=check_plan(db,plan)
    if report['problems']:raise ValueError('Post-seed check failed: '+str(report['problems'][:3]))
    return {'complete':True,'check_pairs':requests,'validation':report}

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project',required=True);parser.add_argument('--i-know-this-is-live',action='store_true',dest='live')
    parser.add_argument('--functions-url');parser.add_argument('--apply',action='store_true')
    parser.add_argument('--inventory-only',action='store_true');parser.add_argument('--make-plan',action='store_true')
    parser.add_argument('--run-id');parser.add_argument('--content',default=str(ROOT/'specs/demo/content.json'))
    parser.add_argument('--manifest',default=str(ROOT/'specs/demo/manifest.json'));parser.add_argument('--report')
    args=parser.parse_args(argv)
    t=target(args.project,args.live,args.functions_url)
    from google.cloud import firestore
    db=firestore.Client(project=args.project)
    if args.inventory_only:
        if args.apply or args.make_plan:parser.error('--inventory-only cannot apply or make a seed plan')
        report=inventory(db)
        if args.report:save_json(args.report,report)
        print(json.dumps({'issues':len(report['topics']['issues']),'discussions':len(report['topics']['discussions']),
            'publics':len(report['publics']),'members':report['member_count'],'messages':sum(m['count'] for m in report['messages'].values()),
            'issue_vectors':report['vectors'],'orphans':{k:len(v) for k,v in report['orphans'].items()}}))
        return 0
    path=Path(args.manifest)
    with exclusive(path):
        if args.make_plan:
            if path.exists():parser.error('Manifest exists; resume it instead of overwriting')
            if not args.run_id:parser.error('--make-plan requires --run-id')
            save_json(path,make_plan(db,load_json(args.content),args.run_id,args.project))
        plan=load_json(path)
        if digest(load_json(args.content))!=plan['content_sha256']:raise ValueError('Stored content changed after planning')
        report=run_seed(db,plan,t,lambda value:save_json(path,value),args.apply,live=args.live)
        if args.report:save_json(args.report,report)
        print(json.dumps(report))
        return 0

if __name__=='__main__':
    try:sys.exit(main())
    except (ValueError,OSError) as error:
        print(f'D1 stopped: {type(error).__name__}. No automatic reset/retry; the saved manifest is retained.',file=sys.stderr)
        sys.exit(1)
