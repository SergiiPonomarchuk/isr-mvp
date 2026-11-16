# ISR Relevance Engine: MVP Implementation Specification v1.0

**2026-11-16 intended-model revision:** [PD-9 multi-reference derivation](../specs/decisions/PD-9-multi-reference-derivation.md) governs reference selection, notation and member-score combination. Runtime at3c25ef7 still uses the earlier single-vector model. Sections explicitly marked historical are not implementation instructions for mr1.

## Overview

The ISR Relevance Engine calculates which users are meaningfully affected by each civic issue using four independent dimensions:

| Dimension | Processing | Output |
|-----------|-----------|--------|
| **Demographic (D)** | NoSQL document evaluation | 0.0-1.0 |
| **Geospatial (G)** | Threshold Gaussian (Haversine) | 0.0-1.0 |
| **Semantic (S)** | In-memory cosine similarity (768-dim) | 0.0-1.0 |
| **Social (X)** | Social graph step function | 0.0-1.0 |

**Final score [0,1]:** use the PD-9 paired sum across references. A four-component display uses effective components and weights W_d, so its displayed products reconstruct exactly the same total.

The ad-hoc public is formed from the issue's parameters, and the parameters follow from the issue type and the context. Nobody types a number. After publication the public can change the text, the options, the issue type and the context until voting opens (Part 10), and the parameters are derived again. Relevance is absolute, so adding a member does not change anyone else's relevance score.

---

## Relevance processing order for mr1

1. Freeze actual context, compatible reference chain, alpha, aspect vectors/rules and one geographical center/max-mu/max-sigma curve.
2. Retrieve candidates across D/G/S channels and compute blended direct r0 without X. A is exactly r0>=Theta; no separate seed predicate or old top100 cap applies to the new formation policy.
3. Expand one social step using affected people's recorded outgoing links. Do not prefilter these candidates to residents or people already scoring above the formation threshold.
4. Compute paired D/G/S/X contributions, with the upper bound sum_j alpha_j*(w_Dj*D_ij+w_Gj*G_i+w_Sj*1+w_Xj*X_ij) when S remains unknown. Prune only with a proven bound that preserves all channels. Current top300 approximations/cutoff bypasses require a full-population comparison before adoption.
5. Form A union B under the new versioned inclusive/direct-threshold and automatic-relative policy; compute combined Expertise and one-public normalized ISR. E and ISR aggregation weights do not determine automatic membership.

The earlier demographic-first, geography-first, creator-network pipeline is superseded in the intended model. Runtime integration is pending; no scaling percentages or coverage guarantees are established by this document.

## Part 1: Relevance Taxonomy & Issue Classification

### 1.1 Relevance Definition

Relevance is a **continuous affectedness score (0.0-1.0)** measuring how much an issue and its solution will **directly affect a specific person**.

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
- **d** = Distance (meters) from the issue location to the nearest of the user's declared places (types `home`, `work` and `property`: a property registered in the system), calculated using the Haversine formula. A person who works at the issue location (an owner or staff of a business or organisation) has stake through the workplace anchor, and so does the owner of a property registered at the issue location; each is counted as a person with the same formula; there are no representatives
- **μ** = Primary impact zone radius (meters) - where decay begins
- **σ** = Decay steepness parameter (meters)

**Parameters** (set per issue):
- **μ (mu)**: Maximum across compatible selected references, using the actual issue center (PD-9)
- **σ (sigma)**: Maximum across compatible selected references, using the actual issue center (PD-9)

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
$$S_i = \max(0, \cos(u_i, V_q))$$

Where:
- **u_i** = User i's interest vector (768-dim, Google AI Studio text-embedding-004)
- **V_q** = Vector representation of issue q (768-dim)
- **Clamp to 0**: Disinterest doesn't subtract (soft scaling)

**Range**: 0.0 (opposite interests) to 1.0 (identical interests)

**Implementation**: Vector dot product and normalization calculation in JavaScript

**Data**:
- From user profile: `profile_vector` fetched from `user_vectors` collection in Firestore
- From issue: Description text vectorized during issue submission

---

