"""Heidi – Auswertung des Diagnose-Protokolls (Bauplan F.2a, DX-069): findet Auffälligkeiten selbst.

Reine Funktionen, keine Dateien, kein HA: `auswerten(zeilen, debug, jetzt)` spielt die Zeilen des Protokolls der Reihe
nach durch (Zustand der Welt = letzter bekannter Zustand und Attribute je Entität) und prüft 23 Regeln in drei Gruppen:
  A1–A10  Anzeige gegen Roboter   (braucht die Meldungen der Karte, art anzeige)
  B1–B8   Bedienung und Planer    (nur aus dem Protokoll)
  T1–T5   Roboter und Technik
Eine Regel bleibt still, solange die Karte das nötige Feld nicht meldet (Bausteine, die es noch nicht gibt).
Geprüft wird eine Anzeige in dem Moment, in dem die Karte sie meldet. Weicht sie vom Roboter ab, wartet der Treffer
TOL_S Sekunden: meldet die Karte in dieser Zeit etwas Passendes oder ändert sich der Roboter so, dass es wieder passt,
verfällt er; sonst ist es ein Fund. Ohne neue Meldung der Karte entsteht nie ein Fund – ein geschlossenes Browserfenster
erzeugt also keine falschen Funde.

Fund = {regel, schwere (fehler|hinweis|info), signatur, titel, text, von, bis, zeilen [ts…], suchen [Datei/Befehl…]}.
Felder der Karte (werte): kopf, schritt, hinweis, akku, fortschritt, zustand; ab F.2b zusätzlich modus_ha, saug_ha,
wasser_ha, jetzt (Raum-ID), reihenfolge [Raum-IDs], knoepfe [Dienste], laden, station (ruhe|waescht|trocknet|saugt_ab),
schaetzung_min; Meldung mit puls = Lebenszeichen (alle 30 s), ende = Fenster geschlossen.
"""
import ast
import re
from datetime import datetime, timedelta

# Schwellen (Sekunden) – Verhaltenszahlen mit Namen, wie in der Karte (Regel 16)
TOL_S = 10            # so lange darf eine Anzeige dem Roboter hinterherhinken
DIENST_WIRKUNG_S = 30  # so schnell muss ein Dienstaufruf den Roboter verändern
AUFTRAG_S = 60        # Fenster Raumauftrag → active_segments
START_FENSTER_S = 90  # HA-Dienstaufruf so kurz vor dem Start = Auslöser (sonst extern)
PLANER_START_S = 120  # „startet“ ohne Start
NACH_LAUF_S = 600     # 10 min nach dem Andocken: Raum-Werte zurück, Angepasste Reinigung an, „erledigt“ gesetzt
WEG_S = 600           # so lange darf der Roboter nicht erreichbar sein
PULS_MAX_S = 90       # Lebenszeichen der Karte bleibt aus
SCHAETZUNG_PCT = 30   # Abweichung der Dauer-Schätzung

RUN = ("cleaning", "paused", "returning")
LEER = ("", "unknown", "unavailable", None)
KEIN_FEHLER = ("no_error",) + LEER
KNOEPFE = {"cleaning": ["pause", "stop", "return_to_base"], "paused": ["start", "stop", "return_to_base"],
           "returning": ["pause", "stop", "locate"], "docked": ["start", "locate"]}
KNOEPFE_SONST = ["start", "return_to_base", "locate"]
WIRK_DIENSTE = re.compile(r"^(vacuum\.(start|pause|stop|return_to_base)|dreame_vacuum\.vacuum_clean_(segment|zone|spot))$")
START_DIENSTE = re.compile(r"^(vacuum\.start|dreame_vacuum\.vacuum_clean_|script\.\w*(plan_starten|reinigung|app_szene))")
SUCHEN = {
    "A": ["dreame_x60/card/src/ha/selectors.ts (readRobot, readAllRoomValues)", "dreame_x60/card/src/domain/status.ts, strip.ts",
          "dreame_x60/card/src/components/dx-hero.ts, dx-auftrag.ts"],
    "B": ["ha/automations.yaml (heidi_planer, heidi_lauf_abgeschlossen, heidi_angepasste_reinigung_an)", "ha/scripts.yaml (heidi_reinigung, heidi_plan_starten)",
          "ha/packages/heidi.yaml (sensor.heidi_automatik_status, sensor.heidi_heutiger_plan)"],
    "T": ["HA-Log: .\\tools\\ha.ps1 get \"hassio/core/logs?lines=300\"", "H:\\custom_components\\dreame_vacuum (Integration, Version in HACS)"],
}


