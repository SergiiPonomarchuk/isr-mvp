# U9 Member preview counts and member popup

Fix the two live acceptance findings reported by the author. Check returns 25 sample members while Create selects up to 100. Show the projected public size on the Check badge and explicitly label the preview sample. Preserve the existing selection and API sample array. The saved member list must open while optional values/activity/name reads are pending, tolerate failures and stay closed if dismissed during loading.

The detail popup calls a values helper declared inside the create-form scope. Move that existing helper to the shared scope. Preserve its calculation. Render cached member names/IDs and ISR scores immediately, then enrich through the existing reads. Do not introduce new database fetches.

Verify sample/public counts for populations below and above both caps, missing count compatibility, popup opening under stalled reads and dismissal. Preserve main.js CRLF and final CR. Run required suites and browser checks on the emulator or read-only preview. No agent production writes or deploys.

## Status log

- 2026-11-13: Plan recorded from live acceptance. Implemented on the feature branch. Node 100 passed, Python 111 run with two optional skips. Syntax check passed. Browser fixture uses the actual edited detail handler and helper with 100 synthetic cached members, holding database promises pending. All 100 rows opened immediately, dismissal stayed closed after reads resolved, reopening yielded 100 rows and no console errors. This isolates the UI regression. Full deployed app acceptance follows the author's deployment. No paid API calls or production writes. main.js retains CRLF and final lone CR. Sol Medium is sufficient.
