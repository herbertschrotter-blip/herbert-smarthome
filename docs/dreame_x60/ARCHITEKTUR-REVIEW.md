# Architektur-Review Heidi-Panel (Stand v1.6.0, 14.09.2026)

Unabhängiges Review der Heidi-Oberfläche (`ha/www/heidi-panel.js`, Dashboard, Paket, Skripte,
Automationen, Tests, Mockups). Grundlage ist der tatsächliche Code auf `main`, nicht die Doku.
Die Tests wurden für dieses Review ausgeführt (alle vier grün; `test-timeline.js` nur mit dem
Chromium-Pfad, den die anderen drei Tests bereits als Fallback haben).

---

## 0. Kurzfassung

- **Die Grundentscheidungen sind richtig**: eine eigene Karte statt Bastelei mit Standardkarten,
  Helfer + Template-Sensoren + Python-Skripte als Backend, Shadow DOM mit CSS-Variablen, eine
  einzige JS-Datei für HA, echte HA-Zustände als Test-Fixture.
- **Das Problem ist nicht die Dateigröße (123 KB, 1225 Zeilen), sondern drei strukturelle Dinge**:
  1. Das Render-Modell „bei jeder Änderung alles neu per `innerHTML`“ verträgt sich nicht mehr
     mit einer Oberfläche, die Dialoge, Slider, Scroll-Listen und eine eingebettete Kartenkarte
     hat. Sichtbare Folgen heute: der Editor friert alle Live-Daten ein, die Karten-Karte wird
     bei jedem Tick neu eingehängt, die Signaturliste muss von Hand gepflegt werden (und ist
     bereits unvollständig: `sensor.heidi_task_status` fehlt).
  2. Fachlogik existiert mehrfach in JS, Jinja und Python ohne gemeinsame Tests: Raumwerte-Kurzform
     4×, „Minuten bis Rückkehr“ 3×, Dauer-Schätzung 2×, Lauf-Erkennung (45-s-Regel) 2×.
  3. Die Tests können nicht fehlschlagen (kein Exit-Code), `npm test` lässt `test-timeline` aus,
     die Fixture kennt die Entitäten von v1.4–v1.6 nicht (`sensor.heidi_phase`,
     `sensor.heidi_lernwerte`, `input_text.heidi_planN_raumwerte`, `switch.heidi_customized_cleaning`).
- **Empfehlung**: ES-Module + esbuild (weiterhin eine `heidi-panel.js`), TypeScript zusammen mit
  der Modul-Trennung, **Lit** statt nacktem `HTMLElement`, **Custom Card behalten** (kein
  `panel_custom`), grobe Komponenten je Bereich (ca. 14, nicht 40), reine Fachlogik-Module mit
  Unit-Tests, eine dünne `HeidiApi`-Klasse für alle Service-Aufrufe, ein Layout mit Container
  Queries statt drei Oberflächen. Kein React, kein State-Framework, keine UI-Bibliothek.
- **Zuerst** (klein, sofort lohnend): Tests fehlschlagen lassen + Fixture erneuern; Build
  einführen, ohne eine Zeile Panel-Code zu ändern; Fachlogik in reine Module ziehen und testen.
  Erst danach Lit, Bereich für Bereich.

---

## 1. Bewertung der aktuellen Architektur

### Stärken (am Code belegt)

- **Richtige Aufteilung Server/Client.** Abgeleitete Zustände liegen in Template-Sensoren
  (`sensor.heidi_phase`, `sensor.heidi_heutiger_plan`, `sensor.heidi_automatik_status`) und werden
  von Automationen **und** Karte benutzt. Das ist genau das Muster, das die HA-Community empfiehlt
  („Karten rendern, Server rechnet“). Die Zeitleiste aus der Recorder-Historie von
  `sensor.heidi_phase` ist eine elegante Lösung ohne eigene Datenbank.
- **Persistenz über HA-Helfer** (`input_text`/`input_select`/…) statt eigener Integration: HA
  sichert, stellt wieder her, Automationen können lesen. Die Kurzform `1:B/T/V/-/2` ist pragmatisch
  für die 255-Zeichen-Grenze.
- **Signaturbasiertes Re-Render** (`_signature()`) ist die richtige Idee: HA schiebt bei *jeder*
  Zustandsänderung im Haus ein neues `hass`-Objekt hinein; ohne Filter würde die Karte permanent
  neu zeichnen.
- **Konsequentes `esc()`**, Event-Delegation über `data-*`, CSS-Variablen als Design-Tokens,
  `prefers-reduced-motion`, `focus-visible`, `aria`-Attribute an Schaltern – handwerklich sauber.
- **Tests mit echten Zuständen** (`real_states.json`) und Prüfung der erzeugten Service-Calls
  (`test-editor.js`) – das ist mehr, als die meisten Community-Karten haben.
- **Kartenkarte per `loadCardHelpers()` eingebettet** statt nachgebaut; Auswahl per Helfer.
- **Fachwortschatz auf Deutsch, Kommentare erklären das Warum** (45 s, 30 s, Startsequenz).

### Schwächen (am Code belegt)

