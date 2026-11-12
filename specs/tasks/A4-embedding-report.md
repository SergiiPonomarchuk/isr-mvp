# A4 phase B: embedding report

Generated 2026-11-11T20:31:19 by `scripts/embed_people.py` (APPLIED).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Model `gemini-embedding-001`, 768 dimensions, task type `RETRIEVAL_DOCUMENT`, template `t1` (`scripts/embedding_templates.py`).

## Plan

- People: 9150; already current: 2038; to embed: 7112; skipped documents without `skills` or uid: 0 (-).
- Texts to embed: 22751 (profiles 7112, education 4509, work experience 8512, activities 2618); people without a profile text: 0; skills without a text: 0; people without a `user_vectors` document: 0.
- Estimated tokens (4 characters a token): 833,512, about $0.13 at the paid rate; requests needed: 228; at 24,000 tokens a minute about 35 minutes.
- Texts over 2048 estimated tokens (cut by the API): 0.

## Run

- requests 229, texts embedded 22,751, estimated tokens 833,512, people written 7,112, people left for the next run 0.

## Spread

- Median cosine between random pairs of profile vectors: new 0.810 (over 7112 people of this run), old 0.913 (the same people's stored vectors). The 9,150 old vectors had 0.91 (A4 spec).

## Example texts

### uid 8132

```
Occupation: child.
```


### uid 4179

```
Occupation: Shop Manager.
Education: Master in Computer Science.
Experience: Software Developer (Computer Science): Developed and maintained complex software applications to improve operational efficiency for various corporate clients; Shop Manager (Business): Oversees daily retail operations including inventory management and staff supervision to ensure high levels of customer satisfaction.
Activities: Language Learning.
```

- skill 1 (education): Master in Computer Science
- skill 2 (work experience): Software Developer (Computer Science): Developed and maintained complex software applications to improve operational efficiency for various corporate clients.
- skill 4 (work experience): Shop Manager (Business): Oversees daily retail operations including inventory management and staff supervision to ensure high levels of customer satisfaction.
- skill 5 (activity): Language Learning

### uid 3092

```
Occupation: Logistics Manager.
Education: Master in Environmental Systems.
Experience: Logistics Coordinator (Logistics): Streamlined supply chain operations and managed inventory distribution across multiple regional warehouse facilities for improved efficiency; Supply Chain Analyst (Logistics): Analyzed transportation data to optimize delivery routes and reduce operational costs for a large distribution network; Logistics Manager (Logistics): Directs all logistics operations and strategic planning to ensure timely delivery of goods within the corporate framework.
```

- skill 1 (education): Master in Environmental Systems
- skill 2 (work experience): Logistics Coordinator (Logistics): Streamlined supply chain operations and managed inventory distribution across multiple regional warehouse facilities for improved efficiency.
- skill 3 (work experience): Supply Chain Analyst (Logistics): Analyzed transportation data to optimize delivery routes and reduce operational costs for a large distribution network.
- skill 4 (work experience): Logistics Manager (Logistics): Directs all logistics operations and strategic planning to ensure timely delivery of goods within the corporate framework.
