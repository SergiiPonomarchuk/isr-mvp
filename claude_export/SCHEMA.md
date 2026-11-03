# Firestore Schema Inventory (SCHEMA.md)

**Timestamp:** 2026-10-12
**Database:** Google Cloud Firestore (`project-a3d59130-5adf-4677-9e2`)

---

## 1. Executive Summary: Semantic Data Location Matrix

| Data Category | Firestore Location | Status / Notes |
|---|---|---|
| **Profiles** | `users` | Present (9,151 docs) |
| **Values Narratives** | `users.values_description` | Present (embedded in `users` and `db/values1-1025text.json`) |
| **Values Vectors** | `users.values_taxonomy`, `microcommunities.values_taxonomy` | Present (145-dimensional vectors) |
| **Discussions / Messages / Marks** | `discussions`, `discussions/{id}/messages` | Present (192 threads, 1,694 messages with marks) |
| **Ad-Hoc Publics (Microcommunities)** | `microcommunities`, `microcommunity_members` | Present (192 publics, 3,099 member records) |
| **Issues / Votings / Options / Votes** | `issues` | Present (80 issues with voting options & votes) |
| **Tasks / Actions / Contribution Logs** | `actions`, `issues` | Present (1,188 action records) |
| **Cached ISR Values** | `microcommunity_members.isr_score`, `issues.isr_scores`, `discussions.isr_scores` | Present |
| **Geography / Housing** | `users.geography`, `issues.location` | Present (GeoPoint and address anchors) |
| **Social Relations** | `users.socialRelations` | Present (kinship, close friends, ties) |
| **Embeddings** | `user_vectors` | Present (768-dim dense vectors) |
| **`voting` (root collection)** | `voting` | **NOT PRESENT** (0 documents) |
| **`tasks` (root collection)** | `tasks` | **NOT PRESENT** (0 documents) |
| **`values` (root collection)** | `values` | **NOT PRESENT** (0 documents) |
| **`contributions` (root collection)** | `contributions` | **NOT PRESENT** (0 documents) |
| **`logs` (root collection)** | `logs` | **NOT PRESENT** (0 documents) |
| **`embeddings` (root collection)** | `embeddings` | **NOT PRESENT** (stored in `user_vectors`) |

---

## 2. Collection & Subcollection Detailed Schemas

### Collection: `users`
- **Document Count:** 9,151
- **Semantic Concept:** Profiles, values narratives (`values_description`), values vectors (`values_taxonomy`), geography/housing (`geography`), social relations (`socialRelations`).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `birthDate` | `string` | No |
| `displayName` | `string` | No |
| `email` | `string` | No |
| `features` | `array<empty>` | No |
| `firstName` | `string` | No |
| `gender` | `string` | No |
| `geography` | `array<map>` | No |
| `lastName` | `string` | No |
| `nationality` | `string` | No |
| `post` | `array<map>` | No |
| `skills` | `array<map>` | No |
| `socialRelations` | `array<empty>, array<map>` | No |
| `uid` | `integer` | No |
| `values_description` | `string` | Yes |
| `values_taxonomy` | `map` | Yes |

#### Redacted Example Document
```json
{
  "gender": "Female",
  "displayName": "[REDACTED]",
  "post": [
    {
      "department": "Quality Control",
      "place": "Argo Industry",
      "educationLevel": "Master",
      "salary": 50000,
      "job": "Chemist"
    }
  ],
  "geography": [
    {
      "type": "work",
      "place": "Argo Industry",
      "geo": [
        47.601,
        7.618
      ],
      "id": 1,
      "address": "Railway street, 1"
    },
    {
      "type": "home",
      "unit": 1,
      "geo": [
        47.553832,
        7.606599
      ],
      "id": 2,
      "unit_type": "Andim",
      "address": "Andim"
    }
  ],
  "birthDate": "1971-01-05",
  "nationality": "Swiss",
  "features": [],
  "firstName": "[REDACTED]",
  "values_taxonomy": {
    "conflict_resolution": "<list len=36>",
    "contextual_shifts": {
      "crisis": [
        -30,
        15,
        30,
        -10,
        5,
        -20,
        20,
        25,
        10,
        0
      ],
      "private": [
        25,
        10,
        -5,
        5,
        10,
        30,
        15,
        -15,
        25,
        0
      ],
      "family": [
        15,
        20,
        10,
        10,
        15,
        5,
        25,
        15,
        15,
        0
      ],
      "work": [
        -5,
        -10,
        5,
        0,
        0,
        -15,
        -5,
        -10,
        5,
        0
      ]
    },
    "domains": [
      92,
      68,
      78,
      35,
      88,
      95,
      82,
      62,
      95,
      null
    ],
    "items": "<dict domains=['d10', 'd8', 'd9', 'd1', 'd3', 'd7', 'd4', 'd5', 'd6', 'd2']>"
  },
  "uid": 1,
  "skills": [
    {
      "specialization": "Business",
      "educationLevel": "Master",
      "id": 1,
      "type": "education",
      "name": "University of Andim",
      "graduationYear": 1994
    },
    {
      "type": "work experience",
      "time": 1,
      "id": 4,
      "specialization": null,
      "comment": "An older sibling who works as a graphic designer and offers helpful advice on pairing art and technology",
      "name": null
    }
  ],
  "values_description": "### Section 1: A Vision of the Noble Community\n\nI believe the ideal community must be built not merely on the mechanical laws of commerce or the dry statistics of the state, but on the deeper, ancient rituals that bind a people to their place and to one another. In my work as a chemist at Argo, I see how elements combine to create new substances, but in society, it is the spiritual alchemy that matters most. We must return to a life where the aristocrat of the soul and the peasant of the soil understand one another—a community of \"imaginative possessions,\" where our shared stories and myths are more binding than our contracts. The modern world is too full of the \"red clamor\" of the marketplace; I want a community that values the \"blue silence\" of the spirit, a place of ceremony, beauty, and tragic joy. We must not be afraid of hierarchy if it is a hierarchy of wisdom and nobility, not merely of wealth. True order is not the suppression of the wild, but the dancing of the wild within a perfect form, like a falcon obeying the falconer, not out of fear, but out of a shared, high purpose.\n\n### Section 2: Core Beliefs\n\n**1. Authentic Expression and Living by Values**\nIn the future community, a person must be free to wear their true face, not the mask required by polite, timid society. I believe that \"man is least himself when he talks in his own person. Give him a mask, and he will tell you the truth.\" We should value the dramatic expression of the self. If a man believes in the old gods or the new sciences, he should express it with the passion of a poet. Conformity to a \"grey truth\" is the death of the soul. For example, if someone wishes to live by a code of honor that seems archaic to others—perhaps settling disputes through ritual rather than litigation—the community should make space for that nobility. We must allow for the eccentric, the mystic, and the visionary, for they are the ones who touch the Great Memory.\n\n**2. Protecting the Vulnerable and Stewardship**\nWe owe a deep debt to the past and the future—to the ancestors who sleep in the earth and the children who wait in the gyre of time. Stewardship is not just about \"resources\"; it is about maintaining the sanctity of the land itself. The Seven Woods of Coole are not just timber; they are a presence. In our community, if we must build, we should build things that will age well, that will look beautiful in three hundred years, not cheap plastic boxes that rot in a decade. We must protect the vulnerable not by wrapping them in cotton wool, but by giving them a place of dignity. The old, who have seen the cycles turn, should be revered as oracles, not warehoused in clinics.\n\n**3. Safety, Stability, and Basic Order**\nSafety does not come from a policeman on every corner, but from a shared \"custom and ceremony.\" It is custom that spreads the rich horn of plenty. I believe that a community is safe when its people share a common dream. Disorder comes when the center cannot hold, when the best lack all conviction and the worst are full of passionate intensity. Therefore, our order should be based on tradition and ritual. We should have festivals that mark the turning of the year, binding us to the rhythm of the earth. Stability is found in the deep roots of culture, not the shallow roots of the police state.\n\n**4. Redemption, Restoration, and Second Chances**\nI know something of the shadow; I have taken what was not mine in moments of need or confusion. But I believe that \"a terrible beauty\" can be born from our mistakes. Redemption is not a legal process; it is a transformation. When a person errs, they should not be cast into the outer darkness of a prison cell, which is a tomb for the living. Instead, they should be asked to create something beautiful for the community—a labor of atonement. If a man steals, let him work the fields until he understands the value of the harvest. We must believe that the soul can be purified, like gold in the crucible. A static judgment ignores the fluid nature of the human spirit.\n\n**5. Spiritual and Religious Practice**\nThis is the heart of it all. \"The only two powers that trouble the deeps are religion and love.\" A community without a connection to the invisible world is a corpse. We need not all worship the same god, but we must all acknowledge the sacred. I envision a community where the materialist's argument is silenced by the poet's vision. There should be spaces—groves, temples, quiet rooms—where the rational mind is laid aside. We must honor the folk traditions, the fairy paths, the ghost stories; for in them lies the wisdom of the race. To strip a community of its magic is to starve it.\n\n**6. Freedom and Autonomous Choice**\nFreedom is not the license to do whatever one wants; it is the freedom to find one's true Law. \"All things fall and are built again, and those that build them again are gay.\" We must be free to build our lives according to an inner vision. If the state says \"you must educate your children this way,\" but my spirit says \"teach them the old songs and the stars,\" I must be free to choose the stars. The state is a cold monster; the individual soul is a fire. I believe the community should interfere as little as possible with the private dreams of its people, provided they do not break the high custom of the tribe.\n\n### Section 3: Where Values Conflict\n\n**Conflict 1: Tradition vs. Modern Efficiency**\nWe live in an age of science, and I am a chemist, yet I see a conflict between the efficiency of the machine and the sanctity of tradition. When these clash, I side with **Tradition**. If building a new, efficient road means cutting down a hawthorn tree sacred to the lore of the place, we must keep the tree. The road can go around. Efficiency is the god of the merchant; beauty and memory are the gods of the people.\n\n**Conflict 2: Individual Genius vs. Democratic Equality**\nThere is a tension between the need for equality and the reality of individual genius. I believe that **Genius** must take precedence. We are not all the same. Some are born to lead, to create, to see further. To force the eagle to swim with the fish in the name of \"fairness\" is a crime against nature. The community should honor its exceptional souls, even if it creates inequality of status, for the exceptional soul raises the whole community.\n\n**Conflict 3: Passion vs. Order**\n\"The ceremony of innocence is drowned\" when passion runs unchecked, yet without passion, there is no life. When the wild passion of the individual threatens the **Ceremony of the Community**, I believe the Ceremony must win. We need the container to hold the wine. Unbridled emotion is chaos; emotion channeled through custom is art. We must choose the order that preserves beauty over the chaotic freedom that destroys it.",
  "socialRelations": [
    {
      "type": "father",
      "id": 1,
      "relative": 2785
    },
    {
      "type": "husband",
      "id": 2,
      "relative": 3685
    },
    {
      "type": "daughter",
      "id": 3,
      "relative": 7761
    }
  ],
  "email": "[REDACTED]",
  "lastName": "[REDACTED]"
}
```

---

### Collection: `user_vectors`
- **Document Count:** 9,150
- **Semantic Concept:** Embeddings (`profile_vector` 768-dim, `experience_vectors` 768-dim).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `experience_vectors` | `map` | No |
| `profile_vector` | `Vector()` | No |
| `uid` | `integer` | No |

#### Redacted Example Document
```json
{
  "uid": 1,
  "profile_vector": "Vector<-0.01023784838616848, 0.013858168385922909, -0.05159633979201317, -0.002109335735440254, 0.022031117230653763, 0.007036413066089153, 0.0011441492242738605, 0.04045357555150986, -0.006541060749441385, 0.04862435162067413, 0.005217373371124268, 0.029202913865447044, 0.015599464997649193, -0.006503881886601448, 0.01812872290611267, -0.056539520621299744, 0.006473606452345848, 0.04778122901916504, -0.11026060581207275, 0.009287319146096706, 0.059793662279844284, -0.07603085786104202, 0.053706564009189606, -0.007824658416211605, -0.0077153355814516544, 0.002929010894149542, 0.01929413713514805, -0.014329013414680958, -0.013004865497350693, -0.0387345552444458, 0.07230734825134277, 0.07619267702102661, 0.019723739475011826, -0.048322293907403946, 0.022480130195617676, 0.03289007768034935, 0.05286518856883049, 0.000588310300372541, 0.04040573537349701, -0.08883477747440338, -0.03765280917286873, 0.07146432995796204, 0.030966266989707947, 0.04849811643362045, -0.03334448114037514, -0.025682633742690086, -0.021352363750338554, 0.017500922083854675, -0.01633319817483425, 0.06276439875364304, 0.009431794285774231, 0.01598511077463627, -0.06043540686368942, -0.0190100260078907, -0.024652138352394104, -0.03255068510770798, -0.019508326426148415, -0.013536722399294376, 0.01786618120968342, -0.024265266954898834, 0.034829407930374146, 0.014336208812892437, -0.053261648863554, -0.01705734245479107, 0.015849798917770386, -0.07085423916578293, 0.0024651368148624897, 0.02151051163673401, -0.08099495619535446, 0.09271787852048874, -0.00016230436449404806, 0.0034411619417369366, -0.015373759903013706, 0.05364739149808884, -0.049968183040618896, -0.004248837474733591, -0.02285938709974289, 0.01051980722695589, -0.021448923274874687, 0.03479719161987305, -0.015110909007489681, -0.05198008194565773, 0.07507862895727158, 0.04013944789767265, -0.0008985145832411945, 0.05493064597249031, 0.004831623751670122, -0.050382841378450394, -0.01755472645163536, -0.07196257263422012, 0.10281924158334732, 0.028514647856354713, 0.005278711672872305, -0.023974284529685974, 0.03247779235243797, -0.05294711887836456, -0.0927666649222374, -0.08614113181829453, 0.09298205375671387, 0.0068536559119820595, 0.007256888318806887, 0.04200562834739685, -0.008899793028831482, -0.04027670994400978, 0.003938619047403336, 0.05039258301258087, -0.03413446247577667, -0.04677308723330498, -0.007482261396944523, 0.005579875782132149, -0.04748154804110527, -0.019820531830191612, 0.042111560702323914, -0.06929924339056015, -0.0022064067889004946, 0.007166561670601368, -0.06158389151096344, 0.015408273786306381, -0.017473675310611725, 0.07429628819227219, -0.041619863361120224, -0.021312158554792404, -0.05173790827393532, 0.053635645657777786, 0.011883456259965897, -0.010861854068934917, -0.00297224591486156, 0.005700042005628347, -0.023135287687182426, -0.05903181806206703, 0.09126074612140656, -0.030834544450044632, 0.06256817281246185, 0.02512427233159542, -0.01973949931561947, -0.007037723902612925, 0.06993629783391953, -0.0130124781280756, 0.06055990606546402, -0.016254110261797905, -0.01513933390378952, -0.07015945017337799, -0.05476008728146553, 0.022989077493548393, 0.004842114634811878, 0.01873794011771679, -0.037670742720365524, 0.04888938367366791, -0.057248521596193314, -0.007357474882155657, -0.06367538869380951, -0.0035655484534800053, 0.03887784108519554, 0.009190288372337818, -0.0067371828481554985, 0.01412202324718237, 0.0580056756734848, -0.0263744555413723, 0.033080533146858215, -0.033920757472515106, 0.02953435853123665, -0.06037690117955208, -0.046747468411922455, 0.012368989177048206, -0.05053034797310829, 0.0016322217416018248, 0.020191963762044907, -0.03208787739276886, 0.01791282370686531, 0.013459462672472, -0.043271735310554504, -0.04354958236217499, 0.012704906053841114, -0.0771699994802475, -0.0016917816828936338, 0.01090180967003107, -0.017028259113430977, 0.01823030225932598, -0.006334456615149975, -0.018686465919017792, 0.08455408364534378, 0.012851239182054996, -0.03404947370290756, -0.05950595811009407, -0.0006578667089343071, -0.042994946241378784, -0.010621444322168827, 0.049229659140110016, 0.034498430788517, -0.0034110054839402437, -0.06633882224559784, 0.0029365080408751965, -0.007155786734074354, 0.03325027972459793, -0.04530419409275055, -0.03592023625969887, -0.0124500822275877, -0.057438455522060394, 0.02669607102870941, -0.06180432811379433, 0.03465762734413147, -0.011088874191045761, 0.011318228207528591, 0.015962285920977592, -0.027305621653795242, 0.048843253403902054, -0.021049370989203453, -0.026424875482916832, 0.035586100071668625, 0.022932494059205055, -0.055231738835573196, -0.016574259847402573, -0.06139888986945152, -0.040346261113882065, 0.008288688957691193, -0.010918132029473782, 0.03984615206718445, 0.0010205928701907396, 0.04985714331269264, -0.03340766578912735, 0.03746302053332329, 0.034203216433525085, 0.04898819699883461, 0.02912980131804943, 0.0019531147554516792, 0.04109841585159302, -0.06087222695350647, -0.004030187148600817, 0.00900004431605339, -0.06907918304204941, 0.004800169263035059, -0.0006936414865776896, 0.07112635672092438, 0.023515397682785988, -0.023657329380512238, -0.02323000878095627, 0.02966391295194626, -0.0021154095884412527, -0.033294521272182465, 0.013187416829168797, 0.017420131713151932, -0.038399942219257355, 0.05045205354690552, 0.03459657356142998, 0.047173500061035156, 0.0071970256976783276, 0.11657256633043289, 0.03646383807063103, 0.01479580532759428, -0.015957748517394066, -0.03826824203133583, -0.03950609266757965, 0.0066712950356304646, -0.010526047088205814, -0.06304556876420975, -0.03809010609984398, 0.032553207129240036, -0.005748233292251825, 0.0022445691283792257, -0.003962669521570206, 0.05231230705976486, 0.019086869433522224, -0.04416603595018387, -0.09640936553478241, -0.018643202260136604, -0.027074022218585014, 0.033565398305654526, -0.013092564418911934, -0.0007189910393208265, -0.012164386920630932, 0.040731802582740784, -0.009105022996664047, -0.049697812646627426, -0.010767301544547081, -0.002723328536376357, 0.018979962915182114, 0.007497092708945274, 0.0468936413526535, -0.00399252213537693, -0.04110236093401909, 0.03481857478618622, 0.02780861034989357, -0.02981402538716793, 0.00732585322111845, -0.04277106747031212, -0.0602806992828846, 0.027852024883031845, -0.00551946135237813, -0.04570067301392555, -0.005874098278582096, 0.04507766291499138, 0.0218169204890728, 0.0021614939905703068, 0.020093537867069244, 0.060638315975666046, -0.00046996065066196024, -0.008373022079467773, 0.026969486847519875, -0.02324533276259899, 0.01948387362062931, 0.039487164467573166, 0.05488632246851921, -0.07696671783924103, 0.017742862924933434, 0.005944839213043451, -0.06300963461399078, 0.001511652721092105, 0.03151169791817665, -0.038998570293188095, 0.006727800238877535, 0.0008075270452536643, 0.021654481068253517, -0.03936295211315155, -0.05253027379512787, -0.023795364424586296, -0.05819212272763252, -0.14775468409061432, 0.010350741446018219, 0.004647806752473116, 0.014465643092989922, 0.04000207409262657, -0.025175338611006737, 0.0020158467814326286, 0.027113230898976326, 0.021902091801166534, -0.011616836301982403, 0.02824082411825657, -0.017788846045732498, 0.049983229488134384, 0.04013999551534653, 0.02305198647081852, -0.015050865709781647, -0.05571283772587776, -0.060908250510692596, -0.004759164527058601, 0.021842485293745995, -0.06688915193080902, 0.0400918610394001, 0.08118579536676407, 0.035165466368198395, 0.049297258257865906, 0.05578961223363876, 0.05586615577340126, -0.018663713708519936, 0.017737766727805138, -0.08967684954404831, -0.016496840864419937, -0.0021232604049146175, 0.013042076490819454, 0.01452659722417593, 0.02452675811946392, 0.034578822553157806, -0.011717661283910275, -0.04134535789489746, 0.00455494737252593, -0.024202460423111916, 0.03917074576020241, -0.021020153537392616, 0.007374920416623354, 0.02564193122088909, 0.015733925625681877, 0.008765345439314842, -0.02355642057955265, 0.005839928053319454, 0.009432398714125156, 0.00842678640037775, -0.0037000791635364294, 0.03476829081773758, -0.006128203589469194, -0.0319654643535614, -0.013312299735844135, 0.05769260972738266, 0.006314992904663086, 0.02177559956908226, 0.051674723625183105, -0.014006763696670532, -0.03295063227415085, 0.013157589361071587, -0.01684681326150894, 0.010389428585767746, 0.00617034500464797, -0.024224646389484406, -0.003624130040407181, -0.006685363594442606, -0.029846778139472008, 0.07129044085741043, -0.05564139783382416, 0.003810839494690299, -0.010013666935265064, -0.011920643970370293, -0.014407435432076454, 0.108879953622818, 0.01804337278008461, 0.04933035001158714, -0.04149593412876129, 0.07255733758211136, 0.004193427506834269, 0.01845531165599823, -0.022026019170880318, -0.0021560415625572205, -0.011459662578999996, -0.04512985795736313, 0.08221280574798584, -0.050898533314466476, -0.03699316829442978, -0.000748392369132489, 0.04905906692147255, -0.023651449009776115, 0.015669934451580048, -0.013030300848186016, 0.0221279114484787, -0.0363907553255558, -0.05783716216683388, -0.016870727762579918, -0.06299816071987152, 0.012625149451196194, 0.013953943736851215, -0.015492063947021961, 0.014074650593101978, 0.0062409997917711735, -0.0022919587790966034, 0.01785290800035, 0.010377795435488224, -0.036459438502788544, -0.019300108775496483, -0.08228553086519241, -0.012577313929796219, 0.01912838965654373, -0.0047574108466506, 0.0400005541741848, 0.00471447454765439, 0.019421616569161415, -0.041941408067941666, 0.005282296799123287, 0.008821406401693821, 0.0329388789832592, 0.0138886459171772, -0.001740570762194693, 0.004904132802039385, -0.006797719746828079, -0.015291556715965271, 0.022317441180348396, 0.0339982844889164, 0.005237968638539314, 0.012385474517941475, 0.005380094982683659, 0.05984286963939667, 0.023153305053710938, -0.03688366338610649, 0.013150292448699474, 0.018320441246032715, -0.007704157382249832, -0.021273095160722733, 0.01715928129851818, -0.09628274291753769, 0.011299725621938705, 0.024872522801160812, 0.027146873995661736, -0.01917205937206745, 0.010424196720123291, -0.03353746980428696, -0.023304753005504608, 0.06726238876581192, 0.058346863836050034, 0.0031849804800003767, 0.02028634585440159, -0.0066297948360443115, 0.01198279857635498, -0.04417327418923378, 0.04206743463873863, 0.01338260993361473, -0.0056661637499928474, -0.0032742065377533436, -0.0020165452733635902, -0.06251250952482224, 0.0003576727176550776, 0.013294953852891922, 0.016314325854182243, -0.007950646802783012, -0.013905586674809456, -0.0031354851089417934, 0.011012042872607708, -0.06751945614814758, -0.013937370851635933, 0.06399394571781158, -0.04707325994968414, -0.02794974483549595, 0.03617371618747711, 0.0005098297842778265, 0.005826590582728386, 0.025716867297887802, 0.032996054738759995, 0.014570411294698715, -0.035706039518117905, -0.013806203380227089, -0.009634481742978096, 0.024575214833021164, -0.026680095121264458, -0.0027333106845617294, 0.024976342916488647, 0.062264516949653625, -0.013194969855248928, 0.009486607275903225, -0.038581088185310364, -0.09633010625839233, 0.015299048274755478, -0.061370790004730225, 0.00681123323738575, 0.025140155106782913, -0.003296440467238426, -0.005637044087052345, 0.007143285125494003, 0.05158504098653793, -0.0031193685717880726, 0.025302860885858536, 0.008737675845623016, -0.024528948590159416, 0.02675878070294857, -0.010205035097897053, -0.016726398840546608, -0.0365484394133091, -0.0018954927800223231, 0.011426315642893314, 0.006141179706901312, 0.02308034524321556, -0.04371846094727516, -0.013643840327858925, 0.04049726575613022, 0.029991809278726578, -0.03664914518594742, -0.028034811839461327, 0.04356923699378967, 0.03513959050178528, 0.06769520789384842, 0.0398150198161602, 0.03891660273075104, 0.03068780153989792, 0.044266898185014725, -0.052930377423763275, 0.020478127524256706, -0.023378459736704826, 0.00952585507184267, 0.0024340616073459387, 0.033273421227931976, 0.06408283114433289, -0.01590668223798275, 0.003498269245028496, 0.046679891645908356, -0.04400857537984848, 0.04466363787651062, -0.021839985623955727, -0.04686133936047554, -0.011064330115914345, -0.022771023213863373, -0.021912481635808945, -0.006551539991050959, 0.021259110420942307, -0.0353843979537487, -0.030797801911830902, 0.008592160418629646, 0.009701915085315704, 0.005431640427559614, 0.022664731368422508, 0.024231422692537308, -0.010017774999141693, -0.018032290041446686, -0.005181789398193359, 0.046115413308143616, -0.008219067007303238, 0.04374788701534271, 0.0036803188268095255, 0.003730875439941883, 0.04459374397993088, -0.016740133985877037, -0.013842985965311527, 0.026650190353393555, -0.018527936190366745, 0.005860825069248676, 0.03731142729520798, -0.039945803582668304, -0.010156291536986828, -0.010144270025193691, -0.029522962868213654, -0.026687216013669968, -0.0063205379992723465, 0.0032307994551956654, 0.022905228659510612, -0.005384954623878002, 0.011297897435724735, -0.01154047716408968, -0.030232302844524384, 0.021240288391709328, 0.03117457777261734, -0.026293659582734108, -0.0004736031114589423, -0.059937939047813416, -0.04521295055747032, 0.06889533251523972, -0.018984349444508553, 0.035096991807222366, -0.007822688668966293, 0.0066253324039280415, 0.05119093507528305, 0.04278281703591347, 0.026140203699469566, -0.011633043177425861, -0.04562578350305557, -0.04634421691298485, 0.018897829577326775, -0.0054065994918346405, 0.03927047550678253, 0.036696020513772964, -0.0417451336979866, 0.0010773791000247002, -0.0661253109574318, -0.04286665469408035, -0.05494271218776703, 0.01484765112400055, -0.02084670029580593, -0.017566073685884476, -0.006650273222476244, 0.047203514724969864, 0.01504698395729065, 0.00725172646343708, -0.052927415817976, -0.0011063487036153674, -0.047502629458904266, 0.015997759997844696, 0.001983233029022813, -0.01504196785390377, -0.0467987023293972, -0.0027114858385175467, 0.06423861533403397, -0.004547882359474897, 0.012168636545538902, 0.008921879343688488, -0.019488384947180748, -0.02448413148522377, -0.0014028731966391206, -0.049197159707546234, 0.02989228256046772, 0.022165272384881973, 0.031115073710680008, 0.02899882383644581, -0.06539095193147659, 0.023735718801617622, 0.013105884194374084, 0.0411754809319973, 0.058645330369472504, 0.06065120920538902, 0.0055982740595936775, 0.002321631880477071, -0.0019138433272019029, 0.034935951232910156, -0.0009991942206397653, 0.04288344830274582, -0.030516522005200386, 0.013560179620981216, -0.016897011548280716, 0.03422181308269501, 0.03237771615386009, -0.007738382089883089, 0.0004768528160639107, 0.02932746149599552, 0.024364765733480453, 0.008815200068056583, -0.027969252318143845, 0.016386616975069046, 0.012896773405373096, -0.023408234119415283, 0.052278175950050354, -0.01813352108001709, -0.011755859479308128, -0.0019468889804556966, -0.0036117283161729574, 0.02869880199432373, 0.05662168189883232, 0.0170139167457819, -0.015556920319795609, -0.034798942506313324, -0.028781026601791382, -0.011929984204471111, 0.005525955464690924, -0.03924492001533508, 0.013912876136600971, 0.002654043724760413, 0.08688554167747498, -0.028760969638824463, 0.0033443679567426443, 0.018974551931023598, 0.01496801432222128, -0.04548099637031555, -0.02305583283305168, 0.024653038010001183, 0.0006373642827384174, 0.0674889087677002, -0.011714615859091282, 0.0466456338763237, -0.028280921280384064, 0.007959827780723572, -0.05470995604991913, 0.007196716498583555, -0.07166942209005356, -0.03784820809960365, 0.018758822232484818, -0.05326302349567413, 0.0187361016869545, 0.016433510929346085, 0.005729136988520622, -0.000227770593483001, 0.008304319344460964, 0.032343171536922455, 0.027928903698921204, 0.021967193111777306, 0.012467950582504272, 0.013088327832520008, 0.04652108997106552, -0.000652889022603631, 0.05957544967532158, 0.02778606303036213, -0.0005593348178081214, 0.02350546419620514, 0.05134201422333717, 0.04891963675618172, 0.02475428581237793, -0.00800086185336113, -0.05263654142618179, -0.02569042146205902, -0.0766122117638588, 0.059375956654548645, 0.1030225157737732, 0.042192503809928894, -0.05471146106719971, 0.024288281798362732, -0.010192206129431725, -0.04081805422902107, -0.0039368318393826485, -0.017553675919771194, -0.01068220566958189, -0.04595532268285751, 0.023844344541430473, -0.049418650567531586, -0.07188719511032104, -0.044307559728622437, 0.023237232118844986, -0.0033722894731909037, 0.014995834790170193, -0.011573726311326027, -0.023467885330319405, -0.03234662115573883, -0.04847060516476631, 0.02007301338016987, 0.027292046695947647, 0.0165312048047781, 0.04133975878357887, -0.0436217337846756, -0.019323037937283516, -0.019625963643193245, 0.01653800718486309, 0.024467263370752335, -0.04170624539256096, 0.020055167376995087, -0.027862178161740303, -0.03970824554562569, -0.019073981791734695, -0.009042413905262947, 0.017329653725028038, -0.012539373710751534>",
  "experience_vectors": {
    "4": "<Vector dimension=768>",
    "1": "<Vector dimension=768>"
  }
}
```

