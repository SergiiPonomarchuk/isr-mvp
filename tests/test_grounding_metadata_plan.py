"""Grounding-only recovery contract; fake CAS store, real local journal, no SDK."""
import copy
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import grounding_metadata_plan as G
import inventory_values_grounding as I
from test_grounding_inventory import source


class Snapshot:
    def __init__(self,uid,data,time):
        self.id,self.data,self.update_time=uid,copy.deepcopy(data),time
        self.exists=data is not None
    def to_dict(self):return {k:copy.deepcopy(self.data[k]) for k in I.FIELDS if k in self.data}


class Store:
    delete_value=object()
    def __init__(self,docs):
        self.docs=copy.deepcopy(docs);self.times={uid:dt.datetime(2026,11,23,tzinfo=dt.timezone.utc) for uid in docs}
        self.writes=[];self.lost=False;self.race=None
    def read_many(self,uids):return {uid:Snapshot(uid,self.docs.get(uid),self.times.get(uid)) for uid in uids}
    def edit(self,uid):self.times[uid]+=dt.timedelta(microseconds=1)
    def compare_and_set(self,uid,meta,snapshot):
        if self.race==uid:self.edit(uid)
        G.require(snapshot.update_time==self.times[uid],'last_update_conflict')
        tax=self.docs[uid]['values_taxonomy']
        if meta is self.delete_value:tax.pop('meta',None)
        else:tax['meta']=copy.deepcopy(meta)
        self.edit(uid);self.writes.append(uid)
        if self.lost:self.lost=False;raise TimeoutError('Synthetic lost commit response')
        return self.times[uid]


def fixture(size=2,null=False):
    docs,index={},{}
    for i in range(size):
        uid=str(7+i);raw,data=source(uid)
        data['values_taxonomy'].pop('meta')
        if null:data['values_taxonomy']['meta']=None
        data['sentinel']='unchanged'
        docs[uid]=data
        index[uid]=[dict(raw=raw,source_id='a',file_sha256='f'*64)]
    store=Store(docs)
    rows=[I.classify(uid,data,index[uid],store.times[uid]) for uid,data in sorted(docs.items())]
    b=json.dumps(dict(complete=True,project='demo-grounding',rows=rows)).encode()
    scope=dict(version='grounding-restoration-scope-1',project='demo-grounding',expected_candidates=size,
               inventory_sha256=hashlib.sha256(b).hexdigest(),deferred={'1':['deferred_db_audit']},artifact_hashes=['f'*64],candidate_uids_sha256=I.digest(sorted(docs)))
    plan=G.build_plan(b,scope,index,store)
    return store,index,scope,b,plan


