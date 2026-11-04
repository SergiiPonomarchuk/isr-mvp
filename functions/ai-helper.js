const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Checks if the Gemini API Key is configured.
 */
function hasGeminiKey() {
  return !!geminiApiKey;
}

/**
 * Generates a 768-dimensional normalized embedding vector for the given text.
 * Falls back to a random mock vector if the API call fails or key is missing.
 */
async function vectorizeText(text) {
  let issueVector = null;

  if (hasGeminiKey()) {
    try {
      const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const embedResult = await embedModel.embedContent(text);
      issueVector = embedResult.embedding.values;
    } catch (err) {
      console.error("Gemini embedding failed, using a fallback mock vector:", err);
    }
  }

  // If no embedding was generated, create a mock 768-dimensional vector
  if (!issueVector) {
    issueVector = new Array(768).fill(0).map(() => Math.random() * 2 - 1);
    // Normalize mock vector
    const mag = Math.sqrt(issueVector.reduce((sum, val) => sum + val * val, 0));
    issueVector = issueVector.map((val) => val / mag);
  }

  return issueVector;
}

// =============================================================================
// UNIFIED ISR ISSUE ANALYZER PROMPT
// Reference documents: ISR-Issue-Analyzer-Protocol-v1.md and
// ISR-Issue-Analyzer-100-Examples.md
// =============================================================================

/**
 * Builds the unified ISR Issue Analyzer prompt used by both
 * suggestIssueParams and checkIssueParams.
 *
 * @param {string} title - Issue title (may be empty string for early analysis)
 * @param {string} description - Issue description
 * @returns {string} The complete prompt text
 */
