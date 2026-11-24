# C3a efficiency increment: offline batching proposal

2026-11-24. Documentation only. Based on PR65 head `9afbde181140a0966646da5d7036eb23f5ca10e8`, whose push/PR Node and Python CI passed. PR65 is still open; this proposal neither merges it nor authorizes source imports. Proposed implementation name: **C3a-E1**. Sol Medium is sufficient; paid AI allowance required: none.

## 1. Problem and intended outcome

The [first C3a matrix](M3-c3a-evidence/README.md) executed 24 cases: 13 passes and 11 refused/unproven. Successful full comparison reached 301 source profiles and 302 members after Join. The 300 case failed while 301 passed; both remain evidence, and neither defines a reliable capacity boundary.

Observed shared-deadline phase timings:

| Case | Source | Whole oracle | Candidate | Independent audit |
|---|---:|---:|---:|---:|
| boundary-300 | 7.688s | 14.922s | timeout after 97.360s | not run |
| boundary-301 | 13.765s | 9.094s | 78.969s | 3.015s |
| score-1000-3 | 13.828s | 14.031s | timeout after 92.156s | not run |
| score-9150-3 | 54.438s | deadline after 65.609s | not run | not run |

The current Store.set performs a budget save, data write, index write and index-size query per record. Budget saves repeatedly rewrite its JSON file. Artifact fragments, member/replay/UID/rank records and scratch passes multiply these calls. This is a plausible I/O bottleneck established by code inspection, not yet a measured causal attribution. Profile physical calls and phase times before claiming an improvement.

E1 should reduce redundant file operations while preserving exact scores, evidence, logical output order, restart behavior and every resource ceiling. This is a local storage experiment. It does not batch Firestore commits or prove distributed publication.

## 2. Scope and dependencies

Implementation begins only after the author approves this concrete proposal and its section 5 matrix. Prefer explicit PR65 merge first, then reconcile the implementation branch with actual main; merge commands remain separate. The documentation PR may be stacked on PR65 while that merge is pending.

Permitted later changes: functions/experiments/c3a/{disk,pipeline,artifact,sort,worker}.js, their focused tests, scripts/run_c3a_offline.py, scripts/check_c3a_fixture.py, supervisor tests, new E1 evidence and task status/index/handoff/CHANGES. Only touch a listed file when its batching, restart, instrumentation or binding behavior requires it. The unchanged evaluator/oracle mathematics, fixtures and 24-case manifest remain frozen; new follow-up admission metadata is separate.

Production functions, scoring policy/formulas, UI, C1/C2 codecs, rules and docs/ stay unchanged. No database/emulator calls, historical export/profile access, credential loader, provider calls, deployments or accepted-history cleanup. The 16 Values cases and new marked-X/top300/direct-recovery decisions remain deferred.

## 3. Bounded storage design

### Shared buffer and logical order

- Use one job-wide pending-write controller, not an independently growing buffer in every open store. At most 64 pending records and 1MiB encoded pending bytes; all simultaneously retained decoded data plus pending buffer content must fit the existing 4MiB/75-source-profile quantum. Flush/evict before exceeding either restriction. A single admissible large record uses the existing bounded direct-write route after flushing; it is never truncated.
- Preserve typed frame encoding, hashes, index entry shape, logical append/node numbering, lexicographic source and UID order, original A/B encounter order and sequential arithmetic. Preserve overwrite semantics for normalization and read-your-writes for pending records. If read-your-writes cannot be bounded, flush before the read.
- Track known private index extent in bounded store metadata to avoid repeated fstat calls. Validate actual file bounds at reopen; do not trust an unchecked saved extent.
- Coalesce adjacent data appends and contiguous index entries. Do not invent contiguous numeric UID order when source iteration is lexicographic. Nonadjacent updates remain explicit bounded writes.
- Retain 3072B artifact fragments, fanout 8, 8-row readers and existing serializer ceilings. Physical node packing, compression, shared receipts, read caches and new artifact layouts are deferred in this first increment. Fewer metadata calls alone is an experiment worth measuring.

### Pre-write reservations and recoverable checkpoints

Introduce a private versioned journal/budget binding, proposed c3a-budget-2 plus producer IO revision c3a-io-2. Reject old-job resume with the new writer; leave v1 artifacts/reports untouched. Historical output remains readable through its pinned reader. The published c3a-offline-1 logical artifact format stays unchanged if bytes/hashes/order remain compatible; any required public-format change returns for review before implementation.

Before any batch payload/index write:

