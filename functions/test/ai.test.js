// Task A4 phase A: models in one config, embeddings without a random fallback, the k closest
// examples in the prompt, the Analyzer call settings, the log entry, the rules. A fake client
// replaces the Gemini API; nothing here calls the network.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const AI = require("../ai-config");
const ai = require("../ai-helper");
const { buildAnalyzerLog } = require("../analyzer-log");
const { parseExamples } = require("../tools/build_examples");

const ROOT = path.join(__dirname, "..", "..");
const unit = (v) => { const m = Math.hypot(...v); return v.map((x) => x / m); };
const vec = (i) => { const v = new Array(AI.EMBED_DIMS).fill(0); v[i] = 1; return v; };

function fakeClient({ embed, generate } = {}) {
  const calls = { embed: [], generate: [] };
  return {
    calls,
    models: {
      embedContent: async (req) => { calls.embed.push(req); return embed ? embed(req) : { embeddings: req.contents.map((_, i) => ({ values: vec(i).map((x) => x * 3) })) }; },
      generateContent: async (req) => { calls.generate.push(req); return generate(req); },
    },
  };
}

test.afterEach(() => { ai._setClientForTests(null); ai._setExamplesForTests(null); delete process.env.GEMINI_API_KEY; });

test("one configuration: the approved models and settings", () => {
  assert.equal(AI.TEXT_MODEL, "gemini-3.1-flash-lite");
  assert.equal(AI.EMBED_MODEL, "gemini-embedding-001");
  assert.equal(AI.EMBED_DIMS, 768);
  assert.equal(AI.TEMPERATURE, 0);
  assert.equal(AI.K_EXAMPLES, 5);
  assert.equal(AI.issueText(" Broken lock ", "The door does not close."), "Broken lock. The door does not close.");
  assert.equal(AI.issueText("", "Only a description"), "Only a description");
  const src = fs.readFileSync(path.join(__dirname, "..", "ai-helper.js"), "utf8");
  assert.ok(!/Math\.random/.test(src), "no random vectors");
  assert.ok(!/gemini-1\.5|text-embedding-004|generative-ai/.test(src), "no old models or SDK");
});

test("embeddings: unit vectors of 768, the task type and size are sent, no key -> error", async () => {
  await assert.rejects(ai.embedTexts(["x"], AI.TASK_TYPE_ISSUE), /no API key/);
  const fake = fakeClient();
  ai._setClientForTests(fake);
  const [v] = await ai.embedTexts(["a text"], AI.TASK_TYPE_ISSUE);
  assert.equal(v.length, 768);
  assert.ok(Math.abs(Math.hypot(...v) - 1) < 1e-12);
  assert.deepEqual(fake.calls.embed[0].config, { taskType: "RETRIEVAL_QUERY", outputDimensionality: 768 });
  assert.equal(fake.calls.embed[0].model, "gemini-embedding-001");
  assert.throws(() => ai.unitNormalize([0, 0]), /zero vector/);
});

test("embedIssue: the t1 text, and on failure ok:false with the key redacted (no random vector)", async () => {
  process.env.GEMINI_API_KEY = "secret-test-key-123";
  ai._setClientForTests(fakeClient({ embed: () => { throw new Error("quota exceeded for key secret-test-key-123 at https://x?key=secret-test-key-123&a=1"); } }));
  const r = await ai.embedIssue("Lock", "Broken");
  assert.equal(r.ok, false);
  assert.equal(r.vector, undefined);
  assert.ok(!r.error.includes("secret-test-key-123"), r.error);
  assert.match(r.error, /\[redacted\]/);
  const fake = fakeClient();
  ai._setClientForTests(fake);
  const ok = await ai.embedIssue("Lock", "Broken");
  assert.equal(ok.ok, true);
  assert.deepEqual(fake.calls.embed[0].contents, ["Lock. Broken"]);
  assert.equal(ok.template_version, "t1");
  assert.equal(ok.text_sha256.length, 64);
});

