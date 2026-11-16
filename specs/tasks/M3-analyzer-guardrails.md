# M3: Multi-reference Analyzer and member-score integration

Status: **Documentation revision authorized 2026-11-16; runtime NOT IMPLEMENTED.** This specification replaces PR #38's original fixed-five/type-table proposal with [PD-9](../decisions/PD-9-multi-reference-derivation.md). The author explicitly authorized updating all affected documents, including docs/ and the scoring skill. No code, provider call, production write, model change, deployment or example-library regeneration is part of this revision.

## 1. Scope and short plan

1. Make PD-9 the normative home of notation/selection/score formulas; propagate consistent explanations and correct worked arithmetic.
2. Label baseline code and historical examples accurately; preserve frozen public scores and reports. Record unresolved data/policy discrepancies.
3. Check formulas, local links and documentation diffs; run required suites/CI. Update CHANGES/HANDOFF and PR #38 for explicit author merge.

Runtime follow-up must integrate mr1 consistently across Check, Create, Join, cached maps/tooltips, immutable provenance, duplicate matching and the independent checker. It changes D/S/E/X calculation and candidate retrieval, extending the original guardrails-only scope. PD-1 governs soft-D; PD-8 governs unweighted education/experience; PD-3 governs normalization. Step4B/public proposals, Contribution and authentication remain separate.

## 2. Baseline audit (VERIFIED at main 3c25ef7)

| Existing behavior | Evidence and implication |
|---|---|
| k=5 example retrieval, configured models/temperature/seed/prompt version | `functions/ai-config.js:10`; `functions/ai-helper.js:144`. Retrieval ranks the entire library by cosine, without a chosen-type filter; A4 already solved retrieval/logging, not Step 4A enforcement. |
| Normalization supplies omitted weights, classification, geography and expertise values | `functions/ai-helper.js:578`. No strict raw numeric/schema/range gate before normalization; valid JSON alone can become model-sourced parameters. |
| Missing key, malformed response or model error returns keyword parameters | `functions/ai-helper.js:1071`. A4 deliberately labels this fallback. Blocking publication on fallback is a proposed policy change requiring approval, not an existing defect in that contract. |
| Embedding failure already refuses Check | `functions/index.js:655`; retain this behavior and no random vector. |
| Server draft controls Create; body numeric overrides ignored | `functions/params.js:59`, `:105`, `:131`; title/description, submitter, location and A5 stale-scope checks exist. No explicit validated-guardrail status/version check. |
| Canonical locality guard already exists | `functions/issue-scope.js:7`; A5 removes flat/house ownership filters for unit/building scope. Preserve and validate effective parameters after the guard; do not restore broad-owner recruitment. |
| Check stores draft and returns parameters | `functions/index.js:664`, `:882`; no Step 4A result gate ahead of membership preview/draft creation. |
| Current UI supports text clarification and displays model/fallback source | `prototype/js/main.js:5631`, `:5694`; extend this flow with actionable questions and clear Create invalidation. |
| Raw output/usage and shown parameters are logged | `functions/analyzer-log.js:26`; log writes are currently best-effort (`functions/index.js:39`). Durable validation provenance before publication is a proposed change. |

Offline [library audit](M3-analyzer-audit.json): 100 examples, **100 distinct exact categories**, no exact category with five examples. All weight groups sum to one within 1e-6; relevance examples 25/27/51 contain zero components (permitted by protocol section 2), while aggregation components are all positive. Three exact categories are absent from the protocol taxonomy table: examples 12, 15 and 47. Do not silently rewrite these categories, widen ranges across unrelated examples or call a single anchor a calibrated five-example type.

The project relevance skill contains historical formulas that conflict with approved A1/A2/PD-8 and current canonical code. This task does not adopt its obsolete resource-weighted Expertise or alter scoring mathematics.


## 3. Intended math and clarification contract

Use PD-9's s_j / alpha_j / u_j notation throughout. Rank reference similarities, take the consecutive chain with s>=.30 and adjacent gap<.05, count the entire chain and request reformulation if more than three. Display all chain categories/titles/scores/matching aspects; suggest narrower wording or a split only where the actual context supports it. No match or incompatible scope/authority requires clarification. Do not diagnose poor writing solely from a long chain.

