# M3 offline Analyzer evaluation plan - 2026-11-17

Status: **approved offline scope completed**. No actual benchmark, model/config switch, deployment, API credential loading or production/database write. functions/tools/analyzer-evaluation-plan.js reproduces the frozen baseline manifest, eight offline fixtures and two unexecuted request variants using local files only. The active Analyzer stays gemini-3.1-flash-lite with its existing configuration.

## Baseline and independent quality gates

M3-evaluation/analyzer-evaluation-plan.json freezes current source/dependency files, original request/results, source decision/ranking/library and every historical receipt. Old receipt source pins remain the evidence of each historical epoch; the new manifest is a planning snapshot, not a claim every old run used current source. No real failure is repaired or relabeled synthetic.

The actual staged baseline understood the lock-only choice and supplied all rows, but gave 18 false scope reasons and a wrong home anchor. The frozen request has **no thinkingConfig**. Google's [current thinking guide](https://aistudio.google.com/docs/thinking#thinking-levels) lists minimal as the default for both Flash-Lite models. That is a documented current default, not a measurement of old internal effort, and does not prove low thinking would fix the failure.

| Gate | Independent expected fact / review rule |
|---|---|
| Explicit narrowing | The confirmed lock choice is settled; no repeated choice unless a genuine contradiction is identified. |
| Scope truth | Building and unit are compatible under the unchanged rule. A context verdict does not excuse a false scope assertion. |
| Domain truth | Reference 1 is required for this fixture; other 18 retention judgments require human adjudication. Compatible scopes alone do not require acceptance. |
| Location | Our apartment entrance uses home; work/distinct-property/external-name fixtures separately require their existing U6 anchors. No geocoding to establish a label. |
| Personal help | Eligibility does not depend on public/municipal status. D1-09 may legitimately need facts or lack a compatible reference; pass is not mandatory. |
| Evidence/defaults | No invented people/group attributes, local law, quotes or topic features. Missing facts stay unresolved. |
| Structure/provenance | Every domain row and all raw IDs must be accounted for, with genuine scope proofs and unchanged score arithmetic. |
| Ambiguity | No automatic semantic pass from schema validity, keyword absence, a model judging itself or a numerical aggregate that hides a critical error. |

Eight fixture entries cover the settled lock, personal help, four location sources, genuine vagueness and an explicitly unannotated multi-reference item. They are offline/review fixtures, not new authorized paid inputs. Semantic annotation of ambiguous retention and multi-reference cases must precede any later general benchmark. Existing one/two-reference arithmetic fixtures are not semantic gold labels.

For any future result, record transport/schema success separately from factual checks and human review. A critical factual failure or unresolved human judgment prevents promotion/publication. Literal captured phrases identify the known baseline failures only; no brittle runtime blacklist or NLI truth guarantee is introduced.

## Cheapest configurations worth comparing

Current [standard paid text prices](https://aistudio.google.com/docs/pricing), checked 2026-11-17, USD per million tokens:

| Proposed arm | Model | Thinking | Input | Output, including thinking |
|---|---|---|---:|---:|
| Existing model | gemini-3.1-flash-lite | LOW | $0.25 | $1.50 |
| Modest-price alternative | gemini-3.5-flash-lite | LOW | $0.30 | $2.50 |

Recommendation: test explicit LOW on the existing model before assuming a model switch is necessary. For a fair fresh model comparison, run both LOW arms on the **same frozen staged request**; only model changes between arms. Compare the existing LOW arm with the historical omitted-thinking baseline only as observational evidence, not proof of a thinking effect. One sample per arm is diagnostic screening, not reliability measurement or a universal model ranking.

The [3.5 model page](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) lists a stable model code and structured-output/thinking support. It is a plausible inexpensive comparison candidate, not a demonstrated ISR improvement or a guaranteed project entitlement. No latest alias, alternate provider, API endpoint migration or more expensive model is selected. Other families may ignore temperature controls, so expanding the matrix needs explicit fairness review rather than an automatic fallback. Provider benchmarks on unrelated tasks are not ISR acceptance evidence.

Development recommendation stays Sol Medium. This does not change the application's Gemini model.

## Exact future matrix - not authorized

Two fresh reviews only: existing-low and candidate-low, fixed confirmed-lock domain fixture, same contents/schema, temperature 0, seed 20261110, maxOutputTokens 8192, thinkingConfig.thinkingLevel=LOW, no tools/retries/embeddings/geocoding/production integration. Credential-free prepared variants are analyzer-evaluation-request-existing-low.json and analyzer-evaluation-request-candidate-low.json. The installed SDK has been tested with fake fetch to preserve both proposed configurations; this proves neither actual model access nor reasoning quality.

This would require a precise allowance of **25 cumulative reviews**, keeping original **total US$0.50**, 45 embedding texts and 17 POSTs unchanged. The actual 23-review allowance remains exhausted now. Keep all prior receipts and US$0.368110 reservations; never reset them with a new run ID.

| Arm | Byte-based input proxy | Visible-output cap | Extra thinking buffer | Proposed reservation |
|---|---:|---:|---:|---:|
| Existing LOW | 15,766 | 8,192 | 8,192 | US$0.028518 |
| Candidate LOW | 15,766 | 8,192 | 8,192 | US$0.045690 |

The two-arm **scenario** reservation totals US$0.442318 including all earlier reservations. This uses an extra output-priced buffer; it is not a proven provider billing maximum or an account-wide cap. It must not be presented as two calls already authorized or guaranteed to fit thinking charges.

**Execution gate:** before any LOW request, verify thinking-plus-visible-output accounting for the exact generateContent endpoint/model and implement a source-pinned reservation consistent with that evidence. The public [thinking cap discussion](https://aistudio.google.com/docs/thinking#token-limits) uses Interactions fields; the [generateContent reference](https://aistudio.google.com/api-reference/generate-content) uses candidate-token wording. This review does not silently transfer a guarantee across endpoints. If accounting cannot be established within the approved money ceiling, do not call; return with the specific blocker or a revised reviewed plan. No endpoint switch or token-count API call is implicitly authorized.

After that gate and explicit author approval: exactly one attempt per arm, immutable sources/inputs/rates, SDK retry fuse, separate finish reason/visible/thought/total usage, error redaction and actual modelVersion. Stop on provider/auth/schema/transport uncertainty, over-reservation or partial data. A complete but semantically failed first response may be retained for the prespecified second arm; do not edit prompts midway, repair outputs or automatically escalate to a third model. Semantic comparisons remain human-reviewed and no successful result alone enables production publication. Unknown charges keep their reservations.

## Offline validation and remaining work

Node **205 passed/five optional skips**, Python **140 run/two optional skips**; final CI checked on pushed head. Tests cover local source freezing, baseline failure preservation, ambiguous labels, paired request equality, reservation arithmetic and actual-SDK fake transport of LOW for both codes. No actual provider request occurred. Actual usage remains **23 reviews / 14 embedding texts / 14 POSTs / 37 HTTP attempts / US$0.368110 reserved**.

Official-source fact records/links are in analyzer-model-research.json. Current pricing/access must be rechecked before any later benchmark; no free-tier assumption, API-key inspection, paid model listing or model promotion occurs. Full-population memory/publication-capacity blockers, automatic decision-resolution trust and application integration remain separate unapproved work.

## Next author decision

Approve preparation of the paired LOW comparison and the exact potential 25-review/SAME-US$0.50 allowance **subject to the endpoint thinking-budget gate above**, or request changes to fixtures/arms. No real call may precede that gate. Choosing/testing a candidate does not authorize changing the active Analyzer model.
