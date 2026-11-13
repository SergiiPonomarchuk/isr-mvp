"""A4 phase B (R8): re-embeds every person with the A4 embedding model and template t1.

  python scripts/embed_people.py [--limit N]                  dry run: texts, counts, tokens; no API call
  python scripts/embed_people.py --apply [--limit N]          embeds and writes user_vectors
  python scripts/embed_people.py --compare-task-types         also: the spread of S under both task
                                                              types on a sample (open point 4.3); writes
                                                              only the report

Firestore: the emulator (FIRESTORE_EMULATOR_HOST) unless --project <id> --i-know-this-is-live; the
live --apply is the author's step (A4 phase D).

What it writes, per user_vectors/{uid} (only these fields are replaced; uid is kept):
  profile_vector              a Firestore vector, as before (the profile text, for S)
  experience_vectors          {skill id: vector} for every skill (education, work experience,
                              activity), as before (for E); the whole map is replaced
  embedding_model, embedding_dims, embedding_template, embedding_task_type, embedded_at
  embedding_text_sha256       {"profile": sha, "<skill id>": sha}: what was embedded

The texts come from scripts/embedding_templates.py. Task type RETRIEVAL_DOCUMENT (people and skills;
the issue is the query). 100 texts a request; the pace stays below the free tier's limits
(30,000 tokens and 100 requests a minute, 1,000 requests a day: by default at most 900 a run). A user
is written when all their texts are embedded, so a stopped run loses at most one request's work. A
second run skips every user whose stored texts, model, size, template and task type are current:
that is how a run resumes, and how a profile changed later (P1) is re-embedded.

The key: GEMINI_API_KEY from the environment or functions/.secret.local; never printed. The report
names uids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import hashlib
import math
import os
import random
import statistics
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ai_config  # noqa: E402
import embedding_templates as T  # noqa: E402
import gemini_api  # noqa: E402

ROOT = ai_config.ROOT
REPORT = os.path.join(ROOT, "specs", "tasks", "A4-embedding-report.md")
TASK = ai_config.TASK_TYPE_DOCUMENT
META_FIELDS = ["uid", "embedding_model", "embedding_dims", "embedding_template", "embedding_task_type",
               "embedding_text_sha256"]
TOKENS_PER_MINUTE = 24000          # estimated tokens; the free tier allows 30,000
MIN_SECONDS_PER_REQUEST = 1.0      # 60 a minute; the free tier allows 100
CHARS_PER_TOKEN = 4                # the estimate used for pacing and the report
LONG_TEXT_TOKENS = 2048            # the model's input limit; longer texts are cut by the API
PAID_PRICE_PER_M = 0.15            # USD per 1M input tokens, gemini-embedding-001 (paid tier)
COMPARE_SAMPLE = 200
# Open point 4.3: five issue texts ("{title}. {description}", the t1 issue template) for the comparison.
COMPARE_ISSUES = [
    ("Broken entrance door lock", "The lock of the main entrance door of our building has been broken for a week, so anyone can walk in."),
    ("School bus stop moved", "The school bus stop was moved 800 m further away, and young children now walk along a busy road."),
    ("Noise from the new bar", "A new bar on the main square plays loud music until 2 am on weekdays."),
    ("Potholes on the farm road", "The road to the farms north of the town has deep potholes that damage tractors and cars."),
    ("Clinic opening hours cut", "The local clinic now closes at 2 pm, so working people cannot see a doctor without taking a day off."),
]


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def est_tokens(text: str) -> int:
    return max(1, math.ceil(len(text) / CHARS_PER_TOKEN))


def order_key(uid) -> str:
    return sha256(f"a4-order:{uid}")


def issue_text(title, description):
    """functions/ai-config.js issueText."""
    t, d = str(title or "").strip(), str(description or "").strip()
    return f"{t}. {d}" if t else d


def is_current(meta, shas) -> bool:
    return bool(meta) and meta.get("embedding_model") == ai_config.EMBED_MODEL \
        and meta.get("embedding_dims") == ai_config.EMBED_DIMS and meta.get("embedding_template") == T.VERSION \
        and meta.get("embedding_task_type") == TASK and meta.get("embedding_text_sha256") == shas


# ------------------------------------------------------------------ the plan

def plan(users, vec_meta, limit=None):
    """users: dicts with uid, post, skills; vec_meta: {doc id: user_vectors meta fields}.
    Returns {"todo": [{doc_id, uid, texts, shas}], "stats": Counter, "skipped": [...], "long": [...]}."""
    st = collections.Counter()
    todo, skipped, long_texts = [], [], []
    for u in sorted(users, key=lambda u: order_key(u.get("uid"))):
        if u.get("uid") is None or "skills" not in u:
            skipped.append(u.get("_id"))
            continue
        st["people"] += 1
        texts = {}
        p = T.profile_text(u)
        if p:
            texts["profile"] = p
        else:
            st["people without a profile text"] += 1
        sk = T.skill_texts(u)
        texts.update(sk)
        st["skills without a text"] += sum(1 for s in u.get("skills") or [] if str(s.get("id")) not in sk)
        shas = {k: sha256(t) for k, t in texts.items()}
        doc_id = str(u["uid"])
        if is_current(vec_meta.get(doc_id), shas):
            st["people already current"] += 1
            continue
        st["people without a user_vectors document"] += int(doc_id not in vec_meta)
        for k, t in texts.items():
            if est_tokens(t) > LONG_TEXT_TOKENS:
                long_texts.append((doc_id, k, est_tokens(t)))
        todo.append({"doc_id": doc_id, "uid": u["uid"], "texts": texts, "shas": shas,
                     "types": {str(s.get("id")): s.get("type") for s in u.get("skills") or []}})
    if limit is not None:
        todo = todo[:limit]
    for t in todo:
        st["profile texts to embed"] += int("profile" in t["texts"])
        for k in t["texts"]:
            if k != "profile":
                st[f"{t['types'].get(k)} texts to embed"] += 1
        st["texts to embed"] += len(t["texts"])
        st["estimated tokens"] += sum(est_tokens(x) for x in t["texts"].values())
    st["requests needed"] = math.ceil(st["texts to embed"] / gemini_api.MAX_BATCH)
    return {"todo": todo, "stats": st, "skipped": skipped, "long": long_texts}


def batches(todo, size=gemini_api.MAX_BATCH):
    """[(doc_id, key, text)] in chunks of size, in user order."""
    flat = [(t["doc_id"], k, x) for t in todo for k, x in t["texts"].items()]
    return [flat[i:i + size] for i in range(0, len(flat), size)]


def doc_fields(item, vectors, vector_type=None, now=None):
    """The user_vectors fields for one person. vectors: {key: unit vector}."""
    prof = vectors.get("profile")
    fields = {
        "uid": item["uid"],
        "experience_vectors": {k: v for k, v in vectors.items() if k != "profile"},
        "embedding_model": ai_config.EMBED_MODEL, "embedding_dims": ai_config.EMBED_DIMS,
        "embedding_template": T.VERSION, "embedding_task_type": TASK,
        "embedding_text_sha256": item["shas"], "embedded_at": now,
    }
    if prof is not None:
        fields["profile_vector"] = vector_type(prof) if vector_type else prof
    return fields


class Pacer:
    """Keeps the estimated tokens of the last 60 s below TOKENS_PER_MINUTE and a gap between requests."""

    def __init__(self, sleep=time.sleep, now=time.monotonic):
        self.sleep, self.now, self.window, self.last = sleep, now, collections.deque(), None

    def wait(self, tokens):
        while True:
            t = self.now()
            while self.window and t - self.window[0][0] >= 60:
                self.window.popleft()
            used = sum(n for _, n in self.window)
            waits = []
            if self.last is not None and t - self.last < MIN_SECONDS_PER_REQUEST:
                waits.append(MIN_SECONDS_PER_REQUEST - (t - self.last))
            if self.window and used + tokens > TOKENS_PER_MINUTE:
                waits.append(60 - (t - self.window[0][0]) + 0.05)
            if not waits:
                break
            self.sleep(max(waits))
        self.last = self.now()
        self.window.append((self.last, tokens))


def embed_with_retry(texts, key, embed, sleep, summary, max_requests):
    """Returns vectors or raises GeminiError; counts every attempt as a request."""
    for attempt in range(6):
        summary["requests"] += 1
        try:
            return embed(texts, TASK, key)
        except gemini_api.GeminiError as err:
            if attempt == 5 or summary["requests"] >= max_requests or err.status not in (429, 500, 502, 503, 504, None):
                raise
            sleep(60 if err.status == 429 else 30 * 2 ** min(attempt, 2))


def run(todo, key, write, max_requests, embed=gemini_api.embed_texts, sleep=time.sleep, now=time.monotonic):
    """Embeds the todo items and calls write(item, vectors) per completed person.
    Returns (summary, {doc_id: profile vector}) for the spread."""
    summary = collections.Counter()
    pacer = Pacer(sleep, now)
    pending = {t["doc_id"]: (t, {}) for t in todo}
    new_profiles = {}
    failed_in_a_row = 0
    for chunk in batches(todo):
        if summary["requests"] >= max_requests:
            summary["stopped at the request limit"] = 1
            break
        tokens = sum(est_tokens(x) for _, _, x in chunk)
        pacer.wait(tokens)
        try:
            vecs = embed_with_retry([x for _, _, x in chunk], key, embed, sleep, summary, max_requests)
            failed_in_a_row = 0
        except gemini_api.GeminiError as err:
            summary["failed requests"] += 1
            failed_in_a_row += 1
            print(f"request failed: {err}")
            if err.status == 429 or failed_in_a_row >= 3 or summary["requests"] >= max_requests:
                summary["stopped on errors"] = 1
                break
            continue
        summary["texts embedded"] += len(chunk)
        summary["estimated tokens"] += tokens
        for (doc_id, k, _), v in zip(chunk, vecs):
            pending[doc_id][1][k] = v
        done = [d for d, (t, got) in pending.items() if len(got) == len(t["texts"])]
        for d in done:
            t, got = pending.pop(d)
            write(t, got)
            summary["people written"] += 1
            if "profile" in got:
                new_profiles[d] = got["profile"]
        if summary["requests"] % 20 == 0:
            print(f"{summary['requests']} requests, {summary['people written']} people written")
    summary["people left for the next run"] = len(pending)
    return summary, new_profiles


# ------------------------------------------------------------------ spread and the task-type comparison

def cosine(a, b):
    return sum(x * y for x, y in zip(a, b)) / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))


def median_pair_cosine(vectors, pairs=3000, seed=20261110):
    vs = list(vectors)
    if len(vs) < 2:
        return None
    rnd = random.Random(seed)
    return statistics.median(cosine(*rnd.sample(vs, 2)) for _ in range(pairs))


def s_stats(issue_vec, profile_vecs):
    s = sorted(max(0.0, cosine(issue_vec, p)) for p in profile_vecs)
    n = len(s)
    q = lambda f: s[min(n - 1, int(f * n))]  # noqa: E731
    return {"mean": statistics.mean(s), "sd": statistics.pstdev(s), "p10": q(0.1), "p90": q(0.9), "max": s[-1],
            "top10_minus_median": statistics.mean(s[-10:]) - statistics.median(s)}


def compare_task_types(todo, key, embed=gemini_api.embed_texts, sleep=time.sleep):
    """S for 5 issues against a sample of profiles under (a) RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT and
    (b) SEMANTIC_SIMILARITY for both. Returns (rows, requests). Each batch is retried like the main
    loop (60 s after a 429, 30-120 s after a server error or a timeout; 6 attempts), counting every attempt."""
    sample = [t for t in todo if "profile" in t["texts"]][:COMPARE_SAMPLE]
    ptexts = [t["texts"]["profile"] for t in sample]
    issues = [issue_text(a, b) for a, b in COMPARE_ISSUES]
    req = 0

    def emb(texts, task):
        nonlocal req
        out = []
        for i in range(0, len(texts), gemini_api.MAX_BATCH):
            for attempt in range(6):
                req += 1
                try:
                    out += embed(texts[i:i + gemini_api.MAX_BATCH], task, key)
                    break
                except gemini_api.GeminiError as err:
                    if attempt == 5 or err.status not in (429, 500, 502, 503, 504, None):
                        raise
                    sleep(60 if err.status == 429 else 30 * 2 ** min(attempt, 2))
            sleep(1)
        return out

    a_p, a_i = emb(ptexts, ai_config.TASK_TYPE_DOCUMENT), emb(issues, ai_config.TASK_TYPE_ISSUE)
    b_p, b_i = emb(ptexts, "SEMANTIC_SIMILARITY"), emb(issues, "SEMANTIC_SIMILARITY")
    rows = []
    for (title, _), ai, bi in zip(COMPARE_ISSUES, a_i, b_i):
        sa, sb = s_stats(ai, a_p), s_stats(bi, b_p)
        top_a = set(sorted(range(len(a_p)), key=lambda j: -cosine(ai, a_p[j]))[:10])
        top_b = set(sorted(range(len(b_p)), key=lambda j: -cosine(bi, b_p[j]))[:10])
        rows.append((title, sa, sb, len(top_a & top_b)))
    return rows, req, len(sample)


# ------------------------------------------------------------------ report

def fmt(x, d=3):
    return "-" if x is None else f"{x:.{d}f}"


def report(p, source, applied, summary, spread, compare, examples):
    st = p["stats"]
    tok = st["estimated tokens"]
    L = ["# A4 phase B: embedding report", "",
         f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/embed_people.py` "
         f"({'APPLIED' if applied else 'dry run, nothing written'}).",
         f"Source: {source}. Model `{ai_config.EMBED_MODEL}`, {ai_config.EMBED_DIMS} dimensions, task type `{TASK}`, "
         f"template `{T.VERSION}` (`scripts/embedding_templates.py`).", "",
         "## Plan", "",
         f"- People: {st['people']}; already current: {st['people already current']}; to embed: {len(p['todo'])}"
         f"; skipped documents without `skills` or uid: {len(p['skipped'])} ({', '.join(repr(s) for s in p['skipped']) or '-'}).",
         f"- Texts to embed: {st['texts to embed']} (profiles {st['profile texts to embed']}, education {st['education texts to embed']}, "
         f"work experience {st['work experience texts to embed']}, activities {st['activity texts to embed']}); "
         f"people without a profile text: {st['people without a profile text']}; skills without a text: {st['skills without a text']}; "
         f"people without a `user_vectors` document: {st['people without a user_vectors document']}.",
         f"- Estimated tokens ({CHARS_PER_TOKEN} characters a token): {tok:,}, about ${tok / 1e6 * PAID_PRICE_PER_M:.2f} at the paid rate; "
         f"requests needed: {st['requests needed']}; at {TOKENS_PER_MINUTE:,} tokens a minute about {math.ceil(tok / TOKENS_PER_MINUTE)} minutes.",
         f"- Texts over {LONG_TEXT_TOKENS} estimated tokens (cut by the API): {len(p['long'])}.", ""]
    if summary is not None:
        L += ["## Run", "",
              "- " + ", ".join(f"{k} {v:,}" for k, v in summary.items()) + ".", ""]
    if spread:
        L += ["## Spread", "",
              f"- Median cosine between random pairs of profile vectors: new {fmt(spread.get('new'))} "
              f"(over {spread.get('n_new', 0)} people of this run), old {fmt(spread.get('old'))} (the same people's stored vectors"
              f"{'' if spread.get('old') is not None else ': not read'}). The 9,150 old vectors had 0.91 (A4 spec).", ""]
    if compare:
        rows, req, n = compare
        L += [f"## Task types (open point 4.3): S for 5 issues against {n} profiles ({req} requests)", "",
              "a = issue `RETRIEVAL_QUERY`, profiles `RETRIEVAL_DOCUMENT` (chosen); b = `SEMANTIC_SIMILARITY` for both. "
              "S = max(0, cos). A wider spread separates relevant people better.", "",
              "| Issue | a: mean | a: sd | a: p10-p90 | a: max | a: top 10 - median | b: mean | b: sd | b: p10-p90 | b: max | b: top 10 - median | top 10 shared |",
              "|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for title, a, b, shared in rows:
            L.append(f"| {title} | {fmt(a['mean'])} | {fmt(a['sd'])} | {fmt(a['p10'])}-{fmt(a['p90'])} | {fmt(a['max'])} | {fmt(a['top10_minus_median'])} | "
                     f"{fmt(b['mean'])} | {fmt(b['sd'])} | {fmt(b['p10'])}-{fmt(b['p90'])} | {fmt(b['max'])} | {fmt(b['top10_minus_median'])} | {shared} |")
        L.append("")
    if examples:
        L += ["## Example texts", ""]
        for t in examples:
            L += [f"### uid {t['uid']}", "", "```", t["texts"].get("profile", "(no profile text)"), "```", ""]
            for k, x in t["texts"].items():
                if k != "profile":
                    L.append(f"- skill {k} ({t['types'].get(k)}): {x}")
            L.append("")
    return "\n".join(L).rstrip() + "\n"


# ------------------------------------------------------------------ Firestore

def commit_with_retry(batch, transient_errors, sleep=time.sleep):
    """Keep an idempotent merge batch intact while retrying transient writes."""
    for attempt in range(6):
        try:
            return batch.commit(retry=None, timeout=120)
        except transient_errors as error:
            if attempt == 5:
                raise
            delay = min(30, 2 ** (attempt + 1))
            print(f"Firestore {type(error).__name__}; retry {attempt + 1} in {delay}s", flush=True)
            sleep(delay)



def load(db):
    users = []
    for d in db.collection("users").select(["uid", "post", "skills"]).stream():
        x = d.to_dict()
        x["_id"] = d.id
        users.append(x)
    meta = {d.id: d.to_dict() for d in db.collection("user_vectors").select(META_FIELDS).stream()}
    return users, meta


def old_profiles(db, doc_ids):
    refs = [db.collection("user_vectors").document(d) for d in doc_ids]
    out = {}
    for i in range(0, len(refs), 100):
        for snap in db.get_all(refs[i:i + 100], field_paths=["profile_vector"]):
            v = snap.get("profile_vector") if snap.exists else None
            if v is not None:
                out[snap.id] = [float(x) for x in v]
    return out


def shown_path(path):
    """The report path relative to the repository, or as given when it is on another drive."""
    try:
        return os.path.relpath(path, ROOT)
    except ValueError:
        return path


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None, help="at most N people (a trial run)")
    ap.add_argument("--max-requests", type=int, default=900, help="requests in this run (free tier: 1,000 a day)")
    ap.add_argument("--compare-task-types", action="store_true")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--report", default=REPORT)
    a = ap.parse_args(argv)
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
    import warnings
    warnings.filterwarnings("ignore")
    from google.cloud import firestore
    from google.cloud.firestore_v1.vector import Vector
    from google.api_core import exceptions as firestore_errors
    transient_errors = (firestore_errors.DeadlineExceeded, firestore_errors.ServiceUnavailable,
                        firestore_errors.Aborted, firestore_errors.InternalServerError,
                        firestore_errors.ResourceExhausted)
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"
    users, meta = load(db)
    p = plan(users, meta, a.limit)
    key = None
    if a.apply or a.compare_task_types:
        key = gemini_api.load_key()
        if not key:
            ap.error("--apply and --compare-task-types need GEMINI_API_KEY (environment or functions/.secret.local)")
    summary, spread, compare = None, {}, None
    if a.apply and p["todo"]:
        sample_ids = [t["doc_id"] for t in p["todo"][:1000]]
        old = old_profiles(db, sample_ids)
        buf = []

        def write(item, vectors):
            buf.append((item, vectors))
            if len(buf) >= 50:
                flush()

        def flush():
            if not buf:
                return
            batch = db.batch()
            for item, vectors in buf:
                fields = doc_fields(item, vectors, Vector, firestore.SERVER_TIMESTAMP)
                batch.set(db.collection("user_vectors").document(item["doc_id"]), fields, merge=list(fields))
            commit_with_retry(batch, transient_errors)
            buf.clear()

        summary, new_profiles = run(p["todo"], key, write, a.max_requests)
        flush()
        both = [d for d in sample_ids if d in new_profiles and d in old]
        spread = {"new": median_pair_cosine(new_profiles.values()), "n_new": len(new_profiles),
                  "old": median_pair_cosine([old[d] for d in both]) if both else None}
    if a.compare_task_types:
        compare = compare_task_types(p["todo"] or [], key)
    with open(a.report, "w", encoding="utf-8", newline="\n") as f:
        f.write(report(p, source, bool(a.apply), summary, spread, compare, p["todo"][:3]))
    st = p["stats"]
    print(f"people {st['people']}, to embed {len(p['todo'])}, texts {st['texts to embed']}, requests needed {st['requests needed']}"
          + (", run: " + ", ".join(f"{k} {v}" for k, v in summary.items()) if summary else "")
          + f"; report {shown_path(a.report)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
