# SPEC U3: Sort buttons for an issue's messages; order of the dashboard

Status: IMPLEMENTED on branch `u3-message-sort` 2026-11-09 (emulator AC1-AC5 passed); the author's hosting deploy and AC6 are pending. APPROVED 2026-11-09 with the author's changes (section 3).
Branch: u3-message-sort (from main at `78c1e22`; never main)
Source: author's requests, 2026-11-09:
- "In issue discussion there should be messages sorting buttons as issues lists has: date, ISR, R (stands for Relevance) and E (stands for Expertise)."
- The summary strip in the order Discussions, Active votes, ToDo; the issue lists in the order Chat, Voting, ToDo.

Roadmap: UI for the D1 guided demo ([ROADMAP-demo.md](../ROADMAP-demo.md)): showing whose messages carry weight in the ad-hoc public. Effort estimate: about half a day.

## 1. Context (verified 2026-11-09 at `78c1e22`; counts on the emulator, a copy of the live data plus test changes)

| Fact | Evidence |
|---|---|
| **Three views show an issue's messages, and all three use one renderer.** Chat (`renderChatTopic`), Voting (`renderVotingTopic`) and ToDo (`renderTasksTopic`) each show the first message as the description and the rest through `renderDiscussionMessages`. Chat shows them under "Messages"; Voting and ToDo under "Discussion Thread". | `prototype/js/main.js:2212-2221, 2300-2303, 2343-2414, 2416-2575, 2852-2860, 3040-3043` |
| **The messages are a flat list, oldest first:** the listeners read `orderBy("timestamp", "asc")`. A reply is not nested; it shows "In reply to <author>", and clicking that scrolls to the parent message. | `main.js:4060, 4398, 4704; 2380-2388` |
| A topic view re-renders as a whole on every change of the discussion or its messages. | `main.js:3870-4070` (Chat), `:4088` (Voting) |
| **The issue lists' sort buttons** are tag buttons (`.search-filter-tags`; the chosen one gets `.active`). The choice lives in a page variable: it is kept while the page is open and resets on reload. | `prototype/index.html:283-285`; `prototype/styles.css:642-653`; `main.js:8640-8665` |
| **Where a member's R, E and ISR live:** the public member document `microcommunity_members/{microcommunity id}_{uid}` holds `relevance_score`, `expertise_score` and `isr_score`. A1 made it the source; the discussion's maps are a server-written cache of it, and there is no map for E. | `specs/02-data-model.md` l.31, l.82; `main.js:3887-3925` |
| **Coverage:** every one of the 1,696 messages (194 topics) is written by a member of the topic's public. All authors have R; 1,694 have E and ISR. The 2 without them are the descriptions of the 2 app-created publics of June 2026 (`qTkvs4PP90KIiOt0o6kF`, `upynfJPHa17to8JYV5bV`; all 50 members of these publics lack E and ISR). Messages per topic: median 6, at most 28. | emulator, 2026-11-09 |
| Ranges over all 3,295 member documents: R from 0.10 to 1.00 (median 0.62); E from 0 to 7.33 (median 1.21; E is not capped at 1); ISR from 0.44 to 2.96 (median 0.95). | emulator, 2026-11-09 |
| **Dashboard order as built:** the summary strip reads "Active votes · To Do · Discussions". The three cards are Voting, Chat, To Do, in a grid whose first column is wider (`1.2fr 1fr 1fr`). The guided tour's text names them in that order. | `main.js:7926-7936`; `index.html:46-52, 132-232`; `styles.css:407-409`; `main.js:9477-9479` |

## 2. Requirements

- R1 The message list of the Chat, Voting and ToDo views gets four tag buttons in the issue-list style: **date, ISR, R, E** (in this order). The chosen one is marked `active` with an arrow: ↓ for newest or highest first, ↑ for the reverse. The default is date ↓.
- R2 Sorting:
  - **date:** newest first.
  - **ISR, R and E:** the author's value in this public, highest first; equal values newest first.
  - Pressing the active button again reverses the order (oldest first, lowest first). Pressing another button starts with that button's default.
  - Messages whose author has no value go to the end, in either direction.
- R3 The values come from the public's member documents (the A1 source). The authors' documents are read by id once per opened topic and kept while the view is open; the maps on the discussion are not used.
- R4 The first message (the description) stays at the top, outside the sort. Replies are sorted like any other message and keep their "In reply to" link.
- R5 The choice is kept while the page is open, for every topic and view (as the list buttons). Re-renders (a new message, a reaction) keep it. A press re-orders the message cards in place.
- R6 Each message shows its author's three values on the same line as the name, on the right: `*0.93 R 22 E 2.05`. The first is the ISR (2 decimals), R is a percentage without the % sign, E has 2 decimals. A missing value shows "N/A". There is no value for system messages.
- R7 The summary strip reads **Discussions · Active votes · To Do** (also the static placeholder in `index.html`).
- R8 The dashboard cards are ordered **Chat, Voting, To Do**. Voting keeps the wider column (`1fr 1.2fr 1fr`), and the tour text names them in the new order.
- R9 Node test `functions/test/message_sort.test.js`. It runs the comparator taken from `main.js` on a fixed case set, and checks the buttons and value loading in the three views, the value format, and the order of the strip, the cards and the placeholder.

