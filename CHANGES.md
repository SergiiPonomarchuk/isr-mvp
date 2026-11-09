# CHANGES

## A1b: an expertise placeholder for publics without E and ISR (2026-11-09)

Spec: `specs/tasks/A1b-expertise-placeholder.md` (author: option b).

### What changed
- **New script** `scripts/migrate_a1b.py` (data only; dry run by default). It applies to every ad-hoc public where no member has E or ISR: the app-created publics from before A1.
  - Each member gets `expertise_score` 0.0 with `expertise_source: "no_issue_vector"`.
  - The ISR is computed with the A1 formula from R, this E (normalised to 1.0 for everyone) and the contribution placeholder. It is written as `createIssue` writes it.
  - The topic's maps are rewritten from the member values.
  - Stage 1 replaces the placeholder with real E.
- **Why a placeholder:** E needs the issue vector, which no topic has, and the embedding model is retired.
- **Tests:** `tests/test_migrate_a1b.py` (4).

### Checks
- **Unit tests:** Python 52 (4 new).
- **Emulator:**
  - 2 publics, 50 members, 54 documents written (report `specs/tasks/A1b-migration-report.md`); the second run changed nothing.
  - Every stored ISR equals `functions/isr.js`.
  - The browser shows the ISR instead of "N/A".
- **Live dry run (read-only):** 3 publics, 150 members, 6 topic documents; none left alone.

### Author's steps after merging
1. Apply on live:

   ```
   python scripts/migrate_a1b.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply --report specs/tasks/A1b-migration-report-live.md
   ```

2. Run it again without `--apply`, with `--report "$env:TEMP1b-check.md"` so the committed reports stay as they are. It should list 0 publics.
3. No deploy is needed.

### Live (2026-11-09)
- Merged as PR 13. Applied by the author: 156 documents (150 members of 3 publics, 6 topic documents); report `specs/tasks/A1b-migration-report-live.md`; the dry run afterwards found nothing to change.
- Checked (read-only): all 3,195 live members have E and ISR; the placeholder ISRs equal the A1 formula; the maps equal the members.

## U4: the Voting view keeps its own messages (2026-11-09)

Spec: `specs/tasks/U4-voting-view-messages.md` (author: "fix the Voting bug").

### What changed
- **Fix:** the Voting view now declares its message state (`let currentMessagesRaw = null;`), as the Chat and ToDo views do. (`prototype/js/main.js`)
- **Before:** the name was an implicit global. Each voting topic's first render failed with "currentMessagesRaw is not defined", and the next voting topic briefly showed the previous topic's messages.
- **Test:** `functions/test/topic_views.test.js` checks that the three views declare it before use.

### Checks
- **Unit tests:** Node 40 (1 new; it fails before the fix).
- **Emulator:** opening voting issues 179 and then 187 logs no error, leaves no global, and shows each issue's own messages.

### Author's steps after merging
- Deploy hosting with the next deploy (`firebase deploy --only hosting --project project-a3d59130-5adf-4677-9e2`).

### Live (2026-11-09)
- Merged as PR 12 and deployed; opening a voting issue on live logs no error.

## U3: sort buttons for an issue's messages; dashboard order (2026-11-09)

