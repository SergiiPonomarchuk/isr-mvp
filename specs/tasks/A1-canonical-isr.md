# SPEC A1 (v2, roadmap stage 2): one ISR, computed on the server

Status: DONE, live 2026-11-09 (merged as PR 7; deployed, migrated and smoke-tested on live). APPROVED v2 2026-11-08 (author: all decisions as recommended). v1 (2026-10, canonical module only) is superseded by this version; its requirements are kept where still valid and marked "(v1 Rn)".
Branch: a1-one-isr (from main at `f832695`; never main)
Roadmap: [ROADMAP-demo.md](../ROADMAP-demo.md), stage 2. Decisions: PD-3 (additive formula, mean normalisation), PD-8 (E = max(min(age,30)/30, education) + experience). Effort estimate: 6–9 developer-days.

## 1. Context (verified 2026-11-08 at `f832695`)

| Fact | Evidence |
|---|---|
| **Two different numbers are called "ISR".** The member ISR (`microcommunity_members.isr_score`, w_R·R̂ + w_E·Ê + w_C·Ĉ, recomputed by A2/A3) and the cached maps `isr_scores` on `discussions`/`issues` (= round(1.5 × floored relevance, 2) from old seed scripts). They match for 19 of 3,099 members. Live smoke test: voting list 1.20, topic card 0.44 for the same user and issue. | IF l.101; 06 (C-34); R0 smoke test |
| The cached `relevance_scores` maps are floored (creator ≥ 0.85, others ≥ 0.20) and always include user "1". | IF l.59 |
| Readers of the cached `isr_scores`: phase votes (`main.js:3553`), voting detail and tally (`:4388`, `:4410-4500` with the fallback chain isr_scores → member isr_score → 1.5 × relevance), tasks detail (`:4842`), chat detail (`:4115`), the members list of a discussion, sorted by ISR (`:6293`), dashboard (`:8544`), voting list (`:8774`), tasks list (`:8930`). `relevance_scores` is read in 37 places. | grep 2026-11-08 |
| **New issues get no E and no ISR.** `createIssue` computes R and the members, and writes `relevance_scores` but no `isr_scores`. The ISR-weighted phase vote divides by the sum of `isr_scores` and does nothing when it is 0, so **a new issue can never reach voting.** | `functions/index.js` createIssue; `main.js:3551-3594` |
| **No vote result exists.** The tally is computed in the browser only; stored `options[].score` are 0; `winning_option_index` is never computed; moving to `approved` creates no tasks from the winner. | IF l.102-103; `main.js:3776-3786` |
| Votes and phase votes are written by client transactions; any client can write any uid. | IF l.104 (integrity: roadmap stage 5) |
| E needs the issue vector and the skill vectors. No issue vector is stored; without an AI key the vector is random (stage 1). Live `user_vectors` hold the skill vectors (`experience_vectors`). | EMBEDDINGS #12; `functions/ai-helper.js:31-37`; R0 memory fix |
| Visibility of issues comes from `participants`, `creator_uid` and membership, not from the maps. | `main.js` `getRelevantDiscussionIds` |
| Existing pure code: `scripts/expertise.py` (E, age floor, normalisation, ISR, recompute), `functions/geo.js`, `functions/demographics.js`, `relevance_evaluator.py`. | A2, A3 |

## 2. Goal

One ISR per member and issue, computed by one module that the server, the browser and the scripts share, and used for every display, every phase vote and the vote tally. When voting closes, the server computes and stores the result, and the winning option becomes the issue's tasks. New issues can be voted on.

## 3. Non-goals

- No change of the formulas: relevance (v1 R1), E with the age floor (PD-8), division by the public mean (PD-3), the Contribution placeholder (decision 2). No Contribution scoring (stage 6).
- No AI model change, no re-embedding, no backfill of issue vectors (stage 1). Members of existing publics keep their stored values.
- No authentication, rules or vote integrity (stage 5): votes and phase votes stay client writes; the phase-move thresholds stay as built (decision 5).
- No deploy and no live write by the agent; the live migration is the author's step. No edits under `docs/`.

## 4. Requirements

