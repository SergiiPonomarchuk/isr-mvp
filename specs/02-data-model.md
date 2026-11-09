# 02 Data model
Status: PARTIAL   Verified against: commit `0620f27` (PD-6); data as exported 2026-10-12
Owns contradictions: C-44, C-45 (shared with 14), C-28 and C-32 (collection parts) (see [README](README.md#contradiction-map))

## Purpose
Lists the Firestore collections and fields, who writes them, and the invariants that hold or fail in the stored data. Score formulas live in the component files (03-08), not here.

## Intended design
The docs do not agree on one collection set (see Gaps).
- **Relevance engine:** `docs/ISR-Relevance-Implementation.md` Part 7 (l.552-657): `issues`, `microcommunities`, `microcommunity_members`, `user_packs`, `user_vectors`.
- **Expertise:** `docs/ISR-Expertise-Assessment-v1.md` Part 4 (l.251-428): `user_expertise_profiles` and `microcommunity_expertise_scores`; education and experience records. **[PD-8](decisions/PD-8-resources-option-level.md)** (supersedes PD-2): no resource records in Expertise; resources and money belong to the options; `users.birthDate` is required (it sets the Expertise age floor).
- **Contribution:** `docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md` Part V (l.433-559): `issue_actions`, `user_action_vectors`, and `absolute_contribution` in `microcommunity_members`.
- **Analyzer:** `docs/ISR-Issue-Analyzer-Protocol-v1.md` §5 (l.545-646, output schema stored on `issues`) and §6.1 (l.652-657): `microcommunity_relevance_scores` and `microcommunity_expertise_scores`; `users` fields `roles`, `building_id`, `user_location`, `education_records`, `experience_records`, `resources`.
- **Vision only** (superseded, S0-D1): the manifesto's six-collection matrix (l.144-153) and its snake_case rule (l.155-159).
- **Terminology** ([PD-7](decisions/PD-7-terminology.md)): the collection names `microcommunities` and `microcommunity_members` are as-built facts. In the specs, these records are called "ad-hoc public" and "public members".

## As built

### Collections
Counts are from the live export of 2026-10-12. Field lists: `claude_export/SCHEMA.md` §2, which uses sample-based types from an earlier session.

| Collection | Docs | Key | Content | Written by | Evidence |
|---|---:|---|---|---|---|
| `users` | 9,151 | uid as string | Profile, `geography`, `socialRelations`, `skills`, `post`, `features`, `values_description`, `values_taxonomy` | Seeding (writer of the base population UNSURE); app "Register" with `uid = Date.now()`; one test doc via unauthenticated REST | SCHEMA l.34-56; IF l.128 (`prototype/js/main.js:989-1010`); IF l.197 |
| `user_vectors` | 9,150 | uid as string | `profile_vector` (768), `experience_vectors{skill id: 768}` | `migrate_option_a.py:63-67`, which moved the vectors out of `users` on 2026-06-09. The generator is not in the repo. | EMBEDDINGS #6, #7; SCHEMA l.208-217 |
| `user_packs` | 37 | `pack_id` | `users[]`: profile metadata chunks (~250 users each) | Writer UNSURE. Read by the Cloud Function. | SCHEMA l.233-241; `functions/index.js:187, 752` (re-checked) |
| `discussions` | 192 | discussion id | Thread metadata, `participants`, cached `relevance_scores` / `isr_scores` maps | `seed_db.py`, `scratch/seed_discussions.py`; maps by `scratch/populate_discussions_scores.py` and `seed_db.py` | SCHEMA l.21329-21347; MANIFEST l.67; IF l.59, l.101 |
| `discussions/{id}/messages` | 1,694 | message id | `text`, `uid`, `timestamp`, `parentID`, `child[]`, `marks` | Seeding; the app (5 later messages); `scratch/seed_reactions.py` re-seeded `marks` | SCHEMA l.21390-21403; MANIFEST l.64-70 |
| `issues` | 80 | issue id (auto-id for app issues) | Title, location, flat weights, μ/σ, `affection_distance`, `options`, `votes`, `tasks`, cached maps, reasoning strings | `createIssue` (`functions/index.js:353`, re-checked) for app issues; the writer of the 78 seeded issues is not in the repo | SCHEMA l.21428-21472; IF l.164 |
| `microcommunities` | 192 | auto-id (app) / string number (seeded) | `issue_id`, `member_count`, `member_accepted`, `threshold_relevance`, `status`, `issue_scope`, `values_taxonomy` | `createIssue` (`functions/index.js:410`, re-checked); seeded by `scratch/seed_microcommunities_relevance.py`; writer of the seeded `values_taxonomy` UNSURE | SCHEMA l.21544-21559; IF l.16, l.195 |
| `microcommunity_members` | 3,099 | `${microcommunity_id}_${user_id}` (app) | `D/G/S/X_score`, `relevance_score`, expertise parts, `expertise_score`, `contribution_score`, normalised values, `isr_score`, `displayName`, `accepted_rejected` | `createIssue` (`functions/index.js:550`, re-checked); seed script; expertise and ISR fields by `scratch/backfill_expertise.py:231-264` | SCHEMA l.21643-21668; IF l.16, l.193 |
| `actions` | 1,188 | action id / uid | 1,080 flat action docs plus 108 per-user docs `{uid, records[10]}`: type_weight, time_hours, complexity, result_factor, marks, sentiment_scalar, `vector_data` | `scratch/generate_actions.py:180-183` (per-user form); writer of the flat form UNSURE | SCHEMA l.21697-21718; IF l.88-89 |

**Absent** (0 documents): `voting`, `tasks`, `values`, `contributions`, `logs`, `embeddings` (SCHEMA l.23-28, l.21783-21790). Issues in the voting and task phases live in `issues`, distinguished by `status` (SCHEMA l.21785-21786).

Code use (grep of `collection("…")` in `functions/index.js` and `prototype/js/*.js`, 2026-10-12): `users` 35, `discussions` 22, `issues` 15, `messages` 9, `microcommunity_members` 9, `microcommunities` 7, `user_packs` 2, `user_vectors` 2, `actions` 1. There are no references to `voting`, `tasks` or `values`.

### Invariants and known data defects
| Statement | Status | Evidence |
|---|---|---|
| uid types are mixed: `users.uid` and `microcommunity_members.user_id` are integers; `discussions.creator_uid`, `messages.uid` and `actions.uid` are strings; `participants[]` holds each uid both as a string and as an int. | VERIFIED (data) | SCHEMA l.53, l.21337, l.21403, l.21668, l.21717; MANIFEST l.57 |
| Field naming is mixed: snake_case (`last_message_text`, `relevance_scores`) next to camelCase (`displayName`, `socialRelations`, `birthDate`, `parentID`) and capitalised (`D_score`). | VERIFIED (data) | SCHEMA l.41-55, l.21400, l.21650-21657 |
| The cached `relevance_scores` / `isr_scores` maps on `discussions` and `issues` are floored (creator ≥ 0.85, others ≥ 0.20), always include user "1", and `isr_scores` = round(1.5 × floored relevance, 2). | VERIFIED | IF l.59, l.101; details in [06](06-aggregation-and-voting.md) |
| `message_count` matches the size of the messages subcollection for only 8 of 192 threads. 184 threads contain a duplicated final message, and the duplicating script is not in the repo. | VERIFIED (data) | MANIFEST l.67, l.70 |
| `actions` mixes two shapes from two separate random generations. | VERIFIED (data) | IF l.89 |
| `users.features` is empty for all users, and `skills.time` is the constant 1 on every work-experience and activity record. | VERIFIED (data) | IF l.32, l.183 |
| `profile_vector` no longer exists on `users` (it moved to `user_vectors` on 2026-06-09), but `relevance_evaluator.py` still reads it from `users`, so S there is now the constant 0.5. | VERIFIED | EMBEDDINGS #6 and l.38 |
| No issue stores an embedding (`issue_vector`), and no discussion stores `embedding` / `topic_vector` any more. | VERIFIED (data) | EMBEDDINGS #12 |
| The seeded issues carry no Analyzer-protocol objects (`classification`, `geographic_parameters`, `demographic_rules`, `resources_needed`, `expertise_domain_parameters`), only flat fields. | VERIFIED (data) | IF l.200; SCHEMA l.21432-21472 |
| The 2 app-created publics have no `values_taxonomy`, and their 50 members have no expertise or ISR fields. | VERIFIED (data) | IF l.78, l.195 |
| `users` holds personal fields (`email`, `firstName`, `lastName`) on the synthetic population. Exports strip them. | VERIFIED | SCHEMA l.43, l.45, l.48; MANIFEST l.58; PLAN l.46 |
| No invariant is enforced server-side: the Firestore rules allow anyone to read and write every document until 2026-12-31. | VERIFIED | IF l.129 (`firestore.rules:4-6`); details in 09 |
| For seeded publics, `microcommunity_id` equals the numeric discussion/issue id (example: `microcommunity_id` "1", `issue_id` "1"). Whether this holds for all 190 seeded publics is not verified. | UNSURE | SCHEMA l.21568-21637 |

## Gaps
- **C-44** Collections: the manifesto, `project-map.md` and the `query_isr_firestore` skill name six collections, of which three are empty, while the code uses five unlisted ones. The design docs name a further five collections that do not exist: `user_expertise_profiles`, `microcommunity_expertise_scores`, `microcommunity_relevance_scores`, `issue_actions`, `user_action_vectors`.
- **C-45** Naming: the snake_case rule (vision and agent files) is broken by the data and by the design docs themselves (Analyzer l.364-368 `minAge`, `employmentStatus`; Relevance doc l.614, l.633-640 `displayName`, `birthDate`, `socialRelations`).
- **C-28** (collection part): the Expertise doc's record structures and collections do not exist. Expertise reads `users.skills[]` instead (education and work-experience records; `activity` records no longer count after A2, PD-8).
- **C-32** (collection part): the Contribution doc's `issue_actions` / `user_action_vectors` / `absolute_contribution` correspond to the real `actions` and `contribution_score` (IF l.86, l.89).
- The Analyzer's `users` fields (`roles`, `building_id`, `user_location`, `education_records`, `experience_records`, `resources`) do not exist (SCHEMA l.41-55).
- Options carry no funding source or needed resources (PD-8) at `0620f27`; A3 adds them (branch, not merged). See [06](06-aggregation-and-voting.md).

## Interfaces
- [03 relevance](03-relevance.md) reads `user_packs`, `user_vectors` and the issue parameters, and writes `microcommunity_members` (D/G/S/X, `relevance_score`) and the cached maps.
- 04 expertise reads `users.skills`, `user_vectors.experience_vectors` and `issues.w_*`, and writes the expertise fields in `microcommunity_members`.
- [06](06-aggregation-and-voting.md) reads `microcommunity_members` and `discussions.isr_scores`, and writes `issues.votes`.
- 08 values reads `users.values_taxonomy` and writes `microcommunities.values_taxonomy`.
- 11 seeding writes nearly everything (see the "Written by" column).

## Tests
None. There is no schema validation, no test suite, and no Firestore rules that enforce structure.

## Open questions
1. What is the intended canonical collection set? The docs conflict (C-44) and no decision page settles it.
2. Should the naming rule be kept as a target, or dropped (C-45)? This belongs in 14-conventions.
3. What is the intended uid type: integer or string?
4. What should the key of `microcommunity_members` be: microcommunity id or issue id? PLAN.md l.20 says `{issueId}_{uid}`; the code uses the microcommunity id (`functions/index.js:550`).

## Change history
- S0 (2026-10-12): created.
- A3 (2026-11-05, branch `a3-options-and-g-anchors`, not merged): `discussions.options_v2[]` gets `funding_source` (string) and `resources_needed` (strings); cost stays in `budget`. `microcommunity_members` get `G_anchor_type` (`home`/`work`/`property`) and `D_match` (`place`/`property_kind`/`feature`/null) for new publics. `users.geography[]` may hold `type: "property"` entries with `kind` (`flat`, `house`, `land`, `garage`, `commercial`, `other`) and optional `place`; none exist in the data. The Analyzer's `demographic_rules` gets `places` and `property_kinds`.
- A1 v2 (2026-11-08; merged as PR 7, live 2026-11-09): `microcommunity_members` of new publics get `education_expertise`, `experience_expertise`, `expertise_score`, `normalized_*`, `contribution_source`, `isr_score` from `createIssue`; `issues` / `discussions` `relevance_scores` and `isr_scores` become a server-written cache of the member values; `issues` get `tally` {computed_at, microcommunity_id, isr_source, counted, excluded, note}, `options[].score`, `winning_option_index` and `tasks` from the trigger.
- A1b (2026-11-09, branch `a1b-expertise-placeholder`): members of publics without E and ISR (the app-created publics from before A1) get `expertise_score` 0.0, the new field `expertise_source` ("no_issue_vector"), the A1 `normalized_*`, `contribution_source` and `isr_score`; their topics' `relevance_scores` / `isr_scores` maps are rewritten from the members. Stage 1 replaces the placeholder.
- L1 (2026-11-09, branch `l1-deadlines`, not merged): every chat has a deadline (`ends`, `YYYY-MM-DD`; default creation + 1 month; "Ongoing" no longer written); the deadline of the current phase is written to both `issues` and `discussions`; seeded discussions of voting and ToDo topics get `status` `Voting` / `approved`; canceled at the deadline = `status: "inactive"`, `previous_status`, `cancel_reason: "deadline"`; each deadline-run change appends `{at, by: "deadline", from, action, reason, voted_share, deadline, new_deadline}` to `lifecycle` on both documents.
- R0 (2026-11-07, branch `r0-keep-alive`, not merged): `firestore.rules` keep client access open until 2027-06-30 for every collection except `issue_drafts`, which only the Cloud Functions (Admin SDK) can read and write.
- A2 (2026-11-04, branch `a2-expertise-cleanup`, not merged): new server-only collection `issue_drafts` (parameters derived by `checkIssue`; read and deleted by `createIssue`; `functions/params.js`). Removed fields: `microcommunity_members.resources_expertise`; `issues`/`discussions` `w_education`, `w_experience`, `w_resources`, `reasoning_education`, `reasoning_experience`, `reasoning_resources`. `birthDate` required by `seed_db.py`. Data changed on the emulator only (`scripts/migrate_a2.py`, report `tasks/A2-migration-report.md`); the live data still has the old fields until the author runs the migration.
