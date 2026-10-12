# ISR Relevance Engine: MVP Implementation Specification v1.0

## Overview

The ISR Relevance Engine calculates which users are meaningfully affected by each civic issue using four independent dimensions:

| Dimension | Processing | Output |
|-----------|-----------|--------|
| **Demographic (D)** | NoSQL document evaluation | 0.0-1.0 |
| **Geospatial (G)** | Threshold Gaussian (Haversine) | 0.0-1.0 |
| **Semantic (S)** | In-memory cosine similarity (768-dim) | 0.0-1.0 |
| **Social (X)** | Social graph step function | 0.0-1.0 |

**Final Score [0.0-1.0]**: $\text{Relevance}_i = w_D \cdot D_i + w_G \cdot G_i + w_S \cdot S_i + w_X \cdot X_i$

---

## Relevance Processing Pipeline (At Scale)

To scale the Relevance Engine to dozens of millions of users without performing expensive vector similarity or social graph calculations on the entire database, the evaluation must follow a strict, sequential pipeline running in Firebase Cloud Functions:

1. **Phase 1: Demographic Filtering (D)**
   * **Action**: Apply local logical filtering on demographic criteria (e.g., age, employment, family status) from user metadata stored in Firestore.
   * **Outcome**: Excludes unqualified users immediately. For a large population $N$, this reduces the candidate pool to a subset $N_{demo}$ (typically 1-5% of the total).

2. **Phase 2: Geospatial Filtering (G)**
   * **Action**: Calculate geographic Haversine distances from the issue epicenter *only* for the survivors of Phase 1. Apply a hard distance threshold (e.g., $d \le \mu + 3\sigma$, beyond which $G(d) \approx 0.01$).
   * **Outcome**: Filters the pool down to $N_{geo}$ candidates who are geographically affected (typically hundreds to a few thousand).

3. **Phase 3: Mathematical Pruning & Semantic Similarity (S)**
   * **Action**: For the candidates surviving Phase 2, calculate an upper-bound max score assuming a perfect semantic similarity ($S = 1.0$). If the upper bound `w_D * D + w_G * G + w_S * 1.0 + w_X * X` is less than or equal to the relevance threshold (0.15), prune the candidate immediately. For the remaining top candidates (up to 300), fetch their 768-dimensional interest vectors from the `user_vectors` collection in Firestore and calculate the actual cosine similarity against the issue vector.
   * **Outcome**: Minimizes database reads and avoids downloading millions of high-dimensional vectors, performing semantic calculations only for the top candidates.

4. **Phase 4: Social Connections (X)**
   * **Action**: Resolve direct social network relations to the issue submitter *only* for the candidates who have high scores in the previous steps.
   * **Outcome**: Applies social proximity adjustments (spouse/family/friend) to finalize the relevance score.

This sequential pipeline and mathematical pruning ensure maximum processing efficiency, reduce database reads/computational cost, and make the system viable for NoSQL scaling.

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

**Processing**: Local NoSQL document evaluation in JavaScript based on LLM-decided conditions

**Data Fields Used**:
- Age (birthDate)
- Employment status (post[].job)
- Family status (socialRelations types)
- Health conditions (stored in profile)
- Education level (skills[].educationLevel)
- Location/Housing type (geography[].unit_type)

**Calculation**: 
- Conditions set by LLM during issue analysis (e.g. minAge, maxAge, employmentStatus, familyStatus)
- Returns discrete values: 0.0 (excluded) or category-specific scores (0.2, 0.5, 1.0)

**Example**:
```javascript
// Childcare issue
const relations = user.socialRelations || [];
const hasChildren = relations.some(r => ['child', 'son', 'daughter'].includes(r.type ? r.type.toLowerCase() : ""));
const hasGrandchildren = relations.some(r => ['grandchild', 'grandson', 'granddaughter'].includes(r.type ? r.type.toLowerCase() : ""));
if (hasChildren) {
  D_score = 1.0;
} else if (hasGrandchildren) {
  D_score = 0.5;
} else {
  D_score = 0.0;
}
```

**Purpose**: Filter out clearly unaffected users before expensive geospatial and semantic calculations

---

#### **Dimension 2: Geospatial Relevance (G)**

