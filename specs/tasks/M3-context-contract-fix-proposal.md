# M3 context contract correction and controlled rerun proposal

Status: **author approved** the correction and one controlled cumulative rerun on2026-11-17 with "Approved". Implement the written scope, verify offline/emulator checks, then execute the corrected single-attempt pilot. Original pilot artifacts and allowance remain preserved. No model/math/threshold/public-cap/storage/deployment change is proposed here.

## Recorded result

The first actual `gemini-3.1-flash-lite` review of D1-01-live returned a building-level pass with reference1 and a literal input evidence span. Its demographic `property_kinds` contained `building`, which the existing server rejects. The server allows only `flat`, `house`, `land`, `garage`, `commercial`, `other`; the prompt exposed only `string[]`. The driver stopped before aspect embeddings or any second request. No public, draft, migration or Firestore write occurred.

One HTTP review attempt; zero new embedding texts/POSTs;497 input +285 output tokens reported. At the recorded rates, usage implies approximatelyUS$0.000552, not a measured invoice. The durable guard conservatively retainsUS$0.013081 against the originalUS$0.50 allowance. The remaining13 planned cases were not run; this is a failed contract probe, not a completed quality evaluation.

Two further interpretation problems in the same response require correction before a rerun:

- It labeled **my home building** as `property`. U6 maps that language to `home`; the resolver intentionally takes the first property anchor when given `property`. A synthetic two-anchor replay selects a different point from the canonical home rule. No actual profile was queried to infer a real location error.
- It converted the problem words **security/lock** into demographic features. Those are matching filters over profiles' features/interests, not descriptions of residence. A synthetic resident without those tags gets D0 under the returned rules and D1 with the unsupported topic tags removed. This is a D-component demonstration, not a claim the person would be excluded from the final A/B public.

Removing the invalid enum alone makes the current validator accept both semantic problems. The correction therefore must cover the contract and criterion grounding; deleting/ignoring the bad field alone is insufficient. See the saved raw response and [offline diagnosis](M3-evaluation/pilot-20261117/offline-diagnosis.json). No additional model call was used for this diagnosis.

## Proposed implementation scope for author approval

1. Generate the context response JSON schema from the same demographic/location enums used by the server; send it with the existing SDK review call. Property kinds must be exactly the six allowed values or an empty list. Keep strict server validation; do not coerce `building` to `other`, silently discard invalid output, or bypass a failure with keyword parameters.
2. Restore the existing U6 location interpretation in the new review instructions: home/building/entrance near one's home uses `home`; work references use `work`; an explicitly distinct owned garage/plot/land/property uses `property`; an external named place uses `named_place`. `place` is meaningful only for `named_place`; other anchors return an empty place string. Preserve the resolver and creator-moved-pin precedence. This changes the new prompt to follow the already approved U6 contract.
3. State demographic semantics explicitly: filters describe stated attributes of affected people/groups, not the subject of the problem. A lock/security topic alone cannot supply feature filters. Leave unsupported criteria unconstrained rather than inventing them. Ask factual questions when needed. Preserve current D arithmetic, default behavior, A5 residential guard and all PD-9 weights/thresholds; do not reduce population counts with invented interest tags.
4. Require source-span provenance for each non-default demographic criterion, e.g. an aspect `demographic_evidence` list with field, value and exact input quote. Check coverage, allowed field/value pairing and literal support before accepting a pass. The prompt must explain that the quote describes an affected-person attribute. Literal quotes alone do not prove semantic correctness; review actual pilot outputs rather than claiming a mechanical truth guarantee.
5. Version the prompt/schema separately from the scoring math and pin their hashes in logs/drafts/results. Keep `mr1-context-review-1` arithmetic and historical published issues/replay intact. New unfinished drafts must satisfy the corrected context contract before publication; no historical public is rescored. Record the extra criterion provenance in the frozen aspect bundle for audit; it gives no additional demographic weight.
6. Verify entirely offline first: replay the captured invalid response and desired grounded fixtures; reject unsupported enums/topic criteria without provenance; cover home/work/distinct-property/named-place and pin precedence; keep all required suites plus actual-handler emulator parity. SDK fake-fetch tests must prove the structured schema reaches the provider and all schema/prompt bytes participate in the reservation envelope.

Example of the intended first-case interpretation for testing, **not model output**: location `{anchor:'home',place:''}`; unrestricted age/employment/family defaults; feature/property lists empty unless actual affected-person facts support a filter. This is not a manual replacement for the recorded model result and does not authorize publication.

## Proposed corrected rerun and unchanged money ceiling

After that scope is approved and its offline checks pass, propose **one corrected pilot run of the same14 pinned cases**, with the existing conditional follow-up rules. This means **at most15 review attempts cumulatively**:the original failed-schema review plus at most14 corrected reviews. The original attempt still counts and is never erased or overwritten. New embedding allowance stays **45 texts /17 POSTs cumulatively** because the original run embedded none. Existing models, no automatic retries, no geocoding/profile re-embedding and no production writes remain.

Keep the **original totalUS$0.50 ceiling**, not an additionalUS$0.50. Carry the originalUS$0.013081 reservation into the new durable ledger and enforce cumulative counts/costs before every HTTP attempt. Pin the old receipt hash and corrected prompt/schema/source hashes; a fresh run ID must not reset the allowance. With the same byte/output envelope, original plus corrected maximum reservations are aboutUS$0.359, leaving margin. Revised review input accounting must include schema JSON as well as the prompt; exceed the envelope ->stop, not an unapproved spend increase.

The corrected run again stops on the first provider/schema/diagnostic failure; no iterative paid repair is included. Existing loader/Paid confirmation can be reused under the approved pilot purpose; no new credential copy/setup is requested. Actual interpretation still needs author acceptance before deployment. The separate9,150-member publication-capacity and memory prerequisites remain unresolved.

## Decision needed

Approve the prompt/schema/criterion-provenance correction and one controlled rerun under the **sameUS$0.50 cumulative cap**, allowing **15 total review attempts**, while retaining **45 embedding texts /17 embedding POSTs**. This decision changes the original no-retry/14-attempt plan in a precise, bounded way; no further paid call will be made without it.

- 2026-11-17: author approved the exact correction and cumulative rerun scope; original receipt remains counted and immutable. Implementation started; no corrected paid request yet.

- 2026-11-17 offline verification: shared structured schema, source evidence, U6 guidance and prompt/schema metadata implemented as mr1-context-prompt-2 with unchanged scoring version. Node168 passed/five optional skips; Python140 run/two skips; actual demo-mr1 Check/Create/Join emulator test passed including stale unfinished-contract rejection and completed replay. Corrected approval pins original receipt and cumulative15/45/17/US$0.50 limits. All14 prompt+schema envelopes fit (maximum23,509 bytes). No corrected provider request made before this checkpoint.
