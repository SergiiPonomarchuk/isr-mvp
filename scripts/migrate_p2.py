#!/usr/bin/env python3
"""Task P2: homes in real buildings, and property for the synthetic people.

Spec: specs/tasks/P2-homes-and-property.md (approved 2026-11-10). What it does (R1-R5):
- R1 Buildings around the 8 current estate points (the estate centres): apartment blocks 60 m
  apart along a row and 70 m between rows; townhouses in rows of 8 houses 8 m apart, rows side by
  side with a 16 m lane and 32 m apart; private houses 30 m apart. No two buildings of different
  estates closer than 40 m.
- R2 Every home moves to its building's point (address, unit and unit_type kept; `building`
  added). Andim's 45 families get their own city houses around the Andim point, on a 60 m grid,
  with fictional addresses.
- R1b Separate objects (the workplaces, and the new garages and gardens) stay out of the estate
  areas (the box around an estate's buildings plus 40 m). A shop, store, pharmacy, cafe, bar, salon
  or restaurant on an osbb estate's point moves to the ground floor of one of its apartment
  buildings; any other object inside an estate area moves to the nearest free spot outside (at
  least 30 m from other objects), with a fictional address. Every worker follows their object.
- R1c The 63 numbered objects get new names (RENAMES, spec Appendix A), in work and post entries.
- R3 Property entries by fixed rules (seed 20261110, one draw per household): flats and houses of
  owners, flats rented out by landlords, garages, garden plots, commercial units. Children own
  nothing.
- R4 user_packs are rebuilt when the collection has documents (live), as P1 does.

Runs (Firestore: the emulator unless --project <id> --i-know-this-is-live; the live --apply is the
author's step, after P1 and a backup):
  --make-plan   read the people (read-only) and write the plan to scripts/p2_generated/plan.json,
                with each person's source hash; refuses to overwrite an existing plan (--force).
  (default)     dry run: compare the plan with the database and report.
  --apply       write the planned geography and post of every person whose source is unchanged.
A second --apply changes nothing. Prints and reports uids only, no names.
"""
from __future__ import annotations

import argparse
import collections
import datetime as _dt
import hashlib
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN_DIR = os.path.join(ROOT, "scripts", "p2_generated")
PLAN_FILE = "plan.json"
REPORT = os.path.join(ROOT, "specs", "tasks", "P2-migration-report.md")
GEOJSON_BUILDINGS = os.path.join(ROOT, "specs", "tasks", "P2-buildings.geojson")
GEOJSON_PROPERTY = os.path.join(ROOT, "specs", "tasks", "P2-property.geojson")

VERSION = "p2v1"
SEED = 20261110
REF_DATE = _dt.date(2026, 11, 10)
PACK_SIZE = 250
M_LAT = 111320.0

# R1 spacing (metres)
APT_ALONG, APT_BETWEEN = 60.0, 70.0
TH_PER_ROW, TH_HOUSE, TH_LANE, TH_ROWS = 8, 8.0, 16.0, 32.0
PRIVATE = 30.0
ESTATE_MARGIN = 40.0          # an estate's area: the box around its buildings plus this
OBJECT_GAP = 30.0             # separate objects at least this far apart
ANDIM_GRID, ANDIM_JITTER = 60.0, 10.0
GARAGE_PITCH, GARAGE_ROW, GARAGES_PER_ROW = 3.5, 12.0, 20
GARDEN_PLOT, GARDEN_KM, GARDEN_BEARINGS = 25.0, 4.5, (60.0, 100.0, 140.0)

# R3 rates
RATE_OWN_FLAT, RATE_OWN_HOUSE = 0.85, 0.95
RATE_GARAGE = 0.20
RATE_LAND_50, RATE_LAND_OTHER = 0.25, 0.08
RATE_COMMERCIAL = 0.02
DEGREES = {"bachelor", "master", "phd", "doctorate", "doctor"}
BUSINESS_RE = re.compile(r"\b(owner|entrepreneur|founder|self-employed|proprietor|shopkeeper)\b", re.I)

ANDIM_STREETS = ["Quill Lane", "Amberleaf Street", "Thistlewood Road", "Copperfield Way", "Larkspur Street",
                 "Wrenfield Lane", "Saffron Row", "Mossgate Road", "Hollin Street", "Brackenridge Way"]
OBJECT_STREETS = ["Market Row", "Guild Street", "Lantern Way", "Foundry Lane", "Chestnut Square",
                  "Mill Race Road", "Weaver Street", "Bell Yard"]
COMMERCE_RE = re.compile(r"(store|shop|phatmacy|pharmacy|cafe|bar|saloon|salon|restaurant)", re.I)

