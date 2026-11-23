# Handoff: state and next steps (2026-11-11)

Claude Code wrote this file when development moved to Codex for about a month. The rules for agents are in `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code). Each step below points to its spec, whose Status log holds the details.

**Update this file** when a step is done or the plan changes.

## Current checkpoint: read-only grounding inventory complete, 2026-11-23

- #53 and #54 merged in order; main3dedd1a passed final checks. Author approved the next read-only inventory. Feature codex/values-grounding-inventory contains the no-apply tool, provenance/redaction/pagination tests and [aggregate results](tasks/Values-grounding-inventory-report.md).
- Observed9,151 users,240 nonempty taxonomy payloads (239 recognized layouts and1 malformed),224 recoverable from retained sources,16 unresolved,8,911 without vectorized payload. Only users.uid/values_taxonomy/values_description read; narrative hashed in memory. No full profiles, names/contact fields, source copies, provider calls or data writes. Two explicit project artifacts verified unchanged.
- Of224 verified sources,211 are1.0 and13 historical2.1;68 exact legacy explicit-null payloads remain unchanged. Remaining16:6 grounding metadata,5 missing hashes,2 narrative-hash mismatch,2 source-layout and1 stored-layout problem. Do not invent metadata or regenerate automatically.
- Node253 passed/six skips; Python165 run/two skips;11 new tests also pass without site packages. Final PR checks verified before handoff. Per-profile sanitized evidence stays private under A:/BackUp/isr-mvp/rollouts/grounding-inventory-20261123; only aggregate evidence committed.
- Proposed next scope: metadata-only dry-run tool for224 verified cases, leave16 untouched, then synthetic emulator apply/rollback rehearsal and an author-only live runbook. No live apply authorized. X eligibility/cut decision, relationship flags, C1 #50 and C2 remain separate. Sol Medium is sufficient.

## Previous checkpoint: #53 merged; #54 reconciled for authorized merge, 2026-11-23

- Author instructed merge PR #53, then PR #54. CBC emulator/browser verification #53 merged as7288a63296a66d22afaf374864b49991dd0dd812 after all final Node/Python checks passed. Grounding #54 is retargeted to main and reconciled without implementation/test changes from reviewed158cbeb.
- The new grounding helper, version1.0 finalization and canonical metadata retention are described in tasks/Values-grounding-offline-implementation.md. Reviewed local verification remains Node253 passed/six skips, Python154 run/two skips, seven dependency-free tests and local SDK serialization. Final reconciled-head CI must pass before the already authorized #54 merge; verify main merge-head checks afterwards and save scratch/merge-53-54-receipt.json.
- No deploy, real vectorizer CLI, model request, profile inventory/artifact recovery, database write, regeneration, migration or backfill is authorized by these merges. Existing vectorized profiles have not received overall_grounding. Next data phase needs a concrete field-allowlisted provenance inventory/recovery/backfill plan; never derive missing grounding from domain scores.
- X eligibility cut/marked-carer recovery boundary, relationship flag population, open C1 #50 and C2 remain separate. Main's existing deployment state is unchanged; Sol Medium is sufficient for the integration.

## Previous checkpoint: CBC verified; offline Values grounding implemented, 2026-11-23

- CBC verification [PR #53](https://github.com/SergiiPonomarchuk/isr-mvp/pull/53) targets main7027110 and passed final Node/Python CI. Actual endpoint/independent Python and browser evidence is tasks/CBC-emulator-report.md; both temporary demo services stopped. No deployment/live writes or provider calls.
- Next ordered step is implemented separately in [PR #54](https://github.com/SergiiPonomarchuk/isr-mvp/pull/54), branch codex/values-grounding-offline, stacked on #53: [scope, implementation and tests](tasks/Values-grounding-offline-implementation.md). Pure ten-domain mean; strict metadata validation and raw/map adapters; finalized stage versions1.0; formatter preserves canonical metadata. No change to Public Values aggregation, vector dimensions/content, model/API transport or confidence rounding.
- Required suites: Node253 passed/six skips; Python154 run/two skips. Seven new pure/mocked cases also pass without site packages. Local Firestore serialization accepted the synthetic output without any client/RPC. No real vectorizer CLI, profile-artifact inventory, regeneration, metadata backfill, production operation or deployment.
- Final PR checks are verified before handoff. Merge #53 then its grounding successor only on explicit author instructions. Existing profiles still need a separately reviewed field-allowlisted provenance inventory and recovery/backfill plan; missing gl_cs cannot be invented from scores. X cut/marked-carer recovery decision, relationship flag population, C1 #50 and C2 remain separate.

## Previous checkpoint: CBC emulator/browser verification passed, 2026-11-23

- #51 merged as70749a0, then #52 as7027110; both final main checks passed. CBC verification starts at merged main7027110. Test-only feature codex/cbc-emulator-verification adds actual education vectors and frozen legacy .9-multiplier Join/audit to the opt-in HTTP endpoint test, plus guarded demo-project preview selection and isolated emulator ports.
- [Evidence](tasks/CBC-emulator-report.md): Check/Create109 -> Join110; Bachelor2.400, vocational new1.280 versus frozen legacy1.338; both independent Python audits passed. Actual browser Check/Create/saved/member-list display109 /80% /ISR1.30. Screenshots retained. No application/scoring change, provider/embedding call, real-data operation, deployment or rules change. Temporary demo emulator/preview server stopped; original author documents/serving checkout untouched.
- Required suites: Node252 passed/six optional skips, Python147 run/two optional skips, plus the opted-in emulator test passed. Final PR checks verified before handoff; merge requires explicit author instruction.
- The author's go accepted the ordered CBC verification then overall_grounding work. [Concrete offline grounding plan](tasks/Values-grounding-offline-implementation.md) covers pure mean/validation, pipeline version1.0 and additive metadata retention with mocked tests. Implement separately; do not run a real-data inventory/backfill or vectorizer CLI. X eligibility/cut boundary and C2 remain separate.

## Previous checkpoint: #51 merged; #52 reconciled for authorized merge, 2026-11-23

- Author instructed PR #51 then PR #52. Documentation reconciliation #51 merged as 70749a01bf5cf9a9cb0777ab132f5800d8d72851 after its final Node/Python checks passed. #52 is retargeted to main and reconciled with that merge; application and example content match reviewed head 9817766 exactly.
- #52 removes the issue CBC modifier for new mr1-cbc-table-1 scoring. All 100 examples/library params, worked arithmetic, browser version handling and Python audits are aligned; frozen historical scoring/Join/replay remains supported. The CBC task records local and final CI verification. Merge #52 only after the reconciled head's checks pass; the author has authorized that merge.
- No deployment, migration, rules change, production write or provider call. C:/isr-mvp remains the existing serving checkout with original author edits untouched. CBC changes are not live until an author-run deployment is separately prepared.
- X eligibility/Values metadata specification is merged, but implementation and profile backfills remain separate. The direct-only gate/marked-carer recovery boundary still requires review before X implementation. C1 PR #50 remains independently open; no merge instruction or C2 approval is implied.
- After #52 merges, verify its main merge-head checks and record the final receipt privately in scratch/merge-51-52-receipt.json. Sol Medium is sufficient for this integration.

## Previous checkpoint: CBC adjustment removal implemented, 2026-11-22

- Author approved removal: new scoring uses the existing education-category CBC table only. [Task and compatibility contract](tasks/CBC-table-only.md). Branch codex/remove-cbc-adjustment is stacked on documentation PR #51; merge order is #51 then this change, only on explicit author instructions.
- Removed the factor from all 100 source examples and rebuilt the library offline: unchanged titles/tags/embedding texts/vectors, zero embedding/provider calls. Analyzer/Expertise/PD-9 formulas and four worked tables align with table-only CBC; education mappings/powers are unchanged.
- New policy mr1-cbc-table-1 omits/rejects issue CBC settings. Legacy mr1-context-review-1 issues retain frozen multipliers for Join/audit; completed old Create results replay, unfinished old drafts must Check again. Existing live data is not recalculated or migrated.
- Historical paid approvals/receipts remain immutable and are invalid for this changed policy/library. Their regression tests explicitly use frozen historical context/library fixtures; current-policy tests use real current modules. Prior capacity measurements do not establish new-policy capacity/readiness. No new paid acceptance, production write, rules change or deployment.
- X/Values proposals from #51 remain independent; direct-only gate/recovery boundary still needs review before X implementation. No X flag population, OG backfill or C2 implementation is implied by this task.
- Required test results and final PR checks are recorded in the CBC task before handoff. Author deploy remains a later step; no deployment requested by this implementation.

## Previous checkpoint: documentation reconciled; X/Values implementation plan for review, 2026-11-21

- Author asked to reconcile eight edited docs from the older C checkout onto current main, then specify X flag/schema/versioned implementation. Branch codex/docs-x-eligibility starts at main b8014ac. Draft [PR #51](https://github.com/SergiiPonomarchuk/isr-mvp/pull/51) targets main; reconciliation head 7a20e0f passed GitHub Node/Python CI. Final documentation-head checks are verified before handoff. Original C edits are untouched; the exact eight-file patch/hash snapshot is preserved in scratch/docs-reconcile-20261121. Three-way resolution retains accepted current-main math/examples instead of overwriting them with old documents.
- [Task/specification](tasks/X-eligibility-values-reconciliation.md): confirmed UB<Theta, retained MVP hard D/G/top-300 direct approximation, Values version 1.0, and host-calculated plain ten-domain grounding mean. X direction confirmed child/dependent -> parent/carer; directed Boolean x_eligible and new scoring/candidate/relationship identifiers are concrete implementation proposals, with old issues/replay kept frozen.
- Previous review assumptions (CBC subsequently superseded by the approved removal above): cuts proposed for direct selection only, separate marked-carer lookup and no-hop direct recovery. These assumptions are explicit and require review before coding, not silently asserted as author-confirmed boundaries.
- Values plan adds canonical metadata/Firestore map encoding, deterministic mean and inventory/backfill for every vectorized profile. Current formatter drops meta, so original domain grounding may require provenance-checked recovery. Do not infer grounding from domain scores, run the vectorizer to backfill, or fabricate missing values. No actual profile inventory/backfill has run.
- Documentation/specification only: no application/math/runtime, Firestore/data/import, key/provider, rules or deployment changes. Planned implementation and author-only live apply require later review/approval. Sol Medium remains sufficient.
- Prior C1 [PR #50](https://github.com/SergiiPonomarchuk/isr-mvp/pull/50) remains open with final Node/Python CI passed; no merge instruction received. It is independent of this new formation/metadata policy and must not be treated as its implementation.
- Local required suites: Node 243 passed / six optional skips, Python 145 run / two skips. Original-author-edit hashes, doc links/fences/markers, arithmetic examples and git diff --check pass. Final documentation-head CI is verified before handoff. Merge only on explicit author instruction; current paid counters/evidence remain unchanged.

## Previous checkpoint: Phase C offline design prepared for review, 2026-11-18

- Author approved **Phase C offline design**. [Design, consumer inventory and proposed C1 scope](tasks/M3-generation-publication-design.md) are documentation only on codex/m3-generation-design, based on main 7973380. Draft [PR #49](https://github.com/SergiiPonomarchuk/isr-mvp/pull/49) targets main; design head b8b8557 passed GitHub Node/Python CI. Final documentation-head CI is verified before handoff. No schema/runtime, emulator import, database access/write, rules, docs/, model/paid call or deployment change.
- Ordered merges are complete: #47 -> 19c46e2, #48 -> 7973380. Main Node/Python CI passed; one stalled Node checkout was canceled and that job retried successfully without source changes. Phase A measurements and paid artifacts remain unchanged.
- Proposed approach: private immutable chunks under issue_drafts; validated bounded manifests; one small activation transaction and matching root tokens; full successor generation for Join; all consumers resolve one token. Exact current arithmetic, frozen evidence/replay, zero-X B and no new membership/reference cap.
- Reviewed producer/consumer inventory includes duplicate active catalog/title claims, current browser score-map writers/caches, backend scheduler/tally and Python/recovery. Explicit source/catalog writer fences and stale-client cutover are later live prerequisites; current open writers cannot prove freshness. No live compatibility/performance acceptance is claimed.
- **Next author decision after design review: approve C1 pure offline protocol prototype only** (design section 13). Tiny synthetic fake store, lease/CAS/manifest/replay/source/catalog/race/cleanup tests and byte/inventory evidence; no Firestore/model clients, browser/runtime, rules/import/data writes or application scoring port. C2 emulator implementation, large parity/import and live readiness require later scopes. A design PR merge alone is not C1 approval.
- Sol Medium remains sufficient. Historical totals unchanged: 30 text reviews / 14 embedding texts / 14 POSTs / 44 HTTP attempts, US$1.256788 cumulative reserved. This task: zero provider calls, credential loaders and database operations.
- Local checks: Node 243 passed / six optional skips (249 total), Python 145 run / two skips; design links/source paths/diagram and git diff --check pass. Documentation only; final PR-head CI is verified before handoff. Merge only on the author's explicit PR instruction.

## Previous checkpoint: Phase A offline audit complete; Phase C design decision, 2026-11-18

- Author explicitly approved Phase A and then ordered **merge PR #47, then #48**. Plan #47 merged as **19c46e2c2ec12b4fa476667e1b240855c48a9799**. Audit [PR #48](https://github.com/SergiiPonomarchuk/isr-mvp/pull/48) now targets main; its merge is already authorized and needs no new confirmation. [Full result and limitations](tasks/M3-capacity-audit/README.md), [task/Status](tasks/M3-capacity-memory-plan.md). Previously accepted head c7d6497 passed GitHub Node/Python CI. Final documentation-head/merge-preview checks and the GitHub merge receipt are verified before closeout. This checkpoint records authorization before #48 merges. Application code remains unchanged from 175d6fa; neither deployment nor Phase C work is authorized.
- **NO-GO for compact-only atomic publication across intended reference shapes.** At 9,150 members / 19 distinct calculations, compact Create is 13,793,088 bytes versus the existing 10,452,992-byte request guard. Exact saved admitted-response case compacts to 5,816,909 bytes, but that one synthetic-vector/population shape is not universal or server acceptance.
- 22 matrix/supplement fixtures: 19 complete, three 100-reference large fixtures refused at 120 seconds. Partial current Create/Join measurements retained; unmeasured compact paths are not passes. Peak parent-observed RSS 180.2 MiB; 256 MiB heap / 512 MiB RSS / 120-second / 1 GiB free gates unchanged. No large import; old 6 GiB import gate remains.
- Offline-only codec/member/replay exact equality, actual small-handler envelope parity and streaming/full SDK parity verified. Current Join wire updates are smaller than its conservative full-image guard; guard behavior is unchanged. Report explains token/project/index/server limits and repeated synthetic score shapes. No application, prototype, model/library, math, docs/, persistence, rules, data or deploy change.
- Required verification: Node 243 passed / six optional skips (249 total); Python 145 run / two optional skips. Byte/codec/canonical cohort/resource/network refusals pass. Final PR-head CI is checked before handoff.
- **Next author decision: approve offline Phase C design only** for immutable generations, source freshness, bounded staging/resume/cleanup, atomic activation and consistent readers/tally/Join; later rules/access review is explicit. No design implementation, import, paid call, production write or deployment is implicit. Sol Medium remains adequate.
- Provider calls, database RPCs and credential loader invocations this task: zero. Historical totals unchanged: 30 text reviews / 14 embedding texts / 14 embedding POSTs / 44 HTTP attempts; US$1.256788 cumulative reserved. Existing immutable evidence/approvals unchanged. Do not rerun old preflight over its frozen report, trim members/evidence or raise resource/Firestore guards.

## Previous checkpoint: quotation retest accepted; PR #46 merge authorized, 2026-11-17

- Author explicitly approved US$0.27/two requests and existing loader. The actual retest passed stage resolution and strict domain merge, using submitted-source aspect **repair the entrance lock** with home/building and no repeated question. Coverage: 81 scope proofs + 19 typed domain declarations, reference 1 accepted, all 100 origins retained. [Actual result and limits](tasks/M3-one-case-retest-result.md).
- New reported-token estimate US$0.003079; conservative new reservation US$0.258048, cumulative US$1.256788. Totals: 30 text reviews / 14 embedding texts / 14 embedding POSTs / 44 HTTP attempts. No retry, embeddings, database/scoring/publication/deploy. The two-call allowance is consumed.
- Author explicitly authorized merge PR #46. Its main merge preview matches the tested code tree without conflicts; final-head CI and merge receipt are verified through GitHub. This checkpoint records authorization before the merge; no further confirmation is needed. After that, prepare an offline design for existing full-population storage/atomic-commit and memory blockers; no redesign, import or deployment is implicit. General real-model reliability and full-population acceptance remain unproven. Earlier preparation notes below are historical.

- Author approved preparation after clarification that Gemini Flash-Lite LOW is the application model, not the Codex selection. No setting change required. Branch codex/m3-one-case-retest starts from merged main 816f36a; #44/#45 are merged and main CI passed.
- [One-case task and exact limits](tasks/M3-one-case-retest.md): only compound-lock-software-clarified; source-bound cached input/ranking/library and merged staged prompt v2. Proposed new cap US$0.27, up to two text HTTP attempts, no retries/repair, zero embeddings/geocoding/Firestore/publication/deployment. New maximum reservation US$0.258048. Historical 28 text reviews / 42 HTTP attempts / US$0.998740 reserved remain intact; no old approval is reused.
- Separate one-case manifest approved=false; CLI refuses --apply. The durable runner now recognizes exact one-case/two-call/US$0.27 and legacy two-case/four-call/US$0.55 profiles. Fake installed-SDK tests cover exactly two sends, source/profile drift, old allowance, extra cases, restart and one-send HTTP failure. No private loader or real provider invoked.
- Preparation PR: [#46](https://github.com/SergiiPonomarchuk/isr-mvp/pull/46). Runtime commit 8057fb1 passed Node/Python CI. No paid run has been authorized or started; final documentation-head CI is checked before handoff.
- Required checks: Node 235 passed / six optional skips; Python 140 run / two skips. Final PR-head CI is checked before handoff.
- Old raw responses, hashes, paid manifests and approvals are untouched. No application prompt/math/library/model or validator changes. Offline tests do not establish corrected real-model behavior. Next attention gate is fresh explicit approval of this one-case run up to US$0.27 additional using the existing private loader; earlier Paid-project confirmation remains recorded.

## Previous checkpoint: quotation correction accepted; ordered merges authorized, 2026-11-17

- Author approved the offline quotation correction. Feature branch codex/m3-quotation-contract was stacked on #44/head ae33f7b; #44 is now merged. No paid calls or loader access this task.
- Staged prompt mr1-staged-prompts-2 aligns domain schema and instructions with EFFECTIVE_JSON source quotes and explicitly rejects reference-only labels. Strict validator, schema field/type shape, math, multi-aspect support, model and library remain unchanged. Existing failed response stays rejected; original artifacts match their SHA-256 Git-blob manifest. [Task/evidence](tasks/M3-quotation-contract.md).
- Node 231 passed / six optional skips; Python 140 run / two optional skips. CI is checked on the final PR head before handoff. Old unfinished contracts require Check; frozen published/completed replay follows the existing unchanged path.
- Fix PR: [#45](https://github.com/SergiiPonomarchuk/isr-mvp/pull/45), now targeting main after #44 merged. Runtime head 25689de passed Node/Python CI; final documentation-head checks are verified before handoff.
- Author explicitly authorized merge #44, then #45. #44 merged as 137f7b4517775d75a9efdb37c21151c2b02bf630; #45 now targets main and its conflict-free merge preview equals the tested tree. Final CI and ordered merge receipt are verified through GitHub; this checkpoint records the authorization before #45 merges. No further merge confirmation is needed. No deployment is authorized. Real-model improvement is unproven; old paid plans/approval pins are not regenerated and the four-call allowance remains consumed. Any paid retest needs a precise separate allowance.
- Usage remains 28 text reviews / 14 embedding texts / 14 embedding POSTs / 42 HTTP attempts, conservative cumulative reserved US$0.998740. No model change needed; Sol Medium remains sufficient.

## Previous checkpoint: real two-case pilot stopped safely; offline quotation correction proposed, 2026-11-17

- Author approved US$0.55 additional and existing loader. Real pilot completed four single-attempt requests: clear building repair passes; narrowed mixed issue resolves scope/home correctly but copies a reference title into aspect.text. Validator refuses; no output repair, retry or scores/public. [Actual report and offline proposal](tasks/M3-two-stage-pilot-result.md).
- Current totals: 28 text reviews / 14 embedding texts / 14 embedding POSTs / 42 HTTP attempts. New reported-token estimate US$0.004735; conservative new reservation US$0.516096, cumulative reserved US$0.998740. Four-call allowance consumed, no automatic additional requests.
- Next decision: approve the report's offline quotation-contract correction (accurate EFFECTIVE_JSON wording and explicit reference-title warning), without weakening validation or any paid retry. No runtime/model change has been made. Earlier preparation notes below are historical; fresh paid approval was received and used exactly once.

- PR #42 merged e19bfc0, #43 merged 444e979; post-merge Node/Python CI passes. Author approved preparation, not paid execution, of a two-case real staged review. [Task and exact limits](tasks/M3-two-stage-pilot.md).
- Feature branch codex/m3-two-case-preflight adds an offline plan generator and pure fail-closed guard for D1-01-live and compound-lock-software-clarified, using saved source/input/library/ranking bindings. No new embeddings or changed math/prompts/library. Full dynamic stage-two request must follow validated stage-one output, never the old fixture-only stage.
- Proposed additional cap US$0.55, maximum conservative reservation US$0.516096; up to four text HTTP attempts, zero retries/repair/embedding/geocoding/Firestore calls. Historical 24 reviews/38 attempts/US$0.482644 reservation remain separate and unchanged. No credential-loader access or provider call during preparation.
- Guard is offline only. The durable exclusive receipt/run directory and source-pinned exact SDK transport fuse are implemented and fake-fetch tested. Runner requires fresh plan-bound approval, explicit in-memory key and transport. Private loader has not been invoked. --apply deliberately refuses. Current source hashes are worktree-byte pins; verify/rebind reviewed source only before launch, never silently bypass a mismatch. Semantic/human acceptance remains separate from parser success.
- Draft preparation PR: #44. Final local checks: Node 227 passed / six optional skips; Python 140 run / two skips. No real provider calls.
- Next attention gate is fresh approval covering the bounded adapter/completion and paid run, including use of the existing private loader; earlier Paid-project confirmation remains recorded. No deployment/production permission is included. Sol Medium remains sufficient.

## Previous checkpoint: staged integration accepted; ordered merges authorized, 2026-11-17

- Author approved [emulator-only staged integration](tasks/M3-emulator-staged-integration.md). Branch `codex/m3-staged-runtime`, worktree `A:/BackUp/isr-mvp/worktrees/wt-m3-staged-runtime`, stacked on evaluation PR #42/head `9f4af19`. No merge/deploy is implicit.
- Author explicitly authorized `merge PR 42`, then `merge PR 43`. PR #42 merged as `e19bfc02920fdc04b1134878b050afff4124449b`. [PR #43](https://github.com/SergiiPonomarchuk/isr-mvp/pull/43) now targets main. Its merge preview has the exact tested code tree, with no conflicts; final-head CI and ordered merge are verified through GitHub. This checkpoint records the authorization before #43 merges; GitHub is the final merge receipt.
- New helper uses the selected gemini-3.1-flash-lite with explicit LOW for each stage. Source-backed effective facts own scope/location; complete rule proofs and typed domain judgments merge without changing scoring math, thresholds, retrieval text/library or cap policy. Full raw responses/usage/provenance are retained. New unfinished drafts need the current contract; completed replay and historical Join stay frozen.
- [Evidence and exact human steps](tasks/M3-staged-runtime-report.md). Browser preview at http://127.0.0.1:5190/main.html?emulator=1 with verified Firestore host `127.0.0.1:8189`, project `demo-mr1-preview`, 20 synthetic profiles and fake SDK/vector responses. Agent verified mixed-text clarification -> explicit repair-only answer -> home/20 members/enabled Create. Author continued with `ok, go`; the issue was already created on reopening. Agent opened its member card and verified all 20 synthetic names/ISR 1.00. Read-only stored audit and independent Python checker confirm the public; see the report. Browser member list remains open. Guide http://127.0.0.1:5190/staged-guide.
- Actual isolated handlers verify 109 A/B members, concurrent creation/replay, Join to 110 and independent score audit; separate scenarios cover U6 locations/pin, personal/mixed/vague/clarified text, provenance capacity refusal and downstream-failure receipt retention. Final required suite/CI summaries are appended below before handoff.
- No provider/geocoding calls, secret-loader access/copy, saved-snapshot import, production mutation, rules edit or deployment. Cumulative historical paid allowance stays 24 reviews / 14 embedding texts / 14 POSTs / 38 attempts, US$0.482644 reserved. No paid retry is available under this task.
- Real-model semantic quality and full-population 9,150-person memory/storage acceptance remain gated. Previous four false scope claims remain preserved. Sol Medium remains sufficient. Next action after human feedback must respect these gates; do not automatically deploy or run the paid helper.

- 2026-11-17 continuation: one local issue/public, 20 members and 20 entries in both score maps, one completed draft, two frozen stage receipts, matching model hash; source decision is the repair-only clarification, scope building/anchor home. Agent made no creation/write this turn: the created issue was already present. Screenshot `C:/isr-mvp/scratch/staged-analyzer-members.jpg`. No claim of real-model semantic acceptance.
- No further merge confirmation is needed for #42/#43: their ordered merges are explicitly authorized. After merge closeout, the next attention gate is a precise reviewed allowance/guard for any real-model staged pilot. No new paid call, deploy, production mutation or full-population acceptance is authorized. Do not repeat the completed local browser check as a new approval gate.

- 2026-11-17: Final local verification: Node 220 passed / six optional skips (226 total); Python 140 run / two optional skips; isolated actual-handler and staged location/provenance emulator suites both passed; final focused staged contract tests 10/10 passed. No paid calls or production mutations.

## Previous checkpoint: cheapest model retained; LOW check improves facts, emulator integration planned, 2026-11-17

- Author chose cheapest offered model and directed continuation. Kept gemini-3.1-flash-lite; paired alternative model comparison canceled. Ran one fixed LOW staged check after tested guard and broader native-capacity reservation, within original US$0.50. [Actual report](tasks/M3-cheapest-low-report.md), [quality audit](tasks/M3-evaluation/cheapest-low-quality-review.json).
- Correct home anchor, no repeated choice, reference 1/input quote/default demographics; complete 19-model+81-rule merge. Four false unit/building scope reasons (IDs 9,10,12,15) remain and other reasons are generic. Semantic acceptance withheld; no member scores/public/draft/production write. No output repaired and no runtime blacklist.
- Cumulative **24 reviews / 14 embedding texts / 14 POSTs / 38 HTTP attempts**, US$0.482644 reserved; known reported estimate US$0.036074. This request 2791 input/560 visible/1568 thinking, finish STOP. Current pins and prior receipts match. One-check allowance exhausted; no paid retry or alternate model. Paired research artifacts remain historical, not active work.
- **Next human/scope gate:** approve [emulator-only staged integration contract](tasks/M3-emulator-staged-integration.md), with selected LOW model, server-owned effective facts/provenance, fixed scope/location responsibilities and typed domain reasons. It changes runtime/wire behavior and needs a reviewed spec; no additional paid calls or live changes are requested. Development/handler tests use fake SDK/place/vector responses. Real model truth and human acceptance remain separate.
- Node 209 passed/five optional skips; Python 140 run/two skips before request; final actual-result regression and CI checked before handoff. No active application-model/prompt deployment change yet. Full-population storage/memory blockers persist, draft PR #42; main #41 undeployed, PR #29 separate. Sol Medium remains sufficient; no more model-selection research is needed.

## D1 verified checkpoint (historical; acceptance PR #35 merged)

## D1 live whole-cycle verified, 2026-11-15

- Author completed final Finish Voting and returned the requested To Do screenshot: Emergency Locksmith Service, three unchecked tasks assigned to Christine. Read-only server audit: issue/discussion approved, 28 counted votes, zero exclusions, 31.142 ISR, stored tally matching canonical computation and all three tasks in_process. Management maps cleared.
- Final independent checker: 11 scenario records including hidden standby, ten visible cases, 606 members, zero problems (tolerance 0.00100001). Frozen-plan recheck is phase_advanced_no_write, zero writes; original registration/options/member/cache guards remain valid.
- Rehearsal method disclosed: author-run helper #37 prepared inputs for 27 other synthetic profiles, while creator performed final Start Voting, option vote and Finish Voting in normal UI. This is not evidence of 28 independent human participants. Author performed every production mutation/deploy; agent production writes/provider calls remain zero.
- Final usage metadata: 14 successful Check logs of 15 approved, 131,139 reported text tokens, 14 issue-embedding texts and one logged place lookup of two approved. Successful logs do not count hidden transport retries. No new content generation/profile re-embedding; no further Check needed for closeout.
- Deployment identity: backend 236e7d3; author U11 Hosting update db26dba verified exactly; local helper main a64cb08 needs no deployment. Acceptance PR #35 changes documentation/evidence only. After green final-head CI, next author instruction is **merge PR 35**. Do not merge without that instruction.
- [Final live report](tasks/D1-live-report.md) and [aggregate final proof](demo/live-full-cycle-evidence.json). Private backup `A:/ISR/mvp/dbbackup/d1-20261114-123138` was recovered/verified for all 25,000 typed documents. Live journal/receipts/screenshots stay in `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`; preserve the presentation-started journal. Emulator snapshots and journals remain separate. No reset/reseed or new deployment is required.
- D1 core live AC5 rehearsal is verified; full narrated nine-case tour is not separately recorded. Next development stage is M3 Analyzer guardrails: audit existing validation and prepare a focused policy/spec proposal for author decisions before code. Current prototype access, placeholder Contribution and D-gate limits remain. PR #29 remains separate.

## Helper execution checkpoint (historical), 2026-11-15

Author ran all three reviewed helper stages (start-support one document, option-votes one, finish-support two), with zero-write rechecks. Other 27 profiles contributed 30.142 ISR, below the 30.3006 threshold; each decisive creator input brought support/votes to 31.142. Existing deployed canonical server tally stored the final winner/tasks. No helper phase/date/score/result/task writes.

## Live acceptance checkpoint (historical): U11 live and D1 Join accepted; discussion/options next, 2026-11-14

- Author merged U11 PR #36 as `db26dba`, deployed hosting only, and agent verified all 14 hosted files exactly against the clean deploy checkout, with no-cache. Numeric profile search/adoption succeeded for reviewed synthetic ID 5. This confirms the previously blocked live login route; no further deployment is pending for U11.
- Author explicitly joined the existing flagship and accepted its 101-member screen. Read-only audit confirms one explicit Join event, 101 unique participants and 101 entries in each cached score map. Joining profile has R 0.327 / E 12.692 / ISR 0.599, matching displayed rounding. Independent post-Join checker: 11 records including standby, ten visible cases, 606 members, zero differences.
- Live exact-title/Open/already-member block and genuine paraphrase matching already passed. Successful Check pairs accounted: 14 of 15 approved, plus one logged place lookup of two allowed. Do not use further Checks for discussion/options/voting; those actions require no new AI request. Agent production writes/provider calls remain zero.
- Author reported `options done`. Read-only check confirms both reviewed options, their exact costs/funding/resources and six implementation steps, all authored/assigned to Christine (ID 2). Message count is two (initial registration + comparison message). Phase remains discussion, with no management support yet.
- Actual stored ISR pool is 101.002; management threshold is 30.3006. A deterministic coalition containing Christine plus 27 synthetic members holds 31.142 ISR (30.833%). The selected other members alone remain below threshold, allowing Christine's final normal UI action to cross it. UID/weight plan stays local in `live-coalition-plan.json`; no scores or votes were changed.
- **Next attention gate:** author chooses between manually adopting 28 profiles per stage or preparation of a bounded, reviewed author-run helper for the other 27 synthetic profiles, retaining Christine's final Start Voting/option vote/Finish Voting actions in the UI. Recommended helper preparation needs the author's acceptance of this rehearsal method before implementation. Do not prepare/apply live support implicitly and do not press Start Voting repeatedly as a single profile. No production vote/phase write or additional Check by the agent.
- Full live management threshold, weighted vote, stored winner and assigned tasks remain pending. AC5 is not complete. Successful Check pairs remain 14 of 15; this cycle requires no further AI request.
- All live state/journal reports remain in `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`; preserve its presentation-started `live-manifest.json`. Completed seed rerun was zero writes/requests. Fresh backup/recovery previously matched all 25,000 records. Do not reseed/reset or import emulator data to production. The local port-5002 guide remains emulator-only; both frozen emulator snapshots/runtime remain intact.
- Draft documentation PR #35 holds acceptance evidence and stays draft while AC5 remains incomplete. It is reconciled with U11; CI is checked on the current documentation head. Main/runtime source is unchanged by these notes. PR #29 remains separate.

## Helper pre-merge checkpoint (historical): author-run D1 coalition helper tested; merge next, 2026-11-15

- Author approved preparation of a bounded helper for other synthetic profiles, keeping Christine's final Start Voting/option vote/Finish Voting actions in the UI. Focused [helper spec](tasks/D1-coalition-helper.md) supplements approved D1 section 9. Feature branch `codex/d1-coalition-helper`, worktree `A:/BackUp/isr-mvp/worktrees/wt-d1-coalition-helper`; separate explicit merge remains required.
- Helper is dry-run-first, pins the normal flagship/registration timestamp, reviewed options and six creator assignments, canonical public member weights/cache maps, explicit live/emulator target and selected cohort. It prepares at most 27 noncreator inputs in one transaction per stage. Preserves unrelated inputs; refuses drift, conflicts or premature creator inputs. Never sets creator votes, phases, dates, scores, options, winner or tasks. Normal creator UI and deployed canonical server tally remain responsible for transitions/results.
- Tested actual Python plan/preview/apply route against a masked copy of current live flagship on isolated demo-d1-coalition/8187. Actual frontend creator transaction code executed through a compat-shaped VM/SDK adapter; canonical tally stored option 0, 28 counted votes and three creator tasks. No visual-browser acceptance claimed. Refusal/idempotency/unchanged-registration/public/member/unrelated checks passed and ports closed. Committed-only synthetic fixture also passes. [Evidence](tasks/D1-coalition-evidence.json).
- Required suites: Node 129 passed/four optional integration skips; Python 127 run/two optional skips. Final-head CI is checked before requesting merge. No app backend/frontend/rules/dependency changes, new key access or provider calls. No additional deployment is needed for this local CLI after merge; clean wt-main needs only refresh.
- [Author runbook](D1-COALITION-RUNBOOK.md) gives the staged procedure. Helper PR is #37. Read-only live plan and start-support preview are already prepared and verified: 27 profiles, 30.142 ISR without creator / 31.142 with creator, one proposed document, zero writes. Durable plan `author-coalition-v1.json` is saved with source release provenance; do not recreate/overwrite it. Next author instruction: `merge PR 37`, then refresh wt-main, recheck the existing plan read-only and give the author the full apply command. Every live --apply is author-only. Keep creator last; no automatic phase progression or background voting.
- Live D1 remains discussion phase, two reviewed options/six steps assigned to creator, comparison message present, 101 flagship members and independently validated 606 total members/zero differences. U11 merged/deployed as db26dba; numeric adoption and Join accepted. Exact-title/Open/member blocking and genuine paraphrase checks passed. Live Check pairs remain 14/15 and one logged place lookup of two approved; helper/voting cycle needs no AI call.
- Existing live journal/reports: `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`. Use a separate new `author-coalition-v1.json` for the helper, not informational `live-coalition-plan.json`. Do not overwrite/reset/reseed the presentation-started live manifest. Draft acceptance PR #35 remains separate and must be reconciled after the helper merge; live AC5 still awaits author applies, creator UI actions, final independent check and human winning-task review. PR #29 remains separate. Both emulator snapshots/runtime and original 25,000-document verified backup remain intact.

## Previous U11 checkpoint (historical): U11 profile-search fix ready for review; D1 Join paused, 2026-11-14

- D1 is already author-deployed at `236e7d3`; seed has ten records/505 members and zero differences. Normal flagship was created and its working 100-member list accepted. Agent recorded it locally; independent post-flagship checker: 605 members, zero differences. Author screenshots passed exact active-title/Open/member blocking and genuine paraphrase matching. Live Check pairs accounted: 13 of 15; one logged place lookup of two approved. Keep the existing live journal/report folder `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`; do not reseed, reset or spend another Check while login is blocked.
- Author screenshots showed lower profile search fails for ID 1 and reviewed synthetic full name Michael Sherman (ID 5). Read-only reproduction confirmed: ID lookup fetches its record but name filter removes it; first-token capped queries fetch 107 other candidates and omit the full-name target. Earlier ID/name workarounds were insufficient. Both intended candidates are nonmembers, but the faulty UI prevents adoption.
- Focused spec [U11](tasks/U11-profile-search.md), branch `codex/profile-search-fix`, worktree `A:/BackUp/isr-mvp/worktrees/wt-profile-search-fix`, based directly on deployed main. Repair: exact-ID lookup bypasses only the name filter and supports numeric/string uid; bounded multiword displayName prefixes prevent common-first-name truncation. Gender/profession/age and existing local adoption behavior retained. No registration/auth/rules/scoring/membership/Check changes.
- Validation: five new tests fail on old source; nine focused regressions pass on patched source; all ten focused tests pass when the actual login handler uses masked real emulator queries. Required Node suite 119 passed/three optional skips; Python 120 run/two optional skips. main.js CRLF and lone final CR retained. CI checked on final pushed head. The emulator runtime and production code/data were not changed by this work; no agent provider call or production write.
- **Next author step:** explicit merge of the focused U11 PR after green checks, then author hosting-only deploy from refreshed clean `wt-main`. Provide full PowerShell instructions when the merge is authorized. Recheck hosted files, then search/adopt numeric ID 5 and resume the existing-issue Join test. Do not ask the author to retry the still-broken live search before deployment.
- Draft documentation PR #35 (`codex/d1-live-acceptance`) preserves full live acceptance evidence; reconcile it after U11 merges. D1 live AC5 still needs explicit Join and the discussion/options -> management -> weighted vote -> winner/tasks cycle. PR #29 is separate. Backup recovery previously verified all 25,000 documents, and approved billing/budget remains valid; no additional spending authorization needed within that unchanged ceiling.

## Previous checkpoint (historical): D1 merged; live rollout preparation and recovery PR #28, 2026-11-14

- Author instructed `merge PR 33` and `merge PR 34`; both are merged as `2048912` and `9b9ce79`. Main CI passes. Clean detached deploy checkout `wt-main` is at `9b9ce79`; live still serves U10 `8466b13`.
- D1 emulator AC1-AC4 and the author's winning-task review are accepted. Restored normal preview has 93 issues/205 discussions, 606 validated members and zero differences; disposable test issues are absent. Guide: http://127.0.0.1:5002/d1-guide. Both named seed-start and completed accepted snapshots remain untouched. No new Check/place calls are approved.
- Author said `go` for live preparation. Recovery PR #28 is reconciled with D1 main; binary signed-zero restore/test behavior is unchanged. Only CHANGES/HANDOFF conflicted and both histories were preserved. Required suites, isolated synthetic recovery fixture and current-head CI are checked before requesting **merge PR 28**. No merge is authorized by `go`.
- Read-only live inventory and preliminary dry plan passed: 82 issues, 194 discussions/publics, 3,295 members, 1,696 messages; 276 archive roots, ten scenarios left, zero writes/requests. All ten stored creator fingerprints validated. Live Hosting remains U10 `8466b13` (HTML/lifecycle normalized for CRLF, main.js exact). New [D1 live runbook](D1-LIVE-ROLLOUT.md) gives full PowerShell blocks; metadata evidence: `specs/demo/live-preflight-evidence.json`. Proposed new live ceiling is 15 Check pairs and two place lookups, zero content regeneration/profile re-embedding; not yet approved. Reconciled tests: Node 110 passed/two optional skips, Python 120 run/two optional skips, all six isolated SDK recovery tests passed and dedicated ports released.
- Fresh private live backup is an author step because it includes credential-like profile fields. Agent inspects aggregate manifests/recovery results, not JSONL contents. Use a new live manifest/report folder; never reuse committed emulator `specs/demo/manifest.json` on live. Fresh recovery, exact live archive counts, deployment identity and a separately approved live request ceiling must precede live seeding. The forthcoming D1-specific runbook replaces no historical rollout evidence.
- PR #29 embedding retry utility is separate; D1 rollout does not require rerunning profile embeddings. No production write, deployment, rules edit, secret read/copy or additional paid/model/place request in this preparation. Live AC5 remains pending.

## Previous D1 acceptance checkpoint (historical)

## D1 checkpoint: D1 plan #33 merged; implementation #34 reconciled, 2026-11-14

- The author accepted the winning result and three tasks with "looks good - proceed". Normal flagship creation, duplicate/Open/Join (100 to 101), discussion/options, weighted vote, management threshold, stored winner and tasks have been rehearsed. The independent restored-state checker validates 11 scenario records including standby and 606 members with zero differences. See `specs/demo/full-cycle-evidence.json`.
- Disposable separate-creation UI acceptance passed: same active title remains blocked with explanation; distinct title needs explanation; text and point edits invalidate Check; fresh Check/explanation enables the single Create. Real Create returned HTTP 200 with the explanation. Stored analysis/vector replay kept additional provider calls at zero; no new AI-quality claim. Final screenshot capture was blocked by browser URL verification; backend evidence is retained in `specs/demo/separate-creation-evidence.json`.
- Disposable copy was stopped without export. Normal emulator 8080/5001/5000 and guide http://127.0.0.1:5002/d1-guide are restored. Original 93 issues/205 discussions are present, both disposable test issues absent, accepted flagship remains approved. Frozen completed snapshot: `A:/BackUp/isr-mvp/emulator-snapshots/2026-11-14-d1-author-accepted-7259ca3`, file hashes recorded with acceptance evidence. Seed-start snapshot `2026-11-14-d1-1a242df` remains separate. Do not silently reseed the presentation-started journal.
- Author explicitly instructed `merge PR 33`; plan PR #33 merged into main as `2048912`. Implementation PR #34 now targets main and incorporates that merge without conflicts or application/data changes. D1 emulator AC1-AC4 are satisfied; live AC5 remains pending. Required suites and CI are checked on the reconciled head. Next author instruction after green checks: **merge PR 34**. No implementation merge or live operation is authorized by the plan merge.
- Usage unchanged: ten content requests / 6,694 reported tokens; fifteen Check text requests / 140,377 reported tokens; fifteen embedding texts (about 869 tokens, character estimate); two Nominatim lookups. Check/place ceilings are reached. No further provider calls without explicit new budget approval.
- Required suites on application head `7259ca3`: Node 110 passed/two optional integration skips; Python 120 run/two existing skips. This acceptance closeout changes documentation/evidence only. CI is checked on the pushed head. Active tracked `firestore-debug.log` is generated runtime output and is excluded from commits.
- No production write, deploy, rules edit or secret-file copy. Production remains author-deployed U10 `8466b13`. Live seed/deploy require explicit merges, fresh backup/recovery preflight and a separately reviewed live budget/runbook. Utility PRs #28/#29 remain to reconcile separately.

## Earlier D1 checkpoints (historical)

## D1 earlier checkpoint: D1 real seed verified; human rehearsal review next, 2026-11-14

- Recovery note: the emulator stopped before the completed-cycle export. Restored its saved Voting checkpoint and replayed only recorded option/support inputs with the canonical lifecycle/tally helpers, preserving issue id and original registration time. Recovered final checker: zero differences. Named baseline and request ceilings remain untouched. The original UI result/tasks and the recovered equivalent are evidenced in `specs/demo/full-cycle-evidence.json`.

- Full-cycle update (2026-11-14): 28 counted option votes, no exclusions; locksmith won with 31.117 ISR. After canonical subthreshold support preparation (to avoid further heavy profile reloads), the final normal Finish Voting UI/desktop confirmation crossed 30.9%. Server created three pending tasks assigned to Christine (uid 2); To Do was verified. Independent checker: 606 members, zero differences. No additional AI calls. Evidence: `specs/demo/full-cycle-evidence.json`; proof: `C:\isr-mvp\scratch\d1-winning-tasks.png`. Next human step is final result/task review. Disposable separate-creation rehearsal and live acceptance remain pending; PR #34 stays draft. Earlier pending-cycle checkpoints below are historical.

- Rehearsal progressed: author added the discussion message and both options with Christine assigned to all six steps, then supported Start Voting. Agent added synthetic coalition support through ordinary browser controls; the threshold confirmation showed 30.8%. Stored issue is `in_process`, discussion `Voting`, deadline `2026-11-21`, two options, zero option votes. Post-transition checker: 606 members, zero differences. Canonical geographic/domain display is now also used in Voting/To Do; browser verified Voting 40m/30m and locksmith domain. Proof: `C:\isr-mvp\scratch\d1-voting-ready.png`. Next author step: select an option and press Vote in Christine's Voting view; no new Check. Full-cycle completion remains pending.

- Author authorized D1 and the existing main key loader in memory ("run D1 please"). Worktree `A:\BackUp\isr-mvp\worktrees\wt-d1-guided-demo`, branch `codex/d1-guided-demo`, draft PR #34 stacked on documentation PR #33. No merge is authorized by running D1.
- Generated/reviewed all ten scenario texts, with documented editorial corrections and a successful street/city clarification. Real Check/Create seeded ten records against final P2/A4 population: nine visible cases and a hidden standby, 505 members. Independently checked zero differences; completed rerun wrote/spent zero. Archived 276 old topic roots, preserving 1,696 messages and the historical publics/members by fingerprint.
- Named baseline `A:\BackUp\isr-mvp\emulator-snapshots\2026-11-14-d1-1a242df` was exported and imported into separate Firestore 8286; checker again found zero differences. Companion `seed-manifest.json`, content and verification/checksums are retained beside it. Repository `specs/demo/seed-manifest.json` refers to this baseline; `manifest.json` records the later browser rehearsal. Never silently reseed a presentation-started journal.
- Browser access recovered. Agent verified actual normal flagship creation (100 members), hidden standby exclusion, same-active-title block even with explanation, text invalidation, paraphrase/Open/member status, and an explicit nonmember Join to 101. Post-Join independent checker: 11 records including hidden standby, ten visible cases, 606 members, zero differences. Found/fixed a real detail-card bug: chat now reads canonical issue distances/domain instead of default 100/50. Browser confirmed 40/30 and locksmith domain. Proof: `C:\isr-mvp\scratch\d1-joined-browser.png`.
- Actual usage: 10 content text requests / 6,694 reported tokens; 15 Check text requests / 140,377 reported tokens; 15 issue embedding texts (about 869 registration-text tokens, character estimate); two total Nominatim lookups. The approved Check and lookup ceilings are reached. No more Checks or place requests without an explicit new budget decision. Full-cycle voting on existing records needs no model calls. The first unloaded-handler HTTP 404 remains in recovery history/attempt count; no provider request was dispatched for it. A cached street miss consumed one real Check and was retained before the clarified retry.
- Required suites: Node 110 passed/two optional integration skips; Python 120 run/two existing skips. Earlier isolated D1/U10 real-handler mock-AI integration/race/recovery tests passed. Current actual evidence is [D1 report](tasks/D1-emulator-report.md) and `specs/demo/run-evidence.json`. CI must be green on the pushed final head.
- **Next human attention:** review the local generated scenarios/UI, then the full option -> management coalition -> vote -> result/task cycle using the existing flagship. Guide: http://127.0.0.1:5002/d1-guide. Click flagship creator, open Chat's existing entrance-lock issue, verify the green emulator banner. Do not create/check another issue. The guide has actual option/step text and coalition profile links. Full human cycle and disposable separate-creation rehearsal remain pending; AC3/AC5 are not complete. PR #34 stays draft.
- Full D1 emulator is running on 8080/5001/5000; local guide on 5002. Current review state is exported to this worktree's ignored `.emulator-data`. Saved main data and the original frozen integrated snapshot are untouched. Production remains author-deployed U10 `8466b13`; no production write, deploy, rules edit or secret-file copy. Author-only live seed/deploy still require merges, fresh backup/recovery and a separately reviewed live budget. PR #28/#29 utility dependencies remain to reconcile.

## U9 accepted live, duplicate flow proposal, 2026-11-13 (historical)

- U9 PR #30 merged at `b189d3f`, deployed by the author and checked read-only. The author confirmed the saved member list works and the new Check badge/sample labels behave as specified.
- The author requires Check to show similar registered active issues and offer Join for a nonmember. This intent already appears in the Request Guide. [U10](tasks/U10-similar-active-issues.md) proposes the implementation behavior, matching calibration and acceptance cases. Detailed cap/lifecycle choices await review.
- Next is author review of the documentation proposal. PR #28/#29 remain separately subject to explicit merge instructions. D1 must reflect the accepted duplicate/join flow before its scenarios are changed.

## Live member UI findings fixed on feature branch, 2026-11-13 (historical)

- Live P1/P2, A4 embeddings and the three-public migration passed read-only checks. All 9,150 profile and 20,245 skill vectors are current. All 150 migrated member scores/maps match the Node implementation.
- The author created the live entrance-lock test issue. Topic `46AQ1D2KJu5sAk7sQMli` has 100-entry relevance and ISR maps. The author saw 25 at Check and 100 at Create, then a stuck member popup.
- [U9](tasks/U9-member-preview-popup.md) fixes the preview badge/sample labeling and moves the values helper into shared scope. Cached members render immediately while existing reads run, with stale completion guarded. Regression suites and isolated browser fixture passed. Full application acceptance remains pending deployment.
- Next: open/review U9 PR, merge on explicit author instruction and give full deployment commands from the clean deploy worktree. PR #28/#29 also remain unmerged pending explicit instructions. Agent deployment/live writes remain prohibited.

## Firestore recovery rehearsal, 2026-11-12 (historical)

- Plan and workflow PR #26 merged at `cb8d001`. The preview runs release `47e835a`.
- Recovered all 24,783 documents from the November 7 pre-migration backup on a separate local emulator. Every path and typed document body matched on read-back. See [recovery evidence](tasks/M1-firestore-recovery.md) and [the author's repeatable procedure](LIVE-ROLLOUT.md#2-backup-and-recovery-prerequisite-author).
- Next: merge the recovery branch on the author's explicit PR instruction. The author then chooses the live window, confirms Gemini billing/budget, takes a fresh full backup and rehearses that archive before P1. D1 still depends on the live rollout.

## Integrated release verified; live preparation, 2026-11-12 (historical)

- Follow `AGENTS.md` through ready work without routine approval pauses. The next author action in the approved plan is the merge instruction for PR #26.
- **All implementation PRs are merged:** P1 #25 (`6d252c2`), P2 #23 (`a17d5cd`), A4 #20 (`76c50c8`), U6 #21 (`6b6ae7a`), U8 #22 (`996e7b8`), A5 #24 (**`47e835a`**). Each received explicit author merge authorization. Release tag `isr-mvp-rc-2026-11-12` is pushed; main CI passed.
- **M0 integration is complete.** On merged main: Node 98 passed; Python 105 run, 104 passed and one existing optional skip. Restored/exported data verified: 9,150 profile / 20,245 finite unit skill vectors, 50 canonical E/ISR results/maps, A5 captured replay (3,908 unrelated bypasses removed, 1,033 retained), P1/P2 dry runs with zero changes, and fresh read-only profile/map browser checks. See [release evidence](tasks/INTEGRATED-release-2026-11-12.md).
- **The preview remains running** from clean detached main `47e835a` in `C:\isr-mvp`, Java heap 8 GB. Successfully exported before restart at 2026-11-12 14:20:56 UTC. Named frozen copy: `A:\BackUp\isr-mvp\emulator-snapshots\2026-11-12-integrated-47e835a` (all 8 files, 550,379,033 bytes, hash verified). Do not overwrite this milestone with daily work.
- Read-only live P1 preflight: 9,151 documents / 9,150 complete profiles; **8,803 updates proposed, 0 deletes, 0 missing generation/changed inputs**, 37 existing packs. One extra incomplete profile is retained untouched; `users/None` is absent. No live mutation or model request.
- [Approved development plan](DEVELOPMENT-PLAN.md) and [concrete live runbook](LIVE-ROLLOUT.md) are brought current in **PR #26**. That documentation PR is not yet merged and requires its own `merge PR 26` instruction. Its main reconciliation changes documentation only.
- **Before any live apply:** establish/rehearse recovery of the private full backup; the repo has a typed JSONL backup script but no general restore utility. Confirm the author's execution window and Paid/budget status. The runbook keeps these as prerequisites, not completed steps. Agents do not read backup credential fields or perform live apply/deploy.
- Then the author coordinates backup, P1/P2 live apply, secret/deploy from clean `wt-main`, live embeddings and A4 public migration; Codex verifies read-only. D1 still waits for those approved live prerequisites. Preserve A5 in the code deployment for P2 locality. No live writes, deploys, rules edits or new paid AI calls in this checkpoint.

All earlier checkpoints and original resume commands below are historical; the current plan/runbook govern next work.

## Initial plan approval checkpoint, 2026-11-12 (historical)

- **P1 PR #25 is merged** into main as `6d252c2`; final CI passed. Its live AC4 remains the author's step.
- The author requested and approved the overall and detailed development plan (2026-11-12: "Approved."). [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md) proposes milestones, the remaining merge/release sequence, detailed D1 work, later guardrails/access/pilot stages, estimates, model choices and decision gates. Its execution order is approved; later task-specific design decisions, explicit PR merge instructions and author-only live actions remain as specified.
- **P2 #23 reconciled with main at `0c2f336`.** Only CHANGES/HANDOFF conflicted; both records retained and migration source/data unchanged. Combined tests: Node 47 passed; Python 84 run, one existing optional skip; both emulator dry runs propose zero changes to 9,150 profiles. Verify pushed-head CI and request explicit `merge PR 23`. A4 #20 still needs reconciliation; remaining code order #20 -> #21 -> #22 -> #24. P2's live acceptance/deployment remains tied to A5.
- The A5 preview was restored from the saved snapshot after PR #25 merged. Hosting returned HTTP 200 and functions/Firestore were ready. The serving checkout remains detached at `0ff325b`; do not switch it incidentally. Snapshot remains the 2026-11-12 06:36 UTC export.
- This planning change edits documentation only. No new application code, data migrations, model calls, rules edits or deploys. D1 implementation still waits for its approved prerequisites: P2 applied and A4/U6 live.

## A5 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 22`; **U8 is merged as `996e7b8`**, after P1 #25, P2 #23, A4 #20 and U6 #21. The reviewed merge-head CI passed. No live operations follow automatically.
- A5 PR #24 now targets main and is reconciled with it. Only CHANGES and the index conflicted; all histories and a single current A4 index row are retained. A5 application/prompt/guard/Create behavior, frontend, dependencies, rules, A4 scripts and fixture are unchanged from accepted head `0ff325b`; P1/P2 source/data match main.
- Combined verification: **Node 98 passed; Python 105 run, 104 passed and one existing optional skip**. Saved A5 captured-result and p4 endpoint evidence is `tasks/A5-emulator-report.md`, with the original P2 failure retained. No new model/Nominatim requests or database writes for this documentation reconciliation. CI is checked on the pushed head.
- Next: explicit author `merge PR 24`, then complete the integrated release checkpoint, bring the approved plan documentation PR #26 current and prepare the concrete live runbook. PR #26 still needs its own explicit merge instruction. Do not begin D1 before its live prerequisites.
- Preserve the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 2026-11-12 06:36 UTC saved export and 8 GB Java heap. Final integrated release verification may intentionally export/stop and restart it on the merged release; do not switch it incidentally.
- Live P1/P2 apply, A4 phase D, U8 AC3 and the combined code deployment remain the author's steps. A5 must be included for P2's building locality; D1 waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and original resume commands below are historical.

