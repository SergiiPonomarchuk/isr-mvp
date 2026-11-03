# S0 Step 1: Inventory report

Spec: `specs/tasks/S0-restructure-specs.md`, step 1 (report only). Date: 2026-10-12.
Branch: `docs/specs-restructure`, created from `wip/before-s0` (commit `0620f27`); the working tree was clean beforehand.
This report is the only file written in this step. Nothing else was changed.

## How to read this report

- **IF** means `claude_export/IMPLEMENTATION_FACTS.md`. A citation such as "IF l.39" points to a line in that file, which in turn cites the code.
- **(re-checked)** means I confirmed the claim myself in this session, using grep or a file read. All other statements about the code come from IF; I did not re-verify them.
- IF's line numbers refer to the working tree on 2026-10-12. That tree was committed unchanged as `0620f27`, so the numbers should still be valid.
- **UNSURE** marks anything I could not verify.
- Classes, as defined by the spec: **Vision** | **Design (normative)** | **As-built** | **Task** | **Agent instruction**. Where a file mixes classes, the primary class comes first.

---

## 1. Inventory

The spec lists `AGENTS.md` at the repository root. That file does not exist; the real file is `.agents/AGENTS.md` (re-checked). I have also included `CLAUDE.md` and `specs/tasks/*`, because they are spec-like.

