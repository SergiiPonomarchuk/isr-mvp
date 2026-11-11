# Roadmap to a demonstration stage

Prepared 2026-11-07 against branch `a3-options-and-g-anchors` (A2 and A3 implemented, not merged; live data not migrated). Evidence: `claude_export/IMPLEMENTATION_FACTS.md` (IF), the component files in this folder, and the code at the cited lines.

## 1. What "demonstration stage" means here

Two levels, so that the first useful demo is not blocked by work that only a public pilot needs:

| Level | Who uses it | What must be true |
|---|---|---|
| **D1 Guided demo** | The author presents, on the hosted site or locally | One issue goes through the full cycle on screen: a description → the AI derives the parameters (real model) → the ad-hoc public is formed → discussion and options → voting where each vote carries the member's ISR → a result that is computed and stored → a task. Every number on screen can be explained from stored inputs. |
| **D2 Shareable demo** | Reviewers, paper readers, testers with a link | D1, plus: nobody can change other people's data, the Analyzer behaves as the protocol says (typical range, clarification), and runs are logged and reproducible for the paper. |

D3 (a pilot with real people) is out of scope here: it needs Contribution, gISR, AAuth, the public's change proposals and a privacy review.

## 2. Where the MVP stands (gap analysis)

Severity: **Blocker** = the D1 cycle cannot be shown or shows wrong numbers; **D2** = needed for a shareable demo; **Later** = design coverage beyond the demo.

