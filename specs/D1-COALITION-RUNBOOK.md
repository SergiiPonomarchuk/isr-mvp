# D1 synthetic coalition — author steps

The author approved this bounded helper on 2026-11-14. It prepares only the selected other synthetic members' inputs. Christine (ID 2) supplies the final Start Voting support, her option vote, and final Finish Voting support in the live UI. These are synthetic rehearsal inputs, not evidence of independent real-user participation.

The helper uses no Gemini key, model, embedding or place lookup. It writes no creator input, scores, options, messages, status, deadline, result or tasks. It only sets the normal noncreator support/option-index maps. It does not toggle inputs. Every live `--apply` below is the author's step; agents may plan/preview live read-only and exercise applies only on copies.

## Preconditions

- Merge the reviewed coalition helper PR on explicit author instruction. No function/hosting deployment is needed for this local tool; runtime/frontend are unchanged.
- Refresh the clean detached deploy checkout to the merged main. Preserve the existing presentation-started live manifest and prior 25,000-document recovery evidence; no reseed or new AI calls.
- Current issue: original entrance-lock flagship, discussion phase, 101 members. Reviewed options: Emergency Locksmith Service (index 0, selected winner for this rehearsal) and DIY Temporary Repair (index 1), each with three creator-assigned steps.
- Current ISR: pool 101.002; threshold 30.3006; other 27 members 30.142; adding Christine's 1.000 gives 31.142 (30.833%). The actual CLI preview is authoritative if anything changes. Membership/options/registration or conflicting input drift makes the helper refuse writes.

## 1. Prepare and preview the plan — read-only database operations

The agent may do this after code review/merge, since only a new local plan is saved. Use a distinct filename; the older `live-coalition-plan.json` was an informational preflight, not this helper's durable plan.

```powershell
& {
    Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-main'
    $isrProject = 'project-a3d59130-5adf-4677-9e2'
    $isrReports = 'A:\BackUp\isr-mvp\rollouts\d1-20261114-123138'
    $isrManifest = Join-Path $isrReports 'live-manifest.json'
    $isrCoalition = Join-Path $isrReports 'author-coalition-v1.json'
    if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
    $env:GCLOUD_PROJECT = $isrProject
    $env:NODE_PATH = 'A:\BackUp\isr-mvp\worktrees\wt-main\functions\node_modules'
    python scripts/demo_coalition.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --plan $isrCoalition --make-plan --option-index 0 --report (Join-Path $isrReports 'coalition-plan-preview.json')
    if ($LASTEXITCODE -ne 0) { throw 'Plan creation stopped; inspect the existing plan/state' }
    python scripts/demo_coalition.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --plan $isrCoalition --operation start-support --report (Join-Path $isrReports 'start-support-preview.json')
    if ($LASTEXITCODE -ne 0) { throw 'Start support preview refused; no apply' }
}
```

If the reviewed plan already exists, reuse it and run only the preview operation; plan creation refuses overwrite. Expected: 27 synthetic profiles, Emergency Locksmith Service, zero writes, one proposed document for start-support. Inspect the precise pool/support figures. The plan pins target, normal flagship identity/time, public members/weights, options, creator assignments and selected actors. It never overwrites the execution manifest. Keep the site quiet until the creator's next action so unrelated inputs do not invalidate the prepared threshold.

## 2. Author prepares Start Voting support

Only after the agent confirms the preview, run this whole block in Windows PowerShell:

```powershell
& {
    Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-main'
    $isrReports = 'A:\BackUp\isr-mvp\rollouts\d1-20261114-123138'
    if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
    $env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
    $env:NODE_PATH = 'A:\BackUp\isr-mvp\worktrees\wt-main\functions\node_modules'
    python scripts/demo_coalition.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --manifest (Join-Path $isrReports 'live-manifest.json') --plan (Join-Path $isrReports 'author-coalition-v1.json') --operation start-support --apply --report (Join-Path $isrReports 'start-support-apply.json')
    if ($LASTEXITCODE -ne 0) { throw 'Support preparation stopped; share the error before retrying' }
}
```

Expected: status prepared, one document written (or zero on an unchanged rerun), still discussion phase. Other support is below 30%; creator's support is absent. Send the aggregate result for a read-only check.

As Christine (search/adopt ID 2 on the live site), open the existing issue, click its Deadline card, choose Start Voting once, and confirm when prompted. Expected combined support is about 30.8%; issue enters Voting. Send the resulting screen. The agent verifies the new phase and unchanged registration/scoring fields before the next helper operation.

## 3. Author prepares synthetic option votes

The helper requires Voting and the same frozen public/options. First preview, inspect, then apply:

```powershell
& {
    Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-main'
    $isrReports = 'A:\BackUp\isr-mvp\rollouts\d1-20261114-123138'
    if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
    $env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
    $env:NODE_PATH = 'A:\BackUp\isr-mvp\worktrees\wt-main\functions\node_modules'
    python scripts/demo_coalition.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --manifest (Join-Path $isrReports 'live-manifest.json') --plan (Join-Path $isrReports 'author-coalition-v1.json') --operation option-votes --report (Join-Path $isrReports 'option-votes-preview.json')
    if ($LASTEXITCODE -ne 0) { throw 'Option-vote preview refused; no apply' }
}
```

The agent checks the preview, then gives the same full block with `--apply` and report `option-votes-apply.json`. Expected: 27 ordinary numeric votes for index 0, creator absent, one issue document written, below quorum until creator votes. No stored outcome or task is invented.

Christine then opens the existing Voting issue, selects Emergency Locksmith Service and clicks Vote. Canonical quorum should now pass with 28 counted votes and the selected winner. Send the screen; the agent verifies this read-only before Finish support. If Christine chooses another option, the helper refuses Finish preparation for the old plan; inspect and agree the next step rather than overwriting her vote.

## 4. Author prepares Finish Voting support

After passing quorum and the creator's chosen vote are verified:

```powershell
& {
    Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-main'
    $isrReports = 'A:\BackUp\isr-mvp\rollouts\d1-20261114-123138'
    if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
    $env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
    $env:NODE_PATH = 'A:\BackUp\isr-mvp\worktrees\wt-main\functions\node_modules'
    python scripts/demo_coalition.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --manifest (Join-Path $isrReports 'live-manifest.json') --plan (Join-Path $isrReports 'author-coalition-v1.json') --operation finish-support --report (Join-Path $isrReports 'finish-support-preview.json')
    if ($LASTEXITCODE -ne 0) { throw 'Finish preview refused; no apply' }
}
```

After review, the agent supplies the full apply block. Expected: two documents written to mirror normal voting-stage management maps, still Voting, creator support absent, other support below 30%. Christine opens Deadline, chooses Finish Voting once and confirms. The existing deployed server trigger stores the canonical winner/tally and three assigned tasks. The helper never writes those fields.

## 5. Final verification and recovery behavior

The agent runs the existing independent checker read-only with the live manifest, audits counted/excluded votes, winner/tasks and preserved historical fingerprints, then requests author review of the result/To Do screen. Record the hybrid synthetic method accurately in AC5 evidence; do not claim 28 independent human participants.

Each stage is atomic and idempotent. A repeat of the same committed preparation reports zero writes. A lost apply response is inspected through the saved map, and an already advanced phase returns a phase-advanced/no-write status. Stop and inspect SDK failures or drift before continuing; keep plan and receipts. There is no automatic rollback, reset, regeneration, creator-vote override or deadline/phase write. Changing membership/options invalidates this frozen plan and requires an explicit review, not editing hashes or deleting a lock to bypass it.
