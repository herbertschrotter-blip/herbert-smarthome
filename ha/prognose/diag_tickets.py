"""Heidi – Tickets zum Diagnose-Protokoll (Bauplan F.2a, DX-069).

Jede Meldung („Fehler melden“) und jeder Fund der Auswertung ab Schwere „hinweis“ wird ein Ticket HT-0001 …
Ein Ticket je Problem (Signatur), nicht je Vorkommen: Wiederholungen zählen hoch; tritt ein gelöstes Ticket wieder auf,
wird es mit Vermerk neu geöffnet; ein verworfenes („kein Fehler“) bleibt verworfen. Beweise werden beim Anlegen
gesichert, weil die Protokolle nach 30/14 Tagen gelöscht werden. Tickets werden nie automatisch gelöscht.

Reine Funktionen über dem Speicher-Objekt {"next": n, "tickets": [...]}; Lesen/Schreiben der Datei macht diag.py
(einziger Schreibweg, mit Sperre). Nichts geschieht automatisch außer Anlegen und Hochzählen – jeder Statuswechsel
kommt von Herbert (Karte) oder aus Claude Code (Skill ticket).
"""
PREFIX = "HT"
STATUS = ("neu", "angenommen", "in_arbeit", "geloest", "geschlossen", "verworfen")
OFFEN = ("neu", "angenommen", "in_arbeit")
FERTIG = ("geloest", "geschlossen")
NOTIZEN_MAX = 50


def leer():
    return {"next": 1, "tickets": []}


def finde(store, nr):
    nr = str(nr).upper()
    return next((t for t in store["tickets"] if t["nr"] == nr), None)


def _neu(store, jetzt, **felder):
    t = {"nr": "%s-%04d" % (PREFIX, store["next"]), "status": "neu", "angelegt": jetzt, "zuletzt": jetzt, "anzahl": 1,
         "tage": {}, "wieder": 0, "dx": "", "commit": "", "version": "", "notizen": [],
         "verlauf": [{"ts": jetzt, "status": "neu", "wer": felder.get("wer", "")}]}
    t.update(felder)
    store["next"] += 1
    store["tickets"].append(t)
    return t


def melden(store, text, jetzt, wer="", stichworte=None, meta=None, beweise=None):
    """Meldung von Herbert: immer ein neues Ticket."""
    text = str(text or "").strip()
    if not text and not stichworte:
        raise ValueError("leere Meldung")
    titel = "Meldung: „%s“" % (text or ", ".join(stichworte))[:120]
    return _neu(store, jetzt, quelle="meldung", regel="", signatur="", schwere="hinweis", titel=titel, text=text, wer=wer,
                stichworte=list(stichworte or []), meta=meta or {}, beweise=beweise or {})


def aufnehmen(store, funde, tag, jetzt, beweise_fn=None):
    """Funde eines Tages aufnehmen. Liefert {"neu": [nr…], "wieder": [nr…], "gezaehlt": [nr…]}.
    Wiederholtes Auswerten desselben Tages zählt nicht doppelt (je Tag gilt die höchste gesehene Anzahl)."""
    out = {"neu": [], "wieder": [], "gezaehlt": []}
    gruppen = {}
    for f in funde:
        if f.get("schwere") == "info":
            continue
        g = gruppen.setdefault(f["signatur"], {"f": f, "n": 0, "bis": f["bis"]})
        g["n"] += int(f.get("anzahl", 1)); g["bis"] = max(g["bis"], f["bis"])
    for sig, g in gruppen.items():
        f = g["f"]
        t = next((x for x in store["tickets"] if x.get("signatur") == sig), None)
        if t is None:
            t = _neu(store, jetzt, quelle="auswertung", regel=f["regel"], signatur=sig, schwere=f["schwere"], titel=f["titel"],
                     text=f["text"], beweise=beweise_fn(f) if beweise_fn else {})
            t["anzahl"] = 0
            out["neu"].append(t["nr"])
        vorher = t["tage"].get(tag, 0)
        if g["n"] > vorher:
            t["tage"][tag] = g["n"]
            t["anzahl"] = sum(t["tage"].values())
            if t["nr"] not in out["neu"]:
                out["gezaehlt"].append(t["nr"])
        t["zuletzt"] = max(t["zuletzt"], g["bis"]) if t["nr"] not in out["neu"] else g["bis"]
        if t["status"] in FERTIG and g["bis"] > t.get("geloest_am", ""):
            t["status"] = "neu"; t["wieder"] += 1
            t["verlauf"].append({"ts": jetzt, "status": "neu", "wer": "", "text": "wieder aufgetreten nach „gelöst“ (%s)" % g["bis"]})
            if beweise_fn:
                t["beweise_wieder"] = beweise_fn(f)
            out["wieder"].append(t["nr"])
    return out