function buildIssueAnalyzerPrompt(title, description, clarification) {
  return `
You are the ISR Issue Analyzer for the ISR-vote civic governance platform.

Your two authoritative reference documents are:
1. ISR-Issue-Analyzer-Protocol-v1.md — defines the schema and scoring rules
2. ISR-Issue-Analyzer-100-Examples.md — 100 calibrated anchor examples (your primary prior)

When analyzing a new issue, find the closest examples from the 100-examples file
and use their parameters as a starting prior, then adjust based on the specific details
of this new issue.

Issue to analyze:
  Title: "${title || "(no title yet)"}"
  Description: "${description}"${clarification ? `
  Clarification of the context by the topic starter: "${clarification}"` : ""}

---

Return ONLY a valid JSON object with ALL of the following fields:

────────────────────────────────────────────────────────────────
A. CLASSIFICATION
────────────────────────────────────────────────────────────────
"classification": {
  "issue_category":   ISR taxonomy path — choose the most specific matching path from the FULL ISR TAXONOMY listed below,
  "scope_type":       one of: unit | building | street_segment | neighborhood | district | city | region | global_digital,
  "affected_roles":   array of roles from: tenant, homeowner, student, parent, grandparent, driver, cyclist,
                      patient, elderly, disabled_person, gig_worker, remote_worker, developer, maintainer,
                      volunteer, pet_owner, pedestrian, commuter, resident, business_owner, child, caregiver,
                      teacher, government_official, religious_practitioner, minority_member, refugee,
  "affected_vulnerabilities": array (empty if none) from: children, elderly, disabled, low_income,
                              minority_group, chronically_ill, single_parent, refugee,
  "technicality_level":  low | medium | high,
  "safety_sensitivity":  low | medium | high,
  "digital_or_physical": physical | hybrid | digital_only,
  "expertise_domain":    short descriptor, e.g. locksmith.security, urban_planning.zoning_and_permits,
                         software.open_source_product_direction, social_work.community_services,
  "classification_reasoning": 1–2 sentences explaining the choice
}

────────────────────────────────────────────────────────────────
B. RELEVANCE WEIGHTS (must sum to exactly 1.0)
────────────────────────────────────────────────────────────────
"relevance_weights": { "w_demographic": <float>, "w_geographic": <float>, "w_semantic": <float>, "w_social": <float> },
"relevance_weights_reasoning": "1–2 sentences",

Pattern anchors from ISR-Issue-Analyzer-100-Examples.md:
- Building-level physical issues (lock, heating, water leak): w_G ≈ 0.45–0.55, w_D ≈ 0.25–0.35, w_S ≈ 0.05–0.10, w_X ≈ 0.10–0.20
- Street/neighborhood infrastructure (pothole, lighting, parking): w_G ≈ 0.50–0.60, w_D ≈ 0.15–0.25, w_S ≈ 0.05–0.15, w_X ≈ 0.05–0.15
- Interest/hobby/cultural (chess club, concerts, sports): w_S ≈ 0.45–0.60, w_G ≈ 0.15–0.25, w_D ≈ 0.10–0.15, w_X ≈ 0.10–0.15
- Demographic-specific (senior activities, school meals, parent issues): w_D ≈ 0.40–0.55, w_G ≈ 0.20–0.35, w_S ≈ 0.05–0.15, w_X ≈ 0.05–0.15
- Digital/remote/open-source (website dev, app governance, remote work): w_S ≈ 0.40–0.55, w_G ≈ 0.05–0.20, w_D ≈ 0.10–0.20, w_X ≈ 0.10–0.20
- Social services (food bank, mutual aid, shelter): w_G ≈ 0.35–0.50, w_S ≈ 0.20–0.35, w_D ≈ 0.15–0.25, w_X ≈ 0.05–0.15

────────────────────────────────────────────────────────────────
C. GEOGRAPHIC PARAMETERS
────────────────────────────────────────────────────────────────
"geographic_parameters": {
  "mu_distance_meters":    flat zone radius where G=1.0 (decay begins here),
  "sigma_distance_meters": decay steepness; relevance ≈ 60% at mu+sigma, ~1% at mu+3*sigma,
  "geo_reasoning": "1 sentence"
},

Typical ranges:
  unit/building:      mu 30–80,    sigma 20–60
  street_segment:     mu 100–250,  sigma 80–200
  neighborhood:       mu 400–1000, sigma 300–800
  district:           mu 1500–3000, sigma 1200–2500
  city/region:        mu 3000–10000, sigma 2500–8000
  global_digital:     mu ≥ 50000,  sigma ≥ 40000

────────────────────────────────────────────────────────────────
D. DEMOGRAPHIC RULES (simplified backend schema)
────────────────────────────────────────────────────────────────
"demographic_rules": {
  "minAge": <number or null>,
  "maxAge": <number or null>,
  "employmentStatus": "any" | "employed" | "unemployed" | "student" | "retired",
  "familyStatus": "any" | "parent" | "grandparent",
  "features": [ array of keyword strings like "car", "pets", "animals", "bike", "child" ],
    // matched against the person's features and interests (hobbies); D only, never G
  "places": [ names of companies, organisations or properties the issue is about, e.g. "Argo Industry"; [] if none ],
    // a person who works at or owns a listed place is included through D even if they live far away
  "property_kinds": [ any of "flat", "house", "land", "garage", "commercial", "other"; [] if none ]
    // kinds of real estate whose owners are affected (matched against registered property locations)
},

────────────────────────────────────────────────────────────────
E. EXPERTISE DOMAIN PARAMETERS
────────────────────────────────────────────────────────────────
"expertise_domain_parameters": {
  "expertise_domain": "<string matching classification.expertise_domain>",
  "recency_decay_rate": <float per year, 0.01–0.08>,
    // 0.01–0.03 = slow change; 0.05–0.08 = cutting-edge domain
  "CBC_adjustment_factor": <float 0.7–1.3>,
    // <1.0 = narrow, focused credentials; >1.0 = broader credential broadcast
  "domain_reasoning": "1 sentence"
},

────────────────────────────────────────────────────────────────
F. RESOURCES NEEDED
────────────────────────────────────────────────────────────────
// What the issue needs to be resolved, money included. These entries prepare
// the options (cost, funding source, needed resources). They give nobody weight
// and are not part of anyone's Expertise.
"resources_needed": [
  {
    "resource_type": one of: money_budget | physical_equipment | facilities_space |
                     transportation | professional_services | human_volunteers |
                     social_networks | digital_infrastructure,
    "importance_level": "high" | "medium" | "low",
    "explanation": "1 sentence"
  }
  // Include 2–4 relevant resource entries
],

────────────────────────────────────────────────────────────────
G. ISR-SCORE AGGREGATION WEIGHTS (must sum to exactly 1.0)
────────────────────────────────────────────────────────────────
"aggregation_weights": { "w_relevance": <float>, "w_expertise": <float>, "w_contribution": <float> },
"aggregation_reasoning": "1–2 sentences",

Pattern anchors from ISR-Issue-Analyzer-100-Examples.md:
- Local direct-experience (heating, noise, access lock): w_relevance ≈ 0.65–0.75, w_expertise ≈ 0.10–0.20, w_contribution ≈ 0.15–0.25
- Technical/safety/policy (zoning, infrastructure safety, software): w_relevance ≈ 0.40–0.55, w_expertise ≈ 0.25–0.40, w_contribution ≈ 0.15–0.25
- Governance/coordination (platform rules, budgeting, mutual aid): w_relevance ≈ 0.45–0.60, w_expertise ≈ 0.15–0.30, w_contribution ≈ 0.20–0.35

────────────────────────────────────────────────────────────────
H. BACKWARD-COMPATIBLE SHORTHAND FIELDS (required for API clients)
────────────────────────────────────────────────────────────────
Also include these top-level fields for backward compatibility:
"category":         same value as classification.issue_category,
"mu":               same value as geographic_parameters.mu_distance_meters,
"sigma":            same value as geographic_parameters.sigma_distance_meters,
"expertise_depth":  map expertise domain depth to one of: "PhD" | "Master" | "Bachelor" | "College" | "Vocational Training" | "None",
"expertise_domain": same value as expertise_domain_parameters.expertise_domain,
"demographics":     same object as demographic_rules,
"relevance_reasoning":   same as relevance_weights_reasoning,
"aggregation_reasoning": same as aggregation_reasoning,
"relevance_explanations": {
  "reasoning_D": explanation for w_demographic choice,
  "reasoning_G": explanation for w_geographic choice,
  "reasoning_S": explanation for w_semantic choice,
  "reasoning_X": explanation for w_social choice
},
"isr_explanations": {
  "reasoning_R": explanation for w_relevance choice,
  "reasoning_E": explanation for w_expertise choice,
  "reasoning_C": explanation for w_contribution choice
}

────────────────────────────────────────────────────────────────
FULL ISR CATEGORY TAXONOMY
────────────────────────────────────────────────────────────────
Choose the most specific matching path:

BUILDING & UNIT
building.security.locks              - entrance locks, keys, intercoms, access cards
building.security.lighting           - stairwell, corridor, parking lot lighting inside building
building.security.cameras            - CCTV, surveillance systems in building
building.security.guest_access       - visitor management, concierge, intercom systems
building.security.general            - general building security, gates, windows
building.maintenance.water           - leaks, plumbing, pipes, flooding in building
building.maintenance.heating         - radiators, boilers, building heating
building.maintenance.elevator        - lifts, escalators inside building
building.maintenance.electrical      - wiring, sockets, circuit breakers inside building
building.maintenance.roof            - roof leaks, insulation, gutters, flat roof
building.maintenance.laundry         - shared laundry facilities
building.maintenance.waste           - building trash bins, waste room, recycling in building
building.maintenance.renovation      - common area renovations, painting
building.maintenance.general         - other building common area maintenance
building.noise.internal              - noise between neighbors, loud music, footsteps
building.noise.construction          - construction noise within or adjacent to building
building.health.mold                 - dampness, mold growth in building
building.health.pests                - rodents, insects, vermin in building
building.health.smoking              - smoking in common areas
building.health.air_quality          - ventilation, indoor air quality in building
building.safety.fire                 - fire alarms, extinguishers, evacuation routes
building.safety.evacuation           - evacuation plans and drills
building.safety.balcony              - balcony safety railings, structural safety
building.safety.rooftop              - unsafe rooftop access
building.transport.parking           - building parking lot allocation
building.policy.pets                 - pet ownership rules in building
building.policy.storage              - storage rules and allocations
building.policy.moving               - move-in/out rules and scheduling
building.policy.renovation_rules     - rules for apartment renovation by tenant
building.policy.short_term_rental    - Airbnb and short-term rental governance in building

HOUSING POLICY
housing.policy.tenancy               - tenant rights, rent disputes, lease agreements
housing.policy.social_housing        - public or subsidized housing applications, allocation
housing.policy.homelessness          - housing support for homeless people
housing.policy.overcrowding          - overcrowding issues in shared dwellings
housing.policy.accessibility         - accessible housing for disabled people

INFRASTRUCTURE — TRANSPORT
infrastructure.transport.streets     - potholes, sidewalks, road surface quality
infrastructure.transport.transit     - bus, metro, tram, train public transport
infrastructure.transport.bike        - cycling lanes, bike paths, velodrome
infrastructure.transport.bike_parking - bicycle parking availability and safety
infrastructure.transport.parking_rules - public parking regulations, permit zones
infrastructure.transport.speed       - traffic speed limits, calming measures, humps
infrastructure.transport.safety      - pedestrian crossings, traffic lights, road signage
infrastructure.transport.car_free    - pedestrianization proposals, car-free zones
infrastructure.transport.school_transport - school buses, safe routes to school
infrastructure.transport.accessibility - disabled access on transport, ramps, kerbs

INFRASTRUCTURE — UTILITIES
infrastructure.utilities.water       - public water supply, water quality, pressure
infrastructure.utilities.electricity - power grid, outages, smart meters
infrastructure.utilities.gas         - gas supply, pipelines, safety
infrastructure.utilities.internet    - broadband access, public WiFi infrastructure
infrastructure.utilities.heating_network - district heating supply network
infrastructure.utilities.sewage      - drainage, sewage, wastewater

INFRASTRUCTURE — PUBLIC SPACE
infrastructure.public.lighting       - street lighting, public lamp posts
infrastructure.public.cleanliness    - litter, street cleaning, graffiti removal
infrastructure.public.noise          - traffic noise, public spaces noise policy
infrastructure.public.playground     - children's playgrounds, equipment safety
infrastructure.public.bench_amenities - benches, bus shelters, public furniture
infrastructure.public.sanitation     - public toilets, hygiene facilities
infrastructure.public.pedestrian_zone - pedestrian zones, walkways, promenades
infrastructure.public.accessibility  - barrier-free access in public spaces

INFRASTRUCTURE — MAINTENANCE & SAFETY
infrastructure.maintenance.winter    - snow clearing, gritting, ice management
infrastructure.maintenance.waste_schedule - garbage collection schedule
infrastructure.maintenance.road_repair - scheduled road repair works
infrastructure.safety.bridge_underpass - structural safety of bridges, tunnels
infrastructure.safety.construction_zone - public safety near active construction
infrastructure.safety.flood_risk     - flood risk management, drainage capacity

ENVIRONMENT
environment.green_space              - parks, gardens, urban greenery management
environment.trees                    - tree protection, removal requests, new planting
environment.pollution.air            - air quality, industrial pollution, vehicle emissions
environment.pollution.noise          - chronic noise pollution (roads, factories, airports)
environment.pollution.water          - river, lake, groundwater contamination
environment.pollution.soil           - soil contamination, brownfield land
environment.waste.recycling          - recycling collection points, sorting rules
environment.waste.illegal_dumping    - fly-tipping, illegal waste disposal
environment.climate.heatwave_adaptation - heat emergency, cooling centers, shade
environment.climate.flooding         - flood preparedness, retention basins, drainage
environment.biodiversity             - local wildlife habitats, urban nature corridors
environment.animals.stray            - stray cats, dogs management programs
environment.animals.welfare          - animal welfare, cruelty prevention

HEALTH
health.access.clinic                 - local clinic, GP registration, wait times
health.access.hospital               - hospital access, emergency services, ambulance
health.access.medication_local       - pharmacy access, prescription coverage
health.access.childcare              - pediatric health services, child wellness
health.access.elderly_care           - geriatric care, nursing homes, home care
health.access.disability_care        - disability health support, prosthetics, therapy
health.access.prevention             - vaccination, screening, public health programs
health.support.mental_local          - mental health services, counseling, crisis lines
health.support.addiction_local       - substance abuse programs, rehab, harm reduction
health.support.social_care           - social care services for vulnerable populations
health.safety.pandemic_local         - infectious disease response, outbreak management
health.safety.heatwave               - heat-related health emergency response
health.safety.food_safety            - restaurant inspections, food standards enforcement
health.emergency.preparedness        - emergency health preparedness, first aid

EDUCATION
education.school.schedule            - school hours, term calendar, holiday policy
education.school.cafeteria           - school meals, nutrition quality
education.school.safety              - school security, anti-bullying, safe school environment
education.school.transport           - school buses, safe routes to school
education.school.after_school        - after-school programs, tutoring, clubs
education.school.digital_comm        - school-parent digital communication platforms
education.school.policy_grading      - grading policies, standards, exam procedures
education.school.scholarships        - financial aid, grants for students
education.school.facilities          - classrooms, labs, sports halls, equipment
education.higher.curriculum          - university curriculum, course content changes
education.higher.exams               - exam policies, academic integrity, scheduling
education.higher.student_housing     - student accommodation policies
education.vocational.center_local    - vocational training centers, trade schools
education.work_based.internships     - internship programs, apprenticeship, work placements
education.lifelong.adult_classes     - adult education, evening classes, community learning
education.digital.digital_literacy   - digital skills training for all ages

SOCIAL LIFE & COMMUNITY SERVICES
social.event.community               - community gatherings, street parties, neighborhood socials
social.event.sports                  - local sports events, leagues, tournaments
social.event.culture_kids            - children's cultural events, workshops, crafts
social.event.market                  - local markets, fairs, pop-up stalls
social.event.city_festival_governance - city festival planning, permits, volunteer coordination
social.culture.community_group       - hobby groups, clubs, associations (chess, dance, music)
social.culture.heritage              - cultural heritage preservation, local history
social.culture.public_art            - murals, sculptures, street art commissioning
social.culture.library               - public library services, collections, access
social.services.food_bank_local      - food banks, meal programs, pantries
social.services.mutual_aid           - mutual aid networks, community sharing
social.services.neighborhood_support - neighbor help networks, community care
social.services.shelter              - emergency shelter, overnight accommodation
social.services.refugee_support      - refugee and migrant integration support
social.charity.volunteering          - volunteer program organization and coordination
social.charity.local_service         - local charity and welfare services delivery
social.charity.online_campaign       - community crowdfunding, online fundraising drives
social.youth.club                    - youth clubs, after-school social activities
social.youth.sports_safety           - youth sports safety, coaching standards
social.youth.library                 - youth library access, reading programs
social.youth.mentorship              - mentorship and peer support for young people
social.family.emergency              - family crisis support, emergency childcare
social.inclusion.lgbtq_support       - LGBTQ+ community inclusion programs
social.inclusion.disability_inclusion - disability rights, inclusion, adaptation
social.inclusion.ethnic_minority_support - minority community support and rights
social.religion.local_practice       - religious community activities, prayer spaces
social.safety.neighborhood_watch     - neighborhood watch programs, community safety
social.safety.domestic_violence_support - domestic violence awareness and support resources
social.elderly.social_isolation      - combating elderly isolation, companionship programs
social.elderly.mobility_support      - elderly mobility assistance, transport for seniors

COMMUNITY GOVERNANCE & DIGITAL COORDINATION
community.governance.zoning          - land use planning, zoning permissions, building permits
community.governance.budget_city     - participatory budgeting, community spending proposals
community.governance.elections_local - local elections, voter registration, polling logistics
community.governance.policy_debate   - community policy discussions, consultations
community.governance.political_forum - political discussions, candidate forums, debates
community.governance.platform_rules  - community app governance rules, moderation policy
community.governance.neighborhood_app - local digital community platforms, app features
community.governance.open_source     - open source software projects, contribution governance
community.governance.open_source_roadmap - OSS roadmap decisions, feature voting
community.governance.digital_privacy - data protection policy, privacy rights, GDPR
community.governance.religious_visibility - religious symbols in public space, secularism debate
community.governance.local_forum     - community forum organization, assembly scheduling
community.governance.petition        - community petitions to authorities
community.governance.conflict_resolution - community mediation, dispute resolution
community.work.gig_local             - gig economy working conditions, platform worker rights
community.work.remote_policy         - remote work infrastructure and policy
community.work.offline_schedule      - shift scheduling, working hours policy
community.work.unemployment          - local employment programs, job creation
community.work.business_support      - local small business support, permits, grants

ECONOMY & LOCAL BUSINESS
economy.local_business.support       - small business support programs
economy.local_business.market_access - market stall permits, street vending licenses
economy.employment.job_placement     - job centers, employment referral services
economy.employment.apprenticeship    - apprenticeship programs, vocational pathways
economy.finance.microloan            - community lending, microfinance initiatives
economy.tourism.local                - local tourism management, visitor impact

SAFETY & SECURITY
safety.crime.vandalism               - graffiti, property damage, tagging
safety.crime.theft                   - neighborhood theft, burglary prevention
safety.crime.drug_activity           - drug dealing, substance-related public safety
safety.digital.local_fraud           - online scams, phishing, digital fraud awareness
safety.digital.data_privacy          - personal data protection, identity theft
safety.emergency.evacuation_plan     - community evacuation planning
safety.emergency.disaster_preparedness - community disaster readiness, emergency kits
────────────────────────────────────────────────────────────────

Return ONLY the JSON object. No explanation text outside the JSON.
`;
}

