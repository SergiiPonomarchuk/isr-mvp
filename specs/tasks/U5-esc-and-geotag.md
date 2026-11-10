# SPEC U5: Esc closes only the top window; the geotag button stops downloading every profile

Status: DRAFT 2026-11-10: the proposals wait for the author's decisions (section 3).
Branch: u5-ui-fixes (from main at `ae51eef`; never main)
Source: the live smoke test of 2026-11-08 (U1 spec, CHANGES.md): "Esc closes the whole new-issue window even while the geotag map is open; the geotag button downloads all profiles in the browser to show the nearest distance."

## 1. Context (verified 2026-11-10 at `ae51eef`, emulator)

| Fact | Evidence |
|---|---|
| **One document-wide Esc handler acts on the section window** (Chat, Voting, ToDo and the new-issue form inside it). It calls `closeSectionModal()`, which turns an open detail or form back into the list, or closes the window. It does not check whether another window is open on top. | `prototype/js/main.js:938-943`, `closeSectionModal` `:884-910` |
| **The windows on top have no Esc of their own,** except the values window, whose handler runs *in addition*: <br>- the geotag map `#geo-map-modal-overlay` (z-index 11000); <br>- the proposal overlay `#proposal-modal-overlay` (option, Deadline, Relevance and ISR windows); <br>- the values window `#values-vector-modal`. | `prototype/index.html:439, 522, 589`; `main.js:2056` (values) |
| **Esc in the new-issue form throws the form away.** On the emulator (user 1), typing a title and pressing Esc returned to the Chat list: the form, its text and any Check result were gone, without a question. | browser, 2026-11-10, `127.0.0.1:5000/?emulator=1` |
| With the geotag map or a proposal window open, Esc changes the window *underneath* and leaves the top one open. | the handlers above |
| **The geotag button downloads the whole `users` collection** (`db.collection("users").get()`, every field) to show "Nearest: X m" for 2.5 s, then opens the map. On the emulator that is 9,151 documents, about 20 MB of JSON: `values_description` 8.1 MB, `skills` 3.3 MB, `socialRelations` 2.6 MB, `geography` 1.6 MB. It happens on every click. The browser SDK cannot read only some fields. | `main.js:4991-5017`; size measured on the emulator |

## 2. Requirements (after the decisions)

- R1 One Esc handler for the page closes only the topmost open window, in this order: the geotag map, the values window, the proposal overlay, then the section window. Each window is closed the way its own ✕ closes it (the geotag map also cleans up its search box). One press closes one window.
- R2 In the new-issue form, Esc follows decision 1.
- R3 The geotag button follows decision 2.
- R4 Node tests: the Esc order on a DOM stub with several windows open; the geotag click no longer reads the `users` collection.

## 3. Proposals (author)

1. **Esc in the new-issue form:**
   - **a (recommended): ask first when the form has content.** With an empty form, Esc returns to the list as now. With a title, a description or a Check result, it asks "Discard this new issue?" and returns only on yes.
   - b: Esc does nothing in the form; only Cancel or ✕ leave it.
   - c: keep it as is (Esc returns to the list at once).
2. **The geotag button:**
   - **a (recommended): open the map at once and drop "Nearest: X m".** No profile is downloaded. The Check already shows who is affected, through the public and its G scores.
   - b: keep the distance, computed on the server by a small endpoint that reads only `geography` (a new function and a deploy).
   - c: keep it as is.
3. **Hosting cache headers (optional, same task):** `firebase.json` sends no `Cache-Control` for `js/` and `css/`, so after a deploy a browser may run the old code.
   - **a (recommended): add `Cache-Control: no-cache`** for `**/*.js` and `**/*.css`. The browser then checks for a new version on each load, and unchanged files still come from the cache.
   - b: leave it for a later task.

## 4. Non-goals

- Other keyboard shortcuts, the tour's own Esc (it already closes only the tour), and the map's content.
- Server, data or rules changes (unless decision 2 b). No deploy by the agent.

## 5. Acceptance criteria

- AC1 Emulator: with the geotag map open over the new-issue form, Esc closes only the map; a second Esc follows decision 1.
- AC2 Emulator: Esc over an option or Deadline window closes only that window.
- AC3 Emulator: the geotag button causes no read of `users` in the network log.
- AC4 Unit tests and CI green; the new tests fail on `ae51eef`.

## 6. Status log

- 2026-11-10: spec drafted (agent). Esc and the 20 MB download reproduced on the emulator.
