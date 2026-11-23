"use strict";
const AI=require("./ai-config"),Review=require("./context-review"),Engine=require("./mr1-engine"),Similar=require("./similar-issues"),Lifecycle=require("./lifecycle");
const {readTextInputs,paramsFromAi,makeDraft,paramsForCreate}=require("./params");
const {resolveIssueLocation}=require("./location");
const {aggregateValues}=require("./public-values");
const {GeoPoint}=require("firebase-admin/firestore");
const Staged=require("./staged-context");
const r3=Engine.round;
function inputHash(input){return Review.hash({title:input.title,description:input.description,clarification:input.clarification||"",submitterId:String(input.submitterId)});}
function flat(model){return {w_demographic:model.relevance.D,w_geographic:model.relevance.G,w_semantic:model.relevance.S,w_social:model.relevance.X,w_relevance:model.aggregation.R,w_expertise:model.aggregation.E,w_contribution:model.aggregation.C};}
function params(review){const m=review.model;return {...paramsFromAi({classification:review.classification,category:review.category,location_reference:review.location_reference,weights:{w_D:m.relevance.D,w_G:m.relevance.G,w_S:m.relevance.S,w_X:m.relevance.X},relevance_weights:{w_demographic:m.relevance.D,w_geographic:m.relevance.G,w_semantic:m.relevance.S,w_social:m.relevance.X},aggregation_weights:{w_relevance:m.aggregation.R,w_expertise:m.aggregation.E,w_contribution:m.aggregation.C},mu:m.mu,sigma:m.sigma,expertise_domain:review.expertise_domain,expertise_depth:"Multiple reviewed aspects",resources_needed:review.resources_needed,demographics:{},relevance_reasoning:review.context_message,aggregation_reasoning:"Normalized similarities over the reviewed compatible reference set."}),scoring_version:Review.VERSION};}
// Compute the public values from every member, never from the 25-row display preview.
async function publicValues(db,members){
 const taxonomies=[];
 for(let i=0;i<members.length;i+=100){
  const chunk=members.slice(i,i+100),byId=new Map(chunk.map(m=>[m.user_id,m]));
  const docs=await db.getAll(...chunk.map(m=>db.collection("users").doc(m.user_id)),{fieldMask:["values_taxonomy"]});
  docs.forEach(d=>{if(d.exists && d.data().values_taxonomy)taxonomies.push({relevance:byId.get(d.id).relevance_score,taxonomy:d.data().values_taxonomy});});
 }
 return aggregateValues(taxonomies);
}
async function check(db,body,helper,geocode,log){
 const input=readTextInputs(body),now=new Date().toISOString();
 const embedding=await helper.embedIssue(input.title,input.description);
 if(!embedding.ok)Engine.error("AI unavailable: the issue could not be embedded.",503);
 const selection=input.clarification? (await helper.embedTexts([AI.issueText(input.title,input.description)+"\nContext: "+input.clarification],AI.TASK_TYPE_ISSUE))[0]:embedding.vector;
 const ranked=helper.nearestExamples(selection,helper.loadExamples().examples.length).map(e=>({id:String(e.id),score:Math.max(0,Math.min(1,e.cosine))}));
 if(!ranked.length)Engine.error("The reference library is unavailable; no public was formed.",503);
 let reviewed;
 try{reviewed=await helper.reviewStagedContext(input,ranked,helper.loadExamples());}
 catch(error){if(error.staged_meta)await log({endpoint:"checkIssue",at:now,draftId:null,submitterUid:input.submitterId,input,meta:error.staged_meta,normalized:null,shown:null,embedding});throw error;}
 const {result:review,meta,raw}=reviewed;
 if(review.result!=="pass"){
  await log({endpoint:"checkIssue",at:now,draftId:null,submitterUid:input.submitterId,input,meta,normalized:review,shown:null,embedding});
  return {success:false,context_result:review.result,message:review.message,questions:review.questions,scoring_version:Review.VERSION};
 }
 // Persist paid-stage receipts before vector, population or publication work can fail.
 const ref=db.collection("issue_drafts").doc(),data=params(review);
 const logId=await log({endpoint:"checkIssue",at:now,draftId:ref.id,submitterUid:input.submitterId,input,meta,normalized:raw,shown:data,embedding});
 const aspects={};
 for(const a of Object.values(review.aspects))aspects[a.id]={...a};
 const unique=[...new Set(Object.values(aspects).map(a=>a.text))];
 const vectors=await helper.embedTexts(unique,AI.TASK_TYPE_ISSUE);
 unique.forEach((text,i)=>Object.values(aspects).filter(a=>a.text===text).forEach(a=>Object.assign(a,{vector:vectors[i],model:AI.EMBED_MODEL,dims:AI.EMBED_DIMS,task_type:AI.TASK_TYPE_ISSUE,template_version:"mr1-aspect1",text_sha256:Review.hash(text)})));
 const bundle={version:Review.VERSION,prompt_version:Staged.PROMPT_VERSION,schema_sha256:Staged.contractHash(),staged_context:review.staged_context,scope:review.scope,model:review.model,aspects,library_hash:review.library_hash,exclusions:review.exclusions,raw_chain:review.raw_chain};
 // Read only the creator's places; relationships are supplied by A, never by this lookup.
 const creatorSnap=await db.collection("users").doc(String(input.submitterId)).get({fieldMask:["geography"]});
 const loc=await resolveIssueLocation({reference:review.location_reference,geography:creatorSnap.exists?creatorSnap.data().geography||[]:[],requested:input.location,requestedSource:input.locationSource,geocode});
 const population=await Engine.population(db,bundle,loc.location,now);
 const duplicate=await Similar.findSimilar(db,{title:input.title,description:input.description,location:loc.location,vector:embedding.vector,classification:review.classification,mu_distance_meters:data.mu},input.submitterId);
 const {ok,error,...storedEmbedding}=embedding;
 const draft={...makeDraft(input,data,now,loc),scoring_version:Review.VERSION,mr1_model:bundle,mr1_model_hash:Review.hash(bundle),input_hash:inputHash(input),scoring_day:now.slice(0,10),population_hash:population.population_hash,population_count:population.population_count,relationship_diagnostics:population.relationship_diagnostics,issue_embedding:storedEmbedding,ai:{source:meta.ai_source,model:meta.model,prompt_version:meta.prompt_version,schema_sha256:meta.schema_sha256,staged_context_hash:Review.hash(review.staged_context),request_count:meta.request_count,log_id:logId},duplicate_check:duplicate};
 const public_values_taxonomy=await publicValues(db,population.members);
 const preview=population.members.slice(0,25);
 const viewer=population.members.find(m=>m.user_id===String(input.submitterId));
 capacity(db,[[ref,draft]]);
 await ref.create(draft);
 return {...data,success:true,draftId:ref.id,clarification:input.clarification,ai_source:meta.ai_source,ai_model:meta.model,examples_used:review.model.refs.map(r=>({id:r.id})),location:loc.location,location_source:loc.source,location_label:loc.label,location_suggested:loc.suggested||null,similar_issues:duplicate.matches,title_conflicts:duplicate.title_conflicts,duplicate_coverage:duplicate.coverage,matching_version:duplicate.version,members_count:population.members.length,public_members_count:population.members.length,cohort_counts:{A:population.A,B:population.B},public_values_taxonomy,relationship_diagnostics:population.relationship_diagnostics,viewer_member:viewer?{relevance_score:viewer.relevance_score,isr_score:viewer.isr_score}:null,members:preview.map(m=>({uid:m.user_id,name:m.displayName,score:m.relevance_score,cohort:m.cohort}))};
}
function storageSize(v){
 if(v==null || typeof v==="boolean")return 1;
 if(typeof v==="number")return 8;
 if(typeof v==="string")return Buffer.byteLength(v)+1;
 if(v instanceof Date || typeof v.toDate==="function")return 8;
 if(typeof v.latitude==="number" && typeof v.longitude==="number")return 16;
 if(Array.isArray(v))return v.reduce((n,x)=>n+storageSize(x),0);
 return 32+Object.entries(v).reduce((n,[k,x])=>n+Buffer.byteLength(k)+1+storageSize(x),0);
}
let proto;
function capacity(db,writes){
 if(!proto)proto=require("google-gax").protobuf.Root.fromJSON(require("@google-cloud/firestore/build/protos/v1.json"));
 const document=proto.lookupType("google.firestore.v1.Document"),commit=proto.lookupType("google.firestore.v1.CommitRequest");
 const database=`projects/${db.projectId}/databases/(default)`,encoded=[];
 for(const [ref,data] of writes){
  const name=database+"/documents/"+ref.path,doc={name,fields:db._serializer.encodeFields(data)};
  const stored=storageSize(data)+ref.path.split("/").reduce((n,s)=>n+Buffer.byteLength(s)+1,16);
  if(stored>=1048576-128 || document.encode(doc).finish().length>=1048576-128)Engine.error("This public exceeds a document storage limit; nothing was published.",413);
  encoded.push({update:doc,currentDocument:{exists:false}});
 }
 if(commit.encode({database,writes:encoded}).finish().length>10*1024*1024-32768)Engine.error("This public exceeds atomic publication capacity; nothing was published.",413);
}
function requireCurrentDraft(draft,input){
 if(draft.scoring_version!==Review.VERSION || draft.mr1_model?.version!==Review.VERSION)Engine.error("The scoring policy changed; run Check again.");
 try{require("./cbc-policy").validate(draft.mr1_model);}catch(_){Engine.error("The scoring policy changed; run Check again.");}
 if(draft.fixture_only||draft.ai?.fixture_only||!draft.ai||draft.ai.prompt_version!==Staged.PROMPT_VERSION||draft.ai.schema_sha256!==Staged.contractHash()||!draft.mr1_model||draft.ai.staged_context_hash!==Review.hash(draft.mr1_model.staged_context))Engine.error("The context contract changed; run Check again.");
 try{Staged.verifyBundle(draft.mr1_model,input);}catch(_){Engine.error("The staged context changed; run Check again.");}
}
async function create(db,body,draft){
 const input=readTextInputs(body);paramsForCreate(body,draft);
 if(inputHash(input)!==draft.input_hash || Review.hash(draft.mr1_model)!==draft.mr1_model_hash)Engine.error("The checked context changed; run Check again.");
 if(draft.creation_result)return draft.creation_result;
 requireCurrentDraft(draft,input);
 const registeredAt=new Date();if(registeredAt.toISOString().slice(0,10)!==draft.scoring_day)Engine.error("The checked date changed; run Check again.");
 const bundle=draft.mr1_model,params=draft.params,point=draft.location;
 const population=await Engine.population(db,bundle,point,registeredAt.toISOString());
 if(population.population_hash!==draft.population_hash || population.population_count!==draft.population_count)Engine.error("Population data changed after Check; run Check again.");
 const query={title:input.title,description:input.description,location:point,vector:draft.issue_embedding.vector,classification:params.classification,mu_distance_meters:params.mu};
 Similar.requireReview(await Similar.findSimilar(db,query,input.submitterId),body.duplicate_review);
 const issueRef=db.collection("issues").doc(),mcRef=db.collection("microcommunities").doc(),discRef=db.collection("discussions").doc(issueRef.id),members=population.members;
 const relevance=Object.fromEntries(members.map(m=>[m.user_id,m.relevance_score])),isr=Object.fromEntries(members.map(m=>[m.user_id,m.isr_score]));
 const ends=Lifecycle.chatDeadline(typeof body.deadline==="string"?body.deadline.trim():null,Lifecycle.todayIn(Lifecycle.TIME_ZONE,registeredAt));
 const issue={issue_id:issueRef.id,title:input.title,description:input.description,submitter_id:String(input.submitterId),status:"open",starts:registeredAt,created_at:registeredAt,ends,location:new GeoPoint(point[0],point[1]),location_source:draft.location_source,location_reference:params.location_reference,category:params.category,classification:params.classification,mu_distance_meters:params.mu,sigma_decay_meters:params.sigma,...flat(bundle.model),demographics:{},expertise_domain:params.expertise_domain,expertise_depth:params.expertise_depth,resources_needed:params.resources_needed,relevance_reasoning:params.relevance_reasoning,aggregation_reasoning:params.aggregation_reasoning,relevance_scores:relevance,isr_scores:isr,scoring_version:Review.VERSION,mr1_model:bundle,mr1_model_hash:draft.mr1_model_hash,ai:draft.ai};
 const disc={...issue,discussion_id:issueRef.id,topic:input.title,status:"discussion",creator_uid:String(input.submitterId),created_at:registeredAt.toISOString(),participants:Object.keys(isr),message_count:1,last_message_text:input.description,last_message_sender_uid:String(input.submitterId),last_message_sender_name:`User ${input.submitterId}`,last_message_timestamp:registeredAt.toISOString(),deadline_votes:{},affection_distance:params.mu/1000};
 // The full immutable bundle belongs to the issue, not to every dashboard snapshot.
 delete disc.mr1_model;
 const writes=[[issueRef,issue],[discRef,disc],[mcRef,{microcommunity_id:mcRef.id,issue_id:issueRef.id,threshold_relevance:.15,member_count:members.length,member_accepted:0,issue_scope:0,created_at:registeredAt,status:"active",scoring_version:Review.VERSION,values_taxonomy:null}],
  [db.collection("issue_vectors").doc(issueRef.id),{...draft.issue_embedding,created_at:registeredAt}],
  [discRef.collection("messages").doc("msg_init"),{id:"msg_init",uid:String(input.submitterId),text:input.description,timestamp:registeredAt.toISOString(),marks:[],child:[]}],
  ...members.map(m=>[db.collection("microcommunity_members").doc(`${mcRef.id}_${m.user_id}`),{...m,microcommunity_id:mcRef.id,calculated_at:registeredAt}])];
 writes[2][1].values_taxonomy=await publicValues(db,members);
 capacity(db,writes);
 return db.runTransaction(async tx=>{
  const registry=db.collection("issue_drafts").doc("__u10_creation_registry"),ref=db.collection("issue_drafts").doc(body.draftId);
  await tx.get(registry);const fresh=await tx.get(ref);if(!fresh.exists)Engine.error("Checked draft is unavailable.");
  const current=fresh.data();paramsForCreate(body,current);
  if(current.input_hash!==draft.input_hash || current.mr1_model_hash!==draft.mr1_model_hash || current.population_hash!==draft.population_hash)Engine.error("Checked draft changed; run Check again.");
  if(current.creation_result)return current.creation_result;
  requireCurrentDraft(current,input);
  issue.duplicate_review=Similar.requireReview(await Similar.findSimilar(db,query,input.submitterId,tx),body.duplicate_review);issue.matching_version=Similar.VERSION;
  const response={success:true,issue_id:issueRef.id,microcommunity_id:mcRef.id,members_count:members.length,cohort_counts:{A:population.A,B:population.B},members:members.map(m=>({uid:m.user_id,name:m.displayName,score:m.relevance_score.toFixed(3)}))};
  capacity(db,[...writes,[ref,{...current,creation_result:response}]]);
  for(const [target,data] of writes)tx.create(target,data);
  tx.update(ref,{creation_result:response});tx.set(registry,{revision:require("firebase-admin/firestore").FieldValue.increment(1)},{merge:true});return response;
 });
}
module.exports={check,create,capacity,inputHash,flat,requireCurrentDraft};
