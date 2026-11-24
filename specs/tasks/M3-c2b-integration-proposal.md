# C2b proposal: application readers, lifecycle and browser integration

Date: 2026-11-24. Reviewed main **d7f5c3058789237fbbee86475eeddc352e4a047c**, merged PR61; merge-head Node/Python CI passed. Author requested preparation of this proposal. **Implementation and emulator/browser execution are not yet approved.** This document changes no application code, schemas, rules, data or docs/ files.

Parent: [publication design](M3-generation-publication-design.md). Prerequisite: [C2a implementation](M3-c2a-emulator-publication.md), [evidence and limits](M3-c2a-evidence/README.md). C2a proved22 tiny SDK scenarios, including a real conflict/retry, but its wrapped roots are not application records and its phase command is not a voting lifecycle implementation.

## 1. Recommendation and scope to approve

Implement one default-off **emulator-only consumer integration** in three internal milestones below. Use the actual prototype/main.html renderers/cache pathways and shared Lifecycle/ISR decision functions, connected to a new strict publication adapter and server commands. A separate lookalike demo page does not satisfy browser acceptance. Keep legacy formats and their completed replay behavior on their existing paths. No production format rollout or numerical formation/scoring port is included.

Use only2/7/17 precomputed synthetic members, at most two explicit successors per issue (maximum19 members), supplied reviewed context/results and a closed fixture catalog. Check is a clearly labeled fixture response, not an Analyzer run. Supplied successors are fixture results, not evidence that real Join scoring or renormalization is integrated. No Gemini/provider calls, credential loader, geocoder, population import, vector generation, profile adoption queries or backup restoration. Source policies such as X eligibility/top300 remain separate, unchanged and unclaimed.

Sol Medium is sufficient for the proposal and this bounded implementation. No application Gemini model change or paid allowance is needed.

## 2. Refreshed consumer inventory

Anchors below refer to d7f5c30, not the older line numbers in the parent design. Before coding, repeat the search across production helpers, migrations and tests for participants/isr_scores/relevance_scores/mr1_evidence/social_links and public/member collection queries. Keep a disposition for every match: adapted, explicit legacy-only guard, or outside this disabled experiment with a recorded live blocker. No unchecked consumer may silently handle new records as legacy.

| Current source | Dependency / required change for the proposed format |
|---|---|
| functions/mr1-service.js:22,88,91,102-123 | Check/Create, root maps, flat members and completed creation_result. Keep production producer unchanged; add an isolated fixture producer with pending/status, complete result pages and frozen replay. No paid receipt regeneration. |
| functions/join-issue.js:44,57,98-105 | Flat members and map rewrites. Keep legacy Join; new fixture branch uses a complete private successor, expected base/phase and once-only intent/event. No new member cap. |
| functions/similar-issues.js:63,83,106-108 | Active matching/title keys, maps/participants for already-member, issue/vector scans. Feed complete fixture catalog and generation membership through an adapter; preserve matching/review rules and top-five presentation. |
| functions/lifecycle.js:122,135,159,211,231 | Pool, voting/management/deadline decisions and map-copying votingIssueFields. Preserve pure rule functions; new-format transition projections carry generation references, never legacy shadow maps. |
| functions/close-voting.js:13-57; functions/index.js:130 | Approved trigger reads flat membership and later creates tally/tasks. Add explicit format dispatch: new format recognizes only a validated complete outcome receipt; missing receipt refuses. Legacy behavior unchanged. |
| functions/deadlines.js:17,49-120; functions/index.js:145 | Legacy member read/preparation and phase writes. New dispatcher prepares from pinned membership/revisions and checks them again before publishing outcome/phase together. Exercise the plain handler, not an actual deployed schedule. |
| prototype/js/main.js:2246,2263,2867,3544-3658 | Message-author scores, assignees and management. Use cached selected-generation rows and server decisions; never accept caller weights. |
| main.js:3860-4535,4353 | Chat/voting/task views and direct option-vote transaction. Route proposed format through consistent cache bundles and backend commands; preserve legacy branch. |
| main.js:5661,5849,6010,6157 | Check/Create, membership display and Join. Pending is not success; complete paged replay/count/membership must agree. Refresh/resume never starts paid work. Reverify these anchors during implementation. |
| main.js:7827-7831,7885,8650,8721-8777 | Other-profile issue lists, dashboard caches and listeners. Add complete published-catalog discovery, tagged viewer/member pages and coverage/continuation; no dependence on flat participant queries for new format. |
| scripts/mr1_check.py:166-173; scripts/check_demo.py:73-127 | Assume maps/flat members and legacy tally provenance. Existing audit must explicitly refuse new format before legacy interpretation. Add a separate fixture publication/tally reader, not a false full MR1 audit. |
| functions/tools/close_expired.js and author demo/migration helpers | New-format records require an approved adapter or refuse before writes. Inventory actual helper paths before changing them; this proposal runs none. |
| scripts/backup_firestore.py, restore_firestore.py; firestore.rules | No change/run in C2b. Recursive recovery and enforced access/client cutover remain later gates. |

