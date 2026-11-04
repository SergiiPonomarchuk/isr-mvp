# SPEC A3: Option fields (cost, funding source, resources) and G anchors (home, work, property)

Status: DRAFT (waiting for author approval)
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
- No recomputation of stored relevance or membership of existing publics (see open question 2).
- No property registration flow or ownership check (see open question 3).
- No option timeline field, no vote tally change, no votes or tasks logic (A1 and later).
- No change to Expertise, the Analyzer or the parameter drafts (A2).
- No deploy, no Firestore rules change, no write to the live project. No edits under `docs/`.

## 4. Requirements

### Options
- R1 The option form gets three content fields, in this order (money first, Analyzer l.484):
  - **Cost** (required, free text such as "€1,200" or "no cost"). Stored as `budget` (as-built name, so that old options still display); shown as "Cost".
  - **Funding source** (required, free text: who pays, e.g. "building maintenance fund", "municipal grant", "donations", "no money needed"). New field `funding_source`.
  - **Resources needed** (zero or more rows; each row is a free-text description and an optional "provided by" text). New field `resources_needed: [{description, provided_by}]`.
- R2 The form shows, read-only, the issue's `resources_needed` from the analysis (type, importance, explanation; money first) as guidance. Nothing is pre-filled into the option and nothing is scored.
- R3 These are option content, not ISR parameters: they give nobody weight and are never read by any score.
- R4 Display: option cards, the option window and the voting view show cost, funding source and resources. Options without the new fields show "not stated" (old data is not migrated).
- R5 A pure function `validateOption(input)` (new `prototype/js/options.js`) checks required fields, trims text and caps lengths (title 200, cost 100, funding source 300, each resource 300, at most 20 resources). The form uses it.

### G anchors
- R6 New `functions/geo.js` with pure functions: `haversineDistance`, `relevanceAnchors(geography)` (entries of type `home`, `work` or `property` with a valid `geo`), `nearestAnchorDistance(geography, location)` (null when none) and `gScore(distance, mu, sigma)`, the as-built formula.
- R7 `createIssue` and `checkIssue` use `nearestAnchorDistance`. A user with any anchor is considered; a user with none is excluded except the creator (as now). The 3σ cutoff applies to the nearest anchor.
- R8 `relevance_evaluator.py` uses the nearest of home, work and property (its own μ and σ rule stays as built). `prototype/js/relevance.js` and the map preview in `main.js` use the nearest anchor too.
- R9 Members get `G_anchor_type` (`home`, `work` or `property`) next to `G_score`, so that the record shows which place gave the stake. No address or coordinates are copied.

### Specs
- R10 Update `03-relevance.md` (C-12 decided by the docs: home, work and property), `02-data-model.md` (new option fields, `G_anchor_type`), the README contradiction map, and the PD-2 row of `02` gaps ("options carry no funding source").

## 5. Acceptance criteria

- AC1 Unit tests for R6: nearest of several anchors; `work` nearer than `home`; `property` counted; unknown types and anchors without `geo` ignored; no anchor → null; `gScore` unchanged against the as-built formula on 20 sample distances.
- AC2 Unit tests for R5: missing title, cost or funding source refused; trimming; caps; empty resource rows dropped.
- AC3 Python test for R8: `evaluate_geographics` picks the nearest anchor and returns the same value as before for a user whose nearest anchor is home.
- AC4 Impact report on claude_export (no writes): for the 192 publics, how many current members have a work anchor nearer than home, and how many non-members would pass the G stage of the 3σ cutoff under the new rule. It uses stored μ, σ and issue locations. S for non-members cannot be computed (no issue vectors), so membership itself is not predicted.
- AC5 Emulator, browser: a member proposes an option with cost, funding source and two resources; the card, the option window and the voting view show them; an old option still displays. A Check for a location near many work anchors gives G from the work anchor (`G_anchor_type` = `work`).
- AC6 No file under `docs/` changed; no deploy; no write outside the emulator.

## 6. Open questions

1. **Cost as free text.** "Nobody types a number" is about ISR parameters; I read the cost of an option as content that members write and discuss, so it stays free text typed by the proposer. Confirm?
2. **Existing publics.** The new G rule applies to issues created from now on. Stored relevance and membership of the 192 existing publics stay as they are (recomputing them needs S, and the issue vectors are not stored). AC4 reports what would change. Accept, or should the stored G and relevance of current members be recomputed (membership unchanged)?
3. **Property anchors.** No user has a `property` anchor, and the profile has no way to register one. A3 makes the code count them when present. Is a registration flow (with a check that the property exists) a later task, or part of A3?
4. **"Provided by"** in a resource row is free text (a name, an organisation, "to be found"). It is not linked to user accounts and gives no weight. Enough for now?

## 7. Status log

Plan approved: ___  Implementation: ___  Tests: ___  Impact report: ___  CHANGES.md: ___  Deviations: ___
