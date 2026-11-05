"""A3 migration (R16a): G from the nearest of home, work and property for the
publics whose issue has a stored location, μ and σ.

Dry run by default. Sources:
  --source export     read claude_export/ (read-only; report only)
  --source firestore  read the Firestore emulator (FIRESTORE_EMULATOR_HOST must be set);
                      --apply writes there.
A run against the live project needs --project <id> --i-know-this-is-live and is
the author's step only. Run it after migrate_a2.py.

Per public with an issue location, μ (`mu_distance_meters`) and σ (`sigma_decay_meters`):
  - G = server formula with the nearest anchor (functions/geo.js); no cutoff, because
    membership is unchanged; a member without any anchor gets G = 0. G_anchor_type is stored.
  - relevance = w_D·D + w_G·G + w_S·S + w_X·X with the stored D, S, X and the public's
    relevance weights: the issue's w_demographic … w_social if they reproduce the stored
    relevance, otherwise the unique non-negative weights summing to 1 that reproduce it
    (within 0.002). If the G weight cannot be pinned down, the public is left unchanged.
  - normalized_relevance = relevance / public mean; isr_score with the ISR weights
    recovered as in A2 (members without stored ISR fields get G and relevance only).
  - The cached relevance_scores / isr_scores maps on discussions and issues are not
    changed (they are the floored tally numbers; task A1).
The stored G of these publics is not reproducible from the stored data (A3 impact
report), so G changes for most members, not only through the new anchors. Author
decision of 2026-11-05. Prints no personal fields; user ids only.
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

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import relevance_evaluator as rev  # noqa: E402
import expertise as ex  # noqa: E402

EXPORT = os.path.join(ROOT, "claude_export")
REPORT = os.path.join(ROOT, "specs", "tasks", "A3-migration-report.md")
TOL = 0.0021           # stored values have 3 decimals
COMPONENTS = ("D_score", "G_score", "S_score", "X_score")
ISSUE_W = ("w_demographic", "w_geographic", "w_semantic", "w_social")


# ------------------------------------------------------------------ pure functions

def reproduces(X, y, w):
    return float(np.max(np.abs(X @ np.asarray(w, dtype=float) - y))) <= TOL


def fit_relevance_weights(X, y, issue_weights=None):
    """Weights (w_D, w_G, w_S, w_X) a public's stored relevance was computed with.

    Returns (weights, source) or raises ValueError. The G weight must be unique among
    all non-negative weight vectors summing to 1 that reproduce the stored values."""
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    if issue_weights is not None and None not in issue_weights:
        if reproduces(X, y, issue_weights):
            return tuple(float(v) for v in issue_weights), "issue"
    # least squares with the sum-to-1 constraint as a heavily weighted extra row
    A = np.vstack([X, 100.0 * np.ones((1, 4))])
    b = np.concatenate([y, [100.0]])
    w, *_ = np.linalg.lstsq(A, b, rcond=None)
    if not reproduces(X, y, w) or abs(w.sum() - 1.0) > 1e-3 or w.min() < -0.005:
        raise ValueError("no non-negative weights summing to 1 reproduce the stored relevance")
    # identifiability of w_G: no direction in the null space of [X; 1] may move w_G
    M = np.vstack([X, np.ones((1, 4))])
    _, s, vt = np.linalg.svd(M)
    null = vt[np.sum(s > 1e-6 * s[0]):]
    if any(abs(v[1]) > 1e-6 for v in null):
        raise ValueError("the G weight is not identifiable from the stored values")
    w = np.clip(w, 0.0, None)
    w = w / w.sum()
    r = np.round(w, 2)
    if abs(r.sum() - 1.0) < 1e-9 and reproduces(X, y, r):
        w = r
    return tuple(float(v) for v in w), "recovered"


def normalize_by_mean(values):
    """As built (A2 / backfill): x / mean, 0 if mean <= 0."""
    mean = sum(values) / len(values) if values else 0.0
    return [(v / mean) if mean > 0.0 else 0.0 for v in values]


def recompute_public(members, users, location, mu, sigma, rel_weights, isr_weights):
    """New G, relevance, normalized relevance and ISR for one public (3 decimals)."""
    out = []
    rels = []
    for m in members:
        u = users.get(m["user_id"])
        near = rev.nearest_anchor((u or {}).get("geography"), location)
        g = rev.g_score(near[0], mu, sigma) if near else 0.0
        comps = [float(m.get("D_score", 0.0)), g, float(m.get("S_score", 0.0)), float(m.get("X_score", 0.0))]
        r = sum(w * c for w, c in zip(rel_weights, comps))
        rels.append(r)
        out.append({"G_score": round(g, 3), "G_anchor_type": near[1] if near else None,
                    "relevance_score": round(r, 3)})
    norm = normalize_by_mean(rels)
    for m, o, nr in zip(members, out, norm):
        if isr_weights is not None:
            o["normalized_relevance"] = round(nr, 3)
            o["isr_score"] = round(ex.isr(nr, float(m["normalized_experience"]),
                                          float(m.get("normalized_contribution", 1.0)), isr_weights), 3)
    return out


# ------------------------------------------------------------------ loading

def _jsonl(pattern):
    for path in sorted(glob.glob(os.path.join(EXPORT, pattern))):
        with open(path, encoding="utf-8") as f:
            for line in f:
                yield json.loads(line)


def load_export():
    members = [dict(m, _doc_id=m["doc_id"]) for m in _jsonl("microcommunity_members_*.jsonl")]
    issues = {str(d["doc_id"]): d for d in _jsonl("issues_*.jsonl")}
    mcs = {str(d["doc_id"]): d for d in _jsonl("microcommunities_*.jsonl")}
    users = {p["uid"]: {"geography": p.get("geography") or []} for p in _jsonl("profiles_*.jsonl")}
    return members, issues, mcs, users


def load_firestore(db):
    members = [dict(d.to_dict(), _doc_id=d.id) for d in db.collection("microcommunity_members").stream()]
    issues = {d.id: d.to_dict() for d in db.collection("issues").select(
        ["location", "mu_distance_meters", "sigma_decay_meters", *ISSUE_W]).stream()}
    mcs = {d.id: d.to_dict() for d in db.collection("microcommunities").select(["issue_id"]).stream()}
    users = {}
    for d in db.collection("users").select(["uid", "geography"]).stream():
        x = d.to_dict()
        uid = x.get("uid", d.id)
        users[int(uid) if str(uid).isdigit() else uid] = {"geography": x.get("geography") or []}
    return members, issues, mcs, users


def _location(issue):
    loc = issue.get("location") if issue else None
    if loc is None:
        return None
    if hasattr(loc, "latitude"):
        return (loc.latitude, loc.longitude)
    if isinstance(loc, dict) and "latitude" in loc:
        return (loc["latitude"], loc["longitude"])
    return None


# ------------------------------------------------------------------ planning

def plan(members, issues, mcs, users):
    by_public = collections.defaultdict(list)
    for m in members:
        by_public[str(m["microcommunity_id"])].append(m)
    updates, skipped, no_location = {}, {}, 0
    sources = collections.Counter()
    weights_seen = collections.Counter()
    rows = []
    for pub, ms in sorted(by_public.items()):
        issue = issues.get(str(mcs.get(pub, {}).get("issue_id", pub)))
        loc = _location(issue)
        mu = issue.get("mu_distance_meters") if issue else None
        sigma = issue.get("sigma_decay_meters") if issue else None
        if loc is None or mu is None or not sigma:
            no_location += 1
            continue
        X = [[float(m.get(c, 0.0)) for c in COMPONENTS] for m in ms]
        y = [float(m.get("relevance_score", 0.0)) for m in ms]
        try:
            rel_w, src = fit_relevance_weights(X, y, tuple(issue.get(k) for k in ISSUE_W))
        except ValueError as e:
            skipped[pub] = str(e)
            continue
        has_isr = all(k in m for m in ms for k in ("isr_score", "normalized_relevance", "normalized_experience"))
        isr_w = None
        if has_isr:
            try:
                isr_w = ex.fit_isr_weights(ms)
            except ValueError as e:
                skipped[pub] = f"ISR weights: {e}"
                continue
        missing_profile = [m["user_id"] for m in ms if m["user_id"] not in users]
        if missing_profile:
            skipped[pub] = f"{len(missing_profile)} members without a user profile"
            continue
        sources[src] += 1
        weights_seen[tuple(round(v, 3) for v in rel_w)] += 1
        for m, new in zip(ms, recompute_public(ms, users, loc, float(mu), float(sigma), rel_w, isr_w)):
            updates[m["_doc_id"]] = new
            rows.append((pub, m, new, has_isr))
    return {"publics": len(by_public), "no_location": no_location, "updates": updates,
            "skipped": skipped, "sources": sources, "weights": weights_seen, "rows": rows}


def _changed(a, b):
    return round(abs(float(a) - float(b)), 3) > 0.001


def report(p, source, applied):
    rows = p["rows"]
    g_changed = [r for r in rows if _changed(r[1].get("G_score", 0), r[2]["G_score"])]
    by_anchor = collections.Counter(r[2]["G_anchor_type"] for r in g_changed)
    rel_d = [r[2]["relevance_score"] - float(r[1].get("relevance_score", 0)) for r in rows]
    isr_d = [r[2]["isr_score"] - float(r[1]["isr_score"]) for r in rows if r[3]]
    anchor_all = collections.Counter(r[2]["G_anchor_type"] for r in rows)

    def dist(d):
        if not d:
            return "none"
        q = statistics.quantiles(d, n=20) if len(d) > 1 else [d[0], d[0]]
        return (f"min {min(d):+.3f}, 5% {q[0]:+.3f}, median {statistics.median(d):+.3f}, "
                f"95% {q[-1]:+.3f}, max {max(d):+.3f}; mean |change| {statistics.mean(abs(x) for x in d):.3f}")

    lines = [
        "# A3 migration report",
        "",
        f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_a3.py`.",
        f"Source: {source}. Mode: {'APPLIED' if applied else 'dry run (nothing written)'}.",
        "",
        "| Item | Count |",
        "|---|---|",
        f"| Ad-hoc publics | {p['publics']} |",
        f"| Publics without a stored location, μ or σ (unchanged) | {p['no_location']} |",
        f"| Publics recomputed | {sum(p['sources'].values())} |",
        f"| of which relevance weights from the issue / recovered | {p['sources']['issue']} / {p['sources']['recovered']} |",
        f"| Publics skipped | {len(p['skipped'])} |",
        f"| Members recomputed | {len(rows)} |",
        f"| Nearest anchor: home / work / property / none | {anchor_all['home']} / {anchor_all['work']} / {anchor_all['property']} / {anchor_all[None]} |",
        f"| G changed by > 0.001 | {len(g_changed)} |",
        f"| of which nearest anchor home / work / property / none | {by_anchor['home']} / {by_anchor['work']} / {by_anchor['property']} / {by_anchor[None]} |",
        f"| Relevance changed by > 0.001 | {sum(1 for x in rel_d if round(abs(x), 3) > 0.001)} |",
        f"| Members whose relevance falls to 0.15 or below (they stay members) | {sum(1 for r in rows if r[2]['relevance_score'] <= 0.15 < float(r[1].get('relevance_score', 0)))} |",
        f"| ISR changed by > 0.001 | {sum(1 for x in isr_d if round(abs(x), 3) > 0.001)} (of {len(isr_d)} members with ISR) |",
        "",
        "## Relevance change (new − old)",
        "",
        dist(rel_d) + ".",
        "",
        "## ISR change (new − old)",
        "",
        dist(isr_d) + ".",
        "",
        "## Relevance weights used (w_D, w_G, w_S, w_X)",
        "",
        "Where D, S or X are constant in a public, their weights are not unique; the row shows one solution. "
        "The G weight is always unique (checked), so the recomputed relevance does not depend on that choice.",
        "",
        "| Weights | Publics |",
        "|---|---|",
    ] + [f"| {w} | {n} |" for w, n in p["weights"].most_common()]
    if p["skipped"]:
        lines += ["", "## Skipped publics (unchanged)", ""] + [f"- `{k}`: {v}" for k, v in p["skipped"].items()]
    lines += ["", "G changes for members whose nearest anchor is home come from replacing a stored G that is not "
              "reproducible from the stored data (A3 impact report), not from the anchor rule."]
    return "\n".join(lines) + "\n"


def apply(db, p):
    batch, n = db.batch(), 0
    for doc_id, upd in p["updates"].items():
        batch.update(db.collection("microcommunity_members").document(doc_id), upd)
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
    applied = False
    if a.apply:
        print(f"Writing {apply(db, p)} member updates...")
        applied = True
    with open(a.report, "w", encoding="utf-8") as f:
        f.write(report(p, source, applied))
    print(f"Report: {os.path.relpath(a.report, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
