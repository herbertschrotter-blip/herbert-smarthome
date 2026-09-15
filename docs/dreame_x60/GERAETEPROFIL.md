# Geräteprofil – die Karte für andere Roboter (Herbert, 15.09.2026: „ich will, dass die App auch für andere Roboter funktioniert“)

Ziel: Die Karte v2 läuft ohne Codeänderung mit jedem Dreame-Roboter der Integration (Tasshack/dreame-vacuum), und mit
überschaubarem Aufwand auch mit anderen Marken. Dafür fragt kein Bauteil mehr „was hat Heidi“, sondern „was hat dieses
Gerät“. Die Antwort gibt ein Modul, das Geräteprofil.

## So funktioniert es heute (Stand 16.09.2026, Version 2.0.0-alpha.19)

Kurzfassung für Herbert: Die Karte kennt weder den Namen des Roboters noch seine Räume oder Optionen aus dem Code. Beim
Start liest sie alles aus Home Assistant.

### 1. Roboter erkennen (`src/ha/device.ts`, PD-012)

| Schritt | Quelle | Ergebnis |
|---|---|---|
| 1 | Kartenkonfiguration `robot: vacuum.xyz` (nur bei mehreren Robotern nötig) | genau dieser Roboter |
| 2 | Entitäts-Register des Frontends: erste `vacuum.*`-Entität der Plattform `dreame_vacuum` | Roboter + Anzeigename aus dem Geräte-Register (vom Benutzer vergebener Name zuerst) |
| 3 | Zustände: erste `vacuum.*` mit den Dreame-Attributen `segment_cleaning`/`cleaning_sequence` (Tests, alte HA) | Roboter + Anzeigename aus `friendly_name` („Heidi  Heidi“ → „Heidi“) |

Aus `vacuum.heidi` wird das Präfix `heidi`. Der Vertrag (`src/ha/contract.ts`) kennt nur noch Domäne + Merkmal
(`ROBOT_FEATURES`, z. B. `map: ['camera', 'map']`) und bildet daraus zur Laufzeit `camera.heidi_map`. Umbenennen des
Geräts in HA (mit ID-Änderung) zerlegt die Karte nicht mehr; der Anzeigename in Kopf, Seitenleiste und Karte folgt HA.

### 2. Räume, Optionen, Fähigkeiten (`src/ha/profile.ts`, `src/domain/rooms.ts`, PD-013)

| Was | Quelle | Regel |
|---|---|---|
| Räume | `camera.<gerät>_map`, Attribut `rooms` | sichtbare Räume, Reihenfolge = App-`order`; ohne Karte Rückfall auf `select.<gerät>_room_N_cleaning_mode` |
| Name | Standardtyp `type` 1..15 → Wörterbuch `ROOM_TYPES` (deutsch wie in der App); `type` 0 → `custom_name` | Zählsuffix bleibt („Schlafzimmer 2“) |
| Kurzname | Regel: „…zimmer“ → „…z.“, ≤ 7 Zeichen unverändert, sonst 6 Zeichen + „.“ | ergibt für Heidi die alten Kurznamen (Wohnz., Schlafz.) |
| Symbol | Standardtyp → Symbol des Typs; sonst Stichwort im Namen (Bad, Küche, Kinder, Balkon …); sonst Grundriss | |
| Optionen | `options` der Selects (`select.<gerät>_cleaning_mode` usw., sonst erster Raum) | deutsche Beschriftung per Wörterliste, unbekannte Werte lesbar |
| Fähigkeiten | Entität vorhanden? (`profile.has('selfClean')`) | fehlende Station → keine Kacheln, kein Fehler |

Alle Bauteile bekommen das Profil als Sicht vom Panel (`map.roomOrder`, Raumwerte je ID), keine Liste im Code. Die
Selektoren leiten ihre Entitäts-IDs aus dem Profil ab (`memoizeSelector` mit ID-Funktion der Zustände).

### 3. Was bewusst fest bleibt

- **Paket-Helfer** `heidi_*` (Planer, Prognose, Automatik, Phase): gehören zu unserem Paket, nicht zur Integration.
  Ein zweiter Roboter bekäme ein zweites Paket (Stufe 4).
