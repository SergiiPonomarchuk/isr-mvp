# ISR Expertise Assessment: Complete Implementation Specification v1.0

## Overview

Expertise measures **ability to influence the outcome** of an issue through domain knowledge, proven experience, and access to resources. Unlike Relevance (which is issue-specific and normalized [0.0-1.0]), Expertise is **absolute and unbounded [0.0+]**, reflecting that some specialists' opinions are significantly more valuable than baseline competence.

---

## Part 1: Expertise Definition & Baseline

### 1.1 Core Concept

**Baseline (1.0)**: Common knowledge of a statistically normal 30-year-old person **without any special education or practical experience** in the issue domain. This represents generic adult competence across life domains.

**Below baseline (0.0-1.0)**: People without special education/experience whose expertise is **lower than normal** due to:
- Age factors (young people lack context; older people may lack contemporary knowledge in fast-evolving domains)
- Incomplete education (high school dropout)
- Cognitive/physical limitations
- Over-specialized interests misaligned with issue domain

**Above baseline (1.0+)**: People with **education or practical experience** in the issue domain. Unbounded because high-level specialists significantly exceed baseline competence.

**Interpretation**:
- **0.5**: Half the baseline competence (young learner, older person in tech)
- **1.0**: Baseline (generic adult non-specialist)
- **1.5**: 50% above baseline (beginner practitioner)
- **3.0**: Three times baseline (strong practitioner specialist with credentials)
- **45.0+**: World-class expert (30 years + PhD + active practice)

---

## Part 2: Expertise Scoring Formula

### 2.1 Core Formula

$$E_{i,q} = E_{i,q,\text{education}} + E_{i,q,\text{experience}} + E_{i,q,\text{resources}}$$

Where:
- **$E_{i,q}$** = Total Expertise of user i regarding issue q
- **$E_{i,q,education}$** = User i education expertise regarding issue q
- **$E_{i,q,experience}$** = User i experience expertise regarding issue q
- **$E_{i,q,resources}$** = User i resource expertise regarding issue q

The three components are added **without weights**. The context of the issue acts through the similarity of each record to the issue ($\vec{V}_q$) and through the domain parameters (CBC adjustment factor, recency decay).

---

### 2.2 Education Expertise

$$E_{i,q,\text{education}} = \sum_{\text{education}} \cos(\vec{v}_{i,\text{education}}, \vec{V}_q) ^ {\text{CBC}} \times P_{i,\text{education}}$$

Where:
- **$v_{i,education}$** = Vectorized education records (semantic embedding)
- **$V_q$** = Issue q vector representation
- **$CBC$** = Credential Broadcast Coefficient
- **$P_{i,education}$** = Education Power scalar (education time in years)
- **Cosine similarity with CBC exponent** = Semantic relevance of credential to issue, adjusted by broadcast capability [0.0-1.0]
- **Power scalar** = Education time in years [0.5+]


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
P_education = 7 years (PhD time)
E_education = 0.548 × 7 = 3.84
```

**Vocational Locksmith addressing street parking issue**:
```
cos_similarity = 0.2 (very distant domain)
CBC = 2.0 (Vocational suppresses)
CBC_adjusted = cos(0.2)^2.0 = 0.04
P_education = 2 years (vocational training)
E_education = 0.04 × 2 = 0.08
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

### 2.4 Resource Expertise

$$E_{i,q,\text{resources}} = \sum_{\text{resources}} \cos(\vec{v}_{i,\text{resources}}, \vec{V}_q) \times P_{i,\text{resources}}$$

Where:
- **v_{i,resources}** = Vectorized resource records (semantic embedding)
- **V_q** = Issue q vector representation
- **P_{i,resources}** = Resource Power scalar (rarity multiplier)
- **Cosine similarity** = Semantic resource relevance to issue [0.0-1.0]
- **Power scalar** = Rarity multiplier [0.5-1.5]

**Rarity Multiplier Scale**:
- **0.5**: Common in area (car ownership, office space, basic tools)
- **1.0**: Moderate rarity (specialized equipment, professional networks)
- **1.5**: High rarity (rare expertise connections, unique facilities, specialized tech)

**Resources Include**: tools, equipment, technology, transportation, space/venue, social connections. **Money is not a resource in this score**: if an issue needs funding, each option states its cost and funding source, so wealth does not enter through weight.

