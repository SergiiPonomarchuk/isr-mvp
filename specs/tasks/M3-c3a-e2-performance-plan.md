# C3a-E2: reduce repeated work within the existing scoring contract

2026-11-25. **Documentation only.** Base main1651d91 (PR67 merged; main Node/Python CI passed). Author asked what follows E1. Proposed next increment: E2 offline source serialization, social-transaction and independent-checker optimization. Sol Medium is sufficient; no paid AI allowance is needed.

## 1. Evidence and priority

[E1 completion](M3-c3a-e1-evidence/README.md) preserves exact results and all earlier failures. Its latest six-case execution had three whole-case passes and three time-limit results, with no new technical stop.

| Observed case | Finding | E2 target |
|---|---|---|
|100 profiles | Full parity/audit16.266s;4163 sets,245 data/439 index/1471 journal writes | Keep exact small behavior and measure new phase deltas |
|301 profiles | Full parity/audit37.844s | Existing evidence; no repeat solely to manufacture a size boundary |
|1000 profiles | Source4.329s/oracle5.594s/candidate102.687s completed, including exact2001 Node rows; independent audit ran out of shared time | First objective: complete the entire case, including independent audit, under120s |
|9150 profiles | Source41.594s/oracle38.687s completed; candidate used remaining39.687s; last safe checkpoint social/cursor409 | Reduce repeated source serialization and social checkpoint traffic; report progress without promising a full-scale pass |
|9150 structural records/19 refs | Storage-only pass95.922s | Retain existing evidence |
|9150 structural records/100 refs | Timeout;3897 unsealed records | Defer layout/packing to its own design; do not substitute this invalid semantic multiplicity for a real scoring case |

These are single host observations. The phase attribution is measured; the causal benefit of each optimization remains to be tested. E2 is an engineering experiment, not C3b source/import readiness.

## 2. Scope and invariants

Later implementation may change only the isolated c3a disk/pipeline/worker adapter, its focused tests, independent Python checker/supervisor/tests, E2 admission/evidence and task status/index/handoff/CHANGES. An explicit E2 test-output-root hook may be added to existing experiment tests for accounting, without changing their assertions. Keep production functions, evaluator/oracle mathematics, fixtures, public-values/sort/serializer, C1/C2, UI, rules and docs/ unchanged.

Use separate private IO/budget/cursor revision identifiers (proposed c3a-io-3/c3a-budget-3/social-batch-1). Reject write-resume of old jobs with the new writer. Keep the published typed c3a-offline-1 format and its record layout/3072B fragments/fanout8/8-row readers unchanged; compare exact roots/digests on small fixtures. Domain/Values specification version1.0 is not changed by a private IO revision.

No new mathematical formulas, precision changes, dropped vectors/evidence, weaker assertions or page-sum reassociation. Preserve lexicographic source order, Object.entries edge enumeration, frozen direct A, B first encounter including zero/rejected X, ceiling-before-max, equal-positive source ties, no second hop, original registration date, Create A/B versus Join UID order, exact rounding, sequential normalization/Values/tally and frozen Join fields.

The new marked-X/top300/direct-recovery policy remains outside this compatibility experiment. Missing relation flags/vectors cannot be inferred or generated.16 Values cases remain deferred.

## 3. Three bounded changes

### A. Serialize each generated source frame once

pipeline.source currently stringifies the same row to count bytes, Store.set stringifies it to encode/hash, and hash(row) stringifies it again for the ordered source digest. Reuse the raw store's already-computed encoded length/frame hash; compute the source payload once.

The private API must still perform its normal size/hash/pre-write reservations. Do not trust an unchecked caller-supplied hash or reuse a hash of the outer frame/typed representation. For raw source, the returned hash must equal SHA256 of exactly the original JSON.stringify(row) bytes. Preserve source_hash, population_hash (its separate Review.hash), bundle/day/config binding and emitted input order byte-for-byte. Do not simplify fixture generation, precompute inputs outside the deadline or import old payloads.

Prove equality with the pinned E1 source route on small generated inputs, including null/missing fields/Unicode/number representation. This is not a new real-export codec or source-authority claim.

### B. Social WAL across a bounded sequence of source people

E1 uses a pending afterimage transaction and saves the job cursor for every source person. Coalesce a consecutive portion of that ordered stream into one transaction with all of these ceilings:16 source people,32 examined edges,32 recipient afterimages and1MiB serialized pending metadata, whichever comes first. Overall4MiB/75-profile quantum and shared64-record/1MiB file buffer still apply.

