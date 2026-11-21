# ISR Weight Evaluation Instructions for AI (Relevance & Aggregation)

**2026-11-21 reconciliation:** PD-9 still governs paired multi-reference arithmetic, actual-issue aspect vectors, maximum geography and the single Expertise floor. Repository main b8014ac contains mr1 logic; the new marked-carer/MVP formation policy is a separate implementation proposal, not current runtime or a deployment claim. [Exact flag, cutoff, version and backfill specification](../specs/tasks/X-eligibility-values-reconciliation.md).

**2026-11-21 MVP boundary:** the author retains hard D/G and top-300 direct-candidate selection with UB<Theta pruning. This changes candidate coverage, not paired parameter derivation. The new eligibility flag is profile data, not a model-generated weight or an instruction to infer carers. See the linked implementation proposal before using the new formation policy.

This document defines **instructions for an AI model** on how to evaluate:

1. **Relevance component weights** for an issue:
   - `w_D` – Demographic relevance weight
   - `w_G` – Geographic relevance weight
   - `w_S` – Semantic relevance weight
   - `w_X` – Social graph relevance weight

2. **Issue aggregation weights** for the same issue:
   - `w_Relevance` – Weight of Relevance (how directly affected a user is)
   - `w_Expertise` – Weight of Expertise
   - `w_Contribution` – Weight of Contribution

The AI derives these weights from the issue description and its context, using the **100 example issues** in ISR-Issue-Analyzer-100-Examples.md (the first version of the table of typical issues). ISR-Issue-Analyzer-Protocol-v1.md is the governing protocol and prevails where the two differ. **Nobody types a number**: the weights are derived, follow the deterministic PD-9 reference blend, and change only when the context is clarified or the public adopts a change (Analyzer protocol, Steps 4A and 4B).

These examples provide patterns and anchors; the AI must **generalize** to new issues by following the principles below.

---

## 1. Input the AI Receives

For each issue, the AI will receive at least:

- **Issue description** (free text, may include location, context, impact)
- **Optional metadata** (if available):
  - Suggested or confirmed category (e.g., `building.maintenance.water`)
  - Location
  - Hints about who is affected (e.g., parents of particular children, employees of a company)
- **Context** (Analyzer protocol, Step 4A): who is affected and where, the local rules and owners that matter, attached sources and later clarifications

The AI is assumed to have read and internalized the 100-issue example file.

The AI **must not** assume any specific user’s data; it only designs **weight templates for the issue type**.

---

## 2. Evaluating Relevance Component Weights (w_D, w_G, w_S, w_X)

### 2.1 Conceptual Reminder

For each issue, Relevance for user *i* is computed as:

- `Relevance_i = w_D * D_i + w_G * G_i + w_S * S_i + w_X * X_i`

Where:

- `D_i` – Demographic match score
- `G_i` – Geographic proximity score
- `S_i` – Semantic similarity/interest score
- `X_i` – Social graph relevance score

**Your task is to set the weights** `(w_D, w_G, w_S, w_X)` for a specific issue, before any per-user scores are calculated.

Constraints:

- `w_D + w_G + w_S + w_X = 1.0` (within rounding error ±0.001)
- Each weight ∈ [0.0, 1.0]

### 2.2 Reasoning Steps for Relevance Weights

When designing `(w_D, w_G, w_S, w_X)` for a new issue, follow these steps **internally**, then summarize your reasoning in a short explanation.

#### Step 1: Parse the issue

Extract from the description:

- **What is the object and scope** of the issue?
  - Example patterns from the 100 issues: building-level repair, street-level noise, city-wide budget, digital policy, etc.
- **Who is directly affected?**
  - Tenants, property owners, drivers, students, parents, patients, remote workers, OSS contributors, etc.
- **Where does it happen?**
  - Precise coordinates, building, street, neighborhood, city, online-only.
- **How do people become affected?**
  - By living there, using a service, having a particular health condition, belonging to a group, being related to someone affected.

#### Step 2: Evaluate the role of each dimension

For each dimension D, G, S, X answer:

1. **Demographic (D)** – "How strongly does belonging to a certain demographic group or role make someone affected?"
   - If strongly (e.g., tenant vs non-tenant, parent vs non-parent, chronic patient vs healthy), D is **primary**. D is a score, never a gate: nobody is excluded by D alone.
2. **Geographic (G)** – "Does distance from a specific location sharply limit who is affected?"
   - If the issue is local (building/street/district), G is typically **primary** or **secondary**.
   - If it is global/digital (e.g., OSS governance), G may be **minor** or **irrelevant**.
3. **Semantic (S)** – "Is being affected mostly a matter of interest, expertise, or usage of a certain topic/service, regardless of location?"
   - High for things like online communities, OSS projects, digital privacy policies, domain-specific debates.
