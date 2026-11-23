# Read-only DB completeness audit and restoration plan

Approved2026-11-23: audit missing/malformed data and metadata, compare retained sources/backups, then prepare restoration proposals including the16 deferred Values cases. User separately approved read-only issues, microcommunities, microcommunity_members, user_vectors, issue_drafts, analyzer_logs and discussion messages, overriding the older six-path skill list for this task only. Base main45124f2; branch codex/db-completeness-audit. Sol Medium is sufficient.

## Boundaries and method

No writes to any database, no AI/provider calls, no deployment/rules/docs/ edits, no credential loader, no restore/regeneration. Read only explicit projected allowlists from the six canonical roots and six additionally approved roots; read message subcollections only under scanned discussions. Never enumerate unknown collection contents. issue_vectors/user_packs/geocode_cache/config/membership_events and all other paths remain unassessed, even where a backup manifest names them. A scoped audit is not a full-database certification or atomic snapshot.

Reports persist only IDs (opaque nonnumeric IDs hashed), fixed field/reason codes, types/counts, update times and hashes. No names/contact/credentials, text, addresses, coordinates, raw Values or embeddings. Existing local backup JSONL is streamed in memory; select allowlisted fields and discard everything else. Never print raw JSON or exception messages. Store per-ID receipts privately outside the repository; commit aggregate findings only. Source/backup SHA256 digests establish inspected file bytes, not historical authorship or atomic consistency.

Paginate reads with deterministic document-ID cursors, validate page size and refuse ambiguous targets. Cross-check participant UID/document identity, required structural fields, dates, geography/skills/relations types and references, Values flattened layout and existing source-grounding classifier. Identify missing X eligibility flags/version as pending unimplemented preparation, not lost data. Empty skills/features and absent Values for never-vectorized users are coverage observations, not automatically corruption.

Validate profile/skill embeddings for finite768-component data, current model/dimension/template/task metadata, exact current embedding-template text hashes, and skill coverage. Load only vectors and metadata for this check, retain digests/statuses only. No similarity/scoring recomputation. Compare approved collection document sets and projected historical fields against the latest completed D1 backup; changed data is expected drift, absent documents/previously populated fields are review candidates, never automatic restore. Historic vector schema/model differences are not permission to replace current embeddings.

For issues/publics/members/discussions/actions/drafts/logs: inventory projected field shape and known version/presence; check user/public/issue references where the current schema supplies them; count duplicate member links, actual versus declared member counts. Root voting/tasks/values may legitimately be empty because the prototype stores those concepts elsewhere. Avoid imposing current schema on legacy records or diagnosing absent optional fields as data loss. Report limits for unassessed paths and message-parent discovery.

Recheck16 excluded IDs against retained source files and approved backup user payloads, with fixed provenance/layout reason codes. Produce an evidence-prioritized restoration plan: verified missing source recovery, ambiguous/mismatched provenance for author review, never-generated coverage and unimplemented fields separately. No repair implementation in this task.

## Validation and status

Pure/fake tests must prove allowlisted reads, pagination/duplicate detection, no write surface, privacy of output/errors, malformed values/embedding cases, source freshness, reference/count findings and backup difference classification. Required Node/Python suites run once after changes; inspect final PR CI. Author merges only on explicit merge PR instruction.

- 2026-11-23: approved scope recorded before code. Prior live metadata patch author-verified224 desired/zero conflicts; private journal has224 acknowledged applies and verification receipt. The16 cases remain excluded and unchanged by that patch.
