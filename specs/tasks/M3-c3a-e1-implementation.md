# C3a-E1 implementation checkpoint

Author approved merge PR65, then PR66, and E1 section5 on2026-11-24. Merged main eb50bae; both merge trees/main CI verified. Implementation branch codex/c3a-e1-batching.

## Concrete execution plan

1. Freeze an E1 manifest selecting the approved12 unchanged fixture definitions and four7-person interruption schedules before any worker admission. All new admitted output shares one1GiB quota; the four interruption directories additionally share64MiB.
2. Keep legacy Budget/Store behavior for pinned v1 callers. E1 is explicit c3a-io-2, private c3a-budget-2, strict version rejection. Add one shared64-record/1MiB pending controller, bounded direct-record path, contiguous data/index coalescing, private binary pending payload plus checksummed metadata. Preserve all logical artifact hashes/indices and exact arithmetic.
3. Reserve counters/metadata/growth before writes. Write private afterimages before applying data/index; make replay idempotent. Flush before checkpoints/seals/publication; never refund crash reservations. Keep source/oracle/candidate/independent work under one original deadline and monotonic parent guard.
4. Fixed aggregate phase/store syscall instrumentation; meaningful small unit parity/byte/work/corruption tests and static legacy per-record call comparison. No additional large benchmark. Run four specified actual-process regression cases first, retain failures, then the12-case matrix once only if prerequisites/recovery pass. Zero source/DB/provider/loader operations.
5. Required suites, aggregate evidence and NO-GO limitations, Status/HANDOFF/CHANGES, pushed PR and final CI. No C3b import/production work.

## Status

- Design recorded before runtime edits; Sol Medium sufficient. All original C3a evidence/fixtures/production modules remain frozen.
