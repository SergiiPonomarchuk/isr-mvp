# Plan: ISR MVP Read-Only Data Export & Implementation Audit

**Timestamp:** 2026-10-12  
**Target Output Directory:** `./claude_export/`  
**Execution Environment:** Python 3.11 with Firebase Admin SDK (`firebase_admin` v7.4.0) using Application Default Credentials (ADC) in strict read-only mode.

---

## 1. Firestore Collections & Subcollections Inventory

Direct inspection of the Firebase Firestore database (`project-a3d59130-5adf-4677-9e2`) reveals the following collections and document counts:

### Root Collections Present
1. **`users`** (9,151 documents): Primary user demographic profiles, personal taxonomy vectors (`values_taxonomy`), values descriptions (`values_description`), geography anchors, social relations, skills, features, and employment posts.
2. **`user_vectors`** (9,150 documents): 768-dimensional dense vector embeddings (`profile_vector`) and per-experience 768-dimensional embeddings (`experience_vectors`).
3. **`user_packs`** (37 documents): Bundled user profile metadata chunks (~250 users per pack) used for client-side search caching.
4. **`discussions`** (192 documents): Issue discussion threads metadata, creation timestamps, participants, creator UIDs, message counts, last message metadata, and user relevance/ISR score maps.
5. **`issues`** (80 documents): Civic issues in governance/voting/task phases, containing full AI Issue Analyzer outputs (component weights, geospatial parameters $\mu/\sigma$, affection distances, demographic filters, options, and relevance scores).
6. **`microcommunities`** (192 documents): Ephemeral ad-hoc publics formed per issue, containing member counts, issue linkage, and aggregated Vector of Values taxonomy representations.
7. **`microcommunity_members`** (3,099 documents): Individual memberships in ad-hoc publics keyed by `{issueId}_{uid}`, containing component breakdown scores ($D, G, S, X$, education, experience, resources, relevance, ISR score).
8. **`actions`** (1,188 documents): Real-world actions and contribution event logs, containing action text, sentiment scalars, complexity, time hours, type weights, result factors, member marks, and 145-dimensional Action Vector data.

### Subcollections Present
- **`discussions/{discussionId}/messages`** (1,694 total documents across all 192 discussions): Hierarchical threaded discussion messages containing text, timestamps, author UIDs, parent IDs, child IDs, and emoji marks/reactions.

### Collections Verified NOT PRESENT (0 Documents)
- **`voting`**: 0 documents (historical/legacy collection mapping; live voting issues reside in `issues` with `status: in_process`).
- **`tasks`**: 0 documents (tasks reside in `issues` with `status: tasks` or embedded `tasks` arrays).
- **`values`**: 0 documents (personal values descriptions and taxonomies reside directly within `users` and `db/values-vector.json`).
- **`contributions`**: 0 documents (contribution records reside in `actions`).
- **`logs`**: 0 documents.
- **`embeddings`**: 0 documents (embeddings reside in `user_vectors`).

---

## 2. Execution Scripts & Step Mapping

All export and audit scripts will be located in `scratch/export_scripts/` and operate in strictly read-only mode:

1. **`step1_schema_inventory.py`**
   - Inspects all 8 collections and 1 subcollection.
   - Extracts complete field schemas, types, nullability rates, and redacted representative documents.
   - Outputs: `claude_export/SCHEMA.md`.

2. **`step2_population_export.py`**
   - **Profiles:** Exports all 9,151 user profiles to JSONL chunks $\le$ 8 MB (`profiles_000.jsonl`, ...). Strips all PII (`email`, `password`, `emailVerified`, `displayName`, `firstName`, `lastName`). Normalizes `uid` to integer and logs any type anomalies.
   - **Values Vectors:** Exports all 145-dimensional values vectors (`values_vectors_000.jsonl`, ...) matching the canonical schema.
   - **Values Narratives:** Random sample of 200 narratives (seed=42), replacing `prototype` names with stable codes `P-001`...`P-200`, saving the mapping strictly in `./private/prototype_map.json`.
   - **Discussions:** Exports all 192 discussion threads with full subcollection messages, nested child arrays, and marks in JSONL chunks $\le$ 8 MB.

3. **`step3_embeddings.py`**
   - Extracts 768-dimensional dense vectors from `user_vectors` (`profile_vector` and `experience_vectors`).
   - Exports float32 `.npy` chunks $\le$ 10 MB with corresponding `_ids.json` files.
   - Documents embedding models, dimensions, normalizations, and input text templates in `claude_export/EMBEDDINGS.md`.

4. **`step4_issues_decisions.py`**
   - Exports all documents from `issues`, `microcommunities`, `microcommunity_members`, and `actions` into JSONL format.
   - Retains all Analyzer outputs (weights, geospatial envelopes, demographic criteria, reasoning).

5. **`step5_implementation_audit.py`**
   - Audits repository codebase without modifications.
   - Verifies items (a) through (h) with exact file paths, line numbers, and `VERIFIED` / `UNSURE` status.
   - Outputs: `claude_export/IMPLEMENTATION_FACTS.md`.

6. **`step6_dry_run.py`**
   - Selects 20 benchmark issues from `docs/ISR-Issue-Analyzer-100-Examples.md` (including #1, #10, #18, #19, #23, highest $w_E$, highest $w_S$).
   - Runs in-memory calculation of $D, G, S, X, R$, Expertise ($E_{\text{edu}}, E_{\text{exp}}, E_{\text{res}}, E$), Contribution ($C$), and raw/normalized ISR over the exported population.
   - Writes 20 CSV files to `claude_export/dry_run/`.

7. **`step7_quality_report.py`**
   - Analyzes population distributions (age, gender, nationality, employment, education, family size, offences).
   - Computes marks statistics, message frequency percentiles, and vector coverage.
   - Outputs: `claude_export/QUALITY.md`.

8. **`step8_manifest_and_package.py`**
   - Validates JSONL parsing for every generated line.
   - Scans export directory for secret leaks (`@`, `password`, `apiKey`, `private_key`).
   - Generates `claude_export/MANIFEST.md` with file sizes, line counts, and SHA-256 hashes.
   - Compresses export into zip archives $\le$ 20 MB.
