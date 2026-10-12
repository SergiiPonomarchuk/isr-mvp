# S0-D4 Author edits to docs/mvp.html are the only docs/ change in S0

Status: accepted (author, 2026-10-12).

## Decision
For S0's acceptance criterion "docs/ and the manifesto untouched", commit `fa44f7b` ("docs/mvp.html: apply agreed paper wording edits (Chapter 3), made by the author outside S0") is the one exception. It contains 7 in-place line edits:
- "funding source" (3 places);
- the Status Card: score visible only to you, gISR relative to the average, no percentile rank;
- the Profile Card without a general ISR score;
- the Privacy and Security text with "minimum reliability condition".

Any other change under `docs/` during S0 is a violation.

## Check
`git diff 0620f27..HEAD -- docs/ ISR_PROJECT_MANIFESTO.md` must show only the changes of `fa44f7b`.