def setze_status(store, nr, status, jetzt, wer="", dx="", commit="", version="", grund=""):
    t = finde(store, nr)
    if t is None:
        raise ValueError("Ticket %s gibt es nicht" % nr)
    if status not in STATUS:
        raise ValueError("Status „%s“ gibt es nicht (%s)" % (status, ", ".join(STATUS)))
    if status == "verworfen" and not str(grund).strip():
        raise ValueError("Verwerfen braucht einen Grund")
    if status == "angenommen" and not (dx or t["dx"]):
        raise ValueError("„angenommen“ braucht die ClickUp-Aufgabe (dx)")
    if status == "geloest" and not (commit or t["commit"]):
        raise ValueError("„gelöst“ braucht den Commit")
    t["status"] = status
    for k, v in (("dx", dx), ("commit", commit), ("version", version)):
        if v:
            t[k] = v
    if status == "geloest":
        t["geloest_am"] = jetzt
    e = {"ts": jetzt, "status": status, "wer": wer}
    if grund:
        e["text"] = str(grund)[:300]
    t["verlauf"].append(e)
    return t


def notiz(store, nr, text, jetzt, wer=""):
    t = finde(store, nr)
    if t is None:
        raise ValueError("Ticket %s gibt es nicht" % nr)
    if not str(text).strip():
        raise ValueError("leere Notiz")
    t["notizen"] = (t["notizen"] + [{"ts": jetzt, "wer": wer, "text": str(text)[:1000]}])[-NOTIZEN_MAX:]
    return t


def liste(store, welche="offen"):
    """Kurzform für Karte und Skill, neueste zuerst; welche = offen | geloest | alle."""
    ts = [t for t in store["tickets"] if welche == "alle" or (welche == "offen") == (t["status"] in OFFEN)]
    kurz = ("nr", "status", "schwere", "quelle", "regel", "titel", "anzahl", "angelegt", "zuletzt", "wieder", "dx", "commit", "version")
    return [{k: t.get(k) for k in kurz} for t in sorted(ts, key=lambda t: t["nr"], reverse=True)]


def zaehler(store):
    z = {"neu": 0, "in_arbeit": 0, "geloest": 0}
    for t in store["tickets"]:
        if t["status"] == "neu":
            z["neu"] += 1
        elif t["status"] in ("angenommen", "in_arbeit"):
            z["in_arbeit"] += 1
        elif t["status"] in FERTIG:
            z["geloest"] += 1
    return z


def als_text(t, projekt=""):
    """Ticket als Text für Claude Code (Skill ticket) und den Knopf „Kopieren“."""
    b = t.get("beweise") or {}
    teile = ["TICKET   %s · %s · angelegt %s · %d× aufgetreten%s" % (t["nr"], t["status"], t["angelegt"], t["anzahl"], " · %d× wieder aufgetreten" % t["wieder"] if t["wieder"] else "")]
    if projekt:
        teile.append("PROJEKT  " + projekt)
    teile.append("Lies zuerst: CLAUDE.md, docs/HANDOFF.md Abschnitt 3e, heidi/CLAUDE.md „Diagnose-Protokoll“.")
    quelle = "Meldung von %s" % (t.get("wer") or "Herbert") if t["quelle"] == "meldung" else "automatisch erkannt, Regel %s" % t["regel"]
    teile.append("\nBEFUND  (%s)\n%s\n%s" % (quelle, t["titel"], t.get("text") or ""))
    if t.get("meta"):
        teile.append("Karte: " + ", ".join("%s=%s" % kv for kv in t["meta"].items()))
    if b.get("zeitleiste"):
        teile.append("\nZEITLEISTE  (Auszug %s)\n%s" % (b.get("fenster", ""), "\n".join(b["zeitleiste"])))
    if b.get("debug"):
        teile.append("\nROHMELDUNGEN DER INTEGRATION\n" + "\n".join(b["debug"]))
    if b.get("suchen"):
        teile.append("\nWO SUCHEN\n" + "\n".join("- " + s for s in b["suchen"]))
    if t["notizen"]:
        teile.append("\nNOTIZEN\n" + "\n".join("%s %s: %s" % (n["ts"], n["wer"], n["text"]) for n in t["notizen"]))
    if t["dx"] or t["commit"]:
        teile.append("\nBEARBEITUNG  ClickUp %s · Commit %s · Version %s" % (t["dx"] or "–", t["commit"] or "–", t["version"] or "–"))
    teile.append("\nABLAUF  (Skill ticket – einzeln, mit Herbert, nichts automatisch)\n1 Befund erklären · 2 echter Fehler? (Auswahlfrage) · 3 Ursache · "
                 "4 ClickUp-Aufgabe (tracker) · 5 Fix mit Test\n6 einspielen · 7 Ticket „gelöst“ (Commit, Version) · 8 Herbert prüft → „geschlossen“")
    return "\n".join(teile)
