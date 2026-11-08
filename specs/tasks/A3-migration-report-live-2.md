# A3 migration report

Generated 2026-11-08T15:27:32 by `scripts/migrate_a3.py`.
Source: LIVE project project-a3d59130-5adf-4677-9e2. Mode: APPLIED.

| Item | Count |
|---|---|
| Ad-hoc publics | 192 |
| Publics without a stored location, μ or σ (unchanged) | 112 |
| Publics already up to date (G and anchor type match the rule; not refitted) | 73 |
| Publics recomputed | 1 |
| of which relevance weights from the issue / recovered | 1 / 0 |
| Publics skipped | 6 |
| Members recomputed | 25 |
| Nearest anchor: home / work / property / none | 25 / 0 / 0 / 0 |
| G changed by > 0.001 | 0 |
| of which nearest anchor home / work / property / none | 0 / 0 / 0 / 0 |
| Relevance changed by > 0.001 | 0 |
| Members whose relevance falls to 0.15 or below (they stay members) | 0 |
| ISR changed by > 0.001 | 0 (of 0 members with ISR) |

## Relevance change (new − old)

min -0.000, 5% -0.000, median -0.000, 95% +0.000, max +0.000; mean |change| 0.000.

## ISR change (new − old)

none.

## Relevance weights used (w_D, w_G, w_S, w_X)

Where D, S or X are constant in a public, their weights are not unique; the row shows one solution. The G weight is always unique (checked), so the recomputed relevance does not depend on that choice.

| Weights | Publics |
|---|---|
| (0.1, 0.2, 0.6, 0.1) | 1 |

## Skipped publics (unchanged)

- `109`: the G weight is not identifiable from the stored values
- `140`: the G weight is not identifiable from the stored values
- `142`: the G weight is not identifiable from the stored values
- `150`: the G weight is not identifiable from the stored values
- `162`: the G weight is not identifiable from the stored values
- `48`: the G weight is not identifiable from the stored values

G changes for members whose nearest anchor is home come from replacing a stored G that is not reproducible from the stored data (A3 impact report), not from the anchor rule.
