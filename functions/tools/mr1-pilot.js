"use strict";
const fs = require("node:fs");
const path = require("node:path");
const AI = require("../ai-config");
const Review = require("../context-review");
const M = require("../multi-reference");
const helper = require("../ai-helper");
const { Ledger, guardedClient, save, sha } = require("./mr1-pilot-budget");
const ROOT = path.resolve(__dirname, "../..");
const PLAN = "specs/tasks/M3-evaluation/cases.json";
const PINNED = [PLAN, "functions/data/analyzer_examples.json", "functions/ai-config.js", "functions/ai-helper.js", "functions/context-review.js", "functions/context-schema.js", "functions/demographics.js", "functions/location.js", "functions/multi-reference.js", "functions/tools/mr1-pilot.js", "functions/tools/mr1-pilot-budget.js"];
const read = (root, name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
function preflight(root, expectedPlanHash) {
  const pins = Object.fromEntries(PINNED.map(name => [name, sha(fs.readFileSync(path.join(root, name)))]));
  if (pins[PLAN] !== expectedPlanHash) throw new Error("The case plan differs from the approved binding.");
  const plan = read(root, PLAN), library = read(root, "functions/data/analyzer_examples.json");
  if (plan.cases.length !== 14 || new Set(plan.cases.map(c => c.id)).size !== 14) throw new Error("The approved case set changed.");
  const a = plan.allowance_proposed;
  if (a.text_review_attempts !== 14 || a.embedding_texts !== 45 || a.embedding_post_attempts !== 17 || a.automatic_retries !== 0 || a.estimated_charge_ceiling_usd !== .5) throw new Error("The approved allowance changed.");
  if (AI.TEXT_MODEL !== "gemini-3.1-flash-lite" || AI.EMBED_MODEL !== "gemini-embedding-001" || AI.EMBED_DIMS !== 768 || Review.VERSION !== "mr1-context-review-1") throw new Error("The approved model/version changed.");
  const whole = {};
  for (const c of plan.cases) {
    const file = path.resolve(root, c.cache_file);
    if (!file.startsWith(path.resolve(root, "specs/tasks/M3-calibration") + path.sep)) throw new Error("Cache path is outside the approved source folder.");
    pins[c.cache_file] = sha(fs.readFileSync(file));
    const cache = JSON.parse(fs.readFileSync(file, "utf8")), r = cache.records[c.cache_record];
    if (!r || sha(AI.issueText(c.input.title, c.input.description)) !== c.whole_issue_sha256 || r.text_sha256 !== c.whole_issue_sha256 || (r.model || cache.model) !== AI.EMBED_MODEL || (r.dims || cache.dimensions) !== 768 || (r.task_type || cache.task_type) !== AI.TASK_TYPE_ISSUE || (r.template_version || cache.template_version) !== AI.EMBED_TEMPLATE_VERSION || r.vector.length !== 768 || !r.vector.every(Number.isFinite) || Math.abs(Math.hypot(...r.vector) - 1) > 1e-4) throw new Error("An exact saved vector binding failed.");
    if (c.input.clarification && sha(AI.issueText(c.input.title, c.input.description) + "\nContext: " + c.input.clarification) !== c.new_selection_sha256) throw new Error("Clarification selection text changed.");
    whole[c.id] = r.vector;
  }
  return { pins, plan, library, whole };
}
function assertPins(root, pins) {
  for (const [name, hash] of Object.entries(pins)) if (sha(fs.readFileSync(path.join(root, name))) !== hash) throw new Error("Pinned source changed during the run; stop without another request.");
}
function summary(ledger) {
  const t = ledger.totals(), tokens = {}, rows = Object.entries(ledger.data.cases).map(([id, c]) => ({ id, state: c.state, outcome: c.review && c.review.result, retained: c.review && c.review.model ? c.review.model.refs.map(r => r.id) : [], questions: c.review ? c.review.questions || [] : [], message: c.review ? c.review.context_message || c.review.message : null }));
  for(const [name,value] of Object.entries(ledger.data.parent_receipt?ledger.data.parent_receipt.reported_usage:{}))tokens[name]=(tokens[name]||0)+value;
  for (const a of ledger.data.attempts) for (const [name, value] of Object.entries(a.usage || {})) tokens[name] = (tokens[name] || 0) + value;
  return { version: "m3-pilot-summary-1", status: ledger.data.status, stop_reason: ledger.data.stop_reason || null, totals: t, conservative_reserved_usd: t.reserved_usd_micros / 1e6, reported_token_totals: tokens, current_run_totals:ledger.currentTotals(),reported_cost_usd: ((ledger.data.parent_receipt && ledger.data.parent_receipt.reported_cost_usd_micros)||0)/1e6+ledger.data.attempts.reduce((s, a) => s + (a.reported_cost_usd_micros || 0), 0) / 1e6, usage_complete: ledger.data.attempts.every(a => a.status === "succeeded" && a.usage != null), cases: rows, production_writes: 0, firestore_rpcs: 0, geocode_calls: 0, profile_embedding_texts: 0, full_population: "not run; memory and publication-capacity gates remain", deployment_ready: false };
}
async function runPilot({ root = ROOT, folder, expectedPlanHash, apiKey, fetchFn, authorization, parentReceipt=null, onStatus = () => {} }) {
  const checked = preflight(root, expectedPlanHash);
  const ledger = new Ledger(folder, checked.pins, authorization,parentReceipt);
  const client = guardedClient(ledger, { apiKey, fetchFn, beforeRequest: () => assertPins(root, checked.pins) });
  const embeddingCache = {};
  const getVectors = async (c, texts, template, stage) => {
    const key = text => Review.hash({ model: AI.EMBED_MODEL, task: AI.TASK_TYPE_ISSUE, dims: 768, template, text });
    const missing = [...new Set(texts)].filter(text => !embeddingCache[key(text)]);
    if (missing.length) {
      client.setContext({ caseId: c.id, stage, template });
      const vectors = await helper.embedTexts(missing, AI.TASK_TYPE_ISSUE);
      missing.forEach((text, i) => { embeddingCache[key(text)] = { text, raw_text_sha256: sha(text), vector: vectors[i], model: AI.EMBED_MODEL, dims: 768, task_type: AI.TASK_TYPE_ISSUE, template_version: template }; });
      save(path.join(folder, "embedding-cache.json"), embeddingCache);
    }
    return texts.map(text => embeddingCache[key(text)].vector);
  };
  helper._setClientForTests(client); helper._setExamplesForTests(checked.library);
  ledger.data.status = "running"; ledger.persist();
  let active;
  try {
    for (const c of checked.plan.cases) {
      if (c.conditional_on) {
        const previous = ledger.data.cases[c.conditional_on];
        if (!previous || previous.state !== "complete" || !["needs_clarification", "not_consistent"].includes(previous.review.result)) {
          ledger.data.cases[c.id] = { state: "skipped_condition_not_met" }; ledger.persist(); continue;
        }
      }
      active = c.id;
      const state = { state: "started", input: c.input, input_sha256: Review.hash(c.input), whole_issue_sha256: c.whole_issue_sha256 };
      ledger.data.cases[c.id] = state; ledger.persist();
      let vector = checked.whole[c.id];
      if (c.input.clarification) [vector] = await getVectors(c, [AI.issueText(c.input.title, c.input.description) + "\nContext: " + c.input.clarification], "mr1-selection1", "selection");
      const ranked = helper.nearestExamples(vector, checked.library.examples.length).map(e => ({ id: String(e.id), score: Math.max(0, Math.min(1, e.cosine)) }));
      state.raw_chain = M.select(ranked); ledger.persist();
      client.setContext({ caseId: c.id, stage: "review", template: Review.VERSION });
      const response = await helper.reviewContext(c.input, ranked, checked.library);
      state.review = response.result; state.raw_review = response.raw; state.review_meta = response.meta; state.state = "reviewed"; ledger.persist();
      if (["vague-help", "compound-lock-software"].includes(c.id) && response.result.result === "pass") throw new Error("A pinned vague/mixed diagnostic passed unexpectedly; semantic review is required before further requests.");
      if (response.result.result === "pass") {
        const aspects = Object.values(response.result.aspects);
        const vectors = await getVectors(c, aspects.map(a => a.text), "mr1-aspect1", "aspects");
        state.bundle = { version: Review.VERSION,prompt_version:Review.PROMPT_VERSION,schema_sha256:Review.schemaHash(), scope: response.result.scope, model: response.result.model, aspects: Object.fromEntries(aspects.map((a, i) => [a.id, { ...a, vector: vectors[i], model: AI.EMBED_MODEL, dims: 768, task_type: AI.TASK_TYPE_ISSUE, template_version: "mr1-aspect1", text_sha256: Review.hash(a.text) }])), library_hash: response.result.library_hash, exclusions: response.result.exclusions, raw_chain: response.result.raw_chain };
      }
      state.state = "complete"; save(path.join(folder, c.id + ".json"), state); ledger.persist();
      onStatus({ case: c.id, outcome: response.result.result, retained: response.result.model ? response.result.model.refs.length : 0, totals: ledger.totals() });
    }
    ledger.data.status = "completed_pending_semantic_review";
  } catch (error) {
    ledger.data.status = "stopped_no_retry";
    ledger.data.stop_reason = helper.redact(error.message).slice(0, 300);
    if (active && ledger.data.cases[active]) ledger.data.cases[active].state = "stopped";
    for (const c of checked.plan.cases) if (!ledger.data.cases[c.id]) ledger.data.cases[c.id] = { state: "not_run_after_stop" };
  } finally {
    ledger.data.finished_at = new Date().toISOString(); ledger.persist();
    const result = summary(ledger); save(path.join(folder, "summary.json"), result);
    helper._setClientForTests(null); helper._setExamplesForTests(null); ledger.close();
  }
  return JSON.parse(fs.readFileSync(path.join(folder, "summary.json"), "utf8"));
}

async function cli() {
  const expected = sha(fs.readFileSync(path.join(ROOT, PLAN)));
  if (!process.argv.includes("--apply")) { preflight(ROOT, expected); console.log(JSON.stringify({ dry_run: true, verified_cases: 14, plan_sha256: expected, provider_calls: 0 })); return; }
  const corrected=process.argv.includes("--corrected");
  const approvalFile = path.join(ROOT, corrected?"specs/tasks/M3-evaluation/corrected-approval.json":"specs/tasks/M3-evaluation/approval.json"), approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
  if (approval.plan_sha256 !== expected || process.env.M3_PILOT_AUTHORIZATION_SHA256 !== sha(fs.readFileSync(approvalFile)) || !process.env.GEMINI_API_KEY) throw new Error("Approved launcher binding is missing; no request permitted.");
  const folder = path.join(ROOT, corrected?"specs/tasks/M3-evaluation/pilot-20261117-corrected":"specs/tasks/M3-evaluation/pilot-20261117");
  const parentReceipt=corrected?{file:path.join(ROOT,"specs/tasks/M3-evaluation/pilot-20261117/ledger.json"),sha256:approval.parent_receipt_sha256}:null;
  if(corrected && (approval.prompt_version!==Review.PROMPT_VERSION || approval.schema_sha256!==Review.schemaHash() || approval.max_cumulative_reviews!==15 || approval.max_embedding_texts!==45 || approval.max_embedding_posts!==17 || approval.cumulative_cost_ceiling_usd!==.5))throw new Error("Corrected cumulative approval differs.");
  const result = await runPilot({ folder, expectedPlanHash: expected, apiKey: process.env.GEMINI_API_KEY, authorization: approval,parentReceipt, onStatus: value => console.log(JSON.stringify(value)) });
  console.log(JSON.stringify({ status: result.status, stop_reason: result.stop_reason, totals: result.totals, conservative_reserved_usd: result.conservative_reserved_usd, reported_token_totals: result.reported_token_totals }));
  if (result.status === "stopped_no_retry") process.exitCode = 1;
}
module.exports = { preflight, runPilot, summary };
if (require.main === module) cli().catch(() => { console.error("Pilot launch refused; no automatic retry. Inspect the bounded receipt, without credentials."); process.exitCode = 1; });
