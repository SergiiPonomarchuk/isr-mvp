"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const AI = require("../ai-config");
const Review = require("../context-review");
const LIMITS = Object.freeze({ reviews: 14, embeddingTexts: 45, embeddingPosts: 17, usdMicros: 500000 });
const CUMULATIVE_LIMITS = Object.freeze({...LIMITS,reviews:15});
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const fail = message => { throw Object.assign(new Error(message), { code: "pilot_guard" }); };

function save(file, value) {
  const temporary = file + ".tmp";
  const fd = fs.openSync(temporary, "w");
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + "\n"); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporary, file);
}

function usageOf(response) {
  const raw = response && response.usageMetadata;
  if (!raw) return null;
  const result = {};
  for (const name of ["promptTokenCount", "candidatesTokenCount", "thoughtsTokenCount", "totalTokenCount", "cachedContentTokenCount", "toolUsePromptTokenCount"]) {
    const v = raw[name];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) result[name] = v;
  }
  return Object.keys(result).length ? result : null;
}

class Ledger {
  constructor(folder, pins, authorization, parentReceipt = null) {
    let inherited=null;
    if(parentReceipt){
      const bytes=fs.readFileSync(parentReceipt.file);
      if(sha(bytes)!==parentReceipt.sha256)fail("Original receipt hash changed.");
      const parent=JSON.parse(bytes);
      if(parent.status!=="stopped_no_retry" || parent.parent_receipt || parent.attempts.length!==1 || parent.attempts[0].kind!=="review" || parent.attempts[0].http_attempts!==1 || parent.attempts[0].embedding_texts!==0 || !Number.isSafeInteger(parent.attempts[0].reserved_usd_micros) || parent.attempts[0].reserved_usd_micros<0)fail("Unexpected original receipt; no budget reset permitted.");
      inherited={file:parentReceipt.file,sha256:parentReceipt.sha256,totals:{reviews:1,embeddingTexts:0,embeddingPosts:0,reserved_usd_micros:parent.attempts[0].reserved_usd_micros,transport_attempts:1},reported_usage:parent.attempts[0].usage||{},reported_cost_usd_micros:parent.attempts[0].reported_cost_usd_micros||0};
    }
    fs.mkdirSync(folder, { recursive: true });
    this.folder = folder;
    this.file = path.join(folder, "ledger.json");
    if (fs.existsSync(this.file)) fail("A pilot receipt already exists; replay it offline, never repeat requests automatically.");
    this.lockFile = path.join(folder, "pilot.lock");
    this.lock = fs.openSync(this.lockFile, "wx");
    this.data = { version: "m3-pilot-ledger-2", authorization, pins, limits: inherited?CUMULATIVE_LIMITS:LIMITS, parent_receipt:inherited, status: "ready", attempts: [], cases: {}, created_at: new Date().toISOString() };
    this.persist();
  }
  persist() { save(this.file, this.data); }
  currentTotals() {
    return this.data.attempts.reduce((n, a) => ({ reviews: n.reviews + (a.kind === "review" ? 1 : 0), embeddingTexts: n.embeddingTexts + a.embedding_texts, embeddingPosts: n.embeddingPosts + (a.kind === "embedding" ? 1 : 0), reserved_usd_micros: n.reserved_usd_micros + a.reserved_usd_micros, transport_attempts: n.transport_attempts + a.http_attempts }), { reviews: 0, embeddingTexts: 0, embeddingPosts: 0, reserved_usd_micros: 0, transport_attempts: 0 });
  }
  totals() {
    const current=this.currentTotals(),base=this.data.parent_receipt && this.data.parent_receipt.totals;
    if(base)for(const key of Object.keys(current))current[key]+=base[key];
    return current;
  }
  assertParent() {
    const p=this.data.parent_receipt;
    if(p && sha(fs.readFileSync(p.file))!==p.sha256)fail("Original receipt changed during the corrected run.");
  }
  reserve(kind, args, context) {
    if (this.active) fail("Parallel or nested provider requests are forbidden.");
    if (!context || !context.caseId || !context.stage) fail("Missing approved case binding.");
    const requestKey = context.caseId + ":" + context.stage;
    if (this.data.attempts.some(a => a.request_key === requestKey)) fail("A request is already reserved; no automatic repeat is permitted.");
    if (Object.keys(args).some(k => !["model", "contents", "config"].includes(k))) fail("Unapproved request arguments.");
    let estimatedInput, reserved, count = 0;
    if (kind === "review") {
      if (Object.keys(args.config || {}).some(k => !["maxOutputTokens", "temperature", "seed", "responseMimeType", "responseJsonSchema"].includes(k))) fail("Unapproved review configuration field.");
      if (args.model !== AI.TEXT_MODEL || typeof args.contents !== "string" || args.config.maxOutputTokens !== 8192 || args.config.temperature !== AI.TEMPERATURE || args.config.seed !== AI.SEED || args.config.responseMimeType !== "application/json" || args.config.tools || args.config.httpOptions) fail("Review request differs from approved configuration.");
      if(Review.hash(args.config.responseJsonSchema)!==Review.schemaHash())fail("Structured schema differs from the approved source.");
      const bytes = Buffer.byteLength(JSON.stringify({contents:args.contents,responseJsonSchema:args.config.responseJsonSchema}));
      if (bytes > 32768) fail("Review prompt exceeds the approved byte envelope.");
      estimatedInput = bytes + 1024;
      reserved = Math.ceil(estimatedInput * .25 + 8192 * 1.5);
    } else if (kind === "embedding") {
      if (Object.keys(args.config || {}).some(k => !["outputDimensionality", "taskType"].includes(k))) fail("Unapproved embedding configuration field.");
      if (args.model !== AI.EMBED_MODEL || !Array.isArray(args.contents) || !args.contents.length || args.config.outputDimensionality !== 768 || args.config.taskType !== AI.TASK_TYPE_ISSUE || args.config.httpOptions) fail("Embedding request differs from approved configuration.");
      count = args.contents.length;
      const bytes = args.contents.map(text => { if (typeof text !== "string" || Buffer.byteLength(text) > 8192) fail("Embedding text exceeds the approved byte envelope."); return Buffer.byteLength(text); });
      estimatedInput = bytes.reduce((a, b) => a + b + 32, 0);
      reserved = Math.ceil(estimatedInput * .15);
    } else fail("Unsupported paid operation.");
    const t = this.totals();
    if (t.reviews + (kind === "review" ? 1 : 0) > this.data.limits.reviews || t.embeddingPosts + (kind === "embedding" ? 1 : 0) > this.data.limits.embeddingPosts || t.embeddingTexts + count > this.data.limits.embeddingTexts || t.reserved_usd_micros + reserved > this.data.limits.usdMicros) fail("The approved attempt/text/cost allowance is exhausted.");
    const texts = kind === "review" ? [args.contents] : args.contents;
    const attempt = { id: this.data.attempts.length + 1, request_key: requestKey, case_id: context.caseId, stage: context.stage, template: context.template || null, kind, model: args.model, request_sha256: sha(JSON.stringify(args)), schema_sha256:kind==="review"?Review.schemaHash():null, text_sha256: texts.map(sha), estimated_input_tokens_bytes: estimatedInput, embedding_texts: count, reserved_usd_micros: reserved, http_attempts: 0, status: "reserved", reserved_at: new Date().toISOString() };
    this.data.attempts.push(attempt); this.active = attempt; this.persist();
    return attempt;
  }
  transport(attempt) {
    if (this.active !== attempt || attempt.status !== "reserved" || attempt.http_attempts !== 0) fail("A second or unreserved HTTP attempt is forbidden.");
    attempt.http_attempts = 1; attempt.status = "sending"; this.persist();
  }
  complete(attempt, response) {
    if (attempt.http_attempts !== 1) fail("The SDK did not use the guarded transport exactly once.");
    attempt.status = "succeeded"; attempt.usage = usageOf(response); attempt.finished_at = new Date().toISOString();
    if (attempt.usage) {
      const u = attempt.usage;
      const input = u.promptTokenCount;
      const output = Math.max((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0), input == null ? 0 : (u.totalTokenCount || 0) - input);
      if (input != null) attempt.reported_cost_usd_micros = Math.ceil(input * (attempt.kind === "review" ? .25 : .15) + (attempt.kind === "review" ? output * 1.5 : 0));
      if (attempt.reported_cost_usd_micros > attempt.reserved_usd_micros) { this.data.status = "stopped_reservation_exceeded"; this.persist(); fail("Reported usage exceeded its conservative reservation; stop without another call."); }
    }
    this.persist();
  }
  failed(attempt, error) {
    if (attempt.status !== "succeeded") attempt.status = "failed_or_ambiguous";
    // Never persist SDK errors, headers, URLs or client options, which can contain credentials.
    attempt.failure_code = typeof error.status === "number" ? error.status : "provider_or_transport_failure";
    attempt.finished_at = new Date().toISOString(); this.persist();
  }
  close() {
    this.active = null;
    if (this.lock != null) { fs.closeSync(this.lock); this.lock = null; fs.unlinkSync(this.lockFile); }
  }
}

