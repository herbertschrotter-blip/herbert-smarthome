"""Bauplan 2.7: runlog.py gegen dieselben Vektoren wie die Karte (dreame_x60/card/tests/fixtures/*.v1.json).

Aufruf:  cd ha/prognose && python3 -m pytest        (Pi: /config/prognose; PC: braucht Python 3 + pytest)
Regel: runlog.py wird nicht angepasst. Jede Abweichung wird in Bauplan Abschnitt 10a eingetragen (Vektor-Name).
Bekannte, dokumentierte Unterschiede sind unten als XFAIL markiert, damit pytest die Parität dennoch bewacht.
"""
import json
import os
import sys
from datetime import datetime, timedelta

import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import runlog  # noqa: E402

FIX = os.path.normpath(os.path.join(HERE, "..", "..", "..", "dreame_x60", "card", "tests", "fixtures"))


def load(name):
    with open(os.path.join(FIX, name), encoding="utf-8") as f:
        return json.load(f)


def vectors(name):
    return load(name)["vektoren"]


STATES = load("states-docked.json")


def st(entity_id, default="unknown"):
    s = STATES.get(entity_id)
    return s["state"] if s else default


# ───────── Raumwerte ─────────
# Python liest nur modus/saug/wdh (kein Wasser, keine Route) und kennt keine Defaults: unbekannter Code → None,
# das Skript nimmt dann den Standard des Eintrags. JS setzt unbekannten Modus auf „Saugen“ und Saugstufe auf
# „Standard“ und Wdh auf „1“. Für gültige Codes müssen beide gleich lesen.

RAUM = [v for v in vectors("raumwerte.v1.json") if "s" in v["input"]]


@pytest.mark.parametrize("v", RAUM, ids=[v["name"] for v in RAUM])
def test_parse_raumwerte_gueltige_felder(v):
    py = runlog.parse_raumwerte(v["input"]["s"])
    js = v["output"]["parsed"]
    for rid, jsv in js.items():
        assert int(rid) in py, f"Raum {rid} fehlt in Python"
        pyv = py[int(rid)]
        # Vergleich nur dort, wo Python einen Wert liefert (gültiger Code); None = Standard des Eintrags
        if pyv["modus"] is not None:
            assert pyv["modus"] == jsv["modus"], f"Raum {rid} Modus"
        if pyv["saug"] is not None:
            assert pyv["saug"] == jsv["saug"], f"Raum {rid} Saugstufe"
        if pyv["wdh"] is not None:
            assert pyv["wdh"] == jsv["wdh"], f"Raum {rid} Wdh"


@pytest.mark.xfail(reason="10a: JS ersetzt unbekannte Codes durch Saugen/Standard/1, Python durch den Standard des Eintrags", strict=True)
def test_parse_raumwerte_unbekannte_codes_wie_js():
    v = next(x for x in RAUM if x["name"] == "unbekannte Codes")
    py = runlog.parse_raumwerte(v["input"]["s"])[6]
    assert py == {"modus": "Saugen", "saug": "Standard", "wdh": "2"}


@pytest.mark.xfail(reason="10a: JS ignoriert Raum-IDs außerhalb 1..7, Python nicht (unschädlich, Räume kommen aus dem Eintrag)", strict=True)
def test_parse_raumwerte_ids_ausserhalb():
    v = next(x for x in RAUM if x["name"].startswith("ungültige Raum-ID"))
    py = runlog.parse_raumwerte(v["input"]["s"])
    assert set(py) == {int(k) for k in v["output"]["parsed"]}


# ───────── Schätzung ─────────
def plan_args(v):
    """Argumente für runlog.schaetzung aus dem Vektor (Plan-Helfer der Fixture + Eingabe)."""
    inp, plan = v["input"], v["output"]["plan"]
    n = inp["n"]
    raumwerte = "" if inp.get("plan", {}).get("raum") == {} else st(f"input_text.heidi_plan{n}_raumwerte", "")
    return {
        "rooms": plan["raeume"],
        "modus": plan["modus"], "saug": plan["saug"], "wdh": plan["wdh"], "raumwerte": raumwerte,
        "sp_saug": plan["spSaug"], "sp_wdh": plan["spWdh"], "ho_saug": plan["hoSaug"], "ho_wdh": plan["hoWdh"],
        "batt": inp.get("batt0", inp.get("batt", 100)), "variante": inp.get("variante", "normal"),
    }


