# U10 Similar active issues at Check

Status is PROPOSAL, 2026-11-13. The author requested similar active issues to be shown at Check, with a Join offer for nonmembers. The detailed policy below is proposed for review.

## Existing requirement and implementation gap

The [Request Guide](../../docs/ISR-Issue-Request-Guide.md), FAQs “Can I submit duplicate issues?” and “What if I'm not in the ad-hoc public?”, already calls for similar active issues to be shown and joining requests to be accepted automatically and logged. It also allows an insistent user to create a similar issue. Its later dismissal and Contribution consequences require their own implementation scope.

At verified main `b189d3f`, `functions/index.js` lines 704–1000 (`checkIssue`) derives parameters, ranks users and saves a draft. It returns no registered-issue matches. `functions/ai-helper.js` lines 141–156 searches the example library for analysis. The live repeat of the entrance-lock issue demonstrated the missing duplicate check. This task owns gap C-47. Joining remains C-09 in [relevance](../03-relevance.md).

## Proposed Check flow

1. Resolve the entered title, description, location and scope, then compare them with accessible registered active issues, including issues outside the user's current memberships.
2. Show likely matches with title, short description, location, lifecycle state and a brief reason for the match. Permit opening each issue for inspection. Rank multiple matches reproducibly.
3. An existing member sees “Open issue” and “You are already a member”. A nonmember sees “Open issue” and “Join issue”. Checking itself creates no membership.
4. Joining is explicit. After a successful Join, open the existing issue and update the user's dashboard. Repeated or concurrent Join requests produce one membership and one membership event.
5. If matches concern a different problem, place or time, permit “Continue with a separate issue” with a short explanation. Retain the explanation in the draft and creation provenance. This is the recommended interpretation of the Guide's allowance for another topic.
6. With no active match, continue to the normal new-public preview and Create flow.
7. Recheck immediately before Create. If another user registered a similar issue after Check, return the new match for review. Retrying a completed creation returns its existing result.
8. Changes to the text, point or scope invalidate the previous Check. Revalidate lifecycle and membership when Open/Join/Create executes.
9. A failed search must show a retryable failure. Incomplete search coverage must be communicated accurately.

## Proposed matching approach

Reuse Check's current issue embedding and compatible stored issue vectors. Combine normalized text, semantic similarity and explicit affected-place/object/time context. Record model, template, input/context versions and reasons for reproducibility.

The same building's lock described differently should match. Two broken locks in different buildings are separate issues. Matching category, semantic similarity or geographic proximity alone is insufficient. The same words in another city should preserve the geographic distinction.

Calibrate thresholds and shortlist size on versioned positive and negative cases before implementation acceptance. No numeric threshold is approved by this proposal. Record the definition of “active” using the actual lifecycle states.

Proposed cost control uses normalized-text/context lookup and reused vectors first. Prepare missing or incompatible vectors for the selected active demo issues in a bounded, budgeted pass. Avoid embedding the historical database on every Check. Record additional requests, texts, tokens, latency and historical coverage. Missing legacy vectors must not silently imply that no similar issue exists.

## Proposed joining policy

- Accept and log an explicit request automatically, as the Guide specifies. Verify identity using the project's accepted identity mechanism and read membership on the server. The existing synthetic profile workflow remains the prototype context.
- Recommend allowing explicit joins beyond the initial 100-member automatic formation cap. This needs author confirmation because it changes the effective cap for existing publics.
- Derive the new member's R, E, C and ISR through the canonical pipeline, using the existing issue registration-time rules. Recompute all existing members' scores affected by mean normalization. [Aggregation rules](../06-aggregation-and-voting.md)
- Keep member documents, participants, counts, topic score maps and dashboard caches consistent through retries, concurrent joins and partial failures. Repeated Join must not add duplicate members/events or unnecessarily renormalize scores.
- The Guide allows joining and voting, while freezing the voting context requires a policy for late participants and weights. Recommend first implementing discussion-phase joining, with voting-phase membership and voting rights decided before enabling that path. Show lifecycle state and Open for an issue already in voting.
- Closed, archived or completed issues may appear as related history with their state. They do not prevent a new occurrence from proceeding as a separate issue.

## Proposed documentation updates

This task temporarily owns duplicate flow requirements because components 07 Analyzer and 10 UI flows are still planned in the index. Link it from the index and the C-09 joining gap. Consolidate the accepted behavior into those components when they are written.

The implementation spec should define draft match evidence, user continuation reasons and idempotent joining events in [the data model](../02-data-model.md), using existing representations. [Relevance](../03-relevance.md) retains C-09 joining and C-08 initial-cap ownership. The aggregation component owns normalization and voting-freeze consequences.

Prioritize this flow after current rollout acceptance and before treating repeated issue registration as demonstration-ready. D1 should include a duplicate, a paraphrase, an already-member Open and a nonmember Join. Update its approved spec before changing its scenarios or seeding data.

## Future acceptance cases

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

Verify independently the joining member's scores, normalization changes for existing members, participant lists and both topic maps. Test partial failures and retries. Exercise Check → Open/Join and Check → continue → Create on the emulator before author live acceptance.

## Decisions for review

1. Allow explicit continuation after inspecting matches, with a short explanation. Recommended, consistent with the Request Guide.
2. Allow explicit Join beyond the initial 100-member automatic cap. Recommended, consistent with unfiltered joining.
3. Set the voting-phase joining/weight-freeze policy. Recommend discussion-phase joining as the first implementation milestone.
4. Approve calibration and bounded historical-vector preparation before selecting thresholds and an API budget.

## Status log

- 2026-11-13: Documentation proposal prepared from the author's live acceptance feedback and the existing Request Guide. Detailed choices await review. Code implementation is a subsequent task.
