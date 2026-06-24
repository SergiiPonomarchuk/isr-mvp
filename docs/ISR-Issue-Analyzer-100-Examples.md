# ISR Combined Issue Parameters (100‑Examples Anchored)

This document combines the parameters from the following files:
- `ISR-Relevance-Weight-Examples-100.md`
- `ISR-Relevance-Geo-Components-100-Examples.md`
- `ISR-Expertise-Components-100-Examples.md`
- `ISR-Issue-Aggregation-Weight-Examples-100.md`

It is formatted according to the schema defined in `ISR-Issue-Analyzer-Protocol-v1.md` Section 5.

---

## 1–20: Building & Housing

### 1. House entrance lock broken (shared front door)

- **Category**: `building.security.locks`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `high`
- **Domain**: `locksmith.security`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.50$, $w_S=0.05$, $w_X=0.15$
- **Geographic Radius**: $\mu=40.0$, $\sigma=30.0$
- **Demographic Filters**: `lives_in_building = true, age >= 14`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.55$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.10$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.security.locks",
    "scope_type": "building",
    "affected_roles": [
      "tenant",
      "visitor"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "locksmith.security",
    "classification_reasoning": "Category 'building.security.locks' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.5,
    "w_semantic": 0.05,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Residents of the specific building and their close family are directly affected by entrance security; building location and household membership dominate, with social ties as a strong modifier.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "age",
            "op": ">=",
            "value": 14
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, age >= 14."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning": "The problem is centered on the building entrance; residents and people immediately around the doorway are most affected, so \u03bc is set slightly outside the entrance, with \u03c3 making relevance drop quickly beyond the building and its immediate frontage."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.55,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Fixing a shared entrance lock depends mostly on hands-on locksmith practice and availability of the right tools; formal education matters, but less than experience and resources.",
  "expertise_domain_parameters": {
    "expertise_domain": "locksmith.security",
    "contemporary_importance": 0.2,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": null,
    "CBC_adjustment_factor": 0.9,
    "domain_reasoning": "Evolving domain locksmith.security with contemporary importance 0.2 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.1,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "This is a concrete security problem that directly affects residents; their lived impact should dominate decisions. Some weight goes to Contribution because reliable neighbors handling building issues repeatedly should have slightly more influence, while specialized security expertise is useful but not central."
}
```

---

### 2. Elevator outage in apartment building

- **Category**: `building.maintenance.elevator`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.elevator_engineering`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.60$, $w_S=0.05$, $w_X=0.10$
- **Geographic Radius**: $\mu=40.0$, $\sigma=35.0$
- **Demographic Filters**: `lives_in_building = true, floor >= 2`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.45$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.elevator",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.elevator_engineering",
    "classification_reasoning": "Category 'building.maintenance.elevator' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.6,
    "w_semantic": 0.05,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents in that building, especially those with mobility needs, are gated by demographics and building geography; social ties to residents slightly increase relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "floor",
            "op": ">=",
            "value": 2
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, floor >= 2."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 35.0,
    "geo_reasoning": "The impact is effectively limited to the building envelope, so \u03bc is near the building centroid and \u03c3 covers the building footprint plus a small buffer, making relevance fall steeply outside."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.45,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Elevator repair and maintenance require both engineering knowledge and field experience, plus access to specialized tools and parts; experience is slightly dominant, with substantial roles for education and resources.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.elevator_engineering",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain building.maintenance.elevator_engineering with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Direct impact on residents (especially those with mobility issues) is primary, but technical understanding of elevator maintenance and budgeting matters more than in a simple lock case, so Expertise gets a higher share; Contribution still matters for people who consistently help resolve building issues."
}
```

---

### 3. Heating failure in entire building

- **Category**: `building.maintenance.heating`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.heating_engineering`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.60$, $w_S=0.05$, $w_X=0.10$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `lives_in_building = true, stays_nights = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.45$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.15$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.heating",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.heating_engineering",
    "classification_reasoning": "Category 'building.maintenance.heating' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.6,
    "w_semantic": 0.05,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "People living and sleeping in that building are primarily impacted; demographic residence and building location dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "stays_nights",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, stays_nights = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "All units in the building are affected; \u03bc is placed near the building center with \u03c3 large enough to cover the whole building and a narrow perimeter, so nearby neighbors get some but lower geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.45,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Heating systems combine engineering principles with practical diagnostics and access to equipment; experience slightly dominates, but formal training and resources are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.heating_engineering",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain building.maintenance.heating_engineering with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.15,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Everyone who lives in the building and experiences the heating problem should have strong voice; some extra weight for Expertise recognizes those who understand heating systems or building management, with moderate weight for contributors who have a track record dealing with infrastructure."
}
```

---

### 4. Water leak in shared basement

- **Category**: `building.maintenance.water`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.plumbing`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.65$, $w_S=0.05$, $w_X=0.10$
- **Geographic Radius**: $\mu=40.0$, $\sigma=30.0$
- **Demographic Filters**: `lives_in_building = true, has_storage_unit = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.50$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.water",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.plumbing",
    "classification_reasoning": "Category 'building.maintenance.water' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.65,
    "w_semantic": 0.05,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents with stored belongings in the basement and close residents are highly affected; geography at building-level and storage usage matter most.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "has_storage_unit",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, has_storage_unit = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning": "The leak affects storage and structure mainly for this building; \u03bc and \u03c3 are tuned to strongly favor residents of the building and quickly discount those even a short distance away."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.5,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Plumbing leaks are primarily about practical experience plus access to materials and tools; formal education in construction or plumbing helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.plumbing",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 0.95,
    "domain_reasoning": "Evolving domain building.maintenance.plumbing with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "A leak is locally impactful but can be technically complex (plumbing, insurance, responsibilities), so Expertise gets more weight. Relevance still dominates since affected residents must agree the solution works for them; Contribution mildly rewards those who handle building incidents well over time."
}
```

---

### 5. Mold in stairwells and corridors

- **Category**: `building.health.mold`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `building.health.mold_remediation`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `lives_in_building = true, chronic_respiratory = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.health.mold",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [
      "chronically_ill"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "building.health.mold_remediation",
    "classification_reasoning": "Category 'building.health.mold' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Vulnerable health groups and their co\u2011residents plus close proximity are key; demographic and geographic relevance dominate, with some semantic health concern and social ties.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "medical_conditions",
            "op": "array_contains",
            "value": "chronic_respiratory"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, chronic_respiratory = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "Mold primarily harms people regularly inside the building; \u03bc is at the building center and \u03c3 slightly larger to include attached wings or entrances, with geography decaying for adjacent buildings."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Addressing mold involves understanding health risks and building physics as well as practical remediation; education has a higher role here, but hands-on experience and resources are still critical.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.health.mold_remediation",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain building.health.mold_remediation with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Health impact on residents is primary, but mold remediation requires more technical and health-related knowledge, so Expertise is significant. Contribution supports people who consistently push for effective, safe solutions."
}
```

---

### 6. Stairwell lighting outage

- **Category**: `building.security.lighting`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `high`
- **Domain**: `building.maintenance.electrical_basic`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=35.0$, $\sigma=25.0$
- **Demographic Filters**: `lives_in_building = true, regularly_uses_stairs = true`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.50$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.75$, $w_{Exp}=0.05$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.security.lighting",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.electrical_basic",
    "classification_reasoning": "Category 'building.security.lighting' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People physically traversing the stairwell are defined by residence and building location; other dimensions are minor modifiers.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "regularly_uses_stairs",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, regularly_uses_stairs = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 35.0,
    "sigma_distance_meters": 25.0,
    "geo_reasoning": "This is a very localized impact; setting a small \u03bc and \u03c3 ensures that only people who actually pass through the stairwell\u2014a region roughly overlapping the building\u2014get high geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.5,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Fixing lighting is mostly about basic electrical skill and having the right tools and replacement parts; detailed formal education is less critical than experience and access to resources.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.electrical_basic",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 0.95,
    "domain_reasoning": "Evolving domain building.maintenance.electrical_basic with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.75,
    "w_expertise": 0.05,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "This is a simple but important safety issue. Directly affected residents should drive the outcome. Expertise barely matters (any competent contractor can fix it), so more weight goes to Relevance and Contribution (people who reliably report and follow through on small building fixes)."
}
```

---

### 7. Trash overflow in shared bins

- **Category**: `building.maintenance.waste`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.waste_logistics`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.60$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=60.0$, $\sigma=50.0$
- **Demographic Filters**: `lives_in_building = true, uses_shared_bins = true`
- **Expertise Weights**: $w_{Edu}=0.15$, $w_{Exp}=0.45$, $w_{Res}=0.40$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.10$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.waste",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.waste_logistics",
    "classification_reasoning": "Category 'building.maintenance.waste' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.6,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents using those bins and living nearby are mainly impacted; environmental concern and social ties inside the building fine\u2011tune relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "uses_shared_bins",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, uses_shared_bins = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 60.0,
    "sigma_distance_meters": 50.0,
    "geo_reasoning": "Smell and visual impact extend slightly beyond the building footprint; \u03bc is slightly larger than building radius and \u03c3 lets relevance stay moderate for immediate neighbors while decaying for the wider area."
  },
  "expertise_weights": {
    "w_education": 0.15,
    "w_experience": 0.45,
    "w_resources": 0.4
  },
  "expertise_weights_reasoning": "Waste management at building level is more about coordinating services, routines and physical capacity than about specialized education; logistics experience and available resources (storage space, contracts) dominate.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.waste_logistics",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 0.9,
    "domain_reasoning": "Evolving domain building.maintenance.waste_logistics with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "high",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.1,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "The impact is very tangible and local; residents suffering from smell, pests, or inconvenience should dominate. Expertise plays a small role (waste logistics, local rules), while Contribution rewards those who consistently help coordinate with services."
}
```

---

### 8. Residential parking allocation in building lot

- **Category**: `building.transport.parking`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `housing.policy.parking_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=70.0$, $\sigma=60.0$
- **Demographic Filters**: `lives_in_building = true, has_car = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.35$, $w_{Res}=0.40$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.transport.parking",
    "scope_type": "building",
    "affected_roles": [
      "tenant",
      "driver"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "housing.policy.parking_management",
    "classification_reasoning": "Category 'building.transport.parking' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Car\u2011owning residents in that building are gated by demographic and geographic factors; interest in parking/commuting modulates within that group.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "has_car",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, has_car = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 70.0,
    "sigma_distance_meters": 60.0,
    "geo_reasoning": "The parking lot serves building residents and possibly adjacent buildings; \u03bc and \u03c3 are set to cover the lot and nearby buildings, with relevance decreasing for people farther down the street."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.35,
    "w_resources": 0.4
  },
  "expertise_weights_reasoning": "Parking allocation requires some understanding of fairness and basic policy, but is mainly a coordination problem where experience and parking-related resources (spaces, contracts, enforcement) matter.",
  "expertise_domain_parameters": {
    "expertise_domain": "housing.policy.parking_management",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain housing.policy.parking_management with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "high",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Directly affected car owners should lead, but this issue is prone to conflict; Contribution is relatively high to favor people who have been fair and constructive in prior parking/space allocation questions. Expertise (on fairness rules or legal aspects) is also helpful."
}
```

---

### 9. Internal noise from neighbor at night

- **Category**: `building.noise.internal`
- **Scope Type**: `unit`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `building.conflict.noise_mediation`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=30.0$, $\sigma=20.0$
- **Demographic Filters**: `lives_in_building = true, stays_nights = true`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.45$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.75$, $w_{Exp}=0.05$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.noise.internal",
    "scope_type": "unit",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "building.conflict.noise_mediation",
    "classification_reasoning": "Category 'building.noise.internal' at 'unit' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People sleeping in adjacent or nearby units are mostly defined by building proximity; demographic only lightly modulates.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "stays_nights",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, stays_nights = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 30.0,
    "sigma_distance_meters": 20.0,
    "geo_reasoning": "The disturbance is extremely local\u2014mostly units in the same building, especially adjacent floors\u2014so \u03bc and \u03c3 are small to strongly privilege immediate neighbors."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.45,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Noise disputes hinge on conflict mediation experience and access to remedies (legal advice, insulation, building policies) more than on formal education.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.conflict.noise_mediation",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 75,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain building.conflict.noise_mediation with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.75,
    "w_expertise": 0.05,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "This is highly subjective and localized; the people losing sleep should have strong voice. Expertise matters little; Contribution helps identify residents who have dealt with similar conflicts constructively instead of escalating them."
}
```

---

### 10. Scheduling noisy renovations in flats

- **Category**: `building.maintenance.renovation`
- **Scope Type**: `unit`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.renovation_coordination`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.60$, $w_S=0.05$, $w_X=0.10$
- **Geographic Radius**: $\mu=40.0$, $\sigma=30.0$
- **Demographic Filters**: `lives_in_building = true, works_from_home = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.45$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.renovation",
    "scope_type": "unit",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.renovation_coordination",
    "classification_reasoning": "Category 'building.maintenance.renovation' at 'unit' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.6,
    "w_semantic": 0.05,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents on affected floors and those home during the day are dominant; social ties in the building add slight relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "remote_worker"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, works_from_home = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning": "Noise from renovation primarily affects the same building and adjacent units; \u03bc and \u03c3 reflect a building-scale impact with rapid decay beyond."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.45,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Renovation scheduling is mostly practical: coordinating contractors and neighbors, plus some awareness of building rules and law; experience is primary, with support from education and resource access.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.renovation_coordination",
    "contemporary_importance": 0.35,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain building.maintenance.renovation_coordination with contemporary importance 0.35 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Impact on residents (esp. people at home during the day) is primary. Expertise about building rules and noise regulations matters somewhat, and Contribution helps prioritize voices of those who have previously managed shared-schedule agreements well."
}
```

---

### 11. Tenant–landlord policy change (late fees)

- **Category**: `housing.policy.tenancy`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `housing.policy.tenancy_law`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.25$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=500.0$, $\sigma=800.0$
- **Demographic Filters**: `tenant_status = true, lease_in_building = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "housing.policy.tenancy",
    "scope_type": "neighborhood",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "housing.policy.tenancy_law",
    "classification_reasoning": "Category 'housing.policy.tenancy' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.25,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Formal tenant status is the main determinant; building/geographic jurisdiction matters; interest in housing policy is minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "tenant"
          },
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: tenant_status = true, lease_in_building = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 500.0,
    "sigma_distance_meters": 800.0,
    "geo_reasoning": "Policy applies to all tenants of a landlord or within a jurisdiction, not just one building; \u03bc is at the typical center of the landlord\u2019s housing stock or district, with large \u03c3 so that all units across the area get similar geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "This is legal and policy-heavy; education in law, housing policy or finance is important, but lived experience with tenancy issues and relevant resources (legal support) also matter.",
  "expertise_domain_parameters": {
    "expertise_domain": "housing.policy.tenancy_law",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain housing.policy.tenancy_law with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Tenants are directly impacted, but legal/financial expertise is more important here, so Expertise gains weight. Contribution matters because people with a record of responsible engagement on policy issues should be slightly amplified."
}
```

---

### 12. Building pet rules (allow/restrict pets)

- **Category**: `housing.policy.pets`
- **Scope Type**: `unit`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `housing.policy.pet_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.40$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `tenant_or_owner = true, has_pet = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "housing.policy.pets",
    "scope_type": "unit",
    "affected_roles": [
      "tenant",
      "pet_owner"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "housing.policy.pet_management",
    "classification_reasoning": "Category 'housing.policy.pets' at 'unit' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.4,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Pet owners and residents in that building dominate; semantic interest in pets is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "tenant",
              "owner"
            ]
          },
          {
            "field": "has_pet",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: tenant_or_owner = true, has_pet = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "Rules apply to a single building or small complex; \u03bc and \u03c3 cover the complex footprint so residents there have high geographic relevance, with neighbors in nearby buildings only weakly affected."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Experience managing shared living spaces and pets (including allergies, noise, safety) is key; some legal/policy education helps, and resources like enforcement mechanisms or pet facilities matter.",
  "expertise_domain_parameters": {
    "expertise_domain": "housing.policy.pet_management",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain housing.policy.pet_management with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Residents and pet owners/non-owners are strongly affected and should drive the outcome. Expertise (e.g., allergies, noise, animal behavior) is relevant but secondary. Contribution rewards those with a consistent track record of balancing interests in prior shared-space disputes."
}
```

