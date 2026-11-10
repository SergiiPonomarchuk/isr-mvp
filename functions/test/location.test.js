// Task U6 (R1, R2, R7): the issue's point from its description.
// Run: cd functions && npm test
const test = require("node:test");
const assert = require("node:assert/strict");

const L = require("../location");

const HOME = [47.5601, 7.5886];
const WORK = [47.601, 7.618];
const PROP = [47.52, 7.65];
const GEO = [
  { id: 1, type: "work", place: "Argo Industry", geo: WORK },
  { id: 2, type: "home", address: "Linden Street 4", geo: HOME },
  { id: 3, type: "property", geo: PROP },
];
const SENT = [47.553832, 7.606599];

function fakeGeocoder(answer) {
  const calls = [];
  const fn = async (place, home) => { calls.push({ place, home }); return answer; };
  fn.calls = calls;
  return fn;
}

test("normalizeLocationReference keeps the five anchors and a place only for named_place", () => {
  assert.deepEqual(L.normalizeLocationReference({ anchor: "Home", place: "x" }), { anchor: "home", place: "" });
  assert.deepEqual(L.normalizeLocationReference({ anchor: "named_place", place: "  Linden   Street " }), { anchor: "named_place", place: "Linden Street" });
  assert.deepEqual(L.normalizeLocationReference({ anchor: "named_place", place: "" }), { anchor: "none", place: "" });
  assert.deepEqual(L.normalizeLocationReference({ anchor: "city_hall" }), { anchor: "none", place: "" });
  assert.deepEqual(L.normalizeLocationReference(null), { anchor: "none", place: "" });
  assert.equal(L.normalizeLocationReference({ anchor: "named_place", place: "a".repeat(500) }).place.length, 120);
});

test("the keyword fallback finds the anchors from the prompt's words", () => {
  const k = L.keywordLocationReference;
  assert.equal(k("The entrance door of our house does not lock").anchor, "home");
  assert.equal(k("Water in the basement of our building").anchor, "home");
  assert.equal(k("Noise near my home every night").anchor, "home");
  assert.equal(k("The heating at work is broken").anchor, "work");
  assert.equal(k("Our office has no ventilation").anchor, "work");
  assert.equal(k("Someone broke into my garage").anchor, "property");
  assert.deepEqual(k("Potholes on Linden Street after the winter"), { anchor: "named_place", place: "Linden Street" });
  assert.deepEqual(k("Rubbish in Kannenfeld Park"), { anchor: "named_place", place: "Kannenfeld Park" });
  assert.equal(k("The city should publish its budget online").anchor, "none");
});

test("home, work and property use the creator's profile places", async () => {
  const g = fakeGeocoder({ status: "found", point: [1, 2] });
  const r = (anchor) => L.resolveIssueLocation({ reference: { anchor }, geography: GEO, requested: SENT, requestedSource: "auto", geocode: g });
  assert.deepEqual(await r("home"), { location: HOME, source: "home", label: "your home (from the description)", suggested: null });
  assert.equal((await r("work")).source, "work");
  assert.deepEqual((await r("work")).location, WORK);
  assert.deepEqual((await r("property")).location, PROP);
  assert.equal(g.calls.length, 0, "no lookup for profile places");
});

test("a missing work place or property falls back to the home", async () => {
  const onlyHome = [GEO[1]];
  for (const anchor of ["work", "property"]) {
    const out = await L.resolveIssueLocation({ reference: { anchor }, geography: onlyHome, requested: SENT, requestedSource: "auto" });
    assert.equal(out.source, "home_fallback");
    assert.deepEqual(out.location, HOME);
  }
});

test("a named place is looked up near the home; the label credits OpenStreetMap", async () => {
  const g = fakeGeocoder({ status: "found", point: [47.561, 7.59], display_name: "Linden Street, Basel" });
  const out = await L.resolveIssueLocation({ reference: { anchor: "named_place", place: "Linden Street" }, geography: GEO, requested: SENT, requestedSource: "auto", geocode: g });
  assert.equal(out.source, "named_place");
  assert.deepEqual(out.location, [47.561, 7.59]);
  assert.equal(out.label, "Linden Street (© OpenStreetMap contributors)");
  assert.deepEqual(g.calls, [{ place: "Linden Street", home: HOME }]);
});

test("a named place not found, a failed lookup or the switch off fall back to the home", async () => {
  for (const [answer, why] of [
    [{ status: "not_found" }, /not found/],
    [{ status: "error" }, /not found/],
    [{ status: "off" }, /place search is off/],
  ]) {
    const out = await L.resolveIssueLocation({ reference: { anchor: "named_place", place: "Nowhere Lane" }, geography: GEO, requested: SENT, requestedSource: "auto", geocode: fakeGeocoder(answer) });
    assert.equal(out.source, "home_fallback");
    assert.deepEqual(out.location, HOME);
    assert.match(out.label, why);
  }
  const thrown = await L.resolveIssueLocation({ reference: { anchor: "named_place", place: "X Street" }, geography: GEO, requested: SENT, geocode: async () => { throw new Error("boom"); } });
  assert.equal(thrown.source, "home_fallback");
});

test("no place in the description: the creator's home (assumed_home)", async () => {
  const out = await L.resolveIssueLocation({ reference: { anchor: "none" }, geography: GEO, requested: SENT, requestedSource: "auto" });
  assert.equal(out.source, "assumed_home");
  assert.deepEqual(out.location, HOME);
});

test("no home in the profile: the point the browser sent (default)", async () => {
  const out = await L.resolveIssueLocation({ reference: { anchor: "home" }, geography: [GEO[0]], requested: SENT, requestedSource: "auto" });
  assert.equal(out.source, "default");
  assert.deepEqual(out.location, SENT);
});

test("a pin the creator moved wins; the description's point is kept as the suggestion", async () => {
  const moved = [47.57, 7.6];
  const out = await L.resolveIssueLocation({ reference: { anchor: "home" }, geography: GEO, requested: moved, requestedSource: "creator" });
  assert.equal(out.source, "creator");
  assert.deepEqual(out.location, moved);
  assert.equal(out.label, "set by you");
  assert.equal(out.suggested.source, "home");
  assert.deepEqual(out.suggested.location, HOME);
  // "creator" with an invalid point is not trusted
  const bad = await L.resolveIssueLocation({ reference: { anchor: "home" }, geography: GEO, requested: ["x", 1], requestedSource: "creator" });
  assert.equal(bad.source, "home");
});

test("samePoint: within 1 m", () => {
  assert.ok(L.samePoint([47.5, 7.5], [47.5, 7.5]));
  assert.ok(L.samePoint([47.5, 7.5], [47.500005, 7.5])); // about 0.56 m
  assert.ok(!L.samePoint([47.5, 7.5], [47.50002, 7.5])); // about 2.2 m
  assert.ok(!L.samePoint([47.5, 7.5], null));
});
