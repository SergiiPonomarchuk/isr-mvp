# C3a-E1 evidence: continuation stopped on checkpoint I/O, 2026-11-25

**Draft PR67; E1 acceptance remains incomplete and C3b NO-GO.** The approved continuation ran once at fbb17ba. All three remaining actual-process recovery checks passed. Combined with the original reservation-before-data pass, all four scheduled boundaries have pinned evidence for that writer version.

The matrix produced seven passes, two EPERM filesystem failures and one manually interrupted case; two cases were not started. The checkpoint retry/diagnostic and immediate-stop fixes described below were made afterward. They are not relabeled as matrix-tested.

## Retained evidence and exact result

[Admission](admission.json), [original stopped report](run-20261124-01/report.json), [approved continuation contract](continuation-01.json), [continuation report](run-20261124-02/report.json), [derived continuation summary](continuation-summary.json). [Original notes](run01-notes.md) and [original summary](summary.json) are retained. Directory labels keep the previously approved20261124 names; the continuation was approved/executed on2026-11-25.

| Case | Result | Seconds |
|---|---|---:|
| data-before-index recovery | pass |16.796 |
| index-before-checkpoint recovery | pass |10.250 |
| checkpoint-before-seal recovery | pass |10.765 |
| score-7-3 | pass |8.953 |
| restart-checkpoint | pass |12.204 |
| restart-seal | pass |19.406 |
| refuse-corrupt | expected refusal passed |17.000 |
| refuse-missing | expected refusal passed |14.344 |
| score-100-3 | pass |28.969 |
| boundary-300 | pass |50.094 |
| boundary-301 | candidate EPERM |33.531 |
| score-1000-3 | candidate EPERM |42.219 |
| score-9150-3 | source complete; oracle interrupted on stop | not a completed fixture |
| structural-19-3 / structural-100-3 | not run | - |

Every completed numerical case passed full ordered Node Create/Join output comparison and the independent Python membership/numerics/Values/tally audit. Actual recoveries exited86, resumed in a fresh child under the same newly admitted whole-case deadline, and retained cumulative charges. The interrupted old source's work/bytes/attempts were carried; the already passed first recovery was not repeated.

## Measured improvement and limits

The100-profile fixture completed in28.969s versus50.375s in C3a run03. The300-profile fixture completed in50.094s versus a prior shared-deadline timeout. These are single host observations, not statistical throughput/capacity bounds;301's I/O failure is not evidence of a numerical population cutoff.

At100 profiles, instrumentation recorded4163 logical sets,245 data writes,439 index writes,1469 journal writes,459 WAL writes and357 checkpoint writes. At300:12328 sets,702 data writes,1278 index writes and4209 journal writes. The v1 Store.set performs at least one data/index/journal write per successful set; this is a static call-count lower bound, not a syscall percentage from the uninstrumented run03. Include WAL/checkpoint overhead when comparing totals. No Node arithmetic, source vectors or logical artifact payload were simplified for these results.

## Why execution stopped and what changed

The301 failure left a valid create-artifact-writer.json.tmp containing496 logical records. The1000 failure left batch-pending.json.tmp. Their source/oracle stages completed; candidate results report EPERM. The files' attributes were Archive, not ReadOnly. This is consistent with a checkpoint replacement/sharing failure; the old diagnostic did not preserve the exact failing operation, so its cause is not asserted more narrowly.

The supervisor incorrectly advanced after the first technical error:1000 then failed, and9150 started. The agent preserved a valid report snapshot, stopped only the exact supervisor and its branch/output-bound child, and finalized the interrupted metadata. The report explicitly records this stop-gate overshoot; it was not a planned retry or a passing result.

After stopping:
- Metadata replacement now makes at most three attempts for EPERM/EACCES/EBUSY, with50/200ms waits inside the original deadline. Attempts are precharged and persisted; exhausted operation keys stay refused across reopen and unrelated operations, in a bounded32-key index. There is no deletion of the prior checkpoint.
- Worker failures include fixed operation/file tags and attempt counts, never raw profile content.
- The matrix loop now stops immediately on technical failures, including EPERM/parity/monitor errors. Guarded resource refusals remain distinct. Tests exercise the loop boundary, not just the classifier.
- Transient success and persistent refusal are tested with injected filesystem errors. These changes have not had a new actual-worker/capacity admission.

## Resource accounting and next review

All old outputs/charges remain. Reserved run growth is233832448B (223MiB), interruption pool17825792B/24MiB (17MiB), persistent unit pool40894464B/40MiB (39MiB). The40MiB unit pool is already included in run reservations; no double allocation/refund. The overall1GiB and per-fixture limits were not raised. Source-pinned reports name the executed versions; later fixes are separately tested.

[Six-case completion proposal](../M3-c3a-e1-checkpoint-completion.md) and [exact contract](continuation-02.json) are prepared, not run. It rechecks100,301,1000,9150 and the two unstarted structural shapes, up to12 minutes, carrying global and per-case charges. No extra process-crash trials or new shapes are proposed; prior recovery evidence remains attributed to its actual writer version.

Validation: prior full Node339/seven skips, new targeted transient/exhausted tests passed, Python245/four skips. The enhanced exhaustion/interleaving assertion and full revised Node suite are checked in final-head CI, whose fresh runner uses its own bounded test pool. The nearly full A-drive unit pool is not reset to rerun it locally.

Production scoring/fixtures/UI/C1/C2/docs/rules are unchanged. Zero DB/emulator/provider/credential-loader operations, source-export access, imports or deployments. New X policy/source coverage and16 Values cases remain separate. Sol Medium sufficient.
