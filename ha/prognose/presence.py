#!/usr/bin/env python3
"""Heidi – Anwesenheitsprotokoll und Prognose.

Aufrufe (aus Home Assistant per shell_command / command_line):
  presence.py log <herbert> <nicole> <nina>      Ist-Zustand protokollieren (home/not_home)
  presence.py config <on|off> <on|off> <on|off>  Welche Personen in die Prognose einfließen
  presence.py forecast                           JSON für sensor.heidi_prognose + Heatmap-Bilder
  presence.py reset                              Protokoll löschen

Dateien: /config/prognose/presence_log.csv, config.json; Bilder unter /config/www/prognose_*.png
"""
import csv, json, math, os, sys
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(BASE, "presence_log.csv")
CFG = os.path.join(BASE, "config.json")
WWW = os.path.join(os.path.dirname(BASE), "www")
PERSONS = ["herbert", "nicole", "nina"]
NAMES = {"herbert": "Herbert", "nicole": "Nicole", "nina": "Nina"}
SLOTS = 48                      # Slots pro Tag (wird aus config.json "aufloesung" gesetzt)
SLOT_MIN = 30                   # Minuten je Slot
WEEKS = 8                       # Lernzeitraum (config.json "wochen")
HALF_LIFE_DAYS = 21             # neuere Tage stärker gewichten (config.json "halbwert")
DAYN = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]


def load_cfg():
    """Liest config.json und setzt die globalen Parameter (Auflösung, Lernzeitraum, Halbwertszeit)."""
    global SLOTS, SLOT_MIN, WEEKS, HALF_LIFE_DAYS
    cfg = {"herbert": True, "nicole": True, "nina": False, "wochen": 8, "halbwert": 21, "aufloesung": 30}
    try:
        with open(CFG) as f:
            cfg.update(json.load(f))
    except Exception:
        pass
    SLOT_MIN = int(cfg.get("aufloesung") or 30)
    if SLOT_MIN not in (15, 30, 60):
        SLOT_MIN = 30
    SLOTS = 1440 // SLOT_MIN
    WEEKS = max(1, int(cfg.get("wochen") or 8))
    HALF_LIFE_DAYS = max(1, int(cfg.get("halbwert") or 21))
    return cfg


