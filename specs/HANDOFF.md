# Handoff: state and next steps (2026-11-11)

Claude Code wrote this file when development moved to Codex for about a month. The rules for agents are in `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code). Each step below points to its spec, whose Status log holds the details.

**Update this file** when a step is done or the plan changes.

## Current checkpoint: U10 approved and implemented, 2026-11-13

- Author accepted explicit joins beyond 100 and instructed applying U10. Feature branch `codex/similar-active-issues` is based on proposal PR #31; neither PR is merged by that instruction.
- Implemented similar active matches at Check, Open/status, explicit discussion Join, explained separate creation, final transactional recheck and completed-Create replay. See [U10](tasks/U10-similar-active-issues.md) for calibration, schemas and verification limits.
- Required suites: Node 105 passed plus optional emulator skip; Python 111 run, two existing skips. Browser automation cannot start (security-environment runtime error); author confirmed duplicate Check and Join to 101 in the isolated preview. Author confirmed the remaining original browser steps, then approved active-only title uniqueness and removing Continue. Author accepted the revised single-Create UI; a read-only emulator check confirms the separate rear-entrance issue was created. The real-handler emulator test passed, including concurrent Create (one success/one 409), atomic rollback/retry and a 102-member public. Evidence is recorded in U10's status log.
- Next: review implementation [PR #32](https://github.com/SergiiPonomarchuk/isr-mvp/pull/32), stacked on #31, after explicit merge authorization for parent PR #31. Revised emulator acceptance is complete; live deployment remains the author's step after merging. The synthetic manual preview currently runs on port 5001 with Firestore 8080 (demo-u10); no saved main data was imported. PR #32 Node/Python CI passed on the published implementation. Merge only on explicit PR instructions; PR #28/#29/#31 remain separately unmerged. No agent deploy or production writes. D1 must add the approved duplicate/member/nonmember scenarios to its spec before changing seed data.

## U9 accepted live, duplicate flow proposal, 2026-11-13 (historical)

- U9 PR #30 merged at `b189d3f`, deployed by the author and checked read-only. The author confirmed the saved member list works and the new Check badge/sample labels behave as specified.
- The author requires Check to show similar registered active issues and offer Join for a nonmember. This intent already appears in the Request Guide. [U10](tasks/U10-similar-active-issues.md) proposes the implementation behavior, matching calibration and acceptance cases. Detailed cap/lifecycle choices await review.
- Next is author review of the documentation proposal. PR #28/#29 remain separately subject to explicit merge instructions. D1 must reflect the accepted duplicate/join flow before its scenarios are changed.

## Live member UI findings fixed on feature branch, 2026-11-13 (historical)

- Live P1/P2, A4 embeddings and the three-public migration passed read-only checks. All 9,150 profile and 20,245 skill vectors are current. All 150 migrated member scores/maps match the Node implementation.
- The author created the live entrance-lock test issue. Topic `46AQ1D2KJu5sAk7sQMli` has 100-entry relevance and ISR maps. The author saw 25 at Check and 100 at Create, then a stuck member popup.
- [U9](tasks/U9-member-preview-popup.md) fixes the preview badge/sample labeling and moves the values helper into shared scope. Cached members render immediately while existing reads run, with stale completion guarded. Regression suites and isolated browser fixture passed. Full application acceptance remains pending deployment.
- Next: open/review U9 PR, merge on explicit author instruction and give full deployment commands from the clean deploy worktree. PR #28/#29 also remain unmerged pending explicit instructions. Agent deployment/live writes remain prohibited.

## Firestore recovery rehearsal, 2026-11-12 (historical)

- Plan and workflow PR #26 merged at `cb8d001`. The preview runs release `47e835a`.
- Recovered all 24,783 documents from the November 7 pre-migration backup on a separate local emulator. Every path and typed document body matched on read-back. See [recovery evidence](tasks/M1-firestore-recovery.md) and [the author's repeatable procedure](LIVE-ROLLOUT.md#2-backup-and-recovery-prerequisite-author).
- Next: merge the recovery branch on the author's explicit PR instruction. The author then chooses the live window, confirms Gemini billing/budget, takes a fresh full backup and rehearses that archive before P1. D1 still depends on the live rollout.

## Integrated release verified; live preparation, 2026-11-12 (historical)

- Follow `AGENTS.md` through ready work without routine approval pauses. The next author action in the approved plan is the merge instruction for PR #26.
- **All implementation PRs are merged:** P1 #25 (`6d252c2`), P2 #23 (`a17d5cd`), A4 #20 (`76c50c8`), U6 #21 (`6b6ae7a`), U8 #22 (`996e7b8`), A5 #24 (**`47e835a`**). Each received explicit author merge authorization. Release tag `isr-mvp-rc-2026-11-12` is pushed; main CI passed.
- **M0 integration is complete.** On merged main: Node 98 passed; Python 105 run, 104 passed and one existing optional skip. Restored/exported data verified: 9,150 profile / 20,245 finite unit skill vectors, 50 canonical E/ISR results/maps, A5 captured replay (3,908 unrelated bypasses removed, 1,033 retained), P1/P2 dry runs with zero changes, and fresh read-only profile/map browser checks. See [release evidence](tasks/INTEGRATED-release-2026-11-12.md).
- **The preview remains running** from clean detached main `47e835a` in `C:\isr-mvp`, Java heap 8 GB. Successfully exported before restart at 2026-11-12 14:20:56 UTC. Named frozen copy: `A:\BackUp\isr-mvp\emulator-snapshots\2026-11-12-integrated-47e835a` (all 8 files, 550,379,033 bytes, hash verified). Do not overwrite this milestone with daily work.
- Read-only live P1 preflight: 9,151 documents / 9,150 complete profiles; **8,803 updates proposed, 0 deletes, 0 missing generation/changed inputs**, 37 existing packs. One extra incomplete profile is retained untouched; `users/None` is absent. No live mutation or model request.
- [Approved development plan](DEVELOPMENT-PLAN.md) and [concrete live runbook](LIVE-ROLLOUT.md) are brought current in **PR #26**. That documentation PR is not yet merged and requires its own `merge PR 26` instruction. Its main reconciliation changes documentation only.
- **Before any live apply:** establish/rehearse recovery of the private full backup; the repo has a typed JSONL backup script but no general restore utility. Confirm the author's execution window and Paid/budget status. The runbook keeps these as prerequisites, not completed steps. Agents do not read backup credential fields or perform live apply/deploy.
- Then the author coordinates backup, P1/P2 live apply, secret/deploy from clean `wt-main`, live embeddings and A4 public migration; Codex verifies read-only. D1 still waits for those approved live prerequisites. Preserve A5 in the code deployment for P2 locality. No live writes, deploys, rules edits or new paid AI calls in this checkpoint.

All earlier checkpoints and original resume commands below are historical; the current plan/runbook govern next work.

## Initial plan approval checkpoint, 2026-11-12 (historical)

- **P1 PR #25 is merged** into main as `6d252c2`; final CI passed. Its live AC4 remains the author's step.
- The author requested and approved the overall and detailed development plan (2026-11-12: "Approved."). [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md) proposes milestones, the remaining merge/release sequence, detailed D1 work, later guardrails/access/pilot stages, estimates, model choices and decision gates. Its execution order is approved; later task-specific design decisions, explicit PR merge instructions and author-only live actions remain as specified.
- **P2 #23 reconciled with main at `0c2f336`.** Only CHANGES/HANDOFF conflicted; both records retained and migration source/data unchanged. Combined tests: Node 47 passed; Python 84 run, one existing optional skip; both emulator dry runs propose zero changes to 9,150 profiles. Verify pushed-head CI and request explicit `merge PR 23`. A4 #20 still needs reconciliation; remaining code order #20 -> #21 -> #22 -> #24. P2's live acceptance/deployment remains tied to A5.
- The A5 preview was restored from the saved snapshot after PR #25 merged. Hosting returned HTTP 200 and functions/Firestore were ready. The serving checkout remains detached at `0ff325b`; do not switch it incidentally. Snapshot remains the 2026-11-12 06:36 UTC export.
- This planning change edits documentation only. No new application code, data migrations, model calls, rules edits or deploys. D1 implementation still waits for its approved prerequisites: P2 applied and A4/U6 live.

## A5 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 22`; **U8 is merged as `996e7b8`**, after P1 #25, P2 #23, A4 #20 and U6 #21. The reviewed merge-head CI passed. No live operations follow automatically.
- A5 PR #24 now targets main and is reconciled with it. Only CHANGES and the index conflicted; all histories and a single current A4 index row are retained. A5 application/prompt/guard/Create behavior, frontend, dependencies, rules, A4 scripts and fixture are unchanged from accepted head `0ff325b`; P1/P2 source/data match main.
- Combined verification: **Node 98 passed; Python 105 run, 104 passed and one existing optional skip**. Saved A5 captured-result and p4 endpoint evidence is `tasks/A5-emulator-report.md`, with the original P2 failure retained. No new model/Nominatim requests or database writes for this documentation reconciliation. CI is checked on the pushed head.
- Next: explicit author `merge PR 24`, then complete the integrated release checkpoint, bring the approved plan documentation PR #26 current and prepare the concrete live runbook. PR #26 still needs its own explicit merge instruction. Do not begin D1 before its live prerequisites.
- Preserve the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 2026-11-12 06:36 UTC saved export and 8 GB Java heap. Final integrated release verification may intentionally export/stop and restart it on the merged release; do not switch it incidentally.
- Live P1/P2 apply, A4 phase D, U8 AC3 and the combined code deployment remain the author's steps. A5 must be included for P2's building locality; D1 waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and original resume commands below are historical.

