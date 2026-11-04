# SPEC A3: Option fields (cost, funding source, resources), G anchors (home, work, property), places in D

Status: IMPLEMENTED on branch except R16 (blocked, see status log)
Branch: a3-options-and-g-anchors (from a2-expertise-cleanup; never main)
Decisions: PD-8 (resources and money are option-level; property counts only through Relevance). Docs as committed by the author on 2026-11-04.
Follows: A2. Next: A1 (canonical ISR module).

## 1. Context

**Options.** The docs give each option a cost, a funding source and the resources needed for realization, with money first (`docs/mvp.html` l.361, l.387, l.673; Analyzer l.484-488, l.804, l.823). The Analyzer's `resources_needed` list (stored on the issue since A2, money first) is meant to prepare these entries.

As built (verified 2026-11-05):

| What | Where |
|---|---|
| The "Propose Decision Option" form has Option Name, Budget (free text, required) and implementation steps. There is no funding source and no resources field. | `prototype/js/main.js:7737-7895` |
| A new option is stored by the browser in `discussions.options_v2[]` as `{id, title, budget, author_uid, author_name, description: steps[], marks}` | `prototype/js/main.js:7865-7886` |
| Option cards and the option window show "Budget: …" only | `prototype/js/main.js:2474-2530, 7692-7720` |
| The voting view maps options with `budget` (default "N/A") | `prototype/js/main.js:3696-3709, 4449-4470` |
| Seeded `issues.options[]` have `label`, `score` and no budget, funding source or resources | claude_export `issues_000.jsonl` |

**G anchors.** The Relevance doc defines d as the distance to the nearest of the user's declared places of type `home`, `work` or `property` (a property registered in the system), and there is no exclusion of a person without a home anchor if another anchor exists (`docs/ISR-Relevance-Implementation.md` l.111, l.374-388, l.810). Owners and staff count as persons with the same formula.

As built (verified 2026-11-05), G uses the home anchor only:

| What | Where |
|---|---|
| `createIssue` and `checkIssue`: G from the `home` anchor; a user without one is excluded (except the creator) | `functions/index.js:203-216, 705-718` |
| Path B scoring script: home only | `relevance_evaluator.py:89-122` |
| Unused browser copy of the pipeline: home only | `prototype/js/relevance.js:143-145` |
| Map preview "nearest member" distance in the create flow: home only | `prototype/js/main.js:5115-5117` |
| Data: 9,150 `home` anchors, 4,911 `work` anchors, 0 `property` anchors (one user has no anchor) | claude_export `profiles_*.jsonl` |

## 2. Goal

Options carry cost, funding source and needed resources, and G measures distance to the nearest of home, work and registered property.

## 3. Non-goals

- No change to μ, σ, the 3σ cutoff, the threshold, the top-100 / top-25 caps or the G formula itself (C-06, C-08, C-13, C-14, C-15).
- No new members for existing publics (R17 only reports them).
- No property registration flow in the profile and no ownership check (later task); property entries are read when present.
- D stays pass/fail (PD-1 soft D is a separate task).
- No option timeline field, no vote tally change, no votes or tasks logic (A1 and later).
- No change to Expertise, the Analyzer or the parameter drafts (A2).
- No deploy, no Firestore rules change, no write to the live project. No edits under `docs/`.

## 4. Requirements

### Options
- R1 The option form gets three content fields, in this order (money first, Analyzer l.484):
  - **Cost** (required, free text such as "€1,200" or "no cost"). Stored as `budget` (as-built name, so that old options still display); shown as "Cost".
  - **Funding source** (required, free text: who pays, e.g. "building maintenance fund", "municipal grant", "donations", "no money needed"). New field `funding_source`.
  - **Resources needed** (zero or more rows of free text, e.g. "2 ladders", "a meeting hall for 50 people"). New field `resources_needed: [string]`. Who does what is already named per implementation step (`in_charge`).
- R2 The form shows, read-only, the issue's `resources_needed` from the analysis (type, importance, explanation; money first) as guidance. Nothing is pre-filled into the option and nothing is scored.
- R3 These are option content, not ISR parameters: they give nobody weight and are never read by any score.
- R4 Display: option cards, the option window and the voting view show cost, funding source and resources. Options without the new fields show "not stated" (old data is not migrated).
- R5 A pure function `validateOption(input)` (new `prototype/js/options.js`) checks required fields, trims text, drops empty resource rows and caps lengths (title 200, cost 100, funding source 300, each resource 300, at most 20 resources). The form uses it.

### G anchors
- R6 New `functions/geo.js` with pure functions: `haversineDistance`, `relevanceAnchors(geography)` (entries of type `home`, `work` or `property` with a valid `geo`), `nearestAnchorDistance(geography, location)` (null when none) and `gScore(distance, mu, sigma)`, the as-built formula.
- R7 `createIssue` and `checkIssue` use `nearestAnchorDistance`. A user with any anchor is considered; a user with none is excluded except the creator (as now). The 3σ cutoff applies to the nearest anchor.
- R8 `relevance_evaluator.py` uses the nearest of home, work and property (its own μ and σ rule stays as built). `prototype/js/relevance.js` and the map preview in `main.js` use the nearest anchor too.
- R9 Members get `G_anchor_type` (`home`, `work` or `property`) next to `G_score`, so that the record shows which place gave the stake. No address or coordinates are copied.

### Property and places in D (author, 2026-11-05)
Property is recorded in two ways, and D can use both:

