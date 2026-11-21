# ISR Issue Analyzer Protocol (v2, Firebase / NoSQL)

**Historical full-policy A/B baseline (2026-11-16; MVP candidate boundary amended 2026-11-21 below):** [PD-9](../specs/decisions/PD-9-multi-reference-derivation.md) now forms A from weighted direct D/G/S>=Theta (.15), then adds eligible relatives belowTheta as B regardless of score. A receives no X. B receives the full weighted tie only when its resulting R<=the supplying A direct score, otherwise baseline only; equality allowed, no partial cap or second hop. New-policy formation has no top100 cap. Core implemented; application integration pending. Older single-stage threshold/cap descriptions below describe historical behavior only.

**2026-11-21 reconciliation:** PD-9 still governs paired multi-reference arithmetic, actual-issue aspect vectors, maximum geography and the single Expertise floor. Repository main b8014ac contains mr1 logic; the new marked-carer/MVP formation policy is a separate implementation proposal, not current runtime or a deployment claim. [Exact flag, cutoff, version and backfill specification](../specs/tasks/X-eligibility-values-reconciliation.md).

**MVP candidate policy and X update, 2026-11-21:** retain hard D/G exclusions/top-300 direct selection, prune only for UB<Theta, and preserve paired multi-reference arithmetic. The new X adapter uses explicit outgoing child/dependent -> carer flags. Selection remains an approximation, not a global public cap; proposed carer lookup/direct recovery and policy dispatch are in the linked task. Values schema stays 1.0; these are separate scoring-policy identifiers. The Analyzer does not infer relationship eligibility or compute overall_grounding with the model.

This protocol specifies how the AI **Issue Analyzer** processes a newly submitted ISR issue
and outputs **all starting parameters** needed for Relevance, Expertise, and ISR-score aggregation.

It is designed to work with **one companion document**:

- **`ISR-Issue-Analyzer-100-Examples.md`** — 100 calibrated anchor examples covering the full
  range of issue types. This is the primary prior source for all numeric parameters.

All data storage and queries are described in **Firebase / Firestore style** (NoSQL collections
and documents), not SQL.

**Revision note (round 62).** Added Step 4A (context check at submission) and Step 4B (re-analysis after a change of
text, options, type or context adopted by the public). Parameters are derived from the issue type and context through
the table of typical issues; nobody, neither the topic starter nor the public, types a number. The Analyzer is a
rule-based assistant: it proposes, checks the context against the written rules and may refuse a type or context that is
not consistent with them, citing the rule or example it applied. After publication the issue belongs to its ad-hoc
public, which can change the text, options, type and context until voting opens.

---

## 0. Inputs and Outputs

### 0.1 Issue Analyzer Inputs

The Issue Analyzer LLM receives **only**:

- `issue_title`: short human-readable title
- `issue_description`: free-text description, including context, motivation, possible solutions
- `location_hint`: optional text and/or coordinates (if known)
- `submitter_metadata`: optional info (ad-hoc public / microcommunity id, city name, language, tags)

**Important:**
- The Analyzer **must not rely on a pre-provided category**. It must **infer the category**
  from the issue title + description using the taxonomy in Section 1.2.

For the context check (Step 4A) the Analyzer also receives:

- `context`: the facts the topic starter states about who is affected, where, and which local rules or owners matter
- `sources`: links or documents attached to the context (optional)
- `clarifications`: later answers of the topic starter to the assistant's questions

For a re-analysis after a change adopted by the public (Step 4B) it receives `current_type`, `parameters_version`, `change`
(kind: text, options, type or context; the old and the new content) and the updated issue text and context.

### 0.2 Issue Analyzer Outputs (high-level)

The Analyzer returns a single JSON object with these groups:

1. **Issue classification** (category, scope, affected actors)
2. **Relevance parameterization** — `w_D, w_G, w_S, w_X`, demographic rules, geographic μ/σ
3. **Expertise parameterization** — domain parameters; and the resource needs for the options' implementation plans (not part of Expertise)
4. **ISR-score aggregation parameterization** — `w_Relevance, w_Expertise, w_Contribution`
5. **Context check** (Step 4A) — the proposed type and the other types consistent with the rules, the scope and competence result (decision or proposal, addressee), the cautions to show to every member, and the rules applied
6. **Change record** (Step 4B) — the consistency result for a change proposed by a member, and, if the public adopts it, the type and parameters derived again with their version and notes

All numeric weights must be in [0.0, 1.0] and each weight group must sum to 1.0.

---

## 1. Step 1 – Issue Classification

### 1.1 Classification fields

The Analyzer must infer:

- `issue_category`: ISR taxonomy path — see **full taxonomy in Section 1.2**
- `scope_type`: one of
  - `unit` — individual flat, single household
  - `building` — one building or intimate complex
  - `street_segment` — part of a street
  - `neighborhood` — few blocks / microdistrict
  - `district` — large urban section
  - `city` — entire city or municipality
  - `region` — multi-city region
  - `global_digital` — geography almost irrelevant