## U8 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 21`; **U6 is merged as `6b6ae7a`**, after P1 #25, P2 #23 and A4 #20. The reviewed merge-head CI passed. No live changes follow automatically.
- U8 PR #22 now targets main and is reconciled with it. Only CHANGES and the index conflicted. Map/frontend/backend source, dependencies, existing rules and A4 migration code remain unchanged from accepted U8 head `0eddbc6`; imported P1/P2 source/data match main. main.js bytes, including CRLF and the final CR, are retained.
- Combined verification: **Node 91 passed; Python 105 run, 104 passed and one existing optional skip**. Existing map/browser AC2 evidence is `tasks/U8-emulator-report.md`. No new API requests or data writes for this documentation reconciliation. CI is checked on the pushed head.
- Next: explicit author `merge PR 22`; then retarget/reconcile A5 PR #24 to main and verify it. The approved plan documentation PR #26 remains unmerged and needs its own explicit merge instruction when ready. Final integrated release checks follow the code stack.
- Keep the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 2026-11-12 06:36 UTC saved snapshot and 8 GB Java heap. Do not switch serving code incidentally.
- U8 live AC3 and the A4/U6/U8/A5 deployment remain the author's steps, coordinated with P1/P2 live apply and A4 re-embedding. P2's locality acceptance depends on A5. D1 still waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and original resume commands below are historical.

