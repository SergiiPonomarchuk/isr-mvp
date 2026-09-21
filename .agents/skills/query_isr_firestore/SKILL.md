---
name: "Query ISR Firestore"
description: "Triggers when reading from, writing to, or querying the Firebase Firestore database, or syncing data in the ISR project."
---

# Query ISR Firestore

When interacting with the database, you MUST adhere to the following constraints. 

## 1. Firebase Version
- The project relies exclusively on the **Firebase v8 Compat API** (`firebase.firestore()`).
- You MUST NOT use or suggest using the modular v9 API (`getFirestore()`, `doc()`, `getDoc()`).

## 2. Approved Collections Matrix
You are strictly forbidden from writing to or reading from any collections outside of these six canonical paths:

| Collection    | Document Key | Purpose |
|--------------|-------------|---------|
| `discussions` | `{topicId}` | Chat issues and their thread metadata |
| `voting`      | `{topicId}` | Issues in voting phase |
| `tasks`       | `{topicId}` | To Do issues with task lists |
| `users`       | `{userId}`  | User profiles and demographic data |
| `actions`     | `{userId}`  | User action history records |
| `values`      | `{userId}`  | User values descriptions and vectors |

## 3. Naming Conventions
- All Firestore fields MUST use `snake_case` (e.g., `last_message_text`, `relevance_scores`). 
- Never use camelCase or hyphenated field names.

## 4. Session Caching & Real-Time Sync
- The application maintains active session caches (`cachedChatDocs`, `cachedVotingDocs`, `cachedTasksDocs`) that store current Firestore snapshots.
- **Execution Boundary**: You are strictly FORBIDDEN from fetching directly from the Firestore database in response to a UI click event. If the requested data should exist in the session cache, you must read from the cache array.
- **Real-Time Writes**: These caches are exclusively managed by `initRealTimeDashboardSync()`. Do not modify or write to the hidden source DOM nodes from outside these listener callback pathways.
