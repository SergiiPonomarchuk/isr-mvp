"use strict";
const A=require('../publication/artifact'),P=require('../publication/protocol'),F=require('./format'),D=require('./decisions'),S=require('./service');
const commandKey=(actor,id)=>'private/commands/q_'+F.digest([actor,id]).slice(0,40);
function attach(Service){
 Service.prototype.loadInputs=async function(snapshot){const load=async id=>id?(await this.readContent(id)).records[0].data:null;return {options:await Promise.all(snapshot.state.options.map(load)),messages:await Promise.all(snapshot.state.messages.map(load)),tasks:await load(snapshot.state.tasks_ref)||[]};};
 Service.prototype.command=async function({operation_id,actor_uid,expected,command,args},fault={}){
  F.id(operation_id);if(!/^(?:[0-9]{1,12}|deadline)$/.test(actor_uid||''))A.fail('actor');
  const binding=F.digest({operation_id,actor_uid,expected,command,args}),key=commandKey(actor_uid,operation_id),old=await this.execute('command-receipt',(_,s)=>s.get(key));
  if(old){if(old.binding!==binding)A.fail('operation_changed');return {...old.result,replayed:true};}
  const snap=await this.snapshot();if(!expected||Object.keys(expected).sort().join()!=='state_revision,token'||!F.same(expected.token,snap.token)||expected.state_revision!==snap.state.revision)A.fail('revision_stale');
  const day=await this.execute('command-day',(_,s)=>s.get('control/day'));if(!day)A.fail('authority_missing');const inputs=await this.loadInputs(snap),decision=D.apply(snap,command,args,actor_uid,{...inputs,today:day.local,operation_id});
  const publications=[];for(const [ordinal,update]of decision.updates.entries()){
   if(update.kind==='outcome')update.data.tasks_ref=decision.state.tasks_ref;
   const id='c_'+F.digest([actor_uid,operation_id,update.kind,ordinal]).slice(0,40);await this.content(id,update.data,{binding,token:snap.token,state_revision:snap.state.revision,kind:update.kind});publications.push(id);
   if(update.kind==='option')decision.state.options[update.index]=id;else if(update.kind==='message')decision.state.messages[update.index]=id;else if(update.kind==='tasks')decision.state.tasks_ref=id;else if(update.kind==='outcome')decision.state.outcome_ref=id;
  }
  let audit_ref=null;if(decision.audit){audit_ref='a_'+F.digest([actor_uid,operation_id]).slice(0,40);await this.content(audit_ref,decision.audit,{binding,token:snap.token,state_revision:snap.state.revision});publications.push(audit_ref);}
  return this.execute('command-'+command,(_,s)=>s.run('command-final',tx=>{
   const current=tx.get(S.STATE),root=S.roots({get:tx.get}),receipt=tx.get(key),global=tx.get('control/global_catalog'),local=tx.get('control/catalog'),currentDay=tx.get('control/day');
   if(receipt){if(receipt.binding!==binding)A.fail('operation_changed');return {...receipt.result,replayed:true};}
   if(!current||current.revision!==snap.state.revision||!F.same(F.token(root),snap.token)||!F.same(currentDay,day))A.fail('revision_stale');if(!global||!local)A.fail('authority_missing');
   let contentBytes=0;const refs=publications.map(id=>{const k='private/outcomes/'+id,v=tx.get(k);if(!v?.sealed)A.fail('content_unsealed');contentBytes+=v.manifest.payload_bytes;return [k,v];});
   decision.state.content_bytes+=contentBytes;if(decision.state.content_bytes>8*1024*1024)A.fail('fixture_byte_budget');decision.state.history_head=key.split('/').pop();const result={...decision.result,state_revision:decision.state.revision,token:snap.token,replayed:false};
   for(const [k,v]of refs)tx.set(k,{...v,published:true,issue_id:root.issue_id});
   for(const [k,kind]of [[P.issueKey('i0'),'issues'],[P.discKey('i0'),'discussions'],[P.publicKey('i0'),'publics']])tx.set(k,S.header(tx.get(k),decision.state,{id:this.id,title:root.title,description:root.description},kind));
   tx.set(S.STATE,decision.state);tx.create(key,{binding,result,previous_history:current.history_head||null,audit_ref,operation_id,actor_uid,command,at:day.local});tx.set('control/global_catalog',{...global,revision:global.revision+1});tx.set('control/catalog',{...local,revision:local.revision+1});return result;
  }),fault);
 };
 Service.prototype.runDeadline=async function(today,operation_id){const old=await this.execute('deadline-receipt',(_,s)=>s.get(commandKey('deadline',operation_id)));if(old){if(old.command!=='deadline'||old.at!==today)A.fail('operation_changed');return {...old.result,replayed:true};}const snap=await this.snapshot();return this.command({operation_id,actor_uid:'deadline',expected:{token:snap.token,state_revision:snap.state.revision},command:'deadline',args:{today}});};
 Service.prototype.outcomeReceipt=async function(){const snap=await this.snapshot();if(snap.state.status!=='approved'||!snap.state.outcome_ref||!snap.state.tasks_ref)A.fail('outcome_receipt_missing');const outcome=(await this.readContent(snap.state.outcome_ref)).records[0].data,tasks=(await this.readContent(outcome.tasks_ref)).records[0].data;await this.readContent(snap.state.tasks_ref);if(!F.same(outcome.tasks,tasks)||!F.same(outcome.tally.generation,snap.token)||outcome.winner!==outcome.tally.winner)A.fail('outcome_mismatch');return {changed:false,complete:true,generation:snap.token,winner:outcome.winner};};
}
attach(S.Service);
module.exports={...S,commandKey};