- `affected_roles`: list of roles primarily affected:
  `tenant`, `homeowner`, `student`, `parent`, `grandparent`, `driver`, `cyclist`,
  `patient`, `elderly`, `disabled_person`, `gig_worker`, `remote_worker`, `developer`,
  `maintainer`, `volunteer`, `pet_owner`, `pedestrian`, `commuter`, `resident`,
  `business_owner`, `child`, `caregiver`, `teacher`, `government_official`,
  `religious_practitioner`, `minority_member`, `refugee`
- `affected_vulnerabilities`: flags for sensitive groups (empty array if none):
  `children`, `elderly`, `disabled`, `low_income`, `minority_group`, `chronically_ill`,
  `single_parent`, `refugee`
- `technicality_level`: `low` | `medium` | `high`
- `safety_sensitivity`: `low` | `medium` | `high`
- `digital_or_physical`: `physical` | `hybrid` | `digital_only`
- `legal_coverage`: `low` | `medium` | `high`
- `expertise_domain`: short descriptor used by Expertise functions
  (e.g. `locksmith.security`, `urban_planning.zoning_and_permits`,
  `software.open_source_product_direction`)

### 1.2 Full ISR Category Taxonomy

Use the most specific matching path. When two categories match, choose the one
closest to the **locus of action** (e.g. `building.maintenance.water` over
`infrastructure.utilities.water` for a basement leak in one house).

#### BUILDING & UNIT
| Category | Description |
| :--- | :--- |
| `building.security.locks` | entrance locks, keys, intercoms, access cards |
| `building.security.lighting` | stairwell, corridor, parking lot lighting inside building |
| `building.security.cameras` | CCTV, surveillance systems in building |
| `building.security.guest_access` | visitor management, concierge, intercom systems |
| `building.security.general` | general building security, gates, windows |
| `building.maintenance.water` | leaks, plumbing, pipes, flooding in building |
| `building.maintenance.heating` | radiators, boilers, building heating |
| `building.maintenance.elevator` | lifts, escalators inside building |
| `building.maintenance.electrical` | wiring, sockets, circuit breakers in building |
| `building.maintenance.roof` | roof leaks, insulation, gutters, flat roof |
| `building.maintenance.laundry` | shared laundry facilities |
| `building.maintenance.waste` | building trash bins, waste room, recycling |
| `building.maintenance.renovation` | common area renovations, painting |
| `building.maintenance.general` | other building common area maintenance |
| `building.noise.internal` | noise between neighbors, loud music, footsteps |
| `building.noise.construction` | construction noise within or adjacent to building |
| `building.health.mold` | dampness, mold growth in building |
| `building.health.pests` | rodents, insects, vermin in building |
| `building.health.smoking` | smoking in common areas |
| `building.health.air_quality` | ventilation, indoor air quality in building |
| `building.safety.fire` | fire alarms, extinguishers, evacuation routes |
| `building.safety.evacuation` | evacuation plans and drills |
| `building.safety.balcony` | balcony safety railings, structural safety |
| `building.safety.rooftop` | unsafe rooftop access |
| `building.transport.parking` | building parking lot allocation |
| `building.policy.pets` | pet ownership rules in building |
| `building.policy.storage` | storage rules and allocations |
| `building.policy.moving` | move-in/out rules and scheduling |
| `building.policy.renovation_rules` | rules for apartment renovation by tenant |
| `building.policy.short_term_rental` | Airbnb and short-term rental governance in building |

#### HOUSING POLICY
| Category | Description |
| :--- | :--- |
| `housing.policy.tenancy` | tenant rights, rent disputes, lease agreements |
| `housing.policy.social_housing` | public or subsidized housing applications, allocation |
| `housing.policy.homelessness` | housing support for homeless people |
| `housing.policy.overcrowding` | overcrowding issues in shared dwellings |
| `housing.policy.accessibility` | accessible housing for disabled people |

#### INFRASTRUCTURE — TRANSPORT
| Category | Description |
| :--- | :--- |
| `infrastructure.transport.streets` | potholes, sidewalks, road surface quality |
| `infrastructure.transport.transit` | bus, metro, tram, train public transport |
| `infrastructure.transport.bike` | cycling lanes, bike paths, velodrome |
| `infrastructure.transport.bike_parking` | bicycle parking availability and safety |
| `infrastructure.transport.parking_rules` | public parking regulations, permit zones |
| `infrastructure.transport.speed` | traffic speed limits, calming measures, humps |
| `infrastructure.transport.safety` | pedestrian crossings, traffic lights, road signage |
| `infrastructure.transport.car_free` | pedestrianization proposals, car-free zones |
| `infrastructure.transport.school_transport` | school buses, safe routes to school |
| `infrastructure.transport.accessibility` | disabled access on transport, ramps, kerbs |

#### INFRASTRUCTURE — UTILITIES
| Category | Description |
| :--- | :--- |
| `infrastructure.utilities.water` | public water supply, water quality, pressure |
| `infrastructure.utilities.electricity` | power grid, outages, smart meters |
| `infrastructure.utilities.gas` | gas supply, pipelines, safety |
| `infrastructure.utilities.internet` | broadband access, public WiFi infrastructure |
| `infrastructure.utilities.heating_network` | district heating supply network |
| `infrastructure.utilities.sewage` | drainage, sewage, wastewater |

