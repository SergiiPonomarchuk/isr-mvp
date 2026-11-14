"""D1 local runtime. Explicitly opt in before using the main checkout's key loader.

The launcher never prints a key or writes a secret file. A private child invokes
the existing main-checkout loader and passes the value in memory to its child.
Author approval is required by AGENTS.md before using that loader in a worktree.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
from demo_common import ROOT,load_json,save_json

BOOTSTRAP=r'''
import os,subprocess,sys,json
sys.path.insert(0,str(__import__('pathlib').Path(sys.argv[1])/'scripts'))
import gemini_api
value=gemini_api.load_key()
if not value:raise SystemExit('Existing project loader found no key; no command started.')
environment=os.environ.copy();environment['GEMINI_API_KEY']=value
raise SystemExit(subprocess.call(json.loads(sys.argv[2]),env=environment))
'''

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['emulators','content'])
    parser.add_argument('--project',default='project-a3d59130-5adf-4677-9e2')
    parser.add_argument('--use-main-key-loader',action='store_true')
    parser.add_argument('--main-checkout',default='C:/isr-mvp')
    parser.add_argument('--snapshot',default='A:/BackUp/isr-mvp/emulator-snapshots/2026-11-12-integrated-47e835a')
    parser.add_argument('--content',default=str(ROOT/'specs/demo/content.json'))
    parser.add_argument('--ledger',default=str(ROOT/'specs/demo/network-ledger.json'))
    args=parser.parse_args(argv)
    if not args.use_main_key_loader:parser.error('Explicit --use-main-key-loader is required; obtain the author\'s approval first')
    main_root=Path(args.main_checkout).resolve()
    if not (main_root/'scripts/gemini_api.py').is_file():parser.error('Existing project loader is missing')
    env=os.environ.copy();env['GCLOUD_PROJECT']=args.project;env['FIRESTORE_EMULATOR_HOST']='127.0.0.1:8080'
    env['NODE_PATH']=str(main_root/'functions/node_modules');env['JAVA_TOOL_OPTIONS']='-Xmx8g'
    if args.mode=='content':
        command=[sys.executable,str(ROOT/'scripts/prepare_demo.py'),'--project',args.project,'--generate','--output',args.content]
    else:
        for port in (8080,5001,5000):
            with socket.socket() as sock:
                if sock.connect_ex(('127.0.0.1',port))==0:parser.error(f'Port {port} is occupied; stop only the known disposable preview first')
        saved=ROOT/'.emulator-data';snapshot=saved if (saved/'firebase-export-metadata.json').is_file() else Path(args.snapshot)
        if not (snapshot/'firebase-export-metadata.json').is_file():parser.error('Named import snapshot is unavailable; do not seed an empty substitute')
        ledger=Path(args.ledger)
        if not ledger.exists():save_json(ledger,{'limits':{'text':15,'embedding':15,'nominatim':1},'used':{'text':0,'embedding':0,'nominatim':0},'requests':[]})
        data=load_json(ledger)
        if data['limits']!={'text':15,'embedding':15,'nominatim':1}:parser.error('Unexpected budget ledger; review it instead of silently resetting')
        env['D1_NETWORK_LEDGER']=str(ledger.resolve())
        preload=str(ROOT/'functions/tools/d1-network-budget.cjs').replace('\\','/')
        env['NODE_OPTIONS']=env.get('NODE_OPTIONS','')+f' --require="{preload}"'
        # Invoke the existing CLI's JS entry directly, avoiding batch-shell quoting.
        launcher=shutil.which('firebase') or shutil.which('firebase.cmd')
        if not launcher:parser.error('Firebase CLI not found')
        firebase_js=Path(launcher).resolve().parent/'node_modules/firebase-tools/lib/bin/firebase.js'
        if not firebase_js.is_file():parser.error('Firebase CLI entry point not found; inspect the installed CLI before launch')
        command=['node',str(firebase_js),'emulators:start','--only','firestore,functions,hosting','--project',args.project,
            '--import='+str(snapshot.resolve()),'--export-on-exit='+str(saved)]
        # Java's shim may fork an untracked child; use the actual installed JDK.
        found=subprocess.run(['java','-XshowSettings:properties','-version'],capture_output=True,text=True)
        import re
        match=re.search(r'^\s*java.home\s*=\s*(.+)$',found.stdout+'\n'+found.stderr,re.M)
        if match:env['PATH']=str(Path(match.group(1).strip())/'bin')+os.pathsep+env['PATH']
    return subprocess.call([sys.executable,'-c',BOOTSTRAP,str(main_root),json.dumps(command)],cwd=ROOT,env=env)

if __name__=='__main__':raise SystemExit(main())
