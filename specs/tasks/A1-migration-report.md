# A1 migration report

Generated 2026-11-08T21:24:09 by `scripts/migrate_a1.py`.
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Mode: dry run (nothing written).

## Maps

| Item | discussions | issues |
|---|---|---|
| docs | 192 | 80 |
| docs updated | 192 | 80 |
| relevance changed | 1282 | 517 |
| relevance added | 24 | 801 |
| relevance removed | 168 | 0 |
| isr changed | 3039 | 493 |
| isr added | 0 | 776 |
| isr removed | 194 | 25 |

Users removed from at least one map (not members of that public): 26; user "1" removed from 168 docs.

## Tallies of issues with votes

Issues with votes: 14; the leading option changes in 0; votes no longer counted (no ISR for that public): 6.

| Issue | Status | Votes | Old scores (old leader) | New scores (new leader) | Not counted |
|---|---|---|---|---|---|
| 155 | in_process | 1 | 0.00, 1.39 (1) | 0.00, 1.41 (1) | 0 |
| 167 | in_process | 1 | 1.20, 0.00 (0) | 1.45, 0.00 (0) | 0 |
| 173 | in_process | 1 | 1.05, 0.00 (0) | 1.85, 0.00 (0) | 0 |
| 176 | in_process | 1 | 1.05, 0.00 (0) | 1.24, 0.00 (0) | 0 |
| 177 | in_process | 1 | 1.20, 0.00 (0) | 1.23, 0.00 (0) | 0 |
| 179 | in_process | 4 | 5.56, 0.00 (0) | 5.11, 0.00 (0) | 0 |
| 181 | in_process | 1 | 1.28, 0.00 (0) | 1.18, 0.00 (0) | 0 |
| 182 | tasks | 6 | 6.19, 1.20, 0.00 (0) | 5.68, 1.06, 0.00 (0) | 0 |
| 186 | in_process | 1 | 0.00, 0.00 (-) | 0.00, 0.00 (-) | 1 |
| 24 | in_process | 2 | 0.00, 0.00 (-) | 0.00, 0.00 (-) | 2 |
| 40 | in_process | 1 | 0.00, 0.00 (-) | 0.00, 0.00 (-) | 1 |
| 44 | in_process | 1 | 0.00, 0.00 (-) | 0.00, 0.00 (-) | 1 |
| 46 | in_process | 1 | 0.00, 0.00 (-) | 0.00, 0.00 (-) | 1 |
| 57 | in_process | 1 | 1.05, 0.00 (0) | 1.49, 0.00 (0) | 0 |

Old = the browser before A1 (cached map, else member ISR, else 1.5 x relevance). New = member ISR via the shared module. Already approved issues keep their stored winner; the tally is only recomputed by the trigger when an issue is approved again.
