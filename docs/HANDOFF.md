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
- `ha/automations.yaml`: `heidi_planer` (Auslöser: alle 10 min, Anwesenheitswechsel, Automatik
  an, **genau zur Uhrzeit des heutigen Eintrags** (Template-Trigger) und **bei jeder Änderung von
  `sensor.heidi_heutiger_plan`** (Uhrzeit/erledigt/stört – seit 14.09.); blockiert nur durch
  „stört"-Personen; Homeoffice → warten oder Variante `leise`; Schnellprogramm bei baldiger
  Rückkehr), `heidi_lauf_abgeschlossen`,
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
Uhr (10:15). Einrichten im Ordner `heidi/tests`: `npm i` und dann `npx playwright install chromium`.

---

## 2. Wichtige Erkenntnisse / behobene Fehler
- **`initial:` bei Helfern ist eine Falle**: HA erzwingt den Startwert bei *jedem* Neustart und
  verwirft die gespeicherten Werte (input_boolean/select/text/datetime/number). Am 14.09. um 09:00
  hat ein Neustart alle Planer-Einstellungen zurückgesetzt (Uhrzeiten, „heute erledigt“ …). Seitdem
  hat das Paket **keine `initial:`-Werte mehr**; HA stellt den letzten Zustand wieder her. Werte von
  vor dem Neustart wurden aus der Historie zurückgeholt (`history/period` – Achtung: ohne
  `end_time` liefert die API nur 24 h ab Start).
  Startwerte für eine **Neueinrichtung** (dann einmal von Hand setzen): automatik/dark_mode/
  planer_bereich/nina_zaehlt/prog_* an; plan1+2 aktiv+schnell an; Kartendarstellung Dreame-App,
  Raumnamen Deutsch, bei Heimkehr „Zur Station“; Plan 1 „Tägliches Saugen“ Saugen/Turbo/Mittel/
  Standard/1 Tage 0110111 09:30 Räume 7,6,5,4,3,2,1 stört nicole; Plan 2 „Saugen + Wischen“
  Saugen + Wischen/Turbo/Mittel/Standard/1 Tage 1001000 09:30 (Herbert: 07:00) alle Räume stört
  nicole; Plan 3 „Küche nach dem Kochen“ Räume 6,4 Wdh 2 19:30 manuell; Plan 4 „Bad & WC
  gründlich“ Räume 1,3 Viel/Intensiv/3 10:30 manuell; Leise-Profil Leise/1, Schnell-Profil
  Standard/1; Arbeitszeit 08:00–17:00, Rückkehr 17:00, Schnell-Minuten 90, Mindest-Akku 30,
  Prognose Intervall 15 / Auflösung 30 / Wochen 8 / Halbwert 21 / Mindesttage 14.
- **`sensor.heidi_cleaning_history` ist während eines Laufs „unavailable“** → Protokoll und
  „Letzter Lauf“ verschwanden. Karte (v1.5.5) merkt sich den letzten gültigen Stand
  (`_histAttrs()`/`_histCache`) und zeigt das Protokoll während des Laufs weiter.
- **Hinweg zum Startpunkt**: Solange `cleaned_area` = 0 und der Roboter unterwegs ist, heißt die
  Phase „Fährt zum Startpunkt · <erster Raum der Reihenfolge>“ (Herberts Wunsch). Danach: Beim
  Durchfahren fremder Räume meldete die Phase „Saugt Büro“,
  „Saugt Flur“ … Jetzt „Fährt durch <Raum>“, wenn `current_segment` nicht in `active_segments`
  liegt (Paket + Kopf-Streifen). Bei „ganze Karte“-Starts ist `active_segments` leer → keine
  Unterscheidung möglich.
- **Roboter-Hinweise sind keine Fehler**: `sensor.heidi_error` = `clean_mop_pad` („Mopps
  reinigen“) hat den Planer blockiert (Bedingung `no_error`). Jetzt zählt nur
  `state_attr('vacuum.heidi','has_error')`; die Karte zeigt Hinweise gelb (ERR_DE), Fehler rot.
- **Heatmap: Montag komplett „voll"** – Ursache war das Auffüllen von Lücken aus wenigen Messungen
  (Extrapolation). Fix: nur begrenzte kurze Lücken interpolieren, `None` = unbekannt.
- Ringzahlen waren hinter `::after` versteckt → `z-index: 1` auf `.ring .num` / `.mini span`.
- `this.attr(id, undefined)` ist falsy → direkt `this._hass.states[...]?.attributes` verwenden.
- Kopfzeile „Eintrag 2bearbeiten" → `&nbsp;` einfügen.
- Prognose blieb grau, bis genügend Tage protokolliert waren (Mindesttage-Slider beachten).
- WLAN-Anwesenheit wird alle *Intervall* Minuten (Standard 15) per Automation protokolliert.
- **Umlaute in Entitäts-IDs**: HA macht aus dem Namen „Heidi Nicht stören“ die ID
  `binary_sensor.heidi_nicht_storen` (ö → o, *nicht* oe). `unique_id` hat darauf keinen Einfluss.
  Der Planer prüfte `heidi_nicht_stoeren` → Bedingung auf fehlende Entität ist immer falsch →
  Planer hat nie ausgelöst, während der Status-Sensor „startet“ anzeigte. Bei neuen Template-
  Entitäten mit Umlaut im Namen die echte ID immer per API nachschauen (gleiches gilt für
  Automations-IDs: `automation.heidi_heimkehr_wahrend_reinigung`, `..._stuhle_am_boden`).
