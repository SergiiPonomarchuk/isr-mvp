const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {Ledger,guardedClient,LIMITS}=require('../tools/mr1-pilot-budget');
const AI=require('../ai-config'),helper=require('../ai-helper'),R=require('../context-review');
const reviewArgs=()=>({model:AI.TEXT_MODEL,contents:'A synthetic context prompt',config:{temperature:AI.TEMPERATURE,seed:AI.SEED,responseMimeType:'application/json',maxOutputTokens:8192,responseJsonSchema:R.responseSchema()}});
const embArgs=texts=>({model:AI.EMBED_MODEL,contents:texts,config:{taskType:AI.TASK_TYPE_ISSUE,outputDimensionality:768}});
function receipt(){return new Ledger(fs.mkdtempSync(path.join(os.tmpdir(),'mr1-ledger-')),{},'Synthetic test authorization only');}
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});

test('durable attempt reservation, reload refusal, duplicate/retry fuse and every allowance',()=>{
 const l=receipt();try{
  const a=l.reserve('review',reviewArgs(),{caseId:'one',stage:'review'});assert.equal(JSON.parse(fs.readFileSync(l.file)).attempts[0].status,'reserved');assert.ok(a.reserved_usd_micros>0);l.transport(a);assert.throws(()=>l.transport(a));l.active=null;assert.throws(()=>l.reserve('review',reviewArgs(),{caseId:'one',stage:'review'}));
  assert.throws(()=>new Ledger(l.folder,{},''),/receipt already exists/);
  for(let i=1;i<14;i++){l.reserve('review',reviewArgs(),{caseId:'c'+i,stage:'review'});l.active=null;}
  assert.throws(()=>l.reserve('review',reviewArgs(),{caseId:'fifteen',stage:'review'}),/exhausted/);
 }finally{l.close();}
 const m=receipt();try{m.reserve('embedding',embArgs(Array(45).fill('short')),{caseId:'one',stage:'aspects'});m.active=null;assert.throws(()=>m.reserve('embedding',embArgs(['extra']),{caseId:'two',stage:'aspects'}),/exhausted/);}finally{m.close();}
 const p=receipt();try{for(let i=0;i<17;i++){p.reserve('embedding',embArgs(['x']),{caseId:'p'+i,stage:'aspects'});p.active=null;}assert.throws(()=>p.reserve('embedding',embArgs(['x']),{caseId:'last',stage:'aspects'}),/exhausted/);}finally{p.close();}
 const cost=receipt();try{cost.data.attempts.push({kind:'embedding',embedding_texts:0,reserved_usd_micros:LIMITS.usdMicros,http_attempts:0});assert.throws(()=>cost.reserve('review',reviewArgs(),{caseId:'over',stage:'review'}),/exhausted/);}finally{cost.close();}
});

test('oversized inputs, changed models and hidden billed inputs are refused before transport',()=>{
 const l=receipt();try{for(const args of [{...reviewArgs(),config:{...reviewArgs().config,responseJsonSchema:{type:'string'}}},{...reviewArgs(),model:'another-model'},{...reviewArgs(),contents:'x'.repeat(32769)},{...reviewArgs(),config:{...reviewArgs().config,systemInstruction:'extra'}},{...reviewArgs(),config:{...reviewArgs().config,maxOutputTokens:16384}}])assert.throws(()=>l.reserve('review',args,{caseId:'x',stage:'review'}));assert.throws(()=>l.reserve('embedding',embArgs(['x'.repeat(8193)]),{caseId:'x',stage:'aspect'}));assert.equal(l.data.attempts.length,0);}finally{l.close();}
});

test('real SDK uses guarded fetch exactly once; HTTP503 and network exceptions never retry',async()=>{
 for(const networkError of [false,true]){
  const l=receipt();let sent=0;const c=guardedClient(l,{apiKey:'unit-test-not-a-real-key',fetchFn:async()=>{sent++;if(networkError)throw new Error('simulated private transport detail');return json({error:{message:'temporary',code:503}},503);}});
  try{c.setContext({caseId:'x',stage:'review'});await assert.rejects(c.models.generateContent(reviewArgs()),/no retry/);assert.equal(sent,1);assert.equal(l.totals().transport_attempts,1);assert.ok(l.totals().reserved_usd_micros>0);assert.equal(l.data.attempts[0].status,'failed_or_ambiguous');assert.ok(!fs.readFileSync(l.file,'utf8').includes('private transport detail'));}finally{l.close();}
 }
});

