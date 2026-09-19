#!/usr/bin/env python3
"""Netzdiagnose – liest Ereignisprotokoll und Gerätetabelle der FRITZ!Box und sucht nach Adress-Problemen.

Aufrufe (aus Home Assistant per command_line-Sensor, siehe packages/netzwerk.yaml):
  fritz_diag.py collect        alles abfragen, Dateien unter data/ schreiben, Kurzstatus als JSON ausgeben (jede Minute)
  fritz_diag.py show <name>    fertige Ansicht für eine Dashboard-Karte ausgeben: journal | fritzlog | geraete

Was geprüft wird:
  • Ereignisprotokoll der Box (TR-064 DeviceInfo) → dauerhaft in data/fritzlog.jsonl (die Box selbst überschreibt alte Zeilen)
  • Gerätetabelle der Box (TR-064 Hosts): doppelte IP-Adressen, fest eingestellte Adressen im DHCP-Bereich, Geräte
    außerhalb des Heimnetzes (Zeichen für einen zweiten DHCP-Server), durch ein Zugangsprofil gesperrte Geräte
  • Änderungen zwischen zwei Abfragen (neues Gerät, IP-Wechsel, online/offline, LAN↔WLAN) → data/journal.jsonl
  • DHCP-Test alle 10 min: eine DHCP-Anfrage ins Netz schicken und zählen, wer antwortet (mehr als die Box = Störquelle)
  • Verbindung des Pi selbst: FRITZ!Box erreichbar? Internet erreichbar? Namensauflösung? Hardware-Adresse der Box gleich?

Zugangsdaten: aus secrets.yaml (netzdiag_fritz_host / _user / _password), sonst aus dem vorhandenen Eintrag der
FRITZ!Box-Tools-Integration in .storage/core.config_entries. Das Kennwort verlässt den Pi nur Richtung FRITZ!Box
(Digest-Anmeldung, nie im Klartext) und wird nie in eine Datei oder Ausgabe geschrieben.

Nur Standardbibliothek. Dateien unter data/ gehören nie ins Repo (MAC-Adressen, Gerätenamen).
"""
import ipaddress, json, os, re, socket, ssl, struct, sys, time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.environ.get("NETZDIAG_CONFIG") or os.path.dirname(BASE)   # /config (Umgebungsvariablen nur für Tests am PC)
DATA = os.environ.get("NETZDIAG_DATA") or os.path.join(BASE, "data")
STATE = os.path.join(DATA, "state.json")
FRITZLOG = os.path.join(DATA, "fritzlog.jsonl")
JOURNAL = os.path.join(DATA, "journal.jsonl")
MAX_BYTES = 4_000_000    # fritzlog/journal: darüber wird auf die neuere Hälfte gekürzt
SLOW_S = 600             # DHCP-Test, Adressquelle je Gerät, DHCP-Bereich: alle 10 min
VIEW_LOG = 25            # Zeilen je Protokoll-Karte
VIEW_JOURNAL = 40
SEEN_KEEP = 1500         # so viele Protokollzeilen der Box merkt sich der Abgleich (Box hält ~400)
PROBE_MAC = "02:4e:45:54:5a:44"   # erfundene Adresse für den DHCP-Test (lokal verwaltet, „NETZD“)
TIMEOUT = 8

SERVICES = {
    "deviceinfo": ("urn:dslforum-org:service:DeviceInfo:1", "/upnp/control/deviceinfo"),
    "hosts": ("urn:dslforum-org:service:Hosts:1", "/upnp/control/hosts"),
    "lan": ("urn:dslforum-org:service:LANHostConfigManagement:1", "/upnp/control/lanhostconfigmgm"),
}
# Gruppen im Ereignisprotokoll der Box (wie der Filter in der Box-Oberfläche)
GRUPPEN = {"1": "system", "2": "internet", "3": "telefon", "4": "wlan", "5": "usb",
           "sys": "system", "net": "internet", "fon": "telefon", "wlan": "wlan", "usb": "usb"}
WORTE = (("wlan", ("wlan", "wi-fi", "funknetz")),
         ("internet", ("internet", "dsl", "mobilfunk", "pppoe", "ip-adresse", "ipv6", "dns", "anbieter", "lte", "5g")),
         ("telefon", ("telefon", "anruf", "rufnummer", "dect")))


# ───────────────────────── Hilfen ─────────────────────────
def now():
    return datetime.now()


def ts(dt=None):
    return (dt or now()).strftime("%Y-%m-%d %H:%M:%S")


