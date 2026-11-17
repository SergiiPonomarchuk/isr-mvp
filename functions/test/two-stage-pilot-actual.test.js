const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../staged-context'),{prepare}=require('../tools/two-stage-pilot-plan');
test('actual two-stage pilot preserves valid clear repair and refuses copied reference-title aspect',()=>{
 const p=prepare(),folder=path.resolve(__dirname,'../../specs/tasks/M3-evaluation/pilot-20261117-two-stage-runtime'),ledger=JSON.parse(fs.readFileSync(folder+'/ledger.json','utf8'));
 assert.equal(ledger.records.length,4);assert.equal(ledger.status,'stopped_no_retry');assert.ok(ledger.records.every(r=>r.http_attempts===1&&r.finish_reason==='STOP'));
 for(let i=0;i<2;i++){const c=p.cases[i],d=S.resolve(S.parse(ledger.records[i*2].raw_output),c.input),plan=S.partition(d,c.ranked,p.library),raw=S.parse(ledger.records[i*2+1].raw_output);assert.equal(d.resolution.scope,'building');assert.equal(d.resolution.location_reference.anchor,'home');assert.deepEqual(d.resolution.questions,[]);
 if(i===0){const r=S.merge(raw,c.input,c.ranked,p.library,d,plan);assert.equal(r.result,'pass');assert.equal(r.model.refs[0].id,'1');}
 else{assert.equal(plan.raw_chain.length,100);assert.equal(plan.domain_ids.length,19);assert.equal(Object.keys(raw.reviews).length,19);assert.equal(raw.aspects[0].text,p.library.examples.find(e=>String(e.id)==='1').title);assert.throws(()=>S.merge(raw,c.input,c.ranked,p.library,d,plan),/Aspect outside effective facts/);}}
});
