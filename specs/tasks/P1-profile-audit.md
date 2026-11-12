# P1 profile audit

Generated 2026-11-10T00:06:45 by `scripts/audit_profiles.py` (read-only).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Vector coverage: `claude_export/emb_*_ids.json` (2026-10-12).

Profiles: 9151. Without the usual fields (no `skills`, `post`, ...): 1 (document ids 'None'; fields: displayName, socialRelations, uid; uid None).

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
- `educationLevel` values: None (5410), Bachelor (1557), College (1102), Master (709), Vocational Training (308), PhD (64).
- `salary`: min 6000, median 28000, max 156000; zero or missing: 2727.
- Job `educationLevel` against the highest education skill: same as highest education skill (3720), no education skill (3315), job level unknown (2115).

## 3. Skills

- Skills: 20245; by type: work experience (11057), education (5835), activity (3353); per profile: 1 (2008), 3 (1929), 4 (1877), 0 (1555), 2 (1321), 5 (460).
- `activity`: fields `id` (3353, empty 0), `name` (3353, empty 0), `time` (3353, empty 0), `type` (3353, empty 0).
- `education`: fields `educationLevel` (5835, empty 0), `graduationYear` (5835, empty 0), `id` (5835, empty 0), `name` (5835, empty 0), `specialization` (5835, empty 0), `type` (5835, empty 0).
- `work experience`: fields `comment` (11057, empty 0), `id` (11057, empty 0), `name` (11057, empty 11057), `specialization` (11057, empty 11057), `time` (11057, empty 0), `type` (11057, empty 0).
- Profiles with a repeated skill `id`: 0.

### Education

- `educationLevel`: Bachelor (2424), College (1425), Master (1118), Vocational Training (661), PhD (207).
- `specialization`: 69 distinct; Engineering (566), Chemistry (509), Music (284), Fine Arts (280), IT (275), Design (274), Mechanics (219), Construction (212), Education (151), Agronomy (146), Food Production (140), Law (134).
- Institutions (`name`): 39 distinct; e.g. Bilim Technical College (922), Bilim Art School (838), Andim Polytechnic University (651), University of Andim (315).
- Age at graduation: min 23, median 23, max 23; under 16: 0; over 60: 0; graduation year in the future: 470.
- Same level and specialization twice in one profile: 0.

### Work experience

- Entries: 11057 in 5097 profiles.
- `name` empty: 11057; `specialization` empty: 11057.
- `time` (years; E multiplies each cosine by it, `functions/isr.js` experienceSum): 1 (11057).
- `comment` length: min 18, median 93, max 750 characters.
- Comments that describe another person ("A/An/The … who …"): 5684 of 11057 (51.4 %).
- Examples: "An older sibling who works as a graphic designer and offers helpful advice on pairing art and technology"; "A legal consultant who specializes in tax law and estate planning, with a penchant for critiquing court decisions."; "A local government representative who recognizes the importance of rehabilitation centers and seeks the banker's expertise in securing funding".
- Other examples: "An organizational psychologist providing insights on how HR policies impact employee morale"; "a conservative elderly local resident of Summit County"; "A fellow historian with a focus on political history during the same era, providing a contrasting viewpoint to analyze the socio-political context in which women's literature emerged".

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

