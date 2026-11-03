# ISR Issue Request Guide: User-Facing Template

## For Issue Submitters: How to Create a Proper Issue Request

---

## Step 1: Write Clear Issue Description

### What to Include

Write a description that answers these questions:

```
📍 WHERE: Which specific location(s) are affected?
   Example: "Building entrance at 457 Main St, apt complex"
   
❓ WHAT: What is the problem?
   Example: "The door lock is broken and won't open"
   
⚠️ IMPACT: Who does it affect? How does it affect them?
   Example: "Residents can't lock their apartments; security risk"
   
🕐 WHEN: Is this ongoing or urgent?
   Example: "Broken for 3 days, needs immediate fix"
   
💡 CONTEXT: Any relevant background?
   Example: "Similar issue 6 months ago, building manager not responding"
   
⚖️ RULES: Who decides under local rules, and who owns it?
   Example: "Traffic on public streets is decided by the city transport department (link)"
```

### Good vs. Bad Examples

**❌ BAD** (too vague):
```
"Problems at the building"
```

**✅ GOOD** (clear and specific):
```
"Broken water pipe in basement of 457 Main St apartment complex 
is leaking into storage rooms. Affects all 24 residents' property 
and creates mold risk. Water company says it's owner's responsibility 
to fix, but building manager not responding."
```

---

## Step 2: System Suggests: Issue Category

### How It Works

**System analyzes your description** and suggests a category:

```
Your Description:
"Broken lock on apartment door at 457 Main St, can't open"

System Suggests:
📁 Category: building.security.locks

✏️ Is this correct? [Yes, Confirm] [No, Help me choose]
```

### Category Options

The system will suggest from these categories:

| Domain | Category | Examples |
|--------|----------|----------|
| **Building** | `building.security.*` | Door locks, windows, gates |
| | `building.maintenance.*` | Heating, noise, water, roof |
| **Infrastructure** | `infrastructure.transport.*` | Parking, paths, traffic |
| | `infrastructure.utilities.*` | Water, electricity, internet |
| **Social/Community** | `social.event.*` | Sports, cultural, community events |
| | `community.governance.*` | Budget decisions, policies |
| **Environment** | `environment.green_space.*` | Parks, trees, gardens |
| **Health** | `health.access.*` | Medication, clinics, services |

**If system suggests wrong category**, you can correct it:
```
"That's not quite right. This is more about 
[housing/neighborhood/something else]"
```

---

## Step 3: System Derives: Impact Radius (Sigma)

### What is Sigma?

**Sigma (σ)** = the geographic distance from issue location where it meaningfully affects people.

The system calculates: **"How far from the problem does it still matter?"**

### How the System Derives It

```
Your Description:
"Water leak in apartment building at 457 Main St"

System derives:
📍 Impact Radius: 50 meters
   (affects residents of building + adjacent properties)
   Based on the typical issue type "building.maintenance.water"

💭 Does this look right? [Yes] [No, let me clarify the context]
```

You do not type a radius. If the result looks wrong, **clarify the context**: say who is affected and where, and the system derives the radius again. The derived value always stays inside the typical range of the issue type.

### When the Radius Looks Wrong: Clarify the Context

| Issue Type | Derived σ | If it looks wrong, add to the context |
|-----------|----------|-----------------|
| **Lock issue (personal)** | 10-20m | "It affects the whole block" → larger radius |
| **Building maintenance** | 30-80m | "Only my unit is affected" → smaller radius |
| **Street noise** | 100-300m | "It is much louder than normal" → larger radius |
| **Park event** | 500-2000m | "People only come from nearby" → smaller radius |

**Example**:
```
System derives: 500m for "dance event"
You add to the context: "It is very popular and draws people from the whole neighborhood"
System derives again: 2000m (the context supports the top of the range for this type)
```

### Local Rules and Ownership

If your issue touches something that local rules give to an authority or to an owner (a public street, a school, a utility), say so in the context and name the rule or the source if you can. A short check of public information is enough, and the assistant will remind you. The assistant may tell you that the decision belongs to an authority. Then your issue becomes a **proposal to that authority**, and the public widens to everyone affected: residents, people who work in the area, owners and staff of organisations and businesses. If you attach no source, members see a caution that useful context may be missing. The caution does not block your issue.

---

## Step 4: System Derives: Relevance Weights

### What Are Weights?

**Weights** = How much each relevance factor matters for THIS issue.

The system calculates: **"Which is more important: being nearby or interested?"**

Four factors get weighted:

```
D = Demographic (age, employment, family status)
G = Geographic (distance from issue location)
S = Semantic (interest in the topic)
X = Social (knowing people affected by issue)
```

### System Derivation

