# SPEC A4: Working AI (roadmap stage 1)

Status: APPROVED 2026-11-10 (the spec and the recommendations of section 4). Phases A-C implemented on branch `a4-working-ai`; AC1-AC4 passed (AC2-AC3 with the free-tier key). Phase B is partial (288 of 9,150 people): the free tier allows only 1,000 embedded texts a day, so finishing it waits for the author's decision (billing, scope or about a month).
Branch: a4-working-ai (from main at `0448705`; never main)
Roadmap: stage 1 ([ROADMAP-demo.md](../ROADMAP-demo.md)). "Check" uses a real model; S and the expertise cosines become meaningful; every Analyzer call is logged. Effort estimate: 4-6 developer-days (roadmap), in four phases (section 6).
Replaces: the A1b expertise placeholder (`expertise_source: "no_issue_vector"`) for the 3 publics that have it.

## 1. Context (verified 2026-11-09 at `0448705`; prices and models read from Google's pages on 2026-11-09)

### As built

| Fact | Evidence |
|---|---|
| **Both AI models in the code are shut down.** `vectorizeText` uses `text-embedding-004`, and the Analyzer uses `gemini-1.5-flash`, through the old SDK `@google/generative-ai` ^0.21.0. Neither model is on Google's current model list. | `functions/ai-helper.js:1, 23, 924, 955`; `functions/package.json`; models page |
| **Every failure is silent.** Without a key, or on any error, the Analyzer falls back to keyword rules (`getLocalFallbackParams`) and the issue vector becomes a **random unit vector**. With a random vector, S and E are noise. | `ai-helper.js:18-41, 551-916, 918-971`; IF l.115 |
| Whether `GEMINI_API_KEY` is set in the deployed functions is unknown. The key is read from `process.env`. | IF l.119 (UNSURE); `ai-helper.js:4` |
| **The issue vector comes from the description only** (`vectorizeText(description)`), in `checkIssue` and in `createIssue`. It is not stored. | `functions/index.js:80, 655`; EMBEDDINGS #12 |
| **Uses of the issue vector:** S = max(0, cos(issue vector, `user_vectors.profile_vector`)) for the 300 pre-filtered candidates; E = cosines of the member's skill vectors (`user_vectors.experience_vectors`) with the issue vector. | `index.js:195-225, 285-306` |
| **Stored person vectors:** 9,150 `profile_vector` and 20,245 `experience_vectors` entries (one per skill: 11,057 work experience, 5,835 education, 3,353 activity). All are 768-d unit vectors, made on or before 2026-01-31, probably with `text-embedding-004`. Their generator script and input template are not in the repo. | EMBEDDINGS #1, #4, #6, #7, #9 |
| The stored profile vectors are anisotropic: the median cosine between two random people is 0.91, so S sits in a narrow high band. | EMBEDDINGS #11 |
| **The Analyzer** has no temperature or seed. It names the 100 examples but never sends them. Prompts, outputs and model versions are not stored; failures only reach `console.error`. Since A2, the submitter cannot type numbers; "Derive again" sends a clarification text. | IF l.112-118; A2 |
| The 100 examples file is 339 KB (about 85,000 tokens): too large to send with every call. | `docs/ISR-Issue-Analyzer-100-Examples.md` |
| **Profile fields available for a text** (sample: `claude_export/profiles_000.jsonl`, 1,579 of 9,151 profiles): | export |
| - `post`: `job`, `department`, `place`, `educationLevel`, `salary`; | |
| - education skills: `name` (the institution), `educationLevel`, `specialization`, `graduationYear`; | |
| - work-experience skills: only a free-text `comment` (`name` and `specialization` are empty in all 3,337), and `time`; | |
| - activity skills: `name`, `time`; | |
| - also `values_description` (median 4,415 characters), demographics, geography, social relations, offences, marks. | |
| Many work-experience comments describe someone else, for example "An older sibling who works as a graphic designer…" (a synthetic-data quirk). | export |
| Existing publics keep their stored R, E and ISR, computed with the old vectors (A1: "Members of existing publics keep their stored values"). The 2026-10-12 export is the frozen as-built record for the paper. | A1 section 3; roadmap section 4 |
| Firestore rules allow client access to every collection except `issue_drafts` (server-only) until 2027-06-30. | `firestore.rules:5-9` |

### Models and prices (Gemini API, read 2026-11-09)

