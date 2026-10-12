# PD-2 Resources and money

Paper id: D-002. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design.

## Decision
- Only pledged and checked resources count toward Expertise. Owning something is not enough. Money is excluded from Expertise.
- If an issue needs money, each option states its cost and funding source.
- Property plays three roles: stake (through Relevance), legal consent (outside ISR) and offered capacity (through a pledge).

## Open
Pledge rules (conflict of interest, delivery, timing).

## Affects
04 expertise, [06 aggregation and voting](../06-aggregation-and-voting.md) (options).

## Overrides in docs/ (as listed by the author)
- `docs/ISR-Expertise-Assessment-v1.md` §2.4 (l.146-184; ownership and capital count as resources), Part 4 (l.251-428), Part 5 (l.430-631) and Part 7 (l.633-1038; worked examples that count owned resources).

## Possibly also affected (not listed by the author; please confirm)
- `docs/ISR-Issue-Analyzer-Protocol-v1.md` §3.3: the resource type `money_budget` (l.496) and the rule "include `money_budget` where applicable" (l.714). These describe what an *issue* needs, not a member's Expertise, so they may be compatible with PD-2.

## As built (pointer)
`resources_expertise` comes from hobby `activity` skills by keyword rarity (IF l.72, l.185). Options carry a `budget` field (default "N/A") and no funding-source field (`prototype/js/main.js:4436-4456`; grep for "funding" finds no option field, 2026-10-12). Details: 04, [06](../06-aggregation-and-voting.md).
