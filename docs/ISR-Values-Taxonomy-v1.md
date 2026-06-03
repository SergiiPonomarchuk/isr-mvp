# ISR Values Vector: Action-Assessment Taxonomy v1.0

**FOCUSED ON ACTION EVALUATION FOR COMMUNITY FUTURES**

Based on Shalom Schwartz's universal value types, Community-Oriented Action Assessment approach.

**Purpose**: Measure whether proposed actions move community toward or away from stated desired future.

**Version 1.0** | Released December 2025 | Focused for Action Assessment Purpose

---

## I. VECTOR ARCHITECTURE OVERVIEW

### Design Principles

1. **Hierarchical nesting** with 4 depth levels (Domain → Facet → Cluster → Item)
2. **Minimal sufficient dimensionality**: 145 core dimensions across 10 domains
3. **Balanced distribution**: 6–27 items per domain (non-redundant coverage)
4. **Rational-number precision**: Int8 (0-100) sufficient for 90%+ accuracy
5. **Conflict-aware structure**: Opposing dimensions explicitly paired; 36 CR weights
6. **Contextual shifts subsystem**: Accounting context-aware vision changes; 4 contexts

### Core Principle
**Every dimension measures one question: "If community people acts this way, does it embody our desired future?"**

NOT measured:
- Personal psychological traits (anxiety, curiosity, emotional capacity)
- Individual capability or preference (comfort level, thinking style)
- Belief systems without action implications
- Internal emotional states

YES measured:
- Commitments to action patterns
- How community decides and allocates
- Who is protected, included, heard
- Whose voice matters
- What happens to vulnerable and future

### Vector Structure

```json
{
  "meta": {
    "vector_id": "uuid-or-person-id", // current values description version
    "timestamp": "2025-12-30T22:00:00Z",
    "uid": person_id,
    "version": "1.0",                 // current taxonomy version
    "overall_confidence": OC,         // 1 Int8 (0-100)
    "hash": VALUES_DESCRIPTION_HASH,  // 40 Char (SHA-1)
    "gl_cs": [                        // Grounding_level & Confidence_score per domain (20 Int8 0-100)
      [d_1_gl, d_1_cs],
      ...
      [d_10_gl, d_10_cs]
    ]
  },
  
  "core_values": {
    "domains": [d_1, ... d_10],              // 10 Int8 (0-100)
    "items": [                               // by domines:
      [i_1_1_1_a, ... i_1_4_2_b],              // 18 Int8 (0-100)
      [i_2_1_1_a, ... i_2_3_2_c],              // 17 Int8 (0-100)
      [i_3_1_1_a, ... i_3_2_2_b],              // 8 Int8 (0-100)
      [i_4_1_1_a, ... i_4_3_2_c],              // 18 Int8 (0-100)
      [i_5_1_1_a, ... i_5_2_1_c],              // 6 Int8 (0-100)
      [i_6_1_1_a, ... i_6_2_1_c],              // 6 Int8 (0-100)
      [i_7_1_1_a, ... i_7_3_2_c],              // 21 Int8 (0-100)
      [i_8_1_1_a, ... i_8_3_2_c],              // 18 Int8 (0-100)
      [i_9_1_1_a, ... i_9_2_1_c],              // 6 Int8 (0-100)
      [i_10_1_1_a, ... i_10_3_3_c]             // 27 Int8 (0-100)
    ]
  },
  "conflict_resolution": [CR_01, ... CR_36], // 36 Int8 (0-100)
  "contextual_shifts": {                     // 40 Int8 (-50 to +50)
    "work": [WS_1, ... WS_10],
    "family": [FS_1, ... FS_10],
    "private": [PS_1, ... PS_10],
    "crisis": [CS_1, ... CS_10]
  }
}
```

---

## II. DOMAIN CATEGORIES (10 Main Domains, 28 Facets, 145 Items)

Each domain includes:
- **Definition** (what it measures for ISR)
- **Facets** (3–4 subdivisions)
- **Clusters** (specific value clusters)
- **Items** (leaf 0–100 dimensions)
- **Conflict pairs** (explicit trade-offs)