## U6 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 20`; **A4 is merged into main as `76c50c8`**, after P1 #25 and P2 #23. All merge-head checks passed. No live migration or deployment follows automatically.
- U6 #21 now targets main. Reconciled main into its feature branch; only CHANGES conflicted. Preserved all task records. U6 application/frontend/location/geocoder code, dependencies, existing rules and A4 migration code are unchanged from the already accepted U6 head `7bbfd45`; imported P1/P2 source/data match main.
- Combined verification: **Node 88 passed; Python 105 run, 104 passed, one existing optional skip**. Existing U6 AC2-AC5 evidence is `tasks/U6-emulator-report.md`. No new model/Nominatim calls, writes or paid acceptance runs are required for this source-preserving reconciliation. CI is checked on the pushed head.
- Next: author explicitly instructs `merge PR 21`; after it merges, retarget/reconcile U8 #22 to main, then A5 #24. The approved plan documentation PR #26 remains unmerged; it needs its own explicit merge instruction when ready.
- Keep `C:\isr-mvp` serving A5 `0ff325b` and the saved 2026-11-12 06:36 UTC snapshot with 8 GB Java heap. Do not switch the serving checkout as a side effect of integration.
- Live P1/P2 apply, A4 phase D and the combined A4/U6/U8/A5 deployment remain the author's steps. P2 building acceptance depends on A5. D1 still waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and resume commands below are historical.

## A4 reconciliation checkpoint, 2026-11-12 (historical)

