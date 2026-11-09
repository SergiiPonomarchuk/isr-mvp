// Task U3: sort buttons for an issue's messages (date, ISR, R, E), the authors' values, and the
// order of the summary strip and the dashboard cards. The comparator is taken from
// prototype/js/main.js and run here; the rest are static checks on the browser code.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const proto = path.join(__dirname, "..", "..", "prototype");
const main = fs.readFileSync(path.join(proto, "js", "main.js"), "utf8");
const html = fs.readFileSync(path.join(proto, "index.html"), "utf8");

function extractFunction(src, name) {
  const start = src.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} not found`);
  let depth = 0;
  for (let i = src.indexOf("{", start); i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`${name}: unbalanced braces`);
}
// eslint-disable-next-line no-new-func
const compare = new Function(`${extractFunction(main, "compareMessageItems")}; return compareMessageItems;`)();

// Messages in date order (idx 0 = oldest). Author values: a {isr 2, r .5, e 1}, b {isr 1, r .9, e 1},
// c {isr 2, r .1, e 3}, d none (no member values).
const S = { a: { isr: 2, r: 0.5, e: 1 }, b: { isr: 1, r: 0.9, e: 1 }, c: { isr: 2, r: 0.1, e: 3 }, d: null };
const msgs = [["a", 0], ["b", 1], ["d", 2], ["c", 3], ["b", 4]].map(([who, idx]) => ({ who, idx, s: S[who] }));
const order = (key, reversed) => msgs.slice().sort((x, y) => compare(x, y, key, reversed)).map((m) => `${m.who}${m.idx}`).join(" ");

test("date: newest first; pressed again: oldest first", () => {
  assert.equal(order("date", false), "b4 c3 d2 b1 a0");
  assert.equal(order("date", true), "a0 b1 d2 c3 b4");
});

test("ISR, R, E: highest first, ties newest first, no value last; pressed again: lowest first", () => {
  assert.equal(order("isr", false), "c3 a0 b4 b1 d2");
  assert.equal(order("isr", true), "b4 b1 c3 a0 d2");
  assert.equal(order("r", false), "b4 b1 a0 c3 d2");
  assert.equal(order("e", false), "c3 b4 b1 a0 d2");
  assert.equal(order("e", true), "b4 b1 a0 c3 d2");
});

test("the three topic views show the sort buttons and load the authors' values", () => {
  assert.equal((main.match(/renderMessageSortButtons\(\) \+/g) || []).length, 3);
  assert.equal((main.match(/await loadMessageAuthorScores\(db, topicId, /g) || []).length, 3);
  assert.match(main, /return sortMessagesForDisplay\(messages\)\.map\(/);
  assert.match(main, /var messageSort = \{ key: 'date', reversed: false \};/);
  assert.match(main, /'\*' \+ fmt\(s && s\.isr\) \+ ' R ' \+ fmt\(s && s\.r, true\) \+ ' E ' \+ fmt\(s && s\.e\)/);
});

test("summary strip and dashboard cards: Chat, Voting, To Do", () => {
  const strip = main.slice(main.indexOf("summaryStrip.innerHTML"), main.indexOf("summaryStrip.innerHTML") + 700);
  const pos = (s, k) => s.indexOf(`data-section="${k}"`);
  assert.ok(pos(strip, "chat") < pos(strip, "voting") && pos(strip, "voting") < pos(strip, "tasks"), "strip order");
  const grid = html.slice(html.indexOf("dashboard-grid-primary"));
  assert.ok(pos(grid, "chat") < pos(grid, "voting") && pos(grid, "voting") < pos(grid, "tasks"), "card order");
  const placeholder = html.slice(html.indexOf('<div class="summary-strip">'), html.indexOf('<div class="summary-strip">') + 600);
  assert.ok(pos(placeholder, "chat") < pos(placeholder, "voting") && pos(placeholder, "voting") < pos(placeholder, "tasks"), "placeholder order");
});
