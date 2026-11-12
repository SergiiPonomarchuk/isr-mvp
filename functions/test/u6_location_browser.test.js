// Task U6 (R6, R7): static checks of the browser code (prototype/js/main.js, index.html):
// every pin move goes through one function that marks it as the creator's, Check sends the
// point with its source, a moved pin makes the Check stale, the map credits OpenStreetMap, and
// the place search obeys the switch.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PROTO = path.join(__dirname, "..", "..", "prototype");
const main = fs.readFileSync(path.join(PROTO, "js", "main.js"), "utf8");
const html = fs.readFileSync(path.join(PROTO, "index.html"), "utf8");

function body(fnStart, length = 1500) {
  const i = main.indexOf(fnStart);
  assert.ok(i >= 0, `missing: ${fnStart}`);
  return main.slice(i, i + length);
}

test("one function sets both copies of the point and marks a pin the creator moved", () => {
  const f = body("window.setIssuePoint = function(lat, lng, byCreator) {", 700);
  assert.match(f, /newTopicGeo = \[lat, lng\];\s+window\.newTopicGeo = newTopicGeo;/);
  assert.match(f, /window\.newTopicGeoSource = 'creator';/);
  assert.match(f, /window\.issuePointMoves \+= 1;/);
  // no move writes only one copy any more (the bug U6 found: drag, click and profile places never reached Check)
  assert.ok(!/window\.newTopicGeo = \[(lat|tag)/.test(main), "window.newTopicGeo set directly");
  assert.ok(!/window\.newTopicGeo = toCoords/.test(main), "window.newTopicGeo set from a click directly");
  assert.ok(!/^\s+newTopicGeo = \[tag\.geo/m.test(main), "newTopicGeo set from a profile place directly");
});

test("drag, map click, profile place and search mark the pin as the creator's", () => {
  assert.match(main, /updateCoords\(latLng\.lat, latLng\.lng, true\)/); // Leaflet drag
  assert.match(main, /updateCoords\(e\.latlng\.lat, e\.latlng\.lng, true\)/); // Leaflet click
  // U8 removed the Google Maps branch (it never ran), so only Leaflet's profile markers remain
  assert.equal((main.match(/updateCoords\(tag\.geo\[0\], tag\.geo\[1\], true\)/g) || []).length, 1); // profile markers
  assert.match(main, /window\.setIssuePoint\(tag\.geo\[0\], tag\.geo\[1\], true\);\s+updateTargetMarker\(\);/); // profile list
  assert.match(body("function applySearchResult(lat, lon) {", 200), /window\.setIssuePoint\(lat, lon, true\)/);
  assert.match(main, /window\.setIssuePoint\(clicked\[0\], clicked\[1\], true\)/); // drawn fallback map
});

test("before Check the point is the creator's home", () => {
  const f = body("async function loadCreatorGeotags() {", 1000);
  assert.match(f, /g\.type === 'home'/);
  assert.match(f, /window\.newTopicGeoSource !== 'creator'/);
  assert.match(f, /window\.setIssuePoint\(home\.geo\[0\], home\.geo\[1\], false\)/);
});

test("Check sends the point with its source and shows the server's point and label", () => {
  assert.match(main, /location: window\.newTopicGeo,\s+\/\/[^\n]*\n\s+location_source: window\.newTopicGeoSource,/);
  const after = body("checkedPointMoves = movesAtCheck;", 500);
  assert.match(after, /window\.setIssuePoint\(data\.location\[0\], data\.location\[1\], false\)/);
  assert.match(after, /showIssuePointLabel\(data\.location_label/);
});

test("a pin moved after Check disables Create until Check runs again", () => {
  const moved = body("window.onIssuePointMoved = () => {", 600);
  assert.match(moved, /submitBtn\.setAttribute\('disabled', 'true'\)/);
  assert.match(moved, /press Check again/);
  assert.match(main, /if \(window\.issuePointMoves === checkedPointMoves\) \{\s+submitBtn\.removeAttribute\('disabled'\);/);
  assert.match(main, /if \(window\.issuePointMoves !== checkedPointMoves\) \{\s+alert\('The point moved after the check: press Check again\.'\)/);
});

test("the map and the search box credit OpenStreetMap", () => {
  // U8: the map's tiles are OpenStreetMap's too, so one credit covers the tiles and the search
  assert.match(main, /attribution: '&copy; <a href="https:\/\/www\.openstreetmap\.org\/copyright"[^']*>OpenStreetMap contributors<\/a>'/);
  assert.match(main, /attribution: MAP_TILES\.attribution/);
  assert.match(html, /id="geo-map-search-credit"[^>]*>Place search: &copy; <a href="https:\/\/www\.openstreetmap\.org\/copyright"[^>]*>OpenStreetMap contributors<\/a>/);
});

test("the search box reads the switch before it searches", () => {
  const sw = body("async function placeSearchEnabled() {", 500);
  assert.match(sw, /db\.collection\('config'\)\.doc\('geocoding'\)\.get\(\)/);
  assert.match(sw, /enabled === false/);
  const search = body("async function handleGeoSearch() {", 1500);
  const iSwitch = search.indexOf("placeSearchEnabled()");
  const iFetch = search.indexOf("nominatim.openstreetmap.org/search");
  assert.ok(iSwitch > 0 && iSwitch < iFetch, "the switch is read before the request");
  assert.match(search, /Place search is switched off\./);
});
