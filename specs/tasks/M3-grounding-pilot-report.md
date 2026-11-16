# M3 grounding correction and pilot result � 2026-11-17

Author approved the exact-input quotation correction and controlled resumption within the existing 20 cumulative review attempts, 45 embedding texts / 17 POSTs and original total US$0.50. Prompt version 3 now forbids reference-title copying, gives a synthetic input-quote example and describes aspect.text in the provider schema. Validation, models and arithmetic are unchanged.

## Observed results

- D1-01-live entrance lock passed: reference 1, home anchor, actual input aspect quotation and unrestricted demographic defaults. One aspect text embedded.
- D1-02 pothole passed: reference 21, explicit supplied named-place context and actual input quotation. One selection text and one aspect text embedded.
- D1-03 playground stopped: exact quotation now passes, but the model returned neighborhood while retaining reference 32, whose scope is street_segment. The unchanged server only permits equal scopes or the unit/building pair. It rejected the mismatch before any playground aspect embedding.
- Remaining cases were not run. This is two validated case completions and one rejected response, not full pilot acceptance, score-quality acceptance or an assertion that scope should be forced to match the reference.

Cumulative usage: **7 reviews / 3 embedding texts / 3 embedding POSTs / 10 HTTP attempts**. Conservative reservation **US$0.098801**. Reported metadata across known responses: 4,391 input / 1,362 output tokens, 5,753 total; estimated US$0.003142. Metadata does not cover HTTP 400 responses or all embedding usage; unknown reservations remain counted. No database RPCs, geocoding, production writes, profile re-embedding or deployment. All prior receipt histories and the new receipt remain unchanged and counted once.

## Free prompt-versus-validator audit

| Contract | Prompt/schema coverage | Finding / next proposed clarification |
|---|---|---|
| Actual input aspect/evidence quotations | Explicit instruction plus aspect schema description in v3 | Two actual cases now pass; retain captured-failure regression and strict matching. |
| Scope compatibility | Prompt only says compatible physical scopes | Exact server relation is absent: equal scope or unit/building pair only. Explain it explicitly. Never force a genuinely different issue into the reference scope merely to pass. Ask for factual clarification or return not_consistent when no compatible retained reference exists. |
| Reference coverage | Prompt requires accepted or substantive exclusion for every raw candidate | State no unknown/duplicate candidate IDs, no overlap and no uncovered raw candidate; no arbitrary trimming. |
| Aspect-reference links | Schema supplies IDs, prompt says evidenced aspects | State unique safe IDs, accepted.aspect_id must name an emitted aspect and every emitted aspect must be used. |
| Demographics/location | Shared enums plus detailed instructions and strict evidence/default rules | Keep as implemented; do not relax or infer topic features. |
| Bounds after provider compaction | Some limits only explicit in server | State input quote 3�2,000 chars, ID at most 40 chars, messages at most 1,000, questions/reasons at most 500, place at most 200, lists at most 20, demographic evidence at most 64; preserve strict server limits. No large provider grammar bounds restored. |

The scope gap is confirmed from the saved request, response, reference table and validator. The other rows are an offline coverage audit, not evidence those failures occurred. No next-version prompt or further paid call has been made.

## Proposed next authorization

Approve **contract alignment and bounded completion**: explain the existing validator contract comprehensively in the prompt, with offline tests first, then resume only the remaining pinned cases within the SAME 20/45/17/original US$0.50 limits. No changed compatibility rule, automatic output repair, model upgrade or new issue input is proposed.

Retain the first two completed version-3 cases with their exact input/vector/prompt/source provenance; revalidate them offline under unchanged semantic validation. Do not claim they were rerun under a later prompt. Pin any later prompt version separately and disclose the mixed-version pilot. Starting from seven used reviews leaves thirteen review slots; the remaining twelve pinned cases including conditional answers fit, with one spare, and all embedding reservations remain counted. Reuse saved selection/aspect vectors only with exact model/task/template/text hashes; never reset receipts or silently repeat successful requests.

This proposed permission would allow offline-tested prompt explanations of EXISTING validator rules without a new approval after each mechanical contract rejection, while stopping for genuine ambiguity about issue scope/affectedness, unrelated decisions, safety/policy, budget exhaustion or interpretation changes. It does not authorize weakening validation, choosing the reference scope over the user's meaning, or iterative model/policy changes. Until approved, no further request or prompt alignment implementation occurs.

Full-population memory and publication-capacity blockers remain separate. Sol Medium and the current application models remain sufficient.

Final checks: Node 173 passed, five optional skips; Python 140 run, two optional skips. Captured-scope regression verifies exact quotations do not bypass compatibility, and its altered-scope variant is explicitly a synthetic diagnosis, not repaired model output.
