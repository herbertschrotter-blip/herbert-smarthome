"""Tests für fritz_diag.py – laufen ohne FRITZ!Box:  python -m unittest discover -s ha/netzdiagnose/tests"""
import os, struct, sys, unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import fritz_diag as fd  # noqa: E402

HOSTLIST = """<?xml version="1.0"?><List>
<Item><Index>1</Index><IPAddress>192.168.170.60</IPAddress><MACAddress>00:11:22:33:44:01</MACAddress><Active>1</Active>
 <HostName>homeassistant</HostName><InterfaceType>Ethernet</InterfaceType><X_AVM-DE_Port>1</X_AVM-DE_Port>
 <X_AVM-DE_Guest>0</X_AVM-DE_Guest><X_AVM-DE_VPN>0</X_AVM-DE_VPN><X_AVM-DE_WANAccess>granted</X_AVM-DE_WANAccess>
 <X_AVM-DE_Disallow>0</X_AVM-DE_Disallow><X_AVM-DE_FriendlyName>Pi</X_AVM-DE_FriendlyName></Item>
<Item><Index>2</Index><IPAddress>192.168.170.60</IPAddress><MACAddress>00:11:22:33:44:02</MACAddress><Active>1</Active>
 <HostName>samsungtv</HostName><InterfaceType>802.11</InterfaceType><X_AVM-DE_WANAccess>granted</X_AVM-DE_WANAccess></Item>
<Item><Index>3</Index><IPAddress>192.168.1.23</IPAddress><MACAddress>02:11:22:33:44:03</MACAddress><Active>1</Active>
 <HostName>Tab</HostName><InterfaceType>802.11</InterfaceType></Item>
<Item><Index>4</Index><IPAddress>192.168.170.40</IPAddress><MACAddress>00:11:22:33:44:04</MACAddress><Active>1</Active>
 <HostName>kind</HostName><InterfaceType>802.11</InterfaceType><X_AVM-DE_WANAccess>denied</X_AVM-DE_WANAccess></Item>
<Item><Index>5</Index><IPAddress></IPAddress><MACAddress>02:11:22:33:44:05</MACAddress><Active>1</Active><HostName>Switch</HostName></Item>
</List>"""
LAN = {"router": "192.168.170.1", "maske": "255.255.255.0", "min": "192.168.170.20", "max": "192.168.170.200", "dhcp_an": True}


class HostTests(unittest.TestCase):
    def setUp(self):
        self.hosts = fd.parse_hostlist(HOSTLIST)

    def test_parse(self):
        self.assertEqual(len(self.hosts), 5)
        pi = self.hosts["00:11:22:33:44:01"]
        self.assertEqual((pi["name"], pi["art"], pi["aktiv"]), ("Pi", "LAN", True))
        self.assertTrue(fd.private_mac("02:11:22:33:44:03"))
        self.assertFalse(fd.private_mac("00:11:22:33:44:01"))

    def keys(self, **kw):
        return {b["key"]: b["stufe"] for b in fd.find_problems(self.hosts, kw.get("lan", LAN), kw.get("dhcp", {}), kw.get("conn", {}))}

    def test_doppelte_ip_und_fremdnetz_und_sperre(self):
        k = self.keys()
        self.assertEqual(k["doppelt:192.168.170.60"], "kritisch")
        self.assertEqual(k["fremdnetz:02:11:22:33:44:03"], "kritisch")
        self.assertEqual(k["gesperrt:00:11:22:33:44:04"], "warnung")

    def test_doppelt_nur_warnung_wenn_einer_offline(self):
        self.hosts["00:11:22:33:44:02"]["aktiv"] = False
        self.assertEqual(self.keys()["doppelt:192.168.170.60"], "warnung")

    def test_feste_ip_im_dhcp_bereich(self):
        self.hosts["00:11:22:33:44:01"]["quelle"] = "Static"
        self.assertEqual(self.keys()["fest_im_dhcp:00:11:22:33:44:01"], "warnung")
        lan = dict(LAN, min="192.168.170.100")
        self.assertNotIn("fest_im_dhcp:00:11:22:33:44:01", self.keys(lan=lan))

    def test_zweiter_dhcp_server(self):
        dhcp = {"ok": True, "server": [{"server": "192.168.170.1", "angebot": "192.168.170.99", "router": "192.168.170.1"},
                                       {"server": "192.168.170.38", "angebot": "192.168.1.5", "router": "192.168.1.1", "mac": "AA"}]}
        self.assertEqual(self.keys(dhcp=dhcp)["dhcp_fremd:192.168.170.38"], "kritisch")
        self.assertNotIn("dhcp_fremd:192.168.170.38", self.keys(dhcp={"ok": True, "server": dhcp["server"][:1]}))
        self.assertIn("dhcp_stumm", self.keys(dhcp={"ok": True, "server": []}))
        self.assertNotIn("dhcp_stumm", self.keys(dhcp={"ok": False, "fehler": "x"}))

    def test_gateway_mac(self):
        self.assertIn("gw_mac:BB", self.keys(conn={"gw_mac_alt": "AA", "gw_mac": "BB"}))
        self.assertNotIn("gw_mac:AA", self.keys(conn={"gw_mac_alt": "AA", "gw_mac": "AA"}))

    def test_diff(self):
        alt = {m: {k: h[k] for k in ("ip", "aktiv", "art", "name")} for m, h in self.hosts.items()}
        del alt["00:11:22:33:44:04"]
        alt["00:11:22:33:44:01"]["ip"] = "192.168.170.61"
        alt["00:11:22:33:44:02"]["aktiv"] = False
        arten = sorted(j["art"] for j in fd.diff_hosts(alt, self.hosts))
        self.assertEqual(arten, ["ip_wechsel", "neu", "online"])