function guardedClient(ledger, { apiKey, fetchFn = globalThis.fetch, beforeRequest = () => {} }) {
  const { GoogleGenAI } = require("@google/genai");
  const transport = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url), a = ledger.active;
    if (!a || request.method !== "POST" || url.origin !== "https://generativelanguage.googleapis.com" || url.search) fail("Unapproved provider transport destination.");
    const review = /^\/v1beta\/models\/gemini-3\.1-flash-lite:generateContent$/;
    const embedding = /^\/v1beta\/models\/gemini-embedding-001:(?:batchEmbedContents|embedContent)$/;
    if (!(a.kind === "review" ? review : embedding).test(url.pathname)) fail("Unapproved provider model or operation.");
    const body = await request.clone().json();
    if (body.systemInstruction || body.tools || body.cachedContent) fail("Unapproved extra transport input.");
    const contents = a.kind === "review" ? body.contents : body.requests ? body.requests.map(r => r.content) : [body.content];
    if (!Array.isArray(contents) || contents.length !== a.text_sha256.length) fail("SDK transport text count differs from the reservation.");
    const actual = contents.map(c => {
      if (!c || !Array.isArray(c.parts) || c.parts.some(p => typeof p.text !== "string" || Object.keys(p).some(k => k !== "text"))) fail("SDK transport contains unapproved content.");
      return sha(c.parts.map(p => p.text).join(""));
    });
    if (JSON.stringify(actual) !== JSON.stringify(a.text_sha256)) fail("SDK transport text differs from its reservation.");
    if(a.kind==="review" && Review.hash(body.generationConfig && body.generationConfig.responseJsonSchema)!==a.schema_sha256)fail("SDK transport schema differs from the reservation.");
    ledger.transport(a); // Durable reservation and one-HTTP fuse, before the network.
    return fetchFn(new Request(request, { redirect: "error" }));
  };
  const sdk = new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 }, timeout: 120000, fetch: transport } });
  let context;
  const invoke = async (kind, args) => {
    ledger.assertParent();
    beforeRequest();
    const attempt = ledger.reserve(kind, args, context);
    const request = { model: args.model, contents: args.contents, config: args.config };
    save(path.join(ledger.folder, `attempt-${attempt.id}-request.json`), request);
    try {
      const response = await sdk.models[kind === "review" ? "generateContent" : "embedContent"](args);
      ledger.complete(attempt, response);
      if (kind === "review") save(path.join(ledger.folder, `attempt-${attempt.id}-response.json`), { text: response.text || "", usage: usageOf(response), model_version: response.modelVersion || null, request_sha256: attempt.request_sha256 });
      return response;
    } catch (error) {
      ledger.failed(attempt, error);
      throw Object.assign(new Error("Provider request failed or exceeded its guard; no retry is permitted."), { status: 503 });
    } finally { ledger.active = null; }
  };
  return { setContext: value => { context = value; }, models: { generateContent: args => invoke("review", args), embedContent: args => invoke("embedding", args) } };
}
module.exports = { Ledger, LIMITS, CUMULATIVE_LIMITS, guardedClient, save, sha };
