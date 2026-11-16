"""Offline vector selection diagnostics only. Run from any directory.
No network, database SDK, key access or provider calls. Read committed vector
inputs/library/manifest; replace only M3-selection-calibration.json.
Stored vectors include the standby and normally-created flagship separately;
report ten visible scenarios and eleven saved-vector records distinctly.
"""
import json,math,hashlib,statistics
from pathlib import Path
R=Path(__file__).resolve().parents[3]
lib=json.loads((R/'functions/data/analyzer_examples.json').read_text())
manifest=json.loads((R/'specs/demo/manifest.json').read_text())
def cos(a,b):return sum(x*y for x,y in zip(a,b))/(math.sqrt(sum(x*x for x in a))*math.sqrt(sum(y*y for y in b)))
def doc(collection,id):
 sid=next(sid for sid,e in manifest['scenarios'].items() if e['issue_id']==id)
 return json.loads((R/'specs/tasks/M3-calibration/inputs.json').read_text())['records'][sid]
def vector(v):
 if isinstance(v,list):return v
 if isinstance(v,dict):
  for k in ['value','__value__','values','_values']:
   if k in v:return vector(v[k])
 raise ValueError('unknown vector format: '+str(list(v) if isinstance(v,dict) else type(v)))
def ranking(v,exclude=None):
 return sorted([{'id':e['id'],'title':e['title'],'score':max(0,cos(v,e['vector']))} for e in lib['examples'] if e['id']!=exclude],key=lambda e:(-e['score'],e['id']))
def chain(rr,floor=.3,gap=.05):
 out=[]
 for i,e in enumerate(rr):
  if e['score']<floor or (i and rr[i-1]['score']-e['score']>=gap):break
  out.append(e)
 return out
rows=[]
for sid,e in manifest['scenarios'].items():
 d=doc('issue_vectors',e['issue_id']);v=vector(d['vector']);assert len(v)==768 and all(math.isfinite(x) for x in v)
 inp=e['input'];text=(inp['title'].strip()+'. '+inp['description'].strip());sha=hashlib.sha256(text.encode()).hexdigest()
 assert d['text_sha256']==sha,(sid,'text identity mismatch')
 assert d['model']==lib['embedding_model'] and int(d['dims'])==lib['embedding_dims']
 rr=ranking(v);selected=chain(rr)
 rows.append({'scenario':sid,'title':inp['title'],'issue_text_sha256':sha,'model':d['model'],'dims':d['dims'],'task_type':d.get('task_type'),'template_version':d.get('template_version'),'ranking':rr,'selected_count':len(selected),'outcome':'needs_clarification' if len(selected)>3 else 'no_match' if not selected else 'candidate_pass_pending_context','largest_internal_gap':max([rr[i-1]['score']-rr[i]['score'] for i in range(1,len(selected))] or [0]),'sensitivity':[{'gap':g,'floor':f,'count':len(chain(rr,f,g))} for f,g in [(.3,.05),(.3,.02),(.3,.01),(.3,.005),(.3,.002),(.3,.001),(.5,.05),(.7,.05)]]})
 print(sid,'selected',len(selected),'top',round(rr[0]['score'],4),flush=True)
loo=[]
for e in lib['examples']:
 rr=ranking(e['vector'],exclude=e['id']);loo.append({'reference_id':e['id'],'top_score':rr[0]['score'],'selected_count':len(chain(rr))})
out={'date':'2026-11-16','baseline':'89fb6bc','environment':'offline committed input vectors extracted from accepted snapshot; isolated emulator attempt timed out and was stopped without export','snapshot':'A:/BackUp/isr-mvp/emulator-snapshots/2026-11-14-d1-author-accepted-7259ca3','metric':'max(0,cos(actual saved title-description RETRIEVAL_QUERY vector, committed RETRIEVAL_DOCUMENT reference vector))','scope_limits':['No new title/context/vague/compound/aspect embeddings created.','Threshold experiment on existing vectors; no confidence calibration or final member-score comparison.','Library leave-one-out is DOCUMENT-to-DOCUMENT geometry diagnostic, not the runtime query metric.'],'calibration_inputs_sha256':hashlib.sha256((R/'specs/tasks/M3-calibration/inputs.json').read_bytes()).hexdigest(),'source_library_sha256':hashlib.sha256((R/'functions/data/analyzer_examples.json').read_bytes()).hexdigest(),'scenarios':rows,'library_leave_one_out':loo,'summary':{'visible_scenarios':10,'saved_vectors_including_standby':len(rows),'scenarios':len(rows),'clarification_count':sum(x['outcome']=='needs_clarification' for x in rows),'selected_min':min(x['selected_count'] for x in rows),'selected_max':max(x['selected_count'] for x in rows),'query_top_scores':[x['ranking'][0]['score'] for x in rows],'loo_selected_median':statistics.median(x['selected_count'] for x in loo)},'provider_calls':0,'database_mutations':0}
(R/'specs/tasks/M3-selection-calibration.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out['summary'],indent=2))
