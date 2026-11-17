const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {generate}=require('../tools/analyzer-evaluation-plan'),AI=require('../ai-config');
const root=path.resolve(__dirname,'../..');
test('offline plan freezes the baseline, preserves failures and marks ambiguous domain judgments for human review',()=>{
 const p=generate();assert.equal(p.provider_calls,0);assert.equal(p.status,'proposal_not_authorized');assert.equal(p.historical.thinking_config_present,false);assert.equal(p.historical.actual_anchor,'named_place');assert.equal(p.historical.known_false_scope_claims.length,18);assert.equal(p.historical.semantic_acceptance,false);assert.equal(p.historical.requires_human_review,true);
 for(const[file,hash]of Object.entries(p.freeze))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash);
 const gold=p.fixtures[0];assert.equal(gold.expected_anchor,'home');assert.equal(gold.required_domain_ids.length,19);assert.match(gold.other_retention_judgments,/human adjudication/);assert.equal(p.fixtures.find(f=>f.fixture_id==='personal-help').reference_id,'51');assert.match(p.fixtures.find(f=>f.fixture_id==='multi-reference').semantic_gold,/not annotated/);
});
test('fresh comparison arms hold prompt/schema/config equal except model and add LOW without altering the historical request',()=>{
 const p=generate(),a=p.prepared['existing-low'],b=p.prepared['candidate-low'];
 assert.equal(a.model,'gemini-3.1-flash-lite');assert.equal(b.model,'gemini-3.5-flash-lite');assert.deepEqual(a.config,b.config);assert.equal(a.contents,b.contents);assert.deepEqual(a.config.thinkingConfig,{thinkingLevel:'LOW'});assert.equal(a.config.maxOutputTokens,8192);
 assert.equal(AI.TEXT_MODEL,'gemini-3.1-flash-lite');assert.equal(p.proposed_max_cumulative_reviews,25);assert.equal(p.new_embedding_texts,0);assert.equal(p.arms[0].reserved_usd_micros,28518);assert.equal(p.arms[1].reserved_usd_micros,45690);assert.equal(p.cumulative_scenario_reservation_usd,.442318);assert.match(p.execution_gate,/blocks execution/);
 const original=JSON.parse(fs.readFileSync(path.join(root,'specs/tasks/M3-evaluation/staged-domain-request.json'),'utf8'));assert.ok(!Object.hasOwn(original.config,'thinkingConfig'));
});
test('installed SDK can represent both proposed LOW requests through fake fetch only; this does not establish provider availability or quality',async()=>{
 const {GoogleGenAI}=require('@google/genai'),p=generate();let calls=0;
 const client=new GoogleGenAI({apiKey:'unit-test-not-a-real-key',httpOptions:{retryOptions:{attempts:1},fetch:async(request,init)=>{calls++;const r=new Request(request,init),body=await r.json();assert.match(new URL(r.url).pathname,/gemini-3\.(1|5)-flash-lite:generateContent$/);assert.deepEqual(body.generationConfig.thinkingConfig,{thinkingLevel:'LOW'});assert.equal(body.contents[0].parts[0].text,p.prepared['existing-low'].contents);return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'{"synthetic_transport_fixture":true}'}]}}]}),{headers:{'Content-Type':'application/json'}});}}});
 for(const request of Object.values(p.prepared))await client.models.generateContent(request);assert.equal(calls,2);
});
