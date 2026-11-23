import ast, contextlib, copy, datetime as dt, hashlib, io, json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import audit_db_completeness as A

def user():return {'uid':1,'birthDate':'1990-01-01','skills':[{'id':2,'type':'education','educationLevel':'Bachelor','specialization':'IT'}],'post':[{'job':'Engineer'}],'features':[],'geography':[{'type':'home','geo':[47.5,7.5]}],'socialRelations':[],'values_description':None}
def vector():
 u=user();texts=A.T.skill_texts(u);texts['profile']=A.T.profile_text(u)
 return {'uid':1,'profile_vector':[1.0]+[0.0]*767,'experience_vectors':{'2':[1.0]+[0.0]*767},'embedding_model':A.AI.EMBED_MODEL,'embedding_dims':768,'embedding_template':A.T.VERSION,'embedding_task_type':A.AI.TASK_TYPE_DOCUMENT,'embedding_text_sha256':{k:hashlib.sha256(t.encode()).hexdigest() for k,t in texts.items()}}
class Snap:
 def __init__(self,uid,data):self.id=uid;self.data=data;self.update_time=dt.datetime(2026,11,23,tzinfo=dt.timezone.utc)
 def to_dict(self):return copy.deepcopy(self.data)
class Query:
 def __init__(self,db,path):self.db=db;self.path=path;self.fields=None;self.n=None;self.after=None
 def select(self,fields):self.fields=tuple(fields);self.db.reads.append((self.path,self.fields));return self
 def order_by(self,key):assert key=='__name__';return self
 def limit(self,n):q=copy.copy(self);q.n=n;return q
 def start_after(self,snap):q=copy.copy(self);q.after=snap.id;return q
 def get(self,timeout):
  return [Snap(uid,{k:v for k,v in data.items() if k in self.fields}) for uid,data in sorted(self.db.docs.get(self.path,{}).items()) if self.after is None or uid>self.after][:self.n]
 def document(self,uid):return Parent(self.db,self.path+'/'+uid)
class Parent:
 def __init__(self,db,path):self.db=db;self.path=path
 def collection(self,name):return Query(self.db,self.path+'/'+name)
class DB:
 def __init__(self,docs=None):self.docs=docs or {};self.reads=[]
 def collection(self,name):return Query(self,name)
