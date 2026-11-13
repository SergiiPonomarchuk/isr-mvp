const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../prototype/js/main.js'), 'utf8');

test('Check badge uses the capped public size while retaining the sample', () => {
  const code = source.match(/  function checkedPublicSize\(data\) \{[\s\S]+?\r?\n  \}/)[0];
  const size = vm.runInNewContext(code + '; checkedPublicSize');
  for (const [input, expected] of [
    [{public_members_count: 100, members: Array(25)}, 100],
    [{public_members_count: 12, members: Array(12)}, 12],
    [{public_members_count: 0, members: []}, 0],
    [{members_count: 1000, members: Array(25)}, 100],
    [{members_count: 30, members: Array(25)}, 30],
    [{members: Array(25)}, 25],
    [{public_members_count: -1, members: Array(3)}, 3],
    [{public_members_count: '100', members: Array(3)}, 3]
  ]) assert.equal(size(input), expected);
});

test('Shared values helper works outside the create-form scope', async () => {
  const start = source.indexOf('  async function calculateMicrocommunityValuesFromMembers(');
  const end = source.indexOf('  function checkedPublicSize(', start);
  assert.ok(start > 0 && end > start);
  assert.ok(start < source.indexOf('  function renderChatCreateView('));
  const helper = vm.runInNewContext(source.slice(start, end) +
    '; calculateMicrocommunityValuesFromMembers', {window: {}, console});
  const result = await helper([{uid: '2', relevance: 0.5}]);
  assert.equal(result.domains.length, 10);
  assert.ok(result.items);
});
