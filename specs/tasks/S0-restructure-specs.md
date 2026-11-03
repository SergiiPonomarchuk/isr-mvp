# SPEC S0: restructure the specs into one living MVP specification

Status: DRAFT | Type: documentation only | Branch: docs/specs-restructure
If the repository already has a specification convention, conform to it where it does not conflict with this file.

## 1. Goal
One structured, component-oriented specification of the MVP with meaningful names, used as its technical documentation. For each component it records (a) the intended design (link to docs/, which is normative and stays untouched), (b) the as-built behaviour (verified, with file and line evidence), and (c) the gaps. Task specs are kept apart and merged into the component specs when done.

## 2. Non-goals (do NOT do)
- No code changes. No edits to docs/ or ISR_PROJECT_MANIFESTO.md. No deletion of any existing file (move or mark only, and only after approval).
- Do not invent behaviour. Anything you cannot verify is marked UNSURE.

## 3. Steps (stop after each of steps 1 and 2 and wait for approval)
Before writing any file: create the branch docs/specs-restructure from the current branch (check that git status is clean first), and commit in small steps. Use Plan mode for steps 1 and 2 if it is available. This task needs no database access and no credentials.
1. INVENTORY (report only). List every spec-like file: ISR_PROJECT_MANIFESTO.md, AGENTS.md, .agents/skills/*/SKILL.md, .antigravity/specs/*, .antigravity/project-map.md, docs/*, claude_export/*. Classify each as Vision | Design (normative) | As-built | Task | Agent instruction. For every skill and spec say whether it contains formulas, thresholds or parameters, and whether they agree with claude_export/IMPLEMENTATION_FACTS.md. List all contradictions between files. Write the report to specs/tasks/S0-inventory-report.md (the only file you may create in this step).
2. PROPOSE the structure (below), with any changes you recommend, and the mapping from existing files to new files. Write it to specs/tasks/S0-structure-proposal.md (the only file you may create in this step).
3. BUILD the component files from the template. Seed "As built" from claude_export/IMPLEMENTATION_FACTS.md (keep the file:line evidence and the VERIFIED/UNSURE labels). Seed "Intended design" with links to the sections of docs/.
4. MIGRATE existing task specs into specs/tasks/ with a status (done, superseded, open) and "merged into" links.
5. POINT every entry file (.antigravity/specs/specs-index.md, AGENTS.md, CLAUDE.md) to specs/README.md as the single index. Skills must reference the specs and must not carry their own formulas; list any that do.

## 4. Target layout
specs/
- README.md: index, status legend (IMPLEMENTED, PARTIAL, NOT IMPLEMENTED, UNSURE), rules
- 00-vision-and-scope.md (links to ISR_PROJECT_MANIFESTO.md)
- 01-architecture.md
- 02-data-model.md (collections, fields, invariants)
- 03-relevance.md
- 04-expertise.md
- 05-contribution.md
- 06-aggregation-and-voting.md
- 07-analyzer.md
- 08-values-subsystem.md
- 09-identity-access-security.md
- 10-ui-flows.md
- 11-synthetic-data-and-seeding.md
- 12-embeddings.md
- 13-deployment-and-ops.md
- decisions/ (one short page per decision that affects the MVP)
- tasks/ (task specs such as A1-canonical-isr.md; each links to the component files it changes)

## 5. Component file template
Purpose | Intended design (links to docs/) | As built (evidence, status) | Gaps | Interfaces | Tests | Open questions | Change history (task ids)
Rule: when a task is finished, its outcome is merged into the component file and the task spec gets "merged into" links.

## 6. Acceptance criteria
- README index covers every component and every task spec.
- Every component file has all template sections; every as-built statement carries evidence or UNSURE.
- No formulas or parameters are duplicated in skills or agent files; contradictions list delivered.
- docs/ and the manifesto untouched; no code changed.
