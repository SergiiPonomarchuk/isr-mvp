"""Opt-in R1 actual CLI/SDK recovery rehearsal on disposable synthetic data."""
import copy,hashlib,json,os,subprocess,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import optional_metadata_plan as R
import grounding_metadata_plan as G
import inventory_values_grounding as I
from test_grounding_inventory import source
from test_grounding_metadata_plan import Store

ROOT=Path(__file__).resolve().parents[1]
PROJECT='demo-r1-rehearsal'

class LoseResponse:
    def __init__(self,raw):self.raw=raw;self.delete_value=raw.delete_value;self.once=True;self.calls=0
    def read_many(self,ids):return self.raw.read_many(ids)
    def patch(self,uid,updates,snap):
        self.calls+=1;value=self.raw.patch(uid,updates,snap)
        if self.once:self.once=False;raise TimeoutError('Synthetic lost emulator response')
        return value

@unittest.skipUnless(os.environ.get('OPTIONAL_METADATA_EMULATOR_TESTS')=='1','isolated R1 emulator is opt-in')
class EmulatorTests(unittest.TestCase):
    def test_actual_cli_224_apply_retry_rollback_preserves_grounding_and_16_deferred(self):
        self.assertEqual(os.environ.get('FIRESTORE_EMULATOR_HOST'),'127.0.0.1:8189')
        self.assertEqual(os.environ.get('GCLOUD_PROJECT'),PROJECT)
        from google.cloud import firestore
        db=firestore.Client(project=PROJECT)
        self.assertEqual(list(db.collections()),[],'requires a fresh disposable R1 database')
        deferred=G.strict_json((ROOT/'specs/tasks/Values-grounding-restoration-scope.json').read_bytes())['deferred']
        scratch=ROOT/'scratch';scratch.mkdir(exist_ok=True)
        try:
            with tempfile.TemporaryDirectory(dir=scratch,prefix='r1-rehearsal-') as temp:
                temp=Path(temp)
                def prepare(uids,label,seed_excluded=False):
                    folder=temp/label;folder.mkdir();raw_map={};docs={};initial={}
                    for number,uid in enumerate(uids):
                        raw,data=source(uid,version='2.1' if number<13 else '1.0')
                        raw['meta'].update(timestamp='2026-10-12T10:00:00Z',vector_id='synthetic-'+uid,overall_confidence=68.75)
                        raw_map[uid]=raw;data={k:v for k,v in data.items() if k in I.FIELDS}
                        if number%2==0:data['values_taxonomy']['items']={f'd{i}':None for i in range(1,11)}
                        data['values_taxonomy']['meta']=G.minimal_metadata(uid,raw)
                        data['sentinel']={'keep':['nested',number]};docs[uid]=data
                        initial[uid]=copy.deepcopy(data);initial[uid]['values_taxonomy'].pop('meta')
                    artifact=folder/'vectors.json';artifact.write_text(json.dumps(raw_map),encoding='utf-8');index,summaries=I.load_artifacts([artifact]);fake=Store(initial)
                    inv={'complete':True,'project':PROJECT,'rows':[I.classify(uid,fake.docs[uid],index[uid],fake.times[uid]) for uid in sorted(uids)]};inv_bytes=json.dumps(inv).encode()
                    old={'version':'grounding-restoration-scope-1','project':PROJECT,'expected_candidates':len(uids),'inventory_sha256':hashlib.sha256(inv_bytes).hexdigest(),'deferred':deferred,'artifact_hashes':[summaries[0]['file_sha256']],'candidate_uids_sha256':I.digest(sorted(uids))}
                    original=G.build_plan(inv_bytes,old,index,fake);self.assertTrue(original['ready']);b=json.dumps(original).encode()
                    scope={'version':'optional-metadata-scope-1','project':PROJECT,'expected_candidates':len(uids),'candidate_uids_sha256':old['candidate_uids_sha256'],'deferred':deferred,'artifact_hashes':old['artifact_hashes'],'grounding_plan_sha256':original['plan_sha256'],'grounding_plan_file_sha256':hashlib.sha256(b).hexdigest(),'grounding_scope_sha256':I.digest(old)}
                    if seed_excluded:
                        for uid in deferred:docs[uid]={'uid':int(uid),'values_taxonomy':{'meta':None},'sentinel':'deferred must not change'}
                        docs['99999']={'uid':99999,'sentinel':'nonparticipant control'}
                    batch=db.batch()
                    for uid,data in docs.items():batch.set(db.collection('users').document(uid),data)
                    batch.commit()
                    old_file=folder/'old-scope.json';scope_file=folder/'scope.json';ground_file=folder/'grounding.json';ground_file.write_bytes(b);I.save_report(old,old_file);I.save_report(scope,scope_file)
                    plan_file=folder/'plan.json';journal=folder/'journal.jsonl'
                    def cli(mode):
                        args=[sys.executable,str(ROOT/'scripts/recover_optional_values_metadata.py'),mode,'--project',PROJECT,'--test-scope',str(scope_file),'--plan',str(plan_file)]
                        if mode=='plan':args+=['--test-grounding-scope',str(old_file),'--grounding-plan',str(ground_file)]
                        if mode!='rollback':args+=['--artifact',str(artifact)]
                        if mode in ('apply','rollback'):args+=['--apply','--journal',str(journal)]
                        run=subprocess.run(args,env={**os.environ,'GEMINI_API_KEY':'','PYTHONWARNINGS':'ignore'},text=True,capture_output=True,timeout=180)
                        self.assertEqual(run.returncode,0,run.stdout+run.stderr);return json.loads(run.stdout.strip().splitlines()[-1])
                    return cli,plan_file,journal,scope,index
                uids=[str(10000+n) for n in range(224)];cli,path,journal,scope,index=prepare(uids,'full',True)
                before={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
                self.assertTrue(cli('plan')['ready']);plan=G.strict_json(path.read_bytes());R.validate_plan(plan,scope,index)
                self.assertEqual(cli('apply')['confirmed_writes'],224);self.assertEqual(cli('verify')['counts']['desired'],224);self.assertEqual(cli('apply')['confirmed_writes'],0)
                after={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
                for entry in plan['payload']['entries']:
                    uid=entry['uid'];expected=copy.deepcopy(before[uid][0]);expected['values_taxonomy']['meta']=entry['new_meta'];self.assertEqual(after[uid][0],expected)
                for uid in list(deferred)+['99999']:self.assertEqual(after[uid],before[uid])
                lose=LoseResponse(R.FirestoreStore(db));engine=R.EngineStore(lose,plan)
                self.assertFalse(G.run_rollback(engine,plan,G.Journal(journal,plan))['complete']);self.assertEqual(lose.calls,1)
                self.assertEqual(cli('rollback')['confirmed_writes'],223);self.assertEqual(cli('rollback')['confirmed_writes'],0);self.assertEqual(cli('verify')['counts']['before'],224)
                restored={s.id:(s.to_dict(),G.stamp(s.update_time)) for s in db.collection('users').stream()}
                self.assertEqual({k:v[0] for k,v in restored.items()},{k:v[0] for k,v in before.items()})
                for uid in list(deferred)+['99999']:self.assertEqual(restored[uid],before[uid])
                # Separate actual apply response loss: reconcile without repeat patch; hold rollback.
                lost_cli,lost_path,lost_journal,lost_scope,lost_index=prepare(['40000'],'lost')
                self.assertTrue(lost_cli('plan')['ready']);lost_plan=G.strict_json(lost_path.read_bytes());R.validate_plan(lost_plan,lost_scope,lost_index)
                lose=LoseResponse(R.FirestoreStore(db));engine=R.EngineStore(lose,lost_plan)
                self.assertFalse(G.run_apply(engine,lost_plan,G.Journal(lost_journal,lost_plan))['complete'])
                resumed=G.run_apply(engine,lost_plan,G.Journal(lost_journal,lost_plan));self.assertTrue(resumed['complete']);self.assertEqual(lose.calls,1)
                held=G.run_rollback(engine,lost_plan,G.Journal(lost_journal,lost_plan));self.assertFalse(held['complete']);self.assertEqual(held['write_attempts'],0)
                print(json.dumps({'r1_emulator_rehearsal':{'planned':224,'confirmed_apply':224,'retry_writes':0,'remaining_confirmed_rollback':223,'lost_rollback_reconciled':1,'full_documents_restored':241,'deferred_untouched':16,'lost_apply_duplicate_writes':0,'uncertain_rollback_held':True,'production_writes':0,'provider_calls':0}}))
        finally:db.close()
