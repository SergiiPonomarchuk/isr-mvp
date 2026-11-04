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


# ---------------------------------------------------------------------------
# Task A3: G anchors and places in D. Python port of functions/geo.js and
# functions/demographics.js; both are checked against
# tests/fixtures/a3_d_g_cases.json.
# ---------------------------------------------------------------------------
RELEVANCE_ANCHOR_TYPES = ('home', 'work', 'property')
PROPERTY_KINDS = ('flat', 'house', 'land', 'garage', 'commercial', 'other')
MIN_PLACE_LEN = 3


def _lat_lon(geo):
    """(lat, lon) from a list, a GeoPoint or a dict; None if invalid."""
    if geo is None:
        return None
    if hasattr(geo, 'latitude') and hasattr(geo, 'longitude'):
        lat, lon = geo.latitude, geo.longitude
    elif isinstance(geo, dict):
        lat, lon = geo.get('latitude'), geo.get('longitude')
    elif isinstance(geo, (list, tuple)) and len(geo) >= 2:
        lat, lon = geo[0], geo[1]
    else:
        return None
    try:
        lat, lon = float(lat), float(lon)
    except (TypeError, ValueError):
        return None
    if math.isnan(lat) or math.isnan(lon):
        return None
    return lat, lon


def nearest_anchor(geography, location):
    """(distance_m, type) of the nearest home, work or property entry, or None."""
    loc = _lat_lon(location)
    if loc is None:
        return None
    best = None
    for g in geography or []:
        if not isinstance(g, dict) or g.get('type') not in RELEVANCE_ANCHOR_TYPES:
            continue
        pt = _lat_lon(g.get('geo'))
        if pt is None:
            continue
        d = haversine_distance(pt[0], pt[1], loc[0], loc[1])
        if best is None or d < best[0]:
            best = (d, g.get('type'))
    return best


def g_score(distance, mu, sigma):
    """G(d): 1.0 if d <= mu, else exp(-(d-mu)^2 / 2 sigma^2)."""
    if distance <= mu:
        return 1.0
    return float(math.exp(-((distance - mu) ** 2) / (2.0 * (sigma ** 2))))


def _norm(s):
    return ' '.join(str(s or '').lower().split())


def _names_match(a, b):
    x, y = _norm(a), _norm(b)
    if len(x) < MIN_PLACE_LEN or len(y) < MIN_PLACE_LEN:
        return False
    return x in y or y in x


def place_match(user, criteria):
    """'place', 'property_kind' or None."""
    criteria = criteria or {}
    places = criteria.get('places') or []
    kinds = [_norm(k) for k in (criteria.get('property_kinds') or [])]
    if not places and not kinds:
        return None
    entries = [g for g in (user.get('geography') or [])
               if isinstance(g, dict) and g.get('type') in ('work', 'property')]
    for g in entries:
        if g.get('place') and any(_names_match(p, g.get('place')) for p in places):
            return 'place'
    for g in entries:
        if g.get('type') == 'property' and g.get('kind') and _norm(g.get('kind')) in kinds:
            return 'property_kind'
    return None


def feature_match(user, features):
    """As-built feature matching over features and interests (activity skill names)."""
    interests = [str(s.get('name') or '') for s in (user.get('skills') or [])
                 if isinstance(s, dict) and s.get('type') == 'activity']
    text = ' '.join([str(f) for f in (user.get('features') or [])] + interests).lower()
    for f in features:
        term = str(f).lower().strip()
        if not term:
            continue
        if term in text:
            return True
        if ('pet' in term or 'animal' in term) and any(k in text for k in ('dog', 'cat', 'pet', 'animal')):
            return True
    return False


def evaluate_demographic_rules(user, criteria, now_year=None):
    """Port of functions/demographics.js evaluateDemographics: (score, match, bypass_distance)."""
    import datetime
    if not criteria:
        return 1.0, None, False
    now_year = now_year or datetime.date.today().year
    fail = (0.0, None, False)
    bd = user.get('birthDate')
    if bd:
        try:
            birth_year = int(str(bd).split('-')[0])
        except ValueError:
            birth_year = None
        if birth_year is not None:
            age = now_year - birth_year
            if criteria.get('minAge') is not None and age < criteria['minAge']:
                return fail
            if criteria.get('maxAge') is not None and age > criteria['maxAge']:
                return fail
    emp = criteria.get('employmentStatus')
    if emp and emp != 'any':
        employed = isinstance(user.get('post'), list) and len(user.get('post')) > 0
        if emp == 'employed' and not employed:
            return fail
        if emp == 'unemployed' and employed:
            return fail
    fam = criteria.get('familyStatus')
    if fam and fam != 'any':
        rel = user.get('socialRelations') or user.get('social relations') or []
        types = {str(r.get('type') or '').lower() for r in rel if isinstance(r, dict)}
        if fam == 'parent' and not types & {'child', 'son', 'daughter'}:
            return fail
        if fam == 'grandparent' and not types & {'grandchild', 'grandson', 'granddaughter'}:
            return fail
    pm = place_match(user, criteria)
    if pm:
        return 1.0, pm, True
    feats = criteria.get('features')
    if isinstance(feats, list) and feats:
        if not feature_match(user, feats):
            return fail
        return 1.0, 'feature', False
    return 1.0, None, False


def evaluate_demographics(user, topic, category, criteria=None):
    """Demographic Relevance Score (D) [0.0 - 1.0].

    A3: a place or property-kind match with the issue's demographic rules is a
    cause to include (D = 1.0). Otherwise the as-built category heuristics apply.
    """
    if criteria and place_match(user, criteria):
        return 1.0
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

    # As built: a user without an anchor gets 0.0 before the location is read.
    # A3: home, work and property anchors count (was: home only).
    if not any(isinstance(g, dict) and g.get('type') in RELEVANCE_ANCHOR_TYPES and _lat_lon(g.get('geo'))
               for g in user.get('geography', []) or []):
        return 0.0

    # Resolve topic location (Firestore GeoPoint or array)
    if hasattr(topic_location, 'latitude') and hasattr(topic_location, 'longitude'):
        topic_lat = topic_location.latitude
        topic_lon = topic_location.longitude
    elif isinstance(topic_location, (list, tuple)) and len(topic_location) >= 2:
        topic_lat = topic_location[0]
        topic_lon = topic_location[1]
    else:
        return 1.0
        
    # A3: nearest of home, work and property (was: home only)
    near = nearest_anchor(user.get('geography', []), (topic_lat, topic_lon))
    if near is None:
        return 0.0
    distance = near[0]
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
    
    d_score = evaluate_demographics(user, topic_data.get('topic'), topic_data.get('category'),
                                    topic_data.get('demographics'))
    g_score = evaluate_geographics(user, topic_data.get('location'), topic_data.get('affection_distance'))
    s_score = evaluate_semantics(user, topic_data.get('embedding') or topic_data.get('topic_vector'))
    x_score = evaluate_social(user, creator_relations or [])
    
    relevance = w_d * d_score + w_g * g_score + w_s * s_score + w_x * x_score
    return float(max(0.0, min(1.0, relevance)))
