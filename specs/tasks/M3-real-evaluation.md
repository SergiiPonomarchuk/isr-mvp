# M3 real-model and population evaluation

Status: preparation authorized by the author's "what now?" after PR41 merged as `7ee49eafdfb49808cee08968ce06d89c26744a4e`. Offline preparation is in scope. The author approved the bounded paid pilot and existing-loader reuse on 2026-11-17, confirming Paid status and budget. The 14-review/45-text/US$0.50 scope is authorized; profile restoration remains separately gated by memory and this approval does not authorize deployment or production access. This proposal does not authorize deployment, production writes, rules changes, accepted-snapshot changes, reference-library regeneration or profile re-embedding.

## Plan

1. Free preparation: verify exact saved input/vector bindings; calculate raw chains and actual context-prompt sizes; count profile/vector keys in the frozen accepted export without decoding profile properties; check local memory and serialized structural capacity. Write aggregate-only evidence. Do not start another large emulator import merely to test memory.
2. After explicit author approval, implement and verify a durable attempt ledger, exact cache matching and a single-attempt provider adapter against test doubles. Reuse the existing main-checkout credential loader privately, as in the prior approved M3 calibration; no agent reads/prints/copies the key or puts it in this worktree. Approval must explicitly include this loader reuse for the new evaluation. Do not run a paid request until the adapter and ledger tests pass and the author confirms the key's AI Studio project still shows Paid with sufficient budget.
3. Run the small real-model review pilot below, preserving literal input/output/model/config/prompt/source hashes and reported usage. Reuse only exact saved whole-issue vectors. Embed only genuinely new selection/aspect texts. Provider/schema failure stops the run, not automatic repair/retry. Review intermediate results before spending follow-up slots.
4. Use only valid reviewed models and actual aspect vectors for full-population scoring. Restore a field-allowlisted copy into disposable `demo-mr1-eval` on loopback8190, using an explicit memory gate; never import/export over accepted snapshots or the presentation journal. Run real Engine/Check/Create/Join paths with exact cached provider results, so population retries require no more AI calls. Preserve existing old-version scores in the source; audit new results independently with Python.
5. Report schema/context findings, profile coverage, member-count/score changes, elapsed time, peak process memory, serialized sizes and atomic-publication results. Stop for author judgment on AI interpretation or for a scoped implementation fix on performance/capacity failure. Passing toy fixtures or a clean capacity refusal is not sufficient deployment acceptance.

## Paid pilot inputs and allowance proposed for approval

Keep the application models/configuration unchanged: `gemini-3.1-flash-lite`, `gemini-embedding-001`, 768 dimensions, temperature0, existing seed, `mr1-context-review-1` and task/template bindings. No grounding, search, Maps, tools, content generation, profile embedding or reference embedding.

| Cases | Source | Purpose |
|---|---|---|
| Ten visible D1 cases, including `D1-01-live` rather than hidden standby | committed manifest + exact saved vectors in `M3-calibration/inputs.json` | Normal issue coverage, including the known long zoning chain |
| `vague-help` | committed `proposed-inputs.json` + `evaluation-vectors.json` | Missing facts must prompt useful questions, not guessed publication |
| `compound-lock-software` | same saved diagnostic experiment | Unrelated decisions must not be silently blended into one public |
| At most two conditional clarification follow-ups | exact title/body retained; clarification strings pinned in the evaluation case file | Check whether added facts resolve the missing context without changing numeric parameters by hand |

Maximum **14 text-review attempts**, **45 new embedding texts**, and **17 embedding POST attempts** (up to one aspect batch per case plus three new clarification-selection texts). Text-review output limit stays8192 tokens per attempt. Cache hits consume no provider allowance. The 12 initial whole-issue vectors already exist and must pass exact SHA/model/task/template validation; a cache miss stops rather than silently embedding extra text. The saved D1-02 input already contains clarification, so it needs one new selection text; each follow-up may add one more. All three are included in the45-text limit. Follow-ups reuse their original whole-issue vector. Up to three distinct actual-aspect texts per case are allowed. Conditional follow-ups are skipped when their predecessor fails or does not need them; unused allowance is not permission to invent cases.

The installed Gen AI SDK defaults to as many as five HTTP attempts when not configured. The evaluation adapter must set `httpOptions.retryOptions.attempts=1`, enforce a global transport counter, reserve each attempt before sending, and persist ambiguous failures as spent. No semantic retries, automatic restart/repeat, or allowance resets on rerun. Report attempted and successful requests/texts separately. If actual transport behavior cannot be verified against the mocked adapter, execution remains blocked.

