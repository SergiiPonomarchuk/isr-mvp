"""Task P1: the profile repair rules (scripts/migrate_p1.py) on a small in-memory dataset; the
text model is mocked. Run: python -m unittest discover -s tests"""
import argparse
import json
import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import migrate_p1 as m  # noqa: E402


def edu(i, level, spec="Engineering", year=None):
    return {"type": "education", "id": i, "educationLevel": level, "name": "University of Andim",
            "specialization": spec, "graduationYear": year}


def work(i, comment="An older sibling who works as a designer"):
    return {"type": "work experience", "id": i, "time": 1, "name": None, "specialization": None, "comment": comment}


def activity(i, name="Cycling"):
    return {"type": "activity", "id": i, "name": name, "time": 1}


def user(uid, birth, skills, job="Plant Operator", level=None):
    return {"_id": str(uid), "uid": uid, "birthDate": birth, "displayName": f"Person {uid}", "skills": skills,
            "post": [{"job": job, "department": "Production", "place": "Andim", "educationLevel": level, "salary": 30000}],
            "features": [], "geography": [], "socialRelations": [], "gender": "Female"}


def fake_output(inputs, years=5, bad_uid=None):
    people = []
    for i in inputs:
        entries = [{"id": w["id"], "title": "Plant operator", "field": "Mechanics", "years": years,
                    "description": "Ran and serviced the bottling line of a regional food plant."} for w in i["work_experience"]]
        if i["uid"] == bad_uid:
            entries = entries[1:]
        people.append({"uid": i["uid"], "entries": entries})
    return json.dumps({"people": people})


class Education(unittest.TestCase):
    def test_graduation_age_by_level_with_a_small_spread(self):
        for uid in range(1, 60):
            skills, _ = m.repair_education([edu(1, "Bachelor", year=2000)], uid, "1980-05-01")
            self.assertIn(skills[0]["graduationYear"] - 1980, (21, 22, 23))
            self.assertNotIn("in_progress", skills[0])
        offsets = {m.person_offset(uid) for uid in range(1, 60)}
        self.assertEqual(offsets, {-1, 0, 1})

    def test_levels_increase_and_a_second_degree_comes_later(self):
        skills, changes = m.repair_education(
            [edu(3, "Master", year=1), edu(1, "Bachelor", "Law", 1), edu(2, "Bachelor", "IT", 1), activity(4)], 7, "1970-01-01")
        by_id = {s["id"]: s for s in skills}
        off = m.person_offset(7)
        self.assertEqual(by_id[1]["graduationYear"], 1970 + 22 + off)
        self.assertEqual(by_id[2]["graduationYear"], by_id[1]["graduationYear"] + 2)
        self.assertGreater(by_id[3]["graduationYear"], by_id[2]["graduationYear"])
        self.assertEqual(by_id[4], activity(4))
        self.assertEqual(len(changes), 3)

    def test_a_future_graduation_is_kept_and_marked_in_progress(self):
        skills, _ = m.repair_education([edu(1, "PhD", year=2020)], 5, "2002-03-01")   # 28 +- 1 -> 2029-2031
        self.assertGreater(skills[0]["graduationYear"], 2026)
        self.assertIs(skills[0]["in_progress"], True)

    def test_unknown_level_and_no_birth_date_are_left_alone(self):
        s = [edu(1, "Secondary", year=1999)]
        self.assertEqual(m.repair_education(s, 1, "1980-01-01")[0], s)
        s = [edu(1, "Bachelor", year=1999)]
        self.assertEqual(m.repair_education(s, 1, "not a date")[0], s)


class JobLevel(unittest.TestCase):
    def test_highest_completed_education_or_null(self):
        skills = [edu(1, "College", year=2000), edu(2, "Master", year=2005), edu(3, "PhD", year=2030) | {"in_progress": True}]
        self.assertEqual(m.highest_completed_level(skills), "Master")
        self.assertEqual(m.repair_post([{"job": "x", "educationLevel": "None"}], skills)[0]["educationLevel"], "Master")
        self.assertIsNone(m.repair_post([{"job": "child", "educationLevel": "College"}], [activity(1)])[0]["educationLevel"])
        self.assertEqual(m.repair_post([], skills), [])


