# D1 guided demonstration - rehearsal draft

Status: real seed/import verified; browser normal creation, duplicate/title/Open and explicit 101st-member Join passed. Full human option/vote/result/task cycle remains pending. **Current session:** the flagship already exists; open it as the flagship creator and continue from step 5. Steps 3/4/6 have already been exercised; do not repeat their Checks because the first-pass Check/lookup ceiling is reached. Read [current setup](demo/README.md). The numbered full script below also describes a future fresh presentation with its own approved budget.

1. Complete the local seed and read-only checker, confirm nine visible seeded cases and one hidden standby, and keep the emulator/export and preview running.
2. Open http://127.0.0.1:5002/d1-guide. Its cards provide the actual stored creator ids, exact title/description and options/steps after content generation. Open the flagship creator link; verify the green `Emulator verified` banner.
3. In Chat choose **Start new issue topic**, paste D1-01's exact title/description, and click **Check** once. Show the resolved P2 building/home, derived parameters and initial public preview. The hidden standby must not be returned as a duplicate. Proceed with **Create** when the model source is shown, then open the new topic. If the model is unavailable, use the explicit fallback below.
4. Record the newly created flagship without a document-id lookup or developer console. The agent can do this read-only against the emulator; its only write is the local manifest:

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-d1-guided-demo
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
python scripts/demo_presenter.py --project project-a3d59130-5adf-4677-9e2 --record-flagship auto
```

5. Reload the local guide. Use its actual flagship membership and ISR coalition links. Show the member list and distinguish R from the ISR vote weight; explain that Contribution is currently a constant placeholder and D is still a gate.
6. Repeat the exact issue at Check as an existing member: Open/status and a blocked same active title. Use a genuine paraphrase once: inspect the same active match. Open the guide's nonmember profile link, repeat the Check, and explicitly Join. Verify one new member/event and coherent score/maps. A naturally smaller building need not be forced to 100; the >100 boundary has its separate real-handler fixture.
7. For the full cycle, the creator proposes the two stored options with cost, funding, resources and responsible-person steps. The guide lists each value; assign the actual creator as responsible unless the reviewed content plan names another permitted member. Use the real UI controls; no hand-entered ISR.
8. Start Voting through **Deadline** management. Use the guide's current coalition profile links: each member supports **Start Voting**, confirming the action as prompted. The coalition is computed from actual member ISR and reaches at least 30% of the pool. Refresh the guide if membership changed. For the option vote, those members choose the agreed option; show the weighted tally and quorum. They then support **Finish Voting** in Deadline. The server stores the winner/tally and creates the winner's tasks. Open To Do and show the responsible person's task, not a hard-coded mock.
9. Visit the nine seeded cases: 2/6/9 discussion, 3/5/8 voting, 4/7/10 tasks. Explain named-place lookup/credit, demographic affectedness, work anchor, semantic interests, expertise, social ties and broad-scope weighting. Keep this tour brief enough for the planned 10-15 minutes.
10. Run `python scripts/check_demo.py --project project-a3d59130-5adf-4677-9e2 --report scratch-d1-presented-check.json` from the same prepared PowerShell. Inspect the reported differences rather than assuming the screen proves the numbers. The displayed/stored scores, counted votes, winner and task assignments must agree.

## AI-unavailable fallback

If Check/creation fails, inspect the saved draft/creation result and current topics first. An ambiguous timeout is not evidence that nothing was created. Open/recover an existing successful flagship. Only if no normal matching issue exists should the author explicitly promote the stored standby:

```powershell
Set-Location A:\BackUp\isr-mvp\worktrees\wt-d1-guided-demo
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:GCLOUD_PROJECT = 'project-a3d59130-5adf-4677-9e2'
python scripts/demo_presenter.py --project project-a3d59130-5adf-4677-9e2 --activate-standby
python scripts/demo_presenter.py --project project-a3d59130-5adf-4677-9e2 --activate-standby --apply
```

Promotion rechecks conflicts atomically and makes no AI call. It refuses when a live matching issue exists, including a concurrent normal creation. The fallback's real vectors/public remain registration-time results; it does not invent a new response. Its prepared options/messages allow resuming the same cycle from Open. Do not present the fallback as a successful new AI call.

## Separate-creation and repeat rehearsal

Exercise the distinct-title/explanation/Create path and text/pin invalidation on a disposable rehearsal copy, not as extra permanent scenario cards. It must preserve the single Create action and unique active titles. Closed titles can recur. Capture the accepted result and restore the named seed snapshot for another clean rehearsal; a presentation-started manifest refuses silent reseeding/reset.

This guide is for an author-presented synthetic prototype, not an independently shared or real-user pilot. The live seed/activation/votes remain author actions after merge, fresh backup/recovery and a separately checked live plan/budget. Full human acceptance and the named import/export checkpoint are still pending.
