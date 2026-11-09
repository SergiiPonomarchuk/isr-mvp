"""P1: read-only audit of the synthetic user profiles (users collection).

Reads the Firestore emulator (FIRESTORE_EMULATOR_HOST must be set) or, with
--project <id> --i-know-this-is-live, the live project (read-only). Never writes to Firestore.
Skill-vector coverage comes from the 2026-10-12 export (claude_export/emb_*_ids.json); the
vectors have not changed since (EMBEDDINGS #5).

Writes a Markdown report (default specs/tasks/P1-profile-audit.md). The profiles are synthetic;
the report quotes a few field values as examples, never e-mail addresses, passwords or tokens
(the users documents hold none).
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import glob
import json
import os
import re
import statistics
import sys
import warnings

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, "specs", "tasks", "P1-profile-audit.md")
EXPORT = os.path.join(ROOT, "claude_export")
TODAY = _dt.date(2026, 11, 10)
FIELDS = ["uid", "displayName", "firstName", "lastName", "birthDate", "gender", "nationality", "post", "skills",
          "features", "geography", "socialRelations", "offences", "marks", "isVerified", "values_description"]
LEVEL_RANK = {"Secondary": 1, "High School": 1, "Vocational Training": 2, "College": 3, "Associate": 3, "Bachelor": 4,
              "Master": 5, "PhD": 6, "Doctorate": 6}
OTHER_PERSON = re.compile(r"^(an?|the)\s+(older |younger |experienced |retired |local |former |friendly |senior |junior )*"
                          r"[a-z\- ]{0,40}?\b(who|whose|that)\b", re.I)


def pct(a, b):
    return f"{(100.0 * a / b):.1f} %" if b else "-"


def dist(values):
    v = sorted(x for x in values if x is not None)
    if not v:
        return "-"
    return f"min {v[0]}, median {v[len(v) // 2]}, max {v[-1]}"


def top(counter, n=10):
    return ", ".join(f"{k!s} ({c})" for k, c in counter.most_common(n))


def age_on(birth):
    try:
        b = _dt.date.fromisoformat(str(birth)[:10])
    except ValueError:
        return None
    return TODAY.year - b.year - ((TODAY.month, TODAY.day) < (b.month, b.day))


def load_users(db):
    users = []
    for d in db.collection("users").select(FIELDS).stream():
        x = d.to_dict()
        x["_id"] = d.id
        users.append(x)
    return users


def load_vector_ids():
    profile, experience = set(), collections.defaultdict(set)
    for p in sorted(glob.glob(os.path.join(EXPORT, "emb_profile_*_ids.json"))):
        for r in json.load(open(p, encoding="utf-8")):
            profile.add(str(r["uid"]))
    for p in sorted(glob.glob(os.path.join(EXPORT, "emb_experience_*_ids.json"))):
        for r in json.load(open(p, encoding="utf-8")):
            experience[str(r["uid"])].add(str(r["experience_key"]))
    return profile, experience


def audit(users, profile_vec_ids, exp_vec_ids):
    L = []
    n = len(users)
    by_uid = {str(u.get("uid")): u for u in users}
    incomplete = [u["_id"] for u in users if "skills" not in u]
    stub = [u for u in users if "skills" not in u]
    L += [f"Profiles: {n}. Without the usual fields (no `skills`, `post`, ...): {len(incomplete)} "
          f"(document ids {', '.join(repr(i) for i in incomplete) or '-'}; fields: "
          f"{', '.join(sorted({k for u in stub for k in u if k != '_id'})) or '-'}; uid {', '.join(repr(u.get('uid')) for u in stub) or '-'}).", ""]
    users = [u for u in users if "skills" in u]
    n = len(users)

    # ---------------------------------------------------------------- identity
    L += ["## 1. Identity and demographics", ""]
    mism = [u for u in users if u.get("displayName") != f"{u.get('firstName', '')} {u.get('lastName', '')}".strip()]
    ages = [age_on(u.get("birthDate")) for u in users]
    bad_dates = sum(1 for a in ages if a is None)
    L += [f"- `displayName` differs from `firstName lastName`: {len(mism)}"
          + (f" (e.g. {', '.join(repr(u.get('displayName')) for u in mism[:3])})" if mism else "") + ".",
          f"- `birthDate`: unparsable {bad_dates}; age on {TODAY}: {dist([a for a in ages if a is not None])}; "
          f"under 18: {sum(1 for a in ages if a is not None and a < 18)}; over 90: {sum(1 for a in ages if a is not None and a > 90)}.",
          f"- `gender`: {top(collections.Counter(u.get('gender') for u in users))}.",
          f"- `nationality`: {len(set(u.get('nationality') for u in users))} values; most common {top(collections.Counter(u.get('nationality') for u in users), 6)}.",
          f"- `isVerified`: {top(collections.Counter(u.get('isVerified') for u in users))}.",
          f"- `features`: non-empty in {sum(1 for u in users if u.get('features'))} of {n}."]
    minors = [u for u in users if (age_on(u.get("birthDate")) or 99) < 18]
    def has(u, t):
        return any(s.get("type") == t for s in u.get("skills") or [])
    L += [f"- Under 18 ({len(minors)}): with an education skill {sum(1 for u in minors if has(u, 'education'))}, with work experience "
          f"{sum(1 for u in minors if has(u, 'work experience'))}, with a job other than child/toddler/student/unemployed "
          f"{sum(1 for u in minors if (u.get('post') or [{}])[0].get('job') not in ('child', 'toddler', 'student', 'unemployed', None))}.", ""]

    # ---------------------------------------------------------------- post
    L += ["## 2. Job (`post`)", ""]
    plen = collections.Counter(len(u.get("post") or []) for u in users)
    posts = [p for u in users for p in (u.get("post") or [])]
    L += [f"- Entries per profile: {top(plen)}.",
          f"- `job`: {len(set(p.get('job') for p in posts))} distinct; most common {top(collections.Counter(p.get('job') for p in posts), 8)}.",
          f"- `department` empty: {sum(1 for p in posts if not p.get('department'))} of {len(posts)}; "
          f"`place` empty: {sum(1 for p in posts if not p.get('place'))}.",
          f"- `educationLevel` values: {top(collections.Counter(p.get('educationLevel') for p in posts))}.",
          f"- `salary`: {dist([p.get('salary') for p in posts if isinstance(p.get('salary'), (int, float))])}; zero or missing: "
          f"{sum(1 for p in posts if not p.get('salary'))}."]
    cmp_ = collections.Counter()
    for u in users:
        edu = [s for s in (u.get("skills") or []) if s.get("type") == "education"]
        best = max((LEVEL_RANK.get(s.get("educationLevel"), 0) for s in edu), default=None)
        for p in (u.get("post") or [])[:1]:
            lvl = LEVEL_RANK.get(p.get("educationLevel"))
            if best is None:
                cmp_["no education skill"] += 1
            elif lvl is None:
                cmp_["job level unknown"] += 1
            elif lvl == best:
                cmp_["same as highest education skill"] += 1
            elif lvl > best:
                cmp_["job level higher than any education skill"] += 1
            else:
                cmp_["job level lower"] += 1
    L += [f"- Job `educationLevel` against the highest education skill: {top(cmp_)}.", ""]

    # ---------------------------------------------------------------- skills
    L += ["## 3. Skills", ""]
    skills = [(u, s) for u in users for s in (u.get("skills") or [])]
    types = collections.Counter(s.get("type") for _, s in skills)
    per_user = collections.Counter(len(u.get("skills") or []) for u in users)
    L += [f"- Skills: {len(skills)}; by type: {top(types)}; per profile: {top(per_user, 8)}."]
    for t in sorted(types):
        ss = [s for _, s in skills if s.get("type") == t]
        keys = collections.Counter(k for s in ss for k in s)
        empty = {k: sum(1 for s in ss if k in s and s[k] in (None, "", [])) for k in keys}
        L.append(f"- `{t}`: fields {', '.join(f'`{k}` ({c}, empty {empty[k]})' for k, c in sorted(keys.items()))}.")
    dup_ids = sum(1 for u in users if len({str(s.get('id')) for s in u.get('skills') or []}) != len(u.get('skills') or []))
    L += [f"- Profiles with a repeated skill `id`: {dup_ids}.", ""]

    edu = [(u, s) for u, s in skills if s.get("type") == "education"]
    L += ["### Education", "",
          f"- `educationLevel`: {top(collections.Counter(s.get('educationLevel') for _, s in edu))}.",
          f"- `specialization`: {len(set(s.get('specialization') for _, s in edu))} distinct; {top(collections.Counter(s.get('specialization') for _, s in edu), 12)}.",
          f"- Institutions (`name`): {len(set(s.get('name') for _, s in edu))} distinct; e.g. {top(collections.Counter(s.get('name') for _, s in edu), 4)}."]
    grad_age = []
    for u, s in edu:
        try:
            by = int(str(u.get("birthDate"))[:4])
            grad_age.append(int(s.get("graduationYear")) - by)
        except (TypeError, ValueError):
            pass
    future = sum(1 for u, s in edu if isinstance(s.get("graduationYear"), int) and s["graduationYear"] > TODAY.year)
    L += [f"- Age at graduation: {dist(grad_age)}; under 16: {sum(1 for a in grad_age if a < 16)}; over 60: "
          f"{sum(1 for a in grad_age if a > 60)}; graduation year in the future: {future}.",
          f"- Same level and specialization twice in one profile: "
          f"{sum(1 for u in users if len([(s.get('educationLevel'), s.get('specialization')) for s in u['skills'] if s.get('type') == 'education']) != len({(s.get('educationLevel'), s.get('specialization')) for s in u['skills'] if s.get('type') == 'education'}))}.", ""]

    work = [(u, s) for u, s in skills if s.get("type") == "work experience"]
    other = [s for _, s in work if OTHER_PERSON.search(s.get("comment") or "")]
    clen = [len(s.get("comment") or "") for _, s in work]
    L += ["### Work experience", "",
          f"- Entries: {len(work)} in {len({str(u.get('uid')) for u, _ in work})} profiles.",
          f"- `name` empty: {sum(1 for _, s in work if not s.get('name'))}; `specialization` empty: "
          f"{sum(1 for _, s in work if not s.get('specialization'))}.",
          f"- `time` (years; E multiplies each cosine by it, `functions/isr.js` experienceSum): "
          f"{top(collections.Counter(s.get('time') for _, s in work))}.",
          f"- `comment` length: {dist(clen)} characters.",
          f"- Comments that describe another person (\"A/An/The … who …\"): {len(other)} of {len(work)} ({pct(len(other), len(work))}).",
          "- Examples: " + "; ".join(f"\"{s.get('comment')}\"" for s in other[:3]) + ".",
          "- Other examples: " + "; ".join([f"\"{s.get('comment')}\"" for _, s in work if s not in other][:3]) + ".", ""]

    act = [s for _, s in skills if s.get("type") == "activity"]
    L += ["### Activities", "",
          f"- Entries: {len(act)}; `name`: {len(set(s.get('name') for s in act))} distinct; {top(collections.Counter(s.get('name') for s in act), 10)}.",
          f"- `time`: {top(collections.Counter(s.get('time') for s in act))}.", ""]

    # ---------------------------------------------------------------- vectors
    L += ["## 4. Embedding coverage (export of 2026-10-12)", ""]
    no_profile_vec = sum(1 for u in users if str(u.get("uid")) not in profile_vec_ids)
    missing = collections.Counter()
    orphan = 0
    for u in users:
        ids = {str(s.get("id")): s.get("type") for s in u.get("skills") or []}
        have = exp_vec_ids.get(str(u.get("uid")), set())
        for sid, t in ids.items():
            if sid not in have:
                missing[t] += 1
        orphan += len(have - set(ids))
    L += [f"- Profiles without a profile vector: {no_profile_vec}.",
          f"- Skills without a skill vector: {top(missing) or 'none'}; vectors without a matching skill: {orphan}.", ""]

    # ---------------------------------------------------------------- places, relations, other
    L += ["## 5. Places, relations, other fields", ""]
    geo = [g for u in users for g in (u.get("geography") or [])]
    L += [f"- `geography` entries per profile: {top(collections.Counter(len(u.get('geography') or []) for u in users))}; "
          f"types: {top(collections.Counter(g.get('type') for g in geo))}; without coordinates: "
          f"{sum(1 for g in geo if not (isinstance(g.get('geo'), list) and len(g['geo']) == 2))}."]
    rels = [(u, r) for u in users for r in (u.get("socialRelations") or [])]
    dangling = sum(1 for _, r in rels if str(r.get("relative")) not in by_uid)
    selfref = sum(1 for u, r in rels if str(r.get("relative")) == str(u.get("uid")))
    pairs = {(str(u.get("uid")), str(r.get("relative"))) for u, r in rels}
    one_way = sum(1 for a, b in pairs if (b, a) not in pairs)
    L += [f"- `socialRelations` per profile: {top(collections.Counter(len(u.get('socialRelations') or []) for u in users))}; "
          f"types: {top(collections.Counter(r.get('type') for _, r in rels))}.",
          f"- Relations to a user that does not exist: {dangling}; to oneself: {selfref}; one-way (no relation back): {one_way} of {len(pairs)}.",
          f"- `offences`: profiles with at least one: {sum(1 for u in users if u.get('offences'))}; "
          f"severity: {top(collections.Counter(o.get('severity') for u in users for o in u.get('offences') or []))}. Not read by any formula.",
          f"- `marks` (reaction totals): present in {sum(1 for u in users if u.get('marks'))}.",
          f"- `values_description`: {sum(1 for u in users if u.get('values_description'))} profiles; length "
          f"{dist([len(u['values_description']) for u in users if u.get('values_description')])} characters.", ""]
    return L


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live reads need --project and --i-know-this-is-live)")
    warnings.filterwarnings("ignore")
    from google.cloud import firestore
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project} (read-only)"
    users = load_users(db)
    profile_ids, exp_ids = load_vector_ids()
    lines = ["# P1 profile audit", "",
             f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/audit_profiles.py` (read-only).",
             f"Source: {source}. Vector coverage: `claude_export/emb_*_ids.json` (2026-10-12).", ""]
    lines += audit(users, profile_ids, exp_ids)
    with open(a.report, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Report: {os.path.relpath(a.report, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
