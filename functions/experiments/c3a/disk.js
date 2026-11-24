"use strict";
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const A=require('../publication/artifact');
const LIMITS=Object.freeze({source:256*1024**2,artifact:256*1024**2,scratch:512*1024**2,decoded:4*1024**2,nodes:200000,work:1000000,attempts:3});
const hash=x=>crypto.createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
function fail(code){throw Object.assign(new Error(code),{code});}
class Budget{
 constructor(dir,{deadline=Date.now()+120000,limits={}}={}){this.dir=path.resolve(dir);fs.mkdirSync(this.dir,{recursive:true});this.limits={...LIMITS,...limits};for(const k in limits)if(!(limits[k]>0&&limits[k]<=LIMITS[k]))fail('limit_raise');this.deadline=deadline;this.state={version:'c3a-budget-1',limits:this.limits,work:0,nodes:0,bytes:{source:0,artifact:0,scratch:0},attempts:{},deadline};this.availableWork=0;this.file=path.join(this.dir,'budget.json');this.runQuota=path.join(path.dirname(this.dir),'run-quota.json');this.growthRemaining=0;if(fs.existsSync(this.file)){this.state=JSON.parse(fs.readFileSync(this.file));if(this.state.version!=='c3a-budget-1')fail('budget_version');for(const k in LIMITS){if(!Number.isSafeInteger(this.state.limits[k])||this.state.limits[k]<1||this.state.limits[k]>LIMITS[k])fail('budget_config');this.limits[k]=Math.min(this.limits[k],this.state.limits[k]);}this.deadline=Math.min(deadline,this.state.deadline);this.state.deadline=this.deadline;this.state.limits=this.limits;}this.check();}
 check(){if(Date.now()>=this.deadline)fail('deadline');if(!this.availableWork){const reserve=Math.min(256,this.limits.work-this.state.work);if(reserve<=0)fail('work_limit');this.state.work+=reserve;this.persist();this.availableWork=reserve;}this.availableWork--;}
 write(kind,n){this.check();if(!Object.hasOwn(this.state.bytes,kind)||this.state.bytes[kind]+n>this.limits[kind])fail('byte_limit_'+kind);this.state.bytes[kind]+=n;}
 emit(){this.check();if(++this.state.nodes>this.limits.nodes)fail('node_limit');}
 attempt(key){this.check();this.state.attempts[key]=(this.state.attempts[key]||0)+1;if(this.state.attempts[key]>this.limits.attempts)fail('attempt_limit');this.save();}
 grow(n){if(!fs.existsSync(this.runQuota))return;if(n>this.growthRemaining){const ledger=JSON.parse(fs.readFileSync(this.runQuota)),reserve=Math.ceil((n-this.growthRemaining)/1048576)*1048576;if(ledger.version!=='c3a-quota-1'||ledger.limit!==1024**3-4*1048576||ledger.reserved+reserve>ledger.limit)fail('run_file_limit');ledger.reserved+=reserve;fs.writeFileSync(this.runQuota,JSON.stringify(ledger));this.growthRemaining+=reserve;}this.growthRemaining-=n;}
 persist(){const n=Buffer.byteLength(JSON.stringify(this.state));if(this.state.bytes.scratch+n>this.limits.scratch)fail('journal_budget');this.state.bytes.scratch+=n;const text=JSON.stringify(this.state);this.grow(Math.max(0,Buffer.byteLength(text)-(fs.existsSync(this.file)?fs.statSync(this.file).size:0)));fs.writeFileSync(this.file,text);}
 save(){this.check();this.persist();}
 filePath(name){if(!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)?$/.test(name))fail('file_path');return path.join(this.dir,name);}
 checkpoint(name,value){this.check();const bytes=Buffer.from(JSON.stringify(A.pack(value)));if(bytes.length>this.limits.decoded)fail('quantum_limit');this.write('scratch',bytes.length);const target=this.filePath(name+'.json');this.grow(bytes.length);fs.writeFileSync(target+'.tmp',bytes);fs.renameSync(target+'.tmp',target);this.save();}
 load(name){this.check();const p=this.filePath(name+'.json');if(!fs.existsSync(p))return null;const b=fs.readFileSync(p);if(b.length>this.limits.decoded)fail('quantum_limit');return A.unpack(JSON.parse(b));}
}
class Store{
 constructor(budget,name,kind='scratch',{raw=false,maxId=200000}={}){this.g=budget;this.kind=kind;this.raw=raw;this.maxId=maxId;this.dataPath=budget.filePath(name+'.data');this.indexPath=budget.filePath(name+'.index');this.data=fs.openSync(this.dataPath,fs.existsSync(this.dataPath)?'r+':'w+');this.index=fs.openSync(this.indexPath,fs.existsSync(this.indexPath)?'r+':'w+');this.end=fs.fstatSync(this.data).size;}
 valid(i){if(!Number.isSafeInteger(i)||i<0||i>this.maxId)fail('index_id');}
 set(i,value){this.valid(i);this.g.emit();const encoded=JSON.stringify(this.raw?value:A.pack(value));if(Buffer.byteLength(encoded)>this.g.limits.decoded)fail('quantum_limit');const b=Buffer.from(JSON.stringify({hash:hash(encoded),encoded}));this.g.write(this.kind,b.length+16);this.g.grow(b.length+Math.max(0,(i+1)*16-fs.fstatSync(this.index).size));this.g.save();fs.writeSync(this.data,b,0,b.length,this.end);const ix=Buffer.alloc(16);ix.writeBigUInt64BE(BigInt(this.end));ix.writeUInt32BE(b.length,8);ix.writeUInt32BE(0x43334131,12);fs.writeSync(this.index,ix,0,16,i*16);this.end+=b.length;}
 get(i){this.valid(i);this.g.check();const ix=Buffer.alloc(16),n=fs.readSync(this.index,ix,0,16,i*16);if(!n||ix.readUInt32BE(12)===0)return null;if(n!==16||ix.readUInt32BE(12)!==0x43334131)fail('index_corrupt');const len=ix.readUInt32BE(8),offset=Number(ix.readBigUInt64BE());if(len<1||len>this.g.limits.decoded*3||offset+len>this.end)fail('frame_bounds');const b=Buffer.alloc(len);if(fs.readSync(this.data,b,0,len,offset)!==len)fail('frame_missing');const x=JSON.parse(b);if(typeof x.encoded!=='string'||hash(x.encoded)!==x.hash)fail('frame_hash');if(Buffer.byteLength(x.encoded)>this.g.limits.decoded)fail('quantum_limit');return this.raw?JSON.parse(x.encoded):A.unpack(JSON.parse(x.encoded));}
 close(){fs.closeSync(this.data);fs.closeSync(this.index);}
}
function* lexIds(max,prefix=''){for(let digit=prefix?'0'.charCodeAt(0):49;digit<=57;digit++){const id=prefix+String.fromCharCode(digit),n=Number(id);if(n>max)break;yield id;if(n*10<=max)yield*lexIds(max,id);}}

