# M3 two-case actual check - 2026-11-17

Author approved **21 total reviews, same US$0.50**. The tested focused guard ran exactly D1-09 and compound-lock-software-clarified once each under prompt v5. All earlier receipts/reservations stayed counted. No other cases, retries, library changes, production writes, database RPCs, geocoding, profile re-embedding or deployment occurred.

## Actual findings

- **D1-09 personal help:** returned not_consistent, explaining that physical moving assistance does not match the available family-emergency support reference. The earlier public-policy-only exclusion is absent. This supports the narrow prompt correction, not a claim the remaining reference-match judgment is correct or that personal help now passes. No output was coerced to pass.
- **Clarified mixed issue:** returned pass with building scope and lock-only input quote, explicitly understanding the author's choice and asking no repeated question. But it accepted reference 1 and excluded only reference 90. The exact clarification selection embedding produces a 100-candidate adjacency chain under the unchanged .30 floor / .05 adjacent-gap rule. **98 candidates have neither acceptance nor exclusion.** Strict validation rejects the response. No lock aspect embedding, public or draft was written. The reference-coverage invariant worked; the model response failed it.

Offline diagnosis lists every missing ID in M3-evaluation/two-case-offline-diagnosis.json. Missing decisions are not generated retroactively and the raw response remains unchanged. Both requests completed their HTTP attempts. The second saved response is complete JSON and reports 334 output tokens; there is no evidence that the 8,192-token output ceiling was reached. A short response does not establish why the model omitted the rest.

## Cumulative closeout

**21 reviews / 14 embedding texts / 14 POSTs / 35 HTTP attempts**. Conservative reservation **US$0.331466** against original US$0.50. Reported metadata across known responses: 52,565 input / 8,266 output tokens, 60,831 total; estimated US$0.025547. Unknown usage remains reserved; this is not a billing statement. This check added two reviews and one selection embedding (US$0.034549 reserved), with no pass-aspect embedding.

The approved review allowance is exhausted. No 22nd review is authorized, even though the money ceiling has headroom. Models/scoring/thresholds remain unchanged. Historical mixed-version fourteen-case outcomes remain separate evidence; the current two-case check is not a full v5 acceptance. There is still no accepted actual multi-reference/public-population run.

## Recommendation and next decision

Pause paid evaluation. Review the offline candidate-coverage design proposal in M3-candidate-review-proposal.md before authorizing implementation or another actual trial. The confirmed interpretation rules are now reflected in the two raw responses, but complete candidate review remains unsolved. Do not cap the chain, invent missing reasons, silently drop candidates, force scope, change thresholds or approve deployment to work around this failure.

Node 180 passed/five optional skips and Python 140 run/two skips before execution. Final captured-coverage regression and CI are checked before handoff. Sol Medium remains sufficient for offline protocol work; no application-model upgrade is proposed from this one coverage failure. Full-population memory/publication-capacity blockers remain separate.

Final verification: Node 181 passed/five optional skips; Python 140 run/two optional skips. Actual missing-coverage regression preserves the 98-ID failure. Final CI is checked on the pushed head.
