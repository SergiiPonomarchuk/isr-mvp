# PD-1 Scope, inclusion floor, soft D

Paper id: D-001. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design. This page says nothing about what the code does today; see the component files.

## Decision
- ISR works within applicable law and in the space law leaves open. If law fully resolves an issue, it is not an ISR case. The Analyzer returns `legal_coverage` (`none`, `partial`, `full`, `unknown`) as advisory triage, not legal advice.
- All affected members take part (information, discussion, proposal, vote). w_R does not affect inclusion.
- Materially affected members are never hard-excluded: D is a soft score, not a gate. Candidates are retrieved over several channels (G, D, X, S) and then scored.
- There is no hard-coded list of protected attributes. The Analyzer flags missing or proxy attributes.

## Affects
[00 vision and scope](../00-vision-and-scope.md), [03 relevance](../03-relevance.md), 07 analyzer.

## Overrides in docs/ (as listed by the author)
- `docs/ISR-Relevance-Implementation.md`: pipeline phase 1 (l.22-24, "Excludes unqualified users immediately") and §2.1 (l.243-253, "If a user receives a 0.0 demographic score and w_D > 0, they are excluded").
- `docs/ISR-Issue-Analyzer-Protocol-v1.md` §2.2.1 (l.358-377: hard exclusion on age, employment, family, features; D = 0 if excluded).

## Possibly also affected (not listed by the author; please confirm)
- `docs/ISR-Relevance-Implementation.md` §2.3, table header "D_score = 0.0 (Excluded if w_D > 0)" (l.302), and the binary code sample in §2.2 (l.259-295).
- Hard geographic exclusion beyond μ + 3σ: Relevance doc l.27 and l.369-370; Analyzer l.414. "Never hard-excluded" may also apply to G.

## As built (pointer)
Path A in the Cloud Function gates on D (IF l.31). `legal_coverage` does not occur in the code (grep, 2026-10-12). Details: [03 relevance](../03-relevance.md).
