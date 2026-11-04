"""Load claude_export/ into the Firestore emulator (task A2).

Emulator only: refuses to run unless FIRESTORE_EMULATOR_HOST is set. There is no
option to write anywhere else.

Loads users (from profiles; no email or other contact fields), issues,
discussions (with their messages subcollection), microcommunities,
microcommunity_members and, with --vectors, user_vectors (profile vectors from
the .npy files) so that S can be computed by checkIssue.

Usage (PowerShell):
    $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
    python scripts/seed_emulator.py --project project-a3d59130-5adf-4677-9e2 --vectors
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, "claude_export")

USER_FIELDS = ("uid", "isVerified", "birthDate", "nationality", "gender", "offences", "post",
               "skills", "geography", "marks", "features", "values_taxonomy", "values_description")


def jsonl(pattern):
    for path in sorted(glob.glob(os.path.join(EXPORT, pattern))):
        with open(path, encoding="utf-8") as f:
            for line in f:
                yield json.loads(line)


def convert(value, firestore):
    """Export encodings back to Firestore types: {latitude, longitude} -> GeoPoint."""
    if isinstance(value, dict):
        if set(value) == {"latitude", "longitude"}:
            return firestore.GeoPoint(value["latitude"], value["longitude"])
        return {k: convert(v, firestore) for k, v in value.items()}
    if isinstance(value, list):
        return [convert(v, firestore) for v in value]
    return value


class Writer:
    def __init__(self, db):
        self.db, self.batch, self.n, self.total = db, db.batch(), 0, 0

    def set(self, ref, data):
        self.batch.set(ref, data)
        self.n += 1
        self.total += 1
        if self.n >= 400:
            self.flush()

    def flush(self):
        if self.n:
            self.batch.commit()
            self.batch, self.n = self.db.batch(), 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default="demo-isr")
    ap.add_argument("--vectors", action="store_true", help="also load user_vectors.profile_vector")
    a = ap.parse_args(argv)

    if not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (this script writes to the emulator only)")

    from google.cloud import firestore
    db = firestore.Client(project=a.project)
    w = Writer(db)
    counts = {}

    n = 0
    for p in jsonl("profiles_*.jsonl"):
        uid = p["uid"]
        doc = {k: p[k] for k in USER_FIELDS if k in p}
        doc["displayName"] = p.get("displayName") or f"User {uid}"
        doc["socialRelations"] = p.get("social relations", [])
        w.set(db.collection("users").document(str(uid)), convert(doc, firestore))
        n += 1
    counts["users"] = n

    for coll, pattern in (("issues", "issues_*.jsonl"), ("microcommunities", "microcommunities_*.jsonl"),
                          ("microcommunity_members", "microcommunity_members_*.jsonl")):
        n = 0
        for d in jsonl(pattern):
            doc_id = str(d.pop("doc_id"))
            w.set(db.collection(coll).document(doc_id), convert(d, firestore))
            n += 1
        counts[coll] = n

    n = m = 0
    for d in jsonl("discussions_full_*.jsonl"):
        doc_id = str(d.pop("doc_id"))
        messages = d.pop("messages", [])
        d.pop("messages_subcollection_count", None)
        ref = db.collection("discussions").document(doc_id)
        w.set(ref, convert(d, firestore))
        n += 1
        for msg in messages:
            mid = str(msg.pop("msg_doc_id", msg.get("id")))
            w.set(ref.collection("messages").document(mid), convert(msg, firestore))
            m += 1
    counts["discussions"], counts["messages"] = n, m

    if a.vectors:
        import numpy as np
        from google.cloud.firestore_v1.vector import Vector
        n = 0
        for npy in sorted(glob.glob(os.path.join(EXPORT, "emb_profile_*.npy"))):
            ids = json.load(open(npy[:-4] + "_ids.json", encoding="utf-8"))
            vecs = np.load(npy)
            for meta, vec in zip(ids, vecs):
                w.set(db.collection("user_vectors").document(str(meta["doc_id"])),
                      {"uid": meta["uid"], "profile_vector": Vector([float(x) for x in vec])})
                n += 1
        counts["user_vectors"] = n

    w.flush()
    print("Loaded into the emulator:", ", ".join(f"{k} {v}" for k, v in counts.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
