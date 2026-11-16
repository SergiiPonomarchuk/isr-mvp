const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../context-review'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
test('recorded playground quotation is valid but neighborhood cannot retain a street-segment reference',()=>{
 const input=read('cases.json').cases.find(c=>c.id==='D1-03').input;
 const raw=JSON.parse(read('pilot-20261117-grounding/attempt-6-response.json').text);
 assert.ok(R.inputText(input).includes(raw.aspects[0].text));
 assert.equal(raw.scope,'neighborhood');
 assert.equal(library.examples.find(e=>String(e.id)==='32').params.classification.scope_type,'street_segment');
 const ranked=[{id:'32',score:.8}];
 assert.throws(()=>R.validate(raw,input,ranked,library),/Incompatible reference scope/);
 // Synthetic diagnostic variant only, never a repair of the saved model response.
 const fixture={...raw,scope:'street_segment'};
 assert.equal(R.validate(fixture,input,ranked,library).scope,'street_segment');
 assert.equal(raw.scope,'neighborhood');
});
