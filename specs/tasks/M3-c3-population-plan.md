# C3: population scoring parity and capacity plan

2026-11-24, baseline main aae2ff7 (PR63 merged; Node/Python main CI passed). Author requested this plan after C2b acceptance. **Documentation only now.** No application/scoring/codec changes, source export decoding, database reads/imports, provider calls, secret loader, rules/docs edits or deployment. Sol Medium sufficient; zero paid allowance required for planning or the proposed first increment.

## 1. Outcome and recommended sequence

C3 must establish whether real profile evaluation, complete membership, exact normalization/Values, immutable publication, explicit Join, readers/lifecycle and restored history work at the intended population scale within fixed application resources. A byte-sized root alone proves none of these.

Recommend incremental gates: **C3a offline scalable scoring/format prototype**, then **C3b source/resource preflight and bounded emulator integration**, then **C3c actual immutable population acceptance and recovery**. Each needs its own reviewed contract/approval. Do not import9150 profiles just to discover that the current tiny codec refuses at64 records. No deployment follows C3.

Two independent result columns are mandatory:

- **Compatibility parity:** exact behavior of current versioned MR1 engine/Join/Values/Lifecycle on identical inputs. Useful for storage/scaling correctness; preserves historical semantics.
- **Intended-policy acceptance:** the new marked child/dependent-to-carer X and MVP hard-D/G/top300 direct-candidate policy. This is not implemented by current MR1 and is not implemented by C3a. Full intended-policy acceptance remains blocked until its separate adapter/data/edge-case decisions are resolved. A full-scale compatibility pass cannot be relabeled as this pass.

## 2. Verified baseline and gaps

Source references below are relative to main aae2ff7. No external/current-service quota claim is needed for this plan; numbers are repository experiment/application gates.

| Baseline evidence | Implication for C3 |
|---|---|
| [C2b evidence](M3-c2b-evidence/README.md): supplied2/7/17 fixtures/successors; max12411B commit,2817B document;63.281s/~120MiB; author accepted actual UI | Consumer/lifecycle mechanics work for tiny precomputed data. No actual profile/vector scoring or population capacity claim. |
| functions/experiments/publication/artifact.js:27-36: whole-array preparation,64 records/64KiB/512 nodes; validation reconstructs complete artifact | Cannot reuse this implementation for9150 rows by increasing constants. Need streaming records, segmented per-member evidence and bounded manifest/index traversal; preserve C1/C2a/C2b artifacts/code/limits unchanged. |
| functions/mr1-engine.js:29-83: vector batches75, but retains all users/scores/outgoing links; multi-reference.js:76 onward retains whole cohorts | Paged vector fetch alone is not bounded scoring. Preserve evaluator/oracle arithmetic while replacing whole-population retention in an isolated experimental adapter. |
| functions/experiments/c2b/service.js snapshot and prototype/js/publication-fixture.js loadBundle reconstruct the complete tiny membership; C2b decisions/state have19-member and small content/choice bounds | C3 must replace full-bundle cache/directory reconstruction and large choices with bounded published indexes/content; tiny UI acceptance does not prove large-reader memory. |
| functions/join-issue.js:44 onward reads all flat members and renormalizes; mr1-engine.js joining uses original registration date and frozen A links | C3 must test successor normalization/Values and exact frozen existing rows; Create-only evidence is insufficient. Unsupported new-format legacy Join remains refused. |
| public-values.js uses weighted sequential sums/defaults/first nonempty item length; isr.js normalizes stored rounded R/E | Preserve input order, rounding sites and per-dimension accumulator bits across page/restart; no page-sums or guessed145 constant Values. |
| [Phase A](M3-capacity-audit/README.md): compact distinct19 Create exceeded guard; three100-reference large cases timed out | Preserve failures. They establish a historical representation problem, not current real scoring throughput. After CBC table-only, historical distinct-CBC slots are structural evidence, not proof current refs need distinct calculations. |
| [X policy](X-eligibility-values-reconciliation.md): flags/schema and MVP approximation specified; direct-recovery boundary explicitly awaits clarification | Current mr1-engine.eligibleLinks ignores x_eligible and its projection omits social_relations_version; full direct cohort has no top300 gate. Do not silently change oracle or infer missing flags. |
| [Resource plan](M3-capacity-memory-plan.md): old full-import needs6GiB free; application512MiB, Check/Create300s; offline256MiB heap/512MiB RSS/120s | Fresh measurement required. Tiny preview Java1GiB is not proof a full import fits. A lower-memory restore requires its own measured replacement contract. |
| restore_firestore.py fixed demo-isr-recovery/8185 | Do not repoint/use it against another project or silently broaden its path policy. C3 needs a reviewed target-specific wrapper or separate adapter. |

