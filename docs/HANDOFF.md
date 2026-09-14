# Handoff – Stand aus dem Cowork-Chat (September 2026)

Dieses Dokument fasst zusammen, was in den Cowork-Sitzungen mit Herbert für den Saugroboter
**Heidi** (Dreame X60 Ultra) gebaut wurde, warum es so gebaut wurde, welche Stolpersteine es gab
und was noch offen ist. Ziel: In Claude Code nahtlos weitermachen können.

Kurz-Start in Claude Code:

> „Lies docs/HANDOFF.md und heidi/CLAUDE.md, dann mach bei den offenen Punkten weiter."

---

## 1. Was existiert (Stand v1.3.1 / Planer v2)

### Dashboard-Karte `ha/www/heidi-panel.js` (Custom Lovelace Card, v1.3.1)
- Reines `HTMLElement` + Shadow DOM, signaturbasiertes Re-Render (nur neu zeichnen, wenn sich
  relevante States ändern), `loadCardHelpers()` für die eingebettete Kartenansicht.
- **Glas-Design**: transparente Flächen mit `backdrop-filter: blur`, radialer Glow-Hintergrund,
  Fonts Sora + IBM Plex Sans (Google-Fonts-Link wird in `document.head` injiziert),
  Akzentfarbe `#2fd1b6`. Wenig Text, große Kacheln.
- Bereiche: `_hero` (Akku-Ring, Status, Chips, 4 Steuerknöpfe), `_mapCard` (Karte + Sperrzonen-
  Knopf + Raum-Chips → Mehrfachauswahl → `dreame_vacuum.vacuum_clean_segment`), `_consumables`
  (Verbrauchsringe mit Reset), `_automatik` (Einzeiler + Regeln), `_planer` (4 Einträge aus
  `_planRead(n)`), `_prognoseCard` (Heatmap-Kacheln), `_station`, `_stats` + `_history()`
  (Reinigungsprotokoll aus `sensor.heidi_cleaning_history`-Attributen, nach Zeitstempel
  sortiert) + `_robot()`.
- **Einstellungen-Panel** mit eigenem Prognose-Bereich (Slider `rng` mit min/max für Intervall,
  Auflösung, Wochen, Halbwertszeit, Mindesttage).
- **Planer-Editor** (`_editorHtml(n)` / `_saveEditor(n)`):
  - Kopfzeile: Name + Schalter „aktiv/inaktiv" (`input_boolean.heidi_planN_aktiv`).
  - Räume als klickbare Chips (7er-Raster), Wochentage als Chips (Maske „1010101").
  - Modus wie in der App: Saugen / Saugen + Wischen / Saugen, dann Wischen / Nur Wischen;
    Saugstufe, Wassermenge, Route (Schnell/Standard/Intensiv/Tief), Wiederholungen 1–3.
  - Uhrzeit über Android-ähnliche Uhr (`_clockHtml`: 24-h-Zifferblatt, Minuten in 5er-Schritten).
  - „Nicht fahren, wenn zu Hause ist": Personen wählbar (Herbert stört es nicht, Nicole schon →
    Standard nur `nicole`).
  - „Bei Homeoffice": *Warten* oder *Leise starten* mit Mini-Profil (Saugstufe/Route/Wdh,
    Standard Leise/Schnell/1×).
  - Schnellprogramm-Schalter mit Mini-Profil (Standard Standard/Schnell/1×).
- Version steht in `HP_VERSION` **und** in `?v=` der Ressource `/local/heidi-panel.js?v=1.3.1`
  (`H:\.storage\lovelace_resources`, Typ `module`). `tools/deploy.ps1` zählt beides hoch.
  Nach JS-Änderungen: HA neu starten + Strg+F5.
- Backups auf `H:\www`: `heidi-panel-v1.1.0.bak`, `heidi-panel-v1.2.1.bak`.

### HA-Konfiguration (v2)
- `ha/packages/heidi.yaml`: Planer-Helfer pro Eintrag 1–4
  (`input_text` name/raeume/tage/personen; `input_select` modus/saugstufe/wasser/route/
  wiederholungen/homeoffice + `ho_saug/ho_route/ho_wdh` + `sp_saug/sp_route/sp_wdh`;
  `input_boolean` aktiv/schnell; `input_datetime` zeit). Startwerte: Plan 1 Tage `0110111`,
  Plan 2 `1001000`, Plan 3/4 `0000000`; Personen Plan 1/2 `nicole`; Räume Plan 1/2
  `7,6,5,4,3,2,1`, Plan 3 `6,4`, Plan 4 `1,3`.
  Prognose-`input_number`: `heidi_prognose_intervall` (5–60, auf Teiler von 60 gerundet),
  `_aufloesung` (15/30/60), `_wochen` (2–12), `_halbwert` (7–60), `_mindesttage` (3–28).
  `binary_sensor.heidi_arbeitszeit` (ersetzt das alte `heidi_homeoffice`),
  `sensor.heidi_heutiger_plan` mit Attribut `stoerer`, Statustexte, `shell_command`s,
  `command_line`-Sensor für die Prognose (`json_attributes` inkl. `aufloesung`, `wochen`).
  Das alte `input_select.heidi_homeoffice_modus` wurde entfernt.
