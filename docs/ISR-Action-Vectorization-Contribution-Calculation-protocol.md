# ISR Action Vectorization & Contribution Calculation Protocol v1.0

**Designed for**: ISR Project – Community Values to Action Alignment Assessment

**Purpose**: Convert community actions description (tasks, messages, decisions) into structured vectors that can be compared with an ad-hoc public’s Vector of Values, and then transformed into Contribution scores combining value alignment, psychological impact, and action magnitude.

---

## PART I: CONCEPTUAL FRAMEWORK

### 1.1 Action vs. Values: The Fundamental Distinction

| Aspect | Vector of Values | Action Vector |
|--------|------------------|---------------|
| **What it represents** | STATED IDEALS: what the ad-hoc public says it values | OBSERVED BEHAVIOR: what a person actually does in a concrete situation |
| **Domains (items) scoring** | [0–100] – no negative values (cannot “value −80 justice”) | [−100..100] – action can be directed strongly for or against a value |
| **Source of truth** | Self‑reported narratives, surveys, and assisted onboarding | Externally observable contributions (tasks, messages, decisions, logged events) |
| **Null meaning** | “We have no opinion about this domain (item)” | “This action does not address this domain (item)” |
| **Temporal orientation** | Future‑oriented: vision of the “Future We Want” | Past‑focused: assessment of what actually happened in a specific action |
| **Modification frequency** | Stable across weeks/months; refined slowly | Changes per action (every task, message, decision can have its own vector) |
| **Conflict Resolution Weights (CR)** | Preferences: how the community prefers to resolve value conflicts in general when both sides are valued | Trade‑offs: in this action context, which values were in conflict and which side actually won, with what imbalance |
| **Contextual Shifts (CS)** | Assessment correction map: how domains become more/less important in pure work/family/private/crisis contexts | Completeness of context application: for this action, how strongly each context (work, family, private, crisis) applies (0–100) |
| **Calculation time** | When an ad-hoc public is formed or its values are updated | After an issue is closed and the ad-hoc public around it is dismissed. Later, Action Force and Result can be corrected by new outcome records and ratings. |
| **Force** | N/A – only direction (values intensities and conflict/context preferences) | Non‑negative scalar showing the action’s magnitude for the community: based on action type, time spent, complexity for the actor, and success of results |
| **Sentiment** | N/A - it is assumed that all ad-hoc publics share the same sentiment values | Normalized sentiment marks array `[good, funny, flood, rude, foolish]`, each value [0.0–1.0] = (number of marks in category) ÷ (number of ad-hoc public members) |

**Saying versus doing.** How a person votes is not scored (a vote has Force zero). Messages and proposed options are scored as actions, with a smaller Force than tasks (Section 5: Vote Message 0.4, Task Message 0.3, Chat Message 0.1). A person's declared values are not judged. An action is scored by what it *does* to the values of the public, not by whether its author's opinion matches the majority's. A respectful, well-argued dissent advances values such as honest expression, cooperation and respect, and can score positive even when its position differs from the majority's. An action that works against a value (harms, deceives, excludes, obstructs) scores negative against the publics that hold that value.

---

### 1.2 Why Conflict Resolution & Contextual Shifts Are DESCRIPTORS OF THE ACTION SITUATION

**Key insight**: CR and CS in an Action Vector do not describe stable personal traits; they describe how this particular action navigated a concrete situation. Every action must be interpreted in its situational context: the issue that started it, previous messages, community state, and other concurrent actions. Different ad-hoc publics’ Vectors of Values then act as different filters applied to the same action context.

#### 1.2.1 Conflict Resolution Weights in Action Context

- **Values Vector CR weights** represent:  
  “When both sides are generally valued, which side does the community prefer when they come into conflict?”
- **Action Vector CR weights** represent:  
  “In this specific action context, which value conflicts were actually present, and how unequal were their stakes?”

Example:

- **VoV CR.1** (Individual Freedom [65] vs Collective Harmony [75]) = 80.  
  Interpretation: both are valued, but when there is a clear conflict, this ad-hoc public tends to prefer Collective Harmony.

- **Action CR.1** in a concrete situation:
  - If no substantial freedom‑vs‑harmony tension occurred → CR.1 = null.
  - If the context shows significant freedom limitation for little harmony gain → CR.1 in [10–30].
  - If the context shows large harmony gain for small freedom restriction → CR.1 in [70–90].
  - If both sides are equally at stake, or supremacy cannot be clearly read → CR.1 in [40–60].

**Computational meaning**:  
For conflicts present in both the Values Vector and the Action Vector, CR weights are used to adjust both sides’ domain scores away from a neutral 50 midpoint, reflecting how the situation and the community’s general preference interact.

Simplified example (two domains and a conflict described by CR.1 between them):

- Action raw scores:  
  Individual Freedom = 30, Collective Harmony = 80, Action CR.1 = 80.  
  CR.1 = 80 implies that in this situation, Collective Harmony could be increased significantly at relatively small cost to Individual Freedom.

Consider three ad-hoc publics:

1. **VoV₁**: Individual Freedom = 65, Collective Harmony = 75, CR.1 = 55  
   → mild preference for Collective Harmony.

   - VoV₁ CR.1=55 shifts Action: Freedom 30−5=25; Harmony 80+5=85.  
   - Action CR.1=80 shifts VoV₁: Freedom 65−30=35; Harmony 75+30=100.  
   - Corrected vectors: Action₁ = [25, 85], VoV₁ = [35, 100].  
   - Cosine(Action₁, VoV₁) ≈ 0.99 (excellent situational alignment).

