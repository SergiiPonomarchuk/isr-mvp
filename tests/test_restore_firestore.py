"""R0 archive recovery tests. Optional integration runs only on the isolated emulator."""
import base64
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import restore_firestore as restore


class RecoveryTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.folder = Path(temp.name)

    def archive(self, rows):
        grouped = {}
        for path, data in rows:
            key = "__".join(path.split("/")[::2])
            grouped.setdefault(key, []).append(json.dumps({"path": path, "data": data}))
        counts = {key: len(lines) for key, lines in grouped.items()}
        for key, lines in grouped.items():
            (self.folder / (key + ".jsonl")).write_text("\n".join(lines) + "\n", encoding="utf-8")
        (self.folder / "manifest.json").write_text(json.dumps({
            "script": "scripts/backup_firestore.py (R0)", "finished_utc": "2026-11-07T00:00:00Z",
            "documents": counts, "total": sum(counts.values())
        }), encoding="utf-8")

    def test_full_preflight_rejects_before_connecting(self):
        cases = [
            [("things/1", {}), ("things/1", {})],
            [("things/1", {}), ("things/2", {"bad": {"__type": "unknown"}})],
            [("things/1", {"nested": [{"__type": "bytes", "base64": "?"}]})],
            [("things", {})],
        ]
        with patch.object(restore, "Emulator", side_effect=AssertionError):
            for rows in cases:
                with self.subTest(rows=rows):
                    self.archive(rows)
                    with self.assertRaises(restore.RecoveryError):
                        restore.recover(self.folder, True)

    def test_count_file_and_shape_must_match(self):
        self.archive([("things/1", {})])
        f = self.folder / "things.jsonl"
        original = f.read_bytes()
        for broken in (b"", original.replace(b"things/1", b"other/1"), b'{"path":"things/1","data":{"x":1,"x":2}}'):
            f.write_bytes(broken)
            with self.assertRaises(restore.RecoveryError):
                restore.recover(self.folder, False)
        f.unlink()
        with self.assertRaises(restore.RecoveryError):
            restore.archive_files(self.folder)

    def test_unfinished_or_unlisted_data_is_rejected(self):
        self.archive([("things/1", {})])
        extra = self.folder / "other.jsonl"
        extra.write_text('{"path":"other/2","data":{}}', encoding="utf-8")
        with self.assertRaisesRegex(restore.RecoveryError, "unlisted"):
            restore.archive_files(self.folder)
        extra.unlink()
        (self.folder / "things.jsonl.part").touch()
        with self.assertRaisesRegex(restore.RecoveryError, "unfinished"):
            restore.archive_files(self.folder)

    def test_dry_run_does_not_connect_and_preview_cannot_be_targeted(self):
        self.archive([("missing/parent/children/one", {"value": None})])
        (self.folder / "missing.jsonl").touch()
        with patch.object(restore, "Emulator", side_effect=AssertionError):
            restore.recover(self.folder, False)
        for host in ("", "127.0.0.1:8080", "firestore.googleapis.com"):
            with patch.dict(os.environ, FIRESTORE_EMULATOR_HOST=host), self.assertRaises(restore.RecoveryError):
                restore.Emulator()

    def test_readback_checks_types_and_every_path(self):
        docs = [{"name": restore.ROOT + "/things/1", "fields": {"n": {"integerValue": "1"}}}]
        expected = {"things/1": restore.digest(docs[0]["fields"])}
        for reply in ([], [{"missing": docs[0]["name"]}],
                      [{"found": {**docs[0], "fields": {"n": {"doubleValue": 1}}}}]):
            with patch.dict(os.environ, FIRESTORE_EMULATOR_HOST=restore.HOST):
                emulator = restore.Emulator()
            with patch.object(emulator, "post", side_effect=[{}, reply]), self.assertRaises(restore.RecoveryError):
                emulator.restore_batch(docs, expected)

    @unittest.skipUnless(os.getenv("ISR_RECOVERY_FIXTURE") == "1", "dedicated recovery emulator only")
    def test_sdk_round_trip_and_existing_target_refusal(self):
        from google.cloud import firestore
        from google.cloud.firestore_v1.vector import Vector
        from google.api_core.datetime_helpers import DatetimeWithNanoseconds
        import backup_firestore

        self.assertEqual(os.environ.get("FIRESTORE_EMULATOR_HOST"), restore.HOST)
        db = firestore.Client(project=restore.PROJECT)
        fields = {
            "nested": [{"int": 1, "double": 1.0, "bool": True, "null": None, "text": "μ"}],
            "bytes": base64.b64decode("AP8="), "point": firestore.GeoPoint(0, -7.1),
            "when": DatetimeWithNanoseconds.from_rfc3339("2026-11-07T02:03:04.123456Z"),
            "ref": db.document("absent/parent"), "vector": Vector([0.5, 0.0]),
            "a.b": {"empty": {}, "array": []}, "special": float("inf")
        }
        path = "absent/parent/child/one"
        self.archive([(path, backup_firestore.encode(fields))])
        restore.recover(self.folder, True)
        actual = db.document(path).get().to_dict()
        self.assertEqual(fields, actual)
        self.assertIsInstance(actual["vector"], Vector)
        self.assertIs(type(actual["nested"][0]["double"]), float)
        self.assertFalse(db.document("absent/parent").get().exists)
        with self.assertRaisesRegex(restore.RecoveryError, "empty"):
            restore.recover(self.folder, True)
