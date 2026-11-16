# PD-9 Multi-reference derivation and member scores

Status: **Intended model adopted for documentation by the author, 2026-11-16** ("Fix all the math and logic changes in all documents"). Runtime implementation and threshold calibration are pending. This decision supersedes fixed-five/chosen-type min-max derivation in Analyzer Step4A and the previous creator/candidate-based X definitions. PD-8's unweighted Education + Experience, PD-3's additive ISR, and versioned historical results remain authoritative.

The selection settings .30 minimum similarity and .05 adjacent gap are experimental. A raw chain longer than three triggers context review, not automatic reformulation (author-approved amendment, 2026-11-16). Similarity is not a probability or confidence. A reference is a worked analogy; category labels do not require a separate same-type group. The amended selection/review policy is mr1-context-review-1; all scoring equations retain mr1 arithmetic. These are intended specifications, not a claim about deployed behavior. Runtime changes require an implementation spec/plan; no paid evaluation, migration, deploy or rules change is authorized here.

## 1. Consistent notation

| Symbol | Meaning |
|---|---|
| i | Person being evaluated |
| j | Reference example in the reviewed compatible set J (raw candidates retained separately) |
| k | Education record; l = work-experience record; h = directly affected person |
| s_j | Similarity of the actual issue/context to reference j; finite scalar in [0,1] |
| alpha_j | s_j / sum_(k in J) s_k; nonnegative, sums to one over J after context passes |
| z | Vector used to retrieve reference examples for the actual submitted issue/context |
| r_j | Stored reference-example retrieval vector |
| u_j | Vector of an evidenced aspect of the actual issue associated with j |
| p_i | Person's existing profile vector |
| v_ik, v_il | Existing education/work skill vectors |
| w_dj | Relevance-component weight in reference j, d in D,G,S,X |
| b_cj | ISR aggregation weight in reference j, c in R,E,C |
| a_j | CBC adjustment for aspect/reference j; not alpha_j |
| H_ij / T_ij | Raw education evidence / work-experience evidence for person i, aspect j |
| M | One final ad-hoc public used for normalization |

Reference matching s_j and person relevance S_ij are different computations. Do not use q for both an issue ID and a vector. Do not call an embedding similarity a probability. A possible selection metric is s_j=max(0,cos(z,r_j)); choosing that metric requires specifying text template, embedding model/task and version. Do not mix these scores with LLM-reported confidence or softmax probabilities. Threshold calibration must use the same metric and corpus as runtime.

## 2. Current implemented Expertise

At the issue's registration date, let a person's completed age in years be age_i. Then:

    A_i = min(age_i,30)/30
    H_i = sum_k P_k * max(0,cos(v_ik,u))^(CBC_k * a)
    T_i = sum_l t_l * max(0,cos(v_il,u))
    E_i = max(A_i,H_i) + T_i

u is the single current issue vector; a is its CBC adjustment. There are no separate Education or Experience weights. The floor replaces a smaller education score; it is not added as a bonus. E is nonnegative and unbounded above.

| Runtime education-level mapping | CBC | P (nominal education years/power) |
|---|---:|---:|
| PhD | 0.5 | 10 |
| Master | 0.8 | 6 |
| Bachelor | 1 | 4 |
| College | 1.5 | 3 |
| Vocational/training | 2 | 2 |
| Unrecognized label: current fallback | 1 | 4 |

Each education record contributes separately. The core does not filter in-progress records by completion date. Work contributes stored duration t_l in years; only work-experience skills participate, not activity skills. There is no implemented recency decay. The domain and expertise-depth labels do not themselves change the formula; vector direction and CBC adjustment do. Missing skill vectors are skipped; malformed work duration has a JS fallback of one year. Invalid birthDate is caught by Create/Join and the raw education sum is used without the floor, despite PD-8 requiring birthDate. Those are implementation facts and separate cleanup questions, not recommended policies to copy into the new model.

Example: age 35, vocational education with similarity .95 and adjustment .9, ten years' work with similarity .95:

    A = 1
    H = 2 * .95^(2*.9) = 1.823612184...
    T = 10 * .95 = 9.5
    E = 11.323612184...; stored total = 11.324

