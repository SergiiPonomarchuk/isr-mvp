# SPEC P2: Homes in real buildings, and property for the synthetic people

Status: APPROVED 2026-11-10 (author: Andim spread around its point with fictional addresses; the 8 current points as estate centres; separate objects outside the estates except those in apartment blocks; new names for numbered objects; "the rest is ok"). Implementation next; writes to the emulator only after P1's apply.
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
| **Workplaces and other objects:** 4,911 work entries name 78 places, each at one point. Several facts matter here:<ul><li>**Numbered names:** 63 have names like "School 3", "Grocery Store 8", "Phatmacy 10" (sic) or "Saloon 8".</li><li>**On estate points:** 33 sit exactly on an estate's point. All 4 schools and 4 kindergartens do, and so do many shops, pharmacies, cafés and salons on the osbb points. Some shops, a pharmacy and a kindergarten sit on the townhouse and village points.</li><li>**Shared addresses:** 46 objects at different points share the address "Post square, 3".</li><li>**The employer Andim** (1,013 workers) sits at the rounded point (47.5, 7.5), about 10 km from everything else.</li></ul>Children's posts name generic places ("school" 1,736, "kindergarden" 407, "home" 584), not an object. | query of `users.geography` and `users.post` |
| **P1's texts mention no numbered name** (4,250 generated records checked). The A4 embedding texts leave out the job's place, so renaming objects needs no re-embedding. | `scripts/p1_generated/work_experience.jsonl`; `scripts/embedding_templates.py:6` |
| **Families live together.** 10,795 close-family pairs (spouses, parents and children) share a flat; 2,127 live apart (mostly adult children). | same |
| **No property.** Nobody has a `property` entry (types are only `home` 9,150 and `work` 4,911). | same |
| **The property format is set** (A3): `{type: "property", kind, place, address, geo, id}` with kind = flat, house, land, garage, commercial or other.<ul><li>An issue's `property_kinds` include an owner by kind; its `places` include an owner whose property `place` matches (D, with the distance bypass).</li><li>G uses the nearest of home, work and property.</li></ul> | `functions/demographics.js:6-11, 47-58`; `functions/geo.js` |
| **What reads homes:**<ul><li>G (`functions/index.js`, `scripts/` R and E tools);</li><li>U6, the issue's point from the creator's home;</li><li>the profile page and the geotag map (`main.js:9232`, `405`);</li><li>`user_packs`, the copy `createIssue` reads first.</li></ul>The A4 embedding texts leave out home, work and property, so P2 needs no re-embedding. | the code; `scripts/embedding_templates.py:6` |
| **Order with P1:** P1 rewrites the people on the emulator on 2026-11-11 (work experience) and rebuilds `user_packs`. P2 writes after P1, so the two never run at the same time. | P1 spec |

## 2. Requirements

- R1 **Buildings with realistic spacing** (a fixed layout, no randomness). The 8 current points are the estates' geographical centres (author), Andim's included, and buildings are laid out around them:
  - **Apartment blocks** (osbb): one building per address `osbb N, hK`, in rows, 60 m apart along a row and 70 m between rows (about twice the height of a 9-12 storey block, for daylight). The buildings are numbered in reading order (h1 at the north-west).
  - **Townhouses:** one house per unit, in rows of 8 houses 8 m apart (house width). Rows stand side by side with a 16 m lane between their ends, and 32 m apart north to south (house depth, gardens and a path). The rows form a near-square estate: townhouse 1 about 560 × 540 m, townhouse 2 about 240 × 290 m.
  - **Private houses:** one house per plot, 30 m apart.
  - **The rule between estates:** no two buildings of different estates closer than 40 m. The script checks this and stops if it is broken.

  The metres become degrees with 1° latitude = 111,320 m and 1° longitude = 111,320 m × cos(latitude).
- R2 **Every home moves to its building's point.**
  - The home entry keeps `address`, `unit` and `unit_type`, and gets `geo` = the building's point and `building` (for example "osbb 1, h5" or "townhouse 1, house 17").
  - People of one flat or house share the point.
  - **Andim** (author, decision 4.1): each of the 45 families gets its own point around the current Andim point, the centre.
    - They are city houses on a spiral grid, at least 30 m apart and within about 400 m.
    - Each gets a fictional address, a street from a fixed list of invented names and a house number: for example "Quill Lane 7".
    - The unit_type is "city houses". The family stays together.
