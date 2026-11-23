# C2a implementation and emulator acceptance

Author approved2026-11-23 after C1 PR50 merged as a660233 with main Node/Python checks passed. Scope: M3-generation-emulator-slice-proposal.md in full, including its explicit exception for provisional private issue_drafts descendants and issues/discussions/microcommunities roots, only on the disposable demo emulator. Feature codex/c2a-emulator-publication; Sol Medium is sufficient. No additional permission needed for the approved isolated work. R2/16 Values cases stay deferred.

## Concrete implementation plan and physical paths

Use C1's pure state transition as an oracle/planner inside a new asynchronous Firestore boundary. Planning reads can request missing keys from a bounded cache. Within every real transaction load all needed documents (batching bounded manifest nodes), replay the deterministic side-effect-free transition against those snapshots, then submit its write set only after all reads. SDK retries reconstruct planning state; no provider/external application side effect in callbacks. This is not a synchronous SDK substitution. Keep C1 modules and production functions/index.js/scorers/UI unchanged.

Exact target: demo-c2a-publication at127.0.0.1:8190; loopback harness127.0.0.1:8192. No fallback/real credentials/model key/loader. Initial database must be empty; a private c2a_bootstrap marker permits explicitly checked restart of only this experiment. Abort if unknown root collections appear. Existing firestore.rules is loaded unchanged into the emulator, not edited; use its client-denied issue_drafts namespace to test current access behavior without claiming a new security policy.

Logical C1 keys map through an explicit path allowlist:
- private/jobs/{build}: issue_drafts/c2a_{fixture}/publication_builds/{build}; nodes below that build's nodes/{node}.
- control/{source|catalog|day}, private/{intents|locks|titles|catalog}/{id}: corresponding bounded collection/doc beneath issue_drafts/c2a_{fixture}.
- public/{vectors|messages}/{issue}: private placeholders/{kind}_{issue} beneath that fixture; public/events/{id}: private events/{id} beneath that fixture.
- public/issues/{id}, public/discussions/{id}, public/publics/{id}: issues/c2a_{fixture}_{id}, discussions/c2a_{fixture}_{id}, microcommunities/c2a_{fixture}_{id}.
- bootstrap marker: issue_drafts/c2a_bootstrap. No other path, users/vector data or topics.

Only sealed server-side fixtures with2/7/17 precomputed members and at most two explicit successors are accepted. HTTP commands select fixture/operation IDs, never submit score/payload arrays. Source/fixture digest and a fixture-only policy are checked. Restart reconstructs an existing job's input from retained original published generation and the immutable fixture, not today's root or caller data. Published pagination binds generation/manifest/epoch/count/offset; use typed encoding over HTTP so negative zero/dates/Unicode remain exact. No staging/partial list; status may expose bounded progress only.

Keep C1 record/payload/node/chunk/work limits. Proposed additional C2 guards for measurement/validation before execution: <=16 writes and16KiB per SDK CommitRequest, <=512KiB per encoded document (stricter than existing margins), <=600 fetched docs and1024 discovery steps per transaction callback, <=3 SDK attempts per operation, <=512 harness operations and<=8MiB total attempted commit bytes per fixture. Exact SDK request/token bytes are measured in memory; persist counts/sizes only, never transaction/auth tokens or raw SDK requests. If offline serializer fixtures exceed these bounds, stop and resolve rather than raising them. Resource supervisor retains256MiB heap/512MiB RSS/120seconds/min1GiB free and permits only the emulator/harness network endpoints.

## Verification

Pure target/path/cursor/planning/serializer/limit tests, then actual SDK/HTTP flow for2/7/17 and Join. Check pinned replay across Join/page boundaries; pending/status refusal; malformed/missing/mirrored/corrupted publication refusal; exact typed full payload; once-only event/intent; leases/takeover/checkpoint/seal/activation lost responses; real conflict/retry and source/catalog/day/phase/cancel races. Test-only injection is trusted and cannot be selected in public request JSON. Published history remains; never-published cleanup only in fixture. No weighted tally/tasks/browser or actual scoring in C2a.

Run required Node/Python suites. Fresh named source-pinned emulator evidence includes sizes, operation/retry counters, resource limits and full synthetic preservation checks. No accepted import/export or live operation. Stop only identified helper processes and verify dedicated ports closed. Update HANDOFF/index/CHANGES/task and PR; merge requires explicit merge PR instruction. C2b consumers/lifecycle/UI, C3 real-population numerical/resources and eventual live access/source writer/cutover remain later gates.

## Status

- 2026-11-23: approved C2a scope and implementation plan recorded before code. No live/provider operation; no rules/docs/ changes.

Implementation detail: provisional SDK records wrap prototype_version/fixture_id/logical_key plus a JSON string of the C1 typed value. This avoids nested Firestore arrays and preserves original object-key order, dates and negative zero. Public prototype roots use the same versioned wrapper and are not application-compatible roots. A bounded in-memory plan cache is optional; restart reconstructs from the retained base generation/fixture before staging.

- 2026-11-23: offline installed-SDK measurement before emulator execution: largest provisional document2372bytes, largest sampled8-write CommitRequest8262bytes across2/7/17 fixtures, including128 transaction-token bytes. These fit the fixed16KiB request/512KiB document limits; no guard raised. Ten pure boundary/codec/planner/serializer/HTTP tests pass with network disabled. Actual transaction/request sizes still need emulator evidence.
