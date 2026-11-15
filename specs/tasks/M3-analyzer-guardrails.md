# M3: Analyzer guardrails / Step 4A

Status: **PROPOSED, 2026-11-15; policy approval required before implementation.** The author authorized audit/spec preparation after D1 acceptance PR #35 merged as `3c25ef7`. This document proposes behavior; it does not describe implemented guardrails or authorize provider calls, deployments, production writes or rules changes.

## 1. Goal and governing decisions

Check should either produce a validated, explainable issue type and parameters, ask concrete questions, or explain why the supplied context is inconsistent. Create must accept only the exact validated server draft. No numeric sliders, silent default weights or publication on an unvalidated model response.

Authority: `docs/ISR-Issue-Analyzer-Protocol-v1.md` sections 2, 4, 4A and 7; PD-8 (nobody types a number, resources do not contribute to Expertise); PD-4 (versioned, auditable Analyzer); approved A4/A5/U6/U10 behavior. This task implements submission-time Step 4A only. Step 4B/public change proposals, soft D, Contribution, membership formulas/caps and D2 authentication/authorization remain separate. Existing stored issues, votes and demo outcomes keep their original parameters.

The protocol requires that parameter ranges come from examples **of the chosen type**, with k=5 as an initial calibration choice. It distinguishes missing context from missing supporting sources: a stated but unsourced ownership/local-rule claim yields a visible caution, rather than an automatic publication ban. It prohibits the assistant from inventing local legal authority or judging the merits of the issue.

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

## 3. Decisions proposed for author approval

| ID | Recommendation | Tradeoff / alternative |
|---|---|---|
| D1: meaning of type | A curated, versioned **type table** grouping examples by decision context, affected scope and applicable protocol pattern. Categories remain separate descriptive fields. Publish every example-to-type mapping and inclusion rule for review before code. | Exact-category types have one anchor each, giving fixed numeric ranges. Global nearest-five mixes types. Neither silently implements the intended rule. The actual number of types follows the reviewed mappings, rather than an arbitrary target count. |
| D2: range rule | k=5 within the chosen type; closed component-wise min/max for supported numeric parameters, intersected with applicable protocol pattern/scope bounds and valid weight sums. No rounding, clamping or normalization to rescue an invalid response. | Smaller groups are explicitly unsupported until calibrated; ask for another consistent supported type or explain coverage limitation. Never invent padding, widen ranges or reduce k silently. Empty intersections are a library/configuration error, not user inconsistency. |
| D3: publication during failure | Keyword fallback stays diagnostic only; new Check/Create cannot publish unless model analysis and server validation pass. Provider/malformed-output failure reports AI unavailable or invalid analysis, preserving text for a manual retry. | This explicitly tightens A4's labelled-fallback contract. Retaining publishable fallback would require the same independently calibrated type/context gate, which keyword rules currently do not provide. |
| D4: retry/cost | No automatic semantic repair calls. A successful path may use **at most two text calls and one issue-embedding text**: classification/context, then derivation using server-selected same-type anchors. Stop early when clarification is needed. | Two stages avoid deriving numbers from examples of a different type. More expensive than current one-text-call Check; no new model or profile re-embedding. Any evaluation budget must be separately approved. SDK transport retries must be measured/configured separately from semantic calls. |
| D5: calibration before runtime | Approve the approach first; next produce the complete type mapping, taxonomy-alias proposals, per-type bounds/coverage and conflict report, then seek approval of that concrete artifact before implementation. | Prevents a mechanical global-nearest rule from silently becoming governance policy. No docs/ edits or anchor-value changes in this proposal. |

Recommended approval is D1-D5 together. Approval of this proposal permits the offline calibration artifact; it does not waive review of the mapping or authorize implementation/live work. If an anchor contradicts a governing pattern, show the exact conflict and obtain a decision before changing either.

## 4. Proposed contract after calibration approval

### 4.1 Type library and retrieval

