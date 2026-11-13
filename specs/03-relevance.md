# 03 Relevance
Status: PARTIAL   Verified against: historical audit `0620f27` (PD-6); A5 input guard verified at `a817694` (not a re-audit of legacy statements below)
Owns contradictions: C-06 to C-15, C-18; shares C-16 with 12 (see [README](README.md#contradiction-map))

## Purpose
Relevance R measures how directly an issue and its resolution affect a user. It is built from four components: demographic D, geospatial G, semantic S and social X. R decides who forms the issue's ad-hoc public and is one input to the member ISR ([06](06-aggregation-and-voting.md)).

## Intended design
- **Formula:** R = w_D·D + w_G·G + w_S·S + w_X·X, with the weights summing to 1 and D, G, S, X in [0,1], so R is in [0,1]. Sources: `docs/ISR-Relevance-Implementation.md` l.14 and §6.1 (l.497-507); `docs/ISR-Issue-Analyzer-Protocol-v1.md` §6.2 (l.659-669).
- **D, demographic:** Relevance doc §1.2 (l.59-92) and Part 2 (l.241-313); Analyzer §2.2 (l.354-405).
  - **Overridden by [PD-1](decisions/PD-1-scope-inclusion-soft-d.md):** D is a soft score, never a gate, and materially affected members are never hard-excluded. There is no hard-coded list of protected attributes; the Analyzer flags missing or proxy attributes.
  - The overridden doc text: Relevance doc pipeline phase 1 (l.22-24) and §2.1 (l.243-253); Analyzer §2.2.1 (l.358-377).
- **G, geospatial:** a threshold Gaussian. G = 1 when d ≤ μ, and exp(−(d−μ)²/2σ²) otherwise, where d is the Haversine distance to the user's anchor. Sources: Relevance doc §1.2 (l.96-130) and Part 3 (l.317-375); Analyzer §2.3 (l.407-436). Suggestion tables: Relevance doc §3.2 (l.333-341), Analyzer §2.3.1 (l.419-426), Request Guide step 3 (l.86-122).
- **S, semantic:** S = max(0, cos(profile vector, issue vector)), using 768-d embeddings. Sources: Relevance doc §1.2 (l.134-154) and Part 4 (l.379-420); vectors in 12-embeddings.
- **X, social:** depth-1 relations of the issue submitter. X = `tie` if set; otherwise 0.3 for spouse/partner, 0.2 for parent/child/sibling, 0.1 for grand-relations and close friends, and 0 for everyone else. Sources: Relevance doc §1.2 (l.158-211) and Part 5 (l.424-493).
- **Pipeline and membership:**
  - Upper-bound pruning at S = 1 against 0.15, then S for the top 300 candidates (Relevance doc l.18-38, §6.3 l.517-548, Part 9 l.694-727).
  - PD-1 instead requires candidate retrieval over several channels (G, D, X, S) followed by scoring, and that all affected members take part. w_R does not affect inclusion.
- **Weights:** set per issue by the Analyzer (Analyzer §2.1 l.314-352; `docs/ISR-AI-Weight-Evaluation-Instructions.md` §2). The submitter can review them (Request Guide step 4, l.128-186). Who may edit them is open (PD-4); see 07.
- **Threshold:** see Gaps, C-06 and C-07. The docs disagree.

## As built

### Local residential input guard (A5)

- **VERIFIED at `a817694`:** for unit/building scope, generic flat/house kinds are removed from both normalized demographic aliases; other kinds and explicit places remain. Broader scopes retain their filters. This is the approved A5 interpretation rule; the A3 D/G engines and nearest home/work/property logic are unchanged. Evidence: `functions/issue-scope.js:13`, `functions/ai-helper.js:632`, `functions/params.js:90`; spec [A5](tasks/A5-local-residential-scope.md).
- **VERIFIED:** prompt p4 requests that interpretation; raw model output stays auditable, effective filters are logged/stored/used consistently. A previously checked offending draft receives 409 and requires a new Check. Evidence: `functions/ai-config.js:17`, `functions/ai-helper.js:268`, `functions/params.js:150`; `functions/test/issue_scope.test.js` and [emulator report](tasks/A5-emulator-report.md).


### Variants
There are four implementations (IF §0, l.11-18):

| Path | File | Produced live data? |
|---|---|---|
| A. Cloud Function `createIssue` / `checkIssue` | `functions/index.js:111-656`, `:659-950` | Only the 2 app-created publics (50 members). VERIFIED (data) |
| B. Python seeder `relevance_evaluator.py` via `scratch/seed_microcommunities_relevance.py` | `relevance_evaluator.py:36-181`; `scratch/seed_microcommunities_relevance.py:87-105` | The 190 seeded publics (3,049 members). VERIFIED (data) |
| C. Client fallback | `prototype/js/main.js:5868-6180`, duplicate in `prototype/js/relevance.js:53-261` | No stored doc. Runs when the Cloud Function call fails. VERIFIED |
| D. `prototype/relevance_evaluator.js` | JS port of B | Not loaded by `prototype/index.html:659-667`. Dead code. VERIFIED |

### Path A (Cloud Function)
| Statement | Status | Evidence |
|---|---|---|
| R = w_D·D + w_G·G + w_S·S + w_X·X, with no clamp. | VERIFIED | IF l.30 (`functions/index.js:319`) |
| D is binary (0/1) and a hard gate: if D = 0 and w_D > 0, the user is excluded unless they are the creator. D uses age from birth year; employment = `post` non-empty; family = child/grandchild relation types; features = keyword match with a pet/animal special case. | VERIFIED | IF l.31 (`functions/index.js:217-218`, `:40-92`) |
| `features` is empty for all 9,150 users, so any issue with a `features` criterion excludes everyone except the creator. | VERIFIED (data) | IF l.32 (`functions/index.js:76-89`) |
| `employmentStatus` "student"/"retired" (offered in the prompt) are not implemented; they fall through to D = 1. | VERIFIED | IF l.33 (`functions/index.js:55-59`; `functions/ai-helper.js:133`) |
| G: 1.0 within μ, Gaussian decay beyond μ, hard exclusion beyond μ + 3σ (when w_G > 0). Users without a `home` anchor are excluded; the creator gets G = 0. | VERIFIED | IF l.34 (`functions/index.js:221-235`) |
| μ and σ come from the request, with defaults μ = 100 m and σ = 50 m. The client sends σ = fade / 3 from the "Affect Fade (3σ)" input. | VERIFIED | IF l.35 (`functions/index.js:148-153`; `prototype/js/main.js:5800-5805`) |
| Upper-bound pre-filter: drop the user if w_D·D + w_G·G + w_S·1 + w_X·X ≤ 0.15. | VERIFIED | IF l.36 (`functions/index.js:252-253`) |
| S = max(0, cos(issueVector, profile_vector)), computed only for the top 300 candidates by upper bound. Everyone else gets S = 0. | VERIFIED | IF l.37 (`functions/index.js:268-317`) |
| The issue vector is random when `GEMINI_API_KEY` is unset or the embedding call fails. | VERIFIED | IF l.38 (`functions/ai-helper.js:18-40`) |
| Inclusion threshold R > 0.15. The public is capped at the top 100, and the creator is always added. `checkIssue` returns the top 25. | VERIFIED | IF l.39 (`functions/index.js:321, 335-350, 896-910`); `> 0.15` re-checked at `functions/index.js:321, 882` |
| X uses only the submitter's `socialRelations` (`r.relative === user.uid`): `r.tie` if present, else 0.3 / 0.2 / 0.1 / 0. Relations of other users, reciprocity and multi-hop ties are ignored. | VERIFIED | IF l.40 (`functions/index.js:169-178, 237-249`) |
| Weight defaults when absent: w_D 0.1, w_G 0.4, w_S 0.4, w_X 0.1. | VERIFIED | IF l.41 (`functions/index.js:143-146`) |
| The threshold is the literal 0.15. There is no input to change it; `threshold_relevance: 0.15` is written to the public. | VERIFIED (grep, 2026-10-12) | `functions/index.js:253, 321, 537`; `prototype/js/main.js:6345` |
| `legal_coverage` (PD-1) does not exist. | VERIFIED (grep, 2026-10-12) | n/a |

### Path B (Python seeder; produced 3,049 of the 3,099 stored member scores)
| Statement | Status | Evidence |
|---|---|---|
| D is not a gate and is never 0. It is a category/topic keyword heuristic: childcare 1.0/0.5/0.1, governance 1.0 or 0.8, social/event 1.0 or 0.5, utilities + EV 1.0 or 0.5, anything else 1.0. | VERIFIED (data: D ∈ {1.0: 2710, 0.5: 388, 0.1: 1}) | IF l.47 (`relevance_evaluator.py:36-87`) |
| G: μ = `affection_distance` (km) × 1000, σ = 0.5·μ (ignores `sigma_decay_meters`), no hard cutoff. No home anchor gives G = 0; no topic location gives G = 1. | VERIFIED (code) | IF l.48 (`relevance_evaluator.py:89-122`) |
| S = cos(users.profile_vector, discussion.embedding/topic_vector), defaulting to 0.5 if either is missing. Topic embeddings came from Vertex `text-embedding-004` on the first message text; on API failure, random uniform(−0.1, 0.1) vectors were used. | VERIFIED (code); topic vectors since deleted (data) | IF l.49 (`relevance_evaluator.py:124-137`; `scratch/seed_topic_embeddings.py:35-80`) |
| Since the 2026-06-09 migration, `profile_vector` is no longer on `users`, so this path now returns S = 0.5 for everyone. | VERIFIED | EMBEDDINGS l.38 |
| X: the same submitter-relations rule as path A. | VERIFIED | IF l.50 (`relevance_evaluator.py:139-166`) |
| R = clamp₀¹(w·[D, G, S, X]), with defaults 0.2 / 0.6 / 0.1 / 0.1. | VERIFIED | IF l.51 (`relevance_evaluator.py:168-181`) |
| Membership was not selected by relevance: the seeded members are exactly the discussion participants (3,049/3,049), and one of them has R = 0.103 < 0.15. | VERIFIED (data) | IF l.52 (`scratch/seed_microcommunities_relevance.py:56-59, 81-105`) |
| The weights used for the stored R differ from the weights now on the discussion/issue docs, for all 190 seeded publics. The weights were rewritten after the scores were computed. | VERIFIED (data, per-public grid fit) | IF l.53 |

### Path C (client fallback) and path D
Path C duplicates the relevance logic in the browser and is used only when the Cloud Function call fails. Its exact differences from path A are not itemised in IF (UNSURE). Path D is dead code (IF l.18).

### Related facts
- Embedding anisotropy: the median cosine between random pairs of profile vectors is 0.91, so S values are compressed into a narrow high band. This matters for any threshold that involves S (EMBEDDINGS #11, VERIFIED on a 3,000-pair sample).
- The cached, floored relevance values shown in the UI and used for voting are described in [06](06-aggregation-and-voting.md) (IF l.59).

## Gaps
| Id | Intended | As built |
|---|---|---|
| C-10 | D is a soft score, never a gate (PD-1, *decided*) | Path A: binary hard gate. Path B: never 0. |
| C-11 | No hard exclusion (PD-1); the docs offer "student"/"retired" and `features` rules | `features` excludes everyone (`users.features` is empty); "student"/"retired" give D = 1. A3: `features` also matched against interests (`activity` names); `places` / `property_kinds` are a cause to include |
| C-08 | All affected members take part; w_R does not affect inclusion (PD-1, *partly decided*) | Top-100 cap, creator always added; seeded members = discussion participants |
| C-06 | "≥ 0.15" (manifesto l.204, mvp-current-spec l.32, skill l.27) vs "> 0.15" (Relevance doc l.519, l.542; Request Guide l.365; `mvp.html` l.701) | `> 0.15` (`functions/index.js:321`) |
| C-07 | "Can be changed at issue creation" (manifesto l.205) vs "do not expose the threshold" (manifesto l.385; project-map l.40) | Not changeable (literal 0.15) |
| C-12 | Decided by the docs (2026-11-04, l.111, l.374-388): the nearest of home, work and registered property | Home only at `0620f27`. A3 (branch, not merged): nearest of home, work and property in A and B; stored G recomputed for 74 publics with a stored location; 118 unchanged (see A3 CHANGES) |
| C-13 | The formula has no cutoff (Relevance doc l.103-106), but the pipeline and code samples cut off at μ + 3σ (l.27, l.369-370; Analyzer l.414). PD-1 may forbid hard exclusion (open question 1). | A: cutoff; B: no cutoff, σ = 0.5·μ |
| C-14 | Relevance doc §3.2 and Analyzer §2.3.1 give different μ/σ tables (e.g. district σ 200–500 m vs 1200–2500 m) | Defaults μ = 100 m, σ = 50 m, which appear in neither table; 29 issues carry them (IF l.202) |
| C-15 | The Request Guide calls σ the "impact radius" (l.88), with values matching the Relevance doc's μ ranges | The client derives σ = fade / 3 |
| C-16 | Issue vector stored as `issues.issue_vector` (Relevance doc l.395, l.690) | Not stored; random when the API key is missing (IF l.38; EMBEDDINGS #12) |
| C-18 | No default weights in the docs (examples only) | A: 0.1/0.4/0.4/0.1. B: 0.2/0.6/0.1/0.1. |
| C-09 | Joining by special request and voting (Request Guide l.371) | [U10](tasks/U10-similar-active-issues.md) implements explicit discussion-phase joining, including beyond 100 members. Voting-phase joining remains pending. Browser/live acceptance is outstanding. |
| (none) | R in [0,1] (Relevance doc l.507) | A: no clamp, and the weights are unvalidated, so R can exceed 1 (whether any stored R does is UNSURE). B: clamps. |
| (none) | S computed for all candidates surviving the upper-bound check (up to 300) | Same. Everyone else gets S = 0, which matters under PD-1's multi-channel retrieval. |
| (none) | `legal_coverage` triage (PD-1) | Absent |

## Interfaces
- **Inputs:**
  - users from `user_packs` (`functions/index.js:187`);
  - `user_vectors.profile_vector` for the top 300;
  - issue parameters (weights, μ/σ, demographics, location) from the request or the Analyzer (07);
  - the issue vector (12).
- **Outputs:**
  - `microcommunity_members.{D_score, G_score, S_score, X_score, relevance_score}`;
  - the public's member list (`microcommunities.member_count`);
  - the cached `relevance_scores` maps on `discussions`/`issues` (seeded, floored; see 06).
- **Used by:** [06](06-aggregation-and-voting.md) (normalised R in the member ISR); 08 (the relevance-weighted public VoV, IF l.195).

## Tests
- No automated tests.
- `scratch/test_local_relevance.py` exists; it is an ad-hoc script, and what it checks is UNSURE.
- A1 (AC2) would add a test that relevance with clamp=True reproduces the stored path B `relevance_score`.

## Open questions
1. Does PD-1 ("never hard-excluded") forbid the hard cutoff at μ + 3σ in G, and the 0.15 pruning?
2. What is the intended threshold sign (≥ or >), and may the submitter change the threshold (C-06, C-07)?
3. Which μ/σ table is normative (C-14)? What should σ mean in the UI (C-15)?
4. Should X consider only the submitter's relations (as now), or also relations of affected users (PD-1 lists X as a retrieval channel)?
5. Is the top-100 cap compatible with PD-1 ("all affected members take part")?

## Change history
- S0 (2026-10-12): created.
- A3 (2026-11-05, branch `a3-options-and-g-anchors`, not merged): `functions/geo.js` (nearest of home, work and property; G formula and μ + 3σ cutoff unchanged) and `functions/demographics.js` (D with `places` and `property_kinds` from the Analyzer's `demographic_rules`; a match sets D = 1 and skips the distance cutoff and the `features` check; age, employment and family checks still apply; `features` also matched against interests). Members get `G_anchor_type` and `D_match`. Python port in `relevance_evaluator.py` (path B keeps its category heuristics; a place match gives D = 1). Shared fixture `tests/fixtures/a3_d_g_cases.json`. Impact: `tasks/A3-impact-report.md`. Existing publics: G, relevance and ISR recomputed for the 74 publics with a stored location and recoverable weights (`scripts/migrate_a3.py`, `tasks/A3-migration-report.md`; emulator only so far).
- A1 (open): R1 (canonical `relevance()` with an optional clamp, never gating on D) and R8 (wire-up in `functions/index.js` and `relevance_evaluator.py`).

- A5 (2026-11-12, `a817694`): approved local residential parameter guard, prompt p4, and recheck for old offending drafts. Captured P2 h5 Check narrows 4,941 to 1,033 candidates by removing 3,908 unrelated residential-owner bypasses; property-linked members and garage/broader ownership behavior remain. No formula, threshold, cutoff, membership cap or old public-score change.

## U10 explicit joining update (2026-11-13, feature implementation)

C-08 retains the 100-member cap for automatic formation only. The author accepted explicit joins beyond it. [U10](tasks/U10-similar-active-issues.md) implements C-09 for discussion-phase synthetic-profile joins: canonical D/G/S/X, education/experience and normalization, transactional member/event/maps/participant/value updates and retry safety. Voting-phase joining stays open pending the weight-freeze policy. No eligibility cutoff is imposed on explicit joining.
