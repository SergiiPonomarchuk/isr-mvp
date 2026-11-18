# Phase A offline capacity audit result

2026-11-18, author-approved Phase A only. **NO-GO for compact-only physical atomic publication across the intended reference range.** Propose a separate Phase C design for immutable generations and small atomic activation. No runtime codec, schema/reader change, paged scoring, database write/import, rules edit, provider call or deploy was performed.

## Evidence and decision

- **22 structural fixtures: 19 completed, three refused at the 120-second ceiling.** The separate two-fixture smoke is preparatory evidence and is excluded from that total. Timeouts retained their last completed operation measurements; unmeasured compact paths are not passes.
- At 9,150 members / 19 distinct reference calculations, current Create is **27,801,744 bytes**; lossless compact Create is **13,793,088 bytes**, exceeding the existing request guard (10,452,992 bytes) by **3,340,096 bytes**. Every measured document fits its separate guard. This is a complete measured failure, independent of the 100-reference timeouts.
- With exact admitted quotation-v2 raw receipts/review, 9,150 synthetic A members produce current Create **12,057,509 bytes**, compact Create **5,816,909 bytes**, and current/compact Join **4,722,678 / 3,407,580 bytes**. The compact case fits byte guards only; this is not server or actual-population acceptance.
- Shared inputs compress well: 9,150 / 19 references sharing three evaluation slots produce compact Create **6,351,465 bytes**. Distinct CBC calculation inputs require 19 slots, so references cannot be collapsed just because some displayed scores look alike.
- Current Join wire updates can fit while the existing full-image preflight refuses: for 9,150 / three references, wire Join is **4,729,288 bytes**, versus full-image guard-shape **12,670,469 bytes**. The guard has not been changed. Compacted distinct-19 Join wire fits, but its conservative full-image request estimate still does not.

Phase B alone cannot establish the approved range. A different future representation is not mathematically ruled out by one codec experiment, but no universal atomic-fit claim is supported. Do not trim members, references, zero-X relatives, provenance or numeric precision. Prepare Phase C's separate contract before runtime work; approval is still required.

## Complete measured matrix

Bytes below are SDK CommitRequest protobuf bytes, including a synthetic 32-byte transaction token. **over** means above the existing 10 MiB-minus-margin request guard. Check comprises independent log and draft creates, separately reported in raw JSON. Every complete fixture also verifies zero-write completed-draft replay. Every Join includes the next explicit member (9,151 in the large fixtures), all existing normalization updates, root maps/participants/public values and its event.

| Fixture | Status | Current Create | Compact Create | Current Join | Compact Join | Peak RSS MiB |
|---|---|---:|---:|---:|---:|---:|
| oracle-small | completed | 37,573 | 35,275 | 5,496 | 4,271 | 106.8 |
| shared-100-1 | completed | 148,134 | 80,525 | 53,966 | 39,047 | 108.1 |
| shared-100-3 | completed | 179,584 | 102,605 | 54,273 | 39,260 | 106.9 |
| shared-100-19 | completed | 355,131 | 123,213 | 55,899 | 39,260 | 109.8 |
| shared-100-100 | completed | 1,247,419 | 228,001 | 64,060 | 39,158 | 163.3 |
| shared-1000-1 | completed | 1,278,088 | 593,788 | 513,907 | 372,116 | 114.8 |
| shared-1000-3 | completed | 1,487,407 | 709,137 | 514,112 | 372,227 | 114.5 |
| shared-1000-19 | completed | 3,074,162 | 729,745 | 514,736 | 371,225 | 115.1 |
| shared-1000-100 | completed | 11,138,028 **over** | 833,633 | 524,001 | 372,227 | 144.9 |
| shared-9150-1 | completed | 11,630,616 **over** | 5,371,716 | 4,719,931 | 3,428,013 | 177.0 |
| shared-9150-3 | completed | 13,449,827 **over** | 6,330,857 | 4,729,288 | 3,437,276 | 174.9 |
| shared-9150-19 | completed | 27,801,618 **over** | 6,351,465 | 4,730,914 | 3,437,276 | 174.0 |
| shared-9150-100 | timeout refused | 100,736,035 **over** | unmeasured | 4,739,177 | unmeasured | 180.2 |
| distinct-9150-3 | completed | 13,449,841 **over** | 6,330,871 | 4,729,288 | 3,437,276 | 177.9 |
| distinct-9150-19 | completed | 27,801,744 **over** | 13,793,088 **over** | 4,730,914 | 3,438,149 | 168.4 |
| distinct-9150-100 | timeout refused | 100,745,883 **over** | unmeasured | 4,739,177 | unmeasured | 177.0 |
| one-aspect-9150-100 | timeout refused | 100,239,908 **over** | unmeasured | 4,764,797 | unmeasured | 177.0 |
| dense-1000-19 | completed | 4,390,073 | 2,119,456 | 514,736 | 371,225 | 118.4 |
| metadata-stress-1000-3 | completed | 1,570,668 | 764,398 | 514,140 | 372,255 | 115.4 |
| admitted-100 | completed | 257,650 | 190,041 | 53,630 | 38,711 | 116.6 |
| admitted-9150 | completed | 12,057,509 **over** | 5,816,909 | 4,722,678 | 3,407,580 | 160.6 |
| two-aspect-1000-3 | completed | 1,482,810 | 651,265 | 514,112 | 372,170 | 115.0 |

