"""Supervise the approved24 synthetic C3a cases, offline and within fixed shared deadlines."""
import argparse,hashlib,json,os,shutil,stat,subprocess,sys,time
from pathlib import Path
from audit_capacity_phase_a import free_memory,child_memory,RSS_LIMIT
ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/'specs/tasks/M3-c3a-evidence'
RUN_BYTES=1024**3
FILE_BYTES=256*1024**2

def size(directory):
 total=0
 for p in directory.rglob('*'):
  try:entry=p.stat()
  except FileNotFoundError:
   # Owned checkpoint writers atomically rename these temporary files.
   # Their growth is already pre-reserved by the writer. Other IO failures refuse.
   if p.suffix=='.tmp':continue
   raise
  if stat.S_ISREG(entry.st_mode):total+=entry.st_size
 return total
def preflight():
 return {'ram':free_memory(),'a_disk':shutil.disk_usage(ROOT).free,'c_disk':shutil.disk_usage(Path('C:/') if os.name=='nt' else ROOT).free}
def prerequisites(p):
 return p['ram']>=1024**3 and p['a_disk']>=4*1024**3 and p['c_disk']>=1024**3
def safe_env(e1=False,hook=None):
 keep={'PATH','SystemRoot','WINDIR','TEMP','TMP','COMSPEC','PATHEXT','USERPROFILE','HOME'}
 env={k:os.environ[k] for k in keep if k in os.environ};env['C3A_OFFLINE']='1'
 if e1:env['C3A_E1']='1'
 if hook:env['C3A_E1_HOOK']=hook
 if os.name=='nt':env['NODE_PATH']='C:/isr-mvp/functions/node_modules'
 elif os.environ.get('NODE_PATH'):env['NODE_PATH']=os.environ['NODE_PATH']
 return env
def source_pins():
 files=list((ROOT/'functions').glob('*.js'))+list((ROOT/'functions/experiments/c3a').glob('*.js'))+[ROOT/'functions/experiments/publication/artifact.js',ROOT/'functions/tools/capacity/no-network.js',ROOT/'functions/package-lock.json',Path(__file__),ROOT/'scripts/check_c3a_fixture.py',ROOT/'scripts/audit_capacity_phase_a.py',ROOT/'scripts/mr1_check.py',ROOT/'scripts/multi_reference.py',ROOT/'scripts/isr_core.py',ROOT/'scripts/expertise.py',ROOT/'relevance_evaluator.py',ROOT/'specs/tasks/M3-c3a-evidence/matrix.json',ROOT/'functions/test/c3a-offline.test.js',ROOT/'tests/test_c3a_supervisor.py',ROOT/'scripts/demo_common.py']
 for extra in [ROOT/'functions/test/c3a-e1.test.js',ROOT/'specs/tasks/M3-c3a-e1-evidence/admission.json',ROOT/'specs/tasks/M3-c3a-e1-evidence/continuation-01.json']:
  if extra.exists():files.append(extra)
 return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
def check_pins(pins):
 if any(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()!=h for p,h in pins.items()):raise RuntimeError('source_changed')
def run_child(command,case_dir,run_dir,deadline,pins,mode,*,e1=False,hook=None,monotonic_end=None):
 check_pins(pins);before=preflight()
 if not prerequisites(before):return {'mode':mode,'status':'resource_prerequisite_refused','resources':before}
 process=subprocess.Popen(command,cwd=ROOT,env=safe_env(e1,hook),stdout=subprocess.PIPE,stderr=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0);peak=0;refusal=None;start=time.monotonic();last_disk=0
 try:
  while process.poll() is None:
   try:peak=max(peak,child_memory(process.pid))
   except (OSError,RuntimeError):
    if process.poll() is None:refusal='monitor_refused';break
   if peak>RSS_LIMIT:refusal='rss_limit';break
   if time.time()>=deadline or monotonic_end is not None and time.monotonic()>=monotonic_end:refusal='whole_fixture_timeout';break
   if time.monotonic()-last_disk>.5:
    if size(run_dir)>RUN_BYTES:refusal='run_file_limit';break
    if size(case_dir)>1024**3:refusal='case_file_limit';break
    if hook and sum(size(p) for p in run_dir.glob('e1-*') if p.is_dir())>24*1024**2:refusal='regression_file_limit';break
    last_disk=time.monotonic()
   time.sleep(.1)
  if refusal:process.terminate()
  try:stdout,stderr=process.communicate(timeout=5)
  except subprocess.TimeoutExpired:process.kill();stdout,stderr=process.communicate(timeout=5)
 except OSError:
  refusal='monitor_io_error'
  if process.poll() is None:process.kill()
  stdout,stderr=process.communicate(timeout=5)
 finally:
  if process.poll() is None:process.kill();process.wait()
 check_pins(pins)
 result={'mode':mode,'status':refusal or 'completed','exit_code':process.returncode,'peak_rss_bytes':peak,'seconds':time.monotonic()-start,'resources':before}
 if not refusal:
  if mode=='independent':
   try:result['audit']=json.loads(stdout)
   except ValueError:result['status']='audit_process_refused'
   if process.returncode:result['status']='audit_refused'
  else:
   file=case_dir/(mode+'-result.json')
   if file.exists():result['worker']=json.loads(file.read_text(encoding='utf-8'));result['status']=result['worker']['status']
   else:result['status']='child_refused'
 return result

