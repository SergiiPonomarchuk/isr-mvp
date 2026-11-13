# U10 emulator evidence, 2026-11-13

Feature: `codex/similar-active-issues`, based on proposal PR #31.

## Results

- Full Node suite: 105 cases, 104 passed, one optional emulator skip, zero failures.
- Python: 111 run, two existing skips, zero failures.
- Explicit emulator test: one real-HTTP integration scenario passed, 27.9 seconds. Its assertions exercise initial 100-member creation, completed creation replay, duplicate Check/review, explicit Join to 101, concurrent repeated Join to 102, one event per new member, canonical ISR/maps/participants, separate creation provenance, stale review rejection, simultaneous creation of another issue, injected transaction rollback and successful retry, voting-phase Join rejection and invalid identity.
- The first race fixture failed because it did not mark a moved pin as `location_source: creator`; both requests correctly returned 409 for changed location. Correcting that test input produced one 200 and one 409 as required.
- AI responses/vectors in transaction tests are mocked. Actual-model calibration is stored separately in `functions/test/u10-calibration.json`: one request, eight synthetic texts, 97 estimated tokens.
- Frontend syntax and CRLF/lone-final-CR storage checks passed. Browser acceptance is **not completed**: computer-use failed twice to create its process security environment, including after reset (0x8007000F). The temporary disposable browser fixture was stopped; saved main emulator data was not imported or exported.

## Repeat backend check (Windows PowerShell)

Use a new disposable Firestore instance on 8185. The test refuses other emulator hosts/projects and requires an empty database. No secrets or live project are needed.

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-similar-active-issues
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
$env:GCLOUD_PROJECT = 'demo-u10'
$env:U10_EMULATOR_TESTS = '1'
$env:JAVA_TOOL_OPTIONS = '-Xmx1400m'
firebase emulators:exec --only "firestore" --project demo-u10 --config functions/test/u10-emulator.json "node --test functions/test/u10-integration.test.js"
```

## Author browser acceptance

2026-11-13: Author manually verified the isolated demo-u10 preview as Synthetic 95: Check showed the existing entrance-lock issue with Open/Join, and Join opened it with 101 members. Author reported “all is ok - exactly as you have described”. This confirms the repeated-issue/nonmember-join UI path with mocked AI; already-member status, explained separate creation and input invalidation still need their browser checks. No live deployment or writes.

The manual preview runs from an ignored scratch harness on http://127.0.0.1:5001/main.html?emulator=1, with synthetic login and a runtime emulator-host safety banner. No API key is used.

## Remaining browser acceptance

On a safely isolated emulator, adopt an actual nonmember, enter the entrance-lock title/description and Check. Confirm the existing issue appears with Open and Join before the new-public preview. Join must open it and show 101 members; repeating Check must show membership status. Separately confirm that explaining a distinct repair enables Create, changing text/pin requires Check again, and a later new match returns for review. Check visual layout and wording. Human judgment of the narrow English demo match calibration remains required before live deployment. Provide a concrete running preview and full user steps when browser tooling is available; do not deploy to obtain this check.

## Active-title/single-Create revision

Author approved active-only title uniqueness and removing Continue. Revised emulator test passed in 18.5 seconds; Node 105 passed plus one optional skip, Python 111 run/two skips. Tests cover title conflicts beyond five shortlist entries and across locations, case/space normalization, no explanation override, closed-title reuse and existing transactional regressions. Author confirmed the original remaining browser cases; revised UI acceptance pending. No additional paid requests.
