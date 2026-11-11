# SPEC L1: deadlines and the public's management decisions

Status: DONE on live 2026-11-09: merged (PR 9), migrated and deployed; the first nightly run (2026-11-10) changed nothing, as expected. APPROVED 2026-11-09 (author: decisions 1-5, 8, 9 given, decision 3 corrected to 1 option; the recommendations 6, 7, 10-13 approved).
Branch: l1-deadlines (from main at `42128f4`; never main)
Roadmap: follow-up of stage 2 ([ROADMAP-demo.md](../ROADMAP-demo.md)). The D1 cycle has to close by itself: a topic that reaches its deadline must move on. Effort estimate: 3-5 developer-days.

## 1. Context (verified 2026-11-09 at `42128f4`; live counts read-only on 2026-11-09)

| Fact | Evidence |
|---|---|
| **The Deadline window holds the public's management decisions.** Chat: +1 Week, Start Voting, Cancel Issue. Voting: +1 Week, Back to Chat, Finish Voting, Cancel Issue. ToDo: Cancel Issue only. Pressing a button stores the member's proposal in `deadline_votes` (one per member; pressing again withdraws it, another button moves it). | `prototype/js/main.js:3808-3990` (window), `:3542-3806` (`submitDeadlineVote`) |
| **Rule as built:** support = the supporters' ISR from the discussion's `isr_scores` map divided by the map's sum. An action executes in the client transaction of the press that makes its support **exceed 10 %** (strict). Order of checks: cancel, +1 week, then start voting / back to chat / finish voting. The window closes right away, so the member never sees the share that passed. | `main.js:3554-3557, 3600, 3636, 3659, 3683, 3753, 3775, 3969` |
| **One member can decide alone** in small publics. Live smoke test 2026-11-09: in issue 57 (13 members, pool 13.00), user 538 holds 18.9 % of the pool and finished the vote with a single press. The average member of a 13-member public holds 7.7 %. | A1 status log |
| **Effects as built.** +1 Week: deadline + 7 days, counted from the discussion's `ends`, or from today if it has none. Start Voting: the discussion becomes `Voting`; the issue becomes `in_process` with the options from `options_v2`, or with **3 invented options** ("Proceed with proposed fix", "Reject proposal", "Request more details") if there are none; deadline today + 7. Back to Chat: status `discussion`, votes reset, deadline today + 7. Finish Voting: `approved`; the A1 trigger then stores the result. | `main.js:3659-3790`; invented options also at `:4430-4434` and `:8211-8215` |
| **Cancel** sets `inactive` with `previous_status`. The topic stays in its list, struck through. It is **reactivated** (previous status, deadline today + 7) by any press once cancel support is 10 % or less. A topic canceled without cancel votes would therefore come back on the first press. | `main.js:3599-3633, 3636-3657, 8561, 8730, 9012-9015` |
| **Where deadlines live.** In Chat, `discussions.ends` holds the creator's date or "Ongoing" (`createIssue`). In Voting, `issues.ends` holds the date, but the window shows and extends the **discussion's** `ends`. Seeded voting issues therefore show "Ongoing" (author's screenshot 2026-11-09), and +1 Week counts from today, not from the issue's deadline. | `functions/index.js:581`; `main.js:3661-3667, 3961` |
| **The browser's "today" is frozen** at 2026-06-01 (`getDaysUntil`) and at 2026-06-05 (`isUrgentDate`). It drives the list labels, the sort order, the urgency colours and the chat expiry. | `main.js:233, 8333-8340` |
| **Expiry as built.** A chat whose deadline has passed (by the frozen date) is moved to voting by whichever browser is open (`checkAndTransitionExpiredDiscussion`), with the invented options if it has none. Nothing happens when a voting deadline passes. | `main.js:8184-8265, 8950-8959` |
| **Live data.** 114 chats: none has an option (the seeded chats never had any), 113 have no deadline and 1 is past. 76 voting issues: all past their deadline (`issues.ends`, e.g. 2026-06-09; `discussions.ends` is empty); 67 have no votes and 9 have votes below 30 % of the pool. 2 in ToDo, 1 inactive. 2 discussions and 2 issues hold pending management votes. | read-only count, 2026-11-09 |
| **Seeded voting topics also count as chats.** Their discussion has no status, and the Chat list hides only discussions marked `Voting`, expired ones, and inactive ones from a later phase. Topics moved by the app get `Voting`. | `main.js:8950-8966`; live count above |
| The A1 trigger stores the tally, the winner and the tasks when an issue becomes `approved`. A tie gives no winner (A1 decision 4). | `functions/index.js` `onIssueStatusChange` |
| `firebase-functions` 6.6.0 provides `onSchedule` (2nd gen, Cloud Scheduler). The database is in europe-central2. | `functions/node_modules`; R0 |

## 2. Goal

The public's management decisions and the deadlines follow one rule set, held in one shared module:
- An action executes when its supporters hold at least 30 % of the public's ISR pool, and the member is asked before their press executes it.
- When a deadline passes, the server moves the topic on once a day. A chat goes to voting if it has at least 1 option and is canceled otherwise. A voting issue goes to ToDo if the counted votes hold at least 30 % of the pool and there is a winner; a tie adds one week; otherwise it is canceled.
- The test data gets new deadlines first, so that nothing expires at once.

## 3. Non-goals

- No change to the A1 tally or the ISR. The voted share uses the A1 tally: voters without an ISR are not counted.
- Votes and management decisions stay client writes; the deadline run is the only new server writer. Vote integrity belongs to stage 5.
- No ToDo or task deadlines: tasks keep their own deadlines, and ToDo keeps only Cancel Issue.
- No change to who may vote or propose options. No new UI beyond what the requirements name.
- No deploy and no live write by the agent; the live migration is the author's step. No edits under `docs/`.

## 4. Requirements

### Shared rules
- **R1** A new shared UMD module `functions/lifecycle.js` has a byte-identical browser copy `prototype/js/lifecycle.js`. `npm run sync:isr` copies both modules, and a test fails if the copies differ.
  - **Constants:** `MANAGEMENT_THRESHOLD = 0.30`, `MIN_VOTED_SHARE = 0.30`, `MIN_OPTIONS = 1` (decisions 3 and 9), `EXTEND_DAYS = 7`.
  - **`managementOutcome(phase, status, deadlineVotes, isrByUid)`:** the support per action, the pool, and the action that executes, if any. The order is as built; the threshold is "at least" (decision 6).
  - **`votingOutcome(votes, isrByUid, optionCount)`:** the voted share and the result: `todo`, `tie` or `cancel`. It uses `ISR.tally`.
  - **`deadlineOutcome(phase, topic, isrByUid, today)`:** for a chat, `to_voting` or `cancel`; for a voting issue, `to_todo`, `extend` or `cancel`; null if the topic hasn't expired or the phase has no deadline action.
  - **Date helpers:** `addDays` and `isExpired` on `YYYY-MM-DD` strings. A deadline is the last open day, so the topic expires the day after it (decision 7).

### The Deadline window (browser)
- **R2** The window uses `managementOutcome`. Its rule text reads "at least 30 % of the ad-hoc public's total ISR-score".
- **R3** A press that would execute an action first asks for confirmation, for example: "Your support (18.9 %) is enough to finish voting now. Continue?" If the member declines, nothing is stored. A press below the threshold is stored as a proposal without asking, and the window stays open with the new totals.
- **R4** The window shows and changes the deadline of the current phase: `issues.ends` in Voting, `discussions.ends` in Chat. Every deadline write (+1 Week, transitions, the deadline run) writes the same date to both documents.
- **R5** Start Voting needs at least 1 option. With none, the button is disabled and says why ("needs at least 1 option"). A vote on a single option is allowed: the public may agree on one course. The three invented options are removed from all three places (decision 9).
- **R6** Finish Voting is enabled only when the current tally would pass: voted share at least 30 % and a winner. Otherwise the button says why (decision 10).
- **R7** A topic canceled at its deadline shows one action, "Reactivate (+1 week)". It executes at 30 %, and reactivation by falling cancel support does not apply to it. Topics canceled through Cancel Issue keep the built rule (decision 11).
- **R8** The browser uses the real date: the frozen dates are removed from `getDaysUntil` and `isUrgentDate`. The browser no longer moves expired chats: `checkAndTransitionExpiredDiscussion` and its call are removed. An expired topic waiting for the next run is labelled "Deadline passed".

### The deadline run (server)
- **R9** A scheduled function `closeExpiredTopics` (2nd gen, `onSchedule`, daily at 00:30 in the time zone of decision 7, region europe-central2) applies `deadlineOutcome` to every topic in Chat or Voting whose deadline has passed:
  - **Chat with at least 1 option:** the same writes as Start Voting (discussion `Voting`, issue `in_process` with the options, deadline today + 7).
  - **Chat with no options:** canceled.
  - **Voting with a winner and at least 30 % voted:** `approved`; the A1 trigger stores the result and the tasks.
  - **Voting with a tie and at least 30 % voted:** deadline + 7 days.
  - **Any other voting issue:** canceled. This covers no votes, a share below 30 %, and a public without an ISR pool.

  "Canceled" here means `inactive` with `previous_status` and `cancel_reason: "deadline"`.

  Every change appends an entry to a `lifecycle` list on the issue and the discussion: `{at, from, to, reason, voted_share, by: "deadline"}`. Each topic is changed in its own transaction, which first rechecks the phase and the deadline, so a second run changes nothing. The core is a plain function `closeExpiredTopics(db, today)`, exported for tests; the scheduled wrapper only supplies the date.
- **R10** `createIssue` gives a chat with no deadline from the creator today + 1 month (decision 8). The create form shows that default instead of "Ongoing".

### Existing data
- **R11** `scripts/migrate_l1.py`: dry run by default; emulator only, unless run with `--project … --i-know-this-is-live`; the new date comes from `--new-deadline` (default today + 1 month).
  - **Prolonging deadlines:** every chat and voting topic whose deadline is missing or earlier than the new date gets the new date, on the issue and the discussion (decision 8). Running the script again with a later `--new-deadline` before that date prolongs them again.
  - **Discussions of seeded voting and ToDo topics:** they get the status the app writes (`Voting`, `approved`), so they leave the Chat list (decision 13).
  - **Not changed:** member documents and votes.
  - **The report** gives the counts per phase and what the deadline run would do on the new date with today's options and votes. For example: "114 chats would be canceled (no options); 76 voting issues would be canceled (below 30 % voted)".

### Specs
- **R12** Update `06-aggregation-and-voting.md` (management decisions, the deadline rule), `02-data-model.md` (`lifecycle`, `cancel_reason`, the deadline fields), the README, CHANGES.md, and A1 decision 5 (now superseded).

## 5. Acceptance criteria

- **AC1 Unit tests (shared fixture).**
  - Management decisions: exactly 30 % passes and 29.9 % does not; the order of checks; one member alone at 30 % or more; a pool of 0.
  - Chat deadlines: 0 and 1 options.
  - Voting deadlines: no votes; below 30 %; at least 30 % with a winner; at least 30 % with a tie; voters without an ISR; no ISR pool.
  - Dates: month and year ends; the day after the deadline versus the deadline day.
- **AC2** `prototype/js/lifecycle.js` equals `functions/lifecycle.js` (test).
- **AC3 Emulator, browser.**
  - The window shows 30 % and the phase deadline, and +1 Week extends from it.
  - A press below the threshold is stored and shown; a press that crosses it asks first, and declining stores nothing.
  - Start Voting is disabled with no options and enabled with 1; Finish Voting is disabled with a tie.
  - A deadline-canceled topic offers only Reactivate.
- **AC4 Emulator, server.** `closeExpiredTopics(db, today)` runs against a prepared state:
  - a chat with 1 option moves to voting, and a chat with none is canceled;
  - a voting issue with 30 % or more and a winner moves to ToDo, and the A1 trigger stores the result;
  - a tie gets 7 more days, and a share below 30 % is canceled;
  - each change leaves a `lifecycle` entry, and a second run changes nothing.
- **AC5 Migration on the emulator:** dry-run report, apply, then a second run changes nothing.
- **AC6** CI is green; the agent makes no deploy and no live write; no file under `docs/` changes.

## 6. Decisions

Each decision is marked *author* (given 2026-11-09) or *recommended, approved* (proposed by the agent, approved 2026-11-09).

1. *Author.* **Thresholds:** management decisions and the minimum voted share are both 30 % of the public's ISR pool.
2. *Author.* **Voting at the deadline:** ToDo with a winner and at least 30 % voted; a tie adds one week; otherwise canceled.
3. *Author.* **Chat at the deadline:** voting with at least 1 option; canceled with none (corrected 2026-11-09 from 2 options, to match decision 9).
4. *Author.* **Who closes expired topics:** the server, once a day.
5. *Author.* **Confirmation:** a press that would execute an action asks the member first.
6. *Recommended, approved.* **Boundary:** "at least 30 %" (≥), following the author's wording. The built code uses "exceeds" (>).
7. *Recommended, approved.* **When a topic expires:** a deadline is the last open day. The run happens daily at 00:30 Europe/Zurich, the time zone of the app's default map centre, Basel (`main.js:240`).
8. *Author.* **Every chat has a deadline:** new chats get creation + 1 month when the creator sets none; "Ongoing" is no longer possible. Existing chats and voting topics are prolonged by the migration, which can be run again to prolong them further. **Consequence for the test data:** today none of the 114 chats has an option, and none of the 76 voting issues has 30 % voted. If that is still so when the new date passes, the next run cancels them all. Prolonging again or preparing the demo topics avoids it, and a 30 % "Reactivate" brings a canceled topic back (decision 11).
9. *Author.* **Start Voting:** needs at least 1 option, because the public may agree on one course; the invented options are removed.
10. *Recommended, approved.* **Finish Voting:** offered only when the current tally would pass. This avoids a ToDo with no winner, which can happen today after a tie.
11. *Recommended, approved.* **Reactivation:** a deadline-canceled topic comes back only by a 30 % "Reactivate (+1 week)" decision. Cancel Issue keeps the built rule: it holds while cancel support stays at or above the threshold.
12. *Recommended, approved.* **Voting deadline after a chat moves to voting:** today + 7 days, as built.
13. *Recommended, approved.* **Seeded discussions:** they get the phase status the app writes, so voting topics stop appearing in Chat.

## 7. Findings (not changed here)

- The Voting and ToDo lists only consider the 30 newest issues (`main.js:9003`, `.limit(30)`). With 81 issues on live, many voting issues never appear in these lists.
- The voting view takes the options from `discussions.options_v2` when present and from `issues.options` otherwise (`main.js:4409-4429`), while the A1 trigger counts against `issues.options`. They agree as long as Start Voting copies the options, which it does.

## 8. Traceability

- **Issues in the spec index:** C-35 (vote outcome; extended to the deadline) and C-34 (vote weight; unchanged).
- **Supersedes:** A1 decision 5 (phase-move rule kept at 10 %).
- **Author's design statement:** 2026-11-09, in the session that recorded A1's live results.

## 9. Status log

- Plan approved: 2026-11-09 (author; decision 3 corrected to 1 option).
- Implementation: R1-R12 on branch `l1-deadlines`: `functions/lifecycle.js` (+ `prototype/js/lifecycle.js`), `functions/deadlines.js`, `closeExpiredTopics` and the chat deadline in `functions/index.js`, `functions/tools/close_expired.js`, the Deadline window and dates in `prototype/js/main.js`, `scripts/migrate_l1.py`.
- Tests: Node 32 (8 new: dates and time zone, phase, voting outcome, management decisions, deadline outcome, the voting issue fields, browser copy identical); Python 48 (7 new: the port on the shared fixture `tests/fixtures/lifecycle_cases.json`, the migration plan, a second run, prolonging again).
- Emulator end to end (2026-11-09, after the L1 migration):
  - AC4: five topics got a deadline of 2026-11-08 and `tools/close_expired.js --today 2026-11-09` ran. A chat with 1 option moved to voting (deadline 2026-11-16, issue created with that option); a chat without options was canceled (`cancel_reason: "deadline"`); a voting issue with 46.2 % voted moved to ToDo and the A1 trigger stored its tally and winner; a tie at 37 % got 7 more days (2026-11-15); 11.4 % voted was canceled. Every change left a `lifecycle` entry on both documents; a second run changed nothing.
  - AC3 (browser, two adopted members): the window shows the 30 % rule and the deadline of the phase; a press at 5.1 % and one at 15.4 % were stored without a question and the window stayed open; a press that would bring +1 Week to 42.5 % asked first, declining stored nothing, accepting moved the voting deadline from 2026-12-09 to 2026-12-16 on both documents; Start Voting was disabled in a chat without options and enabled with 1; Finish Voting was disabled below 30 % voted and on a tie ("the vote is tied"); a chat canceled at its deadline was struck through in the list and offered only Reactivate, which at 6.5 % was stored and at 31.8 % (after the question) brought it back with a deadline of 2026-11-16; the Chat list shows "Ends: 09.12.2026" and "Deadline passed"; the create form defaults to 09.12.2026, and `createIssue` without a deadline wrote 2026-12-09 to the issue and the discussion.
- Migration (emulator): dry run [L1-migration-report.md](L1-migration-report.md) (113 chats and 77 voting topics prolonged to 2026-12-09, 77 + 1 discussion statuses set); apply: 269 documents; second run: no changes. Its preview: on 2026-12-10 every chat (no options) and every voting issue (none has 30 % voted) would be canceled.
- CHANGES.md: written.
- Deviations and clarifications:
  - A tie at the deadline extends from the later of the deadline and yesterday, so a stale deadline gets today + 6 instead of a date that has already passed.
  - A chat canceled at its deadline: only the discussion is canceled; an app-created issue document keeps status `open` and gets the `lifecycle` entry (as Cancel Issue in Chat does as built).
  - R4 "both documents": written when the issue document exists (seeded chats have none).
  - The confirmation uses the browser's confirm dialog.
  - Testing: the emulator does not fire schedules, so AC4 used `tools/close_expired.js`; the tie check in the browser needed issue 16 listed temporarily, because the Voting list only considers the 30 newest issues (finding in section 7). Emulator test data was changed for AC3/AC4 (votes, proposals, two ISR values in public 16, one test issue).
- Live (2026-11-09):
  - Merged as PR 9 (`14fe1a8`).
  - Migration applied by the author before the deploy: 269 documents (191 discussions, 78 issues); report [L1-migration-report-live.md](L1-migration-report-live.md); the second dry run found no changes. Every chat and voting deadline is now 2026-12-09.
  - Deploy by the author: functions and hosting. Checked read-only: the live `index.html`, `js/main.js`, `js/lifecycle.js` and `js/isr.js` equal main (SHA-256); `closeExpiredTopics` is a scheduled 2nd-gen function in europe-central2; its Cloud Scheduler job `firebase-schedule-closeExpiredTopics-europe-central2` is ENABLED, "30 0 * * *", Europe/Zurich.
  - Browser, read-only (an adopted member, no button pressed): the Chat and Voting lists show "Ends: 09.12.2026"; a chat's Deadline window shows the 30 % rule with the pool in ISR, the deadline 09.12.2026 and Start Voting disabled ("needs at least 1 option"); a voting issue's window shows the deadline 09.12.2026 and Finish Voting disabled ("needs at least 30 % of the public's ISR-score voted").
  - Press test (author, 2026-11-09): a press below 30 % was stored without a question; pressing the same button again withdrew it.
  - First nightly run (2026-11-10, 00:30 Europe/Zurich): it ran at 2026-11-09 23:30:00 UTC and logged "closeExpiredTopics 2026-11-10: checked 3, changed 0 []", with no errors (`firebase functions:log --only closeExpiredTopics`). The 3 checked topics are the ones with a deadline before today, and all three are past their decision: issue 57 (approved, 2026-06-09), issue 182 (tasks, 2026-06-23) and discussion qTkvs4PP90KIiOt0o6kF (inactive, 2026-06-29); read-only live query. As expected, nothing changed, since every open topic's deadline is 2026-12-09.
  - Reminder: the run on 2026-12-10 cancels every chat without an option and every voting issue below 30 % voted (the report's preview: 189 of 190 topics), unless options are proposed and votes cast first or the migration is run again with a later `--new-deadline`.
