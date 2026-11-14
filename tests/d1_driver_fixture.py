"""Only the Node D1 emulator integration invokes this mocked-content driver."""
import copy
import json
import os
from pathlib import Path
import sys
import tempfile
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import demo_common as C
import seed_demo as S
import check_demo as V
import demo_presenter as Presenter
from google.cloud import firestore
assert os.environ['FIRESTORE_EMULATOR_HOST']=='127.0.0.1:8285'
assert os.environ['GCLOUD_PROJECT']=='demo-d1'
db=firestore.Client(project='demo-d1');t=C.target('demo-d1',functions_url=sys.argv[1])
content={'version':'d1-content-v1','test_fixture':True,'creators':{},'scenarios':{}}
for i in range(1,11):
 key=f'D1-{i:02}';uid=str(i);u=db.collection('users').document(uid).get().to_dict()
 content['creators'][key]={'uid':uid,'name':u['displayName'],'location':u['geography'][0]['geo'],'anchor':u['geography'][0]['building']}
 content['scenarios'][key]={'title':f'Demo case {i} at osbb {i} h1','description':f'A distinct synthetic issue in building {i}.','purpose':f'Fixture scenario {i}',
  'messages':[{'author':'creator','text':'A concrete local problem.'},{'author':'member','text':'Let us compare options.'}],
  'options':[{'title':f'Approach {j}','budget':'100 synthetic units','funding_source':'Synthetic association',
   'resources_needed':['Volunteer time'],'steps':[f'Coordinate approach {j}.']} for j in (1,2)]}
with tempfile.TemporaryDirectory() as folder:
 path=Path(folder)/'manifest.json';plan=S.make_plan(db,content,'fixture-run','demo-d1');save=lambda value:C.save_json(path,value);save(plan)
 dry=S.run_seed(db,plan,t,save,False);assert dry['writes']==dry['requests']==0
 assert db.collection('discussions').document('legacy-only').get().to_dict()['status']=='discussion'
 # Lose the first successful Create response: recover the same server draft on resume.
 interrupted=[False]
 def request(target,name,body):
  result=C.call(target,name,body)
  if name=='createIssue' and not interrupted[0]:interrupted[0]=True;raise OSError('simulated lost response')
  return result
 try:S.run_seed(db,plan,t,save,True,request=request)
 except OSError:pass
 else:raise AssertionError('failure injection did not run')
 assert plan['scenarios']['D1-01'].get('draft_id') and not plan['scenarios']['D1-01'].get('issue_id')
 report=S.run_seed(db,plan,t,save,True);assert report['validation']['problems']==[],report
 repeated=S.run_seed(db,plan,t,save,True);assert repeated['writes']==repeated['requests']==0
 repeated_dry=S.run_seed(db,plan,t,save,False);assert repeated_dry['archive_documents']==0 and repeated_dry['scenarios_left']==0
 assert len(list(db.collection('issues').stream()))==11
 validation=V.check_plan(db,plan);assert validation['scenarios']==10 and validation['visible_scenarios_before_flagship']==9
 # Tamper one member; read-only validation must identify the numeric drift.
 public=plan['scenarios']['D1-02']['microcommunity_id']
 row=next(db.collection('microcommunity_members').where('microcommunity_id','==',public).stream());old=row.to_dict()['isr_score']
 row.reference.update({'isr_score':old+0.2});assert V.check_plan(db,plan)['problems'];row.reference.update({'isr_score':old})
 assert not V.check_plan(db,plan)['problems']
 old_message=db.collection('discussions').document('legacy-only').collection('messages').document('duplicate-a')
 old_message.update({'text':'tampered history'});assert 'legacy messages changed: legacy-only' in V.check_plan(db,plan)['problems']
 old_message.update({'text':'Preserved duplicate'});assert not V.check_plan(db,plan)['problems']
 assert plan['usage']['checks']==10
 # Record the normally-created flagship without a document-id/console step.
 source=plan['scenarios']['D1-01']['input']
 actual=C.call(t,'checkIssue',source)
 created=C.call(t,'createIssue',{**source,'location':actual['location'],'draftId':actual['draftId']})
 Presenter.record_flagship(db,plan,'auto');save(plan)
 presented=V.check_plan(db,plan);assert not presented['problems'],presented
 assert presented['visible_scenarios_before_flagship']==10
 assert plan['scenarios']['D1-01-live']['issue_id']==created['issue_id']
 try:S.run_seed(db,plan,t,save,True)
 except ValueError:pass
 else:raise AssertionError('presentation-started manifest was reseeded')
 # Leave no active normal copy before the Node-side activation/race checks.
 cleanup=db.batch();cleanup.update(db.collection('issues').document(created['issue_id']),{'status':'archived'})
 cleanup.update(db.collection('discussions').document(created['issue_id']),{'status':'archived'});cleanup.commit()
 print('D1_DRIVER_VERIFIED',json.dumps(validation))