Current Lifecycle rules remain authoritative: management support and voted share thresholds, valid-option exclusions, tie handling, date extensions, inactive/reactivation and task ownership. Preserve JS key enumeration/addition order, tie tolerance and existing round locations by calling current pure functions with a complete tiny selected-generation input. No new scoring formula follows from older skill shorthand; accepted task specs/current engines remain the scoring authority. Large-population bounded arithmetic is C3, not demonstrated by reconstructing a tiny in-memory map here.

## 3. Proposed format, adapter and authority

Introduce a strictly parsed experimental publication_version **c2b-emulator-1**, separate from scoring_version. Precomputed fixtures explicitly declare fixture provenance; do not label them as outputs of the real MR1 engine. Do not reinterpret C2a prototype_version wrappers as normal issue documents. Reuse the typed private artifact codec/protocol where appropriate; retain old reports and C2a target/refusal regression coverage. Any shared-boundary refactor must rerun affected C2a tests, not weaken its target checks.

Bounded application-shaped roots expose title/topic, description, classification/context summary, current status/ends, public ID, member_count and an exact publication token. The token binds issue ID, active build/generation, manifest digest, publication epoch and format. Discussion/public mirrors match it. Phase, options, votes, management choices, tasks and conversation have separate explicit revisions. Immutable member/context/values/replay evidence stays private. No full isr_scores/relevance_scores/participants shadow arrays are stored on new-format roots.

One adapter supplies header, viewer/UID row, stable rank/directory pages, assignee search, author-score lookup, values/context and historical replay. Every response/cursor binds issue, generation, digest, epoch, format and order/filter. A private path or arbitrary build ID grants no read permission. Only a validated complete published generation, or explicitly labeled previously published historical view, is readable. Missing/unknown/corrupt metadata refuses rather than returning an empty public or falling back to legacy.

New-format discovery walks a bounded **published fixture catalog**, checks selected-generation membership and merges legacy results by issue ID. Complete coverage is explicit: loading/continuation cannot mean no more issues. Catalog/title claims and relevant legacy fixture writers participate in one revision fence. No dynamic real-source freshness or actual production catalog coverage is claimed.

## 4. Commands and lifecycle consistency

Commands accept an operation ID, fixture-selected actor UID, expected publication token and relevant phase/vote/options/task revisions, plus the user's choice/content. Reject client scores, pool, winner, source receipt and unvalidated paths. Synthetic sessionStorage identity is a test identity, not authentication. Every command verifies current membership/phase and computes decisions server-side. Idempotency records bind operation/actor/issue/content; same-key different-content refuses.

