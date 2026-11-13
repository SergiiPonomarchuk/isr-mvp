# A4 embedding write timeout recovery

The author's live phase B run stopped on Firestore DeadlineExceeded after more than 100 completed Gemini requests. Read-only verification found 3,050 people saved and 6,100 remaining. The author supplied the traceback and requested continuation of the rollout.

Retry the current buffered merge batch for transient Firestore failures, with bounded attempts and delay, preserving the already-returned Gemini vectors in memory. Retry timeout, unavailable, aborted, internal and rate-limited writes. Propagate permanent errors immediately. Clear the pending buffer after a successful commit. Preserve templates, models, merge masks and the resume rule. Live apply remains the author's action.

Verify with fake batches that the same writes survive transient failures, timeout settings and delays are bounded, permanent errors propagate and exhausted attempts stop. Run the project suites. Open a PR, and provide an author resume command from the tested worktree using the root key through its existing loader path.

## Status log

- 2026-11-13: Focused fix plan recorded before code changes. Sol Medium is sufficient. Node 98 passed. Python 114 run, 112 passed and two optional skips. Three regression tests prove transient retry, permanent error propagation and bounded exhaustion. The root scratch launcher imports the feature script and directs the existing Gemini loader to its original root path. No key is copied. The author resumes the live run.
