# SPEC A1b: An expertise placeholder for publics without E and ISR

Status: IMPLEMENTED on branch `a1b-expertise-placeholder` 2026-11-09 (emulator applied and checked; live dry run done). The author's live `--apply` is pending. APPROVED 2026-11-09 (author: "option b", U3 decision 6).
Branch: a1b-expertise-placeholder (from `u4-voting-messages-fix` at `b7b0d44` + U4; never main)
Source: the author asked (2026-11-09) that every discussion member have E and ISR, after U3 showed "N/A" for the members of the app-created publics.
Supersedes in part: A1 R11 ("The 2 app-created publics without E stay without ISR until stage 1"). Stage 1 still replaces the placeholder with real E.

## 1. Context (verified 2026-11-09)

| Fact | Evidence |
|---|---|
| **E needs the issue vector:** it is the cosine of the member's skill vectors with the issue vector. No issue vector is stored for any topic (0 of 194 discussions on the emulator), and the embedding model of the skill vectors is retired. | `functions/index.js:80, 295-296`; EMBEDDINGS #7, #12; roadmap stage 1 |
| **A1 left these publics without E and ISR until stage 1.** They are the publics created by the app before A1: the 2 of June 2026, and on live also the R0 smoke-test public. | A1 R11; A1 status log |
| Counts: | |
| - emulator: 2 publics, 50 members; | emulator, 2026-11-09 |
| - live: 3 publics, 150 members (`7P45rAMiYJILlWsiFeaW` / topic `upynfJPHa17to8JYV5bV` 25, `muhSxCg3KQCiyon46dua` / `qTkvs4PP90KIiOt0o6kF` 25, `id70DNNSVTNUYpjFv9cN` / `nN4sPhX49dxLqmbuKada` 100). | live dry run, 2026-11-09 |
| Their members have R (`relevance_score`) but no `expertise_score`, `isr_score` or `normalized_*`, and their topics' `isr_scores` maps are empty. Their issues hold aggregation weights. | emulator and live dry run |
| The A1 rule normalises all-equal values to 1.0 (also all zero). | `functions/isr.js:125-132`; `scripts/isr_core.py:42-52`; A1 decision 1 |
| New publics already get E and ISR from `createIssue`. Without a working AI call, their E comes from a random issue vector (a stage 1 gap, not changed here). | `functions/ai-helper.js:33`; `functions/index.js:276-323` |

## 2. Requirements

- R1 `scripts/migrate_a1b.py` (dry run by default; emulator unless `--project … --i-know-this-is-live`; the live `--apply` is the author's step). For each public where no member has E and no member has an ISR:
  - each member gets `expertise_score` 0.0 and `expertise_source` "no_issue_vector". `education_expertise` and `experience_expertise` are not written, because they were not computed.
  - The ISR is computed with the A1 formula (`isr_core.isr_for_public`, the port of `functions/isr.js`) from the stored R, this E and the constant contribution placeholder. The weights are the issue's, else the discussion's, else 0.4 / 0.3 / 0.3. It is written as `createIssue` writes it: `normalized_relevance`, `normalized_experience`, `normalized_contribution`, `contribution_source`, `isr_score`, 3 decimals.
  - The `relevance_scores` and `isr_scores` maps of the topic's discussion and issue are rewritten from the member values, as `migrate_a1.py` does.
- R2 A public where only some members have E or ISR is left alone and listed in the report. A second run changes nothing.
- R3 Report: the publics changed (members, weights and their source, ISR range, maps rewritten) and the publics left alone. Ids only, no personal fields.
- R4 Tests (`tests/test_migrate_a1b.py`):
  - the placeholder values and the ISR arithmetic;
  - the weights fallback;
  - publics that are complete or mixed stay untouched;
  - a second run changes nothing;
  - the report holds no personal fields.

## 3. Decisions

1. Option b (author, 2026-11-09): a neutral placeholder now; stage 1 replaces it. The alternative was waiting for stage 1.
2. E is 0.0, not missing, so that every display and the tally have a number. All members of the public have the same E, so its normalised value is 1.0 for everyone. The ISR order inside the public then follows R. The browser shows E as 0.00 for these members.
3. The placeholder is marked (`expertise_source: "no_issue_vector"`), like the contribution placeholder (`contribution_source: "constant"`), so the paper and stage 1 can find it.

## 4. Non-goals

- Real E for any public (stage 1), and storing issue vectors.
- Changing `createIssue`, the browser or the trigger. They already read `isr_score` from the member documents.
- No rules change; no deploy needed (data only).

## 5. Acceptance criteria

- AC1 Unit tests and CI green: Python 52 (4 new), Node unchanged.
- AC2 Emulator: the dry run lists the 2 publics (50 members, 4 maps). `--apply` writes them, and a second run changes nothing.
- AC3 Emulator: every stored ISR equals `functions/isr.js` on the stored R and E, and the topic maps equal the members. The browser shows the member's ISR instead of "N/A".
- AC4 Live dry run (agent, read-only): lists the expected publics and nothing left alone.
- AC5 Live (author): `--apply`, then a second dry run with no changes; the report is saved as `A1b-migration-report-live.md`.

## 6. Status log

- Spec and implementation 2026-11-09 (agent), after the author chose option b.
- Tests: Python 52 (4 new); Node 40 (unchanged by A1b).
- Emulator (2026-11-09):
  - Dry run: 2 publics, 50 members, 4 topic documents.
  - Apply: 54 documents, report [A1b-migration-report.md](A1b-migration-report.md).
  - Second dry run: nothing to change.
  - Every one of the 50 stored ISRs equals `isr.js`, all with `expertise_source` "no_issue_vector", and the discussion maps equal the members.
  - In the browser, user 37 in chat `qTkvs4PP90KIiOt0o6kF` now sees "ISR-score 0.70" (was "N/A").
- Live dry run (2026-11-09, read-only, on the author's request): 193 publics; 3 get the placeholder (150 member documents, 6 topic documents); none left alone.

  | Public | Topic | Members | Weights R / E / C | ISR min / median / max |
  |---|---|---|---|---|
  | `7P45rAMiYJILlWsiFeaW` | `upynfJPHa17to8JYV5bV` | 25 | 0.50 / 0.20 / 0.30 | 0.955 / 0.958 / 1.931 |
  | `id70DNNSVTNUYpjFv9cN` | `nN4sPhX49dxLqmbuKada` | 100 | 0.65 / 0.15 / 0.20 | 0.537 / 1.005 / 1.005 |
  | `muhSxCg3KQCiyon46dua` | `qTkvs4PP90KIiOt0o6kF` | 25 | 0.40 / 0.30 / 0.30 | 0.705 / 1.012 / 1.013 |

- Live apply (author): pending.
