# A4 embedding write timeout recovery

The author's live phase B run stopped on Firestore DeadlineExceeded after more than 100 completed Gemini requests. Read-only verification found 3,050 people saved and 6,100 remaining. The author supplied the traceback and requested continuation of the rollout.

Retry the current buffered merge batch for transient Firestore failures, with bounded attempts and delay, preserving the already-returned Gemini vectors in memory. Retry timeout, unavailable, aborted, internal and rate-limited writes. Propagate permanent errors immediately. Clear the pending buffer after a successful commit. Preserve templates, models, merge masks and the resume rule. Live apply remains the author's action.

Verify with fake batches that the same writes survive transient failures, timeout settings and delays are bounded, permanent errors propagate and exhausted attempts stop. Run the project suites. Open a PR, and provide an author resume command from the tested worktree using the root key through its existing loader path.

Also recover a truncated Gemini HTTP response through the existing bounded API retry loop. Convert HTTP protocol failures and incomplete JSON to GeminiError without logging the response body. Mock a truncated response followed by success to verify request counts and backoff.

## Status log

- 2026-11-13: Final author resume completed. Its report records 62 requests, 5,763 embedded texts, 208,764 estimated tokens and 1,800 people written. Exact request/token totals for the two interrupted runs are unavailable because they exited before saving their reports.
- Final read-only check: all 9,150 profile texts and 20,245 skill texts match the current metadata. All 29,395 vectors are finite, 768-dimensional and normalized, maximum norm error 1.9984014443252818e-15. Zero people/texts remain. An initial vector scan failed on a read-side AttributeError; the repeat scan completed successfully.
- Next preflight: three placeholder publics / 150 members, zero stale/missing members, zero topics without text and three missing issue vectors. The author applies the A4 public migration, then Codex verifies its results.

- 2026-11-13: Resumed run later encountered HTTP IncompleteRead. Live read-only coverage is 7,350 saved and 1,800 remaining. Added safe conversion of interrupted/malformed responses to retryable GeminiError, using the existing request budget and backoff. A synthetic truncated-response-then-success test proves two counted requests and the normal retry delay. Python 117 run with two optional skips, Node 98 passed. Author resumes the same launcher.

- 2026-11-13: Focused fix plan recorded before code changes. Sol Medium is sufficient. Node 98 passed. Python 114 run, 112 passed and two optional skips. Three regression tests prove transient retry, permanent error propagation and bounded exhaustion. The root scratch launcher imports the feature script and directs the existing Gemini loader to its original root path. No key is copied. The author resumes the live run.
