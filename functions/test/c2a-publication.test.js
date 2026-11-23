"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
require('../tools/capacity/no-network');
const A=require('../experiments/publication/artifact'),F=require('../experiments/publication/fixture'),P=require('../experiments/publication/protocol'),G=require('../experiments/c2a/guard'),C=require('../experiments/c2a/core'),H=require('../experiments/c2a/http');
const code=(name,fn)=>assert.throws(fn,e=>e.code===name);
test('C2a exact emulator target is required before SDK use',()=>{
 const valid={C2A_EMULATOR_TESTS:'1',GCLOUD_PROJECT:G.PROJECT,FIRESTORE_EMULATOR_HOST:G.HOST};G.target(valid);
 for(const change of [{C2A_EMULATOR_TESTS:''},{GCLOUD_PROJECT:'project-a3d59130-5adf-4677-9e2'},{FIRESTORE_EMULATOR_HOST:'localhost:8190'},{FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'}])code('c2a_target_refused',()=>G.target({...valid,...change}));
});
test('C2a maps only enumerated provisional paths and fixture IDs',()=>{
 for(const key of ['private/jobs/b0','private/nodes/b0/n00000','control/source','private/intents/create:b0','private/locks/i0','private/titles/'+('a'.repeat(64)),'private/catalog/i0','public/issues/i0','public/discussions/i0','public/publics/i0','public/vectors/i0','public/messages/i0','public/events/i0:3'])assert.equal(G.allowedPhysical(G.physical('demo2',key)),true);
 for(const key of ['users/1','user_vectors/1','../users/1','control/unknown','private/nodes/b0/../../x','public/unknown/i0'])code('c2a_path_refused',()=>G.physical('demo2',key));
 for(const id of ['../x','UPPER','x/y','x'.repeat(41)])code('fixture_id',()=>G.physical(id,'control/source'));
 assert.equal(G.allowedPhysical('users/1'),false);assert.equal(G.allowedPhysical('issue_drafts/real/controls/source'),false);
});
test('typed SDK wrapper preserves order, negative zero, dates and Unicode',()=>{
 const value={z:-0,a:new Date('2026-11-23T00:00:00Z'),unicode:String.fromCodePoint(0x1f6aa),nested:[{b:2,a:1}]},record=C.encode('demo2','control/source',value);
 assert.equal(typeof record.payload,'string');const result=C.decode('demo2','control/source',{exists:true,data:()=>record});assert.deepEqual(result,value);assert.ok(Object.is(result.z,-0));assert.equal(A.hash(A.pack(result)),A.hash(A.pack(value)));
 code('c2a_format_refused',()=>C.decode('demo2','control/source',{exists:true,data:()=>({...record,prototype_version:'unknown'})}));
 code('c2a_payload_refused',()=>C.decode('demo2','control/source',{exists:true,data:()=>({...record,payload:'["unknown"]'})}));
});
test('asynchronous boundary planning asks for state without writing or initializing authority',()=>{
 const cache=new Map();let needed;try{C.plan(cache,0,p=>p.begin(F.spec(),A.prepare(F.fixture()),'w'));}catch(e){needed=e;}
 assert.ok(needed instanceof C.NeedRead);assert.equal(needed.key,P.intentKey('create:b0'));assert.equal(cache.size,0);
});
test('planner exposes a deterministic write set only after required snapshots arrive',()=>{
 const cache=new Map([['control/source',{id:'fixture',epoch:0,seal:'sealed'}],['control/catalog',{revision:0}],['control/day',{utc:'2026-11-23',local:'2026-11-23'}],[P.intentKey('create:b0'),undefined]]);
 const call=p=>p.begin(F.spec(),A.prepare(F.fixture()),'w'),a=C.plan(cache,0,call),b=C.plan(cache,0,call);
 assert.deepEqual(a,b);assert.equal(a.operations.length,2);assert.equal(cache.has(P.jobKey('b0')),false);assert.deepEqual(a.operations.map(([k])=>k).sort(),[P.intentKey('create:b0'),P.jobKey('b0')].sort());
});
test('only fixed tiny source fixtures are admitted',()=>{
 for(const n of [2,7,17])assert.equal(C.fixture(n).records.filter(r=>r.kind==='member').length,n);
 for(const n of [0,1,18,9150,'2',true])code('fixture_count',()=>C.fixture(n));
});
test('SDK document/commit shapes fit provisional bounds offline without network',async()=>{
 const r=await C.offlineMeasurements();assert.equal(r.network_calls,0);assert.equal(r.cases.length,3);assert.ok(r.cases.every(x=>x.largest_document_bytes<r.limits.document_bytes&&x.max_sample_commit_bytes<r.limits.commit_bytes));
});
test('SDK wire guard refuses unknown paths, too many writes and oversized documents',()=>{
 const base={database:C.database,writes:[]};code('sdk_request_shape',()=>C.measure({...base,database:'production'}));code('sdk_request_shape',()=>C.measure({...base,writes:Array(17).fill({delete:C.database+'/documents/issues/c2a_demo_i0'})}));
 code('c2a_path_refused',()=>C.measure({...base,writes:[{delete:C.database+'/documents/users/1'}]}));
 code('sdk_byte_budget',()=>C.measure({...base,writes:[{update:{name:C.database+'/documents/issues/c2a_demo_i0',fields:{x:{stringValue:'x'.repeat(20000)}}}}]}));
});
test('HTTP boundary refuses arbitrary payloads, faults and unknown commands',async()=>{
 const body={version:G.VERSION,fixture_id:'demo2',command:'start',args:{id:'b0',owner:'w',scores:[999]}};
 await assert.rejects(H.dispatch(new Map(),body),e=>e.code==='c2a_request_shape');
 await assert.rejects(H.dispatch(new Map(),{...body,command:'edit',args:{}}),e=>e.code==='c2a_request_shape');
 await assert.rejects(H.dispatch(new Map(),{...body,args:{}}),e=>e.code==='fixture_unknown');
});
test('HTTP start explicitly distinguishes pending from completed',async()=>{
 const body={version:G.VERSION,fixture_id:'demo2',command:'start',args:{id:'b0',owner:'w'}};
 let r=await H.dispatch(new Map([['demo2',{start:async()=>({job_id:'b0'})}]]),body);assert.equal(r.success,false);assert.equal(r.pending,true);
 r=await H.dispatch(new Map([['demo2',{start:async()=>({job_id:'b0',receipt:{build_id:'b0'}})}]]),body);assert.equal(r.success,true);assert.equal(r.pending,false);
});
