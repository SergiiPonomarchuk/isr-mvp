const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../context-review'),library=require('../data/analyzer_examples.json');
const read=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../specs/tasks/M3-evaluation',name),'utf8'));
test('actual v5 clarified choice stays rejected when ninety-eight of the full hundred candidates are unreviewed',()=>{
 const ledger=read('pilot-20261117-two-case/ledger.json'),state=ledger.cases['compound-lock-software-clarified'];
 const raw=JSON.parse(read('pilot-20261117-two-case/attempt-3-response.json').text);
 const input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
 const ids=new Set(state.raw_chain.chain.map(c=>c.id)),covered=new Set([...raw.accepted.map(c=>c.id),...Object.keys(raw.excluded)]);
 assert.equal(ids.size,100);assert.equal([...ids].filter(id=>!covered.has(id)).length,98);
 assert.deepEqual(raw.questions,[]);assert.equal(raw.accepted[0].id,'1');assert.ok(R.inputText(input).includes(raw.aspects[0].text));
 assert.throws(()=>R.validate(raw,input,state.raw_chain.ranked,library),/Reviewed reference validation failed/);
 assert.equal(Object.keys(raw.excluded).length,1,'test must not invent missing exclusion reasons');
});
