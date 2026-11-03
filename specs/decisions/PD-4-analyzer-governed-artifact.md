# PD-4 Analyzer as a governed artifact

Paper id: D-004. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design.

## Decision
- The Analyzer prompts, the 100-example library and the documentation are public and versioned.
- Each run is logged: input, model, parameters, raw output, the final and edited parameters, and the source (model, fallback or edited).
- Test-retest metrics are published.
- Changes go through protocol-level governance.

## Open
Who may edit parameters, and under what limits.

## Affects
07 analyzer.

## Overrides in docs/
None listed.

## As built (pointer)
None of this is implemented. There is only `console.error` logging; prompts, outputs, edits and model versions are not persisted (IF l.118). The 100 examples are not sent to the model (IF l.114). The submitter can edit every parameter without validation (IF l.117). Details: 07.
