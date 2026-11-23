const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../cbc-policy'),E=require('../mr1-engine'),AI=require('../ai-config'),ISR=require('../isr'),R=require('../context-review'),Service=require('../mr1-service');
function fixture(level='Bachelor'){
 const vector=c=>[c,Math.sqrt(1-c*c),...Array(766).fill(0)],u=vector(1);
 const ref={id:'r',aspect_id:'a',alpha:1,relevance:{D:0,G:0,S:1,X:0}},model={refs:[ref],relevance:ref.relevance,aggregation:{R:.6,E:.2,C:.2},mu:40,sigma:30};
 const bundle={version:C.VERSION,model,scope:'building',aspects:{a:{vector:u,demographics:{}}}};
 return {bundle,user:{uid:1,birthDate:'2000-01-01',skills:[{id:'e',type:'education',educationLevel:level}],geography:[]},vectors:{embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION,profile_vector:u,experience_vectors:{e:vector(.5)}}};
}
const score=f=>E.evaluate(f.user,f.vectors,f.bundle,[47.59,7.61],'2026-11-21').aspects.r.education;
test('new policy uses only the existing credential CBC and power',()=>{
 for(const [level,cbc,power]of [['PhD',.5,10],['Master',.8,6],['Bachelor',1,4],['College',1.5,3],['Vocational',2,2],['unknown',1,4]])assert.ok(Math.abs(score(fixture(level))-.5**cbc*power)<1e-12);
 const f=fixture();f.bundle.model.refs.push({...f.bundle.model.refs[0],id:'s',alpha:.5});f.bundle.model.refs[0].alpha=.5;
 const p=E.evaluate(f.user,f.vectors,f.bundle,[47.59,7.61],'2026-11-21');assert.equal(p.aspects.r.education,p.aspects.s.education);
});
test('new bundles refuse adjustment fields and unknown or missing versions',()=>{
 for(const field of ['cbc_adjustment','CBC_adjustment_factor','cbc_adjustment_factor','cbc']){const f=fixture();f.bundle.model.refs[0][field]=1;assert.throws(()=>score(f),/CBC is fixed/);}
 for(const version of [undefined,'unknown']){const f=fixture();f.bundle.version=version;assert.throws(()=>score(f),/Unsupported scoring/);}
});
test('frozen old issue Join retains its non-neutral exponent and version',()=>{
 const f=fixture('Vocational');f.bundle.version=C.LEGACY_VERSION;f.bundle.model.refs[0].cbc_adjustment=.9;
 assert.ok(Math.abs(score(f)-2*.5**1.8)<1e-12);
 const issue={scoring_version:C.LEGACY_VERSION,location:[47.59,7.61],created_at:'2026-11-21'};
 const m=E.joining(f.user,f.vectors,issue,f.bundle,[]);assert.equal(m.scoring_version,C.LEGACY_VERSION);assert.equal(m.education_expertise,E.round(Math.max(26/30,2*.5**1.8)));
 assert.throws(()=>E.joining(f.user,f.vectors,{...issue,scoring_version:C.VERSION},f.bundle,[]),/versions disagree/);
 for(const bad of [undefined,0,-1,NaN,Infinity,'1']){f.bundle.model.refs[0].cbc_adjustment=bad;assert.throws(()=>score(f),/Invalid frozen/);}
});
test('unfinished historical drafts require Check before any staged or database work',()=>{
 for(const version of [C.LEGACY_VERSION,'unknown',undefined])assert.throws(()=>Service.requireCurrentDraft({scoring_version:version,mr1_model:{version}},{}),/run Check again/);
});
test('all 100 references omit adjustment and match their source, with unchanged embedding inputs',()=>{
 const {parseExamples}=require('../tools/build_examples'),lib=require('../data/analyzer_examples.json'),md=fs.readFileSync(path.resolve(__dirname,'../../docs/ISR-Issue-Analyzer-100-Examples.md'),'utf8'),source=parseExamples(md);
 assert.equal(source.length,100);assert.equal(lib.examples.length,100);assert.equal(lib.source_sha256,require('node:crypto').createHash('sha256').update(md.replace(/\r\n/g,'\n')).digest('hex'));
 for(let i=0;i<100;i++){assert.deepEqual(source[i].params,lib.examples[i].params);assert.equal(source[i].text,lib.examples[i].text);assert.equal(lib.examples[i].vector.length,768);assert.ok(!JSON.stringify(source[i].params).includes('CBC_adjustment_factor'));}
 const frozen=require('./fixtures/legacy-cbc-library.json');assert.equal(R.hash(lib.examples.map(e=>({id:e.id,text:e.text,vector:e.vector}))),frozen.embedding_inputs_hash);
});
test('historical paid preflight is invalid for the new library and policy',()=>{
 const {preflight}=require('../tools/mr1-pilot'),{sha}=require('../tools/mr1-pilot-budget'),root=path.resolve(__dirname,'../..');
 assert.throws(()=>preflight(root,sha(fs.readFileSync(path.join(root,'specs/tasks/M3-evaluation/cases.json')))),/approved model\/version changed/);
 assert.throws(()=>require('../tools/two-stage-pilot-plan').prepare(),/Cached source binding differs/);
});

test('completed historical Create replays its recorded response without database/model access',async()=>{
 const {makeDraft,readTextInputs}=require('../params'),body={title:'Recorded issue',description:'Recorded decision.',submitterId:'1',draftId:'frozen'},input=readTextInputs(body),bundle={version:C.LEGACY_VERSION,model:{refs:[{cbc_adjustment:.9}]}};
 const response={success:true,issue_id:'recorded'},draft={...makeDraft(input,{},'2026-11-21'),scoring_version:C.LEGACY_VERSION,mr1_model:bundle,mr1_model_hash:R.hash(bundle),input_hash:Service.inputHash(input),creation_result:response};
 const db=new Proxy({},{get(){throw new Error('Replay attempted database access');}});
 assert.deepEqual(await Service.create(db,body,draft),response);
});
