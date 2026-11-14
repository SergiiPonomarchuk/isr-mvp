"use strict";
// D1: the live trigger and emulator seed share the same atomic tally path.
const ISR = require("./isr");
const crypto = require("node:crypto");
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
const Lifecycle = require("./lifecycle");
const round3 = n => Math.round(n * 1000) / 1000;
async function tallyApprovedIssue(db, issueId, FieldValue) {
  return db.runTransaction(async tx => {
    const ref = db.collection("issues").doc(issueId);
    const issueSnap = await tx.get(ref);
    const discSnap = await tx.get(db.collection("discussions").doc(issueId));
    if (!issueSnap.exists) return {changed: false};
    const issue = issueSnap.data();
    if (issue.status !== "approved" || Lifecycle.phaseOf(discSnap.exists ? discSnap.data() : null, issue) === "archived") return {changed: false};
    const publics = await tx.get(db.collection("microcommunities").where("issue_id", "==", issueId).limit(1));
    const mcId = publics.empty ? issueId : publics.docs[0].id;
    const members = await tx.get(db.collection("microcommunity_members").where("microcommunity_id", "==", mcId).select("user_id", "isr_score"));
    const isrByUid = {};
    members.forEach(doc => {
      const m = doc.data();
      if (m.isr_score != null) isrByUid[String(m.user_id)] = Number(m.isr_score);
    });
    const options = Array.isArray(issue.options) ? issue.options : [];
    const inputFingerprint = crypto.createHash("sha256").update(JSON.stringify(canonical({
      votes: issue.votes || {}, options: options.map(({score, ...o}) => o), members: isrByUid
    }))).digest("hex");
    if (issue.tally && issue.tally.input_fingerprint === inputFingerprint) return {changed: false};
    const result = ISR.tally(issue.votes || {}, isrByUid, options.length);
    const update = {
      options: options.map((o, i) => ({...o, score: round3(result.scores[i] || 0)})),
      winning_option_index: result.winner,
      tally: {computed_at: FieldValue.serverTimestamp(), microcommunity_id: mcId,
        isr_source: "microcommunity_members.isr_score", input_fingerprint: inputFingerprint,
        counted: result.counted.map(c => ({...c, weight: round3(c.weight)})),
        excluded: result.excluded, note: result.note}
    };
    if (result.winner !== null && !(Array.isArray(issue.tasks) && issue.tasks.length)) {
      const steps = Array.isArray(options[result.winner].description) ? options[result.winner].description : [];
      update.tasks = steps.map((s, i) => ({id: i + 1, step: s.step || "",
        in_charge_uid: s.in_charge_uid != null ? String(s.in_charge_uid) : "", in_charge_name: s.in_charge_name || "",
        deadline: s.deadline || null, status: "in_process", results: "", comments: [], subtasks: []}));
    }
    tx.update(ref, update);
    return {changed: true, winner: result.winner};
  });
}
module.exports = {tallyApprovedIssue};
