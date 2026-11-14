# U11 — reliable synthetic profile adoption search

Scope: repair the profile-search blocker found during approved D1 live acceptance. This is a bounded correctness fix, not a change to authentication, authorization, registration, scoring or issue matching. Work on `codex/profile-search-fix`, based on merged release `236e7d3`. Plan: reproduce read-only; repair exact ID and specific full-name retrieval; run the actual search handler with regression fixtures and masked emulator reads; document and open a PR. Deployment remains the author's step.

## Observed defects

- Searching `1` fetches the existing record, then the shared display-name substring filter rejects it because its name does not contain `1`.
- Searching the reviewed synthetic name Michael Sherman fetches 107 distinct candidates from first-term prefix queries but never fetches the intended record. The displayName query is capped at 50 before the remaining name terms are considered.
- Read-only live reproduction confirms both failures; no private profile fields printed, provider call or production write.

## Required behavior

1. A trimmed all-digit search is an exact ID search. Fetch by document ID and by numeric/string uid representations (numeric only when safely representable). Do not require a display-name substring match for those exact results. Do not treat a numeric first token plus other words as ID-only input.
2. For a multiword name, also query displayName using the complete normalized input, its existing title-case convention, and lowercase form as bounded prefixes. Merge/deduplicate these candidates with existing first-token displayName/firstName/lastName prefix searches. This must retrieve a specific full name even beyond the first 50 common-first-name candidates. Preserve all-term name matching and existing single-token behavior. No full collection scan or unbounded query.
3. Apply existing gender, profession and age filters to both ID and name results. Preserve adoption's existing local-session/reload behavior. No database write in search or adoption; no registration/API/rules changes.
4. Clarify the existing field's placeholder to say name or ID. Preserve main.js CRLF and lone final CR, and use exact small edits.

## Acceptance

- Actual initLoginPage search handler finds an exact numeric document without requiring its name to contain digits, and finds uid-backed records for both numeric and string uid types without duplicate cards.
- A target following more than 50 same-first-name records is found by full-name input; lowercase/full-name and single-token search remain supported under existing casing conventions.
- Gender/profession/age mismatches still exclude an ID result. Adoption stores the selected identity locally and reloads; fake database exposes no write operation.
- Patched handler with masked real emulator queries finds the reviewed synthetic IDs/names. No production writes, deploys, model calls or secret reads/copies.
- Required Node/Python suites and final-head CI pass. Author separately merges and deploys hosting before live acceptance resumes. Do not spend another issue Check while login is blocked.

## Status log

- 2026-11-14: Plan stated; both failures reproduced with read-only, field-masked live queries. Feature branch prepared; implementation and verification in progress. D1 successful Check pairs remain 13/15; no additional provider requests.

- 2026-11-14 implementation/verification: exact numeric ID results bypass only the name-substring filter; both string/numeric uid lookup representations deduplicate. Multiword displayName prefix queries retrieve the specific name in addition to the bounded first-token searches. Existing gender/profession/age filters and local adoption/session behavior retained; placeholder clarifies ID support. Nine focused regression cases passed; five fail against the old source. Actual initLoginPage handler with masked real emulator queries passed all ten focused cases, including synthetic IDs 1/5 and full/lowercase names. Required suites: Node 119 passed, three optional integration skips; Python 120 run, two optional skips. CRLF/lone final CR and frontend syntax preserved. No source/server/rules/data/model changes outside the focused frontend correction; production writes/provider calls zero. CI checked on final pushed head; merge and hosting-only deployment remain author steps.
