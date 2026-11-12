# P1 migration report

Generated 2026-11-10T08:49:37 by `scripts/migrate_p1.py` (dry run, nothing written).
Source: Firestore emulator 127.0.0.1:8080 (project project-a3d59130-5adf-4677-9e2). Reference date 2026-11-10 (ages, in progress). Text model `gemini-3.1-flash-lite`, prompt `p1w1`.

## Plan

- Profiles: 9150; documents to update: 7848; to delete: 1 ('None'); other stubs left alone: 0.
- Education (3a): entries changed 4753; in progress 297; age at graduation by level: Vocational Training min 18, median 19, max 20; College min 19, median 20, max 21; Bachelor min 21, median 22, max 23; Master min 23, median 24, max 25; PhD min 27, median 28, max 29.
- Job education level (4a): changed 1878; None -> Bachelor (756), None -> Vocational Training (348), None -> College (332), None -> Master (305), None -> PhD (97), College -> None (34), PhD -> None (6).
- Work experience (1a, 2): people 5097; from generated texts 20; already repaired 0; not generated yet 5077; input changed since generation 0; years scaled down to the limit 0.
- Years of work experience against age - 16 (repaired people only): over the limit 0; total years min 7, median 17, max 40.
- user_packs (R3): none in this database: checkIssue reads users, nothing to rebuild.

## Generation

- Calls so far: 6 (failed 4); tokens: prompt 3397, output 3561, thinking 0, total 6958.
- Files: `scripts\p1_generated\work_experience.jsonl` (one line per person), `scripts\p1_generated\calls.jsonl` (every prompt and raw output).

## Examples (20 people, in generation order)

### uid 1001: age 52, General Practitioner (limit 36 years)

- Education: Bachelor in Chemistry, 1997 -> 1996. Job level: Bachelor -> Bachelor.
- Entry 3, old: "A stubborn older brother who's a strict police officer with a traditional viewpoint on law and order"
  - new: **Clinical Laboratory Technician** (Chemistry), 10 years: Performed complex chemical analyses on patient samples to assist in accurate medical diagnosis and treatment planning.
- Entry 4, old: "A young child who prefers playtime over watching TV or movies"
  - new: **General Practitioner** (Medicine), 16 years: Provided comprehensive primary healthcare services to patients while managing chronic conditions and coordinating specialized medical care.

### uid 2368: age 67, unemployed (limit 51 years)

- Education: Master in Material Science, 1982 -> 1982. Job level: None -> Master.
- Entry 2, old: "A comedy skit creator who seeks guidance from the digital marketing specialist to improve their video reach and audience engagement"
  - new: **Materials Research Scientist** (Material Science), 20 years: Conducted advanced research on new composite materials to improve structural integrity in various industrial manufacturing applications.
- Entry 4, old: "A tech-savvy marketing specialist tasked with promoting the open-access platform to academics worldwide"
  - new: **Senior Materials Consultant** (Material Science), 15 years: Advised engineering teams on material selection and testing protocols to ensure compliance with international safety standards.

### uid 549: age 51, Supply Chain Worker (limit 35 years)

- Education: College in Fine Arts, 1998 -> 1994. Job level: College -> College.
- Entry 2, old: "A passionate archaeologist who transitioned into managing a history museum"
  - new: **Museum Exhibit Designer** (Arts), 10 years: Created engaging visual displays and curated historical artifacts to enhance public understanding of local cultural heritage.
- Entry 3, old: "a social justice advocate who distrusts organizations with ties to hate groups"
  - new: **Logistics Coordinator** (Logistics), 8 years: Managed inventory flow and distribution schedules to ensure efficient operations within a large hospitality service environment.
- Entry 4, old: "a software developer familiar with Java and the PlantUML library"
  - new: **Supply Chain Worker** (Logistics), 9 years: Coordinated supply chain activities and monitored stock levels to maintain seamless service delivery for hotel operations.

### uid 2116: age 28, Electrician (limit 12 years)

