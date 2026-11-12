# P1 migration report

Generated 2026-11-11T10:31:30 by `scripts/migrate_p1.py` (APPLIED).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Reference date 2026-11-10 (ages, in progress). Text model `gemini-3.1-flash-lite`, prompt `p1w2`.

## Plan

- Profiles: 9150; documents to update: 8803; to delete: 1 ('None'); other stubs left alone: 0.
- Education (3a): entries changed 4753; in progress 297; age at graduation by level: Vocational Training min 18, median 19, max 20; College min 19, median 20, max 21; Bachelor min 21, median 22, max 23; Master min 23, median 24, max 25; PhD min 27, median 28, max 29.
- Job education level (4a): changed 1878; None -> Bachelor (756), None -> Vocational Training (348), None -> College (332), None -> Master (305), None -> PhD (97), College -> None (34), PhD -> None (6).
- Work experience (1a, 2): people 5097; from generated texts 5097; already repaired 0; not generated yet 0; input changed since generation 0; years scaled down to the limit 0.
- Years of work experience against age - 16 (repaired people only): over the limit 0; total years min 0.5, median 22, max 84.
- user_packs (R3): none in this database: checkIssue reads users, nothing to rebuild.

## Generation

- Calls so far: 526 (failed 6); tokens: prompt 868733, output 869733, thinking 0, total 1738466.
- Files: `scripts\p1_generated\work_experience.jsonl` (one line per person), `scripts\p1_generated\calls.jsonl` (every prompt and raw output).

## Examples (20 people, in generation order)

### uid 1001: age 52, General Practitioner (limit 36 years)

- Education: Bachelor in Chemistry, 1997 -> 1996. Job level: Bachelor -> Bachelor.
- Entry 3, old: "A stubborn older brother who's a strict police officer with a traditional viewpoint on law and order"
  - new: **Laboratory Technician** (Chemistry), 15 years: Performed complex chemical analysis and maintained laboratory equipment to ensure accurate results for various research projects.
- Entry 4, old: "A young child who prefers playtime over watching TV or movies"
  - new: **General Practitioner** (Medicine), 11 years: Provided comprehensive medical care and diagnostic services to patients within a busy hospital clinical setting.

### uid 2368: age 67, unemployed (limit 51 years)

- Education: Master in Material Science, 1982 -> 1982. Job level: None -> Master.
- Entry 2, old: "A comedy skit creator who seeks guidance from the digital marketing specialist to improve their video reach and audience engagement"
  - new: **Materials Research Scientist** (Material Science), 20 years: Conducted advanced research on new material properties to improve industrial manufacturing processes and product durability.
- Entry 4, old: "A tech-savvy marketing specialist tasked with promoting the open-access platform to academics worldwide"
  - new: **Senior Materials Consultant** (Material Science), 15 years: Advised engineering teams on material selection and structural integrity for large scale infrastructure development projects.

### uid 549: age 51, Supply Chain Worker (limit 35 years)

- Education: College in Fine Arts, 1998 -> 1994. Job level: College -> College.
- Entry 2, old: "A passionate archaeologist who transitioned into managing a history museum"
  - new: **Art Gallery Assistant** (Fine Arts), 10 years: Managed daily operations and curated local art exhibitions to promote community engagement with contemporary visual arts.
- Entry 3, old: "a social justice advocate who distrusts organizations with ties to hate groups"
  - new: **Logistics Coordinator** (Logistics), 8 years: Oversaw inventory management and supply chain workflows to ensure efficient distribution of goods across multiple locations.
- Entry 4, old: "a software developer familiar with Java and the PlantUML library"
  - new: **Supply Chain Worker** (Logistics), 9 years: Maintained accurate stock records and coordinated delivery schedules to support hotel operations and guest services.

### uid 2116: age 28, Electrician (limit 12 years)

- Education: College in Engineering, 2021 -> 2017. Job level: College -> College.
- Entry 3, old: "A novelist who seeks the software engineer's input on digital publishing platforms"
  - new: **Junior Electrical Technician** (Electronics), 4 years: Assisted with the installation and maintenance of electrical systems in residential and commercial building projects.
