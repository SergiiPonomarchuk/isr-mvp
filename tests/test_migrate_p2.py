"""Task P2 (R6): homes in buildings, Andim spread, objects out of the estates, renames, property.

Pure tests on fixture people; no Firestore. Run: python -m unittest discover -s tests
"""
import copy
import itertools
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts"))
import migrate_p2 as P  # noqa: E402

C_OSBB = [47.5898, 7.6124]
C_TH = [47.5919, 7.6261]       # about 1 km east
C_VIL = [47.5944, 7.6129]      # about 510 m north
C_ANDIM = [47.553832, 7.606599]
FAR = [47.5, 7.5]


def person(uid, birth, home, works=(), rels=(), post=None):
    geo = [dict(home, id=1, type="home")]
    for i, w in enumerate(works):
        geo.append(dict(w, id=2 + i, type="work"))
    return {"uid": uid, "displayName": f"P{uid}", "birthDate": birth, "skills": [], "features": [],
            "post": post or [{"educationLevel": None, "place": None, "job": None}],
            "socialRelations": [{"relative": r, "type": t} for r, t in rels], "geography": geo}


def osbb(h, unit):
    return {"address": f"osbb 9, h{h}", "unit": unit, "unit_type": "apartments", "geo": list(C_OSBB)}


def th(unit):
    return {"address": "townhouse 9", "unit": unit, "unit_type": "townhouses", "geo": list(C_TH)}


def andim():
    return {"address": "Andim", "unit": "Andim", "unit_type": "Andim", "geo": list(C_ANDIM)}


SCHOOL = {"place": "School 1", "address": "Post square, 3", "geo": list(C_OSBB)}
GROCERY = {"place": "Grocery Store 1", "address": "Post square, 3", "geo": list(C_OSBB)}
PHARMACY = {"place": "Phatmacy 7", "address": "Post square, 3", "geo": list(C_TH)}
HOSPITAL = {"place": "Hospital", "address": "Forest street, 10", "geo": list(FAR)}
DEGREE = [{"educationLevel": "Master", "place": "Hospital", "job": "doctor"}]


def fixture():
    u = [
        # osbb 9: three buildings
        person(1, "1985-03-01", osbb(1, 1), [SCHOOL], [(2, "wife"), (3, "son")]),
        person(2, "1987-05-01", osbb(1, 1), [GROCERY], [(1, "husband"), (3, "son")]),
        person(3, "2016-01-01", osbb(1, 1), [], [(1, "father"), (2, "mother")],
               post=[{"place": "School 1", "job": "child"}]),
        person(4, "1955-01-01", osbb(1, 2), [HOSPITAL]),
        person(5, "1980-01-01", osbb(2, 1), [], [(6, "son")]),
        person(6, "2005-01-01", osbb(2, 1), [], [(5, "mother")]),
        person(7, "1996-01-01", osbb(3, 1), [GROCERY]),
        person(8, "1999-01-01", osbb(3, 2)),
        # townhouse 9: twelve houses
    ] + [person(10 + k, "1970-01-01", th(k + 1), [PHARMACY] if k < 2 else [HOSPITAL], post=DEGREE) for k in range(12)] + [
        person(30, "1950-01-01", {"address": "village 9, medium", "unit": 1, "unit_type": "private houses", "geo": list(C_VIL)}),
        # Andim: families {40, 41}, {42}, {43, 44, 45}
        person(40, "1990-01-01", andim(), [], [(41, "wife")]),
        person(41, "1991-01-01", andim(), [], [(40, "husband")]),
        person(42, "1960-01-01", andim()),
        person(43, "1975-01-01", andim(), [], [(44, "son"), (45, "daughter")]),
        person(44, "2010-01-01", andim(), [], [(43, "father")]),
        person(45, "2012-01-01", andim(), [], [(43, "father")]),
    ]
    return u


def after(users, plan):
    out = []
    for u in users:
        p = plan["people"].get(str(u["uid"]))
        out.append(dict(u, **p["set"]) if p else u)
    return out


def home(u):
    return P.home_of(u)