// Fields removed by task A2 (PD-8): Expertise has no weights and no resources part.
const { OBSOLETE_PARAM_FIELDS } = require("./params");
const { sanitizeDemographicRules } = require("./demographics");

// =============================================================================
// NORMALIZATION
// =============================================================================

/**
 * Normalizes the AI response to guarantee all backward-compatible fields
 * are present, regardless of which keys the LLM returned.
 *
 * @param {object} data - Raw parsed JSON from the LLM
 * @returns {object} Normalized data object
 */
function normalizeIssueParams(data) {
  // ── Relevance weights ──────────────────────────────────────────────────────
  const rw = data.relevance_weights || {};
  const rwNorm = {
    w_demographic: rw.w_demographic !== undefined ? rw.w_demographic : 0.2,
    w_geographic:  rw.w_geographic  !== undefined ? rw.w_geographic  : 0.4,
    w_semantic:    rw.w_semantic    !== undefined ? rw.w_semantic    : 0.3,
    w_social:      rw.w_social      !== undefined ? rw.w_social      : 0.1
  };
  data.relevance_weights = rwNorm;

  // Shorthand weights object (legacy format)
  data.weights = {
    w_D: rwNorm.w_demographic,
    w_G: rwNorm.w_geographic,
    w_S: rwNorm.w_semantic,
    w_X: rwNorm.w_social
  };

  // ── Geographic parameters ─────────────────────────────────────────────────
  const gp = data.geographic_parameters || {};
  data.geographic_parameters = {
    mu_distance_meters:    gp.mu_distance_meters    !== undefined ? gp.mu_distance_meters    : (data.mu || 100),
    sigma_distance_meters: gp.sigma_distance_meters !== undefined ? gp.sigma_distance_meters : (data.sigma || 50),
    geo_reasoning:         gp.geo_reasoning || ""
  };
  // Top-level mu/sigma shorthands
  if (!data.mu)    data.mu    = data.geographic_parameters.mu_distance_meters;
  if (!data.sigma) data.sigma = data.geographic_parameters.sigma_distance_meters;

  // ── Classification ────────────────────────────────────────────────────────
  const cl = data.classification || {};
  data.classification = {
    issue_category:          cl.issue_category          || data.category || "building.maintenance.general",
    scope_type:              cl.scope_type              || "building",
    affected_roles:          cl.affected_roles          || ["resident"],
    affected_vulnerabilities: cl.affected_vulnerabilities || [],
    technicality_level:      cl.technicality_level      || "low",
    safety_sensitivity:      cl.safety_sensitivity      || "low",
    digital_or_physical:     cl.digital_or_physical     || "physical",
    expertise_domain:        cl.expertise_domain        || data.expertise_domain || "General Maintenance",
    classification_reasoning: cl.classification_reasoning || ""
  };
  if (!data.category) data.category = data.classification.issue_category;

  // ── Demographic rules ─────────────────────────────────────────────────────
  if (!data.demographic_rules && data.demographics) {
    data.demographic_rules = data.demographics;
  } else if (!data.demographic_rules) {
    data.demographic_rules = { employmentStatus: "any", familyStatus: "any", features: [] };
  }
  if (!data.demographics) data.demographics = data.demographic_rules;
  // A3: places and property kinds (causes to include through D); clean lists only
  data.demographic_rules = sanitizeDemographicRules(data.demographic_rules);
  data.demographics = sanitizeDemographicRules(data.demographics);

  // ── Obsolete fields (A2, PD-8): never passed on, even if the model returns them
  for (const k of OBSOLETE_PARAM_FIELDS) delete data[k];

  // ── Expertise domain parameters ───────────────────────────────────────────
  if (!data.expertise_domain_parameters) {
    data.expertise_domain_parameters = {
      expertise_domain:        data.expertise_domain || "General Maintenance",
      recency_decay_rate:      0.02,
      CBC_adjustment_factor:   1.0,
      domain_reasoning:        ""
    };
  }
  delete data.expertise_domain_parameters.contemporary_importance;
  delete data.expertise_domain_parameters.age_penalty_threshold;
  if (!data.expertise_domain) data.expertise_domain = data.expertise_domain_parameters.expertise_domain;
  if (!data.expertise_depth)  data.expertise_depth  = "Vocational Training";

  // ── Resources needed ─────────────────────────────────────────────────────
  if (!data.resources_needed) data.resources_needed = [];

  // ── Aggregation weights ───────────────────────────────────────────────────
  const aw = data.aggregation_weights || {};
  data.aggregation_weights = {
    w_relevance:    aw.w_relevance    !== undefined ? aw.w_relevance    : 0.5,
    w_expertise:    aw.w_expertise    !== undefined ? aw.w_expertise    : 0.2,
    w_contribution: aw.w_contribution !== undefined ? aw.w_contribution : 0.3
  };

  // ── Backward-compatible reasoning strings ─────────────────────────────────
  if (!data.relevance_reasoning)    data.relevance_reasoning    = data.relevance_weights_reasoning || "";
  if (!data.aggregation_reasoning)  data.aggregation_reasoning  = "";


  // Individual explanation blocks (legacy flat format)
  const re = data.relevance_explanations || {};
  data.relevance_explanations = {
    reasoning_D: re.reasoning_D || data.relevance_reasoning || "Demographic relevance.",
    reasoning_G: re.reasoning_G || "Geographic proximity relevance.",
    reasoning_S: re.reasoning_S || "Semantic interest relevance.",
    reasoning_X: re.reasoning_X || "Social graph proximity relevance."
  };

  const ie = data.isr_explanations || {};
  data.isr_explanations = {
    reasoning_R: ie.reasoning_R || "Lived relevance alignment.",
    reasoning_E: ie.reasoning_E || "Technical competence needed.",
    reasoning_C: ie.reasoning_C || "Track record of constructive participation."
  };


  return data;
}

