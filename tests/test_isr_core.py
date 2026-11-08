"""Task A1 v2: the Python port scripts/isr_core.py on the shared fixture and edge cases.
The JS module is checked against the same fixture in functions/test/isr.test.js.
Run: python -m unittest discover -s tests"""
import json
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import isr_core as c  # noqa: E402

FX = json.load(open(os.path.join(ROOT, "tests", "fixtures", "isr_cases.json"), encoding="utf-8"))


class SharedFixture(unittest.TestCase):
    def test_relevance(self):
        for k in FX["relevance"]:
            self.assertAlmostEqual(c.relevance(k["c"], k["w"], k["clamp"]), k["expected"], places=12)

    def test_age(self):
        for k in FX["age"]:
            self.assertEqual(c.age_in_years(k["birthDate"], k["on"]), k["expected"])
        for k in FX["age_errors"]:
            with self.assertRaises(ValueError):
                c.age_in_years(k["birthDate"], k["on"])

    def test_expertise_and_sums(self):
        for k in FX["expertise"]:
            self.assertAlmostEqual(c.expertise(k["edu"], k["exp"], k["age"]), k["expected"], places=12)
        for k in FX["sums"]:
            self.assertAlmostEqual(c.education_sum(k["skills"], k["vectors"], k["issue"], k["adj"]), k["edu"], places=12)
            self.assertAlmostEqual(c.experience_sum(k["skills"], k["vectors"], k["issue"]), k["exp"], places=12)

    def test_normalize(self):
        for k in FX["normalize"]:
            for got, exp in zip(c.normalize_by_mean(k["values"]), k["expected"]):
                self.assertAlmostEqual(got, exp, places=12)
        for k in FX["normalize_errors"]:
            with self.assertRaises(ValueError):
                c.normalize_by_mean(k["values"])

    def test_isr_and_tally(self):
        for k in FX["isr_for_public"]:
            for got, exp in zip(c.isr_for_public(k["members"], k["weights"]), k["expected"]):
                self.assertAlmostEqual(got["isr"], exp["isr"], places=12)
        for k in FX["tally"]:
            got = c.tally(k["votes"], k["isr"], k["n"])
            self.assertEqual(got["winner"], k["expected"]["winner"])
            self.assertEqual(got["note"], k["expected"]["note"])


class HandChecked(unittest.TestCase):
    """Values computed by hand, independent of the fixture."""

    def test_all_equal_and_zero_normalise_to_one(self):
        self.assertEqual(c.normalize_by_mean([0, 0]), [1.0, 1.0])
        self.assertEqual(c.normalize_by_mean([3, 3, 3]), [1.0, 1.0, 1.0])

    def test_isr_by_hand(self):
        out = c.isr_for_public([{"uid": "a", "R": 0.6, "E": 1.0}, {"uid": "b", "R": 0.2, "E": 3.0}],
                               {"w_relevance": 0.5, "w_expertise": 0.2, "w_contribution": 0.3})
        # R mean 0.4 -> 1.5, 0.5; E mean 2.0 -> 0.5, 1.5; C = 1.0
        self.assertAlmostEqual(out[0]["isr"], 0.5 * 1.5 + 0.2 * 0.5 + 0.3, places=12)
        self.assertAlmostEqual(out[1]["isr"], 0.5 * 0.5 + 0.2 * 1.5 + 0.3, places=12)

    def test_tally_by_hand(self):
        t = c.tally({"a": 0, "b": 1, "c": 1, "d": 0}, {"a": 1.0, "b": 0.4, "c": 0.5}, 2)
        self.assertEqual(t["scores"], [1.0, 0.9])
        self.assertEqual(t["winner"], 0)
        self.assertEqual(t["excluded"], [{"uid": "d", "reason": "no ISR"}])


if __name__ == "__main__":
    unittest.main()
