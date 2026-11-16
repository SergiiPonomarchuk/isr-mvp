"use strict";
// Offline only: no provider SDK client or Firestore RPC is invoked.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const AI=require('../ai-config'),Review=require('../context-review'),M=require('../multi-reference'),Engine=require('../mr1-engine');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
async function main(){
 const plan=load('specs/tasks/M3-evaluation/cases.json'),library=load('functions/data/analyzer_examples.json');
 const cosine=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0)/Math.sqrt(a.reduce((s,x)=>s+x*x,0)*b.reduce((s,x)=>s+x*x,0));
 const rows=[];
 for(const c of plan.cases){
  const cache=load(c.cache_file),record=cache.records[c.cache_record];
  const text=AI.issueText(c.input.title,c.input.description);
  if(hash(text)!==record.text_sha256 || hash(text)!==c.whole_issue_sha256)throw Error('Saved text binding mismatch: '+c.id);
  if((record.model||cache.model)!==AI.EMBED_MODEL || (record.dims||cache.dimensions)!==768 || (record.task_type||cache.task_type)!==AI.TASK_TYPE_ISSUE || (record.template_version||cache.template_version)!==AI.EMBED_TEMPLATE_VERSION)throw Error('Saved vector metadata mismatch');
  if(record.vector.length!==768 || !record.vector.every(Number.isFinite))throw Error('Invalid saved vector');
  const ranked=library.examples.map(e=>({id:String(e.id),score:Math.max(0,Math.min(1,cosine(record.vector,e.vector)))}));
  const worst=library.examples.map(e=>({id:String(e.id),score:.7000000000000001}));
  const actualBytes=Buffer.byteLength(Review.prompt(c.input,ranked,library));
  const worstBytes=Buffer.byteLength(Review.prompt(c.input,worst,library));
  if(worstBytes>32768)throw Error('Prompt exceeds proposed envelope');
  rows.push({id:c.id,whole_issue_cache_verified:true,conditional:!!c.conditional_on,selection_embedding_needed:!!c.input.clarification,raw_chain_without_new_selection:M.select(ranked).chain.length,prompt_bytes_without_new_selection:actualBytes,all_references_prompt_bytes:worstBytes});
 }
 // Real scoring/serialization of repeated synthetic shapes, not actual-profile evaluation.
 const {Firestore}=require('@google-cloud/firestore'),db=new Firestore({projectId:'demo-mr1-eval'});
 const basis=Array(768).fill(0);basis[0]=1;
 const shapes=[];
 for(const referenceCount of [1,3]){
  const examples=library.examples.filter(e=>e.params.classification.scope_type==='building').slice(0,referenceCount);
  const ranked=examples.map(e=>({id:String(e.id),score:.7}));
  const title='Synthetic structural capacity fixture',description='One synthetic aspect. Another synthetic aspect. A third synthetic aspect.';
  const parts=['One synthetic aspect.','Another synthetic aspect.','A third synthetic aspect.'];
  const raw={result:'pass',message:'Synthetic structure only; no semantic quality claim.',scope:'building',location_reference:{anchor:'home',place:''},accepted:examples.map((e,i)=>({id:String(e.id),aspect_id:'a'+i,evidence:parts[i]})),excluded:{},aspects:examples.map((e,i)=>({id:'a'+i,text:parts[i],demographics:{}}))};
  const review=Review.validate(raw,{title,description},ranked,{...library,examples});
  const bundle={version:Review.VERSION,scope:'building',model:review.model,aspects:Object.fromEntries(Object.entries(review.aspects).map(([id,a])=>[id,{...a,vector:basis}]))};
  const makeUser=n=>({uid:n,displayName:'Synthetic '+n,birthDate:'1990-01-01',skills:[],geography:[{type:'home',geo:[47.59,7.61]}],features:[],post:[],socialRelations:Array.from({length:5},(_,j)=>({relative:(n+j)%9150+1,type:'sibling',tie:.2}))});
  const docs=Array.from({length:9150},(_,i)=>({id:String(i+1),data:()=>makeUser(i+1)}));
  const vectors={profile_vector:basis,experience_vectors:{},embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION};
  const fake={collection:name=>name==='users'?{select:()=>({get:async()=>({docs})})}:{doc:id=>({id})},getAll:async(...args)=>args.slice(0,-1).map(ref=>({id:ref.id,exists:true,data:()=>vectors}))};
  const started=performance.now(),result=await Engine.population(fake,bundle,[47.59,7.61],'2026-11-16T12:00:00Z');
  if(result.members.length!==9150)throw Error('Synthetic fixture must include every participant');
  const relevance=Object.fromEntries(result.members.map(m=>[m.user_id,m.relevance_score])),isr=Object.fromEntries(result.members.map(m=>[m.user_id,m.isr_score]));
  const now=new Date('2026-11-16T12:00:00Z');
  const writes=result.members.map(m=>[db.collection('microcommunity_members').doc('fixture-public_'+m.user_id),{...m,microcommunity_id:'fixture-public',calculated_at:now}]);
  writes.push([db.collection('issues').doc('fixture'),{scoring_version:Review.VERSION,mr1_model:bundle,relevance_scores:relevance,isr_scores:isr}],[db.collection('discussions').doc('fixture'),{participants:Object.keys(isr),relevance_scores:relevance,isr_scores:isr}]);
  const proto=require('google-gax').protobuf.Root.fromJSON(require('@google-cloud/firestore/build/protos/v1.json'));
  const commit=proto.lookupType('google.firestore.v1.CommitRequest'),database='projects/demo-mr1-eval/databases/(default)';
  const bytes=commit.encode({database,writes:writes.map(([ref,data])=>({update:{name:database+'/documents/'+ref.path,fields:db._serializer.encodeFields(data)},currentDocument:{exists:false}}))}).finish().length;
  let capacity='fits_member_and_cache_subset';
  try{require('../mr1-service').capacity(db,writes);}catch(e){if(e.status!==413)throw e;capacity='rejected_before_writes';}
  shapes.push({fixture:'repeated synthetic profiles; not actual population',references:referenceCount,population:9150,A:result.A,B:result.B,member_and_cache_documents:writes.length,serialized_subset_bytes:bytes,publication_preflight:capacity,elapsed_seconds:+((performance.now()-started)/1000).toFixed(3)});
 }
 await db.terminate();
 const report={version:'m3-evaluation-preflight-1',base:'7ee49ea',date:'2026-11-16',cases:rows,capacity_shapes:shapes,paid_calls:0,database_rpcs:0,profile_fields_read:0,limits:['Capacity includes members and cache roots only; excludes remaining publication documents/transaction overhead.','Repeated synthetic shapes are not actual-population affectedness or realistic skill-vector performance.','Conditional prompts use worst-case chain envelope until new selection embedding exists.']};
 fs.writeFileSync(path.join(root,'specs/tasks/M3-evaluation/preflight.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({verified_cases:rows.length,largest_prompt_bytes:Math.max(...rows.map(r=>r.all_references_prompt_bytes)),capacity_shapes:shapes,paid_calls:0,database_rpcs:0}));
}
main().catch(error=>{console.error('Offline-only preflight failed: '+error.message);process.exitCode=1;});
