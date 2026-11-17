# M3 complete candidate-review protocol proposal

Status: **proposal only; no implementation, paid allowance, model change or policy change authorized**. The two-case probe reached 21/21 approved reviews. This proposal follows the confirmed meaning/eligibility rules and preserves PD-9 arithmetic and full-chain review.

## Evidence

Clarified lock selection produced all 100 references in one valid adjacent-similarity chain. The model answered for two IDs, omitting 98. The current validator correctly refuses publication. Adding more prose did not establish complete coverage. There is no output-limit truncation evidence and no basis to auto-exclude missing IDs.

## Recommended offline design scope

Prototype a candidate-ID-keyed review contract: each supplied raw-chain ID has exactly one explicit verdict, accepted with input evidence/aspect linkage or excluded with a substantive reason. Derive the existing accepted/excluded forms only from those explicit decisions, preserving full source provenance. No default verdict and no invisible trimming. A server-side exact-ID coverage check remains authoritative even if the provider schema requires every key.

First assess the maximum 100-candidate schema and prompt/output envelopes offline against the already recorded provider complexity rejection and 32 KiB/8,192-token reservations. Keep schema grammar simple and avoid numerical/nested array bounds. Fake-SDK tests must verify exact request shape, full coverage, evidence, duplicate/unknown IDs and refusal of missing decisions. Such tests do not prove real provider admission or model quality.

If a one-response schema cannot fit the existing envelopes reliably, document a separate staged/chunked alternative with exact full-chain coverage, immutable merge evidence and per-request accounting. Chunking must never change similarities, alpha weights, membership, scopes or retained-set semantics. Its extra requests/partial-failure behavior need explicit review and a new precise allowance; it is not implicitly approved as a fallback.

Keep clarification authority, personal-help eligibility, scope compatibility, literal evidence, reference library and models unchanged. Preserve all existing receipts and tests. No profile embedding, production write or deployment. Draft the new task spec and short plan for author approval before code. Any future actual admission/quality trial needs its own exact cumulative count allowance; US$0.50 headroom does not reset the exhausted 21-review limit.

## Decision requested

Approve the **offline candidate-review design/prototype scope** above, with no paid calls, before implementing the new review contract. This is a request to change the output protocol, not approval to bypass validation or silently change the application's Gemini model. Sol Medium remains sufficient.

- 2026-11-17: Author approved offline candidate-review prototype. Plan: implement an isolated keyed-verdict adapter, test strict parsing/full coverage and actual-SDK fake transport, then measure full-chain request/output envelopes. No app-handler or paid-runner integration and no provider call. Explicit deferred verdicts are permitted only for non-pass outcomes, preserving clarification without fabricated exclusions.

- 2026-11-17 completed: approved isolated prototype and fake-SDK/strict-validation tests. Actual 100-candidate envelope fits 32 KiB; provider grammar/token/semantic behavior untested. No paid calls. See M3-candidate-review-prototype.md for final evidence and the optional exact one-call decision.