2. **VoV₂**: Individual Freedom = 70, Collective Harmony = 85, CR.1 = 80  
   → strong preference for Collective Harmony.

   - VoV₂ CR.1=80 shifts Action: Freedom 30−30=0; Harmony 80+30=100.  
   - Action CR.1=80 shifts VoV₂: Freedom 70−30=40; Harmony 85+30=100.  
   - Corrected vectors: Action₂ = [0, 100], VoV₂ = [40, 100].  
   - Cosine(Action₂, VoV₂) ≈ 0.92.

3. **VoV₃**: Individual Freedom = 90, Collective Harmony = 60, CR.1 = 15  
   → strong preference for Individual Freedom.

   - VoV₃ CR.1=15 shifts Action: Freedom 30+35=65; Harmony 80−35=45.  
   - Action CR.1=80 shifts VoV₃: Freedom 90−30=60; Harmony 60+30=90.  
   - Corrected vectors: Action₃ = [65, 45], VoV₃ = [60, 90].  
   - Cosine(Action₃, VoV₃) ≈ 0.78 (weaker alignment).

Domain and item scores encode the outcome of the conflict (which values were raised or lowered), and the action’s CR weight encodes that this conflict was present and how unequal the stakes were; together with the community’s CR in the Values Vector, this determines how the situation is interpreted for alignment.

#### 1.2.2 Contextual Shifts in Action Context

- **Values Vector CS** represents:  
  “In pure work / family / private / crisis contexts, how does the importance of each domain shift for our ad-hoc public?”
- **Action Vector CS** represents:  
  “In this action, which contexts were active, and how purely can each context be applied?”

Example:

- Values Vector “work” shifts:  
  `[+10, 0, +10, 0, 0, +10, +10, 0, 0, −20]`  
  → Agency and Security somewhat more important at work; Digital somewhat less.

- Action “work context application” = 30:  
  → work context applies at 0.3 strength.  
  → apply these shifts to domains with factor 0.3.  
  → if work context = 0 (not present) → no work shift applied.

**Computational meaning**:  
CS allows value expectations to be adjusted when comparing an action to the community’s Vector of Values, based on how “work‑like”, “family‑like”, “private”, or “crisis‑like” the situation is.

---

### 1.3 Null Value Philosophy: Mutual Silence ≠ Disagreement

**Core sociological principle**:  
In comparative value analysis, absence of signal in one vector must not be treated as opposition in the other.

Example of an error to avoid:

```text
Action involves NO discussion of Agency & Freedom (domain = null)
Community Values Agency & Freedom very highly (domain = 95)

WRONG: "Action fails Agency & Freedom test"
RIGHT: "Agency & Freedom was not relevant to this action; skip comparison"
```

**Rule**:

- Skip a dimension if: `action_domain IS NULL OR community_domain IS NULL`.
- Only compare dimensions where both have non‑null, grounded signals.

**Why this matters**:

- Prevents conflating inaction or irrelevance with opposition.
- Recognizes that many actions legitimately touch only a subset of domains.
- Avoids Type I errors (false positives of misalignment).

---

### 1.4 Action Force: Scalar Value of the Action

Action Force is a non‑negative scalar that represents the magnitude of an action for the community, independent of whether the action was value‑aligned or misaligned. Alignment is handled at the vector level; Force answers “how big/effective was this action for this actor and task?”

**Core principles**:

1. There must be an absolute scale of Action Force so actions from different times and circumstances can be compared.
2. An action record of performing the same job in two hours should carry roughly twice the Force as the same job in one hour, all else equal.
3. Force is calculated from action **Type**, **Time**, **Complexity**, and **Result**.
4. Force is initially calculated once the issue is closed but can be updated if new outcomes or corrections are added.

$$Force = Type \times Time \times Complexity \times Result$$

#### 1.4.1 Action Types (Type factor)

Given equal Time, Complexity, and Result, some channels of activity are more structurally significant than others. Voting choices themselves are not rewarded or punished; expression and implementation are.

| Type | Description | Base significance (Type) |
|------|-------------|--------------------------|
| **Task** | Concrete task assigned to and completed by a user. | 1.0 |
| **Vote Message** | Message posted in a voting context (arguments, explanations). | 0.4 |
| **Task Message** | Message in a task context (coordination, reporting, clarification). | 0.3 |
| **Chat Message** | General chat message not bound to a specific task or vote. | 0.1 |
| **Correction entry** | Added by the decision of a dispute issue about an earlier action (Section 7.5). It carries no Force of its own: it revises the Result of that action and may attach a note. The earlier action stays in the ledger. | none |

Pure votes (ballot selections) are stored but have Force = 0 for Contribution: in ISR there are no “good” or “bad” decision outcomes at the individual vote level; only the quality of expressed arguments and concrete actions affect Contribution.

#### 1.4.2 Action Time

Time is measured in hours spent on an action, based on:

- Explicit logging (start/end or person‑hours on a task), or
- AI estimation from the action description and context (default if not specified).

#### 1.4.3 Action Complexity

Complexity measures how difficult the action is for the person performing it, relative to what is normally required.

Let:

- $Experience_{\text{normal}}$ = experience level normally needed to perform this action, estimated from the action description and context.
- $Experience_{\text{person}}$ = actor’s actual experience level in that task domain, inferred from profile (education, work, past tasks).
- $Experience_{\text{min}}$ = minimal valid experience level the system considers sufficient to attempt such an action, also estimated from context.

Then:

$$Complexity = \frac{Experience_{\mathrm{normal}}}{\max(Experience_{\mathrm{person}},\ Experience_{\mathrm{min}})}$$

Interpretation:

