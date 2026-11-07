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
With FIRESTORE_EMULATOR_HOST set it backs up the emulator instead. An interrupted run
can be continued with --resume (finished collections are skipped).
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
import time
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
    """Pages through every collection with its own retries (the client's retry path can
    crash on long reads, see R0 CHANGES) and writes <key>.jsonl.part files that are renamed
    to .jsonl when a top-level collection and all its subcollections are complete.
    progress.json records the complete collections so that --resume can skip them."""

    def __init__(self, db, out, workers=16, page=100, attempts=7):
        self.db, self.out, self.workers, self.page, self.attempts = db, out, workers, page, attempts
        self.counts = collections.Counter()
        self.files = {}
        self.lock = threading.Lock()
        self.progress_path = os.path.join(out, "progress.json")
        self.progress = {"done": {}}
        if os.path.exists(self.progress_path):
            with open(self.progress_path, encoding="utf-8") as f:
                self.progress = json.load(f)

    def _retry(self, what, fn):
        for attempt in range(self.attempts):
            try:
                return fn()
            except Exception as e:  # network timeouts, 503s, client retry bugs
                if attempt == self.attempts - 1:
                    raise
                wait = min(60, 2 ** (attempt + 1))
                print(f"  {what}: {type(e).__name__}; retry {attempt + 1} in {wait}s", flush=True)
                time.sleep(wait)

    def _file(self, key):
        with self.lock:
            if key not in self.files:
                self.files[key] = open(os.path.join(self.out, key + ".jsonl.part"), "w", encoding="utf-8")
            return self.files[key]

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
        self._file(key)  # an empty collection still gets a file
        refs, ids, last = [], set(), None
        while True:
            def fetch(last=last):
                q = coll_ref.order_by("__name__").limit(self.page)
                if last is not None:
                    q = q.start_after(last)
                return list(q.stream(retry=None, timeout=300))
            page = self._retry(f"{coll_ref.id} page", fetch)
            if not page:
                break
            for snap in page:
                self.write(key, snap)
                refs.append(snap.reference)
                ids.add(snap.id)
            last = page[-1]
        # documents that exist only as parents of subcollections have no data but may have children
        missing = self._retry(f"{coll_ref.id} list",
                              lambda: [r for r in coll_ref.list_documents(page_size=300) if r.id not in ids])
        return refs + missing

    def subcollections(self, doc_refs):
        """List the subcollections of many documents in parallel; back each up (recursively)."""
        def children(ref):
            return self._retry(f"{ref.path} subcollections", lambda: list(ref.collections()))
        with ThreadPoolExecutor(self.workers) as pool:
            found = [c for cs in pool.map(children, doc_refs) for c in cs]
        for coll_ref in found:
            self.subcollections(self.collection(coll_ref))

    def _finish(self, top):
        keys = [k for k in list(self.files) if k == top or k.startswith(top + "__")]
        for k in keys:
            self.files.pop(k).close()
            os.replace(os.path.join(self.out, k + ".jsonl.part"), os.path.join(self.out, k + ".jsonl"))
        self.progress["done"][top] = {k: self.counts[k] for k in keys}
        with open(self.progress_path, "w", encoding="utf-8") as f:
            json.dump(self.progress, f, indent=2)

    def run(self):
        for coll_ref in self._retry("list collections", lambda: list(self.db.collections())):
            top = coll_ref.id
            if top in self.progress["done"]:
                self.counts.update(self.progress["done"][top])
                print(f"{top}: already backed up ({self.progress['done'][top].get(top, 0)} documents)", flush=True)
                continue
            for name in os.listdir(self.out):  # leftovers of an interrupted run
                if name.endswith(".jsonl.part") and (name[:-11] == top or name.startswith(top + "__")):
                    os.remove(os.path.join(self.out, name))
            refs = self.collection(coll_ref)
            print(f"{top}: {self.counts[top]} documents", flush=True)
            self.subcollections(refs)
            self._finish(top)
        return self.counts


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True, help="an empty or new folder outside the repository")
    ap.add_argument("--resume", action="store_true", help="continue an interrupted backup in --out")
    ap.add_argument("--workers", type=int, default=16)
    ap.add_argument("--page", type=int, default=100, help="documents per read (smaller is safer on slow links)")
    a = ap.parse_args(argv)

    if inside_repo(a.out):
        ap.error("refusing: --out is inside the repository (the backup holds email and password fields)")
    if os.path.isdir(a.out) and os.listdir(a.out):
        if not a.resume:
            ap.error("refusing: --out exists and is not empty (use --resume to continue an interrupted backup)")
        if not os.path.exists(os.path.join(a.out, "progress.json")) and not any(
                n.endswith(".jsonl.part") for n in os.listdir(a.out)):
            ap.error("refusing: --out has no progress.json from this script; cannot resume")
    os.makedirs(a.out, exist_ok=True)

    from google.cloud import firestore
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    target = f"emulator {emulator}" if emulator else "LIVE (read-only)"
    print(f"Backing up project {a.project} from {target} into {a.out}", flush=True)
    started = _dt.datetime.now(_dt.timezone.utc)
    counts = Backup(firestore.Client(project=a.project), a.out, a.workers, a.page).run()
    manifest = {
        "project": a.project,
        "target": target,
        "finished_utc": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "last_run_started_utc": started.isoformat(),
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
