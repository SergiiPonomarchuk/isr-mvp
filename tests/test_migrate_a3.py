"""Unit tests for scripts/migrate_a3.py (task A3, R16a). Run: python -m unittest discover -s tests"""
import math
import os
import sys
import unittest

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import migrate_a3 as m3  # noqa: E402

LOC = (47.55, 7.60)


def pt(meters):
    return [LOC[0] + math.degrees(meters / 6371e3), LOC[1]]


class FitWeights(unittest.TestCase):
    def setUp(self):
        rng = np.random.default_rng(1)
        self.X = np.round(rng.uniform(0, 1, size=(12, 4)), 3)
        self.w = (0.2, 0.5, 0.2, 0.1)
        self.y = np.round(self.X @ np.array(self.w), 3)

    def test_recovers_and_rounds(self):
        w, src = m3.fit_relevance_weights(self.X, self.y)
        self.assertEqual(src, "recovered")
        self.assertEqual(w, self.w)

    def test_prefers_issue_weights_when_they_reproduce(self):
        w, src = m3.fit_relevance_weights(self.X, self.y, self.w)
        self.assertEqual(src, "issue")
        w2, src2 = m3.fit_relevance_weights(self.X, self.y, (0.1, 0.7, 0.1, 0.1))
        self.assertEqual(src2, "recovered")
        self.assertEqual(w2, self.w)

    def test_constant_x_column_still_fixes_g(self):
        X = self.X.copy()
        X[:, 3] = 0.0  # nobody has a social tie
        y = np.round(X @ np.array(self.w), 3)
        w, _ = m3.fit_relevance_weights(X, y)
        self.assertAlmostEqual(w[1], 0.5, places=2)

    def test_unidentifiable_g_weight_is_refused(self):
        X = self.X.copy()
        X[:, 0] = 1.0
        X[:, 1] = 1.0  # D and G both constant: their split is unknown
        y = np.round(X @ np.array(self.w), 3)
        with self.assertRaises(ValueError):
            m3.fit_relevance_weights(X, y)

    def test_no_fit_is_refused(self):
        y = self.y.copy()
        y[0] += 0.2
        with self.assertRaises(ValueError):
            m3.fit_relevance_weights(self.X, y)


class Recompute(unittest.TestCase):
    def test_nearest_anchor_relevance_and_isr(self):
        users = {
            1: {"geography": [{"type": "home", "geo": pt(5000)}, {"type": "work", "geo": pt(10)}]},
            2: {"geography": [{"type": "home", "geo": pt(150)}]},
            3: {"geography": []},
        }
        members = [
            {"user_id": u, "D_score": 1.0, "S_score": 0.5, "X_score": 0.0,
             "normalized_experience": e, "normalized_contribution": 1.0}
            for u, e in ((1, 1.2), (2, 0.8), (3, 1.0))
        ]
        rw = (0.2, 0.5, 0.2, 0.1)
        out = m3.recompute_public(members, users, LOC, 100.0, 50.0, rw, (0.4, 0.3, 0.3))
        self.assertEqual(out[0]["G_anchor_type"], "work")
        self.assertEqual(out[0]["G_score"], 1.0)
        self.assertAlmostEqual(out[1]["G_score"], round(math.exp(-(50 ** 2) / (2 * 50 ** 2)), 3), places=3)
        self.assertIsNone(out[2]["G_anchor_type"])
        self.assertEqual(out[2]["G_score"], 0.0)
        rels = [0.2 + 0.5 * g + 0.1 for g in (1.0, math.exp(-0.5), 0.0)]
        mean = sum(rels) / 3
        self.assertAlmostEqual(out[0]["relevance_score"], round(rels[0], 3))
        self.assertAlmostEqual(out[0]["normalized_relevance"], round(rels[0] / mean, 3))
        self.assertAlmostEqual(out[0]["isr_score"], round(0.4 * rels[0] / mean + 0.3 * 1.2 + 0.3, 3))

    def test_members_without_isr_get_g_and_relevance_only(self):
        users = {1: {"geography": [{"type": "home", "geo": pt(0)}]}}
        out = m3.recompute_public([{"user_id": 1, "D_score": 1, "S_score": 0, "X_score": 0}],
                                  users, LOC, 100.0, 50.0, (0.5, 0.5, 0, 0), None)
        self.assertEqual(set(out[0]), {"G_score", "G_anchor_type", "relevance_score"})



class TextUserIds(unittest.TestCase):
    """Live R0 run: app-written member docs hold user ids as text ("123")."""

    def test_norm_uid(self):
        self.assertEqual(m3.norm_uid("123"), 123)
        self.assertEqual(m3.norm_uid(" 7 "), 7)
        self.assertEqual(m3.norm_uid(5), 5)
        self.assertEqual(m3.norm_uid("abc"), "abc")
        self.assertIsNone(m3.norm_uid(None))

    def test_public_with_text_ids_is_recomputed(self):
        users = {1: {"geography": [{"type": "home", "geo": pt(10)}]},
                 2: {"geography": [{"type": "work", "geo": pt(20)}]}}
        issues = {"P": {"location": {"latitude": LOC[0], "longitude": LOC[1]},
                        "mu_distance_meters": 100, "sigma_decay_meters": 50,
                        "w_demographic": 0.2, "w_geographic": 0.5, "w_semantic": 0.2, "w_social": 0.1}}
        members = [
            {"_doc_id": "P_1", "microcommunity_id": "P", "user_id": "1", "D_score": 1.0, "G_score": 1.0,
             "S_score": 0.5, "X_score": 0.0, "relevance_score": 0.8},
            {"_doc_id": "P_2", "microcommunity_id": "P", "user_id": "2", "D_score": 1.0, "G_score": 0.0,
             "S_score": 0.5, "X_score": 0.0, "relevance_score": 0.3},
        ]
        for m in members:  # what both loaders do
            m["user_id"] = m3.norm_uid(m["user_id"])
        p = m3.plan(members, issues, {}, users)
        self.assertEqual(p["skipped"], {})
        self.assertEqual(p["updates"]["P_2"]["G_anchor_type"], "work")
        self.assertEqual(p["updates"]["P_2"]["G_score"], 1.0)


if __name__ == "__main__":
    unittest.main()
