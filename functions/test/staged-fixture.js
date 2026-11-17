"use strict";
// Source-pinned synthetic SDK only: never converts any historical model record.
function decision(input,{result='pass',scope='building',anchor='home',place='',quote=input.clarification||input.description,message='One clear synthetic decision.'}={}){
 const q={field:input.clarification?'clarification':'description',quote};
 return {result,message,questions:result==='needs_clarification'?['Which building and entrance need repair?']:[],decision:result==='pass'?q:null,scope:result==='pass'?scope:null,scope_evidence:result==='pass'?q:null,affected_place:null,affected_group:null,location_reference:result==='pass'?{anchor,place}:null,location_evidence:result==='pass'&&anchor!=='none'?q:null,unresolved_facts:result==='needs_clarification'?['Affected place is unspecified.']:[],contradictions:[]};
}
function domain(d,plan,{accept=plan.domain_ids.slice(0,1),result='pass'}={}){
 const evidence=d.decision.quote;
 return {result,message:'Synthetic domain review.',questions:result==='needs_clarification'?['Which decision is intended?']:[],aspects:result==='pass'?[{id:'a',text:evidence,demographics:{},demographic_evidence:[]}]:[],plan_hash:plan.plan_hash,reviews:Object.fromEntries(plan.domain_ids.map(id=>[id,{verdict:result!=='pass'?'defer':accept.includes(id)?'accept':'exclude',aspect_id:result==='pass'&&accept.includes(id)?'a':'',evidence:result==='pass'?evidence:'',reason_code:result!=='pass'?'missing_fact':accept.includes(id)?'none':'different_context'}]))};
}
function install(helper,options=()=>({})){
 let d,opts;
 helper._setClientForTests({models:{generateContent:async request=>{
  let raw;
  if(request.config.responseJsonSchema.properties.decision){
   const input=JSON.parse(request.contents.split('INPUT_JSON=')[1]);opts=options(input)||{};opts.onReview?.();d=decision(input,opts);raw=d;
  }else{const schema=request.config.responseJsonSchema;raw=domain(d,{plan_hash:schema.properties.plan_hash.enum[0],domain_ids:Object.keys(schema.properties.reviews.properties)},opts);}
  return {text:JSON.stringify(raw),candidates:[{finishReason:'STOP'}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:20,thoughtsTokenCount:3,totalTokenCount:33}};
 }}});
}
module.exports={decision,domain,install};
