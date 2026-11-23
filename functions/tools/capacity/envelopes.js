"use strict";
const assert=require('node:assert/strict'),Engine=require('../../mr1-engine'),ISR=require('../../isr'),F=require('./fixture'),Codec=require('./codec');
function build(config,template){
 const bundle=template.context.bundle,pop=F.population(config,bundle),mc=template.made.microcommunity_id,issueId=template.made.issue_id;
 const sample=template.codec_sample,created=sample.calculated_at,joinTemplate=template.operations.join.find(o=>o.path.startsWith('microcommunity_members/')&&o.kind==='update'),joinedAt=joinTemplate.data.calculated_at;
 const names=Object.fromEntries(pop.order.map(id=>[id,pop.user(id).displayName]));
 const rawMember=id=>({...pop.member(id),microcommunity_id:mc,calculated_at:created});
 const d=Codec.dictionary(bundle,rawMember(pop.order[0]),names),uid=String(config.members+1);
 const joining=Engine.joining(pop.user(uid),{profile_vector:F.v(.1),experience_vectors:{edu:F.v(.72),exp:F.v(.61)},embedding_model:require('../../ai-config').EMBED_MODEL,embedding_dims:768,embedding_template:require('../../ai-config').EMBED_TEMPLATE_VERSION},{scoring_version:bundle.version,location:[47.59,7.61],created_at:F.at},bundle,[]);
 const joinOrder=[...pop.order].sort(),values=joinOrder.map(id=>{const m=rawMember(id);return {uid:id,R:m.relevance_score,E:m.expertise_score};});values.push({uid,R:joining.relevance_score,E:joining.expertise_score});
 const norm=ISR.isrForPublic(values,{w_relevance:bundle.model.aggregation.R,w_expertise:bundle.model.aggregation.E,w_contribution:bundle.model.aggregation.C}),joined=new Map(norm.map(v=>[v.uid,v]));
 const fields=id=>{const b=joined.get(id),stamp=template.operations.join.find(o=>o.path==='microcommunity_members/'+mc+'_'+id)?.data.calculated_at||joinedAt;return {normalized_relevance:Engine.round(b.R_norm),normalized_experience:Engine.round(b.E_norm),normalized_contribution:1,contribution_source:'constant',isr_score:Engine.round(b.isr),calculated_at:stamp};};
 const joinedMember=id=>({...rawMember(id),...fields(id)}),extra={...joining,...fields(uid),microcommunity_id:mc};
 const dj={...d,names:{...names,[uid]:extra.displayName}};
 const maps=(ids,member)=>{const relevance={},isr={};for(const id of ids){const m=member(id);relevance[id]=m.relevance_score;isr[id]=m.isr_score;}return {relevance_scores:relevance,isr_scores:isr};};
 const caches=maps(pop.order,rawMember),newCaches=maps([...joinOrder,uid],id=>id===uid?extra:joinedMember(id));
 const counts={A:pop.aCount,B:config.members-pop.aCount};
 const response={...template.made,members_count:config.members,cohort_counts:counts,members:pop.order.map(id=>{const m=rawMember(id);return {uid:id,name:m.displayName,score:m.relevance_score.toFixed(3)};})};
 const completed=template.operations.create.find(o=>o.path.startsWith('issue_drafts/')&&o.kind==='update');
 const draft={...template.draft,population_count:config.members};
 const finalDraft={...draft,creation_result:response};
 const mcCreate=template.operations.create.find(o=>o.path.startsWith('microcommunities/'));
 const publicDoc={...mcCreate.data,member_count:config.members};
 function root(o,join=false){let data={...o.data},post={...o.post};if(o.path.startsWith('issues/')||o.path.startsWith('discussions/')&&o.path.split('/').length===2){if('relevance_scores' in data)Object.assign(data,join?newCaches:caches);Object.assign(post,join?newCaches:caches);if('participants' in data)data.participants=Object.keys((join?newCaches:caches).isr_scores);if('participants' in post)post.participants=Object.keys((join?newCaches:caches).isr_scores);}return {...o,data,post};}
 function* check(){for(const o of template.operations.check)yield o.path.startsWith('issue_drafts/')?{...o,data:draft,post:draft}:o;}
 function* create(compact=false){
  for(const o of template.operations.create){
   if(o.path.startsWith('microcommunity_members/'))continue;
   if(o===completed){const result=compact?Codec.responseEncode(response,d):response;yield {...o,data:{creation_result:result},post:{...draft,creation_result:result}};}
   else if(o===mcCreate){const data=compact?{...publicDoc,capacity_codec:d}:publicDoc;yield {...o,data,post:data};}
   else yield root(o);
  }
  for(const id of pop.order){const member=rawMember(id),data=compact?Codec.encode(member,d):member;if(compact)assert.deepEqual(Codec.decode(data,d),member);yield {kind:'create',path:'microcommunity_members/'+mc+'_'+id,data,post:data};}
 }
 function* join(compact=false){
  for(const id of joinOrder){const old=rawMember(id),post=joinedMember(id);if(compact){const encoded=Codec.encode(post,d),prior=Codec.encode(old,d),data={s:encoded.s};assert.deepEqual({...prior,...data},encoded);assert.deepEqual(Codec.decode(encoded,d),post);yield {kind:'update',path:'microcommunity_members/'+mc+'_'+id,data,post:encoded};}else yield {kind:'update',path:'microcommunity_members/'+mc+'_'+id,data:fields(id),post};}
  const data=compact?Codec.encode(extra,dj):extra;if(compact)assert.deepEqual(Codec.decode(data,dj),extra);yield {kind:'create',path:'microcommunity_members/'+mc+'_'+uid,data,post:data};
  for(const o of template.operations.join){if(o.path.startsWith('microcommunity_members/'))continue;
   if(o.path.startsWith('microcommunities/')){const data={...o.data,member_count:config.members+1},post={...publicDoc,...data};if(compact){data['capacity_codec.names.'+uid]=extra.displayName;post.capacity_codec=dj;}yield {...o,data,post};}
   else if(o.path.startsWith('membership_events/')){const event={...o.data,user_id:uid};yield {...o,path:'membership_events/'+issueId+'_'+uid,data:event,post:event};}
   else yield root(o,true);
  }
 }
 assert.deepEqual(Codec.responseDecode(Codec.responseEncode(response,d),d),response);
 return {check,create,join,pop,rawMember,response,finalDraft,dictionary:d,counts,replay:{writes:0,response_json_bytes:Buffer.byteLength(JSON.stringify(response)),same_frozen_response:true},evidence_slots:d.slots.length};
}
module.exports={build};
