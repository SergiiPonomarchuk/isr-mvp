# Current MVP Specification

This document serves as the master specification of the ISR Vote MVP as it currently exists.

## Core Definitions

- **Ad-Hoc Public / Public of Appearance**: The primary social unit of ISR (formally the **Public of Appearance** in philosophy and political science, or **ad-hoc public** in technical context, and **the public** in ongoing explanations). A self-identified group of people sharing a common civic context, jointly governing issues within that context. Ephemeral, issue-driven structures that disband when the issue is resolved. Each has its own Vector of Values.
- **Issue**: A specific civic problem or decision addressed together. Lifecycle: `active` → voting → resolution → `inactive`. The canonical term is "issue".
- **ISR Score**: A composite numeric indicator of a member's social responsibility measuring alignment between their contributions and the public's values.
- **Relevance**: A continuous score (0.0–1.0) measuring how directly an issue affects a specific user. Determines voting weight. Dimensions: Demographic (D), Geospatial (G), Semantic (S), Social (X).
- **Expertise**: A score measuring domain knowledge and capability to contribute to a solution.
- **Contribution**: A score measuring the quality and value-alignment of actions taken toward resolving an issue.
- **Vector of Values (VoV)**: An ad-hoc public's (or user's) structured representation of shared ideals in a 145-dimensional vector (0-100 per dimension), based on Shalom Schwartz's taxonomy.
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

- **Relevance Threshold**: Default Relevance Threshold hardcoded in the Relevance Engine is 0.15. Users with `Relevance >= Threshold` are automatically added to the issue's ad-hoc public. Relevance Threshold can be changed during issue creation.

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

## Section Views & Modals UI Specifications

### Chat Section (Discussions List Modal View)
When opening the `Chat` section modal (`#section-modal-overlay` with title `Chat`), the view renders the active discussions list inside `#section-modal-body` (mirrored from `#section-chat`):

1. **Header Controls**:
   - **Filter Tags (`.search-filter-tags`)**:
     - `new [count]`: Discussions with unread messages for the active user.
     - `important [count]`: Discussions where the active user's Relevance $\ge$ 60% (0.60).
     - `urgent [count]`: Discussions with deadlines within 7 days.
   - **Search Bar (`.topic-input-row`)**: Search input and search button to filter topics.
   - **Start New Issue Topic (`#chat-new-topic-btn`)**: Capsule button to initiate the Issue Creation wizard.

2. **Discussions List Items (`.topic-item[data-topic-type="chat"]`)**:
   Each list item represents an active issue discussion in the ad-hoc public and is structured as follows:
   - **Topic Header (`.topic-header`)**:
     - **Title & Status (`.topic-name`)**:
       - Category Emoji prefix (e.g., 🏠 Building, 💃 Culture, 🎒 Education, 💻 Tech, 🏛️ Civic).
       - Status Indicator Icon:
         - `✅` Approved / Completed
         - `☠️` Canceled
         - `⬅️` Discussion phase
         - `🔴` Urgent / Blocker (deadline $\le$ 7 days or high priority)
         - `🟡` In progress / Warning
         - `🟢` Unread messages or normal active status
       - High Relevance Star (`⭐`): Displayed when user's Relevance $\ge$ 60% (0.60).
       - Topic Title text.
     - **Metadata (`.topic-meta`)**:
       - **Deadline / Status**: `Ends: [DD.MM.YYYY]` or `Ongoing`.
       - **User Relevance**: Current active member's Relevance score for the topic formatted as an integer percentage, e.g. `Relevance: 85%` (rendered as `Relevance: <b>85%</b>`).
       - **User ISR-Score**: Current active member's calculated ISR composite indicator formatted to two decimal places, e.g. `ISR: 1.28` (rendered as `ISR: <b>1.28</b>`).
   - **Preview Line (`.topic-preview`)**:
     - Timestamp of the last message formatted per user date settings.
     - Sender Display Name and ID: `[Sender Name] (ID: [uid])`.
     - Message Snippet: Text content of the latest message in the discussion thread.