| Command group | Required behavior |
|---|---|
| Fixture Check/Create/status/replay | Fixed supplied Check result; pending until activation; durable operation survives reload/response loss. Frozen original complete response pages remain unchanged after Join/closure. Real MR1 producer/API behavior is unchanged when disabled. |
| Join | Same issue/UID coalesces; already-member is a no-event result; another UID gets explicit busy/rebase. Publish the whole supplied successor with narrow masks preserving options/messages/management choices. Join remains chat-only and does not automatically execute a management action. |
| Management/deadline | Preserve existing choices and Lifecycle decisions. Support stores person/choice only; resolve current generation weights. Join-vs-start/deadline shares a control/revision fence. Start Voting freezes the selected generation for that voting round. |
| Option proposal/edit, vote, back to chat | Keep existing eligibility/edit restrictions, valid-option handling and vote-clearing rules. A changed relevant revision invalidates stale requests. Preserve historical round references when returning to chat; later Join uses the then-current generation. |
| Finish/deadline tally | Outside the final transaction, prepare exact complete tally evidence/winner/tasks using the pinned round, votes and option revisions. Validate and seal bounded outcome pages. Final transaction checks all bindings, then publishes phase, winner/tally/task reference and matching summaries together. No visible To Do without complete tasks. |
| Task/message/reaction actions | Preserve present assignment, task completion/cancel/breakdown/comment and message/reaction semantics. Changes enter through a backend dispatcher with relevant revisions; message edits cannot be overwritten by Join. Unsupported combinations explicitly refuse rather than using legacy direct writes. |

The production approved trigger dispatches by format. For the experiment, call that same plain dispatcher with duplicate/reordered synthetic events; a complete new-format outcome is an idempotent no-op, missing/inconsistent receipt is refused, and it never invokes the flat-member tally. Scheduler tests call the same format dispatcher with a frozen Europe/Zurich date. No Cloud Scheduler or functions emulator is required, and index.js/secret declarations are not loaded by the local harness.

Preserve ISR.tally's sorted voter iteration and Lifecycle.pool's key iteration, valid/excluded vote evidence and legacy rounded display/task outputs. Prepare large decisions outside final transactions, with complete generation/revision bindings. Final transactions contain only bounded controls, narrow updates and validated outcome pointers; no full-directory scan or AI call. Actual request bytes/masks/transforms are measured. Staging never triggers normal lifecycle work.

## 5. UI/cache behavior and human acceptance

Use actual dashboard/detail/member/assignee/management/voting/task paths in prototype/main.html with a default-off adapter. Listener-driven synchronization assembles a complete tagged bundle before replacing visible state. A newer root cannot combine with old viewer scores/pages; late responses are discarded. Until ready, keep the last complete view labeled as updating, or show loading and disable mutations. Do not render stale content as current.

Existing cached data is used on click. A page/search cache miss schedules an adapter request through the cache controller and renders loading; no ad hoc direct Firestore click-query or hidden DOM rewrite. Every member remains reachable over stable pagination/search, including the last row and both explicit successors. First page size is not the count. Changing the adopted test UID invalidates actor-specific caches and operation bindings. Names/profile context come only from the tiny fixture adapter, not queries of actual profiles.

Show ordinary Checking/Creating/Joining/Updating wording, clear recheck/retry/refresh reasons and no implementation jargon in user flows. Preserve cancellation/unsaved-form behavior. Unknown versions and old expected tokens refuse through the backend. An unmodified cached old script can still bypass a version-aware dispatcher using today's open rules: demonstrate/document that limitation on the disposable fixture; do not claim the C2b stale-command test solves old direct clients or permits live rollout.

After automated checks, provide the author a concrete local URL, seeded identity and numbered checklist: pending/reload; full member list/last page; Join/count/viewer score consistency; duplicate/open/join path; proposal and management; weighted voting; winner/tasks; cache refresh/error recovery. Agent runs objective browser checks first. Human review is for clarity and usability, not developer-console diagnosis. Only provide the URL once the preview exists, with its verified expiry/shutdown instructions.

## 6. Isolated environment and proposed path exception

Propose a new disposable **demo-c2b-integration** project. Firestore127.0.0.1:8080 (matches the AGENTS browser write check), hosting127.0.0.1:5800, plain loopback API127.0.0.1:5802, hub44893/log45893/websocket9153. Check ports before starting; do not stop another emulator or choose a live fallback. If8080 is occupied, report it and resolve the setup before any write. No saved export/import. Existing firestore.rules loaded byte-identically; no rule change.

Gate browser startup on all of: local host/port5800, explicit emulator fixture mode, Firebase projectId demo-c2b-integration, Firestore host127.0.0.1:8080 and the local API's matching fixture handshake. A query parameter alone is insufficient. Before each browser write sequence, inspect firebase.firestore()._delegate._settings.host and projectId programmatically. The local API/SDK requires exact project/emulator environment and a fresh marker; allow only loopback connections to the enumerated services. Missing configuration refuses; never load an API key/credential loader or initialize a production client. Firebase v8 Compat remains the browser interface.

