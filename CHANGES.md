# CHANGES

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
- **Open**: the A3 apply for `7P45…` after this follow-up is merged; the smoke test (runbook step 8).

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
