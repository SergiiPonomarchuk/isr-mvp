# SPEC P2: Homes in real buildings, and property for the synthetic people

Status: DRAFT 2026-11-10: waits for the author's approval and decisions (section 4).
Branch: p2-homes-and-property (from main at `f58bf25`; never main)
Source: the author, 2026-11-10 (D1 review):
- "these 8 large housing complexes are multi-storied complexes, townhouses cooperatives and private houses/villas. They should be split for houses and restored in DB with more precise coordinates. Use normal distances between such buildings to plan realistic location of the buildings for each user."
- "property data - generate appropriate property entrances taking into account user data".

Needed by: D1 (the demo scenarios need people in buildings, so that a building issue reaches that building).

## 1. Context (emulator, read-only, verified 2026-11-10)

| Fact | Evidence |
|---|---|
| **Homes share one point per estate.** The 9,150 homes lie on 8 points, one per estate, and every home of an estate has that estate's point. | query of `users.geography` |
| **The estates and their buildings:**<ul><li>**osbb 1** (apartments, 47.5898, 7.6124): 14 buildings h1-h14 with 24-89 flats each; 2,087 residents.</li><li>**osbb 2** (47.5943, 7.6205): 12 buildings with 34-81 flats; 2,154 residents.</li><li>**osbb 3** (47.6016, 7.6056): 8 buildings with 20-80 flats; 1,280 residents.</li><li>**osbb 4** (47.5992, 7.5994): only h3, with 2 flats and 6 residents.</li><li>**townhouse 1** (47.5919, 7.6261): 945 houses, 2,840 residents.</li><li>**townhouse 2** (47.5894, 7.6188): 200 houses, 658 residents.</li><li>**village 2, medium** (47.5944, 7.6129): 1 private house, 2 residents.</li></ul>A flat or house is the pair (address, unit). Households have 1-9 people, 2-3 on average. | same |
| **"Andim" is not an estate.** 123 people have the home address and unit "Andim" (1 unit) at (47.5538, 7.6066), the prototype's default Basel point. Only 5 of them work at Andim, the largest employer. They form 45 families of 1-5 people.<br>`main.js` uses the same point for a mock "residence" ("Spalenring 12"). | same; `prototype/js/main.js:1063` |
| **Families live together.** 10,795 close-family pairs (spouses, parents and children) share a flat; 2,127 live apart (mostly adult children). | same |
| **No property.** Nobody has a `property` entry (types are only `home` 9,150 and `work` 4,911). | same |
| **The property format is set** (A3): `{type: "property", kind, place, address, geo, id}` with kind = flat, house, land, garage, commercial or other.<ul><li>An issue's `property_kinds` include an owner by kind; its `places` include an owner whose property `place` matches (D, with the distance bypass).</li><li>G uses the nearest of home, work and property.</li></ul> | `functions/demographics.js:6-11, 47-58`; `functions/geo.js` |
| **What reads homes:**<ul><li>G (`functions/index.js`, `scripts/` R and E tools);</li><li>U6, the issue's point from the creator's home;</li><li>the profile page and the geotag map (`main.js:9232`, `405`);</li><li>`user_packs`, the copy `createIssue` reads first.</li></ul>The A4 embedding texts leave out home, work and property, so P2 needs no re-embedding. | the code; `scripts/embedding_templates.py:6` |
| **Order with P1:** P1 rewrites the people on the emulator on 2026-11-11 (work experience) and rebuilds `user_packs`. P2 writes after P1, so the two never run at the same time. | P1 spec |

## 2. Requirements

- R1 **Buildings with realistic spacing** (a fixed layout, no randomness). Each estate keeps its current point as its centre, and buildings are laid out around it:
  - **Apartment blocks** (osbb): one building per address `osbb N, hK`, in rows, 60 m apart along a row and 70 m between rows (about twice the height of a 9-12 storey block, for daylight). The buildings are numbered in reading order (h1 at the north-west).
  - **Townhouses:** one house per unit, in rows of 8 houses 8 m apart (house width). Rows stand side by side with a 16 m lane between their ends, and 32 m apart north to south (house depth, gardens and a path). The rows form a near-square estate: townhouse 1 about 560 × 540 m, townhouse 2 about 240 × 290 m.
  - **Private houses:** one house per plot, 30 m apart.
  - **The rule between estates:** no two buildings of different estates closer than 40 m. The script checks this and stops if it is broken.

  The metres become degrees with 1° latitude = 111,320 m and 1° longitude = 111,320 m × cos(latitude).
