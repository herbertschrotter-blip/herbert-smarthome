"""Bauplan F.2a (DX-069): diag_regeln.py – je Regel ein Fall und eine Gegenprobe (unauffällige Daten bleiben still).

Nur Standardbibliothek:  cd ha/prognose && python -m unittest discover -s tests -p "test_diag*.py"
"""
import os
import sys
import unittest
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import diag_regeln as R  # noqa: E402

T0 = datetime(2026, 9, 18, 9, 0, 0)
VAC = "vacuum.heidi"


def ts(sek):
    return (T0 + timedelta(seconds=sek)).isoformat(timespec="milliseconds")


def z(sek, ent, alt, neu, attr=None, **k):
    return dict({"ts": ts(sek), "art": "zustand", "ent": ent, "alt": alt, "neu": neu, "attr": attr or {}, "quelle": "extern"}, **k)


def dienst(sek, name, daten=None, **k):
    return dict({"ts": ts(sek), "art": "dienst", "dienst": name, "daten": daten or {"entity_id": VAC}, "quelle": "benutzer", "wer": "Herbert"}, **k)


def karte(sek, client="c1", **werte):
    extra = {k: werte.pop(k) for k in ("puls", "ende") if k in werte}
    return dict({"ts": ts(sek), "art": "anzeige", "client": client, "seite": "start", "version": "t", "werte": werte}, **extra)


def regeln(zeilen, debug=None, nach=700):
    return [f["regel"] for f in R.auswerten(zeilen, debug, jetzt=T0 + timedelta(seconds=nach))]


def funde(zeilen, regel, **k):
    return [f for f in R.auswerten(zeilen, jetzt=T0 + timedelta(seconds=k.get("nach", 700))) if f["regel"] == regel]


START = [z(0, VAC, "unknown", "docked"), z(1, "sensor.heidi_battery_level", "unknown", "100")]
LAUF = START + [dienst(10, "vacuum.start"), z(11, VAC, "docked", "cleaning", quelle="benutzer", wer="Herbert")]