- If the actor has less experience than normally required, Complexity > 1 (action is harder than usual for them).
- If the actor has more experience, Complexity < 1 (routine action).
- The denominator is never below $Experience_{\text{min}}$, so Complexity remains finite even for low‑experience actors.

Extreme Complexity values raise an alert and must be explained by the actor or approved by other ad-hoc public members.

#### 1.4.4 Action Result

Result measures the success of the action relative to its intended outcome.

- Initial Result is estimated by AI from:
  - Comparison of planned vs. actual descriptions in the task and related discussion.
  - Available outcome metrics or logs.
- After issue closure, ad-hoc public members can rate the action’s result; ratings are aggregated into Result, weighted by individual ISR scores for that issue.
- Over time, if new evidence appears (e.g., long‑term outcome was better or worse), Result can be corrected.
- Result is unbounded above; extremely high or low values raise an alert and must be explained by the actor or approved by other members.

---

### 1.5 Sentiment Analysis

Sentiment captures the perceived psychological and communicative impact of an action within the ad-hoc public, independent of its structural value alignment.

Mechanism:

- Ad-hoc public members can mark an action with any combination of:
  - `good`, `funny`, `flood`, `rude`, `foolish`.
- Members may apply more than one tag to the same action if appropriate.
- Over time, members can change or remove their marks as their view of the action evolves.
- For each action, a sentiment vector is computed as:

$$marks = [good,\ funny,\ flood,\ rude,\ foolish]$$

where each entry is:

$$mark = \frac{\text{number of marks in this category}}{\text{number of ad-hoc public members}}$$

Sentiment coefficients:

| Sentiment | Description | Coefficient |
|----------|-------------|-------------|
| **Good** | “I agree with this action in this situation. It leads to the solution of the problem” | +1.0 |
| **Funny** | “This was a smart, context‑appropriate joke regarding the circumstances.” | +0.4 |
| **Flood** | “This is irrelevant to the situation and distracts from the problem.” | −0.3 |
| **Rude** | “This was inappropriately rude – nothing in the context or previous steps demanded it.” | −0.5 |
| **Foolish** | “This was stupid and completely counterproductive.” | −1.0 |

**Important point**: Marks must be applied *considering the context of the action*.

- If a user posts a joke that helps to see the problem in a new light, explains it better, or discharges the tension, it should be marked as “funny” and often also “good”.
- If the user posts the same joke without any reason just to fill the space and get some attention, it can be marked as “flood”.
- If the same joke hurts somebody without any provocation it can be marked as “rude”.
- If the same joke is posted inappropriately in a serious discussion when members really look for a solution, it can be marked as “foolish”.

Sentiment scalar:

$$M = \sum_{marks} (mark \times coefficient_{mark})$$

Sentiment can be positive or negative and, by design, is as powerful as value alignment in Contribution.

For later Contribution Score calculation of an action, cosine similarity of the Action and the ad-hoc public’s Vector of Values multiplied by the Action Force adds to the Sentiment multiplied by the Action Force:

$$c = \cos(\vec{Action}, \vec{Values}) \times Force + M \times Force$$

So sentiment shows the action’s psychological impact on the ad-hoc public; it can be both positive and negative.

---

## PART II: ACTION VECTOR ARCHITECTURE

### 2.1 Complete Action Vector Structure

```json
{
  "meta": {
    "action_id": "uuid-or-hash",                  // Unique identifier
    "timestamp": "ISO-8601",                      // When action occurred
    "action_type": "task|vote_msg|task_msg|chat_msg|vote",
    "actor_uid": "<uid>",                         // Who performed the action
    "issue_id": "<issue_id>",                     // Issue this action belongs to
    "overall_confidence": 0-100,                    // Overall confidence in scoring
    "evidence_quality": 0-100,                      // Overall signal clarity
    "vector_version": "1.0",
    "hash": "SHA1_of_action_text_and_metadata"
  },

  "action_content": {
    "domains": [a1, a2, ..., a10],                  // 10 Ints in [-100..100] or null
    "items": [                                      // 145 items in total, grouped per domain
      [i_1_1_1_a, ..., i_1_4_2_b],                   // 18 or null
      [i_2_1_1_a, ..., i_2_3_2_c],                   // 17 or null
      [i_3_1_1_a, ..., i_3_2_2_b],                   // 8 or null
      [i_4_1_1_a, ..., i_4_3_2_c],                   // 18 or null
      [i_5_1_1_a, ..., i_5_2_1_c],                   // 6 or null
      [i_6_1_1_a, ..., i_6_2_1_c],                   // 6 or null
      [i_7_1_1_a, ..., i_7_3_2_c],                   // 21 or null
      [i_8_1_1_a, ..., i_8_3_2_c],                   // 18 or null
      [i_9_1_1_a, ..., i_9_2_1_c],                   // 6 or null
      [i_10_1_1_a, ..., i_10_3_3_c]                  // 27 or null
    ]
  },

  "action_context": {
    "conflict_resolution": [CR_01, ..., CR_36],     // 36 Ints in [0..100] or null
    "contextual_shifts": {                          // How strongly each context applies
      "work": 0-100,
      "family": 0-100,
      "private": 0-100,
      "crisis": 0-100
    }
  },

  "confidence_metadata": {
    "domains_confidence": [c_1, ..., c_10],         // Per-domain confidence [0..100]
    "domains_grounding": [g_1, ..., g_10],          // Evidence quality [0..40]
    "domains_reasoning": [r_1, ..., r_10],          // Why each domain scored as it did
    "conflicts_reasoning": [r_cr1, ..., r_cr36]     // Why conflicts scored as they did
  },

  "force": <float>,                                 // Type × Time × Complexity × Result
  "sentiment_scalar": <float>                       // Sum(mark * coefficient)
}
```

