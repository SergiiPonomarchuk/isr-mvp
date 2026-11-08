# A2 migration report

Generated 2026-11-08T14:48:56 by `scripts/migrate_a2.py`.
Source: LIVE project project-a3d59130-5adf-4677-9e2. Mode: APPLIED.

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
