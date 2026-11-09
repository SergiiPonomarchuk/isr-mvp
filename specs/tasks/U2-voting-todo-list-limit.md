# SPEC U2: The Voting and ToDo lists show all of a member's issues

Status: DONE 2026-11-09: merged (PR 10), deployed by the author, AC6 passed on live. APPROVED 2026-11-09 (author: decision 1 b, decision 2 "delete Issues", decision 3 a).
Branch: u2-list-limit (from main at `14fe1a8`; never main)
Found in: the L1 emulator test (L1 section 7, first finding; CHANGES.md, L1 findings). The cut predates L1.
Roadmap: needed for the D1 guided demo, where the Voting and ToDo lists are part of the cycle on screen ([ROADMAP-demo.md](../ROADMAP-demo.md)). Effort estimate: about half a day.

## 1. Context (verified 2026-11-09 at `14fe1a8`)

Counts are from the emulator, which holds the live data after the L1 migration plus the L1 test changes (83 issues; live has 81). They were computed with the same membership rules as `getRelevantDiscussionIds`: creator, participant, or member of the ad-hoc public.

| Fact | Evidence |
|---|---|
| **One listener feeds the Voting list, the ToDo list, their dashboard cards and badge counts, and the summary strip.** It reads the 30 newest issues (`orderBy("created_at", "desc").limit(30)`), then keeps the member's topics and filters them by status. | `prototype/js/main.js:8724-8754` (L1 section 7 cites the line as it was before L1: `:9003`) |
| The Chat list's listener reads every discussion (no limit). On every change of a discussion it recomputes the member's topic ids. | `main.js:8668-8669` |
| The lists are sorted in the browser by the chosen button (new, important, urgent). So the query's order only decides which 30 issues are looked at, and the order of ties and of the dashboard cards' three previews. | `main.js:8431, 8565-8583, 8808-8833` |
| **On the emulator, 51 of the 77 voting issues (76 open, 1 canceled at voting) and 1 of the 3 ToDo issues (issue 91) are never looked at.** | emulator, 2026-11-09 |
| **Effect on members:** 299 members have at least one voting issue. For 243 of them, at least one is missing from their Voting list; 114 see none of theirs. User 1, who is in every public, has 77 voting issues and sees 26. Cynthia Gray (2372) has one voting issue (16), and it is missing. | emulator, 2026-11-09 |
| **The cut also depends on the type of `created_at`.** `createIssue` writes the issue's `created_at` as a server Timestamp. The discussion, the seeded issues, Start Voting and the deadline run write ISO text. Firestore orders values by type before value, and text sorts after timestamps, so in descending order an issue with a Timestamp sorts after every issue with text. On the emulator one issue (status `open`) has a Timestamp. When a topic moves to voting, `votingIssueFields` overwrites `created_at` with the time voting started (text), so it then sorts among the newest. | `functions/index.js:353, 574`; `functions/lifecycle.js:252`; `main.js:3633`; `functions/deadlines.js:92` |
| All 83 issues have `created_at`, so an `orderBy` without a limit returns all 83. A document without the field would be left out, as in the Chat listener. | emulator, 2026-11-09 |
| **The summary strip shows one number three times.** "Active votes", "Issues" and "To Do" all show `activeIssuesCount`, which is the number of voting issues. | `main.js:7926-7936, 8745, 8749` |
| The member's topic ids are read with `in` queries of at most 30 ids (`microcommunities`), which the Firebase JS SDK 10.8.0 used here supports. | `main.js:7883-7885`; `prototype/index.html:659-662` |

## 2. Requirements

