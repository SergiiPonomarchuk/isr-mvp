# M3 emulator-only staged Analyzer integration

Status: **author approved 2026-11-17; implemented on codex/m3-staged-runtime, mocked emulator and local Create/member-list checks passed; author authorized ordered merges #42 then #43**. Stacked on draft PR #42. No deployment or paid calls. Model comparison is retired.

## Resulting behavior and contract

1. Keep gemini-3.1-flash-lite and explicit LOW for new context review calls, recording thinking configuration and token usage. Use source-pinned fake SDK responses throughout development/emulator acceptance; no Gemini/embedding/geocoding call or production mutation. A later real-model pilot needs its own precise guard/allowance, not automatic use of remaining money.
2. Implement effective-decision resolution with statuses and literal source fields for chosen decision, affected place/group, scope and location anchor. Treat explicit clarification as narrowing, retain original input separately, keep real contradictions unresolved and personal-help eligibility. Server-owned model/input/schema/prompt provenance is required; client/fixture origin strings and hashes are never authority. fixture_only records cannot be published. Current offline fixture is not an automatic extraction implementation.
3. Validate scope facts before partitioning; centralize the unchanged scope predicate under parity tests. Preserve every raw-chain ID/score and explicit origin=scope_rule proofs. Do not choose a scope from the nearest reference, cap candidates, change weights/thresholds, selection text, embedding templates or the reference library.
4. Scope and location are owned by validated effective facts and existing U6 resolver/pin precedence. The domain model has no scope or location output field to override them. This moves responsibilities; it does not assert stage-one extraction is infallible. Missing factual location/scope stays unresolved and human checks still apply.
5. Domain output uses typed acceptance/evidence or exclusion codes (different_decision, different_affected_group, different_context), with source/reference links and no unrestricted explanatory scope assertion field. Every compatible ID must be explicit. Server audit text must truthfully attribute a **model judgment**, not fabricate an objective topic fact or retrofit an earlier failed output. Missing or invalid reason codes refuse. This changes wire/provenance formatting, not the accepted-set arithmetic; topic judgments can still be wrong and need semantic QA.
6. Merge rule proofs and domain declarations into complete raw-chain coverage; retain immutable original/raw responses, decision/library/ranking hashes and rule/prompt/schema versions. Quote/demographic evidence checks and one-public normalization remain. Non-pass results never yield public scores. Preserve all old responses, including four false scope claims; do not upgrade their evidence by conversion.

## Implementation and verification sequence

- Create a feature branch/worktree for integration, stacked on #42 if it is still unmerged. Keep experiment code and recorded data separate from production modules; add the smallest shared compatibility/decision/provenance contract needed. Never merge without explicit merge PR N.
- Add typed wire schema/projection and fake-SDK tests first. Cover duplicate/unknown/missing IDs, scope-claim field refusal, contradictory/unsettled sources, forged fixture origins, stale/full/partial merges, source evidence and one/two-reference math parity. No brittle free-text phrase blacklist or auto-filled missing exclusion.
- Wire Check/Create/draft cache paths coherently with server-owned versions. New unfinished drafts require current contracts; frozen historical published issues, completed creation replay and Join remain unchanged, with no migration/rescore or rules change. Explicitly account for two Analyzer stages in usage/receipt logs and authorization.
- Run Node and Python suites plus isolated emulator handler parity with fake model/vector/place responses. Verify no outbound model/geocoding requests, no secret copy and no live target. Test original/clarified/mixed/vague/personal-help scenarios and home/work/property/external-place/pin behavior. A mocked response is never labeled real model evidence.
- Verify publication storage/transaction envelopes with review metadata included. The verbose stage fixture is about 124 KB; no provenance may be silently dropped. Existing full-population payload/memory gates must remain refusals until separately resolved; emulator synthetic small fixtures do not prove 9,150-person acceptance.
- Provide a local ?emulator=1 URL with verified Firestore host before writes and exact steps for human review. Show genuine unresolved facts/gaps, not internal implementation jargon. Stop for human judgment before real-model/live acceptance; no deploy or production step follows automatically.

## Acceptance and limits

The local mocked Check resolves explicit narrowing once, personal help has no invented public-only restriction, scope proofs are accurate, all IDs have provenance, domain output cannot impersonate scope/location facts, and old replay stays intact. Tests establish contract/handler behavior, not truthful model reasoning. The model chosen by the author stays unchanged. This task authorizes no paid calls and no active live changes; the author explicitly approved the new two-stage runtime/wire contract on 2026-11-17.


## Status log

- 2026-11-17: author approved emulator-only staged integration. Feature worktree `A:/BackUp/isr-mvp/worktrees/wt-m3-staged-runtime`, branch `codex/m3-staged-runtime`, based on evaluation head `9f4af19` / draft PR #42. Production modules do not import experiment modules; old one-call helper, schema/prompt and recorded model outputs remain available unchanged.
- Implemented two explicit LOW stages with strict duplicate-aware parsing, source-only effective-decision hashes, complete typed verdicts and shared unchanged scope compatibility. Stage-one scope/location feed the existing resolver. Domain exclusions are attributed model judgments. Full original/raw responses, receipt hashes/usage and provenance are retained; Check records completed stages before downstream vector/population work can fail.
- New unfinished drafts bind current staged contract and receipt/projection hashes; old unfinished drafts require Check. Completed replay and frozen historical Join retain their prior behavior. Auto-resolved location changes between Check and Create do not change the text-only decision binding.
- Required suites and isolated fake-SDK emulator results: [implementation evidence](M3-staged-runtime-report.md). No paid generation/embedding/geocoding, key access, deploy, rules edit, production write or full-population import. Actual model quality, human UI acceptance and 9,150-person capacity remain unproven.

- 2026-11-17: Final local verification: Node 220 passed / six optional skips (226 total); Python 140 run / two optional skips; isolated actual-handler and staged location/provenance emulator suites both passed; final focused staged contract tests 10/10 passed. No paid calls or production mutations.

- 2026-11-17: opened draft implementation [PR #43](https://github.com/SergiiPonomarchuk/isr-mvp/pull/43), stacked on #42. Runtime commit `e1acc5d` passed Node/Python CI. Human mock-preview acceptance remains next; no merge/deploy is authorized.

- 2026-11-17 browser continuation: author said `ok, go`; creation was already complete when reopened. Agent verified the opened 20-member list and independently checked stored narrowing/source receipts and public scores. Screenshot and read-only audit are recorded in M3-staged-runtime-report.md. No further paid/live action or merge is authorized.

- 2026-11-17 merge authorization: author explicitly requested #42 then #43. #42 merged as `e19bfc02920fdc04b1134878b050afff4124449b`; #43 retargeted to main with a conflict-free identical code-tree preview. Final-head CI/merge receipt are checked through GitHub. No deployment or additional paid allowance follows from these merges.
