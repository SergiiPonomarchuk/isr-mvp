# M3 staged runtime: mocked integration evidence, 2026-11-17

Status: implementation and automated mocked acceptance completed on `codex/m3-staged-runtime`; author UI review pending. Parent evaluation PR #42 remains separate. No deployment readiness claim.

VERIFIED code entry points: `functions/ai-helper.js:1150`, `functions/staged-context.js:13`, `functions/staged-context.js:27`, `functions/staged-context.js:46`, `functions/staged-context.js:66`, `functions/mr1-service.js:22`, `functions/mr1-service.js:82`, `functions/mr1-service.js:86`, and `functions/analyzer-log.js:25`. These describe the feature branch, not the deployed release.

## What changed

- `functions/staged-context.js`: exact source fields and text hashes; effective-decision resolution; complete raw-chain partition; typed accept/exclude/defer declarations; source/aspect/demographic evidence and immutable merge provenance. Exclusion text explicitly attributes model judgment. Client/fixture origin fields and `fixture_only` publication records refuse.
- `functions/scope-compatibility.js` centralizes the unchanged equal/equal-or-unit-building predicate. Every scope pair is parity tested; `context-review.js` uses it without changing legacy prompt/schema or arithmetic.
- `functions/ai-helper.js` adds a separate staged helper. Both calls use gemini-3.1-flash-lite, explicit LOW, temperature/seed pins, max 8,192 output tokens, one transport attempt and a 262,144-byte request/strict-response bound. No silent repair, candidate trimming or fallback pass. A non-pass first stage or empty compatible set stops before stage two.
- `functions/mr1-service.js` wires Check and unfinished Create to the new contract. Receipts are saved before aspect/population work; unfinished old drafts need Check. Stage decision hashes cover exactly title/description/clarification supplied to the model; normal resolved-point validation remains separate. Completed replay returns before current-contract checks. Published/frozen Join and scoring math stay unchanged.
- `functions/analyzer-log.js` records one operation receipt with individual stage records and actual one/two-request counts, prompt/schema hashes, raw responses, thinking configuration and input/output/thinking/total tokens. Frozen issue bundles retain full receipts and provenance; storage guards count them.

## Checks

Final local verification: Node 220 passed / six optional skips (226 total); Python 140 run / two optional skips; isolated actual-handler and staged location/provenance emulator suites both passed; final focused staged contract tests 10/10 passed. New tests cover every scope pair, exact/unknown/forged fields, duplicates including escaped keys, contradiction/missing-fact refusal, narrowed source evidence, typed reason/coverage/plan/library binding, one/two-reference coefficients, maximum geography, two LOW calls, usage and immutable receipts.

The actual exported Check/Create/Join HTTP handlers run against empty disposable Firestore `demo-mr1` at `127.0.0.1:8189`, with the real staged helper/parser and fake SDK/vector responses. Results: Check forms 105 A + 4 B = 109 members, full-member values aggregate, concurrent Create/replay is idempotent, explicit Join reaches 110, independent Python score audit passes, injected score corruption is detected, old completed replay/unversioned Join remain valid, and old unfinished/stale/population-changed drafts refuse. Document/10 MiB transaction envelope refusals remain.

A second disposable project `demo-mr1-staged` exercises actual Check service calls with fake SDK/vectors/place resolver: home/work/property/external named place, creator pin precedence, personal help, mixed/vague non-pass without draft/scores, explicit narrowing and unchanged clarification selection text. Create after automatic work-location resolution passes. A downstream vector failure still leaves its two-stage usage receipt and creates no draft. A plain near-limit document fits; adding the complete staged bundle makes it refuse rather than dropping provenance.

All model/vector/place responses in this evidence are synthetic. Actual Firebase/Firestore RPCs target localhost only. Nothing reads the Gemini secret loader or invokes a paid API. Existing raw reports, including the four false scope reasons from the LOW real-model check, are not converted or repaired. Two reused JSON files were restored to exact committed LF bytes after Windows checkout CRLF invalidated their byte pins; their Git content is unchanged.

## Browser and human review

Running local preview: [app](http://127.0.0.1:5190/main.html?emulator=1), [step-by-step guide](http://127.0.0.1:5190/staged-guide). Separate `demo-mr1-preview` project on the disposable 8189 emulator has 20 synthetic profiles. The preview injects mock SDK/vector responses, disables external HTTP from its Node process and blocks UI clicks unless the actual compat SDK host is `127.0.0.1:8189` and `?emulator=1` is present.

Agent browser observation: mixed repair/tax text produced clarification with Create disabled; `Only repair our building entrance lock.` produced home location, 20 members, R 80%, ISR 1.00, and enabled Create without repeating the question. No Create was pressed in the visual check. Screenshot: `C:/isr-mvp/scratch/staged-analyzer-preview.jpg`. The script is a deterministic fixture demonstration, not real-model extraction quality.

Author steps from the open checked form:

1. Confirm the green footer says **Emulator verified | Synthetic data | Mock AI**.
2. Review the original description and the narrowing answer, home location and 20 members.
3. Press **Create** locally, dismiss success, then open **Chat** and the new **Local entrance repair rehearsal** issue.
4. Open its member card and verify the synthetic list. Report any misleading wording or flow. To repeat Check from the start, use the guide above; its full input texts are provided there.

## Remaining gates

Human acceptance and a separately authorized real-model pilot remain necessary. This task demonstrates contracts and integration with mocks; it cannot prove model judgments/extraction are true. Full-population 9,150-person atomic storage and memory failures remain hard gates. No import, rescore, migration, production write, rules change, deployment or additional paid allowance is authorized by this evidence. Sol Medium remains sufficient.