4. **Social graph (X)** – "Are people affected primarily because people they care about are affected?"
   - High for family emergencies, school issues where parents are involved, or small groups where relatives/friends carry relevance.

For each dimension, classify it as:

- **Primary** – strongly determines who is affected (weight ~0.35–0.70)
- **Secondary** – materially modulates among already-affected people (weight ~0.15–0.35)
- **Minor** – small adjustment (weight ~0.05–0.15)
- **Irrelevant** – virtually no effect (weight ~0.0–0.05)

Use the 100 examples as concrete anchors for similar patterns. For example:

- Building entrance lock → G and D primary, X secondary, S minor.
- Childcare services → D primary, G secondary, S and X very low.
- Open-source roadmap → S and D primary, G minor, X secondary.

#### Step 3: Compute relevance weights

Apply PD-9 raw-chain selection, context review and alpha over the recorded reviewed set J. More than three raw references triggers review; it does not alone ask the user to reformulate. For each component d, W_d=sum_j alpha_j*w_dj. The qualitative primary/secondary/minor descriptions above explain which references match; they are not instructions to generate or adjust a second weight group. Validate original groups and the resulting sum1. Member D/S/X results remain paired with each source weight; use effective components for the four-component display.

#### Step 4: Produce a short reasoning

Generate a 2–4 sentence explanation that:

- Names which dimensions are primary/secondary/minor.
- Refers to concrete aspects of the issue (who, where, how affected).
- Optionally calls out near neighbors from the 100-issue library (e.g., "similar to a street noise issue").

### 2.3 Expected Output Format (for Relevance weights)

For the Relevance part, the AI should produce a JSON-like structure in its internal output, e.g.:

```json
{
  "relevance_weights": {
    "w_demographic": 0.30,
    "w_geographic": 0.50,
    "w_semantic": 0.05,
    "w_social": 0.15
  },
  "relevance_reasoning": "Residents of the specific building and their close family are directly affected by entrance security, so demographic and geographic factors dominate. Semantic interest in security is minor, while social ties modestly increase relevance for relatives and close friends."
}
```

The actual interface can adapt this structure, but the **conceptual fields** must exist.

---

## 3. Evaluating Aggregation Weights (w_Relevance, w_Expertise, w_Contribution)

### 3.1 Conceptual Reminder

In ISR, each participant has multiple scores:

- **Relevance** – how directly they are affected by this issue.
- **Expertise** – their knowledge/skill relevant to solving this issue.
- **Contribution** – their track record of constructive participation and follow-through in ISR.

For a given issue, the AI must set how these components are weighted when aggregating votes or opinions for that issue:

- `w_Relevance` – importance of direct impact
- `w_Expertise` – importance of knowledge/competence
- `w_Contribution` – importance of reliability/cooperation

Constraints:

- `w_Relevance + w_Expertise + w_Contribution = 1.0`
- Each weight ∈ (0.0, 1.0)
- No weight is zero, and none alone carries the vote: each stays inside the range of the pattern anchor of the chosen type (Analyzer protocol, Section 4.1)

### 3.2 Reasoning Steps for Aggregation Weights

#### Step 1: Identify the nature of the decision

Ask:

1. **Is this a direct-experience decision?**
   - Example: noise in a building, local trash schedule, playground condition.
   - If yes, **Relevance** should dominate.

2. **Is this a technical/complex decision?**
   - Example: zoning, city budget, health policies, digital privacy policy.
   - If yes, **Expertise** should be high or co-dominant.

3. **Is this a recurring governance/coordination decision where reliability matters a lot?**
   - Example: platform rules, mutual aid rules, volunteer onboarding, festival governance.
   - If yes, **Contribution** should be fairly high.

4. **Is the decision highly sensitive (safety, rights, vulnerable groups)?**
   - Safety incidents, emergencies, identity/religious visibility.
   - This usually boosts both Relevance (for affected groups) and Expertise (for safe design), with Contribution depending on how much ongoing stewardship is needed.

#### Step 2: Classify each axis as primary/secondary/minor

For each axis:

- **Relevance** – Are directly affected people the main legitimate deciders? Or is their experience one of several inputs?
- **Expertise** – Would poor decisions from non-experts cause serious harm, inefficiency, or illegality?
- **Contribution** – Does this decision benefit from prioritizing people with **proven constructive ISR behavior** in this domain or community?

Classify each as:

- Primary (~0.45–0.70)
- Secondary (~0.20–0.35)
- Minor (~0.10–0.20; never zero)

Use the 100 examples as anchors. For instance:

- Mold in stairwells → Relevance primary, Expertise secondary, Contribution minor.
- Zoning decisions → Expertise and Relevance both strong, Contribution moderate.
- Mutual aid rules → Relevance and Contribution strong; Expertise smaller.
- Platform rules → Relevance moderate, Expertise and Contribution both important.

#### Step 3: Compute ISR aggregation weights

