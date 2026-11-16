const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../context-review'),D=require('../demographics'),L=require('../location'),helper=require('../ai-helper'),{buildAnalyzerLog}=require('../analyzer-log');
const root=path.resolve(__dirname,'../..'),read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const input=read('specs/tasks/M3-evaluation/cases.json').cases[0].input,library=read('functions/data/analyzer_examples.json');
const captured=JSON.parse(read('specs/tasks/M3-evaluation/pilot-20261117/attempt-1-response.json').text),ranked=[{id:'1',score:.8}];
function corrected(i=input,location={anchor:'home',place:''}){const raw=JSON.parse(JSON.stringify(captured));raw.location_reference=location;raw.accepted[0].evidence=i.description;raw.aspects[0].text=i.description;raw.aspects[0].demographics={};raw.aspects[0].demographic_evidence=[];return raw;}
test.afterEach(()=>helper._setClientForTests(null));
test('schema shares actual enums, uses a separate prompt version and cannot mutate validation constants',()=>{
 const s=R.responseSchema(),k=s.properties.aspects.items.properties.demographics.properties.property_kinds.items.enum;
 assert.deepEqual(k,D.PROPERTY_KINDS);assert.ok(!k.includes('building'));k.push('building');assert.ok(!D.PROPERTY_KINDS.includes('building'));assert.notEqual(R.PROMPT_VERSION,R.VERSION);
 assert.deepEqual(s.properties.location_reference.properties.anchor.enum,L.ANCHORS);
});
test('captured invalid enum and unsupported topic filters remain refused; grounded defaults pass without coercion',()=>{
 assert.throws(()=>R.validate(captured,input,ranked,library),/property kind/);
 const enumOnly=JSON.parse(JSON.stringify(captured));enumOnly.aspects[0].demographics.property_kinds=[];enumOnly.aspects[0].demographic_evidence=[];assert.throws(()=>R.validate(enumOnly,input,ranked,library),/source evidence/);
 const raw=corrected(),pass=R.validate(raw,input,ranked,library);assert.equal(pass.location_reference.anchor,'home');assert.deepEqual(pass.aspects['1'].demographic_evidence,[]);assert.equal(pass.schema_sha256,R.schemaHash());
});
test('every non-default criterion has exact matching evidence; defaults cannot acquire invented evidence',()=>{
 const i={title:'Workshop',description:'Parents employed at Argo Industry, aged 18 or older, who enjoy cycling are affected.'};
 const raw=corrected(i);raw.aspects[0].demographics={minAge:18,employmentStatus:'employed',familyStatus:'parent',features:['cycling'],places:['Argo Industry']};
 const evidence=[['minAge','18','aged 18 or older'],['employmentStatus','employed','Parents employed at Argo Industry'],['familyStatus','parent','Parents employed at Argo Industry'],['features','cycling','who enjoy cycling'],['places','Argo Industry','Argo Industry']].map(([field,value,quote])=>({field,value,quote}));raw.aspects[0].demographic_evidence=evidence;
 assert.equal(R.validate(raw,i,ranked,library).aspects['1'].demographic_evidence.length,5);
 for(const change of [r=>r.aspects[0].demographic_evidence.pop(),r=>r.aspects[0].demographic_evidence[0].value='19',r=>r.aspects[0].demographic_evidence[0].quote='An invented age claim',r=>r.aspects[0].demographic_evidence.push(evidence[0]),r=>r.aspects[0].demographic_evidence[3].quote='Parents employed at Argo Industry']){const bad=JSON.parse(JSON.stringify(raw));change(bad);assert.throws(()=>R.validate(bad,i,ranked,library));}
 const defaults=corrected();defaults.aspects[0].demographic_evidence=[{field:'employmentStatus',value:'any',quote:input.description}];assert.throws(()=>R.validate(defaults,input,ranked,library),/non-default/);
});
test('home/work/property/named-place interpretation preserves resolver behavior and a moved pin',async()=>{
 const geography=[{type:'home',geo:[47.59,7.61]},{type:'work',geo:[47.62,7.66]},{type:'property',geo:[47.63,7.67]}];
 for(const [anchor,text,point] of [['home','My home entrance needs repair.',geography[0].geo],['work','Our factory needs repair.',geography[1].geo],['property','My separate garage needs repair.',geography[2].geo],['named_place','Repair the road on Quill Lane.',[47.55,7.65]]]){
  const i={title:'Repair',description:text},raw=corrected(i,{anchor,place:anchor==='named_place'?'Quill Lane':''});const review=R.validate(raw,i,ranked,library);
  const args={reference:review.location_reference,geography,requested:geography[0].geo,requestedSource:'auto',geocode:async()=>({status:'found',point:[47.55,7.65]})};
  assert.deepEqual((await L.resolveIssueLocation(args)).location,point);assert.deepEqual((await L.resolveIssueLocation({...args,requested:[47.6,7.6],requestedSource:'creator'})).location,[47.6,7.6]);
 }
 assert.throws(()=>R.validate(corrected(input,{anchor:'property',place:'osbb 2, h12'}),input,ranked,library),/named-place/);
 assert.throws(()=>R.validate(corrected(input,{anchor:'named_place',place:''}),input,ranked,library),/named-place/);
 const prompt=R.prompt(input,ranked,library);assert.match(prompt,/home is home even if owned/);assert.match(prompt,/problem words like lock\/security\/repair/);
});
test('actual review helper sends the shared structured schema and logs its hash',async()=>{
 let sent;helper._setClientForTests({models:{generateContent:async args=>{sent=args;return {text:JSON.stringify(corrected())};}}});
 const response=await helper.reviewContext(input,ranked,library);assert.deepEqual(sent.config.responseJsonSchema,R.responseSchema());assert.equal(response.meta.prompt_version,R.PROMPT_VERSION);assert.equal(response.meta.schema_sha256,R.schemaHash());assert.equal(buildAnalyzerLog({meta:response.meta}).schema_sha256,R.schemaHash());
});