class Years(unittest.TestCase):
    def test_limit_age_minus_16(self):
        self.assertEqual(m.max_total_years("1990-12-01"), 19)          # 35 on 2026-11-10, minus 16
        ys, scaled = m.limit_years([20, 20, 10], 25)
        self.assertTrue(scaled)
        self.assertLessEqual(sum(ys), 25)
        self.assertEqual(ys, [10.0, 10.0, 5.0])
        self.assertEqual(m.limit_years([0.2, 3.04], 30), ([0.5, 3.0], False))

    def test_stored_as_a_number(self):
        self.assertEqual(m.num(6.0), 6)
        self.assertIsInstance(m.num(6.0), int)
        self.assertEqual(m.num(2.04), 2)
        self.assertEqual(m.num(2.46), 2.5)


class ModelOutput(unittest.TestCase):
    def inp(self):
        u = user(11, "1980-01-01", [edu(1, "Bachelor", year=2003), work(2), work(5)])
        return m.person_input(u, m.repair_education(u["skills"], 11, u["birthDate"])[0])

    def test_input_has_the_facts_and_no_names(self):
        i = self.inp()
        self.assertEqual([w["id"] for w in i["work_experience"]], [2, 5])
        self.assertEqual(i["max_total_years"], 30)
        self.assertNotIn("Person", json.dumps(i))
        self.assertNotIn("University", json.dumps(i))

    def test_validation(self):
        i = self.inp()
        ok, bad = m.parse_output(fake_output([i]), [i])
        self.assertEqual(sorted(ok), ["11"])
        ok, bad = m.parse_output(fake_output([i], bad_uid=11), [i])
        self.assertIn("11", bad)
        ok, bad = m.parse_output("not json", [i])
        self.assertIn("unreadable", bad["11"][0])
        e, err = m.validate_person(i, {"entries": [{"id": 2, "title": "T", "field": "F", "years": -1, "description": "x" * 30},
                                                    {"id": 5, "title": "", "field": "F", "years": 2, "description": "short"}]})
        self.assertIsNone(e)
        self.assertEqual(len(err), 3)


class Plan(unittest.TestCase):
    def data(self):
        return [
            user(1, "1980-06-01", [edu(1, "Bachelor", year=2003), work(2), work(3), activity(4)], level=None),
            user(2, "1999-02-01", [edu(1, "Master", year=2022), work(2)], job="unemployed", level="College"),
            user(3, "2015-01-01", [activity(1)], job="child"),
            {"_id": "None", "uid": None, "displayName": "x", "socialRelations": []},
        ]

    def generated(self, users, years=5):
        out = {}
        for u in users:
            if "skills" not in u:
                continue
            skills, _ = m.repair_education(u["skills"], u["uid"], u["birthDate"])
            i = m.person_input(u, skills)
            if i["work_experience"]:
                ok, _ = m.parse_output(fake_output([i], years=years), [i])
                out[str(u["uid"])] = {"uid": str(u["uid"]), "input_sha256": m.sha256(m.canon(i)), "entries": ok[str(u["uid"])]}
        return out

    def test_the_plan(self):
        users = self.data()
        p = m.plan(users, self.generated(users, years=6))
        self.assertEqual(p["deletes"], ["None"])
        upd = dict(p["updates"])
        s1 = {s["id"]: s for s in upd["1"]["skills"]}
        self.assertEqual(set(s1), {1, 2, 3, 4})                                    # ids kept
        self.assertEqual((s1[2]["name"], s1[2]["specialization"], s1[2]["time"]), ("Plant operator", "Mechanics", 6))
        self.assertTrue(s1[2]["comment"].startswith("Ran and serviced"))
        self.assertEqual(s1[4], activity(4))                                       # activities unchanged
        self.assertEqual(upd["1"]["post"][0]["educationLevel"], "Bachelor")
        # uid 2 is 27: limit 11, one entry of 6 years; the Master (24 +- 1) is done -> job level Master
        self.assertEqual(upd["2"]["post"][0]["educationLevel"], "Master")
        self.assertNotIn("3", upd)                                                 # the child: nothing to change
        self.assertEqual(p["pending"], [])
        self.assertEqual(p["stats"]["over the years limit"], 0)

    def test_years_scaled_to_the_limit(self):
        users = self.data()[1:2]                                                   # 27 years old: limit 11
        p = m.plan(users, self.generated(users, years=40))
        we = [s for s in dict(p["updates"])["2"]["skills"] if s["type"] == "work experience"]
        self.assertEqual(we[0]["time"], 11)
        self.assertEqual(p["stats"]["people whose years were scaled down"], 1)

    def test_pending_and_a_second_run_changes_nothing(self):
        users = self.data()
        p = m.plan(users, {})
        self.assertEqual(sorted(p["pending"]), [1, 2])
        gen = self.generated(users)
        p = m.plan(users, gen)
        after = [v for v in p["after"].values()]
        p2 = m.plan(after, gen)
        self.assertEqual(p2["updates"], [])
        self.assertEqual(p2["deletes"], [])
        self.assertEqual(p2["stats"]["work experience already repaired"], 2)

    def test_a_changed_input_is_not_applied(self):
        users = self.data()
        gen = self.generated(users)
        users[0]["skills"][1]["comment"] = "A different note"
        p = m.plan(users, gen)
        self.assertEqual(p["changed_input"], [1])

    def test_packs(self):
        users = self.data()
        p = m.plan(users, self.generated(users))
        packs = m.build_packs(list(p["after"].values()))
        self.assertEqual(len(packs), 1)
        self.assertEqual([x["uid"] for x in packs[0]["users"]], [1, 2, 3])
        self.assertEqual(set(packs[0]["users"][0]), set(m.PACK_FIELDS))


