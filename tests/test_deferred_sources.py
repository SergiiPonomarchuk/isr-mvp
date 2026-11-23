import copy, hashlib, json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import audit_deferred_sources as D
from test_grounding_inventory import source

class DeferredTests(unittest.TestCase):
 def fixture(self):
  raw,u=source(version='1.0');uid=str(raw['meta']['uid'])
  return uid,{k:u[k] for k in D.I.FIELDS}

 def test_exact_grounding_requires_hash_and_values(self):
  uid,u=self.fixture();self.assertEqual(D.evidence(uid,u,u)['state'],'verified_grounding_same_values')
  h=copy.deepcopy(u);h['values_taxonomy']['domains'][0]=99
  self.assertEqual(D.evidence(uid,u,h)['state'],'grounding_present_but_values_differ')
 def test_wrong_narrative_hash_or_missing_grounding_never_recovered(self):
  uid,u=self.fixture();h=copy.deepcopy(u);h['values_taxonomy']['meta']['hash']='0'*40
  self.assertEqual(D.evidence(uid,u,h)['reason'],'narrative_hash_mismatch')
  h=copy.deepcopy(u);h['values_taxonomy'].pop('meta')
  self.assertEqual(D.evidence(uid,u,h)['reason'],'metadata_absent')
  self.assertEqual(D.evidence(uid,u,None)['state'],'profile_not_in_archive')
 def test_evidence_is_redacted(self):
  uid,u=self.fixture();r=D.evidence(uid,u,u)
  self.assertNotIn('Synthetic private narrative',json.dumps(r));self.assertNotIn('values_taxonomy',r)
 def test_archive_users_only_and_count_guard(self):
  uid,u=self.fixture()
  with tempfile.TemporaryDirectory() as d:
   folder=Path(d);manifest={'project':D.I.LIVE_PROJECT,'script':'scripts/backup_firestore.py (R0)','finished_utc':'2026-11-14','documents':{'users':1,'private':999}}
   (folder/'manifest.json').write_text(json.dumps(manifest));(folder/'users.jsonl').write_text(json.dumps({'path':'users/'+uid,'data':{**u,'email':'PRIVATE'}})+'\n')
   rows=D.archives([folder],{uid:u});self.assertEqual(len(rows),1);self.assertNotIn('PRIVATE',json.dumps(rows))
   manifest['documents']['users']=2;(folder/'manifest.json').write_text(json.dumps(manifest))
   with self.assertRaises(ValueError):D.archives([folder],{uid:u})

if __name__=='__main__':unittest.main()
