# R1 optional metadata: author-only live runbook

Prepared2026-11-23; **do not run apply until the PR is merged/reviewed and the author explicitly chooses the live step.** This preparation approval did not authorize live writes. No deployment or Gemini key is needed.

## Reviewed change

Exactly224 frozen users; add only values_taxonomy.meta.timestamp, vector_id and overall_confidence. These are retained historical source values, not a new timestamp or calculated confidence. Existing version1.0/uid/hash/gl_cs/overall_grounding, Values/null encodings and all unrelated fields stay intact. No16 deferred profiles, counter migration, regeneration or X preparation. Each document gets one compare-and-set update with exactly three dotted paths. Plan scope/source file and entry digests are revalidated before apply/verify; current profile update time and whole before state are checked before any write.

Private plan: A:/BackUp/isr-mvp/rollouts/optional-metadata-20261123/plan.json

Plan payload digest: cae0cc1903acd63d904570f7bb568f1b744c6a0259dfbf16d297749d7be90110. This is the canonical payload digest, not the JSON file byte checksum. Preparation verified before224/desired0/conflict0. The new R1 journal must be separate from the old grounding journal. Keep the plan and journal private on drive A.

## 1. Prepare Windows PowerShell

Keep drive A connected. Open PowerShell, paste this entire block. This uses the reviewed feature checkout; confirm clean git status and reviewed PR commit before proceeding. Do not switch the serving C checkout. A merged checkout may be used later only after verifying the utility/scope match the reviewed PR.

```powershell
Set-Location 'A:/BackUp/isr-mvp/worktrees/wt-values-optional-metadata'
git status --short
git rev-parse HEAD
Remove-Item Env:FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
$optionalProject = 'project-a3d59130-5adf-4677-9e2'
$optionalPlan = 'A:/BackUp/isr-mvp/rollouts/optional-metadata-20261123/plan.json'
$optionalJournal = 'A:/BackUp/isr-mvp/rollouts/optional-metadata-20261123/apply.jsonl'
$optionalArtifacts = @('--artifact', 'C:/isr-mvp/db/vectorized_backup.json', '--artifact', 'C:/isr-mvp/db/values-vector.json')
```

Use existing Google ADC credentials. Do not open/copy secrets. AI calls and AI cost are zero; normal Firestore reads/writes use the existing project billing.

## 2. Verify before apply (read-only)

```powershell
python -W ignore scripts/recover_optional_values_metadata.py verify --project $optionalProject --i-know-this-is-live --plan $optionalPlan @optionalArtifacts
```

Before the initial apply expect complete=true, desired0, before224, conflict0, write_attempts0. Here before means the exact five existing grounding/provenance keys with all three optional keys absent. Stop on any conflict or unexpected state. Apply additionally checks every exact profile update time; even an unrelated edit since planning can block it.

## 3. Apply (author only, after separate live approval)

```powershell
python -W ignore scripts/recover_optional_values_metadata.py apply --project $optionalProject --i-know-this-is-live --apply --plan $optionalPlan --journal $optionalJournal @optionalArtifacts
```

Keep PowerShell and drive A available until completion. Expected initial result: complete=true, confirmed_writes224, ambiguous_ownership0, rollback_ready=true and no conflicts; progress every20 targets. This is224 separately guarded documents, not one atomic operation. A stop may leave a partial apply. Preserve both plan and journal. Send the final/error output for review and do not change artifacts or delete/recreate the journal to bypass a stop.

After an interrupted run is reviewed, retry the exact full apply command above with the same journal. Confirmed writes are checked/skipped. A lost commit response can be reconciled without repeating the write; its ownership is marked unproven and automatic rollback is withheld. A stale .run-lock after a crash requires checking that no process remains before removal; never remove it automatically. Corrupt/partial journals need manual review. Preserve the full database backup as well: this metadata-only recovery record is not a replacement for it.

## 4. Verify after successful completion

```powershell
python -W ignore scripts/recover_optional_values_metadata.py verify --project $optionalProject --i-know-this-is-live --plan $optionalPlan @optionalArtifacts
```

Expect complete=true, desired224, before0, conflict0, write_attempts0. Keep the result with the private plan/journal and send the final apply/verify output. No browser interaction is needed for this metadata-only step.

## Recovery (only after review/author decision)

The same plan/journal binds recovery to acknowledged writes. Rollback deletes only the three added dotted fields, preserving the prior five-key map. The whole set is checked before any rollback write; later changes, conflicting metadata, changed Values/narratives or unproven ownership stop recovery. It never replaces full documents or restores historical Firestore update times. No source artifacts are needed to undo confirmed writes.

```powershell
python -W ignore scripts/recover_optional_values_metadata.py rollback --project $optionalProject --i-know-this-is-live --apply --plan $optionalPlan --journal $optionalJournal
python -W ignore scripts/recover_optional_values_metadata.py verify --project $optionalProject --i-know-this-is-live --plan $optionalPlan @optionalArtifacts
```

After a complete rollback expect before224/desired0/conflict0. Reviewed retries reconcile a lost rollback response without repeating deletion. The synthetic SDK/CLI rehearsal restored all241 full document bodies and left the16 deferred/control update times unchanged.
