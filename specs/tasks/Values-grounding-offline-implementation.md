# Values overall_grounding: offline implementation plan

Prepared 2026-11-23 after the merged X/Values specification and CBC emulator check. This is the concrete next increment under the author's go on the ordered emulator-then-grounding plan; it is implemented separately from the CBC verification PR. Authoritative decisions remain in X-eligibility-values-reconciliation.md. No unresolved X eligibility decision is needed for this increment.

## Approved offline scope

1. Add a pure metadata helper (for example vectorizer/metadata.py) that validates exactly ten complete grounding/confidence pairs, rejects booleans/non-finite/missing/out-of-range values, and computes overall_grounding=sum(g_d)/10 using all ten domains, including null-valued domains. No weights, inferred grounding or added rounding. Preserve the existing per-domain contract; do not derive grounding from domain values or confidence.
2. In vectorizer/pipeline.py, compute/overwrite meta.overall_grounding after valid domain metadata in both stages. Stage two uses the validated stage-one gl_cs already propagated by the host. Both finalized results carry version "1.0"; remove the hard-coded "2.1" label for future output. Preserve the current overall_confidence semantics and all value/item/null-propagation behavior. Do not modify historical outputs.
3. In vectorizer/prompts.py, state that overall_grounding is host-calculated, never estimated by the model. Align the future stage-two version label with 1.0. Keep the two-stage model workflow, models, API retry/budget behavior and prompts' substantive value evaluation unchanged; no new provider call.
4. In vectorizer/run.py format_for_firestore, preserve canonical metadata as an additive values_taxonomy.meta object instead of dropping it. Raw pipeline gl_cs remains ten pairs; encode Firestore meta.gl_cs as d1..d10 -> {grounding,confidence}, with an explicit decoder for later recovery. Preserve existing flattened domains/items/conflict_resolution/contextual_shifts exactly. Do not add a nested array to Firestore or change Public Values weighting.
5. Pure/fixture tests: zero/max/mixed inputs (mean23.3), null-valued domains, forged model OG overwritten, both stage versions 1.0, unchanged confidence semantics; malformed/missing metadata; raw/map round trip; identical flattened taxonomy payload; aggregation ignores additive metadata. Mock both provider responses and prohibit any real request in tests. Run Node/Python required suites; no live inventory or vectorizer CLI run.

## Acceptance and exclusions

New finalized synthetic vectors and Firestore-format output have deterministic canonical OG/version and retain valid per-domain metadata. Consumers remain compatible with additive meta; no application score changes. Produce a separate review PR; merge requires an explicit author instruction.

Existing-profile coverage remains a separate follow-up: field-allowlisted inventory and provenance-validated recovery of original gl_cs, resumable dry-run utility, emulator rehearsal and author-only live apply. Old flattened scores alone cannot reconstruct grounding. Do not run vectorizer/run.py on real profiles, regenerate narratives/vectors, relabel unknown historical schemas, read private profile artifacts or write a database in this offline increment. Historical version2.1 artifacts remain immutable.

Development model: Sol Medium is sufficient. Runtime cost of this implementation and its mocked tests: zero AI requests/tokens. The author controls any later paid generation or production apply.

## Status

- 2026-11-23: ordered emulator-then-grounding plan accepted by author go. Concrete offline scope prepared after source review; implementation follows on a separate feature branch. No metadata backfill, live inventory or provider operation authorized.

## Implementation details

Implementation is on codex/values-grounding-offline, stacked on CBC verification #53. This spec authorizes a dated implementation-status correction in docs/ISR_Values_Vectorization_Protocol_v1.md as well as HANDOFF/CHANGES/index updates; retain all policy decisions and historical artifacts.

Pure helper: vectorizer/values_metadata.py. Canonical metadata allows the documented vector_id/timestamp/uid/version/overall_confidence/hash fields, validated gl_cs, and recalculated overall_grounding. Unknown model-added metadata fields are not promoted into Firestore. No existing canonical field is dropped. Version2.1 is refused by the canonical adapter; its normalization belongs to the separately reviewed migration. Raw/map conversion validates exact domain slots and grounding/confidence keys. Provider/database imports are lazy so pure helpers and the mocked pipeline can be tested without installing or initializing their SDKs.

## Verification (2026-11-23)

Implemented pure mean/strict validation and raw/map codecs; stage-one and stage-two metadata finalization/version1.0; prompt instructions; additive formatter metadata. Seven synthetic Python cases exercise boundaries, fractional/unweighted/null-domain means, invalid shapes/numbers/versions, fake-summary overwrite, stage-one metadata propagation, unchanged flattened fields and adapter round trip. A Node public-Values test confirms metadata does not alter relevance-weighted aggregation.

Full suites: Node253 passed/six optional skips (259 total); Python154 run/two optional skips. All seven new Python cases also passed with python -S (no site packages). The installed Firestore Python serializer locally accepted a complete synthetic formatter payload, including the mapped gl_cs, without constructing a client or making RPCs. Two pipeline responses were mocked; zero real provider/embedding requests/tokens, database operations, profile-artifact reads, backfill or CLI execution.

No runtime model, value dimensions/scoring, confidence rounding, education/X policy, credentials, rules or deployment changed. Historical version2.1 artifacts are untouched. Existing-profile coverage requires the separately reviewed provenance inventory/recovery/backfill phase; this implementation does not claim that coverage.

Review PR: [#54](https://github.com/SergiiPonomarchuk/isr-mvp/pull/54), based on CBC verification #53. Required local suites passed; final pushed-head Node/Python CI is checked before handoff. Merge #53 then retarget/recheck #54 to main only when explicitly instructed.
