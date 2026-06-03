# ISR Relevance Engine: MVP Implementation Specification v1.0

## Overview

The ISR Relevance Engine calculates which users are meaningfully affected by each civic issue using four independent dimensions:

| Dimension | Processing | Output |
|-----------|-----------|--------|
| **Demographic (D)** | SQL binary filtering | 0.0-1.0 |
| **Geospatial (G)** | Threshold Gaussian | 0.0-1.0 |
| **Semantic (S)** | pgvector cosine similarity | 0.0-1.0 |
| **Social (X)** | Social graph step function | 0.0-1.0 |

**Final Score [0.0-1.0]**: $\text{Relevance}_i = w_D \cdot D_i + w_G \cdot G_i + w_S \cdot S_i + w_X \cdot X_i$

---

## Relevance Processing Pipeline (At Scale)

To scale the Relevance Engine to dozens of millions of users without performing expensive vector similarity or social graph calculations on the entire database, the evaluation must follow a strict, sequential pipeline:

1. **Phase 1: Demographic Filtering (D)**
   * **Action**: Apply SQL binary filtering or indexed queries on demographic criteria (e.g., age, employment, gender).
   * **Outcome**: Excludes unqualified users immediately. For a large population $N$, this reduces the candidate pool to a subset $N_{demo}$ (typically 1-5% of the total).

2. **Phase 2: Geospatial Filtering (G)**
   * **Action**: Calculate geographic distances from the issue epicenter *only* for the survivors of Phase 1. Apply a hard distance threshold (e.g., $d \le \mu + 3\sigma$, beyond which $G(d) \approx 0.01$).
   * **Outcome**: Filters the pool down to $N_{geo}$ candidates who are geographically affected (typically hundreds to a few thousand).

3. **Phase 3: Semantic Similarity (S)**
   * **Action**: Perform vector cosine similarity calculations between the issue embedding and the user's `profile_vector` or `experience_vectors` *only* for the survivors of Phase 2.
   * **Outcome**: Measures interests and expertise alignment. Because the candidate pool is already reduced to $N_{geo}$, calculating vector distances (in-memory or using pre-filtered database indexes) is highly efficient and avoids scanning millions of high-dimensional vectors.

4. **Phase 4: Social Connections (X)**
   * **Action**: Resolve direct social network relations to the issue submitter *only* for the candidates who have high scores in the previous steps.
   * **Outcome**: Applies social proximity adjustments (spouse/family/friend) to finalize the relevance score.

This sequential pipeline ensures maximum processing efficiency, reduces database reads/computational cost, and makes the system viable for dozens of millions of records.

---

## Part 1: Relevance Taxonomy & Issue Classification

### 1.1 Relevance Definition

Relevance is a **continuous probability score (0.0-1.0)** measuring how much an issue and its solution will **directly affect a specific person**.

**What Relevance answers**: "Will this problem/solution impact ME directly?"

**What Relevance does NOT measure**:
- Expertise to solve the issue
- Track record of contributions
- Ability to influence the outcome

---

### 1.2 The Four Relevance Dimensions

#### **Dimension 1: Demographic Relevance (D)**

**Question**: "Does my demographic profile match this issue's demographic requirements?"

**Processing**: SQL binary filtering based on LLM-decided conditions

**Data Fields Used**:
- Age (birthDate)
- Employment status (post[].job)
- Family status (social relations types)
- Health conditions (stored in profile)
- Education level (skills[].educationLevel)
- Location/Housing type (geography[].unit_type)

**Calculation**: 
- Conditions set by LLM during issue analysis
- Returns discrete values: 0.0 (excluded) or category-specific scores (0.2, 0.5, 1.0)

**Example**:
```sql
-- Childcare issue
IF user.social_relations[].type CONTAINS 'child' AND user.has_children = true
  THEN D_score = 1.0
ELSE IF user.social_relations[].type CONTAINS 'grandchild'
  THEN D_score = 0.5
ELSE D_score = 0.0
```

**Purpose**: Filter out clearly unaffected users before expensive geospatial and semantic calculations

---

#### **Dimension 2: Geospatial Relevance (G)**

