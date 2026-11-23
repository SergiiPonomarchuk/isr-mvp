# Post-DB-audit restoration log

Author instruction (2026-11-23): log the unresolved cases, restore missing data after the DB audit, and proceed with the remaining224 verified cases now. This is a follow-up commitment, not permission to invent source metadata or run paid generation. Existing Values and retained artifacts remain unchanged during the current grounding work.

| Deferred problem | Profile IDs |
|---|---|
| Invalid/missing grounding metadata | 1, 5701, 5702, 6017, 6107, 7044 |
| Missing/invalid source hash | 86, 96, 3688, 4453, 4535 |
| Narrative/source hash mismatch | 1016, 3974 |
| Invalid retained source layout | 18, 125 |
| Invalid stored layout | 66 |

Status: deferred until the DB audit establishes what is missing and which original sources/layouts are authoritative. Review and restore verified source data first; do not rewrite hashes to force a match, infer grounding from Values scores, or repair malformed vectors silently. If original evidence cannot be recovered, present the remaining gap and proposed remedy/budget to the author. Keep these IDs excluded from automatic grounding patches even if a later input file changes.

The database audit must also track other missing metadata and data it discovers. This phase restores only the grounding/provenance subset; it does not invent historical timestamps, vector IDs or overall-confidence fields. A concrete post-audit restoration plan and author-only live steps follow the audit.

## 2026-11-23 audit result

The scoped DB audit is complete; see DB-completeness-audit-report.md. All four retained user archives have matching narratives for the16 profiles but no Values metadata, so they provide zero exact grounding recovery candidates. The original source/layout gates still fail. Do not mark these cases restored or bypass their provenance. The next16-case remedy requires another authoritative original source or separately approved candidate regeneration/provenance comparison. No regeneration was run.

The224 already-patched profiles have verified source values for the three deliberately omitted optional metadata fields; a separate R1 dry-run/recovery implementation is proposed, not executed. All184 message-count mismatches predate this audit and need a counting-convention decision. Values/X coverage gaps remain separate data preparation, not established lost data.
