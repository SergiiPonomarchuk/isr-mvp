# M3 pure scoring core and integration contract

Status: implementation within the approved PD-9 arithmetic, 2026-11-16. Author said "ok, go" after requesting implementation. Main baseline9fa0923. This phase implements pure deterministic JS/Python calculations and tests; it does not wire new behavior into Check/Create/Join or make provider/database calls.

## Plan

1. Implement full raw-chain selection and reviewed-set blending with strict validation. Expose internal context_review_required independently of user clarification.
2. Compute paired R/effective components, blended education/work before one age floor, max geography, one-public ISR and source-preserving directed tie inputs from an explicitly supplied affected set. Final X eligibility/capping is pending the author's latest boundary decision. Reuse existing canonical normalization; retain full intermediate precision in core and leave storage rounding to a versioned caller contract.
3. Add cross-language fixtures and boundary/failure/invariant tests; run required suites and open a feature PR. Then resume context schema/affectedness implementation after the author's pending policy choice. No implicit model call, cap, new affectedness threshold, provider budget, deployment, integration or rescore.

## Contract

Raw references are id/score pairs ranked by score descending and stable ID tie break. Scores are finite [0,1]. Reference IDs are nonempty unique strings. Minimum.30 and adjacent gap.05 use a documented1e-12 boundary comparison (values within that absolute tolerance of a boundary count as equal). A gap equal.05 breaks; score equal.30 qualifies. Long-chain count is untruncated.

A reviewed set is supplied after server context validation. Every retained ID must belong to the raw chain; every excluded candidate needs a substantive reason string; retained records need contextual evidence. No universal three-reference cap. Reviewed references carry validated D/G/S/X and R/E/C sum-one weight groups, positive CBC metadata where integration adds it, mu>=0/sigma>0. Core normalizes original similarities over reviewed references only. It cannot establish whether model evidence is factually correct; context validation is a separate prerequisite.

Member aspect inputs provide D/G/S/X in[0,1], nonnegative raw education/work evidence and a fixed nonnegative age. R is the paired sum; displayed components use conditional reference weights. E floors blended education once. The directed-tie helper consumes a validated affected-person set and returns individual affected-source/tie pairs; it must not collapse to the largest tie before the source-specific relevance limit is evaluated. it does not infer affectedness, reciprocity or additional hops. Public normalization delegates to canonical A1 JS/Python behavior. No profile fields are read by the core.

## Integration still required

Review schema must bind actual-context spans, references, categorical direct-scope rules and bounded actual-issue aspect vectors. The pending choice is explicit affected stakeholders vs a numeric X-free threshold. First proposal uses actual building/employer/group facts, with unknown membership reported and clarified rather than guessed from generic similarity. New context-model evaluation needs a separate bounded allowance. Existing cap/creator/Join, candidate safety, storage rounding and frozen historical replay remain required integration acceptance criteria.

## Status log

- 2026-11-16: pure math implementation and fixtures prepared; affectedness question sent while independent implementation continues. Not integrated or deployed; no provider call or database access.

## Social-limit clarification, 2026-11-16

Author requires a relative's D+G+S+X to stay below the supplying directly affected person's D+G+S. Proposed notation B_ij=w_Dj*D_ij+w_Gj*G_i+w_Sj*S_ij, proposed social addition w_Xj*t_hi. Pending choice: reject a full tie when B_ij+w_Xj*t_hi>=B_hj, or reduce it to the available gap (allow equality). Final social rule and definition of directly affected people are not implemented until resolved. Every source must be considered separately before selecting the largest eligible social contribution; an initially larger tie may fail its source's limit while a weaker one qualifies. No circular X or extra social hop.

Precision contract: strict source component scores stay in[0,1], while a derived R can exceed1 by at most the accepted1e-6 source-group sum tolerance. Public normalization accepts that bounded excess without clipping/rescaling. All-equal normalized scores remain1; final ISR comparisons use a numerical tolerance rather than exact floating equality. These pure helpers are not a model-truth/authentication boundary; integration must reconstruct reviewed models from validated server data.

## Verification checkpoint

Node137 passed/four optional skips; Python131 run/two optional skips. Cross-language tests replay11 saved rankings and member/public arithmetic; focused cases cover rejection boundaries, reviewed exclusions, four accepted references, effective-component reconstruction, one age floor, zero-weight/equal normalization, individual outgoing tie provenance and nonfinite inputs. Floating precision assertions use tolerances. No app endpoint/frontend change, emulator or provider call occurred in this phase.
