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

> Lies `CLAUDE.md`, `docs/HANDOFF.md` und `docs/dreame_x60/BAUPLAN.md`. Nimm das nächste offene
> **Modul** aus der Baureihenfolge (Abschnitt 1a) und darin die nächste offene Aufgabe aus der
> Statusliste (Abschnitt 1), prüfe ihre Voraussetzungen, lies ihre Karte in Abschnitt 8 und arbeite
> nur diese Aufgabe ab (`tracker start` auf die DX-Aufgabe, code-erstellen nach Code-Profil). Ein Modul
> wird komplett fertig (Abschnitt 11a), bevor das nächste beginnt. Halte dich an die Regeln in
> Abschnitt 2. Wenn Code und Bauplan sich widersprechen: nicht entscheiden, Befund in Abschnitt 10
> eintragen, Aufgabe auf `blockiert`, stoppen. Am Ende Statusliste aktualisieren, committen, pushen
> (doc-pflege Modus 8).

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
| 1.4 | **[PC]** Ressource anlegen, HA-Neustart, „Heidi v2“ sichtbar (seit 15.09. Dashboard „Heidi“) | fertig (15.09. 06:44: Ressource `/local/dreame_x60.js?v=2.0.0-alpha.1`, Dashboard `dreame-x60` in der Liste, Bundle wird ausgeliefert); Sichtprüfung im Browser durch Herbert offen |
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
| 4.1 | `dx-hero` + `dx-auftrag` | fertig (15.09.; hero.js 16 grün inkl. 85 v1-Kopf-Zustände und Render-Ruhe, strip.test.ts grün; Version 2.0.0-alpha.9 eingespielt; Startpunkt-Fall, Knopfbreite, Stationszeile, Lade-Blitz, „Mopp“ und PD-009 am echten Lauf nachgebessert; **Nachtrag PD-015 gebaut 17.09.:** Hinweis-Chip mit Kurz-/Langtext, Tooltip `dx-tip`, ✕ bei Warnung → `button.press` auf `clear_warning`, hero.js 32 grün, Version 2.0.0-alpha.30 eingespielt; **PD-016 17.09.:** Balken der Auftrag-Kachel aus `sensor.<gerät>_cleaning_progress`, hero.js 34 grün, Version 2.0.0-alpha.31 eingespielt); Sichtprüfung durch Herbert offen |
| 4.2 | `dx-dialog` (modal/sheet/confirm) | fertig (15.09.; dialog.js 30 grün: Ereignisse, Escape, Fokus, Tab-Falle, Sheet < 640 px, wide, Shell-Bestätigung; Version 2.0.0-alpha.11 eingespielt); Sichtprüfung durch Herbert offen |
| 4.3 | `dx-map-card` (Seite Reinigen) + `dx-quickstart` | fertig (15.09.; map.js 39 grün: Cache über 20 Ticks, ein Modus je Karte, Umrisse aus der Fixture, Hinfahren, Kartenwahl, Räume/Alles/Szene/Stühle mit Bestätigung, compact, Schnellstart; Version 2.0.0-alpha.14 eingespielt); **Sichtprüfung mit der echten Xiaomi-Karte in HA durch Herbert offen** (Playwright kennt nur den Karten-Stub) |
| 4.3b | **Heidi-Karte** (`dx-heidi-map`: Kartenbild + eigene Raumebene aus der Datenkarte, PD-011, vorgezogen) | fertig (15.09.; map.js Heidi-Karte-Block grün, mapdata.test.ts grün; Kartendarstellung „Heidi-Karte“ als vierte Option; Nachbesserung nach Sichtprüfung Herbert: echte Umrisse, Auswahlreihenfolge mit Nummern-Chips, Räume auch im Raumauftrag; Version 2.0.0-alpha.16 eingespielt); zweite Sichtprüfung Herbert offen |
| 4.3c | **Geräteerkennung** (`ha/device.ts`: Roboter-IDs und Anzeigename aus HA statt festem Namen, PD-012, vorgezogen) | fertig (15.09.; device.test.ts 5 grün, device.js 9 grün, alle übrigen Tests unverändert grün; Version 2.0.0-alpha.17 eingespielt) |
| 4.3d | **Geräteprofil Stufe 2** (`ha/profile.ts`, `domain/rooms.ts`: Räume aus der Karte, Optionen aus den Selects, Fähigkeiten aus dem Vorhandensein; PD-013, vorgezogen) | fertig (15.09.; profile.test.ts 5 grün, profile.js 16 grün; Version 2.0.0-alpha.18 eingespielt) |
| 4.3e | **Einrichtungsprüfung** (Kopfzeile zwischen Titel und Uhr: nur die Symbole mit Befund, rot pulsiert, Klick springt direkt zur Stelle; `dx-setup` als Liste für die Seite Einstellungen 4.11 vorbereitet: Roboter, Paket, Roboter-Entitäten, Datenkarte, Angepasste Reinigung, Raumtypen, Räume ↔ HA-Bereiche, Reparaturen; Sprung zur Stelle; PD-014) | fertig (16.09.; setup.test.ts 7 grün, setup.js 20 grün; Version 2.0.0-alpha.28 eingespielt; Symbole rechtsbündig direkt links neben der Uhr; Bereiche-Symbol springt bis in HAs Zuordnungsansicht) |
| 4.4 | `dx-planer` (Seite Planer) | offen |
| 4.5 | `dx-planer-editor` + `dx-clock-picker` | offen |
| 4.6a | `dx-rooms-dialog` Roboter-Modus (Modul R; aus 4.6 geteilt 16.09.) | offen |
| 4.6b | `dx-rooms-dialog` Plan-Modus im Editor-Kontext (Modul A; aus 4.6 geteilt 16.09.) | offen |
| 4.7 | `dx-history` + `dx-robot-settings` (Seiten Protokoll, Einstellungen) | offen |
| 4.8 | `dx-estimate-dialog` | offen |
| 4.9 | `dx-automatik`, `dx-station`, `dx-consumables` | offen |
| 4.10 | `dx-heute` (Übersicht) + `dx-prognose-view` | offen |
| 4.11 | `dx-settings-panel` (Seite Einstellungen, inkl. Diagnose) | offen |
| 4.12 | `dx-zones-editor` | offen |
| 4.13 | Render-Messung (`perf.js`), Erwartung 0/0/0 bei irrelevanten Ticks | offen |
| 4.14 | Texte zentral: `src/i18n/de.ts` + `t()` (i18n Stufe 1, Modul R; Sprachumschaltung Post-2.0) | fertig (17.09.; i18n.test.ts 4 grün inkl. Scan, alle 91 Unit- und 9 E2E-Tests unverändert grün; 619 Schlüssel; Version 2.0.0-alpha.29 eingespielt); Sichtprüfung Herbert offen (nichts sichtbar geändert) |
| 5.1 | Container Queries, Bottom-Sheet, „mehr anzeigen“, Safe Area | aufgelöst in die Module (16.09.; Regeln in Modul A, Anwendung je Modul, Prüfung in 5.2) |
| 5.2 | E2E Breiten 390/820/1200 + Overflow | offen |
| 6.1 | E2E Round-Trip v2 → v1 und `availability.js` | offen |
| 6.2 | Paritäts-Checkliste (Abschnitt 9) vollständig | offen |
| 6.3 | **[PC]** Geräte-Sichtung (Companion hoch/quer, Tablet mit Sidebar, Kiosk, Desktop) | offen |
| 6.4 | **[PC]** Sieben Tage Parallelbetrieb ohne freigabeblockierenden Befund | entfällt (Herbert, 15.09.: v1 vorzeitig abgeschaltet, kein Parallelbetrieb) |
| 6.5 | **[PC]** Umschalten, v1 archivieren, Doku auf v2 | v1 abgeschaltet und archiviert (15.09., vorgezogen); Rest (Dashboard-Pfad `/heidi/…`, Doku) offen |
| F.1 | **Diagnose-Protokoll** (Modul F, DX-068: HA-Zustände mit Auslöser, Debuglog der Integration, Kartenanzeige) | in Arbeit – **Schicht 1 + 2 fertig und eingespielt 18.09.** (Backend: `diag.py`, zwei Automationen, `logger`, `tools/diag.js`; 11 Tests auf dem Pi grün); offen: Probe mit echtem Start aus App / Dashboard / Planer, danach Schicht 3 (Karte, PD-Eintrag) |

Status-Werte: `offen`, `in Arbeit (Datum)`, `fertig (Commit)`, `blockiert (Abschnitt 10)`.

## 1a. Baureihenfolge nach Modulen (seit 16.09.2026)

Entscheidung Herbert (16.09.2026, Abschnitt 10): **Modul für Modul fertigbauen** statt phasenweise.
Die Phasen 0–3 sind abgeschlossen und bleiben als Historie; die Aufgaben der Phasen 4–6 behalten
ihre Nummern und Karten, werden aber in dieser Reihenfolge gebaut. Ein Modul gilt erst als fertig,
wenn Abschnitt 11a erfüllt ist – dann beginnt das nächste. Modul F läuft parallel (eigener Stack).

| Modul | Aufgaben | Seiten / Bausteine | Stand |
|---|---|---|---|
| **R Roboter-Panel** | 4.1 (Sichtprüfung, Nachbesserungen), 4.14, 4.6a | Übersicht: Roboter-Panel `dx-hero` + `dx-auftrag` – alles, was den Roboter selbst zeigt und bedient; Texte zentral (`src/i18n/de.ts`); Räume-Dialog im Roboter-Modus (`dx-rooms-dialog`, „Räume einstellen“ aus dem Hero) | **nächstes** (Herbert, 16.09.: zuerst das Roboter-Panel; ClickUp DX-064) |
| **A Planer** | 4.4, 4.5, 4.6b, 4.8, 6.1 | Seite Planer, `dx-planer` (+ `compact`), Editor + Uhr, Raum-Dialog im Plan-Modus, Dauer & Akku, Round-Trip-Test | danach |
| **B Karte und Räume** | 4.3 (Sichtprüfung), 4.3b (Sichtprüfung, Zoom/Gesten), 4.12 | Seite Reinigen, Heidi-Karte, Sperrzonen-Editor | 4.3/4.3b gebaut, Sichtprüfung offen |
| **C Übersicht-Kacheln** | 4.9, 4.10 | Automatik, Station, Verschleiß, Heute, Seite Prognose | offen |
| **D Verlauf und Statistik** | 4.7 (Verlauf, Zeitleiste, Lernwerte, Statistik) | Seite Verlauf, `dx-history` (+ `compact`), `dx-stats` | offen |
| **E Einstellungen** | 4.11, Roboter-Einstellungen (aus 4.7), Befundliste `dx-setup`, Themes (Post-2.0, optional) | Seite Einstellungen | offen |
| **F Backend** (parallel) | **F.1 Diagnose-Protokoll (DX-068) – Schicht 1 + 2 eingespielt 18.09., Schicht 3 offen**, Planer nachholen (DX-048), 0.4-Entscheidung (DX-006), 2.7 **[PC]** (DX-019) | Paket, Automationen, Prognose | offen |
| **G Abschluss** | 4.13, 5.2, 6.2, 6.3, 6.5 | Render-Messung, Breiten-E2E aller Seiten, Parität, Geräte-Sichtung, Version 2.0.0 | am Ende |

**5.1 (Container Queries, Bottom-Sheet, Safe Area) ist in die Module aufgelöst:** Modul A legt die
Regeln fest (Container `content`, Grenzen 640 / 1099 px wie in 4.0, Dialog als Sheet < 640 px Viewport,
Safe Area) und jedes Modul wendet sie auf seine Seiten an; 5.2 prüft am Ende alle Seiten zusammen.
In ClickUp gibt es je Modul eine Aufgabe (DX-056 … DX-062, DX-064 für Modul R, Typ Meta) mit den Modul-Schritten als Checkliste; die Phase-Parents bleiben als Historie.

**Modul R zuerst (Herbert, 16.09.2026, Abschnitt 10):** Das Roboter-Panel kommt vor dem Planer. Modul R nutzt die schon in 4.0/4.2 festgelegten Grenzen (Container `content` 640 / 1099 px, Dialog als Sheet < 640 px Viewport, Safe Area) und legt `tests/e2e/widths.js` für die Übersicht an; jedes weitere Modul ergänzt dort seine Seiten. Abgrenzung (Auswahl Herbert): nur das Panel selbst – Station, Verschleiß und Roboter-Einstellungen bleiben in C/D/E, Karte und Räume in B. 4.6 ist dafür in 4.6a (Roboter-Modus, Modul R) und 4.6b (Plan-Modus, Modul A) geteilt.

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
11. **Parallelbetrieb (aufgehoben 15.09.):** v1 ist auf Herberts Wunsch vorzeitig abgeschaltet
    (Dashboard, Ressource, Datei vom Pi entfernt; Referenz `heidi/archiv/`). Bis 4.4/4.5 gibt es keinen
    Planer-Editor in der Oberfläche; Einträge laufen weiter über die Automation. Das Bundle registriert
    nur seinen Elementnamen und trägt sich nur einmal in `window.customCards` ein.
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

`contract.ts` enthält: IDs (`ENTITIES`), Generatoren (`planEntity(n, feld)`,
`roomEntity(id, feld)`), zulässige Optionsstrings (`HA_OPTIONS`: deutsch für Helfer, HA-Werte
für Dreame-Selects), Zuordnungen (`ROOM_VALUE_CODES` = `RV`/`RV_HA`/`RV_ENT` aus v1), Dienste,
Personen. Ein Wert, den Automationen oder HA interpretieren, gehört hierher, nicht in
`config.ts`.

**Gerätename nicht fest verdrahtet (PD-012, 15.09.):** Die Roboter-IDs der Dreame-Integration stehen in
`contract.ts` nur als Domäne + Merkmal (`ROBOT_FEATURES`, z. B. `map: ['camera', 'map']`); den Gerätenamen
liefert `src/ha/device.ts` zur Laufzeit (`discoverDevice`: Kartenkonfiguration `robot:` → Entitäts-Register
`hass.entities` mit Plattform `dreame_vacuum` → erste `vacuum.*` mit Dreame-Attributen in den Zuständen).
`ENTITIES.vac` usw. sind Getter und bilden `<domäne>.<gerät>_<merkmal>` bzw. `vacuum.<gerät>`; die
Selektoren nennen ihre ID-Listen als Funktionen (`memoizeSelector(() => [...])`) und rechnen bei Gerätewechsel
neu. Anzeigename (`deviceName()`: Geräte-Register, sonst `friendly_name` ohne die Verdopplung „Heidi  Heidi“)
statt „Heidi“ in Kopf, Seitenleiste, Karte, Schnellstart. **Räume nicht fest verdrahtet (PD-013, 15.09.):** die
Raumliste kommt aus `camera.<gerät>_map.rooms` (`domain/rooms.ts`, `ha/profile.ts`: sichtbare Räume in App-Reihenfolge
`order`; Standardtypen der App `type` 1..15 → Name und Symbol aus dem Wörterbuch `ROOM_TYPES` (Wohnzimmer, Schlafzimmer,
Nebenzimmer, Arbeitszimmer, Küche, Esszimmer, Bad, Balkon, Flur, Allzweckraum, Garderobe, Salon, Büro, Fitnessbereich,
Freizeitbereich; auch für die Sprachsteuerung), benutzerdefinierte Räume `type` 0 → custom_name, Symbol nach Stichwort;
Kurzname nach Standardregel), ohne Karte aus den Raum-Selects; Optionen aus den
`options` der Selects (`select.<gerät>_cleaning_mode|suction_level|mop_pad_humidity|cleaning_route`, neu im Vertrag),
Fähigkeiten = Entität vorhanden (`profile.has('selfClean')`). Raum-IDs sind beliebige positive Zahlen (2 … 20 Räume).
**Paket-Helfer** (heidi.yaml: `sensor.heidi_phase`,
`input_*.heidi_*`, Skripte) behalten das feste Präfix `PACKAGE_PREFIX` – sie gehören uns, nicht der
Integration. Die Liste unten ist für das Gerät „heidi“ geschrieben; `contract.test.ts` setzt dieses Gerät.

