"""R1 pure/fake tests: real journal and exact dotted-field CAS adapter."""
import copy,datetime as dt,hashlib,json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import optional_metadata_plan as R
import grounding_metadata_plan as G
import inventory_values_grounding as I
import recover_optional_values_metadata as CLI
from test_grounding_metadata_plan import fixture as grounding_fixture,Store as GroundingStore

class RawStore(GroundingStore):
    def patch(self,uid,updates,snapshot):
        G.require(set(updates)==set(R.PATHS),'unexpected_field_patch')
        if self.race==uid:self.edit(uid)
        G.require(snapshot.update_time==self.times[uid],'last_update_conflict')
        meta=self.docs[uid]['values_taxonomy']['meta']
        for path,value in updates.items():
            key=path.split('.')[-1]
            if value is self.delete_value:meta.pop(key,None)
            else:meta[key]=copy.deepcopy(value)
        self.edit(uid);self.writes.append((uid,tuple(sorted(updates))))
        if self.lost:self.lost=False;raise TimeoutError('Synthetic lost response')
        return self.times[uid]

def fixture(size=2):
    initial,index,old_scope,inv,_=grounding_fixture(size)
    for uid,refs in index.items():
        refs[0]['raw']['meta'].update(timestamp='2026-10-12T10:00:00Z',vector_id='synthetic-'+uid,overall_confidence=68.75)
    original=G.build_plan(inv,old_scope,index,initial);G.validate_plan(original,old_scope,index)
    for e in original['payload']['entries']:initial.docs[e['uid']]['values_taxonomy']['meta']=copy.deepcopy(e['new_meta'])
    store=RawStore(initial.docs)
    for uid in store.docs:store.edit(uid)
    b=json.dumps(original).encode()
    scope={'version':'optional-metadata-scope-1','project':old_scope['project'],'expected_candidates':size,'candidate_uids_sha256':old_scope['candidate_uids_sha256'],'deferred':old_scope['deferred'],'artifact_hashes':old_scope['artifact_hashes'],'grounding_plan_sha256':original['plan_sha256'],'grounding_plan_file_sha256':hashlib.sha256(b).hexdigest(),'grounding_scope_sha256':I.digest(old_scope)}
    plan=R.build_plan(b,old_scope,scope,index,store)
    return store,index,old_scope,b,scope,plan

