"""L1 migration: prolong the deadlines of the test topics and give seeded discussions their phase.

Dry run by default. Reads Firestore: the emulator (FIRESTORE_EMULATOR_HOST must be set), or the
live project with --project <id> --i-know-this-is-live (the author's step only).

What it changes (decisions 8 and 13 of specs/tasks/L1-deadlines-and-management-decisions.md):
  * every chat and voting topic whose deadline is missing or earlier than the new date gets the
    new date, on the discussion and on the issue (running it again with a later --new-deadline,
    before that date, prolongs again);
  * seeded discussions of voting and ToDo topics, which have no status, get the status the app
    writes ("Voting", "approved"), so voting topics leave the Chat list.
Member documents, votes and options are not changed.

The report also previews the first deadline run after the new date with today's options and
votes (rules ported from functions/lifecycle.js; both are checked on
tests/fixtures/lifecycle_cases.json). Prints no personal fields; topic ids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import isr_core  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, "specs", "tasks", "L1-migration-report.md")

MANAGEMENT_THRESHOLD = 0.30
MIN_VOTED_SHARE = 0.30
MIN_OPTIONS = 1
EXTEND_DAYS = 7
CHAT_DEADLINE_MONTHS = 1
TIME_ZONE = "Europe/Zurich"
EPS = 1e-9


# ------------------------------------------------------------------ rules (port of lifecycle.js)

def is_date(s):
    if not isinstance(s, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return False
    try:
        _dt.date.fromisoformat(s)
        return True
    except ValueError:
        return False


def add_days(s, n):
    return (_dt.date.fromisoformat(s) + _dt.timedelta(days=n)).isoformat()


def add_months(s, n):
    d = _dt.date.fromisoformat(s)
    m = d.month - 1 + n
    y = d.year + m // 12
    m = m % 12 + 1
    last = (_dt.date(y + (m == 12), m % 12 + 1, 1) - _dt.timedelta(days=1)).day
    return _dt.date(y, m, min(d.day, last)).isoformat()


def is_expired(ends, today):
    return is_date(ends) and ends < today


def extend_deadline(ends, floor_date, days=EXTEND_DAYS):
    base = ends if is_date(ends) and ends >= floor_date else floor_date
    return add_days(base, days)


def chat_deadline(requested, today):
    if is_date(requested) and requested >= today:
        return requested
    return add_months(today, CHAT_DEADLINE_MONTHS)


def today_in(tz=TIME_ZONE):
    try:
        from zoneinfo import ZoneInfo
        return _dt.datetime.now(ZoneInfo(tz)).date().isoformat()
    except Exception:  # no tz database: the machine's date
        return _dt.date.today().isoformat()


def phase_of(disc, issue):
    ds = (disc or {}).get("status")
    st = (issue or {}).get("status")
    if st == "archived" or ds == "archived":
        return "archived"
    if st == "in_process" or ds == "Voting":
        return "voting"
    if st in ("approved", "tasks") or ds == "approved":
        return "todo"
    if st == "inactive" or ds == "inactive":
        return "inactive"
    return "chat"


def pool(isr_by_uid):
    s = 0.0
    for v in (isr_by_uid or {}).values():
        try:
            x = float(v)
        except (TypeError, ValueError):
            continue
        if math.isfinite(x) and x > 0:
            s += x
    return s


def voting_outcome(votes, isr_by_uid, option_count):
    p = pool(isr_by_uid)
    t = isr_core.tally(votes or {}, isr_by_uid or {}, option_count or 0)
    voted = sum(c["weight"] for c in t["counted"])
    share = voted / p if p > 0 else 0.0
    if p <= 0:
        result, reason = "cancel", "no ISR pool"
    elif not t["counted"]:
        result, reason = "cancel", "no votes"
    elif share < MIN_VOTED_SHARE - EPS:
        result, reason = "cancel", "below 30 % voted"
    elif t["winner"] is None:
        result, reason = "tie", t["note"]
    else:
        result, reason = "todo", "winner"
    return {"pool": p, "voted": voted, "share": share, "winner": t["winner"], "result": result, "reason": reason}


def deadline_outcome(topic, today):
    none = {"action": None, "reason": "", "votedShare": None, "newEnds": None}
    if not is_expired(topic.get("ends"), today):
        return none
    if topic.get("phase") == "chat":
        if (topic.get("optionCount") or 0) >= MIN_OPTIONS:
            return {"action": "to_voting", "reason": "options proposed", "votedShare": None, "newEnds": add_days(today, EXTEND_DAYS)}
        return {"action": "cancel", "reason": "no options", "votedShare": None, "newEnds": None}
    if topic.get("phase") == "voting":
        v = voting_outcome(topic.get("votes"), topic.get("isrByUid"), topic.get("optionCount"))
        if v["result"] == "todo":
            return {"action": "to_todo", "reason": v["reason"], "votedShare": v["share"], "newEnds": None}
        if v["result"] == "tie":
            return {"action": "extend", "reason": v["reason"], "votedShare": v["share"],
                    "newEnds": extend_deadline(topic.get("ends"), add_days(today, -1))}
        return {"action": "cancel", "reason": v["reason"], "votedShare": v["share"], "newEnds": None}
    return none


# ------------------------------------------------------------------ loading

def load_firestore(db):
    discussions = {d.id: d.to_dict() for d in db.collection("discussions").select(
        ["status", "previous_status", "ends", "options_v2", "cancel_reason"]).stream()}
    issues = {d.id: d.to_dict() for d in db.collection("issues").select(
        ["status", "previous_status", "ends", "options", "votes"]).stream()}
    mc_issue = {d.id: d.to_dict().get("issue_id") for d in db.collection("microcommunities").select(["issue_id"]).stream()}
    isr_by_issue = collections.defaultdict(dict)
    for d in db.collection("microcommunity_members").select(["microcommunity_id", "user_id", "isr_score"]).stream():
        x = d.to_dict()
        if x.get("isr_score") is None:
            continue
        mc = str(x.get("microcommunity_id"))
        issue_id = str(mc_issue.get(mc) or mc)
        isr_by_issue[issue_id][str(x.get("user_id")).strip()] = float(x["isr_score"])
    return discussions, issues, isr_by_issue


# ------------------------------------------------------------------ planning

def plan(discussions, issues, isr_by_issue, new_date):
    updates = []  # (collection, doc id, {field: value})
    stats = collections.Counter()
    preview = collections.Counter()
    moved = []
    run_day = add_days(new_date, 1)
    for tid in sorted(set(discussions) | set(issues), key=str):
        d, i = discussions.get(tid), issues.get(tid)
        phase = phase_of(d, i)
        stats[f"topics: {phase}"] += 1
        d_upd, i_upd = {}, {}
        ends = None
        if phase in ("chat", "voting"):
            ends = ((i or {}).get("ends") or (d or {}).get("ends")) if phase == "voting" else (d or {}).get("ends")
            if not is_date(ends) or ends < new_date:
                stats[f"{phase}: deadline {'missing' if not is_date(ends) else 'earlier'} -> new date"] += 1
                ends = new_date
                if d is not None and d.get("ends") != new_date:
                    d_upd["ends"] = new_date
                if i is not None and i.get("ends") != new_date:
                    i_upd["ends"] = new_date
            elif phase == "voting" and d is not None and i is not None and d.get("ends") != ends:
                d_upd["ends"] = ends  # R4: the same deadline on both documents
                stats["voting: discussion deadline aligned with the issue"] += 1
        if d is not None and not d.get("status"):
            if phase == "voting":
                d_upd["status"] = "Voting"
                stats["voting: discussion status -> Voting"] += 1
            elif phase == "todo":
                d_upd["status"] = "approved"
                stats["todo: discussion status -> approved"] += 1
        if d_upd:
            updates.append(("discussions", tid, d_upd))
        if i_upd:
            updates.append(("issues", tid, i_upd))
        if phase in ("chat", "voting"):
            topic = {"phase": phase, "ends": ends}
            if phase == "chat":
                topic["optionCount"] = len((d or {}).get("options_v2") or [])
            else:
                topic["optionCount"] = len((i or {}).get("options") or [])
                topic["votes"] = {str(k).strip(): v for k, v in ((i or {}).get("votes") or {}).items()}
                topic["isrByUid"] = isr_by_issue.get(tid, {})
            out = deadline_outcome(topic, run_day)
            if out["action"]:
                preview[(phase, out["action"], out["reason"])] += 1
                if out["action"] != "cancel":
                    moved.append((tid, phase, out["action"], out["reason"]))
    return {"updates": updates, "stats": stats, "preview": preview, "moved": moved, "run_day": run_day}


# ------------------------------------------------------------------ report and apply

def report(p, source, applied, new_date):
    lines = ["# L1 migration report", "",
             f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_l1.py`.",
             f"Source: {source}. Mode: {'APPLIED' if applied else 'dry run (nothing written)'}. New deadline: {new_date}.", "",
             "## Changes", "", "| Item | Count |", "|---|---|"]
    for k in sorted(p["stats"]):
        lines.append(f"| {k} | {p['stats'][k]} |")
    n_d = sum(1 for c, _, _ in p["updates"] if c == "discussions")
    n_i = sum(1 for c, _, _ in p["updates"] if c == "issues")
    lines += [f"| documents to update: discussions | {n_d} |", f"| documents to update: issues | {n_i} |", "",
              f"## Preview: the deadline run on {p['run_day']} with today's options and votes", "",
              "| Phase | Outcome | Reason | Topics |", "|---|---|---|---|"]
    for (phase, action, reason), n in sorted(p["preview"].items()):
        lines.append(f"| {phase} | {action} | {reason} | {n} |")
    if not p["preview"]:
        lines.append("| - | nothing expires | - | 0 |")
    lines += ["", "Topics that would not be canceled: " +
              (", ".join(f"{tid} ({phase} -> {action})" for tid, phase, action, _ in p["moved"]) or "none") + ".", "",
              "Prolonging again before that date (a later `--new-deadline`) postpones the run; proposing options "
              "in chats and voting with at least 30 % of a public's ISR-score changes the outcome."]
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
    ap.add_argument("--new-deadline", default=None, help="YYYY-MM-DD (default: today in Europe/Zurich + 1 month)")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)
    new_date = a.new_deadline or add_months(today_in(), CHAT_DEADLINE_MONTHS)
    if not is_date(new_date):
        ap.error("--new-deadline must be YYYY-MM-DD")
    if new_date < today_in():
        ap.error("--new-deadline must not be in the past")
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
    from google.cloud import firestore
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"
    p = plan(*load_firestore(db), new_date)
    applied = False
    if a.apply:
        print(f"Writing {apply(db, p)} document updates...")
        applied = True
    with open(a.report, "w", encoding="utf-8") as f:
        f.write(report(p, source, applied, new_date))
    print(f"Report: {os.path.relpath(a.report, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