- R1b **Separate objects do not intersect the estates** (author). An estate's area is the box around its buildings plus 40 m. The objects are the 78 workplaces and the new property objects (R3):
  - **In an apartment block:** a shop, store, pharmacy, café, bar, salon or restaurant that sits on an osbb estate's point today moves to the ground floor of one of that estate's apartment buildings, spread over the buildings in turn. It takes that building's point and address ("osbb 1, h5, ground floor").
  - **Inside an estate otherwise:** any other object inside an estate's area moves to the nearest free spot outside all estate areas, at least 30 m from other objects. This covers schools, kindergartens, and shops on townhouse or village points. It gets a fictional address, as Andim's families do.
  - **Already outside:** an object outside every estate's area stays where it is.

  One point per object: every worker's work entry follows its object. Andim, the employer at (47.5, 7.5), is outside all estates and stays.
- R1c **New names for the numbered objects** (author). The 63 numbered objects get the fictional names of Appendix A; the old typos "Phatmacy" and "Kindergarden" disappear with the new names.
  - **Renamed:** the `place` of users' work entries, the `place` of `post` entries that name the object, and `user_packs`.
  - **Reported, not changed:** other collections that name an old object, such as the `demographic_rules.places` of old issues, belong to the old publics that D1 archives.
  - Names without a number (Hospital, Magistrate, Office centre, Concert Hall and others) stay.
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
  - Andim (45 points, at least 30 m apart, around the centre, fictional addresses);
  - the objects (none inside an estate area unless in an apartment block; workers follow their object);
  - the renaming (every numbered name replaced, no other name touched);
  - the property rules on fixture people (children own nothing; renters have a landlord; the same seed gives the same result);
  - the idempotent second run;
  - the packs.

## 3. Non-goals

- Real buildings from OpenStreetMap. Copying them would bring the ODbL database terms, so the synthetic buildings sit on the map without matching real houses.
- Floors, flat numbers inside a building, or streets.
- Changing the stored relevance of the old publics. D1 archives them (decision 5.2).

## 4. Decisions (author, 2026-11-10)

- 4.1 **Andim's 123 people:** spread their 45 households around the current point with fictional addresses (author's own option; R2).
- 4.2 **The property rates in R3:** as proposed ("the rest is ok").
- 4.3 **The spacing in R1:** as proposed, with the 8 current points as estate centres and separate objects kept out of the estates (R1, R1b).
- 4.4 **Numbered objects:** new names (R1c, Appendix A).

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
- 2026-11-10: approved by the author with three additions:
  - Andim's households spread around their point with fictional addresses;
  - the 8 current points as the estate centres, and separate objects kept out of the estates except those in apartment blocks;
  - new names for numbered objects.

  The spec was amended: R1, R1b, R1c, R2, R6, section 4 and Appendix A. Another read-only look at the 78 workplaces added the facts in section 1.

## Appendix A: new names for the numbered objects

Fictional names, written for this dataset. The rename map is kept in `scripts/migrate_p2.py` as one table.