- Der HA-Fehlerlog ist per REST (`error_log`) nicht mehr erreichbar (404) und
  `home-assistant.log` liegt nicht auf der Samba-Freigabe → Fehler über die HA-Oberfläche
  (Einstellungen → System → Protokolle) ansehen. **Seit 18.09.:** Das Log ist über die Supervisor-Schnittstelle
  lesbar – `.\tools\ha.ps1 get "hassio/core/logs?lines=300"` (HA OS schreibt keine Log-Datei mehr).

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
- `tools/ha-ws.js` (Node 24, eingebautes WebSocket): für Dinge, die die REST-API nicht kann
  (Personen, Entitäts-Register). JSON-Argumente über **Git Bash** übergeben – in PowerShell
  werden die Anführungszeichen zerlegt. Beispiel: `node tools/ha-ws.js person/list`.
- Nach YAML-Änderungen an Automationen/Templates reicht `services/automation/reload` bzw.
  `services/template/reload` – kein voller Neustart nötig (neue Helfer brauchen ihn aber).

## 3b. Karte v1.4.0 (14.09.2026): Phase + Zeitleiste
- Neuer Template-Sensor `sensor.heidi_phase` (Paket): Arbeitsschritt als Text, siehe `heidi/CLAUDE.md`.
- Kopfzeile der Karte zeigt diese Phase statt des groben Status („Room cleaning“).
- Protokoll: Einträge klickbar → Zeitleiste (Uhrzeit, Schritt, Dauer) aus der HA-Historie;
  laufender Auftrag als „Läuft gerade“ live oben. Historie gibt es erst ab dem Update
  (Recorder behält standardmäßig 10 Tage) – ältere Einträge zeigen „Kein Verlauf gespeichert“.
- Ressourcen-Version wurde per WebSocket (`lovelace/resources/update`) live gesetzt – so geht ein
  Karten-Update ohne HA-Neustart (deploy.ps1 schreibt zusätzlich die Datei). Danach Strg+F5.
- v1.4.1: Kopf zweizeilig (groß Gesamtauftrag, klein Arbeitsschritt), Knöpfe je Zustand
  (Pause/Stopp/Station beim Reinigen, Weiter bei Pause, Start/Orten angedockt), Stühle-Schalter
  vom Kopf zur Karte (neben Sperrzonen) verschoben. Test `test-timeline.js` prüft das mit.
- v1.4.2: Zeitleiste startet nicht mehr neu bei kurzen Aussetzern (Stopp/Weiter meldet der
  Roboter als „Bereit“ für Sekunden). Ein Lauf endet erst bei ≥ 3 min Ruhe; Ruhe < 1 min wird
  ausgeblendet.
- v1.5.2/1.5.3 (ersetzt die 3-min-Regel): Laufgrenzen kommen aus `vacuum.heidi` (Historie wird mit
  Phase + vacuum geholt). Lauf = unterwegs (cleaning/paused/returning), Ende = erster Halt danach;
  Stationsarbeit nach der Rückkehr gehört nicht dazu, jeder Start ist ein neuer Lauf; Halte < 45 s
  (Startsequenz cleaning→docked→idle→cleaning) unterbrechen nicht; veralteter Raum in den ersten
  30 s wird ausgeblendet. „Läuft
  gerade“ nur, während der Roboter unterwegs ist.

## 3c. Entscheidung „Angepasste Reinigung“ (14.09.2026)
- `switch.heidi_customized_cleaning` (App: Raum-Einstellungen) war **aus** → alle
  `select.heidi_room_N_*` waren „unavailable“, das Planer-Skript hat die Raumwerte still
  übersprungen (continue_on_error) und Heidi fuhr mit den globalen Werten (Standard statt Turbo).
- Herbert hat den Schalter am 14.09. um 08:28 **eingeschaltet** und sich für **Weg 1** entschieden:
  Schalter bleibt an, Planer wird bereinigt. Regeln des Roboters bei „an“:
  - global Modus/Saugstufe/Wasser/Route sind unavailable; es gelten die Raumwerte.
  - je Raum: Modus (sweeping|mopping|sweeping_and_mopping), Saugstufe, Wdh. immer;
    Wasser (`mop_pad_humidity`) + Feuchte (`number.heidi_room_N_wetness_level` 1–32) nur wenn
    der Raum wischt; Route (standard|intensive|deep) **nur bei Modus mopping** (Integration:
    `segment_available_fn`, kein `cleaning_route_v2`).
  - „Saugen, dann Wischen“ (`mopping_after_sweeping`) und Route „Schnell“ (`quick`) gibt es nur
    global → im Planer entfernen. App-Szene 34 („Wischen nach dem Saugen“) läuft weiter.
- Umsetzung (v1.5.1, **seit 14.09. 09:00 auf dem Pi**; Live-Mockup `heidi/mockups/heidi-live.html`,
  gebaut mit `node heidi/mockups/build-live.js`, war die Freigabegrundlage):
  - Karte: Streifen im Kopf **nur während einer Reinigung**: „Jetzt: <Raum>“ + Symbole mit
    kurzem Wert (Modus, Saugstufe, Wasser, Route, Wdh) des Raums aus `current_segment`, rechts
    „danach Küche → Wohnz.“; Tippen → Untermenü. (Herbert wollte keine Zusammenfassung
    „je Raum“ – die war nichtssagend.) Untermenü „Räume“ (`_roomsHtml`/`_rvClick`) mit Modus
    **Roboter** (schreibt sofort `select.heidi_room_N_*`, Zeile „Alle Räume“) und **Eintrag N**
    (Einzelwerte je Raum im Editor-Objekt `_ed.raum`, gespeichert als
    `input_text.heidi_planN_raumwerte`). Editor: Modus 3 Optionen, Route nur bei „Nur Wischen“,
    Knöpfe „Räume einzeln …“ / „Roboter-Werte“, Punkt am Raum-Chip bei Einzelwerten; Schnell-/
    Leise-Profil nur Saugstufe + Wdh. Bereich „Roboter“: Knopf „Räume …“.
  - Paket: `input_text.heidi_planN_raumwerte` (255), `input_text.heidi_raum_snapshot`;
    `*_ho_route`/`*_sp_route` entfernt; Optionen bereinigt.
  - Skripte v3: `heidi_reinigung` sichert Roboter-Raumwerte (Snapshot, nur wenn leer), setzt je
    Raum Modus → 2 s → Saugstufe/Wdh/Wasser/Route, startet; `heidi_raumwerte_wiederherstellen`
    stellt den Snapshot wieder her (aufgerufen von `heidi_lauf_abgeschlossen`).
  - Kurzform Raumwerte: `1:B/T/V/-/2;6:B/L/M/-/1` = Raum:Modus/Saug/Wasser/Route/Wdh
    (S Saugen, B beides, W nur Wischen · L S K T · W M V · S I T · 1–3 · „-“ = nicht gesetzt).
  - `heidi_lauf_abgeschlossen` stellt die Raumwerte **unabhängig vom Automatik-Lauf** wieder her
    (auch nach Handstart über ▶), sobald Heidi 1 min angedockt ist und die Sicherung nicht leer ist.
  - Testlauf 14.09. 09:07: `script.heidi_reinigung` mit Raum 3 (WC), Saugen/Standard/1× →
    Sicherung `1:S/T/-/-/2;2:S/T/-/-/1;…` gefüllt, WC auf standard gesetzt, Start ok.
  - Verwaiste `input_select.heidi_planN_ho_route/sp_route` per `config/entity_registry/remove`
    (ha-ws.js) entfernt.

