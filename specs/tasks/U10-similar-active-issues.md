# U10 Similar active issues at Check

Status: APPROVED; implementation under verification, 2026-11-13. The author accepted explicit joins beyond the initial 100-member cap and instructed “apply the proposal”. Discussion-phase joining is the first milestone; voting-phase joining remains disabled pending its separate policy.

## Existing requirement and implementation gap

The [Request Guide](../../docs/ISR-Issue-Request-Guide.md), FAQs “Can I submit duplicate issues?” and “What if I'm not in the ad-hoc public?”, already calls for similar active issues to be shown and joining requests to be accepted automatically and logged. It also allows an insistent user to create a similar issue. Its later dismissal and Contribution consequences require their own implementation scope.

At verified main `b189d3f`, `functions/index.js` lines 704–1000 (`checkIssue`) derives parameters, ranks users and saves a draft. It returns no registered-issue matches. `functions/ai-helper.js` lines 141–156 searches the example library for analysis. The live repeat of the entrance-lock issue demonstrated the missing duplicate check. This task owns gap C-47. Joining remains C-09 in [relevance](../03-relevance.md).

## Approved Check flow

1. Resolve the entered title, description, location and scope, then compare them with accessible registered active issues, including issues outside the user's current memberships.
2. Show likely matches with title, short description, location, lifecycle state and a brief reason for the match. Permit opening each issue for inspection. Rank multiple matches reproducibly.
3. An existing member sees “Open issue” and “You are already a member”. A nonmember sees “Open issue” and “Join issue”. Checking itself creates no membership.
4. Joining is explicit. After a successful Join, open the existing issue and update the user's dashboard. Repeated or concurrent Join requests produce one membership and one membership event.
5. Show the new-public preview alongside matches. A separate issue requires an explanation and a title unique among all active issues, regardless of place or shortlist size. Use only Create; remove Continue. Compare titles with Unicode NFKC, lowercase and trimmed/collapsed whitespace; punctuation remains significant. Closed/expired titles may be reused. Recheck uniqueness atomically at Create, including concurrent requests. Retain the explanation and match evidence as provenance.
6. With no active match, continue to the normal new-public preview and Create flow.
7. Recheck immediately before Create. If another user registered a similar issue after Check, return the new match for review. Retrying a completed creation returns its existing result.
8. Changes to the text, point or scope invalidate the previous Check. Revalidate lifecycle and membership when Open/Join/Create executes.
9. A failed search must show a retryable failure. Incomplete search coverage must be communicated accurately.

## Approved matching approach

Reuse Check's current issue embedding and compatible stored issue vectors. Combine normalized text, semantic similarity and explicit affected-place/object/time context. Record model, template, input/context versions and reasons for reproducibility.

The same building's lock described differently should match. Two broken locks in different buildings are separate issues. Matching category, semantic similarity or geographic proximity alone is insufficient. The same words in another city should preserve the geographic distinction.

Calibrate thresholds and shortlist size on versioned positive and negative cases before implementation acceptance. The calibrated implementation constants and limits are recorded below. Record the definition of “active” using the actual lifecycle states.

Proposed cost control uses normalized-text/context lookup and reused vectors first. Prepare missing or incompatible vectors for the selected active demo issues in a bounded, budgeted pass. Avoid embedding the historical database on every Check. Record additional requests, texts, tokens, latency and historical coverage. Missing legacy vectors must not silently imply that no similar issue exists.

## Approved joining policy

- Accept and log an explicit request automatically, as the Guide specifies. Verify identity using the project's accepted identity mechanism and read membership on the server. The existing synthetic profile workflow remains the prototype context.
- Explicit joins may exceed the initial 100-member automatic formation cap (author accepted, 2026-11-13).
- Derive the new member's R, E, C and ISR through the canonical pipeline, using the existing issue registration-time rules. Recompute all existing members' scores affected by mean normalization. [Aggregation rules](../06-aggregation-and-voting.md)
- Keep member documents, participants, counts, topic score maps and dashboard caches consistent through retries, concurrent joins and partial failures. Repeated Join must not add duplicate members/events or unnecessarily renormalize scores.
- The Guide allows joining and voting, while freezing the voting context requires a policy for late participants and weights. Recommend first implementing discussion-phase joining, with voting-phase membership and voting rights decided before enabling that path. Show lifecycle state and Open for an issue already in voting.
- Closed, archived or completed issues may appear as related history with their state. They do not prevent a new occurrence from proceeding as a separate issue.

## Approved documentation updates

This task temporarily owns duplicate flow requirements because components 07 Analyzer and 10 UI flows are still planned in the index. Link it from the index and the C-09 joining gap. Consolidate the accepted behavior into those components when they are written.

The implementation spec should define draft match evidence, user continuation reasons and idempotent joining events in [the data model](../02-data-model.md), using existing representations. [Relevance](../03-relevance.md) retains C-09 joining and C-08 initial-cap ownership. The aggregation component owns normalization and voting-freeze consequences.

Prioritize this flow after current rollout acceptance and before treating repeated issue registration as demonstration-ready. D1 should include a duplicate, a paraphrase, an already-member Open and a nonmember Join. Update its approved spec before changing its scenarios or seeding data.

## Acceptance cases

| Case | Expected result |
|---|---|
| Repeat the open osbb 1, h5 entrance-lock issue | Show the registered issue before a new public is offered |
| Paraphrase the same problem | Offer the same existing issue |
| Different building, object, city or relevant time | Preserve a distinct issue and explain related matches |
| Existing member | Open and membership status |
| Nonmember outside automatic selection | Explicit Join accepted and logged under the approved lifecycle policy |
| Repeated or concurrent Join | One membership/event and consistent canonical scores/maps |
| Public already has 100 members | Apply the approved explicit-join cap decision |
| Issue created after Check | Create returns updated matches for review |
| Input or location changes | Require a fresh Check |
| Match changes lifecycle before Join | Revalidate and apply the current lifecycle policy |
| Closed or archived prior occurrence | Show history with its state and allow the new occurrence |
| User explains the distinction | Save the explanation with creation provenance |
| Search fails or legacy vectors are missing | Communicate failure/coverage accurately |

