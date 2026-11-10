# SPEC U6: The issue's location comes from its description

Status: DRAFT 2026-11-10: the design follows the author's decisions (U5 section 3a, and "keep the server lookup in U6"); waits for approval.
Branch: u6-issue-location (stacked on `a4-working-ai` at `4fa064a`: it changes the Analyzer prompt and `checkIssue`, which A4 changes too; merged after A4)
Source: the author, 2026-11-10 (U5 decision 2): "in new issue registration geotag (coordinates, distance and fade) should be taken from the issue description according to 100 examples table by AI Analyzer. If user describe it as "in our house" - it should be coordinates of the house stated in the user profile." The defaults (author: "go ahead with U5 as you described"):
- a named place is geocoded within the region, else the creator's home is used;
- the creator may move the pin, and a moved pin is recorded;
- with no place in the description, the point is the creator's home.

The author, 2026-11-10, on the place lookup: "keep the server lookup in U6". This means following the OpenStreetMap Foundation's Nominatim usage policy (R3), and adding the missing OpenStreetMap credit to the existing search box.

## 1. Context (verified 2026-11-10 on `a4-working-ai`)

| Fact | Evidence |
|---|---|
| **The point:** every new issue starts at the Basel centre `[47.553832, 7.606599]`. The creator can drag the pin, click the map, pick a profile place or search a place (Nominatim, in the browser). | `prototype/js/main.js:240, 4875, 372, 445, 579, 651, 5070, 5364` |
| **Check and Create both read `location` from the request body.** Check builds the public from it (G: `nearestAnchor`). Create builds the public again from the body's location and the draft's numbers. A pin moved after Check therefore gives a different public than Check showed. | `functions/index.js:79-82, 179, 687-700, 784` |
| **The draft** (`issue_drafts`) holds the text and the derived numbers. Create refuses with 409 when the title or description changed after Check, but it does not check the location. | `functions/params.js:96-127` |
| **The distances:** the Analyzer derives `mu_distance_meters` and `sigma_distance_meters` (A2; the map shows them read-only) and a `scope_type`: unit, building, street_segment, neighborhood, district, city, region or global_digital. In the 100 examples: 44 neighborhood, 15 building, 13 district, 10 city, 7 street_segment, 6 global_digital, 4 unit, 1 region. Nothing derives the point. | `functions/ai-helper.js:188-316, 555-590`; `docs/ISR-Issue-Analyzer-100-Examples.md` |
| **The creator's places:** `users/{uid}.geography` holds a `home` for everyone and a `work` for 4,911 people (P1 audit). `checkIssue` already reads the creator's document. | `specs/tasks/P1-profile-audit.md` section 5; `functions/index.js` |
| **Consequence:** A4's test issues sat at the Basel centre, where no synthetic home lies within 100 m, so their publics had 1-3 members. | A4 status log |
| **The map's place search** calls Nominatim (`nominatim.openstreetmap.org`) from the browser, on Enter or the button, 5 results. It has been in the code since the first commit (2026-06-24). The map credits only Google; OpenStreetMap is not credited. The search cannot be switched off without a deploy. | `prototype/js/main.js:360-364, 5291-5345` |
| **The Nominatim usage policy** asks for: at most 1 request a second; an identifying User-Agent or Referer, not a library's default; no autocomplete; cached results; the credit "© OpenStreetMap contributors"; a way to switch the use off without a software update; and no personal data. Access can be withdrawn at any time. | https://operations.osmfoundation.org/policies/nominatim/ |
| **The Firestore rules** let the browser read every collection except `issue_drafts` and `analyzer_logs`. A new `config` document is therefore readable without a rules change. | `firestore.rules` (R0) |

## 2. Requirements

- R1 **The Analyzer** (prompt `p3`) returns `location_reference`: `{"anchor": "home" | "work" | "property" | "named_place" | "none", "place": "<the name as written, for named_place>"}`. The prompt explains it:
  - "our house, our building, our entrance, our yard, near my home" -> home;
  - "at work, our office, our factory, our school (as staff)" -> work;
  - "my garage, my plot, my land" -> property;
  - a named street, square, park, school or building -> named_place, with the name;
  - no place -> none.

  The keyword fallback (no model) derives the anchor from the same words. Distances and fade are unchanged (A2).
- R2 **`functions/location.js`** (new, pure; the geocoder is passed in) resolves the point at Check:
  - a pin the creator moved (the request says `location_source: "creator"`) -> that point, source `creator`;
  - home, work or property -> the creator's matching `geography` entry, source `home`, `work` or `property`. Without such an entry, the home is used, source `home_fallback`;
  - named_place -> geocoded, source `named_place`. Without a result, the home is used, source `home_fallback`;
  - none -> the home, source `assumed_home`;
  - no home in the profile -> the point the browser sent, source `default`.