def slot_of(t):
    return min(SLOTS - 1, (t.hour * 60 + t.minute) // SLOT_MIN)


def cmd_log(args):
    vals = [(1 if a == "home" else 0) for a in (args + ["not_home"] * 3)[:3]]
    new = not os.path.exists(LOG)
    with open(LOG, "a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["zeit"] + PERSONS)
        w.writerow([datetime.now().strftime("%Y-%m-%dT%H:%M")] + vals)
    print("ok")


def cmd_config(args):
    """config <herbert on|off> <nicole> <nina> [wochen] [halbwert_tage] [aufloesung_min]"""
    cfg = {p: (a == "on") for p, a in zip(PERSONS, (args + ["off"] * 3)[:3])}
    for key, idx, default in (("wochen", 3, 8), ("halbwert", 4, 21), ("aufloesung", 5, 30)):
        try:
            cfg[key] = int(float(args[idx]))
        except Exception:
            cfg[key] = default
    with open(CFG, "w") as f:
        json.dump(cfg, f)
    print("ok")


def cmd_reset(_):
    for p in (LOG,):
        if os.path.exists(p):
            os.remove(p)
    print("ok")


def read_log():
    load_cfg()
    rows = []
    if not os.path.exists(LOG):
        return rows
    cutoff = datetime.now() - timedelta(weeks=WEEKS)
    with open(LOG) as f:
        r = csv.reader(f)
        next(r, None)
        for line in r:
            try:
                t = datetime.strptime(line[0], "%Y-%m-%dT%H:%M")
            except Exception:
                continue
            if t < cutoff:
                continue
            rows.append((t, [int(x) for x in line[1:4]]))
    return rows


def build_profile(rows):
    """prob[person][weekday][slot] gewichtet; count[weekday] = Anzahl Tage mit Daten."""
    num = {p: [[0.0] * SLOTS for _ in range(7)] for p in PERSONS}
    den = {p: [[0.0] * SLOTS for _ in range(7)] for p in PERSONS}
    days = [set() for _ in range(7)]
    now = datetime.now()
    for t, vals in rows:
        wd, slot = t.weekday(), slot_of(t)
        age = (now - t).days
        w = 0.5 ** (age / HALF_LIFE_DAYS)
        days[wd].add(t.date())
        for i, p in enumerate(PERSONS):
            num[p][wd][slot] += w * vals[i]
            den[p][wd][slot] += w
    prob = {}
    for p in PERSONS:
        prob[p] = [[(num[p][d][s] / den[p][d][s]) if den[p][d][s] > 0 else None for s in range(SLOTS)] for d in range(7)]
        # Nur kurze Lücken (max. 2 Slots) ZWISCHEN zwei Messungen füllen –
        # keine Extrapolation in Tageszeiten ohne Daten (sonst wäre z. B. ein
        # halb protokollierter Tag komplett "zu Hause").
        for d in range(7):
            row = prob[p][d]
            known = [i for i, v in enumerate(row) if v is not None]
            for i in range(SLOTS):
                if row[i] is None:
                    lo = max([k for k in known if k < i], default=None)
                    hi = min([k for k in known if k > i], default=None)
                    if lo is not None and hi is not None and (hi - lo) * SLOT_MIN <= 90:
                        row[i] = (row[lo] + row[hi]) / 2
    return prob, [len(d) for d in days]


def slot_time(s):
    m = s * SLOT_MIN
    return "%02d:%02d" % (m // 60, m % 60)


def cmd_forecast(_):
    cfg = load_cfg()
    rows = read_log()
    prob, counts = build_profile(rows)
    total_days = len({t.date() for t, _ in rows})
    now = datetime.now()
    wd = now.weekday()
    now_slot = slot_of(now)
    included = [p for p in PERSONS if cfg.get(p)]
    out = {"tage": total_days, "aktualisiert": now.strftime("%d.%m. %H:%M"), "sicherheit": 0, "aufloesung": SLOT_MIN, "wochen": WEEKS,
           "freies_fenster": "–", "rueckkehr": "–", "rueckkehr_min": 0, "rueckkehr_wer": "–",
           "homeoffice": "–", "empfehlung": "–"}
    have = total_days >= 3 and counts[wd] >= 1 and bool(included)
    if not have:
        out["state"] = "Sammelt Daten (%d Tage)" % total_days
        draw_heatmaps(prob, counts)
        print(json.dumps(out, ensure_ascii=False))
        return
    # Wahrscheinlichkeit "irgendjemand zu Hause" je Slot (heute)
    # Slots ohne Daten (None) gelten als "unbekannt" -> weder frei noch Rückkehr
    p_any = [None if any(prob[p][wd][s] is None for p in included)
             else 1 - math.prod(1 - prob[p][wd][s] for p in included) for s in range(SLOTS)]
    # Freies Fenster: längster zusammenhängender Bereich 06:00–22:00 mit p_any < 0.35
    best, cur = (0, 0), None
    for s in range(6 * 60 // SLOT_MIN, 22 * 60 // SLOT_MIN):
        if p_any[s] is not None and p_any[s] < 0.35:
            cur = (cur[0], s) if cur else (s, s)
            if cur[1] - cur[0] > best[1] - best[0]:
                best = cur
        else:
            cur = None
    if best[1] > best[0]:
        out["freies_fenster"] = "%s – %s" % (slot_time(best[0]), slot_time(best[1] + 1))
    # Rückkehr: erster Slot nach jetzt (bzw. nach Fensterbeginn) mit p_any >= 0.5
    start = max(now_slot, best[0] if best[1] > best[0] else now_slot)
    ret = next((s for s in range(start, SLOTS) if p_any[s] is not None and p_any[s] >= 0.5), None)
    if ret is not None:
        out["rueckkehr"] = slot_time(ret)
        out["rueckkehr_min"] = max(0, ret * SLOT_MIN - (now.hour * 60 + now.minute))
        out["rueckkehr_wer"] = NAMES[max(included, key=lambda p: prob[p][wd][ret] or 0)]
    # Homeoffice-Wahrscheinlichkeit (10–15 Uhr, Wochentag)
    if wd < 5:
        ho = {}
        for p in included:
            vals = [prob[p][wd][s] for s in range(10 * 60 // SLOT_MIN, 15 * 60 // SLOT_MIN) if prob[p][wd][s] is not None]
            if vals:
                ho[NAMES[p]] = round(100 * sum(vals) / len(vals))
        out["homeoffice"] = " · ".join("%s %d %%" % (k, v) for k, v in ho.items()) or "–"
    # Sicherheit: Datenmenge für diesen Wochentag
    out["sicherheit"] = min(95, round(counts[wd] * 95 / max(1, WEEKS)))
    # Empfehlung
    if out["rueckkehr_min"] and out["rueckkehr_min"] < 90:
        out["empfehlung"] = "Wenig Zeit bis %s – Schnellprogramm" % out["rueckkehr"]
    elif out["freies_fenster"] != "–":
        out["empfehlung"] = "Volles Programm im Fenster %s" % out["freies_fenster"]
    else:
        out["empfehlung"] = "Heute meist jemand zu Hause – nur eingeschränkt"
    out["state"] = "Rückkehr %s (%d %%)" % (out["rueckkehr"], out["sicherheit"]) if ret is not None else "Heute niemand erwartet"
    draw_heatmaps(prob, counts)
    print(json.dumps(out, ensure_ascii=False))


def draw_heatmaps(prob, counts):
    try:
        from PIL import Image, ImageDraw
    except Exception:
        return
    os.makedirs(WWW, exist_ok=True)
    cw, ch, left, top, gap = (7 if SLOTS > 48 else 28 if SLOTS < 48 else 14), 18, 34, 6, 2
    W, H = left + SLOTS * cw + 8, top + 7 * (ch + gap) + 18
    bg, empty, ink, muted = (24, 33, 43), (31, 42, 53), (232, 237, 242), (147, 161, 175)
    for p in PERSONS:
        img = Image.new("RGB", (W, H), bg)
        d = ImageDraw.Draw(img)
        for wd in range(7):
            y = top + wd * (ch + gap)
            d.text((4, y + 3), DAYN[wd], fill=muted)
            for s in range(SLOTS):
                v = prob[p][wd][s]
                x = left + s * cw
                if v is None:
                    col = empty
                else:
                    col = (int(31 + (47 - 31) * v), int(42 + (209 - 42) * v), int(53 + (182 - 53) * v))
                d.rectangle([x, y, x + cw - 2, y + ch - 1], fill=col)
        for h in range(0, 24, 4):
            d.text((left + h * (60 // SLOT_MIN) * cw, H - 14), "%d" % h, fill=muted)
        img.save(os.path.join(WWW, "prognose_%s.png" % p))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "forecast"
    {"log": cmd_log, "config": cmd_config, "reset": cmd_reset, "forecast": cmd_forecast}.get(cmd, cmd_forecast)(sys.argv[2:])