All **measured** post-images remain below the document guard; this does not bound arbitrary future text, names, source metadata or larger populations. Raw JSON includes largest document/path, write counts, sampled heap/external memory, elapsed time and independent Check records. Large Create contains 9,157 writes; large Join 9,155. No server accepted these operations because none were sent.

## Method and fidelity

`functions/tools/capacity/capture.js` runs the actual Check/Create/replay/Join mutation paths in a four-person in-memory store. Population loading and duplicate queries are injected synthetic functions, so this is publication-shape capture rather than whole-application acceptance. Actual Join scoring is retained. Full protobuf encoding equals the streamed counter on small fixtures, including update masks, create preconditions, registry increment transform and draft result update. Complete small captures match generated envelopes byte-for-byte. Scaling streams one member write at a time instead of retaining a giant protobuf and all alternate write sets.

The offline codec shares reference/aspect/CBC dictionaries, immutable common fields and frozen names on the public, then records member scalars, evidence tuples and outgoing A links. The original issue model/aspects, raw responses, diagnostics, raw chain and exclusion provenance remain intact. A full dictionary for replay names is necessary: keeping the full original response can independently enlarge the completed draft. Exact decode equality is asserted for each encoded member, dates, zero/nulls, source/tie, raw evidence and cached replay response. Explicit Join uses the frozen A/B classification and exact current normalization order. Unknown versions/slots/fields, conflicting shared evidence and malformed encoded values refuse. This is a restricted experimental representation, not a production reader/validator contract.

The synthetic population mixes 5,490 A / 3,660 B in large mixed fixtures, including positive additions, zero-X B and full additions rejected by source ceilings. Canonical cohort/order/normalization parity is checked against current modules on small fixtures. Standard ties are five/person, bounded dense stress reaches 128 links/person at 1,000 members. All-A, one/two/three aspects, 1/3/19/100 references, distinct/shared slots and longer metadata/names are covered. Synthetic reference multiplicity is structural, not a real semantic finding. Scoring uses repeated synthetic score/vector shapes; these elapsed/RSS figures do not measure 9,150 real profile/skill-vector evaluations.

The initial matrix uses generated valid staged responses with the admitted usage-field shape (counters zero and marked synthetic). The supplemental admitted fixtures replay the exact saved raw outputs and usage from the accepted quotation case, revalidate the original decision/domain review against its source, and retain original request hashes separately from prompt/schema hashes. Aspect/profile vectors and people are still synthetic; no historical embedding was invented as actual evidence. No saved artifact or approval was edited.

## Limits, resources and provenance

