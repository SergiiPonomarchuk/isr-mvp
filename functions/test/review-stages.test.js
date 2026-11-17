const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../experiments/review-stages'),R=require('../context-review'),M=require('../multi-reference'),{SCOPES}=require('../context-schema');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
const library=require('../data/analyzer_examples.json'),input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
const ranked=read('pilot-20261117-two-case/ledger.json').cases['compound-lock-software-clarified'].raw_chain.ranked;
const resolution={origin:'author_confirmed_fixture',status:'resolved',decision:{field:'clarification',quote:'decide only how to repair the entrance lock at osbb 2, h12.'},scope:'building',scope_evidence:{field:'description',quote:'our apartment entrance lock at osbb 2, h12'},affected_place:{field:'clarification',quote:'osbb 2, h12'},affected_group:null,unresolved_facts:[],contradictions:[]};
const record=()=>S.fixtureDecision(input,resolution),partition=()=>S.plan(input,ranked,library,record());
function response(p=partition()){return {plan_hash:p.seal,result:'pass',message:'Synthetic domain fixture only.',questions:[],location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:resolution.decision.quote,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(p.compatible_ids.map(id=>[id,id==='1'?'a:a:'+resolution.decision.quote:'x:decision:Synthetic different decision.']))};}
test('central experimental scope predicate matches the unchanged production validator across all scope pairs',()=>{
 const i={title:'Synthetic scope matrix',description:'Fixture issue text.'};
 for(const issue of SCOPES)for(const reference of SCOPES){const e=library.examples.find(e=>e.params.classification.scope_type===reference);assert.ok(e,reference);
 const raw={result:'pass',message:'Synthetic matrix.',scope:issue,location_reference:{anchor:'home',place:''},accepted:[{id:String(e.id),aspect_id:'a',evidence:i.description}],excluded:{},aspects:[{id:'a',text:i.description,demographics:{},demographic_evidence:[]}]};
 const verify=()=>R.validate(raw,i,[{id:String(e.id),score:.8}],library);
 if(S.compatible(issue,reference))assert.doesNotThrow(verify);else assert.throws(verify,/Incompatible reference scope/);
 }
 assert.throws(()=>S.compatible('guessed','building'),/Unknown scope/);
});
test('settled narrowing preserves original audit input and quotes; unresolved, contradictory and stale facts never enter domain review',()=>{
 const d=record();assert.deepEqual(d.original_input,input);assert.ok(d.original_input.description.includes('software'));assert.ok(!d.decision.quote.includes('software'));
 assert.throws(()=>S.fixtureDecision(input,{...resolution,contradictions:['Two incompatible places remain.']}),/cannot settle/);
 assert.throws(()=>S.fixtureDecision(input,{...resolution,decision:{field:'clarification',quote:'Invented choice'}}),/source quote/);
 const unresolved=S.fixtureDecision(input,{origin:'synthetic_fixture',status:'needs_clarification',unresolved_facts:['Which place?']});assert.throws(()=>S.plan(input,ranked,library,unresolved),/unresolved/);
 assert.throws(()=>S.plan({...input,title:'Changed'},ranked,library,d),/input changed/);
});
test('partition retains every raw ID and score with nineteen domain IDs and eighty-one explicit source-backed scope proofs',()=>{
 const d=record(),p=partition();assert.deepEqual(p.raw_chain,M.select(ranked).chain);assert.equal(p.compatible_ids.length,19);assert.equal(Object.keys(p.scope_proofs).length,81);
 assert.equal(new Set([...p.compatible_ids,...Object.keys(p.scope_proofs)]).size,100);
 for(const [id,proof]of Object.entries(p.scope_proofs)){assert.equal(proof.origin,'scope_rule');assert.equal(proof.decision_seal,d.seal);assert.equal(proof.reference_id,id);assert.equal(S.compatible(proof.issue_scope,proof.reference_scope),false);}
});
test('complete fixture merge covers all hundred candidates and preserves original reviewed arithmetic, including multiple references',()=>{
 const d=record(),p=partition(),raw=response(p);raw.reviews['17']='a:a:'+resolution.decision.quote;
 const merged=S.merge(JSON.stringify(raw),input,ranked,library,d,p);assert.equal(Object.keys(merged.provenance).length,100);assert.equal(merged.validated.model.refs.length,2);
 assert.equal(merged.provenance['1'].origin,'domain_fixture');assert.equal(merged.provenance['90'].origin,'scope_rule');
 assert.deepEqual(merged.validated.model,R.validate(merged.projection,input,ranked,library).model);
});
test('missing, unknown, duplicate, stale, proof-tampered and scope-based domain verdicts refuse merge',()=>{
 const d=record(),p=partition();
 for(const edit of [r=>delete r.reviews['2'],r=>r.reviews['999']='x:context:Unknown',r=>r.plan_hash='wrong',r=>r.reviews['2']='x:scope:Mismatch',r=>r.reviews['1']='a:a:worldwide open-source software project roadmap']){const raw=response(p);edit(raw);assert.throws(()=>S.merge(JSON.stringify(raw),input,ranked,library,d,p));}
 const duplicate=JSON.stringify(response(p)).replace('"reviews":{','"reviews":{"1":"x:context:Duplicate",');assert.throws(()=>S.merge(duplicate,input,ranked,library,d,p),/Duplicate/);
 const changed=JSON.parse(JSON.stringify(p));delete changed.scope_proofs['90'];const {seal,...body}=changed;changed.seal=R.hash(body);assert.throws(()=>S.merge(JSON.stringify(response(p)),input,ranked,library,d,changed),/altered domain plan/);
 const changedRanks=ranked.map((c,i)=>i?c:{...c,score:c.score-.001});assert.throws(()=>S.merge(JSON.stringify(response(p)),input,changedRanks,library,d,p),/altered domain plan/);
});
test('domain prompt contains only settled source facts and transports nineteen required verdicts through fake SDK',async()=>{
 const d=record(),p=partition(),request=S.prepare(input,ranked,library,d,p);
 assert.equal(request.config.responseJsonSchema.properties.reviews.required.length,19);
 assert.ok(!request.contents.includes(input.description));assert.ok(!request.contents.includes('worldwide open-source software project roadmap for the next year'));
 const {GoogleGenAI}=require('@google/genai');let calls=0;
 const client=new GoogleGenAI({apiKey:'unit-test-not-a-real-key',httpOptions:{retryOptions:{attempts:1},fetch:async(a,b)=>{calls++;const body=await new Request(a,b).json();assert.deepEqual(body.generationConfig.responseJsonSchema,request.config.responseJsonSchema);return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(response(p))}]}}]}),{headers:{'Content-Type':'application/json'}});}}});
 const result=await client.models.generateContent(request);assert.equal(S.merge(result.text,input,ranked,library,d,p).validated.result,'pass');assert.equal(calls,1);
 const raw={...response(p),result:'needs_clarification',message:'Synthetic missing domain fact.',questions:['Which affected group uses this facility?'],aspects:[],reviews:Object.fromEntries(p.compatible_ids.map(id=>[id,'u:Synthetic unresolved domain fact.']))};
 assert.equal(S.merge(JSON.stringify(raw),input,ranked,library,d,p).validated.model,undefined);
});