- Education: College in Engineering, 2021 -> 2017. Job level: College -> College.
- Entry 3, old: "A novelist who seeks the software engineer's input on digital publishing platforms"
  - new: **Junior Electrical Technician** (Electronics), 4 years: Assisted in the installation and maintenance of electrical systems for residential and commercial building projects.
- Entry 4, old: "a senior fellow at the Human Factors and Ergonomics Society"
  - new: **Electrician** (Electronics), 7 years: Installed and repaired complex electrical wiring systems while ensuring adherence to all local safety codes and regulations.

### uid 3859: age 27, Bus Driver (limit 11 years)

- Education: College in Chemistry, 2022 -> 2019. Job level: College -> College.
- Entry 2, old: "A physics major who is fascinated by the application of Fortran in scientific simulations"
  - new: **Laboratory Assistant** (Chemistry), 3 years: Supported chemical research projects by preparing samples and maintaining laboratory equipment according to strict safety protocols.
- Entry 4, old: "An improv performer who hosts regular comedy shows in their backyard"
  - new: **Bus Driver** (Transport Systems), 5 years: Operated public transit vehicles safely while maintaining schedules and providing excellent customer service to all passengers.

### uid 4323: age 35, Shop Manager (limit 19 years)

- Education: Master in Education, 2014 -> 2016. Job level: Master -> Master.
- Entry 2, old: "A customer relations expert who specializes in improving client satisfaction for financial institutions"
  - new: **Customer Relations Specialist** (Business), 5 years: Resolved client inquiries and implemented strategies to improve overall satisfaction levels within a professional service environment.
- Entry 3, old: "A dog owner who eagerly awaits the postman's arrival because their dog loves getting treats from him"
  - new: **Shop Manager** (Business Admin), 3 years: Oversaw daily retail operations including staff management and inventory control to ensure high levels of customer service.

### uid 345: age 44, Chemical Engineer, R&D (limit 28 years)

- Education: Master in Political Science, 2005 -> 2007. Job level: Master -> Master.
- Entry 2, old: "An aspiring Indian rower and a fan of Satnam Singh"
  - new: **Policy Analyst** (Political Science), 5 years: Evaluated government policies and drafted reports to support decision making processes within public sector organizations.
- Entry 3, old: "An award-winning director who started their career during the 'New Hollywood' era"
  - new: **Process Engineer** (Chemical Engineering), 6 years: Optimized chemical production processes to increase efficiency and reduce waste in a large industrial manufacturing facility.
- Entry 4, old: "Another junior data scientist from a different university, constantly exchanging knowledge and sharing resources"
  - new: **Chemical Engineer** (Chemical Engineering), 6 years: Designed and implemented innovative chemical engineering solutions to improve product quality and operational safety standards.

### uid 62: age 66, Road Maintenance Worker (limit 50 years)

- Education: PhD in Engineering, 1983 -> 1987. Job level: None -> PhD.
- Entry 2, old: "a proud young Jewish student at a Canadian university"
  - new: **Road Maintenance Worker** (Civil Engineering), 35 years: Maintained public infrastructure by performing routine repairs and ensuring road safety for the local community.

### uid 1626: age 34, IT Specialist (limit 18 years)

- Education: Bachelor in Civil Engineering, 2014 -> 2014. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a former participant in beauty pageants who is always cheering for her home state contestants."
  - new: **Junior Civil Engineer** (Civil Engineering), 5 years: Assisted in the design and structural analysis of urban development projects to ensure compliance with engineering standards.
- Entry 4, old: "A culture writer who recognizes the importance of this leader's contribution and seeks to spread awareness through their articles"
  - new: **IT Specialist** (IT), 5 years: Managed office network infrastructure and provided technical support to ensure smooth daily operations for all staff members.

### uid 1114: age 54, Accountant, Finance (limit 38 years)

- Education: Bachelor in Business, 1995 -> 1994. Job level: Bachelor -> Bachelor.
- Entry 2, old: "A large e-commerce company seeking to enhance their website's functionality with Perl programming"
  - new: **Junior Accountant** (Business Admin), 10 years: Maintained financial records and prepared accurate reports to support the fiscal management of corporate business operations.