1. Construct a bounded batch description with exact target stores/offsets, ordered afterimages and hashes. Include reservation/journal/temporary-file costs in scratch and run growth.
2. Persist cumulative reservations for attempted work, emitted records and source/artifact/scratch bytes, run growth, attempts and the original deadline. Unused reservations remain charged after a crash; no refund or new allowance on reopen. Fail before touching batch data if any reservation fails.
3. Persist bounded private recovery metadata, then apply data/index afterimages in their recorded order. Keep the existing social pending WAL semantics, including B ordinal allocation. Do not advance its job cursor separately from the corresponding recoverable writes.
4. Flush all dependent stores before persisting the checkpoint or any source seal/artifact seal/accepted pointer. A reader must never treat an in-memory-only or partially applied batch as accepted.
5. On process restart, validate producer/config/source bindings and replay an incomplete private batch idempotently, or refuse on corruption. Resume only from a complete checkpoint. Orphan private tails remain charged and unpublished. Never repair an accepted generation by dropping rows or rewriting its history.

The concrete implementation must document ordering among reservation, pending marker, data, index, checkpoint and seal. Process-restart recovery is the acceptance target; power-loss/fsync guarantees are not asserted. No shared mutable buffer survives a child restart.

Logical source/member/index reads, emitted records and attempted writes remain charged even when physically coalesced. Physical syscall reductions are a separate metric, never permission to hide logical work. Keep the final PR65 independent Python read pre-reservation/counting guard; no post-hoc accounting substitute in E1.

## 4. Instrumentation and invariants

Record fixed-size aggregate counters by phase/store class: logical gets/sets, physical data/index reads/writes, budget journal writes, checkpoint writes, bytes, batch count, buffer high-water marks and replay attempts. Instrument actual call sites. Do not retain per-profile traces or dynamically growing maps. Count metadata writes and measurement overhead inside the existing budgets and deadline.

Pin runtime, tests, fixture definition, admission manifest, dependency lock and independent checker before/after children. Parent must enforce both monotonic elapsed time and the original persisted deadline without granting new time on restart. Per-phase measurements are diagnostics within one shared allowance; no isolated fresh 120s oracle/candidate run under a capacity-pass label.

Preserve exact Node full Create/Join rows, provenance, normalization, source/model/day bindings, actual taxonomy Values and tally/tasks. Independent Python membership/numeric/Values/tally checks remain mandatory when a numerical fixture completes. Keep genuine unrounded/signed-zero/date/Unicode behavior. A faster altered answer fails.

## 5. Proposed follow-up limits and fixed matrix

**Not run by this documentation proposal.** One new matrix, 12 fixtures total, maximum 24 minutes for those fixtures, plus at most 8 minutes for the four separately reported interruption regressions below (32 minutes total admitted test time), plus supervisor termination/report overhead. Commit exact parameters and hashes before execution. Reuse the corresponding inputs from the immutable C3a matrix, without altering their contexts, populations, refs, aspects, ties or fault meanings.

| Existing fixture ID | Purpose |
|---|---|
| score-7-3 | exact small parity baseline |
| restart-checkpoint | actual process restart at a committed checkpoint |
| restart-seal | actual process restart after seal, before publication completion |
| refuse-corrupt | expected immutable-node corruption refusal |
| refuse-missing | expected missing-node refusal |
| score-100-3 | established complete comparison |
| boundary-300 | retain previously failed boundary |
| boundary-301 | retain previously successful neighboring boundary |
| score-1000-3 | previously incomplete candidate |
| score-9150-3 | whole-source/oracle/candidate bottleneck |
| structural-19-3 | storage-only large manifest stress |
| structural-100-3 | storage-only larger reference payload stress |

No automatic reruns to get a passing capacity result; retain every attempt. Stop and return a new proposal if the admitted matrix cannot proceed safely. Existing ordinary one-reference, dense-1000, all-9150, structural one-aspect and two-aspect coverage is not expanded by E1. Those omitted shapes cannot be declared newly accepted, even if all 12 pass.

