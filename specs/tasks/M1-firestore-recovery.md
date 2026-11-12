# M1 Firestore backup recovery rehearsal

Recover the document paths, field values and Firestore types represented by an R0 JSONL backup into an empty, disposable copy. The author approved this recovery step after PR #26. Read-only verification of the copy is part of the restore. The live database, preview and saved release snapshot are outside the write scope.

1. Check the final manifest, collection files, counts, document paths, unique paths and typed data before any write. A dry run is the default. Keep private values and paths out of logs and reports.
2. Use a dedicated loopback Firestore emulator and demo project with no functions, hosting or export. Refuse other destinations and refuse to overwrite an existing target. After an interruption restart the disposable emulator empty.
3. Preserve document IDs, missing parents, nested collections, primitive types, maps, arrays and the five R0 type tags. Bind relative document references to the copy. Compare all restored paths and typed fields with the validated input.
4. Exercise the types using synthetic examples and rehearse with the November 7 archive. Record aggregate results, known format limits and repeatable PowerShell commands. The author takes a fresh backup for the live migration.

## Status log

- 2026-11-12: Scope recorded from M1 and the R0 backup format. Rehearsal pending.