---

### 13. Rooftop access and safety rules

- **Category**: `building.safety.rooftop`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `building.safety.access_control`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=40.0$, $\sigma=30.0$
- **Demographic Filters**: `lives_in_building = true, age >= 14, uses_rooftop = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.safety.rooftop",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "building.safety.access_control",
    "classification_reasoning": "Category 'building.safety.rooftop' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents who can access the roof and their close family are most affected; geography and role as user dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "age",
            "op": ">=",
            "value": 14
          },
          {
            "field": "uses_rooftop",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, age >= 14, uses_rooftop = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning": "Only people using or living in the building are substantially affected; a small \u03bc and \u03c3 keep high geographic relevance within the building volume and immediate surroundings."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Safety rules require understanding building codes and risk (education) plus experience managing access and incidents; resources like safety equipment are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.safety.access_control",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain building.safety.access_control with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Residents using or affected by rooftop access should lead, but the safety and legal aspects push Expertise higher. Contribution remains moderate to value reliable voices."
}
```

---

### 14. Shared laundry room usage rules

- **Category**: `building.maintenance.laundry`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.shared_facilities`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.40$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=35.0$, $\sigma=25.0$
- **Demographic Filters**: `lives_in_building = true, uses_laundry = true`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.45$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.10$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.maintenance.laundry",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.shared_facilities",
    "classification_reasoning": "Category 'building.maintenance.laundry' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.4,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents using the laundry facilities are gated by demographics; building\u2011level geography and interest in shared resources modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "uses_laundry",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, uses_laundry = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 35.0,
    "sigma_distance_meters": 25.0,
    "geo_reasoning": "The effect is confined to users of one shared facility; \u03bc and \u03c3 define a tight area around the building so that only residents and very close neighbors get notable geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.45,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "This is mainly a coordination and etiquette issue; experience managing shared facilities and available resources (machines, payment systems) matter more than formal education.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.shared_facilities",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 75,
    "CBC_adjustment_factor": 0.95,
    "domain_reasoning": "Evolving domain building.maintenance.shared_facilities with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.1,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "This is an everyday coordination problem; directly impacted users should dominate. Expertise is low (basic fairness and scheduling). Contribution is relatively high to surface people who historically help coordinate shared resources."
}
```

---

### 15. Storage lockers allocation / pricing

- **Category**: `housing.policy.storage`
- **Scope Type**: `unit`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `housing.policy.resource_allocation`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.35$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=60.0$, $\sigma=50.0$
- **Demographic Filters**: `tenant_or_owner = true, wants_storage = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "housing.policy.storage",
    "scope_type": "unit",
    "affected_roles": [
      "tenant",
      "visitor"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "housing.policy.resource_allocation",
    "classification_reasoning": "Category 'housing.policy.storage' at 'unit' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.35,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents with or seeking lockers are primary; building membership and demand drive demographic relevance, with some semantic interest and social ties.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "tenant",
              "owner"
            ]
          },
          {
            "field": "wants_storage",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: tenant_or_owner = true, wants_storage = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 60.0,
    "sigma_distance_meters": 50.0,
    "geo_reasoning": "Lockers are usually in basements or nearby facilities serving several buildings; \u03bc and \u03c3 are large enough to cover the immediate complex but not the wider neighborhood."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Allocation and pricing involve basic economic/policy understanding, practical management of limited capacity, and the physical storage resources; experience is slightly primary but all three dimensions matter.",
  "expertise_domain_parameters": {
    "expertise_domain": "housing.policy.resource_allocation",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain housing.policy.resource_allocation with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Those wanting or using lockers are highly relevant, but this is also about fair allocation and cost-sharing, so Expertise (on policy/fairness) and Contribution (people who have managed building resources well) both matter."
}
```

---

### 16. Moving rules (elevator booking, hours)

- **Category**: `building.policy.moving`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `building.maintenance.move_coordination`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.45$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=40.0$, $\sigma=30.0$
- **Demographic Filters**: `tenant_or_owner = true, planning_move_within_6m = true`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.45$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.policy.moving",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "building.maintenance.move_coordination",
    "classification_reasoning": "Category 'building.policy.moving' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.45,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents planning moves are strongly affected; building geography and interest in scheduling rules matter.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "tenant",
              "owner"
            ]
          },
          {
            "field": "moving_plan",
            "op": "==",
            "value": "within_6m"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: tenant_or_owner = true, planning_move_within_6m = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 40.0,
    "sigma_distance_meters": 30.0,
    "geo_reasoning": "The rules matter only to residents and movers using the specific building; geographic relevance is tightly focused on the building footprint."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.45,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Moving logistics are dominated by coordination experience and access to time slots, equipment and staff; formal education is less critical.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.maintenance.move_coordination",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 75,
    "CBC_adjustment_factor": 0.95,
    "domain_reasoning": "Evolving domain building.maintenance.move_coordination with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Impact on those moving and those disturbed by moves is primary. Expertise about building logistics has some value, but Contribution is higher to empower residents who consistently coordinate moves smoothly."
}
```

---

### 17. Guest access policy (intercom/keys)

- **Category**: `building.security.guest_access`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `high`
- **Domain**: `building.security.access_policies`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `lives_in_building = true, has_frequent_visitors = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.security.guest_access",
    "scope_type": "building",
    "affected_roles": [
      "tenant",
      "visitor"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "building.security.access_policies",
    "classification_reasoning": "Category 'building.security.guest_access' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents receiving guests are gated by demographics and geography; social ties and interest in security slightly modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "has_visitors",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, has_frequent_visitors = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "While the decisions are building-specific, they can slightly affect neighboring entrances; \u03bc and \u03c3 give high relevance to the building and limited spillover along the immediate frontage."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Security and privacy principles (education), practical experience in managing guest flows, and resources like intercom systems jointly matter; none can be ignored.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.security.access_policies",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain building.security.access_policies with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Residents\u2019 daily experience with guests and security is central. Expertise about security and privacy is non-trivial; Contribution rewards those with a track record in security-related issues."
}
```

---

### 18. Balcony safety and renovation rules

- **Category**: `building.safety.balcony`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `building.safety.structural`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.40$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `lives_in_building = true, has_balcony = true, children_age <= 10`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.safety.balcony",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "building.safety.structural",
    "classification_reasoning": "Category 'building.safety.balcony' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.4,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Households with balconies and vulnerable members are primary; residence and location dominate with modest semantic and social adjustments.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "has_balcony",
            "op": "==",
            "value": true
          },
          {
            "field": "children_age",
            "op": "<=",
            "value": 10
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, has_balcony = true, children_age <= 10."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "Risk and aesthetic impact are mostly within and directly around one building; \u03bc and \u03c3 concentrate relevance on residents and close neighbors who see or use the balconies."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Structural safety and regulations give formal education a bigger role, but builder/engineering experience is equally important; resources like scaffolding and safety gear matter but less.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.safety.structural",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain building.safety.structural with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Residents are affected but safety/structural expertise is important (load, rails, regulations). Thus Expertise has a higher share; Contribution is moderate."
}
```

---

### 19. Smoking policy in shared areas

