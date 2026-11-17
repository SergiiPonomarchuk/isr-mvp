const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../context-review'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
const cases=read('cases.json').cases;
test('confirmed clarification rule keeps original input and explicit narrowing as data and describes their precedence',()=>{
 const input=cases.find(c=>c.id==='compound-lock-software-clarified').input,prompt=R.prompt(input,[{id:'1',score:.8}],library);
 assert.match(prompt,/Do not repeat a choice the clarification already answers/);
 assert.match(prompt,/Never let clarification invent weights/);
 const data=JSON.parse(prompt.split('INPUT_JSON=')[1].split('\nREFERENCE_JSON=')[0]);
 assert.equal(data.description,input.description);assert.equal(data.clarification,input.clarification);
 const fixture=JSON.parse(read('pilot-20261117-grounding/attempt-1-response.json').text);
 fixture.accepted[0].evidence=input.clarification;fixture.aspects[0].text=input.clarification;
 assert.equal(R.validate(fixture,input,[{id:'1',score:.8}],library).result,'pass');
});
test('personal help is eligible while a genuine city versus unit scope gap cannot be forced to pass',()=>{
 const input=cases.find(c=>c.id==='D1-09').input,prompt=R.prompt(input,[{id:'51',score:.8}],library);
 assert.match(prompt,/There is no public-policy-only requirement/);assert.match(prompt,/Do not force a local request into city scope/);
 const gap={result:'not_consistent',message:'The available family-crisis reference uses city scope; this local request lacks a compatible reference.',questions:[]};
 assert.equal(R.validate(gap,input,[{id:'51',score:.8}],library).result,'not_consistent');
 const fixture=JSON.parse(read('pilot-20261117-grounding/attempt-1-response.json').text);
 fixture.scope='unit';fixture.accepted[0].id='51';fixture.accepted[0].evidence=input.description;fixture.aspects[0].text=input.description;
 assert.throws(()=>R.validate(fixture,input,[{id:'51',score:.8}],library),/Incompatible reference scope/);
});
test('captured failures remain literal historical outputs, not repaired or relabeled as v5 model results',()=>{
 const old=read('pilot-20261117-aligned/compound-lock-software-clarified.json');
 assert.equal(old.review.result,'needs_clarification');assert.match(old.review.questions.join(' '),/proceed with the building entrance lock repair/);
 const personal=read('pilot-20261117-aligned/D1-09.json');assert.match(personal.review.message,/private.*rather than a public policy/);
 assert.equal(R.PROMPT_VERSION,'mr1-context-prompt-5');
});
