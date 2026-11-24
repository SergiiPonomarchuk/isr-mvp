import base64,json,os,struct,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import run_c3a_offline as R
from check_c3a_fixture import unpack,AuditError
import check_c3a_fixture as A
class FakeChild:
 pid=123
 returncode=0
 def poll(self):return None
 def terminate(self):self.returncode=-1
 def kill(self):self.returncode=-1
 def wait(self):return self.returncode
 def communicate(self,timeout=None):return b'{}',b''
class C3aSupervisor(unittest.TestCase):
 def test_limits_and_safe_environment(self):
  self.assertTrue(R.prerequisites({'ram':1024**3,'a_disk':4*1024**3,'c_disk':1024**3}))
  self.assertFalse(R.prerequisites({'ram':1024**3-1,'a_disk':4*1024**3,'c_disk':1024**3}))
  with patch.dict(os.environ,{'GOOGLE_APPLICATION_CREDENTIALS':'synthetic-test','GEMINI_API_KEY':'synthetic-test','FIRESTORE_EMULATOR_HOST':'synthetic-test'}):
   env=R.safe_env();self.assertEqual(env['C3A_OFFLINE'],'1');self.assertNotIn('GEMINI_API_KEY',env);self.assertNotIn('GOOGLE_APPLICATION_CREDENTIALS',env);self.assertNotIn('FIRESTORE_EMULATOR_HOST',env)
 def test_signed_zero_and_typed_unknown_refusal(self):
  zero=unpack(['number',base64.b64encode(struct.pack('>d',-0.)).decode()]);self.assertEqual(struct.pack('>d',zero),struct.pack('>d',-0.))
  with self.assertRaises(AuditError):unpack(['unknown',1])
 def test_memory_timeout_and_disk_refuse_owned_child(self):
  good={'ram':2*1024**3,'a_disk':8*1024**3,'c_disk':2*1024**3}
  with tempfile.TemporaryDirectory() as tmp:
   for memory,deadline,disk,expected in [(R.RSS_LIMIT+1,time.time()+10,0,'rss_limit'),(0,time.time()-1,0,'whole_fixture_timeout'),(0,time.time()+10,R.RUN_BYTES+1,'run_file_limit')]:
    with patch.object(R,'preflight',return_value=good),patch.object(R,'child_memory',return_value=memory),patch.object(R,'size',return_value=disk),patch.object(R.subprocess,'Popen',return_value=FakeChild()):
     result=R.run_child(['synthetic'],Path(tmp),Path(tmp),deadline,{},'test');self.assertEqual(result['status'],expected)
 def test_monitor_failure_refuses(self):
  good={'ram':2*1024**3,'a_disk':8*1024**3,'c_disk':2*1024**3}
  with tempfile.TemporaryDirectory() as tmp,patch.object(R,'preflight',return_value=good),patch.object(R,'child_memory',side_effect=RuntimeError('synthetic')),patch.object(R.subprocess,'Popen',return_value=FakeChild()):
   self.assertEqual(R.run_child(['synthetic'],Path(tmp),Path(tmp),time.time()+10,{},'test')['status'],'monitor_refused')
 def test_fixture_process_restarts_share_original_deadline(self):
  calls=[]
  def child(command,directory,run_dir,deadline,pins,mode):
   calls.append((mode,deadline))
   if mode=='candidate':
    count=sum(m=='candidate' for m,d in calls)
    if count==1:return {'mode':mode,'status':'refused','worker':{'code':'injected_crash'}}
    (directory/'candidate-result.json').write_text(json.dumps({'status':'completed'}))
    return {'mode':mode,'status':'completed','worker':{'result':{'comparison':{'status':'exact_node_parity'}}}}
   return {'mode':mode,'status':'completed','audit':{'complete':True}}
  with tempfile.TemporaryDirectory() as tmp,patch.object(R,'run_child',side_effect=child),patch.object(R,'reserve_independent',return_value=736):
   row=R.run_fixture({'id':'mock-restart','n':7},Path(tmp),{})
   self.assertEqual(row['status'],'completed');self.assertEqual(len(calls),5);self.assertEqual(len({d for m,d in calls}),1);self.assertEqual(len(row['stages'][2]['prior_processes']),1)
 def test_all_pinned_sources_exist_and_verify(self):
  pins=R.source_pins();self.assertIn('relevance_evaluator.py',pins);R.check_pins(pins)
 def test_independent_work_is_reserved_before_reads_and_never_refunded(self):
  with tempfile.TemporaryDirectory() as tmp:
   d=Path(tmp);p=d/'budget.json';state={'work':100,'limits':{'work':1000000,'scratch':536870912},'bytes':{'scratch':0}}
   p.write_text(json.dumps(state),encoding='utf-8');bound=R.reserve_independent(d,7);saved=json.loads(p.read_text(encoding='utf-8'))
   self.assertEqual(bound,736);self.assertEqual(saved['work'],836);self.assertEqual(saved['independent_reserved'],736)
   R.reserve_independent(d,7);self.assertEqual(json.loads(p.read_text(encoding='utf-8'))['work'],1572)
   saved['work']=999999;p.write_text(json.dumps(saved),encoding='utf-8');before=p.read_bytes()
   with self.assertRaisesRegex(RuntimeError,'audit_work_limit'):R.reserve_independent(d,7)
   self.assertEqual(p.read_bytes(),before)
 def test_independent_reader_refuses_before_over_budget(self):
  with patch.object(A,'READS',0),patch.object(A,'READ_LIMIT',1):
   A.charge_read();self.assertEqual(A.READS,1)
   with self.assertRaisesRegex(AuditError,'audit_work_limit'):A.charge_read()
   self.assertEqual(A.READS,1)
 def test_committed_matrix_exact_finite_count(self):
  cases=json.loads((R.EVIDENCE/'matrix.json').read_text(encoding='utf-8'));self.assertEqual(len(cases),24);self.assertEqual(len({c['id'] for c in cases}),24);self.assertTrue(all(c['n']<=9150 and c['refs']<=100 for c in cases))
 def test_e1_environment_and_exact_reviewed_schedule(self):
  env=R.safe_env(True,'data-before-index');self.assertEqual(env['C3A_E1'],'1');self.assertEqual(env['C3A_E1_HOOK'],'data-before-index')
  p=R.ROOT/'specs/tasks/M3-c3a-e1-evidence/admission.json';a=json.loads(p.read_text(encoding='utf-8'))
  old=json.loads((R.EVIDENCE/'matrix.json').read_text(encoding='utf-8'));self.assertEqual(len(a['cases']),12);self.assertTrue(all(c in old for c in a['cases']))
  self.assertEqual({x['hook'] for x in a['regressions']},{'reservation-before-data','data-before-index','index-before-checkpoint','checkpoint-before-seal'})
 def test_e1_monotonic_guard_refuses_even_if_epoch_deadline_is_future(self):
  good={'ram':2*1024**3,'a_disk':8*1024**3,'c_disk':2*1024**3}
  with tempfile.TemporaryDirectory() as tmp,patch.object(R,'preflight',return_value=good),patch.object(R,'child_memory',return_value=0),patch.object(R.subprocess,'Popen',return_value=FakeChild()):
   row=R.run_child(['synthetic'],Path(tmp),Path(tmp),time.time()+120,{},'test',e1=True,monotonic_end=time.monotonic()-1)
   self.assertEqual(row['status'],'whole_fixture_timeout')
 def test_e1_exit86_requires_bound_marker_and_reuses_original_deadline(self):
  calls=[]
  def child(command,directory,run_dir,deadline,pins,mode,**kw):
   calls.append((mode,deadline,kw['monotonic_end']))
   if mode=='candidate':
    if sum(m=='candidate' for m,d,clock in calls)==1:
     (directory/'e1-fault-injected.json').write_text(json.dumps({'stage':'data-before-index'}),encoding='utf-8')
     return {'mode':mode,'status':'child_refused','exit_code':86}
    (directory/'candidate-result.json').write_text(json.dumps({'status':'completed'}),encoding='utf-8')
    return {'mode':mode,'status':'completed','worker':{'result':{'comparison':{'status':'exact_node_parity'}}}}
   return {'mode':mode,'status':'completed','audit':{'complete':True}}
  with tempfile.TemporaryDirectory() as tmp,patch.object(R,'run_child',side_effect=child),patch.object(R,'reserve_independent',return_value=736):
   row=R.run_fixture({'id':'score-7-3','n':7},Path(tmp),{},e1=True,hook='data-before-index',case_id='e1-data-before-index')
   self.assertEqual(row['status'],'completed');self.assertTrue(row['fault_verified']);self.assertEqual(len({(d,c) for m,d,c in calls}),1)

if __name__=='__main__':unittest.main()
