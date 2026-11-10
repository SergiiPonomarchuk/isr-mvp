"""Task A4 phase C: real E for the A1b publics (scripts/migrate_a4.py), on a small in-memory dataset.
The embedding API is mocked. Run: python -m unittest discover -s tests"""
import math
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import ai_config  # noqa: E402
import embed_people  # noqa: E402
import expertise as X  # noqa: E402
import isr_core  # noqa: E402
import migrate_a4 as m  # noqa: E402

DIMS = 4


def unit(*v):
    n = math.sqrt(sum(x * x for x in v))
    return [x / n for x in v]


ISSUE_VEC = unit(1, 0, 0, 0)


def user(uid, birth, edu_level, work_years, edu_vec, work_vec):
    u = {"uid": uid, "birthDate": birth, "post": [{"job": "Plant Operator", "department": ""}],
         "skills": [{"type": "education", "id": 1, "educationLevel": edu_level, "specialization": "Engineering"},
                    {"type": "work experience", "id": 2, "name": "Plant operator", "specialization": "Mechanics",
                     "time": work_years, "comment": "Ran the bottling line of a food plant."}]}
    shas = embed_people.plan([dict(u, _id=str(uid))], {})["todo"][0]["shas"]
    vec = {"embedding_model": ai_config.EMBED_MODEL, "embedding_dims": ai_config.EMBED_DIMS, "embedding_template": "t1",
           "embedding_task_type": "RETRIEVAL_DOCUMENT", "embedding_text_sha256": shas,
           "experience_vectors": {"1": edu_vec, "2": work_vec}}
    return u, vec


def member(pub, uid, r, source="no_issue_vector"):
    return {"_id": f"{pub}_{uid}", "microcommunity_id": pub, "user_id": uid, "relevance_score": r,
            "expertise_score": 0.0, "expertise_source": source, "isr_score": 1.0}


