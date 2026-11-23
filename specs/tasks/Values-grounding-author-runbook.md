# Grounding metadata: author-only live runbook

Prepared2026-11-23. **Not an instruction to apply now.** Review/merge the PR first; live apply requires a later author decision. Agent operations were read-only. No deployment is needed for this Python utility.

## Reviewed result and limits

The private frozen plan is ready for224 profiles with zero conflicts. It updates only users/{uid}.values_taxonomy.meta with version1.0, uid, narrative hash, ten-domain grounding/confidence map and the calculated plain mean overall_grounding. No Values, narrative, other profile fields or retained sources are changed. Thirteen historical source versions2.1 are normalized in the new metadata only. The16 IDs in DB-audit-restoration-followups.md stay excluded and are restored only after the DB audit. Missing historical timestamps/vector IDs/overall confidence remain audit follow-ups.

Plan digest: e5152acd24d074a44880a9b2e44bc5ca90a17a15472ec6b32f361f43d9b67e11. The digest is of the canonical plan payload, not the JSON file bytes. Sources and original inventory are frozen by committed hashes. Do not edit those files or delete/recreate the journal to bypass a stop. Plan/journal contain IDs, hashes and metadata, without narratives or Values. Keep them private on drive A.

## 1. Prepare PowerShell (after separate live approval)

Open Windows PowerShell. Keep drive A connected. Use the reviewed feature checkout below; confirm its commit is the reviewed PR head before running. A later merged checkout may be substituted only after checking it has the same reviewed utility/scope. Do not run from a different emulator environment.

```powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-values-grounding-dry-run'
git status --short
git rev-parse HEAD
Remove-Item Env:FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
$groundingProject = 'project-a3d59130-5adf-4677-9e2'
$groundingPlan = 'A:\BackUp\isr-mvp\rollouts\grounding-inventory-20261123\grounding-plan.json'
$groundingJournal = 'A:\BackUp\isr-mvp\rollouts\grounding-inventory-20261123\grounding-apply.jsonl'
$groundingArtifacts = @('--artifact', 'C:\isr-mvp\db\vectorized_backup.json', '--artifact', 'C:\isr-mvp\db\values-vector.json')
```

No Gemini key is needed; do not open/copy a secret. Use existing Google ADC credentials. No model calls or new AI charges. Firestore reads/writes use the existing project billing.

## 2. Verify before writing

This command is read-only. It should return complete=true, desired=0, before=224, conflict=0 before the first apply. On a retry, desired/before can be mixed. Verification checks content/metadata; apply additionally checks every source and exact profile update time. Any changed profile causes a stop, not a forced patch.

```powershell
python -W ignore scripts/backfill_values_grounding.py verify --project $groundingProject --i-know-this-is-live --plan $groundingPlan @groundingArtifacts
```

Stop if it fails. The plan records whether metadata was absent or explicit null; the durable write-ahead journal records acknowledged writes and precise post-update times, providing the metadata recovery record. Preserve the existing full database backup as well; this utility does not replace it. No deletion/replacement of whole documents occurs.

## 3. Apply (author only, after approval)

Run once. Keep PowerShell/drive A available until completion. The initial successful result should show complete=true, confirmed_writes=224, ambiguous_ownership=0, rollback_ready=true and no conflicts. Progress prints every20 profiles. Each write is a compare-and-set on the exact snapshot timestamp; this is not an atomic224-document operation and may stop partially complete.

```powershell
python -W ignore scripts/backfill_values_grounding.py apply --project $groundingProject --i-know-this-is-live --apply --plan $groundingPlan --journal $groundingJournal @groundingArtifacts
```

If interrupted, preserve the same plan/journal. Send the status/error output for review; do not share credentials. After review, retry the **same full apply command above**. Already acknowledged patches are checked/skipped. A lost response may be reconciled without a duplicate write, but ownership is then unproven: automatic rollback is withheld. A stale .run-lock left after a crash requires review that no process is running before removal; do not remove it automatically. Partial/corrupt journals require manual review; never truncate them.

## 4. Verify after completion

Expect complete=true, desired=224, before=0, conflict=0. Save the JSON result with the private plan/journal. Do not regenerate Values or repair the16 deferred cases here.

```powershell
python -W ignore scripts/backfill_values_grounding.py verify --project $groundingProject --i-know-this-is-live --plan $groundingPlan @groundingArtifacts
```

## Recovery: only after review/author decision

Use the same plan/journal. Rollback restores only confirmed metadata changes, preserving absent versus null. All224 preconditions are checked before the first recovery write. Later edits or uncertain ownership stop recovery with zero write attempts; they require manual review. It never restores full documents. A lost rollback response can be reconciled on a reviewed retry without repeating deletion. No artifacts are required to undo a confirmed write.

```powershell
python -W ignore scripts/backfill_values_grounding.py rollback --project $groundingProject --i-know-this-is-live --apply --plan $groundingPlan --journal $groundingJournal
python -W ignore scripts/backfill_values_grounding.py verify --project $groundingProject --i-know-this-is-live --plan $groundingPlan @groundingArtifacts
```

A completed rollback should verify before=224, desired=0, conflict=0. It creates new database update times; historical document update times cannot be restored. The synthetic rehearsal compared all241 complete documents after recovery and verified the16 deferred/control documents were never touched.
