# C3a offline prototype evidence, 2026-11-24

**C3b readiness: NO-GO.** All24 fixed cases executed:13 passed,11 refused/unproven. The largest complete numerical case was301 source profiles /302 members after Join. The300 case timed out; both outcomes are retained. These single observations do not establish a monotonic capacity boundary. Ordinary/dense1000 cases timed out during the candidate. All9150 scoring cases exhausted the shared allowance in the oracle after source preparation, before candidate execution. This does not measure an isolated oracle with a fresh120s allowance. All four9150 structural19/100-reference cases timed out before sealing.

The successful numerical cases match the unchanged Node oracle exactly for full ordered Create/Join outputs, frozen social evidence, normalization, actual231-component taxonomy Values and tally/task summaries; independent Python recomputation passes. Fault cases test actual child-process restart after checkpoint/seal and expected corrupt/missing-node refusal.13 passes include these fault checks, not13 distinct population sizes. The existing marked-X/top300 policy is not implemented or accepted here.

## Reproducibility and retained evidence

- [Fixed matrix](matrix.json), committed before admission; [raw run03](run-20261124-03/report.json), source-pinned executed commit02f28b8; [derived summary](summary.json) binds its SHA256 and inventories every fixture's last persisted counters, aggregate results and failures. Raw outputs remain in the gitignored A-drive scratch path recorded by the report. No failed output was deleted or retried for a pass.
- [Run01](run-20261124-01/report.json) failed source-pin preflight before any worker. [Run02](run-20261124-02/report.json) stopped on a measurement-helper missing case argument. Both are preserved; the corrected whole-worker regression passed before run03. The pre-matrix shallow oracle alias was a harness bug, corrected without production arithmetic changes.
- The first matrix uses Node counters across source/oracle/candidate/restarts. Its independent Python reads were not durably pre-reserved. A reviewed conservative32*n+512 read bound covers source hashing, evaluator, social, membership/provenance, normalization and two Values scans with slack; summary.json shows each completed combined work bound remains below1000000. Final code reserves these units before starting Python, charges each indexed/checkpoint read and refuses an exhausted budget. New regression tests verify reservation/no refund and refusal. Only the four files listed in final_changes_from_executed_pins changed after run03; this tighter guard is unit/integration tested, not relabeled as matrix-tested. Raw report is unchanged.

## Measurements and interpretation

Summed whole-fixture elapsed time 1645.611s; peak parent-observed child RSS 153.10MiB, below512MiB. Node heap was capped at256MiB; separate peak V8 heap/external memory were not sampled. Successful child CPU user/system times are in raw results; killed-child CPU is unavailable. Reserved run growth 743440384B; retained runtime files 686118870B, below1GiB. Individual source/artifact/scratch counters and emitted records/work are in summary.json. No byte/work/RSS ceiling was raised. Refused fixtures are not successes even when partially completed output exists.

The original120s deadline was shared by source, oracle, candidate, restart and Python. Parent termination/polling/teardown adds elapsed overhead (worst refused observation122.531s); no over-deadline fixture passed. Source pins were checked before/after children. This local epoch-clock/process test is not a distributed clock, durable quota or power-loss/fsync guarantee.

Installed SDK/protobuf measurements used a non-client serializer stub, synthetic paths and128 dummy transaction bytes. Largest measured CommitRequest 16341B /16384B and document 4297B /524288B. Requests contained at most15 immutable nodes plus one checkpoint. No Firestore instance, commit or server/index acceptance. Node size includes typed base64 fragments; full output and wire totals are retained per successful fixture. No DB RPC/provider call/credential-loader invocation occurred; runtime has a TCP/TLS/UDP/DNS/fetch refusal fuse.