class LogTests(unittest.TestCase):
    XML = """<?xml version="1.0"?><root>
<Event><id>23</id><group>2</group><date>19.09.26</date><time>10:05:00</time><msg>Internetverbindung wurde getrennt.</msg></Event>
<Event><id>751</id><group>4</group><date>19.09.26</date><time>10:01:00</time><msg>WLAN-Gerät | abgemeldet</msg></Event>
</root>"""

    def test_xml(self):
        e = fd.parse_devicelog_xml(self.XML)
        self.assertEqual([x["zeit"] for x in e], ["10:01:00", "10:05:00"])   # älteste zuerst
        seen = []
        fresh = fd.merge_log(e, seen)
        self.assertEqual([f["kat"] for f in fresh], ["wlan", "internet"])
        self.assertEqual(fresh[1]["ts"], "2026-09-19 10:05:00")
        self.assertEqual(fd.merge_log(e, seen), [])                          # zweiter Lauf: nichts Neues

    def test_text_und_wiederholung(self):
        e = fd.parse_devicelog_text("19.09.26 10:05:00 Anmeldung fehlgeschlagen.\n19.09.26 10:01:00 WLAN-Gerät angemeldet")
        self.assertEqual(len(e), 2)
        a = {"datum": "19.09.26", "zeit": "10:00:00", "text": "X fehlgeschlagen.", "gruppe": "", "id": ""}
        b = dict(a, text="X fehlgeschlagen. [3 Meldungen seit 19.09.26 09:00:00]")
        self.assertEqual(fd.log_key(a), fd.log_key(b))
        self.assertEqual(fd.kategorie("", "Mobilfunk-Verbindung getrennt"), "internet")
        self.assertEqual(fd.clean("a | b\nc"), "a / b c")


class DhcpTests(unittest.TestCase):
    def test_offer(self):
        xid = b"\x01\x02\x03\x04"
        d = fd.build_discover(xid, fd.PROBE_MAC)
        self.assertEqual(len(d), 300)
        self.assertIsNone(fd.parse_offer(d, xid))                              # eigene Anfrage ist kein Angebot
        head = struct.pack("!BBBB4sHH", 2, 1, 6, 0, xid, 0, 0x8000) + bytes([0] * 4) + bytes([192, 168, 170, 99]) + b"\x00" * 8
        head += b"\x00" * 16 + b"\x00" * 192
        opts = b"\x63\x82\x53\x63\x35\x01\x02" + b"\x36\x04" + bytes([192, 168, 170, 1]) + b"\x03\x04" + bytes([192, 168, 170, 1]) \
            + b"\x06\x08" + bytes([192, 168, 170, 1, 1, 1, 1, 1]) + b"\xff"
        o = fd.parse_offer(head + opts, xid)
        self.assertEqual((o["server"], o["angebot"], o["router"], o["dns"]),
                         ("192.168.170.1", "192.168.170.99", "192.168.170.1", "192.168.170.1, 1.1.1.1"))
        self.assertIsNone(fd.parse_offer(head + opts, b"\x09\x09\x09\x09"))

    def test_checksum(self):
        h = bytes.fromhex("4500003c1c4640004006" + "0000" + "ac100a63ac100a0c")
        self.assertEqual(fd._checksum(h), 0xB1E6)


if __name__ == "__main__":
    unittest.main()
