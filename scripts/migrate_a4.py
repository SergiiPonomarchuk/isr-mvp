"""A4 phase C (R10, R11): real E for the ad-hoc publics that A1b gave the expertise placeholder.

  python scripts/migrate_a4.py              dry run: embeds the issue texts (needs the key, unless
                                            issue_vectors already holds them) and writes nothing
  python scripts/migrate_a4.py --apply      writes issue_vectors, the members and the topic maps

Firestore: the emulator (FIRESTORE_EMULATOR_HOST) unless --project <id> --i-know-this-is-live; the
live --apply is the author's step (A4 phase D, after scripts/embed_people.py).

For every public whose members all have expertise_source "no_issue_vector" (A1b):
- the issue vector: "{title}. {description}" of the topic's issue (else its discussion), template t1,
  task type RETRIEVAL_QUERY, the A4 model; stored in issue_vectors/{topic id} as createIssue stores
  it (vector, model, dims, task_type, template_version, text_sha256, created_at). An existing entry
  with the same model, template, task type and text is reused without a request;
- E per member as createIssue computes it (functions/isr.js, here scripts/expertise.py):
  education cos^(CBC x adjustment) x P, with the age floor at the topic's registration (its
  created_at), plus work experience cos x years, with the member's current skills (users) and skill
  vectors (user_vectors.experience_vectors). The CBC adjustment is the issue's
  expertise_domain_parameters.CBC_adjustment_factor, else 1.0;
- the ISR with the A1 formula (scripts/isr_core.py) and the weights A1b used (the issue's, else the
  discussion's, else 0.4 / 0.3 / 0.3);
- the member fields createIssue writes: education_expertise, experience_expertise, expertise_score,
  normalized_*, contribution_source, isr_score (3 decimals), and expertise_source "issue_vector";
- the topic maps (relevance_scores, isr_scores) of its discussion and issue, as migrate_a1.py does.

A public is left alone, and reported, when a member's vectors are not current (scripts/embed_people.py
has not embedded that person's present texts with the A4 model and template), a member has no user
document, or the topic has no text. Other publics keep their stored values (R11). A second run
changes nothing. Prints and reports ids only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ai_config  # noqa: E402
import embed_people  # noqa: E402
import embedding_templates as T  # noqa: E402
import expertise as X  # noqa: E402
import gemini_api  # noqa: E402
import isr_core  # noqa: E402
from migrate_a1 import diff_map, new_maps, norm_uid, r3  # noqa: E402
from migrate_a1b import PLACEHOLDER_SOURCE, W_KEYS, weights_for  # noqa: E402

ROOT = ai_config.ROOT
REPORT = os.path.join(ROOT, "specs", "tasks", "A4-migration-report.md")
NEW_SOURCE = "issue_vector"
TOPIC_FIELDS = ["title", "description", "created_at", "expertise_domain_parameters", "relevance_scores", "isr_scores"] + list(W_KEYS)
VECTOR_META = embed_people.META_FIELDS + ["experience_vectors"]


def topic_text(issue, discussion):
    for d in (issue, discussion):
        if d and (str(d.get("title") or "").strip() or str(d.get("description") or "").strip()):
            return embed_people.issue_text(d.get("title"), d.get("description"))
    return ""


def vector_is_current(entry, text):
    return bool(entry) and entry.get("model") == ai_config.EMBED_MODEL and entry.get("dims") == ai_config.EMBED_DIMS \
        and entry.get("template_version") == ai_config.EMBED_TEMPLATE_VERSION \
        and entry.get("task_type") == ai_config.TASK_TYPE_ISSUE and entry.get("text_sha256") == embed_people.sha256(text) \
        and isinstance(entry.get("vector"), list)


def member_vectors_current(user, vec_doc):
    texts = {}
    p = T.profile_text(user)
    if p:
        texts["profile"] = p
    texts.update(T.skill_texts(user))
    return embed_people.is_current(vec_doc, {k: embed_people.sha256(t) for k, t in texts.items()})


def member_expertise(user, skill_vectors, issue_vector, cbc_adjustment, registered_at):
    """(education part, experience sum, E) as functions/index.js createIssue."""
    edu = X.education_sum(user.get("skills"), skill_vectors, issue_vector, cbc_adjustment)
    exp = X.experience_sum(user.get("skills"), skill_vectors, issue_vector)
    try:
        edu_part = X.education_part(edu, X.age_in_years(user.get("birthDate"), registered_at))
    except ValueError:
        edu_part = edu                    # createIssue: no valid birthDate -> no age floor
    return r3(edu_part), r3(exp), r3(edu_part + exp)


def placeholder_publics(members):
    by_pub = collections.defaultdict(list)
    for m in members:
        by_pub[str(m.get("microcommunity_id"))].append(m)
    out, mixed = {}, []
    for pub, ms in sorted(by_pub.items()):
        n = sum(1 for m in ms if m.get("expertise_source") == PLACEHOLDER_SOURCE)
        if n == len(ms):
            out[pub] = ms
        elif n:
            mixed.append((pub, n, len(ms)))
    return out, mixed


def plan(members, mcs, issues, discussions, users, vectors, issue_vectors, embed_missing):
    """embed_missing(texts) -> vectors, for the topics without a current issue vector.
    Returns {"updates", "issue_vectors", "publics", "skipped", "mixed", "requests"}."""
    publics, mixed = placeholder_publics(members)
    updates, new_issue_vectors, rows, skipped = [], {}, [], []
    todo = {}
    for pub, ms in publics.items():
        tid = str((mcs.get(pub) or {}).get("issue_id") or pub)
        text = topic_text(issues.get(tid), discussions.get(tid))
        if not text:
            skipped.append((pub, tid, len(ms), "the topic has no title or description"))
            continue
        bad = [m["user_id"] for m in ms if str(m["user_id"]) not in users]
        if bad:
            skipped.append((pub, tid, len(ms), f"{len(bad)} members without a user document"))
            continue
        stale = [m["user_id"] for m in ms if not member_vectors_current(users[str(m["user_id"])], vectors.get(str(m["user_id"])))]
        if stale:
            skipped.append((pub, tid, len(ms), f"{len(stale)} members without current A4 vectors (run embed_people.py first)"))
            continue
        todo[pub] = (tid, text, ms)
    missing = [(pub, tid, text) for pub, (tid, text, _) in todo.items() if not vector_is_current(issue_vectors.get(tid), text)]
    requests = 0
    if missing:
        vecs = []
        for i in range(0, len(missing), gemini_api.MAX_BATCH):
            vecs += embed_missing([t for _, _, t in missing[i:i + gemini_api.MAX_BATCH]])
            requests += 1
        for (pub, tid, text), v in zip(missing, vecs):
            new_issue_vectors[tid] = {"vector": v, "model": ai_config.EMBED_MODEL, "dims": ai_config.EMBED_DIMS,
                                      "task_type": ai_config.TASK_TYPE_ISSUE, "template_version": ai_config.EMBED_TEMPLATE_VERSION,
                                      "text_sha256": embed_people.sha256(text)}
    for pub, (tid, text, ms) in todo.items():
        iv = (new_issue_vectors.get(tid) or issue_vectors.get(tid))["vector"]
        issue, disc = issues.get(tid) or {}, discussions.get(tid) or {}
        edp = issue.get("expertise_domain_parameters") or disc.get("expertise_domain_parameters") or {}
        adj = edp.get("CBC_adjustment_factor") or 1.0
        registered_at = issue.get("created_at") or disc.get("created_at")
        weights, wsrc = weights_for(tid, issues, discussions)
        es = []
        for m in ms:
            u = users[str(m["user_id"])]
            es.append(member_expertise(u, (vectors.get(str(m["user_id"])) or {}).get("experience_vectors") or {}, iv, adj, registered_at))
        breakdown = isr_core.isr_for_public(
            [{"uid": str(m["user_id"]), "R": m.get("relevance_score"), "E": e[2]} for m, e in zip(ms, es)], weights)
        new_members = []
        for m, e, b in zip(ms, es, breakdown):
            fields = {"education_expertise": e[0], "experience_expertise": e[1], "expertise_score": e[2],
                      "expertise_source": NEW_SOURCE,
                      "normalized_relevance": r3(b["R_norm"]), "normalized_experience": r3(b["E_norm"]),
                      "normalized_contribution": r3(b["C_norm"]), "contribution_source": b["contribution_source"],
                      "isr_score": r3(b["isr"])}
            updates.append(("microcommunity_members", m["_id"], fields))
            new_members.append(dict(m, **fields))
        rel, isr = new_maps(new_members)
        maps = []
        for coll, docs in (("discussions", discussions), ("issues", issues)):
            d = docs.get(tid)
            if d is None:
                continue
            c1, a1, rm1 = diff_map(d.get("relevance_scores"), rel)
            c2, a2, rm2 = diff_map(d.get("isr_scores"), isr)
            if c1 or a1 or rm1 or c2 or a2 or rm2:
                updates.append((coll, tid, {"relevance_scores": rel, "isr_scores": isr}))
                maps.append(coll)
        old_isr = [m.get("isr_score") for m in ms]
        new_isr = [f["isr_score"] for f in (nm for nm in new_members)]
        order_old = sorted(range(len(ms)), key=lambda i: (-(old_isr[i] or 0), str(ms[i]["user_id"])))
        order_new = sorted(range(len(ms)), key=lambda i: (-new_isr[i], str(ms[i]["user_id"])))
        rows.append({"public": pub, "topic": tid, "text": text, "members": len(ms), "weights": weights, "weights_source": wsrc,
                     "cbc_adjustment": adj, "registered_at": str(registered_at)[:10],
                     "issue_vector": "new" if tid in new_issue_vectors else "reused",
                     "E": [e[2] for e in es], "edu": [e[0] for e in es], "exp": [e[1] for e in es],
                     "isr_old": old_isr, "isr_new": new_isr,
                     "rank_changed": sum(1 for a, b in zip(order_old, order_new) if a != b), "maps": maps,
                     "top": [(ms[i]["user_id"], es[i][2], new_isr[i]) for i in order_new[:5]]})
    return {"updates": updates, "issue_vectors": new_issue_vectors, "publics": rows, "skipped": skipped,
            "mixed": mixed, "requests": requests, "placeholder_publics": len(publics)}


# ------------------------------------------------------------------ report and apply

def dist(v):
    v = sorted(x for x in v if x is not None)
    return "-" if not v else f"{v[0]:.3f} / {statistics.median(v):.3f} / {v[-1]:.3f}"


def report(p, source, applied):
    n_members = sum(1 for u in p["updates"] if u[0] == "microcommunity_members")
    L = ["# A4 phase C: migration report", "",
         f"Generated {_dt.datetime.now().isoformat(timespec='seconds')} by `scripts/migrate_a4.py` "
         f"({'APPLIED' if applied else 'dry run, nothing written'}).",
         f"Source: {source}. Issue vectors: `{ai_config.EMBED_MODEL}`, {ai_config.EMBED_DIMS} dimensions, "
         f"`{ai_config.TASK_TYPE_ISSUE}`, template `{ai_config.EMBED_TEMPLATE_VERSION}`; embedding requests: {p['requests']}.", "",
         f"Publics with the A1b placeholder: {p['placeholder_publics']}; given real E: {len(p['publics'])}; left alone: {len(p['skipped'])}; "
         f"member documents: {n_members}; topic documents (maps): {len(p['updates']) - n_members}; new issue vectors: {len(p['issue_vectors'])}.", ""]
    if p["mixed"]:
        L += ["Publics where only some members have the placeholder (not touched): "
              + ", ".join(f"{a} ({b} of {c})" for a, b, c in p["mixed"]) + ".", ""]
    L += ["## Publics", ""]
    for r in p["publics"]:
        w = r["weights"]
        L += [f"### {r['public']} (topic {r['topic']})", "",
              f"- Text: \"{r['text']}\"; registered {r['registered_at']}; issue vector {r['issue_vector']}; CBC adjustment {r['cbc_adjustment']}.",
              f"- Members: {r['members']}; weights R / E / C {w['w_relevance']:.2f} / {w['w_expertise']:.2f} / {w['w_contribution']:.2f} ({r['weights_source']}).",
              f"- E min / median / max: {dist(r['E'])} (education part {dist(r['edu'])}; work experience {dist(r['exp'])}).",
              f"- ISR min / median / max: before {dist(r['isr_old'])}, after {dist(r['isr_new'])}; members whose place in the ISR order changed: {r['rank_changed']}.",
              f"- Top 5 by the new ISR (uid, E, ISR): " + "; ".join(f"{u}, {e:.3f}, {i:.3f}" for u, e, i in r["top"]) + ".",
              f"- Maps rewritten: {', '.join(r['maps']) or '-'}.", ""]
    if not p["publics"]:
        L += ["None.", ""]
    L += ["## Left alone", ""]
    L += ([f"- {a} (topic {b}, {c} members): {d}." for a, b, c, d in p["skipped"]] or ["None."])
    return "\n".join(L).rstrip() + "\n"


def apply(db, p, server_timestamp):
    batch, n = db.batch(), 0
    for tid, fields in p["issue_vectors"].items():
        batch.set(db.collection("issue_vectors").document(tid), dict(fields, created_at=server_timestamp))
        n += 1
    for coll, doc_id, data in p["updates"]:
        batch.update(db.collection(coll).document(doc_id), data)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    batch.commit()
    return n


# ------------------------------------------------------------------ Firestore

def load(db):
    members = []
    for d in db.collection("microcommunity_members").where("expertise_source", "==", PLACEHOLDER_SOURCE).stream():
        x = d.to_dict()
        x["_id"] = d.id
        x["user_id"] = norm_uid(x.get("user_id"))
        members.append(x)
    pubs = sorted({str(m.get("microcommunity_id")) for m in members})
    # every member of those publics (a public is changed only when all have the placeholder)
    all_members = []
    for pub in pubs:
        for d in db.collection("microcommunity_members").where("microcommunity_id", "==", pub).stream():
            x = d.to_dict()
            x["_id"] = d.id
            x["user_id"] = norm_uid(x.get("user_id"))
            all_members.append(x)
    mcs = {}
    for pub in pubs:
        s = db.collection("microcommunities").document(pub).get()
        if s.exists:
            mcs[pub] = s.to_dict()
    tids = sorted({str((mcs.get(p) or {}).get("issue_id") or p) for p in pubs})

    def get_docs(coll, ids, fields=None):
        out = {}
        refs = [db.collection(coll).document(i) for i in ids]
        for i in range(0, len(refs), 100):
            for s in db.get_all(refs[i:i + 100], field_paths=fields):
                if s.exists:
                    out[s.id] = s.to_dict()
        return out

    issues = get_docs("issues", tids, TOPIC_FIELDS)
    discussions = get_docs("discussions", tids, TOPIC_FIELDS)
    uids = sorted({str(m["user_id"]) for m in all_members})
    users = get_docs("users", uids, ["uid", "post", "skills", "birthDate"])
    vectors = get_docs("user_vectors", uids, VECTOR_META)
    issue_vectors = get_docs("issue_vectors", tids)
    return all_members, mcs, issues, discussions, users, vectors, issue_vectors


def shown_path(path):
    """The report path relative to the repository, or as given when it is on another drive."""
    try:
        return os.path.relpath(path, ROOT)
    except ValueError:
        return path


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
    import warnings
    warnings.filterwarnings("ignore")
    from google.cloud import firestore
    project = a.project or os.environ.get("GCLOUD_PROJECT") or "demo-isr"
    db = firestore.Client(project=project)
    source = f"Firestore emulator {emulator} (project {project})" if emulator else f"LIVE project {project}"
    data = load(db)
    key = gemini_api.load_key()

    def embed_missing(texts):
        if not key:
            raise SystemExit("the issue texts need embedding: GEMINI_API_KEY (environment or functions/.secret.local)")
        return gemini_api.embed_texts(texts, ai_config.TASK_TYPE_ISSUE, key)

    p = plan(*data, embed_missing)
    applied = False
    if a.apply and (p["updates"] or p["issue_vectors"]):
        print(f"Writing {apply(db, p, firestore.SERVER_TIMESTAMP)} documents...")
        applied = True
    with open(a.report, "w", encoding="utf-8", newline="\n") as f:
        f.write(report(p, source, applied))
    print(f"placeholder publics {p['placeholder_publics']}, given real E {len(p['publics'])}, left alone {len(p['skipped'])}, "
          f"embedding requests {p['requests']}; report {shown_path(a.report)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
