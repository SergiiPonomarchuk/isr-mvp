"use strict";
const crypto = require("node:crypto");
const AI = require("./ai-config");
const ISR = require("./isr");
const Lifecycle = require("./lifecycle");
const { haversineDistance, toLatLon } = require("./geo");

const VERSION = "u10-v2";
const SEMANTIC_THRESHOLD = 0.8018;
const TEXT_THRESHOLD = 0.5;
const LIMIT = 5;
const STOP = new Set("the a an our my your at in on of to for and or is are it this that needs need with by from we i residents agree its".split(" "));
const WORDS = { repairing: "repair", repairs: "repair", fix: "repair", fixing: "repair", replace: "repair", replacing: "repair", replacement: "repair", faulty: "broken", jammed: "broken", damaged: "broken", entrance: "entry", front: "entry", locks: "lock", buildings: "building", apartments: "building", apartment: "building", door: "entry" };
function normalize(text) {
  return String(text || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
function titleKey(text) { return String(text || "").normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " "); }
function terms(text) {
  return new Set(normalize(text).replace(/\b(?:osbb|building|block|house|h)\s*\d+\b/g, " ").split(" ").filter(w => w && !STOP.has(w)).map(w => WORDS[w] || w));
}
function overlap(a, b) {
  const aa = terms(a), bb = terms(b);
  const common = [...aa].filter(w => bb.has(w)).length;
  return common / Math.max(1, Math.min(aa.size, bb.size));
}
function hash(value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function issueText(issue) { return `${String(issue.title || "").trim()}. ${String(issue.description || "").trim()}`; }
function vector(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value.toArray === "function") return value.toArray();
  return value && Array.isArray(value._values) ? value._values : [];
}
function currentVector(entry, issue) {
  const expected = crypto.createHash("sha256").update(issueText(issue)).digest("hex");
  return entry && entry.model === AI.EMBED_MODEL && entry.dims === AI.EMBED_DIMS &&
    entry.template_version === AI.EMBED_TEMPLATE_VERSION && entry.task_type === AI.TASK_TYPE_ISSUE &&
    entry.text_sha256 === expected && vector(entry.vector).length === AI.EMBED_DIMS && vector(entry.vector).every(Number.isFinite);
}
function explicitContext(text) {
  const normalized = normalize(text);
  const places = normalized.match(/\b(?:osbb|building|block|house|h)\s*\d+\b/g) || [];
  const dates = normalized.match(/\b(?:20\d{2}|today|tomorrow|yesterday)\b/g) || [];
  return [...new Set([...places, ...dates].map(s => s.replace(/\s+/g, "")))].sort();
}
function compatibleContext(query, issue) {
  const a = explicitContext(issueText(query)), b = explicitContext(issueText(issue));
  // Explicit different building/date identifiers override semantic similarity.
  for (const prefix of ["osbb", "building", "block", "house", "h", "20", "today", "tomorrow", "yesterday"]) {
    const aa = a.filter(x => x.startsWith(prefix)), bb = b.filter(x => x.startsWith(prefix));
    if (aa.length && bb.length && JSON.stringify(aa) !== JSON.stringify(bb)) return false;
  }
  const p = toLatLon(query.location), q = toLatLon(issue.location);
  if (!p || !q) return false;
  const scope = query.classification && query.classification.scope_type;
  const building = scope === "building" || /\b(building|lock|entrance)\b/.test(normalize(query.title));
  const radius = building ? 10 : Math.max(50, Math.min(Number(query.mu_distance_meters) || 100, Number(issue.mu_distance_meters) || 100));
  const objects = new Set(["lock", "intercom", "elevator", "roof", "leak", "playground", "budget", "pothole", "parking", "bus"]);
  const aa = [...terms(query.title)].filter(t => objects.has(t));
  const bb = [...terms(issue.title)].filter(t => objects.has(t));
  if (aa.length && bb.length && !aa.some(t => bb.includes(t))) return false;
  return haversineDistance(p, q) <= radius;
}
function rankMatches(query, entries, submitterId, today = Lifecycle.todayIn(Lifecycle.TIME_ZONE)) {
  const matches = [];
  const titleConflicts = [];
  let active = 0, semanticReady = 0;
  for (const { id, issue, discussion, embedding } of entries) {
    const phase = Lifecycle.phaseOf(discussion, issue);
    if (!["chat", "voting"].includes(phase) || /^(closed|archived|completed|cancelled|canceled)$/.test(issue.status || "")) continue;
    const ends = issue.ends || discussion.ends;
    if (Lifecycle.isDate(ends) && Lifecycle.isExpired(ends, today)) continue;
    active++;
    const ready = currentVector(embedding, issue);
    if (ready) semanticReady++;
    const titleConflict = titleKey(query.title) === titleKey(issue.title);
    if (titleConflict) titleConflicts.push(id);
    if (!titleConflict && !compatibleContext(query, issue)) continue;
    const titleExact = normalize(query.title) === normalize(issue.title);
    const lexical = overlap(query.title, issue.title);
    const semantic = ready && query.vector ? ISR.cosine(query.vector, vector(embedding.vector)) : 0;
    if (!titleExact && lexical < TEXT_THRESHOLD && semantic < SEMANTIC_THRESHOLD) continue;
    const version = hash([issue.title, issue.description, toLatLon(issue.location), phase, ends || null]);
    const alreadyMember = Object.hasOwn(issue.isr_scores || discussion.isr_scores || {}, String(submitterId)) ||
      (discussion.participants || []).map(String).includes(String(submitterId));
    matches.push({ issue_id: id, title: issue.title, description: String(issue.description || "").slice(0, 400),
      location: toLatLon(issue.location), phase, already_member: alreadyMember, join_allowed: phase === "chat",
      title_conflict: titleConflict, version, reason: titleConflict ? "Another active issue already uses this title" : titleExact ? "Same title and affected place" : semantic >= SEMANTIC_THRESHOLD ? "Similar problem at the same affected place" : "Related wording at the same affected place",
      score: titleConflict ? 2 : titleExact ? 1 : Math.max(lexical, semantic) });
  }
  matches.sort((a, b) => b.score - a.score || a.issue_id.localeCompare(b.issue_id));
  return { version: VERSION, title_conflicts: titleConflicts.sort(), matches: matches.slice(0, LIMIT), coverage: { active, semantic_ready: semanticReady, legacy_text_only: active - semanticReady } };
}
function requireReview(result, review) {
  if (result.title_conflicts && result.title_conflicts.length) {
    throw Object.assign(new Error("An active issue already uses this title. Choose a distinct title and check again."), { status: 409, similar_issues: result });
  }
  if (!result.matches.length) return null;
  const reason = review && typeof review.reason === "string" ? review.reason.trim() : "";
  const seen = new Set((review && Array.isArray(review.matches) ? review.matches : []).map(m => `${m.issue_id}:${m.version}`));
  if (!reason || reason.length > 1000 || result.matches.some(m => !seen.has(`${m.issue_id}:${m.version}`))) {
    throw Object.assign(new Error("Review the similar active issues before creating a separate issue."), { status: 409, similar_issues: result });
  }
  return { reason, matches: result.matches.map(({ issue_id, version }) => ({ issue_id, version })), matching_version: VERSION };
}

const ISSUE_FIELDS = ["title", "description", "location", "classification", "mu_distance_meters", "status", "ends", "isr_scores"];
const DISCUSSION_FIELDS = ["topic", "last_message_text", "location", "status", "ends", "participants", "isr_scores"];
async function findSimilar(db, query, submitterId, transaction) {
  const read = ref => transaction ? transaction.get(ref) : ref.get();
  const issues = await read(db.collection("issues").select(...ISSUE_FIELDS));
  const discussions = await read(db.collection("discussions").select(...DISCUSSION_FIELDS));
  const embeddings = await read(db.collection("issue_vectors").select("model", "dims", "template_version", "task_type", "text_sha256", "vector"));
  const byId = new Map();
  issues.forEach(s => byId.set(s.id, { id: s.id, issue: s.data(), discussion: {} }));
  discussions.forEach(s => {
    const discussion = s.data();
    const entry = byId.get(s.id) || { id: s.id, issue: { title: discussion.topic, description: discussion.last_message_text, location: discussion.location, ends: discussion.ends } };
    entry.discussion = discussion;
    byId.set(s.id, entry);
  });
  embeddings.forEach(s => { if (byId.has(s.id)) byId.get(s.id).embedding = s.data(); });
  return rankMatches(query, [...byId.values()], submitterId);
}
module.exports = { VERSION, SEMANTIC_THRESHOLD, TEXT_THRESHOLD, LIMIT, normalize, titleKey, terms, overlap, hash, issueText, vector, currentVector, compatibleContext, rankMatches, requireReview, findSimilar };