### DOMAIN CATEGORY 1: AGENCY & FREEDOM (4 facets, 18 items)

**Definition**: Degree to which community enables and protects individual capacity to make autonomous choices, resist coercion, and shape own life.

**Action-focus**: "Does community create conditions where people can choose freely?"

#### 1.1 Moral Freedom & Choice

*Community enables genuine choice and respects decisions made.*

- **1.1.1 Freedom to Choose**
  - 1.1.1.a: Community respects choices even when disagreeable
  - 1.1.1.b: People have exit rights (can leave without penalty)

- **1.1.2 Autonomy Conditions**
  - 1.1.2.a: Community provides information for informed choice
  - 1.1.2.b: People own their time and labor (not coerced)
  - 1.1.2.c: Norms don't force conformity; diversity of paths allowed

#### 1.2 Anti-Coercion & Power-Limitation

*Community actively prevents domination and abuse.*

- **1.2.1 Preventing Abuse**
  - 1.2.1.a: Community opposes unjust hierarchy
  - 1.2.1.b: Community prevents manipulation and deception by authorities
  - 1.2.1.c: Community protects exit rights (can refuse unjust situations)

- **1.2.2 Distributed Power**
  - 1.2.2.a: Power is distributed, not concentrated
  - 1.2.2.b: Community resists institutional overreach

#### 1.3 Self-Determination Spaces

*Community supports people pursuing self-defined goals.*

- **1.3.1 Goal Pursuit Support**
  - 1.3.1.a: Community enables people to choose own path
  - 1.3.1.b: Resources and time accessible for own goals

- **1.3.2 Responsibility-Taking**
  - 1.3.2.a: Community supports people taking responsibility for own welfare

#### 1.4 Bodily & Medical Autonomy

*Community protects control over body and medical decisions.*

- **1.4.1 Medical Self-Determination**
  - 1.4.1.a: Community respects medical decisions even if disagree
  - 1.4.1.b: Reproductive autonomy protected
  - 1.4.1.c: Community doesn't force treatment

- **1.4.2 Inclusive Physical Autonomy**
  - 1.4.2.a: Community accommodates disabled people (not forces assimilation)
  - 1.4.2.b: Accessibility is standard, not exception

---

### DOMAIN CATEGORY 2: RELATIONALITY & CARE (4 facets, 17 items)

**Definition**: Degree to which community actively cares for relationships, honors bonds, and creates conditions for connection.

**Action-focus**: "Does community prioritize relationships and care?"

#### 2.1 Active Care for Particular People

*Community builds and maintains deep relationships.*

- **2.1.1 Knowing People Deeply**
  - 2.1.1.a: Community learns and knows individuals
  - 2.1.1.b: Community accepts people as they are, not as "should be"
  - 2.1.1.c: Relationships are prioritized (not transactional)

- **2.1.2 Unconditional Presence**
  - 2.1.2.a: Community includes strangers and those unlike us
  - 2.1.2.b: Care is not conditional on likability or usefulness
  - 2.1.2.c: Community seeks humanity in the "other"

#### 2.2 Family Bonds & Community Bonds

*Community honors relationships and group membership.*

- **2.2.1 Relational Loyalty**
  - 2.2.1.a: Community prioritizes members (family-like responsibility)
  - 2.2.1.b: Community maintains continuity and remembers history

- **2.2.2 Diverse Forms of Belonging**
  - 2.2.2.a: Community recognizes all family forms (LGBTQ+, chosen, etc.)
  - 2.2.2.b: Mutual aid is shared responsibility within community
  - 2.2.2.c: Belonging is not conditional on conformity

#### 2.3 Responsibility to Others

*Community takes responsibility for impact on people beyond itself.*

- **2.3.1 Expanding Circle of Responsibility**
  - 2.3.1.a: Community takes responsibility for actions' ripple effects
  - 2.3.1.b: Community feels obligation to distant/unknown people
  - 2.3.1.c: Global impact is considered in decisions

- **2.3.2 Intergenerational Duty**
  - 2.3.2.a: Community prioritizes future generations
  - 2.3.2.b: Community protects children first
  - 2.3.2.c: Stewardship of world for those not yet born