---

### Collection: `user_packs`
- **Document Count:** 37
- **Semantic Concept:** Cached user profile search packs (client-side adoption and discovery).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `pack_id` | `integer` | No |
| `users` | `array<map>` | No |

#### Redacted Example Document
```json
{
  "pack_id": 1,
  "users": [
    {
      "uid": 1,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1994,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An older sibling who works as a graphic designer and offers helpful advice on pairing art and technology",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Liliana Geiger",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Quality Control",
          "salary": 50000,
          "job": "Chemist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.553832,
            7.606599
          ],
          "id": 2,
          "unit_type": "Andim",
          "address": "Andim"
        }
      ],
      "birthDate": "1971-01-05",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2785
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3685
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 7761
        }
      ],
      "features": []
    },
    {
      "uid": 2,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2014,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a Computer Science teach stress on basics and good programming practices",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An experienced tracker who knows the best spots to find elusive nocturnal creatures",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A school administrator who recognizes the potential of digital measurement tools and encourages their implementation across the district",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Christine Bowman",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 100000,
          "job": "Production Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 28,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h12"
        }
      ],
      "birthDate": "1991-08-19",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2262
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 5023
        },
        {
          "type": "sister",
          "id": 3,
          "relative": 5821
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6517
        }
      ],
      "features": []
    },
    {
      "uid": 3,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1984,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a disgruntled LendUp customer who borrowed money from them and has been paying high interest rates.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A sports psychologist who provides mental support to the catcher, helping them maintain focus and handle pressure",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A fellow veteran from the Vietnam War who understands the challenges of readjusting to civilian life",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Sarah Watson",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 1",
          "department": "",
          "salary": 24000,
          "job": "Cook / Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5919,
            7.5962
          ],
          "place": "Restaurant 1",
          "id": 1,
          "address": "Central Allee, 3"
        },
        {
          "type": "home",
          "unit": 31,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h2"
        }
      ],
      "birthDate": "1961-05-02",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1876
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4683
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 5451
        }
      ],
      "features": []
    },
    {
      "uid": 4,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1999,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A project manager at a multinational corporation who requires customized Office integrations to streamline their business processes",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A sceptical university lecturer who questions the actual effectiveness of exchange programs like Erasmus",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A novice Haskell developer interested in configuration management in his applications.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Joshua Moore",
      "post": [
        {
          "educationLevel": "College",
          "place": "Hotel 2",
          "department": "",
          "salary": 21000,
          "job": "Hotel Receptionist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.591,
            7.6158
          ],
          "place": "Hotel 2",
          "id": 1,
          "address": "Flower street, 2"
        },
        {
          "type": "home",
          "unit": 34,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h6"
        }
      ],
      "birthDate": "1976-09-25",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2129
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2284
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3621
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 5097
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 5890
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 5997
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 6448
        },
        {
          "type": "son",
          "id": 8,
          "relative": 7069
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 7537
        }
      ],
      "features": []
    },
    {
      "uid": 5,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An owner of the 1970's old Alfa Romeo",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A project manager responsible for planning and overseeing the 3D modeling pipeline",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An open-minded individual who empathizes with the struggles of adapting to change and offers guidance on embracing inclusivity",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Sherman",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 139000,
          "job": "Chief Financial Officer (CFO)"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 188,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1983-09-03",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2654
        },
        {
          "type": "father",
          "id": 2,
          "relative": 4501
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 4839
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 5424
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7164
        }
      ],
      "features": []
    },
    {
      "uid": 6,
      "skills": [
        {
          "specialization": "Architecture",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Vilnius Gediminas Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A graduate student from Latvia researching the influence of Germanic tribes on European culture",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 3,
          "name": "Camping"
        }
      ],
      "gender": "Male",
      "displayName": "Joshua Gonzalez",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Magistrate",
          "department": "Management",
          "salary": 68000,
          "job": "Bilim Mayor"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5931,
            7.5966
          ],
          "place": "Magistrate",
          "id": 1,
          "address": "Post square, 1"
        },
        {
          "type": "home",
          "unit": 21,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h4"
        }
      ],
      "birthDate": "1981-01-19",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1701
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2732
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3751
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 4558
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 6367
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 6618
        }
      ],
      "features": []
    },
    {
      "uid": 7,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A coffee shop employee who recommends local hidden gems and shares stories of the DFW community",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A film reviewer who analyzes and critiques the sound design elements in movies and animations",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Yoga"
        }
      ],
      "gender": "Male",
      "displayName": "Jonathan Hughes",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 70000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 37,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h5"
        }
      ],
      "birthDate": "1992-05-03",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2035
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2445
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 4474
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 4618
        },
        {
          "type": "mother",
          "id": 5,
          "relative": 5172
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 7096
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 7305
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 8183
        },
        {
          "type": "son",
          "id": 9,
          "relative": 8270
        }
      ],
      "features": []
    },
    {
      "uid": 8,
      "skills": [
        {
          "specialization": "Transport Systems",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2000,
          "type": "education",
          "name": "Czech Technical University in Prague"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A man struggling with depression, desperately searching for support and understanding",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A property management company executive who values the security guard's expertise in protecting their residential communities",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A medical laboratory scientist specializing in clinical chemistry",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Language Learning"
        }
      ],
      "gender": "Male",
      "displayName": "Joseph Morales",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 104000,
          "job": "R&D Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1158,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1977-09-28",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1904
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 3517
        }
      ],
      "features": []
    },
    {
      "uid": 9,
      "skills": [
        {
          "specialization": "Biotechnology",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2011,
          "type": "education",
          "name": "Ghent University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a proud alumnus of Shanxi Technology and Business College",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A seasoned music producer with a record label specializing in promoting local Australian artists",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Brett Mcdaniel",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 99000,
          "job": "Sales and Marketing Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 39,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1988-09-21",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1791
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 6376
        },
        {
          "type": "nephew",
          "id": 3,
          "relative": 6910
        }
      ],
      "features": []
    },
    {
      "uid": 10,
      "skills": [
        {
          "specialization": "Public Health",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2022,
          "type": "education",
          "name": "University of Debrecen"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A legal consultant who specializes in tax law and estate planning, with a penchant for critiquing court decisions.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An organizational psychologist providing insights on how HR policies impact employee morale",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a conservative elderly local resident of Summit County",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Painting"
        }
      ],
      "gender": "Female",
      "displayName": "Emily Brown",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "Logistics",
          "salary": 49000,
          "job": "Logistics Coordinator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 1557,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1999-07-13",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1613
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1968
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3971
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 4733
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 5147
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 8208
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8350
        }
      ],
      "features": []
    },
    {
      "uid": 11,
      "skills": [
        {
          "specialization": "Pedagogy",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "Masaryk University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A climate scientist who worked with the persona on their research journey and witnessed their transformation",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Dancing"
        }
      ],
      "gender": "Male",
      "displayName": "Robert Mays",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 39000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 567,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1998-05-06",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3133
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4371
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6300
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7010
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7636
        }
      ],
      "features": []
    },
    {
      "uid": 12,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1992,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A sociologist specializing in adolescent development and peer influence",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A travel agent who plans vacations to explore the Canadian locations that inspired Lightfoot's songs",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A producer who coordinates the logistics of motion capture shoots and ensures timely delivery of assets",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Lisa Murphy",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 36000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 56,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h10"
        }
      ],
      "birthDate": "1969-03-20",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 13,
      "skills": [
        {
          "specialization": "Urban Planning",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "Lund University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An art curator seeking guidance on selecting environmentally-friendly materials for an upcoming exhibition",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Dawn Scott",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Logistics",
          "salary": 49000,
          "job": "Logistics Coordinator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 74,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h2"
        }
      ],
      "birthDate": "1993-06-16",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2984
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3462
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4410
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7337
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8481
        },
        {
          "type": "son",
          "id": 6,
          "relative": 9039
        }
      ],
      "features": []
    },
    {
      "uid": 14,
      "skills": [
        {
          "specialization": "Innovation",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "ETH Zurich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A commercial producer focusing on large-scale, high-budget musicals that attract tourist crowds",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Zachary Carey",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 67000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 1676,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1998-10-30",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1552
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2443
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 4366
        },
        {
          "type": "father",
          "id": 4,
          "relative": 5241
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 5314
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 7322
        },
        {
          "type": "son",
          "id": 7,
          "relative": 8672
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 8961
        }
      ],
      "features": []
    },
    {
      "uid": 15,
      "skills": [
        {
          "specialization": "Leadership",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "Harvard University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A cultural anthropologist who specializes in studying the dynamics of intercultural conflict",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A successful equestrian athlete and academic advisor who provides guidance on pursuing both passions",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a middle-aged public health official in the United States, skeptical of non-transparent practices and prefers data-led decision making",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Robert Smith",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 31000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 36,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h11"
        }
      ],
      "birthDate": "1987-04-16",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2871
        },
        {
          "type": "father",
          "id": 2,
          "relative": 4049
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5888
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 7064
        }
      ],
      "features": []
    },
    {
      "uid": 16,
      "skills": [
        {
          "specialization": "Civil Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2012,
          "type": "education",
          "name": "University of Ljubljana"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An aspiring actor from Catalonia, Spain, who idolizes Pablo Derqui and aspires to follow in his career footsteps.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 3,
          "name": "Photography"
        }
      ],
      "gender": "Female",
      "displayName": "Maria Lee",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 19000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 66,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h7"
        }
      ],
      "birthDate": "1989-07-22",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3073
        },
        {
          "type": "father",
          "id": 2,
          "relative": 5043
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 5947
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7698
        }
      ],
      "features": []
    },
    {
      "uid": 17,
      "skills": [
        {
          "specialization": "Logistics",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fellow graduate student studying the economic impacts of post-Civil War industrialization on Southern society",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A tech-savvy classmate who always shares the latest online gaming trends and hacks",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Christopher Wilson",
      "post": [
        {
          "educationLevel": null,
          "place": "Miscellaneous Store 2",
          "department": "",
          "salary": 16000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5944,
            7.6129
          ],
          "place": "Miscellaneous Store 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 48,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h5"
        }
      ],
      "birthDate": "1987-02-21",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4412
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 5903
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6270
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 7888
        }
      ],
      "features": []
    },
    {
      "uid": 18,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1999,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A young researcher attending a physics conference seeking advice and guidance from the renowned physicist",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local antique dealer with a hidden stash of rare sports memorabilia",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Tina Harris",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 83000,
          "job": "Chemical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.553832,
            7.606599
          ],
          "id": 2,
          "unit_type": "Andim",
          "address": "Andim"
        }
      ],
      "birthDate": "1976-04-20",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1527
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 1647
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2766
        },
        {
          "type": "father",
          "id": 4,
          "relative": 3681
        },
        {
          "type": "husband",
          "id": 5,
          "relative": 4987
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 5561
        },
        {
          "type": "son",
          "id": 7,
          "relative": 6047
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 7843
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 7884
        }
      ],
      "features": []
    },
    {
      "uid": 19,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1984,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A casual Scottish darts enthusiast.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A hydroelectric engineer specializing in harnessing the power of rivers and waterfalls for energy generation",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Lisa Brown",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 20000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 1133,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1961-06-19",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3032
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 7342
        }
      ],
      "features": []
    },
    {
      "uid": 20,
      "skills": [
        {
          "specialization": "Sociology",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1990,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A gallery owner who is fascinated by the painter's ability to reinterpret and reimagine set designs into standalone artworks",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A high-ranking officer in the host country's armed forces responsible for coordinating joint military exercises",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Volunteering"
        }
      ],
      "gender": "Female",
      "displayName": "Alexis Huff",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 42000,
          "job": "Environmental Analyst"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 82,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h4"
        }
      ],
      "birthDate": "1967-04-15",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 5330
        }
      ],
      "features": []
    },
    {
      "uid": 21,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A competitive data analyst for a rival news outlet who often breaks stories on voter demographics",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A local technology company that specializes in developing educational software for schools",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a conservative elderly local resident of Summit County",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Lawrence Evans",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 81000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.553832,
            7.606599
          ],
          "id": 2,
          "unit_type": "Andim",
          "address": "Andim"
        }
      ],
      "birthDate": "1993-10-30",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1633
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2642
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 3422
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 8342
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8818
        }
      ],
      "features": []
    },
    {
      "uid": 22,
      "skills": [
        {
          "specialization": "Sociology",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A dog trainer who frequently recommends specific brands and supplements to their clients",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A wealthy philanthropist who lends rare Surrealist artworks for the exhibition",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A young prodigy who admires the journalist's writing but feels misunderstood by them",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Laura Barnes",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 156000,
          "job": "General Director / CEO"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 49,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1993-04-07",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2661
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 5012
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 7125
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 7307
        }
      ],
      "features": []
    },
    {
      "uid": 23,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A lab technician at a materials testing facility, providing the student with valuable practical insights and skills",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A stalwart politician who handles public affairs and is often involved in controversies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A retired military officer with first-hand experience of post-war Britain",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Yoga"
        }
      ],
      "gender": "Male",
      "displayName": "Erik Stout",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Andim",
          "department": "",
          "salary": 68000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 6,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h6"
        }
      ],
      "birthDate": "1987-06-09",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 7204
        }
      ],
      "features": []
    },
    {
      "uid": 24,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2001,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A news anchor who relies on the pollster's data to provide accurate and up-to-date analysis of election trends",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Laura Perry",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 106000,
          "job": "Sales and Marketing Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 4,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h10"
        }
      ],
      "birthDate": "1978-10-12",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1692
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2971
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4502
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6906
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7321
        }
      ],
      "features": []
    },
    {
      "uid": 25,
      "skills": [
        {
          "specialization": "Biotechnology",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Ghent University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A kind-hearted Muggle family who has embraced the magical world and supports their student in their studies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A colleague who organizes hiking trips and outdoor activities to help relieve stress",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Photography"
        }
      ],
      "gender": "Male",
      "displayName": "Thomas White",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 87000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 42,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h6"
        }
      ],
      "birthDate": "1992-03-01",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1565
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 2116
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 3116
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 3835
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4833
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 5401
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 6095
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 6556
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 6886
        },
        {
          "type": "daughter",
          "id": 10,
          "relative": 8271
        },
        {
          "type": "nephew",
          "id": 11,
          "relative": 8537
        }
      ],
      "features": []
    },
    {
      "uid": 26,
      "skills": [
        {
          "specialization": "Cybersecurity",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1992,
          "type": "education",
          "name": "Tallinn University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A local historian with a particular interest in the commercial developments of Almelo, my hometown.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A college student majoring in dance who assists with teaching and choreography at the studio",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Elizabeth Snyder",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Quality Control",
          "salary": 55000,
          "job": "Chemist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 25,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h4"
        }
      ],
      "birthDate": "1969-08-09",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1924
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 5020
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 5120
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 7485
        }
      ],
      "features": []
    },
    {
      "uid": 27,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "The owner of an Algerian olive oil export company seeking to expand to the European markets",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A sibling who is a high-achieving attorney struggling with burnout",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A reformed domestic abuser who helps the detective understand the patterns and mindset of their subjects",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Crafting"
        }
      ],
      "gender": "Male",
      "displayName": "Jeremy Garcia",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 22000,
          "job": "Track Drivers"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 1671,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1982-04-20",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4438
        },
        {
          "type": "son",
          "id": 2,
          "relative": 6065
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 6855
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6929
        }
      ],
      "features": []
    },
    {
      "uid": 28,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A cellist who has experienced stage fright in the past and has successfully overcome it, providing support and guidance",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Thomas Martin",
      "post": [
        {
          "educationLevel": null,
          "place": "Miscellaneous Store 2",
          "department": "",
          "salary": 18000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5944,
            7.6129
          ],
          "place": "Miscellaneous Store 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 92,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h2"
        }
      ],
      "birthDate": "1980-05-01",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1838
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3213
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4927
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6516
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 9133
        }
      ],
      "features": []
    },
    {
      "uid": 29,
      "skills": [
        {
          "specialization": "Linguistics",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A real estate agent who helps their relative find suitable locations for new comedy club branches",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A graphic designer who specializes in creating unique and personalized music studio decor",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Gregory King",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Quality Control",
          "salary": 37000,
          "job": "Lab Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 78,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h5"
        }
      ],
      "birthDate": "1980-04-04",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 7253
        },
        {
          "type": "son",
          "id": 2,
          "relative": 7452
        }
      ],
      "features": []
    },
    {
      "uid": 30,
      "skills": [
        {
          "specialization": "Philosophy",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Sorbonne University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A fellow 3D artist specializing in realistic vehicle models, who shares feedback and inspiration",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a veteran business insight journalist",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Catherine Mitchell",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 96000,
          "job": "Deputy Director (Operations)"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 24,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h10"
        }
      ],
      "birthDate": "1980-12-31",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1773
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2274
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3276
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 4810
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6219
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 6343
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 8071
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 9013
        }
      ],
      "features": []
    },
    {
      "uid": 31,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2000,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A loyal patron who appreciates the business owner's commitment to conservative causes",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Kristina Gilmore",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Maintenance",
          "salary": 51000,
          "job": "Mechanical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 34,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h1"
        }
      ],
      "birthDate": "1977-05-12",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1835
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2516
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 6053
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 6358
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6730
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7529
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 7881
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 8731
        }
      ],
      "features": []
    },
    {
      "uid": 32,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2007,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A Japanese history professor from Mino Province",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A Panamanian businesswoman working in the shipping industry.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Tennis"
        }
      ],
      "gender": "Female",
      "displayName": "Taylor Wallace",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 142000,
          "job": "General Director / CEO"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 8,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h3"
        }
      ],
      "birthDate": "1984-12-02",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2136
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2463
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3550
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 3610
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 5411
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 5461
        },
        {
          "type": "son",
          "id": 7,
          "relative": 6462
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 6513
        }
      ],
      "features": []
    },
    {
      "uid": 33,
      "skills": [
        {
          "specialization": "Psychology",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a tired, overworked local newspaper journalist, indifferently unbiased.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A high-ranking executive at the pharmaceutical company responsible for making strategic decisions and overseeing legal disputes",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Gardening"
        }
      ],
      "gender": "Male",
      "displayName": "Tony Smith",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "R&D",
          "salary": 50000,
          "job": "Environmental Analyst"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 28,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h2"
        }
      ],
      "birthDate": "1981-02-23",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1850
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1909
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2615
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 3753
        },
        {
          "type": "brother-in-low",
          "id": 5,
          "relative": 3906
        },
        {
          "type": "father",
          "id": 6,
          "relative": 4143
        },
        {
          "type": "wife",
          "id": 7,
          "relative": 5216
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 6146
        },
        {
          "type": "son",
          "id": 9,
          "relative": 6207
        },
        {
          "type": "daughter",
          "id": 10,
          "relative": 6826
        },
        {
          "type": "nephew",
          "id": 11,
          "relative": 6828
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 7860
        },
        {
          "type": "granddaughter",
          "id": 13,
          "relative": 8532
        },
        {
          "type": "nephew",
          "id": 14,
          "relative": 8635
        },
        {
          "type": "niece",
          "id": 15,
          "relative": 8726
        }
      ],
      "features": []
    },
    {
      "uid": 34,
      "skills": [
        {
          "specialization": "Psychology",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2018,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A competitive industrial property agent who specializes in commercial lots and warehouses",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A school teacher who often enters lively discussions about education and health care issues",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A Croatian man living in the city who loves countryside leisure life.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Swimming"
        }
      ],
      "gender": "Male",
      "displayName": "Edwin Dawson",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 100000,
          "job": "Deputy Director (Operations)"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 135,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1995-06-22",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1992
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3230
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 3861
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 4627
        },
        {
          "type": "wife",
          "id": 5,
          "relative": 4946
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 7058
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8851
        }
      ],
      "features": []
    },
    {
      "uid": 35,
      "skills": [
        {
          "specialization": "Logistics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A chemistry student interested in unusual amino acids",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A multinational e-commerce company looking to localize their website for the Japanese market",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a professional computer programmer who specializes in VBScript",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Brittany Smith",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Hospital",
          "department": "Management",
          "salary": 101000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 45,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1992-01-10",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1753
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 2216
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2840
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4041
        },
        {
          "type": "husband",
          "id": 5,
          "relative": 4146
        },
        {
          "type": "brother-in-low",
          "id": 6,
          "relative": 4863
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 5698
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 5748
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 6096
        },
        {
          "type": "daughter",
          "id": 10,
          "relative": 6315
        },
        {
          "type": "daughter",
          "id": 11,
          "relative": 7348
        },
        {
          "type": "son",
          "id": 12,
          "relative": 8045
        },
        {
          "type": "nephew",
          "id": 13,
          "relative": 8861
        }
      ],
      "features": []
    },
    {
      "uid": 36,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2014,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A published author of Asian literature who seeks feedback and suggestions on their manuscripts",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A retired structural engineer with years of experience in analyzing the stability of natural materials",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A successful entrepreneur who started a technology company with a mission to digitize historical documents",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Richard Lopez",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 20000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 26,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h5"
        }
      ],
      "birthDate": "1991-02-22",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3244
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 3914
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 5804
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7696
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8029
        }
      ],
      "features": []
    },
    {
      "uid": 37,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A middle-class GCC resident who holds a chunk of land",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Mio Watanabe",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 42000,
          "job": "Environmental Analyst"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1982-10-23",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2227
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4575
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 5625
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5627
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7209
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 7224
        },
        {
          "type": "son",
          "id": 7,
          "relative": 7868
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 7906
        }
      ],
      "features": []
    },
    {
      "uid": 38,
      "skills": [
        {
          "specialization": "Genetics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A well-known radio DJ known for their dynamic personality and love for live sessions",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A distant cousin who moved to Hollywood and pursued a successful career as a character actor",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A historical researcher collaborating on projects to accurately depict the time period of the novels through visual elements",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Stephen Rice",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 72000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 401,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1994-03-07",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3062
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3521
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3619
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 6629
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8678
        }
      ],
      "features": []
    },
    {
      "uid": 39,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A retired military historian from Algeria",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A local farmer who grows organic produce that perfectly matches the sommelier's recommended wines",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Maria Lheureux",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 3",
          "department": "",
          "salary": 74000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5861,
            7.62
          ],
          "place": "Restaurant 3",
          "id": 1,
          "address": "River street, 3"
        },
        {
          "type": "home",
          "unit": 411,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1994-11-02",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2639
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 4786
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4921
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8694
        }
      ],
      "features": []
    },
    {
      "uid": 40,
      "skills": [
        {
          "specialization": "Public Policy",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1993,
          "type": "education",
          "name": "University of Vienna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A die-hard Ballkani football club fan who is passionate about local football and enjoys discussing matches in great detail with friends.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A college professor in computer science who guides and advises the high school student on pursuing a career in automation",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Carolyn Carter",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 120000,
          "job": "Chief Technical Officer (CTO)"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 69,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h10"
        }
      ],
      "birthDate": "1970-05-16",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1779
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 4274
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 5348
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 6023
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 6622
        }
      ],
      "features": []
    },
    {
      "uid": 41,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A librarian with a passion for historical preservation who is the military historian's sibling",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A listener who has been inspired by the host's interviewing skills and now aspires to be an interviewer themselves",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A retiree who used to work at the Clouth Gummiwerke factory in Cologne.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Elizabeth Cruz",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 2",
          "department": "",
          "salary": 52000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Restaurant 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 8,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h14"
        }
      ],
      "birthDate": "1998-07-12",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2210
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2815
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3380
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4108
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4805
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 6441
        }
      ],
      "features": []
    },
    {
      "uid": 42,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A writer who documents predator-prey interactions and their ecological significance for wider audiences",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A culturally sensitive healthcare aide striving to provide empathy-driven care",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Joshua Lopez",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 21000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 343,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1960-08-07",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4655
        },
        {
          "type": "son",
          "id": 2,
          "relative": 5664
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5668
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 8571
        }
      ],
      "features": []
    },
    {
      "uid": 43,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1996,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A Cranbrook local and enthusiastic lottery player",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Jeff Adams",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 58,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 3, h7"
        }
      ],
      "birthDate": "1973-01-02",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1662
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2777
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 5077
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6909
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7129
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 7914
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 7928
        }
      ],
      "features": []
    },
    {
      "uid": 44,
      "skills": [
        {
          "specialization": "Innovation",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2023,
          "type": "education",
          "name": "ETH Zurich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A government official responsible for enforcing regulations and permits for excavation projects",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fellow gamer who argues that gaming on consoles is more enjoyable than on Windows",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A rural Wisconsin resident",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Barker",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 88000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 38,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "2000-03-15",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1885
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2289
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4309
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 5075
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 6641
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 8789
        }
      ],
      "features": []
    },
    {
      "uid": 45,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A die-hard fan of Kiara Barnes who keeps track of all her work minutely",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "William Brown",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 39000,
          "job": "Production Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.553832,
            7.606599
          ],
          "id": 2,
          "unit_type": "Andim",
          "address": "Andim"
        }
      ],
      "birthDate": "1981-07-12",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2151
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2828
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3504
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4369
        }
      ],
      "features": []
    },
    {
      "uid": 46,
      "skills": [
        {
          "specialization": "Medicine",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A psychologist specializing in experimental design and psychological assessment, providing guidance on creating virtual reality experiments",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An individual in a committed same-sex relationship.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A tour guide from Brig",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Erin Morrison",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Concert Hall",
          "department": "",
          "salary": 25000,
          "job": "Musician / Orchestra Member"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5957,
            7.5958
          ],
          "place": "Concert Hall",
          "id": 1,
          "address": "Glory street, 1"
        },
        {
          "type": "home",
          "unit": 50,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h11"
        }
      ],
      "birthDate": "1987-01-04",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4666
        },
        {
          "type": "son",
          "id": 2,
          "relative": 6997
        },
        {
          "type": "son",
          "id": 3,
          "relative": 8907
        }
      ],
      "features": []
    },
    {
      "uid": 47,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A sibling with a knack for organization, offering practical tips and support to create a tidy workspace",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A young scholar specializing in naval architecture, often assists the professor in research",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Scrapbooking"
        }
      ],
      "gender": "Female",
      "displayName": "Amy Davis",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 37000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 18,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h3"
        }
      ],
      "birthDate": "1969-10-08",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 48,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A fellow vinyl record collector who specializes in rare Beatles albums and enjoys trading recommendations and insights",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A historian intrigued by the writer's unique perspective on how time travel could reshape historical events",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Jamie Johnson",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 17000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 14,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h1"
        }
      ],
      "birthDate": "1961-09-25",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3047
        },
        {
          "type": "son",
          "id": 2,
          "relative": 6054
        }
      ],
      "features": []
    },
    {
      "uid": 49,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An automotive engineer working on the development of more efficient and performant hybrid systems",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A history teacher who believes that actions speak louder than words",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Writing"
        }
      ],
      "gender": "Female",
      "displayName": "Annette Gallagher",
      "post": [
        {
          "educationLevel": null,
          "place": "Hotel 1",
          "department": "",
          "salary": 17000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.592,
            7.5997
          ],
          "place": "Hotel 1",
          "id": 1,
          "address": "Flower street, 2"
        },
        {
          "type": "home",
          "unit": 36,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h9"
        }
      ],
      "birthDate": "1989-02-08",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 3626
        },
        {
          "type": "son",
          "id": 2,
          "relative": 6972
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7964
        }
      ],
      "features": []
    },
    {
      "uid": 50,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a data analyst whose hobby is exploring technology-related human rights issues",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A biomedical scientist investigating the impact of maternal-fetal health on long-term child development",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An Iranian geography teacher with a passion for radio broadcasting.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Monica Brown",
      "post": [
        {
          "educationLevel": "College",
          "place": "SPA Hotel",
          "department": "",
          "salary": 20000,
          "job": "Hotel Receptionist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 17,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h14"
        }
      ],
      "birthDate": "1982-05-31",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2481
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3762
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7150
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8603
        }
      ],
      "features": []
    },
    {
      "uid": 51,
      "skills": [
        {
          "specialization": "Logistics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 1985,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A local business student with a side gig of organizing local amateur soccer games",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A millennial software engineer who actively trades stocks as a way to supplement their income",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Cooking"
        }
      ],
      "gender": "Female",
      "displayName": "Katherine Chavez",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Andim",
          "department": "R&D",
          "salary": 82000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 98,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1962-12-31",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1598
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2283
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3955
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5724
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 9069
        }
      ],
      "features": []
    },
    {
      "uid": 52,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A local fisherman who depends on the park ranger's expertise to preserve the fishing resources and maintain a sustainable livelihood",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A tech-savvy teenager who can explain the different types of vaping devices and how they work",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Running"
        }
      ],
      "gender": "Female",
      "displayName": "Morgan Morales",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 2",
          "department": "",
          "salary": 53000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Restaurant 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 23,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h7"
        }
      ],
      "birthDate": "1981-03-21",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3240
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3490
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7294
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8602
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8720
        }
      ],
      "features": []
    },
    {
      "uid": 53,
      "skills": [
        {
          "specialization": "Environmental Science",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2014,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A real estate agent who frequently turns to their parent for business advice",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Music (playing instrument)"
        }
      ],
      "gender": "Male",
      "displayName": "Trevor Diaz",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 17000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 9,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h3"
        }
      ],
      "birthDate": "1991-05-08",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2923
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 3866
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3974
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8182
        }
      ],
      "features": []
    },
    {
      "uid": 54,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a centrist law enforcement official who values objective truths",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Video Gaming"
        }
      ],
      "gender": "Male",
      "displayName": "Taylor Sanchez",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 11,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 3, h5"
        }
      ],
      "birthDate": "1987-09-10",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2133
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 2231
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2456
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 3568
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 3856
        },
        {
          "type": "wife",
          "id": 6,
          "relative": 5067
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 5397
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 6126
        },
        {
          "type": "son",
          "id": 9,
          "relative": 6482
        },
        {
          "type": "son",
          "id": 10,
          "relative": 6610
        },
        {
          "type": "daughter",
          "id": 11,
          "relative": 7438
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 8488
        }
      ],
      "features": []
    },
    {
      "uid": 55,
      "skills": [
        {
          "specialization": "Psychology",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2011,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A proud alumna of Baruch College who works in Public Relations",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a Pakistani housewife who is from the Sindh province.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "William Chavez",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 16000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 6,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h5"
        }
      ],
      "birthDate": "1988-07-08",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1979
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3046
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 4333
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4684
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 6766
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 7292
        },
        {
          "type": "sister",
          "id": 7,
          "relative": 8025
        }
      ],
      "features": []
    },
    {
      "uid": 56,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A politician who prioritizes business interests over workers' rights and advocates for deregulation",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Elizabeth Gibson",
      "post": [
        {
          "educationLevel": "College",
          "place": "SPA Hotel",
          "department": "",
          "salary": 26000,
          "job": "Beauty Therapist / Masseuse"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 70,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1993-01-30",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1983
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 3983
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4930
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6799
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7946
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 7950
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 7969
        }
      ],
      "features": []
    },
    {
      "uid": 57,
      "skills": [
        {
          "specialization": "Genetics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2018,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An aspiring singer-songwriter who collaborates with the passionate fan on Harry Styles-inspired music",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A postman who appreciates the job security provided by the union membership",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Rachel Hamilton",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 97000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 52,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h12"
        }
      ],
      "birthDate": "1995-01-26",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1737
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2318
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 5066
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 5074
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 7106
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7345
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 7357
        },
        {
          "type": "brother",
          "id": 8,
          "relative": 7808
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 8238
        }
      ],
      "features": []
    },
    {
      "uid": 58,
      "skills": [
        {
          "specialization": "Political Science",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2018,
          "type": "education",
          "name": "University of Oslo"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a former Peruvian university athlete who closely follows his nation's performance in international games",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a Colombian who does not know or understand the technical details of civil engineering, but admires Cardona for his contributions to society.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Charles Li",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Andim",
          "department": "R&D",
          "salary": 84000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 877,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1995-02-18",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3131
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 6651
        },
        {
          "type": "son",
          "id": 3,
          "relative": 8386
        }
      ],
      "features": []
    },
    {
      "uid": 59,
      "skills": [
        {
          "specialization": "Public Health",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 1997,
          "type": "education",
          "name": "University of Debrecen"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "Консультант по маркетингу, помогающий оптимизировать сайт для привлечения целевой аудитории",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An alumium contractor who frequently uses heat treatment services",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Karen Wilson",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 77000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 91,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1974-10-13",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3245
        },
        {
          "type": "father",
          "id": 2,
          "relative": 5032
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7447
        }
      ],
      "features": []
    },
    {
      "uid": 60,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a potential homebuyer who is very cautious about providing personal information",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A popular philosophy vlogger who breaks down philosophical concepts in entertaining and relatable ways",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A precocious 10-year-old bookworm who provides honest and detailed feedback on plot and characters",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Caitlyn Hicks",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 93000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 12,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h14"
        }
      ],
      "birthDate": "1990-08-22",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1813
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2530
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3292
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 4826
        },
        {
          "type": "brother-in-low",
          "id": 5,
          "relative": 5157
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 5994
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8002
        }
      ],
      "features": []
    },
    {
      "uid": 61,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "An established author known for their experimental writing style, guiding the creative writing major to explore new literary techniques",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A community organizer and active member of the Salvation Army",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A talented musician who writes songs inspired by the emotions felt during a football match",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Rebecca Hall",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Logistics",
          "salary": 34000,
          "job": "Warehouse Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 50,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h5"
        }
      ],
      "birthDate": "1967-01-31",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2123
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 2126
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3090
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 3446
        },
        {
          "type": "brother-in-low",
          "id": 5,
          "relative": 4986
        },
        {
          "type": "husband",
          "id": 6,
          "relative": 5124
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 5584
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 5708
        },
        {
          "type": "niece",
          "id": 9,
          "relative": 7783
        }
      ],
      "features": []
    },
    {
      "uid": 62,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 1983,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a proud young Jewish student at a Canadian university",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Webb",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 19000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 39,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h4"
        }
      ],
      "birthDate": "1960-10-24",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1831
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2608
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 3609
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 3766
        },
        {
          "type": "mother",
          "id": 5,
          "relative": 4343
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 5858
        },
        {
          "type": "son",
          "id": 7,
          "relative": 6173
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 6201
        }
      ],
      "features": []
    },
    {
      "uid": 63,
      "skills": [
        {
          "specialization": "Linguistics",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Lomonosov Moscow State University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An elderly man who enjoys playing traditional Egyptian music on his oud in the evenings",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An aerospace engineer inspired by the scientific ideas presented in their sibling's novels",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Paraskevi Antoniou",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 24000,
          "job": "Track Drivers"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 49,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1992-05-25",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2326
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 4515
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4827
        },
        {
          "type": "brother",
          "id": 4,
          "relative": 6446
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 7983
        },
        {
          "type": "son",
          "id": 6,
          "relative": 8383
        },
        {
          "type": "son",
          "id": 7,
          "relative": 8997
        }
      ],
      "features": []
    },
    {
      "uid": 64,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A Geography teacher who worked as a city planner before switching to education",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Ryan Kent",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 15000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 37,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1980-06-03",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2237
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 4621
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5982
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 7288
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 8274
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 8551
        }
      ],
      "features": []
    },
    {
      "uid": 65,
      "skills": [
        {
          "specialization": "Innovation",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2012,
          "type": "education",
          "name": "ETH Zurich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A fellow emerging scholar in international relations, conducting research on the role of diplomacy in conflict prevention",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Sean Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": "Hotel 2",
          "department": "",
          "salary": 17000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.591,
            7.6158
          ],
          "place": "Hotel 2",
          "id": 1,
          "address": "Flower street, 2"
        },
        {
          "type": "home",
          "unit": 54,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h9"
        }
      ],
      "birthDate": "1989-08-20",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1785
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2767
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3760
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 4511
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 6502
        },
        {
          "type": "son",
          "id": 6,
          "relative": 6539
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 6897
        },
        {
          "type": "son",
          "id": 8,
          "relative": 7470
        },
        {
          "type": "niece",
          "id": 9,
          "relative": 8667
        }
      ],
      "features": []
    },
    {
      "uid": 66,
      "skills": [
        {
          "specialization": "Civil Engineering",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2008,
          "type": "education",
          "name": "University of Ljubljana"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fellow artifact enthusiast who engages in passionate debates about the significance and authenticity of different items",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A journalist who covers stories related to crime victim rights and highlights the organizer's efforts",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Austin Hanson",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 86000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 70,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h5"
        }
      ],
      "birthDate": "1985-07-06",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3121
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4522
        }
      ],
      "features": []
    },
    {
      "uid": 67,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1982,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An international relations professor who maintains a long-distance relationship during their partner's deployments",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A casting director who helps connect talent scouts with aspiring actors seeking dialect training",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Shaun Miller",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 17000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 74,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h5"
        }
      ],
      "birthDate": "1959-08-25",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 68,
      "skills": [
        {
          "specialization": "Natural Sciences",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "University of Cambridge"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A young poet who deeply believes in setting higher standards for media's effect on the audience.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a jazz drummer who aspires to become as virtuosic as Cindy Blackman",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Cameron Norman",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 71000,
          "job": "Logistics Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 807,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1983-02-18",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4934
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 7692
        }
      ],
      "features": []
    },
    {
      "uid": 69,
      "skills": [
        {
          "specialization": "Agronomy",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2008,
          "type": "education",
          "name": "Bilim School of Agriculture"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A jazz musician who enjoys the rhythm of typing sounds from the adjacent repair shop",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A practical and logical engineer who supports her but remains skeptical of astrology",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Programming"
        }
      ],
      "gender": "Male",
      "displayName": "Michael Glenn",
      "post": [
        {
          "educationLevel": "College",
          "place": "Restaurant 3",
          "department": "",
          "salary": 23000,
          "job": "Supply Chain Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5861,
            7.62
          ],
          "place": "Restaurant 3",
          "id": 1,
          "address": "River street, 3"
        },
        {
          "type": "home",
          "unit": 19,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h5"
        }
      ],
      "birthDate": "1985-10-26",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2700
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4560
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 5822
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7356
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7462
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7468
        }
      ],
      "features": []
    },
    {
      "uid": 70,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2008,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A stock market guru who provides daily market insights and predictions",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A business owner facing complex litigation involving intellectual property rights",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Andrew Graham",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Andim",
          "department": "R&D",
          "salary": 70000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 96,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h3"
        }
      ],
      "birthDate": "1985-03-22",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2045
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3084
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3548
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 4140
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4668
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 5876
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 5972
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 6058
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 8019
        },
        {
          "type": "daughter",
          "id": 10,
          "relative": 8046
        },
        {
          "type": "grandson",
          "id": 11,
          "relative": 9010
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 9115
        }
      ],
      "features": []
    },
    {
      "uid": 71,
      "skills": [
        {
          "specialization": "Journalism",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A passionate fan of 'The Tick' who recommends the best comics and merchandise",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An AI research scientist specializing in deep learning, particularly in Convolutional Neural Networks (CNN) and Long Short-Term Memory Networks (LSTM).",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Douglas Anthony",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Maintenance",
          "salary": 59000,
          "job": "Mechanical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 571,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1990-08-18",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3249
        }
      ],
      "features": []
    },
    {
      "uid": 72,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2007,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a macOS user who enjoys using Homebrew for software management",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A renowned acting coach who specializes in helping actors develop their range and transform their image",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An industrial designer specializing in interior cabin design and comfort for passengers",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Kaitlyn Thomas",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 20000,
          "job": "Track Drivers"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 62,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1984-03-16",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3004
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3915
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5388
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5518
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6900
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 8880
        }
      ],
      "features": []
    },
    {
      "uid": 73,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A bioinformatician skilled in analyzing large genomic datasets to identify potential gene targets for CRISPR editing",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "I am an emerging fashion designer who was deeply inspired by Francine \"Franc'\" Pairon's legacy in the fashion industry and education.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Programming"
        }
      ],
      "gender": "Male",
      "displayName": "Georges Gloor",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 2",
          "department": "",
          "salary": 53000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Restaurant 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 1142,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1996-04-06",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4819
        }
      ],
      "features": []
    },
    {
      "uid": 74,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An interior designer who specializes in creating unique, thematic living spaces based on literature",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A biotech researcher working on developing non-invasive prenatal testing technologies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An accomplished biologist who frequently shares their experiences in higher education",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Veronica Mendez",
      "post": [
        {
          "educationLevel": "College",
          "place": "Gold Fish",
          "department": "",
          "salary": 26000,
          "job": "Fishery Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6004,
            7.5951
          ],
          "place": "Gold Fish",
          "id": 1,
          "address": "River street, 1"
        },
        {
          "type": "home",
          "unit": 598,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1990-09-11",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1509
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2708
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 3283
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 4212
        },
        {
          "type": "husband",
          "id": 5,
          "relative": 4920
        },
        {
          "type": "sister",
          "id": 6,
          "relative": 6453
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8096
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 8265
        },
        {
          "type": "son",
          "id": 9,
          "relative": 8450
        }
      ],
      "features": []
    },
    {
      "uid": 75,
      "skills": [
        {
          "specialization": "Robotics",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Tallinn University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a die-hard fan of Deathmatch Wrestling from Tokyo, Japan",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "Associated Chief of Police in a large US city",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Bryan Lee",
      "post": [
        {
          "educationLevel": null,
          "place": "Hotel 1",
          "department": "",
          "salary": 16000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.592,
            7.5997
          ],
          "place": "Hotel 1",
          "id": 1,
          "address": "Flower street, 2"
        },
        {
          "type": "home",
          "unit": 1415,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1992-01-06",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1774
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2361
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3815
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 3884
        },
        {
          "type": "father",
          "id": 5,
          "relative": 4584
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 8288
        },
        {
          "type": "son",
          "id": 7,
          "relative": 8794
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 9097
        }
      ],
      "features": []
    },
    {
      "uid": 76,
      "skills": [
        {
          "specialization": "Architecture",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "Vilnius Gediminas Technical University"
        }
      ],
      "gender": "Female",
      "displayName": "Jennifer Smith",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 92000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 854,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1990-04-29",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1554
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1919
        },
        {
          "type": "father",
          "id": 3,
          "relative": 2500
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 3652
        },
        {
          "type": "brother-in-low",
          "id": 5,
          "relative": 4841
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 7161
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 7299
        },
        {
          "type": "son",
          "id": 8,
          "relative": 8021
        }
      ],
      "features": []
    },
    {
      "uid": 77,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2000,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A robotics engineer collaborating on the development of advanced satellite docking mechanisms",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Collecting (stamps, coins)"
        }
      ],
      "gender": "Male",
      "displayName": "Travis Horton",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Administration",
          "salary": 83000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 63,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h5"
        }
      ],
      "birthDate": "1977-11-21",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2118
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4917
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6303
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6810
        }
      ],
      "features": []
    },
    {
      "uid": 78,
      "skills": [
        {
          "specialization": "Nursing",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2023,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "Another aide who shares the burden of the official's daily tasks and forms a strong professional connection",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A mathematician specializing in complex computational models, who aids in refining and expanding the persona's theoretical work",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Painting"
        }
      ],
      "gender": "Female",
      "displayName": "Mary Turner",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 49000,
          "job": "Shift Supervisor"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 8,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h10"
        }
      ],
      "birthDate": "2000-03-12",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1826
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1927
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2359
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 3501
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 3545
        },
        {
          "type": "father",
          "id": 6,
          "relative": 4725
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 6554
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 7810
        },
        {
          "type": "daughter",
          "id": 9,
          "relative": 8439
        }
      ],
      "features": []
    },
    {
      "uid": 79,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "an assistant manager at a rehab center who has been helping various drug addicts rebuild their lives.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A grandmother who loves to bake sugar-free treats for the child to enjoy after dental appointments",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Melinda Rice",
      "post": [
        {
          "educationLevel": "College",
          "place": "Private shop 4",
          "department": "",
          "salary": 31000,
          "job": "Art/Craft Instructor"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.6363
          ],
          "place": "Private shop 4",
          "id": 1,
          "address": "Flower street, 22"
        },
        {
          "type": "home",
          "unit": 158,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1980-04-08",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2004
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 4227
        },
        {
          "type": "nephew",
          "id": 3,
          "relative": 5316
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 5352
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 7743
        }
      ],
      "features": []
    },
    {
      "uid": 80,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A penny-pinching amateur event planner",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A hospital administrator advocating for increased resources and support for speech pathology services",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Baking"
        }
      ],
      "gender": "Female",
      "displayName": "Danielle Schneider",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Andim",
          "department": "R&D",
          "salary": 73000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 102,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1986-01-02",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2542
        },
        {
          "type": "father",
          "id": 2,
          "relative": 4957
        }
      ],
      "features": []
    },
    {
      "uid": 81,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1993,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A luxury resort owner who seeks the expertise of the digital marketing expert to promote their property",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Yoga"
        }
      ],
      "gender": "Female",
      "displayName": "Jillian Rush",
      "post": [
        {
          "educationLevel": "College",
          "place": "Andim",
          "department": "",
          "salary": 19000,
          "job": "Hotel Receptionist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 344,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1970-03-07",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 3792
        }
      ],
      "features": []
    },
    {
      "uid": 82,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2002,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a skeptical vape shop owner with a fondness for theatrics.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "David Escobar",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 23000,
          "job": "Track Drivers"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 25,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h4"
        }
      ],
      "birthDate": "1979-12-31",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 5024
        }
      ],
      "features": []
    },
    {
      "uid": 83,
      "skills": [
        {
          "specialization": "Public Health",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "University of Debrecen"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "an African-American researchers who study freemasonry",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fantasy novelist seeking to improve their typing speed to keep up with fast-paced writing deadlines",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a young participant of the Carmel Music Society",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Language Learning"
        }
      ],
      "gender": "Female",
      "displayName": "Melissa Mitchell",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 77000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 54,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1980-07-06",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2568
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3549
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5294
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5758
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8657
        }
      ],
      "features": []
    },
    {
      "uid": 84,
      "skills": [
        {
          "specialization": "Humanities",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "University of Vienna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A tourist who prefers to explore cities on foot, completely avoids flying and never uses any airport facilities",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A supportive and proud mother who showcases their child's sculptures in the family's living room",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Kayla Wilson",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 75000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 17,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h4"
        }
      ],
      "birthDate": "1998-11-09",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2020
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 2057
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4218
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 6349
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8729
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 8808
        }
      ],
      "features": []
    },
    {
      "uid": 85,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a physical anthropologist interested in Pleistocene hominids",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a lifelong NBA fan with an interest in sports journalism.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Tina Gillespie",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "R&D",
          "salary": 49000,
          "job": "Environmental Analyst"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 112,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1980-11-04",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 86,
      "skills": [
        {
          "specialization": "Journalism",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1985,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A competitive swimmer who utilizes the same mindfulness techniques to cope with stress",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A theater director seeking a transformative set design for their upcoming production",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A sleep researcher, fascinated by the science of nightmares and interested in their partner's exploration of fear",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "David Delacruz",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 49000,
          "job": "Shift Supervisor"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 20,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h14"
        }
      ],
      "birthDate": "1962-08-30",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 3854
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 7835
        }
      ],
      "features": []
    },
    {
      "uid": 87,
      "skills": [
        {
          "specialization": "Advanced Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2007,
          "type": "education",
          "name": "ETH Zurich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A parent of a student who supports the union's efforts in ensuring quality education for all children",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A psychologist who believes that matriarchal societies perpetuate gender inequalities",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Chad Brown",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 20000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 111,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h2"
        }
      ],
      "birthDate": "1984-06-10",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2015
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2519
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 4820
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 5780
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 7786
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7951
        }
      ],
      "features": []
    },
    {
      "uid": 88,
      "skills": [
        {
          "specialization": "Material Science",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "National University of Science & Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A student who actively participates in the research studies conducted by the research assistant",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A dietitian specializing in tropical fruits.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Susan Ryan",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 78000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 11,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h12"
        }
      ],
      "birthDate": "1983-08-19",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1975
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 4877
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 6690
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6796
        },
        {
          "type": "son",
          "id": 5,
          "relative": 6890
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 7202
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8682
        }
      ],
      "features": []
    },
    {
      "uid": 89,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A city planner who recognizes the importance of science education and community engagement",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A retired judge named James",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A professor of anthropology who collaborates with the data analyst to publish research papers on archaeological data",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Peggy Schwartz",
      "post": [
        {
          "educationLevel": "College",
          "place": "Restaurant 1",
          "department": "",
          "salary": 28000,
          "job": "Supply Chain Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5919,
            7.5962
          ],
          "place": "Restaurant 1",
          "id": 1,
          "address": "Central Allee, 3"
        },
        {
          "type": "home",
          "unit": 77,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1997-11-08",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4813
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 8967
        }
      ],
      "features": []
    },
    {
      "uid": 90,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "National University of Science & Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A former criminal turned informant with valuable insider knowledge of the criminal underworld",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Timothy Goodwin",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 18000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 465,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1980-08-27",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 6055
        },
        {
          "type": "grandson",
          "id": 2,
          "relative": 8448
        }
      ],
      "features": []
    },
    {
      "uid": 91,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1989,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A college student majoring in mass communication, fascinated by the intricate narratives of television series and the impact of spoilers on viewing experiences.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a US space analyst focused on China's space program",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A Filipino migrant worker in the U.S. who frequently sends money to his family in the Philippines.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Jorge Mitchell",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Bilim Farms",
          "department": "",
          "salary": 32000,
          "job": "Agronomist/Farm Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 57,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h6"
        }
      ],
      "birthDate": "1966-12-29",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4365
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 5465
        }
      ],
      "features": []
    },
    {
      "uid": 92,
      "skills": [
        {
          "specialization": "Material Science",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "National University of Science & Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A government spokesperson who frequently clashes with the journalist during press conferences",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A public health policymaker seeking input on emergency response protocols",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Cycling"
        }
      ],
      "gender": "Female",
      "displayName": "Stephanie Romero",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Hospital",
          "department": "",
          "salary": 45000,
          "job": "Pharmacist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 16,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h5"
        }
      ],
      "birthDate": "1993-11-11",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2909
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 5011
        },
        {
          "type": "sister",
          "id": 3,
          "relative": 5422
        }
      ],
      "features": []
    },
    {
      "uid": 93,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1993,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A seasoned pharmacology professor who goes the extra mile to make complex concepts accessible",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A fierce and territorial orca whale vying for dominance in the same hunting grounds",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Nichole Hudson",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 89,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h1"
        }
      ],
      "birthDate": "1970-11-22",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2916
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 7248
        }
      ],
      "features": []
    },
    {
      "uid": 94,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1992,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "Another textile manufacturer known for their innovative silk fabric production",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A young aspiring graphic designer seeking guidance on photo restoration techniques",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An avid fan and follower of London's experimental music scene.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Volunteering"
        }
      ],
      "gender": "Female",
      "displayName": "Julia Williams",
      "post": [
        {
          "educationLevel": "College",
          "place": "Easy House",
          "department": "",
          "salary": 31000,
          "job": "Electrician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 19,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h2"
        }
      ],
      "birthDate": "1969-07-08",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 95,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1992,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A film producer intrigued by the idea of exploring new storytelling techniques through mixed-medium projects",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A professional athlete who relies on accurate motion tracking for performance analysis and training",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Yoga Club"
        }
      ],
      "gender": "Male",
      "displayName": "Willie Hooper",
      "post": [
        {
          "educationLevel": "College",
          "place": "SPA Hotel",
          "department": "",
          "salary": 23000,
          "job": "Hotel Receptionist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 39,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h3"
        }
      ],
      "birthDate": "1969-10-08",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2618
        },
        {
          "type": "son",
          "id": 2,
          "relative": 7043
        }
      ],
      "features": []
    },
    {
      "uid": 96,
      "skills": [
        {
          "specialization": "Cybersecurity",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Tallinn University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A university critic who is skeptical about the proliferation of private and state universities in India.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A history professor specializing in late 19th-century anti-Semitic incidents.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A journalist who investigates the connections between literary movements and economic conditions",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Stevenson",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Quality Control",
          "salary": 65000,
          "job": "Chemist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 13,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h11"
        }
      ],
      "birthDate": "1981-01-12",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 3699
        },
        {
          "type": "son",
          "id": 2,
          "relative": 7913
        },
        {
          "type": "son",
          "id": 3,
          "relative": 8024
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8252
        }
      ],
      "features": []
    },
    {
      "uid": 97,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A newsroom supervisor responsible for ensuring accurate and balanced reporting on controversial topics",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A renowned food writer who shares the same appreciation for small-town diners",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Bianca Gutierrez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Maintenance",
          "salary": 64000,
          "job": "Mechanical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 61,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h5"
        }
      ],
      "birthDate": "1981-10-30",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2899
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4724
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5808
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 7110
        }
      ],
      "features": []
    },
    {
      "uid": 98,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A staff member responsible for ensuring medical assistance is readily available at the festival",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fellow teacher from a different school who organizes regular get-togethers to destress and share teaching strategies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A first-grade student with dysgraphia who relies on motor skill interventions to improve handwriting",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Cynthia Copeland",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "Management",
          "salary": 67000,
          "job": "Logistics Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 132,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1992-10-29",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2402
        }
      ],
      "features": []
    },
    {
      "uid": 99,
      "skills": [
        {
          "specialization": "Linguistics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2023,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a historian specialized in the religious history of the 19th century Britain",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Jessica Fleming",
      "post": [
        {
          "educationLevel": null,
          "place": "Clothing Store 6",
          "department": "",
          "salary": 19000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5923,
            7.6176
          ],
          "place": "Clothing Store 6",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 22,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h7"
        }
      ],
      "birthDate": "2000-03-01",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1592
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1615
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2641
        },
        {
          "type": "father",
          "id": 4,
          "relative": 3528
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4591
        },
        {
          "type": "sister-in-low",
          "id": 6,
          "relative": 4919
        },
        {
          "type": "husband",
          "id": 7,
          "relative": 4954
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 7365
        },
        {
          "type": "niece",
          "id": 9,
          "relative": 8309
        },
        {
          "type": "niece",
          "id": 10,
          "relative": 8577
        },
        {
          "type": "son",
          "id": 11,
          "relative": 8771
        },
        {
          "type": "niece",
          "id": 12,
          "relative": 8814
        },
        {
          "type": "niece",
          "id": 13,
          "relative": 8881
        }
      ],
      "features": []
    },
    {
      "uid": 100,
      "skills": [
        {
          "specialization": "Nursing",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local government representative who recognizes the importance of rehabilitation centers and seeks the banker's expertise in securing funding",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Darren Nielsen",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 96000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 228,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1996-12-06",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3247
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 3689
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 5341
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 7814
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8954
        }
      ],
      "features": []
    },
    {
      "uid": 101,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A dedicated animal lover who regularly collaborates with them to create knitted items for shelter animals",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Jessica Lowe",
      "post": [
        {
          "educationLevel": "College",
          "place": "WayHub",
          "department": "",
          "salary": 28000,
          "job": "Bus Driver"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.598,
            7.6221
          ],
          "place": "WayHub",
          "id": 1,
          "address": "River street, 10"
        },
        {
          "type": "home",
          "unit": 13,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1982-05-06",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 3672
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 8058
        }
      ],
      "features": []
    },
    {
      "uid": 102,
      "skills": [
        {
          "specialization": "Linguistics",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An enthusiastic salesperson who believes in the potential of the franchise and wants to be part of its success",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "The persona is a die-hard fan of the series \"Saints & Sinners\" from Harlem, New York, who often discusses TV shows, films, and celebrities in his local social club.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Heidi Moreno",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 70000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 754,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1994-10-13",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2095
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2634
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4091
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 4483
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 6492
        },
        {
          "type": "son",
          "id": 6,
          "relative": 6873
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 7349
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 8893
        }
      ],
      "features": []
    },
    {
      "uid": 103,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A teenager involved in a peer conflict looking to resolve issues without legal consequences",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 3,
          "name": "Cooking"
        }
      ],
      "gender": "Male",
      "displayName": "Paul Peck",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Hospital",
          "department": "",
          "salary": 39000,
          "job": "Pharmacist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 1643,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1983-10-19",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1792
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2822
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 4092
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 4904
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 5921
        },
        {
          "type": "son",
          "id": 6,
          "relative": 5955
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 6461
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 6918
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 7427
        },
        {
          "type": "brother",
          "id": 10,
          "relative": 7789
        },
        {
          "type": "nephew",
          "id": 11,
          "relative": 7924
        },
        {
          "type": "granddaughter",
          "id": 12,
          "relative": 8751
        },
        {
          "type": "grandson",
          "id": 13,
          "relative": 8857
        }
      ],
      "features": []
    },
    {
      "uid": 104,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A doctoral candidate seeking guidance on effectively organizing and citing research sources",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a PhD student interested in biomedical imaging currently deciding potential advisors:",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Language Learning"
        }
      ],
      "gender": "Female",
      "displayName": "Melissa Parks",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 21000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 13,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1970-06-30",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2558
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 7589
        }
      ],
      "features": []
    },
    {
      "uid": 105,
      "skills": [
        {
          "specialization": "Architecture",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "Vilnius Gediminas Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An Indian Tamil speaking movie buff who is fond of stand-up comedies and Yogi Babu's performances",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Karen Elliott",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Concert Hall",
          "department": "",
          "salary": 29000,
          "job": "Musician / Orchestra Member"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5957,
            7.5958
          ],
          "place": "Concert Hall",
          "id": 1,
          "address": "Glory street, 1"
        },
        {
          "type": "home",
          "unit": 1069,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1983-10-16",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2309
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3484
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6136
        },
        {
          "type": "brother",
          "id": 4,
          "relative": 6196
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 8503
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 9092
        }
      ],
      "features": []
    },
    {
      "uid": 106,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A college student majoring in film studies with an appreciation for all genres, including teen dramas",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A statistician who always advices on the adequate statistical processes",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Astronomy"
        }
      ],
      "gender": "Female",
      "displayName": "Sarah Smith",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "Administration",
          "salary": 37000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 29,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h3"
        }
      ],
      "birthDate": "1965-09-28",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2168
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2959
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4416
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5672
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 5714
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 6088
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 6698
        },
        {
          "type": "son",
          "id": 8,
          "relative": 7282
        }
      ],
      "features": []
    },
    {
      "uid": 107,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2007,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A policy advisor working to implement better safety regulations for firefighters",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An aerospace engineer who relies on defense contracts for their livelihood",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a seasoned backend developer who is well-versed in PHP and curl",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Camping"
        }
      ],
      "gender": "Female",
      "displayName": "Susan Dunlap",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 17000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 43,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h11"
        }
      ],
      "birthDate": "1984-04-03",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4229
        },
        {
          "type": "son",
          "id": 2,
          "relative": 5327
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5440
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8389
        }
      ],
      "features": []
    },
    {
      "uid": 108,
      "skills": [
        {
          "specialization": "Nursing",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 1997,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a young feminist poet from New Zealand who adores Dinah Hawken",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An acclaimed film producer who disagrees with the focus on personal lives over cinematic craft",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Thomas Gallegos",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 77000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 63,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h12"
        }
      ],
      "birthDate": "1974-10-11",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 2079
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2597
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3294
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 3399
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 5290
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 5495
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 5807
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 6691
        },
        {
          "type": "son",
          "id": 9,
          "relative": 7952
        },
        {
          "type": "nephew",
          "id": 10,
          "relative": 7954
        },
        {
          "type": "granddaughter",
          "id": 11,
          "relative": 9002
        }
      ],
      "features": []
    },
    {
      "uid": 109,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A naive civilian who is completely oblivious to the operative's secret life as a spy",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A stay-at-home parent who has their own list of recommended tutorial programs for children",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Volunteering"
        }
      ],
      "gender": "Male",
      "displayName": "Chris Nelson",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Restaurant 2",
          "department": "",
          "salary": 73000,
          "job": "Master Chef"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Restaurant 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 147,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1990-10-25",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2534
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4003
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4925
        },
        {
          "type": "brother",
          "id": 4,
          "relative": 5655
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6425
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 6945
        },
        {
          "type": "son",
          "id": 7,
          "relative": 7057
        }
      ],
      "features": []
    },
    {
      "uid": 110,
      "skills": [
        {
          "specialization": "Food Production",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "Bilim School of Agriculture"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A pastor who engages in deep discussions about the philosophical and spiritual dimensions of life and death",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a former TCS employee who left the company due to feelings of disengagement",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A beauty salon owner specializing in organic and natural treatments, who can recommend and use the organic skincare products in their services",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Nancy Jackson",
      "post": [
        {
          "educationLevel": "College",
          "place": "Gold Fish",
          "department": "",
          "salary": 26000,
          "job": "Fishery Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6004,
            7.5951
          ],
          "place": "Gold Fish",
          "id": 1,
          "address": "River street, 1"
        },
        {
          "type": "home",
          "unit": 24,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h12"
        }
      ],
      "birthDate": "1990-05-07",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1810
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2324
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 3601
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 4669
        },
        {
          "type": "brother-in-low",
          "id": 5,
          "relative": 5203
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 8876
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 8929
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 9008
        }
      ],
      "features": []
    },
    {
      "uid": 111,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1999,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a British veteran building and construction industry worker with no legal background.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "I am a die-hard fan of Penang F.C., deeply passionate about the team's history and performance.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a proud classmate of Rebekah Dawson who also studied astrophysics at Harvard",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Anthony Lee",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 68,
          "geo": [
            47.5894,
            7.6188
          ],
          "id": 1,
          "unit_type": "townhouses",
          "address": "townhouse 2"
        }
      ],
      "birthDate": "1976-10-13",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3002
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3716
        }
      ],
      "features": []
    },
    {
      "uid": 112,
      "skills": [
        {
          "specialization": "Computer Science",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2022,
          "type": "education",
          "name": "University of Zagreb"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A book author who gets inspiration from the ex-jockey's anecdotes for his next novel",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A night shift nurse who often sees the retired firefighter sitting outside, offering a sympathetic ear and a warm cup of tea",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "James Richard",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Andim",
          "department": "R&D",
          "salary": 98000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 62,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h11"
        }
      ],
      "birthDate": "1999-11-14",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2749
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 3346
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4315
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 6244
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 6264
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 8291
        }
      ],
      "features": []
    },
    {
      "uid": 113,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1997,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A business owner who has successfully established trade networks between South Asian countries",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A mathematician who provides inspiration and factual accuracy for complex mathematical ideas in stories",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "Norwegian historian focusing on medieval and early modern periods",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Billy Griffith",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 20000,
          "job": "Track Drivers"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 77,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h2"
        }
      ],
      "birthDate": "1974-07-07",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2730
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4074
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5566
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 8434
        }
      ],
      "features": []
    },
    {
      "uid": 114,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2018,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A frustrated citizen who occasionally vents their frustrations to the dispatcher, unaware of the dispatcher's commitment to helping them",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A power-driven capitalist who is a strong believer in laissez-faire economics",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A history-loving retiree in British Columbia who frequently tells stories of the province's past to grandchildren",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Kathleen Anderson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "Maintenance",
          "salary": 55000,
          "job": "Mechanical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 494,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1995-01-08",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2503
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3556
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4595
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 6197
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7544
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7564
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 8184
        }
      ],
      "features": []
    },
    {
      "uid": 115,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A physician specializing in the diagnosis and treatment of the diseases targeted by the biomarker research",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A factory worker who benefited from the improved working conditions fought for by the retired union organizer",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Volunteering"
        }
      ],
      "gender": "Female",
      "displayName": "Robin Welch",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "Administration",
          "salary": 38000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 38,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h1"
        }
      ],
      "birthDate": "1990-06-11",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 116,
      "skills": [
        {
          "specialization": "Psychology",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a proud alumnus of Lathallan School",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A graduate student who helps the college student understand complex programming concepts and algorithms",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A cautious parent skeptical of change but is invested in their child's education",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Lisa Lambert",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 81000,
          "job": "Biotechnologist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 34,
          "geo": [
            47.6016,
            7.6056
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 3, h6"
        }
      ],
      "birthDate": "1986-02-27",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3188
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4098
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4155
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5651
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 5665
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 6087
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 6347
        }
      ],
      "features": []
    },
    {
      "uid": 117,
      "skills": [
        {
          "specialization": "Medicine",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2012,
          "type": "education",
          "name": "University of Bologna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A career counselor at a local community college looking for resources to help advise students on transfer options to the university",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Scott Manning",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 78000,
          "job": "Quality Control Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 46,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h7"
        }
      ],
      "birthDate": "1989-12-05",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1998
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3192
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 3296
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 5197
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6593
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7007
        },
        {
          "type": "brother",
          "id": 7,
          "relative": 7594
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 8487
        }
      ],
      "features": []
    },
    {
      "uid": 118,
      "skills": [
        {
          "specialization": "Cybersecurity",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1998,
          "type": "education",
          "name": "Tallinn University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An experienced postdoctoral researcher who has published extensively in the field of geometric analysis",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A perinatal psychiatrist focused on the treatment of mood disorders during and after pregnancy",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Cindy Duffy",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Gold Fish",
          "department": "Management",
          "salary": 49000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6004,
            7.5951
          ],
          "place": "Gold Fish",
          "id": 1,
          "address": "River street, 1"
        },
        {
          "type": "home",
          "unit": 111,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h4"
        }
      ],
      "birthDate": "1975-03-13",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 3957
        },
        {
          "type": "son",
          "id": 2,
          "relative": 5534
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5630
        },
        {
          "type": "son",
          "id": 4,
          "relative": 7496
        }
      ],
      "features": []
    },
    {
      "uid": 119,
      "skills": [
        {
          "specialization": "Food Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2022,
          "type": "education",
          "name": "Odessa National Academy of Food Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A fellow digital arts student with a passion for environmental design in video games",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a homeowner in western Kentucky who also experienced the devastating 2021 tornado",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A renowned AI researcher and professor, offering insights and validation on the concept's feasibility",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Peter Johnson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Hospital",
          "department": "",
          "salary": 42000,
          "job": "Pharmacist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 1619,
          "geo": [
            47.5919,
            7.6261
          ],
          "id": 2,
          "unit_type": "townhouses",
          "address": "townhouse 1"
        }
      ],
      "birthDate": "1999-06-19",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3013
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4895
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 6287
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 6899
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 7030
        }
      ],
      "features": []
    },
    {
      "uid": 120,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A retired nature enthusiast who loves exploring the beautiful trails and parks in Boone",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a third-generation Israeli woman who is a feminist activist",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Juan French",
      "post": [
        {
          "educationLevel": "College",
          "place": "Gold Fish",
          "department": "",
          "salary": 20000,
          "job": "Fishery Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6004,
            7.5951
          ],
          "place": "Gold Fish",
          "id": 1,
          "address": "River street, 1"
        },
        {
          "type": "home",
          "unit": 18,
          "geo": [
            47.5898,
            7.6124
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 1, h4"
        }
      ],
      "birthDate": "1998-08-27",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 5189
        },
        {
          "type": "son",
          "id": 2,
          "relative": 8806
        }
      ],
      "features": []
    },
    {
      "uid": 125,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2023,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A middle-aged HR manager at a European firm that has no experience with cases of long COVID in the workplace",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a nostalgic music lover who was in high school back in 2009",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A retired army veteran finding a second career in retail management",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Thomas Lewis",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "Logistics",
          "salary": 40000,
          "job": "Logistics Coordinator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 50,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2000-06-23",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2693
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4453
        },
        {
          "type": "son",
          "id": 3,
          "relative": 9105
        }
      ],
      "features": []
    },
    {
      "uid": 182,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2011,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An avid enthusiast of 80s Italo Disco music.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A software engineer in B.C. who loves fishing",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A tech enthusiast who provides moral support, but wishes his best friend spent less time playing chess and more time in creating a YouTube channel together",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Nathan Ward",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 1",
          "department": "",
          "salary": 35000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5992,
            7.5994
          ],
          "place": "School 1",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 27,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1988-10-16",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 6740
        },
        {
          "type": "son",
          "id": 2,
          "relative": 8076
        }
      ],
      "features": []
    },
    {
      "uid": 307,
      "skills": [
        {
          "specialization": "Nursing",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An established Indian filmmaker who has studied and incorporated iconic techniques from Italian cinema",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An accomplished statistician who has authored several books on multivariate data analysis",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Joyce Larson",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "R&D",
          "salary": 86000,
          "job": "Chemical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 53,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-04-05",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1610
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2390
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 3793
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 4682
        },
        {
          "type": "son",
          "id": 5,
          "relative": 5391
        },
        {
          "type": "son",
          "id": 6,
          "relative": 6202
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 6522
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 7437
        },
        {
          "type": "grandson",
          "id": 9,
          "relative": 8911
        }
      ],
      "features": []
    },
    {
      "uid": 368,
      "skills": [
        {
          "specialization": "Marketing",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2008,
          "type": "education",
          "name": "International Business School Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A commercial satellite operator concerned about the impact of space debris on their operations and revenue",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A historical geographer who analyzes the influence of ancient civilizations on shaping territorial boundaries",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Model Building"
        }
      ],
      "gender": "Female",
      "displayName": "Karen Young",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Argo Industry",
          "department": "R&D",
          "salary": 77000,
          "job": "Chemical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 10,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1985-05-19",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2864
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4319
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4903
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5328
        },
        {
          "type": "son",
          "id": 5,
          "relative": 5701
        },
        {
          "type": "son",
          "id": 6,
          "relative": 8295
        }
      ],
      "features": []
    },
    {
      "uid": 415,
      "skills": [
        {
          "specialization": "Medicine",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2002,
          "type": "education",
          "name": "University of Bologna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An accused individual seeking legal representation and guidance throughout the entire trial process",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local business owner in Lancaster County who is politically moderate and values community involvement.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Robotics"
        }
      ],
      "gender": "Male",
      "displayName": "Daniel Pruitt",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 64000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 73,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1979-11-11",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 420,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A driven psychology major looking for guidance on how to navigate the competitive job market",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Matthew Gray",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 68000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 46,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1982-01-02",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2372
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 6017
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 7483
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 8511
        }
      ],
      "features": []
    },
    {
      "uid": 459,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A research assistant who is conducting a study on the effectiveness of VR in teaching mathematics",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A Dominican local herbalist deeply involved in traditional medicine and natural healing practices, somewhat skeptical of modern medicine",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A comic book editor who provides sneak peeks and behind-the-scenes insights on upcoming releases",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Susan French",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Administration",
          "salary": 30000,
          "job": "Administrative Assistant"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 12,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1996-05-08",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3195
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3317
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 6638
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 8585
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8898
        }
      ],
      "features": []
    },
    {
      "uid": 482,
      "skills": [
        {
          "specialization": "Sociology",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A community organizer who has decades of experience in promoting intercultural understanding",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A college student studying business management, intrigued by the retired project manager's success stories",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An ambitious economics major aspiring to work in a regulatory body to influence positive policy changes",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "George Perez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "Maintenance",
          "salary": 52000,
          "job": "Mechanical Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 69,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1998-02-06",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2268
        },
        {
          "type": "wife",
          "id": 2,
          "relative": 4034
        },
        {
          "type": "father",
          "id": 3,
          "relative": 5060
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 6632
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8690
        },
        {
          "type": "son",
          "id": 6,
          "relative": 8867
        }
      ],
      "features": []
    },
    {
      "uid": 513,
      "skills": [
        {
          "specialization": "Environmental Systems",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "Wageningen University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A former human resources manager fusing his experience with coding to manage the volunteer group’s logistics",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A huge Joji fan who has been following his music career since his YouTube days.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A representative from a payment processing company looking for a seamless integration with the project manager's system",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Jennifer Carpenter",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Safety",
          "salary": 47000,
          "job": "Environmental Health Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 30,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-11-23",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4551
        },
        {
          "type": "son",
          "id": 2,
          "relative": 7033
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7508
        }
      ],
      "features": []
    },
    {
      "uid": 538,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a Sri Lankan Tamil refugee in Australia who recently succeeded in getting her asylum claim accepted.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Brian Wang",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Hospital",
          "department": "",
          "salary": 63000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 23,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1981-02-20",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1593
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1958
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2420
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 3617
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4061
        },
        {
          "type": "father",
          "id": 6,
          "relative": 5104
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 5394
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 5470
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 6467
        },
        {
          "type": "niece",
          "id": 10,
          "relative": 6882
        },
        {
          "type": "daughter",
          "id": 11,
          "relative": 7407
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 7669
        },
        {
          "type": "daughter",
          "id": 13,
          "relative": 8717
        },
        {
          "type": "daughter",
          "id": 14,
          "relative": 8899
        }
      ],
      "features": []
    },
    {
      "uid": 591,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A talented athlete with exceptional physical abilities, but lacks knowledge in data analysis",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A reinsurance executive working together to mitigate potential financial risks for the company",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Daniel Taylor",
      "post": [
        {
          "educationLevel": "PhD",
          "place": "Private practitioner",
          "department": "",
          "salary": 48000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 17,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-07-23",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1589
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1634
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3117
        },
        {
          "type": "sister-in-low",
          "id": 4,
          "relative": 4268
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 5296
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 5677
        },
        {
          "type": "son",
          "id": 7,
          "relative": 5851
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 7044
        }
      ],
      "features": []
    },
    {
      "uid": 775,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A woman from South Africa currently living in Canada, who was a child during the 1984 incident and keen on revisiting her country's apartheid history.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A loyal member of the Belper Meadows Sports Club and avid fan of hockey",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Jessica Lopez",
      "post": [
        {
          "educationLevel": "College",
          "place": "Easy House",
          "department": "",
          "salary": 31000,
          "job": "Electrician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 9,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-12-10",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 3242
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3688
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4033
        }
      ],
      "features": []
    },
    {
      "uid": 883,
      "skills": [
        {
          "specialization": "Civil Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2021,
          "type": "education",
          "name": "University of Ljubljana"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An aspiring young coach who looks up to Justin Carrigan's career trajectory",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A person born and raised in Atlanta who is extremely passionate and protective about their city.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Cynthia Frank",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Private practitioner",
          "department": "",
          "salary": 45000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 21,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1998-03-30",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1622
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2698
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4535
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 5712
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7571
        }
      ],
      "features": []
    },
    {
      "uid": 925,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1998,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An Indian literature professor who is critical of British colonial rule",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A computer engineering student interested in data manipulation and C#.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Kyle Jimenez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Private practitioner",
          "department": "",
          "salary": 65000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 79,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1975-04-20",
      "socialRelations": [],
      "features": []
    },
    {
      "uid": 942,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A chess enthusiast who is a big fan of Yago De Moura Santiago",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Amanda Willis",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Private practitioner",
          "department": "",
          "salary": 47000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 31,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-11-30",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1578
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 4077
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4352
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 8887
        }
      ],
      "features": []
    },
    {
      "uid": 1016,
      "skills": [
        {
          "specialization": "Pharmacy",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A former RAF army man, now a farmer",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "an enthusiastic fan of Stan Smith",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Andrew Chavez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Hospital",
          "department": "",
          "salary": 60000,
          "job": "General Practitioner"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5894,
            7.6245
          ],
          "place": "Hospital",
          "id": 1,
          "address": "Forest street, 10"
        },
        {
          "type": "home",
          "unit": 76,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-07-17",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4185
        },
        {
          "type": "son",
          "id": 2,
          "relative": 5979
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7581
        }
      ],
      "features": []
    },
    {
      "uid": 1113,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1995,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A representative from a leading tech company partnering with the school to provide training and resources for teachers",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "The mayor who expects the city council member to prioritize fiscal responsibility",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Elizabeth Paul",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 29000,
          "job": "Production Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 13,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1972-01-20",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1869
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 4198
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 6841
        }
      ],
      "features": []
    },
    {
      "uid": 1167,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A renowned chess coach who has successfully guided many students through the college application process and scholarship opportunities",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An ACLU attorney who fought for DACA in court",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Roy Swanson",
      "post": [
        {
          "educationLevel": "College",
          "place": "Easy House",
          "department": "",
          "salary": 30000,
          "job": "Plumber"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 16,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1992-07-15",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 2093
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2584
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 4687
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 4715
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 8423
        }
      ],
      "features": []
    },
    {
      "uid": 1204,
      "skills": [
        {
          "specialization": "History",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2022,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An online group of parents and individuals with autism who share resources and support for navigating the special education system",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A motivated MBA candidate interested in applying operational theory to real-world business scenarios",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a medical doctor who has newly invented a potential solution to tackle cybersecurity for hospitals",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Vlogging"
        }
      ],
      "gender": "Female",
      "displayName": "Catherine Wise",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "Quality Control",
          "salary": 47000,
          "job": "Lab Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 15,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1999-02-09",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4785
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 8218
        }
      ],
      "features": []
    },
    {
      "uid": 1250,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2005,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a Sri Lankan expat living in Kuala Lumpur, Malaysia and a passionate foodie who loves to discover premium dining experiences in town.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A philanthropist who believes in the religious leader's message and generously contributes to their charitable endeavors",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Thomas Taylor",
      "post": [
        {
          "educationLevel": "Master",
          "place": "School 3",
          "department": "Management",
          "salary": 49000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5943,
            7.6205
          ],
          "place": "School 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 72,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1982-10-18",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 2900
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 4706
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6218
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 8636
        }
      ],
      "features": []
    },
    {
      "uid": 1271,
      "skills": [
        {
          "specialization": "Economics",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "University of Zagreb"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A food engineer from a competing company who challenges the food scientist's research findings",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A former prison guard conflicted by the activist's past and his current efforts",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local AI meetup organizer, bringing together AI enthusiasts for knowledge sharing",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Rodriguez",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 56000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 44,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1992-07-03",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1934
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2311
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 4589
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 4777
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 8035
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 8367
        }
      ],
      "features": []
    },
    {
      "uid": 1324,
      "skills": [
        {
          "specialization": "Journalism",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "European Humanities University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A web designer passionate about creating visually appealing websites while adhering to copyright laws",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A divorced couple seeking a fair settlement in their property division and custody arrangement",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Haynes",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "Management",
          "salary": 47000,
          "job": "Director"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 19,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-06-01",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 4232
        }
      ],
      "features": []
    },
    {
      "uid": 1427,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1991,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A tech-startup founder pursuing their master's degree part-time with a focus on Artificial Intelligence",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A kindergarten teacher who uses storytelling and role-playing to help children understand the importance of oral hygiene",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "an editor of a medical real estate news website",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Colleen Thompson",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 49,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1968-06-10",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 4335
        }
      ],
      "features": []
    },
    {
      "uid": 1432,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2012,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A novice user of SheetCam software",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A technology integration specialist who supports the principal in incorporating digital tools and resources into the economics curriculum",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Running"
        }
      ],
      "gender": "Female",
      "displayName": "Kelly Erickson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Office centre",
          "department": "",
          "salary": 46000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 38,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1989-08-10",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2960
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3270
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 4192
        },
        {
          "type": "sister",
          "id": 4,
          "relative": 7572
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8254
        }
      ],
      "features": []
    },
    {
      "uid": 1469,
      "skills": [
        {
          "specialization": "Computer Science",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "University of Cambridge"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A regulatory specialist who helps businesses understand and implement compliance requirements in their industry",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a high-school classmate of Emma Sralla who is also an athletic enthusiast.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Interior Design"
        }
      ],
      "gender": "Female",
      "displayName": "Jennifer Bates",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 35000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 39,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-08-22",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1782
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2411
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3464
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4269
        },
        {
          "type": "son",
          "id": 5,
          "relative": 7157
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 7513
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 7929
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 9137
        }
      ],
      "features": []
    },
    {
      "uid": 1519,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "an undergraduate student from Florida State University pursuing a degree in statistics who is fascinated by notable figures in the field",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A parent of a student who supports the union's efforts in ensuring quality education for all children",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a conservative New York voter who is generally opposed to Democratic policies",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Basketball"
        }
      ],
      "gender": "Female",
      "displayName": "Laura Willis",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 39000,
          "job": "Production Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 51,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-08-28",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 618
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2745
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3909
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 4936
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 6727
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 7543
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 7558
        },
        {
          "type": "niece",
          "id": 8,
          "relative": 8330
        }
      ],
      "features": []
    },
    {
      "uid": 1543,
      "skills": [
        {
          "specialization": "Public Administration",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "Harvard University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A software developer specializing in enterprise solutions for waste management companies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An environmental scientist studying the impact of soil management practices on water quality in African rivers",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A successful competitor who consistently ranks high in search engine results",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Sara Lara",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 68000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 80,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1996-10-13",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 395
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 3872
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 6773
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 7075
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 8224
        },
        {
          "type": "son",
          "id": 6,
          "relative": 8553
        }
      ],
      "features": []
    },
    {
      "uid": 1596,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A consultant specializing in organizational development and change management, providing guidance on scaling strategies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A part-time cashier who supports her partner's fight for workers’ rights while managing household finances",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 3,
          "name": "Writing"
        }
      ],
      "gender": "Female",
      "displayName": "Janet Ellis",
      "post": [
        {
          "educationLevel": null,
          "place": "Miscellaneous Store 4",
          "department": "",
          "salary": 21000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6016,
            7.6056
          ],
          "place": "Miscellaneous Store 4",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 40,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-02-23",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 462
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3175
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 3497
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 4186
        },
        {
          "type": "niece",
          "id": 5,
          "relative": 7500
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 8179
        }
      ],
      "features": []
    },
    {
      "uid": 1610,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2002,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An Irish literature professor with a passion for his country's theatrical history and a specific interest in the works of M.J. Molloy.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Sherri Larson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 68000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 59,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1979-09-24",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 307
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2390
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3793
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 4682
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 5391
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 6202
        },
        {
          "type": "son",
          "id": 7,
          "relative": 6522
        },
        {
          "type": "son",
          "id": 8,
          "relative": 7437
        }
      ],
      "features": []
    },
    {
      "uid": 1617,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2017,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "I am a historian specializing in the political history of the Democratic Republic of the Congo.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A highly competitive student who is both motivated and threatened by their classmate's helpfulness",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Timothy Ware",
      "post": [
        {
          "educationLevel": "College",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 33000,
          "job": "Plant Operator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 33,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1994-07-09",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 624
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2545
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 3985
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 8868
        },
        {
          "type": "nephew",
          "id": 5,
          "relative": 8909
        }
      ],
      "features": []
    },
    {
      "uid": 1634,
      "skills": [
        {
          "specialization": "Medicine",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "University of Bologna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A historical fiction author who uses historical events and military escapades as backdrops for their storytelling",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An author writing a book about resilience and the human spirit, inspired by their family member's journey through cancer",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Derek Taylor",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Office centre",
          "department": "",
          "salary": 55000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 22,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1983-03-06",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 591
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1589
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3117
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 4268
        },
        {
          "type": "son",
          "id": 5,
          "relative": 5296
        },
        {
          "type": "son",
          "id": 6,
          "relative": 5677
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 5851
        },
        {
          "type": "son",
          "id": 8,
          "relative": 7044
        },
        {
          "type": "grandson",
          "id": 9,
          "relative": 8164
        },
        {
          "type": "grandson",
          "id": 10,
          "relative": 8673
        },
        {
          "type": "granddaughter",
          "id": 11,
          "relative": 8784
        },
        {
          "type": "grandson",
          "id": 12,
          "relative": 8985
        }
      ],
      "features": []
    },
    {
      "uid": 1661,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "An entomologist who focuses on identifying and categorizing insect species",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A nurse who offers emotional support and accompanies the couple to medical appointments",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An experienced editor with a keen eye for uncovering hidden stories in the energy industry",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Teresa Todd",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 16000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 8,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1992-01-24",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 911
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2754
        }
      ],
      "features": []
    },
    {
      "uid": 1747,
      "skills": [
        {
          "specialization": "Marketing",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2018,
          "type": "education",
          "name": "International Business School Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A home improvement show host always on the lookout for the coolest eco-friendly designs",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A hospital IT specialist who ensures the security and confidentiality of patient information",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Ronnie Roberts",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Office centre",
          "department": "",
          "salary": 53000,
          "job": "IT Specialist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 6,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1995-07-02",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 639
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2272
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3405
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 4357
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4458
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 8432
        }
      ],
      "features": []
    },
    {
      "uid": 1793,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2006,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A pharmaceutical representative who provides the veterinary surgeon with the necessary medications and treatments for the cattle",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local artist who finds inspiration for their art in the peacefulness of the temple",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Kelly Smith",
      "post": [
        {
          "educationLevel": null,
          "place": "SPA Hotel",
          "department": "",
          "salary": 15000,
          "job": "Cleaning Staff"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 48,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1983-11-27",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 852
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1729
        },
        {
          "type": "father",
          "id": 3,
          "relative": 2401
        },
        {
          "type": "mother",
          "id": 4,
          "relative": 3599
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 3807
        },
        {
          "type": "sister-in-low",
          "id": 6,
          "relative": 4200
        },
        {
          "type": "son",
          "id": 7,
          "relative": 5385
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 6069
        },
        {
          "type": "niece",
          "id": 9,
          "relative": 6490
        },
        {
          "type": "nephew",
          "id": 10,
          "relative": 6553
        },
        {
          "type": "nephew",
          "id": 11,
          "relative": 6763
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 8631
        },
        {
          "type": "granddaughter",
          "id": 13,
          "relative": 8977
        }
      ],
      "features": []
    },
    {
      "uid": 1829,
      "skills": [
        {
          "specialization": "Philosophy",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Sorbonne University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An activist who wants to offer self-defense classes as a means of empowering marginalized groups",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 3,
          "name": "Pet Training"
        }
      ],
      "gender": "Male",
      "displayName": "Antonio Martinez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Office centre",
          "department": "",
          "salary": 47000,
          "job": "Lawyer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 63,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1992-12-27",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 222
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 2016
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 2421
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4018
        },
        {
          "type": "sister-in-low",
          "id": 5,
          "relative": 4028
        },
        {
          "type": "brother-in-low",
          "id": 6,
          "relative": 4241
        },
        {
          "type": "wife",
          "id": 7,
          "relative": 4264
        },
        {
          "type": "son",
          "id": 8,
          "relative": 6454
        },
        {
          "type": "niece",
          "id": 9,
          "relative": 6510
        },
        {
          "type": "nephew",
          "id": 10,
          "relative": 6871
        },
        {
          "type": "nephew",
          "id": 11,
          "relative": 7256
        },
        {
          "type": "daughter",
          "id": 12,
          "relative": 7266
        },
        {
          "type": "nephew",
          "id": 13,
          "relative": 7777
        },
        {
          "type": "niece",
          "id": 14,
          "relative": 7850
        },
        {
          "type": "nephew",
          "id": 15,
          "relative": 8456
        },
        {
          "type": "daughter",
          "id": 16,
          "relative": 8710
        }
      ],
      "features": []
    },
    {
      "uid": 1918,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1989,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A talented South African midfielder who has played in various soccer leagues across the country",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A science journalist who wants to enhance their articles with engaging explanations of scientific studies involving mathematics",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "Singing"
        }
      ],
      "gender": "Female",
      "displayName": "Linda Joseph",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Office centre",
          "department": "",
          "salary": 53000,
          "job": "Business Analyst / Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 55,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1966-04-08",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 362
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3119
        },
        {
          "type": "brother-in-low",
          "id": 3,
          "relative": 5238
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 7608
        }
      ],
      "features": []
    },
    {
      "uid": 1933,
      "skills": [
        {
          "specialization": "Material Science",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "National University of Science & Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A local artist using coffee bean husks to create sustainable art sculptures",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An equine photographer who captures stunning images of horses in various breeds and coat colors",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A fictional character who is a time traveler from the late 19th century, visiting the present day for the first time",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Nathan Lee",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Office centre",
          "department": "",
          "salary": 48000,
          "job": "Business Analyst / Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 74,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-12-14",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 679
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2388
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3327
        },
        {
          "type": "wife",
          "id": 4,
          "relative": 3335
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 6289
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 9118
        }
      ],
      "features": []
    },
    {
      "uid": 2073,
      "skills": [
        {
          "specialization": "Cybersecurity",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1999,
          "type": "education",
          "name": "Tallinn University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A fellow talent agent specializing in booking jazz vocalists for international gigs",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A Filipino working as an immigration consultant in Buenos Aires, Argentina.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A senior portfolio manager responsible for managing large investment portfolios",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Crystal Richards",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Office centre",
          "department": "",
          "salary": 55000,
          "job": "Business Analyst / Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5938,
            7.5998
          ],
          "place": "Office centre",
          "id": 1,
          "address": "Post square, 5"
        },
        {
          "type": "home",
          "unit": 67,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1976-06-14",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1309
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2870
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3720
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 4840
        },
        {
          "type": "son",
          "id": 5,
          "relative": 6107
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 7319
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 9143
        }
      ],
      "features": []
    },
    {
      "uid": 2104,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1995,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A tolerant and open-minded father who actively educates himself about LGBTQ+ issues",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A renowned astrobiologist who has made groundbreaking discoveries in the field of origins of life",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A retired blackjack dealer who appreciates the author's attention to detail in depicting casino environments",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Clayton Thomas",
      "post": [
        {
          "educationLevel": "College",
          "place": "Magistrate",
          "department": "",
          "salary": 43000,
          "job": "Police Officer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5931,
            7.5966
          ],
          "place": "Magistrate",
          "id": 1,
          "address": "Post square, 1"
        },
        {
          "type": "home",
          "unit": 36,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1972-06-06",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 388
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2346
        },
        {
          "type": "wife",
          "id": 3,
          "relative": 3976
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5978
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7327
        }
      ],
      "features": []
    },
    {
      "uid": 2110,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An old-time \"Counter-Strike\" player who is deeply nostalgic about classic maps and skeptical about changes to the game.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A curator of an Egyptian art museum who shares insights into the historical context and significance of the wall paintings",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Gardening"
        }
      ],
      "gender": "Female",
      "displayName": "Kendra Mcguire",
      "post": [
        {
          "educationLevel": "College",
          "place": "Andim",
          "department": "",
          "salary": 50000,
          "job": "Police Officer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 41,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-08-14",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 709
        },
        {
          "type": "father",
          "id": 2,
          "relative": 3144
        },
        {
          "type": "mother",
          "id": 3,
          "relative": 4879
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 6399
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 6530
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 8937
        }
      ],
      "features": []
    },
    {
      "uid": 2115,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2011,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A technology consultant with expertise in Bluetooth integration and wireless protocols",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Sewing"
        }
      ],
      "gender": "Male",
      "displayName": "Ryan Miller",
      "post": [
        {
          "educationLevel": "College",
          "place": "Magistrate",
          "department": "",
          "salary": 35000,
          "job": "Police Officer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5931,
            7.5966
          ],
          "place": "Magistrate",
          "id": 1,
          "address": "Post square, 1"
        },
        {
          "type": "home",
          "unit": 18,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1988-06-11",
      "socialRelations": [
        {
          "type": "brother",
          "id": 1,
          "relative": 1227
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2775
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 3830
        },
        {
          "type": "father",
          "id": 4,
          "relative": 4469
        },
        {
          "type": "son",
          "id": 5,
          "relative": 6286
        }
      ],
      "features": []
    },
    {
      "uid": 2142,
      "skills": [
        {
          "specialization": "Music",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A working professional studying part-time to transition into a career in forensic accounting",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A local business owner who supports the math teacher's efforts to promote numeracy skills in the area",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Pet Training"
        }
      ],
      "gender": "Male",
      "displayName": "Jason Bowers",
      "post": [
        {
          "educationLevel": "College",
          "place": "SPA Hotel",
          "department": "",
          "salary": 21000,
          "job": "Beauty Therapist / Masseuse"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5875,
            7.6291
          ],
          "place": "SPA Hotel",
          "id": 1,
          "address": "Lake street, 1"
        },
        {
          "type": "home",
          "unit": 5,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1996-01-27",
      "socialRelations": [
        {
          "type": "sister",
          "id": 1,
          "relative": 1403
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2988
        },
        {
          "type": "father",
          "id": 3,
          "relative": 3631
        },
        {
          "type": "brother-in-low",
          "id": 4,
          "relative": 3737
        },
        {
          "type": "wife",
          "id": 5,
          "relative": 4916
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 6321
        },
        {
          "type": "niece",
          "id": 7,
          "relative": 7198
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 7341
        },
        {
          "type": "daughter",
          "id": 9,
          "relative": 7600
        }
      ],
      "features": []
    },
    {
      "uid": 2260,
      "skills": [
        {
          "specialization": "Leadership",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1979,
          "type": "education",
          "name": "Harvard University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A technology entrepreneur with innovative solutions for improving financial risk assessment",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A supportive and involved mother who travels the world to watch her child compete in tennis tournaments",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A cannabis dispensary owner looking to expand their online presence and reach a wider audience",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Cody Weber",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 47,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1956-05-03",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 399
        },
        {
          "type": "son",
          "id": 2,
          "relative": 2182
        },
        {
          "type": "daughter-in-low",
          "id": 3,
          "relative": 5080
        },
        {
          "type": "daughter-in-low",
          "id": 4,
          "relative": 5199
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 7219
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 7793
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 8054
        }
      ],
      "features": []
    },
    {
      "uid": 2262,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1976,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A professional tennis player who came to England to participate in Wimbledon.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "an assistant manager at a rehab center who has been helping various drug addicts rebuild their lives.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Susan Bowman",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 32,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1953-06-18",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 2
        },
        {
          "type": "son-in-low",
          "id": 2,
          "relative": 5023
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5821
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 6517
        }
      ],
      "features": []
    },
    {
      "uid": 2390,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1967,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A software engineer who developed a popular mobile app at a young age",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Jeffrey Larson",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 59,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1944-01-26",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 1610
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 307
        },
        {
          "type": "son-in-low",
          "id": 3,
          "relative": 3793
        },
        {
          "type": "son-in-low",
          "id": 4,
          "relative": 4682
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 5391
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 6202
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 6522
        },
        {
          "type": "grandson",
          "id": 8,
          "relative": 7437
        }
      ],
      "features": []
    },
    {
      "uid": 2520,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1978,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An enthusiastic couple therapist",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a male chef who respects female chefs in his industry",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A kinesiology student conducting research on the effects of different diets on swimmers' performance",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Andrea Tran",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 25,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1955-02-12",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 1472
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4137
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6157
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 8246
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 8384
        },
        {
          "type": "granddaughter",
          "id": 6,
          "relative": 8416
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 9041
        }
      ],
      "features": []
    },
    {
      "uid": 2543,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 1,
          "type": "work experience",
          "comment": "A professional truck builder known for pushing the boundaries of design and performance",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An alumna of UC Berkeley who majored in English and has a deep love for the history and architecture of the university",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A sociologist conducting research on the impact of social movements and offering emotional support",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Ana Mathis",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 18000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 26,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1950-04-10",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 412
        },
        {
          "type": "son",
          "id": 2,
          "relative": 2180
        },
        {
          "type": "daughter-in-low",
          "id": 3,
          "relative": 3409
        },
        {
          "type": "husband",
          "id": 4,
          "relative": 3495
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 5493
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 6212
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 6647
        },
        {
          "type": "grandson",
          "id": 8,
          "relative": 6838
        }
      ],
      "features": []
    },
    {
      "uid": 2780,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1973,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A novice web developer trying to understand how to implement Trumbowyg, a WYSIWYG editor.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A fiscal conservative who questions the effectiveness of the finance minister's policies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A resident of Bydgoszcz, Poland, with a great appreciation of local art and history.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Matthew Smith",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 3,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1950-02-19",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 816
        },
        {
          "type": "grandson",
          "id": 2,
          "relative": 6955
        }
      ],
      "features": []
    },
    {
      "uid": 2833,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1998,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An art teacher who incorporates miniature scenery into her students' diorama projects",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A homeowner whose house has a moisture problem in the crawlspace",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A startup founder who is developing a disruptive software application in the same domain",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Heather Rogers",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Argo Industry",
          "department": "Maintenance",
          "salary": 35000,
          "job": "Electrician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 45,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1975-02-04",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 1180
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4656
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5564
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6674
        }
      ],
      "features": []
    },
    {
      "uid": 2853,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1979,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A younger sibling who is obsessed with Tim Arnold's music and always looking forward to the artist's new releases",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A business owner who prefers traditional marketing methods and wants to host an in-person event",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A socially engaged facilitator for discussions on equity and inclusion",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Valerie Stutz",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 17000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 34,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1956-05-02",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 765
        },
        {
          "type": "son-in-low",
          "id": 2,
          "relative": 3307
        },
        {
          "type": "grandson",
          "id": 3,
          "relative": 6617
        }
      ],
      "features": []
    },
    {
      "uid": 2923,
      "skills": [
        {
          "specialization": "Design",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1990,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A senior journalist with years of experience in investigative reporting, providing guidance on uncovering the psychiatrist's untold stories",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A commodities broker specializing in energy markets, sharing insights on trading strategies",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Photography Club"
        }
      ],
      "gender": "Female",
      "displayName": "Katie Diaz",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Andim",
          "department": "Maintenance",
          "salary": 47000,
          "job": "Electrician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 24,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1967-12-08",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 53
        },
        {
          "type": "daughter-in-low",
          "id": 2,
          "relative": 3866
        },
        {
          "type": "husband",
          "id": 3,
          "relative": 3974
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 8182
        }
      ],
      "features": []
    },
    {
      "uid": 2946,
      "skills": [
        {
          "specialization": "Nursing",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1980,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A respected professor of Balkan Studies known for their comprehensive knowledge of the region's history and culture",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A graphic designer who specializes in creating eye-catching coupon graphics for the blogger's website",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A highly organized linguistics graduate with excellent multitasking abilities and a passion for charity work",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Shaban Frick",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 35,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1957-05-01",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 1156
        },
        {
          "type": "daughter-in-low",
          "id": 2,
          "relative": 3251
        },
        {
          "type": "grandson",
          "id": 3,
          "relative": 8409
        }
      ],
      "features": []
    },
    {
      "uid": 3062,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1996,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A busy film producer who needs help maintaining their professional appearance amid hectic schedules",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A dedicated biology major who spends long hours studying and appreciates the graphic design major's consideration for their need for quiet",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Sherry Rice",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Argo Industry",
          "department": "IT",
          "salary": 35000,
          "job": "IT Support Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 56,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1973-02-15",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 38
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 3521
        },
        {
          "type": "daughter-in-low",
          "id": 3,
          "relative": 3619
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 6629
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 8678
        }
      ],
      "features": []
    },
    {
      "uid": 3077,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1978,
          "type": "education",
          "name": "Andim Polytechnic University"
        }
      ],
      "gender": "Female",
      "displayName": "Deanna Stone",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 43,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1955-03-22",
      "socialRelations": [
        {
          "type": "son",
          "id": 1,
          "relative": 1216
        },
        {
          "type": "husband",
          "id": 2,
          "relative": 4088
        },
        {
          "type": "granddaughter",
          "id": 3,
          "relative": 5254
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5702
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 6032
        }
      ],
      "features": []
    },
    {
      "uid": 3107,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1979,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a retired police force chief who now writes car accident reviews for a local newspaper",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "a marine biologist who specializes in the study of jellyfish",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A younger sibling of the child who looks up to the alumnus parent's scientific achievements and seeks guidance in their own academic pursuits",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Gina Harper",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 7,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1956-06-25",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 581
        },
        {
          "type": "son-in-low",
          "id": 2,
          "relative": 3602
        },
        {
          "type": "grandson",
          "id": 3,
          "relative": 5589
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 6194
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 6703
        }
      ],
      "features": []
    },
    {
      "uid": 3119,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1952,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A web designer passionate about creating visually appealing websites while adhering to copyright laws",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A novice Haskell developer interested in configuration management in his applications.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A concerned spouse who encourages the construction worker to prioritize safety and provides support",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Diana Joseph",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 55,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1929-09-26",
      "socialRelations": [
        {
          "type": "daughter",
          "id": 1,
          "relative": 1918
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 362
        },
        {
          "type": "son-in-low",
          "id": 3,
          "relative": 5238
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 7608
        }
      ],
      "features": []
    },
    {
      "uid": 3317,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A legal journalist covering news related to Native American tribal law",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 4,
          "name": "DIY Projects"
        }
      ],
      "gender": "Male",
      "displayName": "Daniel French",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Easy House",
          "department": "",
          "salary": 44000,
          "job": "Construction Engineer"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 12,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-10-30",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 459
        },
        {
          "type": "father-in-low",
          "id": 2,
          "relative": 3195
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 8585
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 8898
        }
      ],
      "features": []
    },
    {
      "uid": 3335,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2020,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "I am a Tanzanian aspiring female footballer, inspired by the success of female athletes in a traditionally male-dominated field.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A New Mexico resident who has a low income and is a member of the Medicaid program",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A passionate and loyal fan of Tom Brock's music.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Maria Lee",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Phatmacy 3",
          "department": "",
          "salary": 41000,
          "job": "Pharmacist"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5944,
            7.6129
          ],
          "place": "Phatmacy 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 74,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1997-01-27",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1933
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 679
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2388
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 9118
        }
      ],
      "features": []
    },
    {
      "uid": 3405,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A blogger and social media influencer who shares tips and tricks on hair regrowth methods",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A sceptical employee of Netlifi.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A financial consultant specializing in small business operations, providing guidance on integrating technology into payment processes",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Language Learning"
        }
      ],
      "gender": "Female",
      "displayName": "Jennifer Roberts",
      "post": [
        {
          "educationLevel": "College",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 36000,
          "job": "Plant Operator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 6,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1993-04-17",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1747
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 639
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 2272
        }
      ],
      "features": []
    },
    {
      "uid": 3495,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1970,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A screenwriter who brings practical industry experience to the classroom",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Terrance Mathis",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 26,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1947-09-13",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 2543
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 412
        },
        {
          "type": "son",
          "id": 3,
          "relative": 2180
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 5493
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 6838
        }
      ],
      "features": []
    },
    {
      "uid": 3521,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1986,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A fervent University of North Carolina Chapel Hill fan who decorates the office in sky blue for game days",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An eco-tourism guide who uses the sound engineer's recordings to enhance the nature-focused tours they lead",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A small business owner who relies on the blogger's recommendations to select the most suitable digital platforms for their company",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Troy Rice",
      "post": [
        {
          "educationLevel": "College",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 31000,
          "job": "Plant Operator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 56,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1963-12-11",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 3062
        },
        {
          "type": "son",
          "id": 2,
          "relative": 38
        },
        {
          "type": "daughter-in-low",
          "id": 3,
          "relative": 3619
        },
        {
          "type": "granddaughter",
          "id": 4,
          "relative": 6629
        },
        {
          "type": "granddaughter",
          "id": 5,
          "relative": 8678
        }
      ],
      "features": []
    },
    {
      "uid": 3688,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A third-year student who has unsuccessfully applied for the Grayer fellowship in the same year",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A politically engaged history teacher with an interest in recent British politics and a skeptical view of coalition governments.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Larry Lopez",
      "post": [
        {
          "educationLevel": "College",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 33000,
          "job": "Plant Operator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 9,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1981-10-16",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 775
        },
        {
          "type": "father-in-low",
          "id": 2,
          "relative": 3242
        }
      ],
      "features": []
    },
    {
      "uid": 3793,
      "skills": [
        {
          "specialization": "Agronomy",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2004,
          "type": "education",
          "name": "Bilim School of Agriculture"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A business owner who incorporates religious symbolism in their branding strategy",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a Vietnamese farmer who doesn't understand English",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Mahmoud Larson",
      "post": [
        {
          "educationLevel": "College",
          "place": "Argo Industry",
          "department": "Production",
          "salary": 41000,
          "job": "Plant Operator"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 59,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1981-09-15",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1610
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 307
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 2390
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6202
        },
        {
          "type": "son",
          "id": 5,
          "relative": 6522
        },
        {
          "type": "son",
          "id": 6,
          "relative": 7437
        }
      ],
      "features": []
    },
    {
      "uid": 3974,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1984,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A music producer who creates explicit rap songs that frequently echo through the walls",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An underwater welder who assists in repairing and maintaining the structural integrity of offshore platforms",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A child beta reader who provides honest and valuable feedback from a target audience perspective",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Phillip Diaz",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Andim",
          "department": "Maintenance",
          "salary": 32000,
          "job": "Maintenance Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 24,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1961-02-27",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 2923
        },
        {
          "type": "son",
          "id": 2,
          "relative": 53
        }
      ],
      "features": []
    },
    {
      "uid": 3976,
      "skills": [
        {
          "specialization": "Tourism",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1992,
          "type": "education",
          "name": "Andim College of Tourism & Hospitality"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A judge with a fascinating insight into law and its practical usage in the justice system",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A culture writer who recognizes the importance of this leader's contribution and seeks to spread awareness through their articles",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A high school student interested in marketing and participating in the alumna's mentorship program",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Collecting (stamps, coins)"
        }
      ],
      "gender": "Female",
      "displayName": "Sydney Thomas",
      "post": [
        {
          "educationLevel": "Vocational Training",
          "place": "Argo Industry",
          "department": "Maintenance",
          "salary": 42000,
          "job": "Maintenance Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 36,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1969-05-06",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 2104
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 388
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2346
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5978
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7327
        }
      ],
      "features": []
    },
    {
      "uid": 4034,
      "skills": [
        {
          "specialization": "Business",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2014,
          "type": "education",
          "name": "University of Andim"
        }
      ],
      "gender": "Female",
      "displayName": "Debra Perez",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 1",
          "department": "",
          "salary": 34000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5992,
            7.5994
          ],
          "place": "School 1",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 69,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1991-09-17",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 482
        },
        {
          "type": "mother-in-low",
          "id": 2,
          "relative": 2268
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 8690
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8867
        }
      ],
      "features": []
    },
    {
      "uid": 4088,
      "skills": [
        {
          "specialization": "Public Administration",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1973,
          "type": "education",
          "name": "Harvard University"
        }
      ],
      "gender": "Male",
      "displayName": "Christopher Stone",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 43,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1950-08-21",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 3077
        },
        {
          "type": "son",
          "id": 2,
          "relative": 1216
        },
        {
          "type": "granddaughter",
          "id": 3,
          "relative": 5254
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5702
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 6032
        }
      ],
      "features": []
    },
    {
      "uid": 4137,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 1979,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A junior faculty member excited about incorporating data science methods in their research",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An author writing a historical fiction novel centered around medical discoveries",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Nicholas Tran",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 25,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1956-12-25",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 2520
        },
        {
          "type": "son",
          "id": 2,
          "relative": 1472
        },
        {
          "type": "son",
          "id": 3,
          "relative": 6157
        },
        {
          "type": "grandson",
          "id": 4,
          "relative": 8246
        },
        {
          "type": "grandson",
          "id": 5,
          "relative": 8384
        },
        {
          "type": "granddaughter",
          "id": 6,
          "relative": 8416
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 9041
        }
      ],
      "features": []
    },
    {
      "uid": 4185,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Technical University of Munich"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A charismatic and media-savvy player who has successfully secured numerous endorsement deals",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Robotics"
        }
      ],
      "gender": "Female",
      "displayName": "Karen Chavez",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Miscellaneous Store 5",
          "department": "",
          "salary": 38000,
          "job": "Shop Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5992,
            7.5994
          ],
          "place": "Miscellaneous Store 5",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 76,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-09-29",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1016
        },
        {
          "type": "son",
          "id": 2,
          "relative": 5979
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7581
        }
      ],
      "features": []
    },
    {
      "uid": 4186,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An excited resident of the Ichamati district.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "I am a medieval historian fascinated with the evolution of administrative divisions, particularly in Britain, due to the intricate melding of Anglo-Saxon and Norman institutions.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A multi-instrumentalist who forms a strong musical bond with the younger brother, bringing diverse musical influences to the band",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Camping"
        }
      ],
      "gender": "Male",
      "displayName": "John Ellis",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Grocery Store 8",
          "department": "",
          "salary": 38000,
          "job": "Shop Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5943,
            7.6205
          ],
          "place": "Grocery Store 8",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 40,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1987-04-25",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1596
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 462
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 3175
        }
      ],
      "features": []
    },
    {
      "uid": 4192,
      "skills": [
        {
          "specialization": "Economics",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2012,
          "type": "education",
          "name": "University of Warsaw"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A diabetic patient looking for delicious low-sugar dessert recipes",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "a supportive parent in search of a reliable babysitter",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Michael Erickson",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Grocery Store 3",
          "department": "",
          "salary": 40000,
          "job": "Shop Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6048,
            7.6045
          ],
          "place": "Grocery Store 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 38,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1989-09-07",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1432
        },
        {
          "type": "mother-in-low",
          "id": 2,
          "relative": 2960
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 3270
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8254
        }
      ],
      "features": []
    },
    {
      "uid": 4232,
      "skills": [
        {
          "specialization": "Political Science",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "University of Warsaw"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A user experience designer who believes that GUIs are unnecessary and that command line interfaces are more efficient",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A historian speculating on the implications of religious education on societal development in the Bengal region.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A retail worker knowledgeable about the lifestyle products endorsed by the influencer",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Monique Haynes",
      "post": [
        {
          "educationLevel": "Master",
          "place": "Andim",
          "department": "",
          "salary": 42000,
          "job": "Shop Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 19,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1990-06-03",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1324
        }
      ],
      "features": []
    },
    {
      "uid": 4264,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 2008,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A retired trumpeter who reminisces about their touring days and desires to write a memoir",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A developmental editor who clarifies and streamlines all types of written content",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Stephanie Martinez",
      "post": [
        {
          "educationLevel": "College",
          "place": "Gold Fish",
          "department": "",
          "salary": 21000,
          "job": "Fishery Technician"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6004,
            7.5951
          ],
          "place": "Gold Fish",
          "id": 1,
          "address": "River street, 1"
        },
        {
          "type": "home",
          "unit": 63,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1985-05-13",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1829
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 222
        },
        {
          "type": "sister-in-low",
          "id": 3,
          "relative": 2016
        },
        {
          "type": "mother-in-low",
          "id": 4,
          "relative": 2421
        },
        {
          "type": "father-in-low",
          "id": 5,
          "relative": 4018
        },
        {
          "type": "son",
          "id": 6,
          "relative": 6454
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 7256
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 7266
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 7777
        },
        {
          "type": "niece",
          "id": 10,
          "relative": 7850
        },
        {
          "type": "daughter",
          "id": 11,
          "relative": 8710
        }
      ],
      "features": []
    },
    {
      "uid": 4319,
      "skills": [
        {
          "specialization": "Construction",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2007,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "An Iranian millennial who is into tech and generally does not care about politics, history or military issues.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "An event organizer who plans fan meetups and watch parties for Leicester Lions' races",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Aaron Young",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 10,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1984-03-16",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 368
        },
        {
          "type": "father-in-low",
          "id": 2,
          "relative": 2864
        },
        {
          "type": "son",
          "id": 3,
          "relative": 5328
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5701
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8295
        }
      ],
      "features": []
    },
    {
      "uid": 4335,
      "skills": [
        {
          "specialization": "Medicine",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 1982,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A virtual reality content creator sharing their experiences and creations on a popular online platform",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A history teacher who believes that traditional textbooks are the most effective way to teach history",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A fellow portfolio manager who challenges the input persona's approach to responsible investing",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Timothy Thompson",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 49,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1959-03-28",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1427
        }
      ],
      "features": []
    },
    {
      "uid": 4352,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A dedicated officer striving to become the youngest prison warden in history",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Allen Willis",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 19000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 31,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-08-25",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 942
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 1578
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 8887
        }
      ],
      "features": []
    },
    {
      "uid": 4453,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2019,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A policymaker who credits the Nobel laureate's guidance for their success in implementing effective economic policies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A research analyst specializing in a different sector, providing a different perspective on investment opportunities",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Janet Lewis",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "WayHub",
          "department": "",
          "salary": 31000,
          "job": "Traffic Planner"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.598,
            7.6221
          ],
          "place": "WayHub",
          "id": 1,
          "address": "River street, 10"
        },
        {
          "type": "home",
          "unit": 50,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1996-08-24",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 125
        },
        {
          "type": "father-in-low",
          "id": 2,
          "relative": 2693
        },
        {
          "type": "son",
          "id": 3,
          "relative": 9105
        }
      ],
      "features": []
    },
    {
      "uid": 4535,
      "skills": [
        {
          "specialization": "Law",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2010,
          "type": "education",
          "name": "University of Bologna"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A talented screenwriter with a unique perspective on the balance between copyright protection and creative freedom",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A renowned aerospace engineer known for their advancements in thermal management systems",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A business writer who explores the impact of corporate culture on organizational success",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Eric Frank",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 39000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 21,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1987-12-25",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 883
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 1622
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2698
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 5712
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7571
        }
      ],
      "features": []
    },
    {
      "uid": 4551,
      "skills": [
        {
          "specialization": "Chemical Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2009,
          "type": "education",
          "name": "Kaunas University of Technology"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A former school principal who enjoys engaging in intellectually stimulating debates on the pros and cons of digitalization on tea mornings",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A dedicated fan blogger who writes articles defending the criticized players and their performances",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Kevin Carpenter",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 4",
          "department": "",
          "salary": 33000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5898,
            7.6124
          ],
          "place": "School 4",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 30,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1986-03-11",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 513
        },
        {
          "type": "son",
          "id": 2,
          "relative": 7033
        },
        {
          "type": "son",
          "id": 3,
          "relative": 7508
        }
      ],
      "features": []
    },
    {
      "uid": 4575,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A celebrity chef known for creating innovative sports-themed menus for hotel guests during major sporting events",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A retired librarian passionate about Moldovan history and cultural preservation, particularly interested in the challenges and resurgence of Moldovan national identity post-Soviet Union.",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "John Watanabe",
      "post": [
        {
          "educationLevel": null,
          "place": "School 4",
          "department": "",
          "salary": 19000,
          "job": "Admin / Assistants"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5898,
            7.6124
          ],
          "place": "School 4",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1981-06-01",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 37
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 2227
        },
        {
          "type": "niece",
          "id": 3,
          "relative": 5625
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 5627
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7209
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 7224
        },
        {
          "type": "son",
          "id": 7,
          "relative": 7868
        },
        {
          "type": "nephew",
          "id": 8,
          "relative": 7906
        }
      ],
      "features": []
    },
    {
      "uid": 4589,
      "skills": [
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An English university professor specialized in political communication, having a focus on campaign communication and interested in diverse cultural contexts, particularly the U.S.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "As a PR person for a competitor brand but admiring Coca-Cola for its strategic leadership team placements and its global impact.",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Cynthia Rodriguez",
      "post": [
        {
          "educationLevel": null,
          "place": "Argo Industry",
          "department": "Logistics",
          "salary": 28000,
          "job": "Warehouse Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.601,
            7.618
          ],
          "place": "Argo Industry",
          "id": 1,
          "address": "Railway street, 1"
        },
        {
          "type": "home",
          "unit": 44,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1993-05-10",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1271
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 1934
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 2311
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 8035
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 8367
        }
      ],
      "features": []
    },
    {
      "uid": 4656,
      "skills": [
        {
          "specialization": "Architecture",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 1989,
          "type": "education",
          "name": "Vilnius Gediminas Technical University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A hardworking honor roll student who often runs tutorial sessions for his classmates",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A socialist writer who challenges their libertarian viewpoints and engages in respectful disagreement",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Raymond Rogers",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 3",
          "department": "",
          "salary": 38000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5943,
            7.6205
          ],
          "place": "School 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 45,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1966-01-19",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 2833
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 1180
        },
        {
          "type": "daughter",
          "id": 3,
          "relative": 5564
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6674
        }
      ],
      "features": []
    },
    {
      "uid": 4682,
      "skills": [
        {
          "specialization": "Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2003,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A supportive niece who works as a LGBTQI+ rights advocate, promoting inclusive mental health policies",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A musician who was inspired by their professor's passion for folk music and went on to pursue a successful career in the genre",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A gothic bookstore owner who has written a groundbreaking debut horror novel in secret",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Painting"
        }
      ],
      "gender": "Male",
      "displayName": "Michael Larson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 2",
          "department": "",
          "salary": 36000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6016,
            7.6056
          ],
          "place": "School 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 53,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1980-06-17",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 307
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 1610
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 2390
        },
        {
          "type": "son",
          "id": 4,
          "relative": 5391
        },
        {
          "type": "son",
          "id": 5,
          "relative": 6202
        },
        {
          "type": "nephew",
          "id": 6,
          "relative": 6522
        },
        {
          "type": "grandson",
          "id": 7,
          "relative": 8911
        }
      ],
      "features": []
    },
    {
      "uid": 4715,
      "skills": [
        {
          "specialization": "Natural Sciences",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "University of Cambridge"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "An experienced field technician overseeing excavations in the Caucasus region",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A high school soccer coach who has followed the career of Shuichi Gonda and has a keen interest in player development and management.",
          "name": null
        },
        {
          "type": "activity",
          "time": 1,
          "id": 5,
          "name": "Yoga"
        }
      ],
      "gender": "Female",
      "displayName": "Danielle Swanson",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 2",
          "department": "",
          "salary": 41000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6016,
            7.6056
          ],
          "place": "School 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 16,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1993-02-08",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 1167
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 2093
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2584
        }
      ],
      "features": []
    },
    {
      "uid": 4785,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2013,
          "type": "education",
          "name": "University of Andim"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A writer and poet who contributes original narratives and poetry to accompany the digital artwork",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A condo owner who just started learning about bankruptcy laws",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Marcello Wise",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 16000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 15,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1990-03-19",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1204
        },
        {
          "type": "daughter",
          "id": 2,
          "relative": 8218
        }
      ],
      "features": []
    },
    {
      "uid": 4840,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "College",
          "id": 1,
          "graduationYear": 1993,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "a Hawaiian local who is fond of mushroom hunting.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A quantitative researcher who argues that qualitative research lacks objectivity and rigor",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A social media influencer targeted by online hackers due to their large following",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Bobby Richards",
      "post": [
        {
          "educationLevel": "College",
          "place": "Hotel 2",
          "department": "",
          "salary": 27000,
          "job": "Supply Chain Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.591,
            7.6158
          ],
          "place": "Hotel 2",
          "id": 1,
          "address": "Flower street, 2"
        },
        {
          "type": "home",
          "unit": 67,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1970-09-12",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 2073
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 1309
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2870
        },
        {
          "type": "son",
          "id": 4,
          "relative": 6107
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7319
        },
        {
          "type": "grandson",
          "id": 6,
          "relative": 9143
        }
      ],
      "features": []
    },
    {
      "uid": 4916,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2015,
          "type": "education",
          "name": "Andim Polytechnic University"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 2,
          "type": "work experience",
          "comment": "A sociologist studying the social and health benefits of parks and their impact on community well-being",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A retired Argentine footballer who religiously follows local football leagues and passionately discusses them over games of Domino with friends at the local club.",
          "name": null
        },
        {
          "specialization": null,
          "time": 1,
          "id": 4,
          "type": "work experience",
          "comment": "A city council member who advocates for the ski resort and helps secure funding for infrastructure improvements",
          "name": null
        }
      ],
      "gender": "Female",
      "displayName": "Cynthia Bowers",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 34000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 5,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1992-12-04",
      "socialRelations": [
        {
          "type": "husband",
          "id": 1,
          "relative": 2142
        },
        {
          "type": "sister-in-low",
          "id": 2,
          "relative": 1403
        },
        {
          "type": "mother-in-low",
          "id": 3,
          "relative": 2988
        },
        {
          "type": "father-in-low",
          "id": 4,
          "relative": 3631
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 6321
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 7198
        },
        {
          "type": "daughter",
          "id": 7,
          "relative": 7341
        },
        {
          "type": "daughter",
          "id": 8,
          "relative": 7600
        }
      ],
      "features": []
    },
    {
      "uid": 4936,
      "skills": [
        {
          "specialization": "Food Engineering",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2016,
          "type": "education",
          "name": "Odessa National Academy of Food Tech"
        },
        {
          "specialization": null,
          "time": 1,
          "id": 3,
          "type": "work experience",
          "comment": "A relationship counselor who is also a country music aficionado",
          "name": null
        }
      ],
      "gender": "Male",
      "displayName": "Jose Willis",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "School 4",
          "department": "",
          "salary": 42000,
          "job": "School Teacher"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5898,
            7.6124
          ],
          "place": "School 4",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 51,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1993-05-12",
      "socialRelations": [
        {
          "type": "wife",
          "id": 1,
          "relative": 1519
        },
        {
          "type": "brother-in-low",
          "id": 2,
          "relative": 618
        },
        {
          "type": "father-in-low",
          "id": 3,
          "relative": 2745
        },
        {
          "type": "niece",
          "id": 4,
          "relative": 6727
        },
        {
          "type": "daughter",
          "id": 5,
          "relative": 7543
        },
        {
          "type": "daughter",
          "id": 6,
          "relative": 7558
        }
      ],
      "features": []
    },
    {
      "uid": 5296,
      "skills": [
        {
          "specialization": "Urban Planning",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2027,
          "type": "education",
          "name": "Lund University"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "DIY Projects"
        }
      ],
      "gender": "Male",
      "displayName": "Gerald Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 22,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2004-06-05",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 4268
        },
        {
          "type": "father",
          "id": 2,
          "relative": 1634
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 591
        },
        {
          "type": "uncle",
          "id": 4,
          "relative": 1589
        },
        {
          "type": "grandfather",
          "id": 5,
          "relative": 3117
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 5677
        },
        {
          "type": "cousin",
          "id": 7,
          "relative": 5851
        },
        {
          "type": "brother",
          "id": 8,
          "relative": 7044
        },
        {
          "type": "son",
          "id": 9,
          "relative": 8164
        },
        {
          "type": "son",
          "id": 10,
          "relative": 8673
        },
        {
          "type": "niece",
          "id": 11,
          "relative": 8784
        },
        {
          "type": "son",
          "id": 12,
          "relative": 8985
        }
      ],
      "features": []
    },
    {
      "uid": 5328,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2028,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Football"
        }
      ],
      "gender": "Male",
      "displayName": "David Young",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 18000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 10,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2005-02-15",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 368
        },
        {
          "type": "grandfather",
          "id": 2,
          "relative": 2864
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4319
        },
        {
          "type": "grandmother",
          "id": 4,
          "relative": 4903
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 5701
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 8295
        }
      ],
      "features": []
    },
    {
      "uid": 5385,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2029,
          "type": "education",
          "name": "National University of Science & Tech"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Singing"
        }
      ],
      "gender": "Male",
      "displayName": "Mark Smith",
      "post": [
        {
          "educationLevel": null,
          "place": "Andim",
          "department": "",
          "salary": 22000,
          "job": "Admin / Assistants"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 48,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2006-04-26",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 1793
        },
        {
          "type": "uncle",
          "id": 2,
          "relative": 852
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 1729
        },
        {
          "type": "grandfather",
          "id": 4,
          "relative": 2401
        },
        {
          "type": "grandmother",
          "id": 5,
          "relative": 3599
        },
        {
          "type": "aunt",
          "id": 6,
          "relative": 3807
        },
        {
          "type": "aunt",
          "id": 7,
          "relative": 4200
        },
        {
          "type": "sister",
          "id": 8,
          "relative": 6069
        },
        {
          "type": "cousin",
          "id": 9,
          "relative": 6490
        },
        {
          "type": "cousin",
          "id": 10,
          "relative": 6553
        },
        {
          "type": "cousin",
          "id": 11,
          "relative": 6763
        },
        {
          "type": "cousin",
          "id": 12,
          "relative": 8631
        },
        {
          "type": "niece",
          "id": 13,
          "relative": 8977
        }
      ],
      "features": []
    },
    {
      "uid": 5391,
      "skills": [],
      "gender": "Male",
      "displayName": "Aaron Larson",
      "post": [
        {
          "educationLevel": null,
          "place": "Grocery Store 2",
          "department": "",
          "salary": 17000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5951,
            7.6297
          ],
          "place": "Grocery Store 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 53,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2001-02-13",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 4682
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 307
        },
        {
          "type": "aunt",
          "id": 3,
          "relative": 1610
        },
        {
          "type": "grandfather",
          "id": 4,
          "relative": 2390
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 6202
        },
        {
          "type": "cousin",
          "id": 6,
          "relative": 6522
        },
        {
          "type": "son",
          "id": 7,
          "relative": 8911
        }
      ],
      "features": []
    },
    {
      "uid": 5564,
      "skills": [
        {
          "specialization": "Mechanics",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2025,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Chess"
        }
      ],
      "gender": "Female",
      "displayName": "Sarah Rogers",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 45,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2002-10-14",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 4656
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2833
        },
        {
          "type": "sister",
          "id": 3,
          "relative": 1180
        },
        {
          "type": "brother",
          "id": 4,
          "relative": 6674
        }
      ],
      "features": []
    },
    {
      "uid": 5627,
      "skills": [
        {
          "specialization": "Environmental Systems",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2028,
          "type": "education",
          "name": "Wageningen University"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Music (playing instrument)"
        }
      ],
      "gender": "Female",
      "displayName": "Sakura Watanabe",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 1,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2005-08-01",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 37
        },
        {
          "type": "aunt",
          "id": 2,
          "relative": 2227
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4575
        },
        {
          "type": "cousin",
          "id": 4,
          "relative": 5625
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 7209
        },
        {
          "type": "cousin",
          "id": 6,
          "relative": 7224
        },
        {
          "type": "brother",
          "id": 7,
          "relative": 7868
        },
        {
          "type": "cousin",
          "id": 8,
          "relative": 7906
        }
      ],
      "features": []
    },
    {
      "uid": 5677,
      "skills": [
        {
          "specialization": "Chemistry",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2028,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Calligraphy"
        }
      ],
      "gender": "Male",
      "displayName": "Christopher Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": "Easy House",
          "department": "",
          "salary": 19000,
          "job": "Road Maintenance Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5908,
            7.602
          ],
          "place": "Easy House",
          "id": 1,
          "address": "Flower street, 7"
        },
        {
          "type": "home",
          "unit": 22,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2005-11-11",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 4268
        },
        {
          "type": "father",
          "id": 2,
          "relative": 1634
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 591
        },
        {
          "type": "uncle",
          "id": 4,
          "relative": 1589
        },
        {
          "type": "grandfather",
          "id": 5,
          "relative": 3117
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 5296
        },
        {
          "type": "cousin",
          "id": 7,
          "relative": 5851
        },
        {
          "type": "brother",
          "id": 8,
          "relative": 7044
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 8164
        },
        {
          "type": "nephew",
          "id": 10,
          "relative": 8673
        },
        {
          "type": "daughter",
          "id": 11,
          "relative": 8784
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 8985
        }
      ],
      "features": []
    },
    {
      "uid": 5701,
      "skills": [
        {
          "specialization": "Psychology",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2027,
          "type": "education",
          "name": "University of Tartu"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Theatre (acting)"
        }
      ],
      "gender": "Male",
      "displayName": "Mark Young",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 10,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2004-06-13",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 368
        },
        {
          "type": "grandfather",
          "id": 2,
          "relative": 2864
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4319
        },
        {
          "type": "grandmother",
          "id": 4,
          "relative": 4903
        },
        {
          "type": "brother",
          "id": 5,
          "relative": 5328
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 8295
        }
      ],
      "features": []
    },
    {
      "uid": 5702,
      "skills": [],
      "gender": "Female",
      "displayName": "Kelsey Stone",
      "post": [
        {
          "educationLevel": null,
          "place": "School 2",
          "department": "",
          "salary": 22000,
          "job": "Admin / Assistants"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6016,
            7.6056
          ],
          "place": "School 2",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 43,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2006-09-07",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 4088
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 3077
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 1216
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 6032
        }
      ],
      "features": []
    },
    {
      "uid": 5821,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2027,
          "type": "education",
          "name": "University of Helsinki"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Singing"
        }
      ],
      "gender": "Female",
      "displayName": "Crystal Bowman",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 32,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2004-02-12",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2262
        },
        {
          "type": "sister",
          "id": 2,
          "relative": 2
        }
      ],
      "features": []
    },
    {
      "uid": 5851,
      "skills": [
        {
          "specialization": "Sustainability",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2028,
          "type": "education",
          "name": "Lund University"
        }
      ],
      "gender": "Male",
      "displayName": "James Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": "Clothing Store 3",
          "department": "",
          "salary": 21000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.6016,
            7.6056
          ],
          "place": "Clothing Store 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 17,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2005-12-15",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 591
        },
        {
          "type": "uncle",
          "id": 2,
          "relative": 1589
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 1634
        },
        {
          "type": "grandfather",
          "id": 4,
          "relative": 3117
        },
        {
          "type": "aunt",
          "id": 5,
          "relative": 4268
        },
        {
          "type": "cousin",
          "id": 6,
          "relative": 5296
        },
        {
          "type": "cousin",
          "id": 7,
          "relative": 5677
        },
        {
          "type": "cousin",
          "id": 8,
          "relative": 7044
        }
      ],
      "features": []
    },
    {
      "uid": 5978,
      "skills": [
        {
          "specialization": "Fine Arts",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2025,
          "type": "education",
          "name": "Bilim Art School"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Drawing"
        }
      ],
      "gender": "Male",
      "displayName": "Miguel Thomas",
      "post": [
        {
          "educationLevel": null,
          "place": "School 3",
          "department": "",
          "salary": 20000,
          "job": "Admin / Assistants"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5943,
            7.6205
          ],
          "place": "School 3",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 36,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2002-11-14",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 3976
        },
        {
          "type": "father",
          "id": 2,
          "relative": 2104
        },
        {
          "type": "aunt",
          "id": 3,
          "relative": 388
        },
        {
          "type": "grandmother",
          "id": 4,
          "relative": 2346
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 7327
        }
      ],
      "features": []
    },
    {
      "uid": 5979,
      "skills": [
        {
          "specialization": "Logistics",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2027,
          "type": "education",
          "name": "Riga Technical University"
        }
      ],
      "gender": "Male",
      "displayName": "Carlos Chavez",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 17000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 76,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2004-12-29",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 4185
        },
        {
          "type": "father",
          "id": 2,
          "relative": 1016
        },
        {
          "type": "brother",
          "id": 3,
          "relative": 7581
        }
      ],
      "features": []
    },
    {
      "uid": 6017,
      "skills": [
        {
          "specialization": "IT",
          "educationLevel": "Vocational Training",
          "id": 1,
          "graduationYear": 2029,
          "type": "education",
          "name": "Bilim Technical College"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Video Gaming"
        }
      ],
      "gender": "Female",
      "displayName": "Hannah Gray",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 46,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2006-01-30",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 420
        },
        {
          "type": "grandmother",
          "id": 2,
          "relative": 2372
        },
        {
          "type": "sister",
          "id": 3,
          "relative": 7483
        },
        {
          "type": "son",
          "id": 4,
          "relative": 8511
        }
      ],
      "features": []
    },
    {
      "uid": 6069,
      "skills": [
        {
          "specialization": "Pharmacy",
          "educationLevel": "PhD",
          "id": 1,
          "graduationYear": 2025,
          "type": "education",
          "name": "Andim School of Medicine"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Video Gaming"
        }
      ],
      "gender": "Female",
      "displayName": "Kristen Smith",
      "post": [
        {
          "educationLevel": null,
          "place": "Bilim Farms",
          "department": "",
          "salary": 19000,
          "job": "Agricultural Worker"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5972,
            7.6261
          ],
          "place": "Bilim Farms",
          "id": 1,
          "address": "Railway street, 22"
        },
        {
          "type": "home",
          "unit": 48,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2002-09-28",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 1793
        },
        {
          "type": "uncle",
          "id": 2,
          "relative": 852
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 1729
        },
        {
          "type": "grandfather",
          "id": 4,
          "relative": 2401
        },
        {
          "type": "grandmother",
          "id": 5,
          "relative": 3599
        },
        {
          "type": "aunt",
          "id": 6,
          "relative": 3807
        },
        {
          "type": "aunt",
          "id": 7,
          "relative": 4200
        },
        {
          "type": "brother",
          "id": 8,
          "relative": 5385
        },
        {
          "type": "cousin",
          "id": 9,
          "relative": 6490
        },
        {
          "type": "cousin",
          "id": 10,
          "relative": 6553
        },
        {
          "type": "cousin",
          "id": 11,
          "relative": 6763
        },
        {
          "type": "cousin",
          "id": 12,
          "relative": 8631
        },
        {
          "type": "daughter",
          "id": 13,
          "relative": 8977
        }
      ],
      "features": []
    },
    {
      "uid": 6107,
      "skills": [
        {
          "specialization": "Pharmacy",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2023,
          "type": "education",
          "name": "Andim School of Medicine"
        }
      ],
      "gender": "Male",
      "displayName": "Kenneth Richards",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 25000,
          "job": "Agronomist/Farm Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 67,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2000-12-28",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 4840
        },
        {
          "type": "mother",
          "id": 2,
          "relative": 2073
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 1309
        },
        {
          "type": "grandmother",
          "id": 4,
          "relative": 2870
        },
        {
          "type": "sister",
          "id": 5,
          "relative": 7319
        },
        {
          "type": "son",
          "id": 6,
          "relative": 9143
        }
      ],
      "features": []
    },
    {
      "uid": 6157,
      "skills": [
        {
          "specialization": "Education",
          "educationLevel": "Bachelor",
          "id": 1,
          "graduationYear": 2022,
          "type": "education",
          "name": "University of Helsinki"
        }
      ],
      "gender": "Male",
      "displayName": "Thomas Tran",
      "post": [
        {
          "educationLevel": "Bachelor",
          "place": "Andim",
          "department": "",
          "salary": 33000,
          "job": "Agronomist/Farm Manager"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5,
            7.5
          ],
          "place": "Andim",
          "id": 1,
          "address": "Andim"
        },
        {
          "type": "home",
          "unit": 25,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 1,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "1999-06-30",
      "socialRelations": [
        {
          "type": "mother",
          "id": 1,
          "relative": 2520
        },
        {
          "type": "brother",
          "id": 2,
          "relative": 1472
        },
        {
          "type": "father",
          "id": 3,
          "relative": 4137
        },
        {
          "type": "nephew",
          "id": 4,
          "relative": 8246
        },
        {
          "type": "son",
          "id": 5,
          "relative": 8384
        },
        {
          "type": "niece",
          "id": 6,
          "relative": 8416
        },
        {
          "type": "nephew",
          "id": 7,
          "relative": 9041
        }
      ],
      "features": []
    },
    {
      "uid": 6218,
      "skills": [
        {
          "specialization": "Logistics",
          "educationLevel": "Master",
          "id": 1,
          "graduationYear": 2025,
          "type": "education",
          "name": "Riga Technical University"
        },
        {
          "type": "activity",
          "time": 1,
          "id": 2,
          "name": "Camping"
        }
      ],
      "gender": "Male",
      "displayName": "Cole Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": null,
          "department": null,
          "salary": 6000,
          "job": "unemployed"
        }
      ],
      "geography": [
        {
          "type": "home",
          "unit": 72,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2002-12-30",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 1250
        },
        {
          "type": "grandfather",
          "id": 2,
          "relative": 2900
        },
        {
          "type": "grandmother",
          "id": 3,
          "relative": 4706
        },
        {
          "type": "daughter",
          "id": 4,
          "relative": 8636
        }
      ],
      "features": []
    },
    {
      "uid": 7044,
      "skills": [
        {
          "type": "activity",
          "time": 1,
          "id": 1,
          "name": "Board Games"
        }
      ],
      "gender": "Male",
      "displayName": "Kevin Taylor",
      "post": [
        {
          "educationLevel": null,
          "place": "Grocery Store 8",
          "department": "",
          "salary": 18000,
          "job": "Retail Cashier"
        }
      ],
      "geography": [
        {
          "type": "work",
          "geo": [
            47.5943,
            7.6205
          ],
          "place": "Grocery Store 8",
          "id": 1,
          "address": "Post square, 3"
        },
        {
          "type": "home",
          "unit": 22,
          "geo": [
            47.5943,
            7.6205
          ],
          "id": 2,
          "unit_type": "apartments",
          "address": "osbb 2, h8"
        }
      ],
      "birthDate": "2006-10-06",
      "socialRelations": [
        {
          "type": "father",
          "id": 1,
          "relative": 1634
        },
        {
          "type": "uncle",
          "id": 2,
          "relative": 591
        },
        {
          "type": "uncle",
          "id": 3,
          "relative": 1589
        },
        {
          "type": "grandfather",
          "id": 4,
          "relative": 3117
        },
        {
          "type": "mother",
          "id": 5,
          "relative": 4268
        },
        {
          "type": "brother",
          "id": 6,
          "relative": 5296
        },
        {
          "type": "brother",
          "id": 7,
          "relative": 5677
        },
        {
          "type": "cousin",
          "id": 8,
          "relative": 5851
        },
        {
          "type": "nephew",
          "id": 9,
          "relative": 8164
        },
        {
          "type": "nephew",
          "id": 10,
          "relative": 8673
        },
        {
          "type": "niece",
          "id": 11,
          "relative": 8784
        },
        {
          "type": "nephew",
          "id": 12,
          "relative": 8985
        }
      ],
      "features": []
    }
  ]
}
```

