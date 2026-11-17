const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../experiments/review-stages'),AI=require('../ai-config'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
test('selected existing-model LOW improves home/choice handling but four captured false scope reasons still prevent semantic acceptance',()=>{
 const v=read('pilot-20261117-cheapest-low/validated-review.json'),response=read('pilot-20261117-cheapest-low/attempt-1-response.json');
 assert.equal(AI.TEXT_MODEL,'gemini-3.1-flash-lite');assert.equal(response.finish_reason,'STOP');assert.ok(response.usage.thoughtsTokenCount>0);
 assert.equal(v.validated.result,'pass');assert.deepEqual(v.domain_response.questions,[]);assert.equal(v.domain_response.location_reference.anchor,'home');assert.equal(v.validated.model.refs[0].id,'1');assert.equal(Object.keys(v.provenance).length,100);
 const bad=library.examples.filter(e=>v.domain_response.reviews[e.id]?.includes('Scope mismatch (unit vs building)'));
 assert.equal(bad.length,4);for(const e of bad)assert.equal(S.compatible(v.decision.scope,e.params.classification.scope_type),true);
 // Captured fixture-specific quality evidence only; no runtime phrase blacklist
 // and no repair of the actual model explanations are implemented by this test.
});
