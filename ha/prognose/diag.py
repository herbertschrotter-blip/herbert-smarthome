#!/usr/bin/env python3
"""Heidi – Diagnose-Protokoll (Bauplan F.1, DX-068): wer hat wann was ausgelöst, was meldete der Roboter.

Aufrufe (aus Home Assistant per shell_command):
  diag.py log '<base64>'   eine JSON-Zeile anhängen (Automation heidi_diagnose_protokoll; base64, damit
                           Anführungszeichen in Texten den Aufruf nicht zerlegen)
  diag.py debuglog         neue Zeilen der Dreame-Integration aus dem HA-Log in die Tagesdatei übernehmen
                           (Automation heidi_diagnose_debuglog, jede Minute; HA-Log über die Supervisor-Schnittstelle,
                           eine Datei home-assistant.log gibt es unter HA OS nicht mehr)
  diag.py status           JSON mit Dateien, Größen und letzter Zeile (zum Prüfen)

Dateien: /config/prognose/diag/heidi_diag-JJJJ-MM-TT.jsonl  (Schicht 1: Zustände, Dienste, Automationen, Skripte)
         /config/prognose/diag/dreame_debug-JJJJ-MM-TT.log   (Schicht 2: Rohmeldungen der Integration)
Beide mit Ortszeit und Millisekunden → per Zeitstempel zusammenführbar (tools/diag.js). Tagesdateien älter als
KEEP_DAYS werden gelöscht. Nie ins Repo. runlog.csv (Lernwerte) bleibt davon getrennt.

Zeile Schicht 1 (v = Formatversion): ts, v, art (zustand|dienst|automation|skript), quelle
(benutzer|automation|system|extern, siehe classify), wer (Name zur user_id), durch (Name der Automation/des Skripts),
ctx, user_id, parent_id; dazu je Art: ent, alt, neu, attr {name: [alt, neu]} · dienst, daten · ent, name, ausloeser.
Schicht 3 (PD-017): art anzeige = die Karte meldet, was sie zeigt (Ereignis dreame_x60_anzeige): seite, version,
client (Browserfenster), geaendert [Namen], werte {kopf, schritt, hinweis, akku, fortschritt, zustand}.
"""
import base64, json, os, re, sys, urllib.request
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(BASE, "diag")
STATE = os.path.join(DIR, "debuglog_state.json")
CTX = os.path.join(DIR, "ctx_cache.json")
CTX_KEEP = 300       # so viele Automations-/Skriptläufe merkt sich die Zuordnung Kontext → Name
KEEP_DAYS = {"heidi_diag": 30, "dreame_debug": 14}  # Aufbewahrung der Tagesdateien (Debuglog ≈ 2 MB je Tag im Leerlauf)
LOG_LINES = 3000     # Fenster je Abruf des HA-Logs (jede Minute); reicht es nicht, steht eine Lücken-Marke in der Datei
LOG_FILTER = "dreame_vacuum"
DAY_FILE = re.compile(r"^(heidi_diag|dreame_debug)-(\d{4}-\d{2}-\d{2})\.(jsonl|log)$")
LOG_HEAD = re.compile(r"^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}\.\d{3}) (\w+) \(([^)]*)\) \[([^\]]+)\] ")
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
    with open(day_file("heidi_diag", str(d["ts"])[:10], "jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(d, ensure_ascii=False, separators=(",", ":")) + "\n")


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
    cmds = {"log": cmd_log, "debuglog": cmd_debuglog, "status": cmd_status}
    if len(sys.argv) < 2 or sys.argv[1] not in cmds:
        print("Aufruf: diag.py log <base64> | debuglog | status"); sys.exit(1)
    cmds[sys.argv[1]](sys.argv[2:])