Vollständige Liste: `heidi/CLAUDE.md`, `ha/packages/heidi.yaml`. Gruppen (L = lesen, S = schreiben):

**Roboter (Dreame-Integration)**
- L `vacuum.heidi` (state; `has_error`, `current_segment`, `active_segments`, `cleaning_sequence`,
  `cleaned_area`, `charging`, `mop_pad`, `paused`, `washing`, `drying`, `returning_to_wash`,
  `mapping`, `cruising`)
- L `camera.heidi_map` (`rooms`, `no_go_areas`, `no_mopping_areas`, `calibration_points`,
  `entity_picture`)
- L/S `select.heidi_selected_map` (Kartenwahl auf der Seite Reinigen; nur wenn verfügbar – ab 4.3, 15.09.)
- L `camera.heidi_map_data` (Datenkarte: Valetudo-Kartenpaket im PNG-Chunk „ValetudoMap“ – Heidi-Karte, 4.3b, 15.09.; Abruf über `entity_picture`)
- L `sensor.heidi_status|error|task_status|battery_level|current_room|cleaned_area|cleaning_time|cleaning_history|cleaning_count|total_cleaned_area|total_cleaning_time|first_cleaning_date`; L `sensor.heidi_cleaning_progress` (Fortschritt in % vom Roboter, nur im Lauf – Balken der Auftrag-Kachel, PD-016, 17.09.)
- L `sensor.heidi_main_brush_left|side_brush_left|filter_left|sensor_dirty_left|wheel_dirty_left`;
  S `button.heidi_reset_main_brush|reset_side_brush|reset_filter|reset_sensor|reset_wheel`
- L `sensor.heidi_dust_bag_status|clean_water_tank_status|dirty_water_tank_status|detergent_status|low_water_warning|auto_empty_status|self_wash_base_status`;
  S `button.heidi_start_auto_empty|self_clean|manual_drying|base_station_cleaning`
- L/S `button.heidi_clear_warning` (Warnung quittieren – nur verfügbar, solange eine Warnung ansteht; ✕ am gelben Hinweis-Chip, PD-015, 17.09.)
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
| `start` | **Bento-Raster (12 Spalten) nach `bento.html`, Stand 15.09.:** Reihe 1: Roboter-Panel `span3` (`dx-hero`: Name, Status, Station, Roboter-Bild, Akku, Chips, Modus/Saug/Wasser, Knöpfe, Streifen im Lauf) · Live-Karte `span6` (`dx-map-card compact`: Reiter Live-Karte / Räume → `reinigen` / Sperrzonen → Overlay / Reinigungsverlauf → `protokoll`, Karte, Bildunterschrift; keine Werkzeuge) · rechte Spalte `span3` (`stack`): im Lauf `dx-auftrag` (Aktueller Auftrag), sonst `dx-automatik` (Schalter, Status, „Regeln & Planer“), darunter `dx-heute` (heutiger Eintrag, Prognose-Zeilen nur bei aktiv, Homeoffice). Reihe 2 je `span3`: `dx-planer compact` (drei Einträge, „Alle 4“), `dx-consumables`, `dx-station`, `dx-stats` (PD-006). Reihe 3: `dx-quickstart` `span7` (Raumkacheln + „Alles“, Leiste „N Räume reinigen“) · `dx-history compact` `span5` (drei letzte Läufe, „Alle anzeigen“). ≤ 1099 px Container: 6 Spalten, Roboter-Panel und rechte Spalte nebeneinander, Karte darunter in voller Breite; ≤ 640 px: eine Spalte. Navigation außerhalb des Rasters: `dx-nav` (Seitenleiste > 1180 px, Symbolleiste 761–1180 px, Tab-Leiste ≤ 760 px). Abweichungen zu v1 in PD-005/PD-006/PD-007. Abgenommen von Herbert am 15.09. (Mockup `dreame_x60/mockups/bento.html`); Hinweis-Chip mit Quittieren im Roboter-Panel abgenommen von Herbert am 17.09.2026 (Mockup `dreame_x60/mockups/warnung.html`, PD-015); die ältere Zweispalten-Fassung (`seiten.html`, 14.09.) ist damit abgelöst |
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
| `dx-hero` | robotView, api | `dx-open-overlay {rooms}` | Kopf-Tabelle aus 0.1; Streifen-Fälle; Hinweis-Chip Warnung/Fehler mit ✕ und Tooltip (PD-015, Mockup `warnung.html` abgenommen 17.09.) |
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
- Akzeptanz: „Heidi v2“ (seit 15.09. „Heidi“) in der Sidebar zeigt die Shell; Unteransichten per URL erreichbar, Zurück-Pfeil führt zu `start`; v1 unverändert.
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
- Ziel: Roboter-Panel nach Mockup: Name, Status-Punkt, Zeile Station, Roboter-Bild, Akku (Zahl + Balken, Blitz beim Laden), Chips (Raum, Hinweis/Fehler; Personen und DND seit PD-009 nicht mehr hier), drei Werte Modus/Saugleistung/Wasser (öffnen `rooms`), Knöpfe, Streifen im Lauf; Texte aus `status.ts`. Dazu `dx-auftrag` für die rechte Spalte im Lauf (PD-007): Route aus der Raumreihenfolge mit aktuellem Raum hervorgehoben, Minuten · Fläche · seit, „Räume x / 7“ mit Balken, nächster Raum mit Modus-Tag; alles aus `readRobot`. **Nachtrag 17.09. (PD-015, Mockup `dreame_x60/mockups/warnung.html` abgenommen):** Hinweis-Chip mit Kurztext (höchstens zwei Wörter) und Langtext beim Verweilen (eigener Tooltip-Baustein, Regel 12; am Handy more-info); gelb = Warnung (22 Codes, `has_error` false) mit ✕ → `DxApi.pressButton` auf `button.<gerät>_clear_warning` (Dienst `button.press`; Merkmal `clearWarning` in `ROBOT_FEATURES` + Abschnitt 4 im selben Commit), ✕ nur, wenn der Knopf verfügbar ist; rot = Fehler ohne ✕. Kurz- und Langtexte aus `src/i18n/de.ts` (4.14), daher Umsetzung nach 4.14.
- Nicht ändern: `status.ts`, `contract.ts`.
- Akzeptanz: Kopf-Tabelle aus 0.1 grün gegen v2; Streifen-Fälle mit `states-cleaning.json`; Knöpfe → `vacuum.*`-Calls; bei 20 irrelevanten Ticks 0 Renderaufrufe (Zähler im Harness); `dx-auftrag` fehlt im Leerlauf. Nachtrag PD-015: Warnung → ✕ sichtbar, Klick → genau ein `button.press`; Fehler → kein ✕; Knopf `unavailable` → kein ✕; Kurztext im Chip, Langtext im Tooltip.
- Tests: `npm test`
- Dateien: `src/components/dx-hero.ts`, `src/components/dx-auftrag.ts`, `tests/e2e/hero.js`; Nachtrag PD-015: `src/shared/dx-tip.ts` (neu), `src/ha/api.ts` (`pressButton`), `src/ha/contract.ts` (`clearWarning`)

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

**4.3b Heidi-Karte `dx-heidi-map` (vorgezogen, PD-011)**
- Voraussetzung: 4.3; Datenkarte `camera.heidi_map_data` in der Dreame-Integration aktiviert (Herbert, 15.09.).
- Ziel: Vierte Kartendarstellung „Heidi-Karte“ (`input_select.heidi_kartendarstellung`, Option im Paket und in `HA_OPTIONS`): Kartenbild der Integration (`camera.heidi_map`, `entity_picture`) plus eigene SVG-Ebene mit den Raumflächen aus dem Kartenpaket der Datenkarte (PNG-Chunk „ValetudoMap“, Lauflängen in 5-cm-Rastern → Roboter-mm → Bildpixel über `calibration_points`). Tipp auf eine Fläche wählt den Raum (Ereignis `dx-room-tap`), Auswahl und Raumkacheln der Seite Reinigen sind dieselbe Menge. Raumflächen als **echte Umrisse** (Randkanten der Pixelmaske zu geschlossenen Schleifen, Löcher mit `evenodd`; `segmentOutline`), gewählte Räume aufgehellt mit durchgehendem Akzentrand, aktueller Raum grüner Rand; **keine eigenen Namensbeschriftungen** (stehen im Kartenbild). Die **Reihenfolge des Antippens** wird gemerkt (Set-Einfügereihenfolge, `shared/rooms.ts`), als **Nummern-Chip** über dem Raum gezeigt (HTML-Chip in fester Bildschirmgröße am Ankerpunkt `centroid`, rechts oben versetzt) und so gereinigt: `DxApi.startRooms` schreibt `input_text.heidi_lauf_reihenfolge` und ruft dann `vacuum_clean_segment` in dieser Reihenfolge (Karte und Schnellstart). Kein eingebettetes Karten-Element, kein Zoom (später). Hinweise, wenn Datenkarte oder Kalibrierung fehlen. Während/nach einem Raumauftrag liefert die Integration nur die aktiven Räume (`MapData.partial`) – der Lader ergänzt die übrigen aus dem letzten vollständigen Paket derselben Karte (Modul + localStorage `dreame_x60.mapdata.<saved_map_id>`, `mergeSegments`).
- Nicht ändern: Dreame-App-/Xiaomi-/Nur-Bild-Konfigurationen; `calibration.ts`.
- Akzeptanz: `mapdata.test.ts` (PNG-Chunk, 7 Segmente, Lauflängen = pixelCount, Raster ↔ mm, Treffer, SVG-Pfad, Umriss: jede Ecke am Rand der Maske und kürzer als die Vierecke, Ankerpunkt im Raum, Teilpaket + Ergänzung); `map.js`: sieben Flächen als Schleifen, viewBox = Bildgröße, keine Namens-Chips, Tipp → Auswahl in Fläche und Kachel, zweiter Tipp → Nummern-Chips 1/2 in Tipp-Reihenfolge, OK → `input_text.set_value` + `vacuum_clean_segment` in Tipp-Reihenfolge, kein `createCardElement`, Hinweis ohne Datenkarte.
- Tests: `npm test`
- Dateien: `src/domain/png-text.ts`, `src/domain/mapdata.ts`, `src/ha/mapdata-loader.ts`, `src/components/dx-heidi-map.ts`, `src/components/dx-map-card.ts`, `src/ha/selectors.ts` (`readMap.mapData`), `src/shared/rooms.ts`, `src/ha/api.ts` (`startRooms`), `ha/packages/heidi.yaml`, `tests/fixtures/map-data.png|map.png|map-data.valetudo.json`

**4.4 `dx-planer` (Seite Planer)**
- Voraussetzung: 4.0, 2.2
- Ziel: Vier Zeilen, Dauer-Kurzzeile (nur mit Lernwerten), ▶ mit Bestätigung, ✎ öffnet Editor; Automatik-Regeln-Details auf derselben Seite. Variante `compact` für die Übersicht: die ersten drei Einträge (Tage + Zeit, Name, aktiv/inaktiv nur als Anzeige – kein Schalter, Umschalten wie in v1 im Editor), Link „Alle 4“ → Seite Planer, Knopf „Eintrag bearbeiten“ (heutiger Eintrag, sonst 1).
- Nicht ändern: `estimate.ts`.
- Akzeptanz: vier Zeilen, heutiger markiert, Manuell-Tag; ▶ bei inaktiv nur Toast; `compact` ohne Schalter und ohne Service-Call.
- Responsive (Modul A legt die Regeln für alle Module fest, ersetzt 5.1): Seite Planer und `compact` bei 390 / 820 / 1200 px ohne Overflow; `@container`-Regeln am Container `content` mit den Grenzen 640 / 1099 px aus 4.0; keine festen Smartphone-Modi; Safe Area unten (Tab-Leiste). Die gewählten Regeln in Abschnitt 10 festhalten, damit B–E sie übernehmen.
- Tests: `npm test` (inkl. `widths`-Prüfung der Seite Planer bei 390/820/1200)
- Dateien: `src/components/dx-planer.ts`, `tests/e2e/planer.js`

**4.5 `dx-planer-editor`, `dx-clock-picker`**
- Voraussetzung: 4.2, 4.4, 3.2
- Ziel: Editor mit `PlanDraft` (Snapshot beim Öffnen), Uhr, Speichern über `savePlan`, Teilfehler-Meldung „Speichern unvollständig: <Felder>“ und Editor bleibt offen, Hinweis „Eintrag wurde außerhalb geändert“ (Vergleich `last_updated` der Plan-Helfer beim Öffnen vs. jetzt).
- Nicht ändern: die 18 Calls.
- Akzeptanz: `editor.js` (Klickfolge aus 0.1) → dieselben 18 Calls; `live-update.js`: bei offenem Editor neuen Akkuwert setzen → Kopf aktualisiert, Draft unverändert, Fokus bleibt; Fehlerinjektion Call 5 → Meldung sichtbar, Dialog offen; Änderung eines Plan-Helfers → Hinweis sichtbar.
- Tests: `npm test`
- Dateien: `src/components/dx-planer-editor.ts`, `src/components/dx-clock-picker.ts`, `tests/e2e/{editor,live-update}.js`

