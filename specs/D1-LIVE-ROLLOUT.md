# D1 live rollout — author procedure

Prepared 2026-11-14 for merged D1 application `9b9ce79`. This is a new D1 run; do not repeat the historical P1/P2/A4 migration runbook. No step below has been executed merely by preparing this document.

## Gates and proposed usage

1. Merge recovery PR #28 on explicit author instruction. It preserves signed zero in the fresh backup rehearsal. Its reconciled unit suites and isolated SDK fixture pass. PR #29 is a separate embedding retry utility; this procedure does not rerun profile embeddings.
2. Author approves a **new live ceiling of 15 Check pairs** (up to 15 text requests and 15 issue-embedding texts) and **two place lookups**, including the seed and browser acceptance. Reuse the ten reviewed content scenarios; **zero new content-generation requests and zero profile re-embedding**. Expected minimum: ten seed Checks plus one normal flagship Check. Reserve the rest for duplicate/paraphrase acceptance and inspected retries. This is a request proposal, not a dollar price or an approval already granted. Confirm the existing key's AI Studio project is Paid and its remaining budget before apply. Never share the key.
3. Take a new private live backup during a quiet window and restore/verify that exact archive on the dedicated local copy. Keep browser writes and other writers paused from backup through archive/seed verification. The backup reads collections over time; it is not an atomic point-in-time snapshot. If live data changes, inspect and repeat the affected preflight rather than bypassing drift guards.
4. Review the fresh plan's archive count and creator checks, then deploy and seed as the author. Existing old issue/discussion roots become archived; their messages, publics and member payloads are retained. No rules deployment or historical data deletion.

The author runs all commands below in **Windows PowerShell 5.1**, in the same window unless stated otherwise. Run one numbered block at a time and inspect its result. Every deployment, live seed, standby activation and browser write is the author's action. Agents may check production read-only and write to disposable emulators. A fresh full backup contains credential-like fields: keep its JSONL private and share only aggregate counts/status/error text.

## 1. Prepare a clean release and new folders

After PR #28 is merged, open Windows PowerShell and paste this full block:

```powershell
$isrProject = 'project-a3d59130-5adf-4677-9e2'
$isrDeploy = 'A:\BackUp\isr-mvp\worktrees\wt-main'
$isrStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$isrReports = Join-Path 'A:\BackUp\isr-mvp\rollouts' ('d1-' + $isrStamp)
$isrBackup = Join-Path 'A:\ISR\mvp\dbbackup' ('d1-' + $isrStamp)
$isrManifest = Join-Path $isrReports 'live-manifest.json'
if (-not (Test-Path -LiteralPath 'A:\BackUp\isr-mvp')) { throw 'Reconnect drive A' }
if (@(git -C $isrDeploy status --porcelain).Count -gt 0) { throw 'Deploy checkout is dirty' }
git -C $isrDeploy fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed' }
git -C $isrDeploy checkout --detach origin/main
if ($LASTEXITCODE -ne 0) { throw 'Checkout failed' }
git -C $isrDeploy diff --exit-code 9b9ce79 -- functions prototype firestore.rules scripts ':(exclude)scripts/restore_firestore.py'
if ($LASTEXITCODE -ne 0) { throw 'Runtime differs from reviewed D1; inspect before continuing' }
$isrRestoreBlob = (git -C $isrDeploy rev-parse HEAD:scripts/restore_firestore.py).Trim()
if ($isrRestoreBlob -ne '408ff14589b1558241fa76201dcd994be503cf66') { throw 'Reviewed signed-zero recovery fix is not present' }
New-Item -ItemType Directory -Path $isrReports | Out-Null
Set-Location -LiteralPath $isrDeploy
Remove-Item Env:\FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell still targets an emulator' }
$env:GCLOUD_PROJECT = $isrProject
git rev-parse HEAD | Set-Content -LiteralPath (Join-Path $isrReports 'release.txt')
```

Do not use the committed `specs/demo/manifest.json` or `seed-manifest.json` for this live run. They describe accepted emulator records in the same project ID and are presentation-started. The new `$isrManifest` starts absent. Record the report/backup folder names; reuse this exact journal if an operation is interrupted.

## 2. Fresh private backup — author

Keep the site quiet and paste:

```powershell
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'Backup would target an emulator' }
python scripts/backup_firestore.py --project $isrProject --out $isrBackup
if ($LASTEXITCODE -ne 0) { throw 'Backup incomplete; stop before deploy or seed' }
$isrBackupMeta = Get-Content -LiteralPath (Join-Path $isrBackup 'manifest.json') -Raw | ConvertFrom-Json
if ($isrBackupMeta.project -ne $isrProject -or $isrBackupMeta.target -ne 'LIVE (read-only)') { throw 'Wrong backup target' }
$isrBackupMeta | Select-Object project,target,finished_utc,total
```

