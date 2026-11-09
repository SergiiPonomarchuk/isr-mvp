# SPEC U3: Sort buttons for the messages of an issue

Status: DRAFT 2026-11-09, waiting for the author's approval (decisions in section 3).
Branch: u3-message-sort (from main at `78c1e22`; never main)
Source: author's request, 2026-11-09: "In issue discussion there should be messages sorting buttons as issues lists has: date, ISR, R (stands for Relevance) and E (stands for Expertise)."
Roadmap: UI for the D1 guided demo ([ROADMAP-demo.md](../ROADMAP-demo.md)): showing whose messages carry weight in the ad-hoc public. Effort estimate: about half a day.

## 1. Context (verified 2026-11-09 at `78c1e22`; counts on the emulator, a copy of the live data plus test changes)

| Fact | Evidence |
|---|---|
| **Three views show an issue's messages, and all three use one renderer.** Chat (`renderChatTopic`), Voting (`renderVotingTopic`) and ToDo (`renderTasksTopic`) each show the first message as the description and the rest under "Messages" through `renderDiscussionMessages`. | `prototype/js/main.js:2212-2221, 2343-2414, 2416-2575, 2852-2860` |
| **The messages are a flat list, oldest first:** the listeners read `orderBy("timestamp", "asc")`. A reply is not nested; it shows "In reply to <author>", and clicking that scrolls to the parent message. | `main.js:4060, 4398, 4704; 2380-2388` |
| A topic view re-renders as a whole on every change of the discussion or its messages (`updateUI`, `updateVotingUI`, ...). | `main.js:3870-4070` (Chat), `:4088` (Voting) |
| **The issue lists' sort buttons** are tag buttons (`.search-filter-tags`; the chosen one gets `.active`). The choice lives in a page variable (`chatSortMode`, `votingSortMode`, `tasksSortMode`): it is kept while the page is open and resets on reload. | `prototype/index.html:283-285`; `prototype/styles.css:642-653`; `main.js:8640-8665` |
| **Where a member's R, E and ISR live:** the public member document `microcommunity_members/{microcommunity id}_{uid}` holds `relevance_score`, `expertise_score` and `isr_score`. A1 made it the source; the discussion's `relevance_scores` / `isr_scores` maps are a server-written cache of it, and there is no map for E. A topic view already reads the logged-in member's own document. | `specs/02-data-model.md` l.31, l.82; `main.js:3887-3925` |
| **Coverage:** every one of the 1,696 messages (194 topics) is written by a member of the topic's public. All 1,696 authors have R; 1,694 have E and ISR. Messages per topic: median 6, at most 28. | emulator, 2026-11-09 |
| Ranges over all 3,295 member documents: R from 0.10 to 1.00 (median 0.62); E from 0 to 7.33 (median 1.21; E is not capped at 1); ISR from 0.44 to 2.96 (median 0.95). | emulator, 2026-11-09 |
| The lists show R as a percentage and ISR with 2 decimals. | `main.js:8440-8445` |

## 2. Requirements

- R1 The "Messages" block of the Chat, Voting and ToDo views gets four tag buttons in the issue-list style: **date, ISR, R, E** (in this order). The chosen one is marked `active`. The default is date.
- R2 Sorting:
  - **date:** oldest first (as built).
  - **ISR, R and E:** the author's value in this public, highest first. Equal values keep date order.
  - Messages whose author has no value go to the end, in date order.
- R3 The values come from the public's member documents: one query (`microcommunity_id ==`) per opened topic, kept while the view is open. The maps on the discussion are not used.
- R4 The first message (the description) stays at the top, outside the sort. Replies are sorted like any other message and keep their "In reply to" link.
- R5 The choice survives the view's re-renders (a new message or reaction does not reset it). See decision 3 for how long it is kept.
- R6 (decision 2) The value of the chosen button is shown next to each author's name: ISR with 2 decimals, R as a percentage, E with 2 decimals; "N/A" when missing; nothing extra for date.

## 3. Decisions (author)

1. **Which views:** a (recommended) all three: Chat, Voting and ToDo, because they share the renderer; b: Chat only.
2. **Show the value next to the author:**
   - a (recommended): show only the chosen button's value (R6). Without it, the order is hard to check.
   - b: always show all three ("R 62% · E 1.21 · ISR 0.95").
   - c: show nothing.
3. **How long the choice is kept:**
   - a (recommended): while the page is open, and the same for every topic. This is how the list buttons work.
   - b: per topic, reset to date when the topic is reopened.
4. **Reverse order** (a second press on the same button reverses it):
   - a (recommended): no, as with the list buttons;
   - b: yes.

## 4. Non-goals

- Nesting replies under their parent (threads).
- Showing a member's R, E or ISR anywhere else, or changing how they are computed.
- No server, data or rules change. No deploy by the agent: the author deploys hosting.

## 5. Acceptance criteria

- AC1 Emulator (`?emulator=1`), in a chat, a voting issue and a ToDo issue: the four buttons are shown, and date is active by default.
- AC2 For one topic with at least 6 messages, the order under ISR, R and E equals a script's order from the member documents (ties in date order). Date gives the as-built order.
- AC3 The description stays on top; "In reply to" still scrolls to the parent; the chosen sort stays after a new message arrives (on the emulator, from a second tab).
- AC4 A message whose author has no value is at the end, with "N/A" (if decision 2 is a or b).
- AC5 Unit tests and CI green; a Node test checks that the three views pass their messages through the sort.
- AC6 Live, after the author's hosting deploy: the buttons work in one topic. Read-only check.

## 6. Plan (after approval)

1. R1-R6 in `prototype/js/main.js` (a sort helper next to `renderDiscussionMessages`, the buttons in the "Messages" block title, the member values loaded per topic view) and, if needed, a few lines in `prototype/styles.css`.
2. Unit tests, then AC1-AC4 on the emulator in the browser.
3. Status log, CHANGES.md, the README row; open the PR.
4. The author merges and deploys hosting; then AC6.

## 7. Traceability

- Component: 10 (UI flows; the component file is not written yet). Related: 06 (member ISR), 03 (R), 04 (E).

## 8. Status log

- Spec written 2026-11-09 (agent); waiting for approval.
