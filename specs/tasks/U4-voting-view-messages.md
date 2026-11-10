# SPEC U4: The Voting view keeps its own messages

Status: DONE 2026-11-09: merged (PR 12), deployed by the author, checked on live. APPROVED 2026-11-09 (author: "fix the Voting bug").
Branch: u4-voting-messages-fix (from main at `b7b0d44`; never main)
Found in: the U3 emulator test (U3 status log, findings). The bug predates U3.

## 1. Context (verified 2026-11-09 at `b7b0d44`)

| Fact | Evidence |
|---|---|
| The Chat and ToDo views each declare `let currentMessagesRaw = null;` for their messages. The Voting view uses the name without declaring it. | `prototype/js/main.js`, `renderTopicDetail`: the Chat branch (`let currentMessagesRaw`), the ToDo branch (the same), the Voting branch (`const messages = currentMessagesRaw || [];` and `currentMessagesRaw = rawMessages;`) |
| `main.js` is not in strict mode, so the first assignment creates a global `window.currentMessagesRaw`. Until then, every render of the Voting view throws "ReferenceError: currentMessagesRaw is not defined", which is caught and logged as "Render voting detail UI failed". | emulator, 2026-11-09: opening voting issue 179 on a fresh page logged the error twice and left `window.currentMessagesRaw` with its 28 messages |
| Because the global outlives the topic, a second voting topic renders with the first topic's messages until its own messages arrive. | same |

## 2. Requirements

- R1 The Voting branch declares `let currentMessagesRaw = null;` next to its other state (`currentIssueData`). Nothing else changes: until the messages arrive, the view renders with no messages (`|| []`), as the code intends.
- R2 A Node test checks that each of the three views declares `currentMessagesRaw` before using it.

## 3. Non-goals

- No other change to the views. No server, data or rules change; no deploy by the agent.

## 4. Acceptance criteria

- AC1 Emulator: opening voting issue 179 and then 187 on a fresh page logs no "currentMessagesRaw" error. `window.currentMessagesRaw` stays undefined, and each issue shows its own messages.
- AC2 Unit tests and CI green; the new test fails on the code before the fix.

## 5. Status log

- Spec and fix 2026-11-09 (agent), on the author's request.
- Tests:
  - Node 40 (1 new, `functions/test/topic_views.test.js`; it fails on `b7b0d44`).
  - Python unchanged.
- Emulator (2026-11-09, `127.0.0.1:5000/?emulator=1`, user 1):
  - Before: 2 errors, and a global holding 179's 28 messages.
  - After: no errors, no global; 179 shows 27 message cards and 187 shows 25 (each without its description).
- Live (2026-11-09): merged as PR 12 and deployed. Read-only check: opening voting issue 16 on live logged no error, and `window.currentMessagesRaw` stayed undefined.
