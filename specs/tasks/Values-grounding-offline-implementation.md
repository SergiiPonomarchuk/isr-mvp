# Values overall_grounding: offline implementation plan

Prepared 2026-11-23 after the merged X/Values specification and CBC emulator check. This is the concrete next increment under the author's go on the ordered emulator-then-grounding plan; it is implemented separately from the CBC verification PR. Authoritative decisions remain in X-eligibility-values-reconciliation.md. No unresolved X eligibility decision is needed for this increment.

## Proposed scope

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
