# A4 phase B: embedding report

Generated 2026-11-11T12:57:41 by `scripts/embed_people.py` (APPLIED).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Model `gemini-embedding-001`, 768 dimensions, task type `RETRIEVAL_DOCUMENT`, template `t1` (`scripts/embedding_templates.py`).

## Plan

- People: 9150; already current: 688; to embed: 8462; skipped documents without `skills` or uid: 0 (-).
- Texts to embed: 27200 (profiles 8462, education 5402, work experience 10225, activities 3111); people without a profile text: 0; skills without a text: 0; people without a `user_vectors` document: 0.
- Estimated tokens (4 characters a token): 999,784, about $0.15 at the paid rate; requests needed: 272; at 24,000 tokens a minute about 42 minutes.
- Texts over 2048 estimated tokens (cut by the API): 0.

## Run

- requests 273, texts embedded 27,200, estimated tokens 999,784, people written 8,462, people left for the next run 0.

## Spread

- Median cosine between random pairs of profile vectors: new 0.811 (over 8462 people of this run), old 0.911 (the same people's stored vectors). The 9,150 old vectors had 0.91 (A4 spec).

## Example texts

### uid 6198

```
Occupation: unemployed.
```


### uid 1227

```
Occupation: Director, Management.
Education: Master in Literature.
Experience: Literature Research Assistant (Literature): Analyzed classical literary texts and supported academic research projects within the university department for several years; Director (Education): Oversees daily operations and strategic planning for the educational institution to ensure high standards of learning.
```

- skill 1 (education): Master in Literature
- skill 2 (work experience): Literature Research Assistant (Literature): Analyzed classical literary texts and supported academic research projects within the university department for several years.
- skill 3 (work experience): Director (Education): Oversees daily operations and strategic planning for the educational institution to ensure high standards of learning.

### uid 501

```
Occupation: unemployed.
Education: Vocational Training in IT.
Experience: IT Support Specialist (IT): Provided technical assistance and hardware troubleshooting for a local network of small business office computers; Systems Administrator (IT): Managed server infrastructure and maintained network security protocols for a mid-sized regional technology service provider.
```

- skill 1 (education): Vocational Training in IT
- skill 2 (work experience): IT Support Specialist (IT): Provided technical assistance and hardware troubleshooting for a local network of small business office computers.
- skill 4 (work experience): Systems Administrator (IT): Managed server infrastructure and maintained network security protocols for a mid-sized regional technology service provider.
