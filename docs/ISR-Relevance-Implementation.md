# ISR Relevance Engine: MVP Implementation Specification v1.0

**2026-11-21 reconciliation:** PD-9 still governs paired multi-reference arithmetic, actual-issue aspect vectors, maximum geography and the single Expertise floor. Repository main b8014ac contains mr1 logic; the new marked-carer/MVP formation policy is a separate implementation proposal, not current runtime or a deployment claim. [Exact flag, cutoff, version and backfill specification](../specs/tasks/X-eligibility-values-reconciliation.md).

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

## Relevance processing order: MVP decision, 2026-11-21

Preserve hard demographic/geographic exclusions and the top-300 direct-candidate cutoff for MVP. These are declared approximations; they can miss people qualifying in the full PD-9 model. Do not claim exact population coverage or unmeasured scaling percentages. Current main's mr1 implementation uses the broader policy; the revised path requires a new version and tests before use.

1. Freeze reviewed references, alpha, actual-issue aspect vectors/rules and common max-mu/max-sigma geography. Apply the legacy hard demographic/geographic candidate adapter, preserving existing A3 distance bypasses and creator-fetch compatibility rather than inventing new predicates.
2. For direct candidates, compute UB_i=sum_j alpha_j*(w_Dj*D_ij+w_Gj*G_i+w_Sj*1). Prune only when **UB_i < Theta**. Equality stays eligible. Rank survivors and keep the top 300 with the legacy creator-fetch exception identified separately. Fetch vectors and form the fixed direct seed set A_seed from weighted r0_i>=Theta, without renormalizing away W_X.
3. On the proposed direct-only cutoff boundary, read only A_seed's outgoing relationships explicitly marked x_eligible=true. The confirmed direction is directly affected child/dependent -> parent/carer. Do not use the submitter's graph or propagate from newly discovered targets.
4. Evaluate every distinct marked carer, including outside direct filters/top 300. All marked carers enter: below-threshold recipients are B, while an outside-pool recipient already reaching Theta enters at its direct score with X=0 and does not become a new source in this pass. This direct recovery is an explicit proposed resolution of MVP approximation, not a claim about the old full-policy oracle.
5. For each B recipient independently, choose the largest full W_X*t_hi whose sum with that recipient's r0 does not exceed the supplying seed's r0. Reject overflowing additions entirely; equality qualifies. Zero accepted addition or zero final R does not remove the carer. The maximum chooses a source/addition per recipient, not one relative per family.
6. Normalize R/E once over the final unique public. No Education/Experience preferences or new automatic 100-member limit. Explicit Join is separate from the direct-vector fetch approximation.

The cutoff boundary and direct-recovery detail are concrete implementation proposals pending review in the linked task. Historical publications/replay/Join retain their frozen policy. This reconciliation changes no runtime.

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

### Marked outgoing carer eligibility

On a directly affected child's/dependent's profile:

```json
{
  "social_relations_version": "x-links-1",
  "socialRelations": [
    {"relative": 205, "type": "parent", "tie": null, "x_eligible": true},
    {"relative": 206, "type": "sibling", "tie": null, "x_eligible": false}
  ]
}
```

The true flag means: when **this profile** is a direct source, the named relative may enter through X. It is directional, never inferred reciprocally from another profile. Type/tie still determine t_hi using the existing validated mapping; the flag only selects edges. Missing/non-Boolean is unknown, not a silent false or an inferred true. New-policy formation must report required incomplete eligibility data. Historical profiles/publics are not silently reinterpreted.

Read marked links only from fixed direct seeds; preserve the full socialRelations graph for demographic/family predicates. No self-link or social second hop. Every eligible carer is admitted regardless of accepted X. For recipient i:

    H_i = {h in A_seed: h records an x_eligible=true outgoing link to i}
    delta_hi = W_X*t_hi
    x_i = max({delta_hi: h in H_i and r0_i+delta_hi<=r0_h} union {0})
    R_i = r0_i+x_i

Apply this addition to below-threshold B only. A source ceiling is tested **before** maximizing, with existing 1e-12 equality tolerance; a stronger rejected tie cannot suppress a weaker qualifying source. Retain the raw baseline when all additions overflow. Do not multiply tie by source affectedness or renormalize D/G/S by (1-W_X). Direct members get X=0. An eligible zero-tie edge or W_X=0 still establishes membership. The linked task specifies recovered direct targets under the MVP cutoff, frozen links/versions and tests.

---

## Part 6: Combined Relevance Score

### 6.1 Paired multi-reference Relevance

R_i=sum_j alpha_j*(w_Dj*D_ij+w_Gj*G_i+w_Sj*S_ij+w_Xj*X_ij). PD-9 defines W_d and effective component scores so a four-component display reconstructs this exact value. Multiplying separately averaged weights and scores is a different model. All validated inputs lie in[0,1], weight groups sum to1, hence R lies in[0,1].

### 6.2 Interpretation

R and reference similarities are scores, not calibrated probabilities. R determines automatic membership using the separately versioned formation policy, while E and ISR aggregation weights do not determine inclusion.

### 6.3 MVP pruning and publication boundary

Direct admission is inclusive: r0>=Theta (default .15). The paired upper bound at the direct stage contains no X:

```javascript
const upperBound = references.reduce((sum, r) =>
  sum + r.alpha * (r.w_D * D[r.id] + r.w_G * G + r.w_S), 0);
if (upperBound < theta) return; // equality is not pruned
```

Apply the retained hard D/G adapter and rank/select at most 300 direct vector candidates, with existing creator-fetch compatibility separately accounted for. This approximation is deliberately retained for MVP and is not exact full-population pruning. Marked-carer expansion is a separate pass under the proposed boundary above; do not apply a final single-threshold filter that removes B or a global 300-member public cap.

Public-owned text/context/options recomputation is an intended later workflow, not deployed mr1 behavior. A zero-direct/zero-public outcome should return needs_clarification to the submitter under the planned contract; current engine still throws its existing error. No extra AI call, reanalysis or membership migration is authorized by this document. The historical never-remove-on-recomputation policy requires its own versioned implementation/acceptance.

---

## Part 7: Database Schema (Firebase Firestore NoSQL)

**Historical schema/flow sketch:** current source fields and the 2026-11-21 versioned MVP adapter take precedence. Hard D/G gates and top-300 direct selection are retained approximations; the proposed marked-carer path is specified separately above. These sketches do not override paired-reference arithmetic or claim a deployed implementation.


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
      "social_relations_version": "x-links-1",
      "socialRelations": [{"relative": 37, "type": "parent", "tie": null, "x_eligible": true}],
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

**Historical schema/flow sketch:** current source fields and the 2026-11-21 versioned MVP adapter take precedence. Hard D/G gates and top-300 direct selection are retained approximations; the proposed marked-carer path is specified separately above. These sketches do not override paired-reference arithmetic or claim a deployed implementation.

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

**Historical schema/flow sketch:** current source fields and the 2026-11-21 versioned MVP adapter take precedence. Hard D/G gates and top-300 direct selection are retained approximations; the proposed marked-carer path is specified separately above. These sketches do not override paired-reference arithmetic or claim a deployed implementation.

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

A quorum for votes on changes; a limit on the number of open proposals per member (against spam); a limit on the number of clarification rounds with the assistant; verification of workplace and role claims; verification of registered property (as for workplace and role); cap or waiting period for mass joiners.
