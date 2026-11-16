---
name: "Calculate ISR Relevance"
description: "Triggers when working with relevance, expertise, contribution, ISR scoring mathematics, or user weights."
---

# Calculate ISR Relevance and scoring

Read specs/README.md and the task spec. The governing formulas live in specs/decisions/PD-8-resources-option-level.md (Expertise, no Education/Experience/resource weights), specs/decisions/PD-9-multi-reference-derivation.md (intended mr1), specs/03-relevance.md, specs/04-expertise.md and specs/06-aggregation-and-voting.md. Link to these rather than maintain different formulas here.

Distinguish intended model from implemented code. At3c25ef7, functions/isr.js and scripts/isr_core.py are canonical, with one issue vector, an education age floor, public-mean normalized R/E and normalized Contribution constant1. The current app still gates D/geography and uses creator-based X; PD-9's multi-reference/affected-person changes are not implemented. Automatic threshold is strictly R>.15 with existing creator/Join exceptions; do not substitute >=.15. Resources and property give no Expertise weight.

For intended mr1, use one consistent s_j/alpha_j/u_j notation and PD-9's paired relevance, max geography, education-evidence-before-single-floor and one-public ISR. X uses directly affected people's recorded outgoing relationships, not the creator's. No reciprocal or transitive links inferred. Do not implement runtime policy or change historical scores merely because a document specifies intended behavior. Follow task approval, tests, versioning and live-write guardrails.

Under mr1-context-review-1, more than three raw references triggers context review. Context determines user clarification or splitting; clear input can pass unchanged. Normalize alpha over the recorded reviewed compatible set J, never silently truncate to three or blend every raw candidate. The aspect/resource bound needs implementation approval.
