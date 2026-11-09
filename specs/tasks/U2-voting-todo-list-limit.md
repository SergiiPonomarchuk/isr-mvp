# SPEC U2: The Voting and ToDo lists show all of a member's issues

Status: DRAFT 2026-11-09, waiting for the author's approval (decisions in section 3).
Branch: u2-list-limit (from main at `14fe1a8`; never main)
Found in: the L1 emulator test (L1 section 7, first finding; CHANGES.md, L1 findings). The cut predates L1.
Roadmap: needed for the D1 guided demo, where the Voting and ToDo lists are part of the cycle on screen ([ROADMAP-demo.md](../ROADMAP-demo.md)). Effort estimate: about half a day.

## 1. Context (verified 2026-11-09 at `14fe1a8`)

Counts are from the emulator, which holds the live data after the L1 migration plus the L1 test changes (83 issues; live has 81). They were computed with the same membership rules as `getRelevantDiscussionIds`: creator, participant, or member of the ad-hoc public.

| Fact | Evidence |
|---|---|
| **One listener feeds the Voting list, the ToDo list, their dashboard cards and badge counts, and the summary strip.** It reads the 30 newest issues (`orderBy("created_at", "desc").limit(30)`), then keeps the member's topics and filters them by status. | `prototype/js/main.js:8724-8754` (L1 section 7 cites the line as it was before L1: `:9003`) |
| The Chat list's listener reads every discussion (no limit). | `main.js:8668` |
| The lists are sorted in the browser by the chosen button (new, important, urgent). So the query's order only decides which 30 issues are looked at. | `main.js:8431, 8565-8583` |
| **On the emulator, 51 of the 77 voting issues (76 open, 1 canceled at voting) and 1 of the 3 ToDo issues (issue 91) are never looked at.** | emulator, 2026-11-09 |
| **Effect on members:** 299 members have at least one voting issue. For 243 of them, at least one is missing from their Voting list; 114 see none of theirs. User 1, who is in every public, has 77 voting issues and sees 26. Cynthia Gray (2372) has one voting issue (16), and it is missing. | emulator, 2026-11-09 |
| **The cut also depends on the type of `created_at`.** `createIssue` writes the issue's `created_at` as a server Timestamp. The discussion, the seeded issues, Start Voting and the deadline run write ISO text. Firestore orders values by type before value, and text sorts after timestamps, so in descending order an issue with a Timestamp sorts after every issue with text. On the emulator one issue (status `open`) has a Timestamp. When a topic moves to voting, `votingIssueFields` overwrites `created_at` with the time voting started (text), so it then sorts among the newest. | `functions/index.js:353, 574`; `functions/lifecycle.js:252`; `main.js:3633`; `functions/deadlines.js:92` |
| All 83 issues have `created_at`, so an `orderBy` without a limit returns all 83. A document without the field would be left out, as in the Chat listener. | emulator, 2026-11-09 |
| **The summary strip shows one number three times.** "Active votes", "Issues" and "To Do" all show `activeIssuesCount`, which is the number of voting issues. | `main.js:7926-7936, 8745, 8749` |

## 2. Requirements

- R1 The issues listener looks at every issue: remove `.limit(30)` at `main.js:8724` and keep `orderBy("created_at", "desc")`. Nothing else in the listener changes.
- R2 (if decision 2 is a) The summary strip shows its own count for each label: "To Do" is the number of the member's ToDo issues; "Issues" is voting plus ToDo.
- R3 (if decision 3 is a) A Node test in `functions/test/` reads `prototype/js/main.js` and fails if the issues listener has a `.limit(`.

## 3. Decisions (author)

1. **How to remove the cut.**
   - **a (recommended): remove the limit.** It is one line and matches the Chat listener. Opening the page reads every issue (83 documents, about 160 KiB on the emulator); after that, a change sends only the changed document. That is fine at the MVP's size, and stage 5 (demo-safe access) revisits reads and rules anyway.
   - b: query only the member's issues by id (`in`, at most 30 ids per query, several listeners). Fewer reads, but more code. The member's set of topics would also be fixed at login, while today it is recomputed on every change, so behaviour changes.
   - c: raise the limit (for example to 200). This hides the problem until the data grows.
2. **The summary strip.**
   - **a (recommended): fix it here (R2).** After R1 its numbers change, and they are the first numbers on the screen. Please confirm that "Issues" means voting plus ToDo, or say what it should count.
   - b: leave it as built and record it as a finding.
3. **A test that keeps the limit from coming back.**
   - **a (recommended): add it (R3).** It is cheap, and the precedent is the L1 test that checks the browser copy of `lifecycle.js`.
   - b: no test.

## 4. Non-goals

- The mixed types of `created_at`, and Start Voting and the deadline run overwriting it: recorded in section 1, not changed (no data or server change).
- Paging or lazy loading of long lists.
- The order of the dashboard cards' three previews: still the query order.
- The UI backlog (Esc closes the whole new-issue window; the geotag button loads all profiles): a later task.
- No server, data or rules change. No deploy by the agent: the author deploys hosting.

## 5. Acceptance criteria

- AC1 Emulator, as Cynthia Gray (2372): her voting issue 16 is in the Voting list, with no data change.
- AC2 Emulator, as user 1 and as user 1543: the Voting and ToDo lists have as many entries as a script finds with the same rules (user 1: 77 voting issues). ToDo issue 91 appears for a member of its public.
- AC3 The Chat list, the sort buttons and the dashboard cards work as before, and their counts follow the longer lists. No new console errors.
- AC4 (with R2) The strip shows the voting count, the ToDo count and their sum.
- AC5 Unit tests and CI green: Node 32 (+1 with R3), Python 48.
- AC6 Live, after the author's hosting deploy: a member whose issue was missing before (for example Cynthia Gray, issue 16) sees it. Read-only check.

## 6. Plan (after approval)

1. R1, plus R2 and R3 as decided, in `prototype/js/main.js` and `functions/test/`.
2. Run the unit tests, then AC1-AC4 on the emulator in the browser (adopted members, no data change).
3. Fill in the status log, CHANGES.md and the README row; open the PR.
4. The author merges and deploys hosting; then AC6.

## 7. Traceability

- Source: L1 section 7, first finding.
- Component: 10 (UI flows; the component file is not written yet).

## 8. Status log

- Spec written 2026-11-09 (agent); waiting for approval.
