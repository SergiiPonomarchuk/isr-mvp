"use strict";
// Offline plan generation. No SDK client, credential loader, fetch or database.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const R=require('../context-review');
const root=path.resolve(__dirname,'../..'),base='specs/tasks/M3-evaluation/';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,base+name),'utf8'));
function generate(){
 const request=read('staged-domain-request.json'),response=read('pilot-20261117-staged-check/attempt-1-response.json');
 const raw=JSON.parse(response.text),state=read('pilot-20261117-staged-check/validated-review.json');
 const library=JSON.parse(fs.readFileSync(path.join(root,'functions/data/analyzer_examples.json'),'utf8'));
 const previous=read('staged-check-approval.json');
 const files=['functions/tools/analyzer-evaluation-plan.js','functions/package.json','functions/package-lock.json',...Object.keys(previous.pins),base+'staged-check-approval.json',...previous.receipts,base+'pilot-20261117-staged-check/ledger.json',base+'pilot-20261117-staged-check/attempt-1-request.json',base+'pilot-20261117-staged-check/attempt-1-response.json',base+'pilot-20261117-staged-check/validated-review.json',base+'staged-domain-request.json',base+'staged-decision-fixture.json',base+'staged-scope-plan.json','functions/ai-config.js','functions/context-review.js','functions/context-schema.js','functions/experiments/review-stages.js','functions/data/analyzer_examples.json'];
 const freeze=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
 const ids=state.plan.compatible_ids;
 const knownFalse=library.examples.filter(e=>raw.reviews[e.id]?.startsWith('x:context:incompatible scope')).map(e=>({id:String(e.id),reference_scope:e.params.classification.scope_type,claimed_reason:raw.reviews[e.id]}));
 const facts={fixture_id:'confirmed-lock-domain',source:'author Confirm both; frozen U6/context rules',decision_already_chosen:true,expected_anchor:'home',expected_scope:'building',required_domain_ids:ids,required_full_chain_count:100,required_scope_proof_count:81,must_retain_reference_ids:['1'],other_retention_judgments:'human adjudication; scope compatibility alone does not imply acceptance',original_decision_resolution:'author-confirmed fixture, not automatic extraction'};
 const historical={model:request.model,thinking_config_present:Object.hasOwn(request.config,'thinkingConfig'),documented_current_default:'minimal',actual_historical_internal_effort:'not inferred',result:raw.result,no_repeated_choice:raw.questions.length===0,actual_anchor:raw.location_reference.anchor,known_false_scope_claims:knownFalse,domain_keys:Object.keys(raw.reviews).length,requires_human_review:true,semantic_acceptance:false,usage:response.usage};
 const fixtures=[facts,
  {fixture_id:'personal-help',case_id:'D1-09',policy:'eligible regardless of private/nonmunicipal nature',outcome:'accurate reference-gap or factual clarification may be valid; pass is not mandatory',reference_scope:'city',reference_id:'51',retention_gold:'unresolved; author review before any actual new case request'},
  {fixture_id:'home-anchor',input:'Our apartment entrance lock needs repair.',expected_anchor:'home',source:'synthetic U6 fixture'},
  {fixture_id:'work-anchor',input:'At my workplace Argo Industry, repair the loading door.',expected_anchor:'work',source:'synthetic U6 fixture'},
  {fixture_id:'distinct-property-anchor',input:'My separate garage needs its door repaired.',expected_anchor:'property',source:'synthetic U6 fixture'},
  {fixture_id:'external-place-anchor',input:'Repair the pothole on Hauptstraße, Weil am Rhein, Deutschland.',expected_anchor:'named_place',source:'synthetic U6 fixture; no geocoding'},
  {fixture_id:'genuinely-vague',input:'We need help. Something should be done.',expected_outcome:'needs_clarification',source:'existing vague-help case'},
  {fixture_id:'multi-reference',type:'synthetic arithmetic fixture',semantic_gold:'not annotated; no claim of real-model multi-reference acceptance'}];
 const arms=[{id:'existing-low',model:'gemini-3.1-flash-lite',input_per_million:.25,output_per_million:1.5},{id:'candidate-low',model:'gemini-3.5-flash-lite',input_per_million:.30,output_per_million:2.5}];
 const prepared={};
 for(const arm of arms){
  const next=JSON.parse(JSON.stringify(request));next.model=arm.model;next.config.thinkingConfig={thinkingLevel:'LOW'};prepared[arm.id]=next;
  const bytes=Buffer.byteLength(JSON.stringify({contents:next.contents,responseJsonSchema:next.config.responseJsonSchema}));
  arm.input_envelope_bytes=bytes;arm.input_token_proxy=bytes+1024;arm.max_output_tokens=8192;
  arm.additional_thinking_buffer_tokens=8192;
  arm.reserved_usd_micros=Math.ceil(arm.input_token_proxy*arm.input_per_million+16384*arm.output_per_million);
  arm.request_sha256=R.hash(next);
 }
 return {version:'analyzer-offline-evaluation-plan-1',date:'2026-11-17 Europe/Kyiv',status:'proposal_not_authorized',freeze,historical,fixtures,arms,prepared,baseline_prior_reviews:23,baseline_reserved_usd_micros:368110,proposed_max_cumulative_reviews:25,proposed_new_reviews:2,new_embedding_texts:0,max_embedding_texts:45,max_embedding_posts:17,proposed_money_ceiling_usd:.5,cumulative_scenario_reservation_usd:(368110+arms.reduce((n,a)=>n+a.reserved_usd_micros,0))/1e6,execution_gate:'Before any thinking-enabled request verify generateContent combined thinking/output accounting and implement an exact guarded reservation. The 2x output scenario is a buffer, not a proven provider billing hard cap; unresolved accounting blocks execution.',quality_gate:'Independent factual review, not parser success or keyword absence. All free-text reasons require human adjudication; do not auto-promote a model.',provider_calls:0,runtime_changes:false};
}
function save(){const plan=generate();const {prepared,...summary}=plan;
 fs.writeFileSync(path.join(root,base+'analyzer-evaluation-plan.json'),JSON.stringify(summary,null,2)+'\n');
 for(const [id,request]of Object.entries(prepared))fs.writeFileSync(path.join(root,base+'analyzer-evaluation-request-'+id+'.json'),JSON.stringify(request,null,2)+'\n');
 console.log(JSON.stringify({provider_calls:0,fixtures:plan.fixtures.length,arms:plan.arms,cumulative_scenario_reservation_usd:plan.cumulative_scenario_reservation_usd}));
}
module.exports={generate};if(require.main===module)save();
