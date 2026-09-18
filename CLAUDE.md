# Herbert SmartHOME

Antworte auf Deutsch. Herbert ist Home-Assistant-Einsteiger: Schritte kurz, konkret, keine
Fachbegriffe ohne Erklärung. Große Umbauten zuerst als Mockup zeigen, dann umsetzen.

**Beim Start zuerst `docs/HANDOFF.md` lesen** – dort steht der Stand aus den bisherigen
Cowork-Sitzungen (was gebaut wurde, warum, bekannte Stolpersteine, offene Punkte).

## Umgebung
- Home Assistant OS 2026.7 auf Raspberry Pi 5, `http://192.168.170.60:8123` (feste IP, FRITZ!Box).
- Der HA-Config-Ordner (`/config` auf dem Pi) ist auf diesem PC als Laufwerk **`H:\`** eingebunden
  (Samba). Alle HA-Dateien dort direkt lesen; Änderungen aber im Repo (`ha/`) machen und mit
  `.\tools\deploy.ps1` nach `H:\` kopieren (UTF-8 ohne BOM).
- **REST-API**: Token in der Benutzer-Umgebungsvariable `HA_TOKEN`, URL in `HA_URL`.
  Nur über `.\tools\ha.ps1 get|post <pfad> [json]` aufrufen. Den Token nie ausgeben, nie in
  Dateien oder Commits schreiben. `Invoke-WebRequest` hängt gelegentlich – ha.ps1 nutzt WebClient.
- Nach Änderungen an `packages/`, `automations.yaml`, `scripts.yaml`: Konfiguration prüfen
  (`.\tools\ha.ps1 post config/core/check_config`), dann HA neu starten
  (`.\tools\ha.ps1 post services/homeassistant/restart`). Dashboard danach mit Strg+F5 laden.
- Nie ins Repo: `H:\.storage\`, `secrets.yaml`, Datenbanken, `prognose/presence_log.csv`,
  `prognose/runlog.csv` (Laufprotokoll, wird nie gelöscht), `prognose/diag/` (Diagnose-Protokoll, Tagesdateien).
- Ohne Neustart neu laden: `services/automation/reload`, `template/reload`, `shell_command/reload`,
  `command_line/reload`, `input_*/reload`. Neustart nur für neue Helfer-Domänen oder configuration.yaml.

## Repo-Aufbau
- `ha/` – Spiegel der relevanten HA-Dateien (Quelle der Wahrheit; `H:\` ist das Ziel).
- `heidi/` – Saugroboter Heidi: Backend-Doku, v1-Tests, v1-Mockups, `archiv/` mit der abgeschalteten v1-Karte
  (heidi-panel.js, Dashboard heidi.yaml; seit 15.09.2026 nur Referenz): eigene `CLAUDE.md`.
- `dreame_x60/` – Projekt **dreame_x60**: Neubau der Heidi-Karte (v2) mit `card/`, `tests/`, `mockups/`. Bauplan
  `docs/dreame_x60/BAUPLAN.md` (Statusliste = Wahrheit), Begründungen `docs/dreame_x60/ARCHITEKTUR-REVIEW.md`.
  Arbeit nur auf Branch `dreame_x60`; `main` bleibt das, was auf `H:` läuft.
- `tools/ha.ps1` (API), `tools/deploy.ps1` (Kopieren nach H:\ + Kartenversion hochzählen),
  `tools/ha-ws.js` (WebSocket-API für Personen/Entitäts-Register; JSON-Argumente über Git Bash),
  `tools/diag.js` (Auswertung des Diagnose-Protokolls und Tickets `--tickets` aus `H:\prognose\diag\`, Bauplan F.1/F.2; Beschreibung in
  `heidi/CLAUDE.md`). Das HA-Log gibt es nicht mehr als Datei: `.\tools\ha.ps1 get "hassio/core/logs?lines=300"`.
- Entitäts-IDs mit Umlaut im Namen: HA macht ö→o, ü→u (`heidi_nicht_storen`, nicht `_stoeren`).
  Vor dem Referenzieren die echte ID per `ha.ps1 get states/<id>` prüfen.
- `docs/HANDOFF.md` – Übergabe aus dem Cowork-Chat, offene Punkte als Checkliste pflegen.

## Personen / Anwesenheit
`person.herbert_schrotter` (Companion-App GPS + WLAN), `person.nicole_2`, `person.nina_2`
(WLAN über FRITZ!Box-Integration; „abwesend“ nach ~3 min consider_home). Nicht in YAML anlegen –
Personen werden in der HA-Oberfläche verwaltet.

## HACS
Installiert: dreame-vacuum (Tasshack, 2.0.0b25, Beta nötig), dreame-vacuum-map-card,
xiaomi-vacuum-map-card. Nicht mehr benötigt seit v1 aus ist (in HACS deinstallieren, Herbert):
Mushroom, card-mod, expander-card, stack-in-card.

## Commit-Profil
Commit-Format in allen Projekten: `[vX.Y.Z] Modul, Typ: Kurztitel` (Skill git-commit-helper); die Bauplan-Aufgabe
(z. B. 4.3e) steht am Anfang des Kurztitels.
- Modul-Namen: Karte (dreame_x60/card), Backend (ha/ – Paket, Automationen, Skripte, Prognose), Doku (docs/), Werkzeuge (tools/)
- Versionsquelle: dreame_x60/card/package.json "version" (und package-lock.json Zeilen 1–12); Backend/Doku ohne eigene Version → Version der Karte
- Bump-Regel: Vorabversion – jede eingespielte Änderung der Karte zählt die alpha-Nummer hoch, unabhängig vom Typ; reine Doku-Commits behalten die aktuelle Version
- Doku-Checkliste: Bauschritt fertig → docs/dreame_x60/BAUPLAN.md Statusliste; Befund oder Entscheidung → BAUPLAN.md Abschnitt 10 (Abweichung → 10a als PD-Eintrag); Stand geändert → docs/HANDOFF.md Abschnitt 3e; neue Entität oder Dienst → BAUPLAN.md Abschnitt 4 + contract.ts; Backend geändert → deployen und im Bauplan vermerken
- Tests vor jedem Commit: `npm test` in dreame_x60/card muss grün sein (Exit-Code 0), sonst kein Commit

## Tracker-Profil
Für den Skill tracker (projektneutral): Projektkennung statt Memory-Eintrag.
- Projekt: heidi
- Skill-Repo (OneDrive-relativ): Dokumente\02 Arbeit\05 Vorlagen - Scripte\00_claude-skills-bpm
- Projekt-Config: projects/heidi/ (Liste, Status-Werte, Nummernschema, Custom Fields wie BPM, Chat-Anker)
- ClickUp: Space Smart Home 1200660000001609, Liste dreame_x60 – Bauplan 1200660000004100
- Status-Übergänge: tracker start → in development; tracker done → testing (Abnahme auf shipped macht Herbert)
- Nummernschema: `DX-NNN | KÜRZEL | Kurztitel` (Kürzel KARTE/BACKEND/DOKU/TOOLS wie Commit-Profil); Kurztitel beginnt mit der Bauplan-Nummer (z. B. 4.3e) oder „Post-2.0:“; Phasen sind Parents ohne Nummer. **Nächste freie Nummer: DX-070** (nach jedem tracker neu +1)

## Code-Profil
Für den Skill code-erstellen (projektneutral).
- Stacks: typescript-lit, home-assistant-yaml, python (Stack-Referenzen des Skills code-erstellen, `references/stacks/<key>.md`)
- Stack-Details: Karte TypeScript strict + Lit 3, esbuild → `ha/www/dreame_x60.js`; Backend HA-YAML (`ha/packages`, `automations.yaml`, `scripts.yaml`); Prognose Python (`ha/prognose`)
- Build/Lint: `npm run check`, `npm run lint`, `npm run build` in `dreame_x60/card`
- Pflicht-Docs vor dem Code: diese CLAUDE.md, `docs/HANDOFF.md` Abschnitt 3e, `docs/dreame_x60/BAUPLAN.md` Abschnitt 2 (Regeln) und 4 (Entitäts-Vertrag); bei Domänen-Logik Abschnitt 6 (Portierungstabelle)
- Aufgabenquelle: BAUPLAN.md Abschnitt 8 (Aufgabenkarte: Ziel, Nicht ändern, Akzeptanz, Tests, Dateien) + ClickUp-Task DX-NNN; Akzeptanz-Zeilen = Testfälle
- Schichten/Kopplung: `contract.ts` (IDs) → `device.ts`/`profile.ts` (Erkennung, Räume, Optionen) → `selectors.ts` (memoisierte Views) → Komponenten; Schreiben nach HA nur über `DxApi`; neue Entität/Dienst zuerst in Abschnitt 4 + contract.ts; nichts fest verdrahten, was Roboter oder HA liefern
- Tests: `npm test` in `dreame_x60/card` (check + unit + build + E2E) und `npm run lint`; Exit-Code 0 ist Pflicht vor jedem Commit; Unit `tests/unit/*.test.ts`, E2E `tests/e2e/*.js` mit Harness-Stubs
- Auslieferung: Karte `.\tools\deploy.ps1 -OnlyCard`, dann Ressourcen-Version `node tools/ha-ws.js lovelace/resources/update {...,"url":"/local/dreame_x60.js?v=<ver>"}`, Strg+F5; Backend: `check_config`, dann passender reload oder restart; Sichtprüfung durch Herbert benennen
- Mockup-Pflicht: ja bei großen UI-Umbauten (Modus Deep) – zuerst Mockup in `dreame_x60/mockups/`, Abnahme, dann bauen
- Notiz-Ort für Befunde/Ideen ohne Task: BAUPLAN.md Abschnitt 10 (Abweichung → 10a als PD-Eintrag)
- Pflicht-Branch: `dreame_x60` (Worktree `herbert-smarthome-v2`); `main` bleibt der Stand auf H:

## Doku-Profil
Für den Skill doc-pflege (projektneutral).
- Doc-Standard: der Bauplan selbst (`docs/dreame_x60/BAUPLAN.md` Abschnitt 0–2; Formate in 8, 10, 10a) – kein DOC-STANDARD, kein Frontmatter/Quickload
- Router/Index: diese CLAUDE.md (Repo-Aufbau) + `docs/HANDOFF.md` Abschnitt 5 (Referenzen)
- Pflicht-Docs: `docs/dreame_x60/BAUPLAN.md` (Statusliste = Wahrheit), `docs/HANDOFF.md`, `CLAUDE.md`, `heidi/CLAUDE.md`, Plan-Docs `docs/dreame_x60/{ARCHITEKTUR-REVIEW,GERAETEPROFIL,PLANER-NACHHOLEN,UX-TRANSITIONS,ENTITAETEN}.md`
- Doc-Typen/Vorlagen: Aufgabenkarte (Voraussetzung, Ziel, Nicht ändern, Akzeptanz, Tests, Dateien); Notiz Abschnitt 10 (`- [Datum] [Aufgabe] Art · Schwere: Text. Entscheidung Herbert: …`); PD-Eintrag 10a (id, bereich, v1, v2, grund, spec_test, Status); Plan-Doc mit Stufen und Stand-Datum
- Validierung (Modus 6): Statusliste ↔ ClickUp DX-Status ↔ Code (fertig nur mit Tests + Commit); jede v1-Abweichung mit PD-Eintrag `freigegeben`; Abschnitt 4 ↔ `contract.ts` (Abschnitt 4 listet IDs in Kurzform `sensor.heidi_a|b|c` und `select.heidi_room_N_…` – beim Abgleich auflösen, Roboter-IDs sind dynamisch); HANDOFF 3e nennt letzten Bauschritt + Version; nichts Verbotenes im Repo; Warnungen: Notizformat, Karte ohne Akzeptanz/Tests, offene Punkte ohne ClickUp, Plan-Doc ohne Datum, Version uneinheitlich
- Frühphasen-Regel: nein – Paritätsregel: Abweichung von v1 nur mit PD-Eintrag (10a), neue Entität/Dienst → Abschnitt 4 + contract.ts im selben Commit
- Advisory: Doku-Checkliste des Commit-Profils (oben)
- Sitzungsabschluss (Modus 8): Statusliste Abschnitt 1 ↔ ClickUp, Befunde Abschnitt 10/10a, HANDOFF 3e (Version, gebaut, Stolpersteine), offene Punkte HANDOFF Abschnitt 4 mit ClickUp-Bezug, Commit `[vX] Doku, Docs: Sitzungsabschluss <Datum> – …` + Push
- Commit-Modul: Doku
- Startprompt (chat-wechsel, Claude Code): BAUPLAN.md Abschnitt 0, ergänzt um nächste Aufgabe (DX-NNN), letzte Version, Branch, Warnungen der Sitzung; Stand vorher per doc-pflege Modus 8 ins Repo, kein Handover-Prompt

## Mockup-Profil
Für den Skill mockup-erstellen (projektneutral).
- Ablage: `dreame_x60/mockups/` (flach); Namensschema `<thema>.html`, klein, ohne Umlaute; ein Mockup zeigt alle betroffenen Seiten/Zustände mit Tabs
- Design-Quelle: `dreame_x60/card/src/styles/tokens.ts` (`--dx-*`, Designvorgabe „Automotive Dark Bento“ 14.09.); Token-Abgleich vor dem Speichern
- Referenz-Mockup: `dreame_x60/mockups/bento.html` (abgenommen 15.09.2026; löst `start.html`/`seiten.html` ab)
- Token-Form im HTML: `:root { --dx-* }` mit denselben Werten wie tokens.ts; Klassen/Layout wie bento.html (Bento 12/6/1 Spalten, dx-nav-Formen); keine externen Ressourcen (Regel 14)
- Ansichten: Desktop und 390 px nebeneinander; Tablet (761–1180 px) wenn Container-Regeln betroffen
- Sitemap / Klick-Navigation: nein (Tabs in der Datei)
- Vorschau: Claude Code Browser-Bereich (Datei öffnen, 390 px per resize) + Datei an Herbert; Abnahme im Browser durch Herbert
- Abnahme-Ort: BAUPLAN.md Abschnitt 7 (Seitentabelle „Abgenommen von Herbert am <Datum> (Mockup <Datei>)“) + Notiz Abschnitt 10; Abweichung zu v1 → PD-Eintrag 10a
- Commit-Modul: Doku (Mockup + Abnahme-Eintrag im selben Commit)

## Review-Profil
Für den Skill chatgpt-review (projektneutral).
- Review-Ablage: `docs/chatgpt-reviews/` (Serien `CGR-YYYY-MM-DD-<thema>/r<N>/` mit 01–04, `INDEX.md`); Rundenstand aus README/Ordnern lesen
- Themen: heidi-v2 (Neubau der Karte), karte, backend, geraeteprofil
- GitHub-Repo: herbertschrotter-blip/herbert-smarthome, Branch aus der Shell (Pflicht-Branch `dreame_x60`); Push-Prüfung vor jedem Prompt
- Pflicht-Block: „Regeln des Neubaus“ (Bauplan Abschnitt 2 in Kurzform: v1 nur Referenz, Vertrag eingefroren, Abweichung nur mit PD-Eintrag, Schreiben nur über DxApi, keine externen Ressourcen, Tests grün)
- Kontextquelle: Bauplan Abschnitt 2 (Regeln), 4 (Vertrag, nur betroffene Entitäten), 7 (Seite), betroffene Karte aus 8, HANDOFF 3e, bekannte Befunde 10/10a; max. 3–5 Blöcke
- Reviewer-Rolle: erfahrener Frontend-Architekt für Web Components (Lit) und Home Assistant
- Ergebnis-Ort: Bauplan Abschnitt 10 (Notiz mit Entscheidung Herbert), 10a bei Abweichung, HANDOFF 3e; offene Punkte als DX-Tasks über tracker
- Commit-Modul: Doku