class Layouts(unittest.TestCase):
    def test_apartment_blocks_60_by_70_in_reading_order(self):
        offs = P.apartment_layout(4)
        self.assertEqual(len(offs), 4)
        self.assertLess(offs[0][0], 0)
        self.assertGreater(offs[0][1], 0)          # h1 at the north-west
        self.assertAlmostEqual(offs[1][0] - offs[0][0], 60.0)
        self.assertAlmostEqual(offs[0][1] - offs[2][1], 70.0)
        self.assertAlmostEqual(sum(x for x, _ in offs), 0.0)   # centred

    def test_townhouses_rows_of_eight_near_square(self):
        offs = P.townhouse_layout(945)
        d = min(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5 for a, b in itertools.combinations(offs[:40], 2))
        self.assertAlmostEqual(d, 8.0)
        xs, ys = [o[0] for o in offs], [o[1] for o in offs]
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        self.assertLess(abs(w - h) / max(w, h), 0.25)
        self.assertTrue(500 < w < 620 and 480 < h < 620, (w, h))
        self.assertEqual(len(set(offs)), 945)

    def test_andim_spread_at_least_40_m_and_near_the_centre(self):
        pts = P.andim_layout(45)
        self.assertEqual(len(pts), 45)
        dmin = min(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5 for a, b in itertools.combinations(pts, 2))
        self.assertGreaterEqual(dmin, 39.9)
        self.assertLessEqual(max((p[0] ** 2 + p[1] ** 2) ** 0.5 for p in pts), 400)

    def test_point_conversion_round_trip(self):
        p = P.to_point(C_OSBB, 100.0, -50.0)
        x, y = P.to_xy(C_OSBB, p)
        self.assertAlmostEqual(x, 100.0, delta=0.2)
        self.assertAlmostEqual(y, -50.0, delta=0.2)