class PlanTests(unittest.TestCase):
    def test_plan_is_read_only_and_contains_only_grounding_provenance(self):
        store,index,scope,b,plan=fixture()
        self.assertTrue(plan['ready']);self.assertEqual(store.writes,[])
        entries=G.validate_plan(plan,scope,index);self.assertEqual(len(entries),2)
        for e in entries:
            self.assertEqual(set(e['new_meta']),G.META_KEYS)
            self.assertEqual(e['new_meta']['overall_grounding'],23.3)
            self.assertEqual(e['new_meta']['version'],'1.0')
            self.assertEqual(e['source_refs'][0]['source_version'],'2.1')
        text=json.dumps(plan)
        for forbidden in ('Synthetic private narrative','DO_NOT_REPORT','values_description','conflict_resolution','timestamp'):
            self.assertNotIn(forbidden,text)

    def test_stale_or_changed_profiles_cannot_produce_a_partial_executable_plan(self):
        for change in ('time','narrative','values','meta'):
            store,index,scope,b,_=fixture();uid='8'
            if change=='time':store.edit(uid)
            elif change=='narrative':store.docs[uid]['values_description']='Changed'
            elif change=='values':store.docs[uid]['values_taxonomy']['domains'][0]=1
            else:store.docs[uid]['values_taxonomy']['meta']={}
            plan=G.build_plan(b,scope,index,store)
            self.assertFalse(plan['ready']);self.assertIsNone(plan['payload']);self.assertEqual(store.writes,[])

    def test_plan_and_source_tampering_fail_before_writes(self):
        store,index,scope,b,plan=fixture()
        changed=copy.deepcopy(plan);changed['payload']['entries'][0]['new_meta']['overall_grounding']=99
        with self.assertRaises(G.GuardError):G.validate_plan(changed,scope,index)
        for field,value in [('overall_grounding',True),('extra','unexpected')]:
            changed=copy.deepcopy(plan);changed['payload']['entries'][0]['new_meta'][field]=value
            changed['plan_sha256']=I.digest(changed['payload'])
            with self.assertRaises(G.GuardError):G.validate_plan(changed,scope,index)
        changed=copy.deepcopy(plan);changed['payload']['entries'][0]['values_sha256']='0'*64;changed['plan_sha256']=I.digest(changed['payload'])
        with self.assertRaises(G.GuardError):G.validate_plan(changed,scope,index)
        changed=copy.deepcopy(index);changed['7'][0]['raw']['meta']['gl_cs'][0][0]=11
        with self.assertRaises(G.GuardError):G.validate_plan(plan,scope,changed)
        self.assertEqual(store.writes,[])

    def test_deferred_or_expanded_scope_is_never_accepted(self):
        store,index,scope,b,plan=fixture()
        changed=copy.deepcopy(plan);changed['payload']['entries'][0]['uid']='1';changed['plan_sha256']=I.digest(changed['payload'])
        with self.assertRaises(G.GuardError):G.validate_plan(changed,scope,index)
        changed=copy.deepcopy(scope);changed['deferred']['7']=['review']
        with self.assertRaises(G.GuardError):G.build_plan(b,changed,index,store)
        with self.assertRaises(G.GuardError):G.build_plan(b+b' ',scope,index,store)

    def test_apply_retry_verify_rollback_and_reapply_preserve_full_documents(self):
        for null in (False,True):
            store,index,scope,b,plan=fixture(null=null);before=copy.deepcopy(store.docs)
            with tempfile.TemporaryDirectory() as folder:
                path=Path(folder)/'journal.jsonl';j=G.Journal(path,plan)
                self.assertTrue(G.run_apply(store,plan,j)['complete']);self.assertEqual(len(store.writes),2)
                self.assertEqual(G.verify(store,plan)['counts']['desired'],2)
                self.assertEqual(G.run_apply(store,plan,G.Journal(path,plan))['confirmed_writes'],0)
                self.assertTrue(G.run_rollback(store,plan,G.Journal(path,plan))['complete'])
                self.assertEqual(store.docs,before);self.assertEqual(len(store.writes),4)
                self.assertEqual(G.run_rollback(store,plan,G.Journal(path,plan))['confirmed_writes'],0)
                self.assertTrue(G.run_apply(store,plan,G.Journal(path,plan))['complete'])
                self.assertEqual(len(store.writes),6)
                for uid in store.docs:
                    self.assertEqual(store.docs[uid]['sentinel'],'unchanged')
                    self.assertEqual(store.docs[uid]['values_description'],before[uid]['values_description'])

    def test_preflight_checks_every_profile_before_first_write(self):
        store,index,scope,b,plan=fixture();store.edit('8')
        with tempfile.TemporaryDirectory() as folder:
            result=G.run_apply(store,plan,G.Journal(Path(folder)/'j',plan))
            self.assertFalse(result['complete']);self.assertEqual(result['write_attempts'],0)
        self.assertEqual(store.writes,[])

    def test_lost_response_resumes_without_repeat_write_but_rollback_holds_uncertain_ownership(self):
        store,index,scope,b,plan=fixture();store.lost=True
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'j';first=G.run_apply(store,plan,G.Journal(path,plan))
            self.assertFalse(first['complete']);self.assertEqual(len(store.writes),1)
            again=G.run_apply(store,plan,G.Journal(path,plan));self.assertTrue(again['complete'])
            self.assertEqual(again['ambiguous_ownership'],1);self.assertFalse(again['rollback_ready']);self.assertEqual(len(store.writes),2)
            held=G.run_rollback(store,plan,G.Journal(path,plan));self.assertFalse(held['complete'])
            self.assertEqual(held['conflicts'][0]['reason'],'rollback_ownership_unproven');self.assertEqual(len(store.writes),2)

    def test_post_apply_edit_blocks_rollback_without_deleting_metadata(self):
        store,index,scope,b,plan=fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'j';G.run_apply(store,plan,G.Journal(path,plan));store.docs['8']['sentinel']='Later edit';store.edit('8')
            before=copy.deepcopy(store.docs);result=G.run_rollback(store,plan,G.Journal(path,plan))
            self.assertFalse(result['complete']);self.assertEqual(result['write_attempts'],0);self.assertEqual(store.docs,before)

    def test_compare_and_set_race_stops_and_preserves_other_profile_fields(self):
        store,index,scope,b,plan=fixture();store.race='8'
        with tempfile.TemporaryDirectory() as folder:
            result=G.run_apply(store,plan,G.Journal(Path(folder)/'j',plan))
            self.assertFalse(result['complete']);self.assertEqual(store.writes,['7'])
            self.assertNotIn('meta',store.docs['8']['values_taxonomy'])

    def test_journal_tampering_partial_tail_and_wrong_plan_are_refused(self):
        store,index,scope,b,plan=fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'j';j=G.Journal(path,plan);j.append('7','intent')
            good=path.read_bytes();path.write_bytes(good[:-1])
            with self.assertRaises(G.GuardError):G.Journal(path,plan)
            path.write_bytes(good.replace(b'intent',b'edited'))
            with self.assertRaises(G.GuardError):G.Journal(path,plan)
            path.write_bytes(good)
            changed=copy.deepcopy(plan);changed['plan_sha256']='0'*64
            with self.assertRaises(G.GuardError):G.Journal(path,changed)

    def test_changed_artifact_file_hash_is_refused(self):
        raw,_=source()
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'source.json';file.write_text(json.dumps({'7':raw}),encoding='utf-8')
            scope={'artifact_hashes':[hashlib.sha256(file.read_bytes()).hexdigest()]}
            self.assertIn('7',G.load_sources([file],scope))
            file.write_text(json.dumps({'7':raw})+' ',encoding='utf-8')
            with self.assertRaises(G.GuardError):G.load_sources([file],scope)