For c in R/E/C, B_c=sum_j alpha_j*b_cj. Use the same reference alpha, no free up/down adjustments. Valid positive source groups yield a positive sum-one blend. Education and Experience have no separate component weights. Form one public from final R, then normalize combined R/E over that public before the additive ISR calculation.

#### Step 4: Produce a short reasoning

Generate a 2–4 sentence explanation that:

- States which axis (Relevance, Expertise, Contribution) is primary and why.
- References the nature of the decision (local vs city-wide, technical vs experiential, one-off vs recurring).
- Optionally compares to similar issues in the 100-example set.

### 3.3 Expected Output Format (for Aggregation weights)

For the aggregation part, the AI should produce something like:

```json
{
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.20,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Parents of young children are directly impacted by childcare availability, so relevance should dominate. Expertise in early childhood education and operations matters, but is secondary. Contribution recognizes parents and organizers who have a track record of sustaining childcare initiatives."
}
```

The exact structure can be adapted, but the meaning of fields must be preserved.

---

## 4. Using the 100 Issue Examples as Guidance

The AI should treat the 100-issue file as a **library of patterns**:

- For each new issue, find the **closest analogues** by category and description.
- Use those examples as the numeric inputs for both Relevance weights `(w_D, w_G, w_S, w_X)` and Aggregation weights `(w_Relevance, w_Expertise, w_Contribution)`.
- Use actual context to validate references and instantiate demographic/aspect/authority rules. No numeric adjustment after the recorded blend; mu and sigma use maxima among compatible references.

In practice:

1. Map the new issue’s category into one or more of the following domains:
   - Building & housing
   - Public infrastructure & mobility
   - Health & social services
   - Education & youth
   - Social events & culture
   - Religion & identity
   - Charity & volunteering
   - Work modes & labor (offline/remote/gig)
   - Digital platforms & open source
   - Governance & politics (budget, zoning, elections, rules)

2. Within that domain, identify 2–5 example issues whose structure is similar:
   - E.g., local noise → use street noise + building noise.
   - Digital policy for an app → use local app privacy + political forum rules.

3. Use their weights as starting points and adjust for:
   - **Scale** (building vs city vs online global)
   - **Stakeholder type** (children, vulnerable groups, professionals)
   - **Technicality** (simple fix vs complex policy)
   - **Recurrence** (one-off decision vs ongoing governance).

---

## 5. Combined Output Structure for a Single Issue

When asked to analyze **one issue description**, the AI should ideally output both weight sets together, for example:

```json
{
  "issue_category": "building.security.locks",

  "relevance_weights": {
    "w_demographic": 0.30,
    "w_geographic": 0.50,
    "w_semantic": 0.05,
    "w_social": 0.15
  },
  "relevance_reasoning": "Residents of the specific building and their close family are directly affected by entrance security, so demographic and geographic factors dominate. Semantic interest in security is minor, while social ties modestly increase relevance for relatives and close friends.",

  "aggregation_weights": {
    "w_relevance": 0.70,
    "w_expertise": 0.10,
    "w_contribution": 0.20
  },
  "aggregation_reasoning": "This is a concrete security problem that directly affects residents; their lived impact should dominate decisions. Some weight goes to Contribution because reliable neighbors handling building issues repeatedly should have slightly more influence, while specialized security expertise is useful but not central."
}
```

The precise serialization can vary (JSON, structured text, etc.), but **all four components and both reasonings must be present**:

1. Relevance component weights + reasoning
2. Aggregation weights + reasoning

---

## 6. Style and Constraints for AI Explanations

- Explanations must be **concise** (2–4 sentences per reasoning field).
- They must refer to **concrete aspects** of the issue: who is affected, where, and how.
- They must **not** mention internal prompts or training files by name (no references like “as in example 34” in user-facing text).
- They must be stable and auditable: given the same description, the AI should produce very similar weights and reasoning each time.

### 6.1 Vague or ambiguous issues
- There is no fallback weight profile. If the description and the context are too vague to choose an issue type, the result is `needs_clarification` (Analyzer protocol, Step 4A): the assistant asks the topic starter to clarify the context. If no consistent type is found, the result is `not_consistent`.
- For every published issue the weights are derived from the chosen type and the context, and follow PD-9.

When reference applicability is uncertain, request clarification. The following qualitative guidance explains reference interpretation, not permission to alter the computed blend:
- Default to **higher Relevance** in local, lived-experience issues.
- Default to **higher Expertise** when decisions are technical, legal, or safety-critical.
- Default to **higher Contribution** when the issue is about **ongoing governance, coordination, or community norms** where reliability matters over time.

---

This instruction set is designed to work hand-in-hand with `ISR-Issue-Analyzer-Protocol-v1.md` and the 100 examples in `ISR-Issue-Analyzer-100-Examples.md`. The examples define **what typical weights look like**; these rules define **how to think** about new issues in a consistent, ISR-aligned way.
