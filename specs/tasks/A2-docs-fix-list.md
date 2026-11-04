# A2 docs fix list, round 2 (for the author)

Prepared 2026-11-04 against the working tree, which contains the author's uncommitted round-1 edits. Line numbers refer to that tree; apply the edits from the bottom of each file upwards so earlier numbers stay valid. Round 1 is applied; see the git history of this file.
`docs/` is edited by the author only (CLAUDE.md).

Decisions applied (author, 2026-11-04): (1) nobody types a number, everywhere; (2) no "Baseline (1.0)" scale; (3) delete `contemporary_importance`; (4) Contribution is normalised by the mean absolute Contribution plus one reference unit, everywhere; (5) Analyzer l.807 reworded; (6) `ISR-AI-Weight-Evaluation-Instructions.md` aligned with the current structure.

Rows marked **[decide]** go beyond the six points; apply them only if you agree.

## 1. Nobody types a number

| Doc | Line | Find | Replace with |
|---|---|---|---|
| mvp.html | 337 | `analyzes the issue text and context and propose weights` | `analyzes the issue text and context and derives weights` |
| mvp.html | 337 | `The topic starter can accept them or change them. A change from the typical values for this kind of issue must be explained to the AI assistant, and the issue is published with a remark that shows what was changed and why.` | `The topic starter sees them and, if they look wrong, clarifies the context; the system then derives them again, always inside the typical range for this kind of issue. Nobody types a number.` |
| mvp.html | 337 | `any member can question its parameters, text, context and options` | `any member can propose a change of its text, options, issue type or context (never of a number)` |

## 2. No baseline scale (ISR-Expertise-Assessment-v1.md)

| Doc | Line | Find | Replace with |
|---|---|---|---|
| Expertise | 5 | `significantly more valuable than baseline competence.` | `significantly more valuable than those of non-specialists.` |
| Expertise | 9 | `## Part 1: Expertise Definition & Baseline` | `## Part 1: Expertise Definition & Scale` |
| Expertise | 13–28 | The whole block from `**Baseline (1.0)**: Common knowledge…` to `- **45.0+**: World-class expert (30 years + PhD + active practice)` | See text 2-A below |
| Expertise | 74 | `Linear application of cosine (baseline behavior)` | `Linear application of cosine (neutral behavior)` |

**Text 2-A:**
```
**Zero point.** A person with no education or experience record related to the issue has E = 0. There is no baseline term in the formula and no adjustment for age or other personal traits.

**Raw scale** (the thresholds used in §5.3):
- **below 1.0**: Novice
- **1.0–3.0**: Informed
- **3.0–10.0**: Practitioner
- **10.0+**: Expert
- **45.0+**: World-class expert (30 years + PhD + active practice)

**Relative reading.** In the ISR-score, E is divided by the mean E of the members of the ad-hoc public, so 1.0 there means the average Expertise of that public.
```

## 3. Delete `contemporary_importance`

| Doc | Line | Find | Replace with |
|---|---|---|---|
| Expertise | 161–165 | `2. **Contemporary Knowledge Importance** [0.0-1.0]:` and its three sub-lines (0.0 / 0.5 / 1.0), plus the blank line after | *(delete)* |
| Expertise | 166 | `3. **Recency Decay Rate**` | `2. **Recency Decay Rate**` |
| Expertise | 172 | `4. **CBC Adjustment Factor**` | `3. **CBC Adjustment Factor**` |
| Expertise | 182, 191, 200, 529, 613, 710, 794 | The line starting `Contemporary importance:` | *(delete the line)* |
| Analyzer | 468 | The table row that starts `` | `contemporary_importance` ∈ [0, 1] `` | *(delete the row)* |
| Analyzer | 477 | `  "contemporary_importance": 0.2,` | *(delete the line)* |
| Analyzer | 689 | `    "contemporary_importance": 0.2,` | *(delete the line)* |
| 100-Examples | 100 lines (first: 82, 176) | Regex `^\s*"contemporary_importance": [0-9.]+,\r?\n` | *(empty)* |
| 100-Examples | 100 lines (first: 85, 179) | Regex ` with contemporary importance [0-9.]+ and decay rate` | ` with decay rate` |

