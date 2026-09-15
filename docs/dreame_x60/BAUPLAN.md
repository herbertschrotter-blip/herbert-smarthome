# Bauplan dreame_x60 – Neubau der Heidi-Karte (v2) auf dem bestehenden Backend

Projektname seit 15.09.2026: **dreame_x60** (Branch `dreame_x60`, Ordner `dreame_x60/`, Element `dreame-x60-panel`, Bundle `ha/www/dreame_x60.js`, Dashboard `dreame_x60.yaml`). Der Roboter heißt in der Oberfläche weiterhin **Heidi**; Entitäten `heidi_*` bleiben (Abschnitt 4).

Stand: nach ChatGPT-Review Runde 2 (2026-09-14, `docs/chatgpt-reviews/CGR-2026-09-14-heidi-v2/`).

Arbeitsanweisung für den Neubau der Heidi-Karte, geschrieben für Claude Code (und für Herbert
lesbar). Eine Sitzung beginnt mit dem Startprompt (Abschnitt 0), nimmt die nächste offene Aufgabe
aus der Statusliste (Abschnitt 1), liest nur deren Karte in Abschnitt 8 und arbeitet genau diese
Aufgabe ab.

Begründungen: `docs/dreame_x60/ARCHITEKTUR-REVIEW.md`. Fachliches: `heidi/CLAUDE.md`, `docs/HANDOFF.md`.

---

## 0. Startprompt für jede Sitzung

> Lies `CLAUDE.md`, `docs/HANDOFF.md` und `docs/dreame_x60/BAUPLAN.md`. Nimm die nächste offene Aufgabe
> aus der Statusliste (Abschnitt 1), prüfe ihre Voraussetzungen, lies ihre Karte in Abschnitt 8
> und arbeite nur diese Aufgabe ab. Halte dich an die Regeln in Abschnitt 2. Wenn Code und
> Bauplan sich widersprechen: nicht entscheiden, Befund in Abschnitt 10 eintragen, Aufgabe auf
> `blockiert`, stoppen. Am Ende Statusliste aktualisieren, committen, pushen.

