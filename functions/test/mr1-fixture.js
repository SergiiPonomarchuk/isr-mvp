"use strict";
// Deterministic context-review provider for opt-in historical endpoint rehearsals.
module.exports=function configure(helper,AI,v,{semantic=false,sigma=30,onReview=()=>{}}={}) {
 const R=require("../context-review");
 const library={embedding_model:AI.EMBED_MODEL,examples:[{id:"fixture",title:"Building repair",vector:v,params:{classification:{scope_type:"building",issue_category:"building.security.locks"},relevance_weights:{w_demographic:0,w_geographic:semantic?0:1,w_semantic:semantic?1:0,w_social:0},aggregation_weights:{w_relevance:.7,w_expertise:.1,w_contribution:.2},geographic_parameters:{mu_distance_meters:40,sigma_distance_meters:sigma},expertise_domain_parameters:{CBC_adjustment_factor:1,expertise_domain:"locksmith.security"},resources_needed:[]}}]};
 helper._setExamplesForTests(library);
 helper.embedTexts=async texts=>texts.map(()=>v);
 helper.reviewContext=async(input,ranked,lib)=>{
  onReview();const raw={result:"pass",message:"One clear synthetic building decision.",scope:"building",location_reference:{anchor:"home",place:""},accepted:[{id:"fixture",aspect_id:"a",evidence:input.description}],excluded:{},aspects:[{id:"a",text:input.description,demographics:{},demographic_evidence:[]}]};
  return {result:R.validate(raw,input,ranked,lib),raw,meta:{ai_source:"model",model:AI.TEXT_MODEL,prompt_version:R.PROMPT_VERSION,schema_sha256:R.schemaHash(),examples_used:["fixture"]}};
 };
};
