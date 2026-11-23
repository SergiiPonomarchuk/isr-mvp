# Read-only DB completeness audit: results and restoration proposal

Date2026-11-23; base main45124f2. [Approved task/boundaries](DB-completeness-audit.md). Aggregate machine evidence: DB-completeness-audit-summary.json. Per-ID receipts/hashes remain private under A:/BackUp/isr-mvp/rollouts/db-audit-20261123; no raw profile text, Values, coordinates or embeddings were saved. Reports contain fixed field/reason codes, IDs/hashes, counts and timestamps only. User explicitly approved the extra collection paths beyond the older Firestore skill list.

## What was checked

25,667 current documents across12 approved roots and discussion message subcollections. Deterministic paginated projections, structure/reference checks, current embedding-template hashes and finite768-component vectors; compare document IDs and allowlisted historical fields with the completed2026-11-14 D1 archive. The separate message-author check read205 parents/1,737 messages and found no absent/invalid/missing-target authors. Four retained user archives were checked for all16 deferred Values profiles. Sources were read in memory; no provider calls, database writes, deployment, rules or docs/ edits.

| Path | Current documents | Added since D1 backup | Missing from D1 backup set |
|---|---:|---:|---:|
| users | 9,151 | 0 | 0 |
| user_vectors | 9,150 | 0 | 0 |
| issues | 93 | 11 | 0 |
| discussions | 205 | 11 | 0 |
| microcommunities | 205 | 11 | 0 |
| microcommunity_members | 3,901 | 606 | 0 |
| actions | 1,188 | 0 | 0 |
| issue_drafts | 19 | 15 | 0 |
| analyzer_logs | 18 | 14 | 0 |
| voting / tasks / values roots | 0 each | 0 | 0 |
| discussions/*/messages | 1,737 | 41 | 0 |

No missing documents and no previously nonempty projected top-level fields now empty in the scoped comparison. This does not certify every nested/optional field. All9,150 embedding documents passed finite/dimension/model/template/task/source-hash and expected-skill coverage checks; their projected payloads match the D1 backup exactly. Empty voting/tasks/values roots are historical storage conventions, not evidence of lost concepts. One nonnumeric incomplete profile is the known nonparticipant observation, not a synthetic participant to invent.

The224 metadata patches are already_correct. They are the only changed projected user documents versus D1, with no emptied fields. Historical issues82/discussions194 changed only status, consistent with later lifecycle operations; do not restore those statuses. No dangling scored-member/user/public/topic links, duplicate public-user pairs or declared public member-count mismatches were reported in the selected fields. These checks are structural; no frozen vote weights, model evidence, option/task content or political/semantic correctness was recomputed.

## Findings and interpretation

1. **Recoverable optional metadata:224 profiles.** The minimal patch deliberately omitted meta.timestamp, meta.vector_id and meta.overall_confidence. Every verified source binding in the frozen224 plan contains one unambiguous, validly shaped value for each of these fields. All224 timestamps are timezone-aware, IDs are nonempty strings and confidence values are finite0..100. This establishes available recovery evidence, not permission to apply it or a new authorship guarantee. Preserve them as retained historical values; do not invent a timestamp or recompute confidence.
2. **Deferred Values grounding:16 profiles remain unresolved.** Same6 invalid grounding,5 missing hashes,2 narrative-hash mismatches,2 retained-layout failures and1 stored-layout failure. All four archives contain those users and matching narratives, but none of the64 profile/archive combinations has Values metadata. Fifteen flattened payloads can be matched; the malformed case cannot be validated. Thus these archives provide zero verified exact grounding-restore candidates. Retained raw artifacts still fail the original provenance/layout gates. Never replace source hashes merely to make a candidate pass.
3. **Legacy message counters:184 discussions.** The same184 IDs already disagree with stored message-document counts in the D1 backup; no new mismatch IDs. Historical declared count minus stored count is-1 for181 discussions,-2 for2 and-3 for1. Current Create counts msg_init and Send increments the counter (functions/mr1-service.js; prototype/js/main.js). This suggests a historical counter convention/staleness issue, not proof of missing messages. Decide how initial messages count and how unread state should behave before any counter migration. Do not restore or fabricate message bodies.
4. **Unfinished coverage, not established loss.** There are8,911 users without Values vectors, including1,220 with a narrative. These are coverage observations; current evidence does not establish that all were ever vectorized. X preparation is not implemented/populated:9,150 participant profiles lack x-links-1 coverage and53,412 links lack strict Boolean eligibility flags. Do not mass-populate true/false from age, disease or kinship. Keep this on the separately reviewed X data/version work.

## Proposed restoration order (implementation needs approval)

**R1: recover the three optional metadata fields for224 verified profiles.** Next recommended small step: separate feature spec and dry-run plan, bind each value to verified source file/entry digest and current profile update time; patch only those three absent fields. Preserve the already-verified five metadata fields, Values/null encodings and all other data. Refuse pre-existing conflicting optional values. Rehearse apply/retry/rollback on synthetic emulator data. Author performs any live apply after review. No AI calls needed.

**R2: resolve the16 through evidence or reviewed regeneration.** Check any additional original vectorizer outputs if the author can identify them; the four known user archives do not contain grounding metadata. If no authoritative source remains, prepare a bounded offline candidate regeneration proposal from the current narratives, with request/token/budget estimate and explicit approval. New grounding comes with a new generation/provenance record; compare the new Values to existing Values and seek approval for any replacement. Do not attach newly invented grounding to an unverified historical vector or silently repair malformed vectors/hashes. There is no paid/model authorization in this audit.

**R3: decide legacy message-count semantics, then plan a separate derived-counter migration if wanted.** Recheck exact current messages, test initial-message and unread behavior, use timestamp/CAS/recovery guards. This is not historical content restoration and is not part of R1.

**R4: separate coverage decisions.** Values expansion and X eligibility preparation require their own source/policy/cost plans. Do not treat never-generated coverage or unimplemented schema as backup restoration.

## Limits and validation

This is a scoped, non-atomic read audit. issue_vectors, user_packs, geocode_cache, config, membership_events, unknown roots and other subcollections were not read; only manifest names/counts for unapproved backup paths were observed. Messages beneath nonexistent parent documents are not discovered. Identity/contact fields, full option/task contents, frozen score parity and semantic truth are outside the projections. Historical top-level field digests detect selected changes, not every possible nested-schema defect. Do not call this a complete database certification.

Core live scan implementation36b2276; deferred archive checker163f99f; message-author follow-up7e6a29e. After the core scan, the message projection/check was expanded to include the actual uid field; the supplementary message-author receipt covers all current parents/messages without repeating the large embedding scan. Final CLI includes that check directly. Local required suites: Node253 pass/six skips (259 total), Python200 tests/three optional skips;20 new focused pure/fake tests pass. Final PR CI is verified before handoff. Agent production writes/provider calls remain zero. No restoration executed by this audit.