The scoring skill's older formula shorthand is not a replacement for accepted specs/current engines. CBC table-only and recovered Values metadata remain as merged;16 deferred Values cases/PR60 stay deferred. No regeneration to make a fixture pass.

## 3. C3a proposed first implementation: offline only

Implement in new experiments/tools, default off, no Firestore/model client or DB network. Reuse pure Engine.evaluate/eligibleLinks/joining, multi-reference arithmetic, ISR, Values and Lifecycle as pinned oracles where applicable. Preserve production functions, original serving checkout, C1/C2a/C2b and frozen reports. A separate experimental format label must not be accepted by production dispatchers.

### Scoring and order

1. Generate deterministic varied synthetic profiles/skills/current-dimension vectors and Values; distinguish these from actual saved source/aspect vectors. Use real evaluator math rather than scaled repeated scores as the only performance workload. Keep repeated-score structural fixtures as a separately labeled comparison.
2. Stream source by lexicographic document ID. Bind day/registered_at, model/reference/aspect/receipt hashes and ordered typed user/vector digest. Release raw vectors after a bounded quantum; own scratch/indexes explicitly. Preserve full field/evidence/source precision and string/date/negative-zero representation where the codec contract requires it.
3. Freeze direct A before social expansion. Preserve current oracle A order, Object.entries target-key enumeration, first-encounter B order, max-after-ceiling/equal-positive-source tie behavior, zero-X/rejected additions and no second hop. Disk-backed lookup/order indexes are permitted; retain no unbounded relation dictionary. Refuse missing target data.
4. Normalize exactly the stored rounded R/E; persist individual sequential accumulators and equal/zero shortcuts. No reassociation/sums-of-page-sums. Stream final rows in original order. Join existing member document-ID order then new UID differs from Create A/B encounter order: encode both explicitly.
5. Recompute actual supplied taxonomy aggregates with public-values semantics and same getAll/existing order. Preserve missing-taxonomy/default dimensions/first-nonempty lengths/conflict object weights; this does not repair the16 metadata cases.
6. Compare full output/provenance/replay against current oracle on manageable fixtures. For a bounded large case, produce oracle and candidate in separate supervised children and compare ordered typed streams incrementally. If the current oracle cannot run within its cap, mark oracle-unavailable; use small exact/adversarial parity plus independent checks, and leave full large numerical acceptance unproven. Never raise oracle memory/time to manufacture acceptance.

### Scalable offline artifacts

Design a separate streaming codec/manifest/index format rather than changing tiny codec caps. Per-member evidence, long raw receipts and adjacency lists may span typed fragments. Bounded fanout indexes cover source IDs, membership ordinal/UID, rank, replay, context and sealed output. Root contains counts/digests/fixed-size pointers, not the list of every leaf. Cursor binds version/job/policy/source/manifest/filter/order; historical reads use an explicitly published token. Validate ranges/duplicates/missing leaves/UTF8/unknown types without materializing the full generation.

C3a has no SDK commits. Installed-SDK serializer may be used offline behind a network fuse to measure intended physical records/masks, but must never initialize credentials or commit. Proposed per-request16 writes/16KiB and document512KiB ceilings remain; leaf segmentation must intersect both. Exact envelope limits are not server/index acceptance. Overall staging budgets for a future emulator job must be derived from this measured inventory and approved in C3b, not borrowed from C2b's tiny8MiB/512-operation guards.

