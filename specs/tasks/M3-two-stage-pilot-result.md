# Two-case staged pilot result, 2026-11-17

Author explicitly approved up to US$0.55 additional and the existing private credential loader. The exact preflight and source pins matched; the loader was invoked privately and the key was passed only in child-process memory/environment. No secret file was inspected/copied and no credential was written to artifacts or arguments.

## Actual result

Four generateContent HTTP attempts, one per stage, gemini-3.1-flash-lite with LOW; all finish reasons STOP. No retries/repair/new cases, embeddings, geocoding, Firestore calls, publication, deployment or production changes. The run stopped_no_retry on the fourth response's source validation; no second result was manufactured. Immutable requests/raw outputs/usage remain in M3-evaluation/pilot-20261117-two-stage-runtime; approval is two-stage-runtime-approval.json.

- D1-01-live: both real-model stages validated. Building scope, home anchor, quoted residents/place, no questions; one raw/compatible candidate, accepted reference 1 with a literal submitted-title aspect and default demographics. A reasonable narrow repair interpretation on review; this alone is not general model acceptance. No member scores were calculated.
- compound-lock-software-clarified: real stage one correctly narrowed to repair-only clarification, building/home, no repeated answered question. Untouched chain 100; deterministic partition 81 rule exclusions + 19 compatible domain IDs. All 19 IDs were explicit; reference 1 accepted, 18 excluded with typed different_context. Those exclusions are model judgments rather than certified scope facts; the reference titles concern other building decisions, but this does not establish a general retention gold set.
- Fourth response aspect.text was **House entrance lock broken (shared front door)**, exactly reference 1's title, absent from the submitted/effective source. The accepted evidence correctly quoted repair the entrance lock at osbb 2, h12, but that does not validate a different aspect text. Offline replay refuses with **Aspect outside effective facts**. The original response is preserved and not corrected or promoted. No false scope assertions or repeated clarification were emitted; overall two-case semantic acceptance is withheld.

Reported-token charge estimate (not a billing receipt): 4,735 microdollars = US$0.004735, including thinking and per-call rounding. Conservative new reservation: US$0.516096 under additional US$0.55. Historical reservation remains US$0.482644; combined reserved US$0.998740. Counts now 28 text reviews / 14 embedding texts / 14 embedding POSTs / 42 HTTP attempts. No automatic reuse of unspent cap; all four approved attempts have been consumed.

The runner labels the active record failed_or_ambiguous in its catch path; here the preserved STOP/raw output/usage and offline replay establish a definite validation refusal, not an unknown network outcome. Do not reinterpret it as a successful reviewed result or retry it. Earlier artifacts/pins remain untouched.

## Proposed next step: offline quotation-contract correction

The current domain prompt supplies EFFECTIVE_JSON, while the inherited aspect schema description still names INPUT_JSON. It also lacks the legacy prompt's explicit warning against copying reference titles. This is an instruction inconsistency and a plausible contributor, not proof of causation.

Recommend a small separately approved offline change: align schema descriptions and prompt quotation instructions with EFFECTIVE_JSON; explicitly distinguish source quotes from reference titles; retain the exact source validator and all multi-aspect/reference arithmetic. Add a regression preserving this actual failure. Do not substitute the reference title, relax validation, force one aspect/reference, change model/library or repair the stored response. No paid retry is part of this proposal. A further real check would need its own precise approval after the offline correction is reviewed.
