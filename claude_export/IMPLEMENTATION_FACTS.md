# IMPLEMENTATION_FACTS.md: ISR MVP implementation audit (read-only)

Date: 2026-10-12. Scope: the working tree at `C:\isr-mvp` (branch `main`, HEAD `392e773`, with uncommitted modifications to `functions/index.js`, `prototype/js/main.js`, `seed_db.py` and others), cross-checked against the live Firestore export in this folder.

**Status labels.** **VERIFIED** means confirmed by reading the cited code *and*, where marked "(data)", by recomputing stored values from the export. **UNSURE** means inferred, or the producing code is not in the repo. Line numbers refer to the current working tree.

---

## 0. The most important context (read first)

**Four different relevance implementations exist, and the live data was produced by the seeding scripts, not by the app pipeline.**

| Path | File | Produced live data? |
|---|---|---|
| A. Cloud Function `createIssue` / `checkIssue` | `functions/index.js:111-656`, `:659-950` | Only the 2 app-created publics (50 members, ids `7P45rAMiYJILlWsiFeaW`, `muhSxCg3KQCiyon46dua`). VERIFIED (data: auto-ids, D∈{1}, "(Creator)" suffix logic) |
| B. Python seeder `relevance_evaluator.py` via `scratch/seed_microcommunities_relevance.py` | `relevance_evaluator.py:36-181`; `scratch/seed_microcommunities_relevance.py:87-105` | The 190 seeded publics (3,049 members). VERIFIED (data: D∈{1.0, 0.5, 0.1} matches `evaluate_demographics` heuristics; members = discussion participants 3,049/3,049) |
| C. Client fallback | `prototype/js/main.js:5868-6180`, duplicate in `prototype/js/relevance.js:53-261` | Not used by any stored doc. Runs when the Cloud Function call fails. VERIFIED |
| D. `prototype/relevance_evaluator.js` | JS port of B | Not loaded by `prototype/index.html:659-667`. Dead code. VERIFIED |

The deployed Cloud Function is **older than the working-tree code**. The working-tree `createIssue` writes `classification`, `demographics`, `reasoning_D…`, `resources_needed` and `expertise_domain_parameters` (`functions/index.js:356-406`), but the 2 app-created live issues have none of these fields. VERIFIED (data). UNSURE which version is deployed.

---

## (a) Relevance: D, G, S, X

### Path A (Cloud Function, the "real" pipeline)

| Statement | Status | Evidence |
|---|---|---|
| R = w_D·D + w_G·G + w_S·S + w_X·X, with no clamp. | VERIFIED | `functions/index.js:319` |
| **D is binary (0/1) and a hard gate**: if D = 0 and w_D > 0, the user is excluded unless they are the creator. | VERIFIED | `functions/index.js:217-218`; D computed at `:40-92` (age from birth year, employment = `post` non-empty, family = child/grandchild relation types, features keyword match with a pet/animal special case) |
| `features` is empty for all 9,150 users, so any issue with a `features` criterion excludes everyone except the creator. | VERIFIED (data: 0 users with non-empty `features`) | `functions/index.js:76-89` |
| `employmentStatus` "student"/"retired" (offered in the prompt at `ai-helper.js:133`) are **not implemented**; they fall through to D = 1. | VERIFIED | `functions/index.js:55-59` |
| G: 1.0 within μ, Gaussian decay `exp(-(d-μ)²/2σ²)` beyond μ, **hard exclusion** beyond μ + 3σ (when w_G > 0). Users without a `home` anchor are excluded (creator gets G = 0). | VERIFIED | `functions/index.js:221-235` |
| μ, σ come from the request (`geographic_parameters` or `mu`/`sigma`), with defaults μ = 100 m and σ = 50 m. The client sends σ = fade/3 from the "Affect Fade (3σ)" input. | VERIFIED | `functions/index.js:148-153`; `prototype/js/main.js:5800-5805` |
| Upper-bound pre-filter: drop if w_D·D + w_G·G + w_S·1 + w_X·X ≤ 0.15. | VERIFIED | `functions/index.js:252-253` |
| S = max(0, cos(issueVector, profile_vector)), computed **only for the top 300 candidates by upper bound**. Everyone else gets S = 0. | VERIFIED | `functions/index.js:268-317` |
| The issue vector is **random** when `GEMINI_API_KEY` is unset or the embedding call fails. | VERIFIED | `functions/ai-helper.js:18-40` |
| Inclusion threshold R > 0.15. The public is capped at the **top 100** (creator always added). `checkIssue` returns the top 25. | VERIFIED | `functions/index.js:321, 335-350, 896-910` |
| **X uses only the submitter's `socialRelations`**: find `r.relative === user.uid`. X = `r.tie` if present, else spouse/partner 0.3, parent/child/sibling 0.2, grand-relation/close friend 0.1, otherwise 0. Relations of other users, reciprocity and multi-hop ties are ignored. | VERIFIED | `functions/index.js:169-178, 237-249` |
| Weight defaults when absent: w_D 0.1, w_G 0.4, w_S 0.4, w_X 0.1 (createIssue). | VERIFIED | `functions/index.js:143-146` |

