"""Full read-only JSON backup of a Firestore database (task R0, R4).

Reads every top-level collection and, recursively, every subcollection, and writes
one JSON Lines file per collection path into --out:
    <out>/users.jsonl
    <out>/discussions.jsonl
    <out>/discussions__messages.jsonl      (subcollection "messages" of discussions)
Each line: {"path": "discussions/179/messages/3", "data": {...}}.
Firestore types are kept so that a restore can rebuild them exactly:
    {"__type": "timestamp", "value": "<ISO-8601>"}
    {"__type": "geopoint", "latitude": .., "longitude": ..}
    {"__type": "vector", "values": [..]}
    {"__type": "reference", "path": ".."}
    {"__type": "bytes", "base64": ".."}
A manifest.json with counts and the target is written at the end. Prints counts only.

Never writes to the database. Refuses an --out folder inside the repository, because
the backup holds the synthetic users' email and password fields.

Usage:
    python scripts/backup_firestore.py --project project-a3d59130-5adf-4677-9e2 --out A:\\ISR\\mvp\\dbbackup\\2026-11-07
With FIRESTORE_EMULATOR_HOST set it backs up the emulator instead.
"""
from __future__ import annotations

import argparse
import base64
import collections
import datetime as _dt
import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = 300


def encode(value):
    """Firestore value -> JSON value with explicit type tags."""
    from google.cloud.firestore_v1 import GeoPoint
    from google.cloud.firestore_v1.document import DocumentReference
    try:
        from google.cloud.firestore_v1.vector import Vector
    except ImportError:  # older client
        Vector = ()
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, _dt.datetime):
        return {"__type": "timestamp", "value": value.isoformat()}
    if isinstance(value, GeoPoint):
        return {"__type": "geopoint", "latitude": value.latitude, "longitude": value.longitude}
    if Vector and isinstance(value, Vector):
        return {"__type": "vector", "values": [float(x) for x in value]}
    if isinstance(value, DocumentReference):
        return {"__type": "reference", "path": value.path}
    if isinstance(value, (bytes, bytearray)):
        return {"__type": "bytes", "base64": base64.b64encode(bytes(value)).decode("ascii")}
    if isinstance(value, dict):
        return {str(k): encode(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [encode(v) for v in value]
    return {"__type": "unknown", "repr": repr(value)}


def inside_repo(path):
    a = os.path.normcase(os.path.realpath(path))
    b = os.path.normcase(os.path.realpath(ROOT))
    try:
        return os.path.commonpath([a, b]) == b
    except ValueError:  # different drives
        return False


class Backup:
    def __init__(self, db, out, workers=16):
        self.db, self.out, self.workers = db, out, workers
        self.counts = collections.Counter()
        self.files = {}
        self.lock = threading.Lock()

    def _file(self, coll_path_key):
        with self.lock:
            if coll_path_key not in self.files:
                self.files[coll_path_key] = open(os.path.join(self.out, coll_path_key + ".jsonl"), "w", encoding="utf-8")
            return self.files[coll_path_key]

    @staticmethod
    def key(coll_ref):
        # discussions/179/messages -> discussions__messages (one file per collection shape)
        parts = coll_ref._path
        return "__".join(parts[0::2])

    def write(self, key, snap):
        line = json.dumps({"path": snap.reference.path, "data": encode(snap.to_dict())}, ensure_ascii=False)
        f = self._file(key)
        with self.lock:
            f.write(line + "\n")
            self.counts[key] += 1

    def collection(self, coll_ref):
        """Page through one collection; return its document references."""
        key = self.key(coll_ref)
        refs = []
        ids = set()
        last = None
        while True:
            q = coll_ref.order_by("__name__").limit(PAGE)
            if last is not None:
                q = q.start_after(last)
            page = list(q.stream())
            if not page:
                break
            for snap in page:
                self.write(key, snap)
                refs.append(snap.reference)
                ids.add(snap.id)
            last = page[-1]
        # documents that exist only as parents of subcollections have no data but may have children
        for ref in coll_ref.list_documents(page_size=PAGE):
            if ref.id not in ids:
                refs.append(ref)
                ids.add(ref.id)
        return refs

    def subcollections(self, doc_refs):
        """List the subcollections of many documents in parallel; back each up (recursively)."""
        def children(ref):
            return list(ref.collections())
        with ThreadPoolExecutor(self.workers) as pool:
            found = [c for cs in pool.map(children, doc_refs) for c in cs]
        for coll_ref in found:
            self.subcollections(self.collection(coll_ref))

    def run(self):
        for coll_ref in self.db.collections():
            refs = self.collection(coll_ref)
            print(f"{coll_ref.id}: {self.counts[self.key(coll_ref)]} documents", flush=True)
            self.subcollections(refs)
        for f in self.files.values():
            f.close()
        return self.counts


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True, help="an empty or new folder outside the repository")
    ap.add_argument("--workers", type=int, default=16)
    a = ap.parse_args(argv)

    if inside_repo(a.out):
        ap.error("refusing: --out is inside the repository (the backup holds email and password fields)")
    if os.path.isdir(a.out) and os.listdir(a.out):
        ap.error("refusing: --out exists and is not empty")
    os.makedirs(a.out, exist_ok=True)

    from google.cloud import firestore
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    target = f"emulator {emulator}" if emulator else "LIVE (read-only)"
    print(f"Backing up project {a.project} from {target} into {a.out}", flush=True)
    started = _dt.datetime.now(_dt.timezone.utc)
    counts = Backup(firestore.Client(project=a.project), a.out, a.workers).run()
    manifest = {
        "project": a.project,
        "target": target,
        "started_utc": started.isoformat(),
        "finished_utc": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "script": "scripts/backup_firestore.py (R0)",
        "documents": dict(sorted(counts.items())),
        "total": sum(counts.values()),
    }
    with open(os.path.join(a.out, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("Done:", ", ".join(f"{k} {v}" for k, v in sorted(counts.items())), f"(total {manifest['total']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
