"""Opt-in actual Firestore/CLI rehearsal on disposable synthetic data only."""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import grounding_metadata_plan as G
import inventory_values_grounding as I
from test_grounding_inventory import source

ROOT=Path(__file__).resolve().parents[1]
PROJECT='demo-grounding-rehearsal'


class LoseResponse:
    def __init__(self,store):self.store=store;self.delete_value=store.delete_value;self.calls=0;self.once=True
    def read_many(self,ids):return self.store.read_many(ids)
    def compare_and_set(self,uid,metadata,snapshot):
        self.calls+=1;result=self.store.compare_and_set(uid,metadata,snapshot)
        if self.once:self.once=False;raise TimeoutError('Synthetic lost response after emulator commit')
        return result


@unittest.skipUnless(os.environ.get('GROUNDING_EMULATOR_TESTS')=='1','isolated grounding emulator is opt-in')
class EmulatorTests(unittest.TestCase):
    def test_224_profile_cli_apply_retry_rollback_preserves_16_deferred_and_other_fields(self):
        self.assertEqual(os.environ.get('FIRESTORE_EMULATOR_HOST'),'127.0.0.1:8189')
        self.assertEqual(os.environ.get('GCLOUD_PROJECT'),PROJECT)
        from google.cloud import firestore
        db=firestore.Client(project=PROJECT)
        self.assertEqual(list(db.collections()),[],'rehearsal needs a fresh disposable database')
        deferred=G.strict_json((ROOT/'specs/tasks/Values-grounding-restoration-scope.json').read_bytes())['deferred']
        uids=[str(10000+i) for i in range(224)]
        raw_map,docs={},{}
        for number,uid in enumerate(uids+list(deferred)):
            raw,data=source(uid,version='2.1' if number<13 else '1.0')
            raw_map[uid]=raw;data={k:v for k,v in data.items() if k in I.FIELDS};data['values_taxonomy'].pop('meta')
            if number%2==0:data['values_taxonomy']['items']={f'd{i}':None for i in range(1,11)}
            if number%3==0:data['values_taxonomy']['meta']=None
            data['sentinel']='preserve unrelated field';docs[uid]=data
        docs['99999']={'uid':99999,'sentinel':'nonparticipant control'}
        batch=db.batch()
        for uid,data in docs.items():batch.set(db.collection('users').document(uid),data)
        batch.commit()
        before={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
        scratch=ROOT/'scratch';scratch.mkdir(exist_ok=True)
        try:
            with tempfile.TemporaryDirectory(dir=scratch,prefix='grounding-rehearsal-') as folder:
                folder=Path(folder);artifact=folder/'vectors.json';artifact.write_text(json.dumps(raw_map),encoding='utf-8')
                index,summaries=I.load_artifacts([artifact]);inventory=I.inventory(db,index,summaries)
                inventory['project']=PROJECT;inventory_file=folder/'inventory.json';I.save_report(inventory,inventory_file)
                scope=dict(version='grounding-restoration-scope-1',project=PROJECT,inventory_sha256=hashlib.sha256(inventory_file.read_bytes()).hexdigest(),expected_candidates=224,deferred=deferred,artifact_hashes=[summaries[0]['file_sha256']],candidate_uids_sha256=I.digest(sorted(uids)))
                scope_file=folder/'scope.json';I.save_report(scope,scope_file)
                plan_file,journal_file=folder/'plan.json',folder/'journal.jsonl'
                def cli(mode):
                    args=[sys.executable,str(ROOT/'scripts/backfill_values_grounding.py'),mode,'--project',PROJECT,'--test-scope',str(scope_file),'--plan',str(plan_file)]
                    if mode=='plan':args+=['--inventory',str(inventory_file)]
                    if mode!='rollback':args+=['--artifact',str(artifact)]
                    if mode in ('apply','rollback'):args+=['--apply','--journal',str(journal_file)]
                    env={**os.environ,'PYTHONWARNINGS':'ignore','GEMINI_API_KEY':''}
                    run=subprocess.run(args,env=env,text=True,capture_output=True,timeout=180)
                    self.assertEqual(run.returncode,0,run.stdout+run.stderr)
                    return json.loads(run.stdout.strip().splitlines()[-1])
                self.assertTrue(cli('plan')['ready'])
                plan=G.strict_json(plan_file.read_bytes());G.validate_plan(plan,scope,index)
                self.assertEqual(len(plan['payload']['entries']),224)
                self.assertTrue(set(deferred).isdisjoint(e['uid'] for e in plan['payload']['entries']))
                applied=cli('apply');self.assertEqual(applied['confirmed_writes'],224)
                self.assertEqual(cli('verify')['counts']['desired'],224)
                self.assertEqual(cli('apply')['confirmed_writes'],0)
                after={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
                for uid in uids:
                    expected=copy.deepcopy(before[uid][0]);entry=next(e for e in plan['payload']['entries'] if e['uid']==uid)
                    expected['values_taxonomy']['meta']=entry['new_meta'];self.assertEqual(after[uid][0],expected)
                for uid in list(deferred)+['99999']:self.assertEqual(after[uid],before[uid])
                # Lose the response to one real emulator rollback; resume must not repeat it.
                lose=LoseResponse(G.FirestoreStore(db))
                interrupted=G.run_rollback(lose,plan,G.Journal(journal_file,plan));self.assertFalse(interrupted['complete']);self.assertEqual(lose.calls,1)
                resumed=cli('rollback');self.assertEqual(resumed['confirmed_writes'],223)
                self.assertEqual(cli('rollback')['confirmed_writes'],0)
                self.assertEqual(cli('verify')['counts']['before'],224)
                restored={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
                self.assertEqual({k:v[0] for k,v in restored.items()},{k:v[0] for k,v in before.items()})
                for uid in list(deferred)+['99999']:self.assertEqual(restored[uid],before[uid])
                # A separate real commit loses its apply response: verify, no duplicate, hold rollback.
                uid='40000';raw,data=source(uid);data={k:v for k,v in data.items() if k in I.FIELDS};data['values_taxonomy'].pop('meta')
                db.collection('users').document(uid).set(data)
                store=G.FirestoreStore(db);snap=store.read_many([uid])[uid]
                inv=dict(complete=True,project=PROJECT,rows=[I.classify(uid,snap.to_dict(),[dict(raw=raw,source_id='lost',file_sha256='a'*64)],snap.update_time)])
                inv_bytes=json.dumps(inv).encode();lost_scope={**scope,'expected_candidates':1,'candidate_uids_sha256':I.digest([uid]),'inventory_sha256':hashlib.sha256(inv_bytes).hexdigest(),'artifact_hashes':['a'*64]}
                lost_index={uid:[dict(raw=raw,source_id='lost',file_sha256='a'*64)]}
                lost_plan=G.build_plan(inv_bytes,lost_scope,lost_index,store);self.assertTrue(lost_plan['ready'])
                lose=LoseResponse(store);path=folder/'lost.jsonl'
                self.assertFalse(G.run_apply(lose,lost_plan,G.Journal(path,lost_plan))['complete'])
                recovered=G.run_apply(lose,lost_plan,G.Journal(path,lost_plan));self.assertTrue(recovered['complete']);self.assertEqual(lose.calls,1)
                held=G.run_rollback(lose,lost_plan,G.Journal(path,lost_plan));self.assertFalse(held['complete']);self.assertEqual(held['write_attempts'],0)
                print(json.dumps({'grounding_emulator_rehearsal':{'planned':224,'confirmed_apply':224,'retry_writes':0,'rollback_lost_response_reconciled':1,'confirmed_remaining_rollback':223,'full_documents_restored':241,'deferred_untouched':16,'lost_apply_duplicate_writes':0,'uncertain_rollback_held':True,'production_writes':0,'provider_calls':0}}))
        finally:db.close()
