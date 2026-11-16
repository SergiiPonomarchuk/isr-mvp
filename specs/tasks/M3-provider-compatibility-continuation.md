# M3 provider compatibility continuation proposal

Status: **not authorized for further paid execution**. The author approved the context correction and one corrected run under 15 cumulative reviews/45 embedding texts/17 embedding POSTs/same US$0.50. That run stopped on HTTP 400. This proposal changes how technical API failures may be investigated within a fixed allowance; it is not permission by itself.

## Recorded second stop

The corrected request reached the provider once and returned HTTP 400. The pilot stopped before a model result, embedding or another request. The raw request, source hashes and failed-attempt ledger are preserved under `M3-evaluation/pilot-20261117-corrected/`. Cumulative totals across both immutable receipts:two review/HTTP attempts, zero new embedding texts/POSTs;US$0.027255 conservatively reserved. Only the original attempt has reported usage (497 input/285 output tokens; estimated US$0.000552). No token usage/cost is asserted for the 400 response.

The first transport guard discarded all provider error details to avoid credential leakage. It preserved HTTP 400 but lost the exact explanation. That diagnostic design was insufficient. It has been corrected offline: future errors retain only code and status, bounded redacted message and field-violation paths/descriptions; API keys, bearer values, URLs and emails are removed. Full SDK errors, headers, client options and raw error envelopes are never saved. Real-SDK fake-fetch tests verify useful messages survive while those values do not. No retrospective error body has been invented or attached to the old receipt.

## Offline compatibility finding and limits

The recorded schema placed null inside the scope enum. The installed SDK and [public API discovery schema](https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta) describe enum support for strings/numbers; the [JSON schema guide](https://aistudio.google.com/docs/structured-output#json-schema-support) documents null types. The provider schema now represents scope with an `anyOf` string-enum branch and a separate null branch. All other grounding/location rules and arithmetic remain unchanged. Offline tests check this supported-subset representation.

This is a concrete compatibility candidate, **not a confirmed cause of HTTP 400**: the original provider message is unavailable. Its actual admission and the rest of the model interpretation have not been tested again. Do not claim the problem is solved from mock/schema tests. Future diagnostics must guide any next repair.

## Proposed permission and bounds

Authorize completing the same pinned pilot with **at most 20 cumulative review attempts**, counting the two existing attempts, and retaining **45 cumulative new embedding texts /17 embedding POSTs /same total US$0.50**. No additional US$0.50 is requested. At most 18 additional review attempts remain:up to 14 pinned case reviews plus at most 4 extra technical attempts. Unused case/follow-up slots do not authorize new inputs, models or scenarios.

- Keep SDK/network automatic retries disabled. Each attempt is explicitly reserved, source-pinned and recorded before HTTP. Do not repeat a failed request without a diagnosed, offline-tested technical fix.
- Permit bounded technical repairs only to schema/API request packaging and the safe diagnostic/adapter path while preserving the approved interpretation rules, strict validation, input cases, models, math, thresholds and historical compatibility. Each new source epoch is recorded; no invisible hot patch or mutable old receipt.
- Only an HTTP 400/schema-admission failure is eligible for such a technical continuation. Authentication/permission/quota/network/ambiguous failures and model schema/semantic quality failures still stop for judgment. This is not an iterative paid prompt-tuning or model-upgrade allowance.
- Maintain one durable cumulative controller across explicit resumptions. Import the **current attempts** from each original receipt exactly once; do not double-count the original through the corrected receipt's copied parent base, and never reset spent counts/reservations with a fresh run folder. Pin both old receipt hashes. Refuse changed parents and conflicting/resumed-in-flight requests.
- Include prompt and schema bytes in reservations. With the same maximum envelope,US$0.027255 retained + 18 maximum review reservations + 45 maximum embedding texts reserve approximately US$0.456, below US$0.50. This is a conservative local estimate/guard, not an account-wide billing control; report actual usage when available and retain reservations for unknown failures.
- Stop before exceeding any approved counter/envelope. Preserve every request/result/error and distinguish successful quality evaluation from mere schema admission. A corrected successful case can be reused only with exact validated hashes; no hidden provider call on replay/Create/Join.
- Deployment, production writes, profile re-embedding, geocoding, memory-heavy import and publication/storage redesign remain outside this permission. The large-public capacity blocker is unchanged.

## Next author decision

Approve **bounded technical continuation** under 20 cumulative review attempts,45 new embedding texts/17 POSTs and the **original total US$0.50**, so technical HTTP 400/schema compatibility fixes do not require a new permission question after each rejection. Semantic/policy decisions and all live actions still require author attention. Until approved, no third actual provider attempt will be made.
