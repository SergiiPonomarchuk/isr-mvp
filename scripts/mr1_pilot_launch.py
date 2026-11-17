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
    parser.add_argument('--continuation',action='store_true')
    parser.add_argument('--epoch2',action='store_true')
    parser.add_argument('--grounding',action='store_true')
    parser.add_argument('--aligned',action='store_true')
    parser.add_argument('--two-case',action='store_true')
    parser.add_argument('--prototype-check',action='store_true')
    args=parser.parse_args()
    command=['node',str(ROOT/('functions/tools/candidate-prototype-check.js' if args.prototype_check else 'functions/tools/mr1-pilot.js'))]
    if args.corrected:command.append('--corrected')
    if args.continuation:command.append('--continuation')
    if args.epoch2:command.append('--epoch2')
    if args.grounding:command.append('--grounding')
    if args.aligned:command.append('--aligned')
    if args.two_case:command.append('--two-case')
    env=os.environ.copy()
    env['NODE_PATH']=str(MAIN/'functions/node_modules')
    if not args.apply:
        return subprocess.run(command,env=env).returncode
    approval_path=ROOT/('specs/tasks/M3-evaluation/prototype-check-approval.json' if args.prototype_check else 'specs/tasks/M3-evaluation/two-case-approval.json' if args.two_case else 'specs/tasks/M3-evaluation/aligned-approval.json' if args.aligned else 'specs/tasks/M3-evaluation/grounding-approval.json' if args.grounding else 'specs/tasks/M3-evaluation/technical-repair-approval.json' if args.epoch2 else 'specs/tasks/M3-evaluation/continuation-approval.json' if args.continuation else 'specs/tasks/M3-evaluation/corrected-approval.json' if args.corrected else 'specs/tasks/M3-evaluation/approval.json')
    approval=json.loads(approval_path.read_text(encoding='utf8'))
    plan=(ROOT/'specs/tasks/M3-evaluation/cases.json').read_bytes()
    if approval['plan_sha256']!=hashlib.sha256(plan).hexdigest():
        raise ValueError('Approved case plan changed; no request made')
    folder=ROOT/('specs/tasks/M3-evaluation/pilot-20261117-prototype-check' if args.prototype_check else 'specs/tasks/M3-evaluation/pilot-20261117-two-case' if args.two_case else 'specs/tasks/M3-evaluation/pilot-20261117-aligned' if args.aligned else 'specs/tasks/M3-evaluation/pilot-20261117-grounding' if args.grounding else 'specs/tasks/M3-evaluation/pilot-20261117-technical-repair' if args.epoch2 else 'specs/tasks/M3-evaluation/pilot-20261117-continuation' if args.continuation else 'specs/tasks/M3-evaluation/pilot-20261117-corrected' if args.corrected else 'specs/tasks/M3-evaluation/pilot-20261117')
    if args.prototype_check:
        for receipt in approval['receipts']:
            if hashlib.sha256((ROOT/receipt).read_bytes()).hexdigest()!=approval['pins'][receipt]:
                raise ValueError('Prototype parent receipt changed; no request made')
    if args.continuation:
        for receipt in approval['receipts']:
            if hashlib.sha256((ROOT/receipt['file']).read_bytes()).hexdigest()!=receipt['sha256']:
                raise ValueError('Continuation receipt changed; no request made')
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
