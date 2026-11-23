# Proposed C2a isolated emulator publication slice

Prepared2026-11-23 after C1 PR50 review/reconciliation; **not yet authorized**. Parent design: M3-generation-publication-design.md. C1 evidence: M3-generation-protocol/review-20261123.md. This is the next concrete scope for author approval after C1 review/merge, not a production schema choice or complete C2 acceptance.

## Purpose and smallest complete slice

Prove private build -> seal -> atomic activation -> published page read -> full successor Join -> phase fence with real Firestore serialization/transactions on tiny synthetic data. No numerical scoring or full-population claim. Existing app endpoints/readers/legacy payloads stay unchanged. Experimental harness only, with no production index.js import/routing and live mode refused.

1. Define an explicit asynchronous orchestration/store boundary; do not swap an SDK into the synchronous C1 fake store. Complete required reads before scheduling transaction writes, handle retries without external side effects, and retain deterministic intent/chunk/checkpoint/event IDs. Compare visibility/replay/state transitions with C1 traces.
2. Use a newly named disposable demo-project emulator and loopback-only guarded harness/SDK client. No functions/hosting/model client, accepted export import, saved emulator reuse or backup restoration. Seed only2/7/17 precomputed synthetic members plus successors/controls, sealed as an immutable allowlisted fixture. Source/catalog mutation injection is a trusted test path, not a live writer/access solution.
3. Proposed emulator-only physical paths: issue_drafts/{fixture_id}/publication_builds/{build_id} and bounded descendants for jobs/nodes/manifests/replay; fixture-specific source/control/intent/catalog records beneath issue_drafts. Small roots under issues/{id}, discussions/{id}, microcommunities/{id}. Keep vector/message/event placeholders private unless this accepted slice needs concrete other paths, which must be enumerated before coding. Do not touch users, actual user_vectors, real topics or unknown roots. C2a approval must explicitly include these read/write paths as an exception to the older six-path skill list, only in the disposable demo emulator.
4. Prototype handlers: start/resume/status, stage/seal/activate, publication-gated complete page reader, successor Join, and a chat->voting phase-fence command. Use versioned pending/success/refusal and immutable receipt/cursor bindings. Authority is the selected complete generation, never caller scores/partial staging. Require matching current mirrors; creation replay stays frozen after Join. C2a excludes weighted option voting/tally/tasks and UI; those real lifecycle/browser consumers need a later C2b scope before broader acceptance.
5. Measure actual SDK-serialized document/request shapes, masks and transaction retries/acceptance on the emulator. Preserve existing document/request margins and256MiB heap/512MiB RSS/120seconds/1GiB free resource gates; do not raise them to pass. Agree finite chunk/whole-work budgets from tiny measured serializer envelopes before execution; unconfigured limits refuse. No9,150-member capacity claim.

## Required evidence

- No staging visibility or partial member list. Mirror/hash/schema/cursor mismatch refuses. Every tiny fixture/successor exactly preserves supplied order/payload/replay, Unicode, negative zero and metadata. Missing/corrupt/invalid UTF8 pages refuse.
- Real transaction retry/conflict and lost-response injection at every durable boundary; stale leases, competing Join/cancel/phase, source/catalog/day drift; no duplicate event/external side effect. Active/superseded/replay history cannot be collected. Test discard/restore applies only to the disposable fixture.
- Unpublished reads refused through the prototype reader; demonstrate current applicable emulator client-access behavior. No rules file edited and no live authentication/security or stale-browser cutover claim. Current open writers remain a later live blocker.
- No connection without exact demo project/loopback guard and fresh isolated fixture. HTTP harness loopback only; no live/API fallback, mixed/unknown policy/source set or credential loader/model key. Fake AI only if a handler interface needs it.
- Source-pinned report: actual serializer bytes, operation/retry counts, whole-operation work/RSS/time/refusal, full synthetic before/after data and once-only receipts/events. Required Node/Python suites/final CI; stop only identified temporary services and verify ports close.

## Exclusions and later decisions

No production writes/deploys, rules edits, existing app/scoring/UI changes, X decisions/flag population, re-embedding, paid calls or real-source import. Current CBC/Values/historical membership/tally stays unchanged. Pin a synthetic-fixture policy/format, not claimed acceptance of mr1-x-carer-mvp-1. Resolve the top300/direct-recovery X boundary and required source-field coverage before real formation integration. C2b later covers all real consumers/browser/lifecycle; C3 covers independently audited population parity/resources under separately approved source/import conditions. Live enablement needs writer/access/client-cutover and recovery review.

## Proposed next authorization

After C1 PR50 merge, approve C2a implementation/testing under this exact isolated-emulator scope, including the listed provisional paths. No Paid/budget approval needed: zero model calls. Sol Medium is sufficient. Emulator acceptance grants no production deployment or expansion to C2b/C3.
