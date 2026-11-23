// Exercise the frozen historical pilot contract, not new scoring.
require("./legacy-cbc-fixture.cjs").install();
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {preflight,run}=require('../tools/cheapest-low-check'),{sha}=require('../tools/mr1-pilot-budget');
const root=path.resolve(__dirname,'../..'),source=require('../../specs/tasks/M3-evaluation/cheapest-low-approval.json');
const approval=()=>({...source,pins:Object.fromEntries(Object.keys(source.pins).map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]))});
const folder=()=>fs.mkdtempSync(path.join(os.tmpdir(),'staged-check-')),key='unit-test-not-a-real-key';
function wire(c){return {plan_hash:c.partition.seal,result:'pass',message:'Synthetic SDK guard fixture.',questions:[],location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:c.decision.decision.quote,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(c.partition.compatible_ids.map(id=>[id,id==='1'?'a:a:'+c.decision.decision.quote:'x:decision:Synthetic different decision.']))};}
const response=(value,finish='STOP')=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(value)}]},finishReason:finish}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,totalTokenCount:200}}),{headers:{'Content-Type':'application/json'}});
test('staged guard binds nineteen domain rows to full hundred-ID partition and counts twenty-three prior reviews',()=>{
 const a=approval(),c=preflight(root,a);assert.equal(c.partition.compatible_ids.length,19);assert.equal(c.partition.raw_chain.length,100);assert.equal(c.base.reviews,23);assert.equal(c.base.reserved_usd_micros,368110);assert.equal(c.reserve,114534);assert.deepEqual(c.request.config.thinkingConfig,{thinkingLevel:"LOW"});
 assert.throws(()=>preflight(root,{...a,max_cumulative_reviews:25}),/approval differs/);
 assert.throws(()=>preflight(root,{...a,request_sha256:'changed'}),/request differs/i);
 const file=Object.keys(a.pins)[0];a.pins[file]='changed';assert.throws(()=>preflight(root,a),/changed/);
});
test('one fake-SDK request merges one hundred IDs while keeping scope-proof, real-response and fixture-decision origins distinct',async()=>{
 const a=approval(),c=preflight(root,a),dir=folder();let calls=0;const options={root,folder:dir,approval:a,apiKey:key,fetchFn:async()=>{calls++;assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'ledger.json'))).attempts[0].http_attempts,1);return response(wire(c));}};
 const summary=await run(options);assert.equal(summary.status,'validated_pending_semantic_review',summary.stop_reason);assert.equal(summary.totals.reviews,24);assert.equal(summary.totals.embeddingTexts,14);assert.equal(summary.totals.transport_attempts,38);assert.equal(summary.conservative_reserved_usd,.482644);
 const merged=JSON.parse(fs.readFileSync(path.join(dir,'validated-review.json')));assert.equal(Object.keys(merged.provenance).length,100);assert.equal(merged.provenance['1'].origin,'domain_model');assert.equal(merged.provenance['90'].origin,'scope_rule');assert.equal(merged.decision.fixture_only,true);assert.equal(merged.fixture_only,false);assert.equal(merged.experiment_only,true);
 await assert.rejects(run(options),/receipt exists/);assert.equal(calls,1);
});
test('HTTP or network rejection never retries and keeps private SDK errors out of receipts',async()=>{
 for(const network of [false,true]){let calls=0;const dir=folder();const summary=await run({root,folder:dir,approval:approval(),apiKey:key,fetchFn:async()=>{calls++;if(network)throw new Error('private '+key);return new Response(JSON.stringify({error:{code:400,message:'Schema '+key}}),{status:400,headers:{'Content-Type':'application/json'}});}});assert.equal(summary.status,'stopped_no_retry');assert.equal(calls,1);assert.ok(!fs.readFileSync(path.join(dir,'ledger.json'),'utf8').includes(key));}
});
test('missing domain verdict, stale plan, forbidden scope reason or token ceiling preserves output without accepting merge',async()=>{
 for(const kind of ['missing','stale','scope','tokens']){const a=approval(),c=preflight(root,a),raw=wire(c),dir=folder();let calls=0;
 if(kind==='missing')delete raw.reviews['2'];if(kind==='stale')raw.plan_hash='wrong';if(kind==='scope')raw.reviews['2']='x:scope:Mismatch';
 const summary=await run({root,folder:dir,approval:a,apiKey:key,fetchFn:async()=>{calls++;return response(raw,kind==='tokens'?'MAX_TOKENS':'STOP');}});
 assert.equal(summary.status,'stopped_no_retry');assert.equal(calls,1);assert.ok(fs.existsSync(path.join(dir,'attempt-1-response.json')));assert.ok(!fs.existsSync(path.join(dir,'validated-review.json')));}
});
