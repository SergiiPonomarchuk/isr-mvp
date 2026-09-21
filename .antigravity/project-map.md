# Project Architectural Map & Boundaries

This document defines the strict architectural map, file structure, and boundary definitions for the ISR Vote MVP project.

## File Structure

```text
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
/ISR_PROJECT_MANIFESTO.md ← Ground truth for all development decisions
```

## Forbidden Patterns (Do Not Touch)

> **CAUTION:** The following are explicitly prohibited. An AI agent making any of these changes without written approval is acting outside its authority.

### Navigation & Structure
- **Do not** modify the navbar HTML (`<div class="navbar">`). Logo, brand name, and menu button are fixed.
- **Do not** modify the `#menu` dropdown contents.
- **Do not** add new top-level pages or routes. This is a single-page application.
- **Do not** remove, rename, or reorder the hidden source sections in `index.html`.
- **Do not** change the `data-section` attribute values on any existing element.

### Data & Schema
- **Do not** change Firestore field names without updating all read/write paths and the manifesto.
- **Do not** introduce SQL, ORM, or relational database patterns.
- **Do not** use the modular Firebase v9 API. The project uses the compat v8 API exclusively.
- **Do not** access `localStorage` directly in feature code. Use `safeGetStorage()`.

### Scoring & Weights
- **Do not** expose relevance weights or the relevance threshold (0.15) as user settings.
- **Do not** implement a flat voting system (one-member-one-vote). Votes are always relevance-weighted.
- **Do not** change the ISR score formula without updating the protocol documents in `/docs/`.

### UI
- **Do not** add TailwindCSS, Bootstrap, Material UI, or any CSS framework.
- **Do not** add a second font family. Inter is the only font.
- **Do not** create a new full-screen overlay for section navigation.
- **Do not** hardcode colors that duplicate existing CSS variables.
- **Do not** hide dashboard cards or the summary strip as a "quick fix".

### JavaScript
- **Do not** use `document.addEventListener('DOMContentLoaded', ...)` as the outermost wrapper in bottom-of-body scripts. Use the readyState pattern.
- **Do not** call `e.stopImmediatePropagation()` anywhere.
- **Do not** use `innerHTML` assignment on hidden source sections from outside the Firestore sync functions.
- **Do not** introduce a JavaScript framework.
- **Do not** split `main.js` into module files without an approved refactor plan.
- **No TypeScript**. Plain `.js` files only.

## UI Class Reuse Directives

Each new modal or page must reuse existing UI elements. Do not write custom inline styling or introduce new classes for elements like buttons, overlays, inputs, or standard dialogs.

- **Modals and Dialog Overlays**:
  - All section navigation opens content inside the single `#section-modal-overlay` / `#section-modal-body` / `#section-modal-title`.
  - For standard dialogs, use `.YOUR-modal-overlay` (`background: rgba(15, 23, 42, 0.45)`, `backdrop-filter: blur(4px)`) and `.YOUR-modal-dialog` (`background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-xl)`).
  - Close buttons must be unified 36px diameter circles with a centered `✕` character and `.YOUR-modal-close` / `.YOUR-modal-close-btn`.
  - Modal titles must use `.YOUR-modal-title` (`font-size: 1.2rem`, `font-weight: 700`, `color: var(--text)`).
- **Buttons**:
  - Always use capsule styling (`border-radius: 999px`).
  - Primary Action: `background: var(--primary)` with `#fff` text.
  - Secondary Action: `background: var(--surface-soft)` with `border: 1px solid var(--border)` and text `var(--text)`.
- **Form Inputs**:
  - Standard styling overrides apply to `input[type="text"]`, `input[type="password"]`, `input[type="number"]`, `input[list]`, `select`. Do not create new input styles.

## Database & Data Conventions

- **Database**: Firebase Firestore (NoSQL) using the v8 compat API exclusively.
- **Firestore Naming Convention**: All fields use `snake_case` (e.g., `last_message_text`, `relevance_scores`). Never use camelCase or hyphenated field names.

### Key Collections Matrix
You are strictly forbidden from writing to or reading from any collections outside of these six canonical paths:
| Collection    | Document Key | Purpose |
|--------------|-------------|---------|
| `discussions` | `{topicId}` | Chat issues and their thread metadata |
| `voting`      | `{topicId}` | Issues in voting phase |
| `tasks`       | `{topicId}` | To Do issues with task lists |
| `users`       | `{userId}`  | User profiles and demographic data |
| `actions`     | `{userId}`  | User action history records |
| `values`      | `{userId}`  | User values descriptions and vectors |

### Session Caching & Real-Time Sync Rules
The application maintains active session caches to manage data and prevent redundant read operations.
- **Cache Elements**: `cachedChatDocs`, `cachedVotingDocs`, and `cachedTasksDocs` store current Firestore snapshots.
- **Execution Boundary**: You are strictly FORBIDDEN from fetching directly from the Firestore database in response to a UI click event. If the requested data should exist in the session cache, you must read from the cache array.
- **Real-Time Writes**: These caches are exclusively managed by `initRealTimeDashboardSync()`. As noted in the JavaScript boundaries, do not modify or write to the hidden source DOM nodes from outside these listener callback pathways.

## Approved localStorage Keys

Always access via `safeGetStorage(key)` and `localStorage.setItem(key, value)`.

| Key | Type | Purpose |
|-----|------|---------|
| `userId` | string | Authenticated user ID |
| `dateFormat` | `'dd.mm.yyyy'` / `'mm/dd/yyyy'` / `'yyyy-mm-dd'` | Display date format |
| `tooltipsEnabled` | `'true'` / `'false'` | Tooltip visibility |
| `tourCompleted` | `'true'` | Whether quick tour has been completed |
| `voting_opened_issues` | JSON `{ [topicId]: timestamp }` | Tracks opened voting issues |
| `tasks_opened_issues` | JSON `{ [topicId]: timestamp }` | Tracks opened task issues |
| `chat_read_counts` | JSON `{ [topicId]: number }` | Message read count per discussion |
