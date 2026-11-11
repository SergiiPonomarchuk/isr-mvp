# A4 phase B: embedding report

Generated 2026-11-11T11:33:13 by `scripts/embed_people.py` (APPLIED).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Model `gemini-embedding-001`, 768 dimensions, task type `RETRIEVAL_DOCUMENT`, template `t1` (`scripts/embedding_templates.py`).

## Plan

- People: 9150; already current: 200; to embed: 8950; skipped documents without `skills` or uid: 0 (-).
- Texts to embed: 28746 (profiles 8950, education 5703, work experience 10813, activities 3280); people without a profile text: 0; skills without a text: 0; people without a `user_vectors` document: 0.
- Estimated tokens (4 characters a token): 1,056,816, about $0.16 at the paid rate; requests needed: 288; at 24,000 tokens a minute about 45 minutes.
- Texts over 2048 estimated tokens (cut by the API): 0.

## Run

- requests 12, texts embedded 300, estimated tokens 11,012, people written 88, failed requests 1, stopped on errors 1, people left for the next run 8,862.

## Spread

- Median cosine between random pairs of profile vectors: new 0.808 (over 88 people of this run), old 0.916 (the same people's stored vectors). The 9,150 old vectors had 0.91 (A4 spec).

## Example texts

### uid 2873

```
Occupation: Electrician, Maintenance.
Education: Vocational Training in Music.
Experience: Maintenance Technician (Engineering): Performed routine maintenance and repairs on industrial machinery to ensure continuous and safe production operations; Electrician (Electronics): Installed and maintained complex electrical systems and wiring to support industrial equipment and facility infrastructure.
```

- skill 1 (education): Vocational Training in Music
- skill 3 (work experience): Maintenance Technician (Engineering): Performed routine maintenance and repairs on industrial machinery to ensure continuous and safe production operations.
- skill 4 (work experience): Electrician (Electronics): Installed and maintained complex electrical systems and wiring to support industrial equipment and facility infrastructure.

### uid 5408

```
Occupation: Agronomist/Farm Manager.
Education: Bachelor in Material Science.
```

- skill 1 (education): Bachelor in Material Science

### uid 547

```
Occupation: General Practitioner.
Education: PhD in Engineering.
Experience: Political Research Assistant (Political Science): Conducted research on electoral systems and democratization processes within various regions of Central Asia; Legal Intern (Law): Supported legal teams by researching case law and drafting documents for complex litigation proceedings; General Practitioner (Medicine): Provides comprehensive medical care and diagnostic services to patients in a clinical healthcare setting.
Activities: Tennis.
```

- skill 1 (education): PhD in Engineering
- skill 2 (work experience): Political Research Assistant (Political Science): Conducted research on electoral systems and democratization processes within various regions of Central Asia.
- skill 3 (work experience): Legal Intern (Law): Supported legal teams by researching case law and drafting documents for complex litigation proceedings.
- skill 4 (work experience): General Practitioner (Medicine): Provides comprehensive medical care and diagnostic services to patients in a clinical healthcare setting.
- skill 5 (activity): Tennis
