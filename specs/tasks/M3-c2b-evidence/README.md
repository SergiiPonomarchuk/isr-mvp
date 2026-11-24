# C2b evidence and author review

Approved sections6/7: tiny supplied2/7/17 fixtures and bounded successors, not real formation/scoring/population/access acceptance. Zero provider/credential-loader/production operations; rules unchanged; fixed limits retained.

## Results

- run-20261124-01: failed helper-name collision, retained unchanged.
- run-20261124-02: earlier SDK pass53.906s/~120MiB/max12125B commit; predates final context/UI/accounting fixes, not final acceptance.
- run-20261124-03: final source-pinned SDK/HTTP pass63.281s/126242816B (120.39MiB),12411B CommitRequest/2817B document maximum. Three cases/five failure-race traces; fixture operations143/193/284. Actual retry includes nonzero content and once-only byte charge; controlled-clock cases labeled, no distributed clock/quota claim. Full report/worker retain bytes/masks/retries/pins.
- Independent audit: `python scripts/check_c2b_fixture.py --report specs/tasks/M3-c2b-evidence/run-20261124-03/report.json` complete/no problems/zero DB reads,writes,requests. Checks supplied ISR tally/task ownership, not MR1 scoring.
- Node323 total/316 passed/7 optional skips; Python227 tests/4 skips. New focused adapter/lifecycle/cache/contract cases23 passed.
- [Browser screenshot](browser-objective.jpg): actual winner/task/completed subtask/comment/nested reply. Checked-in prototype/index.html served as /main.html; no duplicate renderer. Host/project verified from SDK-derived DOM attributes and internally before mutations.

Actual browser checks:17-member last page/search; actor18 Join18/frozen17 replay; actor-cache clearing; original proposal dialog; Create7 across immediate reload with one complete catalog entry; edited text invalidates Check; canceled discard preserves draft; saved proposal refresh; messages/replies;145 supplied Values/context; Start Voting/vote/Finish Voting; complete winner/tasks; delegated subtask; completion/results/comments/nested reply. Browser/preview work is separate from Node capacity evidence. Preview01 auto-stopped dedicated ports before fresh preview02; no exports/imports.

## Human usability review (accepted)

Agent starts fresh preview, verifies readiness and supplies exact expiry before asking author to open:
http://127.0.0.1:5800/main.html?emulator=1&publication_fixture=1

Initial identity1. Two/seventeen seeded Chat, seven uncreated.15minutes total from helper start; verified URL/UTC expiry in scratch/c2b-preview-runtime.json. No developer console needed. Ctrl+C in preview terminal stops early; watchdog closes services and only its identified demo Firestore process. Do not export or stop another emulator.

1. Open seventeen/member count; reach last page/search17. Adopt18, reopen seventeen, Join. Count18/viewer scores change together; Original creation result remains17.
2. Adopt1/select seven/Register/Check. Inspect similar issues, enter why this building differs, Create; reload while pending if desired. One seven-member issue appears. Edited text requires recheck.
3. On two, Propose option with cost/funding/one step assigned1. Deadline & voting -> Start Voting -> Confirm. Select option/Vote. Deadline & voting -> Finish Voting -> Confirm. One actor is half this two-person pool, exceeding existing30% rule.
4. Confirm complete winner/task. Break down/add subtask; comment/reply, complete and save Results. Discussion/Other options/refresh preserve data.
5. Report unclear wording, blocked controls or mismatched count/scores. Acceptance does not authorize merge/deploy.

Agent-only setup, feature worktree, all dedicated ports free:

```powershell
$env:JAVA_HOME="C:/Program Files/Java/jdk-17"
$env:PATH="$env:JAVA_HOME/bin;$env:PATH"
$env:JAVA_TOOL_OPTIONS="-Xmx1g"
firebase emulators:start --only firestore --project demo-c2b-integration --config .env.c2b-firebase.json
```

Ignored config uses unchanged firestore.rules, Firestore127.0.0.1:8080/websocket9153, hub44893/log45893, UI disabled. Second PowerShell, same worktree:

```powershell
$env:NODE_PATH="C:/isr-mvp/functions/node_modules"
$env:C2B_EMULATOR_TESTS="1"
$env:GCLOUD_PROJECT="demo-c2b-integration"
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
python scripts/run_c2b_preview.py
```

Remaining gates: human usability/final PR CI; C3 population/9151st Join/source/scoring parity, dynamic catalogs, recursive restore, authentication/rules/IAM/old-client REST cutover. Private reads403/public roots200 observed; listener-only facade prevents accidental calls, not unauthorized access.16 Values cases/PR60 deferred.

Author accepted the numbered member/Join/Create/proposal/voting/winner/task/results-persistence checks on2026-11-24. Reported UI issues fixed: grouped match panel, standard two-row explanation, visible blue Save buttons. Screenshots browser-layout-corrected.jpg/browser-save-visible.jpg retain corrections. Required suites and final code-head CI passed. PR63 awaits explicit merge; no live rollout implied.