Success prints `Done` and a completed manifest with the correct live project. If interrupted, retain the folder and ask for checkpoint review before using `--resume`; do not start the seed. Share the final aggregate total, not the JSONL contents.

## 3. Rehearse that exact backup on a fresh isolated copy

This runs only Firestore on 8185 for `demo-isr-recovery`, without functions, hosting or exports. The restore validates all input records before writing, refuses a nonempty target, uses create-only binary writes, then compares every recovered typed document with its backup. No live restore command is provided.

```powershell
$isrRestore = Join-Path $isrDeploy 'scripts\restore_firestore.py'
$isrRecoveryConfig = Join-Path $isrDeploy 'scripts\firebase-recovery.json'
python $isrRestore --backup $isrBackup
if ($LASTEXITCODE -ne 0) { throw 'Offline backup validation failed' }
if (Get-NetTCPConnection -State Listen -LocalPort 8185,9185,4485,4585 -ErrorAction SilentlyContinue) { throw 'Recovery ports occupied; identify their owner' }
$isrJavaHome = (java -XshowSettings:properties -version 2>&1 | Select-String '^\s*java.home\s*=\s*(.+)$').Matches.Groups[1].Value
if (-not (Test-Path -LiteralPath (Join-Path $isrJavaHome 'bin\java.exe'))) { throw 'JDK not found' }
$isrPreviousPath = $env:Path
$isrPreviousJavaOptions = $env:JAVA_TOOL_OPTIONS
$isrRehearsal = 'python "{0}" --backup "{1}" --apply' -f $isrRestore, $isrBackup
Push-Location -LiteralPath $isrReports
try {
    $env:Path = (Join-Path $isrJavaHome 'bin') + ';' + $env:Path
    $env:JAVA_TOOL_OPTIONS = '-Xmx8g'
    firebase emulators:exec --only "firestore" --project demo-isr-recovery --config $isrRecoveryConfig $isrRehearsal
    if ($LASTEXITCODE -ne 0) { throw 'Fresh recovery rehearsal failed; do not deploy or seed' }
} finally {
    $env:Path = $isrPreviousPath
    $env:JAVA_TOOL_OPTIONS = $isrPreviousJavaOptions
    Pop-Location
}
if (Get-NetTCPConnection -State Listen -LocalPort 8185,9185,4485,4585 -ErrorAction SilentlyContinue) { throw 'Recovery emulator still listening; identify its process' }
```

Required success: `Restored and verified N documents`, with N equal to the fresh manifest's total, exit code zero and dedicated ports closed. The existing 24,884-document November 12 rehearsal and new six-test synthetic run are supporting evidence, not a substitute for this new archive. An interrupted rehearsal restarts with an empty disposable emulator. Keep both original accepted D1 snapshots and the private live archive.

## 4. Read-only live plan, before deployment or archive

```powershell
Set-Location -LiteralPath $isrDeploy
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
if (Test-Path -LiteralPath $isrManifest) { throw 'Manifest already exists; inspect/resume it instead of making another' }
python scripts/seed_demo.py --project $isrProject --i-know-this-is-live --make-plan --run-id ('d1-live-' + $isrStamp) --manifest $isrManifest --report (Join-Path $isrReports 'before.json')
if ($LASTEXITCODE -ne 0) { throw 'Live dry plan failed; no apply' }
```

This makes **zero database writes and zero model requests**. It saves a local journal with fresh live inventory, source SHA, reviewed content and creator bindings. The 2026-11-14 preflight proposed 276 archived roots (82 issues + 194 discussions), ten scenario records, zero writes/requests. It validated all ten stored creator fingerprints. Existing 112 discussion-only records are known historical data. Any changed counts, creator mismatch, unexpected demo run or new topics require review; do not override them. The initial archive/public/member/message fingerprints are checked through the run.

## 5. Author deployment — functions and hosting only

Proceed only after the fresh backup/recovery and dry plan are accepted, and the new live API budget is approved. The application uses its existing deployed secret binding; do not set/copy the local key or rerun embeddings.

```powershell
if (@(git -C $isrDeploy status --porcelain).Count -gt 0) { throw 'Deploy checkout is dirty' }
Set-Location -LiteralPath (Join-Path $isrDeploy 'functions')
npm ci --cache 'A:/BackUp/isr-mvp/npm-cache'
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
Set-Location -LiteralPath $isrDeploy
firebase deploy --only "functions,hosting" --project $isrProject
if ($LASTEXITCODE -ne 0) { throw 'Deployment failed; inspect partial state before continuing' }
```

Tell the agent `D1 deploy done`. The agent checks live Hosting files/headers against the clean deploy checkout read-only and confirms deployed function identity. Do not seed while deployment is partial. The scheduled deadline job remains active on live; keep the window short and stop on source/history drift. No rules change is part of D1.

## 6. Author seed, independent verification and zero-change rerun

