# ISR AI Vectorization Protocol v1.0 (Two-Step with Intelligent Skipping)

**Split-Phase Processing: Domain Discovery → Conditional Item Evaluation**

---

## **OVERVIEW**

Two-step vectorization with intelligent filtering:

**STEP 1** (12–15 min): Domain scores, grounding, confidence, conflicts, contextual shifts  
**STEP 2** (8–12 min): Conditional item evaluation (skip null/high-confidence domains)  
**Total**: 20–27 min per profile | **Quality**: 94–99% | **Cost**: $1.20–1.80

---

## **STEP 1: DOMAIN DISCOVERY**

### **Input**

### **Input**
- user id
- Full narrative
- ISR-Values-Taxonomy-general-v1.md (without item definitions)

### **Process**

For each domain (1–10):

1. **Scan narrative** for domain keywords (use v1.0 reference)
2. **Count explicit mentions** (0=absent, 5+=foundational)
3. **Assess grounding** (10–40: how detailed/elaborated?)
4. **Assess confidence** (0–100: how unambiguous?)
5. **Assign domain score** (0–100: intensity if grounding ≥25, else NULL)

**Grounding levels**:
- 40: Multiple examples, deep elaboration, personal testimony
- 35: Clearly described with examples
- 30: Mentioned repeatedly; priority clear but not deep
- 20: Mentioned; importance implied but sparse
- 10: Barely mentioned or completely inferred

**Confidence levels**:
- 95–100: Explicit, unambiguous statements
- 80–95: Clear textual evidence; some minimal interpretation
- 65–80: Mostly textual; moderate inference
- 50–65: Mixed signals, internal contradictions
- <50: Very little textual evidence

**Domain score assignment**:
```
IF grounding < 25:
  domain_score = NULL
  (skip item evaluation in Step 2)
ELSE:
  domain_score = 0–100 based on intensity
```

### **Conflict Resolution** (38 conflicts)

For each conflict:

1. Find explicit text where person resolves the conflict
2. Assign evidence-based weight (0–100):
   - 0–20: First value decisively wins
   - 40–60: Context-dependent balance
   - 80–100: Second value decisively wins

**Special case**: If at least one of conflict domains is NULL, assign CR weight = 50 (no data, no conflict)

### **Contextual Shifts** (40 dimensions: 4 contexts × 10 domains)

For each domain, assess shift in 4 contexts:
- **work**: Professional/organizational setting
- **family**: Intimate relationships, kinship
- **private**: Alone, introspective
- **crisis**: Emergency, survival mode

**Shift range**: -50 to +50
- -40 to -50: Domain suppressed
- -20 to 0: Domain less emphasized
- 0: Unchanged
- +1 to +20: Slightly more important
- +30 to +50: Much more central

**Special case**: If domain is NULL, assign all context shifts = 0

### **Output: STEP 1 JSON (Pre-prompt for STEP 2)**

```json
{
  "meta": {
    "vector_id": "uid_#",
    "timestamp": "ISO_8601",
    "uid": <uid>,
    "version": "1.0",
    "overall_confidence": <mean_of_confidences>,
    "hash": "SHA1_of_narrative",
    "gl_cs": [                        // Grounding_level & Confidence_score per domain (20 Int8 0-100)
      [d_1_gl, d_1_cs],
      ...
      [d_10_gl, d_10_cs]
    ]
  },
  "core_values": {
    "domains": [d_1, d_2, ..., d_10],
    "items": null
  },
  "conflict_resolution": [CR_01, ..., CR_36],
  "contextual_shifts": {
    "work": [WS_1, ..., WS_10],
    "family": [FS_1, ..., FS_10],
    "private": [PS_1, ..., PS_10],
    "crisis": [CS_1, ..., CS_10]
  }
}
```

---

## **STEP 2: CONDITIONAL ITEM EVALUATION**

### **Input**
- STEP 1 JSON output
- Full narrative
- ISR-Values-Taxonomy-items-v1.md (item definitions)

### **Filtering Logic**

```
FOR each domain (1–10):

  IF domain_score = NULL:
    → Assign items = null (skip evaluation)
    → Mark as "skipped_no_grounding"
    
  ELSE IF confidence > 85:
    → Assign items = domain_score ± 5 (direct mapping, trust the analysis)
    → Mark as "skipped_high_confidence"
    
  ELSE:
    → EVALUATE domain items using micro-prompts from ISR-Values-Taxonomy-items-v1
    → Show item reasoning
    → Mark as "evaluated"
```

