# A2 migration report

Generated 2026-11-04T23:50:39 by `scripts/migrate_a2.py`.
Source: claude_export/. Mode: dry run (nothing written).

## Counts

| Item | Count |
|---|---|
| Ad-hoc publics | 192 |
| Members | 3099 |
| Members recomputed | 3045 |
| `resources_expertise` deleted (of which > 0) | 3045 (886) |
| Education part raised to the age floor | 1923 |
| E higher / lower than before (> 0.001) | 1559 / 622 |
| ISR changed by > 0.001 | 2948 |
| Issue docs with deleted fields | 80 |
| Discussion docs with deleted fields | 2 |
| Members removed (born after the issue's registration) | 4 |
| Publics skipped | 2 |
| Members without a valid birthDate | 0 |
| Publics without a registration date | 0 |

## ISR change (new − old)

min -0.593, 5% -0.133, median +0.000, 95% +0.132, max +0.412; mean |change| 0.057.

## ISR weights used

| Source | (w_R, w_E, w_C) | Publics |
|---|---|---|
| recovered | (0.4, 0.3, 0.3) | 133 |
| recovered | (0.4, 0.2, 0.4) | 49 |
| recovered | (0.5, 0.2, 0.3) | 8 |

## Members removed: born after the issue's registration

| Public | User id |
|---|---|
| 172 | 9119 |
| 90 | 9119 |
| 91 | 9124 |
| 97 | 9124 |

## Skipped publics

- `7P45rAMiYJILlWsiFeaW`: 25 members without stored Expertise/ISR (never backfilled)
- `muhSxCg3KQCiyon46dua`: 25 members without stored Expertise/ISR (never backfilled)

## Deleted issue/discussion fields

- `w_education`: 82 docs
- `w_experience`: 82 docs
- `w_resources`: 82 docs

## Emulator run (2026-11-04)

- `scripts/seed_emulator.py` loaded `claude_export/` into the Firestore emulator (users 9,151; issues 80; microcommunities 192; members 3,099; discussions 192; messages 1,694; user_vectors 9,150).
- Dry run against the emulator: identical counts to the export dry run above.
- `--apply` on the emulator: 3,135 document updates. Checks afterwards (AC4): 0 docs with an obsolete field; 0 members below their age floor (recomputed from `birthDate` and the issue's registration date); no age or floor field stored; the 4 members born after the issue's registration are gone from the members, from the discussion maps, and the public's `member_count` is reduced.
- Second run after `--apply`: 0 E changes, 0 ISR changes (idempotent).
- Not run against the live project. That run is the author's step: first a dry run on a fresh export (`export_live_db.py`), then `--project <id> --i-know-this-is-live`.