**Example (parking structure proposal issue)**:
```
Resources:
- Car ownership: 
  cos_relevance = 0.9, rarity = 0.5 (common)
  E_resource = 0.9 × 0.5 = 0.45

- Construction equipment: 
  cos_relevance = 0.8, rarity = 1.0 (moderate)
  E_resource = 0.8 × 1.0 = 0.8

- Large property/land: 
  cos_relevance = 1.0, rarity = 1.5 (high)
  E_resource = 1.0 × 1.5 = 1.5

- Contractor network: 
  cos_relevance = 0.8, rarity = 1.0 (moderate)
  E_resource = 0.8 × 1.0 = 0.8

Total Resource Expertise = 0.45 + 0.8 + 1.5 + 0.8 = 3.55
```

---

## Part 3: Domain Context & AI Analysis

### 3.1 AI-Driven Domain Classification

When an issue is submitted, **LLM determines** contextual parameters:

1. **Domain Category**: Extracted from issue description (locksmith.security, urban_planning.infrastructure, social.event.cultural, etc.)

2. **Contemporary Knowledge Importance** [0.0-1.0]:
   - 0.0 = Timeless domain (philosophy, history, fundamental engineering principles)
   - 0.5 = Mixed (some techniques evolve, core principles stable)
   - 1.0 = Highly contemporary (software, medicine, regulatory compliance)

3. **Recency Decay Rate** [per year of inactivity]:
   - 0.01 = Slow decay (locksmith, carpentry, philosophy)
   - 0.03 = Moderate decay (construction, business management)
   - 0.05 = Fast decay (software engineering, medical practice)
   - 0.08 = Extremely fast decay (cutting-edge AI, quantum computing)

4. **Age Penalty Threshold** [years, for contemporary domains only]:
   - 55-60 = Traditional professions (law, engineering, medicine)
   - 65-70 = Established fields (management, education)
   - 75+ = Emerging fields (software, biotech)

5. **CBC Adjustment Factor** [multiplier for Credential Broadcast Coefficient]:
   - 1.0 = Use base CBC values (default)
   - 0.8 = Reduce CBC power (make domain more focused, less broadcasting)
   - 1.2 = Increase CBC power (make domain more broad, more broadcasting)

### 3.2 Example Domain Contexts

**Issue: "Fix broken apartment lock"**
```
Domain: locksmith.security
Contemporary importance: 0.2 (techniques very stable)
Recency decay: 0.02/year (skills decay slowly)
Age penalty: none (not contemporary domain)
CBC adjustment: 0.9 (reduce broadcasting slightly)
→ Master Locksmith dominates; Engineer has lower relevance
```

**Issue: "Organize salsa evenings in district"**
```
Domain: social.event.cultural
Contemporary importance: 0.4 (some modern tech/platforms)
Recency decay: 0.03/year
Age penalty: modest for > 70 (some platform updates)
CBC adjustment: 1.1 (increase broadcasting for org skills)
→ Dancer + Event organizer + Business person all relevant
```

**Issue: "Propose parking structure + budget allocation"**
```
Domain: urban_planning.infrastructure.governance
Contemporary importance: 0.7 (design & regulations dynamic)
Recency decay: 0.04/year
Age penalty: moderate for > 65
CBC adjustment: 1.0 (neutral, balanced)
→ Urban planner, Accountant, Builder, MBA all weighted similarly
```

---

## Part 4: Database Schema & Vectorization

### 4.1 user_expertise_profiles Collection

