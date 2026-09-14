# Bauplan Heidi-Karte v2 (Neubau der Oberfläche auf dem bestehenden Backend)

Stand: nach ChatGPT-Review Runde 1 (2026-09-14, `docs/chatgpt-reviews/CGR-2026-09-14-heidi-v2/`).

Dieses Dokument ist die Arbeitsanweisung für den Neubau der Heidi-Karte. Es ist für Claude Code
geschrieben (und für Herbert lesbar). Eine Sitzung beginnt mit dem Startprompt in Abschnitt 0,
liest die Statusliste in Abschnitt 1, sucht die Aufgabenkarte in Abschnitt 8 und arbeitet genau
diese Aufgabe ab.

Hintergrund und Begründung der Entscheidungen: `docs/ARCHITEKTUR-REVIEW.md`. Fachliche Details
zu Heidi: `heidi/CLAUDE.md`, `docs/HANDOFF.md`.

---

## 0. Startprompt für jede Sitzung

> Lies `CLAUDE.md`, `docs/HANDOFF.md` und `docs/BAUPLAN-V2.md`. Nimm die nächste offene Aufgabe
> aus der Statusliste (Abschnitt 1), lies ihre Aufgabenkarte in Abschnitt 8 und arbeite nur diese
> Aufgabe ab. Halte dich an die Regeln in Abschnitt 2. Wenn Code und Bauplan sich widersprechen:
> nicht entscheiden, Befund in Abschnitt 10 eintragen und stoppen. Am Ende Statusliste
> aktualisieren, committen, pushen.

