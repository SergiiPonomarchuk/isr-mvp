# L1 migration report

Generated 2026-11-09T12:36:52 by `scripts/migrate_l1.py`.
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Mode: dry run (nothing written). New deadline: 2026-12-09.

## Changes

| Item | Count |
|---|---|
| chat: deadline earlier -> new date | 1 |
| chat: deadline missing -> new date | 112 |
| todo: discussion status -> approved | 1 |
| topics: chat | 113 |
| topics: inactive | 1 |
| topics: todo | 2 |
| topics: voting | 77 |
| voting: deadline earlier -> new date | 77 |
| voting: discussion status -> Voting | 77 |
| documents to update: discussions | 191 |
| documents to update: issues | 78 |

## Preview: the deadline run on 2026-12-10 with today's options and votes

| Phase | Outcome | Reason | Topics |
|---|---|---|---|
| chat | cancel | no options | 113 |
| voting | cancel | below 30 % voted | 8 |
| voting | cancel | no votes | 69 |

Topics that would not be canceled: none.

Prolonging again before that date (a later `--new-deadline`) postpones the run; proposing options in chats and voting with at least 30 % of a public's ISR-score changes the outcome.
