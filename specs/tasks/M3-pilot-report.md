# M3 real-model pilot result, 2026-11-17 Europe/Kyiv

**Stopped on the first schema failure; no automatic retry.** This is not a completed14-case evaluation or deployment acceptance. The remaining13 cases were not run.

| Observation | Result |
|---|---|
| Actual model | gemini-3.1-flash-lite, existing temperature/seed/config |
| Case | D1-01-live, building entrance-lock repair |
| Raw model outcome | pass; reference1, building scope, literal input evidence |
| Server acceptance | rejected: `Invalid property kind` |
| Cause | model supplied `property_kinds: ["building"]`; server's enum excludes building, while the prompt only described string[] |
| Other interpretation problems | home building labeled property; security/lock topic words used as profile feature filters |
| Requests | one review, one HTTP attempt, zero retries |
| New embeddings / geocoding / Firestore / production writes | all zero |
| Reported token usage |497 input +285 output =782 total |
| Token-based cost estimate |US$0.000552 using the recorded paid rates; not an invoice |
| Conservative reservation retained |US$0.013081 against originalUS$0.50 allowance |

The strict validator prevented the invalid response from becoming a scoring model/public. Removing the invalid enum alone is insufficient: an offline altered-response replay then passes validation but retains the semantic location and demographic problems. A synthetic resident fixture demonstrates D0 with the topic filters versus D1 without them; this is not a final-membership or actual-profile claim. A synthetic profile with separate home/property anchors resolves to different points under the model anchor versus U6 home logic. No new model call was used for either replay.

## Evidence

- [Durable receipt](M3-evaluation/pilot-20261117/ledger.json): attempt reserved before transport; complete usage; pinned sources and original author approval.
- [Original request](M3-evaluation/pilot-20261117/attempt-1-request.json), [literal response](M3-evaluation/pilot-20261117/attempt-1-response.json), [summary](M3-evaluation/pilot-20261117/summary.json).
- [Offline diagnosis](M3-evaluation/pilot-20261117/offline-diagnosis.json), reproducible with `node functions/test/mr1-pilot-diagnose.js` and the normal worktree NODE_PATH. This uses pure validators/resolvers only.

The harness was verified before loading the private existing credential:161 Node tests passed/five optional skips; Python140 run/two optional skips. Eight dedicated tests use the actual SDK with fake fetch responses, proving single-attempt failure handling, durable budget reservations, SDK batching, exact plan bindings, conditional cases and fail-stop behavior. Both pre-run CI jobs passed. No application/model/math/rules change was made.

## Next decision

Review the [concrete correction and rerun proposal](M3-context-contract-fix-proposal.md). It keeps the strict validator and models, supplies explicit structured enums, restores U6 anchor semantics and grounds demographic criteria in actual affected-person facts. No fix is implemented yet. Proposed bounded rerun uses the same pinned cases,45 embedding texts/17 embedding POSTs and the **same totalUS$0.50**; it needs approval for **15 cumulative review attempts**, counting the original one plus at most14 corrected reviews. Original receipt/reservation must carry forward and never be reset. The approved initial plan forbids automatic paid repair/retry, so another provider call remains unapproved.

The independent large-public capacity blocker and low-memory import gate remain. Do not deploy, rescore historical records, import the accepted snapshot over itself, weaken demographic validation, silently cap A/B or claim real-population success from this one schema probe.
