// Task U4: each topic view (Chat, Voting, ToDo) declares its own message state, so no view
// writes an implicit global. Static check on prototype/js/main.js.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(path.join(__dirname, "..", "..", "prototype", "js", "main.js"), "utf8");

function branch(kind, nextKind) {
  const start = main.indexOf(kind === "chat" ? "if (kind === 'chat') {" : `} else if (kind === '${kind}') {`);
  const end = nextKind ? main.indexOf(`} else if (kind === '${nextKind}') {`, start) : main.indexOf("activeDetailListener = () => {", main.indexOf(`} else if (kind === '${kind}') {`));
  assert.ok(start >= 0 && end > start, `${kind} branch not found`);
  return main.slice(start, end);
}

test("every topic view declares currentMessagesRaw before using it", () => {
  for (const [kind, next] of [["chat", "voting"], ["voting", "tasks"], ["tasks", null]]) {
    const src = branch(kind, next);
    const decl = src.indexOf("let currentMessagesRaw = null;");
    const firstUse = src.search(/currentMessagesRaw(?! = null;)/);
    assert.ok(decl >= 0, `${kind}: no declaration`);
    assert.ok(decl <= firstUse, `${kind}: used before it is declared`);
  }
});
