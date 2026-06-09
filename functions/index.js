const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

// Initialize Gemini API
// Node: Ensure GEMINI_API_KEY environment variable is set
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

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

  return 1.0;
}

// HTTPS Endpoint: Analyze Issue using Gemini 1.5 Flash
exports.analyzeIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.length < 20) {
      return res.status(400).json({ error: "Description must be at least 20 characters." });
    }

    if (!geminiApiKey) {
      // Fallback configuration if no key is set yet
      return res.json({
        category: "building.maintenance.general",
        mu: 50,
        sigma: 40,
        weights: { w_D: 0.2, w_G: 0.6, w_S: 0.1, w_X: 0.1 },
        demographics: { employmentStatus: "any", familyStatus: "any" },
        expertise_depth: "Vocational Training"
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI assistant for the ISR-vote governance platform. Your task is to analyze a user-submitted civic issue and suggest classification parameters.

Analyze this issue description:
"${description}"

Return a JSON object containing:
1. "category": Choose the most specific category matching:
   - "building.security.locks" (door locks, keys, entrance access)
   - "building.security.general" (gates, windows, general security)
   - "building.maintenance.heating" (heating, radiators)
   - "building.maintenance.water" (leaks, plumbing)
   - "building.maintenance.general" (roof, elevators, lighting, noise)
   - "infrastructure.transport.parking" (parking spaces, parking lots)
   - "infrastructure.transport.streets" (potholes, sidewalks, traffic lights)
   - "infrastructure.utilities" (electricity, internet, trash)
   - "social.event.cultural" (concerts, lessons, dance, sports)
   - "community.governance" (budgeting, rules, voting policies)
   - "environment.green_space" (parks, trees, gardens)
   - "health.access" (medication, clinics, health services)

2. "mu": Suggest a primary impact zone radius in meters (where decay begins, users inside are fully affected, relevance = 1.0).
   Guidelines:
   - Unit/personal issue: 10-20m
   - Building-level issue: 30-80m
   - Street-level issue: 100-300m
   - Neighborhood event: 500-2000m
   - City-wide issue: 2000-10000m

3. "sigma": Suggest a decay steepness parameter in meters (distance where relevance decays to ~60%).
   Guidelines:
   - Personal: 20-30m
   - Building: 40-60m
   - Street: 80-150m
   - Neighborhood: 150-300m
   - City-wide: 500-2000m

4. "weights": Suggest demographic (w_D), geographic (w_G), semantic (w_S), and social (w_X) weights summing exactly to 1.0.
   Guidelines:
   - Location-heavy issues (e.g. noise, leak, pothole): G = 0.7, D = 0.1, S = 0.1, X = 0.1
   - Interest-heavy issues (e.g. dance lessons, coding group): S = 0.6, G = 0.2, D = 0.1, X = 0.1
   - Demographic-heavy issues (e.g. senior activities, school lunch): D = 0.6, G = 0.2, S = 0.1, X = 0.1
   - Family/Social issues: X = 0.6, D = 0.2, G = 0.1, S = 0.1

5. "demographics": Structured JSON rules for demographic filtering (use "any" if not applicable):
   - "minAge": number (optional)
   - "maxAge": number (optional)
   - "employmentStatus": "any", "employed", "unemployed", "student", "retired"
   - "familyStatus": "any", "parent", "grandparent"

6. "expertise_depth": Suggest the required education grade needed to resolve this issue. Choose strictly from: "PhD", "Master", "Bachelor", "College", "Vocational Training", "None".

Format your output strictly as a JSON object.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const suggestions = JSON.parse(result.response.text());
    res.json(suggestions);
  } catch (error) {
    console.error("Error analyzing issue:", error);
    res.status(500).json({ error: "Failed to analyze issue description." });
  }
});

