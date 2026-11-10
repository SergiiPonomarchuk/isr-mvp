/**
 * Task U6: the issue's point comes from its description (R1, R2).
 *
 * The Analyzer returns `location_reference` {anchor, place}; this module turns it into a
 * point from the creator's profile places, a place lookup (the geocoder is passed in), or the
 * pin the creator moved. Pure, so it can be unit tested without Firebase or the network.
 */
const { toLatLon, haversineDistance } = require("./geo");

const ANCHORS = ["home", "work", "property", "named_place", "none"];
const SOURCES = ["creator", "home", "work", "property", "named_place", "home_fallback", "assumed_home", "default"];
const MAX_PLACE = 120;
const OSM_CREDIT = "© OpenStreetMap contributors";

/** {anchor, place} from whatever the model returned; anything unknown is "none". */
function normalizeLocationReference(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  let anchor = typeof r.anchor === "string" ? r.anchor.trim().toLowerCase() : "";
  if (!ANCHORS.includes(anchor)) anchor = "none";
  let place = typeof r.place === "string" ? r.place.replace(/\s+/g, " ").trim().slice(0, MAX_PLACE) : "";
  if (anchor !== "named_place") place = "";
  if (anchor === "named_place" && !place) anchor = "none";
  return { anchor, place };
}

// The keyword fallback (no model): the words the prompt lists (R1).
const NAMED_PLACE_RE = new RegExp(
  "\\b(?:on|at|in|near|along|by)\\s+(?:the\\s+)?((?:[A-Z][\\w'.-]*\\s+){0,3}" +
  "(?:Street|St\\.|Road|Rd\\.|Avenue|Ave\\.|Square|Park|Lane|Boulevard|Bridge|Station|School|Market|" +
  "Strasse|Straße|Platz|Gasse|Weg|Allee|Ring|Graben))\\b"
);
const HOME_RE = /\b(?:our|my)\s+(?:house|home|building|block|entrance|entry|yard|courtyard|stairwell|staircase|flat|apartment|street|neighbou?rhood|lift|elevator|basement|attic|roof)\b|\bnear\s+(?:my|our)\s+home\b/i;
const WORK_RE = /\bat\s+work\b|\b(?:our|my)\s+(?:office|factory|workplace|plant|company|shop\s+floor|warehouse)\b/i;
const PROPERTY_RE = /\b(?:my|our)\s+(?:garage|plot|land|allotment|dacha|cottage|summer\s+house|field|parking\s+space)\b/i;

/** The anchor from keywords, used when the model is unavailable. */
function keywordLocationReference(text) {
  const t = String(text || "");
  const m = NAMED_PLACE_RE.exec(t);
  if (m) return { anchor: "named_place", place: m[1].trim().slice(0, MAX_PLACE) };
  if (HOME_RE.test(t)) return { anchor: "home", place: "" };
  if (WORK_RE.test(t)) return { anchor: "work", place: "" };
  if (PROPERTY_RE.test(t)) return { anchor: "property", place: "" };
  return { anchor: "none", place: "" };
}

/** The first profile place of a type with a valid point: {point, entry} or null. */
function profilePlace(geography, type) {
  for (const g of Array.isArray(geography) ? geography : []) {
    if (!g || g.type !== type) continue;
    const p = toLatLon(g.geo);
    if (p) return { point: p, entry: g };
  }
  return null;
}

/** True when two points are within `meters` of each other. */
function samePoint(a, b, meters = 1) {
  const d = haversineDistance(a, b);
  return Number.isFinite(d) && d <= meters;
}

const LABELS = {
  creator: "set by you",
  home: "your home (from the description)",
  work: "your work place (from the description)",
  property: "your property (from the description)",
  assumed_home: "your home (no place in the description)",
  default: "the point on the map (no home in your profile)",
};

/**
 * The point the description gives, without the creator's pin (R2).
 * @param {object} a
 *   reference  normalised {anchor, place}
 *   geography  the creator's users/{uid}.geography
 *   fallback   [lat, lng] used when the profile has no home (the point the browser sent)
 *   geocode    async (place, homePoint) => {status: "found"|"not_found"|"off"|"error", point?, display_name?}
 * @returns {Promise<{location, source, label, place?}>}
 */
async function resolveFromDescription({ reference, geography, fallback, geocode }) {
  const ref = normalizeLocationReference(reference);
  const home = profilePlace(geography, "home");
  if (!home) return { location: fallback, source: "default", label: LABELS.default };
  const homeFallback = (why) => ({ location: home.point, source: "home_fallback", label: `your home (${why})` });

  if (ref.anchor === "home") return { location: home.point, source: "home", label: LABELS.home };
  if (ref.anchor === "work" || ref.anchor === "property") {
    const p = profilePlace(geography, ref.anchor);
    if (!p) return homeFallback(`no ${ref.anchor === "work" ? "work place" : "property"} in your profile`);
    return { location: p.point, source: ref.anchor, label: LABELS[ref.anchor] };
  }
  if (ref.anchor === "named_place") {
    let found = null;
    try {
      found = geocode ? await geocode(ref.place, home.point) : { status: "off" };
    } catch (_) {
      found = { status: "error" };
    }
    if (found && found.status === "found" && toLatLon(found.point)) {
      return {
        location: toLatLon(found.point), source: "named_place", place: ref.place,
        label: `${ref.place} (${OSM_CREDIT})`,
      };
    }
    if (found && found.status === "off") return homeFallback("place search is off");
    return homeFallback(`"${ref.place}" not found near your home`);
  }
  return { location: home.point, source: "assumed_home", label: LABELS.assumed_home };
}

/**
 * The issue's point at Check (R2). A pin the creator moved wins; the point from the
 * description is then kept as `suggested`.
 * @param {object} a  resolveFromDescription's arguments plus
 *   requested        [lat, lng] the browser sent
 *   requestedSource  "creator" when the creator moved the pin, else "auto"
 * @returns {Promise<{location, source, label, suggested}>}
 */
async function resolveIssueLocation({ reference, geography, requested, requestedSource, geocode }) {
  const req = toLatLon(requested);
  const auto = await resolveFromDescription({ reference, geography, fallback: req, geocode });
  if (requestedSource === "creator" && req) {
    return { location: req, source: "creator", label: LABELS.creator, suggested: auto };
  }
  return Object.assign({}, auto, { suggested: null });
}

module.exports = {
  ANCHORS,
  SOURCES,
  OSM_CREDIT,
  normalizeLocationReference,
  keywordLocationReference,
  profilePlace,
  samePoint,
  resolveFromDescription,
  resolveIssueLocation,
};