### Finite C3a experiment limits (approval required)

- At most24 synthetic fixtures in the first run (including smoke/fault variants); commit their exact case IDs/parameters before execution. At120s each the child-time ceiling is48minutes, not an expected runtime. Any added matrix needs review.
- One child at a time,256MiB Node heap,512MiB parent-observed RSS,120s **whole fixture**, at least1GiB free before spawn; source pins before/after. No hidden quantum reset of the whole-fixture deadline. Parent owns/stops only its child.
- Synthetic population at most9151,100 structural reference records,1-3 aspects,128 outgoing links/person for the separately labeled1000-person dense case; ordinary relation workload five links/person. Only inputs admitted by current validators are numerical cases; larger reference multiplicity is serializer stress, never semantic-model evidence.
- Proposed offline source and candidate artifact budgets each256MiB, scratch512MiB per fixture, aggregate new evidence1GiB per run, largest decoded quantum4MiB/75 profiles (whichever first). Check free A disk >=4GiB and free C >=1GiB before start; store all scratch on A. These are new offline-file ceilings, not new application/Firestore quotas. Oversized individual source/evidence requires lossless streaming segmentation or explicit refusal, never truncation.
- At most200000 emitted fragments/index records and1000000 checkpoint/read/write work units per fixture, charged across all retries; max3 retry attempts at a faulted step. Refuse before exceeding any byte/work/time cap. No process sharding to evade one fixture limit. C3b distributed durable quotas are not proven by these process-local offline counters.
- Preserve every failed/refused run in a new output directory with last safe stage/count/hash/peak/RPC counters. No provider/network/credential-loader calls. Reports contain IDs, hashes, fixed codes and aggregate numbers; no profile text, contact fields or secrets.

## 4. Verification matrix and exact acceptance

| Case set | Required result |
|---|---|
| Small2/7/17 plus boundary300/301 | Exact Node full outputs; rounded/unrounded inputs, member ordering, thresholds/equality, zero-X/rejected ties, equal/zero normalization, date/Unicode/numeric codec boundaries.300/301 is a structural boundary for the proposed policy; current oracle still does not cut. |
|100/1000/9150+9151st explicit Join | Actual varied-profile evaluator, complete Create/Join streams/Values/replay; exact oracle where resource-admissible. No automatic member cap.9150 source profiles need not yield9150 members: record both. Use a separately labeled all-member stress case to reach9151; do not invent a real9151st DB profile. |
|1/3 reviewed refs and current valid admitted cases | Current CBC table-only/shared-aspect semantics, source digest, actual per-profile skill/vector evaluation. Reuse approved receipt bytes only when bindings validate; supplied synthetic matching vectors remain labeled synthetic. |
|19/100 reference structural stress,1/2/3 aspects | Byte/index/manifest scaling and graceful refusal; full payload, no collapsing nonidentical calculation inputs, no historical CBC adjustment reintroduced. Do not force invalid bundles through real validators. |
| Sparse/dense relations, long member/evidence/receipts | Complete source links, no dropped zero-X B; bounded disk/RSS and safe oversized-leaf/whole-job refusal. |
| Crash before/after checkpoint/seal, corrupt/missing nodes, changed pins, stale cursor | Deterministic resume and bit/order parity, no partial ready success, no repeated paid work, original artifacts retained. |
| Independent checker | Extend offline Python stream checker to exact cohort/UID/source/provenance coverage and existing numeric tolerances, actual Values and tally/tasks. Node exact parity remains primary; tolerance does not permit changed Node rounding/order. |

C3a exit: source-pinned aggregate report distinguishing pass/refusal/unmeasured, largest serialized records/requests, peakRSS/heap/externalCPU/wall/disk, read/work/byte counts, failure traces, exact comparison results and recommended **concrete C3b** schema/path/job budgets. NO-GO is a useful result and must name the blocking shape. Required Node/Python suites and focused resource/no-network tests; no implementation-mirroring tests for cosmetic artifacts.