- Entry 4, old: "a senior fellow at the Human Factors and Ergonomics Society"
  - new: **Electrician** (Electronics), 3 years: Diagnosed and repaired complex electrical wiring systems to ensure safety and compliance with local building codes.

### uid 3859: age 27, Bus Driver (limit 11 years)

- Education: College in Chemistry, 2022 -> 2019. Job level: College -> College.
- Entry 2, old: "A physics major who is fascinated by the application of Fortran in scientific simulations"
  - new: **Chemical Lab Assistant** (Chemistry), 2 years: Supported senior researchers by preparing chemical samples and documenting experimental data for quality control purposes.
- Entry 4, old: "An improv performer who hosts regular comedy shows in their backyard"
  - new: **Bus Driver** (Transport Systems), 3 years: Operated public transit vehicles safely while adhering to strict schedules and providing excellent customer service.

### uid 4323: age 35, Shop Manager (limit 19 years)

- Education: Master in Education, 2014 -> 2016. Job level: Master -> Master.
- Entry 2, old: "A customer relations expert who specializes in improving client satisfaction for financial institutions"
  - new: **Education Program Coordinator** (Education), 5 years: Developed and implemented educational curricula to improve student learning outcomes in diverse classroom environments.
- Entry 3, old: "A dog owner who eagerly awaits the postman's arrival because their dog loves getting treats from him"
  - new: **Shop Manager** (Business), 3 years: Directed daily retail operations and managed staff schedules to maximize store efficiency and customer satisfaction.

### uid 345: age 44, Chemical Engineer, R&D (limit 28 years)

- Education: Master in Political Science, 2005 -> 2007. Job level: Master -> Master.
- Entry 2, old: "An aspiring Indian rower and a fan of Satnam Singh"
  - new: **Policy Analyst** (Political Science), 6 years: Evaluated government policies and drafted reports to support strategic decision making in public administration.
- Entry 3, old: "An award-winning director who started their career during the 'New Hollywood' era"
  - new: **Process Engineer** (Chemical Engineering), 5 years: Optimized chemical production processes to increase yield and reduce environmental impact in industrial manufacturing.
- Entry 4, old: "Another junior data scientist from a different university, constantly exchanging knowledge and sharing resources"
  - new: **Chemical Engineer** (Chemical Engineering), 6 years: Designed and implemented innovative chemical engineering solutions to enhance production efficiency and safety standards.

### uid 62: age 66, Road Maintenance Worker (limit 50 years)

- Education: PhD in Engineering, 1983 -> 1987. Job level: None -> PhD.
- Entry 2, old: "a proud young Jewish student at a Canadian university"
  - new: **Road Maintenance Worker** (Civil Engineering), 35 years: Performed essential road repairs and infrastructure maintenance to ensure safe travel conditions for the community.

### uid 1626: age 34, IT Specialist (limit 18 years)

- Education: Bachelor in Civil Engineering, 2014 -> 2014. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a former participant in beauty pageants who is always cheering for her home state contestants."
  - new: **Junior Civil Engineer** (Civil Engineering), 4 years: Assisted in the design and structural analysis of urban infrastructure projects to meet safety requirements.
- Entry 4, old: "A culture writer who recognizes the importance of this leader's contribution and seeks to spread awareness through their articles"
  - new: **IT Specialist** (IT), 5 years: Managed network infrastructure and provided technical support to ensure seamless operation of office computer systems.

### uid 1114: age 54, Accountant, Finance (limit 38 years)

- Education: Bachelor in Business, 1995 -> 1994. Job level: Bachelor -> Bachelor.
- Entry 2, old: "A large e-commerce company seeking to enhance their website's functionality with Perl programming"
  - new: **Junior Accountant** (Business Admin), 12 years: Maintained financial records and prepared monthly reports to support accurate budgeting and fiscal planning.