- **Raum-Stammdaten** (Name, Reihenfolge, Sichtbarkeit, Boden) sind für die Karte nur lesen; gepflegt wird in der App.
- **Dienste** der Dreame-Integration (`vacuum_clean_segment` …) – Adapter je Marke kommt in Stufe 3.
- **Kurzformat der Raumwerte** im Planer (3 Modi-Codes) und `HA_OPTIONS` der Paket-Helfer – Ausbau mit 4.5 Editor.

### 4. Wo es geprüft wird

`device.test.ts`/`device.js` (Erkennung, Umbenennung heidi → berta, zwei Roboter, ohne Roboter), `profile.test.ts`/
`profile.js` (3 und 20 Räume, versteckte Räume, Standardtypen, Optionen, ohne Station). Register aller Entitäten der
Integration: `docs/dreame_x60/ENTITAETEN.md`.

## Was heute schon dynamisch ist (Stufe 1, erledigt 15.09., PD-012)

- Gerätename und alle Roboter-Entitäts-IDs kommen aus HA (`src/ha/device.ts`, `discoverDevice`), der Vertrag kennt nur
  Domäne + Merkmal (`ROBOT_FEATURES`). Umbenennen in HA zerlegt nichts; `robot:` in der Kartenkonfiguration wählt bei
  mehreren Robotern.
- Raumwerte im Lauf kommen aus den Kartendaten (PD-010), die Heidi-Karte liest die Raumflächen aus dem Kartenpaket der
  Integration (Valetudo-Format, das auch Valetudo-Roboter anderer Marken liefern).

## Was noch fest ist (und wo)

| Fest verdrahtet | Wo | Wirkung bei anderem Roboter |
|---|---|---|
| Sieben Räume 7..1 mit Kurznamen und Symbolen | `config.ts` ROOMS, `contract.ts` ROOM_IDS, 9 Dateien | Raumkacheln, Auswahl, Streifen, Auftrag falsch oder leer |
| Optionen Modus/Saugstufe/Wasser/Route/Wiederholungen und ihre HA-Werte | `contract.ts` HA_OPTIONS, ROOM_VALUE_CODES; `heidi.yaml` input_select | Ein Roboter mit anderen Stufen (z. B. vier Wasserstufen) wird falsch angezeigt |
| Welche Merkmale es gibt (Mopp-Wäsche, Trocknen, Absaugen, Reinigungsmittel …) | `contract.ts` ROBOT_FEATURES, Selektoren `readStation`, `readConsumables`, `readRobotSettings` | Kacheln zeigen „–“ oder Fehler statt zu verschwinden |
| Dienste `dreame_vacuum.vacuum_clean_segment`, `vacuum_set_restricted_zone`, `vacuum_start_shortcut` | `contract.ts` SERVICES; `scripts.yaml`, `automations.yaml` | Andere Marke: Dienst existiert nicht |
| Raum-Selects `select.<gerät>_room_N_<merkmal>` | `contract.ts` roomEntity; Skript `heidi_reinigung` | Andere Marke: Entitäten existieren nicht |
| Kartenbild + Kartenpaket (`camera.<gerät>_map`, `_map_data`) | Selektoren, `dx-heidi-map`, Automation Sperrzonen | Andere Marke: anderes Kameraformat |
| Paket-Helfer `heidi_*` (Planer, Prognose, Automatik) | `heidi.yaml`, Automationen, Skripte, `contract.ts` PACKAGE_PREFIX | Zweiter Roboter braucht ein zweites Paket |

## Drei Stufen

### Stufe 2 – jeder Dreame-Roboter (gleiche Integration) – **gebaut 15.09. (PD-013, Version 2.0.0-alpha.18)**

Ein Modul `src/ha/profile.ts` baut aus HA ein Profil:

- **Räume** aus `camera.<gerät>_map.rooms` (ID, Name, Typ, Sichtbarkeit) statt ROOMS. Die App kennt 15 Standard-Raumtypen
  (Attribut `type` 1..15: Wohnzimmer, Schlafzimmer, Nebenzimmer, Arbeitszimmer, Küche, Esszimmer, Bad, Balkon, Flur,
  Allzweckraum, Garderobe, Salon, Büro, Fitnessbereich, Freizeitbereich) – diese Namen und Symbole kennt die Karte als
  Wörterbuch (`ROOM_TYPES` in `domain/rooms.ts`), sie erkennt auch die Sprachsteuerung; benutzerdefinierte Räume
  (`type` 0) heißen wie in der App (custom_name) mit Symbol nach Stichwort. Kurznamen und Symbole sonst aus einer
  Einstellung (Standard: Name gekürzt, Symbol nach Stichwort „Bad“, „Küche“ …; später ein Menü, ClickUp „So wenig wie
  möglich fest verdrahtet“). Raum 8 „Balkon“ verschwindet über die Sichtbarkeit von selbst.
