"""Supervise the approved24 synthetic C3a cases, offline and within fixed shared deadlines."""
import argparse,hashlib,json,os,shutil,subprocess,sys,time
from pathlib import Path
from audit_capacity_phase_a import free_memory,child_memory,RSS_LIMIT
ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/'specs/tasks/M3-c3a-evidence'
RUN_BYTES=1024**3
FILE_BYTES=256*1024**2

def size(directory):return sum(p.stat().st_size for p in directory.rglob('*') if p.is_file())
def preflight():
 return {'ram':free_memory(),'a_disk':shutil.disk_usage(ROOT).free,'c_disk':shutil.disk_usage(Path('C:/') if os.name=='nt' else ROOT).free}
def prerequisites(p):
 return p['ram']>=1024**3 and p['a_disk']>=4*1024**3 and p['c_disk']>=1024**3
def safe_env():
 keep={'PATH','SystemRoot','WINDIR','TEMP','TMP','COMSPEC','PATHEXT','USERPROFILE','HOME'}
 env={k:os.environ[k] for k in keep if k in os.environ};env['C3A_OFFLINE']='1'
 if os.name=='nt':env['NODE_PATH']='C:/isr-mvp/functions/node_modules'
 elif os.environ.get('NODE_PATH'):env['NODE_PATH']=os.environ['NODE_PATH']
 return env
def source_pins():
 files=list((ROOT/'functions').glob('*.js'))+list((ROOT/'functions/experiments/c3a').glob('*.js'))+[ROOT/'functions/experiments/publication/artifact.js',ROOT/'functions/tools/capacity/no-network.js',ROOT/'functions/package-lock.json',Path(__file__),ROOT/'scripts/check_c3a_fixture.py',ROOT/'scripts/audit_capacity_phase_a.py',ROOT/'scripts/mr1_check.py',ROOT/'scripts/multi_reference.py',ROOT/'scripts/isr_core.py',ROOT/'scripts/expertise.py',ROOT/'relevance_evaluator.py',ROOT/'specs/tasks/M3-c3a-evidence/matrix.json',ROOT/'functions/test/c3a-offline.test.js',ROOT/'tests/test_c3a_supervisor.py',ROOT/'scripts/demo_common.py']
 return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
def check_pins(pins):
 if any(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()!=h for p,h in pins.items()):raise RuntimeError('source_changed')
def run_child(command,case_dir,run_dir,deadline,pins,mode):
 check_pins(pins);before=preflight()
 if not prerequisites(before):return {'mode':mode,'status':'resource_prerequisite_refused','resources':before}
 process=subprocess.Popen(command,cwd=ROOT,env=safe_env(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0);peak=0;refusal=None;start=time.monotonic();last_disk=0
 try:
  while process.poll() is None:
   try:peak=max(peak,child_memory(process.pid))
   except (OSError,RuntimeError):
    if process.poll() is None:refusal='monitor_refused';break
   if peak>RSS_LIMIT:refusal='rss_limit';break
   if time.time()>=deadline:refusal='whole_fixture_timeout';break
   if time.monotonic()-last_disk>.5:
    if size(run_dir)>RUN_BYTES:refusal='run_file_limit';break
    if size(case_dir)>1024**3:refusal='case_file_limit';break
    last_disk=time.monotonic()
   time.sleep(.1)
  if refusal:process.terminate()
  try:stdout,stderr=process.communicate(timeout=5)
  except subprocess.TimeoutExpired:process.kill();stdout,stderr=process.communicate(timeout=5)
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

def run_fixture(c,run_dir,pins):
 directory=run_dir/c['id'];directory.mkdir();start=time.monotonic();deadline=time.time()+120;stages=[]
 modes=['structural'] if c.get('structural') else ['source','oracle','candidate','independent']
 for mode in modes:
  if time.time()>=deadline:stages.append({'mode':mode,'status':'whole_fixture_timeout'});break
  if mode=='independent':
   if not (directory/'candidate-result.json').exists() or json.loads((directory/'candidate-result.json').read_text(encoding='utf-8'))['status']!='completed':break
   command=[sys.executable,'-W','ignore',str(ROOT/'scripts/check_c3a_fixture.py'),'--case-dir',str(directory)]
  else:command=['node','--max-old-space-size=256',str(ROOT/'functions/experiments/c3a/worker.js'),mode,str(directory),json.dumps(c),str(int(deadline*1000))]
  stage=run_child(command,directory,run_dir,deadline,pins,mode)
  attempts=[]
  while mode=='candidate' and stage.get('worker',{}).get('code')=='injected_crash' and len(attempts)<2 and time.time()<deadline:
   attempts.append(stage);stage=run_child(command,directory,run_dir,deadline,pins,mode)
  if attempts:stage['prior_processes']=attempts
  stages.append(stage)
  if stage['status']!='completed' and mode!='oracle':break
  if stage['status']!='completed' and time.time()>=deadline:break
 complete=len(stages)==len(modes) and all(s['status']=='completed' for s in stages)
 if complete and not c.get('structural'):
  comparison=stages[2]['worker']['result'].get('comparison',{});complete=comparison.get('status')=='exact_node_parity' and stages[-1].get('audit',{}).get('complete') is True
 return {'case':c,'status':'completed' if complete else 'refused_or_unproven','seconds':time.monotonic()-start,'files_bytes':size(directory),'stages':stages}
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args();out=args.out.resolve()
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
