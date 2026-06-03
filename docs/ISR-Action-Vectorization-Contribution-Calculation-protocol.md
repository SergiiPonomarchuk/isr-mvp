# ISR Action Vectorization & Contribution Calculation Protocol v1.0

**Designed for**: ISR Project – Community Values to Action Alignment Assessment

**Purpose**: Convert community actions description (tasks, messages, decisions) into structured vectors that can be compared with a microcommunity’s Vector of Values, and then transformed into Contribution scores combining value alignment, psychological impact, and action magnitude.

---

## PART I: CONCEPTUAL FRAMEWORK

### 1.1 Action vs. Values: The Fundamental Distinction

| Aspect | Vector of Values | Action Vector |
|--------|------------------|---------------|
| **What it represents** | STATED IDEALS: what the microcommunity says it values | OBSERVED BEHAVIOR: what a person actually does in a concrete situation |
| **Domains (items) scoring** | [0–100] – no negative values (cannot “value −80 justice”) | [−100..100] – action can be directed strongly for or against a value |
| **Source of truth** | Self‑reported narratives, surveys, and assisted onboarding | Externally observable contributions (tasks, messages, decisions, logged events) |
| **Null meaning** | “We have no opinion about this domain (item)” | “This action does not address this domain (item)” |
| **Temporal orientation** | Future‑oriented: vision of the “Future We Want” | Past‑focused: assessment of what actually happened in a specific action |
| **Modification frequency** | Stable across weeks/months; refined slowly | Changes per action (every task, message, decision can have its own vector) |
| **Conflict Resolution Weights (CR)** | Preferences: how the community prefers to resolve value conflicts in general when both sides are valued | Trade‑offs: in this action context, which values were in conflict and which side actually won, with what imbalance |
| **Contextual Shifts (CS)** | Assessment correction map: how domains become more/less important in pure work/family/private/crisis contexts | Completeness of context application: for this action, how strongly each context (work, family, private, crisis) applies (0–100) |
| **Calculation time** | When a microcommunity is formed or its values are updated | After an issue is closed and the microcommunity around it is dismissed. Later, Action Force and Result can be corrected by new outcome records and ratings. |
| **Force** | N/A – only direction (values intensities and conflict/context preferences) | Non‑negative scalar showing the action’s magnitude for the community: based on action type, time spent, complexity for the actor, and success of results |
| **Sentiment** | N/A - it is assumed that all microcommunities share the same sentiment values | Normalized sentiment marks array `[good, funny, flood, rude, foolish]`, each value [0.0–1.0] = (number of marks in category) ÷ (number of microcommunity members) |

---

### 1.2 Why Conflict Resolution & Contextual Shifts Are DESCRIPTORS OF THE ACTION SITUATION

**Key insight**: CR and CS in an Action Vector do not describe stable personal traits; they describe how this particular action navigated a concrete situation. Every action must be interpreted in its situational context: the issue that started it, previous messages, community state, and other concurrent actions. Different microcommunity Vectors of Values then act as different filters applied to the same action context.

#### 1.2.1 Conflict Resolution Weights in Action Context

- **Values Vector CR weights** represent:  
  “When both sides are generally valued, which side does the community prefer when they come into conflict?”
- **Action Vector CR weights** represent:  
  “In this specific action context, which value conflicts were actually present, and how unequal were their stakes?”

Example:

- **VoV CR.1** (Individual Freedom [65] vs Collective Harmony [75]) = 80.  
  Interpretation: both are valued, but when there is a clear conflict, this microcommunity tends to prefer Collective Harmony.

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

Consider three microcommunities:

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
  “In pure work / family / private / crisis contexts, how does the importance of each domain shift for our microcommunity?”
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

Extreme Complexity values raise an alert and must be explained by the actor or approved by other microcommunity members.

#### 1.4.4 Action Result

Result measures the success of the action relative to its intended outcome.

- Initial Result is estimated by AI from:
  - Comparison of planned vs. actual descriptions in the task and related discussion.
  - Available outcome metrics or logs.
- After issue closure, microcommunity members can rate the action’s result; ratings are aggregated into Result, weighted by individual ISR scores for that issue.
- Over time, if new evidence appears (e.g., long‑term outcome was better or worse), Result can be corrected.
- Result is unbounded above; extremely high or low values raise an alert and must be explained by the actor or approved by other members.

---

### 1.5 Sentiment Analysis

Sentiment captures the perceived psychological and communicative impact of an action within the microcommunity, independent of its structural value alignment.

Mechanism:

- Microcommunity members can mark an action with any combination of:
  - `good`, `funny`, `flood`, `rude`, `foolish`.
- Members may apply more than one tag to the same action if appropriate.
- Over time, members can change or remove their marks as their view of the action evolves.
- For each action, a sentiment vector is computed as:

