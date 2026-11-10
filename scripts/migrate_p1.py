"""P1 migration: repair of the synthetic profiles (users collection), as the author decided on
2026-11-10 ("P1 as recommended": specs/tasks/P1-profile-review.md, proposals 1a, 2, 3a, 4a, 5a, 6, 7).

Three kinds of run:

  python scripts/migrate_p1.py --generate [--limit N] [--max-requests N] [--batch N]
      Writes the work-experience texts with the A4 text model into scripts/p1_generated/
      (Firestore is only read). Resumable: a person already generated from the same input is skipped.
  python scripts/migrate_p1.py
      Dry run: plans every repair from Firestore and the generated texts, writes the report, writes
      nothing to Firestore.
  python scripts/migrate_p1.py --apply [--allow-partial]
      Writes the plan. Refuses while people with work experience have no generated text, unless
      --allow-partial.

Firestore: the emulator (FIRESTORE_EMULATOR_HOST) unless --project <id> --i-know-this-is-live; the
live --apply is the author's step, after a backup.

The repairs:
- Work experience (1a, 2): every entry keeps its id and type. name = the role, specialization = the
  field, time = the years, comment = one sentence on what the person did. The model writes them from
  the person's age, job, education and the old comment. A person's years total at most age - 16 on
  REF_DATE; more is scaled down. The fields are the existing ones, so the profile view
  (prototype/js/main.js), E (functions/isr.js experienceSum reads time) and the A4 skill template
  need no change. Activities keep time = 1 (no formula reads it).
- Graduation (3a): graduationYear = birth year + the level's age (GRAD_AGE) + a per-person offset of
  -1, 0 or +1 (from the uid). A second entry of the same level is 2 years after the first, and the
  years increase with the level. A year after REF_DATE's year is kept and marked in_progress: true.
- Job education level (4a): post[0].educationLevel = the highest completed education entry
  (null without one, as stored today).
- Features (5a) and the unused fields (7): unchanged.
- users/None (6): deleted (the stub with uid None and no skills).
- user_packs (R3): if the collection has documents (live: 37), it is rebuilt from the repaired
  profiles in packs of 250, with the fields migrate_option_a.py packs. The emulator has none:
  checkIssue reads users there, and nothing is written.

The key: GEMINI_API_KEY from the environment or functions/.secret.local; it is never printed or
logged. Prints and reports uids only, no names.
"""
from __future__ import annotations

import argparse
import collections
import copy
import datetime as _dt
import hashlib
import json
import math
import os
import re
import statistics
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, "specs", "tasks", "P1-migration-report.md")
GEN_DIR = os.path.join(ROOT, "scripts", "p1_generated")
PEOPLE_FILE = "work_experience.jsonl"
CALLS_FILE = "calls.jsonl"

REF_DATE = _dt.date(2026, 11, 10)            # the date of the audit; ages and "in progress" are taken on it
TEXT_MODEL = "gemini-3.1-flash-lite"          # the A4 text model (functions/ai-config.js TEXT_MODEL)
SEED = 20261110                               # functions/ai-config.js SEED
PROMPT_VERSION = "p1w1"
WORK_START_AGE = 16
MIN_YEARS = 0.5
GRAD_AGE = {"Vocational Training": 19, "College": 20, "Bachelor": 22, "Master": 24, "PhD": 28}
LEVEL_RANK = {"Vocational Training": 2, "College": 3, "Bachelor": 4, "Master": 5, "PhD": 6}
SAME_LEVEL_GAP = 2
PACK_SIZE = 250
PACK_FIELDS = ["uid", "displayName", "birthDate", "gender", "post", "skills", "geography", "socialRelations", "features"]
LOAD_FIELDS = sorted(set(PACK_FIELDS))
MIN_SECONDS_PER_CALL = 5.0                    # 12 requests a minute, below the free tier's 15
WE = "work experience"


# ------------------------------------------------------------------ small helpers

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def age_on(birth, on=REF_DATE):
    try:
        b = _dt.date.fromisoformat(str(birth)[:10])
    except ValueError:
        return None
    return on.year - b.year - ((on.month, on.day) < (b.month, b.day))


