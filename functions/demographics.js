/**
 * Demographic relevance (D), task A3 (author decisions 2026-11-05).
 *
 * As built, D is a pass/fail check: 1.0 or 0.0 (soft D is PD-1, a separate task).
 * A3 adds:
 *  - places: names of companies, organisations or properties the issue is about.
 *    A work or property entry of the user whose `place` matches is a cause to
 *    include: D = 1.0 and the user is not cut by the distance cutoff or by the
 *    features check. The age, employment and family checks still apply.
 *  - property_kinds: kinds of property the issue is about (flat, house, land,
 *    garage, commercial, other), matched against the user's property entries.
 *  - features are matched against users.features AND the names of the user's
 *    activity skills (interests). Interests count for D only, never for G.
 *
 * Pure functions only. The Python port is in relevance_evaluator.py; both are
 * checked against tests/fixtures/a3_d_g_cases.json.
 */

const PROPERTY_KINDS = ["flat", "house", "land", "garage", "commercial", "other"];
const MAX_LIST = 20;
const MAX_NAME = 120;
const MIN_PLACE_LEN = 3; // shorter names would match too much

const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

/** Clean the derived demographic rules: lists of short strings, known property kinds. */
function sanitizeDemographicRules(rules) {
  const r = Object.assign({}, rules || {});
  const list = (v) => (Array.isArray(v) ? v : [])
    .filter((x) => typeof x === "string")
    .map((x) => x.trim().slice(0, MAX_NAME))
    .filter(Boolean)
    .slice(0, MAX_LIST);
  r.features = list(r.features);
  r.places = list(r.places);
  r.property_kinds = list(r.property_kinds).map(norm).filter((k) => PROPERTY_KINDS.includes(k));
  return r;
}

function namesMatch(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (x.length < MIN_PLACE_LEN || y.length < MIN_PLACE_LEN) return false;
  return x.includes(y) || y.includes(x);
}

/** "place", "property_kind" or null. */
function placeMatch(user, criteria) {
  const places = (criteria && Array.isArray(criteria.places)) ? criteria.places : [];
  const kinds = (criteria && Array.isArray(criteria.property_kinds)) ? criteria.property_kinds.map(norm) : [];
  if (places.length === 0 && kinds.length === 0) return null;
  const entries = (Array.isArray(user && user.geography) ? user.geography : [])
    .filter((g) => g && (g.type === "work" || g.type === "property"));
  for (const g of entries) {
    if (g.place && places.some((p) => namesMatch(p, g.place))) return "place";
  }
  for (const g of entries) {
    if (g.type === "property" && g.kind && kinds.includes(norm(g.kind))) return "property_kind";
  }
  return null;
}

/** As-built feature matching, over features and interests (activity skill names). */
function featureMatch(user, features) {
  const interests = (Array.isArray(user && user.skills) ? user.skills : [])
    .filter((s) => s && s.type === "activity")
    .map((s) => s.name || "");
  const text = [...((user && user.features) || []), ...interests].join(" ").toLowerCase();
  return features.some((f) => {
    const term = String(f).toLowerCase().trim();
    if (!term) return false;
    if (text.includes(term)) return true;
    if ((term.includes("pet") || term.includes("animal")) &&
        (text.includes("dog") || text.includes("cat") || text.includes("pet") || text.includes("animal"))) {
      return true;
    }
    return false;
  });
}

/**
 * D for one user: {score, match, bypassDistance}.
 * score is 1.0 or 0.0 (as built); match is "place", "property_kind", "feature" or null;
 * bypassDistance is true only for a place or property-kind match.
 * nowYear is injectable for tests (as built the age uses the current year).
 */
function evaluateDemographics(user, criteria, nowYear = new Date().getFullYear()) {
  const fail = { score: 0.0, match: null, bypassDistance: false };
  if (!criteria) return { score: 1.0, match: null, bypassDistance: false };

  // 1. Age check (as built: current year minus birth year)
  if (user && user.birthDate) {
    const birthYear = parseInt(String(user.birthDate).split("-")[0], 10);
    if (!isNaN(birthYear)) {
      const age = nowYear - birthYear;
      if (criteria.minAge !== undefined && criteria.minAge !== null && age < criteria.minAge) return fail;
      if (criteria.maxAge !== undefined && criteria.maxAge !== null && age > criteria.maxAge) return fail;
    }
  }

  // 2. Employment check (as built)
  if (criteria.employmentStatus && criteria.employmentStatus !== "any") {
    const isEmployed = Array.isArray(user && user.post) && user.post.length > 0;
    if (criteria.employmentStatus === "employed" && !isEmployed) return fail;
    if (criteria.employmentStatus === "unemployed" && isEmployed) return fail;
  }

  // 3. Family status check (as built)
  if (criteria.familyStatus && criteria.familyStatus !== "any") {
    const relations = (user && (user.socialRelations || user["social relations"])) || [];
    const hasType = (types) => relations.some((r) => types.includes(r && r.type ? String(r.type).toLowerCase() : ""));
    if (criteria.familyStatus === "parent" && !hasType(["child", "son", "daughter"])) return fail;
    if (criteria.familyStatus === "grandparent" && !hasType(["grandchild", "grandson", "granddaughter"])) return fail;
  }

  // 4. Places and property kinds: a cause to include
  const pm = placeMatch(user, criteria);
  if (pm) return { score: 1.0, match: pm, bypassDistance: true };

  // 5. Features, over features and interests (as built: pass/fail)
  if (Array.isArray(criteria.features) && criteria.features.length > 0) {
    if (!featureMatch(user, criteria.features)) return fail;
    return { score: 1.0, match: "feature", bypassDistance: false };
  }

  return { score: 1.0, match: null, bypassDistance: false };
}

module.exports = {
  PROPERTY_KINDS,
  sanitizeDemographicRules,
  placeMatch,
  featureMatch,
  evaluateDemographics
};
