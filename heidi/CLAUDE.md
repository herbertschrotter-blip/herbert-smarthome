# Heidi – Dreame X60 Ultra

## Entitäten
- `vacuum.heidi`, Karte `camera.heidi_map` (Attribute: rooms, no_go_areas, no_mopping_areas,
  virtual_walls, calibration_points, furnitures, entity_picture).
- Räume (IDs, auf dem Roboter deutsch benannt): 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur, 5 Büro,
  6 Küche, 7 Wohnzimmer.
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
  (Achtung: ö→o in der ID; spiegelt `time.heidi_dnd_start/_end` des Roboters, aktuell 20:00–08:00),
  `sensor.heidi_heutiger_plan`, `sensor.heidi_automatik_status`.
- Weitere Sensoren: heidi_status, heidi_battery_level, heidi_error, heidi_task_status,
  heidi_main_brush_left/side_brush_left/filter_left/sensor_dirty_left/wheel_dirty_left,
  heidi_dust_bag_status, heidi_clean/dirty_water_tank_status, heidi_low_water_warning.

## Eigene Karte `ha/www/heidi-panel.js` (custom:heidi-panel)
- Ein HTMLElement mit Shadow DOM, rendert alles aus `hass.states`, Aktionen über
  `hass.callService`. Kartenbild wird per `loadCardHelpers().createCardElement` eingebettet
  (Dreame-App / Xiaomi-Karte / Nur Bild – Auswahl in den Dashboard-Einstellungen).
- Versionierung: `HP_VERSION` oben in der Datei UND `?v=` in `H:\.storage\lovelace_resources`
  (Schlüssel `type: module`) hochzählen – deploy.ps1 macht das automatisch. Dann HA-Neustart.
- Testen ohne HA: `cd heidi/tests && node test-real.js` (Playwright + Chromium, Screenshot
  `panel_real.png`), `node test-editor.js` (Planer-Editor), `node test-zones.js`
  (Sperrzonen-Editor). `real_states.json` = Abzug echter HA-States.
- Optik: Glas-Kacheln (halbtransparent + Blur), Fonts Sora + IBM Plex Sans (Google Fonts,
  Fallback Roboto), Akzent #2fd1b6. Referenz-Mockups unter `heidi/mockups/`.
- Bereiche: Kopf (Akku-Ring, Status, Personen-Chips, Stühle-Toggle, DND), Karte + Raum-Chips
  (Auswahl → vacuum_clean_segment) + Sperrzonen-Editor (Rechteck aufs Kartenbild, Umrechnung
  über calibration_points), Verschleiß-Ringe, Automatik + Regeln, Planer (4 Einträge, Editor),
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
  vacuum_clean_segment; Route „Schnell“ = global quick, pro Raum standard).
- Automatik (`heidi_planer`): heutiger Eintrag = `sensor.heidi_heutiger_plan` (Attribute name,
  zeit, erledigt, stoerer). Startet ab Uhrzeit, wenn kein „stört“ zu Hause; bei Homeoffice
  (`binary_sensor.heidi_arbeitszeit` Mo–Fr + störende Person da) je nach Eintrag warten oder
  leise starten. Schnellprogramm, wenn Rest bis Rückkehr < `input_number.heidi_schnell_minuten`
  (Rückkehr aus Prognose ab `heidi_prognose_mindesttage`, sonst `input_datetime.heidi_rueckkehr`).
  Erledigt = `input_datetime.heidi_letzte_auto_reinigung` == heute (gesetzt von
  `heidi_lauf_abgeschlossen`). Sperrzone Esstisch über `input_boolean.stuehle_am_boden`.

## Prognose (ha/prognose/presence.py)
Automation protokolliert alle N Minuten (Helfer `heidi_prognose_intervall`) home/not_home je
Person in `presence_log.csv`; `forecast` liefert JSON für `sensor.heidi_prognose` (tage,
freies_fenster, rueckkehr, rueckkehr_min, rueckkehr_wer, sicherheit, homeoffice, empfehlung)
und Heatmaps `www/prognose_*.png`. Parameter: Auflösung (15/30/60 min), Lernzeitraum (Wochen),
Halbwertszeit (Tage) – aus `config.json`, gesetzt über shell_command `heidi_prognose_config`.
Lücken werden nur zwischen Messungen (≤ 90 min) interpoliert, nie extrapoliert.
