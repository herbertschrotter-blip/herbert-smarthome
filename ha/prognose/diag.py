#!/usr/bin/env python3
"""Heidi – Diagnose-Protokoll (Bauplan F.1, DX-068): wer hat wann was ausgelöst, was meldete der Roboter.

Aufrufe (aus Home Assistant per shell_command):
  diag.py log '<base64>'   eine JSON-Zeile anhängen (Automation heidi_diagnose_protokoll; base64, damit
                           Anführungszeichen in Texten den Aufruf nicht zerlegen)
  diag.py debuglog         neue Zeilen der Dreame-Integration aus dem HA-Log in die Tagesdatei übernehmen
                           (Automation heidi_diagnose_debuglog, jede Minute; HA-Log über die Supervisor-Schnittstelle,
                           eine Datei home-assistant.log gibt es unter HA OS nicht mehr)
  diag.py status           JSON mit Dateien, Größen und letzter Zeile (zum Prüfen)
  diag.py tail <base64>    letzte Zeilen für die Seite Dev: {"n": 200, "vor": "<ts>"} → {"zeilen": […], "aelter": bool}
  diag.py auswertung       Regeln (diag_regeln.py) über gestern + heute, Funde von heute → Tickets (diag_tickets.py);
                           Automation heidi_diagnose_auswertung alle 10 min; Ausgabe JSON (Funde, Tickets, Zähler, Starts)
  diag.py ticket <base64>  einziger Schreibweg der Tickets: {"cmd": liste|zeige|text|status|notiz|verwerfen, …}

Dateien: /config/prognose/diag/heidi_diag-JJJJ-MM-TT.jsonl  (Schicht 1: Zustände, Dienste, Automationen, Skripte)
         /config/prognose/diag/dreame_debug-JJJJ-MM-TT.log   (Schicht 2: Rohmeldungen der Integration)
         /config/prognose/diag/tickets.json                 (Tickets HT-NNNN, werden nie automatisch gelöscht)
Beide mit Ortszeit und Millisekunden → per Zeitstempel zusammenführbar (tools/diag.js). Tagesdateien älter als
KEEP_DAYS werden gelöscht. Nie ins Repo. runlog.csv (Lernwerte) bleibt davon getrennt.

Zeile Schicht 1 (v = Formatversion): ts, v, art (zustand|dienst|automation|skript), quelle
(benutzer|automation|system|extern, siehe classify), wer (Name zur user_id), durch (Name der Automation/des Skripts),
ctx, user_id, parent_id; dazu je Art: ent, alt, neu, attr {name: [alt, neu]} · dienst, daten · ent, name, ausloeser.
Schicht 3 (PD-017): art anzeige = die Karte meldet, was sie zeigt (Ereignis dreame_x60_anzeige): seite, version,
client (Browserfenster), geaendert [Namen], werte {kopf, schritt, hinweis, akku, fortschritt, zustand}.
"""
import base64, json, os, re, sys, time, urllib.request
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import diag_regeln  # noqa: E402
import diag_tickets  # noqa: E402

BASE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(BASE, "diag")
STATE = os.path.join(DIR, "debuglog_state.json")
CTX = os.path.join(DIR, "ctx_cache.json")
TICKETS = os.path.join(DIR, "tickets.json")
LOCK = os.path.join(DIR, "tickets.lock")
PROJEKT = "herbert-smarthome · Branch dreame_x60 · Roboter vacuum.heidi"
BEWEIS_S = 60         # Auszug der Zeitleiste: so viele Sekunden vor und nach dem Fund
BEWEIS_ZEILEN = 60    # höchstens so viele Zeilen je Auszug
TAIL_MAX = 500
CTX_KEEP = 300       # so viele Automations-/Skriptläufe merkt sich die Zuordnung Kontext → Name
KEEP_DAYS = {"heidi_diag": 30, "dreame_debug": 14}  # Aufbewahrung der Tagesdateien (Debuglog ≈ 2 MB je Tag im Leerlauf)
LOG_LINES = 3000     # Fenster je Abruf des HA-Logs (jede Minute); reicht es nicht, steht eine Lücken-Marke in der Datei
LOG_FILTER = "dreame_vacuum"
DAY_FILE = re.compile(r"^(heidi_diag|dreame_debug)-(\d{4}-\d{2}-\d{2})\.(jsonl|log)$")
LOG_HEAD = re.compile(r"^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}\.\d{3}) (\w+) \(((?:[^()]|\([^)]*\))*)\) \[([^\]]+)\] ")  # Thread-Namen mit Klammern: (Thread-5 (_client_task))
ANSI = re.compile(r"\x1b\[[0-9;]*m")
SIGNED = re.compile(r"\?Expires=[^\s'\"]+")  # signierte Cloud-Adressen (Schlüssel-ID, Signatur) gehören nicht in die Datei