| Befund | Stelle | Folge |
|---|---|---|
| Vollständiger `innerHTML`-Austausch von `#viewMain` bei jeder Signaturänderung | `_renderMain()` | Während eines Laufs ändert sich `vacuum.heidi.last_updated` laufend → gesamte rechte und linke Spalte werden neu gebaut, `<details>`-Zustand muss von Hand in `_open` gemerkt werden, Scrollposition von `.hist` geht verloren, ein Slider mitten im Ziehen wird ersetzt |
| Karten-Element wird bei jedem Render aus- und wieder eingehängt | `_mountMap()`: `cur.innerHTML = ""; cur.appendChild(this._mapEl)` | `disconnectedCallback`/`connectedCallback` der Dreame-Karte bei jedem Tick; unnötige Arbeit auf Tablet/Handy |
| Handgepflegte Liste von ~130 Entitäts-IDs | `_signature()` | `sensor.heidi_task_status` wird im Kopf benutzt, steht aber nicht in der Liste → Wechsel „Reinigt Räume/Zone“ wird erst beim nächsten anderen Ereignis sichtbar. Jede neue Funktion braucht einen Eintrag, den niemand erzwingt |
| Editor friert Live-Daten ein | `set hass`: `if (… && !this._editing && !this._zones)` | Bei geöffnetem Editor aktualisiert sich der Kopf nicht mehr; für das Räume-Untermenü im Roboter-Modus gibt es schon einen Sonderzweig – jedes weitere Overlay mit Live-Daten wird ein weiterer Sonderfall |
| Overlay-Zustand = fünf unabhängige Felder (`_est`, `_rooms`, `_editing`, `_zones`, `_panel`) mit impliziter Priorität | `_renderOverlay()`, `_closeOverlays()` | Reihenfolge der `if`-Zweige entscheidet, was sichtbar ist; „zurück zum Eintrag“ wird über `back`-Strings nachgebaut |
| Editor-Zustand halb im Objekt, halb im DOM | `_edClick()` liest `[data-ed="name"]` aus dem DOM zurück | Zwei Wahrheiten für denselben Wert |
| Ein Click-Dispatcher mit 35 Zweigen und gemeinsamem `data-*`-Namensraum | `_onClick()` | Reihenfolge ist Semantik: `data-rv` muss vor `data-room` geprüft werden, weil Raum-Knöpfe im Untermenü beide Attribute tragen |
| 20 direkte `callService`-Aufrufe im UI-Code, HA-Optionsnamen im Klick-Handler | `_rvClick()` (`inv(RV_HA)`, `"x"`-Suffix), `_saveEditor()` (16 Calls inline), `_onChange()` | Wissen über Entitäts-Namensschema ist über die Datei verstreut |
| Fachlogik mehrfach: Raumwerte-Codec in JS, Jinja (`heidi_reinigung`, `…_wiederherstellen`), Python (`parse_raumwerte`), Mockup-Harness; Rückkehr-Minuten in `_restMin()`, Paket-Attribut `detail`, Automation `rest_min`; Schätzung `_estimate()` ↔ `schaetzung()`; Lauf-Erkennung `_loadTimeline()` ↔ `split_runs()` | – | Kein Test stellt sicher, dass die Kopien gleich rechnen. Drift ist nur am echten Roboter sichtbar |
| Methoden von 4–6 KB in einer Zeile-Kette (`_editorHtml`, `_estHtml`, `_hero`, `_roomsHtml`) | – | Für KI-gestütztes Editieren (Cowork/Claude Code) besonders fehleranfällig: 40 Zeilen über 300 Zeichen, längste 593 |
| 55 Inline-`style=""` neben 266 Zeilen CSS | – | Zwei Styling-Wege, Layout-Anpassungen für Handy müssen beides berücksichtigen |
| Google Fonts werden in `document.head` injiziert | `_build()` | Externe Abhängigkeit, funktioniert offline/Companion-App ohne Internet nicht; globaler Seiteneffekt außerhalb des Shadow DOM |
| Tests ohne Fehlschlag-Signal, `npm test` ohne `test-timeline`, Fixture veraltet | `heidi/tests/*` | „Tests sind grün“ ist derzeit keine Aussage |
| Kein Werkzeug (kein `package.json` im Root, kein Lint, kein Build) | – | Nichts hindert Tippfehler, unbenutzte Variablen, doppelte Konstanten |

Zahlen zur Einordnung: 17 von 24 Commits ändern `heidi-panel.js`; die Datei ist der Ort, an dem
praktisch jede Funktion landet. Das ist kein Vorwurf, aber der Grund, warum sich Struktur jetzt
lohnt und nicht erst „später“.

---

## 2. Größte Risiken beim Weiterbauen ohne Umbau

1. **Render-Kosten steigen linear mit jeder Funktion.** Jeder Bereich, den du hinzufügst, wird bei
   jedem Roboter-Tick mitgebaut. Auf dem Handy in der Companion-App ist das schon heute spürbar
   wahrscheinlicher als am PC.
2. **Stille Stale-UI-Fehler** durch die Signaturliste (siehe `heidi_task_status`). Diese Fehler
   sieht man nicht im Test, nur im Alltag („warum steht da noch …?“).
3. **Jedes neue Overlay = neuer Sonderfall in `set hass`.** Die Einfrier-Logik ist eine Sackgasse:
   Live-Daten im Editor (z. B. „Akku jetzt 62 %“ neben der Schätzung) gehen so nicht.
4. **Drift zwischen JS/Jinja/Python.** Die Schätzung in der Karte und die in der Automatik können
   auseinanderlaufen, ohne dass es jemand merkt – und genau diese Zahl entscheidet, ob Heidi
   fährt.
5. **Regressionen in feingetunter Logik** (45 s, 30 s, Startsequenz, Türschwellen-Flackern) sind
   nur mit Playwright und nachgebauter Historie prüfbar. Diese Regeln werden weiter justiert
   werden; ohne Unit-Tests wird jede Justierung zum Blindflug.
6. **Editieren wird teurer.** Bei 500-Zeichen-Zeilen ist ein `edit_block` schnell daneben; der
   Handoff dokumentiert bereits Werkzeugprobleme beim Schreiben großer Dateien.
7. **Die Tests täuschen Sicherheit vor**, solange sie nicht fehlschlagen können.

Keines dieser Risiken ist ein „es bricht morgen“. Zusammen bedeuten sie: jede weitere Funktion
kostet mehr als die vorige, und Fehler werden später und am Roboter statt im Test gefunden.

---

## 3. Bewertung der 14 Optionen

