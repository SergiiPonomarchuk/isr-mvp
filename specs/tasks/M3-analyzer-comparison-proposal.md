# M3 offline Analyzer evaluation/model-comparison plan proposal

Status: proposal only. No new paid call, model switch, prompt patch, production integration or allowance is authorized. The review ceiling is exhausted at 23; US$0.368110 remains reserved under the original US$0.50.

## Proposed offline work

1. Freeze the current approved Analyzer model/config, full raw and staged requests, all source hashes and literal results as the baseline. Preserve both what improved (settled-choice understanding, complete coverage) and failures (false scope assertions under another reason type, incorrect home anchor). Do not overwrite or relabel old failures as new test results.
2. Define independent semantic checks for small author-reviewable fixtures: already answered narrowing must not be asked again; home/work/distinct property/external named-place interpretation follows U6; no public-policy-only exclusion of personal help; no false scope reasons, fabricated attributes or omitted compatible references. Missing actual facts must remain questions. Scope compatibility alone never implies topic compatibility. Existing parser/math tests remain separate.
3. Label expected facts and genuinely ambiguous judgments before testing any new model. For the current lock fixture, record building/unit compatibility and home anchor without asserting all compatible references should be retained. Provide a clear policy for incomplete/false reasoning: refuse publication and expose the unresolved issue, never default-exclude, force scope or patch model outputs. A free-text reason's correctness cannot be certified by schema validity.
4. Consult only official provider model/pricing documentation to propose the cheapest plausible comparison candidate alongside the existing model. Verify current availability and record uncertainty; no API key inspection, model-list credential call or paid benchmark. Distinguish the application's Gemini model decision from the development model setting. Do not recommend a development-model upgrade for routine evaluation scaffolding.
5. Specify a minimal later comparison matrix with identical frozen inputs, schemas, output bounds, full raw-chain/provenance accounting and no embeddings unless separately justified. Prepare the exact future request/token/attempt reservation plan and stop criteria, preserving every prior count/reservation. No new count ceiling or money is implicitly authorized. Review any need for a factual post-check or simplified location contract separately; no brittle phrase blacklist is silently added here.

## Decision requested

Approve **offline Analyzer evaluation/model-comparison planning** above, including fixture/quality criteria and primary-source research, before selecting a different application model or requesting any new actual benchmark. This is not approval to spend more or integrate the staged prototype. Sol Medium remains sufficient for this offline task. Keep the full-population storage/memory gates and final human acceptance visible.

- 2026-11-17: Author approved offline evaluation planning. Plan: freeze request/source/result manifests, annotate independent quality facts and ambiguous retention judgments, verify official model/pricing/thinking documentation, prepare exact nonexecuting comparison requests and reservation scenarios. No SDK client/API calls or runtime/model change. Added planning generator only; future thinking/output accounting is an explicit execution gate.

- 2026-11-17 completed: approved offline planning, primary-source research, eight fixtures, baseline/source freeze and two unexecuted LOW arms. No paid call/model change. Exact generateContent thinking-budget verification remains a pre-execution gate; see M3-analyzer-evaluation-plan.md.
