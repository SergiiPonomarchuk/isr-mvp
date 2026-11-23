# Read-only grounding inventory (2026-11-23)

The author approved a read-only inventory, not an apply/migration. Tool starts at main3dedd1a after #53/#54; existing profiles have not been updated. No provider/embedding calls, vectorizer CLI, source-file changes, database writes, rules change or deployment.

## Final observed coverage

| Category | Profiles |
|---|---:|
| User documents scanned | 9,151 |
| No taxonomy payload | 8,911 |
| Nonempty taxonomy payloads | 240 |
| Recognized complete/explicit-null layout | 239 |
| Malformed stored layout | 1 |
| Already has verified correct OG | 0 |
| Calculable from stored domain metadata | 0 |
| Recoverable from verified retained artifacts | 224 |
| Unresolved, including the malformed layout | 16 |

The 240 target payloads are not evidence that every profile in the synthetic world has vectorized Values. Do not regenerate the other8,911 profiles as part of this metadata backfill.

## Retained sources and binding

Inspected only the explicitly named project files: db/vectorized_backup.json (13 UID-map entries) and db/values-vector.json (228 raw-vector list entries). Their checksums/entry counts are in Values-grounding-inventory-summary.json. Every accepted source matches current profile UID, narrative SHA-1 and exact persisted Values payload, with valid ten-domain grounding/confidence data. Narrative text/raw taxonomies/gl_cs are never written to reports or console. IDs outside the numeric synthetic convention are hashed.

Of the224 recoverable profiles,211 sources use1.0 and13 historical sources use2.1. The latter require explicit version-normalization journaling in a future metadata-only plan; no original artifact is relabeled. Sixty-eight verified profiles match only the exact direct-null-items legacy encoding. Null groups are preserved, never converted in the live profile. The known formatter encoding and direct-null encoding are compared exactly; no numeric Values are repaired or approximated.

The initial one-source scan found13 recoverable profiles and over-reported null groups as unsupported layout. Structural diagnostics found explicit-null groups and one malformed length; adding the retained raw-vector-list source plus a separately named exact null codec established the final224/16 result. Initial reports remain unchanged for audit. All9,151 observed update_time values were identical between the two scans, but pagination is not an atomic global snapshot; any later apply must re-read preconditions.

## Remaining16 cases

| Reason | Profiles |
|---|---:|
| Invalid/missing domain grounding metadata | 6 |
| Missing/invalid source narrative hash | 5 |
| Current narrative does not match source hash | 2 |
| Retained full-vector layout fails validation | 2 |
| Stored Values payload has malformed layout | 1 |

These are review cases, not an authorization to invent metadata, repair Values, rewrite hashes, regenerate vectors or call AI. Keep them outside any automatic apply until their source/format provenance is resolved or the author makes an explicit decision.

## Local evidence and validation

Sanitized per-profile results are stored privately under A:/BackUp/isr-mvp/rollouts/grounding-inventory-20261123: inventory.json (initial), layout-diagnostics.json, inventory-two-sources.json (final). Only aggregate evidence is committed here. Existing source files were rehashed after the scan and match the recorded input checksums.

Node253 passed/six optional skips; Python165 run/two optional skips. Eleven new inventory tests also pass with python -S. Cases cover exact field projection/pagination on a fake read-only client, source UID/hash/vector mismatch, duplicate/conflicting records, explicit-null encoding, list/map artifacts, malformed/oversized input, boolean/nonfinite metadata, target guards, redaction and atomic non-overwriting reports.

The live tool projected only uid, values_taxonomy and values_description from users, hashing narrative text in memory only. It has no --apply or write API. Two full read-only scans plus a72-profile structural read were performed; ordinary Firestore read usage is distinct from the zero AI-request count.

## Recommended next scope

Prepare a metadata-only dry-run utility for the224 verified profiles, leave the16 review cases untouched, and rehearse apply/rollback on a synthetic emulator copy. Bind source file/entry digests, UID/hash/current payload and update_time again; journal any source2.1 -> canonical1.0 metadata normalization. The utility must preserve all existing Values/null encodings and profile text, and be resumable/idempotent with changed-source/profile conflict reporting. This is a proposed next scope, not implemented or approved for live apply by this inventory.
