// Exercise the frozen historical pilot contract, not new scoring.
require("./legacy-cbc-fixture.cjs").install();
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {runPilot,preflight}=require('../tools/mr1-pilot'),{sha}=require('../tools/mr1-pilot-budget'),R=require('../context-review'),M=require('../multi-reference');
const root=path.resolve(__dirname,'../..'),planFile=path.join(root,'specs/tasks/M3-evaluation/cases.json');
const plan=JSON.parse(fs.readFileSync(planFile,'utf8')),cases=new Map(plan.cases.map(c=>[c.id,c])),library=JSON.parse(fs.readFileSync(path.join(root,'functions/data/analyzer_examples.json'),'utf8'));
const basis=Array(768).fill(0);basis[0]=1;
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
function rawFor(id,prompt){
 const c=cases.get(id),input=c.input;
 if(['vague-help','compound-lock-software'].includes(id))return {result:'needs_clarification',message:'Please select the affected place and decision.',questions:['Which building and repair decision should this issue address?']};
 const candidates=JSON.parse(prompt.split('REFERENCE_JSON=')[1]),first=candidates[0];
 return {result:'pass',message:'Synthetic test response only.',scope:first.scope,location_reference:{anchor:'home',place:''},accepted:[{id:first.id,aspect_id:'a',evidence:input.description}],excluded:Object.fromEntries(candidates.slice(1).map(c=>[c.id,'Different actual affected context.'])),aspects:[{id:'a',text:input.description,demographics:{},demographic_evidence:[]}]};
}
test('full runner executes pinned order and conditional answers through real SDK doubles without resetting budget',async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mr1-runner-'));let requests=0;
 const fetchFn=async request=>{
  requests++;const ledger=JSON.parse(fs.readFileSync(path.join(folder,'ledger.json'),'utf8')),a=ledger.attempts.at(-1);assert.equal(a.http_attempts,1,'reservation must be durable before transport');const body=await request.json();
  if(a.kind==='embedding'){
   const c=cases.get(a.case_id),cache=JSON.parse(fs.readFileSync(path.join(root,c.cache_file),'utf8'));
   const fixtureVector=a.stage==='selection'?cache.records[c.cache_record].vector:basis;
   return json({embeddings:body.requests.map(()=>({values:fixtureVector}))});
  }
  const prompt=body.contents[0].parts[0].text;return json({candidates:[{content:{role:'model',parts:[{text:JSON.stringify(rawFor(a.case_id,prompt))}]},finishReason:'STOP'}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,totalTokenCount:200}});
 };
 const parentFile=path.join(root,'specs/tasks/M3-evaluation/pilot-20261117/ledger.json'),parentReceipt={file:parentFile,sha256:sha(fs.readFileSync(parentFile))};
 const options={root,folder,parentReceipt,expectedPlanHash:sha(fs.readFileSync(planFile)),apiKey:'unit-test-not-a-real-key',fetchFn,authorization:'Synthetic test only'};
 const result=await runPilot(options);assert.equal(result.status,'completed_pending_semantic_review',result.stop_reason);assert.equal(result.totals.reviews,15);assert.equal(result.current_run_totals.reviews,14);assert.equal(requests,result.totals.transport_attempts-1);assert.ok(result.totals.embeddingTexts<=45);assert.ok(result.conservative_reserved_usd<.5);assert.equal(result.cases.length,14);assert.equal(result.cases.find(c=>c.id==='vague-help-clarified').outcome,'pass');
 await assert.rejects(runPilot(options),/receipt already exists/);assert.equal(requests,result.totals.transport_attempts-1);
 const artifact=fs.readFileSync(path.join(folder,'ledger.json'),'utf8');assert.ok(!artifact.includes('unit-test-not-a-real-key'));
});

test('schema failure stops after one paid reservation and preserves literal response for offline diagnosis',async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mr1-stop-'));let requests=0;
 const result=await runPilot({root,folder,expectedPlanHash:sha(fs.readFileSync(planFile)),apiKey:'unit-test-not-a-real-key',authorization:'Synthetic test only',fetchFn:async()=>{requests++;return json({candidates:[{content:{role:'model',parts:[{text:'{"result":"pass"}'}]},finishReason:'STOP'}]});}});
 assert.equal(result.status,'stopped_no_retry');assert.equal(requests,1);assert.equal(result.totals.reviews,1);assert.equal(result.totals.embeddingTexts,0);assert.equal(result.cases.filter(c=>c.state==='not_run_after_stop').length,13);assert.match(fs.readFileSync(path.join(folder,'attempt-1-response.json'),'utf8'),/pass/);
});
test('changed approval binding is refused before a receipt or provider call',()=>{assert.throws(()=>preflight(root,'wrong-binding'),/approved binding/);});