**[PC]** = braucht Herberts PC (Zugriff auf `H:\`, `ha.ps1`, `dump-states.ps1`, Browser mit HA).
Claude Code im Web bereitet diese Aufgaben vor, führt sie aber nicht aus.

---

## 1. Statusliste (bei jeder Sitzung pflegen)

| Nr. | Aufgabe | Status |
|---|---|---|
| 0.1 | v1-Tests: Exit-Code bei Abweichung, `test-timeline` in `npm test`, ein Harness | fertig (d6f6778) |
| 0.2 | **[PC]** Fixtures `states-docked.json`, `states-cleaning.json` erneuern | fertig (15.09.; docked 351 Entitäten, cleaning 361 Entitäten beim Lauf 08:37, je 0 fehlend; `access_token` der Kameras jetzt ebenfalls entfernt) |
| 0.3 | v1: `sensor.heidi_task_status` in `_signature()`, Version 1.6.2 (1.6.1 war auf H: schon vergeben) | fertig (b09fe23, a3c9ad9; eingespielt 15.09. 06:24, Ressource ?v=1.6.2); Sichtprüfung Kopf durch Herbert nach Strg+F5 offen |
| 0.4 | Backend: `rest_min`/`rest_quelle` als Attribute, Automation liest sie | fertig (44d5406; eingespielt, check_config valid, Attribute geprüft); Trace-Vergleich beim nächsten Automatik-Lauf offen |
| 1.1 | Toolchain `dreame_x60/card/` | fertig (15.09.; build/check/lint grün) |
| 1.2 | Leere Lit-Shell `dreame-x60-panel`, Build nach `ha/www/dreame_x60.js` | fertig (15.09.; render.js 27/27 grün) |
| 1.3 | Dashboard `dreame_x60.yaml` mit sechs Views, `configuration.yaml`, `deploy.ps1` | fertig (15.09.; YAML geprüft, check_config valid) |
| 1.4 | **[PC]** Ressource anlegen, HA-Neustart, „Heidi v2“ sichtbar | fertig (15.09. 06:44: Ressource `/local/dreame_x60.js?v=2.0.0-alpha.1`, Dashboard `dreame-x60` in der Liste, Bundle wird ausgeliefert); Sichtprüfung im Browser durch Herbert offen |
| 2.0 | `src/ha/contract.ts` + Vektor-Werkzeug `tools/v1-vectors.js` | fertig (15.09.; contract.test.ts grün, sechs Themen mit Beispiel-Vektoren) |
| 2.1 | `domain/raumwerte.ts` + Vektoren | fertig (15.09.; 14 v1-Vektoren + spec grün) |
| 2.2 | `domain/estimate.ts` + Vektoren | fertig (15.09.; 19 v1-Vektoren + spec grün) |
| 2.3 | `domain/timeline.ts` + Vektoren | fertig (15.09.; 3 v1-Vektoren + spec grün, 7 Zeilen aus test-timeline ohne Browser) |
| 2.4 | `domain/calibration.ts` + Tests | fertig (15.09.; 9 v1-Vektoren, Hin/Rück, null-Fälle, Zonen-Geste aus test-zones.js ohne Browser) |
| 2.5 | `domain/status.ts` + Tests | fertig (15.09.; 85 v1-Vektoren: vac × Phase × Automatik-Lauf × Fehler + Sonderfälle, Tabelle aus test-timeline) |
| 2.6 | `domain/labels.ts` + Tests | fertig (15.09.; 25 v1-Vektoren + Formate) |
| 2.7 | `ha/prognose/tests/test_runlog.py` gegen dieselben Vektoren | geschrieben (15.09.); **[PC]** Ausführung offen: kein Python auf Herberts PC – `winget install Python.Python.3.12` + `pip install pytest`, oder auf dem Pi |
| 3.1 | `ha/types.ts`, `ha/memo-selector.ts`, `ha/selectors.ts` + Tests | fertig (15.09.; memo-selector 68 Zeilen, 24 Selektoren, Proxy-/Memo-/Leer-Tests grün) |
| 3.2 | `ha/api.ts` (`DxApi`) + Tests inkl. Teilfehler | fertig (15.09.; 18 Calls exakt gegen heidi/tests/expected/editor-calls.json, Teilfehler, Optionen, Domänen) |
| 3.3 | Shell: `page`-Config, Views, Overlay, Toast, Escape, more-info, Modul-Caches | fertig (15.09.; render/nav/overlay E2E grün) |
| 3.4 | **[PC-Abnahme]** Mockup Seitenstruktur `dreame_x60/mockups/seiten.html` | fertig (15de525; Design-Referenz `dreame_x60/mockups/bento.html`, abgenommen 15.09.) |
| 4.0 | Navigation `dx-nav` (Seitenleiste / Symbolleiste / Tab-Leiste) + Bento-Übersicht mit Platzhaltern | fertig (4788c68; nav.js 28, render.js 42 grün; Version 2.0.0-alpha.2 eingespielt; Herbert 15.09.: „passt“, PD-007 freigegeben) |
| 4.1 | `dx-hero` + `dx-auftrag` | fertig (15.09.; hero.js 16 grün inkl. 85 v1-Kopf-Zustände und Render-Ruhe, strip.test.ts grün; Version 2.0.0-alpha.9 eingespielt; Startpunkt-Fall, Knopfbreite, Stationszeile, Lade-Blitz, „Mopp“ und PD-009 am echten Lauf nachgebessert); Sichtprüfung durch Herbert offen |
| 4.2 | `dx-dialog` (modal/sheet/confirm) | fertig (15.09.; dialog.js 30 grün: Ereignisse, Escape, Fokus, Tab-Falle, Sheet < 640 px, wide, Shell-Bestätigung; Version 2.0.0-alpha.11 eingespielt); Sichtprüfung durch Herbert offen |
| 4.3 | `dx-map-card` (Seite Reinigen) | offen |
| 4.4 | `dx-planer` (Seite Planer) | offen |
| 4.5 | `dx-planer-editor` + `dx-clock-picker` | offen |
| 4.6 | `dx-rooms-dialog` | offen |
| 4.7 | `dx-history` + `dx-robot-settings` (Seiten Protokoll, Einstellungen) | offen |
| 4.8 | `dx-estimate-dialog` | offen |
| 4.9 | `dx-automatik`, `dx-station`, `dx-consumables` | offen |
| 4.10 | `dx-heute` (Übersicht) + `dx-prognose-view` | offen |
| 4.11 | `dx-settings-panel` (Seite Einstellungen, inkl. Diagnose) | offen |
| 4.12 | `dx-zones-editor` | offen |
| 4.13 | Render-Messung (`perf.js`), Erwartung 0/0/0 bei irrelevanten Ticks | offen |
| 5.1 | Container Queries, Bottom-Sheet, „mehr anzeigen“, Safe Area | offen |
| 5.2 | E2E Breiten 390/820/1200 + Overflow | offen |
| 6.1 | E2E Round-Trip v2 → v1 und `availability.js` | offen |
| 6.2 | Paritäts-Checkliste (Abschnitt 9) vollständig | offen |
| 6.3 | **[PC]** Geräte-Sichtung (Companion hoch/quer, Tablet mit Sidebar, Kiosk, Desktop) | offen |
| 6.4 | **[PC]** Sieben Tage Parallelbetrieb ohne freigabeblockierenden Befund | offen |
| 6.5 | **[PC]** Umschalten, v1 archivieren, Doku auf v2 | offen |

Status-Werte: `offen`, `in Arbeit (Datum)`, `fertig (Commit)`, `blockiert (Abschnitt 10)`.

---

## 2. Regeln (gelten in jeder Sitzung)

**Oberste Invariante: v2 ist ein struktureller Neubau des Frontends bei verhaltenskonformer
Portierung der Fachlogik. Kein fachlicher Neuentwurf.** Was v1 tut, tut v2 auch, mit denselben
Zahlen, Schwellen und Sonderfällen, bis Aufgabe 6.5 erledigt ist. Einzige Ausnahmen: die in
Abschnitt 10a freigegebenen Paritätsabweichungen (PD-000 Seitenstruktur ist von Anfang an
freigegeben).

1. **Entitäts-Vertrag eingefroren.** Keine neuen Helfer, keine umbenannten Entitäten, kein neues
   Kurzformat (Ausnahme: Phase 0). Nur `src/ha/contract.ts` erzeugt Entitäts-IDs (auch
   parametrisch: `planEntity(2, "raumwerte")`, `roomEntity(5, "suction_level")`). Keine
   Komponente, kein Selektor, keine API-Methode setzt IDs selbst zusammen.
2. **Parität vor neuen Funktionen.** Bis 6.5 keine Funktion in v2, die v1 nicht hat. Wünsche in
   Abschnitt 10 (Klasse `Post-2.0`).
3. **v1 wird nicht angefasst**, außer 0.3. v1 ist der Vergleichsmaßstab.
4. **Fachlogik portieren, nicht neu erfinden.** Regeln aus Abschnitt 6 1:1. Beim Portieren
   gefundener v1-Fehler: `spec`-Vektor schreiben, der den Fehler eindeutig zeigt, Eintrag in
   Abschnitt 10a mit Status `offen`, Herbert entscheidet. Bis dahin v1-Verhalten reproduzieren.
   Kein stilles „Verbessern“.
5. **Widerspruch zwischen Code und Bauplan:** nicht entscheiden. Eintrag in Abschnitt 10
   (Art `Widerspruch`), Aufgabe `blockiert`, Sitzung beenden.
6. **Jede Aufgabe endet mit** grünen Tests (`npm test` in `dreame_x60/card`), `npm run check`, Build,
   **einem Commit** mit Aufgabennummer im Text („2.1 raumwerte“). Vorher: Voraussetzungen der
   Karte sind `fertig`.
7. **Keine Tests, die nicht fehlschlagen können.** Jeder Test hat eine Erwartung; E2E-Skripte
   setzen `process.exitCode = 1` bei jeder Abweichung.
8. **Zwei Vektor-Dateien je Thema:** `<thema>.v1.json` (Characterization: mit v1 erzeugt,
   Zweck Parität) und `<thema>.spec.json` (Specification: handgeschrieben aus der fachlichen
   Regel, Zweck Korrektheit). Jede kritische Regel (45-s-Halt, A-B-A-Flackern, Raumwerte-Codec,
   Ladestopp, Ersatzrate) hat mindestens einen `spec`-Grenzfall.
9. **Fehlerstrategie:** Selektoren behandeln fehlende Entitäten und `unknown`/`unavailable` und
   liefern typisierte Leerwerte (`null`, leere Liste, Standardwert). UI zeigt „–“ oder blendet
   aus. Nie eine Exception aus einem Selektor, nie `undefined` in ein Template. Ein zentraler
   Diagnose-Selektor unterscheidet `unavailable` (temporär) von `missing` (Vertrag gebrochen).
10. **Rendern:** memoisierte Selektoren je Sicht, keine globale Renderbarriere. Jeder Selektor
    nennt seine Entitäts-IDs; `memo-selector.ts` erzeugt ein neues View-Objekt nur, wenn sich
    für eine dieser IDs `state` oder `last_updated` geändert hat (Standard); ein Selektor darf
    einen eigenen Vergleich definieren (z. B. `vacuum.heidi` nur auf `state` + benannte
    Attribute, `camera.heidi_map` nur auf die genutzten Attribute). Unveränderte Sicht = gleiche
    Referenz = Lit-Kind bleibt ruhig. `memo-selector.ts` bleibt unter 100 Zeilen, sonst stoppen.
    Kein Store, kein Abhängigkeitsgraph, keine Observables.
11. **Parallelbetrieb:** Während der Abnahme wird der Planer-Editor nur in v2 benutzt; v1 dient
    zum Lesen. Derselbe Plan wird nie gleichzeitig in v1 und v2 bearbeitet (16 Helfer, keine
    Transaktion). Jedes Bundle registriert nur seinen Elementnamen und trägt sich nur einmal in
    `window.customCards` ein. Versionen v1/v2 getrennt.
12. **HA-interne Frontend-Bausteine:** Abhängigkeit begrenzt auf die heute nötigen
    Schnittstellen `ha-icon`, `loadCardHelpers().createCardElement`, Event `hass-more-info`,
    HA-Navigation per `navigate`-Event (`location-changed`). Keine Stabilitätsgarantie, deshalb
    nichts darüber hinaus (`ha-switch`, `ha-slider`, `mwc-*`, `ha-dialog` sind tabu); v2 bringt
    eigene Primitive.
13. **Kein `window.confirm`**: Bestätigungen über `dx-dialog` (Variante `confirm`).
14. **Keine externen Ressourcen zur Laufzeit.** System-Schriftstapel bis 2.0; Fonts als
    `Post-2.0`-Wunsch.
15. **Deutsch** in Bezeichnern der Domäne (`raeume`, `saug`, `wdh`), Englisch für Technik.
16. **Verhaltenszahlen** als benannte Konstanten in `domain/constants.ts` mit Kommentar.
17. **Version** aus `dreame_x60/card/package.json`, beim Build als `HP_VERSION` eingesetzt, von
    `deploy.ps1` in `?v=` übernommen. Vor Umschalten `2.0.0-alpha.N`, beim Umschalten `2.0.0`.
18. **Wiederverwendung für ein späteres allgemeines Dashboard ist kein Designziel.**
    Komponentenschnitt nach Zustands- und Verantwortungsgrenzen.
19. **Editor-Draft ist ein Snapshot.** `PlanDraft` entsteht beim Öffnen aus den Helfern und
    wird von HA-Updates nie ersetzt. Ändern sich die Plan-Helfer währenddessen, zeigt der Editor
    „Eintrag wurde außerhalb geändert“. Keine Konfliktauflösung darüber hinaus.
20. **Mehrteilige Schreibvorgänge melden Teilfehler.** `savePlan` und `setZones` werfen nicht
    still; sie liefern, was fehlgeschlagen ist, die UI zeigt es und bleibt mit dem Draft offen.

---

## 3. Technische Festlegungen

`dreame_x60/card/` ist ein eigenständiges Frontend-Paket im gemeinsamen Repo. Keine Workspaces, kein
zweites Repo.

| Thema | Festlegung |
|---|---|
| Sprache | TypeScript, `strict: true`, `target: es2022`; `any` nur an der HA-Grenze |
| UI | Lit 3; Elemente nach Verantwortungsbereich (Abschnitt 7 = Orientierung); `static styles`; Shadow DOM |
| Build | esbuild `--bundle --format=esm --target=es2022 --outfile=../../ha/www/dreame_x60.js --define:HP_VERSION`; kein Sourcemap im Deploy |
| Element/Typ | `dreame-x60-panel` / `custom:dreame-x60-panel` (v1 belegt `heidi-panel`). Bausteine `dx-*` (z. B. `dx-hero`), Ereignisse `dx-*` (`dx-navigate`, `dx-open-overlay` …), Design-Tokens `--dx-*`. „Heidi“ erscheint nur noch als Anzeigetitel und im Dashboard-Namen; Entitäten `heidi_*` bleiben (Herbert, 15.09.) |
| Seiten | Karte bekommt `page: start \| reinigen \| planer \| protokoll \| prognose \| einstellungen` (Standard `start`). Ein YAML-Dashboard mit sechs Views: `start` normal, die anderen `subview: true`, `back_path: /dreame-x60/start`, alle `type: panel` mit dieser Karte. Navigation über `navigate`-Event von HA |
| Caches | Karten-Element, Zeitleisten-Cache, History-Cache auf Modulebene (überleben Seitenwechsel) |
| Unit-Tests | `node --test` über `tsx`, `tests/unit/*.test.ts` |
| E2E | Playwright, `tests/e2e/*.js`, Harness `tests/e2e/harness.js` (ha-icon-Stub, `loadCardHelpers`-Stub, hass-Mock mit Call-Log und Fehlerinjektion, `callApi`-Mock, Render-Zähler), Chromium über `executablePath` mit Fallback |
| Prüfung | `npm run check` = `tsc --noEmit`; `npm run lint` = ESLint flat, `@typescript-eslint` recommended, `eslint-plugin-lit` optional |
| HA-Typen | `src/ha/types.ts` minimal (`HomeAssistant`, `HassEntity`, `States`), keine externe Typabhängigkeit |
| Overlay | `overlay: Overlay \| null`, diskriminierte Union `settings \| editor \| rooms \| estimate \| zones \| confirm`, `back` als Feld |
| Deploy | `tools/deploy.ps1` kopiert zusätzlich `www/dreame_x60.js`, `dashboards/dreame_x60.yaml`, setzt `dreame_x60.js?v=`; v1 unverändert |

---

## 4. Entitäts-Vertrag (eingefroren, technisch in `src/ha/contract.ts`)

`contract.ts` enthält: feste IDs (`ENTITIES`), Generatoren (`planEntity(n, feld)`,
`roomEntity(id, feld)`), zulässige Optionsstrings (`HA_OPTIONS`: deutsch für Helfer, HA-Werte
für Dreame-Selects), Zuordnungen (`ROOM_VALUE_CODES` = `RV`/`RV_HA`/`RV_ENT` aus v1), Dienste,
Personen. Ein Wert, den Automationen oder HA interpretieren, gehört hierher, nicht in
`config.ts`.

Vollständige Liste: `heidi/CLAUDE.md`, `ha/packages/heidi.yaml`. Gruppen (L = lesen, S = schreiben):

**Roboter (Dreame-Integration)**
- L `vacuum.heidi` (state; `has_error`, `current_segment`, `active_segments`, `cleaning_sequence`,
  `cleaned_area`, `charging`, `mop_pad`, `paused`, `washing`, `drying`, `returning_to_wash`,
  `mapping`, `cruising`)
- L `camera.heidi_map` (`rooms`, `no_go_areas`, `no_mopping_areas`, `calibration_points`,
  `entity_picture`)
- L `sensor.heidi_status|error|task_status|battery_level|current_room|cleaned_area|cleaning_time|cleaning_history|cleaning_count|total_cleaned_area|total_cleaning_time|first_cleaning_date`
- L `sensor.heidi_main_brush_left|side_brush_left|filter_left|sensor_dirty_left|wheel_dirty_left`;
  S `button.heidi_reset_main_brush|reset_side_brush|reset_filter|reset_sensor|reset_wheel`
- L `sensor.heidi_dust_bag_status|clean_water_tank_status|dirty_water_tank_status|detergent_status|low_water_warning|auto_empty_status|self_wash_base_status`;
  S `button.heidi_start_auto_empty|self_clean|manual_drying|base_station_cleaning`
- L/S `select.heidi_room_N_cleaning_mode|suction_level|cleaning_times|mop_pad_humidity|cleaning_route` (N 1..7); L `switch.heidi_customized_cleaning`
- L/S `select.heidi_carpet_cleaning|water_temperature|drying_time|auto_empty_mode|self_clean_frequency|cleangenius|map_rotation`; `number.heidi_self_clean_area|volume`; `time.heidi_dnd_start|dnd_end`
- S `vacuum.start|pause|stop|return_to_base|locate`; `dreame_vacuum.vacuum_clean_segment {segments}`; `dreame_vacuum.vacuum_set_restricted_zone {zones, no_mops}` (ersetzt alle); `script.heidi_plan_starten {plan, variante}`; `script.heidi_app_szene {shortcut_id}`

**Paket**
- L/S je Plan N 1..4: `input_text.heidi_planN_name|raeume|tage|personen|raumwerte`;
  `input_select.heidi_planN_modus|saugstufe|wasser|route|wiederholungen|homeoffice|ho_saug|ho_wdh|sp_saug|sp_wdh`;
  `input_boolean.heidi_planN_aktiv|schnell`; `input_datetime.heidi_planN_zeit`
- L `sensor.heidi_heutiger_plan` (Slot; `name`, `zeit`, `erledigt`, `stoerer`);
  `sensor.heidi_automatik_status` (`detail`; nach 0.4 `rest_min`, `rest_quelle`); `sensor.heidi_phase`;
  `binary_sensor.heidi_jemand_zu_hause|arbeitszeit|nicht_storen`; `sensor.heidi_prognose`;
  `sensor.heidi_lernwerte` (`raten`, `raeume`, `laden`, `waesche`, `laeufe_gesamt`)
- L/S `input_boolean.heidi_automatik|dark_mode|planer_bereich|prognose_aktiv|abweichung_heute|nina_zaehlt|prog_herbert|prog_nicole|prog_nina`, `input_boolean.stuehle_am_boden`;
  L `input_boolean.heidi_auto_lauf`, `input_text.heidi_auto_letzter_plan`, `input_datetime.heidi_letzte_auto_reinigung`, `input_text.heidi_raum_snapshot`, `input_text.heidi_lauf_reihenfolge` (Raum-IDs mit Komma; schreibt `script.heidi_reinigung` beim Start, seit v1 1.6.2 / 15.09.)
- L/S `input_select.heidi_kartendarstellung|raumnamen|bei_heimkehr`; `input_datetime.heidi_arbeitszeit_start|arbeitszeit_ende|rueckkehr`;
  `input_number.heidi_schnell_minuten|min_akku|prognose_intervall|prognose_aufloesung|prognose_wochen|prognose_halbwert|prognose_mindesttage`
- S `shell_command.heidi_prognose_reset`
- L `person.herbert_schrotter`, `person.nicole_2`, `person.nina_2`
- API `GET history/period/<start>?filter_entity_id=sensor.heidi_phase,vacuum.heidi&end_time=<end>&minimal_response&no_attributes`
- Events `hass-more-info` (`detail.entityId`); Navigation `location-changed` nach `history.pushState`

**Kurzformate (unverändert)**
- Tage `1111100` (Mo..So); Räume `7,6,5,4,3,2,1` (Reihenfolge = Anzeige); Personen `herbert,nicole,nina`.
- Raumwerte `1:B/T/V/-/2;6:S/L/-/-/1` = Raum:Modus/Saug/Wasser/Route/Wdh
  (Modus S/B/W, Saug L/S/K/T, Wasser W/M/V, Route S/I/T, Wdh 1–3, `-` = nicht gesetzt).
- Raum-IDs: 1 Bad, 2 Schlafzimmer, 3 WC, 4 Flur, 5 Büro, 6 Küche, 7 Wohnzimmer. Chip-Reihenfolge 7..1.

---

## 5. Zielstruktur

```
dreame_x60/card/
├─ package.json, tsconfig.json, eslint.config.js, build.mjs, README.md
├─ src/
│  ├─ dreame-x60-panel.ts         Shell: page-Config, Seitenlayout, Overlay, Views aus Selektoren, define, customCards
│  ├─ config.ts                 nur Anzeige: ROOMS (Kurzname, Icon), ROOMS_DE, STATUS_DE, ERR_DE, APP_SCENES, DAYS, NAV
│  ├─ version.ts
│  ├─ domain/
│  │  ├─ constants.ts           GAP_MS 45000, STALE_ROOM_MS 30000, FLICKER_MS 45000, CUR_WINDOW_H 8, HIST_TAIL_MIN 90, HOME_MIN 3, CHARGE_EXTRA_MIN 4, DEFAULT_RATES, SUCT_F
│  │  ├─ raumwerte.ts  estimate.ts  timeline.ts  calibration.ts  status.ts  labels.ts
│  ├─ ha/
│  │  ├─ contract.ts            Abschnitt 4
│  │  ├─ types.ts
│  │  ├─ memo-selector.ts       memoizeSelector(ids, fn, compare?) – < 100 Zeilen
│  │  ├─ selectors.ts           readRobot, readPlan(n), readRoomValues(id), readAllRoomValues, readLearn, readHistory, readPrognose, readSettings, readDiagnostics
│  │  └─ api.ts                 class DxApi
│  ├─ components/               Abschnitt 7
│  ├─ shared/                   templates.ts (icon, chip, tile, seg, ring, miniRing, switchRow, rangeRow, selectRow), toast.ts, overlay.ts, navigate.ts, robot-svg.ts
│  └─ styles/                   tokens.ts (aus v1 .root/.root.light), base.ts
├─ tests/
│  ├─ unit/*.test.ts
│  ├─ e2e/harness.js, render.js, editor.js, zones.js, timeline.js, live-update.js, availability.js, widths.js, roundtrip-v1.js, perf.js, nav.js
│  └─ fixtures/
│     ├─ states-docked.json, states-cleaning.json
│     ├─ raumwerte.v1.json, raumwerte.spec.json
│     ├─ estimate.v1.json, estimate.spec.json
│     └─ timeline.v1.json, timeline.spec.json
└─ tools/
   ├─ v1-vectors.js             erzeugt *.v1.json aus v1 in Playwright
   └─ check-fixture.js          prüft Fixture gegen Abschnitt 4
```

`heidi/tests/` (v1) bleibt bis zum Umschalten. Mockups liegen in `dreame_x60/mockups/` (3.4).

---

## 6. Portierungstabelle (alt → neu) mit den Regeln, die exakt bleiben

| v1 (`ha/www/heidi-panel.js`) | v2 | Regeln |
|---|---|---|
| `E`, `RV`, `RV_HA`, `RV_ENT`, `OPT`, Personen | `ha/contract.ts` | Werte 1:1 |
| `parseRaum`, `encodeRaum` | `domain/raumwerte.ts` | Unbekannter Modus → „Saugen“, unbekannte Saugstufe → „Standard“, Wasser nur bei Modus ≠ Saugen kodieren, Route nur bei „Nur Wischen“, Wdh nur 1–3 sonst „1“, IDs außerhalb 1..7 ignorieren, Ausgabe nach ID sortiert |
| `_estimate`, `_rate`, `_chargeMin`, `_restMin`, `_planVals` | `domain/estimate.ts` | Reihenfolge = Raumliste des Eintrags in gespeicherter Reihenfolge (seit v1 1.6.2; vorher `cleaning_sequence` ∩ Planräume); schnell/leise = nur Saugen mit sp-/ho-Profil ohne Raumwerte; Wäsche vor Start wenn ein Raum nass; Ladestopp wenn `batt − drain < rueckkehr_pct` → laden bis `weiter_pct` + 4 min; Zwischenwäsche wenn nass und `since ≥ nach_m2`; +3 min Heimfahrt; Ersatzrate: gelernte Rate desselben Modus × Faktor (0.8/1/1.25/1.6) / Faktor der Basis, sonst 0.9/0.3 bzw. 1.6/0.42; Raumfläche Standard 8 m². `restMin` nach 0.4 aus Attribut, JS nur Fallback |
| `_loadTimeline` (Mitte), `_timelineHtml` (Dauer) | `domain/timeline.ts` | Lauf = `cleaning|paused|returning`; Halt < 45 s unterbricht nicht; Ende = erster Halt ≥ 45 s; `cur` = letzter Lauf, sonst Lauf mit Ende > Start − 60 s; Zeilen in [start − 5 s, stop), ohne `PHASE_IDLE`, Duplikate zusammen, erste Zeile weg solange zweite < 30 s danach, A-B-A mit B < 45 s glätten; letzte Dauer bis `stop`; Fenster `cur` = jetzt − 8 h; Fenster Eintrag = start … min(start + Dauer + 90 min, nächster Lauf, jetzt) |
| `_calib`, `_rectsFromAttr` | `domain/calibration.ts` | Affin aus 3 Punkten (Cramer); `null` bei < 3 Punkten oder Determinante 0; Rechtecke min/max aus `x0..x3/y0..y3` |
| `_hero` (Textlogik), `STATUS_DE`, `TASK` | `domain/status.ts` | Phase gilt wenn nicht `unknown/unavailable/""`; `error` → „Fehler“; `paused` → „Pausiert“ + Auftrag; `returning` → „Fährt zur Station“ + Phase; `cleaning` → Auftrag (Planername wenn `heidi_auto_lauf`, sonst TASK) + Phase; sonst Phase bzw. STATUS_DE; `sub === big` → leer. Knöpfe: cleaning Pause/Stopp/Station; paused Weiter/Stopp/Station; returning Pause/Stopp/Orten; docked Start/Orten; sonst Start/Station/Orten. Fehler-Chip rot bei `has_error`, sonst gelb; `no_error`/`unavailable` kein Chip |
| `_strip`, `_roomVals` | `dx-hero`, `selectors.readRoomValues` | Nur cleaning/paused; Reihenfolge des Laufs = `input_text.heidi_lauf_reihenfolge`, wenn sie genau die `active_segments` enthält, sonst `cleaning_sequence` ∩ `active_segments` (v1 1.6.2); `cleaned_area == 0` ∧ cleaning → „Fährt zum Startpunkt zu <erster Raum>“; Raum ∉ `active_segments` (nicht leer) → „Fährt durch <Raum>“; sonst „Jetzt: <Raum>“ + Chips Modus/Saug/(Wasser wenn nass)/(Route wenn nur Wischen)/Wdh, rechts „danach A → B“ oder „letzter Raum“ |
| `_dayLabel`, `_roomLabel`, `_fmtMin`, `fmtDate` | `domain/labels.ts` | 7 „Täglich“, 0 „Manuell“, Mo–Fr, Sa + So, sonst Kürzel mit „ + “ bei ≤ 3 und Leerzeichen bei > 3; 7 Räume „Alle“, 0 „keine Räume“, sonst Kurznamen in der Reihenfolge der Raumliste (v1 1.6.2); `de-AT`, „heute“ |
| `_planRead` | `selectors.readPlan` | Maske auf 7 auffüllen, Räume nur 1..7, Zeit Standard „09:30“, Personen getrimmt |
| `_histAttrs` | `selectors.readHistory` | Bei `unknown/unavailable` oder ohne `timestamp`-Attribute letzten Stand behalten (Modul-Cache) |
| `_lern` | `selectors.readLearn` | `null` ohne `raten` oder bei unavailable |
| `_signature` | `memo-selector.ts` | Kein globaler Vergleich; je Selektor |
| `_saveEditor` | `DxApi.savePlan` | Name nicht leer, ≥ 1 Raum; Raumwerte nur gewählter Räume; 18 Calls wie v1 (5 input_text, 10 input_select, 2 input_boolean, 1 input_datetime); Zeit `HH:MM:00`; Ergebnis `{ok, fehlgeschlagen[]}` |
| `_rvClick` (Roboter) | `DxApi.setRoomValue` | Option über `RV_HA`-Inverse, Wdh + `x`; „Alle“ = 7 parallel |
| `_zonesAction("save")` | `DxApi.setZones` | Beide Listen senden |
| `_onClick` svc/press/reset/run/app/shell/toggle/option | `DxApi.vacuum/press/runPlan/runScene/shell/toggle/selectOption/setNumber/setTime` | `runPlan` verweigert bei inaktiv; `setTime` unterscheidet `time.` und `input_datetime`; Intervall auf 5/10/15/20/30/60 runden; Dark-Mode `turn_on/off` |
| `_mountMap` | `dx-map-card` | Drei Konfigurationen 1:1; Cache je `kind|dark` auf Modulebene |
| `_clockHtml`, clock-Zweige | `dx-clock-picker` | 24-h-Ring (0–11 außen, 12–23 innen), 5-min-Schritte, Stunde → Minutenmodus, OK/Abbrechen |
| `_roomsHtml`, `_rvClick` (Plan) | `dx-rooms-dialog` | Plan: nur gewählte Räume, „eigene Werte“, Standard sonst, Wasser nur nass, Route nur „Nur Wischen“, „Alle auf Standard“; Roboter: „Alle Räume“ mit gemeinsamen Werten (`–` bei Abweichung), sofort schreiben, Hinweis bei unavailable |
| `_estHtml`, `_estLine` | `dx-estimate-dialog`, Kurzzeile in `dx-planer` | Kurzzeile nur mit Lernwerten; ✓/✗ gegen `restMin`; Stecker bei Nachladen; Dialog: Summe, Schritte, SVG 600×190, 25-%-Linien, Rückkehr-Linie, Vergleich Standard↔Turbo, gestrichelt = geschätzt |
| `_history`, `_timelineHtml` | `dx-history` | 30 absteigend; „Läuft gerade“ nur unterwegs, Nachladen bei `last_changed`-Wechsel; Protokoll offen im Lauf; Klick lädt einmal (Cache) |
| `_zonesHtml`, `_zonesBind` | `dx-zones-editor` | `viewBox` = Bildgröße (Fallback 1332×716); Pointer-Events; < 8 px verwerfen; Klick wählt + wechselt Typ; Speichern ersetzt beide Listen; Cache-Buster außer `data:` |
| `_panelHtml`, `_lernHtml` | `dx-settings-panel` | Erscheinungsbild, Karte + Drehung, Raumnamen, Funktionen, Nina zählt, 5 Slider live, Lernwerte, Version, neu: Diagnose |
| `_renderProg` | `dx-prognose-view` | Heute, Lernstatus (`tage/(wochen×7)`), 4 Schalter, Reset mit Bestätigung, Heatmaps `/local/prognose_<name>.png?v=<aktualisiert>` |
| `_prognoseCard` | `dx-heute` | Kachel „Heute“: heutiger Eintrag (`sensor.heidi_heute_plan`); Prognose-Zeilen (freies Fenster mit Sicherheit, erste Rückkehr mit Person) und Link nur bei `prognose_aktiv`; Klick → Seite Prognose |
| `_automatik` | `dx-automatik` | Einzeiler + Schalter (Start); Regeln-Details (Planer) |
| `_station`, `_consumables` | `dx-station`, `dx-consumables` | Kacheltexte; Ringfarben ≤ 10 rot, ≤ 25 gelb; Reset mit Bestätigung |
| `_robot` | `dx-robot-settings` | 7 Felder + DND + „Räume …“ |
| `_renderTop`, Tabs | Shell + `dx-nav` | Tabs entfallen (PD-000); Prognose-Eintrag nur bei aktiv |
| CSS `.root`, `.root.light` | `styles/tokens.ts` | Werte 1:1; `light` auf `:host` wenn `dark_mode` aus |

---

## 7. Seiten und Komponenten (Orientierung)

**Seiten (PD-000, Mockup in 3.4 ist verbindlich, dieser Vorschlag ist Ausgangspunkt):**

| Seite | Inhalt |
|---|---|
| `start` | **Bento-Raster (12 Spalten) nach `bento.html`, Stand 15.09.:** Reihe 1: Roboter-Panel `span3` (`dx-hero`: Name, Status, Station, Roboter-Bild, Akku, Chips, Modus/Saug/Wasser, Knöpfe, Streifen im Lauf) · Live-Karte `span6` (`dx-map-card compact`: Reiter Live-Karte / Räume → `reinigen` / Sperrzonen → Overlay / Reinigungsverlauf → `protokoll`, Karte, Bildunterschrift; keine Werkzeuge) · rechte Spalte `span3` (`stack`): im Lauf `dx-auftrag` (Aktueller Auftrag), sonst `dx-automatik` (Schalter, Status, „Regeln & Planer“), darunter `dx-heute` (heutiger Eintrag, Prognose-Zeilen nur bei aktiv, Homeoffice). Reihe 2 je `span3`: `dx-planer compact` (drei Einträge, „Alle 4“), `dx-consumables`, `dx-station`, `dx-stats` (PD-006). Reihe 3: `dx-quickstart` `span7` (Raumkacheln + „Alles“, Leiste „N Räume reinigen“) · `dx-history compact` `span5` (drei letzte Läufe, „Alle anzeigen“). ≤ 1099 px Container: 6 Spalten, Roboter-Panel und rechte Spalte nebeneinander, Karte darunter in voller Breite; ≤ 640 px: eine Spalte. Navigation außerhalb des Rasters: `dx-nav` (Seitenleiste > 1180 px, Symbolleiste 761–1180 px, Tab-Leiste ≤ 760 px). Abweichungen zu v1 in PD-005/PD-006/PD-007. Abgenommen von Herbert am 15.09. (Mockup `dreame_x60/mockups/bento.html`); die ältere Zweispalten-Fassung (`seiten.html`, 14.09.) ist damit abgelöst |
| `reinigen` | `dx-map-card` (Kartenwahl in der Kopfzeile, Karte mit Knöpfen „Hinfahren“ und „Sperrzonen“ unten links, Segment Räume / Zone / Punkt mit „Alles“, Raum-Chips im Modus Räume), App-Szenen, Schalter „Stühle am Boden“ als Zeile, Knopf „Räume (Roboter-Werte)“. Referenz: `dreame_x60/mockups/karte.html` (echte Xiaomi-Karte im Glas-Design) und Seite Reinigen in `dreame_x60/mockups/seiten.html` |
| `planer` | `dx-planer` (Liste, Dauer-Kurzzeile), Automatik-Regeln, Editor/Räume/Dauer-Dialoge |
| `protokoll` | `dx-history` (Letzter Lauf, Protokoll, Zeitleiste), Lernwerte-Tabelle |
| `prognose` | `dx-prognose-view` |
| `einstellungen` | `dx-settings-panel` als Seite (statt Seitenleiste), `dx-robot-settings`, Diagnose, Version |

**Design-Referenz (14.09., Herberts Designvorgabe „Automotive Dark Bento“):** `dreame_x60/mockups/bento.html` zeigt alle sechs Seiten und Dialoge im neuen Look (dunkles Graphit, Bento-Flächen, Seitenleiste auf Desktop, Symbolleiste auf Tablet, Tab-Leiste und Bottom-Sheets auf Smartphone, Design-Tokens `--dx-*`). Es löst die Glas-Optik der Mockups `dreame_x60/mockups/start.html`/`dreame_x60/mockups/seiten.html` ab; die Seitenschnitte und Funktionen bleiben. Von Herbert abgenommen am 15.09. (Chat Teil 2); die Optik aller Komponenten in Phase 4 folgt diesem Mockup. Regel 14 gilt: System-Schriftstapel, keine externen Ressourcen.

Jede Komponente: `hass`, ihre Sicht (memoisiert), `api` als Properties; Ereignisse nach oben
(`dx-open-overlay`, `dx-toast`, `dx-navigate`, `dx-close`, `dx-back`). Keine
Komponente ruft `hass.callService` direkt. Teilen zwei Elemente Zustand, werden sie eines;
trägt eines zwei unabhängige Zustände, werden es zwei.

| Element | Bekommt | Sendet | Abnahme |
|---|---|---|---|
| `dreame-x60-panel` | hass, config.page | – | Rendert jede Seite mit `states-docked.json` ohne Konsolenfehler |
| `dx-nav` | page, prognoseAktiv, version | `dx-navigate {page}`, `dx-open-overlay {rooms}` | Drei Formen nach Container `app` (Seitenleiste / Symbolleiste / Tab-Leiste); Klick löst `location-changed` mit `/dreame-x60/<page>` aus; Prognose-Eintrag nur bei aktiv; „Räume“ öffnet das Overlay (E2E `nav.js`) |
| `dx-hero` | robotView, api | `dx-open-overlay {rooms}` | Kopf-Tabelle aus 0.1; Streifen-Fälle |
| `dx-auftrag` | robotView | `dx-open-overlay {rooms}` | Nur im Lauf; Route, Minuten/Fläche/seit, Räume x/7, nächster Raum aus `readRobot` (PD-007) |
| `dx-heute` | plansView, prognoseView, robotView (Personen, DND) | `dx-navigate {prognose}` | Heutiger Eintrag mit Status; Zeile „Zu Hause“ mit Störer-Hinweis (PD-009); Prognose-Zeilen und Link nur bei `prognose_aktiv` |
| `dx-quickstart` | roomOrder, allRoomValues, api | – | Raumkacheln 7..1 + „Alles“ (wählt alle sieben); Leiste → `vacuum_clean_segment` nach Bestätigung, gleiche Auswahl-Logik wie Modus Räume der Karte |
| `dx-stats` | historyView | – | Sieben Tagesbalken + Summen Läufe/Fläche/Zeit (PD-006) |
| `dx-dialog` | title, variant | `dx-close`, `dx-confirm` | Escape; Sheet < 600 px Container |
| `dx-map-card` | hass, mapView, api, kind, dark, variant (`full` \| `compact`) | `dx-open-overlay {zones}`, `dx-navigate {reinigen}` (compact) | Element über 20 Ticks identisch; `vacuum_clean_segment` nach Bestätigung; Moduswechsel gibt der Karte genau einen `map_modes`-Eintrag; `compact` ohne Segment, Knöpfe und Chips, mit Bildunterschrift |
| `dx-planer` | plans[], today, lern, restMin, api, variant (`full` \| `compact`) | `{editor n}`, `{estimate n}`, `dx-navigate {planer}` (compact) | 4 Zeilen, heutiger markiert, ▶ verweigert bei inaktiv; `compact`: drei Einträge nur Anzeige, „Alle 4“ |
| `dx-planer-editor` | api, n, draft | `dx-close` | 18 Calls; Draft überlebt hass-Update; Teilfehler sichtbar; Hinweis „außerhalb geändert“ |
| `dx-clock-picker` | value | `change` | 10 → Minuten → 15 → OK = „10:15“ |
| `dx-rooms-dialog` | roomValues, api, mode, draft? | `dx-close`, `dx-back` | Roboter: sofort `select_option`; Plan: nur Draft |
| `dx-history` | historyView, api, variant (`full` \| `compact`) | `dx-navigate {protokoll}` (compact) | 7 Zeilen aus 0.1; bleibt bei unavailable; ein `callApi` je Klick; `compact`: drei letzte Läufe ohne Zeitleiste |
| `dx-estimate-dialog` | plan, lern, restMin | `dx-close`/`back` | Summen = `estimate.v1.json` Plan 2 |
| `dx-automatik`, `dx-station`, `dx-consumables`, `dx-robot-settings` | Sicht, api | – | Jeder Knopf/Select/Slider → erwarteter Call |
| `dx-prognose-view` | prognoseView, api | – | Balken = `tage/(wochen×7)`; Reset → `shell_command` |
| `dx-settings-panel` | settingsView, diagnostics, api | – | Slider-Rundung; Diagnose listet fehlende IDs |
| `dx-zones-editor` | mapView, api | `dx-close` | Geste aus 0.1 → gleiche mm-Koordinaten |

---

## 8. Aufgabenkartei

Sechs Felder je Karte: **Voraussetzung** (Aufgaben, die `fertig` sein müssen), **Ziel**,
**Nicht ändern**, **Akzeptanz** (prüfbar), **Tests** (Befehle), **Dateien**. Kurz halten.

### Phase 0 – Netz spannen

**0.1 v1-Tests scharf stellen**
- Voraussetzung: –
- Ziel: Ein `harness.js` für alle vier v1-Tests; `assert`-Erwartungen; `process.exitCode = 1` bei Abweichung; `npm test` führt alle vier aus. Festgeschriebene Erwartungen: 18 Calls für Plan 2 (Klickfolge aus `test-editor.js`), Kopf-Tabelle und 7 Zeitleisten-Zeilen aus `test-timeline.js`, Zonen `[[-4200,-4775,-1150,-2075],[-1550,-188,-643,937]]` aus `test-zones.js`, `test-real.js` ohne Konsolenfehler.
- Nicht ändern: `ha/www/heidi-panel.js`, `real_states.json`, die Klickfolgen.
- Akzeptanz: `npm test` grün; eine absichtlich falsche Erwartung macht ihn rot (probieren, zurücknehmen).
- Tests: `cd heidi/tests && npm test`
- Dateien: `heidi/tests/harness.js`, `heidi/tests/test-*.js`, `heidi/tests/package.json`

**0.2 [PC] Fixtures erneuern**
- Voraussetzung: –
- Ziel: `states-docked.json` (angedockt) und `states-cleaning.json` (mitten im Lauf, `current_segment` gesetzt) per `tools/dump-states.ps1`; `tools/check-fixture.js` prüft gegen Abschnitt 4.
- Nicht ändern: Inhalt der Abzüge von Hand (Ausnahme: Geheimnisse entfernen, in Abschnitt 10 notieren); `heidi/tests/real_states.json`.
- Akzeptanz: `check-fixture.js` meldet für beide Dateien keine fehlende ID; `states-cleaning.json` hat `vacuum.heidi` = `cleaning`.
- Tests: `node dreame_x60/card/tools/check-fixture.js dreame_x60/card/tests/fixtures/states-docked.json` (und cleaning)
- Dateien: `dreame_x60/card/tests/fixtures/states-*.json`, `dreame_x60/card/tools/check-fixture.js`

**0.3 v1: `task_status` in die Signatur**
- Voraussetzung: 0.1
- Ziel: `"sensor.heidi_task_status"` in der ID-Liste von `_signature()`; `HP_VERSION` 1.6.1.
- Nicht ändern: alles andere in v1.
- Akzeptanz: v1-Tests grün; [PC] nach Deploy wechselt der Kopf bei `task_status`-Änderung sofort.
- Tests: `cd heidi/tests && npm test`
- Dateien: `ha/www/heidi-panel.js`

**0.4 Backend: `rest_min` als Attribut**
- Voraussetzung: –
- Ziel: `sensor.heidi_automatik_status` bekommt `rest_min` (Ganzzahl, kann negativ sein) und `rest_quelle` („Prognose“ | „übliche Rückkehr HH:MM“) mit der Logik des heutigen `detail`-Templates (`use_prog` identisch); Automation `heidi_planer` liest `rest_min` per `state_attr`; `detail` bleibt.
- Nicht ändern: Entscheidungslogik der Automation, Helfer, andere Sensoren.
- Akzeptanz: `check_config` ohne Fehler; nach Reloads zeigt `ha.ps1 get states/sensor.heidi_automatik_status` beide Attribute; Automations-Trace zeigt denselben `rest_min`.
- Tests: [PC] `.\tools\ha.ps1 post config/core/check_config`; `services/template/reload`; `services/automation/reload`
- Dateien: `ha/packages/heidi.yaml`, `ha/automations.yaml`

### Phase 1 – Gerüst

**1.1 Toolchain**
- Voraussetzung: –
- Ziel: `package.json` (lit, esbuild, typescript, tsx, eslint, typescript-eslint, optional eslint-plugin-lit, playwright), `tsconfig.json`, `eslint.config.js`, `build.mjs` (Version → `HP_VERSION`), Scripts `build|watch|check|lint|test:unit|test:e2e|test`, `README.md` (10 Zeilen).
- Nicht ändern: nichts außerhalb `dreame_x60/card/`.
- Akzeptanz: `npm ci && npm run build` erzeugt `ha/www/dreame_x60.js` aus einem Platzhalter; `check` und `lint` laufen.
- Tests: `npm run build && npm run check && npm run lint`
- Dateien: `dreame_x60/card/{package.json,tsconfig.json,eslint.config.js,build.mjs,README.md}`, `.gitignore` (node_modules, tests/e2e/out)

**1.2 Leere Shell**
- Voraussetzung: 1.1
- Ziel: `LitElement` mit Kopfzeile „Heidi“, `config.page` (Standard `start`), Platzhalter je Seite, Versionszeile, `styles/tokens.ts` + `base.ts` aus v1-CSS, `setConfig`/`getCardSize`/`getStubConfig`, `define("dreame-x60-panel")`, `customCards`-Eintrag mit Prüfung.
- Nicht ändern: v1.
- Akzeptanz: E2E `render.js` lädt das Bundle mit `states-docked.json` für jede der sechs `page`-Werte ohne Konsolenfehler und findet die Versionszeile.
- Tests: `npm run build && npm run test:e2e -- render`
- Dateien: `src/dreame-x60-panel.ts`, `src/version.ts`, `src/styles/*.ts`, `tests/e2e/harness.js`, `tests/e2e/render.js`

**1.3 Dashboard und Deploy**
- Voraussetzung: 1.2
- Ziel: `ha/dashboards/dreame_x60.yaml` mit Views `start` (normal) und `reinigen|planer|protokoll|prognose|einstellungen` (`subview: true`, `back_path: /dreame-x60/start`), alle `type: panel`, Karte `custom:dreame-x60-panel` mit `page`; `configuration.yaml` Dashboard `dreame-x60` (Titel „Heidi v2“, Icon `mdi:robot-vacuum-variant`); `deploy.ps1` kopiert v2-Datei + Dashboard und setzt `dreame_x60.js?v=`.
- Nicht ändern: `heidi.yaml`, v1-Ressource.
- Akzeptanz: YAML valide (Prüfung mit `js-yaml` oder Python); `deploy.ps1` enthält beide neuen Pfade.
- Tests: [PC] `.\tools\deploy.ps1`; `ha.ps1 post config/core/check_config`
- Dateien: `ha/dashboards/dreame_x60.yaml`, `ha/configuration.yaml`, `tools/deploy.ps1`

**1.4 [PC] Ressource und Sichtbarkeit**
- Voraussetzung: 1.3
- Ziel: Ressource `/local/dreame_x60.js?v=2.0.0-alpha.1` (module) per `node tools/ha-ws.js lovelace/resources/create '{"res_type":"module","url":"/local/dreame_x60.js?v=2.0.0-alpha.1"}'` (Git Bash); HA-Neustart; Strg+F5.
- Nicht ändern: v1-Ressource.
- Akzeptanz: „Heidi v2“ in der Sidebar zeigt die Shell; Unteransichten per URL erreichbar, Zurück-Pfeil führt zu `start`; v1 unverändert.
- Tests: Sichtprüfung, Browser-Konsole leer.
- Dateien: –

### Phase 2 – Domäne portieren

**2.0 Vertrag und Vektor-Werkzeug**
- Voraussetzung: 1.1
- Ziel: `src/ha/contract.ts` (Abschnitt 4: `ENTITIES`, `planEntity`, `roomEntity`, `HA_OPTIONS`, `ROOM_VALUE_CODES`, `SERVICES`, `PERSONS`); `tools/v1-vectors.js` lädt `ha/www/heidi-panel.js` in Playwright mit Harness, ruft je Thema die alten Funktionen mit den Eingaben aus `<thema>.spec.json`-ähnlichen Eingabelisten (`tools/v1-inputs/<thema>.json`) auf und schreibt `<thema>.v1.json` (Instanzmethoden über eine Panel-Instanz mit gesetztem `hass`; `_loadTimeline` über instrumentiertes `callApi`, Ergebnis aus `_tl[key]`).
- Nicht ändern: v1.
- Akzeptanz: Unit-Test belegt, dass jede ID aus Abschnitt 4 über `contract.ts` erreichbar ist; `v1-vectors.js` erzeugt für einen Beispiel-Input je Thema einen Eintrag.
- Tests: `npm run test:unit -- contract`; `node tools/v1-vectors.js raumwerte`
- Dateien: `src/ha/contract.ts`, `tools/v1-vectors.js`, `tools/v1-inputs/*.json`, `tests/unit/contract.test.ts`

**2.1 Raumwerte-Codec**
- Voraussetzung: 2.0
- Ziel: `parseRaum`, `encodeRaum`, Typen. `raumwerte.v1.json` (leer, ein Raum, alle sieben, `-`-Felder, ungültige ID, ungültige Wdh, Wasser bei Saugen, Route bei Saugen+Wischen). `raumwerte.spec.json` (Roundtrip-Eigenschaft, Sortierung, 7 Räume ≤ 255 Zeichen, unbekannter Code → Standard).
- Nicht ändern: Format, Codes, Defaults, Reihenfolge (Abschnitt 6).
- Akzeptanz: beide Vektordateien grün; `encodeRaum(parseRaum(s))` stabil für alle v1-Eingaben.
- Tests: `npm run test:unit -- raumwerte`
- Dateien: `src/domain/raumwerte.ts`, `tests/unit/raumwerte.test.ts`, `tests/fixtures/raumwerte.*.json`

**2.2 Schätzung**
- Voraussetzung: 2.1
- Ziel: `estimate`, `rate`, `chargeMin`, `restMinFallback`. `estimate.v1.json`: Plan 1–4 aus `states-docked.json` mit den Beispiel-Lernwerten aus `heidi/mockups/build-live.js`, Varianten normal/schnell/leise, mit/ohne Raumwerte, Akku 100/40/20. `estimate.spec.json`: Ladestopp exakt an `rueckkehr_pct`, Zwischenwäsche exakt bei `nach_m2`, Ersatzrate ohne Basis, leere Raumliste, Raum ohne Lernfläche → 8 m².
- Nicht ändern: Zahlen aus Abschnitt 6 und `constants.ts`.
- Akzeptanz: `total`, `charges`, `battEnd`, Schrittanzahl/-typen = Vektoren; spec grün.
- Tests: `npm run test:unit -- estimate`
- Dateien: `src/domain/estimate.ts`, `src/domain/constants.ts`, `tests/unit/estimate.test.ts`, `tests/fixtures/estimate.*.json`

**2.3 Zeitleiste**
- Voraussetzung: 2.0
- Ziel: `runsFromVacuum`, `timelineRows`. `timeline.v1.json`: Historie aus `test-timeline.js` für `cur` und einen Eintrag. `timeline.spec.json`: Halt 44 s vs. 45 s; A-B-A mit B 44 s vs. 45 s; erste Zeile 29 s vs. 30 s; Lauf ohne Ende; zwei Läufe im Fenster; Eintrag, dessen Lauf 59 s vor `start` endete; leere Historie.
- Nicht ändern: Konstanten.
- Akzeptanz: beide Dateien grün; die 7 Zeilen aus `test-timeline.js` entstehen ohne Browser.
- Tests: `npm run test:unit -- timeline`
- Dateien: `src/domain/timeline.ts`, `tests/unit/timeline.test.ts`, `tests/fixtures/timeline.*.json`

**2.4 Kalibrierung**
- Voraussetzung: 2.0
- Ziel: `calibration(points)`, `rectsFromAttr`. Tests mit `calibration_points` aus `states-docked.json`: Hin/Rück innerhalb 1 mm; `null` bei 2 Punkten und kollinear; Objekt und Liste.
- Nicht ändern: Cramer-Verfahren.
- Akzeptanz: Tests grün; Zonen-Koordinaten aus 0.1 reproduzierbar (Pixel → mm).
- Tests: `npm run test:unit -- calibration`
- Dateien: `src/domain/calibration.ts`, `tests/unit/calibration.test.ts`

**2.5 Status**
- Voraussetzung: 2.0
- Ziel: `heroModel(input)`; Tabelle aus `test-timeline.js` plus alle Kombinationen vac × phaseOk × autoLauf × has_error.
- Nicht ändern: Texte, Knopfreihenfolge.
- Akzeptanz: Tabelle grün.
- Tests: `npm run test:unit -- status`
- Dateien: `src/domain/status.ts`, `tests/unit/status.test.ts`

**2.6 Beschriftungen**
- Voraussetzung: 2.0
- Ziel: `dayLabel`, `roomLabel`, `fmtMin` (59/60/61/125), `fmtDate` (heute/anderer Tag/ungültig), `fmtTime`.
- Nicht ändern: Ausgabeformate.
- Akzeptanz: Tests grün.
- Tests: `npm run test:unit -- labels`
- Dateien: `src/domain/labels.ts`, `tests/unit/labels.test.ts`

**2.7 Python gegen dieselben Vektoren**
- Voraussetzung: 2.1, 2.2, 2.3
- Ziel: pytest: `parse_raumwerte` gegen `raumwerte.*.json`, `schaetzung` gegen `estimate.*.json` (±1 min bei `total`), `split_runs` gegen `timeline.*.json` (Laufgrenzen).
- Nicht ändern: `runlog.py` (Abweichungen → Abschnitt 10a, nicht anpassen).
- Akzeptanz: pytest grün oder jede Abweichung in 10a mit Vektor-ID.
- Tests: `cd ha/prognose && python3 -m pytest`
- Dateien: `ha/prognose/tests/test_runlog.py`

### Phase 3 – HA-Schicht

**3.1 Typen, Memo-Selektor, Selektoren**
- Voraussetzung: 2.0–2.6
- Ziel: `types.ts`; `memo-selector.ts` (`memoizeSelector(ids, fn, compare?)`, Standard `state + last_updated`, < 100 Zeilen); `selectors.ts` mit `readRobot` (eigener Vergleich: `state` + genutzte Attribute), `readPlan(n)`, `readRoomValues(id)`, `readAllRoomValues`, `readLearn`, `readHistory` (Modul-Cache), `readPrognose`, `readSettings`, `readDiagnostics` (je Vertragsgruppe `missing`/`unavailable`-IDs). Regel 9 für alle.
- Nicht ändern: `contract.ts`.
- Akzeptanz: beide Fixtures liefern erwartete Werte (Plan 2 aus docked als Referenz); Proxy-Test: jede gelesene ID steht in den `ids` des Selektors; leeres `states` wirft nichts; Memo-Test: gleiche Referenz bei unverändertem Input, neue bei Änderung einer genannten ID, gleiche bei Änderung einer fremden ID.
- Tests: `npm run test:unit -- selectors memo`
- Dateien: `src/ha/{types,memo-selector,selectors}.ts`, `tests/unit/{selectors,memo-selector}.test.ts`

**3.2 API mit Teilfehlern**
- Voraussetzung: 2.0
- Ziel: `DxApi` (Methoden aus Abschnitt 6). `savePlan` führt die 18 Calls aus, sammelt Fehler (`Promise.allSettled`) und liefert `{ok, fehlgeschlagen: string[]}`; `setZones` analog.
- Nicht ändern: Dienst-Namen und Payloads.
- Akzeptanz: Call-Log-Tests: 18 Calls exakt; `setRoomValue` mappt Optionen; `setTime` unterscheidet Domänen; `runPlan` bei inaktiv ohne Call; Fehlerinjektion „Call 5 wirft“ → Ergebnis nennt genau diese Entität, übrige Calls wurden trotzdem abgesetzt.
- Tests: `npm run test:unit -- api`
- Dateien: `src/ha/api.ts`, `tests/unit/api.test.ts`

**3.3 Shell**
- Voraussetzung: 3.1, 3.2
- Ziel: Shell erzeugt Views über memoisierte Selektoren und reicht `hass`, Views, `api` nach unten; rendert nach `config.page`; Overlay-Union; Toast; Escape; `hass-more-info`; `shared/navigate.ts` (`history.pushState` + `location-changed`); Modul-Caches.
- Nicht ändern: kein `shouldUpdate` in der Shell.
- Akzeptanz: `render.js` grün für alle Seiten; Overlay öffnen/schließen mit Platzhalter; `nav.js`: `dx-navigate` löst `location-changed` mit richtigem Pfad aus.
- Tests: `npm test`
- Dateien: `src/dreame-x60-panel.ts`, `src/shared/{overlay,toast,navigate}.ts`, `tests/e2e/nav.js`

**3.4 [PC-Abnahme] Mockup Seitenstruktur**
- Voraussetzung: –
- Ziel: Statisches HTML `dreame_x60/mockups/seiten.html` mit allen sechs Seiten (Glas-Optik aus v1, Beispielwerte), Navigations-Kacheln auf Start, Zurück-Pfeil oben auf Unterseiten, jeweils Desktop- und 390-px-Ansicht; Vorschlag aus Abschnitt 7 als Ausgangspunkt.
- Nicht ändern: v1-Mockups.
- Akzeptanz: Herbert nimmt ab; Abweichungen vom Vorschlag werden in Abschnitt 7 nachgezogen; Eintrag PD-000 wird um „Seitenschnitt laut Mockup“ ergänzt.
- Tests: Sichtprüfung.
- Dateien: `dreame_x60/mockups/seiten.html`, `docs/dreame_x60/BAUPLAN.md` (Abschnitt 7, 10a)

### Phase 4 – Komponenten (Desktop-Layout; schmal in Phase 5)

Nach jedem Build v2 neben v1 ansehen; Unterschiede → Abschnitt 10/10a.

**4.0 Navigation `dx-nav` und Bento-Übersicht** (umgeschrieben 15.09. auf `dreame_x60/mockups/bento.html`)
- Voraussetzung: 3.3, 3.4
- Ziel: Seitengerüst und Navigation nach dem Bento-Mockup; die Flächen der Übersicht als Platzhalter, bis die Bausteine aus 4.1–4.10 sie füllen.
  1. **Gerüst in der Shell:** `<div class="app">` = Container `app` (`container-type: inline-size`, `min-height: calc(100vh − var(--header-height, 56px))`) mit `dx-nav` links und `.content` rechts (Container `content`, bisher `.page`). Seitenleiste und Symbolleiste kleben mit `position: sticky; top: var(--header-height, 56px)`.
  2. **`dx-nav`, drei Formen nach Breite des Containers `app`:** Seitenleiste > 1180 px (220 px breit, Marke „Heidi · Dein Saugroboter“, Liste Symbol + Text, Fuß mit Roboter-Bild aus dem Mockup als `shared/robot-svg.ts`, „Dreame X60 Ultra“, Version). Symbolleiste 761–1180 px (72 px, nur Symbole, `title` + `aria-label`). Tab-Leiste ≤ 760 px (unten, `position: sticky; bottom: 0`, Safe Area, höchstens sechs Einträge, ohne „Räume“; hält das Kleben in HAs Ansicht nicht, `fixed` mit Kartenrand und Befund in Abschnitt 10). Genau eine Form sichtbar.
  3. **Einträge** (`config.ts`, `NAV`, Reihenfolge wie im Mockup): Übersicht `start` · Karte `reinigen` · Räume (nur Seiten-/Symbolleiste; sendet `dx-open-overlay {kind: rooms, mode: robot}`) · Planer `planer` · Verlauf `protokoll` · Prognose `prognose` (nur wenn `readPrognose().aktiv`) · Einstellungen `einstellungen`. Symbole über `ha-icon` (mdi). Aktiver Eintrag = `config.page` mit `aria-current="page"`. Klick → `dx-navigate {page}`; die Shell ruft wie bisher `navigate()`.
  4. **Kopfzeile** (Shell, Container `content`): Übersicht: Titel „Heidi ist unterwegs“ bei `robot.running`, sonst Tagesgruß („Guten Morgen/Tag/Abend, <hass.user.name>!“, ohne Namen nur der Gruß), Untertitel aus `readRobot().hero` (`big` · `sub`). Unterseiten: Zurück-Knopf „Übersicht“ (`dx-navigate {start}`) + Titel/Untertitel aus `PAGE_TITLE`. Rechts Meta, nur > 760 px: Uhrzeit (Minutentakt, `de-AT`, Datum darunter), „Zu Hause“ mit den anwesenden Personen aus `readRobot().persons` (keine → „Niemand zu Hause“), „Nicht stören“ aus `hero.dnd`.
  5. **Bento-Übersicht** (`start`, 12 Spalten): Reihe 1 Roboter-Panel `span3` (`dx-hero`, 4.1) · Live-Karte `span6` (`dx-map-card compact`, 4.3) · rechte Spalte `span3` als `stack` mit Auftrag/Automatik (`dx-auftrag` 4.1 im Lauf, sonst `dx-automatik` 4.9) und Heute (`dx-heute`, 4.10). Reihe 2 je `span3`: Planer (`dx-planer compact`, 4.4) · Verschleiß (`dx-consumables`, 4.9) · Station (`dx-station`, 4.9) · Statistik (`dx-stats`, 4.7). Reihe 3: Schnellstart `span7` (`dx-quickstart`, 4.3) · Letzte Läufe `span5` (`dx-history compact`, 4.7). Bis dahin je Fläche ein Platzhalter `.b` mit `data-slot="<name>"`, Titel und Hinweis „entsteht in 4.x“. ≤ 1099 px Container: 6 Spalten (`span3` → 3, `span5`…`span9` → 6), Roboter-Panel `order: -2`, rechte Spalte `order: -1`, Karte darunter in voller Breite; ≤ 640 px: eine Spalte in Dokumentreihenfolge, Abstand 12 px.
  6. **Unterseiten:** Kopfzeile wie oben, Inhalt bleibt der Platzhalter aus 3.3 bis zur jeweiligen Karte.
- Nicht ändern: `navigate.ts`, Seitenliste in `pages.ts`, Tokens; Mockup-Extras ohne v1-Gegenstück bleiben draußen (Schalter in der Planer-Kachel, siehe Abschnitt 10).
- Akzeptanz: `nav.js`: bei 1400 / 1000 / 390 px Viewport genau eine Form sichtbar (Seitenleiste / Symbolleiste / Tab-Leiste); jeder Eintrag → `location-changed` mit `/dreame-x60/<page>`; „Räume“ öffnet Overlay `rooms`; Prognose-Eintrag fehlt, wenn `input_boolean.heidi_prognose_aktiv` aus; aktiver Eintrag trägt `aria-current`; Zurück-Knopf auf Unterseiten → `start`. `render.js`: Übersicht hat zehn Flächen mit `data-slot` in der Reihenfolge `hero, map, auftrag|automatik, heute, planer, consumables, station, stats, quickstart, history`; Version in der Seitenleiste; keine Konsolenfehler.
- Tests: `npm test`
- Dateien: `src/components/dx-nav.ts`, `src/shared/robot-svg.ts`, `src/dreame-x60-panel.ts`, `src/styles/{base,shell}.ts`, `src/config.ts` (`NAV`), `tests/e2e/{nav,render}.js`

**4.1 `dx-hero`**
- Voraussetzung: 4.0
- Ziel: Roboter-Panel nach Mockup: Name, Status-Punkt, Zeile Station, Roboter-Bild, Akku (Zahl + Balken, Blitz beim Laden), Chips (Raum, Hinweis/Fehler; Personen und DND seit PD-009 nicht mehr hier), drei Werte Modus/Saugleistung/Wasser (öffnen `rooms`), Knöpfe, Streifen im Lauf; Texte aus `status.ts`. Dazu `dx-auftrag` für die rechte Spalte im Lauf (PD-007): Route aus der Raumreihenfolge mit aktuellem Raum hervorgehoben, Minuten · Fläche · seit, „Räume x / 7“ mit Balken, nächster Raum mit Modus-Tag; alles aus `readRobot`.
- Nicht ändern: `status.ts`, `contract.ts`.
- Akzeptanz: Kopf-Tabelle aus 0.1 grün gegen v2; Streifen-Fälle mit `states-cleaning.json`; Knöpfe → `vacuum.*`-Calls; bei 20 irrelevanten Ticks 0 Renderaufrufe (Zähler im Harness); `dx-auftrag` fehlt im Leerlauf.
- Tests: `npm test`
- Dateien: `src/components/dx-hero.ts`, `src/components/dx-auftrag.ts`, `tests/e2e/hero.js`

**4.2 `dx-dialog`**
- Voraussetzung: 3.3
- Ziel: Rahmen mit Varianten `modal | sheet | confirm`, Scrim, Kopf, Fuß, Escape, Fokus in den Dialog.
- Nicht ändern: –
- Akzeptanz: `confirm` liefert Ereignis `dx-confirm`; Escape schließt; Fokus liegt nach Öffnen im Dialog.
- Tests: `npm test`
- Dateien: `src/components/dx-dialog.ts`, `tests/e2e/dialog.js`

**4.3 `dx-map-card` (Seite Reinigen)**
- Voraussetzung: 4.2, 2.4
- Ziel: Zwei Varianten: `compact` für die Startseite (nur Karte + Bildunterschrift „Live-Karte · <Raum> · <m²> · noch <Räume>“ bzw. „Karte · Heidi in der Station · letzter Lauf <Zeit>“, Antippen navigiert zu `reinigen`, Karten-Element aus demselben Modul-Cache) und `full` für die Seite Reinigen. Für `full`: Kartenslot mit Modul-Cache. Kopfzeile mit Kartenwahl (nur wenn `select.heidi_selected_map` existiert; schreibt `select_option`). Auf der Karte unten links zwei Knöpfe: „Hinfahren“ (schaltet die Karte in den Modus `vacuum_goto`) und „Sperrzonen“ (öffnet Dialog). Darunter Segment Räume / Zone / Punkt und Knopf „Alles“ (`vacuum.start` nach Bestätigung); das Segment gibt der eingebetteten Karte genau **einen** `map_modes`-Eintrag (`vacuum_clean_segment` mit `predefined_selections` inkl. `outline` je Raum, `vacuum_clean_zone`, `vacuum_clean_point`), sodass die Karte kein eigenes Modus-Menü zeigt. Im Modus Räume: Raum-Chips (Reihenfolge 7..1) und Leiste „N Räume reinigen“ mit Bestätigung; in den anderen Modi eine Hinweiszeile. Raum-Marker und Umrisse werden aus `camera.heidi_map` (Attribut `rooms`, Koordinaten) berechnet, nicht von Hand gesetzt; Räume außerhalb 1..7, mit `visibility: Hidden` oder ohne Koordinaten übergehen (Raum 8 = ausgeblendeter Balkon, Abschnitt 10). Glas-Optik über die CSS-Variablen aus `dreame_x60/mockups/karte.html` (Abschnitt „Was hier gesetzt ist“), `tiles: []`, `icons: []`, kein Titel. Sperrzonen-Dialog (`dx-zones-editor`, 4.12) mit drei Reitern Sperrzonen / Wisch-Sperrzonen / Virtuelle Wände: bestehende Einträge aus `camera.heidi_map` als Heidi-Overlay (verschieben, löschen), neue über die Karte im Modus `MANUAL_RECTANGLE` bzw. `MANUAL_PATH` (Großschreibung, siehe Abschnitt 10). Schalter „Stühle am Boden“ als Zeile in einer eigenen Kachel, nicht auf der Karte. App-Szenen und Knopf „Räume (Roboter-Werte)“ wie bisher. `compact` bekommt oben die Reiterzeile aus dem Mockup (Live-Karte · Räume → `reinigen` · Sperrzonen → Overlay · Reinigungsverlauf → `protokoll`). Außerdem `dx-quickstart` für die Übersicht (PD-007): Raumkacheln 7..1 und Kachel „Alles“ (wählt alle sieben, kein eigener Dienst), Leiste „N Räume reinigen“ → `vacuum_clean_segment` nach Bestätigung, „Auswahl aufheben“; dieselbe Auswahl-Logik wie der Modus Räume der Karte (gemeinsame Hilfsfunktion, kein doppelter Code).
- Nicht ändern: Dreame-App- und Nur-Bild-Konfiguration; Dienste und Payloads (Abschnitt 4); die Zeile der Karte mit Wiederholungen und ▶ bleibt (sie führt Zeichnungen aus und lässt sich per YAML nicht abschalten).
- Akzeptanz: Karten-Element über 20 Ticks identisch und 0 Neuerzeugungen; Raumauswahl per Chip oder per Tipp in die Raumfläche → `vacuum_clean_segment` mit richtigen `segments`; Segmentwechsel setzt genau einen Modus; „Hinfahren“ setzt `vacuum_goto`; Kartenwahl fehlt ohne `select.heidi_selected_map`; App-Szene → `heidi_app_szene` nach Bestätigung; Umrisse stimmen mit `rooms` aus der Fixture überein.
- Tests: `npm test`
- Dateien: `src/components/dx-map-card.ts`, `src/components/dx-quickstart.ts`, `src/ha/selectors.ts` (`readMap` mit Räumen/Umrissen), `tests/e2e/map.js`

**4.4 `dx-planer` (Seite Planer)**
- Voraussetzung: 4.0, 2.2
- Ziel: Vier Zeilen, Dauer-Kurzzeile (nur mit Lernwerten), ▶ mit Bestätigung, ✎ öffnet Editor; Automatik-Regeln-Details auf derselben Seite. Variante `compact` für die Übersicht: die ersten drei Einträge (Tage + Zeit, Name, aktiv/inaktiv nur als Anzeige – kein Schalter, Umschalten wie in v1 im Editor), Link „Alle 4“ → Seite Planer, Knopf „Eintrag bearbeiten“ (heutiger Eintrag, sonst 1).
- Nicht ändern: `estimate.ts`.
- Akzeptanz: vier Zeilen, heutiger markiert, Manuell-Tag; ▶ bei inaktiv nur Toast; `compact` ohne Schalter und ohne Service-Call.
- Tests: `npm test`
- Dateien: `src/components/dx-planer.ts`, `tests/e2e/planer.js`

**4.5 `dx-planer-editor`, `dx-clock-picker`**
- Voraussetzung: 4.2, 4.4, 3.2
- Ziel: Editor mit `PlanDraft` (Snapshot beim Öffnen), Uhr, Speichern über `savePlan`, Teilfehler-Meldung „Speichern unvollständig: <Felder>“ und Editor bleibt offen, Hinweis „Eintrag wurde außerhalb geändert“ (Vergleich `last_updated` der Plan-Helfer beim Öffnen vs. jetzt).
- Nicht ändern: die 18 Calls.
- Akzeptanz: `editor.js` (Klickfolge aus 0.1) → dieselben 18 Calls; `live-update.js`: bei offenem Editor neuen Akkuwert setzen → Kopf aktualisiert, Draft unverändert, Fokus bleibt; Fehlerinjektion Call 5 → Meldung sichtbar, Dialog offen; Änderung eines Plan-Helfers → Hinweis sichtbar.
- Tests: `npm test`
- Dateien: `src/components/dx-planer-editor.ts`, `src/components/dx-clock-picker.ts`, `tests/e2e/{editor,live-update}.js`

**4.6 `dx-rooms-dialog`**
- Voraussetzung: 4.5
- Ziel: Roboter- und Eintrag-Modus, Umschalter im Editor-Kontext, „Alle Räume“, Zurück zum Eintrag.
- Nicht ändern: `setRoomValue`.
- Akzeptanz: Roboter-Modus → `select_option` sofort; Plan-Modus nur Draft; Hinweis bei einem Raum auf `unavailable`.
- Tests: `npm test`
- Dateien: `src/components/dx-rooms-dialog.ts`, `tests/e2e/rooms.js`

**4.7 `dx-history`, `dx-robot-settings` (Seiten Protokoll, Einstellungen)**
- Voraussetzung: 4.0, 2.3
- Ziel: Letzter Lauf, Protokoll, Zeitleiste (Nachladen nur bei `last_changed`-Wechsel), Lernwerte-Tabelle auf Protokoll; Roboter-Einstellungen auf Einstellungen. Für die Übersicht: `dx-history compact` (drei letzte Läufe: Zeit, Art · Räume, Dauer, Fläche, ✓/✗; Link „Alle anzeigen“ und Klick → Seite Verlauf, keine Zeitleiste, kein `callApi`) und `dx-stats` (PD-006: sieben Tagesbalken aus den Protokoll-Einträgen, heutiger grün; Summen Läufe / Fläche / Zeit aus `cleaning_count`, `total_cleaned_area`, `total_cleaning_time`).
- Nicht ändern: `timeline.ts`.
- Akzeptanz: `timeline.js` → dieselben 7 Zeilen; Protokoll bleibt bei unavailable; genau ein `callApi` je Klick; 0 Renderaufrufe bei irrelevanten Ticks; `dx-stats`-Summen = Attribute der Fixture.
- Tests: `npm test`
- Dateien: `src/components/dx-history.ts`, `src/components/dx-stats.ts`, `src/components/dx-robot-settings.ts`, `tests/e2e/timeline.js`

**4.8 `dx-estimate-dialog`**
- Voraussetzung: 4.5
- Ziel: Zusammenfassung, Schnellprogramm-Zeile, Schrittliste, SVG, Vergleich.
- Nicht ändern: `estimate.ts`.
- Akzeptanz: Summen für Plan 2 = `estimate.v1.json`; Vergleichslinie beim Umschalten.
- Tests: `npm test`
- Dateien: `src/components/dx-estimate-dialog.ts`, `tests/e2e/estimate.js`

**4.9 `dx-automatik`, `dx-station`, `dx-consumables`**
- Voraussetzung: 4.0, 4.2
- Ziel: Kachel „Automatik“ (Schalter in der Kopfzeile, Status + Detail aus `readAutomatik`, Knopf „Regeln & Planer“ → Seite Planer; im Lauf ersetzt `dx-auftrag` aus 4.1 diese Kachel), Kachel „Station“ (vier Zeilen mit Symbol und Status-Punkt, Kopfzeile „Alles in Ordnung“ / erste Warnung, Knöpfe Absaugen / Mopp-Wäsche / Trocknen / Station reinigen), Kachel „Verschleiß“ (fünf Balken, ≤ 10 rot, ≤ 25 gelb, Antippen = Reset mit Bestätigung, Hinweis-Zeile bei Warnung).
- Nicht ändern: Kacheltexte.
- Akzeptanz: jeder Knopf/Select/Slider → erwarteter Call (Tabelle in E2E); Reset und Station mit Bestätigung.
- Tests: `npm test`
- Dateien: `src/components/dx-{automatik,station,consumables}.ts`, `tests/e2e/start.js`

**4.10 `dx-prognose-view` (Seite Prognose)**
- Voraussetzung: 4.0
- Ziel: Heute, Lernstatus, Schalter, Reset mit Bestätigung, Heatmaps. Dazu `dx-heute` für die Übersicht (ersetzt `dx-prognose-card` aus v1): Zeile „Heutiger Eintrag“ (Name · Zeit aus `readPlans`, Status läuft / offen / erledigt), bei `prognose_aktiv` Zeilen „Freies Fenster“ (Tag „N % sicher“) und „Erste Rückkehr“ (Zeit · Person) sowie Link „Prognose“ in der Kopfzeile; Zeile „Homeoffice“ aus der Prognose. Dazu (PD-009) Zeile „Zu Hause“ mit den drei Personen aus `readRobot().persons` (zu Hause hervorgehoben, „zählt nicht“ gedimmt, Antippen → more-info) und Hinweis, wer den heutigen Eintrag stört (`readPlans().stoerer`); auf schmalen Containern (Kopfzeilen-Meta ausgeblendet) zusätzlich Zeile „Nicht stören“ aus `hero.dnd`.
- Nicht ändern: Bild-URLs.
- Akzeptanz: Balken = `tage/(wochen×7)`; Reset → `shell_command`; Seite leer mit Hinweis bei `prognose_aktiv` aus; `dx-heute` ohne Prognose-Zeilen und Link, wenn aus.
- Tests: `npm test`
- Dateien: `src/components/dx-prognose-view.ts`, `src/components/dx-heute.ts`, `tests/e2e/prognose.js`

**4.11 `dx-settings-panel` (Seite Einstellungen)**
- Voraussetzung: 4.7, 3.1
- Ziel: alle v1-Abschnitte als Seite, Diagnose (fehlende/unavailable IDs aus `readDiagnostics`), Version.
- Nicht ändern: Rundungsregel Intervall.
- Akzeptanz: Slider → `set_value` gerundet; Dark/Hell schaltet `light`; Diagnose listet eine absichtlich entfernte ID.
- Tests: `npm test`
- Dateien: `src/components/dx-settings-panel.ts`, `tests/e2e/settings.js`

**4.12 `dx-zones-editor`**
- Voraussetzung: 4.3, 2.4
- Ziel: Dialog mit drei Reitern (Sperrzonen, Wisch-Sperrzonen, Virtuelle Wände). Bestehende Einträge aus `camera.heidi_map` (`no_go_areas`, `no_mopping_areas`, `virtual_walls`) als Overlay über dem Kartenbild wie in v1: auswählen, verschieben, löschen. Neue Einträge über die eingebettete Karte im Modus `MANUAL_RECTANGLE` (Zonen) bzw. `MANUAL_PATH` (Wände) oder über v1s Aufziehen auf dem Bild (eine der beiden Arten wird beim Bau gewählt und in Abschnitt 10 begründet). Speichern über `setZones` mit allen drei Listen und Teilfehler-Meldung; Hinweis, dass Speichern alle Einträge eines Typs ersetzt.
- Nicht ändern: `calibration.ts`.
- Akzeptanz: `zones.js` (Geste aus 0.1) → gleiche mm-Koordinaten wie v1; Hinweis ohne Kalibrierung; Reiter Wände sendet `walls`.
- Tests: `npm test`
- Dateien: `src/components/dx-zones-editor.ts`, `tests/e2e/zones.js`

**4.13 Render-Messung**
- Voraussetzung: 4.1–4.12
- Ziel: `perf.js`: `states-cleaning.json`, alle 200 ms ein `hass`-Update mit geändertem `last_updated` einer **nicht** vertragsrelevanten Entität, 10 s; zählt Shell-Updates, `render()` je Komponente, Karten-Neuerzeugungen. Zweiter Lauf mit Änderung an `vacuum.heidi`.
- Nicht ändern: keine globale Renderbarriere.
- Akzeptanz: irrelevante Ticks → Hero 0, Planer 0, Station 0, Karte 0 Neuerzeugungen (Shell darf Updates sehen); relevante Ticks → nur Hero/Karte/History rendern. Abweichungen in Abschnitt 10 (Art `Messung`) mit Entscheidung je Komponente.
- Tests: `npm run test:e2e -- perf`
- Dateien: `tests/e2e/perf.js`, `tests/e2e/harness.js` (Zähler)

### Phase 5 – Responsive

**5.1 Layout**
- Voraussetzung: 4.13
- Ziel: Container `app` (Navigation) und `content` (Bento 12/6/1 Spalten bei > 1099 / ≤ 1099 / ≤ 640 px) kommen schon aus 4.0; hier: `@container`-Regeln in Komponenten entsprechend den 12 v1-Media-Queries; Media Queries nur für Safe Area (`env(safe-area-inset-*)`), Pointer/Hover, sehr kleine Viewports; `dx-dialog` als Sheet < 600 px Container; Protokoll 30 + „mehr anzeigen“; kein fester Smartphone-Modus.
- Nicht ändern: Komponentenschnitt.
- Akzeptanz: Sichtprüfung 390/820/1200; Sheet bei 390.
- Tests: `npm test`
- Dateien: `src/components/*.ts`, `src/styles/base.ts`, `src/dreame-x60-panel.ts`

**5.2 Breiten-E2E**
- Voraussetzung: 5.1
- Ziel: `widths.js`: alle Seiten bei 390/820/1200 mit beiden Fixtures; `scrollWidth <= clientWidth`; Editor bei 390 als Sheet; Screenshots nach `tests/e2e/out/`.
- Nicht ändern: –
- Akzeptanz: grün.
- Tests: `npm run test:e2e -- widths`
- Dateien: `tests/e2e/widths.js`

### Phase 6 – Parallelbetrieb und Umschalten

**6.1 Round-Trip und Verfügbarkeit**
- Voraussetzung: 4.5, 4.7
- Ziel: `roundtrip-v1.js`: v2 speichert Plan 2 (Klickfolge aus 0.1), Calls werden auf `states` angewendet, v1 wird damit geladen, `_planRead(2)` = Draft; Gegenrichtung: v1 speichert (Klickfolge aus `test-editor.js`), v2 `readPlan(2)` = Erwartung. `availability.js`: `states-cleaning.json`, dann `sensor.heidi_cleaning_history` und `select.heidi_room_*` auf `unavailable`, dann wieder verfügbar → kein Konsolenfehler, Protokoll bleibt, Streifen erscheint wieder; Diagnose zeigt währenddessen `unavailable`.
- Nicht ändern: v1.
- Akzeptanz: beide grün.
- Tests: `npm run test:e2e -- roundtrip availability`
- Dateien: `tests/e2e/{roundtrip-v1,availability}.js`

**6.2 Paritäts-Checkliste**
- Voraussetzung: 5.2, 6.1
- Ziel: Abschnitt 9 abhaken, jede Zeile an v1 und v2 nebeneinander im Browser.
- Nicht ändern: –
- Akzeptanz: keine offene Zeile; jede Abweichung in 10a mit Status `freigegeben`.
- Tests: manuell.
- Dateien: `docs/dreame_x60/BAUPLAN.md`

**6.3 [PC] Geräte-Sichtung**
- Voraussetzung: 6.2
- Ziel: Companion-App Hochformat/Querformat (Safe Area, Sheet, Streifen, Zurück-Pfeil), Tablet mit HA-Sidebar (Spaltenwechsel nach Container), Tablet-Kiosk, Desktop mit Sidebar.
- Akzeptanz: Befunde in Abschnitt 10 klassifiziert; keine offenen `Blocker`/`Functional`.
- Tests: manuell.

**6.4 [PC] Sieben Tage Parallelbetrieb**
- Voraussetzung: 6.3
- Ziel: v2 als Hauptdashboard, v1 nur lesen (Regel 11).
- Akzeptanz: sieben Tage ohne offenen `Blocker`/`Functional`-Befund.

**6.5 [PC] Umschalten**
- Voraussetzung: 6.4, Abschnitt 11 erfüllt
- Ziel: `ha/dashboards/heidi.yaml` bekommt die sechs Views von `dreame_x60.yaml` (Pfad `/heidi/...`, `back_path` anpassen); `dreame_x60.yaml` und Dashboard-Eintrag entfernen; `ha/www/heidi-panel.js` → `heidi-panel-v1.js` (Ressource entfernen); Build-Ziel wird `ha/www/heidi-panel.js`; `heidi/tests` → `heidi/tests-v1`; `HANDOFF.md`, `heidi/CLAUDE.md`, `CLAUDE.md` auf v2; Version `2.0.0`.
- Akzeptanz: Abschnitt 11 vollständig.

---

## 9. Paritäts-Checkliste (Abnahme für 6.2)

- [ ] Navigation: jede Seite erreichbar, Zurück-Pfeil und Browser-Zurück führen zur Startseite, Prognose-Kachel nur bei aktiv (PD-000)
- [ ] Kopf: Akku-Ring, groß/klein-Text in allen 5 Zuständen, Personen-Chips (Nina gedimmt), Fehler-Chip rot/gelb, DND-Chip, Knöpfe je Zustand, `more-info`
- [ ] Streifen: Startpunkt / durchfahren / jetzt + danach-Liste + 5 Chips; Klick öffnet Räume (Roboter)
- [ ] Karte: 3 Darstellungen, Wechsel per Einstellungen, dunkel/hell, Zonen-Knopf mit Zähler, Stühle-Knopf
- [ ] Raum-Chips: Mehrfachauswahl, Leiste, Bestätigung, Call, Toast
- [ ] Verschleiß: 5 Ringe, Farben, Reset mit Bestätigung
- [ ] Automatik: Schalter + Statuszeile (Start), Regeln mit 6 Zeilen (Planer), alle Eingaben schreiben
- [ ] Planer: 4 Zeilen (Name, Räume, Modus, Störer, Einzelwerte, Dauer-Kurzzeile, Tag/Zeit, ▶, ✎); App-Szenen mit Bestätigung
- [ ] Editor: alle Felder, Uhr, Bedingungen, Räume einzeln/Roboter-Werte/Dauer & Akku, Speichern → 18 Calls, Abbrechen verwirft, Teilfehler sichtbar, Hinweis „außerhalb geändert“
- [ ] Räume-Dialog: beide Modi, Umschalter, „Alle Räume“, gedimmt, Zurück
- [ ] Dauer & Akku: Kurzzeile, Dialog, Schnellprogramm-Zeile, Schritte, Diagramm, Vergleich
- [ ] Prognose: Kachel (3 Werte), Seite mit Heute/Lernstatus/Schaltern/Reset/Heatmaps
- [ ] Station: 4 Kacheln, 4 Knöpfe (Station mit Bestätigung)
- [ ] Protokoll: Kopfzeile mit Summen, 3 Kacheln, 30 Einträge, Zeitleiste, „Läuft gerade“ live, bleibt bei unavailable, „mehr anzeigen“
- [ ] Roboter-Einstellungen: 7 Felder + DND + Räume-Knopf
- [ ] Einstellungen: alle Abschnitte, Slider, Lernwerte, Diagnose, Version
- [ ] Sperrzonen-Editor: zeichnen, auswählen, löschen, alle löschen, speichern, Hinweis ohne Kalibrierung, Teilfehler sichtbar
- [ ] Dunkel/Hell, Escape schließt Overlays
- [ ] `unavailable → available` ohne Fehler; Diagnose zeigt den Zustand
- [ ] Während des Editors aktualisiert sich der Kopf (PD-001, freigegeben)
- [ ] Handy 390 px: kein horizontales Scrollen, Dialoge als Sheet, alle Knöpfe erreichbar, Safe Area

---

## 10. Notizen aus dem Bau

Format: `- [Datum] [Aufgabe] Art (Widerspruch | Messung | Befund | Wunsch) · Schwere (Blocker | Functional | Cosmetic | Post-2.0): Text. Entscheidung Herbert: …`

Für 2.0 müssen `Blocker` und `Functional` = 0 sein. `Cosmetic` und `Post-2.0` dürfen offen bleiben.

- [2026-09-15] [4.0] Befund · Info: Karte 4.0, Abschnitt 7 und die Karten 4.1/4.3/4.4/4.7/4.9/4.10/5.1 auf das abgenommene Bento-Mockup umgeschrieben (ClickUp „Bauplan: Aufgabenkarte 4.0 auf das Bento-Layout umschreiben“). `dx-nav-tiles` entfällt; die Navigation heißt `dx-nav` und hat drei Formen nach dem Container `app` (Seitenleiste > 1180 px, Symbolleiste 761–1180 px, Tab-Leiste ≤ 760 px), die Übersicht ist ein 12-Spalten-Bento mit zehn Flächen. Neue Übersichts-Bausteine: `dx-auftrag` (4.1), `dx-quickstart` (4.3), `dx-stats` (4.7), `dx-heute` (4.10, statt `dx-prognose-card`) sowie `compact`-Varianten von `dx-planer` (4.4) und `dx-history` (4.7). Zwei Mockup-Extras haben kein v1-Gegenstück und bleiben draußen (der Mockup-Kommentar nennt sie selbst „nur in diesem Mockup“): Schalter direkt in der Planer-Kachel (v2 zeigt aktiv/inaktiv nur an, Umschalten im Editor wie v1) und die Kachel „Alles“ im Schnellstart als eigener Dienst (v2: Auswahlhilfe, wählt alle sieben Räume). Alle sichtbaren Abweichungen zur v1-Übersicht stehen gesammelt in PD-007. Offen und in 4.0 zu prüfen: ob `position: sticky` für die Tab-Leiste in HAs Ansicht hält (Scroll-Container ist HAs Ansicht, nicht die Karte). Entscheidung Herbert (15.09.): Fassung der Karte 4.0 bestätigt, PD-007 freigegeben.
- [2026-09-15] [4.1] Befund · Functional (v1 = v2, Beobachtung am echten Lauf 08:37–08:45): Während Heidi fährt, ist `switch.heidi_customized_cleaning` **unavailable** und damit alle 35 `select.heidi_room_N_*` ebenfalls (Integration). Folge in v1 wie v2: kein Streifen und die drei Werte Modus/Saugstufe/Wasser zeigen „–“, obwohl ein Raum gereinigt wird. Die v1-Vektoren mit Streifen entstanden mit gesetzten Raum-Selects (angepasste Reinigung an). Außerdem enthält `active_segments` beim Lauf „ganze Wohnung“ eine ID **8** (kein Raum 1..7; von `runOrder` verworfen, weil `cleaning_sequence` sie nicht enthält), und `input_text.heidi_lauf_reihenfolge` bleibt `unknown` (Helfer wird nur vom Planer-Skript gesetzt). Entscheidung Herbert (15.09.): „Angepasste Reinigung“ in der Dreame-App eingeschaltet – der Schalter steht jetzt auf `on`, die Raum-Selects liefern Werte (alle Räume Saugen/Turbo, Wasser und Route bei „Saugen“ von der Integration deaktiviert). Panel zeigt im Leerlauf „Saugen · Turbo · –“ (Live-Abzug geprüft). Kein Rückfall auf Raumnamen ohne Werte nötig. Nachtrag (Herbert): Ein Start in der Dreame-App schaltet „Angepasste Reinigung“ aus. Neue Automation `heidi_angepasste_reinigung_an` in `ha/automations.yaml` (Backend, Herberts Auftrag 15.09.): schaltet den Schalter wieder ein, wenn Heidi angedockt ist und er 5 Minuten aus bleibt (Trigger: Schalter → off für 5 min, oder vacuum → docked für 5 min; Bedingung: Schalter off und nicht unterwegs). Beobachtung beim App-Lauf 09:58–10:10 (Küche+Flur): Der Schalter war während des Laufs `unavailable` und stand 11 s nach dem Andocken von selbst wieder auf `on` (Integration), die Automation musste nicht eingreifen – sie bleibt als Netz für den Fall „off“ (wie im Abzug 07:59, Ursache unbekannt). Kein neuer Helfer, Vertrag unverändert; eingespielt per automation reload. Außerdem (Herbert: „kurz vor einem geplanten Vorgang prüfen“): Schritt 0 im Skript `heidi_reinigung` schaltet den Schalter direkt vor dem Setzen der Raumwerte ein (`switch.turn_on` + `wait_template` bis `select.heidi_room_1_cleaning_mode` verfügbar, max. 15 s) – gilt damit für Planer- und Kartenstarts. Verhalten bei App-Lauf zur geplanten Zeit: heute überspringt der Planer (Bedingung `docked`) und holt den Lauf beim nächsten 10-Minuten-Tick nach dem Andocken nach, ohne Zeitlimit. Entscheidung Herbert (15.09.): nachholen ja, aber nur innerhalb der Arbeitszeit; später Ausgehen-Prüfung und Räume ausnehmen, die kurz vorher manuell gereinigt wurden – Analyse und Stufenplan in `docs/dreame_x60/PLANER-NACHHOLEN.md`, ClickUp „Backend: Planer nachholen …“; noch nichts eingebaut.
- [2026-09-15] [4.1] Wunsch · Post-2.0 (Herbert, beim Lauf 08:37 – Badtür war zu): Nicht erreichbare Räume in der Auftrag-Kachel (Route) und im Kopf rot hervorheben. Befund dazu: HA bekommt vom Roboter **keine** Meldung „Raum nicht erreichbar“ – `sensor.heidi_error` blieb `no_error`, `vacuum.heidi` `faults` = `{}`, `has_error` = false; Heidi hat das Bad still übersprungen (Phase sprang von „Fährt zum Startpunkt · Bad“ direkt auf „Wischt Küche“). Auch der Protokoll-Eintrag (`sensor.heidi_cleaning_history`) kennt nur Summen und `completed`, keine Räume. Möglich wäre nur eine Ableitung: Räume der Laufreihenfolge vor dem aktuellen, für die es nie eine Phase „Saugt/Wischt <Raum>“ gab (aus der Phasen-Historie, die die Zeitleiste ohnehin lädt) → als „übersprungen“ markieren. Das ist neue Fachlogik (Regel 2), deshalb nach 2.0; im Bau von 4.7 (Zeitleiste) prüfen, ob die Phasen-Historie dafür reicht. ClickUp: „Post-2.0: Übersprungene Räume rot markieren“ (https://app.clickup.com/t/123ztrcv2jy). Herbert (15.09.): für später vorgemerkt.
- [2026-09-15] [4.1] Befund · Info: Beim Lauf 08:37 tauchte ein **Raum 8** auf („Room 8“, `visibility: Hidden`, Koordinaten null, in `camera.heidi_map.rooms`, `select.heidi_room_8_*` und `active_segments`), den es im Abzug von 07:59 nicht gab. Der Vertrag kennt 1..7; die Karte ignoriert 8 (Reihenfolge nur aus `cleaning_sequence` ∩ 1..7). Geklärt (Herbert, 15.09.): Heidi hat den **Balkon durchs Terrassenfenster** gescannt und als Raum angelegt; Herbert hat ihn in der Dreame-App abgetrennt und mit „Ausblenden“ versteckt. Raum 8 bleibt also als versteckter Raum in den Daten (`visibility: Hidden`, keine Koordinaten, in `active_segments` bei „ganze Wohnung“) – gewollt, kein Vertragsbruch. `dx-map-card` (4.3) muss Räume mit `visibility: Hidden` bzw. ohne Koordinaten übergehen.
- [2026-09-15] [4.1] Befund · Info (Abbruch des Laufs 08:53, Herbert schickt Heidi zur Station): Kopf bei `returning` wie v1 („Fährt zur Station“, Knöpfe Pause/Stopp/Orten, kein Streifen). `dx-auftrag` erscheint jetzt nur bei `cleaning`/`paused` (wie der Streifen); bei `returning` zeigte die Kachel sonst nur den Durchfahrtsraum ohne Auftrag – dann steht wieder Automatik in der rechten Spalte. Der Protokoll-Eintrag des abgebrochenen Laufs hat `completed: false` (1 min, 1 m²) und wird in 4.7 mit ✗ erscheinen. Nachtrag (Herbert sah „Station: unterwegs“ bei der Mopp-Wäsche nach dem Lauf): In der Station bleibt der Hauptzustand `cleaning` (Wäsche/Trocknen), aber die Attribute sagen `docked: true`, `charging: true`, `washing: true`. Stationszeile jetzt aus diesen Attributen („wäscht Mopps · lädt“, „trocknet · lädt“, „angedockt · lädt“), Titel „Heidi ist in der Station“, Auftrag-Kachel nur unterwegs (`docked: false`, in allen Live-Abzügen während der Fahrt bestätigt). `states-cleaning.json` ist genau dieser Zustand „Mopp-Wäsche vor dem Start“ (cleaning + docked); ein Abzug mitten in der Fahrt liegt noch nicht als Fixture vor (`render.js` deckt die Fahrt über abgeleitete Zustände ab).
- [2026-09-15] [4.1] Befund · Functional (zweiter echter Lauf 09:58, App-Start Küche+Flur mit eingeschalteter angepasster Reinigung): Der App-Start setzt `switch.heidi_customized_cleaning` auf **unavailable** (nicht off), ebenso `select.heidi_room_N_cleaning_mode`; `suction_level` bleibt verfügbar. Damit liefert `roomValuesOf` null (Modus fehlt) → v1 wie v2 ohne Streifen und mit „–“. Die Kartendaten (`camera.heidi_map.rooms[6]`: cleaning_mode 0, suction_level 1, cleaning_times 1 = Saugen/Standard/1×) stimmen mit Herberts App-Auswahl überein. Umgesetzt als PD-010 (Rückfall auf Kartendaten, Kamera-Vergleich nur über das Attribut `rooms`, damit Kamerabilder keine Renderläufe auslösen). Neue Fixture `states-driving.json` (362 Entitäten, mitten in der Fahrt; `render.js`, `hero.js`). `dump-states.ps1` entfernt `access_token` jetzt bei allen Entitäten (vorher nur bei Personen gefiltert). Offen zur Beobachtung: Verhalten der Selects bei einem Planer-Start (Schalter an, Skript setzt Werte).
- [2026-09-15] [4.2] Befund · Info: `dx-dialog` ist `position: fixed` über dem Viewport und damit sein eigener Container (`container-name: dialog`); der Sheet-Wechsel gilt unter 640 px **Viewport**-Breite (Abschnitt 7/5.1 sagten „< 600 px Container“ – für einen Dialog über dem ganzen Fenster ist der Viewport der Container; 640 wie die übrigen Schmal-Grenzen). `variant="sheet"` erzwingt das Sheet auch breit. Inhalt und Fuß kommen als Slots (`<slot>`, `slot="foot"`), der Fuß blendet sich ohne Inhalt aus; Kopfzeile mit optionalem Zurück-Pfeil (`back` → `dx-back`) und ✕. Fokus: beim Öffnen auf das erste bedienbare Element des Inhalts (Bestätigung: „Abbrechen“, nie auf den gefährlichen Knopf), Tab-Falle über Kopfzeile/Inhalt/Fuß, beim Entfernen zurück zum vorherigen Element. Escape löst `dx-close` aus und wird nicht weitergereicht (die Shell schließt einmal). Der Shell-Rahmen aus 3.3 (`.overlay/.dlg/.alert` in `styles/shell.ts`) ist entfernt; `overlay.js` greift dafür in den Shadow DOM von `dx-dialog`. Dialog-Inhalte (Editor, Räume, Dauer, Zonen, Einstellungen) bleiben Platzhalter bis zu ihren Karten.
- [2026-09-15] [4.1] Befund · Info (PD-009, Herbert 15.09.): Personen- und Nicht-stören-Chips aus `dx-hero` entfernt; die Chip-Zeile erscheint nur noch mit Raum- oder Hinweis/Fehler-Chip. `hero.js` filtert diese Chips aus den v1-Vorgaben (auch den v1-Sonderfall „–unkno“), `heroModel.dnd` bleibt für Kopfzeile/Einstellungen. Folgeaufgaben: 4.10 `dx-heute` bekommt die Zeile „Zu Hause“ (Namen, Störer des heutigen Eintrags) und auf dem Handy die Nicht-stören-Zeile; 4.7 zeigt DND in den Roboter-Einstellungen (war schon vorgesehen).
- [2026-09-15] [4.1] Wunsch · Post-2.0 (Herbert): Roboter-Bild in `dx-hero` je nach Zustand ändern (saugt, wischt, fährt, Station, Mopp-Wäsche, Mopp trocknet, Fehler); Daten liegen in `readRobot` (`vac`, `phase`, `docked`, `charging`, `washing`, `drying`). Umsetzung als Varianten/Ebenen in `shared/robot-svg.ts`, reine Anzeige. ClickUp: „Post-2.0: Roboter-Bild je nach Zustand“ (https://app.clickup.com/t/123ztrcv2mv). Sofort umgesetzt (kleine Anzeige-Ergänzung, Mockup-Stil): Blitz-Symbol neben dem Akku-Balken, solange `charging` gesetzt ist.
- [2026-09-15] [4.1] Befund · Cosmetic (Wortwahl): Herbert fragt „Mopp“ statt „Mopps“. Die Texte mit „Mopps“ kommen aus dem Backend (`ha/packages/heidi.yaml` Phase: „Wäscht Mopps vor dem Start“, „Trocknet Mopps“), aus v1 (`ERR_DE` „Mopps reinigen“) und aus den Schätz-Schritten (`estimate.ts`, v1-Parität); der X60 hat zwei Mopp-Pads, daher der Plural. v2-eigene Texte nutzen ab jetzt „Mopp-Wäsche“ (wie `STATUS_DE.washing`) und „trocknet“. Entscheidung Herbert (15.09.): **„Mopp“ überall.** Umgesetzt: Backend-Phasentexte in `ha/packages/heidi.yaml` („Wäscht Mopp vor dem Start / zwischendurch / nach dem Lauf“, „Trocknet Mopp“) und die davon abhängige Bedingung in `ha/automations.yaml` (Lauf abgeschlossen: `'Wäscht Mopp nach dem Lauf'`); v2 `ERR_DE.clean_mop_pad` = „Mopp reinigen“, Schätz-Schritte „Wäscht Mopp …“. v1 bleibt unverändert (Regel 3); die Paritätstests normalisieren die v1-Vorgaben „Mopps“ → „Mopp“ (PD-008, markiert im Code). Achtung für die Zeitleiste (4.7): alte Historie enthält noch „Wäscht Mopps …“, neue „Wäscht Mopp …“ – die Zeitleisten-Regeln vergleichen nur auf `PHASE_IDLE`/Gleichheit aufeinanderfolgender Zeilen, kein Textabgleich nötig.
- [2026-09-15] [4.1] Befund · Info: `dx-auftrag` am Startpunkt (Fläche 0, wie der Streifen): kein Raum hervorgehoben, „0 / n“, Zeile „Erster Raum“ = erstes Ziel der Reihenfolge – vorher zeigte die Kachel beim Durchfahren zum Startpunkt fälschlich „6 / 7“ (aktueller Raum war zufällig der letzte der Reihenfolge; am echten Lauf gesehen).
- [2026-09-15] [4.1] Befund · Info: Streifen-Logik (`_strip`, Reihenfolge aus Helfer/Roboter) liegt als reine Funktion in `domain/strip.ts` (`runOrder`, `stripModel`, `stripText`), weil `status.ts` laut Karte unverändert bleibt; `strip.test.ts` prüft alle 85 v1-Zustände (fünf davon mit Streifen) plus Spec-Grenzfälle. `dx-hero` und `dx-auftrag` bekommen die memoisierten Sichten `readRobot` und `readAllRoomValues` und rechnen den Streifen im Render (billig); `hero.js` misst 0 Renderaufrufe bei 20 irrelevanten Ticks, 1 bei Akku-Änderung. Neue gemeinsame Bedienstile `styles/controls.ts` (Chips, Knöpfe, Balken, Zeilen aus dem Mockup) für alle Bausteine ab jetzt. `RobotView.moreInfo` führt die IDs für more-info mit (wie die Bedien-Sichten aus 3.1). Drei Werte Modus/Saugleistung/Wasser: im Lauf die des aktuellen Raums, im Leerlauf der gemeinsame Wert aller Räume („–“ bei Abweichung oder unavailable, im Abzug „angedockt“ also „–“) – das Mockup zeigte hier Beispielwerte. Akku-Farbe: rot ≤ 20 % (v1), gelb ≤ 30 % (Mockup) – Cosmetic. Knöpfe behalten v1-Texte („Start“, „Station“, „Orten“) statt der Mockup-Kurzformen („Starten“, „Zur Station“, Symbol). `dx-auftrag`: „Räume x / n“ = Position des aktuellen Raums in der Laufreihenfolge / Räume des Auftrags; „seit“ aus dem Mockup entfällt (keine Startzeit in den Attributen). Der Personen-Chip „zählt nicht“ (Nina) ist wie v1 halbtransparent.
- [2026-09-15] [4.0] Befund · Info: Gebaut wie in der Karte. Container `app` ist ein Wrapper `.root` in der Shell (nicht `:host`), damit Overlay und Toast außerhalb liegen und `position: fixed` am Viewport bleibt. `dx-nav` hat `display: contents`, seine beiden `<nav>` (Seitenleiste, Tab-Leiste) sind Kinder des `.app`-Rasters (`grid-area: side` / `tab`); die Container-Abfragen im Shadow DOM finden `.root` über den Flat Tree. `dx-nav` bringt keine eigenen Tokens mit (erbt `--dx-*` von der Shell, damit `:host(.light)` durchschlägt). Symbolleiste blendet `button > span` aus (nicht `button span`: der `ha-icon`-Stub der Tests hat innen ein `span`). Tab-Leiste: `grid-template-rows: 1fr auto`, sticky am unteren Viewport-Rand in der Testseite geprüft (Vollbild-Screenshots zeigen sie wegen Playwright in der Mitte – Artefakt). Prüfung in HA (Scroll-Container = HAs Ansicht) steht mit der Sichtprüfung aus. Uhr in der Kopfzeile tickt zur vollen Minute (Shell rendert dann neu; Kinder bleiben über gleiche View-Referenzen ruhig). Der Dialog-Rahmen (`.dlg`) nutzt noch `@container content`, liegt aber außerhalb des Containers – wird mit `dx-dialog` (4.2) auf `app` umgestellt.

- [2026-09-15] [0.1] Widerspruch · Functional: Der Bauplan nennt für das Speichern eines Planer-Eintrags **16** Service-Calls (0.1, 3.2, 4.5, Abschnitt 6 `_saveEditor`). v1 setzt tatsächlich **18** ab: 5 `input_text.set_value` (name, raeume, tage, personen, raumwerte), 10 `input_select.select_option` (modus, saugstufe, wasser, route, wiederholungen, homeoffice, ho_saug, ho_wdh, sp_saug, sp_wdh), 2 `input_boolean.turn_on/off` (aktiv, schnell), 1 `input_datetime.set_datetime` (zeit). Festgeschrieben in `heidi/tests/expected/editor-calls.json` (Characterization aus v1). Vermutlich Zählfehler im Bauplan; die Klickfolge blieb unverändert. Entscheidung Herbert (15.09.): 18 ist richtig; Bauplan in 0.1, 3.2, 4.5 und Abschnitt 6 auf 18 korrigiert.
- [2026-09-15] [3.3] Befund · Info: Die Shell rendert bis Phase 4 je Seite eine Vorschau der Sichten (Kopftext, Pläne, Protokollzahlen …), damit die Verdrahtung im echten HA sichtbar ist; das verschwindet mit den Bausteinen. Overlay-Platzhalter für settings/editor/rooms/estimate/zones, `confirm` ist schon fertig bedienbar (Abbrechen/OK, Escape, `back`). Die E2E-Seite läuft jetzt unter `http://dx.test/dreame-x60/<page>` (Playwright `route`), weil `history.pushState` auf `about:blank` verboten ist. `light`-Klasse folgt `input_boolean.heidi_dark_mode` über `readSettings`.
- [2026-09-15] [3.2] Befund · Info: Die API-Klasse heißt `DxApi` (Namensregel 15.09., Bauplan nannte `DxApi`). `savePlan` prüft Name/Räume vorab und liefert `{ok:false, grund}` ohne Aufruf; danach 18 Aufrufe parallel (`Promise.allSettled`), `fehlgeschlagen` enthält die Entitäts-IDs. `setZones` sendet `walls` nur, wenn übergeben (v1 sendet nur zones/no_mops; Wände kommen mit 4.12, PD-004). `setNumber` gibt den tatsächlich gesetzten (gerundeten) Wert zurück, damit der Regler nachziehen kann.
- [2026-09-15] [3.1] Befund · Info: Sichten für Bedienelemente (Einstellungen, Automatik-Regeln, Roboter-Einstellungen, Station, Verschleiß) führen die Entitäts-ID des jeweiligen Elements mit (`id`/`entity`/`resetEntity`), damit Komponenten sie an die API reichen können, ohne selbst IDs zu bilden – die IDs stammen weiterhin nur aus `contract.ts` (Regel 1). `readRobot` vergleicht `vacuum.heidi` nur über `state` + 13 genutzte Attribute, damit das ständige `last_updated` keine Renderläufe auslöst. `readHistory` hält den letzten gültigen Stand im Modul (`stale: true`, solange der Sensor unavailable ist). Zusätzlich zu den Karten-Selektoren: `readAutomatik`, `readConsumables`, `readStation`, `readRobotSettings`, `readMap`, `readPlans`.
- [2026-09-15] [2.7] Befund · Functional (Python ↔ JS, vorab aus dem Code): `parse_raumwerte` in `runlog.py` liest nur Modus/Saugstufe/Wdh, verlangt fünf Felder, filtert Raum-IDs nicht auf 1..7 und liefert bei unbekanntem Code `None` (→ Standard des Eintrags), während v1/v2 unbekannten Modus als „Saugen“, Saugstufe als „Standard“ und Wdh als „1“ lesen. Wirkt nur bei kaputten Kurzcodes. Im Test als XFAIL markiert; runlog.py laut Karte 2.7 nicht anpassen. Entscheidung Herbert: … (Python an JS angleichen = eigener Backend-Schritt, oder so lassen). Ausführung des Tests steht aus: auf dem PC fehlt Python.
- [2026-09-15] [2.5] Befund · Cosmetic (v1): Ist `time.heidi_dnd_start`/`_end` `unknown`, zeigt der DND-Chip „–unkno“ (`slice(0,5)` des Zustands). v2 reproduziert das (Parität); Korrektur später über 10a, wenn gewünscht. `status.v1.json` enthält außerdem fünf Streifen-Fälle (Jetzt/Startpunkt/Fährt durch/letzter Raum/unavailable) als Vorgabe für `dx-hero` (4.1).
- [2026-09-15] [2.3] Befund · Info: Für die Zeitleisten-Vektoren nagelt `v1-vectors.js` `Date.now` im Browser auf den Zeitpunkt des Werkzeugs fest; nur so sind die Dauern der letzten Zeile exakt reproduzierbar. Die v1-Zeitleiste liefert für den laufenden Auftrag 6 Zeilen plus die gerenderte „läuft …“-Zeile (= die 7 Zeilen aus `test-timeline.js`). Beobachtet: Ein Halt zwischen zwei Zeilen wird nach dem Fensterfilter dedupliziert, deshalb kann ein früher gefilterter Punkt eine scheinbar doppelte Zeile wieder zur ersten machen (im spec dokumentiert, Verhalten wie v1).
- [2026-09-15] [2.2] Befund · Info: `chargeMin` wechselt bei fest 80 % von schnell auf langsam, nicht bei `weiter_pct` (so in v1; in `constants.ts` als `CHARGE_FAST_LIMIT_PCT` benannt). `std` für Variante normal enthält kein `wasser`, deshalb steht die Wassermenge im Schritt-Untertitel nur, wenn sie aus Raumwerten oder `uniform` kommt (v1-Verhalten, im spec festgehalten). `src/config.ts` (Anzeige: ROOMS, STATUS_DE, ERR_DE, APP_SCENES, DAYS) ist mit 2.2 entstanden, weil die Schritt-Texte die Kurznamen brauchen.
- [2026-09-15] [2.0] Befund · Info: `tools/check-fixture.js` liest den Vertrag jetzt aus `contract.ts` (über tsx). `contract.test.ts` prüft zusätzlich die Optionsstrings gegen `ha/packages/heidi.yaml` (js-yaml) – ändert Herbert eine Option im Paket, wird der Test rot. `v1-vectors.js` schreibt je Thema `{quelle, erzeugt, vektoren[{name, input, output}]}`; Zeitleisten- und Datums-Vektoren enthalten `now`, weil v1 mit der echten Uhr rechnet. `restMin` in den Schätz-Vektoren hängt von der Uhrzeit ab und ist nur Beiwerk.
- [2026-09-15] [1.2] Befund · Info: `src/ha/types.ts` (laut Karte 3.1) ist schon in 1.2 entstanden, weil die Shell die Typen `HomeAssistant`/`PanelConfig` braucht; 3.1 ergänzt nur noch, was Selektoren brauchen. `styles/tokens.ts` kommt nicht aus dem v1-CSS (Karte 1.2), sondern aus dem abgenommenen Mockup `dreame_x60/mockups/bento.html` (Designvorgabe 14.09.); ein `:host(.light)`-Satz ist vorbereitet, aber nicht abgenommen (Abschnitt 28). Das Umschalten auf `light` über `input_boolean.heidi_dark_mode` kommt mit den Selektoren (3.3/4.11), weil die Shell keine Entitäts-IDs kennen darf (Regel 1). Lit ohne Decorators (`static properties`), damit esbuild ohne Zusatzschritt baut.
- [2026-09-15] [0.2] Befund · Cosmetic: `heidi/tests/real_states.json` (v1-Testdaten, seit dem ersten Commit im Repo) enthält bei den drei Personen `latitude`/`longitude`/`gps_accuracy`. Der neue `tools/dump-states.ps1` entfernt diese Felder und Kamera-Tokens; `check-fixture.js` schlägt bei GPS-Feldern an. Die alte Datei bleibt bis 6.5 (v1-Tests brauchen sie unverändert, Regel 3); die Koordinaten stehen ohnehin in der Git-Historie. Entscheidung Herbert: … (Datei jetzt bereinigen und v1-Tests dagegen laufen lassen, oder so lassen bis zum Archivieren von v1).
- [2026-09-15] [0.2] Befund · Info: Im Abzug „angedockt“ sind 42 Vertrags-IDs `unavailable`: alle 35 `select.heidi_room_N_*` (die Integration schaltet sie ab, solange `switch.heidi_customized_cleaning` aus ist), 6 `button.heidi_*` (Reset/Station im Leerlauf) und `input_text.heidi_lauf_reihenfolge` (`unknown`, noch nie gesetzt). Selektoren müssen das laut Regel 9 als typisierte Leerwerte liefern; der Räume-Dialog zeigt den Hinweis „unavailable“.
- [2026-09-15] [0.3] Befund · Functional: Der Branch hatte v1 auf 1.6.0, auf `H:www` läuft 1.6.1 (Commit ba10f1c auf `main`, „Räume in Roboter-Reihenfolge“). `main` wurde deshalb in den Branch gemergt (965a3fd), damit v1 im Branch = eingesetztes v1. 0.3 bekommt darum Version **1.6.2** statt 1.6.1. Achtung: Die lokale `main`-Arbeitskopie enthält ungespeicherte Arbeit mit derselben Nummer 1.6.2 (Raumreihenfolge des Eintrags, neuer Helfer `input_text.heidi_lauf_reihenfolge` in `heidi.yaml`/`scripts.yaml`). Ein neuer Helfer verletzt den eingefrorenen Entitäts-Vertrag (Regel 1), solange er nicht in Abschnitt 4 aufgenommen ist. Entscheidung Herbert (15.09.): in `dreame_x60` übernommen (Commit siehe Statusliste 0.3); Helfer in Abschnitt 4 aufgenommen, Regeln in Abschnitt 6 (estimate, Streifen, roomLabel) nachgezogen; v1 bleibt 1.6.2 mit beiden Änderungen. `main`-Arbeitskopie: Änderungen als Stash gesichert.
- [2026-09-15] [0.4] Befund · Cosmetic: `use_prog` war an zwei Stellen leicht verschieden definiert: das `detail`-Attribut prüft, ob der Prognose-Text `rueckkehr` gesetzt ist, die Automation prüfte `rueckkehr_min > 0`. Seit 0.4 gilt für Sensor und Automation die `detail`-Fassung. Unterschied nur im Randfall „Prognose-Text vorhanden, aber `rueckkehr_min ≤ 0“ (Rückkehr laut Prognose schon vorbei): früher fiel die Automation auf die übliche Rückkehr zurück, jetzt ist `rest_min` ≤ 0 → Automation wählt „normal“ (Zweig `rest_min <= 0`). Entscheidung Herbert: … (so lassen oder Bedingung `rueckkehr_min > 0` in den Sensor aufnehmen; dann ändert sich `detail` im selben Randfall).
- [2026-09-14] [4.3] Befund · Functional (v1): In der Xiaomi-Konfiguration von v1 (`_mountMap`, Modi „Sperrzonen setzen“ und „Wisch-Sperrzonen setzen“) steht `selection_type: manual_rectangle` in Kleinschreibung. Die Karte erwartet `MANUAL_RECTANGLE` (wie ihre eingebauten Vorlagen) und blendet sonst „+“ und Zeichenwerkzeuge aus. In v2 richtig schreiben; v1 bleibt unverändert (Regel 3). Entscheidung Herbert: zur Kenntnis genommen (Chat 14.09.).
- [2026-09-14] [4.3] Befund · Cosmetic: Das Kartenbild der Integration enthält englische Raumnamen, Heidi zeigt deutsche Marker. In den Optionen der Dreame-Integration Raumnamen im Bild ausblenden (Herbert, beim Umschalten).
- [2026-09-14] [4.3] Wunsch · Post-2.0: Pixelgenaue Raumauswahl wie in der App über `camera.heidi_map_data` (Valetudo-Format, Segment-Masken) in einer eigenen Kartenansicht; die Xiaomi-Karte kann nur Polygone (`outline`) und trifft an Raumrändern ungenau.
- [2026-09-14] [4.3] Wunsch · Post-2.0: Kartenwahl für mehrere Etagen (`switch.heidi_multi_floor_map`, `select.heidi_selected_map`, `camera.heidi_map_1..3`), sobald eine zweite Karte existiert; Reihenfolge der Räume per Ziehen (`vacuum_set_cleaning_sequence`).

- [2026-09-15] [UX] Wunsch · Post-2.0 (Herbert): **App-artige Übergänge Bento ↔ Detail** (Expand/Morph beim Öffnen einer Detailansicht, Collapse/Morph zurück; Bewegungssprache für Tabs, Panels, Dialoge, Status, Karte; 120–300 ms, ruhig, `prefers-reduced-motion`). Vollständig in `docs/dreame_x60/UX-TRANSITIONS.md`; ClickUp „Post-2.0: App-artige Übergänge Bento ↔ Detail“. Dazu (Herbert, 15.09.) Ideen „Kopfzeile als Einstieg“: Uhrzeit → Kalender der Fahrten, „Zu Hause“ → Anwesenheitsübersicht, „Nicht stören“ → Fenster „Zeiten“, Seitenleiste später optional; Variante Familienkalender in HA (Läufe und Familientermine als Kalender-Entität, Planer bleibt Wahrheit) – ebenfalls dort, ClickUp „Post-2.0: Kopfzeile als Einstieg …“. **Gilt schon jetzt (nur Leitplanken, kein Scope):** Navigation nur über `navigate.ts`/`dx-navigate`; keine Komponente hängt am HA-Ansichts-Lebenszyklus (die Seiten sind heute HA-Unteransichten, später rendert die Karte Detailseiten selbst – Wechsel nur in Shell + `navigate.ts`); `data-slot`-Namen der Übersicht und die Bausteinnamen bleiben stabil (Anker für Morph); gleiche Sache auf Übersicht und Detail = ein Element mit `variant`, nicht zwei; keine Animations-Infrastruktur auf Vorrat.

- [2026-09-15] [Post-2.0] Wunsch · Post-2.0 (Herbert): **Raumliste dynamisch aus den Kartendaten** (`camera.heidi_map.rooms`: `room_id`, `custom_name`, `order` = Reinigungsreihenfolge, `visibility`; nur sichtbare Räume) statt fest 1..7, und **Roboter-Name als Parameter** (`heidi` → Kartenkonfiguration, HA-Paket mit Variablen), damit die Karte für andere Dreame-Modelle mit derselben Integration taugt. Feste Stellen heute: `contract.ts` `ROOM_IDS`, `config.ts` `ROOMS`, `raumwerte.ts` (1..7), `labels.ts` `roomLabel`, `estimate.ts` Standardfläche, `scripts.yaml` `range(1, 8)`, `runlog.py`. Ecovacs u. ä. = eigener Adapter (Vertrag/Selektoren/API/Paket), Regel 18 bleibt. ClickUp „Post-2.0: Raumliste dynamisch …“.

Wünsche `Post-2.0`: lokale Font-Dateien (Sora/IBM Plex).

## 10a. Paritätsabweichungen (Register)

Jede gewollte Abweichung von v1 hat hier einen Eintrag. Ohne Eintrag mit Status `freigegeben`
ist eine Abweichung ein Fehler.

| id | bereich | v1 | v2 | grund | spec_test | Status |
|---|---|---|---|---|---|---|
| PD-000 | Navigation | eine Seite, Tabs Übersicht/Prognose, Einstellungen als Seitenleiste | Startseite + fünf Unteransichten (HA `subview`), Einstellungen als Seite | Herberts Wunsch; Layout, keine Fachlogik; Seitenschnitt laut Mockup 3.4: Übersicht mit Seitenleiste (Desktop) bzw. Tab-Leiste (schmal), Unterseiten Karte, Planer, Verlauf, Prognose, Einstellungen; Räume-Dialog aus der Navigation | `nav.js` | freigegeben (Herbert, 2026-09-14/15) |
| PD-004 | Karte | Karte + Raum-Chips + Knöpfe „Sperrzonen“/„Stühle am Boden“ auf der Karte | Segment Räume/Zone/Punkt + „Alles“, Knöpfe „Hinfahren“/„Sperrzonen“ unten links auf der Karte, Räume auch per Tipp in die Fläche wählbar, Stühle-Schalter als Zeile | Herberts Wunsch (Chat 14.09.); Bedienung, keine Fachlogik; dieselben Dienste | `map.js` | freigegeben (Herbert, 2026-09-14) |
| PD-005 | Startseite | Karte nur in der Übersicht mit allen Werkzeugen | Startseite zeigt die Karte immer als `compact` (links unter dem Kopf), Werkzeuge auf der Seite Reinigen; Automatik und Station rechts | Herberts Abnahme (Chat 14.09.); Layout, keine Fachlogik | `render.js`, `nav.js` | freigegeben (Herbert, 2026-09-14) |
| PD-001 | Editor | Live-Daten eingefroren bei offenem Editor | Kopf/Streifen aktualisieren sich, Draft bleibt | Folge des Render-Modells, nicht gewollt | `live-update.js` | freigegeben (Herbert, 2026-09-14) |
| PD-002 | Speichern | Fehler beim Speichern → Toast, Editor schließt | Teilfehler benannt, Editor bleibt offen | Regel 20 | `api.test.ts` Fehlerinjektion | freigegeben (Herbert, 2026-09-14) |
| PD-006 | Übersicht | keine Statistik-Kachel | Kachel „Statistik“: Balken der letzten 7 Tage aus `sensor.heidi_cleaning_history`, Summen aus `cleaning_count`/`total_cleaned_area`/`total_cleaning_time` | Designvorgabe Abschnitt 14; nur Anzeige vorhandener Sensoren, keine neue Fachlogik | `render.js` | freigegeben (Herbert, 2026-09-15) |
| PD-003 | Bestätigungen | `window.confirm` | `dx-dialog confirm` | Regel 13 | `dialog.js` | freigegeben (Herbert, 2026-09-14) |
| PD-010 | Raumwerte im Lauf | Streifen und Raumwerte nur aus `select.heidi_room_N_*`; im Lauf (Selects unavailable) nichts | Rückfall auf die Kartendaten des Roboters (`camera.heidi_map` Attribut `rooms`: `cleaning_mode`, `suction_level`, `water_volume`, `cleaning_route`, `cleaning_times` als Zahlencodes, dieselbe Zuordnung wie Automation `heidi_laufprotokoll`), wenn das Modus-Select nicht verfügbar ist; Streifen, drei Werte und Auftrag-Kachel zeigen dann die echten Werte des Laufs. `AllRoomValuesView.vonKarte` nennt die Räume, deren Werte aus der Karte kommen – dort ist Schreiben nicht möglich (Räume-Dialog 4.6 zeigt den Hinweis) | Beim echten App-Lauf 15.09. 09:59 (Küche+Flur) waren Schalter und Modus-Selects unavailable, die Karte zeigte „–“ – Herbert: „es wird nichts angezeigt“. Nur Anzeige vorhandener Daten, gleiche Fachlogik (Codec, Streifen-Regeln) | `selectors.test.ts` (Fixture `states-driving.json`), `hero.js` | freigegeben (Herbert, 2026-09-15) |
| PD-009 | Kopf / Personen | Personen-Chips (Herbert, Nicole, Nina) und Nicht-stören-Chip im Kopf | Nicht mehr im Roboter-Panel `dx-hero` (dort nur Raum- und Hinweis/Fehler-Chip). Personen: Kopfzeilen-Meta „Zu Hause“ (Desktop/Tablet) und Zeile „Zu Hause“ mit Störer-Hinweis in der Kachel „Heute“ (4.10). Nicht stören: Kopfzeilen-Meta, Roboter-Einstellungen (4.7) und auf dem Handy als Zeile in „Heute“ | Herberts Entscheidung (15.09.): keine Roboter-Eigenschaften, auf breiten Bildschirmen doppelt zur Kopfzeile | `hero.js` (v1-Chips gefiltert), später `start.js`/`prognose.js` für „Heute“ | freigegeben (Herbert, 2026-09-15) |
| PD-008 | Wortwahl | „Mopps“ (Hinweis „Mopps reinigen“, Schätz-Schritte „Wäscht Mopps …“) | „Mopp“ („Mopp reinigen“, „Wäscht Mopp …“, Stationszeile „Mopp-Wäsche“); Backend-Phasentexte ebenfalls auf „Mopp“ (heidi.yaml, automations.yaml) | Herberts Wunsch (15.09.); nur Text | `status.test.ts`, `estimate.test.ts`, `hero.js` (Normalisierung der v1-Vorgaben) | freigegeben (Herbert, 2026-09-15) |
| PD-007 | Übersicht | Kopf mit Streifen, Karte mit Werkzeugen, Automatik-Einzeiler, Verschleiß, Station, Prognose-Kachel (3 Werte), Letzter Lauf | Bento-Raster nach `bento.html`: Kachel „Schnellstart“ (Raumkacheln → `vacuum_clean_segment` mit Bestätigung, wie die Raum-Chips in v1, nur neben der `compact`-Karte statt darauf), Kachel „Aktueller Auftrag“ im Lauf statt Automatik (Route, Minuten, Fläche, Räume x/7, nächster Raum – nur Attribute von `vacuum.heidi`), Kachel „Heute“ (heutiger Eintrag; Prognose-Zeilen nur bei aktiv; Homeoffice), „Letzte Läufe“ mit drei statt einem Eintrag, Planer-Kachel (drei Einträge, nur Anzeige), Kopfzeilen-Meta (Uhrzeit, Zu Hause, Nicht stören), Tagesgruß mit `hass.user.name` | Herberts Designvorgabe, Mockup abgenommen 15.09.; nur Anzeige vorhandener Werte und dieselben Dienste, keine neue Fachlogik. Ergänzt PD-005 (Karte bleibt `compact`, Werkzeuge auf Reinigen) und PD-006 | `render.js`, `nav.js`, `start.js` | freigegeben (Herbert, 2026-09-15) |

---

## 11. Freigabekriterien (Definition „fertig“)

1. Paritäts-Checkliste (Abschnitt 9) vollständig, jede Zeile an v1 und v2 nebeneinander geprüft.
2. Alle `.v1.json`- und `.spec.json`-Vektoren grün, in TypeScript und Python.
3. E2E grün: Render aller Seiten mit beiden Fixtures, Navigation, Editor-Klickfolge, Round-Trip
   in beide Richtungen, Zonen, Zeitleiste, Live-Update bei offenem Editor, Teilfehler,
   `unavailable → available`, Render-Messung, drei Breiten ohne Overflow.
4. `npm run check` und `npm run lint` ohne Fehler.
5. Abschnitt 10 ohne offene `Blocker`/`Functional`; Abschnitt 10a ohne Eintrag im Status `offen`.
6. Geräte-Sichtung (6.3) erledigt.
7. Sieben Tage Alltag mit v2 ohne offenen freigabeblockierenden Befund (6.4).
8. Version `2.0.0`, `heidi.yaml` zeigt auf v2, v1 als `heidi-panel-v1.js` archiviert,
   HANDOFF/CLAUDE.md beschreiben v2 (6.5).
