import math
import numpy as np

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two coordinates."""
    R = 6371000.0 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def cosine_similarity(vec_a, vec_b):
    """Calculate cosine similarity between two vectors."""
    if vec_a is None or vec_b is None:
        return 0.0
    # Handle Firestore Vector types by calling .values if available
    if hasattr(vec_a, 'values'):
        vec_a = vec_a.values
    if hasattr(vec_b, 'values'):
        vec_b = vec_b.values
        
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def evaluate_demographics(user, topic, category):
    """Demographic Relevance Score (D) [0.0 - 1.0]."""
    category_lower = str(category or '').lower()
    topic_lower = str(topic or '').lower()
    
    # 1. Childcare
    if 'childcare' in category_lower:
        relations = user.get('socialRelations', [])
        # Check if parent
        has_children = any(
            (r.get('type') or '').lower() in ['child', 'son', 'daughter']
            for r in relations
        )
        if has_children:
            return 1.0
        # Check if grandparent
        has_grand = any(
            (r.get('type') or '').lower() in ['grandchild', 'grandson', 'granddaughter']
            for r in relations
        )
        if has_grand:
            return 0.5
        return 0.1
        
    # 2. Governance
    if 'governance' in category_lower:
        is_employed = len(user.get('post', [])) > 0
        return 1.0 if is_employed else 0.8
        
    # 3. Social events / Hobbies
    if 'social' in category_lower or 'event' in category_lower:
        user_skills = [str(s.get('name') or '').lower() for s in user.get('skills', [])]
        user_features = [str(f).lower() for f in user.get('features', [])]
        keywords = ['art', 'book', 'gym', 'music', 'sport', 'game', 'play', 'movie', 'culture']
        
        matches = any(
            k in topic_lower and any(k in s for s in user_skills + user_features)
            for k in keywords
        )
        return 1.0 if matches else 0.5
        
    # 4. Utilities / EV charging
    if 'utilities' in category_lower and ('ev' in topic_lower or 'charger' in topic_lower):
        user_job = [str(p.get('job') or '').lower() for p in user.get('post', [])]
        is_tech_or_transport = any(
            any(k in j for k in ['driver', 'electric', 'tech', 'engineer', 'logistics'])
            for j in user_job
        )
        return 1.0 if is_tech_or_transport else 0.5
        
    # Default fallback
    return 1.0

def evaluate_geographics(user, topic_location, affection_distance_km):
    """Geographic Relevance Score (G) based on Gaussian decay."""
    if topic_location is None or affection_distance_km is None:
        return 1.0
        
    # Find user home anchor
    home_anchor = None
    for geo in user.get('geography', []):
        if geo.get('type') == 'home':
            home_anchor = geo
            break
            
    if home_anchor is None or 'geo' not in home_anchor:
        return 0.0
        
    user_lat, user_lon = home_anchor['geo'][0], home_anchor['geo'][1]
    
    # Resolve topic location (Firestore GeoPoint or array)
    if hasattr(topic_location, 'latitude') and hasattr(topic_location, 'longitude'):
        topic_lat = topic_location.latitude
        topic_lon = topic_location.longitude
    elif isinstance(topic_location, (list, tuple)) and len(topic_location) >= 2:
        topic_lat = topic_location[0]
        topic_lon = topic_location[1]
    else:
        return 1.0
        
    distance = haversine_distance(user_lat, user_lon, topic_lat, topic_lon)
    mu = float(affection_distance_km) * 1000.0 # to meters
    sigma = mu * 0.5 # Gaussian standard deviation
    
    if distance <= mu:
        return 1.0
    return float(math.exp(-((distance - mu) ** 2) / (2.0 * (sigma ** 2))))

def evaluate_semantics(user, topic_embedding):
    """Semantic Relevance Score (S) based on vector cosine similarity."""
    if topic_embedding is None:
        return 0.5
        
    user_vector = user.get('profile_vector')
    if user_vector is None:
        return 0.5
        
    # Handle Firestore Vector wrapper
    if hasattr(user_vector, 'values'):
        user_vector = user_vector.values
        
    return max(0.0, cosine_similarity(user_vector, topic_embedding))

def evaluate_social(user, creator_relations):
    """Social Graph Relevance Score (X)."""
    if not creator_relations:
        return 0.0
        
    # Find connection to the user
    user_uid = user.get('uid')
    matching_relation = None
    for r in creator_relations:
        if r.get('relative') == user_uid:
            matching_relation = r
            break
            
    if matching_relation is None:
        return 0.0
        
    if matching_relation.get('tie') is not None:
        return float(matching_relation['tie'])
        
    rel_type = str(matching_relation.get('type') or '').lower()
    
    if rel_type in ['spouse', 'partner', 'wife', 'husband']:
        return 0.3
    if rel_type in ['parent', 'father', 'mother', 'child', 'son', 'daughter', 'sibling', 'sister', 'brother']:
        return 0.2
    if rel_type in ['grandparent', 'grandfather', 'grandmother', 'grandchild', 'grandson', 'granddaughter', 'close friend']:
        return 0.1
    return 0.0

def calculate_relevance(user, topic_data, creator_relations=None):
    """Weighted sum of all 4 relevance scores."""
    w_d = float(topic_data.get('w_demographic', 0.2))
    w_g = float(topic_data.get('w_geographic', 0.6))
    w_s = float(topic_data.get('w_semantic', 0.1))
    w_x = float(topic_data.get('w_social', 0.1))
    
    d_score = evaluate_demographics(user, topic_data.get('topic'), topic_data.get('category'))
    g_score = evaluate_geographics(user, topic_data.get('location'), topic_data.get('affection_distance'))
    s_score = evaluate_semantics(user, topic_data.get('embedding') or topic_data.get('topic_vector'))
    x_score = evaluate_social(user, creator_relations or [])
    
    relevance = w_d * d_score + w_g * g_score + w_s * s_score + w_x * x_score
    return float(max(0.0, min(1.0, relevance)))
