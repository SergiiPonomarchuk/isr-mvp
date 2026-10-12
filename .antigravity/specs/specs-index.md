# ISR MVP Specifications Directory

This document maintains the canonical index of all MVP specifications, protocols, and architectural documents for the ISR Vote project. Keep this index synchronized whenever specifications are added, deprecated, or updated during development.

---

## 1. Master Architecture & Project Governance

* **[ISR_PROJECT_MANIFESTO.md](file:///c:/isr-mvp/ISR_PROJECT_MANIFESTO.md)**
  * **Role:** Authoritative single source of truth for the entire project. All code and documentation must strictly adhere to the guidelines established here.
  * **Contents:** Core definitions (Ad-hoc Public / Public of Appearance, Issue, ISR Score, VoV), architectural principles, strict terminology constraints ("To Do", "Issue", "Ad-hoc Public"), forbidden patterns, canonical collections matrix, and document map.

* **[.antigravity/project-map.md](file:///c:/isr-mvp/.antigravity/project-map.md)**
  * **Role:** Architectural boundary map and code constraints for AI-assisted development.
  * **Contents:** Directory layout, forbidden modification boundaries (navbar, `#menu`, Firestore field schema, direct `localStorage` access), UI class reuse guidelines, 6 canonical Firestore collection access rules, and approved `localStorage` keys.

* **[.antigravity/specs/mvp-current-spec.md](file:///c:/isr-mvp/.antigravity/specs/mvp-current-spec.md)**
  * **Role:** Master baseline specification of the current live MVP.
  * **Contents:** Current feature set, aggregation formula breakdown, the 0.15 relevance threshold rule, single-page navigation model (`#section-modal-overlay`), section-to-container ID mappings (`chat`, `voting`, `tasks`, `values`, `profile`, `actions`, `settings`), dashboard interaction patterns, and Chat section discussions list UI specification (display of member-specific Relevance and ISR scores).

* **[docs/MVP-Development-Documentation.md](file:///c:/isr-mvp/docs/MVP-Development-Documentation.md)**
  * **Role:** Frontend design guidelines and modal creation manual.
  * **Contents:** Design standards for reusable dialog overlays (`.YOUR-modal-overlay`), dialog cards (`.YOUR-modal-dialog`), unified 36px circular close buttons, capsule buttons (`border-radius: 999px`), form input overrides, and step-by-step modal creation instructions.

---

## 2. Scoring System & Mathematical Protocols

* **[docs/ISR-Relevance-Implementation.md](file:///c:/isr-mvp/docs/ISR-Relevance-Implementation.md)**
  * **Role:** Relevance Engine specification.
  * **Contents:** Mathematical models and formulas for the four relevance dimensions:
    * **Demographic ($D$):** Age, gender, role, household matching.
    * **Geospatial ($G$):** Gaussian-fade distance decay formula based on issue impact center and radius.
    * **Semantic ($S$):** Topic-interest alignment.
    * **Social ($X$):** Social network proximity.
    Includes client-side calculation guidelines, weight bounds, and thresholding (0.15).

* **[docs/ISR-Expertise-Assessment-v1.md](file:///c:/isr-mvp/docs/ISR-Expertise-Assessment-v1.md)**
  * **Role:** Complete implementation specification for user expertise assessment.
  * **Contents:** Absolute unbounded scoring ($[0.0, +\infty)$) measuring domain competence and resource capability. Defines verification tiers (self-declared, peer-endorsed, credential-verified) and decay models over time.

* **[docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md](file:///c:/isr-mvp/docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md)**
  * **Role:** Action Vectorization & Contribution scoring protocol.
  * **Contents:** Guidelines for converting user actions, completed tasks, and discussions into 145-dimensional action vectors ($-100$ to $+100$); calculating alignment against the community's Vector of Values (VoV); and evaluating action magnitude and psychological impact into a final Contribution score.

* **[docs/ISR-AI-Weight-Evaluation-Instructions.md](file:///c:/isr-mvp/docs/ISR-AI-Weight-Evaluation-Instructions.md)**
  * **Role:** Prompting and evaluation instructions for AI-driven issue weight assignment.
  * **Contents:** Decision criteria and mathematical constraints for assigning per-issue component weights:
    * Relevance weights: $w_D, w_G, w_S, w_X$ ($\sum = 1.0$)
    * Composite ISR aggregation weights: $w_{\text{Relevance}}, w_{\text{Expertise}}, w_{\text{Contribution}}$ ($\sum = 1.0$)

---

## 3. Values System & Vectorization

* **[docs/ISR-Values-Taxonomy-v1.md](file:///c:/isr-mvp/docs/ISR-Values-Taxonomy-v1.md)**
  * **Role:** Complete Vector of Values (VoV) taxonomy reference.
  * **Contents:** 145-dimensional value taxonomy rooted in Shalom Schwartz’s universal value types, tailored for civic community futures (e.g., Benevolence, Universalism, Security, Self-Direction) with scoring criteria from $0$ to $100$.

* **[docs/ISR_Values_Vectorization_Protocol_v1.md](file:///c:/isr-mvp/docs/ISR_Values_Vectorization_Protocol_v1.md)**
  * **Role:** Two-step AI vectorization protocol with intelligent skipping.
  * **Contents:** Algorithm for transforming free-text values descriptions into a 145-element numeric vector:
    * **Phase 1 (Domain Discovery):** Rapid screening to detect active domains and skip irrelevant dimensions.
    * **Phase 2 (Conditional Item Evaluation):** Detailed scoring of relevant dimensions to minimize token cost and latency.

* **[docs/User_Guide_Values_Description_v1.md](file:///c:/isr-mvp/docs/User_Guide_Values_Description_v1.md)**
  * **Role:** End-user guide for crafting value statements.
  * **Contents:** Instructions and prompts helping community members describe the future they desire for their ad-hoc public and the actions they value, preparing them for vectorization.

---

## 4. Issue Analyzer Protocols & Reference Data

* **[docs/ISR-Issue-Analyzer-Protocol-v1.md](file:///c:/isr-mvp/docs/ISR-Issue-Analyzer-Protocol-v1.md)**
  * **Role:** Cloud Function protocol for newly created issues (NoSQL / Firebase).
  * **Contents:** Specification for the AI Issue Analyzer that processes raw user submissions and outputs starting parameters: issue type, geospatial parameters (center, radius, fade), affected demographic profiles, semantic tags, and component weight distributions.

* **[docs/ISR-Issue-Analyzer-100-Examples.md](file:///c:/isr-mvp/docs/ISR-Issue-Analyzer-100-Examples.md)**
  * **Role:** Calibrated benchmark dataset of 100 anchor issues.
  * **Contents:** 100 concrete, real-world civic situations with baseline ground-truth outputs for relevance weights ($w_D, w_G, w_S, w_X$), geospatial impact envelopes, and aggregation weights to anchor AI consistency.

* **[docs/ISR-Issue-Request-Guide.md](file:///c:/isr-mvp/docs/ISR-Issue-Request-Guide.md)**
  * **Role:** User submission guide and issue creation template.
  * **Contents:** Instructions for community members on how to define an issue clearly (scope, location, target outcome, urgency) to ensure high-accuracy AI classification.

* **[docs/mvp.html](file:///c:/isr-mvp/docs/mvp.html)**
  * **Role:** Reference static wireframe / layout documentation used during initial MVP design phases.
