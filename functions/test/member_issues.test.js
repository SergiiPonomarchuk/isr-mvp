// Task U2: the Voting and ToDo lists read the member's issues by id, not the newest N issues of
// the whole collection. Static checks on the browser code (prototype/js/main.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(path.join(__dirname, "..", "..", "prototype", "js", "main.js"), "utf8");

// Every query on the issues collection, from `collection("issues")` to the call that runs it.
function issueQueries(src) {
  const out = [];
  const re = /collection\(\s*["']issues["']\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const rest = src.slice(m.index);
    const end = rest.search(/\.(onSnapshot|get)\(/);
    out.push(end >= 0 ? rest.slice(0, end) : rest.slice(0, 300));
  }
  return out;
}

test("no query on the issues collection has a limit", () => {
  const queries = issueQueries(main);
  assert.ok(queries.length > 0);
  for (const q of queries) assert.ok(!/\.limit\(/.test(q), `limit found in: ${q.replace(/\s+/g, " ")}`);
});

test("the member's issues are read by document id, at most 30 ids per query", () => {
  assert.match(main, /const MEMBER_ISSUE_CHUNK = 30;/);
  assert.match(main, /collection\("issues"\)\s*\.where\(firebase\.firestore\.FieldPath\.documentId\(\), "in", chunk\)/);
  assert.match(main, /subscribeMemberIssues\(relevantIds\)/);
});

test("the summary strip has no Issues entry and To Do shows the ToDo count", () => {
  assert.ok(!/<span>Issues: /.test(main));
  assert.match(main, /To Do: \$\{todoCount\}/);
});