// =============================================================================
// FALLBACK (no Gemini key or API failure)
// =============================================================================

/**
 * Returns local fallback parameters when Gemini is unavailable or fails.
 * Covers common issue types with keyword detection using word-boundary regex
 * to prevent substring false-positive matches.
 *
 * @param {string} description
 * @param {string} title
 * @returns {object} Full normalized params object
 */
function getLocalFallbackParams(description, title) {
  const lower = (description + " " + title).toLowerCase();

  // Word-boundary regex helper — prevents substring collisions
  const has = (...words) => words.some(w => new RegExp(`\\b${w}\\b`).test(lower));

  // Defaults
  let cat = "building.maintenance.general";
  let scope = "building";
  let roles = ["tenant", "resident"];
  let vulns = [];
  let tech = "low";
  let safety = "low";
  let dp = "physical";
  let expertiseDomain = "building_maintenance.general";
  let mu = 100, sigma = 50;
  let rw = { w_demographic: 0.2, w_geographic: 0.5, w_semantic: 0.1, w_social: 0.2 };
  let aw = { w_relevance: 0.65, w_expertise: 0.15, w_contribution: 0.20 };
  let edDepth = "Vocational Training";
  let demo = { employmentStatus: "any", familyStatus: "any", features: [] };
  let rdr = 0.02, cbc = 1.0;
  let resources = [
    { resource_type: "professional_services", importance_level: "high", explanation: "Qualified maintenance worker required." },
    { resource_type: "money_budget", importance_level: "medium", explanation: "Funds to cover repair materials and labor." }
  ];

  let relevance_reasoning = "General building maintenance issue. Geographic proximity is primary.";
  let aggregation_reasoning = "Low-tech physical issue where lived relevance dominates.";
  let expertise_reasoning = "Hands-on maintenance requiring practical experience and tools.";
  let domain_reasoning = "Stable trade domain with slow knowledge change.";

  // ── Pattern matching ─────────────────────────────────────────────────────────
  if (has("water outage", "water supply", "water disruption", "main line", "water main")) {
    cat = "infrastructure.utilities.water"; scope = "neighborhood"; tech = "high"; safety = "high";
    expertiseDomain = "civil_engineering.water_utilities"; edDepth = "Bachelor";
    mu = 600; sigma = 500;
    rw = { w_demographic: 0.30, w_geographic: 0.60, w_semantic: 0.05, w_social: 0.05 };
    aw = { w_relevance: 0.70, w_expertise: 0.20, w_contribution: 0.10 };
    rdr = 0.04; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Water utility engineers and repair crews." },
      { resource_type: "physical_equipment", importance_level: "high", explanation: "Pipe repair kits, excavation tools, temporary distribution tanks." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Emergency infrastructure repair costs." }
    ];
    relevance_reasoning = "Public water supply disruptions affect all households in the impacted street or block. Geographic proximity is dominant.";
    aggregation_reasoning = "High-urgency utility issue; lived impact dominates, technical expertise secondary.";
    expertise_reasoning = "Water utility engineering and infrastructure repair require formal education and field experience.";
    domain_reasoning = "Water utility infrastructure is a moderately evolving technical domain.";

  } else if (has("leak", "plumbing", "pipe", "flooding", "burst pipe", "water damage")) {
    cat = "building.maintenance.water"; scope = "building"; safety = "medium";
    expertiseDomain = "plumbing.building_systems"; edDepth = "Vocational Training";
    mu = 40; sigma = 35;
    rw = { w_demographic: 0.25, w_geographic: 0.55, w_semantic: 0.05, w_social: 0.15 };
    aw = { w_relevance: 0.70, w_expertise: 0.15, w_contribution: 0.15 };
    rdr = 0.02; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Certified plumber for pipe repair or replacement." },
      { resource_type: "physical_equipment", importance_level: "high", explanation: "Pipe cutters, sealants, replacement sections." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Emergency repair costs, potential material damage remediation." }
    ];
    relevance_reasoning = "Plumbing issues affect residents connected to the shared water riser. Proximity is primary.";
    aggregation_reasoning = "Physical water damage risk; lived relevance dominates, expertise secondary.";
    expertise_reasoning = "Hands-on plumbing experience and tools are essential.";
    domain_reasoning = "Plumbing is a stable trade; building codes evolve slowly.";

  } else if (has("heating", "radiator", "boiler")) {
    cat = "building.maintenance.heating"; scope = "building"; safety = "medium";
    expertiseDomain = "hvac.building_heating"; edDepth = "Vocational Training";
    mu = 50; sigma = 45;
    rw = { w_demographic: 0.25, w_geographic: 0.55, w_semantic: 0.05, w_social: 0.15 };
    aw = { w_relevance: 0.70, w_expertise: 0.15, w_contribution: 0.15 };
    rdr = 0.03; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "HVAC technician with radiator/boiler expertise." },
      { resource_type: "physical_equipment", importance_level: "medium", explanation: "Pipe venting keys, thermal camera, replacement valves." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Repair costs and potential system component replacement." }
    ];
    relevance_reasoning = "Heating issues affect residents inside the building's heating circuit. Proximity is primary.";
    aggregation_reasoning = "Experiential temperature discomfort; lived relevance dominates, expertise secondary.";
    expertise_reasoning = "HVAC practical experience is primary; specialized tools required.";
    domain_reasoning = "HVAC is moderately evolving; newer systems require updated certifications.";

  } else if (has("lock", "locks", "locked") && !has("locker", "storage") || has("intercom", "key fob", "access card", "access control")) {
    cat = "building.security.locks"; scope = "building"; tech = "medium"; safety = "medium";
    expertiseDomain = "locksmith.security"; edDepth = "Vocational Training";
    mu = 40; sigma = 30;
    rw = { w_demographic: 0.30, w_geographic: 0.50, w_semantic: 0.05, w_social: 0.15 };
    aw = { w_relevance: 0.70, w_expertise: 0.10, w_contribution: 0.20 };
    rdr = 0.02; cbc = 0.90;
    resources = [
      { resource_type: "physical_equipment", importance_level: "high", explanation: "Locksmith tools and security-grade replacement hardware." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Funds to cover locksmith services and lock replacement." }
    ];
    relevance_reasoning = "Building entrance lock directly affects all residents. Geographic proximity is the dominant factor.";
    aggregation_reasoning = "Physical access is an experiential issue; direct relevance dominates over technical expertise.";
    expertise_reasoning = "Hands-on locksmithing experience and specialized tools are the primary requirements.";
    domain_reasoning = "Locksmithing is a stable trade; knowledge changes slowly.";

  } else if (has("balcony", "balconies", "rooftop", "railing", "weight limit", "glazing")) {
    cat = "building.safety.balcony"; scope = "building"; tech = "high"; safety = "high";
    expertiseDomain = "structural_engineering.residential"; edDepth = "Bachelor";
    mu = 50; sigma = 40;
    rw = { w_demographic: 0.40, w_geographic: 0.40, w_semantic: 0.10, w_social: 0.10 };
    aw = { w_relevance: 0.55, w_expertise: 0.30, w_contribution: 0.15 };
    rdr = 0.03; cbc = 0.95;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Structural engineer for safety assessment and permit sign-off." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Inspection fees and remediation costs." }
    ];
    relevance_reasoning = "Balcony safety rules affect all tenants in the building; demographic and geographic proximity are jointly primary.";
    aggregation_reasoning = "Structural safety requires expertise; both expert opinion and tenant relevance are important.";
    expertise_reasoning = "Structural engineering knowledge and professional certification are key requirements.";
    domain_reasoning = "Structural engineering for residential buildings is a moderately evolving domain with strict code updates.";

  } else if (has("storage", "locker", "lockers", "storage room", "storage allocation")) {
    cat = "housing.policy.storage"; scope = "unit"; tech = "medium"; safety = "low";
    expertiseDomain = "housing.policy.resource_allocation"; edDepth = "College";
    mu = 60; sigma = 50;
    rw = { w_demographic: 0.40, w_geographic: 0.35, w_semantic: 0.15, w_social: 0.10 };
    aw = { w_relevance: 0.60, w_expertise: 0.20, w_contribution: 0.20 };
    rdr = 0.02; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "medium", explanation: "Building manager or housing policy consultant for allocation review." },
      { resource_type: "money_budget", importance_level: "low", explanation: "Administrative costs of re-allocation process." }
    ];
    relevance_reasoning = "Storage allocation primarily affects building tenants by their apartment and tenure status.";
    aggregation_reasoning = "Policy decision; both affected tenants and experienced administrators shape the outcome.";
    expertise_reasoning = "Housing policy knowledge and experience managing allocation disputes are key.";
    domain_reasoning = "Housing resource allocation policy is a stable administrative domain.";

  } else if (has("laundry", "washing machine", "dryer", "laundry room")) {
    cat = "building.maintenance.laundry"; scope = "building"; tech = "medium"; safety = "low";
    expertiseDomain = "building_management.shared_facilities"; edDepth = "Vocational Training";
    mu = 35; sigma = 25;
    rw = { w_demographic: 0.35, w_geographic: 0.40, w_semantic: 0.15, w_social: 0.10 };
    aw = { w_relevance: 0.65, w_expertise: 0.10, w_contribution: 0.25 };
    rdr = 0.02; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "medium", explanation: "Appliance technician for maintenance or scheduling system setup." },
      { resource_type: "digital_infrastructure", importance_level: "low", explanation: "Optional booking system or notice board app." },
      { resource_type: "money_budget", importance_level: "low", explanation: "Administrative setup costs." }
    ];
    relevance_reasoning = "Shared laundry room issues affect all building residents directly; geography and demographics dominate.";
    aggregation_reasoning = "Day-to-day lived experience drives decisions; building manager expertise is secondary.";
    expertise_reasoning = "Practical facility management experience and access to maintenance services are key.";
    domain_reasoning = "Building facilities management is a stable, low-tech domain.";

  } else if (has("playground", "swing", "swings", "slide", "climbing frame", "play equipment")) {
    cat = "infrastructure.public.playground"; scope = "street_segment"; safety = "high";
    expertiseDomain = "civil_engineering.public_space_maintenance"; edDepth = "Vocational Training";
    mu = 250; sigma = 200;
    rw = { w_demographic: 0.35, w_geographic: 0.50, w_semantic: 0.10, w_social: 0.05 };
    aw = { w_relevance: 0.70, w_expertise: 0.15, w_contribution: 0.15 };
    rdr = 0.02; cbc = 1.0;
    roles = ["parent", "child", "resident"];
    vulns = ["children"];
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Certified playground safety inspector and repair contractor." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Parts replacement and safety certification costs." }
    ];
    relevance_reasoning = "Playground issues primarily affect nearby parents and children; geographic proximity and demographic filters are primary.";
    aggregation_reasoning = "Child safety is paramount; local parents have the highest voice, safety expertise is important.";
    expertise_reasoning = "Playground safety certification and maintenance experience are required.";
    domain_reasoning = "Playground safety standards are moderately regulated and evolve with new norms.";

  } else if (has("underpass", "tunnel", "bridge", "overpass", "viaduct")) {
    cat = "infrastructure.safety.bridge_underpass"; scope = "neighborhood"; tech = "high"; safety = "high";
    expertiseDomain = "civil_engineering.structural_safety"; edDepth = "Master";
    mu = 300; sigma = 250;
    rw = { w_demographic: 0.25, w_geographic: 0.60, w_semantic: 0.10, w_social: 0.05 };
    aw = { w_relevance: 0.60, w_expertise: 0.25, w_contribution: 0.15 };
    rdr = 0.04; cbc = 0.95;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Structural engineers and safety inspectors." },
      { resource_type: "physical_equipment", importance_level: "high", explanation: "Lighting hardware, CCTV units, safety barriers." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Infrastructure upgrade costs." }
    ];
    relevance_reasoning = "Bridge and underpass safety issues affect all daily users in the neighborhood; geography dominates.";
    aggregation_reasoning = "Structural safety requires expert input; geographic user base has primary voice.";
    expertise_reasoning = "Civil and structural engineering expertise is the primary requirement.";
    domain_reasoning = "Structural safety is a moderately evolving technical domain with strict regulatory standards.";

  } else if (has("election", "ballot", "polling", "voter", "voting", "electoral")) {
    cat = "community.governance.elections_local"; scope = "city"; tech = "high"; safety = "low";
    expertiseDomain = "civic_administration.elections"; edDepth = "College";
    mu = 4000; sigma = 3500;
    rw = { w_demographic: 0.60, w_geographic: 0.25, w_semantic: 0.10, w_social: 0.05 };
    aw = { w_relevance: 0.50, w_expertise: 0.35, w_contribution: 0.15 };
    rdr = 0.04; cbc = 1.0;
    resources = [
      { resource_type: "professional_services", importance_level: "high", explanation: "Election administration officials and legal advisors." },
      { resource_type: "facilities_space", importance_level: "high", explanation: "Polling stations and ballot drop-off locations." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Electoral process administration costs." }
    ];
    relevance_reasoning = "Civic elections are primarily a demographic issue; all eligible registered voters in the city are affected.";
    aggregation_reasoning = "Democratic participation should be driven by eligible citizens; expertise ensures procedural integrity.";
    expertise_reasoning = "Electoral administration and legal expertise are critical for process integrity.";
    domain_reasoning = "Civic election administration is a moderately evolving domain driven by legislation changes.";

  } else if (has("remote work", "work from home", "wfh", "office days", "hybrid work", "work policy", "flexible schedule")) {
    cat = "community.work.remote_policy"; scope = "city"; tech = "medium"; safety = "low";
    expertiseDomain = "organizational_policy.remote_work"; edDepth = "College";
    mu = 5000; sigma = 4000;
    rw = { w_demographic: 0.65, w_geographic: 0.05, w_semantic: 0.15, w_social: 0.15 };
    aw = { w_relevance: 0.55, w_expertise: 0.25, w_contribution: 0.20 };
    rdr = 0.05; cbc = 1.1;
    demo = { employmentStatus: "employed", familyStatus: "any", features: [] };
    resources = [
      { resource_type: "digital_infrastructure", importance_level: "high", explanation: "Remote collaboration tools, VPN, and cloud infrastructure." },
      { resource_type: "professional_services", importance_level: "medium", explanation: "HR and legal advisors for policy drafting." }
    ];
    relevance_reasoning = "Work policy changes primarily affect employed people regardless of geography; demographics dominate.";
    aggregation_reasoning = "Employees most affected have primary voice; organizational expertise ensures workable outcomes.";
    expertise_reasoning = "HR policy and remote work management experience are the primary requirements.";
    domain_reasoning = "Remote work policy is a rapidly evolving domain shaped by post-pandemic norms.";

  } else if (has("pothole", "sidewalk", "road", "pavement", "road surface", "street repair")) {
    cat = "infrastructure.transport.streets"; scope = "street_segment";
    expertiseDomain = "civil_engineering.roads"; edDepth = "Vocational Training";
    mu = 200; sigma = 150;
    rw = { w_demographic: 0.20, w_geographic: 0.60, w_semantic: 0.10, w_social: 0.10 };
    aw = { w_relevance: 0.65, w_expertise: 0.15, w_contribution: 0.20 };
    resources = [
      { resource_type: "money_budget", importance_level: "high", explanation: "Municipal budget for resurfacing or patching." },
      { resource_type: "professional_services", importance_level: "high", explanation: "Road repair contractors and engineering oversight." }
    ];
    relevance_reasoning = "Street-level issue affecting all road users nearby. Geographic proximity is primary.";
    aggregation_reasoning = "Physical infrastructure; daily users have highest voice.";
    expertise_reasoning = "Road repair requires practical civil engineering experience.";

  } else if (has("garden", "tree", "trees", "greenery", "green space") || (has("park") && !has("parking", "car park"))) {
    cat = "environment.green_space"; scope = "neighborhood";
    expertiseDomain = "horticulture.urban_landscaping"; edDepth = "Vocational Training";
    mu = 500; sigma = 300;
    rw = { w_demographic: 0.30, w_geographic: 0.50, w_semantic: 0.10, w_social: 0.10 };
    aw = { w_relevance: 0.60, w_expertise: 0.20, w_contribution: 0.20 };
    resources = [
      { resource_type: "human_volunteers", importance_level: "high", explanation: "Volunteers for planting and maintenance." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Plants, tools, and professional landscaping fees." }
    ];
    relevance_reasoning = "Green spaces are highly local; demographics (families, seniors) shape usage patterns.";
    aggregation_reasoning = "Neighborhood asset; local residents shape its use, expertise secondary.";
    expertise_reasoning = "Horticultural experience and physical resources (tools) dominate.";

  } else if (has("chess", "dance", "concert", "choir", "music group", "arts group", "jam session") || (has("event", "club") && !has("prevent", "clubhouse"))) {
    cat = "social.culture.community_group"; scope = "neighborhood"; dp = "hybrid";
    expertiseDomain = "event_coordination.community_clubs"; edDepth = "Vocational Training";
    mu = 1000; sigma = 4000;
    rw = { w_demographic: 0.10, w_geographic: 0.20, w_semantic: 0.55, w_social: 0.15 };
    aw = { w_relevance: 0.50, w_expertise: 0.20, w_contribution: 0.30 };
    rdr = 0.03; cbc = 1.1;
    resources = [
      { resource_type: "facilities_space", importance_level: "high", explanation: "Venue or community hall required for the activity." },
      { resource_type: "human_volunteers", importance_level: "high", explanation: "Organizers and activity hosts." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Equipment rental, hall booking, refreshments." }
    ];
    relevance_reasoning = "Cultural/hobby events attract people by interest (semantic) across a wide soft geographic radius.";
    aggregation_reasoning = "Event success depends on enthusiastic volunteers; contribution weight is significant.";
    expertise_reasoning = "Practical coordination experience and access to venue/equipment are most important.";

  } else if (has("website", "software", "open source", "codebase", "api", "backend", "frontend") ||
             (has("app", "platform") && !has("booking app", "laundry app", "app governance"))) {
    cat = "community.governance.neighborhood_app"; scope = "district"; dp = "digital_only";
    expertiseDomain = "software.web_development"; edDepth = "Bachelor";
    tech = "high"; mu = 5000; sigma = 10000;
    rw = { w_demographic: 0.10, w_geographic: 0.10, w_semantic: 0.60, w_social: 0.20 };
    aw = { w_relevance: 0.35, w_expertise: 0.40, w_contribution: 0.25 };
    rdr = 0.07; cbc = 1.2;
    demo = { employmentStatus: "any", familyStatus: "any", features: [] };
    resources = [
      { resource_type: "digital_infrastructure", importance_level: "high", explanation: "Servers, hosting, CI/CD pipeline." },
      { resource_type: "professional_services", importance_level: "high", explanation: "Developers, UX designers, security reviewers." },
      { resource_type: "money_budget", importance_level: "medium", explanation: "Hosting costs, development hours, tooling licenses." }
    ];
    relevance_reasoning = "Digital topics attract contributors by technical interest regardless of geography.";
    aggregation_reasoning = "Technical expertise is primary; community interest and past contribution are secondary.";
    expertise_reasoning = "Formal education and direct experience in software development dominate.";
    domain_reasoning = "Software evolves rapidly; recent skills and modern frameworks are critical.";

  } else if (lower.includes("food bank") || lower.includes("shelter") || lower.includes("mutual aid") || lower.includes("volunteer")) {
    cat = "social.services.mutual_aid"; scope = "neighborhood";
    expertiseDomain = "social_work.community_services"; edDepth = "College";
    mu = 1000; sigma = 800;
    rw = { w_demographic: 0.25, w_geographic: 0.40, w_semantic: 0.25, w_social: 0.10 };
    aw = { w_relevance: 0.50, w_expertise: 0.15, w_contribution: 0.35 };
    rdr = 0.03; cbc = 1.1;
    resources = [
      { resource_type: "human_volunteers", importance_level: "high", explanation: "Volunteer staff are the core delivery mechanism." },
      { resource_type: "money_budget", importance_level: "high", explanation: "Funding for supplies, food, hygiene items." },
      { resource_type: "facilities_space", importance_level: "high", explanation: "Storage and distribution facility required." }
    ];
    relevance_reasoning = "Social services attract both geographically local users and semantically aligned supporters.";
    aggregation_reasoning = "Community service depends heavily on reliable contributors; contribution weight is high.";
    expertise_reasoning = "Physical resources and volunteer coordination experience dominate over formal credentials.";
  }

  // A3: the fallback derives no places or property kinds
  demo = sanitizeDemographicRules(demo);

  // Build the unified return object
  const result = {
    classification: {
      issue_category: cat,
      scope_type: scope,
      affected_roles: roles,
      affected_vulnerabilities: vulns,
      technicality_level: tech,
      safety_sensitivity: safety,
      digital_or_physical: dp,
      expertise_domain: expertiseDomain,
      classification_reasoning: relevance_reasoning
    },
    relevance_weights: rw,
    relevance_weights_reasoning: relevance_reasoning,
    geographic_parameters: {
      mu_distance_meters: mu,
      sigma_distance_meters: sigma,
      geo_reasoning: relevance_reasoning
    },
    demographic_rules: demo,
    expertise_domain_parameters: {
      expertise_domain: expertiseDomain,
      recency_decay_rate: rdr,
      CBC_adjustment_factor: cbc,
      domain_reasoning: domain_reasoning
    },
    resources_needed: resources,
    aggregation_weights: aw,
    aggregation_reasoning: aggregation_reasoning,
    // Backward-compatible shorthands
    category: cat,
    mu,
    sigma,
    weights: { w_D: rw.w_demographic, w_G: rw.w_geographic, w_S: rw.w_semantic, w_X: rw.w_social },
    expertise_depth: edDepth,
    expertise_domain: expertiseDomain,
    demographics: demo,
    relevance_reasoning,
    aggregation_reasoning,
    relevance_explanations: {
      reasoning_D: `Demographic relevance: ${relevance_reasoning}`,
      reasoning_G: `Geographic relevance: ${relevance_reasoning}`,
      reasoning_S: "Semantic interest alignment with the issue topic.",
      reasoning_X: "Social graph proximity to the issue submitter."
    },
    isr_explanations: {
      reasoning_R: `Lived relevance: ${relevance_reasoning}`,
      reasoning_E: `Technical competence: ${expertise_reasoning}`,
      reasoning_C: `Contribution track record: ${aggregation_reasoning}`
    }
  };

  return result;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Analyzes a civic issue description and suggests all ISR starting parameters.
 * Called by the analyzeIssue endpoint (pre-fill / early analysis — no title yet).
 *
 * @param {string} description - Issue description text
 * @returns {Promise<object>} Normalized params object
 */
async function suggestIssueParams(description) {
  if (!hasGeminiKey()) {
    return getLocalFallbackParams(description, "");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildIssueAnalyzerPrompt("", description);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(result.response.text());
    return normalizeIssueParams(data);
  } catch (err) {
    console.error("Gemini suggestIssueParams failed, using local fallback:", err);
    return getLocalFallbackParams(description, "");
  }
}

/**
 * Full analysis of issue with both title and description.
 * Called by the checkIssue endpoint (dry-run server-side calculation).
 *
 * @param {string} description - Issue description text
 * @param {string} title - Issue title
 * @param {string} [clarification] - Context clarified by the topic starter ("Derive again")
 * @returns {Promise<object>} Normalized params object
 */
async function checkIssueParams(description, title, clarification) {
  if (!hasGeminiKey()) {
    return getLocalFallbackParams(description, title);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildIssueAnalyzerPrompt(title, description, clarification);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(result.response.text());
    return normalizeIssueParams(data);
  } catch (err) {
    console.error("Gemini checkIssueParams failed, using local fallback:", err);
    return getLocalFallbackParams(description, title);
  }
}

module.exports = {
  hasGeminiKey,
  vectorizeText,
  suggestIssueParams,
  checkIssueParams,
  normalizeIssueParams,
  getLocalFallbackParams,
  OBSOLETE_PARAM_FIELDS
};