def read_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def write_json(path, obj):
    """Erst unter Hilfsnamen schreiben, dann umbenennen – ein Sensor liest so nie eine halbe Datei."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False)
    os.replace(tmp, path)


def append_lines(path, rows):
    if not rows:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    if os.path.getsize(path) > MAX_BYTES:
        with open(path, encoding="utf-8") as f:
            lines = f.readlines()
        with open(path + ".tmp", "w", encoding="utf-8") as f:
            f.writelines(lines[len(lines) // 2:])
        os.replace(path + ".tmp", path)


def tail_lines(path, n):
    """Die letzten n JSON-Zeilen einer Datei (liest höchstens die letzten ~400 kB)."""
    try:
        with open(path, "rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            f.seek(max(0, size - 400_000))
            chunk = f.read().decode("utf-8", "replace")
    except OSError:
        return []
    out = []
    for line in chunk.splitlines()[-n:]:
        try:
            out.append(json.loads(line))
        except ValueError:
            pass   # angeschnittene erste Zeile
    return out


def clean(text, limit=300):
    """Text für eine Markdown-Tabelle: keine Zeilenumbrüche, keine senkrechten Striche."""
    text = re.sub(r"\s+", " ", str(text or "")).replace("|", "/").strip()
    return text if len(text) <= limit else text[:limit - 1] + "…"


# ───────────────────────── Zugangsdaten ─────────────────────────
def load_secrets(path=None):
    """Einfache Zeilen „schlüssel: wert“ aus secrets.yaml (ohne YAML-Bibliothek)."""
    out = {}
    try:
        with open(path or os.path.join(CONFIG, "secrets.yaml"), encoding="utf-8") as f:
            for line in f:
                m = re.match(r"^([A-Za-z0-9_]+):\s*(.*?)\s*$", line)
                if m and not line.lstrip().startswith("#"):
                    v = m.group(2)
                    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                        v = v[1:-1]
                    out[m.group(1)] = v
    except OSError:
        pass
    return out


def load_credentials():
    s = load_secrets()
    if s.get("netzdiag_fritz_user") and s.get("netzdiag_fritz_password"):
        return {"host": s.get("netzdiag_fritz_host", "fritz.box"), "port": 49443, "ssl": True,
                "user": s["netzdiag_fritz_user"], "password": s["netzdiag_fritz_password"]}
    entries = read_json(os.path.join(CONFIG, ".storage", "core.config_entries"), {})
    for e in entries.get("data", {}).get("entries", []):
        d = e.get("data") or {}
        if e.get("domain") == "fritz" and d.get("host") and d.get("password"):
            use_ssl = bool(d.get("ssl"))
            return {"host": d["host"], "port": int(d.get("port") or (49443 if use_ssl else 49000)), "ssl": use_ssl,
                    "user": d.get("username") or "", "password": d["password"]}
    raise RuntimeError("Keine FRITZ!Box-Zugangsdaten gefunden (Integration „FRITZ!Box Tools“ oder secrets.yaml).")


# ───────────────────────── TR-064 ─────────────────────────
class Tr064:
    def __init__(self, cred):
        self.base = "%s://%s:%d" % ("https" if cred["ssl"] else "http", cred["host"], cred["port"])
        mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
        mgr.add_password(None, self.base, cred["user"], cred["password"])
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE        # die Box hat ein selbst ausgestelltes Zertifikat
        self.opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx),
                                                  urllib.request.HTTPDigestAuthHandler(mgr))

    def call(self, service, action, **args):
        stype, url = SERVICES[service]
        body = "".join("<%s>%s</%s>" % (k, v, k) for k, v in args.items())
        env = ('<?xml version="1.0" encoding="utf-8"?>'
               '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" '
               's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>'
               '<u:%s xmlns:u="%s">%s</u:%s></s:Body></s:Envelope>' % (action, stype, body, action))
        req = urllib.request.Request(self.base + url, data=env.encode("utf-8"), headers={
            "Content-Type": 'text/xml; charset="utf-8"', "SOAPACTION": '"%s#%s"' % (stype, action)})
        with self.opener.open(req, timeout=TIMEOUT) as r:
            root = ET.fromstring(r.read())
        return {el.tag: (el.text or "") for el in root.iter() if el.tag.startswith("New")}

    def fetch(self, path):
        with self.opener.open(self.base + path, timeout=TIMEOUT) as r:
            return r.read()


# ───────────────────────── Auswerten: Ereignisprotokoll ─────────────────────────
def kategorie(gruppe, text):
    g = GRUPPEN.get(str(gruppe or "").strip().lower())
    if g:
        return g
    low = text.lower()
    for name, worte in WORTE:
        if any(w in low for w in worte):
            return name
    return "system"


def parse_devicelog_xml(raw):
    """XML aus X_AVM-DE_GetDeviceLogPath → [{datum, zeit, gruppe, id, text}], älteste zuerst."""
    out = []
    for ev in ET.fromstring(raw):
        d = {c.tag.lower(): (c.text or "").strip() for c in ev}
        text = d.get("msg") or d.get("message") or d.get("text") or ""
        if text:
            out.append({"datum": d.get("date", ""), "zeit": d.get("time", ""), "gruppe": d.get("group", ""),
                        "id": d.get("id", ""), "text": text})
    return order_oldest_first(out)


def parse_devicelog_text(raw):
    """Textform aus GetDeviceLog: je Zeile „TT.MM.JJ HH:MM:SS Meldung“."""
    out = []
    for line in raw.splitlines():
        m = re.match(r"^(\d{2}\.\d{2}\.\d{2,4}) (\d{2}:\d{2}:\d{2}) (.+)$", line.strip())
        if m:
            out.append({"datum": m.group(1), "zeit": m.group(2), "gruppe": "", "id": "", "text": m.group(3)})
    return order_oldest_first(out)


def log_dt(e):
    for fmt in ("%d.%m.%y %H:%M:%S", "%d.%m.%Y %H:%M:%S"):
        try:
            return datetime.strptime("%s %s" % (e["datum"], e["zeit"]), fmt)
        except ValueError:
            pass
    return None


def order_oldest_first(entries):
    """Die Box liefert neueste zuerst; für die Datei wird gedreht. Reihenfolge gleicher Sekunden bleibt erhalten."""
    if len(entries) > 1:
        a, b = log_dt(entries[0]), log_dt(entries[-1])
        if a and b and a > b:
            entries.reverse()
    return entries


def log_key(e):
    # Wiederholte Meldungen fasst die Box zusammen („[3 Meldungen seit …]“) – der Zusatz zählt nicht zum Schlüssel
    text = re.sub(r"\s*\[\d+ Meldungen seit [^\]]+\]", "", e["text"])
    return "%s %s %s" % (e["datum"], e["zeit"], text)


def merge_log(entries, seen):
    """Neue Protokollzeilen (noch nicht gesehen) → Zeilen für fritzlog.jsonl; seen wird fortgeschrieben."""
    known, fresh = set(seen), []
    for e in entries:
        k = log_key(e)
        if k in known:
            continue
        known.add(k)
        seen.append(k)
        dt = log_dt(e)
        fresh.append({"ts": ts(dt) if dt else "%s %s" % (e["datum"], e["zeit"]), "kat": kategorie(e["gruppe"], e["text"]),
                      "gruppe": e["gruppe"], "id": e["id"], "text": e["text"]})
    del seen[:-SEEN_KEEP]
    return fresh


# ───────────────────────── Auswerten: Gerätetabelle ─────────────────────────
def parse_hostlist(raw):
    """XML aus X_AVM-DE_GetHostListPath → {mac: {…}}."""
    hosts = {}
    for item in ET.fromstring(raw):
        d = {c.tag: (c.text or "").strip() for c in item}
        mac = d.get("MACAddress", "").upper()
        if not mac:
            continue
        iface = d.get("InterfaceType", "")
        hosts[mac] = {
            "mac": mac, "ip": d.get("IPAddress", ""), "aktiv": d.get("Active") == "1",
            "name": d.get("X_AVM-DE_FriendlyName") or d.get("HostName") or mac,
            "art": {"Ethernet": "LAN", "802.11": "WLAN", "HomePlug": "Powerline"}.get(iface, iface or "–"),
            "port": d.get("X_AVM-DE_Port", ""), "gast": d.get("X_AVM-DE_Guest") == "1",
            "vpn": d.get("X_AVM-DE_VPN") == "1", "gesperrt": d.get("X_AVM-DE_Disallow") == "1",
            "wan": d.get("X_AVM-DE_WANAccess", ""),
        }
    return hosts


def private_mac(mac):
    """Zufalls-Adresse (Handy/Tablet „private WLAN-Adresse“): Bit „lokal verwaltet“ im ersten Byte."""
    try:
        return bool(int(mac[:2], 16) & 2)
    except ValueError:
        return False


def label(h):
    return "%s (%s)" % (h["name"], h["mac"][-8:])


def find_problems(hosts, lan, dhcp, conn):
    """Befunde aus dem aktuellen Stand. Jeder Befund: key, stufe (kritisch|warnung|info), titel, text."""
    out = []

    def add(key, stufe, titel, text):
        out.append({"key": key, "stufe": stufe, "titel": titel, "text": clean(text, 400)})

    net = lo = hi = None
    try:
        net = ipaddress.ip_network("%s/%s" % (lan["router"], lan["maske"]), strict=False)
        lo, hi = ipaddress.ip_address(lan["min"]), ipaddress.ip_address(lan["max"])
    except (KeyError, ValueError):
        pass

    by_ip = {}
    for h in hosts.values():
        if h["ip"] and not h["vpn"]:
            by_ip.setdefault(h["ip"], []).append(h)
    for ip, group in sorted(by_ip.items()):
        if len(group) < 2:
            continue
        aktiv = [h for h in group if h["aktiv"]]
        namen = ", ".join(label(h) + (" – online" if h["aktiv"] else " – offline") for h in group)
        if len(aktiv) >= 2:
            add("doppelt:" + ip, "kritisch", "IP-Adresse %s doppelt in Benutzung" % ip,
                "Zwei Geräte sind gleichzeitig mit derselben Adresse online: %s. Beide verlieren abwechselnd die Verbindung." % namen)
        elif aktiv:
            add("doppelt:" + ip, "warnung", "IP-Adresse %s doppelt vergeben" % ip,
                "Die Box führt mehrere Geräte unter dieser Adresse: %s. Kommt das zweite Gerät zurück, gibt es einen Konflikt." % namen)

    for h in hosts.values():
        if not h["ip"] or h["vpn"] or h["gast"]:
            continue
        try:
            ip = ipaddress.ip_address(h["ip"])
        except ValueError:
            continue
        if h["aktiv"] and net is not None and ip not in net:
            grund = ("Adresse 169.254.x.x heißt: das Gerät hat vom DHCP-Server keine Antwort bekommen."
                     if ip.is_link_local else
                     "Das Gerät hat seine Adresse nicht von der FRITZ!Box bekommen – entweder fest falsch eingestellt oder "
                     "ein zweiter DHCP-Server (anderer Router, Repeater im Router-Modus) verteilt Adressen.")
            add("fremdnetz:" + h["mac"], "kritisch", "%s hat eine Adresse außerhalb des Heimnetzes" % h["name"],
                "%s hat %s, das Heimnetz ist %s. %s" % (label(h), h["ip"], net, grund))
        if h.get("quelle") == "Static" and lo is not None and lo <= ip <= hi:
            add("fest_im_dhcp:" + h["mac"], "warnung", "%s: feste IP im DHCP-Bereich" % h["name"],
                "%s hat %s fest im Gerät eingestellt, die Box verteilt aber %s–%s automatisch. Ist das Gerät aus, kann die Box "
                "die Adresse einem anderen Gerät geben → Konflikt beim Wiederkommen. Abhilfe: im Gerät auf automatisch (DHCP) "
                "stellen und in der Box „immer dieselbe IP-Adresse zuweisen“ anhaken, oder eine Adresse außerhalb des Bereichs nehmen."
                % (label(h), h["ip"], lan["min"], lan["max"]))
        if h["aktiv"] and (h["gesperrt"] or h["wan"] == "denied"):
            add("gesperrt:" + h["mac"], "warnung", "%s: Internet durch die FRITZ!Box gesperrt" % h["name"],
                "%s ist online, aber ein Zugangsprofil (Kindersicherung/Zeitbudget/Sperre) lässt es nicht ins Internet." % label(h))

    if lan and lan.get("dhcp_an") is False:
        add("dhcp_aus", "info", "DHCP-Server der FRITZ!Box ist ausgeschaltet",
            "Die Box verteilt keine Adressen. Das ist nur richtig, wenn ein anderes Gerät diese Aufgabe bewusst übernimmt.")

    server = (dhcp or {}).get("server") or []
    fremd = [s for s in server if s["server"] != lan.get("router")] if lan.get("router") else []
    if fremd:
        add("dhcp_fremd:" + ",".join(sorted(s["server"] for s in fremd)), "kritisch", "Zweiter DHCP-Server im Netz",
            "Auf die Test-Anfrage antwortet nicht nur die FRITZ!Box: %s. Geräte, die ihre Adresse von dort bekommen, haben "
            "einen falschen Weg ins Internet – genau das Bild „manche Geräte gehen, manche nicht“."
            % "; ".join("%s%s bietet %s an, Router %s" % (s["server"], " [%s]" % s["mac"] if s.get("mac") else "",
                                                          s["angebot"], s.get("router") or "?") for s in fremd))
    elif dhcp and dhcp.get("ok") and not server:
        add("dhcp_stumm", "warnung", "Kein DHCP-Server hat geantwortet",
            "Auf die Test-Anfrage kam keine Antwort. Geräte, die sich neu verbinden, bekommen dann keine Adresse.")

    if conn.get("gw_mac_alt") and conn.get("gw_mac") and conn["gw_mac_alt"] != conn["gw_mac"]:
        add("gw_mac:" + conn["gw_mac"], "kritisch", "Hardware-Adresse der FRITZ!Box hat gewechselt",
            "Unter %s meldete sich bisher %s, jetzt %s. Ein anderes Gerät benutzt vermutlich die Adresse der Box."
            % (lan.get("router") or "der Box-Adresse", conn["gw_mac_alt"], conn["gw_mac"]))
    return out


def diff_hosts(alt, neu):
    """Änderungen zwischen zwei Abfragen → Journalzeilen (ohne ts)."""
    out = []
    for mac, h in neu.items():
        a = alt.get(mac)
        if a is None:
            zusatz = " – Zufalls-Adresse, evtl. ein bekanntes Handy/Tablet mit neuer „privater WLAN-Adresse“" if private_mac(mac) else ""
            out.append({"art": "neu", "stufe": "info", "mac": mac,
                        "text": "Neues Gerät: %s, IP %s, %s%s" % (label(h), h["ip"] or "–", h["art"], zusatz)})
            continue
        if a.get("ip") and h["ip"] and a["ip"] != h["ip"]:
            out.append({"art": "ip_wechsel", "stufe": "warnung", "mac": mac,
                        "text": "%s: IP-Adresse gewechselt %s → %s" % (label(h), a["ip"], h["ip"])})
        if a.get("aktiv") != h["aktiv"]:
            out.append({"art": "online" if h["aktiv"] else "offline", "stufe": "info", "mac": mac,
                        "text": "%s ist %s (%s, %s)" % (label(h), "wieder online" if h["aktiv"] else "offline",
                                                        h["ip"] or "–", h["art"])})
        if h["aktiv"] and a.get("aktiv") and a.get("art") != h["art"]:
            out.append({"art": "anschluss", "stufe": "info", "mac": mac,
                        "text": "%s: Anschluss gewechselt %s → %s" % (label(h), a.get("art"), h["art"])})
    return out


# ───────────────────────── Tests vom Pi aus ─────────────────────────
def tcp_ok(host, port, timeout=3):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def arp_mac(ip):
    try:
        with open("/proc/net/arp", encoding="ascii") as f:
            for line in f.readlines()[1:]:
                p = line.split()
                if len(p) >= 4 and p[0] == ip and p[3] != "00:00:00:00:00:00":
                    return p[3].upper()
    except OSError:
        pass
    return ""


def check_connection(router):
    box = tcp_ok(router, 80) or tcp_ok(router, 443)
    internet = tcp_ok("1.1.1.1", 443) or tcp_ok("8.8.8.8", 443)
    try:
        socket.getaddrinfo("avm.de", 443)
        dns = True
    except OSError:
        dns = False
    return {"box": box, "internet": internet, "dns": dns, "gw_mac": arp_mac(router)}


def default_iface():
    try:
        with open("/proc/net/route", encoding="ascii") as f:
            for line in f.readlines()[1:]:
                p = line.split()
                if len(p) > 1 and p[1] == "00000000":
                    return p[0]
    except OSError:
        pass
    return ""


def build_discover(xid, mac):
    chaddr = bytes.fromhex(mac.replace(":", ""))
    head = struct.pack("!BBBB4sHH", 1, 1, 6, 0, xid, 0, 0x8000) + b"\x00" * 16 + chaddr + b"\x00" * 10 + b"\x00" * 192
    opts = (b"\x63\x82\x53\x63" + b"\x35\x01\x01" + b"\x3d\x07\x01" + chaddr + b"\x0c\x08netzdiag"
            + b"\x37\x05\x01\x03\x06\x33\x36" + b"\xff")
    return (head + opts).ljust(300, b"\x00")


def parse_offer(data, xid):
    """DHCP-Antwort → {server, angebot, router, dns, maske} oder None."""
    if len(data) < 240 or data[0] != 2 or data[4:8] != xid or data[236:240] != b"\x63\x82\x53\x63":
        return None
    opts, i = {}, 240
    while i < len(data) and data[i] != 255:
        if data[i] == 0:
            i += 1
            continue
        if i + 1 >= len(data):
            break
        n = data[i + 1]
        opts[data[i]] = data[i + 2:i + 2 + n]
        i += 2 + n
    if opts.get(53) != b"\x02":
        return None
    ip = lambda b: socket.inet_ntoa(b[:4]) if b and len(b) >= 4 else ""
    dns = opts.get(6, b"")
    return {"server": ip(opts.get(54)) or ip(data[20:24]), "angebot": ip(data[16:20]), "router": ip(opts.get(3)),
            "maske": ip(opts.get(1)), "dns": ", ".join(ip(dns[j:j + 4]) for j in range(0, len(dns) - 3, 4))}


def _checksum(b):
    s = sum(struct.unpack("!%dH" % (len(b) // 2), b))
    s = (s >> 16) + (s & 0xFFFF)
    return ~(s + (s >> 16)) & 0xFFFF


def dhcp_probe(wait=3.0):
    """DHCPDISCOVER als Rundruf senden und alle Angebote einsammeln. Es wird keine Adresse angenommen (kein REQUEST).
    Rohdaten-Socket (AF_PACKET): läuft auch, wenn der DHCP-Dienst des Pi Port 68 belegt. Nur Linux, braucht root."""
    iface = default_iface()
    if not iface or not hasattr(socket, "AF_PACKET"):
        return {"ok": False, "fehler": "kein Netzwerk-Anschluss gefunden" if hasattr(socket, "AF_PACKET") else "nur unter Linux"}
    xid = os.urandom(4)
    try:
        with open("/sys/class/net/%s/address" % iface, encoding="ascii") as f:
            src = bytes.fromhex(f.read().strip().replace(":", ""))
        dhcp = build_discover(xid, PROBE_MAC)
        udp = struct.pack("!HHHH", 68, 67, 8 + len(dhcp), 0) + dhcp
        iph = struct.pack("!BBHHHBBH4s4s", 0x45, 0, 20 + len(udp), 0, 0, 64, 17, 0, b"\x00" * 4, b"\xff" * 4)
        iph = iph[:10] + struct.pack("!H", _checksum(iph)) + iph[12:]
        frame = b"\xff" * 6 + src + b"\x08\x00" + iph + udp
        s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(0x0800))
    except (OSError, ValueError) as e:
        return {"ok": False, "fehler": "DHCP-Test nicht möglich: %s" % e}
    server = {}
    try:
        s.bind((iface, 0))
        s.send(frame)
        ende = time.monotonic() + wait
        while time.monotonic() < ende:
            s.settimeout(max(0.05, ende - time.monotonic()))
            try:
                pkt = s.recv(2048)
            except socket.timeout:
                break
            if len(pkt) < 42 or pkt[12:14] != b"\x08\x00" or pkt[23] != 17:
                continue
            ihl = (pkt[14] & 0x0F) * 4
            u = 14 + ihl
            if pkt[u:u + 4] != b"\x00\x43\x00\x44":      # UDP 67 → 68
                continue
            offer = parse_offer(pkt[u + 8:], xid)
            if offer:
                offer["mac"] = ":".join("%02X" % b for b in pkt[6:12])
                server[offer["server"] + offer["mac"]] = offer
    except OSError as e:
        return {"ok": False, "fehler": "DHCP-Test abgebrochen: %s" % e}
    finally:
        s.close()
    return {"ok": True, "server": sorted(server.values(), key=lambda o: o["server"]), "anschluss": iface}


# ───────────────────────── Ansichten für die Karten ─────────────────────────
ICON = {"kritisch": "🔴", "warnung": "🟠", "info": "🔵", "ok": "🟢"}


def short_ts(t):
    """„2026-09-19 10:06:36“ → „19.09. 10:06:36“."""
    m = re.match(r"^\d{4}-(\d{2})-(\d{2}) (.+)$", t or "")
    return "%s.%s. %s" % (m.group(2), m.group(1), m.group(3)) if m else (t or "")


def build_views(hosts, stand):
    rows = tail_lines(FRITZLOG, 1200)
    log = {"stand": stand, "anzahl": len(rows)}
    for kat in ("internet", "wlan", "system"):
        sel = [r for r in rows if r.get("kat") == kat or (kat == "system" and r.get("kat") in ("telefon", "usb"))]
        log[kat] = [{"t": short_ts(r["ts"]), "m": clean(r["text"])} for r in reversed(sel[-VIEW_LOG:])]
    write_json(os.path.join(DATA, "view_fritzlog.json"), log)

    jrows = tail_lines(JOURNAL, 3000)
    view = [{"t": short_ts(r["ts"]), "s": ICON.get(r.get("stufe"), "🔵"), "m": clean(r["text"])}
            for r in reversed(jrows[-VIEW_JOURNAL:])]
    wichtig = [{"t": short_ts(r["ts"]), "s": ICON.get(r.get("stufe"), "🔵"), "m": clean(r["text"])}
               for r in reversed([r for r in jrows if r.get("stufe") in ("kritisch", "warnung")][-VIEW_JOURNAL:])]
    write_json(os.path.join(DATA, "view_journal.json"), {"stand": stand, "anzahl": len(jrows), "eintraege": view, "wichtig": wichtig})

    grenze = ts(now() - timedelta(hours=24))
    abbr = {}
    for r in jrows:
        if r.get("art") == "offline" and r.get("ts", "") >= grenze:
            abbr[r.get("mac")] = abbr.get(r.get("mac"), 0) + 1

    def ipkey(h):
        try:
            return (0, int(ipaddress.ip_address(h["ip"])))
        except ValueError:
            return (1, 0)
    liste = [{"ip": h["ip"] or "–", "name": clean(h["name"], 40), "mac": h["mac"], "art": h["art"],
              "quelle": {"Static": "fest im Gerät", "DHCP": "DHCP"}.get(h.get("quelle"), "?"),
              "on": h["aktiv"], "zufall": private_mac(h["mac"]), "ab": abbr.get(h["mac"], 0)}
             for h in sorted(hosts.values(), key=ipkey) if h["aktiv"] or abbr.get(h["mac"])]
    write_json(os.path.join(DATA, "view_geraete.json"),
               {"stand": stand, "aktiv": sum(1 for h in hosts.values() if h["aktiv"]), "bekannt": len(hosts), "geraete": liste})


# ───────────────────────── Ablauf ─────────────────────────
def collect():
    os.makedirs(DATA, exist_ok=True)
    state = read_json(STATE, {})
    stand, journal, fehler = ts(), [], []
    erster_lauf = "hosts" not in state
    slow = time.time() - state.get("slow_ts", 0) >= SLOW_S

    cred = load_credentials()
    box = Tr064(cred)

    # 1) Ereignisprotokoll
    try:
        try:
            raw = box.fetch(box.call("deviceinfo", "X_AVM-DE_GetDeviceLogPath")["NewDeviceLogPath"])
            entries = parse_devicelog_xml(raw)
            if erster_lauf or not os.path.exists(os.path.join(DATA, "raw_devicelog.xml")):
                with open(os.path.join(DATA, "raw_devicelog.xml"), "wb") as f:
                    f.write(raw)       # einmalige Probe zum Nachsehen des Formats
        except (KeyError, ET.ParseError):
            entries = parse_devicelog_text(box.call("deviceinfo", "GetDeviceLog").get("NewDeviceLog", ""))
        seen = state.setdefault("log_seen", [])
        append_lines(FRITZLOG, merge_log(entries, seen))
    except Exception as e:  # noqa: BLE001 – ein Teil darf ausfallen, der Rest läuft weiter
        fehler.append("Ereignisprotokoll: %s" % e)

    # 2) DHCP-Bereich und Heimnetz (selten)
    lan = state.get("lan") or {}
    if slow or not lan:
        try:
            i = box.call("lan", "GetInfo")
            lan = {"router": (i.get("NewIPRouters") or cred["host"]).split(",")[0].strip(), "maske": i.get("NewSubnetMask", ""),
                   "min": i.get("NewMinAddress", ""), "max": i.get("NewMaxAddress", ""),
                   "dhcp_an": i.get("NewDHCPServerEnable") == "1", "dns": i.get("NewDNSServers", "")}
            state["lan"] = lan
        except Exception as e:  # noqa: BLE001
            fehler.append("DHCP-Bereich: %s" % e)

    # 3) Gerätetabelle
    hosts = {}
    try:
        raw = box.fetch(box.call("hosts", "X_AVM-DE_GetHostListPath")["NewX_AVM-DE_HostListPath"])
        hosts = parse_hostlist(raw)
        quelle = state.setdefault("quelle", {})
        if slow:
            for mac, h in hosts.items():
                if h["aktiv"] and h["ip"]:
                    try:
                        quelle[mac] = box.call("hosts", "GetSpecificHostEntry", NewMACAddress=mac).get("NewAddressSource", "")
                    except Exception:  # noqa: BLE001
                        pass
        for mac, h in hosts.items():
            h["quelle"] = quelle.get(mac, "")
        if erster_lauf:
            journal.append({"art": "start", "stufe": "info", "text": "Erfassung gestartet: %d Geräte bekannt, %d online"
                            % (len(hosts), sum(1 for h in hosts.values() if h["aktiv"]))})
        else:
            journal += diff_hosts(state.get("hosts", {}), hosts)
        state["hosts"] = {m: {k: h[k] for k in ("ip", "aktiv", "art", "name")} for m, h in hosts.items()}
    except Exception as e:  # noqa: BLE001
        fehler.append("Gerätetabelle: %s" % e)

    # 4) Tests vom Pi aus
    router = lan.get("router") or cred["host"]
    alt = state.get("conn") or {}
    conn = check_connection(router)
    conn["gw_mac_alt"] = alt.get("gw_mac") or ""
    if not conn["gw_mac"]:
        conn["gw_mac"] = conn["gw_mac_alt"]           # kein ARP-Eintrag gerade: alten Wert behalten
    for feld, name in (("box", "FRITZ!Box vom Pi aus"), ("internet", "Internet vom Pi aus"), ("dns", "Namensauflösung am Pi")):
        if feld in alt and alt[feld] != conn[feld]:
            journal.append({"art": "pi_" + feld, "stufe": "info" if conn[feld] else "kritisch",
                            "text": "%s: %s" % (name, "wieder erreichbar" if conn[feld] else "NICHT erreichbar")})
    state["conn"] = {k: conn[k] for k in ("box", "internet", "dns", "gw_mac")}

    dhcp = state.get("dhcp") or {}
    if slow:
        dhcp = dhcp_probe()
        dhcp["stand"] = stand
        state["dhcp"] = dhcp
        state["slow_ts"] = time.time()

    # 5) Befunde, Journal, Ansichten
    befunde = find_problems(hosts, lan, dhcp, conn) if hosts else []
    alt_keys, neu_keys = state.get("befunde") or {}, {b["key"]: b["titel"] for b in befunde}
    for b in befunde:
        if b["key"] not in alt_keys:
            journal.append({"art": "befund", "stufe": b["stufe"], "text": "Befund: %s – %s" % (b["titel"], b["text"])})
    for k, titel in alt_keys.items():
        if k not in neu_keys and hosts:
            journal.append({"art": "befund_weg", "stufe": "info", "text": "Befund erledigt: %s" % titel})
    if hosts:
        state["befunde"] = neu_keys
    append_lines(JOURNAL, [dict(j, ts=stand) for j in journal])
    write_json(STATE, state)
    build_views(hosts, stand)

    stufen = [b["stufe"] for b in befunde]
    status = "fehler" if fehler and not hosts else "kritisch" if "kritisch" in stufen or not conn["internet"] \
        else "warnung" if "warnung" in stufen or fehler else "ok"
    order = {"kritisch": 0, "warnung": 1, "info": 2}
    return {
        "status": status, "stand": stand, "fehler": fehler,
        "befunde": [{"s": ICON[b["stufe"]], "stufe": b["stufe"], "titel": b["titel"], "text": b["text"]}
                    for b in sorted(befunde, key=lambda b: order[b["stufe"]])],
        "anzahl_kritisch": stufen.count("kritisch"), "anzahl_warnung": stufen.count("warnung"),
        "geraete_online": sum(1 for h in hosts.values() if h["aktiv"]), "geraete_bekannt": len(hosts),
        "heimnetz": {"router": lan.get("router", ""), "dhcp_von": lan.get("min", ""), "dhcp_bis": lan.get("max", ""),
                     "maske": lan.get("maske", ""), "dhcp_an": lan.get("dhcp_an")},
        "dhcp_test": dhcp, "pi": {k: conn[k] for k in ("box", "internet", "dns", "gw_mac")},
    }


LEER = {"journal": {"stand": "", "anzahl": 0, "eintraege": [], "wichtig": []},
        "fritzlog": {"stand": "", "anzahl": 0, "internet": [], "wlan": [], "system": []},
        "geraete": {"stand": "", "aktiv": 0, "bekannt": 0, "geraete": []}}


def main(argv):
    cmd = argv[1] if len(argv) > 1 else ""
    if cmd == "collect":
        try:
            out = collect()
        except Exception as e:  # noqa: BLE001 – der Sensor soll den Grund zeigen statt „unbekannt“
            out = {"status": "fehler", "stand": ts(), "fehler": [clean(e)], "befunde": [], "anzahl_kritisch": 0,
                   "anzahl_warnung": 0, "geraete_online": 0, "geraete_bekannt": 0, "heimnetz": {}, "dhcp_test": {}, "pi": {}}
        print(json.dumps(out, ensure_ascii=False))
    elif cmd == "show" and len(argv) > 2 and argv[2] in LEER:
        print(json.dumps(read_json(os.path.join(DATA, "view_%s.json" % argv[2]), LEER[argv[2]]), ensure_ascii=False))
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
