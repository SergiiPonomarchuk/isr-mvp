/**
 * Issue parameters: what the server trusts (task A2, PD-8).
 *
 * "Nobody types a number": every derived parameter (relevance weights, ISR
 * weights, μ, σ, demographic rules, expertise domain, reasoning texts) comes
 * from the AI assistant on the server. The browser may send only text: title,
 * description, location, submitter and a clarification of the context.
 *
 * checkIssue derives the parameters and stores them as a draft
 * (collection `issue_drafts`, written by the server only); createIssue reads
 * the numbers from that draft and ignores any numbers in the request body.
 *
 * Pure functions only, so they can be unit tested without Firebase.
 */

const { demographicRulesForScope, needsResidentialScopeRecheck } = require("./issue-scope");
const { toLatLon } = require("./geo");
const { samePoint } = require("./location");

const MAX_CLARIFICATION = 2000;

// Fields removed by A2: Expertise has no weights and no resources part.
const OBSOLETE_PARAM_FIELDS = [
  "expertise_weights", "expertise_weights_reasoning", "expertise_explanations",
  "w_education", "w_experience", "w_resources",
  "reasoning_education", "reasoning_experience", "reasoning_resources",
  "contemporary_importance", "age_penalty_threshold"
];

/** The clarification text of a "Derive again" request, trimmed and capped. */
function readClarification(body) {
  const c = body && typeof body.clarification === "string" ? body.clarification.trim() : "";
  return c.slice(0, MAX_CLARIFICATION);
}

/** Text inputs the browser is allowed to send. Nothing numeric. */
function readTextInputs(body) {
  const b = body || {};
  return {
    title: typeof b.title === "string" ? b.title : "",
    description: typeof b.description === "string" ? b.description : "",
    location: b.location,
    // U6 (R6): "creator" when the creator moved the pin; anything else means the server decides.
    locationSource: b.location_source === "creator" ? "creator" : "auto",
    submitterId: b.submitterId,
    clarification: readClarification(b)
  };
}

const num = (v, d) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : d;
};

/**
 * The parameters derived by the AI assistant, in the shape the endpoints use.
 * `ai` is the normalized result of aiHelper.checkIssueParams.
 */
function paramsFromAi(ai) {
  const a = Object.assign({}, ai || {});
  for (const k of OBSOLETE_PARAM_FIELDS) delete a[k];
  const edp = a.expertise_domain_parameters ? Object.assign({}, a.expertise_domain_parameters) : null;
  if (edp) {
    delete edp.contemporary_importance;
    delete edp.age_penalty_threshold;
  }
  const gp = a.geographic_parameters || {};
  const rw = a.relevance_weights || {};
  const w = a.weights || {
    w_D: rw.w_demographic, w_G: rw.w_geographic, w_S: rw.w_semantic, w_X: rw.w_social
  };
  const aw = a.aggregation_weights || {};
  return {
    category: a.category || (a.classification && a.classification.issue_category) || "building.maintenance.general",
    classification: a.classification || null,
    mu: num(gp.mu_distance_meters !== undefined ? gp.mu_distance_meters : a.mu, 100),
    sigma: num(gp.sigma_distance_meters !== undefined ? gp.sigma_distance_meters : a.sigma, 50),
    geographic_parameters: a.geographic_parameters || null,
    weights: { w_D: num(w.w_D, 0), w_G: num(w.w_G, 0), w_S: num(w.w_S, 0), w_X: num(w.w_X, 0) },
    relevance_weights: a.relevance_weights || null,
    relevance_reasoning: a.relevance_reasoning || "",
    relevance_explanations: a.relevance_explanations || null,
    aggregation_weights: {
      w_relevance: num(aw.w_relevance, 0),
      w_expertise: num(aw.w_expertise, 0),
      w_contribution: num(aw.w_contribution, 0)
    },
    aggregation_reasoning: a.aggregation_reasoning || "",
    isr_explanations: a.isr_explanations || null,
    demographics: demographicRulesForScope(a.demographics || a.demographic_rules || { employmentStatus: "any", familyStatus: "any" }, a.classification),
    demographic_rules: demographicRulesForScope(a.demographic_rules || a.demographics || {}, a.classification),
    expertise_depth: a.expertise_depth || "None",
    expertise_domain: a.expertise_domain || (edp && edp.expertise_domain) || "General Maintenance",
    expertise_domain_parameters: edp,
    resources_needed: Array.isArray(a.resources_needed) ? a.resources_needed : [],
    // U6 (R1): where the issue is, as the Analyzer said; the point is resolved at Check.
    location_reference: a.location_reference || { anchor: "none", place: "" }
  };
}

/**
 * The draft document checkIssue stores (server-only collection `issue_drafts`).
 * U6 (R4): `loc` is location.js resolveIssueLocation's answer; createIssue uses its point.
 */
function makeDraft(inputs, params, nowIso, loc) {
  const draft = {
    submitter_id: String(inputs.submitterId),
    title: inputs.title,
    description: inputs.description,
    clarification: inputs.clarification || "",
    params,
    created_at: nowIso
  };
  if (loc && toLatLon(loc.location)) {
    draft.location = toLatLon(loc.location);
    draft.location_source = loc.source;
    draft.location_label = loc.label || "";
    draft.location_reference = (params && params.location_reference) || { anchor: "none", place: "" };
    draft.location_suggested = loc.suggested && toLatLon(loc.suggested.location)
      ? { location: toLatLon(loc.suggested.location), source: loc.suggested.source, label: loc.suggested.label || "" }
      : null;
  }
  return draft;
}

/**
 * Parameters for createIssue, read from the draft. Throws an Error with a
 * `status` (400/403/404/409) when the draft cannot be used. Numbers in the body
 * are never read.
 */
function paramsForCreate(body, draft) {
  const inputs = readTextInputs(body);
  if (!body || !body.draftId) {
    throw Object.assign(new Error("Missing draftId: run the check first."), { status: 400 });
  }
  if (!draft) {
    throw Object.assign(new Error("Draft not found: run the check again."), { status: 404 });
  }
  if (String(draft.submitter_id) !== String(inputs.submitterId)) {
    throw Object.assign(new Error("The draft belongs to another submitter."), { status: 403 });
  }
  if (draft.title !== inputs.title || draft.description !== inputs.description) {
    throw Object.assign(new Error("Title or description changed after the check: derive the parameters again."), { status: 409 });
  }
  // U6 (R5): the point is the one the check resolved; a different one needs a new check.
  if (Array.isArray(draft.location) && !samePoint(toLatLon(inputs.location), draft.location, 1)) {
    throw Object.assign(new Error("The location changed after the check: check again."), { status: 409 });
  }
  // A5: do not silently change the membership implied by a previously checked draft.
  if (needsResidentialScopeRecheck(draft.params)) {
    throw Object.assign(new Error("The issue scope needs a new check: check again."), { status: 409 });
  }
  return draft.params;
}

/**
 * U6 (R5): the point createIssue uses: the draft's, or, for a draft from before U6, the body's.
 * Call it after paramsForCreate, which refuses a body point that differs from the draft's.
 */
function locationForCreate(body, draft) {
  if (draft && Array.isArray(draft.location)) {
    return {
      location: draft.location,
      location_source: draft.location_source || null,
      location_reference: draft.location_reference || null,
    };
  }
  return { location: toLatLon(body && body.location), location_source: null, location_reference: null };
}

module.exports = {
  MAX_CLARIFICATION,
  OBSOLETE_PARAM_FIELDS,
  readClarification,
  readTextInputs,
  paramsFromAi,
  makeDraft,
  paramsForCreate,
  locationForCreate
};
