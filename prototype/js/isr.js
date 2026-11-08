/**
 * ISR core: the single source of the ISR arithmetic (task A1 v2, roadmap stage 2).
 *
 * Used by the Cloud Functions (require("./isr")), by the browser (prototype/js/isr.js is a
 * byte-identical copy made with `npm run sync:isr`; window.ISR) and, through the Python port
 * scripts/isr_core.py, by the scripts. Both are checked against tests/fixtures/isr_cases.json.
 *
 * Pure functions only: no Firebase, no network.
 *
 *   R   = w_D·D + w_G·G + w_S·S + w_X·X                          (03, v1 R1)
 *   E   = max(min(age, 30)/30, Σ education cos^(CBC·adj)·P) + Σ experience cos·P   (PD-8)
 *   x̂   = x / mean over the members of the public                 (PD-3; v1 R3 for edge cases)
 *   Ĉ   = 1.0 for everyone until Contribution exists ("constant") (decision 2)
 *   ISR = w_R·R̂ + w_E·Ê + w_C·Ĉ
 *   option score = Σ ISR of the voters who chose it; voters without an ISR are excluded;
 *   a tie or no counted votes gives no winner                    (decisions 3, 4)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ISR = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var AGE_FLOOR_FULL = 30;

  // ------------------------------------------------------------------ relevance

  function relevance(c, w, clamp) {
    var r = num(w.w_D) * num(c.D) + num(w.w_G) * num(c.G) + num(w.w_S) * num(c.S) + num(w.w_X) * num(c.X);
    return clamp ? Math.max(0, Math.min(1, r)) : r;
  }

  // ------------------------------------------------------------------ expertise

  /** Completed years between a "YYYY-MM-DD" birth date and a Date (or ISO string). */
  function ageInYears(birthDate, onDate) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthDate || "").trim());
    if (!m) throw new Error("birthDate must be a 'YYYY-MM-DD' string");
    var y = +m[1], mo = +m[2], d = +m[3];
    var oy, om, od;
    var sm = typeof onDate === "string" ? /^(\d{4})-(\d{2})-(\d{2})/.exec(onDate.trim()) : null;
    if (sm) {  // an ISO string: use its calendar date, as the Python port does
      oy = +sm[1]; om = +sm[2]; od = +sm[3];
    } else {
      var on = onDate && typeof onDate.toDate === "function" ? onDate.toDate() : onDate;
      if (!(on instanceof Date) || isNaN(on.getTime())) throw new Error("registration date missing or not a date");
      oy = on.getUTCFullYear(); om = on.getUTCMonth() + 1; od = on.getUTCDate();
    }
    if (oy < y || (oy === y && (om < mo || (om === mo && od < d)))) throw new Error("registration date is before birthDate");
    return oy - y - ((om < mo || (om === mo && od < d)) ? 1 : 0);
  }

  function ageFloor(age) {
    if (!(age >= 0)) throw new Error("age must be >= 0");
    return Math.min(age, AGE_FLOOR_FULL) / AGE_FLOOR_FULL;
  }

  function educationPart(eduSum, age) { return Math.max(ageFloor(age), eduSum); }

  function expertise(eduSum, expSum, age) { return educationPart(eduSum, age) + expSum; }

  /** (CBC, education time in years), as scripts/expertise.py education_params. */
  function educationParams(level) {
    var lvl = String(level || "").toLowerCase();
    if (lvl.indexOf("phd") >= 0) return [0.5, 10.0];
    if (lvl.indexOf("master") >= 0) return [0.8, 6.0];
    if (lvl.indexOf("bachelor") >= 0) return [1.0, 4.0];
    if (lvl.indexOf("college") >= 0) return [1.5, 3.0];
    if (lvl.indexOf("vocational") >= 0 || lvl.indexOf("training") >= 0) return [2.0, 2.0];
    return [1.0, 4.0];
  }

  function toArray(v) {
    if (!v) return null;
    if (Array.isArray(v)) return v;
    if (typeof v.toArray === "function") return v.toArray();
    if (Array.isArray(v._values)) return v._values;
    if (Array.isArray(v.values)) return v.values;
    return null;
  }

  function cosine(a, b) {
    a = toArray(a); b = toArray(b);
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;
    var dot = 0, na = 0, nb = 0;
    for (var i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  /** Σ over education skills of cos^(CBC·adj) · P (cos clipped at 0). */
  function educationSum(skills, vectorsBySkillId, issueVector, cbcAdjustment) {
    var adj = cbcAdjustment === undefined || cbcAdjustment === null ? 1.0 : num(cbcAdjustment);
    var total = 0;
    if (!toArray(issueVector)) return 0;
    (skills || []).forEach(function (s) {
      if (!s || s.type !== "education") return;
      var vec = vectorsBySkillId ? vectorsBySkillId[String(s.id)] : null;
      if (!vec) return;
      var cos = Math.max(0, cosine(vec, issueVector));
      var p = educationParams(s.educationLevel);
      total += Math.pow(cos, p[0] * adj) * p[1];
    });
    return total;
  }

  /** Σ over work-experience skills of cos · years (as built: no recency decay). */
  function experienceSum(skills, vectorsBySkillId, issueVector) {
    var total = 0;
    if (!toArray(issueVector)) return 0;
    (skills || []).forEach(function (s) {
      if (!s || s.type !== "work experience") return;
      var vec = vectorsBySkillId ? vectorsBySkillId[String(s.id)] : null;
      if (!vec) return;
      var cos = Math.max(0, cosine(vec, issueVector));
      var years = parseFloat(s.time);
      total += cos * (isFinite(years) ? years : 1.0);
    });
    return total;
  }

  // ------------------------------------------------------------------ aggregation

  /** x / mean. All equal (also all zero) -> 1.0 each. Mean <= 0 with unequal values -> error. */
  function normalizeByMean(values) {
    if (!values.length) return [];
    var first = values[0];
    if (values.every(function (v) { return v === first; })) return values.map(function () { return 1.0; });
    var mean = values.reduce(function (s, v) { return s + v; }, 0) / values.length;
    if (!(mean > 0)) throw new Error("mean <= 0 with unequal values: no normalisation rule (PD-3)");
    return values.map(function (v) { return v / mean; });
  }

  function contributionPlaceholder() { return { value: 1.0, source: "constant" }; }

  /**
   * members: [{uid, R, E}]; weights: {w_relevance, w_expertise, w_contribution}.
   * Returns [{uid, R, E, R_norm, E_norm, C_norm, contribution_source, isr}] in the same order.
   */
  function isrForPublic(members, weights) {
    var rn = normalizeByMean(members.map(function (m) { return num(m.R); }));
    var en = normalizeByMean(members.map(function (m) { return num(m.E); }));
    var c = contributionPlaceholder();
    var wR = num(weights.w_relevance), wE = num(weights.w_expertise), wC = num(weights.w_contribution);
    return members.map(function (m, i) {
      return {
        uid: m.uid, R: num(m.R), E: num(m.E),
        R_norm: rn[i], E_norm: en[i], C_norm: c.value, contribution_source: c.source,
        isr: wR * rn[i] + wE * en[i] + wC * c.value
      };
    });
  }

  /**
   * votes: {uid: optionIndex}; isrByUid: {uid: isr}; optionCount: number of options.
   * Returns {scores, counted: [{uid, option, weight}], excluded: [{uid, reason}], winner, note}.
   */
  function tally(votes, isrByUid, optionCount) {
    var scores = [];
    for (var i = 0; i < optionCount; i++) scores.push(0);
    var counted = [], excluded = [];
    Object.keys(votes || {}).sort().forEach(function (uid) {
      var opt = Number(votes[uid]);
      var w = isrByUid ? isrByUid[uid] : undefined;
      if (!(opt >= 0 && opt < optionCount && opt === Math.floor(opt))) { excluded.push({ uid: uid, reason: "invalid option" }); return; }
      if (w === undefined || w === null || !isFinite(Number(w))) { excluded.push({ uid: uid, reason: "no ISR" }); return; }
      scores[opt] += Number(w);
      counted.push({ uid: uid, option: opt, weight: Number(w) });
    });
    var winner = null, note = "";
    if (counted.length === 0) {
      note = "no counted votes";
    } else {
      var best = Math.max.apply(null, scores);
      var top = [];
      scores.forEach(function (s, idx) { if (Math.abs(s - best) < 1e-9) top.push(idx); });
      if (top.length === 1) winner = top[0];
      else note = "tie between options " + top.join(", ");
    }
    return { scores: scores, counted: counted, excluded: excluded, winner: winner, note: note };
  }

  function num(v) { var x = Number(v); return isFinite(x) ? x : 0; }

  return {
    AGE_FLOOR_FULL: AGE_FLOOR_FULL,
    relevance: relevance,
    ageInYears: ageInYears,
    ageFloor: ageFloor,
    educationPart: educationPart,
    expertise: expertise,
    educationParams: educationParams,
    cosine: cosine,
    educationSum: educationSum,
    experienceSum: experienceSum,
    normalizeByMean: normalizeByMean,
    contributionPlaceholder: contributionPlaceholder,
    isrForPublic: isrForPublic,
    tally: tally
  };
}));