class Phase(unittest.TestCase):
    def data(self):
        u1, v1 = user(1, "1980-01-01", "Master", 10, unit(1, 1, 0, 0), unit(1, 0, 1, 0))
        u2, v2 = user(2, "2010-06-01", "Bachelor", 2, unit(0, 1, 0, 0), unit(0, 0, 1, 0))   # 16 at registration: floor 16/30
        u3, v3 = user(3, "1990-01-01", "PhD", 5, unit(1, 0, 0, 0), unit(1, 0, 0, 0))
        members = [member("P1", 1, 0.2), member("P1", 2, 0.4), member("P1", 3, 0.6),
                   member("P2", 1, 0.5), member("P2", 2, 0.5, source="issue_vector")]       # mixed: left alone
        mcs = {"P1": {"issue_id": "t1"}, "P2": {"issue_id": "t2"}}
        issues = {"t1": {"title": "Bottling line noise", "description": "The plant is loud at night.", "created_at": "2026-06-13T10:00:00+00:00",
                         "w_relevance": 0.5, "w_expertise": 0.2, "w_contribution": 0.3, "relevance_scores": {"1": 0.2, "2": 0.4, "3": 0.6},
                         "isr_scores": {"1": 0.5, "2": 1.0, "3": 1.5}}}
        discussions = {"t1": {"title": None, "relevance_scores": {"1": 0.2, "2": 0.4, "3": 0.6}, "isr_scores": {}}}
        users = {"1": u1, "2": u2, "3": u3}
        vectors = {"1": v1, "2": v2, "3": v3}
        return members, mcs, issues, discussions, users, vectors

    def test_real_e_isr_and_maps(self):
        members, mcs, issues, discussions, users, vectors = self.data()
        calls = []
        p = m.plan(members, mcs, issues, discussions, users, vectors, {}, lambda texts: calls.append(texts) or [ISSUE_VEC for _ in texts])
        self.assertEqual(calls, [["Bottling line noise. The plant is loud at night."]])
        self.assertEqual(p["requests"], 1)
        self.assertEqual(set(p["issue_vectors"]), {"t1"})
        iv = p["issue_vectors"]["t1"]
        self.assertEqual((iv["model"], iv["dims"], iv["task_type"], iv["template_version"]),
                         ("gemini-embedding-001", 768, "RETRIEVAL_QUERY", "t1"))
        upd = {(c, i): d for c, i, d in p["updates"]}
        # uid 1: education cos 1/sqrt2 ^ (0.8) * 6, experience cos 1/sqrt2 * 10; 46 years old -> floor 1.0
        edu1 = (1 / math.sqrt(2)) ** 0.8 * 6
        exp1 = (1 / math.sqrt(2)) * 10
        f1 = upd[("microcommunity_members", "P1_1")]
        self.assertAlmostEqual(f1["education_expertise"], round(max(1.0, edu1), 3))
        self.assertAlmostEqual(f1["experience_expertise"], round(exp1, 3))
        self.assertEqual(f1["expertise_source"], "issue_vector")
        # uid 2: cosines 0 -> education 0 -> the age floor 16/30; no experience
        f2 = upd[("microcommunity_members", "P1_2")]
        self.assertAlmostEqual(f2["expertise_score"], round(16 / 30, 3))
        # the ISR is the A1 formula on R and the rounded E, with the issue's weights
        es = [upd[("microcommunity_members", f"P1_{u}")]["expertise_score"] for u in (1, 2, 3)]
        b = isr_core.isr_for_public([{"uid": str(u), "R": r, "E": e} for u, r, e in zip((1, 2, 3), (0.2, 0.4, 0.6), es)],
                                    {"w_relevance": 0.5, "w_expertise": 0.2, "w_contribution": 0.3})
        for u, bb in zip((1, 2, 3), b):
            self.assertEqual(upd[("microcommunity_members", f"P1_{u}")]["isr_score"], round(bb["isr"], 3))
        self.assertEqual(upd[("issues", "t1")]["isr_scores"], {str(u): round(bb["isr"], 3) for u, bb in zip((1, 2, 3), b)})
        self.assertIn(("discussions", "t1"), upd)
        self.assertNotIn(("microcommunity_members", "P2_1"), upd)          # the mixed public
        self.assertEqual(p["mixed"], [("P2", 1, 2)])

    def test_matches_expertise_py(self):
        members, mcs, issues, discussions, users, vectors = self.data()
        e = m.member_expertise(users["3"], vectors["3"]["experience_vectors"], ISSUE_VEC, 1.0, "2026-06-13")
        edu = X.education_sum(users["3"]["skills"], vectors["3"]["experience_vectors"], ISSUE_VEC)
        self.assertEqual(e, (round(max(1.0, edu), 3), round(5.0, 3), round(max(1.0, edu) + 5.0, 3)))

    def test_stale_vectors_and_existing_issue_vector(self):
        members, mcs, issues, discussions, users, vectors = self.data()
        vectors["2"] = dict(vectors["2"], embedding_model="text-embedding-004")
        p = m.plan(members, mcs, issues, discussions, users, vectors, {}, lambda t: self.fail("no request expected"))
        self.assertEqual(p["publics"], [])
        self.assertIn("without current A4 vectors", p["skipped"][0][3])
        members, mcs, issues, discussions, users, vectors = self.data()
        text = "Bottling line noise. The plant is loud at night."
        existing = {"t1": {"vector": ISSUE_VEC, "model": "gemini-embedding-001", "dims": 768, "task_type": "RETRIEVAL_QUERY",
                           "template_version": "t1", "text_sha256": embed_people.sha256(text)}}
        p = m.plan(members, mcs, issues, discussions, users, vectors, existing, lambda t: self.fail("no request expected"))
        self.assertEqual(p["requests"], 0)
        self.assertEqual(p["issue_vectors"], {})
        self.assertEqual(len(p["publics"]), 1)

    def test_second_run_changes_nothing(self):
        members, mcs, issues, discussions, users, vectors = self.data()
        p = m.plan(members, mcs, issues, discussions, users, vectors, {}, lambda t: [ISSUE_VEC for _ in t])
        done = {i: d for c, i, d in p["updates"] if c == "microcommunity_members"}
        after = [dict(x, **done.get(x["_id"], {})) for x in members]
        p2 = m.plan(after, mcs, issues, discussions, users, vectors, {}, lambda t: self.fail("no request expected"))
        self.assertEqual((p2["updates"], p2["placeholder_publics"]), ([], 0))

    def test_topic_text_falls_back_to_the_discussion(self):
        self.assertEqual(m.topic_text({"title": "", "description": None}, {"title": "Chess club", "description": "Weekly games."}),
                         "Chess club. Weekly games.")
        self.assertEqual(m.topic_text({}, {}), "")


if __name__ == "__main__":
    unittest.main()
