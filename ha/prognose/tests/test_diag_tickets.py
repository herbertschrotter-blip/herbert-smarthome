"""Bauplan F.2a (DX-069): Tickets HT-NNNN – ein Ticket je Problem, Zählen ohne Doppelte, Wiederöffnen, Status, Schreibweg.

Nur Standardbibliothek:  cd ha/prognose && python -m unittest discover -s tests -p "test_diag*.py"
"""
import base64
import contextlib
import io
import json
import os
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import diag  # noqa: E402
import diag_tickets as T  # noqa: E402


def fund(regel="T4", sig="map: Fehler", schwere="fehler", von="2026-09-18T09:00:00.000", bis=None, **k):
    return dict({"regel": regel, "schwere": schwere, "signatur": "%s|%s" % (regel, sig), "titel": "Titel " + sig, "text": "Text",
                 "von": von, "bis": bis or von, "zeilen": [von], "suchen": []}, **k)


def b64(obj):
    return base64.b64encode(json.dumps(obj).encode("utf-8")).decode("ascii")


class TicketLogik(unittest.TestCase):
    def test_ein_ticket_je_problem_und_kein_doppeltes_zaehlen(self):
        s = T.leer()
        r = T.aufnehmen(s, [fund(anzahl=37), fund(regel="A7", sig="fortschritt", schwere="hinweis"), fund(regel="T1", sig="extern", schwere="info")], "2026-09-18", "2026-09-18T10:00:00")
        self.assertEqual(r["neu"], ["HT-0001", "HT-0002"])  # Info erzeugt kein Ticket
        self.assertEqual(s["tickets"][0]["anzahl"], 37)
        r = T.aufnehmen(s, [fund(anzahl=37)], "2026-09-18", "2026-09-18T10:10:00")  # dieselbe Auswertung noch einmal
        self.assertEqual((r["neu"], r["gezaehlt"], s["tickets"][0]["anzahl"]), ([], [], 37))
        r = T.aufnehmen(s, [fund(anzahl=40, bis="2026-09-18T11:00:00.000")], "2026-09-18", "2026-09-18T11:10:00")
        self.assertEqual((r["gezaehlt"], s["tickets"][0]["anzahl"], s["tickets"][0]["zuletzt"]), (["HT-0001"], 40, "2026-09-18T11:00:00.000"))
        T.aufnehmen(s, [fund(anzahl=5, von="2026-09-19T08:00:00.000")], "2026-09-19", "2026-09-19T08:10:00")
        self.assertEqual(s["tickets"][0]["anzahl"], 45)
        self.assertEqual(len(s["tickets"]), 2)

    def test_beweise_nur_beim_anlegen(self):
        s, rufe = T.leer(), []
        T.aufnehmen(s, [fund()], "2026-09-18", "x", lambda f: rufe.append(1) or {"zeitleiste": ["a"]})
        T.aufnehmen(s, [fund(anzahl=2)], "2026-09-18", "x", lambda f: rufe.append(1) or {})
        self.assertEqual((len(rufe), s["tickets"][0]["beweise"]), (1, {"zeitleiste": ["a"]}))

    def test_status_ablauf_und_pflichtangaben(self):
        s = T.leer()
        T.aufnehmen(s, [fund()], "2026-09-18", "2026-09-18T10:00:00")
        for status, kw in (("angenommen", {}), ("geloest", {}), ("verworfen", {}), ("erledigt", {})):
            with self.assertRaises(ValueError):
                T.setze_status(s, "HT-0001", status, "t", **kw)
        with self.assertRaises(ValueError):
            T.setze_status(s, "HT-0099", "in_arbeit", "t")
        T.setze_status(s, "ht-0001", "angenommen", "2026-09-18T10:05:00", wer="Claude", dx="DX-080")
        T.setze_status(s, "HT-0001", "in_arbeit", "2026-09-18T10:06:00")
        t = T.setze_status(s, "HT-0001", "geloest", "2026-09-18T12:00:00", commit="abc1234", version="2.0.0-alpha.40")
        self.assertEqual((t["dx"], t["commit"], t["version"], t["geloest_am"]), ("DX-080", "abc1234", "2.0.0-alpha.40", "2026-09-18T12:00:00"))
        self.assertEqual([v["status"] for v in t["verlauf"]], ["neu", "angenommen", "in_arbeit", "geloest"])
        self.assertEqual(T.zaehler(s), {"neu": 0, "in_arbeit": 0, "geloest": 1})

    def test_wieder_aufgetreten_oeffnet_neu_verworfen_bleibt(self):
        s = T.leer()
        T.aufnehmen(s, [fund(), fund(regel="A6", sig="akku", schwere="hinweis")], "2026-09-18", "2026-09-18T10:00:00")
        T.setze_status(s, "HT-0001", "geloest", "2026-09-18T12:00:00", commit="abc")
        T.setze_status(s, "HT-0002", "verworfen", "2026-09-18T12:00:00", grund="Test-Ereignis von Claude")
        r = T.aufnehmen(s, [fund(bis="2026-09-18T11:59:00.000", anzahl=2)], "2026-09-18", "2026-09-18T12:10:00")  # vor „gelöst“ → bleibt gelöst
        self.assertEqual((r["wieder"], T.finde(s, "HT-0001")["status"]), ([], "geloest"))
        r = T.aufnehmen(s, [fund(von="2026-09-19T08:00:00.000"), fund(regel="A6", sig="akku", schwere="hinweis", von="2026-09-19T08:00:00.000")], "2026-09-19", "2026-09-19T08:10:00")
        t = T.finde(s, "HT-0001")
        self.assertEqual((r["wieder"], t["status"], t["wieder"]), (["HT-0001"], "neu", 1))
        self.assertIn("wieder aufgetreten", t["verlauf"][-1]["text"])
        self.assertEqual(T.finde(s, "HT-0002")["status"], "verworfen")

    def test_meldung_notiz_liste_text(self):
        s = T.leer()
        with self.assertRaises(ValueError):
            T.melden(s, "  ", "t")
        t = T.melden(s, "Kopf zeigt Bereit, Heidi fährt aber", "2026-09-18T20:49:02.118", wer="Herbert", stichworte=["Anzeige stimmt nicht"],
                     meta={"seite": "start"}, beweise={"fenster": "20:48 – 20:50", "zeitleiste": ["20:48:13  Benutzer Herbert  Dienst vacuum.start"], "suchen": ["selectors.ts"]})
        T.melden(s, "zweite", "2026-09-18T21:00:00.000")
        self.assertEqual((t["nr"], t["quelle"], t["status"]), ("HT-0001", "meldung", "neu"))
        T.notiz(s, "HT-0001", "tritt nur nach App-Start auf", "2026-09-18T21:05:00", wer="Herbert")
        self.assertEqual([x["nr"] for x in T.liste(s)], ["HT-0002", "HT-0001"])
        self.assertEqual(T.liste(s, "geloest"), [])
        text = T.als_text(T.finde(s, "HT-0001"), "projekt x")
        for teil in ("TICKET   HT-0001", "Meldung von Herbert", "ZEITLEISTE", "vacuum.start", "WO SUCHEN", "NOTIZEN", "nichts automatisch"):
            self.assertIn(teil, text)