---

## PART III: ACTION VECTORIZATION WORKFLOW

### 3.1 Overview

Vectorization follows four stages:

1. **Context Detection** – which contexts apply (work, family, private, crisis)?
2. **Domain & Conflict Detection** – which value domains and conflicts are engaged?
3. **Item Evaluation (Conditional)** – if needed (if domain is not null), get item‑level detail.
4. **Magnitude & Sentiment** – compute Force and sentiment from type, time, complexity, result, and marks.

All stages can be automated using LLM prompts plus deterministic logic.

### 3.2 Step 0 – Context Detection

Inputs:

- Action text and its context (issue, location, participants, previous actions in the issue).
- Actor profile where helpful.

Output:

- `context_detected`: subset of `["work","family","private","crisis"]`.
- `action_context.contextual_shifts`: context application strengths [0–100] per context.

Mechanism (high level):

- Use an LLM classifier to assign each context a strength:
  - 0: not present,
  - 1–33: slight context,
  - 34–66: mixed,
  - 67–100: dominant context.

### 3.3 Step 1 – Domain & Conflict Detection

Inputs:

- Action text (with context).
- ISR Values Taxonomy domain definitions.

For each of 10 domains:

- Decide whether it is engaged:
  - Null: not addressed.
  - Non‑null: assign a score in [−100..100] (negative = anti‑value).
- Assign `domains_confidence` [0..100] and `domains_grounding` [0..40].
- Store reasoning snippet.

For each of 36 conflicts:

- Decide whether corresponding value tension appears:
  - Null: no conflict evidence.
  - Non‑null: assign CR weight [0..100], plus confidence and reasoning.

Outputs:

- `action_content.domains`
- `action_context.conflict_resolution`
- `confidence_metadata.domains_confidence`, `domains_grounding`, and reasoning.

### 3.4 Step 2 – Conditional Item Evaluation

- If a domain is null → its items array is null.
- If `domains_confidence` is high and |domain_score| is large → items can be set to domain_score ± small noise.
- Otherwise:
  - Use item‑specific LLM prompts to score items [−100..100].
  - Ensure item means approximate domain score.

Output:

- `action_content.items` with item‑level vectors or null per domain.

### 3.5 Step 3 – Magnitude & Sentiment

- **Type**: from `action_type` (Task, Vote Message, Task Message, Chat Message, or Vote with Type = 0).
- **Time**: logged or LLM‑estimated hours.
- **Complexity**: computed as in 1.4.3 and flagged if extreme.
- **Result**: AI baseline, then community‑weighted ratings.
- **Force**: `force = type × time_hours × complexity × result`.
- **Marks**: updated continuously as members mark actions.
- **Sentiment scalar**: `sentiment_scalar = Σ mark × coefficient`.

---

## PART IV: ACTION–VALUES ALIGNMENT AND CONTRIBUTION

### 4.1 Cosine Alignment $\cos(\vec{Action}, \vec{Values})$

To compare an action with an ad-hoc public’s Vector of Values:

1. Start from `action_content.domains` and `VoV.core_values.domains`.
2. Apply conflict resolution (CR) and contextual shifts (CS) as in 1.2.
3. Restrict to indices where both action and VoV domains are non‑null (mutual‑null‑skip rule).
4. Normalize both vectors and compute cosine similarity:

$$A = \cos(\vec{Action}, \vec{Values}_{mv}) \in [-1, 1].$$

### 4.2 Marks Scalar (M)

*(The stored field is still named `sentiment_scalar`; the symbol is M.)*

As in 1.5:

$$M = \sum_{marks} (mark \times coefficient_{mark}).$$

### 4.3 Action Contribution to an Ad-Hoc Public

For a given action and ad-hoc public:

$$c = \cos(\vec{Action}, \vec{Values}) \times Force + M \times Force.$$

Equivalently:

$$c = (A + M) \times Force.$$

A member’s total Contribution to that ad-hoc public is the sum of Contributions of all their actions.

Contribution is absolute and can be negative, positive, or near zero; it is not re‑normalized when new members or new actions are added.

### 4.4 Alignment across publics

**The record is a ledger in front of the whole community.** An ad-hoc public exists for one issue, so a record cannot belong to one public. The record is the person's credit and debit in front of the whole community, earned through many publics, each of which can value an action in its own way. It is read on demand for each public with that public's Vector of Values (Section 8.1); for the rules and for access it is read with the Vector of Values of all registered users (gISR). The same ledger can therefore give a different Contribution in a different reading.

**What changes and what does not.**

- Vectors of Values are non-negative (Section 1.1): a public's vector can emphasise or neglect a value but never oppose it.
- An action's alignment is negative only if the action lowers values that the public holds more strongly than the values it raises. A change of sign between two publics requires that they emphasise different values and that the action lowers one set while raising the other.
- Sentiment marks belong to the action: they are the valuation of the public that saw it. They are not re-scored, and they travel with the action in every reading of the ledger.
- A strongly negative total Contribution comes from actions that work against values or from strongly negative marks. It does not come from membership as such.
- Force is non-negative. A poor result lowers the size of the contribution (it makes the Force small); it does not change its sign.

**Measurement note.** How much a person's Contribution changes between publics, and how often an action's alignment changes sign, depend on how the publics' vectors differ in practice. Deployments should report the distribution of pairwise similarities between publics' vectors and the share of actions whose alignment changes sign between publics.

---

## PART V: DATA STORAGE MODEL FOR ACTIONS, ACTION VECTORS AND CONTRIBUTION

