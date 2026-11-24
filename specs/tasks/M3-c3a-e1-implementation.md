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

- Resource subdivision: the approved64MiB small-test allowance is conservatively split into40MiB cumulative unit-file reservations and24MiB for the four actual interruption directories. The later1GiB run ledger reserves the entire40MiB unit pool before admitting any worker. The unit ledger is persistent, never reset across test invocations. Its initial16MiB charge covers the finite first development unit outputs (3188956 physical bytes) and the bounded seven-person legacy reference comparisons; subsequent E1 unit growth is pre-reserved. No extra capacity cases are introduced.

- Before admission:23 focused Node cases (19 original plus4 E1) and12 supervisor cases pass. Exact artifact roots/digests match the v1 seven-person producer; E1 pending writes, corruption, private replay and pre-seal resume verified. Legacy production/fixture/C1/C2 blobs unchanged. About to run the committed four process-interruption cases, then12 matrix cases once under fixed pins and caps.

- Actual source29fbdd8 admission stopped after one passed actual-process recovery and a temporary-rename parent-monitor error during the next source. Owned child stopped; two recovery checks/all12 capacity cases unrun. Preserved report/pins, fixed monitor with tests, and prepared [bounded continuation](M3-c3a-e1-continuation.md). No automatic experiment restart or cap reset. E1 acceptance remains incomplete; C3b NO-GO.
- Final local validation: Node339 pass/seven skips; Python243 tests/four skips. Sixteen supervisor cases verify quotas/deadlines/monitor behavior and proposed carried/exclusive continuation; exact v1 artifact/row and private batch tests pass. [Evidence](M3-c3a-e1-evidence/README.md). Final pushed-head CI checked before handoff. Continuation requires the author's new case-deadline/admission approval under E1 section5.
