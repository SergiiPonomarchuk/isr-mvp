"""Expertise (E) and member ISR arithmetic, as defined by PD-8 and
docs/ISR-Expertise-Assessment-v1.md section 2 (task A2).

    E = max(min(age, 30) / 30, sum_education cos^CBC * P) + sum_experience cos * P

Pure functions only: no Firebase, no network. The education and experience
arithmetic is ported unchanged from scratch/backfill_expertise.py (the code
that produced the stored values); A2 removes the resources part and adds the
age floor. The age is taken at the registration moment of the issue and is
never stored.

Aggregation (normalisation by the public mean, C = 1.0) stays as built; the
canonical module is task A1.
"""
from __future__ import annotations

import datetime as _dt
import math
import re

AGE_FLOOR_FULL = 30  # from this age on, the floor is 1.0

# Fields that A2 removes from stored documents.
OBSOLETE_MEMBER_FIELDS = ("resources_expertise",)
OBSOLETE_ISSUE_FIELDS = (
    "w_education", "w_experience", "w_resources",
    "reasoning_education", "reasoning_experience", "reasoning_resources",
    "expertise_weights", "expertise_weights_reasoning", "expertise_explanations",
    "contemporary_importance", "age_penalty_threshold",
)

# ISR weight triples that the as-built backfill used (IF l.100); the stored
# per-public weights were later removed from the discussion docs, so they are
# recovered from the stored member values.
AS_BUILT_ISR_WEIGHTS = ((0.4, 0.3, 0.3), (0.4, 0.2, 0.4), (0.5, 0.2, 0.3))

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# ---------------------------------------------------------------- age

def parse_birth_date(value) -> _dt.date:
    """Parse a required birthDate "YYYY-MM-DD". Raises ValueError otherwise."""
    if not isinstance(value, str) or not _DATE_RE.match(value.strip()):
        raise ValueError("birthDate must be a 'YYYY-MM-DD' string")
    return _dt.date.fromisoformat(value.strip())


def to_date(value) -> _dt.date:
    """Accept a date, a datetime, an ISO string or a Firestore timestamp."""
    if isinstance(value, _dt.datetime):
        return value.date()
    if isinstance(value, _dt.date):
        return value
    if isinstance(value, str) and value.strip():
        return _dt.datetime.fromisoformat(value.strip().replace("Z", "+00:00")).date()
    raise ValueError("registration date missing or not a date")


def age_in_years(birth_date, on_date) -> int:
    """Completed years at on_date (the issue's registration moment)."""
    born = parse_birth_date(birth_date)
    on = to_date(on_date)
    if on < born:
        raise ValueError("registration date is before birthDate")
    return on.year - born.year - ((on.month, on.day) < (born.month, born.day))


def age_floor(age: float) -> float:
    """Common-knowledge floor: age/30 below 30, 1.0 from 30 on."""
    if age < 0:
        raise ValueError("age must be >= 0")
    return min(age, AGE_FLOOR_FULL) / AGE_FLOOR_FULL


# ---------------------------------------------------- education, experience

def cosine_similarity(a, b) -> float:
    if a is None or b is None:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)


def education_params(level) -> tuple[float, float]:
    """(CBC, education time in years), as in scratch/backfill_expertise.py:51-64."""
    lvl = str(level or "").lower()
    if "phd" in lvl:
        return 0.5, 10.0
    if "master" in lvl:
        return 0.8, 6.0
    if "bachelor" in lvl:
        return 1.0, 4.0
    if "college" in lvl:
        return 1.5, 3.0
    if "vocational" in lvl or "training" in lvl:
        return 2.0, 2.0
    return 1.0, 4.0


def education_sum(skills, vectors_by_skill_id, issue_vector, cbc_adjustment=1.0) -> float:
    """Sum over education records of cos^(CBC * adjustment) * P."""
    total = 0.0
    if not issue_vector:
        return total
    for s in skills or []:
        if s.get("type") != "education":
            continue
        vec = vectors_by_skill_id.get(str(s.get("id")))
        if vec is None:
            continue
        cos = max(0.0, cosine_similarity(vec, issue_vector))
        cbc, years = education_params(s.get("educationLevel"))
        total += cos ** (cbc * cbc_adjustment) * years
    return total


def experience_sum(skills, vectors_by_skill_id, issue_vector) -> float:
    """Sum over work-experience records of cos * years (as built: no decay)."""
    total = 0.0
    if not issue_vector:
        return total
    for s in skills or []:
        if s.get("type") != "work experience":
            continue
        vec = vectors_by_skill_id.get(str(s.get("id")))
        if vec is None:
            continue
        cos = max(0.0, cosine_similarity(vec, issue_vector))
        total += cos * float(s.get("time", 1.0))
    return total


def education_part(edu_sum: float, age: float) -> float:
    return max(age_floor(age), edu_sum)


def expertise(edu_sum: float, exp_sum: float, age: float) -> float:
    """E = max(floor(age), education) + experience. No resources, no weights."""
    return education_part(edu_sum, age) + exp_sum


# ------------------------------------------------------- aggregation (as built)

def normalize_by_mean(values):
    """As built in scratch/backfill_expertise.py:231-247: x / mean, 0 if mean <= 0."""
    if not values:
        return []
    mean = sum(values) / len(values)
    return [(v / mean) if mean > 0.0 else 0.0 for v in values]


def isr(norm_r: float, norm_e: float, norm_c: float, weights) -> float:
    w_r, w_e, w_c = weights
    return w_r * norm_r + w_e * norm_e + w_c * norm_c


def fit_isr_weights(members, tol=0.0016):
    """Recover the (w_R, w_E, w_C) a public was computed with from its stored
    normalized values and isr_score. Returns the unique matching as-built triple,
    or raises ValueError. tol covers the 3-decimal rounding of stored values."""
    fits = []
    for w in AS_BUILT_ISR_WEIGHTS:
        worst = max(
            abs(m["isr_score"] - isr(m["normalized_relevance"], m["normalized_experience"],
                                     m["normalized_contribution"], w))
            for m in members
        )
        if worst <= tol:
            fits.append(w)
    if len(fits) != 1:
        raise ValueError(f"cannot recover ISR weights uniquely (matches: {fits})")
    return fits[0]


def recompute_public(members, weights, ages):
    """New E and ISR for one ad-hoc public from the stored parts.

    members: dicts with user_id, education_expertise, experience_expertise,
             relevance_score, normalized_contribution.
    ages:    {user_id: age at the issue's registration}.
    Returns one dict of new values per member (same order). Rounded to 3
    decimals as the stored values are.
    """
    es, rs = [], []
    for m in members:
        es.append(expertise(float(m.get("education_expertise", 0.0)),
                            float(m.get("experience_expertise", 0.0)),
                            ages[m["user_id"]]))
        rs.append(float(m.get("relevance_score", 0.0)))
    ne = normalize_by_mean(es)
    nr = normalize_by_mean(rs)
    out = []
    for m, e, n_e, n_r in zip(members, es, ne, nr):
        n_c = float(m.get("normalized_contribution", 1.0))
        edu = education_part(float(m.get("education_expertise", 0.0)), ages[m["user_id"]])
        out.append({
            "education_expertise": round(edu, 3),
            "expertise_score": round(e, 3),
            "normalized_relevance": round(n_r, 3),
            "normalized_experience": round(n_e, 3),
            "isr_score": round(isr(n_r, n_e, n_c, weights), 3),
        })
    return out