- **Category**: `building.health.smoking`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `building.health.smoke_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=60.0$, $\sigma=50.0$
- **Demographic Filters**: `lives_in_building = true, non_smoker = true, chronic_respiratory = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.health.smoking",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [
      "chronically_ill"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "building.health.smoke_policy",
    "classification_reasoning": "Category 'building.health.smoking' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Non\u2011smokers and vulnerable residents in that building are most affected; geography and demographics dominate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "non_smoker",
            "op": "==",
            "value": true
          },
          {
            "field": "medical_conditions",
            "op": "array_contains",
            "value": "chronic_respiratory"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, non_smoker = true, chronic_respiratory = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 60.0,
    "sigma_distance_meters": 50.0,
    "geo_reasoning": "Smoke and odour can spread slightly beyond entrances and windows; \u03bc and \u03c3 are tuned to keep high relevance for the building and mild relevance for the nearest surrounding buildings."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Health science and legal/policy education matter, but lived experience in shared environments and access to enforcement/mitigation resources are equally important.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.health.smoke_policy",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain building.health.smoke_policy with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Health and comfort of residents (especially vulnerable) is primary. Expertise in health and legal aspects matters but is secondary. Contribution recognizes those who have helped mediate similar conflicts."
}
```

---

### 20. Emergency evacuation plan for building

- **Category**: `building.safety.evacuation`
- **Scope Type**: `building`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `building.safety.emergency_planning`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.40$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=50.0$, $\sigma=40.0$
- **Demographic Filters**: `lives_in_building = true, mobility_limitation = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "building.safety.evacuation",
    "scope_type": "building",
    "affected_roles": [
      "tenant"
    ],
    "affected_vulnerabilities": [
      "disabled"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "building.safety.emergency_planning",
    "classification_reasoning": "Category 'building.safety.evacuation' at 'building' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.4,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "All residents are critical stakeholders with building location gating; safety interest and social ties inside building adjust relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "building_id",
            "op": "==",
            "value_source": "issue.building_id"
          },
          {
            "field": "mobility_limitation",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_building = true, mobility_limitation = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50.0,
    "sigma_distance_meters": 40.0,
    "geo_reasoning": "The plan applies to occupants of one building; \u03bc and \u03c3 encompass the building and immediate assembly area, with relevance dropping quickly outside this safety perimeter."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Safety planning combines formal knowledge (fire codes, risk management) and practical exercise experience; resources like signage and equipment matter but are not the main driver of expertise.",
  "expertise_domain_parameters": {
    "expertise_domain": "building.safety.emergency_planning",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain building.safety.emergency_planning with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Everyone living in the building should have strong voice, but evacuation planning is highly technical and safety-critical, so Expertise is significantly weighted; Contribution rewards those who consistently participate in preparedness activities."
}
```

---

## 21–40: Local Infrastructure & Public Spaces

### 21. Pothole on local street

- **Category**: `infrastructure.transport.streets`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `infrastructure.maintenance.roadworks`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=150.0$, $\sigma=120.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, uses_car_or_bike = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.45$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.10$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.streets",
    "scope_type": "street_segment",
    "affected_roles": [
      "driver",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.maintenance.roadworks",
    "classification_reasoning": "Category 'infrastructure.transport.streets' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Road users and nearby residents are primarily defined by geography; driving/cycling status adds demographic weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "driver",
              "cyclist"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, uses_car_or_bike = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 150.0,
    "sigma_distance_meters": 120.0,
    "geo_reasoning": "The pothole affects vehicles on a short street segment; \u03bc aligns with the segment center and \u03c3 covers nearby residents and typical turning radii, with relevance fading beyond a few hundred meters."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.45,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Road repair is mostly about practical construction experience and equipment; civil engineering education helps but is slightly less central than field experience and resources.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.maintenance.roadworks",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain infrastructure.maintenance.roadworks with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.1,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Direct users of the street (drivers, cyclists, nearby residents) should dominate. Expertise in road maintenance is modestly helpful; Contribution rewards people with a track record of dealing constructively with infrastructure reports."
}
```

---

### 22. Crosswalk / traffic light timing

- **Category**: `infrastructure.transport.safety`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `transportation.engineering.signal_timing`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=200.0$, $\sigma=150.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, walker_or_driver = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.safety",
    "scope_type": "street_segment",
    "affected_roles": [
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "transportation.engineering.signal_timing",
    "classification_reasoning": "Category 'infrastructure.transport.safety' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People who cross or drive through that intersection regularly are geographically gated; mode of transport demography is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "walker",
              "driver"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, walker_or_driver = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 200.0,
    "sigma_distance_meters": 150.0,
    "geo_reasoning": "People who regularly pass this intersection\u2014nearby residents and commuters\u2014are most affected; \u03bc and \u03c3 are set to cover a few blocks around the junction."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Traffic engineering and safety research (education) are important; practical planning and operations experience also matter, along with access to relevant traffic data and control systems.",
  "expertise_domain_parameters": {
    "expertise_domain": "transportation.engineering.signal_timing",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain transportation.engineering.signal_timing with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Affected pedestrians and drivers are key, but traffic engineering and safety expertise are quite important, so Expertise is relatively high. Contribution is moderate."
}
```

---

### 23. New bike lane on major street

- **Category**: `infrastructure.transport.bike`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `urban_planning.cycling_infrastructure`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.50$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, frequent_cyclist = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.bike",
    "scope_type": "neighborhood",
    "affected_roles": [
      "cyclist",
      "driver",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.cycling_infrastructure",
    "classification_reasoning": "Category 'infrastructure.transport.bike' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.5,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Local residents and frequent cyclists are core; geography and semantic \"cyclist identity\" jointly dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "cyclist"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, frequent_cyclist = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "The lane serves a corridor rather than a single point; \u03bc approximates a mid-point in the affected stretch, and \u03c3 is wide enough to keep relevance high for people within a few blocks along the route."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Urban planning/transport education and on-the-ground cycling/road design experience are both key; resources like design tools and implementation budgets are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.cycling_infrastructure",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain urban_planning.cycling_infrastructure with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Cyclists and nearby residents are directly affected. Expertise in road design and cycling safety is relevant; Contribution gives weight to those who consistently engage in mobility planning."
}
```

---

### 24. Bus route change / stop removal

- **Category**: `infrastructure.transport.transit`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `medium`
- **Domain**: `transportation.planning.transit`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.40$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `transit_user = true, lives_or_works_near_route = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.transit",
    "scope_type": "neighborhood",
    "affected_roles": [
      "commuter",
      "passenger",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "transportation.planning.transit",
    "classification_reasoning": "Category 'infrastructure.transport.transit' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.4,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Transit dependency and living/working near the route are gating; interest in transit is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "transit_user"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: transit_user = true, lives_or_works_near_route = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "A route change affects riders along a long path; \u03bc is set near the route\u2019s central area with a large \u03c3 so that neighborhoods within roughly 1\u20132 km maintain significant geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Public transport planning needs education in transport and social equity plus experience with routing and demand; resources like ridership data and vehicles are secondary in expertise assessment.",
  "expertise_domain_parameters": {
    "expertise_domain": "transportation.planning.transit",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain transportation.planning.transit with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Transit-dependent users should strongly influence decisions. Expertise in transport planning and access equity is meaningful; Contribution is moderate for people who regularly participate in such discussions."
}
```

---

### 25. Sidewalk snow/ice removal

- **Category**: `infrastructure.maintenance.winter`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `infrastructure.maintenance.winter_ops`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.70$, $w_S=0.05$, $w_X=0.00$
- **Geographic Radius**: $\mu=120.0$, $\sigma=100.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, walker = true, mobility_limitation = true`
- **Expertise Weights**: $w_{Edu}=0.15$, $w_{Exp}=0.45$, $w_{Res}=0.40$
- **Aggregation Weights**: $w_{Rel}=0.75$, $w_{Exp}=0.05$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.maintenance.winter",
    "scope_type": "street_segment",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "disabled"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.maintenance.winter_ops",
    "classification_reasoning": "Category 'infrastructure.maintenance.winter' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.0
  },
  "relevance_weights_reasoning": "Geography for pedestrians, especially vulnerable groups, dominates; other dimensions are negligible.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "walker"
          },
          {
            "field": "mobility_limitation",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, walker = true, mobility_limitation = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 120.0,
    "sigma_distance_meters": 100.0,
    "geo_reasoning": "Pedestrians using specific blocks are most affected; \u03bc and \u03c3 cover a cluster of adjacent blocks with relevance decaying for those farther away."
  },
  "expertise_weights": {
    "w_education": 0.15,
    "w_experience": 0.45,
    "w_resources": 0.4
  },
  "expertise_weights_reasoning": "Winter maintenance is highly practical and resource-dependent (equipment, salt, staff), with minimal requirement for formal education.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.maintenance.winter_ops",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 0.9,
    "domain_reasoning": "Evolving domain infrastructure.maintenance.winter_ops with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "high",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.75,
    "w_expertise": 0.05,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Those at risk of slipping (pedestrians, mobility-limited) should heavily drive the decision; technical expertise is simple (clear the ice). Contribution highlights citizens who regularly coordinate snow/ice responses."
}
```

---

### 26. Street lighting outage on segment

- **Category**: `infrastructure.public.lighting`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `infrastructure.maintenance.electrical_public`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=150.0$, $\sigma=120.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, walks_after_dark = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.45$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.10$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.lighting",
    "scope_type": "street_segment",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.maintenance.electrical_public",
    "classification_reasoning": "Category 'infrastructure.public.lighting' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People living/working or walking under that segment are dominantly gated by geography; demographic factors only slightly modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "behavior",
            "op": "array_contains",
            "value": "walks_after_dark"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, walks_after_dark = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 150.0,
    "sigma_distance_meters": 120.0,
    "geo_reasoning": "The outage creates safety issues along a defined street section; \u03bc is on that segment and \u03c3 covers nearby homes and walking routes, fading beyond a few hundred meters."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.45,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Electrical maintenance experience and access to tools/lift trucks dominate; engineering education helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.maintenance.electrical_public",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 0.95,
    "domain_reasoning": "Evolving domain infrastructure.maintenance.electrical_public with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.1,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Nearby users exposed to darkness should dominate. Expertise is basic (electrical/public lighting) and secondary; Contribution supports those consistently reporting and tracking such issues."
}
```

---

### 27. Construction noise from roadworks

- **Category**: `infrastructure.public.noise`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `infrastructure.construction.noise_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.10$, $w_G=0.85$, $w_S=0.05$, $w_X=0.00$
- **Geographic Radius**: $\mu=200.0$, $\sigma=180.0$
- **Demographic Filters**: `lives_or_works_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.75$, $w_{Exp}=0.05$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.noise",
    "scope_type": "street_segment",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.construction.noise_management",
    "classification_reasoning": "Category 'infrastructure.public.noise' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.1,
    "w_geographic": 0.85,
    "w_semantic": 0.05,
    "w_social": 0.0
  },
  "relevance_weights_reasoning": "Impact is almost purely about being nearby; demographic and social factors are minimal.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 200.0,
    "sigma_distance_meters": 180.0,
    "geo_reasoning": "Noise extends over several blocks; \u03bc and \u03c3 are set so that residents and workers within roughly 200\u2013400 m get high geographic relevance and those beyond experience only mild impact."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Knowledge of regulations and noise mitigation (education) plus construction scheduling experience and access to quieter equipment or barriers all matter roughly comparably.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.construction.noise_management",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain infrastructure.construction.noise_management with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.75,
    "w_expertise": 0.05,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "People exposed to noise are the main stakeholders. Technical expertise is minor; Contribution favors those who help negotiate realistic compromises rather than extreme positions."
}
```

---

### 28. Illegal dumping / roadside trash spot

- **Category**: `infrastructure.public.cleanliness`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `environment.cleanliness.illegal_dumping`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.60$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=150.0$, $\sigma=130.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, uses_area_for_walks = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.cleanliness",
    "scope_type": "street_segment",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "environment.cleanliness.illegal_dumping",
    "classification_reasoning": "Category 'infrastructure.public.cleanliness' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.6,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Nearby residents and regular area users are affected; environmental concern provides semantic adjustment.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "behavior",
            "op": "array_contains",
            "value": "uses_area_for_walks"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, uses_area_for_walks = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 150.0,
    "sigma_distance_meters": 130.0,
    "geo_reasoning": "Visual and environmental nuisance is concentrated around the dumping site; \u03bc and \u03c3 span the immediate surroundings and approach side streets."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Environmental policy knowledge is useful, but experience organizing cleanups/enforcement and access to cleanup resources/trucks are more central.",
  "expertise_domain_parameters": {
    "expertise_domain": "environment.cleanliness.illegal_dumping",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain environment.cleanliness.illegal_dumping with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "high",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Local users and residents should have the strongest voice. Some legal/environmental expertise matters (who is responsible, what solutions are effective), and contribution helps highlight those who repeatedly coordinate clean-up or reporting."
}
```

---

### 29. Water supply disruption in blocks

- **Category**: `infrastructure.utilities.water`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `utilities.water_network.operations`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.60$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `utility_customer_in_zone = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.45$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.20$, $w_{Con}=0.10$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.utilities.water",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "utilities.water_network.operations",
    "classification_reasoning": "Category 'infrastructure.utilities.water' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.6,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Households and businesses in the affected supply zone are gated by demographic and geographic factors; other factors are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "utility_customer",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: utility_customer_in_zone = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "The disruption typically follows infrastructure zones covering several blocks; \u03bc and \u03c3 approximate the center and spread of the affected network segment."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.45,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Engineering and network-operations education plus extensive field experience are key for diagnosing water issues; physical resources (equipment) matter but are less central in deciding.",
  "expertise_domain_parameters": {
    "expertise_domain": "utilities.water_network.operations",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain utilities.water_network.operations with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "medium",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.2,
    "w_contribution": 0.1
  },
  "aggregation_reasoning": "Households and businesses losing water are directly affected, so Relevance is high. Expertise in water infrastructure and emergency management is important; Contribution plays a smaller role."
}
```

---

### 30. Repeated electricity outages neighborhood

- **Category**: `infrastructure.utilities.electricity`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `utilities.electric_grid.reliability`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.70$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=600.0$
- **Demographic Filters**: `lives_or_works_in_zone = true, critical_devices = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.45$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.25$, $w_{Con}=0.10$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.utilities.electricity",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "utilities.electric_grid.reliability",
    "classification_reasoning": "Category 'infrastructure.utilities.electricity' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.7,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Physical connection to the grid area dominates; those with critical electric devices are highlighted demographically.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "equipment",
            "op": "array_contains",
            "value": "critical_devices"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_in_zone = true, critical_devices = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 600.0,
    "geo_reasoning": "Outages usually cluster by feeder or substation; \u03bc and \u03c3 cover a neighborhood\u2011scale radius so that all households on the problematic circuit get high geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.45,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Grid reliability requires strong electrical engineering and operations experience; specialized equipment/resources are necessary but less decisive in weighting expertise.",
  "expertise_domain_parameters": {
    "expertise_domain": "utilities.electric_grid.reliability",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain utilities.electric_grid.reliability with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.25,
    "w_contribution": 0.1
  },
  "aggregation_reasoning": "Affected users should lead, but grid reliability and technical constraints require significant Expertise. Contribution is smaller but still rewards engaged residents."
}
```

---

### 31. Internet outage for local ISP segment

- **Category**: `infrastructure.utilities.internet`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `utilities.networking.isp_operations`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.60$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=1000.0$, $\sigma=800.0$
- **Demographic Filters**: `isp_customer_in_zone = true, remote_worker_or_student = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.45$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.utilities.internet",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "utilities.networking.isp_operations",
    "classification_reasoning": "Category 'infrastructure.utilities.internet' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.6,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "ISP customers in the segment are gated; heavy online workers/students gain semantic weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "isp_customer",
            "op": "==",
            "value": true
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "remote_worker",
              "student"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: isp_customer_in_zone = true, remote_worker_or_student = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1000.0,
    "sigma_distance_meters": 800.0,
    "geo_reasoning": "ISP segments often map to large blocks or districts; \u03bc and \u03c3 are tuned to keep relevance high across the outage zone and moderate for adjacent areas."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.45,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Network engineering education and ops experience dominate; resources like monitoring systems and hardware access are secondary in weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "utilities.networking.isp_operations",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain utilities.networking.isp_operations with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Customers depending on connectivity (remote workers, students) deserve high weight. Technical expertise about networks has a real role; Contribution recognizes those organizing collective escalation or mitigation."
}
```

---

### 32. Broken playground equipment in square

- **Category**: `infrastructure.public.playground`
- **Scope Type**: `street_segment`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `infrastructure.public.playground_safety`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.50$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=250.0$, $\sigma=200.0$
- **Demographic Filters**: `lives_within_radius = true, has_children_age <= 12 = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.45$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.15$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.playground",
    "scope_type": "street_segment",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.public.playground_safety",
    "classification_reasoning": "Category 'infrastructure.public.playground' at 'street_segment' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.5,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Families with children nearby are core; geography and child demography dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "has_children_under_12",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, has_children_age <= 12 = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 250.0,
    "sigma_distance_meters": 200.0,
    "geo_reasoning": "Families living within a short walk of the playground are most affected; \u03bc is set at the square and \u03c3 covers the surrounding few blocks."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.45,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Child safety guidelines and design standards (education) plus maintenance experience both matter; resources like maintenance staff and parts are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.public.playground_safety",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain infrastructure.public.playground_safety with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.15,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Families whose children use the playground should dominate. Expertise in playground safety and maintenance is helpful; Contribution rewards those who previously helped with repairs or advocacy."
}
```

---

### 33. Speed limit / traffic calming on street

- **Category**: `infrastructure.transport.speed`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `medium`
- **Domain**: `transportation.safety.traffic_calming`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.55$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `lives_within_radius = true, driver_or_parent_on_street = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.speed",
    "scope_type": "neighborhood",
    "affected_roles": [
      "driver",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "transportation.safety.traffic_calming",
    "classification_reasoning": "Category 'infrastructure.transport.speed' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.55,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Residents/drivers locally plus parents whose kids cross the street are affected; geographic and demographic relevance moderate, with some semantic safety concern.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "driver",
              "parent"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, driver_or_parent_on_street = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "The impact is felt along a corridor; \u03bc and \u03c3 cover a length of street and neighboring blocks where residents and frequent drivers experience the change."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Traffic safety and planning education is important; experience implementing calming measures also matters; resources like enforcement and design funds are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "transportation.safety.traffic_calming",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain transportation.safety.traffic_calming with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Residents, drivers and parents whose children cross the street are key; traffic safety expertise is quite important so Expertise is high; Contribution remains moderate."
}
```

---

### 34. Parking regulation on busy street

- **Category**: `infrastructure.transport.parking_rules`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `urban_planning.parking_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.50$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `business_owner_or_resident_on_street = true, has_car = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.parking_rules",
    "scope_type": "neighborhood",
    "affected_roles": [
      "driver",
      "commuter",
      "passenger",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.parking_policy",
    "classification_reasoning": "Category 'infrastructure.transport.parking_rules' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.5,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Car\u2011using residents and nearby businesses are primary; geography and role dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "business_owner",
              "resident"
            ]
          },
          {
            "field": "has_car",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: business_owner_or_resident_on_street = true, has_car = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Residents and businesses directly fronting or near the regulated street are most affected; \u03bc and \u03c3 capture the dense cluster of impacted frontages."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Urban policy and economic education plus experience managing parking systems both matter; resources like enforcement capacity are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.parking_policy",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain urban_planning.parking_policy with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Directly affected drivers, residents and businesses should lead. Expertise on parking policy and urban economics matters, while Contribution rewards those who've engaged constructively in past parking debates."
}
```

---

### 35. Public toilet installation / closure

- **Category**: `infrastructure.public.sanitation`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `public_health.sanitation.facilities`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.50$, $w_S=0.20$, $w_X=0.05$
- **Geographic Radius**: $\mu=300.0$, $\sigma=250.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, uses_area_regularly = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.sanitation",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "public_health.sanitation.facilities",
    "classification_reasoning": "Category 'infrastructure.public.sanitation' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.5,
    "w_semantic": 0.2,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Regular users of that public area are gated by geography and usage demography; interest in amenities adds semantic weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "behavior",
            "op": "array_contains",
            "value": "uses_area_regularly"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, uses_area_regularly = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 300.0,
    "sigma_distance_meters": 250.0,
    "geo_reasoning": "People spending time within a short walking radius use the facility; \u03bc is at the toilet location and \u03c3 covers typical pedestrian catchment."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Sanitation/health education, operational experience, and access to space and funding are all important and fairly balanced.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_health.sanitation.facilities",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain public_health.sanitation.facilities with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Regular users of the area have strong relevance; Expertise about hygiene, vulnerable populations, and maintenance costs matters. Contribution supports those who consistently engage on public space accessibility."
}
```

---

### 36. Bridge or underpass safety (lighting, CCTV)

- **Category**: `infrastructure.safety.bridge_underpass`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `infrastructure.safety.personal_security`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.60$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=300.0$, $\sigma=250.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, crosses_location_often = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.safety.bridge_underpass",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "infrastructure.safety.personal_security",
    "classification_reasoning": "Category 'infrastructure.safety.bridge_underpass' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.6,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People crossing or living near are geographically gated; demographic factors like frequent use modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "behavior",
            "op": "array_contains",
            "value": "crosses_location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, crosses_location_often = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 300.0,
    "sigma_distance_meters": 250.0,
    "geo_reasoning": "Risk concentrates on and near this structure; \u03bc and \u03c3 define a zone where pedestrians and drivers regularly use it, roughly a few blocks around."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Safety/security engineering education and field experience both matter; resources like cameras and lighting gear are supporting.",
  "expertise_domain_parameters": {
    "expertise_domain": "infrastructure.safety.personal_security",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain infrastructure.safety.personal_security with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People who use or live near the location should drive decisions; security and safety expertise is important; Contribution is moderate."
}
```

---

### 37. Bike parking racks near station

- **Category**: `infrastructure.transport.bike_parking`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `urban_planning.cycling_parking`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.45$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=300.0$, $\sigma=250.0$
- **Demographic Filters**: `frequent_train_user = true, cyclist = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.bike_parking",
    "scope_type": "neighborhood",
    "affected_roles": [
      "cyclist",
      "driver",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.cycling_parking",
    "classification_reasoning": "Category 'infrastructure.transport.bike_parking' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.45,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Cyclists who use the station are affected by both location and usage; semantic \u201ccycling + transit\u201d interest is strong.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "train_user"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "cyclist"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: frequent_train_user = true, cyclist = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 300.0,
    "sigma_distance_meters": 250.0,
    "geo_reasoning": "Cyclists within a walking or biking catchment of the station are most affected; \u03bc is at the station and \u03c3 covers surrounding neighborhoods where people start or end trips."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Planning knowledge and practical experience with station design both matter; resources like space, funding and racks are relevant for implementation.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.cycling_parking",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain urban_planning.cycling_parking with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Cyclists and station users have high relevance. Expertise in transport integration and design matters somewhat; Contribution highlights consistent mobility advocates."
}
```

---

### 38. Car‑free day on city center streets

- **Category**: `infrastructure.transport.car_free`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `urban_planning.mobility_events`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.50$, $w_S=0.20$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1200.0$
- **Demographic Filters**: `lives_or_works_in_center = true, driver_or_shop_owner = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.transport.car_free",
    "scope_type": "district",
    "affected_roles": [
      "driver",
      "pedestrian"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.mobility_events",
    "classification_reasoning": "Category 'infrastructure.transport.car_free' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.5,
    "w_semantic": 0.2,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Residents, workers, businesses and drivers in the center are gated by demographic and geographic factors; interest in mobility/air quality modulates.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "driver",
              "shop_owner"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_in_center = true, driver_or_shop_owner = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1200.0,
    "geo_reasoning": "The event affects the broader city center; \u03bc is set near the downtown core and \u03c3 allows relevance to be high across the inner city and moderate for more distant neighborhoods."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Policy and urban planning education, event/logistics experience, and access to enforcement and communication resources are all significant and need a balanced weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.mobility_events",
    "contemporary_importance": 0.65,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain urban_planning.mobility_events with contemporary importance 0.65 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Residents, businesses and drivers are all affected, but this has broader environmental and economic implications, so Expertise is higher. Contribution supports those who have prior constructive participation in related trade-offs."
}
```

---

### 39. New pedestrian zone design

- **Category**: `infrastructure.public.pedestrian_zone`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `urban_planning.public_space_design`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.45$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=600.0$
- **Demographic Filters**: `lives_or_works_in_zone = true, frequent_pedestrian = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.public.pedestrian_zone",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.public_space_design",
    "classification_reasoning": "Category 'infrastructure.public.pedestrian_zone' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.45,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Local residents and frequent walkers are core; geography and semantic enjoyment/use of the space both matter.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "pedestrian"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_in_zone = true, frequent_pedestrian = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 600.0,
    "geo_reasoning": "People living or working within walking distance of the zone are most involved; \u03bc and \u03c3 cover the central area and nearby neighborhoods."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Design and planning education is critical; practical experience implementing zones is important; resources like funding and design tools play a secondary role.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.public_space_design",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain urban_planning.public_space_design with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Nearby residents and frequent walkers are affected, but design, accessibility, and commerce considerations raise the value of Expertise. Contribution helps balance users who have proven collaborative in previous public space issues."
}
```

