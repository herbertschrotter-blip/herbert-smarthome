"""Bauplan F.1 (DX-068): diag.py – Zeilen schreiben, HA-Log zerlegen, Dubletten und Lücken, Aufbewahrung.

Nur Standardbibliothek (unittest), damit der Test auf dem Pi läuft (auf dem PC gibt es kein Python):
  HA: Dienst shell_command.heidi_diag_test  ·  von Hand: cd /config/prognose && python3 -m unittest tests.test_diag -v
"""
import base64
import json
import os
import sys
import tempfile
import unittest
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import diag  # noqa: E402

LOG = """2026-09-18 18:52:03.725 ERROR (MainThread) [custom_components.dreame_vacuum.dreame.map] Map render Failed: Traceback (most recent call last):
  File "/config/custom_components/dreame_vacuum/dreame/map.py", line 1, in render
AttributeError: 'Segment' object has no attribute 'area'
2026-09-18 18:52:04.000 WARNING (MainThread) [homeassistant.components.sensor] etwas anderes
\x1b[32m2026-09-18 18:52:05.100 DEBUG (SyncWorker_3) [custom_components.dreame_vacuum.dreame.device] Property changed: STATE = 2\x1b[0m
2026-09-18 18:52:05.100 DEBUG (SyncWorker_3) [custom_components.dreame_vacuum.dreame.device] Property changed: BATTERY = 97
"""


def b64(obj):
    return base64.b64encode(json.dumps(obj).encode("utf-8")).decode("ascii")


class DiagTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        diag.DIR = os.path.join(self.tmp.name, "diag")
        diag.STATE = os.path.join(diag.DIR, "debuglog_state.json")
        diag.CTX = os.path.join(diag.DIR, "ctx_cache.json")

    def tearDown(self):
        self.tmp.cleanup()

    def rows(self, day):
        with open(os.path.join(diag.DIR, "heidi_diag-%s.jsonl" % day), encoding="utf-8") as f:
            return [json.loads(x) for x in f.read().splitlines()]

    def test_log_schreibt_zeile_mit_pflichtfeldern(self):
        diag.cmd_log([b64({"ts": "2026-09-18T09:30:00.123", "art": "zustand", "ent": "vacuum.heidi", "alt": "docked",
                           "neu": "cleaning", "attr": [["charging", True, False]], "quelle": "benutzer",
                           "wer": "Herbert's Handy", "ctx": "01ABC", "user_id": "u1", "parent_id": None})])
        r = self.rows("2026-09-18")
        self.assertEqual(len(r), 1)
        self.assertEqual(r[0]["attr"], {"charging": [True, False]})
        self.assertEqual(r[0]["v"], 1)
        for k in ("ts", "ent", "alt", "neu", "quelle", "ctx"):
            self.assertIn(k, r[0])
        self.assertEqual(r[0]["wer"], "Herbert's Handy")  # Hochkomma übersteht den Weg (base64)

    def test_log_ohne_ts_bekommt_zeitstempel_und_tagesdatei(self):
        diag.cmd_log([b64({"art": "dienst", "dienst": "vacuum.start"})])
        r = self.rows(datetime.now().strftime("%Y-%m-%d"))
        self.assertRegex(r[0]["ts"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$")

    def test_log_ungueltig_endet_mit_fehler(self):
        with self.assertRaises(SystemExit):
            diag.cmd_log(["kein-base64-json"])
        with self.assertRaises(SystemExit):
            diag.cmd_log([b64([1, 2])])

    def test_quelle_app_dashboard_planer(self):
        """Akzeptanz F.1: App-Start = extern, Dashboard-Start = Benutzer, Planerstart = Automation (mit Name)."""
        z = {"art": "zustand", "ent": "vacuum.heidi", "alt": "docked", "neu": "cleaning"}
        # Planer ist zeitgesteuert: kein Eltern-Kontext, Zuordnung nur über die Kontext-ID des Laufs
        diag.cmd_log([b64({"ts": "2026-09-18T09:30:00.000", "art": "automation", "ent": "automation.heidi_planer",
                           "name": "Heidi: Planer", "ctx": "A1", "user_id": None, "parent_id": None})])
        diag.cmd_log([b64({"ts": "2026-09-18T09:30:00.100", "art": "skript", "ent": "script.heidi_plan_starten",
                           "name": "Heidi: Plan starten", "ctx": "S1", "user_id": None, "parent_id": "A1"})])
        diag.cmd_log([b64(dict(z, ts="2026-09-18T09:30:02.000", ctx="S1", user_id=None, parent_id="A1"))])
        diag.cmd_log([b64(dict(z, ts="2026-09-18T10:00:00.000", ctx="U1", user_id="u1", parent_id=None, wer="Herbert"))])
        diag.cmd_log([b64(dict(z, ts="2026-09-18T11:00:00.000", ctx="X1", user_id=None, parent_id=None))])
        r = self.rows("2026-09-18")
        self.assertEqual([x["quelle"] for x in r], ["system", "automation", "automation", "benutzer", "extern"])
        self.assertEqual(r[1]["durch"], "Heidi: Planer")
        self.assertEqual(r[2]["durch"], "Heidi: Plan starten")
        self.assertNotIn("durch", r[4])

    def test_kontext_speicher_bleibt_begrenzt(self):
        cache = {"c%d" % i: "x" for i in range(diag.CTX_KEEP)}
        self.assertTrue(diag.classify({"art": "automation", "ctx": "neu", "name": "N"}, cache))
        self.assertEqual(len(cache), diag.CTX_KEEP)
        self.assertNotIn("c0", cache)
        self.assertEqual(cache["neu"], "N")
        self.assertFalse(diag.classify({"art": "dienst", "ctx": "neu"}, cache))

    def test_parse_haengt_folgezeilen_an_und_entfernt_farben(self):
        recs = diag.parse_records(LOG)
        self.assertEqual(len(recs), 4)
        self.assertEqual(recs[0][0], "2026-09-18 18:52:03.725")
        self.assertIn("AttributeError", recs[0][2])
        self.assertTrue(recs[2][2].startswith("2026-09-18 18:52:05.100 DEBUG"))

    def test_signierte_adressen_werden_gekuerzt(self):
        line = ("2026-09-18 20:29:43.498 DEBUG (Thread-95) [custom_components.dreame_vacuum.dreame.map] Request map "
                "data from cloud https://host.example/iot/tmp/9?Expires=1&OSSAccessKeyId=ABC&Signature=xyz%3D danach")
        text = diag.parse_records(line)[0][2]
        self.assertIn("https://host.example/iot/tmp/9?… danach", text)
        self.assertNotIn("Signature", text)

    def test_new_records_filtert_integration_und_dubletten(self):
        recs = diag.parse_records(LOG)
        out, gap = diag.new_records(recs, "", [], False)
        self.assertEqual(len(out), 3)  # homeassistant.components.sensor fällt weg
        self.assertFalse(gap)
        # gleicher Zeitstempel: die schon geschriebene Zeile fällt weg, die zweite bleibt
        out, _ = diag.new_records(recs, "2026-09-18 18:52:05.100", [recs[2][2]], False)
        self.assertEqual([r[2] for r in out], [recs[3][2]])
        out, _ = diag.new_records(recs, "2026-09-18 18:52:05.100", [recs[2][2], recs[3][2]], False)
        self.assertEqual(out, [])

    def test_luecke_nur_bei_vollem_fenster(self):
        recs = diag.parse_records(LOG)
        self.assertTrue(diag.new_records(recs, "2026-09-18 18:00:00.000", [], True)[1])
        self.assertFalse(diag.new_records(recs, "2026-09-18 18:00:00.000", [], False)[1])
        self.assertFalse(diag.new_records(recs, "2026-09-18 18:52:03.725", [], True)[1])

    def test_debuglog_schreibt_nur_neues(self):
        diag.fetch_log = lambda lines: LOG
        diag.cmd_debuglog([])
        diag.cmd_debuglog([])
        with open(os.path.join(diag.DIR, "dreame_debug-2026-09-18.log"), encoding="utf-8") as f:
            text = f.read()
        self.assertEqual(text.count("Property changed"), 2)
        self.assertEqual(text.count("Map render Failed"), 1)
        self.assertNotIn("etwas anderes", text)

    def test_aufbewahrung_loescht_nur_alte_tagesdateien(self):
        os.makedirs(diag.DIR)
        for name in ("heidi_diag-2026-08-01.jsonl", "dreame_debug-2026-08-01.log", "heidi_diag-2026-09-01.jsonl",
                     "dreame_debug-2026-09-01.log", "dreame_debug-2026-09-10.log", "debuglog_state.json", "notiz.txt"):
            open(os.path.join(diag.DIR, name), "w").close()
        diag.prune(datetime(2026, 9, 18))  # Zustände 30 Tage, Debuglog 14 Tage
        self.assertEqual(sorted(os.listdir(diag.DIR)), ["debuglog_state.json", "dreame_debug-2026-09-10.log",
                                                        "heidi_diag-2026-09-01.jsonl", "notiz.txt"])


if __name__ == "__main__":
    unittest.main()