| Model | Use | Paid price per 1M tokens | Free tier | Notes |
|---|---|---|---|---|
| `gemini-3.1-flash-lite` | text | $0.25 in / $1.50 out | yes | stable |
| `gemini-3.5-flash-lite` | text | $0.30 in / $2.50 out | yes | stable, newer |
| `gemini-2.5-flash-lite` | text | $0.10 in / $0.40 out | yes | access limited to existing users |
| `gemini-2.5-flash` | text | | | deprecated; routed to `gemini-3.5-flash-lite` on 2026-12-01 |
| `gemini-embedding-001` | embeddings, text | $0.15 | yes | 128-3072 dimensions (768 recommended); input up to 2,048 tokens |
| `gemini-embedding-2` | embeddings, multimodal | $0.20 | yes | input up to 8,192 tokens |

On the free tier, the content sent is used to improve Google's products. The paid tier does not use it for that.

## 2. Requirements

### Phase A: models, Analyzer, issue vector, logs

- R1 **SDK.** Replace `@google/generative-ai` with the current Google Gen AI SDK (`@google/genai`). Python scripts use `google-genai`.
- R2 **One configuration module, `functions/ai-config.js`.** It holds:
  - the text model `gemini-3.1-flash-lite`;
  - the embedding model `gemini-embedding-001`, 768 dimensions, with vectors normalised to unit length before storing;
  - temperature 0 and a fixed seed, where the API supports one;
  - the prompt version and the embedding template version (`t1`);
  - the task types (decision 4.3).

  A model change is a one-line change. Every stored result names the model and versions it came from.
- R3 **The key** is a Firebase secret `GEMINI_API_KEY` (`defineSecret`). The author sets it with a free-tier key from AI Studio. It is never printed, logged or committed. Locally, the emulator reads it from `functions/.secret.local`, which is gitignored and written by the author.
- R4 **Analyzer call:**
  - temperature 0 and JSON output;
  - the k nearest of the 100 examples go into the prompt (decision 4.4). They are found by cosine between the issue vector and the examples' vectors. The examples are parsed and embedded once by a script into `functions/data/analyzer_examples.json` (text, parameters, vector, model, template version), which is committed.
- R5 **No silent fallback:**
  - **Analyzer fails:** the keyword parameters may still be used, but the result carries `ai_source: "fallback"`, and the Check window says "AI unavailable: parameters from keyword rules".
  - **Embedding fails:** no random vector. What happens instead is decision 4.1.
- R6 **Issue vector:**
  - Embedded from `{title}. {description}` (template `t1`, task type per 4.3), in `checkIssue`, and again in `createIssue` only if the text changed.
  - Stored in a new collection `issue_vectors/{issueId}`: `vector`, `model`, `dims`, `task_type`, `template_version`, `text_sha256`, `created_at`.
  - It is a separate collection so that the Voting list, which reads issue documents, does not download 768 numbers per issue.
- R7 **Analyzer log:** a new collection `analyzer_logs`, one document per Analyzer call. Fields:
  - `at`, `endpoint` (`checkIssue` / `analyzeIssue`), `draft_id`, `submitter_uid`;
  - `model`, `prompt_version`, `temperature`, `examples_used` (ids);
  - `input` (title, description, clarification), `raw_output`, `normalized_output`, `shown_parameters`;
  - `ai_source`, `error`, and the token counts if the API returns them.

  No names or other profile fields are stored. The collection is server-only: a rules change (decision 4.5).

### Phase B: re-embedding the people

