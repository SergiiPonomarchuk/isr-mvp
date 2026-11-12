# Handoff: state and next steps (2026-11-11)

Claude Code wrote this file when development moved to Codex for about a month. The rules for agents are in `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code). Each step below points to its spec, whose Status log holds the details.

**Update this file** when a step is done or the plan changes.

## Development-plan checkpoint, 2026-11-12 (current; older checkpoints below are history)

- **P1 PR #25 is merged** into main as `6d252c2`; final CI passed. Its live AC4 remains the author's step.
- The author requested an overall and detailed development plan. [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md) proposes milestones, the remaining merge/release sequence, detailed D1 work, later guardrails/access/pilot stages, estimates, model choices and decision gates. It is a proposal for review, not approval to execute later features or live actions.
- **#20 (A4) and #23 (P2) now conflict with main after P1's merge.** Their existing heads have green CI; reconciliation and combined verification are still needed. Proposed next task: reconcile #23, then integrate #20 -> #21 -> #22 -> #24, with explicit author instructions for each merge. P2's live acceptance/deployment remains tied to A5.
- The A5 preview was restored from the saved snapshot after PR #25 merged. Hosting returned HTTP 200 and functions/Firestore were ready. The serving checkout remains detached at `0ff325b`; do not switch it incidentally. Snapshot remains the 2026-11-12 06:36 UTC export.
- This planning change edits documentation only. No new application code, data migrations, model calls, rules edits or deploys. D1 implementation still waits for its approved prerequisites: P2 applied and A4/U6 live.

## P1 review checkpoint, 2026-11-12 (historical)

- P1 has been rechecked read-only after P2/A4: 9,150 users, zero changes to make, all 20,245 original skill IDs retained. Node 47 passed; Python 70 run with one existing optional skip. No generation or apply rerun. See `tasks/P1-review-report.md`. The author approved PR #25 for merge to main on 2026-11-12 (`merge PR 25`); live AC4 remains the author's step.
- Code PR dependency order: **A4 #20 -> U6 #21 -> U8 #22 -> A5 #24**. Profile migration PRs: **P1 #25 -> P2 #23**; P2's building acceptance depends on A5. All five existing PRs were green and conflict-free against their current bases at this checkpoint. Recheck bases/CI after each authorized merge. Merge only on the author's explicit `merge PR N` instruction.
- A4 phases B/C, U6 AC2-AC5, U8 AC2 and P2 AC2-AC4 are complete on the emulator. P2 AC4 originally found the unrelated-owner inclusion bug; A5 fixes it and passes the recorded replay and fresh Checks. See their branch specs/reports, rather than repeating the old run instructions below.
- **Keep the preview running.** `C:\isr-mvp` remains detached at A5 `0ff325b`, with its backend and U8 frontend. Saved emulator export: 2026-11-12 06:36 UTC. P1 now has its own `A:\BackUp\isr-mvp\worktrees\wt-p1` checkout, so do not switch the serving checkout to P1.
- No merges, deploys, rules edits, live writes or new AI calls were performed for this checkpoint. Live is still pre-A4 code/data; P1, P2 and the A4 re-embedding/deployment must be coordinated by the author after backup. Include A5 in that code deployment. D1 still waits for its specified live prerequisites.

The remaining sections describe the original handoff and historical run state; this checkpoint governs the next work.

## 1. Where things stand

### main and the live site
- **main:** `ae5343a` (PR 18, U7's live record, merged 2026-11-11). Hosting on live is `f58bf25` (PR 17); PR 18 changed documents only.
- **Live hosting:** main at `f58bf25`, deployed 2026-11-11 06:16 UTC. U5 and U7 are live: every response is sent with `no-cache`.
- **Live functions:** the code from before A4. The old SDK and the retired models mean that Check falls back to the keyword rules and uses a random issue vector, until A4 is deployed (step 5).
- **Live data:** A1b and L1 are migrated (2026-11-09). P1, P2 and A4's vectors are **not** on live yet.
- **Live chat deadlines:** they were set to 2026-12-09 by L1. **Before that date** the author must extend them (step 7).

### The emulator
- **Its saved data:** `C:\isr-mvp\.emulator-data`, last exported **2026-11-11 18:56** local time, with the Java memory at 8 GB.
- **How it got there:** imported from a live export. A1b and L1 were re-applied on 2026-11-10, and **P1 was applied on 2026-11-11** (9,150 users).
- **Also there:** **P2 applied on 2026-11-11** (homes in buildings, property; AC2 passed).
- **A4 in the saved data (18:56):** **2,038 of 9,150 people** have `t1` vectors. Phase B was re-run after the memory fix and stopped by the author at that point. Phase C is not applied. See section 2.
- **Running:** the emulator was started on 2026-11-11 in the terminal tab "emulator 8g", from `C:\isr-mvp` on branch `p1-profile-review`, with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'`. Its functions are that branch's code (before A4). It may still be running; stop it with Ctrl+C, which exports on exit.