- R1 The Voting and ToDo lists read only the member's issues, by document id (`FieldPath.documentId()`, `in`, at most 30 ids per query, one listener per group of ids).
  - The ids are the member's topic ids that the Chat listener computes on every change of a discussion. When the set changes, the issue listeners are replaced and issues that left the set are dropped, so a topic the member joins or creates appears without a reload.
  - The status filters, the caches and everything that renders from them are unchanged.
  - The order of the query before U2 (`created_at` descending in Firestore's order: text before Timestamps, then the document id descending) is kept in the browser, for the dashboard previews and for ties in the list sorts.
- R2 The summary strip has no "Issues" entry (also removed from the static placeholder in `prototype/index.html`). "To Do" shows the number of the member's ToDo issues.
- R3 A Node test in `functions/test/` fails if a query on the issues collection in `prototype/js/main.js` has a `.limit(`, and checks R1's id query and R2.

## 3. Decisions (author, 2026-11-09)

1. **How to remove the cut: b, load only each member's own issues** (author). The options were:
   - a: remove the limit and read every issue;
   - b: query only the member's issues by id;
   - c: raise the limit.

   The drawback noted for b (the set of topics fixed at login) does not apply as built: the ids come from the Chat listener, which recomputes them on every change of a discussion (R1).
2. **The summary strip: delete "Issues"** (author). "To Do" shows the ToDo count, as recommended under 2a.
3. **A test that keeps the limit from coming back: a, yes** (author).

## 4. Non-goals

- The mixed types of `created_at`, and Start Voting and the deadline run overwriting it: recorded in section 1, not changed (no data or server change).
- Paging or lazy loading of long lists.
- The UI backlog (Esc closes the whole new-issue window; the geotag button loads all profiles): a later task.
- No server, data or rules change. No deploy by the agent: the author deploys hosting.

## 5. Acceptance criteria

- AC1 Emulator, as Cynthia Gray (2372): her voting issue 16 is in the Voting list, with no data change.
- AC2 Emulator, as user 1, user 1543 and a member of issue 91's public: the Voting and ToDo lists have as many entries as a script finds with the same rules (user 1: 77 voting issues). ToDo issue 91 appears.
- AC3 The Chat list, the sort buttons and the dashboard cards work as before, and their counts follow the longer lists. A topic the member joins appears without a reload and disappears when they leave. No console errors.
- AC4 The strip shows "Active votes", "To Do" (the ToDo count) and "Discussions", and no "Issues".
- AC5 Unit tests and CI green: Node 35 (3 new), Python 48.
- AC6 Live, after the author's hosting deploy: a member whose issue was missing before (for example Cynthia Gray, issue 16) sees it. Read-only check.

## 6. Plan

1. R1-R3 in `prototype/js/main.js`, `prototype/index.html` and `functions/test/member_issues.test.js`.
2. Run the unit tests, then AC1-AC4 on the emulator in the browser.
3. Fill in the status log, CHANGES.md and the README row; open the PR.
4. The author merges and deploys hosting; then AC6.

## 7. Traceability

- Source: L1 section 7, first finding.
- Component: 10 (UI flows; the component file is not written yet).

## 8. Status log

- Spec written 2026-11-09 (agent). Approved 2026-11-09 with the author's decisions (section 3).
- Implementation: R1-R3 on branch `u2-list-limit`.
  - `main.js`, section "2. Issues Sync": `subscribeMemberIssues`, `applyMemberIssues` and the order helpers replace the listener. The Chat listener calls `subscribeMemberIssues(relevantIds)`.
  - Strip: `todoCount`, and no "Issues" entry. `index.html`: the placeholder entry is removed.
- Tests: Node 35 (3 new in `member_issues.test.js`; the limit check fails on main's `main.js`); Python 48 (1 skipped).
- Emulator (2026-11-09, browser at `127.0.0.1:5000/?emulator=1`, adopted members, the expected counts from a script with the same membership rules):
  - AC1: Cynthia Gray: Voting list [16]. The strip reads "Active votes: 1 · To Do: 0 · Discussions: 1".
  - AC2:
    - User 1: 77 voting issues (77 unique, 16 among them); ToDo `vnQl2LGXvJ8JpsQtfBeV`, 182 and 91.
    - Sara Lara (1543): 3 voting issues and 0 ToDo.
    - Karen Chavez (4185): 3 voting issues; ToDo 182 and 91.
    - Every count equals the script's.
  - AC3:
    - The sort buttons reorder the list (important 12, 58, 187; urgent 187, 12, 58; new 187, 58, 12).
    - User 1's voting card previews are the first three voting issues in Firestore's own `created_at` order (1, 48, 46).
    - Joining and leaving: Sara Lara was added as a participant of discussion 16 on the emulator. Issue 16 appeared in her Voting list without a reload ("Active votes: 4"); after the change was undone it disappeared again ("Active votes: 3").
    - No console errors.
  - AC4: the strip reads, for example, "Active votes: 77 · To Do: 3 · Discussions: 117".
- Testing incident (recorded for transparency): the first browser run opened `127.0.0.1:5000/` without `?emulator=1`, so the page used the live database for two adopted members (2372 and 1).
  - Nothing was pressed, and the new code only reads.
  - The one write the page can make on its own is the Chat list's "self-healing" of missing last-message fields (`main.js:8246-8279`). It only fires for a discussion without `last_message_text` or `last_message_timestamp`. None needed it: the pre-migration backup of 2026-11-07 has all 192 with both fields, `createIssue` writes them for new discussions (`functions/index.js:583-586`), and a read-only count on live afterwards found 0 of 193 missing. So nothing was written.
  - What the live read showed before the switch: Cynthia Gray saw issue 16, and user 1 saw 76 voting issues and the 2 ToDo issues (57, 182). That matches the live counts in the L1 report.
  - The test then continued on the emulator.
- Deviations and clarifications:
  - The member's issue set now follows changes of discussions, not of issues as before. Every phase move writes the discussion too, so the set stays current.
  - The Voting and ToDo lists now depend on the Chat listener: if it fails, they stay empty.
  - User 1 needs 7 id queries (194 topic ids).
  - An issue without `created_at` was left out before U2; it is now shown and sorted last. There are none.
- Live (2026-11-09): merged as PR 10. The author deployed hosting together with U3 and U4; the live files equal main apart from line endings. AC6 (read-only, as Cynthia Gray): the Voting list shows issue 16.
