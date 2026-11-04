# SPEC A2: Expertise clean-up, read-only parameters, data migration

Status: DRAFT (waiting for author approval)
Branch: a2-expertise-cleanup (from docs/specs-restructure; never main)
Decisions: PD-8 (new, this task), PD-3, PD-6. Follows the docs as committed by the author on 2026-11-04 (docs fix list rounds 1–4, `specs/tasks/A2-docs-fix-list.md`).
Next task: A3 (option fields: cost, funding source, resources; G anchors home, work and property). Then A1 (canonical ISR module).

## 1. Context

The docs now define Expertise as

E = max(min(age, 30) / 30, Σ education cos^CBC × P) + Σ experience cos × P

with no weights, no resources part, no contemporary importance and no age penalty (`docs/ISR-Expertise-Assessment-v1.md` §2.1–2.3). Resources and money belong to the options, and property counts only through Relevance (PD-8). Nobody types a number: the AI assistant derives every parameter, the topic starter sees the values and can only clarify the context (`docs/mvp.html` l.337, AI-Weights l.16).

The code still does the opposite (verified 2026-11-04):

| What | Where |
|---|---|
| The AI prompt asks for `expertise_weights`, `contemporary_importance`, `age_penalty_threshold`, `reasoning_resources`; the normaliser and keyword fallbacks fill 0.3/0.4/0.3 and similar | `functions/ai-helper.js:139-216, 489-503, 525-549, 586-940` |
| The server reads, defaults and stores `w_education`, `w_experience`, `w_resources`, `reasoning_resources` | `functions/index.js:116-127, 162-166, 383-398, 600-628, 936` |
| `recalculate: true` takes μ, σ and every weight from the browser and skips the AI; μ and σ from the browser also override the AI result on the normal path | `functions/index.js:669-725` |
| The UI shows number inputs for relevance, ISR and expertise weights, minimum years, μ and 3σ, and sends them back | `prototype/js/modals.js:111-126, 226-234, 303-310, 361-388, 439-442`; `prototype/index.html:622-626`; `prototype/js/main.js:5347-5384, 5796-5862, 5886-6081, 6294-6444`; `prototype/js/relevance.js:121-124` |
| Stored Expertise includes a resources part from hobby skills scored by keywords (`land`, `property`, `director` … = 1.5) and has no age floor | `scratch/backfill_expertise.py:66-76, 185-214` (gitignored) |
| Stored data | `microcommunity_members`: 3,099 docs carry `resources_expertise` (886 > 0). `issues`: 80 docs carry `w_education`, `w_experience`, `w_resources` (claude_export, 2026-11-04) |
| `birthDate` is optional | `claude_export/SCHEMA.md:41`; `seed_db.py:126, 146` default `""`; 1 of 9,151 exported profiles has none |

## 2. Goal

Code and stored data follow the new Expertise definition, and no parameter can be typed or sent by a user.

## 3. Non-goals

- No Step 4A range check, no issue-type table, no k-nearest logic (Analyzer task, later).
- No option fields, no funding source, no G anchors (A3).
- No change to Relevance, Contribution, normalisation or the vote tally (A1).
- No fix of other known gaps found on the way (e.g. experience recency decay is not applied by the backfill; the 40/30/30 default weights of 190 discussions): they are listed in CHANGES.md, not fixed.
- No deploy, no Firestore rules change, no write to the live project. No edits under `docs/`.

## 4. Requirements

### Analyzer output (functions/ai-helper.js)
- R1 Remove from the prompt, the normaliser and the keyword fallbacks: `expertise_weights`, `expertise_weights_reasoning`, `w_education/w_experience/w_resources`, `contemporary_importance`, `age_penalty_threshold`, `reasoning_resources`, and the reasoning lines for education and experience weights. Keep `expertise_domain`, `expertise_depth`, `recency_decay_rate`, `CBC_adjustment_factor`.
- R2 Keep `resources_needed` (including `money_budget`): it describes what the issue needs and feeds the options (PD-8). Its prompt wording says so and never links it to anyone's weight.

### Server (functions/index.js)
- R3 Stop reading, defaulting and storing the expertise weights and `reasoning_resources` (all locations in §1).
- R4 `recalculate: true` becomes "re-derive with clarification": the body may carry `clarification` (text, max 2,000 chars). The server calls the AI with description + clarification and ignores every numeric field and every weight object in the body (μ, σ, `weights`, `relevance_weights`, `aggregation_weights`, `expertise_weights`, `demographics`, reasoning texts).
- R5 On the normal path the body's μ and σ no longer override the AI result.
- R6 The building of the parameters from (body, AI result) moves into a pure function in a new file `functions/params.js` so it can be unit tested without Firebase.

### UI (prototype/)
- R7 Every number input for a derived parameter becomes a read-only display: relevance weights, ISR weights, minimum years, μ and 3σ. The expertise-weight block is deleted. The AI reasoning texts stay visible.
- R8 The edit modal gets one text field "Clarify the context" and a button "Derive again", which sends `recalculate: true` + `clarification`. Nothing else is sent.
- R9 Remove the 0.3/0.4/0.3 defaults and the hard-coded per-topic expertise weights in `main.js` and `relevance.js`. Search filters (age min/max in `index.html:576-577`) are not parameters and stay.

