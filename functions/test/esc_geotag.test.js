// Task U5: one Esc press closes only the topmost window (prototype/js/esc-order.js, used by
// prototype/js/main.js); a new-issue form with content asks first; the geotag button no longer
// downloads every profile; scripts and styles are served with Cache-Control: no-cache.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PROTO = path.join(__dirname, "..", "..", "prototype");
const { escAction, ORDER } = require(path.join(PROTO, "js", "esc-order.js"));
const main = fs.readFileSync(path.join(PROTO, "js", "main.js"), "utf8");

test("Esc closes the topmost open window only, in stacking order", () => {
  assert.deepEqual(ORDER, ["geoMap", "tour", "values", "login", "proposal", "section"]);
  // the geotag map over the new-issue form: only the map
  assert.deepEqual(escAction({ geoMap: true, section: true, createFormHasContent: true }), { action: "close", window: "geoMap" });
  // an option or Deadline window over a topic: only that window
  assert.deepEqual(escAction({ proposal: true, section: true }), { action: "close", window: "proposal" });
  assert.deepEqual(escAction({ values: true, proposal: true, section: true }), { action: "close", window: "values" });
  assert.deepEqual(escAction({ login: true, section: true }), { action: "close", window: "login" });
  assert.deepEqual(escAction({ section: true }), { action: "close", window: "section" });
  // the tour closes itself
  assert.deepEqual(escAction({ tour: true, section: true }), { action: "none" });
  assert.deepEqual(escAction({}), { action: "none" });
});

test("a new-issue form with content asks before it is discarded", () => {
  assert.deepEqual(escAction({ section: true, createFormHasContent: true }), { action: "confirm-discard" });
  assert.match(main, /window\.confirm\('Discard this new issue\?'\)/);
  const f = main.slice(main.indexOf("function createFormHasContent"), main.indexOf("function createFormHasContent") + 700);
  for (const sel of ["'chat-create'", ".topic-new-title-input", ".topic-form-textarea", "#create-results-members-block"]) {
    assert.ok(f.includes(sel), `createFormHasContent checks ${sel}`);
  }
});

test("one page-wide Esc handler; the values window has no second one", () => {
  const escHandlers = main.match(/e\.key === 'Escape'|e\.key !== 'Escape'/g) || [];
  // the page handler and the tour's own handler
  assert.equal(escHandlers.length, 2, escHandlers.join(", "));
  assert.match(main, /window\.EscOrder\.escAction\(open\)/);
  const html = fs.readFileSync(path.join(PROTO, "index.html"), "utf8");
  assert.ok(html.indexOf('src="js/esc-order.js"') > 0 && html.indexOf('src="js/esc-order.js"') < html.indexOf('src="js/main.js"'),
    "esc-order.js is loaded before main.js");
});

test("the geotag button downloads no profiles", () => {
  assert.ok(!main.includes('db.collection("users").get()'), "no read of the whole users collection");
  const start = main.indexOf("geoBtn.addEventListener('click'");
  const handler = main.slice(start, main.indexOf("// Microcommunity click listener", start));
  assert.ok(start > 0 && handler.length > 0);
  assert.ok(!/collection\("users"\)/.test(handler), "the click handler reads no users");
  assert.ok(!/Nearest:/.test(handler), "no nearest-distance text");
  assert.ok(!/setTimeout/.test(handler), "the map opens at once");
  assert.match(handler, /initInteractiveMap\(\);/);
});

test("hosting: scripts and styles are served with Cache-Control: no-cache", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "firebase.json"), "utf8"));
  const rule = (cfg.hosting.headers || []).find((h) => h.source === "**/*.@(js|css)");
  assert.ok(rule, "a header rule for js and css");
  assert.deepEqual(rule.headers, [{ key: "Cache-Control", value: "no-cache" }]);
});