```
Your Issue:
"Dance lesson event at community center, 3pm Saturday"

System derives Weights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Demographic (D):    10%  [███░░░░░░] (age 5-18 most relevant)
📍 Geographic (G):     30%  [██████░░░░] (within walking distance)
❤️  Semantic (S):      50%  [██████████] (interested in dance)
👥 Social (X):         10%  [███░░░░░░] (know attendees)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Does this look right? [Yes] [No, let me clarify the context]
```

### When the Weights Look Wrong: Clarify the Context

You do not type weights. Say in the context what makes one factor more important, and the system derives the weights again:

| Scenario | Add to the context | Effect |
|----------|--------------------|--------|
| "Dance event for seniors only" | "For people over 65 only" | D rises |
| "Noise complaint from loud construction" | "Noise from a building site next to the houses" | G dominates |
| "Professional conference on AI" | "Open to people who work with AI" | S rises |
| "Emergency in my family" | "It affects my relatives and close friends" | X rises |

The derived values always stay inside the typical range of the issue type. The table has as many issue types as needed, and new types are added by protocol-level decisions, so an unusual case is not forced into an ill-fitting type. If no listed type fits, the assistant tells you; reformulate the issue or choose the nearest type it lists. The system checks internally that the weights sum to 100%; you never see an error about this.

---

## Step 5: Review & Submit

### Final Checklist

Before submitting, system asks:

```
✅ Description is clear and specific?
✅ Location is correctly marked on map?
✅ Category matches your issue?
✅ Context says who is affected, where, and which local rules or owners matter (with a source, if you have one)?
✅ Derived radius and weights look right (if not, clarify the context)?

[All good!] → [Submit Issue]
```

### What Happens After Submission

```
Issue Submitted ✓
   ↓
System calculates relevance for all users
   ↓
System identifies "Ad-hoc Public" (Public of Appearance)
   (people significantly affected by this issue)
   ↓
System sends notifications to the ad-hoc public
   ↓
Users can discuss (until voting opens, any member can propose a change of the text, options, issue type or context; the assistant checks that it is consistent with the rules; if the public supports it by the current weights and a simple majority, the system derives the parameters again and the member list is updated; nobody edits a number by hand; members who fall below the threshold stay with a lower weight)
   ↓
Voting opens (text, options, type and context are frozen until the vote closes)
   ↓
Voting results aggregated using ISR weights
```

---

## Step 6: System Validation Checks

### Automatic Validation

The system checks your submission:

| Check | Purpose | Message if Failed |
|-------|---------|-------------------|
| **Description > 20 characters** | Avoid spam | "Description too short, add more detail" |
| **Valid location** | Geospatial accuracy | "Please pin the exact location on the map" |
| **Derived weights sum to 100%** | Internal consistency | (internal check, never shown to you) |
| **Reasonable sigma** | Sanity check | "Your context points to an area larger than 20 km; please narrow the issue or split it" |
| **Issue type matched** | Classification required | "Please confirm one of the issue types the assistant lists, or add detail to the context" |

### Issues During Validation

```
❌ Error: "Your description is too short"
✏️ Solution: Add more detail about WHERE and WHAT

❌ Error: "Location is outside service area"
✏️ Solution: Move location marker to correct building/street

❌ Message: "No listed issue type fits your description"
✏️ Solution: Add detail about WHO is affected and WHERE, or choose one of the types the assistant lists
```

---

## Examples: Full Issue Submission

### Example 1: Building Maintenance Issue

```
📝 STEP 1: Description
"Water leak in basement of 457 Main Street apartment building.
Located near electrical panel. Started last Tuesday. Building 
manager says he's waiting for plumber but can't schedule for 2 weeks.
All 24 residents risk damaged property. Basement storage rooms 
have items at risk."

🏷️ STEP 2: Category
System suggests: building.maintenance.water
User confirms: ✓ Yes, that's right

📍 STEP 3: Impact Radius
System derives: 50m (building + immediate neighbors)
User confirms: ✓ Yes, mainly affects residents of this building

⚖️ STEP 4: Weights
System derives: D=30%, G=60%, S=5%, X=5%
User adds to the context: "Only people living in or storing things in this building are affected"
System derives again: D=20%, G=70%, S=5%, X=5%
   (Reasoning: Geographic proximity is dominant factor)

✅ STEP 5: Review & Submit
[Submit Issue] ✓

🔔 RESULT:
- Ad-hoc public formed: 42 affected residents
- Average relevance: 0.73
- All notified within 10 minutes
```

### Example 2: Community Event Issue

