# C3a-E1 partial evidence, 2026-11-24

**Acceptance incomplete; C3b NO-GO.** The author approved E1 section5 after merging PR65/66. The single source-pinned attempt completed one of four actual-process interruption checks, then stopped on a parent file-monitor race during the next source worker. No capacity fixture ran. No automatic replacement run or deadline reset was performed.

## Preserved attempt and result

- [Committed admission](admission.json):12 unchanged capacity/fault fixtures and four distinct seven-person process-interruption schedules.
- [Raw stopped run](run-20261124-01/report.json), executed source29fbdd8; [aggregate summary](summary.json) binds its SHA256 and retains the interrupted source budget, unrun cases, resource counters and old quotas. Private files remain at the report's owned A-drive scratch path.
- e1-reservation-before-data completed in13.422s. The child actually exited86 after durable reservation/private afterimage metadata; a new child replayed the batch, preserving the original deadline. Full ordered Node Create/Join rows matched exactly (15 rows); independent Python7-person/7-member/8-joined-member membership/numerics/Values/tally audit passed. Peak child RSS79,302,656B. No partial accepted root was visible.
- The second directory, e1-data-before-index, was interrupted during **source**, before any fault injection or worker result. It is unproven, not a tested data-before-index recovery. The remaining two recovery schedules and all12 capacity fixtures were not run.
- Parent monitoring called is_file then stat while the writer atomically renamed batch-pending.json.tmp. The second stat raised FileNotFoundError; the supervisor's finally block stopped its owned child. The stopped report was finalized from retained safe metadata with fixed code temporary_rename_stat_race; its original source pins remain unchanged.

## Implemented and independently tested

E1 is explicitly selected c3a-io-2/private c3a-budget-2; v1 callers retain their old writer. One job-wide buffer holds at most64 pending records/1MiB, with bounded direct-record handling. Data/index appends coalesce; the typed frame shape,3072B fragments,fanout8, logical record/node order and c3a-offline-1 format remain. Pre-reserved binary private afterimages are applied idempotently before checkpoints/seals. New workers reject old budget resume. Source/oracle/candidate/independent stages share the original120s allowance, plus a monotonic parent guard.

Small tests preserve signed zero/Unicode, read-your-writes and overwrites, exact full rows and exact v1 artifact roots/digests, corruption refusal, cumulative work/byte limits and checkpoint-before-seal resume. Artifact construction now resumes deterministic member/context/UID/rank prefixes. This is necessary for the approved fourth interruption boundary; it has not yet passed that actual-process admission.

The completed seven-person recovery recorded359 logical sets,37 physical data writes,44 index writes and210 budget-journal writes across source/oracle/candidate/restart. A separate18-set unit proves one contiguous data write/two index writes and fewer than17 journals. The unchanged v1 set issues a data write/index write/budget save per call, providing a static call-count reference. These are **not** a measured100-person result or a syscall percentage versus run03. The100-person acceptance criterion and all large capacity claims remain unproven.

## Monitor fix and continuation preparation

After stopping, the scan was changed to take one stat per entry, tolerate only disappeared owned .tmp entries and preserve primary writer pre-write quotas. Other disk-monitor IO errors fail closed and stop only the owned child. Regression tests cover both paths. No Node writer or fixture changed after the attempted admission; the new Python supervisor/tests are not relabeled as run-tested.

[Continuation proposal](../M3-c3a-e1-continuation.md) and [exact source-bound contract](continuation-01.json) are prepared, **not executed**. They skip the passed check, propose three remaining recovery checks plus the unchanged12-case matrix, and explicitly request a fresh120s allowance for the interrupted source case. Its old work/bytes/attempts are carried; old run/regression reserved growth is carried, with no quota refund. An exclusive claim prevents a second invocation from reusing the old allowance.

## Resource disposition and validation

No limit was raised. The64MiB small-test allowance is conservatively divided40MiB persistent unit pool/24MiB actual interruption pool. The admitted run pre-reserved the entire40MiB unit pool within its1GiB ceiling. Unit pool is now36MiB reserved, below40; stopped run45MiB reserved including that pool, actual interruption pool5MiB/24. Summary records exact byte counters. All failed/partial outputs are retained.

Required npm test:339 passed/seven optional skips (346 total). Python243 tests/four optional skips passed. Sixteen focused supervisor tests include the monitor fix, carried counters and exclusive continuation claim; four E1 Node cases supplement the19 original C3a checks. Final pushed-head standard Node/Python CI is verified before handoff.

Production scoring, fixtures, UI, C1/C2 artifacts, docs/ and rules remain unchanged. Zero source-export access, DB/provider/credential-loader calls, imports or deployments. Marked-X/top300/source-vector coverage and16 Values cases remain separate. Sol Medium remains sufficient.
