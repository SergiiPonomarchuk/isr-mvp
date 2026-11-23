"use strict";
// Bounded asynchronous SDK orchestration over the pure C1 transition planner.
const A=require('../publication/artifact'),{Store}=require('../publication/store'),P=require('../publication/protocol'),F=require('../publication/fixture'),G=require('./guard');
const {AsyncLocalStorage}=require('node:async_hooks');
const LIMITS=Object.freeze({writes:16,commit_bytes:16384,document_bytes:512*1024,read_docs:600,discovery_steps:1024,sdk_attempts:3,fixture_operations:512,fixture_commit_bytes:8*1024*1024,fixture_commits:1024});
const database='projects/'+G.PROJECT+'/databases/(default)',prefix=database+'/documents/';
const copy=x=>structuredClone(x);
class NeedRead{constructor(key){this.key=key;}}
function encode(fixture,key,value){return {prototype_version:G.VERSION,fixture_id:fixture,logical_key:key,payload:JSON.stringify(A.pack(value))};}
function decode(fixture,key,snap){if(!snap.exists)return undefined;const d=snap.data();if(Object.keys(d).sort().join()!=='fixture_id,logical_key,payload,prototype_version'||d.prototype_version!==G.VERSION||d.fixture_id!==fixture||d.logical_key!==key)A.fail('c2a_format_refused');if(typeof d.payload!=='string')A.fail('c2a_format_refused');try{return A.unpack(JSON.parse(d.payload));}catch{A.fail('c2a_payload_refused');}}
function plan(cache,clock,call){
 const rows=[['__planner__',{value:{},version:1}]],versions=[];
 for(const [key,value]of cache){versions.push([key,value===undefined?0:1]);if(value!==undefined)rows.push([key,{value:copy(value),version:1}]);}
 const store=new Store({rows,versions,sequence:1}),get=store.get.bind(store),run=store.run.bind(store),written=new Set();let operations=[];let runs=0;
 store.get=key=>{if(!cache.has(key)&&!written.has(key))throw new NeedRead(key);return get(key);};
 store.run=(label,callback,fault)=>{if(++runs>1)A.fail('planner_multiple_transactions');const ops=new Map();const value=run(label,tx=>callback({get:tx.get,set:(key,data)=>{ops.set(key,{kind:'set',data:copy(data)});tx.set(key,data);},create:(key,data)=>{ops.set(key,{kind:'create',data:copy(data)});tx.create(key,data);},delete:key=>{ops.set(key,{kind:'delete'});tx.delete(key);}}),fault);operations=[...ops];for(const [key]of operations)written.add(key);return value;};
 const result=call(new P.Protocol(store,{now:clock}),store);return {result,operations,model:store.metrics[0]||null};
}
function codec(){const protobuf=require('google-gax').protobuf,root=protobuf.Root.fromJSON(require('@google-cloud/firestore/build/protos/v1.json'));return {Commit:root.lookupType('google.firestore.v1.CommitRequest'),Document:root.lookupType('google.firestore.v1.Document')};}
function measure(request,c=codec()){
 if(request.database!==database||!Array.isArray(request.writes)||request.writes.length>LIMITS.writes)A.fail('sdk_request_shape');
 let largest=0,masks=0;
 for(const w of request.writes){const name=w.update?.name||w.delete;if(typeof name!=='string'||!name.startsWith(prefix)||!G.allowedPhysical(name.slice(prefix.length)))A.fail('c2a_path_refused');if(w.update)largest=Math.max(largest,c.Document.encode(w.update).finish().length);masks+=w.updateMask?.fieldPaths?.length||0;}
 const bytes=c.Commit.encode(request).finish().length;if(bytes>LIMITS.commit_bytes||largest>LIMITS.document_bytes)A.fail('sdk_byte_budget');
 return {writes:request.writes.length,bytes,largest_document_bytes:largest,field_mask_paths:masks,transaction_bytes:request.transaction?Buffer.isBuffer(request.transaction)?request.transaction.length:Buffer.from(request.transaction,'base64').length:0};
}
function fixture(count){if(![2,7,17].includes(count))A.fail('fixture_count');const records=F.fixture(count);return {records,hash:A.hash(A.pack(records)),uids:[String(count+1),String(count+2)]};}
function clientGuard(db){G.target();if(db.projectId!==G.PROJECT||db._settings.servicePath!=='127.0.0.1'||db._settings.port!==8190||db._settings.ssl!==false)A.fail('c2a_client_refused');}
async function open({resume=false}={}){
 G.target();const {Firestore}=require('@google-cloud/firestore'),db=new Firestore({projectId:G.PROJECT,host:G.HOST,ssl:false});clientGuard(db);
 const session={db,als:new AsyncLocalStorage(),metrics:[],counters:new Map(),paths:new Set(),initialized:new Set(),resume,verified:false};const wire=codec();
 const request=db.request.bind(db),stream=db.requestStream.bind(db);
 function guardRequest(method,r){clientGuard(db);if(!['commit','beginTransaction','rollback','batchGetDocuments','listCollectionIds'].includes(method))A.fail('c2a_rpc_refused');if(method==='listCollectionIds'&&r.parent!==database+'/documents')A.fail('c2a_path_refused');if(r.database&&r.database!==database)A.fail('c2a_database_refused');for(const name of r.documents||[])if(!name.startsWith(prefix)||!G.allowedPhysical(name.slice(prefix.length)))A.fail('c2a_path_refused');}
 db.request=function(method,r,...rest){guardRequest(method,r);if(method==='commit'){
   const m=measure(r,wire),context=session.als.getStore()||{fixture:'bootstrap',operation:'bootstrap'};
   const counters=session.counters.get(context.fixture)||{commits:0,bytes:0,operations:0};counters.commits++;counters.bytes+=m.bytes;
   if(counters.commits>LIMITS.fixture_commits||counters.bytes>LIMITS.fixture_commit_bytes)A.fail('fixture_commit_budget');session.counters.set(context.fixture,counters);
   session.metrics.push({...context,...m});for(const w of r.writes){const name=w.update?.name||w.delete;session.paths.add(name.slice(prefix.length));}
  }return request(method,r,...rest);};
 db.requestStream=function(method,bidirectional,r,...rest){guardRequest(method,r);return stream(method,bidirectional,r,...rest);};
 try{
  const roots=(await db.listCollections()).map(r=>r.id).sort();if(roots.some(r=>!['issue_drafts','issues','discussions','microcommunities'].includes(r)))A.fail('unexpected_database_roots');
  const marker=db.doc('issue_drafts/c2a_bootstrap'),value={prototype_version:G.VERSION,project:G.PROJECT,marker:'fresh_disposable_fixture'};
  if(!roots.length){if(resume)A.fail('resume_marker_missing');await marker.create(value);}else{if(!resume)A.fail('emulator_not_empty');const s=await marker.get();if(!s.exists||Object.keys(s.data()).sort().join()!==Object.keys(value).sort().join()||Object.keys(value).some(k=>s.data()[k]!==value[k]))A.fail('resume_marker_invalid');}
  session.verified=true;return session;
 }catch(e){await db.terminate();throw e;}
}
class Service{
 constructor(session,id,count,{clock=()=>Date.now()}={}){if(!session.verified)A.fail('unverified_session');G.fixtureId(id);this.session=session;this.id=id;this.count=count;this.fixture=fixture(count);this.clock=clock;this.operations=[];this.plans=new Map();}
 ref(key){return this.session.db.doc(G.physical(this.id,key));}
 async initialize(){
  const controls={'control/source':{id:this.id,epoch:0,seal:'sealed',fixture_hash:this.fixture.hash,fixture_count:this.count,policy:'c2a_fixture_only'},'control/catalog':{revision:0},'control/day':{utc:'2026-11-23',local:'2026-11-23'}};
  return this.session.als.run({fixture:this.id,operation:'initialize'},async()=>{
   const snaps=await this.session.db.getAll(...Object.keys(controls).map(k=>this.ref(k)));
   if(snaps.every(s=>!s.exists)){if(this.session.resume||this.session.initialized.has(this.id))A.fail('fixture_authority_missing');const b=this.session.db.batch();for(const [k,v]of Object.entries(controls))b.create(this.ref(k),encode(this.id,k,v));await b.commit();}
   else{if(snaps.some(s=>!s.exists))A.fail('partial_fixture');const source=decode(this.id,'control/source',snaps.find(s=>s.ref.path===this.ref('control/source').path));if(source.fixture_hash!==this.fixture.hash||source.fixture_count!==this.count||source.policy!=='c2a_fixture_only')A.fail('fixture_source_changed');}
   this.session.initialized.add(this.id);
  });
 }
 async execute(label,call,fault={}){
  clientGuard(this.session.db);const counters=this.session.counters.get(this.id)||{commits:0,bytes:0,operations:0};if(++counters.operations>LIMITS.fixture_operations)A.fail('fixture_operation_budget');this.session.counters.set(this.id,counters);
  return this.session.als.run({fixture:this.id,operation:label},async()=>{
   let attempts=0,injected=false;const details=[];
   let result;try{result=await this.session.db.runTransaction(async tx=>{
    attempts++;const cache=new Map();let prepared;
    for(let step=0;step<LIMITS.discovery_steps;step++){
     try{prepared=plan(cache,this.clock(),call);if(fault.afterReads&&!injected){injected=true;await fault.afterReads();prepared=plan(cache,this.clock(),call);}break;}
     catch(e){if(!(e instanceof NeedRead))throw e;
      let keys=[e.key];const match=/^private\/nodes\/([-a-zA-Z0-9_:]+)\/n[0-9]{5}$/.exec(e.key),job=match&&cache.get(P.jobKey(match[1]));
      if(job){if(!Number.isInteger(job.artifact?.node_count)||job.artifact.node_count<1||job.artifact.node_count>512)A.fail('node_count');keys=Array.from({length:job.artifact.node_count},(_,i)=>P.nodeKey(match[1],'n'+String(i).padStart(5,'0'))).filter(k=>!cache.has(k));}
      if(cache.size+keys.length>LIMITS.read_docs||!keys.length)A.fail('read_budget');const snaps=await tx.getAll(...keys.map(k=>this.ref(k)));const expected=new Map(keys.map(k=>[this.ref(k).path,k]));if(snaps.length!==keys.length)A.fail('read_result');for(const snap of snaps){const key=expected.get(snap.ref.path);if(!key)A.fail('read_result');expected.delete(snap.ref.path);cache.set(key,decode(this.id,key,snap));}
     }
    }
    if(!prepared)A.fail('discovery_budget');if(fault.crash==='before')A.fail('c2a_crash_before');
    if(prepared.operations.length>LIMITS.writes)A.fail('write_budget');
    for(const [key,op]of prepared.operations){const ref=this.ref(key);if(op.kind==='delete')tx.delete(ref);else if(op.kind==='create')tx.create(ref,encode(this.id,key,op.data));else tx.set(ref,encode(this.id,key,op.data));}
    details.push({reads:cache.size,writes:prepared.operations.length});return prepared.result;
   },{maxAttempts:LIMITS.sdk_attempts});}catch(e){this.operations.push({operation:label,attempts,callbacks:details,status:'refused'});throw e;}
   this.operations.push({operation:label,attempts,callbacks:details});if(fault.crash==='after')A.fail('result_lost_after_commit');return result;
  });
 }
 async checkSource(){return this.execute('source-check',(_,s)=>{const v=s.get('control/source');if(!v||v.fixture_hash!==this.fixture.hash||v.fixture_count!==this.count||v.policy!=='c2a_fixture_only'||v.seal!=='sealed')A.fail('fixture_source_changed');return true;});}
 async start({id,kind='create',uid,owner='worker'},fault={}){
  await this.checkSource();const spec={id,operation_key:kind+':'+id,issue_id:'i0',input_hash:this.fixture.hash,kind,...(uid===undefined?{}:{uid})};
  if(kind==='join'&&!this.fixture.uids.includes(uid))A.fail('fixture_uid_refused');
  const intent=await this.execute('intent',(_,s)=>s.get(P.intentKey(spec.operation_key)));
  if(intent?.receipt){const job=await this.execute('completed-job',p=>p.job(intent.job_id));if(A.hash(job.spec)!==A.hash(spec))A.fail('operation_changed');return {job_id:job.id,receipt:intent.receipt,coalesced:true};}
  let records=this.fixture.records;
  if(kind==='join'){
   const job=intent&&await this.execute('pending-job',p=>p.job(intent.job_id));const prior=await this.published(job?.base?.build_id);
   records=prior.records.some(r=>r.kind==='member'&&r.data.user_id===uid)?prior.records:F.successor(prior.records,uid);
  }
  const plan=A.prepare(records);this.plans.set(id,plan);return this.execute('begin',p=>p.begin(spec,plan,owner),fault);
 }
 status(id){return this.execute('status',p=>{const j=p.job(id);return {job_id:j.id,state:j.state,cursor:j.cursor??null,total_nodes:j.artifact?.node_count??null,owner:j.owner??null,epoch:j.lease_epoch??null,lease_until:j.lease_until??null,receipt:j.receipt||null};});}
 async planFor(id){if(this.plans.has(id))return this.plans.get(id);const j=await this.execute('job-plan',p=>p.job(id));let records=this.fixture.records;if(j.spec.kind==='join'){const base=await this.published(j.base.build_id);records=F.successor(base.records,j.spec.uid);}const plan=A.prepare(records);if(A.hash((({nodes,...m})=>m)(plan))!==A.hash(j.artifact))A.fail('fixture_plan_changed');this.plans.set(id,plan);return plan;}
 async stage(id,t,offset,fault={}){const plan=await this.planFor(id);return this.execute('stage',p=>p.stage(id,t,plan,offset),fault);}
 seal(id,t,fault={}){return this.execute('seal',p=>p.seal(id,t),fault);}
 activate(id,t,fault={}){return this.execute('activate',p=>p.activate(id,t),fault);}
 renew(id,t){return this.execute('renew',p=>p.renew(id,t));}
 takeover(id,owner){return this.execute('takeover',p=>p.takeover(id,owner));}
 phase(value,fault={}){return this.execute('phase',p=>p.phase('i0',value),fault);}
 abort(id,fault={}){return this.execute('abort',p=>p.abort(id),fault);}
 cleanup(id,n=3,fault={}){return this.execute('cleanup',p=>p.cleanup(id,n),fault);}
 published(build){return this.execute('published',p=>p.readPublished('i0',build));}
 replay(key){return this.execute('replay',p=>p.replay(key));}
 async page({cursor=null,page_size=3}={}){
  if(!Number.isInteger(page_size)||page_size<1||page_size>8)A.fail('page_size');
  if(cursor){const {checksum,...bound}=cursor;if(A.hash(bound)!==checksum||bound.fixture_id!==this.id||bound.page_size!==page_size||!Number.isInteger(bound.offset)||bound.offset<0)A.fail('cursor_mismatch');}
  const result=await this.published(cursor?.token?.build_id),token=result.token;
  if(cursor&&A.hash(cursor.token)!==A.hash(token))A.fail('cursor_mismatch');const offset=cursor?.offset||0;if(offset>=result.records.length)A.fail('cursor_offset');
  const end=Math.min(offset+page_size,result.records.length),bound={fixture_id:this.id,token,page_size,offset:end};
  const response={version:G.VERSION,token,encoded_records:A.pack(result.records.slice(offset,end)),total_records:result.records.length,complete:end===result.records.length,next_cursor:end===result.records.length?null:{...bound,checksum:A.hash(bound)}};
  if(A.size(response)>65536)A.fail('response_byte_budget');return response;
 }
 // Trusted test injection only; no HTTP route or production writer uses this.
 async edit(key,fn){clientGuard(this.session.db);return this.session.als.run({fixture:this.id,operation:'trusted-fixture-edit'},async()=>{const ref=this.ref(key),snap=await ref.get(),old=decode(this.id,key,snap),next=fn(copy(old));if(next===undefined)await ref.delete();else await ref.set(encode(this.id,key,next));});}
}
async function offlineMeasurements(){
 const {Firestore}=require('@google-cloud/firestore'),db=new Firestore({projectId:G.PROJECT,host:G.HOST,ssl:false}),c=codec(),cases=[];
 try{for(const n of [2,7,17]){
  const f=F.setup(n),t=f.p.begin(F.spec(),f.plan,'offline');F.finish(f.p,f.plan,t);const records=[...f.store.rows].filter(([k])=>k!=='__planner__');
  let largest=0,maxBatch=0;for(let start=0;start<records.length;start+=8){const batch=db.batch();for(const [key,row]of records.slice(start,start+8))batch.set(db.doc(G.physical('offline'+n,key)),encode('offline'+n,key,row.value));const writes=batch._ops.map(o=>o.op());const m=measure({database,writes,transaction:Buffer.alloc(128)},c);largest=Math.max(largest,m.largest_document_bytes);maxBatch=Math.max(maxBatch,m.bytes);}
  cases.push({members:n,largest_document_bytes:largest,max_sample_commit_bytes:maxBatch});
 }}finally{await db.terminate();}return {limits:LIMITS,cases,network_calls:0};
}
module.exports={LIMITS,NeedRead,plan,encode,decode,measure,fixture,clientGuard,open,Service,offlineMeasurements,database};