The committed table records stable type IDs, descriptions, inclusion/exclusion rules, compatible categories/scopes, decision/proposal outcomes, protocol pattern references, anchor IDs and library version/hash. Taxonomy discrepancies have explicit reviewed aliases or approved exclusions; neither runtime nor model invents new IDs. Reject duplicates, missing anchors, insufficient same-type anchors, nonfinite values and infeasible intersections at build/test time.

Classification/context stage uses bounded existing semantic candidates plus compact type definitions. The model may propose only listed compatible types; the server checks IDs and scope compatibility. Once selected, the server ranks anchors **within that type**, with stable example-ID tie breaking, and supplies the nearest five plus computed bounds for derivation. Log candidate IDs and selected type/anchors. An uncertain classification asks what affected group/place or decision is intended; do not use an invented confidence cutoff.

Use the existing issue vector/template for membership and semantic comparison. Clarification must influence classification/context and derivation. Keep its input hash bound to the resulting draft; do not silently change the A4 title/description embedding template or re-embed the population. Evaluate cases where clarification changes scope/type explicitly.

### 4.2 Raw and effective parameter validation

Validate parsed raw JSON **before existing default-filling normalization**, then validate effective canonical parameters after the A5 guard and supported alias conversion. Numeric strings, null, booleans, missing required numbers, NaN/infinity, arrays in object fields and conflicting aliases are invalid. Optional display text can have documented empty defaults; weights/classification cannot be invented.

- Relevance weights in [0,1]; aggregation weights strictly in (0,1); each group sums to 1 within proposed absolute tolerance 1e-6. Check unrounded values. Zero relevance weights remain permitted.
- Geography: finite mu >=0, sigma >0, satisfying approved chosen-type and protocol scope constraints. Domain parameters must satisfy their reviewed type bounds and canonical field semantics. Do not introduce numeric ranges for categorical expertise depth/domain labels.
- Classification, expertise depth, demographic enums/lists, resource guidance and aliases follow one explicit supported schema. Cross-check minAge/maxAge order, scope/point requirements and existing location validation. Ignore client-supplied numeric derivations as today.
- No automatic rescaling/clamping. A server-invalid response is `invalid_analysis` (retry available), not `not_consistent` about the user's issue. Missing calibration is `unsupported_type`; library inconsistency is a configuration error.
- Resources remain option guidance; no weight for money/property/resources. No change to canonical D/G/S/X, E, C or ISR computation.

The offline calibration artifact must enumerate every numerical field covered and all categorical allowed values. Bounds cannot be declared operational until that artifact and protocol conflicts are approved.

### 4.3 Context outcomes and user flow

| Outcome | UI and publication behavior |
|---|---|
| pass | Show type, derived parameters, decision/proposal addressee where applicable, rules/examples and cautions; enable Create only for the validated fresh draft and existing duplicate rules. |
| needs_clarification | Preserve title/body/pin, ask up to three concrete questions about missing group/place/decision context; expose one text answer and Check again; no publishable draft or invented score preview. |
| not_consistent | Cite the rule/anchor conflict and explain what reformulation is needed; no Create. Used only for context with no consistent supported type, not a provider or validator failure. |
| unavailable / invalid_analysis / unsupported_type | Preserve inputs, show a specific reason and manual retry/reformulation route; no Create or silently substituted weights. |

A stated ownership/local-rule claim without a source gets a visible caution. Unknown facts necessary to distinguish decision from proposal get a question. Stated authority-reserved decisions become proposals to the named addressee only through a calibrated matching proposal type; do not fabricate a 2000m radius from the protocol's illustrative example. No external legal research or automatic URL fetching. Attached sources are user assertions/references, never instructions to the model or server.

Sources/context are plain bounded text/links in this package; document upload/OCR is separate. Display text escaped. A consistent alternative may be proposed, but picking its ID is a request to recheck context, never a numeric override. Do not add a redundant Continue button: existing Check and Create remain the actions.

### 4.4 Drafts, Create and compatibility

Every publishable draft binds exact title, description, clarification/context/source inputs, effective point, submitter, validated parameters, type/library/validator/prompt versions and input hash. Changes invalidate checked status immediately. A failed Check clears the browser's previous usable draft. Responses arriving after text/pin/context edits cannot revive Create.

