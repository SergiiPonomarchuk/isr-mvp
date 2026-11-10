// Task U8 (option a): the map uses OpenStreetMap's standard tiles under the OSMF tile usage
// policy, with the visible credit; no Google tile server and no Google Maps code path remain.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PROTO = path.join(__dirname, "..", "..", "prototype");
const main = fs.readFileSync(path.join(PROTO, "js", "main.js"), "utf8");
const html = fs.readFileSync(path.join(PROTO, "index.html"), "utf8");

test("the tiles come from tile.openstreetmap.org over HTTPS, with the server's zoom limit", () => {
  const i = main.indexOf("const MAP_TILES = {");
  assert.ok(i >= 0, "one MAP_TILES constant");
  const block = main.slice(i, i + 400);
  assert.match(block, /url: 'https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png'/);
  assert.match(block, /maxZoom: 19/);
  assert.match(block, /attribution: '&copy; <a href="https:\/\/www\.openstreetmap\.org\/copyright"/);
  assert.match(main, /L\.tileLayer\(MAP_TILES\.url, \{\s+maxZoom: MAP_TILES\.maxZoom,\s+attribution: MAP_TILES\.attribution\s+\}\)/);
  assert.equal((main.match(/L\.tileLayer\(/g) || []).length, 1, "one tile layer");
});

test("no Google tile server, no Google Maps code path", () => {
  assert.ok(!/google\.com\/vt/.test(main), "no Google tile URL");
  assert.ok(!/google\.maps/.test(main), "no Google Maps JavaScript API branch");
  assert.ok(!/maps\.google\.com/.test(main), "no Google map assets");
  assert.ok(!/maps\.googleapis\.com/.test(html), "the page loads no Google Maps library");
});

test("no setting that would break the OSM policy: no restrictive Referrer-Policy, no prefetching", () => {
  assert.ok(!/referrerpolicy|name="referrer"/i.test(html), "browsers send the site as Referer");
  assert.ok(!/fetch\([^)]*tile\.openstreetmap/.test(main), "tiles are only loaded by Leaflet, for the view");
});
