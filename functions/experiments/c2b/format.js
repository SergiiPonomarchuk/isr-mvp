"use strict";
const A=require('../publication/artifact');
const VERSION='c2b-emulator-1';
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&Object.getPrototypeOf(v)===Object.prototype?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const digest=v=>A.hash(A.pack(canonical(v)));
function legacy(value){if(value?.publication_version!==undefined||value?.prototype_version!==undefined)A.fail('publication_adapter_required');return value;}
function token(root){if(!root||!root.build_id||!root.manifest_hash||!Number.isInteger(root.epoch)||!Number.isInteger(root.member_count)||root.member_count<1||root.member_count>19)A.fail('publication_format');return {publication_version:VERSION,issue_id:root.issue_id,build_id:root.build_id,manifest_hash:root.manifest_hash,epoch:root.epoch,member_count:root.member_count};}
function same(a,b){return digest(a)===digest(b);}
function text(value,required=false){if(typeof value!=='string'||Buffer.byteLength(value)>2048||(required&&!value.trim()))A.fail('text_limit');return value;}
function id(value){if(typeof value!=='string'||!/^[-a-zA-Z0-9_]{1,48}$/.test(value))A.fail('operation_id');return value;}
module.exports={VERSION,canonical,digest,legacy,token,same,text,id};
