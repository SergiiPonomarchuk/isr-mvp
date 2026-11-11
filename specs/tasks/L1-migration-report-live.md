# L1 migration report

Generated 2026-11-09T14:53:54 by `scripts/migrate_l1.py`.
Source: LIVE project project-a3d59130-5adf-4677-9e2. Mode: APPLIED. New deadline: 2026-12-09.

## Changes

| Item | Count |
|---|---|
| chat: deadline earlier -> new date | 1 |
| chat: deadline missing -> new date | 113 |
| todo: discussion status -> approved | 1 |
| topics: chat | 114 |
| topics: inactive | 1 |
| topics: todo | 2 |
| topics: voting | 76 |
| voting: deadline earlier -> new date | 76 |
| voting: discussion status -> Voting | 76 |
| documents to update: discussions | 191 |
| documents to update: issues | 78 |

## Preview: the deadline run on 2026-12-10 with today's options and votes

| Phase | Outcome | Reason | Topics |
|---|---|---|---|
| chat | cancel | no options | 113 |
| chat | to_voting | options proposed | 1 |
| voting | cancel | below 30 % voted | 9 |
| voting | cancel | no votes | 67 |

Topics that would not be canceled: 65 (chat -> to_voting).

Prolonging again before that date (a later `--new-deadline`) postpones the run; proposing options in chats and voting with at least 30 % of a public's ISR-score changes the outcome.
