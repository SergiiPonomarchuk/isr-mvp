# SPEC U1: Fixes from the R0 live smoke test

Status: DONE 2026-11-08 (merged #5, deployed, verified on live by the author)
Branch: ui-smoke-fixes (from main; never main)
Found in: R0 runbook step 8 (live smoke test, 2026-11-08). Both bugs predate A2/A3/R0.

## 1. Context

| Finding | Cause | Evidence |
|---|---|---|
| In Voting, after pressing **Vote** the totals do not change; reopening the issue shows the vote. Re-voting behaves the same. | The live listeners of the voting view (and of a second detail view) call `ensureTopicLocation(...)`, which is defined inside `initRealTimeDashboardSync` and is not visible there. Every change of the issue or discussion throws `ReferenceError: ensureTopicLocation is not defined` before the view is redrawn; only new chat messages (whose listener does not call it) redraw the view. Present since commit `7393cfc`. | `prototype/js/main.js:4629, 4638, 4932, 4940` (calls), `:8352` (definition); browser console on the emulator |
| Every name appears twice in the step-owner list of "Propose option" (and of the task step assignment). | `participants[]` holds each user id twice, as text and as a number (known data defect, `claude_export/MANIFEST.md` l.57). | `prototype/js/main.js:2900, 7752` |

Also found (not changed here, recorded for the paper): when an issue has no stored location, `ensureTopicLocation` invents one for display: a point near Basel and μ/σ values derived from a hash of the title (`main.js:8352-8369`). This affects the 112 seeded publics without a location.

## 2. Requirements

- R1 Move `ensureTopicLocation` to the top level of `main.js` (no logic change), so that every view can call it.
- R2 The two participant dropdowns list each user once (deduplicated by the id as text, first occurrence kept).

## 3. Non-goals

- The fabricated display location (§1, last paragraph): unchanged.
- Esc closing the whole new-issue window, and the geotag button loading all profiles in the browser: next UI task.
- No server, data or rules change; no deploy by the agent (the author deploys hosting).

## 4. Acceptance criteria

- AC1 Emulator: open a voting issue, vote, change the vote; the totals and the selected option update without reopening; no `ensureTopicLocation` error in the console.
- AC2 Emulator: the step-owner list in "Propose option" shows each name once.
- AC3 Unit tests and CI green.

## 5. Status log

- Implementation: R1, R2 done on branch `ui-smoke-fixes`.
- Tests: emulator AC1 (vote 5.35/0.00 → 4.08/1.27 → 5.35/0.00 without reopening, selection follows), AC2 (26 entries, 26 unique), no `ensureTopicLocation` error. Note: the browser kept the old `main.js` in its cache even on a hard reload; the test used a separate origin (`127.0.0.1`). After the deploy, users may need Ctrl+F5 or up to an hour for the cache.
- Pull request: #5, merged (`0d51279`). Deploy (author): hosting released 2026-11-08 17:06; the agent checked that the live `main.js` holds both fixes and that `scratch/` is no longer published. Verified on live (author): voting updates immediately; each name once.