#### **Dimension 4: Social Graph Relevance (X)**

### Affected-person social relevance

Use PD-9's two-phase rule: blended weighted D/G/S>=Theta forms A, with no X bonus. One-step eligible outgoing relatives belowTheta form B regardless of final R. For each supplying A, accept the full weighted tie addition only if r0_B+W_X*t_AB<=r0_A; otherwise reject that addition. Choose the maximum eligible addition across sources, or0 if none. Do not partially cap the addition, require B to crossTheta, recruit through B or silently truncate membership.

### 1.3 Issue Analysis & Weight Assignment

**During issue submission**, Google AI Studio analyzes the issue description to suggest weights. The evaluation is conducted according to the guidelines in [ISR-AI-Weight-Evaluation-Instructions.md](ISR-AI-Weight-Evaluation-Instructions.md), using the 100-issue benchmarks in [ISR-Issue-Analyzer-100-Examples.md](ISR-Issue-Analyzer-100-Examples.md) to set weights for the issue type:

1. **Taxonomy Category**: Extracted from description (e.g. `building.security.locks`)
2. **Demographic Conditions**: Structured JSON-based filtering criteria (e.g., familyStatus, employmentStatus)
3. **Geospatial Parameters**: μ and σ suggestions
4. **Weights**: Suggests both relevance component weights `(w_D, w_G, w_S, w_X)` and issue aggregation weights `(w_Relevance, w_Expertise, w_Contribution)` that sum to 1.0.

> [!IMPORTANT]
> **No fallback weights.** If the description and the context are too vague to choose an issue type, the result is `needs_clarification` (Analyzer protocol, Step 4A); if no consistent type is found, it is `not_consistent`.
> For every published issue the weights are derived from the chosen type and the context, and follow PD-9.

**Weight Assignment Examples** (For reference, detailed in benchmark files):

| Issue Type | Category | Typical w_D | w_G | w_S | w_X | w_Relevance | w_Expertise | w_Contribution | Rationale |
|-----------|----------|-------------|-----|-----|-----|-------------|-------------|----------------|-----------|
| Door lock broken | building.security.locks | 0.30 | 0.50 | 0.05 | 0.15 | 0.70 | 0.10 | 0.20 | Lived geographic proximity and building demographics dominate; expert advice is minor. |
| Childcare services | health.access.childcare | 0.70 | 0.25 | 0.03 | 0.02 | 0.65 | 0.20 | 0.15 | Parents of young children are primary; professional expertise is secondary. |
| Open-source roadmap | platform.policy.oss | 0.35 | 0.05 | 0.45 | 0.15 | 0.40 | 0.35 | 0.25 | Semantic interest and technical expertise are co-primary; geography is minor. |

**AI decides final weights during issue analysis based on issue context and matching benchmarks.**

The Analyzer derives the parameters from a published table of typical issues, for the issue type and context. Nobody types a number: if the result looks wrong, the topic starter clarifies the context or picks another type that the assistant lists as consistent with the rules (Analyzer protocol, Step 4A). After publication the issue belongs to the public (Part 10).

---

## Part 2: Demographic Relevance Calculation

### 2.1 Per-reference affectedness

Evaluate D_ij for each person's actual-context rules under reference j. Do not average categorical ages/statuses/features/places or pre-exclude a person because one rule returns0. PD-9 combines paired demographic contributions with other channels. A3 named place/property behavior and A5 residential guard remain baseline constraints to revalidate per reference; the exact soft-D rule and candidate retrieval must be specified before runtime implementation.

The older binary early-exclusion sketches are superseded by PD-1/PD-9. This document does not claim that current code has removed its gates.

## Part 3: Geospatial Relevance Calculation

### 3.1 Threshold Gaussian Distance Decay

Geospatial relevance uses **threshold Gaussian** distance decay calculated on geographic coordinates:

**Formula**:
$$G(d) = \begin{cases}
1.0 & \text{if } d \leq \mu \\
e^{-\frac{(d - \mu)^2}{2\sigma^2}} & \text{if } d > \mu
\end{cases}$$

### 3.2 Parameter Assignment

