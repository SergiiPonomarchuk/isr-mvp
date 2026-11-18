"""C1 report output is exclusive and resource refusal starts no child."""
import importlib.util,json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
try:
    spec=importlib.util.spec_from_file_location('c1_runner',ROOT/'scripts/run_generation_protocol.py');runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
finally:sys.path.pop(0)
class ProtocolRunner(unittest.TestCase):
    def test_outside_output_refused_before_child(self):
        with tempfile.TemporaryDirectory() as directory,patch.object(sys,'argv',['runner','--out',str(Path(directory)/'outside')]),patch.object(runner.subprocess,'Popen') as child:
            with self.assertRaises(ValueError):runner.main()
            child.assert_not_called();self.assertFalse((Path(directory)/'outside').exists())
    def test_low_memory_starts_no_child_and_existing_output_is_immutable(self):
        parent=ROOT/'specs/tasks/M3-generation-protocol';parent.mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory(dir=parent) as directory:
            self.assertTrue(Path(directory).resolve().is_relative_to(parent.resolve()));out=Path(directory)/'run'
            with patch.object(sys,'argv',['runner','--out',str(out)]),patch.object(runner,'free_memory',return_value=1),patch.object(runner.subprocess,'Popen') as child:
                with self.assertRaises(SystemExit):runner.main()
                report=(out/'report.json').read_bytes();self.assertEqual(json.loads(report)['status'],'memory_prerequisite_refused');child.assert_not_called()
                with self.assertRaises(FileExistsError):runner.main()
                self.assertEqual((out/'report.json').read_bytes(),report);child.assert_not_called()