def zeit(ts):
    return datetime.fromisoformat(str(ts).replace(" ", "T"))


def liste(v):
    """Attributwerte kommen als Text ('[6, 4]'); liefert eine Liste von Zahlen."""
    if isinstance(v, list):
        return [int(x) for x in v if str(x).lstrip("-").isdigit()]
    try:
        r = ast.literal_eval(str(v))
        return [int(x) for x in r] if isinstance(r, (list, tuple)) else []
    except Exception:
        return []


def norm(v):
    """'Sweeping and mopping' (Attribut) und 'sweeping_and_mopping' (Select) vergleichbar machen."""
    return re.sub(r"[\s-]+", "_", str(v or "").strip().lower())


class Welt:
    """Letzter bekannter Stand je Entität und Attribut, mit dem Zeitpunkt der letzten Änderung."""

    def __init__(self):
        self.st, self.at, self.seit = {}, {}, {}
        self.gut = {}  # letzter gültiger Zustand (Raum-Selects und „Angepasste Reinigung“ sind im Lauf „unavailable“)
        self.vac, self.p = "", ""

    def nimm(self, z):
        ent, t = z.get("ent", ""), zeit(z["ts"])
        if not self.vac and ent.startswith("vacuum."):
            self.vac, self.p = ent, ent.split(".", 1)[1]
        if z.get("alt") != z.get("neu") or ent not in self.st:
            self.st[ent] = z.get("neu"); self.seit[ent] = t
        if z.get("neu") not in LEER:
            self.gut[ent] = z.get("neu")
        for k, (_, neu) in (z.get("attr") or {}).items():
            self.at.setdefault(ent, {})[k] = neu; self.seit[ent + "#" + k] = t

    def zustand(self, ent):
        return self.st.get(ent)

    def attr(self, ent, k):
        return self.at.get(ent, {}).get(k)

    def stabil(self, key, t):
        """Der Wert ist bekannt. (Ob eine Abweichung Bestand hat, entscheidet die Frist TOL_S in auswerten.)"""
        return True

    def e(self, dom, name):
        return "%s.%s_%s" % (dom, self.p, name)


def _fund(regel, schwere, signatur, titel, text, von, bis=None, zeilen=None):
    return {"regel": regel, "schwere": schwere, "signatur": "%s|%s" % (regel, signatur), "titel": titel, "text": text,
            "von": von, "bis": bis or von, "zeilen": zeilen or [von], "suchen": SUCHEN[regel[0]]}