| # | File | Size | Class | Role (one line) | Formulas / thresholds / parameters? | Agrees with IF? |
|---|---|---:|---|---|---|---|
| 1 | `ISR_PROJECT_MANIFESTO.md` | 21 KB | Vision; Agent instruction | Claims to be the "ground truth" (l.8). It covers definitions, the ISR formula, collections, UI tokens and forbidden patterns. | Yes: ISR, R, E and C formulas, the 0.15 threshold, weight rules, the six collections, CSS tokens | **No** for the formulas and the data model (see section 2.1) |
| 2 | `.agents/AGENTS.md` | 2 KB | Agent instruction | Workflow rules: read project-map and mvp-current-spec first, ask before widening scope, finish with `/browser`. Firebase v8 only, no frameworks. | No | n/a |
| 3 | `.agents/skills/calculate_relevance/SKILL.md` | 2 KB | Agent instruction | Tells agents to "use these exact formulas" for ISR, R, E and C. | **Yes**: a full copy of the formulas and the threshold | **No** (see section 2.2) |
| 4 | `.agents/skills/create_isr_modal/SKILL.md` | 2 KB | Agent instruction | UI rules for modals, buttons, inputs and fonts. | UI parameters only (CSS values) | Not covered by IF (UNSURE). Duplicates project-map and MVP-Development-Documentation. |
| 5 | `.agents/skills/query_isr_firestore/SKILL.md` | 2 KB | Agent instruction | Firestore rules: v8 API, "six canonical collections", snake_case, cache-only reads. | Data-model rules (collections, naming) | **No** (see section 2.2) |
| 6 | `.antigravity/project-map.md` | 7 KB | Agent instruction | File map, forbidden patterns, UI class reuse, collections, localStorage keys. | Threshold 0.15 (l.40), six collections (l.81-89), snake_case (l.78) | **No** for collections and naming |
| 7 | `.antigravity/specs/mvp-current-spec.md` | 6 KB | Claims As-built (l.3: "as it currently exists"); in practice a Design restatement plus a UI as-built description | Definitions, ISR formula, threshold, SPA navigation, Chat list UI. | Yes: ISR formula (l.22-28), threshold ≥ 0.15 (l.32), "important" ≥ 0.60 (l.65), ISR display (l.87) | **No** for the formula, threshold and ISR display; UI part not checked (UNSURE) |
| 8 | `.antigravity/specs/specs-index.md` | 7 KB | Agent instruction (index) | The current index of docs and specs; calls the manifesto authoritative (l.10). | Summaries mention threshold 0.15 and weight sums | Indirectly no; it also omits `claude_export/` and `specs/` |
| 9 | `CLAUDE.md` | 1.5 KB | Agent instruction | Spec-first workflow and guardrails; points to `specs/README.md`, which does not exist yet. | No | n/a |
| 10 | `docs/ISR-Relevance-Implementation.md` | 28 KB | Design (normative) | The relevance engine: D, G, S, X, pipeline, pruning, schema, vectorisation. | Yes, many (see section 3) | Partly. Path A of the code follows its pipeline closely; there are differences in D, the threshold sign, the issue vector and defaults. |
| 11 | `docs/ISR-Expertise-Assessment-v1.md` | 36 KB | Design (normative) | Expertise: baseline, CBC, decay, resources, schema, worked examples. | Yes, many | **No** on baseline, decay, CBC table, data sources and collections |
| 12 | `docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md` | 40 KB | Design (normative) | Action vectors, Force, sentiment, Contribution, storage, batch protocol. | Yes, many | **No**: Contribution is not implemented (IF l.86) |
| 13 | `docs/ISR-Issue-Analyzer-Protocol-v1.md` | 32 KB | Design (normative) | Analyzer inputs and outputs, taxonomy, weight anchors, μ/σ ranges, JSON schema. | Yes, many | **No**: examples not used, outputs not validated, the normalisation differs |
| 14 | `docs/ISR-Issue-Analyzer-100-Examples.md` | 387 KB | Design (normative reference data) | 100 anchor issues with full parameter sets. | Yes: 100 parameter sets | **No**: never sent to the model; 0/80 stored issues match one example (IF l.114, l.205) |
| 15 | `docs/ISR-AI-Weight-Evaluation-Instructions.md` | 16 KB | Design (normative) | How the AI sets the relevance and aggregation weights; the 40/30/30 fallback rule. | Yes: sum = 1 ± 0.001, 40/30/30 fallback | **No**: no sum check in code (IF l.116) |
| 16 | `docs/ISR-Issue-Request-Guide.md` | 13 KB | Design (normative, user-facing) | User guide for submitting an issue: σ, weight sliders, validation, FAQ. | Yes: σ ranges, threshold > 0.15, validation limits | **No**: the validation is not implemented (IF l.117, l.159) |
| 17 | `docs/ISR-Values-Taxonomy-v1.md` | 31 KB | Design (normative) | The values vector taxonomy: 10 domains, 145 items, 36 CR, 40 CS, 20 meta. | Yes: dimensions and ranges | Not covered by IF (UNSURE) |
| 18 | `docs/ISR_Values_Vectorization_Protocol_v1.md` | 11 KB | Design (normative) | Two-step LLM vectorisation of a values narrative. | Yes: grounding < 25 gives null, temperature 0.2, CR = 50 on null | Partly. IF l.174: the code uses temperature 0.2 (step 1) / 0.3 (step 2). |
| 19 | `docs/User_Guide_Values_Description_v1.md` | 12 KB | Design (normative, user-facing) | Guide for writing a values narrative. | No | n/a |
| 20 | `docs/MVP-Development-Documentation.md` | 4 KB | Agent instruction (UI) | UI reuse rules and how to create a modal. | UI parameters only | Not covered by IF |
| 21 | `docs/mvp.html` | 54 KB | Vision; Design overview | Overview page of the MVP concept: pipeline, AAuth, gISR. | Yes: R > threshold, normalisation to mean 1.0, "Row ISR" formula | Partly: mean normalisation matches IF l.99; AAuth and gISR are not implemented |
| 22 | `claude_export/IMPLEMENTATION_FACTS.md` | 23 KB | As-built | Code and data audit with VERIFIED/UNSURE labels. | Records the as-built parameters | (reference) **Contains one false claim** (see C-41) |
| 23 | `claude_export/EMBEDDINGS.md` | 5 KB | As-built | Facts about the stored embeddings. | Dimensions, norms, model (UNSURE) | Consistent with IF |
| 24 | `claude_export/SCHEMA.md` | 551 KB | As-built (earlier session) | Firestore schema inventory. | Field lists | Consistent on collections; not re-checked in detail |
| 25 | `claude_export/MANIFEST.md` | 11 KB | As-built (export metadata) | List of export files, hashes, provenance, validation. | No | n/a |
| 26 | `claude_export/PLAN.md` | 6 KB | Task (earlier, partly executed) | Plan for the export and audit. Steps 6-7 were not executed (MANIFEST l.84). | Inventory claims | **No** on one point (see C-42) |
| 27 | `specs/tasks/A1-canonical-isr.md` | 5 KB | Task (DRAFT, open) | A canonical ISR module plus a wire-up. | Yes: requirements R1-R9 | Its context matches IF. R3 and R6 change behaviour on purpose (see section 2.3). |
| 28 | `specs/tasks/S0-restructure-specs.md` | 4 KB | Task (this task) | Restructure the specs. | No | n/a |

