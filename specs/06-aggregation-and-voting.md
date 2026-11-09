# 06 Aggregation and voting
Status: PARTIAL   Verified against: commit `0620f27` (PD-6)
Owns contradictions: C-21, C-33, C-34, C-35 (see [README](README.md#contradiction-map))

## Purpose
Combines a member's Relevance R ([03](03-relevance.md)), Expertise E (04) and Contribution C (05) into a per-issue member ISR, and uses it to weight votes on the issue's options.

## Intended design
- **Formula** ([PD-3](decisions/PD-3-additive-formula.md)): ISR = w_R·R̂ + w_E·Ê + w_C·Ĉ, an additive weighted sum.
  - Compensation among the components is intended; the per-issue weights act as the exchange rate.
  - Stake-gated and multiplicative variants were rejected.
- **Normalisation** (PD-3): each component is divided by its mean over the members of the same public, so 1.0 = public average. The rule for a zero or negative mean is **open**.
  - PD-3 lists no overridden docs. It conflicts with the Analyzer protocol §6.3 (l.679, "normalized to [0, 1]") and with the Request Guide's "Relevance is absolute (not normalized)" (l.404-409); see the PD-3 page.
  - `docs/mvp.html` l.712 (overview, S0-D2) describes the same rule as PD-3.
- **Aggregation weights:** w_R, w_E and w_C are each in [0,1] and sum to 1, set per issue by the Analyzer. Sources: `docs/ISR-Issue-Analyzer-Protocol-v1.md` §4 (l.519-541; pattern anchors l.524-530); `docs/ISR-AI-Weight-Evaluation-Instructions.md` §3 (l.149-252).
  - The 40/30/30 profile is strictly a fallback for vague issues (Weight Instructions §6.1, l.327-335; Relevance doc l.225-227).
  - Who may edit the weights is open (PD-4; see 07).
- **Vote weight:** each member's vote carries their ISR for that issue. Sources: Analyzer l.521-522 ("final ISR vote weight"); `docs/mvp.html` l.359-363 (overview: "your click carries your calculated weight (ISR-score)", "highest weight option wins"). The manifesto's §4.2 (l.191-193) says the same, but it is vision only (S0-D1).
- **Options** ([PD-2](decisions/PD-2-resources-and-money.md)): if an issue needs money, each option states its cost and funding source.
- **Votes on questions affecting all users equally** use gISR, not the per-issue ISR ([PD-5](decisions/PD-5-gisr-and-access.md)); see 05 and 09.

## As built

### Variants
Two different numbers are both called "ISR":
1. the **member ISR**, stored in `microcommunity_members.isr_score`;
2. the **discussion ISR**, stored in the `discussions.isr_scores` / `issues.isr_scores` maps.

The vote tally and the chat list use the second one (IF l.101-102).

### Member ISR (stored on `microcommunity_members`)
| Statement | Status | Evidence |
|---|---|---|
| Member ISR = w_R·(R / mean R) + w_E·(E / mean E) + w_C·1.0, with means over the members of the same public. There is no final normalisation, so values are unbounded (observed 0.452–3.269). | VERIFIED (data: exact linear fit in 190/190 publics, max error < 0.001) | IF l.99 (`scratch/backfill_expertise.py:231-250`) |
| If a mean is 0, the normalised value is 0. A negative mean cannot occur, because all inputs are ≥ 0. | VERIFIED | IF l.77, l.91 (`scratch/backfill_expertise.py:245-246`) |
| C is not computed: `contribution_score` = 0.0 and `normalized_contribution` = 1.0 for every member. | VERIFIED (data) | IF l.86 (`scratch/backfill_expertise.py:247, 259, 262`) |
| `normalized_experience` actually holds normalised total expertise (it is misnamed). | VERIFIED (data) | IF l.77 |
| The (w_R, w_E, w_C) used were read from the discussion doc at backfill time (default 0.4/0.3/0.3). The fitted triples are only (0.4, 0.3, 0.3) ×133, (0.4, 0.2, 0.4) ×49 and (0.5, 0.2, 0.3) ×8: keyword-rule outputs of `scratch/seed_topic_weights.py:7-64`, not the Analyzer-style weights now on the issue docs. | VERIFIED (data) | IF l.100 (`scratch/backfill_expertise.py:161-163`) |
| Only the offline script computes member ISR. The Cloud Function does not; the 50 members of the 2 app-created publics have no expertise or ISR fields. | VERIFIED (data) | IF l.78 (`functions/index.js:549-562`) |
| Issue `15` has ISR weights that sum to 0.70; no code checks the sum. | VERIFIED (data) | IF l.204, l.116 |

### Discussion ISR and cached relevance maps (on `discussions` and `issues`)
| Statement | Status | Evidence |
|---|---|---|
| `relevance_scores` is floored: the creator gets max(R, 0.85) and everyone else max(R, 0.20). User "1" (the demo user) is always added. | VERIFIED | IF l.59 (`scratch/populate_discussions_scores.py:82-110`; `seed_db.py:249-266`) |
| `isr_scores[uid]` = round(1.5 × floored relevance, 2) for 3,243/3,243 entries. It matches the member ISR for only 19 of 3,099 members. | VERIFIED (data) | IF l.101 (`scratch/populate_discussions_scores.py:113`; `seed_db.py:266`) |
| The chat list's "ISR" is taken from `isr_scores`, with fallback `relevance_score × 1.5`. | VERIFIED (re-checked 2026-10-12) | `prototype/js/main.js:4101, 4108, 4381, 4388` |

### Vote tally
| Statement | Status | Evidence |
|---|---|---|
| Option score = Σ over voters choosing that option of `isr_scores[uid]` from the discussion doc (fallback: member `isr_score`, else 1.5 × relevance). There is no normalisation, quorum or threshold. It is computed live in the browser and not persisted. | VERIFIED | IF l.102 (`prototype/js/main.js:4371, 4407-4476`); fallback re-checked at `main.js:4420` |
| The stored `issues.options[].score` values are all integer 0 (157 options) and do not equal the live tally in 10 of 29 voted options. `winning_option_index` is only seeded; no code computes it. | VERIFIED (data + grep) | IF l.103 (`prototype/js/main.js:4675, 4863` only read it) |
| Votes are written by a client transaction `votes[uid] = optionIndex`. Any client can write any uid. | VERIFIED | IF l.104 (`prototype/js/main.js:4578-4583`); open rules, see 09 |
| Options carry `label`, `score`, `author_name`, `budget` (default "N/A") and `description`. There is no funding-source field (PD-2). | VERIFIED (re-checked 2026-10-12) | `prototype/js/main.js:4436-4456`; SCHEMA l.21518-21527 |

## Gaps
| Id | Intended | As built |
|---|---|---|
| C-33 | Divide by the public mean (PD-3, *decided*) | Matches (member ISR). Zero mean gives 0, but PD-3 leaves the zero/negative-mean rule open; A1 R3 proposes 1.0 for all-equal and an error otherwise. |
| C-34 | Vote weight = member ISR (Analyzer l.521-522; `mvp.html` overview). The manifesto (vision) also says "relevance-weighted" (l.80, l.386). | Vote weight = 1.5 × floored relevance, which is neither the member ISR nor the raw R |
| C-35 | The ISR-weighted outcome decides the issue (Request Guide l.381-383; `mvp.html` l.362-363) | The tally exists only in the browser; nothing is persisted; `winning_option_index` is never computed |
| C-21 | 40/30/30 only as a fallback | The stored triples are keyword-rule outputs (40/30/30 on 133 of 190 publics) |
| (none) | C from Contribution (05) | C̃ = 1.0 constant for everyone |
| (none) | Weights sum to 1 | Not validated; issue `15` sums to 0.70 (see also C-20, owned by 07) |
| (none) | Options state cost and funding source (PD-2) | `budget` only; no funding source |
| (none) | gISR for all-user questions (PD-5) | Not implemented |

## Interfaces
- **Inputs:** `microcommunity_members.{relevance_score, expertise_score, contribution_score}`; issue/discussion weights `w_relevance`, `w_expertise`, `w_contribution`.
- **Outputs:** `microcommunity_members.{normalized_relevance, normalized_experience, normalized_contribution, isr_score}` (offline); `issues.votes` (client); live option scores (browser only).
- **Cached maps** `discussions.relevance_scores` / `isr_scores` (seeded): read by the chat list, the dashboard and the tally (10).

## Tests
- No automated tests.
- A1 would add: AC1 (reproduce `isr_score`, `normalized_relevance` and `normalized_experience` within 0.001 for 20 publics); AC3 (edge cases); AC4 (scale invariance); AC7 (count of members whose tally weight changes).

## Open questions
1. What should happen with a zero or negative mean (PD-3 open; A1 open question 1)?
2. Should the tally use the stored member ISR, as A1 R8 proposes, and should voters without an ISR be excluded with a visible note (A1 R6)?
3. Should the tally and the winning option be persisted, and by whom (client or Cloud Function)?
4. Until Contribution exists, is C̃ = 1.0 the intended placeholder (A1 R4)?

## Change history
- S0 (2026-10-12): created.
- A1 v2 (2026-11-08; merged as PR 7, live 2026-11-09): one ISR everywhere. Shared module `functions/isr.js` (+ browser copy, Python port); `createIssue` computes E and the member ISR; the cached maps equal the member values (`migrate_a1.py`); the browser shows and tallies the member ISR (no 1.5 x relevance); trigger `onIssueStatusChange` stores scores, `winning_option_index`, `tally` and tasks when an issue is approved. Decisions: voters without an ISR excluded; tie or no votes -> no winner; C-hat = 1.0 placeholder; phase-move rules unchanged.
- L1 (2026-11-09, branch `l1-deadlines`, not merged): management decisions in the Deadline window execute at at least 30 % of the public's ISR pool (was more than 10 %), after a confirmation; Start Voting needs 1 option; Finish Voting only when the vote would pass. A daily server run (`closeExpiredTopics`) closes expired topics: a voting issue goes to ToDo with at least 30 % of the pool voted and a winner (the A1 trigger stores the result), a tie adds 7 days, otherwise it is canceled; a chat goes to voting with at least 1 option, otherwise it is canceled. Rules: `functions/lifecycle.js`.
