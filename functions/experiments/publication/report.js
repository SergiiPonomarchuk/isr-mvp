"use strict";
require('../../tools/capacity/no-network');
const assert=require('node:assert/strict'),A=require('./artifact'),{Store}=require('./store'),P=require('./protocol'),F=require('./fixture');
function run(){
 const started=performance.now(),cpu=process.cpuUsage(),cases=[],trace=[];
 for(const count of [2,7,17]){
  let f=F.setup(count),token=f.p.begin(F.spec(),f.plan,'worker-a',{...F.DEFAULTS,chunk_writes:4});const metrics=[];
  assert.throws(()=>f.p.stage('b0',token,f.plan,0,{crash:'after'}),e=>e.code==='result_lost_after_commit');assert.equal(f.p.stage('b0',token,f.plan,0).replayed,true);
  metrics.push(...f.store.metrics);const store=new Store(JSON.parse(JSON.stringify(f.store.snapshot())));f={...f,store,p:new P.Protocol(store,f.clock)};f.clock.now=1000;const old=token;token=f.p.takeover('b0','worker-b');assert.throws(()=>f.p.stage('b0',old,f.plan,token.cursor),e=>e.code==='stale_owner');F.finish(f.p,f.plan,token);
  assert.deepEqual(f.p.readPublished('i0').records,f.records);assert.deepEqual(f.p.replay('create:b0'),f.records.find(r=>r.kind==='replay').data);
  const createMetric=f.store.metrics.find(m=>m.label==='activate'&&m.writes),uid=String(count+1),records=F.successor(f.records,uid);const plan=A.prepare(records),jt=f.p.begin(F.spec('j0','join',uid),plan,'worker-j',{...F.DEFAULTS,chunk_writes:4});F.finish(f.p,plan,jt);assert.equal(f.p.readPublished('i0').token.member_count,count+1);assert.equal(f.p.replay('create:b0').members_count,count);const joinMetric=f.store.metrics.findLast(m=>m.label==='activate'&&m.writes);
  metrics.push(...f.store.metrics);const chunk=metrics.filter(m=>m.label==='stage');assert.ok(chunk.every(m=>m.writes<=4&&m.model_bound_bytes<=8192));assert.ok([createMetric,joinMetric].every(m=>m.reads<=16&&m.writes<=16));
  cases.push({members:count,joined_members:count+1,node_count:f.plan.node_count,typed_payload_bytes:f.plan.payload_bytes,largest_json_node_bytes:Math.max(...f.plan.nodes.map(A.size)),chunk_commits:chunk.filter(m=>m.writes).length,largest_chunk_model_bound:Math.max(...chunk.map(m=>m.model_bound_bytes)),create_activation:createMetric,join_activation:joinMetric,payload_and_replay_exact:true,create_replay_digest:A.hash(A.pack(f.p.replay('create:b0')))});
 }
 for(const kind of ['source','catalog','day','cancel']){
  const f=F.setup(),t=f.p.begin(F.spec(),f.plan,'w');let i=0;while(i<f.plan.node_count)i=f.p.stage('b0',t,f.plan,i).cursor;f.p.seal('b0',t);
  if(kind==='cancel')f.p.abort('b0');else{const path='control/'+kind,value=f.store.get(path);if(kind==='source')value.epoch++;if(kind==='catalog')value.revision++;if(kind==='day')value.utc='2026-11-19';f.store.inject(path,value);}
  assert.throws(()=>f.p.activate('b0',t));assert.equal(f.store.get(P.issueKey('i0')),undefined);trace.push({scenario:kind+'-change-refuses',status:'passed'});
 }
 const race=F.setup(),rt=race.p.begin(F.spec(),race.plan,'r');F.finish(race.p,race.plan,rt);const rp=A.prepare(F.successor(race.records,'3')),rj=race.p.begin(F.spec('jr','join','3'),rp,'j');let rc=0;while(rc<rp.node_count)rc=race.p.stage('jr',rj,rp,rc).cursor;race.p.seal('jr',rj);race.p.phase('i0','voting');assert.throws(()=>race.p.activate('jr',rj));assert.equal(race.p.readPublished('i0').token.member_count,2);trace.push({scenario:'phase-wins-pending-join',status:'passed'});
 // Cleanup can restart after an ambiguous commit, and cannot collect published history.
 const f=F.setup(),t=f.p.begin(F.spec(),f.plan,'w');f.p.stage('b0',t,f.plan,0);f.p.abort('b0');f.clock.now=8*86400000;assert.throws(()=>f.p.cleanup('b0',1,{crash:'after'}));let steps=0;while(!f.p.cleanup('b0',1).done)steps++;assert.deepEqual(f.p.cleanup('b0',1),{done:true,deleted:0});trace.push({scenario:'bounded-aborted-cleanup-resumes',status:'passed',remaining_steps:steps});
 const disallowed=Object.keys(require.cache).filter(p=>p.includes('node_modules'));assert.deepEqual(disallowed,[]);
 return {version:'c1-offline-protocol-1',scope:'tiny fake-store protocol; no application scoring, Firestore client/server or full-population acceptance',status:'completed',cases,traces:trace,provider_calls:0,database_rpcs:0,credential_loader_invocations:0,byte_model:'UTF-8 JSON + 128 bytes per fake read/write + 256-byte envelope; NOT SDK protobuf/server/index size',elapsed_seconds:(performance.now()-started)/1000,cpu_microseconds:process.cpuUsage(cpu),memory_sample:process.memoryUsage(),node:process.version};
}
module.exports={run};
if(require.main===module){const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../../..'),out=path.resolve(process.argv[2]||'');const allowed=path.join(root,'specs/tasks/M3-generation-protocol')+path.sep;if(!out.startsWith(allowed))throw new Error('New report directory must be under specs/tasks/M3-generation-protocol');const result=run();fs.writeFileSync(path.join(out,'worker.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:result.status,cases:result.cases.length,traces:result.traces.length}));}