---

### DOMAIN CATEGORY 3: SECURITY & STABLE ORDER (2 facets, 8 items)

**Definition**: Degree to which community provides safety, basic needs, and predictable structure.

**Action-focus**: "Does community ensure basic safety and order?"

#### 3.1 Physical Safety & Needs

*Community guarantees basic security and meets needs.*

- **3.1.1 Protecting from Harm**
  - 3.1.1.a: Community prevents violence and bodily harm
  - 3.1.1.b: Community ensures shelter, food, health access

- **3.1.2 Stability for Living**
  - 3.1.2.a: Community maintains predictable conditions for planning
  - 3.1.2.b: Chaos and emergency are prevented when possible

#### 3.2 Clear Order & Structure

*Community has clear rules and role clarity.*

- **3.2.1 Transparent Norms**
  - 3.2.1.a: Community rules are clear and knowable
  - 3.2.1.b: Roles and responsibilities are defined

- **3.2.2 Evolution of Norms**
  - 3.2.2.a: Rules change when needed; not rigid
  - 3.2.2.b: Balance between stability and adaptation

---

### DOMAIN CATEGORY 4: JUSTICE & FAIRNESS (3 facets, 18 items)

**Definition**: Degree to which community treats people fairly, allocates resources equitably, and addresses injustice.

**Action-focus**: "Does community make fair decisions and distributions?"

#### 4.1 Equal Worth & Dignity

*Community treats all people as fundamentally equal.*

- **4.1.1 Baseline Equality**
  - 4.1.1.a: Community grants equal rights to all members
  - 4.1.1.b: No person is treated as "worth less"
  - 4.1.1.c: Community rejects hierarchy based on identity

- **4.1.2 Equality of Opportunity**
  - 4.1.2.a: Community removes barriers to equal starting position
  - 4.1.2.b: Community redistributes to level playing field
  - 4.1.2.c: Access is not determined by birth circumstances

#### 4.2 Fair Proportionality

*Community matches outcomes to contribution and effort.*

- **4.2.1 Rewarding Contribution**
  - 4.2.1.a: Community rewards effort and good behavior
  - 4.2.1.b: Consequences are proportional to actions
  - 4.2.1.c: Contribution affects allocation when relevant

- **4.2.2 Reciprocal Exchange**
  - 4.2.2.a: Community maintains fair give-and-take
  - 4.2.2.b: No free-riding or exploitation allowed
  - 4.2.2.c: Mutual obligation is expected and enforced

#### 4.3 Meeting Actual Needs

*Community adjusts for difference so everyone can flourish.*

- **4.3.1 Sufficiency for All**
  - 4.3.1.a: Community ensures baseline (food, shelter, dignity)
  - 4.3.1.b: Community provides extra support for vulnerable
  - 4.3.1.c: Community adjusts to actual differences (equity)

- **4.3.2 Correcting Past Wrongs**
  - 4.3.2.a: Community addresses historical injustices
  - 4.3.2.b: Community repairs harm done
  - 4.3.2.c: Community restores those wronged to fullness

---

### DOMAIN CATEGORY 5: REDEMPTION & RESTORATION (2 facets, 6 items)

**Definition**: Degree to which community believes in transformation, second chances, and redemption of wrongdoers.

**Action-focus**: "Does community allow people to change and be restored?"

#### 5.1 Forgiveness & Letting Go

*Community moves beyond grudges and past wrongs.*

- **5.1.1 Releasing Resentment**
  - 5.1.1.a: Community lets go of grudges
  - 5.1.1.b: Past actions don't permanently define person
  - 5.1.1.c: Possibility of change is honored (not just punishment)

#### 5.2 Restoration & Reintegration

*Community brings wrongdoers back, doesn't exile them.*

- **5.2.1 Return to Community**
  - 5.2.1.a: Community reintegrates wrongdoers (exile is last resort)
  - 5.2.1.b: Community demonstrates people can change
  - 5.2.1.c: Healing relationships is prioritized over resentment

---

### DOMAIN CATEGORY 6: AUTHENTIC EXPRESSION & VALUE-LIVING (2 facets, 6 items)

