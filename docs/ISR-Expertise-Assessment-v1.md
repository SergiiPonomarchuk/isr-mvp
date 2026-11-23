# ISR Expertise Assessment: Complete Implementation Specification v1.0

**2026-11-21 reconciliation:** PD-9 still governs paired multi-reference arithmetic, actual-issue aspect vectors, maximum geography and the single Expertise floor. Repository main b8014ac contains mr1 logic; the new marked-carer/MVP formation policy is a separate implementation proposal, not current runtime or a deployment claim. [Exact flag, cutoff, version and backfill specification](../specs/tasks/X-eligibility-values-reconciliation.md).

**CBC policy (2026-11-21):** new scoring uses the standard education-category CBC only; the issue adjustment is removed. Frozen historical issues retain their recorded old arithmetic for replay/Join. Negative cosine is clipped at zero before powers or work sums. Recency remains an unimplemented extension; this X/Values task does not activate it.

## Overview

Expertise measures **ability to influence the outcome** of an issue through domain knowledge and proven experience. Unlike Relevance (which is issue-specific and normalized [0.0-1.0]), Expertise is **absolute and unbounded [0.0+]**, reflecting that some specialists' opinions are significantly more valuable than baseline competence.

---

## Part 1: Expertise Definition & Baseline

### 1.1 Core Concept

**Baseline (1.0)**: Common knowledge of a statistically normal 30-year-old person **without any special education or practical experience** in the issue domain. This represents generic adult competence across life domains.

**Below baseline (0.0-1.0)**: Only people under 30 without related education can score below 1.0 (the floor is age/30). Expertise is never reduced for older age or for any other personal trait.

**Above baseline (1.0+)**: People with **education or practical experience** in the issue domain. Unbounded because high-level specialists significantly exceed baseline competence.

**Interpretation**:
- **0.5**: Half the baseline competence (a 15-year-old without related education)
- **1.0**: Baseline (generic adult non-specialist)
- **1.5**: 50% above baseline (beginner practitioner)
- **3.0**: Three times baseline (strong practitioner specialist with credentials)
- **45.0+**: World-class expert (30 years + PhD + active practice)

---

## Part 2: Expertise Scoring Formula

### 2.1 Single-reference reduction (mr1 with one aspect)

$$E_i = E_{i,\text{education}} + E_{i,\text{experience}}$$

Where:
- **$E_i$** = Total Expertise of user i for the actual issue
- **$E_{i,education}$** = User i floor-adjusted education expertise
- **$E_{i,experience}$** = User i work-experience expertise

The two components are added **without weights**. The context of the issue acts through the similarity of each record to the issue ($u_1$) with CBC fixed by education category, not by the issue. Recency decay remains a documented extension, not implemented current behavior. Multi-reference evidence combines before one age floor under PD-9.

---

### 2.2 Single-reference education expertise

$$E_{i,\text{education}} = \max\left( \frac{\min(age_i, 30)}{30},\ \sum_{\text{education}} [\max(0,\cos(\vec{v}_{i,\text{education}}, u_1))] ^ {\text{CBC}} \times P_{i,\text{education}}\right)$$

Where:
- **$v_{i,education}$** = Vectorized education records (semantic embedding)
- **$u_1$** = Actual-issue aspect vector u_1 for this single-reference reduction
- **$CBC$** = Credential Broadcast Coefficient
- **$P_{i,education}$** = Education Power scalar (education time in years)
- **Cosine similarity with CBC exponent** = Semantic relevance of credential to issue, adjusted by broadcast capability [0.0-1.0]; a negative cosine counts as zero, max(0, cos)
- **Power scalar** = Education time in years [0.5+]
- **$\min(age_i, 30)/30$** = Common-knowledge floor: 1.0 from age 30 on, age/30 below 30. It never exceeds 1.0 and never falls with age. The age is taken at the moment the issue is registered and is not stored.

**Intended credential table (mapping discrepancies below are unresolved):**

| Education Type | CBC | Education Time |
|---|---|---|
| **PhD (any)** | 0.5 | 10 years |
| **Master's** | 0.8 | 6 years |
| **Bachelor's** | 1.0 | 4 years |
| **Vocational** | 2.0 | 2 years |
| **Course/Cert** | 3.0 | 0.5 years |