class OptionalTests(unittest.TestCase):
    def test_plan_is_source_bound_and_preserves_grounding(self):
        store,index,old,b,scope,p=fixture();self.assertTrue(p['ready']);R.validate_plan(p,scope,index);self.assertEqual(store.writes,[])
        for e in p['payload']['entries']:
            self.assertEqual(set(e['new_meta'])-set(e['before_meta']),set(R.EXTRA))
            self.assertEqual({k:e['new_meta'][k] for k in G.META_KEYS},e['before_meta'])
        for forbidden in ('Synthetic private narrative','DO_NOT_REPORT','values_description','conflict_resolution'):
            self.assertNotIn(forbidden,json.dumps(p))
    def test_source_scalar_types_and_timestamp_are_strict(self):
        valid={'timestamp':'2026-10-12T10:00:00Z','vector_id':'synthetic-7','overall_confidence':68.75}
        for key,value in [('timestamp','2026-10-12T10:00:00'),('timestamp',None),('timestamp','not a date'),('vector_id','secret@example.com'),('vector_id',''),('overall_confidence',True),('overall_confidence',float('nan')),('overall_confidence',101)]:
            with self.assertRaises(G.GuardError):R.extras({**valid,key:value})
        for key in R.EXTRA:
            bad=copy.deepcopy(valid);del bad[key]
            with self.assertRaises(G.GuardError):R.extras(bad)
    def test_any_optional_key_including_null_blocks_initial_plan(self):
        for key in R.EXTRA:
            store,index,old,b,scope,p=fixture();store.docs['8']['values_taxonomy']['meta'][key]=None
            blocked=R.build_plan(b,old,scope,index,store)
            self.assertFalse(blocked['ready']);self.assertIsNone(blocked['payload']);self.assertEqual(store.writes,[])
    def test_uid_values_narrative_or_grounding_change_blocks_plan(self):
        for change in ('uid','values','narrative','grounding'):
            store,index,old,b,scope,p=fixture();u=store.docs['8']
            if change=='uid':u['uid']=99
            elif change=='values':u['values_taxonomy']['domains'][0]=10
            elif change=='narrative':u['values_description']='changed'
            else:u['values_taxonomy']['meta']['overall_grounding']=True
            self.assertFalse(R.build_plan(b,old,scope,index,store)['ready']);self.assertEqual(store.writes,[])
    def test_original_plan_and_scope_cannot_be_swapped(self):
        store,index,old,b,scope,p=fixture()
        with self.assertRaises(G.GuardError):R.build_plan(b+b' ',old,scope,index,store)
        with self.assertRaises(G.GuardError):R.build_plan(b,{**old,'expected_candidates':1},scope,index,store)
        with self.assertRaises(G.GuardError):R.validate_plan(p,{**scope,'candidate_uids_sha256':'0'*64},index)
    def test_plan_tampering_and_deferred_id_fail(self):
        store,index,old,b,scope,p=fixture()
        for key,value in [('overall_confidence',True),('overall_grounding',99),('unexpected','no')]:
            bad=copy.deepcopy(p);bad['payload']['entries'][0]['new_meta'][key]=value;bad['plan_sha256']=I.digest(bad['payload'])
            with self.assertRaises(G.GuardError):R.validate_plan(bad,scope,index)
        bad=copy.deepcopy(p);bad['payload']['entries'][0]['uid']='1';bad['plan_sha256']=I.digest(bad['payload'])
        with self.assertRaises(G.GuardError):R.validate_plan(bad,scope,index)
    def test_source_entry_or_optional_derivation_changes_fail(self):
        store,index,old,b,scope,p=fixture();index['7'][0]['raw']['meta']['overall_confidence']=20
        with self.assertRaises(G.GuardError):R.validate_plan(p,scope,index)
    def test_ambiguous_verified_sources_block_plan(self):
        store,index,old,b,scope,p=fixture();original=G.strict_json(b);extra=copy.deepcopy(index['7'][0]);extra['raw']['meta']['overall_confidence']=30;index['7'].append(extra)
        ref={'file_sha256':extra['file_sha256'],'entry_sha256':I.digest(extra['raw']),'source_version':extra['raw']['meta']['version']};original['payload']['entries'][0]['source_refs'].append(ref);original['plan_sha256']=I.digest(original['payload']);new_b=json.dumps(original).encode();scope={**scope,'grounding_plan_sha256':original['plan_sha256'],'grounding_plan_file_sha256':hashlib.sha256(new_b).hexdigest()}
        self.assertFalse(R.build_plan(new_b,old,scope,index,store)['ready'])
    def test_apply_verify_retry_rollback_preserves_full_documents(self):
        store,index,old,b,scope,p=fixture();before=copy.deepcopy(store.docs);engine=R.EngineStore(store,p)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'journal.jsonl';result=G.run_apply(engine,p,G.Journal(path,p));self.assertTrue(result['complete']);self.assertEqual(result['confirmed_writes'],2)
            self.assertEqual(G.verify(engine,p)['counts'],{'desired':2,'before':0,'conflict':0})
            self.assertEqual(G.run_apply(engine,p,G.Journal(path,p))['confirmed_writes'],0)
            self.assertEqual(G.run_rollback(engine,p,G.Journal(path,p))['confirmed_writes'],2)
            self.assertEqual(G.run_rollback(engine,p,G.Journal(path,p))['confirmed_writes'],0)
            self.assertEqual(G.verify(engine,p)['counts']['before'],2);self.assertEqual(store.docs,before)
            self.assertEqual(G.run_apply(engine,p,G.Journal(path,p))['confirmed_writes'],2)
        self.assertTrue(all(paths==tuple(sorted(R.PATHS)) for uid,paths in store.writes))
    def test_preflight_checks_all_before_first_write(self):
        store,index,old,b,scope,p=fixture();store.edit('8');engine=R.EngineStore(store,p)
        with tempfile.TemporaryDirectory() as d:
            r=G.run_apply(engine,p,G.Journal(Path(d)/'j',p));self.assertFalse(r['complete']);self.assertEqual(r['write_attempts'],0)
        self.assertEqual(store.writes,[])
    def test_missing_null_or_extra_current_metadata_is_conflict(self):
        for value in (None,{},'invalid'):
            store,index,old,b,scope,p=fixture();store.docs['7']['values_taxonomy']['meta']=value
            self.assertEqual(G.verify(R.EngineStore(store,p),p)['counts']['conflict'],1)
        store,index,old,b,scope,p=fixture();store.docs['7']['values_taxonomy']['meta']['unknown']=1
        self.assertEqual(G.verify(R.EngineStore(store,p),p)['counts']['conflict'],1)
    def test_cas_race_cannot_write(self):
        store,index,old,b,scope,p=fixture();store.race='7'
        with tempfile.TemporaryDirectory() as d:
            r=G.run_apply(R.EngineStore(store,p),p,G.Journal(Path(d)/'j',p));self.assertFalse(r['complete'])
        self.assertEqual(store.writes,[])
    def test_lost_apply_response_no_duplicate_and_rollback_held(self):
        store,index,old,b,scope,p=fixture();store.lost=True;engine=R.EngineStore(store,p)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'j';self.assertFalse(G.run_apply(engine,p,G.Journal(path,p))['complete'])
            resumed=G.run_apply(engine,p,G.Journal(path,p));self.assertTrue(resumed['complete']);self.assertEqual(len(store.writes),2);self.assertFalse(resumed['rollback_ready'])
            held=G.run_rollback(engine,p,G.Journal(path,p));self.assertFalse(held['complete']);self.assertEqual(held['write_attempts'],0)
    def test_lost_rollback_response_resumes_without_redelete(self):
        store,index,old,b,scope,p=fixture();before=copy.deepcopy(store.docs);engine=R.EngineStore(store,p)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'j';G.run_apply(engine,p,G.Journal(path,p));store.lost=True
            self.assertFalse(G.run_rollback(engine,p,G.Journal(path,p))['complete'])
            self.assertTrue(G.run_rollback(engine,p,G.Journal(path,p))['complete']);self.assertEqual(len(store.writes),4);self.assertEqual(store.docs,before)
    def test_unrelated_later_edit_prevents_rollback(self):
        store,index,old,b,scope,p=fixture();engine=R.EngineStore(store,p)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'j';G.run_apply(engine,p,G.Journal(path,p));store.docs['8']['sentinel']='new';store.edit('8')
            r=G.run_rollback(engine,p,G.Journal(path,p));self.assertFalse(r['complete']);self.assertEqual(r['write_attempts'],0)
    def test_journal_binding_corruption_and_partial_tail_fail(self):
        store,index,old,b,scope,p=fixture()
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'j';G.Journal(path,p);path.write_bytes(path.read_bytes()+b'{')
            with self.assertRaises(G.GuardError):G.Journal(path,p)
            path=Path(d)/'j2';G.Journal(path,p)
            with self.assertRaises(G.GuardError):G.Journal(path,{**p,'plan_sha256':'0'*64})
    def test_adapter_rejects_whole_meta_or_other_fields(self):
        store,index,old,b,scope,p=fixture();engine=R.EngineStore(store,p);snap=engine.read_many(['7'])['7']
        with self.assertRaises(G.GuardError):engine.compare_and_set('7',{},snap)
        with self.assertRaises(G.GuardError):store.patch('7',{'values_taxonomy.meta':{}},snap.original)

if __name__=='__main__':unittest.main()
