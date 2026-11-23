"""The C2a supervisor refuses wrong targets and cannot overwrite evidence."""
import importlib.util,json,os,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
try:
    spec=importlib.util.spec_from_file_location('c2a_runner',ROOT/'scripts/run_c2a_emulator.py');runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
finally:sys.path.pop(0)
class C2aRunner(unittest.TestCase):
    def test_wrong_target_starts_no_child_or_output(self):
        out=ROOT/'specs/tasks/M3-c2a-evidence/refused-target'
        with patch.object(sys,'argv',['runner','--out',str(out)]),patch.dict(os.environ,{'C2A_EMULATOR_TESTS':'0'}),patch.object(runner.subprocess,'Popen') as child:
            with self.assertRaises(ValueError):runner.main()
            child.assert_not_called();self.assertFalse(out.exists())
    def test_low_memory_and_existing_evidence_refuse(self):
        parent=ROOT/'specs/tasks/M3-c2a-evidence';parent.mkdir(parents=True,exist_ok=True)
        target={'C2A_EMULATOR_TESTS':'1','GCLOUD_PROJECT':'demo-c2a-publication','FIRESTORE_EMULATOR_HOST':'127.0.0.1:8190'}
        with tempfile.TemporaryDirectory(dir=parent) as directory:
            out=Path(directory)/'run'
            with patch.object(sys,'argv',['runner','--out',str(out)]),patch.dict(os.environ,target),patch.object(runner,'free_memory',return_value=1),patch.object(runner.subprocess,'Popen') as child:
                with self.assertRaises(SystemExit):runner.main()
                report=(out/'report.json').read_bytes();self.assertEqual(json.loads(report)['status'],'memory_prerequisite_refused');child.assert_not_called()
                with self.assertRaises(FileExistsError):runner.main()
                self.assertEqual((out/'report.json').read_bytes(),report);child.assert_not_called()
