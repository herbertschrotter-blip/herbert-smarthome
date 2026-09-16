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
  `prognose/runlog.csv` (Laufprotokoll, wird nie gelöscht).
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
  `tools/ha-ws.js` (WebSocket-API für Personen/Entitäts-Register; JSON-Argumente über Git Bash).
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
- Nummernschema: `DX-NNN | KÜRZEL | Kurztitel` (Kürzel KARTE/BACKEND/DOKU/TOOLS wie Commit-Profil); Kurztitel beginnt mit der Bauplan-Nummer (z. B. 4.3e) oder „Post-2.0:“; Phasen sind Parents ohne Nummer. **Nächste freie Nummer: DX-056** (nach jedem tracker neu +1)

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
- Validierung (Modus 6): Statusliste ↔ ClickUp DX-Status ↔ Code (fertig nur mit Tests + Commit); jede v1-Abweichung mit PD-Eintrag `freigegeben`; Abschnitt 4 ↔ `contract.ts`; HANDOFF 3e nennt letzten Bauschritt + Version; nichts Verbotenes im Repo; Warnungen: Notizformat, Karte ohne Akzeptanz/Tests, offene Punkte ohne ClickUp, Plan-Doc ohne Datum, Version uneinheitlich
- Frühphasen-Regel: nein – Paritätsregel: Abweichung von v1 nur mit PD-Eintrag (10a), neue Entität/Dienst → Abschnitt 4 + contract.ts im selben Commit
- Advisory: Doku-Checkliste des Commit-Profils (oben)
- Sitzungsabschluss (Modus 8): Statusliste Abschnitt 1 ↔ ClickUp, Befunde Abschnitt 10/10a, HANDOFF 3e (Version, gebaut, Stolpersteine), offene Punkte HANDOFF Abschnitt 4 mit ClickUp-Bezug, Commit `[vX] Doku, Docs: Sitzungsabschluss <Datum> – …` + Push
- Commit-Modul: Doku
