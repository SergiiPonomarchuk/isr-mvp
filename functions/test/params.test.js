// Task A2, AC3: numbers sent by the browser never reach the stored parameters.
// Run: cd functions && npm test
process.env.GEMINI_API_KEY = ""; // never call the API from tests
const test = require("node:test");
const assert = require("node:assert/strict");

const params = require("../params");
const ai = require("../ai-helper");

const AI_RESULT = ai.getLocalFallbackParams("The entrance door lock of our building is broken", "Broken lock");

test("fallback and normaliser carry no obsolete Expertise fields", () => {
  const raw = Object.assign({}, AI_RESULT, {
    expertise_weights: { w_education: 0.3, w_experience: 0.4, w_resources: 0.3 },
    expertise_explanations: { reasoning_resources: "x" },
    w_resources: 0.3,
    expertise_domain_parameters: Object.assign({}, AI_RESULT.expertise_domain_parameters,
      { contemporary_importance: 0.5, age_penalty_threshold: 60 })
  });
  const n = ai.normalizeIssueParams(raw);
  for (const obj of [AI_RESULT, n]) {
    const s = JSON.stringify(obj);
    for (const f of params.OBSOLETE_PARAM_FIELDS) assert.ok(!s.includes(`"${f}"`), f);
  }
  assert.ok(Array.isArray(n.resources_needed)); // resources_needed stays: it feeds the options
});

test("paramsFromAi takes the AI values and drops obsolete fields", () => {
  const p = params.paramsFromAi(Object.assign({}, AI_RESULT, { expertise_weights: { w_resources: 1 } }));
  assert.equal(p.mu, AI_RESULT.geographic_parameters.mu_distance_meters);
  assert.equal(p.sigma, AI_RESULT.geographic_parameters.sigma_distance_meters);
  assert.deepEqual(p.weights, AI_RESULT.weights);
  assert.deepEqual(p.aggregation_weights, AI_RESULT.aggregation_weights);
  assert.equal(p.expertise_weights, undefined);
});

test("readTextInputs keeps text only", () => {
  const i = params.readTextInputs({
    title: "t", description: "d", location: [1, 2], submitterId: "7", clarification: "  only the north entrance  ",
    mu: 9999, sigma: 1, weights: { w_D: 1 }, aggregation_weights: { w_relevance: 1 }, expertise_weights: {}
  });
  assert.deepEqual(Object.keys(i).sort(), ["clarification", "description", "location", "locationSource", "submitterId", "title"]);
  assert.equal(i.clarification, "only the north entrance");
  assert.equal(i.locationSource, "auto"); // U6: only "creator" is passed on
  assert.equal(params.readTextInputs({ location_source: "creator" }).locationSource, "creator");
  assert.equal(params.readTextInputs({ location_source: "named_place" }).locationSource, "auto");
});

test("clarification is capped", () => {
  const c = params.readClarification({ clarification: "x".repeat(params.MAX_CLARIFICATION + 50) });
  assert.equal(c.length, params.MAX_CLARIFICATION);
  assert.equal(params.readClarification({ clarification: 42 }), "");
});

test("createIssue uses the draft numbers, never the body numbers", () => {
  const derived = params.paramsFromAi(AI_RESULT);
  const draft = params.makeDraft({ title: "t", description: "d", submitterId: 7, clarification: "" }, derived, "2026-11-04T00:00:00Z");
  const body = {
    draftId: "abc", title: "t", description: "d", submitterId: "7", location: [1, 2],
    mu: 1, sigma: 1, weights: { w_D: 1, w_G: 0, w_S: 0, w_X: 0 },
    aggregation_weights: { w_relevance: 1, w_expertise: 0, w_contribution: 0 },
    geographic_parameters: { mu_distance_meters: 1, sigma_distance_meters: 1 }
  };
  const p = params.paramsForCreate(body, draft);
  assert.deepEqual(p, derived);
  assert.notEqual(p.mu, 1);
});

