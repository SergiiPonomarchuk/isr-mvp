# Integrated release checkpoint: 2026-11-12

Status: **M0 integration complete; live rollout pending author prerequisites.**

- Release: `47e835acd1eefd83b75e8dcd232283c4970fb831` (A5 PR #24 merged).
- Annotated tag: `isr-mvp-rc-2026-11-12`, pushed to origin.
- Integrated PRs: P1 #25, P2 #23, A4 #20, U6 #21, U8 #22 and A5 #24. Each received an explicit author merge instruction.
- Main push CI: [successful release run](https://github.com/SergiiPonomarchuk/isr-mvp/actions/runs/43235853076).
- Planning/runbook documentation remains in PR #26, separately subject to the author's merge instruction.

## Code and local environment

The serving application, functions, rules and A4 scripts were byte-identical between the accepted A5 preview `0ff325b` and merged release `47e835a`. P1/P2 scripts, committed generation/plan artifacts and their tests are now included together. Merge conflicts were resolved in documentation; no new executable change was needed during final reconciliation.

Exported the emulator successfully, stopped it, checked that its ports were closed, checked out the clean detached release in `C:\isr-mvp`, and restarted Firestore/functions/hosting with Java `-Xmx8g`. The local page returned HTTP 200; the emulator hub lists Firestore 8080, functions 5001 and hosting 5000.

Saved export timestamp: **2026-11-12 14:20:56 UTC** (metadata file's write time). A frozen copy is preserved at:

`A:\BackUp\isr-mvp\emulator-snapshots\2026-11-12-integrated-47e835a`

All **8 files / 550,379,033 bytes** were copied and compared by SHA-256 with the exported source. This named checkpoint is separate from the daily `.emulator-data` folder.

## Verification on the actual merged release

- `cd functions; npm test`: **98 passed**.
- `python -m unittest discover -s tests`: **105 run, 104 passed, 1 skipped**. Existing optional pre-A3 evaluator comparison requires `A3_ORIGINAL_EVALUATOR`; mocked API failures in test output are intentional.
- Read-only full vector scan after restart: **9,150 profiles / 20,245 skills**, all finite, **768-dimensional unit vectors**; maximum norm error `1.9984014443252818e-15`. All current texts/model/template/task metadata match.
- Independently checked the **two migrated publics / 50 members** against actual `functions/isr.js`: education, experience, E and rounded ISR match; both issue/discussion score maps match. This is not a claim that all historical seeded publics were recomputed.
- Replayed captured P2 parameters against the current users and actual D/G/parameter modules: before **1,033 nearby + 3,908 unrelated-owner bypasses**; after **1,033 nearby + 0 unrelated bypasses**. **138** retained candidates use property as their nearest anchor; this is not exclusively a landlord count. These are candidates before the existing membership cap.
- Emulator dry runs: P1 **9,150 profiles, 0 updates/deletes/pending**; P2 **9,150 done, 0 to write/held/problems**. No migration applied.
- Browser on `?emulator=1`, synthetic uid 1189: profile shows the h5 home, flat and garage; work experience has repaired own-work descriptions and durations. New issue form starts at `[47.590114, 7.611201]`. All **12 visible tile images** loaded from OpenStreetMap with credit. Selecting the garage sets `[47.589962, 7.610119]` and source label `set by you`; derived distance/fade inputs are read-only.
- No Check/Create/model request or database write during this release browser check. Full endpoint behavior remains covered by the saved U6/A5 acceptance reports, unchanged executable bytes, and the current regression suite. No new embedding API usage or geocoder lookup.

Recheck helpers and aggregate outputs are under ignored `scratch/`; P1/P2 reports are under `scratch/release-47e835a/`. The saved behavioral reports remain [U6](U6-emulator-report.md), [U8](U8-emulator-report.md), [A5](A5-emulator-report.md) and [P2](P2-acceptance-report.md).

## Read-only live preflight

P1's existing projection/repair planner read live without apply/generation:

| Measure | Observed |
|---|---:|
| User documents | 9,151 |
| Complete synthetic profiles planned | 9,150 |
| P1 updates proposed | 8,803 |
| Deletes proposed | 0 |
| Missing generation / changed inputs | 0 / 0 |
| Incomplete profile retained untouched | 1 |
| Existing user packs | 37 |
| Repaired totals over the years limit | 0 |
| Database writes / model calls | 0 / 0 |

A separate projection confirmed `users/None` is absent on live. The other incomplete profile is not reclassified as that historical stub or deleted. No names, emails, passwords, tokens or other profile values were emitted or saved by this preflight; only aggregate counts/field-presence checks.

P2 must preview against the repaired live state after the author's P1 apply; a pre-P1 source-hash mismatch must not be worked around. Live embeddings and the deployed code remain to be updated by the author.

## Next gate

Use [the live rollout runbook](../LIVE-ROLLOUT.md). Before live apply, establish/rehearse recovery of the private full backup. The repository contains `backup_firestore.py` and its typed JSONL format, but no general restore utility; `restore_names.py` is not a full restore tool. Recording a backup is not yet evidence of a successful recovery rehearsal.

No deployment, rules edit, production write or fresh paid model call occurred in this checkpoint. D1 remains behind the approved live prerequisites.
