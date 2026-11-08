# A3 migration report

Generated 2026-11-08T14:58:01 by `scripts/migrate_a3.py`.
Source: LIVE project project-a3d59130-5adf-4677-9e2. Mode: APPLIED.

| Item | Count |
|---|---|
| Ad-hoc publics | 192 |
| Publics without a stored location, μ or σ (unchanged) | 112 |
| Publics already up to date (G and anchor type match the rule; not refitted) | 0 |
| Publics recomputed | 73 |
| of which relevance weights from the issue / recovered | 7 / 66 |
| Publics skipped | 7 |
| Members recomputed | 1200 |
| Nearest anchor: home / work / property / none | 1054 / 146 / 0 / 0 |
| G changed by > 0.001 | 1121 |
| of which nearest anchor home / work / property / none | 977 / 144 / 0 / 0 |
| Relevance changed by > 0.001 | 1120 |
| Members whose relevance falls to 0.15 or below (they stay members) | 0 |
| ISR changed by > 0.001 | 1175 (of 1175 members with ISR) |

## Relevance change (new − old)

min -0.701, 5% -0.700, median -0.184, 95% +0.700, max +0.800; mean |change| 0.412.

## ISR change (new − old)

min -0.600, 5% -0.438, median -0.125, 95% +0.583, max +0.861; mean |change| 0.284.

## Relevance weights used (w_D, w_G, w_S, w_X)

Where D, S or X are constant in a public, their weights are not unique; the row shows one solution. The G weight is always unique (checked), so the recomputed relevance does not depend on that choice.

| Weights | Publics |
|---|---|
| (0.3, 0.4, 0.2, 0.1) | 11 |
| (0.2, 0.7, 0.05, 0.05) | 11 |
| (0.2, 0.4, 0.3, 0.1) | 6 |
| (0.2, 0.5, 0.2, 0.1) | 4 |
| (0.3, 0.6, 0.05, 0.05) | 3 |
| (0.3, 0.5, 0.15, 0.05) | 2 |
| (0.305, 0.4, 0.185, 0.111) | 1 |
| (0.607, 0.2, 0.078, 0.115) | 1 |
| (0.306, 0.401, 0.179, 0.114) | 1 |
| (0.21, 0.4, 0.285, 0.105) | 1 |
| (0.305, 0.401, 0.181, 0.113) | 1 |
| (0.21, 0.4, 0.29, 0.1) | 1 |
| (0.302, 0.4, 0.193, 0.105) | 1 |
| (0.22, 0.7, 0.0, 0.08) | 1 |
| (0.197, 0.7, 0.058, 0.045) | 1 |
| (0.303, 0.601, 0.039, 0.057) | 1 |
| (0.305, 0.4, 0.181, 0.114) | 1 |
| (0.197, 0.7, 0.059, 0.043) | 1 |
| (0.294, 0.4, 0.217, 0.089) | 1 |
| (0.298, 0.597, 0.058, 0.047) | 1 |
| (0.198, 0.696, 0.058, 0.048) | 1 |
| (0.208, 0.701, 0.027, 0.064) | 1 |
| (0.2, 0.8, 0.0, 0.0) | 1 |
| (0.227, 0.401, 0.255, 0.117) | 1 |
| (0.396, 0.298, 0.217, 0.089) | 1 |
| (0.396, 0.296, 0.225, 0.083) | 1 |
| (0.272, 0.594, 0.124, 0.011) | 1 |
| (0.297, 0.399, 0.214, 0.09) | 1 |
| (0.198, 0.7, 0.057, 0.045) | 1 |
| (0.15, 0.4, 0.38, 0.07) | 1 |
| (0.193, 0.4, 0.311, 0.096) | 1 |
| (0.288, 0.396, 0.246, 0.071) | 1 |
| (0.203, 0.7, 0.041, 0.056) | 1 |
| (0.195, 0.699, 0.063, 0.042) | 1 |
| (0.31, 0.4, 0.17, 0.12) | 1 |
| (0.298, 0.4, 0.208, 0.094) | 1 |
| (0.185, 0.399, 0.329, 0.086) | 1 |
| (0.295, 0.49, 0.165, 0.05) | 1 |
| (0.39, 0.3, 0.23, 0.08) | 1 |
| (0.295, 0.4, 0.215, 0.09) | 1 |
| (0.299, 0.604, 0.054, 0.044) | 1 |
| (0.2, 0.6, 0.1, 0.1) | 1 |

## Skipped publics (unchanged)

- `109`: the G weight is not identifiable from the stored values
- `140`: the G weight is not identifiable from the stored values
- `142`: the G weight is not identifiable from the stored values
- `150`: the G weight is not identifiable from the stored values
- `162`: the G weight is not identifiable from the stored values
- `48`: the G weight is not identifiable from the stored values
- `7P45rAMiYJILlWsiFeaW`: 25 members without a user profile

G changes for members whose nearest anchor is home come from replacing a stored G that is not reproducible from the stored data (A3 impact report), not from the anchor rule.
