# Bauplan Heidi-Karte v2 (Neubau der Oberfläche auf dem bestehenden Backend)

Dieses Dokument ist die Arbeitsanweisung für den Neubau der Heidi-Karte. Es ist für Claude Code
geschrieben (und für Herbert lesbar). Eine Sitzung beginnt mit dem Startprompt in Abschnitt 0,
liest die Statusliste in Abschnitt 1 und arbeitet die nächste offene Aufgabe ab.

Hintergrund und Begründung der Entscheidungen: `docs/ARCHITEKTUR-REVIEW.md`. Fachliche Details
zu Heidi: `heidi/CLAUDE.md`, `docs/HANDOFF.md`.

---

## 0. Startprompt für jede Sitzung

> Lies `CLAUDE.md`, `docs/HANDOFF.md` und `docs/BAUPLAN-V2.md`. Arbeite die nächste offene
> Aufgabe aus der Statusliste (Abschnitt 1) ab. Halte dich an die Regeln in Abschnitt 2.
> Aktualisiere am Ende die Statusliste, committe und pushe.

Aufgaben, die Herberts PC brauchen (Zugriff auf `H:\`, `ha.ps1`, `dump-states.ps1`), sind mit
**[PC]** markiert. Claude Code im Web kann sie vorbereiten, aber nicht ausführen.

---

## 1. Statusliste (bei jeder Sitzung pflegen)

| Phase | Aufgabe | Status |
|---|---|---|
| 0 | 0.1 Alte Tests: Exit-Code bei FEHLER, `test-timeline` in `npm test`, Harness in eine Datei | offen |
| 0 | 0.2 **[PC]** Fixture erneuern: `states-docked.json`, `states-cleaning.json` per `dump-states.ps1` | offen |
| 0 | 0.3 Alte Karte: `sensor.heidi_task_status` in `_signature()` (einzige Änderung an v1) | offen |
| 0 | 0.4 Backend: `rest_min`/`rest_quelle` als Attribute von `sensor.heidi_automatik_status`; Automation liest sie | offen |
| 1 | 1.1 Gerüst: `heidi/card/` mit `package.json`, `tsconfig.json`, esbuild-Skript, ESLint | offen |
| 1 | 1.2 Leere Lit-Shell `heidi-panel-v2` mit Kopfzeile + Version; Build nach `ha/www/heidi-panel-v2.js` | offen |
| 1 | 1.3 `ha/dashboards/heidi-v2.yaml`, Eintrag in `configuration.yaml`, `deploy.ps1` kopiert v2 + bumpt Ressource | offen |
| 1 | 1.4 **[PC]** Ressource `/local/heidi-panel-v2.js` anlegen (ha-ws.js `lovelace/resources/create`), HA neu starten, Dashboard sichtbar | offen |
| 2 | 2.1 `domain/raumwerte.ts` + Tests + `fixtures/raumwerte.vectors.json` | offen |
| 2 | 2.2 `domain/estimate.ts` + Tests + `fixtures/estimate.vectors.json` | offen |
| 2 | 2.3 `domain/timeline.ts` + Tests + `fixtures/timeline.vectors.json` | offen |
| 2 | 2.4 `domain/calibration.ts` + Tests | offen |
| 2 | 2.5 `domain/status.ts` + Tests | offen |
| 2 | 2.6 `domain/labels.ts` + Tests | offen |
| 2 | 2.7 `ha/prognose/tests/test_runlog.py` gegen dieselben Vektoren (pytest) | offen |
| 3 | 3.1 `ha/types.ts`, `ha/selectors.ts` (mit `entityIds`) + Tests gegen Fixture | offen |
| 3 | 3.2 `ha/api.ts` (`HeidiApi`) + Tests (erzeugte Calls) | offen |
| 3 | 3.3 Shell: `shouldUpdate` über vereinigte `entityIds`, Overlay-Zustand, Toast, Escape | offen |
| 4 | 4.1 `heidi-hero` (Kopf + Streifen + Knöpfe) | offen |
| 4 | 4.2 `heidi-map-card` (Kartenslot, Raum-Chips, Zonen-/Stühle-Knopf) | offen |
| 4 | 4.3 `heidi-planer` (Liste, App-Szenen, Dauer-Kurzzeile) | offen |
| 4 | 4.4 `heidi-dialog` (Rahmen) + `heidi-planer-editor` + `heidi-clock-picker` | offen |
| 4 | 4.5 `heidi-rooms-dialog` (Roboter-/Eintrag-Modus) | offen |
| 4 | 4.6 `heidi-history` (Letzter Lauf, Protokoll, Zeitleiste) + `heidi-robot-settings` | offen |
| 4 | 4.7 `heidi-estimate-dialog` (Dauer & Akku mit SVG) | offen |
| 4 | 4.8 `heidi-automatik`, `heidi-station`, `heidi-consumables` | offen |
| 4 | 4.9 `heidi-prognose-card` + `heidi-prognose-view` | offen |
| 4 | 4.10 `heidi-settings-panel` (inkl. Lernwerte) | offen |
| 4 | 4.11 `heidi-zones-editor` | offen |
| 5 | 5.1 Container Queries, Bottom-Sheet-Dialoge, „mehr anzeigen“ im Protokoll | offen |
| 5 | 5.2 E2E bei 390/820/1200 px mit Overflow-Prüfung + Screenshots | offen |
| 6 | 6.1 Paritäts-Checkliste (Abschnitt 9) vollständig grün | offen |
| 6 | 6.2 **[PC]** Eine Woche Parallelbetrieb ohne Befund | offen |
| 6 | 6.3 **[PC]** Umschalten: `heidi.yaml` zeigt auf v2, alte Datei → `heidi-panel-v1.js`, HANDOFF/CLAUDE.md anpassen | offen |

Status-Werte: `offen`, `in Arbeit (Datum)`, `fertig (Commit)`.

---

## 2. Regeln (gelten in jeder Sitzung)

1. **Der Entitäts-Vertrag (Abschnitt 4) wird nicht geändert.** Keine neuen Helfer, keine
   umbenannten Entitäten, kein neues Kurzformat. Alte und neue Karte müssen gleichzeitig auf
   denselben Helfern laufen. Ausnahme: die in Phase 0 gelisteten Backend-Änderungen.
2. **Parität vor neuen Funktionen.** Bis Aufgabe 6.3 kommt keine Funktion in v2, die v1 nicht
   hat. Wünsche kommen in Abschnitt 10 („Nach dem Umschalten“).
3. **Die alte Karte wird nicht angefasst**, außer Aufgabe 0.3. Sie ist der Vergleichsmaßstab.
4. **Fachlogik wird portiert, nicht neu erfunden.** Die Regeln in Abschnitt 6 (Zahlen, Schwellen,
   Sonderfälle) werden 1:1 übernommen. Wer eine Regel für falsch hält, schreibt das in Abschnitt 10
   und portiert sie trotzdem.
5. **Jede Aufgabe endet mit grünen Tests** (`npm test` im Ordner `heidi/card`), einem Build und
   einem Commit. Ein Commit pro Aufgabe, Commit-Text nennt die Aufgabennummer („2.1 raumwerte“).
6. **Version**: `heidi/card/package.json` → `version`, wird beim Build in die Datei geschrieben
   (`HP_VERSION`) und von `deploy.ps1` in die Ressource `?v=` übernommen. Vor Umschalten
   `2.0.0-alpha.N`, beim Umschalten `2.0.0`.
7. **Keine Tests, die nicht fehlschlagen können.** Jeder Test hat eine Erwartung; E2E-Skripte
   setzen `process.exitCode = 1` bei jeder Abweichung.
8. **Kein `window.confirm`** in v2: Bestätigungen laufen über `heidi-dialog` (Variante `confirm`).
9. **Keine externen Ressourcen zur Laufzeit** (keine Google Fonts). Schriften: System-Stack; wenn
   Sora/IBM Plex gewünscht bleiben, als Dateien unter `ha/www/fonts/` mit `@font-face` im
   Shadow-DOM-Stylesheet (Aufgabe für Phase 5, Herbert entscheidet).
10. **Deutsch** in Bezeichnern der Domäne (wie v1: `raeume`, `saug`, `wdh`), Englisch nur für
    Technik (`render`, `update`, `api`).
11. Zahlen, die Verhalten steuern (45 s, 30 s, 8 h, 90 min …), stehen als benannte Konstanten
    in `domain/constants.ts` mit Kommentar, warum.

---

## 3. Technische Festlegungen

| Thema | Festlegung |
|---|---|
| Sprache | TypeScript, `strict: true`, `target: es2022`, keine `any` außer an HA-Grenzen (`hass.states` ist `Record<string, HassEntity>`) |
| UI | Lit 3 (`lit`), ein Element je Bereich, `static styles`, Shadow DOM |
| Build | esbuild, `--bundle --format=esm --target=es2022 --minify=false --outfile=../../ha/www/heidi-panel-v2.js`, `--define:HP_VERSION` aus `package.json`. Sourcemap nur lokal (`--sourcemap=inline` nicht deployen) |
| Element-Namen | `heidi-panel-v2` (Shell) und `heidi-*` für Teile. **Nicht** `heidi-panel`, weil v1 diesen Namen in derselben HA-Instanz registriert |
| Karten-Typ | `custom:heidi-panel-v2`; `window.customCards`-Eintrag mit Name „Heidi Panel v2“ |
| Unit-Tests | `node --test` (Node ≥ 22), Dateien `tests/unit/*.test.ts`, ausgeführt über `tsx` oder esbuild-Vorbau nach `tests/.build/` |
| E2E | Playwright (vorhanden), `tests/e2e/*.js`, gemeinsamer Harness `tests/e2e/harness.js` (ha-icon-Stub, `loadCardHelpers`-Stub, hass-Mock mit Call-Log, `callApi`-Mock); Chromium über `executablePath` mit Fallback wie in v1 |
| Lint | ESLint flat config mit `@typescript-eslint` (recommended) + `eslint-plugin-lit`; keine Formatierungsregeln jenseits von `eslint --fix` |
| HA-Typen | Eigene Minimaldefinition in `ha/types.ts` (`HomeAssistant { states; callService; callApi; }`, `HassEntity`), keine Abhängigkeit `custom-card-helpers` |
| Update-Gating | Shell sammelt `entityIds` aller Selektoren; `shouldUpdate` vergleicht `state` + `last_updated` nur dieser IDs. Kein Handpflegen |
| Overlay | Ein Feld `overlay: Overlay | null` (diskriminierte Union: `settings`, `editor`, `rooms`, `estimate`, `zones`, `confirm`); `back`-Ziel als Feld im Objekt |
| Zustand des Editors | Vollständig im Objekt `PlanDraft` (kein DOM-Rücklesen); Name über `@input` |
| Kartenslot | Element wird einmal je `(Kartenart, dunkel/hell)` erzeugt, im `Map` gecacht und nur bei Wechsel ausgetauscht; `hass` wird bei jedem Update durchgereicht |
| Deploy | `tools/deploy.ps1` kopiert zusätzlich `www/heidi-panel-v2.js`, `dashboards/heidi-v2.yaml` und setzt `heidi-panel-v2.js?v=` aus `HP_VERSION` der v2-Datei |

---

## 4. Entitäts-Vertrag (eingefroren)

Vollständige Liste in `heidi/CLAUDE.md` und `ha/packages/heidi.yaml`. Hier die Gruppen, die v2 liest
(L) und schreibt (S), damit Selektoren und API vollständig sind:

**Roboter (Dreame-Integration)**
- L `vacuum.heidi` (state; Attribute `has_error`, `current_segment`, `active_segments`,
  `cleaning_sequence`, `cleaned_area`, `charging`, `mop_pad`, `paused`, `washing`, `drying`,
  `returning_to_wash`, `mapping`, `cruising`)
- L `camera.heidi_map` (`rooms`, `no_go_areas`, `no_mopping_areas`, `calibration_points`,
  `entity_picture`)
- L `sensor.heidi_status`, `_error`, `_task_status`, `_battery_level`, `_current_room`,
  `_cleaned_area`, `_cleaning_time`, `_cleaning_history` (Attribute je Lauf: `timestamp`,
  `cleaned_area`, `cleaning_time`, `completed`, `mop_pad`), `_cleaning_count`,
  `_total_cleaned_area`, `_total_cleaning_time`, `_first_cleaning_date`
- L `sensor.heidi_main_brush_left`, `_side_brush_left`, `_filter_left`, `_sensor_dirty_left`,
  `_wheel_dirty_left`; S `button.heidi_reset_main_brush`, `_reset_side_brush`, `_reset_filter`,
  `_reset_sensor`, `_reset_wheel`
- L `sensor.heidi_dust_bag_status`, `_clean_water_tank_status`, `_dirty_water_tank_status`,
  `_detergent_status`, `_low_water_warning`, `_auto_empty_status`, `_self_wash_base_status`;
  S `button.heidi_start_auto_empty`, `_self_clean`, `_manual_drying`, `_base_station_cleaning`
- L/S `select.heidi_room_N_cleaning_mode|suction_level|cleaning_times|mop_pad_humidity|cleaning_route`
  (N = 1..7), `switch.heidi_customized_cleaning` (L)
- L/S `select.heidi_carpet_cleaning`, `_water_temperature`, `_drying_time`, `_auto_empty_mode`,
  `_self_clean_frequency`, `_cleangenius`, `_map_rotation`; `number.heidi_self_clean_area`,
  `_volume`; `time.heidi_dnd_start`, `_dnd_end`
- S Dienste: `vacuum.start|pause|stop|return_to_base|locate`,
  `dreame_vacuum.vacuum_clean_segment {segments}`, `vacuum_set_restricted_zone {zones, no_mops}`
  (ersetzt immer alle), `script.heidi_plan_starten {plan, variante}`, `script.heidi_app_szene
  {shortcut_id}`

**Paket (Helfer + Template-Sensoren)**
- L/S je Plan N = 1..4: `input_text.heidi_planN_name|raeume|tage|personen|raumwerte`,
  `input_select.heidi_planN_modus|saugstufe|wasser|route|wiederholungen|homeoffice|ho_saug|ho_wdh|sp_saug|sp_wdh`,
  `input_boolean.heidi_planN_aktiv|schnell`, `input_datetime.heidi_planN_zeit`
- L `sensor.heidi_heutiger_plan` (state = Slot, `name`, `zeit`, `erledigt`, `stoerer`),
  `sensor.heidi_automatik_status` (`detail`; nach 0.4 auch `rest_min`, `rest_quelle`),
  `sensor.heidi_phase`, `binary_sensor.heidi_jemand_zu_hause`, `binary_sensor.heidi_arbeitszeit`,
  `binary_sensor.heidi_nicht_storen`, `sensor.heidi_prognose` (Attribute siehe Paket),
  `sensor.heidi_lernwerte` (`raten`, `raeume`, `laden`, `waesche`, `laeufe_gesamt`)
- L/S `input_boolean.heidi_automatik|dark_mode|planer_bereich|prognose_aktiv|abweichung_heute|nina_zaehlt|prog_herbert|prog_nicole|prog_nina`,
  `input_boolean.stuehle_am_boden`; L `input_boolean.heidi_auto_lauf`,
  `input_text.heidi_auto_letzter_plan`, `input_datetime.heidi_letzte_auto_reinigung`,
  `input_text.heidi_raum_snapshot`
- L/S `input_select.heidi_kartendarstellung|raumnamen|bei_heimkehr`,
  `input_datetime.heidi_arbeitszeit_start|_ende|heidi_rueckkehr`,
  `input_number.heidi_schnell_minuten|min_akku|prognose_intervall|prognose_aufloesung|prognose_wochen|prognose_halbwert|prognose_mindesttage`
- S `shell_command.heidi_prognose_reset`
- L `person.herbert_schrotter`, `person.nicole_2`, `person.nina_2`
- API: `GET history/period/<start>?filter_entity_id=sensor.heidi_phase,vacuum.heidi&end_time=<end>&minimal_response&no_attributes`
- Event: `hass-more-info` (`detail.entityId`) für Akku, Status, Personen, Fehler

**Kurzformate (unverändert)**
- Tage: 7 Zeichen Mo..So, `1`/`0`.
- Räume: IDs mit Komma, Reihenfolge = Anzeigereihenfolge.
- Personen: `herbert,nicole,nina`.
- Raumwerte: `1:B/T/V/-/2;6:S/L/-/-/1` = Raum:Modus/Saug/Wasser/Route/Wdh
  (Modus S/B/W, Saug L/S/K/T, Wasser W/M/V, Route S/I/T, Wdh 1–3, `-` = nicht gesetzt).
- Raum-IDs: 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur, 5 Büro, 6 Küche, 7 Wohnzimmer.
- Anzeigereihenfolge der Raum-Chips: 7, 6, 5, 4, 3, 2, 1.

---

## 5. Zielstruktur

```
heidi/card/
├─ package.json                 name heidi-card, version 2.0.0-alpha.1, scripts: build, watch, test, test:unit, test:e2e, check, lint
├─ tsconfig.json
├─ eslint.config.js
├─ build.mjs                    esbuild-Aufruf (liest version aus package.json, define HP_VERSION)
├─ src/
│  ├─ heidi-panel-v2.ts         Shell: Layout, Tabs, Overlay, shouldUpdate, customElements.define, customCards
│  ├─ config.ts                 E, ROOMS, ROOMS_DE, STATUS_DE, ERR_DE, APP_SCENES, DAYS, OPT, RV, RV_HA, RV_ENT (aus v1 übernommen)
│  ├─ version.ts                export const HP_VERSION (define)
│  ├─ domain/
│  │  ├─ constants.ts           GAP_MS 45000, STALE_ROOM_MS 30000, FLICKER_MS 45000, CUR_WINDOW_H 8, HIST_TAIL_MIN 90, HOME_MIN 3, CHARGE_EXTRA_MIN 4, DEFAULT_RATES, SUCT_F
│  │  ├─ raumwerte.ts           parseRaum, encodeRaum, RoomValues, Modus, Saugstufe, Wasser, Route
│  │  ├─ estimate.ts            estimate(plan, lern, ctx), rate(), chargeMin(), restMin(input)
│  │  ├─ timeline.ts            runsFromVacuum(vt), timelineRows(phaseRows, vacRows, key, startMs, endMs, nowMs)
│  │  ├─ calibration.ts         calibration(points) → {toVac, toMap} | null; rectsFromAttr
│  │  ├─ status.ts              heroModel(input) → {big, sub, buttons, color, errorChip}
│  │  └─ labels.ts              dayLabel, roomLabel, fmtMin, fmtDate, fmtTime
│  ├─ ha/
│  │  ├─ types.ts               HomeAssistant, HassEntity, States
│  │  ├─ selectors.ts           readRobot, readPlan, readRoomValues, readAllRoomValues, readLearn, readHistory(cache), readPrognose, readSettings; je Funktion `xxxEntityIds`
│  │  └─ api.ts                 class HeidiApi
│  ├─ components/               siehe Abschnitt 7
│  ├─ shared/
│  │  ├─ templates.ts           icon, chip, tile, seg, ring, miniRing, switchRow, rangeRow, selectRow
│  │  ├─ toast.ts
│  │  └─ overlay.ts             Overlay-Union + Helfer
│  └─ styles/
│     ├─ tokens.ts              css`` mit --bg … für dunkel/hell (aus v1 `.root` / `.root.light`)
│     └─ base.ts                css`` Basisklassen (.card, .btn, .chip, .seg, .tiles, .row, .sw …)
├─ tests/
│  ├─ unit/*.test.ts
│  ├─ e2e/harness.js, render.js, editor.js, zones.js, timeline.js, live-update.js, widths.js
│  └─ fixtures/
│     ├─ states-docked.json     (aus heidi/tests/real_states.json, erneuert)
│     ├─ states-cleaning.json
│     ├─ raumwerte.vectors.json
│     ├─ estimate.vectors.json
│     └─ timeline.vectors.json
└─ README.md                    Build/Test/Deploy in 10 Zeilen
```

`heidi/tests/` (v1) bleibt bestehen, bis v1 abgeschaltet ist. `heidi/mockups/build-live.js`
bekommt einen Parameter für die v2-Datei (Phase 5, optional).

---

## 6. Portierungstabelle (alt → neu) mit den Regeln, die übernommen werden müssen

| v1 (`ha/www/heidi-panel.js`) | v2 | Regeln, die exakt so bleiben |
|---|---|---|
| `parseRaum`, `encodeRaum`, `RV*` | `domain/raumwerte.ts` | Unbekannter Modus → „Saugen“, unbekannte Saugstufe → „Standard“, Wasser nur bei Modus ≠ Saugen kodieren, Route nur bei „Nur Wischen“, Wdh nur 1–3 sonst „1“, IDs außerhalb 1..7 ignorieren, Ausgabe nach ID sortiert |
| `_estimate`, `_rate`, `_chargeMin`, `_restMin`, `_planVals` | `domain/estimate.ts` | Reihenfolge = `cleaning_sequence` gefiltert auf Planräume, Rest angehängt; Varianten schnell/leise = nur Saugen mit sp-/ho-Profil ohne Raumwerte; Mopp-Wäsche vor Start wenn irgendein Raum nass; Ladestopp wenn `batt - drain < rueckkehr_pct` → laden bis `weiter_pct` + 4 min; Zwischenwäsche wenn nass und `since >= nach_m2`; +3 min Heimfahrt; Ersatzrate: gelernte Rate desselben Modus × Faktor (0.8/1/1.25/1.6) / Faktor der Basis, sonst Standardwerte 0.9/0.3 bzw. 1.6/0.42; Raumfläche Standard 8 m². `restMin`: nach Aufgabe 0.4 aus `sensor.heidi_automatik_status`-Attributen lesen, JS-Kopie nur als Fallback bei fehlendem Attribut |
| `_loadTimeline` (Mitte), `_timelineHtml` (Dauer-Berechnung) | `domain/timeline.ts` | Lauf = `cleaning|paused|returning`; Halt < 45 s unterbricht nicht; Ende = erster Halt ≥ 45 s; `cur` = letzter Lauf, sonst der Lauf, dessen Ende > Start − 60 s; Phasen-Zeilen: nur innerhalb [start − 5 s, stop), ohne `PHASE_IDLE`, Duplikate zusammenlegen, erste Zeile entfernen solange die zweite < 30 s danach kommt, A-B-A mit B < 45 s glätten; Dauer der letzten Zeile bis `stop`; Fenster für `cur` = jetzt − 8 h; Fenster für Eintrag = start … min(start + Dauer + 90 min, nächster Lauf, jetzt) |
| `_calib`, `_rectsFromAttr` | `domain/calibration.ts` | Affine Abbildung aus 3 Punkten per Cramer; `null` bei < 3 Punkten oder Determinante 0; Rechtecke aus `x0..x3/y0..y3` als min/max |
| `_hero` (Textlogik), `STATUS_DE`, `TASK` | `domain/status.ts` | Phase gilt, wenn nicht `unknown/unavailable/""`; groß: `error` → „Fehler“; `paused` → „Pausiert“ + Auftrag; `returning` → „Fährt zur Station“ + Phase; `cleaning` → Auftrag (Planername wenn `heidi_auto_lauf` an, sonst TASK-Text) + Phase; sonst Phase bzw. STATUS_DE; `sub === big` → leer. Knöpfe: cleaning → Pause/Stopp/Station; paused → Weiter/Stopp/Station; returning → Pause/Stopp/Orten; docked → Start/Orten; sonst Start/Station/Orten. Fehler-Chip rot wenn `has_error`, sonst gelb; `no_error`/`unavailable` → kein Chip |
| `_strip`, `_roomVals` | `heidi-hero` + `selectors.readRoomValues` | Nur bei cleaning/paused; `cleaned_area == 0` und cleaning → „Fährt zum Startpunkt zu <erster Raum>“; Raum nicht in `active_segments` (wenn nicht leer) → „Fährt durch <Raum>“; sonst „Jetzt: <Raum>“ + Chips Modus/Saug/(Wasser wenn nass)/(Route wenn nur Wischen)/Wdh, rechts „danach A → B“ oder „letzter Raum“ |
| `_dayLabel`, `_roomLabel`, `_fmtMin`, `fmtDate` | `domain/labels.ts` | 7 Tage „Täglich“, 0 „Manuell“, Mo–Fr, Sa + So, sonst Kürzel mit „ + “ bei ≤ 3 Tagen und Leerzeichen bei > 3; Räume: 7 → „Alle“, 0 → „keine Räume“; Datum `de-AT`, „heute“ |
| `_planRead` | `selectors.readPlan` | Tage-Maske auf 7 Zeichen auffüllen, Räume-Set nur 1..7, Zeit Standard „09:30“, Personen getrimmt |
| `_histAttrs` | `selectors.readHistory(states, cache)` | Wenn Sensor `unknown/unavailable` oder keine Attribute mit `timestamp`: letzten gültigen Stand behalten (Cache lebt in der Shell) |
| `_lern` | `selectors.readLearn` | `null` wenn Sensor fehlt/unavailable oder ohne `raten` |
| `_signature` | Shell `shouldUpdate` aus `entityIds` | Vergleich `state + last_updated`; zusätzlich UI-Zustand (view, overlay) |
| `_saveEditor` | `HeidiApi.savePlan(n, draft)` | Validierung: Name nicht leer, ≥ 1 Raum; Raumwerte nur für gewählte Räume speichern; 16 Calls wie v1 (siehe `heidi/tests/test-editor.js` als Erwartung); Zeit als `HH:MM:00` |
| `_rvClick` (Roboter-Modus) | `HeidiApi.setRoomValue(ids, key, value)` | Optionsname über `RV_HA`-Inverse, Wdh mit Suffix `x`; „Alle Räume“ = alle 7 parallel |
| `_zonesAction("save")` | `HeidiApi.setZones(zones, noMops)` | Immer beide Listen senden |
| `_onClick` `data-svc/press/reset/run/app/shell/toggle/option` | `HeidiApi.vacuum(cmd)`, `press(id)`, `runPlan(n)`, `runScene(id)`, `shell(name)`, `toggle(id)`, `selectOption(id, v)`, `setNumber(id, v)`, `setTime(id, hhmm)` | `runPlan` verweigert bei inaktivem Eintrag (Toast); `setTime` unterscheidet `time.` (`time.set_value`) und `input_datetime` (`set_datetime`); `heidi_prognose_intervall` auf 5/10/15/20/30/60 runden; Dark-Mode über `turn_on/turn_off` |
| `_mountMap` | `heidi-map-card` | Drei Konfigurationen (Dreame-App, Xiaomi-Karte inkl. `predefined_selections`-Koordinaten, Nur Bild) 1:1 übernehmen; Cache je `kind|dark` |
| `_clockHtml`, `_edClick` clock* | `heidi-clock-picker` | 24-h-Ring (0–11 außen, 12–23 innen), Minuten in 5er-Schritten, Stunde wählen → Minutenmodus, OK/Abbrechen |
| `_roomsHtml`, `_rvClick` (Plan-Modus) | `heidi-rooms-dialog` | Plan-Modus: nur gewählte Räume, „eigene Werte“ je Raum, Standard des Eintrags sonst; Wasser nur nass, Route nur „Nur Wischen“ (gedimmt); „Alle auf Standard“; Roboter-Modus: Zeile „Alle Räume“ mit gemeinsamen Werten (`–` bei Abweichung), sofortiges Schreiben, „Raum-Einstellungen nicht verfügbar“ wenn Modus unavailable |
| `_estHtml`, `_estLine` | `heidi-estimate-dialog`, Kurzzeile in `heidi-planer` | Kurzzeile nur wenn Lernwerte; Haken/Kreuz gegen `restMin`; Stecker bei Nachladen; Dialog: Zusammenfassung, Schrittliste, SVG 600×190 mit Linien je 25 %, Rückkehr-Linie, Vergleichslinie Standard↔Turbo, gestrichelt = geschätzt |
| `_history`, `_timelineHtml` | `heidi-history` | 30 Einträge absteigend; „Läuft gerade“ oben nur wenn Roboter unterwegs, Zeitleiste dafür neu laden wenn `last_changed` von Phase oder Vacuum wechselt; Protokoll automatisch offen während eines Laufs; Klick auf Eintrag lädt Zeitleiste einmal (Cache je Schlüssel) |
| `_zonesHtml`, `_zonesBind` | `heidi-zones-editor` | Bild + SVG mit `viewBox` = Bildgröße (Fallback 1332×716); Pointer-Events; Rechteck < 8 px verwerfen; Klick auf Rechteck wählt aus und wechselt Typ; Speichern ersetzt beide Listen; Bild-URL mit Cache-Buster außer `data:` |
| `_panelHtml`, `_lernHtml` | `heidi-settings-panel` | Erscheinungsbild, Kartendarstellung + Drehung, Raumnamen, Funktionen (3 Schalter), Nina zählt, 5 Prognose-Slider mit Live-Wert, Lernwerte-Tabelle, Versionszeile |
| `_renderProg` | `heidi-prognose-view` | Heute-Karte, Lernstatus mit Fortschrittsbalken (`tage / (wochen×7)`), 4 Schalter, Reset mit Bestätigung, drei Heatmap-Bilder `/local/prognose_<name>.png?v=<aktualisiert>` |
| `_prognoseCard` | `heidi-prognose-card` | Nur wenn `prognose_aktiv`; drei Kacheln Frei/Rückkehr/Sicher; Klick → Tab „Prognose“ |
| `_automatik` | `heidi-automatik` | Statuszeile aus `automatik_status` + `detail`; `<details>` Regeln mit Arbeitszeit, Rückkehr, Schnell-Minuten, Mindest-Akku, Bei Heimkehr, Zuletzt |
| `_station`, `_consumables` | `heidi-station`, `heidi-consumables` | Kacheln OK/Prüfen/Leer/Fehlt/Voll wie v1; Ring-Farben ≤ 10 rot, ≤ 25 gelb; Reset mit Bestätigung |
| `_robot` | `heidi-robot-settings` | 7 Selects/Numbers + DND-Zeiten + Knopf „Räume …“ |
| `_renderTop`, Tabs | Shell | Tab „Prognose“ nur wenn aktiv; Fallback auf „Übersicht“ |
| CSS `.root`, `.root.light` | `styles/tokens.ts` | Werte 1:1; `light`-Klasse auf `:host` wenn `dark_mode` aus |

---

## 7. Komponenten (Eingaben, Ausgaben, Abnahme)

Jede Komponente: `@property({attribute:false}) hass`, optional fertige Sicht als Property,
`api: HeidiApi` als Property aus der Shell. Ereignisse nach oben als `CustomEvent`
(`heidi-open-overlay`, `heidi-toast`, `heidi-view`). Keine Komponente ruft `hass.callService`
direkt.

| Element | Bekommt | Sendet | Abnahme (Unit/E2E) |
|---|---|---|---|
| `heidi-panel-v2` | hass | – | Rendert mit `states-docked.json` ohne Konsolenfehler; `shouldUpdate` false bei irrelevanter Änderung, true bei `vacuum.heidi` |
| `heidi-hero` | hass, api | `heidi-open-overlay {rooms}` | Tabelle aus `test-timeline.js` (Kopf, Knöpfe je Zustand); Streifen-Fälle Startpunkt/durchfahren/jetzt |
| `heidi-map-card` | hass, api | `heidi-open-overlay {zones}` | Karten-Element bleibt über 20 hass-Updates dasselbe DOM-Objekt; Raumauswahl → `vacuum_clean_segment {segments}` nach Bestätigung |
| `heidi-planer` | hass, api | `heidi-open-overlay {editor n}`, `{estimate n}` | 4 Zeilen, heutiger Eintrag markiert, Manuell-Tag, ▶ verweigert bei inaktiv |
| `heidi-planer-editor` | hass, api, n | `heidi-close` | Klickfolge aus `test-editor.js` erzeugt dieselben 16 Calls; Live-Update von hass verändert Draft nicht |
| `heidi-clock-picker` | value | `change` | 10 → Minutenmodus → 15 → OK = „10:15“ |
| `heidi-rooms-dialog` | hass, api, mode, draft? | `heidi-close`, `heidi-back` | Roboter-Modus schreibt `select_option` sofort; Plan-Modus ändert nur Draft |
| `heidi-history` | hass, api | – | Zeitleiste aus `test-timeline.js` (7 Zeilen, Summen); Protokoll bleibt bei unavailable |
| `heidi-estimate-dialog` | hass, plan, n | `heidi-close`/`back` | Summen gegen `estimate.vectors.json`; SVG vorhanden |
| `heidi-automatik`, `heidi-station`, `heidi-consumables`, `heidi-robot-settings` | hass, api | – | Jeder Knopf/Select erzeugt den erwarteten Call |
| `heidi-prognose-card`, `heidi-prognose-view` | hass, api | `heidi-view {prog}` | Unsichtbar wenn Prognose aus; Balkenbreite korrekt |
| `heidi-settings-panel` | hass, api | `heidi-close` | Slider-Rundung Intervall; Versionszeile |
| `heidi-zones-editor` | hass, api | `heidi-close` | `test-zones.js`: gezeichnetes Rechteck ergibt dieselben mm-Koordinaten wie v1 |
| `heidi-dialog` | title, variant (`modal`/`sheet`/`confirm`) | `heidi-close`, `heidi-confirm` | Escape schließt; unter 600 px Container als Bottom-Sheet |

---

## 8. Phasen im Detail

### Phase 0 – Netz spannen (v1-Tests werden Abnahme für v2)
- 0.1 `heidi/tests`: gemeinsamer `harness.js`; jeder Test prüft mit `assert` und setzt
  `process.exitCode = 1`; `npm test` führt alle vier aus. Erwartungen aus den heutigen Ausgaben
  festschreiben (16 Calls, 7 Zeitleisten-Zeilen, Zonen-Koordinaten `[-1550,-188,-643,937]` bei
  der Test-Geste).
- 0.2 **[PC]** `tools/dump-states.ps1` → `heidi/card/tests/fixtures/states-docked.json`; während
  eines Laufs erneut → `states-cleaning.json`. Prüfen, dass `sensor.heidi_phase`,
  `sensor.heidi_lernwerte`, `input_text.heidi_planN_raumwerte`, `switch.heidi_customized_cleaning`,
  `binary_sensor.heidi_arbeitszeit`, alle `button.heidi_*` enthalten sind.
- 0.3 v1: `"sensor.heidi_task_status"` in die ID-Liste von `_signature()`; Version 1.6.1; deploy.
- 0.4 Paket: `sensor.heidi_automatik_status` bekommt Attribute `rest_min` (Zahl) und
  `rest_quelle` („Prognose“ | „übliche Rückkehr HH:MM“) mit der Logik aus dem heutigen
  `detail`-Template; `heidi_planer`-Automation nutzt `state_attr(...,'rest_min')` statt eigener
  Berechnung; `detail` bleibt. `template/reload` + `automation/reload`.

### Phase 1 – Gerüst, das in HA sichtbar ist
- 1.1 `heidi/card/package.json` (lit, esbuild, typescript, tsx, eslint, @typescript-eslint,
  eslint-plugin-lit, playwright als devDependency oder Verweis auf `heidi/tests/node_modules`),
  `tsconfig.json`, `eslint.config.js`, `build.mjs`.
- 1.2 Shell rendert Kopfzeile „Heidi“ + Tabs + Versionszeile; `customElements.define("heidi-panel-v2")`.
- 1.3 `ha/dashboards/heidi-v2.yaml` (panel-View, `custom:heidi-panel-v2`), `configuration.yaml`
  Dashboard `heidi-v2-yaml` (Titel „Heidi v2“, Icon `mdi:robot-vacuum-variant`), `deploy.ps1`.
- 1.4 **[PC]** `node tools/ha-ws.js lovelace/resources/create '{"res_type":"module","url":"/local/heidi-panel-v2.js?v=2.0.0-alpha.1"}'`
  (Git Bash), HA-Neustart (neues Dashboard), Strg+F5. Abnahme: „Heidi v2“ in der Sidebar zeigt die Shell.

### Phase 2 – Domäne portieren
Je Modul: Datei, Unit-Test, Vektoren. Vektoren werden **mit v1 erzeugt** (Node-Skript lädt v1 in
Playwright, ruft die alten Methoden mit den Vektor-Eingaben auf und schreibt die Ergebnisse) und
danach eingefroren. So ist „gleich wie v1“ belegt, nicht behauptet.
- 2.7 `pytest` für `runlog.py`: `parse_raumwerte` und `schaetzung` gegen dieselben Vektoren
  (Toleranz ±1 min bei `total`, weil v1 rundet erst am Ende).

### Phase 3 – HA-Schicht
- Selektoren liefern typisierte Objekte und ihre `entityIds`. Unit-Test: jede in der Fixture
  gelesene ID ist in der ID-Menge (Test instrumentiert `states` mit einem Proxy und zählt Zugriffe).
- `HeidiApi` bekommt `hass` per Setter; Unit-Test mit Call-Log.
- Shell: `shouldUpdate`, Overlay-Union, Toast, Escape, Tabs, `hass-more-info`-Weiterleitung.

### Phase 4 – Komponenten
Reihenfolge wie in der Statusliste. Jede Komponente wird nach dem Build in „Heidi v2“ neben
„Heidi“ (v1) angesehen; Unterschiede in Abschnitt 10 notieren, wenn sie gewollt sind, sonst
beheben. Layout in Phase 4 nur Desktop; Phase 5 macht schmal.

### Phase 5 – Responsive
- `container-type: inline-size` auf dem Wrapper der Shell; 2 Spalten ab 880 px Container.
- In Komponenten `@container (max-width: 480px)`-Regeln entsprechend den 12 v1-Media-Queries.
- `heidi-dialog` als Bottom-Sheet unter 600 px.
- Protokoll: 30 Einträge + „mehr anzeigen“ statt innerem Scrollen.
- E2E `widths.js`: 390/820/1200, `scrollWidth <= clientWidth`, Screenshots nach
  `tests/e2e/out/` (gitignored).
- Schriften-Entscheidung (Regel 9) mit Herbert.

### Phase 6 – Parallelbetrieb und Umschalten
- Paritäts-Checkliste (Abschnitt 9) abhaken, jede Zeile an v1 und v2 nebeneinander geprüft.
- **[PC]** Eine Woche Alltag mit v2 als Hauptdashboard, v1 offen zum Vergleich.
- **[PC]** Umschalten: `ha/dashboards/heidi.yaml` → `custom:heidi-panel-v2`; `heidi-v2.yaml`
  entfernen; `ha/www/heidi-panel.js` → `ha/www/heidi-panel-v1.js` (Ressource anpassen oder
  entfernen); `heidi/tests` → `heidi/tests-v1` (oder löschen, wenn v2-Tests alles abdecken);
  `HANDOFF.md`, `heidi/CLAUDE.md`, `CLAUDE.md` auf v2 umschreiben; Version `2.0.0`.

---

## 9. Paritäts-Checkliste (Abnahme für 6.1)

- [ ] Kopf: Akku-Ring, groß/klein-Text in allen 5 Roboter-Zuständen, Personen-Chips (Nina gedimmt wenn „zählt nicht“), Fehler-Chip rot/gelb, DND-Chip, Knöpfe je Zustand, `more-info` bei Klick auf Akku/Status/Person/Fehler
- [ ] Streifen: Startpunkt / durchfahren / jetzt + danach-Liste + 5 Chips; Klick öffnet Räume (Roboter)
- [ ] Karte: 3 Darstellungen, Wechsel per Einstellungen, dunkel/hell, Zonen-Knopf mit Zähler, Stühle-Knopf mit Zustand
- [ ] Raum-Chips: Mehrfachauswahl, Leiste „N Räume reinigen“, Bestätigung, Call, Toast
- [ ] Verschleiß: 5 Ringe, Farben, Reset mit Bestätigung
- [ ] Automatik: Schalter, Statuszeile, Regeln-Details mit 6 Zeilen, alle Eingaben schreiben
- [ ] Planer: 4 Zeilen mit Name, Räume, Modus, Störer-Symbol, Einzelwerte-Symbol, Dauer-Kurzzeile, Tag/Zeit-Tag, ▶ und ✎; App-Szenen mit Bestätigung
- [ ] Editor: alle Felder, Chips, Presets, Uhr, Bedingungen (Personen, Homeoffice mit Mini-Profil, Schnell mit Mini-Profil), Knöpfe Räume einzeln/Roboter-Werte/Dauer & Akku, Speichern → 16 Calls, Abbrechen verwirft
- [ ] Räume-Dialog: beide Modi, Umschalter im Editor-Kontext, „Alle Räume“, gedimmte Zeilen, Zurück zum Eintrag
- [ ] Dauer & Akku: Kurzzeile, Dialog mit Zusammenfassung, Schnellprogramm-Zeile, Schrittliste, Diagramm, Vergleich
- [ ] Prognose: Karte (3 Kacheln), Tab mit Heute/Lernstatus/Schaltern/Reset/Heatmaps; Tab verschwindet wenn aus
- [ ] Station: 4 Kacheln, 4 Knöpfe (Station mit Bestätigung)
- [ ] Letzter Lauf: Kopfzeile mit Summen, 3 Kacheln, Protokoll (30, Chip fertig/abgebrochen, Mopp-Symbol), Zeitleiste je Eintrag, „Läuft gerade“ live, Protokoll bleibt bei unavailable
- [ ] Roboter-Einstellungen: 7 Felder + DND + Räume-Knopf
- [ ] Einstellungen: alle Abschnitte, Slider mit Live-Wert und Rundung, Lernwerte, Version
- [ ] Sperrzonen-Editor: zeichnen, auswählen, löschen, alle löschen (Bestätigung), speichern, Hinweis ohne Kalibrierung
- [ ] Dunkel/Hell, Tab-Wechsel, Escape schließt Overlays
- [ ] Während des Editors aktualisiert sich der Kopf weiter (Verbesserung gegenüber v1, gewollt)
- [ ] Handy (390 px): kein horizontales Scrollen, Dialoge als Sheet, alle Knöpfe erreichbar

---

## 10. Notizen aus dem Bau (Abweichungen, Wünsche, Zweifel)

Hier trägt jede Sitzung ein: gewollte Abweichungen von v1 (mit Grund), Regeln aus Abschnitt 6, die
beim Portieren fragwürdig wirkten, und Funktionswünsche für nach dem Umschalten.

- (leer)

---

## 11. Definition „fertig“

v2 ist fertig, wenn Aufgabe 6.3 erledigt ist: Abschnitt 9 vollständig abgehakt, `npm test` in
`heidi/card` grün (Unit + E2E), `npm run check` (tsc) und `npm run lint` ohne Fehler, eine Woche
Parallelbetrieb ohne offenen Befund, Dashboard `heidi` zeigt v2, v1 liegt als
`heidi-panel-v1.js` daneben, HANDOFF/CLAUDE.md beschreiben v2.