class Plan(unittest.TestCase):
    def setUp(self):
        self.users = fixture()
        self.plan = P.make_plan(copy.deepcopy(self.users))
        self.after = after(self.users, self.plan)
        self.by = {str(u["uid"]): u for u in self.after}

    def test_every_home_on_its_building_and_families_together(self):
        pts = {b["name"]: b["geo"] for b in self.plan["buildings"]}
        for u in self.after:
            h = home(u)
            self.assertEqual(h["geo"], pts[h["building"]], u["uid"])
        self.assertEqual(home(self.by["1"])["geo"], home(self.by["3"])["geo"])
        self.assertNotEqual(home(self.by["1"])["geo"], home(self.by["5"])["geo"])   # h1 and h2 differ
        self.assertEqual((home(self.by["1"])["address"], home(self.by["1"])["unit"]), ("osbb 9, h1", 1))
        self.assertEqual(home(self.by["10"])["building"], "townhouse 9, house 1")
        self.assertNotEqual(home(self.by["10"])["geo"], home(self.by["11"])["geo"])

    def test_estate_centres_are_the_current_points(self):
        self.assertEqual(self.plan["centres"]["osbb 9"], C_OSBB)
        self.assertEqual(self.plan["centres"]["Andim"], C_ANDIM)

    def test_andim_families_get_fictional_addresses_around_their_point(self):
        homes = {uid: home(self.by[uid]) for uid in ("40", "41", "42", "43", "44", "45")}
        self.assertEqual(homes["40"]["geo"], homes["41"]["geo"])
        self.assertEqual(homes["43"]["geo"], homes["45"]["geo"])
        self.assertEqual(len({tuple(h["geo"]) for h in homes.values()}), 3)
        for h in homes.values():
            self.assertEqual(h["unit_type"], "city houses")
            self.assertRegex(h["address"], r"^[A-Z][a-z]+ [A-Za-z ]+ \d+$")
            self.assertNotEqual(h["address"], "Andim")
            self.assertLess(P.dist_m(C_ANDIM, h["geo"]), 400)

    def test_objects_out_of_estates_except_in_apartment_blocks(self):
        objs = self.plan["objects"]
        self.assertEqual(objs["Grocery Store 1"]["how"], "apartment block")
        self.assertTrue(objs["Grocery Store 1"]["address"].startswith("osbb 9, h"))
        self.assertTrue(objs["Grocery Store 1"]["address"].endswith(", ground floor"))
        self.assertEqual(objs["School 1"]["how"], "moved out")
        self.assertEqual(objs["Phatmacy 7"]["how"], "moved out")     # a pharmacy on a townhouse point
        self.assertEqual(objs["Hospital"]["how"], "stays")
        self.assertEqual(objs["Hospital"]["geo"], FAR)
        self.assertEqual(P.check_plan(self.plan), [])

    def test_workers_follow_their_object_and_numbered_names_are_replaced(self):
        works = [g for u in self.after for g in u["geography"] if g.get("type") == "work"]
        by_place = {}
        for g in works:
            by_place.setdefault(g["place"], set()).add((tuple(g["geo"]), g["address"]))
        self.assertTrue(all(len(v) == 1 for v in by_place.values()), by_place)
        self.assertIn("Linden Hill School", by_place)
        self.assertIn("Fresh Basket", by_place)
        self.assertIn("Sage Pharmacy", by_place)
        self.assertIn("Hospital", by_place)                             # no number: unchanged
        self.assertNotIn("School 1", by_place)
        self.assertEqual(self.by["3"]["post"][0]["place"], "Linden Hill School")

    def test_property_rules(self):
        kinds = set()
        for u in self.after:
            props = [g for g in u["geography"] if g.get("type") == "property"]
            age = P.age_on(u["birthDate"])
            if age < 18:
                self.assertEqual(props, [], f"child {u['uid']} owns nothing")
            for g in props:
                kinds.add(g["kind"])
                self.assertIn(g["kind"], ("flat", "house", "land", "garage", "commercial", "other"))
                self.assertTrue(g["place"] and g["address"] and isinstance(g["geo"], list))
            ids = [g["id"] for g in u["geography"]]
            self.assertEqual(len(ids), len(set(ids)), "ids unique within the person")
        self.assertTrue(kinds & {"flat", "house"})

    def test_every_rented_flat_has_one_landlord_living_elsewhere(self):
        old = P.RATE_OWN_FLAT
        P.RATE_OWN_FLAT = 0.0       # every apartment household rents
        try:
            users = fixture()
            plan = P.make_plan(copy.deepcopy(users))
        finally:
            P.RATE_OWN_FLAT = old
        aft = after(users, plan)
        rented = [(u, g) for u in aft for g in u["geography"] if g.get("type") == "property" and g.get("use") == "rented out"]
        self.assertGreater(len(rented), 0)
        for u, g in rented:
            self.assertNotEqual(home(u)["building"], g["place"])
            self.assertGreaterEqual(P.age_on(u["birthDate"]), 40)
        per_flat = {}
        for u, g in rented:
            per_flat.setdefault(g["address"], []).append(u["uid"])
        self.assertTrue(all(len(v) == 1 for v in per_flat.values()))
        self.assertFalse(any(g.get("use") == "home" and g["kind"] == "flat" for u in aft for g in u["geography"]
                             if g.get("type") == "property"))

    def test_same_seed_same_plan(self):
        again = P.make_plan(copy.deepcopy(self.users))
        self.assertEqual(P.canon(again), P.canon(self.plan))


class Applying(unittest.TestCase):
    def test_second_run_changes_nothing_and_a_changed_person_is_held(self):
        users = fixture()
        plan = P.make_plan(copy.deepcopy(users))
        cmp = P.compare(plan, users)
        self.assertEqual(sorted(cmp["todo"], key=int), sorted(plan["people"], key=int))
        aft = after(users, plan)
        cmp2 = P.compare(plan, aft)
        self.assertEqual(cmp2["todo"], [])
        self.assertEqual(len(cmp2["done"]), len(plan["people"]))
        changed = copy.deepcopy(users)
        changed[0]["birthDate"] = "1986-03-01"
        self.assertIn("1", P.compare(plan, changed)["held"])

    def test_packs_hold_the_new_geography(self):
        users = fixture()
        plan = P.make_plan(copy.deepcopy(users))
        packs = P.build_packs(after(users, plan))
        self.assertEqual(sum(len(p["users"]) for p in packs), len(users))
        m = next(x for p in packs for x in p["users"] if x["uid"] == 1)
        self.assertEqual(m["geography"], plan["people"]["1"]["set"]["geography"])


if __name__ == "__main__":
    unittest.main()
