"""Task A1b: the expertise placeholder for publics whose members have no E and no ISR
(scripts/migrate_a1b.py), on a small in-memory dataset.
Run: python -m unittest discover -s tests"""
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import migrate_a1b as m  # noqa: E402


def member(pub, uid, r, e=None, isr=None):
    d = {"_id": f"{pub}_{uid}", "microcommunity_id": pub, "user_id": uid, "relevance_score": r}
    if e is not None:
        d["expertise_score"] = e
    if isr is not None:
        d["isr_score"] = isr
    return d


class Plan(unittest.TestCase):
    def data(self):
        members = [
            member("P1", 1, 0.2), member("P1", 2, 0.4), member("P1", 3, 0.6),        # no E, no ISR
            member("P2", 1, 0.5, 1.0, 1.1), member("P2", 4, 0.5, 2.0, 1.3),          # complete
            member("P3", 5, 0.5), member("P3", 6, 0.5, 1.0, 1.0),                    # mixed
            member("P4", 7, 0.3), member("P4", 8, 0.9),                              # no E; weights from the discussion
        ]
        mcs = {"P1": {"issue_id": "t1"}, "P2": {"issue_id": "t2"}, "P3": {"issue_id": "t3"}, "P4": {"issue_id": "t4"}}
        discussions = {"t1": {"relevance_scores": {"1": 0.2, "2": 0.4, "3": 0.6}, "w_relevance": 0.9, "w_expertise": 0.05, "w_contribution": 0.05},
                       "t4": {"relevance_scores": {"7": 0.3, "8": 0.9}, "w_relevance": 0.6, "w_expertise": 0.2, "w_contribution": 0.2}}
        issues = {"t1": {"w_relevance": 0.5, "w_expertise": 0.2, "w_contribution": 0.3}}
        return members, mcs, discussions, issues

    def test_placeholder_values(self):
        p = m.plan(*self.data())
        upd = {(c, i): d for c, i, d in p["updates"]}
        # P1: mean R 0.4 -> R_norm 0.5, 1.0, 1.5; E_norm 1.0; ISR = 0.5 * R_norm + 0.2 * 1 + 0.3 * 1 (issue weights)
        for uid, rn in ((1, 0.5), (2, 1.0), (3, 1.5)):
            f = upd[("microcommunity_members", f"P1_{uid}")]
            self.assertEqual(f["expertise_score"], 0.0)
            self.assertEqual(f["expertise_source"], "no_issue_vector")
            self.assertEqual(f["normalized_relevance"], rn)
            self.assertEqual(f["normalized_experience"], 1.0)
            self.assertEqual(f["normalized_contribution"], 1.0)
            self.assertEqual(f["contribution_source"], "constant")
            self.assertAlmostEqual(f["isr_score"], round(0.5 * rn + 0.5, 3))
            self.assertNotIn("education_expertise", f)
        # maps: the discussion gets the ISR map; the issue doc t1 has no maps -> rewritten as well
        self.assertEqual(upd[("discussions", "t1")]["isr_scores"], {"1": 0.75, "2": 1.0, "3": 1.25})
        self.assertIn(("issues", "t1"), upd)
        row = next(r for r in p["publics"] if r["public"] == "P1")
        self.assertEqual(row["weights_source"], "issue")

    def test_weights_fallback_and_untouched_publics(self):
        p = m.plan(*self.data())
        upd = {(c, i): d for c, i, d in p["updates"]}
        row = next(r for r in p["publics"] if r["public"] == "P4")
        self.assertEqual(row["weights_source"], "discussion")
        # P4: mean R 0.6 -> R_norm 0.5, 1.5; ISR = 0.6 * R_norm + 0.2 + 0.2
        self.assertAlmostEqual(upd[("microcommunity_members", "P4_7")]["isr_score"], 0.7)
        self.assertAlmostEqual(upd[("microcommunity_members", "P4_8")]["isr_score"], 1.3)
        self.assertFalse(any(i.startswith("P2_") for c, i, _ in p["updates"] if c == "microcommunity_members"))
        self.assertFalse(any(i.startswith("P3_") for c, i, _ in p["updates"] if c == "microcommunity_members"))
        self.assertEqual([s[0] for s in p["skipped"]], ["P3"])
        self.assertEqual(m.weights_for("nothing", {}, {})[1], "default")

    def test_second_run_changes_nothing(self):
        members, mcs, discussions, issues = self.data()
        byid = {x["_id"]: x for x in members}
        docs = {"discussions": discussions, "issues": issues}
        for coll, doc_id, fields in m.plan(members, mcs, discussions, issues)["updates"]:
            if coll == "microcommunity_members":
                byid[doc_id].update(fields)
            else:
                docs[coll].setdefault(doc_id, {}).update(fields)
        p2 = m.plan(members, mcs, discussions, issues)
        self.assertEqual(p2["updates"], [])
        self.assertEqual([s[0] for s in p2["skipped"]], ["P3"])

    def test_report_names_no_personal_fields(self):
        text = m.report(m.plan(*self.data()), "test", False)
        self.assertIn("| P1 | t1 | 3 |", text)
        self.assertNotIn("displayName", text)


if __name__ == "__main__":
    unittest.main()