Spec: `specs/tasks/U3-message-sorting.md` (approved 2026-11-09 with the author's changes).

### What changed
- **Message sort buttons:** the message list of the Chat, Voting and ToDo views has the buttons **date, ISR, R, E**.
  - Date shows newest first; ISR, R and E show the highest first. Pressing the active button again reverses the order (the arrow shows ↓ or ↑).
  - Messages whose author has no value go last.
  - The description stays on top.
  - The choice is kept while the page is open, for every topic. (`prototype/js/main.js`)
- **Values on each message:** each author's line shows their values in this ad-hoc public on the right, for example `0.93 R 22 E 2.05` (ISR, R in percent, E; "N/A" when missing). They are read from the public's member documents, the A1 source. (`main.js`, `prototype/styles.css`)
- **Dashboard order:**
  - The summary strip reads "Discussions · Active votes · To Do".
  - The cards are ordered Chat, Voting, To Do; Voting keeps the wider column.
  - The tour text follows the new order. (`main.js`, `prototype/index.html`, `styles.css`)
- **Test:** `functions/test/message_sort.test.js` runs the sort comparator taken from `main.js` and checks the views, the value format and the order of the strip and the cards.

### Checks
- **Unit tests:** Node 39 (4 new), Python 48.
- **Emulator, in the browser:**
  - In a chat, a voting issue and a ToDo issue (25-27 messages each), every order (date, ISR, R, E, reversed) equals a script's order from the member documents.
  - The choice survives a new message and carries over to the next topic.
  - "N/A" shows for authors without values.
  - The strip and the cards are in the new order.

### Findings (not changed)
- The Voting view reads `currentMessagesRaw` without declaring it, so its first render fails until the messages arrive, and the next voting topic can briefly show the previous topic's messages (predates U3).
- The members of the 2 app-created publics of June 2026 (and, on live, of the R0 smoke-test public) have no E or ISR. Computing them is a separate task, waiting for the author's choice (spec, decision 6).

### Author's steps after merging
1. Deploy hosting: `firebase deploy --only hosting --project project-a3d59130-5adf-4677-9e2`.
2. Check on live with Ctrl+F5 or a new incognito window (the browser keeps `styles.css` and `main.js` for up to an hour):
   - the buttons and the values in one topic;
   - the order of the strip and the cards.

### Live (2026-11-09)
- Merged as PR 11 (values without the asterisk) and deployed. Checked on live: the buttons, the values and ISR sorting in voting issue 16; the strip and card order.

## U2: the Voting and ToDo lists show all of a member's issues (2026-11-09)

Spec: `specs/tasks/U2-voting-todo-list-limit.md` (approved 2026-11-09: decision 1 b, "delete Issues", test yes).

### What changed
- **Before:** the Voting and ToDo lists only looked at the 30 newest issues of the whole collection. On the emulator, 51 of the 77 voting issues and 1 of the 3 ToDo issues never appeared for anyone; 114 of the 299 members with a voting issue saw none of theirs.
- **Now:** they read only the member's issues, by document id (at most 30 ids per query). The ids are the member's topics that the Chat list already computes on every change of a discussion, so a topic the member joins or creates appears without a reload. The order of the old query is kept for the dashboard previews and ties. (`prototype/js/main.js`)
- **Summary strip:** "Issues" removed; "To Do" shows the ToDo count instead of the voting count. (`main.js`, `prototype/index.html`)
- **Test:** `functions/test/member_issues.test.js` fails if an issues query gets a `.limit(` again.

### Checks
- **Unit tests:** Node 35 (3 new), Python 48.
- **Emulator, in the browser** as Cynthia Gray, user 1, Sara Lara and Karen Chavez: every Voting and ToDo count equals a script's count with the same membership rules (user 1: 77 voting, 3 ToDo); issue 16 and ToDo issue 91 now appear; joining and leaving a topic updates the list without a reload; no console errors.
- **Testing incident:** the first browser run used the live database (the page was opened without `?emulator=1`). It only read; the page's one automatic write (the Chat list's last-message "self-healing") had nothing to heal, which the 2026-11-07 backup and a read-only count on live confirm. Details in the spec's status log.

### Findings (not changed)
- An issue's `created_at` is a server Timestamp when `createIssue` writes it and ISO text everywhere else; Start Voting and the deadline run overwrite it with the time voting started.

### Author's steps after merging
1. Deploy hosting: `firebase deploy --only hosting --project project-a3d59130-5adf-4677-9e2`.
2. Check on live (Ctrl+F5 or a new incognito window): as Cynthia Gray, issue 16 is in the Voting list; the strip has no "Issues".

### Live (2026-11-09)
- Merged as PR 10 and deployed. Checked on live: Cynthia Gray's Voting list shows issue 16.

## L1: deadlines and the public's management decisions (2026-11-09)

Branch `l1-deadlines`. Spec: `specs/tasks/L1-deadlines-and-management-decisions.md` (approved 2026-11-09; decision 3 corrected to 1 option).

### What changed
- **Shared rules** `functions/lifecycle.js` (Node and browser; `prototype/js/lifecycle.js` is a byte-identical copy, and `npm run sync:isr` now copies both modules):
  - management decisions execute at at least 30 % of the public's ISR pool (was more than 10 %);
  - the voted share at the deadline uses the A1 tally, so voters without an ISR are not counted;
  - deadline outcomes; dates are calendar days in Europe/Zurich.

  Checked on `tests/fixtures/lifecycle_cases.json` by Node and by the Python port in `scripts/migrate_l1.py`.
