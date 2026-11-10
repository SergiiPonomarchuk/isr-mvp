# ISR MVP specification (index)

This folder is the single, living specification of the ISR MVP. For each component it records:
- the **intended design**: links to `docs/`, or to a decision page where one overrides `docs/`;
- the **as-built** behaviour: verified, with `file:line` evidence;
- the **gaps** between the two.

Task specs live in `tasks/` and decisions in `decisions/`.

Created by task S0 (`tasks/S0-restructure-specs.md`). Every component file states the commit its as-built evidence was checked against. The audited code state is commit `0620f27` (PD-6).

---

## Status legend

| Label | Used for | Meaning |
|---|---|---|
| IMPLEMENTED | component or statement | The intended design is in the code and the evidence shows it. |
| PARTIAL | component or statement | Some of the intended design is in the code, or it is implemented differently. |
| NOT IMPLEMENTED | component or statement | Nothing of the intended design is in the code. |
| UNSURE | component or statement | Not verified. Treat it as unknown, never as true. |
| VERIFIED | evidence | Confirmed by reading the cited code, and where marked "(data)", by recomputing stored values (as in IF). |

**IF** = `claude_export/IMPLEMENTATION_FACTS.md`. "IF l.N" points to a line in that file, which cites the code.

---

## Precedence rules

1. **Decision pages override `docs/` for the intended design.** Each page in `decisions/` lists the `docs/` sections it overrides. `docs/` itself is never edited.
2. **`docs/` is the normative intended design** wherever no decision page overrides it. Where two docs contradict each other, the component file records a Gap. Neither side wins without an author decision.
3. **As built: the code is the truth.** `IMPLEMENTATION_FACTS.md`, `EMBEDDINGS.md` and `SCHEMA.md` in `claude_export/` are the audited evidence. Anything they do not cover is UNSURE until verified.
4. **`ISR_PROJECT_MANIFESTO.md` is vision only** (S0-D1). Its rules and formulas are superseded by the component files; `00-vision-and-scope.md` lists what supersedes what.
5. **`docs/mvp.html` is a public-facing design overview, not normative** (S0-D2).
6. Agent files and skills (`.agents/`, `.antigravity/`, `CLAUDE.md`) point here. They do not override anything in this folder.

## Rules

- **One home per fact.** Each formula, threshold and parameter lives in exactly one component file. Skills, agent files and other specs link to it and do not copy it.
- **Evidence or UNSURE.** Every as-built statement carries `file:line` plus VERIFIED, or it says UNSURE. Do not fill gaps from `docs/`.
- **Never "correct" the as-built side to match the design.** Record the difference under Gaps instead.
- **Tasks.** Each task spec lives in `tasks/` and names the component files it changes. When a task is done, its outcome is merged into those files (Change history), and the task gets "merged into" links.
- **Decisions.** One short page per decision in `decisions/`. Component files cite decision ids.
- **Changes to the MVP code** happen on a branch, are tagged, and are recorded in the matching component file (PD-6). Each component's "Verified against" line is then updated.

---

## Components

| File | Component | Status | Written in |
|---|---|---|---|
| [00-vision-and-scope.md](00-vision-and-scope.md) | Vision, scope, what supersedes the manifesto | n/a | S0 batch 1 |
| 01-architecture.md | Architecture, implementation paths | planned | S0 batch 2 |
| [02-data-model.md](02-data-model.md) | Collections, fields, invariants | PARTIAL | S0 batch 1 |
| [03-relevance.md](03-relevance.md) | Relevance R = D, G, S, X | PARTIAL | S0 batch 1 |
| 04-expertise.md | Expertise E | planned | S0 batch 2 |
| 05-contribution.md | Contribution C | planned | S0 batch 2 |
| [06-aggregation-and-voting.md](06-aggregation-and-voting.md) | Normalisation, member ISR, vote tally, options | PARTIAL | S0 batch 1 |
| 07-analyzer.md | Issue Analyzer | planned | S0 batch 2 |
| 08-values-subsystem.md | Values narratives, vectors, public VoV | planned | S0 batch 2 |
| 09-identity-access-security.md | Login, rules, AAuth, gISR | planned | S0 batch 2 |
| 10-ui-flows.md | UI flows | planned | S0 batch 2 |
| 11-synthetic-data-and-seeding.md | Synthetic data and seeding scripts | planned | S0 batch 2 |
| 12-embeddings.md | Embeddings | planned | S0 batch 2 |
| 13-deployment-and-ops.md | Deployment, logging, operations | planned | S0 batch 2 |
| 14-conventions.md | Terminology, naming, code and UI conventions | planned | S0 batch 2 |