## 5. Policy/data decision gate, before intended-policy coding

Ask the author to confirm the already-proposed direct-only hard-D/G/top300 boundary: marked relatives outside the direct candidate set are evaluated, directly affected recovered targets get X=0, and do not seed another hop. If not confirmed, leave it unresolved; do not silently pick a new mathematical rule. Relationship schema x-links-1/new formation-policy IDs remain proposed until their separate implementation is authorized.

Then a separate versioned X adapter task must implement strict true/false/missing coverage, self/duplicate/custom-tie handling, directed source->carer eligibility, strict UB<Theta, deterministic cutoff/bypasses, all eligible recipients and historical Check/Create/Join/replay routing. Tests follow the X reconciliation contract. Missing Boolean/version/target/vector is an explicit data gate, not guessed false/true or age/diagnosis inference. No all-true/all-false backfill.

This gate does not block C3a compatibility/storage work. It blocks any assertion that the final public follows the new policy. Keep policy/scoring/publication/Values schema versions independent and source-bound.

## 6. C3b proposed source/resource preflight and emulator integration

No execution authorized by this planning request or C3a approval.

First prepare a read-only local source/artifact inventory with **explicit exact archive/artifact path allowlists** approved by the author. Do not choose a historical backup just because it exists: earlier backups may predate Values recovery. Verify manifest/typed hashes, counts/IDs, matching profile/skill/aspect embedding model/dimensions/template/text hashes, admitted receipt bindings and Values metadata coverage. Do not decode or copy source narratives/credentials into reports. Current code-only planning has not inspected a backup. No live reads by implication; a fresh live export, if required, is an author step under its own reviewed backup/runbook.

Produce a manifest-bound field projection/minimal immutable source definition, maximum profile/vector/relationship/evidence sizes, predicted source/scratch/result/backup storage and Java/Node/OS peak-memory plan. The old6GiB-free full-import prerequisite stands. If not available, propose and measure a separate streaming restore on tiny then representative synthetic sources; no lowering it by assertion or stopping user apps. Application512MiB acceptance remains independent of emulator Java capacity.

Only after measured budgets/path approval: propose fresh demo-c3-population, loopback-only target, no import/export over accepted snapshots, default-off new version and finite sessions; check occupied ports before setup. Exact collection/document paths and SDK/source authority mappings must be listed in that later spec; **C2b's path exception does not extend to C3**. No rules changes. Source, manifests, scratch and public generations remain separate; final publication must have bounded roots/controls independent of population.

Implement C3a producer/reader/scorer against the actual SDK with durable aggregate bytes/work/deadline/attempt quotas derived from measured outputs. C2b per-request guards16writes/16KiB/512KiB doc remain starting ceilings; tiny whole-job8MiB/512ops/64-record codec are not a full-population permission. Any changed total/schema/new path needs that concrete approval. Bind issue/policy/source/catalog/day/lease/revisions; never load all members during activation. Full exact input oracle still required where admissible.

Scale all consumers, not just publication: C2b snapshot/loadBundle currently decode every member into memory and legacy-shaped renderer maps. C3 needs header/viewer/author lookups plus cached8-row directory/rank/assignee pages, explicit catalog continuation and generation/actor-bound cursors, without an eager whole-public client bundle. Backend lifecycle/tally must process pinned ordered membership and choices in bounded passes preserving existing addition/voter-sort/rounding rules. Management/vote/content state cannot grow into a giant root map or arbitrary choice cap; segment immutable revisions and bind their seals in the final bounded transaction. Recheck concurrent Join/start, vote/options/finish and task edits using revisions; no unbounded scan inside transaction. Measure browser and API result/body sizes separately. Changes to C2b tiny limits stay in a separately versioned C3 adapter with an explicit later contract, never silently enable the new format on old clients.

