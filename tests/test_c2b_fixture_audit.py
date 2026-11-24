import copy,importlib.util,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
try:
 spec=importlib.util.spec_from_file_location('c2b_audit',ROOT/'scripts/check_c2b_fixture.py');audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
finally:sys.path.pop(0)
def report():
 cases=[]
 for n in [2,7,17]:
  gen={'publication_version':'c2b-emulator-1','member_count':n+1};tally={'scores':[1.0],'counted':[{'uid':'1','option':0,'weight':1.0}],'excluded':[],'winner':0,'note':'','generation':gen}
  step={'step':'Call','in_charge_uid':'1','in_charge_name':'Synthetic resident 1','deadline':None}
  cases.append({'members':n,'joined_members':n+1,'audit':{'members':[{'uid':str(i+1),'isr':1.0} for i in range(n+1)],'votes':{'1':0},'options':[{'description':[step]}],'tally':tally,'tasks':[copy.deepcopy(step)],'winner':0,'generation':gen}})
 return {'status':'completed','version':'c2b-emulator-1','cases':cases}
class FixtureAudit(unittest.TestCase):
 def test_exact_supplied_votes_tasks_pass(self):self.assertEqual(audit.check(report()),[])
 def test_changed_scores_membership_and_assignment_refuse(self):
  for edit,code in [(lambda a:a['tally']['scores'].__setitem__(0,1.001),'scores'),(lambda a:a['members'].append(a['members'][0]),'membership'),(lambda a:a['tasks'][0].__setitem__('in_charge_uid','99'),'tasks')]:
   r=copy.deepcopy(report());edit(r['cases'][0]['audit']);self.assertTrue(any(p.endswith(':'+code) for p in audit.check(r)))
 def test_failed_or_unknown_report_does_not_pass(self):
  r=report();r['status']='failed';self.assertEqual(audit.check(r),['report_incomplete']);r=report();r['version']='future';self.assertEqual(audit.check(r),['format_unknown'])