## Decisions

| Id | Title | Affects |
|---|---|---|
| [PD-1](decisions/PD-1-scope-inclusion-soft-d.md) | Scope, inclusion floor, soft D (paper D-001) | 00, 03, 07 |
| [PD-2](decisions/PD-2-resources-and-money.md) | Resources and money (paper D-002); superseded by PD-8 | 04, 06 |
| [PD-3](decisions/PD-3-additive-formula.md) | Additive formula, mean normalisation (paper D-006) | 06 |
| [PD-4](decisions/PD-4-analyzer-governed-artifact.md) | Analyzer as a governed artifact (paper D-004) | 07 |
| [PD-5](decisions/PD-5-gisr-and-access.md) | gISR and access (paper D-007) | 05, 09, 10 |
| [PD-6](decisions/PD-6-mvp-status-and-paper.md) | MVP status and the paper (paper D-011, D-012) | all |
| [PD-7](decisions/PD-7-terminology.md) | Terminology (paper D-008) | 14 |
| [PD-8](decisions/PD-8-resources-option-level.md) | Resources and money option-level; E = education + experience with age floor | 02, 04, 06, 07, 10 |
| [S0-D1](decisions/S0-D1-manifesto-is-vision.md) | The manifesto is vision only | 00, README |
| [S0-D2](decisions/S0-D2-mvp-html-overview.md) | `docs/mvp.html` is a non-normative overview | 00, 09, 10 |
| [S0-D3](decisions/S0-D3-if-gisr-aauth-correction.md) | Correction of IF l.87 and l.127 | 09 |
| [S0-D4](decisions/S0-D4-mvp-html-exception.md) | `docs/mvp.html` author edits are the only docs/ change in S0 | S0 acceptance |

Source of the PD pages: `tasks/S0-decisions-to-import.md`.

## Tasks