---

### Collection: `discussions`
- **Document Count:** 192
- **Semantic Concept:** Discussions thread metadata, participant lists, cached ISR and relevance scores (`relevance_scores`, `isr_scores`).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `created_at` | `string` | No |
| `creator_uid` | `string` | No |
| `discussion_id` | `integer` | No |
| `isr_scores` | `map` | No |
| `last_message_sender_name` | `string` | No |
| `last_message_sender_uid` | `string` | No |
| `last_message_text` | `string` | No |
| `last_message_timestamp` | `string` | No |
| `message_count` | `integer` | No |
| `participants` | `array<string, integer>` | No |
| `relevance_scores` | `map` | No |
| `topic` | `string` | No |

#### Redacted Example Document
```json
{
  "topic": "EV charger queuing system",
  "created_at": "2025-06-28T16:45:00",
  "last_message_sender_uid": "37",
  "discussion_id": 1,
  "relevance_scores": {
    "147": 0.804,
    "415": 0.2,
    "125": 0.337,
    "307": 0.334,
    "182": 0.2,
    "...": "(14 more keys)"
  },
  "last_message_timestamp": "2025-06-28T17:42:00",
  "message_count": 10,
  "isr_scores": {
    "147": 1.21,
    "415": 0.3,
    "125": 0.51,
    "307": 0.5,
    "182": 0.3,
    "...": "(14 more keys)"
  },
  "creator_uid": "37",
  "last_message_text": "Let's keep this constructive, everyone. I think we have some good options on the table. Should we put together a small committee to research the options and present findings next week? I can coordinate if others volunteer to help.",
  "last_message_sender_name": "Mio Watanabe",
  "participants": [
    "37",
    37,
    "415",
    415,
    "1905",
    "... (33 more elements)"
  ]
}
```

