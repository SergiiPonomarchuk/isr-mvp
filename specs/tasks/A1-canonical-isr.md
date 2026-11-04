# SPEC A1: canonical ISR calculation module

Status: DRAFT (to be filled in by the implementing agent under "Status log")
Branch: canonical-isr (never main)
If the repository already has a specification template or convention (docs/, specs/, rules files), conform to it and keep this content.

## 1. Context
The audit (claude_export/IMPLEMENTATION_FACTS.md) found that ISR is computed in several places with different logic: relevance in functions/index.js:319 and relevance_evaluator.py:168-181 (the latter clamps to [0,1]); expertise and member ISR in scratch/backfill_expertise.py:231-250; and a live vote tally in prototype/js/main.js (about lines 4371 and 4407-4476) that uses discussions.isr_scores = 1.5 x floored relevance, a different number from the stored member ISR (they match for 19 of 3,099 members). The Cloud Function does not compute expertise or ISR today.

## 2. Goal
One source of truth for the ISR arithmetic, as pure functions without Firebase or network access, covered by unit tests, and used by the code paths that compute relevance, aggregate member ISR, and tally votes.

## 3. Non-goals (do NOT do)
- No change to formulas, weights, defaults or floors outside what is stated in section 4.
- No Contribution scoring, gISR, AAuth, or Analyzer changes; no new expertise computation inside the Cloud Function.
- No deploy, no Firestore rules changes, no writes to production data (use the emulator or a copy).
- No edits to files under docs/.

## 4. Requirements
- R1 relevance(D, G, S, X, weights, clamp=False) = w_D*D + w_G*G + w_S*S + w_X*X. With clamp=True the result is limited to [0,1] (reproduces relevance_evaluator.py). D is a score; this module never gates on D.
- R2 expertise(education, experience, age) = max(min(age, 30)/30, education) + experience (PD-8; amended by A2 on 2026-11-04). No resources part, no baseline term, no weights. The age is taken at the issue's registration moment and is not stored. Reference: `scripts/expertise.py` (A2).
- R3 normalize_by_mean(values): each value divided by the mean. If all values are equal (including all zero) return 1.0 for each. If the mean <= 0 and the values are not all equal, raise a clear error. Do not invent another rule.
- R4 contribution: no scoring. Accept precomputed values; when absent use the constant 1.0 after normalisation and set contribution_source = "constant".
- R5 isr_for_public(members, weights): per member R, E, C raw; R_norm, E_norm, C_norm; the weights; isr = wR*R_norm + wE*E_norm + wC*C_norm; no final normalisation (as now). Return a `breakdown` object per member.
- R6 tally(votes, isr_by_uid): option score = sum of the voters' ISR; no floors. A voter without a stored ISR for that public is excluded and shown as "no ISR" with a visible note.
- R7 Language: if one language cannot serve both the Node Cloud Function/front end and the Python scripts, write the JS module as the reference, a Python port, and a test that both give identical outputs on a shared JSON fixture.
- R8 Wire-up: replace inline arithmetic in functions/index.js (relevance aggregation), relevance_evaluator.py, scratch/backfill_expertise.py (aggregation) and the tally in prototype/js/main.js with calls to the module. Replace the tally's fallback chain (discussion isr_scores, else member isr_score, else 1.5 x relevance) with the stored member isr_score for that public.
- R9 Store the `breakdown` in microcommunity_members as additive fields only. Field removals are done only by approved tasks (A2 removed `resources_expertise` and the expertise-weight fields).

## 5. Acceptance criteria
- AC1 For 20 random publics from claude_export/microcommunity_members_000.jsonl, the module reproduces isr_score, normalized_relevance and normalized_experience within 0.001 (using stored D, G, S, X, expertise parts and the fitted weights).
- AC2 For the stored data of path B, relevance with clamp=True reproduces relevance_score.
- AC3 Edge cases pass: all equal; all zero; one member; zero mean with unequal values (error); negative input.
- AC4 Scaling every R by a constant leaves R_norm and ISR unchanged.
- AC5 The worked examples in docs/ISR-Expertise-Assessment-v1.md Part 7 are recomputed; a list of arithmetic discrepancies is reported (docs are not edited).
- AC6 The JS and Python implementations agree on the shared fixture.
- AC7 After the wire-up, CHANGES.md states how many stored members change by more than 0.001 under the new tally, and why.
- AC8 No file outside the listed ones is modified; no deploy; no production write.

## 6. Open questions (stop and ask if blocked)
1. Zero or negative mean with unequal values: an author decision is pending; R3 raises an error until then.
2. ~~Default baseline~~ Closed by PD-8 (2026-11-04): no baseline term; the education part has the age floor min(age, 30)/30.
3. Where the module lives in the repository.

## 7. Traceability
Claims C-34, C-37 in the paper's register; log issues 47, 48. Specification decisions: D-006 (additive formula retained), D-011 (re-scope).

## 8. Status log (the agent fills in)
Plan approved: ___  Implementation: ___  Tests: ___  CHANGES.md: ___  Deviations: ___
