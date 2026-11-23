"""Read-only inventory behavior on synthetic profiles; no SDK/client required."""
import copy
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import inventory_values_grounding as I
from vectorizer.run import format_for_firestore


def source(uid='7', version='2.1'):
    narrative = 'Synthetic private narrative for inventory testing.'
    raw = dict(meta=dict(uid=int(uid), version=version, hash=hashlib.sha1(narrative.encode()).hexdigest(),
                       gl_cs=[[g, 60] for g in [10,20,30,40,10,20,30,40,11,22]]),
               core_values=dict(domains=[None]*10, items=[None]*10), conflict_resolution=[0]*36,
               contextual_shifts={k:[0]*10 for k in ('work','family','private','crisis')})
    canonical = copy.deepcopy(raw)
    canonical['meta']['version']='1.0'
    flat = format_for_firestore(canonical)
    data = dict(uid=int(uid), values_description=narrative, values_taxonomy=flat,
                email='DO_NOT_REPORT_EMAIL', password='DO_NOT_REPORT_PASSWORD', displayName='DO_NOT_REPORT_NAME')
    return raw, data


def artifact(raw, name='a'):
    return dict(raw=raw, source_id=name, file_sha256=hashlib.sha256(name.encode()).hexdigest())


class Snapshot:
    def __init__(self, uid, data):
        self.id, self._data = uid, data
        self.update_time=dt.datetime(2026,11,23,tzinfo=dt.timezone.utc)
    def to_dict(self):
        return {k:copy.deepcopy(self._data[k]) for k in I.FIELDS if k in self._data}


class Query:
    def __init__(self, db, size=200, after=None):
        self.db,self.size,self.after=db,size,after
    def select(self, fields):
        assert tuple(fields)==I.FIELDS
        self.db.calls.append(('select',tuple(fields)))
        return self
    def order_by(self, field):
        assert field=='__name__'
        return self
    def limit(self, size):
        return Query(self.db,size,self.after)
    def start_after(self, snapshot):
        return Query(self.db,self.size,snapshot.id)
    def get(self, timeout):
        assert timeout==60
        self.db.calls.append(('get',self.after))
        return [Snapshot(k,v) for k,v in sorted(self.db.data.items()) if self.after is None or k>self.after][:self.size]


class ReadOnlyDB:
    def __init__(self, data):
        self.data,self.calls=data,[]
    def collection(self, name):
        assert name=='users'
        self.calls.append(('collection',name))
        return Query(self)