```
📝 STEP 1: Description
"Organizing weekly salsa dancing lessons every Saturday 3-5pm 
at Community Center, Main Hall. For adults interested in learning.
Instructor available, need to gauge interest and find regular venue.
All levels welcome, no experience needed."

🏷️ STEP 2: Category
System suggests: social.event.cultural
User confirms: ✓ Correct

📍 STEP 3: Impact Radius
System suggests: μ = 1000m and σ = 4000m (covers nearby blocks and decays softly across adjacent neighborhoods)
User confirms: ✓ Yes, fits a community chess club/dance event perfectly

⚖️ STEP 4: Weights
System suggests: D=20%, G=30%, S=50%, X=10%
User confirms: ✓ Yes, semantic interest (love dancing) is main factor

✅ STEP 5: Review & Submit
[Submit Issue] ✓

🔔 RESULT:
- Ad-hoc public formed: 187 interested people
- Average relevance: 0.58
- Notifications sent; 24 people confirm interest
```

### Example 3: Neighborhood Infrastructure Issue

```
📝 STEP 1: Description
"Pothole on Oak Street between 3rd and 4th Avenue. 
Grew to 0.5m diameter over past month. Dangerous for 
cyclists and scooters. City says it's on maintenance list 
but no ETA. Neighbors complained several times."

🏷️ STEP 2: Category
System suggests: infrastructure.transport.streets
User confirms: ✓ Correct

📍 STEP 3: Impact Radius
System suggests: 200m (stretch of street affected)
User keeps: ✓ Accurate

⚖️ STEP 4: Weights
System suggests: D=30%, G=70%, S=5%, X=5%
User confirms: ✓ Geographic proximity is main factor

✅ STEP 5: Review & Submit
[Submit Issue] ✓

🔔 RESULT:
- Ad-hoc public formed: 156 residents
- Average relevance: 0.64
- Some suggest petitioning city together
```

---

## FAQs: Issue Request Questions

### Q: Can I change issue details after submission?

**A**: The issue belongs to its ad-hoc public, not to you. After publication any member, you included, can propose a change of the text, the options, the issue type or the context. The assistant checks that the change is consistent with the rules. If the public supports it (current ISR weights, simple majority), the system derives the parameters again, recomputes relevance and updates the list of members. Radius and weights are never edited by hand: they follow from the type and the context. Every change is logged and visible to everyone. Once voting opens, everything is frozen until the vote closes, so changes are possible during discussion only. Anyone can ask to join an issue's public; the request is accepted automatically and logged.

---

### Q: What if the derived radius or weights look wrong?

**A**: Clarify the context before you submit; the system derives them again. After publication any member can propose a change of context or type, and the public decides. If feedback shows that the issue type was wrong, that is a reason to improve the table at protocol level, which all users take part in. ISR learns over time.

---

### Q: How is the ad-hoc public determined?

**A**: System calculates Relevance (0.0-1.0) for every user, invites those with Relevance > 0.15 to form the ad-hoc public. Users can decline if they don't feel affected.

---

### Q: What if I'm not in the ad-hoc public?

**A**: You didn't have high enough Relevance score for this issue. But if you are interested, you can still join by request: it is accepted automatically, logged and not filtered. You then take part in discussion and can vote according to your ISR score.

---

### Q: Can I submit duplicate issues?

**A**: System checks for similar active issues to prevent flooding the public issue list and distracting members' attention. If one exists, you can join/support it instead of creating a new issue. If a user insists and starts a similar topic, but more than 50% of members decline the membership, the ad-hoc public dismisses automatically and the topicstarter's action decreases their future Contribution impact.

---

### Q: How is issue status decided?

**A**: The ad-hoc public votes using ISR weights. Outcome depends on vote aggregation rules (separate from Relevance).

---

## Design Philosophy: Why This Process?

### Why We Ask for Detailed Descriptions
- Helps system understand what really matters
- Ensures users think through their issue
- Enables accurate automatic categorization

### Why the System Derives the Parameters
- Uniform: the same rules apply to every issue
- Auditable: every run is logged with the type, the rules applied and the model version
- Harder to game: nobody can shrink or widen a public by typing a number
- Flexible: the table has as many issue types as needed, and new types are added by protocol-level decisions
- Transparent algorithm: users see exactly what drives the ad-hoc public

### Who Can Change the Context After Submission
Only the public can: the issue belongs to its public, not to its submitter. This prevents submitter gaming: a change needs the public's support and is logged with its reason. It keeps the public in step with the real issue: the context and the formulation can change during deliberation. Nobody edits numbers: the parameters follow from the type and context. It is fair to all voters: once voting opens, nothing changes until the vote closes.

### Why Relevance Is Absolute (Not Normalized)
- Adding one more affected person doesn't dilute others' voices
- Independent, auditable scoring
- Fair to late arrivals vs. early members

---

## Next Steps for Users

1. **Submit your first issue** following this guide
2. **Review automatic categorization & weights**
3. **Clarify the context if the derived settings look wrong** (optional)
4. **Submit and see your ad-hoc public form**
5. **Vote when issues appear in your ad-hoc publics**

