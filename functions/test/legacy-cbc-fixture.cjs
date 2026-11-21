"use strict";
// Opt-in, per-test-process historical contract. Never loaded by production tools.
// Keep old paid receipts and approvals immutable; new-policy tests do not install this.
function install(){
 const fs=require('node:fs'),path=require('node:path');
 const file=path.resolve(__dirname,'../data/analyzer_examples.json'),read=fs.readFileSync;
 const library=JSON.parse(read(file,'utf8')),pin=require('./fixtures/legacy-cbc-library.json');
 library.source_sha256=pin.source_sha256;
 for(const e of library.examples){
  const p=e.params.expertise_domain_parameters,old={};
  for(const[k,v]of Object.entries(p)){if(k==='domain_reasoning')old.CBC_adjustment_factor=pin.factors[String(e.id)];old[k]=v;}
  e.params.expertise_domain_parameters=old;
 }
 const text=JSON.stringify(library)+'\n';
 const context=require('./fixtures/legacy-cbc-context-review.cjs');
 if(context.hash(library)!==pin.library_hash)throw new Error('Historical CBC fixture differs from its frozen library');
 const id=require.resolve('../context-review');require(id);require.cache[id].exports=context;
 const libId=require.resolve('../data/analyzer_examples.json');require(libId);require.cache[libId].exports=library;
 fs.readFileSync=function(p,...args){
  if(typeof p==='string' && path.resolve(p)===file)return typeof args[0]==='string'||args[0]?.encoding?text:Buffer.from(text);
  // Git's historical receipt hashes bind LF bytes; Windows may check them out as CRLF.
  if(typeof p==='string' && /pilot-20261117-grounding[\\/]D1-(01-live|02)\.json$/.test(p)){
   const bytes=Buffer.from(read.call(this,p).toString('utf8').replace(/\r\n/g,'\n'));
   return typeof args[0]==='string'||args[0]?.encoding?bytes.toString('utf8'):bytes;
  }
  return read.call(this,p,...args);
 };
}
module.exports={install};