### Expertise computation and migration (new, tracked)
- R10 New `scripts/expertise.py`: pure functions `age_in_years(birth_date, on_date)` (completed years; `on_date` is the registration moment of the issue, never the run date), `education_part(records, issue_vec, ctx, age)` = max(min(age, 30)/30, Σ …), `experience_part(...)`, `expertise(...)` = education_part + experience_part. CBC table, CBC adjustment and experience arithmetic stay exactly as in `scratch/backfill_expertise.py` (only the resources part is removed and the floor added). `activity` skills no longer count.
- R11 New `scripts/migrate_a2.py`, dry run by default, `--apply` to write. It refuses to run unless `FIRESTORE_EMULATOR_HOST` is set, or `--project` is given together with `--i-know-this-is-live` (that run is the author's step, never the agent's).
  - Members: recompute `education_expertise`, `experience_expertise`, `expertise_score`, `normalized_experience`, `isr_score` with the existing aggregation (same weights source, same normalisation, C = 1.0); delete `resources_expertise`. The age is computed at the registration moment of the issue the public belongs to (`discussions.created_at` of the discussion with the public's id, as the backfill joins them; present on all 192 in claude_export). Neither the age nor the floor is stored. If that date is missing, stop before writing and list the public ids.
  - `discussions` / `issues`: update the `isr_scores` (and `expertise_scores` where present) maps; delete `w_education`, `w_experience`, `w_resources`, `reasoning_resources`, `expertise_weights`, `expertise_weights_reasoning`, `contemporary_importance`, `age_penalty_threshold` wherever present.
  - If a member of any public has no valid `birthDate`, stop before writing and list the user ids (ids only, no other personal fields).
  - Report: counts of changed docs, deleted fields, members whose ISR changes by > 0.001, and the distribution of ISR changes. Written to `specs/tasks/A2-migration-report.md`.
- R12 New `scripts/seed_emulator.py`: loads `claude_export/` into the emulator (the collections and embeddings the migration needs). Same emulator guard as R11.
- R13 `firebase.json`: add the Firestore emulator (port 8080). No rules change.
- R14 `birthDate` required: `seed_db.py` refuses a profile without a valid `YYYY-MM-DD` date (no `""` default) and names the uid.

### Specs
- R15 Add `specs/decisions/PD-8-…`; mark PD-2 superseded by PD-8. Amend A1: R2 becomes `expertise = education_part + experience_part` (age floor, no resources, no baseline); open question 2 closed; R9 allows the field deletions done by A2. Update the README (decisions, tasks, contradiction map C-21, C-23, C-27, C-28) and `02-data-model.md` (fields removed, `birthDate` required).

## 5. Acceptance criteria

- AC1 Regression: with the floor switched off and `resources_expertise` added back, `scripts/expertise.py` reproduces the stored `expertise_score`, `normalized_experience` and `isr_score` of all members in `claude_export/` within 0.001 (proves the port is faithful before the change).
- AC2 Unit tests for R10: worked examples of `docs/ISR-Expertise-Assessment-v1.md` §2.2 and Part 7 (Lisa 1.16, Co-founder 3.25, Volunteer Coordinator age 24: 1.175); floor at age 15 (0.5), 30 and 80 (1.0); missing or invalid birthDate raises.
- AC3 Unit tests for R4–R6: numbers and weight objects in the body never reach the result; `clarification` reaches the AI call; the normal path ignores body μ and σ.
- AC4 After `--apply` on the emulator: zero docs with any field listed in R11; every member has `expertise_score >=` the floor recomputed from `birthDate` and the issue's registration date; no age or floor field is stored; the report exists.
- AC5 `grep` over `functions/`, `prototype/`, `scripts/`, `seed_db.py` finds none of: `w_resources`, `w_education`, `expertise_weights`, `contemporary_importance`, `age_penalty`, `reasoning_resources`, `resources_expertise` (except the deletion list in the migration).
- AC6 The prototype runs against the emulator: an issue can be created, the values are shown read-only, "Derive again" works, and no number input for a parameter is left (checked in the browser).
- AC7 No file under `docs/` changed; no deploy; no write outside the emulator.

## 6. Open questions

None. Decided 2026-11-04 (author): (1) the age is computed at the issue's registration moment and is not stored, so a recomputation gives the same E; (2) the migration keeps the ISR weights source as built (stored `w_*` in `discussions`, else 0.4/0.3/0.3 for 190 of 192 discussions) and flags it in CHANGES.md; replacing it needs the Analyzer task.

## 7. Status log

Plan approved: ___  Implementation: ___  Tests: ___  Migration dry run (claude_export): ___  Dry run (fresh export, author): ___  CHANGES.md: ___  Deviations: ___