// HTTPS Endpoint: Create Issue & Compute Relevance Pipeline
exports.createIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { title, description, location, submitterId, category, mu, sigma, weights, demographics, expertise_depth } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }

    // Step 1: Vectorize issue description
    let issueVector = null;
    if (geminiApiKey) {
      try {
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent(description);
        issueVector = embedResult.embedding.values;
      } catch (err) {
        console.error("Gemini embedding failed, using a fallback mock vector:", err);
      }
    }

    // If no embedding was generated, create a mock 768-dimensional vector
    if (!issueVector) {
      issueVector = new Array(768).fill(0).map(() => Math.random() * 2 - 1);
      // Normalize mock vector
      const mag = Math.sqrt(issueVector.reduce((sum, val) => sum + val * val, 0));
      issueVector = issueVector.map((val) => val / mag);
    }

    // Parse parameters
    const w_D = weights ? parseFloat(weights.w_D) || 0 : 0.1;
    const w_G = weights ? parseFloat(weights.w_G) || 0 : 0.4;
    const w_S = weights ? parseFloat(weights.w_S) || 0 : 0.4;
    const w_X = weights ? parseFloat(weights.w_X) || 0 : 0.1;

    const muVal = parseFloat(mu) || 100;
    const sigmaVal = parseFloat(sigma) || 50;

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
    
    // Stage 1: Filter users matching demographics
    // For scale, we retrieve users. In MVP we stream all, but apply D-filter instantly.
    const usersSnapshot = await db.collection("users")
      .select("uid", "displayName", "birthDate", "gender", "post", "socialRelations", "geography", "profile_vector")
      .get();
    
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.uid === parseInt(submitterId)) return; // Exclude submitter themselves

      // Evaluate Demographic Score (D)
      const dScore = evaluateDemographics(user, demographics);
      if (dScore === 0.0 && w_D > 0) return; // Excluded immediately by demographics!

      // Stage 2: Geographic Distance Filter
      // Locate user home coordinate
      const homeAnchor = (user.geography || []).find((g) => g.type === "home");
      if (!homeAnchor || !homeAnchor.geo) return; // Excluded if no home anchor

      const distance = haversineDistance(location, homeAnchor.geo);
      
      // Exclude if distance is beyond mu + 3*sigma (decay drops below 1%)
      const maxDistance = muVal + 3 * sigmaVal;
      if (distance > maxDistance && w_G > 0) return; // Excluded by distance!

      // Compute Geographic Score (G)
      let gScore = 1.0;
      if (distance > muVal) {
        gScore = Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
      }

      // Stage 3: Semantic Similarity (in-memory)
      let sScore = 0.0;
      if (user.profile_vector) {
        // Retrieve vector array
        let userVector = null;
        if (typeof user.profile_vector.toArray === "function") {
          userVector = user.profile_vector.toArray();
        } else if (Array.isArray(user.profile_vector)) {
          userVector = user.profile_vector;
        } else if (user.profile_vector._values) {
          userVector = user.profile_vector._values;
        }
        
        if (userVector) {
          sScore = Math.max(0, cosineSimilarity(issueVector, userVector));
        }
      }

      // Stage 4: Social Connections
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

      // Calculate final Relevance Score (R)
      const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

      // Add if Relevance > 0.15
      if (relevanceScore > 0.15) {
        candidates.push({
          user_id: user.uid,
          displayName: user.displayName,
          D_score: dScore,
          G_score: gScore,
          S_score: sScore,
          X_score: xScore,
          relevance_score: relevanceScore
        });
      }
    });

    // Sort by relevance score descending and limit to top 100 to optimize microcommunity size
    candidates.sort((a, b) => b.relevance_score - a.relevance_score);
    const microcommunityMembers = candidates.slice(0, 100);

    // Write Issue to Firestore
    const issueRef = db.collection("issues").doc();
    const issueId = issueRef.id;

    const issueDoc = {
      issue_id: issueId,
      title,
      description,
      starts: admin.firestore.FieldValue.serverTimestamp(),
      category: category || "building.maintenance.general",
      location: new admin.firestore.GeoPoint(location[0], location[1]),
      mu_distance_meters: muVal,
      sigma_decay_meters: sigmaVal,
      w_demographic: w_D,
      w_geographic: w_G,
      w_semantic: w_S,
      w_social: w_X,
      submitter_id: String(submitterId),
      status: "open",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      expertise_depth: expertise_depth || "None"
    };
    await issueRef.set(issueDoc);

    // Create Microcommunity Record
    const mcRef = db.collection("microcommunities").doc();
    const mcId = mcRef.id;

    const mcDoc = {
      microcommunity_id: mcId,
      issue_id: issueId,
      threshold_relevance: 0.15,
      member_count: microcommunityMembers.length,
      member_accepted: 0,
      issue_scope: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      status: "active"
    };
    await mcRef.set(mcDoc);

    // Upload microcommunity members
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

    await discRef.set({
      discussion_id: issueId,
      topic: title,
      creator_uid: String(submitterId),
      created_at: new Date().toISOString(),
      message_count: 1,
      location: new admin.firestore.GeoPoint(location[0], location[1]),
      affection_distance: parseFloat((muVal / 1000).toFixed(3)),
      expertise_depth: expertise_depth || "None",
      relevance_scores: relevanceScores,
      last_message_text: description,
      last_message_sender_uid: String(submitterId),
      last_message_sender_name: submitterDisplayName,
      last_message_timestamp: new Date().toISOString()
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
    res.status(500).json({ error: "Failed to create issue and form microcommunity." });
  }
});

