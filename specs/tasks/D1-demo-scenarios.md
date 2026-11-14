# SPEC D1: Demo scenarios and clean demo data (roadmap stage 3)

Status: APPROVED 2026-11-10 (author: "Five decisions: ok"; the homes and property first, as P2). The work starts after P2 is applied and A4 and U6 are live, because the demo data must come from the final pipeline and the final population (roadmap section 4).
Current refinement branch: `codex/d1-spec-refresh`, based on deployed main `8466b13`. Original approved plan preserved from `d1-demo-data` (`af72ad0`). Section 9 approved by the author on 2026-11-14; implementation in `codex/d1-guided-demo`.
Roadmap: stage 3, "Clean demo data". Its result: a dataset whose every number can be reproduced from stored inputs, plus a written demo script. With stages 1 and 2 it reaches the **D1 guided demo**: one issue goes through the whole cycle on screen (description, AI parameters, ad-hoc public, discussion and options, ISR-weighted vote, stored result, task), and every number can be explained.

## 1. Historical facts that shaped the scenarios (emulator, 2026-11-10)

These are historical measurements, not the current population or cleanup counts. P1/P2/A4 are now applied live and U10 is deployed and author-accepted. Recount against the final dataset before building the seed plan. Replace old complex-based creator rules with the corresponding P2 building/work anchors while retaining the ten approved scenario purposes.

| Fact | Evidence |
|---|---|
| **Homes (before P2):** 9,151 people; 9,150 homes lie on only 8 points. 5 large complexes hold almost everyone:<ul><li>2,840 townhouses at (47.5919, 7.6261);</li><li>2,154 apartments at (47.5943, 7.6205);</li><li>2,087 apartments at (47.5898, 7.6124);</li><li>1,280 apartments at (47.6016, 7.6056);</li><li>658 townhouses at (47.5894, 7.6188).</li></ul>"Andim" has 123 homes at (47.5538, 7.6066); one point has 6 and one has 2.<br>Every home in a complex shares one point, so a building issue there reaches all its residents; D and the 100-member cap then choose the public. **P2 moves each home to its own building** (apartment blocks, townhouses, private houses) with realistic spacing, so a building issue reaches that building. | read-only query of `users.geography`; P2 spec |
| **Work:** 4,911 work entries at 78 places, each place at one point. The largest:<ul><li>Andim 1,013 and Argo Industry 930;</li><li>Bilim Farms 474, Office centre 317, Easy House 270;</li><li>Magistrate 191, SPA Hotel 160, Hospital 115;</li><li>4 schools with 93-120 each.</li></ul> | same |
| **No property entries.** The `property` type has 0 entries, so a scenario about garages, plots or land reaches nobody through property (A3 `property_kinds`). **P2 adds them** (flats, houses, garages, garden plots, commercial units). | same; P2 spec |
| **Ages:** under 18: 2,624; 18-29: 1,621; 30-44: 1,973; 45-64: 1,843; 65 and over: 1,089. 4,771 people have a child among their relations. | same (`birthDate`, `socialRelations`) |
| **The issue's point (U6):** it is the creator's home or a named place. Choosing the creator therefore chooses the complex. | U6 spec R2 |
| **Historical automatic formation cap: 100.** U10 retains that initial cap but now accepts explicit discussion-phase joins beyond it. The demo must show this distinction. | `functions/index.js` (createIssue) |
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
- Historical estimate only. The author moved the existing AI project to Paid with an approximate $5 monthly spend cap. Do not assume historical free-tier capacity; section 9 proposes a bounded first rehearsal budget. Record actual requests/texts/tokens.

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

- 2026-11-14 human-guided rehearsal: author created message/two options and supported Start Voting. Agent supplied synthetic coalition support through normal UI; threshold confirmation 30.8%; issue/discussion now Voting with deadline 21.11.2026 and zero option votes. Independent verifier: 606 members, zero differences. Voting geo/domain display now uses canonical issue metadata, verified 40m/30m in browser. Option vote/result/task cycle remains pending; no extra model requests or live writes.

- 2026-11-14 actual run: generated/reviewed ten scenarios, seeded/check/rerun on final P2/A4 population (505 members, zero differences; zero rerun writes/requests); named snapshot exported/imported and independently checked. Browser normal flagship, hidden standby exclusion, exact-title block, paraphrase/Open and explicit 101st-member Join passed. Corrected canonical chat geo/domain display. Post-Join independent check: 606 members, zero differences. Actual usage: 10 content requests / 6,694 reported tokens; 15 Check text requests / 140,377 reported tokens; 15 embedding texts; two total Nominatim calls. Check/place ceiling reached; no further calls without a new author decision. Human full cycle/disposable separate creation and live AC5 remain pending. See [current evidence](D1-emulator-report.md).

