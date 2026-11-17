const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../experiments/review-stages'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
test('actual staged pass covers all IDs but still has false free-text scope reasons and wrong home anchor',()=>{
 const record=read('pilot-20261117-staged-check/validated-review.json'),response=read('pilot-20261117-staged-check/attempt-1-response.json');
 assert.equal(response.finish_reason,'STOP');assert.equal(record.validated.result,'pass');assert.deepEqual(record.domain_response.questions,[]);
 assert.equal(Object.keys(record.provenance).length,100);assert.equal(Object.values(record.provenance).filter(p=>p.origin==='scope_rule').length,81);assert.equal(Object.values(record.provenance).filter(p=>p.origin==='domain_model').length,19);
 const contradicted=library.examples.filter(e=>record.domain_response.reviews[e.id]?.startsWith('x:context:incompatible scope'));
 assert.equal(contradicted.length,18);for(const e of contradicted)assert.equal(S.compatible(record.decision.scope,e.params.classification.scope_type),true);
 assert.equal(record.domain_response.location_reference.anchor,'named_place');assert.ok(record.decision.scope_evidence.quote.includes('our apartment'));
 // This captures the quality failure; free-text truth is not certified by the
 // typed protocol or a passing structural validator, and no output is repaired.
});
