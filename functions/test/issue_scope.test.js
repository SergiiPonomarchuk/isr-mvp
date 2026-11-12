const test = require("node:test");
const assert = require("node:assert/strict");
const { demographicRulesForScope, needsResidentialScopeRecheck } = require("../issue-scope");
const { normalizeIssueParams } = require("../ai-helper");
const { paramsFromAi, makeDraft, paramsForCreate } = require("../params");
const { evaluateDemographics } = require("../demographics");
const { nearestAnchor, withinCutoff } = require("../geo");
const AI = require("../ai-config");
const fixture = require("../../tests/fixtures/a5_local_residential_scope.json");

test("captured P2 building result no longer bypasses distance for an unrelated owner", () => {
  const raw = structuredClone(fixture);
  const derived = paramsFromAi(raw);
  const point = [47.590114, 7.611201];
  const remoteOwner = { geography: [{ type: "home", geo: [47.61, 7.63] },
    { type: "property", kind: "flat", place: "another building", geo: [47.61, 7.63] }] };
  assert.equal(evaluateDemographics(remoteOwner, raw.demographics).bypassDistance, true,
    "the observed unguarded response reproduced the original bug");
  assert.equal(evaluateDemographics(remoteOwner, derived.demographics).bypassDistance, false);
  assert.equal(withinCutoff(nearestAnchor(remoteOwner.geography, point).distance, raw.mu, raw.sigma), false);
  const landlord = { geography: [...remoteOwner.geography, { type: "property", kind: "flat", geo: point }] };
  assert.equal(nearestAnchor(landlord.geography, point).type, "property");
  assert.equal(withinCutoff(nearestAnchor(landlord.geography, point).distance, raw.mu, raw.sigma), true);
  assert.deepEqual(derived.weights, fixture.weights);
  assert.equal(derived.mu, 40); assert.equal(derived.sigma, 30);
  assert.deepEqual(raw, fixture, "the boundary must not mutate captured inputs");
});

test("AI normalization and parameter boundary guard both aliases, including mismatched ones", () => {
  const raw = { classification: { scope_type: "building" },
    demographic_rules: { property_kinds: ["flat", "garage"] },
    demographics: { property_kinds: ["house", "land"] } };
  const n = normalizeIssueParams(structuredClone(raw));
  const direct = paramsFromAi(raw);
  for (const p of [n, direct]) {
    assert.deepEqual(p.demographic_rules.property_kinds, ["garage"]);
    assert.deepEqual(p.demographics.property_kinds, ["land"]);
  }
  for (const alias of ["demographics", "demographic_rules"]) {
    const input = { classification: { scope_type: "unit" }, [alias]: { property_kinds: ["flat"] } };
    const p = paramsFromAi(input);
    assert.deepEqual(p.demographic_rules.property_kinds, []);
    assert.deepEqual(p.demographics.property_kinds, []);
  }
  assert.deepEqual(demographicRulesForScope(undefined, { scope_type: "unit" }).property_kinds, []);
});

test("mixed local filters keep explicit places and non-residential kinds without mutation", () => {
  const r = { minAge: 14, places: ["osbb 1, h5"], features: ["pets"],
    property_kinds: ["flat", "house", "garage", "land", "commercial", "other"] };
  const before = structuredClone(r);
  const p = demographicRulesForScope(r, { scope_type: " UNIT " });
  assert.deepEqual(p.property_kinds, ["garage", "land", "commercial", "other"]);
  assert.deepEqual(p.places, r.places); assert.deepEqual(p.features, r.features);
  assert.deepEqual(r, before);
  const owner = { geography: [{ type: "property", place: "osbb 1, h5", kind: "flat" }] };
  assert.equal(evaluateDemographics(owner, p).match, "place");
});

test("broader ownership scopes and garage ownership retain their existing bypass", () => {
  for (const scope_type of ["street_segment", "neighborhood", "district", "city", "region", "global_digital", "unknown", undefined]) {
    const p = demographicRulesForScope({ property_kinds: ["flat", "house"] }, { scope_type });
    assert.deepEqual(p.property_kinds, ["flat", "house"]);
    assert.equal(evaluateDemographics({ geography: [{ type: "property", kind: "house" }] }, p).bypassDistance, true);
  }
  const garage = demographicRulesForScope({ property_kinds: ["garage"] }, { scope_type: "building" });
  assert.equal(evaluateDemographics({ geography: [{ type: "property", kind: "garage" }] }, garage).bypassDistance, true);
});

test("Create refuses old offending drafts rather than silently changing the checked group", () => {
  const inputs = { title: "Entrance lock", description: "Our entrance lock is broken.", submitterId: 1189 };
  const body = { ...inputs, draftId: "saved" };
  for (const alias of ["demographics", "demographic_rules"]) {
    const oldParams = { classification: { scope_type: "building" }, [alias]: { property_kinds: ["flat"] } };
    const draft = makeDraft(inputs, oldParams, "now");
    assert.equal(needsResidentialScopeRecheck(oldParams), true);
    assert.throws(() => paramsForCreate(body, draft), { status: 409, message: "The issue scope needs a new check: check again." });
    assert.deepEqual(draft.params, oldParams);
    const corrected = paramsFromAi(oldParams);
    assert.equal(paramsForCreate(body, makeDraft(inputs, corrected, "now")), corrected);
  }
  for (const p of [{}, { classification: { scope_type: "city" }, demographics: { property_kinds: ["flat"] } },
    { classification: { scope_type: "building" }, demographics: { property_kinds: ["garage"] } }]) {
    assert.equal(paramsForCreate(body, makeDraft(inputs, p, "now")), p);
  }
});

test("p4 instructs local residential filtering while retaining broader ownership and garage behavior", () => {
  const fs = require("node:fs"), path = require("node:path");
  const source = fs.readFileSync(path.join(__dirname, "../ai-helper.js"), "utf8");
  assert.equal(AI.PROMPT_VERSION, "p4");
  assert.match(source, /For unit\/building scope, NEVER select generic flat\/house ownership/);
  assert.match(source, /Genuinely broader ownership issues need the corresponding broader scope/);
  assert.match(source, /Garage, land, commercial and other property kinds keep their existing inclusion behavior/);
});


test("a model ignoring p4 is guarded while its raw answer remains auditable", async () => {
  const ai = require("../ai-helper");
  const raw = structuredClone(fixture);
  ai._setClientForTests({ models: { generateContent: async () => ({
    text: JSON.stringify(raw), usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 }
  }) } });
  try {
    const r = await ai.checkIssueParams("Our entrance lock is broken", "Entrance", "", []);
    assert.equal(r.meta.ai_source, "model");
    assert.equal(r.meta.prompt_version, "p4");
    assert.deepEqual(r.params.demographics.property_kinds, []);
    assert.deepEqual(r.params.demographic_rules.property_kinds, []);
    assert.deepEqual(JSON.parse(r.meta.raw_output).demographics.property_kinds, ["flat", "house"]);
  } finally { ai._setClientForTests(null); }
});