**Question**: "Am I geographically affected by this issue?"

**Processing**: Threshold Gaussian distance decay from issue epicenter

**Function**:
$$G(d) = \begin{cases}
1.0 & \text{if } d \leq \mu \\
e^{-\frac{(d - \mu)^2}{2\sigma^2}} & \text{if } d > \mu
\end{cases}$$

Where:
- **d** = Distance (meters) from issue location to user's primary anchor (home or work)
- **μ** = Primary impact zone radius (meters) - where decay begins
- **σ** = Decay steepness parameter (meters)

**Parameters** (set per issue):
- **μ (mu)**: System-suggested based on issue description, user-adjustable
- **σ (sigma)**: System-suggested based on issue type, user-adjustable

**Interpretation**:
- d ≤ μ: Fully affected (G = 1.0)
- d = μ + σ: G ≈ 0.606 (60% relevance)
- d = μ + 3σ: G ≈ 0.011 (negligible, ~1%)

**Example (Building security issue)**:
- μ = 30m (primary zone: building + immediate residents)
- σ = 50m (decay strength)
- Result:
  - 0-30m: G = 1.0
  - 60m away: G ≈ 0.6
  - 150m away: G ≈ 0.01

**Data**: user.geography[].geo (PostGIS POINT coordinates)

---

#### **Dimension 3: Semantic Relevance (S)**

**Question**: "Does this issue relate to my interests/expertise?"

**Processing**: Cosine similarity between user interest vector and issue vector

**Function**:
$$S_i = \max(0, 1 - \text{cosine\_distance}(u_i, q))$$

Where:
- **u_i** = User i's interest vector (1536-dim, Vertex AI text-embedding-004)
- **q** = Issue description vector (1536-dim)
- **Clamp to 0**: Disinterest doesn't subtract (soft scaling)

**Range**: 0.0 (opposite interests) to 1.0 (identical interests)

**Implementation**: pgvector `<=>` operator (cosine distance in Postgres)

**Data**:
- From user profile: Interests, values, professional field, activity history
- From issue: Description text vectorized during issue submission

---

#### **Dimension 4: Social Graph Relevance (X)**

**Question**: "Are people I care about directly affected by this issue?"

**Processing**: Step-function based on connection type and optional tie strength

**Function**:
$$X_i = \begin{cases}
\text{tie} & \text{if } \text{tie attribute exists (not null)} \\
0.3 & \text{if } \text{connection\_type} \in \{\text{spouse, partner}\} \\
0.2 & \text{if } \text{connection\_type} \in \{\text{parent, child, sibling}\} \\
0.1 & \text{if } \text{connection\_type} \in \{\text{grandparent, grandchild, close friend}\} \\
0.0 & \text{otherwise (excluded)}
\end{cases}$$

**Data Structure** (from user profile):
```json
{
  "social_relations": [
    {
      "id": 1,
      "type": "father",           // Connection type
      "tie": null,                // Custom relevance (optional)
      "relative": 2785            // Related user ID
    },
    {
      "id": 4,
      "type": "close friend",
      "tie": 0.6,                 // Custom override: 0.6
      "relative": 1515
    }
  ]
}
```

**Processing Rules**:
1. Look at issue submitter's social relations only (depth-1, no traversal)
2. For each relation:
   - If `tie` field exists and not null → use `tie` value
   - Else if `type` matches predefined categories → use category score
   - Else → exclude entirely (X_score = 0.0)
3. If relative needs additional data (age, location), fetch from relative's profile

**Included Connection Types**:
- **0.3**: spouse, partner, wife, husband
- **0.2**: parent, father, mother, child, son, daughter, sibling, sister, brother
- **0.1**: grandparent, grandfather, grandmother, grandchild, grandson, granddaughter, close friend
- **0.0 (excluded)**: all others (e.g., niece, cousin, aunt, uncle, colleague, acquaintance)

