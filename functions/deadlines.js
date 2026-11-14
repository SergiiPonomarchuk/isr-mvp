/**
 * Task L1: the daily deadline run. Moves every chat and voting topic whose deadline has passed:
 *   chat   -> voting (at least 1 option; deadline today + 7) or canceled (no options)
 *   voting -> ToDo (>= 30 % of the ISR pool voted and a winner; the A1 trigger then stores the
 *             result and the tasks), +7 days on a tie, or canceled
 * "Canceled" = status "inactive" with previous_status and cancel_reason "deadline".
 * Every change appends a `lifecycle` entry to the discussion and the issue.
 *
 * The rules are in lifecycle.js (shared with the browser). This file only reads and writes.
 * closeExpiredTopics(db, FieldValue, today) is a plain function so that it can run against the
 * emulator (tools/close_expired.js); index.js wraps it in a daily schedule.
 */
const L = require("./lifecycle");

/** Member ISR of an issue's public, as the A1 trigger reads it. */
async function loadIsrByUid(db, issueId) {
  let mcId = issueId; // seeded publics use the issue id; app-created ones are linked by issue_id
  const mcSnap = await db.collection("microcommunities").where("issue_id", "==", issueId).limit(1).get();
  mcSnap.forEach((d) => { mcId = d.id; });
  const isrByUid = {};
  const memSnap = await db.collection("microcommunity_members")
    .where("microcommunity_id", "==", mcId).select("user_id", "isr_score").get();
  memSnap.forEach((d) => {
    const x = d.data();
    if (x.isr_score !== undefined && x.isr_score !== null) isrByUid[String(x.user_id).trim()] = Number(x.isr_score);
  });
  return isrByUid;
}

function stringKeys(m) {
  const out = {};
  Object.keys(m || {}).forEach((k) => { out[String(k).trim()] = m[k]; });
  return out;
}

const round3 = (x) => (x === null || x === undefined ? null : Math.round(x * 1000) / 1000);

/**
 * Returns { today, checked, changes: [{ id, from, action, reason, voted_share, ends }] }.
 * Idempotent: each topic is rechecked inside its transaction, and a changed topic is no longer
 * expired in its old phase.
 */
async function closeExpiredTopics(db, FieldValue, today, options) {
  const opts = options || {};
  const nowIso = (opts.now || new Date()).toISOString();
  if (!L.isDate(today)) throw new Error("today must be 'YYYY-MM-DD'");

  // Candidates: deadlines before today (string order equals date order for YYYY-MM-DD;
  // "Ongoing" and missing deadlines are not returned). Phases are decided below.
  const ids = new Set();
  const [issSnap, discSnap] = await Promise.all([
    db.collection("issues").where("ends", "<", today).select("status").get(),
    db.collection("discussions").where("ends", "<", today).select("status").get()
  ]);
  const votingIds = new Set();
  issSnap.forEach((d) => { ids.add(d.id); if (d.data().status === "in_process") votingIds.add(d.id); });
  discSnap.forEach((d) => ids.add(d.id));

  const changes = [];
  for (const id of ids) {
    const isrByUid = votingIds.has(id) ? await loadIsrByUid(db, id) : null;
    const discRef = db.collection("discussions").doc(id);
    const issueRef = db.collection("issues").doc(id);
    const change = await db.runTransaction(async (tx) => {
      const [dSnap, iSnap] = await Promise.all([tx.get(discRef), tx.get(issueRef)]);
      const disc = dSnap.exists ? dSnap.data() : null;
      const issue = iSnap.exists ? iSnap.data() : null;
      const phase = L.phaseOf(disc, issue);
      if (phase !== "chat" && phase !== "voting") return null;
      if (phase === "chat" && !disc) return null;
      const ends = phase === "voting" ? ((issue && issue.ends) || (disc && disc.ends)) : disc.ends;
      const topic = {
        phase,
        ends,
        optionCount: phase === "voting" ? ((issue && issue.options) || []).length : (disc.options_v2 || []).length,
        votes: phase === "voting" ? stringKeys(issue && issue.votes) : {},
        isrByUid: isrByUid || (phase === "voting" ? await loadIsrByUid(db, id) : {})
      };
      const out = L.deadlineOutcome(topic, today);
      if (!out.action) return null;

      const entry = {
        at: nowIso, by: "deadline", from: phase, action: out.action, reason: out.reason,
        voted_share: round3(out.votedShare), deadline: ends, new_deadline: out.newEnds || null
      };
      const log = FieldValue.arrayUnion(entry);
      const discUpd = (fields) => { if (disc) tx.update(discRef, Object.assign({ lifecycle: log }, fields)); };
      const issueUpd = (fields) => { if (issue) tx.update(issueRef, Object.assign({ lifecycle: log }, fields)); };

      if (phase === "chat" && out.action === "to_voting") {
        tx.update(discRef, { status: "Voting", ends: out.newEnds, deadline_votes: {}, lifecycle: log });
        const fields = Object.assign(L.votingIssueFields(disc, out.newEnds, nowIso), { lifecycle: log });
        if (issue) { for (const key of ["created_at", "title", "description", "category"]) delete fields[key]; tx.update(issueRef, fields); } else tx.set(issueRef, fields);
      } else if (phase === "chat" && out.action === "cancel") {
        // As Cancel Issue in Chat: the discussion is canceled; an app-created issue keeps "open".
        discUpd({ status: "inactive", previous_status: "discussion", cancel_reason: "deadline", deadline_votes: {} });
        issueUpd({});
      } else if (out.action === "to_todo") {
        // Same writes as Finish Voting; the A1 trigger stores scores, winner, tally and tasks.
        issueUpd({ status: "approved", deadline_votes: {} });
        discUpd({ status: "approved", deadline_votes: {} });
      } else if (out.action === "extend") {
        issueUpd({ ends: out.newEnds });
        discUpd({ ends: out.newEnds });
      } else if (out.action === "cancel") {
        const fields = { status: "inactive", previous_status: "in_process", cancel_reason: "deadline", deadline_votes: {} };
        issueUpd(fields);
        discUpd(fields);
      }
      return { id, from: phase, action: out.action, reason: out.reason, voted_share: round3(out.votedShare), ends: out.newEnds || null };
    });
    if (change) changes.push(change);
  }
  return { today, checked: ids.size, changes };
}

module.exports = { closeExpiredTopics, loadIsrByUid };
