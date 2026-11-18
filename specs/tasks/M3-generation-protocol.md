# C1 offline publication protocol prototype

Author approval, 2026-11-18: **"merge PR 49, then approve C1: offline protocol prototype"**. This explicitly authorizes the C1 implementation described in [Phase C design section 13](M3-generation-publication-design.md). #49 merged as b8014acdce016bc7aaad51cd02ddc851220ebe6d; feature branch codex/m3-generation-protocol starts there. No additional approval is needed to complete C1.

## Approved scope and short execution plan

1. Build pure Node modules and a fake optimistic transactional store, with snapshots/restarts and injected before/after-commit failure. No application/Firestore/model imports or browser/rules changes.
2. Build a restricted lossless typed payload/page codec, bounded manifest tree, deterministic IDs/hashes and finite chunk/whole-build budgets. JSON bytes plus explicit per-operation overhead are a **model bound**, never SDK/server byte acceptance.
3. Model owner/lease epochs, chunk checkpoint/replay, validation/seal, atomic activation with source/catalog/day/base/phase fences, frozen Create replay, once-only Join event, publication-gated reads, cancellation and bounded never-published cleanup.
4. Test small synthetic traces including crash boundaries, concurrency, takeover, corruption/unknown versions, budgets, stale source/catalog/day, phase/Join races and reachable-history cleanup refusal. No scoring port or real profile data.
5. Run a bounded offline aggregate report under 256 MiB heap / 512 MiB parent RSS / 120 seconds / >=1 GiB free. Required Node/Python suites, source/link checks, HANDOFF/CHANGES, PR and final-head CI. Preserve all previous artifacts; no merge without explicit instruction.

## Prototype constraints

Only tiny finite plans (<=64 records and <=64 KiB typed payload, bounded nodes/height/fanout) are accepted. Finite node/chunk/write/byte/deadline/work budgets are mandatory. Test fixtures use 2, 7 and 17 members, opaque synthetic source/catalog tokens and precomputed payloads. They do not simulate actual PD-9 scoring, paid review, live source writers, title matching, authentication, SDK transactions, queries/indexes, deployment, UI or full-population performance.

The fake model treats source/catalog and phase updates as trusted atomic commands. All correctness claims depend on that closed-writer assumption; it does not solve today's open client-write/access problem. No persistent schema is selected by this experiment.

## Acceptance

- No staged row is published before the single activation commit. Commit conflicts/crashes expose all-or-none roots/receipt/event; read decisions select one token.
- Immutable paged payloads and replay reconstruct exact synthetic fields (including finite doubles, negative zero, dates, strings, evidence and zero-X examples). Missing/corrupt/unknown shapes fail; no partial lists.
- Durable job/intent state, takeover fencing, hash revalidation and finite budgets survive restart. Conflicting builders/phase/source/catalog/day cannot publish stale snapshots.
- Cleanup claims only never-published terminal jobs after the proposed seven-day grace and uses bounded resumable transactions. Published/superseded/replay history is retained.
- Report exact modeled JSON sizes, operation inventories, trace outcomes, bounded resource evidence and limits honestly. C2, emulator/real-client/SDK adapters, scoring/paging, import/access/rules/live operations remain separate approvals.

## Status

- 2026-11-18: C1 authorized; spec/plan recorded before implementation. No paid calls, credential loader, database or emulator operation. Final implementation/result/checks are appended before handoff.

- Implemented pure fake-store/typed-manifest/protocol modules, source-pinned bounded report and 25 focused crash/race/refusal tests. Initial run/code ee2ae92 preserved; final run 02 includes recovery/ordered upload/replay validation tightening. [Result and limitations](M3-generation-protocol/README.md). Three sizes 2/7/17 plus Join pass exact supplied-payload/replay checks; no scoring/SDK acceptance.
- Final local verification: Node 268 passed / six skips (274 total), Python 147 run / two skips. Create activation 7 reads/10 writes, Join 11/10 in the fake model; peak child RSS 57.28 MiB, unchanged 256 MiB heap / 512 MiB RSS / 120 seconds / 1 GiB free guard. C2 remains separately approved. Final PR-head CI checked before handoff; merge only on explicit instruction.