### Path B (Python seeder, which produced 3,049/3,099 stored member scores)

| Statement | Status | Evidence |
|---|---|---|
| D is **not a gate** and never 0. It is a category/topic keyword heuristic: childcare gives 1.0/0.5/0.1, governance gives 1.0 or 0.8, social/event gives 1.0 or 0.5, utilities+EV gives 1.0 or 0.5, and anything else gives 1.0. | VERIFIED (data: D∈{1.0: 2710, 0.5: 388, 0.1: 1}) | `relevance_evaluator.py:36-87` |
| G: μ = `affection_distance` (km) × 1000, **σ = 0.5·μ** (ignores `sigma_decay_meters`), no hard cutoff; no home anchor gives G = 0; no topic location gives G = 1. | VERIFIED (code) | `relevance_evaluator.py:89-122` |
| S: cos(users.profile_vector, discussion.embedding/topic_vector), defaulting to **0.5** if either is missing. Topic embeddings came from Vertex `text-embedding-004` on the first message text (`scratch/seed_topic_embeddings.py:35-72`); on API failure, random uniform(-0.1, 0.1) vectors are used (`:74-80`). | VERIFIED (code); topic vectors since deleted from all discussions (data) | `relevance_evaluator.py:124-137` |
| X: same submitter-relations rule as Path A. | VERIFIED | `relevance_evaluator.py:139-166` |
| R = clamp₀¹(w·[D, G, S, X]) with defaults .2/.6/.1/.1. | VERIFIED | `relevance_evaluator.py:168-181` |
| **Membership was not selected by relevance**: seeded members are exactly the discussion participants (3,049/3,049), and one has R = 0.103 < 0.15. | VERIFIED (data) | `scratch/seed_microcommunities_relevance.py:56-59, 81-105` |
| The weights used for stored R **differ from the weights currently on the discussion/issue docs** for all 190 seeded publics. Every public fits *some* weight vector exactly, but not its current one, so the weights were rewritten after the scores were computed. | VERIFIED (data, per-public grid fit) | n/a |

### Cached `relevance_scores` / `isr_scores` maps on `discussions` and `issues`

| Statement | Status | Evidence |
|---|---|---|
| These maps are **floored**: creator gets max(R, 0.85) and everyone else max(R, 0.20). User "1" (demo user) is always added. | VERIFIED | `scratch/populate_discussions_scores.py:82-110`; `seed_db.py:249-266` |

---

## (b) Expertise

The only implementation that wrote stored values is `scratch/backfill_expertise.py`. VERIFIED (it is the only writer of these fields; data matches its formulas).