| Task | Status | Changes components |
|---|---|---|
| [S0-restructure-specs](tasks/S0-restructure-specs.md) | open (step 3, batch 1 done) | all; README |
| [A1-canonical-isr](tasks/A1-canonical-isr.md) | DONE: v2 merged (PR 7), deployed, migrated and smoke-tested on live 2026-11-09 | 02, 03, 04, 06, 10 |
| [A2-expertise-cleanup](tasks/A2-expertise-cleanup.md) | implemented on branch `a2-expertise-cleanup`; live migration pending (author) | 02, 04, 07, 10, 11 |
| [A3-options-and-g-anchors](tasks/A3-options-and-g-anchors.md) | implemented on branch `a3-options-and-g-anchors`; live migration pending (author) | 02, 03, 06, 10 |
| [R0-keep-alive](tasks/R0-keep-alive.md) | done 2026-11-08: merged (#2-#4), deployed, A2/A3 migrated, smoke test passed | rules, CI, backup, merge of A2/A3 |
| [U1-smoke-test-fixes](tasks/U1-smoke-test-fixes.md) | done 2026-11-08 (#5, deployed, verified) | 10 (UI) |
| [L1-deadlines-and-management-decisions](tasks/L1-deadlines-and-management-decisions.md) | DONE: merged (PR 9), migrated and deployed on live 2026-11-09; nightly run daily at 00:30 (first run checked 2026-11-10) | 02, 06, 10 |
| [U2-voting-todo-list-limit](tasks/U2-voting-todo-list-limit.md) | DONE: merged (PR 10), deployed and checked on live 2026-11-09 | 10 (UI) |
| [U3-message-sorting](tasks/U3-message-sorting.md) | DONE: merged (PR 11), deployed and checked on live 2026-11-09 | 10 (UI) |
| [U4-voting-view-messages](tasks/U4-voting-view-messages.md) | DONE: merged (PR 12), deployed and checked on live 2026-11-09 | 10 (UI) |
| [A1b-expertise-placeholder](tasks/A1b-expertise-placeholder.md) | DONE: merged (PR 13), applied on live 2026-11-09 (3 publics, 150 members) and checked | 02, 04, 06 |

Roadmap: [ROADMAP-demo](ROADMAP-demo.md): distance to a demonstration stage and the staged plan (2026-11-07).

S0 artefacts: [S0-inventory-report](tasks/S0-inventory-report.md), [S0-structure-proposal](tasks/S0-structure-proposal.md), [S0-decisions-to-import](tasks/S0-decisions-to-import.md).

---

## Contradiction map

The ids come from `tasks/S0-inventory-report.md` §3, where each contradiction is described in full.

- *open*: no decision yet.
- *decided*: a decision page settles the intended design. The code may still differ; see the owning file.
- *resolved*: the contradiction no longer exists.

| Id | Topic | Owner | State |
|---|---|---|---|
| C-01 | Competing "sources of truth" | 00 / README | decided (S0-D1, precedence rules above) |
| C-02 | `mvp-current-spec.md` claims to be as-built | 00 | decided (superseded; banner in S0 step 5) |
| C-03 | `AGENTS.md` location | 01 | resolved (it is `.agents/AGENTS.md`) |
| C-04 | Referenced files missing from the repo | 07 | open |
| C-05 | One companion file vs two; examples not sent | 07 | open (PD-4 makes the library public and versioned) |
| C-06 | Threshold sign: ≥ vs > | 03 | open |
| C-07 | Threshold editable or not | 03 | open |
| C-08 | Top-100 cap, creator always added, seeded membership | 03 | partly decided (PD-1: all affected members take part) |
| C-09 | Joining by special request | 03 | open |
| C-10 | D tiers vs binary gate vs heuristic | 03 | decided (PD-1: D is soft, never a gate) |
| C-11 | Unimplemented employment values; `features` excludes everyone | 03 | partly decided (PD-1: no hard exclusion); A3 adds interests and places to D |
| C-12 | G anchor home vs home-or-work | 03 | decided (docs 2026-11-04: nearest of home, work and property); implemented by A3 for new publics |
| C-13 | G cutoff at μ + 3σ | 03 | open |
| C-14 | μ/σ tables differ | 03 | open |
| C-15 | Meaning of σ ("impact radius") | 03 | open |
| C-16 | Issue vector stored or not; random fallback | 03 / 12 | open |
| C-17 | Profile-vector input template | 12 | open |
| C-18 | Default relevance weights | 03 | open |
| C-19 | Who may edit weights | 07 | decided (PD-8: nobody types a number; the starter only clarifies the context) |
| C-20 | Weight sums not validated | 07 | open |
| C-21 | 40/30/30 fallback vs "default" | 06 | decided (author, docs 2026-11-04: no fallback; `needs_clarification` / `not_consistent`). As built, 190 of 192 seeded publics still use 0.4/0.3/0.3 (A2 CHANGES) |
| C-22 | Weighted vs unweighted expertise | 04 | open |
| C-23 | Expertise baseline 1.0 vs 0 | 04 | decided (PD-8: education floor min(age, 30)/30, no baseline term); implemented by A2 |
| C-24 | CBC table | 04 | open |
| C-25 | CBC adjustment factor | 04 | open |
| C-26 | Cosine clamp in education | 04 | open |
| C-27 | Decay, age penalty, contemporary importance | 04 | partly decided (PD-8: no age penalty, no contemporary importance; recency decay kept, not applied as built) |
| C-28 | Expertise data sources and collections | 04 / 02 | decided (PD-8: education and experience only; resources and money are option-level) |
| C-29 | Expertise unbounded vs normalised to [0,1] | 04 | decided (PD-3: divided by the public mean) |
| C-30 | Contribution formula with or without sentiment | 05 | open |
| C-31 | When Contribution is computed | 05 | open |
| C-32 | Contribution factors and collections | 05 / 02 | open |
| C-33 | Four normalisation statements | 06 | decided (PD-3: divide by the public mean); zero/negative mean open |
| C-34 | What weights a vote | 06 | decided and implemented by A1 v2 (member ISR; live 2026-11-09) |
| C-35 | Vote outcome not computed or persisted | 06 | decided and implemented by A1 v2 (server trigger stores scores, winner, tally, tasks; live 2026-11-09) |
| C-36 | 36 vs 38 conflicts | 08 | open |
| C-37 | VoV dimensionality | 08 | open |
| C-38 | Meaning of the "private" context | 08 | open |
| C-39 | VoV stable vs per-public | 08 | open |
| C-40 | Vectorizer temperature | 08 | open |
| C-41 | IF claim about gISR/AAuth in the docs | 09 | resolved (S0-D3, commit `60a9c1c`) |
| C-42 | PLAN.md vs IF on Analyzer outputs | 11 | open (IF is the audited source) |
| C-43 | IF header describes an uncommitted tree | 11 | resolved (PD-6: audited state is `0620f27`) |
| C-44 | Six-collection matrix vs real collections | 02 / 14 | open |
| C-45 | snake_case rule vs camelCase fields | 02 / 14 | open |
| C-46 | AAuth, logging, encryption described but absent | 09 | partly decided (PD-5 defines gISR and AAuth). R0: rules stay open until 2027-06-30 except `issue_drafts` (server only); real access rules are roadmap stage 5 |
