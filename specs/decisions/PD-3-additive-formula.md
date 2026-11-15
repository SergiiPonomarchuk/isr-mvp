# PD-3 Additive formula

**2026-11-16 companion decision:** [PD-9](PD-9-multi-reference-derivation.md) defines intended mr1. Preserve this decision's governing principle; multi-reference implementation is pending. PD-9 combines raw education before one floor, paired relevance scores and one-public normalization; affected-person social expansion is nonrecursive. Current all-equal R/E values (including allzero) normalize to1; unequal nonpositive mean errors under A1. Exact direct-affectedness and candidate-filter contracts remain an implementation gate.

Paper id: D-006. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design.

## Decision
- ISR = w_R·R + w_E·E + w_C·C stays an additive weighted sum. Compensation among the components is intended; the per-issue weights act as the exchange rate. Stake-gated and multiplicative variants were rejected as hard to interpret.
- Components are divided by the public's mean (1.0 = public average), as in `docs/mvp.html` and the code.

## Open
Resolved by implemented A1: if all raw component values are equal, including all zero, every normalized value is1. Unequal values with a nonpositive mean raise an error. PD-9 retains this rule for combined R/E; future signed Contribution has its own governing normalization.

## Affects
[06 aggregation and voting](../06-aggregation-and-voting.md).

## Overrides in docs/ (as listed by the author)
None. The author notes that it settles contradiction C-33.

## Doc statements that conflict with this decision (please confirm whether PD-3 overrides them)
- `docs/ISR-Issue-Analyzer-Protocol-v1.md` §6.3 (l.679): "each component is normalized to [0, 1] before aggregation".
- `docs/ISR-Issue-Request-Guide.md` "Why Relevance Is Absolute (Not Normalized)" (l.404-409).

## As built (pointer)
Member ISR uses mean-normalised R and E and C = 1.0 (IF l.99). The older zero-mean=>0 observation (IF l.77, l.91) is historical and superseded by A1's all-equal=>1 rule. Details: [06](../06-aggregation-and-voting.md).