#### INFRASTRUCTURE — PUBLIC SPACE
| Category | Description |
| :--- | :--- |
| `infrastructure.public.lighting` | street lighting, public lamp posts |
| `infrastructure.public.cleanliness` | litter, street cleaning, graffiti removal |
| `infrastructure.public.noise` | traffic noise, public spaces noise policy |
| `infrastructure.public.playground` | children's playgrounds, equipment safety |
| `infrastructure.public.bench_amenities` | benches, bus shelters, public furniture |
| `infrastructure.public.sanitation` | public toilets, hygiene facilities |
| `infrastructure.public.pedestrian_zone` | pedestrian zones, walkways, promenades |
| `infrastructure.public.accessibility` | barrier-free access in public spaces |

#### INFRASTRUCTURE — MAINTENANCE & SAFETY
| Category | Description |
| :--- | :--- |
| `infrastructure.maintenance.winter` | snow clearing, gritting, ice management |
| `infrastructure.maintenance.waste_schedule` | garbage collection schedule |
| `infrastructure.maintenance.road_repair` | scheduled road repair works |
| `infrastructure.safety.bridge_underpass` | structural safety of bridges, tunnels |
| `infrastructure.safety.construction_zone` | public safety near active construction |
| `infrastructure.safety.flood_risk` | flood risk management, drainage capacity |

#### ENVIRONMENT
| Category | Description |
| :--- | :--- |
| `environment.green_space` | parks, gardens, urban greenery management |
| `environment.trees` | tree protection, removal requests, new planting |
| `environment.pollution.air` | air quality, industrial pollution, vehicle emissions |
| `environment.pollution.noise` | chronic noise pollution (roads, factories, airports) |
| `environment.pollution.water` | river, lake, groundwater contamination |
| `environment.pollution.soil` | soil contamination, brownfield land |
| `environment.waste.recycling` | recycling collection points, sorting rules |
| `environment.waste.illegal_dumping` | fly-tipping, illegal waste disposal |
| `environment.climate.heatwave_adaptation` | heat emergency, cooling centers, shade |
| `environment.climate.flooding` | flood preparedness, retention basins, drainage |
| `environment.biodiversity` | local wildlife habitats, urban nature corridors |
| `environment.animals.stray` | stray cats, dogs management programs |
| `environment.animals.welfare` | animal welfare, cruelty prevention |

#### HEALTH
| Category | Description |
| :--- | :--- |
| `health.access.clinic` | local clinic, GP registration, wait times |
| `health.access.hospital` | hospital access, emergency services, ambulance |
| `health.access.medication_local` | pharmacy access, prescription coverage |
| `health.access.childcare` | pediatric health services, child wellness |
| `health.access.elderly_care` | geriatric care, nursing homes, home care |
| `health.access.disability_care` | disability health support, prosthetics, therapy |
| `health.access.prevention` | vaccination, screening, public health programs |
| `health.support.mental_local` | mental health services, counseling, crisis lines |
| `health.support.addiction_local` | substance abuse programs, rehab, harm reduction |
| `health.support.social_care` | social care services for vulnerable populations |
| `health.safety.pandemic_local` | infectious disease response, outbreak management |
| `health.safety.heatwave` | heat-related health emergency response |
| `health.safety.food_safety` | restaurant inspections, food standards enforcement |
| `health.emergency.preparedness` | emergency health preparedness, first aid |

#### EDUCATION
| Category | Description |
| :--- | :--- |
| `education.school.schedule` | school hours, term calendar, holiday policy |
| `education.school.cafeteria` | school meals, nutrition quality |
| `education.school.safety` | school security, anti-bullying |
| `education.school.transport` | school buses, safe routes to school |
| `education.school.after_school` | after-school programs, tutoring, clubs |
| `education.school.digital_comm` | school-parent digital communication platforms |
| `education.school.policy_grading` | grading policies, standards, exam procedures |
| `education.school.scholarships` | financial aid, grants for students |
| `education.school.facilities` | classrooms, labs, sports halls, equipment |
| `education.higher.curriculum` | university curriculum, course content changes |
| `education.higher.exams` | exam policies, academic integrity, scheduling |
| `education.higher.student_housing` | student accommodation policies |
| `education.vocational.center_local` | vocational training centers, trade schools |
| `education.work_based.internships` | internship programs, apprenticeship, work placements |
| `education.lifelong.adult_classes` | adult education, evening classes, community learning |
| `education.digital.digital_literacy` | digital skills training for all ages |