All other section 3 [C3 limits](M3-c3-population-plan.md#3-c3a-proposed-first-implementation-offline-only) remain:

- One supervised child at a time; 256MiB Node heap, 512MiB parent-observed child RSS, 120s whole fixture including source/oracle/candidate/restarts/Python. At least 1GiB free RAM before spawn; A free disk at least 4GiB and C at least 1GiB. Never stop user apps to manufacture headroom.
- Source 256MiB, candidate artifact 256MiB, scratch 512MiB per fixture; aggregate new files/evidence 1GiB for the new run. All generated files on A under a new owned subtree. The 4MiB metadata headroom remains part of that 1GiB, not extra space.
- Decoded quantum 4MiB/75 source profiles; pending buffers count toward it. At most 200000 emitted fragments/index records and 1000000 cumulative checkpoint/read/write work units per fixture; maximum 3 attempts at a faulted step. Reserve recovery/instrumentation costs before use.
- Offline serialization only: at most 16 writes/16384B per CommitRequest and 512KiB per document, including the existing 128B dummy transaction token. No SDK database instance or commit.
- Network fuse, strict owned output paths, source pins, fixed-code aggregate reports; zero provider/DB/loader operations. Preserve every original report and private output; no deletion/pruning.

New small temporary unit/fault inputs test boundaries only, with at most 17 synthetic people each and the same per-job ceilings; they cannot be used as extra capacity benchmarks. Add actual worker-process interruption coverage at reservation-before-data, data-before-index, index-before-checkpoint and checkpoint-before-seal. Each fault test has its own one shared 120s deadline and at most 3 attempts; original seven-person matrix fault cases remain unchanged. Run these sequentially under one separate 64MiB aggregate temporary-file allowance, included within the new run's 1GiB total. Commit the exact fault schedule before execution; at most four additional interruption tests, not an open-ended campaign. The matrix remains 12 capacity/fault fixtures, with these four small restart regressions reported separately.

## 6. Acceptance, failure and next decision

E1 is successful as an engineering increment only if:

1. Small exact parity, corruption/missing-node refusal and all specified recovery boundaries pass with cumulative reservations and no partial accepted visibility.
2. Physical-call instrumentation demonstrates fewer journal/data/index writes for at least the complete 100-person case, with the same logical answer and complete byte/work accounting. Report absolute counts and operations per logical record; prior run03 lacks syscall counts, so do not invent a syscall percentage versus it. Use static per-record baseline behavior or a small instrumented reference unit for count comparisons.
3. Every admitted fixture has a retained source-bound pass/refusal/unproven result; no time/cap reset, skipped failing row or silent source mutation. Report timing changes as single host observations, not statistically proven throughput gains.
4. Required Node/Python suites and final pushed-head CI pass. Keep local startup failures if present and distinguish them from scoring failures. Reports bind their actual executed source version, including the independent audit guard.

A passed 1000-person case is progress, not 9150 acceptance. A candidate result with unavailable oracle remains numerically unproven. Even a passed 9150 case in this reduced matrix cannot establish omitted all-member/dense/one-ref/multi-aspect coverage or C3b readiness. C3b stays NO-GO until a separate complete readiness review establishes the missing shapes and source/resource/schema prerequisites.

If large cases still refuse, stop at the recorded limit and recommend the next measured bottleneck or separate design; no automatic repeated matrix, cap raise, real source import or replacement of the oracle.

Later source allowlists, matching embeddings/relationship flags, intended-policy decisions, SDK paged consumers, security, restore and deployment gates remain unchanged.

## 7. Review and execution sequence

1. Review/explicitly merge PR65; this proposal may be reviewed while it remains open.
2. Review/merge the documentation proposal separately, with the author's explicit merge command.
3. Approve **C3a-E1 offline batching and section 5 limits**, including the 12-case matrix and four bounded process-interruption regressions.
4. Implement on a feature branch, verify focused recovery/parity, then run the committed finite matrix once, required suites and report/PR CI.
5. Return measured results and a next recommendation. Do not start C3b automatically.

The author's current "ok, go" authorizes preparing this concrete plan. It does not replace the explicit merge instructions or section 5 experiment review. No human browser check is needed for a documentation-only change.

## Status

- 2026-11-24: Prepared on codex/c3a-efficiency-plan, stacked on PR65 head 9afbde1. Reviewed actual Store/Budget/Artifact/checkpoint/oracle/supervisor behavior and retained phase timings. No runtime, fixture, test, docs/ or rules changes; no capacity experiment, DB/source-export access, emulator/provider/credential-loader operation. Documentation checks and final PR CI are recorded before handoff.

- Validation: required npm test passed335/seven optional skips; Python236 tests/four optional skips passed. Proposal links, whitespace, baseline and documentation-only blob scope verified. No capacity matrix ran.
- [PR66](https://github.com/SergiiPonomarchuk/isr-mvp/pull/66) opened against PR65's feature branch. GitHub initially rejected creation through git push with two HTTP/server errors; creating the same authorized branch at its existing base through the GitHub API allowed the documentation push. No unrelated branch or PR65 update. Final pushed-head standard Node/Python CI is checked before handoff. After explicit PR65 merge, reconcile/retarget PR66 to main before its separately authorized merge.
