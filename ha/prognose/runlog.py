#!/usr/bin/env python3
"""Heidi – Laufprotokoll und Lernwerte (Dauer und Akku je Raum und Einstellung).

Aufrufe (aus Home Assistant per shell_command / command_line):
  runlog.py log '<json>'          eine Zeile anhängen (Automation: bei Phasenwechsel + jede Minute im Lauf/beim Laden)
  runlog.py lernwerte             JSON für sensor.heidi_lernwerte (Raten je "Modus/Saugstufe", Räume, Laden, Wäsche)
  runlog.py schaetzung '<json>'   Dauer/Akku eines Eintrags schätzen (für die Automatik), JSON zurück

Datei: /config/prognose/runlog.csv (Rohdaten, wird nie automatisch gelöscht; Spalte "v" = Formatversion).
Rohdaten je Zeile: ts, phase, vac (Zustand), seg (Raum-ID), room, batt, area (m² gereinigt), ctime (min),
charging, docked, mode/suction/water/route/times (Raumwerte des aktuellen Raums, HA-Werte), belag, plan,
variante, selfclean (Mopp-Wäsche nach m²), mop_pad, carpet, mop_extend, water_temp.
"""
import csv, json, os, sys
from datetime import datetime
from statistics import median

BASE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(BASE, "runlog.csv")
COLS = ["ts", "v", "phase", "vac", "seg", "room", "batt", "area", "ctime", "charging", "docked", "mode", "suction",
        "water", "route", "times", "belag", "plan", "variante", "selfclean", "mop_pad", "carpet", "mop_extend", "water_temp"]
RUN = ("cleaning", "paused", "returning")
MODE_DE = {"sweeping": "Saugen", "sweeping_and_mopping": "Saugen + Wischen", "mopping": "Nur Wischen"}
SUCT_DE = {"quiet": "Leise", "standard": "Standard", "strong": "Stark", "turbo": "Turbo"}
SUCT_F = {"Leise": 0.8, "Standard": 1.0, "Stark": 1.25, "Turbo": 1.6}
RV_MODE = {"S": "Saugen", "B": "Saugen + Wischen", "W": "Nur Wischen"}
RV_SUCT = {"L": "Leise", "S": "Standard", "K": "Stark", "T": "Turbo"}
DEFAULT_LADEN = {"schnell_pct_min": 1.1, "langsam_pct_min": 0.5, "rueckkehr_pct": 15, "weiter_pct": 80, "gelernt": False}
DEFAULT_WAESCHE = {"vor_start_min": 4, "zwischen_min": 5, "nach_m2": 25, "gelernt": False}
GAP_S = 45          # kürzere Halte gelten nicht als Laufende (Startsequenz cleaning→docked→idle→cleaning)
MIN_SEG_MIN = 0.75  # kürzere Raumabschnitte = Türschwellen-Flackern


