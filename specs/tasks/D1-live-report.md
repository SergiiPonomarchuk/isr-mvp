# D1 live acceptance — in progress, 2026-11-14

Reviewed/deployed release: `236e7d3`, after explicit author merges #33/#34/#28. Application matches accepted D1; no rules change. Author performs all production writes and deployment; agent checks production read-only.

| Gate | Recorded result |
|---|---|
| New live budget | Author approved 15 Check pairs and two place lookups; Paid/sufficient budget confirmed; no content regeneration/profile re-embedding |
| Fresh private backup | `A:/ISR/mvp/dbbackup/d1-20261114-123138`; correct live project; 25,000 documents/13 entries |
| Recovery rehearsal | All 25,000 typed documents restored and verified on isolated `demo-isr-recovery`/8185; ports closed, no export |
| Author deployment | Functions/hosting only; all 54 tracked source files match each of six active Node 22 function archives; all 14 hosted files match exactly, no-cache |
| Author seed/check/rerun | Ten scenario records, nine visible plus standby, 505 members, zero checker differences; rerun zero writes/requests |
| Actual seed usage | Ten journal Check pairs; 93,417 reported text tokens; one logged place request; no new content/profile embedding work |
| Normal live flagship | Author created it and accepted working 100-member list; hidden standby preserved; local journal recorded without a database write |
| Post-flagship independent check | 11 records including standby, ten visible cases, 605 members, zero differences |
| Creator duplicate UI | Exact active title: Open/already-member and Create blocked; paraphrased title/body: same issue found at the same affected place; author screenshots |
| Explicit nonmember Join | Author adopted verified synthetic ID 5 after U11 deployment and joined; 101 members, one Join event, unique participants/maps; independent post-Join checker 606 members, zero differences |
| Author discussion/options | Comparison message and two reviewed options saved; exact fields and six creator-assigned steps verified read-only |
| Management preflight | Pool 101.002; 30% threshold 30.3006; creator + 27-member coalition 31.142 ISR; no support yet |
| Successful Check pairs accounted | Fourteen of fifteen; seed journal does not independently count hidden transport retries |

Evidence: `../demo/live-acceptance-evidence.json`. Full live execution journal and reports stay outside git in `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`. Preserve the presentation-started manifest and original drafts; never reuse the committed emulator journal on live. The local port-5002 guide is for the emulator.

Next: author decides how to provide synthetic coalition inputs: manually adopt profiles, or approve preparation of a bounded author-run helper for the other 27 profiles while retaining creator's final phase/vote actions in the UI. Options/message are accepted. Management support, weighted vote, winner/tasks and final review remain; AC5 is pending. No support/phase write has been made by the agent. No further Check is needed.

## Observed login-search defect and workaround

Numeric-ID login search bug (author screenshot, 2026-11-14): the numeric lookup finds a profile, then the shared name filter incorrectly requires its display name to contain the number. Earlier numeric-ID login instructions were unsuitable for the current UI. Use full-name search for Michael Sherman (committed D1-02 synthetic creator, ID 5), verified read-only to be outside the flagship public. This workaround consumes no Check/model request; 13 successful Check pairs remain accounted. The full-name workaround also failed due to first-token query truncation. U11 now fixes both failures and merged as `db26dba` on explicit author instruction. Hosting deployment/verification is pending; after it, use ID 5. No additional live Check was consumed by these failed login searches.

U11 deployment accepted: author hosting-only deployment matched all 14 files exactly; numeric ID 5 search/adoption and subsequent 101st-member Join passed. Read-only audit/evidence are in `../demo/live-acceptance-evidence.json`.

## Author Start Voting support prepared — 2026-11-15

Author applied start-support (one discussion document). Read-only plan/audit confirm 27 selected supports, creator absent, phase still Chat; repeat preview is already_prepared with zero writes. Other support 30.142 ISR; creator brings it to 31.142 (30.833%). Next is Christine's final normal Deadline -> Start Voting action. Option votes, Finish support/result/tasks remain pending; no additional Check or agent live write.
