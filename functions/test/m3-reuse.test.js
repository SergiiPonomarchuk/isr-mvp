const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {verifiedReuse,preflight}=require('../tools/mr1-pilot'),{sha}=require('../tools/mr1-pilot-budget'),R=require('../context-review');
const root=path.resolve(__dirname,'../..'),a=require('../../specs/tasks/M3-evaluation/aligned-approval.json');
test('approved case reuse revalidates actual input, scores and vectors while preserving original prompt provenance',()=>{
 const checked=preflight(root,sha(fs.readFileSync(path.join(root,'specs/tasks/M3-evaluation/cases.json')))),reused=verifiedReuse(root,checked,a.reuse_sources);
 assert.deepEqual(Object.keys(reused),['D1-01-live','D1-02']);
 for(const c of Object.values(reused)){assert.equal(c.bundle.prompt_version,'mr1-context-prompt-3');assert.equal(c.reuse_origin.no_provider_call,true);assert.equal(c.reuse_origin.offline_revalidated,true);}
 assert.throws(()=>verifiedReuse(root,checked,[{...a.reuse_sources[0],sha256:'wrong'}]),/artifact changed/);
 assert.throws(()=>verifiedReuse(root,checked,[{...a.reuse_sources[0],id:'D1-03'}]),/Unapproved reuse/);
});
test('aligned prompt exposes exact compatibility and linkage rules without forcing a scope',()=>{
 const checked=preflight(root,sha(fs.readFileSync(path.join(root,'specs/tasks/M3-evaluation/cases.json')))),input=checked.plan.cases[2].input;
 const prompt=R.prompt(input,[{id:'32',score:.8}],checked.library);
 assert.match(prompt,/including neighborhood versus street_segment/);assert.match(prompt,/NEVER change that meaning/);assert.match(prompt,/Every accepted.aspect_id/);assert.match(prompt,/No duplicates/);
});