Process edges in exactly the old order. Allocate each new B ordinal on first encounter, before testing whether its X addition is accepted. Keep immutable direct affectedness/A flags separate from a pending B's updated R; B must never become a new source. For repeated recipients within a transaction, apply the original comparator sequentially and persist only the final afterimage. Do not sort recipients by tie/score or discard zero-X entries.

The pending record binds the first/last source-edge cursors, original source/config/day/revision, afterimages, B ordinals and final job cursor/count. Bound cursor-only progress through sources with no eligible edges as well; no unbounded silent loop.

Ordering: reserve cumulative work/bytes/records -> persist the complete pending record -> apply/flush indirect and border afterimages -> persist the new job cursor/count -> clear pending. An interruption must replay the same afterimages/ordinals idempotently or refuse; no duplicate B, skipped edge, double counter refund or partial acceptance. Only the private checkpoint frequency changes.

Charge every examined edge/logical lookup even if a pending afterimage avoids a physical reread. Keep actual metadata/file operations separately measured. Do not redefine work/emitted-record accounting just to fit the cap.

### C. Remove redundant independent-checker reads

Keep the checker independent of Node output/oracle arithmetic. Proposed changes:

- Fuse the source-hash traversal and the existing per-profile evaluation in the same lexicographic order. Validate every frame before evaluation and the complete ordered source digest before any successful audit result. The joining profile remains excluded from the automatic direct cohort. A later global binding mismatch must still refuse.
- Cache the exact previously used age/education-floor subexpression as fixed-size scalar metadata, at most9152 entries and1MiB additional metadata. Preserve the original malformed/missing-date fallback; do not choose another age definition. Do not retain source profiles, vectors, taxonomies or relation maps for the whole population.
- Combine normalized-score verification and the Values aggregation scan for each Create/Join stream: both already traverse the same expected_ids order and read the same member row. Keep the initial raw-score/statistics validation, full frozen-Join comparison and all field checks. Keep the same per-dimension addition order, first nonempty item lengths, missing/default rules, conflict object weights and refreshed Join semantics.
- Keep independent tally/tasks and numeric tolerances unchanged. Do not replace checks with the Node result, sample membership or omit checks to meet time. Preserve read-unit charging and the conservative32*n+512 pre-reservation; unused reserved work remains charged.

If a merge changes intended refusal/binding behavior or cannot preserve exact arithmetic/order, retain the old path and report the blocker. No whole-population raw-row cache, new source/reader cache or digest-only replacement for full field comparison is included in E2.

## 4. Verification before admission

Add meaningful small generated tests (at most17 people) for identical source hashes/typed artifact roots, age/fallback behavior, complete independent field checks and unchanged tolerances/Values ordering. Adversarial multi-source tests must cover repeated B within/across transaction boundaries, a rejected stronger tie followed by an accepted weaker tie, zero-X inclusion, self/A targets, equal-positive ties and no second hop.

Compare full ordered outputs against unchanged Node and independent Python oracles. Corrupt/missing source and artifact data must refuse; no earlier success flag after fusing passes. Preserve E1 checkpoint retry/exhaustion and immediate-technical-stop tests.

The two actual-process fault schedules below target the new social transaction, not the first score-store batch. Require the fault to occur after at least two source people have participated, and verify actual child exit/restart, marker binding, counters and final parity. Keep all pre-run unit results distinct from matrix evidence.

No capacity worker or new fault run is authorized by this document. Commit the exact admission/hashes and resource ownership before execution.

## 5. Proposed new experiment allocation and finite schedule

This needs explicit author approval. **It is a new E2 allocation, not an E1 continuation/reset.**