---

### Collection: `discussions/{discussion_id}/messages`
- **Document Count:** 1,694
- **Semantic Concept:** Discussion messages, nested children (`child`, `parentID`), emoji reaction marks (`marks`).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `child` | `array<empty>, array<integer>` | No |
| `id` | `integer` | No |
| `marks` | `array<string, map>, array<string>` | No |
| `parentID` | `integer` | Yes |
| `text` | `string` | No |
| `timestamp` | `string` | No |
| `uid` | `string` | No |

#### Redacted Example Document
```json
{
  "uid": "37",
  "child": [
    2,
    3,
    5,
    7,
    10
  ],
  "id": 1,
  "text": "Hi everyone! I noticed we're having issues with the EV chargers being occupied all evening. The app developer mentioned they can implement a virtual queue system, but it would need access to our vehicles' charge status. What are everyone's thoughts on this? Privacy concerns vs convenience?",
  "marks": [
    "good",
    "flood"
  ],
  "timestamp": "2025-06-28T16:45:00"
}
```

---

### Collection: `issues`
- **Document Count:** 80
- **Semantic Concept:** Issues/votings/options/votes, AI Analyzer outputs (weights, mu/sigma envelopes, demographic filters, resources_needed), geography (`location`, `affection_distance`), cached ISR values.

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `affection_distance` | `float` | No |
| `aggregation_reasoning` | `string` | No |
| `category` | `string` | No |
| `created_at` | `string` | No |
| `deadline_votes` | `map` | Yes |
| `description` | `string` | No |
| `ends` | `string` | No |
| `expertise_depth` | `string` | No |
| `expertise_domain` | `string` | No |
| `isr_scores` | `map` | No |
| `last_message_sender_name` | `string` | No |
| `last_message_sender_uid` | `string` | No |
| `last_message_text` | `string` | No |
| `last_message_timestamp` | `string` | No |
| `location` | `GeoPoint` | No |
| `message_count` | `integer` | No |
| `mu_distance_meters` | `integer` | No |
| `options` | `array<map>` | No |
| `participants` | `array<string, integer>` | No |
| `relevance_reasoning` | `string` | No |
| `relevance_scores` | `map` | No |
| `sigma_decay_meters` | `integer` | No |
| `status` | `string` | No |
| `submitter_id` | `string` | No |
| `tasks` | `array<map>` | Yes |
| `title` | `string` | No |
| `votes` | `map` | Yes |
| `w_contribution` | `float` | No |
| `w_demographic` | `float` | No |
| `w_education` | `float` | No |
| `w_experience` | `float` | No |
| `w_expertise` | `float` | No |
| `w_geographic` | `float` | No |
| `w_relevance` | `float` | No |
| `w_resources` | `float` | No |
| `w_semantic` | `float` | No |
| `w_social` | `float` | No |
| `winning_option_index` | `integer` | Yes |

