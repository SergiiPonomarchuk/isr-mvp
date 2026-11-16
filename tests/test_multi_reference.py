import json
import pathlib
import subprocess
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import multi_reference as m


class MultiReference(unittest.TestCase):
    def test_js_python_parity_real_rankings_and_scoring(self):
        ranks = json.loads((ROOT/"specs/tasks/M3-selection-calibration.json").read_text())
        for scenario in ranks["scenarios"]:
            raw = [{"id": str(r["id"]), "score": r["score"]} for r in scenario["ranking"]]
            py = m.select(raw)
            code = 'const m=require("./functions/multi-reference");process.stdout.write(JSON.stringify(m.select(JSON.parse(process.argv[1]))));'
            js = json.loads(subprocess.check_output(["node", "-e", code, json.dumps(raw)], cwd=ROOT))
            self.assertEqual(py, js)
        raw = [{"id":"a","score":.5},{"id":"b","score":.5}]
        refs = [{"id":k,"evidence":"actual context", "relevance":{"D":.5,"G":.2,"S":.2,"X":.1},"aggregation":{"R":.6,"E":.2,"C":.2},"mu":40,"sigma":30} for k in ["a","b"]]
        aspects = {k:{"D":1,"G":.2,"S":.4,"X":0,"education":h,"experience":2} for k,h in [("a",0),("b",2)]}
        py=m.member(m.reviewed(raw,refs),30,aspects)
        code='const m=require("./functions/multi-reference"),v=JSON.parse(process.argv[1]);process.stdout.write(JSON.stringify(m.member(m.reviewed(v.raw,v.refs),30,v.aspects)));'
        js=json.loads(subprocess.check_output(["node","-e",code,json.dumps(dict(raw=raw,refs=refs,aspects=aspects))],cwd=ROOT))
        self.assertEqual(py,js)
        self.assertEqual(py["E"],3)

    def test_public_normalization_matches_js(self):
        raw=[{"id":"a","score":.5}]
        refs=[{"id":"a","evidence":"actual context","relevance":{"D":.5,"G":.2,"S":.2,"X":.1},"aggregation":{"R":.6,"E":.2,"C":.2},"mu":40,"sigma":30}]
        model=m.reviewed(raw,refs)
        for members in [[{"uid":"1","R":.2,"E":1},{"uid":"2","R":.4,"E":3}], [{"uid":"1","R":0,"E":0},{"uid":"2","R":0,"E":0}]]:
            py=m.public_scores(model,members)
            code='const m=require("./functions/multi-reference"),v=JSON.parse(process.argv[1]);process.stdout.write(JSON.stringify(m.publicScores(m.reviewed(v.raw,v.refs),v.members)));'
            js=json.loads(subprocess.check_output(["node","-e",code,json.dumps(dict(raw=raw,refs=refs,members=members))],cwd=ROOT))
            self.assertEqual(py,js)
            self.assertAlmostEqual(sum(row["isr"] for row in py),len(members))

    def test_boundaries_and_invalid_inputs(self):
        self.assertEqual(len(m.select([{"id":"a","score":.35},{"id":"b","score":.3}])["chain"]),1)
        self.assertEqual(m.select([{"id":"a","score":.3}])["state"],"context_validation_required")
        for score in [float("nan"),float("inf"),True,".5",-1,2]:
            with self.assertRaises(ValueError):m.select([{"id":"a","score":score}])

    def test_social_direction_and_missing_data(self):
        edges={"a":{"x":.3},"b":{"x":.6},"x":{"y":1},"z":{"a":1}}
        self.assertEqual(m.directed_ties(["a","b"],edges,"x"),[{"affectedId":"a","tie":.3},{"affectedId":"b","tie":.6}])
        self.assertEqual(m.directed_ties(["a","b"],edges,"y"),[])
        self.assertEqual(m.directed_ties(["a","b"],edges,"z"),[])
        with self.assertRaises(ValueError):m.directed_ties(["missing"],edges,"x")

    def test_two_cohorts_match_js(self):
        raw=[{"id":"a","score":.5}]
        refs=[{"id":"a","evidence":"actual context","relevance":{"D":.5,"G":.2,"S":.1,"X":.2},"aggregation":{"R":.6,"E":.2,"C":.2},"mu":40,"sigma":30}]
        people=[{"uid":key,"age":30,"aspects":{"a":{"D":d,"G":0,"S":0,"X":0,"education":0,"experience":0}}} for key,d in [("a",.3),("b",.5),("relative",.2),("equal",.1),("over",.12),("zero",0),("friend",0)]]
        outgoing={"a":{"relative":1,"equal":.5,"over":.5,"zero":0},"b":{"relative":.5},"relative":{"friend":1}}
        py=m.cohorts(m.reviewed(raw,refs),people,outgoing)
        code='const m=require("./functions/multi-reference"),v=JSON.parse(process.argv[1]);process.stdout.write(JSON.stringify(m.cohorts(m.reviewed(v.raw,v.refs),v.people,v.outgoing)));'
        js=json.loads(subprocess.check_output(["node","-e",code,json.dumps(dict(raw=raw,refs=refs,people=people,outgoing=outgoing))],cwd=ROOT))
        self.assertEqual(py,js)
        self.assertEqual([p["uid"] for p in py["A"]],["a","b"])
        self.assertNotIn("friend",[p["uid"] for p in py["members"]])
        self.assertEqual(next(p for p in py["B"] if p["uid"]=="relative")["social_source"],"b")
        self.assertEqual(next(p for p in py["B"] if p["uid"]=="over")["R"],.06)

    def test_cohort_failures_and_no_cap(self):
        model={"refs":[{"id":"a","alpha":1,"relevance":{"D":.5,"G":.2,"S":.1,"X":.2}}],"relevance":{"D":.5,"G":.2,"S":.1,"X":.2}}
        people=[{"uid":str(i),"age":30,"aspects":{"a":{"D":.5,"G":0,"S":0,"X":0,"education":0,"experience":0}}} for i in range(101)]
        self.assertEqual(len(m.cohorts(model,people,{p["uid"]:{} for p in people})["A"]),101)
        with self.assertRaises(ValueError):m.cohorts(model,people,{})
        with self.assertRaises(ValueError):m.cohorts(model,people,{p["uid"]:{"missing":.5} for p in people})
