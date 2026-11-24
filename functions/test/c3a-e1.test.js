"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../experiments/c3a/disk'),P=require('../experiments/c3a/pipeline'),F=require('../experiments/c3a/fixture'),A=require('../experiments/c3a/artifact');
function budget(options={}){const root=path.resolve(__dirname,'../../scratch/c3a-e1-units');fs.mkdirSync(root,{recursive:true});const quota=path.join(root,'unit-quota.json');if(!fs.existsSync(quota))fs.writeFileSync(quota,JSON.stringify({version:'c3a-unit-quota-1',limit:40*1024**2,reserved:16*1024**2}));return new D.Budget(fs.mkdtempSync(path.join(root,'e1-unit-')),{io:D.IO_VERSION,...options});}
test('E1 coalesces contiguous data/index writes and journals while preserving pending overwrite bits',()=>{
 const g=budget(),s=new D.Store(g,'values');for(let i=0;i<17;i++)s.set(i,{i,n:i===0?-0:i,text:'Ω'});
 assert.ok(Object.is(s.get(0).n,-0));s.set(0,{i:0,n:-0,text:'updated'});assert.equal(s.get(0).text,'updated');
 g.save();assert.equal(g.state.version,'c3a-budget-2');assert.ok(g.state.metrics.total.journal_writes<17);
 assert.equal(g.state.metrics.total.data_writes,1);assert.equal(g.state.metrics.total.index_writes,2);
 assert.equal(g.state.metrics.pending_records_max,18);s.close();
 const reopened=new D.Budget(g.dir,{io:D.IO_VERSION}),store=new D.Store(reopened,'values');
 assert.ok(Object.is(store.get(0).n,-0));assert.equal(store.get(16).i,16);store.close();
});
test('E1 reservation recovery replays private data/index afterimages and refuses corrupted WAL',()=>{
 const g=budget({fault:stage=>{if(stage==='data-before-index')throw Object.assign(new Error('synthetic-stop'),{code:'synthetic-stop'});}}),s=new D.Store(g,'rows');
 s.set(1,{x:1});assert.throws(()=>g.save(),/synthetic-stop/);
 // Simulated in-process failure only; actual process exits occur in the four admitted regressions.
 fs.closeSync(s.data);fs.closeSync(s.index);s.closed=true;
 const reopened=new D.Budget(g.dir,{io:D.IO_VERSION}),read=new D.Store(reopened,'rows');assert.equal(read.get(1).x,1);
 assert.equal(reopened.state.metrics.total.replays,1);assert.ok(reopened.state.nodes>g.state.nodes);read.close();
 const bad=budget({fault:stage=>{if(stage==='reservation-before-data')throw new Error('stop');}}),t=new D.Store(bad,'rows');t.set(1,'one');assert.throws(()=>bad.save(),/stop/);
 fs.closeSync(t.data);fs.closeSync(t.index);const p=path.join(bad.dir,'batch-payload.data'),fd=fs.openSync(p,'r+');fs.writeSync(fd,Buffer.from('X'),0,1,0);fs.closeSync(fd);
 assert.throws(()=>new D.Budget(bad.dir,{io:D.IO_VERSION}),/batch_payload/);
});
test('E1 refuses v1 resume and byte limits before file writes; shared pending ceilings stay fixed',()=>{
 const root=path.resolve(__dirname,'../../scratch'),dir=fs.mkdtempSync(path.join(root,'e1-old-'));new D.LegacyBudget(dir);
 assert.throws(()=>new D.Budget(dir,{io:D.IO_VERSION}),/budget_version/);
 const g=budget({limits:{source:64}}),s=new D.Store(g,'source','source');assert.throws(()=>s.set(1,'x'.repeat(100)),/byte_limit/);assert.equal(fs.statSync(s.dataPath).size,0);s.close();
 const x=budget(),a=new D.Store(x,'left'),b=new D.Store(x,'right');for(let i=0;i<70;i++)(i%2?a:b).set(i,'x'.repeat(20000));x.save();
 assert.ok(x.state.metrics.pending_records_max<=64);assert.ok(x.state.metrics.pending_bytes_max<=1048576);a.close();b.close();
});
test('E1 private batching preserves exact whole-oracle rows, full artifacts and pre-seal resume',async()=>{
 let hit=false;const g=budget({fault:stage=>{if(stage==='checkpoint-before-seal'&&!hit){hit=true;throw new Error('synthetic-seal-stop');}}}),c=F.matrix().find(x=>x.id==='score-7-3');
 P.source(g,c);await P.oracle(g,c);assert.throws(()=>P.candidate(g,c),/synthetic-seal-stop/);
 const reopened=new D.Budget(g.dir,{io:D.IO_VERSION}),result=P.candidate(reopened,c),{create_artifact,join_artifact,...summary}=result;
 assert.deepStrictEqual(summary,reopened.load('oracle-summary'));
 for(const name of ['create','join']){const a=new D.Store(reopened,name),b=new D.Store(reopened,'oracle-'+name);for(let i=0;i<result[name+'_count'];i++)assert.deepStrictEqual(a.get(i),b.get(i));a.close();b.close();const pub=A.openPublished(reopened,name);assert.ok(pub.reader.lookup('1'));pub.close();}
 const legacyRoot=path.resolve(__dirname,'../../scratch'),legacyDir=fs.mkdtempSync(path.join(legacyRoot,'e1-legacy-')),old=new D.LegacyBudget(legacyDir);
 P.source(old,c);const reference=P.candidate(old,c);
 assert.deepStrictEqual(result.create_artifact,reference.create_artifact);assert.deepStrictEqual(result.join_artifact,reference.join_artifact);
 assert.ok(reopened.state.metrics.total.batches>0);
});

test('E1 transient checkpoint replacement retries are precharged and preserve exact bytes',()=>{
 const g=budget(),original=fs.renameSync,attempts=[];
 try{fs.renameSync=(from,to)=>{if(to.endsWith('retry-probe.json')){attempts.push(g.state.replacement.attempts);if(attempts.length<3)throw Object.assign(new Error('synthetic sharing refusal'),{code:'EPERM'});}return original(from,to);};
 g.checkpoint('retry-probe',{n:-0,text:'Ω'});assert.deepStrictEqual(attempts,[1,2,3]);assert.equal(g.state.metrics.total.rename_retries,2);assert.equal(g.state.replacement,null);
 const got=g.load('retry-probe');assert.ok(Object.is(got.n,-0));assert.equal(got.text,'Ω');
 }finally{fs.renameSync=original;}
});
test('E1 exhausted replacement refuses and cannot regain attempts on reopen',()=>{
 const g=budget(),original=fs.renameSync;let calls=0;
 try{fs.renameSync=(from,to)=>{if(to.endsWith('exhausted.json')){calls++;throw Object.assign(new Error('synthetic sharing refusal'),{code:'EPERM'});}return original(from,to);};
 assert.throws(()=>g.checkpoint('exhausted',{n:1}),e=>e.code==='EPERM'&&e.io_operation==='checkpoint_replace'&&e.io_attempts===3);assert.equal(calls,3);
 }finally{fs.renameSync=original;}
 const reopened=new D.Budget(g.dir,{io:D.IO_VERSION});assert.equal(reopened.state.replacement.attempts,3);reopened.checkpoint('other',{n:2});
 assert.throws(()=>reopened.checkpoint('exhausted',{n:1}),/replacement_attempt_limit/);assert.ok(!fs.existsSync(path.join(g.dir,'exhausted.json')));
});