**Derived from the Issue Type and Context**:

| Issue Type Pattern | Suggested μ (meters) | Suggested σ (meters) |
|---|---|---|
| Personal (lock, appliance, unit) | 10-20 | 20-30 |
| Building (elevator, heating, roof) | 30-80 | 40-60 |
| Street (noise, lighting, parking) | 100-300 | 80-150 |
| Block/Neighborhood | 300-1000 | 150-300 |
| District (water main, zoning) | 500-2000 | 200-500 |
| District / Social Club Event (e.g. Chess club) | 500-2000 | 200-4000 |
| City-wide (transit, budget) | 2000-10000 | 500-2000 |

**Nobody types μ or σ.** If the derived values look wrong, the topic starter clarifies the context (for example, "it is very popular and draws people from the whole neighbourhood") and the assistant derives them again, using the PD-9 compatible-reference maximum rule. The table can contain as many types as needed; new types are added by protocol-level decisions.

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
  const anchors = (user.geography || []).filter(
    (g) => (g.type === "home" || g.type === "work" || g.type === "property") && g.geo
  );
  if (anchors.length === 0) return 0.0;

  // nearest declared place (home, work or registered property)
  const distance = Math.min(...anchors.map((g) => haversineDistance(issueLocation, g.geo)));
  const maxDistance = muVal + 3 * sigmaVal;
  if (distance > maxDistance) return 0.0; // Excluded by distance threshold

  if (distance <= muVal) return 1.0;
  return Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
}
```

---

## Part 4: Semantic Relevance Calculation

### 4.1 Per-aspect semantic relevance

S_ij=max(0,cos(p_i,u_j)), where p_i is the existing person profile vector and u_j represents an evidenced aspect of the actual submitted issue associated with reference j. Reference retrieval score s_j is a different quantity. Never replace u_j with a reference example's topic vector. PD-9 defines the effective S display and paired semantic contribution; vectors/templates/coverage must be versioned and consistent with skill embeddings.

## Part 5: Social Graph Relevance Calculation

### Affected-person social relevance

PD-9's two-phase A/B membership and social-limit section is normative. A is determined by the weighted direct score>=Theta; B comprises eligible outgoing relatives of A outside A regardless of score. Source ceilings are checked individually before maximizing. Equality is accepted; an overflowing full addition is rejected, with no partial cap. Related B members remain members even with0 accepted X or0 total R. A and B do not generate further social hops.

## Part 6: Combined Relevance Score

### 6.1 Paired multi-reference Relevance

R_i=sum_j alpha_j*(w_Dj*D_ij+w_Gj*G_i+w_Sj*S_ij+w_Xj*X_ij). PD-9 defines W_d and effective component scores so a four-component display reconstructs this exact value. Multiplying separately averaged weights and scores is a different model. All validated inputs lie in[0,1], weight groups sum to1, hence R lies in[0,1].

### 6.2 Interpretation

R and reference similarities are scores, not calibrated probabilities. R determines automatic membership using the separately versioned formation policy, while E and ISR aggregation weights do not determine inclusion.

### 6.3 Ad-hoc Public Formation & Scaling Pruning

**Legacy single-vector sketch:** pending mr1 integration; PD-9 governs changed formulas, candidate safety and aspect/reference storage. Any early demographic/geographical gate here must not erase direct or social channels.

To form the **ad-hoc public** (all users with Relevance > 0.15 threshold), we perform in-memory evaluation with mathematical pruning inside Firebase Cloud Functions to scale efficiently without scanning the entire vector database:

```javascript
// 1. First Pass: Local calculation using demographics and distance
// We assume the maximum possible semantic similarity (S = 1.0) and the maximum possible social score:
// xBound = the largest tie weight among the user's relations (R0 of a relative is at most 1)
const maxScore = w_D * dScore + w_G * gScore + w_S * 1.0 + w_X * xBound;

// Prune immediately if the user cannot mathematically exceed the threshold
if (maxScore <= 0.15) return; 

// 2. Sort remaining candidate pool by maxScore descending
filteredCandidates.sort((a, b) => b.maxScore - a.maxScore);

