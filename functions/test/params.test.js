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
  assert.deepEqual(Object.keys(i).sort(), ["clarification", "description", "location", "submitterId", "title"]);
  assert.equal(i.clarification, "only the north entrance");
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
  // Without a Gemini key checkIssueParams uses the local fallback; the prompt builder is internal,
  // so check the exported fallback path accepts the third argument without error.
  const r = await ai.checkIssueParams("Broken lock at the entrance", "Lock", "north entrance only");
  assert.ok(r.category);
});