class Tests(unittest.TestCase):
 def test_schema_and_empty_coverage_are_not_loss(self):
  u=user();u['skills']=[];u['post']=[]
  self.assertEqual(A.profile_problems('1',u),[])
  self.assertEqual(A.profile_problems('sentinel',{}),['nonparticipant_profile'])
 def test_malformed_profile_and_links(self):
  u=user();u.update(uid=True,birthDate='nonsense',geography=[{'geo':[200,1]}],socialRelations=[{'relative':1,'x_eligible':1}]);u['skills']*=2
  p=A.profile_problems('1',u)
  for x in ('uid_mismatch','invalid_birth_date','invalid_anchor_coordinates','duplicate_skill_id','self_relation','invalid_x_flag'):self.assertIn(x,p)
 def test_embedding_current_and_hash_freshness(self):
  u=user();v=vector();self.assertEqual(A.embedding_problems('1',u,v),[])
  u['skills'][0]['specialization']='Medicine';self.assertIn('embedding_source_hash_mismatch',A.embedding_problems('1',u,v))
 def test_embeddings_strict_numeric_dimensions_and_coverage(self):
  u=user();v=vector();v['profile_vector'][0]=True;v['experience_vectors']={}
  self.assertIn('invalid_profile_vector',A.embedding_problems('1',u,v));self.assertIn('missing_skill_vector',A.embedding_problems('1',u,v))
  v=vector();v['profile_vector'][0]=float('nan');self.assertFalse(A.valid_vector(v['profile_vector']))
  self.assertFalse(A.valid_vector([0]*768));self.assertFalse(A.valid_vector([1]*767))
 def test_missing_and_extra_embeddings(self):
  self.assertEqual(A.embedding_problems('1',user(),None),['missing_embedding_document'])
  v=vector();v['experience_vectors']['extra']=[1]*768;self.assertIn('extra_skill_vector',A.embedding_problems('1',user(),v))
 def test_root_and_projection_allowlist_and_pagination(self):
  db=DB({'users':{str(i):user() for i in range(7)}})
  self.assertEqual(len(list(A.pages(db,'users',2))),7)
  self.assertEqual(db.reads,[('users',A.FIELDS['users'])])
  for path in ('private','issue_vectors','user_packs','config'):
   with self.assertRaises(ValueError):list(A.pages(db,path,2))
  for n in (True,0,501):
   with self.assertRaises(ValueError):list(A.pages(db,'users',n))
 def test_only_approved_message_path(self):
  db=DB({'discussions/7/messages':{'1':{'sender_uid':1,'password':'never-read'}}})
  s=list(A.pages(db,'discussions__messages',2,'7'))[0]
  self.assertEqual(s.to_dict(),{'sender_uid':1})
  with self.assertRaises(ValueError):list(A.pages(db,'users',2,'7'))
 def test_duplicate_page_is_rejected(self):
  class Broken(Query):
   def get(self,timeout):return [Snap('1',{}),Snap('1',{})]
  class BrokenDB(DB):
   def collection(self,name):return Broken(self,name)
  with self.assertRaises(ValueError):list(A.pages(BrokenDB(),'users',2))
 def test_audit_counts_references_and_no_content_leak(self):
  u=user();u['email']='PRIVATE_EMAIL_SENTINEL';u['values_description']='PRIVATE_NARRATIVE_SENTINEL';u['socialRelations']=[{'relative':999}]
  db=DB({'users':{'1':u},'user_vectors':{'1':vector()},'microcommunities':{'p':{'issue_id':'missing','member_count':8}},'microcommunity_members':{'m':{'user_id':'999','microcommunity_id':'p','isr_score':0.4}},'discussions':{'7':{'message_count':2}},'discussions/7/messages':{'1':{'sender_uid':1}}})
  r=A.audit(db,{},[],page_size=2);text=json.dumps(r)
  for x in ('PRIVATE_EMAIL_SENTINEL','PRIVATE_NARRATIVE_SENTINEL','Engineer','IT','47.5'):self.assertNotIn(x,text)
  self.assertEqual(r['counts']['users'],1)
  for x in ('relation_target_missing','topic_target_missing','member_count_mismatch','user_target_missing','message_count_mismatch'):self.assertIn(x,r['finding_counts'])
  self.assertEqual(r['observations']['pending_x_flag_links'],1)
  self.assertFalse(any(x['reason']=='missing_x_flag' for x in r['findings']))
  for path,fields in db.reads:
   key='discussions__messages' if '/messages' in path else path
   self.assertEqual(fields,A.FIELDS[key]);self.assertFalse(set(fields)&{'email','password','firstName','lastName','displayName'})
 def test_backup_changes_are_review_candidates(self):
  old={'1':{'fields':A.summarize({'uid':1,'skills':[1]},('uid','skills'))},'2':{'fields':{}}}
  new={'1':{'fields':A.summarize({'uid':1,'skills':[]},('uid','skills'))},'3':{'fields':{}}}
  r=A.compare_backup(new,old);self.assertEqual(r['missing_documents_review'],['2']);self.assertEqual(r['added_documents'],['3']);self.assertEqual(r['previously_populated_now_empty_review'],[{'id':'1','fields':['skills']}])
 def archive(self,folder,record=None,count=1):
  manifest={'project':A.I.LIVE_PROJECT,'script':'scripts/backup_firestore.py (R0)','finished_utc':'2026-11-14T00:00:00Z','documents':{'users':count},'total':count}
  (folder/'manifest.json').write_text(json.dumps(manifest));(folder/'users.jsonl').write_text(json.dumps(record or {'path':'users/1','data':{'uid':1,'email':'PRIVATE_BACKUP_SENTINEL','skills':[]}})+'\n')
 def test_backup_redaction_hash_receipt_and_path_guard(self):
  with tempfile.TemporaryDirectory() as d:
   folder=Path(d);self.archive(folder);rows,receipt=A.backup_index(folder)
   self.assertNotIn('PRIVATE_BACKUP_SENTINEL',json.dumps([rows,receipt]));self.assertEqual(receipt['files']['users']['documents'],1)
   self.archive(folder,{'path':'private/1','data':{}})
   with self.assertRaises(ValueError):A.backup_index(folder)
 def test_backup_count_and_duplicate_keys_fail_closed(self):
  with tempfile.TemporaryDirectory() as d:
   folder=Path(d);self.archive(folder,count=2)
   with self.assertRaises(ValueError):A.backup_index(folder)
  with self.assertRaises(ValueError):A.G_json('{"a":1,"a":2}')
 def test_canonical_backup_vector_matches_live_shape(self):
  class Vector:
   def __iter__(self):return iter([1.0,0.0])
  self.assertEqual(A.summary(Vector()),A.summary({'__type':'vector','values':[1.0,0.0]}))
 def test_cli_rejects_target_without_sdk_and_redacts_errors(self):
  with tempfile.TemporaryDirectory() as d:
   output=io.StringIO()
   with contextlib.redirect_stderr(output):code=A.main(['--project','unapproved','--report',str(Path(d)/'r.json')])
   self.assertEqual(code,1);self.assertEqual(json.loads(output.getvalue())['error_class'],'ValueError')
 def test_no_database_write_or_provider_surface(self):
  tree=ast.parse(Path(A.__file__).read_text())
  calls=[n.func.attr for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and not (n.func.attr=='update' and isinstance(n.func.value,ast.Name) and n.func.value.id=='h')]
  self.assertFalse(set(calls)&{'set','update','delete','commit','batch','transaction','generate_content','embed_content'})

if __name__=='__main__':unittest.main()
