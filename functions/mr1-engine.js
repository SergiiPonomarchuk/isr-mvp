"use strict";
const AI=require("./ai-config"), ISR=require("./isr"), M=require("./multi-reference"), Review=require("./context-review");
const {evaluateDemographics}=require("./demographics");
const {demographicRulesForScope}=require("./issue-scope");
const {nearestAnchor,gScore}=require("./geo");
const {vector}=require("./similar-issues");
const round=x=>Math.round(x*1000)/1000;
const FAMILY={spouse:.3,partner:.3,wife:.3,husband:.3,parent:.2,father:.2,mother:.2,child:.2,son:.2,daughter:.2,sibling:.2,sister:.2,brother:.2,grandparent:.1,grandfather:.1,grandmother:.1,grandchild:.1,grandson:.1,granddaughter:.1,"close friend":.1,aunt:0,uncle:0,niece:0,nephew:0,cousin:0,"mother-in-law":0,"father-in-law":0,"sister-in-law":0,"brother-in-law":0,"son-in-law":0,"daughter-in-law":0};
function error(message,status=409){throw Object.assign(new Error(message),{status});}
function eligibleLinks(user,diagnostics={ignored_untyped_links:0}){
 if(!Array.isArray(user.socialRelations))error("A profile's relationship data is unavailable.");
 const result={};
 for(const rel of user.socialRelations){
  const type=String(rel.type||"").trim().toLowerCase();
  if(rel.tie==null && !Object.prototype.hasOwnProperty.call(FAMILY,type)){diagnostics.ignored_untyped_links++;continue;}
  const uid=String(rel.relative==null?"":rel.relative);
  if(!/^\d+$/.test(uid))error("A relationship has an invalid profile identifier.");
  const tie=rel.tie==null?FAMILY[type]:rel.tie;
  if(typeof tie!=="number" || !Number.isFinite(tie) || tie<0 || tie>1)error("A relationship has an invalid tie value.");
  result[uid]=Math.max(result[uid]||0,tie);
 }
 return result;
}
function checkVectors(data){
 const p=vector(data&&data.profile_vector);
 if(!data || data.embedding_model!==AI.EMBED_MODEL || data.embedding_dims!==AI.EMBED_DIMS || data.embedding_template!==AI.EMBED_TEMPLATE_VERSION || p.length!==AI.EMBED_DIMS || !p.every(Number.isFinite))error("A profile needs complete current embeddings before this public can be calculated.");
 return p;
}
function evaluate(user,vectors,bundle,location,registeredAt){
 const p=checkVectors(vectors),uid=String(user.uid),age=ISR.ageInYears(user.birthDate,registeredAt),out={};
 const near=nearestAnchor(user.geography,location);
 const g=near?gScore(near.distance,bundle.model.mu,bundle.model.sigma):0;
 const cache=new Map();
 for(const ref of bundle.model.refs){
  const a=bundle.aspects[ref.aspect_id],v=a.vector;
  if(!Array.isArray(v) || v.length!==AI.EMBED_DIMS || !v.every(Number.isFinite))error("The issue's aspect vector is unavailable.");
  const rules=demographicRulesForScope(a.demographics,{scope_type:bundle.scope});
  const d=evaluateDemographics(user,rules,Number(registeredAt.slice(0,4)));
  const key=ref.aspect_id+":"+ref.cbc_adjustment;
  if(!cache.has(key)){
   const skill=vectors.experience_vectors||{};
   for(const s of user.skills||[])if(["education","work experience"].includes(s.type)){
    const sv=vector(skill[String(s.id)]);if(sv.length!==AI.EMBED_DIMS || !sv.every(Number.isFinite))error("A profile has an unavailable skill vector.");
   }
   cache.set(key,{education:ISR.educationSum(user.skills,skill,v,ref.cbc_adjustment),experience:ISR.experienceSum(user.skills,skill,v)});
  }
  out[ref.id]={D:d.score,G:g,S:Math.max(0,ISR.cosine(p,v)),X:0,...cache.get(key)};
 }
 return {uid,age,aspects:out,anchor_type:near?near.type:null};
}
function pack(row,user,aspects,sourceLinks){
 return {user_id:String(user.uid),displayName:user.displayName||`User ${user.uid}`,cohort:row.cohort,
  D_score:row.effective.D,G_score:row.effective.G,S_score:row.effective.S,X_score:row.effective.X,
  D_match:null,G_anchor_type:aspects.anchor_type,relevance_score:round(row.R),direct_relevance:row.direct_relevance,
  social_addition:row.social_addition,social_source:row.social_source,social_tie:row.social_tie,
  education_expertise:round(Math.max(ISR.ageFloor(aspects.age),row.education_raw)),experience_expertise:round(row.experience),expertise_score:round(row.E),
  expertise_source:"mr1_aspects",contribution_score:0,accepted_rejected:null,scoring_version:Review.VERSION,
  mr1_evidence:aspects.aspects,social_links:sourceLinks||{}};
}
async function population(db,bundle,location,registeredAt){
 const snapshots=await db.collection("users").select("uid","displayName","birthDate","skills","geography","socialRelations","features","post").get();
 const users=snapshots.docs.map(d=>({id:d.id,data:d.data()})).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 const people=[],userById=new Map(),scored=new Map(),outgoing={},relationship_diagnostics={ignored_untyped_links:0};
 const digest=require("crypto").createHash("sha256");
 digest.update(registeredAt.slice(0,10));
 for(let i=0;i<users.length;i+=75){
  const chunk=users.slice(i,i+75),docs=await db.getAll(...chunk.map(u=>db.collection("user_vectors").doc(u.id)),{fieldMask:["profile_vector","experience_vectors","embedding_model","embedding_dims","embedding_template"]});
  for(let j=0;j<chunk.length;j++){
   const u=chunk[j].data;
   // Keep the deliberately incomplete nonparticipant profile, but never invent a score for a participant.
   if(!/^\d+$/.test(chunk[j].id))continue;
   if(!Array.isArray(u.skills))error("A participant profile has incomplete skill metadata.");
   if(String(u.uid)!==chunk[j].id)error("Profile/document identifiers disagree.");
   const vectors=docs[j].exists?docs[j].data():null;
   digest.update(Review.hash({user:u,vectors}));
   const score=evaluate(u,vectors,bundle,location,registeredAt);people.push(score);scored.set(score.uid,score);userById.set(score.uid,u);outgoing[score.uid]=eligibleLinks(u,relationship_diagnostics);
  }
 }
 const cohorts=M.cohorts(bundle.model,people,outgoing),members=cohorts.members.map(row=>pack(row,userById.get(row.uid),scored.get(row.uid),row.cohort==="A"?outgoing[row.uid]:{}));
 if(!members.length)error("No directly affected people were found for this context.");
 const weights={w_relevance:bundle.model.aggregation.R,w_expertise:bundle.model.aggregation.E,w_contribution:bundle.model.aggregation.C};
 const normalized=ISR.isrForPublic(members.map(m=>({uid:m.user_id,R:m.relevance_score,E:m.expertise_score})),weights);
 members.forEach((m,i)=>Object.assign(m,{normalized_relevance:round(normalized[i].R_norm),normalized_experience:round(normalized[i].E_norm),normalized_contribution:1,contribution_source:"constant",isr_score:round(normalized[i].isr)}));
 return {members,population_hash:digest.digest("hex"),population_count:people.length,A:cohorts.A.length,B:cohorts.B.length,relationship_diagnostics};
}
function joining(user,vectors,issue,bundle,existing){
 const scored=evaluate(user,vectors,bundle,issue.location,issue.created_at.toDate?issue.created_at.toDate().toISOString():issue.created_at);
 const row=M.member(bundle.model,scored.age,scored.aspects);Object.assign(row,{cohort:"explicit",direct_relevance:row.R,social_addition:0,social_source:null,social_tie:0});
 if(row.R<.15){
  for(const m of existing){
   const d=m.data;if(d.cohort!=="A" || !Object.prototype.hasOwnProperty.call(d.social_links||{},scored.uid))continue;
   const tie=d.social_links[scored.uid],add=bundle.model.relevance.X*tie;
   if(row.direct_relevance+add<=d.direct_relevance+1e-12 && add>row.social_addition)Object.assign(row,{R:row.direct_relevance+add,social_addition:add,social_source:String(d.user_id),social_tie:tie});
  }
 }
 row.effective.X=bundle.model.relevance.X?row.social_addition/bundle.model.relevance.X:0;
 return {...pack(row,user,scored,{}),membership_source:"explicit_join"};
}
module.exports={population,evaluate,eligibleLinks,joining,error,round};