#### SOCIAL LIFE & COMMUNITY SERVICES
| Category | Description |
| :--- | :--- |
| `social.event.community` | community gatherings, street parties, neighborhood socials |
| `social.event.sports` | local sports events, leagues, tournaments |
| `social.event.culture_kids` | children's cultural events, workshops, crafts |
| `social.event.market` | local markets, fairs, pop-up stalls |
| `social.event.city_festival_governance` | city festival planning, permits, volunteer coordination |
| `social.culture.community_group` | hobby groups, clubs, associations (chess, dance, music) |
| `social.culture.heritage` | cultural heritage preservation, local history |
| `social.culture.public_art` | murals, sculptures, street art commissioning |
| `social.culture.library` | public library services, collections, access |
| `social.services.food_bank_local` | food banks, meal programs, pantries |
| `social.services.mutual_aid` | mutual aid networks, community sharing |
| `social.services.neighborhood_support` | neighbor help networks, community care |
| `social.services.shelter` | emergency shelter, overnight accommodation |
| `social.services.refugee_support` | refugee and migrant integration support |
| `social.charity.volunteering` | volunteer program organization and coordination |
| `social.charity.local_service` | local charity and welfare services delivery |
| `social.charity.online_campaign` | community crowdfunding, online fundraising drives |
| `social.youth.club` | youth clubs, after-school social activities |
| `social.youth.sports_safety` | youth sports safety, coaching standards |
| `social.youth.library` | youth library access, reading programs |
| `social.youth.mentorship` | mentorship and peer support for young people |
| `social.family.emergency` | family crisis support, emergency childcare |
| `social.inclusion.lgbtq_support` | LGBTQ+ community inclusion programs |
| `social.inclusion.disability_inclusion` | disability rights, inclusion, adaptation |
| `social.inclusion.ethnic_minority_support` | minority community support and rights |
| `social.religion.local_practice` | religious community activities, prayer spaces |
| `social.safety.neighborhood_watch` | neighborhood watch programs, community safety |
| `social.safety.domestic_violence_support` | domestic violence awareness and support |
| `social.elderly.social_isolation` | combating elderly isolation, companionship programs |
| `social.elderly.mobility_support` | elderly mobility assistance, transport for seniors |

#### COMMUNITY GOVERNANCE & DIGITAL COORDINATION
| Category | Description |
| :--- | :--- |
| `community.governance.zoning` | land use planning, zoning permissions, building permits |
| `community.governance.budget_city` | participatory budgeting, community spending proposals |
| `community.governance.elections_local` | local elections, voter registration, polling logistics |
| `community.governance.policy_debate` | community policy discussions, consultations |
| `community.governance.political_forum` | political discussions, candidate forums, debates |
| `community.governance.platform_rules` | community app governance rules, moderation policy |
| `community.governance.neighborhood_app` | local digital community platforms, app features |
| `community.governance.open_source` | open source software projects, contribution governance |
| `community.governance.open_source_roadmap` | OSS roadmap decisions, feature voting |
| `community.governance.digital_privacy` | data protection policy, privacy rights, GDPR |
| `community.governance.religious_visibility` | religious symbols in public space, secularism debate |
| `community.governance.local_forum` | community forum organization, assembly scheduling |
| `community.governance.petition` | community petitions to authorities |
| `community.governance.conflict_resolution` | community mediation, dispute resolution; dispute about a recorded action (Action protocol, Section 7.5) |
| `community.work.gig_local` | gig economy working conditions, platform worker rights |
| `community.work.remote_policy` | remote work infrastructure and policy |
| `community.work.offline_schedule` | shift scheduling, working hours policy |
| `community.work.unemployment` | local employment programs, job creation |
| `community.work.business_support` | local small business support, permits, grants |

#### ECONOMY & LOCAL BUSINESS
| Category | Description |
| :--- | :--- |
| `economy.local_business.support` | small business support programs |
| `economy.local_business.market_access` | market stall permits, street vending licenses |
| `economy.employment.job_placement` | job centers, employment referral services |
| `economy.employment.apprenticeship` | apprenticeship programs, vocational pathways |
| `economy.finance.microloan` | community lending, microfinance initiatives |
| `economy.tourism.local` | local tourism management, visitor impact |

#### SAFETY & SECURITY
| Category | Description |
| :--- | :--- |
| `safety.crime.vandalism` | graffiti, property damage, tagging |
| `safety.crime.theft` | neighborhood theft, burglary prevention |
| `safety.crime.drug_activity` | drug dealing, substance-related public safety |
| `safety.digital.local_fraud` | online scams, phishing, digital fraud awareness |
| `safety.digital.data_privacy` | personal data protection, identity theft |
| `safety.emergency.evacuation_plan` | community evacuation planning |
| `safety.emergency.disaster_preparedness` | community disaster readiness, emergency kits |

### 1.3 Classification method

1. Use `ISR-Issue-Analyzer-100-Examples.md` to **map similar descriptions** to existing categories.
2. When no exact match exists, generalize to the nearest parent path.
3. Choose the **more specific** category when two paths match.

---

## 2. Step 2 – Relevance Parameterization

### 2.1 Relevance weights (w_D, w_G, w_S, w_X)

Assign weights for the 4 Relevance components. Each in [0.0, 1.0], sum = 1.0.

| Dimension | Meaning |
| :--- | :--- |
| `w_D` (Demographic) | Whether a person can be affected by role, age, health, or membership |
| `w_G` (Geographic) | Being inside a certain area is required or very important |
| `w_S` (Semantic) | Usage, interest, or expertise in a topic matters regardless of distance |
| `w_X` (Social graph) | People are affected because loved ones or close contacts are affected |

