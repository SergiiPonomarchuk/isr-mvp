// Task A3, AC2: option content (cost, funding source, resources). prototype/js/options.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const opts = require(path.join(__dirname, "..", "..", "prototype", "js", "options.js"));

test("required fields: title, cost, funding source", () => {
  const r = opts.validateOption({ title: " ", cost: "", funding_source: "" });
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 3);
  const ok = opts.validateOption({ title: "Smart lock", cost: "€1,200", funding_source: "building fund" });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.option, { title: "Smart lock", budget: "€1,200", funding_source: "building fund", resources_needed: [] });
});

test("trims, collapses spaces, drops empty resources and caps lengths", () => {
  const r = opts.validateOption({
    title: "  Smart   lock ", cost: " no cost ", funding_source: "x".repeat(400),
    resources: ["  2 ladders ", "", "   ", "y".repeat(400), ...Array.from({ length: 30 }, (_, i) => "r" + i)]
  });
  assert.equal(r.option.title, "Smart lock");
  assert.equal(r.option.budget, "no cost");
  assert.equal(r.option.funding_source.length, opts.LIMITS.funding_source);
  assert.equal(r.option.resources_needed[0], "2 ladders");
  assert.equal(r.option.resources_needed[1].length, opts.LIMITS.resource);
  assert.equal(r.option.resources_needed.length, opts.LIMITS.resources);
});

test("display escapes text and marks missing fields of old options", () => {
  const html = opts.optionDetailsHtml({ budget: "<b>€5</b>", funding_source: "a & b", resources_needed: ["<x>"] });
  assert.ok(html.includes("&lt;b&gt;€5&lt;/b&gt;"));
  assert.ok(html.includes("a &amp; b"));
  assert.ok(html.includes("&lt;x&gt;"));
  const old = opts.optionDetailsHtml({ budget: "N/A" });
  assert.equal((old.match(/not stated/g) || []).length, 3);
});

test("issue needs: money first, then importance", () => {
  const html = opts.issueNeedsHtml([
    { resource_type: "professional_services", importance_level: "high", explanation: "Locksmith" },
    { resource_type: "money_budget", importance_level: "medium", explanation: "Funds" }
  ]);
  assert.ok(html.indexOf("money budget") < html.indexOf("professional services"));
  assert.ok(opts.issueNeedsHtml(undefined).includes("No analysis"));
});
