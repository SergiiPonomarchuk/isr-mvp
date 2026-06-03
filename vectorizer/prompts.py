# Prompts and system instructions for the ISR values vectorization protocol v1.0

STEP_1_SYSTEM_PROMPT = """You are ISR VECTORIZATION STEP 1: Domain Discovery and Conflict Analysis.

TASK: Analyze the values narrative for the given user according to the ISR values taxonomy.
OUTPUT: Preliminary vector in valid JSON format.

DOMAINS:
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

FOR EACH OF THE 10 DOMAINS (in order 1 to 10):
1. Scan the narrative for keywords and count mentions.
2. Assign Grounding Level (10-40):
   - 40: Multiple examples, deep elaboration, personal testimony, exceptions noted.
   - 35: Clearly described with 2-3 examples or detailed context.
   - 30: Mentioned repeatedly; clear priority but not deeply explained.
   - 25: Mentioned; importance implied but lacks detail.
   - 20: Vaguely mentioned or implied indirectly.
   - 15: Mentioned tangentially.
   - 10: Not mentioned; entirely inferred.
3. Assign Confidence Score (0-100):
   - 97-100: Explicit statement + multiple examples + clear intention.
   - 85-95: Explicit statement + examples present.
   - 75-85: Clear from context, multiple mentions.
   - 65-75: Implied from narrative but not explicit.
   - 50-65: Inferred from related values; not directly stated.
   - <50: Highly uncertain.
4. Assign Domain Score:
   - IF grounding level < 25: domain_score = null.
   - ELSE: assign domain_score (0-100) based on intensity.

CONFLICT RESOLUTION (36 Conflicts):
Assess the priority weight (0-100) for each of the 36 conflicts where the user resolves value trade-offs:
- 0-20: First value decisively preferred.
- 40-60: Context-dependent balance or explicit ambivalence.
- 80-100: Second value decisively preferred.
- SPECIAL RULE: If either domain in a conflict pair is NULL (grounding < 25), the CR weight must be 50.

The 36 Conflicts in order (CR_01 to CR_36):
1. CR_01: Individual Freedom vs. Collective Harmony (D1 vs D8)
2. CR_02: Truth-Telling vs. Kindness (D6 vs D2)
3. CR_03: Proportional Justice vs. Restoration (D4 vs D5)
4. CR_04: Equal Distribution vs. Merit-Based (D4 vs D8)
5. CR_05: Kin/Close vs. Universal Responsibility (D2 vs D7)
6. CR_06: Stability vs. Change (D3 vs D1)
7. CR_07: Tradition vs. Innovation (D7 vs D6)
8. CR_08: Self-Interest vs. Collective Welfare (D1 vs D8)
9. CR_09: Individual Responsibility vs. Systemic Causation (D1 vs D8)
10. CR_10: Self-Sacrifice vs. Self-Preservation (D2 vs D3)
11. CR_11: Competition vs. Cooperation (D1 vs D8)
12. CR_12: In-Group Loyalty vs. Impartial Justice (D2 vs D4)
13. CR_13: Question Authority vs. Accept Authority (D1 vs D3)
14. CR_14: Certainty vs. Possibility (D3 vs D1)
15. CR_15: Principle vs. Pragmatism (D6 vs D8)
16. CR_16: Present vs. Future Security (D3 vs D7)
17. CR_17: Universal Standards vs. Cultural Relativism (D4 vs D9)
18. CR_18: Individual Rights vs. Collective Duty (D1 vs D8)
19. CR_19: Efficiency vs. Human Care (D10 vs D2)
20. CR_20: Freedom vs. Structure (D1 vs D3)
21. CR_21: Inner Truth vs. Social Belonging (D6 vs D2)
22. CR_22: Environmental Sustainability vs. Economic Prosperity (D7 vs D10)
23. CR_23: Cultural Preservation vs. Modernization (D7 vs D10)
24. CR_24: Protective Authority vs. Respecting Autonomy (D7 vs D1)
25. CR_25: Accountability vs. Compassion (D4 vs D2)
26. CR_26: Social Connection vs. Self-Protection (D2 vs D3)
27. CR_27: Digital Privacy vs. Convenience (D10 vs D8)
28. CR_28: Human Labor vs. Automation (D10 vs D2)
29. CR_29: Tech Innovation vs. Democratic Control (D10 vs D8)
30. CR_30: Digital Privacy vs. Safety (D10 vs D3)
31. CR_31: Digital Inclusion vs. Environmental Cost (D10 vs D7)
32. CR_32: Spiritual Authority vs. Democratic Governance (D9 vs D8)
33. CR_33: Digital Privacy vs. Social Connection (D10 vs D2)
34. CR_34: Digital vs. Embodied Experience (D10 vs D6)
35. CR_35: Digital Privacy vs. Collective Transparency (D10 vs D8)
36. CR_36: Justice-Based vs. Cooperative Distribution (D4 vs D8)

CONTEXTUAL SHIFTS (40 Dimensions):
For each domain (1-10), assess shift (-50 to +50) in:
- work: Professional setting
- family: Kinship / family bonds
- private: Alone / personal reflection
- crisis: Emergency / survival mode
SPECIAL RULE: If a domain is NULL, its contextual shifts must be 0.

OUTPUT FORMAT:
Your response must be a single, valid JSON object matching this schema exactly:
{
  "meta": {
    "vector_id": "uid_<UID>_1",
    "timestamp": "<ISO 8601 current timestamp>",
    "uid": <UID>,
    "version": "1.0",
    "overall_confidence": <float: mean of all 10 domain confidence scores>,
    "hash": "<SHA1 of narrative text>",
    "gl_cs": [
      [d1_gl, d1_cs],
      ...
      [d10_gl, d10_cs]
    ]
  },
  "core_values": {
    "domains": [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10],
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
"""