def lernwerte_for(v):
    inp = v["input"]
    if inp.get("overrides", {}).get("sensor.heidi_lernwerte", {}).get("state") == "unavailable":
        return None
    return inp.get("lern") or STATES["sensor.heidi_lernwerte"]["attributes"]


EST = [v for v in vectors("estimate.v1.json") if v["output"]["estimate"] is not None and not v["input"].get("uniform")]


@pytest.mark.parametrize("v", EST, ids=[v["name"] for v in EST])
def test_schaetzung(v):
    lw = lernwerte_for(v)
    assert lw is not None
    py = runlog.schaetzung(lw, plan_args(v))
    js = v["output"]["estimate"]
    assert abs(py["total"] - js["total"]) <= 1, f"total {py['total']} vs {js['total']}"
    assert py["charges"] == js["charges"]
    assert abs(py["batt_end"] - js["battEnd"]) <= 1
    assert py["unlearned"] == js["unlearned"]
    assert abs(py["used"] - js["used"]) <= 1


def test_schaetzung_spec_grenzfaelle():
    spec = load("estimate.spec.json")
    lw = spec["lern"]
    base = spec["plan"]
    for c in spec["faelle"]:
        if c.get("uniform"):
            continue  # kein uniform in Python
        plan = {**base, **c["plan"]}
        raum = plan.get("raum") or {}
        # Raumwerte des Spec-Falls als Kurzformat (nur modus/saug/wdh, wie parse_raumwerte sie liest)
        inv_m = {v: k for k, v in runlog.RV_MODE.items()}
        inv_s = {v: k for k, v in runlog.RV_SUCT.items()}
        rw = ";".join(f"{i}:{inv_m.get(r.get('modus'), '-')}/{inv_s.get(r.get('saug'), '-')}/-/-/{r.get('wdh', '1')}" for i, r in raum.items())
        py = runlog.schaetzung(lw, {"rooms": plan["raeume"], "modus": plan["modus"], "saug": plan["saug"], "wdh": plan["wdh"], "raumwerte": rw,
                                   "sp_saug": plan["spSaug"], "sp_wdh": plan["spWdh"], "ho_saug": plan["hoSaug"], "ho_wdh": plan["hoWdh"],
                                   "batt": c["batt0"], "variante": c.get("variante", "normal")})
        e = c["erwartet"]
        if "charges" in e:
            assert py["charges"] == e["charges"], c["name"]
        if "total" in e:
            assert abs(py["total"] - e["total"]) <= 1, c["name"]
        if "battEnd" in e:
            assert abs(py["batt_end"] - e["battEnd"]) <= 1, c["name"]


# ───────── Laufgrenzen ─────────
TL = vectors("timeline.v1.json")


@pytest.mark.parametrize("v", TL, ids=[v["name"][:60] for v in TL])
def test_split_runs_laufgrenzen(v):
    """split_runs (Python) und runsFromVacuum (JS/v1) teilen die Roboterzustände an denselben Stellen."""
    now = datetime(2026, 9, 15, 9, 0, 0)
    rows = [{"t": now - timedelta(minutes=m), "vac": state} for m, state in v["input"]["vac"]]
    runs = runlog.split_runs(rows)
    # JS-Perioden nachrechnen wie runsFromVacuum (GAP 45 s), damit die Erwartung unabhängig von „jetzt“ ist
    periods, ps, gap = [], None, None
    for r in rows:
        if r["vac"] in runlog.RUN:
            if ps is not None and gap is not None and (r["t"] - gap).total_seconds() >= 45:
                periods.append((ps, gap)); ps = None
            if ps is None:
                ps = r["t"]
            gap = None
        elif ps is not None and gap is None:
            gap = r["t"]
    if ps is not None:
        periods.append((ps, gap))
    assert len(runs) == len(periods), "Anzahl der Läufe"
    for run, (s, e) in zip(runs, periods):
        assert run[0]["t"] == s, "Laufstart"
        assert run[-1]["vac"] in runlog.RUN, "Haltezeilen am Ende abgeschnitten"
        if e is not None:
            assert run[-1]["t"] < e, "Lauf endet vor dem Halt"
