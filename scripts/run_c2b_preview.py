"""Finite C2b local preview; no key loader, import, production mode or dependency install."""
import json,os,subprocess,time
from pathlib import Path
from audit_capacity_phase_a import free_memory,child_memory,RSS_LIMIT
ROOT=Path(__file__).resolve().parents[1]
def main():
    if os.environ.get('C2B_EMULATOR_TESTS')!='1' or os.environ.get('GCLOUD_PROJECT')!='demo-c2b-integration' or os.environ.get('FIRESTORE_EMULATOR_HOST')!='127.0.0.1:8080':raise ValueError('C2b target refused')
    if free_memory()<1024**3:raise ValueError('Memory prerequisite refused')
    env=os.environ.copy();env.pop('GEMINI_API_KEY',None)
    child=subprocess.Popen(['node','--max-old-space-size=256',str(ROOT/'functions/experiments/c2b/preview.js')],env=env,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
    start=time.monotonic();peak=0
    try:
        while child.poll() is None:
            try:peak=max(peak,child_memory(child.pid))
            except (OSError,RuntimeError):
                if child.poll() is not None:break
                raise
            if peak>RSS_LIMIT or time.monotonic()-start>915:raise RuntimeError('Preview resource/watchdog refusal')
            time.sleep(.5)
    finally:
        if child.poll() is None:child.terminate();child.wait(timeout=5)
        # The preview owns only this fresh demo project. Never stop another8080 listener.
        if os.name=='nt':
            command="$ErrorActionPreference='Stop'; $listeners=Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue; if ($listeners) { $helper=Get-CimInstance Win32_Process -Filter ('ProcessId='+$listeners[0].OwningProcess); if ($helper.Name -ne 'java.exe' -or $helper.CommandLine -notmatch 'cloud-firestore-emulator' -or $helper.CommandLine -notmatch 'demo-c2b-integration' -or $helper.CommandLine -notmatch '8080') { throw 'C2b emulator owner mismatch' }; Stop-Process -Id $helper.ProcessId }"
            subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-Command',command],check=True,creationflags=subprocess.CREATE_NO_WINDOW)
        print(json.dumps({'status':'preview_finished','peak_rss_bytes':peak,'elapsed_seconds':time.monotonic()-start}),flush=True)
    return child.returncode
if __name__=='__main__':raise SystemExit(main())
