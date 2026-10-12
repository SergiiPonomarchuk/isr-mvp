# S0-D3 Correction of IMPLEMENTATION_FACTS l.87 and l.127

Status: done (author request, 2026-10-12, answer to S0 inventory question 3).

## Decision
The code was re-checked by grep for gISR, AAuth, "adaptable auth" and "general ISR" across `.js`, `.py`, `.html`, `.css`, `.rules` and `.json` files, excluding `node_modules`. There were no matches in the code. Among the docs, only `docs/mvp.html` mentions them.

`claude_export/IMPLEMENTATION_FACTS.md` lines 87 and 127 were corrected accordingly in commit `60a9c1c`. The size and SHA-256 recorded in `claude_export/MANIFEST.md` were updated in commit `bb368e1`.

## Consequences
Contradiction C-41 is resolved.
