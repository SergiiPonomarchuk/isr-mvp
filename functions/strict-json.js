"use strict";
const fail=message=>{throw new Error(message);};
function parse(text) {
  if (typeof text !== "string" || Buffer.byteLength(text) > 262144) fail("Invalid response text");
  const value = JSON.parse(text);
  let at = 0;
  const space = () => { while (/\s/.test(text[at] || "") && at < text.length) at++; };
  function string() {
    const start = at++;
    while (at < text.length) {
      if (text[at] === "\\") { at += 2; continue; }
      if (text[at++] === '"') return JSON.parse(text.slice(start, at));
    }
    fail("Unterminated string");
  }
  function visit(depth = 0) {
    if (depth > 50) fail("Excessive JSON nesting");
    space();
    if (text[at] === '"') { string(); return; }
    if (text[at] === "{") {
      at++; space(); const keys = new Set();
      if (text[at] === "}") { at++; return; }
      while (at < text.length) {
        space(); const key = string();
        if (keys.has(key)) fail("Duplicate JSON key: " + key);
        keys.add(key); space(); at++; visit(depth + 1); space();
        if (text[at++] === "}") return;
      }
    } else if (text[at] === "[") {
      at++; space(); if (text[at] === "]") { at++; return; }
      while (at < text.length) { visit(depth + 1); space(); if (text[at++] === "]") return; }
    } else {
      while (at < text.length && !/[\s,}\]]/.test(text[at])) at++;
    }
  }
  visit();
  return value;
}

module.exports={parse};
