"use strict";
const ISR = require("./isr");
const AI = require("./ai-config");
const Lifecycle = require("./lifecycle");
const { evaluateDemographics } = require("./demographics");
const { nearestAnchor, gScore } = require("./geo");
const { vector, currentVector } = require("./similar-issues");
const { aggregateValues } = require("./public-values");
const r3 = x => Math.round(Number(x) * 1000) / 1000;
function fail(message, status = 409) { throw Object.assign(new Error(message), { status }); }
function socialScore(relations, uid) {
  const relation = (relations || []).find(r => String(r.relative) === String(uid));
  if (!relation) return 0;
  if (relation.tie != null) return Number(relation.tie) || 0;
  const type = String(relation.type || "").toLowerCase();
  if (["spouse", "partner", "wife", "husband"].includes(type)) return 0.3;
  if (["parent", "father", "mother", "child", "son", "daughter", "sibling", "sister", "brother"].includes(type)) return 0.2;
  return ["grandparent", "grandfather", "grandmother", "grandchild", "grandson", "granddaughter", "close friend"].includes(type) ? 0.1 : 0;
}
function joiningMember(user, vectors, issue, issueVector, creator) {
  if (!vectors || vectors.embedding_model !== AI.EMBED_MODEL || vectors.embedding_dims !== AI.EMBED_DIMS || vectors.embedding_template !== AI.EMBED_TEMPLATE_VERSION || (vector(vectors.profile_vector).length !== AI.EMBED_DIMS || !vector(vectors.profile_vector).every(Number.isFinite))) {
    fail("This profile needs current embeddings before joining.");
  }
  const d = evaluateDemographics(user, issue.demographics || {});
  const near = nearestAnchor(user.geography, issue.location);
  const g = near ? gScore(near.distance, issue.mu_distance_meters, issue.sigma_decay_meters) : 0;
  const s = Math.max(0, ISR.cosine(vector(vectors.profile_vector), issueVector));
  const x = socialScore(creator && creator.socialRelations, user.uid);
  const relevance = ISR.relevance({ D: d.score, G: g, S: s, X: x }, {
    w_D: issue.w_demographic, w_G: issue.w_geographic, w_S: issue.w_semantic, w_X: issue.w_social
  }, true);
  const adjustment = (issue.expertise_domain_parameters || {}).CBC_adjustment_factor || 1;
  const edu = ISR.educationSum(user.skills, vectors.experience_vectors || {}, issueVector, adjustment);
  const exp = ISR.experienceSum(user.skills, vectors.experience_vectors || {}, issueVector);
  let eduPart = edu;
  try { eduPart = ISR.educationPart(edu, ISR.ageInYears(user.birthDate, issue.created_at)); } catch (_) { /* Existing createIssue rule for an absent birth date. */ }
  return { user_id: user.uid, displayName: user.displayName || `User ${user.uid}`, D_score: d.score,
    D_match: d.match || null, G_score: g, G_anchor_type: near ? near.type : null,
    S_score: s, X_score: x, relevance_score: r3(relevance), education_expertise: r3(eduPart),
    experience_expertise: r3(exp), expertise_score: r3(eduPart + exp), expertise_source: "issue_vector",
    contribution_score: 0, accepted_rejected: null, membership_source: "explicit_join" };
}
async function joinIssue(db, input, timestamp) {
  const uid = String(input.submitterId || "");
  const issueId = String(input.issueId || "");
  if (!/^\d+$/.test(uid) || !issueId || issueId.includes("/")) fail("Select a valid profile and issue.", 400);
  const issueRef = db.collection("issues").doc(issueId);
  const discussionRef = db.collection("discussions").doc(issueId);
  return db.runTransaction(async tx => {
    const issueSnap = await tx.get(issueRef), discSnap = await tx.get(discussionRef);
    if (!issueSnap.exists || !discSnap.exists) fail("The issue is unavailable.", 404);
    const issue = issueSnap.data(), disc = discSnap.data();
    const mcSnaps = await tx.get(db.collection("microcommunities").where("issue_id", "==", issueId));
    if (mcSnaps.size !== 1) fail("The issue's public could not be resolved.");
    const mc = mcSnaps.docs[0];
    const memberSnaps = await tx.get(db.collection("microcommunity_members").where("microcommunity_id", "==", mc.id));
    const existing = memberSnaps.docs.map(s => ({ ref: s.ref, data: s.data() }));
    if (existing.some(m => String(m.data.user_id) === uid)) return { success: true, issue_id: issueId, already_member: true };
    if (Lifecycle.phaseOf(disc, issue) !== "chat" || /^(closed|archived|completed|cancelled|canceled)$/.test(issue.status || "")) fail("Joining is available during discussion. Open the issue to view its current state.");
    if (Lifecycle.isDate(issue.ends) && Lifecycle.isExpired(issue.ends, Lifecycle.todayIn(Lifecycle.TIME_ZONE))) fail("The issue's discussion deadline has passed.");
    const userSnap = await tx.get(db.collection("users").doc(uid));
    const vectorsSnap = await tx.get(db.collection("user_vectors").doc(uid));
    const issueVectorSnap = await tx.get(db.collection("issue_vectors").doc(issueId));
    const creator = await tx.get(db.collection("users").doc(String(issue.submitter_id || disc.creator_uid)));
    if (!userSnap.exists || !issueVectorSnap.exists) fail("The profile or issue vector is unavailable.");
    const embedding = issueVectorSnap.data();
    if (!currentVector(embedding, issue)) fail("This issue needs a current issue vector before joining.");
    const member = joiningMember(userSnap.data(), vectorsSnap.exists ? vectorsSnap.data() : null, issue, vector(embedding.vector), creator.exists ? creator.data() : {});
    const ref = db.collection("microcommunity_members").doc(`${mc.id}_${uid}`);
    const members = [...existing, { ref, data: member }];
    const userRefs = members.map(m => db.collection("users").doc(String(m.data.user_id)));
    const users = await tx.getAll(...userRefs, { fieldMask: ["uid", "values_taxonomy"] });
    const breakdown = ISR.isrForPublic(members.map(m => ({ uid: String(m.data.user_id), R: m.data.relevance_score, E: m.data.expertise_score })), issue);
    const relevance = {}, isr = {};
    members.forEach((m, i) => {
      const b = breakdown[i];
      const fields = { normalized_relevance: r3(b.R_norm), normalized_experience: r3(b.E_norm),
        normalized_contribution: r3(b.C_norm), contribution_source: b.contribution_source, isr_score: r3(b.isr), calculated_at: timestamp };
      relevance[String(m.data.user_id)] = r3(m.data.relevance_score);
      isr[String(m.data.user_id)] = fields.isr_score;
      if (m === members[members.length - 1]) tx.create(m.ref, { ...member, ...fields, microcommunity_id: mc.id });
      else tx.update(m.ref, fields);
    });
    tx.update(issueRef, { relevance_scores: relevance, isr_scores: isr });
    tx.update(discussionRef, { relevance_scores: relevance, isr_scores: isr, participants: Object.keys(isr) });
    const taxonomies = users.filter(s => s.exists && s.data().values_taxonomy).map(s => ({ relevance: relevance[s.id], taxonomy: s.data().values_taxonomy }));
    tx.update(mc.ref, { member_count: members.length, values_taxonomy: aggregateValues(taxonomies) });
    tx.create(db.collection("membership_events").doc(`${issueId}_${uid}`), {
      issue_id: issueId, microcommunity_id: mc.id, user_id: uid, type: "explicit_join", created_at: timestamp
    });
    return { success: true, issue_id: issueId, already_member: false, members_count: members.length };
  });
}
module.exports = { joiningMember, socialScore, joinIssue };