#### 2.1.1 Pattern anchors (from `ISR-Issue-Analyzer-100-Examples.md`)

| Issue type | w_D | w_G | w_S | w_X |
| :--- | :---: | :---: | :---: | :---: |
| Building-level physical (lock, heating, water) | 0.25–0.35 | 0.45–0.55 | 0.05–0.10 | 0.10–0.20 |
| Street/neighborhood infrastructure | 0.15–0.25 | 0.50–0.60 | 0.05–0.15 | 0.05–0.15 |
| Interest/hobby/cultural (club, concert, chess) | 0.10–0.15 | 0.15–0.25 | 0.45–0.60 | 0.10–0.15 |
| Demographic-specific (seniors, school meals, parents) | 0.40–0.55 | 0.20–0.35 | 0.05–0.15 | 0.05–0.15 |
| Digital/remote/open-source | 0.10–0.20 | 0.05–0.20 | 0.40–0.55 | 0.10–0.20 |
| Social services (food bank, mutual aid, shelter) | 0.15–0.25 | 0.35–0.50 | 0.20–0.35 | 0.05–0.15 |

#### 2.1.2 Translation rules
- **Primary**: ~0.35–0.60
- **Secondary**: ~0.15–0.30
- **Minor**: ~0.05–0.15
- **Irrelevant**: 0.0–0.05

#### 2.1.3 Output structure

```json
"relevance_weights": {
  "w_demographic": <float>,
  "w_geographic":  <float>,
  "w_semantic":    <float>,
  "w_social":      <float>
},
"relevance_weights_reasoning": "short explanation"
```

### 2.2 Demographic rules for D

Demographic rules define **who can have non-zero D**.

#### 2.2.1 Simplified backend schema (current implementation)

The backend uses this flat JSON filter object, evaluated per user:

```json
"demographic_rules": {
  "minAge":           <number or null>,
  "maxAge":           <number or null>,
  "employmentStatus": "any" | "employed" | "unemployed" | "student" | "retired",
  "familyStatus":     "any" | "parent" | "grandparent",
  "features":         [ array of keyword strings, e.g. "car", "pets", "animals", "bike" ]
}
```

Evaluation logic:
- Age: hard exclude if outside [minAge, maxAge]
- Employment/family: hard exclude if mismatch and status ≠ "any"
- Features: hard exclude if none of the user's features match any listed keyword

D score = `1.0` if user passes all checks, `0.0` if excluded.

#### 2.2.2 Tiered schema (abstract / advanced)

For more nuanced scoring, the Analyzer may also produce a tiered schema:

```json
"demographic_rules_tiered": {
  "tiers": [
    {
      "tier_id": "D_1_0", "score": 1.0,
      "conditions": [
        { "field": "roles", "op": "array_contains", "value": "tenant" },
        { "field": "building_id", "op": "==", "value_source": "issue.building_id" }
      ],
      "explanation": "Full D for tenants living in the affected building."
    },
    {
      "tier_id": "D_0_5", "score": 0.5,
      "conditions": [
        { "field": "roles", "op": "array_contains", "value": "family_member" }
      ],
      "explanation": "Reduced D for close relatives of tenants."
    }
  ]
}
```

The scoring function uses the **max matching tier score**.

### 2.3 Geographic parameters for G (μ and σ)

Geographic relevance uses **Gaussian decay** as a function of distance from the issue locus:

```
G(d) = 1.0                                    if d ≤ μ
G(d) = exp(-(d-μ)² / (2σ²))                  if d > μ
G(d) ≈ 0.0                                    if d > μ + 3σ  (hard cutoff)
```

#### 2.3.1 Typical parameter ranges

| Scope type | μ (meters) | σ (meters) |
| :--- | :---: | :---: |
| `unit` / `building` | 30–80 | 20–60 |
| `street_segment` | 100–250 | 80–200 |
| `neighborhood` | 400–1000 | 300–800 |
| `district` | 1500–3000 | 1200–2500 |
| `city` / `region` | 3000–10000 | 2500–8000 |
| `global_digital` | ≥ 50000 | ≥ 40000 |

#### 2.3.2 Output structure

```json
"geographic_parameters": {
  "mu_distance_meters":    <float>,
  "sigma_distance_meters": <float>,
  "geo_reasoning":         "short explanation"
}
```

---

## 3. Step 3 – Expertise Parameterization

### 3.1 Domain direction & depth

These configure how expertise formulas behave for this issue.

| Parameter | Description |
| :--- | :--- |
| `expertise_domain` | short descriptor string |
| `recency_decay_rate` (per year) | Future extension; not applied by current scoring |

#### 3.1.1 Output structure

```json
"expertise_domain_parameters": {
  "expertise_domain":        "locksmith.security",
  "recency_decay_rate":      0.02,
  "domain_reasoning":        "short explanation"
}
```

### 3.2 Resource needs for implementation plans (not part of Expertise)

These entries prepare the resources part of the implementation plan of each option: first the money (cost and funding source), then the resources needed for realization. They give no weight and do not enter Expertise. Include 2–4 entries covering the issue's concrete resource needs:

| Resource type | Examples |
| :--- | :--- |
| `money_budget` | grants, municipal funds, donations (comes first in the plan: cost and funding source) |
| `physical_equipment` | tools, machinery, devices |
| `facilities_space` | rooms, offices, warehouses, event venues |
| `transportation` | vehicles, logistics |
| `professional_services` | legal, engineering, medical, accounting |
| `human_volunteers` | general volunteer time and effort |
| `social_networks` | influential contacts, media, community leaders |
| `digital_infrastructure` | servers, CI pipelines, apps, moderation tools |

#### 3.2.1 Output structure

```json
"resources_needed": [
  {
    "resource_type":    "money_budget",
    "importance_level": "high",
    "explanation":      "Funds needed to pay contractor and buy replacement lock."
  }
]
```

---

## 4. Step 4 – ISR-Score Aggregation Weights (w_R, w_E, w_C)

Weights for aggregating Relevance, Expertise, and Contribution scores into the
final ISR vote weight. Each in [0.0, 1.0], sum = 1.0.

### 4.1 Pattern anchors (from `ISR-Issue-Analyzer-100-Examples.md`)

| Decision type | w_Relevance | w_Expertise | w_Contribution |
| :--- | :---: | :---: | :---: |
| Local direct-experience (heating, noise, access lock) | 0.65–0.75 | 0.10–0.20 | 0.15–0.25 |
| Technical/safety/policy (zoning, infrastructure safety, software) | 0.40–0.55 | 0.25–0.40 | 0.15–0.25 |
| Governance/coordination (platform rules, budgeting, mutual aid) | 0.45–0.60 | 0.15–0.30 | 0.20–0.35 |

**No weight is ever zero, and none alone carries the vote** (paper condition L1): the derived weights stay inside the range of the pattern anchor of the chosen type, so the record keeps a typical weight of about 0.15 to 0.35 and is never the sole basis of influence.

**Dispute about a recorded action.** Category `community.governance.conflict_resolution` with a disputed action: use the governance and coordination row. The context must name the disputed action; relevance ties (X) weigh the actor and the people the action affected. The options always include "no change"; no option may delete the action (Action protocol, Sections 7.3 and 7.5).

### 4.2 Output structure

```json
"aggregation_weights": {
  "w_relevance":    <float>,
  "w_expertise":    <float>,
  "w_contribution": <float>
},
"aggregation_reasoning": "short explanation referencing decision type"
```

---

## 4A. Step 4A – Context check at submission

**Purpose.** The table of typical issues (`ISR-Issue-Analyzer-100-Examples.md` is its first version; the table can contain
as many issue types as needed) and the written protocol rules define which issue types exist and which parameters belong
to each. Rules and the table are protocol-level decisions in which all users take part. The Analyzer applies them: it
proposes an issue type, derives the parameters from the table for that type and the context, checks that the context is
complete and consistent with the rules (scope and competence), and tells the topic starter what is missing. **Nobody types
a number.** The assistant is a rule-based gatekeeper. It does not judge the merits of the issue. It may refuse a type or
context that is not consistent with the rules, and it must say which rule or example it applied.

**Reference derivation.** Apply PD-9: rank reference similarities, require s>=.30, extend while each adjacent score gap is<.05, and trigger internal context review when the full raw chain contains more than three references. These are versioned experimental settings, not probabilities. After context passes, record a bounded reviewed compatible reference set J with inclusion/exclusion evidence, then normalize its similarities and compute the numeric blends, paired member scores and max geography exactly as PD-9 specifies. No fixed-five requirement or separate same-type table is required. Categories explain references; they are not probabilities or freely adjustable numeric profiles.

**Procedure.**

1. Select the full reference chain (Section7/PD-9). Show titles/categories, scores and actual-context matches. Every chain needs context validation. More than three references means context_review_required internally; a clear issue may pass unchanged. Missing facts or incompatible context can return needs_clarification, while library/service failures have their own outcomes. Suggest clearer wording or splitting only when supported; the user chooses any reformulation or initial planning issue.
2. Derive parameters using normalized reference weights. Instantiate categorical rules and aspect texts from actual context; never average ages, ownership or eligibility labels. Preserve paired weights/results and compute member X from affected people, as PD-9 specifies.
3. Scope and competence check. Does the context show that a local rule gives the decision to an authority, an owner or another
   body (a public street, a school, a utility, a private courtyard)? Such facts are tied to the location and to the local law and
   are part of the **context**. If the context does not say, the assistant asks, advises the topic starter to check public
   information (a short search is enough) and reminds him to attach a source. The assistant does not use its own legal
   knowledge as a rule: it uses what the context states and the protocol rules (for example: stake is not ownership, residents
   of a street are not its exclusive owners).
4. If a local rule reserves the decision for an authority, the outcome kind is `proposal` and the addressee is that authority.
   Select compatible proposal references and recheck context; do not invent a 2000m radius from an illustrative example. The actual affected workers/owners/staff are evaluated as people by the same formulas, not as representatives.
