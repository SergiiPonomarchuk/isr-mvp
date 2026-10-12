---
name: "Calculate ISR Relevance"
description: "Triggers when working with relevance, expertise, contribution, ISR scoring mathematics, or user weights."
---

# Calculate ISR Relevance & Scoring

When working with user scores, voting weights, and relevance, you must use these exact formulas and definitions. Do not invent new scoring mechanisms.

## 1. ISR Score Aggregation
The ISR score is computed per-issue and determines a user's **voting weight**.
```text
ISR_Score = w_Relevance · Relevance_i + w_Expertise · Expertise_i + w_Contribution · Contribution_i
```
- The sum of `w_Relevance`, `w_Expertise`, and `w_Contribution` is always `1.0`.
- Per-issue weights (`w_*`) are set by the AI Issue Analyzer at creation time.

## 2. Relevance
Relevance measures how directly an issue affects a specific user (0.0–1.0).
```text
Relevance_i = w_D·D_i + w_G·G_i + w_S·S_i + w_X·X_i
```
- **D (Demographic)**
- **G (Geospatial)**
- **S (Semantic)**
- **X (Social)**
- **Threshold**: The default Relevance Threshold hardcoded in the engine is `0.15`. Users with `Relevance >= Threshold` are automatically added to the issue's ad-hoc public.

## 3. Expertise
Expertise measures domain knowledge and capability.
```text
Expertise = w_Education·Education + w_Experience·Experience + w_Resources·Resources
```

## 4. Contribution & Vector of Values (VoV)
- **Contribution** measures the quality and value-alignment of actions taken.
- **Action Vector**: Structured representation of a specific real-world action, scored -100 to +100 per dimension.
- **Vector of Values (VoV)**: A 145-dimensional vector (0-100 per dimension), based on Shalom Schwartz's taxonomy.
- Contribution calculation: `Action Force × cosine_similarity(Action Vector, Vector of Values)`