| # | Option | Urteil | Begründung |
|---|---|---|---|
| 1 | Monolith behalten, intern strukturieren | **Nur als Zwischenschritt** | Ohne Module gibt es keine Unit-Tests für die Fachlogik, und das Render-Modell bleibt. `button-card` ist das abschreckende Beispiel eines „intern strukturierten“ 2000-Zeilen-Monolithen |
| 2 | ES-Module | **Ja, jetzt** | Voraussetzung für alles Weitere; Fachlogik wird ohne Browser testbar; KI-Edits werden lokal |
| 3 | TypeScript | **Ja, zusammen mit der Fachlogik-Trennung** | Das Projekt ist Datenabbildung (Entitäts-IDs, Optionsstrings, Kurzcodes) – genau das, was TS fängt. Mit esbuild kostet TS keine Konfiguration. Nicht als eigenes Migrationsprojekt, sondern beim Herausziehen der Domänen-Typen (`Plan`, `RoomValues`, `Estimate`, `LearnValues`) |
| 4 | Lit | **Ja** | Löst exakt das Kernproblem (Render-Modell). Standard in HA-Frontend und den meisten gepflegten Karten (Mushroom, mini-graph-card, xiaomi-vacuum-map-card; die dreame-vacuum-map-card ist die React-Ausnahme). ~6 KB, wird mit eingebündelt |
| 5 | Eigene Web Components je Bereich | **Ja, grob** | Ca. 14 Elemente, keine Chip/Tile/Ring-Elemente (das bleiben Template-Funktionen + CSS) |
| 6 | State-/ViewModel-Schicht | **Ja, als reine Funktionen** | `readPlan(states, n)`, `readRobot(states)` … existieren implizit schon (`_planRead`, `_roomVals`, `_lern`, `_histAttrs`). Kein Store-Framework – `hass` *ist* der Store |
| 7 | Service-/Controller-Schicht | **Ja, dünn** | Eine Klasse `HeidiApi` mit ~12 Methoden. Testbar, einziger Ort für Entitäts-Namensschema |
| 8 | CSS modularisieren | **Ja, mit der Komponententrennung** | Tokens zentral, Basis-Styles geteilt, Rest je Komponente in `static styles` |
| 9 | Build (Vite/Rollup/esbuild) → eine Datei | **Ja, esbuild** | Ein Befehl, keine Konfiguration, TS inklusive. Vite ist für ein Bauteil ohne Dev-Server überdimensioniert; Rollup ist das Community-Übliche, aber mehr Konfiguration für denselben Output |
| 10 | Full-Width Custom Card | **Ja, behalten** | Siehe 11 |
| 11 | `panel_custom` | **Nein** | Bringt `narrow`/`route`, kostet `configuration.yaml`-Registrierung + Neustart und verhindert, dass Teile später im allgemeinen Dashboard als Karten landen. Die YAML-`panel`-View liefert schon volle Breite und Sidebar-Eintrag |
| 12 | Teile auf Standard-Lovelace-Karten zurückbauen | **Nein** | Nur Verschleiß (5 Gauge) und Station (Tiles) wären Kandidaten – Ergebnis: zwei Design-Sprachen, Verlust der Glas-Optik, kein Gewinn an Wartbarkeit |
| 13 | React / Lit / Vanilla | **Lit** | React braucht eine Brücke zu Web Components, +40 KB, macht sonst niemand im HA-Umfeld. Vanilla behält das Render-Problem oder erfordert ein eigenes Diffing |
| 14 | Vollständige Modularisierung = Overengineering? | **Teilweise ja** | Siehe Abschnitt 14: nicht mehr als ~14 Elemente, kein Store, keine UI-Bibliothek, kein Monorepo |

---

## 4. Empfohlene Zielarchitektur

```
Home Assistant (hass.states, callService, callApi, Recorder)
        │
        ▼
src/ha/selectors.ts      ← reine Funktionen: states → typisierte Sichten (Plan, Robot, RoomValues, LearnValues, History)
src/ha/api.ts            ← HeidiApi: alle Service-/API-Aufrufe (startPlan, savePlan, cleanRooms, setZones, loadHistory …)
        │                  (kennt Entitäts-Namensschema; einziger Ort mit callService)
        ▼
src/domain/*.ts          ← reine Fachlogik ohne DOM und ohne hass: raumwerte (Codec), estimate, timeline, calibration, labels, status
        │
        ▼
src/components/*.ts      ← Lit-Elemente je Bereich; bekommen `hass` (oder fertige Sichten) als Property, rufen HeidiApi
        │
        ▼
src/heidi-panel.ts       ← Shell: Layout, Tabs, Overlay-Routing, Update-Gating (shouldUpdate über relevante Entitäten)
        │
        ▼  esbuild
ha/www/heidi-panel.js    ← genau eine Datei, wie heute; deploy.ps1 unverändert
```

Ist das „unnötige Abstraktion“? Für eine 300-Zeilen-Karte ja. Hier nicht, weil jede Schicht
bereits **existiert, nur vermischt**: `_planRead`/`_roomVals`/`_lern` sind Selektoren,
`_saveEditor`/`_rvClick`/`_zonesAction` sind API, `_estimate`/`_calib`/`_loadTimeline`-Mitte sind
Domäne. Die Trennung fügt keine Konzepte hinzu, sie gibt vorhandenen Konzepten Dateien.

Was **nicht** dazugehört: ein Event-Bus, ein Store mit Reducern, Dependency Injection, ein
Plugin-System. `hass` kommt als Property herein, Lit rendert, fertig.

### Update-Gating ohne Handliste

Ursprünglicher Vorschlag: Signaturliste durch eine aus den Selektoren deklarierte ID-Menge
ersetzen und in `shouldUpdate` nur diese Zustände vergleichen. **Entscheidung nach ChatGPT-Review
Runde 1 (Herbert):** kein globales `shouldUpdate` ab Tag 1. Lit-Reaktivität zuerst, `hass` und
Views nach unten reichen, in Phase 4 messen (Bauplan-Aufgabe 4.12) und nur dort gezielt gaten,
wo es messbar nötig ist (Karten-Element-Cache, Zeitleiste). Selektoren führen ihre `entityIds`
weiterhin, aber für Dokumentation und Tests: ein Test prüft, dass jede gelesene ID in der Menge
steht, so kann keine Entität mehr „vergessen“ werden. Claudes Einwand (neue View-Referenzen bei
jedem `hass`-Update lassen alle Kinder rendern) ist als Messfrage in 4.12 festgehalten.

### Overlays als ein Zustand

Statt fünf Feldern: `overlay: null | {kind:"settings"} | {kind:"editor", n} | {kind:"rooms", mode, n, back} | {kind:"estimate", n, cmp, back} | {kind:"zones", …}` – ein Feld, eine
Reihenfolge, ein `close()`. Das Räume-Untermenü im Roboter-Modus bekommt Live-Daten automatisch,
weil Lit nur die betroffenen Knoten aktualisiert und der Editor-Dialog seinen Zustand als
Property hält statt im DOM.

---

## 5. Beispielhafte Ordner-/Dateistruktur

