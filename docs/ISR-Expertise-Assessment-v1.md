# ISR Expertise Assessment: Complete Implementation Specification v1.0

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

### 2.1 Core Formula

$$E_{i,q} = E_{i,q,\text{education}} + E_{i,q,\text{experience}}$$

Where:
- **$E_{i,q}$** = Total Expertise of user i regarding issue q
- **$E_{i,q,education}$** = User i education expertise regarding issue q
- **$E_{i,q,experience}$** = User i experience expertise regarding issue q

The two components are added **without weights**. The context of the issue acts through the similarity of each record to the issue ($\vec{V}_q$) and through the domain parameters (CBC adjustment factor, recency decay).

---

### 2.2 Education Expertise

$$E_{i,q,\text{education}} = \max\left( \frac{\min(age_i, 30)}{30},\ \sum_{\text{education}} \cos(\vec{v}_{i,\text{education}}, \vec{V}_q) ^ {\text{CBC}} \times P_{i,\text{education}}\right)$$

Where:
- **$v_{i,education}$** = Vectorized education records (semantic embedding)
- **$V_q$** = Issue q vector representation
- **$CBC$** = Credential Broadcast Coefficient
- **$P_{i,education}$** = Education Power scalar (education time in years)
- **Cosine similarity with CBC exponent** = Semantic relevance of credential to issue, adjusted by broadcast capability [0.0-1.0]
- **Power scalar** = Education time in years [0.5+]
- **$\min(age_i, 30)/30$** = Common-knowledge floor: 1.0 from age 30 on, age/30 below 30. It never exceeds 1.0 and never falls with age. The age is taken at the moment the issue is registered and is not stored.

**Credential Broadcast Coefficient Table**:

| Education Type | CBC | Education Time |
|---|---|---|
| **PhD (any)** | 0.5 | 10 years |
| **Master's** | 0.8 | 6 years |
| **Bachelor's** | 1.0 | 4 years |
| **Vocational** | 2.0 | 2 years |
| **Course/Cert** | 3.0 | 0.5 years |