**4.6a `dx-rooms-dialog` – Roboter-Modus** (aus 4.6 geteilt, 16.09.; Modul R, ClickUp DX-033)
- Voraussetzung: 4.2, 3.2, 4.3d
- Ziel: Dialog „Räume einstellen“ (Overlay `rooms`, `mode: robot`; geöffnet aus dem Hero über die drei Werte und den Streifen, aus der Seite Reinigen und aus `dx-nav` „Räume“). Je Raum aus dem Profil (App-Reihenfolge, Kurzname + Symbol) die Roboter-Werte wie in v1 (Modus, Saugstufe, Wasser nur bei Modus ≠ Saugen, Route nur bei „Nur Wischen“, Wiederholungen; Optionen aus dem Profil, Abschnitt 6 Zeilen `_rvClick`/`_roomsHtml`); jede Änderung schreibt sofort über `DxApi.setRoomValue` (`select_option`). Zeile „Alle Räume“ mit den gemeinsamen Werten („–“ bei Abweichung), schreibt alle Räume parallel (`all`). Hinweis, wenn Raum-Werte `unavailable` sind (angepasste Reinigung aus, Abschnitt 10). `dx-dialog` als Rahmen (Sheet < 640 px Viewport). Kein Plan-Modus, kein Umschalter (4.6b).
- Nicht ändern: `setRoomValue`, `raumwerte.ts`, `profile.ts`, `status.ts`.
- Akzeptanz: `rooms.js`: Klick auf einen Wert → genau ein `select_option` mit richtiger Entität und Option (Tabelle je Schlüssel); „Alle Räume“ → ein Call je Raum des Profils; Wasser/Route nur bei passendem Modus sichtbar; Hinweis bei `unavailable` (Fixture „angedockt“); Räume in Profil-Reihenfolge; Escape schließt; 0 Renderaufrufe bei 20 irrelevanten Ticks. `widths.js`: Übersicht und offener Räume-Dialog bei 390 / 820 / 1200 px ohne horizontalen Überlauf.
- Tests: `npm test`
- Dateien: `src/components/dx-rooms-dialog.ts`, `src/dreame-x60-panel.ts` (Overlay `rooms` statt Platzhalter), `tests/e2e/rooms.js`, `tests/e2e/widths.js` (neu)

**4.6b `dx-rooms-dialog` – Plan-Modus** (aus 4.6 geteilt, 16.09.; Modul A, ClickUp DX-065)
- Voraussetzung: 4.6a, 4.5
- Ziel: Eintrag-Modus (`mode: plan`, `n`, Draft): nur die gewählten Räume des Eintrags, „eigene Werte“ je Raum, sonst Standard des Eintrags, „Alle auf Standard“; Umschalter Roboter ↔ Eintrag im Editor-Kontext; Zurück zum Eintrag (`dx-back`, Overlay `back`). Schreibt nur in den Draft, nie nach HA.
- Nicht ändern: `setRoomValue`, `savePlan`, `raumwerte.ts`.
- Akzeptanz: Plan-Modus ohne Service-Call, Draft trägt die Werte; Umschalter wechselt die Ansicht; „Alle auf Standard“ leert die eigenen Werte; Zurück führt zum Editor mit unverändertem Draft.
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

**4.14 Texte zentral – `src/i18n/de.ts` + `t()`** (i18n Stufe 1; Modul R, ClickUp DX-066; Entscheidung Herbert 17.09., Abschnitt 10)
- Voraussetzung: 4.1
- Ziel: Alle festen Texte der Karte an einem Ort: `src/i18n/de.ts` (Schlüssel → deutscher Text, gruppiert nach Baustein: `hero.*`, `nav.*`, `map.*`, `dialog.*`, `setup.*`, `status.*`, `error.*`, `option.*`, `estimate.*`, `label.*`) und `src/i18n/t.ts` (`t(key, params?)`, Rückfall = Schlüssel). Bausteine, Shell, `config.ts` (STATUS_DE, ERR_DE, ROOMS_DE), `profile.ts` (OPTION_DE) und die Domäne lesen nur noch über `t()`. `error.*` deckt alle 142 Codes aus `docs/dreame_x60/ENTITAETEN.md` (Abschnitt „Warnungen und Fehler“) mit dem dortigen Wortlaut ab. Keine Sprachumschaltung, keine zweite Sprache (Post-2.0, DX-067). Wortlaut aller bestehenden Texte bleibt gleich (v1-Parität, Vektoren unverändert). Texte werden ins Bundle gepackt (Regel 14), keine neue Abhängigkeit.
- Nicht ändern: Wortlaut der v1-Vektoren; `contract.ts`; Verhalten und Aussehen der Bausteine.
- Akzeptanz: `i18n.test.ts`: jeder Schlüssel in `de.ts` eindeutig, kein leerer Text; Scan über `src/components/*.ts`, `src/dreame-x60-panel.ts`, `src/domain/*.ts` findet keine festen deutschen Wörter (Umlaute/ß oder Wortliste) außerhalb von `src/i18n/`; `t('error.dust_bag_full')` = „Staubbeutel voll“, unbekannter Schlüssel → Schlüssel; alle bisherigen Unit- und E2E-Tests unverändert grün.
- Tests: `npm test`, `npm run lint`
- Dateien: `src/i18n/de.ts`, `src/i18n/t.ts`, `src/components/*.ts`, `src/dreame-x60-panel.ts`, `src/config.ts`, `src/ha/profile.ts`, `src/domain/{status,labels,estimate,strip,setup}.ts`, `tests/unit/i18n.test.ts`

### Phase 5 – Responsive

**5.1 Layout** – seit 16.09.2026 in die Module aufgelöst (Abschnitt 1a): Regeln in Modul A (4.4/4.5) festlegen, je Modul anwenden; 5.2 prüft am Ende alle Seiten.
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
- Tests: Sichtprüfung je Gerät (Companion hoch/quer, Tablet mit Sidebar, Kiosk, Desktop); Screenshots nach `tests/e2e/out/`.
- Dateien: `docs/dreame_x60/BAUPLAN.md` (Abschnitt 10: Befunde), `docs/HANDOFF.md`

**6.4 [PC] Sieben Tage Parallelbetrieb** – entfällt (v1 am 15.09. abgeschaltet, Herberts Entscheidung; die Abnahme 6.2/6.3 läuft direkt auf v2).

**6.5 [PC] Umschalten** – Teil „v1 archivieren“ am 15.09. erledigt (`heidi/archiv/`, Pi bereinigt, `deploy.ps1` nur v2, Dashboard „Heidi“ = v2).
- Voraussetzung: 6.3, Abschnitt 11 erfüllt
- Ziel: `ha/dashboards/heidi.yaml` bekommt die sechs Views von `dreame_x60.yaml` (Pfad `/heidi/...`, `back_path` anpassen); `dreame_x60.yaml` und Dashboard-Eintrag entfernen; `ha/www/heidi-panel.js` → `heidi-panel-v1.js` (Ressource entfernen); Build-Ziel wird `ha/www/heidi-panel.js`; `heidi/tests` → `heidi/tests-v1`; `HANDOFF.md`, `heidi/CLAUDE.md`, `CLAUDE.md` auf v2; Version `2.0.0`.
- Akzeptanz: Abschnitt 11 vollständig.
- Tests: `npm test` grün auf Version 2.0.0; Freigabekriterien Abschnitt 11 durchgehen.
- Dateien: `dreame_x60/card/package.json` (+ Lock), `ha/dashboards/dreame_x60.yaml`, `docs/HANDOFF.md`, `CLAUDE.md`, `heidi/CLAUDE.md`

---

### Modul F – Backend (ohne Phase)

**F.1 Diagnose-Protokoll** (ClickUp DX-068, von Herbert am 18.09.2026 angelegt; Herbert: „zuerst damit starten“)
- Voraussetzung: keine (läuft neben den Karten-Modulen); Schicht 3 braucht 4.1
- Ziel: Alles, was den Roboter betrifft, lückenlos mitprotokollieren – egal ob über Home Assistant, Dreame-App, Knopf am Roboter oder App-Zeitplan gesteuert. Zweck: Fehleranalyse und Vergleich „was zeigte das Dashboard wann“ gegen „was war der tatsächliche Stand“. Drei Schichten: (1) **HA-Zustände mit Auslöser** – Automation auf Zustands- und Attributänderungen der Roboter-Entitäten (vacuum, Phase, Status, Fehler, Akku, Fortschritt, Selects), je Änderung eine JSON-Zeile in `heidi_diag.jsonl`: Zeitstempel, Entität, alt → neu, geänderte Attribute, Kontext (`user_id` = Bedienung in HA, `parent_id` = Automation/Skript, beides leer = extern: App, Roboter, App-Zeitplan). (2) **Rohmeldungen der Integration** – Debug-Logging für `custom_components.dreame_vacuum`, ein Skript filtert die relevanten Zeilen mit Zeitstempel in eine eigene Datei (HA-Log bleibt klein). (3) **Kartenanzeige** – die v2-Karte feuert bei Änderung der sichtbaren Kernwerte (Kopftext, Phase, Fortschritt, Akku) das Ereignis `dreame_x60_anzeige`, dieselbe Automation protokolliert es (Ereignisse aus dem Frontend brauchen einen Admin-Benutzer). Optional: Sensor „Letzte Benachrichtigung“ der Companion-App für Push-Meldungen der Dreame-App. Auswertung: Skript in `tools/`, das die JSONL-Datei liest und eine Zeitleiste mit Abweichungen baut. Reihenfolge: Schicht 1 + 2 zuerst (ohne Kartenänderung), Schicht 3 danach.
- Nicht ändern: `prognose/runlog.py` / `runlog.csv` (Laufprotokoll für Lernwerte bleibt getrennt); bestehende Automationen und der Entitäts-Vertrag. Regel 1 beachten: neue Helfer oder Ereignisse zuerst in Abschnitt 4; Schicht 3 ist eine neue Kartenfunktion → PD-Eintrag (10a) vor dem Bau. Nie ins Repo: die Protokolldateien selbst (wie `prognose/*.csv`).
- Akzeptanz: Start per Dreame-App erscheint als „extern“, Start per Dashboard mit Benutzer, Planerstart mit Automation; jede Zeile hat Zeitstempel, Entität, Wertwechsel, Kontext; Debuglog-Auszug und Zustandsprotokoll lassen sich per Zeitstempel zusammenführen; die Protokolldatei wächst begrenzt (Rotation oder Aufbewahrungsdauer festgelegt).
- Tests: `.\tools\ha.ps1 post config/core/check_config`, danach `automation/reload` bzw. `shell_command/reload`; Probe mit je einem Start aus App, Dashboard und Planer; für Schicht 3 `npm test` in `dreame_x60/card`
- Dateien: `ha/automations.yaml`, `ha/packages/heidi.yaml` (shell_command/Logger), `ha/configuration.yaml` (logger, falls nötig → Neustart), Skript unter `ha/prognose/` oder `tools/`, später `dreame_x60/card/src/dreame-x60-panel.ts`
- Umsetzung Schicht 1 + 2 (18.09., Einzelheiten Abschnitt 10): Automation `heidi_diagnose_protokoll` (Ereignisse `state_changed`, `call_service`, `automation_triggered`, `script_started`; alle Entitäten mit „heidi“ im Namen ohne Kameras – keine feste Liste) → `shell_command.heidi_diag` → `ha/prognose/diag.py log` → `/config/prognose/diag/heidi_diag-<Tag>.jsonl` (30 Tage); Automation `heidi_diagnose_debuglog` (jede Minute) → `diag.py debuglog` → `dreame_debug-<Tag>.log` (14 Tage); `logger:` in `configuration.yaml`; Tests `ha/prognose/tests/test_diag.py` (auf dem Pi: Dienst `shell_command.heidi_diag_test`); Auswertung `node tools\diag.js`. Abschalten: Automation „Heidi: Diagnose-Protokoll“ deaktivieren.

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

