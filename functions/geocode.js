/**
 * Task U6 (R3): the server's place lookup, OpenStreetMap Nominatim, under its usage policy
 * (https://operations.osmfoundation.org/policies/nominatim/):
 * - an identifying User-Agent (the app and its public site; no personal data);
 * - at most 1 request a second per server instance; only at Check, never while typing;
 * - answers cached in Firestore `geocode_cache` for 30 days;
 * - a switch, Firestore `config/geocoding` {enabled}, that the author can turn off without a deploy;
 * - the credit "© OpenStreetMap contributors" wherever a found point is shown (location.js, main.js).
 * Only the place name is sent: no issue text, no user data.
 *
 * The network, the store and the clock are passed in (createGeocoder), so the rules are unit
 * tested without them.
 */
const crypto = require("crypto");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "ISR-MVP/1.0 (+https://project-a3d59130-5adf-4677-9e2.web.app)";
const BOX_DEGREES = 0.3; // about 30 km around the creator's home
const GRID_DEGREES = 0.1; // the box centre is snapped to this grid, so nearby homes share cache entries
const TIMEOUT_MS = 5000;
const MIN_GAP_MS = 1000;
const CACHE_DAYS = 30;
const SWITCH_TTL_MS = 60 * 1000;

const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

/** The place name as it is cached: lower case, single spaces, at most 200 characters. */
function normalizeName(name) {
  return String(name || "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 200);
}

/** [left, top, right, bottom] (lon, lat, lon, lat) around the home, snapped to a 0.1° grid. */
function boxAround(home) {
  const lat = round(Math.round(home[0] / GRID_DEGREES) * GRID_DEGREES, 3);
  const lon = round(Math.round(home[1] / GRID_DEGREES) * GRID_DEGREES, 3);
  return [round(lon - BOX_DEGREES, 3), round(lat + BOX_DEGREES, 3), round(lon + BOX_DEGREES, 3), round(lat - BOX_DEGREES, 3)];
}

function buildUrl(name, box) {
  const q = new URLSearchParams({
    q: String(name),
    format: "jsonv2",
    limit: "1",
    "accept-language": "en",
    viewbox: box.join(","),
    bounded: "1",
  });
  return `${NOMINATIM_URL}?${q.toString()}`;
}

function cacheKey(name, box) {
  return crypto.createHash("sha256").update(`${normalizeName(name)}|${box.join(",")}`, "utf8").digest("hex");
}

/** The first result as {status: "found", point, display_name}, or {status: "not_found"}. */
function parseResults(json) {
  const first = Array.isArray(json) ? json[0] : null;
  const lat = first ? parseFloat(first.lat) : NaN;
  const lon = first ? parseFloat(first.lon) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { status: "not_found" };
  return { status: "found", point: [lat, lon], display_name: String(first.display_name || "").slice(0, 300) };
}

/**
 * @param {object} deps
 *   fetchFn  (url, init) => Promise<Response>        (global fetch on the server)
 *   store    {getSwitch, getCache, putCache}          (firestoreStore(db) on the server)
 *   now      () => milliseconds                      (Date.now)
 *   sleep    (ms) => Promise                          (setTimeout)
 *   log      (message, details) => void               (console.log; no personal data)
 */
function createGeocoder({ fetchFn, store, now = Date.now, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), log = () => {} }) {
  let switchValue = null;
  let switchReadAt = -Infinity;
  let queue = Promise.resolve();
  let lastRequestAt = -Infinity;

  async function enabled() {
    if (now() - switchReadAt < SWITCH_TTL_MS && switchValue !== null) return switchValue;
    let v;
    try {
      v = await store.getSwitch();
    } catch (_) {
      v = undefined; // an unreadable switch counts as on, like a missing document
    }
    switchValue = v !== false;
    switchReadAt = now();
    return switchValue;
  }

  // At most one request a second: each request waits for the one before it.
  function throttled(task) {
    const run = queue.then(async () => {
      const wait = lastRequestAt + MIN_GAP_MS - now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = now();
      return task();
    });
    queue = run.catch(() => {});
    return run;
  }

  async function request(url) {
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
    try {
      const res = await fetchFn(url, {
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
        signal: ctrl ? ctrl.signal : undefined,
      });
      if (!res || !res.ok) return { status: "error", http: res ? res.status : null };
      return parseResults(await res.json());
    } catch (_) {
      return { status: "error" };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /** The point for a place name near the home: {status, point?, display_name?, cached?}. */
  async function geocode(name, home) {
    if (!normalizeName(name) || !Array.isArray(home)) return { status: "not_found" };
    if (!(await enabled())) return { status: "off" };
    const box = boxAround(home);
    const key = cacheKey(name, box);
    let hit = null;
    try {
      hit = await store.getCache(key);
    } catch (_) {
      hit = null;
    }
    const fresh = hit && Date.parse(hit.at) > now() - CACHE_DAYS * 24 * 3600 * 1000;
    if (fresh && (hit.status === "found" || hit.status === "not_found")) {
      return hit.status === "found"
        ? { status: "found", point: hit.point, display_name: hit.display_name || "", cached: true }
        : { status: "not_found", cached: true };
    }
    const out = await throttled(() => request(buildUrl(name, box)));
    log("Nominatim request", { key: key.slice(0, 12), status: out.status });
    if (out.status === "found" || out.status === "not_found") {
      try {
        await store.putCache(key, {
          name: normalizeName(name), box, status: out.status,
          point: out.point || null, display_name: out.display_name || null,
          at: new Date(now()).toISOString(), service: "nominatim",
        });
      } catch (_) { /* a failed cache write never breaks the check */ }
    }
    return Object.assign({ cached: false }, out);
  }

  return { geocode, enabled };
}

/** The Firestore store: the switch `config/geocoding` and the cache `geocode_cache/{key}`. */
function firestoreStore(db) {
  return {
    async getSwitch() {
      const s = await db.collection("config").doc("geocoding").get();
      return s.exists ? s.get("enabled") : undefined;
    },
    async getCache(key) {
      const s = await db.collection("geocode_cache").doc(key).get();
      return s.exists ? s.data() : null;
    },
    async putCache(key, entry) {
      await db.collection("geocode_cache").doc(key).set(entry);
    },
  };
}

module.exports = {
  NOMINATIM_URL,
  USER_AGENT,
  BOX_DEGREES,
  TIMEOUT_MS,
  MIN_GAP_MS,
  CACHE_DAYS,
  SWITCH_TTL_MS,
  normalizeName,
  boxAround,
  buildUrl,
  cacheKey,
  parseResults,
  createGeocoder,
  firestoreStore,
};
