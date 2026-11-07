/**
 * Geographic relevance (G), task A3.
 *
 * d is the distance from the issue location to the NEAREST of the user's declared
 * places of type home, work or property (docs/ISR-Relevance-Implementation.md l.111).
 * The G formula itself is unchanged: 1.0 within μ, Gaussian decay beyond μ, and the
 * as-built hard cutoff at μ + 3σ (applied by the callers).
 *
 * Pure functions only, so they can be unit tested without Firebase.
 */

const RELEVANCE_ANCHOR_TYPES = ["home", "work", "property"];
const EARTH_RADIUS_M = 6371e3;

/** [lat, lon] from an array, a GeoPoint or {latitude, longitude}; null if invalid. */
function toLatLon(geo) {
  if (!geo) return null;
  let lat;
  let lon;
  if (Array.isArray(geo)) {
    [lat, lon] = geo;
  } else if (typeof geo === "object") {
    lat = geo.latitude !== undefined ? geo.latitude : geo._latitude;
    lon = geo.longitude !== undefined ? geo.longitude : geo._longitude;
  }
  lat = Number(lat);
  lon = Number(lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return [lat, lon];
}

/** Haversine distance in meters (same arithmetic as the as-built helper). */
function haversineDistance(coords1, coords2) {
  const a1 = toLatLon(coords1);
  const a2 = toLatLon(coords2);
  if (!a1 || !a2) return NaN;
  const lat1 = (a1[0] * Math.PI) / 180;
  const lat2 = (a2[0] * Math.PI) / 180;
  const deltaLat = ((a2[0] - a1[0]) * Math.PI) / 180;
  const deltaLon = ((a2[1] - a1[1]) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Declared places that count for G: home, work and property entries with a valid geo. */
function relevanceAnchors(geography) {
  return (Array.isArray(geography) ? geography : []).filter(
    (g) => g && RELEVANCE_ANCHOR_TYPES.includes(g.type) && toLatLon(g.geo)
  );
}

/** The nearest anchor: {distance, type}, or null when the user has none. */
function nearestAnchor(geography, location) {
  let best = null;
  for (const g of relevanceAnchors(geography)) {
    const d = haversineDistance(location, g.geo);
    if (!Number.isFinite(d)) continue;
    if (best === null || d < best.distance) best = { distance: d, type: g.type };
  }
  return best;
}

function nearestAnchorDistance(geography, location) {
  const n = nearestAnchor(geography, location);
  return n ? n.distance : null;
}

/** G(d): 1.0 if d <= μ, else exp(-(d-μ)² / 2σ²). */
function gScore(distance, mu, sigma) {
  if (distance <= mu) return 1.0;
  return Math.exp(-Math.pow(distance - mu, 2) / (2 * Math.pow(sigma, 2)));
}

/** The as-built hard cutoff: inside μ + 3σ. */
function withinCutoff(distance, mu, sigma) {
  return distance <= mu + 3 * sigma;
}

module.exports = {
  RELEVANCE_ANCHOR_TYPES,
  toLatLon,
  haversineDistance,
  relevanceAnchors,
  nearestAnchor,
  nearestAnchorDistance,
  gScore,
  withinCutoff
};
