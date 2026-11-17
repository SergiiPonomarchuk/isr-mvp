"use strict";
// Static local audit: no client, credential loader, fetch, database or provider use.
const fs=require('node:fs'),path=require('node:path');
const P=require('../experiments/candidate-review'),R=require('../context-review');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'specs/tasks/M3-evaluation');
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const library=require('../data/analyzer_examples.json');
const ranked=read('pilot-20261117-two-case/ledger.json').cases['compound-lock-software-clarified'].raw_chain.ranked;
const input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
const bytes=value=>Buffer.byteLength(typeof value==='string'?value:JSON.stringify(value));
function complexity(value,depth=0,result={objects:0,arrays:0,max_depth:0,required_keys:0,any_of_branches:0}){
 if(!value||typeof value!=='object')return result;
 result.max_depth=Math.max(result.max_depth,depth);
 if(Array.isArray(value))result.arrays++;else result.objects++;
 if(Array.isArray(value.required))result.required_keys+=value.required.length;
 if(Array.isArray(value.anyOf))result.any_of_branches+=value.anyOf.length;
 for(const child of Object.values(value))complexity(child,depth+1,result);return result;
}
const rows=[];
for(const count of [1,3,10,100]){
 const selected=ranked.slice(0,count),schema=P.schema(selected,library),prompt=P.prompt(input,selected,library),ids=P.ids(selected,library);
 const fixture={result:'pass',message:'Synthetic fixture only; no semantic quality claim.',questions:[],scope:'building',location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:input.clarification,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(ids.map(id=>[id,id==='1'?'a:a:'+input.clarification:'x:Synthetic other affected context.']))};
 P.validate(JSON.stringify(fixture),input,selected,library);
 const long=JSON.parse(JSON.stringify(fixture));for(const id of ids)if(id!=='1')long.reviews[id]='x:'+'r'.repeat(500);
 const requestBytes=bytes({contents:prompt,responseJsonSchema:schema});
 rows.push({candidates:ids.length,prompt_bytes:bytes(prompt),schema_bytes:bytes(schema),request_envelope_bytes:requestBytes,input_32768_byte_guard_fits:requestBytes<=32768,synthetic_concise_output_bytes:bytes(fixture),legal_long_reason_output_bytes:bytes(long),long_output_fits_8192_byte_proxy:bytes(long)<=8192,structure:complexity(schema),schema_sha256:R.hash(schema)});
}
const result={version:P.VERSION,offline_only:true,provider_calls:0,embedding_texts:0,firestore_rpcs:0,rows,output_limit_tokens:8192,output_measurement:'UTF-8 byte proxy, not Gemini tokenization or provider grammar admission. The long fixture demonstrates uncertainty within the unchanged legal reason bound.',actual_provider_admission:'not tested',actual_semantic_quality:'not tested',runtime_integrated:false};
const request=P.prepare(input,ranked,library);
fs.writeFileSync(path.join(dir,'candidate-prototype-request.json'),JSON.stringify(request,null,2)+'\n');
result.prepared_request_sha256=R.hash(request);
fs.writeFileSync(path.join(dir,'candidate-prototype-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
