"""Task L1: the Python port of the lifecycle rules (scripts/migrate_l1.py) on the shared fixture,
and the migration plan on a small in-memory dataset.
The JS module is checked against the same fixture in functions/test/lifecycle.test.js.
Run: python -m unittest discover -s tests"""
import json
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import migrate_l1 as m  # noqa: E402

FX = json.load(open(os.path.join(ROOT, "tests", "fixtures", "lifecycle_cases.json"), encoding="utf-8"))


class SharedFixture(unittest.TestCase):
    def test_dates(self):
        for k in FX["add_days"]:
            self.assertEqual(m.add_days(*k["args"]), k["expected"], k["args"])
        for k in FX["add_months"]:
            self.assertEqual(m.add_months(*k["args"]), k["expected"], k["args"])
        for k in FX["is_expired"]:
            self.assertEqual(m.is_expired(*k["args"]), k["expected"], k["args"])
        for k in FX["extend_deadline"]:
            self.assertEqual(m.extend_deadline(*k["args"]), k["expected"], k["args"])
        for k in FX["chat_deadline"]:
            self.assertEqual(m.chat_deadline(*k["args"]), k["expected"], k["args"])

    def test_phase(self):
        for k in FX["phase_of"]:
            self.assertEqual(m.phase_of(k["disc"], k["issue"]), k["expected"], k)

    def test_voting_outcome(self):
        for k in FX["voting_outcome"]:
            r = m.voting_outcome(k["votes"], k["isr"], k["options"])
            self.assertEqual(r["result"], k["expected"]["result"], k["name"])
            self.assertEqual(r["reason"], k["expected"]["reason"], k["name"])
            self.assertAlmostEqual(r["share"], k["expected"]["share"], places=9, msg=k["name"])
            self.assertEqual(r["winner"], k["expected"]["winner"], k["name"])

    def test_deadline_outcome(self):
        for k in FX["deadline"]:
            r = m.deadline_outcome(k["topic"], k["today"])
            self.assertEqual(r["action"], k["expected"]["action"], k["name"])
            self.assertEqual(r["reason"], k["expected"]["reason"], k["name"])
            self.assertEqual(r["newEnds"], k["expected"]["newEnds"], k["name"])


class Plan(unittest.TestCase):
    def data(self):
        discussions = {
            "c1": {"status": None},                                  # seeded chat, no deadline
            "c2": {"ends": "2026-06-01", "options_v2": [{"title": "A"}]},  # chat, past deadline, 1 option
            "c3": {"ends": "2027-03-01"},                            # chat, later deadline: unchanged
            "v1": {},                                                # seeded voting topic
            "t1": {},                                                # seeded ToDo topic
            "x1": {"status": "inactive", "previous_status": "discussion"},
        }
        issues = {
            "v1": {"status": "in_process", "ends": "2026-06-09", "options": [{}, {}], "votes": {"1": 0}},
            "t1": {"status": "tasks", "ends": "2026-01-01"},
        }
        isr = {"v1": {"1": 2.0, "2": 1.0, "3": 1.0}}
        return discussions, issues, isr

    def test_prolong_and_status(self):
        p = m.plan(*self.data(), "2026-12-09")
        upd = {(c, i): d for c, i, d in p["updates"]}
        self.assertEqual(upd[("discussions", "c1")], {"ends": "2026-12-09"})
        self.assertEqual(upd[("discussions", "c2")], {"ends": "2026-12-09"})
        self.assertNotIn(("discussions", "c3"), upd)
        self.assertEqual(upd[("discussions", "v1")], {"ends": "2026-12-09", "status": "Voting"})
        self.assertEqual(upd[("issues", "v1")], {"ends": "2026-12-09"})
        self.assertEqual(upd[("discussions", "t1")], {"status": "approved"})
        self.assertNotIn(("issues", "t1"), upd)  # ToDo deadlines are not touched
        self.assertNotIn(("discussions", "x1"), upd)
        # Preview on 2026-12-10: c1 canceled (no options), c2 to voting, v1 to ToDo (2 of 4 = 50 %).
        self.assertEqual(p["preview"][("chat", "cancel", "no options")], 1)
        self.assertEqual(p["preview"][("chat", "to_voting", "options proposed")], 1)
        self.assertEqual(p["preview"][("voting", "to_todo", "winner")], 1)

    def test_second_run_changes_nothing(self):
        discussions, issues, isr = self.data()
        for coll, tid, fields in m.plan(discussions, issues, isr, "2026-12-09")["updates"]:
            (discussions if coll == "discussions" else issues)[tid].update(fields)
        self.assertEqual(m.plan(discussions, issues, isr, "2026-12-09")["updates"], [])

    def test_prolong_again(self):
        discussions, issues, isr = self.data()
        for coll, tid, fields in m.plan(discussions, issues, isr, "2026-12-09")["updates"]:
            (discussions if coll == "discussions" else issues)[tid].update(fields)
        upd = {(c, i): d for c, i, d in m.plan(discussions, issues, isr, "2027-01-15")["updates"]}
        self.assertEqual(upd[("issues", "v1")], {"ends": "2027-01-15"})
        self.assertEqual(upd[("discussions", "c1")], {"ends": "2027-01-15"})
        self.assertNotIn(("discussions", "c3"), upd)  # its own deadline (2027-03-01) is later


if __name__ == "__main__":
    unittest.main()
