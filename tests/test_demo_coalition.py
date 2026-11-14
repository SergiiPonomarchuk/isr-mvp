import contextlib,io,json,os,sys,tempfile,types,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import demo_coalition as helper
class CoalitionWrapperTests(unittest.TestCase):
 def manifest(self):
  return {'project':'demo-test','run_id':'r','presentation_started':True,'scenarios':{'D1-01-live':{'stage':'complete','phase':'live','issue_id':'i','microcommunity_id':'p','creator':{'uid':'2'},'input':{'title':'T','description':'D'},'created_at':'2026-11-14T10:00:00Z','content':{'options':[]}}}}
 def test_binding_pins_explicit_target_and_normal_flagship(self):
  result=helper.binding_from(self.manifest(),{'project':'demo-test','emulator':'127.0.0.1:8187'})
  self.assertEqual(result['creator'],'2');self.assertEqual(result['target'],'emulator:127.0.0.1:8187')
 def test_missing_or_mocked_live_execution_refused(self):
  for change in [lambda p:p.update(presentation_started=False),lambda p:p.update(test_fixture=True),lambda p:p['scenarios'].clear()]:
   p=self.manifest();change(p)
   with self.assertRaises(ValueError):helper.binding_from(p,{'project':'demo-test','emulator':None})
 def test_live_access_requires_acknowledgement_before_node(self):
  with patch.dict(os.environ,{},clear=True),patch.object(helper.subprocess,'run') as run:
   with self.assertRaises(ValueError):helper.main(['--project','demo-test','--manifest','missing','--plan','missing','--make-plan'])
   run.assert_not_called()
 def test_existing_plan_is_not_overwritten_and_manifest_stays_unchanged(self):
  with tempfile.TemporaryDirectory() as folder:
   manifest=Path(folder)/'manifest.json';plan=Path(folder)/'plan.json';raw=json.dumps(self.manifest());manifest.write_text(raw);plan.write_text('original')
   with patch.dict(os.environ,FIRESTORE_EMULATOR_HOST='127.0.0.1:8187'),patch.object(helper.subprocess,'run') as run:
    with self.assertRaises(ValueError):helper.main(['--project','demo-test','--manifest',str(manifest),'--plan',str(plan),'--make-plan'])
    run.assert_not_called()
   self.assertEqual(plan.read_text(),'original');self.assertEqual(manifest.read_text(),raw);self.assertFalse(Path(str(plan)+'.lock').exists())
 def test_apply_requires_operation_and_paths_cannot_alias(self):
  with patch.dict(os.environ,FIRESTORE_EMULATOR_HOST='127.0.0.1:8187'):
   with self.assertRaises(SystemExit):helper.main(['--project','demo-test','--manifest','same','--plan','same','--make-plan'])
   with self.assertRaises(SystemExit):helper.main(['--project','demo-test','--manifest','a','--plan','b','--make-plan','--apply'])
 def test_plan_is_durable_dry_run_does_not_mutate_and_apply_records_receipt(self):
  with tempfile.TemporaryDirectory() as folder:
   manifest=Path(folder)/'manifest.json';plan=Path(folder)/'plan.json';raw=json.dumps(self.manifest());manifest.write_text(raw)
   def run(command,**kwargs):
    request=json.loads(kwargs['input']);data={'summary':{'writes':int(request['apply'])}}
    if request['operation']=='make-plan':data['plan']={'fixture':'bounded'}
    return types.SimpleNamespace(returncode=0,stdout=json.dumps(data),stderr='')
   args=['--project','demo-test','--manifest',str(manifest),'--plan',str(plan)]
   with patch.dict(os.environ,FIRESTORE_EMULATOR_HOST='127.0.0.1:8187'),patch.object(helper.subprocess,'run',side_effect=run),patch.object(helper.subprocess,'check_output',return_value='source-test'),contextlib.redirect_stdout(io.StringIO()):
    helper.main(args+['--make-plan']);original=plan.read_bytes();helper.main(args+['--operation','start-support']);self.assertEqual(plan.read_bytes(),original)
    helper.main(args+['--operation','start-support','--apply'])
   self.assertEqual(manifest.read_text(),raw);self.assertEqual(json.loads(plan.read_text())['receipts'],[{'writes':1}])
 def test_explicit_live_acknowledgement_is_forwarded_to_node_without_real_sdk_call(self):
  with tempfile.TemporaryDirectory() as folder:
   manifest=Path(folder)/'manifest.json';plan=Path(folder)/'plan.json';manifest.write_text(json.dumps(self.manifest()))
   def run(command,**kwargs):
    self.assertEqual(command[-1],'--i-know-this-is-live');self.assertNotIn('GEMINI_API_KEY',kwargs['env']);request=json.loads(kwargs['input']);self.assertEqual(request['binding']['target'],'live:demo-test');self.assertFalse(request['apply'])
    return types.SimpleNamespace(returncode=0,stdout=json.dumps({'plan':{},'summary':{'writes':0}}),stderr='')
   with patch.dict(os.environ,{'GEMINI_API_KEY':'dummy-unused-value'},clear=True),patch.object(helper.subprocess,'run',side_effect=run),patch.object(helper.subprocess,'check_output',return_value='source-test'),contextlib.redirect_stdout(io.StringIO()):
    helper.main(['--project','demo-test','--i-know-this-is-live','--manifest',str(manifest),'--plan',str(plan),'--make-plan'])
if __name__=='__main__':unittest.main()
