"""A1b migration: an expertise placeholder for ad-hoc publics whose members have no E and no ISR.

Dry run by default. Reads the Firestore emulator (FIRESTORE_EMULATOR_HOST must be set);
--apply writes there. A run against the live project needs --project <id> --i-know-this-is-live;
the live --apply is the author's step only.

Why a placeholder: E needs the issue vector, no issue vector is stored for any topic, and the
embedding model of the skill vectors is retired (roadmap stage 1). A1 therefore left these
publics without E and ISR. The author chose (2026-11-09, U3 decision 6, option b) to give them
a neutral placeholder until stage 1:

- every member of such a public gets expertise_score = 0.0 and expertise_source = "no_issue_vector";
  education_expertise and experience_expertise are not written (not computed);
- all members then have the same E, which normalises to 1.0 (A1 rule: all equal -> 1.0), so E
  changes nobody's ISR relative to the others;
- the ISR is computed with the A1 formula (scripts/isr_core.py = functions/isr.js) from the stored
  R, this E and the constant contribution placeholder, with the issue's aggregation weights
  (else the discussion's, else the defaults 0.4 / 0.3 / 0.3), and written as createIssue writes it
  (normalized_relevance, normalized_experience, normalized_contribution, contribution_source,
  isr_score; 3 decimals);
- the cached relevance_scores / isr_scores maps of the topic's discussion and issue are rewritten
  from the member values, as migrate_a1.py does.

Only publics where no member has E and no member has an ISR are changed. A public where some
members have them and others do not is reported and left alone. A second run changes nothing.
Prints no personal fields; ids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import isr_core  # noqa: E402
from migrate_a1 import diff_map, new_maps, norm_uid, r3  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, "specs", "tasks", "A1b-migration-report.md")
PLACEHOLDER_SOURCE = "no_issue_vector"
W_KEYS = ("w_relevance", "w_expertise", "w_contribution")
DEFAULT_WEIGHTS = {"w_relevance": 0.4, "w_expertise": 0.3, "w_contribution": 0.3}  # lifecycle.js votingIssueFields


def _is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


# ------------------------------------------------------------------ loading

def load_firestore(db):
    members = []
    for d in db.collection("microcommunity_members").select(
            ["microcommunity_id", "user_id", "relevance_score", "expertise_score", "isr_score"]).stream():
        x = d.to_dict()
        x["_id"] = d.id
        x["user_id"] = norm_uid(x.get("user_id"))
        members.append(x)
    mcs = {d.id: d.to_dict() for d in db.collection("microcommunities").select(["issue_id"]).stream()}
    fields = ["relevance_scores", "isr_scores"] + list(W_KEYS)
    discussions = {d.id: d.to_dict() for d in db.collection("discussions").select(fields).stream()}
    issues = {d.id: d.to_dict() for d in db.collection("issues").select(fields).stream()}
    return members, mcs, discussions, issues


# ------------------------------------------------------------------ planning

def weights_for(doc_id, issues, discussions):
    for name, docs in (("issue", issues), ("discussion", discussions)):
        d = docs.get(doc_id) or {}
        if all(_is_num(d.get(k)) for k in W_KEYS):
            return {k: float(d[k]) for k in W_KEYS}, name
    return dict(DEFAULT_WEIGHTS), "default"


def plan(members, mcs, discussions, issues):
    by_public = collections.defaultdict(list)
    for m in members:
        by_public[str(m.get("microcommunity_id"))].append(m)
    updates = []   # (collection, doc id, {field: value})
    publics = []   # one row per public that gets the placeholder
    skipped = []   # (public, topic, members, with E, with ISR, reason)
    for pub, ms in sorted(by_public.items()):
        with_e = sum(1 for m in ms if _is_num(m.get("expertise_score")))
        with_isr = sum(1 for m in ms if _is_num(m.get("isr_score")))
        if with_e == len(ms) and with_isr == len(ms):
            continue
        doc_id = str(mcs.get(pub, {}).get("issue_id") or pub)
        if with_e or with_isr:
            skipped.append((pub, doc_id, len(ms), with_e, with_isr, "some members have E or ISR"))
            continue
        if any(not _is_num(m.get("relevance_score")) for m in ms):
            skipped.append((pub, doc_id, len(ms), with_e, with_isr, "a member has no R"))
            continue
        weights, wsrc = weights_for(doc_id, issues, discussions)
        breakdown = isr_core.isr_for_public(
            [{"uid": str(m["user_id"]), "R": m["relevance_score"], "E": 0.0} for m in ms], weights)
        new_members = []
        for m, b in zip(ms, breakdown):
            fields = {
                "expertise_score": 0.0,
                "expertise_source": PLACEHOLDER_SOURCE,
                "normalized_relevance": r3(b["R_norm"]),
                "normalized_experience": r3(b["E_norm"]),
                "normalized_contribution": r3(b["C_norm"]),
                "contribution_source": b["contribution_source"],
                "isr_score": r3(b["isr"]),
            }
            updates.append(("microcommunity_members", m["_id"], fields))
            new_members.append(dict(m, **fields))
        rel, isr = new_maps(new_members)
        maps_updated = []
        for coll, docs in (("discussions", discussions), ("issues", issues)):
            d = docs.get(doc_id)
            if d is None:
                continue
            c1, a1, rm1 = diff_map(d.get("relevance_scores"), rel)
            c2, a2, rm2 = diff_map(d.get("isr_scores"), isr)
            if c1 or a1 or rm1 or c2 or a2 or rm2:
                updates.append((coll, doc_id, {"relevance_scores": rel, "isr_scores": isr}))
                maps_updated.append(coll)
        isrs = [f["isr_score"] for f in (u[2] for u in updates if u[0] == "microcommunity_members" and u[1] in {m["_id"] for m in ms})]
        publics.append({"public": pub, "topic": doc_id, "members": len(ms), "weights": weights, "weights_source": wsrc,
                        "isr_min": min(isrs), "isr_median": statistics.median(isrs), "isr_max": max(isrs),
                        "maps": maps_updated})
    return {"publics_total": len(by_public), "updates": updates, "publics": publics, "skipped": skipped}


# ------------------------------------------------------------------ report and apply

def report(p, source, applied):
    n_members = sum(1 for u in p["updates"] if u[0] == "microcommunity_members")
    n_maps = sum(1 for u in p["updates"] if u[0] != "microcommunity_members")
    lines = ["# A1b migration report", "",
             f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_a1b.py`.",
             f"Source: {source}. Mode: {'APPLIED' if applied else 'dry run (nothing written)'}.", "",
             f"Ad-hoc publics: {p['publics_total']}; given the expertise placeholder: {len(p['publics'])}; "
             f"member documents to update: {n_members}; discussion and issue documents (maps): {n_maps}.", "",
             "## Publics that get the placeholder", "",
             "| Public | Topic | Members | Weights R / E / C (source) | ISR min / median / max | Maps rewritten |",
             "|---|---|---|---|---|---|"]
    for r in p["publics"]:
        w = r["weights"]
        lines.append(f"| {r['public']} | {r['topic']} | {r['members']} | "
                     f"{w['w_relevance']:.2f} / {w['w_expertise']:.2f} / {w['w_contribution']:.2f} ({r['weights_source']}) | "
                     f"{r['isr_min']:.3f} / {r['isr_median']:.3f} / {r['isr_max']:.3f} | {', '.join(r['maps']) or '-'} |")
    if not p["publics"]:
        lines.append("| - | - | 0 | - | - | - |")
    lines += ["", "## Left alone", ""]
    if p["skipped"]:
        lines += ["| Public | Topic | Members | With E | With ISR | Reason |", "|---|---|---|---|---|---|"]
        lines += [f"| {a} | {b} | {c} | {d} | {e} | {f} |" for a, b, c, d, e, f in p["skipped"]]
    else:
        lines.append("None.")
    lines += ["", "Each member gets `expertise_score` 0.0 and `expertise_source` \"no_issue_vector\"; the normalised E is "
              "then 1.0 for everyone, so the ISR order inside the public follows R. Stage 1 replaces the placeholder."]
    return "\n".join(lines) + "\n"


def apply(db, p):
    batch, n = db.batch(), 0
    for coll, doc_id, data in p["updates"]:
        batch.update(db.collection(coll).document(doc_id), data)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    batch.commit()
    return n


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
    from google.cloud import firestore
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"
    p = plan(*load_firestore(db))
    applied = False
    if a.apply:
        print(f"Writing {apply(db, p)} document updates...")
        applied = True
    with open(a.report, "w", encoding="utf-8") as f:
        f.write(report(p, source, applied))
    print(f"Report: {os.path.relpath(a.report, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