```
herbert-smarthome/
├─ package.json                 (root: build, test, lint)
├─ tsconfig.json                (strict, allowJs für die Übergangszeit)
├─ heidi/
│  ├─ src/
│  │  ├─ heidi-panel.ts         Shell, customElements.define, window.customCards
│  │  ├─ config.ts              E (Entitäten), ROOMS, OPT, APP_SCENES, Konstanten (unverändert übernommen)
│  │  ├─ version.ts             wird beim Build aus package.json gesetzt
│  │  ├─ ha/
│  │  │  ├─ types.ts            minimales HomeAssistant-Interface (states, callService, callApi) – keine externe Abhängigkeit nötig
│  │  │  ├─ selectors.ts        readPlan, readRobot, readRoomValues, readLearn, readHistory, readPrognose (+ jeweils entityIds)
│  │  │  └─ api.ts              class HeidiApi
│  │  ├─ domain/
│  │  │  ├─ raumwerte.ts        parseRaum / encodeRaum / RV-Tabellen
│  │  │  ├─ estimate.ts         estimate(), rate(), chargeMin(), restMin(input)
│  │  │  ├─ timeline.ts         runsFromVacuumHistory(), timelineRows() (45 s / 30 s / Flackern)
│  │  │  ├─ calibration.ts      affine Abbildung aus calibration_points
│  │  │  ├─ status.ts           big/sub/Knöpfe aus vac-Zustand + Phase + Task
│  │  │  └─ labels.ts           dayLabel, roomLabel, fmtMin, fmtDate
│  │  ├─ components/
│  │  │  ├─ heidi-hero.ts       Kopf: Ring, Status, Chips, Knöpfe, Streifen
│  │  │  ├─ heidi-map-card.ts   Kartenslot (loadCardHelpers), Raum-Chips, Zonen-/Stühle-Knopf
│  │  │  ├─ heidi-consumables.ts
│  │  │  ├─ heidi-automatik.ts
│  │  │  ├─ heidi-planer.ts     Liste der 4 Einträge + App-Szenen
│  │  │  ├─ heidi-planer-editor.ts
│  │  │  ├─ heidi-clock-picker.ts   (eigener Zustand h/m → eigenes Element lohnt sich)
│  │  │  ├─ heidi-rooms-dialog.ts
│  │  │  ├─ heidi-estimate-dialog.ts  (inkl. SVG-Diagramm)
│  │  │  ├─ heidi-prognose-card.ts, heidi-prognose-view.ts
│  │  │  ├─ heidi-station.ts
│  │  │  ├─ heidi-history.ts    Letzter Lauf + Protokoll + Zeitleisten-Zeilen
│  │  │  ├─ heidi-robot-settings.ts
│  │  │  ├─ heidi-settings-panel.ts
│  │  │  ├─ heidi-zones-editor.ts
│  │  │  └─ heidi-dialog.ts     gemeinsamer Rahmen (Scrim, Box, Kopf, Fuß, Escape)
│  │  ├─ shared/
│  │  │  ├─ templates.ts        chip(), tile(), seg(), ring(), icon() als lit-html-Funktionen
│  │  │  └─ toast.ts
│  │  └─ styles/
│  │     ├─ tokens.css.ts       --bg, --accent … (dunkel/hell)
│  │     ├─ base.css.ts         button, .card, .btn, .chip, .seg, .tiles …
│  │     └─ (Rest je Komponente in `static styles`)
│  ├─ tests/
│  │  ├─ unit/                  node --test: raumwerte, estimate, timeline, calibration, selectors, api
│  │  ├─ e2e/                   Playwright: render, editor, zones, timeline (wie heute, nur mit Exit-Code)
│  │  ├─ fixtures/
│  │  │  ├─ states-docked.json  (aktuelles real_states.json, erneuert)
│  │  │  ├─ states-cleaning.json
│  │  │  ├─ raumwerte.vectors.json   gemeinsame Testvektoren für JS und Python
│  │  │  └─ estimate.vectors.json
│  │  └─ harness.ts             ha-icon-Stub, loadCardHelpers-Stub, hass-Mock (heute 4× kopiert)
│  └─ mockups/                  unverändert
├─ ha/www/heidi-panel.js        Build-Ergebnis, weiterhin eingecheckt (deploy.ps1 bleibt gleich)
└─ ha/prognose/tests/test_runlog.py   pytest gegen dieselben Vektoren
```

---

## 6. Vanilla JS vs. TypeScript

**TypeScript, eingeführt beim Herausziehen der Fachlogik – nicht davor, nicht als Selbstzweck.**

Begründung am Code: Die Fehlerklasse dieses Projekts ist „falscher String“: `heidi_nicht_stoeren`
vs. `heidi_nicht_storen`, `"1x"` vs. `"1"`, `Turbo` vs. `turbo`, `attr(id, undefined)` ist falsy,
Kurzcodes `S/B/W`. Ein Typ `RoomValues = { modus: Modus; saug: Saugstufe; … }` und
`type Modus = "Saugen" | "Saugen + Wischen" | "Nur Wischen"` fängt genau das zur Build-Zeit.
esbuild transpiliert TS ohne Konfiguration; `tsc --noEmit` als Test-Schritt liefert die Prüfung.
`allowJs: true` erlaubt, Datei für Datei umzustellen.

Wenn du TS bewusst nicht willst: JSDoc-Typen mit `checkJs` geben ~70 % des Nutzens ohne neue
Syntax. Das wäre die zweitbeste Wahl, nicht die schlechteste.

---

## 7. HTMLElement vs. Lit vs. React

**Lit.**

- Das konkrete Problem (Abschnitt 1) ist das Render-Modell. Lit rendert deklarativ mit
  Knoten-Diffing: Fokus, Scroll, Slider-Zug, das eingebettete Karten-Element bleiben erhalten;
  `<details open>` wird zu `?open=${…}`; `data-*`-Dispatch wird zu `@click=${…}` an der Stelle,
  wo das Element steht.
- Es ist der Stack des HA-Frontends selbst und der meisten gepflegten Karten (Mushroom,
  mini-graph-card, xiaomi-vacuum-map-card). Beispiele, Fragen und Muster passen direkt.
- Reaktives Gating: `shouldUpdate(changed)` vergleicht alte/neue `hass` nur für die relevanten
  Entitäten – dieselbe Idee wie heute, nur automatisch aus den Selektoren.
- Kosten: Bündeln nötig (daher Build zuerst), ~6 KB, Lernkurve klein (Templates sind
  Template-Literals wie heute, nur mit `html\`\`` statt String).

Nackter `HTMLElement` bleibt eine Option nur, wenn du das Replace-Modell bewusst behalten willst –
dann aber mit den bekannten Kosten. React: Web-Component-Brücke, größere Bundles, `hass` als
Prop-Drilling durch eine fremde Welt; im HA-Umfeld unüblich. Nein.

---

## 8. Custom Card vs. `panel_custom`

**Custom Card in der YAML-`panel`-View behalten.**

- Der entscheidende Grund (nach ChatGPT-Review Runde 1 geschärft): **Heidi braucht nichts, was
  `panel_custom` rechtfertigt.** Die `panel`-View liefert volle Breite, Sidebar-Eintrag und keine
  Bearbeitungs-Leiste, und hält Heidi in der normalen Dashboard-Infrastruktur mit der kleinsten
  Integrationsfläche.