- Entry 4, old: "A powerful center with a strong work ethic and a quirky sense of humor"
  - new: **Accountant** (Business Admin), 15 years: Managed corporate financial accounts and ensured compliance with tax regulations for large industrial operations.

### uid 3435: age 39, Plant Operator, Production (limit 23 years)

- Education: College in Design, 2010 -> 2006. Job level: College -> College.
- Entry 2, old: "A former professional gymnast who understands the challenges of mental blocks and provides specialized techniques and support"
  - new: **Junior Interior Designer** (Design), 5 years: Created detailed floor plans and aesthetic layouts for residential renovation projects across the local metropolitan area.
- Entry 3, old: "A theoretical physicist who provides thought-provoking insights and challenges their opinions"
  - new: **Senior Design Consultant** (Design), 8 years: Managed client relationships and oversaw the implementation of complex design specifications for large scale commercial building projects.
- Entry 4, old: "An ambitious politician influenced by the professor's research on electoral systems"
  - new: **Plant Operator** (Engineering), 5 years: Monitored industrial machinery and ensured production efficiency while maintaining strict safety protocols within the manufacturing facility.

### uid 355: age 30, Supply Chain Worker (limit 14 years)

- Education: College in Agronomy, 2019 -> 2017. Job level: College -> College.
- Entry 2, old: "A lawyer working at the European Court of Justice, assisting with research and case preparation"
  - new: **Agricultural Field Assistant** (Agronomy), 4 years: Assisted with soil analysis and crop monitoring to improve overall yield quality for local farming operations.
- Entry 3, old: "A risk management consultant who is careful not to let their work-life overlap"
  - new: **Supply Chain Worker** (Logistics), 3 years: Coordinated inventory logistics and supply deliveries to ensure timely availability of fresh ingredients for restaurant operations.

### uid 4141: age 35, Shop Manager (limit 19 years)

- Education: Master in Architecture, 2014 -> 2015. Job level: Master -> Master.
- Entry 2, old: "A software engineer from a different programming language background curious to learn about Redis caching in PHP"
  - new: **Junior Architectural Associate** (Architecture), 3 years: Drafted technical blueprints and assisted senior architects with site inspections for various residential and commercial developments.
- Entry 3, old: "A passionate fan of rock and roll music and the Crickets in specific"
  - new: **Project Architect** (Architecture), 4 years: Led design teams in developing sustainable building solutions and managing project timelines from conception to final construction.
- Entry 4, old: "A retired businessman who was elected to the school board on a platform of fiscal responsibility and accountability"
  - new: **Shop Manager** (Business Admin), 2 years: Oversaw daily retail operations including staff scheduling inventory management and financial reporting for a local grocery store.

### uid 1637: age 39, IT Specialist (limit 23 years)

- Education: Bachelor in Construction, 2010 -> 2008. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a historian specialized in Sweden's military and defense history"
  - new: **Construction Site Supervisor** (Construction), 6 years: Directed onsite construction crews and ensured adherence to structural blueprints and safety regulations during building projects.
- Entry 3, old: "A best-selling author seeking to understand the meaning behind recurring dreams for inspiration in their next book"
  - new: **Systems Administrator** (IT), 5 years: Maintained network infrastructure and provided technical support for internal software systems within a growing corporate environment.
- Entry 4, old: "A game development studio owner looking for custom tools to streamline their workflow and enhance game creation process"
  - new: **IT Specialist** (IT), 4 years: Implemented security updates and optimized hardware performance to support critical business operations and data management tasks.

### uid 2910: age 68, unemployed (limit 52 years)

- Education: none. Job level: None -> None.
- Entry 1, old: "A lucid dreamer with the ability to control and manipulate their dreams"
  - new: **Warehouse Logistics Coordinator** (Logistics), 40 years: Managed inventory flow and shipping schedules for a large distribution center ensuring efficient delivery of goods.

### uid 260: age 40, Chemical Engineer, R&D (limit 24 years)

