# M3 aligned pilot closeout - 2026-11-17

The author approved contract alignment and bounded completion. Prompt v4 explains existing scope compatibility, reference coverage, aspect linkage and server limits. No scoring, threshold, compatibility rule, model or validator changed. Offline tests passed before execution.

## Completion and usage

All 14 pinned cases have completed outcomes: **10 pass, 3 needs_clarification, 1 not_consistent**. Two passes are preserved prompt-v3 observations (lock and pothole), source-hash pinned and revalidated offline without new calls. The other 12 cases ran under v4. This is a disclosed mixed-version pilot, not 14 new v4 results.

Cumulative **19 review attempts, 13 embedding texts / 13 POSTs, 32 HTTP attempts**. Original limits remain 20 reviews / 45 texts / 17 POSTs / total US$0.50. Conservative reservation **US$0.296917**; reported usage across responses with metadata is 44,481 input / 7,789 output tokens, 52,270 total, estimated US$0.022810. Unknown HTTP-error/embedding usage remains reserved; this is not an invoice or account-wide spend measurement. One review slot remains; it has not been used.

All parent receipt and reused-case hashes still match. Current artifacts are M3-evaluation/pilot-20261117-aligned; aggregate review is M3-evaluation/aligned-quality-review.json. No database RPCs, production writes, geocoding, profile re-embedding or deployment.

## Quality review - not accepted for deployment

The visible demo topics have nine passes in total, including the two reused cases; the tenth visible case (D1-09) is not_consistent. The vague original and compound original ask sensible factual/splitting questions. The vague-help clarification passes. The compound clarification still asks for a choice that was already supplied.

Two unresolved findings need author judgment:

1. **Clarification precedence:** compound-lock-software-clarified explicitly says decide only the lock repair and register software separately. The output repeats the choice question. Recommend treating explicit clarification as authoritative narrowing of the current decision while retaining original text for context/audit. Ask again only for unresolved facts or actual contradictions.
2. **Private-help classification:** D1-09 says moving assistance is private rather than public policy and rejects it. Reference 51 is titled Family emergency affecting submitter's close relatives and describes direct social ties, but is encoded at city scope. The model's blanket public-policy requirement is unsupported by the prompt. Recommend not inventing a public-only eligibility rule; when a compatible reference is missing, explain that actual limitation and ask the relevant factual question instead of rejecting merely because help is personal. Whether the city reference should fit this localized request remains a genuine reference/scope decision; never force city scope or alter the library to manufacture a pass.

All 10 passes retain exactly one reference. This pilot therefore provides no real-model acceptance evidence for multi-reference blending, 4+-chain review or full-population scoring. Existing offline math tests remain distinct evidence. Full-population memory and publication-capacity blockers also remain unresolved.

## Next attention gate

Confirm the recommended clarification precedence and handling of personal-help/reference mismatch. Then prepare the corresponding focused offline correction/spec decision. No additional paid request, expanded allowance, library edit, model upgrade, deployment or scope coercion is authorized by this report. Because only one review slot remains, any later test plan must explicitly fit the original bound or request a precise changed bound; never reset the budget. Sol Medium remains sufficient for this review and offline correction.

Validation: Node 175 passed, five optional skips; Python 140 run, two optional skips. Reuse tests check immutable hashes, original prompt provenance and forbidden case changes. Earlier actual Check/Create/Join emulator parity predates the latest prompt edits; no new full-population/browser acceptance is claimed. Final CI is checked on the pushed head.

CI portability correction: reuse unit tests compute the local fixture plan hash to accommodate checkout line endings; real launcher authorization hashes and all recorded receipts remain unchanged. Local full Node suite passes after the test-only fix.