test("nearest examples: by cosine, k of them, only with the same embedding model", () => {
  const ex = (id, v) => ({ id, title: `ex ${id}`, params: { id }, vector: v });
  ai._setExamplesForTests({ embedding_model: AI.EMBED_MODEL, examples: [
    ex(1, unit([1, 0, 0])), ex(2, unit([0.9, 0.1, 0])), ex(3, unit([0, 1, 0])), { id: 4, title: "no vector", params: {} }, ex(5, unit([0.5, 0.5, 0])),
  ] });
  assert.deepEqual(ai.nearestExamples([1, 0, 0], 3).map((e) => e.id), [1, 2, 5]);
  ai._setExamplesForTests({ embedding_model: "another-model", examples: [ex(1, unit([1, 0, 0]))] });
  assert.deepEqual(ai.nearestExamples([1, 0, 0], 3), []);
  ai._setExamplesForTests({ examples: [] });
  assert.deepEqual(ai.nearestExamples([1, 0, 0], 3), []);
});

test("the prompt carries the closest examples, or says there are none", () => {
  const withEx = ai.buildIssueAnalyzerPrompt("Lock", "Broken", "", [{ id: 7, title: "Lock broken", params: { a: 1 } }]);
  assert.match(withEx, /The 1 examples closest to this issue follow/);
  assert.match(withEx, /Example 7: "Lock broken"\n\{"a":1\}/);
  assert.ok(!/find the closest examples from the 100-examples file/.test(withEx), "the file is no longer only named");
  assert.match(ai.buildIssueAnalyzerPrompt("Lock", "Broken", "", []), /No calibrated examples are available/);
});

test("the Analyzer call: temperature 0, seed, JSON; the source, usage and examples are recorded", async () => {
  const fake = fakeClient({ generate: () => ({ text: JSON.stringify({ category: "building.security.locks" }), usageMetadata: { promptTokenCount: 3000, candidatesTokenCount: 800, totalTokenCount: 3800 } }) });
  ai._setClientForTests(fake);
  const { params, meta } = await ai.checkIssueParams("Broken lock", "Lock", "north door", [{ id: 3, title: "t", params: {} }]);
  const req = fake.calls.generate[0];
  assert.equal(req.model, "gemini-3.1-flash-lite");
  assert.deepEqual(req.config, { temperature: 0, seed: AI.SEED, responseMimeType: "application/json" });
  assert.match(req.contents, /north door/);
  assert.equal(meta.ai_source, "model");
  assert.deepEqual(meta.examples_used, [3]);
  assert.deepEqual(meta.usage, { prompt_tokens: 3000, output_tokens: 800, total_tokens: 3800 });
  assert.equal(meta.prompt_version, "p4"); // U6: p3 adds location_reference
  assert.ok(params.weights || params.relevance_weights, "normalised parameters");
});

test("Analyzer failure or no key: keyword rules, labelled fallback, error without the key", async () => {
  const none = await ai.checkIssueParams("The entrance door lock is broken", "Lock", "", []);
  assert.equal(none.meta.ai_source, "fallback");
  assert.equal(none.meta.error, "no API key");
  process.env.GEMINI_API_KEY = "secret-test-key-123";
  ai._setClientForTests(fakeClient({ generate: () => { throw new Error("401 bad key secret-test-key-123"); } }));
  const bad = await ai.checkIssueParams("The entrance door lock is broken", "Lock", "", []);
  assert.equal(bad.meta.ai_source, "fallback");
  assert.ok(!bad.meta.error.includes("secret-test-key-123"));
  assert.ok(bad.params.category);
});

test("the log entry: input, model, versions, examples; no vector, no names", () => {
  const entry = buildAnalyzerLog({
    endpoint: "checkIssue", at: "2026-11-10T00:00:00Z", draftId: "d1", submitterUid: 1543,
    input: { title: "Lock", description: "Broken", clarification: "" },
    meta: { ai_source: "model", model: AI.TEXT_MODEL, prompt_version: "p2", prompt_sha256: "x", temperature: 0, seed: 1, examples_used: [3], raw_output: "{}", usage: { total_tokens: 5 } },
    normalized: { a: 1 }, shown: { a: 1 },
    embedding: { ok: true, vector: [1, 2], model: AI.EMBED_MODEL, dims: 768, task_type: "RETRIEVAL_QUERY", template_version: "t1", text_sha256: "h" },
  });
  assert.equal(entry.submitter_uid, "1543");
  assert.equal(entry.ai_source, "model");
  assert.deepEqual(entry.examples_used, [3]);
  assert.equal(entry.embedding.vector, undefined);
  assert.ok(!JSON.stringify(entry).match(/displayName|firstName|lastName|email/));
});

