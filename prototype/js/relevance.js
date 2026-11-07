/**
 * localHaversine - Calculates the haversine distance in meters between two coordinates.
 */
function localHaversine(coords1, coords2) {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coords1[0] * Math.PI) / 180;
  const lat2 = (coords2[0] * Math.PI) / 180;
  const deltaLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * localEvaluateDemographics - Evaluates demographic eligibility criteria on a user document.
 */
function localEvaluateDemographics(user, criteria) {
  if (!criteria) return 1.0;
  if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
    if (user.birthDate) {
      const birthYear = parseInt(user.birthDate.split("-")[0]);
      if (!isNaN(birthYear)) {
        const age = new Date().getFullYear() - birthYear;
        if (criteria.minAge !== undefined && age < criteria.minAge) return 0.0;
        if (criteria.maxAge !== undefined && age > criteria.maxAge) return 0.0;
      }
    }
  }
  if (criteria.employmentStatus && criteria.employmentStatus !== "any") {
    const isEmployed = Array.isArray(user.post) && user.post.length > 0;
    if (criteria.employmentStatus === "employed" && !isEmployed) return 0.0;
    if (criteria.employmentStatus === "unemployed" && isEmployed) return 0.0;
  }
  if (criteria.familyStatus && criteria.familyStatus !== "any") {
    const relations = user.socialRelations || [];
    const hasChildren = relations.some((r) =>
      ["child", "son", "daughter"].includes((r.type || "").toLowerCase())
    );
    const hasGrandchildren = relations.some((r) =>
      ["grandchild", "grandson", "granddaughter"].includes((r.type || "").toLowerCase())
    );
    if (criteria.familyStatus === "parent" && !hasChildren) return 0.0;
    if (criteria.familyStatus === "grandparent" && !hasGrandchildren) return 0.0;
  }
  return 1.0;
}

/**
 * runLocalRelevanceCheck - Simulates the backend relevance pipeline checks on the client side.
 */