- [2026-09-18] [F.1] Befund · Info (**Schicht 1 + 2 gebaut und eingespielt**, HA-Neustart 20:27, Backend ohne Kartenänderung, Version bleibt 2.0.0-alpha.31): (1) **Zustände mit Auslöser:** Automation `heidi_diagnose_protokoll` hört auf die Ereignisse `state_changed`, `call_service`, `automation_triggered`, `script_started` und nimmt per Muster alles mit „heidi“ im Namen (Roboter + Paket, rund 350 Entitäten, neue kommen von selbst dazu; ohne `camera.*`, weil deren Zugriffsschlüssel alle paar Minuten wechselt) plus `input_boolean.stuehle_am_boden`. Eine feste Entitätsliste wäre bei 237 Roboter-Entitäten nicht pflegbar gewesen (Leitlinie „so wenig wie möglich fest verdrahtet“). Je Ereignis eine JSON-Zeile (ts mit Millisekunden in Ortszeit, art, ent, alt → neu, nur die geänderten Attribute als `{name: [alt, neu]}`, ctx, user_id, parent_id, wer = Personenname zur user_id, quelle, durch). Werte, die JSON nicht kennt (Datum, Listen), werden Text, lange Texte auf 300 Zeichen gekürzt; Übergabe an `diag.py` als base64 (Hochkommas in Texten zerlegen den Aufruf sonst). Nicht protokolliert: die Diagnose-Automationen selbst (sonst Endlosschleife – Schutz über Namensmuster `heidi_diag` **und** `this.entity_id`), reine Zähleränderungen der Automationen (stehen schon in der Zeile `automation`), das minütliche Herunterzählen von `rest_min`. (2) **Befund zur Quelle:** Die Annahme der Karte „`parent_id` = Automation/Skript“ stimmt nur für zustandsgesteuerte Automationen – zeitgesteuerte (Planer!) haben keinen Eltern-Kontext. `diag.py` merkt sich deshalb die Kontext-ID jedes protokollierten Automations-/Skriptlaufs (`ctx_cache.json`, 300 Läufe) und setzt `quelle` = benutzer | automation (mit `durch` = Name) | system (Zeit, HA-Start) | extern. Zweiter Befund: HA hängt den Kontext eines Dienstaufrufs nur etwa 5 s an die Zielentität; meldet der Roboter „cleaning“ später, sieht die Zustandszeile wie „extern“ aus. Darum werden die Dienstaufrufe selbst protokolliert, und `tools/diag.js` ordnet einem Start den letzten `vacuum.*`/`dreame_vacuum.*`-Aufruf der 90 s davor zu; nur ohne solchen Aufruf gilt der Start als extern (Dreame-App, Knopf, App-Zeitplan). (3) **Rohmeldungen:** `logger: default warning, custom_components.dreame_vacuum: debug` (Neustart). **Befund:** Unter HA OS 2026.7 gibt es keine Datei `home-assistant.log` mehr; das Log kommt aus der Supervisor-Schnittstelle (`http://supervisor/core/logs?lines=N`, `SUPERVISOR_TOKEN` ist im shell_command vorhanden; vom PC aus `ha.ps1 get hassio/core/logs`). `diag.py debuglog` holt jede Minute die letzten 3000 Zeilen, übernimmt nur neue Zeilen der Integration samt Folgezeilen (Traceback), erkennt Dubletten bei gleichem Zeitstempel, schreibt eine Lücken-Marke, wenn das Fenster nicht reicht, und kürzt signierte Cloud-Adressen (`?Expires=…&Signature=…`). Zugangsdaten stehen nicht im Debuglog (geprüft: kein token/password/secret). Menge: im Leerlauf alle 5 s „Device update“ ≈ 2 MB je Tag → Debuglog 14 Tage, Zustände 30 Tage (Tagesdateien unter `/config/prognose/diag/`, beim ersten Schreiben eines Tages wird aufgeräumt; die Dateien sind Teil der HA-Sicherung). (4) **Tests:** `ha/prognose/tests/test_diag.py` (unittest, 11 Fälle: Pflichtfelder, Hochkomma, Quelle App/Dashboard/Planer, Kontext-Speicher begrenzt, Log zerlegen, Dubletten, Lücke, Aufbewahrung, signierte Adressen) läuft **auf dem Pi** über `shell_command.heidi_diag_test` (auf dem PC gibt es kein Python) – grün; `check_config` valid; Probe: Dienstaufruf über die API erscheint als „Benutzer Herbert Schrotter“. (5) **Nebenbefund Integration:** Im HA-Log steht bei jedem Kartenaufbau `Map render Failed … AttributeError: 'Segment' object has no attribute 'area'` (dreame_vacuum 2.0.0b25, `dreame/map.py`) – möglicher Zusammenhang mit dem fehlenden Reinigungspfad im Kartenbild (Notiz 15.09.), nicht untersucht. **Offen:** Akzeptanz-Probe mit je einem echten Start aus Dreame-App, Dashboard und Planer (Herbert startet, Auswertung `node tools\diag.js`); Schicht 3 (Karte feuert `dreame_x60_anzeige`) mit PD-Eintrag und Abschnitt 4. Entscheidung Herbert: –
- [2026-09-18] [Plan] Entscheidung Herbert · Info (Sitzungsabschluss Teil 5): **DX-068 Diagnose-Protokoll zuerst.** Herbert hat die Aufgabe am 18.09. selbst in ClickUp angelegt (außerhalb dieser Sitzung; Nummer war im Tracker-Profil noch als „nächste freie“ geführt → jetzt DX-069) und will im nächsten Chat damit starten. Bauplan-Nummer **F.1** in Modul F vergeben, Karte in Abschnitt 8 aus der ClickUp-Beschreibung übernommen. Hinweise für den Bau: Schicht 1 + 2 sind reines Backend (kein Eingriff in die Karte); Schicht 3 (Karte feuert `dreame_x60_anzeige`) ist eine neue Kartenfunktion → PD-Eintrag vor dem Bau, und Ereignisse aus dem Frontend brauchen einen Admin-Benutzer; neue Helfer/Ereignisse zuerst in Abschnitt 4 (Regel 1); Protokolldateien nie ins Repo. In ClickUp fehlen bei DX-068 noch Bauplan-Nummer im Titel, Description-Template und Custom Fields (Typ, Aufwand, Zielversion, Komponente, Docs, Chat-Anker) – beim `tracker start` nachziehen (Skill-Schema gilt vollständig).
- [2026-09-18] [4.1] Stand · Info (**Entitäten-Durchgang Herbert**, ENTITAETEN.md der Reihe nach, nach jeder Entität fragt Claude „weitermachen?“): besprochen und gebaut 1. `button.heidi_clear_warning` (PD-015, alpha.30), 2. `sensor.heidi_cleaning_progress` (PD-016, alpha.31). **Stehen geblieben bei 3. `sensor.heidi_mapping_time`** – Bewertung liegt vor (nur während einer Kartierung verfügbar, seltener Sonderfall; Empfehlung: nicht integrieren), Herberts Entscheidung steht aus. Danach der Reihe nach die übrigen „–“ der Gruppe „Roboter: Zustand und Lauf“: `sensor.heidi_relocation_status` (aktuell `located`), `sensor.heidi_state`, `sensor.heidi_stream_status`, `sensor.heidi_task_type`, `switch.heidi_resume_cleaning`; dann „Akku und Laden“. Ablauf je Entität: Zustand in HA abfragen, Integration nachlesen, Bewertung (was, Stand, brauchen wir sie, wie integrieren), Auswahlfrage; bei „ja“ Notiz + PD-Eintrag + ENTITAETEN-Zeile, Bau auf Wunsch sofort.
- [2026-09-17] [4.1] Entscheidung Herbert · Info (Entität 2 von Herberts Durchgang: `sensor.heidi_cleaning_progress`): Fortschritt des laufenden Auftrags in Prozent, vom Roboter gerechnet, nur während eines Laufs verfügbar (Integration: `started` und nicht `cruising`/`fast_mapping`; Reset auf 0 bei jedem Start), sonst `unavailable`. v1 und v2 nutzen ihn nicht; der Balken der Auftrag-Kachel kommt aus der Raumzählung (springt nur je Raum). **Entscheidung: ja, in Modul R** – Balken in `dx-auftrag` = Roboter-Prozent, wenn verfügbar, sonst Raumzählung wie bisher; Zeile „Räume x / n“ bleibt; Merkmal `cleaningProgress` in `ROBOT_FEATURES` + Abschnitt 4, Feld in `RobotView`, E2E-Fall in hero.js; PD-016. **Umgesetzt 17.09. (Version 2.0.0-alpha.31):** `RobotView.progress` (null außerhalb eines Laufs, sonst 0–100), Balken in `dx-auftrag` mit `data-src="robot|rooms"`, hero.js: 37 % → Balken 37, Sensor `unavailable` → Raumzählung 1 / 3 = 33. Offen: wie der Roboter bei Raumaufträgen rechnet – am nächsten echten Lauf prüfen.
- [2026-09-17] [4.1] Befund · Info (Nachtrag PD-015 gebaut): Hinweis-Chip im Roboter-Panel jetzt als `<span role="button">` in einem `dx-tip` (`src/shared/dx-tip.ts`, eigener Tooltip-Baustein: zeigt `text` beim Verweilen mit der Maus oder bei Fokus unter dem Inhalt; Regel 12, kein HA-Baustein). Kurztext aus `error.*`, Langtext aus `errorLong.*` (`HeroModel.errorLong`, leer bei unbekanntem Code); Antippen des Chips → more-info von `sensor.<gerät>_error` wie bisher (auch am Handy). ✕ nur bei Warnung (`has_error` false) **und** verfügbarem Knopf: `RobotView.warning = { clearable, id }`, Merkmal `clearWarning` in `ROBOT_FEATURES` + Abschnitt 4; Klick → `DxApi.press(id)` = `button.press`, Ereignis stoppt am ✕ (kein more-info). **Befund:** HA-Knöpfe haben als Zustand den Zeitpunkt des letzten Drucks oder `unknown` (nie gedrückt) – `unknown` heißt hier also verfügbar, nur `unavailable` sperrt; die erste Fassung hatte `unknown` als „nicht verfügbar“ gewertet (E2E fand es). hero.js: Warnung → gelber Chip „Staubbeutel voll“ mit ✕, Langtext „Staubbeutel prüfen …“ im Tooltip, Verweilen zeigt/Verlassen versteckt, ✕ → genau ein `button.press`; Knopf `unavailable` → kein ✕; Fehler „Steckt fest“ rot ohne ✕ mit Langtext. Chip-Text in den 85 v1-Vektoren unverändert. Version 2.0.0-alpha.30.
- [2026-09-17] [4.14] Befund · Info: Gebaut wie in der Karte. `src/i18n/de.ts` (619 Schlüssel in 39 Gruppen, `as const`) und `src/i18n/t.ts` mit drei Zugängen: `t(key, params)` typsicher für feste Schlüssel (Tippfehler = Baufehler), `tx(key)` für zur Laufzeit gebaute Schlüssel (Rückfall = Schlüssel), `lookup(prefix, wert)` für Werte aus HA (Status, Fehlercode, Option, Raumname, Raumtyp; `undefined` ohne Eintrag, der Aufrufer macht den Wert lesbar wie bisher). Umgezogen: STATUS_DE/ERR_DE/ROOMS_DE/TASK_DE/DAYS (`config.ts` behält nur NAV, APP_SCENES, PHASE_IDLE, VAC_RUN), OPTION_DE, die deutschen Namen der ROOM_TYPES, alle Beschriftungen in Selektoren (Station, Verschleiß, Einstellungen, Roboter-Einstellungen, Prognose-Schalter, Diagnose), Kartenmodi, Seiten-/Slot-Titel, alle Bausteine, die Shell samt Platzhalter-Vorschauen und die Domäne (status, labels, estimate, strip, setup, rooms). `error.*` = Kurztext (höchstens zwei Wörter) und `errorLong.*` = Langtext für alle 128 Zustandswerte (142 Codes der Integration + 9 v1-Schlüssel wie `brush_stuck`, die die Vektoren brauchen); unbekannte Codes weiter als Wert mit Leerzeichen. Sichtbar geändert hat sich dadurch nur der Chip-Text für Codes, die v1 nicht kannte (vorher z. B. „water tank dry“, jetzt „Frischwasser leer“) – Vorgriff auf PD-015. Scan-Test: Kommentare entfernt, dann Zeichenketten und Template-Textknoten in `components/`, `domain/`, `shared/`, `ha/` (ohne `contract.ts`) und der Shell auf Umlaute/ß oder eine Liste typischer UI-Wörter geprüft; Ausnahmen nur für HA-Werte, die der Code vergleicht (Phasen aus heidi.yaml, Kartendarstellungen, Optionswerte der Selects, „Deutsch“/„Original“) und für schlüsselartige Zeichenketten. Gegenprobe: im Stand vor 4.14 findet der Scan in `dx-hero.ts` 10 und in `setup.ts` 2 feste Texte. Nicht in der Datei (Daten aus HA): Raumnamen, Planer-Namen, Personen, Zahlen/Datum (`Intl`). Regel 15 bleibt: deutsche Bezeichner in der Domäne (`raeume`, `saug`) sind Code, keine Texte. Version 2.0.0-alpha.29.
- [2026-09-17] [Plan] Entscheidung Herbert · Info: **Texte zentral (i18n).** Frage Herbert: eine Datei für alle Texte der Karte, später Sprachwahl in den Einstellungen. Entscheidung: **Stufe 1 jetzt** in Modul R als 4.14 (ClickUp DX-066): `src/i18n/de.ts` mit Schlüsseln + `t()`, alle festen Texte dorthin (heute rund 85 in den Bausteinen, rund 280 in Domäne und Tabellen; am Ende 500–600 Einträge), Wortlaut unverändert, Test gegen neue feste Wörter im Code; keine Funktion für den Nutzer, daher kein PD-Eintrag. Nicht in die Datei: Daten aus HA (Raumnamen, Planer-Namen, Personen) und Zahlen/Datum (`Intl`). **Stufe 2 Post-2.0** (DX-067): `en.ts`, Sprache aus `hass.language`, optional Schalter in den Einstellungen, Domäne liefert Schlüssel statt Sätze (Vektor-Tests übersetzen vor dem Vergleich); dann PD-Eintrag. Texte im Bundle (Regel 14), keine neue Abhängigkeit.
- [2026-09-17] [4.1] Befund · Info (Modul R, Entität `button.heidi_clear_warning`; Herbert geht die Roboter-Entitäten einzeln durch): Die Integration kennt **kein eigenes Warnungs-Attribut** – Warnung und Fehler sind derselbe Fehlersensor `sensor.heidi_error`; 22 Codes gelten als Warnung (`WARNING_ERROR_CODE` in `dreame/types.py`), `has_error` von `vacuum.heidi` ist nur bei echten Fehlern true, `button.heidi_clear_warning` ist nur bei anstehender Warnung (plus „Wasser knapp“ / „Entwässerung fertig“) verfügbar. Der gelbe Hinweis-Chip im Roboter-Panel **ist** damit heute schon die Warnung. Liste der 22 Warnungen mit deutschem Text: `docs/dreame_x60/ENTITAETEN.md` (Abschnitt „Warnungen und Fehler“). Nur 4 der 22 haben einen Text in `ERR_DE`; der Zustandswert `blocked` gilt für Warnung 47 und die Fehler 63/64 – Farbe daher weiter nur über `has_error`. **Entscheidung Herbert (17.09.):** Warnung + Quittieren ins Roboter-Panel – das ✕ kommt an den bestehenden gelben Chip, `DxApi` ruft `button.press` auf `clear_warning`, nur sichtbar, wenn der Knopf verfügbar ist; kein zweiter Chip. Erweiterung gegenüber v1 → PD-Eintrag bei der Umsetzung (Karte 4.1, Modul R); `ERR_DE` um die fehlenden 18 Warnungstexte ergänzen. Mockup `dreame_x60/mockups/warnung.html` korrigiert (ein Chip aus `sensor.heidi_error`: gelb = Warnung mit ✕, rot = Fehler; Kurztext höchstens zwei Wörter, Langtext beim Verweilen als Tooltip, am Handy more-info) – **abgenommen von Herbert am 17.09.2026**, PD-015 freigegeben; Umsetzung in 4.1 nach 4.14 (Texte aus `de.ts`).
- [2026-09-16] [Plan] Entscheidung Herbert · Info: **Zuerst das Roboter-Panel.** Herbert (Sitzung Teil 5): „Modul für Modul fertigstellen, beginnend mit dx-hero – da will ich alles einbauen, was mit dem Roboter und Saugen zu tun hat.“ Neues Modul **R Roboter-Panel** vor Modul A (Abschnitt 1a): `dx-hero` + `dx-auftrag` (4.1: Sichtprüfung und Nachbesserungen am Panel) und der Räume-Dialog im Roboter-Modus (4.6a, „Räume einstellen“ aus dem Hero). Abgrenzung per Auswahlfrage (Herbert: „Nur das Roboter-Panel“): Station, Verschleiß und Roboter-Einstellungen bleiben in C/D/E, Karte und Räume in B. 4.6 ist in 4.6a (Roboter-Modus, Modul R) und 4.6b (Plan-Modus, Modul A) geteilt; `tests/e2e/widths.js` entsteht in Modul R. Wünsche fürs Panel über v1 hinaus: hier als `Post-2.0` oder als PD-Eintrag (Regel 2). ClickUp: DX-064 Modul R (ready for development, https://app.clickup.com/t/123ztrcvtmj), DX-033 → 4.6a, DX-065 4.6b (https://app.clickup.com/t/123ztrcvtmk), DX-056 Modul A → backlog (zweites Modul).
- [2026-09-16] [Plan] Entscheidung Herbert · Info: **Bau modulweise statt phasenweise.** Die Phasen waren für den Parallelbetrieb mit v1 gedacht (alle Komponenten, dann responsive, dann sieben Tage nebeneinander); v1 ist seit 15.09. abgeschaltet, v2 läuft im Alltag. Ab jetzt wird ein Modul komplett fertig (Code, Tests, responsive, Parität, Doku, Sichtprüfung, ClickUp shipped – Abschnitt 11a), bevor das nächste beginnt. Reihenfolge A Planer → B Karte und Räume → C Übersicht-Kacheln → D Verlauf und Statistik → E Einstellungen → G Abschluss; F Backend parallel (Abschnitt 1a). Alle Aufgabenkarten und DX-Nummern bleiben; 5.1 ist in die Module aufgelöst (Regeln in Modul A). ClickUp: je Modul eine Meta-Aufgabe mit Checkliste (DX-056 … DX-062), Phase-Parents bleiben als Historie.
- [2026-09-16] [Doku] Befund · Info (Teilaudit mit dem audit-Skill): Profile in der CLAUDE.md vollständig, alle referenzierten Pfade und Bauplan-Abschnitte vorhanden, Version in package.json/Lock/HANDOFF/Statusliste/Ressource einheitlich (alpha.28), PD-Register komplett freigegeben. Behoben: HANDOFF Abschnitt 4 (Stand, ClickUp-Bezug je Punkt, Remote Control gestrichen, Editor-Livetest → DX-032, HACS/H:\www → DX-063), `heidi/CLAUDE.md` Räume-Zeile (dynamisch seit PD-013), ENTITAETEN.md Spaltenerklärung, Karten 6.3/6.5 um Tests/Dateien ergänzt, „Heidi v2“ als historischer Name markiert, DX-041 (5.1) auf cancelled. Falschbefund zurückgenommen: Abschnitt 4 nennt alle Paket-Helfer (Kurzform mit `|`). Offen: `tests/e2e/widths.js` entsteht in Modul A (4.4 verlangt die Breitenprüfung).

- [2026-09-15] [4.0] Befund · Info: Karte 4.0, Abschnitt 7 und die Karten 4.1/4.3/4.4/4.7/4.9/4.10/5.1 auf das abgenommene Bento-Mockup umgeschrieben (ClickUp „Bauplan: Aufgabenkarte 4.0 auf das Bento-Layout umschreiben“). `dx-nav-tiles` entfällt; die Navigation heißt `dx-nav` und hat drei Formen nach dem Container `app` (Seitenleiste > 1180 px, Symbolleiste 761–1180 px, Tab-Leiste ≤ 760 px), die Übersicht ist ein 12-Spalten-Bento mit zehn Flächen. Neue Übersichts-Bausteine: `dx-auftrag` (4.1), `dx-quickstart` (4.3), `dx-stats` (4.7), `dx-heute` (4.10, statt `dx-prognose-card`) sowie `compact`-Varianten von `dx-planer` (4.4) und `dx-history` (4.7). Zwei Mockup-Extras haben kein v1-Gegenstück und bleiben draußen (der Mockup-Kommentar nennt sie selbst „nur in diesem Mockup“): Schalter direkt in der Planer-Kachel (v2 zeigt aktiv/inaktiv nur an, Umschalten im Editor wie v1) und die Kachel „Alles“ im Schnellstart als eigener Dienst (v2: Auswahlhilfe, wählt alle sieben Räume). Alle sichtbaren Abweichungen zur v1-Übersicht stehen gesammelt in PD-007. Offen und in 4.0 zu prüfen: ob `position: sticky` für die Tab-Leiste in HAs Ansicht hält (Scroll-Container ist HAs Ansicht, nicht die Karte). Entscheidung Herbert (15.09.): Fassung der Karte 4.0 bestätigt, PD-007 freigegeben.
- [2026-09-15] [4.1] Befund · Functional (v1 = v2, Beobachtung am echten Lauf 08:37–08:45): Während Heidi fährt, ist `switch.heidi_customized_cleaning` **unavailable** und damit alle 35 `select.heidi_room_N_*` ebenfalls (Integration). Folge in v1 wie v2: kein Streifen und die drei Werte Modus/Saugstufe/Wasser zeigen „–“, obwohl ein Raum gereinigt wird. Die v1-Vektoren mit Streifen entstanden mit gesetzten Raum-Selects (angepasste Reinigung an). Außerdem enthält `active_segments` beim Lauf „ganze Wohnung“ eine ID **8** (kein Raum 1..7; von `runOrder` verworfen, weil `cleaning_sequence` sie nicht enthält), und `input_text.heidi_lauf_reihenfolge` bleibt `unknown` (Helfer wird nur vom Planer-Skript gesetzt). Entscheidung Herbert (15.09.): „Angepasste Reinigung“ in der Dreame-App eingeschaltet – der Schalter steht jetzt auf `on`, die Raum-Selects liefern Werte (alle Räume Saugen/Turbo, Wasser und Route bei „Saugen“ von der Integration deaktiviert). Panel zeigt im Leerlauf „Saugen · Turbo · –“ (Live-Abzug geprüft). Kein Rückfall auf Raumnamen ohne Werte nötig. Nachtrag (Herbert): Ein Start in der Dreame-App schaltet „Angepasste Reinigung“ aus. Neue Automation `heidi_angepasste_reinigung_an` in `ha/automations.yaml` (Backend, Herberts Auftrag 15.09.): schaltet den Schalter wieder ein, wenn Heidi angedockt ist und er 5 Minuten aus bleibt (Trigger: Schalter → off für 5 min, oder vacuum → docked für 5 min; Bedingung: Schalter off und nicht unterwegs). Beobachtung beim App-Lauf 09:58–10:10 (Küche+Flur): Der Schalter war während des Laufs `unavailable` und stand 11 s nach dem Andocken von selbst wieder auf `on` (Integration), die Automation musste nicht eingreifen – sie bleibt als Netz für den Fall „off“ (wie im Abzug 07:59, Ursache unbekannt). Kein neuer Helfer, Vertrag unverändert; eingespielt per automation reload. Außerdem (Herbert: „kurz vor einem geplanten Vorgang prüfen“): Schritt 0 im Skript `heidi_reinigung` schaltet den Schalter direkt vor dem Setzen der Raumwerte ein (`switch.turn_on` + `wait_template` bis `select.heidi_room_1_cleaning_mode` verfügbar, max. 15 s) – gilt damit für Planer- und Kartenstarts. Verhalten bei App-Lauf zur geplanten Zeit: heute überspringt der Planer (Bedingung `docked`) und holt den Lauf beim nächsten 10-Minuten-Tick nach dem Andocken nach, ohne Zeitlimit. Entscheidung Herbert (15.09.): nachholen ja, aber nur innerhalb der Arbeitszeit; später Ausgehen-Prüfung und Räume ausnehmen, die kurz vorher manuell gereinigt wurden – Analyse und Stufenplan in `docs/dreame_x60/PLANER-NACHHOLEN.md`, ClickUp „Backend: Planer nachholen …“; noch nichts eingebaut.
- [2026-09-15] [4.1] Wunsch · Post-2.0 (Herbert, beim Lauf 08:37 – Badtür war zu): Nicht erreichbare Räume in der Auftrag-Kachel (Route) und im Kopf rot hervorheben. Befund dazu: HA bekommt vom Roboter **keine** Meldung „Raum nicht erreichbar“ – `sensor.heidi_error` blieb `no_error`, `vacuum.heidi` `faults` = `{}`, `has_error` = false; Heidi hat das Bad still übersprungen (Phase sprang von „Fährt zum Startpunkt · Bad“ direkt auf „Wischt Küche“). Auch der Protokoll-Eintrag (`sensor.heidi_cleaning_history`) kennt nur Summen und `completed`, keine Räume. Möglich wäre nur eine Ableitung: Räume der Laufreihenfolge vor dem aktuellen, für die es nie eine Phase „Saugt/Wischt <Raum>“ gab (aus der Phasen-Historie, die die Zeitleiste ohnehin lädt) → als „übersprungen“ markieren. Das ist neue Fachlogik (Regel 2), deshalb nach 2.0; im Bau von 4.7 (Zeitleiste) prüfen, ob die Phasen-Historie dafür reicht. ClickUp: „Post-2.0: Übersprungene Räume rot markieren“ (https://app.clickup.com/t/123ztrcv2jy). Herbert (15.09.): für später vorgemerkt.
- [2026-09-15] [4.1] Befund · Info: Beim Lauf 08:37 tauchte ein **Raum 8** auf („Room 8“, `visibility: Hidden`, Koordinaten null, in `camera.heidi_map.rooms`, `select.heidi_room_8_*` und `active_segments`), den es im Abzug von 07:59 nicht gab. Der Vertrag kennt 1..7; die Karte ignoriert 8 (Reihenfolge nur aus `cleaning_sequence` ∩ 1..7). Geklärt (Herbert, 15.09.): Heidi hat den **Balkon durchs Terrassenfenster** gescannt und als Raum angelegt; Herbert hat ihn in der Dreame-App abgetrennt und mit „Ausblenden“ versteckt. Raum 8 bleibt also als versteckter Raum in den Daten (`visibility: Hidden`, keine Koordinaten, in `active_segments` bei „ganze Wohnung“) – gewollt, kein Vertragsbruch. `dx-map-card` (4.3) muss Räume mit `visibility: Hidden` bzw. ohne Koordinaten übergehen.
- [2026-09-15] [4.1] Befund · Info (Abbruch des Laufs 08:53, Herbert schickt Heidi zur Station): Kopf bei `returning` wie v1 („Fährt zur Station“, Knöpfe Pause/Stopp/Orten, kein Streifen). `dx-auftrag` erscheint jetzt nur bei `cleaning`/`paused` (wie der Streifen); bei `returning` zeigte die Kachel sonst nur den Durchfahrtsraum ohne Auftrag – dann steht wieder Automatik in der rechten Spalte. Der Protokoll-Eintrag des abgebrochenen Laufs hat `completed: false` (1 min, 1 m²) und wird in 4.7 mit ✗ erscheinen. Nachtrag (Herbert sah „Station: unterwegs“ bei der Mopp-Wäsche nach dem Lauf): In der Station bleibt der Hauptzustand `cleaning` (Wäsche/Trocknen), aber die Attribute sagen `docked: true`, `charging: true`, `washing: true`. Stationszeile jetzt aus diesen Attributen („wäscht Mopps · lädt“, „trocknet · lädt“, „angedockt · lädt“), Titel „Heidi ist in der Station“, Auftrag-Kachel nur unterwegs (`docked: false`, in allen Live-Abzügen während der Fahrt bestätigt). `states-cleaning.json` ist genau dieser Zustand „Mopp-Wäsche vor dem Start“ (cleaning + docked); ein Abzug mitten in der Fahrt liegt noch nicht als Fixture vor (`render.js` deckt die Fahrt über abgeleitete Zustände ab).
- [2026-09-15] [4.1] Befund · Functional (zweiter echter Lauf 09:58, App-Start Küche+Flur mit eingeschalteter angepasster Reinigung): Der App-Start setzt `switch.heidi_customized_cleaning` auf **unavailable** (nicht off), ebenso `select.heidi_room_N_cleaning_mode`; `suction_level` bleibt verfügbar. Damit liefert `roomValuesOf` null (Modus fehlt) → v1 wie v2 ohne Streifen und mit „–“. Die Kartendaten (`camera.heidi_map.rooms[6]`: cleaning_mode 0, suction_level 1, cleaning_times 1 = Saugen/Standard/1×) stimmen mit Herberts App-Auswahl überein. Umgesetzt als PD-010 (Rückfall auf Kartendaten, Kamera-Vergleich nur über das Attribut `rooms`, damit Kamerabilder keine Renderläufe auslösen). Neue Fixture `states-driving.json` (362 Entitäten, mitten in der Fahrt; `render.js`, `hero.js`). `dump-states.ps1` entfernt `access_token` jetzt bei allen Entitäten (vorher nur bei Personen gefiltert). Offen zur Beobachtung: Verhalten der Selects bei einem Planer-Start (Schalter an, Skript setzt Werte).
- [2026-09-15] [4.3] Befund · Info: Gebaut wie in der Karte, mit vier Entscheidungen. (1) **`compact` zeigt immer das Kamerabild** (`picture-entity` von `camera.heidi_map`, Cache-Schlüssel `compact`) statt der gewählten Kartendarstellung: die Xiaomi-/Dreame-Karten bringen ihre eigene Bedienzeile mit, die auf der Übersicht stört; das Kamerabild ist live (Roboterposition, Pfad) und wird von einer Klickfläche überlagert (Antippen → Seite Reinigen, kein more-info). (2) Cache-Schlüssel der Seite Reinigen: `Xiaomi-Karte|<modus>` (je Modus ein Element, Modus-Wechsel = Cache-Treffer) bzw. `<Darstellung>|<dunkel>` für Dreame-App/Nur Bild; Modi (Räume/Zone/Punkt/Hinfahren) nur bei der Xiaomi-Karte, bei den anderen bleiben Raumkacheln und „Alles“. (3) `select.heidi_selected_map` neu im Vertrag (Abschnitt 4, Kartenwahl nur wenn verfügbar; im Abzug `unavailable` mit Option „Map 1“, Mehrkarten-Wunsch bleibt Post-2.0). (4) Konfigurationen liegen in `src/ha/map-config.ts` (HA-Schicht, weil Entitäts-IDs aus dem Vertrag eingesetzt werden); Umrisse/Marker aus `readMap().roomShapes` (sichtbare Räume 1..7 mit Koordinaten, Raum 8 übergangen). Raumauswahl-Logik gemeinsam in `shared/rooms.ts` (Karte und Schnellstart). App-Szenen, „Stühle am Boden“ und „Räume einstellen“ rendert die Shell auf der Seite Reinigen (kleine Kacheln, Schreiben über `api`). `readMap` reagiert auf `camera.heidi_map` nur bei Änderung der genutzten Attribute. Sichtprüfung 15.09. im Browser-Bereich (Herbert angemeldet): Die **Dreame-App-Karte** zeigt in dieser Installation nur das Kamerabild der Integration (mit eingezeichneten Raumnamen) und **keine eigenen Raum-Marker** („Klicken Sie auf Raumnummern“ ohne Nummern; DOM ohne Raum-Elemente) – Antippen eines Raums wählt nichts, in v1 identisch. Raumauswahl mit dieser Karte nur über ihre Listenansicht (Knopf „Zur Listenansicht wechseln“) oder unsere Raumkacheln; Antippen in der Karte gibt es mit der Xiaomi-Karte (Umrisse aus den Kartendaten). Entscheidung Herbert (15.09.): Dreame-App-Karte bleibt das Kartenbild; unsere Raumkacheln und „Alles“ bleiben darunter (sie sind bis zur „Heidi-Karte“ die Raumauswahl); Antippen im Bild kommt mit der Heidi-Karte nach 6.5. **Grenze der Tests:** Playwright kennt nur den Karten-Stub (`createCardElement` zeichnet die Konfiguration auf); Kartenbild, Glas-Variablen, Tipp in die Raumfläche und ▶ der Xiaomi-Karte sind nur in HA prüfbar → Sichtprüfung Herbert.
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
- [2026-09-14] [4.3] Wunsch · Post-2.0: Pixelgenaue Raumauswahl wie in der App über `camera.heidi_map_data` (Valetudo-Format, Segment-Masken) in einer eigenen Kartenansicht; die Xiaomi-Karte kann nur Polygone (`outline`) und trifft an Raumrändern ungenau. **Entscheidung Herbert (15.09.): Projekt „Heidi-Karte“ nach 6.5** – Kartenbild der Dreame-Integration (wie die Übersicht heute) plus eigene Bedienebene (SVG-Overlay aus den Segment-Pixeln der Datenkarte: Tipp → Raum, Mehrfachauswahl, Hervorhebung, eigener Zoom; später Sperrzonen/Zone/Punkt/Hinfahren als Gesten). Kein Overlay über die fremde Dreame-Karte (fremder Zoom/Layout, bricht bei Updates). Die Dreame-App-Karte bleibt bis dahin das Kartenbild (kann hier keine Räume per Antippen wählen), die Xiaomi-Karte entfällt danach. Datenkarte aktiviert (15.09., `camera.heidi_map_data`): liefert ein Platzhalter-PNG (33 KB) mit dem Kartenpaket als zTXt-Chunk „ValetudoMap“ (JSON, 20 KB, Valetudo-Format v2): `size` 6554×6554 cm, `pixelSize` 5 cm (Raster 1311²), `layers` = 7 Segmente mit `metaData.segmentId`/`name`, `dimensions` (min/max/pixelCount) und `compressedPixels` (Lauflängen-Tripel x, y, Anzahl in Rasterpixeln), `entities` = `robot_position`, `charger_location` (cm, mit `angle`), mehrere `path` (Punktlisten in cm), `metaData.rotation` 90. Muster als Fixture `tests/fixtures/map-data.valetudo.json`. Abgleich mit dem gerenderten Bild (1068×680, gedreht, beschnitten) über `calibration_points` und die 90°-Drehung ist Teil des Projekts. Abruf: `GET /api/camera_proxy/camera.heidi_map_data` (Bearer), PNG-Chunk lesen, `zlib.inflate`. ClickUp „Post-2.0: Heidi-Karte – eigenes Kartenbild …“ (https://app.clickup.com/t/123ztrcv3x3).
- [2026-09-14] [4.3] Wunsch · Post-2.0: Kartenwahl für mehrere Etagen (`switch.heidi_multi_floor_map`, `select.heidi_selected_map`, `camera.heidi_map_1..3`), sobald eine zweite Karte existiert; Reihenfolge der Räume per Ziehen (`vacuum_set_cleaning_sequence`).

- [2026-09-15] [UX] Wunsch · Post-2.0 (Herbert): **App-artige Übergänge Bento ↔ Detail** (Expand/Morph beim Öffnen einer Detailansicht, Collapse/Morph zurück; Bewegungssprache für Tabs, Panels, Dialoge, Status, Karte; 120–300 ms, ruhig, `prefers-reduced-motion`). Vollständig in `docs/dreame_x60/UX-TRANSITIONS.md`; ClickUp „Post-2.0: App-artige Übergänge Bento ↔ Detail“. Dazu (Herbert, 15.09.) Ideen „Kopfzeile als Einstieg“: Uhrzeit → Kalender der Fahrten, „Zu Hause“ → Anwesenheitsübersicht, „Nicht stören“ → Fenster „Zeiten“, Seitenleiste später optional; Variante Familienkalender in HA (Läufe und Familientermine als Kalender-Entität, Planer bleibt Wahrheit) – ebenfalls dort, ClickUp „Post-2.0: Kopfzeile als Einstieg …“. **Gilt schon jetzt (nur Leitplanken, kein Scope):** Navigation nur über `navigate.ts`/`dx-navigate`; keine Komponente hängt am HA-Ansichts-Lebenszyklus (die Seiten sind heute HA-Unteransichten, später rendert die Karte Detailseiten selbst – Wechsel nur in Shell + `navigate.ts`); `data-slot`-Namen der Übersicht und die Bausteinnamen bleiben stabil (Anker für Morph); gleiche Sache auf Übersicht und Detail = ein Element mit `variant`, nicht zwei; keine Animations-Infrastruktur auf Vorrat.

- [2026-09-15] [Post-2.0] Wunsch · Post-2.0 (Herbert): **Raumliste dynamisch aus den Kartendaten** (`camera.heidi_map.rooms`: `room_id`, `custom_name`, `order` = Reinigungsreihenfolge, `visibility`; nur sichtbare Räume) statt fest 1..7, und **Roboter-Name als Parameter** (`heidi` → Kartenkonfiguration, HA-Paket mit Variablen), damit die Karte für andere Dreame-Modelle mit derselben Integration taugt. Feste Stellen heute: `contract.ts` `ROOM_IDS`, `config.ts` `ROOMS`, `raumwerte.ts` (1..7), `labels.ts` `roomLabel`, `estimate.ts` Standardfläche, `scripts.yaml` `range(1, 8)`, `runlog.py`. Ecovacs u. ä. = eigener Adapter (Vertrag/Selektoren/API/Paket), Regel 18 bleibt. Erweitert zur **Leitlinie „so wenig wie möglich fest verdrahtet“** (Herbert): eigene Raumnamen/Symbole über ein Einstellungsmenü „Räume“ (ein JSON-Helfer `input_text.heidi_raum_namen`, dann Abschnitt 4); Optionen (Modus, Saugstufe, Wasser, Route, Wdh) aus dem `options`-Attribut der Selects mit HA-Übersetzung statt Tabellen – dafür müssten Planer-Helfer und Raumwerte-Kurzcode auf Optionsschlüssel umgestellt werden (Backend-Umbau); Zustände/Hinweise über HA-Übersetzung, wo vorhanden. Reihenfolge: Räume + Namen-Menü, Roboter-Name, zuletzt Optionen. ClickUp „Post-2.0: So wenig wie möglich fest verdrahtet …“ (https://app.clickup.com/t/123ztrcv36z).

- [2026-09-15] [Post-2.0] Wunsch · Post-2.0 (Herbert): **Themes über HA-Theme-Dateien** statt fester Token-Werte: jeder `--dx-*`-Token in `styles/tokens.ts` liest zuerst eine HA-Theme-Variable (`--dx-bg: var(--heidi-bg, #0b1015)`), Themes in `ha/themes/` (mit `modes: light/dark`) liefern die Werte; Bento bleibt eingebauter Standard; Hell/Dunkel ggf. über `hass.themes.darkMode`. Klein, keine Fachlogik – kann mit 4.11 (Darstellung) kommen. Beim Bau: keine Farbwerte außerhalb von `tokens.ts` (gilt schon, Abschnitt 27). ClickUp „Post-2.0: Themes über HA-Theme-Dateien“ (https://app.clickup.com/t/123ztrcv3cw).

Wünsche `Post-2.0`: lokale Font-Dateien (Sora/IBM Plex).

- [2026-09-15] [4.3b] Befund · Functional (Sichtprüfung Herbert, Heidi-Karte alpha.15 → Nachbesserung alpha.16): (1) Gestrichelter Rand und Streifen (je Lauflänge ein Viereck mit Kontur) sahen schlecht aus → `segmentOutline`: Randkanten der Pixelmaske zu geschlossenen Schleifen verkettet, kollineare Punkte weggelassen, Löcher (Möbel) mit `fill-rule: evenodd`; gewählt = Fläche aufgehellt (weiß 24 %) + durchgehender Akzentrand, aktueller Raum grüner Rand. (2) Schwarze Namens-Chips entfernt – das Kartenbild trägt die Raumnamen schon. (3) **Auswahlreihenfolge**: `selectedRooms/segmentsOf` liefern die Tipp-Reihenfolge (Set-Einfügereihenfolge) statt 7..1; `DxApi.startRooms` schreibt `input_text.heidi_lauf_reihenfolge` (wie das Planer-Skript, damit Kopf-Streifen und Auftrag-Kachel die Reihenfolge kennen) und ruft dann `vacuum_clean_segment` in dieser Reihenfolge – Karte und Schnellstart. **Offen:** beim nächsten Lauf prüfen, ob der Roboter die übergebene Reihenfolge wirklich einhält. (4) Nummern-Chips wie in der App: HTML-Chip (24 px, fest, unabhängig vom Kartenmaßstab) am Ankerpunkt des Raums, rechts oben versetzt, damit er nicht auf der Beschriftung des Kartenbilds sitzt. Ankerpunkt = Flächenschwerpunkt; liegt der außerhalb (Schlafzimmer: L-Form um das Bett), die Mitte der nächstliegenden Lauflänge (`anchorOf`; Test verlangt Anker im Raum für alle sieben). (5) **Befund an der Integration:** Während und nach einem Raumauftrag enthält das Kartenpaket der Datenkarte **nur die aktiven Räume** als Segmente (`metaData.active: true`), die übrigen werden zu Bodenpixeln (`dreame/map.py`, `active_segments`; live um 11:23 nur „Küche“) – dann wären alle anderen Räume nicht antippbar. Lösung: `MapData.partial` + `mergeSegments`; der Lader merkt sich das letzte vollständige Paket je Karte (`saved_map_id`, Modul + localStorage `dreame_x60.mapdata.<id>`, ~11 KB) und ergänzt fehlende Räume. Grenze: Nach dem allerersten Laden im Raumauftrag (ohne gespeichertes Paket) fehlen die Räume bis zum nächsten vollständigen Paket (nach dem Andocken). Sichtprüfung 15.09. im Browser-Bereich: sieben Umrisse (Wohnzimmer mit 8 Schleifen um Möbel), Tipp Wohnzimmer → Bad → Küche ergibt Chips 1/2/3 und „3 Räume reinigen“; localStorage für Karte 3 dabei mit dem Muster von 10:56 vorbelegt, weil das Live-Paket gerade ein Teilpaket war.

- [2026-09-15] [4.3b] Messung · Info (dritter echter Lauf 11:50, Start über die Heidi-Karte, Tipp-Reihenfolge Küche → Wohnzimmer → Flur): **Reihenfolge wird eingehalten.** `startRooms` setzte `input_text.heidi_lauf_reihenfolge` = „6,7,4“, `active_segments` = 6,7,4; Phase 11:50 „Saugt Küche“, 11:53 „Saugt Wohnzimmer“ (in der Anzeigereihenfolge 7..1 wäre das Wohnzimmer zuerst gekommen). Auftrag-Kachel zeigte „Küche → Wohnz. → Flur · 1/3 · Nächster Raum Flur“. Das Roboter-Attribut `cleaning_sequence` (hier 1,6,7,2,4,3,5) blieb dabei unverändert – es ist die App-Standardreihenfolge, nicht die Auftragsreihenfolge. Um 12:03 „Fährt zur Station“ ohne den Flur, 12:04 `idle` bei Status „Returning“ (wie beim Abbruch 11:23), 12:05 docked/lädt; Herbert hat sie um 12:03 selbst zur Station geschickt (kein Überspringen). **Befund Reinigungspfad:** Während des Laufs enthielten weder das Kartenbild (`camera.heidi_map`) noch das Kartenpaket (`camera.heidi_map_data`, Entities nur robot_position/charger_location) den Reinigungspfad – auch nicht mit geöffneter Dreame-App (dreimal über eine Minute geprüft). Nach dem App-Lauf 09:58 hatte das Bild von 10:56 die Bahnen (Fixture `map.png`, Paket mit 4 `path`-Entities). Bei den beiden HA-Starts (11:23, 11:50) fehlte der Pfad von Anfang an. Nicht von der Karte verursacht (Bild 1:1 von der Integration; v1 und Dreame-App-Karte zeigen dasselbe Bild). Ursache offen: „tr“-Spur in den Kartenframes (`dreame/map.py` 4356) kommt nicht an oder wird verworfen; ohne Debug-Protokoll der Integration nicht entscheidbar. Nächster Schritt: beim nächsten App-Start prüfen, ob die Bahnen dann live erscheinen; wenn ja, GitHub-Issues der Integration (Tasshack/dreame-vacuum) durchsehen. Nach dem Andocken (12:05) war das Kartenpaket weiterhin ein Teilpaket (7*, 6*, 4*) – das vollständige Paket kommt erst mit dem nächsten vollständigen Kartenframe; der Raum-Speicher der Heidi-Karte deckt das ab.

- [2026-09-15] [4.3c] Befund · Info (Herbert: „alle Gerätenamen im Dashboard sollen ausgelesen werden, die IDs haben ein Muster“ → vorgezogen, PD-012): `src/ha/device.ts` erkennt den Roboter (Konfiguration `robot:`, Entitäts-Register Plattform `dreame_vacuum`, sonst Zustände mit `segment_cleaning`/`cleaning_sequence`) und liefert Präfix + Anzeigename; `contract.ts` bildet die 49 Roboter-Merkmale und die Raum-Selects daraus (`ROBOT_FEATURES`, `robotEntity`, `robotIds`), Paket-IDs bleiben fest (`PACKAGE_PREFIX`). `memoizeSelector` nimmt ID-Listen und Vergleichstabellen als Funktionen (Gerätewechsel → neue Liste → Neuberechnung). Das Panel ruft `discoverDevice` in `willUpdate` vor jedem Render. Befund dabei: `friendly_name` von `vacuum.heidi` ist **„Heidi  Heidi“** (Gerätename + gleichnamige Entität, `has_entity_name`) → `cleanName` entfernt Wiederholungen; im echten HA kommt der Name aus dem Geräte-Register (`hass.devices`, vom Benutzer vergebener Name zuerst). Grenze: Automationen, Skripte und das Paket (`ha/`) verwenden die Roboter-IDs weiterhin wörtlich – bei einer ID-Umbenennung in HA müssten sie nachgezogen werden (eine Stelle je Datei, Abschnitt 4 des Bauplans und `docs/dreame_x60/ENTITAETEN.md` listen sie). Räume (`config.ts` ROOMS 7..1) und Optionen bleiben bis nach 6.5 fest (ClickUp „Post-2.0: So wenig wie möglich fest verdrahtet“). Tests: `device.test.ts` (Erkennung aus Zuständen/Register/Konfiguration, ohne Roboter, Umbenennung heidi→berta über alle Selektoren, Paket-IDs ohne Präfix), `device.js` (Kopf „Berta ist unterwegs“, Seitenleiste, Akku, Pause → `vacuum.berta`, `robot:` bei zwei Robotern, ohne Roboter ≥ 84 fehlend in der Diagnose). Alle Vektor-/Paritätstests unverändert grün (sie setzen das Gerät „heidi“).

- [2026-09-15] [6.5] Befund · Info (Herberts Entscheidung: „schalte v1 ab, ich muss das nicht produktiv haben“): v1 vorzeitig abgeschaltet. Vom Pi entfernt: `www/heidi-panel.js`, die Sicherungen `heidi-panel-v1.1.0.bak`, `.bak.b64`, `heidi-panel-v1.2.1.bak`, `_deploy_yamls.txt.old`, `dashboards/heidi.yaml`, der Dashboard-Eintrag `heidi-yaml` in `configuration.yaml` (v2-Dashboard `dreame-x60` heißt jetzt „Heidi“, Symbol robot-vacuum) und die Lovelace-Ressource `/local/heidi-panel.js`. Im Repo: `ha/www/heidi-panel.js` und `ha/dashboards/heidi.yaml` → `heidi/archiv/` (Referenz für Vektoren und Nachschlagen, `v1-vectors.js` liest von dort); `deploy.ps1` kopiert nur noch v2. Bleibt auf dem Pi, weil v2 es nutzt: Paket, Automationen, Skripte, Prognose-Skripte, Theme, HACS-Karten dreame-vacuum-map-card und xiaomi-vacuum-map-card. Nur v1 brauchte: HACS Mushroom, card-mod, expander-card, stack-in-card → Herbert deinstalliert sie in HACS (HACS verwaltet Dateien und Ressourcen selbst). Regel 11 und 6.4 aufgehoben; Regel 2 (Parität) bleibt, Referenz ist das Archiv. Lücke bis 4.4/4.5: kein Planer-Editor in der Oberfläche.

- [2026-09-15] [Plan] Wunsch · Herbert (nachdrücklich): „Ich will, dass die App auch für andere Roboter funktioniert.“ Plan in `docs/dreame_x60/GERAETEPROFIL.md`: Stufe 1 (Gerätename/IDs, PD-012) erledigt; Stufe 2 = jeder Dreame-Roboter (Profil aus HA: Räume aus `camera.<gerät>_map.rooms`, Optionen aus den Select-`options`, Fähigkeiten aus dem Vorhandensein der Entitäten; Bauteile bekommen das Profil als Parameter); Stufe 3 = Adapter je Marke hinter einer festen Schnittstelle (Dreame = erster Adapter; Backend-Skript je Marke); Stufe 4 = zwei Roboter (Paket als Vorlage). Empfehlung: Stufe 2 **vor** 4.4/4.5 bauen, weil Planer/Editor/Räume-Dialog aus Raum- und Optionslisten bestehen (sonst doppelte Arbeit). Entscheidung Herbert offen (drei Fragen am Ende des Plans).

- [2026-09-15] [4.3d] Befund · Info (Herbert: „ja Stufe 2 … 2, 6 oder 20 Räume, eine oder mehrere Karten“): Geräteprofil gebaut (PD-013). `domain/rooms.ts`: `roomsFromMap` (Attribut `rooms` der Karten-Kamera → sichtbare Räume, sortiert nach App-`order`, dann ID; Name = custom_name ?? name, deutsch über ROOMS_DE bei „Raumnamen = Deutsch“), `shortName` („…zimmer“ → Stamm + „z.“, ≤ 7 Zeichen unverändert, sonst 6 + „.“ – ergibt für Heidi exakt die v1-Kurznamen), `roomIcon` (Stichworttabelle de/en, sonst Symbol der Integration außer dem generischen home-outline, sonst Grundriss). `ha/profile.ts`: `readProfile` (Räume, `roomIds`, Optionen je Feld aus den globalen Selects, sonst aus dem ersten Raum-Select; `has(key)`), Rückfall ohne Karten-Kamera auf `select.<gerät>_room_N_cleaning_mode` (Name aus friendly_name). `memoizeSelector` nimmt ID-Listen als Funktion der Zustände (`ids(states)`), damit Selektoren ihre Raum-Selects aus dem Profil ableiten (`readAllRoomValues`, `readMap`, `readDiagnostics`); Raumwert-Selektoren entstehen je ID beim ersten Zugriff. `ROOM_IDS` und `config.ROOMS` entfernt; `RoomId = number`; `robotIds(roomIds)`/`allContractIds(roomIds)`; `roomLabel`, `stripModel`, `estimate` bekommen die Raumliste als Parameter; `dx-hero`/`dx-auftrag` `.roomOrder`; Kacheln (`dx-map-card`, `dx-quickstart`) als `repeat(auto-fill, minmax(96px, 1fr))` statt fester 7/8 Spalten. **Sichtbare Änderung:** Räume erscheinen jetzt in der App-Reihenfolge (Bad, Küche, Wohnz., Schlafz., Flur, WC, Büro) statt 7..1 – „Alles“/Schnellstart starten in dieser Reihenfolge (Herbert kann sie in der App ändern). Nebenbefund beim Umbau: Tipp-Handler der Kacheln nutzten die beim Rendern eingefrorene Auswahl (zwei Tipps vor dem Re-Render verloren den ersten) → `this._sel`. Mehrere Karten: die Karten-Kamera zeigt die Räume der gewählten Karte (`select.<gerät>_selected_map`), das Profil folgt automatisch; Planer-Einträge speichern Raum-IDs ohne Kartenbezug (Grenze, Stufe 4). Kurzformat der Raumwerte (`parseRaum`) akzeptiert IDs > 7 (v1-Vektor „ungültige Raum-ID 9“ als PD-013 markiert, Verhalten in `raumwerte.spec.json`). Grenze: `input_text` fasst 255 Zeichen → Raumwerte je Eintrag für ~25 Räume; Editor 4.5 muss das prüfen. Tests: `profile.test.ts` (Kurznamen/Symbole, Heidi-Abzug, Optionen inkl. `mopping_after_sweeping`/`quick`, Fähigkeiten, 3 und 20 Räume, ohne Karte), `profile.js` (3 Räume mit verstecktem Balkon, Segmente [9, 5], „Alles“ in App-Reihenfolge, 20 Räume ohne horizontales Scrollen bei 1400/390 px, Roboter ohne Wischstation).

- [2026-09-15] [Regel] Befund · Info (Herbert, 23:55): Raum-Stammdaten des Roboters (select.<gerät>_room_N_name, _order, _visibility, _floor_material, _floor_material_direction) sind für die Karte **nur lesen** – sie werden in der App gepflegt; v2 schreibt je Raum ausschließlich die fünf Reinigungswerte (cleaning_mode, suction_level, mop_pad_humidity, cleaning_route, cleaning_times). Geprüft: kein Schreibzugriff auf _name in v1/v2/Paket/Skripten/Automationen. Herbert hat die sieben Räume um 23:50–23:53 über die HA-Selects auf die Standardtypen der App gestellt (Bad 6, Schlafzimmer 2, Flur 8, Büro 12, Küche 4, Wohnzimmer 1; WC bleibt benutzerdefiniert, die App hat keinen WC-Typ) – die Karte zeigt sie über ROOM_TYPES mit App-Namen und -Symbolen.

- [2026-09-16] [Heidi-Karte] Wunsch · Post-2.0 (Herbert, „merk dir das für später“): **Deutsche Raumnamen im Kartenbild trotz Standardtypen.** Befund: Die Integration zeichnet die Raumnamen bei Standardtypen aus ihrer englischen Liste ins Bild (SEGMENT_TYPE_CODE_TO_NAME, keine Sprachoption, de.json ohne Raumnamen); Text im Bild ist nicht bearbeitbar. Darum hatte Herbert in v1 benutzerdefinierte deutsche Namen gesetzt und damit Standardtyp und Sprachsteuerung verloren. Lösung, wenn gewünscht: (1) in der Integration die Kartenobjekte „Room Names“, „Room Icons“, „Room Name Background“ ausblenden (Optionen, Herbert), (2) dx-heidi-map zeichnet Symbol + deutschen Namen je Raum aus dem Profil (ROOM_TYPES) im Stil des Bildes, ohne dunkle Chips; die Übersichtskachel (compact) nutzt dann ebenfalls dx-heidi-map (nur lesen) statt picture-entity. Nebeneffekt: Dreame-App-/Xiaomi-Karte zeigen das Bild dann ohne Namen. Vorerst bleibt es beim englischen Bild (Herbert, 16.09.).

- [2026-09-16] [Plan] Wunsch · Post-2.0 (Herbert: „Wenn ich einen zweiten Roboter hinzufüge, muss ich alles manuell nochmal machen? Was, wenn ich das Dashboard weitergebe?“): Heute Handarbeit (Paket, Automationen, Skripte, configuration.yaml, Ressource, Datenkarte, Personen). Plan als Stufe 4 in `docs/dreame_x60/GERAETEPROFIL.md`: Paket-Vorlage mit Platzhaltern + `tools/setup.ps1` (Generator, heidi = erste Instanz, byte-gleich als Regressionstest), `docs/INSTALL.md` mit Prüfung über die Diagnose-Seite, Karte als HACS-Paket nach 6.5. Reihenfolge: nach 4.4/4.5. ClickUp-Task angelegt.

- [2026-09-16] [4.3e] Befund · Info (Herbert: „eine Statuszeile, rot wenn etwas nicht eingerichtet ist, Klick führt dorthin – über der Übersicht, nur wenn etwas nicht stimmt“): `domain/setup.ts` (reine Prüfliste `setupChecks`), `ha/setup-loader.ts` (nachgeladen über `hass.callWS`: `config/entity_registry/get` → `options.vacuum.area_mapping` = HA-Kern „Bereiche reinigen“ je Bereich die Segment-IDs `<map_index>_<raum>`, `vacuum/get_segments`, `repairs/list_issues`; Cache 5 min je Roboter; ohne callWS entfallen diese Prüfungen), `components/dx-setup.ts` (Symbolleiste + Befundzeilen; Sprung: more-info-Dialog, HA-Seite über `navigateHa`, Seite der Karte). Acht Prüfungen: Roboter erkannt, Paket vollständig, Roboter-Entitäten, Datenkarte, Angepasste Reinigung (im Lauf kein Befund), Raumtypen (benutzerdefiniert obwohl App-Typ mit diesem Namen existiert → Sprachsteuerung), Räume ↔ HA-Bereiche (nicht zugeordnete Räume mit Namen; Sprung in den more-info des Roboters mit Hinweis „Reinigung → Nach Bereich → Konfigurieren“, tiefer hat HA keine Adresse), Reparaturen (Domäne dreame_vacuum/vacuum, z. B. `segments_changed`). Befund dabei: HA speichert die Zuordnung nicht bei der Integration, sondern im Entitäts-Register des Staubsaugers samt `last_seen_segments`; Herbert hat am 16.09. alle sieben Räume zugeordnet (Bad, WC, Büro neu angelegt, Corridor → Vorraum). RoomInfo trägt jetzt `typed`. Grenze: HA-Seiten-Sprünge (`/config/integrations/integration/dreame_vacuum`, `/config/repairs`) sind Pfade des HA-Frontends und können sich mit HA-Versionen ändern.

- [2026-09-16] [4.3e] Befund · Cosmetic (Herbert, Sichtprüfung alpha.20: „Die Leiste ist zu klein. Würde nicht ein Symbol in der Kopfzeile reichen?“): Leiste über der Übersicht ersetzt durch einen **Knopf in der Kopfzeile** neben Uhr/Zuhause/Nicht stören (nur bei Befund, rot/gelb mit Zusammenfassung „2 Probleme, 1 Hinweis“, auf allen Seiten sichtbar); Klick öffnet den Dialog „Einrichtung“ (`dx-dialog` kind `setup`) mit der Symbolzeile und den Befunden samt „Öffnen“. Passt zur Idee „Kopfzeile als Einstieg“ (UX-TRANSITIONS.md). Version 2.0.0-alpha.21.

- [2026-09-16] [4.3e] Befund · Cosmetic (Herbert, Sichtprüfung alpha.21: „nicht ganz so gemeint – zwischen Guten Morgen und Uhrzeit nur Symbole in der jeweiligen Farbe, nur die mit Befund, Problem-Symbol pulsiert rot, Klick führt direkt dorthin“): Kopfzeilen-Knopf und Dialog wieder raus; stattdessen `.setupicons` zwischen Titel und Uhr mit je einem runden Symbol pro Befund (`.si.error` rot mit `dx-setup-pulse`-Ring, `prefers-reduced-motion` ohne Animation; `.si.warn` gelb), Tooltip/aria-label = Klartext, Klick = `runSetupAction` (more-info, `navigateHa`, Seite). Overlay-Art `setup` entfernt; `dx-setup` (Symbolzeile + Befundzeilen) bleibt als Baustein für die Diagnose auf der Seite Einstellungen (4.11). Version 2.0.0-alpha.22.

- [2026-09-16] [4.3e] Befund · Functional (Herbert: „Klick auf das rote Symbol führt nur zur Hauptkarte, nicht zur Raumzuordnung“): HA hat für die Unteransichten des more-info-Dialogs keine Adresse; sie werden nur über das Ereignis `show-child-view` im Dialog geöffnet (Frontend `show-view-vacuum-segment-mapping.ts`: viewTag `ha-more-info-view-vacuum-segment-mapping`, viewParams `{ entityId }`; die Ansicht „Bereiche reinigen“ ist `ha-more-info-view-vacuum-clean-areas` mit Header-Aktion `…-header-action`; Knopf im Control `more-info-vacuum`: `button.clean-areas-button`). `src/shared/ha-deep.ts` `openVacuumSegmentMapping`: more-info öffnen, Dialog im Schatten-DOM von `home-assistant` abwarten, wenn die Ansicht schon geladen ist (`customElements.get`) direkt `show-child-view` feuern; sonst HA über seine eigenen Knöpfe laden lassen (Bereiche-Knopf, dann Zahnrad); jeder Schritt mit Zeitlimit, bei Fehlschlag bleibt der Dialog offen und ein Toast nennt den Restweg. **Bewusste Ausnahme von Regel 12** (HA-interne Tags/Ereignisse), mit Rückfall; kann mit HA-Versionen brechen → beim HA-Update prüfen. Neue Aktionsart `vacuum-areas` in `domain/setup.ts`. Im Browser-Bereich ohne Anmeldung nicht geprüft – Sichtprüfung Herbert. Version 2.0.0-alpha.24.

- [2026-09-16] [4.3e] Befund · Functional (Herbert, alpha.24: „ich lande nicht ganz dort, eins tiefer beim Zahnrad“): Zweiter Schritt griff nicht – deepFind suchte nicht im eigenen Schatten-DOM des Header-Elements. Jetzt: nach Laden der Ansicht „Bereiche reinigen“ deren Methode `_openSegmentMapping()` aufrufen (dieselbe, die das Zahnrad ruft), sonst Zahnrad drücken; deepFind durchsucht auch das Schatten-DOM des Startelements. Version 2.0.0-alpha.25.

- [2026-09-16] [4.3e] Befund · Functional (Herbert, alpha.25: Tiefensprung landet richtig; „das Symbol verschwindet erst nach F5, und taucht erst nach F5 auf“): Einrichtungsdaten werden jetzt neu geladen, sobald HA `hass.entities` austauscht (Entitäts-Register geändert, z. B. Zuordnung gespeichert) und zusätzlich jede Minute mit dem Kopfzeilen-Takt (drei leichte WS-Abfragen) statt alle fünf Minuten. Frage Herbert „wäre es nicht einfacher über die Karteneinstellungen (Zahnrad im more-info)?“: Dort führt die Zeile „Zuordnung von Staubsauger-Abschnitten zu Bereichen“ zur selben Ansicht; der Weg wäre ein Schritt kürzer, aber ebenso HA-intern (Zeile per Text finden) – kein Gewinn, aktueller Weg bleibt. Version 2.0.0-alpha.26.

- [2026-09-16] [4.3e] Befund · Functional (Herbert, alpha.26: „bei Klick auf Speichern ist es nicht verschwunden, erst nach einer Minute“): `hass.entities` wechselt beim Speichern der Zuordnung nicht (Optionen sind nicht Teil der Anzeige-Register-Liste). Jetzt Abo auf den Bus-Ereignistyp `entity_registry_updated` über `hass.connection.subscribeEvents` (einmal je Verbindung, beim Trennen abgemeldet); bei Ereignis für den Roboter (oder ohne entity_id) sofort neu laden. Der Minutentakt und der `hass.entities`-Vergleich bleiben als Netz. E2E stellt das Ereignis über den Harness-Stub nach. Version 2.0.0-alpha.27.

- [2026-09-16] [4.3e] Befund · Functional (Herbert, Punkt 2: „warum sehe ich das Symbol in der Handy-App nicht?“): Bei Handybreite (Container app ≤ 760 px) war der ganze Meta-Block der Kopfzeile ausgeblendet, damit auch die Einrichtungssymbole. Jetzt werden nur Uhr/Zuhause/Nicht stören (`.mi`) ausgeblendet, die Symbole bleiben rechts neben dem Titel. E2E: setup.js 390 px (Symbol sichtbar, im Bild, Uhr weg), render.js angepasst. Version 2.0.0-alpha.28.

## 10a. Paritätsabweichungen (Register)

Jede gewollte Abweichung von v1 hat hier einen Eintrag. Ohne Eintrag mit Status `freigegeben`
ist eine Abweichung ein Fehler.

| id | bereich | v1 | v2 | grund | spec_test | Status |
|---|---|---|---|---|---|---|
| PD-016 | Auftrag-Kachel / Fortschritt | Kein Fortschrittsbalken (Kachel ist v2, PD-007; Balken bisher aus der Raumzählung) | Balken = `sensor.<gerät>_cleaning_progress` (Roboter-Prozent), solange verfügbar; sonst Raumzählung; Zeile „Räume x / n“ bleibt | Herberts Entscheidung beim Durchgehen der Roboter-Entitäten (17.09.): gleichmäßiger Fortschritt statt Sprung je Raum | `hero.js` (Fortschritt 37 % → Balken 37, Sensor `unavailable` → Balken aus der Raumzählung) | freigegeben (Herbert, 2026-09-17), umgesetzt 17.09. (alpha.31) |
| PD-015 | Roboter-Panel / Hinweis-Chip | Hinweis-Chip aus `sensor.heidi_error` mit vollem Text (gelb = Hinweis, rot = Fehler), Klick = more-info; kein Quittieren | Gleicher Chip, aber: Kurztext (höchstens zwei Wörter) im Chip, Langtext (Nummer + Erklärung aus ENTITAETEN.md „Warnungen und Fehler“) beim Verweilen als eigener Tooltip, am Handy über more-info; gelb (Warnung, 22 Codes, `has_error` false) zusätzlich mit ✕ = `button.press` auf `button.<gerät>_clear_warning`, nur wenn der Knopf verfügbar ist; rot (Fehler) ohne ✕ | Herberts Wunsch beim Durchgehen der Roboter-Entitäten (17.09.): Warnungen ohne Dreame-App quittieren; Mockup `dreame_x60/mockups/warnung.html` abgenommen 17.09. | `hero.js` (Warnung → ✕ sichtbar, Klick → genau ein `button.press`; Fehler → kein ✕; Knopf `unavailable` → kein ✕; Kurz-/Langtext), `i18n.test.ts` (Kurz- und Langtext je Code) | freigegeben (Herbert, 2026-09-17) |
| PD-000 | Navigation | eine Seite, Tabs Übersicht/Prognose, Einstellungen als Seitenleiste | Startseite + fünf Unteransichten (HA `subview`), Einstellungen als Seite | Herberts Wunsch; Layout, keine Fachlogik; Seitenschnitt laut Mockup 3.4: Übersicht mit Seitenleiste (Desktop) bzw. Tab-Leiste (schmal), Unterseiten Karte, Planer, Verlauf, Prognose, Einstellungen; Räume-Dialog aus der Navigation | `nav.js` | freigegeben (Herbert, 2026-09-14/15) |
| PD-004 | Karte | Karte + Raum-Chips + Knöpfe „Sperrzonen“/„Stühle am Boden“ auf der Karte | Segment Räume/Zone/Punkt + „Alles“, Knöpfe „Hinfahren“/„Sperrzonen“ unten links auf der Karte, Räume auch per Tipp in die Fläche wählbar, Stühle-Schalter als Zeile | Herberts Wunsch (Chat 14.09.); Bedienung, keine Fachlogik; dieselben Dienste | `map.js` | freigegeben (Herbert, 2026-09-14) |
| PD-005 | Startseite | Karte nur in der Übersicht mit allen Werkzeugen | Startseite zeigt die Karte immer als `compact` (links unter dem Kopf), Werkzeuge auf der Seite Reinigen; Automatik und Station rechts | Herberts Abnahme (Chat 14.09.); Layout, keine Fachlogik | `render.js`, `nav.js` | freigegeben (Herbert, 2026-09-14) |
| PD-001 | Editor | Live-Daten eingefroren bei offenem Editor | Kopf/Streifen aktualisieren sich, Draft bleibt | Folge des Render-Modells, nicht gewollt | `live-update.js` | freigegeben (Herbert, 2026-09-14) |
| PD-002 | Speichern | Fehler beim Speichern → Toast, Editor schließt | Teilfehler benannt, Editor bleibt offen | Regel 20 | `api.test.ts` Fehlerinjektion | freigegeben (Herbert, 2026-09-14) |
| PD-006 | Übersicht | keine Statistik-Kachel | Kachel „Statistik“: Balken der letzten 7 Tage aus `sensor.heidi_cleaning_history`, Summen aus `cleaning_count`/`total_cleaned_area`/`total_cleaning_time` | Designvorgabe Abschnitt 14; nur Anzeige vorhandener Sensoren, keine neue Fachlogik | `render.js` | freigegeben (Herbert, 2026-09-15) |
| PD-003 | Bestätigungen | `window.confirm` | `dx-dialog confirm` | Regel 13 | `dialog.js` | freigegeben (Herbert, 2026-09-14) |
| PD-011 | Karte | Dreame-App-/Xiaomi-Karte/Nur Bild | Vierte Kartendarstellung **„Heidi-Karte“**: Kartenbild der Integration + eigene Raumebene aus der Datenkarte (`camera.heidi_map_data`, neu im Vertrag), Tipp in die Raumfläche wählt den Raum pixelgenau, Auswahl gemeinsam mit den Raumkacheln; ohne fremdes Karten-Element. Neue Option im `input_select` (Paket + `HA_OPTIONS`) | Herberts Entscheidung (15.09.): Bau vorgezogen (Ausnahme von Regel 2), weil die Dreame-Karte hier keine Räume per Antippen wählt und die Xiaomi-Karte ungenau ist | `mapdata.test.ts`, `map.js` (Heidi-Karte) | freigegeben (Herbert, 2026-09-15) |
| PD-012 | Vertrag / alle Seiten | v1: `vacuum.heidi` und alle Roboter-IDs fest im Code, Anzeigename „Heidi“ fest | Roboter-IDs aus dem in HA erkannten Gerät (`device.ts`, Präfix-Muster der Integration), Anzeigename aus HA; Kartenoption `robot:` für mehrere Roboter. Paket-Helfer bleiben fest | Herberts Entscheidung (15.09.): vorgezogen (Ausnahme von Regel 2) – Umbenennen des Roboters in HA darf die Karte nicht zerlegen; Grundstein für andere Dreame-Modelle | `device.test.ts`, `device.js`, `contract.test.ts` | freigegeben (Herbert, 2026-09-15) |
| PD-013 | Räume / Optionen | v1: sieben Räume 7..1 fest mit Kurznamen und Symbolen, Optionslisten fest | Räume aus der Karte des Roboters in App-Reihenfolge (beliebig viele, versteckte weg), Kurzname/Symbol nach Standardregel, Optionen aus den Selects, Fähigkeiten aus dem Vorhandensein der Entitäten (Geräteprofil Stufe 2) | Herberts Entscheidung (15.09.): „Stufe 2 jetzt“, Karte muss mit 2, 6 oder 20 Räumen funktionieren | `profile.test.ts`, `profile.js`, `map.js` (App-Reihenfolge) | freigegeben (Herbert, 2026-09-15) |
| PD-014 | Kopfzeile | v1: keine Einrichtungsprüfung (nur Diagnose in den Einstellungen) | In der Kopfzeile zwischen Titel und Uhr nur die Symbole mit Befund (rot pulsiert, gelb = Hinweis, Tooltip = Klartext), Klick springt direkt zur Stelle: acht Prüfungen mit Symbolen (rot/gelb), Klartext und Sprung zur Stelle (more-info, HA-Seite, Seite Einstellungen); Bereichszuordnung und Reparaturen über `hass.callWS` | Herberts Wunsch (16.09.) nach der Zuordnung der Räume zu HA-Bereichen; neue Funktion (Ausnahme von Regel 2) | `setup.test.ts`, `setup.js` | freigegeben (Herbert, 2026-09-16) |
| PD-010 | Raumwerte im Lauf | Streifen und Raumwerte nur aus `select.heidi_room_N_*`; im Lauf (Selects unavailable) nichts | Rückfall auf die Kartendaten des Roboters (`camera.heidi_map` Attribut `rooms`: `cleaning_mode`, `suction_level`, `water_volume`, `cleaning_route`, `cleaning_times` als Zahlencodes, dieselbe Zuordnung wie Automation `heidi_laufprotokoll`), wenn das Modus-Select nicht verfügbar ist; Streifen, drei Werte und Auftrag-Kachel zeigen dann die echten Werte des Laufs. `AllRoomValuesView.vonKarte` nennt die Räume, deren Werte aus der Karte kommen – dort ist Schreiben nicht möglich (Räume-Dialog 4.6 zeigt den Hinweis) | Beim echten App-Lauf 15.09. 09:59 (Küche+Flur) waren Schalter und Modus-Selects unavailable, die Karte zeigte „–“ – Herbert: „es wird nichts angezeigt“. Nur Anzeige vorhandener Daten, gleiche Fachlogik (Codec, Streifen-Regeln) | `selectors.test.ts` (Fixture `states-driving.json`), `hero.js` | freigegeben (Herbert, 2026-09-15) |
| PD-009 | Kopf / Personen | Personen-Chips (Herbert, Nicole, Nina) und Nicht-stören-Chip im Kopf | Nicht mehr im Roboter-Panel `dx-hero` (dort nur Raum- und Hinweis/Fehler-Chip). Personen: Kopfzeilen-Meta „Zu Hause“ (Desktop/Tablet) und Zeile „Zu Hause“ mit Störer-Hinweis in der Kachel „Heute“ (4.10). Nicht stören: Kopfzeilen-Meta, Roboter-Einstellungen (4.7) und auf dem Handy als Zeile in „Heute“ | Herberts Entscheidung (15.09.): keine Roboter-Eigenschaften, auf breiten Bildschirmen doppelt zur Kopfzeile | `hero.js` (v1-Chips gefiltert), später `start.js`/`prognose.js` für „Heute“ | freigegeben (Herbert, 2026-09-15) |
| PD-008 | Wortwahl | „Mopps“ (Hinweis „Mopps reinigen“, Schätz-Schritte „Wäscht Mopps …“) | „Mopp“ („Mopp reinigen“, „Wäscht Mopp …“, Stationszeile „Mopp-Wäsche“); Backend-Phasentexte ebenfalls auf „Mopp“ (heidi.yaml, automations.yaml) | Herberts Wunsch (15.09.); nur Text | `status.test.ts`, `estimate.test.ts`, `hero.js` (Normalisierung der v1-Vorgaben) | freigegeben (Herbert, 2026-09-15) |
| PD-007 | Übersicht | Kopf mit Streifen, Karte mit Werkzeugen, Automatik-Einzeiler, Verschleiß, Station, Prognose-Kachel (3 Werte), Letzter Lauf | Bento-Raster nach `bento.html`: Kachel „Schnellstart“ (Raumkacheln → `vacuum_clean_segment` mit Bestätigung, wie die Raum-Chips in v1, nur neben der `compact`-Karte statt darauf), Kachel „Aktueller Auftrag“ im Lauf statt Automatik (Route, Minuten, Fläche, Räume x/7, nächster Raum – nur Attribute von `vacuum.heidi`), Kachel „Heute“ (heutiger Eintrag; Prognose-Zeilen nur bei aktiv; Homeoffice), „Letzte Läufe“ mit drei statt einem Eintrag, Planer-Kachel (drei Einträge, nur Anzeige), Kopfzeilen-Meta (Uhrzeit, Zu Hause, Nicht stören), Tagesgruß mit `hass.user.name` | Herberts Designvorgabe, Mockup abgenommen 15.09.; nur Anzeige vorhandener Werte und dieselben Dienste, keine neue Fachlogik. Ergänzt PD-005 (Karte bleibt `compact`, Werkzeuge auf Reinigen) und PD-006 | `render.js`, `nav.js`, `start.js` | freigegeben (Herbert, 2026-09-15) |

---

## 11. Freigabekriterien (Definition „fertig“)

### 11a. Definition „Modul fertig“ (seit 16.09.2026, Abschnitt 1a)

Ein Modul aus Abschnitt 1a gilt als fertig, wenn:

1. Alle Aufgaben des Moduls stehen in der Statusliste auf `fertig (Commit)`; `npm test` und `npm run lint` grün.
2. Jede Seite des Moduls ist bei 390 / 820 / 1200 px ohne horizontalen Überlauf geprüft (Playwright `widths` für die Seiten des Moduls + Sichtprüfung am Handy).
3. Die Paritätszeilen aus Abschnitt 9, die das Modul betreffen, sind abgehakt; jede Abweichung hat einen PD-Eintrag `freigegeben` (10a).
4. Doku nachgezogen: Statusliste, Abschnitt 10/10a, HANDOFF 3e; neue Entitäten in Abschnitt 4 + `contract.ts`.
5. Version eingespielt (`deploy.ps1 -OnlyCard`, Ressourcen-`?v=`), **Sichtprüfung Herbert** bestanden, ClickUp-Aufgaben auf `shipped`.
6. Offene Befunde des Moduls: keine `Blocker`/`Functional`; `Cosmetic`/`Post-2.0` als Task oder Notiz festgehalten.

Erst dann beginnt das nächste Modul. Die Kriterien 1–8 unten gelten weiterhin für die Freigabe von 2.0 (Modul G).

1. Paritäts-Checkliste (Abschnitt 9) vollständig, jede Zeile an v1 und v2 nebeneinander geprüft.
2. Alle `.v1.json`- und `.spec.json`-Vektoren grün, in TypeScript und Python.
3. E2E grün: Render aller Seiten mit beiden Fixtures, Navigation, Editor-Klickfolge, Round-Trip
   in beide Richtungen, Zonen, Zeitleiste, Live-Update bei offenem Editor, Teilfehler,
   `unavailable → available`, Render-Messung, drei Breiten ohne Overflow.
4. `npm run check` und `npm run lint` ohne Fehler.
5. Abschnitt 10 ohne offene `Blocker`/`Functional`; Abschnitt 10a ohne Eintrag im Status `offen`.
6. Geräte-Sichtung (6.3) erledigt.
7. ~~Sieben Tage Alltag mit v2 ohne offenen freigabeblockierenden Befund (6.4).~~ entfällt (v1 seit 15.09. aus; ersetzt durch die Sichtprüfung je Modul, 11a).
8. Version `2.0.0`, `heidi.yaml` zeigt auf v2, v1 als `heidi-panel-v1.js` archiviert,
   HANDOFF/CLAUDE.md beschreiben v2 (6.5).