- The author approved the development plan in [PR #26](https://github.com/SergiiPonomarchuk/isr-mvp/pull/26), then explicitly instructed `merge PR 23`. **P2 is merged as `a17d5cd`**, after P1 #25 (`6d252c2`). This is source integration, not a live migration or deploy.
- A4 #20 is reconciled with that main. Conflicts were limited to CHANGES, this handoff and the index. P1/P2 source and generated artifacts remain identical to main; A4 source, examples, models, dependencies and existing rules are unchanged by reconciliation.
- Combined verification passed: Node 57; Python 105 run, 104 passed and one existing optional skip. Key-free read-only check: all 9,150 profiles current, 20,245 skill hash keys, no texts/requests needed; phase C has no placeholder publics, updates, new vectors or requests. Existing AC5/AC6 evidence remains applicable. CI is checked on the pushed head before presenting #20. Do not restart paid generation or migration apply.
- Next: explicit author merge instruction for A4 #20, then retarget U6 #21 to main, reconcile/verify it, followed by U8 #22 and A5 #24. The plan documentation PR #26 is still unmerged and also needs its own explicit instruction.
- Preserve the running A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with its saved 2026-11-12 06:36 UTC export and 8 GB Java heap. Do not switch the serving checkout as a side effect of this integration.
- Live P1/P2 apply, A4 phase D and the coordinated code deploy remain the author's steps. Include A5 for P2's accepted building locality. D1 waits for P2 applied and A4/U6 live. No deploys, live writes, fresh API calls or rules edits in this reconciliation.

The checkpoints and original resume commands below are historical; this checkpoint governs next work.

## P2 reconciliation checkpoint, 2026-11-12 (historical)

- The author approved the [overall/detailed development plan, PR #26](https://github.com/SergiiPonomarchuk/isr-mvp/pull/26). Approval authorizes its next implementation work; PR merges still need explicit `merge PR N` instructions. The documentation PR itself is not merged by that approval.
- P1 PR #25 is merged into main as `6d252c2`. P2 PR #23 has been reconciled with that main; only CHANGES and this handoff conflicted, and both historical records are retained below. The P1/P2 generated artifacts and migration code remain unchanged.
- Combined local verification passed: Node 47; Python 84 run, 83 passed and one existing optional skip. Emulator dry runs: P2 9,150 done, 0 to write/held/problems; P1 9,150 profiles, 0 updates/deletes/pending. CI is checked on the pushed head before presenting #23 for merge. Do not rerun migration apply or regenerate content.
- Remaining order: author-approved merge of P2 #23, then reconcile/integrate A4 #20 -> U6 #21 -> U8 #22 -> A5 #24. A4 currently needs reconciliation with main. Retarget stacked children to main after their parents merge and check the resulting heads.
- P2 emulator AC3/AC4 passed on the A5 stack. Its live deployment dependency on A5 remains explicit; P1/P2 live migrations and A4 phase D are the author's coordinated steps. D1 still waits for P2 applied and A4/U6 live.
- Preserve the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 8 GB emulator. Saved export: 2026-11-12 06:36 UTC; the preview was restored after P1 merged. No serving-code change, API calls, data writes or live operations are needed for this documentation reconciliation.

All checkpoints and run-state counts below are historical; this checkpoint governs next work.

## P1 review checkpoint, 2026-11-12 (historical)

- P1 has been rechecked read-only after P2/A4: 9,150 users, zero changes to make, all 20,245 original skill IDs retained. Node 47 passed; Python 70 run with one existing optional skip. No generation or apply rerun. See `tasks/P1-review-report.md`. The author approved PR #25 for merge to main on 2026-11-12 (`merge PR 25`); live AC4 remains the author's step.
- Code PR dependency order: **A4 #20 -> U6 #21 -> U8 #22 -> A5 #24**. Profile migration PRs: **P1 #25 -> P2 #23**; P2's building acceptance depends on A5. All five existing PRs were green and conflict-free against their current bases at this checkpoint. Recheck bases/CI after each authorized merge. Merge only on the author's explicit `merge PR N` instruction.
- A4 phases B/C, U6 AC2-AC5, U8 AC2 and P2 AC2-AC4 are complete on the emulator. P2 AC4 originally found the unrelated-owner inclusion bug; A5 fixes it and passes the recorded replay and fresh Checks. See their branch specs/reports, rather than repeating the old run instructions below.
- **Keep the preview running.** `C:\isr-mvp` remains detached at A5 `0ff325b`, with its backend and U8 frontend. Saved emulator export: 2026-11-12 06:36 UTC. P1 now has its own `A:\BackUp\isr-mvp\worktrees\wt-p1` checkout, so do not switch the serving checkout to P1.
- No merges, deploys, rules edits, live writes or new AI calls were performed for this checkpoint. Live is still pre-A4 code/data; P1, P2 and the A4 re-embedding/deployment must be coordinated by the author after backup. Include A5 in that code deployment. D1 still waits for its specified live prerequisites.

The remaining sections describe the original handoff and historical run state; this checkpoint governs the next work.

## P2 acceptance checkpoint, 2026-11-12 (historical)

**Follow-up:** A5 PR #24 resolves the original building failure described below. Current preview is detached at A5 with prompt p4; its saved export includes both successful repeated Checks. Review code stack A4 #20 -> U6 #21 -> U8 #22 -> A5 #24, plus P2 data PR #23. Emulator remains running. See the updated P2 acceptance report for the passing follow-up.

- A4 saved embedding/migration work is complete (9,150 people current). U6 and U8 emulator checks are complete. Review stack: A4 PR #20 -> U6 #21 -> U8 #22. Nothing merged or deployed.
- Emulator is **running** from `C:\isr-mvp`, detached at U8 `0eddbc6`, with the U6/A4 backend and Java heap 8 GB. Keep the preview available for the author. Latest export **2026-11-11 22:58 UTC**, including the two P2 test drafts/logs.
- P2 dry run: 9,150 done, 0 to write/held/problems. AC3 profile/map passed; garage-owner inclusion passed. **Building-locality AC4 FAILED:** correct h5 point and 130 m cutoff, but 3,908 unrelated flat/house owners bypass it, giving 4,941 candidates in total. See `tasks/P2-acceptance-report.md`.
- P2 AC4 now passes on the approved A5 fixed stack (PR #24): building count 1,033, all 3,908 unrelated bypasses removed, garage behavior retained. Original failure is historical regression evidence. P2 is review-ready; A5 must be merged/deployed with the coordinated release. Do not reapply P2/A4; no data or D/G formula change is needed.
- No live writes, deploys or rules changes. Live migrations remain the author's steps. Older partial A4 counts and stopped-emulator notes below are historical.


## A4 completion checkpoint, 2026-11-11 (historical)

- **A4 phases B and C are complete and saved.** All 9,150 people are current, with 20,245 skill vectors. Two publics (50 members) have real E and ISR; 56 documents were written. Independent checks against `functions/isr.js` and browser checks passed; repeat runs make no changes.
- Final emulator export: **18:34 UTC / 20:34 Kyiv**, `C:\isr-mvp\.emulator-data`, Java heap 8 GB. Imported again and the completed state verified. The emulator is stopped; the main checkout is back on `p1-profile-review`.
- This resume used 229 embedding requests for 22,751 texts (833,512 estimated tokens, approximately $0.13), plus two small phase C requests (preview/apply). See A4's Status log and reports for the complete accounting.
- **Do not re-run A4 phase B or C as a next step.** Next: A4 PR/review, then U6 AC2-AC5 with its own functions (section 3, step 3); P2 AC3/AC4 remain as recorded. Live phase D stays the author's step.
- Drive A was reconnected and readable. All project instructions continue to apply. No live data or deployed code changed.

### U6 checkpoint: 2026-11-11

- AC2-AC5 passed with U6 functions and the completed A4 data. Four location sources, moved-pin invalidation/recheck, forged Create rejection, exact draft-point persistence, logs, cache, geocoding switch and credit verified. See `tasks/U6-emulator-report.md`.
- Ten text and ten embedding calls, approximately $0.0363 at the spec's recorded rates; exactly four external Nominatim lookups. Switch restored to its original absence. Two emulator test drafts for the pin check and one created test issue remain.
- Final export: **2026-11-11 19:15 UTC**, exit 0; re-import verified all final U6 records survived. Emulator stopped; main checkout restored to `p1-profile-review`.
- Next: review A4 PR #20 and the stacked U6 PR; U8 follows U6. P2 browser/Check acceptance remains pending separately. No merges, deploys, rules edits or live writes performed.

### U8 checkpoint: 2026-11-11 (current preview state)

- U8 AC2 rechecked on the full emulator; Node 91 passed, Python 73 run with one skip. Editable and read-only OpenStreetMap tiles, credit, pin movement and profile places verified. No Google Maps requests; no console errors. See `tasks/U8-emulator-report.md`.
- **Emulator left running for the author**, Java heap 8 GB. `C:\isr-mvp` is detached at U8, serving its map code and the verified U6 backend. Keep it running for inspection; do not switch to the pre-A4 P1 branch while serving this preview.
- No database writes or AI/Nominatim calls for U8; the saved data remains the verified U6 export at 19:15 UTC. Temporary diagnostics removed; source is clean.
- Next: review the stacked PRs in order A4 #20, U6 #21, then U8. P2's remaining browser/Check acceptance is still separate. Live U8 AC3 waits for the author's coordinated deployment. Nothing merged or deployed.

### A5 checkpoint: 2026-11-12 (current preview)

- Author approved the locality fix discovered in P2 draft PR #23. A5 is implemented on `codex/local-residential-scope`, stacked after U8 #22. Prompt p4 removes generic flat/house filters at unit/building scope; garage and broader ownership cases retained. Old offending drafts require a new Check.
- Node 98 / Python 73 (one skipped); captured P2 replay and fresh building Check give 1,033 candidates instead of 4,941, eliminating all 3,908 unrelated-owner bypasses. Garage Check 1,391; displayed 25/25 verified owners. P2 AC4 passes on A5. See `tasks/A5-emulator-report.md`.
- Export **2026-11-12 06:36 UTC**, two text/two embedding calls (about $0.00722). Preview remains running from the A5 branch in the main checkout, with the unchanged U8 frontend. Do not switch to older code while serving the preview.
- Review/merge code stack A4 #20 -> U6 #21 -> U8 #22 -> A5; P2 #23's acceptance depends on A5. Coordinate its live deployment with the earlier code tasks. No PR merges, deploys, rules edits, profile migration or live writes performed.

The older partial counts and resume commands below are historical handoff context, not the current checkpoint.

## 1. Where things stand

### main and the live site
- **main:** `39c1998` (PR 19, handoff instructions, merged 2026-11-11). Hosting on live is `f58bf25` (PR 17); PR 18 changed documents only.
- **Live hosting:** main at `f58bf25`, deployed 2026-11-11 06:16 UTC. U5 and U7 are live: every response is sent with `no-cache`.
- **Live functions:** the code from before A4. The old SDK and the retired models mean that Check falls back to the keyword rules and uses a random issue vector, until A4 is deployed (step 5).
- **Live data:** A1b and L1 are migrated (2026-11-09). P1, P2 and A4's vectors are **not** on live yet.
- **Live chat deadlines:** they were set to 2026-12-09 by L1. **Before that date** the author must extend them (step 7).

### The emulator
- **Its saved data:** `C:\isr-mvp\.emulator-data`, last exported **2026-11-11 18:56** local time, with the Java memory at 8 GB.
- **How it got there:** imported from a live export. A1b and L1 were re-applied on 2026-11-10, and **P1 was applied on 2026-11-11** (9,150 users).
- **Also there:** **P2 applied on 2026-11-11** (homes in buildings, property; AC2 passed).
- **A4 in the saved data (18:56):** **2,038 of 9,150 people** have `t1` vectors. Phase B was re-run after the memory fix and stopped by the author at that point. Phase C is not applied. See section 2.
- **Running:** the emulator was started on 2026-11-11 in the terminal tab "emulator 8g", from `C:\isr-mvp` on branch `p1-profile-review`, with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'`. Its functions are that branch's code (before A4). It may still be running; stop it with Ctrl+C, which exports on exit.

### Branches, one worktree each
`wt-*` = `A:\BackUp\isr-mvp\worktrees\wt-*`.

| Branch | Folder | Spec | Done | Next |
|---|---|---|---|---|
| `p1-profile-review` | `C:\isr-mvp` (the main checkout) | [P1](tasks/P1-profile-review.md) | generated (5,097 people), applied on the emulator, AC2 passed | PR to main; on live, the author's AC4 |
| `a4-working-ai` | `wt-a4` | [A4](tasks/A4-working-ai.md) | phases A-C coded; phase A checked with the key (AC1-AC4); main merged in; CHANGES drafted | phases B and C on the emulator; numbers into CHANGES; PR; phase D (author) |
| `p2-homes-and-property` | `wt-p2` | [P2](tasks/P2-homes-and-property.md) | approved; `scripts/migrate_p2.py` and 14 tests; a read-only preview | the real plan, the emulator apply, AC2-AC4, PR |
| `u6-issue-location` | `wt-u6` | [U6](tasks/U6-issue-location.md) | implemented (Node 86 tests); browser checks without the key; A4 and main merged in | AC2-AC5 with the key; PR after A4 |
| `u8-map-tiles` | `wt-u8` | [U8](tasks/U8-map-tiles.md) | OpenStreetMap tiles, on top of U6; AC1-AC2 | PR after U6; AC3 on live |
| `d1-demo-data` | `wt-d1` | [D1](tasks/D1-demo-scenarios.md) | plan approved (decisions 5.1-5.5) | starts after P2 is applied and A4 and U6 are live |
| `u7-live-record` | `wt-u7` | [U7](tasks/U7-page-cache.md) | merged (PR 18) | none; the worktree can be removed |
| `handoff-codex` | `wt-handoff` | this file and `AGENTS.md` | | PR |
| (detached `origin/main`) | `wt-main` | | the deploy copy | refresh before each deploy |

## 2. Done after this file was first written (2026-11-11)

- **P2: done on the emulator.**
  - The real plan was made after P1 and committed (`scripts/p2_generated/plan.json`). The apply wrote all 9,150 people, and a second run wrote 0. AC2 passed, and the emulator was exported. CHANGES is written.
  - **Left:** AC3 (the browser check) and AC4 (a Check of a building issue and a garage issue, with the key), then the PR.
  - A dry run of `python scripts/migrate_p2.py` reports "done 9150, to write 0".
- **A4 phase B: done on 2026-11-11 after billing, but not saved** (see the next bullets).
  - 288 of 9,150 people are embedded. The free tier of `gemini-embedding-001` allows **1,000 texts a day, and every text in a batch counts** (the error names `EmbedContentRequestsPerDayPerProjectPerModel-FreeTier`). The plan had assumed one batch = one request.
  - All texts take about 29 free-tier days, on the emulator and again on live.
  - **Decided by the author on 2026-11-11: option a, billing** on the AI Studio project that owns the key (`C:\isr-mvpunctions\.secret.local`). The author's steps:
    1. https://aistudio.google.com/api-keys → the key's project → **Set up billing** (Billing Tier column).
    2. Choose or add a Google billing account.
    3. Choose a plan: Prepay (at least $5) or Postpay.
    4. Set a **monthly spend cap** of about $5 at https://aistudio.google.com/spend. With Prepay, turn off or limit the auto-reload at https://aistudio.google.com/billing.
    5. Check that the project shows **Paid** (Tier 1).

    The key stays the same.
  - **The expected cost:** about $0.16 for everyone on the emulator (the run report's estimate at $0.15 per 1M tokens), the same again on live, and fractions of a cent per Check.
  - **Billing status:** check "Paid" on the API keys page before relying on it. Until the project is paid, the free limits apply. With billing, every request of this project is billed, the Analyzer's included.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
- **A4 after billing (2026-11-11):**
  - **The comparison** of task types: the approved choice is kept.
  - **The full phase B:** 8,462 people, 27,200 texts, 273 requests, about $0.15; all 9,150 people current.
  - **Phase C:** 2 publics, 56 documents.
  - **Two script fixes** pushed: a retry in the comparison, and the report path across drives.
  - **Not saved:** `firebase emulators:export` then failed with HTTP 500. The Firestore emulator's Java process was at its default memory ceiling (about 4.5 GB of 16 GB RAM, 0.7 GB free), so drive C also fell to 3 GB free as Windows grew its page file.
  - **Later the same day (18:3x-18:56):**
    - The author freed drive C (8.8 GB free), and the emulator was restarted with `-Xmx8g`. With the 11:35 data loaded, its Java process already used about 5.4 GB.
    - Phase B was re-run and **stopped by the author at 2,038 of 9,150 people**.
    - The export then **succeeded** (18:56). The 8 GB memory fixes the export.
    - RAM stays tight: 0.3-0.5 GB free with browsers open (Brave about 4 GB, Chrome about 3 GB). Windows' page file on C has grown to 16.6 GB.
  - **The plan for A4 on the emulator** (billing is active, so there is no daily limit):
    1. Close large programs (the browsers), so the emulator's 5-7 GB fits in RAM.
    2. If the emulator is not running, start it with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'; firebase emulators:start --only "firestore,functions,hosting" --project project-a3d59130-5adf-4677-9e2 --import=.emulator-data --export-on-exit=.emulator-data`, from `C:\isr-mvp`.
    3. In `C:\isr-mvp`, `git checkout --detach origin/a4-working-ai`. Then run `python scripts/embed_people.py --apply`; it resumes with about 7,112 people (about 35 minutes and $0.12). Then `python scripts/migrate_a4.py --apply` (1 request).
    4. `firebase emulators:export .emulator-data --force --project project-a3d59130-5adf-4677-9e2`.
    5. `git checkout p1-profile-review`.
    6. Record the numbers in the A4 Status log and CHANGES, then open the PR.

    Details are in the A4 Status log.
- **The Gemini quota:** the free daily quota was used up on 2026-11-11, and it resets at 08:00 UTC. Every Check uses 1 embedding (one text) and 1 text-model request.

## 3. Next steps, in order

All runs below are on the emulator. In PowerShell, first:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:GCLOUD_PROJECT="project-a3d59130-5adf-4677-9e2"
```

After every step that writes, export the emulator (`AGENTS.md`).

1. **P2 (done up to AC2; see section 2), in `wt-p2`:**
   1. `python scripts/migrate_p2.py --make-plan`. This runs once; then commit `scripts/p2_generated/plan.json`.
   2. `python scripts/migrate_p2.py`: a dry run that writes `specs/tasks/P2-migration-report.md` and the two GeoJSON files.
   3. `python scripts/migrate_p2.py --apply`. A second run writes nothing.
   4. Export the emulator.
   5. AC3 in the browser: the profile and the geotag map show the home on its building, and the property entries.

   AC4 needs a Check with the key, so it runs with step 3. Then the Status log, CHANGES and the PR.
2. **A4 phases B and C, in `wt-a4`** (phase B is partial and waits for the author's quota decision; see section 2):
   0. **Where to run it:** the scripts read the key from their own repository folder, and only `C:\isr-mvp` has it. Run them in `C:\isr-mvp` checked out detached at `origin/a4-working-ai` (`git checkout --detach origin/a4-working-ai`; the branch itself is checked out in `wt-a4`). Write the reports into `wt-a4` with `--report A:/BackUp/isr-mvp/worktrees/wt-a4/specs/tasks/<name>.md`. Then go back with `git checkout p1-profile-review` (or main once P1 is merged).
   1. After the author confirms the project is "Paid": send one tiny embedding request to check the quota. Then run `python scripts/embed_people.py --limit 200 --apply --compare-task-types` again, for the comparison, which failed on 2026-11-11. The 200-person sample is already embedded.
   2. `python scripts/embed_people.py --apply` for the remaining 8,862 people: 288 requests of up to 100 texts, under an hour. It resumes if stopped, at most 900 requests a run.
   3. `python scripts/migrate_a4.py` (a dry run), then `--apply`, for the A1b publics.
   4. Export the emulator.
   5. Put the numbers into CHANGES and the A4 Status log; open the PR "A4: working AI".

   P1 is applied, as phase B needs; P2 does not change the embedded texts.
3. **U6's checks with the key** (AC2-AC5): the emulator must run U6's functions, which include A4's.
   1. Stop the emulator cleanly (Ctrl+C in its terminal saves its data).
   2. In `C:\isr-mvp`, with a clean working tree, run `git checkout u6-issue-location`. This folder holds the key file and `node_modules`.
   3. Start the emulator again from `C:\isr-mvp`.
   4. Run the checks in the U6 spec: 4 Checks, a moved pin, a forged location, the switch. About 8 text, 8 embedding and at most 4 Nominatim requests.

   P2's AC4 (a building issue from a resident of osbb 1, h5) can run here too.
4. **Pull requests, in order:**
   - P1 and P2 at any time;
   - A4, then U6 (merge main into it again if needed), then U8;
   - PR 18 is merged.
5. **The author's live steps,** after the merges. Run them from `C:\isr-mvp` on an up-to-date main: it has the key file and the Python packages. The agent checks read-only after each step.
   1. **Backup:** `python scripts/backup_firestore.py --project project-a3d59130-5adf-4677-9e2 --out A:\ISR\mvp\dbbackup\<date>`.
   2. **P1:** `python scripts/migrate_p1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`. This also rebuilds `user_packs`. Then the agent runs `python scripts/audit_profiles.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live`, which is read-only.
   3. **P2:** `python scripts/migrate_p2.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`, with the committed plan. A person whose live input differs is held and reported.
   4. **The key:** `firebase functions:secrets:set GEMINI_API_KEY --project project-a3d59130-5adf-4677-9e2`.
   5. **Deploy** A4, U6 and U8 together, from `wt-main`: `cd A:\BackUp\isr-mvp\worktrees\wt-main; if ($?) { firebase deploy --only "functions,hosting,firestore:rules" --project project-a3d59130-5adf-4677-9e2 }`.
   6. **Straight after the deploy:**
      - `python scripts/embed_people.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`;
      - then `python scripts/migrate_a4.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`.

      Until the people are re-embedded, S and E compare vectors from two different models.
   7. **The agent's live checks:** A4 AC8, U6's live behaviour and U8 AC3, all read-only.
6. **D1** (the demo scenarios and data), after step 5.
7. **Before 2026-12-09, the author:** extend the live chat deadlines. First a dry run, then:

   ```powershell
   python scripts/migrate_l1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --new-deadline <YYYY-MM-DD> --apply
   ```

   Otherwise the nightly `closeExpiredTopics` (00:30 Europe/Zurich) on 2026-12-10 closes most open topics.

## 4. Later, and known items

- Roadmap stages 4-8 ([ROADMAP-demo.md](ROADMAP-demo.md)).
- Move the HTTPS functions to europe-central2, and upgrade `firebase-functions` and the Firebase CLI (14.1 is installed; 15.x is current).
- The map's marker icons come from `raw.githubusercontent.com` (a GitHub repository, not a CDN), and the shadow from Leaflet 0.7.7 on cdnjs (noted in U8).
- U6: `geocode_cache` and `config` are open to clients under the R0 rules until the stage 5 rules.
- The R0 Firestore rules expire 2027-06-30.

## U10 active-title revision, 2026-11-13

Author approved unique titles among active issues only, allowing reuse of closed/expired names, and one Create action. Implemented all-active title checks with transactional recheck and explanation-driven Create. Full Node/Python and revised emulator tests passed. PR #32 is ready for review after author acceptance of the revised UI. Manual preview refreshed with clean disposable demo data on port 5001/Firestore 8080. No merge, deploy or production write.