Not inventoried: `.antigravity/specs/*` contains only #7 and #8. The data files in `claude_export/` (jsonl, npy, ids json) are data, not specs.

---

## 2. Skills and specs: formulas and parameters compared with IF

### 2.1 `ISR_PROJECT_MANIFESTO.md`

| Statement (line) | As built (IF) | Verdict |
|---|---|---|
| ISR = w_R·R + w_E·E + w_C·C (l.70, 184-187) | R and E are each divided by the public's mean; C is the constant 1.0; there is no final normalisation (IF l.99, l.86) | PARTIAL (the formula's shape matches; its inputs do not) |
| Weights sum to 1, each in [0,1] (l.189) | No validation exists; issue `15` sums to 0.70 (IF l.116, l.204) | DISAGREES |
| Weights set by the Analyzer (l.71, 197) | Stored weights come from keyword rules (IF l.100); the submitter can edit every weight (IF l.117) | DISAGREES |
| Voting weight = ISR (l.193) | The tally uses `discussions.isr_scores` = 1.5 × floored relevance, which matches the member ISR for 19 of 3,099 members (IF l.101-102) | DISAGREES |
| Relevance in 0–1 (l.76) | Path A does not clamp and the weights are unvalidated, so R can exceed 1; path B clamps (IF l.30, l.51) | PARTIAL; whether any stored R exceeds 1 is UNSURE |
| Expertise = w_Edu·Edu + w_Exp·Exp + w_Res·Res (l.88) | Unweighted sum; the issue's expertise weights are ignored (IF l.73) | DISAGREES |
| Contribution = Force × cos(Action, VoV) (l.97) | Not implemented; C = 0 and C_norm = 1 (IF l.86) | DISAGREES |
| VoV is 145-dimensional, 0–100 (l.101) | Stored `values_taxonomy` has domains, items, conflicts and shifts (IF l.195) | UNSURE (the taxonomy itself defines more than 145 dimensions; see C-37) |
| Threshold: R ≥ 0.15 joins automatically (l.204) | Code uses R > 0.15, a top-100 cap, and always adds the creator (IF l.39); seeded publics were not selected by relevance (IF l.52) | DISAGREES |
| Threshold can be changed at issue creation (l.205) | No input for it exists; 0.15 is a literal in code (re-checked: `functions/index.js:253, 321, 537`; `main.js:6345`) | DISAGREES |
| Six collections (l.146-153) | Code uses `issues`, `microcommunities`, `microcommunity_members`, `user_packs`, `user_vectors`, `discussions/messages`; `voting`, `tasks` and `values` are empty (re-checked by grep; SCHEMA l.23-25) | DISAGREES |
| snake_case fields only (l.157) | The data uses `displayName`, `socialRelations`, `birthDate`, `employmentStatus` (IF l.31, l.40, l.128) | DISAGREES |
| Guests have no `userId` (l.165) | The uid defaults to `"1"` when absent (IF l.128) | DISAGREES |

### 2.2 Skills (`.agents/skills/*`)

**`calculate_relevance`** carries its own formulas. Step 5 of S0 says skills must not do this.
- l.13, 15, 16 (ISR formula, weights sum to 1, set by the Analyzer): same verdicts as the manifesto rows above (PARTIAL / DISAGREES / DISAGREES).
- l.21 (R formula): agrees with path A (IF l.30); path B clamps (IF l.51).
- l.27 (≥ 0.15, added automatically): DISAGREES (IF l.39, l.52).
- l.32 (weighted expertise): DISAGREES (IF l.73).
- l.39 (Contribution = Force × cos): DISAGREES with the code (not implemented) **and** with the design doc, which also includes the sentiment term (see C-30).
- l.37-38 (Action vector −100..100; VoV 145 × 0–100): match the design docs; the as-built state is UNSURE.

**`query_isr_firestore`** carries data-model rules.
- l.15-24 (six collections only): DISAGREES with the code and data (see 2.1). An agent that followed this rule could not touch `issues` or `microcommunity_members`.
- l.27-28 (snake_case): DISAGREES with the data.
- l.31-33 (cache-only reads): not checked (UNSURE).