def birth_year(birth):
    try:
        return _dt.date.fromisoformat(str(birth)[:10]).year
    except ValueError:
        return None


def person_offset(uid) -> int:
    """-1, 0 or +1 years, fixed per person."""
    return int(sha256(f"p1-grad:{uid}"), 16) % 3 - 1


def num(x):
    """A number as stored: one decimal, an int when whole."""
    x = round(float(x), 1)
    return int(x) if x == int(x) else x


def redact(text, key=None) -> str:
    s = str(text)
    if key:
        s = s.replace(key, "[redacted]")
    return re.sub(r"(key=)[^&\s]+", r"\1[redacted]", s)


# ------------------------------------------------------------------ the rules (3a, 4a, 2)

def repair_education(skills, uid, birth):
    """Returns (skills, changes). Education entries get the graduation year of their level (3a)."""
    out = copy.deepcopy(skills or [])
    by = birth_year(birth)
    edu = [s for s in out if s.get("type") == "education"]
    changes = []
    if by is None or not edu:
        return out, changes
    known = sorted((s for s in edu if s.get("educationLevel") in GRAD_AGE),
                   key=lambda s: (LEVEL_RANK[s["educationLevel"]], int(s.get("id") or 0)))
    off = person_offset(uid)
    prev_year, last_by_level = None, {}
    for s in known:
        lvl = s["educationLevel"]
        year = by + GRAD_AGE[lvl] + off
        if lvl in last_by_level:
            year = max(year, last_by_level[lvl] + SAME_LEVEL_GAP)
        if prev_year is not None and year <= prev_year:
            year = prev_year + 1
        prev_year = last_by_level[lvl] = year
        old = (s.get("graduationYear"), s.get("in_progress"))
        s["graduationYear"] = year
        if year > REF_DATE.year:
            s["in_progress"] = True
        else:
            s.pop("in_progress", None)
        if old != (s.get("graduationYear"), s.get("in_progress")):
            changes.append((s.get("id"), old[0], year))
    return out, changes


def highest_completed_level(skills):
    done = [s for s in skills or [] if s.get("type") == "education" and s.get("educationLevel") in LEVEL_RANK
            and not s.get("in_progress")]
    if not done:
        return None
    return max(done, key=lambda s: LEVEL_RANK[s["educationLevel"]])["educationLevel"]


def repair_post(post, skills):
    """post[0].educationLevel = the highest completed education level, null without one (4a)."""
    out = copy.deepcopy(post or [])
    if out and isinstance(out[0], dict):
        out[0]["educationLevel"] = highest_completed_level(skills)
    return out


def max_total_years(birth):
    a = age_on(birth)
    return None if a is None else max(a - WORK_START_AGE, 0)


def limit_years(years, limit):
    """Years of one person's entries (at least MIN_YEARS each, one decimal), scaled down so that they
    total at most limit. Returns (years, scaled)."""
    ys = [max(MIN_YEARS, round(float(y), 1)) for y in years]
    if limit is None or sum(ys) <= limit + 1e-9:
        return ys, False
    f = limit / sum(ys)
    return [max(MIN_YEARS, math.floor(y * f * 10) / 10) for y in ys], True


# ------------------------------------------------------------------ the model's input and output (1a)

def person_input(user, repaired_skills):
    """The facts the model sees for one person; their hash ties a generated text to its input."""
    post = (user.get("post") or [{}])[0] or {}
    edu = []
    for s in repaired_skills:
        if s.get("type") == "education":
            e = {"level": s.get("educationLevel"), "specialization": s.get("specialization"),
                 "graduation_year": s.get("graduationYear")}
            if s.get("in_progress"):
                e["in_progress"] = True
            edu.append(e)
    work = [{"id": s.get("id"), "note": s.get("comment") or ""}
            for s in sorted((s for s in repaired_skills if s.get("type") == WE), key=lambda s: int(s.get("id") or 0))]
    inp = {"uid": user.get("uid"), "age": age_on(user.get("birthDate")), "job": post.get("job"),
           "department": post.get("department") or None, "job_place": post.get("place") or None,
           "education": edu, "work_experience": work, "max_total_years": max_total_years(user.get("birthDate"))}
    return {k: v for k, v in inp.items() if v not in (None, [], "")} | {"work_experience": work}