test("the 100 examples: parsed from docs, ids 1-100, without the fields A2 removed", () => {
  const md = fs.readFileSync(path.join(ROOT, "docs", "ISR-Issue-Analyzer-100-Examples.md"), "utf8");
  const parsed = parseExamples(md);
  assert.equal(parsed.length, 100);
  assert.deepEqual(parsed.map((e) => e.id), Array.from({ length: 100 }, (_, i) => i + 1));
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "analyzer_examples.json"), "utf8"));
  assert.equal(data.examples.length, 100);
  for (const e of data.examples) {
    assert.ok(e.title && e.text && e.params.relevance_weights, `example ${e.id}`);
    assert.ok(!("expertise_weights" in e.params) && !("contemporary_importance" in (e.params.expertise_domain_parameters || {})));
  }
});

test("rules and endpoints: analyzer_logs server-only; the key is a secret of the three endpoints", () => {
  const rules = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
  assert.match(rules, /collection != 'issue_drafts'\s*&& collection != 'analyzer_logs'/);
  const index = fs.readFileSync(path.join(__dirname, "..", "index.js"), "utf8");
  assert.equal((index.match(/secrets: \[GEMINI_API_KEY\]/g) || []).length, 3);
  assert.ok(!/vectorizeText/.test(index));
  assert.match(index, /collection\("issue_vectors"\)\.doc\(issueId\)/);
  assert.match(index, /status\(503\)\.json\(\{ error: AI_UNAVAILABLE/);
});

// Task U6 (R1): the Analyzer says where the issue is; the server turns it into a point.
test("U6: current prompt retains location_reference with the five anchors", () => {
  assert.equal(AI.PROMPT_VERSION, "p4");
  const p = ai.buildIssueAnalyzerPrompt("Lock", "The entrance door of our house does not lock", "", []);
  assert.match(p, /"location_reference": \{/);
  assert.match(p, /"home" \| "work" \| "property" \| "named_place" \| "none"/);
  assert.match(p, /"our house", "our building", "our entrance", "our yard", "near my home" -> "home"/);
  assert.match(p, /"my garage", "my plot", "my land" -> "property"/);
  assert.match(p, /-> "named_place", with that name/);
  assert.match(p, /Never invent a place name or coordinates/);
});

test("U6: the model's location_reference is normalised; a missing or odd one is none", async () => {
  const answer = (loc) => fakeClient({ generate: () => ({ text: JSON.stringify(Object.assign({ category: "infrastructure.transport.streets" }, loc === undefined ? {} : { location_reference: loc })) }) });
  ai._setClientForTests(answer({ anchor: "named_place", place: " Linden  Street " }));
  let out = await ai.checkIssueParams("Potholes on Linden Street", "Potholes", "", []);
  assert.deepEqual(out.params.location_reference, { anchor: "named_place", place: "Linden Street" });
  ai._setClientForTests(answer(undefined));
  out = await ai.checkIssueParams("Potholes", "Potholes", "", []);
  assert.deepEqual(out.params.location_reference, { anchor: "none", place: "" });
  ai._setClientForTests(answer({ anchor: "GPS", place: "47.5, 7.6" }));
  out = await ai.checkIssueParams("x", "y", "", []);
  assert.deepEqual(out.params.location_reference, { anchor: "none", place: "" });
});

test("U6: the keyword fallback gives location_reference from the same words", async () => {
  const home = await ai.checkIssueParams("The entrance door of our house does not lock", "Door", "", []);
  assert.equal(home.meta.ai_source, "fallback");
  assert.deepEqual(home.params.location_reference, { anchor: "home", place: "" });
  const street = ai.getLocalFallbackParams("Potholes on Linden Street after the winter", "Potholes");
  assert.deepEqual(street.location_reference, { anchor: "named_place", place: "Linden Street" });
  assert.deepEqual(ai.getLocalFallbackParams("The city should publish its budget online", "Budget").location_reference, { anchor: "none", place: "" });
});