---

### 40. Local waste collection schedule changes

- **Category**: `infrastructure.maintenance.waste_schedule`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `medium`
- **Domain**: `public_services.waste_collection`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.50$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `household_in_collection_area = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.45$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.maintenance.waste_schedule",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "medium",
    "digital_or_physical": "physical",
    "expertise_domain": "public_services.waste_collection",
    "classification_reasoning": "Category 'infrastructure.maintenance.waste_schedule' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'medium'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.5,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Households in the affected collection route are gated by demographic and geographic factors; semantic interest in waste management is minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "in_collection_area",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: household_in_collection_area = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Schedule changes affect a waste collection district (several blocks); \u03bc and \u03c3 encompass that district, with relevance decaying for people outside the route."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.45,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Operational experience and availability of trucks/staff dominate; some education in logistics or public administration helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_services.waste_collection",
    "contemporary_importance": 0.4,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain public_services.waste_collection with contemporary importance 0.4 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "physical_equipment",
      "importance_level": "high",
      "explanation": "Specific tools, replacement parts, and maintenance equipment are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Households in the collection area are directly affected and should strongly influence timing. Expertise about logistics and noise is secondary; Contribution rewards those who reliably help coordinate changes."
}
```

---

## 41–60: Community Support & Mutual Aid

### 41. Local clinic opening hours

- **Category**: `health.access.clinic`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `healthcare.management.primary_care`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.50$, $w_G=0.40$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `registered_patient = true, lives_within_service_radius = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.access.clinic",
    "scope_type": "neighborhood",
    "affected_roles": [
      "patient"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "healthcare.management.primary_care",
    "classification_reasoning": "Category 'health.access.clinic' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.5,
    "w_geographic": 0.4,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Patients in the catchment area are primary; health conditions and proximity dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "patient"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: registered_patient = true, lives_within_service_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Primary care clinics draw patients from a neighborhood catchment; \u03bc and \u03c3 define a radius where most registered patients live, around 0.5\u20131.5 km."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Medical/public health education and clinic management experience both matter; resources like staffing and facilities are important but secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "healthcare.management.primary_care",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain healthcare.management.primary_care with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Patients who use the clinic are central, but medical/logistical expertise about staffing and coverage is significant. Contribution supports community members who have constructively engaged with the clinic before."
}
```

---

### 42. Vaccination / screening campaign

- **Category**: `health.access.prevention`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `public_health.prevention_campaigns`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.50$, $w_G=0.35$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1500.0$
- **Demographic Filters**: `at_risk_group = true, lives_in_campaign_area = true`
- **Expertise Weights**: $w_{Edu}=0.45$, $w_{Exp}=0.35$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.access.prevention",
    "scope_type": "district",
    "affected_roles": [
      "patient"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "public_health.prevention_campaigns",
    "classification_reasoning": "Category 'health.access.prevention' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.5,
    "w_geographic": 0.35,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Belonging to risk groups is gating; geography of the campaign area matters; interest and social ties are small modifiers.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "vulnerabilities",
            "op": "array_contains",
            "value": "at_risk"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: at_risk_group = true, lives_in_campaign_area = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1500.0,
    "geo_reasoning": "Campaigns often target an entire district or city; \u03bc and \u03c3 are set to maintain fairly uniform relevance across the administrative area."
  },
  "expertise_weights": {
    "w_education": 0.45,
    "w_experience": 0.35,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Strong medical and epidemiological education is crucial; experience running campaigns is also important; resources (vaccines, sites) matter more for implementation than for defining expertise.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_health.prevention_campaigns",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.15,
    "domain_reasoning": "Evolving domain public_health.prevention_campaigns with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "medium",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "At-risk groups are highly relevant, but medical and epidemiological expertise is critical to design safe, effective campaigns, so Expertise is high; Contribution remains moderate."
}
```

---

### 43. Childcare services availability (slots/hours)

- **Category**: `health.access.childcare`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `social_services.childcare_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.70$, $w_G=0.25$, $w_S=0.03$, $w_X=0.02$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `has_children_age_0_6 = true, lives_within_service_radius = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.15$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.access.childcare",
    "scope_type": "neighborhood",
    "affected_roles": [
      "parent",
      "child"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "social_services.childcare_management",
    "classification_reasoning": "Category 'health.access.childcare' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.7,
    "w_geographic": 0.25,
    "w_semantic": 0.03,
    "w_social": 0.02
  },
  "relevance_weights_reasoning": "Parents/guardians of young children in the catchment zone dominate; semantic interest and social graph are intentionally very low.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "has_children_under_6",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: has_children_age_0_6 = true, lives_within_service_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Families within a short commuting radius of a kindergarten or childcare center are most affected; \u03bc and \u03c3 span that local catchment."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Early childhood education/administration education and practical management experience are both important; resources like staff and facilities are also significant but slightly secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_services.childcare_management",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain social_services.childcare_management with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.15,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Parents/guardians of young children are directly impacted and should strongly shape outcomes. Expertise in early childhood education and operations matters but is secondary; Contribution highlights parents with a record of cooperative engagement."
}
```

---

### 44. Elderly day‑care / respite services

- **Category**: `health.access.elderly_care`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `social_services.elderly_care`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.70$, $w_G=0.25$, $w_S=0.03$, $w_X=0.02$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `age >= 65, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.15$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.access.elderly_care",
    "scope_type": "neighborhood",
    "affected_roles": [
      "elderly",
      "caregiver"
    ],
    "affected_vulnerabilities": [
      "elderly"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "social_services.elderly_care",
    "classification_reasoning": "Category 'health.access.elderly_care' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.7,
    "w_geographic": 0.25,
    "w_semantic": 0.03,
    "w_social": 0.02
  },
  "relevance_weights_reasoning": "Elderly and their caregivers nearby are key stakeholders; other factors are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 65
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age >= 65, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Elderly residents and caregivers typically use nearby facilities; \u03bc and \u03c3 reflect a neighborhood\u2011scale catchment, keeping relevance high within ~0.5\u20131 km."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Geriatric care and social work education plus hands-on elder care management experience are key; resources like staff and facilities are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_services.elderly_care",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain social_services.elderly_care with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.15,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Elderly people and their caregivers are primary; their experience drives decisions. Expertise about elder care standards matters moderately; Contribution favors caregivers active in community support."
}
```

---

### 45. Pharmacy medication stock/outage

- **Category**: `health.access.medication_local`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `healthcare.pharmacy.operations`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.65$, $w_G=0.25$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `has_prescription = true, pharmacy_customer_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.70$, $w_{Exp}=0.20$, $w_{Con}=0.10$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.access.medication_local",
    "scope_type": "neighborhood",
    "affected_roles": [
      "patient"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "healthcare.pharmacy.operations",
    "classification_reasoning": "Category 'health.access.medication_local' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.65,
    "w_geographic": 0.25,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People needing the specific medication and using this pharmacy are gated by health and geography.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "has_prescription",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: has_prescription = true, pharmacy_customer_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Patients usually choose pharmacies close to home or clinic; \u03bc is at the pharmacy and \u03c3 extends to surrounding blocks where regular customers live."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Pharmacology and supply chain education plus pharmacy operations experience are central; resources (supplier relationships, inventory) are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "healthcare.pharmacy.operations",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain healthcare.pharmacy.operations with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.7,
    "w_expertise": 0.2,
    "w_contribution": 0.1
  },
  "aggregation_reasoning": "Patients needing the medication are highly relevant. Expertise about supply chains, substitutions and safety is non-trivial; Contribution plays a smaller role."
}
```

---

### 46. Mental health drop‑in center hours

- **Category**: `health.support.mental_local`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `mental_health.community_services`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.30$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `mental_health_need = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.support.mental_local",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "chronically_ill"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "mental_health.community_services",
    "classification_reasoning": "Category 'health.support.mental_local' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.3,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Those with mental health needs and living near the service are primary; interest in mental health and social ties slightly modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "medical_conditions",
            "op": "array_contains",
            "value": "mental_health"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: mental_health_need = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "The center serves a neighborhood or district; \u03bc and \u03c3 give high relevance within this zone, decaying for distant residents less likely to attend in person."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Clinical psychology/social work education and practical management of mental health services both matter; resources like staff and safe space are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "mental_health.community_services",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain mental_health.community_services with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "medium",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People using or likely to use the service should lead. Clinical and organizational expertise matters; Contribution rewards those who sustainably support peer networks."
}
```

---

### 47. Local disability access improvements (ramps, lifts)

- **Category**: `infrastructure.accessibility.general`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `accessibility.design_and_compliance`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.30$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=300.0$, $\sigma=250.0$
- **Demographic Filters**: `mobility_limitation = true, uses_location = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "infrastructure.accessibility.general",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "disabled"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "accessibility.design_and_compliance",
    "classification_reasoning": "Category 'infrastructure.accessibility.general' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.3,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People with disabilities and their caregivers using the location are gated by demographic and geographic factors; other factors are small.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "mobility_limitation",
            "op": "==",
            "value": true
          },
          {
            "field": "uses_location",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: mobility_limitation = true, uses_location = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 300.0,
    "sigma_distance_meters": 250.0,
    "geo_reasoning": "Improvements target a specific site; \u03bc and \u03c3 focus on people who regularly pass through or use that location, usually within a few blocks."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Accessibility regulations and design education plus practical implementation experience are both very important; resources like equipment come after that.",
  "expertise_domain_parameters": {
    "expertise_domain": "accessibility.design_and_compliance",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain accessibility.design_and_compliance with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People with disabilities and caregivers are central, but compliance and design standards raise the value of Expertise. Contribution is moderate for activists and organizers."
}
```

---

### 48. Food bank operating days and rules

- **Category**: `social.services.food_bank_local`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `social_services.food_security`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.45$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `low_income_or_benefit_recipient = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.services.food_bank_local",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "low_income"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "social_services.food_security",
    "classification_reasoning": "Category 'social.services.food_bank_local' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Beneficiaries and volunteers nearby are primary; geography and beneficiary status dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "low_income",
              "benefit_recipient"
            ]
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: low_income_or_benefit_recipient = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Beneficiaries and volunteers tend to be from the surrounding neighborhoods; \u03bc and \u03c3 reflect a district\u2011scale catchment around the food bank."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Social work/nonprofit education is helpful, but organizing operations and having food/logistics resources are more central in practice.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_services.food_security",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain social_services.food_security with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Beneficiaries and volunteers nearby are primary; organizational/logistics expertise is helpful. Contribution is relatively high to empower volunteers who sustain operations."
}
```

---

### 49. Homeless shelter capacity and admission rules

- **Category**: `social.services.shelter`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `social_services.homelessness_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.30$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1500.0$
- **Demographic Filters**: `homeless_or_precarious_housing = true, within_city_limits = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.services.shelter",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "low_income"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "social_services.homelessness_policy",
    "classification_reasoning": "Category 'social.services.shelter' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.3,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People in housing crisis within the city are gated by demographics; geography of the shelter matters; semantic and social effects are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "housing_status",
            "op": "in",
            "value": [
              "homeless",
              "precarious"
            ]
          },
          {
            "field": "city_name",
            "op": "==",
            "value_source": "issue.city_name"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: homeless_or_precarious_housing = true, within_city_limits = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1500.0,
    "geo_reasoning": "Shelters often serve people from across a city or large area; \u03bc and \u03c3 are large enough to keep relevance high throughout the urban area."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Policy, law, and social work education is important; field experience in shelter management is equally key; resources like beds and funding are secondary in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_services.homelessness_policy",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain social_services.homelessness_policy with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People in housing crisis are highly relevant, but Expertise in social services, safety, and legal obligations is crucial; Contribution favors organizations and individuals with proven constructive engagement."
}
```

---

### 50. Neighborhood support network for emergencies

- **Category**: `social.services.neighborhood_support`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `community.resilience.mutual_aid`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.40$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `lives_within_radius = true, elderly_or_single_parent = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.services.neighborhood_support",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "elderly"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "community.resilience.mutual_aid",
    "classification_reasoning": "Category 'social.services.neighborhood_support' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.4,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents and vulnerable groups in the neighborhood are central; social ties inside the neighborhood slightly increase relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "elderly",
              "single_parent"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, elderly_or_single_parent = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "The network is designed for mutual aid within a defined neighborhood; \u03bc and \u03c3 align with that area so relevance declines outside."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Community organizing experience and availability of resources (volunteers, supplies) dominate; formal education in emergency management helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "community.resilience.mutual_aid",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain community.resilience.mutual_aid with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Local residents, especially vulnerable ones, are core. Expertise in emergency preparedness is useful but moderate; Contribution is high to strengthen roles of reliably supportive neighbors."
}
```

---

### 51. Family emergency affecting submitter’s close relatives

- **Category**: `social.family.emergency`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `high`
- **Domain**: `social_support.family_crisis`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.15$, $w_G=0.15$, $w_S=0.00$, $w_X=0.70$
- **Geographic Radius**: $\mu=10000.0$, $\sigma=8000.0$
- **Demographic Filters**: `social_relation_type IN ('spouse','partner','parent','child','sibling','close_friend')`
- **Expertise Weights**: $w_{Edu}=0.20$, $w_{Exp}=0.40$, $w_{Res}=0.40$
- **Aggregation Weights**: $w_{Rel}=0.75$, $w_{Exp}=0.05$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.family.emergency",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "social_support.family_crisis",
    "classification_reasoning": "Category 'social.family.emergency' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.15,
    "w_geographic": 0.15,
    "w_semantic": 0.0,
    "w_social": 0.7
  },
  "relevance_weights_reasoning": "Direct social ties to the person in crisis dominate; demography and geography only fine\u2011tune around social connections.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "social_relation_type",
            "op": "in",
            "value": [
              "spouse",
              "partner",
              "parent",
              "child",
              "sibling",
              "close_friend"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: social_relation_type IN ('spouse','partner','parent','child','sibling','close_friend')."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 10000.0,
    "sigma_distance_meters": 8000.0,
    "geo_reasoning": "The emergency may involve relatives living elsewhere; geography matters less than social ties, so \u03bc and \u03c3 are large, effectively giving near\u2011flat G within the city or region."
  },
  "expertise_weights": {
    "w_education": 0.2,
    "w_experience": 0.4,
    "w_resources": 0.4
  },
  "expertise_weights_reasoning": "For personal family emergencies, relevant experience (e.g., caregiving) and access to resources (time, money, contacts) matter much more than formal education.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_support.family_crisis",
    "contemporary_importance": 0.3,
    "recency_decay_rate": 0.02,
    "age_penalty_threshold": null,
    "CBC_adjustment_factor": 0.9,
    "domain_reasoning": "Evolving domain social_support.family_crisis with contemporary importance 0.3 and decay rate 0.02."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "high",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.75,
    "w_expertise": 0.05,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Immediate family and close friends are the core decision-makers; technical expertise usually has little role. Contribution rewards relatives/friends with stable support histories."
}
```

---

### 52. Neighborhood mutual aid group rules

- **Category**: `social.services.mutual_aid`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `community.organizing.mutual_aid`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.35$, $w_S=0.15$, $w_X=0.15$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `lives_within_radius = true, low_income_or_caregiver = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.15$, $w_{Con}=0.30$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.services.mutual_aid",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "low_income"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "community.organizing.mutual_aid",
    "classification_reasoning": "Category 'social.services.mutual_aid' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.35,
    "w_semantic": 0.15,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Local residents and vulnerable or caregiving roles are gated; social ties and interest in mutual aid modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "low_income",
              "caregiver"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, low_income_or_caregiver = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Mutual aid groups are typically bounded by a neighborhood; \u03bc and \u03c3 follow that geography so members in the area get higher G than outsiders."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Community organizing experience and available support resources are central; education in social work or community development is helpful but not dominant.",
  "expertise_domain_parameters": {
    "expertise_domain": "community.organizing.mutual_aid",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain community.organizing.mutual_aid with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.15,
    "w_contribution": 0.3
  },
  "aggregation_reasoning": "Local residents, especially vulnerable ones, are relevant, but the functioning of mutual aid depends heavily on reliable ongoing participation, so Contribution is high; Expertise (organizing, social work) matters moderately."
}
```