### Branches, one worktree each
`wt-*` = `A:\BackUp\isr-mvp\worktrees\wt-*`.

| Branch | Folder | Spec | Done | Next |
|---|---|---|---|---|
| `p1-profile-review` | `C:\isr-mvp` (the main checkout) | [P1](tasks/P1-profile-review.md) | generated (5,097 people), applied on the emulator, AC2 passed | PR to main; on live, the author's AC4 |
| `a4-working-ai` | `wt-a4` | [A4](tasks/A4-working-ai.md) | phases A-C coded; phase A checked with the key (AC1-AC4); main merged in; CHANGES drafted | phases B and C on the emulator; numbers into CHANGES; PR; phase D (author) |
| `p2-homes-and-property` | `wt-p2` | [P2](tasks/P2-homes-and-property.md) | approved; `scripts/migrate_p2.py` and 14 tests; a read-only preview | the real plan, the emulator apply, AC2-AC4, PR |
| `u6-issue-location` | `wt-u6` | [U6](tasks/U6-issue-location.md) | implemented (Node 86 tests); browser checks without the key; A4 and main merged in | AC2-AC5 with the key; PR after A4 |
| `u8-map-tiles` | `wt-u8` | [U8](tasks/U8-map-tiles.md) | OpenStreetMap tiles, on top of U6; AC1-AC2 | PR after U6; AC3 on live |
| `d1-demo-data` | `wt-d1` | [D1](tasks/D1-demo-scenarios.md) | plan approved (decisions 5.1-5.5) | starts after P2 is applied and A4 and U6 are live |
| `u7-live-record` | `wt-u7` | [U7](tasks/U7-page-cache.md) | merged (PR 18) | none; the worktree can be removed |
| `handoff-codex` | `wt-handoff` | this file and `AGENTS.md` | | PR |
| (detached `origin/main`) | `wt-main` | | the deploy copy | refresh before each deploy |

## 2. Done after this file was first written (2026-11-11)

- **P2: done on the emulator.**
  - The real plan was made after P1 and committed (`scripts/p2_generated/plan.json`). The apply wrote all 9,150 people, and a second run wrote 0. AC2 passed, and the emulator was exported. CHANGES is written.
  - **Left:** AC3 (the browser check) and AC4 (a Check of a building issue and a garage issue, with the key), then the PR.
  - A dry run of `python scripts/migrate_p2.py` reports "done 9150, to write 0".
