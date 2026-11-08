// Task A1 v2: the shared ISR module agrees with the Python port (shared fixture), handles the
// edge cases, and the browser copy is identical. Run: cd functions && npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ISR = require("../isr");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "tests", "fixtures", "isr_cases.json"), "utf-8"));
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-12, `${msg}: ${a} vs ${b}`);

test("relevance (shared fixture)", () => {
  for (const c of fx.relevance) near(ISR.relevance(c.c, c.w, c.clamp), c.expected, "relevance");
});

test("age at registration (shared fixture)", () => {
  for (const c of fx.age) assert.equal(ISR.ageInYears(c.birthDate, c.on), c.expected, `${c.birthDate} ${c.on}`);
  for (const c of fx.age_errors) assert.throws(() => ISR.ageInYears(c.birthDate, c.on));
  assert.equal(ISR.ageInYears("1990-06-15", new Date(Date.UTC(2025, 5, 15, 12))), 35);
});

test("expertise and the age floor (shared fixture)", () => {
  for (const c of fx.expertise) near(ISR.expertise(c.edu, c.exp, c.age), c.expected, "E");
  near(ISR.ageFloor(15), 0.5, "floor 15");
  near(ISR.ageFloor(80), 1.0, "floor 80");
});

test("education and experience sums from vectors (shared fixture)", () => {
  for (const c of fx.sums) {
    near(ISR.educationSum(c.skills, c.vectors, c.issue, c.adj), c.edu, `edu adj ${c.adj}`);
    near(ISR.experienceSum(c.skills, c.vectors, c.issue), c.exp, "exp");
  }
});

test("normalisation by the mean (shared fixture and edge cases)", () => {
  for (const c of fx.normalize) {
    const got = ISR.normalizeByMean(c.values);
    c.expected.forEach((e, i) => near(got[i], e, `norm ${c.values}`));
  }
  for (const c of fx.normalize_errors) assert.throws(() => ISR.normalizeByMean(c.values));
  assert.deepEqual(ISR.normalizeByMean([]), []);
});

test("member ISR for a public (shared fixture) and scale invariance", () => {
  for (const c of fx.isr_for_public) {
    const got = ISR.isrForPublic(c.members, c.weights);
    c.expected.forEach((e, i) => {
      for (const k of ["R_norm", "E_norm", "C_norm", "isr"]) near(got[i][k], e[k], k);
      assert.equal(got[i].contribution_source, "constant");
    });
    const scaled = ISR.isrForPublic(c.members.map((m) => Object.assign({}, m, { R: m.R * 7 })), c.weights);
    scaled.forEach((s, i) => near(s.isr, got[i].isr, "scale invariance"));
  }
});

test("tally (shared fixture): counted, excluded, winner, tie, no votes", () => {
  for (const c of fx.tally) {
    const got = ISR.tally(c.votes, c.isr, c.n);
    c.expected.scores.forEach((s, i) => near(got.scores[i], s, "score"));
    assert.equal(got.winner, c.expected.winner);
    assert.equal(got.note, c.expected.note);
    assert.deepEqual(got.excluded, c.expected.excluded);
    assert.deepEqual(got.counted.map((x) => x.uid), c.expected.counted.map((x) => x.uid));
  }
});

test("the browser copy is identical to functions/isr.js (run `npm run sync:isr` after editing)", () => {
  const src = fs.readFileSync(path.join(__dirname, "..", "isr.js"));
  const copy = fs.readFileSync(path.join(__dirname, "..", "..", "prototype", "js", "isr.js"));
  assert.ok(src.equals(copy), "prototype/js/isr.js differs from functions/isr.js");
});
