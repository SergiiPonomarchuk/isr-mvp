# SPEC D1: Demo scenarios and clean demo data (roadmap stage 3)

Status: APPROVED 2026-11-10 (author: "Five decisions: ok"; the homes and property first, as P2). The work starts after P2 is applied and A4 and U6 are live, because the demo data must come from the final pipeline and the final population (roadmap section 4).
Branch: d1-demo-data (from main, once A4 and U6 are merged; never main)
Roadmap: stage 3, "Clean demo data". Its result: a dataset whose every number can be reproduced from stored inputs, plus a written demo script. With stages 1 and 2 it reaches the **D1 guided demo**: one issue goes through the whole cycle on screen (description, AI parameters, ad-hoc public, discussion and options, ISR-weighted vote, stored result, task), and every number can be explained.

## 1. Facts that shape the scenarios (emulator, verified 2026-11-10)

| Fact | Evidence |
|---|---|
| **Homes (before P2):** 9,151 people; 9,150 homes lie on only 8 points. 5 large complexes hold almost everyone:<ul><li>2,840 townhouses at (47.5919, 7.6261);</li><li>2,154 apartments at (47.5943, 7.6205);</li><li>2,087 apartments at (47.5898, 7.6124);</li><li>1,280 apartments at (47.6016, 7.6056);</li><li>658 townhouses at (47.5894, 7.6188).</li></ul>"Andim" has 123 homes at (47.5538, 7.6066); one point has 6 and one has 2.<br>Every home in a complex shares one point, so a building issue there reaches all its residents; D and the 100-member cap then choose the public. **P2 moves each home to its own building** (apartment blocks, townhouses, private houses) with realistic spacing, so a building issue reaches that building. | read-only query of `users.geography`; P2 spec |
| **Work:** 4,911 work entries at 78 places, each place at one point. The largest:<ul><li>Andim 1,013 and Argo Industry 930;</li><li>Bilim Farms 474, Office centre 317, Easy House 270;</li><li>Magistrate 191, SPA Hotel 160, Hospital 115;</li><li>4 schools with 93-120 each.</li></ul> | same |
| **No property entries.** The `property` type has 0 entries, so a scenario about garages, plots or land reaches nobody through property (A3 `property_kinds`). **P2 adds them** (flats, houses, garages, garden plots, commercial units). | same; P2 spec |
| **Ages:** under 18: 2,624; 18-29: 1,621; 30-44: 1,973; 45-64: 1,843; 65 and over: 1,089. 4,771 people have a child among their relations. | same (`birthDate`, `socialRelations`) |
| **The issue's point (U6):** it is the creator's home or a named place. Choosing the creator therefore chooses the complex. | U6 spec R2 |
| **A public has at most 100 members**, the top by relevance. The cap is removed only in roadmap stage 8. | `functions/index.js` (createIssue) |
| **Old data to clean** (roadmap, 2026-11-07; recount at the start):<ul><li>192 old publics whose numbers cannot be reproduced;</li><li>184 duplicated messages;</li><li>hard-coded mock tasks, `staticTasksMockData` at `prototype/js/main.js:34-152`, used at lines 2120 and 4579.</li></ul> | ROADMAP-demo section 2; the code on main |

## 2. Proposed scenarios (10 of the 100 examples)

Each one shows a different part of the model. The creator is a synthetic person chosen by a fixed rule, recorded in the seed script.

| # | Example | Scope | Creator and point | What it shows |
|---|---|---|---|---|
| 1 | 1 House entrance lock broken | building | a resident of the 2,154-apartment complex; "our house" -> home | **The flagship**, created live during the demo. G dominates and the cycle runs to a repair task. |
| 2 | 21 Pothole on local street | street | a resident of the townhouses; a real street near them named in the text | **U6's named-place lookup**, with the OpenStreetMap credit. |
| 3 | 32 Broken playground equipment | street | a parent in the 2,087-apartment complex | **D as a gate:** parents and children (a vulnerability). |
| 4 | 44 Elderly day-care / respite services | neighbourhood | a resident aged 65 or over | **D by age** (1,089 people aged 65+). |
| 5 | 86 On-site shift scheduling change | neighbourhood | a worker at Argo Industry; "at work" -> the factory | **The work anchor and `places`:** workers are included wherever they live. |
| 6 | 82 Community choir / arts group | neighbourhood | an arts-minded resident | **S:** interests, from the re-embedded profiles (A4). |
| 7 | 90 Open-source project roadmap | global digital | a software developer | **E:** G is near 0; skills and experience lead. |
| 8 | 98 Zoning / building permit | district | a resident near a complex | **E and G together:** planning and engineering experts. |
| 9 | 51 Family emergency | city | a person with many relations | **X:** social ties to the creator. |
| 10 | 97 City budget participatory allocation | city | any resident | **A city-wide public:** the 100-member cap, options with costs and funding sources, and a clear ISR-weighted vote. |