- **Deadline window** (browser):
  - the 30 % rule; a press that would carry out an action asks first, and declining stores nothing;
  - Start Voting needs at least 1 option; Finish Voting is offered only when the vote would pass (at least 30 % voted and a winner);
  - a topic canceled at its deadline offers only "Reactivate (+1 week)" (30 %);
  - the window shows, and +1 Week extends, the deadline of the current phase (the issue's in Voting), written to both documents;
  - the three invented options ("Proceed with proposed fix", ...) are gone.
- **Real date**: the browser's "today" is no longer frozen at 2026-06-01 / 2026-06-05. Lists show "Deadline passed" for topics waiting for the daily run, and the browser no longer moves expired chats itself.
- **Daily deadline run** `closeExpiredTopics` (2nd gen, 00:30 Europe/Zurich, europe-central2):
  - a chat moves to voting with at least 1 option (deadline today + 7) and is canceled otherwise;
  - a voting issue moves to ToDo with at least 30 % voted and a winner (the A1 trigger stores the result), gets 7 more days on a tie, and is canceled otherwise;
  - canceled = `inactive` with `cancel_reason: "deadline"`; every change appends a `lifecycle` entry to both documents.

  The core is in `functions/deadlines.js`; `functions/tools/close_expired.js` runs it once against the emulator.
- **createIssue**: every new chat gets a deadline, the creator's date or today + 1 month, on the issue and the discussion. The create form shows the default instead of "Ongoing".
- **Migration** `scripts/migrate_l1.py`:
  - prolongs every chat and voting deadline that is missing or earlier than the new date (default today + 1 month);
  - gives seeded discussions of voting and ToDo topics their phase status (`Voting`, `approved`), so voting topics leave the Chat list;
  - previews the first deadline run.

### Checks
- **Unit tests:** Node 32 (8 new), Python 48 (7 new).
- **Emulator migration:** 269 documents; the second run changed nothing.
- **Deadline run** on 5 prepared topics: every outcome as specified, and the A1 trigger stored the result of the topic that moved to ToDo. The second run changed nothing.
- **Browser:** AC3 passed. Details in the spec's status log.

### Findings (not changed)
- The Voting and ToDo lists only consider the 30 newest issues (`main.js`, `.limit(30)`), so a member's voting issue can be missing from their list (seen on the emulator).
- With today's test data, the first run after the migration date cancels every chat (none has an option) and every voting issue (none has 30 % voted). Proposing options and voting first avoids that, and so does prolonging again.

### Live (2026-11-09)
- Merged as PR 9. Migration applied by the author before the deploy: 269 documents; report `specs/tasks/L1-migration-report-live.md`; second dry run clean. Every chat and voting deadline is now 2026-12-09.
- Deployed by the author: functions and hosting (live files equal main). `closeExpiredTopics` runs daily at 00:30 Europe/Zurich (europe-central2, Cloud Scheduler job enabled).
- Browser check (read-only): the lists show the new deadlines; the Deadline window shows the 30 % rule; Start Voting and Finish Voting are disabled with their reasons.
- Press test (author): a press below 30 % was stored without a question; a second press withdrew it.
- First nightly run (2026-11-10): pending.
- The live preview for 2026-12-10: 113 chats canceled (no options), 1 chat to voting, 76 voting issues canceled (9 below 30 % voted, 67 without votes).

### Author's steps after merging (order matters)
1. **Migration first:**

   ```
   python scripts/migrate_l1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live
   ```

   That is the dry run. Then run it again with `--apply --report specs/tasks/L1-migration-report-live.md`, then the dry run again (no changes). The live voting issues have deadlines in June 2026. If the deadline run is deployed before the migration, its first run (00:30) cancels them all.
2. **Then deploy:** `firebase deploy --only "functions,hosting" --project project-a3d59130-5adf-4677-9e2`. This creates `closeExpiredTopics`; the CLI may ask to enable Cloud Scheduler.
3. **Smoke test** in a new incognito window:
   - the Deadline window shows 30 % and asks before carrying an action out;
   - the lists show the new deadlines;
   - the next morning, the function log shows the run (`firebase functions:log --only closeExpiredTopics`).

## A1 v2 (roadmap stage 2): one ISR, computed on the server (2026-11-08)

Branch `a1-one-isr`. Spec: `specs/tasks/A1-canonical-isr.md` (v2). Decisions: author 2026-11-08, as recommended.

### What changed
- **Shared module** `functions/isr.js` (Node and browser): relevance, age at registration, age floor, E from skill vectors, normalisation by the mean (all equal or all zero -> 1.0; mean <= 0 with unequal values -> error), the Contribution placeholder (C-hat = 1.0, `contribution_source: "constant"`), the member ISR, and the vote tally (voters without an ISR excluded; a tie or no counted votes gives no winner). `prototype/js/isr.js` is a byte-identical copy (`npm run sync:isr`, checked by a test). Python port `scripts/isr_core.py`; both are checked on `tests/fixtures/isr_cases.json`.
- **createIssue** now computes E (education and work-experience skills, CBC table, the Analyzer's CBC adjustment, age at the server's registration time) and the member ISR with the issue's aggregation weights, writes the full breakdown into each member document, and writes `relevance_scores` / `isr_scores` maps on the issue and the discussion equal to the member values (no floors, members only). Without a birthDate no age floor is applied and a warning is logged.
- **Trigger** `onIssueStatusChange` (2nd gen, region europe-central2, the database's region): when an issue becomes `approved`, it stores `options[].score`, `winning_option_index`, a `tally` record (counted, excluded, note, ISR source) and creates `tasks` from the winning option's steps.
- **Browser**: every display and the live tally use the member ISR (`window.ISR.tally`); removed the 1.5 x relevance fallbacks and the invented values in the chat list (creator 0.85 / 1.28, participant 0.50 / 0.75); a vote from someone without an ISR for the public is not counted and the issue says so.
- **Migration** `scripts/migrate_a1.py`: rewrites the maps of every discussion and issue from the member documents and reports how tallies change. Emulator: 272 documents; the demo user "1" leaves 168 maps (not a member of those publics; visibility is unchanged because it comes from participants and membership); second run clean.
- `scripts/seed_emulator.py --skill-vectors` loads the 20,245 skill vectors into the emulator.

### Checks
- AC1, AC4, R7 and the migration: see the spec's status log (all passed; AC1 within 0.002 because A2/A3 stored rounded inputs).

### Findings (not changed)
- The three HTTPS functions run in us-central1, the database in europe-central2: every read crosses the Atlantic, which explains part of the slowness on live. Moving them changes the function URLs in the prototype; a separate task.
- E for new issues is mostly the age floor until stage 1, because the issue vector is random without a working AI model.

### Author's steps after merging
1. `firebase deploy --only "functions,hosting" --project project-a3d59130-5adf-4677-9e2` (creates the trigger in europe-central2; the CLI may ask to grant Eventarc roles).
2. `python scripts/migrate_a1.py --source firestore --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live` (dry run), then with `--apply --report specs/tasks/A1-migration-report-live.md`; then the dry run again (no changes).
3. Smoke test: list and card show the same ISR; a vote updates the tally; finishing a vote stores the result.

### Live (2026-11-09)
- Merged as PR 7. Deployed: the three HTTPS functions, the trigger `onIssueStatusChange` (europe-central2; the first attempt failed while Eventarc's permissions were still propagating, the retry worked) and hosting (live files equal main).
- Migration applied by the author: 273 documents; report `specs/tasks/A1-migration-report-live.md`; second dry run clean.
- Smoke test on issue 57: the vote was stored; "Finish Voting" moved the issue to `approved`; the trigger stored the option scores (1.488 / 2.457), the winner (option 2) and the tally record. Details in the spec's status log.
- Findings for the next spec: one member can pass the 10 % phase-move threshold alone in small publics; nothing happens when a voting deadline passes (76 of 77 voting issues on live are past their deadline); 189 of 193 chats have no deadline.

## U1: fixes from the R0 live smoke test (2026-11-08)

Branch `ui-smoke-fixes`. Spec: `specs/tasks/U1-smoke-test-fixes.md`. Both bugs predate A2/A3/R0.

- **Voting did not update after "Vote"**: the live listeners of the voting view and of a second detail view called `ensureTopicLocation`, defined inside `initRealTimeDashboardSync` and not visible to them, so every change of the issue or discussion threw a `ReferenceError` before the redraw (only new chat messages redrew the view). The function now sits at the top level of `main.js` (no logic change). Emulator: totals and selection update immediately on vote and re-vote.
- **Duplicate names in the step-owner lists** ("Propose option" and task step assignment): `participants[]` holds each id as text and as a number; the lists are now deduplicated by id.
- **Recorded for the paper, not changed**: for an issue without a stored location `ensureTopicLocation` invents one near Basel with μ/σ from a hash of the title, for display only (`main.js`, the function's body); this applies to the 112 seeded publics without a location.
- **Live**: merged as #5, hosting released 2026-11-08 17:06; verified by the author: voting updates immediately, each name once. Seen during the test and left for roadmap stage 2: the voting list shows the cached `isr_scores` (1.5 × floored relevance, e.g. 1.20) while the topic card shows the member ISR (e.g. 0.44); the vote tally uses the cached number (C-34).
- **Smoke test results (live, 2026-11-08)**: login by adopting a profile works; Check → Create works after the memory fix (100 members); proposing an option with cost, funding source and resources works; voting works but needed this fix to update immediately. Noted for the next UI task: Esc closes the whole new-issue window even while the geotag map is open; the geotag button downloads all profiles in the browser to show the nearest distance.

## R0: keep the live MVP alive, consolidate A2/A3 (2026-11-07)

Branch `r0-keep-alive` (from `a3-options-and-g-anchors`). Spec: `specs/tasks/R0-keep-alive.md`. Roadmap stage 0 (`specs/ROADMAP-demo.md`).

### What changed
- `firestore.rules`: client access open until **2027-06-30** (was 2026-12-31) for every collection except `issue_drafts`, which is closed to clients; the Cloud Functions (Admin SDK) still use it. A forged draft could otherwise have brought typed numbers into an issue.
- `scripts/check_rules_emulator.py`: 13 unauthenticated checks on the emulator (reads and writes allowed in the prototype collections, every `issue_drafts` access denied). All pass.
- `scripts/backup_firestore.py`: full read-only JSON backup of all collections and subcollections, with typed values (timestamps, GeoPoints, vectors, references), its own retries, `.part` files and `--resume`; refuses folders inside the repository.
- `.github/workflows/tests.yml`: Python (numpy) and Node 22 unit tests on every push and pull request. Green on GitHub for this branch.
- Runbook (spec §6) with `firebase deploy --dry-run` before the real deploy.

### Live backup (read-only, on the author's request)
- `A:\ISR\mvp\dbbackup6-11-07`, finished 2026-11-07 01:32 UTC: actions 1,188; discussions 192 (+1,694 messages); issues 80; microcommunities 192; microcommunity_members 3,099; user_packs 37; user_vectors 9,150; users 9,151; total 24,783 documents (all equal to the 2026-10-12 export).
- The first attempt stopped on `user_vectors` (a network timeout, then an `AttributeError` inside the Firestore client's own retry path, `query.py:282`). Its incomplete folder was removed; the script now pages 100 documents at a time, retries by itself (up to 7 times, back-off to 60 s) and can resume. The second run needed many retries on `user_vectors` and completed.
- A second backup is due right before the live migrations.

### Checks
- Dress rehearsal on the emulator (fresh seed with names): backup 23,558 documents; A2 dry run and apply (3,045 recomputed, 4 memberships removed); A3 dry run and apply (1,225 recomputed); both second runs change nothing, also A2 after A3.
- Prototype on the emulator under the new rules: discussions load, writes work, `issue_drafts` read is `permission-denied`; Check → Create still works through the functions.
- Functions load without emulator variables (exports `analyzeIssue`, `createIssue`, `checkIssue`). The `?emulator=1` switch only acts on localhost.
- Versions: firebase-tools 14.1.0, firebase-functions 6.6.0 (the emulator says outdated; not upgraded in R0), firebase-admin 12.7.0, @google/generative-ai 0.21.0 (old SDK; replaced in roadmap stage 1).

### Live runbook (2026-11-07/08)
- **Pull request** [SergiiPonomarchuk/isr-mvp#2](https://github.com/SergiiPonomarchuk/isr-mvp/pull/2), CI green, merged by the author (merge commit `f3f3bed`).
- **Pre-migration backup** (agent, read-only): `A:\ISR\mvp\dbbackup6-11-07-pre-migration`, 24,783 documents, same counts as the first backup.
- **Deploy** (author): `firebase deploy --dry-run` passed; it also enabled the Cloud Functions, Eventarc and Firebase Extensions APIs (Cloud Functions had been off, so no functions were live before). The real deploy released the rules and hosting, but the three functions failed to build: the build ran as the default Compute Engine account `607980677162-compute@developer.gserviceaccount.com`, which had no roles (the project is in an organization, which no longer grants that account rights automatically).
- **Fix** (author): granted that account `roles/cloudbuild.builds.builder` (build) and `roles/datastore.user` (the functions run as it and read Firestore); deleted the three functions left in state FAILED; redeployed. `analyzeIssue`, `checkIssue`, `createIssue` created (Node.js 22, 2nd gen, us-central1); an empty POST returns HTTP 400 (public, running). Container image cleanup policy: 1 day.
- **A2 live**: dry run (agent) identical to the `claude_export/` dry run; applied (author): 3,135 updates; second dry run: no changes. Report `specs/tasks/A2-migration-report-live.md`.
- **A3 live**: dry run (agent): 73 publics, 1,200 members; the app-written public `7P45rAMiYJILlWsiFeaW` was skipped because its 25 member docs store `user_id` as text while `users` stores numbers (the export had converted them, so the rehearsal did not show it). Applied (author): 1,200 updates; second dry run: 73 up to date, no changes. Report `specs/tasks/A3-migration-report-live.md`.
- **Follow-up** (branch `r0-followup`): both migrations now normalise member user ids at load (`norm_uid`); 2 new tests. A live dry run with the fix recomputes `7P45…` (25 members, nearest anchor home) with no change to G, relevance or ISR; applying it only adds `G_anchor_type`.
- **A3 for `7P45…`** (author, after #3): 25 updates, nearest anchor home, no change to G, relevance or ISR. Report `specs/tasks/A3-migration-report-live-2.md`.
- **Hosting was not live**: the first combined deploy uploaded the site but never released it (Firebase releases hosting only when the whole deploy succeeds); the live channel's last release was 2026-05-26 and served "Site Not Found". `firebase deploy --only hosting` released it. Runbook lesson: after a failed combined deploy, deploy hosting separately.
- **Smoke test**: login by adopting a profile works; **Check failed** with HTTP 500: "Memory limit of 256 MiB exceeded with 268 MiB used" (`checkIssue`). Live `user_vectors` documents hold every skill vector besides the profile vector; the emulator seed had profile vectors only and the emulator has no memory limit.
- **Fix** (branch `r0-memory-fix`): `checkIssue` and `createIssue` read only `uid` and `profile_vector` (`getAll` with `fieldMask`) and run with 512 MiB. Emulator check: same 123 members and S values. `firebase.json`: hosting ignores `scratch/**` (57 developer scripts had been published; no secrets in them).
- **Open**: merge, `firebase deploy --only "functions,hosting"`, then the smoke test again.

## A3: option fields, G anchors, places in D (2026-11-05)

Branch `a3-options-and-g-anchors` (from `a2-expertise-cleanup`). Spec: `specs/tasks/A3-options-and-g-anchors.md`. Decisions: PD-8; author answers of 2026-11-05.

### What changed

**Options** (`prototype/js/options.js` new, `main.js`, `index.html`).
- The "Propose Decision Option" form asks for Cost (stored in the as-built field `budget`), Funding source and Resources needed (a list of plain text), money first. These fields are option content: no score reads them, and numbers in them are fine.
- The form shows the issue's analysed needs (`resources_needed`, money first) read-only as guidance.
- Option cards, the option window and the voting view show cost, funding source and resources; older options show "not stated". The new texts are HTML-escaped.

**G** (`functions/geo.js` new). d is the distance to the nearest of home, work and property; the G formula and the μ + 3σ cutoff are unchanged. Used by `checkIssue`, `createIssue`, the map preview, the unused browser copy `relevance.js` and `relevance_evaluator.py` (path B keeps its own μ/σ rule). A user with any anchor is considered; one with none is excluded unless they are the creator or have a place match. Members get `G_anchor_type`.

**D** (`functions/demographics.js` new).
- The Analyzer's `demographic_rules` gets `places` (companies, organisations or properties the issue is about) and `property_kinds` (`flat`, `house`, `land`, `garage`, `commercial`, `other`). Derived like every parameter; cleaned on the server.
- A match on a `work` place name or a `property` entry (name or kind) is a cause to include: D = 1, and the distance cutoff and the `features` check do not drop the person. The age, employment and family checks still apply. Members get `D_match`.
- `features` is also matched against interests (names of `activity` skills). D stays pass/fail (soft D is PD-1, separate).
- Path B (`relevance_evaluator.py`) keeps its category heuristics; a place match gives D = 1.
- `users` are read with `skills` and `features` so interests can be matched.

### Tests

- `python -m unittest discover -s tests`: 31 OK, 1 skipped unless the pre-A3 file is supplied (shared D/G fixture; path B unchanged when home is nearest, also against a copy of the pre-A3 file; weight recovery, identifiability, recomputation).
- `cd functions && npm test`: 16 OK (shared fixture; G formula against the as-built code; option validation, escaping, "not stated", needs ordering).
- Emulator: a Check at the Argo Industry site gave G from `work` for all 25 previewed members. A proposed option with cost, funding source and two resources was stored and shown on the card and in the option window. The voting view was not checked in the browser (the pane was hidden); it uses the same tested display helper. For that test, `issues/179` in the emulator was overwritten with test data (emulator only).

### Existing publics: recomputed where possible (R16a, author decision 2026-11-05)

The stored G of current members cannot be reproduced from the stored data (`specs/tasks/A3-impact-report.md`). It was computed from discussion locations and `affection_distance` values written by seed scripts that are no longer stored. The author chose to recompute the publics whose issue has a stored location, μ and σ with the server formula, accepting that G changes for most of their members, not only through the new anchors.

`scripts/migrate_a3.py` (dry run by default; emulator only unless `--project … --i-know-this-is-live`; run after `migrate_a2.py`). Report: `specs/tasks/A3-migration-report.md`.
- Recomputed: 74 publics, 1,229 members (export; 1,225 on the emulator after A2). Unchanged: the 112 publics without a stored location, and 6 publics whose G weight cannot be recovered from the stored values (109, 140, 142, 150, 162, 48).
- Relevance weights: from the issue for 8 publics, recovered (non-negative, sum 1, reproducing the stored relevance within 0.002, G weight unique) for 66.
- Nearest anchor: home 1,083, work 146, property 0.
- G changed for 1,125 members: 981 with home nearest (replacing the non-reproducible stored G) and 144 through a work anchor.
- Relevance changed for 1,124 members: median −0.160, 5% −0.700, 95% +0.700, mean |change| 0.404. Nobody falls to 0.15 or below. Membership is unchanged.
- ISR changed for all 1,179 members with ISR: median −0.125, mean |change| 0.284.
- Not changed: the cached `relevance_scores` / `isr_scores` maps on discussions and issues (tally numbers, A1); D, S and X.
- Emulator: applied after A2; a second run finds all 74 publics up to date and changes nothing.

### Author's steps (not done by the agent)
1. After the A2 live migration: `python scripts/migrate_a3.py --source firestore --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live` (dry run), then the same with `--apply`.
2. Deploy the functions and the prototype (no Firestore rules change).

### Not changed
- No places or property kinds exist in the data yet, and there is no profile flow to register property. Without a Gemini key the fallback derives empty `places`, so the place rule is exercised by the tests only.
- D for `features` stays pass/fail; `users.features` is empty for everyone.

## A2: Expertise clean-up, read-only parameters, data migration (2026-11-04)

Branch `a2-expertise-cleanup` (from `docs/specs-restructure`). Spec: `specs/tasks/A2-expertise-cleanup.md`. Decision: PD-8 (supersedes PD-2).

### What changed

**Expertise.** E = max(min(age, 30)/30, Σ education cos^CBC × P) + Σ experience cos × P. No resources part, no weights, no contemporary importance, no age penalty. The age is taken at the issue's registration moment and is not stored. Reference implementation: `scripts/expertise.py` (education and experience arithmetic ported unchanged from `scratch/backfill_expertise.py`; `activity` skills no longer count).

**Nobody types a number.**
- `functions/ai-helper.js`: the prompt, the normaliser and the keyword fallbacks no longer produce expertise weights, `contemporary_importance`, `age_penalty_threshold` or resource reasoning; those fields are stripped even if the model returns them. `resources_needed` (money included) stays: it describes what the issue needs and feeds the options. The prompt accepts a clarification of the context.
- `functions/params.js` (new): what the server trusts. The browser sends only text (title, description, location, submitter, clarification).
- `checkIssue`: derives all parameters on the server and stores them as a draft in the new server-only collection `issue_drafts`. The old `recalculate: true` path, which took μ, σ and every weight from the browser, is gone.
- `createIssue`: reads every number from the draft (`draftId`); refuses a missing (400), foreign (403), unknown (404) or stale draft (409, title or description changed after Check). Drafts are single-use. Accepts the deadline text (`ends`).
- `createIssue` used `admin.firestore.FieldValue` / `GeoPoint`, which are undefined in the functions emulator runtime; it now imports them from `firebase-admin/firestore`. The endpoint had not been called by the UI before.
- UI (`prototype/js/modals.js`, `main.js`, `index.html`): the relevance, ISR and expertise windows show the derived values read-only with the AI reasoning. The number inputs (relevance weights, ISR weights, expertise weights, minimum years) are gone, and μ / 3σ on the map are read-only. One text field "Clarify the context" and a "Derive again" button replace them. The expertise window shows education and experience without weights, and what the issue needs "for the options, not anyone's weight".
- The browser no longer derives parameters (the local keyword fallback in `main.js` is removed) and no longer writes new issues to Firestore itself: Create calls `createIssue`. Without the server, nothing can be checked or published.
- `prototype/js/main.js`: opt-in switch `?emulator=1` (localhost only) to use the Firestore emulator.

**`birthDate` required.** `seed_db.py` refuses profiles without a valid `YYYY-MM-DD` date and names the uids.

**Tooling.** `firebase.json`: Firestore emulator on port 8080. `scripts/seed_emulator.py` loads `claude_export/` into the emulator (refuses without `FIRESTORE_EMULATOR_HOST`). `scripts/migrate_a2.py`: dry run by default, emulator only unless `--project … --i-know-this-is-live`.

### Data (emulator only; the live project is unchanged)

Report: `specs/tasks/A2-migration-report.md`.
- 3,045 members recomputed. `resources_expertise` deleted from all of them; it was > 0 for 886.
- Education part raised to the age floor: 1,923 members.
- E higher for 1,559 and lower for 622 members (by more than 0.001).
- ISR changed by more than 0.001 for 2,948 members. Median change 0; 90% of changes within ±0.133; extremes −0.593 and +0.412; mean |change| 0.057.
- Expertise-weight fields deleted from 80 issues and 2 discussions.
- 4 memberships removed (author decision): users 9119 (publics 90, 172) and 9124 (91, 97) were born in 2025, after those issues were registered. Their docs, their entries in the discussion maps and 1 from each `member_count` were removed.
- Skipped: 2 app-created publics (`7P45rAMiYJILlWsiFeaW`, `muhSxCg3KQCiyon46dua`, 50 members) that never had Expertise or ISR.
- A second run after `--apply` changes nothing.

### Deviations from the spec

1. **The migration uses the stored education and experience parts, not the vectors.** The issue vectors the parts came from are no longer stored (EMBEDDINGS.md fact 12). Both parts are unchanged under A2, so E is recomputed exactly. AC1 was therefore checked as a consistency check: the stored values are reproduced from the stored parts (E max error 0.001, ISR 0.0008).
2. **ISR weights are recovered from the stored values.** The discussions no longer carry the weights the backfill used. Each of the 190 publics matches exactly one of the three as-built triples: (0.4, 0.3, 0.3) × 133, (0.4, 0.2, 0.4) × 49, (0.5, 0.2, 0.3) × 8, as in IF l.100. This keeps the author's decision to use the weights as built.
3. **`discussions.isr_scores` is not recomputed.** It is the vote-tally number (1.5 × floored relevance, IF l.101), which belongs to A1. Only the entries of the 4 removed memberships are deleted from it.
4. **Approved additions:** the `issue_drafts` collection and draft-based `createIssue`; removal of members born after the issue's registration; `npm test` (`node --test`) in `functions/`.
5. **Not in the spec but required for AC6:** the `FieldValue`/`GeoPoint` import fix and the `?emulator=1` switch.

### Known gaps left as they are (not fixed by A2)

- The ISR weights of 190 of 192 seeded publics are the old keyword-rule triples, not Analyzer-derived weights. The docs now say there is no fallback (C-21); replacing them needs the Analyzer task.
- The backfill never applied experience recency decay; A2 keeps the as-built arithmetic.
- Without a Gemini key the server uses keyword rules, which ignore the clarification text. With a key the clarification goes into the prompt.
- `createIssue` forms a public of up to 100 members while Check previews 25 (C-08, as built).
- The live project still has the old fields until the author runs the migration there.

### Tests

- `python -m unittest discover -s tests`: 16 tests, OK (age, floor, docs worked examples, activity skills excluded, CBC, idempotence, weight recovery).
- `cd functions && npm test`: 7 tests, OK (no obsolete fields in AI output; body numbers never reach the parameters; draft checks; clarification).
- Emulator, end to end: Check → read-only windows → "Derive again" (clarification stored with the draft) → Create. The issue carries the draft's numbers. A forged request with μ = 9999 and other weights still produced μ = 40 and the derived weights. Missing draft, changed text and draft reuse are refused.

### Author's steps (not done by the agent)

1. Fresh export: `python export_live_db.py`, then a dry run against it.
2. Live run: `python scripts/migrate_a2.py --source firestore --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`. The live Firestore must have the same 4 memberships and 0 members without `birthDate`; the script stops otherwise.
3. Deploy the functions and the prototype (no Firestore rules change).