PROMPT_HEAD = """You write work histories for fictional residents of a synthetic town population. The data tests a civic participation prototype; no real people are involved.

For each person below, write exactly one work-experience entry for each entry id given, as the person's OWN work. Order: the lowest id is the earliest entry, the highest id the most recent.

Rules:
- If the person has a job other than "unemployed", the most recent entry is that job: its title is the job name or a close variant, and its years are the years in that job so far.
- If the person is "unemployed", the entries are earlier jobs; people aged 66 or more have retired from them.
- Entries fit the person's education, age and job, and a career starts after the education it needs. The years of all entries of a person together are at most max_total_years.
- "note" is an old persona sketch from a data generator. It often describes another person, a hobby or a trait rather than work. Use a note only where it plausibly describes work this person did; otherwise ignore it.
- title: the role, 1 to 5 words.
- field: the domain of the work in 1 to 3 words; prefer one of these: {fields}.
- years: the years in that role, a number with at most one decimal, at least 0.5.
- description: one sentence of 8 to 25 words on what the person did in that role. No personal names, no pronouns, no age.

Answer with JSON only: {"people": [{"uid": <uid>, "entries": [{"id": <id>, "title": "...", "field": "...", "years": <number>, "description": "..."}]}]}, one item per person, in the order given.

People (JSON, one per line):
"""

RESPONSE_SCHEMA = {
    "type": "OBJECT", "required": ["people"],
    "properties": {"people": {"type": "ARRAY", "items": {
        "type": "OBJECT", "required": ["uid", "entries"], "propertyOrdering": ["uid", "entries"],
        "properties": {
            "uid": {"type": "INTEGER"},
            "entries": {"type": "ARRAY", "items": {
                "type": "OBJECT", "required": ["id", "title", "field", "years", "description"],
                "propertyOrdering": ["id", "title", "field", "years", "description"],
                "properties": {"id": {"type": "INTEGER"}, "title": {"type": "STRING"}, "field": {"type": "STRING"},
                               "years": {"type": "NUMBER"}, "description": {"type": "STRING"}}}}}}}},
}


def build_prompt(inputs, fields):
    return PROMPT_HEAD.replace("{fields}", ", ".join(fields)) + "\n".join(canon(i) for i in inputs) + "\n"


def validate_person(inp, out):
    """Returns (entries in id order, errors). An entry: {id, title, field, years, description}."""
    ids = [w["id"] for w in inp["work_experience"]]
    if not isinstance(out, dict) or not isinstance(out.get("entries"), list):
        return None, ["no entries"]
    errors, by_id = [], {}
    for e in out["entries"]:
        if not isinstance(e, dict):
            errors.append("an entry is not an object")
            continue
        try:
            i = int(e.get("id"))
        except (TypeError, ValueError):
            errors.append(f"bad id {e.get('id')!r}")
            continue
        if i in by_id:
            errors.append(f"id {i} twice")
        by_id[i] = e
    if sorted(by_id) != sorted(int(i) for i in ids):
        errors.append(f"ids {sorted(by_id)} instead of {sorted(int(i) for i in ids)}")
    clean = []
    for i in ids:
        e = by_id.get(int(i))
        if e is None:
            continue
        t, f, d = (str(e.get(k) or "").strip() for k in ("title", "field", "description"))
        try:
            y = float(e.get("years"))
        except (TypeError, ValueError):
            y = float("nan")
        if not (1 <= len(t) <= 80):
            errors.append(f"id {i}: title")
        if not (1 <= len(f) <= 60):
            errors.append(f"id {i}: field")
        if not (20 <= len(d) <= 300):
            errors.append(f"id {i}: description length {len(d)}")
        if not (math.isfinite(y) and 0 < y <= 85):
            errors.append(f"id {i}: years {e.get('years')!r}")
        clean.append({"id": i, "title": t, "field": f, "years": y, "description": d})
    return (clean if not errors else None), errors