Reference-specific D/S/X stay paired with reference relevance weights; X uses outgoing relations of directly affected people, maximum one step, no creator privilege. Geography takes max mu/sigma for compatible scopes/one center. Education and work evidence combine with alpha before one age floor. Blend ISR aggregation weights, form one public and normalize combined R/E once. No numeric weight sliders, silent default weights or averaging categorical eligibility.

## 4. Runtime design gates (before implementation)

- Define/freeze similarity metric, text/context templates, aspect embeddings, source versions and direct-affectedness A_j predicate. Evaluate current D/G gates, bypasses and top300 retrieval against full-population mixed upper bounds; no premature social exclusion. Do not invent an A_j threshold as part of documentation work.
- Strict raw/effective schema validation before defaults: finite numeric values; relevance weights [0,1], aggregation weights (0,1), group sums within1e-6; mu>=0, sigma>0; positive CBC adjustment; compatible categorical enums/aliases. Deterministic derived weights must match stored references/alpha. No clamping/rescaling to repair an invalid response.
- Bind title/body/context/source inputs, resolved point, reference set/scores/alpha/aspects, formulas and library/model/prompt/validator versions to one immutable server draft. Fresh edits or failed Checks invalidate Create; late responses cannot revive stale drafts. Preserve U6/A5 locality and U10 duplicate/title/Join behavior and already-created draft idempotency.
- Distinguish pass, needs_clarification, not_consistent, unsupported_library and service/invalid-analysis failures. Unsourced stated ownership/local-rule claims carry cautions; necessary unknown authority facts get questions. Do not use model legal knowledge as a rule or judge merits. Links/documents are context data, never instructions.
- Use existing analyzer_logs, issue_drafts and versioned issue_vectors rather than create a competing log collection. Record raw/effective derivation, membership source/coverage, errors and per-stage usage. Fallback publication and durable-log-before-pass changes remain proposals requiring explicit implementation approval.
- Plan up to one selection embedding plus three aspect embedding texts, and any distinct whole-issue duplicate vector; reuse only identical model/task/template/text. Batched texts still count separately. Text-stage count and evaluation allowance need a concrete reviewed plan; no inherited D1 budget. No population re-embedding implied.

## 5. Acceptance and execution order

First review the offline calibration/coverage report and concrete implementation plan. Only then implement on a feature branch and test an isolated emulator/copy. Required suites and final-head CI must pass. Live applies/deployments and UI mutations stay author steps with full PowerShell commands and numbered instructions.

Acceptance includes reference boundary/tie/no-match/>3 cases; group sums/bounds; paired-weight counterexample; single-floor noncommutativity; all-equal normalization and storage precision; maximum geography; affected-person outgoing edge direction/no reciprocity/self/multihop; unknown profiles; deterministic context/aspect binding; stale/forged/old-draft refusal and created-draft replay; Check/Create/Join/checker parity. Existing D1 negative cases and accepted scores remain frozen as versioned regression evidence, not expected mr1 results. Measure candidate membership and per-member changes on all ten D1 scenarios, including long-chain false alarms. Offline mathematical fixtures do not establish model quality or calibrated confidence.

## Validation evidence

[Documentation validation](M3-documentation-validation.json): 10,000 formula cases, seven chain boundaries, directed one-step social fixture, 12 corrected Expertise examples, 100 unchanged parsed reference cases and no broken relative links. Required suites: Node129 passed/four optional skips; Python127 run/two optional skips. These checks establish arithmetic/document consistency, not model quality or live mr1 acceptance.

## 6. Status log

- 2026-11-16: author authorized all reviewed documentation changes. Replaced fixed-five proposal with PD-9 and affected-person X, corrected expertise math/examples and current-vs-intended labels. No app implementation or live/provider operations.
- 2026-11-15: original baseline audit at3c25ef7 and proposed fixed-five/type-table policy; superseded in this revision. The committed library audit remains valid historical evidence.
