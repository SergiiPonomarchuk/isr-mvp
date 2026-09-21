# ISR Project Manifesto
### Ground Truth for AI-Assisted Development

**Version**: 1.0 · **Last updated**: 2026-06-27
**Scope**: All code, UI, naming, architecture, and documentation decisions for this repository.

> [!IMPORTANT]
> This document is the authoritative source of truth. When any other file contradicts this manifesto, this manifesto takes precedence. AI agents must read this file before making any changes to the project.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Core Definitions](#2-core-definitions)
3. [Data Architecture](#3-data-architecture)
4. [The ISR Score System](#4-the-isr-score-system)
5. [UI / UX Constraints](#5-ui--ux-constraints)
6. [Code Patterns & Conventions](#6-code-patterns--conventions)
7. [Forbidden Patterns](#7-forbidden-patterns)
8. [Document Map](#8-document-map)

---

## 1. What This Project Is

**ISR** stands for **Index of Social Responsibility**.

ISR is a civic governance platform for **microcommunities** — small groups of people who share a common context (a building, neighborhood, workplace, online collective, etc.) and want to make collective decisions transparently and fairly.

The current deliverable is an **MVP prototype** (`/prototype/index.html` + `/prototype/js/main.js` + `/prototype/styles.css`) backed by Firebase Firestore. It allows microcommunity members to:

- View and discuss civic **issues** (discussions → "Chat" section).
- **Vote** on proposed resolutions to issues.
- Track implementation **tasks** (To Do section).
- Define personal **values** that inform how contributions are weighted.
- See their **ISR score** and action history.

The prototype uses a **single-page application** model. All navigation is via section modals (overlays), not multi-page routing.

---

## 2. Core Definitions

These definitions are fixed. Do not use synonyms, do not invent new terms, do not revert to generic web-app terminology.

### 2.1 Microcommunity

> A **microcommunity** is the primary social unit of ISR. It is a small, self-identified group of people who share a common civic context and jointly govern issues within that context.

- **Not** a "team", "group", "organization", "workspace", or "community" in a generic sense.
- A microcommunity can be: residents of a building, members of a street council, an online collective, a workplace sub-group, etc.
- A microcommunity has its own **Vector of Values** — a shared statement of what it values.
- A single user can belong to multiple microcommunities simultaneously.
- When an **issue** is resolved and the process is complete, the microcommunity that formed around it is **disbanded** (dissolved), not archived. Microcommunities are ephemeral, issue-driven structures.

### 2.2 Issue

> An **issue** is a specific civic problem or decision that a microcommunity needs to address together.

- Issues have a lifecycle: `active` → voting → resolution → `inactive` (closed).
- Issues are stored in the Firestore `discussions` (Chat), `voting`, and `tasks` collections depending on their current phase.
- Issues are **not** bugs, tickets, or feature requests. They are real-world civic problems.
- The canonical term is **"issue"**. Not "problem", "topic", or "proposal" as standalone nouns.

### 2.3 ISR Score

> The **ISR score** is a composite numeric indicator of a member's social responsibility within their microcommunity. It is not a reputation score or a rating — it is a measure of alignment between one's contributions and the community's stated values.

- ISR Score = `w_Relevance · Relevance + w_Expertise · Expertise + w_Contribution · Contribution`
- Weights (`w_Relevance`, `w_Expertise`, `w_Contribution`) are set per-issue by the AI Issue Analyzer.
- The score is **not** cumulative karma. It is recalculated per-issue context.

### 2.4 Relevance

> **Relevance** is a continuous score (0.0–1.0) measuring how directly an issue and its resolution will affect a specific user.

- Formula: `Relevance_i = w_D·D_i + w_G·G_i + w_S·S_i + w_X·X_i`
- The four dimensions are **Demographic (D)**, **Geospatial (G)**, **Semantic (S)**, **Social (X)**.
- Relevance determines **voting weight** — users with higher relevance have more weighted votes.
- Relevance does **not** measure expertise or desire to participate.

### 2.5 Expertise

> **Expertise** is a score measuring a member's domain knowledge and capability to contribute meaningfully to an issue's solution.

- Calculated from: education level, professional experience, and relevant resources owned.
- Formula: `Expertise = w_Education·Education + w_Experience·Experience + w_Resources·Resources`
- Weights are set per-issue by the AI Issue Analyzer.

### 2.6 Contribution

> **Contribution** is a score measuring the quality and value-alignment of actions a member has taken toward resolving an issue.

- Each action (task completion, message, decision) is vectorized into an **Action Vector**.
- The Action Vector is compared against the microcommunity's **Vector of Values**.
- Contribution = `Action Force × cosine_similarity(Action Vector, Vector of Values)` (simplified).

### 2.7 Vector of Values (VoV)

> The **Vector of Values** is the microcommunity's structured representation of its shared ideals. It is a 145-dimensional vector scored 0–100 per dimension.

- Dimensions map to Shalom Schwartz's value taxonomy, organized into 10 domains.
- VoV scores are **always non-negative** (0–100). You cannot "value −80 justice".
- The VoV is stable (changes slowly over weeks/months). It is **not** per-issue.
- Full specification: `docs/ISR-Values-Taxonomy-v1.md`.

### 2.8 Action Vector

> An **Action Vector** is the structured representation of a specific real-world action, scored −100 to +100 per dimension (positive = aligned with that value; negative = worked against it).

- Calculated **after** an issue is closed, not in real time.
- Includes: domain scores, Conflict Resolution weights, and Contextual Shift applicability.
- Full specification: `docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md`.

### 2.9 Sections (UI Navigation)

The app has the following named **sections** (used as `data-section` attribute values in HTML):

| Section ID | Display Name | Description |
|------------|-------------|-------------|
| `chat`     | Chat         | Issue discussions / active topics |
| `voting`   | Voting       | Issues open for voting |
| `tasks`    | To Do        | Implementation task tracker |
| `values`   | Values       | Personal values description & vector |
| `profile`  | Profile      | User demographic profile |
| `actions`  | Actions      | User action history & ISR log |
| `settings` | Settings     | App preferences |

- Section IDs are **lowercase, no spaces, no hyphens**. Exactly as listed above.
- The UI label "To Do" (title case, with space) maps to section ID `tasks`. Never rename "To Do" to "Tasks" in the UI.
- Do **not** add new sections without updating this table.

---

## 3. Data Architecture

### 3.1 Database

- **Backend**: Firebase Firestore (NoSQL, document-collection model).
- **Not** SQL. Do not write SQL queries. Do not introduce relational patterns.
- All Firestore operations use the Firebase JS SDK v8 compat API (`firebase.firestore()`).

### 3.2 Key Collections

| Collection    | Document Key | Purpose |
|--------------|-------------|---------|
| `discussions` | `{topicId}` | Chat issues and their thread metadata |
| `voting`      | `{topicId}` | Issues in voting phase |
| `tasks`       | `{topicId}` | To Do issues with task lists |
| `users`       | `{userId}`  | User profiles and demographic data |
| `actions`     | `{userId}`  | User action history records |
| `values`      | `{userId}`  | User values descriptions and vectors |

### 3.3 Firestore Field Naming

- All Firestore field names use **snake_case** (e.g., `last_message_text`, `relevance_scores`, `submitter_id`).
- Never use camelCase for Firestore field names.
- Never use hyphenated field names.

### 3.4 User Identity

- The user ID is stored in `localStorage` under the key `'userId'`.
- Access it via `safeGetStorage('userId')`. Never access `localStorage` directly in feature code.
- Guest users have no `userId` (returns `null` or empty string). Guard all Firestore operations with a userId check.

### 3.5 Cached Collections

The following in-memory arrays cache Firestore snapshots for the current session:

- `cachedChatDocs` — array of Firestore `DocumentSnapshot` objects for `discussions`
- `cachedVotingDocs` — for `voting`
- `cachedTasksDocs` — for `tasks`

These are populated by `initRealTimeDashboardSync()` and updated on Firestore real-time listener callbacks. Never fetch from Firestore in response to a UI click if the data should already be in the cache.

---

## 4. The ISR Score System

### 4.1 Aggregation Formula

```
ISR_Score = w_Relevance · Relevance_i
           + w_Expertise · Expertise_i
           + w_Contribution · Contribution_i
```

All three component weights sum to 1.0. All weights are in [0.0, 1.0].

### 4.2 Voting Weight

When a member votes on an issue, their vote is weighted by their **ISR_Score** for that issue. A member with ISR_Score = 0.9 has 9× the voting weight of a member with ISR_Score = 0.1. This is the core fairness mechanism of ISR.

### 4.3 Who Sets the Weights?

- **Per-issue weights** are set by the AI Issue Analyzer at issue creation time.
- They are stored in the issue document in Firestore.
- Users **cannot** change these weights. Issue creator **can** change these weights manually at issue creation time.

### 4.4 Relevance Threshold

- Default Relevance Threshold hardcoded in the Relevance Engine is 0.15.
- Users with `Relevance >= Threshold` are automatically added to the issue microcommunity.
- This default threshold is hardcoded in the Relevance Engine; it **can** be changed during issue creation.
---

## 5. UI / UX Constraints

### 5.1 Design System

The design uses a dark-slate premium aesthetic. Key tokens (defined in `styles.css` `:root`):

```css
--primary: #2c5282          /* Primary action blue */
--surface: #1e293b          /* Card/modal background */
--surface-soft: #263447     /* Subtle surface variant */
--surface-muted: #1a2535    /* Deeply muted surface */
--border: rgba(148,163,184,0.12)
--border-strong: rgba(148,163,184,0.25)
--text: #f1f5f9             /* Primary text */
--text-soft: #94a3b8        /* Secondary text */
--text-muted: #64748b       /* Muted/placeholder text */
--urgent: #ef4444           /* Red for urgent items */
--success: #22c55e
--radius-xl: 18px
```

**Always use CSS variables** from the design system. Never hardcode hex colors or pixel values that duplicate a token.

### 5.2 Typography

- Font family: **Inter** (Google Fonts). Do not substitute or add other fonts without explicit approval.
- Font weights in use: 400, 500, 600, 700.

### 5.3 Modal System

There is **one** shared section modal: `#section-modal-overlay` / `#section-modal-body` / `#section-modal-title`. All section navigation opens content inside this single modal.

- **Do not** create additional full-screen overlays for section navigation.
- Topic detail views are rendered **inside** the same modal body, not in a new modal.
- Modal close restores the list view if a topic detail is open; a second close dismisses the modal entirely.
- The close button is `#modal-close-btn`. Overlay click also closes. ESC key also closes.

### 5.4 Dashboard Cards

The dashboard shows three main data cards: Chat, Voting, To Do. Their HTML elements have `data-section` attributes:

```html
<div class="dash-card" data-section="chat">…</div>
<div class="dash-card dash-card-priority" data-section="voting">…</div>
<div class="dash-card" data-section="tasks">…</div>
```

- Clicking **anywhere on a card** (including on a preview item) opens the section modal. The whole section must behave as a big button.
- Card content is rendered by Firestore real-time listeners, not on click.
- Mockup data must never be merged with or displayed alongside real user data after login.
- Dashboard cards must always display 'new', 'important', and 'urgent' badges, even when their count is zero, to ensure consistent UI.
- Issues must be categorized using appropriate emojis prefixed to their titles, rather than using separate text chips.
- In the Voting section and list, an issue that the user has already voted on must be clearly marked with a checkmark emoji (`✅ `).

### 5.5 Button Styles

All action buttons use capsule shape:

- `border-radius: 999px`
- Primary: `background: var(--primary)`, text white.
- Secondary: `background: var(--surface-soft)`, `border: 1px solid var(--border)`, text `var(--text)`.

### 5.6 Responsive Behavior

- The app is mobile-first. The dashboard uses CSS grid that collapses to single column on mobile.
- The modal overlay uses `padding: 40px 16px`. Do not use fixed pixel widths for layout containers.

### 5.7 Navigation Menu

The hamburger-style user menu (`#menu`) contains: Actions, Values, Profile, Settings, Quick Tour, Logout.

- **Do not add items** to this menu without explicit approval.
- Menu links use `data-section` attributes and the global delegation system.
- Menu closes when a modal is opened or ESC is pressed.

---

## 6. Code Patterns & Conventions

### 6.1 File Structure

```
/prototype/
  index.html              ← Single HTML file, all static sections & modals
  styles.css              ← All CSS, single file
  js/
    main.js               ← All application logic (~11 000 lines)
    modals.js             ← Topic detail rendering
    relevance.js          ← Client-side relevance calculation
    values.js             ← Values section UI and binding
  firebase-config.js      ← Firebase initialization (do not modify)
/docs/                    ← Protocol specifications (do not auto-generate)
/functions/               ← Firebase Cloud Functions
/ISR_PROJECT_MANIFESTO.md ← This file
```

### 6.2 JavaScript Conventions

- **No framework**. Vanilla JavaScript only. No React, Vue, Angular, or any other library beyond Firebase SDK and Leaflet.
- **No TypeScript**. Plain `.js` files only.
- **ES6+ syntax** is allowed: `const`, `let`, arrow functions, template literals, `async/await`, destructuring.
- **No `var` in new code**. Existing `var` may remain for backward compatibility.
- **Firestore compat API** only: `firebase.firestore()`, not the modular v9 `getFirestore()` API.

### 6.3 Event Handling

- The app uses **event delegation** on `document` for `[data-section]` clicks.
- Preview items (`dash-card-preview`) call `e.stopPropagation()` deliberately to prevent the card-level handler from firing.
- Each dashboard card element has a direct `addEventListener('click', ...)` bound **once** via a `__sectionClickBound` flag guard.
- The `DOMContentLoaded` pattern **must not** be used for code that runs when the script is at the bottom of `<body>`. Use the `readyState` check pattern:

  ```js
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
  ```

### 6.4 `openSectionModal(sectionId)` Contract

1. Looks up `document.getElementById('section-' + sectionId)` — the hidden source container in the HTML.
2. Copies its `innerHTML` into `#section-modal-body`.
3. Sets `currentSectionId = sectionId`.
4. Adds class `active` to `#section-modal-overlay`.

If `source` is `null`, the function returns early silently. The hidden source sections (`#section-chat`, `#section-voting`, etc.) **must always exist in the DOM**.

### 6.5 `renderTopicDetail(kind, topicId, sourceHtml, titleText)` Contract

Opens a topic detail view **inside the existing open modal**. It:

1. Stores current list HTML in `bodyEl.__sourceViewHtml`.
2. Sets `data-topic-detail-open` on the modal body.
3. Sets `data-active-topic-id` on the modal body.
4. Registers `bodyEl.__restoreView` to restore the list HTML.

Do not call `openSectionModal` from within a topic detail. Back navigation is via `closeSectionModal()` (first press restores list; second press closes modal entirely).

### 6.6 LocalStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `userId` | string | Authenticated user ID |
| `dateFormat` | `'dd.mm.yyyy'` / `'mm/dd/yyyy'` / `'yyyy-mm-dd'` | Display date format |
| `tooltipsEnabled` | `'true'` / `'false'` | Tooltip visibility |
| `tourCompleted` | `'true'` | Whether quick tour has been completed |
| `voting_opened_issues` | JSON `{ [topicId]: timestamp }` | Tracks opened voting issues |
| `tasks_opened_issues` | JSON `{ [topicId]: timestamp }` | Tracks opened task issues |
| `chat_read_counts` | JSON `{ [topicId]: number }` | Message read count per discussion |

Always access via `safeGetStorage(key)` and `localStorage.setItem(key, value)`.

---

## 7. Forbidden Patterns

> [!CAUTION]
> The following are explicitly prohibited. An AI agent making any of these changes without written approval from the project owner is acting outside its authority.

### 7.1 Navigation & Structure — Do Not Touch

- **Do not** modify the navbar HTML (`<div class="navbar">`). Logo, brand name, and menu button are fixed.
- **Do not** modify the `#menu` dropdown contents.
- **Do not** add new top-level pages or routes. This is a single-page application.
- **Do not** remove, rename, or reorder the hidden source sections in `index.html`.
- **Do not** change the `data-section` attribute values on any existing element.

### 7.2 Data & Schema — Do Not Touch

- **Do not** change Firestore field names without updating all read/write paths and this manifesto.
- **Do not** introduce SQL, ORM, or relational database patterns.
- **Do not** use the modular Firebase v9 API. The project uses the compat v8 API exclusively.
- **Do not** access `localStorage` directly in feature code. Use `safeGetStorage()`.

### 7.3 Scoring & Weights — Do Not Touch

- **Do not** expose relevance weights or the relevance threshold (0.15) as user settings.
- **Do not** implement a flat voting system (one-member-one-vote). Votes are always relevance-weighted.
- **Do not** change the ISR score formula without updating the protocol documents in `/docs/`.

### 7.4 UI — Do Not Touch

- **Do not** add TailwindCSS, Bootstrap, Material UI, or any CSS framework.
- **Do not** add a second font family. Inter is the only font.
- **Do not** create a new full-screen overlay for section navigation.
- **Do not** hardcode colors that duplicate existing CSS variables.
- **Do not** hide dashboard cards or the summary strip as a "quick fix".

### 7.5 JavaScript — Do Not Touch

- **Do not** use `document.addEventListener('DOMContentLoaded', ...)` as the outermost wrapper in bottom-of-body scripts. Use the readyState pattern.
- **Do not** call `e.stopImmediatePropagation()` anywhere.
- **Do not** use `innerHTML` assignment on hidden source sections from outside the Firestore sync functions.
- **Do not** introduce a JavaScript framework.
- **Do not** split `main.js` into module files without an approved refactor plan.

### 7.6 Terminology — Do Not Rename

| Incorrect (forbidden) | Correct (use this) |
|-----------------------|-------------------|
| Group, Team, Organization | Microcommunity |
| Ticket, Bug, Request | Issue |
| Reputation score, Karma | ISR Score |
| Interest score | Semantic relevance (S dimension) |
| Community (as ISR unit) | Microcommunity |
| Tasks (UI label) | To Do |
| Feedback (as values system) | Values |

---

## 8. Document Map

| File | Purpose |
|------|---------|
| `ISR_PROJECT_MANIFESTO.md` ← **you are here** | Ground truth for all development decisions |
| `docs/MVP-Development-Documentation.md` | UI component patterns and modal guide |
| `docs/ISR-Issue-Analyzer-Protocol-v1.md` | How the AI classifies and parameterizes new issues |
| `docs/ISR-Issue-Analyzer-100-Examples.md` | 100 calibrated anchor examples for issue classification |
| `docs/ISR-Relevance-Implementation.md` | Relevance engine spec (D/G/S/X dimensions, formulas) |
| `docs/ISR-AI-Weight-Evaluation-Instructions.md` | How the AI sets per-issue relevance and aggregation weights |
| `docs/ISR-Values-Taxonomy-v1.md` | Full 145-dimension Vector of Values taxonomy |
| `docs/ISR_Values_Vectorization_Protocol_v1.md` | How to convert a values description into a VoV |
| `docs/ISR-Action-Vectorization-Contribution-Calculation-protocol.md` | How actions are vectorized and Contribution is scored |
| `docs/ISR-Expertise-Assessment-v1.md` | How Expertise is calculated per user per issue |
| `docs/ISR-Issue-Request-Guide.md` | Guide for community members on submitting issues |
| `docs/User_Guide_Values_Description_v1.md` | Guide for users writing their values description |
| `prototype/index.html` | Single-page app HTML shell |
| `prototype/styles.css` | All application CSS |
| `prototype/js/main.js` | All application logic |
| `prototype/js/modals.js` | Topic detail modal rendering |
| `prototype/js/relevance.js` | Client-side relevance calculation |
| `prototype/js/values.js` | Values section UI bindings |

---

*End of ISR Project Manifesto v1.0*