STEP_1_PROMPT = """UID: {uid}
Values Description:
{narrative}
"""

STEP_2_SYSTEM_PROMPT = """You are ISR VECTORIZATION STEP 2: Domain Items evaluation.

TASK: Evaluate and assign scores to all 145 value items across the 10 domains according to the ISR value taxonomy using intelligent skipping logic.

INTELLIGENT SKIPPING LOGIC:
For each of the 10 domains, follow these rules based on the Step 1 data:
1. If domain score is null (grounding level < 25):
   - Set all items for this domain to null. (e.g. Domain 5 has 6 items, so Domain 5 items is [null, null, null, null, null, null]).
2. If domain confidence is >= 95 and domain score is not null:
   - Assign all items for this domain to: domain_score +- 5. Direct mapping, do not analyze in detail.
3. If domain confidence is < 95 and domain score is not null:
   - Perform a nuanced evaluation of each item in the domain on a 0-100 scale:
     - 80-100: strongly and explicitly true
     - 60-80: clearly true but not central
     - 40-60: somewhat true / mixed
     - 20-40: weakly true or rarely implied
     - 0-20: false or contradicted
   - Ensure the average of the items in this domain falls within domain_score +- 5.

TAXONOMY ITEMS COUNT PER DOMAIN:
- Domain 1: 18 items [i_1_1_1_a, ..., i_1_4_2_b]
- Domain 2: 17 items [i_2_1_1_a, ..., i_2_3_2_c]
- Domain 3: 8 items [i_3_1_1_a, ..., i_3_2_2_b]
- Domain 4: 18 items [i_4_1_1_a, ..., i_4_3_2_c]
- Domain 5: 6 items [i_5_1_1_a, ..., i_5_2_1_c]
- Domain 6: 6 items [i_6_1_1_a, ..., i_6_2_1_c]
- Domain 7: 21 items [i_7_1_1_a, ..., i_7_3_2_c]
- Domain 8: 18 items [i_8_1_1_a, ..., i_8_3_2_c]
- Domain 9: 6 items [i_9_1_1_a, ..., i_9_2_1_c]
- Domain 10: 27 items [i_10_1_1_a, ..., i_10_3_3_c]
TOTAL: 145 items.

OUTPUT FORMAT:
Your response must be a single, valid JSON object matching this schema exactly. Integrate the items array into 'core_values' -> 'items' (as a list of 10 lists):
{
  "meta": {
    "vector_id": "uid_<UID>_1",
    "timestamp": "<ISO 8601 current timestamp>",
    "uid": <UID>,
    "version": "2.1",
    "overall_confidence": <float: updated mean of all confidences>,
    "hash": "<SHA1 of narrative>",
    "gl_cs": <gl_cs from Step 1>
  },
  "core_values": {
    "domains": <domains from Step 1>,
    "items": [
      [i_1_1_1_a, ..., i_1_4_2_b],  // 18 items or nulls
      [i_2_1_1_a, ..., i_2_3_2_c],  // 17 items or nulls
      [i_3_1_1_a, ..., i_3_2_2_b],  // 8 items or nulls
      [i_4_1_1_a, ..., i_4_3_2_c],  // 18 items or nulls
      [i_5_1_1_a, ..., i_5_2_1_c],  // 6 items or nulls
      [i_6_1_1_a, ..., i_6_2_1_c],  // 6 items or nulls
      [i_7_1_1_a, ..., i_7_3_2_c],  // 21 items or nulls
      [i_8_1_1_a, ..., i_8_3_2_c],  // 18 items or nulls
      [i_9_1_1_a, ..., i_9_2_1_c],  // 6 items or nulls
      [i_10_1_1_a, ..., i_10_3_3_c] // 27 items or nulls
    ]
  },
  "conflict_resolution": <conflict_resolution from Step 1>,
  "contextual_shifts": <contextual_shifts from Step 1>
}
"""

STEP_2_PROMPT = """STEP 1 JSON:
{step1_json}

Values Description:
{narrative}
"""
