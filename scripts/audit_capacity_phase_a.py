"""Bounded OFFLINE synthetic capacity audit. No credentials, database, or model API."""
import argparse,ctypes,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RSS_LIMIT=512*1024*1024
class Memory(ctypes.Structure):
    _fields_=[('length',ctypes.c_ulong),('load',ctypes.c_ulong),('total',ctypes.c_ulonglong),('free',ctypes.c_ulonglong),('page_total',ctypes.c_ulonglong),('page_free',ctypes.c_ulonglong),('virtual_total',ctypes.c_ulonglong),('virtual_free',ctypes.c_ulonglong),('extended',ctypes.c_ulonglong)]
class ProcessMemory(ctypes.Structure):
    _fields_=[('cb',ctypes.c_ulong),('faults',ctypes.c_ulong),('peak_rss',ctypes.c_size_t),('rss',ctypes.c_size_t),('peak_page',ctypes.c_size_t),('page',ctypes.c_size_t),('peak_np',ctypes.c_size_t),('np',ctypes.c_size_t),('commit',ctypes.c_size_t),('peak_commit',ctypes.c_size_t)]
def free_memory():
    if os.name=='nt':
        m=Memory();m.length=ctypes.sizeof(m)
        if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)):raise RuntimeError('Cannot verify physical memory')
        return m.free
    data=dict(line.split(':',1) for line in Path('/proc/meminfo').read_text().splitlines());return int(data['MemAvailable'].split()[0])*1024

def child_memory(pid):
    if os.name=='nt':
        kernel=ctypes.windll.kernel32;kernel.OpenProcess.restype=ctypes.c_void_p;kernel.CloseHandle.argtypes=[ctypes.c_void_p]
        handle=kernel.OpenProcess(0x410,False,pid)
        if not handle:raise RuntimeError('Cannot inspect audit child')
        try:
            m=ProcessMemory();m.cb=ctypes.sizeof(m)
            fn=ctypes.windll.psapi.GetProcessMemoryInfo;fn.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_ulong]
            if not fn(handle,ctypes.byref(m),m.cb):raise RuntimeError('Cannot read audit RSS')
            return max(m.rss,m.peak_rss)
        finally:kernel.CloseHandle(handle)
    for line in Path(f'/proc/{pid}/status').read_text().splitlines():
        if line.startswith('VmHWM:'):return int(line.split()[1])*1024
    raise RuntimeError('Cannot read audit RSS')

def matrix():
    cases=[dict(id='oracle-small',members=4,refs=3,aspects=3,mixed=False)]
    for n in [100,1000,9150]:
        for refs in [1,3,19,100]:cases.append(dict(id=f'shared-{n}-{refs}',members=n,refs=refs,aspects=min(refs,3),mixed=n!=100))
    for refs in [3,19,100]:cases.append(dict(id=f'distinct-9150-{refs}',members=9150,refs=refs,aspects=min(refs,3),mixed=True,distinct=True))
    cases += [dict(id='one-aspect-9150-100',members=9150,refs=100,aspects=1,mixed=False),dict(id='dense-1000-19',members=1000,refs=19,aspects=3,mixed=True,dense=True),dict(id='metadata-stress-1000-3',members=1000,refs=3,aspects=3,mixed=True,metadataStress=True)]
    return cases

def run_case(config,out,verify,timeout=120):
    verify();available=free_memory()
    if available<1024**3:return {'config':config,'status':'memory_prerequisite_refused','available_bytes':available}
    progress=out/(config['id']+'-progress.json');env=os.environ.copy();env.pop('GEMINI_API_KEY',None);env['NODE_PATH']='C:/isr-mvp/functions/node_modules' if os.name=='nt' else env.get('NODE_PATH','')
    command=['node','--max-old-space-size=256',str(ROOT/'functions/tools/capacity/worker.js'),json.dumps(config),str(progress)]
    process=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,env=env,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0);start=time.monotonic();peak=0;stop=None
    try:
        while process.poll() is None:
            try:peak=max(peak,child_memory(process.pid))
            except (OSError,RuntimeError):
                if process.poll() is None:stop='resource_monitor_refused';break
            if peak>RSS_LIMIT:stop='rss_limit_refused';break
            if time.monotonic()-start>timeout:stop='timeout_refused';break
            time.sleep(.1)
        if stop:
            process.terminate()
            try:process.wait(timeout=2)
            except subprocess.TimeoutExpired:process.kill()
        stdout,stderr=process.communicate(timeout=5)
    finally:
        if process.poll() is None:process.kill();process.wait()
    verify()
    if stop:
        partial=None
        if progress.exists():
            try:partial=json.loads(progress.read_text())
            except (OSError,ValueError):pass
        return {'config':config,'status':stop,'parent_peak_rss':peak,'elapsed_seconds':time.monotonic()-start,'partial':partial}
    try:result=json.loads(stdout.strip())
    except ValueError:result={'config':config,'status':'child_failed','exit_code':process.returncode,'error':stderr[-400:]}
    result.update(parent_peak_rss=peak,elapsed_parent_seconds=time.monotonic()-start,initial_free_bytes=available)
    if process.returncode and result.get('status')=='completed':result['status']='child_exit_refused'
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);parser.add_argument('--smoke',action='store_true');args=parser.parse_args();out=args.out.resolve()
    if not out.is_relative_to(ROOT.resolve()/'specs/tasks/M3-capacity-audit'):raise ValueError('Output must be a new directory inside specs/tasks/M3-capacity-audit')
    files=list((ROOT/'functions/tools/capacity').glob('*.js'))+list((ROOT/'functions').glob('*.js'))+[Path(__file__).resolve()]+[ROOT/f for f in ['functions/mr1-service.js','functions/mr1-engine.js','functions/join-issue.js','functions/multi-reference.js','functions/isr.js','functions/staged-context.js','functions/context-review.js','functions/params.js','functions/analyzer-log.js','functions/public-values.js','functions/package-lock.json','specs/tasks/M3-evaluation/pilot-20261117-one-case-quotation/ledger.json']]
    pins={str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    def verify():
        for f,h in pins.items():
            if hashlib.sha256((ROOT/f).read_bytes()).hexdigest()!=h:raise ValueError('Audit source changed; stop')
    cases=matrix()[:2] if args.smoke else matrix();out.parent.mkdir(parents=True,exist_ok=True);out.mkdir(exist_ok=False)
    report={'version':'capacity-audit-phase-a-1','date_client':'2026-11-18','scope':'synthetic offline structural audit; not actual population or database acceptance','source_pins':pins,'guards':{'heap_mib':256,'rss_mib':512,'seconds_per_fixture':120,'min_free_mib':1024},'fixtures':[],'real_provider_calls':0,'database_rpcs':0,'credential_loader_invocations':0}
    for config in cases:
        result=run_case(config,out,verify);report['fixtures'].append(result);(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'fixture':config['id'],'status':result['status'],'peak_rss_mib':round(result.get('parent_peak_rss',0)/1024**2,1)}),flush=True)
    report['completed_fixtures']=sum(x['status']=='completed' for x in report['fixtures']);report['total_fixtures']=len(cases);(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'completed':report['completed_fixtures'],'fixtures':len(cases),'report':str(out/'report.json')}))
if __name__=='__main__':
    try:main()
    except Exception as error:print('Offline audit refused: '+str(error),file=sys.stderr);sys.exit(1)