// HTTPS Endpoint: Check/Calculate Relevance Pipeline (Dry-run server-side)
exports.checkIssue = onRequest({ cors: true }, async (req, res) => {
  try {
    const { title, description, location, submitterId } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }

    // 1. Analyze issue category, weights, demographics, and expertise depth suggestions via Gemini
    let data = null;
    if (geminiApiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are an AI assistant for the ISR-vote governance platform. Your task is to analyze a user-submitted civic issue and suggest classification parameters.

Analyze this issue description:
"${description}"

Return a JSON object containing:
1. "category": Choose the most specific category matching:
   - "building.security.locks" (door locks, keys, entrance access)
   - "building.security.general" (gates, windows, general security)
   - "building.maintenance.heating" (heating, radiators)
   - "building.maintenance.water" (leaks, plumbing)
   - "building.maintenance.general" (roof, elevators, lighting, noise)
   - "infrastructure.transport.parking" (parking spaces, parking lots)
   - "infrastructure.transport.streets" (potholes, sidewalks, traffic lights)
   - "infrastructure.utilities" (electricity, internet, trash)
   - "social.event.cultural" (concerts, lessons, dance, sports)
   - "community.governance" (budgeting, rules, voting policies)
   - "environment.green_space" (parks, trees, gardens)
   - "health.access" (medication, clinics, health services)

2. "mu": Suggest a primary impact zone radius in meters (where decay begins, users inside are fully affected, relevance = 1.0).
   Guidelines:
   - Unit/personal issue: 10-20m
   - Building-level issue: 30-80m
   - Street-level issue: 100-300m
   - Neighborhood event: 500-2000m
   - City-wide issue: 2000-10000m

3. "sigma": Suggest a decay steepness parameter in meters (distance where relevance decays to ~60%).
   Guidelines:
   - Personal: 20-30m
   - Building: 40-60m
   - Street: 80-150m
   - Neighborhood: 150-300m
   - City-wide: 500-2000m

4. "weights": Suggest demographic (w_D), geographic (w_G), semantic (w_S), and social (w_X) weights summing exactly to 1.0.
   Guidelines:
   - Location-heavy issues (e.g. noise, leak, pothole): G = 0.7, D = 0.1, S = 0.1, X = 0.1
   - Interest-heavy issues (e.g. dance lessons, coding group): S = 0.6, G = 0.2, D = 0.1, X = 0.1
   - Demographic-heavy issues (e.g. senior activities, school lunch): D = 0.6, G = 0.2, S = 0.1, X = 0.1
   - Family/Social issues: X = 0.6, D = 0.2, G = 0.1, S = 0.1

5. "demographics": Structured JSON rules for demographic filtering (use "any" if not applicable):
   - "minAge": number (optional)
   - "maxAge": number (optional)
   - "employmentStatus": "any", "employed", "unemployed", "student", "retired"
   - "familyStatus": "any", "parent", "grandparent"

6. "expertise_depth": Suggest the required education grade needed to resolve this issue. Choose strictly from: "PhD", "Master", "Bachelor", "College", "Vocational Training", "None".

Format your output strictly as a JSON object.
`;
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        data = JSON.parse(result.response.text());
      } catch (err) {
        console.error("Gemini analysis failed during check:", err);
      }
    }

    // Local fallback suggestions if Gemini fails or is not configged
    if (!data) {
      const lowerDesc = (description + " " + title).toLowerCase();
      let cat = "building.maintenance.general";
      let w = { w_D: 0.2, w_G: 0.6, w_S: 0.1, w_X: 0.1 };
      let mu = 100;
      let sigma = 50;
      let exp = "None";
      let demo = { employmentStatus: "any", familyStatus: "any" };

      if (lowerDesc.includes("lock") || lowerDesc.includes("key") || lowerDesc.includes("entrance")) {
        cat = "building.security.locks";
        w = { w_D: 0.1, w_G: 0.7, w_S: 0.1, w_X: 0.1 };
        mu = 30; sigma = 40;
      } else if (lowerDesc.includes("heating") || lowerDesc.includes("radiator")) {
        cat = "building.maintenance.heating";
        w = { w_D: 0.1, w_G: 0.8, w_S: 0.05, w_X: 0.05 };
        mu = 50; sigma = 45;
      } else if (lowerDesc.includes("leak") || lowerDesc.includes("water") || lowerDesc.includes("plumbing")) {
        cat = "building.maintenance.water";
        w = { w_D: 0.1, w_G: 0.8, w_S: 0.05, w_X: 0.05 };
        mu = 40; sigma = 35;
      } else if (lowerDesc.includes("dance") || lowerDesc.includes("event") || lowerDesc.includes("concert")) {
        cat = "social.event.cultural";
        w = { w_D: 0.1, w_G: 0.2, w_S: 0.6, w_X: 0.1 };
        mu = 1000; sigma = 500;
        exp = "Vocational Training";
      } else if (lowerDesc.includes("park") || lowerDesc.includes("renovation") || lowerDesc.includes("tree")) {
        cat = "environment.green_space";
        w = { w_D: 0.3, w_G: 0.5, w_S: 0.1, w_X: 0.1 };
        mu = 300; sigma = 200;
      }
      data = { category: cat, weights: w, mu: mu, sigma: sigma, demographics: demo, expertise_depth: exp };
    }

    // 2. Generate issue embedding
    let issueVector = null;
    if (geminiApiKey) {
      try {
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent(description);
        issueVector = embedResult.embedding.values;
      } catch (err) {
        console.error("Gemini embedding check failed:", err);
      }
    }
    if (!issueVector) {
      issueVector = new Array(768).fill(0).map(() => Math.random() * 2 - 1);
      const mag = Math.sqrt(issueVector.reduce((sum, val) => sum + val * val, 0));
      issueVector = issueVector.map((val) => val / mag);
    }

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
    const usersSnapshot = await db.collection("users")
      .select("uid", "displayName", "birthDate", "gender", "post", "socialRelations", "geography", "profile_vector")
      .get();

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.uid === parseInt(submitterId)) return;

      const dScore = evaluateDemographics(user, data.demographics);
      if (dScore === 0.0 && w_D > 0) return;

      const homeAnchor = (user.geography || []).find((g) => g.type === "home");
      if (!homeAnchor || !homeAnchor.geo) return;

      const distance = haversineDistance(location, homeAnchor.geo);
      const maxDistance = muVal + 3 * sigmaVal;
      if (distance > maxDistance && w_G > 0) return;

      let gScore = 1.0;
      if (distance > muVal) {
        gScore = Math.exp(-Math.pow(distance - muVal, 2) / (2 * Math.pow(sigmaVal, 2)));
      }

      let sScore = 0.0;
      if (user.profile_vector) {
        let userVector = null;
        if (typeof user.profile_vector.toArray === "function") {
          userVector = user.profile_vector.toArray();
        } else if (Array.isArray(user.profile_vector)) {
          userVector = user.profile_vector;
        } else if (user.profile_vector._values) {
          userVector = user.profile_vector._values;
        }
        
        if (userVector) {
          sScore = Math.max(0, cosineSimilarity(issueVector, userVector));
        }
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

      const relevanceScore = w_D * dScore + w_G * gScore + w_S * sScore + w_X * xScore;

      if (relevanceScore > 0.15) {
        candidates.push({
          uid: String(user.uid),
          name: user.displayName,
          D: dScore,
          G: gScore,
          S: sScore,
          X: xScore,
          score: relevanceScore
        });
      }
    });

    // Add creator
    let creatorName = "Creator";
    try {
      const creatorSnap = await db.collection("users").doc(String(submitterId)).get();
      if (creatorSnap.exists) {
        creatorName = creatorSnap.data().displayName || creatorName;
      }
    } catch (e) {}
    candidates.push({
      uid: String(submitterId),
      name: creatorName + " (Creator)",
      D: 1.0, G: 1.0, S: 1.0, X: 1.0,
      score: 1.0
    });

    candidates.sort((a, b) => b.score - a.score);
    const top25 = candidates.slice(0, 25);

    res.json({
      success: true,
      category: data.category,
      mu: muVal,
      sigma: sigmaVal,
      weights: data.weights,
      demographics: data.demographics,
      expertise_depth: data.expertise_depth,
      members_count: candidates.length,
      members: top25
    });

  } catch (error) {
    console.error("Error checking issue:", error);
    res.status(500).json({ error: "Failed to perform check calculations." });
  }
});