- 2026-11-14 real-run checkpoint: author "run D1 please" authorized the existing loader in memory. Ten scenarios generated/reviewed (10 text requests, 6,694 reported total tokens, one reverse lookup); editorial corrections recorded without more calls. Full-population dry plan proposes archiving 276 topic roots. Initial Check reached an unloaded function, with zero transport ledger requests. Installed lockfile dependencies on A (Firebase discovery drops NODE_PATH) and added a tested emulator-only in-memory secret adapter; no secret file copied/read by the adapter. Node 109 passed/two optional skips; Python 119 run/two existing skips. Resume same journal after the saved emulator checkpoint; no production writes.

- 2026-11-10: plan drafted (agent) from the roadmap and a read-only look at the emulator's population; waits for decisions 5.1-5.5.
- 2026-11-10: the author approved decisions 5.1-5.5 as recommended ("Five decisions: ok"). The author also asked for homes split into real buildings with realistic spacing, and for property entries; this is spec P2, which D1 now waits for.

## 9. Proposed implementation refinement after U10 (2026-11-14)

**Status: APPROVED by the author, 2026-11-14 ("approved").** Decisions 5.1-5.5 remain approved. This section resolves the archive/standby mechanics left open in the approved development plan and adds U10 acceptance without replacing any of the ten scenarios. No seeding, generated content, model requests or application changes are made by this refinement.

### 9.1 Current prerequisites and scenario identity

P1/P2 repair and homes migration, current A4 embeddings/public scores, U6/U8/A5 and U10 are live. The author accepted U10 on live on 2026-11-14. See [deployment evidence](U10-live-report.md). Existing synthetic identity and production-write restrictions remain.

Before seed application, a read-only inventory must count current issues, discussions, publics, messages and vectors and classify linked/orphan records. The historical 192/184 figures are not cleanup instructions. Store the inventory and proposed archive paths in a dry-run report; preserve users, packs, profile/skill vectors and values. Retain the historical backup and require a fresh backup/recovery check before the author's live apply.

Keep all ten scenario subjects and their approved opening phases. Rebind each creator deterministically to the final P2 population and record the actual uid/building or workplace, resolved point, exact text and configured model outputs. The flagship creator must occupy a real P2 building; never retain an obsolete whole-complex coordinate simply because it appeared in the old plan.

### 9.2 Archive and standby proposal

Recommend an explicit `archived` status on both issue and discussion, recording previous status, archive time, reason and demo-run id. Preserve linked publics, members, vectors, messages, votes and tasks in place. No deleting legacy records or deduplicating historical messages in place. Remove the hard-coded task fallback from normal rendering; archived duplicate messages remain preserved and invisible in the demo.

The implementation must define the shared lifecycle's archived phase and consistently exclude it from dashboard lists/counts, ordinary topic entry, matching/title conflicts, joining, deadline jobs and tally/status-change handlers. Test discussion-only legacy records too. Do not rely on U10's issue-status check alone: its legacy fallback and the existing dashboard/deadline paths also need the same exclusion. No Firestore rules changes.

Keep the pre-created flagship standby archived/inactive and hidden, with its real Check/Create outputs, issue vector and public retained. An active standby could block the live flagship's title or appear as a duplicate, so it must not be visible or matchable during the normal presentation. If AI fails before a flagship is committed, the author explicitly promotes the standby using a scoped, dry-run-first script command; promotion uses stored inputs/results and makes no fresh AI call. If creation already succeeded, open that recorded issue instead of promoting another. Never activate a standby automatically after an ambiguous timeout. Check the current records and recover the saved creation result first.

Initial visibility is nine seeded scenario cards (2-10), plus one hidden standby record. Normal live creation adds scenario 1, giving ten visible scenario cards. The standby remains extra historical/support data, not an eleventh visible scenario. After a fallback presentation, the promoted standby occupies scenario 1's slot. Do not leave both active.

### 9.3 U10 rehearsal steps

After normal flagship creation, demonstrate the exact-title repeat and a paraphrase finding the registered issue. An existing member gets Open/status; a deterministic nonmember gets explicit Join. Show growth beyond the initial 100 cap if that flagship initially has 100, with canonical member scores/maps and one event. If its building naturally selects fewer than 100, demonstrate joining there and retain the >100 integration fixture as separate boundary evidence; do not falsify the scenario population to force 100.

