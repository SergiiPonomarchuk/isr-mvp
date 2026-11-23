# C2a isolated emulator evidence, 2026-11-23

Accepted source-pinned evidence: [run07](run-20261123-07/report.json), [worker inventory](run-20261123-07/worker.json). Only the tiny asynchronous SDK/harness slice is accepted. No application scoring, UI, full-population or live readiness is claimed. Author-approved provisional paths only; zero provider calls, credential-loader invocations or production writes.

## Results

- All 22 scenarios pass. Initial2/7/17 supplied members become3/8/18 after Join. Complete typed payload/order/Unicode/dates/negative-zero and frozen Create replay match exactly; cursors retain the old complete generation across Join. No staging/partial page is returned.
- Both Create and Join activation use10 SDK writes. Largest actual protobuf CommitRequest9318bytes, largest encoded document2718bytes. Document names and transaction bytes are included; only token lengths, never tokens/requests, are saved. These are serialization envelopes, not billing/network-transfer estimates.
- Real pessimistic contention produces ABORTED(10) from a competing one-attempt SDK transaction. The outer callback retries once, preserving existing conversation data. Contention/epoch/cleanup use trusted controlled clocks; ordinary flows use wall time. Phase/cancel tests exercise the winning committed order before activation, not simultaneous distributed races.
- Lost HTTP responses at begin/stage/seal/activation recover using deterministic IDs/status; before-commit injections leave no partial write. Actual client/service restart reconstructs a half-built successor from its retained base. Distinct Joins contend and rebase; never-published cleanup resumes after response loss; published history is retained.
- Source/catalog/day drift, stale epochs, missing authority, corrupt/missing nodes, validly hashed invalid UTF8, mirror mismatches and altered cursors refuse. Restart/repeated initialization cannot reseed missing authority. Restart supports already initialized fixtures only.
- Existing unchanged rules deny private records(403), but public roots remain client-readable(200). No new authentication/security acceptance; experimental wrapper roots are not current application schemas.
- Resource result: 46.172s, 114.85MiB peak child RSS. Original256MiB heap/512MiB RSS/120s/1GiB free gates unchanged. SDK read/discovery/attempt/write/byte limits are in the report. Additional harness counters are process-local and reset on restart; C1 per-job budgets persist. No durable distributed-quota claim.
- Required suites: Node293 passed/7 expected skips; Python224 tests/4 expected skips. Eleven pure C2a tests and two supervisor tests pass. The ordinary optional-emulator test skips in CI; the supervisor explicitly runs its same rehearsal.

## Reproduction and retained development runs

Node22, installed @google-cloud/firestore7.11.6, Java17. Fresh demo-c2a-publication at127.0.0.1:8190; loopback HTTP8192. No functions/hosting/import/export/source population. Existing rules hash is source-pinned. Temporary root-local config selects unchanged firestore.rules, hub44892/log45892/websocket9152. Firebase refuses ../firestore.rules from a scratch-local config.

Set NODE_PATH=C:/isr-mvp/functions/node_modules, C2A_EMULATOR_TESTS=1, GCLOUD_PROJECT=demo-c2a-publication and FIRESTORE_EMULATOR_HOST=127.0.0.1:8190. Run scripts/run_c2a_emulator.py --out specs/tasks/M3-c2a-evidence/<new-directory> against a fresh emulator. Evidence output is exclusive.

Runs01/02/03/05 are retained failed development evidence: startup configuration/connection failure, wall-clock lease expiry during pessimistic contention, invalid outer transaction after a retrying competing batch, and correct UTF8 refusal hidden by the HTTP filter. Runs04/06 passed their earlier coverage;07 supersedes them with authority-loss regression. No resource guard was raised. Corrections align the streaming guard with the installed SDK signature, bound the competing transaction to one attempt, permit digits in fixed error codes, and prevent authority reseeding.

Temporary services stopped; dedicated8190/8192/44892/45892/9152 listeners verified closed. Original C serving checkout unchanged. C1 modules, application endpoints/scorers/UI, docs/, rules and source population unchanged. The16 Values cases stay deferred. Next separate scope: C2b consumers/lifecycle/browser; C3 population parity/resources and live writer/access/cutover/recovery remain gated. Sol Medium is sufficient; no runtime model needed here.