- **Optionen** aus den `options` der Select-Entitäten (`select.<gerät>_suction_level` usw.) mit deutscher Übersetzung
  über eine Wörterliste (`quiet` → Leise …; unbekannte Werte bleiben englisch, nichts wird verworfen).
- **Fähigkeiten** aus dem Vorhandensein der Entitäten: `hat('self_clean')`, `hat('drying_time')`, `hat('auto_empty')`,
  `hat('mop_pad_humidity')`. Fehlt etwas, zeichnet das Bauteil die Kachel oder den Knopf nicht.
- Die Bauteile bekommen das Profil wie heute die Sichten: als Parameter vom Panel, nie direkt importiert.
- Backend: Skript `heidi_reinigung` setzt Raumwerte nur für Räume, die die Karte kennt; die Planer-Helfer speichern
  Raum-IDs weiter als Zahlen (bleibt kompatibel).

Ergebnis: Ein anderer Dreame (X40, L10s …) mit anderem Namen, anderen Räumen und anderem Funktionsumfang läuft ohne
Codeänderung. Das ist der Teil, den Herbert mit „für andere Roboter“ zuerst meint.

### Stufe 3 – andere Marken (Ecovacs, Roborock, Valetudo)

Ein **Adapter je Marke** hinter einer festen Schnittstelle. Die Karte spricht nur mit der Schnittstelle:

```
interface RobotAdapter {
  erkennen(hass): DeviceInfo | null           // Plattform, Präfix, Name
  profil(hass): Profil                        // Räume, Optionen, Fähigkeiten
  lesen: { roboter, station, verschleiss, karte }   // Selektoren
  dienste: { starten(räume, reihenfolge), pause, stopp, station, raumwerte(raum, werte), sperrzonen(...) }
  karte: { bild(), kalibrierung(), kartenpaket() }  // Kartenbild + Raumflächen
}
```

- `dreame` ist der erste Adapter (= heutiger Code, in Adapterform gebracht). Ein zweiter Adapter (z. B. `valetudo`,
  dessen Kartenformat wir schon lesen, oder `roborock`) liefert dieselbe Schnittstelle mit seinen Entitäten und Diensten.
- Das Backend (Planer-Skripte) braucht dafür je Marke ein Skript `…_reinigung` mit den passenden Diensten; der Planer
  ruft es über einen festen Namen. Der Rest des Pakets (Zeiten, Personen, Prognose, Protokoll) ist markenneutral.
- Grenzen: Manche Fähigkeiten gibt es nur bei Dreame (App-Szenen, Kartenpaket im PNG-Chunk). Das Profil sagt dann
  „nicht vorhanden“, die Karte blendet aus – kein Fehler.

### Stufe 4 – Installation, zweiter Roboter, Weitergabe (Herbert, 16.09.: „muss ich alles manuell nochmal machen?“)

**Ist-Zustand:** Alles außer den Roboter-Entitäten der Integration entsteht von Hand: Paket `heidi.yaml` (~90 Helfer und
Sensoren), Automationen, Skripte, Prognose-Skripte, Theme, Einträge in `configuration.yaml` (Dashboard, Paket,
Shell-Befehle), Karte `dreame_x60.js` + Lovelace-Ressource, Datenkarte aktivieren, HACS-Karten, Personen. Ein zweiter
Roboter bräuchte eine Kopie von Paket/Automationen/Skripten mit anderem Präfix und Roboternamen (~390 Stellen); eine
Weitergabe an Dritte hat heute keine Anleitung. Die Karte selbst ist fertig dafür (`robot:` je Dashboard-Eintrag,
Diagnose-Seite zeigt fehlende Roboter- und Paket-Entitäten getrennt).

**Ziel (drei Teile):**

