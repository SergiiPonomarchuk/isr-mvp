# S0 Step 2: Structure proposal

Spec: `specs/tasks/S0-restructure-specs.md`, step 2. Date: 2026-10-12. Branch: `docs/specs-restructure`.
Input: `specs/tasks/S0-inventory-report.md` (step 1, approved), plus the author's decisions of 2026-10-12, recorded in section 1.
This proposal is the only file written in this step. Nothing is built until you approve it.

---

## 1. Decisions already made (author, 2026-10-12)

| Id | Decision | Effect on S0 |
|---|---|---|
| S0-D1 | `ISR_PROJECT_MANIFESTO.md` is **Vision only**. | Step 3 moves its rules and formulas into the component specs. The file stays unedited; `00-vision-and-scope.md` links to it and states which parts are superseded. |
| S0-D2 | `docs/mvp.html` is a **public-facing design overview, not normative**. | It is linked as context, never as the intended design. AAuth, gISR and encryption are flagged NOT IMPLEMENTED. |
| S0-D3 | IF lines 87 and 127 have been corrected (commit `60a9c1c`). | Contradiction C-41 is resolved. |
| S0-D4 | Commit `fa44f7b` (author's edits to `docs/mvp.html`) is the **only** exception to "docs/ untouched". | The acceptance check excludes it. |

I propose recording these four as pages in `specs/decisions/` during step 3 (see section 2).

---

## 2. Target layout (S0 section 4, with my recommended changes)

```
specs/
  README.md                         index, status legend, rules, contradiction map
  00-vision-and-scope.md
  01-architecture.md
  02-data-model.md
  03-relevance.md
  04-expertise.md
  05-contribution.md
  06-aggregation-and-voting.md
  07-analyzer.md
  08-values-subsystem.md
  09-identity-access-security.md
  10-ui-flows.md
  11-synthetic-data-and-seeding.md
  12-embeddings.md
  13-deployment-and-ops.md
  14-conventions.md                 NEW (recommended, see R1)
  decisions/
    S0-D1-manifesto-is-vision.md
    S0-D2-mvp-html-overview.md
    S0-D3-if-gisr-aauth-correction.md
    S0-D4-mvp-html-exception.md
  tasks/
    A1-canonical-isr.md             (exists, open)
    S0-restructure-specs.md         (exists, open)
    S0-inventory-report.md          (S0 artefact)
    S0-structure-proposal.md        (S0 artefact, this file)
    X0-export-and-audit.md          NEW stub (recommended, see R5)
```

### Recommended changes to the S0 layout

- **R1. Add `14-conventions.md`.** The manifesto, `project-map.md`, the two skills `create_isr_modal` and `query_isr_firestore`, and `docs/MVP-Development-Documentation.md` hold rules that belong to no component: terminology (manifesto §2, §7.6), naming, Firebase v8 compat only, no frameworks, the readyState pattern, event delegation, UI tokens and modal/button classes, localStorage keys, and forbidden patterns. Without a home they would end up duplicated across 01, 02 and 10. Some of these rules are wrong as built; for example, "snake_case only" fails on `displayName` and `birthDate` (C-45). The file records those rules with the same intended / as-built / gaps sections as the components.
- **R2. Add a "Variants" subsection to "As built"** wherever several implementations exist. Relevance alone has four paths, A–D (IF §0), and the ISR value used for voting differs from the member ISR (IF l.101). One flat "as built" section would blur exactly the differences the paper needs.
- **R3. Put a contradiction map in `README.md`**: a table listing C-01 to C-46 with the component file that now owns each one, and its state (open / resolved / decided). The inventory report stays as the frozen original.
- **R4. Pin evidence to a commit.** Every as-built statement cites `file:line` plus VERIFIED or UNSURE. Every component file's header says "verified against commit `0620f27`", because IF's line numbers refer to that tree and no code has changed since. When code changes later, a task updates the header and the evidence.
- **R5. Add `tasks/X0-export-and-audit.md`**, a short stub giving status and links only. It turns `claude_export/PLAN.md` into a tracked task: status *done* for steps 1–5 and 8, *not done* for steps 6–7 (MANIFEST l.84). `claude_export/` stays where it is, because CLAUDE.md and A1 reference it there.
- **R6. Decision pages**: only S0-D1 to S0-D4 for now. A1 cites D-006 and D-011 from the paper's register (A1 l.46), but their texts are not in the repo. I will not invent them (see Q3).

---

## 3. Component file template

Each component file has a header followed by the eight template sections from S0 §5:

```
# NN Component name
Status: <overall: IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | UNSURE>   Verified against: commit 0620f27
Owners of contradictions: C-xx, C-yy (see README)

## Purpose
## Intended design        links to docs/ sections (normative); manifesto only as vision context
## As built               statements with file:line, VERIFIED/UNSURE, source (IF l.x)
### Variants              (only where several implementations exist)
## Gaps                   intended vs as built, one line each, with C-xx ids
## Interfaces             inputs/outputs, Firestore fields read/written, other components
## Tests                  existing tests (currently none known) and what would verify the statements
## Open questions
## Change history         task ids (S0, A1, ...)
```

Rules for writing them:
- Copy as-built text from IF **with** its evidence and label. Do not paraphrase numbers.
- If IF does not cover something, write UNSURE. Do not fill gaps from the docs.
- Where a doc says something different, record it under Gaps. Never "correct" the as-built side.

---

## 4. Component files: sources, owned contradictions, expected status

"Status" is a first estimate for the file as a whole; individual statements carry their own labels.

| File | Intended design (links) | As-built sources | Owns | Expected status |
|---|---|---|---|---|
| 00 vision & scope | Manifesto §1–2 (vision); `docs/mvp.html` (overview, S0-D2) | none | C-01 | n/a |
| 01 architecture | Relevance doc "Processing Pipeline", §6.3, Part 9; Analyzer §6 | IF §0 (paths A–D, deployed function older than the code), `firestore.rules` via IF l.129 | C-02, C-03 | PARTIAL |
| 02 data model | Relevance doc Part 7; Expertise doc Part 4; Contribution doc Part V; Analyzer §5–6.1 | `claude_export/SCHEMA.md`, `MANIFEST.md` (conventions), IF (fields per component) | C-44, C-45 (with 14), C-28 (collections), C-32 (collections) | PARTIAL |
| 03 relevance | Relevance doc Parts 1–6 and 8; Analyzer §2; Request Guide steps 3–4 | IF §(a), EMBEDDINGS ("How the vectors are used") | C-06, C-07, C-08, C-09, C-10 to C-18 | PARTIAL |
| 04 expertise | Expertise doc Parts 1–3, 5, 7–8; Analyzer §3 | IF §(b) | C-22 to C-29 | PARTIAL (offline script only) |
| 05 contribution | Contribution doc Parts I, IV, V, VIII | IF §(c) | C-30, C-31, C-32 | NOT IMPLEMENTED |
| 06 aggregation & voting | Analyzer §4, §6.3; Weight Instructions §3, §6.1; manifesto §4 (vision) | IF §(d), cached maps (IF l.59) | C-21, C-33, C-34, C-35 | PARTIAL |
| 07 analyzer | Analyzer protocol (all); 100-Examples; Weight Instructions | IF §(e), IF "LLM/embedding call sites", IF data question 6 | C-04, C-05, C-19, C-20 | PARTIAL |
| 08 values subsystem | Values Taxonomy; Values Vectorization protocol; User Guide | IF data question 4, IF call-sites row `vectorizer/pipeline.py` | C-36 to C-40 | PARTIAL |
| 09 identity, access, security | `docs/mvp.html` Privacy & Security (overview only; **AAuth, gISR, encryption: NOT IMPLEMENTED**) | IF §(f), IF data question 5 | C-46 | NOT IMPLEMENTED (AAuth, gISR); login by display name, open rules |
| 10 UI flows | `docs/mvp.html` (overview); `docs/MVP-Development-Documentation.md`; mvp-current-spec "Section Views" (as a **claim**, not evidence) | IF only scattered (e.g. vote tally, Force display, the chat list ISR) | parts of C-34 (displayed ISR) | UNSURE (no UI audit exists) |
| 11 synthetic data & seeding | none (no design doc) | IF §(g), IF §(a) path B, MANIFEST (provenance, duplicated messages), `private/` mapping noted without contents | C-42, C-43 | PARTIAL (some writer scripts missing, IF l.163-165) |
| 12 embeddings | Relevance doc Part 8; Expertise doc §5.1 | `claude_export/EMBEDDINGS.md` | C-16, C-17 (shared with 03) | PARTIAL (generator not in repo) |
| 13 deployment & ops | none beyond the guardrails in CLAUDE.md | IF l.20 (deployed version UNSURE), IF l.118 (no logging), IF l.119 (API key UNSURE) | none | UNSURE |
| 14 conventions (R1) | Manifesto §2.9, §3.3–3.5, §5–7 (vision); project-map; `docs/MVP-Development-Documentation.md` | IF l.128 (uid default), grep evidence for collections and fields | C-44, C-45 | PARTIAL |

**Encryption note (S0-D2):** the repository contains no application-level encryption (UNSURE whether anything relevant exists; to be confirmed by grep in step 3). Whatever encryption Firebase applies by default is a platform property and is not evidence for the design's claim. 09 will record "encryption: NOT IMPLEMENTED by the app; platform defaults UNSURE".

---

## 5. Mapping from existing files to the new structure

Actions in steps 3–5 follow S0's rules: no deletions; move or mark only, and only after your approval. docs/ and the manifesto are never edited.

| Existing file | Content goes to | What happens to the file | Step |
|---|---|---|---|
| `ISR_PROJECT_MANIFESTO.md` | Vision → 00. Definitions and terminology → 14. Formulas → 03–06 (Intended design: "vision states X"; normative design from docs/). Collections → 02. UI and code rules → 14 and 10. | **Unedited** (S0-D1). 00 lists which manifesto sections are superseded and by which spec. | 3 |
| `.antigravity/specs/mvp-current-spec.md` | Definitions → 14; formula and threshold → 06 and 03 (as claims contradicted by the code); navigation and Chat list UI → 10 | Mark as superseded: a 2-line banner at the top pointing to `specs/README.md` (**needs approval, Q1**) | 5 |
| `.antigravity/specs/specs-index.md` | Replaced by `specs/README.md` | Point to `specs/README.md` (S0 step 5). I propose replacing the body with a short pointer and keeping the old list below it under "historical" (Q1). | 5 |
| `.antigravity/project-map.md` | File map → 01; forbidden patterns, UI reuse, localStorage keys → 14; collections → 02 | Mark as superseded, as above (Q1) | 5 |
| `.agents/AGENTS.md` | Workflow → README rules | Change "Mandatory Reading" to `specs/README.md` (S0 step 5) | 5 |
| `.agents/skills/calculate_relevance/SKILL.md` | Formulas are already in 03–06 | **Carries its own formulas** (listed for S0 step 5). Replace them with references to 03–06 (Q2). | 5 |
| `.agents/skills/query_isr_firestore/SKILL.md` | Collection matrix and naming → 02 and 14 | **Carries data-model rules that are wrong as built** (C-44, C-45). Replace them with references (Q2). | 5 |
| `.agents/skills/create_isr_modal/SKILL.md` | UI rules → 14 | No formulas. Optionally reference 14 instead of repeating the rules (Q2). | 5 |
| `CLAUDE.md` | n/a | Already points to `specs/README.md`. Step 5 checks the wording; IF stays listed as the as-built source. | 5 |
| `docs/*.md` (normative) | Linked from the "Intended design" sections of 03–08, 10, 12, 14 | Untouched | n/a |
| `docs/mvp.html` | Linked from 00, 09, 10 as an overview (S0-D2) | Untouched (apart from `fa44f7b`, S0-D4) | n/a |
| `claude_export/IMPLEMENTATION_FACTS.md` | Seeds "As built" in 01, 03–09, 11, 13, 14 | Stays, as the evidence source | 3 |
| `claude_export/EMBEDDINGS.md` | Seeds 12, and S in 03 | Stays | 3 |
| `claude_export/SCHEMA.md`, `MANIFEST.md` | Seed 02 and 11 | Stay | 3 |
| `claude_export/PLAN.md` | `tasks/X0-export-and-audit.md` stub (R5) | Stays; the stub links to it | 4 |
| `specs/tasks/A1-canonical-isr.md` | Links to 03, 04, 05, 06 | Add a status line (open) and "changes components: 03, 04, 06" (Q4) | 4 |
| `specs/tasks/S0-*.md` | Part of the S0 change history in README | Stay; S0's Status log is filled in at the end | 4–5 |

---

## 6. Rules for `specs/README.md`

1. **Precedence.**
   - For *intended design*, `docs/` is normative. Where docs contradict each other, the conflict is recorded as a Gap, and neither side is picked without an author decision.
   - For *as built*, the code is the truth and IF / EMBEDDINGS / SCHEMA are the audited evidence.
   - The manifesto is vision (S0-D1). `docs/mvp.html` is an overview (S0-D2).
2. **Status legend:** IMPLEMENTED, PARTIAL, NOT IMPLEMENTED, UNSURE. Evidence labels: VERIFIED and UNSURE, as in IF.
3. **No duplication:** formulas and parameters live in exactly one component file. Skills and agent files link to them and do not copy them.
4. **Tasks:** every task spec lives in `specs/tasks/` and names the component files it changes. When a task is done, its outcome is merged into those files and the task gets "merged into" links.
5. **Decisions:** one short page per decision in `specs/decisions/`. Component files cite decision ids.
6. **Contradictions:** the map lists C-01 to C-46 with their owner file and state.

---

## 7. What steps 3–5 will touch (for your approval now)

- **Step 3 creates:** README, 00–14, `decisions/S0-D1…D4`. Commits come in small steps, roughly one per 2–3 component files.
- **Step 4 creates:** the `tasks/X0-export-and-audit.md` stub. It edits `tasks/A1-canonical-isr.md` (status and links only) and adds "merged into" fields where relevant.
- **Step 5 edits:** `.antigravity/specs/specs-index.md`, `.agents/AGENTS.md`, `CLAUDE.md`, and (depending on Q1 and Q2) banners on `project-map.md` and `mvp-current-spec.md` plus reference-only skills.
- **Never touched:** `docs/`, `ISR_PROJECT_MANIFESTO.md`, code, `claude_export/` (beyond the approved `60a9c1c`), `private/`.

---

## 8. Known side effect

`claude_export/MANIFEST.md` l.11 records the SHA-256 of `IMPLEMENTATION_FACTS.md`, and that hash no longer matches after `60a9c1c`. I have not changed MANIFEST.md, because it was outside the approved edit. The options are to leave it and note it in 02 / 11, or to update the hash in another small commit (Q5).

---

## 9. Open questions

1. **Marking superseded files (step 5).** May I add a short "Superseded by specs/README.md" banner at the top of `.antigravity/project-map.md` and `.antigravity/specs/mvp-current-spec.md`, and reduce `specs-index.md` to a pointer with its old list kept below? The alternative is to leave all three unchanged and only point to them from README.
2. **Skills (step 5).** Should I replace the formulas in `calculate_relevance` and the collection and naming rules in `query_isr_firestore` with references to the specs (as S0 step 5 implies), or only list them in README as "must be fixed" and leave them unchanged?
3. **D-006 and D-011** (cited by A1): do you want decision pages for them? If so, I need their texts from you.
4. **A1**: in step 4, may I add a status line and component links to A1? Its body would stay as it is.
5. **MANIFEST.md hash**: leave it stale (and note it), or update it in a separate small commit?
6. **R1 (`14-conventions.md`)**: accept it, or fold those rules into 01, 02 and 10?
