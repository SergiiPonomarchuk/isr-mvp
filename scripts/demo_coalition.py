"""D1 bounded synthetic actor inputs. Default dry run; every live apply is the author's step."""
import argparse,json,os,subprocess,sys
from pathlib import Path
from demo_common import ROOT,target,load_json,save_json,exclusive

def binding_from(manifest,target_info):
    if manifest.get('project')!=target_info['project'] or not manifest.get('presentation_started'):
        raise ValueError('Use the matching presentation-started live execution manifest')
    if manifest.get('test_fixture') and not target_info['emulator']:
        raise ValueError('Mocked manifests are emulator-only')
    entry=manifest.get('scenarios',{}).get('D1-01-live',{})
    if entry.get('stage')!='complete' or entry.get('phase')!='live':
        raise ValueError('Record the normal flagship before planning a coalition')
    return {'project':manifest['project'],'target':('emulator:'+target_info['emulator']) if target_info['emulator'] else 'live:'+manifest['project'],
            'run_id':manifest['run_id'],'issue_id':entry['issue_id'],'public_id':entry['microcommunity_id'],
            'creator':str(entry['creator']['uid']),'title':entry['input']['title'],'description':entry['input']['description'],
            'created_at':entry['created_at'],'expected_options':entry['content']['options']}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--project',required=True);p.add_argument('--i-know-this-is-live',action='store_true',dest='live')
    p.add_argument('--manifest',required=True);p.add_argument('--plan',required=True);p.add_argument('--report')
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument('--make-plan',action='store_true');mode.add_argument('--operation',choices=['start-support','option-votes','finish-support'])
    p.add_argument('--option-index',type=int);p.add_argument('--apply',action='store_true')
    args=p.parse_args(argv);t=target(args.project,args.live)
    if args.make_plan and args.apply:p.error('Plan creation cannot apply')
    if args.operation and args.option_index is not None:p.error('Option index is pinned only when making the plan')
    paths=[Path(args.manifest).resolve(),Path(args.plan).resolve()]
    if args.report:paths.append(Path(args.report).resolve())
    if len(set(paths))!=len(paths):p.error('Manifest, plan and report must be different files')
    with exclusive(args.plan):
        manifest=load_json(args.manifest);binding=binding_from(manifest,t)
        path=Path(args.plan)
        if args.make_plan:
            if path.exists():raise ValueError('Plan exists; inspect/reuse it, never overwrite')
            envelope={'receipts':[]}
        else:
            envelope=load_json(path)
        request={'project':args.project,'binding':binding,'apply':args.apply,'operation':'make-plan' if args.make_plan else args.operation,
                 'option_index':0 if args.option_index is None else args.option_index,'plan':envelope.get('plan')}
        command=['node',str(ROOT/'functions/tools/demo-coalition.cjs')]
        if args.live:command.append('--i-know-this-is-live')
        environment=os.environ.copy();environment.pop('GEMINI_API_KEY',None)
        result=subprocess.run(command,input=json.dumps(request),text=True,capture_output=True,env=environment)
        if result.returncode:
            # The Node adapter emits only fixed guard messages or a generic SDK failure.
            raise ValueError(result.stderr.strip() or 'Coalition operation stopped; inspect saved state')
        data=json.loads(result.stdout)
        if args.make_plan:
            envelope['plan']=data['plan']
            envelope['source_release']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
            save_json(path,envelope)
        elif args.apply:
            envelope['receipts'].append(data['summary']);save_json(path,envelope)
        if args.report:save_json(args.report,data['summary'])
        print(json.dumps(data['summary']));return 0

if __name__=='__main__':
    try:sys.exit(main())
    except ValueError as error:print('Coalition stopped: '+str(error),file=sys.stderr);sys.exit(1)
    except Exception:print('Coalition stopped; inspect plan and existing inputs. No automatic reset or retry.',file=sys.stderr);sys.exit(1)