class AnzeigeRegeln(unittest.TestCase):
    def test_a1_zustand_falsch_und_gegenprobe_korrektur(self):
        self.assertEqual(len(funde(LAUF + [karte(12, zustand="docked", kopf="Angedockt")], "A1")), 1)
        self.assertEqual(funde(LAUF + [karte(12, zustand="docked", kopf="Angedockt"), karte(14, zustand="cleaning", kopf="Reinigt")], "A1"), [])

    def test_a1_verfaellt_wenn_der_roboter_nachzieht(self):
        # Karte meldet „docked“, der Roboter ist 3 s später wirklich angedockt → kein Fund
        self.assertEqual(funde(LAUF + [karte(12, zustand="docked", kopf="x"), z(15, VAC, "cleaning", "docked")], "A1"), [])

    def test_a1_arbeitsschritt(self):
        phase = [z(12, "sensor.heidi_phase", "Angedockt", "Saugt Küche")]
        self.assertEqual(len(funde(LAUF + phase + [karte(30, zustand="cleaning", kopf="Reinigt", schritt="Saugt Flur")], "A1")), 1)
        self.assertEqual(funde(LAUF + phase + [karte(30, zustand="cleaning", kopf="Tägliches Saugen", schritt="Saugt Küche")], "A1"), [])

    def test_a2_werte_raum_und_global(self):
        raum = [z(2, "switch.heidi_customized_cleaning", "unknown", "on"), z(3, "select.heidi_room_6_suction_level", "unknown", "turbo"),
                z(3, "select.heidi_room_6_cleaning_mode", "unknown", "sweeping")]
        im_lauf = [z(12, VAC, "cleaning", "cleaning", {"current_segment": [None, 6]}), z(12, "select.heidi_room_6_suction_level", "turbo", "unavailable")]
        k = dict(zustand="cleaning", modus_ha="sweeping", wasser_ha="moist")
        self.assertEqual(len(funde(LAUF[:2] + raum + LAUF[2:] + im_lauf + [karte(30, saug_ha="standard", **k)], "A2")), 1)
        self.assertEqual(funde(LAUF[:2] + raum + LAUF[2:] + im_lauf + [karte(30, saug_ha="turbo", **k)], "A2"), [])
        # Start in der App schaltet „Angepasste Reinigung“ aus → es gelten die globalen Werte
        app = raum + [z(9, "switch.heidi_customized_cleaning", "on", "off"), z(9, VAC, "docked", "docked", {"suction_level": [None, "Quiet"], "cleaning_mode": [None, "Sweeping"]})]
        f = funde(LAUF[:2] + app + LAUF[2:] + im_lauf + [karte(30, saug_ha="turbo", **k)], "A2")
        self.assertEqual(len(f), 1)
        self.assertIn("quiet", f[0]["titel"])

    def test_a3_reihenfolge(self):
        fahrt = [z(12, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[6, 4]"], "current_segment": [None, 4]}),
                 z(200, VAC, "cleaning", "cleaning", {"current_segment": [4, 6]}), z(400, VAC, "cleaning", "docked")]
        self.assertEqual(len(funde(LAUF + [karte(13, zustand="cleaning", reihenfolge=[6, 4])] + fahrt, "A3", nach=1200)), 1)
        self.assertEqual(funde(LAUF + [karte(13, zustand="cleaning", reihenfolge=[4, 6])] + fahrt, "A3", nach=1200), [])

    def test_a4_raum_durchfahren_zaehlt_nicht(self):
        seg = [z(12, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[6]"], "current_segment": [None, 6]})]
        self.assertEqual(len(funde(LAUF + seg + [karte(30, zustand="cleaning", jetzt=4)], "A4")), 1)
        self.assertEqual(funde(LAUF + seg + [karte(30, zustand="cleaning", jetzt=6)], "A4"), [])
        durch = [z(12, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[6]"], "current_segment": [None, 4]})]
        self.assertEqual(funde(LAUF + durch + [karte(30, zustand="cleaning", jetzt=6)], "A4"), [])

    def test_a5_knoepfe(self):
        self.assertEqual(len(funde(LAUF + [karte(30, zustand="cleaning", knoepfe=["start", "locate"])], "A5")), 1)
        self.assertEqual(funde(LAUF + [karte(30, zustand="cleaning", knoepfe=["pause", "stop", "return_to_base"])], "A5"), [])
        # HT-0004: die Automation liefert Listen als Text – gleiche Knöpfe dürfen dann kein Fund sein
        self.assertEqual(funde(START + [karte(30, zustand="docked", knoepfe="['start', 'locate']")], "A5"), [])
        self.assertEqual(len(funde(START + [karte(30, zustand="docked", knoepfe="['pause', 'stop']")], "A5")), 1)

    def test_a6_akku_und_laden(self):
        laden = [z(2, VAC, "docked", "docked", {"charging": [None, True]})]
        self.assertEqual(len(funde(START + laden + [karte(30, zustand="docked", akku=97, laden=False)], "A6")), 2)
        self.assertEqual(funde(START + laden + [karte(30, zustand="docked", akku=100, laden=True)], "A6"), [])

    def test_a7_fortschritt_ausserhalb_des_laufs(self):
        self.assertEqual(len(funde(START + [karte(30, zustand="docked", fortschritt=0)], "A7")), 1)
        self.assertEqual(funde(START + [karte(30, zustand="docked", fortschritt=None)], "A7"), [])
        self.assertEqual(funde(LAUF + [karte(30, zustand="cleaning", fortschritt=37)], "A7"), [])

    def test_a8_station_still_ohne_feld(self):
        wasch = [z(2, VAC, "docked", "docked", {"washing": [False, True]})]
        self.assertEqual(len(funde(START + wasch + [karte(30, zustand="docked", station="ruhe")], "A8")), 1)
        self.assertEqual(funde(START + wasch + [karte(30, zustand="docked", station="waescht")], "A8"), [])
        self.assertEqual(funde(START + wasch + [karte(30, zustand="docked")], "A8"), [])  # Baustein fehlt noch → Regel bleibt still

    def test_a8_absaugen_nur_bei_active(self):
        # HT-0007: der Absaug-Sensor kennt idle, active, not_performed – nur active heißt „saugt ab“
        nicht = [z(2, "sensor.heidi_auto_empty_status", "idle", "not_performed")]
        self.assertEqual(funde(START + nicht + [karte(30, zustand="docked", station="ruhe")], "A8"), [])
        self.assertEqual(len(funde(START + nicht + [karte(30, zustand="docked", station="saugt_ab")], "A8")), 1)
        aktiv = [z(2, "sensor.heidi_auto_empty_status", "idle", "active")]
        self.assertEqual(funde(START + aktiv + [karte(30, zustand="docked", station="saugt_ab")], "A8"), [])

    def test_a9_warnung_ohne_chip(self):
        warn = [z(2, "sensor.heidi_error", "no_error", "dust_bag_full")]
        self.assertEqual(len(funde(START + warn + [karte(30, zustand="docked", hinweis="")], "A9")), 1)
        self.assertEqual(funde(START + warn + [karte(30, zustand="docked", hinweis="Staubbeutel voll")], "A9"), [])

    def test_a10_nur_mit_lebenszeichen(self):
        still = [karte(5, zustand="docked", puls=True), z(60, VAC, "docked", "idle"), karte(200, zustand="idle", puls=True)]
        self.assertEqual(len(funde(START + still, "A10")), 1)
        ohne = [karte(5, zustand="docked"), z(60, VAC, "docked", "idle"), karte(200, zustand="idle")]
        self.assertEqual(funde(START + ohne, "A10"), [])
        zu = [karte(5, zustand="docked", puls=True), karte(6, zustand="docked", ende=True), z(60, VAC, "docked", "idle"), karte(200, zustand="idle", puls=True)]
        self.assertEqual(funde(START + zu, "A10"), [])

    def test_geschlossenes_fenster_macht_keinen_fund(self):
        # letzte Meldung passte; danach ändert sich der Roboter, die Karte ist zu → nichts
        self.assertEqual(regeln(START + [karte(5, zustand="docked", akku=100), dienst(50, "vacuum.start"), z(51, VAC, "docked", "cleaning", quelle="benutzer")]), [])


class BedienungUndPlaner(unittest.TestCase):
    def test_b1_dienst_ohne_wirkung(self):
        self.assertEqual(len(funde(START + [dienst(10, "vacuum.start")], "B1")), 1)
        self.assertEqual(funde(LAUF, "B1"), [])
        self.assertEqual(funde(START + [dienst(10, "vacuum.locate")], "B1"), [])

    def test_b2_gewaehlte_raeume(self):
        ruf = [dienst(10, "dreame_vacuum.vacuum_clean_segment", {"entity_id": VAC, "segments": "[6, 4]"}), z(11, VAC, "docked", "cleaning", quelle="benutzer")]
        self.assertEqual(len(funde(START + ruf + [z(13, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[6]"]})], "B2")), 1)
        self.assertEqual(funde(START + ruf + [z(13, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[4, 6]"]})], "B2"), [])

    def test_b3_planer_startet_ohne_start(self):
        sagt = [z(10, "sensor.heidi_automatik_status", "wartet", "„Tägliches Saugen“ startet")]
        self.assertEqual(len(funde(START + sagt, "B3")), 1)
        self.assertEqual(funde(START + sagt + [z(40, VAC, "docked", "cleaning", quelle="automation", durch="Heidi: Planer")], "B3"), [])

    def test_b4_b6_b7_nach_dem_lauf(self):
        auto = [z(5, "input_boolean.heidi_auto_lauf", "off", "on"), z(6, "input_text.heidi_raum_snapshot", "", "1:S/T/-/-/1"),
                z(7, "switch.heidi_customized_cleaning", "on", "off")]
        ende = [z(300, VAC, "cleaning", "docked")]
        r = regeln(START + auto + LAUF[2:] + ende, nach=1200)
        self.assertEqual(sorted(x for x in r if x in ("B4", "B6", "B7")), ["B4", "B6", "B7"])
        gut = ende + [z(360, "input_datetime.heidi_letzte_auto_reinigung", "2026-09-17", "2026-09-18"), z(361, "input_text.heidi_raum_snapshot", "1:S/T/-/-/1", ""),
                      z(700, "switch.heidi_customized_cleaning", "off", "on")]
        r = regeln(START + auto + LAUF[2:] + gut, nach=1200)
        self.assertEqual([x for x in r if x in ("B4", "B6", "B7")], [])

    def test_b5_planer_zu_frueh_oder_trotz_stoerer(self):
        plan = [z(2, "sensor.heidi_heutiger_plan", "0", "1", {"zeit": [None, "09:30"], "stoerer": [None, "['nicole']"]})]
        start = [z(11, VAC, "docked", "cleaning", quelle="automation", durch="Heidi: Planer")]
        self.assertEqual(sorted(f["signatur"] for f in funde(START + plan + start, "B5")), ["B5|stoerer", "B5|zeit"])
        ok = [z(2, "sensor.heidi_heutiger_plan", "0", "1", {"zeit": [None, "09:00"], "stoerer": [None, "[]"]})]
        self.assertEqual(funde(START + ok + start, "B5"), [])

    def test_b8_schaetzung(self):
        lauf = LAUF + [karte(12, zustand="cleaning", schaetzung_min=20), z(11 + 45 * 60, VAC, "cleaning", "docked")]
        self.assertEqual(len(funde(lauf, "B8", nach=4000)), 1)
        passt = LAUF + [karte(12, zustand="cleaning", schaetzung_min=40), z(11 + 45 * 60, VAC, "cleaning", "docked")]
        self.assertEqual(funde(passt, "B8", nach=4000), [])


class RoboterUndTechnik(unittest.TestCase):
    def test_t1_extern_ist_nur_info(self):
        f = funde(START + [z(11, VAC, "docked", "cleaning")], "T1")
        self.assertEqual([x["schwere"] for x in f], ["info"])
        self.assertEqual(funde(LAUF, "T1"), [])
        # Roboter meldet spät (Kontext weg), aber der Dienstaufruf steht im Protokoll → nicht extern
        self.assertEqual(funde(START + [dienst(10, "vacuum.start"), z(25, VAC, "docked", "cleaning")], "T1"), [])

    def test_startfolge_ist_kein_zweiter_start(self):
        """Heidi meldet beim Losfahren cleaning→docked→idle→cleaning (< 45 s): ein Lauf, kein „externer“ Start, kein vorzeitiges Laufende."""
        folge = LAUF + [z(22, VAC, "cleaning", "docked"), z(23, VAC, "docked", "idle"), z(29, VAC, "idle", "cleaning")]
        self.assertEqual(funde(folge, "T1"), [])
        # Reihenfolge wird über den Halt hinweg gemerkt und erst am echten Ende beurteilt
        lauf = folge[:4] + [karte(12, zustand="cleaning", reihenfolge=[6, 4])] + folge[4:] + [
            z(40, VAC, "cleaning", "cleaning", {"active_segments": ["[]", "[6, 4]"], "current_segment": [None, 4]}),
            z(200, VAC, "cleaning", "cleaning", {"current_segment": [4, 6]}), z(400, VAC, "cleaning", "docked")]
        self.assertEqual(len(funde(lauf, "A3", nach=1200)), 1)
        # ein Halt über 45 s ist ein echtes Ende – der nächste Start ohne HA-Aufruf ist extern
        spaet = LAUF + [z(22, VAC, "cleaning", "docked"), z(200, VAC, "docked", "cleaning")]
        self.assertEqual(len(funde(spaet, "T1")), 1)

    def test_t2_warnung_und_fehler(self):
        f = funde(START + [z(5, "sensor.heidi_error", "no_error", "dust_bag_full")], "T2")
        self.assertEqual([x["schwere"] for x in f], ["hinweis"])
        f = funde(START + [z(4, VAC, "docked", "docked", {"has_error": [False, True]}), z(5, "sensor.heidi_error", "no_error", "robot_stuck")], "T2")
        self.assertEqual([x["schwere"] for x in f], ["fehler"])
        self.assertEqual(funde(START + [z(5, "sensor.heidi_error", "dust_bag_full", "no_error")], "T2"), [])

    def test_t3_nicht_erreichbar(self):
        self.assertEqual(len(funde(START + [z(10, VAC, "docked", "unavailable")], "T3", nach=900)), 1)
        self.assertEqual(funde(START + [z(10, VAC, "docked", "unavailable"), z(100, VAC, "unavailable", "docked")], "T3", nach=900), [])

    def test_t4_t5_debuglog(self):
        log = ["2026-09-18 09:00:01.000 ERROR (MainThread) [custom_components.dreame_vacuum.dreame.map] Map render Failed: Traceback (most recent call last):",
               '  File "/config/custom_components/dreame_vacuum/dreame/map.py", line 5012, in render', "    or self.area != other.area",
               "AttributeError: 'Segment' object has no attribute 'area'", "s6-rc: info: service legacy-services: stopping",
               "2026-09-18 09:00:02.000 DEBUG (Thread-5 (_client_task)) [custom_components.dreame_vacuum.dreame.device] Device update: 5",
               "2026-09-18 09:05:01.000 ERROR (MainThread) [custom_components.dreame_vacuum.dreame.map] Map render Failed: Traceback (most recent call last):",
               '  File "/config/custom_components/dreame_vacuum/dreame/map.py", line 4999, in render', "AttributeError: 'Segment' object has no attribute 'area'",
               "# Lücke möglich: Fenster von 3000 Zeilen reicht nicht bis 2026-09-18 09:04:00.000 zurück"]
        f = R.auswerten(START, log, jetzt=T0 + timedelta(seconds=700))
        t4 = [x for x in f if x["regel"] == "T4"]
        self.assertEqual([(x["anzahl"], x["signatur"]) for x in t4], [(2, "T4|map: AttributeError: 'Segment' object has no attribute 'area'")])
        self.assertEqual(len([x for x in f if x["regel"] == "T5"]), 1)
        self.assertEqual(R.auswerten(START, [log[5]], jetzt=T0 + timedelta(seconds=700)), [])

    def test_unauffaelliger_tag_bleibt_still(self):
        tag = LAUF + [karte(12, zustand="cleaning", kopf="Reinigt", akku=100, hinweis="", fortschritt=3, knoepfe=["pause", "stop", "return_to_base"]),
                      z(600, VAC, "cleaning", "returning"), z(660, VAC, "returning", "docked"), karte(661, zustand="docked", kopf="Angedockt", akku=100, fortschritt=None)]
        self.assertEqual(regeln(tag, nach=2000), [])

    def test_filter_ab(self):
        f = R.auswerten(START + [dienst(10, "vacuum.start")], jetzt=T0 + timedelta(seconds=700), ab="2026-09-19")
        self.assertEqual(f, [])


if __name__ == "__main__":
    unittest.main()
