# CLAUDE.md (project root; keep under 200 lines)

## Project
ISR MVP: issue-specific weighted participation prototype (Firebase/Firestore, Cloud Functions, JS front end, Python seeding scripts). It is a partial prototype on synthetic data. It is being analysed for an academic paper, so exact behaviour matters more than new features.

## Workflow (specification first)
1. Work from a spec: specs/README.md is the index; task specs live in specs/tasks/. Read the spec fully before touching code.
2. Write a short plan and wait for approval (Ask mode).
3. Implement on a feature branch, never on main. Run the tests.
4. Fill in the spec's Status log and write CHANGES.md.
5. If the spec is ambiguous or conflicts with the code, stop and ask. Do not widen scope.

## Guardrails
- No deploys, no Firestore rules changes, no writes to production data; use the emulator or a copy.
- Do not edit files under docs/ unless the spec says so.
- Never print or save secrets or personal fields (emails, passwords, tokens).

## Where facts live
- specs/HANDOFF.md: the current state of every branch and the next steps (Codex reads it through AGENTS.md, which repeats these rules).
- claude_export/IMPLEMENTATION_FACTS.md: audit of what the code actually does (verified with file and line numbers).
- claude_export/EMBEDDINGS.md: facts about stored embeddings.
- docs/: the specification documents (they describe the intended design, which differs from the code in several places).

## Terms
ad-hoc public = the group formed for one issue (the code and old docs say "microcommunity"); R = relevance, E = expertise, C = contribution.
