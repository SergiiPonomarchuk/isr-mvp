"""Task A4: the AI configuration for the Python scripts, read from functions/ai-config.js, so the
models, sizes and versions have one source. Values only; no key is read here."""
from __future__ import annotations

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "functions", "ai-config.js")


def _load(path=SOURCE):
    src = open(path, encoding="utf-8").read()
    body = re.search(r"Object\.freeze\(\{(.*?)\}\)", src, re.S).group(1)
    out = {}
    for key, value in re.findall(r"^\s*(\w+):\s*(\"[^\"]*\"|-?\d+(?:\.\d+)?)\s*,", body, re.M):
        out[key] = value[1:-1] if value.startswith('"') else (float(value) if "." in value else int(value))
    return out


_C = _load()
TEXT_MODEL = _C["TEXT_MODEL"]
EMBED_MODEL = _C["EMBED_MODEL"]
EMBED_DIMS = _C["EMBED_DIMS"]
TEMPERATURE = _C["TEMPERATURE"]
SEED = _C["SEED"]
EMBED_TEMPLATE_VERSION = _C["EMBED_TEMPLATE_VERSION"]
TASK_TYPE_ISSUE = _C["TASK_TYPE_ISSUE"]
TASK_TYPE_DOCUMENT = _C["TASK_TYPE_DOCUMENT"]
