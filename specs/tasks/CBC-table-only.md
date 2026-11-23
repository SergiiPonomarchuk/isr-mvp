# CBC table only: remove the issue adjustment

Author approved the removal plan on 2026-11-21. CBC depends only on the existing education-category table. No issue/reference-level CBC setting, including a direct replacement scalar, is generated or accepted for new scoring.

## Scope and contract

This spec authorizes edits to the 100-example source and derived reference library, Analyzer/Expertise/AI-weight instructions and relevant current decision/component/task documentation. Correct all worked examples and multi-reference notation to use CBC_k only. Preserve credential mapping and power, age floor, experience, rounding, normalization and unrelated X/Values proposals. Do not modify immutable historical reports or approvals.

Implement a new scoring version mr1-cbc-table-1. New context review references omit cbc_adjustment; reference params omit CBC_adjustment_factor. Reject adjustment fields in new-policy bundles rather than silently honoring them. New Checks produce only the new version. Old mr1-context-review-1 issues use their frozen positive per-reference multiplier for Join and Python audit. Preserve old completed Create responses; unfinished old drafts must Check again. Root/bundle version mismatch and unknown policies fail closed. Legacy unversioned issue Join/checkers retain their historical behavior. No production migration/recalculation.

Remove factor generation from legacy Analyzer prompts/local generators as well. Existing legacy arithmetic adapters may keep explicit multiplier support solely for frozen replay; no new policy reads it. Rebuild the 100-example library offline and assert all embedding texts/vectors unchanged; no provider/credential calls. New library hash and scoring policy invalidate stale unfinished drafts.

## Verification

Run Node/Python required suites. Add meaningful coverage for table-only scoring across credential categories and multiple aspects, rejection of adjustments/new-policy malformed or unknown versions, old non-neutral multiplier Join/audit parity, policy mismatch and old draft replay/recheck. Verify all 100 JSON blocks lack the field and derived params match the source; embedding texts/vectors unchanged. Use pure fixtures/fake dependencies only; optional emulator tests are recorded separately. No live writes, deployments, rules edits or paid calls.

## Status

- 2026-11-21: plan approved; implementation started on codex/remove-cbc-adjustment, stacked on documentation reconciliation PR #51. Zero provider calls/tokens and database operations.

## Implementation and verification (2026-11-22)

- New policy mr1-cbc-table-1 is dispatched through context review, Check/Create, member evidence and Join; Python independently routes current and legacy arithmetic. Current references reject adjustment/replacement fields. CBC category mapping and education power are unchanged; the historical Course/Certificate versus College discrepancy is not silently resolved.
- All 100 source examples omit the factor. Offline builder retained all 100 vectors/texts; library source hash updated. Exactly the factor is removed from each reference's numerical params; no other anchors retuned. Worked tables recomputed from declared inputs using category CBC only.
- Historical paid preflights refuse current policy/library. Their success/transport regression tests install an opt-in per-test-process frozen validator plus exactly reconstructed original library, protected by its original canonical hash. Historical approvals/receipts are not edited or repinned. New-policy tests never install this fixture. The old admitted-capacity worker now refuses changed-library execution; prior capacity reports are unchanged and do not validate new-policy capacity.
- Browser recognizes both scoring versions for uncapped member totals and server Values preview. Its two exact substitutions preserve CRLF and final lone CR. D1 checker routes both mr1 versions to the independent auditor and refuses unknown versions.
- Node/Python suites and new CBC compatibility tests are recorded below after final execution. Zero provider requests/tokens, embedding requests, Firestore RPCs or data writes; pure/fake fixtures only. Six optional Node integration tests and two optional Python tests are not emulator/browser acceptance.
- PR is stacked on documentation reconciliation #51. Neither merge nor deployment is implicit. The C serving checkout and its eight original edited documents are untouched.

Final local verification (2026-11-22): Node 252 passed / six optional skips (258 total); Python 147 run / two optional skips. All 100 non-CBC reference objects and vectors match the prior library exactly, 12 worked arithmetic rows independently checked, frontend bytes equal exactly two substitutions with CRLF/final CR preserved. No provider calls, database writes or deployments.

Review checkpoint (2026-11-22): [PR #52](https://github.com/SergiiPonomarchuk/isr-mvp/pull/52) targets codex/docs-x-eligibility (#51). Implementation head f3ef66d passed GitHub Node/Python CI; final documentation-head checks are verified before handoff. Worktree is clean after commit. Merge order: explicit author merge PR 51, then retarget/recheck #52 against main before its separately authorized merge. No author deploy step is implied yet.

## Authorized integration (2026-11-23)

Author requested PR #51 then #52. #51 merged as 70749a01bf5cf9a9cb0777ab132f5800d8d72851 with checks passed. Retargeted #52 to main and merged origin/main into its branch without content changes. Application/library/frontend and test content remain identical to reviewed 9817766; only integration status documentation changes. Required local suites and final reconciled-head CI are verified before the authorized #52 merge; main merge-head checks are then verified read-only. No deploy or data operation.

Reconciled local verification (2026-11-23): Node 252 passed / six optional skips; Python 147 run / two optional skips. Reviewed source/examples/frontend/test content exactly match 9817766. Final pushed-head Node/Python CI and subsequent main merge-head checks are verified before reporting completion.