def cmd_log(args):
    """Eine Rohdatenzeile anhängen. args[0] = JSON-Objekt mit den Spaltennamen als Schlüssel."""
    try:
        d = json.loads(args[0]) if args else {}
    except Exception as e:
        print("JSON ungültig:", e); return
    d.setdefault("ts", datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))
    d.setdefault("v", 1)
    new = not os.path.exists(LOG)
    with open(LOG, "a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(COLS)
        w.writerow(["" if d.get(c) is None else d.get(c) for c in COLS])


def _f(x, d=0.0):
    try:
        return float(x)
    except Exception:
        return d


def read_rows():
    rows = []
    if not os.path.exists(LOG):
        return rows
    with open(LOG, newline="") as f:
        r = csv.DictReader(f)
        for line in r:
            try:
                t = datetime.strptime(line["ts"][:19], "%Y-%m-%dT%H:%M:%S")
            except Exception:
                continue
            line["t"] = t
            line["batt_f"] = _f(line.get("batt"), -1)
            line["area_f"] = _f(line.get("area"), 0)
            rows.append(line)
    rows.sort(key=lambda x: x["t"])
    return rows


def split_runs(rows):
    """Läufe = Roboter unterwegs; ein Halt < GAP_S unterbricht nicht. Liefert Listen von Zeilen (inkl. Haltezeilen)."""
    runs, cur, pending = [], None, None
    for r in rows:
        running = r.get("vac") in RUN
        if running:
            if cur is not None and pending is not None and (r["t"] - pending).total_seconds() >= GAP_S:
                runs.append(cur); cur = None
            if cur is None:
                cur = []
            cur.append(r); pending = None
        elif cur is not None:
            if pending is None:
                pending = r["t"]
            cur.append(r)
    if cur:
        runs.append(cur)
    # Haltezeilen am Ende abschneiden
    out = []
    for run in runs:
        while run and run[-1].get("vac") not in RUN:
            run.pop()
        if run:
            out.append(run)
    return out


def is_room_phase(ph):
    return ph.startswith("Saugt ") or ph.startswith("Wischt ") or ph.startswith("Saugt und wischt ")


def room_segments(run):
    """Zusammenhängende Raumabschnitte eines Laufs: (seg, key, dauer_min, area, batt_drop, times, belag)."""
    segs = []
    n = len(run)
    i = 0
    while i < n:
        r = run[i]
        if not (is_room_phase(r.get("phase", "")) and r.get("seg") and r.get("vac") == "cleaning"):
            i += 1; continue
        # Modus zuverlässig aus dem Phasentext (die Raum-Selects sind im Lauf teils "unavailable")
        ph = r.get("phase", "")
        modus = "Saugen + Wischen" if ph.startswith("Saugt und wischt ") else "Nur Wischen" if ph.startswith("Wischt ") else "Saugen"
        key = modus + "/" + SUCT_DE.get(r.get("suction"), "Standard")
        j = i
        while j + 1 < n and run[j + 1].get("seg") == r["seg"] and run[j + 1].get("phase", "") == ph and run[j + 1].get("vac") == "cleaning":
            j += 1
        end = run[j + 1] if j + 1 < n else run[j]
        dur = (end["t"] - r["t"]).total_seconds() / 60
        area = max(0.0, end["area_f"] - r["area_f"])
        drop = (r["batt_f"] - end["batt_f"]) if r["batt_f"] >= 0 and end["batt_f"] >= 0 else 0.0
        try:
            times = int(str(r.get("times") or "1").replace("x", "") or 1)
        except Exception:
            times = 1
        segs.append({"seg": r["seg"], "key": key, "min": dur, "area": area, "drop": max(0.0, drop), "times": max(1, times), "belag": r.get("belag") or ""})
        i = j + 1
    # Flackern: kurze Abschnitte weg, gleiche Nachbarn zusammenlegen
    segs = [s for s in segs if s["min"] >= MIN_SEG_MIN]
    merged = []
    for s in segs:
        if merged and merged[-1]["seg"] == s["seg"] and merged[-1]["key"] == s["key"]:
            m = merged[-1]; m["min"] += s["min"]; m["area"] += s["area"]; m["drop"] += s["drop"]
        else:
            merged.append(dict(s))
    return merged


def phase_durations(run, prefix):
    """Dauer (min) zusammenhängender Phasen mit diesem Präfix innerhalb eines Laufs."""
    out, i, n = [], 0, len(run)
    while i < n:
        if run[i].get("phase", "").startswith(prefix):
            j = i
            while j + 1 < n and run[j + 1].get("phase", "").startswith(prefix):
                j += 1
            end = run[j + 1] if j + 1 < n else run[j]
            out.append((end["t"] - run[i]["t"]).total_seconds() / 60)
            i = j + 1
        else:
            i += 1
    return [d for d in out if d >= 0.5]


def lernwerte(rows):
    runs = split_runs(rows)
    acc = {}      # key -> {min, area, drop, runs:set}
    raeume = {}   # seg -> {flaechen:[...], belag}
    vor, zw = [], []
    selfclean = 25
    for idx, run in enumerate(runs):
        for s in room_segments(run):
            a = acc.setdefault(s["key"], {"min": 0.0, "area": 0.0, "drop": 0.0, "runs": set()})
            a["min"] += s["min"]; a["area"] += s["area"]; a["drop"] += s["drop"]; a["runs"].add(idx)
            rm = raeume.setdefault(s["seg"], {"flaechen": [], "belag": ""})
            if s["area"] > 0:
                rm["flaechen"].append(s["area"] / s["times"])
            if s["belag"]:
                rm["belag"] = s["belag"]
        vor += phase_durations(run, "Wäscht Mopps vor dem Start")
        zw += phase_durations(run, "Wäscht Mopps zwischendurch")
        for r in run:
            if r.get("selfclean"):
                selfclean = _f(r["selfclean"], 25)
    raten = {}
    for k, a in acc.items():
        if a["area"] >= 1 and a["min"] >= 2:
            raten[k] = {"min_pro_m2": round(a["min"] / a["area"], 3), "pct_pro_min": round(a["drop"] / a["min"], 3), "laeufe": len(a["runs"]), "minuten": round(a["min"], 1), "flaeche": round(a["area"], 1)}
    rooms = {}
    for seg, rm in raeume.items():
        fl = rm["flaechen"][-3:]
        rooms[seg] = {"flaeche": round(median(fl), 1) if fl else None, "belag": rm["belag"], "laeufe": len(rm["flaechen"])}
    # Laden: Prozent pro Minute aus aufeinanderfolgenden Ladezeilen (Abstand <= 3 min)
    fast, slow, prev = [], [], None
    for r in rows:
        if r.get("charging") in ("True", "true", "1") and r.get("vac") not in RUN and r["batt_f"] >= 0:
            if prev is not None and 0 < (r["t"] - prev["t"]).total_seconds() <= 180 and r["batt_f"] > prev["batt_f"]:
                rate = (r["batt_f"] - prev["batt_f"]) / ((r["t"] - prev["t"]).total_seconds() / 60)
                (fast if prev["batt_f"] < 80 else slow).append(rate)
            prev = r
        else:
            prev = None
    laden = dict(DEFAULT_LADEN)
    if len(fast) >= 5:
        laden["schnell_pct_min"] = round(median(fast), 2); laden["gelernt"] = True
    if len(slow) >= 5:
        laden["langsam_pct_min"] = round(median(slow), 2)
    waesche = dict(DEFAULT_WAESCHE)
    waesche["nach_m2"] = selfclean
    if vor:
        waesche["vor_start_min"] = round(median(vor), 1); waesche["gelernt"] = True
    if zw:
        waesche["zwischen_min"] = round(median(zw), 1)
    return {"state": len(runs), "laeufe_gesamt": len(runs), "raten": raten, "raeume": rooms, "laden": laden, "waesche": waesche,
            "stand": datetime.now().strftime("%Y-%m-%d %H:%M"), "zeilen": len(rows)}


def rate_for(lw, modus, saug):
    r = (lw.get("raten") or {}).get(modus + "/" + saug)
    if r and r.get("laeufe", 0) > 0:
        return {"min_pro_m2": r["min_pro_m2"], "pct_pro_min": r["pct_pro_min"], "gelernt": True}
    base = None
    for k, v in (lw.get("raten") or {}).items():
        if k.startswith(modus + "/") and v.get("laeufe", 0) > 0:
            base = dict(v); base["f"] = SUCT_F.get(k.split("/")[1], 1.0); break
    if base is None:
        base = {"min_pro_m2": 0.9 if modus == "Saugen" else 1.6, "pct_pro_min": 0.3 if modus == "Saugen" else 0.42, "f": 1.0}
    return {"min_pro_m2": base["min_pro_m2"], "pct_pro_min": base["pct_pro_min"] * SUCT_F.get(saug, 1.0) / base["f"], "gelernt": False}


def charge_min(frm, to, L):
    m = 0.0
    if frm < 80:
        m += (min(to, 80) - frm) / L["schnell_pct_min"]
    if to > 80:
        m += (to - max(frm, 80)) / L["langsam_pct_min"]
    return max(0.0, m)


def parse_raumwerte(s):
    out = {}
    for p in (s or "").split(";"):
        if ":" not in p:
            continue
        i, rest = p.split(":", 1); f = rest.split("/")
        if len(f) < 5:
            continue
        try:
            n = int(i)
        except Exception:
            continue
        out[n] = {"modus": RV_MODE.get(f[0]), "saug": RV_SUCT.get(f[1]), "wdh": f[4] if f[4] in ("1", "2", "3") else None}
    return out


def schaetzung(lw, a):
    """Wie _estimate() in der Karte: Raum für Raum in Roboter-Reihenfolge, Mopp-Wäschen, Ladestopps."""
    rooms = [int(x) for x in a.get("rooms", [])]
    seq = [int(x) for x in a.get("sequence", [])]
    order = [i for i in seq if i in rooms] + [i for i in rooms if i not in seq]
    var = a.get("variante", "normal")
    if var == "schnell":
        std = {"modus": "Saugen", "saug": a.get("sp_saug", "Standard"), "wdh": a.get("sp_wdh", "1")}
    elif var == "leise":
        std = {"modus": "Saugen", "saug": a.get("ho_saug", "Leise"), "wdh": a.get("ho_wdh", "1")}
    else:
        std = {"modus": a.get("modus", "Saugen"), "saug": a.get("saug", "Standard"), "wdh": a.get("wdh", "1")}
    ov = parse_raumwerte(a.get("raumwerte")) if var == "normal" else {}
    L = lw.get("laden") or DEFAULT_LADEN
    W = lw.get("waesche") or DEFAULT_WAESCHE
    batt = _f(a.get("batt"), 100.0)
    t, since, charges, used, unlearned = 0.0, 0.0, 0, 0.0, 0

    def setting(i):
        s = dict(std)
        for k, v in (ov.get(i) or {}).items():
            if v:
                s[k] = v
        return s
    wet = any(setting(i)["modus"] != "Saugen" for i in order)
    if wet:
        t += W["vor_start_min"]
    for i in order:
        s = setting(i)
        rate = rate_for(lw, s["modus"], s["saug"])
        if not rate["gelernt"]:
            unlearned += 1
        rm = (lw.get("raeume") or {}).get(str(i)) or (lw.get("raeume") or {}).get(i) or {}
        area = rm.get("flaeche") or 8
        mins = area * rate["min_pro_m2"] * int(s["wdh"] or 1)
        drain = mins * rate["pct_pro_min"]
        if batt - drain < L["rueckkehr_pct"]:
            t += charge_min(batt, L["weiter_pct"], L) + 4; batt = L["weiter_pct"]; charges += 1
        batt -= drain; t += mins; since += area; used += drain
        if s["modus"] != "Saugen" and since >= W["nach_m2"]:
            t += W["zwischen_min"]; since = 0
    t += 3
    return {"total": round(t), "charges": charges, "used": round(used), "batt_end": round(batt), "unlearned": unlearned, "gelernt": bool(lw.get("laeufe_gesamt"))}


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "lernwerte"
    if cmd == "log":
        cmd_log(sys.argv[2:])
    elif cmd == "schaetzung":
        try:
            a = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        except Exception as e:
            print(json.dumps({"error": "JSON ungültig: %s" % e})); return
        print(json.dumps(schaetzung(lernwerte(read_rows()), a), ensure_ascii=False))
    else:
        print(json.dumps(lernwerte(read_rows()), ensure_ascii=False))


if __name__ == "__main__":
    main()
