# ISR Issue Analyzer Protocol (v2, Firebase / NoSQL)

This protocol specifies how the AI **Issue Analyzer** processes a newly submitted ISR issue
and outputs **all starting parameters** needed for Relevance, Expertise, and ISR-score aggregation.

It is designed to work with **one companion document**:

- **`ISR-Issue-Analyzer-100-Examples.md`** — 100 calibrated anchor examples covering the full
  range of issue types. This is the primary prior source for all numeric parameters.

All data storage and queries are described in **Firebase / Firestore style** (NoSQL collections
and documents), not SQL.

---

## 0. Inputs and Outputs

### 0.1 Issue Analyzer Inputs

The Issue Analyzer LLM receives **only**:

- `issue_title`: short human-readable title
- `issue_description`: free-text description, including context, motivation, possible solutions
- `location_hint`: optional text and/or coordinates (if known)
- `submitter_metadata`: optional info (microcommunity id, city name, language, tags)

**Important:**
- The Analyzer **must not rely on a pre-provided category**. It must **infer the category**
  from the issue title + description using the taxonomy in Section 1.2.

### 0.2 Issue Analyzer Outputs (high-level)

The Analyzer returns a single JSON object with these groups:

1. **Issue classification** (category, scope, affected actors)
2. **Relevance parameterization** — `w_D, w_G, w_S, w_X`, demographic rules, geographic μ/σ
3. **Expertise parameterization** — `w_Education, w_Experience, w_Resources`, domain parameters, resource list
4. **ISR-score aggregation parameterization** — `w_Relevance, w_Expertise, w_Contribution`

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
| `community.governance.conflict_resolution` | community mediation, dispute resolution |
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

### 3.1 Component weights (w_Education, w_Experience, w_Resources)

Each in [0.0, 1.0], sum = 1.0.

#### 3.1.1 Pattern anchors (from `ISR-Issue-Analyzer-100-Examples.md`)

| Issue type | w_Education | w_Experience | w_Resources |
| :--- | :---: | :---: | :---: |
| Hands-on trades (locksmith, plumber, electrician) | 0.15–0.25 | 0.50–0.60 | 0.20–0.30 |
| Technical/policy (software, zoning, medicine) | 0.30–0.45 | 0.35–0.45 | 0.15–0.25 |
| Social/volunteer (food bank, mutual aid, events) | 0.10–0.20 | 0.40–0.50 | 0.30–0.40 |

#### 3.1.2 Output structure

```json
"expertise_weights": {
  "w_education":  <float>,
  "w_experience": <float>,
  "w_resources":  <float>
},
"expertise_weights_reasoning": "short explanation"
```

### 3.2 Domain direction & depth

These configure how expertise formulas behave for this issue.

| Parameter | Description |
| :--- | :--- |
| `expertise_domain` | short descriptor string |
| `contemporary_importance` ∈ [0, 1] | 0.2–0.4 = stable trade; 0.5–0.7 = moderate change; 0.7–0.9 = fast-changing |
| `recency_decay_rate` (per year) | 0.01–0.03 = slow; 0.05–0.08 = cutting-edge |
| `age_penalty_threshold` (years or null) | null = no age penalty; ~60 = very contemporary field |
| `CBC_adjustment_factor` [0.7–1.3] | <1.0 = narrow credentials; >1.0 = broader broadcast |

#### 3.2.1 Output structure

```json
"expertise_domain_parameters": {
  "expertise_domain":        "locksmith.security",
  "contemporary_importance": 0.2,
  "recency_decay_rate":      0.02,
  "age_penalty_threshold":   null,
  "CBC_adjustment_factor":   0.9,
  "domain_reasoning":        "short explanation"
}
```

### 3.3 Resource types list

Include 2–4 entries covering the issue's concrete resource needs:

| Resource type | Examples |
| :--- | :--- |
| `money_budget` | grants, municipal funds, donations |
| `physical_equipment` | tools, machinery, devices |
| `facilities_space` | rooms, offices, warehouses, event venues |
| `transportation` | vehicles, logistics |
| `professional_services` | legal, engineering, medical, accounting |
| `human_volunteers` | general volunteer time and effort |
| `social_networks` | influential contacts, media, community leaders |
| `digital_infrastructure` | servers, CI pipelines, apps, moderation tools |

#### 3.3.1 Output structure

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

  "expertise_weights": {
    "w_education":  0.20,
    "w_experience": 0.55,
    "w_resources":  0.25
  },
  "expertise_weights_reasoning": "...",

  "expertise_domain_parameters": {
    "expertise_domain":        "locksmith.security",
    "contemporary_importance": 0.2,
    "recency_decay_rate":      0.02,
    "age_penalty_threshold":   null,
    "CBC_adjustment_factor":   0.9,
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
    "reasoning_experience": "...",
    "reasoning_resources":  "..."
  }
}
```

---

## 6. Firestore / NoSQL Implementation Notes

### 6.1 Collections and documents

- `issues/{issueId}`: stores all Analyzer output fields flat plus the nested objects
- `users/{userId}`: `roles`, `building_id`, `user_location`, `education_records`, `experience_records`, `resources`
- `microcommunity_relevance_scores/{issueId_userId}`: D, G, S, X, and combined Relevance
- `microcommunity_expertise_scores/{issueId_userId}`: Education, Experience, Resources, and total Expertise

### 6.2 Relevance computation worker (Cloud Function sketch)

```javascript
const mu = issue.geographic_parameters.mu_distance_meters;
const sigma = issue.geographic_parameters.sigma_distance_meters;

const R = relevance_weights.w_demographic * D
        + relevance_weights.w_geographic  * G
        + relevance_weights.w_semantic    * S
        + relevance_weights.w_social      * X;
```

### 6.3 ISR-score aggregation formula

```javascript
const ISR = aggregation_weights.w_relevance    * R_normalized
          + aggregation_weights.w_expertise    * E_normalized
          + aggregation_weights.w_contribution * C_normalized;
```

Where each component is normalized to [0, 1] before aggregation.

---

## 7. How the Issue Analyzer Uses ISR-Issue-Analyzer-100-Examples.md

For every new issue, the Analyzer must:

1. **Find nearest examples** by:
   - Semantic similarity of the title + description to example titles
   - Matching or similar `issue_category` and `scope_type`

2. Use nearest examples as **priors** for all numeric parameters

3. **Adjust priors** based on specific details:
   - Slightly more local or more global scope
   - More or less technically complex
   - More or less safety-critical or rights-critical
   - Resource intensity, including **money** as a key resource

The 100-examples file is the **only external companion document** needed.
This protocol document is self-contained for all schema, taxonomy, and rule definitions.

---

## 8. Summary of Analyzer Responsibilities

For each new issue, the Analyzer must:

1. **Infer category and scope** from title + description using Section 1.2 taxonomy
2. Decide **Relevance weights** `w_D, w_G, w_S, w_X` with reasoning
3. Generate **Demographic rules** (simplified flat schema + optional tiered schema)
4. Select **Geo parameters** μ and σ with reasoning
5. Decide **Expertise weights** `w_Education, w_Experience, w_Resources` with reasoning
6. Configure **Expertise domain parameters** (domain, importance, decay, age threshold, CBC)
7. Produce **Resource needs list** (2–4 entries, include `money_budget` where applicable)
8. Decide **Aggregation weights** `w_Relevance, w_Expertise, w_Contribution` with reasoning
9. Output everything in a single structured JSON

This protocol and `ISR-Issue-Analyzer-100-Examples.md` together define the complete and
auditable process for initializing ISR parameters for each new issue.
