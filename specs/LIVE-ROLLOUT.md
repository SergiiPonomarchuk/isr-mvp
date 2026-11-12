# Coordinated live rollout: P1 / P2 / A4 / U6 / U8 / A5

Prepared 2026-11-12 for release `47e835a`, tag `isr-mvp-rc-2026-11-12`. [Local release evidence](tasks/INTEGRATED-release-2026-11-12.md). Author-only operations below are **not executed** by preparing this document.

**Current gate:** local integration is verified. Before any live apply, the author must have a completed full backup and an agreed, rehearsed recovery procedure, and confirm the Gemini project's paid tier/budget and execution window. Section 2 gives the procedure for restoring the exact backup to a disposable Firestore emulator.

This runbook uses Windows PowerShell 5.1. Run the blocks in order and inspect their counts before the next dependent step. Every deploy and live `--apply` is the author's action. Codex performs read-only verification; the author performs live browser actions that write drafts/issues/votes.

## 1. Setup and release identity

`C:\isr-mvp` has the Python dependencies, committed inputs, frozen ID exports and local Gemini key. It currently serves the emulator from detached `47e835a`. These environment changes apply to this author shell, not the already-running emulator.

```powershell
Set-Location -LiteralPath 'C:\isr-mvp'
$isrProject = 'project-a3d59130-5adf-4677-9e2'
$isrReleaseTag = 'isr-mvp-rc-2026-11-12'
$isrRunStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$isrReports = Join-Path 'C:\isr-mvp\scratch' ('live-rollout-' + $isrRunStamp)
$isrBackup = Join-Path 'A:\ISR\mvp\dbbackup' $isrRunStamp
New-Item -ItemType Directory -Force -Path $isrReports | Out-Null
Remove-Item Env:\FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell still targets the emulator' }
$env:GCLOUD_PROJECT = $isrProject
git status --short --branch
git diff --exit-code $isrReleaseTag -- functions prototype firestore.rules scripts ':(exclude)scripts/restore_firestore.py' ':(exclude)scripts/firebase-recovery.json'
if ($LASTEXITCODE -ne 0) { throw 'Application/scripts differ from the reviewed release' }
```

Stop if tracked code is dirty, drive A is unavailable, billing is not confirmed, or the release comparison fails. Use the final merged documentation state or the recorded release; do not switch to an old profile-review branch. Avoid using Check while code and embedding models are being changed.

## 2. Backup and recovery prerequisite (author)

The existing script reads all collections and nested collections, encodes Firestore types and prints counts. It requires a new/empty output folder outside the repository. Its full backup includes credential-like profile fields: the author keeps it private; agents review aggregate manifest counts, not profile JSONL contents.

```powershell
python scripts/backup_firestore.py --project $isrProject --out $isrBackup
if ($LASTEXITCODE -ne 0) { throw 'Backup incomplete; do not apply migrations' }
```

An interrupted run may resume with the same path and `--resume`; confirm its manifest/target and completed collections before proceeding. Keep the old deployment references with this backup. Use a quiet backup window because the exporter reads collections over time. Check the manifest's source project, live target, completion time and counts. Rehearse the fresh archive before applying the migration. Use a checkout containing the reviewed recovery script and configuration. The preview checkout can stay at its release tag.

```powershell
$isrRecoveryCheckout = 'A:\BackUp\isr-mvp\worktrees\wt-firestore-recovery'
$isrRestore = Join-Path $isrRecoveryCheckout 'scripts\restore_firestore.py'
$isrRecoveryConfig = Join-Path $isrRecoveryCheckout 'scripts\firebase-recovery.json'
$isrRehearsal = 'python "{0}" --backup "{1}" --apply' -f $isrRestore, $isrBackup
$isrJavaHome = (java -XshowSettings:properties -version 2>&1 | Select-String '^\s*java.home\s*=\s*(.+)$').Matches.Groups[1].Value
if (-not (Test-Path -LiteralPath (Join-Path $isrJavaHome 'bin\java.exe'))) { throw 'JDK not found' }
$isrPreviousPath = $env:Path
$isrPreviousJavaOptions = $env:JAVA_TOOL_OPTIONS
Push-Location -LiteralPath $isrReports
try {
    $env:Path = (Join-Path $isrJavaHome 'bin') + ';' + $env:Path
    $env:JAVA_TOOL_OPTIONS = '-Xmx2400m'
    firebase emulators:exec --only "firestore" --project demo-isr-recovery --config $isrRecoveryConfig $isrRehearsal
    if ($LASTEXITCODE -ne 0) { throw 'Recovery rehearsal failed' }
} finally {
    $env:Path = $isrPreviousPath
    $env:JAVA_TOOL_OPTIONS = $isrPreviousJavaOptions
    Pop-Location
}
if (Get-NetTCPConnection -State Listen -LocalPort 8185,9185,4485,4585 -ErrorAction SilentlyContinue) {
    throw 'Recovery emulator still listening; identify the recovery process before retrying'
}
```

