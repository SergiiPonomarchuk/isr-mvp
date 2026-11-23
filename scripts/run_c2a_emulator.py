"""One bounded C2a guarded emulator child; no provider, credentials or production access."""
import argparse,hashlib,json,os,subprocess,time
from pathlib import Path
from audit_capacity_phase_a import free_memory,child_memory,RSS_LIMIT
ROOT=Path(__file__).resolve().parents[1]
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args();out=args.out.resolve()
    if not out.is_relative_to(ROOT/'specs/tasks/M3-c2a-evidence'):raise ValueError('Output must be a new C2a report directory')
    files=list((ROOT/'functions/experiments/publication').glob('*.js'))+list((ROOT/'functions/experiments/c2a').glob('*.js'))+[ROOT/'firestore.rules',ROOT/'functions/test/c2a-publication.test.js',ROOT/'functions/test/c2a-emulator.test.js']+[Path(__file__).resolve(),ROOT/'scripts/audit_capacity_phase_a.py',ROOT/'functions/tools/capacity/no-network.js',ROOT/'functions/test/generation-protocol.test.js',ROOT/'tests/test_generation_protocol_runner.py']
    pins={str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    # Target refusal happens before process or report creation.
    if os.environ.get('C2A_EMULATOR_TESTS')!='1' or os.environ.get('GCLOUD_PROJECT')!='demo-c2a-publication' or os.environ.get('FIRESTORE_EMULATOR_HOST')!='127.0.0.1:8190':raise ValueError('C2a emulator target refused')
    available=free_memory();out.parent.mkdir(parents=True,exist_ok=True);out.mkdir(exist_ok=False)
    record={'guards':{'heap_mib':256,'rss_mib':512,'timeout_seconds':120,'minimum_free_mib':1024},'initial_free_bytes':available,'source_pins':pins,'scope':'tiny C2a emulator prototype only'}
    if available<1024**3:record['status']='memory_prerequisite_refused'
    else:
        env=os.environ.copy();env.pop('GEMINI_API_KEY',None);start=time.monotonic();peak=0;reason=None
        with (out/'stdout.txt').open('w') as stdout,(out/'stderr.txt').open('w') as stderr:
            process=subprocess.Popen(['node','--max-old-space-size=256',str(ROOT/'functions/experiments/c2a/rehearsal.js'),str(out)],stdout=stdout,stderr=stderr,env=env,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
            try:
                while process.poll() is None:
                    try:peak=max(peak,child_memory(process.pid))
                    except (OSError,RuntimeError):
                        if process.poll() is None:reason='resource_monitor_refused';break
                    if peak>RSS_LIMIT:reason='rss_limit_refused';break
                    if time.monotonic()-start>120:reason='timeout_refused';break
                    time.sleep(.05)
                if reason:
                    process.terminate()
                    try:process.wait(timeout=2)
                    except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)
            finally:
                if process.poll() is None:process.kill();process.wait(timeout=5)
        changed=[f for f,h in pins.items() if hashlib.sha256((ROOT/f).read_bytes()).hexdigest()!=h]
        record.update(status=reason or ('source_changed_refused' if changed else 'completed' if process.returncode==0 else 'child_failed'),parent_peak_rss_bytes=peak,elapsed_seconds=time.monotonic()-start,exit_code=process.returncode)
        if record['status']=='completed':record['worker']=json.loads((out/'worker.json').read_text())
    (out/'report.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'status':record['status'],'report':str(out/'report.json')}))
    if record['status']!='completed':raise SystemExit(1)
if __name__=='__main__':main()
