# SPEC U7: The page is not cached for an hour after a deploy

Status: DONE on live 2026-11-11 (merged in PR 17; hosting deployed by the author from `wt-main` at `f58bf25`; AC2 passed).
Branch: u7-page-no-cache (from main at `7c73ea7`; never main)
Source: a side finding of U5 (2026-11-10). U5 stopped the caching of scripts and styles, but not of the page itself.

## 1. Context (verified 2026-11-10)

| Fact | Evidence |
|---|---|
| **Live headers:** `/` and `/index.html` are sent with `Cache-Control: max-age=3600`, Firebase Hosting's default. Since U5, `/js/main.js` and `/firebase-config.js` are sent with `no-cache`. | `curl -I` on the live site, 2026-11-10 |
| **The consequence:** after a deploy, a browser may use its cached page for up to an hour, together with the new scripts. An old page with new scripts can break; for example, a new script may look for an element the old page does not have. | `firebase.json` (the U5 rule `**/*.@(js|css)`) |
| **Rewrites:** hosting sends every unknown path to `/index.html`, and `/main` and `/values-guide` to their pages. Header rules are matched against the request path, so a rule for `**/*.html` would miss `/` and the rewritten paths. | `firebase.json` `hosting.rewrites`; Firebase Hosting documentation on `headers` |
| **What `no-cache` costs on live:** the CDN does not keep a `no-cache` file. The server answers 200 with the whole file even when the browser sends a matching ETag; only `/`, which the CDN keeps, got a 304.<br>A full load of the page is 137 KB compressed. Since U5, the scripts and styles (91 KB of it) already come in full on every load; U7 adds the page (7 KB) and the logo (38 KB).<br>The free hosting transfer (360 MB a day) covers about 2,600 full loads a day. | `curl` on live, 2026-11-10 (`/js/main.js` with `If-None-Match`: 200, `X-Cache: MISS`) |
| **The local hosting server** (`firebase serve`, firebase-tools 14.1) does not apply `headers`. It sends no Cache-Control at all, not even U5's for scripts. The headers can therefore only be checked on live. | `curl` on `firebase serve --only hosting`, 2026-11-10 |

## 2. Requirements

- R1 **`firebase.json`:** one header rule, `"source": "**"` with `Cache-Control: no-cache`, replaces U5's rule `**/*.@(js|css)`.
  - It covers every response: the page, the rewritten paths, scripts, styles and the logo.
  - The browser fetches a fresh copy on every load, so a deploy shows at once. The cost is in section 1: about 45 KB more per load than today.
- R2 **Tests:** U5's static check of `firebase.json` is adapted to the one rule.

## 3. Non-goals

- Changing the files themselves, adding a service worker, or versioned file names.

## 4. Acceptance criteria

- AC1 Unit tests and CI green (R2).
- AC2 Live, after the author deploys hosting (read-only `curl -I`): `Cache-Control: no-cache` for `/`, `/index.html`, a rewritten path, `/js/main.js` and `/isr-logo.png`.

The local hosting server cannot check the headers (section 1), so the first draft's local AC2 was dropped.

## 5. Plan

1. R1 and R2; AC1.
2. Status log, CHANGES, spec index. The PR merges into main at any time; it is deployed with A4 or U6.

## 6. Status log

- 2026-11-10: spec written and approved (author: "1+2").
- 2026-11-10 (agent):
  - Implemented R1 and R2 (`firebase.json`; `functions/test/page_cache.test.js` with 2 tests; U5's test adapted).
  - AC1: Node 47 pass after `npm ci` (main still uses `@google/generative-ai`); Python unchanged.
  - Found while checking:
    - the local hosting server ignores `headers`, so the local AC2 was dropped and the check moved to live;
    - on live, `no-cache` files come in full on every load, not as 304s. Section 1 gives the cost.
  - Pending: AC2 on live after the author's hosting deploy.
- 2026-11-10: merged (PR 17, `f58bf25`).
- 2026-11-10: the first deploy attempt failed. The agent gave the command in cmd syntax (`cd /d … && …`), which Windows PowerShell 5.1 rejects, so nothing was deployed. The live page still had `max-age=3600` and the release of 2026-11-10 14:53 UTC.
- 2026-11-11: the author deployed hosting from `A:\BackUp\isr-mvp\worktrees\wt-main` (`f58bf25`), with the command in PowerShell syntax.
- 2026-11-11, AC2 on live (agent, read-only `curl`):
  - `Cache-Control: no-cache` for `/`, `/index.html`, a rewritten path (`/some/topic`), `/js/main.js`, `/styles.css`, `/isr-logo.png` and `/firebase-config.js`;
  - the release is dated 2026-11-11 06:16:27 GMT;
  - `index.html`, `js/main.js` and `firebase-config.js` are identical to main.
