"""Plan/verify R1 metadata recovery; live apply/rollback are author-only steps."""
import argparse
from pathlib import Path
import json
import sys
import grounding_metadata_plan as G
import inventory_values_grounding as I
import optional_metadata_plan as R

ROOT=Path(__file__).resolve().parents[1]
SCOPE=ROOT/'specs/tasks/Values-optional-metadata-scope.json'
GROUNDING_SCOPE=ROOT/'specs/tasks/Values-grounding-restoration-scope.json'

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('mode',choices=['plan','verify','apply','rollback']);p.add_argument('--project',required=True)
    p.add_argument('--i-know-this-is-live',action='store_true',dest='live');p.add_argument('--apply',action='store_true',dest='writing')
    p.add_argument('--test-scope');p.add_argument('--test-grounding-scope');p.add_argument('--grounding-plan');p.add_argument('--artifact',action='append',default=[])
    p.add_argument('--plan',required=True);p.add_argument('--journal');a=p.parse_args(argv)
    try:
        mode=I.check_target(a.project,a.live)
        G.require(not(a.test_scope or a.test_grounding_scope) or mode=='emulator','test_scope_forbidden_on_live')
        G.require((a.mode in ('apply','rollback'))==a.writing,'explicit_write_mode_required')
        scope=G.strict_json(Path(a.test_scope or SCOPE).read_bytes());R.validate_scope(scope)
        G.require(scope['project']==a.project,'scope_target_mismatch')
        sources=G.load_sources(a.artifact,scope) if a.mode!='rollback' else None
        if a.mode=='plan':
            G.require(a.grounding_plan and not Path(a.plan).exists(),'new_plan_and_grounding_plan_required')
            grounding_bytes=Path(a.grounding_plan).read_bytes();old_scope=G.strict_json(Path(a.test_grounding_scope or GROUNDING_SCOPE).read_bytes())
        else:
            plan=G.strict_json(Path(a.plan).read_bytes());R.validate_plan(plan,scope,sources)
        from google.cloud import firestore
        db=firestore.Client(project=a.project)
        try:
            raw=R.FirestoreStore(db)
            if a.mode=='plan':
                result=R.build_plan(grounding_bytes,old_scope,scope,sources,raw);I.save_report(result,a.plan)
                print(json.dumps({k:result[k] for k in ('ready','proposed','expected','conflicts','plan_sha256')}));return 0 if result['ready'] else 1
            store=R.EngineStore(raw,plan)
            if a.mode=='verify':result=G.verify(store,plan)
            else:
                G.require(a.journal,'journal_required')
                with G.journal_lock(a.journal):
                    journal=G.Journal(a.journal,plan)
                    progress=lambda n:print(json.dumps({'processed':n,'mode':a.mode}),flush=True) if n%20==0 else None
                    result=(G.run_apply if a.mode=='apply' else G.run_rollback)(store,plan,journal,progress)
            print(json.dumps(result));return 0 if result['complete'] else 1
        finally:db.close()
    except Exception as error:
        print(json.dumps({'stopped':True,'reason':str(error) if isinstance(error,G.GuardError) else type(error).__name__}),file=sys.stderr);return 1

if __name__=='__main__':sys.exit(main())