### Shared module
- **R1** `functions/isr.js` is the single source (UMD, usable in Node and the browser): `relevance(D, G, S, X, w, clamp)` (v1 R1), `ageFloor(age)`, `expertise(eduSum, expSum, age)` (v1 R2), `normalizeByMean(values)` (v1 R3), `contributionPlaceholder()` (decision 2; marks `contribution_source: "constant"`, v1 R4), `isrForPublic(members, weights)` returning a breakdown per member (v1 R5), and `tally(votes, isrByUid, optionCount)` returning per-option scores, the counted and the excluded voters, and the winner (decisions 3 and 4) (v1 R6).
- **R2** `prototype/js/isr.js` is a byte-identical copy, produced by `npm run sync:isr` in `functions/`; a test fails if the two differ.
- **R3** Python port `scripts/isr_core.py` (reusing `scripts/expertise.py`), checked against the JS module on a shared fixture `tests/fixtures/isr_cases.json` (v1 R7).

### ISR at creation (server)
- **R4** `createIssue` computes E for every member as `scripts/expertise.py` does: education and work-experience skills only, cos clipped at 0, CBC table, CBC adjustment from the draft's `expertise_domain_parameters.CBC_adjustment_factor` (default 1.0), age at the server's registration time. It reads `users/{uid}` skills and `user_vectors/{uid}.experience_vectors` with a field mask.
- **R5** It then normalises R and E over the members, adds Ĉ (decision 2), computes the ISR with the issue's aggregation weights, and writes the breakdown into each member document: `education_expertise`, `experience_expertise`, `expertise_score`, `normalized_relevance`, `normalized_experience` (as-built name for normalised E), `normalized_contribution`, `contribution_source`, `isr_score` (v1 R9).
- **R6** It writes the `relevance_scores` and `isr_scores` maps of the discussion and the issue from the member values: no floors, no extra users. The maps become a server-written cache that always equals the member documents.
- **R7** A 100-member public stays within 512 MiB and the function timeout (measured on the emulator with skill vectors seeded).

### One number in the browser
- **R8** Every reader listed in §1 shows and uses the member ISR (through the maps). The fallback chain (isr_scores → member isr_score → 1.5 × relevance) is removed. A user without an ISR for that public sees "no ISR" (decision 3).
- **R9** The live tally in the voting view uses `ISR.tally` from the shared module.

### Closing a vote (server)
- **R10** A Firestore trigger (2nd gen, `onDocumentUpdated("issues/{id}")`) acts when `status` changes to `approved`: it computes the tally with the shared module from `votes` and the member ISRs and writes `options[i].score`, `winning_option_index` and a `tally` record (`computed_at`, counted voters, excluded voters, the ISR source). It creates `tasks` from the winning option's steps (`description[]`: step, in_charge, deadline). On a tie or with no counted votes it writes no winner (decision 4). It is idempotent (a repeat with the same votes changes nothing) and ignores its own writes.

### Existing data
- **R11** `scripts/migrate_a1.py` (dry run by default; emulator only unless `--project … --i-know-this-is-live`): rewrites the `relevance_scores` and `isr_scores` maps of every discussion and issue from the member documents. Report: map entries changed, users removed from maps (non-members, the demo user "1"), and, per voting issue, how the tally changes under the member ISR (votes that become excluded). Member values are not changed. The 2 app-created publics without E stay without ISR until stage 1.

### Specs
- **R12** Update `06-aggregation-and-voting.md` (C-34, C-35), `02-data-model.md` (the maps, `tally`, `tasks`), the README and CHANGES.md.

## 5. Acceptance criteria

- **AC1** On the emulator after A2 and A3, the module reproduces every stored `isr_score`, `normalized_relevance` and `normalized_experience` within 0.001 from the stored parts and weights.
- **AC2** Shared fixture: JS and Python agree. Edge cases: all equal, all zero, one member, mean ≤ 0 with unequal values (decision 1), negative input; scaling every R by a constant leaves R̂ and the ISR unchanged (v1 AC3, AC4); tally with a tie, no votes, an excluded voter.
- **AC3** `prototype/js/isr.js` equals `functions/isr.js` (test).
- **AC4** Emulator end to end: Check → Create gives every member an ISR breakdown and maps equal to the member values; the new issue moves to voting through the phase vote; each vote updates the live tally; finishing the vote writes scores, the winner, the `tally` record and the tasks; the voting list, the topic card and the tally use the same ISR (the R0 smoke-test case).
- **AC5** `migrate_a1.py` on the emulator: dry run report, apply, a second run changes nothing.
- **AC6** CI green; no deploy and no live write by the agent; no file under `docs/` changed.

