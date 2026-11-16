"""Approved M3 pilot launcher. Existing main-checkout loader handles the key privately.

Without --apply this verifies the pinned plan only and never loads a credential.
The fixed pilot receipt prevents accidental reruns or budget resets.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MAIN=Path('C:/isr-mvp')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true')
    parser.add_argument('--corrected',action='store_true')
    args=parser.parse_args()
    command=['node',str(ROOT/'functions/tools/mr1-pilot.js')]
    if args.corrected:command.append('--corrected')
    env=os.environ.copy()
    env['NODE_PATH']=str(MAIN/'functions/node_modules')
    if not args.apply:
        return subprocess.run(command,env=env).returncode
    approval_path=ROOT/('specs/tasks/M3-evaluation/corrected-approval.json' if args.corrected else 'specs/tasks/M3-evaluation/approval.json')
    approval=json.loads(approval_path.read_text(encoding='utf8'))
    plan=(ROOT/'specs/tasks/M3-evaluation/cases.json').read_bytes()
    if approval['plan_sha256']!=hashlib.sha256(plan).hexdigest():
        raise ValueError('Approved case plan changed; no request made')
    folder=ROOT/('specs/tasks/M3-evaluation/pilot-20261117-corrected' if args.corrected else 'specs/tasks/M3-evaluation/pilot-20261117')
    if args.corrected:
        parent=(ROOT/'specs/tasks/M3-evaluation/pilot-20261117/ledger.json').read_bytes()
        if hashlib.sha256(parent).hexdigest()!=approval['parent_receipt_sha256']:
            raise ValueError('Original receipt changed; no request made')
    if (folder/'ledger.json').exists() or (folder/'pilot.lock').exists():
        raise ValueError('Pilot receipt/lock exists; no automatic rerun or credential loading')
    # The author explicitly approved this existing loader for this pilot.
    # Never read/copy the secret file here or put a key in a file/argument/output.
    sys.path.insert(0,str(MAIN/'scripts'))
    import gemini_api
    if Path(gemini_api.ROOT).resolve()!=MAIN.resolve():
        raise ValueError('Unexpected credential-loader root')
    key=gemini_api.load_key()
    if not key:
        raise ValueError('Existing loader found no credential; no request made')
    env['GEMINI_API_KEY']=key
    env['M3_PILOT_AUTHORIZATION_SHA256']=hashlib.sha256(approval_path.read_bytes()).hexdigest()
    return subprocess.run(command+['--apply'],env=env).returncode


if __name__=='__main__':
    try:
        sys.exit(main())
    except Exception:
        print('Pilot launcher refused; no automatic retry or credential output.',file=sys.stderr)
        sys.exit(1)