The fixture-only server mounts plain application adapter/command handlers with injected local SDK/source/catalog/time dependencies. It must not import the production index merely to get handlers, start secret-bound functions, or contact Gemini/Google credentials. Static hosting serves the actual feature-worktree prototype files. Keep the original C serving checkout and accepted emulator snapshot untouched.

C2b implementation approval must explicitly include this provisional **read/write exception** to the older Firestore skill matrix, only for this fresh demo environment:

- issue_drafts/c2b_{fixture}/controls/{source|catalog|day}, intents/{id}, locks/{id}, titles/{hash}, catalog/{id}, commands/{id}, outcomes/{id}, placeholders/{id}, events/{id}; bootstrap issue_drafts/c2b_bootstrap.
- issue_drafts/c2b_{fixture}/publication_builds/{build}/nodes/{node} and its build control; bounded outcome nodes below outcomes/{id}/nodes/{node}. All IDs/segments and fixture allowlists are validated before SDK use.
- issues/c2b_{fixture}_{id}, discussions/c2b_{fixture}_{id}, microcommunities/c2b_{fixture}_{id}; bounded discussion message documents under discussions/c2b_{fixture}_{id}/messages/{id} only if needed by the real message UI.

No users, values, user_vectors, actual issue_vectors, flat microcommunity_members, real topics or unknown roots. Root enumeration to verify the empty fixture database follows the same bounded C2a bootstrap pattern; no document content from unrelated roots is read. Legacy regressions use the existing offline/fake-store suites; minimal legacy-shaped catalog records may be seeded under the same fixture prefix for mixed discovery/title tests. Do not run legacy flat-member/profile writers against this emulator; all other DB paths are refused. Identity/name lookup is fixture-backed. New physical paths or any broader source import need a separate decision, not implicit approval.

## 7. Finite limits and internal milestones

Keep C2a's installed-SDK measurements and limits as starting ceilings:16 writes/16KiB encoded CommitRequest,512KiB document,600 documents/1024 discovery steps per callback, at most3 SDK attempts,512 commands/operations and8MiB attempted commits/1024 commits per fixture process. Pin whole-operation/per-job budgets durably; process-local counters are not distributed quotas. Preflight the application-shaped fixtures with the actual SDK serializer before any emulator writes. If a new supported shape does not fit, stop for a concrete segmentation/scope decision; do not raise limits or discard evidence to pass.

Tiny maximums for this proposed experiment:19 members,4 options,16 total task/subtask nodes,4 steps per option,4 task breakdown levels,32 messages,32 total task comments/reactions per fixture,2KiB per submitted text field,64KiB HTTP body/response and at most8 records per page. These are experimental admission/refusal guards, not changes to legacy app limits. Measure worst-supported shapes; refuse oversized values atomically. No infinite polling/retry or growing arrays without byte/work checks.

Automated Node workers retain256MiB heap/512MiB RSS/120s per child and at least1GiB free before start. Separate independent fixtures may run in fresh bounded children; do not split a failing single operation merely to evade its guard. The local preview helper has a finite15-minute watchdog and no scoring work; this is a helper lifetime, not an increased application-operation time/resource gate. Browser memory/time is separately reported, not counted as Node capacity evidence. Stop only identified helpers and verify ports close after checks; a human preview needs an explicitly communicated remaining lifetime.

| Internal milestone under one implementation approval | Exit evidence |
|---|---|
| B1: format/adapter and producer contract | Exact fields/paths and finite budgets pinned in an implementation spec before code; offline serializer and completeness/version/cursor/legacy guards; fixture pending/Create/Join and published catalog tests. |
| B2: shared backend lifecycle consumers | Management/options/votes/deadlines/closure/tasks/messages use complete pinned data and relevant revisions; exact pure-function oracle comparison, real SDK conflict/retry, lost-response/idempotency and no partial To Do. Trigger/scheduler/helper dispatch cannot fall into legacy handling. |
| B3: actual UI/cache/browser and review | Objective browser checks of real renderers/cache transitions, pagination/last member/assignees/other-profile lists, stale response discard and failure recovery; unchanged legacy regressions; source-pinned report and author usability checkpoint. |