- R2 **Every home moves to its building's point.**
  - The home entry keeps `address`, `unit` and `unit_type`, and gets `geo` = the building's point and `building` (for example "osbb 1, h5" or "townhouse 1, house 17").
  - People of one flat or house share the point.
  - **Andim** (decision 4.1): the 45 families become flats in the missing buildings **osbb 4, h1 and h2** (about 23 flats each), next to h3, with addresses "osbb 4, h1/h2" and unit_type "apartments".
- R3 **Property entries**, by fixed rules from the person's data (age, household, home, work), seeded (`20261110`, one draw per household), so a re-run gives the same result. The rates are decision 4.2.

  | Kind | Who | Where (`place`, `geo`) |
  |---|---|---|
  | flat | the adults of 85 % of apartment households (the owners; spouses own together) | their own building |
  | flat (rented out) | each of the other 15 % of apartment households is rented from a landlord: an adult aged 40-75 with a degree, living in another building | the rented flat's building |
  | house | the adults of 95 % of townhouse and private-house households | their own house |
  | garage | 20 % of apartment households (one adult aged 25-80) | a garage cooperative next to each osbb estate ("garages osbb N"), rows 3.5 m apart |
  | land | 25 % of households with someone aged 50+, and 8 % of the others (one adult) | three garden cooperatives ("gardens 1-3"), 3-6 km outside the city, with plots 25 m apart |
  | commercial | 2 % of adults aged 30-65 with a job whose title or place points to a business of their own | a unit in "Office centre" or a shop near their estate |

  Children (under 18) own nothing. Each entry has a new `id` (unique within the person), and no person gets two entries of the same kind and place.
- R4 **`user_packs`** are rebuilt from `users`, as P1 does.
- R5 **The script** `scripts/migrate_p2.py`:
  - a dry run by default; `--apply` on the emulator; on live only with `--project … --i-know-this-is-live`, run by the author;
  - a second run changes nothing;
  - it writes `geography` with `merge=["geography"]`.

  **Report:**
  - the buildings per estate and their extent in metres;
  - the smallest distances (within a type, between estates);
  - the homes moved;
  - property counts by kind and by age band;
  - the landlord and tenant balance.

  **Map files for checking:** GeoJSON files `specs/tasks/P2-buildings.geojson` and `specs/tasks/P2-property.geojson`, holding points with the building name and type, and no names of people.
- R6 **Tests:**
  - the layout (spacing, no overlap, reading order);
  - the move (families together, address and unit kept);
  - Andim;
  - the property rules on fixture people (children own nothing; renters have a landlord; the same seed gives the same result);
  - the idempotent second run;
  - the packs.

## 3. Non-goals

- Real buildings from OpenStreetMap. Copying them would bring the ODbL database terms, so the synthetic buildings sit on the map without matching real houses.
- Floors, flat numbers inside a building, or streets.
- Changing the stored relevance of the old publics. D1 archives them (decision 5.2).

## 4. Decisions (author)

- 4.1 **Andim's 123 people:**
  - a. 45 flats in new buildings osbb 4, h1 and h2 (recommended);
  - b. 45 private houses in a new village;
  - c. leave them.
- 4.2 **The property rates in R3:** as proposed, or changed.
- 4.3 **The spacing in R1:** as proposed (apartment blocks 60 m and 70 m; townhouses 8 m and 32 m; private houses 30 m), or changed.

## 5. Acceptance criteria

- AC1 Unit tests and CI green (R6).
- AC2 Emulator, after P1's apply:
  - the dry-run report checked;
  - `--apply` run, then a second run that changes nothing;
  - every home on its building's point;
  - the distance rule kept;
  - `user_packs` equal to `users`.
- AC3 Emulator, in the browser: the profile and the geotag map show the home on its building, and the property entries appear.
- AC4 Emulator: a Check of a building issue (μ about 40 m) by a resident of osbb 1 h5 forms a public from that building and its near neighbours, not the whole estate. An issue with `property_kinds: ["garage"]` reaches garage owners.
- AC5 Live, after the author's run: the same counts, read-only.

## 6. Plan

1. Spec approval and decisions 4.1-4.3.
2. `migrate_p2.py` and the tests (R1-R6), with dry runs only until P1 is applied on the emulator.
3. After P1's apply: AC2-AC4 on the emulator, then export the emulator.
4. Status log, CHANGES, spec index, PR. On live, the author runs P2 after P1.

## 7. Status log

- 2026-11-10: spec drafted (agent) from the author's request, with the facts above; waits for approval and decisions 4.1-4.3.