| Where | Example | G | D |
|---|---|---|---|
| Location object in `users.geography` with `type: "property"`, a `kind` (`flat`, `house`, `land`, `garage`, `commercial`, `other`) and optional `place` (a name) | a flat in another district, a garage | anchor (R6-R8) | matched by `places` and `property_kinds` |
| Interests and features (movable things, hobbies): `users.features[]` and the names of `activity` skills | car, boat, bike, pets | no | matched by `features` |

Work locations count the same way: the `place` of a `work` entry is the company or organisation name.

- R11 The Analyzer's `demographic_rules` gets two optional lists: `places` (names of companies, organisations or properties the issue is about, e.g. "Argo Industry") and `property_kinds` (e.g. `garage`). Prompt, normaliser, fallback (empty lists) and `paramsFromAi` carry them; they are derived like every other parameter (nobody types them).
- R12 A **place match is a cause to include** a person: if a `work` or `property` entry of the user matches `places` (case-insensitive, whole name contained in either direction) or a `property` entry's `kind` is in `property_kinds`, then D = 1.0 and the user is **not excluded by the distance cutoff** (μ + 3σ) or by the `features` check. Example: for an issue about Argo Industry's parking, an employee of Argo Industry who lives far away is still considered; whether they join depends on the relevance threshold as for everyone. The age, employment and family checks still apply.
- R13 `features` is matched against `users.features` and also against the names of the user's `activity` skills (interests). It stays a pass/fail check as built (D as a soft score is PD-1, a separate task).
- R14 Members get `D_match` (`place`, `property_kind`, `feature` or absent) next to `D_score`, so the record shows the cause of inclusion. No names or addresses are copied.
- R15 The same D logic in `createIssue`, `checkIssue` and `relevance_evaluator.py` (one pure JS function in `functions/geo.js` or a new `functions/demographics.js`; a Python port with a shared test fixture).

### Existing publics (author, 2026-11-05: recompute)
- R16 New `scripts/migrate_a3.py` (dry run by default, emulator only unless `--project … --i-know-this-is-live`): for every current member of the 192 publics recompute G from the nearest anchor (stored μ, σ, issue location), relevance with the public's relevance weights and the stored D, S, X, then `normalized_relevance` and `isr_score` (A2 aggregation; ISR weights recovered as in A2). Membership is unchanged; D is unchanged (no seeded rule has `places`). Relevance weights: the issue's stored `w_demographic … w_social` where they reproduce the stored relevance (7 publics), otherwise recovered from the stored D, G, S, X and relevance (185 publics; the fit must reproduce every stored value within 0.002 and give non-negative weights summing to 1, or the public is reported and left unchanged).
- R17 The report also counts non-members who would now pass the distance stage (nearest anchor within μ + 3σ but home beyond it). They are not added: their S cannot be computed (no issue vectors).

### Specs
- R10 Update `03-relevance.md` (C-12 decided by the docs: home, work and property; places in D), `02-data-model.md` (option fields, `G_anchor_type`, `D_match`, the `property` geography entry with `kind`), the README contradiction map (C-11, C-12), and the `02` gap "options carry no funding source".

## 5. Acceptance criteria

- AC1 Unit tests for R6: nearest of several anchors; `work` nearer than `home`; `property` counted; unknown types and anchors without `geo` ignored; no anchor → null; `gScore` unchanged against the as-built formula on 20 sample distances.
- AC2 Unit tests for R5: missing title, cost or funding source refused; trimming; caps; empty resource rows dropped.
- AC3 Python test for R8: `evaluate_geographics` picks the nearest anchor and returns the same value as before for a user whose nearest anchor is home.
- AC4 Impact report on claude_export (no writes): for the 192 publics, how many current members have a work anchor nearer than home, and how many non-members would pass the G stage of the 3σ cutoff under the new rule. It uses stored μ, σ and issue locations. S for non-members cannot be computed (no issue vectors), so membership itself is not predicted.
- AC4b Unit tests for R12-R13 (JS and Python on one fixture): place match on a work place name; property kind match; a far-away place match is not cut by distance; features matched from interests; age check still applies to a place match.
- AC4c `migrate_a3.py` on the emulator: dry run report, `--apply`, second run changes nothing; members whose nearest anchor is home keep the same G and relevance (within 0.001).
- AC5 Emulator, browser: a member proposes an option with cost, funding source and two resources; the card, the option window and the voting view show them; an old option still displays. A Check for a location near many work anchors gives G from the work anchor (`G_anchor_type` = `work`).
- AC6 No file under `docs/` changed; no deploy; no write outside the emulator.

## 6. Open questions

None. Decided 2026-11-05 (author): (1) numbers in option text are content, not parameters; cost is free text; (2) recompute existing members (R16); (3) property as location (G and D) or interest (D only), with a kind; a place name (e.g. the employer) is a cause to include (R11-R14); (4) no "provided by".

## 7. Status log

- Plan approved: 2026-11-05 (author).
- Implementation: R1-R15 done on branch `a3-options-and-g-anchors`. R16 (recompute existing publics) blocked: stored G is not reproducible from stored data; author decision pending (CHANGES.md).
- Tests: Python 24 OK; Node 16 OK; emulator AC5 partly (voting view not checked in the browser).
- Impact report: `A3-impact-report.md`.
- CHANGES.md: written.
- Deviations: path B keeps its category heuristics for D (only the place rule added); R16 not done.