async function runLocalRelevanceCheck(title, description, location, submitterId, db) {
  const lowerDesc = description.toLowerCase() + " " + title.toLowerCase();
  let cat = "building.maintenance.general";
  let w = { w_D: 0.2, w_G: 0.6, w_S: 0.1, w_X: 0.1 };
  let mu = 100;
  let sigma = 50;
  let exp = "None";
  let demo = { employmentStatus: "any", familyStatus: "any" };
  let relevance_reasoning = "General civic topic relevance weights.";
  let aggregation_weights = { w_relevance: 0.4, w_expertise: 0.3, w_contribution: 0.3 };
  let aggregation_reasoning = "General civic topic aggregation weights.";

  if (lowerDesc.includes("lock") || lowerDesc.includes("key") || lowerDesc.includes("entrance")) {
    cat = "building.security.locks";
    w = { w_D: 0.1, w_G: 0.7, w_S: 0.1, w_X: 0.1 };
    mu = 30;
    sigma = 40;
    relevance_reasoning = "Building entrance locks directly affect residents' access. Proximity (G) is the main factor.";
    aggregation_weights = { w_relevance: 0.7, w_expertise: 0.1, w_contribution: 0.2 };
    aggregation_reasoning = "Physical access is an experiential issue, so direct relevance dominates, with secondary weight on past contribution.";
  } else if (lowerDesc.includes("heating") || lowerDesc.includes("radiator")) {
    cat = "building.maintenance.heating";
    w = { w_D: 0.1, w_G: 0.8, w_S: 0.05, w_X: 0.05 };
    mu = 50;
    sigma = 45;
    relevance_reasoning = "Heating issues affect residents in the immediate vicinity. Geographic proximity is highly primary.";
    aggregation_weights = { w_relevance: 0.7, w_expertise: 0.1, w_contribution: 0.2 };
    aggregation_reasoning = "Experiential temperature control issue where lived relevance dominates the decision.";
  } else if (lowerDesc.includes("leak") || lowerDesc.includes("water") || lowerDesc.includes("plumbing")) {
    cat = "building.maintenance.water";
    w = { w_D: 0.1, w_G: 0.8, w_S: 0.05, w_X: 0.05 };
    mu = 40;
    sigma = 35;
    relevance_reasoning = "Plumbing issues affect residents in the immediate vicinity. Geographic proximity is primary.";
    aggregation_weights = { w_relevance: 0.7, w_expertise: 0.1, w_contribution: 0.2 };
    aggregation_reasoning = "Experiential plumbing issue where lived relevance dominates the decision.";
  } else if (lowerDesc.includes("dance") || lowerDesc.includes("event") || lowerDesc.includes("concert") || lowerDesc.includes("chess")) {
    cat = "social.event.cultural";
    w = { w_D: 0.1, w_G: 0.2, w_S: 0.6, w_X: 0.1 };
    mu = 1000;
    sigma = 4000;
    exp = "Vocational Training";
    relevance_reasoning = "Chess or social events interest people semantically. Social connections and proximity are secondary.";
    aggregation_weights = { w_relevance: 0.5, w_expertise: 0.2, w_contribution: 0.3 };
    aggregation_reasoning = "Event organization balances interest/relevance with event coordination experience (contribution).";
  } else if (lowerDesc.includes("park") || lowerDesc.includes("renovation") || lowerDesc.includes("tree")) {
    cat = "environment.green_space";
    w = { w_D: 0.3, w_G: 0.5, w_S: 0.1, w_X: 0.1 };
    mu = 300;
    sigma = 200;
    relevance_reasoning = "Green spaces are highly local (G) and demographic status affects playground/garden usage.";
    aggregation_weights = { w_relevance: 0.6, w_expertise: 0.2, w_contribution: 0.2 };
    aggregation_reasoning = "Neighborhood green space is primary for local residents, with secondary weight for environmental/botanical expertise.";
  }

  const suggestedParams = {
    category: cat,
    weights: w,
    w_relevance: aggregation_weights.w_relevance,
    w_expertise: aggregation_weights.w_expertise,
    w_contribution: aggregation_weights.w_contribution,
    relevance_reasoning: relevance_reasoning,
    aggregation_reasoning: aggregation_reasoning,
    mu: mu,
    sigma: sigma,
    demographics: demo,
    expertise_depth: exp,
    expertise_domain: cat === "social.event.cultural" ? "Event Coordination" : "General Maintenance"
  };

  // Perform relevance score pipeline client-side
  const usersSnapshot = await db.collection("users").get();
  const relevanceResults = [];

  let submitterRelations = [];
  const creatorSnap = await db.collection("users").doc(submitterId.toString()).get();
  if (creatorSnap.exists) {
    submitterRelations = creatorSnap.data().socialRelations || [];
  }

  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    const uidStr = user.uid.toString();
    const isCreator = uidStr === submitterId.toString();

    const dScore = localEvaluateDemographics(user, suggestedParams.demographics);
    if (dScore === 0.0 && suggestedParams.weights.w_D > 0 && !isCreator) return;

    let distance = 0;
    let gScore = 1.0;
    // A3: nearest of home, work and property (this browser copy is not called; kept in step)
    const anchors = (user.geography || []).filter((g) => g && ["home", "work", "property"].includes(g.type) && g.geo);
    if (anchors.length > 0) {
      distance = Math.min(...anchors.map((g) => localHaversine(location, g.geo)));
      const maxDistance = suggestedParams.mu + 3 * suggestedParams.sigma;
      if (distance > maxDistance && suggestedParams.weights.w_G > 0 && !isCreator) return;

      if (distance > suggestedParams.mu) {
        gScore = Math.exp(
          -Math.pow(distance - suggestedParams.mu, 2) / (2 * Math.pow(suggestedParams.sigma, 2))
        );
      }
    } else {
      if (!isCreator) return;
      gScore = 0.0;
    }

    // Semantic Text Overlap Fallback
    const userInterests = [
      ...(user.skills || []).map((s) => s.specialization || s.comment || ""),
      ...(user.post || []).map((p) => p.job || ""),
      user.values_description || ""
    ]
      .join(" ")
      .toLowerCase();

    const issueWords = (description + " " + title)
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    let matchCount = 0;
    issueWords.forEach((w) => {
      if (userInterests.includes(w)) matchCount++;
    });
    const sScore = Math.min(1.0, Math.max(0.05, matchCount / (issueWords.length || 1) + 0.1));

    // Social relation
    let xScore = 0.0;
    const relation = submitterRelations.find((r) => r.relative.toString() === uidStr);
    if (relation) {
      if (relation.tie !== undefined && relation.tie !== null) {
        xScore = parseFloat(relation.tie) || 0.0;
      } else {
        const type = (relation.type || "").toLowerCase();
        if (["spouse", "partner", "wife", "husband"].includes(type)) xScore = 0.3;
        else if (
          [
            "parent",
            "father",
            "mother",
            "child",
            "son",
            "daughter",
            "sibling",
            "sister",
            "brother"
          ].includes(type)
        )
          xScore = 0.2;
        else if (
          [
            "grandparent",
            "grandfather",
            "grandmother",
            "grandchild",
            "grandson",
            "granddaughter",
            "close friend"
          ].includes(type)
        )
          xScore = 0.1;
      }
    }

    const relevanceScore =
      suggestedParams.weights.w_D * dScore +
      suggestedParams.weights.w_G * gScore +
      suggestedParams.weights.w_S * sScore +
      suggestedParams.weights.w_X * xScore;

    if (relevanceScore > 0.15 || isCreator) {
      relevanceResults.push({
        uid: uidStr,
        name: (user.displayName || `User ${user.uid}`) + (isCreator ? " (Creator)" : ""),
        score: relevanceScore,
        D: dScore,
        G: gScore,
        S: sScore,
        X: xScore,
        isCreator: isCreator
      });
    }
  });

  relevanceResults.sort((a, b) => b.score - a.score);
  let top25 = [];
  const creatorMember = relevanceResults.find((c) => c.isCreator);
  if (creatorMember) {
    const top25Candidates = relevanceResults.slice(0, 25);
    const containsCreator = top25Candidates.some((c) => c.isCreator);
    if (containsCreator) {
      top25 = top25Candidates;
    } else {
      top25 = relevanceResults.slice(0, 24);
      top25.push(creatorMember);
    }
  } else {
    top25 = relevanceResults.slice(0, 25);
  }

  return {
    success: true,
    suggestedParams,
    calculatedMembers: top25
  };
}
