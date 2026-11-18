"use strict";
require('./no-network');
const fs=require('node:fs'),path=require('node:path'),S=require('../../staged-context'),R=require('../../context-review'),AI=require('../../ai-config'),F=require('./fixture');
// Exact admitted raw receipts and review; profile/aspect vectors remain explicitly synthetic.
F.context=()=>{
 const p=require('../one-case-retest-plan').prepare(),c=p.cases[0],folder=path.resolve(__dirname,'../../../specs/tasks/M3-evaluation/pilot-20261117-one-case-quotation');
 const ledger=JSON.parse(fs.readFileSync(folder+'/ledger.json','utf8')),records=ledger.records;
 const decision=S.resolve(S.parse(records[0].raw_output),c.input),plan=S.partition(decision,c.ranked,p.library),raw=S.parse(records[1].raw_output),review=S.merge(raw,c.input,c.ranked,p.library,decision,plan);
 const receipts=records.map((r,i)=>({stage:r.stage,prompt_sha256:require('node:crypto').createHash('sha256').update(i?S.domainPrompt(decision,plan,c.ranked,p.library):S.decisionPrompt(c.input)).digest('hex'),schema_sha256:R.hash(i?S.domainSchema(plan):S.decisionSchema()),original_request_hash:r.request_hash,thinking_config:{thinkingLevel:'LOW'},raw_output:r.raw_output,usage:r.usage,finish_reason:r.finish_reason,model_version:r.model_version}));
 review.staged_context.receipts=receipts;
 const bundle={version:R.VERSION,prompt_version:S.PROMPT_VERSION,schema_sha256:S.contractHash(),staged_context:review.staged_context,scope:review.scope,model:review.model,aspects:Object.fromEntries(Object.entries(review.aspects).map(([id,a])=>[id,{...a,vector:F.basis,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:'mr1-aspect1',text_sha256:R.hash(a.text)}])),library_hash:review.library_hash,exclusions:review.exclusions,raw_chain:review.raw_chain};
 return {input:{...c.input,location:[47.59,7.61],locationSource:'auto'},library:p.library,ranked:c.ranked,review,bundle,meta:{ai_source:'saved_admitted_review_offline',model:records[0].model_version,prompt_version:S.PROMPT_VERSION,schema_sha256:S.contractHash(),request_count:2,stages:receipts,thinking_config:{thinkingLevel:'LOW'}},raw:{decision:S.parse(records[0].raw_output),domain:raw}};
};
const {audit}=require('./worker');const cpuStart=process.cpuUsage();
if(require.main===module){const config=JSON.parse(process.argv[2]),file=process.argv[3];const save=r=>{if(file){fs.writeFileSync(file+'.tmp',JSON.stringify(r));fs.renameSync(file+'.tmp',file);}};audit(config,save).then(r=>{r.cpu_seconds=Object.fromEntries(Object.entries(process.cpuUsage(cpuStart)).map(([k,v])=>[k,v/1e6]));r.receipt_scope='exact admitted raw text/usage/review; synthetic vectors and profiles; zero new calls';save(r);console.log(JSON.stringify(r));}).catch(e=>{const r={status:'fixture_refused',config,error:String(e.message).slice(0,400),real_provider_calls:0,database_rpcs:0};save(r);console.log(JSON.stringify(r));process.exitCode=1;});}