test("createIssue refuses a missing, foreign or stale draft", () => {
  const draft = params.makeDraft({ title: "t", description: "d", submitterId: 7 }, {}, "x");
  const ok = { draftId: "a", title: "t", description: "d", submitterId: 7 };
  assert.throws(() => params.paramsForCreate(Object.assign({}, ok, { draftId: undefined }), draft), { status: 400 });
  assert.throws(() => params.paramsForCreate(ok, null), { status: 404 });
  assert.throws(() => params.paramsForCreate(Object.assign({}, ok, { submitterId: 8 }), draft), { status: 403 });
  assert.throws(() => params.paramsForCreate(Object.assign({}, ok, { description: "changed" }), draft), { status: 409 });
});

test("the analyzer prompt carries the clarification", async () => {
  // A4: the prompt builder is exported; without a key checkIssueParams returns the keyword
  // rules, labelled as the fallback.
  assert.ok(ai.buildIssueAnalyzerPrompt("Lock", "Broken lock at the entrance", "north entrance only", []).includes("north entrance only"));
  const r = await ai.checkIssueParams("Broken lock at the entrance", "Lock", "north entrance only");
  assert.ok(r.params.category);
  assert.equal(r.meta.ai_source, "fallback");
});

// Task U6 (R4, R5): the draft keeps the resolved point; Create uses it and refuses another one.
const LOC = { location: [47.5601, 7.5886], source: "home", label: "your home (from the description)", suggested: null };

test("U6: the draft stores the point, its source, label and the Analyzer's reference", () => {
  const derived = params.paramsFromAi(Object.assign({}, AI_RESULT, { location_reference: { anchor: "home", place: "" } }));
  const d = params.makeDraft({ title: "t", description: "d", submitterId: 7 }, derived, "x", LOC);
  assert.deepEqual(d.location, [47.5601, 7.5886]);
  assert.equal(d.location_source, "home");
  assert.equal(d.location_label, "your home (from the description)");
  assert.deepEqual(d.location_reference, { anchor: "home", place: "" });
  assert.equal(d.location_suggested, null);
  const moved = params.makeDraft({ title: "t", description: "d", submitterId: 7 }, derived, "x",
    { location: [47.57, 7.6], source: "creator", label: "set by you", suggested: LOC });
  assert.deepEqual(moved.location_suggested, { location: [47.5601, 7.5886], source: "home", label: "your home (from the description)" });
  // without a resolved point (a caller from before U6) the draft has no location fields
  assert.equal(params.makeDraft({ title: "t", description: "d", submitterId: 7 }, derived, "x").location, undefined);
});

test("U6: Create uses the draft's point; a body point more than 1 m away gets 409", () => {
  const draft = params.makeDraft({ title: "t", description: "d", submitterId: 7 }, {}, "x", LOC);
  const ok = { draftId: "a", title: "t", description: "d", submitterId: 7, location: [47.5601, 7.5886] };
  assert.doesNotThrow(() => params.paramsForCreate(ok, draft));
  assert.doesNotThrow(() => params.paramsForCreate(Object.assign({}, ok, { location: [47.560105, 7.5886] }), draft)); // ~0.6 m
  assert.throws(() => params.paramsForCreate(Object.assign({}, ok, { location: [47.5602, 7.5886] }), draft),
    { status: 409, message: "The location changed after the check: check again." });
  assert.throws(() => params.paramsForCreate(Object.assign({}, ok, { location: "here" }), draft), { status: 409 });
  assert.deepEqual(params.locationForCreate(ok, draft),
    { location: [47.5601, 7.5886], location_source: "home", location_reference: { anchor: "none", place: "" } });
});

test("U6: a draft from before U6 has no point; Create then uses the body's point", () => {
  const old = params.makeDraft({ title: "t", description: "d", submitterId: 7 }, {}, "x");
  const body = { draftId: "a", title: "t", description: "d", submitterId: 7, location: [47.1, 7.1] };
  assert.doesNotThrow(() => params.paramsForCreate(body, old));
  assert.deepEqual(params.locationForCreate(body, old), { location: [47.1, 7.1], location_source: null, location_reference: null });
});
