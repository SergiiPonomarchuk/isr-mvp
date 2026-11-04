"""Task A3, AC3 and AC4b: the Python port in relevance_evaluator.py agrees with
functions/geo.js and functions/demographics.js on the shared fixture, and path B
gives the same G as before when the nearest anchor is home.
Run: python -m unittest discover -s tests"""
import importlib.util
import json
import math
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import relevance_evaluator as rev  # noqa: E402

FIXTURE = json.load(open(os.path.join(ROOT, "tests", "fixtures", "a3_d_g_cases.json"), encoding="utf-8"))


def load_original():
    """The pre-A3 evaluator, if a copy is given in A3_ORIGINAL_EVALUATOR (optional)."""
    path = os.environ.get("A3_ORIGINAL_EVALUATOR")
    if not path or not os.path.exists(path):
        return None
    spec = importlib.util.spec_from_file_location("rev_orig", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def home_only_g(user, loc, affection_km):
    """The as-built path B G (home anchor only), re-stated for AC3."""
    home = next((g for g in user.get("geography", []) if g.get("type") == "home"), None)
    if home is None or "geo" not in home:
        return 0.0
    d = rev.haversine_distance(home["geo"][0], home["geo"][1], loc[0], loc[1])
    mu = float(affection_km) * 1000.0
    sigma = mu * 0.5
    return 1.0 if d <= mu else float(math.exp(-((d - mu) ** 2) / (2.0 * sigma ** 2)))


class SharedFixture(unittest.TestCase):
    def test_g_cases(self):
        for c in FIXTURE["g_cases"]:
            near = rev.nearest_anchor(c["geography"], c["location"])
            if c["expected"] is None:
                self.assertIsNone(near, c["name"])
                continue
            self.assertEqual(near[1], c["expected"]["type"], c["name"])
            self.assertAlmostEqual(near[0], c["expected"]["distance"], places=6, msg=c["name"])
            self.assertAlmostEqual(rev.g_score(near[0], c["mu"], c["sigma"]), c["expected"]["g"], places=9, msg=c["name"])

    def test_d_cases(self):
        for c in FIXTURE["d_cases"]:
            score, match, bypass = rev.evaluate_demographic_rules(c["user"], c["criteria"], FIXTURE["now_year"])
            self.assertEqual(score, c["expected"]["score"], c["name"])
            self.assertEqual(match, c["expected"]["match"], c["name"])
            self.assertEqual(bypass, c["expected"]["bypass"], c["name"])


class PathB(unittest.TestCase):
    loc = [47.55, 7.60]

    def user(self, *geo):
        return {"geography": list(geo)}

    def pt(self, meters):
        return [self.loc[0] + math.degrees(meters / 6371e3), self.loc[1]]

    def test_home_nearest_unchanged(self):  # AC3
        for d in (0, 20, 30, 45, 80, 200):
            u = self.user({"type": "home", "geo": self.pt(d)}, {"type": "work", "geo": self.pt(d + 500)})
            self.assertAlmostEqual(rev.evaluate_geographics(u, self.loc, 0.03), home_only_g(u, self.loc, 0.03), places=12)

    def test_work_nearer_counts(self):
        u = self.user({"type": "home", "geo": self.pt(5000)}, {"type": "work", "geo": self.pt(10)})
        self.assertEqual(home_only_g(u, self.loc, 0.03), 0.0)
        self.assertEqual(rev.evaluate_geographics(u, self.loc, 0.03), 1.0)

    def test_work_only_user_now_counts(self):
        u = self.user({"type": "work", "geo": self.pt(10)})
        self.assertEqual(rev.evaluate_geographics(u, self.loc, 0.03), 1.0)

    def test_no_anchor_and_no_location(self):
        self.assertEqual(rev.evaluate_geographics(self.user(), "not a location", 0.03), 0.0)
        u = self.user({"type": "home", "geo": self.pt(10)})
        self.assertEqual(rev.evaluate_geographics(u, None, 0.03), 1.0)

    def test_place_match_in_path_b_d(self):
        u = {"geography": [{"type": "work", "place": "Argo Industry", "geo": self.pt(9000)}], "post": [], "skills": []}
        self.assertEqual(rev.evaluate_demographics(u, "Parking", "childcare.daycare", {"places": ["Argo Industry"]}), 1.0)
        self.assertEqual(rev.evaluate_demographics(u, "Parking", "childcare.daycare"), 0.1)  # as built

    def test_against_pre_a3_copy(self):
        orig = load_original()
        if orig is None:
            self.skipTest("set A3_ORIGINAL_EVALUATOR to the pre-A3 file to run")
        for d in (0, 25, 40, 90, 400):
            u = self.user({"type": "home", "geo": self.pt(d)})
            self.assertAlmostEqual(rev.evaluate_geographics(u, self.loc, 0.03),
                                   orig.evaluate_geographics(u, self.loc, 0.03), places=12)


if __name__ == "__main__":
    unittest.main()