def parse_output(text, inputs):
    """Model JSON -> ({uid: entries}, {uid: errors})."""
    ok, bad = {}, {}
    try:
        people = json.loads(text).get("people")
        if not isinstance(people, list):
            raise ValueError("no people list")
    except (ValueError, AttributeError) as err:
        return ok, {str(i["uid"]): [f"unreadable output: {err}"] for i in inputs}
    by_uid = {}
    for p in people:
        if isinstance(p, dict) and p.get("uid") is not None:
            by_uid[str(p.get("uid"))] = p
    for inp in inputs:
        uid = str(inp["uid"])
        entries, errors = validate_person(inp, by_uid.get(uid))
        if entries is None:
            bad[uid] = errors
        else:
            ok[uid] = entries
    return ok, bad


def work_entries(skills, entries, limit):
    """skills with the work-experience entries replaced from the generated ones (ids kept). Returns
    (skills, scaled)."""
    out = copy.deepcopy(skills)
    years, scaled = limit_years([e["years"] for e in entries], limit)
    by_id = {int(e["id"]): (e, y) for e, y in zip(entries, years)}
    for s in out:
        if s.get("type") == WE and int(s.get("id") or 0) in by_id:
            e, y = by_id[int(s["id"])]
            s["name"], s["specialization"], s["time"], s["comment"] = e["title"], e["field"], num(y), e["description"]
    return out, scaled


# ------------------------------------------------------------------ the plan

def is_none_stub(u):
    return u.get("_id") == "None" and u.get("uid") is None and "skills" not in u


def plan(users, generated):
    """users: dicts with _id; generated: {uid: {"input_sha256", "entries", ...}}.
    Returns {"updates": [(doc_id, fields)], "deletes": [doc_id], "after": {doc_id: user}, "stats", "rows", ...}."""
    st = collections.Counter()
    updates, deletes, after, rows = [], [], {}, []
    pending, changed_input, stubs = [], [], []
    grad_by_level, level_moves, totals = collections.defaultdict(list), collections.Counter(), []
    for u in users:
        if is_none_stub(u):
            deletes.append(u["_id"])
            continue
        if "skills" not in u:
            stubs.append(u["_id"])
            after[u["_id"]] = u
            continue
        st["profiles"] += 1
        uid = u.get("uid")
        skills, edu_changes = repair_education(u.get("skills"), uid, u.get("birthDate"))
        st["education entries changed"] += len(edu_changes)
        inp = person_input(u, skills)
        row = None
        if inp["work_experience"]:
            st["people with work experience"] += 1
            g = generated.get(str(uid))
            limit = inp.get("max_total_years")
            if g is not None:
                new_skills, scaled = work_entries(skills, g["entries"], limit)
                done = new_skills == skills
                if done or g.get("input_sha256") == sha256(canon(inp)):
                    st["work experience already repaired" if done else "work experience from generated texts"] += 1
                    st["people whose years were scaled down"] += int(scaled and not done)
                    row = (u, inp, g, skills, new_skills)
                    skills = new_skills
                    totals.append((sum(float(s.get("time") or 0) for s in skills if s.get("type") == WE), limit))
                else:
                    changed_input.append(uid)
            else:
                pending.append(uid)
        post = repair_post(u.get("post"), skills)
        old_lvl = ((u.get("post") or [{}])[0] or {}).get("educationLevel")
        new_lvl = (post[:1] or [{}])[0].get("educationLevel")
        if post and old_lvl != new_lvl:
            level_moves[(old_lvl, new_lvl)] += 1
        by = birth_year(u.get("birthDate"))
        for s in skills:
            if s.get("type") == "education" and by is not None and isinstance(s.get("graduationYear"), int):
                grad_by_level[s.get("educationLevel")].append(s["graduationYear"] - by)
                st["education entries in progress"] += int(bool(s.get("in_progress")))
        fields = {}
        if skills != u.get("skills"):
            fields["skills"] = skills
        if post != (u.get("post") or []):
            fields["post"] = post
        if fields:
            updates.append((u["_id"], fields))
        new_u = dict(u)
        new_u.update(fields)
        after[u["_id"]] = new_u
        if row:
            rows.append(row + (new_u,))
    st["over the years limit"] = sum(1 for t, lim in totals if lim is not None and t > lim + 1e-9)
    return {"updates": updates, "deletes": deletes, "after": after, "stats": st, "rows": rows,
            "pending": pending, "changed_input": changed_input, "stubs": stubs,
            "grad_by_level": grad_by_level, "level_moves": level_moves, "totals": totals}