def reserve_independent(directory,n):
 # Conservative bound: source hashing <=n+1; evaluator <=2n; social <=n;
 # membership <=3n; Create/Join normalization/provenance <=6n+3;
 # Values <=4n+2; fixed checkpoint reads. 32n+512 leaves explicit slack.
 if type(n)!=int or not 1<=n<=9150:raise RuntimeError('audit_population')
 file=directory/'budget.json';state=json.loads(file.read_text(encoding='utf-8'))
 limit=state['limits']['work'];used=state['work'];reserve=32*n+512
 if type(limit)!=int or not 0<limit<=1000000 or type(used)!=int or not 0<=used<=limit or used+reserve>limit:raise RuntimeError('audit_work_limit')
 state['work']+=reserve;state['independent_reserved']=state.get('independent_reserved',0)+reserve
 encoded=json.dumps(state);cost=len(encoded.encode('utf-8'))
 if state['bytes']['scratch']+cost>state['limits']['scratch']:raise RuntimeError('audit_scratch_limit')
 state['bytes']['scratch']+=cost
 # This fixed-size metadata update uses the run's pre-reserved4MiB headroom.
 file.write_text(json.dumps(state),encoding='utf-8')
 return reserve

def run_fixture(c,run_dir,pins,*,e1=False,hook=None,case_id=None,seed_budget=None):
 directory=run_dir/(case_id or c['id']);directory.mkdir();start=time.monotonic();deadline=time.time()+120;stages=[]
 def invoke(command,mode):
  if e1:return run_child(command,directory,run_dir,deadline,pins,mode,e1=True,hook=hook,monotonic_end=start+120)
  return run_child(command,directory,run_dir,deadline,pins,mode)
 if seed_budget is not None:
  if not e1 or hook!='data-before-index':raise ValueError('continuation_seed')
  state=json.loads(json.dumps(seed_budget))
  if state.get('version')!='c3a-budget-2' or state.get('io')!='c3a-io-2':raise ValueError('continuation_version')
  # Explicitly proposed fresh deadline; all prior work/bytes/attempts remain charged.
  state['deadline']=int(deadline*1000);state['work']+=1
  state['bytes']['scratch']+=len(json.dumps(state).encode())+64
  if state['work']>state['limits']['work'] or state['bytes']['scratch']>state['limits']['scratch']:raise ValueError('continuation_budget')
  (directory/'budget.json').write_text(json.dumps(state),encoding='utf-8')
 modes=['structural'] if c.get('structural') else ['source','oracle','candidate','independent']
 for mode in modes:
  if time.time()>=deadline:stages.append({'mode':mode,'status':'whole_fixture_timeout'});break
  if mode=='independent':
   if not (directory/'candidate-result.json').exists() or json.loads((directory/'candidate-result.json').read_text(encoding='utf-8'))['status']!='completed':break
   try:reservation=reserve_independent(directory,c['n'])
   except (RuntimeError,ValueError,KeyError,OSError,TypeError):
    stages.append({'mode':mode,'status':'audit_budget_refused'});break
   command=[sys.executable,'-W','ignore',str(ROOT/'scripts/check_c3a_fixture.py'),'--case-dir',str(directory),'--read-budget',str(reservation)]
  else:command=['node','--max-old-space-size=256',str(ROOT/'functions/experiments/c3a/worker.js'),mode,str(directory),json.dumps(c),str(int(deadline*1000))]
  stage=invoke(command,mode)
  attempts=[]
  while mode=='candidate' and (stage.get('worker',{}).get('code')=='injected_crash' or hook and stage.get('exit_code')==86) and len(attempts)<2 and time.time()<deadline:
   attempts.append(stage);stage=invoke(command,mode)
  if attempts:stage['prior_processes']=attempts
  stages.append(stage)
  if stage['status']!='completed' and mode!='oracle':break
  if stage['status']!='completed' and time.time()>=deadline:break
 complete=len(stages)==len(modes) and all(s['status']=='completed' for s in stages)
 if complete and not c.get('structural'):
  comparison=stages[2]['worker']['result'].get('comparison',{});complete=comparison.get('status')=='exact_node_parity' and stages[-1].get('audit',{}).get('complete') is True
 fault_verified=None
 if hook:
  marker=directory/'e1-fault-injected.json'
  fault_verified=marker.exists() and json.loads(marker.read_text(encoding='utf-8')).get('stage')==hook and any(p.get('exit_code')==86 for s in stages for p in s.get('prior_processes',[]))
  complete=complete and fault_verified
 return {'case':c,'id':case_id or c['id'],'fault_hook':hook,'fault_verified':fault_verified,'status':'completed' if complete else 'refused_or_unproven','seconds':time.monotonic()-start,'files_bytes':size(directory),'stages':stages}