---

### 53. Local addiction support program (AA/NA)

- **Category**: `health.support.addiction_local`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `mental_health.addiction_support`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.30$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `substance_use_disorder = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.support.addiction_local",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "chronically_ill"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "mental_health.addiction_support",
    "classification_reasoning": "Category 'health.support.addiction_local' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.3,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People with addiction issues or close relatives nearby are primary; interest and social ties add small adjustments.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "medical_conditions",
            "op": "array_contains",
            "value": "substance_use_disorder"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: substance_use_disorder = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Participants are usually from nearby neighborhoods; \u03bc and \u03c3 capture the typical walking/public\u2011transport catchment."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Clinical education and lived experience with addiction both matter; resources like meeting spaces and facilitators are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "mental_health.addiction_support",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain mental_health.addiction_support with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People with addiction issues and their close supporters are primary; clinical and lived-experience Expertise is important; Contribution highlights stable, supportive members of the group."
}
```

---

### 54. Heatwave emergency plan for vulnerable residents

- **Category**: `health.safety.heatwave`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `public_health.emergency_heatwave`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.30$, $w_S=0.05$, $w_X=0.05$
- **Geographic Radius**: $\mu=2000.0$, $\sigma=2000.0$
- **Demographic Filters**: `age >= 65, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.safety.heatwave",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "elderly"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "public_health.emergency_heatwave",
    "classification_reasoning": "Category 'health.safety.heatwave' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.3,
    "w_semantic": 0.05,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Elderly and health\u2011vulnerable residents in the area are highly affected; other factors are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 65
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age >= 65, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 2000.0,
    "sigma_distance_meters": 2000.0,
    "geo_reasoning": "Heatwaves affect a wide region or entire city; \u03bc and \u03c3 are large so that almost all residents in the climatic area have similar geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Public health and emergency management education plus practical experience with heatwave response are central; resources like cooling centers and outreach capacity support implementation.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_health.emergency_heatwave",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain public_health.emergency_heatwave with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Vulnerable residents (elderly, ill) are key, but Expertise in public health and emergency planning is significant; Contribution remains moderate."
}
```

---

### 55. Pandemic local restrictions (mask rules in district)

- **Category**: `health.safety.pandemic_local`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `public_health.infectious_disease_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.50$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=3000.0$, $\sigma=2500.0$
- **Demographic Filters**: `lives_or_works_in_district = true, public_facing_job = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "health.safety.pandemic_local",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "public_health.infectious_disease_policy",
    "classification_reasoning": "Category 'health.safety.pandemic_local' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.5,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "People living/working in the restricted area are geographically gated; demographic exposure and interest in health policy modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "district_id",
            "op": "==",
            "value_source": "issue.district_id"
          },
          {
            "field": "job_details",
            "op": "==",
            "value": "public_facing"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_in_district = true, public_facing_job = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 3000.0,
    "sigma_distance_meters": 2500.0,
    "geo_reasoning": "Restrictions usually apply to full municipalities or districts; \u03bc and \u03c3 maintain high G for all people inside the jurisdiction and drop for those outside."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Infectious disease and public health education and experience are both crucial; resources like PPE and enforcement mechanisms are important but not the main factor in weighting expertise.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_health.infectious_disease_policy",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.15,
    "domain_reasoning": "Evolving domain public_health.infectious_disease_policy with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "People living/working in the area are relevant, but infectious disease Expertise is crucial when deciding restrictions; Contribution is moderate."
}
```

---

### 56. School safety incident requiring parental decision

- **Category**: `education.school.safety`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `education.safety_crisis_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.20$, $w_S=0.10$, $w_X=0.40$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `student_at_school = true, parent_or_guardian_of_student = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.safety",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "education.safety_crisis_management",
    "classification_reasoning": "Category 'education.school.safety' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.2,
    "w_semantic": 0.1,
    "w_social": 0.4
  },
  "relevance_weights_reasoning": "Students and their parents/guardians are primarily affected; social graph is high because parental relevance is via ties to the child.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "student"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "parent",
              "guardian"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_at_school = true, parent_or_guardian_of_student = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Students and parents connected to the specific school are key; geographically, this corresponds to families living in the school\u2019s catchment area, roughly a few hundred meters to 1 km."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Safety and psychology education plus experience managing school incidents matter; resources like crisis teams and communications channels support implementation.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.safety_crisis_management",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain education.safety_crisis_management with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Students and parents are core; their Relevance should dominate. Safety and crisis-management Expertise is important; Contribution highlights families and staff with a history of constructive safety engagement."
}
```

---

### 57. School timetable / homework load

- **Category**: `education.school.schedule`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `education.pedagogy_and_timetabling`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.50$, $w_G=0.10$, $w_S=0.20$, $w_X=0.20$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `student_in_grades_affected = true, parent_or_teacher_of_student = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.schedule",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "education.pedagogy_and_timetabling",
    "classification_reasoning": "Category 'education.school.schedule' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.5,
    "w_geographic": 0.1,
    "w_semantic": 0.2,
    "w_social": 0.2
  },
  "relevance_weights_reasoning": "Students are gated by demographic status; parents and teachers gain relevance through social ties; semantic interest in pedagogy is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "student"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "parent",
              "teacher"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_in_grades_affected = true, parent_or_teacher_of_student = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "The impact is determined by school enrollment more than distance, but most students live nearby; \u03bc and \u03c3 approximate the local catchment while demographic rules do the main filtering."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Educational theory and pedagogy education plus practical teaching/administrative experience are central; resources like scheduling tools are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.pedagogy_and_timetabling",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain education.pedagogy_and_timetabling with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Students and parents directly experiencing workload should lead. Pedagogical Expertise matters; Contribution favors those who consistently engage in balanced education reforms."
}
```

---

### 58. School grading policy change

- **Category**: `education.school.policy_grading`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `education.assessment_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.20$, $w_S=0.25$, $w_X=0.15$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `student_or_teacher_at_school = true, parent_of_student = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.35$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.policy_grading",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent",
      "teacher"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "education.assessment_policy",
    "classification_reasoning": "Category 'education.school.policy_grading' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.2,
    "w_semantic": 0.25,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Role as student/teacher plus parent connections dominate; interest in education policy adds semantic modulation.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "student",
              "teacher"
            ]
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "parent"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_or_teacher_at_school = true, parent_of_student = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Affects all students at the school; geography loosely follows the catchment zone, so \u03bc and \u03c3 stay in the few\u2011hundred\u2011meter range."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Assessment and education policy education plus teaching/administrative experience are both crucial; resources have limited impact on expertise estimation.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.assessment_policy",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain education.assessment_policy with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.35,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "This is more technical; educational policy and fairness Expertise is crucial, so Expertise is high. Relevance for students and teachers remains strong; Contribution moderate."
}
```

---

### 59. School cafeteria menu and nutrition

- **Category**: `education.school.cafeteria`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `nutrition.school_food_services`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.50$, $w_G=0.15$, $w_S=0.20$, $w_X=0.15$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `student_at_school = true, parent_of_student = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.cafeteria",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "nutrition.school_food_services",
    "classification_reasoning": "Category 'education.school.cafeteria' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.5,
    "w_geographic": 0.15,
    "w_semantic": 0.2,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Students and parents are gated by demographics and social ties; semantic nutrition interest is moderate; geography is minor once school is fixed.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "student"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "parent"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_at_school = true, parent_of_student = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Only families whose children attend the school are substantially affected; \u03bc and \u03c3 represent the local area where most of them live."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Nutrition and food service education and practical cafeteria management experience both matter; resources (kitchen equipment, suppliers) are also significant.",
  "expertise_domain_parameters": {
    "expertise_domain": "nutrition.school_food_services",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain nutrition.school_food_services with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Students and parents should strongly influence food choices, but nutritional and budgetary Expertise is significant; Contribution is moderate."
}
```

---

### 60. School bus route and stop changes

- **Category**: `education.school.transport`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `transportation.school_bus_planning`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.50$, $w_G=0.30$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=1200.0$, $\sigma=1000.0$
- **Demographic Filters**: `uses_school_bus = true, lives_within_bus_catchment = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.transport",
    "scope_type": "district",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "transportation.school_bus_planning",
    "classification_reasoning": "Category 'education.school.transport' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.5,
    "w_geographic": 0.3,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Using the bus and living on the route are primary; parental social ties and semantic interest are secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "uses_school_bus",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: uses_school_bus = true, lives_within_bus_catchment = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1200.0,
    "sigma_distance_meters": 1000.0,
    "geo_reasoning": "Routes cover large areas; \u03bc and \u03c3 are tuned to keep G high along bus corridors and within typical commuting distances to the school."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Transport planning education and experience managing school transport are key; resources (buses, drivers) are part of implementation.",
  "expertise_domain_parameters": {
    "expertise_domain": "transportation.school_bus_planning",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain transportation.school_bus_planning with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Bus users and families are highly relevant; transport planning Expertise matters. Contribution rewards those actively engaged in school logistics."
}
```

---

## 61–80: Education & Youth Programs

### 61. After‑school program availability

- **Category**: `education.school.after_school`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `education.extracurricular_programs`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.25$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `student_age BETWEEN 6 AND 14, parent_guardian = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.after_school",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "education.extracurricular_programs",
    "classification_reasoning": "Category 'education.school.after_school' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.25,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Families with children in the age range and near the school are core; other dimensions are small.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 6
          },
          {
            "field": "age",
            "op": "<=",
            "value": 14
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "parent"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_age BETWEEN 6 AND 14, parent_guardian = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "After\u2011school programs mainly serve students who can remain near the school; \u03bc and \u03c3 span the local neighborhood around the school."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Education/social work education, experience organizing programs, and available space/staff resources are all significant and fairly balanced.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.extracurricular_programs",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain education.extracurricular_programs with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Families of children who attend or would attend are primary. Expertise in child development is helpful; Contribution emphasizes parents who consistently sustain such programs."
}
```

---

### 62. Teacher–parent communication platform rules

- **Category**: `education.school.digital_comm`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `education.digital_communication_platforms`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.05$, $w_S=0.35$, $w_X=0.20$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `student/parent/teacher_in_school = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.digital_comm",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent",
      "teacher"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "digital_only",
    "expertise_domain": "education.digital_communication_platforms",
    "classification_reasoning": "Category 'education.school.digital_comm' at 'neighborhood' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.05,
    "w_semantic": 0.35,
    "w_social": 0.2
  },
  "relevance_weights_reasoning": "Role in the school community is gating; interest in digital communication and social ties define semantic and social relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "student",
              "parent",
              "teacher"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student/parent/teacher_in_school = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Although communication is digital, affected families cluster geographically around the school; \u03bc and \u03c3 approximate this catchment while X and D handle the main filtering."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Education/communication theory and IT/UX experience both matter; resources like platform licenses and support teams are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.digital_communication_platforms",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain education.digital_communication_platforms with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "high",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "School community members are relevant, but digital communication, privacy and UX Expertise are key; Contribution highlights those who already help with digital tools."
}
```

---

### 63. Local youth club hours and activities

- **Category**: `social.youth.club`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `youth_work.community_clubs`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.40$, $w_S=0.20$, $w_X=0.05$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `age BETWEEN 12 AND 18, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.10$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.youth.club",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "youth_work.community_clubs",
    "classification_reasoning": "Category 'social.youth.club' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.4,
    "w_semantic": 0.2,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Local youth in the age range are primary; geography and topic interest in activities both matter.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 12
          },
          {
            "field": "age",
            "op": "<=",
            "value": 18
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age BETWEEN 12 AND 18, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Youth attend clubs near their homes; \u03bc and \u03c3 define a neighborhood\u2011scale catchment around the club location."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Youth work education is useful, but practical experience with youth and having spaces, equipment and volunteers are central.",
  "expertise_domain_parameters": {
    "expertise_domain": "youth_work.community_clubs",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain youth_work.community_clubs with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.1,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Youth using the club should dominate. Expertise is low (basic program design), while Contribution is high to value organizers and consistent participants."
}
```

---

### 64. Scholarship allocation criteria at local school

- **Category**: `education.school.scholarships`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `education.equity_scholarships`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.20$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=500.0$, $\sigma=450.0$
- **Demographic Filters**: `student_or_parent = true, low_income_or_high_achievement = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.school.scholarships",
    "scope_type": "neighborhood",
    "affected_roles": [
      "student",
      "parent"
    ],
    "affected_vulnerabilities": [
      "low_income"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "education.equity_scholarships",
    "classification_reasoning": "Category 'education.school.scholarships' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.2,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Students eligible or nearly eligible are gated by demographics; location and interest in scholarships modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "student",
              "parent"
            ]
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "low_income",
              "student"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: student_or_parent = true, low_income_or_high_achievement = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 500.0,
    "sigma_distance_meters": 450.0,
    "geo_reasoning": "Scholarships primarily concern enrolled students, who usually live in the surrounding area; \u03bc and \u03c3 capture this zone while demographics identify who actually qualifies."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Education policy and equity research (education) plus experience managing scholarships are key; resources for funding matter but less in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.equity_scholarships",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain education.equity_scholarships with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Eligible students are important, but fairness, equity and educational policy Expertise is critical, so Expertise is high; Contribution remains moderate."
}
```

---

### 65. University course curriculum change

- **Category**: `education.higher.curriculum`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `higher_education.curriculum_design`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.10$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1500.0$
- **Demographic Filters**: `enrolled_student_in_program = true`
- **Expertise Weights**: $w_{Edu}=0.45$, $w_{Exp}=0.40$, $w_{Res}=0.15$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.40$, $w_{Con}=0.10$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.higher.curriculum",
    "scope_type": "district",
    "affected_roles": [
      "student",
      "teacher"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "higher_education.curriculum_design",
    "classification_reasoning": "Category 'education.higher.curriculum' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.1,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Being a student or academic staff in the program is gating; interest in the subject and social ties to peers modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "student"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: enrolled_student_in_program = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1500.0,
    "geo_reasoning": "Students and staff may live across the city; \u03bc and \u03c3 are large enough to give nearly flat G within the wider metropolitan region."
  },
  "expertise_weights": {
    "w_education": 0.45,
    "w_experience": 0.4,
    "w_resources": 0.15
  },
  "expertise_weights_reasoning": "Academic discipline knowledge and curriculum design education, along with teaching experience, are central; resources (labs, staff) are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "higher_education.curriculum_design",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain higher_education.curriculum_design with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.4,
    "w_contribution": 0.1
  },
  "aggregation_reasoning": "This is strongly expertise-driven (discipline knowledge, accreditation), so Expertise is dominant; Relevance for current students still matters; Contribution is smaller."
}
```

---

### 66. University exam schedule and format

- **Category**: `education.higher.exams`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `higher_education.assessment_admin`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.65$, $w_G=0.05$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1500.0$
- **Demographic Filters**: `enrolled_in_course = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.higher.exams",
    "scope_type": "district",
    "affected_roles": [
      "student",
      "teacher"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "higher_education.assessment_admin",
    "classification_reasoning": "Category 'education.higher.exams' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.65,
    "w_geographic": 0.05,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Students taking the exam are strongly gated by demographics; semantic and social factors are minor, geography largely irrelevant.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "student"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: enrolled_in_course = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1500.0,
    "geo_reasoning": "Similar to curriculum changes, geography plays little discriminatory role; \u03bc and \u03c3 make most city\u2011level students equally relevant geographically."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Assessment theory and institutional experience structuring exams both matter; resources like rooms, proctors and software are also relevant.",
  "expertise_domain_parameters": {
    "expertise_domain": "higher_education.assessment_admin",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain higher_education.assessment_admin with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Students who take the exam are central; Expertise about assessment, fairness and logistics matters; Contribution has a smaller but non-zero role."
}
```

---

### 67. Vocational training center opening/closure

