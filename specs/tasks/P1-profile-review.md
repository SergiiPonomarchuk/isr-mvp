# SPEC P1: Review and repair of the synthetic profiles

Status: APPROVED 2026-11-10 (author: "P1 as recommended": proposals 1a, 2, 3a, 4a, 5a, 6, 7). Implemented on branch `p1-profile-review` (`scripts/migrate_p1.py`); AC1, the 20-profile trial, waits for the author's review.
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

## 3a. How the decisions are implemented (`scripts/migrate_p1.py`)

- **Work experience (1a, 2): the existing fields are filled, no new ones.** The entries already have an empty `name` and `specialization`, and `time` and `comment` are read by the code: `time` by E (`functions/isr.js` experienceSum), `comment` and `time` by the profile view (`prototype/js/main.js`), and `comment` by the A4 skill template `t1`. So the role is stored in `name`, the field in `specialization`, the years in `time`, and the one-sentence description in `comment`. Section 3 named them `title`, `field`, `years` and `description`, but the existing fields need no code change. Every entry keeps its `id` and `type`.
  - The model sees the uid, the age, the job, its department and place, the education entries (after the graduation repair), the old comments as "notes", and the limit `max_total_years` = age - 16. It sees no names, institutions, places of residence or relations.
  - The entries are in id order, from the earliest to the latest. For an employed person the latest entry is the current job. The notes are used only where they plausibly describe the person's own work. The fields prefer the 69 education specializations as their vocabulary.
  - Prompt `p1w1`: `gemini-3.1-flash-lite` (the A4 text model), temperature 0, seed 20261110, a JSON response schema, 10 people a call. The output is checked (every entry id once, non-empty role and field, a description of 20-300 characters, years > 0). A batch with a failed person is retried once with that person alone.
  - Years: at least 0.5 each, one decimal. A person's total is scaled down to age - 16 if the model gives more.
  - Every call (prompt, raw output, tokens) goes to `scripts/p1_generated/calls.jsonl`, and every accepted person (uid, input hash, entries) to `scripts/p1_generated/work_experience.jsonl`. The apply reads only that file, so the emulator and live get the same texts. A person whose input differs from the generated one (for example, live differs from the emulator) is reported and left unchanged.
  - Rate: at most 12 requests a minute and 450 a run (free tier: 15 a minute, 500 a day). The generation resumes where it stopped.
- **Graduation (3a):** the age by level is 19, 20, 22, 24 or 28 for Vocational Training, College, Bachelor, Master or PhD, plus a per-person offset of -1, 0 or +1 (from the uid). A second entry of the same level comes 2 years after the first, and the years increase with the level. A year after 2026 is kept with `in_progress: true`. Ages and "in progress" are taken on the audit date, 2026-11-10, so that a later run gives the same result.
- **Job education level (4a):** the highest *completed* education entry (not one in progress); `null` without one, as `post` stores it today.
- **`users/None` (6):** deleted (no `skills`, uid None). Another document without `skills` would be reported and left alone.
- **`user_packs` (R3):** rebuilt only where the collection has documents (live: 37). It uses packs of 250 with the fields `migrate_option_a.py` packs, in uid order, and removes surplus packs. The emulator has none, so nothing is written there.
- **Activities (2), features (5a), unused fields (7):** unchanged.
- **The vectors** are not touched: A4 phase B re-embeds every profile and skill from the repaired texts. On live, P1's `--apply` should therefore run together with A4's deploy (phase D): until then E would multiply the old vectors by the new years.

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
- 2026-11-10: approved by the author ("P1 as recommended"). Implemented `scripts/migrate_p1.py` (section 3a) and tests `tests/test_migrate_p1.py` (17; the model is mocked). `scripts/audit_profiles.py` now also reports: the job level against the highest *completed* education; the age at graduation by level and `in_progress`; the years over age - 16; the roles and fields of the work experience.
- 2026-11-10: dry run on the emulator, without generated texts:
  - 9,150 profiles; 7,844 documents to update, `users/None` to delete.
  - Education: 4,753 of 5,835 entries change, and 297 are in progress (the audit had 470 graduations in the future). The ages at graduation by level are 18-20 (Vocational Training), 19-21 (College), 21-23 (Bachelor), 23-25 (Master) and 27-29 (PhD).
  - Job level: 1,878 change, mostly from empty to the person's degree (756 Bachelor, 348 Vocational Training, 332 College, 305 Master, 97 PhD). 34 College and 6 PhD become empty: these people have no completed education entry.
  - Work experience: 5,097 people wait for generation.
- 2026-11-10 07:13-07:20: the trial generation (20 people, 2 calls) got HTTP 503 "This model is currently experiencing high demand", 16 attempts with backoff, plus one minimal probe request. No texts yet; a background loop probes every 10 minutes and runs the trial when the model answers.
- 2026-11-10: the author confirmed the field mapping of section 3a ("existing fields are fine").
