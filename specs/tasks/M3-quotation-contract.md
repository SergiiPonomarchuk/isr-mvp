# M3 offline quotation-contract correction

Author approved with “ok, go” after the actual pilot's offline proposal. Scope: align staged domain prompt/schema descriptions with EFFECTIVE_JSON and prohibit using reference titles as source evidence unless also literally present in settled source quotes. Keep strict source validation, all 1-3 aspects, complete reference coverage, math, model, library, retrieval and historical artifacts unchanged. No paid calls, loader, database operation or deploy.

Plan: edit only staged quotation instructions and bump staged prompt version; verify schema shape unchanged except descriptions, inherited legacy contract untouched, actual prior bad output remains rejected and old unfinished draft contracts refuse. Run required Node/Python suites; record evidence in CHANGES/HANDOFF and a separate PR stacked on unmerged #44. Do not regenerate old paid plan/approval, modify the recorded response or infer real-model improvement from offline tests. Any paid retest requires separate bounded approval.

## Status log

- Started from PR #44 head ae33f7b in codex/m3-quotation-contract; original paid branch/source and artifacts preserved. Author approved offline correction only.

- Implemented staged prompt version mr1-staged-prompts-2. Only functions/staged-context.js:36 schema descriptions and :43 domain instructions changed, plus the version; schema wire fields/types and validator/scoring functions are unchanged. Source quotes and reference metadata are explicitly distinguished, with identical-source-text exception retained.
- Four focused checks pass, including the captured actual response replay. Required suites: Node 231 passed / six optional skips (237 total); Python 140 run / two optional skips. All recorded pilot artifact Git blobs match their original SHA-256 manifest. No preflight/approval/response was regenerated; old paid pins are intentionally stale against this new runtime and do not authorize a new run.
- Offline tests prove contract consistency and refusal, not real-model compliance. No API call, private loader, database, browser repeat, deploy or rules change. Fresh real-model validation remains gated by its own explicit bounded allowance; prior four-call pilot allowance is consumed.

- Draft fix PR #45 is stacked on #44. Runtime commit 25689de passed GitHub Node/Python checks. No merge is authorized by offline-fix approval; final documentation-head CI is checked before handoff.

- Author explicitly authorized merge PR #44, then #45. #44 merged as 137f7b4517775d75a9efdb37c21151c2b02bf630; #45 retargeted to main. Its merge preview matched tested tree 0b3d90803ff99d3fd6a31795e497e7a2b0069e59 before this documentation-only checkpoint. Final-head CI/merge receipt are verified through GitHub. No new paid call, deploy, rescore or production operation is authorized.
