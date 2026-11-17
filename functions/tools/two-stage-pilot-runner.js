"use strict";
// No CLI or credential loading. Explicit fresh approval and transport are required.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const R=require('../context-review'),{Guard}=require('./two-stage-pilot-plan'),{save}=require('./mr1-pilot-budget');
async function run({plan,root,folder,approval,apiKey,fetchFn}){
 if(!approval||approval.approved!==true||approval.plan_hash!==R.hash(plan)||approval.cap_micros!==550000||approval.calls!==4||typeof apiKey!=='string'||!apiKey||typeof fetchFn!=='function')throw new Error('Fresh bounded authorization/private transport required');
 const verify=()=>{for(const[f,h]of Object.entries(plan.pins))if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')!==h)throw new Error('Pinned source changed');};verify();
 // An existing directory, including an interrupted run, can never be resumed.
 fs.mkdirSync(folder);const file=path.join(folder,'ledger.json');fs.writeFileSync(file,JSON.stringify({status:'reserved',approval}),'utf8');
 const g=new Guard(plan,state=>save(file,{version:'two-stage-pilot-run-1',approval,status:state.stopped?'stopped_no_retry':state.stage==='done'?'completed_pending_semantic_review':'running',records:state.records,index:state.index,stage:state.stage}));
 let activeRequest,activeRecord;
 const transport=async(input,init)=>{
  verify();const req=new Request(input,init),url=new URL(req.url),body=await req.clone().json(),{httpOptions,...generationConfig}=activeRequest.config;
  if(req.method!=='POST'||url.origin!=='https://generativelanguage.googleapis.com'||url.pathname!=='/v1beta/models/gemini-3.1-flash-lite:generateContent'||url.search||Object.keys(body).some(k=>!['contents','generationConfig'].includes(k))||R.hash(body.generationConfig)!==R.hash(generationConfig)||body.contents?.length!==1||body.contents[0].parts?.length!==1||Object.keys(body.contents[0].parts[0]).length!==1||body.contents[0].parts[0].text!==activeRequest.contents)throw new Error('Unapproved SDK transport');
  g.transport(activeRecord);return fetchFn(new Request(req,{redirect:'error'}));
 };
 try{
  const {GoogleGenAI}=require('@google/genai'),client=new GoogleGenAI({apiKey,httpOptions:{retryOptions:{attempts:1},timeout:120000,fetch:transport}});
  while(g.stage!=='done'){
   verify();activeRequest=g.expected();activeRecord=g.reserve(activeRequest);
   save(path.join(folder,'request-'+g.records.length+'.json'),activeRequest);
   const response=await client.models.generateContent(activeRequest);g.complete(activeRecord,response);
   if(activeRecord.stage==='domain_review'&&g.result)save(path.join(folder,'result-'+g.index+'.json'),g.result);
  }
 }catch(_){g.stopped=true;if(g.active)g.active.status='failed_or_ambiguous';g.persist(g);}
 const summary={status:g.stopped?'stopped_no_retry':'completed_pending_semantic_review',calls_reserved:g.records.length,http_attempts:g.records.reduce((n,a)=>n+a.http_attempts,0),reserved_micros:g.records.reduce((n,a)=>n+a.reserved_micros,0),embedding_texts:0,firestore_rpcs:0,production_writes:0};save(path.join(folder,'summary.json'),summary);return summary;
}
module.exports={run};