**Definition**: Degree to which community allows genuine self-expression and living according to stated values.

**Action-focus**: "Does community allow authentic expression and value coherence?"

#### 6.1 Living with Integrity

*Community enables people to act according to stated values.*

- **6.1.1 Value-Behavior Coherence**
  - 6.1.1.a: Community makes living by values possible (not hypocritical)
  - 6.1.1.b: Walking the talk is possible (values match actions)
  - 6.1.1.c: Transparency: people can be known as they are

#### 6.2 Authentic Self-Expression

*Community protects genuine expression, even if unpopular.*

- **6.2.1 Expression Allowed**
  - 6.2.1.a: Community allows people to express true beliefs
  - 6.2.1.b: Genuine perspectives are valued (not silenced)
  - 6.2.1.c: People are not forced to hide or mask

---

### DOMAIN CATEGORY 7: PROTECTIVE CARE & STEWARDSHIP (3 facets, 21 items)

**Definition**: Degree to which community protects vulnerable, stewards nature, preserves heritage, and acts for future generations.

**Action-focus**: "Does community protect those who need protection and care for the world?"

#### 7.1 Protection of Vulnerable

*Community prioritizes care for those unable to protect themselves.*

- **7.1.1 Child Protection**
  - 7.1.1.a: Community makes children safety central (all policy measured by this)
  - 7.1.1.b: Child welfare is yardstick for good community
  - 7.1.1.c: Community willingly sacrifices for child welfare

- **7.1.2 Advocacy for Powerless**
  - 7.1.2.a: Community speaks for those without voice
  - 7.1.2.b: Community has special responsibility to vulnerable
  - 7.1.2.c: Community uses power to protect, not exploit

#### 7.2 Environmental Stewardship

*Community cares for natural world and limits own impact.*

- **7.2.1 Ecological Commitment**
  - 7.2.1.a: Community acts on environmental concern (pollution, climate, biodiversity)
  - 7.2.1.b: Community values non-human life intrinsically (not just instrumental)
  - 7.2.1.c: Long-term ecosystem health > short-term gain

- **7.2.2 Personal Responsibility & Action**
  - 7.2.2.a: Community members reduce consumption footprint
  - 7.2.2.b: Community members acknowledge personal impact
  - 7.2.2.c: Community holds itself accountable

- **7.2.3 Systemic Change Commitment**
  - 7.2.3.a: Community supports environmental policy
  - 7.2.3.b: Community recognizes systems need change (not just individuals)
  - 7.2.3.c: Community advocates at policy level

#### 7.3 Intergenerational Stewardship

*Community ensures future generations inherit livable, fair world.*

- **7.3.1 Future as Priority**
  - 7.3.1.a: Community gives future people equal moral standing
  - 7.3.1.b: Community commits to livable, healthy world for them
  - 7.3.1.c: Present comfort doesn't override future opportunity

- **7.3.2 Preserving Meaning & Heritage**
  - 7.3.2.a: Community honors ancestral wisdom
  - 7.3.2.b: Community maintains meaningful practices
  - 7.3.2.c: Community doesn't discard heritage for novelty alone

---

### DOMAIN CATEGORY 8: COOPERATION & SHARED GOVERNANCE (3 facets, 18 items)

**Definition**: Degree to which community makes decisions collectively, shares resources fairly, and governs transparently.

**Action-focus**: "Does community govern collectively and share equitably?"

#### 8.1 Collective Decision-Making

*Community decides together and prioritizes shared good.*

- **8.1.1 Group Deliberation**
  - 8.1.1.a: Community avoids conflict through dialogue
  - 8.1.1.b: Community seeks consensus (not just majority)
  - 8.1.1.c: Collective good is prioritized (not just individual interest)

- **8.1.2 Shared Purpose & Mission**
  - 8.1.2.a: Community has common mission uniting members
  - 8.1.2.b: Collective goal takes priority over individual achievement
  - 8.1.2.c: Community takes pride in collective accomplishment

#### 8.2 Transparent Governance

*Community makes decisions openly, explains itself, allows accountability.*

