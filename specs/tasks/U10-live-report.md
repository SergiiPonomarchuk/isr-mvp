# U10 live release acceptance - 2026-11-14

Release: main `8466b13702770a7622868dfe38b5e82c592f34a3`, merged through PR #32 at the author's explicit instruction. GitHub also marked ancestor proposal #31 merged when its commit became reachable from main; no separate merge command was issued for #31.

The author deployed hosting, `checkIssue`, `createIssue` and new `joinIssue` from clean detached `wt-main`, then reported deployment complete.

## Read-only verification

- All 13 tracked hosted HTML/CSS/JavaScript files match the release byte-for-byte; all returned `Cache-Control: no-cache`.
- Firebase deployment metadata reports `checkIssue`, `createIssue` and `joinIssue` ACTIVE, Node 22, us-central1.
- OPTIONS preflight to each public endpoint returned 204 with the hosted site's origin permitted. No POST business handler was invoked by the agent.
- Main CI passed; accepted source is unchanged from the checked PR head. Metadata/preflight confirm availability; they do not prove every live business path.

## Human acceptance

The author was given a live Check procedure using the existing entrance-lock title and description, expecting the registered issue, an active-title warning and disabled Create. On 2026-11-14 the author confirmed: "ok, it is works on the live site". Record this as live acceptance of that Check path. Broader Join/separate-creation/retry behavior has the prior synthetic emulator/human evidence in [U10 emulator report](U10-emulator-report.md); no additional live mutation is claimed.

Agent browser automation still fails to create its process security environment (0x8007000F). The visible browser tab alone did not provide control. The agent did not deploy, read secret files, change rules, invoke paid models or write production data during these checks.

Next: refine D1's archive/standby/duplicate rehearsal before seeding. PR #28/#29 remain separately open and require explicit author merge instructions. D1 must account for their recovery/retry dependencies before relying on those utilities.