Create rechecks the stored validation receipt/version, canonical parameter constraints and bound inputs, then applies existing U10 duplicate/title/transaction rules. No provider call at Create. Drafts predating the guardrail receipt require a new Check; existing created issues are unchanged. Preserve idempotent creation_result replay for already-created drafts without rebuilding a public or requesting another model call; explicitly test its ordering with new receipt checks.

Do not move runtime validation into browser-only code. Preserve U6 pin/reference handling, A5 guard, duplicate/Open/Join and the single Create action. This task does not make session-stored identity secure; D2 handles that boundary.

### 4.5 Audit and reproducibility

Extend the existing analyzer_logs/draft path, rather than creating a competing analyzer_runs collection. Store stage/outcome, input hash, rules applied, selected/alternative type IDs, candidate/anchor IDs, computed ranges, exact library/validator/model/prompt versions, raw versus effective parameters, validation errors, cautions and per-stage usage. No keys, profiles or retrieved page bodies.

A pass requires durable server validation provenance. If the required log/receipt cannot be stored, do not issue a publishable draft; show a retryable service error. Log failure must not be mislabeled as missing user context. Define atomic receipt/draft linkage during implementation and retain existing approved issue-text logging policy. This changes current best-effort logging and must be covered by failure tests.

Fixed recorded responses verify deterministic validation, not fresh-model reproducibility. A separately budgeted test/retest evaluation must report outcome/type/anchor/range stability, parameter differences, question quality, tokens and provider attempts; temperature zero is not a guarantee of identical model output.

## 5. Execution and acceptance gates

1. Author approves or amends D1-D5. Offline audit/spec phase has zero provider calls and zero database writes.
2. Produce full reviewed mapping/bounds/coverage artifact, explain all protocol/example conflicts, ensure every D1 case has supported context and proposal/decision handling. Author approves this artifact and a short implementation plan before code.
3. Implement pure schema/type/range/context validators and staged analyzer integration on a new feature branch; mock provider outputs in tests. Extend server drafts/Create and current UI/logging. Preserve frontend CRLF/final CR.
4. Required Node/Python suites and focused failure/integration checks pass. Use an isolated emulator/copy; verify its host before writes; keep accepted live/emulator demo state intact.
5. Present emulator behavior to author using full links and numbered instructions. Fresh paid calls require a concrete budget/ceiling approval; existing D1 allowance is not reused. Open implementation PR after evidence/status/CHANGES; separate explicit merge. Author deploys, agent verifies live read-only, author performs agreed live smoke checks.

Acceptance must cover:

- Each approved type/anchor/bound reproducible from versioned data; one/fewer-than-five anchors, unknown type, taxonomy conflict, empty intersection and wrong embedding metadata refuse safely.
- Valid response passes unchanged; missing/wrong/nonfinite/out-of-bounds fields and invalid sums fail before draft/public creation; near-boundary tolerance and zero-relevance/positive-aggregation cases covered.
- Missing facts, contradictory context, authority proposal, unsourced caution and unsupported coverage produce distinct outcomes; no model merits judgment or invented legal rule.
- Failed Check followed by Create, old draft, altered clarification/source/pin, stale async response, forged pass/client weights and log-storage failure cannot publish; successful Create retry remains idempotent.
- A4 missing embedding, A5 residential locality, U6 point handling, U10 title/duplicate/Open/Join and canonical stored values continue to pass. No historical rescore/reseed.
- Approved representative D1 cases plus vague, adversarial and inconsistent examples are evaluated with recorded fixtures; no provider calls in CI. Runtime validation tolerances do not replace D1's separate score-check tolerance.

## 6. Status log

- 2026-11-15: audited main 3c25ef7 after merged D1 acceptance #35. Drafted proposed Step 4A contract and identified the same-type calibration gap, three taxonomy discrepancies and publishable fallback/logging policy changes. Documentation/aggregate offline evidence only; zero provider calls/tokens, zero database writes, no deployment/rules changes. Waiting for D1-D5 policy decisions; no guardrail implementation claimed.