def build_packs(users_after):
    """The user_packs layout of migrate_option_a.py: {"pack_id": n, "users": [meta, ...]}, 250 a pack."""
    metas = []
    for u in sorted((u for u in users_after if u.get("uid") is not None and "skills" in u), key=lambda u: int(u["uid"])):
        metas.append({"uid": int(u["uid"]), "displayName": u.get("displayName", f"User {u['uid']}"),
                      "birthDate": u.get("birthDate", ""), "gender": u.get("gender", ""), "post": u.get("post", []),
                      "skills": u.get("skills", []), "geography": u.get("geography", []),
                      "socialRelations": u.get("socialRelations", []), "features": u.get("features", [])})
    return [{"pack_id": i // PACK_SIZE + 1, "users": metas[i:i + PACK_SIZE]} for i in range(0, len(metas), PACK_SIZE)]


# ------------------------------------------------------------------ generated texts on disk

def read_jsonl(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def load_generated(gen_dir=GEN_DIR):
    """The latest record per uid."""
    out = {}
    for r in read_jsonl(os.path.join(gen_dir, PEOPLE_FILE)):
        out[str(r["uid"])] = r
    return out


def append_jsonl(path, records):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8", newline="\n") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def generation_order(uid):
    return sha256(f"p1-order:{uid}")


# ------------------------------------------------------------------ the model call

def load_key():
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]
    path = os.path.join(ROOT, "functions", ".secret.local")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                m = re.match(r"^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$", line)
                if m:
                    return m.group(1).strip("\"'")
    return None


def call_model(prompt, key, timeout=180):
    """One generateContent request. Returns (text, usage)."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{TEXT_MODEL}:generateContent"
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0, "seed": SEED, "responseMimeType": "application/json",
                                 "responseSchema": RESPONSE_SCHEMA}}
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = json.load(r)
    cand = (data.get("candidates") or [{}])[0]
    text = "".join(p.get("text", "") for p in ((cand.get("content") or {}).get("parts") or []))
    u = data.get("usageMetadata") or {}
    usage = {"prompt_tokens": u.get("promptTokenCount"), "output_tokens": u.get("candidatesTokenCount"),
             "thought_tokens": u.get("thoughtsTokenCount"), "total_tokens": u.get("totalTokenCount")}
    return text, usage, cand.get("finishReason")


def generate(users, args, caller=call_model, sleep=time.sleep, now=time.monotonic):
    """Generates the missing work-experience texts. Returns a summary dict."""
    key = load_key() if caller is call_model else "test"
    if not key:
        raise SystemExit("--generate needs GEMINI_API_KEY (environment or functions/.secret.local)")
    gen_dir = args.gen_dir
    generated = load_generated(gen_dir)
    fields = sorted({s.get("specialization") for u in users for s in (u.get("skills") or [])
                     if s.get("type") == "education" and s.get("specialization")})
    todo = []
    for u in users:
        if "skills" not in u:
            continue
        skills, _ = repair_education(u.get("skills"), u.get("uid"), u.get("birthDate"))
        inp = person_input(u, skills)
        if not inp["work_experience"]:
            continue
        g = generated.get(str(u.get("uid")))
        if g is not None and ((g.get("input_sha256") == sha256(canon(inp)) and g.get("prompt_version") == PROMPT_VERSION)
                              or work_entries(skills, g["entries"], inp.get("max_total_years"))[0] == skills):
            continue
        todo.append(inp)
    todo.sort(key=lambda i: generation_order(i["uid"]))
    if args.limit is not None:
        todo = todo[:args.limit]
    calls_path, people_path = os.path.join(gen_dir, CALLS_FILE), os.path.join(gen_dir, PEOPLE_FILE)
    call_no = len(read_jsonl(calls_path))
    summary = collections.Counter(todo=len(todo))
    queue = [todo[i:i + args.batch] for i in range(0, len(todo), args.batch)]
    last, failed_in_a_row = None, 0
    while queue:
        if summary["requests"] >= args.max_requests:
            summary["stopped at the request limit"] = 1
            break
        batch = queue.pop(0)
        prompt = build_prompt(batch, fields)
        if last is not None:
            sleep(max(0.0, MIN_SECONDS_PER_CALL - (now() - last)))
        text, usage, finish, error = "", {}, None, None
        for attempt in range(4):
            last = now()
            summary["requests"] += 1
            try:
                text, usage, finish = caller(prompt, key)
                error = None
                break
            except urllib.error.HTTPError as err:
                error = redact(f"HTTP {err.code}: {err.read()[:300]!r}", key)
                if err.code not in (429, 500, 502, 503, 504) or attempt == 3 or summary["requests"] >= args.max_requests:
                    break
                sleep(60 if err.code == 429 else 30 * 2 ** attempt)   # 503 "high demand": 30, 60, 120 s
            except (urllib.error.URLError, TimeoutError, OSError) as err:
                error = redact(f"{type(err).__name__}: {err}", key)
                if attempt == 3 or summary["requests"] >= args.max_requests:
                    break
                sleep(20)
        ok, bad = parse_output(text, batch) if error is None else ({}, {str(i["uid"]): [error] for i in batch})
        call_no += 1
        at = _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds")
        append_jsonl(calls_path, [{"call": call_no, "at": at, "model": TEXT_MODEL, "prompt_version": PROMPT_VERSION,
                                   "prompt_sha256": sha256(PROMPT_HEAD), "seed": SEED, "temperature": 0,
                                   "uids": [i["uid"] for i in batch], "prompt": prompt, "raw_output": text,
                                   "finish_reason": finish, "usage": usage, "ok": sorted(ok, key=int),
                                   "failed": bad, "error": error}])
        by_uid = {str(i["uid"]): i for i in batch}
        append_jsonl(people_path, [{"uid": uid, "input_sha256": sha256(canon(by_uid[uid])), "model": TEXT_MODEL,
                                    "prompt_version": PROMPT_VERSION, "call": call_no, "at": at, "entries": entries}
                                   for uid, entries in sorted(ok.items(), key=lambda kv: int(kv[0]))])
        summary["people generated"] += len(ok)
        for k in ("prompt_tokens", "output_tokens", "thought_tokens", "total_tokens"):
            summary[k] += int(usage.get(k) or 0)
        failed_in_a_row = failed_in_a_row + 1 if error is not None else 0
        if error is not None:
            summary["failed calls"] += 1
            print(f"call {call_no}: {error}")
            if "HTTP 429" in error:
                summary["stopped on the rate limit"] = 1
                break
            if failed_in_a_row >= 3:      # e.g. a long 503 "high demand": stop instead of spending the day's requests
                summary["stopped after 3 failed calls in a row"] = 1
                break
        if bad and error is None:
            retry = [by_uid[uid] for uid in bad]
            if len(batch) > 1:          # once more, one person a call
                queue[0:0] = [[i] for i in retry]
            else:
                summary["people failed"] += 1
        print(f"call {call_no}: {len(ok)} of {len(batch)} people; {usage.get('total_tokens')} tokens")
    return summary


# ------------------------------------------------------------------ Firestore

def load_users(db):
    users = []
    for d in db.collection("users").select(LOAD_FIELDS).stream():
        x = d.to_dict()
        x["_id"] = d.id
        users.append(x)
    return users


def apply(db, p, rebuild_packs):
    n = 0
    batch = db.batch()
    for doc_id, fields in p["updates"]:
        batch.update(db.collection("users").document(doc_id), fields)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    for doc_id in p["deletes"]:
        batch.delete(db.collection("users").document(doc_id))
        n += 1
    batch.commit()
    packs_written = 0
    if rebuild_packs:
        packs = build_packs(list(p["after"].values()))
        old = [d.id for d in db.collection("user_packs").stream()]
        for pk in packs:
            db.collection("user_packs").document(f"pack_{pk['pack_id']}").set(pk)
            packs_written += 1
        keep = {f"pack_{pk['pack_id']}" for pk in packs}
        for doc_id in old:
            if doc_id not in keep:
                db.collection("user_packs").document(doc_id).delete()
    return n, packs_written


# ------------------------------------------------------------------ report

def dist(values):
    v = sorted(values)
    if not v:
        return "-"
    return f"min {v[0]:g}, median {v[len(v) // 2]:g}, max {v[-1]:g}"


def top(counter, n=12):
    return ", ".join(f"{k} ({c})" for k, c in counter.most_common(n)) or "-"


def calls_summary(gen_dir):
    calls = read_jsonl(os.path.join(gen_dir, CALLS_FILE))
    s = collections.Counter(calls=len(calls))
    for c in calls:
        for k in ("prompt_tokens", "output_tokens", "thought_tokens", "total_tokens"):
            s[k] += int((c.get("usage") or {}).get(k) or 0)
        s["failed calls"] += int(c.get("error") is not None)
    return s


def report(p, source, applied, packs_info, gen_dir, examples=20):
    st = p["stats"]
    L = ["# P1 migration report", "",
         f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_p1.py` "
         f"({'APPLIED' if applied else 'dry run, nothing written'}).",
         f"Source: {source}. Reference date {REF_DATE} (ages, in progress). Text model `{TEXT_MODEL}`, prompt `{PROMPT_VERSION}`.", "",
         "## Plan", "",
         f"- Profiles: {st['profiles']}; documents to update: {len(p['updates'])}; to delete: {len(p['deletes'])} "
         f"({', '.join(repr(d) for d in p['deletes']) or '-'}); other stubs left alone: {len(p['stubs'])}.",
         f"- Education (3a): entries changed {st['education entries changed']}; in progress {st['education entries in progress']}; "
         "age at graduation by level: " + "; ".join(f"{lvl} {dist(v)}" for lvl, v in sorted(p['grad_by_level'].items(), key=lambda kv: LEVEL_RANK.get(kv[0], 0))) + ".",
         f"- Job education level (4a): changed {sum(p['level_moves'].values())}; " +
         top(collections.Counter({f'{a} -> {b}': c for (a, b), c in p['level_moves'].items()})) + ".",
         f"- Work experience (1a, 2): people {st['people with work experience']}; from generated texts "
         f"{st['work experience from generated texts']}; already repaired {st['work experience already repaired']}; "
         f"not generated yet {len(p['pending'])}; input changed since generation {len(p['changed_input'])}"
         + (f" (uids {', '.join(str(u) for u in p['changed_input'][:10])})" if p['changed_input'] else "") + "; "
         f"years scaled down to the limit {st['people whose years were scaled down']}.",
         f"- Years of work experience against age - {WORK_START_AGE} (repaired people only): over the limit {st['over the years limit']}; "
         f"total years {dist([t for t, _ in p['totals'] if t])}.",
         f"- user_packs (R3): {packs_info}.", ""]
    cs = calls_summary(gen_dir)
    L += ["## Generation", "",
          f"- Calls so far: {cs['calls']} (failed {cs['failed calls']}); tokens: prompt {cs['prompt_tokens']}, output "
          f"{cs['output_tokens']}, thinking {cs['thought_tokens']}, total {cs['total_tokens']}.",
          f"- Files: `{os.path.relpath(os.path.join(gen_dir, PEOPLE_FILE), ROOT)}` (one line per person), "
          f"`{os.path.relpath(os.path.join(gen_dir, CALLS_FILE), ROOT)}` (every prompt and raw output).", ""]
    rows = sorted(p["rows"], key=lambda r: generation_order(r[0].get("uid")))[:examples]
    if rows:
        L += [f"## Examples ({len(rows)} people, in generation order)", ""]
    for u, inp, g, before, _skills_after, new_u in rows:
        post = (u.get("post") or [{}])[0] or {}
        new_post = (new_u.get("post") or [{}])[0] or {}
        edu_old = {s.get("id"): s for s in u.get("skills") or [] if s.get("type") == "education"}
        edu = "; ".join(f"{s.get('educationLevel')} in {s.get('specialization')}, {edu_old.get(s.get('id'), {}).get('graduationYear')} -> "
                        f"{s.get('graduationYear')}{' (in progress)' if s.get('in_progress') else ''}"
                        for s in new_u["skills"] if s.get("type") == "education") or "none"
        L += [f"### uid {u.get('uid')}: age {inp.get('age')}, {post.get('job')}"
              + (f", {post.get('department')}" if post.get('department') else "") + f" (limit {inp.get('max_total_years')} years)", "",
              f"- Education: {edu}. Job level: {post.get('educationLevel')} -> {new_post.get('educationLevel')}."]
        old_we = {s.get("id"): s for s in u.get("skills") or [] if s.get("type") == WE}
        for s in new_u["skills"]:
            if s.get("type") != WE:
                continue
            L += [f"- Entry {s.get('id')}, old: \"{old_we.get(s.get('id'), {}).get('comment')}\"",
                  f"  - new: **{s.get('name')}** ({s.get('specialization')}), {s.get('time')} years: {s.get('comment')}"]
        L.append("")
    return "\n".join(L).rstrip() + "\n"


# ------------------------------------------------------------------ main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--generate", action="store_true", help="call the text model for missing texts (no Firestore writes)")
    ap.add_argument("--limit", type=int, default=None, help="generate at most N people")
    ap.add_argument("--batch", type=int, default=10, help="people per model call (spec: 10)")
    ap.add_argument("--max-requests", type=int, default=450, help="requests in this run (free tier: 500 a day)")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--allow-partial", action="store_true")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    ap.add_argument("--gen-dir", default=GEN_DIR)
    a = ap.parse_args(argv)
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
    if a.generate and a.apply:
        ap.error("--generate and --apply are separate runs")
    import warnings
    warnings.filterwarnings("ignore")
    from google.cloud import firestore
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"
    users = load_users(db)
    if a.generate:
        s = generate(users, a)
        print("generation: " + ", ".join(f"{k} {v}" for k, v in s.items()))
        return 0
    p = plan(users, load_generated(a.gen_dir))
    has_packs = any(True for _ in db.collection("user_packs").limit(1).stream())
    packs = build_packs(list(p["after"].values()))
    biggest = max((len(json.dumps(pk, ensure_ascii=False).encode("utf-8")) for pk in packs), default=0)
    packs_info = (f"present, rebuilt as {len(packs)} packs of up to {PACK_SIZE} (largest about {biggest // 1024} KiB)" if has_packs
                  else "none in this database: checkIssue reads users, nothing to rebuild")
    applied = False
    if a.apply:
        if (p["pending"] or p["changed_input"]) and not a.allow_partial:
            print(f"refusing: {len(p['pending'])} people not generated yet, {len(p['changed_input'])} with a changed input "
                  "(--allow-partial to write the rest)")
            return 2
        n, pw = apply(db, p, has_packs)
        print(f"Wrote {n} user document changes; user_packs written: {pw}")
        applied = True
    with open(a.report, "w", encoding="utf-8", newline="\n") as f:
        f.write(report(p, source, applied, packs_info, a.gen_dir))
    st = p["stats"]
    print(f"profiles {st['profiles']}, updates {len(p['updates'])}, deletes {len(p['deletes'])}, "
          f"work experience pending {len(p['pending'])}; report {os.path.relpath(a.report, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
