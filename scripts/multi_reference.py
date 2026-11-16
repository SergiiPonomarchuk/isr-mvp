"""PD-9 deterministic arithmetic; no model, database, key or other I/O."""
import math
import isr_core

DIMS = ("D", "G", "S", "X")
AGG = ("R", "E", "C")
EPS = 1e-12


def number(value, label, low=0, high=math.inf):
    if type(value) not in (int, float) or not math.isfinite(value) or not low <= value <= high:
        raise ValueError("Invalid " + label)
    return value


def identifier(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Invalid id")
    return value


def group(value, keys, positive=False):
    if not isinstance(value, dict) or set(value) != set(keys):
        raise ValueError("Invalid weight group")
    values = [number(value[k], k, 0, 1) for k in keys]
    if positive and any(v in (0, 1) for v in values):
        raise ValueError("Aggregation must be positive")
    if abs(sum(values) - 1) > 1e-6:
        raise ValueError("Weights must sum to one")


def select(references, floor=.30, gap=.05):
    number(floor, "floor", 0, 1)
    number(gap, "gap", 0, 1)
    if not gap:
        raise ValueError("Gap must be positive")
    ranked = [{"id": identifier(r["id"]), "score": number(r["score"], "similarity", 0, 1)} for r in references]
    if len({r["id"] for r in ranked}) != len(ranked):
        raise ValueError("Duplicate reference")
    ranked.sort(key=lambda r: (-r["score"], r["id"]))
    chain = []
    for j, row in enumerate(ranked):
        if row["score"] < floor-EPS or (j and ranked[j-1]["score"]-row["score"] >= gap-EPS):
            break
        chain.append(row)
    return {"ranked": ranked, "chain": chain, "state": "no_match" if not chain else "context_review_required" if len(chain)>3 else "context_validation_required"}


def reviewed(raw, accepted, exclusions=None):
    exclusions = {} if exclusions is None else exclusions
    chain = {r["id"]: r["score"] for r in select(raw)["chain"]}
    if not accepted:
        raise ValueError("Reviewed set is empty")
    seen = set()
    for ref in accepted:
        key = identifier(ref["id"])
        if key in seen or key not in chain:
            raise ValueError("Invalid reviewed reference")
        seen.add(key)
        if not isinstance(ref.get("evidence"), str) or not ref["evidence"].strip():
            raise ValueError("Context evidence required")
        group(ref["relevance"], DIMS)
        group(ref["aggregation"], AGG, True)
        number(ref["mu"], "mu")
        if not number(ref["sigma"], "sigma"):
            raise ValueError("Sigma must be positive")
    if any(k not in seen and not (isinstance(exclusions.get(k), str) and exclusions[k].strip()) for k in chain):
        raise ValueError("Exclusion reason required")
    if any(k not in chain or k in seen for k in exclusions):
        raise ValueError("Invalid exclusion")
    total = sum(chain[r["id"]] for r in accepted)
    if total <= 0:
        raise ValueError("No positive reference score")
    refs = [dict(r, relevance=dict(r["relevance"]), aggregation=dict(r["aggregation"]), alpha=chain[r["id"]]/total) for r in accepted]
    return {"refs": refs, "relevance": {k: sum(r["alpha"]*r["relevance"][k] for r in refs) for k in DIMS},
            "aggregation": {k: sum(r["alpha"]*r["aggregation"][k] for r in refs) for k in AGG},
            "mu": max(r["mu"] for r in refs), "sigma": max(r["sigma"] for r in refs)}


def member(model, age, aspects):
    number(age, "age")
    if len(aspects) != len(model["refs"]):
        raise ValueError("Aspect set differs from reviewed references")
    contributions = dict.fromkeys(DIMS, 0)
    education = experience = 0
    for ref in model["refs"]:
        c = aspects[ref["id"]]
        for k in DIMS:
            contributions[k] += ref["alpha"]*ref["relevance"][k]*number(c[k], k, 0, 1)
        education += ref["alpha"]*number(c["education"], "education")
        experience += ref["alpha"]*number(c["experience"], "experience")
    return {"R": sum(contributions.values()), "E": isr_core.expertise(education, experience, age),
            "education_raw": education, "experience": experience, "contributions": contributions,
            "effective": {k: contributions[k]/model["relevance"][k] if model["relevance"][k]>0 else 0 for k in DIMS}}


def public_scores(model, members):
    ids = [identifier(m["uid"]) for m in members]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate member")
    for m in members:
        number(m["R"], "R", 0, 1+1e-6)
        number(m["E"], "E")
    weights = dict(zip(("w_relevance", "w_expertise", "w_contribution"), (model["aggregation"][k] for k in AGG)))
    return isr_core.isr_for_public(members, weights)


def directed_ties(affected_ids, outgoing, candidate):
    identifier(candidate)
    seen = set()
    result = []
    for h in affected_ids:
        identifier(h)
        if h in seen:
            raise ValueError("Duplicate affected person")
        seen.add(h)
        if h not in outgoing:
            raise ValueError("Affected relation data unavailable")
        if h != candidate and candidate in outgoing[h]:
            result.append({"affectedId": h, "tie": number(outgoing[h][candidate], "tie", 0, 1)})
    return result
