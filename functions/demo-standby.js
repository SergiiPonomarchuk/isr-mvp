"use strict";
const L=require('./lifecycle');
const Similar=require('./similar-issues');
async function activateStandby(db,input,FieldValue){
 return db.runTransaction(async tx=>{
  const registry=db.collection('issue_drafts').doc('__u10_creation_registry');await tx.get(registry);
  const issueRef=db.collection('issues').doc(input.issueId),discRef=db.collection('discussions').doc(input.issueId);
  const issueSnap=await tx.get(issueRef),discSnap=await tx.get(discRef);
  if(!issueSnap.exists||!discSnap.exists)throw Error('Standby pair missing');
  const issue=issueSnap.data(),disc=discSnap.data();
  if(issue.demo_run_id!==input.runId||disc.demo_run_id!==input.runId||issue.demo_archive?.reason!=='flagship standby')throw Error('Not this run\'s flagship standby');
  if(issue.demo_standby_activated_at&&disc.demo_standby_activated_at)return {changed:false,issue_id:input.issueId};
  if(issue.status!=='archived'||disc.status!=='archived')throw Error('Standby state drifted');
  const vectorSnap=await tx.get(db.collection('issue_vectors').doc(input.issueId));
  if(!vectorSnap.exists||!Similar.currentVector(vectorSnap.data(),issue))throw Error('Current standby vector missing');
  const matches=await Similar.findSimilar(db,{...issue,vector:Similar.vector(vectorSnap.data().vector)},issue.submitter_id,tx);
  if(matches.matches.length)throw Error('An active matching issue exists; recover/open it instead of promoting the standby');
  const ends=L.chatDeadline(null,L.todayIn(L.TIME_ZONE));
  tx.update(issueRef,{status:'open',ends,demo_standby_activated_at:FieldValue.serverTimestamp()});
  tx.update(discRef,{status:'discussion',ends,demo_standby_activated_at:FieldValue.serverTimestamp()});
  tx.set(registry,{revision:FieldValue.increment(1)},{merge:true});
  return {changed:true,issue_id:input.issueId};
 });
}
module.exports={activateStandby};