- `panel_custom` bringt `narrow`, `route` und eine eigene URL; dafür Registrierung in
  `configuration.yaml` (Neustart bei jeder Änderung) und ein Panel lässt sich nicht in ein
  anderes Dashboard einbetten. Keiner dieser Vorteile wird gebraucht.
- Einbettbarkeit von Teilen ins spätere allgemeine Dashboard ist **kein** Hauptargument mehr:
  interne Lit-Elemente einer Vollbild-Karte sind nicht automatisch gute Lovelace-Karten.
  Wiederverwendung ist deshalb auch kein Designziel für v2.
- Unter-Ansichten (Prognose-Tab) bleiben internes Routing; wenn du irgendwann echte URLs willst
  (`/heidi/planer`), ist `panel_custom` der Weg – aber das ist kein aktuelles Bedürfnis.
- Unabhängig von der Wahl: Safe Areas (Notch, Home-Indikator) in der Companion-App gehören in
  die Abnahme.

---

## 9. Welche Komponenten getrennt werden sollten

| Bereich | Eigenes Element? | Begründung |
|---|---|---|
| Hero (Ring, Status, Chips, Knöpfe, Streifen) | **Ja** | Ändert sich am häufigsten; Kandidat für das allgemeine Dashboard; enthält `status.ts`-Logik |
| Map (Slot + Raum-Chips + Zonen-/Stühle-Knopf) | **Ja** | Verwaltet das fremde Karten-Element; braucht eigenen Lebenszyklus (`firstUpdated`, Kartenwechsel) |
| Room Selector (Chips unter der Karte) | **Nein**, Teil von Map | Eigener Zustand `_selRooms` ist klein; Trennung nur, wenn er anderswo gebraucht wird |
| Planner (Liste) | **Ja** | Kandidat für das allgemeine Dashboard (kompakte Variante) |
| Planner Editor | **Ja** | Größter Dialog, eigener Zustand; Uhr als eigenes `heidi-clock-picker` |
| Räume-Dialog | **Ja** | Zwei Modi (Roboter/Eintrag), Live-Daten im Roboter-Modus |
| Dauer & Akku | **Ja** | SVG-Diagramm + Zusammenfassung; nutzt `estimate.ts` |
| Forecast (Karte + Tab) | **Ja, zwei Elemente** | Kachel-Karte und Tab-Ansicht sind unterschiedliche Layouts derselben Daten |
| Consumables | **Ja** | Klein, aber abgeschlossen; Kandidat fürs allgemeine Dashboard |
| Station | **Ja** | dito |
| History (Statistik + Protokoll + Zeitleiste) | **Ja, ein Element** | Zeitleisten-Zeilen sind ein Template im selben Element; `timeline.ts` liefert die Zeilen |
| Robot Settings | **Ja** | Eigenständiger `<details>`-Block |
| Settings-Panel | **Ja** | |
| Zonen-Editor | **Ja** | Pointer-Events, SVG, `calibration.ts` |
| Dialog-Rahmen | **Ja, ein `heidi-dialog`** | Scrim/Box/Kopf/Fuß/Escape ist heute 4× kopiert |
| Chip, Tile, Ring, Segmented Control, Toast | **Nein** | Template-Funktionen + geteiltes CSS. Als Elemente wären sie Overhead ohne Nutzen |

Ergebnis: ~14 Elemente + 1 Dialog-Rahmen. Feiner wäre zu kleinteilig.

### Wiederverwendung

- **Innerhalb Heidi**: `heidi-dialog`, `shared/templates.ts` (chip/tile/seg/ring), `tokens`,
  `HeidiApi`, Selektoren. Das ist die Wiederverwendung, die sich heute schon auszahlt.
- **Für das spätere allgemeine Dashboard**: nur `heidi-hero`, `heidi-planer` (kompakt),
  eventuell `heidi-consumables`/`heidi-station`. Bau sie so, dass sie `hass` + minimale Config
  bekommen – und registriere die `custom:`-Typen **erst, wenn das Dashboard sie braucht**. Keine
  universelle UI-Bibliothek: die Glas-Optik ist Heidi-spezifisch; ob das allgemeine Dashboard
  dieselbe Sprache spricht, ist eine offene Designfrage, nicht eine Codefrage.

---

## 10. State-/Service-/Businesslogik-Trennung

Ja, der aktuelle Code vermischt alle fünf Dinge – das ist die Hauptaussage dieses Reviews.
Beispiele:

- `_rvClick()`: UI-Event → Editor-Zustand **oder** sofortiger Service-Call mit HA-Optionsnamen
  (`inv(RV_HA)[v]`, `v + "x"`) → Toast. Drei Schichten in 12 Zeilen.
- `_hero()`: liest 8 Entitäten, leitet „groß/klein“-Text ab (Fachregel), baut HTML, kennt die
  Service-Namen der Knöpfe.
- `_loadTimeline()`: REST-Aufruf, Lauf-Segmentierung (Fachregel mit 4 Schwellen), Glättung,
  Cache, Re-Render-Auslösung.
- `_saveEditor()`: Validierung, 16 Service-Calls, Kodierung, Overlay schließen.

Zielbild (konkret, keine Theorie):

```ts
// domain/estimate.ts – kein hass, kein DOM
export function estimate(plan: Plan, lern: LearnValues, opts: {variante, uniform?, batt0, sequence}): Estimate

// ha/selectors.ts – nur lesen
export function readPlan(states: States, n: 1|2|3|4): Plan
export const planEntityIds = (n) => [...]

// ha/api.ts – nur schreiben
class HeidiApi { constructor(private hass) {}
  savePlan(n, plan: Plan) { /* die 16 Calls */ }
  setRoomValue(roomId, key, value) { /* kennt "x"-Suffix und RV_HA */ }
  cleanRooms(ids) …  startPlan(n, variante) …  setZones(zones, noMops) …  history(start, end) … }

// components/heidi-rooms-dialog.ts – nur UI
@click=${() => this.api.setRoomValue(id, k, v).then(() => toast("Gesetzt"))}
```

### Mehrfach-Implementierungen über Sprachgrenzen

Das löst kein JS-Umbau. Empfehlung „ein Eigentümer je Regel“:

