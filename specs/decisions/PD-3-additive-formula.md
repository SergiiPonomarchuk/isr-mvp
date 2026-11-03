# PD-3 Additive formula

Paper id: D-006. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design.

## Decision
- ISR = w_R·R + w_E·E + w_C·C stays an additive weighted sum. Compensation among the components is intended; the per-issue weights act as the exchange rate. Stake-gated and multiplicative variants were rejected as hard to interpret.
- Components are divided by the public's mean (1.0 = public average), as in `docs/mvp.html` and the code.

## Open
The rule for a zero or negative mean. A1 currently raises an error until this is decided (A1 R3, open question 1).

## Affects
[06 aggregation and voting](../06-aggregation-and-voting.md).

## Overrides in docs/ (as listed by the author)
None. The author notes that it settles contradiction C-33.

## Doc statements that conflict with this decision (please confirm whether PD-3 overrides them)
- `docs/ISR-Issue-Analyzer-Protocol-v1.md` §6.3 (l.679): "each component is normalized to [0, 1] before aggregation".
- `docs/ISR-Issue-Request-Guide.md` "Why Relevance Is Absolute (Not Normalized)" (l.404-409).

## As built (pointer)
Member ISR uses mean-normalised R and E and C = 1.0 (IF l.99). A zero mean gives 0 (IF l.77, l.91). Details: [06](../06-aggregation-and-voting.md).
