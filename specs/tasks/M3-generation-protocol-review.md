# C1 PR50 review and reconciliation

Author approved2026-11-23: resume capacity work by reviewing/reconciling existing C1 PR50 against current main, verify offline tests, then prepare a concrete next emulator scope. Base reviewed C1 head8539390; main410d296. Work on existing codex/m3-generation-protocol feature worktree. Sol Medium is sufficient. No merge instruction, C2 implementation, emulator operation, database access/write, paid call, credential loader, large import, runtime/scoring/rules/docs/ edit or deployment is implied.

## Plan and scope

1. Read C1/design/results/code and reproduce any gaps using tiny synthetic input only. Preserve prior run01/run02 artifacts and their source pins.
2. Integrate current main without force-pushing; resolve status-document conflicts while retaining C1 evidence and main's CBC/Values/recovery histories. Record the author's request to defer16-case Values recovery; PR60 stays a separate draft and is not merged here.
3. Verify fake-store recovery/manifest/leases/replay/publication and resource/output guards. Existing fixtures contain precomputed scores and are not current CBC/X policy or application-score acceptance.
4. Any fixes must stay within the existing C1 acceptance rules and receive the required author conflict clarification first. Pending review found two synthetic reproducible gaps: readPublished accepts a mismatched discussion mirror, and invalid UTF8 typed payload bytes are accepted through replacement decoding. No fix is performed until the author answers.
5. Run required Node/Python suites and a newly named bounded offline report with original resource gates/network fuse. Update current evidence/HANDOFF/CHANGES/index and PR50 description/status, check final CI. Keep PR draft if findings remain unresolved; mark ready only if reviewed scope passes. Merge only on explicit merge PR50.
6. Prepare C2 scope/remaining policy questions as a proposal, not implementation. All Firestore/client/browser/source-writer and real-population acceptance remain later gates.

## Status

- 2026-11-23: current main and clean existing C1 worktree verified. Both findings reproduced without database/provider calls. Author clarification requested under AGENTS workflow rule5; independent main reconciliation continues.

- 2026-11-23: author explicitly approved both C1 fixes and regression tests. The pending clarification above is resolved. Four status/design-history conflicts are reconciled while retaining both histories; implementation fixes follow within the existing acceptance contract.

- 2026-11-23: four new focused regressions first failed against the reviewed implementation (25 old tests pass/4 new fail). Added current issue/discussion/public token-and-phase consistency checks for reads/Join activation/phase changes, plus strict UTF8 round-trip validation before JSON decoding. All29 focused tests now pass; valid Unicode and frozen original replay after Join remain covered. Both fixes are within the explicit author approval; shared scoring/runtime code unchanged.

- 2026-11-23: fixes f69976c verified. Node282 passed/six skips; Python222 tests/four skips;29 focused tests pass. New run20261123-03 completed at45.33MiB peak RSS/0.594s with original guards, exact2/7/17 payload/replay/successor results and unchanged7/10 Create,11/10 Join activation inventories. Prior runs/sidecar unchanged. See M3-generation-protocol/review-20261123.md; C2a scope prepared separately, not implemented. Final PR CI checked before ready/handoff.
