/**
 * Task A4 (roadmap stage 1): the one place for the AI models, settings and versions.
 * A model change is a change of one value here; every stored result names the model and
 * the versions it came from (issue_vectors, analyzer_logs, issue drafts).
 *
 * Models (author, 2026-11-09): the cheapest current stable models with a free tier.
 * The key is the Firebase secret GEMINI_API_KEY (functions/index.js); it is never logged.
 */
const AI = Object.freeze({
  TEXT_MODEL: "gemini-3.1-flash-lite",
  EMBED_MODEL: "gemini-embedding-001",
  EMBED_DIMS: 768,
  TEMPERATURE: 0,
  SEED: 20261110,
  // p1 = the prompt before A4 (it only named the 100 examples); p2 sends the k closest ones;
  // p3 (U6) adds location_reference; p4 (A5) constrains local residential ownership filters.
  PROMPT_VERSION: "p4",
  // t1 = A4 decision 2: the issue text is "{title}. {description}".
  EMBED_TEMPLATE_VERSION: "t1",
  // A4 open point 4.3 (a): finding the people for an issue is a search.
  TASK_TYPE_ISSUE: "RETRIEVAL_QUERY",
  TASK_TYPE_DOCUMENT: "RETRIEVAL_DOCUMENT",
  K_EXAMPLES: 5,
});

/** The text that is embedded for an issue (template t1). */
function issueText(title, description) {
  const t = String(title || "").trim();
  const d = String(description || "").trim();
  return t ? `${t}. ${d}` : d;
}

module.exports = { ...AI, issueText };