## 7. C3c proposed immutable population acceptance/recovery

Separate approval after C3b readiness. Real cached analysis must match exact issue text/context/library/protocol, and aspect embeddings must match each actual aspect text/model/template. Missing/mismatched vectors block that case; do not reuse unrelated vectors, generate placeholders or invoke Gemini. Additional embeddings/reviews need separate explicit paid allowance and credential-loader approval.

Run one immutable source manifest, with declared policy coverage and counts, through Check-derived build/Create/restart/frozen replay/explicit Join, paged directory/rank/assignees/other-profile lists/context/actual Values, management/vote/tally/tasks and Join-vs-phase/deadline races. Test both large all-member synthetic stress and actual source outcomes. No full-population claim from top300 candidate work alone. Verify legacy refusal/compatibility and incomplete/mixed-version errors.

Recursively back up all reachable source/build/manifest/context/member/index/outcome/replay artifacts into a new private archive, restore into a second fresh emulator via the reviewed adapter and compare typed hashes, source IDs, complete membership/scores/Values, original replay and tally/task assignments independently. Preserve active/superseded generations and frozen rounds; never repair by silently rolling back used active pointers. Interrupted/stale restore must refuse partial visibility. Cleanup of never-published builds needs its own approved retention contract; no published-history deletion.

Readiness report states exact successful source/issue/policy/matrix, costs0 unless separately authorized, observed capacity/latency/refusals and untested cases. Human acceptance follows meaningful UI changes with explicit ready URL/identity/steps/expiry. No live migration/deploy or rules/access acceptance follows C3c.

## 8. Later live gates and next requested decision

Still separate: closed-set source/catalog writers, authenticated actors/authorization, reviewed Firestore rules/IAM/index/cost constraints, unmodified-old-client/REST cutover, source freshness under dynamic writes and operational recovery/deploy runbook. Existing open roots cannot protect new-format data; synthetic adoption is not authentication. Current default-off refusal remains until these gates pass.16 Values cases/PR60 stay deferred.

**Recommended next approval after this plan is reviewed/merged:** Approve C3a offline scalable scoring/format prototype only, including section3 finite synthetic/file limits; current-oracle compatibility route, zero source export access, zero DB/model/network/secret-loader calls. This does not approve new X policy implementation, source inventory/import, emulator paths, larger runtime job budgets or deployment.

Rough engineering estimates, not promises: C3a1-2 working sessions; later source preflight about one session if artifacts are complete; emulator/population/recovery several sessions, dependent on actual resource/vector/flag gaps. The synthetic automated matrix has120s per fixture; report its exact admitted fixture count/runtime before starting it. First scope has no paid cost. Use Sol Medium; if exact floating-point/order/lease review cannot be resolved confidently, propose a model upgrade before that work, not an application model change.

## Status

-2026-11-24: PR63 merged as aae2ff7, reviewed tree equal, main Node/Python CI passed. Author requested next C3 plan. Refreshed source, PhaseA/C1/C2b limits and X-policy gap; documentation-only branch codex/c3-population-plan. No source/archive decoding, database/provider/loader/runtime/rules/docs operation. C3a execution remains subject to explicit approval.

- Verification: Python227 tests/four optional skips passed. Default concurrent npm test twice hit the same two existing capacity-test child startup timeouts (10s each), with314 passes/seven skips; logs retained in ignored scratch. Unchanged exact .test.js suite run serially via node --test --test-concurrency=1 test/*.test.js passed316/seven skips (107.747s); no code/test/timeout change. Source paths/relative links/encoding/diff verified. Only this plan, HANDOFF/index and CHANGES changed; final standard CI is checked on the PR head before handoff.

- [PR64](https://github.com/SergiiPonomarchuk/isr-mvp/pull/64) opened against main aae2ff7. Documentation-only scope and link/source/encoding checks passed. Final pushed-head standard Node/Python CI is verified before handoff. Merge only on explicit instruction; C3a approval must include section3 limits and zero-source-access scope.