| Statement | Status | Evidence |
|---|---|---|
| Per skill record `s` with an experience vector: `cos⁺ = max(0, cos(exp_vec[s.id], topic_vector))`. | VERIFIED | `scratch/backfill_expertise.py:191-198` |
| **Education** = Σ cos⁺^(CBC·adj) × default_years, where (CBC, years) is PhD (0.5, 10), Master (0.8, 6), Bachelor (1.0, 4), College (1.5, 3), Vocational (2.0, 2), other (1.0, 4). `adj` is a keyword factor: security/lock 0.9, social events 1.1, governance/policy 1.2, else 1.0. | VERIFIED | `:51-64, 32-49, 200-204` |
| **Experience** = Σ cos⁺ × `time` over `work experience` records. | VERIFIED | `:206-208` |
| **Resources** = Σ cos⁺ × rarity over `activity` records. Rarity is a keyword table on name/comment: 1.5 (rare/lab/property…), 0.5 (car/yoga/camping…), else 1.0. | VERIFIED | `:66-76, 210-212` |
| `expertise_score` = education + experience + resources, **unweighted**. The issue's `w_education`/`w_experience`/`w_resources` are **ignored**. | VERIFIED (data: 3,049/3,049 equal the sum) | `:214` |
| **Baseline with no records is 0, not 1**: initialised 0.0 and only incremented. 921 of 3,049 members have expertise 0. | VERIFIED (data) | `:183-185` |
| **No age penalty, no recency decay, no `graduationYear` use.** `age_penalty_threshold`, `recency_decay_rate` and `contemporary_importance` exist only in the Analyzer prompt/fallback output and are never consumed. | VERIFIED | `functions/ai-helper.js:152-163, 498-507` vs. no consumer anywhere |
| `expertise_depth` and `min_experience_years` are stored and displayed only; they are not used in any score. | VERIFIED (grep: no computational consumer) | `scratch/seed_expertise_depth.py:10-54`; `prototype/js/main.js:6333` |
| Normalisation: `normalized_experience` (misnamed; it is total **expertise**) = expertise / mean(expertise over the public's members). If the mean is 0, the value is 0. | VERIFIED (data: 3,049/3,049) | `:231-246` |
| The 50 members of the 2 app-created publics have **no** expertise or ISR fields (the backfill predates them, and `createIssue` does not compute expertise). | VERIFIED (data) | `functions/index.js:549-562` |

---

## (c) Contribution

| Statement | Status | Evidence |
|---|---|---|
| **Contribution is not implemented in any score.** `contribution_score` is hard-coded to 0.0 and `normalized_contribution` to 1.0 for every member ("Neutral baseline as requested"). | VERIFIED (data: 3,049 × 0.0 and 3,049 × 1.0) | `scratch/backfill_expertise.py:247, 259, 262` |
| There is no accumulation, decay, negative handling or gISR in code. `gISR` and `AAuth` appear nowhere in code or docs. | VERIFIED (grep) | n/a |
| The `actions` data is **synthetic and random**: type_weight ~U(0.5, 2), time_hours ~U(0.1, 5), complexity ~U(0.8, 1.5), result_factor ~U(0, 1), marks are random ±1 from random users, sentiment = 0.5·Σmarks, vector_data is uniform-random integers, text is the template `"User performed {name} on {issue}."`, and dates are random from 2025-01-01 to 2026-06-01. | VERIFIED (data matches every range; 100% template text) | `scratch/generate_actions.py:9-83` |
| `actions` holds **1,080 flat docs + 108 per-user docs (`{uid, records[10]}`)**. The nested 1,080 records have different `action_id`s from the flat ones, so they come from two separate random generations (2,160 synthetic records in 1,188 docs). | VERIFIED (data) | `scratch/generate_actions.py:180-183` writes the per-user form; the writer of the flat form is not in the repo (UNSURE) |
| The client displays "Force" = type_weight × time_hours × complexity × result_factor and Sentiment, **display only**. | VERIFIED | `prototype/js/main.js:10480-10496, 10537-10561` |
| Mean normalisation for contribution: not implemented. For relevance and expertise, a zero mean gives 0. A negative mean cannot occur, because all inputs are ≥ 0. Contribution could be negative (sentiment) but is never used. | VERIFIED | `scratch/backfill_expertise.py:245-246` |

---

## (d) Aggregation and final normalisation

| Statement | Status | Evidence |
|---|---|---|
| Member ISR = w_R·(R / mean R) + w_E·(E / mean E) + w_C·1.0, with means taken over the members of the same public. No final normalisation, so values are unbounded (observed 0.452–3.269). | VERIFIED (data: exact linear fit in 190/190 publics, max error < 0.001) | `scratch/backfill_expertise.py:231-250` |
| The (w_R, w_E, w_C) used were read from the discussion doc at backfill time (default .4/.3/.3). The fitted triples are only (0.4, 0.3, 0.3)×133, (0.4, 0.2, 0.4)×49 and (0.5, 0.2, 0.3)×8, which are exactly the keyword-rule outputs of `scratch/seed_topic_weights.py:7-64`. They are **not** the Analyzer-style weights now on the issue docs. | VERIFIED (data) | `scratch/backfill_expertise.py:161-163` |
| **The ISR used for voting is a different number**: `discussions.isr_scores[uid]` = round(1.5 × floored relevance, 2) for 3,243/3,243 entries. It matches the member ISR for only 19 of 3,099 members. | VERIFIED (data) | `scratch/populate_discussions_scores.py:113`; `seed_db.py:266` |
| Vote tally: option score = Σ over voters choosing that option of `isr_scores[uid]` from the discussion doc (fallback: member `isr_score`, else 1.5×relevance). No normalisation, quorum or threshold. Computed **live in the browser**; not persisted. | VERIFIED | `prototype/js/main.js:4371, 4407-4476` |
| Stored `issues.options[].score` values are all integer 0 (157 options) and do not equal the live tally in 10 of 29 voted options. `winning_option_index` is only seeded; no code computes it. | VERIFIED (data + grep) | `prototype/js/main.js:4675, 4863` only read it |
| Votes are written by a client transaction `votes[uid] = optionIndex`. Any client can write any uid (see (f)). | VERIFIED | `prototype/js/main.js:4578-4583` |

---

## (e) Analyzer

| Statement | Status | Evidence |
|---|---|---|
| Model: `gemini-1.5-flash` via the Google Generative AI Node SDK (`google/generative-ai` package), `responseMimeType: application/json`. **No temperature, topP or seed is set** (API defaults apply). | VERIFIED | `functions/ai-helper.js:964-970, 994-1000` |
| Prompt: one unified prompt (`buildIssueAnalyzerPrompt`) with inline "pattern anchor" weight ranges and the full category taxonomy. | VERIFIED | `functions/ai-helper.js:56-423` |
| **The 100 examples are not sent to the model.** The prompt only *names* `ISR-Issue-Analyzer-100-Examples.md` and tells the model to "find the closest examples", but the file content is never included (no file read, no retrieval). | VERIFIED | `functions/ai-helper.js:60-66` |
| Without `GEMINI_API_KEY`, or on any error, the Analyzer silently uses a ~15-branch keyword fallback (`getLocalFallbackParams`). The client has a second, different keyword fallback. | VERIFIED | `functions/ai-helper.js:568-945, 958-1007`; `prototype/js/main.js:5868-6084` |
| Output normalisation fills defaults for any missing field and **does not check that weights sum to 1**. | VERIFIED | `functions/ai-helper.js:436-553` |
| **The submitter can edit all parameters**: relevance weights, ISR weights, expertise weights, domain, depth, min years, μ and fade. On a second "Check" the client sends `recalculate: true`, and the server then **skips the LLM** and uses the submitted values verbatim. No server-side validation. | VERIFIED | `prototype/js/modals.js:111-388`; `prototype/js/main.js:5797-5827`; `functions/index.js:669-715` |
| Logging: only `console.error` on failures. LLM prompts and raw outputs, chosen-vs-edited parameters and model versions are **not persisted**. No `logs` collection exists. | VERIFIED | `functions/index.js:105, 653, 947`; `functions/ai-helper.js:27, 975, 1005` |
| Whether `GEMINI_API_KEY` is configured in the deployed function is unknown. | UNSURE | n/a |

---

## (f) AAuth

| Statement | Status | Evidence |
|---|---|---|
| **No AAuth layers, thresholds, or request-and-consent path are implemented.** No code or doc mentions AAuth. | VERIFIED (grep over code + docs) | n/a |
| Authentication is "login by display name" (Firestore query `displayName == input`, no credential check). The uid is kept in localStorage and defaults to `"1"` when absent. "Register" creates a user doc with `uid = Date.now()`. | VERIFIED | `prototype/js/main.js:964-986, 989-1010, 2205, 3528` |
| Firestore rules allow **read and write of every document by anyone** until 2026-12-31. | VERIFIED | `firestore.rules:4-6` |
| An unauthenticated REST write was tested and succeeded (`users/test_user_rest`). | VERIFIED (data + script) | `scratch/test_unauth_write.py` |

---

## (g) Mocked, hard-coded, simulated or missing

**Mocked or random:**
- Random issue vector on missing key or failure: `functions/ai-helper.js:31-37`.
- Client-side `mockVector`, generated but unused: `prototype/js/main.js:6275-6278`.
- Random topic vectors on Vertex failure: `scratch/seed_topic_embeddings.py:74-80`.
- All `actions` are random: `scratch/generate_actions.py`.

**Hard-coded:**
- `contribution_score` = 0 and `normalized_contribution` = 1: `scratch/backfill_expertise.py:247, 259`.
- Discussion ISR = 1.5 × relevance: `scratch/populate_discussions_scores.py:113`.
- Relevance floors of 0.85 and 0.20: `:104-107`.
- Demo user "1" is always included: `:83`.
- Mock demo topics with fixed `isr_scores`: `prototype/js/main.js:30-135`.
- Keyword CBC and rarity tables: `backfill_expertise.py:32-76`.
- Keyword expertise depth: `seed_expertise_depth.py:10-54`.
- Keyword category and weights: `seed_topic_weights.py:7-64`.
- New users get fixed birthDate "1990-01-01" and a fixed Basel geography: `main.js:1003-1009`.
- Pseudo-random σ from a hash for display: `main.js:8838`.

**Missing:**
- Contribution scoring and gISR.
- Age penalty and recency decay.
- Use of the expertise sub-weights.
- AAuth and consent.
- Server-side validation.
- LLM/decision logging.
- Issue embeddings stored on issues (`issue_vector`).
- `resources`/`features` data on profiles.
- The script that created `profile_vector`/`experience_vectors`.
- The script that wrote the 78 seeded issues' parameters and reasoning strings (e.g. "Lobby and common areas issues…" does not occur in the repo).
- The script that duplicated the last message of 184 threads (see the discussions note in `MANIFEST.md`).

### Every LLM / embedding API call site

| File:line | API | Model | Purpose | Status |
|---|---|---|---|---|
| `functions/ai-helper.js:23-24` | Gemini API `embedContent` | `text-embedding-004` | issue description vector (live app) | VERIFIED |
| `functions/ai-helper.js:964-970` | Gemini API `generateContent` | `gemini-1.5-flash` | `analyzeIssue` endpoint | VERIFIED |
| `functions/ai-helper.js:994-1000` | Gemini API `generateContent` | `gemini-1.5-flash` | `checkIssue` endpoint | VERIFIED |
| `vectorizer/pipeline.py:27-42, 144-190` | Gemini REST `generateContent` | `gemini-flash-latest` (default, `vectorizer/run.py:127`), temperature 0.2 (step 1) / 0.3 (step 2) | values narrative → 145-item values vector (offline batch) | VERIFIED |
| `scratch/seed_topic_embeddings.py:60-70` | Vertex AI `TextEmbeddingModel.get_embeddings` | `text-embedding-004` | discussion topic vectors (offline; outputs since removed) | VERIFIED |
| `scratch/check_api_key.py:13`, `test_gemini_credentials.py:20-35`, `test_vertex_embeddings*.py`, `test_vertex_gemini.py:11`, `test_vertex_models.py:11-17` | Gemini / Vertex | various | connectivity tests only | VERIFIED |
| User profile and experience embeddings | n/a | n/a | not in repo | UNSURE |

---

## Specific data questions

**1. Units and scale of `skills.time`.** VERIFIED (data). `time` is the constant **1** on every `work experience` record (11,057) and every `activity` record (3,353). It is absent (null) on `education` records. "Totals per person" is therefore just a **count of work-experience records** (0–3, median 1; including activities gives a max of 4). The field carries no duration information. `backfill_expertise.py:207` reads it as *years* (`years = float(s.get("time", 1.0))`), so experience expertise is effectively Σ cos⁺ over jobs. No unit is documented in code. The docs speak of "years".

**2. How `resources_expertise` is computed with no resources or features data.** VERIFIED (code + data). It is computed from `skills[]` records of type **`activity`** (hobbies such as "Camping" or "Yoga"): Σ max(0, cos(activity vector, topic vector)) × keyword rarity (0.5/1.0/1.5) (`backfill_expertise.py:66-76, 210-212`). Data check: resources > 0 only for members who have an activity skill (886), and = 0 for all 2,163 without one.

**3. How `contribution_score`, `normalized_contribution`, `normalized_experience` and `isr_score` are computed.** VERIFIED (code + data).
- `contribution_score` = 0.0 constant.
- `normalized_contribution` = 1.0 constant. **No action is used.**
- `normalized_experience` = expertise_score / mean(expertise_score in the public).
- `isr_score` = w_R·normalized_relevance + w_E·normalized_experience + w_C·1.0.

All four are written by `scratch/backfill_expertise.py:231-264`.

**4. How `microcommunities.values_taxonomy` is aggregated with only ~227 values vectors.** VERIFIED (data, 190/190 exact). It is the **relevance-weighted mean over the members who have a `values_taxonomy`**, rounded, per element, skipping nulls. Defaults when no member has a value: 50 for domains/items/conflicts, 0 for shifts. Members without a taxonomy are simply ignored. Per public only **3–16 members (median 5)** contribute, of 13–25 members. The algorithm matches `functions/index.js:413-527`, but the writer for the 190 seeded publics is not in the repo (UNSURE which script ran it). The 2 app-created publics have no `values_taxonomy`. Note that live `users` now has 240 taxonomies against 227 in the earlier local-file export.

**5. The non-user document in `users` (uid null, fields doc_id and note).** VERIFIED. The live doc `users/test_user_rest` contains only `displayName: "Test Rest User"`. It was created by `scratch/test_unauth_write.py`, an **unauthenticated REST POST** that succeeded because of the open rules. The `doc_id`/`note`/`uid: null` row in `profiles_002.jsonl` is not Firestore content. The earlier exporter **synthesised** it (`scratch/export_scripts/step2_population_export.py`, "test_user_doc = {...}"), because that export read `db/profiles.json` rather than live Firestore.

**6. Do the Analyzer outputs in `issues` follow the 100-example library?** VERIFIED (data). **No.**
- No issue contains Analyzer-protocol objects (`classification`, `geographic_parameters`, `demographic_rules`, `resources_needed`, `expertise_domain_parameters`).
- Categories are coarse 2-level labels ("general.civic" ×31, "building.maintenance" ×14, …) from `seed_topic_weights.py`-style rules, not the 3-level taxonomy.
- Parameters collapse to a handful of templates: (w_D, w_G, w_S, w_X) = (0.1, 0.4, 0.4, 0.1) with μ/σ = 100/50 on 29 issues, which equals the `checkIssue`/`createIssue` **defaults** (`functions/index.js:143-153, 671-674`), plus 19 identical "Lobby and common areas…" issues.
- Expertise weights are 0.3/0.4/0.3 on **all 80** (the default).
- One issue (`15`) has ISR weights summing to 0.70.
- Individual parameter vectors do coincide with some library values (58/80 relevance vectors and 48/80 ISR vectors appear somewhere in the 100), but **no issue matches a single example on relevance + ISR + expertise + μ/σ together (0/80)**.
- The "Chess club" app issue equals the client keyword fallback exactly (`prototype/js/main.js:5983-5990`).