// 3. Limit vector fetches to the top 300 candidates
const candidatesToFetch = filteredCandidates.slice(0, 300);

// 4. Batch-fetch 768-dimensional interest vectors from `user_vectors` for the top 300
const vectorDocs = await db.getAll(...chunkRefs);

// 5. Compute R0 (D, G, S only) for the candidates, then the exact social score
// xScore = max over relatives of tie * R0 (Part 5.4), and the actual relevance score with in-memory Cosine Similarity
const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

// 6. Gather into the ad-hoc public if final score > 0.15
if (relevanceScore > 0.15) {
  microcommunityMembers.push({
    user_id: user.uid,
    relevance_score: relevanceScore
  });
}
```

The same procedure (Phases 1 to 5) is run again after a change of text, options, type or context adopted by the public, with the parameters derived again (Part 10.4). A recomputation can add members and change scores; it never removes a member.

---

## Part 7: Database Schema (Firebase Firestore NoSQL)

**Legacy single-vector sketch:** pending mr1 integration; PD-9 governs changed formulas, candidate safety and aspect/reference storage. Any early demographic/geographical gate here must not erase direct or social channels.


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
  "expertise_depth": "String (e.g. None)",
  "issue_type": "street.traffic_limitation.proposal_to_authority",
  "outcome_kind": "proposal", // "decision" | "proposal"
  "addressee": "city transport department", // null for a decision
  "parameters_version": 1,
  "parameters_frozen": false,
  "voting_opened_at": null,
  "context_notes": [
    "No source is attached for the claim that the street is owned by the housing association.",
    "Type changed from street.traffic_limitation to ...proposal_to_authority because the context states that the city decides on traffic on public streets."
  ],
  "analyzer_run_id": "run-uuid-string"
}
```

The parameters are not typed by anyone. They are derived from the issue type and context. They change only when the public adopts a change of text, options, type or context (Part 10), and not at all once voting has opened (`parameters_frozen` = true).

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
  "status": "String (active/closed)",
  "parameters_version_at_formation": 1,
  "parameters_version_current": 1,
  "last_recomputed_at": "Timestamp"
}
```

### 7.3 microcommunity_members Collection (Ad-hoc Public Members)

Tracks relevance component scores for members.
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
  "accepted_rejected": null, // boolean or null
  "joined_via": "relevance", // "relevance" | "request"
  "joined_at": "Timestamp",
  "below_threshold": false, // true if relevance_score <= threshold after a recomputation
  "parameters_version": 1 // version used to compute the stored scores
}
```

A member is never removed by a recomputation. `below_threshold` only records that the person is a member whose relevance is now low: their weight follows their relevance and they keep information, speech and proposal.

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
      "geography": [{"type": "home", "geo": [47.5943, 7.6205]}, {"type": "work", "geo": [47.5602, 7.5886]}]
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

### 7.6 issue_changes Collection

One document per change proposed by a member of the ad-hoc public (text, options, issue type or context). Numbers, radii, weights and scope settings cannot be proposed.
- **Document ID**: Auto-generated unique string.
- **Fields**:
```json
{
  "change_id": "ch-uuid-string",
  "issue_id": "issue-uuid-string",
  "proposed_by": "String (UID of a member)",
  "proposed_at": "Timestamp",
  "kind": "context", // text | options | type | context
  "text": "Why the change is proposed",
  "from": "Previous text, options, type id or context",
  "to": "New text, options, type id or context",
  "consistency": { "result": "pass", "rules_applied": ["R-scope-01"], "cautions": [], "analyzer_run_id": "run-uuid-string" },
  "status": "open", // open | adopted | rejected | lapsed | returned (returned = not consistent with the rules)
  "vote_snapshot_id": "String", // weights snapshot taken when the vote on the change opened
  "vote_summary": { "weighted_for": 0.0, "weighted_against": 0.0, "participants": 0 },
  "adopted_at": null,
  "parameters_version_before": 1,
  "parameters_version_after": null,
  "members_added": null,
  "members_lowered": null
}
```

### 7.7 join_requests Collection

