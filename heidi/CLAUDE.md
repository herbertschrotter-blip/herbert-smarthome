# Heidi – Dreame X60 Ultra

## Entitäten
- `vacuum.heidi`, Karte `camera.heidi_map` (Attribute: rooms, no_go_areas, no_mopping_areas,
  virtual_walls, calibration_points, furnitures, entity_picture).
- Räume kommen aus `camera.heidi_map.rooms` (ID, Name, Typ, Reihenfolge, Sichtbarkeit); die Karte v2 liest sie
  dynamisch (PD-013, Bauplan Abschnitt 4/GERAETEPROFIL.md). Stand 16.09.2026: 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur,
  5 Büro, 6 Küche, 7 Wohnzimmer; 8 = versteckter Balkon. Namen und Reihenfolge nur in der Dreame-App ändern, nie
  aus HA schreiben.
- Pro Raum: `select.heidi_room_N_cleaning_mode` (sweeping|mopping|sweeping_and_mopping),
  `_suction_level` (quiet|standard|strong|turbo), `_cleaning_times` (1x|2x|3x),
  `_mop_pad_humidity` (slightly_dry|moist|wet), `_cleaning_route` (standard|intensive|deep).
  Global: `select.heidi_cleaning_mode` (zusätzlich mopping_after_sweeping),
  `select.heidi_cleaning_route` (zusätzlich quick).
- Dienste: `dreame_vacuum.vacuum_clean_segment` (segments, repeats, suction_level 0–3),
  `vacuum_set_restricted_zone` (zones / no_mops / walls als [[x1,y1,x2,y2]] in mm – ersetzt
  immer ALLE Zonen des Typs), `vacuum_start_shortcut` (App-Szenen: 32 Eingang, 33 Bad,
  34 Wischen nach Saugen), `vacuum_rename_segment`.
- Reinigungsprotokoll der App: Attribute von `sensor.heidi_cleaning_history`.
- Eigene Template-Sensoren (Paket): `binary_sensor.heidi_arbeitszeit`, `binary_sensor.heidi_nicht_storen`
  (Achtung: ö→o in der ID; spiegelt `time.heidi_dnd_start/_end` des Roboters, aktuell 20:00–07:00),
  `sensor.heidi_heutiger_plan`, `sensor.heidi_automatik_status`,
  `sensor.heidi_phase` = feiner Arbeitsschritt als Text („Wäscht Mopp vor dem Start“, „Saugt und wischt
  Küche“, „Fährt zum Mopp-Waschen“, „Trocknet Mopp“, „Saugt Staub ab“, „Schläft“ …), abgeleitet aus
  den vacuum-Attributen washing/drying/returning_to_wash/mop_pad/cleaning_mode + current_room.
  Der Recorder speichert jede Änderung → die Karte holt daraus per `history/period` die Zeitleiste.
- Weitere Sensoren: heidi_status, heidi_battery_level, heidi_error, heidi_task_status,
  heidi_main_brush_left/side_brush_left/filter_left/sensor_dirty_left/wheel_dirty_left,
  heidi_dust_bag_status, heidi_clean/dirty_water_tank_status, heidi_low_water_warning.

## Eigene Karte v1 `heidi/archiv/heidi-panel.js` (custom:heidi-panel) – **abgeschaltet am 15.09.2026**

v1 läuft nicht mehr in HA (Dashboard-Eintrag, Ressource und Datei auf dem Pi entfernt). Die Datei liegt im Archiv als
Referenz für den Neubau v2 (`dreame_x60/`): Paritätsvektoren (`dreame_x60/card/tools/v1-vectors.js`) und Nachschlagen,
was gebaut war. Nicht mehr deployen, nicht weiterentwickeln. Beschreibung unten = Stand v1.6.2.
- Ein HTMLElement mit Shadow DOM, rendert alles aus `hass.states`, Aktionen über
  `hass.callService`. Kartenbild wird per `loadCardHelpers().createCardElement` eingebettet
  (Dreame-App / Xiaomi-Karte / Nur Bild – Auswahl in den Dashboard-Einstellungen).
- Versionierung: `HP_VERSION` oben in der Datei UND `?v=` in `H:\.storage\lovelace_resources`
  (Schlüssel `type: module`) hochzählen – deploy.ps1 macht das automatisch. Dann HA-Neustart.
- Testen ohne HA: `cd heidi/tests && node test-real.js` (Playwright + Chromium, Screenshot
  `panel_real.png`), `node test-editor.js` (Planer-Editor), `node test-zones.js`
  (Sperrzonen-Editor), `node test-timeline.js` (Phase im Kopf + Zeitleiste, `callApi` nachgebildet,
  Screenshot `panel_timeline.png`). `real_states.json` = Abzug echter HA-States.
- Protokoll (v1.4): jeder Eintrag ist klickbar → Zeitleiste aus der HA-Historie von `sensor.heidi_phase`
  plus `vacuum.heidi` (Zeitfenster: Start bis Start + Dauer + 90 min, gekappt beim nächsten Lauf).
  Lauf = Roboter unterwegs (vacuum cleaning/paused/returning); er endet mit dem ersten Halt danach
  (idle/docked/error = Stopp oder Station). Absaugen/Mopp-Wäsche/Trocknen nach der Rückkehr zählen
  nicht; der nächste Start ist ein neuer Lauf (Herberts Vorgabe). Türschwellen-Flackern A-B-A
  (< 45 s) wird geglättet. Laufender Auftrag erscheint oben als
  „Läuft gerade“ mit Live-Zeitleiste (wird bei jeder Phasenänderung neu geholt). Cache `this._tl`.