## U8 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 21`; **U6 is merged as `6b6ae7a`**, after P1 #25, P2 #23 and A4 #20. The reviewed merge-head CI passed. No live changes follow automatically.
- U8 PR #22 now targets main and is reconciled with it. Only CHANGES and the index conflicted. Map/frontend/backend source, dependencies, existing rules and A4 migration code remain unchanged from accepted U8 head `0eddbc6`; imported P1/P2 source/data match main. main.js bytes, including CRLF and the final CR, are retained.
- Combined verification: **Node 91 passed; Python 105 run, 104 passed and one existing optional skip**. Existing map/browser AC2 evidence is `tasks/U8-emulator-report.md`. No new API requests or data writes for this documentation reconciliation. CI is checked on the pushed head.
- Next: explicit author `merge PR 22`; then retarget/reconcile A5 PR #24 to main and verify it. The approved plan documentation PR #26 remains unmerged and needs its own explicit merge instruction when ready. Final integrated release checks follow the code stack.
- Keep the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 2026-11-12 06:36 UTC saved snapshot and 8 GB Java heap. Do not switch serving code incidentally.
- U8 live AC3 and the A4/U6/U8/A5 deployment remain the author's steps, coordinated with P1/P2 live apply and A4 re-embedding. P2's locality acceptance depends on A5. D1 still waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and original resume commands below are historical.

