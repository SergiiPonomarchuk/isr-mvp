# A5 emulator verification

Recorded 2026-11-12. Implementation `a817694`, based on U8 `0eddbc6`; emulator-only project `project-a3d59130-5adf-4677-9e2`, Firestore `127.0.0.1:8080`. No deployment, live/rules change, migration apply or issue creation.

## Tests and captured-result replay

- Node 98 passed (seven new guard regressions); Python 73 run, 72 passed and one skipped.
- Captured P2 result replayed through paramsFromAi and the actual D/G modules, keeping its point, mu 40 / sigma 30 and weights fixed. Before: 1,033 eligible within 130 m plus 3,908 unrelated owners bypassing it. After: the same 1,033 eligible people, zero unrelated owners bypassing it. Of the preserved group, 138 use property as their nearest anchor; this is not claimed to be a count exclusively of landlords.
- Fixture tests specifically preserve an owner living elsewhere whose property is at the affected building, city/region/broader ownership cases, explicit place matches and garage-kind inclusion. Both demographic aliases are guarded without mutating inputs. A mocked model ignoring p4 is corrected while the original filters remain in raw_output.

## Endpoint checks

The exact two P2 issue bodies were reused, with no numerical overrides. Both used ai_source model and prompt version p4. Logs' normalized output, shown response and stored draft demographic rules agree.

| Case | mu / sigma (m) | Full candidates | Effective property kinds |
|---|---|---|---|
| h5 entrance lock | 40 / 30 | 1033 (formerly 4,941) | [] |
| garage fire safety | 50 / 40 | 1391 | [garage] |

- Building resolved to the same home `[47.590114, 7.611201]`. The 1,033 local/property-linked candidates match the captured-result audit; P2's building-locality criterion passes on A5.
- Garage used the same creator-selected stored property `[47.589962, 7.610119]`; 25/25 displayed candidates remain verified garage owners. Full 1,391 count is not claimed to contain owners only. The model changed garage mu from 60 to 50 m, sigma remained 40 m; this variation is reported rather than hidden.
- The original offending P2 draft Create returned 409 `The issue scope needs a new check: check again.` before any issue/model call. New corrected drafts pass the same validation in unit tests. No old draft/public/member record was rewritten.

## Usage and checkpoint

- Two text-model calls, two embedding calls; no Nominatim lookup.
- 16,632 prompt / 2,030 output tokens; approximately 121 embedding input tokens estimated.
- Estimated $0.00722 at A4's recorded paid rates (text $0.25/M input, $1.50/M output; embeddings $0.15/M).
- Final export metadata: **2026-11-12 06:36 UTC**, successful CLI export. Preview remains running from the A5 branch with Java heap 8 GB. The U8 frontend is unchanged; no additional browser model call was needed for this server-only guard.
- P2 AC4 is resolved in this tested stack. Merge and deploy A5 in the coordinated code release before relying on that behavior on live; P2's live AC5 remains the author's step.
