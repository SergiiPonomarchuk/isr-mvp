# Grounding metadata dry run and emulator recovery rehearsal

Author approved 2026-11-23: log the16 unresolved cases for post-DB-audit restoration and proceed with the rest. Start from main d205cc8 (merged #55, final CI passed) on codex/values-grounding-dry-run. Sol Medium is sufficient.

## Scope

Implement a reviewed metadata planner/apply/verify/rollback utility. Agent runs only live read-only plan/verify, never a production write. Apply/retry/rollback runs only on isolated synthetic emulator data. Prepare full author-only PowerShell commands/runbook; actual live --apply/rollback remains a later explicit author step, not authorized here. No provider calls, vectorization, credential/key loader, rules edits or deployment.

The committed scope freezes the original inventory file hash, both source artifact hashes,224 expected candidates and the16 hard-deferred IDs. Live planning rechecks only those224 profiles through the same three allowlisted fields, current UID/narrative hash, exact Values payload, original inventory update_time and retained source entry/file hashes. Refuse incomplete/conflicting plans; never expand to new profiles or bypass deferred IDs. Emulator fixtures may supply an alternate test scope only for explicit loopback/demo targets.

## Patch and plan contract

Write only users/{uid}.values_taxonomy.meta, containing exactly version, uid, hash, gl_cs and overall_grounding. The new minimal metadata is canonical1.0 and uses the existing pure mean/Firestore-map codec. Do not copy/invent timestamps, vector IDs or overall_confidence in this increment. They remain on the DB-audit restoration list. Current candidate metadata must be absent or explicit null; record which, so rollback restores that exact prior representation. Preserve all Values/null encodings, narratives, timestamps and unrelated fields. Historical2.1 sources remain unchanged; journal the normalized source version separately.

A private immutable plan stores only IDs, update-time/content/source preconditions, before-metadata existence/null state and the five-field proposed metadata; no raw narratives or Values. Bind it to the frozen scope/inventory and all source digests. Recheck artifacts before apply/resume and every profile before any write; per-document last-update-time CAS catches changes after preflight. Stop on conflict. Normal operation is idempotent and resumable through a local write-ahead journal bound to the plan/project. A resumed unknown commit response verifies the desired postcondition without repeating the write; record uncertain ownership and refuse automatic rollback of that ambiguous case. Never delete metadata written by an unproven operation.

Rollback only restores confirmed writes with exact current metadata/content/narrative and journaled post-update time. Restore absent versus null correctly through the metadata field only. Post-apply edits, unknown journal states, tampering, wrong projects/sources and partial journals fail closed. No automatic global rollback or full-document replacement. Verified already-applied/rolled-back actions make no additional writes.

## Verification and deliverables

Pure/fake tests cover policy/field allowlists, changed source/UID/hash/vector/date, deferred IDs, malformed/tampered plan/journal, preflight-before-write, last-update conflicts, idempotence, interrupted/reconciled writes, rollback refusal after later edits, null/absent restoration and redacted output. Required Node/Python suites pass. Rehearse actual apply/verify/retry/rollback and a lost-response case on a disposable demo emulator, with synthetic data only, and compare full synthetic before/after documents to prove preservation. Then generate a fresh224-profile live dry-run plan only, with sanitized aggregate evidence. Author reviews the concrete plan/runbook before any live apply.

## Status

- 2026-11-23: ordered dry-run/rehearsal scope approved;16 cases logged for post-audit restoration. Production writes and AI calls remain zero.

Precision detail: inventory outputs gain an additive precise RFC3339 update-time field for new scans, without changing old receipts. The planner accepts the frozen older receipt only when its recorded microseconds fully represent the current timestamp; otherwise it refuses the candidate. All actual CAS operations use the SDK snapshot timestamp directly, preserving nanoseconds.

- 2026-11-23: implementation8dbfa80 pushed. Required suites: Node253 passed, six skipped (259 total); Python180 tests, three optional skips. Opt-in SDK/CLI emulator rehearsal passed separately:224 planned/applied, retry zero writes; lost rollback response reconciled once,223 remaining confirmed restores; all241 full synthetic documents restored,16 deferred/control timestamps unchanged. Lost apply response made no duplicate write and automatic rollback was withheld for uncertain ownership. No provider calls or production writes.
- 2026-11-23: live read-only plan revalidated224 frozen candidates, zero conflicts; ready=true. Private plan A:/BackUp/isr-mvp/rollouts/grounding-inventory-20261123/grounding-plan.json; plan digest e5152acd24d074a44880a9b2e44bc5ca90a17a15472ec6b32f361f43d9b67e11. Only the three allowlisted fields read. No live apply authorized/performed. See Values-grounding-author-runbook.md for later author-only steps. Final PR checks are verified before handoff; merge requires explicit instruction.