| Regel | heute | Empfehlung |
|---|---|---|
| Minuten bis Rückkehr | JS `_restMin`, Jinja Paket (`detail`), Jinja Automation (`rest_min`) | **Ein Eigentümer: Jinja.** `sensor.heidi_automatik_status` bekommt Attribute `rest_min` und `rest_quelle`; Automation und Karte lesen `state_attr`. Die JS-Kopie verschwindet |
| Raumwerte-Kurzform | JS, Jinja (2 Skripte), Python, Mockup | Bleibt mehrsprachig (jede Seite braucht sie), aber **gemeinsame Testvektoren** `raumwerte.vectors.json`, die Unit-Test (JS) und pytest (Python) beide durchlaufen. Jinja bleibt ungetestet – dafür so simpel wie möglich halten |
| Dauer-Schätzung | JS `_estimate`, Python `schaetzung` | Beide nötig (Karte interaktiv, Automatik serverseitig). **Gemeinsame Testvektoren** mit erwarteten `total`/`charges`. Zusätzlich: Python schreibt seine Schätzung des heutigen Eintrags als Attribut in `sensor.heidi_lernwerte` → die Karte kann „Automatik rechnet 102 min“ anzeigen und Abweichungen werden sichtbar |
| Lauf-Erkennung (45 s) | JS `_loadTimeline`, Python `split_runs` | Gleiche Konstanten in beiden, gleiche Testvektoren (Zustandsfolge → Läufe) |
| Statustexte | JS `STATUS_DE`, Jinja `heidi_phase` | Karte zeigt `sensor.heidi_phase`; `STATUS_DE` ist nur Fallback – so lassen, klein halten |

---

## 11. Desktop / Tablet / Smartphone

**Eine Oberfläche, dieselben Komponenten, Container Queries in den Komponenten, Media Queries nur
für die Spaltenaufteilung der Shell. Keine getrennten Views.**

Warum Container statt Viewport: Auf einem Tablet mit angedockter HA-Seitenleiste ist der
Viewport 1024 px breit, die Karte aber ~770 px. Die heutigen `@media (max-width: 900px)`-Regeln
sehen 1024 und wählen das Zweispalten-Layout, obwohl der Platz fehlt. Und dieselbe `heidi-hero`
wird später im allgemeinen Dashboard in einer schmalen Spalte stehen – da hilft nur die
Containerbreite. Container Queries sind in allen Browsern verfügbar, die HA 2026 unterstützt.

Konkret:

- Shell: `.grid` 2 Spalten ab ~880 px Containerbreite (`container-type: inline-size` auf `.wrap`),
  sonst eine Spalte in einer festgelegten Reihenfolge (Hero, Karte, Planer, Automatik, Station,
  Verschleiß, Prognose, Verlauf).
- Komponenten: `@container (max-width: 480px)` für Raum-Raster 7→4, Verschleiß 5→3, Tiles 4→2,
  Zweispalt-Editor → einspaltig. Das ersetzt die 12 heutigen Media Queries eins zu eins.
- Dialoge: auf schmalen Containern als Bottom-Sheet (unten angedockt, volle Breite, Scroll im
  Inhalt, Fußleiste fix) statt zentrierter Box; ab Tablet wie heute. Ein `heidi-dialog` macht das
  einmal für alle.
- Protokoll-Liste: `max-height: 320px` mit innerem Scroll auf dem Handy durch „mehr anzeigen“
  (30 → alle) ersetzen; verschachteltes Scrollen ist auf Touch unangenehm.
- Varianten: genau eine geplante Property `dense` für `heidi-planer` (für das allgemeine
  Dashboard). Sonst keine Varianten – wenn sich eine Komponente auf dem Handy anders *verhalten*
  muss (nicht nur anders umbrechen), ist das der Moment für eine bewusste Entscheidung, nicht
  vorher.
- Touch: Ziel-Größen ≥ 40 px für Knöpfe im Streifen und in der Zeitleiste; `window.confirm`
  durch einen Bestätigungs-Dialog im `heidi-dialog` ersetzen (in der Companion-App ist `confirm`
  unschön, aber funktional – niedrige Priorität).
- Test: E2E-Render bei 390, 820, 1200 px Breite mit Prüfung „kein horizontales Scrollen“
  (`scrollWidth <= clientWidth`) und Screenshots als Sichtkontrolle.

---

## 12. Teststrategie

### Was heute gut ist

- Echte Zustände als Fixture, echte Klickpfade, Prüfung der Service-Calls (`test-editor.js`),
  nachgebaute Historie mit Grenzfällen (`test-timeline.js`: Startsequenz, Flackern,
  „unavailable“ während des Laufs). Das sind die richtigen Szenarien.

### Was fehlt

1. **Fehlschlag-Signal**: kein `process.exitCode = 1` bei „FEHLER“, kein `assert`. Heute ist jeder
   Lauf grün. `test-real.js` und `test-zones.js` prüfen nur „wirft nichts“.
2. `npm test` führt `test-timeline.js` nicht aus.
3. Fixture veraltet: 14 vom Panel gelesene Entitäten fehlen (u. a. `sensor.heidi_phase`,
   `sensor.heidi_lernwerte`, `input_text.heidi_planN_raumwerte`, `switch.heidi_customized_cleaning`,
   `binary_sensor.heidi_arbeitszeit`, alle `button.*`). Damit rendern Streifen, Dauer-Zeile,
   Raumwerte-Editor und Lernwerte in den Tests im Modus „keine Daten“. `tools/dump-states.ps1`
   existiert – die Fixture erneuern und Varianten anlegen (angedockt / reinigend).
4. Harness (ha-icon-Stub, `loadCardHelpers`-Stub, hass-Mock) ist viermal kopiert.
5. Keine Unit-Tests für die riskanteste Logik.
6. Keine Prüfung, dass die Update-Menge alle gelesenen Entitäten enthält.

### Nach der Modularisierung: Unit-Tests (`node --test`, ohne Browser)

- `raumwerte`: Codec-Roundtrip, Grenzfälle (`-`, ungültige ID, leere Felder), Testvektoren
  gemeinsam mit Python.
- `estimate`: feste Lernwerte → `total`, `charges`, `battEnd`; Varianten schnell/leise; Ersatzrate
  über Saugstufen-Faktor; Vergleich mit Python-Vektoren.
- `timeline`: Zustandsfolgen → Läufe (45 s, Startsequenz, 30 s veralteter Raum, A-B-A-Flackern,
  „läuft noch“).
- `calibration`: 3 Punkte → hin und zurück (Roundtrip innerhalb 1 mm).
- `status`: (vac, phase, task, autoLauf) → big/sub/Knöpfe (die Tabelle aus `test-timeline` wird
  zur Unit-Tabelle).
- `labels`: `dayLabel` (Mo–Fr, Sa+So, kompakt bei >3 Tagen), `fmtMin`.
- `selectors`: gegen die Fixture: `readPlan(states, 2)` liefert die erwarteten Werte; jede
  gelesene ID ist in `planEntityIds(2)`.