**Current runtime mapping:** PhD(.5,10), Master(.8,6), Bachelor(1,4), College(1.5,3), Vocational/training(2,2), unknown(1,4). The intended certificate row is not implemented and runtime College is absent from the older table. Resolve explicitly before changing mappings. CBC is fixed by education category; no issue/reference adjustment is applied; cosine is clipped at0 before exponentiation. For mr1 use PD-9: blend raw education evidence, apply one age floor, then add blended work evidence.

**CBC Interpretation (Broadcast Mechanism)**:
- **CBC < 1.0 (PhD, Master's)**: Exponent < 1 → **amplifies cosine similarity** (broadcasts to distant domains)
  - `0.5^0.5 = 0.707` (even weak relevance gets boosted)
  - `0.3^0.5 = 0.548` (distant domains still register)
- **CBC = 1.0 (Bachelor's)**: Linear application of cosine (baseline behavior)
  - `0.5^1.0 = 0.5` (neutral relevance)
- **CBC > 1.0 (Vocational, Cert)**: Exponent > 1 → **suppresses cosine similarity** (focused on primary domain)
  - `0.5^2.0 = 0.25` (requires stronger relevance to register)
  - `0.8^2.0 = 0.64` (strong relevance in primary domain)

**Examples**:

**PhD in Philosophy addressing door lock issue**:
```
cos_similarity = 0.3 (distant domain)
CBC = 0.5 (PhD amplifies)
Credential similarity after exponent = 0.3^0.5 = 0.547723 (rounded)
P_education = 10 years (PhD time)
E_education = 10 × 0.3^0.5 = 5.477226 (full intermediate precision)
```

**Vocational Locksmith addressing street parking issue**:
```
cos_similarity = 0.2 (very distant domain)
CBC = 2.0 (Vocational suppresses)
Credential similarity after exponent = 0.2^2.0 = 0.04
P_education = 2 years (vocational training)
Σ education = 0.04 × 2 = 0.08
E_education = max(1.0, 0.08) = 1.0 (member aged 30+: the floor applies)
```

**Master's in Construction addressing urban planning issue**:
```
cos_similarity = 0.75 (related domain)
CBC = 0.8 (Master's amplifies moderately)
Credential similarity after exponent = 0.75^0.8 = 0.794418 (rounded)
P_education = 6 years (Master's time)
E_education = 6 × 0.75^0.8 = 4.766507 (unrounded intermediate)
```

---

### 2.3 Single-reference experience expertise

$$E_{i,\text{experience}} = \sum_{\text{experience}} \max(0,\cos(\vec{v}_{i,\text{experience}}, u_1)) \times P_{i,\text{experience}}$$

Where:
- **v_{i,experience}** = Vectorized experience records (semantic embedding)
- **u_1** = Actual-issue aspect vector u_1 for this single-reference reduction
- **P_{i,experience}** = Experience Power scalar (duration in years)
- **Cosine similarity** = Semantic relevance of experience to issue [0.0-1.0]; a negative cosine counts as zero, max(0, cos)
- **Power scalar** = Duration of active experience in years [0.0+]

**Intended recency extension, not applied by current code:**

Current work evidence uses stored work-experience duration; no decay is applied. The future effective-years formula must be nonnegative and use a fixed registration date, not current wall-clock time. The following historical sketch is not an operational mr1 rule:
- For current positions: `years = current_year - start_year`
- For past positions: Apply recency decay based on domain context
  - Formula: `years_effective = years × max(0, 1 - decay_rate × years_since_end)`
  - Decay rate determined contextually by LLM (0.01-0.08 per year)

**Examples**:

**10 years active locksmith experience addressing door lock issue**:
```
cos_similarity = 0.95 (primary domain)
P_experience = 10 years (active, no decay)
E_experience = 0.95 × 10 = 9.5
```

**20 years construction experience (inactive 5 years) addressing urban planning**:
```
cos_similarity = 0.70 (related domain)
Recency decay = 0.04/year
P_experience = 20 × (1 - 0.04 × 5) = 20 × 0.8 = 16 years (effective)
E_experience = 0.70 × 16 = 11.2
```

---

### 2.4 Resources are not part of Expertise

Pledged resources (tools, equipment, technology, transportation, space or venue, contacts, time) no longer add to Expertise. They belong to the **implementation plan of an option**, after the money: each option states its cost and funding source first, then the resources needed for realization and who provides them. Resources serve the realization of a decision, not decision-making weight. Any property registered in the system can influence decision-making only through Relevance (the situation and place channels, see the Relevance specification). Money is not counted in any weight.

---

## Part 3: Domain Context & AI Analysis

### 3.1 AI-Driven Domain Classification

When an issue is submitted, **LLM determines** contextual parameters:

1. **Domain Category**: Extracted from issue description (locksmith.security, urban_planning.infrastructure, social.event.cultural, etc.)

2. **Recency Decay Rate** [per year of inactivity]:
   - 0.01 = Slow decay (locksmith, carpentry, philosophy)
   - 0.03 = Moderate decay (construction, business management)
   - 0.05 = Fast decay (software engineering, medical practice)
   - 0.08 = Extremely fast decay (cutting-edge AI, quantum computing)

CBC is taken only from the education-category table. The Analyzer does not generate or adjust it. Recency metadata above remains an unimplemented extension.

### 3.2 Example Domain Contexts

**Issue: "Fix broken apartment lock"**
```
Domain: locksmith.security
Recency decay: 0.02/year (skills decay slowly)
→ Master Locksmith dominates; Engineer has lower relevance
```

**Issue: "Organize salsa evenings in district"**
```
Domain: social.event.cultural
Recency decay: 0.03/year
→ Dancer + Event organizer + Business person all relevant
```

**Issue: "Propose parking structure + budget allocation"**
```
Domain: urban_planning.infrastructure.governance
Recency decay: 0.04/year
→ Urban planner, Accountant, Builder, MBA all weighted similarly
```

---

## Part 4: Database Schema & Vectorization

**Historical design sketch, not current runtime evidence.** Current mapping/storage and mr1 overrides are in specs/04-expertise.md and PD-9. No automatic recency, re-embedding, migration or cost allowance is approved by these sketches.

### 4.1 user_expertise_profiles Collection

Each document in the `user_expertise_profiles` collection stores pre-computed 768-dimensional embeddings for a user's credentials and experience.

- **Document ID**: User UID (String)
- **Schema**:
```json
{
  "uid": "String (User UID)",
  "education_records": [
    {
      "id": 1,
      "type": "education",
      "institution": "University of Andim",
      "degree_type": "Master",
      "specialization": "Construction",
      "graduation_year": 2014,
      "years_of_study": 2,
      "description_text": "Master's degree in Construction with focus on structural engineering",
      "cbc": 0.8
    }
  ],
  "education_vectors": [
    [0.012, -0.054, ..., 0.038]  // Array of 768-dim vectors (Google AI Studio)
  ],
  "experience_records": [
    {
      "id": 1,
      "job_title": "Master Locksmith",
      "organization": "Self-employed",
      "start_year": 1995,
      "end_year": 2024,
      "is_current": true,
      "years_active": 29,
      "specialization": "Commercial and Residential Security",
      "description_text": "Commercial and residential lock installation"
    }
  ],
  "experience_vectors": [
    [0.012, -0.054, ..., 0.038]  // Array of 768-dim vectors (Google AI Studio)
  ],
  "profile_updated_at": "Timestamp",
  "vectors_computed_at": "Timestamp"
}
```

### 4.2 Education Records Structure

```json
{
  "education_records": [
    {
      "id": 1,
      "type": "education",
      "institution": "University of Andim",
      "degree_type": "Master",
      "specialization": "Construction",
      "graduation_year": 2014,
      "years_of_study": 2,
      "description_text": "Master's degree in Construction with focus on structural engineering and project management",
      "cbc": 0.8
    },
    {
      "id": 2,
      "type": "certification",
      "name": "Locksmith Certification",
      "issuer": "Regional Trade Association",
      "year": 1995,
      "credential_type": "vocational",
      "description_text": "Certified Master Locksmith with 20+ hours of hands-on training",
      "cbc": 2.0
    }
  ]
}
```

### 4.3 Experience Records Structure

```json
{
  "experience_records": [
    {
      "id": 1,
      "job_title": "Production Manager",
      "organization": "Argo Industry",
      "start_year": 2014,
      "end_year": 2024,
      "is_current": true,
      "years_active": 10,
      "specialization": "Manufacturing & Process Optimization",
      "description_text": "10 years managing production workflows, team coordination, and resource allocation in industrial setting"
    },
    {
      "id": 2,
      "job_title": "Master Locksmith",
      "organization": "Self-employed",
      "start_year": 1995,
      "end_year": 2024,
      "is_current": true,
      "years_active": 29,
      "specialization": "Commercial and Residential Security",
      "description_text": "Commercial and residential lock installation, repair, and security system design; trained 5 apprentices"
    }
  ]
}
```

### 4.4 Resources (removed)

Resources are no longer stored in the expertise profile (see 2.4).

### 4.5 microcommunity_expertise_scores Collection

Each document in this collection tracks the calculated expertise components for a member in a specific ad-hoc public.

- **Document ID**: `${microcommunity_id}_${user_id}`
- **Schema**:
```json
{
  "microcommunity_id": "mc-uuid-string",
  "user_id": "user-uuid-string",
  "education_expertise": 1.824,
  "education_component_count": 1,
  "experience_expertise": 29.4,
  "experience_component_count": 1,
  "expertise_score": 31.22,
  "calculated_at": "Timestamp",
  "expertise_frozen_at": null // Timestamp when frozen, or null
}
```

---

## Part 5: Expertise calculation pipeline

Authoritative current code is functions/isr.js (Python arithmetic via scripts/isr_core.py), using users.skills and user_vectors.experience_vectors. Do not create competing user_expertise_profiles or microcommunity_expertise_scores collections from the historical schema above. Current members store education_expertise, experience_expertise and expertise_score; normalized_experience is normalized total E.

For mr1 follow PD-9: actual-issue aspect vectors u_j, education-category CBC_k, raw H_ij/T_ij, normalized alpha, blended H_i/T_i, then E_i=max(A_i,H_i)+T_i. Evaluate powers before blending. The common age floor applies once after education evidence combines. Do not average exponents, floor each reference first, introduce Education/Experience preferences, or normalize expertise separately for each reference. Normalize the combined score once over the final public.

Current code skips missing vectors, includes records typed education/work experience without a graduation-status filter, ignores activities and does not apply recency decay. Missing birthDate fallback and unknown-level mappings are known implementation discrepancies. They are not new policy choices approved by mr1.

The actual-issue aspect texts/vectors, credential-table/scoring version, fixed registration time, library/reference weights and storage precision must be reproducible across Check/Create/Join/checker. Existing three-decimal storage-before-normalization must be preserved or explicitly versioned. Historical source-schema and performance/cost sketches are not current implementation evidence.

## Part 7: Corrected worked arithmetic

These are single-reference arithmetic examples with explicitly stated nominal power assumptions, not outputs from live synthetic profiles or evidence of calibrated embeddings. Ages35 are illustrative adult assumptions where the old example did not specify age; Lisa32 and coordinator24 retain their stated ages. No decay is used. Some historical powers (course P1, diploma P2, Master P2) differ from runtime level mappings: retain them only as explicit hypothetical inputs, not inferred runtime parameters. Every expression below uses full intermediate precision; displayed totals round to6 decimals.

### Door lock repair — standard credential CBC

| Person | Age | Education inputs (similarity, CBC, power) | Work inputs (similarity, years) | Raw H | Floor-adjusted education | Work T | Total E |
|---|---:|---|---|---:|---:|---:|---:|
| John | 35 | [(0.95, 2, 2)] | [(0.98, 30)] | 1.805000 | 1.805000 | 29.400000 | 31.205000 |
| Sarah | 35 | [(0.4, 1, 4)] | [(0.35, 33)] | 1.600000 | 1.600000 | 11.550000 | 13.150000 |
| Lisa | 32 | [(0.05, 1, 4)] | [(0.02, 8)] | 0.200000 | 1.000000 | 0.160000 | 1.160000 |

Sum of the illustrated members' raw Expertise: 45.515000. This total alone does not establish sufficient group expertise or automatically justify inviting an external expert.

### Salsa evening — standard credential CBC

| Person | Age | Education inputs (similarity, CBC, power) | Work inputs (similarity, years) | Raw H | Floor-adjusted education | Work T | Total E |
|---|---:|---|---|---:|---:|---:|---:|
| Maria | 35 | [(0.95, 1, 4), (0.92, 1, 1)] | [(0.98, 8), (0.92, 6)] | 4.720000 | 4.720000 | 13.360000 | 18.080000 |
| David | 35 | [(0.6, 1, 4)] | [(0.75, 20)] | 2.400000 | 2.400000 | 15.000000 | 17.400000 |
| Alex | 35 | [(0.85, 1, 2)] | [(0.88, 15)] | 1.700000 | 1.700000 | 13.200000 | 14.900000 |

Sum of the illustrated members' raw Expertise: 50.380000. This total alone does not establish sufficient group expertise or automatically justify inviting an external expert.

### Parking proposal — standard credential CBC

| Person | Age | Education inputs (similarity, CBC, power) | Work inputs (similarity, years) | Raw H | Floor-adjusted education | Work T | Total E |
|---|---:|---|---|---:|---:|---:|---:|
| Urban planner | 35 | [(0.95, 0.8, 2)] | [(0.9, 12)] | 1.919592 | 1.919592 | 10.800000 | 12.719592 |
| Accountant | 35 | [(0.7, 1, 4)] | [(0.85, 15)] | 2.800000 | 2.800000 | 12.750000 | 15.550000 |
| Builder | 35 | [(0.8, 2, 2)] | [(0.85, 20)] | 1.280000 | 1.280000 | 17.000000 | 18.280000 |

Sum of the illustrated members' raw Expertise: 46.549592. This total alone does not establish sufficient group expertise or automatically justify inviting an external expert.

### Crisis allocation — standard credential CBC

| Person | Age | Education inputs (similarity, CBC, power) | Work inputs (similarity, years) | Raw H | Floor-adjusted education | Work T | Total E |
|---|---:|---|---|---:|---:|---:|---:|
| Co-founder | 35 | none | [(0.9, 2.5)] | 0.000000 | 1.000000 | 2.250000 | 3.250000 |
| Operations manager | 35 | [(0.65, 1, 4)] | [(0.8, 1.5)] | 2.600000 | 2.600000 | 1.200000 | 3.800000 |
| Volunteer coordinator | 24 | [(0.7, 3, 0.5)] | [(0.75, 0.5)] | 0.171500 | 0.800000 | 0.375000 | 1.175000 |

Sum of the illustrated members' raw Expertise: 8.225000. This total alone does not establish sufficient group expertise or automatically justify inviting an external expert.

### Multi-reference floor and contribution checks

Age floor1, raw education[0,2], alpha[.5,.5], no work: E=max(1,.5*0+.5*2)=1. Flooring each reference first gives1.5 and is a different model. For reference scores [.57,.55,.51] and R aggregation weights [.3,.4,.7], B_R=.748/1.63=.458895706, not .748/3. PD-9 defines the complete paired R/one-public ISR calculation and affected-person X.

## Part 8: Recalculation & Caching

**Historical design sketch, not current runtime evidence.** Current mapping/storage and mr1 overrides are in specs/04-expertise.md and PD-9. No automatic recency, re-embedding, migration or cost allowance is approved by these sketches.

### 8.1 Profile Update Triggers Recalculation

When a member updates their profile:

```javascript
async function onProfileUpdate(userId) {
  // 1. Update expertise vectors
  await vectorizeUserExpertiseProfile(userId);
  
  // 2. Find all active (non-voted) ad-hoc publics where user is member
  const membersSnap = await db.collection("microcommunity_members")
    .where("user_id", "==", userId)
    .get();
    
  for (const doc of membersSnap.docs) {
    const member = doc.data();
    const mcId = member.microcommunity_id;
    
    const mcDoc = await db.collection("microcommunities").doc(mcId).get();
    if (!mcDoc.exists) continue;
    const mc = mcDoc.data();
    
    if (["open", "discussion"].includes(mc.status) && !mc.expertise_frozen_at) {
      await calculateExpertiseForIssue(mc.issue_id, mcId);
    }
  }
}
```

### 8.2 Expertise Freezing at Voting

Once voting phase ends:

```javascript
async function freezeExpertiseScores(microcommunityId) {
  const batch = db.batch();
  
  // 1. Freeze expertise scores on the ad-hoc public
  const mcRef = db.collection("microcommunities").doc(microcommunityId);
  batch.update(mcRef, {
    expertise_frozen_at: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // 2. Fetch and freeze individual scores
  const scoresSnap = await db.collection("microcommunity_expertise_scores")
    .where("microcommunity_id", "==", microcommunityId)
    .get();
    
  for (const doc of scoresSnap.docs) {
    const data = doc.data();
    batch.update(doc.ref, {
      expertise_frozen_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Save to audit log in collection expertise_calculation_history
    const historyRef = db.collection("expertise_calculation_history").doc();
    batch.set(historyRef, {
      microcommunity_id: data.microcommunity_id,
      user_id: data.user_id,
      expertise_score: data.expertise_score,
      calculated_at: data.calculated_at,
      frozen_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
}
```

**After freeze**: Historical values preserved; new profile updates don't affect past decisions.

---

## Part 9: Implementation Checklist (MVP)

**Historical design sketch, not current runtime evidence.** Current mapping/storage and mr1 overrides are in specs/04-expertise.md and PD-9. No automatic recency, re-embedding, migration or cost allowance is approved by these sketches.

### Week 1: Schema & Vectorization Infrastructure
- [ ] Create `user_expertise_profiles` collection in Firestore
- [ ] Create `microcommunity_expertise_scores` collection in Firestore
- [ ] Setup Firestore composite indexes for query ranking
- [ ] Implement user profile vectorization using Google AI Studio (`text-embedding-004`)

### Week 2: Expertise Calculation Engine
- [x] Implement category-table CBC exponent (cosine^CBC) for new scoring
- [x] Remove issue-specific CBC adjustment from new scoring; retain frozen legacy replay only
- [ ] Implement recency decay for experience
- [ ] Implement additive component summation

### Week 3: Integration & Testing
- [ ] Integrate expertise calculation with ad-hoc public formation
- [ ] Test expertise freezing at voting completion
- [ ] Test profile update → recalculation pipeline
- [ ] Test with example profiles (door lock, salsa, parking, fund allocation)
- [ ] Performance testing (<200ms for 1000 members)

### Week 4: Audit & Documentation
- [ ] Implement expertise audit logs in Firestore
- [ ] Create explainability summaries
- [ ] Document domain context parameters
- [ ] End-to-end testing
- [ ] Performance optimization

---

## Part 10: Performance Targets

**Historical design sketch, not current runtime evidence.** Current mapping/storage and mr1 overrides are in specs/04-expertise.md and PD-9. No automatic recency, re-embedding, migration or cost allowance is approved by these sketches.

| Operation | Target | Notes |
|-----------|--------|-------|
| User profile vectorization | 500ms | Batch Google AI Studio call |
| Expertise calculation (1000 members) | <200ms | Pre-computed vectors + in-memory cosine |
| Recalculation on profile update | <2s | Parallelized Cloud Functions |
| Expertise freezing | <50ms | Firestore batch update |
| Component breakdown query | <100ms | Firestore index query |

---

## Part 11: Cost Breakdown

**Historical design sketch, not current runtime evidence.** Current mapping/storage and mr1 overrides are in specs/04-expertise.md and PD-9. No automatic recency, re-embedding, migration or cost allowance is approved by these sketches.

| Component | Cost | Notes |
|-----------|------|-------|
| Google AI Studio Embeddings | $5-10/month | ~5000 education/exp records |
| Firestore (expertise storage) | Free tier | Standard document writes/reads |
| Cloud Functions (calculations) | $2-5/month | On-demand CPU time |
| **Total Add-On** | **$7-15/month** | Scales with active issues |