- Keep all E1 ledgers/files intact:802MiB already reserved, unit39/40MiB and actual-interruption17/24MiB remain charged. Do not delete old data, refund unused reservations or silently recreate its nearly full A-drive unit pool.
- Propose at most1GiB of **additional** E2 experiment/evidence files, including a64MiB aggregate small-unit/actual-fault pool and4MiB metadata headroom inside that1GiB. Historical E1 plus proposed E2 reservation upper bound:1826MiB. Record both separately and their combined total.
- New E2 jobs get explicitly new per-case accounts for revised code. They do not erase E1's per-case work/byte/attempt totals, which remain linked in comparison reports. No old partial payload/checkpoint is imported.
- Account for all new A-drive unit/baseline-suite files inside E2's small-test pool. Existing test helpers must use an explicitly owned/accounted E2 test root; starting an uncounted old pool in a fresh worktree is forbidden. Fresh CI runners are separately labeled validation, not a refund of A-drive spend. If the finite tests cannot fit, stop for review.
- Same per-case source256MiB/artifact256MiB/scratch512MiB;256MiB Node heap/512MiB observed RSS;4MiB/75-profile quantum;200000 cumulative emitted records/1m work; max3 attempts at a faulted step. Keep durable checkpoint replacement attempts/exhaustion and one-time admission claims.
- One supervised worker at a time; at least1GiB free RAM,4GiB free A and1GiB free C before spawn. All generated experiment files on A in new owned subtrees. Never stop user apps for headroom.
- Every fixture has120s **whole case**, including source/oracle/candidate/restarts/Python. Epoch and monotonic guards share the same original deadline; no child/quantum reset or sharding. Max10 admitted fixtures:20 minutes plus bounded termination/report overhead.
- Keep16 writes/16384B CommitRequest/512KiB document and128B dummy transaction-token measurement; installed serializer only, no database instance/commit. No real data, emulator, provider or credential loader.

| Exact selected input / schedule | Purpose |
|---|---|
|score-7-3 | small full parity |
|restart-checkpoint | existing score-checkpoint restart |
|restart-seal | existing seal-before-acceptance restart |
|refuse-corrupt | expected artifact corruption refusal |
|refuse-missing | expected missing-node refusal |
|score-100-3 | established numerical/I/O baseline |
|score-1000-3 | full independent-audit completion target |
|score-9150-3 | bounded progress/full numerical attempt |
|e2-social-pending / input score-17-3 | exit after multi-source pending is durable, before afterimages apply |
|e2-social-applied / input score-17-3 | exit after afterimages flush, before job cursor advances |

These are eight unchanged input definitions from the committed C3a matrix and two separately identified fault schedules. No new profile/vector/ref/aspect variants, extra retry campaign or large structural benchmark. Run both social faults first; only after both pass admit the remaining eight once.

Technical/parity/binding/monitor failure stops immediately; resource refusals stay explicit. Do not rerun a capacity refusal for a pass. Every partial/failed/not-run result gets source pins, last safe stage and counters. New admission after a stop or added case needs review.

## 6. Acceptance and disposition

Required E2 engineering evidence:

1. Small exact source/row/artifact parity and the complete checker coverage above pass; new actual multi-source transaction recovery is demonstrated, not inferred from the older single-source tests.
2. At100 people, fewer social pending/job metadata writes and fewer independent source/member reads are measured against E1's observed/static counts. Include new overhead; no invented percentage from uninstrumented stages.
3. Report all ten cases with separate Node exact / independent / complete-fixture columns, source/oracle/candidate/audit times, IO/work/byte counters and memory. The1000 full audit is the first performance target; do not promise9150 success or label progress a pass.
4. Required full Node/Python suites and final-head CI pass. Keep old tests' assertions; any test-output accounting changes are verified before more local runs.
5. Explicitly preserve all previous failures, source versions and allocations. No new private format is accepted by production.

E2 may end with a useful NO-GO. The100-reference layout, immutable source reuse/caching, new packed artifact/index format and reader-format changes are deferred to separate evidence-based designs. No skipping/reordering phases merely to award a pass.

Even full9150 compatibility would not establish omitted dense/all-member/one-ref/two-aspect coverage, new X policy/flags/direct-recovery decisions, actual source/vector freshness, SDK/paged application behavior, access control or restore. C3b stays gated. No deployment follows.

## 7. Approval and workflow

1. Review/explicitly merge this documentation PR.
2. Approve E2 implementation **including section5's10-case schedule and additional1GiB allocation**, with old E1 charges retained.
3. Implement on a new feature branch; verify small parity/accounting, then run the committed finite admission once and required suites.
4. Record results/Status/HANDOFF/CHANGES and a review PR. Merge only on the author's explicit command; propose further work from actual results.

No model switch is needed. Sol Medium is sufficient; application Gemini models/paid budgets remain untouched. The requested approval is for bounded offline work, not source access/import or policy changes.

## Status

-2026-11-25: PR67 merged1651d91, reviewed tree equal and main Node/Python CI passed. Prepared this proposal from code and retained aggregate evidence; no runtime/test/fixture/docs/rules changes, new benchmark, source-data access, DB/emulator/provider/loader operation or deployment. Documentation links/scope/diff and final-head CI checked before handoff.