Using the JDK's own executable avoids a Windows Java launcher that can leave the emulator running after the CLI exits. The CLI starts Firestore on loopback port 8185, supplies its address to the child process and shuts it down when the command exits. Success reads `Restored and verified N documents`, where N equals the final manifest total. For an interrupted run, repeat the command with a fresh empty emulator. For offline validation alone, run `python $isrRestore --backup $isrBackup`. Keep the original private backup. This rehearsal recovers document data into a copy. A production cutover or in-place rollback needs the author's target, write window and treatment of intervening writes. See [the recovery spec and evidence](tasks/M1-firestore-recovery.md).

## 3. P1 preview, apply and verification (author)

On 2026-11-12 the read-only preview found **8,803 updates, zero deletes, no missing generation/changed inputs**, 9,150 complete profiles and 37 packs. One additional incomplete profile is retained unchanged; `users/None` is absent. Recheck against the actual live state, retaining the committed generated texts.

```powershell
python scripts/migrate_p1.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'P1-before.md')
if ($LASTEXITCODE -ne 0) { throw 'P1 preview failed' }
```

Review the counts and any held/input-change findings before apply. Do not use `--generate` or `--allow-partial` to bypass divergence.

```powershell
python scripts/migrate_p1.py --project $isrProject --i-know-this-is-live --apply --report (Join-Path $isrReports 'P1-apply.md')
if ($LASTEXITCODE -ne 0) { throw 'P1 apply failed; inspect its checkpoint' }
python scripts/migrate_p1.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'P1-after.md')
if ($LASTEXITCODE -ne 0) { throw 'P1 verification failed' }
python scripts/audit_profiles.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'P1-audit.md')
if ($LASTEXITCODE -ne 0) { throw 'P1 audit failed' }
```

Exit check: zero further profile updates/deletes/pending/changed inputs; approved graduation/experience/year-limit repairs and unchanged skill IDs; existing packs rebuilt from users. The audit's original vector-ID export establishes ID coverage; A4 checks separately establish current model/text/vector metadata.

## 4. P2 preview, apply and verification (author)

P2 follows P1 because its committed source hashes were made after P1. It uses the existing `scripts/p2_generated/plan.json`. The extra incomplete profile is outside the plan. Do not rebuild the plan with `--make-plan` or `--force`.

```powershell
python scripts/migrate_p2.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'P2-before.md') --geojson-dir $isrReports
if ($LASTEXITCODE -ne 0) { throw 'P2 preview failed' }
```

Review held/problem counts before continuing; both must be zero. Unexpected live differences are inspected rather than overwritten.

```powershell
python scripts/migrate_p2.py --project $isrProject --i-know-this-is-live --apply --report (Join-Path $isrReports 'P2-apply.md') --geojson-dir $isrReports
if ($LASTEXITCODE -ne 0) { throw 'P2 apply failed; inspect its checkpoint' }
python scripts/migrate_p2.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'P2-after.md') --geojson-dir $isrReports
if ($LASTEXITCODE -ne 0) { throw 'P2 verification failed' }
```

Exit check: 9,150 planned people done, zero to write/held/problems; homes on 1,226 building points; household/spacing/property rules and renamed workplaces correct; packs equal the repaired users. A5 deployment is also needed for accepted building-locality behavior.

## 5. Secret and coordinated code deployment (author)

Confirm the key's AI Studio project shows Paid and the author's spend limit before bulk embedding. The local key stays in its existing file; scripts load it themselves. Enter the key directly when the Firebase CLI requests it.

```powershell
firebase functions:secrets:set GEMINI_API_KEY --project $isrProject
if ($LASTEXITCODE -ne 0) { throw 'Secret configuration failed' }
```

Deploy only from the clean detached `wt-main` checkout. Refresh it to origin/main after documentation merges; verify its application/scripts still match the reviewed release tag. Its dependencies must match the new SDK lockfile.

