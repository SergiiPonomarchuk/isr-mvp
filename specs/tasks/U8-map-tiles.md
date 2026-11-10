# SPEC U8: Map tiles under a provider's terms

Status: APPROVED 2026-11-10 (author: option a, OpenStreetMap tiles). Implemented 2026-11-10 on top of U6; AC1-AC2 passed; AC3 after the deploy.
Branch: u8-map-tiles (from main, with U6 merged in because both change the map's credit; merged after U6; never main)
Source: a side finding of U5 and U6 (2026-11-10): the map loads Google's tiles without a key or an account.

## 1. Context (verified 2026-11-10)

| Fact | Evidence |
|---|---|
| **The tiles:** the only map in the prototype (the new-issue geotag map and the read-only view of an issue's geotag) is Leaflet 1.9.4. It loads its tiles from `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}` (subdomains `mt0`-`mt3`), with the credit "© Google Maps". These are the tile servers of the consumer Google Maps site. No key and no Google Maps Platform account are used. | `prototype/js/main.js:360-364`; `prototype/index.html:19-20` |
| **The dead Google branch:** the code has a second branch for the Google Maps JavaScript API (`google.maps.Map`), but `index.html` never loads that library, so the branch never runs. | `prototype/js/main.js:282, 427-470, 700` |
| **Google's terms** (Google Maps Platform Terms of Service, last modified 2026-08-26) allow Google Maps Content only through the Services, under an account that is responsible for its API keys (§1.2).<br>§3.2.3(a) "No Scraping": "Customer will not export, extract, or otherwise scrape Google Maps Content for use outside the Services", including "bulk download Google Maps tiles".<br>§3.2.3(b): no caching except as the service terms allow. §3.2.3(e): the Core Services may not be used "with or near a non-Google Map". | https://cloud.google.com/maps-platform/terms |
| **Google's prices** (Google Maps Platform pricing page, read 2026-11-10): Maps JavaScript API Dynamic Maps (Essentials), 10,000 free loads a month, then $7.00 per 1,000; Map Tiles API 2D tiles, 100,000 free requests a month, then $0.60 per 1,000. A Google Cloud project with billing and an API key are needed. | https://developers.google.com/maps/billing-and-pricing/pricing |
| **The OpenStreetMap tile policy** (`tile.openstreetmap.org`):<ul><li>free, with no key or account;</li><li>the HTTPS URL `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;</li><li>a valid Referer from browsers (no restrictive Referrer-Policy);</li><li>honour the tiles' caching headers;</li><li>the visible credit "© OpenStreetMap contributors";</li><li>no bulk download, pre-fetching or offline use.</li></ul>The service is "best-effort". Heavy use may be blocked without notice, and commercial services are warned that access "may be withdrawn at any point". | https://operations.osmfoundation.org/policies/tiles/ |
| **The prototype already uses OpenStreetMap** for the place search (Nominatim; U6 adds the credit). It sets no Referrer-Policy, so browsers send the site's origin as Referer. | `prototype/js/main.js:5300`; `prototype/index.html`, `firebase.json` (no `referrer`) |
| **Commercial providers' free plans** (read 2026-11-10):<ul><li>**MapTiler Cloud Free:** 5,000 sessions and 100,000 requests a month, "for testing, PoC, prototyping, personal, or non-commercial use". The MapTiler logo is required on the map, and the service pauses until the next month at the limit. Paid from $30 a month.</li><li>**Stadia Maps Free:** 200,000 credits a month, commercial use not allowed. Paid from $20 a month.</li></ul>Both need an account and a key. | https://www.maptiler.com/cloud/pricing/ ; https://stadiamaps.com/pricing/ |
| **Other map assets:** the blue markers of the creator's places come from `raw.githubusercontent.com` (a GitHub repository, not a CDN), and their shadow from Leaflet 0.7.7 on cdnjs. This is noted here but not changed. | `prototype/js/main.js:397-398` |

## 2. Options (the author chooses one)

- **a. OpenStreetMap standard tiles (recommended for the prototype).**
  - The cost: one URL and the credit in `main.js`, with no key, no account and no cost.
  - The same OpenStreetMap credit as the place search.
  - The look changes from Google's style to OpenStreetMap's.
  - Fits a prototype's light traffic; for heavy or commercial use, move to option c.
- **b. Google, through the official APIs.**
  - Either the Maps JavaScript API (the dead branch would be revived; 10,000 free loads a month), or the Map Tiles API in Leaflet (100,000 free tile requests a month, about 5,000-8,000 map views; it needs a session token).
  - Both need an API key restricted to the site's domains, a billing account on the Google Cloud project, Google's attribution, and no caching.
  - Keeps the current look.
- **c. A commercial provider** (MapTiler or Stadia).
  - An account and a key restricted to the site's domains.
  - The free plans are for prototypes or non-commercial use. MapTiler requires its logo and pauses at the limit; Stadia forbids commercial use for free.
  - Paid from $20-$30 a month.
- **d. Keep Google's tile servers.** Not recommended: it is outside Google's terms, and Google can block it at any time.

## 3. Requirements (for option a; adapted if another option is chosen)

- R1 **The tile layer:**
  - `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, `maxZoom` 19 (the server's limit);
  - the credit `© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>`, together with U6's "Search: © OpenStreetMap contributors" or merged with it;
  - the URL and the credit in one constant (the policy recommends a configurable URL).
- R2 **The dead Google Maps JavaScript API branch is removed**, so that no Google code path remains.
- R3 **No pre-fetching or offline tiles.** Leaflet requests only the visible tiles, which needs no change.
- R4 **Tests:** a static check that `main.js` uses the OpenStreetMap URL and credit, and has no `google.com/vt` and no `google.maps`.

## 4. Open point (author)

- 4.1 Option a, b, c or d (section 2). Recommendation: a. **Decided 2026-11-10: a.**

## 5. Non-goals

- The place search (U6 and the existing search box), the marker icons, the circles, μ and σ.

## 6. Acceptance criteria

- AC1 Unit tests and CI green (R4).
- AC2 Emulator: the geotag map shows OpenStreetMap tiles with the credit. Pin moves, the profile places and the read-only view of an issue work as before. No request goes to `google.com`.
- AC3 Live, after the author's hosting deploy: the same, read-only.

## 7. Plan (after the choice)

1. R1-R4 on branch `u8-map-tiles`. U6 changes the same credit line in `main.js`, so U8 starts from U6's branch, or from main once U6 is merged.
2. AC2 on the emulator.
3. Status log, CHANGES, spec index; PR. The deploy goes with the next hosting deploy (U7 or U6).

## 8. Status log

- 2026-11-10: spec drafted (agent) with the facts above; waits for the author's choice (4.1).
- 2026-11-10: the author chose option a ("Map tiles spec (U8): a").
- 2026-11-10: implemented (agent):
  - R1: `MAP_TILES` in `main.js` (URL, `maxZoom` 19, credit). One credit, "© OpenStreetMap contributors", now covers the tiles and U6's place search, and the search box keeps its own line.
  - R2: the Google Maps JavaScript API branches (circles, map, markers, `updateTargetMarker`) are removed; 112 lines.
  - R4: `functions/test/map_tiles.test.js` (3). U6's browser test is adapted (one profile-marker handler, the merged credit).
- 2026-11-10: checks (agent):
  - AC1: Node 89 pass.
  - AC2: a static server with this branch's code, the Firestore emulator's data and test user 2. The geotag map loaded 12 of 12 tiles from `tile.openstreetmap.org` and showed "© OpenStreetMap contributors". No request went to Google. Picking a profile place still moved the pin (source "creator"). No console errors.
  - Pending: AC3 on live after the hosting deploy (with U6).
