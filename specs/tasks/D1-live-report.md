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
| Nonmember preflight | Fixed synthetic profile 1 exists and is outside the current 100-member public; read-only, masked fields |
| Successful Check pairs accounted | Thirteen of fifteen; seed journal does not independently count hidden transport retries |

Evidence: `../demo/live-acceptance-evidence.json`. Full live execution journal and reports stay outside git in `A:/BackUp/isr-mvp/rollouts/d1-20261114-123138`. Preserve the presentation-started manifest and original drafts; never reuse the committed emulator journal on live. The local port-5002 guide is for the emulator.

Next: author adopts verified nonmember profile 1 and Checks the original exact title/body once, then explicitly Joins the existing issue to reach 101. Creator exact-title and genuine paraphrase checks already passed. Record canonical post-Join scores/maps/event without inventing weights. Continue with author discussion/options, management threshold, weighted vote, stored winner and tasks; independent checker and author review must agree. AC5 remains pending until those complete. No additional seeding/reset, unapproved budget, agent production writes or agent deployment.