| Old | New | Old | New |
|---|---|---|---|
| School 1 | Linden Hill School | School 2 | Northgate School |
| School 3 | Riverside School | School 4 | Meadowbrook School |
| Kindergarden 1 | Little Owls Kindergarten | Kindergarden 2 | Sunflower Kindergarten |
| Kindergarden 3 | Busy Bees Kindergarten | Kindergarden 4 | Rainbow Kindergarten |
| Kindergarden 5 | Acorn Kindergarten | Kindergarden 6 | Ladybird Kindergarten |
| Hotel 1 | Hotel Silver Linden | Hotel 2 | Hotel Old Mill |
| Restaurant 1 | The Copper Pot | Restaurant 2 | Golden Ear Restaurant |
| Restaurant 3 | Three Bridges Bistro | Private shop 1 | Book Nook |
| Private shop 2 | Tick & Tock Watch Repair | Private shop 3 | The Gift Box |
| Private shop 4 | Spoke & Wheel Bikes | Miscellaneous Store 1 | Odds & Ends |
| Miscellaneous Store 2 | Corner Bazaar | Miscellaneous Store 3 | Handy Things |
| Miscellaneous Store 4 | Little Emporium | Miscellaneous Store 5 | Everyday Goods |
| Grocery Store 1 | Fresh Basket | Grocery Store 2 | Harvest Corner |
| Grocery Store 3 | Daily Bread Grocery | Grocery Store 4 | Greenleaf Grocery |
| Grocery Store 5 | Sunrise Foods | Grocery Store 6 | Orchard Market |
| Grocery Store 7 | Village Pantry | Grocery Store 8 | Hilltop Grocery |
| Grocery Store 9 | Brookside Foods | Grocery Store 10 | Good Grain Grocery |
| Clothing Store 1 | Thread & Needle | Clothing Store 2 | Blue Loom |
| Clothing Store 3 | Urban Thread | Clothing Store 4 | Woolly Lane |
| Clothing Store 5 | Tailor's Corner | Clothing Store 6 | Linen House |
| Clothing Store 7 | Stitch Studio | Phatmacy 1 | Green Cross Pharmacy |
| Phatmacy 2 | Linden Pharmacy | Phatmacy 3 | Health Corner Pharmacy |
| Phatmacy 4 | Rosemary Pharmacy | Phatmacy 5 | Northside Pharmacy |
| Phatmacy 6 | Chamomile Pharmacy | Phatmacy 7 | Sage Pharmacy |
| Phatmacy 8 | Willow Pharmacy | Phatmacy 9 | Juniper Pharmacy |
| Phatmacy 10 | Elmwood Pharmacy | Cafe 1 | Morning Star Café |
| Cafe 2 | Corner Cup Café | Cafe 3 | Hazel Café |
| Cafe 4 | Bluebird Café | Cafe 5 | Steam & Crumb Café |
| Cafe 6 | Velvet Bean Café | Bar 1 | The Lantern Bar |
| Bar 2 | Night Owl Bar | Bar 3 | Cellar Bar |
| Saloon 1 | Silk & Scissors Salon | Saloon 6 | Glow Beauty Salon |
| Saloon 8 | Mirror Hair Salon | | |
- 2026-11-10: implemented (agent): `scripts/migrate_p2.py` (R1-R5) and `tests/test_migrate_p2.py` (14 tests).
  - **How a re-run changes nothing:** `--make-plan` writes the plan once, from the original people, with each person's source hash. `--apply` writes only people whose source is unchanged; a person already as planned is skipped, and a changed one is held.
  - **The edge of an area:** a moved object keeps 1 m clear of the area's edge, so that rounding never leaves it on the edge.
- 2026-11-10: read-only preview on the emulator's data, before P1. Nothing was written; the output went to the agent's scratch folder.
  - **People and buildings:** 9,150 people to move. 1,226 buildings: 35 apartment blocks, 1,145 townhouses, 45 city houses and 1 private house.
  - **Extents:**
    - townhouse 1: 536 × 512 m; townhouse 2: 216 × 256 m;
    - osbb 1: 180 × 210 m; osbb 2: 180 × 140 m; osbb 3: 120 × 140 m;
    - Andim's city houses: within 377 × 371 m.
  - **Objects:** 19 move into apartment blocks, 15 move out (20-300 m), and 44 stay.
  - **Property entries:**
    - flats 2,948 and houses 1,882 (use: home 4,563, rented out 267);
    - garages 381, in 3 cooperatives;
    - garden plots 503, in 3 gardens;
    - commercial 78.
  - **Distance rules:** all hold.
  - **On a map** (OpenStreetMap): the layout has regular, realistic spacing.
  - **Finding:** the estate centres lie in Weil am Rhein (Germany), just north of Basel; osbb 3 is next to the A5 motorway junction. The author's centres are kept.
  - **Next:** after P1's apply on 2026-11-11, `--make-plan` on the emulator (the real plan, committed), then AC2-AC4.
- 2026-11-10: the author on the location: "It is ok. All these places In Andim and Bilim - fiction cities for testing environment." The estates belong to the fictional cities Andim and Bilim on real coordinates, so real map features underneath are not a problem. Andim's 123 people, with the home address "Andim", live in the city of Andim; R2 gives them fictional street addresses there.