- **Category**: `education.vocational.center_local`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `vocational_education.center_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.30$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1300.0$
- **Demographic Filters**: `enrolled_or_waitlisted_trainee = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.30$, $w_{Con}=0.10$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.vocational.center_local",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "vocational_education.center_management",
    "classification_reasoning": "Category 'education.vocational.center_local' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.3,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Trainees and potential trainees in the area are primary; other factors are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "trainee",
              "waitlisted"
            ]
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: enrolled_or_waitlisted_trainee = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1300.0,
    "geo_reasoning": "The center attracts learners from a broad catchment; \u03bc and \u03c3 cover large parts of the city where potential students live."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Education and labor market knowledge plus experience running vocational programs are key; resources like facilities and equipment matter but less in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "vocational_education.center_management",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain vocational_education.center_management with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.3,
    "w_contribution": 0.1
  },
  "aggregation_reasoning": "Trainees and potential trainees are directly impacted; Expertise in labor markets and vocational training policy is critical; Contribution plays a smaller role."
}
```

---

### 68. Local internship placement program rules

- **Category**: `education.work_based.internships`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `education.career_services_internships`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.20$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=2000.0$, $\sigma=2000.0$
- **Demographic Filters**: `age BETWEEN 16 AND 30, student_or_recent_grad = true, local_employer = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "education.work_based.internships",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "education.career_services_internships",
    "classification_reasoning": "Category 'education.work_based.internships' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.2,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Eligible youth and local employers are gated by demographics; interest in career development is semantic.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 16
          },
          {
            "field": "age",
            "op": "<=",
            "value": 30
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "student",
              "recent_grad"
            ]
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "employer"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age BETWEEN 16 AND 30, student_or_recent_grad = true, local_employer = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 2000.0,
    "sigma_distance_meters": 2000.0,
    "geo_reasoning": "Internships link multiple employers and institutions across the city; \u03bc and \u03c3 are large so that geography does not overly restrict eligible participants within the metropolitan area."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Education in career development and law plus experience placing interns are central; access to employer networks/resources is also relevant.",
  "expertise_domain_parameters": {
    "expertise_domain": "education.career_services_internships",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain education.career_services_internships with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Eligible youth and employers have strong relevance, but Expertise in labor law, education and equity is important; Contribution is moderate."
}
```

---

### 69. Youth sports league safety rules

- **Category**: `social.youth.sports_safety`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `youth_sports.safety_and_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.45$, $w_G=0.30$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `youth_player = true, parent_of_player = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.25$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.youth.sports_safety",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "youth_sports.safety_and_management",
    "classification_reasoning": "Category 'social.youth.sports_safety' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.45,
    "w_geographic": 0.3,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Players and parents are gated; geography and safety interest moderate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "youth_player"
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "parent"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: youth_player = true, parent_of_player = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Teams and families are drawn from a cluster of neighborhoods around shared sports facilities; \u03bc and \u03c3 match that multi\u2011neighborhood catchment."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Sports medicine/child safety education and coaching/league management experience both matter; resources (fields, equipment) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "youth_sports.safety_and_management",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain youth_sports.safety_and_management with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.25,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Players and parents are directly impacted; sports safety and coaching Expertise is important; Contribution is moderate."
}
```

---

### 70. Local library youth section rules/events

- **Category**: `social.youth.library`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `library_services.youth_programming`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.40$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `age <= 18, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.youth.library",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "library_services.youth_programming",
    "classification_reasoning": "Category 'social.youth.library' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.4,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Children and parents near the library are core; semantic interest in reading and events is moderate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": "<=",
            "value": 18
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age <= 18, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "The library serves nearby families; \u03bc and \u03c3 define a radius of a few blocks to around 1 km where most users live."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Library science and youth programming education plus experience running youth events both matter; resources like spaces, books and staff are also significant.",
  "expertise_domain_parameters": {
    "expertise_domain": "library_services.youth_programming",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain library_services.youth_programming with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Children, parents and local youth are relevant; librarianship/programming Expertise matters; Contribution rewards those who regularly support library activities."
}
```

---

### 71. Neighborhood community festival

- **Category**: `social.event.community`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `events.community_festival_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.15$, $w_G=0.45$, $w_S=0.30$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.event.community",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "events.community_festival_management",
    "classification_reasoning": "Category 'social.event.community' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.15,
    "w_geographic": 0.45,
    "w_semantic": 0.3,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Proximity and interest in the event jointly dominate; demographics and social ties fine\u2011tune relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Attendance is mainly from within the neighborhood; \u03bc and \u03c3 span that area and nearby blocks."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Event management experience and access to logistical resources (space, equipment, funding) are central; formal education helps but is less crucial.",
  "expertise_domain_parameters": {
    "expertise_domain": "events.community_festival_management",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain events.community_festival_management with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Local residents and attendees are central. Event management Expertise is helpful but secondary; Contribution is high to strengthen voices of those who reliably organize and volunteer."
}
```

---

### 72. Local amateur sports league

- **Category**: `social.event.sports`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `sports_management.amateur_leagues`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.15$, $w_G=0.35$, $w_S=0.40$, $w_X=0.10$
- **Geographic Radius**: $\mu=1000.0$, $\sigma=900.0$
- **Demographic Filters**: `age BETWEEN 16 AND 60, physically_able = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.event.sports",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "sports_management.amateur_leagues",
    "classification_reasoning": "Category 'social.event.sports' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.15,
    "w_geographic": 0.35,
    "w_semantic": 0.4,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Sports participants and enthusiasts plus local proximity are key; semantic weight is strong due to activity preference.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 16
          },
          {
            "field": "age",
            "op": "<=",
            "value": 60
          },
          {
            "field": "physically_able",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age BETWEEN 16 AND 60, physically_able = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1000.0,
    "sigma_distance_meters": 900.0,
    "geo_reasoning": "Players and spectators are recruited from multiple neighborhoods around the venues; \u03bc and \u03c3 reflect a broader but still sub\u2011city catchment."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Running a league is mainly about organizational experience and resources (fields, equipment, refs); sports education is helpful but secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "sports_management.amateur_leagues",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain sports_management.amateur_leagues with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Players and local community members are directly affected; Expertise in sports organization is moderate; Contribution gives weight to consistent organizers and team leads."
}
```

---

### 73. Cultural workshop for children

- **Category**: `social.event.culture_kids`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `arts_education.children_workshops`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.35$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `has_children_age_5_12 = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.15$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.event.culture_kids",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [
      "children"
    ],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "arts_education.children_workshops",
    "classification_reasoning": "Category 'social.event.culture_kids' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.35,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Families with children of the right age near the venue are core; interest in culture and social ties modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "has_children_5_12",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: has_children_age_5_12 = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "Families usually travel short distances for such workshops; \u03bc and \u03c3 define a local neighborhood area."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Arts/education education and experience working with children both matter; resources like space and materials are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "arts_education.children_workshops",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain arts_education.children_workshops with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "medium",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.15,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Families with children involved should drive decisions; cultural/educational Expertise matters moderately; Contribution rewards those who sustain such events."
}
```

---

### 74. Neighborhood watch group formation

- **Category**: `social.safety.neighborhood_watch`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `high`
- **Domain**: `community.safety.neighborhood_watch`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.50$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=600.0$, $\sigma=500.0$
- **Demographic Filters**: `lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.20$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.safety.neighborhood_watch",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "high",
    "digital_or_physical": "physical",
    "expertise_domain": "community.safety.neighborhood_watch",
    "classification_reasoning": "Category 'social.safety.neighborhood_watch' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.5,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Local residents are geographically gated; safety concern and willingness to participate add semantic weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 600.0,
    "sigma_distance_meters": 500.0,
    "geo_reasoning": "The watch group covers a specific territory; \u03bc and \u03c3 align geography so that residents in this area get high G and others rapidly less."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Community organizing and safety experience plus resources (communication channels, vests, etc.) are central; formal education is helpful but secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "community.safety.neighborhood_watch",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain community.safety.neighborhood_watch with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "high",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.2,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Residents are relevant, but the effectiveness relies heavily on reliable, ongoing contributors; so Contribution is high, with some security/community-safety Expertise."
}
```

---

### 75. Public art installation/mural

- **Category**: `social.culture.public_art`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `arts.public_art_urban_design`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.10$, $w_G=0.40$, $w_S=0.40$, $w_X=0.10$
- **Geographic Radius**: $\mu=400.0$, $\sigma=350.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, art_interest = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.35$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.culture.public_art",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "arts.public_art_urban_design",
    "classification_reasoning": "Category 'social.culture.public_art' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.1,
    "w_geographic": 0.4,
    "w_semantic": 0.4,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Local residents and art\u2011interested people are affected; geographic and semantic dimensions share dominance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "interests",
            "op": "array_contains",
            "value": "art"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, art_interest = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 400.0,
    "sigma_distance_meters": 350.0,
    "geo_reasoning": "Visual impact and use are strongest for people living, working or passing near the site; \u03bc and \u03c3 center on the piece and extend to adjacent blocks."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Artistic and urban design education is important; experience delivering public art and resources (wall space, funding) are also relevant.",
  "expertise_domain_parameters": {
    "expertise_domain": "arts.public_art_urban_design",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain arts.public_art_urban_design with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.35,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Local impact matters, but artistic and urban design Expertise are crucial here. Contribution highlights community members who consistently support cultural projects."
}
```

---

### 76. Local street market/bazaar

- **Category**: `social.event.market`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `commerce.local_markets_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.15$, $w_G=0.45$, $w_S=0.30$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `lives_within_radius = true, vendor_or_customer = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.20$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.event.market",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "commerce.local_markets_management",
    "classification_reasoning": "Category 'social.event.market' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.15,
    "w_geographic": 0.45,
    "w_semantic": 0.3,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "People close enough to attend and interested in local commerce/food are core; social ties to vendors add some relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "vendor",
              "customer"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, vendor_or_customer = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Customers and vendors tend to come from nearby neighborhoods; \u03bc and \u03c3 capture the area within easy walking distance."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Market organization experience and resources (stalls, permits, suppliers) dominate; education in business or urban planning helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "commerce.local_markets_management",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain commerce.local_markets_management with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.2,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Residents, vendors and shoppers are relevant; Expertise in logistics and regulation matters; Contribution is high for people who consistently help run the market."
}
```

---

### 77. Religious service schedule/facility change

- **Category**: `social.religion.local_practice`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `religion.community_service_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.30$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=1000.0$, $\sigma=900.0$
- **Demographic Filters**: `religious_affiliation_matches_place = true, regular_attendee = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.65$, $w_{Exp}=0.20$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.religion.local_practice",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "religion.community_service_management",
    "classification_reasoning": "Category 'social.religion.local_practice' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.3,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Affiliation and regular attendance plus proximity dominate; other factors are minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "religious_affiliation",
            "op": "==",
            "value": true
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "attendee"
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: religious_affiliation_matches_place = true, regular_attendee = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1000.0,
    "sigma_distance_meters": 900.0,
    "geo_reasoning": "Congregants may travel across town but typically cluster around the place of worship; \u03bc and \u03c3 are set to give high G within the city section where most attenders live."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Religious leadership/administration education, experience running services, and resources (space, volunteers) all contribute; experience is slightly primary.",
  "expertise_domain_parameters": {
    "expertise_domain": "religion.community_service_management",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain religion.community_service_management with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.65,
    "w_expertise": 0.2,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Regular attendees and adherents are central; religious leadership/organizational Expertise is important; Contribution highlights consistent volunteers."
}
```

---

### 78. Religious noise/visibility regulation in district

- **Category**: `community.governance.religious_visibility`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `law_and_policy.religious_freedom_local`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.55$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=3000.0$, $\sigma=2500.0$
- **Demographic Filters**: `lives_or_works_within_radius = true, religious_or_noise_sensitive = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.religious_visibility",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "law_and_policy.religious_freedom_local",
    "classification_reasoning": "Category 'community.governance.religious_visibility' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.55,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Residents and workers in the affected area are gated by geography; religious affiliation and sensitivity moderate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "religious",
              "noise_sensitive"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_works_within_radius = true, religious_or_noise_sensitive = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 3000.0,
    "sigma_distance_meters": 2500.0,
    "geo_reasoning": "Regulations affect all residents of a district; \u03bc and \u03c3 approximate that jurisdiction, giving relatively uniform G inside and lower G outside."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Law, human rights and urban planning education are important; experience mediating sensitive identity conflicts also matters; resources (legal and mediation services) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "law_and_policy.religious_freedom_local",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain law_and_policy.religious_freedom_local with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Residents and practitioners in the area are relevant; legal and human-rights Expertise matters significantly; Contribution favors those with balanced engagement on sensitive identity topics."
}
```

---

### 79. Local charity food drive

- **Category**: `social.charity.local_service`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `charity.local_food_drives`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.45$, $w_S=0.10$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `beneficiary_or_volunteer = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.25$, $w_{Exp}=0.40$, $w_{Res}=0.35$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.15$, $w_{Con}=0.30$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.charity.local_service",
    "scope_type": "neighborhood",
    "affected_roles": [
      "volunteer",
      "recipient"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "charity.local_food_drives",
    "classification_reasoning": "Category 'social.charity.local_service' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.45,
    "w_semantic": 0.1,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Beneficiaries and volunteers in the area are primary; geographic and demographic dimensions dominate, with social ties and interest contributing.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "beneficiary",
              "volunteer"
            ]
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: beneficiary_or_volunteer = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Beneficiaries and volunteers are mostly local; \u03bc and \u03c3 cover the immediate neighborhood and adjacent blocks."
  },
  "expertise_weights": {
    "w_education": 0.25,
    "w_experience": 0.4,
    "w_resources": 0.35
  },
  "expertise_weights_reasoning": "Nonprofit organizing experience and access to food/logistics resources are central; formal education in social work or nonprofit management helps but is secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "charity.local_food_drives",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain charity.local_food_drives with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.15,
    "w_contribution": 0.3
  },
  "aggregation_reasoning": "Beneficiaries and volunteers are relevant, but the drive\u2019s success depends strongly on dependable contributors, so Contribution is high; Expertise is modest."
}
```

---

### 80. Online donation campaign rules (global)

- **Category**: `social.charity.online_campaign`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `charity.online_fundraising_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.05$, $w_S=0.25$, $w_X=0.15$
- **Geographic Radius**: $\mu=50000.0$, $\sigma=40000.0$
- **Demographic Filters**: `donor_or_recurring_supporter = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.30$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.charity.online_campaign",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "charity.online_fundraising_management",
    "classification_reasoning": "Category 'social.charity.online_campaign' at 'global_digital' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.05,
    "w_semantic": 0.25,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Donor status is gating; semantic affinity to the cause and social ties to organizers/beneficiaries are meaningful; geography minimal.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "donor",
              "supporter"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: donor_or_recurring_supporter = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50000.0,
    "sigma_distance_meters": 40000.0,
    "geo_reasoning": "This is largely geography\u2011independent; \u03bc and \u03c3 are very large so that G is almost flat for everyone in the platform\u2019s overall region (e.g. country or world), leaving D, S and X to differentiate relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Fundraising/marketing and legal/financial education plus experience managing online campaigns are important; resources (platform, donor base) also matter strongly.",
  "expertise_domain_parameters": {
    "expertise_domain": "charity.online_fundraising_management",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain charity.online_fundraising_management with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.3,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Donors and beneficiaries are relevant, but fundraising, legal and financial Expertise is important; Contribution favors organizers and repeat donors with strong track records."
}
```

---

## 81–100: Local Governance & Digital Coordination

### 81. NGO volunteer onboarding rules