**Phases at the start of a demo:**
- Scenario 1 is created live.
- Of the others, 3 are in discussion (2, 6, 9), 3 are in voting (3, 5, 8), and 3 are closed with a winner and tasks (4, 7, 10).
- So every screen of the cycle has a real example.

## 3. Work items

- W1 **Clean up:** archive or delete the 192 old publics (decision 5.2); remove `staticTasksMockData` and its two uses; remove the duplicated messages (they leave with the old publics if those are archived).
- W2 **Seed script** `scripts/seed_demo.py` (emulator by default; live only with `--i-know-this-is-live`, run by the author). For each scenario it:
  - creates the issue through the real functions (`checkIssue`, then `createIssue`), so every number comes from the deployed code;
  - adds the discussion messages and the options (cost, funding source, resources), with the texts taken from a stored file (decision 5.3);
  - casts the members' votes and closes the voting through the server's tally (A1), which creates the winner's tasks;
  - sets the deadlines (L1).

  A second run changes nothing.
- W3 **Manifest and reproducibility check.** `specs/demo/manifest.json` records:
  - scenario -> issue, discussion and public ids;
  - the creator;
  - the model, prompt and template versions.

  `scripts/check_demo.py` recomputes every stored R, E, ISR and tally from the stored inputs (`isr_core`, `expertise.py`) and reports any difference.
- W4 **Snapshot:** an emulator export of the demo dataset, named and kept (not overwritten by daily work).
- W5 **Demo script** `specs/DEMO-script.md`: the presenter's 10-15 minute walk-through.
  - Sign in as scenario 1's creator and create the issue live (Check shows the AI's parameters and "your home").
  - Show the public and the members' ISR, discuss, add options, vote, close the vote, and show the task.
  - Then visit scenarios 2-10 for G, U6, D, S, E and X.
  - It also names a fallback if the AI is unavailable at that moment (decision 5.4).

## 4. Requests and cost

- About 10 Checks: 10 text and 10 embedding requests.
- About 10-20 text requests if the messages and options are generated (5.3).
- At most 2 Nominatim lookups.
- All within one day of the free tier.

## 5. Decisions for the author

- 5.1 **The scenarios:** the 10 above, or changes. **Decided: the 10 above.** With P2's property, a property scenario (for example garage owners) can replace one later.
- 5.2 **The 192 old publics:**
  - a. archive them: hidden in the app and kept in the database; the 2026-10-12 export remains the as-built record for the paper (recommended; **decided**);
  - b. delete them;
  - c. keep them visible.
- 5.3 **Message and option texts:**
  - a. generated once by the model (fixed seed) and stored in the repository, so a re-run gives the same data (recommended; **decided**);
  - b. hand-written.
- 5.4 **The live part of the demo:** scenario 1 is created live with the real AI, and a pre-created copy stands by in case the AI fails (recommended; **decided**), or everything is pre-created.
- 5.5 **Where:** the live project, replacing the old data (recommended; it is the only project; **decided**), or a separate demo project.

## 6. Acceptance criteria (draft)

- AC1 Unit tests and CI green (the seed and check scripts, with the API mocked).
- AC2 Emulator: the seed script creates the 10 scenarios; `check_demo.py` finds 0 differences; a second run changes nothing.
- AC3 Emulator: the demo script runs end to end in the browser, including scenario 1 created live.
- AC4 Clean: no mock tasks, no duplicated messages, and the old publics handled per 5.2.
- AC5 Live, after the author's steps: AC2 and AC3 on live (read-only checks plus the guided run).

## 7. Plan and effort

1. Decisions 5.1-5.5 (taken 2026-11-10). P2 (homes and property) first.
2. W1, then W2 with tests, on the emulator (AC2).
3. W3 and W4, then W5 (AC3, AC4).
4. Status log, CHANGES, PR. The author's live run follows (AC5).

The roadmap estimates 4-6 developer-days.

## 8. Status log

- 2026-11-10: plan drafted (agent) from the roadmap and a read-only look at the emulator's population; waits for decisions 5.1-5.5.
- 2026-11-10: the author approved decisions 5.1-5.5 as recommended ("Five decisions: ok"). The author also asked for homes split into real buildings with realistic spacing, and for property entries; this is spec P2, which D1 now waits for.
