# PD-5 gISR and access

Paper id: D-007. Status: accepted (author). Recorded: 2026-10-12, from `specs/tasks/S0-decisions-to-import.md`.
Type: intended design.

## Decision
- **gISR** is a person's Contribution assessed against the Vector of Values of all registered users, divided by the mean. It is recomputed, not stored. It has only two uses:
  1. votes on questions that affect all users equally;
  2. the reliability condition in Adaptable Authorization, always combined with the requester's relation to the data subject.

  Any new use needs a protocol-level decision.
- **AAuth** tiers define default automatic visibility. Any user can request any data of another user, and the data subject decides. AAuth uses total Contribution for now.
- gISR is not shown to other members: no Profile Card score and no percentile. It is not provided to third parties through the API, and the terms of use forbid using it outside ISR. A holder can export their own data.

## Affects
05 contribution, 09 identity, access, security, 10 UI flows.

## Overrides in docs/
None listed. `docs/mvp.html` is not normative (S0-D2). Its wording since commit `fa44f7b` matches this decision: the Status Card shows gISR only to its holder, there is no percentile and no Profile Card score, and access uses a "minimum reliability condition (gISR)".

## As built (pointer)
gISR and AAuth do not exist in the code (IF l.87, l.127, corrected in `60a9c1c`). Contribution is not implemented (IF l.86). Details: 05, 09.
