// Task A3, AC1 and AC4b: G from the nearest anchor; D with places, property kinds and interests.
// The same fixture is used by tests/test_relevance_evaluator.py (Python port).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const geo = require("../geo");
const dem = require("../demographics");

const fixture = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "..", "tests", "fixtures", "a3_d_g_cases.json"), "utf-8"));

test("G: nearest of home, work and property (shared fixture)", () => {
  for (const c of fixture.g_cases) {
    const near = geo.nearestAnchor(c.geography, c.location);
    if (c.expected === null) {
      assert.equal(near, null, c.name);
      assert.equal(geo.nearestAnchorDistance(c.geography, c.location), null, c.name);
      continue;
    }
    assert.equal(near.type, c.expected.type, c.name);
    assert.ok(Math.abs(near.distance - c.expected.distance) < 1e-6, c.name);
    assert.ok(Math.abs(geo.gScore(near.distance, c.mu, c.sigma) - c.expected.g) < 1e-9, c.name);
    assert.equal(geo.withinCutoff(near.distance, c.mu, c.sigma), c.expected.within_cutoff, c.name);
  }
});

test("G formula unchanged against the as-built code", () => {
  const asBuilt = (d, mu, sigma) => (d > mu ? Math.exp(-Math.pow(d - mu, 2) / (2 * Math.pow(sigma, 2))) : 1.0);
  for (let i = 0; i < 20; i++) {
    const d = i * 37.5;
    assert.equal(geo.gScore(d, 100, 50), asBuilt(d, 100, 50));
  }
});

test("geo accepts GeoPoint-like objects", () => {
  const d1 = geo.haversineDistance([47.55, 7.6], [47.56, 7.6]);
  const d2 = geo.haversineDistance({ latitude: 47.55, longitude: 7.6 }, { _latitude: 47.56, _longitude: 7.6 });
  assert.ok(Math.abs(d1 - d2) < 1e-9);
  assert.equal(geo.relevanceAnchors([{ type: "home", geo: [1, "x"] }]).length, 0);
});

test("D: places, property kinds, interests (shared fixture)", () => {
  for (const c of fixture.d_cases) {
    const r = dem.evaluateDemographics(c.user, c.criteria, fixture.now_year);
    assert.equal(r.score, c.expected.score, c.name);
    assert.equal(r.match, c.expected.match, c.name);
    assert.equal(r.bypassDistance, c.expected.bypass, c.name);
  }
});

test("sanitizeDemographicRules keeps short string lists and known kinds", () => {
  const r = dem.sanitizeDemographicRules({
    places: ["  Argo Industry ", 3, "", "x".repeat(500)],
    property_kinds: ["Garage", "castle", "land"],
    features: "car"
  });
  assert.deepEqual(r.places, ["Argo Industry", "x".repeat(120)]);
  assert.deepEqual(r.property_kinds, ["garage", "land"]);
  assert.deepEqual(r.features, []);
});