$$marks = [good,\ funny,\ flood,\ rude,\ foolish]$$

where each entry is:

$$mark = \frac{\text{number of marks in this category}}{\text{number of microcommunity members}}$$

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

$$S = \sum_{marks} (mark \times coefficient_{mark})$$

Sentiment can be positive or negative and, by design, is as powerful as value alignment in Contribution.

For later Contribution Score calculation of an action, cosine similarity of the Action and the microcommunity’s Vector of Values multiplied by the Action Force adds to the Sentiment multiplied by the Action Force:

$$Contribution = \cos(\vec{Action}, \vec{Values}) \times Force + \sum_{marks} (mark \times coefficient_{mark}) \times Force$$

So sentiment shows the action’s psychological impact on the microcommunity; it can be both positive and negative.

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

To compare an action with a microcommunity’s Vector of Values:

1. Start from `action_content.domains` and `VoV.core_values.domains`.
2. Apply conflict resolution (CR) and contextual shifts (CS) as in 1.2.
3. Restrict to indices where both action and VoV domains are non‑null (mutual‑null‑skip rule).
4. Normalize both vectors and compute cosine similarity:

$$A = \cos(\vec{Action}, \vec{Values}_{mv}) \in [-1, 1].$$

### 4.2 Sentiment Scalar

As in 1.5:

$$S = \sum_{marks} (mark \times coefficient_{mark}).$$

### 4.3 Action Contribution to a Microcommunity

For a given action and microcommunity:

$$Contribution = \cos(\vec{Action}, \vec{Values}) \times Force + \sum_{marks} (mark \times coefficient_{mark}) \times Force.$$

Equivalently:

$$Contribution = (A + S) \times Force.$$

A member’s total Contribution to that microcommunity is the sum of Contributions of all their actions.

Contribution is absolute and can be negative, positive, or near zero; it is not re‑normalized when new members or new actions are added.

---

## PART V: DATA STORAGE MODEL FOR ACTIONS, ACTION VECTORS AND CONTRIBUTION

### 5.1 Principles of Separation

1. **Single-microcommunity scope**  
   Each action belongs to exactly **one issue** and its corresponding **microcommunity**. An action may even *start* an issue by being its first entry, but it is never shared across multiple microcommunities.

2. **Issue-centric vs user-centric data**  
   - **Issue/microcommunity part** stores the *raw action record and its social life* inside the issue: description, attachments, status, results narrative, marks, and timestamps.
   - **User part** stores the *vectorized representation* of the action for the actor: domains, items, CR/CS, Force, sentiment scalar, and derived metrics used frequently in Contribution computations.

3. **Contribution locality**  
   - Contribution is always defined **relative to a microcommunity** (via its Vector of Values), but for implementation it is stored as an **absolute scalar** in the *current microcommunity members table* and only normalized later when computing final ISR scores.

4. **Overwrite semantics**  
   - When Action Force, Result, or vectorization changes, the action’s vector in the user part is **hard-overwritten**; historical audit/versioning can be added later but is not required in the base protocol.

### 5.2 Issue-side Schema (Action Records in Microcommunity)

Issue/microcommunity tables keep the contextual and social aspects of actions.

```sql
-- Table: issue_actions
CREATE TABLE issue_actions (
    action_id      UUID PRIMARY KEY,
    issue_id       BIGINT NOT NULL,
    actor_uid      BIGINT NOT NULL,

    -- Raw content and context
    action_type    VARCHAR(16) NOT NULL,  -- task|vote_msg|task_msg|chat_msg|vote
    created_at     TIMESTAMPTZ NOT NULL,
    updated_at     TIMESTAMPTZ NOT NULL,
    action_text    TEXT NOT NULL,
    attachments    JSONB,                 -- file links, media, etc.

    -- Results and narrative
    planned_result TEXT,                  -- intended outcome (optional)
    actual_result  TEXT,                  -- narrative of what happened
    ai_result_estimate   DOUBLE PRECISION,
    community_result     DOUBLE PRECISION, -- aggregated rating (weighted by ISR)

    -- Sentiment marks at issue level (counts)
    marks_good      INT DEFAULT 0,
    marks_funny     INT DEFAULT 0,
    marks_flood     INT DEFAULT 0,
    marks_rude      INT DEFAULT 0,
    marks_foolish   INT DEFAULT 0,
    marks_total_members INT NOT NULL,     -- microcommunity size at evaluation time

    -- Status flags
    is_deleted      BOOLEAN DEFAULT FALSE,
    is_edited       BOOLEAN DEFAULT FALSE,
    edit_history    JSONB                 -- optional, for text/metadata changes
);

CREATE INDEX idx_issue_actions_issue   ON issue_actions(issue_id);
CREATE INDEX idx_issue_actions_actor   ON issue_actions(actor_uid);
CREATE INDEX idx_issue_actions_type    ON issue_actions(action_type);
CREATE INDEX idx_issue_actions_created ON issue_actions(created_at);
```