class Generate(unittest.TestCase):
    def test_batches_retry_and_resume(self):
        users = [user(uid, "1980-01-01", [edu(1, "Bachelor", year=2003), work(2)]) for uid in range(1, 6)]
        calls = []

        def caller(prompt, key):
            lines = [json.loads(x) for x in prompt.split("People (JSON, one per line):\n")[1].strip().splitlines()]
            calls.append([x["uid"] for x in lines])
            bad = 3 if len(lines) > 1 else None                                   # uid 3 fails in its batch only
            return fake_output(lines, bad_uid=bad), {"total_tokens": 100}, "STOP"

        with tempfile.TemporaryDirectory() as d:
            args = argparse.Namespace(gen_dir=d, limit=None, batch=3, max_requests=10)
            s = m.generate(users, args, caller=caller, sleep=lambda x: None)
            self.assertEqual(s["people generated"], 5)
            self.assertEqual(s["requests"], 3)                                    # 3 + 2 people, then uid 3 alone
            self.assertIn([3], calls)
            self.assertEqual(len(m.read_jsonl(os.path.join(d, m.CALLS_FILE))), 3)
            prompt = m.read_jsonl(os.path.join(d, m.CALLS_FILE))[0]["prompt"]
            self.assertIn("as the person's OWN work", prompt)
            s2 = m.generate(users, args, caller=caller, sleep=lambda x: None)    # resume: nothing left
            self.assertEqual(s2["requests"], 0)
            self.assertEqual(sorted(m.load_generated(d), key=int), ["1", "2", "3", "4", "5"])

    def test_request_limit(self):
        users = [user(uid, "1980-01-01", [work(2)]) for uid in range(1, 6)]
        with tempfile.TemporaryDirectory() as d:
            args = argparse.Namespace(gen_dir=d, limit=None, batch=1, max_requests=2)
            s = m.generate(users, args, caller=lambda p, k: (fake_output(
                [json.loads(x) for x in p.split("line):\n")[1].strip().splitlines()]), {}, "STOP"), sleep=lambda x: None)
            self.assertEqual(s["requests"], 2)
            self.assertEqual(s["stopped at the request limit"], 1)

    def test_redact(self):
        self.assertEqual(m.redact("bad key abc123 at x?key=abc123&a=1", "abc123"), "bad key [redacted] at x?key=[redacted]&a=1")


if __name__ == "__main__":
    unittest.main()
