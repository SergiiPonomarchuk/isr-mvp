"""Pure Values schema 1.0 metadata calculation and Firestore encoding.

No provider, credential or database access. Historical schema conversion/backfill
is deliberately outside these adapters.
"""
import copy
import math

VERSION = "1.0"
DOMAIN_KEYS = tuple(f"d{i}" for i in range(1, 11))
META_FIELDS = ("vector_id", "timestamp", "uid", "version", "overall_confidence", "hash")


def validate_gl_cs(value):
    if not isinstance(value, list) or len(value) != 10:
        raise ValueError("meta.gl_cs requires exactly ten pairs")
    pairs = []
    for index, pair in enumerate(value):
        if not isinstance(pair, list) or len(pair) != 2:
            raise ValueError(f"meta.gl_cs[{index}] requires grounding and confidence")
        if any(type(x) not in (int, float) or not 0 <= x <= 100 or not math.isfinite(x) for x in pair):
            raise ValueError(f"meta.gl_cs[{index}] requires finite numeric values in 0..100")
        pairs.append(list(pair))
    return pairs


def overall_grounding(gl_cs):
    pairs = validate_gl_cs(gl_cs)
    return sum(pair[0] for pair in pairs) / 10


def finalized_metadata(meta):
    if not isinstance(meta, dict) or meta.get("version") != VERSION:
        raise ValueError("Canonical Values metadata requires version 1.0")
    pairs = validate_gl_cs(meta.get("gl_cs"))
    result = {k: copy.deepcopy(meta[k]) for k in META_FIELDS if k in meta}
    result["gl_cs"] = pairs
    result["overall_grounding"] = overall_grounding(pairs)
    return result


def metadata_for_firestore(meta):
    result = finalized_metadata(meta)
    result["gl_cs"] = {key: {"grounding": pair[0], "confidence": pair[1]}
                       for key, pair in zip(DOMAIN_KEYS, result["gl_cs"])}
    return result


def metadata_from_firestore(meta):
    if not isinstance(meta, dict):
        raise ValueError("Values metadata must be an object")
    slots = meta.get("gl_cs")
    if not isinstance(slots, dict) or set(slots) != set(DOMAIN_KEYS):
        raise ValueError("Firestore gl_cs requires d1..d10")
    pairs = []
    for key in DOMAIN_KEYS:
        pair = slots[key]
        if not isinstance(pair, dict) or set(pair) != {"grounding", "confidence"}:
            raise ValueError("Firestore gl_cs requires grounding/confidence objects")
        pairs.append([pair["grounding"], pair["confidence"]])
    return finalized_metadata({**meta, "gl_cs": pairs})