One document per request to join an issue's ad-hoc public.
- **Document ID**: `${issue_id}_${user_id}`
- **Fields**:
```json
{
  "issue_id": "issue-uuid-string",
  "user_id": "String (UID)",
  "requested_at": "Timestamp",
  "accepted_at": "Timestamp", // set at once; acceptance is automatic
  "computed_relevance": 0.04, // at the time of the request, for analysis only
  "parameters_version": 1
}
```

Every request is logged and can be analysed (for example, to see where the computed boundary and the requests differ). No filtering is applied.

---

## Part 8: Vectorization Protocols

**Legacy single-vector sketch:** pending mr1 integration; PD-9 governs changed formulas, candidate safety and aspect/reference storage. Any early demographic/geographical gate here must not erase direct or social channels.

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

**Legacy single-vector sketch:** pending mr1 integration; PD-9 governs changed formulas, candidate safety and aspect/reference storage. Any early demographic/geographical gate here must not erase direct or social channels.

```
User submits issue (title + description + location + context)
    ↓
System vectorizes description (Google AI Studio text-embedding-004, 768-dim)
    ↓
Assistant (Analyzer) works from the table of typical issues and the written rules
(instructions in ISR-AI-Weight-Evaluation-Instructions.md, examples in the Examples-100 files, which are the first version of the table):
  - Finds the nearest typical issue types and proposes one; lists the other types that are consistent with the rules
  - Derives from the table, for the type and context: category, demographic criteria, μ and σ,
    w_D, w_G, w_S, w_X, w_Relevance, w_Expertise, w_Contribution, legal-coverage flag
  - Checks scope and competence in the context (who decides under local rules, who owns it);
    advises the topic starter to check public information and to attach a source
  - If local rules reserve the decision for an authority: outcome kind = proposal, addressee = that authority,
    the type changes to the proposal type and the public widens as the table says
    ↓
Nobody types a number. If the result looks wrong, the topic starter clarifies the context
or picks another type from those the assistant lists as consistent; the assistant derives again
    ↓
Context check passes (Analyzer protocol, Step 4A). Cautions (for example, a missing source) do not block:
every member sees them on the issue page
    ↓
System writes the issue to Firestore (parameters_version = 1)
    ↓
Recalculate Relevance for all users in Firestore:
  - Phase 1: Local NoSQL Demographic evaluation from user_packs
  - Phase 2: Local Haversine distance (nearest of home, work and registered property) & Gaussian G_score calculation
  - Phase 3: Prune candidates if maxScore <= 0.15
  - Phase 4: Fetch actual profile_vectors from user_vectors for top 300
  - Phase 5: In-memory Cosine Similarity & combine with weights
    ↓
Form the ad-hoc public (relevance_score > 0.15) and save members to Firestore
    ↓
Notify members and launch the discussion phase
    ↓                                   ┌─ Any user can ask to join: accepted automatically,
Discussion (text, options, type and     ┤  logged, no filtering; the new member then has the
context can be changed)                 └─ same rights as the others (Part 10.6)
    ↓
Any member can propose a change of text, options, issue type or context
  → the assistant checks that it is consistent with the rules (returned if not)
  → the public votes (current ISR weights, simple majority)
  → adopted: parameters derived again (Analyzer protocol, Step 4B), recomputation (Part 10.4), members updated
    ↓
(Optional) Users can decline participation during discussion phase
    ↓
Voting phase begins: text, options, type and context are frozen (parameters_frozen = true)
    ↓
Voting closes; results are aggregated with the weights snapshot taken at opening
(for a proposal to an authority, the result is the content of the proposal; the authority's reaction is outside ISR)
```

---

## Part 10: Changes of Context, Joining and Recomputation

### 10.1 What can be changed

The text, the options, the issue type (among the types the assistant lists as consistent with the rules) and the context. Radius, weights, demographic criteria and scope and competence settings cannot be changed by hand or by vote: they follow from the type and context, and a scope setting changes only by reformulating the text or the context. A significant deviation from the listed types needs a significant reformulation. Nothing can be changed after voting opens, until it closes.