| Case | Result | Seconds | Final stage / refusal | Peak MiB |
|---|---|---:|---|---:|
| score-2-1 | pass | 9.422 | independent / complete | 74.11 |
| score-2-3 | pass | 9.406 | independent / complete | 73.87 |
| refuse-corrupt | pass | 9.938 | independent / complete | 74.10 |
| refuse-missing | pass | 10.469 | independent / complete | 75.25 |
| restart-checkpoint | pass | 11.750 | independent / complete | 73.75 |
| restart-seal | pass | 19.391 | independent / complete | 73.98 |
| score-7-1 | pass | 9.875 | independent / complete | 73.06 |
| score-7-3 | pass | 11.781 | independent / complete | 74.27 |
| score-17-1 | pass | 14.047 | independent / complete | 74.82 |
| score-17-3 | pass | 17.391 | independent / complete | 75.79 |
| score-100-1 | pass | 43.031 | independent / complete | 80.25 |
| score-100-3 | pass | 50.375 | independent / complete | 80.51 |
| boundary-300 | unproven | 120.141 | candidate / whole_fixture_timeout | 99.87 |
| boundary-301 | pass | 105.094 | independent / complete | 106.13 |
| dense-1000 | unproven | 120.063 | candidate / whole_fixture_timeout | 126.07 |
| score-1000-1 | unproven | 120.125 | candidate / whole_fixture_timeout | 107.54 |
| score-1000-3 | unproven | 120.140 | candidate / whole_fixture_timeout | 108.48 |
| all-9150 | unproven | 120.125 | oracle / deadline | 131.85 |
| score-9150-1 | unproven | 120.063 | oracle / whole_fixture_timeout | 143.15 |
| score-9150-3 | unproven | 120.110 | oracle / deadline | 153.10 |
| structural-100-1 | unproven | 120.047 | structural / whole_fixture_timeout | 108.15 |
| structural-100-3 | unproven | 120.078 | structural / whole_fixture_timeout | 108.65 |
| structural-19-1 | unproven | 120.218 | structural / whole_fixture_timeout | 83.98 |
| structural-19-3 | unproven | 122.531 | structural / deadline | 67.06 |

## Implemented format and limits

New experiments/c3a code only: typed indexed append-only stores,3072B fragments,fanout8 immutable manifests, fixed root/seal, disk score/member/UID/rank/replay indexes,8-row generation-bound published readers,75-record external sort chunks/fanin8, one-pass sequential Values, exact original rounding/order and explicit Join. Prefix checkpoints and social afterimage WAL support private process restart; incomplete/unpublished artifacts refuse. No whole generation is reconstructed by the reader. The fixed1MiB duplicate-key ordinal table holds metadata, not raw vectors/profiles. Full whole-population allocation is confined to the unchanged oracle and explicitly bounded independent audit, not the candidate.

C1/C2 codec, application/scoring/UI, rules and docs/ are unchanged. c3a-offline-1 remains unsupported by production dispatchers. Synthetic source raw JSON is generated here; it is not a reviewed real-export codec. Numeric matrix coverage is1/3 refs and1/3 aspects; large2-aspect structural stress is unmeasured. Structural fake reference multiplicity is storage stress, not an admitted Analyzer model/receipt or distinct CBC preference. Missing x_eligible/version coverage and the direct-recovery policy remain separate decisions.16 Values cases/PR60 stay deferred.

## Concrete next step

Before a C3b source preflight/import proposal, make a separately reviewed **offline efficiency increment**: coalesce append/index writes into bounded checkpoint batches, reduce per-record journal rewrites, and pack immutable node/index metadata while preserving restart afterimages, pre-write durable reservations, exact bits/order, hashes and the existing resource caps. Profile the measured source/oracle/candidate phases separately without reclassifying shared-deadline failures. Any additional matrix needs review; no automatic repeated120s capacity attempts or cap increase.

No reliable9150 job-byte/work/latency allowance can be derived from incomplete outputs. Therefore no concrete Firestore path/schema or durable C3b job budget is approved by this prototype. A future proposal must first produce successful sealed9150 results, then derive those budgets, implement genuinely paged SDK/UI consumers and handle source ownership, flags/vectors, security, actual contention and restore. No source import/export decoding, production operation, AI cost or deployment occurred.

## Verification

Final required suite results and PR CI are recorded in the implementation Status and HANDOFF. Sol Medium is sufficient for the offline follow-up.