5. If the topic starter disagrees with the result, he clarifies the context or picks another type from those the assistant lists
   as consistent. He cannot edit a number. A significant deviation from the listed types needs a significant reformulation of the
   text and the context; the assistant returns a request that only renames the type. The assistant keeps asking until the context
   is consistent or the topic starter withdraws; a limit on the number of rounds is an implementation choice.
6. Cautions do not block publication. If the context states a local rule or an ownership without a source, or the assistant
   thinks that valuable context is missing, every member sees a caution on the issue page. Members who know the circumstances
   may judge it unimportant.
7. Result: `pass` (publish with the type, the derived parameters and the notes), `needs_clarification`, or `not_consistent`
   (no consistent type was found; the topic starter must reformulate the issue).

**Limits on the assistant.** It must apply the recorded reference equations without invented numeric overrides, must not judge the merits of the issue, and must not
decide who is a member. It may only propose, ask, caution, or refuse a type or context that is not consistent with the rules,
citing the rule or example. Every run is logged.

**Dispute about a recorded action.** If the issue disputes a recorded action and the context does not name it (`disputed_action_id`), the result is `needs_clarification`. The assistant does not judge whether the action was misread; that is the question the public decides.

**Output (added to the combined schema in Section 5.1).**

```json
"context_check": {
  "type": {
    "proposed": "street.traffic_limitation",
    "consistent_alternatives": ["street.traffic_limitation.proposal_to_authority"],
    "library_version": "1.0",
    "reference_ids": [17, 44, 63],
    "selection_version": "mr1-context-review-1",
    "similarities": [0.57, 0.55, 0.51],
    "alpha": [0.3496932515, 0.3374233129, 0.3128834356]
  },
  "scope": {
    "outcome_kind": "proposal",
    "addressee": "city transport department",
    "basis": "Local rule stated in the context",
    "source_attached": true
  },
  "cautions": [
    { "code": "missing_source", "text": "No source is attached for the claim that the street is owned by the housing association." }
  ],
  "rules_applied": ["R-scope-01", "ex-023"],
  "result": "pass"
}
```

**Context notes.** Each caution and each reformulation is stored with the issue as a context note and shown wherever the
parameters are shown.

**Logging.** Every run is logged with its inputs, outputs, model identifier, prompt version, library version and any seed or
temperature setting, as for all Analyzer runs.

---

## 4B. Step 4B – Re-analysis after a change adopted by the public

**What members can propose.** Until voting opens, any member can propose a change of (a) the text, (b) the options, (c) the issue
type, among the types the assistant lists as consistent with the rules, or (d) the context. A member cannot propose a number, a
radius, a weight or a scope setting. A scope setting changes only by reformulating the issue, that is, by changing the text or the
context.

**Consistency check.** A proposed change of type or context first goes to the assistant, which applies the same check as in
Step 4A (steps 3 to 7) to the new type or context. If the change is not consistent with the rules, the proposal is returned to the
proposer with the rule or example applied and what to clarify, and it cannot be put to a vote. The proposer may clarify and
propose again. A change that only renames the type without reformulating the context is returned.

**Vote.** A proposal that passed the check is voted on by the public: the current ISR weights and a simple majority. Open
proposals lapse when voting opens, and everything is frozen until the vote closes.

**What the assistant does after an adopted change.**

1. It derives the type and the parameters again from the table for the new context (Steps 1 to 4A).
2. It attaches change notes: what changed, who proposed it, and the vote.
3. It validates the schema: each aggregation weight in (0, 1) and each relevance weight in [0, 1], each weight group summing to 1.
4. The system then recomputes relevance and updates the list of members (`ISR-Relevance-Implementation.md`, Part 10).

**Output.** `parameters_version` (previous + 1), the new type and parameters, the changed fields with old and new values, the
change notes and the rules applied.

---

## 5. Combined Output JSON Schema

The Issue Analyzer produces a single JSON object. All fields must be present:

```json
{
  "classification": {
    "issue_category":            "building.security.locks",
    "scope_type":                "building",
    "affected_roles":            ["tenant", "family_member"],
    "affected_vulnerabilities":  [],
    "technicality_level":        "medium",
    "safety_sensitivity":        "medium",
    "digital_or_physical":       "physical",
    "expertise_domain":          "locksmith.security",
    "classification_reasoning":  "..."
  },

  "relevance_weights": {
    "w_demographic": 0.30,
    "w_geographic":  0.50,
    "w_semantic":    0.05,
    "w_social":      0.15
  },
  "relevance_weights_reasoning": "...",

  "geographic_parameters": {
    "mu_distance_meters":    40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning":         "..."
  },

  "demographic_rules": {
    "minAge":           null,
    "maxAge":           null,
    "employmentStatus": "any",
    "familyStatus":     "any",
    "features":         []
  },

  "expertise_domain_parameters": {
    "expertise_domain":        "locksmith.security",
    "recency_decay_rate":      0.02,
    "domain_reasoning":        "..."
  },

  "resources_needed": [
    {
      "resource_type":    "physical_equipment",
      "importance_level": "high",
      "explanation":      "Locksmith tools and security-grade replacement hardware."
    },
    {
      "resource_type":    "money_budget",
      "importance_level": "medium",
      "explanation":      "Funds to cover locksmith services."
    }
  ],

  "aggregation_weights": {
    "w_relevance":    0.70,
    "w_expertise":    0.10,
    "w_contribution": 0.20
  },
  "aggregation_reasoning": "...",

  "category":          "building.security.locks",
  "mu":                40.0,
  "sigma":             30.0,
  "expertise_depth":   "Vocational Training",
  "expertise_domain":  "locksmith.security",
  "demographics":      { "minAge": null, "maxAge": null, "employmentStatus": "any", "familyStatus": "any", "features": [] },
  "relevance_reasoning":   "...",
  "aggregation_reasoning": "...",
  "relevance_explanations": {
    "reasoning_D": "...",
    "reasoning_G": "...",
    "reasoning_S": "...",
    "reasoning_X": "..."
  },
  "isr_explanations": {
    "reasoning_R": "...",
    "reasoning_E": "...",
    "reasoning_C": "..."
  },
  "expertise_explanations": {
    "reasoning_education":  "...",
    "reasoning_experience": "..."
  }
}
```

