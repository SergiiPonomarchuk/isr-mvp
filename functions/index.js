const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const aiHelper = require("./ai-helper");
const { readTextInputs, paramsFromAi, makeDraft, paramsForCreate } = require("./params");

admin.initializeApp();
const db = admin.firestore();

// Helper: Haversine distance in meters
function haversineDistance(coords1, coords2) {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coords1[0] * Math.PI) / 180;
  const lat2 = (coords2[0] * Math.PI) / 180;
  const deltaLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper: Cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: Evaluate demographic filters on user document
function evaluateDemographics(user, criteria) {
  if (!criteria) return 1.0;

  // 1. Age check
  if (user.birthDate) {
    // Parse birthDate e.g., "1971-01-05"
    const birthYear = parseInt(user.birthDate.split("-")[0]);
    if (!isNaN(birthYear)) {
      const age = new Date().getFullYear() - birthYear;
      if (criteria.minAge !== undefined && age < criteria.minAge) return 0.0;
      if (criteria.maxAge !== undefined && age > criteria.maxAge) return 0.0;
    }
  }

  // 2. Employment check
  if (criteria.employmentStatus && criteria.employmentStatus !== "any") {
    const isEmployed = Array.isArray(user.post) && user.post.length > 0;
    if (criteria.employmentStatus === "employed" && !isEmployed) return 0.0;
    if (criteria.employmentStatus === "unemployed" && isEmployed) return 0.0;
  }

  // 3. Family status check
  if (criteria.familyStatus && criteria.familyStatus !== "any") {
    const relations = user.socialRelations || [];
    const hasChildren = relations.some((r) =>
      ["child", "son", "daughter"].includes(r.type ? r.type.toLowerCase() : "")
    );
    const hasGrandchildren = relations.some((r) =>
      ["grandchild", "grandson", "granddaughter"].includes(r.type ? r.type.toLowerCase() : "")
    );

    if (criteria.familyStatus === "parent" && !hasChildren) return 0.0;
    if (criteria.familyStatus === "grandparent" && !hasGrandchildren) return 0.0;
  }

  // 4. Features check
  if (Array.isArray(criteria.features) && criteria.features.length > 0) {
    const userFeaturesStr = (user.features || []).join(" ").toLowerCase();
    const hasMatchingFeature = criteria.features.some((f) => {
      const term = f.toLowerCase().trim();
      if (!term) return false;
      if (userFeaturesStr.includes(term)) return true;
      if ((term.includes("pet") || term.includes("animal")) &&
          (userFeaturesStr.includes("dog") || userFeaturesStr.includes("cat") || userFeaturesStr.includes("pet") || userFeaturesStr.includes("animal"))) {
        return true;
      }
      return false;
    });
    if (!hasMatchingFeature) return 0.0;
  }

  return 1.0;
}

// HTTPS Endpoint: Analyze Issue using Gemini 1.5 Flash
exports.analyzeIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.length < 20) {
      return res.status(400).json({ error: "Description must be at least 20 characters." });
    }

    const suggestions = await aiHelper.suggestIssueParams(description);
    res.json(suggestions);
  } catch (error) {
    console.error("Error analyzing issue:", error);
    res.status(500).json({ error: "Failed to analyze issue description." });
  }
});