- **Category**: `social.charity.volunteering`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `nonprofit.management.volunteer_programs`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.45$, $w_G=0.20$, $w_S=0.25$, $w_X=0.10$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1300.0$
- **Demographic Filters**: `active_or_applicant_volunteer = true, lives_within_service_area = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.25$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.charity.volunteering",
    "scope_type": "district",
    "affected_roles": [
      "volunteer",
      "recipient"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "nonprofit.management.volunteer_programs",
    "classification_reasoning": "Category 'social.charity.volunteering' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.45,
    "w_geographic": 0.2,
    "w_semantic": 0.25,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Volunteers and applicants are demographically gated; geography matters if work is onsite; interest in cause is strong.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "volunteer",
              "applicant"
            ]
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: active_or_applicant_volunteer = true, lives_within_service_area = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1300.0,
    "geo_reasoning": "Volunteers usually operate within a city or region; \u03bc and \u03c3 maintain fairly high G across the typical service area."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "HR/nonprofit management education and experience running volunteer programs both matter; resources (staff time, tools) are also significant.",
  "expertise_domain_parameters": {
    "expertise_domain": "nonprofit.management.volunteer_programs",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain nonprofit.management.volunteer_programs with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.25,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Volunteers are key, but onboarding policy also needs HR/organizational Expertise. Contribution is high because sustained volunteer reliability is central."
}
```

---

### 82. Community choir / arts group organization

- **Category**: `social.culture.community_group`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `arts.community_choir_management`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.20$, $w_G=0.40$, $w_S=0.30$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `age >= 14, lives_within_radius = true, arts_interest = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.15$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.culture.community_group",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "arts.community_choir_management",
    "classification_reasoning": "Category 'social.culture.community_group' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.2,
    "w_geographic": 0.4,
    "w_semantic": 0.3,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Local residents with artistic interest are core; geography and semantic dimensions jointly dominate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "age",
            "op": ">=",
            "value": 14
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "interests",
            "op": "array_contains",
            "value": "arts"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: age >= 14, lives_within_radius = true, arts_interest = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Participants generally come from local neighborhoods; \u03bc and \u03c3 define the radius from which people regularly attend rehearsals."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Music/arts education and experience leading groups both matter; resources (space, instruments) are important as well.",
  "expertise_domain_parameters": {
    "expertise_domain": "arts.community_choir_management",
    "contemporary_importance": 0.5,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.0,
    "domain_reasoning": "Evolving domain arts.community_choir_management with contemporary importance 0.5 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.15,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Participants and local community are relevant; artistic and organizational Expertise help but are secondary; Contribution is high for organizers and committed members."
}
```

---

### 83. Local LGBTQ+ support group rules

- **Category**: `social.inclusion.lgbtq_support`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `social_inclusion.lgbtq_support_practice`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.45$, $w_G=0.30$, $w_S=0.20$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1300.0$
- **Demographic Filters**: `lgbtq_identity = true, lives_within_radius = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.inclusion.lgbtq_support",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "social_inclusion.lgbtq_support_practice",
    "classification_reasoning": "Category 'social.inclusion.lgbtq_support' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.45,
    "w_geographic": 0.3,
    "w_semantic": 0.2,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Identity/allyship and proximity dominate; semantic interest in inclusion is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "lgbtq_identity",
            "op": "==",
            "value": true
          },
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lgbtq_identity = true, lives_within_radius = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1300.0,
    "geo_reasoning": "Members can travel from across several neighborhoods; \u03bc and \u03c3 give high G within that broader catchment."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Education in mental health/inclusion and lived experience organizing support groups both matter; resources (safe space, facilitators) are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "social_inclusion.lgbtq_support_practice",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain social_inclusion.lgbtq_support_practice with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "high",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "LGBTQ+ members and allies directly using the group are central. Expertise in mental health and inclusion is important; Contribution values those who reliably support peers."
}
```

---

### 84. Local cultural heritage preservation initiative

- **Category**: `social.culture.heritage`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `heritage.preservation_policy_and_practice`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.25$, $w_G=0.45$, $w_S=0.25$, $w_X=0.05$
- **Geographic Radius**: $\mu=2000.0$, $\sigma=1800.0$
- **Demographic Filters**: `lives_within_radius = true, heritage_interest = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.culture.heritage",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "heritage.preservation_policy_and_practice",
    "classification_reasoning": "Category 'social.culture.heritage' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.25,
    "w_geographic": 0.45,
    "w_semantic": 0.25,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Nearby residents and those interested in heritage are primary; geographic and semantic dimensions share weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "user_location",
            "op": "within_distance",
            "value_source": "issue.location"
          },
          {
            "field": "interests",
            "op": "array_contains",
            "value": "heritage"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_within_radius = true, heritage_interest = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 2000.0,
    "sigma_distance_meters": 1800.0,
    "geo_reasoning": "The heritage site or area matters to residents of the surrounding district; \u03bc and \u03c3 keep relevance high across this district and moderate beyond."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "History/heritage and legal education is important; experience running preservation projects matters; resources (funding, expertise access) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "heritage.preservation_policy_and_practice",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.03,
    "age_penalty_threshold": 70,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain heritage.preservation_policy_and_practice with contemporary importance 0.6 and decay rate 0.03."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Local residents and heritage stakeholders are relevant, but historical, architectural and legal Expertise is key; Contribution is moderate."
}
```

---

### 85. City‑wide cultural festival governance (who participates)

- **Category**: `social.event.city_festival_governance`
- **Scope Type**: `region`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `culture.city_festival_governance`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.40$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=4000.0$, $\sigma=3500.0$
- **Demographic Filters**: `city_resident = true, cultural_worker_or_vendor = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.25$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "social.event.city_festival_governance",
    "scope_type": "region",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "culture.city_festival_governance",
    "classification_reasoning": "Category 'social.event.city_festival_governance' at 'region' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.4,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "City residents, cultural workers and vendors are demographically gated; city geography and semantic interest are strong, social ties modest.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "city_name",
            "op": "==",
            "value_source": "issue.city_name"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "cultural_worker",
              "vendor"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: city_resident = true, cultural_worker_or_vendor = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 4000.0,
    "sigma_distance_meters": 3500.0,
    "geo_reasoning": "The festival involves participants from across the city; \u03bc and \u03c3 are set near the city center with wide spread so that almost all residents have similar geographic relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Cultural policy/management education and experience running large festivals are key; resources (sponsorships, venues) are also important but secondary in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "culture.city_festival_governance",
    "contemporary_importance": 0.6,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain culture.city_festival_governance with contemporary importance 0.6 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "human_volunteers",
      "importance_level": "medium",
      "explanation": "Community volunteer participation is needed to coordinate and carry out the work."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.25,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "City residents and cultural workers are relevant; festival management and cultural policy Expertise matter; Contribution highlights organizers and participants with strong track records."
}
```

---

### 86. On‑site shift scheduling change (offline workers)

- **Category**: `community.work.offline_schedule`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `physical`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `hr_and_operations.shift_scheduling`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.20$, $w_S=0.15$, $w_X=0.10$
- **Geographic Radius**: $\mu=500.0$, $\sigma=450.0$
- **Demographic Filters**: `employee_at_site = true, job_type = 'shift_based'`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.60$, $w_{Exp}=0.20$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.work.offline_schedule",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "hr_and_operations.shift_scheduling",
    "classification_reasoning": "Category 'community.work.offline_schedule' at 'neighborhood' scope. Physical/digital classification is 'physical'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.2,
    "w_semantic": 0.15,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Employment at that site is gating; geography (site assignment), role and family routines via social ties all modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "employee"
          },
          {
            "field": "job_type",
            "op": "==",
            "value": "shift_based"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: employee_at_site = true, job_type = 'shift_based'."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 500.0,
    "sigma_distance_meters": 450.0,
    "geo_reasoning": "Workers are those who commute to a specific workplace; \u03bc and \u03c3 around that location reflect a typical commuting neighborhood while demographics and employer relation do the main filtering."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "HR/operations education and direct management/labor experience both matter; resources (staffing capacity, tools) are also significant.",
  "expertise_domain_parameters": {
    "expertise_domain": "hr_and_operations.shift_scheduling",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain hr_and_operations.shift_scheduling with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.6,
    "w_expertise": 0.2,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Directly affected employees should have strong weight; HR and operations Expertise is meaningful; Contribution highlights workers and managers with good past collaboration."
}
```

---

### 87. Remote work policy change (mandatory office days)

- **Category**: `community.work.remote_policy`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `organizational_design.remote_work_policy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.65$, $w_G=0.05$, $w_S=0.15$, $w_X=0.15$
- **Geographic Radius**: $\mu=5000.0$, $\sigma=4000.0$
- **Demographic Filters**: `company_employee = true, role_can_be_remote = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.25$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.work.remote_policy",
    "scope_type": "city",
    "affected_roles": [
      "remote_worker"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "organizational_design.remote_work_policy",
    "classification_reasoning": "Category 'community.work.remote_policy' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.65,
    "w_geographic": 0.05,
    "w_semantic": 0.15,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Employment and role are gating; social ties in household and interest in remote work are strong modulators; geography is minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "employee"
          },
          {
            "field": "role_can_be_remote",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: company_employee = true, role_can_be_remote = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 5000.0,
    "sigma_distance_meters": 4000.0,
    "geo_reasoning": "Employees may live dispersed across a region; \u03bc and \u03c3 are large so that geography does not dominate, and D/S handle most of relevance."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Organizational psychology/management education and experience managing hybrid teams both matter; resources (digital tools, office space) are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "organizational_design.remote_work_policy",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain organizational_design.remote_work_policy with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.25,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Employees whose lives are impacted are relevant, but organizational, legal and productivity Expertise matters significantly; Contribution recognizes people with constructive participation in prior work-mode debates."
}
```

---

### 88. Gig platform local minimum rate policy

- **Category**: `community.work.gig_local`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `labor_policy.gig_economy`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.25$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=5000.0$, $\sigma=4000.0$
- **Demographic Filters**: `registered_gig_worker = true, works_in_city = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.55$, $w_{Exp}=0.30$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.work.gig_local",
    "scope_type": "city",
    "affected_roles": [
      "gig_worker",
      "client"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "labor_policy.gig_economy",
    "classification_reasoning": "Category 'community.work.gig_local' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.25,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Gig workers in the city are gated; local market geography and interest in labor conditions modulate relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "gig_worker"
          },
          {
            "field": "works_in_city",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: registered_gig_worker = true, works_in_city = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 5000.0,
    "sigma_distance_meters": 4000.0,
    "geo_reasoning": "Active gig workers are spread across the city; \u03bc and \u03c3 approximate the platform\u2019s operational area so that G is broadly similar across it."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Labor economics and law education plus experience as gig workers or platform managers both matter; resources (data, legal support) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "labor_policy.gig_economy",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain labor_policy.gig_economy with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.55,
    "w_expertise": 0.3,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Gig workers\u2019 lived experience is crucial, but labor economics and regulatory Expertise is also key; Contribution is moderate."
}
```

---

### 89. Open‑source project contribution rules

- **Category**: `community.governance.open_source`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `software.open_source_governance`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.55$, $w_G=0.05$, $w_S=0.30$, $w_X=0.10$
- **Geographic Radius**: $\mu=100000.0$, $\sigma=80000.0$
- **Demographic Filters**: `contributor_or_maintainer = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.35$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.open_source",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "digital_only",
    "expertise_domain": "software.open_source_governance",
    "classification_reasoning": "Category 'community.governance.open_source' at 'global_digital' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.55,
    "w_geographic": 0.05,
    "w_semantic": 0.3,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Role as contributor/user is gating; semantic alignment with project is strong; social graph inside project has some effect; geography minimal.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "contributor",
              "maintainer"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: contributor_or_maintainer = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 100000.0,
    "sigma_distance_meters": 80000.0,
    "geo_reasoning": "Contributors are globally distributed; G should be nearly flat across very large distances, so \u03bc and \u03c3 are extremely large and geography essentially drops out."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Software engineering/OSS governance education and contribution experience are central; resources (CI infrastructure, maintainer time) matter but are secondary in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "software.open_source_governance",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain software.open_source_governance with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "medium",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.35,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Contributors are relevant but this is mainly a governance/quality issue where technical and governance Expertise is central; Contribution matters for those with strong prior contributions."
}
```

---

### 90. Open‑source project roadmap / features

- **Category**: `community.governance.open_source_roadmap`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `software.open_source_product_direction`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.05$, $w_S=0.45$, $w_X=0.10$
- **Geographic Radius**: $\mu=100000.0$, $\sigma=80000.0$
- **Demographic Filters**: `heavy_user_or_contributor = true`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.40$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.35$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.open_source_roadmap",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "digital_only",
    "expertise_domain": "software.open_source_product_direction",
    "classification_reasoning": "Category 'community.governance.open_source_roadmap' at 'global_digital' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.05,
    "w_semantic": 0.45,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Heavy usage and domain interest dominate; contributor status and social ties to maintainers matter; geography negligible.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "heavy_user",
              "contributor"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: heavy_user_or_contributor = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 100000.0,
    "sigma_distance_meters": 80000.0,
    "geo_reasoning": "Same as contribution rules: relevance is independent of location, so G is effectively uniform globally."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.4,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Deep technical education and active contribution experience are primary; resources (maintainer time, infrastructure) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "software.open_source_product_direction",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain software.open_source_product_direction with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "medium",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.35,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Heavy users and contributors are relevant, but roadmap design is highly expertise-driven; Contribution elevates consistent maintainers and reviewers."
}
```

---

### 91. Platform rules for ISR‑enabled digital community

- **Category**: `community.governance.platform_rules`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `platform_governance.online_communities`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.05$, $w_S=0.40$, $w_X=0.20$
- **Geographic Radius**: $\mu=50000.0$, $\sigma=40000.0$
- **Demographic Filters**: `registered_user = true, role IN ('admin','moderator','active_member')`
- **Expertise Weights**: $w_{Edu}=0.35$, $w_{Exp}=0.35$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.30$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.platform_rules",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "digital_only",
    "expertise_domain": "platform_governance.online_communities",
    "classification_reasoning": "Category 'community.governance.platform_rules' at 'global_digital' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.05,
    "w_semantic": 0.4,
    "w_social": 0.2
  },
  "relevance_weights_reasoning": "Being a user and role type are gating; interest in governance is strong; social ties within platform community are significant; geography minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "user"
          },
          {
            "field": "role",
            "op": "in",
            "value": [
              "admin",
              "moderator",
              "active_member"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: registered_user = true, role IN ('admin','moderator','active_member')."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50000.0,
    "sigma_distance_meters": 40000.0,
    "geo_reasoning": "Users can be widely distributed; \u03bc and \u03c3 large ensure geography plays only a small role compared to D, S and X."
  },
  "expertise_weights": {
    "w_education": 0.35,
    "w_experience": 0.35,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Governance/ethics/legal education and experience in moderating/operating digital communities both matter; resources (moderation tools, staff) are also important.",
  "expertise_domain_parameters": {
    "expertise_domain": "platform_governance.online_communities",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain platform_governance.online_communities with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.3,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "All users are relevant, but platform governance, moderation, and ethics Expertise is important. Contribution is high to prioritize consistently constructive participants."
}
```

---

### 92. Local online community group moderation rules

- **Category**: `community.governance.local_forum`
- **Scope Type**: `city`
- **Digital/Physical**: `hybrid`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `online_community.moderation_practice`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.25$, $w_S=0.25$, $w_X=0.15$
- **Geographic Radius**: $\mu=3000.0$, $\sigma=2500.0$
- **Demographic Filters**: `member_of_group = true, lives_in_locality = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.25$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.local_forum",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "hybrid",
    "expertise_domain": "online_community.moderation_practice",
    "classification_reasoning": "Category 'community.governance.local_forum' at 'city' scope. Physical/digital classification is 'hybrid'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.25,
    "w_semantic": 0.25,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Membership and local residency gate relevance; interest in community talk and social ties inside group modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "group_member"
          },
          {
            "field": "city_name",
            "op": "==",
            "value_source": "issue.city_name"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: member_of_group = true, lives_in_locality = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 3000.0,
    "sigma_distance_meters": 2500.0,
    "geo_reasoning": "Even though the forum is online, it is restricted to a locality; \u03bc and \u03c3 mirror the physical neighborhood or city section that the group targets."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "Conflict resolution/communication education helps, but practical moderation experience and resources (tools, guidelines) are central.",
  "expertise_domain_parameters": {
    "expertise_domain": "online_community.moderation_practice",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain online_community.moderation_practice with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.25,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Group members are relevant, but moderation and conflict-resolution Expertise matters; Contribution is high to elevate long-term constructive members."
}
```

---

### 93. Online political discussion space rules