## U6 reconciliation checkpoint, 2026-11-12 (historical)

- The author explicitly instructed `merge PR 20`; **A4 is merged into main as `76c50c8`**, after P1 #25 and P2 #23. All merge-head checks passed. No live migration or deployment follows automatically.
- U6 #21 now targets main. Reconciled main into its feature branch; only CHANGES conflicted. Preserved all task records. U6 application/frontend/location/geocoder code, dependencies, existing rules and A4 migration code are unchanged from the already accepted U6 head `7bbfd45`; imported P1/P2 source/data match main.
- Combined verification: **Node 88 passed; Python 105 run, 104 passed, one existing optional skip**. Existing U6 AC2-AC5 evidence is `tasks/U6-emulator-report.md`. No new model/Nominatim calls, writes or paid acceptance runs are required for this source-preserving reconciliation. CI is checked on the pushed head.
- Next: author explicitly instructs `merge PR 21`; after it merges, retarget/reconcile U8 #22 to main, then A5 #24. The approved plan documentation PR #26 remains unmerged; it needs its own explicit merge instruction when ready.
- Keep `C:\isr-mvp` serving A5 `0ff325b` and the saved 2026-11-12 06:36 UTC snapshot with 8 GB Java heap. Do not switch the serving checkout as a side effect of integration.
- Live P1/P2 apply, A4 phase D and the combined A4/U6/U8/A5 deployment remain the author's steps. P2 building acceptance depends on A5. D1 still waits for P2 applied and A4/U6 live. No deploy, rules edit or production write in this reconciliation.