def pruefe_anzeige(w, t, m):
    """A1, A2, A4–A9: Werte einer Kartenmeldung gegen die Welt. Liefert Liste (regel, schwere, signatur, titel, text)."""
    out, x, vac = [], m.get("werte") or {}, w.vac
    zs = w.zustand(vac)
    if not vac or zs in LEER:
        return out
    ts = m["ts"]
    if w.stabil(vac, t):
        if x.get("zustand") not in (None, zs):
            out.append(("A1", "fehler", "zustand", "Anzeige passt nicht zum Roboter: Karte „%s“, Roboter „%s“" % (x.get("zustand"), zs),
                        "Die Karte meldete um %s den Zustand „%s“ (Kopf „%s“), der Roboter war „%s“ – länger als %d s." % (ts[11:19], x.get("zustand"), x.get("kopf"), zs, TOL_S)))
        phase = w.zustand(w.e("sensor", "phase"))
        if zs in RUN and phase not in LEER and w.stabil(w.e("sensor", "phase"), t) and "kopf" in x and phase not in (x.get("kopf"), x.get("schritt")):
            out.append(("A1", "hinweis", "schritt", "Arbeitsschritt passt nicht: Karte „%s“, Roboter „%s“" % (x.get("schritt") or x.get("kopf"), phase),
                        "Die Karte zeigte um %s „%s · %s“, der Arbeitsschritt des Roboters war „%s“." % (ts[11:19], x.get("kopf"), x.get("schritt"), phase)))
        if "knoepfe" in x and list(x["knoepfe"]) != KNOEPFE.get(zs, KNOEPFE_SONST):
            out.append(("A5", "fehler", "knoepfe", "Knöpfe passen nicht zum Zustand „%s“" % zs,
                        "Die Karte zeigte die Knöpfe %s, zum Zustand „%s“ gehören %s." % (list(x["knoepfe"]), zs, KNOEPFE.get(zs, KNOEPFE_SONST))))
        if x.get("fortschritt") is not None and zs not in RUN:
            out.append(("A7", "hinweis", "fortschritt", "Karte zeigt „Fortschritt %s %%“, der Roboter ist „%s“" % (x.get("fortschritt"), zs),
                        "Fortschritt gehört nur in einen Lauf (PD-016). Sensor %s = %s." % (w.e("sensor", "cleaning_progress"), w.zustand(w.e("sensor", "cleaning_progress")))))
    if zs in RUN and "modus_ha" in x:  # A2: gültige Werte = Raum-Werte (Angepasste Reinigung an) oder globale Werte
        seg = w.attr(vac, "current_segment")
        cust = w.gut.get(w.e("switch", "customized_cleaning")) == "on"
        paare = (("modus_ha", "cleaning_mode", "Modus"), ("saug_ha", "suction_level", "Saugstufe"), ("wasser_ha", "mop_pad_humidity", "Wasser"))
        wahr = {}
        for feld, name, _ in paare:
            ent = w.e("select", "room_%s_%s" % (seg, name))
            v = w.gut.get(ent) if cust and seg not in LEER else w.attr(vac, name)
            key = ent if cust and seg not in LEER else vac + "#" + name
            wahr[feld] = norm(v) if v not in LEER and w.stabil(key, t) else None
        for feld, _, titel in paare:
            if feld == "wasser_ha" and "mop" not in (wahr.get("modus_ha") or ""):
                continue
            if wahr[feld] and x.get(feld) not in LEER and norm(x.get(feld)) != wahr[feld]:
                out.append(("A2", "fehler", feld, "Werte passen nicht zum Roboter: %s Karte „%s“, Roboter „%s“" % (titel, x.get(feld), wahr[feld]),
                            "Im Lauf (Raum %s, Angepasste Reinigung %s) gilt %s = „%s“, die Karte zeigte „%s“." % (seg, "an" if cust else "aus – es gelten die globalen Werte", titel, wahr[feld], x.get(feld))))
    if zs in RUN and x.get("jetzt") not in LEER:
        seg = w.attr(vac, "current_segment")
        aktiv = liste(w.attr(vac, "active_segments"))
        if seg not in LEER and w.stabil(vac + "#current_segment", t) and (not aktiv or int(seg) in aktiv) and str(x["jetzt"]) != str(seg):
            out.append(("A4", "fehler", "jetzt", "Raum passt nicht: Karte „Jetzt Raum %s“, Roboter in Raum %s" % (x["jetzt"], seg),
                        "Die Karte zeigte um %s Raum %s als aktuellen Raum, current_segment war %s – länger als %d s." % (ts[11:19], x["jetzt"], seg, TOL_S)))
    batt = w.zustand(w.e("sensor", "battery_level"))
    if "akku" in x and batt not in LEER and w.stabil(w.e("sensor", "battery_level"), t) and str(x["akku"]) != str(batt):
        out.append(("A6", "hinweis", "akku", "Akku passt nicht: Karte %s %%, Roboter %s %%" % (x["akku"], batt), "Gemeldet um %s." % ts[11:19]))
    laden = w.attr(vac, "charging")
    if "laden" in x and laden is not None and w.stabil(vac + "#charging", t) and bool(x["laden"]) != bool(laden):
        out.append(("A6", "hinweis", "laden", "Lade-Anzeige passt nicht: Karte %s, Roboter %s" % (x["laden"], laden), "Gemeldet um %s." % ts[11:19]))
    if "station" in x:
        wahr = "waescht" if w.attr(vac, "washing") else "trocknet" if w.attr(vac, "drying") else \
            "saugt_ab" if w.zustand(w.e("sensor", "auto_empty_status")) not in ("idle",) + LEER else "ruhe"
        if x["station"] != wahr and w.stabil(vac + "#washing", t) and w.stabil(vac + "#drying", t) and w.stabil(w.e("sensor", "auto_empty_status"), t):
            out.append(("A8", "hinweis", "station", "Station passt nicht: Karte „%s“, Station „%s“" % (x["station"], wahr), "Gemeldet um %s." % ts[11:19]))
    err = w.zustand(w.e("sensor", "error"))
    if "hinweis" in x and err not in KEIN_FEHLER and w.stabil(w.e("sensor", "error"), t) and not x["hinweis"]:
        out.append(("A9", "fehler", "chip", "Warnung des Roboters ohne Hinweis in der Karte: %s" % err, "sensor error = „%s“, die Karte zeigte um %s keinen Hinweis-Chip." % (err, ts[11:19])))
    return out


