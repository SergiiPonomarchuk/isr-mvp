# M3 offline candidate-review prototype - 2026-11-17

Status: **approved offline scope completed**. Author explicitly approved offline candidate-review prototype. Isolated implementation is functions/experiments/candidate-review.js; no application handler, current context helper, paid launcher or frontend imports it. Existing math, chain selection, scope rules, models, library, accepted issue replay and all historical receipts are unchanged.

## Implemented contract and evidence

The schema requires exactly the raw-chain candidate IDs as object keys. Each value is an explicit string verdict: a:aspect_id:exact-input-quote, x:substantive exclusion reason, or u:unresolved factual reason. The compact wire encoding avoids repeating a nested verdict schema 100 times. The adapter converts only supplied a:/x: decisions to the existing accepted/excluded representation and calls the unchanged context validator. It stores raw-review/schema hashes and the explicit verdict map as prototype provenance; this is not a publishable replacement for frozen application metadata.

For non-pass outcomes only, u: explicitly records unfinished review. It never becomes an exclusion or a score. A pass containing any u: is refused; non-pass acceptance or scoring aspects are refused. This preserves the existing ability to ask for clarification without inventing factual exclusions. Empty, missing, malformed, unknown and repeated IDs are rejected. Raw JSON is checked for duplicate object keys, including escaped duplicate spellings, before projection. No defaults or automatic missing-reason generation exist.

Synthetic complete fixtures cover both one- and two-reference projection parity with the unchanged arithmetic, literal evidence, scope mismatch and invalid linkage. These fixture reasons are labeled synthetic and are never written into real failed outputs. The captured two-of-100 response remains rejected. Actual installed SDK transport is tested through a fake fetch only, using a fake key and no credential loader. Tests verify exact 100-key schema and prompt body, without contacting Gemini.

## Static envelope results

| Raw candidates | Prompt + schema envelope bytes | Concise synthetic output bytes | Legal long-reason fixture bytes |
|---|---:|---:|---:|
| 1 | 11,266 | 588 | 588 |
| 3 | 11,688 | 674 | 1,608 |
| 10 | 13,098 | 972 | 5,175 |
| 100 | **31,480** | **4,838** | **51,071** |

The actual recorded 100-candidate input fits the existing 32,768-byte prompt/schema guard, leaving 1,288 bytes. prepare() refuses larger envelopes rather than truncating inputs or candidates. This is a result for the pinned input, not proof all future 100-candidate inputs fit.

The 100-candidate schema has 138 object nodes, 17 arrays, maximum structural depth 9, 123 required keys and two anyOf branches. These are descriptive static counts, not an estimate of Google's grammar states. Provider admission **has not been tested**; the previous state-complexity failure remains relevant.

Output figures are UTF-8 bytes, **not Gemini token counts**. A concise synthetic response fits an 8,192-byte proxy; a legal 500-character-reason fixture does not. Neither proves admission, completeness, semantic quality or real 8,192-token fit. There is no permission to shorten meaningful reasons or drop candidates to force fit. If actual one-response review is unreliable, any staged/chunked protocol needs a separately reviewed design and allowance; no fallback has been implemented.

Machine-readable audit: M3-evaluation/candidate-prototype-audit.json. Credential-free prepared request: M3-evaluation/candidate-prototype-request.json. This request contains real pinned synthetic issue data and full schema, not a new provider result. CLI functions/tools/candidate-review-audit.js reads local artifacts only and reproduces the audit without loading credentials.

## Verification and boundaries

Node **186 passed, five optional skips**; Python **140 run, two optional skips**. Final CI is checked on the pushed head. Zero provider calls, embedding texts, database RPCs or production changes for this task. The cumulative allowance remains exhausted at 21 reviews, 14 embedding texts / 14 POSTs, US$0.331466 conservatively reserved. No 22nd request is authorized. Sol Medium remains sufficient.

## Concrete next proposal - not authorized

Approve **one isolated 100-candidate provider-admission/coverage check**, raising cumulative review attempts to **22**, with the **same original total US$0.50** and unchanged 45-text / 17-POST ceilings. Use exactly the prepared clarified-lock input, saved ranking and prototype schema/source hashes; no new embedding text, geocoding, database write, application integration or deployment. Reuse the existing approved private loader; never copy credentials. Prepare and test a dedicated source-pinned guard before execution; do not weaken the legacy review schema guard.

Exactly one review/HTTP attempt, maxOutputTokens 8,192, existing model/seed/temperature, no SDK retries. The prepared input reserves US$0.020414 under the byte/output bound, bringing conservative reservations to about US$0.351880, below original US$0.50. Unknown usage remains reserved. Stop and preserve any schema rejection, truncation, incomplete verdict set or semantic failure; no iterative repair or automatic follow-up. A valid non-pass outcome remains possible and must not be coerced into pass. One accepted response would test only this prepared case, not demonstrate general protocol reliability, multi-reference quality or publication readiness.

- 2026-11-17: Author approved one prototype check at 22 total reviews and the SAME US.50. Dedicated isolated one-HTTP guard, immutable prepared request/source/receipt pins, no embedding path, no retries, raw output/finish reason and strict prototype validation are prepared and tested offline. Legacy guard and application integration remain unchanged.

- 2026-11-17 actual check: schema admitted, all 100 keys returned, finish STOP. Non-pass semantics failed (repeated choice and 18 false scope reasons); no scores. Cumulative 22 reviews / US$0.351880 reserved; no further paid call. See M3-prototype-check-report.md and offline review-stage proposal.