- `ha/automations.yaml`: `heidi_planer` (blockiert nur durch „stört"-Personen; Homeoffice →
  warten oder Variante `leise`; Schnellprogramm bei baldiger Rückkehr), `heidi_lauf_abgeschlossen`,
  `heidi_heimkehr` (nur für „stört"-Personen des heutigen Eintrags), `heidi_dark_mode`,
  `heidi_prognose_protokoll` (`/5` + `minute % intervall == 0`), `heidi_prognose_config`
  (Trigger auch auf die input_numbers, `for: 2 s`, `mode: queued`), `heidi_sperrzone_esstisch`.
- `ha/scripts.yaml`: `heidi_reinigung` (setzt globalen cleaning_mode/cleaning_route, pro Raum
  Modus/Saugstufe/Wdh, bei Wischen Feuchte + Route, dann `vacuum_clean_segment`),
  `heidi_plan_starten` (plan 1–4, variante normal|schnell|leise), `heidi_app_szene`,
  `heidi_theme_anwenden`.
- `ha/prognose/presence.py`: Anwesenheits-Prognose. `config.json` steuert SLOT_MIN (15/30/60),
  WEEKS, HALF_LIFE_DAYS (`config <h> <n> <ni> [wochen halbwert aufloesung]`). Lücken werden nur
  zwischen Messungen ≤ 90 min interpoliert; unbekannte Slots werden ignoriert (kein Raten).
- Backups auf `H:\`: `packages/heidi.yaml.v1.bak`, `automations.yaml.v1.bak`, `scripts.yaml.v1.bak`.

### Tests
`heidi/tests/test-real.js`, `test-editor.js`, `test-zones.js` (Playwright headless, mit
`real_states.json` als HA-Zustand). Editor-Test prüft u. a. die erzeugten Service-Calls und die
Uhr (10:15). `npm i playwright` im Ordner `heidi/tests`.

---

## 2. Wichtige Erkenntnisse / behobene Fehler
- **Heatmap: Montag komplett „voll"** – Ursache war das Auffüllen von Lücken aus wenigen Messungen
  (Extrapolation). Fix: nur begrenzte kurze Lücken interpolieren, `None` = unbekannt.
- Ringzahlen waren hinter `::after` versteckt → `z-index: 1` auf `.ring .num` / `.mini span`.
- `this.attr(id, undefined)` ist falsy → direkt `this._hass.states[...]?.attributes` verwenden.
- Kopfzeile „Eintrag 2bearbeiten" → `&nbsp;` einfügen.
- Prognose blieb grau, bis genügend Tage protokolliert waren (Mindesttage-Slider beachten).
- WLAN-Anwesenheit wird alle *Intervall* Minuten (Standard 15) per Automation protokolliert.

## 3. Werkzeug-Eigenheiten (Desktop / PC)
- `H:\` ist ein Netzlaufwerk: `device_commit_files` scheitert dort („fetch or write failed").
  Dateien mit Desktop Commander `write_file` / `edit_block` / `move_file` schreiben – die
  50-Zeilen-Grenze von `write_file` wird nicht erzwungen.
- Desktop Commander `start_process` schlägt sporadisch mit „spawn EPERM" fehl → Deploy per
  `write_file` in Teilen statt per Skript. In Claude Code stattdessen `tools\deploy.ps1` nutzen.
- **Keine lokalen Ordner ohne Rückfrage anlegen** (Herbert hat das einmal abgelehnt).
- GitHub: fine-grained Token nur für ausgewählte Repos kann keine Repos erstellen;
  `push_files` braucht einen bestehenden Branch (leeres Repo zuerst mit einer Datei füllen).
- Token (HA, GitHub) niemals im Chat, in Dateien oder Commits.

## 4. Offene Punkte
- [ ] HA neu starten + Strg+F5, damit v1.3.1 und die v2-Helfer aktiv sind; im Planer-Editor
      ▶ (Sofortstart) und **Speichern** real testen.
- [ ] Große Dateien ins Repo übernehmen (siehe README „Erstes Setup"): `ha/www/heidi-panel.js`,
      `ha/packages/heidi.yaml`, `ha/automations.yaml`, `ha/scripts.yaml`,
      `ha/prognose/presence.py`, `ha/themes/heidi.yaml`, `heidi/mockups/*`.
- [ ] `device_tracker.s23_ultra_von_herbert_2` zur Person `person.herbert_schrotter` hinzufügen
      (HA-Oberfläche).
- [ ] Zeitpläne in der Dreame-App deaktivieren (IDs 3–6), damit nur der HA-Planer fährt.
- [ ] Aufräumen: `H:\www\_deploy_yamls.txt.old`, `H:\www\heidi-panel-v1.1.0.bak.b64` löschen;
      optional altes Storage-Dashboard und nicht mehr benötigte HACS-Karten entfernen.
- [ ] Optional: Remote Control in Claude Code einrichten, damit vom Handy aus über diesen PC
      in HA geschrieben werden kann.

## 5. Referenzen
- Räume: 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur, 5 Büro, 6 Küche, 7 Wohnzimmer.
- Entitäten: `vacuum.heidi`, `camera.heidi_map` (rooms, no_go_areas, no_mopping_areas,
  calibration_points), `select.heidi_room_N_*`, `select.heidi_cleaning_mode`
  (inkl. `mopping_after_sweeping`), `select.heidi_cleaning_route` (inkl. `quick`),
  `sensor.heidi_cleaning_history`.
- Personen: `person.herbert_schrotter`, `person.nicole_2`, `person.nina_2`.
- Cowork-Projektdoku (claude.ai, Projekt „Mein SmartHome"): `claude/heidi-setup.md`.
