# PD-8 Resources and money are option-level; Expertise is education and experience

Status: accepted (author). Recorded: 2026-11-04. Supersedes PD-2.
Type: intended design.

## Decision
- Expertise has two parts, added without weights: E = max(min(age, 30) / 30, Σ education) + Σ experience. The age term is a common-knowledge floor for adults, scaled down below age 30; it never exceeds 1 and never falls with age. The age is taken at the registration moment of the issue and is not stored.
- No resources part, no contemporary importance, no age penalty, no other personal trait in E.
- Resources and money are part of the decision options: each option states its cost, funding source and needed resources. They give nobody weight.
- Property influences the ISR-score only through Relevance, as affectedness (G anchors home, work and property).
- `birthDate` is required for every user.
- Nobody types a number: the AI assistant derives all parameters; the topic starter sees them and can only clarify the context.

## Overrides in docs/
None: the author changed the docs to match (commits `c1aa9b1`, `e60f342` and the round 3–4 edits of `specs/tasks/A2-docs-fix-list.md`).

## Implemented by
A2 (Expertise, read-only parameters, migration), A3 (option fields, G anchors).