Aufgaben, die Herberts PC brauchen (Zugriff auf `H:\`, `ha.ps1`, `dump-states.ps1`, Browser mit
HA), sind mit **[PC]** markiert. Claude Code im Web kann sie vorbereiten, aber nicht ausführen.

---

## 1. Statusliste (bei jeder Sitzung pflegen)

| Nr. | Aufgabe | Status |
|---|---|---|
| 0.1 | v1-Tests: Exit-Code bei Abweichung, `test-timeline` in `npm test`, ein Harness | offen |
| 0.2 | **[PC]** Fixtures `states-docked.json`, `states-cleaning.json` erneuern | offen |
| 0.3 | v1: `sensor.heidi_task_status` in `_signature()`, Version 1.6.1 | offen |
| 0.4 | Backend: `rest_min`/`rest_quelle` als Attribute, Automation liest sie | offen |
| 1.1 | Gerüst `heidi/card/`: package.json, tsconfig, esbuild, ESLint | offen |
| 1.2 | Leere Lit-Shell `heidi-panel-v2`, Build nach `ha/www/heidi-panel-v2.js` | offen |
| 1.3 | Dashboard `heidi-v2.yaml`, `configuration.yaml`, `deploy.ps1` | offen |
| 1.4 | **[PC]** Ressource anlegen, HA-Neustart, „Heidi v2“ sichtbar | offen |
| 2.0 | `ha/contract.ts` + Vektor-Werkzeug (`tools/v1-vectors.js`) | offen |
| 2.1 | `domain/raumwerte.ts` + Vektoren (v1 + spec) | offen |
| 2.2 | `domain/estimate.ts` + Vektoren (v1 + spec) | offen |
| 2.3 | `domain/timeline.ts` + Vektoren (v1 + spec) | offen |
| 2.4 | `domain/calibration.ts` + Tests | offen |
| 2.5 | `domain/status.ts` + Tests | offen |
| 2.6 | `domain/labels.ts` + Tests | offen |
| 2.7 | `ha/prognose/tests/test_runlog.py` gegen dieselben Vektoren | offen |
| 3.1 | `ha/types.ts`, `ha/selectors.ts` + Tests gegen Fixtures | offen |
| 3.2 | `ha/api.ts` (`HeidiApi`) + Tests | offen |
| 3.3 | Shell: Views, Overlay-Zustand, Toast, Escape, Tabs, more-info | offen |
| 4.1 | `heidi-hero` | offen |
| 4.2 | `heidi-map-card` | offen |
| 4.3 | `heidi-planer` | offen |
| 4.4 | `heidi-dialog` + `heidi-planer-editor` + `heidi-clock-picker` | offen |
| 4.5 | `heidi-rooms-dialog` | offen |
| 4.6 | `heidi-history` + `heidi-robot-settings` | offen |
| 4.7 | `heidi-estimate-dialog` | offen |
| 4.8 | `heidi-automatik`, `heidi-station`, `heidi-consumables` | offen |
| 4.9 | `heidi-prognose-card` + `heidi-prognose-view` | offen |
| 4.10 | `heidi-settings-panel` | offen |
| 4.11 | `heidi-zones-editor` | offen |
| 4.12 | Render-Messung mit `states-cleaning.json`, Gating nur wo nötig | offen |
| 5.1 | Container Queries, Bottom-Sheet, „mehr anzeigen“ im Protokoll, Safe Area | offen |
| 5.2 | E2E Breiten 390/820/1200 + Overflow-Prüfung + Screenshots | offen |
| 6.1 | E2E Round-Trip: v2 speichert Plan → v1-Lesart identisch | offen |
| 6.2 | Paritäts-Checkliste (Abschnitt 9) vollständig | offen |
| 6.3 | **[PC]** Sichtung Companion-App hoch/quer, Tablet mit Sidebar, Kiosk | offen |
| 6.4 | **[PC]** Sieben Tage Parallelbetrieb ohne Befund | offen |
| 6.5 | **[PC]** Umschalten, v1 archivieren, Doku auf v2 | offen |

Status-Werte: `offen`, `in Arbeit (Datum)`, `fertig (Commit)`, `blockiert (siehe Abschnitt 10)`.

---

## 2. Regeln (gelten in jeder Sitzung)

**Oberste Invariante: v2 ist ein struktureller Neubau des Frontends bei verhaltenskonformer
Portierung der Fachlogik. Es ist kein fachlicher Neuentwurf.** Was v1 tut, tut v2 auch, mit
denselben Zahlen, Schwellen und Sonderfällen, bis Aufgabe 6.5 erledigt ist.

1. **Der Entitäts-Vertrag (Abschnitt 4, `ha/contract.ts`) wird nicht geändert.** Keine neuen
   Helfer, keine umbenannten Entitäten, kein neues Kurzformat. Ausnahme: die in Phase 0 gelisteten
   Backend-Änderungen. Keine Komponente setzt Entitäts-IDs selbst zusammen; alle IDs und
   zulässigen Optionsstrings kommen aus `ha/contract.ts`.
2. **Parität vor neuen Funktionen.** Bis Aufgabe 6.5 kommt keine Funktion in v2, die v1 nicht
   hat. Wünsche kommen in Abschnitt 10.
3. **Die alte Karte wird nicht angefasst**, außer Aufgabe 0.3. Sie ist der Vergleichsmaßstab.
4. **Fachlogik wird portiert, nicht neu erfunden.** Die Regeln in Abschnitt 6 werden 1:1
   übernommen. Wer beim Portieren einen v1-Fehler findet: Specification-Vektor schreiben, der den
   Fehler eindeutig zeigt, Abweichung in Abschnitt 10 eintragen, **Herbert entscheidet** (Herberts
   Vorgabe: Beheben mit Beleg ist erlaubt, stilles „Verbessern“ nicht). Bis zur Entscheidung
   v1-Verhalten reproduzieren.
5. **Widerspruch zwischen Code und Bauplan: nicht eigenmächtig entscheiden.** Befund in
   Abschnitt 10, Aufgabe auf `blockiert`, Sitzung beenden.
6. **Jede Aufgabe endet mit grünen Tests** (`npm test` in `heidi/card`), `npm run check`
   (tsc), einem Build und **einem Commit**, dessen Text die Aufgabennummer nennt („2.1 raumwerte“).
7. **Keine Tests, die nicht fehlschlagen können.** Jeder Test hat eine Erwartung; E2E-Skripte
   setzen `process.exitCode = 1` bei jeder Abweichung.
8. **Zwei Arten von Testvektoren**, im JSON als Feld `quelle` markiert:
   `"v1"` (Characterization: mit v1 erzeugt, Zweck Parität) und `"spec"` (Specification:
   handgeschrieben aus der fachlichen Regel, Zweck Korrektheit). Jede kritische Regel (45-s-Halt,
   A-B-A-Flackern, Raumwerte-Codec, Ladestopp, Ersatzrate) hat mindestens einen `spec`-Grenzfall.
9. **Fehlerstrategie für Entitäten:** Jeder Selektor behandelt fehlende Entitäten und die
   Zustände `unknown`/`unavailable` und liefert typisierte Leerwerte (`null`, leere Liste,
   Standardwert). Die UI zeigt „–“ oder blendet den Bereich aus. Nie eine Exception aus einem
   Selektor, nie `undefined` in ein Template.
10. **Rendern:** Lit-Reaktivität zuerst. Die Shell reicht `hass` und fertige Views nach unten;
    kein globales `shouldUpdate` über alle Entitäten. Gezieltes Gating nur, wo Aufgabe 4.12 es
    misst oder wo es fachlich nötig ist (Karten-Element-Cache, Zeitleiste nur bei
    `last_changed`-Wechsel nachladen). Selektoren führen `entityIds` für Doku und Tests.
11. **Parallelbetrieb:** Während der Abnahme wird der Planer-Editor nur in v2 benutzt; v1 dient
    zum Lesen. Derselbe Plan wird nie gleichzeitig in v1 und v2 bearbeitet (kein Transaktions-
    schutz über 16 Helfer). Beide Bundles registrieren nur ihren eigenen Elementnamen und tragen
    sich nur einmal in `window.customCards` ein (vorher prüfen). Versionen von v1 und v2 werden
    getrennt geführt.
12. **HA-interne UI-Bausteine meiden.** Erlaubt: `ha-icon`, `loadCardHelpers().createCardElement`,
    Event `hass-more-info`. Alles andere (`ha-switch`, `ha-slider`, `mwc-*`, `ha-dialog`) nicht;
    v2 bringt eigene Primitive mit (wie v1).
13. **Kein `window.confirm`**: Bestätigungen laufen über `heidi-dialog` (Variante `confirm`).
14. **Keine externen Ressourcen zur Laufzeit** (keine Google Fonts). Bis zur Parität
    System-Schriftstapel; lokale Font-Dateien sind ein Thema für Abschnitt 10.
15. **Deutsch** in Bezeichnern der Domäne (wie v1: `raeume`, `saug`, `wdh`), Englisch nur für
    Technik (`render`, `update`, `api`).
16. Zahlen, die Verhalten steuern, stehen als benannte Konstanten in `domain/constants.ts` mit
    Kommentar, warum.
17. **Version**: `heidi/card/package.json` → `version`, beim Build als `HP_VERSION` in die Datei
    geschrieben, von `deploy.ps1` in die Ressource `?v=` übernommen. Vor Umschalten
    `2.0.0-alpha.N`, beim Umschalten `2.0.0`.
18. **Wiederverwendung für ein späteres allgemeines Dashboard ist kein Designziel.** Komponenten
    werden entlang von Zustands- und Verantwortungsgrenzen geschnitten, nicht für hypothetische
    Zweitverwendung.

---

## 3. Technische Festlegungen

`heidi/card/` ist ein eigenständiges Frontend-Paket innerhalb des gemeinsamen Produkt-Repos.
Keine Workspaces, kein Monorepo-Werkzeug, kein zweites Repo.

| Thema | Festlegung |
|---|---|
| Sprache | TypeScript, `strict: true`, `target: es2022`; `any` nur an der HA-Grenze (`hass.states` ist `Record<string, HassEntity>`) |
| UI | Lit 3, ein Element je Verantwortungsbereich (Abschnitt 7 ist Orientierung, keine Sollzahl), `static styles`, Shadow DOM |
| Build | esbuild, `--bundle --format=esm --target=es2022 --outfile=../../ha/www/heidi-panel-v2.js`, `--define:HP_VERSION` aus `package.json`; kein Sourcemap im Deploy |
| Element-Namen | `heidi-panel-v2` (Shell), `heidi-*` für Teile. **Nicht** `heidi-panel` (von v1 belegt) |
| Karten-Typ | `custom:heidi-panel-v2`; `window.customCards`-Eintrag „Heidi Panel v2“, nur wenn noch nicht vorhanden |
| Unit-Tests | `node --test`, Dateien `tests/unit/*.test.ts`, Ausführung über `tsx` |
| E2E | Playwright (vorhanden), `tests/e2e/*.js`, gemeinsamer Harness `tests/e2e/harness.js` (ha-icon-Stub, `loadCardHelpers`-Stub, hass-Mock mit Call-Log, `callApi`-Mock, Hilfen zum Setzen einzelner Zustände); Chromium über `executablePath` mit Fallback wie in v1 |
| Prüfung | `npm run check` = `tsc --noEmit`; `npm run lint` = ESLint flat config, `@typescript-eslint` recommended; `eslint-plugin-lit` optional (eine Zeile, fängt Template-Bindungsfehler) |
| HA-Typen | Eigene Minimaldefinition `ha/types.ts` (`HomeAssistant { states; callService; callApi; }`, `HassEntity`), keine Abhängigkeit `custom-card-helpers` |
| Overlay | Ein Feld `overlay: Overlay \| null` (diskriminierte Union: `settings`, `editor`, `rooms`, `estimate`, `zones`, `confirm`); `back`-Ziel als Feld |
| Editor-Zustand | Vollständig im Objekt `PlanDraft`, kein DOM-Rücklesen; Name über `@input` |
| Kartenslot | Element einmal je `(Kartenart, dunkel/hell)` erzeugt, in `Map` gecacht, nur bei Wechsel getauscht; `hass` bei jedem Update durchgereicht |
| Deploy | `tools/deploy.ps1` kopiert zusätzlich `www/heidi-panel-v2.js`, `dashboards/heidi-v2.yaml` und setzt `heidi-panel-v2.js?v=` aus `HP_VERSION` der v2-Datei; v1-Ressource bleibt unverändert |

---

## 4. Entitäts-Vertrag (eingefroren, technisch in `ha/contract.ts`)

`ha/contract.ts` enthält: alle Entitäts-IDs (als Konstanten und Funktionen wie
`planEntity(n, "raeume")`, `roomEntity(id, "suction_level")`), die zulässigen Optionsstrings je
Select (deutsch für Helfer, HA-Werte für Dreame-Selects), die Zuordnungstabellen (`RV`, `RV_HA`,
`RV_ENT`), Dienst-Namen und die Personen. Alles andere in der Karte importiert von dort.

Vollständige Liste in `heidi/CLAUDE.md` und `ha/packages/heidi.yaml`. Gruppen, die v2 liest (L)
und schreibt (S):

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
  (N = 1..7); L `switch.heidi_customized_cleaning`
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
├─ package.json                 name heidi-card, version 2.0.0-alpha.1; scripts: build, watch, test, test:unit, test:e2e, check, lint
├─ tsconfig.json
├─ eslint.config.js
├─ build.mjs                    esbuild-Aufruf (liest version aus package.json, define HP_VERSION)
├─ src/
│  ├─ heidi-panel-v2.ts         Shell: Layout, Tabs, Overlay, Views aus Selektoren, customElements.define, customCards
│  ├─ config.ts                 nur Anzeige: ROOMS (Kurzname, Icon), ROOMS_DE, STATUS_DE, ERR_DE, APP_SCENES, DAYS
│  ├─ version.ts                export const HP_VERSION (define)
│  ├─ domain/
│  │  ├─ constants.ts           GAP_MS 45000, STALE_ROOM_MS 30000, FLICKER_MS 45000, CUR_WINDOW_H 8, HIST_TAIL_MIN 90, HOME_MIN 3, CHARGE_EXTRA_MIN 4, DEFAULT_RATES, SUCT_F
│  │  ├─ raumwerte.ts           parseRaum, encodeRaum, Typen RoomValues, Modus, Saugstufe, Wasser, Route
│  │  ├─ estimate.ts            estimate(plan, lern, ctx), rate(), chargeMin(), restMinFallback(input)
│  │  ├─ timeline.ts            runsFromVacuum(vt), timelineRows(phaseRows, vacRows, key, startMs, endMs, nowMs)
│  │  ├─ calibration.ts         calibration(points) → {toVac, toMap} | null; rectsFromAttr
│  │  ├─ status.ts              heroModel(input) → {big, sub, buttons, color, errorChip}
│  │  └─ labels.ts              dayLabel, roomLabel, fmtMin, fmtDate, fmtTime
│  ├─ ha/
│  │  ├─ contract.ts            Entitäts-IDs, Optionsstrings, RV/RV_HA/RV_ENT, Dienste, Personen (Abschnitt 4)
│  │  ├─ types.ts               HomeAssistant, HassEntity, States
│  │  ├─ selectors.ts           readRobot, readPlan, readRoomValues, readAllRoomValues, readLearn, readHistory(cache), readPrognose, readSettings; je Funktion `xxxEntityIds` (Doku/Tests)
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
│  ├─ e2e/harness.js, render.js, editor.js, zones.js, timeline.js, live-update.js, availability.js, widths.js, roundtrip-v1.js
│  └─ fixtures/
│     ├─ states-docked.json     (aus heidi/tests/real_states.json, erneuert)
│     ├─ states-cleaning.json
│     ├─ raumwerte.vectors.json      Einträge mit quelle "v1" | "spec"
│     ├─ estimate.vectors.json
│     └─ timeline.vectors.json
├─ tools/
│  └─ v1-vectors.js             lädt v1 in Playwright, ruft alte Methoden mit Vektor-Eingaben, schreibt quelle "v1"-Einträge
└─ README.md                    Build/Test/Deploy in 10 Zeilen
```

`heidi/tests/` (v1) bleibt bestehen, bis v1 abgeschaltet ist. `heidi/mockups/build-live.js`
bekommt einen Parameter für die v2-Datei (Phase 5, optional).

---

## 6. Portierungstabelle (alt → neu) mit den Regeln, die übernommen werden müssen

| v1 (`ha/www/heidi-panel.js`) | v2 | Regeln, die exakt so bleiben |
|---|---|---|
| `E`, `RV`, `RV_HA`, `RV_ENT`, `OPT`, Personen | `ha/contract.ts` | Werte 1:1; keine Komponente baut IDs selbst |
| `parseRaum`, `encodeRaum` | `domain/raumwerte.ts` | Unbekannter Modus → „Saugen“, unbekannte Saugstufe → „Standard“, Wasser nur bei Modus ≠ Saugen kodieren, Route nur bei „Nur Wischen“, Wdh nur 1–3 sonst „1“, IDs außerhalb 1..7 ignorieren, Ausgabe nach ID sortiert |
| `_estimate`, `_rate`, `_chargeMin`, `_restMin`, `_planVals` | `domain/estimate.ts` | Reihenfolge = `cleaning_sequence` gefiltert auf Planräume, Rest angehängt; Varianten schnell/leise = nur Saugen mit sp-/ho-Profil ohne Raumwerte; Mopp-Wäsche vor Start wenn irgendein Raum nass; Ladestopp wenn `batt - drain < rueckkehr_pct` → laden bis `weiter_pct` + 4 min; Zwischenwäsche wenn nass und `since >= nach_m2`; +3 min Heimfahrt; Ersatzrate: gelernte Rate desselben Modus × Faktor (0.8/1/1.25/1.6) / Faktor der Basis, sonst 0.9/0.3 bzw. 1.6/0.42; Raumfläche Standard 8 m². `restMin`: nach 0.4 aus `sensor.heidi_automatik_status`-Attributen; JS-Fallback nur bei fehlendem Attribut |
| `_loadTimeline` (Mitte), `_timelineHtml` (Dauer) | `domain/timeline.ts` | Lauf = `cleaning|paused|returning`; Halt < 45 s unterbricht nicht; Ende = erster Halt ≥ 45 s; `cur` = letzter Lauf, sonst der Lauf mit Ende > Start − 60 s; Phasen-Zeilen nur in [start − 5 s, stop), ohne `PHASE_IDLE`, Duplikate zusammenlegen, erste Zeile entfernen solange die zweite < 30 s danach kommt, A-B-A mit B < 45 s glätten; Dauer der letzten Zeile bis `stop`; Fenster `cur` = jetzt − 8 h; Fenster Eintrag = start … min(start + Dauer + 90 min, nächster Lauf, jetzt) |
| `_calib`, `_rectsFromAttr` | `domain/calibration.ts` | Affine Abbildung aus 3 Punkten per Cramer; `null` bei < 3 Punkten oder Determinante 0; Rechtecke aus `x0..x3/y0..y3` als min/max |
| `_hero` (Textlogik), `STATUS_DE`, `TASK` | `domain/status.ts` | Phase gilt, wenn nicht `unknown/unavailable/""`; groß: `error` → „Fehler“; `paused` → „Pausiert“ + Auftrag; `returning` → „Fährt zur Station“ + Phase; `cleaning` → Auftrag (Planername wenn `heidi_auto_lauf` an, sonst TASK-Text) + Phase; sonst Phase bzw. STATUS_DE; `sub === big` → leer. Knöpfe: cleaning → Pause/Stopp/Station; paused → Weiter/Stopp/Station; returning → Pause/Stopp/Orten; docked → Start/Orten; sonst Start/Station/Orten. Fehler-Chip rot wenn `has_error`, sonst gelb; `no_error`/`unavailable` → kein Chip |
| `_strip`, `_roomVals` | `heidi-hero` + `selectors.readRoomValues` | Nur bei cleaning/paused; `cleaned_area == 0` und cleaning → „Fährt zum Startpunkt zu <erster Raum>“; Raum nicht in `active_segments` (wenn nicht leer) → „Fährt durch <Raum>“; sonst „Jetzt: <Raum>“ + Chips Modus/Saug/(Wasser wenn nass)/(Route wenn nur Wischen)/Wdh, rechts „danach A → B“ oder „letzter Raum“ |
| `_dayLabel`, `_roomLabel`, `_fmtMin`, `fmtDate` | `domain/labels.ts` | 7 Tage „Täglich“, 0 „Manuell“, Mo–Fr, Sa + So, sonst Kürzel mit „ + “ bei ≤ 3 Tagen und Leerzeichen bei > 3; Räume: 7 → „Alle“, 0 → „keine Räume“; Datum `de-AT`, „heute“ |
| `_planRead` | `selectors.readPlan` | Tage-Maske auf 7 Zeichen auffüllen, Räume-Set nur 1..7, Zeit Standard „09:30“, Personen getrimmt |
| `_histAttrs` | `selectors.readHistory(states, cache)` | Wenn Sensor `unknown/unavailable` oder keine Attribute mit `timestamp`: letzten gültigen Stand behalten (Cache lebt in der Shell) |
| `_lern` | `selectors.readLearn` | `null` wenn Sensor fehlt/unavailable oder ohne `raten` |
| `_signature` | entfällt; Lit-Reaktivität (Regel 10) | Kein Nachfolger. `entityIds` in Selektoren nur Doku/Tests |
| `_saveEditor` | `HeidiApi.savePlan(n, draft)` | Validierung: Name nicht leer, ≥ 1 Raum; Raumwerte nur für gewählte Räume speichern; 16 Calls wie v1 (Erwartung aus `heidi/tests/test-editor.js`); Zeit als `HH:MM:00` |
| `_rvClick` (Roboter-Modus) | `HeidiApi.setRoomValue(ids, key, value)` | Optionsname über `RV_HA`-Inverse, Wdh mit Suffix `x`; „Alle Räume“ = alle 7 parallel |
| `_zonesAction("save")` | `HeidiApi.setZones(zones, noMops)` | Immer beide Listen senden |
| `_onClick` `data-svc/press/reset/run/app/shell/toggle/option` | `HeidiApi.vacuum(cmd)`, `press(id)`, `runPlan(n)`, `runScene(id)`, `shell(name)`, `toggle(id)`, `selectOption(id, v)`, `setNumber(id, v)`, `setTime(id, hhmm)` | `runPlan` verweigert bei inaktivem Eintrag (Toast); `setTime` unterscheidet `time.` (`time.set_value`) und `input_datetime` (`set_datetime`); `heidi_prognose_intervall` auf 5/10/15/20/30/60 runden; Dark-Mode über `turn_on/turn_off` |
| `_mountMap` | `heidi-map-card` | Drei Konfigurationen (Dreame-App, Xiaomi-Karte inkl. `predefined_selections`-Koordinaten, Nur Bild) 1:1; Cache je `kind|dark` |
| `_clockHtml`, `_edClick` clock* | `heidi-clock-picker` | 24-h-Ring (0–11 außen, 12–23 innen), Minuten in 5er-Schritten, Stunde wählen → Minutenmodus, OK/Abbrechen |
| `_roomsHtml`, `_rvClick` (Plan-Modus) | `heidi-rooms-dialog` | Plan-Modus: nur gewählte Räume, „eigene Werte“ je Raum, Standard des Eintrags sonst; Wasser nur nass, Route nur „Nur Wischen“ (gedimmt); „Alle auf Standard“; Roboter-Modus: Zeile „Alle Räume“ mit gemeinsamen Werten (`–` bei Abweichung), sofortiges Schreiben, „Raum-Einstellungen nicht verfügbar“ wenn Modus unavailable |
| `_estHtml`, `_estLine` | `heidi-estimate-dialog`, Kurzzeile in `heidi-planer` | Kurzzeile nur wenn Lernwerte; Haken/Kreuz gegen `restMin`; Stecker bei Nachladen; Dialog: Zusammenfassung, Schrittliste, SVG 600×190 mit Linien je 25 %, Rückkehr-Linie, Vergleichslinie Standard↔Turbo, gestrichelt = geschätzt |
| `_history`, `_timelineHtml` | `heidi-history` | 30 Einträge absteigend; „Läuft gerade“ oben nur wenn Roboter unterwegs, Zeitleiste dafür neu laden wenn `last_changed` von Phase oder Vacuum wechselt; Protokoll automatisch offen während eines Laufs; Klick lädt Zeitleiste einmal (Cache je Schlüssel) |
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

## 7. Komponenten (Orientierung, Schnitt nach Zustands- und Verantwortungsgrenzen)

Jede Komponente: `@property({attribute:false}) hass`, dazu die fertige Sicht als Property,
`api: HeidiApi` als Property aus der Shell. Ereignisse nach oben als `CustomEvent`
(`heidi-open-overlay`, `heidi-toast`, `heidi-view`, `heidi-close`, `heidi-back`). Keine
Komponente ruft `hass.callService` direkt. Wenn beim Bau zwei Elemente denselben Zustand teilen
müssten, werden sie eines; wenn ein Element zwei unabhängige Zustände trägt, werden es zwei.

| Element | Bekommt | Sendet | Abnahme |
|---|---|---|---|
| `heidi-panel-v2` | hass | – | Rendert mit `states-docked.json` ohne Konsolenfehler; Overlay-Union; Escape |
| `heidi-hero` | hass, robotView, api | `heidi-open-overlay {rooms}` | Tabelle aus `test-timeline.js` (Kopf, Knöpfe je Zustand); Streifen-Fälle Startpunkt/durchfahren/jetzt |
| `heidi-map-card` | hass, api, kind, dark | `heidi-open-overlay {zones}` | Karten-Element bleibt über 20 hass-Updates dasselbe DOM-Objekt; Raumauswahl → `vacuum_clean_segment {segments}` nach Bestätigung |
| `heidi-planer` | plans[], today, lern, api | `heidi-open-overlay {editor n}`, `{estimate n}` | 4 Zeilen, heutiger Eintrag markiert, Manuell-Tag, ▶ verweigert bei inaktiv |
| `heidi-planer-editor` | hass, api, n, plan | `heidi-close` | Klickfolge aus `test-editor.js` erzeugt dieselben 16 Calls; hass-Update verändert Draft nicht |
| `heidi-clock-picker` | value | `change` | 10 → Minutenmodus → 15 → OK = „10:15“ |
| `heidi-rooms-dialog` | hass, api, mode, draft? | `heidi-close`, `heidi-back` | Roboter-Modus schreibt `select_option` sofort; Plan-Modus ändert nur Draft |
| `heidi-history` | hass, historyView, api | – | Zeitleiste aus `test-timeline.js` (7 Zeilen, Summen); Protokoll bleibt bei unavailable |
| `heidi-estimate-dialog` | plan, lern, restMin, n | `heidi-close`/`back` | Summen gegen `estimate.vectors.json`; SVG vorhanden |
| `heidi-automatik`, `heidi-station`, `heidi-consumables`, `heidi-robot-settings` | hass, api | – | Jeder Knopf/Select erzeugt den erwarteten Call |
| `heidi-prognose-card`, `heidi-prognose-view` | prognoseView, api | `heidi-view {prog}` | Unsichtbar wenn Prognose aus; Balkenbreite korrekt |
| `heidi-settings-panel` | hass, api | `heidi-close` | Slider-Rundung Intervall; Versionszeile |
| `heidi-zones-editor` | hass, api | `heidi-close` | `test-zones.js`: gezeichnetes Rechteck ergibt dieselben mm-Koordinaten wie v1 |
| `heidi-dialog` | title, variant (`modal`/`sheet`/`confirm`) | `heidi-close`, `heidi-confirm` | Escape schließt; unter 600 px Container als Bottom-Sheet |

---

## 8. Aufgabenkartei

Jede Karte hat vier Felder. **Ziel** sagt, was entsteht. **Nicht ändern** nennt, was diese
Aufgabe nicht anfassen darf. **Akzeptanz** ist prüfbar. **Tests** nennt die Befehle. Eine
Sitzung liest nur die Karte ihrer Aufgabe, nicht alle.

### Phase 0 – Netz spannen (v1-Tests werden Abnahme für v2)

**0.1 v1-Tests scharf stellen**
- Ziel: `heidi/tests/harness.js` (ha-icon-Stub, `loadCardHelpers`-Stub, hass-Mock mit Call-Log, `callApi`-Mock); alle vier Tests nutzen ihn, prüfen mit `assert` und setzen `process.exitCode = 1`; `npm test` führt alle vier aus. Erwartungen aus den heutigen Ausgaben festschreiben: 16 Calls beim Speichern von Plan 2 mit der Klickfolge aus `test-editor.js`, 7 Zeitleisten-Zeilen und Kopf-Tabelle aus `test-timeline.js`, Zonen-Koordinaten `[[-4200,-4775,-1150,-2075],[-1550,-188,-643,937]]` bei der Geste aus `test-zones.js`, `test-real.js` ohne Konsolenfehler.
- Nicht ändern: `ha/www/heidi-panel.js`, `real_states.json`, die Klickfolgen selbst.
- Akzeptanz: `npm test` grün; eine absichtlich falsche Erwartung lässt ihn rot werden (einmal ausprobieren, dann zurücknehmen).
- Tests: `cd heidi/tests && npm test`.

**0.2 [PC] Fixtures erneuern**
- Ziel: `heidi/card/tests/fixtures/states-docked.json` (Heidi angedockt) und `states-cleaning.json` (mitten in einem Lauf, Streifen sichtbar) per `tools/dump-states.ps1`. `heidi/tests/real_states.json` bleibt für v1 unverändert.
- Nicht ändern: Inhalt der Abzüge von Hand (außer Token/Passwörter, falls in Attributen: dann Attribut entfernen und in Abschnitt 10 notieren).
- Akzeptanz: Beide Dateien enthalten `sensor.heidi_phase`, `sensor.heidi_lernwerte` (mit `raten`), `input_text.heidi_plan1..4_raumwerte`, `switch.heidi_customized_cleaning`, `binary_sensor.heidi_arbeitszeit`, alle `button.heidi_*`; `states-cleaning.json` hat `vacuum.heidi` = `cleaning` mit `current_segment`.
- Tests: kleines Prüfskript `node heidi/card/tools/check-fixture.js <datei>` (Teil dieser Aufgabe), das die Liste aus Abschnitt 4 gegen die Datei prüft.

**0.3 v1: `task_status` in die Signatur**
- Ziel: `"sensor.heidi_task_status"` in der ID-Liste von `_signature()`; `HP_VERSION` 1.6.1.
- Nicht ändern: alles andere in v1.
- Akzeptanz: v1-Tests grün; nach Deploy wechselt der Kopf bei Änderung von `task_status` sofort.
- Tests: `cd heidi/tests && npm test`; [PC] deploy + Sichtprüfung.

**0.4 Backend: `rest_min` als Attribut**
- Ziel: `sensor.heidi_automatik_status` bekommt Attribute `rest_min` (Ganzzahl, Minuten bis erwartete Rückkehr, kann negativ sein) und `rest_quelle` („Prognose“ oder „übliche Rückkehr HH:MM“), berechnet mit der Logik aus dem heutigen `detail`-Template (`use_prog`-Bedingung identisch). `heidi_planer`-Automation: Variable `rest_min` liest `state_attr('sensor.heidi_automatik_status','rest_min')`. `detail` bleibt unverändert.
- Nicht ändern: Entscheidungslogik der Automation, Helfer, andere Sensoren.
- Akzeptanz: `config/core/check_config` ohne Fehler; nach `template/reload` + `automation/reload` zeigt `ha.ps1 get states/sensor.heidi_automatik_status` beide Attribute mit plausiblen Werten; Automations-Trace zeigt denselben `rest_min` wie das Attribut.
- Tests: [PC] `.\tools\ha.ps1 post config/core/check_config`, Reloads, Sichtprüfung.

### Phase 1 – Gerüst, das in HA sichtbar ist

**1.1 Toolchain**
- Ziel: `heidi/card/package.json` (devDependencies: lit, esbuild, typescript, tsx, eslint, typescript-eslint, optional eslint-plugin-lit; playwright über `heidi/tests/node_modules` oder eigene devDependency), `tsconfig.json` (strict, es2022, moduleResolution bundler), `eslint.config.js`, `build.mjs`, Scripts `build`, `watch`, `check`, `lint`, `test:unit`, `test:e2e`, `test`, `README.md`.
- Nicht ändern: nichts außerhalb `heidi/card/`.
- Akzeptanz: `npm ci && npm run build` erzeugt `ha/www/heidi-panel-v2.js` aus einem Platzhalter-Modul; `npm run check` und `npm run lint` laufen durch.
- Tests: die genannten Befehle.

**1.2 Leere Shell**
- Ziel: `src/heidi-panel-v2.ts` als `LitElement` mit Kopfzeile „Heidi“, Tabs „Übersicht/Prognose“ (Prognose nur wenn `input_boolean.heidi_prognose_aktiv` an), Versionszeile `HP_VERSION`, `styles/tokens.ts` + `styles/base.ts` aus v1-CSS übernommen, `setConfig`, `getCardSize`, `customElements.define("heidi-panel-v2")`, `customCards`-Eintrag mit Vorhandenseins-Prüfung.
- Nicht ändern: v1.
- Akzeptanz: E2E `render.js` lädt das Bundle mit `states-docked.json` ohne Konsolenfehler und findet die Versionszeile.
- Tests: `npm run build && npm run test:e2e`.

**1.3 Dashboard und Deploy**
- Ziel: `ha/dashboards/heidi-v2.yaml` (panel-View, `custom:heidi-panel-v2`), `configuration.yaml` Dashboard `heidi-v2-yaml` (Titel „Heidi v2“, Icon `mdi:robot-vacuum-variant`), `tools/deploy.ps1` kopiert v2-Datei und Dashboard und setzt `heidi-panel-v2.js?v=` aus `HP_VERSION` der v2-Datei (v1-Ressource unverändert).
- Nicht ändern: `heidi.yaml` (v1-Dashboard), v1-Ressource.
- Akzeptanz: `deploy.ps1` läuft trocken durch (Pfadprüfung im Skript); YAML valide.
- Tests: [PC] `.\tools\deploy.ps1`, `ha.ps1 post config/core/check_config`.

**1.4 [PC] Ressource und Sichtbarkeit**
- Ziel: Ressource `/local/heidi-panel-v2.js?v=2.0.0-alpha.1` (Typ module) per `node tools/ha-ws.js lovelace/resources/create '{"res_type":"module","url":"/local/heidi-panel-v2.js?v=2.0.0-alpha.1"}'` in Git Bash; HA-Neustart; Strg+F5.
- Nicht ändern: v1-Ressource.
- Akzeptanz: „Heidi v2“ in der Sidebar zeigt die Shell mit Versionszeile; „Heidi“ (v1) unverändert.
- Tests: Sichtprüfung, Browser-Konsole ohne Fehler.

### Phase 2 – Domäne portieren

**2.0 Vertrag und Vektor-Werkzeug**
- Ziel: `src/ha/contract.ts` (Abschnitt 4, Werte aus v1 `E`, `RV`, `RV_HA`, `RV_ENT`, `OPT`, Personen, Dienste); `tools/v1-vectors.js`: lädt `ha/www/heidi-panel.js` in Playwright mit Harness, ruft die alten Methoden (`parseRaum`/`encodeRaum` über das Modul, `_estimate`, `_loadTimeline`-Mitte über ein instrumentiertes `callApi`, `_calib`) mit den Eingaben aus einer Vektordatei auf und schreibt die Ergebnisse als Einträge mit `quelle: "v1"` zurück.
- Nicht ändern: v1.
- Akzeptanz: `contract.ts` deckt jede in Abschnitt 4 gelistete ID ab (Unit-Test zählt); `v1-vectors.js` erzeugt für einen Beispielvektor je Datei einen Eintrag.
- Tests: `npm run test:unit -- contract`.

**2.1 Raumwerte**
- Ziel: `domain/raumwerte.ts` mit `parseRaum`, `encodeRaum`, Typen; `fixtures/raumwerte.vectors.json` mit `quelle: "v1"`-Einträgen (mindestens: leer, ein Raum, alle sieben, `-`-Felder, ungültige ID, ungültige Wdh, Wasser bei Saugen, Route bei Saugen+Wischen) und `quelle: "spec"`-Einträgen (Roundtrip-Eigenschaft, Sortierung, 255-Zeichen-Grenze bei 7 Räumen).
- Nicht ändern: Format und Default-Semantik (Abschnitt 6).
- Akzeptanz: Alle Vektoren grün; `encodeRaum(parseRaum(s))` stabil für alle v1-Vektoren.
- Tests: `npm run test:unit -- raumwerte`.

**2.2 Schätzung**
- Ziel: `domain/estimate.ts` (`estimate`, `rate`, `chargeMin`, `restMinFallback`); `fixtures/estimate.vectors.json` mit `v1`-Einträgen (Plan 1–4 aus `states-docked.json` mit Beispiel-Lernwerten aus `build-live.js`, Varianten normal/schnell/leise, mit und ohne Raumwerte, Akku 100/40/20) und `spec`-Einträgen (Ladestopp exakt an der Schwelle `rueckkehr_pct`, Zwischenwäsche exakt bei `nach_m2`, Ersatzrate ohne gelernte Basis, leere Raumliste).
- Nicht ändern: Zahlen aus Abschnitt 6.
- Akzeptanz: `total`, `charges`, `battEnd`, Schrittanzahl und -typen stimmen mit den Vektoren; `spec`-Fälle grün.
- Tests: `npm run test:unit -- estimate`.

**2.3 Zeitleiste**
- Ziel: `domain/timeline.ts` (`runsFromVacuum`, `timelineRows`); `fixtures/timeline.vectors.json` mit `v1`-Einträgen (die Historie aus `test-timeline.js` für `cur` und für einen Eintrag) und `spec`-Einträgen (Halt genau 44 s vs. 45 s; A-B-A mit B = 44 s vs. 45 s; erste Zeile 29 s vs. 30 s; Lauf ohne Ende; zwei Läufe im Fenster; Eintrag, dessen Lauf 59 s vor `start` endete).
- Nicht ändern: Konstanten aus `domain/constants.ts`.
- Akzeptanz: Alle Vektoren grün; die 7 Zeilen aus `test-timeline.js` entstehen aus reinen Funktionen ohne Browser.
- Tests: `npm run test:unit -- timeline`.

**2.4 Kalibrierung**
- Ziel: `domain/calibration.ts`; Tests mit den `calibration_points` aus `states-docked.json`: Hin- und Rücktransformation innerhalb 1 mm, `null` bei 2 Punkten und bei kollinearen Punkten, `rectsFromAttr` mit Objekt und Liste.
- Nicht ändern: Cramer-Verfahren (Ergebnisgleichheit mit v1).
- Akzeptanz: Tests grün; Zonen-Koordinaten aus Aufgabe 0.1 reproduzierbar (Pixel → mm).
- Tests: `npm run test:unit -- calibration`.

**2.5 Status**
- Ziel: `domain/status.ts` (`heroModel`); Tabelle aus `test-timeline.js` als Unit-Tabelle plus alle Kombinationen (vac × phaseOk × autoLauf × has_error).
- Nicht ändern: Texte und Knopfreihenfolge aus Abschnitt 6.
- Akzeptanz: Tabelle grün.
- Tests: `npm run test:unit -- status`.

**2.6 Beschriftungen**
- Ziel: `domain/labels.ts`; Tests für `dayLabel` (alle Sonderfälle), `roomLabel`, `fmtMin` (59, 60, 61, 125), `fmtDate` (heute/anderer Tag, ungültig → „–“).
- Nicht ändern: Ausgabeformate.
- Akzeptanz: Tests grün.
- Tests: `npm run test:unit -- labels`.

**2.7 Python gegen dieselben Vektoren**
- Ziel: `ha/prognose/tests/test_runlog.py` (pytest): `parse_raumwerte` gegen `raumwerte.vectors.json`, `schaetzung` gegen `estimate.vectors.json` (Toleranz ±1 min bei `total`, weil v1 erst am Ende rundet), `split_runs` gegen `timeline.vectors.json` (Laufgrenzen).
- Nicht ändern: `runlog.py` (Abweichungen → Abschnitt 10, nicht anpassen).
- Akzeptanz: pytest grün oder jede Abweichung in Abschnitt 10 mit Vektor-ID dokumentiert.
- Tests: `cd ha/prognose && python3 -m pytest`.

### Phase 3 – HA-Schicht

**3.1 Typen und Selektoren**
- Ziel: `ha/types.ts`; `ha/selectors.ts` mit `readRobot`, `readPlan(n)`, `readRoomValues(id)`, `readAllRoomValues`, `readLearn`, `readHistory(cache)`, `readPrognose`, `readSettings`, je mit `xxxEntityIds`. Regel 9 (Leerwerte) für jede Funktion.
- Nicht ändern: `contract.ts`.
- Akzeptanz: Gegen beide Fixtures liefern alle Selektoren die erwarteten Werte (Plan 2 aus `states-docked.json` als Referenz); Test mit einem `Proxy` auf `states` belegt, dass jede gelesene ID in `xxxEntityIds` steht; Test mit leerem `states` wirft nichts und liefert Leerwerte.
- Tests: `npm run test:unit -- selectors`.

**3.2 API**
- Ziel: `ha/api.ts` (`HeidiApi` mit den Methoden aus Abschnitt 6); Unit-Test mit Call-Log: `savePlan` erzeugt exakt die 16 Calls aus Aufgabe 0.1, `setRoomValue` bildet Optionen richtig ab, `setTime` unterscheidet Domänen, `runPlan` bei inaktivem Plan ohne Call.
- Nicht ändern: Dienst-Namen und Payloads (Abschnitt 4).
- Akzeptanz: Tests grün.
- Tests: `npm run test:unit -- api`.

**3.3 Shell**
- Ziel: Shell erzeugt Views über Selektoren und reicht sie mit `hass` und `api` an Kinder; Overlay-Union (`shared/overlay.ts`), Toast, Escape, Tabs, Weiterleitung `hass-more-info`, Cache für `readHistory`.
- Nicht ändern: kein `shouldUpdate` in der Shell (Regel 10).
- Akzeptanz: E2E `render.js` grün; Overlay öffnen/schließen per Ereignis funktioniert mit einem Platzhalter-Dialog.
- Tests: `npm test`.

### Phase 4 – Komponenten

Für jede Komponente gilt zusätzlich: nach dem Build in „Heidi v2“ neben „Heidi“ ansehen;
Unterschiede in Abschnitt 10 notieren, wenn gewollt, sonst beheben. Layout in Phase 4 nur
Desktop.

**4.1 `heidi-hero`**
- Ziel: Kopf mit Ring, groß/klein-Text aus `status.ts`, Personen-Chips, Fehler-Chip, DND-Chip, Knöpfe, Streifen.
- Nicht ändern: `status.ts`, `contract.ts`.
- Akzeptanz: E2E-Tabelle aus 0.1 (Kopf, Knöpfe je Zustand) grün gegen v2; Streifen-Fälle mit `states-cleaning.json`; Klick auf Knöpfe erzeugt `vacuum.*`-Calls.
- Tests: `npm test`.

**4.2 `heidi-map-card`**
- Ziel: Kartenslot mit Element-Cache, Raum-Chips mit Mehrfachauswahl, Leiste „N Räume reinigen“ mit Bestätigung über `heidi-dialog` (Vorgriff: minimaler `heidi-dialog` mit `confirm`-Variante darf hier entstehen), Zonen-Knopf mit Zähler, Stühle-Knopf.
- Nicht ändern: die drei Kartenkonfigurationen (1:1 aus v1).
- Akzeptanz: Karten-Element bleibt über 20 hass-Updates identisch (E2E vergleicht Referenz); Raumauswahl → `vacuum_clean_segment` mit richtigen `segments`.
- Tests: `npm test`.

**4.3 `heidi-planer`**
- Ziel: Vier Zeilen, App-Szenen-Details, Dauer-Kurzzeile (nur mit Lernwerten), ▶ mit Bestätigung, ✎ öffnet Editor-Overlay.
- Nicht ändern: `estimate.ts`.
- Akzeptanz: Mit `states-docked.json` vier Zeilen, heutiger Eintrag markiert; ▶ bei inaktivem Plan nur Toast.
- Tests: `npm test`.

**4.4 `heidi-dialog`, `heidi-planer-editor`, `heidi-clock-picker`**
- Ziel: Dialog-Rahmen (modal/sheet/confirm, Escape, Scrim), Editor mit `PlanDraft`, Uhr.
- Nicht ändern: die 16 Calls (Aufgabe 3.2).
- Akzeptanz: E2E `editor.js` (Klickfolge aus 0.1) erzeugt dieselben 16 Calls; E2E `live-update.js`: bei offenem Editor neuen Akkuwert setzen → Kopf aktualisiert, Draft unverändert, Fokus im Namensfeld bleibt.
- Tests: `npm test`.

**4.5 `heidi-rooms-dialog`**
- Ziel: beide Modi, Umschalter im Editor-Kontext, Zeile „Alle Räume“, Zurück zum Eintrag.
- Nicht ändern: `setRoomValue`.
- Akzeptanz: Roboter-Modus erzeugt `select_option` sofort (E2E), Plan-Modus ändert nur Draft; „Raum-Einstellungen nicht verfügbar“ mit einem Raum auf `unavailable`.
- Tests: `npm test`.

**4.6 `heidi-history`, `heidi-robot-settings`**
- Ziel: Letzter Lauf, Protokoll, Zeitleiste (Nachladen nur bei `last_changed`-Wechsel), Roboter-Einstellungen.
- Nicht ändern: `timeline.ts`.
- Akzeptanz: E2E `timeline.js` (Historie aus 0.1) zeigt dieselben 7 Zeilen; Protokoll bleibt bei `unavailable`; Klick auf Eintrag löst genau einen `callApi` aus.
- Tests: `npm test`.

**4.7 `heidi-estimate-dialog`**
- Ziel: Zusammenfassung, Schnellprogramm-Zeile, Schrittliste, SVG, Vergleich.
- Nicht ändern: `estimate.ts`.
- Akzeptanz: Summen im Dialog entsprechen `estimate.vectors.json` für Plan 2; Vergleichslinie erscheint beim Umschalten.
- Tests: `npm test`.

**4.8 `heidi-automatik`, `heidi-station`, `heidi-consumables`**
- Ziel: drei Karten wie v1.
- Nicht ändern: Kacheltexte.
- Akzeptanz: jeder Knopf/Select/Slider erzeugt den erwarteten Call (E2E-Tabelle); Reset und Station mit Bestätigung.
- Tests: `npm test`.

**4.9 `heidi-prognose-card`, `heidi-prognose-view`**
- Ziel: Kachelkarte und Tab.
- Nicht ändern: Bild-URLs.
- Akzeptanz: Karte und Tab unsichtbar bei `prognose_aktiv` aus; Balkenbreite = `tage/(wochen×7)`; Reset mit Bestätigung → `shell_command`.
- Tests: `npm test`.

**4.10 `heidi-settings-panel`**
- Ziel: alle Abschnitte inkl. Lernwerte und Version.
- Nicht ändern: Rundungsregel Intervall.
- Akzeptanz: Slider-Änderung erzeugt `set_value` mit gerundetem Wert; Dark/Hell schaltet `light`-Klasse.
- Tests: `npm test`.

**4.11 `heidi-zones-editor`**
- Ziel: Zeichnen, Auswählen, Löschen, Speichern.
- Nicht ändern: `calibration.ts`.
- Akzeptanz: E2E `zones.js` (Geste aus 0.1) ergibt dieselben mm-Koordinaten wie v1; Hinweis bei fehlender Kalibrierung.
- Tests: `npm test`.

**4.12 Render-Messung**
- Ziel: E2E `perf.js`: `states-cleaning.json`, alle 200 ms ein hass-Update mit geändertem `vacuum.heidi.last_updated`, 10 s lang; misst Renderzeit je Update (Performance-API) und Anzahl `update()`-Aufrufe je Komponente (Zähler im Harness). Ergebnis in Abschnitt 10 eintragen. Gating nur dort einbauen, wo eine Komponente ohne Datenänderung rendert und das messbar ins Gewicht fällt (Richtwert: Median > 8 ms je Update auf dem Entwicklungsrechner oder sichtbares Ruckeln auf dem Tablet).
- Nicht ändern: keine globale Renderbarriere.
- Akzeptanz: Messwerte dokumentiert; Entscheidung je Komponente dokumentiert.
- Tests: `npm run test:e2e -- perf`.

### Phase 5 – Responsive

**5.1 Layout**
- Ziel: `container-type: inline-size` auf dem Wrapper der Shell; 2 Spalten ab 880 px Container; in Komponenten `@container`-Regeln entsprechend den 12 v1-Media-Queries; Media Queries nur für Safe Area (`env(safe-area-inset-*)`), Pointer/Hover und sehr kleine Viewports; `heidi-dialog` als Bottom-Sheet unter 600 px Container; Protokoll 30 Einträge + „mehr anzeigen“; kein fester „Smartphone-Modus“.
- Nicht ändern: Komponentenschnitt.
- Akzeptanz: Sichtprüfung bei 390/820/1200 px im Browser; Bottom-Sheet bei 390.
- Tests: `npm test`.

**5.2 Breiten-E2E**
- Ziel: E2E `widths.js`: Render bei 390/820/1200 mit beiden Fixtures, `document.scrollingElement.scrollWidth <= clientWidth`, Editor bei 390 als Sheet, Screenshots nach `tests/e2e/out/` (gitignored).
- Nicht ändern: –
- Akzeptanz: grün.
- Tests: `npm run test:e2e -- widths`.

### Phase 6 – Parallelbetrieb und Umschalten

**6.1 Round-Trip v2 → v1**
- Ziel: E2E `roundtrip-v1.js`: v2 speichert Plan 2 mit der Klickfolge aus 0.1; die erzeugten Calls werden auf ein `states`-Objekt angewendet; v1 (`ha/www/heidi-panel.js`) wird mit diesem `states` geladen und `_planRead(2)` ergibt exakt die Werte des Drafts. Zusätzlich E2E `availability.js`: `states-cleaning.json`, dann `sensor.heidi_cleaning_history` und `select.heidi_room_*` auf `unavailable`, dann wieder verfügbar → kein Konsolenfehler, Protokoll bleibt, Streifen erscheint wieder.
- Nicht ändern: v1.
- Akzeptanz: beide grün.
- Tests: `npm run test:e2e -- roundtrip availability`.

**6.2 Paritäts-Checkliste**
- Ziel: Abschnitt 9 vollständig abhaken, jede Zeile an v1 und v2 nebeneinander geprüft (Browser, beide Dashboards).
- Nicht ändern: –
- Akzeptanz: keine offene Zeile; jede gewollte Abweichung steht in Abschnitt 10 mit Herberts Abnahme.
- Tests: manuell.

**6.3 [PC] Geräte-Sichtung**
- Ziel: Companion-App Hochformat und Querformat (Safe Area, Bottom-Sheet, Streifen), Tablet mit HA-Sidebar (Spaltenwechsel nach Containerbreite), Tablet-Kiosk, Desktop mit Sidebar.
- Akzeptanz: Befunde in Abschnitt 10; keine offenen Layoutfehler.
- Tests: manuell.

**6.4 [PC] Sieben Tage Parallelbetrieb**
- Ziel: v2 als Hauptdashboard im Alltag, v1 nur zum Lesen (Regel 11).
- Akzeptanz: sieben Tage ohne offenen Befund in Abschnitt 10.

**6.5 [PC] Umschalten**
- Ziel: `ha/dashboards/heidi.yaml` → `custom:heidi-panel-v2`; `heidi-v2.yaml` und Dashboard-Eintrag entfernen; `ha/www/heidi-panel.js` → `ha/www/heidi-panel-v1.js` (Ressource entfernen oder umbenennen); `heidi/tests` → `heidi/tests-v1`; `HANDOFF.md`, `heidi/CLAUDE.md`, `CLAUDE.md` auf v2; Version `2.0.0`; Build-Ziel wird `ha/www/heidi-panel.js` (Element bleibt `heidi-panel-v2`, Typ bleibt `custom:heidi-panel-v2`).
- Akzeptanz: Abschnitt 11 vollständig erfüllt.

---

## 9. Paritäts-Checkliste (Abnahme für 6.2)

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
- [ ] `unavailable → available` ohne Fehler (Protokoll, Raum-Selects, Prognose, Lernwerte)
- [ ] Während des Editors aktualisiert sich der Kopf weiter (gewollte Abweichung von v1)
- [ ] Handy (390 px): kein horizontales Scrollen, Dialoge als Sheet, alle Knöpfe erreichbar, Safe Area in der Companion-App

---

## 10. Notizen aus dem Bau (Abweichungen, Wünsche, Zweifel, Blockaden)

Hier trägt jede Sitzung ein: gewollte Abweichungen von v1 (mit Grund und Herberts Abnahme),
beim Portieren gefundene v1-Fehler (mit Vektor-ID), Widersprüche zwischen Code und Bauplan
(Aufgabe → `blockiert`), Messwerte aus 4.12, Funktionswünsche für nach dem Umschalten.

Format: `- [Datum] [Aufgabe] Art (Abweichung | v1-Fehler | Widerspruch | Messung | Wunsch): Text. Entscheidung Herbert: …`

- (leer)

Wünsche für nach 2.0 (Sammelliste): lokale Font-Dateien (Sora/IBM Plex) statt System-Stack.

---

## 11. Freigabekriterien (Definition „fertig“)

v2 ist freigegeben, wenn alle Punkte erfüllt sind:
1. Paritäts-Checkliste (Abschnitt 9) vollständig, jede Zeile an v1 und v2 nebeneinander geprüft.
2. Alle `v1`-Vektoren und alle `spec`-Vektoren grün, in TypeScript und Python.
3. E2E grün: Render mit beiden Fixtures, Editor-Klickfolge, Round-Trip v2 → v1, Zonen,
   Zeitleiste, Live-Update bei offenem Editor, `unavailable → available`, drei Breiten ohne
   Overflow.
4. `npm run check` und `npm run lint` ohne Fehler.
5. Abschnitt 10 enthält keine unabgenommene Abweichung und keine offene Blockade.
6. Companion-App hoch/quer und Tablet mit Sidebar von Herbert gesichtet (Aufgabe 6.3).
7. Sieben Tage Alltag mit v2 als Hauptdashboard ohne offenen Befund (Aufgabe 6.4).
8. Version `2.0.0`, `heidi.yaml` zeigt auf v2, v1 als `heidi-panel-v1.js` archiviert,
   HANDOFF/CLAUDE.md beschreiben v2 (Aufgabe 6.5).