**`create_isr_modal`**: only CSS and UI rules, with no scoring parameters. It duplicates `.antigravity/project-map.md` l.63-73 and `docs/MVP-Development-Documentation.md`. Agreement with the code was not checked (UNSURE).

### 2.3 Other specs

- **`.antigravity/specs/mvp-current-spec.md`**: l.22-28 and l.32 have the same verdicts as the manifesto. l.87 says the chat list shows the member's "calculated ISR composite indicator". The code shows `discussions.isr_scores`, which is 1.5 × floored relevance (IF l.101), with a fallback of `relevance_score × 1.5` (re-checked: `prototype/js/main.js:4101, 4108, 4381, 4388`). DISAGREES. The "Relevance: 85%" it describes is the *floored* relevance (floors 0.85 and 0.20; IF l.59).
- **`.antigravity/project-map.md`**: l.40 (do not expose the 0.15 threshold), l.78 (snake_case), l.81-89 (collections). Verdicts as above.
- **`specs/tasks/A1-canonical-isr.md`**: its context section (l.8) matches IF. Two requirements intentionally differ from as-built:
  - **R3:** when all values are equal (including all zero), it returns 1.0. As built, a zero mean gives 0 (IF l.77, l.91).
  - **R6:** voters without an ISR are excluded. As built, the code falls back to the member ISR or 1.5 × relevance (IF l.102).

  Both are within A1's stated scope. I list them only so that step 3 does not record them as as-built.

---

## 3. Contradictions between files

Each item gives the files and lines, and what the code does (as built). Items marked *internal* are contradictions inside one file.

### A. Authority and entry points

- **C-01** Several files claim to be the source of truth. The manifesto says it wins over everything (l.8), and specs-index agrees (l.10). AGENTS.md says to read `project-map.md` and `mvp-current-spec.md` first (l.6). CLAUDE.md says `specs/README.md` is the index, IF is the as-built truth, and docs/ is the intended design. `specs/README.md` does not exist.
- **C-02** `mvp-current-spec.md` calls itself the spec of the MVP "as it currently exists" (l.3), but its formula, threshold and ISR display contradict the code (see 2.3).
- **C-03** S0 names `AGENTS.md` at the root; the only copy is `.agents/AGENTS.md`.

### B. Missing referenced files

- **C-04** Several docs cite files that do not exist anywhere in the repo (re-checked):
  - `ISR-Relevance-Weight-Examples-100.md` and `ISR-Issue-Aggregation-Weight-Examples-100.md`: Relevance doc l.217 and l.227; Weight Instructions l.17-19; `mvp.html` l.696; 100-Examples l.3-8.
  - `ISR-Relevance-Geo-Components-100-Examples.md` and `ISR-Expertise-Components-100-Examples.md`: 100-Examples l.3-8.
  - `ISR-Values-Taxonomy-general-v1.md` and `ISR-Values-Taxonomy-items-v1.md`: Values Vectorization l.24, 126, 142, 248-288.
- **C-05** The Analyzer protocol says the 100-Examples file is the "only external companion document" (l.8, l.699). The Weight Instructions doc (l.17-19) and the Relevance doc (l.217) instead require the two separate missing files. As built, the prompt names the 100-Examples file but never sends its content (IF l.114).

### C. Threshold and membership

- **C-06** The sign of the threshold differs. "≥ 0.15" appears in the manifesto (l.204), mvp-current-spec (l.32) and the calculate_relevance skill (l.27). "> 0.15" appears in the Relevance doc (l.519, l.542), the Request Guide (l.365) and `mvp.html` (l.701). The code uses `> 0.15` (re-checked: `functions/index.js:321`).
- **C-07** Whether the threshold can be changed:
  - The manifesto says it can be changed at issue creation (l.205), and so does mvp-current-spec (l.32).
  - The manifesto also says the 0.15 threshold must not be exposed (l.385), and so does project-map (l.40). This is an *internal* contradiction in the manifesto.
  - As built, it cannot be changed (re-checked).
- **C-08** The docs say every user with R above the threshold is added. As built, the public is capped at the top 100 and the creator is always added (IF l.39). The 190 seeded publics are simply the discussion participants, and one of them has R = 0.103 (IF l.52).
- **C-09** The Request Guide says users outside the public can join by special request and vote (l.371). Nothing in IF covers this (UNSURE; probably not implemented).