Notes:

- `marks_*` store **raw counts**; normalized marks `[0..1]` for sentiment are computed as: count ÷ `marks_total_members`.
- This table is used for UI, history, and delayed evaluations (Result corrections, mark changes), not for frequent Contribution computations.

### 5.3 User-side Schema (Action Vectors per User)

User-centric tables keep vectorized data and magnitude for fast Contribution and analytics.

```sql
-- Table: user_action_vectors
CREATE TABLE user_action_vectors (
    action_id       UUID PRIMARY KEY,       -- 1:1 with issue_actions
    actor_uid       BIGINT NOT NULL,
    issue_id        BIGINT NOT NULL,        -- microcommunity this action belongs to

    -- Vector content (compressed representation)
    domains         INT2[],                 -- 10 values in [-100..100] or NULL
    items           JSONB,                  -- nested arrays per domain
    conflict_resolution INT2[],             -- 36 in [0..100] or NULL
    contextual_shifts  JSONB,               -- {work,family,private,crisis: 0..100}

    -- Magnitude and sentiment
    force           DOUBLE PRECISION,       -- Type × Time × Complexity × Result
    type_weight     DOUBLE PRECISION,
    time_hours      DOUBLE PRECISION,
    complexity      DOUBLE PRECISION,
    result_factor   DOUBLE PRECISION,
    marks           DOUBLE PRECISION[5],    -- normalized: good,funny,flood,rude,foolish
    sentiment_scalar DOUBLE PRECISION,

    -- Confidence and reasoning (optional but recommended)
    domains_confidence INT2[],
    domains_grounding INT2[],
    reasoning        JSONB,

    vector_version   VARCHAR(8) NOT NULL DEFAULT '1.0',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uav_actor   ON user_action_vectors(actor_uid);
CREATE INDEX idx_uav_issue   ON user_action_vectors(issue_id);
CREATE INDEX idx_uav_force   ON user_action_vectors(force DESC);
```

Notes:

- This table is the main source for Contribution calculations, analytics, and any cross-issue/user research.
- When re-vectorization occurs, the row is **overwritten** (possibly with a bumped `vector_version`).

### 5.4 Contribution Storage in Microcommunity Members Table

Contribution is defined per **member × issue** and is stored as an absolute scalar (not normalized):

```sql
-- Table: issue_members
CREATE TABLE issue_members (
    issue_id         BIGINT NOT NULL,
    member_uid       BIGINT NOT NULL,

    absolute_contribution DOUBLE PRECISION DEFAULT 0.0,

    -- Other fields: relevance, expertise, roles, etc. can live here

    PRIMARY KEY (issue_id, member_uid)
);
```

- `absolute_contribution` aggregates all action Contributions for this member in this issue:

  ```text
  absolute_contribution = Σ_over_member_actions_in_issue Contribution(action, issue)
  ```

- Normalization to a 0–1 range or any other scale for final ISR-score calculation happens in the **ISR core**, not in this protocol.

---

## PART VI: ACTIONS VECTORIZATION PROTOCOL FOR CLOSED ISSUES

This part describes the **batch vectorization pipeline** executed after an issue is closed. Its goals:

- Ensure all actions are evaluated under a **shared, explicit context**.
- Maintain high vectorization quality even for large, complex issues with many heterogeneous actions.
- Provide ready-to-use prompts for Vertex AI / Gemini / Perplexity models, with placeholders.

### 6.1 High-level Workflow

For a closed issue `issue_id`:

1. **Context Synthesis** – build a single, shared `IssueContext` summary.
2. **Scope & Batch Strategy Analysis** – analyze action volume and structure to choose vectorization strategy.
3. **Batch Vectorization** – run LLM prompts in batches to produce user_action_vectors for all actions.

### 6.2 Step 1 – Issue Context Synthesis (Internal LLM Step)

**Goal**: Create an internal `IssueContext` object used as context for all subsequent action prompts, so that domain scores, CR, CS, and Result are evaluated coherently.

**Input data** (from DB and services):

- Issue metadata: title, description, tags, microcommunity size, time span.
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

**Prompt template (Vertex AI / Gemini / Perplexity)**:

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
- Microcommunity size: {{member_count}}
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

### 6.5 Execution on GCP (Vertex AI / Perplexity)

- Use **Vertex AI / Gemini** or Perplexity API with:
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
  - The sentiment scalar will reflect the net effect of all marks.
  - If both positive and negative marks are large, log an **alert** (e.g., `"polarized_sentiment"`) in `user_action_vectors.alerts` (if you choose to add it) for further sociological analysis.

