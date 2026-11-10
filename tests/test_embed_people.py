"""Task A4 phase B: the embedding templates t1 (pinned on fixture profiles, R9), the plan, the resume
rule, the pace and the written fields of scripts/embed_people.py. The API is mocked.
Run: python -m unittest discover -s tests"""
import collections
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import ai_config  # noqa: E402
import embed_people as m  # noqa: E402
import embedding_templates as T  # noqa: E402
import gemini_api  # noqa: E402

# After P1: role, field and description in the work experience.
ADULT = {"_id": "1298", "uid": 1298, "post": [{"job": "Agricultural Worker", "department": "", "place": "Andim", "educationLevel": "Vocational Training", "salary": 21000}],
         "skills": [
             {"type": "education", "id": 1, "educationLevel": "Vocational Training", "specialization": "Agronomy", "name": "Bilim Technical College", "graduationYear": 2017},
             {"type": "work experience", "id": 2, "name": "Farm Hand", "specialization": "Agriculture", "time": 2,
              "comment": "Performed routine maintenance and assisted with harvesting crops to support daily operations on the local farm."},
             {"type": "work experience", "id": 3, "name": "Field Technician", "specialization": "Agriculture", "time": 3,
              "comment": "Monitored irrigation systems and applied fertilizers to ensure optimal crop health."},
             {"type": "activity", "id": 5, "name": "Cycling", "time": 1},
             {"type": "activity", "id": 6, "name": "Board Games", "time": 1},
         ]}
# Before P1: comment only; a department; a second education entry in progress.
BEFORE_P1 = {"_id": "5129", "uid": 5129, "post": [{"job": "Production Technician", "department": "Production", "place": "Andim", "educationLevel": "Vocational Training"}],
             "skills": [
                 {"type": "education", "id": 1, "educationLevel": "Vocational Training", "specialization": "Music", "name": "Bilim Art School"},
                 {"type": "education", "id": 4, "educationLevel": "Bachelor", "specialization": "Design", "in_progress": True},
                 {"type": "work experience", "id": 3, "name": None, "specialization": None, "time": 1,
                  "comment": "An anti-war artist and activist who is deeply inspired by historic protests."},
             ]}
CHILD = {"_id": "77", "uid": 77, "post": [{"job": "child", "department": None, "place": None, "educationLevel": None}],
         "skills": [{"type": "activity", "id": 1, "name": "Football", "time": 1}]}
TODDLER = {"_id": "78", "uid": 78, "post": [{"job": "toddler"}], "skills": []}
STUB = {"_id": "None", "uid": None, "displayName": "x"}


class Templates(unittest.TestCase):
    def test_config_comes_from_ai_config_js(self):
        self.assertEqual((ai_config.EMBED_MODEL, ai_config.EMBED_DIMS, ai_config.EMBED_TEMPLATE_VERSION),
                         ("gemini-embedding-001", 768, "t1"))
        self.assertEqual((ai_config.TASK_TYPE_ISSUE, ai_config.TASK_TYPE_DOCUMENT), ("RETRIEVAL_QUERY", "RETRIEVAL_DOCUMENT"))
        self.assertEqual(T.VERSION, "t1")

    def test_profile_texts_pinned(self):
        self.assertEqual(T.profile_text(ADULT),
                         "Occupation: Agricultural Worker.\n"
                         "Education: Vocational Training in Agronomy.\n"
                         "Experience: Farm Hand (Agriculture): Performed routine maintenance and assisted with harvesting crops to support daily "
                         "operations on the local farm; Field Technician (Agriculture): Monitored irrigation systems and applied fertilizers to "
                         "ensure optimal crop health.\n"
                         "Activities: Cycling, Board Games.")
        self.assertEqual(T.profile_text(BEFORE_P1),
                         "Occupation: Production Technician, Production.\n"
                         "Education: Vocational Training in Music; Bachelor in Design.\n"
                         "Experience: An anti-war artist and activist who is deeply inspired by historic protests.")
        self.assertEqual(T.profile_text(CHILD), "Occupation: child.\nActivities: Football.")
        self.assertEqual(T.profile_text(TODDLER), "Occupation: toddler.")

    def test_skill_texts_pinned(self):
        self.assertEqual(T.skill_texts(ADULT), {
            "1": "Vocational Training in Agronomy",
            "2": "Farm Hand (Agriculture): Performed routine maintenance and assisted with harvesting crops to support daily operations on the local farm.",
            "3": "Field Technician (Agriculture): Monitored irrigation systems and applied fertilizers to ensure optimal crop health.",
            "5": "Cycling", "6": "Board Games"})
        self.assertEqual(T.skill_texts(BEFORE_P1)["3"], "An anti-war artist and activist who is deeply inspired by historic protests.")

    def test_excluded_fields(self):
        text = T.profile_text(ADULT) + " ".join(T.skill_texts(ADULT).values())
        for word in ("Andim", "Bilim", "21000", "2017", "1298"):
            self.assertNotIn(word, text)


