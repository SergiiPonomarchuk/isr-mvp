"use strict";
// Offline experiment only. Not imported by application handlers or paid launchers.
const Review = require("../context-review");
const M = require("../multi-reference");
const VERSION = "candidate-review-offline-1";
const fail = message => { throw new Error(message); };

// JSON.parse alone discards repeated keys. Inspect the validated JSON text before
// projecting any verdict, including repeated escaped spellings of the same ID.
function parse(text) {
  if (typeof text !== "string" || Buffer.byteLength(text) > 262144) fail("Invalid response text");
  const value = JSON.parse(text);
  let at = 0;
  const space = () => { while (/\s/.test(text[at] || "") && at < text.length) at++; };
  function string() {
    const start = at++;
    while (at < text.length) {
      if (text[at] === "\\") { at += 2; continue; }
      if (text[at++] === '"') return JSON.parse(text.slice(start, at));
    }
    fail("Unterminated string");
  }
  function visit(depth = 0) {
    if (depth > 50) fail("Excessive JSON nesting");
    space();
    if (text[at] === '"') { string(); return; }
    if (text[at] === "{") {
      at++; space(); const keys = new Set();
      if (text[at] === "}") { at++; return; }
      while (at < text.length) {
        space(); const key = string();
        if (keys.has(key)) fail("Duplicate JSON key: " + key);
        keys.add(key); space(); at++; visit(depth + 1); space();
        if (text[at++] === "}") return;
      }
    } else if (text[at] === "[") {
      at++; space(); if (text[at] === "]") { at++; return; }
      while (at < text.length) { visit(depth + 1); space(); if (text[at++] === "]") return; }
    } else {
      while (at < text.length && !/[\s,}\]]/.test(text[at])) at++;
    }
  }
  visit();
  return value;
}

function ids(ranked, library) {
  const values = M.select(ranked).chain.map(c => c.id);
  const known = new Set(library.examples.map(e => String(e.id)));
  if (values.some(id => !/^[1-9][0-9]*$/.test(id) || !known.has(id))) fail("Unknown candidate ID");
  return values;
}
function schema(ranked, library) {
  const result = Review.responseSchema();
  delete result.properties.accepted; delete result.properties.excluded;
  result.properties.reviews = {
    type: "object", additionalProperties: false,
    properties: Object.fromEntries(ids(ranked, library).map(id => [id, { type: "string" }])),
    required: ids(ranked, library)
  };
  result.required = Object.keys(result.properties);
  return result;
}
function prompt(input, ranked, library) {
  return Review.prompt(input, ranked, library) + `\nWIRE_FORMAT=${VERSION}
Use the supplied reviews object INSTEAD OF the legacy accepted/excluded fields.
Every supplied candidate ID is required exactly once, including for non-pass results.
Each string is one of:
a:<aspect_id>:<exact input quote> for acceptance;
x:<substantive context/scope exclusion reason> for exclusion;
u:<genuinely unresolved factual reason> for a deferred review, ONLY for needs_clarification or not_consistent.
The first colon after a: separates aspect_id from the quote; the quote may contain colons.
Never use u: in a pass, never omit a key, invent default exclusions or trim the chain.
For non-pass use no a: verdicts and no scoring aspects; u: records unfinished review and never excludes anyone from a scored public.
Keep all semantic, quotation, clarification, personal-help and scope rules above. Existing mentions of accepted/excluded describe meaning; this wire format alone controls their representation.
REQUIRED_CANDIDATE_IDS=${JSON.stringify(ids(ranked, library))}`;
}
function validate(text, input, ranked, library) {
  const raw = parse(text), expected = ids(ranked, library);
  const allowed = Object.keys(schema(ranked, library).properties);
  if (!raw || Array.isArray(raw) || Object.keys(raw).some(k => !allowed.includes(k)) || allowed.some(k => !Object.hasOwn(raw,k))) fail("Invalid protocol fields");
  const reviews = raw.reviews;
  if (!reviews || Array.isArray(reviews) || typeof reviews !== "object" || Object.keys(reviews).length !== expected.length || expected.some(id => !Object.hasOwn(reviews,id)) || Object.keys(reviews).some(id => !expected.includes(id))) fail("Incomplete or unknown candidate verdicts");
  const accepted = [], excluded = Object.create(null), deferred = Object.create(null);
  for (const id of expected) {
    const verdict = reviews[id];
    if (typeof verdict !== "string") fail("Invalid candidate verdict");
    if (verdict.startsWith("a:")) {
      if (raw.result !== "pass") fail("Acceptance in non-pass outcome");
      const split = verdict.indexOf(":",2);
      if (split < 0) fail("Missing acceptance linkage");
      accepted.push({ id, aspect_id: verdict.slice(2,split), evidence: verdict.slice(split+1) });
    } else if (verdict.startsWith("x:") || verdict.startsWith("u:")) {
      const reason = verdict.slice(2);
      if (!reason.trim() || reason.length > 500) fail("Invalid candidate reason");
      if (verdict.startsWith("u:")) {
        if (raw.result === "pass") fail("Deferred candidate cannot pass");
        deferred[id] = reason;
      } else excluded[id] = reason;
    } else fail("Unknown candidate verdict");
  }
  if (raw.result !== "pass" && (!Array.isArray(raw.aspects) || raw.aspects.length)) fail("Scoring aspects in non-pass outcome");
  const { reviews: ignored, ...envelope } = raw;
  const projection = { ...envelope, accepted, excluded };
  const validated = Review.validate(projection,input,ranked,library);
  return { protocol_version: VERSION, raw_sha256: Review.hash(raw), schema_sha256: Review.hash(schema(ranked,library)), reviews, deferred, projection, validated };
}
function prepare(input, ranked, library) {
  const AI = require("../ai-config");
  const contents = prompt(input,ranked,library), responseJsonSchema = schema(ranked,library);
  if (Buffer.byteLength(JSON.stringify({ contents,responseJsonSchema })) > 32768) fail("Prototype request exceeds the existing 32 KiB envelope");
  return { model:AI.TEXT_MODEL,contents,config:{temperature:AI.TEMPERATURE,seed:AI.SEED,responseMimeType:"application/json",responseJsonSchema,maxOutputTokens:8192} };
}
module.exports = { VERSION, parse, ids, schema, prompt, prepare, validate };