class InventoryTests(unittest.TestCase):
    def test_stored_correct_missing_wrong_or_raw_encoded_grounding(self):
        _,data=source()
        self.assertEqual(I.classify('7',data)['state'],'already_correct')
        for value in (None, 50, True, float('nan')):
            changed=copy.deepcopy(data)
            changed['values_taxonomy']['meta']['overall_grounding']=value
            self.assertEqual(I.classify('7',changed)['state'],'calculable_from_stored_grounding')
        changed=copy.deepcopy(data)
        changed['values_taxonomy']['meta']['gl_cs']=source()[0]['meta']['gl_cs']
        self.assertEqual(I.classify('7',changed)['state'],'calculable_from_stored_grounding')
        changed['values_taxonomy']['meta']['version']='2.1'
        self.assertTrue(I.classify('7',changed)['requires_version_normalization'])

    def test_valid_raw_backup_recovers_only_when_uid_hash_and_values_match(self):
        raw,data=source()
        del data['values_taxonomy']['meta']
        before=copy.deepcopy(raw)
        row=I.classify('7',data,[artifact(raw)])
        self.assertEqual(row['state'],'recoverable_from_artifact')
        self.assertTrue(row['requires_version_normalization'])
        self.assertEqual(raw,before)
        for mutate,reason in (
            (lambda x:x['meta'].update(uid=8),'source_uid_mismatch'),
            (lambda x:x['meta'].update(hash='0'*40),'narrative_hash_mismatch'),
            (lambda x:x['meta'].update(version='unknown'),'unknown_metadata_version'),
            (lambda x:x['contextual_shifts']['work'].__setitem__(0,1),'artifact_values_mismatch'),
            (lambda x:x['meta']['gl_cs'][0].__setitem__(0,True),'invalid_grounding_metadata'),
        ):
            changed=copy.deepcopy(raw);mutate(changed)
            row=I.classify('7',data,[artifact(changed)])
            self.assertEqual(row['state'],'unresolved')
            self.assertIn(reason,row['reasons'])

    def test_stored_source_conflict_missing_narrative_and_changed_profile(self):
        raw,data=source()
        raw['meta']['gl_cs'][0][0]=11
        self.assertEqual(I.classify('7',data,[artifact(raw)])['reasons'],['conflicting_verified_sources'])
        for change,reason in (
            ({'values_description':'Changed synthetic narrative'},'narrative_hash_mismatch'),
            ({'values_description':None},'missing_current_narrative'),
            ({'uid':8},'profile_uid_mismatch'),
        ):
            self.assertIn(reason,I.classify('7',{**data,**change})['reasons'])
        data['values_taxonomy']['meta']['uid']=8
        self.assertEqual(I.classify('7',data,[artifact(source()[0])])['reasons'],['stored_metadata_requires_review'])

    def test_identical_duplicates_are_not_ambiguous_but_different_pairs_are(self):
        raw,data=source();del data['values_taxonomy']['meta']
        self.assertEqual(I.classify('7',data,[artifact(raw,'a'),artifact(raw,'b')])['state'],'recoverable_from_artifact')
        different=copy.deepcopy(raw);different['meta']['gl_cs'][0][1]=59
        self.assertEqual(I.classify('7',data,[artifact(raw),artifact(different,'b')])['reasons'],['conflicting_verified_sources'])

    def test_missing_and_invalid_values_have_explicit_states(self):
        self.assertEqual(I.classify('7',{})['state'],'not_vectorized')
        self.assertEqual(I.classify('7',{'values_taxonomy':{}})['state'],'not_vectorized')
        self.assertEqual(I.classify('7',{'values_taxonomy':{'domains':[]}})['reasons'],['invalid_flattened_layout'])
        _,data=source();del data['values_taxonomy']['meta']
        self.assertEqual(I.classify('7',data)['reasons'],['missing_grounding_and_retained_source'])
        data['values_taxonomy']['domains'][0]=10**1000
        self.assertEqual(I.classify('7',data)['reasons'],['invalid_flattened_layout'])

    def test_artifact_loader_is_bounded_strict_and_does_not_modify_sources(self):
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'source.json';raw,_=source();original=json.dumps({'7':raw}).encode();file.write_bytes(original)
            index,summaries=I.load_artifacts([file]);self.assertEqual(summaries[0]['entries'],1)
            self.assertEqual(index['7'][0]['raw'],raw);self.assertEqual(file.read_bytes(),original)
            self.assertIn('error',I.load_artifacts([file],max_bytes=5)[1][0])
            file.write_text('{"7":{},"7":{}}',encoding='utf-8')
            self.assertEqual(I.load_artifacts([file])[0],{})
            self.assertIn('error',I.load_artifacts([file])[1][0])
            self.assertEqual(I.load_artifacts([file.with_name('missing')])[1][0]['error'],'artifact_missing')

    def test_projection_pagination_and_report_redaction_with_no_write_interface(self):
        data={str(i):source(str(i))[1] for i in range(1,6)}
        private_id='PRIVATE_EMAIL@example.invalid';data[private_id]=dict(values_description='NEVER_PRINT_NARRATIVE')
        db=ReadOnlyDB(data)
        result=I.inventory(db,{},[],page_size=2)
        self.assertIn(('select',I.FIELDS),db.calls)
        self.assertEqual(result['scanned'],6);self.assertEqual(result['vectorized'],5)
        self.assertEqual(result['counts']['already_correct'],5)
        self.assertEqual(sum(c[0]=='get' for c in db.calls),4)
        self.assertEqual(result['production_writes'],0)
        text=json.dumps(result,allow_nan=False)
        for forbidden in ('DO_NOT_REPORT','Synthetic private narrative','PRIVATE_EMAIL','NEVER_PRINT_NARRATIVE','values_description','password','displayName'):
            self.assertNotIn(forbidden,text)
        self.assertTrue(any(r['uid'].startswith('id-sha256:') for r in result['rows']))

    def test_target_guard_never_silently_switches_live_and_emulator(self):
        self.assertEqual(I.check_target(I.LIVE_PROJECT,True,{}),'live_read_only')
        self.assertEqual(I.check_target('demo-inventory',False,{'FIRESTORE_EMULATOR_HOST':'127.0.0.1:8189'}),'emulator')
        for project,live,env in (
            (I.LIVE_PROJECT,False,{}),('wrong',True,{}),
            ('demo-x',True,{'FIRESTORE_EMULATOR_HOST':'localhost:8189'}),
            (I.LIVE_PROJECT,False,{'FIRESTORE_EMULATOR_HOST':'localhost:8189'}),
            ('demo-x',False,{'FIRESTORE_EMULATOR_HOST':'remote:8189'}),
            ('demo-x',False,{'FIRESTORE_EMULATOR_HOST':'localhost:70000'}),
        ):
            with self.assertRaises(ValueError):I.check_target(project,live,env)

    def test_report_is_atomic_and_does_not_overwrite_retained_data(self):
        with tempfile.TemporaryDirectory() as folder:
            target=Path(folder)/'report.json';I.save_report({'rows':[]},target)
            before=target.read_bytes()
            with self.assertRaises(FileExistsError):I.save_report({'rows':[1]},target)
            self.assertEqual(target.read_bytes(),before)
            invalid=Path(folder)/'invalid.json'
            with self.assertRaises(ValueError):I.save_report({'bad':float('nan')},invalid)
            self.assertFalse(invalid.exists())
            self.assertEqual(list(Path(folder).iterdir()),[target])


