"""Offline independent C3a synthetic stream audit; no source exports or database client."""
import argparse,base64,hashlib,json,math,struct,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MAX=9151
TOL=.00100001
class AuditError(Exception):pass
def require(ok,code):
 if not ok:raise AuditError(code)
def unpack(x):
 require(isinstance(x,list) and 1<=len(x)<=2,'typed_shape');t=x[0];v=x[1] if len(x)==2 else None
 if t=='null' and len(x)==1:return None
 if t in ('string','boolean'):return v
 if t=='number':
  b=base64.b64decode(v,validate=True);require(len(b)==8,'typed_number');n=struct.unpack('>d',b)[0];require(math.isfinite(n),'typed_finite');return n
 if t=='date':return v
 if t=='array':return [unpack(vv) for vv in v]
 if t=='object':
  out={}
  for k,vv in v:require(k not in out,'duplicate_key');out[k]=unpack(vv)
  return out
 raise AuditError('typed_version')
class Store:
 def __init__(self,d,name,raw=False):self.data=open(d/(name+'.data'),'rb');self.index=open(d/(name+'.index'),'rb');self.raw=raw
 def get(self,i):
  require(type(i)==int and 0<=i<=200000,'index_id');self.index.seek(i*16);b=self.index.read(16)
  if not b or b[12:]==bytes(4):return None
  require(len(b)==16,'index_size');at,n,magic=struct.unpack('>QII',b);require(magic==0x43334131 and 0<n<=12*1024**2,'index_shape');self.data.seek(at);b=self.data.read(n);require(len(b)==n,'frame_missing');x=json.loads(b);e=x['encoded'];require(hashlib.sha256(e.encode()).hexdigest()==x['hash'],'frame_hash');self.last_hash=x['hash'];v=json.loads(e);return v if self.raw else unpack(v)
 def close(self):self.data.close();self.index.close()
def load(d,name):return unpack(json.loads((d/(name+'.json')).read_text(encoding='utf-8')))
def ids(n,p=''):
 for digit in range(0 if p else 1,10):
  s=p+str(digit);v=int(s)
  if v>n:break
  yield s
  if v*10<=n:yield from ids(n,s)