// HTTPS Endpoint: Create Issue & Compute Relevance Pipeline
exports.createIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { title, description, location, submitterId } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }

    // A2: every number comes from the draft that checkIssue derived on the server.
    // Numbers and weight objects in the request body are never read.
    let P;
    try {
      const draftSnap = req.body.draftId
        ? await db.collection("issue_drafts").doc(String(req.body.draftId)).get()
        : null;
      P = paramsForCreate(req.body, draftSnap && draftSnap.exists ? draftSnap.data() : null);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    const {
      category, demographics, expertise_depth, expertise_domain,
      relevance_reasoning, aggregation_reasoning, classification,
      expertise_domain_parameters, resources_needed
    } = P;
    const { reasoning_D, reasoning_G, reasoning_S, reasoning_X } = P.relevance_explanations || {};
    const { reasoning_R, reasoning_E, reasoning_C } = P.isr_explanations || {};

    // Step 1: Vectorize issue description
    const issueVector = await aiHelper.vectorizeText(description);

    const w_D = P.weights.w_D;
    const w_G = P.weights.w_G;
    const w_S = P.weights.w_S;
    const w_X = P.weights.w_X;
    const muVal = P.mu;
    const sigmaVal = P.sigma;
    const resolvedAggWeights = P.aggregation_weights;

    // Load submitter profile to get social relations
    let submitterRelations = [];
    try {
      const submitterSnap = await db.collection("users").doc(String(submitterId)).get();
      if (submitterSnap.exists) {
        submitterRelations = submitterSnap.data().socialRelations || [];
      }
    } catch (err) {
      console.error("Error fetching submitter social relations:", err);
    }

    // ==========================================
    // RELEVANCE PIPELINE (4 STAGES)
    // ==========================================
    const candidates = [];
    
    // Load metadata from user_packs (with users collection fallback)
    const allUsers = [];
    const userPacksSnapshot = await db.collection("user_packs").get();
    if (!userPacksSnapshot.empty) {
      userPacksSnapshot.forEach((packDoc) => {
        const packData = packDoc.data();
        if (Array.isArray(packData.users)) {
          allUsers.push(...packData.users);
        }
      });
    } else {
      const usersSnapshot = await db.collection("users")
        .select("uid", "displayName", "birthDate", "gender", "post", "socialRelations", "geography")
        .get();
      usersSnapshot.forEach((doc) => {
        allUsers.push(doc.data());
      });
    }
    // De-duplicate users by uid to prevent multiple entries in candidates
    const uniqueUsersMap = new Map();
    allUsers.forEach((user) => {
      if (user && user.uid !== undefined) {
        uniqueUsersMap.set(user.uid, user);
      }
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    const filteredCandidates = [];
    uniqueUsers.forEach((user) => {
      const isCreator = (user.uid === parseInt(submitterId));

      // Stage 1: Demographic Score (D)
      const dScore = evaluateDemographics(user, demographics);
      if (dScore === 0.0 && w_D > 0 && !isCreator) return; // Excluded immediately by demographics!

      // Stage 2: Geographic Distance Filter
      const homeAnchor = (user.geography || []).find((g) => g.type === "home");
      let distance = 0;
      let gScore = 1.0;
      if (homeAnchor && homeAnchor.geo) {
        distance = haversineDistance(location, homeAnchor.geo);
        const maxDistance = muVal + 3 * sigmaVal;
        if (distance > maxDistance && w_G > 0 && !isCreator) return; // Excluded by distance!

        if (distance > muVal) {
          gScore = Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
        }
      } else {
        if (!isCreator) return;
        gScore = 0.0;
      }

      // Stage 4: Social Connections (calculate early)
      let xScore = 0.0;
      const relation = submitterRelations.find((r) => r.relative === user.uid);
      if (relation) {
        if (relation.tie !== undefined && relation.tie !== null) {
          xScore = parseFloat(relation.tie) || 0.0;
        } else {
          const type = relation.type ? relation.type.toLowerCase() : "";
          if (["spouse", "partner", "wife", "husband"].includes(type)) xScore = 0.3;
          else if (["parent", "father", "mother", "child", "son", "daughter", "sibling", "sister", "brother"].includes(type)) xScore = 0.2;
          else if (["grandparent", "grandfather", "grandmother", "grandchild", "grandson", "granddaughter", "close friend"].includes(type)) xScore = 0.1;
        }
      }

      // Calculate max possible score (assuming S_score = 1.0)
      const maxScore = w_D * dScore + w_G * gScore + w_S * 1.0 + w_X * xScore;
      if (maxScore <= 0.15 && !isCreator) return; // Cannot make it to the ad-hoc public

      filteredCandidates.push({
        user: user,
        dScore: dScore,
        gScore: gScore,
        xScore: xScore,
        maxScore: maxScore,
        isCreator: isCreator
      });
    });

    // Sort by maxScore descending to get the top candidates for vector fetching
    filteredCandidates.sort((a, b) => b.maxScore - a.maxScore);

    // Limit vector fetching to top 300 candidates, ensuring creator is fetched
    const creatorIndex = filteredCandidates.findIndex(c => c.isCreator);
    const candidatesToFetch = filteredCandidates.slice(0, 300);
    if (creatorIndex !== -1 && creatorIndex >= 300) {
      candidatesToFetch.push(filteredCandidates[creatorIndex]);
    }

    // Stage 3: Semantic Similarity (Batch Fetch Vectors from user_vectors for top 300)
    const vectorScores = new Map();
    if (candidatesToFetch.length > 0 && w_S > 0) {
      const refs = candidatesToFetch.map((c) => db.collection("user_vectors").doc(String(c.user.uid)));
      const chunkSize = 500;
      for (let i = 0; i < refs.length; i += chunkSize) {
        const chunkRefs = refs.slice(i, i + chunkSize);
        const vectorDocs = await db.getAll(...chunkRefs);
        vectorDocs.forEach((docSnap) => {
          if (docSnap.exists) {
            const vData = docSnap.data();
            const userVectorField = vData.profile_vector;
            if (userVectorField) {
              let userVector = null;
              if (typeof userVectorField.toArray === "function") {
                userVector = userVectorField.toArray();
              } else if (Array.isArray(userVectorField)) {
                userVector = userVectorField;
              } else if (userVectorField._values) {
                userVector = userVectorField._values;
              }
              if (userVector) {
                const sScore = Math.max(0, cosineSimilarity(issueVector, userVector));
                vectorScores.set(String(vData.uid), sScore);
              }
            }
          }
        });
      }
    }

    // Stage 4: Final Relevance Score (R)
    filteredCandidates.forEach((c, index) => {
      const user = c.user;
      const dScore = c.dScore;
      const gScore = c.gScore;
      const xScore = c.xScore;
      const isCreator = c.isCreator;

      let sScore = 0.0;
      if (w_S > 0 && (index < 300 || isCreator)) {
        sScore = vectorScores.get(String(user.uid)) || 0.0;
      }

      const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

      if (relevanceScore > 0.15 || isCreator) {
        candidates.push({
          user_id: user.uid,
          displayName: user.displayName + (isCreator ? " (Creator)" : ""),
          D_score: dScore,
          G_score: gScore,
          S_score: sScore,
          X_score: xScore,
          relevance_score: relevanceScore,
          isCreator: isCreator
        });
      }
    });

    // Sort by relevance score descending and limit to top 100 to optimize ad-hoc public size
    candidates.sort((a, b) => b.relevance_score - a.relevance_score);
    let microcommunityMembers = [];
    const creatorMember = candidates.find(c => c.isCreator);
    if (creatorMember) {
      const top100 = candidates.slice(0, 100);
      const containsCreator = top100.some(c => c.isCreator);
      if (containsCreator) {
        microcommunityMembers = top100;
      } else {
        microcommunityMembers = candidates.slice(0, 99);
        microcommunityMembers.push(creatorMember);
      }
    } else {
      microcommunityMembers = candidates.slice(0, 100);
    }

    // Write Issue to Firestore
    const issueRef = db.collection("issues").doc();
    const issueId = issueRef.id;

    const issueDoc = {
      issue_id: issueId,
      title,
      description,
      starts: admin.firestore.FieldValue.serverTimestamp(),
      category: (classification && classification.issue_category) || category || "building.maintenance.general",
      location: new admin.firestore.GeoPoint(location[0], location[1]),
      mu_distance_meters: muVal,
      sigma_decay_meters: sigmaVal,
      // Relevance weights (flat, for query compatibility)
      w_demographic: w_D,
      w_geographic: w_G,
      w_semantic: w_S,
      w_social: w_X,
      // ISR aggregation weights (flat)
      w_relevance:    resolvedAggWeights.w_relevance,
      w_expertise:    resolvedAggWeights.w_expertise,
      w_contribution: resolvedAggWeights.w_contribution,
      // Reasoning
      relevance_reasoning:   relevance_reasoning || "",
      aggregation_reasoning: aggregation_reasoning || "",
      submitter_id: String(submitterId),
      status: "open",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      // Expertise
      expertise_depth:  expertise_depth  || "None",
      expertise_domain: expertise_domain  || (expertise_domain_parameters && expertise_domain_parameters.expertise_domain) || "General Maintenance",
      // Demographics
      demographics: demographics || null,
      // Per-component reasoning strings
      reasoning_D:         reasoning_D         || "",
      reasoning_G:         reasoning_G         || "",
      reasoning_S:         reasoning_S         || "",
      reasoning_X:         reasoning_X         || "",
      reasoning_R:         reasoning_R         || "",
      reasoning_E:         reasoning_E         || "",
      reasoning_C:         reasoning_C         || "",
      // ── New ISR protocol fields ────────────────────────────────────────────
      // Full classification object (scope_type, affected_roles, etc.)
      classification: classification || null,
      // Expertise domain depth parameters
      expertise_domain_parameters: expertise_domain_parameters || null,
      // Resource requirements list
      resources_needed: resources_needed || []
    };
    await issueRef.set(issueDoc);

    // Create Ad-hoc Public Record (stored in microcommunities collection for schema compatibility)
    const mcRef = db.collection("microcommunities").doc();
    const mcId = mcRef.id;

    // Fetch values_taxonomy for members to calculate aggregated ad-hoc public values taxonomy
    let mcTaxonomy = null;
    const memberUids = microcommunityMembers.map(m => String(m.user_id));
    if (memberUids.length > 0) {
      try {
        const uRefs = memberUids.map(uid => db.collection("users").doc(uid));
        const uDocs = await db.getAll(...uRefs);
        const memberTaxonomies = [];
        uDocs.forEach(uDoc => {
          if (uDoc.exists) {
            const uData = uDoc.data();
            if (uData.values_taxonomy) {
              const m = microcommunityMembers.find(member => String(member.user_id) === uDoc.id);
              memberTaxonomies.push({
                relevance: m ? m.relevance_score : 0.1,
                taxonomy: uData.values_taxonomy
              });
            }
          }
        });

        if (memberTaxonomies.length > 0) {
          const avg_domains = [];
          for (let i = 0; i < 10; i++) {
            let val_sum = 0;
            let rel_sum = 0;
            memberTaxonomies.forEach(mt => {
              const domains_list = mt.taxonomy.domains || [];
              if (domains_list[i] !== undefined && domains_list[i] !== null) {
                val_sum += domains_list[i] * mt.relevance;
                rel_sum += mt.relevance;
              }
            });
            avg_domains.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
          }

          const avg_context_shifts = {};
          for (const ctx of ['work', 'family', 'private', 'crisis']) {
            const avg_ctx_list = [];
            for (let i = 0; i < 10; i++) {
              let val_sum = 0;
              let rel_sum = 0;
              memberTaxonomies.forEach(mt => {
                const shifts_dict = mt.taxonomy.contextual_shifts || {};
                const ctx_list = shifts_dict[ctx] || [];
                if (ctx_list[i] !== undefined && ctx_list[i] !== null) {
                  val_sum += ctx_list[i] * mt.relevance;
                  rel_sum += mt.relevance;
                }
              });
              avg_ctx_list.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 0);
            }
            avg_context_shifts[ctx] = avg_ctx_list;
          }

          const avg_items = {};
          for (let i = 1; i <= 10; i++) {
            const key = `d${i}`;
            let items_len = 0;
            for (let mt of memberTaxonomies) {
              const items_dict = mt.taxonomy.items || {};
              if (items_dict[key] && items_dict[key].length > 0) {
                items_len = items_dict[key].length;
                break;
              }
            }
            if (items_len > 0) {
              const avg_item_list = [];
              for (let j = 0; j < items_len; j++) {
                let val_sum = 0;
                let rel_sum = 0;
                memberTaxonomies.forEach(mt => {
                  const items_dict = mt.taxonomy.items || {};
                  const item_list = items_dict[key] || [];
                  if (item_list[j] !== undefined && item_list[j] !== null) {
                    val_sum += item_list[j] * mt.relevance;
                    rel_sum += mt.relevance;
                  }
                });
                avg_item_list.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
              }
              avg_items[key] = avg_item_list;
            } else {
              avg_items[key] = [];
            }
          }

          const avg_conflict_resolution = [];
          for (let i = 0; i < 36; i++) {
            let val_sum = 0;
            let rel_sum = 0;
            memberTaxonomies.forEach(mt => {
              const conflicts_list = mt.taxonomy.conflict_resolution || [];
              let val = null;
              if (conflicts_list[i] !== undefined && conflicts_list[i] !== null) {
                if (typeof conflicts_list[i] === 'object') {
                  val = conflicts_list[i].weight;
                } else {
                  val = conflicts_list[i];
                }
              }
              if (val !== null) {
                val_sum += val * mt.relevance;
                rel_sum += mt.relevance;
              }
            });
            avg_conflict_resolution.push(rel_sum > 0 ? Math.round(val_sum / rel_sum) : 50);
          }

          mcTaxonomy = {
            domains: avg_domains,
            items: avg_items,
            contextual_shifts: avg_context_shifts,
            conflict_resolution: avg_conflict_resolution
          };
        }
      } catch (err) {
        console.error("Error aggregating values taxonomy in createIssue:", err);
      }
    }

    const mcDoc = {
      microcommunity_id: mcId,
      issue_id: issueId,
      threshold_relevance: 0.15,
      member_count: microcommunityMembers.length,
      member_accepted: 0,
      issue_scope: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
      values_taxonomy: mcTaxonomy
    };
    await mcRef.set(mcDoc);

    // Upload ad-hoc public members
    const batch = db.batch();
    microcommunityMembers.forEach((member) => {
      const memberRef = db.collection("microcommunity_members").doc(`${mcId}_${member.user_id}`);
      batch.set(memberRef, {
        microcommunity_id: mcId,
        user_id: member.user_id,
        displayName: member.displayName,
        D_score: member.D_score,
        G_score: member.G_score,
        S_score: member.S_score,
        X_score: member.X_score,
        relevance_score: member.relevance_score,
        calculated_at: admin.firestore.FieldValue.serverTimestamp(),
        accepted_rejected: null
      });
    });
    
    if (microcommunityMembers.length > 0) {
      await batch.commit();
    }

    // Add to discussions collection so it shows up in real-time chat
    const discRef = db.collection("discussions").doc(issueId); // Use same ID for simplicity
    
    const relevanceScores = {};
    microcommunityMembers.forEach((member) => {
      relevanceScores[String(member.user_id)] = parseFloat(member.relevance_score.toFixed(3));
    });

    // Resolve submitter display name
    let submitterDisplayName = "User " + submitterId;
    try {
      const uDoc = await db.collection("users").doc(String(submitterId)).get();
      if (uDoc.exists) {
        submitterDisplayName = uDoc.data().displayName || submitterDisplayName;
      }
    } catch (e) {
      console.error("Error resolving submitter name:", e);
    }

    const participantUids = microcommunityMembers.map(m => String(m.user_id));

    await discRef.set({
      discussion_id: issueId,
      topic: title,
      creator_uid: String(submitterId),
      created_at: new Date().toISOString(),
      message_count: 1,
      location: new admin.firestore.GeoPoint(location[0], location[1]),
      affection_distance: parseFloat((muVal / 1000).toFixed(3)),
      expertise_depth:  expertise_depth  || "None",
      expertise_domain: expertise_domain  || (expertise_domain_parameters && expertise_domain_parameters.expertise_domain) || "General Maintenance",
      relevance_scores: relevanceScores,
      participants: participantUids,
      last_message_text: description,
      last_message_sender_uid: String(submitterId),
      last_message_sender_name: submitterDisplayName,
      last_message_timestamp: new Date().toISOString(),
      w_demographic: w_D,
      w_geographic:  w_G,
      w_semantic:    w_S,
      w_social:      w_X,
      w_relevance:    resolvedAggWeights.w_relevance,
      w_expertise:    resolvedAggWeights.w_expertise,
      w_contribution: resolvedAggWeights.w_contribution,
      relevance_reasoning:   relevance_reasoning   || "",
      aggregation_reasoning: aggregation_reasoning || "",
      demographics: demographics || null,
      reasoning_D:         reasoning_D         || "",
      reasoning_G:         reasoning_G         || "",
      reasoning_S:         reasoning_S         || "",
      reasoning_X:         reasoning_X         || "",
      reasoning_R:         reasoning_R         || "",
      reasoning_E:         reasoning_E         || "",
      reasoning_C:         reasoning_C         || "",
      // New protocol fields
      classification:             classification             || null,
      expertise_domain_parameters: expertise_domain_parameters || null,
      resources_needed:           resources_needed           || []
    });

    // Add initial message in subcollection (the topic description by starter)
    await discRef.collection("messages").doc("msg_init").set({
      id: "msg_init",
      uid: String(submitterId),
      text: description,
      timestamp: new Date().toISOString(),
      marks: [],
      child: []
    });

    res.json({
      success: true,
      issue_id: issueId,
      microcommunity_id: mcId,
      members_count: microcommunityMembers.length,
      members: microcommunityMembers.map(m => ({ uid: m.user_id, name: m.displayName, score: m.relevance_score.toFixed(3) }))
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: "Failed to create issue and form ad-hoc public." });
  }
});

