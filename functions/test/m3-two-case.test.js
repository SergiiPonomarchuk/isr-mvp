// Exercise the frozen historical pilot contract, not new scoring.
require("./legacy-cbc-fixture.cjs").install();
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {runPilot}=require('../tools/mr1-pilot'),{Ledger,sha}=require('../tools/mr1-pilot-budget'),R=require('../context-review'),AI=require('../ai-config');
const root=path.resolve(__dirname,'../..'),approval=require('../../specs/tasks/M3-evaluation/two-case-approval.json');
const parents=()=>({receipts:approval.receipts.map(p=>({file:path.join(root,p.file),sha256:sha(fs.readFileSync(path.join(root,p.file)))}))});
const planHash=()=>sha(fs.readFileSync(path.join(root,'specs/tasks/M3-evaluation/cases.json')));
test('focused guard counts nineteen prior reviews and refuses the twenty-second without resetting cost',()=>{
 const l=new Ledger(fs.mkdtempSync(path.join(os.tmpdir(),'mr1-focused-')),{},approval,parents());
 try{assert.equal(l.totals().reviews,19);assert.equal(l.totals().reserved_usd_micros,296917);assert.equal(l.data.limits.reviews,21);
 const args={model:AI.TEXT_MODEL,contents:'Synthetic test',config:{maxOutputTokens:8192,temperature:AI.TEMPERATURE,seed:AI.SEED,responseMimeType:'application/json',responseJsonSchema:R.responseSchema()}};
 for(let i=0;i<2;i++){l.reserve('review',args,{caseId:'target'+i,stage:'review'});l.active=null;}
 assert.throws(()=>l.reserve('review',args,{caseId:'extra',stage:'review'}),/exhausted/);
 }finally{l.close();}
});
test('focused runner sends only the two approved cases, counts clarification selection and bypasses only their original conditional gate',async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mr1-focused-run-')),seen=[];
 const result=await runPilot({root,folder,authorization:approval,parentReceipt:parents(),caseIds:approval.target_cases,expectedPlanHash:planHash(),apiKey:'unit-test-not-a-real-key',fetchFn:async request=>{
 const a=JSON.parse(fs.readFileSync(path.join(folder,'ledger.json'))).attempts.at(-1);seen.push([a.case_id,a.kind]);let payload;
 if(a.kind==='embedding'){const v=Array(768).fill(0);v[0]=1;payload={embeddings:[{values:v}]};}
 else payload={candidates:[{content:{parts:[{text:JSON.stringify({result:'needs_clarification',message:'Synthetic response only.',questions:['What unresolved factual context applies?']})}]}}]};
 return new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json'}});
 }});
 assert.equal(result.status,'completed_pending_semantic_review');assert.equal(result.totals.reviews,21);assert.equal(result.current_run_totals.reviews,2);assert.equal(result.totals.embeddingPosts,14);assert.deepEqual(result.cases.map(c=>c.id),approval.target_cases);assert.deepEqual(seen.filter(x=>x[1]==='review').map(x=>x[0]),approval.target_cases);
 await assert.rejects(runPilot({root,folder:folder+'bad',authorization:approval,caseIds:['D1-01-live'],expectedPlanHash:planHash()}),/Focused case binding/);
});
