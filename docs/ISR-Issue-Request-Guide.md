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

## Step 3: System Suggests: Impact Radius (Sigma)

### What is Sigma?

**Sigma (σ)** = the geographic distance from issue location where it meaningfully affects people.

The system calculates: **"How far from the problem does it still matter?"**

### System Suggestion Algorithm

```
Your Description:
"Water leak in apartment building at 457 Main St"

System Suggests:
📍 Impact Radius: 50 meters
   (affects residents of building + adjacent properties)

💭 This seems right? [Yes] [No, let me adjust]
```

### When to Accept vs. Override

**Accept suggestion if**: Impact radius feels accurate for your issue

**Override if**: You know better where it actually affects people

| Issue Type | Suggested σ | When to Override |
|-----------|----------|-----------------|
| **Lock issue (personal)** | 10-20m | "Actually affects whole block" → increase |
| **Building maintenance** | 30-80m | "Just my unit" → decrease |
| **Street noise** | 100-300m | "It's much louder than normal" → increase |
| **Park event** | 500-2000m | "People only come from nearby" → decrease |

**Example Override**:
```
System suggests: 500m for "dance event"
You adjust to: 2000m because "it's very popular, draws from whole neighborhood"
```

---

## Step 4: System Suggests: Relevance Weights

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

### System Suggestion

```
Your Issue:
"Dance lesson event at community center, 3pm Saturday"

System Suggests Weights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Demographic (D):    10%  [███░░░░░░] (age 5-18 most relevant)
📍 Geographic (G):     30%  [██████░░░░] (within walking distance)
❤️  Semantic (S):      50%  [██████████] (interested in dance)
👥 Social (X):         10%  [███░░░░░░] (know attendees)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Is this right? [Yes] [Adjust weights]
```

### When to Adjust Weights

**Keep suggested weights if** they match your intuition about the issue.

**Adjust if** you think a different factor is more important:

| Scenario | Adjust To | Reasoning |
|----------|-----------|-----------|
| "Dance event for seniors only" | ↑ D to 40% | Demographic match matters more |
| "Noise complaint from loud construction" | ↑ G to 70% | Geographic proximity dominates |
| "Professional conference on AI" | ↑ S to 70% | Semantic interest critical |
| "Emergency in my family" | ↑ X to 60% | Social connections matter most |

**Interactive Adjustment**:
```
Suggested weights feel wrong? Adjust them:

D (Demographic):  [Current: 10%] [Slider: ▬▬█▬▬ 30%]
G (Geographic):   [Current: 30%] [Slider: ▬█▬▬▬ 20%]
S (Semantic):     [Current: 50%] [Slider: █████░ 60%]
X (Social):       [Current: 10%] [Slider: ▬▬░▬▬ 0%]

[Check: Total = 100%] ✓ Valid weights!
```

---

## Step 5: Review & Submit

### Final Checklist

Before submitting, system asks:

```
✅ Description is clear and specific?
✅ Location is correctly marked on map?
✅ Category matches your issue?
✅ Impact radius (sigma) feels right?
✅ Weights reflect importance of each factor?

[All good!] → [Submit Issue]
```

### What Happens After Submission

```
Issue Submitted ✓
   ↓
System calculates relevance for all users
   ↓
System identifies "Microcommunity" 
   (people significantly affected by this issue)
   ↓
System sends notifications to microcommunity
   ↓
Users can review and vote
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
| **Weights sum to 100%** | Mathematical validity | "Weights must add up to 100%" |
| **Reasonable sigma** | Sanity check | "Impact radius too large (max 20km)" |
| **Category selected** | Classification required | "Please select or confirm issue category" |

### Issues During Validation

```
❌ Error: "Your description is too short"
✏️ Solution: Add more detail about WHERE and WHAT

❌ Error: "Location is outside service area"
✏️ Solution: Move location marker to correct building/street

❌ Error: "Please adjust weights to sum to 100%"
✏️ Solution: Current total is 95%, increase D by 5%
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
System suggests: 50m (building + immediate neighbors)
User confirms: ✓ Yes, mainly affects residents of this building

⚖️ STEP 4: Weights
System suggests: D=30%, G=60%, S=5%, X=5%
User adjusts: D=20%, G=70%, S=5%, X=5%
   (Reasoning: Geographic proximity is dominant factor)

✅ STEP 5: Review & Submit
[Submit Issue] ✓

🔔 RESULT:
- Microcommunity formed: 42 affected residents
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
- Microcommunity formed: 187 interested people
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
- Microcommunity formed: 156 residents
- Average relevance: 0.64
- Some suggest petitioning city together
```

---

## FAQs: Issue Request Questions

### Q: Can I change issue details after submission?

**A**: No, issue details (location, category, weights) are locked after submission to ensure consistent microcommunity. You can add comments explaining updates.

---

### Q: What if I submit wrong sigma/weights?

**A**: The system works with what you submitted. If community feedback shows weights were wrong, note this for future issues. ISR learns over time.

---

### Q: How is microcommunity determined?

**A**: System calculates Relevance (0.0-1.0) for every user, invites those with Relevance > 0.15. Users can decline if they don't feel affected.

---

### Q: What if I'm not in the microcommunity?

**A**: You didn't have high enough Relevance score for this issue. But if you are interested, you can still be added with a special request, take part in discussion and even vote according to your ISR score.

---

### Q: Can I submit duplicate issues?

**A**: System checks for similar active issues to prevent flooding community list and distructing members attention. If one exists, you can join/support it instead of creating new issue. If user insists and starts a similar topic, but more then 50% of members decline the membership, the microcommunity dismisses automatically and topicstarter's action decrease its future Contribution impact.

---

### Q: How is issue status decided?

**A**: Microcommunity votes using ISR weights. Outcome depends on vote aggregation rules (separate from Relevance).

---

## Design Philosophy: Why This Process?

### Why We Ask for Detailed Descriptions
- Helps system understand what really matters
- Ensures users think through their issue
- Enables accurate automatic categorization

### Why We Suggest (Not Require) Weights
- Most users don't need to adjust
- Expert submitters can fine-tune
- Transparent algorithm—users see exactly what drives microcommunity

### Why Weights Are Locked After Submission
- Ensures consistent microcommunity throughout issue lifecycle
- Prevents submitter gaming the system
- Fair to all voters in microcommunity

### Why Relevance Is Absolute (Not Normalized)
- Adding one more affected person doesn't dilute others' voices
- Independent, auditable scoring
- Fair to late arrivals vs. early members

---

## Next Steps for Users

1. **Submit your first issue** following this guide
2. **Review automatic categorization & weights**
3. **Adjust if you know better** (optional)
4. **Submit and see microcommunity form**
5. **Vote when issues appear in your microcommunities**

