# M3 offline calibration and implementation plan

Status: **Offline selection experiment complete, 2026-11-16; runtime not implemented.** Author approved the offline stage with "ok, go" after PR #38 merged as89fb6bc. This task authorizes read-only snapshot/vector analysis, reproducible evidence and implementation planning; no new provider calls, production writes, deployment, rules changes or model change.

## Scope and approved plan

Use existing D1/reference vectors to evaluate PD-9's chain (.30 minimum, adjacent gap<.05, >3 clarification); inspect coverage and report limitations. Prepare the direct-affectedness and runtime integration plan. Preserve the accepted D1 dataset and compare member scores only when contextual aspects and affectedness have an approved executable definition. No invented vectors or proxy profile scores may be presented as actual mr1 results.

## Actual evidence and method

The accepted snapshot `2026-11-14-d1-author-accepted-7259ca3` contains eleven issue-vector records: ten visible scenarios plus hidden standby. Existing normal emulator ports were stopped. A Firestore-only copy on8188 reached ready but reads timed out under memory pressure; only that isolated Java process was stopped after verifying its listening port. It was not exported and no source files were changed; ports8188/4488/4588 were confirmed closed.

A streaming RecordIO/protobuf reader then selected issue_vectors keys matching the committed manifest, copying only vector/model/dimensions/text-hash/task/template fields. It did not output user/profile records. One raw-string diagnostic was rejected by automatic review and replaced with structure-only diagnostics and field-allowlisted extraction; no rejected diagnostic executed. Export-shard CRC verification is not claimed. Each selected vector's768 finite components, model/dimension compatibility and SHA256 of the exact committed title/description were checked. The standby and normal flagship yield identical selected references; standby is not counted as an eleventh visible scenario.

Metric tested: max(0,cos(saved actual-issue RETRIEVAL_QUERY vector, committed reference RETRIEVAL_DOCUMENT vector)). Saved t1 title/description vectors contain no new clarification/context embeddings. Threshold findings apply only to this metric/library. [Inputs](M3-calibration/inputs.json), [reproducer](M3-calibration/reproduce.py) and [full ranks/sensitivity](M3-selection-calibration.json) make this experiment repeatable without an emulator, credentials or network.

## Results

| Scenario | Top reference / score | Chain count | Selection outcome |
|---|---|---:|---|
| D1-01-live | 1 / 0.7842 | 1 | candidate_pass_pending_context |
| D1-02 | 21 / 0.7017 | 1 | candidate_pass_pending_context |
| D1-03 | 32 / 0.7286 | 1 | candidate_pass_pending_context |
| D1-04 | 44 / 0.7324 | 1 | candidate_pass_pending_context |
| D1-05 | 86 / 0.7384 | 1 | candidate_pass_pending_context |
| D1-06 | 82 / 0.7383 | 1 | candidate_pass_pending_context |
| D1-07 | 90 / 0.7639 | 1 | candidate_pass_pending_context |
| D1-08 | 98 / 0.6473 | 100 | needs_clarification |
| D1-09 | 51 / 0.6991 | 1 | candidate_pass_pending_context |
| D1-10 | 97 / 0.7766 | 1 | candidate_pass_pending_context |

Top1 matches the original editorial reference binding for all ten scenarios. This is agreement with the dataset's generation prior, not independent accuracy or proof of context compatibility. Nine chains have one reference; zoning D1-08 has100 and must request clarification under the unchanged rule. Candidate-pass means only the selection cardinality passes; it is not permission to create a public.

For zoning: first scores are .647298 (zoning98), 0.620946 approximately (event market77; see exact JSON), and .6070 approximately (pedestrian zone39). Adjacent small gaps connect the whole library; the final score is .500231. It is a single variance request involving an authority and an intended home office. Selection alone cannot establish whether the wording is unclear or the geometry bridges unrelated cases. Showing all100 as proof the issue is poorly formulated would be misleading.

Sensitivity: keeping floor .30 but reducing gap to .02 selects one reference in every D1 case, including zoning. This is an experimental alternative, not an adopted rule. Increasing the floor to .50 still retains the entire zoning chain; raising it to .70 gives that case no match. The .30 floor excludes no reference in any of these saved D1 rankings, so this dataset cannot calibrate a no-match threshold. The leave-one-out library diagnostic has median99 selected references, but uses DOCUMENT-to-DOCUMENT vectors and must not be counted as a runtime QUERY-to-DOCUMENT failure rate.

## Limits and member-score comparison

