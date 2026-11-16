# Corrected M3 pilot result, 2026-11-17 Europe/Kyiv

**Stopped after one corrected request returned HTTP 400.** No corrected model output or quality acceptance was obtained. This is not a successful 14-case run. No further provider request was made.

The approved implementation is in place:shared structured enums, actual-input demographic criterion evidence, U6 home/work/property guidance, separate prompt/schema provenance, current unfinished-draft gate with frozen completed replay, and schema-aware cumulative reservations. Offline tests and actual Check/Create/Join emulator parity passed before execution. Models, scoring formulas and historical scores were unchanged.

| Counter | Corrected run | Cumulative including original |
|---|---:|---:|
| Review / HTTP attempts |1|2|
| New embedding texts / POSTs |0|0|
| Conservative reservation, USD |0.014174|0.027255|
| Reported input/output tokens |unavailable|497 /285 (original only)|

The original reported token-based estimate remains US$0.000552. No charge or token count is inferred for the HTTP 400. Both reservations are retained; the controller did not reset the original allowance. No geocoding, Firestore/production write, profile re-embedding, snapshot import or deployment occurred.

## Diagnosis and correction limits

The guard recorded HTTP 400 but suppressed the provider explanation. That was an error-logging gap; no exact root cause can now be recovered from the receipt. Safe diagnostic capture has been added and tested offline:retain bounded redacted provider message and field paths, excluding credentials, URLs, emails, headers and raw SDK objects.

An offline check found a null member in the recorded scope enum. The provider's documented schema subset describes string/number enums, so scope is now represented as `anyOf` string-enum/null branches. This preserves intended semantics. It is a **compatibility candidate, not a confirmed cause** of the 400, and no new admission call has tested it. [Audit](M3-evaluation/provider-compatibility-audit.json).

- [Corrected request](M3-evaluation/pilot-20261117-corrected/attempt-1-request.json), [cumulative ledger](M3-evaluation/pilot-20261117-corrected/ledger.json), [summary](M3-evaluation/pilot-20261117-corrected/summary.json).
- [Original pilot report](M3-pilot-report.md) remains separate and its receipt is immutable.
- [Bounded technical continuation proposal](M3-provider-compatibility-continuation.md) requires author approval: 20 cumulative review attempts,45 embedding texts/17 POSTs under the **same original total US$0.50**, preserving both old receipts and allowing tightly scoped offline-tested HTTP 400/schema repairs without per-error permission loops. No such continuation has run yet.

The separate publication capacity and memory prerequisites remain unresolved. Do not deploy or claim real-population/real-model acceptance. A third actual request remains unauthorized under the approved single-corrected-run fail-stop rule.

Final offline verification after the diagnostic/schema edits: **Node 170 passed, five optional skips; Python 140 run, two optional skips**. The actual emulator parity result above predates these final transport/schema edits; no provider admission or full-population result is claimed.
