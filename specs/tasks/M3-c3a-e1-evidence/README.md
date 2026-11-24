# C3a-E1 bounded completion, 2026-11-25

**The approved E1 engineering increment is complete and PR67 is ready for review. Full-population/C3b readiness remains NO-GO.** All six newly approved cases were attempted once at509b26c: three whole-case passes, three time-limit/unproven results, zero new technical stops. No allowance was reset or raised and no expired case was replayed outside the authorized admission.

[Six-case contract](continuation-02.json), [raw completed execution](run-20261125-01/report.json), [source/seed-bound summary](completion-summary.json). The summary binds the raw SHA256, records cumulative and seed budgets plus new-run deltas, and verifies that prior work/node/byte/attempt charges were retained. Earlier failure/recovery evidence remains below and in its original files.

| Case | Whole-case result | Seconds | Validation reached |
|---|---|---:|---|
|100 profiles /101 after Join | pass |16.266 | exact Node and independent Python; serialization/readers |
|301 profiles /302 after Join | pass |37.844 | exact Node and independent Python; serialization/readers |
|1000 profiles /1001 after Join | unproven |120.016 | candidate, serialization/readers and exact Node2001 rows passed; Python audit timed out |
|9150 profiles | unproven |120.062 | source41.594s/oracle38.687s complete; candidate timed out with remaining39.687s |
|9150 structural records /19 refs | storage-only pass |95.922 | sealed9150 records; serialization, no semantic-scoring acceptance |
|9150 structural records /100 refs | unproven |120.062 | last checkpoint3897 records, unsealed |

The1000 result is exact Node compatibility evidence, not an independent-check or whole-fixture pass. The9150 result includes source generation and the oracle within one120s deadline; it does not measure a candidate given an isolated fresh120s. Structural references19/100 are deliberately storage-only multiplicity, not admitted real Analyzer contexts. No new numerical mismatch was reported.

## I/O and resource findings

For100 profiles the new execution added4163 logical sets,245 data writes,439 index writes and1471 journal writes;301 added12367/709/1288/4246 respectively. These are deltas from the carried seed budgets, not totals that double-count previous attempts. The unchanged v1 set does at least one data/index/journal write per successful set, giving a static comparison. WAL/checkpoint overhead is included separately in the summary. The100-profile times50.375s (C3a),28.969s (prior E1) and16.266s (current) are single host observations, not controlled statistical speed claims.

The completed1000-profile worker recorded one native replacement retry and then passed full comparison/serialization/readers. Structural100 recorded one additional retry attempt before its timeout; it is not a completed-case validation. No EPERM/other technical error stopped this admission.

Summed fixture elapsed510.172s (about8.5min). Peak child RSS191238144B (182.38MiB), below512MiB; Node heap capped256MiB. All attempted phases, restarts and the independent audit shared each newly authorized120s deadline. Parent teardown adds small elapsed overhead on refusals; no over-deadline fixture passed.

Run reservations finish840957952B (802MiB) of the unchanged1GiB allowance, including inherited233832448B and the already-reserved40MiB unit pool. New run retained548739852B; older outputs remain. Interruption pool stays17/24MiB and unit pool39/40MiB; neither was reset/refunded. Per-case work/node/byte/attempt caps remain enforced; summary contains every retained seed and final persisted budget.

Installed-SDK envelope measurements use the same offline non-client serializer/dummy transaction approach; maximum request/document sizes and fixed limits are in the summary. They are not Firestore server, index, authentication or distributed quota acceptance. Zero DB/provider/loader operations or real source access occurred.

## Disposition and next recommendation

All four actual-process recovery boundaries passed in the earlier pinned evidence. The revised metadata retry/exhaustion policy has fault-injected unit coverage and an observed successful retry in the1000 execution. Historical recovery results are not relabeled as having run on a later source version.

The bounded producer/codec/parity/I/O increment is reviewable with the time refusals retained. Do not import the actual population, deploy, change policy, raise caps or claim full9150 acceptance. Even a later9150 numerical pass would not establish omitted dense/all-member/one-reference/two-aspect cases, marked-X coverage, real source/embedding freshness, paged application/SDK consumers, access control or restore.

Recommended next work, after PR67 review/explicit merge: prepare a separate offline performance design for source preparation, the social pass, repeated validation/reader work and the large structural layout. Use the observed phase/counter breakdown; preserve exact outputs and current failures. Any new matrix or changed accounting/resource contract needs review. No new experiment is proposed as already authorized.

The executed source509b26c passed full Node/Python CI. This closeout changes only evidence/status/PR description; final-head standard CI is verified before handoff. The nearly full A-drive unit pool is preserved and not reset for redundant local tests. Sol Medium sufficient; zero AI cost.

---

## Earlier continuation and stopped-attempt evidence

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