class AdditionalRecoveryTests(unittest.TestCase):
    def test_lost_rollback_response_is_reconciled_without_repeat_delete(self):
        store,index,scope,b,plan=fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'j';G.run_apply(store,plan,G.Journal(path,plan));before_writes=len(store.writes)
            store.lost=True;failed=G.run_rollback(store,plan,G.Journal(path,plan));self.assertFalse(failed['complete'])
            self.assertEqual(len(store.writes),before_writes+1)
            resumed=G.run_rollback(store,plan,G.Journal(path,plan));self.assertTrue(resumed['complete'])
            self.assertEqual(len(store.writes),before_writes+2)
            self.assertTrue(all('meta' not in d['values_taxonomy'] for d in store.docs.values()))

    def test_nanosecond_preconditions_are_preserved_or_refused_for_old_inventory(self):
        class Nanos:
            nanosecond=123456789
            def isoformat(self):return '2026-11-23T00:00:00.123456+00:00'
            def rfc3339(self):return '2026-11-23T00:00:00.123456789Z'
        store,index,scope,b,plan=fixture(size=1);store.times['7']=Nanos()
        row=I.classify('7',store.docs['7'],index['7'],store.times['7'])
        report=dict(complete=True,project=scope['project'],rows=[row]);raw=json.dumps(report).encode();scope['inventory_sha256']=hashlib.sha256(raw).hexdigest()
        ready=G.build_plan(raw,scope,index,store);self.assertTrue(ready['ready'])
        self.assertEqual(ready['payload']['entries'][0]['before_update_time'],'2026-11-23T00:00:00.123456789Z')
        del row['precise_update_time'];raw=json.dumps(report).encode();scope['inventory_sha256']=hashlib.sha256(raw).hexdigest()
        held=G.build_plan(raw,scope,index,store);self.assertFalse(held['ready'])
        self.assertEqual(held['conflicts'][0]['reason'],'inventory_time_precision_insufficient')


class MetadataTypeTests(unittest.TestCase):
    def test_postcondition_never_equates_boolean_with_integer_metadata(self):
        store,index,scope,b,_=fixture(size=1)
        index['7'][0]['raw']['meta']['gl_cs'][0][0]=1
        plan=G.build_plan(b,scope,index,store)
        self.assertTrue(plan['ready'])
        with tempfile.TemporaryDirectory() as folder:
            G.run_apply(store,plan,G.Journal(Path(folder)/'j',plan))
            store.docs['7']['values_taxonomy']['meta']['gl_cs']['d1']['grounding']=True
            result=G.verify(store,plan)
            self.assertEqual(result['counts']['conflict'],1)