- Entry 4, old: "A powerful center with a strong work ethic and a quirky sense of humor"
  - new: **Accountant** (Business Admin), 20 years: Managed complex financial accounts and ensured regulatory compliance for large scale industrial business operations and reporting.

### uid 3435: age 39, Plant Operator, Production (limit 23 years)

- Education: College in Design, 2010 -> 2006. Job level: College -> College.
- Entry 2, old: "A former professional gymnast who understands the challenges of mental blocks and provides specialized techniques and support"
  - new: **Junior Designer** (Design), 5 years: Created visual concepts and layouts for various marketing campaigns while collaborating with the creative team.
- Entry 3, old: "A theoretical physicist who provides thought-provoking insights and challenges their opinions"
  - new: **Senior Designer** (Design), 8 years: Managed complex design projects and mentored junior staff to ensure high quality output for corporate clients.
- Entry 4, old: "An ambitious politician influenced by the professor's research on electoral systems"
  - new: **Plant Operator** (Engineering), 5 years: Monitored industrial machinery and maintained production standards to ensure efficient operations within the manufacturing facility.

### uid 355: age 30, Supply Chain Worker (limit 14 years)

- Education: College in Agronomy, 2019 -> 2017. Job level: College -> College.
- Entry 2, old: "A lawyer working at the European Court of Justice, assisting with research and case preparation"
  - new: **Agricultural Assistant** (Agronomy), 3 years: Assisted with crop monitoring and soil analysis to improve overall farm productivity and sustainable growth practices.
- Entry 3, old: "A risk management consultant who is careful not to let their work-life overlap"
  - new: **Supply Chain Worker** (Logistics), 4 years: Coordinated inventory logistics and supply deliveries to ensure timely availability of fresh ingredients for restaurant operations.

### uid 4141: age 35, Shop Manager (limit 19 years)

- Education: Master in Architecture, 2014 -> 2015. Job level: Master -> Master.
- Entry 2, old: "A software engineer from a different programming language background curious to learn about Redis caching in PHP"
  - new: **Junior Architect** (Architecture), 3 years: Drafted detailed building plans and assisted senior architects with site inspections for various residential construction projects.
- Entry 3, old: "A passionate fan of rock and roll music and the Crickets in specific"
  - new: **Project Architect** (Architecture), 4 years: Led design development phases and coordinated with contractors to ensure structural integrity and compliance with regulations.
- Entry 4, old: "A retired businessman who was elected to the school board on a platform of fiscal responsibility and accountability"
  - new: **Shop Manager** (Business Admin), 2 years: Oversaw daily retail operations and managed staff schedules to maintain high levels of customer service and efficiency.

### uid 1637: age 39, IT Specialist (limit 23 years)

- Education: Bachelor in Construction, 2010 -> 2008. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a historian specialized in Sweden's military and defense history"
  - new: **Construction Site Supervisor** (Construction), 6 years: Supervised onsite construction activities and ensured that all safety protocols were strictly followed by the crew.
- Entry 3, old: "A best-selling author seeking to understand the meaning behind recurring dreams for inspiration in their next book"
  - new: **IT Support Technician** (IT), 5 years: Provided technical support and maintained network infrastructure to ensure smooth operations for the entire office staff.
- Entry 4, old: "A game development studio owner looking for custom tools to streamline their workflow and enhance game creation process"
  - new: **IT Specialist** (IT), 4 years: Implemented advanced security measures and optimized system performance to support the growing needs of the organization.

### uid 2910: age 68, unemployed (limit 52 years)

- Education: none. Job level: None -> None.
- Entry 1, old: "A lucid dreamer with the ability to control and manipulate their dreams"
  - new: **Senior Consultant** (Business), 40 years: Provided strategic advice to corporate clients regarding organizational development and long term business growth initiatives.

### uid 260: age 40, Chemical Engineer, R&D (limit 24 years)

