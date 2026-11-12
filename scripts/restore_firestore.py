"""Restore an R0 JSONL archive to the dedicated, disposable M1 Firestore emulator."""
import argparse
import base64
import hashlib
import http.client
import json
import math
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


HOST = "127.0.0.1:8185"
PROJECT = "demo-isr-recovery"
ROOT = f"projects/{PROJECT}/databases/(default)/documents"
LIMIT = 2_000_000  # bound both the commit and the read-back response


class RecoveryError(Exception):
    """Safe to display: messages never include archive content."""


def require(condition, message):
    if not condition:
        raise RecoveryError(message)


def unique_keys(pairs):
    result = dict(pairs)
    require(len(result) == len(pairs), "Duplicate JSON key.")
    return result


def document_path(path):
    require(isinstance(path, str), "Invalid document path.")
    parts = path.split("/")
    require(len(parts) % 2 == 0 and all(p and p not in (".", "..") for p in parts),
            "Invalid document path.")
    return path


def timestamp(value):
    # R0 used datetime.isoformat(), with the UTC offset and up to six fraction digits.
    date = datetime.fromisoformat(value)
    require(date.tzinfo is not None and re.search(r"\.\d{7,}", value) is None,
            "Unsupported timestamp precision or timezone.")
    return date.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def double(number):
    require(type(number) in (int, float), "Invalid numeric field.")
    number = float(number)
    if math.isnan(number):
        return "NaN"
    if math.isinf(number):
        return "Infinity" if number > 0 else "-Infinity"
    return number


def to_value(value):
    """Convert R0 JSON to the Firestore REST Value representation."""
    if value is None:
        return {"nullValue": None}
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        require(-(2**63) <= value < 2**63, "Integer outside Firestore range.")
        return {"integerValue": str(value)}
    if isinstance(value, float):
        return {"doubleValue": double(value)}
    if isinstance(value, str):
        return {"stringValue": value}
    if isinstance(value, list):
        return {"arrayValue": {"values": [to_value(v) for v in value]}}
    if "__type" not in value:
        return {"mapValue": {"fields": to_fields(value)}}

    tag = value["__type"]
    keys = value.keys() - {"__type"}
    if tag == "timestamp" and keys == {"value"}:
        return {"timestampValue": timestamp(value["value"])}
    if tag == "reference" and keys == {"path"}:
        return {"referenceValue": ROOT + "/" + document_path(value["path"])}
    if tag == "bytes" and keys == {"base64"}:
        data = base64.b64decode(value["base64"], validate=True)
        return {"bytesValue": base64.b64encode(data).decode("ascii")}
    if tag == "geopoint" and keys == {"latitude", "longitude"}:
        lat, lon = value["latitude"], value["longitude"]
        require(type(lat) in (int, float) and type(lon) in (int, float)
                and -90 <= lat <= 90 and -180 <= lon <= 180, "Invalid geopoint.")
        return {"geoPointValue": {"latitude": float(lat), "longitude": float(lon)}}
    if tag == "vector" and keys == {"values"} and isinstance(value["values"], list):
        dims = value["values"]
        require(1 <= len(dims) <= 2048, "Invalid vector dimension.")
        return {"mapValue": {"fields": {
            "__type__": {"stringValue": "__vector__"},
            "value": {"arrayValue": {"values": [{"doubleValue": double(v)} for v in dims]}}
        }}}
    raise RecoveryError("Unknown or malformed R0 type tag.")


def to_fields(data):
    require(isinstance(data, dict), "Document fields must be a map.")
    return {k: to_value(v) for k, v in data.items()}