// E1 is explicit and private; the v1 classes above remain available to pinned callers.
const IO_VERSION='c3a-io-2',BUDGET_VERSION='c3a-budget-2';
const PENDING_RECORDS=64,PENDING_BYTES=1024**2;
const METRICS=['gets','sets','data_reads','index_reads','data_writes','index_writes',
 'journal_writes','checkpoint_writes','wal_reads','wal_writes','batches','replays','quota_writes'];
class BatchBudget {
 constructor(dir,{deadline=Date.now()+120000,limits={},fault=()=>{}}={}) {
  this.dir=path.resolve(dir);fs.mkdirSync(this.dir,{recursive:true});this.io=IO_VERSION;
  this.file=path.join(this.dir,'budget.json');this.runQuota=path.join(path.dirname(this.dir),'run-quota.json');
  this.limits={...LIMITS,...limits};
  for(const k in limits)if(!Object.hasOwn(LIMITS,k)||!Number.isSafeInteger(limits[k])||limits[k]<1||limits[k]>LIMITS[k])fail('limit_raise');
  this.deadline=deadline;this.monotonicEnd=performance.now()+Math.max(0,deadline-Date.now());
  this.state={version:BUDGET_VERSION,io:IO_VERSION,limits:this.limits,work:0,nodes:0,
   bytes:{source:0,artifact:0,scratch:0},attempts:{},deadline,sequence:0,
   metrics:{total:{},phases:{},classes:{},pending_records_max:0,pending_bytes_max:0,direct_bytes_max:0}};
  this.pending=[];this.pendingBytes=0;this.availableWork=0;this.growthRemaining=0;
  this.stores=new Set();this.flushing=false;this.fault=fault;this.replaying=false;
  if(fs.existsSync(this.file)){
   if(fs.statSync(this.file).size>65536)fail('budget_bytes');
   this.state=JSON.parse(fs.readFileSync(this.file));
   if(this.state.version!==BUDGET_VERSION||this.state.io!==IO_VERSION)fail('budget_version');
   for(const k in LIMITS){const n=this.state.limits[k];if(!Number.isSafeInteger(n)||n<1||n>LIMITS[k])fail('budget_config');this.limits[k]=Math.min(this.limits[k],n);}
   for(const [value,cap]of [[this.state.work,this.limits.work],[this.state.nodes,this.limits.nodes],[this.state.sequence,200000]])
    if(!Number.isSafeInteger(value)||value<0||value>cap)fail('budget_counter');
   for(const k of ['source','artifact','scratch'])if(!Number.isSafeInteger(this.state.bytes[k])||this.state.bytes[k]<0||this.state.bytes[k]>this.limits[k])fail('budget_counter');
   if(!Number.isSafeInteger(this.state.deadline))fail('budget_deadline');
   this.deadline=Math.min(deadline,this.state.deadline);this.state.deadline=this.deadline;this.state.limits=this.limits;
   this.monotonicEnd=performance.now()+Math.max(0,this.deadline-Date.now());
  }
  this.check();this.recover();
 }
 filePath(name){return Budget.prototype.filePath.call(this,name);}
 time(){if(Date.now()>=this.deadline||performance.now()>=this.monotonicEnd)fail('deadline');}
 meter(key,n=1,kind=null){
  if(!METRICS.includes(key)||!Number.isSafeInteger(n)||n<0)fail('metric');
  const m=this.state.metrics,phase=['source','oracle','candidate','structural'].includes(this.state.mode)?this.state.mode:'unit';
  for(const group of [m.total,m.phases[phase]??={}])group[key]=(group[key]||0)+n;
  if(kind){if(!['source','artifact','scratch'].includes(kind))fail('metric_class');const group=m.classes[kind]??={};group[key]=(group[key]||0)+n;}
 }
 check(n=1){
  this.time();if(!Number.isSafeInteger(n)||n<1||n>1000000)fail('work_request');
  if(this.availableWork<n){
   const reserve=Math.min(Math.ceil((n-this.availableWork)/256)*256,this.limits.work-this.state.work);
   if(reserve<n-this.availableWork)fail('work_limit');
   this.state.work+=reserve;this.availableWork+=reserve;this.persist();
  }
  this.availableWork-=n;
 }
 write(kind,n){this.check();if(!Object.hasOwn(this.state.bytes,kind)||!Number.isSafeInteger(n)||n<0||this.state.bytes[kind]+n>this.limits[kind])fail('byte_limit_'+kind);this.state.bytes[kind]+=n;}
 emit(){this.check();if(this.state.nodes+1>this.limits.nodes)fail('node_limit');this.state.nodes++;}
 grow(n){
  if(!Number.isSafeInteger(n)||n<0)fail('growth');
  this.poolRemaining??={};
  const pools=[['unit-quota.json','c3a-unit-quota-1',40*1024**2],
   ...(path.basename(this.dir).startsWith('e1-')?[['regression-quota.json','c3a-regression-quota-1',24*1024**2]]:[])];
  for(const [name,version,limit]of pools){
   const file=path.join(path.dirname(this.dir),name);if(!fs.existsSync(file))continue;
   const available=this.poolRemaining[name]||0;
   if(n>available){const q=JSON.parse(fs.readFileSync(file)),reserve=Math.ceil((n-available)/1048576)*1048576;
    if(q.version!==version||q.limit!==limit||!Number.isSafeInteger(q.reserved)||q.reserved<0||q.reserved+reserve>limit)fail('regression_file_limit');
    q.reserved+=reserve;this.meter('quota_writes');fs.writeFileSync(file,JSON.stringify(q));this.poolRemaining[name]=available+reserve;
   }
   this.poolRemaining[name]-=n;
  }
  if(!fs.existsSync(this.runQuota))return;
  if(n>this.growthRemaining){
   const q=JSON.parse(fs.readFileSync(this.runQuota)),reserve=Math.ceil((n-this.growthRemaining)/1048576)*1048576;
   if(q.version!=='c3a-quota-1'||q.limit!==1024**3-4*1048576||!Number.isSafeInteger(q.reserved)||q.reserved<0||q.reserved+reserve>q.limit)fail('run_file_limit');
   q.reserved+=reserve;this.meter('quota_writes');fs.writeFileSync(this.runQuota,JSON.stringify(q));this.growthRemaining+=reserve;
  }
  this.growthRemaining-=n;
 }
 persist(){
  this.time();this.meter('journal_writes');
  const cost=Buffer.byteLength(JSON.stringify(this.state))+64;
  if(this.state.bytes.scratch+cost>this.limits.scratch)fail('journal_budget');
  this.state.bytes.scratch+=cost;
  const text=JSON.stringify(this.state);if(Buffer.byteLength(text)>65536)fail('budget_bytes');
  this.grow(Math.max(0,Buffer.byteLength(text)-(fs.existsSync(this.file)?fs.statSync(this.file).size:0)));
  fs.writeFileSync(this.file,text);
 }
 attempt(key){this.check();if(!/^(source|oracle|candidate|structural)$/.test(key))fail('attempt_key');this.state.attempts[key]=(this.state.attempts[key]||0)+1;if(this.state.attempts[key]>this.limits.attempts)fail('attempt_limit');this.save();}
 point(stage){if(!this.replaying)this.fault(stage);}
 // Atomic private metadata is reserved before its temporary file is written.
 metadata(name,value,metric='checkpoint_writes'){
  const b=Buffer.from(JSON.stringify(value));if(b.length>this.limits.decoded)fail('quantum_limit');
  this.write('scratch',b.length);this.grow(b.length);this.persist();
  const target=this.filePath(name);this.meter(metric);
  fs.writeFileSync(target+'.tmp',b);fs.renameSync(target+'.tmp',target);
 }
 checkpoint(name,value){
  this.check();this.flush();const encoded=A.pack(value);
  this.metadata(name+'.json',encoded);this.persist();
 }
 load(name){
  this.check();const p=this.filePath(name+'.json');if(!fs.existsSync(p))return null;
  if(fs.statSync(p).size>this.limits.decoded)fail('quantum_limit');
  this.meter('data_reads',1,'scratch');return A.unpack(JSON.parse(fs.readFileSync(p)));
 }
 save(){this.check();this.flush();this.persist();}
 enqueue(entry){
  if(entry.b.length>PENDING_BYTES){this.flush();this.state.metrics.direct_bytes_max=Math.max(this.state.metrics.direct_bytes_max,entry.b.length);this.commit([entry]);return;}
  if(this.pending.length===PENDING_RECORDS||this.pendingBytes+entry.b.length>PENDING_BYTES)this.flush();
  this.pending.push(entry);this.pendingBytes+=entry.b.length;
  this.state.metrics.pending_records_max=Math.max(this.state.metrics.pending_records_max,this.pending.length);
  this.state.metrics.pending_bytes_max=Math.max(this.state.metrics.pending_bytes_max,this.pendingBytes);
  if(this.pending.length===PENDING_RECORDS)this.flush();
 }
 flush(){if(this.flushing||!this.pending.length)return;const entries=this.pending;this.pending=[];this.pendingBytes=0;this.commit(entries);}
 // A binary private payload avoids base64 copies of the batch in the journal.
 commit(entries){
  this.flushing=true;
  try{
   this.check(entries.length*3+16);this.state.sequence++;
   let bytes=0;const h=crypto.createHash('sha256'),descriptors=entries.map(e=>{
    h.update(e.b);const d={name:e.name,kind:e.kind,id:e.id,at:e.at,length:e.b.length,payload_at:bytes,hash:hash(e.b)};
    bytes+=e.b.length;return d;
   });
   const body={version:'c3a-batch-2',io:IO_VERSION,sequence:this.state.sequence,bytes,hash:h.digest('hex'),entries:descriptors};
   const manifest={...body,digest:hash(body)},payload=this.filePath('batch-payload.data');
   this.write('scratch',bytes);this.grow(Math.max(0,bytes-(fs.existsSync(payload)?fs.statSync(payload).size:0)));
   this.persist(); // All attempted data/index/emitted counters and payload costs precede writes.
   const fd=fs.openSync(payload,fs.existsSync(payload)?'r+':'w+');
   try{this.vectorWrite(fd,entries.map(e=>e.b),0,'wal_writes');}finally{fs.closeSync(fd);}
   this.metadata('batch-pending.json',manifest,'wal_writes');
   this.point('reservation-before-data');
   this.apply(entries);
   this.metadata('batch-pending.json',{version:'c3a-batch-2',done:true,sequence:body.sequence},'wal_writes');
   this.meter('batches');this.persist();
  }finally{this.flushing=false;}
 }
 vectorWrite(fd,buffers,position,metric,kind=null){
  let list=buffers,offset=position;
  while(list.length){
   this.time();this.meter(metric,1,kind);const n=fs.writevSync(fd,list,offset);if(n<1)fail('short_write');offset+=n;
   let consumed=n,next=0;while(next<list.length&&consumed>=list[next].length){consumed-=list[next].length;next++;}
   list=list.slice(next);if(consumed&&list.length)list[0]=list[0].subarray(consumed);
  }
 }
 apply(entries){
  // Group contiguous appends per store, preserving each store's exact append order.
  const groups=new Map();
  for(const e of entries){if(!groups.has(e.name))groups.set(e.name,[]);groups.get(e.name).push(e);}
  for(const [name,group]of groups){
   const registered=[...this.stores].find(s=>s.name===name&&!s.closed),p=this.filePath(name+'.data');
   const fd=registered?registered.data:fs.openSync(p,fs.existsSync(p)?'r+':'w+');
   try{
    let start=0;
    while(start<group.length){let end=start+1;while(end<group.length&&group[end].at===group[end-1].at+group[end-1].b.length)end++;
     this.vectorWrite(fd,group.slice(start,end).map(e=>e.b),group[start].at,'data_writes',group[start].kind);start=end;}
   }finally{if(!registered)fs.closeSync(fd);}
  }
  this.point('data-before-index');
  for(const [name,group]of groups){
   const registered=[...this.stores].find(s=>s.name===name&&!s.closed),p=this.filePath(name+'.index');
   const fd=registered?registered.index:fs.openSync(p,fs.existsSync(p)?'r+':'w+');
   try{
    let start=0;
    while(start<group.length){
     let end=start+1;while(end<group.length&&group[end].id===group[end-1].id+1)end++;
     const buffers=group.slice(start,end).map(e=>{const b=Buffer.alloc(16);b.writeBigUInt64BE(BigInt(e.at));b.writeUInt32BE(e.b.length,8);b.writeUInt32BE(0x43334131,12);return b;});
     this.vectorWrite(fd,buffers,group[start].id*16,'index_writes',group[start].kind);start=end;
    }
   }finally{if(!registered)fs.closeSync(fd);}
  }
  this.point('index-before-checkpoint');
 }
 recover(){
  const file=this.filePath('batch-pending.json');if(!fs.existsSync(file))return;
  if(fs.statSync(file).size>65536)fail('batch_manifest');
  const meta=JSON.parse(fs.readFileSync(file));
  if(meta.version!=='c3a-batch-2')fail('batch_version');if(meta.done===true)return;
  const {digest,...body}=meta;
  if(digest!==hash(body)||body.io!==IO_VERSION||body.sequence!==this.state.sequence||!Array.isArray(body.entries)||body.entries.length<1||body.entries.length>64||!Number.isSafeInteger(body.bytes)||body.bytes<1||body.bytes>this.limits.decoded*3)fail('batch_manifest');
  const r=this.state.recovery?.sequence===body.sequence?this.state.recovery:{sequence:body.sequence,attempts:0};
  if(!Number.isInteger(r.attempts)||r.attempts<0||++r.attempts>this.limits.attempts)fail('attempt_limit');
  this.state.recovery=r;this.replaying=true;this.flushing=true;
  try{
   const fd=fs.openSync(this.filePath('batch-payload.data'),'r'),entries=[],all=crypto.createHash('sha256');let bytes=0;
   try{
    if(fs.fstatSync(fd).size<body.bytes)fail('batch_payload');
    for(const d of body.entries){
     this.filePath(d.name+'.data');
     if(!['source','artifact','scratch'].includes(d.kind)||!Number.isSafeInteger(d.id)||d.id<0||d.id>200000||!Number.isSafeInteger(d.at)||d.at<0||!Number.isSafeInteger(d.length)||d.length<1||d.length>this.limits.decoded*3||d.payload_at!==bytes||d.at+d.length>this.limits[d.kind])fail('batch_entry');
     const b=Buffer.alloc(d.length);this.meter('wal_reads');
     if(fs.readSync(fd,b,0,b.length,bytes)!==b.length||hash(b)!==d.hash)fail('batch_payload');
     bytes+=b.length;all.update(b);entries.push({...d,b});
    }
   }finally{fs.closeSync(fd);}
   if(bytes!==body.bytes||all.digest('hex')!==body.hash||(entries.length>1&&bytes>PENDING_BYTES))fail('batch_payload');
   this.check(entries.length*3+16);
   for(const e of entries){this.emit();this.write(e.kind,e.b.length+16);}
   this.meter('replays');this.persist();this.apply(entries);
   this.metadata('batch-pending.json',{version:'c3a-batch-2',done:true,sequence:body.sequence},'wal_writes');this.persist();
  }finally{this.replaying=false;this.flushing=false;}
 }
}
class BatchStore {
 constructor(g,name,kind='scratch',{raw=false,maxId=200000}={}){
  this.g=g;this.name=name;this.kind=kind;this.raw=raw;this.maxId=maxId;this.closed=false;
  if(!['source','artifact','scratch'].includes(kind)||g.stores.size>=32)fail('store_limit');
  g.flush();this.dataPath=g.filePath(name+'.data');this.indexPath=g.filePath(name+'.index');
  this.data=fs.openSync(this.dataPath,fs.existsSync(this.dataPath)?'r+':'w+');
  this.index=fs.openSync(this.indexPath,fs.existsSync(this.indexPath)?'r+':'w+');
  this.end=fs.fstatSync(this.data).size;this.indexExtent=fs.fstatSync(this.index).size;
  if(this.end>g.limits[kind]||this.indexExtent>(maxId+1)*16||this.indexExtent%16)fail('store_extent');
  g.stores.add(this);
 }
 valid(i){if(!Number.isSafeInteger(i)||i<0||i>this.maxId)fail('index_id');}
 set(i,value){
  this.valid(i);this.g.emit();this.g.meter('sets',1,this.kind);
  const encoded=JSON.stringify(this.raw?value:A.pack(value));if(Buffer.byteLength(encoded)>this.g.limits.decoded)fail('quantum_limit');
  const b=Buffer.from(JSON.stringify({hash:hash(encoded),encoded}));
  this.g.write(this.kind,b.length+16);this.g.grow(b.length+Math.max(0,(i+1)*16-this.indexExtent));
  const e={name:this.name,kind:this.kind,id:i,at:this.end,b};
  this.end+=b.length;this.indexExtent=Math.max(this.indexExtent,(i+1)*16);this.g.enqueue(e);
 }
 decode(b){
  const x=JSON.parse(b);if(typeof x.encoded!=='string'||Buffer.byteLength(x.encoded)>this.g.limits.decoded||hash(x.encoded)!==x.hash)fail('frame_hash');
  return this.raw?JSON.parse(x.encoded):A.unpack(JSON.parse(x.encoded));
 }
 get(i){
  this.valid(i);this.g.check();this.g.meter('gets',1,this.kind);
  for(let j=this.g.pending.length-1;j>=0;j--){const e=this.g.pending[j];if(e.name===this.name&&e.id===i)return this.decode(e.b);}
  const ix=Buffer.alloc(16);this.g.meter('index_reads',1,this.kind);
  const n=fs.readSync(this.index,ix,0,16,i*16);if(!n||ix.readUInt32BE(12)===0)return null;
  if(n!==16||ix.readUInt32BE(12)!==0x43334131)fail('index_corrupt');
  const len=ix.readUInt32BE(8),offset=Number(ix.readBigUInt64BE());
  if(len<1||len>this.g.limits.decoded*3||offset+len>this.end)fail('frame_bounds');
  const b=Buffer.alloc(len);this.g.meter('data_reads',1,this.kind);
  if(fs.readSync(this.data,b,0,len,offset)!==len)fail('frame_missing');return this.decode(b);
 }
 close(){if(this.closed)return;this.g.flush();fs.closeSync(this.data);fs.closeSync(this.index);this.g.stores.delete(this);this.closed=true;}
}
class SelectedBudget {constructor(dir,options={}){return options.io===IO_VERSION?new BatchBudget(dir,options):new Budget(dir,options);}}
class SelectedStore {constructor(g,...args){return g.io===IO_VERSION?new BatchStore(g,...args):new Store(g,...args);}}
module.exports={Budget:SelectedBudget,Store:SelectedStore,LegacyBudget:Budget,LegacyStore:Store,
 BatchBudget,BatchStore,IO_VERSION,BUDGET_VERSION,PENDING_RECORDS,PENDING_BYTES,LIMITS,hash,fail,lexIds};