Continue between these milestones without new permission when implementation is approved. Ask only for a material behavior/spec conflict, changed path/budget, human judgment or model change. There is no approval to implement any of them from this proposal-writing request alone.

## 8. Acceptance and evidence checklist

1. Format/target guard: default-off/unknown/missing/mixed publication metadata refuses; wrong project/host/API handshake or occupied target never falls back. Current C2a exact target tests remain valid.
2. Complete readers: all2/7/17 members and successors reachable; exact names/order/scores/metadata across pages/filters; corrupt/missing/invalid-UTF8 payload and stale cursor refuse. Current counts/viewer/author scores/ranks/assignees share one token; old published views are labeled historical.
3. Asynchronous operations: pending is not success; reload/transport loss resumes stable IDs and complete frozen creation replay. Same-UID Join produces one event; distinct Joins serialize/rebase; options/messages survive Join; no paid recheck.
4. Decisions: compare full chosen-generation inputs and exact outputs to existing Lifecycle/ISR functions for thresholds, no ISR/invalid options, ties, extensions, cancel/reactivate, back to chat and winner task ownership. Compare sequential addition/rounding, not only approximate totals.
5. Races: real SDK/HTTP tests for Join vs Start Voting/deadline/cancel, vote/options vs finish, duplicate/reordered trigger and stale task commands. Bind/recheck all revisions; either winning serial order is valid, mixed generations or partial outcomes are not. Controlled-clock cases are labeled; no distributed-clock claim.
6. Discovery/duplicates: staging excluded; complete fixture catalog coverage, active-title uniqueness and changed-catalog/date recheck; top-five suggestion behavior unchanged; already-member uses selected generation, not legacy maps. Legacy fixture titles also participate.
7. Browser/cache: reordered root/mirror events and delayed pages never mix count/weights; adopted-UID change clears private actor caches; last page accessible; explicit continuation for catalog; supported task/message actions and errors work on actual application UI.
8. Compatibility: legacy Create replay/root interpretation/voting/task/deadline tests unchanged. Explicit new-format refusal in unaudited legacy writers; approved trigger never silently tallies an empty flat public. Stale version-aware commands refuse; unmodified old direct-writer limitation remains recorded as a live blocker.
9. Isolation/resources: actual paths and installed-SDK request/document/mask/transaction-byte lengths, reads/writes/retries/command counts, per-operation work/RSS/time and refusals saved without secrets. Existing private rules denial verified; existing open public access documented, not claimed fixed. No production/provider/loader calls; accepted exports/reports unchanged.
10. Final checks: required npm test and python -m unittest discover -s tests; focused and independent fixture tally checks; git diff --check and source/policy/format hashes; CI on the final PR head. Record helper shutdown/ports, browser evidence and exact author preview steps in the handoff. Author explicitly merges any implementation PR.

## 9. Boundaries and next authorization

C2b exit means a **tiny emulator consumer/lifecycle/UI slice**, not complete parent C2 access/recovery acceptance. Real Analyzer/formation/source adapters, X flag coverage/top300 policy decisions, matching aspect embeddings,9,150-member and9,151st-Join numeric/resource parity, dynamic catalog/source writers, recursive restore, rules/IAM/authentication, unmodified old-client cutover and live rollout stay later gates. C3 import/resource/scoring scope needs its own spec/approval. The16 Values cases and PR60 remain deferred; no data repair/regeneration is implied.

Requested next decision after documentation review/merge: **Approve C2b emulator-only integration, including section6 provisional paths and section7 limits, using fixed precomputed fixtures and zero AI calls.** That author approval permits B1-B3 within this scope; it does not permit rules edits, paid calls, production writes, deployments or C3 import. This proposal PR merge alone is not implementation approval.

## Status

- 2026-11-24: author requested C2b proposal after PR61 merge d7f5c30; refreshed parent design, C2a evidence and application/helper consumer inventory. Documentation-only branch codex/c2b-integration-proposal; implementation and emulator/browser runs await explicit approval. No source/data/provider/loader/rules/docs/ operation.
