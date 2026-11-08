"""A1 migration (roadmap stage 2, R11): make the cached maps equal to the member values.

Dry run by default. Sources:
  --source export     read claude_export/ (read-only; report only)
  --source firestore  read the Firestore emulator (FIRESTORE_EMULATOR_HOST must be set);
                      --apply writes there.
A run against the live project needs --project <id> --i-know-this-is-live and is the
author's step only. Run it after migrate_a2.py and migrate_a3.py.

For every ad-hoc public, the `relevance_scores` and `isr_scores` maps of its discussion
and its issue are replaced by the member values (`relevance_score`, `isr_score`, 3 decimals):
no floors, members only. Members without an ISR (the 2 app-created publics have none until
stage 1) appear in `relevance_scores` but not in `isr_scores`. Member documents are not
changed. The report also shows, for every issue with votes, the tally as the old browser
computed it (map, else member ISR, else 1.5 x relevance) and with the member ISR (shared
module; voters without an ISR excluded). Prints no personal fields; user ids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import isr_core  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, "claude_export")
REPORT = os.path.join(ROOT, "specs", "tasks", "A1-migration-report.md")
EPS = 0.0005


def norm_uid(value):
    if isinstance(value, str) and value.strip().isdigit():
        return int(value.strip())
    return value


def r3(x):
    return round(float(x), 3)


# ------------------------------------------------------------------ loading

def _jsonl(pattern):
    for path in sorted(glob.glob(os.path.join(EXPORT, pattern))):
        with open(path, encoding="utf-8") as f:
            for line in f:
                yield json.loads(line)


def load_export():
    members = [dict(m, user_id=norm_uid(m.get("user_id"))) for m in _jsonl("microcommunity_members_*.jsonl")]
    mcs = {str(d["doc_id"]): d for d in _jsonl("microcommunities_*.jsonl")}
    discussions = {str(d["doc_id"]): d for d in _jsonl("discussions_full_*.jsonl")}
    issues = {str(d["doc_id"]): d for d in _jsonl("issues_*.jsonl")}
    return members, mcs, discussions, issues


def load_firestore(db):
    members = []
    for d in db.collection("microcommunity_members").select(
            ["microcommunity_id", "user_id", "relevance_score", "isr_score"]).stream():
        x = d.to_dict()
        x["user_id"] = norm_uid(x.get("user_id"))
        members.append(x)
    mcs = {d.id: d.to_dict() for d in db.collection("microcommunities").select(["issue_id"]).stream()}
    fields = ["relevance_scores", "isr_scores", "votes", "options", "options_v2", "status"]
    discussions = {d.id: d.to_dict() for d in db.collection("discussions").select(fields).stream()}
    issues = {d.id: d.to_dict() for d in db.collection("issues").select(fields).stream()}
    return members, mcs, discussions, issues


# ------------------------------------------------------------------ planning

def new_maps(ms):
    rel, isr = {}, {}
    for m in ms:
        uid = str(m["user_id"])
        if m.get("relevance_score") is not None:
            rel[uid] = r3(m["relevance_score"])
        if m.get("isr_score") is not None:
            isr[uid] = r3(m["isr_score"])
    return rel, isr


def diff_map(old, new):
    old = {str(k): v for k, v in (old or {}).items()}
    changed = sum(1 for k in new if k in old and abs(float(old[k]) - new[k]) > EPS)
    added = sum(1 for k in new if k not in old)
    removed = [k for k in old if k not in new]
    return changed, added, removed


def old_tally(votes, old_isr, member_isr, old_rel, n):
    """What the browser computed before A1: map value, else member ISR, else 1.5 x relevance."""
    weights = {}
    for uid in votes:
        u = str(uid)
        if u in old_isr:
            weights[u] = float(old_isr[u])
        elif u in member_isr:
            weights[u] = member_isr[u]
        elif u in old_rel:
            weights[u] = float(old_rel[u]) * 1.5
    return isr_core.tally({str(k): v for k, v in votes.items()}, weights, n)


def plan(members, mcs, discussions, issues):
    by_public = collections.defaultdict(list)
    for m in members:
        by_public[str(m.get("microcommunity_id"))].append(m)
    updates = []  # (collection, doc id, {field: value})
    stats = collections.Counter()
    removed_users = collections.Counter()
    tally_rows = []
    for pub, ms in sorted(by_public.items()):
        doc_id = str(mcs.get(pub, {}).get("issue_id") or pub)
        rel, isr = new_maps(ms)
        member_isr = {str(m["user_id"]): float(m["isr_score"]) for m in ms if m.get("isr_score") is not None}
        for coll, docs in (("discussions", discussions), ("issues", issues)):
            d = docs.get(doc_id)
            if d is None:
                continue
            c1, a1, rem1 = diff_map(d.get("relevance_scores"), rel)
            c2, a2, rem2 = diff_map(d.get("isr_scores"), isr)
            stats[f"{coll}: docs"] += 1
            stats[f"{coll}: relevance entries changed / added / removed"] += 0
            stats[f"{coll}: relevance changed"] += c1
            stats[f"{coll}: relevance added"] += a1
            stats[f"{coll}: relevance removed"] += len(rem1)
            stats[f"{coll}: isr changed"] += c2
            stats[f"{coll}: isr added"] += a2
            stats[f"{coll}: isr removed"] += len(rem2)
            for u in set(rem1) | set(rem2):
                removed_users[u] += 1
            if c1 or a1 or rem1 or c2 or a2 or rem2:
                updates.append((coll, doc_id, {"relevance_scores": rel, "isr_scores": isr}))
                stats[f"{coll}: docs updated"] += 1
            if coll == "issues" and d.get("votes"):
                opts = d.get("options") or []
                n = len(opts)
                if n == 0:
                    continue
                before = old_tally(d["votes"], {str(k): v for k, v in (d.get("isr_scores") or {}).items()},
                                   member_isr, {str(k): v for k, v in (d.get("relevance_scores") or {}).items()}, n)
                after = isr_core.tally({str(k): v for k, v in d["votes"].items()}, isr, n)
                tally_rows.append((doc_id, d.get("status"), len(d["votes"]), before, after))
    return {"publics": len(by_public), "updates": updates, "stats": stats,
            "removed_users": removed_users, "tally": tally_rows}


# ------------------------------------------------------------------ report and apply

def report(p, source, applied):
    s = p["stats"]
    lines = ["# A1 migration report", "",
             f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_a1.py`.",
             f"Source: {source}. Mode: {'APPLIED' if applied else 'dry run (nothing written)'}.", "",
             "## Maps", "", "| Item | discussions | issues |", "|---|---|---|"]
    for k in ("docs", "docs updated", "relevance changed", "relevance added", "relevance removed",
              "isr changed", "isr added", "isr removed"):
        lines.append(f"| {k} | {s[f'discussions: {k}']} | {s[f'issues: {k}']} |")
    ru = p["removed_users"]
    lines += ["", f"Users removed from at least one map (not members of that public): {len(ru)}; "
              f"user \"1\" removed from {ru.get('1', 0)} docs.", ""]
    rows = p["tally"]
    changed_winner = [r for r in rows if r[3]["winner"] != r[4]["winner"]]
    excluded = sum(len(r[4]["excluded"]) for r in rows)
    lines += ["## Tallies of issues with votes", "",
              f"Issues with votes: {len(rows)}; the leading option changes in {len(changed_winner)}; "
              f"votes no longer counted (no ISR for that public): {excluded}.", "",
              "| Issue | Status | Votes | Old scores (old leader) | New scores (new leader) | Not counted |",
              "|---|---|---|---|---|---|"]
    for doc_id, status, nv, b, a in rows:
        fmt = lambda t: ", ".join(f"{x:.2f}" for x in t["scores"]) + f" ({t['winner'] if t['winner'] is not None else '-'})"
        lines.append(f"| {doc_id} | {status} | {nv} | {fmt(b)} | {fmt(a)} | {len(a['excluded'])} |")
    lines += ["", "Old = the browser before A1 (cached map, else member ISR, else 1.5 x relevance). "
              "New = member ISR via the shared module. Already approved issues keep their stored winner; "
              "the tally is only recomputed by the trigger when an issue is approved again."]
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
    ap.add_argument("--source", choices=("export", "firestore"), default="export")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)
    db = None
    if a.source == "export":
        if a.apply:
            ap.error("--apply needs --source firestore")
        data, source = load_export(), "claude_export/"
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