test('real SDK batches three embedding texts into one counted POST and returns current vectors',async()=>{
 const l=receipt();let sent=0;const v=Array(768).fill(0);v[0]=1;
 const c=guardedClient(l,{apiKey:'unit-test-not-a-real-key',fetchFn:async request=>{sent++;assert.match(new URL(request.url).pathname,/batchEmbedContents$/);return json({embeddings:[{values:v},{values:v},{values:v}]});}});
 try{helper._setClientForTests(c);c.setContext({caseId:'x',stage:'aspects',template:'mr1-aspect1'});const values=await helper.embedTexts(['one','two','three'],AI.TASK_TYPE_ISSUE);assert.equal(values.length,3);assert.equal(sent,1);assert.equal(l.totals().embeddingTexts,3);assert.equal(l.totals().embeddingPosts,1);}finally{helper._setClientForTests(null);l.close();}
});

test('successful text response keeps usage and literal output without copying client headers',async()=>{
 const l=receipt();const c=guardedClient(l,{apiKey:'unit-test-not-a-real-key',fetchFn:async request=>{const body=await request.json();assert.deepEqual(body.generationConfig.responseJsonSchema,R.responseSchema());return json({candidates:[{content:{role:'model',parts:[{text:'{"result":"needs_clarification"}'}]},finishReason:'STOP'}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:10,thoughtsTokenCount:2,totalTokenCount:112}});}});
 try{c.setContext({caseId:'x',stage:'review'});const r=await c.models.generateContent(reviewArgs());assert.equal(r.text,'{"result":"needs_clarification"}');assert.equal(l.data.attempts[0].reported_cost_usd_micros,43);const artifact=fs.readFileSync(path.join(l.folder,'attempt-1-response.json'),'utf8');assert.ok(!artifact.includes('unit-test-not-a-real-key'));assert.match(artifact,/promptTokenCount/);}finally{l.close();}
});

test('corrected ledger carries the immutable original cost/counts and caps reviews at fifteen cumulatively',()=>{
 const file=path.resolve(__dirname,'../../specs/tasks/M3-evaluation/pilot-20261117/ledger.json'),bytes=fs.readFileSync(file),hash=require('../tools/mr1-pilot-budget').sha(bytes);
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mr1-cumulative-')),l=new Ledger(folder,{},'Synthetic corrected approval',{file,sha256:hash});
 try{assert.equal(l.totals().reviews,1);assert.equal(l.totals().reserved_usd_micros,13081);for(let i=0;i<14;i++){l.reserve('review',reviewArgs(),{caseId:'new'+i,stage:'review'});l.active=null;}assert.equal(l.totals().reviews,15);assert.equal(l.currentTotals().reviews,14);assert.throws(()=>l.reserve('review',reviewArgs(),{caseId:'sixteen',stage:'review'}),/exhausted/);assert.ok(l.totals().reserved_usd_micros<500000);assert.equal(require('../tools/mr1-pilot-budget').sha(fs.readFileSync(file)),hash);}finally{l.close();}
 assert.throws(()=>new Ledger(fs.mkdtempSync(path.join(os.tmpdir(),'mr1-tampered-')),{},'',{file,sha256:'wrong-hash'}),/hash changed/);
});
test('a changed parent receipt blocks transport before another reservation or HTTP request',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mr1-parent-')),file=path.join(temp,'parent.json');fs.copyFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation/pilot-20261117/ledger.json'),file);const hash=require('../tools/mr1-pilot-budget').sha(fs.readFileSync(file));
 const l=new Ledger(path.join(temp,'child'),{},'Synthetic corrected approval',{file,sha256:hash});let calls=0;const c=guardedClient(l,{apiKey:'unit-test-not-a-real-key',fetchFn:async()=>{calls++;return json({});}});
 try{fs.appendFileSync(file,' ');c.setContext({caseId:'x',stage:'review'});await assert.rejects(c.models.generateContent(reviewArgs()),/receipt changed/);assert.equal(calls,0);assert.equal(l.currentTotals().reviews,0);}finally{l.close();}
});