## 4. Contribution normalisation: mean absolute Contribution plus one reference unit

| Doc | Line | Find | Replace with |
|---|---|---|---|
| Contribution | 931 | `- The ISR core later **normalizes** `absolute_contribution` and combines it with other components (e.g., relevance, expertise) to derive final weights or ISR-scores for decision-making; that normalization and combination sit outside this protocol.` | See text 4-A below |
| Contribution | 578 | `- Normalization to a 0–1 range or any other scale for final ISR-score calculation happens in the **ISR core**, not in this protocol.` | `- Normalization for the final ISR-score (by the mean absolute Contribution plus one reference unit, Section 8.5) happens in the **ISR core**, not in this protocol.` |
| Relevance | 884 | `(and Contribution to its mean plus the reference unit)` | `(and Contribution by the public's mean absolute Contribution plus one reference unit)` |
| Analyzer | 789 | `Where each component is normalized to [0, 1] before aggregation.` | `Where R and E are divided by their mean over the members of the ad-hoc public, and C by the public's mean absolute Contribution plus one reference unit (Contribution protocol, Section 8.5).` |
| mvp.html | 712 | *(already correct)* | |

**Text 4-A:**
```
- The ISR core later **normalizes** `absolute_contribution` and combines it with Relevance and Expertise:

$$\hat C_u = \frac{C_u}{\overline{|C|} + u}$$

  where $\overline{|C|}$ is the mean absolute Contribution over the members of the ad-hoc public and $u$ is one reference unit of Contribution. Relevance and Expertise are divided by their mean over the same members. gISR (8.6) uses the same rule over all registered users.
```

**Open:** the value of the reference unit u is not stated anywhere. Add it to 4-A, for example "u = 1, the Contribution of one typical action".

## 5. Money in the Analyzer priors

| Doc | Line | Find | Replace with |
|---|---|---|---|
| Analyzer | 807 | `   - Resource intensity, including **money** as a key resource` | `   - Resource and money needs of the issue (they shape the options, not anyone's weight)` |

## 6. ISR-AI-Weight-Evaluation-Instructions.md, aligned with the current structure