| Area | Works now | Gap | Severity |
|---|---|---|---|
| Hosting and data access | Live project, hosting, 3 Cloud Functions | Firestore rules allow everything only **until 2026-12-31** (`firestore.rules:5`); after that every read and write fails. The deployed function is older than the code (IF l.20). A2/A3 are not merged, deployed or migrated. | **Blocker (date)** |
| AI models | Prompt, normaliser, keyword fallback | `gemini-1.5-flash` and `text-embedding-004` (`functions/ai-helper.js:23, 924, 955`) are retired, so with a key the calls fail and the Analyzer silently uses keyword rules; the issue vector is then **random** (`ai-helper.js:31-37`), so S is noise. The SDK `@google/generative-ai` is the old one. | **Blocker** |
| Embeddings of people | 9,150 profile and 20,245 skill vectors | Made with the retired model; new issue vectors from a new model are not comparable with them. The profile text template is not in the repo (EMBEDDINGS #9). No issue vector is stored. | **Blocker** |
| Relevance (R) | Server pipeline with D, G (nearest anchor, A3), S, X; threshold, members | D is a pass/fail gate (PD-1 wants a soft score); top-100 cap; seeded publics are discussion participants, not relevance-selected. | D2 / Later |
| Expertise (E) | Formula with age floor (A2), script and tests | Computed **only offline**; `createIssue` writes no E and no ISR, so members of new issues have none (IF l.78; `functions/index.js`). | **Blocker** |
| Contribution (C) | Actions shown in the UI | Not computed: C = 1.0 for everyone; the `actions` data is random (IF l.86-88). | Later (label it in the demo) |
| ISR and vote weight | Member ISR stored for seeded publics | Two different "ISR" numbers; votes and phase moves use `isr_scores` = 1.5 × floored relevance (IF l.101). New issues have no `isr_scores`, so the ISR-weighted phase vote can never pass (`prototype/js/main.js:3551-3594`): **a new issue cannot reach voting**. | **Blocker** |
| Voting result | Votes stored per member; live tally in the browser | Tally computed in the browser only; `winning_option_index` never computed; phase moves at 10 % of the weighted vote, decided by the client; any client can write any vote (IF l.102-104). | **Blocker** (result), D2 (integrity) |
| Options | Cost, funding source, resources (A3) | Voting view not yet checked in the browser. | small |
| Tasks | Tasks section, subtasks, comments | Not created from the winning option by code (no winner is computed). | **Blocker** (follows from the result) |
| Analyzer protocol | Derived parameters, read-only, "Derive again" (A2) | No table of issue types, no Step 4A range check, no `needs_clarification` / `not_consistent`; weights not validated to sum to 1 (IF l.116); the 100 examples are not given to the model (IF l.114); no temperature or seed; prompts and outputs not logged (IF l.118). | D2 |
| Public ownership of the issue | n/a | Step 4B (change proposals, consistency check, public vote, `parameters_version`) not implemented. | Later |
| Identity and security | "Adopt a profile" login | No authentication (login by name), open rules, no server-side validation (IF l.128-130). Acceptable for D1 when presented by the author, not for a shared link. | D2 |
| gISR, AAuth | n/a | Not implemented (IF l.87, l.127). | Later |
| Values subsystem | Values narratives, vectors, public aggregate, UI | Works for the demo (offline vectorizer). | ok |
| Demo data | 9,151 synthetic users, 192 publics | Stored numbers not reproducible (A3 impact report); floored cached maps; 184 duplicated messages; hard-coded mock topics (`main.js:30-135`); user "1" is in every public. | **Blocker** (consistency) |
| Tests and tooling | 31 Python + 16 Node unit tests; emulator with snapshot | No end-to-end test, no CI. | D2 |
| Specs | 00, 02, 03, 06, decisions, tasks | Component files 01, 04, 05, 07–14 not written (S0 batch 2). | Paper |

**Distance in one line:** the screens for the whole cycle exist, but four things stop a credible D1 demo: the AI and embeddings are dead (retired models), new issues get no ISR (so they cannot be voted on), the vote result is not computed or stored, and the demo data's numbers cannot be explained. Separately, the live site stops working on 2026-12-31.

## 3. Stages

Effort is in developer-days for one developer working with Claude Code in this repository's spec-first workflow (spec, plan, implementation, tests, CHANGES). Ranges include tests and fixes; they do not include the author's decision time or review. Each stage ends with its increment visible on the emulator, then on the live project after the author's migration and deploy.

| Stage | Increment (what you get) | Main work | Effort | Author decisions needed |
|---|---|---|---|---|
| **0. Keep alive and consolidate** (before 2026-12-30) **— DONE 2026-11-08** (R0, U1) | The live site runs the current code and keeps working after 2026-12-31. | Review and merge A2/A3; live migrations A2, A3 (author); new Firestore rules (temporary extension, or the D2 rules early); deploy functions and hosting; upgrade `firebase-functions`; CI running the unit tests. | 1.5–3 d | Rules change (CLAUDE.md: needs a spec); merge and deploy |
| **1. Working AI (A4)** | "Check" uses a real model; S and the expertise cosines are meaningful; every Analyzer call is logged for the paper. | Current Gemini model and `@google/genai` SDK; temperature 0; send the k nearest of the 100 examples; one embedding model and dimension for everything; re-embed 9,150 profiles and 20,245 skill records with a defined text template; store `issue_vector`; `analyzer_logs` collection (prompt, output, model version, derived vs. shown). | 4–6 d (+ API cost, small; check current pricing) | Model choice; profile text template; whether logs may hold issue text |
| **2. One ISR, computed on the server (A1, revised) — DONE 2026-11-09** (A1 v2; votes and phase moves stay client writes until stage 5). Follow-up L1 (live 2026-11-09): deadlines close by themselves; 30 % rule | Each member's vote weight is their ISR; the result is computed and stored; the winning option becomes a task; new issues can be voted on. Acceptance case from the R0 smoke test: the voting list (cached `isr_scores`, 1.5 × floored relevance, e.g. 1.20) and the topic card (member ISR, e.g. 0.44) must show the same number. | Canonical module (JS + Python port, tests); `createIssue` computes E and ISR for the new public; tally on the server (`closeVoting`), `winning_option_index`, task from the winner; phase moves decided on the server; votes written through a function; retire the 1.5 × relevance numbers. | 6–9 d | Zero/negative-mean rule (PD-3); phase-move rule (keep 10 %?); quorum; who closes the vote |
| **3. Clean demo data** | A demo dataset whose every number is reproducible from stored inputs, plus a written demo script. | Choose 8–12 scenarios from the 100 examples; recreate their publics with the stages 1–2 pipeline on the synthetic population; drop or rebuild the floored maps; fix duplicated messages; remove hard-coded mock topics; seed script and snapshot. | 4–6 d | Which scenarios; keep or archive the 192 old publics |
| **= D1 Guided demo reached** | | | **≈ 16–24 d** | |
| **4. Analyzer guardrails (Step 4A)** | Vague or inconsistent issues get a clarification request; derived weights always stay in the typical range and sum to 1. | Issue-type table from the 100 examples; k-nearest check; `needs_clarification` / `not_consistent`; server validation; UI messages. | 4–6 d | k and the range rule; how many types |
| **5. Demo-safe access** | A link can be shared: visitors sign in to a demo account and cannot change other people's data. | Firebase Auth (anonymous or email link) mapped to an adopted synthetic profile; rules: reads for signed-in users, writes only through functions or to the user's own data; rate limits on AI calls; an end-to-end smoke test. | 4–7 d | Sign-in method; who may create issues in the demo |
| **= D2 Shareable demo reached** | | | **≈ 24–37 d** | |
| **6. Contribution v1** | All three ISR components are live. | Contribution protocol: c = (A + M) × Force per action, Ĉ = C / (mean\|C\| + 1); plausible synthetic actions instead of random ones; UI. | 6–10 d | Action types and marks for the synthetic data |
| **7. The public owns the issue (Step 4B)** | Members propose changes of text, options, type or context; the public votes; parameters and members are re-derived. | `changes` subcollection, consistency check, vote, `parameters_version`, recomputation of relevance and membership. | 6–10 d | Vote rule for changes |
| **8. Pilot features** | Soft D (PD-1), gISR and AAuth tiers (PD-5), no top-100 cap. | Per PD-1 and PD-5. | 10–15 d | Several (PD-1, PD-5 open points) |

**Totals:** D1 ≈ 16–24 developer-days; D2 ≈ 24–37; stages 6–8 add ≈ 22–35. At about 3 focused days a week: D1 in 6–8 weeks, D2 in 8–12 weeks.

## 4. Order, dependencies and risks

- **Stage 0 has a hard date**: the rules end on 2026-12-31 (00:00 UTC), so the change must be deployed by 2026-12-30. Everything else can move.
- Stages 1 and 2 are independent and can run in parallel; stage 3 needs both (the demo data must be produced by the final pipeline). Stage 4 needs stage 1. Stage 5 needs stage 2 (votes through functions).
- **Model churn**: Google has retired two models this project uses in about a year. Keep the model id in one config value, log it with every result, and keep the keyword fallback visibly labelled ("AI unavailable") rather than silent.
- **Comparability for the paper**: after re-embedding (stage 1) and the canonical pipeline (stage 2), numbers from the old seeded publics are not comparable with new ones. Keep the 2026-10-12 export as the frozen "as-built" record for the paper and treat the demo dataset as a separate, versioned artefact.
- **Cost**: re-embedding about 30,000 short texts and Analyzer calls during a demo are small; check the current price list before stage 1 and set a budget alert.
- **Scope**: each stage is a task spec in `tasks/`, approved before work starts, as for A2 and A3.
