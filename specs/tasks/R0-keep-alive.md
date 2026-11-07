# SPEC R0: Keep the live MVP alive and consolidate A2/A3 (roadmap stage 0)

Status: DRAFT (waiting for author approval)
Branch: r0-keep-alive (from a3-options-and-g-anchors; never main)
Roadmap: [ROADMAP-demo.md](../ROADMAP-demo.md), stage 0. Hard date: the change must be **live by 2026-12-30**.

## 1. Context

| Fact | Evidence |
|---|---|
| The Firestore rules allow every read and write only while `request.time < 2026-12-31` (00:00 UTC). After that every client read and write fails, so the live prototype stops working. | `firestore.rules:5` |
| With open rules, any browser can write `issue_drafts`, the server-only collection that A2 introduced. `createIssue` trusts a draft's numbers, so a forged draft would bypass "nobody types a number". | A2 (`functions/params.js`, `functions/index.js` createIssue) |
| A2 and A3 are implemented on `a3-options-and-g-anchors` (which contains A2). They are not merged, not deployed, and the live data is not migrated. `origin/main` contains PR #1 (`b518bdc`, docs/specs restructure); the branch is 23 commits ahead of it and behind only by that merge commit. Local `main` is 15 commits behind `origin/main`. | `git rev-list` 2026-11-07 |
| The deployed Cloud Function is older than the code (it writes none of the Analyzer-protocol fields). | IF l.20 |
| `export_live_db.py` backs up only `user_vectors` and `user_packs` to `A:\ISR\mvp\dbbackup`; there is no full backup script in the repo. | `export_live_db.py:13-19` |
| There is no CI; tests run only locally (31 Python, 16 Node). | repo |
| The functions emulator warns that `firebase-functions` (^6.1.0) is outdated. | emulator log 2026-11-05 |

## 2. Goal

The live site runs the A2/A3 code on migrated data, keeps working after 2026-12-31, cannot be fooled through `issue_drafts`, and every push runs the tests.

## 3. Non-goals

- No access model yet: the rules stay open for the rest of the data (authentication and write restrictions are roadmap stage 5).
- No AI model change (stage 1), no ISR or tally change (stage 2), no data clean-up (stage 3).
- No `firebase-functions` or SDK upgrade, unless the deploy fails without it (then stop and ask).
- The agent does not deploy, does not touch the live project and does not push or merge without the author's word. Those are the author's steps in §6.
- No edits under `docs/`.

## 4. Requirements

