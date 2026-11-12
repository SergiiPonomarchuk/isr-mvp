# U8 local map verification

Date: 2026-11-11. Code: `9aa148d` (U8 with verified U6 `7bbfd45`). Page `http://127.0.0.1:5000/main.html?emulator=1`; synthetic uid 2. Backend source matches U6. No database writes, AI calls, Nominatim lookups, deployments or live changes during these checks.

## AC1: unit checks

- Node 91 passed, including the three map-tile checks and U6's adapted browser checks.
- Python 73 run, 72 passed and one skipped.
- Static checks confirm one `MAP_TILES` setting, HTTPS `tile.openstreetmap.org/{z}/{x}/{y}.png`, maximum zoom 19, OpenStreetMap credit, and no Google tile or Maps JavaScript API path.

## AC2: local browser

- Editable map starts at uid 2's current P2 home `[47.593671, 7.621699]`.
- OpenStreetMap tiles render with linked `© OpenStreetMap contributors` attribution. Tile loading was initially slow, but all 18 images present after the tested pan loaded successfully, each 256 pixels wide and from `tile.openstreetmap.org`.
- Selecting the Work profile anchor sets `[47.601000, 7.618000]` and labels the point `set by you`.
- Clicking the map updates the epicenter to `[47.602650, 7.610703]`; dragging the issue pin then updates it to `[47.601735, 7.612409]`.
- Read-only map opened from the saved U6 test issue: all 12 tile images loaded from OpenStreetMap. The marker lacks the draggable class; clicking another map point leaves the stored/displayed epicenter `[47.593671, 7.621699]` unchanged. Derived distance/fade controls are disabled.
- Runtime resource-host audit found no `google.com` host or subdomain and no `maps.googleapis.com` requests. Other font/analytics hosts were observed and are outside this tile task. No Google tile images appeared in the DOM.
- No warning/error console entries during the checks.
- Temporary read-only resource logging was removed by restoring the original file bytes, preserving CRLF and the final CR. No implementation fix was necessary.

## Remaining and preview state

- AC3 remains the author's hosting deployment followed by read-only live verification, after A4 and U6.
- Local emulators remain running with Java heap `-Xmx8g` for the author's inspection. `C:\isr-mvp` is detached at U8; its application source matches the U8 PR. Do not switch it back to pre-A4 code while the emulator is serving this preview.
- The latest saved database remains the verified U6 export (2026-11-11 19:15 UTC). These U8 checks made no database changes, so no new export was required.
- PR is stacked on U6 #21, which is stacked on A4 #20. No merges performed.
