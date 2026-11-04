"""Unit tests for scripts/expertise.py (task A2, AC2). Run: python -m unittest discover -s tests"""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts"))

import expertise as ex  # noqa: E402


class AgeTests(unittest.TestCase):
    def test_completed_years(self):
        self.assertEqual(ex.age_in_years("1990-06-15", "2025-06-14"), 34)
        self.assertEqual(ex.age_in_years("1990-06-15", "2025-06-15"), 35)
        self.assertEqual(ex.age_in_years("1990-06-15", "2025-06-28T16:45:00"), 35)

    def test_floor(self):
        self.assertAlmostEqual(ex.age_floor(15), 0.5)
        self.assertAlmostEqual(ex.age_floor(24), 0.8)
        self.assertAlmostEqual(ex.age_floor(30), 1.0)
        self.assertAlmostEqual(ex.age_floor(80), 1.0)  # never above 1, never falls with age

    def test_birth_date_required(self):
        for bad in (None, "", "1990", "05/01/1971", 1971):
            with self.assertRaises(ValueError):
                ex.age_in_years(bad, "2025-01-01")

    def test_registration_before_birth(self):
        with self.assertRaises(ValueError):
            ex.age_in_years("2026-01-01", "2025-01-01")

    def test_registration_date_required(self):
        with self.assertRaises(ValueError):
            ex.age_in_years("1990-01-01", None)


class DocsWorkedExamples(unittest.TestCase):
    """docs/ISR-Expertise-Assessment-v1.md, sections 2.2 and Part 7."""

    def test_vocational_locksmith_adult(self):  # 2.2: max(1.0, 0.08) = 1.0
        self.assertAlmostEqual(ex.education_part(0.04 * 2, 40), 1.0)

    def test_phd_above_floor(self):  # 2.2: 0.548 * 10 = 5.48
        self.assertAlmostEqual(ex.education_part(0.548 * 10, 40), 5.48)

    def test_lisa(self):  # Example 1, age 32: 1.0 + 0.16 = 1.16
        self.assertAlmostEqual(ex.expertise(0.216, 0.16, 32), 1.16)

    def test_cofounder(self):  # Example 4: 1.0 + 2.25 = 3.25
        self.assertAlmostEqual(ex.expertise(0.0, 2.25, 35), 3.25)

    def test_volunteer_age_24(self):  # Example 4: 0.8 + 0.375 = 1.175
        self.assertAlmostEqual(ex.expertise(0.161, 0.375, 24), 1.175)

    def test_maria_two_records(self):  # Example 2: education 3.78 + 0.916 above the floor
        self.assertAlmostEqual(ex.expertise(3.78 + 0.916, 7.84 + 5.52, 33), 18.056)


class ComputationTests(unittest.TestCase):
    def test_activity_skills_do_not_count(self):
        v = [1.0, 0.0]
        skills = [
            {"id": 1, "type": "activity", "name": "land holding"},
            {"id": 2, "type": "education", "educationLevel": "Bachelor"},
            {"id": 3, "type": "work experience", "time": 5},
        ]
        vecs = {"1": v, "2": v, "3": v}
        self.assertAlmostEqual(ex.education_sum(skills, vecs, v), 4.0)
        self.assertAlmostEqual(ex.experience_sum(skills, vecs, v), 5.0)

    def test_cbc_exponent(self):
        issue = [1.0, 0.0]
        rec = [0.5, (1 - 0.25) ** 0.5]  # cos = 0.5
        skills = [{"id": 1, "type": "education", "educationLevel": "PhD"}]
        self.assertAlmostEqual(ex.education_sum(skills, {"1": rec}, issue), 0.5 ** 0.5 * 10)
        self.assertAlmostEqual(ex.education_sum(skills, {"1": rec}, issue, 1.2), 0.5 ** 0.6 * 10)

    def test_no_issue_vector(self):
        self.assertEqual(ex.education_sum([{"id": 1, "type": "education"}], {"1": [1.0]}, None), 0.0)

    def test_recompute_public_and_idempotence(self):
        members = [
            {"user_id": 1, "education_expertise": 0.2, "experience_expertise": 1.0,
             "relevance_score": 0.6, "normalized_contribution": 1.0},
            {"user_id": 2, "education_expertise": 3.0, "experience_expertise": 0.0,
             "relevance_score": 0.2, "normalized_contribution": 1.0},
        ]
        ages = {1: 45, 2: 21}
        out = ex.recompute_public(members, (0.4, 0.3, 0.3), ages)
        self.assertEqual(out[0]["expertise_score"], 2.0)   # 1.0 floor + 1.0
        self.assertEqual(out[1]["expertise_score"], 3.0)   # education above 0.7 floor
        self.assertEqual(out[0]["normalized_experience"], 0.8)
        self.assertEqual(out[0]["isr_score"], round(0.4 * 1.5 + 0.3 * 0.8 + 0.3, 3))
        # Running again on the stored result gives the same values.
        again = [dict(m, education_expertise=o["education_expertise"]) for m, o in zip(members, out)]
        self.assertEqual(ex.recompute_public(again, (0.4, 0.3, 0.3), ages), out)

    def test_fit_isr_weights(self):
        ms = [{"isr_score": 0.4 * r + 0.2 * e + 0.4, "normalized_relevance": r,
               "normalized_experience": e, "normalized_contribution": 1.0}
              for r, e in ((1.2, 0.5), (0.8, 1.5), (1.0, 1.0))]
        self.assertEqual(ex.fit_isr_weights(ms), (0.4, 0.2, 0.4))
        ms[0]["isr_score"] += 0.1
        with self.assertRaises(ValueError):
            ex.fit_isr_weights(ms)


if __name__ == "__main__":
    unittest.main()