def r3(x):return math.floor(x*1000+.5)/1000
def near(a,b,code,tol=TOL):require(type(a) in (int,float) and type(b) in (int,float) and abs(a-b)<=tol,code)
def audit(directory):
 import mr1_check as E,multi_reference as M,isr_core as ISR
 d=Path(directory).resolve();allowed=[ROOT/'specs/tasks/M3-c3a-evidence',ROOT/'scratch']
 require(any(d.is_relative_to(x.resolve()) for x in allowed),'output_path');seal=load(d,'source-seal');c=seal['config'];n=int(c['n']);require(1<=n<MAX and seal['version']=='c3a-synthetic-source-1','source_manifest');source=Store(d,'source',True);scored=Store(d,'scores');create=Store(d,'create');join=Store(d,'join');summary=load(d,'job')['summary'];bundle=load(d,'create-artifact-seal')['binding'];require(summary['population_hash']==seal['population_hash'],'source_binding')
 # Bundle is deterministic metadata emitted by the worker, not a live/model source.
 bundle_text=(d/'bundle.json').read_text(encoding='utf-8');bundle=json.loads(bundle_text);require(hashlib.sha256(bundle_text.encode()).hexdigest()==seal['bundle_hash'],'bundle_hash');require(bundle['version']=='mr1-cbc-table-1','policy');digest=hashlib.sha256()
 for uid in ids(n+1):
  source.get(int(uid));digest.update(source.last_hash.encode())
 require(digest.hexdigest()==seal['source_hash'],'source_hash')
 direct=[0.]*(n+2);edu=[0.]*(n+2);exp=[0.]*(n+2);is_a=bytearray(n+2);eligible=bytearray(n+2);add=[0.]*(n+2);chosen=[None]*(n+2);tie=[0.]*(n+2);b_order=[]
 try:
  for uid in ids(n):
   k=int(uid);x=source.get(k);p=E.evaluate(x['user'],x['vectors'],bundle,[47.59,7.61],'2026-11-24T12:00:00.000Z');row=M.member(bundle['model'],p['age'],p['aspects']);direct[k]=row['R'];edu[k]=row['education_raw'];exp[k]=row['experience'];is_a[k]=row['R']>=.15
   actual=scored.get(k)['evaluated']
   for ref in bundle['model']['refs']:
    for field in ('D','G','S','X','education','experience'):near(actual['aspects'][ref['id']][field],p['aspects'][ref['id']][field],'aspect_'+field,1e-9)
  for uid in ids(n):
   k=int(uid)
   if not is_a[k]:continue
   links=E.outgoing(source.get(k)['user'])
   for target in sorted(links,key=int):
    v=int(target);require(1<=v<=n,'related_missing')
    if v==k or is_a[v]:continue
    if not eligible[v]:eligible[v]=1;b_order.append(v)
    delta=bundle['model']['relevance']['X']*links[target]
    if direct[v]+delta<=direct[k]+1e-12 and (delta>add[v] or delta==add[v]>0 and (chosen[v] is None or uid<chosen[v])):add[v]=delta;chosen[v]=uid;tie[v]=links[target]
  order=[int(uid) for uid in ids(n) if is_a[int(uid)]]+b_order;require(len(order)==summary['create_count'],'membership_count');require(sum(is_a)==summary['A'] and len(b_order)==summary['B'],'cohort_count')
  for i,k in enumerate(order):
   row=create.get(i);require(row['user_id']==str(k),'member_order');require(row['cohort']==('A' if is_a[k] else 'B'),'cohort');near(row['direct_relevance'],direct[k],'direct',1e-9);near(row['social_addition'],add[k],'addition',1e-9);require(row['social_source']==chosen[k],'social_source');near(row['social_tie'],tie[k],'social_tie',1e-9);near(row['relevance_score'],r3(direct[k]+add[k]),'relevance');require(row['scoring_version']==bundle['version'],'version');expected_links=E.outgoing(source.get(k)['user']) if is_a[k] else {};require(row['social_links']==expected_links,'frozen_links');expected_e=E.E.education_part(edu[k],E.E.age_in_years(source.get(k)['user']['birthDate'],'2026-11-24'))+exp[k] if hasattr(E.E,'education_part') else max(E.E.age_floor(E.E.age_in_years(source.get(k)['user']['birthDate'],'2026-11-24')),edu[k])+exp[k];near(row['expertise_score'],r3(expected_e),'expertise')
  positions=[-1]*(n+2)
  for i,k in enumerate(order):positions[k]=i
  for name,store,count in [('create',create,len(order)),('join',join,len(order)+1)]:
   expected_ids=order if name=='create' else sorted(order,key=lambda k:str(k))+[n+1];rs=es=0.;first_r=first_e=None;equal_r=equal_e=True
   for i,k in enumerate(expected_ids):
    row=store.get(i);require(row['user_id']==str(k),'join_order')
    if name=='join' and k<=n:
     before=create.get(positions[k]);mutable={'normalized_relevance','normalized_experience','normalized_contribution','contribution_source','isr_score','calculated_at'};require({a:b for a,b in row.items() if a not in mutable}=={a:b for a,b in before.items() if a not in mutable},'join_frozen')
    if name=='join' and k==n+1:
     x=source.get(k);p=E.evaluate(x['user'],x['vectors'],bundle,[47.59,7.61],'2026-11-24T12:00:00.000Z');base=M.member(bundle['model'],p['age'],p['aspects']);delta=0.;src=None;st=0.
     if base['R']<.15:
      for h in ids(n):
       q=int(h)
       if not is_a[q]:continue
       links=E.outgoing(source.get(q)['user'])
       if str(k) not in links:continue
       increase=bundle['model']['relevance']['X']*links[str(k)]
       if base['R']+increase<=direct[q]+1e-12 and increase>delta:delta=increase;src=h;st=links[str(k)]
     near(row['relevance_score'],r3(base['R']+delta),'join_new_r');near(row['expertise_score'],r3(base['E']),'join_new_e');near(row['social_addition'],delta,'join_new_x',1e-9);require(row['social_source']==src,'join_new_source');require(row['cohort']=='explicit','join_new_cohort')
    r,e=row['relevance_score'],row['expertise_score'];first_r=r if first_r is None else first_r;first_e=e if first_e is None else first_e;equal_r=equal_r and r==first_r;equal_e=equal_e and e==first_e;rs+=r;es+=e
   by_uid={};votes={}
   for i,k in enumerate(expected_ids):
    row=store.get(i);rn=1 if equal_r else row['relevance_score']/(rs/count);en=1 if equal_e else row['expertise_score']/(es/count);near(row['normalized_relevance'],r3(rn),'normal_r');near(row['normalized_experience'],r3(en),'normal_e');near(row['isr_score'],r3(bundle['model']['aggregation']['R']*rn+bundle['model']['aggregation']['E']*en+bundle['model']['aggregation']['C']),'isr');by_uid[str(k)]=row['isr_score']
   for uid in ids(n+1):votes[uid]=9 if int(uid)%11==0 else int(uid)%3
   tally=ISR.tally(votes,by_uid,3);saved=summary[name+'_tally'];require(tally['winner']==saved['winner'] and len(tally['counted'])==saved['counted'] and len(tally['excluded'])==saved['excluded'],'tally_evidence')
   for x,y in zip(tally['scores'],saved['scores']):near(x,y,'tally_score',1e-9)
   # Independent Values use a bounded one-pass accumulator, avoiding231 repeated source scans.
   sums={};lengths={};present=False
   def contribute(key,v,r):
    if v is not None:
     pair=sums.setdefault(key,[0.,0.]);pair[0]+=v*r;pair[1]+=r
   for i,k in enumerate(expected_ids):
    t=source.get(k)['taxonomy'];r=store.get(i)['relevance_score']
    if not t:continue
    present=True
    for j in range(10):
     v=t.get('domains',[]);value=v[j] if j<len(v) else None
     if name=='join' and value is not None:value=(value+7)%101
     contribute(('domain',j),value,r)
     for ctx in ('work','family','private','crisis'):
      xs=t.get('contextual_shifts',{}).get(ctx,[]);contribute((ctx,j),xs[j] if j<len(xs) else None,r)
     key='d'+str(j+1);xs=t.get('items',{}).get(key,[])
     if key not in lengths and xs:lengths[key]=len(xs)
     for q in range(lengths.get(key,0)):contribute((key,q),xs[q] if q<len(xs) else None,r)
    for q in range(36):
     xs=t.get('conflict_resolution',[]);v=xs[q] if q<len(xs) else None;contribute(('conflict',q),v.get('weight') if isinstance(v,dict) else v,r)
   def finish(key,f):
    a,b=sums.get(key,[0,0]);return math.floor(a/b+.5) if b>0 else f
   result=None if not present else {'domains':[finish(('domain',j),50) for j in range(10)],'items':{'d'+str(j+1):[finish(('d'+str(j+1),q),50) for q in range(lengths.get('d'+str(j+1),0))] for j in range(10)},'contextual_shifts':{ctx:[finish((ctx,j),0) for j in range(10)] for ctx in ('work','family','private','crisis')},'conflict_resolution':[finish(('conflict',q),50) for q in range(36)]}
   require(result==summary[name+'_values'],'public_values');require(saved['tasks']==([{'title':'Implement option '+str(tally['winner']),'responsible':'1'}] if saved['result']=='todo' else []),'winning_tasks')
  return {'complete':True,'profiles_evaluated':n,'members':len(order),'join_members':len(order)+1,'policy_acceptance':False,'database_reads':0,'writes':0,'requests':0}
 finally:
  for s in (source,scored,create,join):s.close()
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--case-dir',type=Path,required=True);args=parser.parse_args()
 try:result=audit(args.case_dir)
 except (AuditError,ValueError,KeyError,OSError,TypeError) as e:result={'complete':False,'code':str(e) if isinstance(e,AuditError) else 'audit_input_refused','database_reads':0,'writes':0,'requests':0}
 print(json.dumps(result));return 0 if result['complete'] else 2
if __name__=='__main__':raise SystemExit(main())
