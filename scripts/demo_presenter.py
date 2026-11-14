"""D1: record a normally-created flagship or explicitly activate its standby.

Recording only reads Firestore and updates the local manifest. Standby activation
is dry-run by default; --apply is the author's step on live.
"""
from __future__ import annotations
import argparse
import copy
import json
import os
import subprocess
from demo_common import ROOT,load_json,save_json,target,exclusive

def record_flagship(db,plan,ident):
    standby=plan['scenarios']['D1-01']
    if ident=='auto':
        candidates=[s.id for s in db.collection('issues').where('title','==',standby['input']['title']).stream() if s.id!=standby['issue_id'] and s.to_dict().get('status') in ('open','discussion','in_process') and str(s.to_dict().get('submitter_id'))==standby['creator']['uid']]
        if len(candidates)!=1:raise ValueError('Cannot uniquely identify the normal flagship; inspect the records')
        ident=candidates[0]
    if ident==standby['issue_id']:raise ValueError('Use explicit standby activation for the fallback')
    old=plan['scenarios'].get('D1-01-live')
    if old and old['issue_id']!=ident:raise ValueError('A different flagship is already recorded')
    if db.collection('issues').document(standby['issue_id']).get().to_dict().get('status')!='archived':raise ValueError('Standby is already active; do not add a second flagship')
    issue=db.collection('issues').document(ident).get();disc=db.collection('discussions').document(ident).get()
    if not issue.exists or not disc.exists:raise ValueError('Flagship pair missing')
    data=issue.to_dict()
    if data.get('title')!=standby['input']['title'] or data.get('description')!=standby['input']['description'] or str(data.get('submitter_id'))!=standby['creator']['uid']:raise ValueError('Flagship differs from approved stored registration input')
    publics=list(db.collection('microcommunities').where('issue_id','==',ident).stream())
    if len(publics)!=1:raise ValueError('Cannot resolve flagship public')
    entry=copy.deepcopy(standby);entry.update(phase='live',issue_id=ident,microcommunity_id=publics[0].id,stage='complete',
        created_at=data['created_at'].isoformat() if hasattr(data['created_at'],'isoformat') else data['created_at'],demo_plan_hash=None,ai=data.get('ai'),location_source=data.get('location_source'))
    entry.pop('draft_id',None);entry.pop('check_result',None)
    plan['scenarios']['D1-01-live']=entry;plan['presentation_started']=True

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--project',required=True)
    parser.add_argument('--i-know-this-is-live',action='store_true',dest='live');parser.add_argument('--manifest',default=str(ROOT/'specs/demo/manifest.json'))
    mode=parser.add_mutually_exclusive_group(required=True);mode.add_argument('--record-flagship');mode.add_argument('--activate-standby',action='store_true')
    parser.add_argument('--apply',action='store_true');args=parser.parse_args(argv);t=target(args.project,args.live)
    with exclusive(args.manifest):
        plan=load_json(args.manifest)
        if plan['project']!=args.project or any(e['stage']!='complete' for e in plan['scenarios'].values()):raise ValueError('Complete manifest for this project required')
        from google.cloud import firestore
        db=firestore.Client(project=args.project)
        if args.record_flagship:
            record_flagship(db,plan,args.record_flagship);save_json(args.manifest,plan);print('Flagship recorded; zero database writes.');return 0
        if 'D1-01-live' in plan['scenarios']:raise ValueError('Normal flagship recorded; open it instead')
        entry=plan['scenarios']['D1-01']
        if not args.apply:print(json.dumps({'action':'activate standby','issue_id':entry['issue_id'],'writes':0,'requests':0}));return 0
        request={'project':args.project,'operation':'activate-standby','issueId':entry['issue_id'],'runId':plan['run_id']}
        command=['node',str(ROOT/'functions/tools/demo-phase.cjs')]
        if args.live:command.append('--i-know-this-is-live')
        result=subprocess.run(command,input=json.dumps(request),text=True,capture_output=True,env=os.environ.copy())
        if result.returncode:raise ValueError('Standby not promoted; inspect the canonical matching check and recover any existing flagship')
        entry['phase']='chat';plan['presentation_started']=True;save_json(args.manifest,plan)
        print(result.stdout.strip());return 0

if __name__=='__main__':raise SystemExit(main())
