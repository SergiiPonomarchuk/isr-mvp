"""A2 migration: Expertise without resources, with the age floor (PD-8).

Dry run by default. Sources:
  --source export     read claude_export/ (read-only; report only)
  --source firestore  read the Firestore emulator (FIRESTORE_EMULATOR_HOST must be set);
                      --apply writes there.
A run against the live project needs --project <id> --i-know-this-is-live and is
the author's step only.

What it does per ad-hoc public (members grouped by microcommunity_id):
  - E = max(min(age, 30)/30, stored education part) + stored experience part.
    The stored parts are used because they do not change under A2 and the issue
    vectors they came from are no longer stored (EMBEDDINGS.md fact 12).
    The age is taken at the registration moment of the issue
    (discussions.created_at of the discussion with the public's id) and is not stored.
  - normalized_experience and isr_score recomputed with the as-built aggregation.
    ISR weights: the w_* fields of the discussion if present, else recovered from
    the stored member values (one of the three as-built triples, IF l.100).
  - resources_expertise deleted from members; expertise-weight and related fields
    deleted from issues and discussions.
  - discussions.isr_scores is NOT recomputed: it is the vote-tally number (IF l.101),
    which is task A1.
  - A member born after the issue's registration cannot be a member (author
    decision, 2026-11-04): the member doc is deleted, the user id is removed from
    the discussion's relevance_scores and isr_scores maps, member_count and
    member_accepted of the public are reduced, and the public is recomputed
    without them. Chat messages and participants are not touched.
Prints no personal fields; user ids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import glob
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expertise as ex  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, "claude_export")
REPORT = os.path.join(ROOT, "specs", "tasks", "A2-migration-report.md")
COMPARED = ("expertise_score", "normalized_experience", "isr_score")


# ------------------------------------------------------------------ loading

def _jsonl(pattern):
    for path in sorted(glob.glob(os.path.join(EXPORT, pattern))):
        with open(path, encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                yield d.get("data", d) if isinstance(d.get("data"), dict) else d


def load_export():
    members = [dict(m, _doc_id=m["doc_id"]) for m in _jsonl("microcommunity_members_*.jsonl")]
    discussions = {str(d["doc_id"]): d for d in _jsonl("discussions_full_*.jsonl")}
    issues = {str(d["doc_id"]): d for d in _jsonl("issues_*.jsonl")}
    births = {}
    for p in _jsonl("profiles_*.jsonl"):
        births[p.get("uid")] = p.get("birthDate")
    return members, discussions, issues, births


def load_firestore(db):
    members = [dict(d.to_dict(), _doc_id=d.id) for d in db.collection("microcommunity_members").stream()]
    discussions = {d.id: d.to_dict() for d in db.collection("discussions").select(
        ["created_at", "w_relevance", "w_expertise", "w_contribution", "relevance_scores", "isr_scores",
         *ex.OBSOLETE_ISSUE_FIELDS]).stream()}
    issues = {d.id: d.to_dict() for d in db.collection("issues").stream()}
    births = {}
    for d in db.collection("users").select(["uid", "birthDate"]).stream():
        data = d.to_dict()
        births[data.get("uid", d.id)] = data.get("birthDate")
    births = {(int(k) if str(k).isdigit() else k): v for k, v in births.items()}
    return members, discussions, issues, births


# ------------------------------------------------------------------ planning

def plan(members, discussions, issues, births):
    by_public = collections.defaultdict(list)
    for m in members:
        by_public[str(m["microcommunity_id"])].append(m)

    member_updates = {}            # doc_id -> {field: value}
    skipped = {}                   # public id -> reason
    missing_birth = set()
    missing_reg = []
    unborn = []                    # (public id, user id, member doc id)
    weights_used = collections.Counter()
    deltas = []
    old_new = []

    for pub, ms in sorted(by_public.items()):
        if any("isr_score" not in m or "education_expertise" not in m for m in ms):
            skipped[pub] = f"{len(ms)} members without stored Expertise/ISR (never backfilled)"
            continue
        disc = discussions.get(pub)
        if disc is None or not disc.get("created_at"):
            missing_reg.append(pub)
            continue
        reg = disc["created_at"]
        ages = {}
        kept = []
        for m in ms:
            uid = m["user_id"]
            try:
                ages[uid] = ex.age_in_years(births.get(uid), reg)
                kept.append(m)
            except ValueError as e:
                if "before birthDate" in str(e):
                    unborn.append((pub, uid, m["_doc_id"]))
                else:
                    missing_birth.add(uid)
        if len(kept) + sum(1 for u in unborn if u[0] == pub) != len(ms):
            continue
        ms = kept
        if all(k in disc for k in ("w_relevance", "w_expertise", "w_contribution")):
            w = (float(disc["w_relevance"]), float(disc["w_expertise"]), float(disc["w_contribution"]))
            src = "discussion"
        else:
            w = ex.fit_isr_weights(by_public[pub])
            src = "recovered"
        weights_used[(src, w)] += 1
        for m, new in zip(ms, ex.recompute_public(ms, w, ages)):
            upd = dict(new)
            for f in ex.OBSOLETE_MEMBER_FIELDS:
                if f in m:
                    upd[f] = None  # None = delete
            member_updates[m["_doc_id"]] = upd
            deltas.append(new["isr_score"] - m["isr_score"])
            old_new.append((m, new))

    issue_deletes = {i: [f for f in ex.OBSOLETE_ISSUE_FIELDS if f in d] for i, d in issues.items()}
    issue_deletes = {k: v for k, v in issue_deletes.items() if v}
    disc_deletes = {i: [f for f in ex.OBSOLETE_ISSUE_FIELDS if f in d] for i, d in discussions.items()}
    disc_deletes = {k: v for k, v in disc_deletes.items() if v}

    return {
        "publics": len(by_public), "members": len(members),
        "member_updates": member_updates, "skipped": skipped,
        "missing_birth": sorted(missing_birth, key=str), "missing_reg": missing_reg,
        "weights_used": weights_used, "deltas": deltas, "old_new": old_new,
        "issue_deletes": issue_deletes, "disc_deletes": disc_deletes,
        "unborn": unborn,
        "disc_maps": {pub: d for pub, d in discussions.items()},
    }


# ------------------------------------------------------------------ report

def report(p, source, applied):
    d = p["deltas"]
    # Stored values have 3 decimals; a difference of one rounding step (0.001) is not a change.
    changed = sum(1 for x in d if round(abs(x), 3) > 0.001)
    res_deleted = sum(1 for u in p["member_updates"].values() if "resources_expertise" in u)
    res_nonzero = sum(1 for m, _ in p["old_new"] if (m.get("resources_expertise") or 0) > 0)
    floor_raised = sum(1 for m, n in p["old_new"] if n["education_expertise"] > round(m["education_expertise"], 3) + 0.0005)
    e_down = sum(1 for m, n in p["old_new"] if round(m["expertise_score"] - n["expertise_score"], 3) > 0.001)
    e_up = sum(1 for m, n in p["old_new"] if round(n["expertise_score"] - m["expertise_score"], 3) > 0.001)
    lines = [
        "# A2 migration report",
        "",
        f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_a2.py`.",
        f"Source: {source}. Mode: {'APPLIED' if applied else 'dry run (nothing written)'}.",
        "",
        "## Counts",
        "",
        "| Item | Count |",
        "|---|---|",
        f"| Ad-hoc publics | {p['publics']} |",
        f"| Members | {p['members']} |",
        f"| Members recomputed | {len(p['member_updates'])} |",
        f"| `resources_expertise` deleted (of which > 0) | {res_deleted} ({res_nonzero}) |",
        f"| Education part raised to the age floor | {floor_raised} |",
        f"| E higher / lower than before (> 0.001) | {e_up} / {e_down} |",
        f"| ISR changed by > 0.001 | {changed} |",
        f"| Issue docs with deleted fields | {len(p['issue_deletes'])} |",
        f"| Discussion docs with deleted fields | {len(p['disc_deletes'])} |",
        f"| Members removed (born after the issue's registration) | {len(p['unborn'])} |",
        f"| Publics skipped | {len(p['skipped'])} |",
        f"| Members without a valid birthDate | {len(p['missing_birth'])} |",
        f"| Publics without a registration date | {len(p['missing_reg'])} |",
    ]
    if d:
        q = statistics.quantiles(d, n=20)
        lines += ["", "## ISR change (new − old)", "",
                  f"min {min(d):+.3f}, 5% {q[0]:+.3f}, median {statistics.median(d):+.3f}, "
                  f"95% {q[-1]:+.3f}, max {max(d):+.3f}; mean |change| {statistics.mean(abs(x) for x in d):.3f}."]
    lines += ["", "## ISR weights used", "", "| Source | (w_R, w_E, w_C) | Publics |", "|---|---|---|"]
    for (src, w), n in sorted(p["weights_used"].items(), key=lambda x: -x[1]):
        lines.append(f"| {src} | {w} | {n} |")
    if p["unborn"]:
        lines += ["", "## Members removed: born after the issue's registration", "",
                  "| Public | User id |", "|---|---|"] + [f"| {pub} | {uid} |" for pub, uid, _ in p["unborn"]]
    if p["skipped"]:
        lines += ["", "## Skipped publics", ""] + [f"- `{k}`: {v}" for k, v in p["skipped"].items()]
    if p["issue_deletes"] or p["disc_deletes"]:
        fields = collections.Counter(f for v in list(p["issue_deletes"].values()) + list(p["disc_deletes"].values()) for f in v)
        lines += ["", "## Deleted issue/discussion fields", ""] + [f"- `{f}`: {n} docs" for f, n in fields.most_common()]
    if p["missing_birth"]:
        lines += ["", "## Members without a valid birthDate (user ids)", "", ", ".join(map(str, p["missing_birth"]))]
    if p["missing_reg"]:
        lines += ["", "## Publics without a registration date", "", ", ".join(p["missing_reg"])]
    return "\n".join(lines) + "\n"


# ------------------------------------------------------------------ writing

def apply(db, p):
    from google.cloud import firestore
    batch, n = db.batch(), 0

    def put(ref, data):
        nonlocal batch, n
        batch.update(ref, {k: (firestore.DELETE_FIELD if v is None else v) for k, v in data.items()})
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()

    for pub, uid, doc_id in p["unborn"]:
        db.collection("microcommunity_members").document(doc_id).delete()
        mc = db.collection("microcommunities").document(pub)
        if mc.get().exists:
            put(mc, {"member_count": firestore.Increment(-1), "member_accepted": firestore.Increment(-1)})
        disc = p["disc_maps"].get(pub, {})
        maps = {f"{name}.`{uid}`": None for name in ("relevance_scores", "isr_scores")
                if str(uid) in (disc.get(name) or {})}
        if maps:
            put(db.collection("discussions").document(pub), maps)
    for doc_id, upd in p["member_updates"].items():
        put(db.collection("microcommunity_members").document(doc_id), upd)
    for doc_id, fields in p["issue_deletes"].items():
        put(db.collection("issues").document(doc_id), {f: None for f in fields})
    for doc_id, fields in p["disc_deletes"].items():
        put(db.collection("discussions").document(doc_id), {f: None for f in fields})
    batch.commit()
    return n


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", choices=("export", "firestore"), default="export")
    ap.add_argument("--apply", action="store_true", help="write the changes (firestore source only)")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)

    if a.source == "export":
        if a.apply:
            ap.error("--apply needs --source firestore")
        data = load_export()
        source = "claude_export/"
    else:
        emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
        if not emulator and not (a.project and a.live):
            ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
        from google.cloud import firestore
        project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
        db = firestore.Client(project=project)
        data = load_firestore(db)
        source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"

    p = plan(*data)
    if p["missing_birth"] or p["missing_reg"]:
        print(f"STOP: {len(p['missing_birth'])} members without a valid birthDate, "
              f"{len(p['missing_reg'])} publics without a registration date. Nothing written.")
        applied = False
    elif a.apply:
        print(f"Writing {apply(db, p)} document updates...")
        applied = True
    else:
        applied = False
    with open(a.report, "w", encoding="utf-8") as f:
        f.write(report(p, source, applied))
    print(f"Report: {os.path.relpath(a.report, ROOT)}")
    return 1 if (p["missing_birth"] or p["missing_reg"]) else 0


if __name__ == "__main__":
    sys.exit(main())
