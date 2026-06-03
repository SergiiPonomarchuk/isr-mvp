/**
 * ISR Relevance Evaluator
 * Based on ISR (Inclusive Systemic Representation) documentation.
 * Calculates relevance score [0.0 - 1.0] for a user on a given discussion topic.
 */

// Helper: Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0.0 || normB === 0.0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Evaluates the Demographic score (D) for a user on a given topic/category.
 */
function evaluateDemographics(user, topic, category) {
  const categoryLower = (category || '').toLowerCase();
  const topicLower = (topic || '').toLowerCase();

  // Childcare category
  if (categoryLower.includes('childcare')) {
    const relations = user.socialRelations || [];
    const hasChildren = relations.some(r =>
      ['child', 'son', 'daughter'].includes((r.type || '').toLowerCase())
    );
    if (hasChildren) return 1.0;

    const hasGrandchildren = relations.some(r =>
      ['grandchild', 'grandson', 'granddaughter'].includes((r.type || '').toLowerCase())
    );
    if (hasGrandchildren) return 0.5;
    return 0.1;
  }

  // Governance category
  if (categoryLower.includes('governance')) {
    const isEmployed = Array.isArray(user.post) && user.post.length > 0;
    return isEmployed ? 1.0 : 0.8;
  }

  // Social events / hobbies
  if (categoryLower.includes('social') || categoryLower.includes('event')) {
    const userSkills = (user.skills || []).map(s => (s.name || '').toLowerCase());
    const userFeatures = (user.features || []).map(f => f.toLowerCase());
    const keywords = ['art', 'book', 'gym', 'music', 'sport', 'game', 'play', 'movie', 'culture'];
    const matches = keywords.some(k =>
      topicLower.includes(k) &&
      (userSkills.some(s => s.includes(k)) || userFeatures.some(f => f.includes(k)))
    );
    return matches ? 1.0 : 0.5;
  }

  // Utilities / EV charging
  if (categoryLower.includes('utilities') && (topicLower.includes('ev') || topicLower.includes('charger'))) {
    const userJob = (user.post || []).map(p => (p.job || '').toLowerCase());
    const isTechOrTransport = userJob.some(j =>
      j.includes('driver') || j.includes('electric') || j.includes('tech') || j.includes('engineer') || j.includes('logistics')
    );
    return isTechOrTransport ? 1.0 : 0.5;
  }

  // Default neutral
  return 1.0;
}

/**
 * Evaluates the Geographic score (G) based on Gaussian decay.
 */
function evaluateGeographics(user, topicLocation, affectionDistanceKm) {
  if (!topicLocation || affectionDistanceKm === undefined || affectionDistanceKm === null) {
    return 1.0;
  }

  const userHome = (user.geography || []).find(g => g.type === 'home');
  if (!userHome || !userHome.geo) {
    return 0.0;
  }

  const userLat = userHome.geo[0];
  const userLon = userHome.geo[1];

  let topicLat, topicLon;
  if (typeof topicLocation.latitude === 'number' && typeof topicLocation.longitude === 'number') {
    topicLat = topicLocation.latitude;
    topicLon = topicLocation.longitude;
  } else if (Array.isArray(topicLocation) && topicLocation.length >= 2) {
    topicLat = topicLocation[0];
    topicLon = topicLocation[1];
  } else {
    return 1.0;
  }

  const distance = haversineDistance(userLat, userLon, topicLat, topicLon);
  const mu = affectionDistanceKm * 1000; // convert to meters
  const sigma = mu * 0.5; // Gaussian decay steepness

  if (distance <= mu) {
    return 1.0;
  }
  return Math.exp(-Math.pow(distance - mu, 2) / (2 * Math.pow(sigma, 2)));
}

/**
 * Evaluates the Semantic score (S) based on vector cosine similarity.
 */
function evaluateSemantics(user, topicEmbedding) {
  if (!topicEmbedding) return 0.5;
  
  let userVector = null;
  if (user.profile_vector) {
    if (typeof user.profile_vector.toArray === 'function') {
      userVector = user.profile_vector.toArray();
    } else if (Array.isArray(user.profile_vector)) {
      userVector = user.profile_vector;
    } else if (user.profile_vector._values) {
      userVector = user.profile_vector._values;
    }
  }

  if (!userVector) return 0.5;
  return Math.max(0.0, cosineSimilarity(userVector, topicEmbedding));
}

/**
 * Evaluates the Social score (X) based on relation to the topic creator.
 */
function evaluateSocial(user, creatorRelations) {
  if (!creatorRelations || creatorRelations.length === 0) return 0.0;

  const relation = creatorRelations.find(r => r.relative === user.uid);
  if (!relation) return 0.0;

  if (relation.tie !== undefined && relation.tie !== null) {
    return parseFloat(relation.tie) || 0.0;
  }

  const type = (relation.type || '').toLowerCase();
  if (['spouse', 'partner', 'wife', 'husband'].includes(type)) {
    return 0.3;
  }
  if (['parent', 'father', 'mother', 'child', 'son', 'daughter', 'sibling', 'sister', 'brother'].includes(type)) {
    return 0.2;
  }
  if (['grandparent', 'grandfather', 'grandmother', 'grandchild', 'grandson', 'granddaughter', 'close friend'].includes(type)) {
    return 0.1;
  }
  return 0.0;
}

/**
 * Core combined relevance calculation.
 */
function calculateRelevance(user, topicData, creatorRelations = []) {
  const wD = topicData.w_demographic !== undefined ? topicData.w_demographic : 0.2;
  const wG = topicData.w_geographic !== undefined ? topicData.w_geographic : 0.6;
  const wS = topicData.w_semantic !== undefined ? topicData.w_semantic : 0.1;
  const wX = topicData.w_social !== undefined ? topicData.w_social : 0.1;

  const D = evaluateDemographics(user, topicData.topic, topicData.category);
  const G = evaluateGeographics(user, topicData.location, topicData.affection_distance);
  const S = evaluateSemantics(user, topicData.embedding || topicData.topic_vector);
  const X = evaluateSocial(user, creatorRelations);

  const relevance = wD * D + wG * G + wS * S + wX * X;
  return Math.max(0.0, Math.min(1.0, relevance));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    haversineDistance,
    cosineSimilarity,
    evaluateDemographics,
    evaluateGeographics,
    evaluateSemantics,
    evaluateSocial,
    calculateRelevance
  };
}