Each document in the `user_expertise_profiles` collection stores pre-computed 768-dimensional embeddings for a user's credentials, experience, and resources.

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
  "resources": [
    {
      "id": 1,
      "type": "equipment",
      "name": "Locksmith Tool Kit",
      "description": "Professional locksmith tools",
      "rarity": "high",
      "verified": true
    }
  ],
  "resource_vectors": [
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

### 4.4 Resources Structure

```json
{
  "resources": [
    {
      "id": 1,
      "type": "equipment",
      "name": "Locksmith Tool Kit",
      "description": "Professional locksmith tools including picks, tension wrenches, and specialty equipment",
      "rarity": "high",
      "verified": true
    },
    {
      "id": 2,
      "type": "transportation",
      "name": "Commercial Vehicle",
      "description": "Van suitable for transporting equipment and clients",
      "rarity": "medium",
      "verified": true
    },
    {
      "id": 3,
      "type": "social_network",
      "name": "Contractor Network",
      "description": "Professional relationships with 20+ contractors and building managers in metro area",
      "rarity": "medium",
      "verified": false
    }
  ]
}
```

### 4.5 microcommunity_expertise_scores Collection

Each document in this collection tracks the calculated expertise components for a member in a specific microcommunity.

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
  "resources_expertise": 2.785,
  "resources_component_count": 3,
  "expertise_score": 34.01,
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
  
  // 3. Vectorize resources
  const resourceVectors = [];
  for (const res of (userData.resources || [])) {
    const text = `${res.type}: ${res.name}. ${res.description}`;
    const vector = await embedText(text);
    resourceVectors.push(vector);
  }
  
  // 4. Store in database
  await db.collection("user_expertise_profiles").doc(userId).set({
    uid: userId,
    education_records: userData.education_records || [],
    education_vectors: educationVectors,
    experience_records: userData.experience_records || [],
    experience_vectors: experienceVectors,
    resources: userData.resources || [],
    resource_vectors: resourceVectors,
    vectors_computed_at: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // 5. Trigger recalculation for active microcommunities
  await recalculateExpertiseForUserAllActiveIssues(userId);
}
```

### 5.2 On-Demand: Expertise Calculation for Issue

**When microcommunity formed for issue:**

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
    
    // COMPONENT 3: RESOURCE EXPERTISE
    let resourcesExpertise = 0.0;
    const resRecords = profile.resources || [];
    const resVectors = profile.resource_vectors || [];
    const rarityMap = { low: 0.5, medium: 1.0, high: 1.5 };
    for (let i = 0; i < resRecords.length; i++) {
      const res = resRecords[i];
      const resVector = resVectors[i];
      const cosSim = cosineSimilarity(resVector, issueVector);
      const rarity = rarityMap[res.rarity] || 1.0;
      resourcesExpertise += Math.max(0, cosSim) * rarity;
    }
    
    // TOTAL EXPERTISE SCORE
    const totalExpertise = educationExpertise + experienceExpertise + resourcesExpertise;
    
    await db.collection("microcommunity_expertise_scores").doc(`${microcommunityId}_${userId}`).set({
      microcommunity_id: microcommunityId,
      user_id: userId,
      education_expertise: educationExpertise,
      education_component_count: eduRecords.length,
      experience_expertise: experienceExpertise,
      experience_component_count: expRecords.length,
      resources_expertise: resourcesExpertise,
      resources_component_count: resRecords.length,
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
      resources: Number(data.resources_expertise.toFixed(2)),
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
Contemporary importance: 0.2 (skills very stable)
Recency decay: 0.02/year (skills decay slowly)
Age penalty: none (not contemporary domain)
CBC adjustment: 0.9 (reduce broadcasting)
```

**Member 1: John (Master Locksmith, age 52)**

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

Resources:
- Locksmith toolkit: cos = 0.99, rarity = 1.5 → 0.99 × 1.5 = 1.485
- Van: cos = 0.7, rarity = 1.0 → 0.7 × 1.0 = 0.7
- Contractor network: cos = 0.6, rarity = 1.0 → 0.6 × 1.0 = 0.6
- E_resources = **2.785**

**Total Expertise: 1.824 + 29.4 + 2.785 = 34.01**

---

**Member 2: Sarah (Engineer, age 55)**

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

Resources:
- Engineering software: cos = 0.1, rarity = 0.5 → 0.1 × 0.5 = 0.05
- E_resources = **0.05**

**Total Expertise: 1.708 + 11.55 + 0.05 = 13.31**

---

**Member 3: Lisa (Office Manager, age 30)**

Education:
- Bachelor's in Business (4 years, 2016)
- CBC = 1.0
- cos_similarity = 0.05 (completely unrelated)
- cos_adjusted = (0.05)^1.0 = 0.05
- cos_adjusted_cbc = (0.05)^0.9 = 0.054
- E_education = 0.054 × 4 = **0.216**

Experience:
- Office Manager (8 years, 2017-2025)
- cos_similarity = 0.02 (no locksmith relevance)
- years = 8
- E_experience = 0.02 × 8 = **0.16**

Resources:
- None relevant
- E_resources = **0.0**

**Total Expertise: 0.216 + 0.16 + 0.0 = 0.376**

---

**Summary**:
```
John (Master Locksmith):      34.01  ← Expert (>10)
Sarah (Engineer):             13.31  ← Practitioner (3-10)
Lisa (Office Manager):         0.38  ← Novice (<1)

Total expertise: 47.70
→ Strong expertise in microcommunity; no external expert needed
```

---

### Example 2: Salsa Evening Organization

**Issue**: "Establish regular salsa evenings in our district. Can someone suggest a place or join?"

**Domain Context**:
```
Domain: social.event.cultural
Contemporary importance: 0.4 (some modern platforms)
Recency decay: 0.03/year
CBC adjustment: 1.1 (increase broadcasting for org skills)
```

**Member 1: Maria (Salsa Dancer & Choreographer, age 28)**

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

Resources:
- Studio space/contacts: cos = 0.85, rarity = 1.5 → 1.275
- Dance equipment: cos = 0.7, rarity = 1.0 → 0.7
- Social media: cos = 0.6, rarity = 0.5 → 0.3
- E_resources = **2.275**

**Total Expertise: 3.78 + 0.916 + 7.84 + 5.52 + 2.275 = 20.33**

---

**Member 2: David (Real Estate Broker, age 45)**

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

Resources:
- Real estate network: cos = 0.85, rarity = 1.0 → 0.85
- Venue access: cos = 0.9, rarity = 1.5 → 1.35
- E_resources = **2.2**

**Total Expertise: 2.372 + 15.0 + 2.2 = 19.57**

---

**Member 3: Alex (Event Planner, age 35)**

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

Resources:
- Vendor network: cos = 0.7, rarity = 1.0 → 0.7
- Event tech: cos = 0.6, rarity = 0.5 → 0.3
- E_resources = **1.0**

**Total Expertise: 1.688 + 13.2 + 1.0 = 15.89**

---

**Summary**:
```
Maria (Salsa Dancer):        20.33  ← Expert (>10)
David (Real Estate Broker):  19.57  ← Expert (>10)
Alex (Event Planner):        15.89  ← Practitioner (3-10)

Total expertise: 55.79
→ Strong diverse expertise; no external expert needed
```

---

### Example 3: Parking Structure Proposal

**Issue**: "Build parking structure using park space + budget allocation strategy"

**Domain Context**:
```
Domain: urban_planning.infrastructure.governance
Contemporary importance: 0.7
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

Resources:
- GIS software: cos = 0.7, rarity = 1.0 → 0.7
- Stakeholder network: cos = 0.8, rarity = 1.0 → 0.8
- E_resources = **1.5**

**Total: 1.906 + 10.8 + 1.5 = 14.206**

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

Resources:
- Financial analysis tools: cos = 0.6, rarity = 1.0 → 0.6
- E_resources = **0.6**

**Total: 2.8 + 12.75 + 0.6 = 16.15**

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

Resources:
- Construction equipment: cos = 0.9, rarity = 1.0 → 0.9
- Contractor network: cos = 0.8, rarity = 1.0 → 0.8
- E_resources = **1.7**

**Total: 1.28 + 17.0 + 1.7 = 20.0**

---

**Summary**:
```
Builder:           20.0   ← Expert (>10)
Accountant:        16.15  ← Expert (>10)
Urban Planner:     14.21  ← Practitioner (3-10)

Total expertise: 50.36
→ Balanced expertise; no external expert needed
```

---

### Example 4: Fund Allocation During Crisis

**Issue**: "Allocate $65K & 200 volunteer hours: immediate aid (95%) vs. infrastructure (70/30)?"

**Domain Context**:
```
Domain: governance.nonprofit.emergency_response
Contemporary importance: 0.5
Recency decay: 0.03/year
CBC adjustment: 1.2 (increase broadcasting for governance)
```

**Member 1: Co-founder (2.5 years direct experience)**

Education:
- None formal (self-taught)
- E_education = 0.0

Experience:
- Emergency Response Coordinator (2.5 years, active)
- cos_similarity = 0.9 (crisis management)
- years = 2.5
- E_experience = 0.9 × 2.5 = **2.25**

Resources:
- Donor relationships: cos = 0.8, rarity = 1.5 → 1.2
- Supply chain: cos = 0.7, rarity = 1.0 → 0.7
- E_resources = **1.9**

**Total: 0.0 + 2.25 + 1.9 = 4.15**

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

Resources:
- Spreadsheet/database tools: cos = 0.5, rarity = 0.5 → 0.25
- E_resources = **0.25**

**Total: 2.54 + 1.2 + 0.25 = 3.99**

---

**Member 3: Volunteer Coordinator (6 months)**

Education:
- Course in Community Organization (0.5 years)
- CBC = 3.0
- cos_similarity = 0.7
- cos_adjusted = (0.7)^3.0 = 0.343
- cos_adjusted_cbc = (0.343)^1.2 = 0.321
- E_education = 0.321 × 0.5 = **0.161**

Experience:
- Volunteer Coordinator (0.5 years, active)
- cos_similarity = 0.75
- years = 0.5
- E_experience = 0.75 × 0.5 = **0.375**

Resources:
- Social network/recruiting: cos = 0.6, rarity = 1.0 → 0.6
- E_resources = **0.6**

**Total: 0.161 + 0.375 + 0.6 = 1.136**

---

**Summary**:
```
Co-founder:          4.15  ← Informed (1-3)
Operations Manager:  3.99  ← Informed (1-3)
Volunteer Coord:     1.14  ← Novice (<1)

Total expertise: 9.28
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
  
  // 2. Find all active (non-voted) microcommunities where user is member
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
  
  // 1. Freeze expertise scores on the microcommunity
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
- [ ] Implement resource rarity lookup

### Week 3: Integration & Testing
- [ ] Integrate expertise calculation with microcommunity formation
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


