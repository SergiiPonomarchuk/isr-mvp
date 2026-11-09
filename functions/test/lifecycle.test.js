// Task L1: the lifecycle rules (30 % management decisions, deadline outcomes, dates) on the
// shared fixture, and the browser copy.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../lifecycle");

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "tests", "fixtures", "lifecycle_cases.json"), "utf8"));
const close = (a, b) => Math.abs(a - b) < 1e-9;

test("date helpers", () => {
  for (const c of fixture.add_days) assert.equal(L.addDays(...c.args), c.expected, JSON.stringify(c.args));
  for (const c of fixture.add_months) assert.equal(L.addMonths(...c.args), c.expected, JSON.stringify(c.args));
  for (const c of fixture.is_expired) assert.equal(L.isExpired(...c.args), c.expected, JSON.stringify(c.args));
  for (const c of fixture.extend_deadline) assert.equal(L.extendDeadline(...c.args), c.expected, JSON.stringify(c.args));
  for (const c of fixture.chat_deadline) assert.equal(L.chatDeadline(...c.args), c.expected, JSON.stringify(c.args));
  assert.equal(L.daysBetween("2026-12-09", "2026-12-16"), 7);
  assert.throws(() => L.addDays("Ongoing", 1));
});

test("todayIn gives the calendar date in the time zone", () => {
  // 23:30 UTC on 2026-12-09 is already 2026-12-10 in Zurich (UTC+1 in winter).
  assert.equal(L.todayIn("Europe/Zurich", new Date("2026-12-09T23:30:00Z")), "2026-12-10");
  assert.equal(L.todayIn("Europe/Zurich", new Date("2026-12-09T22:30:00Z")), "2026-12-09");
  assert.equal(L.todayIn("UTC", new Date("2026-12-09T23:30:00Z")), "2026-12-09");
});

test("phase of a topic", () => {
  for (const c of fixture.phase_of) assert.equal(L.phaseOf(c.disc, c.issue), c.expected, JSON.stringify(c));
});

test("voting outcome (A1 tally, 30 % of the pool)", () => {
  for (const c of fixture.voting_outcome) {
    const r = L.votingOutcome(c.votes, c.isr, c.options);
    assert.equal(r.result, c.expected.result, c.name);
    assert.equal(r.reason, c.expected.reason, c.name);
    assert.ok(close(r.share, c.expected.share), `${c.name}: share ${r.share}`);
    assert.equal(r.winner, c.expected.winner, c.name);
  }
});

test("management decisions (30 %, order, blocked actions, reactivation)", () => {
  for (const c of fixture.management) {
    const r = L.managementOutcome(c.input);
    assert.equal(r.action, c.expected.action, c.name);
    assert.deepEqual(r.blocked, c.expected.blocked, c.name);
    if (c.expected.buttons) assert.deepEqual(r.buttons, c.expected.buttons, c.name);
  }
  const r = L.managementOutcome({ phase: "voting", votes: { e: "finish_voting", a: "back_to_chat" }, isrByUid: { a: 3, e: 4, b: 3 }, votingResult: "todo" });
  assert.ok(close(r.share.finish_voting, 0.4) && close(r.share.back_to_chat, 0.3));
  assert.equal(r.action, "back_to_chat"); // built order: back to chat is checked before finish voting
});

test("deadline outcome", () => {
  for (const c of fixture.deadline) {
    const r = L.deadlineOutcome(c.topic, c.today);
    assert.equal(r.action, c.expected.action, c.name);
    assert.equal(r.reason, c.expected.reason, c.name);
    assert.equal(r.newEnds, c.expected.newEnds, c.name);
  }
});

test("the issue written when a chat moves to voting keeps the proposed options", () => {
  const disc = { topic: "Bench", creator_uid: "7", options_v2: [{ title: "Paint it", author_uid: "7", budget: "200" }], isr_scores: { "7": 1 } };
  const f = L.votingIssueFields(disc, "2026-12-17", "2026-12-10T00:30:00.000Z");
  assert.equal(f.status, "in_process");
  assert.equal(f.ends, "2026-12-17");
  assert.deepEqual(f.options.map((o) => o.label), ["Paint it"]);
  assert.equal(f.options[0].funding_source, "");
  assert.deepEqual(f.isr_scores, { "7": 1 });
  assert.equal(L.votingIssueFields({}, "2026-12-17", "x").options.length, 0); // no invented options
});

test("prototype/js/lifecycle.js is identical to functions/lifecycle.js (npm run sync:isr)", () => {
  const a = fs.readFileSync(path.join(__dirname, "..", "lifecycle.js"));
  const b = fs.readFileSync(path.join(__dirname, "..", "..", "prototype", "js", "lifecycle.js"));
  assert.ok(a.equals(b), "run `npm run sync:isr` in functions/");
});
