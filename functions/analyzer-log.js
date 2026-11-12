/**
 * Task A4 (R7): one analyzer_logs document per Analyzer call. Pure, so it can be tested.
 * The collection is server-only (firestore.rules). The entry holds the issue text the
 * submitter typed and the submitter's id, never names or other profile fields.
 */
const crypto = require("crypto");

function sha256(text) {
  return crypto.createHash("sha256").update(String(text), "utf8").digest("hex");
}

/**
 * @param {object} a
 *   endpoint     "checkIssue" | "analyzeIssue"
 *   at           ISO time
 *   draftId      issue_drafts id (checkIssue) or null
 *   submitterUid the submitter's uid or null
 *   input        {title, description, clarification}
 *   meta         from ai-helper runAnalyzer: {ai_source, model, prompt_version, prompt_sha256,
 *                temperature, seed, examples_used, raw_output, error, usage}
 *   normalized   the normalised parameters (params.js paramsFromAi input) or null
 *   shown        the parameters sent to the browser or null
 *   embedding    {ok, model, dims, task_type, template_version, text_sha256, error} or null
 */
function buildAnalyzerLog(a) {
  const meta = a.meta || {};
  const input = a.input || {};
  return {
    at: a.at,
    endpoint: a.endpoint,
    draft_id: a.draftId || null,
    submitter_uid: a.submitterUid !== undefined && a.submitterUid !== null ? String(a.submitterUid) : null,
    input: {
      title: input.title || "",
      description: input.description || "",
      clarification: input.clarification || "",
    },
    ai_source: meta.ai_source || "none",
    model: meta.model || null,
    prompt_version: meta.prompt_version || null,
    prompt_sha256: meta.prompt_sha256 || null,
    temperature: meta.temperature !== undefined ? meta.temperature : null,
    seed: meta.seed !== undefined ? meta.seed : null,
    examples_used: Array.isArray(meta.examples_used) ? meta.examples_used : [],
    raw_output: meta.raw_output || null,
    normalized_output: a.normalized || null,
    shown_parameters: a.shown || null,
    usage: meta.usage || null,
    error: meta.error || null,
    embedding: a.embedding ? {
      ok: !!a.embedding.ok,
      model: a.embedding.model || null,
      dims: a.embedding.dims || null,
      task_type: a.embedding.task_type || null,
      template_version: a.embedding.template_version || null,
      text_sha256: a.embedding.text_sha256 || null,
      error: a.embedding.error || null,
    } : null,
  };
}

module.exports = { buildAnalyzerLog, sha256 };
