"""Check firestore.rules on the Firestore emulator (task R0, R2).

Unauthenticated REST requests are subject to the rules (the Admin SDK and
"Bearer owner" requests are not). Allowed: read and write in the prototype's
collections. Denied: every access to the server-only issue_drafts.

Emulator only: refuses to run unless FIRESTORE_EMULATOR_HOST is set. Creates and
deletes its own test documents (ids starting with "r0_rules_check").

Usage (PowerShell):
    $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
    python scripts/check_rules_emulator.py --project project-a3d59130-5adf-4677-9e2
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

TEST_ID = "r0_rules_check"


def call(method, url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default="demo-isr")
    a = ap.parse_args(argv)
    host = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not host:
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (emulator only)")
    base = f"http://{host}/v1/projects/{a.project}/databases/(default)/documents"
    doc = {"fields": {"note": {"stringValue": "R0 rules check"}}}

    cases = [
        ("read users/1", "GET", f"{base}/users/1", None, True),
        ("list users", "GET", f"{base}/users?pageSize=1", None, True),
        ("read issues", "GET", f"{base}/issues?pageSize=1", None, True),
        ("read microcommunity_members", "GET", f"{base}/microcommunity_members?pageSize=1", None, True),
        ("write discussions", "PATCH", f"{base}/discussions/{TEST_ID}", doc, True),
        ("write discussions/*/messages", "PATCH", f"{base}/discussions/{TEST_ID}/messages/m1", doc, True),
        ("read discussions/*/messages", "GET", f"{base}/discussions/{TEST_ID}/messages", None, True),
        ("write issues", "PATCH", f"{base}/issues/{TEST_ID}", doc, True),
        ("create issue_drafts", "POST", f"{base}/issue_drafts?documentId={TEST_ID}", doc, False),
        ("update issue_drafts", "PATCH", f"{base}/issue_drafts/{TEST_ID}", doc, False),
        ("read issue_drafts doc", "GET", f"{base}/issue_drafts/{TEST_ID}", None, False),
        ("list issue_drafts", "GET", f"{base}/issue_drafts?pageSize=5", None, False),
        ("delete issue_drafts", "DELETE", f"{base}/issue_drafts/{TEST_ID}", None, False),
    ]
    failures = 0
    for name, method, url, body, allowed in cases:
        status = call(method, url, body)
        ok = (200 <= status < 300) if allowed else status == 403
        failures += 0 if ok else 1
        print(f"{'ok  ' if ok else 'FAIL'} {name}: HTTP {status} (expected {'allowed' if allowed else 'denied 403'})")
    for path in (f"discussions/{TEST_ID}/messages/m1", f"discussions/{TEST_ID}", f"issues/{TEST_ID}"):
        call("DELETE", f"{base}/{path}")
    print("All rules checks passed." if failures == 0 else f"{failures} rules checks failed.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