### 5.1 Principles of Separation

1. **Single-issue / ad-hoc public scope**  
   Each action belongs to exactly **one issue** and its corresponding **ad-hoc public**. An action may even *start* an issue by being its first entry, but it is never shared across multiple ad-hoc publics.

2. **Issue-centric vs user-centric data**  
   - **Issue / ad-hoc public part** stores the *raw action record and its social life* inside the issue: description, attachments, status, results narrative, marks, and timestamps.
   - **User part** stores the *vectorized representation* of the action for the actor: domains, items, CR/CS, Force, marks scalar, and derived metrics used frequently in Contribution computations.

3. **Contribution locality**  
   - Contribution is always defined **relative to an ad-hoc public** (via its Vector of Values), but for implementation it is stored as an **absolute scalar** in the *current ad-hoc public members table (`microcommunity_members`)* and only normalized later when computing final ISR scores.

4. **Overwrite semantics**  
   - When Action Force, Result, or vectorization changes, the action’s vector in the user part is **hard-overwritten**; historical audit/versioning can be added later but is not required in the base protocol.

### 5.2 issue_actions Collection

Each document in the `issue_actions` collection stores the raw contextual and social details of an action.

- **Document ID**: Unique `action_id` (String)
- **Schema**:
```json
{
  "action_id": "uuid-string",
  "issue_id": "issue-uuid-string",
  "actor_uid": "user-uuid-string",
  "action_type": "task|vote_msg|task_msg|chat_msg|vote",
  "created_at": "Timestamp",
  "updated_at": "Timestamp",
  "action_text": "String",
  "attachments": [], // file links, media, etc.
  "planned_result": "String (optional)",
  "actual_result": "String (optional)",
  "ai_result_estimate": 0.8,
  "community_result": 0.85,
  "marks_good": 0,
  "marks_funny": 0,
  "marks_flood": 0,
  "marks_rude": 0,
  "marks_foolish": 0,
  "marks_total_members": 0,
  "is_deleted": false,
  "is_edited": false,
  "edit_history": {}
}
```

Notes:

- `marks_*` store **raw counts**; normalized marks `[0..1]` for sentiment are computed as: count ÷ `marks_total_members`.
- This table is used for UI, history, and delayed evaluations (Result corrections, mark changes), not for frequent Contribution computations.

### 5.3 user_action_vectors Collection

Each document in `user_action_vectors` stores the high-dimensional vector representations and derived contribution metrics.

- **Document ID**: Unique `action_id` (String, 1:1 with `issue_actions`)
- **Schema**:
```json
{
  "action_id": "uuid-string",
  "actor_uid": "user-uuid-string",
  "issue_id": "issue-uuid-string",
  
  // Vector content (compressed representation)
  "domains": [0, -10, 20, null, null, null, null, null, null, null], // 10 values in [-100..100] or null
  "items": [], // nested arrays of items or null
  "conflict_resolution": [], // 36 conflict resolution values in [0..100] or null
  "contextual_shifts": {
    "work": 0,
    "family": 0,
    "private": 0,
    "crisis": 0
  },
  
  // Magnitude and sentiment
  "force": 1.25, // Type × Time × Complexity × Result
  "type_weight": 1.0,
  "time_hours": 2.0,
  "complexity": 1.0,
  "result_factor": 0.625,
  "marks": [0.8, 0.0, 0.0, 0.0, 0.0], // normalized [0..1]: good, funny, flood, rude, foolish
  "sentiment_scalar": 0.8,
  
  // Confidence and reasoning (optional but recommended)
  "domains_confidence": [80, 85, 90, null, null, null, null, null, null, null],
  "domains_grounding": [30, 35, 40, null, null, null, null, null, null, null],
  "reasoning": {},
  
  "vector_version": "1.0",
  "updated_at": "Timestamp"
}
```

Notes:

- This table is the main source for Contribution calculations, analytics, and any cross-issue/user research.
- When re-vectorization occurs, the row is **overwritten** (possibly with a bumped `vector_version`).

### 5.4 absolute_contribution in microcommunity_members Collection

Contribution is defined per **member × issue** and is stored as an absolute scalar inside the `microcommunity_members` document.

- **Document ID**: `${microcommunity_id}_${user_id}`
- **Relevant Fields**:
```json
{
  "microcommunity_id": "mc-uuid-string",
  "user_id": "user-uuid-string",
  "absolute_contribution": 0.0,
  
  // Other fields from relevance and expertise engines
  "displayName": "Mio Watanabe",
  "relevance_score": 0.95,
  "expertise_score": 34.01
}
```

- `absolute_contribution` aggregates all action Contributions for this member in this issue:

  ```text
  absolute_contribution = Σ_over_member_actions_in_issue Contribution(action, issue)
  ```

- Normalization for the final ISR-score (by the mean absolute Contribution plus one reference unit, Section 8.5) happens in the **ISR core**, not in this protocol.

---

## PART VI: ACTIONS VECTORIZATION PROTOCOL FOR CLOSED ISSUES

This part describes the **batch vectorization pipeline** executed after an issue is closed. Its goals:

- Ensure all actions are evaluated under a **shared, explicit context**.
- Maintain high vectorization quality even for large, complex issues with many heterogeneous actions.
- Provide ready-to-use prompts for Google AI Studio / Gemini / Perplexity models, with placeholders.

### 6.1 High-level Workflow

For a closed issue `issue_id`:

1. **Context Synthesis** – build a single, shared `IssueContext` summary.
2. **Scope & Batch Strategy Analysis** – analyze action volume and structure to choose vectorization strategy.
3. **Batch Vectorization** – run LLM prompts in batches to produce user_action_vectors for all actions.

