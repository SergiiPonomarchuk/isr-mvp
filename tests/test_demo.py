import copy
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import demo_common as C
import prepare_demo as P
import check_demo as V
import demo_runtime as D
import subprocess

def content(number=1):
    return {'title':f'Synthetic case {number}','description':'A concrete fictional local problem.',
        'messages':[{'author':'creator','text':'Here is the problem.'},{'author':'member','text':'I can help.'}],
        'options':[{'title':f'Option {i}','budget':'100 synthetic units','funding_source':'Synthetic association',
            'resources_needed':['A volunteer'],'steps':['Coordinate the agreed work.']} for i in (1,2)]}

class DemoGuards(unittest.TestCase):
    def test_target_never_silently_switches_between_live_and_emulator(self):
        with patch.dict(os.environ,{'FIRESTORE_EMULATOR_HOST':'127.0.0.1:8285'}):
            self.assertEqual(C.target('demo-d1')['emulator'],'127.0.0.1:8285')
            for action in (lambda:C.target('demo-d1',True),lambda:C.target('demo-d1',functions_url='https://live.example'),lambda:C.target('')):
                with self.assertRaises(ValueError):action()
        with patch.dict(os.environ,{'FIRESTORE_EMULATOR_HOST':''}):
            with self.assertRaises(ValueError):C.target('production')
            self.assertEqual(C.target('production',True)['functions_url'],'https://us-central1-production.cloudfunctions.net')
            with self.assertRaises(ValueError):C.target('production',True,'https://other.cloudfunctions.net')

    def test_concurrent_journal_writer_is_refused_without_spending_or_overwriting(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json'
            with C.exclusive(path):
                with self.assertRaises(ValueError):
                    with C.exclusive(path):self.fail('second writer acquired the same journal')
            self.assertFalse(path.with_name(path.name+'.lock').exists())

    def test_atomic_journal_replaces_previous_complete_value(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json';C.save_json(path,{'stage':'checked','draft_id':'saved'})
            C.save_json(path,{'stage':'created','draft_id':'saved','issue_id':'one'})
            self.assertEqual(C.load_json(path)['issue_id'],'one')
            self.assertFalse(path.with_name(path.name+'.tmp').exists())

    def test_stored_generation_reuses_results_and_ceiling_is_durable(self):
        document={'creators':{f'D1-{i:02}':{'anchor':'Synthetic building'} for i in range(1,11)},
            'scenarios':{},'usage':{'requests':0}}
        calls=[]
        def generate(subject,*args):calls.append(subject[0]);return content(subject[0]),{'model':'fixture'}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'content.json'
            P.generate_missing(document,path,'unused',generate)
            original=path.read_bytes();self.assertEqual(len(calls),10)
            P.generate_missing(document,path,'unused',generate)
            self.assertEqual(len(calls),10);self.assertEqual(path.read_bytes(),original)
            limited=copy.deepcopy(document);limited['scenarios'].pop('D1-10');limited['usage']['requests']=20
            with self.assertRaises(ValueError):P.generate_missing(limited,path,'unused',generate)
            self.assertEqual(len(calls),10)

    def test_generator_failure_reserves_request_before_dispatch(self):
        document={'creators':{'D1-01':{'anchor':'Synthetic building'}},'scenarios':{},'usage':{'requests':0}}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'content.json'
            def broken(*args):raise OSError('simulated truncation')
            with self.assertRaises(OSError):P.generate_missing(document,path,'unused',broken)
            saved=C.load_json(path);self.assertEqual(saved['usage']['requests'],1);self.assertEqual(saved['pending_request'],'D1-01')

    def test_private_loader_passes_dummy_key_only_in_process_memory(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'scripts').mkdir()
            (root/'scripts/gemini_api.py').write_text("def load_key():return 'fixture-private-value'",encoding='utf8')
            command=[sys.executable,'-c',"import os; assert os.environ['GEMINI_API_KEY']=='fixture-private-value'; print('loader_ok')"]
            import json
            result=subprocess.run([sys.executable,'-c',D.BOOTSTRAP,str(root),json.dumps(command)],capture_output=True,text=True)
            self.assertEqual(result.returncode,0);self.assertEqual(result.stdout.strip(),'loader_ok')
            self.assertNotIn('fixture-private-value',result.stdout+result.stderr)
            self.assertFalse(list(root.rglob('.secret.local')))

    def test_bad_content_cannot_reach_seed(self):
        invalid=content();invalid['options'][0]['steps']=[]
        with self.assertRaises(ValueError):P.validate_scenario(invalid)

    def test_independent_member_checker_detects_tampered_relevance_and_expertise(self):
        user={'uid':1,'birthDate':'1990-01-01','skills':[],'geography':[{'type':'home','geo':[47,7]}]}
        vectors={'profile_vector':[1,0],'experience_vectors':{}}
        issue={'created_at':'2026-11-14','location':[47,7],'mu_distance_meters':50,'sigma_decay_meters':20,
            'w_demographic':0.5,'w_geographic':0.5,'w_semantic':0,'w_social':0}
        member={'D_score':1,'G_score':1,'S_score':0,'X_score':0,'relevance_score':1,
            'education_expertise':1,'experience_expertise':0,'expertise_score':1}
        self.assertEqual(V.compare_member(user,vectors,member,issue,[1,0],{}),[])
        member['relevance_score']=0.9;member['expertise_score']=4
        self.assertEqual(set(V.compare_member(user,vectors,member,issue,[1,0],{})),{'relevance_score','expertise_score'})

if __name__=='__main__':unittest.main()