- R8 **`scripts/embed_people.py`** (dry run by default; emulator unless `--project … --i-know-this-is-live`; the live `--apply` is the author's step). It builds the texts with template `t1` (section 3, decision 2) and embeds them in batches. It retries on rate limits, can resume, and has a `--limit` for trial runs. It writes:
  - `user_vectors.profile_vector`;
  - `user_vectors.experience_vectors[<skill id>]`;
  - `embedding_model`, `embedding_dims`, `embedding_template`, `embedded_at`.

  The report gives the counts, the token totals, the texts that were cut or skipped, and the spread of the new vectors (the median cosine between random pairs, against 0.91 today). The old vectors stay in the export (EMBEDDINGS #5), so nothing is lost.
- R9 The templates live in one Python module (`scripts/embedding_templates.py`) and are described in this spec. The issue template is in `functions/ai-config.js`. A fixture test pins the texts for sample profiles.

### Phase C: replacing the placeholder

- R10 For the 3 A1b publics:
  - embed their issue text (R6);
  - compute E for every member with the new skill vectors and the A1 formula (`functions/isr.js` / `scripts/isr_core.py`, as `createIssue` does);
  - recompute the ISR;
  - set `expertise_source: "issue_vector"`;
  - rewrite the topic maps.

  The script is `scripts/migrate_a4.py`, with the usual dry run and live flags.
- R11 Other existing publics keep their stored values (A1). New issues use the new model and vectors from the deploy on.

### Phase D: live

- R12 The author's steps: set the secret; deploy functions, hosting and rules; run R8 and then R10 with `--apply`. The agent then runs read-only checks (AC8).

### Tests

- R13 Unit tests (Node and Python):
  - the configuration;
  - the templates on a fixture;
  - the k-nearest example selection;
  - the log entry built from a mocked model response;
  - the fallback labels;
  - the refusal or fallback for a failed embedding (4.1);
  - the vector normalisation.

  CI does not call the API. The emulator runs (AC2-AC6) use the author's free-tier key.

## 3. Decisions (approved by the author, 2026-11-09)

1. **Models:** `gemini-3.1-flash-lite` for the Analyzer and `gemini-embedding-001` at 768 dimensions. The cheapest current stable models, both with a free tier. A free-tier key is used for development. Before real people use the site, switch to a paid key: the free tier sends content to improve Google's products.
2. **Embedding texts, template `t1`.** They describe only what the person does and knows. D, G and X are separate parts of R, and values have their own subsystem, so they are left out to avoid counting them twice.
   - **Profile vector (for S):**

     ```
     Occupation: {post.job}, {post.department}.
     Education: {educationLevel} in {specialization}; ...
     Experience: {role} ({field}): {description}; ...
     Activities: {name}, ...
     ```

     Empty parts are dropped. Not included: age, gender, nationality, places, relations, values, salary, offences, marks, institution names.
   - **Skill vectors (for E), one text each:**
     - education: `{educationLevel} in {specialization}`;
     - work experience: `{role} ({field}): {description}`, with P1's fields (`name`, `specialization`, `comment`; amended 2026-11-10, see the status log). An entry without role and field gives only its comment;
     - activity: `{name}`.
   - **Issue vector:** `{title}. {description}`.
3. **Analyzer logs store the full issue text.** Server-only collection, model and prompt version on every entry, no names (submitter id only). Before a pilot with real people: a retention period, consent, and a paid key.

## 4. Open points (author)

1. **When the embedding call fails:**
   - **a (recommended): Check refuses** with "AI unavailable, please try again", and no public is formed. Without a vector, S and E would be meaningless.
   - b: proceed with S = 0 for everyone and the A1b placeholder E, labelled.
2. **Profile review before re-embedding:**
   - **a (recommended): run phase B after a profile review task (P1).** P1 starts with a read-only audit and a proposal, and Phases A and C can go ahead meanwhile. The texts we embed depend on that content.
   - b: embed the current texts now, and re-embed after P1 (cheap, about $0.45).
3. **Task types:**
   - **a (recommended):** `RETRIEVAL_QUERY` for the issue and `RETRIEVAL_DOCUMENT` for people and skills. Finding the people relevant to an issue is a search.
   - b: `SEMANTIC_SIMILARITY` for both.

   Phase B reports the spread of S under both on a sample, and the choice can be revisited then.
4. **k nearest examples:** 5 (recommended).
5. **Rules change:** `analyzer_logs` becomes server-only like `issue_drafts`; `issue_vectors` stays readable like the other collections (vectors are not personal). The author deploys the rules.

## 5. Non-goals

- Analyzer guardrails: the issue-type table, the range check, `needs_clarification` (stage 4).
- Cleaning or changing profile content (P1), rebuilding the demo data (stage 3).
- Recomputing the stored values of the seeded publics (A1, section 3).
- D, G, X, Contribution, the client-side keyword fallback (`main.js`), and `relevance_evaluator.py`, which reads a field that no longer exists (EMBEDDINGS, usage notes).
- Moving the HTTPS functions to europe-central2.

## 6. Acceptance criteria

- AC1 Unit tests and CI green (R13).
- AC2 Emulator, with the author's free-tier key: Check on 5 issues taken from the 100 examples returns `ai_source: "model"`. Each call leaves one `analyzer_logs` entry with the 5 examples used; repeating a Check gives the same parameters (any variation is reported).
- AC3 Emulator: `issue_vectors/{id}` is written once per issue text and names the model and template; the same text gives the same vector.
- AC4 Emulator, without a key: the Check window shows the fallback label or the refusal (decision 4.1); no random vector is used anywhere.
- AC5 Emulator: R8 on a `--limit 200` sample, then in full. All 9,150 profile vectors and 20,245 skill vectors are replaced and carry metadata. The report gives the token total and the new spread.
- AC6 Emulator: R10 gives the 3 publics (2 on the emulator) real E; every ISR equals `isr.js`; the browser shows the new values.
- AC7 Cost: the token totals of AC2-AC6 are recorded with their price at the paid rate, even when the free tier covers them.
- AC8 Live, after the author's steps (R12): a Check from the browser is logged with `ai_source: "model"`; the vectors and the 3 publics are checked read-only.

## 7. Plan (after approval)

1. **Phase A** (2-3 d): R1-R7 and R13; AC1-AC4 on the emulator.
2. **Phase B** (1-2 d, after P1 if 4.2 a): R8-R9; AC5.
3. **Phase C** (0.5 d): R10-R11; AC6.
4. **Status log, CHANGES, README; PR.** Phase D by the author, then AC8.

## 8. Traceability

- Roadmap stage 1; IF l.112-119; EMBEDDINGS #7, #9, #11, #12; A1b (placeholder).
- Components: 03 (S), 04 (E), 07 (Analyzer), 12 (embeddings), 13 (deployment), 02 (new collections and fields).

## 9. Status log

- Spec written 2026-11-09 (agent), with the author's decisions on models, templates and logs.
- Approved 2026-11-10 (author: "approved, start Phase A and the P1 check"; "Try to stay in free-tier limits"). Open points 4.1-4.5 as recommended.
- Phase A (2026-11-10, agent):
  - SDK `@google/genai` ~2.31.0, replacing `@google/generative-ai`. Version 3.0.0 was 4 days old, so the 2.x line was chosen.
  - `functions/ai-config.js`: models, temperature 0, seed, versions `p2` / `t1`, task types, k = 5.
  - `functions/ai-helper.js`:
    - lazy client, the key from the secret, errors redacted;
    - `embedTexts` and `embedIssue`, with no random vector;
    - the k nearest examples;
    - `runAnalyzer` returning `{params, meta}`, with the keyword fallback labelled.
  - `functions/analyzer-log.js`.
  - `functions/index.js`:
    - the secret `GEMINI_API_KEY` on the three HTTPS functions;
    - `checkIssue` embeds first and refuses with 503 on failure, then sends the 5 nearest examples to the Analyzer, logs the call, and keeps the vector and the AI source in the draft;
    - `createIssue` reuses the draft's vector, writes `issue_vectors/{id}` and an `ai` field on the issue;
    - `analyzeIssue` is logged.
  - `functions/tools/build_examples.js` and `functions/data/analyzer_examples.json`: the 100 examples, parsed, without the A2 fields; vectors to be added with `--embed`.
  - `firestore.rules`: `analyzer_logs` is server-only. `.gitignore`: `.secret.local`.
  - Browser: the Check window shows the AI source line and the server's own error message.
- Tests:
  - Node 50: 10 new in `test/ai.test.js`; `params.test.js` was adapted to the new return value.
  - Python 52.
- Emulator, without a key (AC4, 2026-11-10):
  - `checkIssue` answered 503 "AI unavailable: …", and wrote one `analyzer_logs` entry (`ai_source` "none", embedding error "no API key"), with no draft.
  - The browser showed "Check calculations error: AI unavailable: …", and Create stayed disabled.
- Key (2026-11-10): the author created a free-tier key in a new AI Studio project of the personal account, without billing, and saved it in `functions/.secret.local` (gitignored, never read or printed by the agent).
  - Free-tier limits shown: `gemini-3.1-flash-lite` 15 RPM, 250K TPM, 500 RPD; `gemini-embedding-001` 100 RPM, 30K TPM, 1K RPD.
- Examples: `node tools/build_examples.js --embed` embedded the 100 examples in 1 request. Nearest neighbours fit the topics (lock -> leak, elevator, stairwell lighting; school bus -> bus route change). Median cosine between examples: 0.76 (the old profile vectors: 0.91).
- Emulator with the key (2026-11-10):
  - AC2: 5 test issues, each checked twice, 8 s apart:
    - all 10 returned `ai_source` "model";
    - the parameters were identical in both runs for all 5;
    - the 5 examples fitted each issue (for example "School bus stop moved" -> examples 60, 24, 56, 58, 57).
    - Each call left one `analyzer_logs` entry, about 7,960 prompt tokens and 1,070 output tokens. 11 calls used 99,399 tokens: about $0.04 at the paid rate, $0 on the free tier.
  - AC3: the two drafts of each issue hold bit-identical vectors.
    - `createIssue` with a draft reused its vector, without a new embedding call.
    - It wrote `issue_vectors/{id}` (768, `gemini-embedding-001`, `RETRIEVAL_QUERY`, `t1`) and `issue.ai` (`source` "model", the model, the 5 example ids, the log id), and deleted the draft.
  - Browser: the Check window shows "Parameters derived by gemini-3.1-flash-lite with 5 reference examples."
  - Requests used today: 13 embedding requests and 12 text requests, within the free tier.
- Finding: with the model's parameters, the test publics were small (1-3 members). For example, a broken lock gives mu = 40 m, sigma = 30 m, and no synthetic home lies within 100 m of the test point (47.55, 7.61); 123 lie within 1 km, 7,864 within 5 km. A demo must place issues where people live (stage 3).
- **Deploy only together with phase B.** Until the people are re-embedded, S and E would compare a `gemini-embedding-001` issue vector with person vectors from the old model (`text-embedding-004`, EMBEDDINGS #7). Cosines across two models are meaningless. Phases A-C are therefore one PR and one deploy.
- Template change (2026-11-10, author: "start Phase B with that template"): P1 fills the empty `name` and `specialization` of every work-experience entry with the role and the field, and `comment` with one sentence on the person's own work. Template `t1` therefore embeds a work-experience entry as `{role} ({field}): {description}`, in the skill vector and on the profile's "Experience:" line. No person had been embedded with `t1`, so the version stays `t1`.
- Phase B implemented (2026-11-10, agent; worktree of `a4-working-ai`):
  - `scripts/embedding_templates.py` (R9): the templates.
  - `scripts/ai_config.py`: the Python scripts read the models, size, template version and task types from `functions/ai-config.js`, so there is one source.
  - `scripts/gemini_api.py`: `batchEmbedContents` over REST, 100 texts a request, unit vectors (768 dimensions are not returned normalised); the key in a header and redacted from every error.
  - `scripts/embed_people.py` (R8): a dry run by default; `--apply`, `--limit`, `--max-requests` (default 900 a run), `--compare-task-types` (open point 4.3).
    - The pace stays below the free tier: at most 24,000 estimated tokens and 60 requests a minute.
    - On HTTP 429 it waits 60 s; on 5xx it backs off for 30, 60 and 120 s; after 3 failed requests in a row it stops.
    - A person is written once all their texts are embedded.
    - `profile_vector` stays a Firestore vector, and `experience_vectors` is replaced as a whole.
    - Besides R8's fields, it writes `embedding_task_type` and `embedding_text_sha256` (`{"profile": sha, "<skill id>": sha}`). A person is skipped when model, size, template, task type and texts are current. This is how a run resumes, and how a profile changed later is embedded again.
    - The report: counts, estimated tokens and paid-rate cost, long texts, the median pair cosine (new against the same people's old vectors), example texts (uids only), and, with `--compare-task-types`, S for 5 fixed issue texts against 200 profiles under both task types (6 requests).
  - Tests: `tests/test_embed_people.py` (15, API mocked): the texts pinned on fixture profiles (after and before P1, a child, a toddler), the excluded fields, the config, the plan and resume rule, batches and the written fields, the stop on errors, the request limit, the pace, the request body. Python 67 OK; Node 50 pass.
  - Dry run on the emulator (no API call, profiles before P1): 9,150 people (`users/None` skipped), 29,395 texts (9,150 profiles, 5,835 education, 11,057 work experience, 3,353 activities), about 716,000 estimated tokens ($0.11 at the paid rate), 294 requests, about 30 minutes. No text is near the 2,048-token limit.
  - Next: P1 `--apply` on the emulator, then the `--limit 200` sample with `--compare-task-types`, then the full run (AC5).
- The emulator (2026-11-10): the app restart closed its terminal, and it was started again from `.emulator-data` (the export of 2026-11-08 21:32). Its changes from 2026-11-09/10 were lost: the A1b placeholder, the L1 deadline migration, and the A4 test issues and logs. The profiles were not affected. `migrate_a1b.py --apply` was run again on the emulator: 2 publics and 50 members (54 documents), as on 2026-11-09; a second run changed nothing. At the author's request, `migrate_l1.py --new-deadline 2026-12-09 --apply` was also run again: 269 documents (191 discussions, 78 issues; 113 chats, 77 voting topics), the date used on live on 2026-11-09; a second run changed nothing. Live had 1 chat more (113 missing deadlines against 112), created after the export.
- Phase C implemented (2026-11-10, agent): `scripts/migrate_a4.py` (R10, R11).
  - It selects the publics whose members all have `expertise_source` "no_issue_vector". A public where only some have it is reported and left alone.
  - The issue vector: `{title}. {description}` of the issue, else of its discussion, as `RETRIEVAL_QUERY`. It is stored in `issue_vectors/{topic id}` with the fields `createIssue` writes. An entry with the same model, template, task type and text is reused without a request.
  - E per member as `createIssue` computes it (`scripts/expertise.py`, the port of `functions/isr.js`):
    - the current skills and skill vectors;
    - the age floor at the topic's `created_at`;
    - the issue's CBC adjustment, else 1.0.
  - The ISR comes from `isr_core.isr_for_public`, with the weights A1b used.
  - It writes the member fields `createIssue` writes, plus `expertise_source` "issue_vector", and rewrites the topic maps.
  - A public is held back while any member's vectors are not current (Phase B not yet run for that person's present texts).
  - A second run changes nothing.
  - Tests: `tests/test_migrate_a4.py` (5), with the API mocked:
    - E against hand-computed values (cosine powers, years, the age floor of a 16-year-old);
    - the ISR against `isr_core`, and the maps;
    - the mixed public left alone;
    - stale vectors held back;
    - an existing issue vector reused;
    - the second run;
    - the topic text fallback.
  - Python: 72 tests OK.
  - Dry run on the emulator: 2 placeholder publics, both left alone ("25 members without current A4 vectors"), 0 requests.
- 2026-11-10 (agent), preparing the PR:
  - Merged main (U5, and the L1, U2-U4 and A1b live records) into the branch; the only conflict was in the spec index.
  - Tests after the merge: Node 55, Python 72.
  - Drafted CHANGES and the spec-index row; the numbers from phases B and C are added after the runs.
- 2026-11-11, phase B on the emulator, after P1's apply (agent):
  - **Where it ran:** from `C:\isr-mvp`, detached at `origin/a4-working-ai`, because the key file lives there. The scripts load it themselves. Afterwards the folder went back to `p1-profile-review`.
  - **Dry run:** 9,150 people, 29,395 texts, 294 requests of up to 100 texts.
  - **The sample** (`--limit 200 --apply --compare-task-types`): 200 people embedded in about 20 minutes, with repeated per-minute 429s. The task-type comparison then failed on a 429, because `compare_task_types` has no retry, and its report was lost: drive A, which holds this worktree, was disconnected.
  - **The full run** (`--apply`): 88 more people (300 texts); then one batch failed all 6 attempts with 429, and the run stopped. **288 of 9,150 people** now have `t1` vectors. The report is [A4-embedding-report.md](A4-embedding-report.md). The emulator was exported.
  - **Finding: the free tier counts every text.**
    - Google's limit is `EmbedContentRequestsPerDayPerProjectPerModel-FreeTier` = **1,000 a day**, and each text in a `batchEmbedContents` call counts.
    - A 50-text call got HTTP 429 with "retry after" about 22 h, while a 1-text call passed.
    - The plan's assumption that a batch counts as one request was wrong.
    - All 29,395 texts therefore take about **29 days** on the free tier, on the emulator and again on live (phase D).
  - **Decision for the author:**
    - a. billing on the AI Studio project of the key (paid rate $0.15 per 1M tokens: about $0.11-0.30 for the whole population, with a budget alert);
    - b. about a month at under 1,000 texts a day (the script resumes and skips people who are current);
    - c. a smaller scope, for example only the people of the demo scenarios.
  - **Follow-up:** `compare_task_types` needs the same retry on 429 as the main loop. Phase C waits until phase B is complete, because it holds back publics whose members' vectors are not current.