Exercise the single-Create path on a disposable rehearsal copy: a same active title is blocked even with an explanation; a distinct title plus explanation can create separately; editing text/point invalidates Check. Separate-test issues must not become extra permanent scenario cards. Closed/expired title reuse and concurrent Create/Join remain automated regression cases. Preserve the human-accepted live title rule and discussion-only Join policy; do not add voting-phase joining.

### 9.4 Durable manifest and repeatability

Use scenario keys such as `D1-01` through `D1-10` plus a distinct standby role. The server may choose physical record ids; persist and reuse them in the manifest. Write the returned draft id durably before requesting Create. On a lost Create response, replay that same draft and recover its saved creation result rather than deriving another draft/public. Store source-release/model/prompt/template versions, exact registration inputs and outputs, created-at values, public ids, phase arrangements and canonical validation results.

Use stable message/option/action keys for the seed run. Validate planned and existing records before application. A completed rerun must have zero writes and zero model calls. On changed input, partial seed state or manifest/data mismatch, report the difference and stop for an explicit reset/repair plan. Do not silently archive a partly created new demo and generate another one. Snapshot/import verification must reproduce the manifest's counts and canonical values.

### 9.5 Proposed first-pass usage ceiling and acceptance

For the first complete seed/rehearsal: at most 15 Check pairs (one text request and one issue embedding per Check), at most 20 text requests to prepare message/option content once, and at most two named-place lookups. This ceiling includes the ten seed/standby Checks, U10 exercises and one normal flagship creation; retries count too. Mocked tests do not consume API quota. Store generated content and accepted model outputs and reuse them. Record actual requests, embedding texts, estimated/reported tokens and reasons for retries; stop at the ceiling and ask before spending more. This is a request ceiling, not a promise about a monetary cost; the author's monthly cap still applies. No broad historical re-embedding.

AC1-AC5 additionally require archive invisibility/nonmutation across all relevant paths, hidden standby not matching at Check, safe explicit fallback promotion, exactly one visible flagship, duplicate/Open/Join/unique-title UI acceptance, canonical post-Join scores and retry-safe manifest recovery. The author performs live seed/activation and live writes; the agent uses the emulator and read-only live verification. Browser automation remains unavailable, so arrange a concrete manual walkthrough if it is still unavailable at acceptance time.

**Author decision:** hidden archived standby with explicit promotion, archive exclusion and the bounded first-pass plan approved on 2026-11-14. PR merge remains separately authorized by `merge PR N`.

- 2026-11-14: Imported the original approved D1 plan from `af72ad0` onto current main and prepared this U10-aware refinement. Historical facts are labeled, original ten subjects/decisions preserved. No code, data, key access or model calls.

- 2026-11-14 implementation checkpoint: author approved section 9. Archive lifecycle/UI exclusions, atomic tally adapter and guarded seed/check tooling are being implemented on `codex/d1-guided-demo`. Read-only inventory counts are recorded in the handoff. No real seed, generated content or paid calls yet; acceptance remains pending.

- 2026-11-14 implementation evidence: real-handler mocked-AI seed/recovery/standby race checks pass; full Node/Python suites and U10 transactional regression pass at the checkpoint in [D1 emulator report](D1-emulator-report.md). Added registration-time/text preservation through phase moves, history fingerprints and single-writer journals. Presenter/runtime commands are concrete but require the project's key-loader authorization before real generation. AC2-AC5 are not marked complete: final P2 population, real content, snapshot and manual whole-cycle acceptance remain.

- Final pre-key checkpoint (2026-11-14): Node 110 cases, 108 passed and two optional emulator skips; Python 119 run, two existing skips. Explicit real-handler D1 emulator test passed in 38.5 seconds, including normal flagship auto-registration, refusal to reseed after presentation, legacy text/registration-time preservation, history/numeric drift, lost-response recovery and concurrent standby/Create. U10 regression passed in 15.3 seconds, including 102-member joins and atomic creation. Request-ledger SDK transport and loader tests use dummy values; actual D1 paid requests/embedding texts/Nominatim lookups remain zero. Frontend CRLF/final-CR and whitespace checks passed. Final-population generated content, real seed/rerun, named snapshot/import and manual full-cycle acceptance are pending. Existing root Gemini loader has not been invoked for this worktree; author authorization is the next gate.
