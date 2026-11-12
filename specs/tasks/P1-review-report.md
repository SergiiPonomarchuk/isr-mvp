# P1: review before the pull request (2026-11-12)

P1's existing implementation and committed generated texts were reviewed on branch `p1-profile-review` (code through `a5080b6`, current merge `b29e856`). No source or generated-data changes were needed. This recheck used only the emulator at `127.0.0.1:8080`, project `project-a3d59130-5adf-4677-9e2`, after P2 and A4. No migration was reapplied, no model requests were made, and no live data was accessed.

## Migration and audit

- `python scripts/migrate_p1.py --report scratch/P1-current-dry-run.md`: 9,150 profiles; 0 updates, 0 deletes, 0 pending generation, 0 changed inputs, 0 incomplete stubs. All 5,097 work-experience profiles are already repaired, including after P2 changed their job places.
- Reused `audit_profiles.audit` with the current emulator profiles. All 11,057 work-experience entries have role and field; 0 comments match the original other-person pattern; years are 0.5-79 and 0 profiles exceed age minus 16. All 3,353 activity times remain 1.
- All 297 future graduations are marked `in_progress`; no past graduation has that mark. Graduation ages match the approved level ranges. The job level matches the highest completed education for 5,538 profiles and is empty without one for 3,612; no mismatches.
- Compared every profile's exact set of skill IDs with the original `claude_export/emb_*_ids.json` files: 9,150 profile IDs and 20,245 skill IDs match, with no repeated skill IDs.
- Current A4 `user_vectors.embedding_text_sha256` metadata contains exactly the same 9,150 profiles and 20,245 skill keys, without missing or orphan keys. This is identifier coverage; A4's acceptance reports separately establish vector contents, dimensions and norms. P1's audit CLI still describes its original October export, so current coverage was checked explicitly rather than treating that export as new vector evidence.
- The audit and migration plan are read-only. Neither requires the Gemini key. Their reports and the aggregate comparison output were written under ignored `scratch/`.

## Tests

- `cd functions; npm test`: **47 passed**. Used `NODE_PATH=A:\BackUp\isr-mvp\worktrees\wt-p2\functions\node_modules`; P1 and P2 have byte-identical lockfiles and the old SDK this branch needs. No dependency files changed.
- `python -m unittest discover -s tests`: **70 run, 69 passed, 1 skipped**. The existing optional pre-A3 evaluator comparison needs `A3_ORIGINAL_EVALUATOR`; model calls in P1 tests are mocked.
- The original 18 P1 tests cover education repair, job level, generated work entries, year limits, input-change holds, idempotence, packs, model validation, resumability and failed-call stopping.

## Remaining author step

AC1-AC3 and AC5 remain passed. AC4 is pending on live: backup, P1 apply using the committed generated records, rebuild existing `user_packs`, then read-only audit. Coordinate P1 with P2 and the A4/U6/U8/A5 deployment and A4 re-embedding; the existing live vectors must not be treated as current after profile repair. See `HANDOFF.md` for the queue. No deploy or live apply is included in this PR.
