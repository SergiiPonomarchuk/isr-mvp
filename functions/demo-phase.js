"use strict";
const crypto = require("node:crypto");
const L = require("./lifecycle");
const {tallyApprovedIssue} = require("./close-voting");
const digest = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function prepareTopic(db, input, FieldValue) {
  const {issueId, runId, content, phase} = input;
  if (!issueId || !runId || !["chat", "voting", "todo", "standby"].includes(phase)) throw Error("Invalid demo arrangement");
  const fingerprint = digest({runId, content, phase});
  const result = await db.runTransaction(async tx => {
    const issueRef = db.collection("issues").doc(issueId), discRef = db.collection("discussions").doc(issueId);
    const issueSnap = await tx.get(issueRef), discSnap = await tx.get(discRef);
    if (!issueSnap.exists || !discSnap.exists) throw Error("Demo topic pair is incomplete");
    const issue = issueSnap.data(), disc = discSnap.data();
    if (issue.demo_plan_hash) {
      if (issue.demo_plan_hash !== fingerprint || disc.demo_plan_hash !== fingerprint) throw Error("Demo plan changed; explicit repair required");
      return {changed:false, phase};
    }
    if (L.phaseOf(disc, issue) !== "chat") throw Error("Only a newly created discussion can be arranged");
    const creator = String(issue.submitter_id);
    const date = issue.created_at.toDate ? issue.created_at.toDate() : new Date(issue.created_at);
    if (!Number.isFinite(date.getTime())) throw Error("Registration time missing");
    const now = date.toISOString(), today = L.todayIn(L.TIME_ZONE, date), ends = L.addDays(today, 30);
    const ids = Object.keys(issue.isr_scores || {}).sort();
    if (!ids.includes(creator) || !ids.length) throw Error("Creator/public maps missing");
    if (!Array.isArray(content.options) || content.options.length < 2 || !Array.isArray(content.messages)) throw Error("Stored demo content is incomplete");
    const options = content.options.map((o,i) => ({id:`${input.scenarioKey}-option-${i+1}`,
      title:o.title, budget:o.budget, funding_source:o.funding_source, resources_needed:o.resources_needed,
      author_uid:creator, author_name:input.creatorName,
      description:o.steps.map((step,j)=>({step, in_charge_uid:creator, in_charge_name:input.creatorName,
        deadline:L.addDays(today,14+j)}))}));
    const messages = content.messages.map((m,i)=>({id:`${input.scenarioKey}-message-${i+1}`,
      uid:m.author === "member" ? ids[(i+1)%ids.length] : creator, text:m.text,
      timestamp:new Date(date.getTime()+(i+1)*60000).toISOString(), marks:{}, reactions:{}, child:[]}));
    // Initial message from Create remains; stable keys make retries harmless.
    const shared = {demo_run_id:runId, demo_scenario:input.scenarioKey, demo_plan_hash:fingerprint, ends};
    const discUpdate = {...shared, status:"discussion", description:issue.description, options_v2:options, message_count:1+messages.length};
    if (messages.length) Object.assign(discUpdate,{last_message_text:messages.at(-1).text,
      last_message_sender_uid:messages.at(-1).uid,last_message_timestamp:messages.at(-1).timestamp});
    let issueUpdate = {...shared};
    if (phase === "voting" || phase === "todo") {
      const fields=L.votingIssueFields({...disc,...discUpdate,topic:issue.title,category:issue.category},ends,now);
      // Registration-time expertise depends on the original timestamp.
      delete fields.created_at;
      issueUpdate={...issueUpdate,...fields};
      discUpdate.status="Voting";
      if (phase === "todo") {
        const votes=Object.fromEntries(ids.map((uid,i)=>[uid,i<Math.ceil(ids.length*0.6)?0:1]));
        if (L.votingOutcome(votes,issue.isr_scores,options.length).result !== "todo") throw Error("Prepared vote does not pass canonical quorum/tally");
        issueUpdate.votes=votes;issueUpdate.status="approved";discUpdate.status="approved";
      }
    } else if (phase === "standby") {
      issueUpdate.status="archived";discUpdate.status="archived";
      issueUpdate.demo_archive={run_id:runId,reason:"flagship standby",previous_status:issue.status,at:now};
      discUpdate.demo_archive={run_id:runId,reason:"flagship standby",previous_status:disc.status || "discussion",at:now};
    }
    for(const m of messages) tx.create(discRef.collection("messages").doc(m.id),m);
    tx.update(issueRef,issueUpdate);tx.update(discRef,discUpdate);
    return {changed:true,phase};
  });
  if (phase === "todo") await tallyApprovedIssue(db,issueId,FieldValue);
  return result;
}
module.exports={prepareTopic};
