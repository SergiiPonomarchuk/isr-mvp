# AGENTS.md (for Codex and other coding agents)

**Read first:** `specs/HANDOFF.md`. It holds the state of every branch, the next steps in order, and the author's live steps.

## Project
ISR MVP: an issue-specific weighted participation prototype. It uses Firebase/Firestore, Cloud Functions (Node 22), a JS front end in `prototype/`, and Python scripts in `scripts/`.
- It is a partial prototype on synthetic data, analysed for an academic paper, so exact behaviour matters more than new features.
- MVP choices are argued by what the MVP needs, not by "the paper needs it".

## Workflow (specification first)
1. Work from a spec. `specs/README.md` is the index; task specs live in `specs/tasks/`. Read the spec fully before touching code.
2. State a short plan and proceed within the author's request or approved scope. Follow the handoff through implementation, tests, emulator checks, fixes, documentation and PR checks. Continue to the next ready step without waiting for another “go on”.
3. Implement on a feature branch, never on main. Run the tests: `cd functions; npm test` and `python -m unittest discover -s tests`.
4. Fill in the spec's Status log and write CHANGES.md (newest entry on top).
5. Make routine, reversible implementation decisions. Ask the author when a spec conflict or ambiguity affects intended behaviour, acceptance criteria, scope or budget. Continue independent work already in scope while waiting.
6. Open pull requests with `gh`. Merge only when the author writes "merge PR N".

### When to involve the author

- Run objective checks yourself, including browser checks on the emulator and permitted read-only checks on live. When acceptance needs human judgment, give the author the emulator or live URL, steps to reproduce, and what to assess.
- Recommend the simplest, lowest-cost development model and reasoning level sufficient for the current task. Suggest an upgrade when the task needs it.
- If the next task warrants a different development AI model or reasoning level, recommend the selection and explain why before starting the work that needs it. The author controls the switch. Changing the application’s Gemini models is a separate project decision.
- For a decision, give the author the relevant result, your recommendation and the specific choice needed. For an author-only action such as a merge instruction, deploy or live migration, finish the preparation and give the exact next instruction. Resume from that point when the author responds.

## Guardrails
- No deploys, no Firestore rules changes, no writes to production data; use the emulator or a copy.
  - Deploys and every live `--apply` are the author's steps. Read-only live checks (curl, read-only scripts) are allowed.
- Do not edit files under `docs/` unless the spec says so.
- Never print or save secrets or personal fields (emails, passwords, tokens). Synthetic names are fine.
- **The Gemini API key** lives in `C:\isr-mvp\functions\.secret.local` (gitignored). Never read, print, copy or grep it; the scripts and the functions emulator load it themselves. If another folder needs the key, ask the author.
- **The Gemini quota:**
  - On the free tier, `gemini-3.1-flash-lite` allows 15 requests a minute and 500 a day.
  - On the free tier, `gemini-embedding-001` allows 1,000 **texts** a day: every text in a batch counts (measured 2026-11-11).
  - The daily limits reset at midnight Pacific (08:00 UTC).
  - **Billing (author, 2026-11-11):** the key's AI Studio project moves to the paid tier, with a monthly spend cap of about $5, so that A4 can embed everyone. Check that the project shows "Paid" on https://aistudio.google.com/api-keys before relying on the paid limits.
  - Either way, keep the usage small and record the request and token counts in the spec.

## Environment (Windows 11)
- **Shells:** commands for the author are in **Windows PowerShell 5.1** syntax. Use `;` and `if ($?) { ... }`; never `&&` or `cd /d`. Git Bash is available for agents.
- **The main checkout** `C:\isr-mvp` holds:
  - `.emulator-data` (the emulator's saved data, gitignored);
  - `functions/.secret.local` (the key);
  - `functions/node_modules` (with `@google/genai`).
- **Feature branches** are git worktrees in `A:\BackUp\isr-mvp\worktrees\<name>`, because drive C is nearly full.
  - Drive A is exFAT, so each new worktree needs `git config --global --add safe.directory A:/BackUp/isr-mvp/worktrees/<name>`.
  - Drive A can disconnect for a while. Push promptly, and never run `git worktree prune` while it is missing.
  - Before removing a worktree, leave its folder.
- **Node tests in a worktree without `node_modules`:** set `NODE_PATH=C:\isr-mvp\functions\node_modules` for branches that use `@google/genai` (A4 and later). Code on main still uses `@google/generative-ai`, so run `npm ci --cache A:/BackUp/isr-mvp/npm-cache` in that worktree's `functions` folder.
- **The emulator** (Firestore 8080, functions 5001, hosting 5000, hub 4400, UI 4000):
  - Start it in PowerShell from the folder whose code it should run:

    ```powershell
    firebase emulators:start --only "firestore,functions,hosting" --project project-a3d59130-5adf-4677-9e2 --import=.emulator-data --export-on-exit=.emulator-data
    ```

    Keep the quotes around `--only`.
  - It saves only on a clean exit. After every migration, run `firebase emulators:export .emulator-data --force --project project-a3d59130-5adf-4677-9e2`.
  - **Memory:** with all of A4's vectors loaded, the default Java memory (a quarter of the RAM) is too small to export. Start it with `$env:JAVA_TOOL_OPTIONS="-Xmx8g"` set first.
  - Its functions are the code of the folder it was started from.
- **Scripts on the emulator:** set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` and `GCLOUD_PROJECT=project-a3d59130-5adf-4677-9e2`. The scripts refuse to touch live without `--project … --i-know-this-is-live`, and they are dry runs unless given `--apply`.
- **Browser tests:**
  - Open the local page with `?emulator=1`; without it, the local page uses the LIVE database.
  - Before any write, check that `firebase.firestore()._delegate._settings.host` is `127.0.0.1:8080`.
  - Log in by setting `sessionStorage` `userId` (for example `"2"`) and `userName`.
- **Deploys** (the author's step):
  - only from `A:\BackUp\isr-mvp\worktrees\wt-main`, a clean detached checkout of `origin/main`, refreshed with `git -C A:/BackUp/isr-mvp/worktrees/wt-main fetch` and then `checkout --detach origin/main`;
  - with a PowerShell command such as `cd A:\BackUp\isr-mvp\worktrees\wt-main; if ($?) { firebase deploy --only hosting --project project-a3d59130-5adf-4677-9e2 }`;
  - afterwards, verify live read-only: the headers, and the files compared with main.
- **`prototype/js/main.js`** is stored with CRLF line endings and ends with a lone CR. A script that rewrites it must keep both, or the diff covers the whole file. Prefer exact small edits.
- **The synthetic world** is two fictional cities, Andim and Bilim, placed on real coordinates near Basel and Weil am Rhein. Real map features under them do not matter.
- **Live site:** https://project-a3d59130-5adf-4677-9e2.web.app

## Where facts live
- `specs/HANDOFF.md`: the current state and the next steps.
- `claude_export/IMPLEMENTATION_FACTS.md`: an audit of what the code actually does (with file and line numbers).
- `claude_export/EMBEDDINGS.md`: facts about the stored embeddings.
- `docs/`: the specification documents (the intended design, which differs from the code in several places).
- `specs/ROADMAP-demo.md`: the stages to a demonstration.

## Terms
- ad-hoc public: the group formed for one issue (the code and old docs say "microcommunity").
- R = relevance, E = expertise, C = contribution; ISR combines them into a member's vote weight.