```powershell
$isrDeploy = 'A:\BackUp\isr-mvp\worktrees\wt-main'
if (@(git -C $isrDeploy status --porcelain).Count -gt 0) { throw 'Deploy checkout is dirty' }
git -C $isrDeploy fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Deploy fetch failed' }
git -C $isrDeploy checkout --detach origin/main
if ($LASTEXITCODE -ne 0) { throw 'Deploy checkout failed' }
git -C $isrDeploy diff --exit-code $isrReleaseTag -- functions prototype firestore.rules scripts ':(exclude)scripts/restore_firestore.py' ':(exclude)scripts/firebase-recovery.json'
if ($LASTEXITCODE -ne 0) { throw 'Deploy content differs from the reviewed release' }
Set-Location -LiteralPath (Join-Path $isrDeploy 'functions')
npm ci --cache 'A:/BackUp/isr-mvp/npm-cache'
if ($LASTEXITCODE -ne 0) { throw 'Deploy dependencies failed' }
Set-Location -LiteralPath $isrDeploy
firebase deploy --only "functions,hosting,firestore:rules" --project $isrProject
if ($LASTEXITCODE -ne 0) { throw 'Deployment failed; inspect partial deployment state' }
```

This includes the already-approved A4 rule protecting Analyzer logs, not new stage-5 access work. It deploys A4/U6/U8/A5 together. Complete the next steps promptly; mixed old/new model vectors are not an accepted demo state.

## 6. A4 live embeddings and real E/ISR (author)

Return to `C:\isr-mvp`, which has the key and Python packages. Keep the live target explicit.

```powershell
Set-Location -LiteralPath 'C:\isr-mvp'
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets the emulator' }
python scripts/embed_people.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'A4-embedding-before.md')
if ($LASTEXITCODE -ne 0) { throw 'Embedding preview failed' }
```

This embedding preview makes no model call. Review its actual text/request estimate, billing and remaining budget; use the already-approved task types rather than repeating the comparison. Historical emulator costs are not a new price quote.

```powershell
python scripts/embed_people.py --project $isrProject --i-know-this-is-live --apply --report (Join-Path $isrReports 'A4-embedding-apply.md')
if ($LASTEXITCODE -ne 0) { throw 'Embedding run interrupted; inspect progress before resuming' }
python scripts/embed_people.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'A4-embedding-after.md')
if ($LASTEXITCODE -ne 0) { throw 'Embedding verification failed' }
```

Exit check: all current profile/skill texts match the approved model, 768 dimensions, `t1` and task metadata; zero people/texts/requests remain. The script resumes completed people rather than regenerating everything.

```powershell
python scripts/migrate_a4.py --project $isrProject --i-know-this-is-live --apply --report (Join-Path $isrReports 'A4-publics-apply.md')
if ($LASTEXITCODE -ne 0) { throw 'Public migration failed; inspect its checkpoint' }
python scripts/migrate_a4.py --project $isrProject --i-know-this-is-live --report (Join-Path $isrReports 'A4-publics-after.md')
if ($LASTEXITCODE -ne 0) { throw 'Public migration verification failed' }
```

Unlike the profile embedding preview, the public-migration preview can call the embedding API if eligible topic vectors are missing. The post-apply run should need no requests and propose no further changes. Recount eligible live publics; the historical record had three. Verify canonical E/ISR and cached maps read-only rather than trusting only a successful exit.

## 7. Acceptance and release record

- Codex verifies live headers/files against the release, current vector coverage/dimensions/norms, profile/pack/geography consistency, canonical scores/maps and logs read-only.
- The author performs live Check/Create/voting actions needed for acceptance. A4 AC8 requires a model-backed Check log; location/point persistence and U8 live tiles/credits must work. Record P1 AC4, P2 AC5, A4 AC8 and U8 AC3.
- Record actual model requests/texts/tokens/cost, code SHA, reports and backup location. Keep the historical seeded scores and frozen paper export distinct from the new demo evidence.
- Once these pass, begin D1 from its approved ten-scenario spec. Existing chat deadlines still need attention before 2026-12-09 unless the replacement dataset has handled them.

If a step fails, stop dependent steps and inspect the actual state. There is no automatic rollback command in this runbook. Use the agreed recovery procedure and preserved backup/release references; agents do not apply a production restore.