For 0<c<1, lowering the positive exponent increases c^exponent. Hence a<1 broadens transfer; a>1 narrows it. CBC is an exponent, not a multiplier of the final education score. The documents reverse this interpretation in several places.

Sources: functions/isr.js:36,53,63,92,108; functions/index.js:352-382; functions/join-issue.js:20-40. The canonical Python normalization is scripts/isr_core.py; the historical normalize_by_mean function in scripts/expertise.py is not the current all-equal rule.

## 3. Reference selection

1. Verify the reference library/model/template/version and rank all valid references by unrounded s descending, stable ID tie break.
2. If s_1 < .30, no reference qualifies: ask for context or explain absent library coverage.
3. Starting at j=1, include the next reference only while s_j >= .30 AND s_(j-1)-s_j < .05. Stop at the first failed condition; do not resume at a lower cluster.
4. Count the entire raw chain before any cap. If m>3, return the internal state context_review_required. This is neither a user clarification request nor a failure. Do not retain just the first three, hide a conflicting fourth reference, or classify clear input as poorly written from cardinality alone.
5. Every chain, including one to three references, must pass substantive context validation: affected people, place/scope, requested decision, authority and evidenced aspects. For a long chain, explicitly distinguish overlapping library analogies from missing context or multiple unrelated decisions. Review returns pass, needs_clarification, not_consistent, or an analysis/service error. Ask the user only for missing/inconsistent facts; suggest splitting only for substantively distinct decisions supported by the input. An internal/context-service failure must not be blamed on the user.
6. Record the reviewed compatible reference set J and the reason/evidence for each retained or excluded candidate. Retain the raw ranking/chain separately. Do not discard references merely to reach three. The number of references alone does not decide publication; do not automatically blend all100 raw candidates either. A bounded reviewed-set/aspect resource policy is an implementation gate, not an implicit permission for100 aspect embeddings.
7. Only after context passes, set alpha_j=s_j/sum_(k in J) s_k for j in J and derive parameters from that reviewed set. With no supported set, ask for context or report library coverage limitations; never invent default parameters. In all subsequent scoring formulas j ranges over J. Context review may pass an unchanged clear issue despite a long raw chain.

Boundary: a score exactly .30 qualifies; a gap exactly .05 breaks the chain. Exact score ties remain tied, including ties across the third/fourth boundary. Calculations use raw values with a documented machine-precision equality policy; displayed percentages are rounded separately. No probabilistic interpretation is claimed.

Examples: [.57,.55,.51] -> three; alpha=[.349693,.337423,.312883]. [.57,.53,.49,.45] -> four -> internal context review; user clarification depends on its findings. [.57,.51,.49] -> only the first, because the first gap breaks the chain.

Near scores do not establish uncertainty or complexity. Four redundant references can describe a clear issue. Show the raw chain titles/categories, scores and matching aspects in review evidence. Context review must explain why reformulation is needed, if it is needed. Library duplicates/coverage are protocol maintenance questions. Clear input may pass unchanged; missing facts get questions; unrelated decisions may receive user-chosen split or initial-planning suggestions. This amendment supersedes the original automatic >3 user-reformulation rule; arithmetic, .30/.05 thresholds and existing live behavior are unchanged.

## 4. Context instantiation and geography

A reference is an analogy. Instantiate its demographic rules, expertise domain/aspect and place implications using the actual submitted context; do not copy an example's school name, address, age group or owner literally. Every u_j should have an explicit supporting part of the submitted text/context. Alternative interpretations unsupported by facts cause clarification; do not manufacture several aspects from several similar examples.

For compatible geographical references describing the same actual issue center:

    mu = max_j mu_j
    sigma = max_j sigma_j
    F = 3*sigma  (the displayed fade distance)
    d_i = nearest distance from actual issue center to person's home/work/property
    G_i = 1                         if d_i <= mu
          exp(-(d_i-mu)^2/(2*sigma^2)) otherwise

This is intentionally an unweighted envelope. Maxima can come from different references and yield a broader curve than every individual example. It is not equivalent to selecting the largest mu+3*sigma from a single example. A digital case's artificial huge radius must not widen a building issue without a compatible interpretation; conflicting centers/scopes require clarification.

