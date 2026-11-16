# M3 pure scoring core and integration contract

Status: implementation within the approved PD-9 arithmetic, 2026-11-16. Author said "ok, go" after requesting implementation. Main baseline9fa0923. This phase implements pure deterministic JS/Python calculations and tests; it does not wire new behavior into Check/Create/Join or make provider/database calls.

## Plan

1. Implement full raw-chain selection and reviewed-set blending with strict validation. Expose internal context_review_required independently of user clarification.
2. Compute paired R/effective components, blended education/work before one age floor, max geography, one-public ISR and source-preserving directed tie inputs from an explicitly supplied affected set. A/B formation and source-specific full-addition eligibility follow the explicit policy below. Reuse existing canonical normalization; retain full intermediate precision in core and leave storage rounding to a versioned caller contract.
3. Add cross-language fixtures and boundary/failure/invariant tests; run required suites and open a feature PR. Then resume the context schema/aspect and profile-adapter implementation. No implicit model call, cap, new affectedness threshold, provider budget, deployment, integration or rescore.

## Contract

Raw references are id/score pairs ranked by score descending and stable ID tie break. Scores are finite [0,1]. Reference IDs are nonempty unique strings. Minimum.30 and adjacent gap.05 use a documented1e-12 boundary comparison (values within that absolute tolerance of a boundary count as equal). A gap equal.05 breaks; score equal.30 qualifies. Long-chain count is untruncated.

A reviewed set is supplied after server context validation. Every retained ID must belong to the raw chain; every excluded candidate needs a substantive reason string; retained records need contextual evidence. No universal three-reference cap. Reviewed references carry validated D/G/S/X and R/E/C sum-one weight groups, positive CBC metadata where integration adds it, mu>=0/sigma>0. Core normalizes original similarities over reviewed references only. It cannot establish whether model evidence is factually correct; context validation is a separate prerequisite.

Member aspect inputs provide D/G/S/X in[0,1], nonnegative raw education/work evidence and a fixed nonnegative age. R is the paired sum; displayed components use conditional reference weights. E floors blended education once. The directed-tie helper consumes a validated affected-person set and returns individual affected-source/tie pairs; it must not collapse to the largest tie before the source-specific relevance limit is evaluated. it does not infer affectedness, reciprocity or additional hops. Public normalization delegates to canonical A1 JS/Python behavior. No profile fields are read by the core.

## Two-phase A/B membership and social limit (author decision, 2026-11-16)

For every evaluated person, compute weighted direct affectedness, without renormalizing away the social weight:

    r0_i = sum_(j in J) alpha_j*(w_Dj*D_ij+w_Gj*G_i+w_Sj*S_ij)
    W_X = sum_(j in J) alpha_j*w_Xj
    Theta = 0.15
    A = {i: r0_i >= Theta}

This is an inclusive direct threshold. All A join automatically with R_i=r0_i and X=0; social weight is not redistributed to D/G/S. The old automatic top100 cap is superseded for this new formation policy. D/G/S are scoring steps, not independent hard-exclusion gates that could remove someone whose total reaches Theta.

Read the recorded outgoing eligible social relationships of A only. Let H_i={h in A: h records an eligible relationship to i, h!=i}. Then:

    B = {i not in A: H_i is nonempty}
    delta_hi = W_X*t_hi
    eligible_hi = (r0_i + delta_hi <= r0_h)
    x_i = max({delta_hi: h in H_i and eligible_hi} union {0})
    R_i = r0_i + x_i              for i in B

B membership is independent of R and whether X is accepted. If every addition exceeds its source's direct score, reject every full addition and retain r0_i; do not cap or partially add it. Equality is allowed. Compare each source separately before choosing the largest eligible addition. A stronger tie may be rejected while a weaker tie from another A is eligible. A known eligible relationship with tie0 (or W_X=0) still establishes B membership; unknown/unsupported relationship eligibility must be handled explicitly by the profile adapter, not guessed from arbitrary links. All recorded tie values must be finite[0,1]. Missing relationship/profile data required for scoring is an incomplete-data error, not evidence that a person is absent or a silent zero.

The supplying A and its tie are the same actual-issue source across references, hence delta=W_X*t and X_ij equals the chosen tie for B (0 if all are rejected). This supersedes per-reference affected seed sets A_j. Effective social score is x_i/W_X when W_X>0, otherwise0. Other paired relevance terms and the one-age-floor Expertise formula are unchanged. Normalize R/E once over A union B (plus any separately authorized explicit joins), so B affects public means and the ISR pool even with low/zero R. Do not give A an X bonus, infer reciprocity, add self-links or expand from B. This ceiling concerns raw Relevance, not mean-normalized Relevance or final ISR; Expertise may still give B a larger ISR than an A member.

Implementation compares the source-score ceiling with1e-12 floating tolerance for equality. Direct threshold is evaluated on unrounded r0 with >=Theta; storage rounding happens afterward under the separately versioned contract. The broad cap removal and cohort>=threshold behavior are intended new policy, not a claim about live code or a migration of historical issues. Full-population candidate coverage and data/write capacity must be verified before integration; service limits must not silently truncate A/B.

## Integration still required

Context review must bind actual-context spans, references, categorical D rules and bounded actual-issue aspect vectors. Direct-affectedness and social-limit questions are settled by the A/B decision. Define eligible profile relationship types/explicit ties and candidate coverage without silently adding arbitrary links; the core consumes already validated eligible edges. New context-model evaluation still needs its own allowance. Check/Create/Join wiring must preserve frozen historical replay, explicit Join and source provenance, and use the new inclusive threshold/uncapped A/B policy only under the new version. Verify capacity before writing a large public; never retain the old top100 truncation implicitly.

## Status log

- 2026-11-16: implemented deterministic A/B cohorts in JS/Python after the author's detailed clarification. Focused tests cover inclusive threshold, equality, full rejection, no cap, no X for A, zero-score B, no second hop and stronger-fails/weaker-passes. Not integrated or deployed; no provider call/database access.

Precision contract: strict source component scores stay in[0,1], while a derived R can exceed1 by at most the accepted1e-6 source-group sum tolerance. Public normalization accepts that bounded excess without clipping/rescaling. All-equal normalized scores remain1; final ISR comparisons use a numerical tolerance rather than exact floating equality. These pure helpers are not a model-truth/authentication boundary; integration must reconstruct reviewed models from validated server data.

## Verification checkpoint

Node137 passed/four optional skips; Python131 run/two optional skips. Cross-language tests replay11 saved rankings and member/public arithmetic; focused cases cover rejection boundaries, reviewed exclusions, four accepted references, effective-component reconstruction, one age floor, zero-weight/equal normalization, individual outgoing tie provenance and nonfinite inputs. Floating precision assertions use tolerances. No app endpoint/frontend change, emulator or provider call occurred in this phase.

Latest verification: Node140 passed/four optional skips; Python133 run/two optional skips, including A/B JS-Python parity. No endpoint/frontend integration or provider/database call.
