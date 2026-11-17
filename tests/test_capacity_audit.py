"""Resource refusals must stop only the owned offline child, never bypass caps."""
import importlib.util,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import Mock,patch
spec=importlib.util.spec_from_file_location('capacity_audit',Path(__file__).resolve().parents[1]/'scripts/audit_capacity_phase_a.py')
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
class CapacitySupervisor(unittest.TestCase):
    def test_low_memory_starts_no_child(self):
        with patch.object(audit,'free_memory',return_value=1024),patch.object(audit.subprocess,'Popen') as launch:
            result=audit.run_case({'id':'test'},Path('.'),lambda:None)
        self.assertEqual(result['status'],'memory_prerequisite_refused');launch.assert_not_called()
    def refused_child(self,memory,timeout=120,clock=None):
        child=Mock(pid=123,returncode=0);child.poll.side_effect=[None,None,0]
        child.communicate.return_value=('','');child.wait.return_value=0
        with tempfile.TemporaryDirectory() as directory,patch.object(audit,'free_memory',return_value=2*1024**3),patch.object(audit,'child_memory',side_effect=memory),patch.object(audit.subprocess,'Popen',return_value=child),patch.object(audit.time,'monotonic',side_effect=clock or [0,1,2,3]):
            result=audit.run_case({'id':'test'},Path(directory),lambda:None,timeout=timeout)
        child.terminate.assert_called_once();return result
    def test_rss_ceiling_terminates_owned_child(self):
        self.assertEqual(self.refused_child([audit.RSS_LIMIT+1])['status'],'rss_limit_refused')
    def test_timeout_terminates_owned_child(self):
        self.assertEqual(self.refused_child([100],timeout=120,clock=[0,121,122])['status'],'timeout_refused')
    def test_unverifiable_child_memory_refuses(self):
        self.assertEqual(self.refused_child([RuntimeError('unreadable')])['status'],'resource_monitor_refused')
    def test_matrix_has_largest_and_join_source_shapes(self):
        cases=audit.matrix();self.assertEqual(len({c['id'] for c in cases}),len(cases))
        self.assertTrue(any(c['members']==9150 and c['refs']==100 and c.get('distinct') for c in cases))
        self.assertTrue(any(c.get('dense') for c in cases));self.assertTrue(any(c.get('metadataStress') for c in cases))
