# R1 optional Values metadata recovery

Author approved2026-11-23: prepare224-profile optional-metadata recovery, live dry run, synthetic apply/retry/rollback rehearsal and full author-run commands. Base main322ab63 (merged #57, main checks passed); codex/values-optional-metadata. Sol Medium is sufficient. This approval is preparation/emulator only; no agent live write or author live apply is implied.

## Contract and boundary

Recover only values_taxonomy.meta.timestamp, vector_id and overall_confidence from exact verified retained raw entries for the frozen224 profiles. Each field must be absent, not null or conflicting. Preserve the existing five canonical grounding/provenance keys, all Values/null encodings and all other fields. Timestamp is the retained historical value, not a new generated timestamp; confidence is copied, not recomputed. Normalize no source fields. The16 hard-deferred IDs, message counters, Values expansion, X eligibility and regeneration remain excluded. No model/key loader/deploy/rules/docs/ changes.

The new committed scope binds the original grounding plan file/payload hashes, original scope, exact candidate IDs/count, source hashes and16 exclusions. Before planning validate the original source derivation and body/narrative hashes; re-read only224 users through uid/values_taxonomy/values_description. Every current metadata map must equal the five-key applied grounding plan. Validate all source triplets, reject absent/invalid/ambiguous values, and capture precise current update times. Only a complete conflict-free immutable plan is executable. No raw narrative/Values stored in reports; IDs, update times, metadata and digests remain private on A.

Apply/verify revalidate frozen scope, source file/entry hashes and deterministic metadata derivation. Patch exactly three dotted fields with last-update-time CAS; do not replace the full meta map. Before any write preflight all224 targets. Use the existing hash-chained write-ahead journal, lock, postconditions, idempotent retry, lost-response reconciliation and ownership-based rollback refusal. A small store adapter exposes the exact five-key before state as the prior engine's virtual null state, desired eight-key map unchanged, and all other states as conflict; the real store always writes/deletes only the three added fields. Validate the R1 plan before using that shared engine; do not pass it through the older five-key plan validator. Rollback preserves the five pre-existing keys, refuses later edits, and never deletes unproven writes. Both adapters and actual SDK dotted updates are tested.

CLI is explicit plan/verify/apply/rollback. Only acknowledged known live project or loopback demo targets; test scope overrides forbidden live. Agent runs live plan/verify only, all write modes only on isolated synthetic demo emulator. No source file copies, secret reads, personal fields, full profile reads or full collection scan. Original shared recovery code/CLI remain unchanged.

## Validation and deliverables

Pure/fake tests for immutable scope/source/plan, strict scalar types, preserved base keys, already-present/null/conflicting optional fields, timestamps and changed Values/narrative, whole-set preflight/CAS, three-field patch allowlist, retries, rollback, uncertain ownership and partial/wrong journal. Rehearse actual CLI apply/verify/retry/rollback over224 synthetic profiles plus16 excluded/control cases; compare all full documents and deferred timestamps, including lost responses and unrelated edits. Run required Node/Python suites, save redacted live dry-run evidence, prepare full PowerShell5.1 author-only apply/verify/recovery runbook, update HANDOFF/index/CHANGES and open PR. Merge only on explicit instruction.

## Status

- 2026-11-23: approved scope written before implementation. Prior224 grounding patch is already applied/verified; audit found all three optional fields available from retained verified sources. No R1 production writes or AI calls authorized/performed.