### Cost envelope

Proposed approval ceiling: **US$0.50 for this evaluation's AI use**, separate from the project's prior D1/A4 allowances. This is not a Google billing control or a guaranteed account-wide spend cap. A local conservative reservation ledger must refuse a request that would exceed the envelope and retain reservations for failed/ambiguous attempts.

Google's standard paid rates checked on2026-11-16: Flash-Lite text input$0.25/million tokens, output including thinking$1.50/million; embedding-001 input$0.15/million. Source: [official pricing](https://aistudio.google.com/docs/pricing#gemini-3.1-flash-lite) and [embedding pricing](https://aistudio.google.com/docs/pricing#gemini-embedding). Recheck before executing if prices/model names differ.

For the reservation envelope, cap each serialized text-review input at32,768 UTF-8 bytes plus1,024 tokens of allowance for framing; reserve8192 output tokens. Cap each embedding text at8192 UTF-8 bytes plus32 tokens of framing. Using byte counts as a conservative token estimate, the full14/45 ceiling reserves approximately$0.346 at the stated rates;$0.50 leaves additional margin. These are estimates, not a measured bill or tokenization guarantee. Record actual provider token usage; if missing, retain the larger reservation. No paid token-count or pricing-discovery call is implicitly authorized. Do not retry under a larger model or spend more without a new author decision.

## Offline preparation and full-population limits

Source snapshot: `A:/BackUp/isr-mvp/emulator-snapshots/2026-11-14-d1-author-accepted-7259ca3`. It is immutable. Preparation may count keys only in its RecordIO/protobuf export, using the existing allowlist approach; do not inspect/print credential-like fields or dump raw record strings. Structural decoding does not establish full export-CRC verification or restore fidelity.

Later restoration must select only the canonical numeric participants and scoring fields (`uid`, synthetic `displayName`, `birthDate`, `skills`, `geography`, `socialRelations`, `features`, `post`, `values_taxonomy`) plus necessary `user_vectors` metadata/vectors. Do not copy emails, passwords, tokens or unrelated private fields. Profiles are streamed only into the disposable emulator; aggregate reports contain no profile dumps. Existing birth dates are needed to recompute the age floor, not written to reports. No live database reads are required by this plan.

The expected population is9,150; the actual counted/validated count wins. Report unmatched/missing keys and incomplete metadata; never drop people silently. A key census is not proof all profile skill vectors are valid. Before import require at least6GiB available physical memory for an initial4GiB Java heap,512MiB scoring process and operating-system headroom. If unavailable, stop and propose a bounded streaming alternative or ask for an appropriate execution window. Do not stop the author's apps or alter memory/security settings automatically.

An offline capacity fixture may clone the shape of a committed synthetic member/model for9,150 IDs and serialize with the actual SDK. It is a structural capacity test, not actual-population affectedness/scoring and not a benchmark of database writes. Its failure can reveal a limit requiring a scoped storage/publication design before deployment. It does not justify reintroducing top100, changing Theta, silently pruning A/B, removing provenance or publishing only part of a public.

## Acceptance criteria

- Exact cache and source bindings match; no evidence/aspect text outside the actual input. All retained/excluded references are justified from actual context and provenance is complete. No forced split based solely on raw-chain count, no invented demographic facts, no hidden keyword fallback or arbitrary truncation/blend of the raw chain.
- Clear cases receive a defensible review; necessary clarification identifies missing facts. Vague/mixed cases cannot pass using guessed facts or unrelated aspects. The authored D1/diagnostic inputs are a small convenience sample, not a blind accuracy benchmark. Author reviews the resulting inclusion/exclusion decisions before deployment.
- Every numeric participant is evaluated or an explicit incomplete-data error stops publication. Store/report A/B/explicit cohorts, exact source-ceiling decisions, no second hop and no creator privilege. Preserve the paired D/S/E calculation and one age floor from PD-9; do not tune the approved math/thresholds to make the pilot pass.
- On the disposable copy, valid smaller publics publish and replay atomically with zero extra provider calls; independent Python audit has no numeric/membership/cache differences beyond the declared rounding tolerance. Legacy histories stay unchanged. Oversized publication fails before writes, and the report records the actual operational limitation.
- Measure against the merged app's512MiB memory/300-second Check/Create configuration. A run that only succeeds under higher runtime limits is not evidence the deployed configuration is ready. If ordinary intended cases exceed limits or cannot publish atomically, resolve that under a new scoped implementation plan before deployment.
- Final reports distinguish author judgment, model output, independent arithmetic, whole-population observations and synthetic capacity fixtures. All actual requests/texts/tokens and estimated charges are recorded. No deployment is included.