## 3. Decisions (author, 2026-11-09)

1. **Which views:** all three (recommendation; no change asked).
2. **Values next to the author:** all three every time, on the same line, on the right, as `*0.00 R 00 E 0.00`: ISR first, R in percent, no captions. The asterisk is shown as written. (The recommendation had been to show only the chosen button's value.)
3. **How long the choice is kept:** while the page is open, the same for every topic (recommendation; no change asked).
4. **Reverse order on a second press:** yes (author; the recommendation had been no).
5. **Date order:** newest first (author; the draft had oldest first).
6. **Members without E and ISR** (the 2 app-created publics; on live a third, `nN4sPhX49dxLqmbuKada`, see the A1 status log): the author asked to compute them. That conflicts with A1 R11 and decision 7: E needs the issue vector, no issue vector is stored for any topic, and the embedding model of the skill vectors is retired (stage 1). It is a separate data task, waiting for the author's choice. U3 shows "N/A" for these members meanwhile.

## 4. Non-goals

- Computing E or ISR for the members who lack them (decision 6, separate task).
- Nesting replies under their parent (threads).
- No server, data or rules change. No deploy by the agent: the author deploys hosting.

## 5. Acceptance criteria

- AC1 Emulator (`?emulator=1`), in a chat, a voting issue and a ToDo issue: the four buttons are shown and date ↓ is active by default.
- AC2 For one topic in each view (25-27 messages), the order under date, ISR, R and E, and reversed, equals a script's order from the member documents.
- AC3 The description stays on top; "In reply to" still finds its parent. The chosen sort stays after a new message arrives, and it carries over to another topic.
- AC4 A message whose author has no value shows "N/A" and is at the end. The strip reads "Discussions · Active votes · To Do", and the cards are ordered Chat, Voting, To Do.
- AC5 Unit tests and CI green: Node 39 (4 new), Python 48.
- AC6 Live, after the author's hosting deploy (Ctrl+F5: the browser keeps `styles.css` and `main.js` for up to an hour): the buttons and the values work in one topic, and the strip and card order are right. Read-only check.

## 6. Plan

1. R1-R9 in `prototype/js/main.js`, `prototype/index.html`, `prototype/styles.css` and `functions/test/message_sort.test.js`.
2. Unit tests, then AC1-AC4 on the emulator in the browser.
3. Status log, CHANGES.md, the README row; open the PR.
4. The author merges and deploys hosting; then AC6.

## 7. Traceability

- Component: 10 (UI flows; the component file is not written yet). Related: 06 (member ISR), 03 (R), 04 (E).

## 8. Status log

- Spec written 2026-11-09 (agent). Approved 2026-11-09 with the author's changes (section 3).
- Implementation: R1-R9 on branch `u3-message-sort`.
  - `main.js`, next to `renderDiscussionMessages`: `compareMessageItems`, `sortMessagesForDisplay`, `renderMessageScores`, `renderMessageSortButtons`, `loadMessageAuthorScores`, and one click handler.
  - The three views load the authors' values after the names. `renderTopicDetail` resets them when a topic is opened.
  - The strip, the cards, the grid columns and the tour text follow the new order.
- Tests: Node 39 (4 new in `message_sort.test.js`); Python 48 (1 skipped).
- Emulator (2026-11-09, `127.0.0.1:5000/?emulator=1`; the database host was checked before each run; expected orders from a script reading the member documents):
  - AC1-AC2:
    - Chat 171 (25 messages): date ↓, ISR ↓, R ↓, E ↓, E ↑ and date ↑ equal the script, and the arrows follow.
    - Voting 179 (27 messages): E carried over from the previous topic and matched; date and R matched.
    - ToDo 182 (26 messages): R carried over and matched; ISR and date matched.
    - The values match the documents, for example 179's newest message "*1.14 R 76 E 1.43".
  - AC3:
    - "In reply to" links find their parent.
    - With E ↓ chosen, a test message added on the emulator appeared in its E position and E stayed active; the message was removed afterwards.
  - AC4:
    - Two test messages in `qTkvs4PP90KIiOt0o6kF` showed "*N/A R 81 E N/A" and "*N/A R 21 E N/A" (removed afterwards).
    - The strip read "Discussions: 117 · Active votes: 77 · To Do: 3", and the cards were in the order Chat, Voting, To Do.
  - Layout: the name is on the left and the values on the right (screenshot). The first run used a cached `styles.css`; reloading it fixed the layout.
- Findings (not changed here):
  - The Voting view reads `currentMessagesRaw` without declaring it (the Chat and ToDo views declare their own). The first assignment creates a global, so:
    - the view's first render fails with "ReferenceError: currentMessagesRaw is not defined" until the messages listener has run;
    - the next voting topic can briefly show the previous topic's messages.
    - This predates U3: `main.js:4106` on main.
  - Many seeded members of a public share the same R (for example 22 % for most authors in chat 171).
  - Chat 171 shows duplicated messages: the known 184 duplicates in the demo data.