- **R1 Rules.** New `firestore.rules`:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // R0: open prototype access until <EXPIRY>, except the server-only issue_drafts.
      // Replaced by real access rules in roadmap stage 5.
      match /{collection}/{document=**} {
        allow read, write: if request.time < timestamp.date(<EXPIRY>)
                           && collection != 'issue_drafts';
      }
    }
  }
  ```
  `<EXPIRY>` is the author's choice (open question 1). The Admin SDK (Cloud Functions, scripts) is not affected by rules.
- **R2 Rules test.** `scripts/check_rules_emulator.py`: unauthenticated REST calls against the Firestore emulator (rules apply to them; the Admin SDK bypasses them). Checks: read and write in `users`, `discussions`, `discussions/{id}/messages`, `issues`, `microcommunity_members` are allowed; read, create, update and list in `issue_drafts` are denied. Refuses to run without `FIRESTORE_EMULATOR_HOST`.
- **R3 CI.** `.github/workflows/tests.yml` on push and pull request: Python 3.11 with `numpy` → `python -m unittest discover -s tests`; Node 22 → `npm ci` and `npm test` in `functions/`. No secrets, no deploy step, no network calls in tests (the tests already force the AI fallback).
- **R4 Backup.** `scripts/backup_firestore.py`: read-only, full JSON backup of every top-level collection and every subcollection (paged, resumable per collection) into a folder the author names. Refuses a folder inside the repository (the backup holds the synthetic `email` and `password` fields). Prints counts only. Tested against the emulator: counts equal the seeded counts.
- **R5 Migration runbook check.** Run the full sequence on the emulator exactly as §6 prescribes for live (seed → backup → A2 dry run → A2 apply → A3 dry run → A3 apply → second runs change nothing) and record the counts.
- **R6 Deploy readiness.** Without deploying: `functions/` loads with the production config (no emulator variables); `firebase.json` deploy targets are `firestore:rules`, `functions`, `hosting`; the prototype's `?emulator=1` switch is inert outside localhost (code check). Record the `firebase-functions` and `firebase-tools` versions and the outdated warning in CHANGES.
- **R7 Merge.** One pull request from `r0-keep-alive` (containing A2, A3 and R0) into `main`, opened on the author's request, with the CI green. Merge commit (not squash), so the A2/A3 steps stay traceable for the paper.
- **R8 Specs.** README (tasks table, C-46 note about rules), `02-data-model.md` (`issue_drafts` not client-accessible), CHANGES.md, this status log.

## 5. Acceptance criteria

- AC1 `check_rules_emulator.py` passes on the emulator with the new rules (allowed and denied cases as in R2).
- AC2 The prototype on the emulator works with the new rules: Check → Create, propose an option, open discussions and voting (manual run, `?emulator=1`).
- AC3 The CI workflow passes on the pull request.
- AC4 `backup_firestore.py` on the emulator: every collection and the `messages` subcollection backed up, counts equal the seed; refuses a path inside the repo.
- AC5 The §6 sequence runs end to end on the emulator with the expected counts (A2: 3,045 members recomputed, 4 removed; A3: 74 publics, 1,225 members) and both second runs change nothing.
- AC6 No deploy, no live read or write, no push or merge by the agent; no file under `docs/` changed.

## 6. Author's runbook (live; after approval of the pull request)

Target: done by **2026-12-15**, leaving two weeks before the rules expire.

1. **Merge** the pull request into `main`; update local `main` (`git pull`).
2. **Backup**: `python scripts/backup_firestore.py --project project-a3d59130-5adf-4677-9e2 --out <folder outside the repo>`. Keep the folder; it is the rollback point.
3. **Deploy together** (the new UI needs the new `createIssue`, and the rules protect the drafts): `firebase deploy --only "firestore:rules,functions,hosting" --project project-a3d59130-5adf-4677-9e2`.
4. **Migrate A2**: dry run with `python scripts/migrate_a2.py --source firestore --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live`; compare the report with `tasks/A2-migration-report.md`; if it matches, run the same command with `--apply`.
5. **Migrate A3**: the same with `scripts/migrate_a3.py` (compare with `tasks/A3-migration-report.md`), then `--apply`.
6. **Second runs** of both scripts (dry): they must report no changes.
7. **Smoke test** on the live site (a private browser window, hard reload): adopt a profile; Check and Create an issue; the parameters are read-only; propose an option with cost and funding source; open a voting issue. In the browser console, a read of `issue_drafts` must fail with "permission denied".
8. Send the reports and any differences; the agent records them in CHANGES.md and the status log.

**Rollback**: rules, functions and hosting can be redeployed from the previous commit; data can be restored from the step 2 backup with a restore script (to be written only if needed).

## 7. Open questions (author)

1. **Rules expiry date** (`<EXPIRY>`). Proposal: **2027-06-30**, which covers roadmap stages 1-5 (D2 is planned well before); stage 5 replaces these rules. A shorter date forces an earlier review; a longer one risks another silent outage.
2. **Pull request**: should the agent open it (after you approve this spec), or will you?
3. **Backup**: the JSON script (R4) is enough for a synthetic dataset. Do you also want a managed export to a Cloud Storage bucket (`gcloud firestore export`, needs a bucket and billing)?

## 8. Status log

Plan approved: ___  Implementation: ___  Tests: ___  CI: ___  Pull request: ___  Live runbook (author): ___  CHANGES.md: ___  Deviations: ___