**Question**: "Am I geographically affected by this issue?"

**Processing**: Threshold Gaussian distance decay using Haversine calculation from issue epicenter

**Function**:
$$G(d) = \begin{cases}
1.0 & \text{if } d \leq \mu \\
e^{-\frac{(d - \mu)^2}{2\sigma^2}} & \text{if } d > \mu
\end{cases}$$

Where:
- **d** = Distance (meters) from issue location to user's primary anchor (home or work) calculated using Haversine formula
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

**Data**: user.geography[].geo (array `[latitude, longitude]`) and issue location GeoPoint

---

#### **Dimension 3: Semantic Relevance (S)**

**Question**: "Does this issue relate to my interests/expertise?"

**Processing**: In-memory cosine similarity between user interest vector and issue vector

**Function**:
$$S_i = \max(0, \text{cosine\_similarity}(u_i, q))$$

Where:
- **u_i** = User i's interest vector (768-dim, Google AI Studio text-embedding-004)
- **q** = Issue description vector (768-dim)
- **Clamp to 0**: Disinterest doesn't subtract (soft scaling)

**Range**: 0.0 (opposite interests) to 1.0 (identical interests)

**Implementation**: Vector dot product and normalization calculation in JavaScript

**Data**:
- From user profile: `profile_vector` fetched from `user_vectors` collection in Firestore
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
  "socialRelations": [
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

**During issue submission**, Google AI Studio analyzes the issue description to suggest weights. The evaluation is conducted according to the guidelines in [ISR-AI-Weight-Evaluation-Instructions.md](ISR-AI-Weight-Evaluation-Instructions.md), using the 100-issue benchmarks in [ISR-Relevance-Weight-Examples-100.md](ISR-Relevance-Weight-Examples-100.md) and [ISR-Issue-Aggregation-Weight-Examples-100.md](ISR-Issue-Aggregation-Weight-Examples-100.md) to set weights for the issue type:

1. **Taxonomy Category**: Extracted from description (e.g. `building.security.locks`)
2. **Demographic Conditions**: Structured JSON-based filtering criteria (e.g., familyStatus, employmentStatus)
3. **Geospatial Parameters**: μ and σ suggestions
4. **Weights**: Suggests both relevance component weights `(w_D, w_G, w_S, w_X)` and issue aggregation weights `(w_Relevance, w_Expertise, w_Contribution)` that sum to 1.0.

> [!IMPORTANT]
> **The Fallback Weights Rule (40% / 30% / 30%)**:
> The standard baseline default of **40% Relevance / 30% Expertise / 30% Contribution** is **strictly a fallback baseline**. It must **ONLY** be used when the issue description is too vague, ambiguous, or lacks sufficient context to calculate precise weights.
> Under the standard pipeline, if the issue description is clear, the system **must** output custom, precise aggregation weights (e.g., $50\% / 20\% / 30\%$ for community social clubs like the Chess club) mapped from matching benchmarks in `ISR-Issue-Aggregation-Weight-Examples-100.md`.

**Weight Assignment Examples** (For reference, detailed in benchmark files):

| Issue Type | Category | Typical w_D | w_G | w_S | w_X | w_Relevance | w_Expertise | w_Contribution | Rationale |
|-----------|----------|-------------|-----|-----|-----|-------------|-------------|----------------|-----------|
| Door lock broken | building.security.locks | 0.30 | 0.50 | 0.05 | 0.15 | 0.70 | 0.10 | 0.20 | Lived geographic proximity and building demographics dominate; expert advice is minor. |
| Childcare services | health.access.childcare | 0.70 | 0.25 | 0.03 | 0.02 | 0.65 | 0.20 | 0.15 | Parents of young children are primary; professional expertise is secondary. |
| Open-source roadmap | platform.policy.oss | 0.35 | 0.05 | 0.45 | 0.15 | 0.40 | 0.35 | 0.25 | Semantic interest and technical expertise are co-primary; geography is minor. |

**AI decides final weights during issue analysis based on issue context and matching benchmarks.**

---

## Part 2: Demographic Relevance Calculation

### 2.1 JSON-Based Binary Filtering

Demographic relevance is calculated in Firebase Cloud Functions by evaluating logical JSON-based conditions against the user profile.

**Purpose**: First-stage filter to exclude clearly unaffected users before expensive geospatial/semantic calculations.

**Process**:

1. **AI analyzes issue** during submission and generates demographic criteria rules (e.g., employmentStatus, familyStatus, minAge, maxAge).
2. **Apply criteria rules** to user documents fetched from Firestore `user_packs` (metadata packs) to filter users into discrete relevance tiers.
3. **Return D_score**: Discrete value (0.0, 0.2, 0.5, 1.0) based on target criteria matching. If a user receives a `0.0` demographic score and `w_D > 0`, they are excluded from the candidate pool immediately.

### 2.2 Implementation Pattern

**Example: Demographic Evaluation in Cloud Function JavaScript**

```javascript
function evaluateDemographics(user, criteria) {
  if (!criteria) return 1.0;

  // 1. Age check
  if (user.birthDate) {
    const birthYear = parseInt(user.birthDate.split("-")[0]);
    if (!isNaN(birthYear)) {
      const age = new Date().getFullYear() - birthYear;
      if (criteria.minAge !== undefined && age < criteria.minAge) return 0.0;
      if (criteria.maxAge !== undefined && age > criteria.maxAge) return 0.0;
    }
  }

  // 2. Employment check
  if (criteria.employmentStatus && criteria.employmentStatus !== "any") {
    const isEmployed = Array.isArray(user.post) && user.post.length > 0;
    if (criteria.employmentStatus === "employed" && !isEmployed) return 0.0;
    if (criteria.employmentStatus === "unemployed" && isEmployed) return 0.0;
  }

  // 3. Family status check
  if (criteria.familyStatus && criteria.familyStatus !== "any") {
    const relations = user.socialRelations || [];
    const hasChildren = relations.some((r) =>
      ["child", "son", "daughter"].includes(r.type ? r.type.toLowerCase() : "")
    );
    const hasGrandchildren = relations.some((r) =>
      ["grandchild", "grandson", "granddaughter"].includes(r.type ? r.type.toLowerCase() : "")
    );

    if (criteria.familyStatus === "parent" && !hasChildren) return 0.0;
    if (criteria.familyStatus === "grandparent" && !hasGrandchildren) return 0.0;
  }

  return 1.0;
}
```

### 2.3 Demographic Conditions by Issue Type

**The AI generates criteria based on issue category. Examples:**

| Issue Category | D_score = 1.0 | D_score = 0.5 | D_score = 0.0 (Excluded if w_D > 0) |
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

---

## Part 3: Geospatial Relevance Calculation

### 3.1 Threshold Gaussian Distance Decay

Geospatial relevance uses **threshold Gaussian** distance decay calculated on geographic coordinates:

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
| District / Social Club Event (e.g. Chess club) | 500-2000 | 200-4000 |
| City-wide (transit, budget) | 2000-10000 | 500-2000 |

**User can override both μ and σ before issue submission.**

### 3.3 JavaScript Implementation (Haversine & Gaussian Decay)

```javascript
// Helper: Haversine distance in meters
function haversineDistance(coords1, coords2) {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coords1[0] * Math.PI) / 180;
  const lat2 = (coords2[0] * Math.PI) / 180;
  const deltaLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function evaluateGeographics(user, issueLocation, muVal, sigmaVal) {
  const homeAnchor = (user.geography || []).find((g) => g.type === "home");
  if (!homeAnchor || !homeAnchor.geo) return 0.0;

  const distance = haversineDistance(issueLocation, homeAnchor.geo);
  const maxDistance = muVal + 3 * sigmaVal;
  if (distance > maxDistance) return 0.0; // Excluded by distance threshold

  if (distance <= muVal) return 1.0;
  return Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
}
```

---

## Part 4: Semantic Relevance Calculation

### 4.1 Cosine Similarity

**Formula**:
$$S_i = \max(0, \text{cosine\_similarity}(u_i, q))$$

### 4.2 Vector Sources

**User Interest Vector**:
- Concatenate: tags + values + professional field + activity history
- Vectorize during profile creation/update
- Store in: `user_vectors` Firestore collection, document ID = user UID, field `profile_vector` (768-dim array)

**Issue Vector**:
- Vectorize issue description using Google AI Studio
- Store in: `issues` collection, document ID = issue ID, field `issue_vector` (768-dim array)
- Created during issue submission

### 4.3 JavaScript Implementation (In-Memory Cosine Similarity)

```javascript
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate Semantic score (S)
let sScore = 0.0;
if (w_S > 0) {
  sScore = Math.max(0.0, cosineSimilarity(issueVector, userVector));
}
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
2. **Access their social relations**: From user profile (`socialRelations` field)
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
  "socialRelations": [
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

### 5.4 JavaScript Implementation

```javascript
let xScore = 0.0;
const relation = submitterRelations.find((r) => r.relative === user.uid);
if (relation) {
  if (relation.tie !== undefined && relation.tie !== null) {
    xScore = parseFloat(relation.tie) || 0.0;
  } else {
    const type = relation.type ? relation.type.toLowerCase() : "";
    if (["spouse", "partner", "wife", "husband"].includes(type)) xScore = 0.3;
    else if (["parent", "father", "mother", "child", "son", "daughter", "sibling", "sister", "brother"].includes(type)) xScore = 0.2;
    else if (["grandparent", "grandfather", "grandmother", "grandchild", "grandson", "granddaughter", "close friend"].includes(type)) xScore = 0.1;
  }
}
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

### 6.3 Ad-Hoc Public Formation & Scaling Pruning

To form the **Ad-hoc Public** (the *Public of Appearance* — all users with Relevance > 0.15 threshold), we perform in-memory evaluation with mathematical pruning inside Firebase Cloud Functions to scale efficiently without scanning the entire vector database:

```javascript
// 1. First Pass: Local calculation using demographics, distance, and social graph
// We assume the maximum possible semantic similarity (S = 1.0)
const maxScore = w_D * dScore + w_G * gScore + w_S * 1.0 + w_X * xScore;

// Prune immediately if the user cannot mathematically exceed the threshold
if (maxScore <= 0.15) return; 

// 2. Sort remaining candidate pool by maxScore descending
filteredCandidates.sort((a, b) => b.maxScore - a.maxScore);

// 3. Limit vector fetches to the top 300 candidates
const candidatesToFetch = filteredCandidates.slice(0, 300);

// 4. Batch-fetch 768-dimensional interest vectors from `user_vectors` for the top 300
const vectorDocs = await db.getAll(...chunkRefs);

// 5. Compute actual relevance score with in-memory Cosine Similarity
const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

// 6. Gather into the Ad-hoc Public if final score > 0.15
if (relevanceScore > 0.15) {
  microcommunityMembers.push({
    user_id: user.uid,
    relevance_score: relevanceScore
  });
}
```

---

## Part 7: Database Schema (Firebase Firestore NoSQL)


### 7.1 issues Collection

Each document represents a submitted issue.
- **Document ID**: Auto-generated unique string.
- **Fields**:
```json
{
  "issue_id": "unique-uuid-string",
  "title": "String",
  "description": "String",
  "starts": "Timestamp",
  "ends": "Timestamp (optional)",
  "budget": 0,
  "category": "String (e.g. building.security.locks)",
  "issue_vector": [0.034, -0.012, ..., 0.009], // Array of 768 numbers (Google AI Studio)
  "location": "GeoPoint (Latitude, Longitude)",
  "mu_distance_meters": 30.0,
  "sigma_decay_meters": 40.0,
  "w_demographic": 0.30,
  "w_geographic": 0.50,
  "w_semantic": 0.05,
  "w_social": 0.15,
  "w_relevance": 0.40, // default weight for aggregation
  "w_expertise": 0.30, // default weight for aggregation
  "w_contribution": 0.30, // default weight for aggregation
  "submitter_id": "String (UID)",
  "status": "String (e.g. open)",
  "created_at": "Timestamp",
  "expertise_depth": "String (e.g. None)"
}
```

### 7.2 microcommunities Collection (Ad-hoc Public Records)

Tracks ad-hoc public general statistics.
- **Document ID**: Auto-generated unique string.
- **Fields**:
```json
{
  "microcommunity_id": "mc-uuid-string",
  "issue_id": "issue-uuid-string",
  "threshold_relevance": 0.15,
  "member_count": 0,
  "member_accepted": 0,
  "issue_scope": 0, // Scope in local ISR points
  "created_at": "Timestamp",
  "status": "String (active/closed)"
}
```

### 7.3 microcommunity_members Collection (Ad-hoc Public Members)

Tracks relevance component scores for members of the public.
- **Document ID**: `${microcommunity_id}_${user_id}`
- **Fields**:
```json
{
  "microcommunity_id": "mc-uuid-string",
  "user_id": 37, // Number or String UID
  "displayName": "Mio Watanabe",
  "D_score": 1.0,
  "G_score": 1.0,
  "S_score": 0.65,
  "X_score": 0.20,
  "relevance_score": 0.95,
  "calculated_at": "Timestamp",
  "accepted_rejected": null // boolean or null
}
```

### 7.4 user_packs Collection (Partitioned Metadata Storage)

Stores user profile metadata chunked into documents of up to 250 users to optimize database reads.
- **Document ID**: `pack_${index}`
- **Fields**:
```json
{
  "users": [
    {
      "uid": 1003,
      "displayName": "Marco Hirt",
      "birthDate": "1985-05-12",
      "gender": "Male",
      "post": [{"job": "Locksmith", "place": "Basel"}],
      "socialRelations": [{"relative": 37, "type": "friend", "tie": 0.5}],
      "geography": [{"type": "home", "geo": [47.5943, 7.6205]}]
    },
    ...
  ]
}
```

### 7.5 user_vectors Collection (Separated High-Dimensional Data)

Stores 768-dimensional interest vector arrays separately to prevent payload bloat.
- **Document ID**: String user UID (e.g. "1003")
- **Fields**:
```json
{
  "uid": 1003,
  "profile_vector": [0.012, -0.054, ..., 0.038] // 768-dimension array (Google AI Studio)
}
```

---

## Part 8: Vectorization Protocols

### 8.1 User Profile Vectorization

**When user profile created/updated:**

1. **Extract text** from interests, values, profession, skills, features.
2. **Call Google AI Studio Embedding API** (`text-embedding-004`):
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const embedResult = await embedModel.embedContent(combined_text);
const vector = embedResult.embedding.values; // 768-dimensional array
```
3. **Store**: `user_vectors` collection under user's UID document as `profile_vector`.
4. **Trigger**: Recalculate relevance for active issues.

### 8.2 Issue Vectorization

**When issue submitted:**

1. **Concatenate**: Title + description.
2. **Call Google AI Studio Embedding API**:
```javascript
const embedResult = await embedModel.embedContent(issue_text);
const vector = embedResult.embedding.values; // 768-dimensional array
```
3. **Store**: `issues` collection document as `issue_vector`.

---

## Part 9: Issue Submission Workflow

```
User submits issue (title + description + location)
    ↓
System vectorizes description (Google AI Studio text-embedding-004, 768-dim)
    ↓
AI analyzes issue weights (Google AI Studio) using instructions from
ISR-AI-Weight-Evaluation-Instructions.md (referencing Examples-100 files):
  - Extracts category
  - Suggests demographic JSON criteria
  - Suggests μ and σ
  - Suggests w_D, w_G, w_S, w_X (Relevance weights)
  - Suggests w_Relevance, w_Expertise, w_Contribution (Aggregation weights)
    ↓
User reviews & adjusts parameters (optional)
    ↓
System locks parameters and writes issue to Firestore collection
    ↓
Recalculate Relevance for all users in Firestore:
  - Phase 1: Local NoSQL Demographic evaluation from user_packs
  - Phase 2: Local Haversine distance & Gaussian G_score calculation
  - Phase 3: Prune candidates if maxScore <= 0.15
  - Phase 4: Fetch actual profile_vectors from user_vectors for top 300
  - Phase 5: In-memory Cosine Similarity & combine with weights
    ↓
Form Ad-hoc Public (relevance_score > 0.15) and save members to Firestore
    ↓
Notify members and launch discussion/voting phases
    ↓
(Optional) Users can decline participation during discussion phase
    ↓
Voting phase begins
```
