# S0-D2 docs/mvp.html is a public-facing overview

Status: accepted (author, 2026-10-12, answer to S0 inventory question 2).

## Decision
`docs/mvp.html` is a **public-facing design overview, not normative**. Component files link to it as context, never as the intended design.

## Flags required by this decision
The following features described in `docs/mvp.html` are **NOT IMPLEMENTED**:
- AAuth (Adaptable Authorization): l.726-728. No code mentions it (IF l.127, re-checked 2026-10-12).
- gISR: l.113, l.572, l.728. No code mentions it (IF l.87, re-checked 2026-10-12).
- Encryption: l.731, "All data encrypted in transit (TLS) and at rest". The app implements no encryption of its own. Whatever Firebase provides by default is a platform property, not evidence for this design claim (UNSURE whether anything else exists; to be checked when 09 is written).

These flags are carried in 09 identity, access, security and in [00](../00-vision-and-scope.md).
