# 00 Vision and scope
Status: n/a (vision and scope)   Verified against: commit `0620f27` (PD-6)
Owns contradictions: C-01, C-02 (see [README](README.md#contradiction-map))

## Purpose
Says what ISR is meant to be, what the MVP is, and what it is not. Also records which parts of `ISR_PROJECT_MANIFESTO.md` are superseded by which spec file (S0-D1).

## Intended design
- **Vision:** `ISR_PROJECT_MANIFESTO.md` §1 (l.25-39) and the definitions in §2 (l.43-114), read as vision only ([S0-D1](decisions/S0-D1-manifesto-is-vision.md)). ISR (Index of Social Responsibility) supports issue-specific, weighted participation. For each issue, an **ad-hoc public** forms from the users affected by it; each member gets a per-issue weight from Relevance, Expertise and Contribution; the public discusses, votes and implements; then it dissolves.
- **Scope and legal space** ([PD-1](decisions/PD-1-scope-inclusion-soft-d.md)):
  - ISR works within applicable law and in the space law leaves open. An issue fully resolved by law is not an ISR case.
  - The Analyzer returns `legal_coverage` (none, partial, full, unknown) as advisory triage.
  - All affected members take part, and materially affected members are never hard-excluded.
- **Status of the work** ([PD-6](decisions/PD-6-mvp-status-and-paper.md)):
  - The paper is a design proposal with a partial prototype on synthetic data. No pilot or validation is claimed.
  - The MVP is not brought up to the specification before submission.
- **Terminology** ([PD-7](decisions/PD-7-terminology.md)):
  - *ad-hoc public*: the group formed for one issue;
  - *organisation* or *deployment*: the NGO, co-op or DAO that uses ISR;
  - *users*: all registered users.

  Full conventions: 14-conventions.md (S0 batch 2).
- **Public overview:** `docs/mvp.html` is a public-facing description of the concept. It is not normative ([S0-D2](decisions/S0-D2-mvp-html-overview.md)). Its AAuth, gISR and encryption features are NOT IMPLEMENTED.

## As built
| Statement | Status | Evidence |
|---|---|---|
| The MVP consists of a single-page JS front end (`prototype/`), Firebase Cloud Functions (`functions/`), Firestore, and offline Python seeding and evaluation scripts (repo root, `scratch/`, `vectorizer/`). | VERIFIED | IF §0 table (l.13-18), IF "LLM / embedding API call sites" (l.169-177) |
| The live data was produced mainly by seeding scripts, not by the app pipeline. Only 2 of 192 publics (50 members) were created through the app. | VERIFIED (data) | IF l.11, l.15-16 |
| All population data is synthetic: users, actions (random), discussions (seeded). | VERIFIED (data) | IF l.88; `claude_export/MANIFEST.md` l.38-42, l.60 |
| The deployed Cloud Function is older than the working-tree code; which version is deployed is unknown. | VERIFIED (data) / UNSURE (version) | IF l.20 |
| `legal_coverage` triage (PD-1) is not implemented: the term does not occur in the code. | VERIFIED (grep over `.js`, `.py` and `.html`, excluding node_modules, 2026-10-12) | n/a |
| Contribution, gISR, AAuth, LLM decision logging and server-side validation are missing. | VERIFIED | IF l.154-160 |

## Manifesto sections and what supersedes them
`ISR_PROJECT_MANIFESTO.md` stays unedited. Its rules no longer bind; this table says where each topic is now specified.

| Manifesto section (lines) | Topic | Superseded by |
|---|---|---|
| §1 (l.25-39) | What the project is | Kept as vision; this file |
| §2.1 (l.47-55) | Ad-hoc public | PD-7; 14-conventions |
| §2.2 (l.57-64) | Issue, lifecycle, storage | 14-conventions (term); [02 data model](02-data-model.md) (storage); 10-ui-flows (lifecycle) |
| §2.3 (l.66-72) | ISR score | [06 aggregation and voting](06-aggregation-and-voting.md); PD-3 |
| §2.4 (l.74-81) | Relevance | [03 relevance](03-relevance.md) |
| §2.5 (l.83-89) | Expertise | 04-expertise |
| §2.6 (l.91-97) | Contribution | 05-contribution |
| §2.7-2.8 (l.99-114) | Vector of Values, Action Vector | 08-values-subsystem; 05-contribution |
| §2.9 (l.116-132) | Sections (UI navigation) | 10-ui-flows |
| §3.1-3.3 (l.138-159) | Database, collections, field naming | [02 data model](02-data-model.md); 14-conventions |
| §3.4-3.5 (l.161-175) | User identity, cached collections | 09-identity-access-security; 10-ui-flows |
| §4 (l.179-205) | ISR score system, voting weight, weights, threshold | [06](06-aggregation-and-voting.md); [03](03-relevance.md); 07-analyzer |
| §5 (l.208-281) | UI/UX constraints | 14-conventions; 10-ui-flows |
| §6 (l.285-359) | Code patterns, file structure, localStorage | 14-conventions; 01-architecture |
| §7 (l.363-415) | Forbidden patterns, terminology | 14-conventions; PD-7 |
| §8 (l.419-440) | Document map | [README](README.md) |

## Gaps
- **C-01** Several files claimed to be the source of truth (manifesto l.8, `specs-index.md` l.10, `AGENTS.md` l.6). *Decided:* the precedence rules in [README](README.md#precedence-rules) and S0-D1. The entry files are repointed in S0 step 5.
- **C-02** `.antigravity/specs/mvp-current-spec.md` calls itself the spec of the MVP "as it currently exists" (l.3), but its formula, threshold and ISR display contradict the code (inventory report §2.3). *Decided:* it is superseded, and it gets a banner in S0 step 5.
- PD-1 `legal_coverage`: intended, not implemented.
- PD-6: the MVP intentionally stays behind the specification. Gaps listed in the component files are expected, not defects to fix before submission.

## Interfaces
None. This file only links to the others.

## Tests
None. There is no automated test suite in the repository (`package.json` "test" is a placeholder, l.9). The `scratch/test_*.py` files are ad-hoc scripts.

## Open questions
1. Does PD-1 ("never hard-excluded") also cover the hard geographic cutoff at μ + 3σ? See [PD-1](decisions/PD-1-scope-inclusion-soft-d.md), "Possibly also affected".

## Change history
- S0 (2026-10-12): created.
