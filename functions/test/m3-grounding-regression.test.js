const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../context-review');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks',name),'utf8'));
test('actual admitted response cannot replace an input aspect with the reference title; numeric bounds remain enforced by server',()=>{
 const raw=JSON.parse(read('M3-evaluation/pilot-20261117-technical-repair/attempt-1-response.json').text);
 const input=read('M3-evaluation/cases.json').cases[0].input,library=require('../data/analyzer_examples.json'),ranked=[{id:'1',score:.8}];
 assert.equal(raw.aspects[0].text,library.examples.find(e=>String(e.id)==='1').title);
 assert.throws(()=>R.validate(raw,input,ranked,library),/quote the submitted input/);
 raw.aspects[0].text=input.description;
 assert.equal(R.validate(raw,input,ranked,library).location_reference.anchor,'home');
 raw.aspects[0].demographics.minAge=131;
 assert.throws(()=>R.validate(raw,input,ranked,library),/age criterion/);
 const walk=value=>{if(!value||typeof value!=='object')return;for(const key of ['maxItems','minimum','maximum'])assert.equal(Object.hasOwn(value,key),false);Object.values(value).forEach(walk);};walk(R.responseSchema());
});