- R3 **Geocoding on the server**, in a new `functions/geocode.js`. The network, the database and the clock are passed in, so it is unit-tested without them. It uses the same service as the map's search box (OpenStreetMap Nominatim) and follows its usage policy:
  - **The request:** `https://nominatim.openstreetmap.org/search` with:
    - `q` = the place name as the Analyzer returned it;
    - `format=jsonv2`, `limit=1`, `accept-language=en`;
    - `viewbox` = a box of about ±0.3° (about 30 km) around the creator's home, with `bounded=1`.

    The timeout is 5 s. Only the place name is sent: no issue text, no user data.
  - **Identification:** the User-Agent `ISR-MVP/1.0 (+https://project-a3d59130-5adf-4677-9e2.web.app)`: the app and its public site, with no personal data.
  - **Rate:** at most 1 request a second per server instance, with later requests waiting in turn. The lookup runs only at Check, never while typing.
  - **Cache:** Firestore `geocode_cache/{sha256 of the normalised name and the box}` holds the answer ("found" with the point and the display name, or "not found") and its time. Within 30 days a Check reuses it and sends nothing. A failure (timeout, HTTP error, 429) is not cached and counts as "not found" for that Check.
  - **Switch:** Firestore `config/geocoding` `{enabled: true | false}`, which the author sets in the console without a deploy.
    - A missing document counts as on.
    - The server reads the switch at most once a minute.
    - When it is off, no request is sent, and a named place falls back to the home (`home_fallback`, label "your home (place search is off)").
  - **Credit:** a point found by the lookup is shown with "© OpenStreetMap contributors" (R6).
- R4 **The draft** stores:
  - `location` `[lat, lng]`;
  - `location_source`;
  - `location_reference` (the Analyzer's answer);
  - `location_label` (for example "your home", "Linden Street", "set by you");
  - `location_suggested`, the resolved point, when the creator moved the pin.

  The Check response returns `location`, `location_source` and `location_label`.
- R5 **Create uses the draft's location.** A body location that differs from the draft's by more than 1 m gets 409 "The location changed after the check: check again", like a changed title. The issue document stores `location` (as now), `location_source` and `location_reference`.
- R6 **The browser:**
  - before Check, the point is the creator's home, not the Basel centre;
  - moving the pin (drag, click, profile place, search) marks it as the creator's;
  - Check sends the point with `location_source` ("creator" or "auto"), and afterwards shows the returned point and label, for example "📍 your home (from the description)";
  - moving the pin after Check marks the Check as stale: Create stays disabled until Check runs again;
  - **the OpenStreetMap credit:**
    - the map's attribution adds "Search: © OpenStreetMap contributors", linked to https://www.openstreetmap.org/copyright;
    - the label of a point from the lookup ends with "(© OpenStreetMap contributors)".

    This also covers the existing search box, which has no credit today.
  - **the existing search box obeys the switch:** before it searches, it reads `config/geocoding`. When the switch is off, it shows "Place search is switched off" and sends nothing.
- R7 Tests:
  - Node: `location.js` (every rule, with a mocked geocoder; the box; the fallbacks);
  - Node: `geocode.js`, using a fake network, database and clock:
    - the URL and the box;
    - the User-Agent contains no personal data;
    - two lookups at once are 1 s apart;
    - a cache hit sends nothing;
    - an answer older than 30 days is looked up again;
    - with the switch off, nothing is sent;
    - a failure is not cached;
  - the Analyzer's normalisation of `location_reference` and the keyword fallback;
  - the prompt text;
  - `paramsForCreate` with a changed location;
  - a static check that:
    - the browser marks a moved pin and sends `location_source`;
    - the map credits OpenStreetMap;
    - the search box reads the switch.

## 3. Non-goals

- Changing the distances or fade, the G formula, or how a public is formed.
- Existing issues keep their stored locations.
- Places outside the creator's region; addresses typed as coordinates.
- Changing the map tiles. They come from Google's tile servers without a key, which needs a separate look (noted 2026-11-10).
- Running our own geocoder, or switching to a paid one.

## 4. Acceptance criteria

- AC1 Unit tests and CI green (R7).
- AC2 Emulator, with the free-tier key: Check for 4 descriptions gives the expected source:
  - "The entrance door of our house does not lock" -> `home`, the creator's home;
  - "Potholes on <a street near the creator's home>" -> `named_place`, within the box;
  - "The city should publish its budget online" -> `assumed_home`;
  - a made-up street -> `home_fallback`.

  Each public is formed around that point.
- AC3 Emulator: moving the pin after Check disables Create until Check again; a Check with the moved pin gives source `creator`. Create stores the draft's location, and a forged body location gets 409.
- AC4 The Analyzer log (A4) records `location_reference`; the request count stays within the free tier.
- AC5 The Nominatim policy on the emulator:
  - the run sends at most 4 requests to Nominatim;
  - a second Check of the same place sends none, because the cache answers;
  - with `config/geocoding` set to off, the named place gives `home_fallback` and the map's search box says it is off;
  - the map shows the OpenStreetMap credit.

## 5. Plan

1. `location.js` and `geocode.js` with tests (R2, R3).
2. Prompt `p3`, normalisation and fallback (R1).
3. `checkIssue`, the draft and `createIssue` (R4, R5).
4. The browser, the credit and the switch in the search box (R6).
5. Emulator AC2-AC5 with the key: about 8 text and 8 embedding requests, and at most 4 Nominatim requests.
6. Status log, CHANGES. The PR follows A4's PR.

## 6. Status log

- 2026-11-10: spec drafted (agent) from the author's decisions.
- 2026-11-10: the author kept the server lookup. Added R3 with the policy rules (identification, 1 request a second, cache, switch, credit). Added to R6 the credit and the switch for the existing search box. Added the R7 tests, AC5 and two non-goals.
