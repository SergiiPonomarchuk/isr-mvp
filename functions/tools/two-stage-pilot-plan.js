"use strict";
// Offline only. No SDK, credential loader, fetch, Firestore, or executable --apply.
const fs=require('node:fs'),path=require('node:path'),R=require('../context-review'),S=require('../staged-context'),AI=require('../ai-config');
const ROOT=path.resolve(__dirname,'../..'),DIR='specs/tasks/M3-evaluation/';
const LIMITS=Object.freeze({calls:4,bytes:65536,inputOverhead:8192,thinking:65536,visible:8192,usdMicros:550000});
const RESERVE=Math.ceil((LIMITS.bytes+LIMITS.inputOverhead)*.25+(LIMITS.thinking+LIMITS.visible)*1.5);
function request(contents,responseJsonSchema){return {model:AI.TEXT_MODEL,contents,config:{temperature:AI.TEMPERATURE,seed:AI.SEED,maxOutputTokens:8192,responseMimeType:'application/json',responseJsonSchema,thinkingConfig:{thinkingLevel:'LOW'},httpOptions:{retryOptions:{attempts:1}}}};}
function prepare(root=ROOT){
 const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),cases=read(DIR+'cases.json'),library=read('functions/data/analyzer_examples.json');
 const sources=[['D1-01-live','pilot-20261117-grounding/ledger.json'],['compound-lock-software-clarified','pilot-20261117-two-case/ledger.json']];
 const selected=sources.map(([id,file])=>{const c=cases.cases.find(c=>c.id===id),state=read(DIR+file).cases[id];if(!c||R.hash(c.input)!==state.input_sha256||R.hash(c.input)!==R.hash(state.input)||state.bundle&&state.bundle.library_hash!==R.hash(library))throw new Error('Cached source binding differs');const ranked=state.raw_chain.ranked;require('../multi-reference').select(ranked);return {id,input:c.input,ranked,source:DIR+file,input_hash:R.hash(c.input),ranking_hash:R.hash(ranked)};});
 const files=['functions/tools/two-stage-pilot-plan.js','functions/tools/two-stage-pilot-runner.js','functions/tools/mr1-pilot-budget.js','functions/ai-helper.js','functions/ai-config.js','functions/staged-context.js','functions/strict-json.js','functions/scope-compatibility.js','functions/context-review.js','functions/context-schema.js','functions/multi-reference.js','functions/demographics.js','functions/location.js','functions/isr.js','functions/package.json','functions/package-lock.json','functions/data/analyzer_examples.json',DIR+'cases.json',...sources.map(x=>DIR+x[1]),DIR+'pilot-20261117-cheapest-low/ledger.json'];
 const crypto=require('node:crypto'),pins=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 return {version:'two-stage-pilot-preflight-1',approved:false,model:AI.TEXT_MODEL,thinking:'LOW',limits:LIMITS,reserve_per_call_micros:RESERVE,max_new_reservation_micros:RESERVE*4,historical:{reviews:24,embedding_texts:14,embedding_posts:14,http_attempts:38,reserved_micros:482644},max_cumulative_reviews:28,max_cumulative_http_attempts:42,max_cumulative_reservation_micros:482644+RESERVE*4,cases:selected,library,library_hash:R.hash(library),contract_hash:S.contractHash(),pins,provider_calls:0};
}
class Guard{
 constructor(plan,persist=()=>{}){this.plan=JSON.parse(JSON.stringify(plan));this.persist=persist;this.records=[];this.index=0;this.stage='effective_decision';this.active=null;this.stopped=false;}
 fail(message){if(this.active)this.active.status='stopped_no_retry';this.stopped=true;this.persist(this);throw new Error(message);}
 expected(){const c=this.plan.cases[this.index];if(!c||this.stopped||this.stage==='done')this.fail('Pilot stopped or complete');return this.stage==='effective_decision'?request(S.decisionPrompt(c.input),S.decisionSchema()):request(S.domainPrompt(this.decision,this.partition,c.ranked,this.plan.library),S.domainSchema(this.partition));}
 reserve(args){
  if(this.active)this.fail('Parallel or nested request');
  const expected=this.expected();if(R.hash(args)!==R.hash(expected))this.fail('Request differs from source-bound staged contract');
  if(Buffer.byteLength(JSON.stringify(args))>LIMITS.bytes)this.fail('Request byte envelope exceeded');
  if(this.records.length>=LIMITS.calls||(this.records.length+1)*RESERVE>this.plan.limits.usdMicros)this.fail('Pilot allowance exhausted');
  this.active={case_id:this.plan.cases[this.index].id,stage:this.stage,request_hash:R.hash(args),schema_hash:R.hash(args.config.responseJsonSchema),reserved_micros:RESERVE,http_attempts:0,status:'reserved'};this.records.push(this.active);this.persist(this);return this.active;
 }
 transport(record){if(record!==this.active||this.stopped||record.http_attempts!==0)this.fail('Unreserved or repeated transport');record.http_attempts=1;record.status='sending';this.persist(this);}
 complete(record,response){
  if(record!==this.active||this.stopped||record.http_attempts!==1)this.fail('Invalid completion');
  record.raw_output=response.text;record.model_version=response.modelVersion||null;record.usage=response.usageMetadata||null;record.finish_reason=response.candidates?.[0]?.finishReason||null;this.persist(this);
  const u=record.usage;if(!u||!['promptTokenCount','candidatesTokenCount','totalTokenCount'].every(k=>Number.isFinite(u[k])&&u[k]>=0)||u.thoughtsTokenCount!=null&&(!Number.isFinite(u.thoughtsTokenCount)||u.thoughtsTokenCount<0))this.fail('Missing or invalid usage');
  record.reported_cost_micros=Math.ceil(u.promptTokenCount*.25+Math.max(u.candidatesTokenCount+(u.thoughtsTokenCount||0),u.totalTokenCount-u.promptTokenCount)*1.5);
  if(record.reported_cost_micros>record.reserved_micros||record.finish_reason!=='STOP')this.fail('Usage exceeded reservation or incomplete output');
  try{const raw=S.parse(response.text),c=this.plan.cases[this.index];
   if(this.stage==='effective_decision'){this.decision=S.resolve(raw,c.input);if(raw.result!=='pass')this.fail('Non-pass decision; human review required');if(raw.result==='pass'){this.partition=S.partition(this.decision,c.ranked,this.plan.library);if(this.partition.domain_ids.length){this.stage='domain_review';record.status='validated';this.active=null;this.persist(this);return;}}this.fail('No compatible reference; human review required');}
   else {this.result=S.merge(raw,c.input,c.ranked,this.plan.library,this.decision,this.partition);if(this.result.result!=='pass')this.fail('Non-pass domain review; human review required');}
  }catch(_){this.fail('Response failed staged validation');}
  record.status='validated';this.active=null;this.index++;this.stage=this.index===this.plan.cases.length?'done':'effective_decision';this.persist(this);
 }
}
module.exports={prepare,request,Guard,LIMITS,RESERVE};
if(require.main===module){if(process.argv.includes('--apply'))throw new Error('Offline preflight only; paid execution requires a reviewed launcher and explicit new allowance');const p=prepare();fs.writeFileSync(path.join(ROOT,DIR+'two-stage-pilot-preflight.json'),JSON.stringify({...p,library:undefined},null,2)+'\n');console.log(JSON.stringify({provider_calls:0,cases:p.cases.map(c=>c.id),max_text_calls:4,new_embedding_texts:0,proposed_cap_usd:.55,max_reservation_usd:p.max_new_reservation_micros/1e6,approved:false}));}
