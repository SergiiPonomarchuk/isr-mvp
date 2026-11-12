/** A5: interpret residential ownership filters at the issue-parameter boundary.
 * The D/G engines remain unchanged. See specs/tasks/A5-local-residential-scope.md.
 */
const { sanitizeDemographicRules } = require("./demographics");
const RESIDENTIAL_KINDS = new Set(["flat", "house"]);

function isLocalResidentialScope(classification) {
  const scope = String((classification && classification.scope_type) || "").trim().toLowerCase();
  return scope === "unit" || scope === "building";
}

/** A new object, including new lists; never mutates the model output or a saved draft. */
function demographicRulesForScope(rules, classification) {
  const clean = sanitizeDemographicRules(rules);
  if (isLocalResidentialScope(classification)) {
    clean.property_kinds = clean.property_kinds.filter((kind) => !RESIDENTIAL_KINDS.has(kind));
  }
  return clean;
}

/** Old Check results must be checked again if applying the guard would change their public. */
function needsResidentialScopeRecheck(params) {
  if (!params || !isLocalResidentialScope(params.classification)) return false;
  return [params.demographics, params.demographic_rules].some((rules) =>
    sanitizeDemographicRules(rules).property_kinds.some((kind) => RESIDENTIAL_KINDS.has(kind)));
}

module.exports = { demographicRulesForScope, needsResidentialScopeRecheck };