No saved vectors exist for the proposed vague/compound/reformulated inputs, and no contextual aspect vectors or approved direct-affectedness predicate exist for mr1. Therefore no real-profile before/after R/E/ISR or changed-membership claim is made. Reusing whole-issue vectors as every aspect, copying example places/roles into D, or choosing an arbitrary social seed threshold would invent assumptions. Selection outcomes are reproducible; full scoring calibration remains gated on those definitions. The twelve Expertise arithmetic fixtures and PD-9 formula checks remain valid arithmetic evidence, not population evaluation.

## Direct-affectedness proposal for review

Represent each aspect's direct_scope_rule as a structured predicate with explicit supporting spans from the actual context: affected role/activity, named workplace/project/group, physical place/anchor relevance where applicable and required known facts. A_j consists of people whose actual profile evidence satisfies this direct rule without X, final public membership or E. Report unknown evidence distinctly; do not infer absent group membership from generic semantic interest. Semantic-only digital affectedness needs an explicit stakeholder rule because existing profile similarity is not evidence of project participation. This is a proposal, not adopted policy or implementation.

Evaluate direct-scope positives/negatives on hypothetical fixtures first (resident vs unrelated owner, named employee vs unrelated worker, participant vs merely skilled developer). Then use the frozen synthetic population to assess coverage, missing facts and changed membership. For X, follow affected people's outgoing edges only, max tie, no creator privilege/reciprocity/self/multihop. No numerical affectedness threshold is proposed by default; if the author prefers an X-free R0 threshold, it must be separately calibrated because current cosine baselines can make that broad.

## Concrete implementation sequence (approval required before runtime code)

1. **Selection/coverage gate:** keep PD-9 .30/.05 as recorded; decide whether to test reformulation first or trial .02 as an alternative. Inspect the proposed ten texts below before any fresh embedding. Do not tune on D1 alone and claim validation.
2. **Pure derivation contract:** freeze retrieval text/model/task/version, tie/boundary handling, contextual rule/aspect schema and direct-scope semantics. Implement exact paired contributions, single education floor, max geography and one-public ISR as pure shared JS/Python helpers; compare against accepted mathematical fixtures. No model call may adjust deterministic weights afterward.
3. **Candidate safety:** evaluate the full synthetic population on a disposable copy first, without top300 pruning or early D/G exclusion. Compare the intended membership against a proven mixed upper bound plus one-step social expansion; introduce optimizations only when no relevant candidates are lost. Retain separately versioned top100 automatic formation/creator/explicit-Join policy.
4. **Server boundaries:** extend Check's immutable draft with reference scores/alpha/library/template/formula/context hashes and aspect/rule provenance. Validate raw and effective schema; distinguish clarification from provider/validation failure. Create reuses the checked result without provider calls; preserve successful idempotent replay. Fallback-publication and mandatory durable-log gates are still pending policies, not silently included in this plan.
5. **Consistency:** wire the same derivation into Create/Join/member caches/tooltips and independent checker; preserve current storage rounding or explicitly version changes. Keep whole-issue duplicate vectors separate from aspect scoring. Binding changes invalidate Create, including late responses and context/pin edits. Old publics retain their original version; no reseed/re-embedding/migration implied.
6. **Acceptance:** required suites/CI, isolated-copy end-to-end cases, full-population membership and per-member comparison, followed by author browser review with exact local link/steps. Open a runtime PR only after the calibration/policy gate and implementation plan are approved. Explicit author merge, then author deploy/live smoke steps.

## Proposed bounded follow-up evaluation (not run)

[Ten exact input texts](M3-calibration/proposed-inputs.json) cover three zoning reformulations, three vague cases, two compound cases and two targeted-context cases. Proposal: embed these ten texts once with the existing embedding model/dimensions/task; **at most10 embedding texts, zero text-generation calls, zero geocoding, zero Firestore writes**. Record actual requests/tokens and any SDK transport retries separately; do not silently retry/spend extra texts. Vague text should be recognized as missing context by future context validation even if embedding geometry assigns high scores; similarities alone cannot judge that. This is a requested new allowance, not covered by the old D1 budget. No dollar estimate is asserted without current pricing.

## Reproduce the completed offline analysis

From Windows PowerShell, after the source branch is available:

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-m3-calibration
python specs/tasks/M3-calibration/reproduce.py
```

This reads committed vectors/library/manifest and replaces only the calibration JSON report. It has no network or database API and needs no key. Snapshot extraction need not be repeated.

## Status log

- 2026-11-16: completed saved-vector selection for ten scenarios plus standby, full ranks/threshold sensitivity and separate library geometry diagnostic. Observed nine singleton chains and zoning100-chain. Prepared explicit coverage limits, direct-scope proposal, runtime implementation sequence and exact ten-text follow-up. Provider calls0, charged texts0, production writes0; no accepted-data changes. Required tests/CI checked before handoff.