- **A4 phase B: done on 2026-11-11 after billing, but not saved** (see the next bullets).
  - 288 of 9,150 people are embedded. The free tier of `gemini-embedding-001` allows **1,000 texts a day, and every text in a batch counts** (the error names `EmbedContentRequestsPerDayPerProjectPerModel-FreeTier`). The plan had assumed one batch = one request.
  - All texts take about 29 free-tier days, on the emulator and again on live.
  - **Decided by the author on 2026-11-11: option a, billing** on the AI Studio project that owns the key (`C:\isr-mvpunctions\.secret.local`). The author's steps:
    1. https://aistudio.google.com/api-keys → the key's project → **Set up billing** (Billing Tier column).
    2. Choose or add a Google billing account.
    3. Choose a plan: Prepay (at least $5) or Postpay.
    4. Set a **monthly spend cap** of about $5 at https://aistudio.google.com/spend. With Prepay, turn off or limit the auto-reload at https://aistudio.google.com/billing.
    5. Check that the project shows **Paid** (Tier 1).

    The key stays the same.
  - **The expected cost:** about $0.16 for everyone on the emulator (the run report's estimate at $0.15 per 1M tokens), the same again on live, and fractions of a cent per Check.
  - **Billing status:** check "Paid" on the API keys page before relying on it. Until the project is paid, the free limits apply. With billing, every request of this project is billed, the Analyzer's included.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
  - A dry run of `python scripts/embed_people.py` shows what is left; the script resumes.
- **A4 after billing (2026-11-11):**
  - **The comparison** of task types: the approved choice is kept.
  - **The full phase B:** 8,462 people, 27,200 texts, 273 requests, about $0.15; all 9,150 people current.
  - **Phase C:** 2 publics, 56 documents.
  - **Two script fixes** pushed: a retry in the comparison, and the report path across drives.
  - **Not saved:** `firebase emulators:export` then failed with HTTP 500. The Firestore emulator's Java process was at its default memory ceiling (about 4.5 GB of 16 GB RAM, 0.7 GB free), so drive C also fell to 3 GB free as Windows grew its page file.
  - **Later the same day (18:3x-18:56):**
    - The author freed drive C (8.8 GB free), and the emulator was restarted with `-Xmx8g`. With the 11:35 data loaded, its Java process already used about 5.4 GB.
    - Phase B was re-run and **stopped by the author at 2,038 of 9,150 people**.
    - The export then **succeeded** (18:56). The 8 GB memory fixes the export.
    - RAM stays tight: 0.3-0.5 GB free with browsers open (Brave about 4 GB, Chrome about 3 GB). Windows' page file on C has grown to 16.6 GB.
  - **The plan for A4 on the emulator** (billing is active, so there is no daily limit):
    1. Close large programs (the browsers), so the emulator's 5-7 GB fits in RAM.
    2. If the emulator is not running, start it with `$env:JAVA_TOOL_OPTIONS = '-Xmx8g'; firebase emulators:start --only "firestore,functions,hosting" --project project-a3d59130-5adf-4677-9e2 --import=.emulator-data --export-on-exit=.emulator-data`, from `C:\isr-mvp`.
    3. In `C:\isr-mvp`, `git checkout --detach origin/a4-working-ai`. Then run `python scripts/embed_people.py --apply`; it resumes with about 7,112 people (about 35 minutes and $0.12). Then `python scripts/migrate_a4.py --apply` (1 request).
    4. `firebase emulators:export .emulator-data --force --project project-a3d59130-5adf-4677-9e2`.
    5. `git checkout p1-profile-review`.
    6. Record the numbers in the A4 Status log and CHANGES, then open the PR.

    Details are in the A4 Status log.
- **The Gemini quota:** the free daily quota was used up on 2026-11-11, and it resets at 08:00 UTC. Every Check uses 1 embedding (one text) and 1 text-model request.

## 3. Next steps, in order

All runs below are on the emulator. In PowerShell, first:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:GCLOUD_PROJECT="project-a3d59130-5adf-4677-9e2"
```

After every step that writes, export the emulator (`AGENTS.md`).

1. **P2 (done up to AC2; see section 2), in `wt-p2`:**
   1. `python scripts/migrate_p2.py --make-plan`. This runs once; then commit `scripts/p2_generated/plan.json`.
   2. `python scripts/migrate_p2.py`: a dry run that writes `specs/tasks/P2-migration-report.md` and the two GeoJSON files.
   3. `python scripts/migrate_p2.py --apply`. A second run writes nothing.
   4. Export the emulator.
   5. AC3 in the browser: the profile and the geotag map show the home on its building, and the property entries.

   AC4 needs a Check with the key, so it runs with step 3. Then the Status log, CHANGES and the PR.
2. **A4 phases B and C, in `wt-a4`** (phase B is partial and waits for the author's quota decision; see section 2):
   0. **Where to run it:** the scripts read the key from their own repository folder, and only `C:\isr-mvp` has it. Run them in `C:\isr-mvp` checked out detached at `origin/a4-working-ai` (`git checkout --detach origin/a4-working-ai`; the branch itself is checked out in `wt-a4`). Write the reports into `wt-a4` with `--report A:/BackUp/isr-mvp/worktrees/wt-a4/specs/tasks/<name>.md`. Then go back with `git checkout p1-profile-review` (or main once P1 is merged).
   1. After the author confirms the project is "Paid": send one tiny embedding request to check the quota. Then run `python scripts/embed_people.py --limit 200 --apply --compare-task-types` again, for the comparison, which failed on 2026-11-11. The 200-person sample is already embedded.
   2. `python scripts/embed_people.py --apply` for the remaining 8,862 people: 288 requests of up to 100 texts, under an hour. It resumes if stopped, at most 900 requests a run.
   3. `python scripts/migrate_a4.py` (a dry run), then `--apply`, for the A1b publics.
   4. Export the emulator.
   5. Put the numbers into CHANGES and the A4 Status log; open the PR "A4: working AI".

   P1 is applied, as phase B needs; P2 does not change the embedded texts.
3. **U6's checks with the key** (AC2-AC5): the emulator must run U6's functions, which include A4's.
   1. Stop the emulator cleanly (Ctrl+C in its terminal saves its data).
   2. In `C:\isr-mvp`, with a clean working tree, run `git checkout u6-issue-location`. This folder holds the key file and `node_modules`.
   3. Start the emulator again from `C:\isr-mvp`.
   4. Run the checks in the U6 spec: 4 Checks, a moved pin, a forged location, the switch. About 8 text, 8 embedding and at most 4 Nominatim requests.

   P2's AC4 (a building issue from a resident of osbb 1, h5) can run here too.
4. **Pull requests, in order:**
   - P1 and P2 at any time;
   - A4, then U6 (merge main into it again if needed), then U8;
   - PR 18 is merged.
5. **The author's live steps,** after the merges. Run them from `C:\isr-mvp` on an up-to-date main: it has the key file and the Python packages. The agent checks read-only after each step.
   1. **Backup:** `python scripts/backup_firestore.py --project project-a3d59130-5adf-4677-9e2 --out A:\ISR\mvp\dbbackup\<date>`.
   2. **P1:** `python scripts/migrate_p1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`. This also rebuilds `user_packs`. Then the agent runs `python scripts/audit_profiles.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live`, which is read-only.
   3. **P2:** `python scripts/migrate_p2.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`, with the committed plan. A person whose live input differs is held and reported.
   4. **The key:** `firebase functions:secrets:set GEMINI_API_KEY --project project-a3d59130-5adf-4677-9e2`.
   5. **Deploy** A4, U6 and U8 together, from `wt-main`: `cd A:\BackUp\isr-mvp\worktrees\wt-main; if ($?) { firebase deploy --only "functions,hosting,firestore:rules" --project project-a3d59130-5adf-4677-9e2 }`.
   6. **Straight after the deploy:**
      - `python scripts/embed_people.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`;
      - then `python scripts/migrate_a4.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --apply`.

      Until the people are re-embedded, S and E compare vectors from two different models.
   7. **The agent's live checks:** A4 AC8, U6's live behaviour and U8 AC3, all read-only.
6. **D1** (the demo scenarios and data), after step 5.
7. **Before 2026-12-09, the author:** extend the live chat deadlines. First a dry run, then:

   ```powershell
   python scripts/migrate_l1.py --project project-a3d59130-5adf-4677-9e2 --i-know-this-is-live --new-deadline <YYYY-MM-DD> --apply
   ```

   Otherwise the nightly `closeExpiredTopics` (00:30 Europe/Zurich) on 2026-12-10 closes most open topics.

## 4. Later, and known items

- Roadmap stages 4-8 ([ROADMAP-demo.md](ROADMAP-demo.md)).
- Move the HTTPS functions to europe-central2, and upgrade `firebase-functions` and the Firebase CLI (14.1 is installed; 15.x is current).
- The map's marker icons come from `raw.githubusercontent.com` (a GitHub repository, not a CDN), and the shadow from Leaflet 0.7.7 on cdnjs (noted in U8).
- U6: `geocode_cache` and `config` are open to clients under the R0 rules until the stage 5 rules.
- The R0 Firestore rules expire 2027-06-30.
