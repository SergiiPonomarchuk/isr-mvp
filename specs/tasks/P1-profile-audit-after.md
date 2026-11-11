# P1 profile audit

Generated 2026-11-11T10:32:21 by `scripts/audit_profiles.py` (read-only).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Vector coverage: `claude_export/emb_*_ids.json` (2026-10-12).

Profiles: 9150. Without the usual fields (no `skills`, `post`, ...): 0 (document ids -; fields: -; uid -).

## 1. Identity and demographics

- `displayName` differs from `firstName lastName`: 0.
- `birthDate`: unparsable 0; age on 2026-11-10: min 1, median 32, max 101; under 18: 2633; over 90: 73.
- `gender`: Male (4597), Female (4553).
- `nationality`: 38 values; most common German (5682), French (1346), Swiss (410), Italian (342), Turkish (273), Polish (114).
- `isVerified`: True (9150).
- `features`: non-empty in 0 of 9150.
- Under 18 (2633): with an education skill 0, with work experience 0, with a job other than child/toddler/student/unemployed 0.

## 2. Job (`post`)

- Entries per profile: 1 (9150).
- `job`: 70 distinct; most common child (2143), unemployed (1407), toddler (584), Agricultural Worker (429), Plant Operator (330), School Teacher (315), General Practitioner (256), Road Maintenance Worker (199).
- `department` empty: 7827 of 9150; `place` empty: 1407.
- `educationLevel` values: None (3612), Bachelor (2313), College (1400), Master (1014), Vocational Training (656), PhD (155).
- `salary`: min 6000, median 28000, max 156000; zero or missing: 2727.
- Job `educationLevel` against the highest completed education skill: same as highest education skill (5538), no completed education, job level empty (3612).

## 3. Skills

- Skills: 20245; by type: work experience (11057), education (5835), activity (3353); per profile: 1 (2008), 3 (1929), 4 (1877), 0 (1555), 2 (1321), 5 (460).
- `activity`: fields `id` (3353, empty 0), `name` (3353, empty 0), `time` (3353, empty 0), `type` (3353, empty 0).
- `education`: fields `educationLevel` (5835, empty 0), `graduationYear` (5835, empty 0), `id` (5835, empty 0), `in_progress` (297, empty 0), `name` (5835, empty 0), `specialization` (5835, empty 0), `type` (5835, empty 0).
- `work experience`: fields `comment` (11057, empty 0), `id` (11057, empty 0), `name` (11057, empty 0), `specialization` (11057, empty 0), `time` (11057, empty 0), `type` (11057, empty 0).
- Profiles with a repeated skill `id`: 0.

### Education

- `educationLevel`: Bachelor (2424), College (1425), Master (1118), Vocational Training (661), PhD (207).
- `specialization`: 69 distinct; Engineering (566), Chemistry (509), Music (284), Fine Arts (280), IT (275), Design (274), Mechanics (219), Construction (212), Education (151), Agronomy (146), Food Production (140), Law (134).
- Institutions (`name`): 39 distinct; e.g. Bilim Technical College (922), Bilim Art School (838), Andim Polytechnic University (651), University of Andim (315).
- Age at graduation: min 18, median 22, max 29; under 16: 0; over 60: 0; graduation year in the future: 297 (marked `in_progress`: 297; `in_progress` on a past year: 0).
- Age at graduation by level: Vocational Training min 18, median 19, max 20; College min 19, median 20, max 21; Bachelor min 21, median 22, max 23; Master min 23, median 24, max 25; PhD min 27, median 28, max 29.
- Same level and specialization twice in one profile: 0.

### Work experience

- Entries: 11057 in 5097 profiles.
- `name` empty: 0; `specialization` empty: 0.
- `time` (years; E multiplies each cosine by it, `functions/isr.js` experienceSum): 10 (1535), 15 (1418), 5 (1263), 20 (898), 8 (806), 3 (795), 2 (639), 4 (613), 6 (445), 25 (383); min 0.5, median 10, max 79.
- A person's years in total over age - 16 (P1 limit): 0.
- `name` (role): 1831 distinct; Plant Operator (321), School Teacher (307), General Practitioner (255), Cleaning Staff (192), IT Specialist (192), Police Officer (190), Agricultural Worker (182), Shop Manager (177).
- `specialization` (field): 73 distinct; Engineering (920), Business Admin (697), Education (690), IT (634), Chemistry (553), Construction (453), Business (449), Medicine (425).
- `comment` length: min 86, median 125, max 164 characters.
- Comments that describe another person ("A/An/The … who …"): 0 of 11057 (0.0 %).
- Examples: .
- Other examples: "Managed quality control processes and conducted chemical testing to ensure product standards met rigorous industrial safety requirements."; "Analyzed community health data to support policy development and improve access to essential medical services locally."; "Managed complex supply chain operations and coordinated distribution schedules to optimize resource allocation for the organization.".

### Activities

- Entries: 3353; `name`: 51 distinct; Video Gaming (173), Football (157), Cycling (149), Swimming (146), Dancing (125), Board Games (120), Basketball (114), Running (105), Music (playing instrument) (101), Cooking (100).
- `time`: 1 (3353).

## 4. Embedding coverage (export of 2026-10-12)

- Profiles without a profile vector: 0.
- Skills without a skill vector: none; vectors without a matching skill: 0.

## 5. Places, relations, other fields

- `geography` entries per profile: 2 (4911), 1 (4239); types: home (9150), work (4911); without coordinates: 0.
- `socialRelations` per profile: 4 (1461), 5 (1376), 6 (1200), 3 (938), 7 (915), 8 (769), 9 (654), 2 (596), 10 (411), 11 (237); types: son (4553), mother (4480), father (4442), daughter (4369), brother (3390), cousin (3316), sister (3232), aunt (2165), nephew (2162), niece (2125).
- Relations to a user that does not exist: 0; to oneself: 0; one-way (no relation back): 0 of 53412.
- `offences`: profiles with at least one: 1357; severity: Minor (1433), Moderate (496), Major (102). Not read by any formula.
- `marks` (reaction totals): present in 9150.
- `values_description`: 1460 profiles; length min 707, median 5684, max 9884 characters.

