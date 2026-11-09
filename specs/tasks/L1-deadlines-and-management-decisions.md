# SPEC L1: deadlines and the public's management decisions

Status: DRAFT 2026-11-09, waiting for the author's approval (decisions 1-5, 8 and 9 given by the author; the others are recommendations).
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
| **Live data.** 114 chats: every one has fewer than 2 options (the seeded chats have none), 113 have no deadline and 1 is past. 76 voting issues: all past their deadline (`issues.ends`, e.g. 2026-06-09; `discussions.ends` is empty); 67 have no votes and 9 have votes below 30 % of the pool. 2 in ToDo, 1 inactive. 2 discussions and 2 issues hold pending management votes. | read-only count, 2026-11-09 |
| **Seeded voting topics also count as chats.** Their discussion has no status, and the Chat list hides only discussions marked `Voting`, expired ones, and inactive ones from a later phase. Topics moved by the app get `Voting`. | `main.js:8950-8966`; live count above |
| The A1 trigger stores the tally, the winner and the tasks when an issue becomes `approved`. A tie gives no winner (A1 decision 4). | `functions/index.js` `onIssueStatusChange` |
| `firebase-functions` 6.6.0 provides `onSchedule` (2nd gen, Cloud Scheduler). The database is in europe-central2. | `functions/node_modules`; R0 |

## 2. Goal

The public's management decisions and the deadlines follow one rule set, held in one shared module:
- An action executes when its supporters hold at least 30 % of the public's ISR pool, and the member is asked before their press executes it.
- When a deadline passes, the server moves the topic on once a day. A chat goes to voting if it has at least 2 options and is canceled otherwise. A voting issue goes to ToDo if the counted votes hold at least 30 % of the pool and there is a winner; a tie adds one week; otherwise it is canceled.
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
  - **Constants:** `MANAGEMENT_THRESHOLD = 0.30`, `MIN_VOTED_SHARE = 0.30`, `MIN_OPTIONS_START_VOTING = 1` (decision 9), `MIN_OPTIONS_AT_DEADLINE = 2` (decision 3), `EXTEND_DAYS = 7`.
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
  - **Chat with at least 2 options:** the same writes as Start Voting (discussion `Voting`, issue `in_process` with the options, deadline today + 7).
  - **Chat with fewer options:** canceled.
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
  - **The report** gives the counts per phase and what the deadline run would do on the new date with today's options and votes. For example: "114 chats would be canceled (fewer than 2 options); 76 voting issues would be canceled (below 30 % voted)".

### Specs
- **R12** Update `06-aggregation-and-voting.md` (management decisions, the deadline rule), `02-data-model.md` (`lifecycle`, `cancel_reason`, the deadline fields), the README, CHANGES.md, and A1 decision 5 (now superseded).

## 5. Acceptance criteria

- **AC1 Unit tests (shared fixture).**
  - Management decisions: exactly 30 % passes and 29.9 % does not; the order of checks; one member alone at 30 % or more; a pool of 0.
  - Chat deadlines: 0, 1 and 2 options.
  - Voting deadlines: no votes; below 30 %; at least 30 % with a winner; at least 30 % with a tie; voters without an ISR; no ISR pool.
  - Dates: month and year ends; the day after the deadline versus the deadline day.
- **AC2** `prototype/js/lifecycle.js` equals `functions/lifecycle.js` (test).
- **AC3 Emulator, browser.**
  - The window shows 30 % and the phase deadline, and +1 Week extends from it.
  - A press below the threshold is stored and shown; a press that crosses it asks first, and declining stores nothing.
  - Start Voting is disabled with no options and enabled with 1; Finish Voting is disabled with a tie.
  - A deadline-canceled topic offers only Reactivate.
- **AC4 Emulator, server.** `closeExpiredTopics(db, today)` runs against a prepared state:
  - a chat with 2 options moves to voting, and a chat with 1 option is canceled;
  - a voting issue with 30 % or more and a winner moves to ToDo, and the A1 trigger stores the result;
  - a tie gets 7 more days, and a share below 30 % is canceled;
  - each change leaves a `lifecycle` entry, and a second run changes nothing.
- **AC5 Migration on the emulator:** dry-run report, apply, then a second run changes nothing.
- **AC6** CI is green; the agent makes no deploy and no live write; no file under `docs/` changes.

## 6. Decisions

Each decision is marked *author* (given 2026-11-09) or *recommended* (author to confirm).

1. *Author.* **Thresholds:** management decisions and the minimum voted share are both 30 % of the public's ISR pool.
2. *Author.* **Voting at the deadline:** ToDo with a winner and at least 30 % voted; a tie adds one week; otherwise canceled.
3. *Author.* **Chat at the deadline:** voting with at least 2 options; canceled with fewer. (Open: should this follow decision 9 and need only 1 option?)
4. *Author.* **Who closes expired topics:** the server, once a day.
5. *Author.* **Confirmation:** a press that would execute an action asks the member first.
6. *Recommended.* **Boundary:** "at least 30 %" (≥), following the author's wording. The built code uses "exceeds" (>).
7. *Recommended.* **When a topic expires:** a deadline is the last open day. The run happens daily at 00:30 Europe/Zurich, the time zone of the app's default map centre, Basel (`main.js:240`).
8. *Author.* **Every chat has a deadline:** new chats get creation + 1 month when the creator sets none; "Ongoing" is no longer possible. Existing chats and voting topics are prolonged by the migration, which can be run again to prolong them further. **Consequence for the test data:** today none of the 114 chats has an option, and none of the 76 voting issues has 30 % voted. If that is still so when the new date passes, the next run cancels them all. Prolonging again or preparing the demo topics avoids it, and a 30 % "Reactivate" brings a canceled topic back (decision 11).
9. *Author.* **Start Voting:** needs at least 1 option, because the public may agree on one course; the invented options are removed.
10. *Recommended.* **Finish Voting:** offered only when the current tally would pass. This avoids a ToDo with no winner, which can happen today after a tie.
11. *Recommended.* **Reactivation:** a deadline-canceled topic comes back only by a 30 % "Reactivate (+1 week)" decision. Cancel Issue keeps the built rule: it holds while cancel support stays at or above the threshold.
12. *Recommended.* **Voting deadline after a chat moves to voting:** today + 7 days, as built.
13. *Recommended.* **Seeded discussions:** they get the phase status the app writes, so voting topics stop appearing in Chat.

## 7. Findings (not changed here)

- The Voting and ToDo lists only consider the 30 newest issues (`main.js:9003`, `.limit(30)`). With 81 issues on live, many voting issues never appear in these lists.
- The voting view takes the options from `discussions.options_v2` when present and from `issues.options` otherwise (`main.js:4409-4429`), while the A1 trigger counts against `issues.options`. They agree as long as Start Voting copies the options, which it does.

## 8. Traceability

- **Issues in the spec index:** C-35 (vote outcome; extended to the deadline) and C-34 (vote weight; unchanged).
- **Supersedes:** A1 decision 5 (phase-move rule kept at 10 %).
- **Author's design statement:** 2026-11-09, in the session that recorded A1's live results.

## 9. Status log

- Plan approved: ___
- Implementation: ___
- Tests: ___
- Emulator end to end: ___
- Migration (emulator): ___
- CHANGES.md: ___
- Deviations: ___