#### Redacted Example Document
```json
{
  "relevance_scores": {
    "1250": 0.85,
    "883": 0.85,
    "1610": 0.85,
    "513": 0.85,
    "1432": 0.85
  },
  "w_resources": 0.3,
  "w_geographic": 0.6,
  "description": "",
  "w_relevance": 0.7,
  "last_message_text": "I can volunteer to monitor the schedule and ensure noise stays low during study slots.",
  "relevance_reasoning": "Noise levels affect residents in nearby units. Geographic proximity is primary, with demographics as secondary.",
  "w_social": 0.1,
  "w_demographic": 0.2,
  "participants": [
    "513",
    513,
    "883",
    883,
    "1250",
    "... (25 more elements)"
  ],
  "last_message_sender_uid": "1432",
  "location": "GeoPoint(lat=47.5943, lon=7.6205)",
  "status": "in_process",
  "title": "Quiet study corner",
  "created_at": "2025-06-28T21:22:00",
  "w_education": 0.3,
  "w_experience": 0.4,
  "mu_distance_meters": 60,
  "category": "general.civic",
  "w_expertise": 0.1,
  "last_message_timestamp": "2025-06-28T21:55:00",
  "isr_scores": {
    "1250": 1.28,
    "883": 1.28,
    "1610": 1.28,
    "513": 1.28,
    "1432": 1.28
  },
  "options": [
    {
      "label": "Option A: Local Direct Fix",
      "score": 0
    },
    {
      "label": "Option B: External Contractor Hire",
      "score": 0
    }
  ],
  "aggregation_reasoning": "Acoustic comfort is an experiential issue where lived relevance dominates.",
  "expertise_depth": "None",
  "ends": "2026-06-09",
  "submitter_id": "1432",
  "affection_distance": 0.06,
  "sigma_decay_meters": 50,
  "message_count": 6,
  "w_semantic": 0.1,
  "w_contribution": 0.2,
  "expertise_domain": "Acoustic Control",
  "last_message_sender_name": "Kelly Erickson"
}
```