# R1c, spec Appendix A
RENAMES = {
    "School 1": "Linden Hill School", "School 2": "Northgate School", "School 3": "Riverside School",
    "School 4": "Meadowbrook School",
    "Kindergarden 1": "Little Owls Kindergarten", "Kindergarden 2": "Sunflower Kindergarten",
    "Kindergarden 3": "Busy Bees Kindergarten", "Kindergarden 4": "Rainbow Kindergarten",
    "Kindergarden 5": "Acorn Kindergarten", "Kindergarden 6": "Ladybird Kindergarten",
    "Hotel 1": "Hotel Silver Linden", "Hotel 2": "Hotel Old Mill",
    "Restaurant 1": "The Copper Pot", "Restaurant 2": "Golden Ear Restaurant", "Restaurant 3": "Three Bridges Bistro",
    "Private shop 1": "Book Nook", "Private shop 2": "Tick & Tock Watch Repair", "Private shop 3": "The Gift Box",
    "Private shop 4": "Spoke & Wheel Bikes",
    "Miscellaneous Store 1": "Odds & Ends", "Miscellaneous Store 2": "Corner Bazaar",
    "Miscellaneous Store 3": "Handy Things", "Miscellaneous Store 4": "Little Emporium",
    "Miscellaneous Store 5": "Everyday Goods",
    "Grocery Store 1": "Fresh Basket", "Grocery Store 2": "Harvest Corner", "Grocery Store 3": "Daily Bread Grocery",
    "Grocery Store 4": "Greenleaf Grocery", "Grocery Store 5": "Sunrise Foods", "Grocery Store 6": "Orchard Market",
    "Grocery Store 7": "Village Pantry", "Grocery Store 8": "Hilltop Grocery", "Grocery Store 9": "Brookside Foods",
    "Grocery Store 10": "Good Grain Grocery",
    "Clothing Store 1": "Thread & Needle", "Clothing Store 2": "Blue Loom", "Clothing Store 3": "Urban Thread",
    "Clothing Store 4": "Woolly Lane", "Clothing Store 5": "Tailor's Corner", "Clothing Store 6": "Linen House",
    "Clothing Store 7": "Stitch Studio",
    "Phatmacy 1": "Green Cross Pharmacy", "Phatmacy 2": "Linden Pharmacy", "Phatmacy 3": "Health Corner Pharmacy",
    "Phatmacy 4": "Rosemary Pharmacy", "Phatmacy 5": "Northside Pharmacy", "Phatmacy 6": "Chamomile Pharmacy",
    "Phatmacy 7": "Sage Pharmacy", "Phatmacy 8": "Willow Pharmacy", "Phatmacy 9": "Juniper Pharmacy",
    "Phatmacy 10": "Elmwood Pharmacy",
    "Cafe 1": "Morning Star Café", "Cafe 2": "Corner Cup Café", "Cafe 3": "Hazel Café", "Cafe 4": "Bluebird Café",
    "Cafe 5": "Steam & Crumb Café", "Cafe 6": "Velvet Bean Café",
    "Bar 1": "The Lantern Bar", "Bar 2": "Night Owl Bar", "Bar 3": "Cellar Bar",
    "Saloon 1": "Silk & Scissors Salon", "Saloon 6": "Glow Beauty Salon", "Saloon 8": "Mirror Hair Salon",
}


# ------------------------------------------------------------------ small helpers

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def draw(*parts) -> float:
    """A uniform number in [0, 1) from the seed and the parts: the same inputs, the same draw."""
    h = sha256(":".join(["p2", str(SEED)] + [str(p) for p in parts]))
    return int(h[:15], 16) / float(16 ** 15)


def age_on(birth, on=REF_DATE):
    try:
        y, m, d = (int(x) for x in str(birth)[:10].split("-"))
    except Exception:
        return None
    return on.year - y - ((on.month, on.day) < (m, d))


def to_point(center, dx, dy):
    """The point dx metres east and dy metres north of center, rounded to 6 decimals (about 0.1 m)."""
    lat = center[0] + dy / M_LAT
    lon = center[1] + dx / (M_LAT * math.cos(math.radians(center[0])))
    return [round(lat, 6), round(lon, 6)]


def to_xy(center, p):
    return ((p[1] - center[1]) * M_LAT * math.cos(math.radians(center[0])), (p[0] - center[0]) * M_LAT)


def dist_m(a, b):
    x, y = to_xy(a, b)
    return math.hypot(x, y)


def unit_key(u):
    s = str(u)
    return (0, int(s)) if s.isdigit() else (1, s)


# ------------------------------------------------------------------ R1 layouts (pure)

