"""Restore the synthetic name fields that the claude_export/ exporter removed (MANIFEST l.58,
PLAN l.46), so that the prototype on the emulator can search and show users by name.

Emulator only: refuses to run unless FIRESTORE_EMULATOR_HOST is set.

The population is synthetic (author, 2026-11-05). Names come from the local db/profiles.json:
  - users: displayName, firstName, lastName
  - microcommunity_members.displayName (from user_id)
  - issues / discussions: last_message_sender_name (from last_message_sender_uid)
  - issues.options[].author_name (author_uid), options[].description[].in_charge_name (in_charge_uid)
  - issues.tasks[].in_charge_name, tasks[].comments[].author_name (uid),
    tasks[].subtasks[].in_charge_name, tasks[].subtasks[].comments[].author_name
email, password and emailVerified are NOT restored (not needed; credential fields).
Prints counts only.

Usage (PowerShell):
    $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
    python scripts/restore_names.py --project project-a3d59130-5adf-4677-9e2
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SOURCE = os.path.join(ROOT, "db", "profiles.json")


def load_names(path):
    with open(path, encoding="utf-8") as f:
        profiles = json.load(f)
    names = {}
    for uid, p in profiles.items():
        names[int(uid)] = {k: p.get(k) for k in ("displayName", "firstName", "lastName") if p.get(k)}
    return names


def _uid(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def name_of(names, uid):
    n = names.get(_uid(uid))
    return n.get("displayName") if n else None


def fill_nested(doc, names, counts):
    """Rebuild the nested name fields of an issue doc in place; True if anything changed."""
    changed = False
    for opt in doc.get("options") or []:
        if isinstance(opt, dict):
            n = name_of(names, opt.get("author_uid"))
            if n and opt.get("author_name") != n:
                opt["author_name"] = n; counts["options.author_name"] += 1; changed = True
            for step in opt.get("description") or []:
                if isinstance(step, dict):
                    n = name_of(names, step.get("in_charge_uid"))
                    if n and step.get("in_charge_name") != n:
                        step["in_charge_name"] = n; counts["options.description.in_charge_name"] += 1; changed = True
    for task in doc.get("tasks") or []:
        if not isinstance(task, dict):
            continue
        n = name_of(names, task.get("in_charge_uid"))
        if n and task.get("in_charge_name") != n:
            task["in_charge_name"] = n; counts["tasks.in_charge_name"] += 1; changed = True
        for c in task.get("comments") or []:
            n = name_of(names, c.get("uid")) if isinstance(c, dict) else None
            if n and c.get("author_name") != n:
                c["author_name"] = n; counts["tasks.comments.author_name"] += 1; changed = True
        for sub in task.get("subtasks") or []:
            if not isinstance(sub, dict):
                continue
            n = name_of(names, sub.get("in_charge_uid"))
            if n and sub.get("in_charge_name") != n:
                sub["in_charge_name"] = n; counts["tasks.subtasks.in_charge_name"] += 1; changed = True
            for c in sub.get("comments") or []:
                n = name_of(names, c.get("uid")) if isinstance(c, dict) else None
                if n and c.get("author_name") != n:
                    c["author_name"] = n; counts["tasks.subtasks.comments.author_name"] += 1; changed = True
    return changed


def restore(db, names):
    counts = collections.Counter()
    batch, n = db.batch(), 0

    def put(ref, data):
        nonlocal batch, n
        batch.update(ref, data)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()

    for d in db.collection("users").select(["uid"]).stream():
        nm = names.get(_uid(d.to_dict().get("uid", d.id)))
        if nm:
            put(d.reference, nm); counts["users"] += 1
        else:
            counts["users without a name in the source"] += 1
    for d in db.collection("microcommunity_members").select(["user_id"]).stream():
        nm = name_of(names, d.to_dict().get("user_id"))
        if nm:
            put(d.reference, {"displayName": nm}); counts["microcommunity_members.displayName"] += 1
    for coll in ("issues", "discussions"):
        for d in db.collection(coll).stream():
            doc = d.to_dict()
            upd = {}
            nm = name_of(names, doc.get("last_message_sender_uid"))
            if nm:
                upd["last_message_sender_name"] = nm; counts[f"{coll}.last_message_sender_name"] += 1
            if coll == "issues" and fill_nested(doc, names, counts):
                upd["options"] = doc.get("options") or []
                upd["tasks"] = doc.get("tasks") or []
            if upd:
                put(d.reference, upd)
    batch.commit()
    return counts


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default="demo-isr")
    ap.add_argument("--source", default=DEFAULT_SOURCE)
    a = ap.parse_args(argv)
    if not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (this script writes to the emulator only)")
    from google.cloud import firestore
    counts = restore(firestore.Client(project=a.project), load_names(a.source))
    for k, v in sorted(counts.items()):
        print(f"{k}: {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
