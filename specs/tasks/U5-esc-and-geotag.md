# SPEC U5: Esc closes only the top window; the geotag button stops downloading every profile

Status: DRAFT 2026-11-10. Decisions 1 and 3 given (a); decision 2 given as a new direction (section 3a), whose details wait for the author.
Branch: u5-ui-fixes (from main at `ae51eef`; never main)
Source: the live smoke test of 2026-11-08 (U1 spec, CHANGES.md): "Esc closes the whole new-issue window even while the geotag map is open; the geotag button downloads all profiles in the browser to show the nearest distance."

## 1. Context (verified 2026-11-10 at `ae51eef`, emulator)

| Fact | Evidence |
|---|---|
| **One document-wide Esc handler acts on the section window** (Chat, Voting, ToDo and the new-issue form inside it). It calls `closeSectionModal()`, which turns an open detail or form back into the list, or closes the window. It does not check whether another window is open on top. | `prototype/js/main.js:938-943`, `closeSectionModal` `:884-910` |
| **The windows on top have no Esc of their own,** except the values window, whose handler runs *in addition*: <br>- the geotag map `#geo-map-modal-overlay` (z-index 11000); <br>- the proposal overlay `#proposal-modal-overlay` (option, Deadline, Relevance and ISR windows); <br>- the values window `#values-vector-modal`. | `prototype/index.html:439, 522, 589`; `main.js:2056` (values) |
| **Esc in the new-issue form throws the form away.** On the emulator (user 1), typing a title and pressing Esc returned to the Chat list: the form, its text and any Check result were gone, without a question. | browser, 2026-11-10, `127.0.0.1:5000/?emulator=1` |
| With the geotag map or a proposal window open, Esc changes the window *underneath* and leaves the top one open. | the handlers above |
| **Every new issue starts at one fixed point,** the Basel centre `[47.553832, 7.606599]`, unless the creator moves the pin on the map or picks a profile place. Check and Create send it as `location`, and the server measures G from it. | `main.js:240, 4875, 5657, 5813`; `functions/index.js:54, 143` |
| **The Analyzer already derives the distances** (A2): `mu_distance_meters` and `sigma_decay_meters` (the map shows them read-only) and a `scope_type` (unit, building, street_segment, neighborhood, district, city, region, global_digital). Nothing derives the point. | `functions/ai-helper.js` (A4 branch: lines 208, 241, 577-589); the 100 examples: 44 neighborhood, 15 building, 13 district, 10 city, 7 street_segment, 6 global_digital, 4 unit, 1 region |
| The map's search box geocodes a typed place with OpenStreetMap Nominatim, from the browser. | `main.js:5303` |
| **The geotag button downloads the whole `users` collection** (`db.collection("users").get()`, every field) to show "Nearest: X m" for 2.5 s, then opens the map. On the emulator that is 9,151 documents, about 20 MB of JSON: `values_description` 8.1 MB, `skills` 3.3 MB, `socialRelations` 2.6 MB, `geography` 1.6 MB. It happens on every click. The browser SDK cannot read only some fields. | `main.js:4991-5017`; size measured on the emulator |

## 2. Requirements (after the decisions)

- R1 One Esc handler for the page closes only the topmost open window, in this order: the geotag map, the values window, the proposal overlay, then the section window. Each window is closed the way its own ✕ closes it (the geotag map also cleans up its search box). One press closes one window.
- R2 In the new-issue form, Esc follows decision 1.
- R3 The geotag button follows decision 2 (section 3a): no profile download; the location from the Analyzer.
- R5 `firebase.json`: `Cache-Control: no-cache` for `**/*.js` and `**/*.css` (decision 3 a).
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

## 3a. The author's decisions (2026-11-10)

1. **a:** Esc in a new-issue form with content asks "Discard this new issue?".
2. **New direction:** "in new issue registration geotag (coordinates, distance and fade) should be taken from the issue description according to 100 examples table by AI Analyzer. If user describe it as "in our house" - it should be coordinates of the house stated in the user profile."
   This replaces proposals 2 a-c. The proposed design, details for the author:
   - **The Analyzer** adds `location_reference` to its JSON: `{"anchor": "home" | "work" | "property" | "named_place" | "none", "place": "<the name as written>"}`. The prompt maps "our house, our building, our street, near my home" to home; "at work, our office, our factory" to work; "my garage, my land, my plot" to property; a named street, square, park or school to named_place; and no place to none. The distance and fade stay as now (A2), from the description and the closest examples.
   - **The server resolves the point** (Check): home, work or property come from the creator's matching `geography` entry (`checkIssue` already reads the creator's document). The result goes into the draft (`location`, `location_source`), and Create uses the draft's point.
   - Open details (author): a named place; whether the creator may move the pin; a description with no place.
   - **The geotag button** downloads no profiles. Before Check it shows the creator's home; after Check it opens the map at the derived point with its circles.
   - **Dependency:** the Analyzer prompt and `checkIssue` are changed on the A4 branch (prompt `p2`), so this part is built on top of A4 (prompt `p3`), after A4 is merged, and deployed with or after it.
3. **a:** `Cache-Control: no-cache` for `**/*.js` and `**/*.css`.

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
- 2026-11-10: the author's decisions: 1 a, 3 a, and for 2 the Analyzer-derived location (section 3a). The fixed default point (Basel centre) also explains A4's small test publics.