1. **Paket als Vorlage + Generator.** `ha/templates/` mit Platzhaltern `{{p}}` (Präfix) und `{{vac}}` (Roboter-Entität,
   daraus die Roboter-IDs nach dem Muster der Integration) für Paket, Automationen, Skripte und Dashboard-Eintrag;
   `tools/setup.ps1 -Name berta -Robot vacuum.berta` erzeugt die Dateien nach `ha/generated/<name>/` und deployt sie.
   Das heutige `heidi`-Paket wird die erste Instanz der Vorlage (Regressionstest: Generator mit `heidi` muss byte-gleich
   das heutige Paket liefern, bis auf Kommentare). Paket-Präfix in der Karte kommt dann aus der Kartenkonfiguration
   (`package: berta`, Standard = Präfix des Roboters).
2. **Installationsanleitung** `docs/INSTALL.md`: Voraussetzungen (HA-Version, Dreame-Integration Beta, HACS-Karten
   optional), Schritte in Reihenfolge, Prüfung am Ende über die Diagnose-Seite der Karte, bekannte Stolperfallen
   (Datenkarte aktivieren, `switch.<gerät>_customized_cleaning`, Umlaute in IDs, Personen).
3. **Karte als HACS-Paket** in eigenem Repo (`hacs.json`, Releases mit `dreame_x60.js`), damit Empfänger Installation und
   Updates über HACS bekommen. Nach 6.5.

**Reihenfolge:** Teil 1 und 2 nach 4.4/4.5, wenn das Paket nicht mehr täglich umgebaut wird; Teil 3 nach 6.5.
ClickUp: „Post-2.0: Installation, zweiter Roboter, Weitergabe – Paket-Vorlage + setup.ps1, INSTALL.md, HACS“.

## Reihenfolge – Empfehlung

Stufe 2 **vor** 4.4 Planer und 4.5 Editor bauen. Grund: Planer, Editor und Räume-Dialog sind die letzten großen
Bausteine und bestehen zum Großteil aus Raumlisten und Optionslisten. Werden sie erst mit fester Liste gebaut und danach
umgebaut, ist es doppelte Arbeit und doppelte Tests. Mit dem Profil zuerst entstehen sie gleich richtig.

Was Stufe 2 an bestehenden Bausteinen ändert: dx-hero (Streifen-Chips), dx-auftrag, dx-map-card (Kacheln), dx-quickstart,
dx-heidi-map (Raumliste), die Selektoren für Räume/Station/Verschleiß, `shared/rooms.ts`. Alle Tests bleiben, weil der
Abzug von Heidi dasselbe Profil ergibt wie die feste Liste heute; dazu kommt ein zweiter Abzug mit anderem Roboter
(weniger Räume, ohne Station) als Fixture.

Stufe 3 nach der Parität (6.x), weil sie nur mit einem echten zweiten Roboter oder einem Valetudo-Abzug prüfbar ist.

## Stand nach Stufe 2 (15.09.)

Gebaut: `src/domain/rooms.ts`, `src/ha/profile.ts`, Selektoren mit zustandsabhängigen ID-Listen, Kacheln mit `auto-fill`.
Entschieden: Stufe 2 vor 4.4 (ja), Kurznamen/Symbole per Standardregel (Menü später), Übersetzung per Wörterliste
(unbekannte Werte lesbar). Noch fest: `HA_OPTIONS` für die Paket-Helfer (Planer-Einträge speichern deutsche Optionen –
bleibt, weil das Paket sie so erwartet), die fünf Raumwert-Felder je Raum, das Kurzformat der Raumwerte (3 Modi-Codes –
„Wischen nach Saugen“ ist im Planer noch nicht speicherbar, Ausbau mit 4.5).

## Offene Entscheidungen (Herbert)

1. Stufe 2 jetzt, vor 4.4? (Empfehlung: ja.)
2. Raum-Kurznamen und Symbole: Standardregel reicht vorerst, Menü später? (Empfehlung: ja.)
3. Deutsche Übersetzung der Optionen: Wörterliste in der Karte, oder HA-Übersetzungen der Integration nutzen (die
   Integration liefert deutsche Anzeigetexte über `translation_key`, erreichbar über die Frontend-Übersetzungen)?
   (Empfehlung: erst Wörterliste, HA-Übersetzung als Ausbau.)