### 6.2 Step 1 – Issue Context Synthesis (Internal LLM Step)

**Goal**: Create an internal `IssueContext` object used as context for all subsequent action prompts, so that domain scores, CR, CS, and Result are evaluated coherently.

**Input data** (from DB and services):

- Issue metadata: title, description, tags, ad-hoc public size, time span.
- Key system events: creation time, closure reason.
- Aggregated data: most frequent domains from prior runs (if any), main conflicts, and outcomes.
- Sample of representative actions (e.g., first N actions, last N actions, some mid-issue actions).

**Target JSON structure**:

```json
IssueContext = {
  "issue_id": <issue_id>,
  "title": "...",
  "problem_statement": "...",           // core problem in 2–4 sentences
  "key_subproblems": ["...", "..."],   // optional list
  "dominant_contexts": ["work", "crisis"],
  "main_value_domains": [2, 3, 7],      // indices of most engaged domains
  "main_conflicts": [1, 27],            // indices of CR pairs often present
  "resolution_summary": "...",         // what was decided / done overall
  "timeline_notes": "..."              // short outline of major phases
}
```

**Prompt template (Google AI Studio / Gemini / Perplexity)**:

_System prompt (pseudocode):_

```text
You are an expert sociological analyst working for the ISR (Index of Social Responsibility) system.
Your task is to read the description and key samples of an ISSUE and produce a concise JSON summary
called IssueContext. This summary will be reused to evaluate many individual actions, so it must
capture the overall problem, dominant contexts, main value domains, and value conflicts.

Follow the JSON schema provided strictly.
```

_User prompt (placeholders):_

```text
ISSUE METADATA:
- ID: {{issue_id}}
- Title: {{issue_title}}
- Description: {{issue_description}}
- Tags: {{issue_tags}}
- Ad-hoc public size: {{member_count}}
- Time span: {{start_ts}} to {{end_ts}}

SAMPLE ACTIONS (truncated as needed):
{{sampled_actions_block}}

OUTPUT JSON ONLY in the following format:
{ ...IssueContext as per schema... }
```

The output is stored as `IssueContext` in a dedicated table or cache and passed to subsequent prompts.

### 6.3 Step 2 – Scope & Batch Strategy Analysis

**Goal**: Decide how to process actions efficiently and with adequate granularity.

**Inputs**:

- `IssueContext` from Step 1.
- Count of actions by type: tasks, vote messages, task messages, chat messages, votes.
- Budget and latency constraints (configurable per deployment).

**Heuristic strategy (example)**:

- If total actions ≤ 200:
  - Full pipeline for all actions (domains + conflicts + items + magnitude).
- If 200 < total ≤ 1000:
  - Full pipeline for tasks and vote messages.
  - Domains + conflicts + magnitude only (skip items) for task messages.
  - Lightweight domains-only (no items, no conflicts) for chat messages except those with high `reaction_count` or long text.
- If total > 1000:
  - Same as above, plus:
    - Only vectorize chat messages that exceed a relevance or length threshold (e.g., from a Relevance service or ISR-Relevance-Implementation logic).

These rules are implementation details; the protocol requires only that **a batch strategy is chosen based on volume, type distribution, and available budget**.

### 6.4 Step 3 – Batch Vectorization Prompts

#### 6.4.1 Shared System Prompt for All Actions

```text
You are a specialist LLM agent for the ISR (Index of Social Responsibility) system.
Your task is to analyze individual ACTIONS within a closed ISSUE and produce structured
Action Vectors following the ISR Action Vectorization and Action Contribution protocols.

You are given:
- IssueContext: a JSON summary describing the overall problem, dominant contexts,
  main value domains, main conflicts, and final resolution.
- ISR Values Taxonomy: 10 value domains and 145 items, with definitions.

For each ACTION, you must:
1. Identify engaged value domains and score them in [-100..100].
2. Identify any active value conflicts (CR pairs) in this action and score CR weights in [0..100].
3. Identify applicable contextual shifts (CS) strengths for work/family/private/crisis.
4. Optionally, score item-level values when required by the batch strategy.
5. Estimate Time, Complexity, Result, and compute Force = Type × Time × Complexity × Result.

Score what the action does, not what opinion it contains. Do not treat the content of a stated position as an action
for or against a value. Respectful and well-argued disagreement scores as honest expression and cooperation. Reserve
negative scores for actions that harm, deceive, exclude, obstruct or disrespect.

Follow the mutual-null-skip philosophy: do NOT infer opposition from absence of signal.
Follow the ISR Action Vectorization and Action Contribution protocols strictly.
Return only JSON in the specified schema.
```

#### 6.4.2 Action-level User Prompt Template