---

### Collection: `microcommunities`
- **Document Count:** 192
- **Semantic Concept:** Ad-hoc publics (microcommunities), issue linkages, shared Vector of Values (`values_taxonomy`).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `created_at` | `Timestamp` | No |
| `issue_id` | `string` | No |
| `issue_scope` | `integer` | No |
| `member_accepted` | `integer` | No |
| `member_count` | `integer` | No |
| `microcommunity_id` | `string` | No |
| `status` | `string` | No |
| `threshold_relevance` | `float` | No |
| `values_taxonomy` | `map` | No |

#### Redacted Example Document
```json
{
  "member_count": 18,
  "created_at": "2026-05-30 08:08:15.728000+00:00",
  "threshold_relevance": 0.15,
  "member_accepted": 18,
  "microcommunity_id": "1",
  "status": "active",
  "issue_scope": 0,
  "values_taxonomy": {
    "conflict_resolution": "<list len=36>",
    "contextual_shifts": {
      "crisis": [
        -20,
        9,
        33,
        9,
        4,
        -13,
        23,
        17,
        1,
        9
      ],
      "private": [
        12,
        0,
        -3,
        0,
        4,
        16,
        0,
        -5,
        11,
        2
      ],
      "work": [
        7,
        -3,
        14,
        9,
        -2,
        -1,
        1,
        14,
        -1,
        10
      ],
      "family": [
        -3,
        20,
        4,
        0,
        4,
        2,
        9,
        -1,
        1,
        -3
      ]
    },
    "domains": [
      82,
      76,
      79,
      83,
      77,
      79,
      86,
      88,
      56,
      71
    ],
    "items": "<dict domains=['d10', 'd8', 'd9', 'd7', 'd3', 'd1', 'd6', 'd5', 'd4', 'd2']>"
  },
  "issue_id": "1"
}
```