### 5.1 Additional fields (versions, context check, changes)

Three top-level fields are added to the combined output:

```json
"parameters_version": 1,
"context_check": { "...": "see Step 4A" },
"change_record": null
```

`change_record` is `null` at submission and is filled only by Step 4B:
`{ "change_id": "...", "kind": "context", "from": "...", "to": "...", "rules_applied": ["..."], "notes": ["..."] }`.

---

## 6. Storage and computation contract

Use the actual app paths issue_drafts, analyzer_logs, issue_vectors, users.skills, user_vectors and microcommunity_members. Version old issues separately; do not migrate their scores implicitly. PD-9 sections5-8 define the one-public R/E/ISR pipeline, precision and immutable reference/aspect/member provenance. Keep whole-issue duplicate vectors distinct from scoring aspect vectors. Check, Create, Join, caches and the independent checker must reproduce the same parameters and scores.

The single-reference JSON in section5 remains a legacy compatibility projection, not a sufficient mr1 schema. The new draft binds reference IDs/scores/alpha, selection/formula/library/model/template versions, actual-context source hash, per-reference demographic rules, actual-issue aspect texts/vectors and education-category CBC table/scoring version, common location/max geography, direct-affectedness rule/version and affected-person outgoing relation provenance. Member data must reproduce per-reference D/S/X and education/work contributions and effective displayed components. Context outcomes/cautions attach to the issue. Step4B changes/governance remain a separate implementation task.

## 7. How the Issue Analyzer Uses the reference library

PD-9 is the normative mathematical definition. Selection uses one recorded similarity metric/text/context/vector version, the consecutive .30/.05 raw chain and >3 internal context review. Review may accept an unchanged issue or ask concrete questions/suggest splitting based on actual context. Retain raw-chain evidence and reviewed set J separately, normalize alpha over J, and never truncate to three or automatically blend every raw match. Do not compare scores from different metrics or silently choose only the first three. One-reference input reduces to its scoring specification; no extra type-group calibration is required merely to get five examples.

Blend numeric relevance and ISR weight groups with alpha. Use the widest compatible mu/sigma around the actual issue location. Derive D/S/E/X for actual people from context-instantiated rules, actual-issue aspect vectors and affected-person relations. Apply one age floor after combined education, then normalize combined R/E over one final public. Scope/authority conflicts require clarification; model/service failures are distinct from user inconsistency. External documents are context data, not model instructions.

Raw references and every derived value remain auditable; no free LLM weight adjustment after the deterministic blend. Pattern/scope tables are reference guidance; an apparent conflict with these or categorical authority rules requires a recorded resolution rather than silently clipping the blend.

## 8. Summary of Analyzer Responsibilities

For each new issue, the Analyzer must:

1. **Infer category and scope** from title + description using Section 1.2 taxonomy
2. Decide **Relevance weights** `w_D, w_G, w_S, w_X` with reasoning
3. Generate **Demographic rules** (simplified flat schema + optional tiered schema)
4. Select **Geo parameters** μ and σ with reasoning
5. Configure **Expertise domain parameters** (domain and decay metadata; CBC is fixed by education category)
6. Produce **Resource needs list** for the options' implementation plans (2–4 entries, money first; not scored as Expertise)
7. Decide **Aggregation weights** `w_Relevance, w_Expertise, w_Contribution` with reasoning
8. Output everything in a single structured JSON
9. At submission, propose the type, derive the parameters, check scope and competence in the context, and produce the cautions (Step 4A)
10. For a change proposed by a member, check consistency with the rules; after a change adopted by the public, derive the type and parameters again and produce the change record (Step 4B)

The Analyzer does **not**: accept a number typed by anyone, decide membership, judge the merits of an issue, or decide whether a change is good.
It may refuse a type or context that is not consistent with the written rules, citing the rule or example. Adoption of a change
belongs to the issue's ad-hoc public.

This protocol and `ISR-Issue-Analyzer-100-Examples.md` together define the complete and
auditable process for initializing ISR parameters for each new issue.


CBC policy (2026-11-21): CBC depends only on education category and the standard table; no Analyzer adjustment parameter.