```text
ISSUE CONTEXT (IssueContext JSON):
{{IssueContext_json}}

ACTION METADATA:
- action_id: {{action_id}}
- issue_id: {{issue_id}}
- actor_uid: {{actor_uid}}
- action_type: {{action_type}}   # task|vote_msg|task_msg|chat_msg|vote
- created_at: {{created_at}}

ACTION TEXT:
"""
{{action_text}}
"""

ACTION MARKS (raw counts at closure time):
- good: {{marks_good}}
- funny: {{marks_funny}}
- flood: {{marks_flood}}
- rude: {{marks_rude}}
- foolish: {{marks_foolish}}
- microcommunity_member_count: {{marks_total_members}}

ACTOR PROFILE SUMMARY (optional, truncated):
{{actor_profile_summary}}

BATCH STRATEGY FLAGS:
- require_items: {{true_or_false}}
- require_conflicts: {{true_or_false}}

OUTPUT JSON ONLY in the following format:
{
  "domains": [d1, d2, ..., d10],          # Int in [-100..100] or null
  "items": [                              # null per domain if not needed
    [i_1_1_1_a, ..., i_1_4_2_b] or null,
    ...
  ],
  "conflict_resolution": [CR_01, ..., CR_36],  # Int in [0..100] or null
  "contextual_shifts": {
    "work": 0-100,
    "family": 0-100,
    "private": 0-100,
    "crisis": 0-100
  },
  "domains_confidence": [c_1, ..., c_10],      # 0..100
  "domains_grounding": [g_1, ..., g_10],       # 0..40
  "domains_reasoning": [r_1, ..., r_10],       # short text
  "conflicts_reasoning": [r_cr1, ..., r_cr36], # short text

  "time_hours": <float>,                       # estimated hours
  "complexity": <float>,                       # Experience_normal / max(Experience_person, Experience_min)
  "result_factor": <float>,                    # success level, unbounded but reasonable
  "type_weight": <float>,                      # from action_type
  "force": <float>,                            # type_weight * time_hours * complexity * result_factor

  "marks_normalized": [good, funny, flood, rude, foolish],  # each in [0..1]
  "sentiment_scalar": <float>                  # Σ mark * coefficient
}
```

### 6.5 Execution on Google AI Studio / Gemini / Perplexity

- Use **Google AI Studio (Gemini API)** or Perplexity API with:
  - Low temperature (e.g., 0.1–0.2) for determinism.
  - Streaming/batch calls for groups of actions (e.g., 10–50 per request), depending on model limits.
- For very large issues:
  - Split actions into chunks per `action_type` and/or per time window.
  - Run context synthesis only once per issue, reuse `IssueContext_json` across all calls.

Post-processing:

1. Validate numeric ranges and null rules.
2. Write rows to `user_action_vectors` (overwriting if they already exist for this `action_id`).

---

## PART VII: EDGE CASES AND SPECIAL HANDLING

### 7.1 Minimal or Non-textual Actions

- Actions like “OK”, emoji-only responses, or pure reactions with no meaningful text:
  - `domains` and `conflict_resolution` should normally be **all null**.
  - `force` should be near zero (Type is small, Time minimal, Complexity and Result minimal).
  - Such actions usually do *not* materially affect Contribution.

### 7.2 Extremely Polarized Sentiment

- Some actions may get highly polarized marks (e.g., many “good” and many “foolish”):
  - The marks scalar will reflect the net effect of all marks.
  - If both positive and negative marks are large, log an **alert** (e.g., `"polarized_sentiment"`) in `user_action_vectors.alerts` (if you choose to add it) for further sociological analysis.

### 7.3 Edited, Retracted and Corrected Actions

The record is only added to, never rewritten. A word said cannot be unsaid; it can be answered by other words, and the mistake is remembered (paper section 4.3).

- **Edited actions**: the original text, vector, marks and Contribution stay in the ledger. An edit creates a new action linked to the original (`version_of = action_id`); it is vectorised and scored like any new action, with its own Force. The original is shown with a note "edited" and a link to the new version. A short grace period for plain typos is an implementation and interface choice, not part of the framework. A testing build may allow direct editing of records for convenience; the framework does not.
- **Retracted actions**: when the author deletes an action it is not removed. It is shown as "retracted by the author", its text stays visible to the public of its issue, and its Contribution stays until a Correction entry (Section 7.5) changes it. `issue_actions.is_deleted` becomes `is_retracted`.
- **Hard removal** happens only where the law requires it (for example the erasure of personal data). It is logged with the legal basis, and the Contribution of the member is recomputed from the remaining ledger. The former Options A and B of this section are withdrawn.

### 7.4 Marks, Honest Conduct and Gaming

- Marks are the public's own valuation of an action. They let the public correct what the automatic alignment cannot see (for example, a formally correct remark that humiliates someone, or a failed task that lifted the mood or found an unrelated fault), and so they can change the sign of a contribution: c = (A + M) × Force.
- The protocol relies on honest conduct as a norm. Marks can also be misused (friendly marks on a harmful action, hostile marks on a dissent, inflated hours). This is treated as gaming and handled by detection, not by limiting the power of the marks.
- Existing protections: extreme Complexity and Result values raise an alert and must be explained by the actor or approved by other members (Sections 4.2 and 4.4); highly polarized marks are logged as an alert (7.2).
- Repeated dispute issues (Section 7.5) about the same action, or raised repeatedly by the same member, are logged and analysed as possible gaming.
- Open specification task: analysis of suspicious patterns (collusive marking, coordinated hostile marking, hour inflation) and the algorithms that protect against gaming.

### 7.5 Dispute About a Recorded Action (Correction Entries)

A member who thinks an action was misread (by the automatic alignment, by the marks, or in the estimate of its Result) raises an ordinary issue about it.

- **Issue type.** `community.governance.conflict_resolution`, with the disputed `action_id` in the context (Analyzer protocol, Step 4A). Any member may raise it.
- **Public.** The people connected to the action: the actor, the people the action affected, and the people who took part in the issue where it was made (relevance with ties, X). The usual rules apply: automatic joining on request and the same weight formula.
- **Options.** Always "no change". The public may also propose: a revised Result for the action; a note that explains the action and is attached to it; a re-vectorisation of the action text, if the automatic reading is judged wrong. No option may delete the action.
- **Effect.** A chosen option creates a **Correction entry** linked to the action. Contribution is recomputed with the revised Result by the standard formula (Section 8.3). The action, its marks and its earlier Contribution stay visible in the history. The effect is incremental; nothing is replaced.
- **Marks.** How the marks of the dispute public combine with the marks of the original public is an open specification task.
- **Limits.** The cost of others' time and attention, and their marks on the dispute issue, is the first limit on use. Repeated dispute issues about the same action, or raised repeatedly by the same member, are logged and analysed as possible gaming (Section 7.4).
- **Storage (to implement).** `issue_actions`: add `version_of` (nullable) and `is_retracted`; new collection `action_corrections` (`correction_id`, `action_id`, `dispute_issue_id`, `revised_result`, `note`, `created_at`).

