"""Python port of functions/isr.js (task A1 v2). Both are checked against
tests/fixtures/isr_cases.json, so the scripts compute exactly what the server and the
browser compute. The E-from-vectors parts are shared with scripts/expertise.py (A2).

Decisions (author, 2026-11-08): mean <= 0 with unequal values -> error; all equal (also
all zero) -> 1.0; C-hat = 1.0 ("constant") until Contribution exists; voters without an
ISR are excluded; a tie or no counted votes gives no winner.
"""
from __future__ import annotations

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from expertise import (  # noqa: E402  (same arithmetic as A2)
    age_in_years, age_floor, education_part, expertise, education_params,
    education_sum, experience_sum,
)

__all__ = [
    "relevance", "age_in_years", "age_floor", "education_part", "expertise", "education_params",
    "education_sum", "experience_sum", "normalize_by_mean", "contribution_placeholder",
    "isr_for_public", "tally",
]


def _num(v):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return 0.0
    return x if math.isfinite(x) else 0.0


def relevance(c, w, clamp=False):
    r = (_num(w.get("w_D")) * _num(c.get("D")) + _num(w.get("w_G")) * _num(c.get("G"))
         + _num(w.get("w_S")) * _num(c.get("S")) + _num(w.get("w_X")) * _num(c.get("X")))
    return max(0.0, min(1.0, r)) if clamp else r


def normalize_by_mean(values):
    """x / mean. All equal (also all zero) -> 1.0 each. Mean <= 0 with unequal values -> error."""
    values = list(values)
    if not values:
        return []
    if all(v == values[0] for v in values):
        return [1.0 for _ in values]
    mean = sum(values) / len(values)
    if not mean > 0:
        raise ValueError("mean <= 0 with unequal values: no normalisation rule (PD-3)")
    return [v / mean for v in values]


def contribution_placeholder():
    return {"value": 1.0, "source": "constant"}


def isr_for_public(members, weights):
    """members: [{uid, R, E}] -> [{uid, R, E, R_norm, E_norm, C_norm, contribution_source, isr}]."""
    rn = normalize_by_mean([_num(m.get("R")) for m in members])
    en = normalize_by_mean([_num(m.get("E")) for m in members])
    c = contribution_placeholder()
    w_r, w_e, w_c = (_num(weights.get("w_relevance")), _num(weights.get("w_expertise")),
                     _num(weights.get("w_contribution")))
    return [{
        "uid": m.get("uid"), "R": _num(m.get("R")), "E": _num(m.get("E")),
        "R_norm": rn[i], "E_norm": en[i], "C_norm": c["value"], "contribution_source": c["source"],
        "isr": w_r * rn[i] + w_e * en[i] + w_c * c["value"],
    } for i, m in enumerate(members)]


def tally(votes, isr_by_uid, option_count):
    """votes {uid: option} -> {scores, counted, excluded, winner, note} (same as ISR.tally)."""
    scores = [0.0] * option_count
    counted, excluded = [], []
    for uid in sorted((votes or {}).keys()):
        try:
            opt = float(votes[uid])
        except (TypeError, ValueError):
            opt = -1
        if not (0 <= opt < option_count and opt == int(opt)):
            excluded.append({"uid": uid, "reason": "invalid option"})
            continue
        opt = int(opt)
        w = (isr_by_uid or {}).get(uid)
        try:
            w = float(w)
            ok = math.isfinite(w)
        except (TypeError, ValueError):
            ok = False
        if not ok:
            excluded.append({"uid": uid, "reason": "no ISR"})
            continue
        scores[opt] += w
        counted.append({"uid": uid, "option": opt, "weight": w})
    winner, note = None, ""
    if not counted:
        note = "no counted votes"
    else:
        best = max(scores)
        top = [i for i, s in enumerate(scores) if abs(s - best) < 1e-9]
        if len(top) == 1:
            winner = top[0]
        else:
            note = "tie between options " + ", ".join(str(i) for i in top)
    return {"scores": scores, "counted": counted, "excluded": excluded, "winner": winner, "note": note}