def fake_embed(calls=None, fail=None):
    def embed(texts, task, key):
        if calls is not None:
            calls.append((len(texts), task))
        if fail and fail(len(calls or [])):
            raise gemini_api.GeminiError("HTTP 503: high demand", 503)
        return [[1.0] + [0.0] * 767 for _ in texts]
    return embed


class Plan(unittest.TestCase):
    def test_counts_and_stub(self):
        p = m.plan([ADULT, BEFORE_P1, CHILD, TODDLER, STUB], {})
        st = p["stats"]
        self.assertEqual(p["skipped"], ["None"])
        self.assertEqual(st["people"], 4)
        self.assertEqual(st["texts to embed"], 4 + 5 + 3 + 1)
        self.assertEqual(st["work experience texts to embed"], 3)
        self.assertEqual(st["requests needed"], 1)
        self.assertEqual(st["people without a user_vectors document"], 4)

    def test_current_people_are_skipped_and_changed_texts_redone(self):
        p = m.plan([ADULT], {})
        item = p["todo"][0]
        meta = {"1298": {"embedding_model": "gemini-embedding-001", "embedding_dims": 768, "embedding_template": "t1",
                         "embedding_task_type": "RETRIEVAL_DOCUMENT", "embedding_text_sha256": item["shas"]}}
        self.assertEqual(m.plan([ADULT], meta)["todo"], [])
        changed = dict(ADULT, skills=[dict(s) for s in ADULT["skills"]])
        changed["skills"][1]["comment"] = "Something else."
        self.assertEqual(len(m.plan([changed], meta)["todo"]), 1)
        old_model = {"1298": dict(meta["1298"], embedding_model="text-embedding-004")}
        self.assertEqual(len(m.plan([ADULT], old_model)["todo"]), 1)

    def test_limit_takes_a_spread_sample(self):
        users = [dict(CHILD, _id=str(i), uid=i) for i in range(1, 51)]
        p = m.plan(users, {}, limit=10)
        self.assertEqual(len(p["todo"]), 10)
        self.assertEqual([t["uid"] for t in p["todo"]], sorted([u["uid"] for u in users], key=m.order_key)[:10])


def fake_clock():
    t = [0.0]

    def sleep(x):
        t[0] += x
    return sleep, (lambda: t[0])


