# Planer: Nachholen, Ausgehen-Prüfung und Räume nach manuellen Läufen ausnehmen

Status: **Analyse und Plan (Herbert, 15.09.2026), noch nichts eingebaut.** Backend-Thema (Automationen, Skripte,
`runlog.py`), unabhängig von der Karte v2. Entscheidung Herbert: Variante 1 (nachholen), aber nur innerhalb der
erlaubten Arbeitszeit; später Ausgehen-Prüfung anhand der Reinigungsdaten; später Räume ausnehmen, die kurz vorher
manuell gereinigt wurden. ClickUp: „Backend: Planer nachholen (Arbeitszeit), Ausgehen-Prüfung, Räume nach manuellem
Lauf ausnehmen“ (https://app.clickup.com/t/123ztrcv31v).

## Ist-Zustand (Automation `heidi_planer`, Skripte `heidi_plan_starten`/`heidi_reinigung`, `runlog.py`)

- Auslöser alle 10 min, bei Anwesenheitswechsel, genau zur Uhrzeit des heutigen Eintrags, bei Änderung von
  `sensor.heidi_heutiger_plan`. Bedingungen u. a.: Automatik an, kein Automatik-Lauf aktiv, nicht „stört“,
  heutiger Eintrag vorhanden und nicht erledigt, `jetzt ≥ zeit`, **`vacuum.heidi` = docked**, Akku ≥ Mindest-Akku,
  kein Fehler.
- Folge bei einem App-Lauf zur geplanten Zeit: Bedingung `docked` verhindert den Start; der 10-Minuten-Tick holt den
  Lauf nach, sobald Heidi wieder angedockt ist – **ohne Zeitlimit** (Variante 1 in Rohform).
- **Ausgehen-Prüfung gibt es schon:** Die Automation ruft `runlog.py schaetzung` (Lernwerte: min/m² je
  Modus+Saugstufe, Akku, Wäschen) für den vollen und den schnellen Lauf auf und vergleicht mit `rest_min`
  (Minuten bis zur erwarteten Rückkehr aus Prognose oder üblicher Rückkehr): `normal` wenn es voll ausgeht, sonst
  `schnell` wenn erlaubt und ausreichend, sonst `warten`. Ohne Lernwerte gilt die alte Regel (schnell unter
  `heidi_schnell_minuten`). Der Nachhol-Lauf läuft durch dieselbe Prüfung.
- `binary_sensor.heidi_arbeitszeit` = `input_datetime.heidi_arbeitszeit_start` … `_ende` (heute 08:00–17:00);
  wird für die Homeoffice-Erkennung genutzt („stört“-Person zu Hause während der Arbeitszeit = Homeoffice).
- `input_boolean.heidi_auto_lauf` unterscheidet Automatik-Läufe (an) von manuellen (App, v1/v2-Karte: aus).
- `runlog.py` bekommt bei jedem Lauf minütlich Zeilen (Phase, Raum `seg`, Fläche, Akku) und bildet daraus je Lauf
  Raum-Abschnitte (`segs`: Raum, Minuten, Fläche) → `sensor.heidi_lernwerte`. **Welche Räume ein Lauf wirklich
  gereinigt hat, steht also im Protokoll** (Raum mit Fläche > 0), nicht in `sensor.heidi_cleaning_history`
  (nur Summen).

## Ziel (drei Stufen)

### Stufe 1 – Nachholen nur innerhalb der Arbeitszeit (klein, sofort machbar)

- Zusätzliche Bedingung in `heidi_planer`: `binary_sensor.heidi_arbeitszeit` = on. Ein verspäteter Start nach
  Arbeitszeit-Ende unterbleibt; der Eintrag gilt für heute als übersprungen (nicht als erledigt – am nächsten Tag
  normal).
- Offen: Soll ein Eintrag, dessen **eigene** Uhrzeit außerhalb der Arbeitszeit liegt (z. B. Plan 3 „Küche nach dem
  Kochen“ 19:30, manuell), von der Bedingung ausgenommen werden? Vorschlag: Bedingung nur, wenn `jetzt > zeit + 10
  min` (also nur für das *Nachholen*), nicht für pünktliche Starts. Dann bleibt ein 19:30-Eintrag möglich.
- Umfang: eine Template-Bedingung; kein Helfer, Vertrag unverändert; `automation reload`.

### Stufe 2 – Ausgehen-Prüfung anhand der Reinigungsdaten (weitgehend vorhanden)

- Vorhanden: Dauer voll/schnell aus Lernwerten gegen `rest_min` (Rückkehr). Ergänzung für das Nachholen: zusätzlich
  gegen das **Arbeitszeit-Ende** prüfen (`min(rest_min, Minuten bis arbeitszeit_ende)`), damit ein Lauf nicht in den
  Feierabend hineinläuft, auch wenn die Prognose eine spätere Rückkehr meldet.
- Ergänzung: Nachladen einrechnen (die Schätzung kennt Ladestopps schon: `charges`); Akku-Mindestwert bleibt.
- Umfang: eine Variable und ein `min()` in `heidi_planer`; Anzeige in der Karte (Automatik-Kachel: „wartet – geht
  sich vor 17:00 nicht mehr aus“) kommt mit 4.9 über `rest_quelle`/`detail`, kein neuer Helfer.

### Stufe 3 – Räume ausnehmen, die kurz vorher manuell gereinigt wurden (neu)

Regel (Herbert): Manuell läuft immer genau das, was gewählt wurde. Kommt danach innerhalb eines Zeitlimits
(Vorschlag 2 h ab Ende des manuellen Laufs) ein geplanter Lauf, werden die gerade gereinigten Räume ausgenommen.

1. **Datenquelle „letzter Lauf“** – `runlog.py lernwerte` liefert zusätzlich `letzter_lauf`:
   `{ "ende": ISO-Zeit (letzte Zeile mit vac ∈ cleaning/paused/returning), "raeume": [IDs mit Fläche > 0],
   "manuell": auto_lauf war aus, "flaeche_je_raum": {…} }` → Attribut von `sensor.heidi_lernwerte`
   (bestehender Sensor, kein neuer Helfer). „Fährt durch“ zählt nicht (Fläche 0 im Raum).
2. **Planer** (`heidi_planer`, Variable vor der Schätzung): wenn `letzter_lauf.manuell` und
   `jetzt − ende ≤ 2 h`: `raeume_effektiv = raeume des Eintrags − letzter_lauf.raeume`.
   - `raeume_effektiv` leer → Eintrag heute als **erledigt** markieren (wie nach einem Automatik-Lauf), Toast/Log
     „übersprungen: alle Räume gerade manuell gereinigt“.
   - sonst Schätzung **und** Start mit `raeume_effektiv`; `input_text.heidi_lauf_reihenfolge` entsprechend.
3. **Skript** `heidi_plan_starten` bekommt ein optionales Feld `raeume` (überschreibt die Räume des Eintrags);
   `heidi_reinigung` bleibt unverändert (bekommt schon eine Raumliste).
4. **Zeitlimit** zunächst Konstante 2 h in der Automation; ein Helfer `input_number.heidi_nachhol_stunden` erst,
   wenn er in der Karte (Einstellungen) sichtbar sein soll – dann Aufnahme in den Entitäts-Vertrag (Abschnitt 4).
5. **Modus-Frage:** Zählt „Saugen“ manuell als erledigt, wenn der Plan „Saugen + Wischen“ will? Vorschlag: nur
   ausnehmen, wenn der manuelle Modus den geplanten abdeckt (Saugen+Wischen deckt Saugen ab, nicht umgekehrt);
   Modus je Raum steht im Protokoll (`sel.cleaning_mode` in den Zeilen). Herbert entscheidet.

## Grenzfälle

- App-Lauf „ganze Wohnung“ um 09:00, Plan 09:30 alle Räume: nach Ende (≈ 10:10) alle Räume ausgenommen → Eintrag
  erledigt, kein zweiter Lauf. Gewünscht.
- App-Lauf nur Küche 18:00, Plan 3 „Küche nach dem Kochen“ 19:30: Küche ausgenommen, Flur bleibt → Lauf nur Flur.
- Manueller Lauf länger als 2 h her: Plan läuft komplett (Nachholen nur innerhalb Arbeitszeit, Stufe 1).
- Manueller Lauf abgebrochen (`completed: false`, wie heute 08:53): nur Räume mit Fläche > 0 gelten als gereinigt.
- Abzug „Räume“ ≠ Karte: Raum 8 (Balkon, versteckt) taucht in `active_segments` auf, hat aber nie Fläche → nie in
  `letzter_lauf.raeume`.

## Einordnung und Reihenfolge

- Alles Backend; die Karte v2 zeigt die Entscheidungen nur an (Automatik-Kachel 4.9: `detail`/`rest_quelle`,
  Zeile „Räume ausgenommen: Küche“ als kleine Ergänzung nach 4.9, PD-Eintrag).
- Stufe 1 kann jederzeit als eigener kleiner Backend-Schritt kommen (Herbert sagt Bescheid). Stufe 2 mit Stufe 1.
  Stufe 3 nach 6.5 oder in einer ruhigen Phase des Kartenbaus – braucht `runlog.py`-Änderung + pytest (2.7).
- Regeln: keine neuen Helfer außer bei Bedarf (Stufe 3.4, dann Abschnitt 4), v1 unangetastet, jede Änderung mit
  `check_config` und Reload statt Neustart.
