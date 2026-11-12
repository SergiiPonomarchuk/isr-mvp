# A5: Local residential ownership scope

Status: approved plan, 2026-11-12 (author: "ok" to the linked P2 locality-fix proposal). Implemented and emulator-verified; AC1-AC4 passed, final export saved. PR/CI follows; no live change.
Branch: `codex/local-residential-scope`, based on U8 `0eddbc6` (stacked after PR #22).
Components: 03 (relevance input interpretation), 07 (Analyzer, not yet a component file); P2 AC4.

## Evidence and intended behavior

P2's building Check at osbb 1 h5 used the correct point and mu=40 / sigma=30, but returned 4,941 candidates. Its model produced property_kinds [flat, house]. Existing A3 rules let all matching owners bypass distance. The actual D/G modules independently reproduce 1,033 eligible people with a home/work/property anchor inside 130 m plus 3,908 owners outside that cutoff. D weight 0.30 alone exceeds the existing threshold 0.15. Evidence: P2 PR #23, `specs/tasks/P2-acceptance-report.md` there; raw draft/log ids remain in ignored acceptance scratch data and the exported emulator.

The author's approved proposal: local unit/building residential maintenance stays tied to its affected location; actual landlords owning property there remain eligible. Broader ownership issues and garage-kind inclusion remain supported. No migration rerun is needed.

## Exact requirements

1. A pure server helper sanitizes demographic rules, then, when classification.scope_type is unit or building, removes only flat and house from property_kinds. Scope comparisons trim/lowercase. Other kinds and explicit place names remain unchanged. Broader or unknown/missing scopes are not reclassified by this helper; the Analyzer's existing defaulting remains as built.
2. Apply the helper to both demographic_rules and demographics in AI normalization and in paramsFromAi, so logs, shown parameters, stored drafts and candidate selection agree. Raw model output remains in the existing Analyzer log; normalized output shows the effective filters. No new schema or collection is needed.
3. Prompt p4 explains that generic flat/house ownership does not describe who is affected by a local residential issue. Actual owners of the affected property qualify through the existing nearest-anchor path. Scope must be broader for genuinely broader ownership issues. Garage/land/commercial/other filters keep their existing semantics.
4. Create must reject a previously checked unit/building draft if either stored demographic alias still contains flat or house. Return 409 requesting a new Check, rather than silently creating a different public from what the old Check showed. New guarded drafts and broader/garage drafts continue to work.
5. D/G formulas, weights, distance cutoff, membership caps, geography, embeddings and old publics/scores are unchanged. No deploy, rules change or production write.

This is a narrow interpretation guard at the Analyzer boundary, superseding A3's generic flat/house bypass for unit/building issues only. It is not an implementation of the full PD-1 soft-D design or stage-4 Analyzer guardrails.

## Acceptance

- AC1: deterministic regression using the observed building filters; remote unrelated owner loses its bypass; a remote-resident landlord whose property is at the issue still has a nearest anchor there. Garage-kind and city/region ownership filters retain their bypass. Cover both aliases, missing rules, mixed kinds, immutability and stale-draft rejection.
- AC2: Node and Python suites pass; CI green. No API calls in tests.
- AC3: on the emulator, replay the captured P2 model result through the guard and actual D/G modules: the 3,908 unrelated owners no longer bypass; nearby/actual-property owners remain. This isolates the guard from model variability.
- AC4: repeat the two P2 building/garage Checks with p4. Building is local, model/draft/shown rules agree, garage owners still reached. Record actual parameters and counts, not a promised number if model weights vary. Verify old offending draft Create gets 409 without another model request.
- AC5: export the test state, update A5/P2 records and the handoff, open a stacked PR. Keep preview running for author inspection. No live changes.

## Approved plan and status log

1. Formalize this rule before code changes (this file).
2. Add the pure guard and captured-response regression tests; update p4 normalization/parameter boundary and stale-draft Create check.
3. Run tests, replay the saved result, then two paid emulator Checks and the old-draft rejection. Export and record token/request totals.
4. Update component history/status, P2's blocker record, and CHANGES; open a PR after U8 and retest P2.

- 2026-11-12: formal spec written from the approved proposal; exact normalization rule stated above. No product code changed yet.

- 2026-11-12: implementation `a817694`; Node 98 passed, Python 73 run with one skip. Captured P2 replay: 4,941 -> 1,033, removing all 3,908 unrelated owner bypasses while retaining property-linked members. Fresh p4 building Check 1,033, garage Check 1,391; old offending Create draft rejected with 409. Two text/two embedding calls, 16,632 prompt / 2,030 output tokens plus about 121 estimated embedding tokens, about $0.00722. Export 2026-11-12 06:36 UTC. Full evidence: [A5-emulator-report.md](A5-emulator-report.md). Preview left running, no live changes.
- Outcome merged into [03-relevance.md](../03-relevance.md) (A5 scoped input interpretation and Change history); D/G engines remain unchanged. CI/PR and P2 cross-record follow.
