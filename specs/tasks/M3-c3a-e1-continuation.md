# C3a-E1 bounded continuation proposal

2026-11-24. This is a concrete review proposal, not a resumed experiment. The approved [E1 section5](M3-c3a-efficiency-plan.md#5-proposed-follow-up-limits-and-fixed-matrix) says to stop and return a new proposal when the admitted matrix cannot proceed safely. The parent monitor's atomic-rename stat race triggered that stop. The monitor fix and its fail-closed regression tests are complete; original Node writer/fixture bindings remain unchanged.

## Requested allowance

Run the source-bound [continuation-01 contract](M3-c3a-e1-evidence/continuation-01.json) once, on the reviewed final implementation head:

1. Keep the passed reservation-before-data check as historical pinned evidence; do not repeat it.
2. Run data-before-index, index-before-checkpoint and checkpoint-before-seal on the same7-person fixture. The first was interrupted in source before its fault and needs an explicitly new120s whole-case deadline. Carry its prior cumulative work, bytes, emitted records, sequence and source attempt count into the new private budget; do not copy/reuse a partial source or silently mark it complete.
3. Only after all three pass, run the same12 already-reviewed fixture definitions once. A failure/unproven recovery stops the matrix again. Do not retry a capacity failure for a pass.

Maximum15 newly admitted fixtures at120s each:30 minutes plus bounded termination/report overhead. There are no new fixture shapes, vectors, contexts or refs/aspects, and no unbounded retry campaign.

## Quota and source binding

- Carry the old run's47,185,920B reserved and the interruption pool's5,242,880B reserved into the new ledger. The1GiB total,40MiB unit/24MiB actual-interruption pools (64MiB combined), per-fixture source/artifact/scratch caps,256MiB heap/512MiB RSS,4MiB/75-profile quantum,1m cumulative work,200000 emitted records and max3 attempts remain unchanged.
- The40MiB unit pool is already included in old run reservations; do not reserve it twice or refund it. Keep all older files/reports. All new worker data stays on A in a new owned output directory.
- The contract binds the stopped report's SHA256, exact skipped/remaining IDs and carry values. Validate unchanged prior core source pins; pin the new monitor/tests/contract before/after execution.
- An exclusive continuation claim prevents reuse of the old quotas in another invocation. A failed claim/setup does not grant a new run. The new report distinguishes prior pass, interrupted attempt and fresh admitted cases.
- Keep one original monotonic/epoch deadline across each fresh case's children/retries. The only requested deadline replacement is the explicit new case admission for the interrupted source; it is never relabeled as having met its expired original deadline.
- Any recovery failure or new technical admission stop returns for review. A complete reduced matrix still does not establish omitted all-member/dense/one-reference/two-aspect coverage or C3b readiness.

## Ready command, after approval

The agent can run this; the author does not need to enter commands. If run manually after approval, open Windows PowerShell and enter:

~~~powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-c3a-e1-batching'
python scripts/run_c3a_offline.py --e1 --continuation specs/tasks/M3-c3a-e1-evidence/continuation-01.json --out specs/tasks/M3-c3a-e1-evidence/run-20261124-02
~~~

The output path is exclusive. Do not rerun it, delete the claim or choose another path to bypass a stop. Review final source/CI first. After approval, execution remains offline, with zero source-export access, DB/emulator/provider/loader operations or deployment.

Suggested approval: **Approve E1 continuation: three recovery checks and the unchanged12-case matrix, with a fresh120s allowance for the interrupted source case and all prior quota/work/byte/attempt charges retained.**

## Status

- Proposal and dormant continuation support prepared after the stopped attempt. Required suites pass; source/report/contract bindings and final PR CI checked before handoff. No continuation claim or new worker has been created. Implementation PR remains draft pending this experiment evidence. Sol Medium sufficient; zero paid AI allowance.
