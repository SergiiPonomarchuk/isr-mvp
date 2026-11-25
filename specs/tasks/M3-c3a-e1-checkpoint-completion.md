# E1 checkpoint-fix completion proposal, 2026-11-25

The approved continuation completed all three remaining recovery checks and seven matrix cases, then hit two EPERM candidate failures. The supervisor stop gate was incomplete; the exact parent/child were stopped after it advanced. The retained report records the interrupted9150 oracle and unstarted structural cases. Checkpoint retry/diagnostics and immediate stopping are now fixed/tested; no failed fixture has been restarted.

## Requested bounded completion

Approve one six-case admission, maximum12 minutes plus bounded termination/report overhead, on the reviewed updated PR67 head:

1. score-100-3: confirm exact result/write counts with the revised checkpoint replacement policy.
2. boundary-301: recheck the first filesystem failure.
3. score-1000-3: recheck the second filesystem failure.
4. score-9150-3: complete the interrupted shape if it fits the original ceilings.
5. structural-19-3 and structural-100-3: run the two unstarted storage-only cases.

Use exactly the existing fixture definitions; no new profiles, vectors, refs/aspects or paid calls. Fresh120s whole-case deadlines are explicitly requested for these new admissions. Child retries share that case's original new deadline; no capacity retry for a passing result.

## Charges and source binding

[continuation-02.json](M3-c3a-e1-evidence/continuation-02.json) binds the stopped report's SHA256, the exact six IDs, five reviewed revised runtime/test file hashes, and four old per-case budget-file hashes.

Carry233832448B of run reservations and17825792B of interruption reservations forward. The1GiB run limit and40/24MiB small-test pools remain unchanged; the unit pool is already reserved within that total. Keep all old files. For the four previously started cases, copy **only** budget counters into the new private directories, retaining source/oracle/candidate attempt counts, work, emitted records, bytes and sequence. Do not import partial payloads/checkpoints or reset charges. New seed metadata is itself charged. The two structural cases start new budgets.

No new actual-process recovery tests are proposed; all four previous recovery passes stay attributed to the old pinned writer. New native-replacement retries and persistent-exhaustion behavior have unit coverage. The actual metadata retry policy remains a limitation until this admission runs.

The existing exclusive per-parent claim prevents another invocation from reusing these old allowances. Core sources outside the five reviewed changes must still match the parent pins; current changed sources must match the proposal's revision pins. No source changes during execution.

Any new technical failure stops immediately. Resource refusals are preserved, not bypassed. A completed reduced matrix still cannot establish omitted dense/all-member/one-ref/two-aspect or C3b/source-import readiness. No cap increase or production work is authorized.

## Ready command, only after approval

The agent runs this; no user console action is required. For review, the full Windows PowerShell command is:

~~~powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-c3a-e1-batching'
python scripts/run_c3a_offline.py --e1 --continuation specs/tasks/M3-c3a-e1-evidence/continuation-02.json --out specs/tasks/M3-c3a-e1-evidence/run-20261125-01
~~~

Do not delete a claim, overwrite an output or choose another path after a stop. Current bindings were validated read-only with admission/worker calls disabled; no claim or output for this proposal exists.

Suggested approval: **Approve the six-case E1 checkpoint-fix completion, up to12 minutes, with fresh120-second case deadlines and all prior quota/work/byte/attempt charges retained.**

## Status

Prepared for author review under the approved E1 stop/new-proposal rule. PR67 remains draft. Final-head Node/Python CI is checked before handoff; no completion worker ran. Sol Medium sufficient; zero paid AI allowance.

-2026-11-25: Author approved the exact six-case completion/fresh deadlines with retained charges. Executed once at509b26c; all six attempted, three whole-case passes/three time-limit refusals, no new technical stop.100/301 passed full Node/Python;1000 passed exact Node but Python timed out;9150 candidate timed out after source/oracle; structural19 sealed9150 records; structural100 timed out. [Final evidence](M3-c3a-e1-evidence/README.md), [carried-budget summary](M3-c3a-e1-evidence/completion-summary.json). E1 engineering increment complete; C3b NO-GO. PR67 review-ready after final CI; no further admission or merge is automatic.