**Example (Broken lock at issue submitter's home)**:
- Issue submitter: user ID 100
- Affected: Their father (type=parent, tie=null) → X = 0.2
- Affected: Their close friend (type=close friend, tie=0.6) → X = 0.6
- Not affected: Their cousin (type=cousin, not in list) → X = 0.0

---

### 1.3 Issue Analysis & Weight Assignment

**During issue submission**, LLM analyzes issue and decides:

1. **Taxonomy Category**: Extracted from description
2. **Demographic Conditions**: SQL WHERE clause logic
3. **Geospatial Parameters**: μ and σ suggestions
4. **Weight Distribution**: w_D, w_G, w_S, w_X (summing to 1.0)

**Weight Assignment Examples** (for reference, AI makes final decision):

| Issue Type | Category | Typical w_D | w_G | w_S | w_X | Rationale |
|-----------|----------|--------|-----|-----|-----|-----------|
| Door lock broken | building.security | 0.2 | 0.7 | 0.05 | 0.05 | Geographic proximity dominates |
| Workplace scheduling | community.work | 0.3 | 0.3 | 0.3 | 0.1 | Employment status + location + profession |
| Dance event | social.event | 0.1 | 0.3 | 0.5 | 0.1 | Interest in dancing is main factor |
| Childcare services | health.access | 0.6 | 0.2 | 0.1 | 0.1 | Parents with children are primary |
| Family emergency | social.family | 0.3 | 0.2 | 0.0 | 0.5 | Social connections dominate |
| Street noise | infrastructure.public | 0.2 | 0.8 | 0.0 | 0.0 | Pure geographic impact |
| Budget decision | community.governance | 0.4 | 0.3 | 0.2 | 0.1 | Mixed: residents + interest + connections |
| Park improvement | environment.green | 0.3 | 0.6 | 0.05 | 0.05 | Geographic + demographic (families) |
| Medication access | health.access | 0.7 | 0.2 | 0.05 | 0.05 | Health conditions dominant |
| Community event | social.event | 0.2 | 0.4 | 0.3 | 0.1 | Location + interest + social |

**AI decides final weights during issue analysis based on issue context and nature.**

---

## Part 2: Demographic Relevance Calculation

### 2.1 SQL-Based Binary Filtering

Demographic relevance is calculated using **standard SQL queries without sigmoid functions**.

**Purpose**: First-stage filter to exclude clearly unaffected users before expensive geospatial/semantic calculations

**Process**:

1. **LLM analyzes issue** and generates SQL WHERE conditions
2. **Apply conditions** to filter users into discrete relevance tiers
3. **Return D_score**: Discrete value (0.0, 0.2, 0.5, 1.0) per issue category

### 2.2 Implementation Pattern

**Example: Childcare Issue**

```sql
-- LLM decides these conditions during issue analysis
SELECT 
    user_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users.social_relations 
            WHERE type IN ('child', 'son', 'daughter')
        )
        THEN 1.0  -- Parent: definitely affected
        
        WHEN EXISTS (
            SELECT 1 FROM users.social_relations 
            WHERE type IN ('grandchild', 'grandson', 'granddaughter')
        )
        THEN 0.5  -- Grandparent: somewhat affected
        
        WHEN AGE(NOW(), birthDate) < interval '18 years'
        THEN 0.8  -- Young person: affected but not as parent
        
        ELSE 0.0  -- No children/grandchildren: not affected
    END as D_score
FROM users
WHERE 1=1;
```

### 2.3 Demographic Conditions by Issue Type

**LLM generates conditions based on issue category. Examples:**

| Issue Category | D_score = 1.0 | D_score = 0.5 | D_score = 0.0 |
|---|---|---|---|
| **Childcare** | Has children aged 0-12 | Grandparent | No children |
| **Workplace** | Employed | Student/Freelancer | Retired/Unemployed |
| **School** | Has children in school | Works in school | No school connection |
| **Parking** | Has car | Uses public transit | No vehicle |
| **Healthcare** | Has chronic condition OR age 65+ | Age 50-64 | Healthy & young |
| **Housing** | Rents/owns in area | Works in area | Doesn't live/work there |
| **Public space** | Lives nearby | Works nearby | Neither |
| **Retirement** | Age 55+ | Age 45-54 | Under 45 |
| **Pet services** | Has pets | Friends with pets | No pets |
| **Disability access** | Has mobility limitation | Cares for disabled | No limitation |

**Each issue may have different conditions; LLM decides during analysis.**

---

## Part 3: Geospatial Relevance Calculation

### 3.1 Threshold Gaussian Distance Decay

Geospatial relevance uses **threshold Gaussian** with two parameters:

**Formula**:
$$G(d) = \begin{cases}
1.0 & \text{if } d \leq \mu \\
e^{-\frac{(d - \mu)^2}{2\sigma^2}} & \text{if } d > \mu
\end{cases}$$

### 3.2 Parameter Assignment

**System-Suggested Based on Issue Description**:

| Issue Type Pattern | Suggested μ (meters) | Suggested σ (meters) |
|---|---|---|
| Personal (lock, appliance, unit) | 10-20 | 20-30 |
| Building (elevator, heating, roof) | 30-80 | 40-60 |
| Street (noise, lighting, parking) | 100-300 | 80-150 |
| Block/Neighborhood | 300-1000 | 150-300 |
| District (water main, zoning) | 500-2000 | 200-500 |
| City-wide (transit, budget) | 2000-10000 | 500-2000 |

**User can override both μ and σ before issue submission.**

### 3.3 SQL Implementation

```sql
SELECT 
    user_id,
    ST_Distance(
        users.home_anchor::geography, 
        issues.location::geography
    ) as distance_meters,
    CASE 
        WHEN ST_Distance(...) <= issues.mu_distance_meters 
        THEN 1.0
        ELSE EXP(-0.5 * POWER(
            (ST_Distance(...) - issues.mu_distance_meters) / 
            issues.sigma_decay_meters, 
            2
        ))
    END as G_score
FROM users
CROSS JOIN issues
WHERE issues.issue_id = $1
ORDER BY distance_meters;
```

---

## Part 4: Semantic Relevance Calculation

### 4.1 Cosine Similarity (pgvector)

**Formula**:
$$S_i = \max(0, 1 - \text{cosine\_distance}(u_i, q))$$

### 4.2 Vector Sources

**User Interest Vector**:
- Concatenate: tags + values + professional field + activity history
- Vectorize during profile creation/update
- Store in: `users.interest_vector` (pgvector 1536-dim)

**Issue Vector**:
- Vectorize issue description
- Store in: `issues.issue_vector` (pgvector 1536-dim)
- Created during issue submission

### 4.3 SQL Implementation

```sql
SELECT 
    user_id,
    GREATEST(0, 1 - (users.interest_vector <=> issues.issue_vector)) as S_score
FROM users
CROSS JOIN issues
WHERE issues.issue_id = $1
ORDER BY S_score DESC;
```

---

## Part 5: Social Graph Relevance Calculation

### 5.1 Connection Type Mapping

**Explicit Tie Attribute** (if specified in profile):
- Use tie value directly
- Range: 0.0-1.0

**Predefined Type Mapping** (if tie is null):
- **spouse/partner** → 0.3
- **parent/father/mother** → 0.2
- **child/son/daughter** → 0.2
- **sibling/sister/brother** → 0.2
- **grandparent/grandfather/grandmother** → 0.1
- **grandchild/grandson/granddaughter** → 0.1
- **close friend** → 0.1
- **All others** → 0.0 (excluded)

### 5.2 Processing Rules

1. **Identify issue submitter**: The person who submitted the issue
2. **Access their social relations**: From user profile
3. **For each relation**:
   - If `tie` attribute exists and not null → use that
   - Else if `type` in mapping → use mapped value
   - Else → exclude (0.0)
4. **If relative profile data needed** (e.g., age for eligibility):
   - Fetch from relative's user profile record
   - Apply filter conditions if necessary

### 5.3 Example: Building Maintenance Issue

**Issue submitter**: User ID 100 (apartment building resident)

**Their social relations**:
```json
{
  "social_relations": [
    {"id": 1, "type": "father", "tie": null, "relative": 2785},
    {"id": 2, "type": "husband", "relative": 3685},
    {"id": 3, "type": "daughter", "tie": 0.8, "relative": 7761},
    {"id": 4, "type": "friend", "tie": 0.6, "relative": 1515},
    {"id": 5, "type": "niece", "tie": null, "relative": 4200}
  ]
}
```

**Results**:
- Father (type=parent, tie=null) → X = 0.2 ✓ included
- Husband (type=spouse, tie=null) → X = 0.3 ✓ included
- Daughter (type=child, tie=0.8) → X = 0.8 ✓ included (override)
- Friend (type=friend, tie=0.6) → X = 0.6 ✓ included (override)
- Niece (type=niece, tie=null) → X = 0.0 ✗ excluded (not in type map)

### 5.4 SQL Implementation

```sql
WITH social_relations_scored AS (
    SELECT 
        u.user_id,
        sr.relative as affected_user_id,
        COALESCE(
            sr.tie,  -- Use explicit tie if specified
            CASE 
                WHEN sr.type IN ('spouse', 'partner', 'wife', 'husband') THEN 0.3
                WHEN sr.type IN ('parent', 'father', 'mother', 'child', 
                                 'son', 'daughter', 'sibling', 'sister', 'brother') THEN 0.2
                WHEN sr.type IN ('grandparent', 'grandfather', 'grandmother',
                                 'grandchild', 'grandson', 'granddaughter', 
                                 'close friend') THEN 0.1
                ELSE NULL  -- Exclude others
            END
        ) as X_score
    FROM users u
    JOIN LATERAL jsonb_to_recordset(u.social_relations) AS sr(
        id INT, 
        type VARCHAR, 
        tie FLOAT, 
        relative INT
    ) ON true
    WHERE u.user_id = :issue_submitter_id
)

SELECT 
    affected_user_id,
    MAX(X_score) as X_score  -- If multiple paths, take highest
FROM social_relations_scored
WHERE X_score IS NOT NULL
GROUP BY affected_user_id;
```

---

## Part 6: Combined Relevance Score

### 6.1 Weighted Sum

$$\text{Relevance}_i = w_D \cdot D_i + w_G \cdot G_i + w_S \cdot S_i + w_X \cdot X_i$$

**Constraints**:
- $w_D + w_G + w_S + w_X = 1.0$ (normalized)
- Each weight ∈ [0.0, 1.0]
- All D, G, S, X scores ∈ [0.0, 1.0]
- **Result**: Relevance ∈ [0.0, 1.0] (absolute probability)

### 6.2 Absolute Probability Interpretation

- **0.9-1.0**: Critical relevance (directly affected)
- **0.6-0.9**: High relevance (noticeably affected)
- **0.3-0.6**: Moderate relevance (somewhat affected)
- **0.1-0.3**: Low relevance (peripherally affected)
- **0.0-0.1**: Minimal relevance (affected but very indirectly)

### 6.3 Microcommunity Formation

**Microcommunity** = all users with Relevance > threshold

**Default threshold**: 0.15 (can be adjusted per issue)

```sql
SELECT 
    user_id,
    D_score,
    G_score,
    S_score,
    X_score,
    (w_D * D_score + w_G * G_score + w_S * S_score + w_X * X_score) 
        as relevance_score
FROM relevance_scores
WHERE relevance_score > 0.15
ORDER BY relevance_score DESC
LIMIT 1000;
```

---

## Part 7: Database Schema

### 7.1 Issues Table

```sql
CREATE TABLE issues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starts TIMESTAMP DEFAULT NOW(),
    ends TIMESTAMP,
    budget INT DEFAULT 0,
    
    -- Classification
    category VARCHAR(100),
    issue_vector VECTOR(1536) NOT NULL,  -- Vertex AI embedding
    
    -- Geospatial (Threshold Gaussian)
    location GEOGRAPHY(POINT, 4326),
    mu_distance_meters FLOAT,   -- Primary zone radius
    sigma_decay_meters FLOAT,   -- Decay steepness
    
    -- Weights (locked after submission)
    w_demographic FLOAT NOT NULL,
    w_geographic FLOAT NOT NULL,
    w_semantic FLOAT NOT NULL,
    w_social FLOAT NOT NULL,
    
    -- Metadata
    submitter_id UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'open',
    
    -- Constraints
    CONSTRAINT weights_sum CHECK (
        ABS((w_demographic + w_geographic + w_semantic + w_social) - 1.0) < 0.001
    )
);

CREATE INDEX idx_issues_location ON issues USING GIST (location);
CREATE INDEX idx_issues_vector ON issues USING hnsw (issue_vector vector_cosine_ops);
CREATE INDEX idx_issues_status ON issues(status);
```

### 7.2 Microcommunities Table

**issue_scope** - an important feature. It evaluates the scope of the issue that created mirocommunity in local currency - ISR points. A new ISR point is emitted when some micricommunity action is regestered in the system. It increases the issue score.

```sql
CREATE TABLE microcommunities (
    microcommunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL UNIQUE REFERENCES issues(issue_id) ON DELETE CASCADE,
    threshold_relevance FLOAT DEFAULT 0.15,
    member_count INT DEFAULT 0,
    member_accepted INT DEFAULT 0,
    issue_scope INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX idx_microcommunities_issue ON microcommunities(issue_id);
```

### 7.3 Microcommunity Members Table

```sql
CREATE TABLE microcommunity_members (
    microcommunity_id UUID NOT NULL REFERENCES microcommunities(microcommunity_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    -- Component scores (stored for auditability and recalculation efficiency)
    D_score FLOAT NOT NULL CHECK (D_score >= 0 AND D_score <= 1),
    G_score FLOAT NOT NULL CHECK (G_score >= 0 AND G_score <= 1),
    S_score FLOAT NOT NULL CHECK (S_score >= 0 AND S_score <= 1),
    X_score FLOAT NOT NULL CHECK (X_score >= 0 AND X_score <= 1),
    
    -- Final score
    relevance_score FLOAT NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 1),
    
    -- Tracking
    calculated_at TIMESTAMP DEFAULT NOW(),
    notified_at TIMESTAMP,
    accepted_rejected BOOLEAN DEFAULT NULL,
    dispute_reason TEXT,
    
    PRIMARY KEY (microcommunity_id, user_id)
);

CREATE INDEX idx_members_relevance ON microcommunity_members(microcommunity_id, relevance_score DESC);
```

## Part 8: Vectorization Protocols

### 8.1 User Profile Vectorization

**When user profile created/updated:**

1. **Extract text** from interests, values, profession, skills, features
2. **Call Vertex AI Embedding API**:
   ```python
   from vertexai.language_models import TextEmbeddingModel
   model = TextEmbeddingModel.from_pretrained("text-embedding-004")
   embeddings = model.get_embeddings([combined_text])
   vector = embeddings[0].values  # 1536-dim
   ```
3. **Store**: `users.interest_vector`
4. **Trigger**: Recalculate relevance for all active issues if this user is affected

### 8.2 Issue Vectorization

**When issue submitted:**

1. **Concatenate**: Title + description
2. **Call Vertex AI**:
   ```python
   embeddings = model.get_embeddings([issue_text])
   vector = embeddings[0].values  # 1536-dim
   ```
3. **Store**: `issues.issue_vector`

---

## Part 9: Issue Submission Workflow

```
User submits issue (title + description + location)
    ↓
System vectorizes description (Vertex AI)
    ↓
LLM analyzes issue:
  - Extracts category
  - Decides demographic SQL conditions
  - Suggests μ and σ
  - Suggests w_D, w_G, w_S, w_X
    ↓
User reviews & adjusts (optional):
  - Confirms/corrects category
  - Adjusts μ and σ
  - Adjusts weights
    ↓
System locks parameters and creates issue record
    ↓
Calculate Relevance for all users:
  - Apply demographic SQL filter
  - Calculate geospatial (PostGIS + Gaussian)
  - Calculate semantic (pgvector cosine)
  - Calculate social (depth-1 graph)
  - Combine with weights
    ↓
Form Microcommunity (users with Relevance > threshold)
    ↓
Notify microcommunity members
    ↓
Members accept or decline participation during provided time along with the issue discussion
    ↓
Voting phase begins

```