The Gaussian and candidate exclusion are separate rules. Current code excludes candidates beyond mu+3*sigma except specified bypasses. Do not describe this as the Gaussian naturally becoming zero. Whether this cutoff remains a candidate gate in the mixed model must be explicitly decided alongside PD-1; it cannot erase a valid nongeographical demographic or semantic channel.

## 5. Relevance: preserve weight/result pairing

For each person and reference, compute D_ij in [0,1] from that reference's contextualized demographic rules. Binary per-reference rules may yield fractional combined affectedness; this alone does not implement all of PD-1. For semantics:

    S_ij = max(0,cos(p_i,u_j))

Social relevance and automatic membership use the two-phase A/B policy below. The directly affected set is global A from the blended weighted D/G/S sum, not a categorical affected-group predicate or per-reference seed set A_j. All A have X_ij=0. Only related people outside A form B; their X is the largest full addition that passes the supplying A's relevance ceiling.

G_i is the common enlarged curve above. The combined R is:

    R_i = sum_j alpha_j *
          (w_Dj*D_ij + w_Gj*G_i + w_Sj*S_ij + w_Xj*X_ij)

This preserves each reference's associated weights and scores. A simple demographic summary sum(alpha_j*D_ij) may be displayed as a diagnostic, but is not generally the effective D for an independently averaged w_D. Example alpha=[.5,.5], w_D=[.5,.1], D=[1,0]: paired contribution=.25; average-weight times average-score=.3*.5=.15. These represent different models.

For the existing four-component display, use:

    W_d = sum_j alpha_j*w_dj
    component_contribution_id = sum_j alpha_j*w_dj*c_ijd
    component_effective_id = component_contribution_id/W_d  if W_d>0
                             0 (display not used)           if W_d=0
    R_i = sum_d W_d*component_effective_id

Here c_ijD=D_ij, c_ijS=S_ij, c_ijG=G_i, c_ijX=X_ij. Sum_d W_d=1 and each effective component lies in [0,1]; hence R_i in [0,1]. S_eff and D_eff require conditional reference weights alpha_j*w_dj/W_d, not an additional multiplication by alpha after summing.

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

## 6. Expertise: combine evidence before one age floor

For aspect j:

    H_ij = sum_k P_k * max(0,cos(v_ik,u_j))^(CBC_k*a_j)
    T_ij = sum_l t_l * max(0,cos(v_il,u_j))

Combination preserving PD-8's outer form:

    H_i = sum_j alpha_j*H_ij
    T_i = sum_j alpha_j*T_ij
    E_i = max(A_i,H_i) + T_i

This supersedes the earlier discussion formula sum_j alpha_j*max(A_i,H_ij)+T_i. The earlier formula is a different possible model and is always at least as large as applying the floor once, because max is convex. With A=1, H_1=0, H_2=2 and equal alpha, it gives1.5 while the recommended single-floor form gives1. The author authorized this reviewed single-floor convention in the documentation update on 2026-11-16.

Evaluate every education power before blending. Averaging CBC adjustments/vectors and then applying a nonlinear power is not equivalent. Do not normalize each aspect's Expertise by a different public or add E scores without alpha. Identical scoring specifications can be algebraically merged by adding their alpha weights; matching domain labels alone are insufficient. Such execution optimization must not change which references count toward the chain rule.

Raw education/experience evidence is evaluated at one fixed registration time. No new recency decay, activity-scoring or qualification-completion rule is implicitly added by the mixture. If those issues are addressed, use separate decisions and acceptance cases.

## 7. Public, normalization, ISR and lifecycle

Blend issue-level ISR weights:

    B_c = sum_j alpha_j*b_cj, c in {R,E,C}; sum_c B_c=1

Form the automatic public as A union B using the two-phase rule. B is not filtered by final R. E and B_R do not determine membership. Historical creator/explicit-Join exceptions are separate compatibility policies; they must not be smuggled into A or become social seeds. On the one final public M:

    Rhat_i = R_i / mean_M(R)
    Ehat_i = E_i / mean_M(E)
    ISR_i = B_R*Rhat_i + B_E*Ehat_i + B_C*Chat_i