| Line | Find | Replace with |
|---|---|---|
| 16–19 | `The AI should derive these weights from a natural-language issue description, using the **100 example issues** defined in:` + the two bullet lines naming `ISR-Relevance-Weight-Examples-100.md` and `ISR-Issue-Aggregation-Weight-Examples-100.md` | `The AI derives these weights from the issue description and its context, using the **100 example issues** in `ISR-Issue-Analyzer-100-Examples.md` (the first version of the table of typical issues). This document explains how to reason about the weights. `ISR-Issue-Analyzer-Protocol-v1.md` is the governing protocol (steps, output schema, context check, re-analysis) and prevails where the two differ. **Nobody types a number**: the weights are derived, stay inside the typical range of the chosen issue type, and change only when the context is clarified or the public adopts a change (Analyzer protocol, Steps 4A and 4B).` |
| 32 | `  - Location and estimated geographic impact radius` | `  - Location` |
| 33 | `  - Hints about who is affected (e.g., parents of particular children, employees of a company)` | same line, then a new line: `- **Context** (Analyzer protocol, Step 4A): who is affected and where, the local rules and owners that matter, attached sources and later clarifications` |
| 35 | `read and internalized both 100-issue example files.` | `read and internalized the 100-issue example file.` |
| 80 | `#### Step 2: Evaluate each dimension as gating vs. modulating` | `#### Step 2: Evaluate the role of each dimension` |
| 84 | `"Does belonging to a certain demographic or role determine whether someone can be affected at all?"` | `"How strongly does belonging to a certain demographic group or role make someone affected?"` |
| 85 | `   - If yes (e.g., tenant vs non-tenant, parent vs non-parent, chronic patient vs healthy), D is **primary**.` | `   - If strongly (e.g., tenant vs non-tenant, parent vs non-parent, chronic patient vs healthy), D is **primary**. D is a score, never a gate: nobody is excluded by D alone.` |
| 101 | `Use the 100 Relevance examples as concrete anchors` | `Use the 100 examples as concrete anchors` |
| 119 | `3. Compare the resulting pattern with the **closest examples** from the 100-issue list and adjust slightly to stay consistent with existing priors, unless the new issue is genuinely different.` | `3. Compare the result with the **k nearest examples** of the chosen type (Analyzer protocol, Step 4A; k = 5 to start) and keep every weight inside their range. If the issue seems genuinely different, do not leave the range: ask for clarification of the context or propose another type.` |
| 167–168 | `- `w_Relevance + w_Expertise + w_Contribution = 1.0`` + next line `- Each weight ∈ [0.0, 1.0]` | `- `w_Relevance + w_Expertise + w_Contribution = 1.0`` + `- Each weight ∈ (0.0, 1.0)` + `- No weight is zero, and none alone carries the vote: each stays inside the range of the pattern anchor of the chosen type (Analyzer protocol, Section 4.1).` |
| 204 | `- Minor (~0.05–0.20)` | `- Minor (~0.10–0.20; never zero)` |
| 206 | `Use the 100 aggregation examples as anchors.` | `Use the 100 examples as anchors.` |
| 216 | `` `Relevance` ~0.65–0.75, `Expertise` ~0.05–0.20, `Contribution` ~0.15–0.25. `` | `` `Relevance` ~0.65–0.75, `Expertise` ~0.10–0.20, `Contribution` ~0.15–0.25. `` |
| 217 | `` `Relevance` ~0.45–0.60, `Expertise` ~0.25–0.40, `Contribution` ~0.10–0.25. `` | `` `Relevance` ~0.40–0.55, `Expertise` ~0.25–0.40, `Contribution` ~0.15–0.25. `` |
| 225 | `3. Compare to the closest example in the 100-issue aggregation file and keep values within a similar band unless you deliberately want a different pattern.` | `3. Compare with the k nearest examples of the chosen type and keep every value inside their range (Analyzer protocol, Step 4A). Values never leave the range.` |
| 256 | `treat the two 100-issue files as a` | `treat the 100-issue file as a` |
| 260 | `- Then adjust based on specific details` | `- Then adjust, inside the typical range of the type, based on specific details` |
| 327–330 **[decide]** | The whole §6.1 "The Fallback Weights Rule (40% / 30% / 30%)" (heading + 3 bullets) | See text 6-A below |
| 332 | `When in doubt during the custom weight evaluation:` | `When in doubt, within the typical range of the type:` |
| 339 | `designed to work hand-in-hand with the 100 example specifications.` | `designed to work hand-in-hand with `ISR-Issue-Analyzer-Protocol-v1.md` and the 100 examples in `ISR-Issue-Analyzer-100-Examples.md`.` |

**Text 6-A [decide]:**
```
### 6.1 Vague or ambiguous issues
- There is no fallback weight profile. If the description and the context are too vague to choose an issue type, the result is `needs_clarification` (Analyzer protocol, Step 4A): the assistant asks the topic starter to clarify the context. If no consistent type is found, the result is `not_consistent`.
- For every published issue the weights are derived from the chosen type and the context, and stay inside the typical range of that type.
```

**Matching row [decide], ISR-Relevance-Implementation.md, l.234–236:** replace the "Fallback Weights Rule (40% / 30% / 30%)" note (it also cites the missing `ISR-Issue-Aggregation-Weight-Examples-100.md`) with the same two bullets as 6-A.

