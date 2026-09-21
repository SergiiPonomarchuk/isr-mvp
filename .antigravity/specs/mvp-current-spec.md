# Current MVP Specification

This document serves as the master specification of the ISR Vote MVP as it currently exists.

## Core Definitions

- **Microcommunity**: The primary social unit of ISR. A self-identified group of people sharing a common civic context, jointly governing issues within that context. Ephemeral, issue-driven structures that disband when the issue is resolved. Each has its own Vector of Values.
- **Issue**: A specific civic problem or decision addressed together. Lifecycle: `active` → voting → resolution → `inactive`. The canonical term is "issue".
- **ISR Score**: A composite numeric indicator of a member's social responsibility measuring alignment between their contributions and the community's values.
- **Relevance**: A continuous score (0.0–1.0) measuring how directly an issue affects a specific user. Determines voting weight. Dimensions: Demographic (D), Geospatial (G), Semantic (S), Social (X).
- **Expertise**: A score measuring domain knowledge and capability to contribute to a solution.
- **Contribution**: A score measuring the quality and value-alignment of actions taken toward resolving an issue.
- **Vector of Values (VoV)**: A microcommunity's (or user's) structured representation of shared ideals in a 145-dimensional vector (0-100 per dimension), based on Shalom Schwartz's taxonomy.
- **Action Vector**: Structured representation of a specific real-world action, scored -100 to +100 per dimension.

## ISR Score System & Thresholds

### Aggregation Formula

The ISR score is computed per-issue:
```
ISR_Score = w_Relevance · Relevance_i
          + w_Expertise · Expertise_i
          + w_Contribution · Contribution_i
```
- The sum of `w_Relevance`, `w_Expertise`, and `w_Contribution` is `1.0`.
- ISR_Score determines **voting weight** (e.g., ISR_Score 0.9 = 9x voting weight compared to ISR_Score 0.1).
- Per-issue weights (`w_*`) are set by the AI Issue Analyzer at creation time.

### Hardcoded Threshold Rules

- **Relevance Threshold**: Default Relevance Threshold hardcoded in the Relevance Engine is 0.15. Users with `Relevance >= Threshold` are automatically added to the issue microcommunity. Relevance Threshold can be changed during issue creation.

## Navigation Logic (Single-Page Application)

The prototype operates as a single-page application (SPA). All navigation happens via section modals (overlays).

### Section IDs & Mapping
- `chat` (Chat) - Issue discussions / active topics
- `voting` (Voting) - Issues open for voting
- `tasks` (To Do) - Implementation task tracker
- `values` (Values) - Personal values description & vector
- `profile` (Profile) - User demographic profile
- `actions` (Actions) - User action history & ISR log
- `settings` (Settings) - App preferences

### Navigation Modals
There is **one** shared section modal overlay (`#section-modal-overlay` / `#section-modal-body` / `#section-modal-title`).
- Clicking an element with `data-section="[id]"` copies the content of the hidden source container (`#section-[id]`) into `#section-modal-body` and shows the overlay.
- Topic detail views are rendered **inside** the same modal body, replacing the list view.
- Back navigation (`modal-close-btn`): The first close action restores the list view if a topic detail is open. The second close action dismisses the modal entirely.

### Dashboard Interactivity
- Dashboard cards (Chat, Voting, To Do) behave as large buttons. Clicking anywhere on a card opens the respective section modal.
- Event delegation on `document` is used for `[data-section]` clicks. Preview items within dashboard cards deliberately stop event propagation so that they can be handled separately from the overall card click.