## Attention gate

After offline preparation, ask the author to approve the exact14-review/45-text/US$0.50 allowance and reuse of the existing main-checkout loader, and confirm Paid status/budget. Only then build/run the bounded paid harness. Full-population import has a separate local-memory prerequisite. Human semantic review and author-only deployment remain later gates.

## Status log

- 2026-11-16: proposal prepared after PR41 merged and its main CI passed. No provider call, key access, live read/write, snapshot modification or deployment performed. Offline census/cache/prompt/capacity checks follow this written plan.

## Free-preparation findings, 2026-11-17 Europe/Kyiv (2026-11-16 UTC)

- [Pinned case plan](M3-evaluation/cases.json):12 initial cases and two conditional clarification follow-ups. Every whole-issue vector matches exact text/model/dimensions/task/template;14 bindings checked without new requests. D1-02 has a historical clarification, correctly reserved as a third new selection text rather than silently reusing its whole-issue vector for a different text. [Prompt/capacity evidence](M3-evaluation/preflight.json).
- [Key-only export census](M3-evaluation/export-census.json):24,518 entity records across five immutable source shards (551,960,436 bytes).9,150 numeric profile keys and9,150 numeric vector keys; zero missing, orphan or duplicate numeric keys. No profile properties decoded, no key/secret access, no database/provider calls. This verifies key coverage, not property completeness, vector fidelity or shard CRC.
- Actual Engine population packing and SDK serialization on repeated synthetic shapes:9,150 A, zero B, five frozen outgoing ties per person. Member/cache subset only:one retained reference10,110,330 bytes;three retained references11,610,146 bytes. The latter is rejected by the current preflight before writes. Remaining publication/draft/registry records are excluded, so the smaller subset is not proof full publication fits. Timings are structural-fixture timings, not actual-profile performance.
- The full-population import was not started: available memory was2.37GiB on the15.78GiB host, below the proposed6GiB prerequisite. The author need not close anything for this proposal; choose a suitable execution window or a streaming alternative before import.
- **Deployment remains blocked by unresolved large-public publication capacity.** The paid review pilot can still determine actual reviewed sets/aspects cheaply, without restoring the population. Use those outputs to assess the actual storage need. Before changing publication/storage/Join behavior, prepare a separate scoped design; do not remove provenance or reintroduce a member cap merely to fit a single request. The original “all documents in one transaction” contract cannot cover arbitrary uncapped sizes. No storage redesign is implemented by this proposal.
- Next attention gate is approval of the bounded paid review pilot and private loader reuse, with current Paid status/budget confirmation. This does not authorize an emulator import under insufficient memory, deployment, production access or an unreviewed storage redesign.

## Reproduce free preparation

From Windows PowerShell in the evaluation worktree:

```powershell
Set-Location 'A:\BackUp\isr-mvp\worktrees\wt-m3-evaluation'
$env:NODE_PATH = 'C:\isr-mvp\functions\node_modules'
node --max-old-space-size=512 functions/test/mr1-preflight.js
python scripts/mr1_export_census.py --snapshot 'A:\BackUp\isr-mvp\emulator-snapshots\2026-11-14-d1-author-accepted-7259ca3' --report specs/tasks/M3-evaluation/export-census.json
```

These commands replace only aggregate evidence files in the feature worktree. They make no provider or database requests and do not modify the snapshot. No paid-run command is given because the bounded provider adapter/ledger must be implemented and verified after the author approves the scope; that preparation must precede the first paid call.

- Free-preparation verification: Node153 passed/five optional skips; Python140 run/two skips, including four synthetic key-census safety cases. Exact-cache and structural-capacity reproducer passed with no provider/database requests. Runtime application code/models, accepted snapshot and live data are unchanged.

- 2026-11-17 author approval: "Approve the M3 pilot up to $0.50, using the existing credential loader; Paid status and budget confirmed". Implementing/testing a durable single-attempt guard before the first paid request. No calls made yet.
