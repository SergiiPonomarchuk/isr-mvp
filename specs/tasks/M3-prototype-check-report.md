# M3 actual prototype check - 2026-11-17

Author approved **one prototype check: 22 total reviews, same US$0.50**. A dedicated tested guard sent exactly the prepared 100-ID clarified-lock request through the existing private loader. No automatic retry, new embedding, database RPC, integration, production change, deployment, geocoding or profile re-embedding occurred. The legacy pilot guard remains unchanged.

## Provider admission and structure succeeded

Gemini admitted the schema and returned **all 100 required keys**: 98 explicit exclusions and two explicit deferred reviews. The response finished with STOP, using 6,992 reported input / 2,180 output tokens (9,172 total), below the 8,192-output-token ceiling. The prototype adapter validated the structure and non-pass rules. No candidate key was missing or synthesized locally. This verifies admission/completeness for this request only, not general reliability.

## Semantic review failed

The actual outcome is needs_clarification. It acknowledges that the clarification excludes software, then again asks whether to proceed only with the lock, despite that exact choice already being supplied. It defers references 1 and 90 for this repeated question.

It also gives **18 false scope-mismatch reasons** for references whose scopes are building or unit. Against the author-confirmed building-lock decision, these scopes are equal or covered by the unchanged building/unit equivalence. A different topic may still justify excluding those references, but the scope reasons actually supplied are false. This is not a claim that all 18 references should be retained.

Because the outcome is non-pass, no accepted set/scoring model/public is produced. The status validated_pending_semantic_review records successful protocol validation only; it is NOT semantic acceptance. Raw response, finish reason, usage, exact request and immutable guard ledger are under M3-evaluation/pilot-20261117-prototype-check. The aggregate diagnosis is M3-evaluation/prototype-check-quality-review.json. No real response was repaired, relabeled or used as a synthetic acceptance fixture.

## Usage and checks

Cumulative **22 reviews / 14 embedding texts / 14 POSTs / 36 HTTP attempts**, conservative reservation **US$0.351880** against original US$0.50. Known reported metadata totals 59,557 input / 10,446 output tokens, 70,003 total, estimated US$0.030565. This request's token estimate is US$0.005018; its US$0.020414 conservative reservation remains counted. Unknown historical usage remains reserved; these are not invoice totals.

The 22-review allowance is exhausted. No 23rd request is authorized despite money headroom. All approval source/request/parent pins still match. Node 190 passed/five optional skips and Python 140 run/two skips before execution; final captured semantic-quality regression and CI are checked before handoff. No runtime or deployment acceptance.

## Recommended next step

Stop paid prompt-only trials. Review M3-review-stages-proposal.md for an offline design separating decision clarification from reference-domain judgments, and deriving true scope incompatibilities from the existing rule with explicit source provenance. Keep all 100 raw IDs and original ranking/weights; never patch a failed output or cap the chain. No new model, scope rule, similarity threshold or paid allowance is proposed. Sol Medium remains sufficient for offline design. Full-population memory/publication-capacity blockers remain separate.

Final captured-result verification: Node 191 passed/five optional skips; Python 140 run/two optional skips. CI checked on the pushed final head. The added regression confirms structural validity does not certify meaningful clarification or exclusion reasons.
