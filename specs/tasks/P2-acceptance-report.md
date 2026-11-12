# P2 remaining acceptance checks

Recorded 2026-11-12 (client date). P2 branch code `15e13f5`; running application is U8 `0eddbc6` with the verified U6/A4 backend. All database operations targeted emulator `127.0.0.1:8080`. No live writes or deployment.

## Follow-up verified: A5, 2026-11-12

The building-locality blocker below is resolved on the tested A5 stack, [PR #24](https://github.com/SergiiPonomarchuk/isr-mvp/pull/24). Captured-result replay and a fresh p4 Check retain 1,033 local/property-linked candidates and remove all 3,908 unrelated-owner bypasses. Garage inclusion remains (1,391 candidates; displayed 25/25 verified owners). The old offending draft now receives 409 requesting a new Check. No P2 migration rerun or old public-score rewrite was performed.

P2 AC3/AC4 therefore pass on this stack. A5 must be merged and included in the coordinated code deployment before relying on locality on live. Live AC5 remains the author's step. See A5's emulator report in PR #24 for its separate two-call usage and export record. The original failed observations below are retained as regression evidence.

## Original result (before A5)

**AC3 passed. AC4 is partial and blocked: the building locality requirement failed.** The data-only P2 implementation was not changed to conceal or work around this failure.

## Data and unit checks

- Migration dry run: 9,150 already as planned, 0 to write, 0 held, 0 problems. No migration apply was performed.
- P2 Node tests: 47 passed. Python: 66 run, 65 passed and one skipped. Dependencies installed from the existing lockfile into P2's drive-A worktree; no versions changed.
- osbb 1 h5 has 250 residents. Across the population there are 381 garage owners and three garage cooperatives, matching the recorded migration.

## AC3: profile and map

Synthetic uid 1189 was selected because the person lives in osbb 1 h5 and owns a garage.

- Profile shows home osbb 1 h5 at `[47.590114, 7.611201]` (rounded for display), a flat property at the same building, and a garage property in garages osbb 1, box 53.
- New-issue map starts at exactly `[47.590114, 7.611201]`; home, flat and garage appear in the profile anchor list.
- Selecting the garage sets `[47.589962, 7.610119]`, matching the stored property point.
- No profile changes or browser database writes were made.

## AC4: building locality FAILED

Issue text: "The entrance door of our house does not lock. This affects residents of our apartment building only; neighboring buildings have their own entrances. We need to repair this entrance lock to keep our building secure."

- Model source, prompt p3, resolved source home; point `[47.590114, 7.611201]`.
- mu 40 m, sigma 30 m: cutoff 130 m. These geographic parameters are correct for the requested test.
- Derived demographics: minAge 14, otherwise unrestricted age/employment/family; no features or places; `property_kinds: [flat, house]`.
- Check returned **4,941 candidates**. The response displays its usual top 25; the count is the full pre-display-cap count, not a created public size. No issue was created.
- Independent read-only audit using the actual `functions/demographics.js` and `functions/geo.js`: **1,033** eligible people have an anchor within 130 m; **3,908** more owners bypass the cutoff solely through property-kind matching. Sum 4,941, exactly matching Check. D weight 0.30 alone exceeds the inclusion threshold 0.15.
- Examples of those bypassing the cutoff (uids only): 10, nearest anchor 1,034 m; 100, 971 m; 1002, 1,406 m; 1003, 810 m; 1005, 1,411 m.
- A member living in another estate can legitimately own property in h5; home address alone was not used as evidence of failure. The audit instead checks each person's nearest home/work/property anchor.
- Cause: the Analyzer interprets local residential maintenance as all-flat/house-owner relevance, activating the existing A3 distance bypass. This is an Analyzer/selection-scope issue, not a building-coordinate migration failure. P2's non-goals exclude changing relevance and existing public scores.

## AC4: garage inclusion PASSED for the stated criterion

Issue text: "The row of garages where I own a garage needs a shared fire safety inspection and repairs to its electrical wiring. This concerns garage owners, including owners who live elsewhere, rather than all neighborhood residents."

- Checked at the creator-selected stored garage point `[47.589962, 7.610119]`.
- Model derived `property_kinds: [garage]`, mu 60 m, sigma 40 m.
- Full candidate count 1,391; the displayed 25/25 are verified garage owners, each with D_match `property_kind`.
- This demonstrates reaching garage owners. It does not assert that all 1,391 candidates are garage owners; the current rules can also include nearby non-owners.

## Requests and saved evidence

- Two Check calls: two text-model and two embedding requests; no Nominatim request and no Create call.
- Text-model usage: 16,436 prompt and 2,059 output tokens (18,495 total). Embedding input approximately 121 tokens (four-character estimate).
- Approximately $0.0072 at A4's recorded paid rates.
- Both drafts and model logs saved in the emulator export at **2026-11-11 22:58 UTC**, CLI exit 0. Emulator left running for the author; root checkout remains U8.

## Next decision

P2 must not be marked fully accepted or ready to merge while its building AC4 fails. A separate approved residential-scope fix is recommended: local building maintenance must not widen into all flat/house owners, while actual owners of the affected building and explicit garage-owner cases remain included. No algorithm fix has been implemented under this data-only task. Live AC5 remains the author's step.
