"""Grounding metadata planner and guarded, author-run apply/rollback.

Agent use on live is read-only plan/verify. Write modes are the author's steps;
current rehearsal uses disposable demo emulator data only.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import grounding_metadata_plan as G
import inventory_values_grounding as I

SCOPE=Path(__file__).resolve().parents[1]/'specs/tasks/Values-grounding-restoration-scope.json'


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['plan','verify','apply','rollback'])
    parser.add_argument('--project',required=True)
    parser.add_argument('--i-know-this-is-live',action='store_true',dest='live')
    parser.add_argument('--apply',action='store_true',dest='writing')
    parser.add_argument('--test-scope')
    parser.add_argument('--inventory')
    parser.add_argument('--artifact',action='append',default=[])
    parser.add_argument('--plan',required=True)
    parser.add_argument('--journal')
    args=parser.parse_args(argv)
    try:
        target=I.check_target(args.project,args.live)
        G.require(not args.test_scope or target=='emulator','test_scope_forbidden_on_live')
        G.require((args.mode in ('apply','rollback'))==args.writing,'explicit_write_mode_required')
        scope=G.strict_json(Path(args.test_scope or SCOPE).read_bytes())
        G.require(scope.get('version')=='grounding-restoration-scope-1' and scope['project']==args.project,'scope_target_mismatch')
        G.require(type(scope.get('expected_candidates')) is int and 1<=scope['expected_candidates']<=500,'invalid_scope_count')
        sources=G.load_sources(args.artifact,scope) if args.mode!='rollback' else None
        if args.mode=='plan':
            G.require(args.inventory and not Path(args.plan).exists(),'new_plan_and_inventory_required')
            inventory=Path(args.inventory).read_bytes()
            G.require(hashlib.sha256(inventory).hexdigest()==scope['inventory_sha256'],'inventory_changed')
        else:
            plan=G.strict_json(Path(args.plan).read_bytes());G.validate_plan(plan,scope,sources)
        from google.cloud import firestore
        client=firestore.Client(project=args.project)
        try:
            store=G.FirestoreStore(client)
            if args.mode=='plan':
                result=G.build_plan(inventory,scope,sources,store);I.save_report(result,args.plan)
                printed={k:result[k] for k in ('ready','proposed','expected','conflicts','plan_sha256')}
                print(json.dumps(printed));return 0 if result['ready'] else 1
            if args.mode=='verify':result=G.verify(store,plan)
            else:
                G.require(args.journal,'journal_required')
                with G.journal_lock(args.journal):
                    journal=G.Journal(args.journal,plan)
                    progress=lambda count:print(json.dumps({'processed':count,'mode':args.mode}),flush=True) if count%20==0 else None
                    result=(G.run_apply if args.mode=='apply' else G.run_rollback)(store,plan,journal,progress)
            print(json.dumps(result));return 0 if result['complete'] else 1
        finally:client.close()
    except Exception as error:
        code=str(error) if isinstance(error,G.GuardError) else type(error).__name__
        print(json.dumps({'stopped':True,'reason':code}),file=sys.stderr);return 1


if __name__=='__main__':sys.exit(main())
