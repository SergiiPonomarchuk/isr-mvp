"""A3 impact report (read-only): what the nearest-anchor rule for G would change.

Reads claude_export/ only and writes specs/tasks/A3-impact-report.md. Prints no
personal fields.

For each ad-hoc public it needs the issue location and μ, σ. Those are stored only
on the `issues` docs (80); seeded discussions carry no location. It also checks
whether the stored G of current members can be reproduced from the stored data
(home anchor, issue location, μ and σ), with both as-built formulas:
  - server rule: μ = mu_distance_meters, σ = sigma_decay_meters;
  - path B rule (relevance_evaluator.py, used by the seed script): μ = affection_distance km × 1000, σ = 0.5 μ.
"""
from __future__ import annotations

import collections
import datetime as _dt
import glob
import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, "claude_export")
REPORT = os.path.join(ROOT, "specs", "tasks", "A3-impact-report.md")
sys.path.insert(0, ROOT)
import relevance_evaluator as rev  # noqa: E402


def jsonl(pattern):
    for path in sorted(glob.glob(os.path.join(EXPORT, pattern))):
        with open(path, encoding="utf-8") as f:
            for line in f:
                yield json.loads(line)


def home_distance(user, loc):
    for g in user.get("geography") or []:
        if g.get("type") == "home" and isinstance(g.get("geo"), list):
            return rev.haversine_distance(g["geo"][0], g["geo"][1], loc[0], loc[1])
    return None


def main():
    users = {p["uid"]: p for p in jsonl("profiles_*.jsonl")}
    issues = {str(d["doc_id"]): d for d in jsonl("issues_*.jsonl")}
    mcs = {str(d["doc_id"]): d for d in jsonl("microcommunities_*.jsonl")}
    by_public = collections.defaultdict(list)
    for m in jsonl("microcommunity_members_*.jsonl"):
        by_public[str(m["microcommunity_id"])].append(m)

    c = collections.Counter()
    nonmember_gain = 0
    nonmember_gain_publics = 0
    per_public_gain = []

    for pub, ms in by_public.items():
        issue = issues.get(str(mcs.get(pub, {}).get("issue_id", pub)))
        loc = issue.get("location") if issue else None
        if not loc:
            c["publics without a stored location"] += 1
            c["members in publics without a stored location"] += len(ms)
            continue
        loc = (loc["latitude"], loc["longitude"])
        mu = issue.get("mu_distance_meters")
        sg = issue.get("sigma_decay_meters")
        aff = issue.get("affection_distance")
        c["publics with a stored location"] += 1
        member_ids = set()
        for m in ms:
            member_ids.add(m["user_id"])
            u = users.get(m["user_id"])
            if not u:
                continue
            c["members checked"] += 1
            hd = home_distance(u, loc)
            near = rev.nearest_anchor(u.get("geography"), loc)
            stored = float(m.get("G_score", 0.0))
            if hd is not None and mu is not None and sg:
                if abs(rev.g_score(hd, mu, sg) - stored) < 0.002:
                    c["stored G reproduced (server rule, home)"] += 1
            if hd is not None and aff is not None:
                mub = float(aff) * 1000.0
                if mub > 0 and abs(rev.g_score(hd, mub, 0.5 * mub) - stored) < 0.002:
                    c["stored G reproduced (path B rule, home)"] += 1
            if near and near[1] != "home":
                c["members whose nearest anchor is not home"] += 1
                if mu is not None and sg and hd is not None:
                    if rev.g_score(near[0], mu, sg) > rev.g_score(hd, mu, sg) + 0.001:
                        c["of which G would rise (server rule)"] += 1
        if mu is None or not sg:
            continue
        gain = 0
        for uid, u in users.items():
            if uid in member_ids:
                continue
            near = rev.nearest_anchor(u.get("geography"), loc)
            hd = home_distance(u, loc)
            cutoff = mu + 3 * sg
            if near and near[0] <= cutoff and (hd is None or hd > cutoff):
                gain += 1
        if gain:
            nonmember_gain_publics += 1
            nonmember_gain += gain
            per_public_gain.append((pub, gain))

    lines = [
        "# A3 impact report (read-only)",
        "",
        f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/a3_impact_report.py` from `claude_export/`. Nothing was written.",
        "",
        "| Item | Count |",
        "|---|---|",
        f"| Ad-hoc publics | {len(by_public)} |",
    ]
    for k in ("publics with a stored location", "publics without a stored location",
              "members in publics without a stored location", "members checked",
              "stored G reproduced (server rule, home)", "stored G reproduced (path B rule, home)",
              "members whose nearest anchor is not home", "of which G would rise (server rule)"):
        lines.append(f"| {k[0].upper() + k[1:]} | {c[k]} |")
    lines += [
        f"| Non-members who would pass the distance stage only through a work or property anchor | {nonmember_gain} (in {nonmember_gain_publics} publics) |",
        "",
        "## Reading",
        "",
        "- Seeded discussions carry no location, μ or σ; only the 80 `issues` docs do. G cannot be computed for members of the other publics.",
        "- The stored G of current members is reproduced by neither as-built rule for most members, so the location, μ or σ used when G was stored are not the ones stored now. A recomputation would change G for members whose nearest anchor is home as well, not only through the new anchors.",
        "- Non-members are counted, not added: their S cannot be computed (no issue vectors, EMBEDDINGS.md fact 12).",
    ]
    if per_public_gain:
        lines += ["", "## Non-members passing the distance stage only through a work or property anchor", "",
                  "| Public | Count |", "|---|---|"] + [f"| {p} | {n} |" for p, n in sorted(per_public_gain, key=lambda x: -x[1])[:20]]
    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Report: {os.path.relpath(REPORT, ROOT)}")


if __name__ == "__main__":
    main()