## 3d. Dauer & Akku (v1.6.0, 14.09.2026, live ohne Neustart – shell_command/command_line/automation reload)
- **Laufprotokoll** `ha/prognose/runlog.py` → `/config/prognose/runlog.csv` (Rohdaten, nie löschen, nie
  ins Repo). Automation `heidi_laufprotokoll` schreibt bei jedem Phasenwechsel + jede Minute, solange
  Heidi unterwegs ist, nach dem Lauf in der Station arbeitet (Wäsche/Absaugen) oder lädt (< 100 %):
  ts, phase, vac, seg, room, batt, area (gereinigt m²), ctime, charging, docked, Raumwerte des aktuellen
  Raums (mode/suction/water/route/times, HA-Werte), belag, plan, selfclean, mop_pad, carpet,
  mop_extend, water_temp. Übergabe als JSON in `shell_command.heidi_runlog` (`'{{ zeile }}'`; mit
  Templates läuft shell_command ohne Shell → shlex, einfache Anführungszeichen sicher).
- **Lernwerte** `sensor.heidi_lernwerte` (command_line, stündlich + `update_entity` nach jedem Lauf):
  `raten["Modus/Saugstufe"] = {min_pro_m2, pct_pro_min, laeufe}` aus Raumabschnitten
  (Phase „Saugt/Wischt <Raum>“, vac cleaning, Flackern < 45 s zusammengelegt), `raeume[id] =
  {flaeche (Median der letzten 3 Läufe, je Durchgang), belag}`, `laden` (%/min unter/über 80 % aus
  Ladezeilen, Rückkehr/Weiter-Schwellen 15/80 als Standard), `waesche` (vor Start/zwischendurch,
  nach_m2 aus number.heidi_self_clean_area). Läufe wie in der Karte: unterwegs = cleaning/paused/
  returning, Halte < 45 s zählen nicht.
- **Schätzung** `runlog.py schaetzung '<json>'` (rooms, sequence, modus, saug, wdh, raumwerte, batt,
  variante, sp_/ho_-Profil) → `{total, charges, used, batt_end, unlearned, gelernt}`; gleiche Logik
  wie `_estimate()` in der Karte (Raum für Raum, Mopp-Wäschen, Ladestopp bei < Rückkehr-%).
- **Automatik** `heidi_planer`: ruft die Schätzung für voll + schnell (`response_variable`), Wahl:
  voll wenn ≤ Rest bis Rückkehr (oder Rückkehrzeit vorbei) → sonst schnell, wenn erlaubt und
  passt → sonst warten. Ohne Lernwerte (`gelernt: false`) gilt die alte 90-min-Regel.
- **Karte**: Kurzzeile beim Eintrag (Dauer ✓/✗, Stecker bei Nachladen), Untermenü „Dauer & Akku“
  (Summe, Ablauf, ein Diagramm + Vergleichslinie), Lernwerte im Zahnrad-Panel. Erscheint erst, wenn
  `sensor.heidi_lernwerte` Raten hat. Live-Mockup hat Beispielwerte (`build-live.js`).
- Test der Schätzung ohne Lernwerte: `total 102 min` für Plan 2 (Erfahrungswerte), `gelernt: false`.