class RetainedListAndNullTests(unittest.TestCase):
    def test_list_source_and_explicit_null_groups_are_exactly_verified(self):
        raw,data=source(version='1.0')
        del data['values_taxonomy']['meta']
        data['values_taxonomy']['items']={f'd{i}':None for i in range(1,11)}
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'vectors.json';file.write_text(json.dumps([raw]),encoding='utf-8')
            index,summaries=I.load_artifacts([file])
            self.assertEqual(summaries[0]['format'],'raw_vector_list')
            before=copy.deepcopy(data)
            row=I.classify('7',data,index['7'])
            self.assertEqual(row['state'],'recoverable_from_artifact')
            self.assertEqual(row['verified_artifact_codecs'],['direct-null-items-1'])
            self.assertEqual(data,before)
            changed=copy.deepcopy(data);changed['values_taxonomy']['conflict_resolution'][0]=1
            self.assertEqual(I.classify('7',changed,index['7'])['reasons'],['artifact_values_mismatch'])

    def test_duplicate_list_uids_remain_conflicting_and_malformed_items_stay_unresolved(self):
        raw,data=source();del data['values_taxonomy']['meta']
        other=copy.deepcopy(raw);other['meta']['gl_cs'][0][0]=11
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'vectors.json';file.write_text(json.dumps([raw,other]),encoding='utf-8')
            index,_=I.load_artifacts([file])
            self.assertEqual(len(index['7']),2)
            self.assertEqual(I.classify('7',data,index['7'])['reasons'],['conflicting_verified_sources'])
        data['values_taxonomy']['items']['d6']=[1]*7
        row=I.classify('7',data,[artifact(raw)])
        self.assertEqual(row['reasons'],['invalid_flattened_layout'])
        self.assertEqual(row['retained_source_entries'],1)
