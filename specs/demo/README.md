# D1 generated artefacts and local journal

Status: tooling implemented; actual content, final-population seed, snapshot and human full-cycle acceptance still pending. No generated scenario content is claimed by the mocked tests.

The approved contract is [D1 section 9](../tasks/D1-demo-scenarios.md#9-proposed-implementation-refinement-after-u10-2026-11-14). This folder will hold `content.json` (generated once, creator bindings, prompt/model/usage metadata), `manifest.json` (metadata inventory, exact drafts/results, phase/record ids and progress), and `network-ledger.json` (actual emulator request reservations only; no headers, bodies, queries or keys).

`prepare_demo.py` selects creators from final P2 profiles. The original 2,154/2,840/2,087-person estates are mapped by unchanged estate population, then a real building/home or workplace is selected. Arts uses activity skills; software uses work experience. Full-population selection has been checked read-only. No profile document or personal contact field is saved in these artefacts.

The manifest is atomically replaced after every meaningful step and is single-writer locked. The draft id is durable before Create. A lost successful response is recovered from that draft's saved `creation_result`. An interrupted Check/content request stops for explicit journal review; no silent generation/reset occurs. On changed content, creator, original topic payload/history or an unplanned topic, stop and inspect. A completed seed rerun validates the data and writes/spends nothing. Presentation-started manifests are not silently reseeded.

Legacy issues/discussions become `status: archived`, with previous status/time/reason/run in `demo_archive`. Their roots apart from these archive fields, publics, member bodies and messages are fingerprinted and preserved. No old message is deleted. Archived topics do not appear in the normal dashboard, duplicate/title search, Join, management actions, deadline/tally or ordinary detail view. Existing open prototype rules remain; this is not a new protection against malicious direct writes.

The standby's real topic/vector/public is retained but archived. Explicit promotion rechecks active matches in the same creation-registry transaction used by Create. A normal Create and promotion cannot both win. Promotion does not reset registration time or recompute stored expertise. The checker independently recomputes D/G/X, nonzero fetched S, R aggregation, education/experience, mean-normalized ISR, both maps, quorum-result evidence and winning tasks using the existing Python ports. An automatically stored S=0 may denote the existing top-300 fetch shortcut; a full re-ranking audit is not claimed. Stored rounded fields use tolerance 0.00100001.

## Local commands (after key-loader approval)

Only `C:\isr-mvp` has the local secret. AGENTS.md requires asking before another folder uses it. `demo_runtime.py` is prepared to invoke the existing main-checkout loader in a private child and pass its value in memory. It writes/copies no secret file and never includes the value in arguments or output. Do not run its opt-in until the author has approved.

Start the full D1 emulator in one PowerShell window:

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-d1-guided-demo
python scripts/demo_runtime.py emulators --use-main-key-loader
```

It imports the named integrated snapshot read-only (or its own previous export), uses 8 GB Java heap, sets existing dependencies and exports only to the D1 worktree's ignored `.emulator-data`. The saved main checkout and frozen milestone are not overwritten. Known disposable preview processes must be stopped before launch; occupied ports cause refusal.

In a second PowerShell window:

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-d1-guided-demo
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
python scripts/demo_runtime.py content --use-main-key-loader
```

Generate at most 20 text requests, preserving completed results, with one reverse-place lookup. The emulator's separate opt-in Node preload persistently caps actual model transport attempts to 15 text and 15 embedding requests, with one remaining Nominatim request. Rejected attempts do not dispatch. Thus SDK retries count against the ceiling and process restarts do not reset it. A stale lock or exhausted ledger requires explicit inspection; do not delete/reset it to get more quota. These first-pass ceilings apply to this emulator/content rehearsal; a later author-only live pass needs its concrete budget and recovery preflight before execution.

Review the stored content once. Then make a dry plan (these commands assume `content.json` has actually been generated and reviewed):

```powershell
python scripts/seed_demo.py --project project-a3d59130-5adf-4677-9e2 --make-plan --run-id d1-first-rehearsal --report scratch-d1-plan.json
python scripts/seed_demo.py --project project-a3d59130-5adf-4677-9e2 --apply --report scratch-d1-applied.json
python scripts/check_demo.py --project project-a3d59130-5adf-4677-9e2 --report scratch-d1-check.json
python scripts/seed_demo.py --project project-a3d59130-5adf-4677-9e2 --apply --report scratch-d1-rerun.json
firebase emulators:export .emulator-data --force --project project-a3d59130-5adf-4677-9e2
node functions/tools/demo-preview.cjs
```

The source worktree must be committed before a real plan is made. The checker must report zero problems and the rerun zero writes/requests before a named demo snapshot is declared. Keep the preview terminal running. The local guide is http://127.0.0.1:5002/d1-guide; the runtime checks the actual browser SDK emulator host and displays a green banner. No developer console is needed. Local profile links do not change the application's synthetic identity mechanism.

## Pending real acceptance

Actual generated content review; final-population seed/check; zero-change real rerun; named export/import verification; complete presenter cycle and U10 exercises. Only then finish AC1-AC4 and prepare the author's live commands (AC5). No author live apply/deploy is authorized by running these emulator commands. PR #28/#29 utility dependencies remain to reconcile before relying on their unpublished fixes.