Older checkpoints and resume commands below are historical.

## A4 reconciliation checkpoint, 2026-11-12 (historical)

- The author approved the development plan in [PR #26](https://github.com/SergiiPonomarchuk/isr-mvp/pull/26), then explicitly instructed `merge PR 23`. **P2 is merged as `a17d5cd`**, after P1 #25 (`6d252c2`). This is source integration, not a live migration or deploy.
- A4 #20 is reconciled with that main. Conflicts were limited to CHANGES, this handoff and the index. P1/P2 source and generated artifacts remain identical to main; A4 source, examples, models, dependencies and existing rules are unchanged by reconciliation.
- Combined verification passed: Node 57; Python 105 run, 104 passed and one existing optional skip. Key-free read-only check: all 9,150 profiles current, 20,245 skill hash keys, no texts/requests needed; phase C has no placeholder publics, updates, new vectors or requests. Existing AC5/AC6 evidence remains applicable. CI is checked on the pushed head before presenting #20. Do not restart paid generation or migration apply.
- Next: explicit author merge instruction for A4 #20, then retarget U6 #21 to main, reconcile/verify it, followed by U8 #22 and A5 #24. The plan documentation PR #26 is still unmerged and also needs its own explicit instruction.
- Preserve the running A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with its saved 2026-11-12 06:36 UTC export and 8 GB Java heap. Do not switch the serving checkout as a side effect of this integration.
- Live P1/P2 apply, A4 phase D and the coordinated code deploy remain the author's steps. Include A5 for P2's accepted building locality. D1 waits for P2 applied and A4/U6 live. No deploys, live writes, fresh API calls or rules edits in this reconciliation.

The checkpoints and original resume commands below are historical; this checkpoint governs next work.

## P2 reconciliation checkpoint, 2026-11-12 (historical)

- The author approved the [overall/detailed development plan, PR #26](https://github.com/SergiiPonomarchuk/isr-mvp/pull/26). Approval authorizes its next implementation work; PR merges still need explicit `merge PR N` instructions. The documentation PR itself is not merged by that approval.
- P1 PR #25 is merged into main as `6d252c2`. P2 PR #23 has been reconciled with that main; only CHANGES and this handoff conflicted, and both historical records are retained below. The P1/P2 generated artifacts and migration code remain unchanged.
- Combined local verification passed: Node 47; Python 84 run, 83 passed and one existing optional skip. Emulator dry runs: P2 9,150 done, 0 to write/held/problems; P1 9,150 profiles, 0 updates/deletes/pending. CI is checked on the pushed head before presenting #23 for merge. Do not rerun migration apply or regenerate content.
- Remaining order: author-approved merge of P2 #23, then reconcile/integrate A4 #20 -> U6 #21 -> U8 #22 -> A5 #24. A4 currently needs reconciliation with main. Retarget stacked children to main after their parents merge and check the resulting heads.
- P2 emulator AC3/AC4 passed on the A5 stack. Its live deployment dependency on A5 remains explicit; P1/P2 live migrations and A4 phase D are the author's coordinated steps. D1 still waits for P2 applied and A4/U6 live.
- Preserve the A5 preview in `C:\isr-mvp`, detached at `0ff325b`, with the 8 GB emulator. Saved export: 2026-11-12 06:36 UTC; the preview was restored after P1 merged. No serving-code change, API calls, data writes or live operations are needed for this documentation reconciliation.

All checkpoints and run-state counts below are historical; this checkpoint governs next work.

## P1 review checkpoint, 2026-11-12 (historical)

- P1 has been rechecked read-only after P2/A4: 9,150 users, zero changes to make, all 20,245 original skill IDs retained. Node 47 passed; Python 70 run with one existing optional skip. No generation or apply rerun. See `tasks/P1-review-report.md`. The author approved PR #25 for merge to main on 2026-11-12 (`merge PR 25`); live AC4 remains the author's step.
- Code PR dependency order: **A4 #20 -> U6 #21 -> U8 #22 -> A5 #24**. Profile migration PRs: **P1 #25 -> P2 #23**; P2's building acceptance depends on A5. All five existing PRs were green and conflict-free against their current bases at this checkpoint. Recheck bases/CI after each authorized merge. Merge only on the author's explicit `merge PR N` instruction.
- A4 phases B/C, U6 AC2-AC5, U8 AC2 and P2 AC2-AC4 are complete on the emulator. P2 AC4 originally found the unrelated-owner inclusion bug; A5 fixes it and passes the recorded replay and fresh Checks. See their branch specs/reports, rather than repeating the old run instructions below.
- **Keep the preview running.** `C:\isr-mvp` remains detached at A5 `0ff325b`, with its backend and U8 frontend. Saved emulator export: 2026-11-12 06:36 UTC. P1 now has its own `A:\BackUp\isr-mvp\worktrees\wt-p1` checkout, so do not switch the serving checkout to P1.
- No merges, deploys, rules edits, live writes or new AI calls were performed for this checkpoint. Live is still pre-A4 code/data; P1, P2 and the A4 re-embedding/deployment must be coordinated by the author after backup. Include A5 in that code deployment. D1 still waits for its specified live prerequisites.

The remaining sections describe the original handoff and historical run state; this checkpoint governs the next work.

## P2 acceptance checkpoint, 2026-11-12 (historical)

**Follow-up:** A5 PR #24 resolves the original building failure described below. Current preview is detached at A5 with prompt p4; its saved export includes both successful repeated Checks. Review code stack A4 #20 -> U6 #21 -> U8 #22 -> A5 #24, plus P2 data PR #23. Emulator remains running. See the updated P2 acceptance report for the passing follow-up.

- A4 saved embedding/migration work is complete (9,150 people current). U6 and U8 emulator checks are complete. Review stack: A4 PR #20 -> U6 #21 -> U8 #22. Nothing merged or deployed.
- Emulator is **running** from `C:\isr-mvp`, detached at U8 `0eddbc6`, with the U6/A4 backend and Java heap 8 GB. Keep the preview available for the author. Latest export **2026-11-11 22:58 UTC**, including the two P2 test drafts/logs.
- P2 dry run: 9,150 done, 0 to write/held/problems. AC3 profile/map passed; garage-owner inclusion passed. **Building-locality AC4 FAILED:** correct h5 point and 130 m cutoff, but 3,908 unrelated flat/house owners bypass it, giving 4,941 candidates in total. See `tasks/P2-acceptance-report.md`.
- P2 AC4 now passes on the approved A5 fixed stack (PR #24): building count 1,033, all 3,908 unrelated bypasses removed, garage behavior retained. Original failure is historical regression evidence. P2 is review-ready; A5 must be merged/deployed with the coordinated release. Do not reapply P2/A4; no data or D/G formula change is needed.
- No live writes, deploys or rules changes. Live migrations remain the author's steps. Older partial A4 counts and stopped-emulator notes below are historical.


## A4 completion checkpoint, 2026-11-11 (historical)

- **A4 phases B and C are complete and saved.** All 9,150 people are current, with 20,245 skill vectors. Two publics (50 members) have real E and ISR; 56 documents were written. Independent checks against `functions/isr.js` and browser checks passed; repeat runs make no changes.
- Final emulator export: **18:34 UTC / 20:34 Kyiv**, `C:\isr-mvp\.emulator-data`, Java heap 8 GB. Imported again and the completed state verified. The emulator is stopped; the main checkout is back on `p1-profile-review`.
- This resume used 229 embedding requests for 22,751 texts (833,512 estimated tokens, approximately $0.13), plus two small phase C requests (preview/apply). See A4's Status log and reports for the complete accounting.
- **Do not re-run A4 phase B or C as a next step.** Next: A4 PR/review, then U6 AC2-AC5 with its own functions (section 3, step 3); P2 AC3/AC4 remain as recorded. Live phase D stays the author's step.
- Drive A was reconnected and readable. All project instructions continue to apply. No live data or deployed code changed.

### U6 checkpoint: 2026-11-11

- AC2-AC5 passed with U6 functions and the completed A4 data. Four location sources, moved-pin invalidation/recheck, forged Create rejection, exact draft-point persistence, logs, cache, geocoding switch and credit verified. See `tasks/U6-emulator-report.md`.
- Ten text and ten embedding calls, approximately $0.0363 at the spec's recorded rates; exactly four external Nominatim lookups. Switch restored to its original absence. Two emulator test drafts for the pin check and one created test issue remain.
- Final export: **2026-11-11 19:15 UTC**, exit 0; re-import verified all final U6 records survived. Emulator stopped; main checkout restored to `p1-profile-review`.
- Next: review A4 PR #20 and the stacked U6 PR; U8 follows U6. P2 browser/Check acceptance remains pending separately. No merges, deploys, rules edits or live writes performed.

### U8 checkpoint: 2026-11-11 (current preview state)

- U8 AC2 rechecked on the full emulator; Node 91 passed, Python 73 run with one skip. Editable and read-only OpenStreetMap tiles, credit, pin movement and profile places verified. No Google Maps requests; no console errors. See `tasks/U8-emulator-report.md`.
- **Emulator left running for the author**, Java heap 8 GB. `C:\isr-mvp` is detached at U8, serving its map code and the verified U6 backend. Keep it running for inspection; do not switch to the pre-A4 P1 branch while serving this preview.
- No database writes or AI/Nominatim calls for U8; the saved data remains the verified U6 export at 19:15 UTC. Temporary diagnostics removed; source is clean.
- Next: review the stacked PRs in order A4 #20, U6 #21, then U8. P2's remaining browser/Check acceptance is still separate. Live U8 AC3 waits for the author's coordinated deployment. Nothing merged or deployed.

### A5 checkpoint: 2026-11-12 (current preview)

- Author approved the locality fix discovered in P2 draft PR #23. A5 is implemented on `codex/local-residential-scope`, stacked after U8 #22. Prompt p4 removes generic flat/house filters at unit/building scope; garage and broader ownership cases retained. Old offending drafts require a new Check.
- Node 98 / Python 73 (one skipped); captured P2 replay and fresh building Check give 1,033 candidates instead of 4,941, eliminating all 3,908 unrelated-owner bypasses. Garage Check 1,391; displayed 25/25 verified owners. P2 AC4 passes on A5. See `tasks/A5-emulator-report.md`.
- Export **2026-11-12 06:36 UTC**, two text/two embedding calls (about $0.00722). Preview remains running from the A5 branch in the main checkout, with the unchanged U8 frontend. Do not switch to older code while serving the preview.
- Review/merge code stack A4 #20 -> U6 #21 -> U8 #22 -> A5; P2 #23's acceptance depends on A5. Coordinate its live deployment with the earlier code tasks. No PR merges, deploys, rules edits, profile migration or live writes performed.

The older partial counts and resume commands below are historical handoff context, not the current checkpoint.

## 1. Where things stand

### main and the live site
- **main:** `39c1998` (PR 19, handoff instructions, merged 2026-11-11). Hosting on live is `f58bf25` (PR 17); PR 18 changed documents only.
- **Live hosting:** main at `f58bf25`, deployed 2026-11-11 06:16 UTC. U5 and U7 are live: every response is sent with `no-cache`.
- **Live functions:** the code from before A4. The old SDK and the retired models mean that Check falls back to the keyword rules and uses a random issue vector, until A4 is deployed (step 5).
- **Live data:** A1b and L1 are migrated (2026-11-09). P1, P2 and A4's vectors are **not** on live yet.
- **Live chat deadlines:** they were set to 2026-12-09 by L1. **Before that date** the author must extend them (step 7).

### The emulator
- **Its saved data:** `C:\isr-mvp\.emulator-data`, last exported **2026-11-11 18:56** local time, with the Java memory at 8 GB.
- **How it got there:** imported from a live export. A1b and L1 were re-applied on 2026-11-10, and **P1 was applied on 2026-11-11** (9,150 users).
- **Also there:** **P2 applied on 2026-11-11** (homes in buildings, property; AC2 passed).
- **A4 in the saved data (18:56):** **2,038 of 9,150 people** have `t1` vectors. Phase B was re-run after the memory fix and stopped by the author at that point. Phase C is not applied. See section 2.
- **Running:** the emulator was started on 2026-11-11 in the terminal tab "emulator 8g", from `C:\isr-mvp` on branch `p1-profile-review`, with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'`. Its functions are that branch's code (before A4). It may still be running; stop it with Ctrl+C, which exports on exit.

### Branches, one worktree each
`wt-*` = `A:\BackUp\isr-mvp\worktrees\wt-*`.

| Branch | Folder | Spec | Done | Next |
|---|---|---|---|---|
| `p1-profile-review` | `C:\isr-mvp` (the main checkout) | [P1](tasks/P1-profile-review.md) | generated (5,097 people), applied on the emulator, AC2 passed | PR to main; on live, the author's AC4 |
| `a4-working-ai` | `wt-a4` | [A4](tasks/A4-working-ai.md) | phases A-C coded; phase A checked with the key (AC1-AC4); main merged in; CHANGES drafted | phases B and C on the emulator; numbers into CHANGES; PR; phase D (author) |
| `p2-homes-and-property` | `wt-p2` | [P2](tasks/P2-homes-and-property.md) | approved; `scripts/migrate_p2.py` and 14 tests; a read-only preview | the real plan, the emulator apply, AC2-AC4, PR |
| `u6-issue-location` | `wt-u6` | [U6](tasks/U6-issue-location.md) | implemented (Node 86 tests); browser checks without the key; A4 and main merged in | AC2-AC5 with the key; PR after A4 |
| `u8-map-tiles` | `wt-u8` | [U8](tasks/U8-map-tiles.md) | OpenStreetMap tiles, on top of U6; AC1-AC2 | PR after U6; AC3 on live |
| `d1-demo-data` | `wt-d1` | [D1](tasks/D1-demo-scenarios.md) | plan approved (decisions 5.1-5.5) | starts after P2 is applied and A4 and U6 are live |
| `u7-live-record` | `wt-u7` | [U7](tasks/U7-page-cache.md) | merged (PR 18) | none; the worktree can be removed |
| `handoff-codex` | `wt-handoff` | this file and `AGENTS.md` | | PR |
| (detached `origin/main`) | `wt-main` | | the deploy copy | refresh before each deploy |

## 2. Done after this file was first written (2026-11-11)

- **P2: done on the emulator.**
  - The real plan was made after P1 and committed (`scripts/p2_generated/plan.json`). The apply wrote all 9,150 people, and a second run wrote 0. AC2 passed, and the emulator was exported. CHANGES is written.
  - **Left:** AC3 (the browser check) and AC4 (a Check of a building issue and a garage issue, with the key), then the PR.
  - A dry run of `python scripts/migrate_p2.py` reports "done 9150, to write 0".
- **A4 phase B: done on 2026-11-11 after billing, but not saved** (see the next bullets).
  - 288 of 9,150 people are embedded. The free tier of `gemini-embedding-001` allows **1,000 texts a day, and every text in a batch counts** (the error names `EmbedContentRequestsPerDayPerProjectPerModel-FreeTier`). The plan had assumed one batch = one request.
  - All texts take about 29 free-tier days, on the emulator and again on live.
  - **Decided by the author on 2026-11-11: option a, billing** on the AI Studio project that owns the key (`C:\isr-mvpunctions\.secret.local`). The author's steps:
    1. https://aistudio.google.com/api-keys → the key's project → **Set up billing** (Billing Tier column).
    2. Choose or add a Google billing account.
    3. Choose a plan: Prepay (at least $5) or Postpay.
    4. Set a **monthly spend cap** of about $5 at https://aistudio.google.com/spend. With Prepay, turn off or limit the auto-reload at https://aistudio.google.com/billing.
    5. Check that the project shows **Paid** (Tier 1).

    The key stays the same.
  - **The expected cost:** about $0.16 for everyone on the emulator (the run report's estimate at $0.15 per 1M tokens), the same again on live, and fractions of a cent per Check.
  - **Billing status:** check "Paid" on the API keys page before relying on it. Until the project is paid, the free limits apply. With billing, every request of this project is billed, the Analyzer's included.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
- **A4 after billing (2026-11-11):**
  - **The comparison** of task types: the approved choice is kept.
  - **The full phase B:** 8,462 people, 27,200 texts, 273 requests, about $0.15; all 9,150 people current.
  - **Phase C:** 2 publics, 56 documents.
  - **Two script fixes** pushed: a retry in the comparison, and the report path across drives.
  - **Not saved:** `firebase emulators:export` then failed with HTTP 500. The Firestore emulator's Java process was at its default memory ceiling (about 4.5 GB of 16 GB RAM, 0.7 GB free), so drive C also fell to 3 GB free as Windows grew its page file.
  - **Later the same day (18:3x-18:56):**
    - The author freed drive C (8.8 GB free), and the emulator was restarted with `-Xmx8g`. With the 11:35 data loaded, its Java process already used about 5.4 GB.
    - Phase B was re-run and **stopped by the author at 2,038 of 9,150 people**.
    - The export then **succeeded** (18:56). The 8 GB memory fixes the export.
    - RAM stays tight: 0.3-0.5 GB free with browsers open (Brave about 4 GB, Chrome about 3 GB). Windows' page file on C has grown to 16.6 GB.
  - **The plan for A4 on the emulator** (billing is active, so there is no daily limit):
    1. Close large programs (the browsers), so the emulator's 5-7 GB fits in RAM.
    2. If the emulator is not running, start it with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'; firebase emulators:start --only "firestore,functions,hosting" --project project-a3d59130-5adf-4677-9e2 --import=.emulator-data --export-on-exit=.emulator-data`, from `C:\isr-mvp`.
    3. In `C:\isr-mvp`, `git checkout --detach origin/a4-working-ai`. Then run `python scripts/embed_people.py --apply`; it resumes with about 7,112 people (about 35 minutes and $0.12). Then `python scripts/migrate_a4.py --apply` (1 request).
    4. `firebase emulators:export .emulator-data --force --project project-a3d59130-5adf-4677-9e2`.
    5. `git checkout p1-profile-review`.
    6. Record the numbers in the A4 Status log and CHANGES, then open the PR.

    Details are in the A4 Status log.
- **The Gemini quota:** the free daily quota was used up on 2026-11-11, and it resets at 08:00 UTC. Every Check uses 1 embedding (one text) and 1 text-model request.

## 3. Next steps, in order

All runs below are on the emulator. In PowerShell, first:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:GCLOUD_PROJECT="project-a3d59130-5adf-4677-9e2"
```

After every step that writes, export the emulator (`AGENTS.md`).

1. **P2 (done up to AC2; see section 2), in `wt-p2`:**
   1. `python scripts/migrate_p2.py --make-plan`. This runs once; then commit `scripts/p2_generated/plan.json`.
   2. `python scripts/migrate_p2.py`: a dry run that writes `specs/tasks/P2-migration-report.md` and the two GeoJSON files.
   3. `python scripts/migrate_p2.py --apply`. A second run writes nothing.
   4. Export the emulator.
   5. AC3 in the browser: the profile and the geotag map show the home on its building, and the property entries.

   AC4 needs a Check with the key, so it runs with step 3. Then the Status log, CHANGES and the PR.
2. **A4 phases B and C, in `wt-a4`** (phase B is partial and waits for the author's quota decision; see section 2):
   0. **Where to run it:** the scripts read the key from their own repository folder, and only `C:\isr-mvp` has it. Run them in `C:\isr-mvp` checked out detached at `origin/a4-working-ai` (`git checkout --detach origin/a4-working-ai`; the branch itself is checked out in `wt-a4`). Write the reports into `wt-a4` with `--report A:/BackUp/isr-mvp/worktrees/wt-a4/specs/tasks/<name>.md`. Then go back with `git checkout p1-profile-review` (or main once P1 is merged).
   1. After the author confirms the project is "Paid": send one tiny embedding request to check the quota. Then run `python scripts/embed_people.py --limit 200 --apply --compare-task-types` again, for the comparison, which failed on 2026-11-11. The 200-person sample is already embedded.
   2. `python scripts/embed_people.py --apply` for the remaining 8,862 people: 288 requests of up to 100 texts, under an hour. It resumes if stopped, at most 900 requests a run.
   3. `python scripts/migrate_a4.py` (a dry run), then `--apply`, for the A1b publics.
   4. Export the emulator.
   5. Put the numbers into CHANGES and the A4 Status log; open the PR "A4: working AI".

   P1 is applied, as phase B needs; P2 does not change the embedded texts.
3. **U6's checks with the key** (AC2-AC5): the emulator must run U6's functions, which include A4's.
   1. Stop the emulator cleanly (Ctrl+C in its terminal saves its data).
   2. In `C:\isr-mvp`, with a clean working tree, run `git checkout u6-issue-location`. This folder holds the key file and `node_modules`.
   3. Start the emulator again from `C:\isr-mvp`.
   4. Run the checks in the U6 spec: 4 Checks, a moved pin, a forged location, the switch. About 8 text, 8 embedding and at most 4 Nominatim requests.

   P2's AC4 (a building issue from a resident of osbb 1, h5) can run here too.
4. **Pull requests, in order:**
   - P1 and P2 at any time;
   - A4, then U6 (merge main into it again if needed), then U8;
   - PR 18 is merged.
5. **The author's live steps,** after the merges. Run them from `C:\isr-mvp` on an up-to-date main: it has the key file and the Python packages. The agent checks read-only after each step.
   1. **Backup:** `python scripts/backup_firestore.py --project project-a3d59130-5adf-4677-9e2 --out A:\ISR\mvp\dbbackup\<date>`.
   2. **P1:** `python scripts/migrate_p1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`. This also rebuilds `user_packs`. Then the agent runs `python scripts/audit_profiles.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live`, which is read-only.
   3. **P2:** `python scripts/migrate_p2.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`, with the committed plan. A person whose live input differs is held and reported.
   4. **The key:** `firebase functions:secrets:set GEMINI_API_KEY --project project-a3d59130-5adf-4677-9e2`.
   5. **Deploy** A4, U6 and U8 together, from `wt-main`: `cd A:\BackUp\isr-mvp\worktrees\wt-main; if ($?) { firebase deploy --only "functions,hosting,firestore:rules" --project project-a3d59130-5adf-4677-9e2 }`.
   6. **Straight after the deploy:**
      - `python scripts/embed_people.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`;
      - then `python scripts/migrate_a4.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`.

      Until the people are re-embedded, S and E compare vectors from two different models.
   7. **The agent's live checks:** A4 AC8, U6's live behaviour and U8 AC3, all read-only.
6. **D1** (the demo scenarios and data), after step 5.
7. **Before 2026-12-09, the author:** extend the live chat deadlines. First a dry run, then:

   ```powershell
   python scripts/migrate_l1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --new-deadline <YYYY-MM-DD> --apply
   ```

   Otherwise the nightly `closeExpiredTopics` (00:30 Europe/Zurich) on 2026-12-10 closes most open topics.

## 4. Later, and known items

- Roadmap stages 4-8 ([ROADMAP-demo.md](ROADMAP-demo.md)).
- Move the HTTPS functions to europe-central2, and upgrade `firebase-functions` and the Firebase CLI (14.1 is installed; 15.x is current).
- The map's marker icons come from `raw.githubusercontent.com` (a GitHub repository, not a CDN), and the shadow from Leaflet 0.7.7 on cdnjs (noted in U8).
- U6: `geocode_cache` and `config` are open to clients under the R0 rules until the stage 5 rules.
- The R0 Firestore rules expire 2027-06-30.

## U10 active-title revision, 2026-11-13

Author approved unique titles among active issues only, allowing reuse of closed/expired names, and one Create action. Implemented all-active title checks with transactional recheck and explanation-driven Create. Full Node/Python and revised emulator tests passed. PR #32 is ready for review after author acceptance of the revised UI. Manual preview refreshed with clean disposable demo data on port 5001/Firestore 8080. No merge, deploy or production write.

## D1 implementation in progress, 2026-11-14

Shared archived lifecycle and UI/task-mock retirement implemented; initial Node regression suite passes. Atomic current-state tally adapter, guarded phase arranger, metadata inventory, durable seed journal and independent numeric checker are under test. Read-only live inventory: 82 issues, 194 discussions/publics, 3,295 members, 1,696 messages, four issue vectors; 112 discussion-only records, no issue-only/public-without-topic records. No production mutations. Real AI content, full-population seed, snapshot and browser acceptance remain pending; do not treat AC1-AC5 as complete.

## D1 code and mocked-emulator checkpoint, 2026-11-14

Archive lifecycle/UI/task-mock retirement, current-state transactional tally, resumable seed/check/content tools, guarded explicit standby promotion, local presenter guide and request ceilings are implemented. [Evidence](tasks/D1-emulator-report.md) distinguishes real handlers/mock AI from unstarted final-population acceptance. The first full tests and D1/U10 emulator regressions passed; final registration/text preservation and full reruns are recorded in the spec status log.

Next: finish final checks/PR, then ask the author before invoking the existing main-checkout key loader for D1. The reviewable runtime passes its result only in private process memory and copies no secret file. Do not use it without that authorization. Then content review, real emulator seed/check/rerun, named snapshot/import and manual full-cycle acceptance remain. PR #33 and implementation PR require explicit merge instructions; approval of the plan does not merge them. No paid calls, live mutations, rules edits or deploys yet.

## Earlier recovery-branch checkpoint (historical)

## Current checkpoint: live P1/P2 and deployment verified, 2026-11-13

- The author applied P1 and P2. Live read-only verification passed. P1 has zero further repairs/deletes/pending/changed inputs, 5,097 repaired work profiles and all 37 packs matching. P2 has all 9,150 profiles on plan, homes on 1,226 building points, zero held/missing/problems, no children owning property and matching packs.
- The author deployed from clean `wt-main` at `a8a9df0`. All five functions are ACTIVE on Node 22. Three AI functions bind the Gemini secret. Live main page, JavaScript, styles and rules match the reviewed release. Firebase config matches the deployment checkout byte for byte, with only line-ending differences from the serving C checkout.
- The API-free embedding preview needs 9,150 people / 29,395 texts / 294 requests. Its report estimates 1,080,590 tokens and about 46 minutes at the script's throttle. Historical configured rate implies about $0.16, subject to current billing. Next is the author's live embedding apply, then API-free post-check and A4 public migration.
- Current reports are under `C:\isr-mvp\scratch\live-rollout-20261112-203337`. PR #28 remains subject to explicit merge authorization. The author requests the simplest, lowest-cost sufficient development model. Sol Medium suits this coordinated rollout.

## Fresh live backup verified, awaiting author P1, 2026-11-12 (historical)

- Recovery PR #27 merged at `a8a9df0`. The author opened the live window and confirmed Paid AI Studio project `isr-mvp-ai-dev` has more than $5 available. An exact monthly cap was not reported.
- Fresh live archive `A:\ISR\mvp\dbbackup\20261112-203337`: 24,884 documents. The first rehearsal exposed a signed-zero change in the disposable emulator's JSON write endpoint. The fix in PR #28 passed read-back of every path and typed field. See [the recovery evidence](tasks/M1-firestore-recovery.md).
- Local rollout reports are in `C:\isr-mvp\scratch\live-rollout-20261112-203337`, including prior deployment identifiers and the P1 preview. The preview found 8,803 updates, zero deletes, no changed/missing inputs and 37 packs to rebuild. The deploy checkout is clean at `a8a9df0` with locked dependencies installed.
- The author runs P1 live apply. Verify its result read-only before the P2 preview, following [the rollout runbook](LIVE-ROLLOUT.md). PR #28 separately needs an explicit merge instruction.

Final local verification (2026-11-22): Node 252 passed / six optional skips (258 total); Python 147 run / two optional skips. All 100 non-CBC reference objects and vectors match the prior library exactly, 12 worked arithmetic rows independently checked, frontend bytes equal exactly two substitutions with CRLF/final CR preserved. No provider calls, database writes or deployments.

Review checkpoint (2026-11-22): [PR #52](https://github.com/SergiiPonomarchuk/isr-mvp/pull/52) targets codex/docs-x-eligibility (#51). Implementation head f3ef66d passed GitHub Node/Python CI; final documentation-head checks are verified before handoff. Worktree is clean after commit. Merge order: explicit author merge PR 51, then retarget/recheck #52 against main before its separately authorized merge. No author deploy step is implied yet.

Review checkpoint (2026-11-23): CBC verification #53 head6240176 passed final GitHub Node/Python checks. Grounding implementation #54 targets codex/cbc-emulator-verification; its final pushed-head checks are verified before handoff. No PR merge or production operation authorized by implementation completion.

Review checkpoint (2026-11-23): [PR #55](https://github.com/SergiiPonomarchuk/isr-mvp/pull/55) targets main3dedd1a. Final local suites and read-only evidence passed; final pushed-head Node/Python checks are verified before handoff. No merge, metadata apply, regeneration or deployment is authorized by this inventory completion.
