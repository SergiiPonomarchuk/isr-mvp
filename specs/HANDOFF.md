# Handoff: state and next steps (2026-11-11)

Claude Code wrote this file when development moved to Codex for about a month. The rules for agents are in `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code). Each step below points to its spec, whose Status log holds the details.

**Update this file** when a step is done or the plan changes.

## 1. Where things stand

### main and the live site
- **main:** `f58bf25` (PR 17, U7). [PR 18](https://github.com/SergiiPonomarchuk/isr-mvp/pull/18) (`u7-live-record`, U7's live record, documents only) is open; merge it when the author says so.
- **Live hosting:** main at `f58bf25`, deployed 2026-11-11 06:16 UTC. U5 and U7 are live: every response is sent with `no-cache`.
- **Live functions:** the code from before A4. The old SDK and the retired models mean that Check falls back to the keyword rules and uses a random issue vector, until A4 is deployed (step 5).
- **Live data:** A1b and L1 are migrated (2026-11-09). P1, P2 and A4's vectors are **not** on live yet.
- **Live chat deadlines:** they were set to 2026-12-09 by L1. **Before that date** the author must extend them (step 7).

### The emulator
- **Its saved data:** `C:\isr-mvp\.emulator-data`, exported 2026-11-11 10:34 local time.
- **How it got there:** imported from a live export. A1b and L1 were re-applied on 2026-11-10, and **P1 was applied on 2026-11-11** (9,150 users).
- **Not there yet:** no A4 vectors, and P2 not applied, unless section 2 says otherwise.
- **Running:** from `C:\isr-mvp`, on branch `p1-profile-review`, so its functions are that branch's code (before A4).

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
| `u7-live-record` | `wt-u7` | [U7](tasks/U7-page-cache.md) | PR 18 | merge when the author says so |
| `handoff-codex` | `wt-handoff` | this file and `AGENTS.md` | | PR |
| (detached `origin/main`) | `wt-main` | | the deploy copy | refresh before each deploy |

## 2. Possibly done already: check first

Right after writing this file, Claude planned two more steps on 2026-11-11. Check whether they were done before repeating them:
- **P2's real plan and its emulator apply.** Done if `scripts/p2_generated/plan.json` is committed on `p2-homes-and-property` and the P2 Status log has a 2026-11-11 apply entry. Check: a dry run of `python scripts/migrate_p2.py` reports "to write 0".
- **A4 phase B on the emulator.** Done if the A4 Status log has the phase B entries and `specs/tasks/A4-embedding-report.md` shows the full run. Check: a dry run of `python scripts/embed_people.py` reports nothing to embed.

## 3. Next steps, in order

All runs below are on the emulator. In PowerShell, first:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:GCLOUD_PROJECT="project-a3d59130-5adf-4677-9e2"
```

After every step that writes, export the emulator (`AGENTS.md`).

1. **P2 (if not done), in `wt-p2`:**
   1. `python scripts/migrate_p2.py --make-plan`. This runs once; then commit `scripts/p2_generated/plan.json`.
   2. `python scripts/migrate_p2.py`: a dry run that writes `specs/tasks/P2-migration-report.md` and the two GeoJSON files.
   3. `python scripts/migrate_p2.py --apply`. A second run writes nothing.
   4. Export the emulator.
   5. AC3 in the browser: the profile and the geotag map show the home on its building, and the property entries.

   AC4 needs a Check with the key, so it runs with step 3. Then the Status log, CHANGES and the PR.
2. **A4 phases B and C, in `wt-a4`:**
   1. `python scripts/embed_people.py --limit 200 --apply --compare-task-types` (a sample; read `specs/tasks/A4-embedding-report.md`).
   2. `python scripts/embed_people.py --apply` for everyone: about 300 requests and 30 minutes. It resumes if stopped, at most 900 requests a run.
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
   - PR 18 at any time.
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