def day_file(prefix, day, ext):
    """Pfad der Tagesdatei; legt den Ordner an und räumt beim ersten Schreiben eines Tages alte Dateien weg."""
    os.makedirs(DIR, exist_ok=True)
    path = os.path.join(DIR, "%s-%s.%s" % (prefix, day, ext))
    if not os.path.exists(path):
        prune()
    return path


def prune(today=None):
    today = today or datetime.now()
    for name in os.listdir(DIR):
        m = DAY_FILE.match(name)
        if m and m.group(2) < (today - timedelta(days=KEEP_DAYS[m.group(1)])).strftime("%Y-%m-%d"):
            os.remove(os.path.join(DIR, name))


def cmd_log(args):
    """Eine Zeile anhängen. args[0] = base64 eines JSON-Objekts (siehe Kopf)."""
    try:
        d = json.loads(base64.b64decode(args[0]).decode("utf-8"))
        if not isinstance(d, dict):
            raise ValueError("kein Objekt")
    except Exception as e:
        print("Zeile ungültig:", e); sys.exit(1)
    d.setdefault("ts", datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")[:23])
    d.setdefault("v", 1)
    if isinstance(d.get("attr"), list):  # Template liefert [[name, alt, neu], …]
        d["attr"] = {str(a[0]): [a[1], a[2]] for a in d["attr"] if isinstance(a, list) and len(a) == 3}
    os.makedirs(DIR, exist_ok=True)
    try:
        with open(CTX, encoding="utf-8") as f:
            cache = json.load(f)
    except Exception:
        cache = {}
    if classify(d, cache):
        with open(CTX, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False)
    if d.get("art") == "meldung":  # „Fehler melden“ in der Karte → Ticket; die Nummer steht dann auch in der Protokollzeile
        try:
            with tickets() as store:
                werte = d.get("werte") or {}
                meta = {"seite": d.get("seite"), "version": d.get("version"), "client": d.get("client")}
                meta.update({"zeigt_" + k: v for k, v in werte.items()})
                t = diag_tickets.melden(store, d.get("text"), d["ts"], wer=d.get("wer") or "", stichworte=d.get("stichworte"),
                                        meta=meta, beweise=beweise({"von": d["ts"], "bis": d["ts"], "regel": "B"}))
            d["ticket"] = t["nr"]
        except ValueError as e:
            d["ticket_fehler"] = str(e)
    with open(day_file("heidi_diag", str(d["ts"])[:10], "jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(d, ensure_ascii=False, separators=(",", ":")) + "\n")


class tickets:
    """Tickets laden, ändern, speichern – unter einer Sperrdatei, weil Karte, Auswertung und Claude Code gleichzeitig kommen können."""

    def __enter__(self):
        os.makedirs(DIR, exist_ok=True)
        for _ in range(100):
            try:
                self.fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY); break
            except FileExistsError:
                try:
                    if time.time() - os.path.getmtime(LOCK) > 30:  # liegengebliebene Sperre
                        os.remove(LOCK)
                except OSError:
                    pass
                time.sleep(0.05)
        else:
            raise RuntimeError("Tickets sind gesperrt")
        try:
            with open(TICKETS, encoding="utf-8") as f:
                self.store = json.load(f)
        except FileNotFoundError:
            self.store = diag_tickets.leer()
        return self.store

    def __exit__(self, typ, *_):
        try:
            if typ is None:
                tmp = TICKETS + ".tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(self.store, f, ensure_ascii=False, indent=1)
                os.replace(tmp, TICKETS)
        finally:
            os.close(self.fd); os.remove(LOCK)


def read_day(day):
    """(Protokollzeilen, Debuglog-Zeilen) eines Tages; fehlende Dateien = leer."""
    rows, dbg = [], []
    try:
        with open(os.path.join(DIR, "heidi_diag-%s.jsonl" % day), encoding="utf-8") as f:
            for line in f:
                try:
                    rows.append(json.loads(line))
                except ValueError:
                    pass
    except FileNotFoundError:
        pass
    try:
        with open(os.path.join(DIR, "dreame_debug-%s.log" % day), encoding="utf-8") as f:
            dbg = f.read().splitlines()
    except FileNotFoundError:
        pass
    return rows, dbg


def zeile_text(r):
    """Eine Protokollzeile lesbar (wie tools/diag.js)."""
    q = r.get("quelle", "")
    wer = "Benutzer %s" % (r.get("wer") or "") if q == "benutzer" else ("Automation %s" % r.get("durch", "")).strip() if q == "automation" else q
    art = r.get("art")
    if art == "zustand":
        attr = "; ".join("%s: %s → %s" % (k, v[0], v[1]) for k, v in (r.get("attr") or {}).items())
        tx = "%s  %s%s" % (r.get("ent"), "" if r.get("alt") == r.get("neu") else "%s → %s" % (r.get("alt"), r.get("neu")), "  {%s}" % attr if attr else "")
    elif art == "dienst":
        tx = "Dienst %s %s" % (r.get("dienst"), json.dumps(r.get("daten") or {}, ensure_ascii=False))
    elif art == "anzeige":
        w = r.get("werte") or {}
        tx = "Karte [%s · %s] zeigt %s" % (r.get("seite"), r.get("client"), "; ".join("%s: %s" % (k, w.get(k)) for k in (r.get("geaendert") or [])))
    elif art == "meldung":
        tx = "MELDUNG %s „%s“" % (r.get("ticket", ""), r.get("text", ""))
    else:
        tx = "%s %s%s" % (str(art).upper(), r.get("name") or r.get("ent"), " (%s)" % r["ausloeser"] if r.get("ausloeser") else "")
    return ("%s  %-26s  %s" % (str(r.get("ts"))[11:23], wer[:26], tx))[:400]


def beweise(fund, rows=None, dbg=None):
    """Gesicherter Auszug zu einem Fund: Zeitleiste ± BEWEIS_S, Rohmeldungen im selben Fenster, „Wo suchen“."""
    day = str(fund["von"])[:10]
    if rows is None:
        rows, dbg = read_day(day)
    if (diag_regeln.zeit(fund["bis"]) - diag_regeln.zeit(fund["von"])).total_seconds() > 10 * BEWEIS_S:
        fund = dict(fund, von=fund["bis"])  # gezählte Funde über Stunden (T4): Auszug um das letzte Vorkommen
        day = str(fund["von"])[:10]
    von = (diag_regeln.zeit(fund["von"]) - timedelta(seconds=BEWEIS_S)).isoformat(timespec="milliseconds")
    bis = (diag_regeln.zeit(fund["bis"]) + timedelta(seconds=BEWEIS_S)).isoformat(timespec="milliseconds")
    zl = [zeile_text(r) for r in rows if von <= str(r.get("ts")) <= bis]
    if len(zl) > BEWEIS_ZEILEN:
        zl = zl[:BEWEIS_ZEILEN // 2] + ["… %d Zeilen ausgelassen …" % (len(zl) - BEWEIS_ZEILEN)] + zl[-(BEWEIS_ZEILEN // 2):]
    dl, ts = [], ""
    for line in dbg or []:
        m = LOG_HEAD.match(line)
        if m:
            ts = m.group(1) + "T" + m.group(2)
        if ts and von <= ts <= bis and not re.search(r"Device update: \d+$", line):
            dl.append(line[:300])
    return {"fenster": "%s – %s" % (von[11:19], bis[11:19]), "zeitleiste": zl, "debug": dl[:BEWEIS_ZEILEN],
            "suchen": diag_regeln.SUCHEN.get(str(fund.get("regel", "B"))[:1], [])
            + ["Zeitfenster nachlesen: node tools\\diag.js --tag %s --von %s --bis %s --debug" % (day, von[11:16], bis[11:16])]}


def cmd_tail(args):
    try:
        q = json.loads(base64.b64decode(args[0]).decode("utf-8")) if args else {}
    except Exception:
        q = {}
    n, vor = max(1, min(int(q.get("n", 200)), TAIL_MAX)), str(q.get("vor") or "9999")
    out, day = [], datetime.now()
    for _ in range(KEEP_DAYS["heidi_diag"]):
        rows, _dbg = read_day(day.strftime("%Y-%m-%d"))
        out = [r for r in rows if str(r.get("ts")) < vor] + out
        if len(out) >= n + 1:
            break
        day -= timedelta(days=1)
    heute, _dbg = read_day(datetime.now().strftime("%Y-%m-%d"))  # Starts aus dem ganzen Tag, nicht nur aus dem Auszug
    zeilen = [{k: v for k, v in r.items() if k not in ("stand", "vac_attr")} for r in out[-n:]]  # Schnappschuss der Zeile „neustart“ braucht die Karte nicht
    print(json.dumps({"zeilen": zeilen, "aelter": len(out) > n, "starts": starts(heute)}, ensure_ascii=False))


def starts(rows):
    """Starts des Tages mit Quelle (gleiche Regel wie tools/diag.js und T1)."""
    out, ende = [], None
    for i, r in enumerate(rows):
        if r.get("art") != "zustand" or not str(r.get("ent", "")).startswith("vacuum.") or r.get("alt") == r.get("neu"):
            continue
        t = diag_regeln.zeit(r["ts"])
        if r.get("alt") in diag_regeln.RUN and r.get("neu") not in diag_regeln.RUN:
            ende = t
        if r.get("neu") != "cleaning" or r.get("alt") in diag_regeln.RUN:
            continue
        if ende and (t - ende).total_seconds() <= diag_regeln.GAP_S:  # Startfolge cleaning→docked→idle→cleaning: derselbe Lauf
            continue
        ruf = next((c for c in reversed(rows[:i]) if c.get("art") == "dienst" and diag_regeln.START_DIENSTE.match(c.get("dienst", ""))
                    and (t - diag_regeln.zeit(c["ts"])).total_seconds() <= diag_regeln.START_FENSTER_S), None)
        q = r if r.get("quelle") != "extern" or not ruf else ruf
        out.append({"ts": r["ts"], "quelle": q.get("quelle"), "wer": q.get("wer") or q.get("durch") or "", "dienst": (ruf or {}).get("dienst", "")})
    return out


def cmd_auswertung(args):
    now = datetime.now()
    heute, gestern = now.strftime("%Y-%m-%d"), (now - timedelta(days=1)).strftime("%Y-%m-%d")
    rows_g, _ = read_day(gestern)
    rows_h, dbg_h = read_day(heute)
    funde = diag_regeln.auswerten(rows_g + rows_h, dbg_h, jetzt=now, ab=heute)
    with tickets() as store:
        res = diag_tickets.aufnehmen(store, funde, heute, now.strftime("%Y-%m-%dT%H:%M:%S"), lambda f: beweise(f, rows_g + rows_h, dbg_h))
        zahl = diag_tickets.zaehler(store)
    print(json.dumps({"funde": len(funde), "info": [f for f in funde if f["schwere"] == "info"][-10:], "tickets": res, "zaehler": zahl,
                      "starts": starts(rows_h), "zeilen_heute": len(rows_h)}, ensure_ascii=False))


def cmd_ticket(args):
    try:
        q = json.loads(base64.b64decode(args[0]).decode("utf-8")) if args else {}
        cmd, jetzt = q.get("cmd", "liste"), datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        with tickets() as store:
            if cmd == "liste":
                out = {"tickets": diag_tickets.liste(store, q.get("welche", "offen")), "zaehler": diag_tickets.zaehler(store)}
            elif cmd in ("zeige", "text"):
                t = diag_tickets.finde(store, q.get("nr"))
                if t is None:
                    raise ValueError("Ticket %s gibt es nicht" % q.get("nr"))
                out = {"ticket": t, "text": diag_tickets.als_text(t, PROJEKT)}
            elif cmd == "status":
                out = {"ticket": diag_tickets.setze_status(store, q.get("nr"), q.get("status"), jetzt, q.get("wer", ""), q.get("dx", ""),
                                                           q.get("commit", ""), q.get("version", ""), q.get("grund", ""))}
            elif cmd == "verwerfen":
                out = {"ticket": diag_tickets.setze_status(store, q.get("nr"), "verworfen", jetzt, q.get("wer", ""), grund=q.get("grund", ""))}
            elif cmd == "notiz":
                out = {"ticket": diag_tickets.notiz(store, q.get("nr"), q.get("text"), jetzt, q.get("wer", ""))}
            else:
                raise ValueError("Befehl „%s“ gibt es nicht" % cmd)
        print(json.dumps(dict(out, ok=True), ensure_ascii=False))
    except (ValueError, RuntimeError) as e:
        print(json.dumps({"ok": False, "fehler": str(e)}, ensure_ascii=False))


def classify(d, cache):
    """Setzt quelle (+ durch). cache = {Kontext-ID: Name} der letzten Automations-/Skriptläufe; True = cache geändert.

    benutzer   = Bedienung in HA (user_id gesetzt; wer = Name)
    automation = Kontext oder Eltern-Kontext gehört zu einem protokollierten Automations-/Skriptlauf (durch = Name);
                 zeitgesteuerte Automationen haben keinen Eltern-Kontext, deshalb der Abgleich über die Kontext-ID
    system     = Automation/Skript/Dienst ohne Benutzer und ohne bekannten Lauf (Zeit, HA-Start)
    extern     = Zustandsänderung ohne HA-Auslöser: Dreame-App, Knopf am Roboter, App-Zeitplan, Roboter selbst
    """
    changed = False
    ctx, parent = d.get("ctx"), d.get("parent_id")
    durch = cache.get(ctx) or cache.get(parent)
    if d.get("art") in ("automation", "skript") and ctx:
        cache[ctx] = d.get("name") or d.get("ent") or ""
        for k in list(cache)[:-CTX_KEEP]:
            del cache[k]
        changed = True
    lauf = d.get("art") in ("automation", "skript")  # ihr Eltern-Kontext ist meist nur der auslösende Zustand
    if d.get("user_id"):
        d["quelle"] = "benutzer"
    elif durch or (parent and not lauf):
        d["quelle"] = "automation"
    else:
        d["quelle"] = "extern" if d.get("art") == "zustand" else "system"
    if durch:
        d["durch"] = durch
    return changed


def fetch_log(lines):
    req = urllib.request.Request("http://supervisor/core/logs?lines=%d" % lines,
                                 headers={"Authorization": "Bearer " + os.environ.get("SUPERVISOR_TOKEN", "")})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def parse_records(text):
    """HA-Log → Liste (ts 'JJJJ-MM-TT HH:MM:SS.mmm', logger, text); Folgezeilen (Traceback) hängen am Kopf."""
    recs = []
    for line in SIGNED.sub("?…", ANSI.sub("", text)).splitlines():
        m = LOG_HEAD.match(line)
        if m:
            recs.append([m.group(1) + " " + m.group(2), m.group(5), line])
        elif recs and line.strip():
            recs[-1][2] += "\n" + line
    return recs


def new_records(recs, last_ts, last_texts, window_full):
    """Auswahl der noch nicht geschriebenen Zeilen der Integration + Hinweis, ob das Fenster zu klein war."""
    gap = bool(last_ts and window_full and recs and recs[0][0] > last_ts)
    out = [r for r in recs if LOG_FILTER in r[1]
           and (not last_ts or r[0] > last_ts or (r[0] == last_ts and r[2] not in last_texts))]
    return out, gap


def cmd_debuglog(args):
    try:
        text = fetch_log(LOG_LINES)
    except Exception as e:
        print("HA-Log nicht lesbar:", e); sys.exit(1)
    os.makedirs(DIR, exist_ok=True)
    try:
        with open(STATE, encoding="utf-8") as f:
            st = json.load(f)
    except Exception:
        st = {}
    raw_lines = text.count("\n")
    recs = parse_records(text)
    out, gap = new_records(recs, st.get("ts", ""), st.get("texts", []), raw_lines >= LOG_LINES - 5)
    if gap:
        with open(day_file("dreame_debug", recs[0][0][:10], "log"), "a", encoding="utf-8") as f:
            f.write("# Lücke möglich: Fenster von %d Zeilen reicht nicht bis %s zurück\n" % (LOG_LINES, st.get("ts")))
    for r in out:
        with open(day_file("dreame_debug", r[0][:10], "log"), "a", encoding="utf-8") as f:
            f.write(r[2] + "\n")
    if out:
        last = out[-1][0]
        texts = [r[2] for r in out if r[0] == last]
        if last == st.get("ts"):
            texts = st.get("texts", []) + texts
        with open(STATE, "w", encoding="utf-8") as f:
            json.dump({"ts": last, "texts": texts}, f, ensure_ascii=False)
    print(json.dumps({"neu": len(out), "luecke": gap, "fenster": raw_lines}))


def cmd_status(args):
    files = []
    if os.path.isdir(DIR):
        for name in sorted(os.listdir(DIR)):
            if DAY_FILE.match(name):
                files.append({"datei": name, "bytes": os.path.getsize(os.path.join(DIR, name))})
    last = ""
    today = os.path.join(DIR, "heidi_diag-%s.jsonl" % datetime.now().strftime("%Y-%m-%d"))
    if os.path.exists(today):
        with open(today, encoding="utf-8") as f:
            rows = f.read().splitlines()
        last = rows[-1] if rows else ""
        files.append({"zeilen_heute": len(rows)})
    print(json.dumps({"dateien": files, "letzte": last, "aufbewahrung_tage": KEEP_DAYS}, ensure_ascii=False))


if __name__ == "__main__":
    cmds = {"log": cmd_log, "debuglog": cmd_debuglog, "status": cmd_status, "tail": cmd_tail, "auswertung": cmd_auswertung, "ticket": cmd_ticket}
    if len(sys.argv) < 2 or sys.argv[1] not in cmds:
        print("Aufruf: diag.py log <base64> | debuglog | status | tail <base64> | auswertung | ticket <base64>"); sys.exit(1)
    cmds[sys.argv[1]](sys.argv[2:])
