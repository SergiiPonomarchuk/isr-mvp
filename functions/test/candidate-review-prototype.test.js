const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../experiments/candidate-review'),R=require('../context-review'),AI=require('../ai-config');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
const library=require('../data/analyzer_examples.json'),ledger=read('pilot-20261117-two-case/ledger.json');
const state=ledger.cases['compound-lock-software-clarified'],ranked=state.raw_chain.ranked;
const input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
function fixture(){return {result:'pass',message:'Synthetic fixture; not model output.',questions:[],scope:'building',location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:input.clarification,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(P.ids(ranked,library).map(id=>[id,id==='1'?'a:a:'+input.clarification:'x:Synthetic other affected context.']))};}
test('all hundred IDs are required in schema and project with unchanged reviewed math and literal provenance',()=>{
 const raw=fixture(),result=P.validate(JSON.stringify(raw),input,ranked,library),schema=P.schema(ranked,library);
 assert.equal(schema.properties.reviews.required.length,100);assert.equal(schema.properties.reviews.additionalProperties,false);
 const expected=R.validate(result.projection,input,ranked,library);assert.deepEqual(result.validated.model,expected.model);
 assert.equal(result.validated.model.refs[0].alpha,1);assert.equal(result.raw_sha256,R.hash(raw));assert.equal(Object.keys(result.reviews).length,100);
 const compatible=library.examples.find(e=>String(e.id)!=='1'&&['building','unit'].includes(e.params.classification.scope_type));
 raw.reviews[String(compatible.id)]='a:a:'+input.clarification;
 const blended=P.validate(JSON.stringify(raw),input,ranked,library);assert.equal(blended.validated.model.refs.length,2);
 assert.deepEqual(blended.validated.model,R.validate(blended.projection,input,ranked,library).model);
});
test('missing, extra, default, empty, malformed and deferred pass verdicts cannot yield scores',()=>{
 const changes=[r=>delete r.reviews['2'],r=>r.reviews['999']='x:Unknown',r=>r.reviews['2']=null,r=>r.reviews['2']='x:',r=>r.reviews['2']='accept',r=>r.reviews['2']='u:Missing facts',r=>r.reviews['1']='a:a:Invented non-input text',r=>r.reviews['1']='a:no_such_aspect:'+input.clarification,r=>r.scope='city',r=>r.accepted=[]];
 for(const change of changes){const raw=fixture();change(raw);assert.throws(()=>P.validate(JSON.stringify(raw),input,ranked,library));}
 const actual=JSON.parse(read('pilot-20261117-two-case/attempt-3-response.json').text);assert.throws(()=>P.validate(JSON.stringify(actual),input,ranked,library),/protocol fields/);
});
test('repeated literal and escaped JSON keys are refused before projection',()=>{
 for(const key of ['1','\\u0031']){const text=JSON.stringify(fixture()).replace('"reviews":{','"reviews":{"'+key+'":"x:Synthetic duplicate",');assert.throws(()=>P.validate(text,input,ranked,library),/Duplicate JSON key/);}
 assert.throws(()=>P.parse('{"a":1,"a":2}'),/Duplicate/);assert.deepEqual(P.parse('{"a":[{"b":"colon: quote\\\" and slash\\\\"},null,true,-1.2]}'),{a:[{b:'colon: quote" and slash\\'},null,true,-1.2]});
});
test('non-pass outcomes can explicitly defer each unresolved review without fabricated exclusions or scores',()=>{
 const raw={...fixture(),result:'needs_clarification',message:'Synthetic missing factual context.',questions:['Which affected place is intended?'],scope:null,location_reference:null,aspects:[],reviews:Object.fromEntries(P.ids(ranked,library).map(id=>[id,'u:Synthetic unresolved factual context.']))};
 const result=P.validate(JSON.stringify(raw),input,ranked,library);assert.equal(Object.keys(result.deferred).length,100);assert.equal(result.validated.model,undefined);assert.deepEqual(result.projection.accepted,[]);assert.equal(Object.keys(result.projection.excluded).length,0);
 raw.reviews['1']='a:a:'+input.clarification;assert.throws(()=>P.validate(JSON.stringify(raw),input,ranked,library),/Acceptance in non-pass/);
});
test('actual installed SDK transports the full schema exactly using fake fetch only',async()=>{
 const {GoogleGenAI}=require('@google/genai');let calls=0;
 const expected=P.schema(ranked,library),contents=P.prompt(input,ranked,library);
 const client=new GoogleGenAI({apiKey:'unit-test-not-a-real-key',httpOptions:{retryOptions:{attempts:1},fetch:async(request,init)=>{calls++;const body=await new Request(request,init).json();assert.deepEqual(body.generationConfig.responseJsonSchema,expected);assert.equal(body.contents[0].parts[0].text,contents);return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(fixture())}]}}]}),{headers:{'Content-Type':'application/json'}});}}});
 assert.throws(()=>P.prepare({...input,description:'Long factual input. '.repeat(3000)},ranked,library),/32 KiB envelope/);
 const response=await client.models.generateContent(P.prepare(input,ranked,library));
 assert.equal(calls,1);assert.equal(P.validate(response.text,input,ranked,library).validated.result,'pass');
});
module.exports={fixture};