class TicketSchreibweg(unittest.TestCase):
    """diag.py: Meldung → Ticket, auswertung → Tickets, ticket-Befehle, tail."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        diag.DIR = os.path.join(self.tmp.name, "diag")
        diag.STATE, diag.CTX = os.path.join(diag.DIR, "s.json"), os.path.join(diag.DIR, "c.json")
        diag.TICKETS, diag.LOCK = os.path.join(diag.DIR, "tickets.json"), os.path.join(diag.DIR, "tickets.lock")

    def tearDown(self):
        self.tmp.cleanup()

    def ruf(self, fn, *args):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            fn(list(args))
        return json.loads(buf.getvalue())

    def test_meldung_wird_ticket_mit_beweisen(self):
        diag.cmd_log([b64({"ts": "2026-09-18T20:48:13.783", "art": "dienst", "dienst": "vacuum.start", "daten": {"entity_id": "vacuum.heidi"}, "user_id": "u", "wer": "Herbert", "ctx": "1"})])
        diag.cmd_log([b64({"ts": "2026-09-18T20:49:02.118", "art": "meldung", "text": "Kopf zeigt Bereit", "stichworte": ["Anzeige"], "seite": "dev", "version": "t",
                           "client": "c1", "werte": {"kopf": "Bereit"}, "user_id": "u", "wer": "Herbert", "ctx": "2"})])
        with open(os.path.join(diag.DIR, "heidi_diag-2026-09-18.jsonl"), encoding="utf-8") as f:
            zeile = json.loads(f.read().splitlines()[-1])
        self.assertEqual(zeile["ticket"], "HT-0001")
        r = self.ruf(diag.cmd_ticket, b64({"cmd": "zeige", "nr": "HT-0001"}))
        self.assertTrue(r["ok"])
        self.assertEqual(r["ticket"]["meta"]["zeigt_kopf"], "Bereit")
        self.assertIn("vacuum.start", "\n".join(r["ticket"]["beweise"]["zeitleiste"]))
        self.assertFalse(os.path.exists(diag.LOCK))

    def test_ticket_befehle_und_fehler_als_json(self):
        diag.cmd_log([b64({"ts": "2026-09-18T20:49:02.118", "art": "meldung", "text": "x", "user_id": "u", "ctx": "2"})])
        self.assertEqual(self.ruf(diag.cmd_ticket, b64({"cmd": "liste"}))["zaehler"]["neu"], 1)
        r = self.ruf(diag.cmd_ticket, b64({"cmd": "status", "nr": "HT-0001", "status": "geloest"}))
        self.assertEqual((r["ok"], "Commit" in r["fehler"]), (False, True))
        r = self.ruf(diag.cmd_ticket, b64({"cmd": "verwerfen", "nr": "HT-0001", "grund": "nur ein Test"}))
        self.assertEqual(r["ticket"]["status"], "verworfen")
        self.assertEqual(self.ruf(diag.cmd_ticket, b64({"cmd": "liste"}))["tickets"], [])
        self.assertFalse(self.ruf(diag.cmd_ticket, b64({"cmd": "gibtsnicht"}))["ok"])

    def test_tail_liefert_die_letzten_zeilen(self):
        from datetime import datetime
        tag = datetime.now().strftime("%Y-%m-%d")
        for i in range(5):
            diag.cmd_log([b64({"ts": "%sT10:00:0%d.000" % (tag, i), "art": "dienst", "dienst": "d%d" % i, "ctx": str(i)})])
        r = self.ruf(diag.cmd_tail, b64({"n": 2}))
        self.assertEqual(([z["dienst"] for z in r["zeilen"]], r["aelter"]), (["d3", "d4"], True))
        r = self.ruf(diag.cmd_tail, b64({"n": 10, "vor": "%sT10:00:02.000" % tag}))
        self.assertEqual(([z["dienst"] for z in r["zeilen"]], r["aelter"]), (["d0", "d1"], False))


if __name__ == "__main__":
    unittest.main()
