# M3 local form review

The implementation is on `codex/m3-app-integration`. Automated score/transaction/form checks passed. This short review checks the visible layout. AI answers are deterministic mocks; it does not evaluate Gemini's analysis quality. No deployment or paid request is needed.

## Review now

The isolated emulator and preview are already running. No PowerShell command is needed while they remain open.

1. Open **http://127.0.0.1:5189/main.html?emulator=1**.
2. Confirm the green bottom strip says **LOCAL MR1 TEST | Emulator verified | Synthetic data | Mock AI**. The page automatically verifies the Firestore host is `127.0.0.1:8189` before allowing clicks. No developer console is needed. The selected profile is **Synthetic 1**. If the strip says STOP, report that text and leave the page as it is.
3. Open **Chat**, then **Start new issue topic**.
4. Enter title **Inspect the west service-door lock** and description **The lock on the west service door of our building sticks. Residents need to decide how to repair it.** Leave **Additional context or answers** empty.
5. Press **Check**. Expected: a question asking which building/entrance needs repair; **Create** stays disabled. The answer field and question should fit in the modal and remain readable while scrolling.
6. Enter **The west service entrance of our building is affected. Residents need a repair decision.** in **Additional context or answers**, then press **Check** again.
7. Expected: **109 members**, your relevance **80%**, a calculated ISR near **1.00**, and a member preview. The member rows show numeric scores. If **Similar active issues** appears, fill **How is your issue different?** with **This is a separate inspection of the west service door.** This is the existing duplicate-review flow; an exact active title still cannot be reused.
8. Edit the additional-context text. **Create** should become disabled immediately. Press **Check** again to obtain a fresh result. For this review, stop before pressing Create; actual creation/Join have already been tested through the real emulator handlers.
9. Tell the agent whether the layout/questions/count/scores/invalidation look correct, or describe the problem. A screenshot is useful if the layout is wrong.

Only this loopback preview uses mocked AI and the8189 demo database. The normal local URLs and live website retain their own configuration. Existing D1 snapshots and production data are untouched. Windows browser automation stopped because it could not verify the current URL, so no visual acceptance is claimed yet.

## Restart if the local preview has stopped

These are **Windows PowerShell** commands. Use three separate windows. Do not restart an emulator already listening on8189 or the preview on5189. If either is still running, keep that window and skip its startup step.

1. In the first PowerShell window, start the disposable Firestore emulator. Keep it open:

```powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-m3-integration'
$env:JAVA_TOOL_OPTIONS = '-Xmx512m'
firebase emulators:start --only "firestore" --project demo-mr1 --config functions/test/mr1-emulator.json
```

This starts an empty demo database without importing or exporting accepted data.

2. Only after starting a **fresh empty** emulator, open a second PowerShell window and run the synthetic fixture once:

```powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-m3-integration'
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8189'
$env:GCLOUD_PROJECT = 'demo-mr1'
$env:MR1_EMULATOR_TESTS = '1'
node --test functions/test/mr1-integration.test.js
```

Wait for **pass1 / fail0**. The test intentionally prints some rejected-input errors; its final result is what matters. It leaves the synthetic profiles/issues available for visual review. If the test says the database is not empty, do not reset it blindly; ask the agent to inspect the target.

3. In the third PowerShell window, start the local preview and keep it open:

```powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-m3-integration'
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
node functions/test/mr1-preview.js
```

Then follow **Review now** from step1. No key is read by this preview; its model/embedding providers are test doubles.