- Optik: Glas-Kacheln (halbtransparent + Blur), Fonts Sora + IBM Plex Sans (Google Fonts,
  Fallback Roboto), Akzent #2fd1b6. Referenz-Mockups unter `heidi/mockups/`.
- Bereiche: Kopf (Akku-Ring; groß = Gesamtauftrag: Planer-Name aus `input_text.heidi_auto_letzter_plan`
  wenn `heidi_auto_lauf` an, sonst Auftragsart aus `sensor.heidi_task_status`, bzw. „Pausiert“ /
  „Fährt zur Station“ / Ruhephase; klein darunter = `sensor.heidi_phase`; Personen-Chips, DND;
  Knöpfe je Zustand: cleaning → Pause/Stopp/Station, paused → Weiter/Stopp/Station,
  returning → Pause/Stopp/Orten, docked → Start/Orten, sonst Start/Station/Orten),
  Karte + Raum-Chips (Auswahl → vacuum_clean_segment) + Sperrzonen-Editor (Rechteck aufs Kartenbild,
  Umrechnung über calibration_points) + Knopf „Stühle am Boden“ (Esstisch-Sperrzone),
  Verschleiß-Ringe, Automatik + Regeln, Planer (4 Einträge, Editor),
  Prognose-Kacheln, Station, Letzter Lauf + Protokoll + Roboter-Einstellungen,
  Einstellungs-Panel (Zahnrad), Prognose-Tab.

## Planer (Helfer in ha/packages/heidi.yaml)
Je Eintrag N = 1–4:
- input_text `heidi_planN_name`; `_raeume` = Raum-IDs mit Komma ("7,6,5,4,3,2,1");
  `_tage` = 7 Zeichen Mo..So ("1111100" = Mo–Fr, "0000000" = nur manuell/Szene);
  `_personen` = wer stört (herbert,nicole,nina): bei deren Anwesenheit nicht fahren.
- input_select `_modus` (Saugen | Saugen + Wischen | "Saugen, dann Wischen" | Nur Wischen),
  `_saugstufe`, `_wasser` (Wenig|Mittel|Viel), `_route` (Schnell|Standard|Intensiv|Tief),
  `_wiederholungen`, `_homeoffice` (Warten | Leise starten), Leise-Profil `_ho_saug/_ho_route/
  _ho_wdh`, Schnell-Profil `_sp_saug/_sp_route/_sp_wdh`.
- input_boolean `_aktiv`, `_schnell`; input_datetime `_zeit`.
- Skripte: `heidi_plan_starten` (plan, variante normal|schnell|leise) → `heidi_reinigung`
  (raeume, modus, saugstufe, wasser, route, wiederholungen; setzt Raum-/Global-Selects, dann
  vacuum_clean_segment; Route „Schnell“ = global quick, pro Raum standard; merkt die Raumreihenfolge in
  `input_text.heidi_lauf_reihenfolge`, die Karte zeigt den Lauf in dieser Reihenfolge – seit v1 1.6.2).
- Automatik (`heidi_planer`): heutiger Eintrag = `sensor.heidi_heutiger_plan` (Attribute name,
  zeit, erledigt, stoerer). Startet ab Uhrzeit, wenn kein „stört“ zu Hause; bei Homeoffice
  (`binary_sensor.heidi_arbeitszeit` Mo–Fr + störende Person da) je nach Eintrag warten oder
  leise starten. Schnellprogramm, wenn Rest bis Rückkehr < `input_number.heidi_schnell_minuten`
  (Rückkehr aus Prognose ab `heidi_prognose_mindesttage`, sonst `input_datetime.heidi_rueckkehr`).
  Erledigt = `input_datetime.heidi_letzte_auto_reinigung` == heute (gesetzt von
  `heidi_lauf_abgeschlossen`). Sperrzone Esstisch über `input_boolean.stuehle_am_boden`.

## Dauer & Akku (ha/prognose/runlog.py, v1.6)
Automation `heidi_laufprotokoll` → `runlog.csv` (Rohdaten je Minute/Phasenwechsel). `sensor.heidi_lernwerte`
(command_line) liefert `raten["Modus/Saugstufe"]` (min/m², %/min, Läufe), `raeume` (gemessene Fläche je
Durchgang, Belag), `laden`, `waesche`. Karte: `_estimate(p, variante, uniform)` simuliert einen Eintrag
(Kurzzeile beim Eintrag, Untermenü „Dauer & Akku“ `_estHtml`, Lernwerte im Zahnrad-Panel `_lernHtml`).
Automatik: `shell_command.heidi_schaetzung` mit `response_variable` → Wahl voll/schnell/warten.
Nicht gefahrene Einstellungen werden aus demselben Modus × Saugstufen-Faktor (0.8/1/1.25/1.6) geschätzt.

## Prognose (ha/prognose/presence.py)
Automation protokolliert alle N Minuten (Helfer `heidi_prognose_intervall`) home/not_home je
Person in `presence_log.csv`; `forecast` liefert JSON für `sensor.heidi_prognose` (tage,
freies_fenster, rueckkehr, rueckkehr_min, rueckkehr_wer, sicherheit, homeoffice, empfehlung)
und Heatmaps `www/prognose_*.png`. Parameter: Auflösung (15/30/60 min), Lernzeitraum (Wochen),
Halbwertszeit (Tage) – aus `config.json`, gesetzt über shell_command `heidi_prognose_config`.
Lücken werden nur zwischen Messungen (≤ 90 min) interpoliert, nie extrapoliert.