- Education: Master in Business Admin, 2009 -> 2009. Job level: Master -> Master.
- Entry 2, old: "A freshly-graduated physicist from Münster, Germany, currently looking for a PhD topic and a mentor."
  - new: **Junior Analyst** (Business Admin), 6 years: Conducted market research and prepared detailed reports to support strategic decision making processes for senior management.
- Entry 3, old: "A hardworking individual who helps the council member with research, scheduling, and administrative tasks"
  - new: **Chemical Engineer** (Chemical Engineering), 9 years: Developed innovative chemical processes and optimized production methods to enhance efficiency and safety in industrial manufacturing.

### uid 1298: age 29, Agricultural Worker (limit 13 years)

- Education: Vocational Training in Agronomy, 2020 -> 2017. Job level: None -> Vocational Training.
- Entry 2, old: "a nostalgic music lover who was in high school back in 2009"
  - new: **Farm Hand** (Agriculture), 2 years: Performed routine maintenance and assisted with harvesting crops to support daily operations on the local farm.
- Entry 3, old: "A social worker who collaborates with Rhys and Rhea on community projects to help those in need"
  - new: **Field Technician** (Agriculture), 3 years: Monitored irrigation systems and applied fertilizers to ensure optimal crop health and yield throughout the season.
- Entry 4, old: "An artist who reconnects with the golfer during a city art exhibition, reminiscing about their shared childhood adventures"
  - new: **Agricultural Worker** (Agriculture), 2 years: Operated heavy machinery and managed field logistics to streamline the planting and harvesting processes for the farm.

### uid 2765: age 55, Lab Technician, Quality Control (limit 39 years)

- Education: Bachelor in Business, 1994 -> 1993. Job level: Bachelor -> Bachelor.
- Entry 2, old: "a tech-savvy Nigerian businesswoman who is not a fan of Samsung products."
  - new: **Business Analyst** (Business), 10 years: Analyzed operational data and identified opportunities for process improvements to increase overall company profitability and efficiency.
- Entry 3, old: "I am a proud resident of Harbin, sports enthusiast, and an advocate for the development of winter sports in China."
  - new: **Quality Assurance Specialist** (Business), 15 years: Implemented rigorous quality control standards and conducted regular audits to ensure compliance with industry regulations and policies.
- Entry 4, old: "A career counselor at a local community college looking for resources to help advise students on transfer options to the university"
  - new: **Lab Technician** (Engineering), 6 years: Performed precise laboratory testing and maintained equipment to support research and development initiatives within the production department.

### uid 456: age 57, College Lecturer (limit 41 years)

- Education: Bachelor in Computer Science, 1992 -> 1990. Job level: Bachelor -> Bachelor.
- Entry 3, old: "A celebrated visual artist who shares insights on aesthetics and creativity"
  - new: **Software Developer** (Computer Science), 15 years: Designed and maintained complex software applications to solve technical challenges for various enterprise level client projects.
- Entry 4, old: "A popular YouTuber discussing the moral implications of social media"
  - new: **College Lecturer** (Education), 12 years: Taught undergraduate courses in computer science and mentored students on software development best practices and methodologies.

### uid 1480: age 34, Lab Technician, Quality Control (limit 18 years)

- Education: Bachelor in Material Science, 2015 -> 2015. Job level: Bachelor -> Bachelor.
- Entry 2, old: "A travel writer seeking to incorporate human rights perspectives in their storytelling"
  - new: **Materials Researcher** (Material Science), 3 years: Conducted experiments on new materials to evaluate their properties and potential applications in industrial manufacturing processes.
- Entry 3, old: "A rock climbing coach who believes in the power of nature to strengthen the body and mind"
  - new: **Quality Control Analyst** (Material Science), 4 years: Tested raw materials and finished products to ensure they met strict quality standards before distribution to customers.
- Entry 4, old: "An enterprising young entrepreneur who has been running a thriving online store selling artisanal products from Nashik"
  - new: **Lab Technician** (Material Science), 2 years: Managed laboratory equipment and performed routine testing to support the quality control department in maintaining production standards.
