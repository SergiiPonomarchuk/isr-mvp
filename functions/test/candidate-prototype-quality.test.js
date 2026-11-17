const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../experiments/candidate-review'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
test('actual complete hundred-key non-pass has no scores and is not semantic acceptance of repeated choice or false scope reasons',()=>{
 const response=read('pilot-20261117-prototype-check/attempt-1-response.json');
 const input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
 const ranked=read('pilot-20261117-two-case/ledger.json').cases['compound-lock-software-clarified'].raw_chain.ranked;
 const result=P.validate(response.text,input,ranked,library);
 assert.equal(response.finish_reason,'STOP');assert.equal(Object.keys(result.reviews).length,100);
 assert.equal(Object.keys(result.deferred).length,2);assert.equal(result.validated.result,'needs_clarification');assert.equal(result.validated.model,undefined);
 assert.match(input.clarification,/decide only how to repair the entrance lock/);
 assert.match(result.validated.questions[0],/confirm.*only.*entrance lock/);
 // Count exact recorded claims against the confirmed building decision; this is
 // a regression about this response, not a general natural-language classifier.
 const falseScope=library.examples.filter(e=>['building','unit'].includes(e.params.classification.scope_type)&&result.reviews[e.id]?.startsWith('x:Incompatible scope'));
 assert.equal(falseScope.length,18);
});