### 10.2 Who proposes and who decides

Any member can propose a change, at any time during discussion, with a short text that gives the reason. A proposed change of type or context first goes to the assistant for a consistency check (Analyzer protocol, Step 4B); if it is not consistent with the rules it is returned (`status` = `returned`) and cannot be voted on. A change that passed the check is decided by the public by the issue's own rule: the current ISR weights and a simple majority. A person outside the public cannot propose; they can join at once (10.6) and then propose. The topic starter has no special standing after publication: the issue belongs to its public.

### 10.3 Freeze

When voting opens, `parameters_frozen` becomes true. Change proposals that are still open lapse (`status` = `lapsed`) and can be raised again after the vote if the issue continues. Text, options, type and context cannot change until the vote has closed.

### 10.4 Recomputation after an adopted change

```javascript
async function onChangeAdopted(issueId, changeId) {
  const issue = await loadIssue(issueId);
  if (issue.parameters_frozen) throw new Error("frozen");
  const run = await analyzer.reanalyse(issue, change);      // Analyzer protocol, Step 4B: derives type and parameters from the table
  const newParams = run.derived_parameters;                  // never typed by anyone
  const version = issue.parameters_version + 1;
  await db.runTransaction(tx => {                            // one atomic change
    tx.update(issueRef, { ...newParams, issue_type: run.type, outcome_kind: run.outcome_kind,
                          addressee: run.addressee, parameters_version: version, context_notes: run.notes });
  });
  const results = await computeRelevance(issueId, newParams); // Phases 1 to 5 of Part 6.3
  let added = 0, lowered = 0;
  for (const u of results) {
    const m = await getMember(issueId, u.user_id);
    if (!m && u.relevance_score > threshold) { await addMember(issueId, u, "relevance", version); added++; }
    else if (m) {
      if (u.relevance_score < m.relevance_score) lowered++;
      await updateMember(issueId, u, { below_threshold: u.relevance_score <= threshold, parameters_version: version });
    }
  }                                                          // members are never removed
  await recordChange(changeId, { status: "adopted", parameters_version_after: version, members_added: added, members_lowered: lowered });
  await notify(issueId, { newMembers: true, changeSummary: true });
}
```

X is recomputed from the new $R^0$ of the relatives, so a change of place or topic can add or lower members through ties as well.

### 10.5 Weights are fixed when a vote opens

Relevance is absolute, so a recomputation does not change another member's relevance score. The final weights, however, are normalised to the public mean (and Contribution by the public's mean absolute Contribution plus one reference unit), which depends on who is in the public. They are therefore computed from the members and parameters at the moment a vote opens and stored as a snapshot (`vote_snapshot_id`). Each vote on a change and the issue's own vote have their own snapshot.

### 10.6 Joining on request

Any user can ask to join an issue's public. The request is accepted automatically, without filtering, and is logged (`join_requests`). Before joining, a person sees a limited view of the issue: the title, the category, the fact that a public exists, the number of members and the date the issue was registered. The full description, the discussion and the options are for members only. After joining the person has the rights of every member (read, speak, propose, vote) and a weight that follows their relevance; a member whose relevance is low has a low weight.

### 10.7 Proposals to an authority

When local rules reserve a decision for an authority, the issue is a proposal (`outcome_kind` = `proposal`). The public widens to everyone affected by the matter: residents, people who work in the area, owners and staff of organisations and businesses, each as a person with the same formula. There are no representatives. Financial facts, such as taxes paid by a business, give no weight; an owner or a member of staff can state them as an argument and propose an option with the deliberation tools. The result of the vote is the content of the proposal. The authority's reaction is outside ISR.

### 10.8 Audit

Every change, vote, recomputation and join request is logged with its version. Reports that can reveal gaming: the share of issues where changes alter the member list; the direction of those changes (enlarging or shrinking the public); changes returned by the assistant, by rule; the ratio of join requests to computed members.

### 10.9 Open points

A quorum for votes on changes; a limit on the number of open proposals per member (against spam); a limit on the number of clarification rounds with the assistant; verification of workplace and role claims.