---

### Collection: `microcommunity_members`
- **Document Count:** 3,099
- **Semantic Concept:** Ad-hoc public memberships, cached ISR values (`isr_score`), score breakdowns (D, G, S, X, education, experience, resources, relevance).

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `D_score` | `float` | No |
| `G_score` | `float` | No |
| `S_score` | `float` | No |
| `X_score` | `float` | No |
| `accepted_rejected` | `null` | Yes |
| `calculated_at` | `Timestamp` | No |
| `contribution_score` | `float` | No |
| `displayName` | `string` | No |
| `education_expertise` | `float` | No |
| `experience_expertise` | `float` | No |
| `expertise_score` | `float` | No |
| `isr_score` | `float` | No |
| `microcommunity_id` | `string` | No |
| `normalized_contribution` | `float` | No |
| `normalized_experience` | `float` | No |
| `normalized_relevance` | `float` | No |
| `relevance_score` | `float` | No |
| `resources_expertise` | `float` | No |
| `user_id` | `integer` | No |

#### Redacted Example Document
```json
{
  "G_score": 0.525,
  "experience_expertise": 0.332,
  "expertise_score": 2.605,
  "displayName": "[REDACTED]",
  "user_id": 1,
  "accepted_rejected": null,
  "resources_expertise": 0.0,
  "contribution_score": 0.0,
  "normalized_relevance": 1.24,
  "normalized_contribution": 1.0,
  "relevance_score": 0.62,
  "isr_score": 1.087,
  "education_expertise": 2.272,
  "D_score": 1.0,
  "normalized_experience": 0.836,
  "microcommunity_id": "100",
  "X_score": 0.0,
  "calculated_at": "2026-05-30 10:57:24.184000+00:00",
  "S_score": 0.316
}
```

