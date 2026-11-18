"use strict";
// Synchronous optimistic fake transactions. No Firebase imports or I/O.
const {fail,size}=require('./artifact');
const copy=x=>structuredClone(x);
class Store{
 constructor(snapshot){this.rows=new Map(snapshot?.rows||[]);this.sequence=snapshot?.sequence||0;this.versions=new Map(snapshot?.versions||[...this.rows].map(([p,r])=>[p,r.version]));this.metrics=[];}
 get(path){return copy(this.rows.get(path)?.value);}
 snapshot(){return copy({rows:[...this.rows],sequence:this.sequence,versions:[...this.versions]});}
 run(label,callback,fault={}){
  const reads=new Map(),creates=new Set(),writes=new Map();
  const tx={get:p=>{reads.set(p,this.versions.get(p)||0);return this.get(p);},set:(p,v)=>writes.set(p,{op:'set',value:copy(v)}),create:(p,v)=>{creates.add(p);writes.set(p,{op:'create',value:copy(v)});},delete:p=>writes.set(p,{op:'delete'})};
  const value=callback(tx);const json_bytes=size([...writes]);const metric={label,reads:reads.size,writes:writes.size,json_bytes,model_bound_bytes:256+json_bytes+128*(writes.size+reads.size)};if(fault.bounds&&(metric.writes>fault.bounds.writes||metric.model_bound_bytes>fault.bounds.bytes))fail('transaction_budget');if(fault.beforeCommit)fault.beforeCommit();
  for(const [p,v]of reads)if((this.versions.get(p)||0)!==v)fail('conflict');
  for(const p of creates)if(this.rows.has(p))fail('already_exists');
  if(fault.crash==='before')fail('crash_before_commit');
  const next=new Map(this.rows);let seq=this.sequence;const versions=new Map(this.versions);for(const[p,w]of writes){const version=++seq;versions.set(p,version);if(w.op==='delete')next.delete(p);else next.set(p,{value:copy(w.value),version});}
  this.rows=next;this.sequence=seq;this.versions=versions;
  this.metrics.push(metric);
  if(fault.crash==='after')fail('result_lost_after_commit');return value;
 }
 // Trusted fixture authority / explicit corruption injection, not a client API.
 inject(path,value){const version=++this.sequence;this.rows.set(path,{value:copy(value),version});this.versions.set(path,version);}
}
module.exports={Store};
