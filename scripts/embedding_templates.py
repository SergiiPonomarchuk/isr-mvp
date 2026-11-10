"""Task A4 (R9): the texts embedded for the people, template t1 (A4 spec section 3, decision 2,
work experience amended on 2026-11-10 for the P1 fields). The issue template is in
functions/ai-config.js (issueText).

They describe only what the person does and knows. Not included: age, gender, nationality, places
(home, work, the job's place), relations, values, salary, offences, marks, institution names, and
whether an education is in progress.

Profile vector (S):
    Occupation: {post.job}, {post.department}.
    Education: {educationLevel} in {specialization}; ...
    Experience: {name} ({specialization}): {comment}; ...
    Activities: {name}, ...

Skill vectors (E), one text each:
    education        {educationLevel} in {specialization}
    work experience  {name} ({specialization}): {comment}    (P1: role, field, description)
    activity         {name}

Empty parts are dropped. A work-experience entry without role and field (the data before P1)
gives only its comment. Items keep the order of users.skills.
"""
from __future__ import annotations

import ai_config

VERSION = ai_config.EMBED_TEMPLATE_VERSION
WE = "work experience"


def _clean(x) -> str:
    return " ".join(str(x).split()) if x not in (None, "") else ""


def _item(x) -> str:
    """An item inside a line: no trailing full stop (the line adds its own)."""
    return _clean(x).rstrip(" .;")


def education_text(s) -> str:
    level, spec = _clean(s.get("educationLevel")), _clean(s.get("specialization"))
    return f"{level} in {spec}" if level and spec else (level or spec)


def work_text(s) -> str:
    role, field, desc = _clean(s.get("name")), _clean(s.get("specialization")), _clean(s.get("comment"))
    head = f"{role} ({field})" if role and field else (role or field)
    return f"{head}: {desc}" if head and desc else (head or desc)


def activity_text(s) -> str:
    return _clean(s.get("name"))


SKILL_TEXT = {"education": education_text, WE: work_text, "activity": activity_text}


def skill_text(s) -> str:
    f = SKILL_TEXT.get(s.get("type"))
    return f(s) if f else ""


def _line(label, items, sep="; "):
    items = [i for i in (_item(x) for x in items) if i]
    return f"{label}: {sep.join(items)}." if items else ""


def profile_text(user) -> str:
    post = (user.get("post") or [{}])[0] or {}
    skills = user.get("skills") or []
    occupation = ", ".join(p for p in (_item(post.get("job")), _item(post.get("department"))) if p)
    activities = []
    for s in skills:
        t = activity_text(s) if s.get("type") == "activity" else ""
        if t and t not in activities:
            activities.append(t)
    lines = [f"Occupation: {occupation}." if occupation else "",
             _line("Education", [education_text(s) for s in skills if s.get("type") == "education"]),
             _line("Experience", [work_text(s) for s in skills if s.get("type") == WE]),
             _line("Activities", activities, ", ")]
    return "\n".join(l for l in lines if l)


def skill_texts(user):
    """{skill id (str): text} for the skills that give a non-empty text."""
    out = {}
    for s in user.get("skills") or []:
        t = skill_text(s)
        if t and s.get("id") is not None:
            out[str(s["id"])] = t
    return out