Why [decide]: the 40/30/30 fallback (contradiction C-21) lets a vague issue be published with weights that come from no type, while Step 4A requires the assistant to ask for clarification. If you keep the fallback, at least change the cited file to `ISR-Issue-Analyzer-100-Examples.md` in both places.

---

# Round 3 (checked against commit e60f342)

Rounds 1–2 are applied in `e60f342`, except the rows below. Author decisions, 2026-11-04: the 40/30/30 fallback is replaced in both places; the reference unit is 1. The "Baseline (1.0)" text is kept: it describes the age floor of the new education formula (Expertise §2.2), not a term added to E.

Generated file: `specs/tasks/A2-generated/ISR-Issue-Analyzer-100-Examples.md` (100 `contemporary_importance` lines deleted, 100 `domain_reasoning` strings shortened; all 100 JSON blocks parse). Copy it over `docs/ISR-Issue-Analyzer-100-Examples.md`.

| Doc | Line | Find | Replace with |
|---|---|---|---|
| AI-Weights | 319 | `## 6. Style, Constraints, and Default Fallback Rules for AI Explanations` | `## 6. Style and Constraints for AI Explanations` |
| AI-Weights | 326–329 | §6.1 heading `### 6.1 The Fallback Weights Rule (40% / 30% / 30%)` and its 3 bullets | text 6-A (round 2) |
| Relevance | 233–236 | `> [!IMPORTANT]` and the 3 quoted lines of "The Fallback Weights Rule" | `> [!IMPORTANT]` + the two bullets of 6-A, each prefixed `> ` |
| Relevance | 226 | `using the 100-issue benchmarks in [ISR-Relevance-Weight-Examples-100.md](…) and [ISR-Issue-Aggregation-Weight-Examples-100.md](…)` | `using the 100 example issues in [ISR-Issue-Analyzer-100-Examples.md](ISR-Issue-Analyzer-100-Examples.md), under [ISR-Issue-Analyzer-Protocol-v1.md](ISR-Issue-Analyzer-Protocol-v1.md)` |
| Contribution | 931 | `$\hat C_u = C_u / (\overline{|C|} + u)$, where $\overline{|C|}$ is the mean absolute Contribution over the members of the ad-hoc public and $u$ is one reference unit of Contribution.` | `$\hat C_i = C_i / (\overline{|C|} + 1)$, where $\overline{|C|}$ is the mean absolute Contribution over the members of the ad-hoc public and 1 is one reference unit of Contribution.` (u was also the member index) |
| Analyzer | 637 | `each weight in [0, 1], each weight group summing to 1.` | `each aggregation weight in (0, 1) and each relevance weight in [0, 1], each weight group summing to 1.` |
| Expertise | 98 vs 64 | `P_education = 7 years (PhD time)` and `E_education = 0.548 × 7 = 3.84` | `P_education = 10 years (PhD time)` and `E_education = 0.548 × 10 = 5.48` (the table says 10) |
| Expertise | 16–19 | depends on the education-floor decision (age, cognitive/physical limitations) | see the chat discussion |

## Round 3, status after the author's update (working tree, 2026-11-04)

Applied: 100-Examples copy, AI-Weights l.319, Relevance l.226, Analyzer l.637.
Still to apply: AI-Weights l.326–329, Relevance l.233–236, Contribution l.931, Expertise l.87–88 (PhD example), and the education age floor (author decision: age/30 only under 30, never below 1 for older people), Expertise l.15–27 and l.49. Exact before/after blocks were given in chat.

## Round 4 (working tree after A–E, 2026-11-04)

A–E are applied. Remaining: the gISR formula still uses `u` (Contribution l.937), and the Expertise worked examples and reference code do not apply the new age floor (Expertise l.93, l.436–439, l.569–588, l.785–846). Exact rows were given in chat. Open: E floor for a member with no `birthDate` (the field is optional in `users`, claude_export/SCHEMA.md:41).