---

### Collection: `actions`
- **Document Count:** 1,188
- **Semantic Concept:** Tasks/actions/contribution logs, action vectors (`vector_data`), marks, complexity, sentiment scalars, time hours.

#### Field Dictionary
| Field Name | Inferred Types | Nullable in Sample |
|---|---|---|
| `action_id` | `string` | No |
| `action_name` | `string` | No |
| `action_text` | `string` | No |
| `action_type` | `string` | No |
| `complexity` | `float` | No |
| `created_at` | `string` | No |
| `issue_id` | `string` | No |
| `issue_name` | `string` | No |
| `marks` | `array<empty>, array<map>` | No |
| `result_factor` | `float` | No |
| `sentiment_scalar` | `float` | No |
| `time_hours` | `float` | No |
| `type_weight` | `float` | No |
| `uid` | `string` | No |
| `vector_data` | `map` | No |

#### Redacted Example Document
```json
{
  "issue_id": "38",
  "created_at": "2025-07-06T00:00:00Z",
  "action_text": "User performed Security Camera Audit on Compost bin fruit flies.",
  "result_factor": 0.9176539816166399,
  "marks": [
    {
      "uid": "1324",
      "mark": -1
    },
    {
      "uid": "4589",
      "mark": -1
    },
    {
      "uid": "1167",
      "mark": -1
    },
    {
      "uid": "4656",
      "mark": -1
    }
  ],
  "issue_name": "Compost bin fruit flies",
  "action_type": "chat_msg",
  "action_id": "00289bd3-9996-498c-86f9-3bfb2ea7ff4e",
  "sentiment_scalar": -2.0,
  "uid": "7044",
  "action_name": "Security Camera Audit",
  "vector_data": {
    "conflict_resolution": "<list len=36>",
    "contextual_shifts": {
      "crisis": 45,
      "private": 16,
      "work": 50,
      "family": 14
    },
    "domains": [
      -24,
      -52,
      33,
      -28,
      -98,
      91,
      -73,
      62,
      4,
      94
    ],
    "items": "<list len=145>",
    "domains_grounding": 0.9584166062251029,
    "domains_confidence": 0.8456910050035802
  },
  "complexity": 1.4221529226952678,
  "type_weight": 0.5098695963873983,
  "time_hours": 2.5786984840284823
}
```

---

## 3. Absent Collections (Verified NOT PRESENT)

- **`voting (collection)`**: NOT PRESENT - Issues in voting phase reside within the `issues` collection (`status: in_process`).
- **`tasks (collection)`**: NOT PRESENT - Tasks reside as embedded task structures or within `issues` (`status: tasks`).
- **`values (collection)`**: NOT PRESENT - Values narratives and taxonomies are stored embedded in `users` and in repository files (`db/values-vector.json`, `db/values1-1025text.json`).
- **`contributions (collection)`**: NOT PRESENT - Contribution actions reside in the `actions` collection.
- **`logs (collection)`**: NOT PRESENT - No centralized logs collection exists in Firestore.
- **`embeddings (collection)`**: NOT PRESENT as named collection - Embeddings are stored in the `user_vectors` collection.