### D. Relevance components

- **C-10** D values:
  - Relevance doc: tiered, 0 / 0.2 / 0.5 / 1.0 (l.75, l.253, table l.302-313).
  - Analyzer protocol: the flat schema is binary, 1 or 0 (l.377); an optional tiered schema uses the max tier (l.379-405).
  - As built, path A is binary and acts as a hard gate (IF l.31). Path B is a keyword heuristic that never returns 0 (IF l.47).
- **C-11** `employmentStatus` "student" and "retired" are offered by the Analyzer protocol (l.366) and the Relevance doc table (l.305), but they are not implemented: they fall through to D = 1 (IF l.33). `features` is in the schema (Analyzer l.368), but every user has an empty `features`, so any `features` rule excludes everyone (IF l.32).
- **C-12** G anchor: the Relevance doc says "home or work" (l.109), but its own code sample uses home only (l.365-366, *internal*). As built: home only, and users without a home anchor are excluded (IF l.34).
- **C-13** G cutoff: the Relevance doc formula (l.103-106, l.324-327) has no cutoff, but its pipeline (l.27) and code (l.369-370) cut off at μ + 3σ, and so does the Analyzer (l.414). As built, path A has the cutoff (IF l.34); path B has no cutoff and uses σ = 0.5·μ (IF l.48).
- **C-14** μ/σ suggestion ranges differ between the Relevance doc §3.2 (l.333-341) and the Analyzer §2.3.1 (l.419-426):

  | Scope | σ (Relevance doc) | σ (Analyzer) |
  |---|---|---|
  | Building | 40–60 m | 20–60 m |
  | Neighbourhood | 150–300 m | 300–800 m |
  | District | 200–500 m | 1200–2500 m |
  | City | 500–2000 m | 2500–8000 m |

  Code defaults are μ = 100 m and σ = 50 m, a pair that appears in neither table (IF l.35).