### **Item Evaluation Process (Per Domain)**

For domains marked "evaluated":

1. **Read micro-prompts** for domain items (ISR-Values-Taxonomy-items)
2. **Score each item** (0–100) based on narrative evidence
3. **Document key quote** per item

**Domains item counts**:
- Domain 1: 18 items
- Domain 2: 17 items
- Domain 3: 8 items
- Domain 4: 18 items
- Domain 5: 6 items
- Domain 6: 6 items
- Domain 7: 21 items
- Domain 8: 18 items
- Domain 9: 6 items
- Domain 10: 27 items
- **Total**: 145 items

### **Output Format: Item Arrays (By Domain)**

```json
"core_values": {
  "domains": [d_1, ..., d_10],
  "items": [
    [i_1_1_1_a, ..., i_1_4_2_b],     // Domain 1: 18 items (or null)
    [i_2_1_1_a, ..., i_2_3_2_c],     // Domain 2: 17 items (or null)
    [i_3_1_1_a, ..., i_3_2_2_b],     // Domain 3: 8 items (or null)
    [i_4_1_1_a, ..., i_4_3_2_c],     // Domain 4: 18 items (or null)
    [i_5_1_1_a, ..., i_5_2_1_c],     // Domain 5: 6 items (or null)
    [i_6_1_1_a, ..., i_6_2_1_c],     // Domain 6: 6 items (or null)
    [i_7_1_1_a, ..., i_7_3_2_c],     // Domain 7: 21 items (or null)
    [i_8_1_1_a, ..., i_8_3_2_c],     // Domain 8: 18 items (or null)
    [i_9_1_1_a, ..., i_9_2_1_c],     // Domain 9: 6 items (or null)
    [i_10_1_1_a, ..., i_10_3_3_c]    // Domain 10: 27 items (or null)
  ]
}
```

---

## **FINAL OUTPUT JSON (STEP 2 COMPLETE)**

```json
{
  "meta": {
    "vector_id": "uid_#",
    "timestamp": "ISO_8601",
    "uid": <uid>,
    "version": "2.1",
    "overall_confidence": <OC>,
    "hash": "SHA1",
    "gl_cs": [
      [d_1_gl, d_1_cs],
      [d_2_gl, d_2_cs],
      ...,
      [d_10_gl, d_10_cs]
    ]
  },
  "core_values": {
    "domains": [d_1, ..., d_10],
    "items": [
      [i_1_1_1_a, ..., i_1_4_2_b],
      [i_2_1_1_a, ..., i_2_3_2_c],
      [i_3_1_1_a, ..., i_3_2_2_b],
      [i_4_1_1_a, ..., i_4_3_2_c],
      [i_5_1_1_a, ..., i_5_2_1_c],
      [i_6_1_1_a, ..., i_6_2_1_c],
      [i_7_1_1_a, ..., i_7_3_2_c],
      [i_8_1_1_a, ..., i_8_3_2_c],
      [i_9_1_1_a, ..., i_9_2_1_c],
      [i_10_1_1_a, ..., i_10_3_3_c]
    ]
  },
  "conflict_resolution": [CR_01, ..., CR_36],
  "contextual_shifts": {
    "work": [WS_1, ..., WS_10],
    "family": [FS_1, ..., FS_10],
    "private": [PS_1, ..., PS_10],
    "crisis": [CS_1, ..., CS_10]
  }
}
```

**Validation**:
- All 10 domains present (value or null)
- All 145 items present (value or null)
- All 36 conflicts present (0–100)
- All 40 context shifts present (-50 to +50)
- gl_cs: 20 values (10×2)
- overall_confidence: mean of domain confidences

---

## **STEP 1 PROMPT (COPY-PASTE)**