def claim_continuation(parent,out,proposal):
 directory=(ROOT/parent['artifacts']).resolve();allowed=(ROOT/'scratch/c3a-runs').resolve()
 if not directory.is_relative_to(allowed):raise ValueError('continuation_artifacts')
 claim=directory/'continuation-01.claim.json'
 # Exclusive one-time admission; no second invocation can reuse the old quotas.
 with claim.open('x',encoding='utf-8') as f:json.dump({'version':'c3a-e1-claim-1','output':str(out),'parent_report_sha256':proposal['parent_report_sha256']},f)
 return claim

def e1_main(out,continuation_path=None):
 evidence=ROOT/'specs/tasks/M3-c3a-e1-evidence'
 if out.parent!=evidence.resolve() or not out.name.startswith('run-'):raise ValueError('output_path')
 admission=json.loads((evidence/'admission.json').read_text(encoding='utf-8'));cases=admission['cases'];regressions=admission['regressions']
 old=json.loads((EVIDENCE/'matrix.json').read_text(encoding='utf-8'))
 if len(cases)!=12 or len(regressions)!=4 or not all(c in old for c in cases):raise ValueError('admission')
 continuation=None;parent=None
 if continuation_path:
  path=continuation_path.resolve()
  if path!=evidence/'continuation-01.json':raise ValueError('continuation_path')
  continuation=json.loads(path.read_text(encoding='utf-8'));parent_file=(ROOT/continuation['parent_report']).resolve()
  if not parent_file.is_relative_to(evidence.resolve()) or hashlib.sha256(parent_file.read_bytes()).hexdigest()!=continuation['parent_report_sha256']:raise ValueError('continuation_binding')
  parent=json.loads(parent_file.read_text(encoding='utf-8'))
  if continuation['version']!='c3a-e1-continuation-1' or parent['status']!='stopped_on_monitor_error' or continuation['cases']!=[c['id'] for c in cases] or continuation['regression_ids']!=[x['id'] for x in regressions[1:]]:raise ValueError('continuation_scope')
  if len(parent['regressions'])!=1 or parent['regressions'][0]['status']!='completed' or parent['regressions'][0]['fault_verified'] is not True:raise ValueError('continuation_prior_pass')
  core={p:h for p,h in parent['source_pins'].items() if p not in ('scripts/run_c3a_offline.py','tests/test_c3a_supervisor.py')}
  check_pins(core)
  if continuation['carry_run_reserved']!=parent['run_quota']['reserved'] or continuation['carry_regression_reserved']!=parent['regression_quota']['reserved']:raise ValueError('continuation_quota')
  regressions=regressions[1:]
  if out.exists():raise ValueError('continuation_output_exists')
  claim_continuation(parent,out,continuation)
 out.mkdir(exist_ok=False);run_dir=ROOT/'scratch/c3a-runs'/out.name;run_dir.mkdir(parents=True,exist_ok=False)
 # Reserve the bounded40MiB unit pool before any admitted worker. Four actual
 # interruption directories additionally share24MiB: combined64MiB.
 (run_dir/'run-quota.json').write_text(json.dumps({'version':'c3a-quota-1','limit':RUN_BYTES-4*1024**2,'reserved':continuation['carry_run_reserved'] if continuation else 40*1024**2}),encoding='utf-8')
 (run_dir/'regression-quota.json').write_text(json.dumps({'version':'c3a-regression-quota-1','limit':24*1024**2,'reserved':continuation['carry_regression_reserved'] if continuation else 0}),encoding='utf-8')
 pins=source_pins();report={'version':'c3a-e1-report-1','io':'c3a-io-2','scope':'synthetic compatibility only; C3b NO-GO','admission':admission,'source_pins':pins,'provider_calls':0,'database_rpcs':0,'credential_loader_invocations':0,'regressions':[],'fixtures':[],'artifacts':run_dir.relative_to(ROOT).as_posix(),'unit_pool_reserved_bytes':40*1024**2,'regression_pool_bytes':24*1024**2,'continuation':continuation}
 def save(): (out/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 save()
 for item in regressions:
  c=next(x for x in old if x['id']==item['fixture'])
  seed=parent['interrupted'][0]['counters'] if continuation and item['id']==continuation['fresh_deadline_for_interrupted'] else None
  row=run_fixture(c,run_dir,pins,e1=True,hook=item['hook'],case_id=item['id'],seed_budget=seed);report['regressions'].append(row);save()
  print(json.dumps({'regression':item['id'],'status':row['status'],'seconds':round(row['seconds'],3)}),flush=True)
  if row['status']!='completed':
   report['status']='stopped_on_recovery_failure';report['matrix_executed']=0;save();return 2
 stopped=False
 for c in cases:
  if stopped:report['fixtures'].append({'case':c,'status':'not_run_file_limit'});continue
  row=run_fixture(c,run_dir,pins,e1=True);report['fixtures'].append(row)
  stopped=any(s.get('worker',{}).get('code') in ('run_file_limit','regression_file_limit') or s.get('status')=='run_file_limit' for s in row['stages'])
  save();print(json.dumps({'case':c['id'],'status':row['status'],'seconds':round(row['seconds'],3)}),flush=True)
 report['matrix_executed']=sum('stages' in r for r in report['fixtures']);report['matrix_passed']=sum(r['status']=='completed' for r in report['fixtures']);report['status']='completed' if report['matrix_executed']==12 else 'stopped'
 report['retained_files_bytes']=size(run_dir);report['run_quota']=json.loads((run_dir/'run-quota.json').read_text(encoding='utf-8'));save()
 print(json.dumps({'status':report['status'],'matrix_passed':report['matrix_passed'],'matrix_admitted':12,'regressions_passed':len(regressions),'prior_regressions_passed':1 if continuation else 0}),flush=True)
 return 0

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);parser.add_argument('--e1',action='store_true');parser.add_argument('--continuation',type=Path);args=parser.parse_args();out=args.out.resolve()
 if args.e1:return e1_main(out,args.continuation)
 if args.continuation:raise ValueError('continuation_requires_e1')
 if out.parent!=EVIDENCE.resolve() or not out.name.startswith('run-'):raise ValueError('output_path')
 cases=json.loads((EVIDENCE/'matrix.json').read_text(encoding='utf-8'));assert len(cases)==24 and len({c['id'] for c in cases})==24
 out.mkdir(exist_ok=False);run_dir=ROOT/'scratch/c3a-runs'/out.name;run_dir.mkdir(parents=True,exist_ok=False);(run_dir/'run-quota.json').write_text(json.dumps({'version':'c3a-quota-1','limit':RUN_BYTES-4*1024**2,'reserved':0}),encoding='utf-8');pins=source_pins();report={'version':'c3a-offline-1','scope':'synthetic current-oracle compatibility; not intended-policy/population/server acceptance','matrix':cases,'source_pins':pins,'limits':{'cases':24,'seconds_per_whole_fixture':120,'heap_mib':256,'rss_mib':512,'source_mib':256,'artifact_mib':256,'scratch_mib':512,'run_mib':1024,'decoded_mib':4,'quantum_profiles':75,'emitted_records':200000,'work_units':1000000,'attempts':3},'provider_calls':0,'database_rpcs':0,'credential_loader_invocations':0,'fixtures':[],'artifacts':'scratch/c3a-runs/'+out.name}
 stopped=False
 for c in cases:
  if stopped or size(run_dir)>=RUN_BYTES:
   report['fixtures'].append({'case':c,'status':'not_run_file_limit'});stopped=True;continue
  row=run_fixture(c,run_dir,pins);report['fixtures'].append(row);stopped=any(stage.get('worker',{}).get('code')=='run_file_limit' or stage.get('status')=='run_file_limit' for stage in row['stages']);(out/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'case':c['id'],'status':row['status'],'seconds':round(row['seconds'],3)}),flush=True)
 report['completed']=sum(x['status']=='completed' for x in report['fixtures']);report['admitted']=24;report['executed']=sum('stages' in x for x in report['fixtures']);report['retained_files_bytes']=size(run_dir);report['status']='completed' if report['executed']==24 else 'stopped';(out/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'status':report['status'],'completed':report['completed'],'admitted':24}),flush=True)
 return 0
if __name__=='__main__':raise SystemExit(main())
