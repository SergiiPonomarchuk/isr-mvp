# SPEC P1: Review and repair of the synthetic profiles

Status: DRAFT 2026-11-10: the audit is done ([P1-profile-audit.md](P1-profile-audit.md)), and the proposals wait for the author's decisions (section 3).
Branch: p1-profile-review (from main at `0448705`; never main)
Source: the author, 2026-11-09: "maybe we should also review Profiles content and fix it according to our current environment (including edition fields content, adding new fields if they are needed, splitting, joining, etc.)". A4 (stage 1) re-embeds the people after P1 (A4 open point 4.2).
Effort estimate: 1-2 developer-days after the decisions, plus generation time on the free tier.

## 1. Findings (audit of 2026-11-10 on the emulator, which holds the live profiles; `scripts/audit_profiles.py`)

| # | Finding | Why it matters |
|---|---|---|
| F1 | **Work experience has no structure.** All 11,057 entries (in 5,097 profiles) have an empty `name` and `specialization`; the only content is a free-text `comment` (median 93 characters). | E and its skill vectors are built from these texts (A4 template `t1`). |
| F2 | **About half the work-experience comments describe another person:** 5,684 of 11,057 match "A/An/The … who …", for example "An older sibling who works as a graphic designer and offers helpful advice…". Others are fragments ("a conservative elderly local resident of Summit County"). | Such a text describes the person's contacts, not the person's own experience. Their E then measures the wrong thing. |
| F3 | **`time` is 1 in every entry:** all 11,057 work-experience and all 3,353 activity entries. | E multiplies each work-experience cosine by `time` as years (`functions/isr.js` `experienceSum`), so years of experience have no effect. |
| F4 | **Every graduation is at exactly age 23** (`graduationYear` = birth year + 23 in all 5,835 education entries), so 470 lie in the future. | The age floor and any "years since graduation" read as if all were the same; a future graduation is shown as done. |
| F5 | **The job's `educationLevel` repeats the education entries:** the same in 3,720 profiles, "None" or "College" without a matching entry in 2,115, and 3,315 profiles have no education entry. | Two sources for one fact; the UI and A4's template may disagree. |
| F6 | **`features` is empty in all 9,150 profiles.** D's feature check matches `features` and activity names (`functions/demographics.js:63-75`). | A feature criterion can only ever match activity names. |
| F7 | **One broken document,** `users/None`: uid None, only `displayName` and an empty `socialRelations`. | It is counted as a user (9,151 instead of 9,150). |
| F8 | **Consistent, no action proposed:** names, birth dates (ages 1-101; 2,633 under 18, none of them with education, work or a job), places, relations (53,412, all two-way, none dangling), and vector coverage (every profile and skill has a vector). | |
| F9 | **Not used by any formula:** `offences` (in 1,357 profiles), `salary`, `isVerified` (always true), `marks` (reaction totals). | Kept, not embedded (A4 decision 2). |
| F10 | `values_description` exists for 1,460 profiles (median 5,684 characters), `values_taxonomy` for 227. | This is the values subsystem, outside P1. |
| F11 | On live, the `user_packs` cache (37 documents on 2026-11-07) holds copies of profile fields for `checkIssue`. The emulator has none. | Any change to profiles must regenerate it, or `checkIssue` reads the old values. |

## 2. Requirements (after the decisions)

- R1 `scripts/migrate_p1.py`: dry run by default; emulator unless `--project … --i-know-this-is-live`; the live `--apply` is the author's step, after a backup. It applies the decided repairs. Skill `id`s are kept, so every skill keeps its place (A4 phase B then replaces the vectors). The report gives counts and examples.
- R2 `scripts/audit_profiles.py` runs again after the repair; its report shows the findings resolved.
- R3 `user_packs` is regenerated from the repaired profiles (live), or removed if the author prefers `checkIssue` to read `users` (the emulator already does).
- R4 Generated texts (decision 1) are made with the A4 text model under the free-tier limits: batches of profiles per call, a request rate below the limit, resumable, temperature 0, and every prompt and output logged to a file for review.

## 3. Proposals (author)

1. **Work experience (F1, F2):**
   - **a (recommended): regenerate it as the person's own experience,** with fields `title` (role), `field`, `years` and `description` (one sentence about what the person did). The text model writes it from each profile's age, job, education and old comments; a dry run on 20 profiles comes first for your review.
     - About 5,100 profiles, 10 per call: about 510 calls and roughly 3M tokens. That is within the free tier over one or two days, and about $1 at the paid rate.
     - `years` is limited by age (no more than age minus 16 in total).
   - b: keep the comments and only drop or reword the entries that describe another person, by rule. Cheaper, but `years` stays unknown.
   - c: keep everything as is.
2. **Years (F3):** with 1a, `time` takes the generated `years`. Activity `time` is not used by any formula: leave it at 1.
3. **Graduation (F4):**
   - **a (recommended):** set the graduation age by level, with a small per-person spread: Vocational about 19, College about 20, Bachelor about 22, Master about 24, PhD about 28. A graduation after 2026 is kept and marked `in_progress: true`.
   - b: only move the future years to "in progress".
4. **Job education level (F5):**
   - **a (recommended):** derive it from the highest education entry ("None" without one).
   - b: remove it from `post`.
5. **Features (F6):**
   - **a (recommended):** leave empty for now and decide in stage 3, when the demo scenarios are chosen; record that a D feature criterion only matches activity names.
   - b: generate a few features per person (for example "dog owner", "car owner", "wheelchair user") with decision 1's batches.
6. **The broken document (F7):** **delete `users/None`** (recommended).
7. **Unused fields (F9):** keep them; no change.

## 4. Non-goals

- Values narratives and taxonomies (F10), demo scenarios (stage 3), relations and places (F8).
- Recomputing the stored R, E or ISR of the seeded publics.

## 5. Acceptance criteria

- AC1 Emulator: the dry run on 20 profiles is reviewed by the author before the full run (decision 1a).
- AC2 Emulator: after `--apply`, the audit shows:
  - F1-F5 and F7 resolved as decided;
  - every skill `id` unchanged;
  - `years` within the age limits.
- AC3 Unit tests for the repair rules (graduation ages, years limit, job level) on a fixture; the model output is mocked.
- AC4 Live (author): backup, `--apply`, `user_packs` regenerated; then the agent's read-only audit.
- AC5 The free-tier limits are respected; the request count and the token totals are recorded.

## 6. Status log

- 2026-11-10: audit script and report (agent, read-only on the emulator). Spec drafted with proposals.