// HTTPS Endpoint: Check/Calculate Relevance Pipeline (Dry-run server-side)
exports.checkIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { title, description, location, submitterId } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }

    // 1. Derive every parameter on the server (A2: nobody types a number).
    //    "Derive again" sends only a clarification text; numbers in the body are ignored.
    const inputs = readTextInputs(req.body);
    const ai = await aiHelper.checkIssueParams(description, title, inputs.clarification);
    const data = paramsFromAi(ai);

    // 2. Generate issue embedding
    const issueVector = await aiHelper.vectorizeText(description);

    // 3. Submitter relations
    let submitterRelations = [];
    try {
      const creatorSnap = await db.collection("users").doc(String(submitterId)).get();
      if (creatorSnap.exists) {
        submitterRelations = creatorSnap.data().socialRelations || [];
      }
    } catch (err) {
      console.error("Error fetching creator social relations during check:", err);
    }

    const w_D = data.weights.w_D;
    const w_G = data.weights.w_G;
    const w_S = data.weights.w_S;
    const w_X = data.weights.w_X;
    const muVal = data.mu;
    const sigmaVal = data.sigma;

    const candidates = [];
    
    // Load metadata from user_packs (with users collection fallback)
    const allUsers = [];
    const userPacksSnapshot = await db.collection("user_packs").get();
    if (!userPacksSnapshot.empty) {
      userPacksSnapshot.forEach((packDoc) => {
        const packData = packDoc.data();
        if (Array.isArray(packData.users)) {
          allUsers.push(...packData.users);
        }
      });
    } else {
      const usersSnapshot = await db.collection("users")
        .select("uid", "displayName", "birthDate", "gender", "post", "socialRelations", "geography")
        .get();
      usersSnapshot.forEach((doc) => {
        allUsers.push(doc.data());
      });
    }
    // De-duplicate users by uid to prevent multiple entries in candidates
    const uniqueUsersMap = new Map();
    allUsers.forEach((user) => {
      if (user && user.uid !== undefined) {
        uniqueUsersMap.set(user.uid, user);
      }
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    const filteredCandidates = [];
    uniqueUsers.forEach((user) => {
      const isCreator = (user.uid === parseInt(submitterId));

      const dScore = evaluateDemographics(user, data.demographics);
      if (dScore === 0.0 && w_D > 0 && !isCreator) return;

      const homeAnchor = (user.geography || []).find((g) => g.type === "home");
      let distance = 0;
      let gScore = 1.0;
      if (homeAnchor && homeAnchor.geo) {
        distance = haversineDistance(location, homeAnchor.geo);
        const maxDistance = muVal + 3 * sigmaVal;
        if (distance > maxDistance && w_G > 0 && !isCreator) return;

        if (distance > muVal) {
          gScore = Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
        }
      } else {
        if (!isCreator) return;
        gScore = 0.0;
      }

      let xScore = 0.0;
      const relation = submitterRelations.find((r) => r.relative === user.uid);
      if (relation) {
        if (relation.tie !== undefined && relation.tie !== null) {
          xScore = parseFloat(relation.tie) || 0.0;
        } else {
          const type = relation.type ? relation.type.toLowerCase() : "";
          if (["spouse", "partner", "wife", "husband"].includes(type)) xScore = 0.3;
          else if (["parent", "father", "mother", "child", "son", "daughter", "sibling", "sister", "brother"].includes(type)) xScore = 0.2;
          else if (["grandparent", "grandfather", "grandmother", "grandchild", "grandson", "granddaughter", "close friend"].includes(type)) xScore = 0.1;
        }
      }

      // Calculate max possible score (assuming S_score = 1.0)
      const maxScore = w_D * dScore + w_G * gScore + w_S * 1.0 + w_X * xScore;
      if (maxScore <= 0.15 && !isCreator) return;

      filteredCandidates.push({
        user: user,
        dScore: dScore,
        gScore: gScore,
        xScore: xScore,
        maxScore: maxScore,
        isCreator: isCreator
      });
    });

    // Sort by maxScore descending to get the top candidates for vector fetching
    filteredCandidates.sort((a, b) => b.maxScore - a.maxScore);

    // Limit vector fetching to top 300 candidates, ensuring creator is fetched
    const creatorIndex = filteredCandidates.findIndex(c => c.isCreator);
    const candidatesToFetch = filteredCandidates.slice(0, 300);
    if (creatorIndex !== -1 && creatorIndex >= 300) {
      candidatesToFetch.push(filteredCandidates[creatorIndex]);
    }

    // Stage 3: Semantic Similarity (Batch Fetch Vectors from user_vectors for top 300)
    const vectorScores = new Map();
    if (candidatesToFetch.length > 0 && w_S > 0) {
      const refs = candidatesToFetch.map((c) => db.collection("user_vectors").doc(String(c.user.uid)));
      const chunkSize = 500;
      for (let i = 0; i < refs.length; i += chunkSize) {
        const chunkRefs = refs.slice(i, i + chunkSize);
        const vectorDocs = await db.getAll(...chunkRefs);
        vectorDocs.forEach((docSnap) => {
          if (docSnap.exists) {
            const vData = docSnap.data();
            const userVectorField = vData.profile_vector;
            if (userVectorField) {
              let userVector = null;
              if (typeof userVectorField.toArray === "function") {
                userVector = userVectorField.toArray();
              } else if (Array.isArray(userVectorField)) {
                userVector = userVectorField;
              } else if (userVectorField._values) {
                userVector = userVectorField._values;
              }
              if (userVector) {
                const sScore = Math.max(0, cosineSimilarity(issueVector, userVector));
                vectorScores.set(String(vData.uid), sScore);
              }
            }
          }
        });
      }
    }

    filteredCandidates.forEach((c, index) => {
      const user = c.user;
      const dScore = c.dScore;
      const gScore = c.gScore;
      const xScore = c.xScore;
      const isCreator = c.isCreator;

      let sScore = 0.0;
      if (w_S > 0 && (index < 300 || isCreator)) {
        sScore = vectorScores.get(String(user.uid)) || 0.0;
      }

      const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

      if (relevanceScore > 0.15 || isCreator) {
        candidates.push({
          uid: String(user.uid),
          name: user.displayName + (isCreator ? " (Creator)" : ""),
          D: dScore,
          G: gScore,
          S: sScore,
          X: xScore,
          score: relevanceScore,
          isCreator: isCreator
        });
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    let top25 = [];
    const creatorMember = candidates.find(c => c.isCreator);
    if (creatorMember) {
      const top25Candidates = candidates.slice(0, 25);
      const containsCreator = top25Candidates.some(c => c.isCreator);
      if (containsCreator) {
        top25 = top25Candidates;
      } else {
        top25 = candidates.slice(0, 24);
        top25.push(creatorMember);
      }
    } else {
      top25 = candidates.slice(0, 25);
    }

    // Store the derived parameters; createIssue reads its numbers from this draft.
    const draftRef = db.collection("issue_drafts").doc();
    await draftRef.set(makeDraft(inputs, data, new Date().toISOString()));

    res.json({
      success: true,
      draftId: draftRef.id,
      clarification: inputs.clarification,
      // ── Classification ──────────────────────────────────────────────────
      category: data.category,
      classification: data.classification || null,
      // ── Geographic ──────────────────────────────────────────────────────
      mu: muVal,
      sigma: sigmaVal,
      geographic_parameters: data.geographic_parameters || null,
      // ── Relevance ───────────────────────────────────────────────────────
      weights: data.weights,
      relevance_weights: data.relevance_weights,
      relevance_reasoning: data.relevance_reasoning,
      relevance_explanations: data.relevance_explanations || null,
      // ── Aggregation ─────────────────────────────────────────────────────
      aggregation_weights: data.aggregation_weights,
      aggregation_reasoning: data.aggregation_reasoning,
      isr_explanations: data.isr_explanations || null,
      // ── Demographics ────────────────────────────────────────────────────
      demographics: data.demographics,
      demographic_rules: data.demographic_rules || data.demographics || null,
      // ── Expertise ───────────────────────────────────────────────────────
      expertise_depth: data.expertise_depth,
      expertise_domain: data.expertise_domain || "General Maintenance",
      expertise_domain_parameters: data.expertise_domain_parameters || null,
      // ── Resources ───────────────────────────────────────────────────────
      resources_needed: data.resources_needed || [],
      // ── Ad-hoc Public ──────────────────────────────────────────────────
      members_count: candidates.length,
      members: top25
    });

  } catch (error) {
    console.error("Error checking issue:", error);
    res.status(500).json({ error: "Failed to perform check calculations." });
  }
});