def apartment_layout(n):
    """(dx, dy) of n blocks in reading order (north-west first), centred."""
    cols = max(1, math.ceil(math.sqrt(n)))
    rows = math.ceil(n / cols)
    return [((i % cols - (cols - 1) / 2) * APT_ALONG, ((rows - 1) / 2 - i // cols) * APT_BETWEEN) for i in range(n)]


def townhouse_layout(n):
    """(dx, dy) of n townhouses: rows of 8, rows side by side (80 m pitch), lines 32 m apart; near-square."""
    rows_needed = math.ceil(n / TH_PER_ROW)
    pitch = (TH_PER_ROW - 1) * TH_HOUSE + TH_HOUSE + TH_LANE
    best = None
    for c in range(1, rows_needed + 1):
        lines = math.ceil(rows_needed / c)
        width = (c - 1) * pitch + (TH_PER_ROW - 1) * TH_HOUSE
        height = (lines - 1) * TH_ROWS
        score = abs(width - height)
        if best is None or score < best[0]:
            best = (score, c, lines, width, height)
    _, c, lines, width, height = best
    out = []
    for k in range(n):
        row, pos = divmod(k, TH_PER_ROW)
        line, slot = divmod(row, c)
        out.append((slot * pitch + pos * TH_HOUSE - width / 2, height / 2 - line * TH_ROWS))
    return out


def grid_layout(n, step):
    cols = max(1, math.ceil(math.sqrt(n)))
    rows = math.ceil(n / cols)
    return [((i % cols - (cols - 1) / 2) * step, ((rows - 1) / 2 - i // cols) * step) for i in range(n)]


def andim_layout(n):
    """n city-house points on a 60 m grid around the centre, nearest first, with a seeded jitter of
    up to 10 m (so the minimum spacing is 40 m). Returns [(dx, dy, row)] ordered by street row, then x."""
    r = math.ceil(math.sqrt(n)) + 2
    cells = [(i, j) for i in range(-r, r + 1) for j in range(-r, r + 1)]
    cells.sort(key=lambda ij: (math.hypot(*ij), math.atan2(ij[1], ij[0])))
    chosen = cells[:n]
    pts = []
    for i, j in chosen:
        jx = (draw("andim-x", i, j) * 2 - 1) * ANDIM_JITTER
        jy = (draw("andim-y", i, j) * 2 - 1) * ANDIM_JITTER
        pts.append((i * ANDIM_GRID + jx, j * ANDIM_GRID + jy, j))
    pts.sort(key=lambda p: (-p[2], p[0]))
    return pts


def area_of(points, center, margin=ESTATE_MARGIN):
    """An estate's area as a box in metres around center: (xmin, xmax, ymin, ymax)."""
    xs, ys = zip(*(to_xy(center, p) for p in points))
    return (min(xs) - margin, max(xs) + margin, min(ys) - margin, max(ys) + margin)


def in_area(p, center, box):
    x, y = to_xy(center, p)
    return box[0] <= x <= box[1] and box[2] <= y <= box[3]


def box_corners(center, box):
    return [to_point(center, x, y) for x in box[:2] for y in box[2:]]


# ------------------------------------------------------------------ reading the people

def home_of(user):
    return next((g for g in user.get("geography") or [] if isinstance(g, dict) and g.get("type") == "home"
                 and isinstance(g.get("geo"), list)), None)


def estate_of(home):
    """(estate, building, kind) from a home entry; kind is apartments | townhouses | private | andim."""
    a = str(home.get("address") or "").strip()
    m = re.match(r"^(osbb \d+), (h\d+)$", a)
    if m:
        return m.group(1), f"{m.group(1)}, {m.group(2)}", "apartments"
    if a.startswith("townhouse"):
        return a, None, "townhouses"
    if a.startswith("village"):
        return a.split(",")[0].strip(), None, "private"
    if a == "Andim" or home.get("unit_type") == "city houses":
        return "Andim", None, "andim"
    return None, None, None


def source_of(user):
    return {k: user.get(k) for k in ("geography", "post", "birthDate", "socialRelations")}


def households(users):
    """{key: [uid, ...]}: a flat or house is (address, unit); Andim's are family groups."""
    out = collections.defaultdict(list)
    andim = []
    for u in users:
        h = home_of(u)
        if not h:
            continue
        estate, _, kind = estate_of(h)
        if kind == "andim":
            andim.append(u)
        elif kind:
            out[(str(h.get("address")), str(h.get("unit")))].append(str(u["uid"]))
    ids = {str(u["uid"]) for u in andim}
    parent = {i: i for i in ids}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u in andim:
        for r in u.get("socialRelations") or []:
            if isinstance(r, dict) and str(r.get("relative")) in ids and str(r.get("type", "")).lower() in (
                    "wife", "husband", "spouse", "partner", "son", "daughter", "father", "mother", "child", "parent"):
                parent[find(str(u["uid"]))] = find(str(r["relative"]))
    groups = collections.defaultdict(list)
    for i in ids:
        groups[find(i)].append(i)
    for members in groups.values():
        out[("Andim", min(members, key=int))] = sorted(members, key=int)
    return out


def owners_of(members, by_uid):
    """The adults who own the home: adults whom no other member lists as son or daughter; else the oldest adult."""
    adults = [m for m in members if (age_on(by_uid[m].get("birthDate")) or 0) >= 18]
    listed = set()
    for m in members:
        for r in by_uid[m].get("socialRelations") or []:
            if isinstance(r, dict) and str(r.get("type", "")).lower() in ("son", "daughter", "child"):
                listed.add(str(r.get("relative")))
    own = [m for m in adults if m not in listed]
    if not own and adults:
        own = [max(adults, key=lambda m: age_on(by_uid[m].get("birthDate")) or 0)]
    return sorted(own, key=int)


def education_level(user):
    for p in user.get("post") or []:
        if isinstance(p, dict) and p.get("educationLevel"):
            return str(p["educationLevel"]).lower()
    return ""


def is_business(user):
    for p in user.get("post") or []:
        if isinstance(p, dict) and (BUSINESS_RE.search(str(p.get("job") or ""))
                                    or str(p.get("place") or "").lower().startswith("private")):
            return True
    return any(isinstance(g, dict) and g.get("type") == "work" and str(g.get("place") or "").lower().startswith("private shop")
               for g in user.get("geography") or [])


# ------------------------------------------------------------------ the plan

def find_free_spot(origin, areas, taken, need=OBJECT_GAP, half=0.0, step=20.0, max_r=4000.0):
    """The nearest point to origin (rings of `step` m, every 15 degrees) whose box of half-size `half`
    lies outside every estate area and that is at least need + half from every taken point."""
    def ok(p):
        for center, box in areas:
            x, y = to_xy(center, p)
            # 1 m more than the area, so that rounding (points to 6 decimals, boxes to 0.1 m) never
            # leaves a spot on the edge
            e = half + 1.0
            if box[0] - e <= x <= box[1] + e and box[2] - e <= y <= box[3] + e:
                return False
        return all(dist_m(p, q) >= need + half + h for q, h in taken)
    if ok(origin):
        return list(origin)
    r = step
    while r <= max_r:
        for a in range(0, 360, 15):
            p = to_point(origin, r * math.cos(math.radians(a)), r * math.sin(math.radians(a)))
            if ok(p):
                return p
        r += step
    raise RuntimeError("no free spot within %d m" % max_r)


def make_plan(users):
    """The whole plan from the original people. Returns {"people": {uid: {...}}, "buildings", "objects", "property", "checks"}."""
    users = [u for u in users if u.get("uid") is not None]
    by_uid = {str(u["uid"]): u for u in users}

    # --- estates, their centres (the current shared point) and buildings
    centre_votes = collections.defaultdict(collections.Counter)
    est_kind, est_buildings, est_units = {}, collections.defaultdict(set), collections.defaultdict(set)
    for u in users:
        h = home_of(u)
        if not h:
            continue
        estate, building, kind = estate_of(h)
        if not estate:
            continue
        centre_votes[estate][tuple(h["geo"])] += 1
        est_kind[estate] = kind
        if kind == "apartments":
            est_buildings[estate].add(building)
        elif kind in ("townhouses", "private"):
            est_units[estate].add(str(h.get("unit")))
    centres = {e: list(v.most_common(1)[0][0]) for e, v in centre_votes.items()}

    building_pt = {}          # building name -> point
    buildings = []            # [{name, estate, type, geo}]
    for estate in sorted(centres):
        c, kind = centres[estate], est_kind[estate]
        if kind == "apartments":
            names = sorted(est_buildings[estate], key=lambda b: int(b.rsplit("h", 1)[1]))
            offs = apartment_layout(len(names))
            btype = "apartment block"
        elif kind == "townhouses":
            names = [f"{estate}, house {u}" for u in sorted(est_units[estate], key=unit_key)]
            offs = townhouse_layout(len(names))
            btype = "townhouse"
        elif kind == "private":
            names = [f"{estate}, house {u}" for u in sorted(est_units[estate], key=unit_key)]
            offs = grid_layout(len(names), PRIVATE)
            btype = "private house"
        else:
            continue
        for name, (dx, dy) in zip(names, offs):
            building_pt[name] = to_point(c, dx, dy)
            buildings.append({"name": name, "estate": estate, "type": btype, "geo": building_pt[name]})

    # --- Andim: one city house per family group, fictional addresses
    hh = households(users)
    andim_keys = sorted((k for k in hh if k[0] == "Andim"), key=lambda k: int(k[1]))
    andim_addr = {}
    if andim_keys and "Andim" in centres:
        pts = andim_layout(len(andim_keys))
        rows = sorted({p[2] for p in pts}, reverse=True)
        numbers = collections.Counter()
        for key, (dx, dy, row) in zip(andim_keys, pts):
            street = ANDIM_STREETS[rows.index(row) % len(ANDIM_STREETS)]
            numbers[street] += 1
            name = f"{street} {numbers[street]}"
            building_pt[name] = to_point(centres["Andim"], dx, dy)
            andim_addr[key] = name
            buildings.append({"name": name, "estate": "Andim", "type": "city house", "geo": building_pt[name]})

    # --- estate areas
    areas = []
    by_estate = collections.defaultdict(list)
    for b in buildings:
        by_estate[b["estate"]].append(b["geo"])
    for estate, pts in by_estate.items():
        areas.append((centres[estate], area_of(pts, centres[estate])))
    area_by_estate = {e: (centres[e], area_of(p, centres[e])) for e, p in by_estate.items()}

    # --- objects (workplaces)
    objects = {}
    for u in users:
        for g in u.get("geography") or []:
            if isinstance(g, dict) and g.get("type") == "work" and isinstance(g.get("geo"), list):
                o = objects.setdefault(str(g.get("place")), {"geo": list(g["geo"]), "address": g.get("address"), "workers": 0})
                o["workers"] += 1
    obj_plan = {}
    apt_rr = collections.Counter()
    taken = []
    staying, moving = [], []
    for name in sorted(objects):
        o = objects[name]
        on_estate = next((e for e, c in centres.items() if dist_m(c, o["geo"]) < 1.0), None)
        if on_estate and est_kind.get(on_estate) == "apartments" and COMMERCE_RE.search(name):
            blds = sorted((b for b in buildings if b["estate"] == on_estate), key=lambda b: int(b["name"].rsplit("h", 1)[1]))
            b = blds[apt_rr[on_estate] % len(blds)]
            apt_rr[on_estate] += 1
            obj_plan[name] = {"geo": b["geo"], "address": f"{b['name']}, ground floor", "how": "apartment block"}
        elif any(in_area(o["geo"], c, box) for c, box in areas):
            moving.append(name)
        else:
            staying.append(name)
            obj_plan[name] = {"geo": o["geo"], "address": o["address"], "how": "stays"}
            taken.append((o["geo"], 0.0))
    street_no = collections.Counter()
    for i, name in enumerate(moving):
        p = find_free_spot(objects[name]["geo"], areas, taken)
        taken.append((p, 0.0))
        street = OBJECT_STREETS[i % len(OBJECT_STREETS)]
        street_no[street] += 1
        obj_plan[name] = {"geo": p, "address": f"{street} {street_no[street]}", "how": "moved out"}
    for name, op in obj_plan.items():
        op["name"] = RENAMES.get(name, name)
        op["workers"] = objects[name]["workers"]
        op["old_geo"] = objects[name]["geo"]

    # --- R3 property
    prop = collections.defaultdict(list)        # uid -> [entry without id]
    landlord_count = collections.Counter()
    garage_owners = collections.defaultdict(list)   # estate -> [(uid, key)]
    land_owners = []                                # (uid, key)
    home_info = {}                                  # key -> (estate, kind, building name, unit)
    for key, members in hh.items():
        u0 = by_uid[members[0]]
        h = home_of(u0)
        estate, building, kind = estate_of(h)
        if kind == "andim":
            bname = andim_addr[key]
        elif kind == "apartments":
            bname = building
        else:
            bname = f"{estate}, house {h.get('unit')}"
        home_info[key] = (estate, kind, bname, str(h.get("unit")))

    degree_adults = sorted(
        (str(u["uid"]) for u in users
         if home_of(u) and 40 <= (age_on(u.get("birthDate")) or 0) <= 75 and education_level(u) in DEGREES),
        key=int)
    home_building_of = {}
    for key, members in hh.items():
        for m in members:
            home_building_of[m] = home_info[key][2]

    for key in sorted(hh, key=lambda k: (k[0], unit_key(k[1]))):
        members = hh[key]
        estate, kind, bname, unit = home_info[key]
        owners = owners_of(members, by_uid)
        geo = building_pt[bname]
        ages = [age_on(by_uid[m].get("birthDate")) or 0 for m in members]
        if kind == "apartments":
            addr = f"{bname}, flat {unit}"
            if owners and draw("own", *key) < RATE_OWN_FLAT:
                for m in owners:
                    prop[m].append({"kind": "flat", "place": bname, "address": addr, "geo": geo, "use": "home"})
            else:
                cands = sorted((c for c in degree_adults if home_building_of.get(c) != bname and landlord_count[c] < 2),
                               key=lambda c: draw("landlord", *key, c))
                if cands:
                    landlord_count[cands[0]] += 1
                    prop[cands[0]].append({"kind": "flat", "place": bname, "address": addr, "geo": geo, "use": "rented out"})
            garage_adults = [m for m in owners + members if 25 <= (age_on(by_uid[m].get("birthDate")) or 0) <= 80]
            if garage_adults and draw("garage", *key) < RATE_GARAGE:
                garage_owners[estate].append((garage_adults[0], key))
        elif owners and draw("own", *key) < RATE_OWN_HOUSE:
            addr = bname if kind == "andim" else f"{bname}"
            for m in owners:
                prop[m].append({"kind": "house", "place": bname, "address": addr, "geo": geo, "use": "home"})
        rate = RATE_LAND_50 if any(a >= 50 for a in ages) else RATE_LAND_OTHER
        adults = sorted((m for m in members if (age_on(by_uid[m].get("birthDate")) or 0) >= 18),
                        key=lambda m: -(age_on(by_uid[m].get("birthDate")) or 0))
        if adults and draw("land", *key) < rate:
            land_owners.append((adults[0], key))

    # garages: one cooperative next to each osbb estate
    coop_specs = []
    for estate in sorted(garage_owners):
        owners_g = sorted(garage_owners[estate], key=lambda t: int(t[0]))
        n = len(owners_g)
        rows = math.ceil(n / GARAGES_PER_ROW)
        half = max((min(n, GARAGES_PER_ROW) - 1) * GARAGE_PITCH, (rows - 1) * GARAGE_ROW) / 2 + 5
        c = find_free_spot(centres[estate], areas, taken, half=half)
        taken.append((c, half))
        coop = f"garages {estate}"
        coop_specs.append({"name": coop, "geo": c, "garages": n})
        for i, (uid, _key) in enumerate(owners_g):
            r, k = divmod(i, GARAGES_PER_ROW)
            dx = (k - (min(n, GARAGES_PER_ROW) - 1) / 2) * GARAGE_PITCH
            dy = ((rows - 1) / 2 - r) * GARAGE_ROW
            prop[uid].append({"kind": "garage", "place": coop, "address": f"{coop}, box {i + 1}",
                              "geo": to_point(c, dx, dy), "use": "garage"})

    # gardens: three cooperatives 4.5 km out
    city = [sum(c[0] for c in centres.values()) / len(centres), sum(c[1] for c in centres.values()) / len(centres)]
    gardens = [to_point(city, GARDEN_KM * 1000 * math.sin(math.radians(b)), GARDEN_KM * 1000 * math.cos(math.radians(b)))
               for b in GARDEN_BEARINGS]
    per_garden = collections.defaultdict(list)
    for uid, key in sorted(land_owners, key=lambda t: int(t[0])):
        per_garden[int(draw("garden", *key) * len(gardens))].append(uid)
    for gi, uids in sorted(per_garden.items()):
        name = f"gardens {gi + 1}"
        offs = grid_layout(len(uids), GARDEN_PLOT)
        for i, (uid, (dx, dy)) in enumerate(zip(uids, offs)):
            prop[uid].append({"kind": "land", "place": name, "address": f"{name}, plot {i + 1}",
                              "geo": to_point(gardens[gi], dx, dy), "use": "garden"})

    # commercial units
    adults_30_65 = [str(u["uid"]) for u in users if home_of(u) and 30 <= (age_on(u.get("birthDate")) or 0) <= 65]
    target = round(RATE_COMMERCIAL * len(adults_30_65))
    cands = sorted((m for m in adults_30_65 if is_business(by_uid[m])), key=lambda m: draw("commercial", m))[:target]
    office = obj_plan.get("Office centre")
    for m in sorted(cands, key=int):
        hb = home_building_of.get(m, "")
        if hb.startswith("osbb"):
            prop[m].append({"kind": "commercial", "place": hb, "address": f"{hb}, ground floor",
                            "geo": building_pt[hb], "use": "business"})
        elif office:
            prop[m].append({"kind": "commercial", "place": "Office centre", "address": office["address"],
                            "geo": office["geo"], "use": "business"})

    # --- per person: the new geography and post
    people = {}
    key_of = {m: k for k, ms in hh.items() for m in ms}
    for u in users:
        uid = str(u["uid"])
        geo_new = []
        for g in u.get("geography") or []:
            if not isinstance(g, dict):
                geo_new.append(g)
                continue
            g = dict(g)
            if g.get("type") == "home" and uid in key_of:
                estate, kind, bname, _unit = home_info[key_of[uid]]
                g["geo"] = building_pt[bname]
                g["building"] = bname
                if kind == "andim":
                    g["address"] = bname
                    g["unit"] = 1
                    g["unit_type"] = "city houses"
            elif g.get("type") == "work" and str(g.get("place")) in obj_plan:
                op = obj_plan[str(g.get("place"))]
                g["place"], g["geo"], g["address"] = op["name"], op["geo"], op["address"]
            geo_new.append(g)
        next_id = max([int(g.get("id")) for g in geo_new if isinstance(g, dict) and str(g.get("id", "")).isdigit()] or [0]) + 1
        seen = set()
        for e in prop.get(uid, []):
            if (e["kind"], e["place"], e["address"]) in seen:
                continue
            seen.add((e["kind"], e["place"], e["address"]))
            geo_new.append(dict({"id": next_id, "type": "property"}, **e))
            next_id += 1
        post_new = []
        for p in u.get("post") or []:
            if isinstance(p, dict) and str(p.get("place")) in RENAMES:
                p = dict(p, place=RENAMES[str(p.get("place"))])
            post_new.append(p)
        changes = {}
        if geo_new != (u.get("geography") or []):
            changes["geography"] = geo_new
        if post_new != (u.get("post") or []):
            changes["post"] = post_new
        if changes:
            people[uid] = {"source_sha256": sha256(canon(source_of(u))), "set": changes}

    return {"version": VERSION, "seed": SEED, "people": people, "buildings": buildings, "centres": centres,
            "areas": {e: {"centre": c, "box_m": [round(v, 1) for v in b]} for e, (c, b) in area_by_estate.items()},
            "objects": obj_plan, "garage_coops": coop_specs, "gardens": gardens}


# ------------------------------------------------------------------ checks on a plan

def check_plan(plan):
    """The distance rules of R1 and R1b. Returns a list of problems (empty when all hold)."""
    problems = []
    bs = plan["buildings"]
    by_cell = collections.defaultdict(list)
    for b in bs:
        by_cell[(round(b["geo"][0] * 200), round(b["geo"][1] * 200))].append(b)
    for b in bs:
        cx, cy = round(b["geo"][0] * 200), round(b["geo"][1] * 200)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for o in by_cell.get((cx + dx, cy + dy), []):
                    if o["estate"] != b["estate"] and o["name"] < b["name"] and dist_m(o["geo"], b["geo"]) < ESTATE_MARGIN:
                        problems.append(f"buildings {o['name']} and {b['name']} of different estates closer than 40 m")
    for name, op in plan["objects"].items():
        if op["how"] == "apartment block":
            continue
        for e, a in plan["areas"].items():
            if in_area(op["geo"], a["centre"], a["box_m"]):
                problems.append(f"object {name} inside the area of {e}")
    for p in plan["people"].values():
        for g in p["set"].get("geography", []):
            if isinstance(g, dict) and g.get("type") == "property" and g.get("kind") in ("garage", "land"):
                for e, a in plan["areas"].items():
                    if in_area(g["geo"], a["centre"], a["box_m"]):
                        problems.append(f"{g['kind']} {g['address']} inside the area of {e}")
    free = [(n, op["geo"]) for n, op in plan["objects"].items() if op["how"] != "apartment block"]
    for i in range(len(free)):
        for j in range(i + 1, len(free)):
            if free[i][1] != free[j][1] and dist_m(free[i][1], free[j][1]) < OBJECT_GAP and \
                    (plan["objects"][free[i][0]]["how"] == "moved out" or plan["objects"][free[j][0]]["how"] == "moved out"):
                problems.append(f"objects {free[i][0]} and {free[j][0]} closer than 30 m")
    return problems


def compare(plan, users):
    """Per person: done (already as planned), todo (source unchanged), held (source changed)."""
    by_uid = {str(u["uid"]): u for u in users if u.get("uid") is not None}
    done, todo, held, missing = [], [], [], []
    for uid, p in sorted(plan["people"].items(), key=lambda kv: int(kv[0])):
        u = by_uid.get(uid)
        if u is None:
            missing.append(uid)
        elif all((u.get(k) or []) == v for k, v in p["set"].items()):
            done.append(uid)
        elif sha256(canon(source_of(u))) == p["source_sha256"]:
            todo.append(uid)
        else:
            held.append(uid)
    return {"done": done, "todo": todo, "held": held, "missing": missing}


def build_packs(users_after):
    """The user_packs layout of migrate_option_a.py and migrate_p1.py: {"pack_id": n, "users": [meta]}, 250 a pack."""
    metas = []
    for u in sorted((u for u in users_after if u.get("uid") is not None and "skills" in u), key=lambda u: int(u["uid"])):
        metas.append({"uid": int(u["uid"]), "displayName": u.get("displayName", f"User {u['uid']}"),
                      "birthDate": u.get("birthDate", ""), "gender": u.get("gender", ""), "post": u.get("post", []),
                      "skills": u.get("skills", []), "geography": u.get("geography", []),
                      "socialRelations": u.get("socialRelations", []), "features": u.get("features", [])})
    return [{"pack_id": i // PACK_SIZE + 1, "users": metas[i:i + PACK_SIZE]} for i in range(0, len(metas), PACK_SIZE)]


# ------------------------------------------------------------------ report and map files

def summary(plan, users):
    by_uid = {str(u["uid"]): u for u in users if u.get("uid") is not None}
    kinds = collections.Counter()
    uses = collections.Counter()
    bands = collections.Counter()
    for uid, p in plan["people"].items():
        for g in p["set"].get("geography", []):
            if isinstance(g, dict) and g.get("type") == "property":
                kinds[g["kind"]] += 1
                uses[g.get("use")] += 1
                a = age_on(by_uid[uid].get("birthDate")) if uid in by_uid else None
                bands["<18" if a is not None and a < 18 else "18-29" if a is not None and a < 30 else
                      "30-49" if a is not None and a < 50 else "50-64" if a is not None and a < 65 else "65+"] += 1
    extents = {}
    for e, a in plan["areas"].items():
        b = a["box_m"]
        extents[e] = (round(b[1] - b[0] - 2 * ESTATE_MARGIN), round(b[3] - b[2] - 2 * ESTATE_MARGIN))
    hows = collections.Counter(op["how"] for op in plan["objects"].values())
    return {"kinds": kinds, "uses": uses, "bands": bands, "extents": extents, "hows": hows,
            "buildings": collections.Counter(b["type"] for b in plan["buildings"])}


def geojson(plan):
    feats_b = [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [b["geo"][1], b["geo"][0]]},
                "properties": {"name": b["name"], "estate": b["estate"], "type": b["type"]}} for b in plan["buildings"]]
    for n, op in plan["objects"].items():
        feats_b.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [op["geo"][1], op["geo"][0]]},
                        "properties": {"name": op["name"], "type": "object", "how": op["how"]}})
    pts = {}
    for p in plan["people"].values():
        for g in p["set"].get("geography", []):
            if isinstance(g, dict) and g.get("type") == "property":
                pts[(g["kind"], g["address"])] = g
    feats_p = [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [g["geo"][1], g["geo"][0]]},
                "properties": {"kind": g["kind"], "place": g["place"], "address": g["address"], "use": g.get("use")}}
               for g in pts.values()]
    return ({"type": "FeatureCollection", "features": feats_b}, {"type": "FeatureCollection", "features": feats_p})


def write_report(path, plan, users, cmp, problems, applied=None):
    s = summary(plan, users)
    lines = ["# P2 migration report", "", f"Plan version {plan['version']}, seed {plan['seed']}.", "",
             "## Buildings", ""]
    lines += [f"- {t}: {n}" for t, n in sorted(s["buildings"].items())]
    lines += ["", "Estate extents (metres, east-west by north-south, without the 40 m margin):", ""]
    lines += [f"- {e}: {w} x {h}" for e, (w, h) in sorted(s["extents"].items())]
    lines += ["", "## Objects", ""]
    lines += [f"- {h}: {n}" for h, n in sorted(s["hows"].items())]
    lines += ["", "| Object (new name) | How | Workers | Moved by (m) |", "|---|---|---|---|"]
    for name, op in sorted(plan["objects"].items(), key=lambda kv: kv[1]["how"]):
        if op["how"] != "stays":
            lines.append(f"| {name} -> {op['name']} | {op['how']} | {op['workers']} | {dist_m(op['old_geo'], op['geo']):.0f} |")
    lines += ["", "## Property entries", ""]
    lines += [f"- {k}: {n}" for k, n in sorted(s["kinds"].items())]
    lines += ["", "By use: " + ", ".join(f"{k} {n}" for k, n in sorted(s["uses"].items(), key=lambda kv: str(kv[0]))),
              "", "By the owner's age: " + ", ".join(f"{k} {n}" for k, n in sorted(s["bands"].items())),
              "", f"Garage cooperatives: {len(plan['garage_coops'])}; gardens: {len(plan['gardens'])}.",
              "", "## Distance checks", ""]
    lines += [f"- {p}" for p in problems] or ["- all rules hold (buildings of different estates at least 40 m apart; "
                                              "no separate object inside an estate area; moved objects at least 30 m apart)"]
    lines += ["", "## People", "",
              f"- planned changes: {len(plan['people'])}",
              f"- already as planned: {len(cmp['done'])}; to write: {len(cmp['todo'])}; "
              f"held (input changed): {len(cmp['held'])}; missing: {len(cmp['missing'])}"]
    if applied is not None:
        lines += [f"- written: {applied[0]} people; user_packs written: {applied[1]}"]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


# ------------------------------------------------------------------ Firestore

def read_users(db):
    return [d.to_dict() for d in db.collection("users").stream()]


def apply(db, plan, todo, rebuild_packs, users):
    n = 0
    batch = db.batch()
    for uid in todo:
        batch.update(db.collection("users").document(uid), plan["people"][uid]["set"])
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    batch.commit()
    packs_written = 0
    if rebuild_packs:
        after = []
        for u in users:
            uid = str(u.get("uid"))
            after.append(dict(u, **plan["people"][uid]["set"]) if uid in todo else u)
        packs = build_packs(after)
        old = [d.id for d in db.collection("user_packs").stream()]
        for pk in packs:
            db.collection("user_packs").document(f"pack_{pk['pack_id']}").set(pk)
            packs_written += 1
        keep = {f"pack_{pk['pack_id']}" for pk in packs}
        for doc_id in old:
            if doc_id not in keep:
                db.collection("user_packs").document(doc_id).delete()
    return n, packs_written


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--make-plan", action="store_true")
    ap.add_argument("--force", action="store_true", help="overwrite an existing plan")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--project", default=None)
    ap.add_argument("--i-know-this-is-live", action="store_true", dest="live")
    ap.add_argument("--gen-dir", default=GEN_DIR)
    ap.add_argument("--report", default=REPORT)
    ap.add_argument("--geojson-dir", default=os.path.dirname(GEOJSON_BUILDINGS))
    a = ap.parse_args(argv)
    emulator = bool(os.environ.get("FIRESTORE_EMULATOR_HOST"))
    if not emulator and not (a.project and a.live):
        ap.error("refusing: FIRESTORE_EMULATOR_HOST is not set (live runs need --project and --i-know-this-is-live)")
    from google.cloud import firestore  # imported here so the tests need no Firestore
    db = firestore.Client(project=a.project or os.environ.get("GCLOUD_PROJECT"))
    users = read_users(db)
    plan_path = os.path.join(a.gen_dir, PLAN_FILE)
    if a.make_plan:
        if os.path.exists(plan_path) and not a.force:
            ap.error(f"{plan_path} exists; the plan is made once (use --force to replace it)")
        plan = make_plan(users)
        os.makedirs(a.gen_dir, exist_ok=True)
        with open(plan_path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(plan, f, ensure_ascii=False, indent=1, sort_keys=True)
        print(f"Plan written: {len(plan['people'])} people, {len(plan['buildings'])} buildings, {len(plan['objects'])} objects")
    if not os.path.exists(plan_path):
        ap.error("no plan: run --make-plan first")
    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    problems = check_plan(plan)
    cmp = compare(plan, users)
    applied = None
    if a.apply:
        if problems:
            ap.error("refusing to apply: " + "; ".join(problems[:5]))
        has_packs = any(True for _ in db.collection("user_packs").limit(1).stream())
        applied = apply(db, plan, cmp["todo"], has_packs, users)
        print(f"Wrote {applied[0]} people; user_packs written: {applied[1]}")
    write_report(a.report, plan, users, cmp, problems, applied)
    gb, gp = geojson(plan)
    os.makedirs(a.geojson_dir, exist_ok=True)
    for name, obj in (("P2-buildings.geojson", gb), ("P2-property.geojson", gp)):
        with open(os.path.join(a.geojson_dir, name), "w", encoding="utf-8", newline="\n") as f:
            json.dump(obj, f, ensure_ascii=False)
    print(f"done {len(cmp['done'])}, to write {len(cmp['todo'])}, held {len(cmp['held'])}, problems {len(problems)}; report {a.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
