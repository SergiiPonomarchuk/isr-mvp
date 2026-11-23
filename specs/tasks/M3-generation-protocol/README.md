# C1 offline protocol result

2026-11-18. **C1 passed its bounded fake-store acceptance checks.** This supports a separately approved C2 emulator prototype, not Firestore, application-scoring, security, live-source or full-population acceptance. Author explicitly approved C1 together with merge #49; #49 merged as b8014acdce016bc7aaad51cd02ddc851220ebe6d. [Task and scope](../M3-generation-protocol.md), [architecture](../M3-generation-publication-design.md).

## What is implemented

Only new experimental modules under functions/experiments/publication, their Node tests, a bounded report supervisor and Python output/refusal tests. Nothing imports the application engine, Firebase/Firestore/model clients or a credential loader. The executable report installs a network fuse and asserts that no node_modules have been loaded. No emulator, source export, actual profile/vector, browser or runtime endpoint is used; no rules/docs/ change or deployment.

The fake synchronous optimistic store commits a copied write set atomically, checks read versions/create preconditions, retains deletion versions to catch absence ABA, and injects crashes before commit/after commit-with-lost-response. Snapshot JSON restoration models recovery; it is not a real storage engine or distributed process test. Async transaction callbacks are deliberately refused.

The protocol models bounded owner leases/epochs, deterministic immutable node uploads and checkpoints, exact typed payload reconstruction, a bounded manifest tree, trusted validation/seal and one activation CAS. Source/catalog/day/base/phase fences are opaque trusted model controls. Completed Create replay stays on the original generation after Join; Join retains frozen existing member fields and publishes one event/successor. Root mirrors must agree, published reads reject incomplete/corrupt data, and cleanup is limited to never-published aborted jobs after a simulated seven-day grace.

## Measured final run

Authoritative result: [run-20261118-02/report.json](run-20261118-02/report.json); worker detail alongside it. Parent supervisor pins source files before/after the child. Guards: 256 MiB heap, 512 MiB parent-observed RSS, 120 seconds, at least 1 GiB free before launch; no cap was raised. Peak parent-observed RSS **57.28 MiB**, supervised wall time **0.375 seconds**. CPU and end-of-run memory sample are in worker JSON. These are tiny-model costs, not application performance bounds.

Bytes here are UTF-8 JSON plus an explicit 128-byte allowance per modeled read/write and a 256-byte envelope. They are **not Firestore protobuf, index, request, billing or server limits**. Transaction inventory is exact for this fake implementation; its concrete operation objects are placeholders, not production document shapes.

| Members -> after Join | Initial manifest nodes | Typed payload bytes | Largest chunk model bound | Create reads/writes | Join reads/writes | Create / Join model bound bytes |
|---|---:|---:|---:|---:|---:|---:|
| 2 -> 3 | 18 | 2,237 | 3,471 | 7/10 | 11/10 | 5,113 / 6,728 |
| 7 -> 8 | 49 | 6,072 | 3,473 | 7/10 | 11/10 | 5,113 / 6,729 |
| 17 -> 18 | 112 | 13,774 | 3,478 | 7/10 | 11/10 | 5,125 / 6,750 |

Create reads job, intent, source, catalog, day, issue and title controls (seven). It writes three roots, fixture vector/message placeholders, title, intent receipt, catalog entry/revision and job (ten). Join additionally reads its lock, prior published job and root mirrors (eleven total), and marks the old job superseded; it writes ten modeled records. Inventory stays below the design's <=16 targets for the tested small sizes. Actual C2 reads/writes/bytes must be measured anew.

Runs force four-write chunks within an 8,192-byte model bound. Defaults require finite total nodes/bytes/commits/deadline and lease values; absent, excessive or exhausted limits refuse. C1 accepts at most 64 records/64 KiB typed payload, 512 nodes and bounded fanout/height, rather than pretending a tiny in-memory tree is a population-scale streaming publisher. Inputs are precomputed synthetic rows, including exact finite doubles, negative zero, dates, null/zero social evidence and raw receipt strings. No scores/cohorts/normalization/values were calculated.

## Failure and replay evidence

**25 focused Node tests pass**, covering:

- Exact typed field/string/number/date reconstruction and split payloads; directory and full frozen replay coverage; malformed, unknown, corrupt and missing pages/manifests/root tags refuse.
- Before/after-commit failures at begin, every actual chunk boundary, seal and activation; replay after ambiguous completion; JSON snapshot restoration with stable IDs/digests and no duplicate event.
- Lease takeover and concurrent takeover after a read; expired owner/deadline and finite work/byte/chunk refusal; changed operation binding and conflicting opaque title claim.
- Source/catalog/day changes before and during activation; distinct Join contention/rebase, phase winning against a pending Join, preserved conversation edits and no overwritten frozen membership/evidence.
- Cancellation versus activation, grace/refusal for cleanup, bounded deletion checkpoints and replay after lost cleanup response; active/superseded/replay history retained.
- Missing authority is not re-created on recovery, upload ordering is enforced so cleanup cannot miss nodes, and fake MVCC rejects conflicting/absence-ABA histories.

The aggregate worker independently executes three payload/Join traces and six refusal/cleanup traces. The focused test suite is more comprehensive than that aggregate sample. Two Python tests verify outside-directory rejection, low-memory refusal without a child and refusal to overwrite an existing output.

Required regression suites: **Node 268 passed / six optional skips (274 total); Python 147 run / two optional skips**. No application regression tests or historical evidence/approvals were changed. git diff --check and source/artifact hashes are checked before handoff; final PR-head Node/Python CI is also checked.

## Preserved initial run and remaining limitations

[Initial run 01](run-20261118-01/report.json) remains unchanged, with its executed code archived at **ee2ae92**. Review then tightened recovery: missing authority remains missing, unordered upload arrays refuse, empty/incomplete replay directories refuse, and async fake transactions refuse. The final run 02 and its source pins supersede the initial result; no old report was overwritten. Sidecar hashes are worktree-byte fingerprints, not substitutes for typed manifest validation across checkout line endings.

The closed fake writer is trusted. Fault injection is not an authentication or adversarial Admin-write proof. Manifest seal/immutable-write enforcement is assumed for activation; public reads revalidate hashes, but corruption outside the modeled writer protocol is not something a small transaction can prevent. Logical clock/day tokens do not prove real wall-clock boundary or server lease behavior. There is no catalog scan/real title normalization, live source-writer protocol, authorization, SDK transaction retry, trigger, query/index, page cache, UI, actual recovery backup or scoring parity implementation. No 9,150-member resource/operation acceptance is implied; Phase A's three timeouts and measured atomic-capacity no-go remain intact.

Next: review/merge the C1 PR, then separately approve a C2 isolated-emulator implementation spec/slice using tiny immutable allowlisted source and fake AI, real serializer/transaction checks and versioned reader/lifecycle adapters. C2 must retain the legacy path and default-off live format. No import of accepted large exports, paid embedding/review, rules deploy or production writes follow automatically. Sol Medium remains sufficient for the initial C2 slice.

Historical paid totals unchanged: 30 text reviews / 14 embedding texts / 14 POSTs / 44 HTTP attempts, US$1.256788 reserved. This task: zero provider calls, database RPCs and credential-loader invocations.