```
You are ISR vectorization Step 1: Domain Discovery.

INPUT: UID + narrative + ISR-Values-Taxonomy-general

TASK: Analyze values narrative for UID {uid} according to ISR-Values-Taxonomy-general.
OUTPUT: Preliminary vector with domains, grounding, confidence, 
conflicts, and contextual shifts. NO item evaluation.

DOMAINS (scan narrative; use keywords and methods from ISR-Values-Taxonomy-general):
1. Freedom & Autonomy: autonomy, choice, freedom, dissent
2. Care & Relationality: love, connection, bonds, caring
3. Security & Order: safety, stability, predictability, rules
4. Justice & Fairness: fair, equal, just, equitable
5. Redemption & Restoration: forgiveness, second chances, healing
6. Authentic Expression: authentic, genuine, integrity, honest
7. Stewardship & Protection: protect, vulnerable, steward, future
8. Cooperation & Governance: transparency, accountability, shared power
9. Spiritual & Religious: spiritual, sacred, ritual, faith, ancestors
10. Digital Rights & Tech: privacy, data, surveillance, algorithm

FOR EACH DOMAIN use methods from ISR-Values-Taxonomy-general to:
- Count mentions in narrative (0=absent, 5+=foundational)
- Assign grounding (10–40): how detailed?
- Assign confidence (0–100): how unambiguous?
- IF grounding < 25: domain_score = null
- ELSE: assign domain_score (0–100)

CONFLICTS: Identify 36 conflicts from ISR-Values-Taxonomy-general where person resolves competing values.
Assign weight (0–100); cite evidence using methods from ISR-Values-Taxonomy-general.
Special: If domain is null, CR pairs involving it (from the list below) = 50 (direct mapping)
Domain Conflict Resolution Pairs Participation
1. Freedom & Autonomy: 1, 6, 8, 9, 11, 13, 14, 18, 20, 24
2. Care & Relationality: 2, 5, 10, 12, 19, 21, 25, 26, 28, 33
3. Security & Order: 6, 10, 13, 14, 16, 20, 26, 30
4. Justice & Fairness: 3, 4, 12, 17, 25, 36
5. Redemption & Restoration: 3
6. Authentic Expression: 2, 7, 15, 21, 34
7. Stewardship & Protection: 5, 7, 16, 22, 23, 24, 31
8. Cooperation & Governance: 1, 4, 8, 9, 11, 15, 18, 27, 29, 32, 35, 36
9. Spiritual & Religious: 17, 32
10. Digital Rights & Tech: 19, 22, 23, 27, 28, 29, 30, 31, 33, 34, 35

CONTEXTUAL SHIFTS: For each domain, assess shift (-50 to +50) using methods from ISR-Values-Taxonomy-general in:
  work (professional), family (relatives), private (non-public), crisis (emergency)
Special: If domain is null, shifts = 0.

OUTPUT: JSON per STEP 1 format.
Temperature: 0.2
```

---

## **STEP 2 PROMPT (COPY-PASTE)**

```
You are ISR vectorization Step 2: Item Evaluation.

INPUT: STEP 1 JSON + narrative + ISR-Values-Taxonomy-Items

INTELLIGENT SKIPPING:
- IF domain_score = null: items = null (skip)
- IF confidence > 85: items = domain_score ± 5 (direct assign)
- ELSE: EVALUATE items using taxonomy micro-prompts

EVALUATE domains (if needed):
For each domain in "nuanced_domains" list:
- Read domain items in ISR-Values-Taxonomy-v1.md
- Score each item (0–100) from narrative
- Normalize to domain_score ± 10%
- Document key quote per item

PHASE RESULTS (10 item arrays by domain):
- Domain 1: 18 items [i_1_1_1_a, ..., i_1_4_2_b] or null
- Domain 2: 17 items [i_2_1_1_a, ..., i_2_3_2_c] or null
- ... (continue for all 10 domains)

OUTPUT: Complete Final JSON (STEP 2 format).
Validate all array lengths before returning.
Temperature: 0.2
```

---

### **Quality Checkpoints**

**After STEP 1**:
- [ ] All 10 domains scored (or null with grounding <25 documented)
- [ ] Grounding: 10–40 range (not all 35)
- [ ] Confidence: discrimination visible (not all 80+)
- [ ] 36 conflicts identified
- [ ] 40 contextual shifts assigned

**After STEP 2**:
- [ ] All 145 items present (or null)
- [ ] Items average = domain score (±5% tolerance)
- [ ] No placeholder/default values
- [ ] null domains have all items = null
- [ ] high_confidence domains have items ≈ domain_score

---

## **NOTES**

- **Temperature 0.2** (not 0.1): Allows reasoning depth without randomness
- **No facets/clusters in output**: Direct domain → items
- **Null handling**: Grounding <25 → propagate null through items, conflicts, shifts
- **High-confidence bypass**: Confidence >85 + grounding 30+ → items = domain ± 5 (trust the analysis)
- **Nuanced focus**: Confidence 0–85 → full item evaluation (resolve internal tensions)

**Version frozen at 1.0**