- **8.2.1 Open Information**
  - 8.2.1.a: Community decisions are transparent (not hidden)
  - 8.2.1.b: Community explains how power is used
  - 8.2.1.c: Secrecy is known corruption risk (prevented)

- **8.2.2 Accountability**
  - 8.2.2.a: Community leaders must justify decisions
  - 8.2.2.b: Accountability prevents power abuse
  - 8.2.2.c: No one is above question

#### 8.3 Shared Resources & Distribution

*Community shares what's collectively owned and distributes fairly.*

- **8.3.1 Commons Care**
  - 8.3.1.a: Community treats shared resources as belonging to all
  - 8.3.1.b: Community prevents tragedy of commons (sustainable use)
  - 8.3.1.c: Community opposes hoarding and extraction

- **8.3.2 Fair Economic Allocation**
  - 8.3.2.a: Community prioritizes meeting everyone's basic needs first
  - 8.3.2.b: Community opposes extreme wealth concentration
  - 8.3.2.c: Community considers effort/contribution in distribution

---

### DOMAIN CATEGORY 9: SPIRITUAL & RELIGIOUS PRACTICE (2 facets, 6 items)

**Definition**: Degree to which community honors spiritual traditions, creates spaces for spiritual community, and integrates spiritual practice.

**Action-focus**: "Does community support and respect spiritual practice?"

#### 9.1 Religious Community & Belonging

*Community honors religious community and participation.*

- **9.1.1 Community Participation**
  - 9.1.1.a: Community honors religious community membership
  - 9.1.1.b: Community recognizes shared spiritual practice as creating belonging
  - 9.1.1.c: Community honors connection between spirituality and ancestors/future

#### 9.2 Spiritual Practice & Integration

*Community respects and enables sacred practice.*

- **9.2.1 Sacred Practice Support**
  - 9.2.1.a: Community honors religious practice/ritual (intrinsic value)
  - 9.2.1.b: Community supports maintaining religious tradition
  - 9.2.1.c: Community recognizes spiritual practice as transformative

---

### DOMAIN CATEGORY 10: DIGITAL RIGHTS & TECH DEMOCRACY (3 facets, 27 items)

**Definition**: Degree to which community protects digital autonomy, ensures technology serves human flourishing, and governs tech democratically.

**Action-focus**: "Does community protect rights in digital realm and govern technology for human flourishing?"

#### 10.1 Digital Autonomy & Privacy

*Community protects personal data, prevents surveillance, limits algorithmic control.*

- **10.1.1 Privacy & Data Protection**
  - 10.1.1.a: Community protects privacy in digital spaces
  - 10.1.1.b: Community treats personal data as belonging to person (not extractable)
  - 10.1.1.c: Community prevents surveillance (corporate/government)

- **10.1.2 Algorithmic Autonomy**
  - 10.1.2.a: Community prevents invisible algorithmic manipulation
  - 10.1.2.b: Community ensures people understand how algorithms affect them
  - 10.1.2.c: Community makes algorithmic systems explainable and contestable

- **10.1.3 Digital Self-Determination**
  - 10.1.3.a: Community protects control over digital identity/presence
  - 10.1.3.b: Community allows digital anonymity when chosen
  - 10.1.3.c: Community prevents digital profiling/categorization without consent

#### 10.2 Human Flourishing Over Efficiency

*Community ensures technology serves humans, not replaces them.*

