// Task U6 (R3, R7): the server's place lookup follows the Nominatim usage policy.
// Run: cd functions && npm test. No network: fetch, the store and the clock are fakes.
const test = require("node:test");
const assert = require("node:assert/strict");

const G = require("../geocode");

const HOME = [47.5601, 7.5886];

function fakeClock(start = Date.parse("2026-11-10T12:00:00Z")) {
  let t = start;
  return {
    now: () => t,
    sleep: async (ms) => { t += ms; },
    advance: (ms) => { t += ms; },
  };
}

function fakeStore({ enabled, cache } = {}) {
  const data = new Map(Object.entries(cache || {}));
  const s = {
    switchReads: 0,
    puts: [],
    async getSwitch() { s.switchReads += 1; return enabled; },
    async getCache(key) { return data.get(key) || null; },
    async putCache(key, entry) { s.puts.push({ key, entry }); data.set(key, entry); },
  };
  return s;
}

function fakeFetch(clock, answer = [{ lat: "47.561", lon: "7.59", display_name: "Linden Street, Basel" }], { ok = true, status = 200, fail = false } = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init, at: clock.now() });
    if (fail) throw new Error("network down");
    return { ok, status, json: async () => answer };
  };
  fn.calls = calls;
  return fn;
}

test("the request: the place name only, one result, bounded to a box of about ±0.3° around the home", () => {
  const box = G.boxAround(HOME);
  assert.deepEqual(box, [7.3, 47.9, 7.9, 47.3]);
  const url = new URL(G.buildUrl("Linden Street", box));
  assert.equal(url.origin + url.pathname, "https://nominatim.openstreetmap.org/search");
  assert.equal(url.searchParams.get("q"), "Linden Street");
  assert.equal(url.searchParams.get("format"), "jsonv2");
  assert.equal(url.searchParams.get("limit"), "1");
  assert.equal(url.searchParams.get("bounded"), "1");
  assert.equal(url.searchParams.get("viewbox"), "7.3,47.9,7.9,47.3");
  assert.deepEqual([...url.searchParams.keys()].sort(), ["accept-language", "bounded", "format", "limit", "q", "viewbox"]);
});

test("the User-Agent identifies the app and holds no personal data", async () => {
  assert.match(G.USER_AGENT, /^ISR-MVP\/\d+\.\d+ \(\+https:\/\/[\w.-]+\.web\.app\)$/);
  assert.ok(!G.USER_AGENT.includes("@"));
  const clock = fakeClock();
  const f = fakeFetch(clock);
  await G.createGeocoder({ fetchFn: f, store: fakeStore(), now: clock.now, sleep: clock.sleep }).geocode("Linden Street", HOME);
  assert.equal(f.calls[0].init.headers["User-Agent"], G.USER_AGENT);
});

test("found and not found are cached; a cache hit sends nothing", async () => {
  const clock = fakeClock();
  const store = fakeStore();
  const f = fakeFetch(clock);
  const g = G.createGeocoder({ fetchFn: f, store, now: clock.now, sleep: clock.sleep });
  const a = await g.geocode("Linden Street", HOME);
  assert.deepEqual(a, { cached: false, status: "found", point: [47.561, 7.59], display_name: "Linden Street, Basel" });
  const b = await g.geocode("  linden   STREET ", HOME); // same normalised name, same box
  assert.equal(b.cached, true);
  assert.deepEqual(b.point, [47.561, 7.59]);
  assert.equal(f.calls.length, 1);
  assert.equal(store.puts.length, 1);
  assert.equal(store.puts[0].entry.name, "linden street");

  const none = fakeFetch(clock, []);
  const g2 = G.createGeocoder({ fetchFn: none, store, now: clock.now, sleep: clock.sleep });
  assert.equal((await g2.geocode("Nowhere Lane", HOME)).status, "not_found");
  assert.equal((await g2.geocode("Nowhere Lane", HOME)).cached, true);
  assert.equal(none.calls.length, 1);
});

test("an answer older than 30 days is looked up again", async () => {
  const clock = fakeClock();
  const box = G.boxAround(HOME);
  const old = new Date(clock.now() - 31 * 24 * 3600 * 1000).toISOString();
  const store = fakeStore({ cache: { [G.cacheKey("Linden Street", box)]: { status: "found", point: [1, 2], at: old } } });
  const f = fakeFetch(clock);
  const out = await G.createGeocoder({ fetchFn: f, store, now: clock.now, sleep: clock.sleep }).geocode("Linden Street", HOME);
  assert.equal(f.calls.length, 1);
  assert.deepEqual(out.point, [47.561, 7.59]);
});

test("at most one request a second: two lookups at once are 1 s apart", async () => {
  const clock = fakeClock();
  const f = fakeFetch(clock);
  const g = G.createGeocoder({ fetchFn: f, store: fakeStore(), now: clock.now, sleep: clock.sleep });
  await Promise.all([g.geocode("Linden Street", HOME), g.geocode("Market Square", HOME), g.geocode("Rhine Bridge", HOME)]);
  assert.equal(f.calls.length, 3);
  assert.ok(f.calls[1].at - f.calls[0].at >= 1000);
  assert.ok(f.calls[2].at - f.calls[1].at >= 1000);
});

test("the switch: off sends nothing; a missing document counts as on; read at most once a minute", async () => {
  const clock = fakeClock();
  const f = fakeFetch(clock);
  const off = fakeStore({ enabled: false });
  const g = G.createGeocoder({ fetchFn: f, store: off, now: clock.now, sleep: clock.sleep });
  assert.deepEqual(await g.geocode("Linden Street", HOME), { status: "off" });
  assert.deepEqual(await g.geocode("Market Square", HOME), { status: "off" });
  assert.equal(f.calls.length, 0);
  assert.equal(off.switchReads, 1, "cached for a minute");
  clock.advance(61 * 1000);
  await g.geocode("Linden Street", HOME);
  assert.equal(off.switchReads, 2);

  const missing = fakeStore({ enabled: undefined });
  const g2 = G.createGeocoder({ fetchFn: f, store: missing, now: clock.now, sleep: clock.sleep });
  assert.equal((await g2.geocode("Linden Street", HOME)).status, "found");
});

test("a failure (HTTP error, 429, network) is not cached and counts as not found for that Check", async () => {
  for (const opts of [{ ok: false, status: 500 }, { ok: false, status: 429 }, { fail: true }]) {
    const clock = fakeClock();
    const store = fakeStore();
    const f = fakeFetch(clock, [], opts);
    const out = await G.createGeocoder({ fetchFn: f, store, now: clock.now, sleep: clock.sleep }).geocode("Linden Street", HOME);
    assert.equal(out.status, "error");
    assert.equal(store.puts.length, 0);
  }
});

test("an empty name or a missing home sends nothing", async () => {
  const clock = fakeClock();
  const f = fakeFetch(clock);
  const g = G.createGeocoder({ fetchFn: f, store: fakeStore(), now: clock.now, sleep: clock.sleep });
  assert.equal((await g.geocode("   ", HOME)).status, "not_found");
  assert.equal((await g.geocode("Linden Street", null)).status, "not_found");
  assert.equal(f.calls.length, 0);
});