After deployment verification, paste:

```powershell
Set-Location -LiteralPath $isrDeploy
if ($env:FIRESTORE_EMULATOR_HOST) { throw 'This shell targets an emulator' }
$env:NODE_PATH = Join-Path $isrDeploy 'functions\node_modules'
python scripts/seed_demo.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --apply --report (Join-Path $isrReports 'apply.json')
if ($LASTEXITCODE -ne 0) { throw 'Seed stopped; retain manifest and inspect before resuming' }
python scripts/check_demo.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --report (Join-Path $isrReports 'after.json')
if ($LASTEXITCODE -ne 0) { throw 'Independent verification found differences' }
python scripts/seed_demo.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --apply --report (Join-Path $isrReports 'rerun.json')
if ($LASTEXITCODE -ne 0) { throw 'Completed rerun failed' }
```

Expected: ten records including hidden standby; nine visible cases arranged across discussion, voting and tasks. Independent `problems: []`; rerun reports `writes: 0, requests: 0`. Public membership numbers come from fresh live Check outputs and may differ from the emulator; do not force historical member counts or hand-enter weights. Existing archived messages/publics/members remain unchanged by fingerprints. The seed's own ceiling is 15 Check attempts, not a global live provider-spend lock. Review actual Analyzer usage/requests after seed and before more browser Checks; SDK retries and any inspected retry also consume the newly approved total. Stop when no budget remains.

On failure, keep the exact live manifest and successful draft IDs. An interrupted Check requires review; a lost successful Create is recovered from the existing draft's creation result. Do not delete locks, overwrite manifests, reset the plan, regenerate content or import emulator data into production. No automatic rollback exists. A live restore requires a separate reviewed target, write window and treatment of intervening writes.

## 7. Author live browser acceptance

Open [the live site](https://project-a3d59130-5adf-4677-9e2.web.app/main.html) without `?emulator=1`. The local guide on port 5002 describes the emulator and must not be treated as a live guide. The agent prepares the actual live creator/coalition links and copyable option values from the new live journal; no developer-console steps should be needed.

1. Create the normal flagship once as its recorded synthetic creator using the reviewed title/description and real Check. Inspect the returned point, expertise and parameters before Create. The standby must remain hidden. If Check fails or creation response is ambiguous, inspect existing drafts/issues before repeating it.
2. Record the successful normal flagship locally so it is included in independent checks:

```powershell
python scripts/demo_presenter.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --record-flagship auto
if ($LASTEXITCODE -ne 0) { throw 'Cannot uniquely record flagship; inspect existing topics' }
python scripts/check_demo.py --project $isrProject --i-know-this-is-live --manifest $isrManifest --report (Join-Path $isrReports 'flagship-check.json')
if ($LASTEXITCODE -ne 0) { throw 'Flagship verification failed' }
```

3. Within the remaining live Check allocation, confirm same-active-title blocking and a paraphrase finding the existing issue; show Open/member status and explicit nonmember Join. Joining beyond 100 is allowed during discussion; do not join during Voting. Do not add disposable separate-creation test cards to the live scenario set; that path already passed on the copied emulator.
4. Follow the accepted [presenter script](DEMO-script.md) for message/options, management support, weighted voting, stored winner and assigned tasks. Human live votes/support remain author actions. The coalition and scores must come from current live member records. Keep the exact normal registration text for journal checks. Run the independent checker with `$isrManifest` again after Join and at the completed cycle.
5. Tour the nine seeded cases. Record author acceptance, release SHA, archive/recovery results, actual requests/tokens, final checker and timestamp in the D1 status log. Only then is live AC5 complete.

If AI is unavailable and no normal flagship exists, the author may separately approve/promote the stored standby with this live manifest. Do not automatically activate it or call it a successful new AI creation. The existing atomic conflict check must decide whether normal creation already won.

## Recorded preparation evidence

- D1 application PR #34 merged as `9b9ce79`, main CI passed; clean deploy checkout prepared. Live Hosting HTML/lifecycle match `8466b13` after CRLF normalization, and main.js matches its git blob exactly; all checked responses use no-cache.
- Read-only live inventory: 82 issues, 194 discussions/publics, 3,295 members, 1,696 messages, four issue vectors; no issue-only or public-without-topic records. Protected profile/vector/pack counts are in the private local metadata report.
- Separate preliminary live dry plan passed: 276 archive roots, ten scenarios left, zero database writes/provider requests. This is not the fresh post-backup execution journal.
- Reconciled recovery suite: Node 110 passed/two optional skips; Python 120 run/two optional skips; dedicated SDK recovery six passed including negative zero and refusal to overwrite. Dedicated recovery ports released; normal D1 preview retained.
- Live budget, fresh backup, fresh full-archive recovery, deployment, seed and live browser AC5 remain pending author steps. No production mutation or paid/provider request was made in preparation.
