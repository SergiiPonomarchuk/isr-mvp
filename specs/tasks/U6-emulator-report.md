# U6 emulator acceptance report

Date: 2026-11-11. Code: `78c01e5` (U6 with A4 `67cb1bd`). Project `project-a3d59130-5adf-4677-9e2`; Firestore `127.0.0.1:8080`; functions `127.0.0.1:5001`. No live writes or deployments.

## AC1: unit checks

Node 88 passed. Python 73 run, 72 passed and one skipped. The key was loaded only by the emulator, never read or copied by the agent. CI is checked on the PR.

## AC2: description location

Synthetic uid 2's current P2 home is `[47.593671, 7.621699]`.

| Case | Analyzer anchor | Resolved source | Point |
|---|---|---|---|
| Entrance door of our house | home | home | `[47.593671, 7.621699]` |
| Potholes on Riehenstrasse in Basel | named_place | named_place | `[47.5667615, 7.6103866]` |
| Publish the city budget online | none | assumed_home | `[47.593671, 7.621699]` |
| Qzxvplmnonexistent Street | named_place | home_fallback | `[47.593671, 7.621699]` |

The named point lies inside the configured viewbox `[7.3, 47.9, 7.9, 47.3]`. The responses and stored drafts agree on the point and reference; each Check uses that resolved point for its public.

Two initial attempts for `Hauptstrasse` and `Hauptstraße` returned no result. A diagnostic lookup of `Riehenstrasse` returned a valid public street result and populated the normal emulator cache. The made-up-street lookup encountered a service error; the home fallback worked and no error answer was cached. This verifies fallback on failure, not a successful empty response for that made-up name. The two Hauptstrasse variants separately verified cached `not_found` responses.

## AC3: Check, move, recheck, Create

- Browser opened with `?emulator=1`; before its Check, a temporary console diagnostic read `firebase.firestore()._delegate._settings.host` and returned `127.0.0.1:8080`. The diagnostic was removed byte-for-byte, preserving CRLF and the final CR.
- The form started at uid 2's current home. A model-backed Check enabled Create and showed `your home (from the description)`.
- Selecting the Work anchor moved the pin to `[47.601, 7.618]`, showed `set by you`, disabled Create, and displayed `The point moved after the check: press Check again.`
- Rechecking enabled Create. Its stored draft has source `creator`, the selected work point, and the home point retained as `location_suggested`.
- An API Create with a forged point was rejected with 409 before any issue was created. The subsequent valid Create reused that checked draft's home point and stored exactly its location, source and reference, with 100 members. Test issue `iDCOHXBrDOiooBMnRdMg` remains on the emulator only.

## AC4: logs and usage

All ten Check calls have `ai_source: model`, prompt version `p3`, and `normalized_output.location_reference`. There were ten text-model calls and ten embedding calls; no new embedding was needed for Create.

- Text model: 81,465 prompt tokens and 10,588 output tokens (92,053 total, from the logs).
- Embedding: approximately 342 input tokens (four-character estimate; no actual embedding token usage returned).
- Cost at A4's recorded paid rates: approximately $0.0363 total ($0.03625 text, $0.00005 embeddings). Billing approval supersedes the original free-tier-only instruction. Ten calls remain below its original per-day limits.
- The two unsuccessful initial street attempts explain the increase from the plan's approximately eight Checks to ten.

## AC5: geocoding policy controls

- Exactly four external Nominatim requests in total: the two Hauptstrasse variants, the successful Riehenstrasse diagnostic, and the made-up street. No browser request was sent to Nominatim. The successful diagnostic used the same production `geocode.js` URL, User-Agent, cache and bounds.
- Both subsequent Riehenstrasse Checks used the cache; cache documents and timestamps were unchanged on repeat. Three cache entries remain: one `found`, two `not_found`; no service-error entry.
- With `config/geocoding.enabled=false`, the server Check returned `home_fallback` with `your home (place search is off)`. The browser's search showed `Place search is switched off.` and sent no request.
- Map and search credit linked to OpenStreetMap contributors. The switch was absent initially and was restored to absent after testing.

## Saved state

Final export metadata: 2026-11-11 19:15 UTC. Java heap `-Xmx8g`. The final export completed with exit 0. Two intermediate exports had printed `Export complete` before a CLI timeout; the final export supersedes them. Firestore was restarted from the final export and all ten logs, both pin-test drafts, the restored switch, cache and created issue were verified.

The emulator is stopped and `C:\isr-mvp` is restored to `p1-profile-review`. Temporary test scripts and diagnostics remain under ignored `scratch/`; no product code was changed during acceptance testing. Live is unchanged. U6 remains stacked on A4 PR #20.