- Education: Master in Business Admin, 2009 -> 2009. Job level: Master -> Master.
- Entry 2, old: "A freshly-graduated physicist from Münster, Germany, currently looking for a PhD topic and a mentor."
  - new: **Junior Business Analyst** (Business Admin), 6 years: Analyzed market trends and operational data to support strategic decision making for a mid sized manufacturing firm.
- Entry 3, old: "A hardworking individual who helps the council member with research, scheduling, and administrative tasks"
  - new: **Chemical Engineer** (Chemical Engineering), 7 years: Developed and optimized chemical processes to improve production quality and safety standards within the industrial sector.

### uid 1298: age 29, Agricultural Worker (limit 13 years)

- Education: Vocational Training in Agronomy, 2020 -> 2017. Job level: None -> Vocational Training.
- Entry 2, old: "a nostalgic music lover who was in high school back in 2009"
  - new: **Farm Hand** (Agriculture), 3 years: Performed daily maintenance tasks and assisted with crop harvesting to support efficient farm operations and production.
- Entry 3, old: "A social worker who collaborates with Rhys and Rhea on community projects to help those in need"
  - new: **Equipment Operator** (Agriculture), 3 years: Operated heavy agricultural machinery for planting and soil preparation to maximize field productivity during the season.
- Entry 4, old: "An artist who reconnects with the golfer during a city art exhibition, reminiscing about their shared childhood adventures"
  - new: **Agricultural Worker** (Agriculture), 2 years: Maintained irrigation systems and monitored crop health to ensure high quality produce for local market distribution.

### uid 2765: age 55, Lab Technician, Quality Control (limit 39 years)

- Education: Bachelor in Business, 1994 -> 1993. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a tech-savvy Nigerian businesswoman who is not a fan of Samsung products."
  - new: **Administrative Assistant** (Business), 15 years: Provided comprehensive administrative support including document management and scheduling for a busy corporate office environment.
- Entry 3, old: "I am a proud resident of Harbin, sports enthusiast, and an advocate for the development of winter sports in China."
  - new: **Quality Assurance Coordinator** (Business), 10 years: Implemented quality control standards and conducted regular audits to ensure compliance with industry regulations and company policies.
- Entry 4, old: "A career counselor at a local community college looking for resources to help advise students on transfer options to the university"
  - new: **Lab Technician** (Engineering), 7 years: Conducted routine testing and analysis of materials to verify product quality and adherence to technical specifications.

### uid 456: age 57, College Lecturer (limit 41 years)

- Education: Bachelor in Computer Science, 1992 -> 1990. Job level: Bachelor -> Bachelor.
- Entry 3, old: "A celebrated visual artist who shares insights on aesthetics and creativity"
  - new: **Software Developer** (Computer Science), 15 years: Designed and maintained software applications while collaborating with cross functional teams to deliver robust technical solutions.
- Entry 4, old: "A popular YouTuber discussing the moral implications of social media"
  - new: **College Lecturer** (Education), 12 years: Instructed students in computer science fundamentals and mentored them on software development practices and industry standards.

### uid 1480: age 34, Lab Technician, Quality Control (limit 18 years)

- Education: Bachelor in Material Science, 2015 -> 2015. Job level: Bachelor -> Bachelor.
- Entry 2, old: "A travel writer seeking to incorporate human rights perspectives in their storytelling"
  - new: **Materials Research Assistant** (Material Science), 3 years: Assisted in laboratory experiments and data collection to evaluate the properties of new composite materials for industry.
- Entry 3, old: "A rock climbing coach who believes in the power of nature to strengthen the body and mind"
  - new: **Quality Control Analyst** (Material Science), 3 years: Performed rigorous testing on raw materials to ensure they met strict quality standards before entering the production line.
- Entry 4, old: "An enterprising young entrepreneur who has been running a thriving online store selling artisanal products from Nashik"
  - new: **Lab Technician** (Material Science), 2 years: Monitored production processes and conducted detailed material analysis to maintain high quality output for industrial manufacturing.