def auswerten(zeilen, debug=None, jetzt=None, ab=None):
    """zeilen: Protokollzeilen (dict, nach ts sortiert; gern mit dem Vortag davor, damit die Welt bekannt ist).
    debug: Textzeilen des Debuglogs. jetzt: Auswertungszeitpunkt (offene Fristen). ab: nur Funde ab diesem ts."""
    zeilen = sorted((z for z in zeilen if z.get("ts")), key=lambda z: z["ts"])
    jetzt = jetzt or (zeit(zeilen[-1]["ts"]) if zeilen else datetime.now())
    w, funde = Welt(), []
    offen_a = {}       # (client, regel, signatur) → erster Treffer, wartet TOL_S auf Korrektur
    dienste = []       # offene Dienstaufrufe (B1) [(t, zeile)]
    auftrag = None     # letzter Raumauftrag aus HA (B2) (t, segments, ts)
    lauf = None        # laufender Lauf {von, auto, reihenfolge, gefahren, schaetzung, durch}
    nach = None        # Fristen nach dem Andocken {t, ts, auto, erledigt_gesetzt}
    startet = None     # (t, ts) seit wann der Planer „startet“ sagt
    weg = {}           # ent → seit wann unavailable
    puls = {}          # client → (t, ts) letzte Meldung, nur wenn der Client Lebenszeichen sendet
    letzter_wechsel = None

    def add(*a, **k):
        funde.append(_fund(*a, **k))

    def fristen(t):
        nonlocal nach, startet
        for c in [c for c in dienste if (t - c[0]).total_seconds() > DIENST_WIRKUNG_S]:
            dienste.remove(c)
            add("B1", "hinweis", c[1]["dienst"], "Dienstaufruf ohne Wirkung: %s" % c[1]["dienst"],
                "Nach %s (%s) änderte sich der Roboter %d s lang nicht (Zustand „%s“)." % (c[1]["dienst"], c[1].get("wer") or c[1].get("durch") or c[1].get("quelle"), DIENST_WIRKUNG_S, w.zustand(w.vac)), c[1]["ts"])
        for key, (t0, m, treffer) in list(offen_a.items()):
            if (t - t0).total_seconds() > TOL_S:
                del offen_a[key]
                add(treffer[0], treffer[1], treffer[2], treffer[3], treffer[4] + " Seite %s, Fenster %s, Karte %s." % (m.get("seite"), m.get("client"), m.get("version")), m["ts"])
        if nach and (t - nach["t"]).total_seconds() > NACH_LAUF_S:
            n, nach = nach, None
            if w.zustand(w.e("input_text", "raum_snapshot")) not in LEER:
                add("B6", "fehler", "snapshot", "Raum-Werte nach dem Lauf nicht wiederhergestellt", "%s ist 10 min nach dem Andocken noch „%s“." % (w.e("input_text", "raum_snapshot"), w.zustand(w.e("input_text", "raum_snapshot"))), n["ts"])
            if w.zustand(w.e("switch", "customized_cleaning")) == "off":
                add("B7", "hinweis", "customized", "„Angepasste Reinigung“ bleibt nach dem Lauf aus", "%s ist 10 min nach dem Andocken noch aus – der nächste Planerlauf nutzt dann die globalen Werte." % w.e("switch", "customized_cleaning"), n["ts"])
            if n["auto"] and not n["erledigt"]:
                add("B4", "fehler", "erledigt", "Automatik-Lauf fertig, „heute erledigt“ nicht gesetzt", "%s wurde nach dem Lauf nicht gesetzt." % w.e("input_datetime", "letzte_auto_reinigung"), n["ts"])
        if startet and (t - startet[0]).total_seconds() > PLANER_START_S:
            s, startet = startet, None
            add("B3", "fehler", "startet", "Planer sagt „startet“, aber kein Start", "%s stand seit %s auf „… startet“, in %d s kam kein Start." % (w.e("sensor", "automatik_status"), s[1][11:19], PLANER_START_S), s[1])
        for ent, (t0, ts0) in list(weg.items()):
            if (t - t0).total_seconds() > WEG_S:
                del weg[ent]
                add("T3", "fehler", ent, "Roboter nicht erreichbar: %s" % ent, "%s ist seit %s länger als %d min „unavailable“." % (ent, ts0[11:19], WEG_S // 60), ts0)

    for z in zeilen:
        t, art = zeit(z["ts"]), z.get("art")
        fristen(t)
        if art == "zustand":
            ent, alt, neu = z.get("ent", ""), z.get("alt"), z.get("neu")
            vorher_run = w.zustand(w.vac) in RUN if w.vac else False
            w.nimm(z)
            for key, (t0, m, _tr) in list(offen_a.items()):  # passt es nach dieser Änderung wieder? dann verfällt der Treffer
                if not any((m.get("client", "?"), tr[0], tr[2]) == key for tr in pruefe_anzeige(w, zeit(m["ts"]), m)):
                    del offen_a[key]
            if ent == w.vac:
                letzter_wechsel = t
                if dienste and (alt != neu or any(k in (z.get("attr") or {}) for k in ("status", "vacuum_state", "running", "returning"))):
                    dienste.clear()
                if neu == "unavailable":
                    weg[ent] = (t, z["ts"])
                else:
                    weg.pop(ent, None)
                if neu == "cleaning" and not vorher_run:  # Start eines Laufs
                    startet = None
                    ruf = next((c for c in reversed(zeilen[:zeilen.index(z)]) if c.get("art") == "dienst" and START_DIENSTE.match(c.get("dienst", ""))
                                and 0 <= (t - zeit(c["ts"])).total_seconds() <= START_FENSTER_S), None)
                    extern = z.get("quelle") == "extern" and not ruf
                    durch = z.get("durch") or (ruf or {}).get("durch") or ""
                    lauf = {"von": z["ts"], "t": t, "auto": w.zustand(w.e("input_boolean", "auto_lauf")) == "on" or "Planer" in durch,
                            "reihenfolge": None, "gefahren": [], "schaetzung": None, "durch": durch}
                    if extern:
                        add("T1", "info", "extern", "Start ohne HA-Auslöser (Dreame-App, Knopf am Roboter oder App-Zeitplan)", "Kein HA-Dienstaufruf in den %d s vor dem Start." % START_FENSTER_S, z["ts"])
                    if "Planer" in durch:  # B5
                        plan = w.e("sensor", "heutiger_plan")
                        soll, stoerer = str(w.attr(plan, "zeit") or ""), str(w.attr(plan, "stoerer") or "[]")
                        if re.match(r"^\d{2}:\d{2}$", soll) and z["ts"][11:16] < soll:
                            add("B5", "fehler", "zeit", "Planerstart vor der Uhrzeit des Eintrags (%s statt %s)" % (z["ts"][11:16], soll), "Der Planer startete um %s, der heutige Eintrag steht auf %s." % (z["ts"][11:19], soll), z["ts"])
                        if stoerer not in ("[]", "", "None"):
                            add("B5", "fehler", "stoerer", "Planerstart, obwohl eine „stört“-Person zu Hause ist: %s" % stoerer, "Attribut stoerer von %s war beim Start %s." % (plan, stoerer), z["ts"])
                    if auftrag and (t - auftrag[0]).total_seconds() <= AUFTRAG_S:
                        lauf["auftrag"] = auftrag
                if lauf and "active_segments" in (z.get("attr") or {}) and lauf.get("auftrag"):
                    ist = liste(w.attr(w.vac, "active_segments"))
                    soll = lauf.pop("auftrag")
                    if ist and sorted(ist) != sorted(soll[1]):
                        add("B2", "fehler", "segments", "Gewählte Räume ≠ Auftrag des Roboters: gewählt %s, Roboter %s" % (soll[1], ist), "Raumauftrag aus HA um %s, active_segments danach %s." % (soll[2][11:19], ist), soll[2])
                if lauf and "current_segment" in (z.get("attr") or {}):
                    seg, aktiv = w.attr(w.vac, "current_segment"), liste(w.attr(w.vac, "active_segments"))
                    if seg not in LEER and (not aktiv or int(seg) in aktiv) and int(seg) not in lauf["gefahren"]:
                        lauf["gefahren"].append(int(seg))
                if lauf and vorher_run and neu not in RUN:  # Ende des Laufs
                    l, lauf = lauf, None
                    ank, gef = l["reihenfolge"], l["gefahren"]
                    if ank and len(gef) > 1 and [r for r in ank if r in gef] != gef:
                        add("A3", "fehler", "reihenfolge", "Reihenfolge passt nicht: Karte kündigte %s an, gefahren wurde %s" % (ank, gef), "Lauf %s – %s%s." % (l["von"][11:19], z["ts"][11:19], ", Start durch " + l["durch"] if l["durch"] else ""), l["von"], z["ts"])
                    dauer = (t - l["t"]).total_seconds() / 60
                    if l["schaetzung"] and dauer >= 5 and abs(dauer - l["schaetzung"]) / l["schaetzung"] * 100 > SCHAETZUNG_PCT:
                        add("B8", "hinweis", "schaetzung", "Dauer-Schätzung daneben: geschätzt %d min, gefahren %d min" % (l["schaetzung"], dauer), "Abweichung über %d %%." % SCHAETZUNG_PCT, l["von"], z["ts"])
                    nach = {"t": t, "ts": z["ts"], "auto": l["auto"], "erledigt": False}
            elif ent == w.e("input_datetime", "letzte_auto_reinigung") and nach:
                nach["erledigt"] = True
            elif ent == w.e("sensor", "automatik_status"):
                startet = (t, z["ts"]) if "startet" in str(neu) and w.zustand(w.vac) not in RUN else None
            elif ent == w.e("sensor", "battery_level"):
                if neu == "unavailable":
                    weg[ent] = (t, z["ts"])
                else:
                    weg.pop(ent, None)
            elif ent == w.e("sensor", "error") and neu not in KEIN_FEHLER and alt != neu:
                fehler = bool(w.attr(w.vac, "has_error"))
                add("T2", "fehler" if fehler else "hinweis", str(neu), "%s des Roboters: %s" % ("Fehler" if fehler else "Warnung", neu), "%s wechselte von „%s“ auf „%s“." % (ent, alt, neu), z["ts"])
        elif art == "dienst":
            d = z.get("dienst", "")
            if WIRK_DIENSTE.match(d):
                dienste.append((t, z))
            if d.endswith("vacuum_clean_segment"):
                auftrag = (t, liste((z.get("daten") or {}).get("segments")), z["ts"])
        elif art == "anzeige":
            c, x = z.get("client", "?"), z.get("werte") or {}
            if c in puls and (t - puls[c][0]).total_seconds() > PULS_MAX_S and letzter_wechsel and puls[c][0] < letzter_wechsel < t:
                add("A10", "hinweis", "puls", "Karte bekam keine Daten: Fenster %s meldete %d s nichts" % (c, (t - puls[c][0]).total_seconds()),
                    "Der Roboter änderte sich in dieser Zeit, das Fenster war offen (kein „ende“).", puls[c][1], z["ts"])
            if z.get("ende"):
                puls.pop(c, None)
            elif z.get("puls") or c in puls:
                puls[c] = (t, z["ts"])
            alt_a = {k: offen_a.pop(k) for k in [k for k in offen_a if k[0] == c]}  # neue Meldung desselben Fensters: neu beurteilen
            if lauf:
                if lauf["reihenfolge"] is None and x.get("reihenfolge"):
                    lauf["reihenfolge"] = liste(x["reihenfolge"])
                if lauf["schaetzung"] is None and isinstance(x.get("schaetzung_min"), (int, float)):
                    lauf["schaetzung"] = x["schaetzung_min"]
            if not z.get("ende"):
                for tr in pruefe_anzeige(w, t, z):  # derselbe Treffer wie vorher behält seinen ersten Zeitpunkt (Frist läuft weiter)
                    key = (c, tr[0], tr[2])
                    offen_a[key] = (alt_a[key][0], alt_a[key][1], tr) if key in alt_a else (t, z, tr)
    fristen(jetzt)

    for sig, (n, erste, letzte, text) in debug_fehler(debug or []).items():  # T4, T5
        if sig == "#luecke":
            add("T5", "hinweis", "luecke", "Lücke im Debuglog (%d×)" % n, text, erste, letzte)
        else:
            f = _fund("T4", "fehler", sig, "Integration meldet Fehler: %s" % sig, text, erste, letzte)
            f["anzahl"] = n
            funde.append(f)
    if ab:
        funde = [f for f in funde if f["bis"] >= ab]
    return sorted(funde, key=lambda f: f["von"])


LOG_KOPF = re.compile(r"^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}\.\d{3}) (\w+) \((?:[^()]|\([^)]*\))*\) \[([^\]]+)\] (.*)$")


def debug_fehler(lines):
    """Debuglog → {signatur: (anzahl, erster ts, letzter ts, text)}; Signatur = Logger + letzte Zeile des Tracebacks."""
    out, cur, lts = {}, None, ""

    def fertig():
        if cur:
            sig = "%s: %s" % (cur["logger"].split(".")[-1], re.sub(r"\d+", "N", cur["ende"])[:140])
            n, erste, _, text = out.get(sig, (0, cur["ts"], cur["ts"], cur["text"]))
            out[sig] = (n + 1, erste, cur["ts"], text)

    for line in lines:
        m = LOG_KOPF.match(line)
        if m:
            fertig(); cur = None; lts = m.group(1) + "T" + m.group(2)
            if m.group(3) in ("ERROR", "CRITICAL"):
                cur = {"ts": m.group(1) + "T" + m.group(2), "logger": m.group(4), "ende": m.group(5), "text": line[:400]}
        elif line.startswith("# Lücke"):
            n, erste, _, text = out.get("#luecke", (0, lts, lts, line))
            out["#luecke"] = (n + 1, erste, lts or erste, text)
        elif cur and line.strip() and not cur.get("zu"):
            if re.match(r"^\s|^Traceback|^During handling|^The above exception", line):
                pass  # Rahmenzeilen des Tracebacks
            elif re.match(r"^[\w.]+(Error|Exception|Warning|Exit|Interrupt)?\b.*", line) and re.match(r"^[\w.]+: |^[\w.]+$", line):
                cur["ende"] = line.strip(); cur["zu"] = True  # letzte Zeile = die Ausnahme selbst
            else:
                cur["zu"] = True; continue  # fremde Zeile ohne Zeitstempel (Supervisor o. ä.)
            if len(cur["text"]) < 1200:
                cur["text"] += "\n" + line[:300]
    fertig()
    return out
