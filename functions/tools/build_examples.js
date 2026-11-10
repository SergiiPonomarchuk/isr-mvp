/**
 * Task A4 (R4): build functions/data/analyzer_examples.json from
 * docs/ISR-Issue-Analyzer-100-Examples.md (read only; docs/ is not changed).
 *
 * Each example keeps its id, title, the tags under the title, and its "Combined JSON Block"
 * without the fields A2 removed (OBSOLETE_PARAM_FIELDS; the same as paramsFromAi drops).
 *
 *   node tools/build_examples.js            parse only (no vectors; keeps vectors already in the
 *                                           file for unchanged texts)
 *   node tools/build_examples.js --embed    also embed the missing ones: one request of 100 texts,
 *                                           task type RETRIEVAL_DOCUMENT, the model in ai-config.js
 *
 * --embed needs GEMINI_API_KEY in the environment or in functions/.secret.local
 * (GEMINI_API_KEY=...). The key is never printed.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AI = require("../ai-config");
const { OBSOLETE_PARAM_FIELDS } = require("../params");

const ROOT = path.join(__dirname, "..", "..");
const SOURCE = path.join(ROOT, "docs", "ISR-Issue-Analyzer-100-Examples.md");
const OUT = path.join(__dirname, "..", "data", "analyzer_examples.json");

function stripObsolete(params) {
  const p = Object.assign({}, params);
  for (const k of OBSOLETE_PARAM_FIELDS) delete p[k];
  if (p.expertise_domain_parameters) {
    const e = Object.assign({}, p.expertise_domain_parameters);
    delete e.contemporary_importance;
    delete e.age_penalty_threshold;
    p.expertise_domain_parameters = e;
  }
  return p;
}

/** Parses the examples file into [{id, title, tags, params, text}]. */
function parseExamples(md) {
  const text = md.replace(/\r\n/g, "\n");
  const heads = [...text.matchAll(/^### (\d+)\. (.+)$/gm)];
  return heads.map((h, i) => {
    const body = text.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : text.length);
    const tags = {};
    for (const m of body.matchAll(/^- \*\*([^*]+)\*\*: `([^`]*)`/gm)) tags[m[1].trim()] = m[2].trim();
    const json = body.match(/```json\n([\s\S]*?)\n```/);
    if (!json) throw new Error(`example ${h[1]}: no JSON block`);
    const params = stripObsolete(JSON.parse(json[1]));
    const title = h[2].trim();
    const embedText = [title, tags.Category && `Category ${tags.Category}`, tags["Scope Type"] && `scope ${tags["Scope Type"]}`,
      tags.Domain && `domain ${tags.Domain}`].filter(Boolean).join(". ");
    return { id: parseInt(h[1], 10), title, tags, params, text: embedText };
  });
}

function sha256(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function loadKeyFromSecretFile() {
  if (process.env.GEMINI_API_KEY) return;
  const f = path.join(__dirname, "..", ".secret.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) process.env.GEMINI_API_KEY = m[1].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const embed = process.argv.includes("--embed");
  const md = fs.readFileSync(SOURCE, "utf8");
  const examples = parseExamples(md);
  let old = null;
  try { old = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) { /* first build */ }
  const oldById = new Map(((old && old.examples) || []).map((e) => [e.id, e]));
  const sameModel = old && old.embedding_model === AI.EMBED_MODEL && old.embedding_dims === AI.EMBED_DIMS;
  for (const ex of examples) {
    const o = oldById.get(ex.id);
    if (sameModel && o && o.text === ex.text && Array.isArray(o.vector)) ex.vector = o.vector;
  }
  const missing = examples.filter((e) => !e.vector);
  let requests = 0;
  if (embed && missing.length) {
    loadKeyFromSecretFile();
    const ai = require("../ai-helper");
    if (!ai.hasGeminiKey()) throw new Error("--embed needs GEMINI_API_KEY (environment or functions/.secret.local)");
    for (let i = 0; i < missing.length; i += 100) {
      const chunk = missing.slice(i, i + 100);
      const vecs = await ai.embedTexts(chunk.map((e) => e.text), AI.TASK_TYPE_DOCUMENT);
      requests += 1;
      chunk.forEach((e, j) => { e.vector = vecs[j].map((x) => Math.round(x * 1e7) / 1e7); });
    }
  }
  const withVec = examples.filter((e) => e.vector).length;
  const out = {
    source: "docs/ISR-Issue-Analyzer-100-Examples.md",
    source_sha256: sha256(md.replace(/\r\n/g, "\n")),
    embedding_model: withVec ? AI.EMBED_MODEL : null,
    embedding_dims: withVec ? AI.EMBED_DIMS : null,
    task_type: withVec ? AI.TASK_TYPE_DOCUMENT : null,
    examples,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out) + "\n");
  console.log(`examples: ${examples.length}; with vectors: ${withVec}; embedding requests: ${requests}; written ${path.relative(ROOT, OUT)}`);
}

module.exports = { parseExamples, stripObsolete };

if (require.main === module) {
  main().catch((e) => {
    const ai = require("../ai-helper");
    console.error(ai.redact(e && e.message ? e.message : e));
    process.exit(1);
  });
}
