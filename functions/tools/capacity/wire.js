"use strict";
const {Firestore}=require('@google-cloud/firestore'),protobuf=require('google-gax').protobuf;
const proto=protobuf.Root.fromJSON(require('@google-cloud/firestore/build/protos/v1.json'));
const Write=proto.lookupType('google.firestore.v1.Write'),Commit=proto.lookupType('google.firestore.v1.CommitRequest'),Document=proto.lookupType('google.firestore.v1.Document');
const db=new Firestore({projectId:'demo-capacity-offline'}),database='projects/demo-capacity-offline/databases/(default)';
function stored(v){if(v==null||typeof v==='boolean')return 1;if(typeof v==='number')return 8;if(typeof v==='string')return Buffer.byteLength(v)+1;if(v instanceof Date||typeof v.toDate==='function')return 8;if(typeof v.latitude==='number'&&typeof v.longitude==='number')return 16;if(Array.isArray(v))return v.reduce((n,x)=>n+stored(x),0);return 32+Object.entries(v).reduce((n,[k,x])=>n+Buffer.byteLength(k)+1+stored(x),0);}
function wire(op){const b=db.batch(),ref=db.doc(op.path);if(op.kind==='create')b.create(ref,op.data);else if(op.kind==='update')b.update(ref,op.data);else b.set(ref,op.data,op.options||{});if(b._ops.length!==1)throw new Error('Installed SDK operation interface changed');return b._ops[0].op();}
function varint(n){let bytes=1;while(n>=128){n=Math.floor(n/128);bytes++;}return bytes;}
class Counter{
 constructor(){this.bytes=Commit.encode({database,transaction:Buffer.alloc(32)}).finish().length;this.count=0;this.largest=0;this.largest_path=null;this.over_documents=0;}
 add(op){const w=wire(op),bytes=Write.encode(w).finish().length;this.bytes+=1+varint(bytes)+bytes;this.count++;const data=op.post||op.data;const name=database+'/documents/'+op.path;const size=Math.max(stored(data)+op.path.split('/').reduce((n,s)=>n+Buffer.byteLength(s)+1,16),Document.encode({name,fields:db._serializer.encodeFields(data)}).finish().length);if(size>this.largest){this.largest=size;this.largest_path=op.path;}if(size>=1048576-128)this.over_documents++;return w;}
 result(){return {wire_bytes:this.bytes,write_count:this.count,largest_document_bytes:this.largest,largest_document_path:this.largest_path,oversized_documents:this.over_documents,within_document_guard:this.over_documents===0,within_request_guard:this.bytes<=10*1024*1024-32768,transaction_token_bytes:32};}
}
function full(ops){return Commit.encode({database,transaction:Buffer.alloc(32),writes:ops.map(wire)}).finish().length;}
module.exports={db,wire,Counter,full,stored};