Verify independently the joining member's scores, normalization changes for existing members, participant lists and both topic maps. Test partial failures and retries. Exercise Check → Open/Join and Check → explain → Create on the emulator before author live acceptance.

## Decisions and boundaries

1. Allow explicit continuation after inspecting matches, with a short explanation. Recommended, consistent with the Request Guide.
2. Explicit Join beyond the automatic cap is accepted by the author.
3. Set the voting-phase joining/weight-freeze policy. Recommend discussion-phase joining as the first implementation milestone.
4. Approve calibration and bounded historical-vector preparation before selecting thresholds and an API budget.

## Implemented contract and verification limits

- Matching version `u10-v2`: top five results, normalized title/word overlap >= 0.5 or compatible-vector cosine >= 0.8018, always subject to affected-place/object/time guards. Building comparisons use 10 m; other comparisons use the smaller issue radius with a 50 m floor. Identifiable conflicting buildings, years and selected object terms override semantic similarity. This small English demo calibration is not a general duplicate classifier.
- `functions/test/u10-calibration.json` records eight synthetic texts, their vectors and labels. One `gemini-embedding-001` batch request embedded eight texts (97 estimated tokens); no text-generation request was added. Positive paraphrase minimum cosine was about 0.8598; unrelated same-building maximum was about 0.7438. Different objects/buildings had higher cosine and require the explicit context guards. Threshold 0.8018 lies between those positive and unrelated examples. This calibration is narrow; human acceptance remains required.
- Compatible issue vectors require current model, dimensions, task, template and exact text hash. Existing legacy records without compatible vectors use text/place lookup and are counted visibly as incomplete semantic coverage. No historical re-embedding or live data mutation is performed by this task. Each Check/Create reads projected issue, discussion and vector collections; the prototype-sized full scan needs a different search index before larger deployment.
- Active means the shared lifecycle returns discussion/chat or voting, with no expired deadline or closed/archived/completed/canceled state. Voting matches can be opened; joining is rejected on the server outside discussion. Historical issues do not block creation; a historical-results UI is deferred.
- Check writes draft match evidence but no membership. Create checks again inside a transaction serialized through a server-only registry record, and atomically writes the issue, public, members, discussion and replay result. Completed drafts are retained for idempotent retries, superseding A2's deletion behavior. A new/unreviewed match returns HTTP 409.
- Join uses the prototype's existing adopted synthetic uid identity. It is not a new authentication boundary. A transaction creates one member and event, recomputes canonical mean-normalized ISR for all members, and updates both topic maps, participants, member count and values taxonomy. No application cap of 100 is applied to explicit joins; Firestore document/transaction limits still apply. Emulator verification reaches 102 members, not arbitrary public sizes.
- Automated real-handler tests cover repeat Check, completed-Create replay, separate-issue explanation, stale-match rejection, concurrent/idempotent Join, 102-member score/map consistency, voting rejection, simultaneous Create and injected transaction rollback. Gemini calls are mocked in these transaction tests. They do not replace human checks of match usefulness or UI layout.
- Author browser acceptance passed for repeated-issue Check and nonmember Join to 101 on the isolated mocked-AI preview. Already-member status, separate creation and input invalidation remain to check in the browser. Agent browser automation is unavailable (0x8007000F). No deploy, production write or rules change has been performed.

## Status log

- 2026-11-13: Documentation proposal prepared from the author's live acceptance feedback and the existing Request Guide. Historical proposal checkpoint; subsequently approved by the author as recorded below.

- 2026-11-13: Author approved the proposal and >100 explicit joins. Implemented Check/Open/Join/separate creation, atomic recheck/replay and documentation schemas on `codex/similar-active-issues`. Node 104 passed with one optional integration skip; Python 111 run with two existing skips. Real-handler emulator transaction verification and UI acceptance are recorded separately; browser runtime currently unavailable. No deployment or live writes.

- 2026-11-13 final emulator result: real Check/Create/Join HTTP test passed in 27.9 seconds, including two racing drafts (one creation, one 409), injected transaction failure with zero new issue records and successful retry, idempotent concurrent Join and 102-member canonical ISR/maps. Full Node suite: 104 passed, one optional integration skip; Python: 111 run, two existing skips. Browser acceptance remains blocked by the local computer-use launcher, not claimed complete. Test harness uses mocked AI; extra paid usage remains the one eight-text calibration request only.

- 2026-11-13: Author manually verified the isolated demo-u10 preview as Synthetic 95: Check showed the existing entrance-lock issue with Open/Join, and Join opened it with 101 members. Author reported “all is ok - exactly as you have described”. This confirms the repeated-issue/nonmember-join UI path with mocked AI; already-member status, explained separate creation and input invalidation still need their browser checks. No live deployment or writes.

- 2026-11-13 revision: Author confirmed the remaining original UI checks, then approved unique titles among active issues only and removal of Continue. Creation dates and other metadata distinguish closed occurrences. Node 105 passed with one optional integration skip; Python 111 run/two existing skips; revised real-handler emulator scenario passed in 18.5 seconds. Cases cover normalized title collisions beyond the shortlist and across locations, no explanation override, closed/expired title reuse, racing Create, rollback/replay and 102-member joins. No new API requests; revised UI acceptance pending.