---

## PART VIII: CONTRIBUTION CALCULATION (ON-DEMAND, PER NEW AD-HOC PUBLIC)

### 8.1 Role of the Contribution Engine

The Contribution Engine is a **separate layer** that operates **only on already vectorized past actions**. It does not trigger or depend on live issue workflows.

- **Action vectorization** happens when an issue is closed and its actions are processed into Action Vectors, stored in `user_action_vectors`.
- **Contribution calculation** happens **later**, when a new ad-hoc public is formed for a new issue and needs to estimate each member’s contribution track record using their vectorized past actions.

Key principle:

> Contribution is **not** recalculated automatically when actions are vectorized. It is computed **on demand** for a specific ad-hoc public, using that ad-hoc public’s Vector of Values and the members’ existing action vectors.

---

### 8.2 Inputs to Contribution Calculation

When a new ad-hoc public is formed for issue `issue_id_new` (per ISR Relevance Engine):

1. **Ad-hoc public definition**
   - `microcommunity_id` (1:1 with `issue_id_new`).
   - Member list: `(member_uid, relevancescore, …)` from Relevance Engine (`microcommunity_members` table).

2. **Ad-hoc public Vector of Values**
   - `VoV_new`: the ad-hoc public’s Vector of Values (domains, CR, CS) derived from member values onboarding / aggregation, as defined in the Values and Values-Vectorization protocols.

3. **Historical Action Vectors** 
For each member `u` All `user_action_vectors` rows where `actor_uid = u`.

4. **Optional filters/weights (implementation-level)**
   - Time windows (e.g., last N months/years).
   - Issue similarity or topical relevance, using Relevance Engine or semantic similarity between issues.

---

### 8.3 Per-action Contribution Recap

For each historical action `a` and a target ad-hoc public with Vector of Values ($\vec{VoV_{new}}$):

1. From `user_action_vectors`:

   - `domains[a]` and `conflict_resolution[a]`.
   - `contextual_shifts[a]`.
   - `force[a]`.
   - `sentiment_scalar[a]`.

2. Compute corrected action and values vectors:

   - Apply CR and CS logic from Part 1.2:
     - Domain and item scores encode the outcome (which values were raised or lowered).
     - Action CR encodes which conflict was present and how unequal the stakes were.
     - Together with VoV CR and CS, derive the **comparison-ready** vectors for this ad-hoc public.

3. Compute cosine alignment $A_a$:

   - Use only dimensions where both action and VoV have non-null values (mutual-null-skip rule).
   - After normalization:

   $$A_a = cos(\vec{Action_a}, \vec{VoV_{new}}) \in [-1, 1]$$

4. Use stored marks scalar $M_a$.

5. Compute per-action Contribution of `a` to this new ad-hoc public:

$$c_{a, new} = (A_a + M_a) \times Force_a.$$

---

### 8.4 Aggregating Contribution per Member

For each member `u` in the new ad-hoc public:

1. **Select historical actions**:

   - Fetch all actions `a` where `actor_uid = u` and `user_action_vectors.issue_id` is a closed issue (optionally filtered by time or topical similarity).

2. **Compute per-action contributions** $c_{a,new}$ as in 8.3.

3. **Aggregate absolute contribution**:

   Baseline aggregation:

$$C_{u, new} = \sum_{a \in Actions(u)} c_{a, new}$$

4. **Store in members table**

   - In the `microcommunity_members` table
   - This value remains stable as an **absolute, non-normalized scalar**.

---

### 8.5 Integration with ISR Core

- **Relevance Engine** (D, G, S, X) decides **who** belongs to the ad-hoc public and how relevant they are.
- **Contribution Engine** (this part) estimates **how strongly and in what direction** each member has acted in the past relative to this ad-hoc public’s values.
- The ISR core later normalizes absolute_contribution and combines it with Relevance and Expertise: $\hat C_u = C_u / (\overline{|C|} + u)$, where $\overline{|C|}$ is the mean absolute Contribution over the members of the ad-hoc public and $u$ is one reference unit of Contribution. Relevance and Expertise are divided by their mean over the same members. gISR (8.6) uses the same rule over all registered users.

### 8.6 The general score (gISR)

The general score is a member's weight in a vote that affects all users equally. Relevance and Expertise are the same for everyone ($\hat R = \hat E = 1$) and the three component weights are equal ($w_R = w_E = w_C = 1/3$), so

$$g_{raw} = \max\bigl(0,\; (1 - w_C) + w_C \hat C\bigr) \approx 0.67 + 0.33\,\hat C, \qquad \hat C = \frac{C}{\overline{|C|} + u},$$

where $C$ is the member's Contribution read through the Vector of Values of all registered users taken equally and $\overline{|C|}$ is the mean absolute Contribution over all registered users. After all users are calculated the scores are divided by their mean over all users, $gISR = g_{raw} / \overline{g_{raw}}$, so that the average is 1. The score reaches zero only when Contribution is negative and at least twice the typical size. It has two uses only: the weight in votes on questions that affect all users equally (the rules), and a minimum reliability condition in the access scheme with tiers. It is not shown to other members or given to third parties.