- **C-15** Meaning of σ: the Request Guide calls σ the "impact radius" (l.88) and gives values (l.100-122) that match the Relevance doc's **μ** ranges. As built, the client sends σ = fade / 3, taken from an "Affect Fade (3σ)" input (IF l.35).
- **C-16** Issue vector: the Relevance doc says it is stored in `issues.issue_vector` (l.395, l.690). As built, it is not stored (EMBEDDINGS #12), and it is random when the API key is missing (IF l.38). The docs do not mention the random fallback.
- **C-17** Profile-vector input text: the Relevance doc gives two different templates (l.389 and l.667, *internal*). The real template is unknown (EMBEDDINGS #9).
- **C-18** Default relevance weights: the docs give examples but no default. As built, path A defaults to 0.1/0.4/0.4/0.1 (IF l.41) and path B to 0.2/0.6/0.1/0.1 (IF l.51). 29 stored issues carry the path A defaults (IF l.202).

### E. Weights: who sets them and whether they are checked

- **C-19** Editing weights:
  - The manifesto says users cannot change weights but the issue creator can (l.199).
  - The Request Guide shows weight sliders for the submitter (l.179-182) and says the weights are locked after submission (l.353).
  - The manifesto forbids exposing relevance weights (l.385); compare C-07.
  - As built, the submitter can edit every parameter, and a re-check skips the LLM and uses the submitted values verbatim (IF l.117).
- **C-20** Sum to 1:
  - The Analyzer protocol requires each group to sum to 1 (l.40), and so does the Weight Instructions doc (±0.001, l.60).
  - The Request Guide promises a "Weights sum to 100%" check (l.234) and a maximum σ of 20 km (l.235).
  - As built, nothing is validated (IF l.116, l.159).
- **C-21** The 40/30/30 fallback is "strictly a fallback" (Weight Instructions l.327-330; Relevance doc l.225-227). The Relevance doc's issue schema nevertheless labels 0.40/0.30/0.30 as the "default" (l.577-579). As built, the stored triples come from keyword rules: (0.4, 0.3, 0.3) for 133 publics, (0.4, 0.2, 0.4) for 49, and (0.5, 0.2, 0.3) for 8 (IF l.100).

### F. Expertise

- **C-22** Expertise formula:
  - The manifesto (l.88) and the skill (l.32) give a weighted sum using w_Edu, w_Exp and w_Res.
  - The Expertise doc's core formula is an unweighted sum (l.36).
  - The Analyzer still outputs `expertise_weights` (l.442-463) that nothing would use.
  - As built: unweighted; the weights are ignored (IF l.73).
- **C-23** Baseline: the Expertise doc defines a baseline of 1.0 (l.13), but its own pipeline starts from 0 (l.534, l.583, *internal*). As built: 0, and 921 of 3,049 members have E = 0 (IF l.74). A1 open question 2 covers this.
- **C-24** CBC table:
  - The Expertise doc (l.59-67) lists PhD 0.5/10, Master 0.8/6, Bachelor 1.0/4, Vocational 2.0/2 and Course 3.0/0.5. Its PhD example uses P = 7 years, not 10 (l.86, *internal*).
  - As built, the code adds College 1.5/3 and "other" 1.0/4, and has no Course/Cert row (IF l.70).
- **C-25** CBC adjustment factor:
  - The Expertise doc gives 0.8 / 1.0 / 1.2 (l.212-215).
  - The Analyzer gives a range of 0.7–1.3 (l.475).
  - As built, a keyword factor of 0.9 / 1.1 / 1.2 is used; the Analyzer value is not used (IF l.70).
- **C-26** The cosine clamp is missing from the Education formula (l.48) but present in the doc's code (l.543, *internal*). As built: max(0, cos) (IF l.69).
- **C-27** Recency decay, age penalty and contemporary importance are specified in the Expertise doc (l.122-126, l.196-215) and the Analyzer (l.472-475), but not implemented (IF l.75).
- **C-28** Data sources:
  - The doc measures experience in years (l.119); the stored `time` is the constant 1 (IF l.183).
  - The doc describes resource records (l.162); as built, resources come from `activity` skills (IF l.72, l.185).
  - The collections `user_expertise_profiles` and `microcommunity_expertise_scores` (doc l.406, l.479; Analyzer l.657) do not exist (SCHEMA l.8-28).
- **C-29** Range and normalisation; see also C-33. The Expertise doc says expertise is "absolute and unbounded" (l.5), whereas the Analyzer says every component is normalised to [0,1] before aggregation (l.679).

### G. Contribution

- **C-30** Contribution formula: the manifesto (l.97) and the skill (l.39) use Force × cos. The Contribution doc uses (cos + Sentiment) × Force (l.250, l.421-425). As built, it is not implemented (IF l.86).
- **C-31** When Contribution is computed: the doc says once per member and issue, after the issue closes (l.23, l.553), and also on demand from the member's historical actions whenever a new public forms (l.802-809). These two descriptions differ (*internal*).
- **C-32** Factors:
  - Doc type weights are 1.0 / 0.4 / 0.3 / 0.1 (l.156-161); the synthetic data uses type_weight ~ U(0.5, 2).
  - Doc sentiment uses coefficients +1 / +0.4 / −0.3 / −0.5 / −1 on member-normalised counts (l.223-233); the data uses sentiment = 0.5 · Σ(±1 marks) (IF l.88).
  - The doc's collections `issue_actions` and `user_action_vectors` and its field `absolute_contribution` (l.450, l.487, l.534) correspond to the real `actions` collection and the `contribution_score` field (IF l.86, l.89).

### H. Normalisation, aggregation and voting

- **C-33** Normalisation before aggregation is described four different ways:
  - Analyzer: normalise to [0,1] (l.679).
  - `mvp.html`: normalise to a public average of 1.0 (l.712).
  - Request Guide: "Relevance is absolute (not normalized)" (l.404).
  - Expertise and Contribution docs: absolute values; normalisation happens elsewhere (Expertise l.5; Contribution l.429, l.559, l.893).

  As built: divide by the mean, which matches `mvp.html` (IF l.99).
- **C-34** What weights a vote:
  - The manifesto says "relevance determines voting weight" (l.80) and "votes are always relevance-weighted" (l.386), but also "weighted by ISR_Score" (l.193). This is *internal*.
  - As built: 1.5 × floored relevance (IF l.101). This number is neither the member ISR nor the raw relevance.
- **C-35** Vote outcome: the docs say the outcome follows ISR weights (Request Guide l.381). As built, the tally runs only in the browser, nothing is persisted, and `winning_option_index` is only seeded, never computed (IF l.102-103).

### I. Values subsystem

- **C-36** Number of conflict-resolution dimensions: the Values Vectorization protocol has the header "38 conflicts" (l.59) but uses 36 elsewhere (l.236, l.273, l.335, *internal*). The taxonomy uses 36 (l.19).
- **C-37** VoV dimensionality: "145-dimensional" in the manifesto (l.101), mvp-current-spec (l.13) and the skill (l.38). The taxonomy gives 10 domains + 145 items + 36 CR + 40 CS + 20 metadata, and its total line reads "195 (145 + 10 + 40)" (l.794).
- **C-38** The "private" context means "deep friendship, community and private environment" in the taxonomy (l.764), but "alone, introspective" in the Vectorization protocol (l.76).
- **C-39** VoV stability: the manifesto says the VoV is stable and "not per-issue" (l.104), yet a public exists per issue and owns a VoV (l.53, l.55). As built, the VoV is aggregated per public at formation as a relevance-weighted mean (IF l.195). `mvp.html` agrees with the as-built behaviour (l.704-705).
- **C-40** Temperature: the Values Vectorization protocol says 0.2 (l.349). As built, step 1 uses 0.2 and step 2 uses 0.3 (IF l.174).

### J. The as-built files themselves

- **C-41** IF says gISR and AAuth "appear nowhere in code or docs" (l.87) and that "no code or doc mentions AAuth" (l.127). **This is wrong for the docs**: `docs/mvp.html` mentions gISR (l.572, l.728) and AAuth (l.726-728) (re-checked). The code-side claim was not re-checked.
- **C-42** PLAN.md says `issues` contain "full AI Issue Analyzer outputs" (l.18). IF says no issue contains Analyzer-protocol objects (l.200).
- **C-43** IF's header (l.3) describes "branch main, HEAD 392e773 with uncommitted modifications". That tree has since been committed as `0620f27` on `wip/before-s0`. The content is unchanged, so this is a provenance note rather than a contradiction.

### K. Data model and conventions

- **C-44** Collections: the six-collection matrix appears in the manifesto (l.146-153), project-map (l.81-89) and the query skill (l.15-24). The manifesto also says issues live in `discussions`/`voting`/`tasks` according to phase (l.62). As built: see 2.1 (re-checked by grep). The Analyzer additionally names `microcommunity_relevance_scores` (l.656), which does not exist.
- **C-45** snake_case: required in the manifesto (l.157), project-map (l.78) and the query skill (l.27). The design docs themselves use camelCase fields (`minAge`, `employmentStatus`, `familyStatus` in Analyzer l.364-368; `displayName`, `birthDate`, `socialRelations` in Relevance doc l.614 and l.633-640), and so does the data.
- **C-46** Security: `mvp.html` describes AAuth, access logging and encryption (l.726-731). As built, Firestore rules allow anyone to read and write everything until 2026-12-31, and an unauthenticated write succeeded (IF l.129-130). Login is by display name (IF l.128).

---

## 4. Notes for step 2 (observations only, no proposals yet)

- Every file that carries its own formulas or thresholds outside docs/: the manifesto, `calculate_relevance/SKILL.md`, `mvp-current-spec.md`, `project-map.md` (threshold), `query_isr_firestore/SKILL.md` (data model). S0 step 5 will need to deal with each of them.
- Three files duplicate the same UI rules: `create_isr_modal/SKILL.md`, `project-map.md` §UI and `MVP-Development-Documentation.md`.
- The as-built evidence that exists covers relevance, expertise, contribution, aggregation and voting, the Analyzer, auth and security, embeddings and the data model (IF, EMBEDDINGS, SCHEMA). Nothing as-built exists yet for the values subsystem beyond IF l.195, or for UI flows, seeding, or deployment and ops. Those component files will begin mostly as UNSURE.
- `docs/ISR-Expertise-Assessment-v1.md` has no Part 6; its numbering jumps from 5 to 7.

## 5. Open questions for you

1. **Classifying the manifesto**: it mixes vision with agent rules. Should it be Vision only, with its rules and formulas moved into the specs in step 3? S0 forbids editing it, so it would stay as it is and the specs would only link to it.
2. **`docs/mvp.html`**: is it normative design, or a historical overview? It is the only doc describing AAuth and gISR, and the only one whose normalisation matches the code.
3. **C-41**: should I note the error in IF somewhere? The fix would be an edit to `claude_export/`, which is outside this task, so I have left it unchanged.