### 7.3 Deleted or Edited Actions

- **Edited actions**:
  - Keep the same `action_id`.
  - Update `issue_actions.action_text`, adjust marks and results as needed.
  - Re-run vectorization for that action and overwrite its row in `user_action_vectors`.
  - Recompute affected `absolute_contribution` for that member in `issue_members`.

- **Deleted actions**:
  - Mark `issue_actions.is_deleted = TRUE`.
  - Option A (hard removal): delete corresponding row from `user_action_vectors` and subtract the old Contribution from `absolute_contribution`.
  - Option B (soft removal): keep vector but set a **zeroed Contribution** flag in downstream ISR calculations (implementation choice). Base protocol recommends Option A for simplicity.

---

## PART VIII: CONTRIBUTION CALCULATION (ON-DEMAND, PER NEW MICROCOMMUNITY)

### 8.1 Role of the Contribution Engine

The Contribution Engine is a **separate layer** that operates **only on already vectorized past actions**. It does not trigger or depend on live issue workflows.

- **Action vectorization** happens when an issue is closed and its actions are processed into Action Vectors, stored in `user_action_vectors`.
- **Contribution calculation** happens **later**, when a new microcommunity is formed for a new issue and needs to estimate each member’s contribution track record using their vectorized past actions.

Key principle:

> Contribution is **not** recalculated automatically when actions are vectorized. It is computed **on demand** for a specific microcommunity, using that microcommunity’s Vector of Values and the members’ existing action vectors.

---

### 8.2 Inputs to Contribution Calculation

When a new microcommunity is formed for issue `issue_id_new` (per ISR Relevance Engine):

1. **Microcommunity definition**
   - `microcommunity_id` (1:1 with `issue_id_new`).
   - Member list: `(member_uid, relevancescore, …)` from Relevance Engine (`microcommunitymembers` table).

2. **Microcommunity Vector of Values**
   - `VoV_new`: the microcommunity’s Vector of Values (domains, CR, CS) derived from member values onboarding / aggregation, as defined in the Values and Values-Vectorization protocols.

3. **Historical Action Vectors** 
For each member `u` All `user_action_vectors` rows where `actor_uid = u`.

4. **Optional filters/weights (implementation-level)**
   - Time windows (e.g., last N months/years).
   - Issue similarity or topical relevance, using Relevance Engine or semantic similarity between issues.

---

### 8.3 Per-action Contribution Recap

For each historical action `a` and a target microcommunity with Vector of Values ($\vec{VoV_{new}}$):

1. From `user_action_vectors`:

   - `domains[a]` and `conflict_resolution[a]`.
   - `contextual_shifts[a]`.
   - `force[a]`.
   - `sentiment_scalar[a]`.

2. Compute corrected action and values vectors:

   - Apply CR and CS logic from Part 1.2:
     - Domain and item scores encode the outcome (which values were raised or lowered).
     - Action CR encodes which conflict was present and how unequal the stakes were.
     - Together with VoV CR and CS, derive the **comparison-ready** vectors for this microcommunity.

3. Compute cosine alignment $A_a$:

   - Use only dimensions where both action and VoV have non-null values (mutual-null-skip rule).
   - After normalization:

   $$A_a = cos(\vec{Action_a}, \vec{VoV_{new}}) \in [-1, 1]$$

4. Use stored sentiment scalar $S_a$.

5. Compute per-action Contribution of `a` to this new microcommunity:

$$Contribution_{a, new} = (A_a + S_a) \times Force_a.$$

---

### 8.4 Aggregating Contribution per Member

For each member `u` in the new microcommunity:

1. **Select historical actions**:

   - Fetch all actions `a` where `actor_uid = u` and `user_action_vectors.issue_id` is a closed issue (optionally filtered by time or topical similarity).

2. **Compute per-action contributions** $Contribution_{a,new}$ as in 8.3.

3. **Aggregate absolute contribution**:

   Baseline aggregation:

$$Contribution_{u, new} = \sum_{a \in Actions(u)} Contribution_{a, new}$$

4. **Store in microcommunity members table**

   - In the `microcommunity_members` table
   - This value remains stable as an **absolute, non-normalized scalar**.

---

### 8.5 Integration with ISR Core

- **Relevance Engine** (D, G, S, X) decides **who** belongs to the microcommunity and how relevant they are.
- **Contribution Engine** (this part) estimates **how strongly and in what direction** each member has acted in the past relative to this microcommunity’s values.
- The ISR core later **normalizes** `absolute_contribution` and combines it with other components (e.g., relevance, expertise) to derive final weights or ISR-scores for decision-making; that normalization and combination sit outside this protocol.