Current Chat_i=1, a labelled placeholder. Current canonical special case: all values equal, including all zero, -> normalized1 for everyone; unequal values with nonpositive mean -> error. The mean of ISR is therefore1 before storage rounding when the weights sum to1. No final clipping of ISR to [0,1].

This deliberately constructs one issue model: one R, one E, one public and one aggregation-weight group. It is not a mixture of separately normalized reference-specific final ISRs. Both are possible designs, but their normalizations and cross-products differ; do not switch between them without a policy decision. Alpha already appears in component derivation and aggregate-weight derivation; multiplying final ISR by alpha again would double-count it.

Precision: current Create/Join round stored raw R/E and parts to three decimals before public mean normalization, then store rounded normalized values/ISR. Preserve or explicitly version that convention; do not promise exact mean ISR=1 for rounded storage (the D1 pool is already slightly different). Every recomputation/Join/checker must use the same convention, issue parameters and reference set. Discussion-phase joins recalculate public means/weights as existing policy requires; voting membership/freeze policy stays separate. Historical issues retain their original version; no silent migration or rescore.

## 8. Representation, provenance and cost

Store reference IDs/scores/alpha, exact library and selection versions, input/context hash, supporting aspect texts, vector metadata/hash, per-reference contextual demographic rules/domain/CBC adjustment, common location/envelope and derivation reasons. Store member per-reference D/S/education/work contributions or enough immutable inputs to reproduce them; expose totals consistent with the formulas. The same contract must drive Check preview, Create, explicit Join, member tooltips and independent JS/Python checking.

Reference vectors r_j and actual-issue aspect vectors u_j are not interchangeable. A new aspect embedding step means PR #38's proposed one-embedding-text ceiling is no longer reliable: plan for selection plus the approved bounded reviewed-set aspect texts, possibly retaining a separate whole-issue vector for U10 duplicate matching. Batching several texts still consumes several embedding texts. Reuse only when exact text/model/task/template identities match. Do not re-embed the population solely for this change if compatible existing vectors can be retained. No provider budget is approved by this decision.


## Implementation gates and remaining choices

- Pin the retrieval metric/text/context template and score version; calibrate .30/.05, long-chain context review and false user-clarification requests on all D1 cases and negative cases. Thresholds cannot be transplanted across different metrics or libraries.
- Specify actual-issue aspect extraction/vector templates and profile relationship eligibility/coverage. A is now defined by inclusive blended direct affectedness r0>=Theta; no extra categorical seed predicate or newly invented threshold is needed. Do not copy examples' people/owners/places.
- Resolve candidate cutoff/bypass and top300 approximation changes so direct and social channels remain reachable. The latest A/B decision removes the automatic top100 cap for new-policy formation. Explicit discussion Join remains separately versioned; existing issues keep their old version.
- Preserve or explicitly version three-decimal storage before normalization, exact replay, Join recalculation and voting freeze. Formula examples use unrounded values unless stated otherwise.
- Certificate/College mapping, missing birthDate behavior, in-progress education and recency decay remain declared discrepancies, not implicit changes. No Education-versus-Experience weights or new Contribution formula.
- New log-failure publication gate and fallback publication policy from the original M3 proposal remain implementation proposals until explicitly approved. They are not necessary assumptions in these equations.
- Scope includes docs/, specifications and the scoring skill documentation only. Existing app code, test fixtures, example numeric anchors/vectors and historical reports are not rewritten as if mr1 had run.

## Status log

- 2026-11-16 A/B decision: author defines A by weighted direct D/G/S>=Theta and B by one-step relationships of A irrespective of score. A gets no X; B receives only a full addition whose result is<=the source A direct score, otherwise baseline only. Core implemented and tested; app integration pending. This supersedes the earlier direct-scope-predicate and strict-vs-cap questions.

- 2026-11-16 amendment: author approved context review before deciding reformulation. Raw >3 becomes context_review_required; reviewed compatible set J has evidence/reasons, no arbitrary truncation or automatic100-way blend. User clarification/splitting follows semantic findings. No runtime implementation or additional provider allowance.

- 2026-11-16: author authorized the reviewed multi-reference documentation corrections, including X from affected people's relationships. Recorded selection, paired relevance, max geography, single education floor, one-public ISR, versioning and implementation gates. Corrected companion documents and examples; runtime unchanged.
