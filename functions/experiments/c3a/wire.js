"use strict";
// Installed SDK serializer, with a non-client dependency stub. No Firestore instance.
const {Serializer}=require('@google-cloud/firestore/build/src/serializer'),protobuf=require('google-gax').protobuf,{fail}=require('./disk');
const root=protobuf.Root.fromJSON(require('@google-cloud/firestore/build/protos/v1.json')),Commit=root.lookupType('google.firestore.v1.CommitRequest'),Document=root.lookupType('google.firestore.v1.Document');
const serializer=new Serializer({_settings:{ignoreUndefinedProperties:false,useBigInt:false},doc(){fail('reference_refused');}}),database='projects/demo-c3a-offline/databases/(default)';
class Wire{
 constructor(){this.max_commit_bytes=0;this.max_document_bytes=0;this.commits=0;this.total_bytes=0;this.pending=[];}
 size(writes){return Commit.encode({database,transaction:Buffer.alloc(128),writes}).finish().length;}
 add(index,data){const name=database+'/documents/issue_drafts/c3a/builds/offline/nodes/n'+index,fields=serializer.encodeFields(data),doc={name,fields};const bytes=Document.encode(doc).finish().length;if(bytes>512*1024)fail('document_bytes');this.max_document_bytes=Math.max(this.max_document_bytes,bytes);const write={update:doc,currentDocument:{exists:false}},checkpoint={update:{name:database+'/documents/issue_drafts/c3a/builds/offline',fields:serializer.encodeFields({cursor:index,version:'c3a-offline-1'})},updateMask:{fieldPaths:['cursor','version']}};if(this.pending.length&&(this.pending.length+2>16||this.size([...this.pending,write,checkpoint])>16384))this.flush();if(this.size([write,checkpoint])>16384)fail('commit_bytes');this.pending.push(write);this.checkpoint=checkpoint;}
 flush(){if(!this.pending.length)return;const bytes=this.size([...this.pending,this.checkpoint]);if(bytes>16384||this.pending.length+1>16)fail('commit_bytes');this.max_commit_bytes=Math.max(this.max_commit_bytes,bytes);this.total_bytes+=bytes;this.commits++;this.pending=[];}
 result(){this.flush();return {max_commit_bytes:this.max_commit_bytes,max_document_bytes:this.max_document_bytes,commits:this.commits,total_bytes:this.total_bytes,transaction_token_bytes:128,server_acceptance:false,db_instances:0};}
}
module.exports={Wire};