- **10.2.1 Preserving Human Judgment & Work**
  - 10.2.1.a: Community keeps technology in service role (doesn't replace humans)
  - 10.2.1.b: Community preserves human decision-making in important choices
  - 10.2.1.c: Community prevents dehumanizing efficiency gains

- **10.2.2 Embodied Connection**
  - 10.2.2.a: Community prioritizes face-to-face human connection
  - 10.2.2.b: Community uses digital tools to enable (not replace) human interaction
  - 10.2.2.c: Community preserves human labor and meaning

- **10.2.3 Protection from Digital Harm**
  - 10.2.3.a: Community prevents tools from dehumanizing relationships
  - 10.2.3.b: Community addresses tech addiction and psychological manipulation
  - 10.2.3.c: Community protects children from digital exploitation

#### 10.3 Democratic Technology Governance

*Community governs technology democratically, ensures universal access, limits monopoly power.*

- **10.3.1 Democratic Control**
  - 10.3.1.a: Community prevents tech companies from unilateral power over communication
  - 10.3.1.b: Community ensures algorithms are governed democratically (not corporately)
  - 10.3.1.c: Technology governance includes affected communities

- **10.3.2 Universal Access & Inclusion**
  - 10.3.2.a: Community treats digital access as right (not luxury); addresses digital divides
  - 10.3.2.b: Community ensures technology accessible to all (including disabled)
  - 10.3.2.c: Community prioritizes infrastructure for inclusion

- **10.3.3 Power Limitation**
  - 10.3.3.a: Community opposes tech monopolies and power concentration
  - 10.3.3.b: Community promotes open standards and interoperability
  - 10.3.3.c: Community ensures public technology infrastructure is democratically governed

---

## III. CONFIDENCE METADATA (20 dimensions)

For each DOMAIN CATEGORY, track how explicitly person described it:

**Grounding Level** (40-point scale):
- **40** = Explicitly defined with multiple examples, exceptions, and context
- **35** = Clearly described with 2–3 examples or detailed context
- **30** = Mentioned repeatedly; clear priority but not deeply explained
- **25** = Mentioned; implies importance but lacks detail
- **20** = Vaguely mentioned or implied indirectly
- **15** = Mentioned tangentially
- **10** = Not mentioned; AI inferred entirely

**Confidence Score** (0–100 scale):
- **97–100** = Explicit statement + multiple examples + clear intention
- **85–95** = Explicit statement + examples present
- **75–85** = Clear from context, multiple mentions
- **65–75** = Implied from narrative but not explicit
- **50–65** = Inferred from related values; not directly stated
- **<50** = Highly uncertain; requires clarification

### Metadata Structure

```
gl_cs = [
  [d_1_gl, d_1_cs],   // Domain 1: Agency grounding level & confidence score
  [d_2_gl, d_2_cs],   // Domain 2: Relationality
  [d_3_gl, d_3_cs],   // Domain 3: Security
  [d_4_gl, d_4_cs],   // Domain 4: Justice
  [d_5_gl, d_5_cs],   // Domain 5: Growth
  [d_6_gl, d_6_cs],   // Domain 6: Authenticity
  [d_7_gl, d_7_cs],   // Domain 7: Stewardship
  [d_8_gl, d_8_cs],   // Domain 8: Cooperation
  [d_9_gl, d_9_cs],   // Domain 9: Religion & Spirituality
  [d_10_gl, d_10_cs]  // Domain 10: Digital & Technological Ethics
]
```

---

## IV. CONFLICT RESOLUTION WEIGHTS (36 dimensions)

Measures community priority when actions create value trade-offs.

#### CR.1: Individual Freedom vs. Collective Harmony
- **0** = "Always prioritize individual freedom"
- **50** = "Balance individual and collective needs"
- **100** = "Collective harmony takes priority"

#### CR.2: Truth-Telling vs. Kindness
- **0** = "Tell truth always, even if painful"
- **50** = "Context determines; balance both"
- **100** = "Protect feelings; kind truth matters more"

#### CR.3: Proportional Justice vs. Restoration
- **0** = "Punishment must fit crime; justice is primary"
- **50** = "Both justice and redemption matter"
- **100** = "Restoration and change matter more than punishment"

#### CR.4: Equal Distribution vs. Merit-Based
- **0** = "Everyone gets equal share"
- **50** = "Both matter; differentiate by contribution"
- **100** = "Reward highest contributors most"

#### CR.5: Kin/Close vs. Universal Responsibility
- **0** = "Care for those near me; distant others are secondary"
- **50** = "Expand responsibility gradually"
- **100** = "All humans deserve equal care"

#### CR.6: Stability vs. Change
- **0** = "Maintain stability and safety"
- **50** = "Growth when beneficial; stability when needed"
- **100** = "Change and growth always priority"

#### CR.7: Tradition vs. Innovation
- **0** = "Preserve and honor heritage"
- **50** = "Respect tradition while allowing natural evolution"
- **100** = "Embrace new; discard old"

#### CR.8: Self-Interest vs. Collective Welfare
- **0** = "Individual interests come first"
- **50** = "Balance individual and collective"
- **100** = "Collective welfare always supersedes individual"

#### CR.9: Individual Responsibility vs. Systemic Causation
- **0** = "People responsible for own fate; systems matter little"
- **50** = "Both individual choice and systems matter significantly"
- **100** = "Systems determine outcome; individual responsibility is illusion"

#### CR.10: Self-Sacrifice vs. Self-Preservation
- **0** = "Complete self-sacrifice is noble"
- **50** = "Sometimes sacrifice is necessary; sometimes self-preservation is priority"
- **100** = "Never sacrifice yourself; preserve yourself first"

#### CR.11: Competition vs. Cooperation
- **0** = "Competition brings out best"
- **50** = "Both healthy when used appropriately"
- **100** = "Cooperation always; competition is destructive"

#### CR.12: In-Group Loyalty vs. Impartial Justice
- **0** = "Loyalty to group always"
- **50** = "Both loyalty and justice matter"
- **100** = "Justice always; loyalty is parochial"

#### CR.13: Question Authority vs. Accept Authority
- **0** = "Question all authority; maximize autonomy"
- **50** = "Respect legitimate authority; assert autonomy appropriately"
- **100** = "Accept authority; personal autonomy is subordinate"

#### CR.14: Certainty vs. Possibility
- **0** = "Certainty is paramount"
- **50** = "Both certainty and possibility valuable"
- **100** = "Possibility and freedom > certainty"

#### CR.15: Principle vs. Pragmatism
- **0** = "Principles always; compromise is betrayal"
- **50** = "Both matter; situational balance"
- **100** = "Pragmatic results matter most"

#### CR.16: Present vs. Future Security
- **0** = "Enjoy present now"
- **50** = "Balance present and future"
- **100** = "Secure future always; present waits"

#### CR.17: Universal Standards vs. Cultural Relativism
- **0** = "Universal standards apply everywhere"
- **50** = "Some universal principles; some cultural variation"
- **100** = "All values are culturally relative"

#### CR.18: Individual Rights vs. Collective Duty
- **0** = "Individual right to disobey unjust law"
- **50** = "Both matter; civil disobedience sometimes justified"
- **100** = "Obey all law; dissent is anarchy"

#### CR.19: Efficiency vs. Human Care
- **0** = "Optimize efficiency even if depersonalizing"
- **50** = "Efficiency important but not at cost of dignity"
- **100** = "Treating people well always > efficiency"

#### CR.20: Freedom vs. Structure
- **0** = "Autonomy matters more than structure/rules"
- **50** = "Balance autonomy with necessary structure"
- **100** = "Clear structure and rules reduce uncertainty"

#### CR.21: Inner Truth vs. Social Belonging
- **0** = "Inner truth matters most; accept loneliness"
- **50** = "Both matter; seek authentic community"
- **100** = "Social harmony matters more than truth-telling"

#### CR.22: Environmental Sustainability vs. Economic Prosperity
- **0** = "Environmental sustainability paramount"
- **50** = "Both matter; seek sustainable growth"
- **100** = "Economic prosperity now; environmental concerns are luxury"

#### CR.23: Cultural Preservation vs. Modernization
- **0** = "Preserve traditions; modernization threatens identity"
- **50** = "Heritage matters; cultures evolve naturally"
- **100** = "Modernization matters more; old traditions limit opportunity"

#### CR.24: Protective Authority vs. Respecting Autonomy
- **0** = "Protect those unable to protect themselves; autonomy is secondary"
- **50** = "Protect while respecting growing autonomy; balance both"
- **100** = "Respect autonomy even if risky; forced protection is violation"

#### CR.25: Accountability vs. Compassion
- **0** = "Full accountability; non-negotiable"
- **50** = "Both matter; compassion tempers judgment"
- **100** = "Compassion for struggle matters most"

#### CR.26: Emotional Openness vs. Self-Protection
- **0** = "Vulnerability and openness always"
- **50** = "Selectively vulnerable; trust some, protect from others"
- **100** = "Emotional protection essential"

#### CR.27: Digital Privacy vs. Convenience
- **0** = "Privacy non-negotiable"
- **50** = "Some data sharing for useful services acceptable"
- **100** = "Convenience matters more than privacy"

#### CR.28: Human Labor vs. Automation
- **0** = "Preserve human labor and meaning"
- **50** = "Automation acceptable; retrain and redistribute"
- **100** = "Maximum automation is best"

#### CR.29: Tech Innovation vs. Democratic Control
- **0** = "Democratic governance takes priority"
- **50** = "Balance innovation with public oversight"
- **100** = "Innovation freedom paramount; regulation stifles"

#### CR.30: Digital Privacy vs. Safety
- **0** = "Privacy non-negotiable; surveillance always wrong"
- **50** = "Proportional surveillance acceptable for real threats"
- **100** = "Surveillance justified for public safety"

#### CR.31: Digital Inclusion vs. Environmental Cost
- **0** = "Digital access justified regardless of cost"
- **50** = "Pursue inclusion with environmental consciousness"
- **100** = "Environmental cost unacceptable"

#### CR.32: Spiritual Authority vs. Democratic Governance
- **0** = "Religious authority should guide social order"
- **50** = "Religious values inform but don't override secular law"
- **100** = "Secular governance; religious authority has no role"

#### CR.33: Digital Privacy vs. Social Connection
- **0** = "Complete privacy; isolation if needed"
- **50** = "Balance privacy with meaningful connection"
- **100** = "Connection matters more than privacy"

#### CR.34: Digital vs. Embodied Experience
- **0** = "Digital experience equally authentic as physical"
- **50** = "Both digital and embodied can be authentic"
- **100** = "Only embodied life is authentic"

#### CR.35: Digital Privacy vs. Collective Transparency
- **0** = "Individual privacy paramount"
- **50** = "Both privacy and accountability matter"
- **100** = "Collective accountability matters more"

#### CR.36: Justice-Based vs. Cooperative Distribution
- **0** = "Justice-based distribution (historical redress)"
- **50** = "Both justice and cooperation inform distribution"
- **100** = "Cooperative distribution based on needs"

---

## V. CONTEXTUAL SHIFTS (40 dimensions, 4 contexts)

How community's value priorities shift based on context.

**Contexts**:
- **Work**: Professional/organizational contexts
- **Family**: Kinship relationships
- **Private**: Deep friendship, community and private environment
- **Crisis**: Emergency/survival scenarios

For each domain, shift ranges -50 to +50.

```
work_shifts = [WS_1, ... WS_10]
family_shifts = [FS_1, ... FS_10]
private_shifts = [PS_1, ... PS_10]
crisis_shifts = [CS_1, ... CS_10]
```

---

## VI. TOTAL VECTOR DIMENSIONALITY (v1.0)

```
CORE VALUES:       10 + 145 dimensions
├─ Domains: 10
└─ Items: 145     divided to 10 separate arrays

CONFLICT RESOLUTION: 36 dimensions
└─ CR weights focused on action trade-offs

CONTEXTUAL SHIFTS: 40 dimensions
└─ 4 contexts × 10 domains

METADATA: 20 dimensions
└─ Grounding + confidence per domain

TOTAL: 195 (145 + 10 + 40) vector dimensions + 36 agregations + 20 metadata

```

---

## VII. USAGE FOR ACTION ASSESSMENT

**For any proposed action, vectorized community values answer**:

1. **Does this action align with our freedom/agency values?** (Domain 1)
2. **Does this action strengthen relationships and care?** (Domain 2)
3. **Does this action maintain safety and order?** (Domain 3)
4. **Is this action fair and just?** (Domain 4)
5. **Does this action enable growth and redemption?** (Domain 5)
6. **Does this action allow authentic expression?** (Domain 6)
7. **Does this action protect vulnerable and steward future?** (Domain 7)
8. **Does this action cooperate and share equitably?** (Domain 8)
9. **Does this action respect spiritual practice?** (Domain 9)
10. **Does this action protect digital rights and serve humans?** (Domain 10)


---

## END TAXONOMY v1.0
