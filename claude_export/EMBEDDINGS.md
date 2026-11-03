# EMBEDDINGS.md: user embeddings export

Source: Firestore collection `user_vectors` (9,150 docs), read live on 2026-10-12 (read-only).
Every statement is marked **VERIFIED** (checked against data or code) or **UNSURE**.

## Files

| File pattern | Shape | Rows | Content |
|---|---|---|---|
| `emb_profile_000..002.npy` | float32, (n, 768) | 9,150 total (3413 + 3413 + 2324) | `user_vectors.profile_vector`, one per user |
| `emb_profile_00k_ids.json` | list of `{doc_id, uid}` | row-aligned with the `.npy` of the same index | `uid` is an integer |
| `emb_experience_000..005.npy` | float32, (n, 768) | 20,245 total | `user_vectors.experience_vectors[<key>]`, one row per skill record |
| `emb_experience_00k_ids.json` | list of `{doc_id, uid, experience_key}` | row-aligned | `experience_key` = the skill `id` inside `users.skills[]` |

Rows are in Firestore document-id order. Within a user, experience rows are sorted by numeric key. Load with `np.load(path)`; no pickle is needed.

## Facts

| # | Statement | Status |
|---|---|---|
| 1 | Dimension is 768 for all 9,150 profile vectors and all 20,245 experience vectors. | VERIFIED (export run) |
| 2 | Normalisation: every vector is L2-unit. Profile norms range from 0.999998 to 0.999999 and experience norms from 0.999994 to 1.000000. No zero vectors. The exporter did **not** renormalise; this is how the vectors are stored. | VERIFIED |
| 3 | The stored float64 values were cast to float32 for export. Max error is about 1e-7 per component. | VERIFIED |
| 4 | Experience vectors cover **all three skill types**, not only work experience: 11,057 `work experience`, 5,835 `education` and 3,353 `activity`. Every key matches a skill `id` of the same user (20,245/20,245). 7,595 users have at least one experience vector. | VERIFIED |
| 5 | The live vectors are bit-identical (atol 1e-6) to the local files `db/profiles_vectors/*.json` (9,150/9,150) and `db/experience_vectors/*.json` (20,245/20,245). Those files have mtime 2026-01-31 and hold only `{uid, vector}` or `{uid, id, vector}`. | VERIFIED |
| 6 | Creation date: the vectors themselves were created on or before **2026-01-31** (local file mtime). The `user_vectors` Firestore docs were written on **2026-06-09 11:43–11:56 UTC** (Firestore `create_time` = `update_time`) by `migrate_option_a.py:63-67`, which moved `profile_vector`/`experience_vectors` out of `users` docs. | VERIFIED (dates); exact generation date UNSURE |
| 7 | Model: **probably Google `text-embedding-004`** (768-d, unit-norm output). That is the only embedding model referenced anywhere in the repo: `functions/ai-helper.js:23`, `scratch/seed_topic_embeddings.py:60`, `docs/ISR-Relevance-Implementation.md:668-675`. However, **the script that generated the user vectors is not in the repository**, and the model cannot be confirmed from the data. | UNSURE |
| 8 | Task type (`RETRIEVAL_DOCUMENT` vs `SEMANTIC_SIMILARITY` etc.): unknown. `scratch/check_api_key.py:16` tests `task_type="retrieval_document"`, but that is a connectivity test, not the generator. | UNSURE |
| 9 | Input-text template for `profile_vector`: **not recoverable from the repo**. The docs describe the *intended* template as "tags + values + professional field + activity history" (`docs/ISR-Relevance-Implementation.md:389`) or "interests, values, profession, skills, features" (`:666`). Neither is implemented in code. | UNSURE |
| 10 | Input-text template for experience vectors: the docs give `"${degree_type} in ${specialization} from ${institution}"` and `"${years_active} years as ${job_title} in ${specialization}"` (`docs/ISR-Expertise-Assessment-v1.md:458-471`). Those field names do not exist in the profile data (skills have `name`, `comment`, `specialization`, `educationLevel`, `graduationYear`, `time`), so the doc template cannot be the one that was used. | UNSURE (doc template demonstrably not used verbatim) |
| 11 | Anisotropy: the median cosine between random pairs of profile vectors is **0.91**, and between a user's experience vectors and their own profile vector it is 0.66. Similarity values are compressed into a narrow high band, which matters for any threshold on S. | VERIFIED (3,000-pair sample) |
| 12 | No issue or topic embeddings are currently stored. `discussions.embedding`/`topic_vector` were written by `scratch/seed_topic_embeddings.py:96-100` but are **absent** from all 192 live discussion docs. `issues` has no `issue_vector`. | VERIFIED (field absent in export) |

## How the vectors are used in code

- `functions/index.js:275-304`: S = max(0, cos(issueVector, profile_vector)) for the top 300 pre-filtered candidates. `issueVector` comes from `aiHelper.vectorizeText(description)` and is **a random unit vector when `GEMINI_API_KEY` is absent or the call fails** (`functions/ai-helper.js:31-37`).
- `scratch/backfill_expertise.py:187-212`: cos(skill experience vector, topic vector) feeds education, experience and resources expertise.
- `relevance_evaluator.py:124-137`: reads `user['profile_vector']` from the `users` doc. After the 2026-06-09 migration that field no longer exists there, so this path now returns the constant **0.5**.
