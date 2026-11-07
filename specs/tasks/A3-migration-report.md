# A3 migration report

Generated 2026-11-05T08:24:44 by `scripts/migrate_a3.py`.
Source: claude_export/. Mode: dry run (nothing written).

| Item | Count |
|---|---|
| Ad-hoc publics | 192 |
| Publics without a stored location, μ or σ (unchanged) | 112 |
| Publics already up to date (G and anchor type match the rule; not refitted) | 0 |
| Publics recomputed | 74 |
| of which relevance weights from the issue / recovered | 8 / 66 |
| Publics skipped | 6 |
| Members recomputed | 1229 |
| Nearest anchor: home / work / property / none | 1083 / 146 / 0 / 0 |
| G changed by > 0.001 | 1125 |
| of which nearest anchor home / work / property / none | 981 / 144 / 0 / 0 |
| Relevance changed by > 0.001 | 1124 |
| Members whose relevance falls to 0.15 or below (they stay members) | 0 |
| ISR changed by > 0.001 | 1179 (of 1179 members with ISR) |

## Relevance change (new − old)

min -0.701, 5% -0.700, median -0.160, 95% +0.700, max +0.800; mean |change| 0.404.

## ISR change (new − old)

min -0.600, 5% -0.438, median -0.125, 95% +0.582, max +0.861; mean |change| 0.284.

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
| (0.1, 0.2, 0.6, 0.1) | 1 |
| (0.31, 0.4, 0.17, 0.12) | 1 |
| (0.298, 0.4, 0.208, 0.094) | 1 |
| (0.185, 0.399, 0.329, 0.086) | 1 |
| (0.295, 0.49, 0.165, 0.05) | 1 |
| (0.39, 0.3, 0.23, 0.08) | 1 |
| (0.295, 0.4, 0.214, 0.091) | 1 |
| (0.299, 0.604, 0.052, 0.044) | 1 |
| (0.2, 0.6, 0.1, 0.1) | 1 |

## Skipped publics (unchanged)

- `109`: the G weight is not identifiable from the stored values
- `140`: the G weight is not identifiable from the stored values
- `142`: the G weight is not identifiable from the stored values
- `150`: the G weight is not identifiable from the stored values
- `162`: the G weight is not identifiable from the stored values
- `48`: the G weight is not identifiable from the stored values

G changes for members whose nearest anchor is home come from replacing a stored G that is not reproducible from the stored data (A3 impact report), not from the anchor rule.

## Emulator run (2026-11-05)

- Emulator cleared and reseeded from `claude_export/` (`scripts/seed_emulator.py`), then `migrate_a2.py --apply` (same counts as the A2 report), then `migrate_a3.py`.
- Dry run against the emulator: 74 publics recomputed, 6 skipped, 1,225 members (4 fewer than the export: the memberships A2 removed).
- `--apply`: 1,225 member updates (`G_score`, `G_anchor_type`, `relevance_score`, `normalized_relevance`, `isr_score`).
- Second run after `--apply`: all 74 publics up to date; 0 G, relevance or ISR changes (idempotent).
- Not run against the live project. That run is the author's step, after the A2 migration: a dry run on a fresh export first, then `--project <id> --i-know-this-is-live --apply`.