## 6. Decisions (author, 2026-11-08: as recommended)

1. Mean ≤ 0 with unequal values: error (v1 R3); all-equal values (also all zero) normalise to 1.0.
2. Contribution placeholder: Ĉ = 1.0 for everyone, `contribution_source: "constant"`, until stage 6.
3. Voters without an ISR for the public are excluded from the tally and shown as "no ISR".
4. Tie or no counted votes: no winner (`winning_option_index` null, note in the `tally` record); the public votes again.
5. Phase moves: rules unchanged (10 %, client transaction); weights switch to the member ISR.
6. Closing: a Firestore trigger.
7. Stage 2 is built now; E for new issues becomes meaningful with stage 1.

## 7. Traceability

Contradictions C-34 (what weights a vote), C-35 (vote outcome not computed or persisted), C-21 (fallback weights; unchanged here). Paper register claims C-34, C-37; log issues 47, 48. Decisions D-006 (additive formula), D-011 (re-scope).

## 8. Status log

- Plan approved: 2026-11-08 (author, decisions as recommended).
- Implementation: R1-R12 on branch `a1-one-isr`.
- Tests: Node 24 (8 new: shared fixture, edge cases, browser copy identical); Python: shared fixture and hand-checked cases; CI.
- AC1: 3,045 members on the emulator after A2/A3 reproduced within 0.002 (all differences above 0.001 come from A2/A3 storing inputs rounded to 3 decimals after normalising full-precision values; no formula difference).
- AC4 (emulator, end to end): Check → Create gave 100 members the full breakdown and maps equal to the member values; the new issue moved to voting through the ISR-weighted phase vote (impossible before); votes updated the live tally immediately (3.04 / 5.99 / 3.02, equal to the Python port), a non-member's vote was excluded with a visible note; the voting list and the topic card show the same ISR (1.01); finishing the vote made the trigger store the scores, the winner and the tally record; an option with steps produced tasks; a tie gave no winner.
- R7: replay of the new reads peaks at about 200 MiB RSS (limit 512 MiB).
- Migration (emulator): A1 applied to 272 documents; second run changes nothing.
- CHANGES.md: written.
- Deviations: AC1 tolerance 0.002 (rounding of stored inputs); the trigger runs in europe-central2 (the database's region).
- Merged: PR 7 (2026-11-08, merge commit `42128f4`).
- Live deploy (author): the first deploy (2026-11-08, from the branch) updated the three HTTPS functions; creating the trigger failed with "Permission denied while using the Eventarc Service Agent" (first 2nd-gen event trigger in the project; the service agent's roles were present but still propagating). The retry from main after the merge created `onIssueStatusChange` (europe-central2, 512 MiB) and released hosting; the live `index.html`, `js/main.js` and `js/isr.js` equal main byte for byte. Container images in europe-central2 are deleted after 1 day (cleanup policy set during the deploy).
- Live migration (2026-11-09): dry run by the agent (read-only); apply by the author, report [A1-migration-report-live.md](A1-migration-report-live.md): 273 documents (192 discussions, 81 issues); the demo user "1" left 168 maps; 15 issues with votes, the leading option changes in none, 6 votes no longer counted (voters without an ISR for that public). Second dry run: no changes. The trigger ran once per updated issue and did nothing (no status change), no errors.
- Live differs from the emulator run only by the R0/U1 smoke tests of 2026-11-08: one app-created issue (`nN4sPhX49dxLqmbuKada`, made by the pre-A1 `createIssue`, so its 100 members have relevance but no ISR; with the two earlier app-created publics, 3 publics now wait for stage 1) and two smoke-test votes (issues 30, 40).
- Live smoke test (2026-11-09, author; issue 57, 13 members, ISR pool 13.00): user 538 (ISR 2.457) voted for the second option; the vote was stored. "Finish Voting" by the same user (18.9 % of the pool, above the 10 % rule) moved the issue to `approved`; the trigger stored `options[].score` 1.488 / 2.457, `winning_option_index` 1 and the `tally` record (2 counted, 0 excluded); `tasks` is empty because the seeded options have no steps (task creation was checked on the emulator, AC4).
- Findings for a follow-up spec (not changed here): in small publics one member can pass the 10 % phase-move threshold alone; voting issues with a past deadline stay in voting (76 of 77 on live), and chats have no deadline (189 of 193).