- **Category**: `community.governance.political_forum`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `political_discourse.online_forum_governance`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.05$, $w_S=0.45$, $w_X=0.20$
- **Geographic Radius**: $\mu=50000.0$, $\sigma=40000.0$
- **Demographic Filters**: `member_of_political_forum = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.30$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.political_forum",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "political_discourse.online_forum_governance",
    "classification_reasoning": "Category 'community.governance.political_forum' at 'global_digital' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.05,
    "w_semantic": 0.45,
    "w_social": 0.2
  },
  "relevance_weights_reasoning": "Topical engagement is primary; role in forum and social ties in political circles matter; geography is minor.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "forum_member"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: member_of_political_forum = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50000.0,
    "sigma_distance_meters": 40000.0,
    "geo_reasoning": "Participation can be national or global; geography is nearly irrelevant, so \u03bc and \u03c3 are very large."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Political theory/free speech law education and practical moderation/organizing experience both matter; resources (platform reach, tools) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "political_discourse.online_forum_governance",
    "contemporary_importance": 0.9,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain political_discourse.online_forum_governance with contemporary importance 0.9 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.3,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Participants are relevant, but democratic norms, free-speech law, and moderation Expertise matter; Contribution gives weight to those with a record of thoughtful engagement rather than trolling."
}
```

---

### 94. Neighborhood digital platform onboarding/invite rules

- **Category**: `community.governance.neighborhood_app`
- **Scope Type**: `neighborhood`
- **Digital/Physical**: `hybrid`
- **Technicality**: `medium`
- **Safety**: `low`
- **Domain**: `civic_tech.neighborhood_app_design`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.40$, $w_G=0.30$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=800.0$, $\sigma=700.0$
- **Demographic Filters**: `lives_in_neighborhood = true, registered_or_invited = true`
- **Expertise Weights**: $w_{Edu}=0.30$, $w_{Exp}=0.40$, $w_{Res}=0.30$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.25$, $w_{Con}=0.25$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.neighborhood_app",
    "scope_type": "neighborhood",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "medium",
    "safety_sensitivity": "low",
    "digital_or_physical": "hybrid",
    "expertise_domain": "civic_tech.neighborhood_app_design",
    "classification_reasoning": "Category 'community.governance.neighborhood_app' at 'neighborhood' scope. Physical/digital classification is 'hybrid'. Technicality level is 'medium' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.4,
    "w_geographic": 0.3,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents of the neighborhood are gated by demographic and geographic factors; interest in digital participation and local social ties modulate.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "neighborhood_id",
            "op": "==",
            "value_source": "issue.neighborhood_id"
          },
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "registered",
              "invited"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_neighborhood = true, registered_or_invited = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 800.0,
    "sigma_distance_meters": 700.0,
    "geo_reasoning": "Access is tied to living in or near a particular neighborhood; \u03bc and \u03c3 align with that area so that G is high inside the defined neighborhood and drops outside."
  },
  "expertise_weights": {
    "w_education": 0.3,
    "w_experience": 0.4,
    "w_resources": 0.3
  },
  "expertise_weights_reasoning": "UX/privacy/product education, experience running neighborhood apps, and resources (support, outreach tools) all matter, with experience slightly primary.",
  "expertise_domain_parameters": {
    "expertise_domain": "civic_tech.neighborhood_app_design",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain civic_tech.neighborhood_app_design with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "high",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.25,
    "w_contribution": 0.25
  },
  "aggregation_reasoning": "Residents are relevant, but platform design, privacy, and inclusion Expertise are also important; Contribution prioritizes neighbors with consistent positive participation."
}
```

---

### 95. Local election procedure (polling places, voter roll)

- **Category**: `community.governance.elections_local`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `elections.administration.local`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.60$, $w_G=0.25$, $w_S=0.10$, $w_X=0.05$
- **Geographic Radius**: $\mu=4000.0$, $\sigma=3500.0$
- **Demographic Filters**: `eligible_voter_in_district = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.40$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.35$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.elections_local",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "elections.administration.local",
    "classification_reasoning": "Category 'community.governance.elections_local' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.6,
    "w_geographic": 0.25,
    "w_semantic": 0.1,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Formal voter eligibility is gating; district residency matters; political interest and social ties are minor modifiers.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "eligible_voter",
            "op": "==",
            "value": true
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: eligible_voter_in_district = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 4000.0,
    "sigma_distance_meters": 3500.0,
    "geo_reasoning": "Procedures affect voters across a municipality; \u03bc and \u03c3 approximate the city scale, making G similar within its boundaries."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.4,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Electoral law and public administration education plus experience administering elections are critical; resources (staff, locations) matter but are secondary in expertise weighting.",
  "expertise_domain_parameters": {
    "expertise_domain": "elections.administration.local",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain elections.administration.local with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.35,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Eligible voters are relevant, but legal and electoral process Expertise is crucial. Contribution is smaller but recognizes people who uphold fair process."
}
```

---

### 96. Local policy debate (e.g., nightlife regulation)

- **Category**: `community.governance.policy_debate`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `public_policy.local_nightlife_regulation`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.40$, $w_S=0.20$, $w_X=0.05$
- **Geographic Radius**: $\mu=4000.0$, $\sigma=3500.0$
- **Demographic Filters**: `lives_or_operates_business_in_area = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.30$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.policy_debate",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "public_policy.local_nightlife_regulation",
    "classification_reasoning": "Category 'community.governance.policy_debate' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.4,
    "w_semantic": 0.2,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Impact is determined by local residence/operation and role; interest in policy is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "resident",
              "business_owner"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_or_operates_business_in_area = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 4000.0,
    "sigma_distance_meters": 3500.0,
    "geo_reasoning": "Nightlife regulation affects residents and businesses across the affected zones; \u03bc and \u03c3 are tuned to the relevant district or city center area."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Legal, planning and social science education and experience working on local policy are central; resources (data, enforcement capacity) are supportive.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_policy.local_nightlife_regulation",
    "contemporary_importance": 0.7,
    "recency_decay_rate": 0.04,
    "age_penalty_threshold": 65,
    "CBC_adjustment_factor": 1.05,
    "domain_reasoning": "Evolving domain public_policy.local_nightlife_regulation with contemporary importance 0.7 and decay rate 0.04."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.3,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Residents and businesses affected are relevant; policy, urban planning and legal Expertise matter; Contribution is moderate."
}
```

---

### 97. City budget participatory allocation

- **Category**: `community.governance.budget_city`
- **Scope Type**: `city`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `public_finance.municipal_budgeting`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.35$, $w_S=0.20$, $w_X=0.10$
- **Geographic Radius**: $\mu=5000.0$, $\sigma=4500.0$
- **Demographic Filters**: `city_resident_or_taxpayer = true`
- **Expertise Weights**: $w_{Edu}=0.45$, $w_{Exp}=0.35$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.35$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.budget_city",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "public_finance.municipal_budgeting",
    "classification_reasoning": "Category 'community.governance.budget_city' at 'city' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.35,
    "w_semantic": 0.2,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Residents and taxpayers of the city are gated by demographic and geographic factors; interest in specific domains and social networks modestly adjust relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "resident",
              "taxpayer"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: city_resident_or_taxpayer = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 5000.0,
    "sigma_distance_meters": 4500.0,
    "geo_reasoning": "The budget affects all city residents; \u03bc and \u03c3 cover the city area so that G is approximately uniform for everyone living there."
  },
  "expertise_weights": {
    "w_education": 0.45,
    "w_experience": 0.35,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Public finance and budgeting education is highly important; experience working with budgets also matters; resources (access to data) are helpful but less central.",
  "expertise_domain_parameters": {
    "expertise_domain": "public_finance.municipal_budgeting",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain public_finance.municipal_budgeting with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.35,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Residents and taxpayers are relevant, but budgeting, economic and public policy Expertise is very important; Contribution favors those with constructive, non-clientelist participation."
}
```

---

### 98. Zoning / building permit for new development

- **Category**: `community.governance.zoning`
- **Scope Type**: `district`
- **Digital/Physical**: `physical`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `urban_planning.zoning_and_permits`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.50$, $w_S=0.15$, $w_X=0.05$
- **Geographic Radius**: $\mu=1500.0$, $\sigma=1300.0$
- **Demographic Filters**: `property_owner_or_tenant_near_site = true, business_owner_near = true`
- **Expertise Weights**: $w_{Edu}=0.45$, $w_{Exp}=0.35$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.35$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.zoning",
    "scope_type": "district",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "physical",
    "expertise_domain": "urban_planning.zoning_and_permits",
    "classification_reasoning": "Category 'community.governance.zoning' at 'district' scope. Physical/digital classification is 'physical'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.5,
    "w_semantic": 0.15,
    "w_social": 0.05
  },
  "relevance_weights_reasoning": "Property users and nearby residents are gated by demographic and geographic factors; interest in urban planning is secondary.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains_any",
            "value": [
              "owner",
              "tenant"
            ]
          },
          {
            "field": "roles",
            "op": "array_contains",
            "value": "business_owner"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: property_owner_or_tenant_near_site = true, business_owner_near = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 1500.0,
    "sigma_distance_meters": 1300.0,
    "geo_reasoning": "Zoning decisions are most salient to people living and working near the site; \u03bc is at the development location and \u03c3 covers several surrounding neighborhoods."
  },
  "expertise_weights": {
    "w_education": 0.45,
    "w_experience": 0.35,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Urban planning and law education and experience with zoning processes are central; resources (analytical tools, legal support) are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "urban_planning.zoning_and_permits",
    "contemporary_importance": 0.8,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain urban_planning.zoning_and_permits with contemporary importance 0.8 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.35,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "Nearby residents and businesses are relevant; urban planning, environmental and legal Expertise is critical; Contribution is moderate."
}
```

---

### 99. Data privacy policy of a widely used local app

- **Category**: `community.governance.digital_privacy`
- **Scope Type**: `global_digital`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `low`
- **Domain**: `data_privacy.app_governance`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.30$, $w_G=0.10$, $w_S=0.45$, $w_X=0.15$
- **Geographic Radius**: $\mu=50000.0$, $\sigma=40000.0$
- **Demographic Filters**: `registered_user_of_app = true`
- **Expertise Weights**: $w_{Edu}=0.45$, $w_{Exp}=0.35$, $w_{Res}=0.20$
- **Aggregation Weights**: $w_{Rel}=0.45$, $w_{Exp}=0.40$, $w_{Con}=0.15$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "community.governance.digital_privacy",
    "scope_type": "global_digital",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "low",
    "digital_or_physical": "digital_only",
    "expertise_domain": "data_privacy.app_governance",
    "classification_reasoning": "Category 'community.governance.digital_privacy' at 'global_digital' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'low'."
  },
  "relevance_weights": {
    "w_demographic": 0.3,
    "w_geographic": 0.1,
    "w_semantic": 0.45,
    "w_social": 0.15
  },
  "relevance_weights_reasoning": "Users of the app are gated demographically; semantic concern for privacy dominates; social graph (friends on app) influences relevance.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "roles",
            "op": "array_contains",
            "value": "user"
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: registered_user_of_app = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 50000.0,
    "sigma_distance_meters": 40000.0,
    "geo_reasoning": "Users may be spread over a country or globally; geography is largely irrelevant, so \u03bc and \u03c3 are huge and G is nearly flat."
  },
  "expertise_weights": {
    "w_education": 0.45,
    "w_experience": 0.35,
    "w_resources": 0.2
  },
  "expertise_weights_reasoning": "Privacy/security/legal education and practical experience in data protection are central; resources (security tooling, legal teams) are secondary.",
  "expertise_domain_parameters": {
    "expertise_domain": "data_privacy.app_governance",
    "contemporary_importance": 0.95,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.15,
    "domain_reasoning": "Evolving domain data_privacy.app_governance with contemporary importance 0.95 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "low",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "medium",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.45,
    "w_expertise": 0.4,
    "w_contribution": 0.15
  },
  "aggregation_reasoning": "App users are relevant, but privacy/security Expertise is central; Contribution recognizes those who engage constructively in digital rights discussions."
}
```

---

### 100. Online fraud / scam warning system settings for local community

- **Category**: `safety.digital.local_fraud`
- **Scope Type**: `city`
- **Digital/Physical**: `digital_only`
- **Technicality**: `high`
- **Safety**: `high`
- **Domain**: `cybersecurity.consumer_fraud_prevention`

#### Weights & Rules Summary
- **Relevance Weights**: $w_D=0.35$, $w_G=0.30$, $w_S=0.25$, $w_X=0.10$
- **Geographic Radius**: $\mu=5000.0$, $\sigma=4000.0$
- **Demographic Filters**: `lives_in_locality = true, uses_online_banking_or_ecommerce = true`
- **Expertise Weights**: $w_{Edu}=0.40$, $w_{Exp}=0.35$, $w_{Res}=0.25$
- **Aggregation Weights**: $w_{Rel}=0.50$, $w_{Exp}=0.30$, $w_{Con}=0.20$

#### Combined JSON Block
```json
{
  "classification": {
    "issue_category": "safety.digital.local_fraud",
    "scope_type": "city",
    "affected_roles": [
      "resident"
    ],
    "affected_vulnerabilities": [],
    "technicality_level": "high",
    "safety_sensitivity": "high",
    "digital_or_physical": "digital_only",
    "expertise_domain": "cybersecurity.consumer_fraud_prevention",
    "classification_reasoning": "Category 'safety.digital.local_fraud' at 'city' scope. Physical/digital classification is 'digital_only'. Technicality level is 'high' based on knowledge requirement, and safety sensitivity is 'high'."
  },
  "relevance_weights": {
    "w_demographic": 0.35,
    "w_geographic": 0.3,
    "w_semantic": 0.25,
    "w_social": 0.1
  },
  "relevance_weights_reasoning": "Local residents using digital finance tools are gated by demographic and geographic factors; interest in fraud prevention and ties to victims add semantic and social weight.",
  "demographic_rules": {
    "tiers": [
      {
        "tier_id": "D_1_0",
        "score": 1.0,
        "conditions": [
          {
            "field": "city_name",
            "op": "==",
            "value_source": "issue.city_name"
          },
          {
            "field": "behavior",
            "op": "array_contains_any",
            "value": [
              "online_banking",
              "ecommerce"
            ]
          }
        ],
        "explanation": "Full demographic relevance for eligible users matching filters: lives_in_locality = true, uses_online_banking_or_ecommerce = true."
      }
    ]
  },
  "geographic_parameters": {
    "mu_distance_meters": 5000.0,
    "sigma_distance_meters": 4000.0,
    "geo_reasoning": "The warning system targets a local or regional community; \u03bc and \u03c3 match that regional scale so G is high across the intended population area."
  },
  "expertise_weights": {
    "w_education": 0.4,
    "w_experience": 0.35,
    "w_resources": 0.25
  },
  "expertise_weights_reasoning": "Cybersecurity/fraud prevention education and field experience are key; resources (monitoring tools, partnerships with banks/police) are also meaningful.",
  "expertise_domain_parameters": {
    "expertise_domain": "cybersecurity.consumer_fraud_prevention",
    "contemporary_importance": 0.95,
    "recency_decay_rate": 0.05,
    "age_penalty_threshold": 60,
    "CBC_adjustment_factor": 1.1,
    "domain_reasoning": "Evolving domain cybersecurity.consumer_fraud_prevention with contemporary importance 0.95 and decay rate 0.05."
  },
  "resources_needed": [
    {
      "resource_type": "money_budget",
      "importance_level": "medium",
      "explanation": "Financial budget is required to fund the activities, services, or materials."
    },
    {
      "resource_type": "digital_infrastructure",
      "importance_level": "medium",
      "explanation": "Server capacity, development tools, and digital platforms are required."
    },
    {
      "resource_type": "professional_services",
      "importance_level": "medium",
      "explanation": "Licensed experts or professional consultation is required to execute this legally and safely."
    }
  ],
  "aggregation_weights": {
    "w_relevance": 0.5,
    "w_expertise": 0.3,
    "w_contribution": 0.2
  },
  "aggregation_reasoning": "Local digital users are relevant; cybersecurity and fraud-prevention Expertise is important; Contribution is significant for those who consistently help detect and warn about scams."
}
```

---
