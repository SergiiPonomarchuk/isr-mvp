# CBC table-only isolated emulator verification

Author approved the proposed emulator Check/Create/Join, legacy replay and member/score preview checks on 2026-11-23. Start from merged main 7027110; feature branch codex/cbc-emulator-verification. Existing CBC-table-only math and credential mappings are unchanged.

Use only fresh disposable Firestore on 127.0.0.1:8189, project demo-mr1, separate hub/logging ports. No import/export of the author emulator, no production target, deploy/rules edits, real model, credentials or paid calls. Extend opt-in endpoint fixture with actual education vectors, new table-only evidence and independent Python audit; seed a separately frozen legacy mr1 model with non-neutral adjustment and test its Join/audit. Validate Check/Create replay and stale/mismatched policy refusal. Existing fixture invariants about social cohorts and normalization remain.

Browser: local scripted preview server on 127.0.0.1:5190, same demo project, explicit host verification before browser writes, synthetic session only. Check real counts, relevance/ISR previews, Create/open/members rendering; no real-model quality claim. Preview may change only test helpers, never the product's live Firebase config. Stop temporary processes after verification.

Record evidence, suites, limitations, HANDOFF and CHANGES; open PR, no merge without author instruction. Prepare the concrete offline overall_grounding implementation plan from the merged X/Values spec afterwards and follow the author-approved ordered work on its separate feature branch; this task does not run a real-data backfill or introduce X eligibility.

## Status

- 2026-11-23: emulator verification authorized; baseline implementation/main CI passed. Test-only feature work started. Provider requests/tokens budget: zero.

- 2026-11-23: isolated endpoint and real-browser checks passed; see CBC-emulator-report.md. Host ports were verified, both temporary services stopped, zero provider calls. New optional test fixture exercises non-neutral education and a separately frozen legacy public with Python parity. Offline OG plan prepared separately; no Values implementation.

Required suites: Node252 passed/six optional skips; Python147 run/two optional skips; opt-in emulator test1 passed. No production changes.

Integration (2026-11-23): author explicitly requested #53 then #54. CBC verification #53 merged as7288a63296a66d22afaf374864b49991dd0dd812 with all final checks successful; #54 follows independently. The emulator/browser evidence and application implementation are unchanged. No deployment/backfill.