**CBC Interpretation (Broadcast Mechanism)**:
- **CBC < 1.0 (PhD, Master's)**: Exponent < 1 → **amplifies cosine similarity** (broadcasts to distant domains)
  - `cos(0.5)^0.5 = 0.707` (even weak relevance gets boosted)
  - `cos(0.3)^0.5 = 0.548` (distant domains still register)
- **CBC = 1.0 (Bachelor's)**: Linear application of cosine (baseline behavior)
  - `cos(0.5)^1.0 = 0.5` (neutral relevance)
- **CBC > 1.0 (Vocational, Cert)**: Exponent > 1 → **suppresses cosine similarity** (focused on primary domain)
  - `cos(0.5)^2.0 = 0.25` (requires stronger relevance to register)
  - `cos(0.8)^2.0 = 0.64` (strong relevance in primary domain)

**Examples**:

**PhD in Philosophy addressing door lock issue**:
```
cos_similarity = 0.3 (distant domain)
CBC = 0.5 (PhD amplifies)
CBC_adjusted = cos(0.3)^0.5 = 0.548
P_education = 10 years (PhD time)
E_education = 0.548 × 10 = 5.48
```

**Vocational Locksmith addressing street parking issue**:
```
cos_similarity = 0.2 (very distant domain)
CBC = 2.0 (Vocational suppresses)
CBC_adjusted = cos(0.2)^2.0 = 0.04
P_education = 2 years (vocational training)
Σ education = 0.04 × 2 = 0.08
E_education = max(1.0, 0.08) = 1.0 (member aged 30+: the floor applies)
```

**Master's in Construction addressing urban planning issue**:
```
cos_similarity = 0.75 (related domain)
CBC = 0.8 (Master's amplifies moderately)
CBC_adjusted = cos(0.75)^0.8 = 0.766
P_education = 6 years (Master's time)
E_education = 0.766 × 6 = 4.60
```

---

### 2.3 Experience Expertise

$$E_{i,q,\text{experience}} = \sum_{\text{experience}} \cos(\vec{v}_{i,\text{experience}}, \vec{V}_q) \times P_{i,\text{experience}}$$

Where:
- **v_{i,experience}** = Vectorized experience records (semantic embedding)
- **V_q** = Issue q vector representation
- **P_{i,experience}** = Experience Power scalar (duration in years)
- **Cosine similarity** = Semantic relevance of experience to issue [0.0-1.0]
- **Power scalar** = Duration of active experience in years [0.0+]

**Experience Time Calculation**:
- For current positions: `years = current_year - start_year`
- For past positions: Apply recency decay based on domain context
  - Formula: `years_effective = years × (1 - decay_rate × years_since_end)`
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

3. **CBC Adjustment Factor** [multiplier for Credential Broadcast Coefficient]:
   - 1.0 = Use base CBC values (default)
   - 0.8 = Reduce CBC power (make domain more focused, less broadcasting)
   - 1.2 = Increase CBC power (make domain more broad, more broadcasting)

### 3.2 Example Domain Contexts

**Issue: "Fix broken apartment lock"**
```
Domain: locksmith.security
Recency decay: 0.02/year (skills decay slowly)
CBC adjustment: 0.9 (reduce broadcasting slightly)
→ Master Locksmith dominates; Engineer has lower relevance
```

**Issue: "Organize salsa evenings in district"**
```
Domain: social.event.cultural
Recency decay: 0.03/year
CBC adjustment: 1.1 (increase broadcasting for org skills)
→ Dancer + Event organizer + Business person all relevant
```

**Issue: "Propose parking structure + budget allocation"**
```
Domain: urban_planning.infrastructure.governance
Recency decay: 0.04/year
CBC adjustment: 1.0 (neutral, balanced)
→ Urban planner, Accountant, Builder, MBA all weighted similarly
```

---

## Part 4: Database Schema & Vectorization

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

## Part 5: Expertise Calculation Pipeline

### 5.1 Pre-Computation: User Profile Vectorization

**When user profile created/updated:**

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const db = admin.firestore();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function embedText(text) {
  const result = await embedModel.embedContent(text);
  return result.embedding.values; // 768-dimensional float array
}

async function vectorizeUserExpertiseProfile(userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return;
  const userData = userDoc.data();
  
  // 1. Vectorize education records
  const educationVectors = [];
  for (const edu of (userData.education_records || [])) {
    const text = `${edu.degree_type} in ${edu.specialization} from ${edu.institution}`;
    const vector = await embedText(text);
    educationVectors.push(vector);
  }
  
  // 2. Vectorize experience records
  const experienceVectors = [];
  for (const exp of (userData.experience_records || [])) {
    const text = `${exp.years_active} years as ${exp.job_title} in ${exp.specialization}`;
    const vector = await embedText(text);
    experienceVectors.push(vector);
  }
  
  // 3. Store in database
  await db.collection("user_expertise_profiles").doc(userId).set({
    uid: userId,
    education_records: userData.education_records || [],
    education_vectors: educationVectors,
    experience_records: userData.experience_records || [],
    experience_vectors: experienceVectors,
    vectors_computed_at: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // 4. Trigger recalculation for active ad-hoc publics
  await recalculateExpertiseForUserAllActiveIssues(userId);
}
```

### 5.2 On-Demand: Expertise Calculation for Issue

**When an ad-hoc public is formed for an issue:**

```javascript
function cosineSimilarity(a, b) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function calculateExpertiseForIssue(issueId, microcommunityId) {
  const issueDoc = await db.collection("issues").doc(issueId).get();
  if (!issueDoc.exists) return;
  const issueData = issueDoc.data();
  const issueVector = issueData.issue_vector; // 768-dimensional array
  
  // LLM determines domain context (Google AI Studio call)
  const domainContext = await analyzeIssueDomain(issueData);
  
  const membersSnap = await db.collection("microcommunity_members")
    .where("microcommunity_id", "==", microcommunityId)
    .get();
    
  for (const doc of membersSnap.docs) {
    const member = doc.data();
    const userId = member.user_id;
    
    const profileDoc = await db.collection("user_expertise_profiles").doc(String(userId)).get();
    if (!profileDoc.exists) continue;
    const profile = profileDoc.data();
    
    // COMPONENT 1: EDUCATION EXPERTISE
    let educationExpertise = 0.0;
    const eduRecords = profile.education_records || [];
    const eduVectors = profile.education_vectors || [];
    for (let i = 0; i < eduRecords.length; i++) {
      const edu = eduRecords[i];
      const eduVector = eduVectors[i];
      const cosSim = cosineSimilarity(eduVector, issueVector);
      const cbc = edu.cbc;
      
      let cosAdjusted = Math.pow(Math.max(0, cosSim), cbc);
      cosAdjusted = Math.pow(cosAdjusted, domainContext.cbc_adjustment_factor);
      
      const timeYears = edu.years_of_study || 0.5;
      educationExpertise += cosAdjusted * timeYears;
    }

    // Common-knowledge floor (Section 2.2): min(age, 30) / 30
    const userDoc = await db.collection("users").doc(String(userId)).get();
    const age = ageInYears(userDoc.data()?.birthDate, issueData.created_at);   // age at issue registration
    const ageFloor = Math.min(age, 30) / 30;
    educationExpertise = Math.max(ageFloor, educationExpertise);
    
    // COMPONENT 2: EXPERIENCE EXPERTISE
    let experienceExpertise = 0.0;
    const expRecords = profile.experience_records || [];
    const expVectors = profile.experience_vectors || [];
    for (let i = 0; i < expRecords.length; i++) {
      const exp = expRecords[i];
      const expVector = expVectors[i];
      const cosSim = cosineSimilarity(expVector, issueVector);
      
      let yearsActive = exp.years_active || 0;
      if (!exp.is_current) {
        const currentYear = new Date().getFullYear();
        const yearsSinceEnd = currentYear - (exp.end_year || currentYear);
        const decay = domainContext.recency_decay_rate * yearsSinceEnd;
        yearsActive = Math.max(0, yearsActive * (1 - decay));
      }
      experienceExpertise += Math.max(0, cosSim) * yearsActive;
    }
    
    // TOTAL EXPERTISE SCORE
    const totalExpertise = educationExpertise + experienceExpertise;
    
    await db.collection("microcommunity_expertise_scores").doc(`${microcommunityId}_${userId}`).set({
      microcommunity_id: microcommunityId,
      user_id: userId,
      education_expertise: educationExpertise,
      education_component_count: eduRecords.length,
      experience_expertise: experienceExpertise,
      experience_component_count: expRecords.length,
      expertise_score: totalExpertise,
      calculated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
```

### 5.3 JavaScript/Firestore Implementation

```javascript
// Fetch and rank members by expertise
async function queryExpertiseScores(microcommunityId) {
  const snapshot = await db.collection("microcommunity_expertise_scores")
    .where("microcommunity_id", "==", microcommunityId)
    .orderBy("expertise_score", "desc")
    .get();
    
  return snapshot.docs.map((doc, idx) => {
    const data = doc.data();
    let level = "Novice";
    if (data.expertise_score >= 10.0) level = "Expert";
    else if (data.expertise_score >= 3.0) level = "Practitioner";
    else if (data.expertise_score >= 1.0) level = "Informed";
    
    return {
      user_id: data.user_id,
      education: Number(data.education_expertise.toFixed(2)),
      experience: Number(data.experience_expertise.toFixed(2)),
      total_expertise: Number(data.expertise_score.toFixed(2)),
      expertise_rank: idx + 1,
      expertise_level: level
    };
  });
}
```

---

## Part 7: Complete Worked Examples

### Example 1: Door Lock Repair Issue

**Issue**: "The entrance door to our house (12 Oak Street) works badly. Let's fix the lock before it blocks us in!"

**Domain Context (LLM determined)**:
```
Domain: locksmith.security
Recency decay: 0.02/year (skills decay slowly)
CBC adjustment: 0.9 (reduce broadcasting)
```

**Member 1: John (Master Locksmith)**

Education:
- Vocational Locksmith Diploma (2 years, 1995)
- CBC = 2.0
- cos_similarity = 0.95 (primary domain)
- cos_adjusted = (0.95)^2.0 = 0.9025
- cos_adjusted_cbc = (0.9025)^0.9 = 0.912
- E_education = 0.912 × 2 = **1.824**

Experience:
- Master Locksmith (30 years active, 1995-2025)
- cos_similarity = 0.98 (primary domain)
- years = 30 (current, no decay)
- E_experience = 0.98 × 30 = **29.4**

**Total Expertise: 1.824 + 29.4 = 31.224**

---

**Member 2: Sarah (Engineer)**

Education:
- Bachelor's in Civil Engineering (4 years, 1992)
- CBC = 1.0
- cos_similarity = 0.4 (distant domain)
- cos_adjusted = (0.4)^1.0 = 0.4
- cos_adjusted_cbc = (0.4)^0.9 = 0.427
- E_education = 0.427 × 4 = **1.708**

Experience:
- Structural Engineer (33 years active, 1992-2025)
- cos_similarity = 0.35 (general building knowledge)
- years = 33 (current)
- E_experience = 0.35 × 33 = **11.55**

**Total Expertise: 1.708 + 11.55 = 13.258**

---

**Member 3: Lisa (Office Manager)**

Education:
- Bachelor's in Business (4 years, 2016)
- CBC = 1.0
- cos_similarity = 0.05 (completely unrelated)
- cos_adjusted = (0.05)^1.0 = 0.05
- cos_adjusted_cbc = (0.05)^0.9 = 0.054
- Σ education = 0.054 × 4 = 0.216; age 32, floor 1.0
- E_education = max(1.0, 0.216) = **1.0**

Experience:
- Office Manager (8 years, 2017-2025)
- cos_similarity = 0.02 (no locksmith relevance)
- years = 8
- E_experience = 0.02 × 8 = **0.16**

**Total Expertise: 1.0 + 0.16 = 1.16**

---

**Summary**:
```
John (Master Locksmith):      31.22  ← Expert (>10)
Sarah (Engineer):             13.26  ← Expert (>10)
Lisa (Office Manager):         1.16  ← Informed (1-3)

Total expertise: 45.64
→ Strong expertise in the ad-hoc public; no external expert needed
```

---

### Example 2: Salsa Evening Organization

**Issue**: "Establish regular salsa evenings in our district. Can someone suggest a place or join?"

**Domain Context**:
```
Domain: social.event.cultural
Recency decay: 0.03/year
CBC adjustment: 1.1 (increase broadcasting for org skills)
```

**Member 1: Maria (Salsa Dancer & Choreographer)**

Education:
- Dance School Certificate (4 years, 2016)
- CBC = 1.0
- cos_similarity = 0.95 (primary domain)
- cos_adjusted = (0.95)^1.0 = 0.95
- cos_adjusted_cbc = (0.95)^1.1 = 0.945
- E_education = 0.945 × 4 = **3.78**

Education:
- Choreography course (1 year, 2015)
- CBC = 1.0
- cos_similarity = 0.92
- cos_adjusted_cbc = (0.92)^1.1 = 0.916
- E_education_2 = 0.916 × 1 = **0.916**

Experience:
- Professional Salsa Dancer (8 years, 2017-2025)
- cos_similarity = 0.98
- years = 8
- E_experience_1 = 0.98 × 8 = **7.84**

Experience:
- Choreographer/Instructor (6 years, 2019-2025)
- cos_similarity = 0.92 (event organization aspect)
- years = 6
- E_experience_2 = 0.92 × 6 = **5.52**

**Total Expertise: 3.78 + 0.916 + 7.84 + 5.52 = 18.056**

---

**Member 2: David (Real Estate Broker)**

Education:
- Bachelor's in Business (4 years, 2001)
- CBC = 1.0
- cos_similarity = 0.6 (business org applies)
- cos_adjusted = (0.6)^1.0 = 0.6
- cos_adjusted_cbc = (0.6)^1.1 = 0.593
- E_education = 0.593 × 4 = **2.372**

Experience:
- Real Estate Broker (20 years, 2005-2025)
- cos_similarity = 0.75 (venue identification)
- years = 20
- E_experience = 0.75 × 20 = **15.0**

**Total Expertise: 2.372 + 15.0 = 17.372**

---

**Member 3: Alex (Event Planner)**

Education:
- Diploma in Event Management (2 years, 2010)
- CBC = 1.0
- cos_similarity = 0.85 (direct application)
- cos_adjusted = (0.85)^1.0 = 0.85
- cos_adjusted_cbc = (0.85)^1.1 = 0.844
- E_education = 0.844 × 2 = **1.688**

Experience:
- Event Coordinator (15 years, 2010-2025)
- cos_similarity = 0.88 (event organization)
- years = 15
- E_experience = 0.88 × 15 = **13.2**

**Total Expertise: 1.688 + 13.2 = 14.888**

---

**Summary**:
```
Maria (Salsa Dancer):        18.06  ← Expert (>10)
David (Real Estate Broker):  17.37  ← Expert (>10)
Alex (Event Planner):        14.89  ← Expert (>10)

Total expertise: 50.32
→ Strong diverse expertise; no external expert needed
```

---

### Example 3: Parking Structure Proposal

**Issue**: "Build parking structure using park space + budget allocation strategy"

**Domain Context**:
```
Domain: urban_planning.infrastructure.governance
Recency decay: 0.04/year
CBC adjustment: 1.0 (neutral)
```

**Member 1: Urban Planner (Master's, 12 years active)**

Education:
- Master's in Urban Planning (2 years)
- CBC = 0.8
- cos_similarity = 0.95 (primary domain)
- cos_adjusted = (0.95)^0.8 = 0.953
- cos_adjusted_cbc = (0.953)^1.0 = 0.953
- E_education = 0.953 × 2 = **1.906**

Experience:
- Urban Planner (12 years active)
- cos_similarity = 0.9
- years = 12
- E_experience = 0.9 × 12 = **10.8**

**Total: 1.906 + 10.8 = 12.706**

---

**Member 2: Accountant/Finance (Bachelor's, 15 years)**

Education:
- Bachelor's in Finance (4 years)
- CBC = 1.0
- cos_similarity = 0.7 (budget aspect)
- cos_adjusted = (0.7)^1.0 = 0.7
- cos_adjusted_cbc = (0.7)^1.0 = 0.7
- E_education = 0.7 × 4 = **2.8**

Experience:
- Finance Manager (15 years)
- cos_similarity = 0.85 (budget planning)
- years = 15
- E_experience = 0.85 × 15 = **12.75**

**Total: 2.8 + 12.75 = 15.55**

---

**Member 3: Builder (Vocational, 20 years)**

Education:
- Vocational Training (2 years)
- CBC = 2.0
- cos_similarity = 0.8 (construction aspect)
- cos_adjusted = (0.8)^2.0 = 0.64
- cos_adjusted_cbc = (0.64)^1.0 = 0.64
- E_education = 0.64 × 2 = **1.28**

Experience:
- Construction/Building (20 years active)
- cos_similarity = 0.85 (building feasibility)
- years = 20
- E_experience = 0.85 × 20 = **17.0**

**Total: 1.28 + 17.0 = 18.28**

---

**Summary**:
```
Builder:           18.28   ← Expert (>10)
Accountant:        15.55  ← Expert (>10)
Urban Planner:     12.71  ← Expert (>10)

Total expertise: 46.54
→ Balanced expertise; no external expert needed
```

---

### Example 4: Fund Allocation During Crisis

**Issue**: "Allocate $65K & 200 volunteer hours: immediate aid (95%) vs. infrastructure (70/30)?"

**Domain Context**:
```
Domain: governance.nonprofit.emergency_response
Recency decay: 0.03/year
CBC adjustment: 1.2 (increase broadcasting for governance)
```

**Member 1: Co-founder (2.5 years direct experience)**

Education:
- None formal (self-taught)
- E_education = max(1.0, 0.0) = 1.0 (aged 30+, floor)

Experience:
- Emergency Response Coordinator (2.5 years, active)
- cos_similarity = 0.9 (crisis management)
- years = 2.5
- E_experience = 0.9 × 2.5 = **2.25**

**Total: 1.0 + 2.25 = 3.25**

---

**Member 2: Operations Manager (1.5 years)**

Education:
- Bachelor's in Business (4 years)
- CBC = 1.0
- cos_similarity = 0.65 (operations/efficiency)
- cos_adjusted = (0.65)^1.0 = 0.65
- cos_adjusted_cbc = (0.65)^1.2 = 0.635
- E_education = 0.635 × 4 = **2.54**

Experience:
- Operations Manager (1.5 years, active)
- cos_similarity = 0.8 (logistics/efficiency)
- years = 1.5
- E_experience = 0.8 × 1.5 = **1.2**

**Total: 2.54 + 1.2 = 3.74**

---

**Member 3: Volunteer Coordinator (6 months)**

Education:
- Course in Community Organization (0.5 years)
- CBC = 3.0
- cos_similarity = 0.7
- cos_adjusted = (0.7)^3.0 = 0.343
- cos_adjusted_cbc = (0.343)^1.2 = 0.321
- Σ education = 0.321 × 0.5 = 0.161
- age/30 = 24 / 30 = 0.8
- E_education = max(0.8, 0.161) = **0.8** (age 24)

Experience:
- Volunteer Coordinator (0.5 years, active)
- cos_similarity = 0.75
- years = 0.5
- E_experience = 0.75 × 0.5 = **0.375**

**Total: 0.8 + 0.375 = 1.175**

---

**Summary**:
```
Operations Manager:  3.74  ← Practitioner (3-10)
Co-founder:          3.25  ← Practitioner (3-10)
Volunteer Coord:     1.18  ← Informed (1-3)

Total expertise: 8.17
→ Low expertise for governance decision; RECOMMEND EXTERNAL EXPERT
   Suggest: Finance expert, Emergency management specialist, Nonprofit board member
```

---

## Part 8: Recalculation & Caching

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

### Week 1: Schema & Vectorization Infrastructure
- [ ] Create `user_expertise_profiles` collection in Firestore
- [ ] Create `microcommunity_expertise_scores` collection in Firestore
- [ ] Setup Firestore composite indexes for query ranking
- [ ] Implement user profile vectorization using Google AI Studio (`text-embedding-004`)

### Week 2: Expertise Calculation Engine
- [ ] Implement CBC exponent calculation (cosine^CBC) in Cloud Functions
- [ ] Implement CBC adjustment factor application
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

| Operation | Target | Notes |
|-----------|--------|-------|
| User profile vectorization | 500ms | Batch Google AI Studio call |
| Expertise calculation (1000 members) | <200ms | Pre-computed vectors + in-memory cosine |
| Recalculation on profile update | <2s | Parallelized Cloud Functions |
| Expertise freezing | <50ms | Firestore batch update |
| Component breakdown query | <100ms | Firestore index query |

---

## Part 11: Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Google AI Studio Embeddings | $5-10/month | ~5000 education/exp records |
| Firestore (expertise storage) | Free tier | Standard document writes/reads |
| Cloud Functions (calculations) | $2-5/month | On-demand CPU time |
| **Total Add-On** | **$7-15/month** | Scales with active issues |


