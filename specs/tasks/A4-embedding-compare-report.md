# A4 phase B: embedding report

Generated 2026-11-11T12:08:42 by `scripts/embed_people.py` (APPLIED).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Model `gemini-embedding-001`, 768 dimensions, task type `RETRIEVAL_DOCUMENT`, template `t1` (`scripts/embedding_templates.py`).

## Plan

- People: 9150; already current: 488; to embed: 200; skipped documents without `skills` or uid: 0 (-).
- Texts to embed: 616 (profiles 200, education 117, work experience 230, activities 69); people without a profile text: 0; skills without a text: 0; people without a `user_vectors` document: 0.
- Estimated tokens (4 characters a token): 22,322, about $0.00 at the paid rate; requests needed: 7; at 24,000 tokens a minute about 1 minutes.
- Texts over 2048 estimated tokens (cut by the API): 0.

## Run

- requests 7, texts embedded 616, estimated tokens 22,322, people written 200, people left for the next run 0.

## Spread

- Median cosine between random pairs of profile vectors: new 0.812 (over 200 people of this run), old 0.910 (the same people's stored vectors). The 9,150 old vectors had 0.91 (A4 spec).

## Task types (open point 4.3): S for 5 issues against 200 profiles (6 requests)

a = issue `RETRIEVAL_QUERY`, profiles `RETRIEVAL_DOCUMENT` (chosen); b = `SEMANTIC_SIMILARITY` for both. S = max(0, cos). A wider spread separates relevant people better.

| Issue | a: mean | a: sd | a: p10-p90 | a: max | a: top 10 - median | b: mean | b: sd | b: p10-p90 | b: max | b: top 10 - median | top 10 shared |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Broken entrance door lock | 0.535 | 0.017 | 0.515-0.553 | 0.586 | 0.033 | 0.688 | 0.025 | 0.658-0.727 | 0.762 | 0.045 | 3 |
| School bus stop moved | 0.548 | 0.033 | 0.502-0.600 | 0.600 | 0.055 | 0.717 | 0.048 | 0.670-0.810 | 0.810 | 0.114 | 10 |
| Noise from the new bar | 0.548 | 0.018 | 0.523-0.570 | 0.591 | 0.037 | 0.695 | 0.026 | 0.664-0.736 | 0.736 | 0.042 | 0 |
| Potholes on the farm road | 0.534 | 0.025 | 0.510-0.570 | 0.632 | 0.071 | 0.699 | 0.024 | 0.668-0.726 | 0.783 | 0.058 | 6 |
| Clinic opening hours cut | 0.545 | 0.020 | 0.520-0.568 | 0.612 | 0.051 | 0.693 | 0.023 | 0.662-0.727 | 0.762 | 0.041 | 4 |

## Example texts

### uid 2218

```
Occupation: Police Officer.
Education: College in Food Production.
Experience: Food Production Specialist (Food Production): Monitored production lines and ensured quality standards were met during the manufacturing of food products; Police Officer (Public Administration): Patrolled assigned areas and enforced local laws to maintain public safety and community order.
Activities: Running.
```

- skill 1 (education): College in Food Production
- skill 2 (work experience): Food Production Specialist (Food Production): Monitored production lines and ensured quality standards were met during the manufacturing of food products.
- skill 3 (work experience): Police Officer (Public Administration): Patrolled assigned areas and enforced local laws to maintain public safety and community order.
- skill 4 (activity): Running

### uid 7226

```
Occupation: child.
```


### uid 4768

```
Occupation: School Teacher.
Education: Bachelor in Medicine.
Experience: Medical Assistant (Medicine): Supported clinical staff with patient intake and administrative tasks in a busy medical office setting; School Teacher (Education): Developed and delivered educational curriculum to students while fostering a supportive and engaging classroom learning environment.
```

- skill 1 (education): Bachelor in Medicine
- skill 3 (work experience): Medical Assistant (Medicine): Supported clinical staff with patient intake and administrative tasks in a busy medical office setting.
- skill 4 (work experience): School Teacher (Education): Developed and delivered educational curriculum to students while fostering a supportive and engaging classroom learning environment.