def wire_bytes(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode("utf-8")


def digest(fields):
    # The REST encoder can omit empty/default members and shorten timestamp fractions.
    def normalize(v):
        if "mapValue" in v:
            return {"mapValue": {k: normalize(x) for k, x in v["mapValue"].get("fields", {}).items()}}
        if "arrayValue" in v:
            return {"arrayValue": [normalize(x) for x in v["arrayValue"].get("values", [])]}
        if "timestampValue" in v:
            return {"timestampValue": timestamp(v["timestampValue"])}
        if "geoPointValue" in v:
            p = v["geoPointValue"]
            return {"geoPointValue": [float(p.get(k, 0)) for k in ("latitude", "longitude")]}
        if "doubleValue" in v:
            return {"doubleValue": double(float(v["doubleValue"]))}
        return v

    canonical = json.dumps({k: normalize(v) for k, v in fields.items()}, sort_keys=True,
                           separators=(",", ":"), allow_nan=False)
    return hashlib.sha256(canonical.encode()).digest()


def archive_files(folder):
    manifest = json.loads((folder / "manifest.json").read_bytes(), object_pairs_hook=unique_keys)
    counts = manifest["documents"]
    require(manifest["script"] == "scripts/backup_firestore.py (R0)" and manifest["finished_utc"]
            and isinstance(counts, dict) and all(type(v) is int and v >= 0 for v in counts.values())
            and type(manifest["total"]) is int and manifest["total"] == sum(counts.values()),
            "Invalid final manifest or counts.")
    require(not any(folder.glob("*.part")), "Archive contains unfinished files.")
    files = {p.stem: p for p in folder.glob("*.jsonl")}
    require(counts.keys() <= files.keys(), "Manifest lists a missing collection file.")
    # The original encoder can create an empty file for an absent parent collection
    # without inserting a zero entry in its Counter. Never accept unlisted records.
    require(all(files[k].stat().st_size == 0 for k in files.keys() - counts.keys()),
            "Archive contains unlisted records.")
    return [(files[k], n) for k, n in counts.items()]


def records(files):
    for index, (file, count) in enumerate(files, 1):
        n = 0
        with file.open("rb") as stream:
            for n, line in enumerate(stream, 1):
                try:
                    row = json.loads(line, object_pairs_hook=unique_keys)
                    path = document_path(row["path"])
                    require(set(row) == {"path", "data"} and "__".join(path.split("/")[::2]) == file.stem,
                            "Record does not match its collection.")
                    fields = to_fields(row["data"])
                except (ValueError, TypeError, AttributeError, KeyError, OverflowError, RecoveryError):
                    raise RecoveryError(f"Invalid record in file {index}, line {n}.") from None
                yield path, fields
        require(n == count, f"Count mismatch in file {index}.")


class Emulator:
    def __init__(self):
        require(os.environ.get("FIRESTORE_EMULATOR_HOST") == HOST,
                f"Set FIRESTORE_EMULATOR_HOST to the dedicated emulator at {HOST}.")
        self.http = http.client.HTTPConnection(HOST, timeout=120)

    def post(self, method, body):
        self.http.request("POST", f"/v1/{ROOT}:{method}", wire_bytes(body),
                          {"Content-Type": "application/json", "Authorization": "Bearer owner"})
        response = self.http.getresponse()
        raw = response.read()
        require(response.status == 200, f"Emulator {method} failed (HTTP {response.status}).")
        return json.loads(raw)

    def restore_batch(self, docs, expected):
        writes = [{"update": doc, "currentDocument": {"exists": False}} for doc in docs]
        self.post("commit", {"writes": writes})
        remaining = {doc["name"] for doc in docs}
        for result in self.post("batchGet", {"documents": sorted(remaining)}):
            doc = result.get("found", {})
            name = doc.get("name")
            require(name in remaining, "Read-back document missing or unexpected.")
            path = name[len(ROOT) + 1:]
            require(digest(doc.get("fields", {})) == expected[path], "Read-back field mismatch.")
            remaining.remove(name)
        require(not remaining, "Incomplete read-back.")


def recover(folder, apply):
    files = archive_files(folder)
    expected = {}
    for path, fields in records(files):
        require(path not in expected, "Duplicate document path.")
        expected[path] = digest(fields)
    print(f"Validated {len(expected)} documents in {len(files)} manifest entries.", flush=True)
    if not apply:
        return

    emulator = Emulator()
    try:
        root = emulator.post("listCollectionIds", {"pageSize": 1})
        require(not root.get("collectionIds") and not root.get("nextPageToken"),
                "Recovery target must be empty. Restart the disposable emulator.")
        pending = set(expected)
        docs, size, verified = [], 0, 0
        for path, fields in records(files):
            require(path in pending and digest(fields) == expected[path], "Archive changed after validation.")
            pending.remove(path)
            doc = {"name": ROOT + "/" + path, "fields": fields}
            doc_size = len(wire_bytes(doc))
            if docs and (size + doc_size > LIMIT or len(docs) >= 150):
                emulator.restore_batch(docs, expected)
                verified += len(docs)
                if verified // 5000 != (verified - len(docs)) // 5000:
                    print(f"Verified {verified} documents.", flush=True)
                docs, size = [], 0
            docs.append(doc)
            size += doc_size
        require(not pending, "Archive changed after validation.")
        if docs:
            emulator.restore_batch(docs, expected)
            verified += len(docs)
        print(f"Restored and verified {verified} documents.", flush=True)
    finally:
        emulator.http.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backup", required=True, type=Path)
    parser.add_argument("--apply", action="store_true", help="write and verify the isolated copy")
    args = parser.parse_args()
    try:
        recover(args.backup, args.apply)
    except RecoveryError as error:
        print(error, file=sys.stderr)
        return 1
    except Exception as error:
        # SDK/JSON/network errors may contain private paths or field values.
        print(f"Recovery stopped ({type(error).__name__}). Check the archive and emulator.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
