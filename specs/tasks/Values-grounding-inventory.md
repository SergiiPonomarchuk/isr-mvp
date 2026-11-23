# Read-only existing-profile grounding inventory

Author approved on 2026-11-23: build a read-only inventory, identify profiles with usable stored domain grounding or a verifiable retained source, and report missing/ambiguous data. This is not a migration, patch generator or approval to regenerate values. Branch codex/values-grounding-inventory starts at merged main3dedd1a (#53 then #54; main CI passed).

## Authorized scope

Add a dependency-light classifier and read-only CLI, with synthetic tests, required suites and a review PR. The live read is authorized by the author's go on the stated read-only inventory plan. Only users is queried, projecting uid, values_taxonomy and values_description. The narrative is used only in memory to verify its SHA-1 against retained source metadata; never print/save it or names/contact/credential fields. No other collections or complete profile documents are fetched. IDs outside the numeric synthetic convention are hashed before reporting. No Gemini key/credential loader, provider call, writes, import/export, vectorizer CLI, rules or deploy.

Use explicit --project plus --i-know-this-is-live for production reads; the only live target is project-a3d59130-5adf-4677-9e2. An emulator must be explicit loopback/demo target and cannot coexist with the live flag. Use paginated reads, count every scanned/vectorized/unvectorized profile, and capture per-record update_time; the inventory is not an atomic full-database snapshot. Future apply must independently recheck all preconditions.

## Classification and retained sources

Classify already-correct, calculable-from-stored-grounding, recoverable-from-artifact, unresolved, and not-vectorized. Confirm complete finite ten-domain grounding/confidence metadata; OG uses the merged plain mean helper. Stored grounding must bind to the profile UID/narrative hash. Every external source must match UID, narrative hash and the exact flattened Values payload, with a recognized full pipeline layout (1.0 or historical2.1). Version2.1 is only a reported recovery candidate requiring later reviewed normalization, never relabeled on disk or in the database.

Explicit artifact files only: first the known C:/isr-mvp/db/vectorized_backup.json, a UID-to-raw-pipeline-vector map written by the old vectorizer. Do not assume it covers everyone, recursively search personal folders, copy backups or infer grounding from scores. Parse only a bounded-sized explicitly named file in memory, reject duplicate JSON keys/invalid layouts, and retain only source digests/IDs/reasons in the report. Conflicting valid sources, changed narratives, malformed metadata and unmatched vectors stay unresolved. Missing source is not success.

Write a local sanitized JSON report atomically; include only identifiers, state/reason codes, update times and necessary source/payload digests, not raw taxonomies/gl_cs/narratives. Commit only aggregate evidence, not per-profile live results. No --apply or patch-writing API exists. A later metadata-only dry-run/recovery utility and emulator rehearsal need their own concrete plan.

## Tests and acceptance

Synthetic cases cover mean correctness, stored/raw-map encodings, unknown/recognized versions, UID/hash/vector mismatch, absent narratives, duplicate/conflicting artifacts, missing/invalid/oversized files, invalid numbers/booleans, and missing taxonomy. Prove projection/pagination and the absence of DB write methods using a fake read-only client; assert sensitive sentinel fields/text never enter serialized reports. Required Node/Python suites pass before the bounded live read. On success, report exact observed coverage and gaps without claiming a backfill occurred.

## Status

- 2026-11-23: read-only inventory plan approved; implementation started. Production writes/AI requests budget: zero. No real-profile/artifact content has been loaded by the new tool yet.

- Local verification before live read: Node253 passed/six optional skips; Python163 run/two optional skips. Nine new inventory cases also pass with python -S, exercising redaction, provenance/conflicts, exact field projection/pagination, target guard and atomic non-overwriting report output. No real artifact/profile loaded during these tests.

## Additional retained source and exact legacy encoding

Structural inspection found the other explicitly named project source C:/isr-mvp/db/values-vector.json (228 raw pipeline vectors in a list). This task authorizes that bounded source read as part of the approved provenance inventory; no personal directories or narrative datasets are searched. The loader supports a UID map or a list whose entries carry meta.uid, retaining duplicate UIDs for conflict detection.

Explicit null item groups are a known raw protocol representation. The inventory accepts this persisted layout only as a separate exact-match codec (direct-null-items-1), alongside formatter-1; it never pads or changes current profile fields. Every external candidate still needs UID/hash/full-layout and exact flattened-content verification. Truly malformed lengths remain unresolved. Reports distinguish nonempty taxonomy payload count from recognized-layout vector count. Initial one-source report and structural diagnostics are retained unchanged; a new report records the two-source scan.
