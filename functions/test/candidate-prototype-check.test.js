const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {preflight,run}=require('../tools/candidate-prototype-check'),{sha}=require('../tools/mr1-pilot-budget');
const root=path.resolve(__dirname,'../..'),source=require('../../specs/tasks/M3-evaluation/prototype-check-approval.json');
function approval(){return {...source,pins:Object.fromEntries(Object.keys(source.pins).map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]))};}
const folder=()=>fs.mkdtempSync(path.join(os.tmpdir(),'candidate-check-'));
const key='unit-test-not-a-real-key';
function wire(c){return {result:'pass',message:'Synthetic fixture, not real model output.',questions:[],scope:'building',location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:c.input.clarification,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(c.ranked.map(c=>[c.id,c.id==='1'?'a:a:'+preflight(root,approval()).input.clarification:'x:Synthetic other affected context.']))};}
function success(text,finish='STOP'){return new Response(JSON.stringify({candidates:[{content:{parts:[{text}]},finishReason:finish}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,totalTokenCount:200}}),{headers:{'Content-Type':'application/json'}});}
test('approved isolated request carries exact prior totals and refuses changed bindings before calls',()=>{
 const a=approval(),c=preflight(root,a);assert.equal(c.base.reviews,21);assert.equal(c.base.reserved_usd_micros,331466);assert.equal(c.reserve,20414);
 assert.throws(()=>preflight(root,{...a,max_cumulative_reviews:23}),/approval differs/);
 assert.throws(()=>preflight(root,{...a,request_sha256:'wrong'}),/request differs/i);
 const file=Object.keys(a.pins)[0];a.pins[file]='wrong';assert.throws(()=>preflight(root,a),/changed/);
});
test('actual SDK one-call probe validates complete synthetic coverage and refuses replay without another HTTP request',async()=>{
 const a=approval(),c=preflight(root,a),dir=folder();let calls=0;
 const options={root,folder:dir,approval:a,apiKey:key,fetchFn:async()=>{calls++;assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'ledger.json'))).attempts[0].http_attempts,1);return success(JSON.stringify(wire(c)));}};
 const result=await run(options);assert.equal(result.status,'validated_pending_semantic_review',result.stop_reason);assert.equal(calls,1);assert.equal(result.totals.reviews,22);assert.equal(result.totals.embeddingTexts,14);assert.equal(result.totals.transport_attempts,36);assert.equal(result.conservative_reserved_usd,.351880);
 await assert.rejects(run(options),/receipt exists/);assert.equal(calls,1);assert.ok(!fs.readFileSync(path.join(dir,'ledger.json'),'utf8').includes(key));
});
test('HTTP rejection and ambiguous network error never retry or leak SDK credentials',async()=>{
 for(const network of [false,true]){let calls=0;const dir=folder();const result=await run({root,folder:dir,approval:approval(),apiKey:key,fetchFn:async()=>{calls++;if(network)throw new Error('private '+key);return new Response(JSON.stringify({error:{code:400,message:'Schema rejection '+key}}),{status:400,headers:{'Content-Type':'application/json'}});}});
 assert.equal(result.status,'stopped_no_retry');assert.equal(calls,1);assert.equal(result.totals.reviews,22);assert.ok(!JSON.stringify(result).includes(key));assert.ok(!fs.readFileSync(path.join(dir,'ledger.json'),'utf8').includes(key));}
});
test('missing verdicts and MAX_TOKENS preserve raw response but never produce a validated review',async()=>{
 for(const truncated of [false,true]){const a=approval(),c=preflight(root,a),dir=folder();let calls=0;const raw=wire(c);if(!truncated)delete raw.reviews['2'];
 const result=await run({root,folder:dir,approval:a,apiKey:key,fetchFn:async()=>{calls++;return success(JSON.stringify(raw),truncated?'MAX_TOKENS':'STOP');}});
 assert.equal(result.status,'stopped_no_retry');assert.equal(calls,1);assert.ok(fs.existsSync(path.join(dir,'attempt-1-response.json')));assert.ok(!fs.existsSync(path.join(dir,'validated-review.json')));}
});
