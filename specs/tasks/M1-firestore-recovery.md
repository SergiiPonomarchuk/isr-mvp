# M1 Firestore backup recovery rehearsal

Recover the document paths, field values and Firestore types represented by an R0 JSONL backup into an empty, disposable copy. The author approved this recovery step after PR #26. Read-only verification of the copy is part of the restore. The live database, preview and saved release snapshot are outside the write scope.

1. Check the final manifest, collection files, counts, document paths, unique paths and typed data before any write. A dry run is the default. Keep private values and paths out of logs and reports.
2. Use a dedicated loopback Firestore emulator and demo project with no functions, hosting or export. Refuse other destinations and refuse to overwrite an existing target. After an interruption restart the disposable emulator empty.
3. Preserve document IDs, missing parents, nested collections, primitive types, maps, arrays and the five R0 type tags. Bind relative document references to the copy. Compare all restored paths and typed fields with the validated input.
4. Exercise the types using synthetic examples and rehearse with the November 7 archive. Record aggregate results, known format limits and repeatable PowerShell commands. The author takes a fresh backup for the live migration.

## What the rehearsal verifies

The default command validates the R0 manifest, all records, unique paths, type tags and counts offline. Apply targets only `demo-isr-recovery` on `127.0.0.1:8185`. It refuses an occupied target, creates documents in batches with an existence precondition and reads every batch back. Comparison includes field names, values and Firestore types (including integer versus double), with map keys sorted and timestamps normalized to UTC. The input is checked again against the first pass while writing. An interrupted copy can be discarded and recreated from the original archive.

The R0 format stores references as relative paths and timestamps at the precision written by the exporter. The tag key `__type` is reserved in nested maps. The original format cannot distinguish a literal map shaped exactly like a known tag from the tagged value. The archive records document data, not indexes, rules, external services or Firestore create/update metadata. A completed comparison establishes equality to the archive, not a point-in-time snapshot of the live database. Run the procedure in [the live runbook](../LIVE-ROLLOUT.md#2-backup-and-recovery-prerequisite-author).

## Fresh archive signed-zero regression

The November 12 pre-migration backup must round-trip Firestore doubles of both signs, including negative zero in a nested map or array. Use the binary Firestore write protocol on the dedicated emulator, retain create-only preconditions, and keep the independent read-back and typed digest. Prove the sign with the SDK, then repeat the full fresh archive rehearsal.

## Status log

- 2026-11-14 D1 rollout preparation: reconciled PR #28 onto merged D1 main `9b9ce79`; only CHANGES/HANDOFF conflicted. Binary signed-zero restore implementation and independent fixture are unchanged. Combined Node/Python suites, isolated synthetic SDK recovery and CI checked before separate `merge PR 28` authorization. Fresh private archive remains an author action; no production writes/provider calls.

- 2026-11-12 rollout window: the fresh read-only backup at `A:\ISR\mvp\dbbackup\20261112-203337` contained **24,884 documents in ten manifest entries**, including 1,695 nested messages. The first rehearsal detected a signed-zero mismatch in a microcommunity. An independent synthetic probe reproduced the sign change with JSON writes and confirmed that binary writes preserve it. After the fix, **all 24,884 paths and typed document bodies matched**, and the disposable emulator released its ports. All six SDK/recovery fixture tests passed. The normal suites passed (98 Node tests, 111 Python tests with two optional skips).

- 2026-11-12: Full rehearsal with the private `2026-11-07-pre-migration` archive from `A:\ISR\mvp\dbbackup`. Validated, created and read back **24,783 of 24,783 documents in nine manifest entries**, including 1,694 nested messages, 9,150 vector documents and 9,151 user documents. All paths and typed field digests matched. This is the historical archive. The author repeats the procedure on the fresh pre-migration backup.
- Independent SDK fixture passed on a fresh instance. R0's actual encoder produced the test archive. The SDK read back timestamps, geopoints, bytes, document references, a typed vector, nested maps/arrays, dotted field names, nulls, nonfinite doubles and distinct integer/double values. A missing parent stayed absent. A second apply to the populated target was refused.
- Node 98 passed. Python 111 run, 109 passed with two optional checks skipped in the normal suite. All six focused recovery tests, including the optional SDK fixture, passed in the dedicated emulator run.
- Windows cleanup check: Firebase reported shutdown but the Oracle launcher left the recovery JVM listening. The rehearsal JVM was identified by project, port and JAR and stopped. The documented JDK path avoids the launcher. Verified all four dedicated ports closed after the fixture and the regular preview still returned HTTP 200. No live writes, deploys or paid model calls.