- `api`: `savePlan` erzeugt genau die 16 Calls (der Kern von `test-editor.js` wandert hierher und
  wird schnell und deterministisch).

### Weiterhin Playwright/E2E (wenige, aber echte)

- Render ohne Fehler mit beiden Fixtures bei drei Breiten (+ Overflow-Prüfung).
- Editor: öffnen, Räume/Tage/Uhr klicken, speichern → Calls (Integration von UI + api).
- Zonen: Rechteck zeichnen → Koordinaten (Pointer-Mathematik ist nur im Browser prüfbar).
- Zeitleiste: `callApi`-Mock → sichtbare Zeilen; Protokoll bleibt bei „unavailable“.
- Live-Update: Editor offen, `hass` mit neuem Akkuwert setzen → Kopf aktualisiert, Editor-Eingaben
  bleiben (der Test, der heute nicht bestehen kann).

### Python

- `pytest` für `runlog.py` (`split_runs`, `room_segments`, `lernwerte`, `schaetzung`) und
  `presence.py` gegen kleine CSV-Fixtures; dieselben Vektoren wie JS.

### Werkzeuge

- Root-`package.json`: `build` (esbuild), `test` (unit + e2e), `check` (`tsc --noEmit`), `lint`
  (ESLint mit `eslint-plugin-lit`, empfohlene Regeln – kein Prettier-Zwang).
- GitHub Actions mit `npm ci && npm run check && npm test` ist eine 20-Zeilen-Datei und lohnt
  sich, sobald Tests fehlschlagen können.

---

## 13. Schrittweiser Refactoring-Plan (Heidi bleibt jederzeit einsetzbar)

Jeder Schritt endet mit einer deploybaren `ha/www/heidi-panel.js`, grünen Tests und einem Commit.

| Schritt | Inhalt | Aufwand | Risiko |
|---|---|---|---|
| **0. Tests scharf stellen** | `process.exitCode = 1` bei jedem FEHLER; `test-timeline` in `npm test`; Harness in eine Datei; Fixture per `dump-states.ps1` erneuern + `states-cleaning.json` | 1–2 h | keins |
| **1. Build ohne Codeänderung** | `heidi/src/heidi-panel.js` = heutige Datei 1:1; esbuild `--bundle --format=esm --outfile=ha/www/heidi-panel.js`; Version aus `package.json` per `--define`; Tests laufen gegen das Build-Ergebnis; `deploy.ps1` liest die Version aus dem Banner-Kommentar | 1–2 h | minimal (Output ≈ Input) |
| **2. Fachlogik herausziehen** | `domain/raumwerte`, `estimate`, `timeline`, `calibration`, `status`, `labels` als TS-Module; Panel importiert sie; Unit-Tests + gemeinsame Vektoren mit Python; `rest_min` nach Jinja verlagern (Attribut) | 1–2 Tage | gering – reine Verschiebung, Tests belegen Gleichheit |
| **3. Selektoren und API** | `ha/selectors.ts`, `ha/api.ts`; `_saveEditor`, `_rvClick`, `_zonesAction`, `_onClick`-Service-Zweige rufen `HeidiApi`; `test-editor` prüft `api`-Calls | 1 Tag | gering |
| **4. Lit in die Shell, Bereiche einzeln** | Shell wird `LitElement`; alte String-Renderer werden übergangsweise mit `unsafeHTML(this._hero())` eingebettet – **das ist der Trick, der die Karte in jedem Zwischenstand funktionsfähig hält**. Reihenfolge nach Schmerz: Editor-Dialog (hebt das Einfrieren auf), History (Scroll), Hero, Map, Räume-Dialog, Dauer & Akku, Rest | 3–5 Tage verteilt | mittel – deshalb Bereich für Bereich mit Deploy dazwischen |
| **5. CSS aufteilen** | Tokens/Basis geteilt, Rest in `static styles`; Media → Container Queries; Bottom-Sheet im `heidi-dialog` | 1 Tag | gering |
| **6. Aufräumen** | Signaturliste durch `shouldUpdate` aus `entityIds` ersetzen; `data-*`-Dispatcher entfernen; Overlay-Zustand vereinheitlichen; Google-Fonts entweder lokal unter `/local/fonts/` oder System-Fonts | 1 Tag | gering |

Schritte 0–2 sind auch dann richtig, wenn du Lit nie einführst. Schritt 4 ist der einzige mit
echter Umbauarbeit, und er ist so geschnitten, dass jeder Bereich einzeln umzieht.

---

## 14. Was ich ausdrücklich nicht ändern würde

- Eine einzige `heidi-panel.js` als Ressource in HA, eingecheckt im Repo, `deploy.ps1` als Weg.
- YAML-Dashboard mit `panel`-View und einer Karte.
- HA-Helfer als Speicher für Planer-Einträge; Kurzform `1:B/T/V/-/2`. Keine eigene Integration.
- Template-Sensoren als Ort für abgeleitete Zustände (`heidi_phase`, `heutiger_plan`,
  `automatik_status`) – eher mehr davon (siehe `rest_min`).
- Python-Skripte für Prognose und Lernwerte, `command_line`-Sensoren als Schnittstelle.
- Zeitleiste aus der Recorder-Historie.
- Einbettung der Dreame-/Xiaomi-Karte per `loadCardHelpers` – die Karte nicht nachbauen.
- Shadow DOM, CSS-Variablen als Tokens, Dunkel/Hell über `input_boolean`, die Glas-Optik.
- `esc()`-Disziplin, deutsche Fachbegriffe im Code, erklärende Kommentare mit Zahlen.
- Der Signatur-Gedanke (nur automatisiert), das Fixture-Prinzip, die Mockup-Praxis
  (`build-live.js` bleibt sinnvoll und wird nach dem Umbau sogar einfacher, weil es dasselbe
  Bundle laden kann).

## 15. Was Overengineering wäre

- React/Preact/Vue, ein Store (Redux, MobX, Zustand), ein Event-Bus, Dependency Injection.
- Eine universelle UI-Bibliothek oder ein Design-System-Paket für das allgemeine Dashboard, bevor
  es dieses Dashboard gibt.
- Monorepo/Workspaces, Storybook, visuelle Regressions-Pipelines mit Pixel-Diffs.
- `panel_custom`-Migration, eigene HA-Integration in Python, WebSocket-Subscriptions statt `hass`.
- Mehr als ~15 Elemente; Chip/Tile/Ring/Seg als Web Components.
- Eine i18n-Schicht (die Oberfläche ist für einen Haushalt auf Deutsch).
- Feature-Flags, Plugin-Architektur, „Themes“ jenseits von Dunkel/Hell.
- Vite mit Dev-Server (die Karte läuft nur in HA; `build-live.js` ist der bessere Vorschau-Weg).