## 3e. Projekt dreame_x60 – Neubau der Karte (14./15.09.2026, Claude-Code-Sitzungen Teil 1 + 2)
- **Was:** Neubau der Heidi-Karte (v2) als eigenes Projekt **dreame_x60** auf dem eingefrorenen Backend.
  Branch `dreame_x60` (Worktree `C:\Users\herbe\source\herbert-smarthome-v2`), Ordner `dreame_x60/`,
  Bauplan `docs/dreame_x60/BAUPLAN.md` (Statusliste = Wahrheit, Regeln in Abschnitt 2, Entitäts-Vertrag
  Abschnitt 4), Begründungen `docs/dreame_x60/ARCHITEKTUR-REVIEW.md`, ClickUp-Liste „dreame_x60 – Bauplan“.
  `main` bleibt die Linie, die auf `H:\` läuft; `main` wird regelmäßig in `dreame_x60` gemergt.
- **Design abgenommen (15.09.):** `dreame_x60/mockups/bento.html` – „Automotive Dark Bento“ (dunkles Graphit,
  Bento-Flächen, Seitenleiste/Symbolleiste/Tab-Leiste je nach Breite, Design-Tokens `--dx-*`, System-Schriften).
  Ältere Glas-Mockups daneben (start, seiten, karte) nur noch als Funktionsreferenz. Heidi bleibt der Name in der Oberfläche.
- **Phase 0 (15.09.):** 0.1 v1-Tests mit gemeinsamem Gerüst `heidi/tests/harness.js`, `npm test` rot bei Abweichung,
  18 Service-Calls beim Speichern festgeschrieben (`heidi/tests/expected/editor-calls.json`). 0.3 Karte 1.6.2
  (`sensor.heidi_task_status` in der Signatur + Raumreihenfolge des Eintrags mit Helfer `input_text.heidi_lauf_reihenfolge`,
  aus `main` übernommen). 0.4 `sensor.heidi_automatik_status` hat `rest_min`/`rest_quelle`, `heidi_planer` liest `rest_min`.
  Alles am 15.09. 06:24 eingespielt (HA-Neustart, Ressource `?v=1.6.2`). 0.2 (Fixtures per `dump-states.ps1`) offen.
- **Phase 1 (15.09.):** Toolchain `dreame_x60/card/` (Lit 3, TypeScript strict, esbuild, ESLint 9, Playwright), Shell
  `dreame-x60-panel`, Dashboard `dreame_x60.yaml` (sechs Ansichten, URL `/dreame-x60/…`), Ressource `/local/dreame_x60.js?v=2.0.0-alpha.1`,
  „Heidi v2“ in der Seitenleiste (seit 15.09. heißt das Dashboard „Heidi“). Namensregel: Bausteine/Ereignisse/Tokens `dx-*`, „Heidi“ nur als Titel.
- **Phase 2 (15.09.):** `src/domain/` (raumwerte, estimate, timeline, calibration, status, labels, constants) mit Vergleichs-
  vektoren aus v1 (`tools/v1-vectors.js` → `tests/fixtures/*.v1.json`) und handgeschriebenen Grenzfällen (`*.spec.json`).
  2.7 (pytest gegen dieselben Vektoren) geschrieben, nicht ausgeführt: kein Python auf dem PC.
- **Phase 3 (15.09.):** `src/ha/` (contract, memo-selector, selectors, api `DxApi`), Shell mit Overlay/Toast/Escape/`dx-navigate`,
  E2E `render.js`/`nav.js`/`overlay.js`. 58 Unit-Tests, 3 E2E grün.
- **Phase 4 (15.09., Sitzung Teil 3):** Karte 4.0 und Abschnitt 7 des Bauplans auf das Bento-Mockup umgeschrieben (neue
  Übersichts-Bausteine `dx-auftrag`, `dx-quickstart`, `dx-stats`, `dx-heute`; Abweichungen zur v1-Übersicht gesammelt in
  **PD-007, offen** – Herbert liest gegen). 4.0 gebaut: `dx-nav` mit Seitenleiste (> 1180 px), Symbolleiste (761–1180 px),
  Tab-Leiste (≤ 760 px), Kopfzeile mit Tagesgruß/Zurück-Knopf/Uhr/Zuhause/Nicht stören, Bento-Übersicht mit zehn
  Platzhalter-Flächen. Version 2.0.0-alpha.2 eingespielt (Ressource per `ha-ws.js lovelace/resources/update`, kein Neustart).
  Herbert: „passt“, PD-007 freigegeben. 4.1 `dx-hero` (Roboter-Panel) + `dx-auftrag` (rechte Spalte im Lauf) gebaut,
  Streifen als `domain/strip.ts`, gemeinsame Bedienstile `styles/controls.ts`; hero.js prüft alle 85 v1-Kopf-Zustände und
  die Render-Ruhe. Version 2.0.0-alpha.7 eingespielt (mit Heidis Lauf 08:37 live geprüft).
- **Wortwahl „Mopp“ (15.09., Herbert):** Backend-Phasentexte in `heidi.yaml` und die Bedingung in `automations.yaml` auf „Wäscht Mopp …“/„Trocknet Mopp“, `runlog.py` zählt beide Schreibweisen (alte Historie); v2-Texte „Mopp reinigen“, „Wäscht Mopp …“ (PD-008); v1 unverändert. Eingespielt ohne Neustart (template/automation reload).
- **4.2 (15.09.):** `dx-dialog` (modal/sheet/confirm, Slots für Inhalt und Fuß, Zurück-Pfeil, Escape, Fokus + Tab-Falle, Sheet < 640 px Viewport); Shell nutzt ihn für Bestätigung und Platzhalter-Dialoge. Version 2.0.0-alpha.11 eingespielt.
- **Backend 15.09. (Herbert):** „Angepasste Reinigung“ war aus (App-Start schaltet sie aus) → Raum-Werte in HA `unavailable`, Streifen/Werte leer. Herbert hat sie eingeschaltet; neue Automation `heidi_angepasste_reinigung_an` schaltet den Schalter nach dem Lauf (angedockt, 5 min aus) wieder ein; Skript `heidi_reinigung` schaltet ihn zusätzlich direkt vor dem Lauf ein (Schritt 0). Eingespielt ohne Neustart (automation/script reload).
- **4.3 (15.09.):** `dx-map-card` (`full` auf Reinigen: Kartenwahl, Xiaomi-Karte mit einem Modus je Element aus dem Modul-Cache, Hinfahren/Sperrzonen, Räume/Zone/Punkt, „Alles“, Raumkacheln; `compact` auf der Übersicht = Kamerabild mit Reitern und Bildunterschrift) und `dx-quickstart`; Seite Reinigen mit App-Szenen, „Stühle am Boden“, „Räume einstellen“. Karten-Konfigurationen in `src/ha/map-config.ts`, Umrisse aus `readMap().roomShapes`. Version 2.0.0-alpha.13. Sichtprüfung mit der echten Karte in HA offen.
- **Karte (15.09., Herbert):** Dreame-App-Karte bleibt das Kartenbild (kann in dieser Installation keine Räume per Antippen wählen, wie v1); nach 6.5 Projekt „Heidi-Karte“ = Kartenbild der Integration + eigene Overlay-Ebene mit pixelgenauer Raumauswahl aus der Datenkarte („Map data“, Herbert aktiviert sie). ClickUp „Post-2.0: Heidi-Karte“.
- **4.3b Heidi-Karte (15.09., vorgezogen, PD-011):** `dx-heidi-map` = Kartenbild der Integration + SVG-Raumebene aus der Datenkarte (`camera.heidi_map_data`, PNG-Chunk „ValetudoMap“, `domain/png-text.ts` + `domain/mapdata.ts` + `ha/mapdata-loader.ts`); Tipp wählt den Raum, gemeinsam mit den Kacheln. Vierte Kartendarstellung „Heidi-Karte“ (Paket + Vertrag). Nachbesserung nach Herberts Sichtprüfung: echte Raum-Umrisse (`segmentOutline`), keine Namens-Chips, Auswahl in Tipp-Reihenfolge mit Nummern-Chips, `DxApi.startRooms` (Reihenfolge-Helfer + `vacuum_clean_segment`), Teilpakete im Raumauftrag werden aus dem letzten vollständigen Paket ergänzt (`mergeSegments`, localStorage). Version 2.0.0-alpha.16; Kartendarstellung auf „Heidi-Karte“ gestellt. Lauf 11:50 über die Karte (Küche → Wohnzimmer → Flur): Reihenfolge eingehalten (Bauplan Abschnitt 10). Offen: Reinigungspfad fehlt im Kartenbild bei HA-gestarteten Läufen (Integration, nicht die Karte).
- **4.3c Geräteerkennung (15.09., vorgezogen, PD-012):** `src/ha/device.ts` – Roboter-IDs und Anzeigename kommen aus HA (Konfiguration `robot:`, Entitäts-Register, Zustände); `contract.ts` kennt nur Domäne + Merkmal (`ROBOT_FEATURES`), Paket-Helfer bleiben fest; Selektoren mit ID-Funktionen. Version 2.0.0-alpha.17. Beim Umbenennen des Roboters in HA folgt die Karte, Automationen/Skripte/Paket nicht.
- **v1 abgeschaltet (15.09., Herberts Entscheidung):** Dashboard „Heidi“ ist jetzt v2 (`dreame-x60`); heidi-panel.js, Sicherungen, `dashboards/heidi.yaml` und die v1-Ressource vom Pi entfernt; Referenz `heidi/archiv/`; `deploy.ps1` nur v2. Offen für Herbert: Mushroom, card-mod, expander-card, stack-in-card in HACS deinstallieren.
- **4.3d Geräteprofil Stufe 2 (15.09., PD-013):** Räume aus der Karte (App-Reihenfolge, beliebig viele, versteckte weg; Kurzname/Symbol nach Regel), Optionen aus den Selects, Fähigkeiten aus dem Vorhandensein (`ha/profile.ts`, `domain/rooms.ts`); keine feste Raumliste mehr. Version 2.0.0-alpha.18. Sichtbar: Kacheln jetzt in App-Reihenfolge.
- **4.3e Einrichtungsprüfung (16.09., PD-014):** in der Kopfzeile zwischen Titel und Uhr nur die Symbole mit Befund (rot pulsiert, Klick springt direkt zur Stelle; `dx-setup`-Liste für 4.11 vorbereitet) – acht Prüfungen inkl. Räume ↔ HA-Bereiche (Entitäts-Register `options.vacuum.area_mapping` über callWS) und HA-Reparaturen; Klick springt zur Stelle. Version 2.0.0-alpha.28 (Symbole rechtsbündig neben der Uhr; Bereiche-Symbol springt über `show-child-view` bis in HAs Zuordnungsansicht, `shared/ha-deep.ts`, Regel-12-Ausnahme mit Rückfall). Herbert hat alle sieben Räume HA-Bereichen zugeordnet (Bad, WC, Büro neu; Corridor → Vorraum).
- **Sitzung 16.09. (Teil 4, Claude Code – kein Kartencode geändert, Version bleibt 2.0.0-alpha.28):** (1) Skills im Repo claude-skills-bpm projektneutral (v0.24 → v0.35): git-commit-helper, tracker (+14 references), code-erstellen (+references/stacks), doc-pflege, audit, mockup-erstellen, skill-pflege, skill-neu, chat-wechsel, chatgpt-review; cc-steuerung bleibt Cowork-only. Alles Projektspezifische steht in sechs Profilen dieser CLAUDE.md (Commit, Tracker, Code, Doku, Mockup, Review); Herbert hat alle Skills bei claude.ai hochgeladen. (2) ClickUp: 62 Aufgaben nach Skill-Schema `DX-NNN | KÜRZEL | Titel` mit Description-Template und 11 Custom Fields (von Herbert angelegt) befüllt; DX-046 cancelled, DX-004 shipped, DX-041 cancelled; Modul-Aufgaben DX-056…DX-062, DX-063 HACS/H:www; Next DX-064. (3) Teilaudit: Docs vollständig, Befunde behoben (Abschnitt 10). Skill-Repo Stand v0.35.3 (826a175).
- **Bau modulweise (16.09., Herbert):** Reihenfolge und Definition „Modul fertig“ im Bauplan Abschnitt 1a/11a; Skills sind projektneutral (Profile in CLAUDE.md: Commit, Tracker, Code, Doku, Mockup, Review); ClickUp-Aufgaben heißen `DX-NNN | KÜRZEL | Titel` mit allen Feldern.
- **Zuerst das Roboter-Panel (16.09., Herbert, Sitzung Teil 5):** Neues Modul **R Roboter-Panel** vor Modul A (Bauplan Abschnitt 1a, Notiz Abschnitt 10): `dx-hero` + `dx-auftrag` (4.1, Sichtprüfung + Nachbesserungen – „alles, was mit dem Roboter und Saugen zu tun hat“, gemeint ist das Panel) und der Räume-Dialog im Roboter-Modus (4.6a). 4.6 geteilt in 4.6a (Modul R) / 4.6b Plan-Modus (Modul A). ClickUp: DX-064 Modul R, DX-033 = 4.6a, DX-065 = 4.6b, DX-056 Modul A jetzt zweites Modul.
- **4.14 Texte zentral (17.09., Modul R, DX-066):** `src/i18n/de.ts` (619 Schlüssel) + `src/i18n/t.ts` (`t`, `tx`, `lookup`); alle festen Texte der Karte aus Bausteinen, Shell, Selektoren und Domäne dorthin, Wortlaut unverändert (alle bisherigen Tests grün); Fehlercodes mit Kurz- und Langtext für alle 142 Codes der Integration; Scan-Test gegen neue feste Wörter im Code. Version 2.0.0-alpha.29 eingespielt. Sichtbar: nichts (außer deutschen Kurztexten für bisher rohe Fehlercodes). Sprachumschaltung Post-2.0 (DX-067).
- **PD-015 Warnungs-Chip gebaut (17.09., 4.1-Nachtrag, DX-026):** gelber Chip = Warnung mit ✕ (`button.press` auf `clear_warning`, nur wenn der Knopf verfügbar ist), rot = Fehler ohne ✕; Kurztext im Chip, Langtext beim Verweilen (`src/shared/dx-tip.ts`), Antippen → more-info. Neu im Vertrag: `clearWarning`. Version 2.0.0-alpha.30 eingespielt. Stolperstein: HA-Knöpfe sind mit Zustand `unknown` verfügbar, nur `unavailable` sperrt.
- **PD-016 Fortschrittsbalken gebaut (17.09., 4.1-Nachtrag, DX-026):** Balken der Auftrag-Kachel = `sensor.<gerät>_cleaning_progress` (Roboter-Prozent, nur im Lauf), sonst Raumzählung. Neu im Vertrag: `cleaningProgress`. Version 2.0.0-alpha.31 eingespielt. Herbert geht die Roboter-Entitäten der Reihe nach durch (ENTITAETEN.md), Stand: 2 von 15 der Gruppe „Zustand und Lauf“ (clear_warning, cleaning_progress).
- **Sitzung 17./18.09. (Teil 5, Claude Code):** Modul R „Roboter-Panel“ vor Modul A gestellt (4.6 in 4.6a/4.6b geteilt); ENTITAETEN.md mit Spalten Art, Kurzbeschreibung, Integriert und der vollständigen Warnungs-/Fehlerliste (142 Codes); 4.14 Texte zentral (alpha.29), PD-015 Warnungs-Chip (alpha.30), PD-016 Fortschrittsbalken (alpha.31); Mockup `dreame_x60/mockups/warnung.html` abgenommen. ClickUp: DX-064…DX-067 neu, DX-066 + DX-026 in testing; DX-068 von Herbert angelegt. Arbeitsweise bestätigt: ein Chat je Arbeitsblock, am Ende doc-pflege Modus 8, dann neuer Chat.
- **F.1 Diagnose-Protokoll, Schicht 1 + 2 (18.09., Sitzung Teil 6, DX-068, Backend – Kartenversion bleibt 2.0.0-alpha.31):** Automation `heidi_diagnose_protokoll` schreibt jede Zustands-/Attributänderung aller Entitäten mit „heidi“ im Namen (ohne Kameras), jeden Dienstaufruf an sie und jede Heidi-Automation/jedes Heidi-Skript als JSON-Zeile nach `/config/prognose/diag/heidi_diag-<Tag>.jsonl` (30 Tage) – mit `quelle` benutzer (Name) | automation (`durch`) | system | extern. Automation `heidi_diagnose_debuglog` sichert jede Minute die Debug-Zeilen der Dreame-Integration nach `dreame_debug-<Tag>.log` (14 Tage); `logger:` in `configuration.yaml` (HA-Neustart 20:27). Skript `ha/prognose/diag.py`, Tests `ha/prognose/tests/test_diag.py` (laufen auf dem Pi: `shell_command.heidi_diag_test`, 11 grün), Auswertung `node tools\diag.js` (Starts mit Quelle; `--von/--bis/--debug` = Zeitleiste mit Rohmeldungen). Stolpersteine: `home-assistant.log` gibt es unter HA OS nicht mehr → Log über die Supervisor-Schnittstelle (`ha.ps1 get hassio/core/logs?lines=N`); zeitgesteuerte Automationen haben keinen Eltern-Kontext → Zuordnung über die Kontext-ID des Laufs; HA hängt den Kontext nur ~5 s an den Roboter → `diag.js` ordnet Starts dem letzten Dienstaufruf der 90 s davor zu; `to_json` kann kein Datum → Werte werden Text. Nebenbefund: Integration meldet bei jedem Kartenaufbau `Map render Failed … 'Segment' object has no attribute 'area'`. Probe 18.09. 20:39: Start in der Dreame-App erscheint als „extern“.
- **F.1 Schicht 3 (18.09., PD-017 freigegeben, Version 2.0.0-alpha.32 eingespielt):** Die Karte meldet, was das Roboter-Panel zeigt (Kopf, Arbeitsschritt, Hinweis, Akku, Fortschritt, Zustand), als HA-Ereignis `dreame_x60_anzeige` – nur mit Kartenoption `diagnose: true` (im Dashboard gesetzt), nur bei Admin-Benutzern, höchstens einmal je Sekunde; `src/domain/anzeige.ts`, `DxApi.fireEvent`, Vertrag `HA_EVENTS.anzeige`; die Automation schreibt `art: anzeige` mit. Tests 94 Unit, 9 E2E (hero.js 42), Lint grün. Probe 18.09. 20:48: Dashboard-Start erscheint als „Benutzer Herbert Schrotter“, die Kartenanzeige wurde live mitgeschrieben. **Offen:** Probe Planerstart (nächster Planerlauf → `node tools\diag.js`, erwartet „Automation Heidi: Planer“), dann `tracker done` DX-068.
- **F.2 Seite „Dev“ + „Fehler melden“ (18.09., DX-069, Wunsch Herbert):** Mockup `dreame_x60/mockups/dev.html` erstellt und nach fünf Rückmeldungen Herberts erweitert: Dev-Seite nur für Admin (auch in der Handy-Tab-Leiste) mit Live-Zeitleiste und Starts; Knopf „Fehler melden“ auf jeder Seite links neben der Uhr; **automatische Auswertung mit 23 Regeln** (u. a. Werte-Knöpfe ≠ Roboter, Reihenfolge ≠ gefahren, Planer, Station, Verbindung) und **Ticketsystem `HT-NNNN`** (ein Ticket je Problem mit gesicherten Beweisen, Status neu → angenommen → in Arbeit → gelöst → geschlossen / verworfen, ClickUp-Aufgabe erst beim Bearbeiten, Skill `ticket` für den immer gleichen Ablauf, nichts automatisch). Teilschritte F.2a Backend, F.2b Karte, F.2c Skill. **Mockup von Herbert am 18.09. abgenommen, PD-018 freigegeben**, Karte F.2 im Bauplan Abschnitt 8. Außerdem 18.09.: Diagnose erfasst zusätzlich alle Entitäten des Roboter-Geräts (namensunabhängig); Altlasten-Prüfung (Backend ist kein v1-Rest; echte Reste = 3 `.v1.bak`-Dateien + 4 HACS-Karten, DX-063); Python 3.14.7 ist jetzt auf dem PC (pytest fehlt noch).
- **F.2a Backend (18.09., eingespielt ohne Neustart, Kartenversion bleibt alpha.32):** `diag_regeln.py` (23 Regeln, reine Funktionen), `diag_tickets.py` (Tickets HT-NNNN), `diag.py tail|auswertung|ticket`, Dienste `shell_command.heidi_diag_tail|heidi_diag_auswertung|heidi_ticket` (args = base64-JSON, Antwort über `return_response`), Automation `heidi_diagnose_auswertung` alle 10 min, Ereignis `dreame_x60_meldung` → Ticket; 45 Python-Tests (lokal und Pi). Erste Tickets: HT-0001 Integrationsfehler „Map render Failed“ (offen), HT-0002 Test-Ereignis (verworfen). Am PC: `node tools\diag.js --tickets alle`. 
- **F.2b Karte (18.09., Version 2.0.0-alpha.33 eingespielt):** Seite **Dev** (nur Admin; Seitenleiste, Symbolleiste, Tab-Leiste) mit Protokoll-Zustand, Starts des Tages, Tickets, Regelübersicht und Live-Zeitleiste (`dx-dev`), Ticket-Ansicht (`dx-ticket`), Knopf **„Fehler melden“** links neben der Uhr auf jeder Seite (`dx-report` → Ereignis `dreame_x60_meldung` → Ticket), erweiterte Anzeige-Meldung (Knöpfe, Laden, Werte-Knöpfe als HA-Werte, „Jetzt“, Reihenfolge) mit Lebenszeichen alle 30 s und `ende`. Tests 100 Unit, 10 E2E (neu `dev.js` 29), Lint grün; Meldeweg und Dienste mit Antwort am echten HA geprüft. **Offen:** Sichtprüfung Herbert (Strg+F5: Dev-Seite, „Fehler melden“, Handy-Tab-Leiste), F.2c Skill `ticket`.
- **Nächstes:** Modul R – 4.1 Sichtprüfung `dx-hero`/`dx-auftrag` durch Herbert (DX-026; Herbert geht die Roboter-Entitäten einzeln durch – 1. `clear_warning`: Hinweis-Chip mit ✕, Kurz-/Langtext, PD-015, Mockup `warnung.html` abgenommen 17.09.; Liste aller 142 Codes in ENTITAETEN.md), 4.14 Texte zentral erledigt (DX-066, Sichtprüfung offen), 4.6a Räume-Dialog Roboter-Modus (DX-033, legt `tests/e2e/widths.js` an); dann Modul A Planer – 4.4 `dx-planer` (DX-031), 4.5 Editor + Uhr (DX-032), 4.6b (DX-065), 4.8, 6.1; später Heidi-Karte: Zoom, Zone/Punkt/Hinfahren als Gesten, Sperrzonen (4.12) auf derselben Ebene. Offene Entscheidungen: Bauplan Abschnitt 10 und ClickUp.

## 4. Offene Punkte (Stand 18.09.2026, Claude-Code-Sitzung Teil 6; ClickUp-Bezug je Punkt, Audit 16.09.)
Erledigt:
- [x] HA neu gestartet (14.09. 06:33), v1.3.1 + v2-Helfer aktiv, Repo = `H:\`.
- [x] Große Dateien sind im Repo.
- [x] `device_tracker.s23_ultra_von_herbert_2` zu `person.herbert_schrotter` hinzugefügt
      (per `tools/ha-ws.js person/update`; jetzt GPS + WLAN).
- [x] Zeitpläne in der Dreame-App (IDs 3–6) sind alle deaktiviert.
- [x] **Planer-Bug behoben**: Bedingung auf nicht existierende Entität
      `binary_sensor.heidi_nicht_stoeren` → Planer lief nie (siehe Abschnitt 2).
- [x] Playwright-Tests laufen (nach `npx playwright install chromium`).

Offen:
- [x] Roboter-„Nicht stören“ von 20:00–08:00 auf 20:00–07:00 gesetzt (`time.heidi_dnd_end`),
      damit Plan 2 (Mo/Do, 07:00) pünktlich starten kann.
- [ ] Im Planer-Editor ▶ (Sofortstart) und **Speichern** real im Browser testen (Tests sind grün,
      Live-Klick fehlt noch) → Sichtprüfung in **DX-032** (4.5 Editor, Modul A).
- [x] Aufgeräumt (14.09., per `ha-ws.js config/entity_registry/remove`): 18 v1-Planer-Helfer
      (`input_select.heidi_planN_tage/_raeume`, `input_boolean.heidi_planN_nur_abwesend/_homeoffice`,
      `heidi_homeoffice_modus`, `binary_sensor.heidi_homeoffice`), Integrationsreste
      (`button.heidi_start_mapping`, `camera.heidi_map_data`, `camera.heidi_wifi_map_1`) und die
      alten Personen-Entitäten `person.nicole`/`person.nina` (waren nur noch Register-Einträge,
      `person/delete` kannte sie nicht).
- [ ] **DX-063 [PC]:** HACS-Karten Mushroom, card-mod, expander-card, stack-in-card in HACS deinstallieren
      (nichts verweist mehr darauf; HACS räumt Ressource + `www/community`-Ordner mit weg) und
      `H:\www\_deploy_yamls.txt.old`, `H:\www\heidi-panel-v1.1.0.bak.b64` löschen (Modul F).
- ~~Optional: Remote Control in Claude Code einrichten~~ gestrichen (Herbert, 16.09.; kein Projektpunkt).
- [ ] **DX-068 (F.1) Diagnose-Protokoll – Schicht 1 + 2 laufen seit 18.09. 20:27** (ClickUp in development, Titel/Template/Felder nachgezogen). Schicht 3 (PD-017) seit 18.09. als alpha.32 eingespielt. Offen: (a) **Probe:** App-Start = „extern“ (20:39) und Dashboard-Start = „Benutzer Herbert Schrotter“ (20:48) sind bestätigt; fehlt nur der Planerstart („Automation Heidi: Planer“) → nach dem nächsten Planerlauf `node tools\diag.js --tag <Datum>`; (b) nach ein paar Tagen Größe von `H:\prognose\diag\` ansehen; (c) danach `tracker done` DX-068.
- [ ] **Entitäten-Durchgang (Modul R, ohne eigene ClickUp-Aufgabe, läuft unter DX-026/DX-064):** stehen geblieben bei `sensor.heidi_mapping_time` (Entscheidung offen, Empfehlung „nicht integrieren“), danach `sensor.heidi_relocation_status`; Stand in ENTITAETEN.md (Kopf) und Bauplan Abschnitt 10 (18.09.).
- [ ] **Sichtprüfung Herbert nach Strg+F5 (Version 2.0.0-alpha.33; neu sichtbar: Seite Dev, Knopf „Fehler melden“):** Roboter-Panel (DX-026), Texte unverändert nach 4.14 (DX-066); Warnungs-Chip mit ✕ und Fortschrittsbalken erst beim nächsten echten Fall bzw. Lauf sichtbar – dabei prüfen, wie der Roboter den Fortschritt bei Raumaufträgen rechnet (PD-016).
- [ ] **DX-069 (F.2) Seite „Dev“, Tickets, „Fehler melden“:** Mockup abgenommen 18.09.; bauen in drei Teilschritten (ClickUp-Unteraufgaben): F.2a Backend (`diag.py` Auszug, Auswertung, Tickets), F.2b Karte, F.2c Skill `ticket` (vorher Pfad des Skills-Repos auf diesem PC klären).
- [ ] **DX-019 (2.7):** Python 3.14.7 ist da; Herbert: `python -m pip install pytest`, dann `cd ha/prognose; python -m pytest`.
- [ ] **DX-033 (4.6a) Räume-Dialog Roboter-Modus** – letzter Baustein von Modul R, legt `tests/e2e/widths.js` an.
- Übersicht aller offenen Bauschritte: Bauplan Abschnitt 1a (Module) und ClickUp-Liste „dreame_x60 – Bauplan“ (DX-Aufgaben).

## 5. Referenzen
- Räume: 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur, 5 Büro, 6 Küche, 7 Wohnzimmer.
- Entitäten: `vacuum.heidi`, `camera.heidi_map` (rooms, no_go_areas, no_mopping_areas,
  calibration_points), `select.heidi_room_N_*`, `select.heidi_cleaning_mode`
  (inkl. `mopping_after_sweeping`), `select.heidi_cleaning_route` (inkl. `quick`),
  `sensor.heidi_cleaning_history`.
- Personen: `person.herbert_schrotter`, `person.nicole_2`, `person.nina_2`.
- Cowork-Projektdoku (claude.ai, Projekt „Mein SmartHome"): `claude/heidi-setup.md`.
- Architektur-Review der Karte (Zielarchitektur, Refactoring-Plan, Teststrategie): `docs/dreame_x60/ARCHITEKTUR-REVIEW.md`.
- Bauplan für den Neubau der Karte (v2, Phasen, Statusliste, Entitäts-Vertrag): `docs/dreame_x60/BAUPLAN.md`.
- Backend-Plan Planer: Nachholen innerhalb Arbeitszeit, Ausgehen-Prüfung, Räume nach manuellem Lauf ausnehmen: `docs/dreame_x60/PLANER-NACHHOLEN.md`.
- UX-Anforderung für nach v2 (App-artige Übergänge Bento ↔ Detail, Bewegungssprache, Leitplanken für den Bau): `docs/dreame_x60/UX-TRANSITIONS.md`.
- Karte für andere Roboter (Geräteprofil: Stufe 2 alle Dreame, Stufe 3 Adapter je Marke, Stufe 4 zwei Roboter; Empfehlung Stufe 2 vor 4.4): `docs/dreame_x60/GERAETEPROFIL.md`.
- ChatGPT-Review-Archiv (Zweitmeinung zu Review + Bauplan): `docs/chatgpt-reviews/INDEX.md`.