- One matrix child at a time; Node heap 256 MiB; parent-enforced RSS 512 MiB; timeout 120 seconds; at least 1 GiB free physical RAM before each child. Parent terminates only its own child on refusal. Three 100-reference large fixtures timed out; ceilings were not increased. No import was attempted and the old 6 GiB full-import prerequisite remains.
- Maximum parent-observed peak RSS across fixtures: **180.2 MiB**. Heap/external maxima are phase/periodic samples, not exact peaks. Parent Windows process counters capture lifetime peak RSS. The first matrix records wall time only; supplemental fixtures also record user/system CPU seconds. These are audit costs, not application performance bounds.
- Node v22.14.0, installed Firestore 7.11.6, google-gax 4.6.1; package lock pinned. A `net`/DNS/HTTP/fetch fuse in audit children refuses network before serialization; unit tests prove it. All database operations in handlers use the fake store. SDK batches are serialized with private `_ops` interfaces and are never committed; a changed interface refuses.
- Reports use offline project `demo-capacity-offline`, synthetic 20-character generated root IDs and numeric profile IDs, not production database names. A 32-byte dummy transaction token is an explicit estimate; actual token length/project names/index overhead/server enforcement remain unproven. Small full-encoding parity proves byte accounting for these supplied shapes, not server acceptance or index capacity.
- The raw `full_image_estimate_bytes` includes the same dummy token as actual-wire estimates. The current application's guard omits that field: subtract **34 bytes** to compare its literal guard shape. `summary.json` applies this correction. Registry omission matches the existing Create preflight; actual-wire accounting includes its transform. Neither guard code nor its behavior was changed.
- Installed write-batch/transaction sources contain no explicit 500-document check. This is not proof that a 9,000-write server transaction is accepted; 500 transforms on one document is a different limit. Firestore's [quota](https://firebase.google.com/docs/firestore/quotas) and [transaction](https://firebase.google.com/docs/firestore/manage-data/transactions) documentation were checked on 2026-11-18 (1 MiB document, 10 MiB request, 270-second transaction/60-second idle).
- Main application source is 175d6fa; parent plan is ba5c301. Initial executed audit code is archived at **6b08466** (Windows worktree-byte SHA-256 pins in each raw report). Supplemental code adds exact admitted receipt and two-aspect cases, CPU/environment reporting, and broader source/JSON-input pinning. The initial report pins core modules/ledger but not the library JSON independently; that file and application source were unchanged from the archived commit. Supplemental source pins cover library and all preparation/receipt JSON dependencies. Source pins are checked before/after each supervised child. Original raw matrix/smoke reports are preserved, not regenerated.
- Output contains aggregate measurements and synthetic labels, not profile snapshots or credentials. Provider calls, database RPCs and credential loader invocations: **zero**. Historical paid totals remain 30 text reviews / 14 embedding texts / 14 embedding POSTs / 44 HTTP attempts; cumulative reserved US$1.256788.

## Verification and next gate

Required Node/Python suites and focused codec/resource/network/refusal tests are recorded in the task Status/HANDOFF. No `docs/`, application runtime, arithmetic, model/library, rules or prototype consumer changed.

Next author decision: approve **offline Phase C design only**: source freshness, generation ownership/resume, crash/replay/duplicate handling, bounded staging/cleanup, single activation, generation-consistent readers/tally/Join and an explicit later rules/access review. No implementation, paid call, import, live write or deployment follows automatically. Sol Medium remains adequate; no model/settings change is needed.

Artifacts: [derived summary](summary.json), [initial matrix](run-20261118-01/report.json), [exact-receipt/two-aspect supplement](receipts-20261118-01/report.json), [preparatory smoke](smoke-20261118-01/report.json). Use a new output directory for every rerun. CLI: `python scripts/audit_capacity_phase_a.py --out specs/tasks/M3-capacity-audit/NEW-DIRECTORY`; `--receipts` runs the supplement only and `--smoke` the first two matrix cases. Run from the feature checkout; the supervisor supplies existing dependencies and refuses to overwrite an output directory.
