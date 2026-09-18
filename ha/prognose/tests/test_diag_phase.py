"""HT-0007 (DX-072): die Vorlage von sensor.heidi_phase aus packages/heidi.yaml mit echten Fällen durchrechnen.

Der Kopftext der Übersicht kommt aus dieser Vorlage. Der Test liest sie aus der Paketdatei (kein Abschreiben) und rechnet
sie mit jinja2 und nachgebauten Zuständen aus. jinja2 gibt es im HA-Container (Dienst shell_command.heidi_diag_test);
fehlt es auf dem PC, wird der Test übersprungen.
"""
import os
import re
import unittest

try:
    import jinja2
except ImportError:  # auf dem PC ohne jinja2
    jinja2 = None

HERE = os.path.dirname(os.path.abspath(__file__))
PAKET = os.path.join(HERE, "..", "..", "packages", "heidi.yaml")


def vorlage(unique_id):
    """Text hinter `state: >-` des Vorlagen-Sensors mit dieser unique_id (Folgezeilen mit größerem Einzug)."""
    with open(PAKET, encoding="utf-8") as f:
        zeilen = f.read().splitlines()
    i = next(n for n, z in enumerate(zeilen) if z.strip() == "unique_id: " + unique_id)
    i = next(n for n in range(i, len(zeilen)) if re.match(r"\s*state: >-\s*$", zeilen[n]))
    einzug = len(zeilen[i]) - len(zeilen[i].lstrip())
    out = []
    for z in zeilen[i + 1:]:
        if z.strip() and len(z) - len(z.lstrip()) <= einzug:
            break
        out.append(z.strip())
    return " ".join(out)


class _Obj(object):
    def __init__(self, **k):
        self.__dict__.update(k)


class Zustaende(object):
    """Nachbau von `states`: aufrufbar (`states('x')`) und mit `states.vacuum.heidi.attributes`."""

    def __init__(self, werte, attribute):
        self._werte = werte
        self.vacuum = _Obj(heidi=_Obj(attributes=attribute))

    def __call__(self, ent):
        return self._werte.get(ent, "unknown")


def phase(absaugen, vac="docked", status="sleeping", **attribute):
    werte = {"vacuum.heidi": vac, "sensor.heidi_auto_empty_status": absaugen, "sensor.heidi_status": status,
             "sensor.heidi_task_status": "completed", "sensor.heidi_current_room": "unknown"}
    return jinja2.Environment().from_string(vorlage("heidi_phase")).render(states=Zustaende(werte, attribute)).strip()


@unittest.skipIf(jinja2 is None, "jinja2 fehlt (läuft auf dem Pi)")
class PhaseVorlage(unittest.TestCase):
    def test_ht0007_not_performed_ist_kein_absaugen(self):
        # Fall aus dem Ticket: in der Station, 100 %, Absaug-Sensor „not_performed“ → nicht „Saugt Staub ab“
        self.assertEqual(phase("not_performed"), "Schläft")
        self.assertEqual(phase("not_performed", status="charging_completed"), "Angedockt")
        self.assertEqual(phase("not_performed", charging=True), "Lädt")

    def test_active_saugt_ab_und_ruhe(self):
        self.assertEqual(phase("active"), "Saugt Staub ab")
        self.assertEqual(phase("idle", charging=True), "Lädt")
        self.assertEqual(phase("unavailable"), "Schläft")

    def test_rangfolge_bleibt(self):
        self.assertEqual(phase("active", drying=True), "Trocknet Mopp")  # Trocknen steht vor dem Absaugen
        self.assertEqual(phase("not_performed", vac="returning"), "Fährt zur Station")


if __name__ == "__main__":
    unittest.main()