---

## 16. Vergleich mit der HA-Community

| Projekt | Stack | Was daraus für Heidi relevant ist |
|---|---|---|
| **HA-Frontend** (`home-assistant/frontend`) | TS + Lit, Rollup/Webpack | `hass` als Property nach unten reichen, abgeleitete Daten in `willUpdate`, keine globale Store-Schicht; Panels bekommen `narrow` – Karten eben nicht, daher Container Queries |
| **xiaomi-vacuum-map-card** (PiotrMachowski, MIT) | TS + Lit + Rollup, ein Bundle | Direkter Nachbar (du bettest sie ein). Gliedert in `src/` mit Modulen je Bereich, `shouldUpdate`-Gating. Deutlich mehr Code als Heidi braucht, aber der Beweis, dass der Stack für Saugroboter-UIs trägt |
| **dreame-vacuum-map-card** (noambergauz, MIT; **nicht** von Tasshack) | React 19 + TS + Vite + SASS, ein Bundle | Korrektur gegenüber der ersten Fassung dieses Reviews: die Karte ist React-basiert. Sie zeigt, dass React in einer Custom Card technisch geht, bringt aber die React-Laufzeit mit und ist ein Ein-Autor-Projekt (Stand 09/2026: ~110 Sterne). Für Heidi bleibt Lit die richtige Wahl; die Dreame-Karte wird nur eingebettet |
| **Mushroom** (piitaya) | TS + Lit + Rollup, Monorepo | Muster `src/ha/` (HA-Typen/Helfer), `src/shared/` (geteilte Templates), je Karte `card` + `editor`. Die Ordnerlogik ist übertragbar, die Monorepo-Größe nicht |
| **mini-graph-card** (kalkih) | JS + Lit + Rollup | Zeigt, dass eine mittelgroße Karte ohne TS auskommt – falls du TS ablehnst, ist das das Vorbild |
| **button-card** (RomRider) | TS + Lit | Der Gegenbeweis: ein 2000-Zeilen-Element, berüchtigt für schwere Wartung. Das ist Option 1 zu Ende gedacht |
| **ha-floorplan** | `panel_custom` | Der typische `panel_custom`-Fall: eigene URL, ganz eigene Welt, nicht einbettbar – genau das, was Heidi nicht braucht |

Gemeinsame Prinzipien, die Heidi übernehmen sollte: ein Bundle pro Karte; Lit; `hass` nach
unten, Events/Service-Calls über eine dünne Schicht; Update-Gating nach betroffenen Entitäten;
`getCardSize`/`getStubConfig` weiterhin. Prinzipien, die Heidi **nicht** braucht: Karten-Editor
(`getConfigElement`), Mehrsprachigkeit, HACS-Veröffentlichung, Theme-Variablen-Kompatibilität mit
fremden Themes.

---

## 17. Priorisierung

### Jetzt machen
1. Tests fehlschlagen lassen, `test-timeline` in `npm test`, Fixture erneuern (+ Variante
   „reinigend“), Harness einmal.
2. Root-`package.json` + esbuild; Panel unverändert als `heidi/src/heidi-panel.js`; Build →
   `ha/www/heidi-panel.js`.
3. Fachlogik in reine Module (raumwerte, estimate, timeline, calibration, status, labels) mit
   Unit-Tests; gemeinsame Testvektoren mit `runlog.py` (+ pytest).
4. `rest_min` als Attribut in `sensor.heidi_automatik_status`; JS- und Automations-Kopie entfernen.
5. `sensor.heidi_task_status` in die Signaturliste (Ein-Zeilen-Fix, bis Schritt 6 sie ersetzt).

### Später sinnvoll
6. `HeidiApi` + Selektoren, `test-editor` gegen die API.
7. Lit in der Shell, Bereiche einzeln umziehen (Editor zuerst).
8. TypeScript-Typen für Plan/RoomValues/Estimate/LearnValues (parallel zu 3 und 6 einführbar).
9. CSS-Tokens/Basis trennen, Container Queries, Bottom-Sheet-Dialoge, „mehr anzeigen“ im Protokoll.
10. `shouldUpdate` aus `entityIds`, Overlay als ein Zustand, Fonts lokal oder System.
11. GitHub Actions für `check` + `test`.
12. `custom:heidi-hero-card` / `heidi-planer` (dense) registrieren – erst wenn das allgemeine
    Dashboard sie will.

### Nicht notwendig
- `panel_custom`, React, Store-Bibliothek, UI-Kit, Monorepo, Storybook, Pixel-Diffs, Vite-Dev-Server,
  i18n, mehr als ~15 Elemente, Rückbau auf Standardkarten, eigene HA-Integration.

---

## 18. Wo ich deinen bisherigen Entscheidungen widerspreche

- **„Nur intern besser strukturieren“ reicht nicht.** Ohne Module keine Unit-Tests, ohne Lit
  bleibt das Render-Modell. Das ist der Punkt, an dem ich am deutlichsten anderer Meinung bin.
- **Der Editor darf Live-Daten nicht einfrieren.** Das ist heute eine bewusste Entscheidung
  (`/* Editor offen: nur Kopf still lassen */`), aber eine, die dem Render-Modell geschuldet ist,
  nicht dem Nutzer. Die Dauer-Schätzung im Editor rechnet mit dem Akku von vor dem Öffnen.
- **Eine JS-Kopie der Rückkehr-Regel ist falsch platziert.** Diese Regel entscheidet in der
  Automation; die Karte soll anzeigen, was die Automation *tatsächlich* rechnet, nicht dasselbe
  noch einmal nachrechnen.
- **Google Fonts im `document.head`** ist ein globaler Seiteneffekt außerhalb deiner Karte und eine
  Online-Abhängigkeit für eine Oberfläche, die im Heimnetz laufen soll.
- **`npm test` ohne Fehlschlag-Signal** ist schlechter als kein `npm test`, weil es Sicherheit
  vortäuscht. Das ist der billigste und wichtigste Fix in diesem Dokument.

Nicht widersprochen, obwohl es auf den ersten Blick so aussehen könnte: die Dateigröße an sich,
die Zahl der Helfer im Paket (viel, aber ehrlich und in HA sichtbar), die deutschen Bezeichner,
die Kurzform-Kodierung, das Einbetten fremder Karten.