class Run(unittest.TestCase):
    def test_batches_written_per_person_with_metadata(self):
        users = [dict(ADULT, _id=str(i), uid=i) for i in range(1, 41)]        # 6 texts each: 240 texts
        p = m.plan(users, {})
        calls, written = [], []
        sleep, now = fake_clock()
        s, prof = m.run(p["todo"], "k", lambda item, v: written.append((item, v)), 100,
                        embed=fake_embed(calls), sleep=sleep, now=now)
        self.assertEqual([c[0] for c in calls], [100, 100, 40])
        self.assertTrue(all(c[1] == "RETRIEVAL_DOCUMENT" for c in calls))
        self.assertEqual(s["people written"], 40)
        self.assertEqual(len(prof), 40)
        item, vecs = written[0]
        f = m.doc_fields(item, vecs, tuple, "now")
        self.assertEqual(set(f["experience_vectors"]), {"1", "2", "3", "5", "6"})
        self.assertIsInstance(f["profile_vector"], tuple)
        self.assertEqual((f["embedding_model"], f["embedding_dims"], f["embedding_template"], f["embedding_task_type"]),
                         ("gemini-embedding-001", 768, "t1", "RETRIEVAL_DOCUMENT"))
        self.assertEqual(f["embedding_text_sha256"], item["shas"])
        self.assertEqual(f["uid"], item["uid"])

    def test_stops_after_errors_and_keeps_partial_people_for_the_next_run(self):
        users = [dict(ADULT, _id=str(i), uid=i) for i in range(1, 81)]        # 480 texts: 5 requests
        p = m.plan(users, {})
        calls, written = [], []
        sleep, now = fake_clock()
        s, _ = m.run(p["todo"], "k", lambda item, v: written.append(item), 100,
                     embed=fake_embed(calls, fail=lambda n: n > 1), sleep=sleep, now=now)
        self.assertEqual(s["texts embedded"], 100)
        self.assertEqual(s["people written"], 16)                             # 16 x 6 = 96 texts complete
        self.assertEqual(s["people left for the next run"], 64)
        self.assertEqual(s["failed requests"], 3)
        self.assertEqual(s["stopped on errors"], 1)

    def test_request_limit(self):
        users = [dict(ADULT, _id=str(i), uid=i) for i in range(1, 41)]
        sleep, now = fake_clock()
        s, _ = m.run(m.plan(users, {})["todo"], "k", lambda i, v: None, 2, embed=fake_embed(), sleep=sleep, now=now)
        self.assertEqual(s["requests"], 2)
        self.assertEqual(s["stopped at the request limit"], 1)

    def test_pacer_keeps_tokens_per_minute(self):
        clock = [0.0]
        slept = []

        def sleep(x):
            slept.append(x)
            clock[0] += x

        pacer = m.Pacer(sleep=sleep, now=lambda: clock[0])
        for _ in range(3):
            pacer.wait(10000)                                                 # 24,000 a minute: the third waits
        self.assertGreaterEqual(clock[0], 60)
        self.assertEqual(sum(1 for x in slept if x > 2), 1)


class Spread(unittest.TestCase):
    def test_median_cosine_and_s_stats(self):
        vs = [[1, 0], [0, 1], [1, 1]]
        self.assertIsNotNone(m.median_pair_cosine(vs, pairs=50))
        self.assertIsNone(m.median_pair_cosine([[1, 0]]))
        st = m.s_stats([1, 0], [[1, 0], [0, 1], [1, 1], [-1, 0]])
        self.assertEqual(st["max"], 1.0)
        self.assertEqual(st["p10"], 0.0)                                      # negative cosines count as 0

    def test_issue_text_matches_ai_config_js(self):
        self.assertEqual(m.issue_text(" Broken lock ", "The door does not close."), "Broken lock. The door does not close.")
        self.assertEqual(m.issue_text("", "Only a description"), "Only a description")


class Api(unittest.TestCase):
    def test_redact_and_normalize(self):
        self.assertEqual(gemini_api.redact("bad abc at x?key=abc&a=1", "abc"), "bad [redacted] at x?key=[redacted]&a=1")
        v = gemini_api.unit_normalize([3.0, 4.0])
        self.assertAlmostEqual(v[0], 0.6)
        with self.assertRaises(gemini_api.GeminiError):
            gemini_api.unit_normalize([0.0, 0.0])

    def test_request_body(self):
        seen = {}

        def fake_post(path, body, key, timeout=120):
            seen.update(path=path, body=body)
            return {"embeddings": [{"values": [2.0] + [0.0] * 767} for _ in body["requests"]]}

        orig = gemini_api.post
        gemini_api.post = fake_post
        try:
            out = gemini_api.embed_texts(["a", "b"], "RETRIEVAL_DOCUMENT", "k")
        finally:
            gemini_api.post = orig
        self.assertEqual(seen["path"], "models/gemini-embedding-001:batchEmbedContents")
        self.assertEqual(seen["body"]["requests"][0], {"model": "models/gemini-embedding-001", "content": {"parts": [{"text": "a"}]},
                                                       "taskType": "RETRIEVAL_DOCUMENT", "outputDimensionality": 768})
        self.assertEqual(out[0][0], 1.0)
        with self.assertRaises(ValueError):
            gemini_api.embed_texts(["x"] * 101, "RETRIEVAL_DOCUMENT", "k")


if __name__ == "__main__":
    unittest.main()
