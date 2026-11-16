# M3 technical continuation result — 2026-11-17

The author approved bounded technical continuation under 20 cumulative reviews, 45 embedding texts / 17 POSTs and the same total US$0.50. Two additional review attempts ran; neither produced an accepted case. The pilot remains incomplete and is not ready to deploy.

## Actual results

1. The first continuation request returned HTTP 400. Safe diagnostics now preserve the provider explanation: the schema creates too many constraint states. This establishes the current failure reason; it does not retrospectively prove why the earlier corrected request failed.
2. Removed provider-only array-length and numeric bounds, retaining enum constraints and all strict server validation. Required offline suites passed before the next request. The simplified schema was admitted and returned model output.
3. The response chose reference 1, building scope, home anchor and unconstrained demographic defaults. Its accepted evidence quoted the input. However, aspect.text copied the reference title **House entrance lock broken (shared front door)** rather than a substring of the submitted issue. Strict server validation rejected it. This is a grounding failure, not another schema-admission problem. No further request or paid prompt tuning occurred.

Four cumulative review/HTTP attempts, zero embedding texts/POSTs, US$0.055576 conservatively reserved. Reported usage across responses that supplied metadata: 1,357 input / 538 output tokens (1,895 total), estimated US$0.001147 at recorded rates. HTTP 400 usage/charges remain unknown and their reservations remain counted. There were no Firestore RPCs, geocoding calls, profile re-embedding or production writes.

Both original receipts remain unchanged. The cumulative controller imports each receipt's own attempts once, not its already-inherited totals, and verifies receipt/source hashes before transport. Automatic SDK retries remain disabled. New receipts are in M3-evaluation/pilot-20261117-continuation and M3-evaluation/pilot-20261117-technical-repair; the exact offline comparison is in M3-evaluation/continuation-offline-diagnosis.json.

## Proposed next decision

Approve one focused **grounding prompt correction and controlled pilot resumption**, retaining the same 20 cumulative reviews / 45 texts / 17 POSTs / original total US$0.50. This is semantic prompt work, explicitly outside the approved technical-only repairs. No extra budget or model change is proposed.

The correction should give aspect.text its own schema description requiring an exact contiguous quote from INPUT_JSON, explicitly prohibit copying REFERENCE_JSON titles into aspects, and show one synthetic input-to-quote example. Keep the existing validator, criterion evidence, source matching, scope interpretation, scoring and historical replay unchanged. Version and pin the corrected prompt/schema. Verify captured-response rejection and intended quoted fixtures offline before another request. Resume the same pinned cases, counting all four existing attempts; stop again on semantic/policy failure. Do not silently replace the returned text or relax quote validation.

The separate full-population memory and publication-capacity gates remain unresolved. Sol Medium and the existing application models remain sufficient for this focused correction.

Final verification: Node 172 passed, five optional skips; Python 140 run, two optional skips. Captured-response regression verifies copied-reference rejection, genuine input acceptance and retained server age limits. CI is checked on the pushed final head.
