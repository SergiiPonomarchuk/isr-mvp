# S0 decisions to import (author decisions that shape the intended design)

Source: the author's decisions log for the paper (ids in brackets). Purpose: Claude Code turns each item into a page in specs/decisions/ in S0 step 3, so the repository is self-contained. These are INTENDED-DESIGN decisions. They say nothing about what the code does today; "As built" is taken only from claude_export/IMPLEMENTATION_FACTS.md.
Precedence rule for specs/README.md: a decision page overrides docs/ for the intended design, and each page lists the docs/ sections it overrides. docs/ itself is never edited.

## PD-1 Scope, inclusion floor, soft D [paper D-001]
- ISR works within applicable law and in the space law leaves open. If law fully resolves an issue it is not an ISR case. The Analyzer returns `legal_coverage` (none, partial, full, unknown) as advisory triage, not legal advice.
- All affected members take part (information, discussion, proposal, vote). w_R does not affect inclusion.
- Materially affected members are never hard-excluded: D is a soft score, not a gate. Candidate retrieval over several channels (G, D, X, S), then scoring.
- No hard-coded list of protected attributes. The Analyzer flags missing or proxy attributes.
- Affects: 03 relevance, 07 analyzer. Overrides in docs/: Relevance doc pipeline phase 1 and section 2.1 (D = 0 excludes immediately); Analyzer protocol section 2.2.1 (hard exclude). As built: path A in the Cloud Function gates on D (IF (a)).

## PD-2 Resources and money [paper D-002]
- Only pledged and checked resources count toward Expertise. Owning something is not enough. Money is excluded from Expertise.
- If an issue needs money, each option states its cost and funding source.
- Property plays three roles: stake (through Relevance), legal consent (outside ISR), offered capacity (through a pledge). Pledge rules (conflict of interest, delivery, timing) are open.
- Affects: 04 expertise, 06 aggregation and voting (options). Overrides in docs/: Expertise doc section 2.4 and Parts 4, 5, 7 (ownership and capital count). As built: resources_expertise comes from hobby `activity` skills by keyword (IF (b)).

## PD-3 Additive formula [paper D-006]
- ISR = w_R R + w_E E + w_C C stays an additive weighted sum. Compensation among the components is intended; per-issue weights act as the exchange rate. Stake-gated or multiplicative variants were rejected as hard to interpret.
- Components are divided by the public's mean (1.0 = public average), as in docs/mvp.html and the code. Rule for a zero or negative mean: open.
- Affects: 06 aggregation and voting. Overrides: none (it settles contradictions C-33).

## PD-4 Analyzer as a governed artifact [paper D-004]
- Analyzer prompts, the 100-example library and the documentation are public and versioned. Each run is logged: input, model, parameters, raw output, final and edited parameters, and the source (model, fallback or edited). Test-retest metrics are published. Changes go through protocol-level governance.
- Open: who may edit parameters and under what limits.
- Affects: 07 analyzer. As built: none of this is implemented (IF (e)).

## PD-5 gISR and access [paper D-007]
- gISR is a person's Contribution assessed against the Vector of Values of all registered users, divided by the mean, recomputed and not stored. It has two uses only: votes on questions that affect all users equally, and the reliability condition in Adaptable Authorization (always combined with the requester's relation to the data subject). Any new use needs a protocol-level decision.
- AAuth tiers define default automatic visibility. Any user can request any data of another user, and the data subject decides. AAuth uses total Contribution for now.
- gISR is not shown to other members (no Profile Card score, no percentile). It is not provided to third parties through the API, and the terms of use forbid use outside ISR. A holder can export their own data.
- Affects: 05 contribution, 09 identity, access, security, 10 UI flows. As built: gISR and AAuth do not exist in code (IF l.87, l.127).

## PD-6 MVP status and the paper [paper D-011, D-012]
- The paper is a design proposal with a partial prototype on synthetic data; no pilot or validation is claimed.
- The MVP is not brought up to the specification before the submission. Any change is made on a branch, tagged, and recorded in the matching component file. The audited code state is commit 0620f27 (HEAD 392e773 plus the uncommitted modifications that were audited).

## PD-7 Terminology [paper D-008]
- "Ad-hoc public" means the group formed for one issue (replaces "microcommunity" and the issue sense of "community"). "Organisation" or "deployment" means an NGO, co-op or DAO that uses ISR. "Users" means all registered users.
- Affects: 14 conventions. Firestore collection names that still say `microcommunities` are an as-built fact, not a decision.
