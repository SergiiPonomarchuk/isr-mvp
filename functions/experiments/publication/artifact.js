"use strict";
// Restricted C1 codec/manifest, not a Firestore persistence format.
const crypto=require('node:crypto');
const fail=code=>{throw Object.assign(new Error(code),{code});};
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const size=x=>Buffer.byteLength(JSON.stringify(x));
function pack(v){
 if(v===null)return ['null'];
 if(typeof v==='number'){if(!Number.isFinite(v))fail('nonfinite');const b=Buffer.alloc(8);b.writeDoubleBE(v);return ['number',b.toString('base64')];}
 if(typeof v==='string'||typeof v==='boolean')return [typeof v,v];
 if(v instanceof Date){if(!Number.isFinite(v.getTime()))fail('date');return ['date',v.toISOString()];}
 if(Array.isArray(v))return ['array',v.map(pack)];
 if(v&&Object.getPrototypeOf(v)===Object.prototype)return ['object',Object.entries(v).map(([k,x])=>[k,pack(x)])];
 fail('unsupported_value');
}
function unpack(v){
 if(!Array.isArray(v)||v.length<1||v.length>2)fail('codec_shape');const [t,x]=v;
 if(t==='null'&&v.length===1)return null;
 if(t==='string'&&typeof x==='string'||t==='boolean'&&typeof x==='boolean')return x;
 if(t==='number'&&typeof x==='string'){const b=Buffer.from(x,'base64');if(b.length!==8||b.toString('base64')!==x||!Number.isFinite(b.readDoubleBE()))fail('number');return b.readDoubleBE();}
 if(t==='date'&&typeof x==='string'){const d=new Date(x);if(!Number.isFinite(d.getTime())||d.toISOString()!==x)fail('date');return d;}
 if(t==='array'&&Array.isArray(x))return x.map(unpack);
 if(t==='object'&&Array.isArray(x)){const out={};for(const pair of x){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||Object.hasOwn(out,pair[0]))fail('object');Object.defineProperty(out,pair[0],{value:unpack(pair[1]),enumerable:true,writable:true,configurable:true});}return out;}
 fail('codec_version');
}
function node(id,body){return {id,body,hash:hash([id,body])};}
function prepare(records,{fragment_bytes=192,fanout=4}={}){
 if(!Array.isArray(records)||!records.length||records.length>64||!Number.isInteger(fragment_bytes)||fragment_bytes<32||fragment_bytes>512||!Number.isInteger(fanout)||fanout<2||fanout>4)fail('plan_limits');
 const nodes=[],keys=new Set();let total=0;const add=body=>{const n=node('n'+String(nodes.length).padStart(5,'0'),body);nodes.push(n);return n;};
 for(const [ordinal,r] of records.entries()){
  if(!r||!['member','context','replay'].includes(r.kind)||typeof r.key!=='string'||r.key.length>80||keys.has(r.key))fail('record');keys.add(r.key);
  const raw=Buffer.from(JSON.stringify(pack(r.data)));total+=raw.length;if(total>65536)fail('payload_limit');const parts=Math.ceil(raw.length/fragment_bytes);
  for(let part=0;part<parts;part++)add({version:1,type:'fragment',key:r.key,kind:r.kind,ordinal,part,parts,payload:raw.subarray(part*fragment_bytes,(part+1)*fragment_bytes).toString('base64')});
 }
 let level=[...nodes];while(level.length>1){const next=[];for(let i=0;i<level.length;i+=fanout)next.push(add({version:1,type:'branch',children:level.slice(i,i+fanout).map(n=>({id:n.id,hash:n.hash}))}));level=next;}
 if(nodes.length>512)fail('node_limit');return {version:1,root_id:level[0].id,root_hash:level[0].hash,node_count:nodes.length,record_count:records.length,payload_bytes:total,nodes};
}
function validate(meta,read){
 if(meta.version!==1||!Number.isInteger(meta.node_count)||meta.node_count<1||meta.node_count>512||!Number.isInteger(meta.record_count)||meta.record_count<1||meta.record_count>64||!Number.isInteger(meta.payload_bytes)||meta.payload_bytes<1||meta.payload_bytes>65536)fail('manifest_version');
 const seen=new Set(),fragments=[];function walk(id,expected,depth){
  if(depth>12||seen.has(id)||seen.size>=meta.node_count)fail('manifest_cycle');seen.add(id);const n=read(id);
  if(!n||n.id!==id||n.hash!==expected||hash([id,n.body])!==expected)fail('node_hash');if(Object.keys(n).sort().join()!=='body,hash,id')fail('node_fields');const b=n.body;const allowed=b.type==='branch'?'children,type,version':'key,kind,ordinal,part,parts,payload,type,version';if(Object.keys(b).sort().join()!==allowed)fail('node_fields');
  if(b.version!==1)fail('node_version');
  if(b.type==='branch'){if(!Array.isArray(b.children)||!b.children.length||b.children.length>4)fail('branch');for(const c of b.children)walk(c.id,c.hash,depth+1);}
  else if(b.type==='fragment')fragments.push(b);else fail('node_kind');
 }
 walk(meta.root_id,meta.root_hash,0);if(seen.size!==meta.node_count)fail('node_count');
 const groups=new Map();let bytes=0;for(const f of fragments){if(!['member','context','replay'].includes(f.kind)||!Number.isInteger(f.ordinal)||f.ordinal<0||!Number.isInteger(f.parts)||f.parts<1||f.parts>512||!Number.isInteger(f.part)||f.part<0||f.part>=f.parts||typeof f.payload!=='string'||f.payload.length>684||typeof f.key!=='string'||f.key.length>80)fail('fragment');const chunk=Buffer.from(f.payload,'base64');if(chunk.toString('base64')!==f.payload)fail('fragment_bytes');bytes+=chunk.length;if(bytes>65536)fail('payload_limit');if(!groups.has(f.ordinal))groups.set(f.ordinal,[]);groups.get(f.ordinal).push({...f,chunk});}
 if(groups.size!==meta.record_count||bytes!==meta.payload_bytes)fail('record_count');
 const out=[],keys=new Set();for(let i=0;i<groups.size;i++){const parts=groups.get(i);if(!parts||parts.length!==parts[0].parts)fail('parts');for(let j=0;j<parts.length;j++)if(parts[j].part!==j||parts[j].parts!==parts.length||parts[j].key!==parts[0].key||parts[j].kind!==parts[0].kind)fail('parts_order');const key=parts[0].key;if(typeof key!=='string'||keys.has(key))fail('duplicate_key');keys.add(key);let data;try{data=unpack(JSON.parse(Buffer.concat(parts.map(p=>p.chunk)).toString('utf8')));}catch(e){fail(e.code||'payload_codec');}out.push({key,kind:parts[0].kind,data});}
 return out;
}
module.exports={fail,hash,size,pack,unpack,prepare,validate};
