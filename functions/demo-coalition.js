"use strict";
// Synthetic D1 rehearsal only. Live applies are the author's explicit CLI steps.
const crypto=require('node:crypto');
const L=require('./lifecycle');
const VERSION='d1-coalition-v1';
function guard(ok,message){if(!ok){const e=new Error(message);e.code='COALITION_GUARD';throw e;}}
function canonical(value){
 if(value&&typeof value.toDate==='function')return value.toDate().toISOString();
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const same=(a,b)=>digest(a)===digest(b);
function stamp(value){
 if(value&&Number.isInteger(value.seconds)&&Number.isInteger(value.nanoseconds))return value.seconds+'.'+String(value.nanoseconds).padStart(9,'0');
 const text=value instanceof Date?value.toISOString():String(value),milliseconds=Date.parse(text);
 guard(Number.isFinite(milliseconds),'Invalid registration timestamp.');
 const fraction=text.match(/\.(\d+)(?:Z|[+-]\d\d:\d\d)$/)?.[1]||'';
 return Math.floor(milliseconds/1000)+'.'+fraction.padEnd(9,'0').slice(0,9);
}
const numericId=value=>/^\d+$/.test(String(value));
function normalizedOptions(options){return options.map(o=>({
 title:o.title===undefined?o.label:o.title,budget:o.budget,funding_source:o.funding_source||'',
 resources_needed:o.resources_needed||[],author_uid:String(o.author_uid),author_name:o.author_name||'',
 description:(o.description||[]).map(s=>({step:s.step,in_charge_uid:String(s.in_charge_uid),in_charge_name:s.in_charge_name||'',deadline:s.deadline||null}))
}));}
function inspect(binding,state){
 const {issue,disc,public:pub,members}=state;
 guard(issue&&disc&&pub,'Flagship pair/public missing.');
 const phase=L.phaseOf(disc,issue);
 guard(['chat','voting','todo'].includes(phase),'Topic is archived, inactive or unavailable.');
 guard(({chat:issue.status==='open'&&disc.status==='discussion',voting:issue.status==='in_process'&&disc.status==='Voting',todo:issue.status==='approved'&&disc.status==='approved'})[phase],'Topic phase pair is inconsistent.');
 guard(issue.title===binding.title&&issue.description===binding.description&&String(issue.submitter_id)===binding.creator,'Registered text/creator changed.');
 guard(stamp(issue.created_at)===stamp(binding.created_at),'Registration time changed.');
 guard(String(disc.creator_uid)===binding.creator&&disc.topic===binding.title&&disc.description===binding.description,'Discussion identity changed.');
 guard(pub.issue_id===binding.issue_id,'Public link changed.');
 guard(Array.isArray(members)&&members.length>0&&members.length<=200&&pub.member_count===members.length,'Public size changed or exceeds the rehearsal bound.');
 const weights={};
 for(const m of members){const uid=String(m.user_id);guard(numericId(uid)&&!Object.hasOwn(weights,uid),'Invalid/duplicate public member.');guard(typeof m.isr_score==='number'&&Number.isFinite(m.isr_score)&&m.isr_score>=0,'Invalid stored member weight.');weights[uid]=m.isr_score;}
 guard(weights[binding.creator]>0,'Creator needs a positive current public weight.');
 guard(same(weights,disc.isr_scores)&&same(weights,issue.isr_scores),'Cached ISR maps differ from canonical members.');
 guard(same([...Object.keys(weights)].sort(),[...(disc.participants||[])].map(String).sort()),'Participant map changed or duplicated.');
 const options=normalizedOptions(disc.options_v2||[]);
 guard(options.length===binding.expected_options.length&&options.length>=2,'Option count changed.');
 options.forEach((o,i)=>{const e=binding.expected_options[i];guard(o.title===e.title&&o.budget===e.budget&&o.funding_source===e.funding_source&&same(o.resources_needed,e.resources_needed)&&o.author_uid===binding.creator,'Reviewed option fields/proposer changed.');guard(same(o.description.map(s=>s.step),e.steps)&&o.description.every(s=>s.in_charge_uid===binding.creator),'Reviewed steps/responsibilities changed.');});
 if(phase!=='chat')guard(same(options,normalizedOptions(issue.options||[])),'Voting options differ from reviewed discussion options.');
 if(phase!=='todo')guard(L.isDate(disc.ends)&&disc.ends===issue.ends&&!L.isExpired(disc.ends,L.todayIn(L.TIME_ZONE)),'Deadline expired or inconsistent.');
 return {phase,weights,options,basis:{registration:digest({title:issue.title,description:issue.description,creator:binding.creator,created_at:stamp(issue.created_at),category:issue.category||null}),members:digest(weights),options:digest(options)}};
}
function makePlan(binding,state,optionIndex=0){
 guard(numericId(binding.creator)&&binding.issue_id&&!binding.issue_id.includes('/')&&binding.public_id&&!binding.public_id.includes('/'),'Invalid execution binding.');
 const data=inspect(binding,state);guard(Number.isInteger(optionIndex)&&optionIndex>=0&&optionIndex<data.options.length,'Invalid selected option.');
 const pool=L.pool(data.weights),creator=data.weights[binding.creator];
 const actors=[];let weight=0;
 for(const [uid,w] of Object.entries(data.weights).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))){
  if(uid===binding.creator||w<=0)continue;
  if((weight+creator)/pool>=L.MANAGEMENT_THRESHOLD-1e-9)break;
  actors.push(uid);weight+=w;
 }
 guard(actors.length>0&&actors.length<=27,'Selected coalition exceeds 27 synthetic profiles or needs no helper.');
 const votes=Object.fromEntries(actors.map(uid=>[uid,'start_voting']));
 const context={phase:'chat',status:'discussion',votes,isrByUid:data.weights,optionCount:data.options.length};
 guard(L.managementOutcome(context).action===null,'Other profiles already reach the threshold; creator would not be decisive.');
 guard(L.managementOutcome({...context,votes:{...votes,[binding.creator]:'start_voting'}}).action==='start_voting','Coalition cannot reach the management threshold with creator.');
 return {version:VERSION,binding:canonical(binding),basis:data.basis,actors,option_index:optionIndex,option_title:data.options[optionIndex].title,pool,synthetic_weight:weight,creator_weight:creator,combined_weight:weight+creator};
}
function overlay(existing,actors,value){
 const next={...(existing||{})};
 for(const uid of actors){guard(!Object.hasOwn(next,uid)||next[uid]===value,'A selected synthetic actor has a conflicting input; no overwrite.');next[uid]=value;}
 return next;
}
function decide(plan,binding,state,operation){
 guard(['start-support','option-votes','finish-support'].includes(operation),'Unknown rehearsal operation.');
 guard(same(plan,makePlan(binding,state,plan.option_index)),'Plan/target/registration/options/membership drift; inspect before continuing.');
 const {phase,weights}=inspect(binding,state),{issue,disc}=state;
 const result={operation,phase,option:plan.option_title,synthetic_profiles:plan.actors.length,pool:plan.pool,synthetic_isr:plan.synthetic_weight,combined_isr:plan.combined_weight,changes:{}};
 if(phase==='todo'||operation==='start-support'&&phase==='voting')return {...result,status:'phase_advanced_no_write'};
 guard(phase===(operation==='start-support'?'chat':'voting'),'Operation does not match current phase.');
 if(operation==='option-votes'){
  const current=issue.votes||{},next=overlay(current,plan.actors,plan.option_index);
  const before=L.votingOutcome(current,weights,state.issue.options.length),after=L.votingOutcome(next,weights,state.issue.options.length);
  guard(before.tally.excluded.length===0&&after.tally.excluded.length===0,'Existing option votes are noncanonical.');
  if(Object.hasOwn(current,binding.creator)){
   guard(same(current,next)&&current[binding.creator]===plan.option_index&&after.result==='todo'&&after.winner===plan.option_index,'Creator voted before preparation or chose a different option; inspect.');
   return {...result,status:'already_prepared'};
  }
  guard(before.result!=='todo'&&after.result!=='todo','Option votes already reach quorum without creator.');
  const withCreator=L.votingOutcome({...next,[binding.creator]:plan.option_index},weights,state.issue.options.length);
  guard(withCreator.result==='todo'&&withCreator.winner===plan.option_index,'Creator vote would not complete the reviewed quorum/winner.');
  if(!same(current,next))result.changes.issue={votes:next};
 }else{
  const action=operation==='start-support'?'start_voting':'finish_voting';
  const current=disc.deadline_votes||{};
  guard(!Object.hasOwn(current,binding.creator),'Creator already supported an action; creator must act last in the UI.');
  let votingResult=null;
  if(operation==='finish-support'){
   guard(same(current,issue.deadline_votes||{}),'Issue/discussion management copies differ.');
   const tally=L.votingOutcome(issue.votes||{},weights,issue.options.length);
   guard(tally.result==='todo'&&tally.winner===plan.option_index&&issue.votes?.[binding.creator]===plan.option_index,'Creator vote and reviewed winning quorum are required before Finish support.');
   guard(plan.actors.every(uid=>issue.votes?.[uid]===plan.option_index),'Synthetic option votes are incomplete or conflicting.');votingResult=tally.result;
  }
  const next=overlay(current,plan.actors,action);
  const context={phase,status:disc.status,votes:current,isrByUid:weights,optionCount:state.disc.options_v2.length,votingResult};
  guard(L.managementOutcome(context).action===null&&L.managementOutcome({...context,votes:next}).action===null,'An action would execute without the creator; stop and inspect.');
  guard(L.managementOutcome({...context,votes:{...next,[binding.creator]:action}}).action===action,'Creator final support would not execute the reviewed action.');
  if(!same(current,next)){
   result.changes.disc={deadline_votes:next};
   if(operation==='finish-support')result.changes.issue={deadline_votes:next};
  }
 }
 return {...result,status:Object.keys(result.changes).length?'ready':'already_prepared'};
}
async function readState(db,reader,binding){
 const refs={issue:db.collection('issues').doc(binding.issue_id),disc:db.collection('discussions').doc(binding.issue_id),public:db.collection('microcommunities').doc(binding.public_id)};
 const state={};for(const [key,ref] of Object.entries(refs)){const snap=await reader.get(ref);state[key]=snap.exists?snap.data():null;}
 const members=await reader.get(db.collection('microcommunity_members').where('microcommunity_id','==',binding.public_id).select('user_id','isr_score'));
 state.members=members.docs.map(d=>d.data());return {state,refs};
}
async function execute(db,input){
 guard(typeof input.apply==='boolean','Apply must be explicit boolean.');
 return db.runTransaction(async tx=>{
  const {state,refs}=await readState(db,tx,input.binding);
  if(input.operation==='make-plan'){
   guard(!input.apply&&L.phaseOf(state.disc,state.issue)==='chat','Plan creation is read-only and requires discussion.');
   const plan=makePlan(input.binding,state,input.option_index);
   return {plan,summary:{operation:'make-plan',writes:0,synthetic_profiles:plan.actors.length,option:plan.option_title,pool:plan.pool,synthetic_isr:plan.synthetic_weight,creator_isr:plan.creator_weight,combined_isr:plan.combined_weight}};
  }
  const result=decide(input.plan,input.binding,state,input.operation);
  if(input.apply)for(const [key,fields] of Object.entries(result.changes))tx.update(refs[key],fields);
  const {changes,...summary}=result;
  return {summary:{...summary,apply:input.apply,documents_proposed:Object.keys(changes).length,writes:input.apply?Object.keys(changes).length:0,status:input.apply&&summary.status==='ready'?'prepared':summary.status}};
 });
}
module.exports={VERSION,guard,digest,inspect,makePlan,decide,execute};
