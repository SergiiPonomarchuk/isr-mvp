// Task U7: the page is not cached for an hour after a deploy. One header rule sends
// Cache-Control: no-cache for every hosting response (the page, rewritten paths, scripts,
// styles, images); the browser revalidates by ETag and gets 304 for an unchanged file.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "firebase.json"), "utf8"));

test("one rule sends Cache-Control: no-cache for every response", () => {
  const rules = (cfg.hosting.headers || []).filter((h) => (h.headers || []).some((x) => x.key.toLowerCase() === "cache-control"));
  assert.equal(rules.length, 1, "exactly one Cache-Control rule");
  assert.equal(rules[0].source, "**");
  assert.deepEqual(rules[0].headers, [{ key: "Cache-Control", value: "no-cache" }]);
});

test("the page is reached through rewrites, so a rule for *.html alone would not cover it", () => {
  const rw = cfg.hosting.rewrites || [];
  assert.ok(rw.some((r) => r.source === "**" && r.destination === "/index.html"));
});
