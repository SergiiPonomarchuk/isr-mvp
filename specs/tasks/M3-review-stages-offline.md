# M3 offline staged review - 2026-11-17

Status: **author-approved offline design and fixtures completed**. No paid call or application integration. Implementation: functions/experiments/review-stages.js. All artifacts beginning staged- under M3-evaluation are explicitly fixture-only or prepared requests, not model outputs. The captured failed hundred-key model response remains unchanged.

## Design implemented and tested

1. fixtureDecision retains the original input and exact field/quote evidence for the chosen decision, scope and optional affected place/group. The lock-only fixture reflects the author's confirmed choice. Resolved records cannot have declared unresolved facts or contradictions; unresolved records cannot create a domain plan. Unknown/invented source spans and changed original input refuse. No heuristic or model automatically resolves new user requests. Source hashes detect drift; they do not authenticate approval or prove the quoted evidence semantically establishes the chosen scope.
2. One experimental scope predicate implements the unchanged equal-scope/building-unit rule. A full 8-by-8 matrix proves parity with the current production validator. Production code still uses its existing predicate; moving both consumers to a shared production module is a future integration change, not done here.
3. The plan retains the complete original 100-ID chain and similarities. For the fixed author-confirmed building decision, **81 IDs receive true scope incompatibility proofs and 19 require domain review**. Each scope proof records both scopes, rule version, reference ID, decision seal and library hash. These are fresh proof records, not patches to earlier model omissions or invented semantic exclusions. No top-k cap, new threshold, selection text, embedding, similarity or weight change.
4. The domain prompt supplies only settled source facts and the 19 compatible references. The original mixed request is preserved in the audit record but not resent as an active request. Scope is fixed by the source-backed fixture, never chosen from the nearest reference. Domain exclusion types are decision, affected_group or context; a scope-mismatch verdict type is refused. Non-pass may defer unresolved domain facts without scores. Free-text reasoning can still be false; typed reasons do not establish general truth or guarantee a model will never repeat a question.
5. Merge regenerates the expected plan from unchanged input/ranking/library/decision and rejects stale or altered plans/responses, missing/unknown/duplicate IDs and scope-type domain exclusions. Model/fixture aspect/evidence quotes must lie in settled source facts; demographic evidence cannot reintroduce deferred original context. The complete 81+19 provenance map projects to the unchanged validator/math. Synthetic one/two-reference fixtures verify arithmetic parity, not real-model scoring quality. No scoring happens for non-pass outcomes.

## Measurements and evidence

The prepared domain request measures **14,742 bytes**, schema 2,751 bytes, versus the prior 31,480-byte full-chain request. All 100 raw IDs remain accounted for; only the source of review differs. The synthetic domain response is 1,284 bytes; these are UTF-8 bytes, not provider token counts. The existing 32 KiB refusal remains. Real provider admission and meaningful domain judgments are untested.

The merged verbose fixture is **124,167 serialized bytes**, with repeated audit/proof data. This is not a Firestore write-size or transaction-performance acceptance result. Future integration must review deduplication by immutable source references and storage/transaction envelopes without losing provenance; the prior large-public capacity blocker is not solved.

Reproduce the static audit with node functions/tools/review-stages-audit.js. It uses no SDK, credential loader, network or database. Machine-readable measurements and prepared request: staged-review-audit.json / staged-domain-request.json. Decision, partition and explicitly SYNTHETIC domain/merge artifacts are alongside them.

Verification: **Node 197 passed, five optional skips; Python 140 run, two optional skips**. Installed-SDK fake fetch verifies the nineteen-key domain schema; other tests cover all scope pairs, quotes, settled/unresolved/contradictory facts, preserved original context, stale/partial/proof-tampered merges and one/two-reference parity. Final CI checked on the pushed head.

Actual cumulative usage remains **22 reviews / 14 embedding texts / 14 POSTs / 36 HTTP attempts**, US$0.351880 reserved under original US$0.50. No provider call, credential loading, database/production mutation, deployment, rules edit, profile re-embedding or model/library/math/selection change for this task. Sol Medium remains sufficient. Full-population memory and publication-capacity blockers remain separate.

## Integration is a separate proposal

See M3-review-stages-integration.md for the versioning, decision-resolution trust, handler/draft/cache/storage and migration checks required before application integration. None is authorized or implemented by the offline prototype. An accepted fixed fixture does not establish reliable automatic resolution of arbitrary issues.

## Exact optional next actual check - not authorized

One isolated domain-stage check of the prepared author-confirmed lock fixture, **23 cumulative reviews**, SAME original total US$0.50 and existing 45-text/17-POST ceilings. Exactly one review/HTTP attempt, existing model/seed/temperature, 8,192-output ceiling, no new embeddings or retries, no handler integration. Pin the decision, rule, plan, nineteen-ID request, full original ranking/library and every prior receipt. Prepare/test a dedicated guard only after this precise revised allowance is approved; the exhausted 22-review limit is unchanged now.

The measured request would reserve US$0.016230, giving a conservative cumulative US$0.368110, below original US$0.50. Require exact nineteen-ID coverage and complete hundred-ID merge/provenance; perform semantic review for repeated settled choice, false exclusions and invented facts. Any non-pass, schema/admission/coverage failure or false reasoning is recorded without coercion or another call. Even a good response demonstrates only this fixture's domain stage, not automatic decision resolution, private-help generalization, multi-reference quality or deployment readiness.
