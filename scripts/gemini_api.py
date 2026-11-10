"""Task A4: Gemini API calls for the Python scripts (embeddings), over REST with the standard library.

The key: GEMINI_API_KEY from the environment or functions/.secret.local. It is sent in a header,
never in a URL, and is never printed: every error message passes through redact().
"""
from __future__ import annotations

import json
import math
import os
import re
import urllib.error
import urllib.request

import ai_config

ROOT = ai_config.ROOT
API = "https://generativelanguage.googleapis.com/v1beta"
MAX_BATCH = 100                      # texts per batchEmbedContents request


class GeminiError(Exception):
    def __init__(self, message, status=None):
        super().__init__(message)
        self.status = status


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


def redact(text, key=None) -> str:
    s = str(text)
    if key:
        s = s.replace(key, "[redacted]")
    return re.sub(r"(key=)[^&\s]+", r"\1[redacted]", s)


def unit_normalize(v):
    n = math.sqrt(sum(x * x for x in v))
    if not n:
        raise GeminiError("zero vector")
    return [x / n for x in v]


def post(path, body, key, timeout=120):
    req = urllib.request.Request(f"{API}/{path}", data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as err:
        raise GeminiError(redact(f"HTTP {err.code}: {err.read()[:300]!r}", key), err.code) from None
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        raise GeminiError(redact(f"{type(err).__name__}: {err}", key)) from None


def embed_texts(texts, task_type, key, model=None, dims=None):
    """One batchEmbedContents request (at most MAX_BATCH texts). Returns unit vectors in order.
    gemini-embedding-001 below 3072 dimensions does not return unit vectors, so they are normalised
    here, as functions/ai-helper.js does."""
    if not texts:
        return []
    if len(texts) > MAX_BATCH:
        raise ValueError(f"at most {MAX_BATCH} texts a request")
    model = model or ai_config.EMBED_MODEL
    dims = dims or ai_config.EMBED_DIMS
    body = {"requests": [{"model": f"models/{model}", "content": {"parts": [{"text": t}]},
                          "taskType": task_type, "outputDimensionality": dims} for t in texts]}
    data = post(f"models/{model}:batchEmbedContents", body, key)
    embs = data.get("embeddings") or []
    if len(embs) != len(texts):
        raise GeminiError(f"{len(embs)} embeddings for {len(texts)} texts")
    out = []
    for e in embs:
        v = e.get("values") or []
        if len(v) != dims:
            raise GeminiError(f"vector of {len(v)} instead of {dims}")
        out.append(unit_normalize(v))
    return out
