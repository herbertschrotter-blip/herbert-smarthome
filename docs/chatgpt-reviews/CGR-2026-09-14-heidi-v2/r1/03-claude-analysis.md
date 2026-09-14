# Runde 1 – Claudes Einschätzung zur ChatGPT-Antwort

## Übernehme ich ohne Einschränkung

| ChatGPT-Punkt | Umsetzung im Bauplan |
|---|---|
| 1. v2 = struktureller Rewrite des Frontends bei verhaltenskonformer Portierung, kein fachlicher Rewrite | Als oberste Invariante an den Anfang von Abschnitt 2 (Regeln) |
| 2. `heidi/card/` = eigenständiges Frontend-Paket im gemeinsamen Repo, keine Workspaces | Satz in Abschnitt 3 |
| 3. `ha/contract.ts` mit Entitäts-IDs und zulässigen Optionsstrings; keine Komponente setzt IDs selbst zusammen | Ersetzt mein `config.ts` für alles, was den Vertrag betrifft (`E`, `RV_HA`, `RV_ENT`, Optionslisten); `config.ts` behält nur Anzeige-Dinge (ROOMS-Icons, APP_SCENES, DAYS) |
| 5. Begründung für Custom Card: „braucht nichts, was `panel_custom` rechtfertigt“, nicht Wiederverwendung | Text in Review und Bauplan anpassen; Wiederverwendung fürs allgemeine Dashboard als Designziel streichen |
| 6. Parallel-Edit-Regel; E2E „v2 speichert → v1 liest denselben Zustand“; `customCards`-Eintrag nur einmal | Neue Regel + neue E2E-Aufgabe in Phase 6 |
| 8. Codec und Schätzung bleiben zweisprachig mit gemeinsamen Vektoren; `rest_min` ins Backend | Bereits so, bleibt |
| 9. Characterization- vs. Specification-Vektoren, je kritischer Regel mindestens ein handgeschriebener Grenzfall | Vektor-Dateien bekommen ein Feld `quelle: "v1" \| "spec"`; Phase-2-Aufgaben verlangen beides |
| 10. Je Sitzung nur die aktuelle Aufgabe mit Voraussetzungen, Akzeptanz, Dateien, Tests | Ergibt sich aus 13 |
| 11. Media Queries auch für Safe Area, Pointer/Hover, sehr kleine Viewports; kein fester „Smartphone-Modus“; Testmatrix (Companion hoch/quer, Tablet mit Sidebar, Kiosk, Desktop mit Sidebar) | Abschnitt 8 Phase 5 und Checkliste anpassen |
| 12. Streichen: 14 als Sollzahl, Fonts vor Parität, Wiederverwendung als Ziel | 14 → „Orientierung, Schnitt nach Zustands- und Verantwortungsgrenzen“; Fonts nach Abschnitt 10; Wiederverwendung raus |
| 12. Fehlt: Fehlerstrategie für `unavailable`/fehlende Entitäten; Test `unavailable → available`; Safe-Area-Test; Definition „paritätisch“ | Neue Regel (Selektoren liefern typisierte Leerwerte, UI zeigt „–“, nie Exception); neue E2E-Aufgabe; Checkliste; Abschnitt 11 schärfen |
| 13. Vier Felder je Aufgabe (Ziel / Nicht ändern / Akzeptanz / Tests); Regel „Widerspruch Code vs. Bauplan → dokumentieren und stoppen“ | Abschnitt 8 wird zur Aufgabenkartei mit diesen Feldern; Regel in Abschnitt 2 |
| HA-interne UI-Komponenten meiden | Regel: nur `ha-icon` und `loadCardHelpers` (beides seit Jahren stabil), sonst eigene Primitive |

## Wo ich anderer Meinung bin oder abschwäche

**7. Update-Gating.** ChatGPT sagt: kein globales `shouldUpdate` ab Tag 1, Lit-Reaktivität nutzen,
erst messen, dann Map und Zeitleiste gezielt optimieren. Ich stimme dem Grundsatz zu, sehe aber
eine Falle in ChatGPTs eigenem Vorschlag: Wenn die Shell bei jedem `hass`-Update neue View-Objekte
aus den Selektoren erzeugt und als Properties weiterreicht, sieht Lit bei jeder Änderung neue
Referenzen und rendert alle Kinder neu. Bei einem Haus mit Bewegungsmeldern kommt `hass` mehrmals
pro Sekunde. Das ist kein Absturz, aber genau die Last, die auf dem Tablet stört.

Mittelweg, den ich vorschlage:
- Selektoren nennen ihre `entityIds` ab Tag 1 (billig, dokumentiert den Vertrag, testbar).
- Die Shell memoisiert je Selektor: neues View-Objekt nur, wenn sich `state`/`last_updated` einer
  seiner IDs geändert hat. Das ist kein globaler Vergleich aller IDs, sondern ein lokaler je
  Sicht, und es ist genau das, was Lit braucht, um Kinder in Ruhe zu lassen.
- Keine zusätzliche Renderbarriere in der Shell; kein Gating in den Komponenten außer Map
  (Element-Cache) und Zeitleiste (Nachladen nur bei `last_changed`-Wechsel).
- Messen in Phase 4 mit `states-cleaning.json` und einem Hass-Tick alle 200 ms; erst wenn das
  Renderbudget reißt, mehr.

**5. „HA 2026.8 behandelt Safe Areas bei Custom Panels“.** Kann ich nicht verifizieren, Herbert
läuft auf 2026.7. Die Konsequenz (Safe-Area-Test in der Companion-App) ist unabhängig davon
richtig und wird übernommen; die Versionsangabe kommt nicht in den Bauplan.

**12. ESLint-Plugin.** ChatGPT will Tooling minimal. Ich behalte `tsc --noEmit` als Pflicht und
ESLint mit den empfohlenen Regeln; `eslint-plugin-lit` wird optional, weil es genau die Fehler
fängt, die ein LLM in Lit-Templates macht (falsche Attribut-Bindung, fehlendes `?`). Kostet eine
Zeile Konfiguration.

## Antworten auf ChatGPTs Rückfragen (mein Vorschlag, Herbert entscheidet)

1. **Konkurrierendes Bearbeiten in der Abnahmephase.** Regel: Der Planer-Editor wird während der
   Abnahme nur in v2 benutzt; v1 dient zum Lesen. Absicherung durch den E2E-Round-Trip
   (v2 speichert → v1-Selektor liest identisch). Keine Sperr-Mechanik in HA, das wäre
   Overengineering für einen Ein-Personen-Haushalt.
2. **Bekannte v1-Fehler in der Paritätsphase.** Zwei Klassen:
   - Fehler, die schon heute in v1 nachgewiesen sind (z. B. `task_status` fehlt in der Signatur):
     in v1 beheben (Phase 0), damit die Characterization-Vektoren sie nicht enthalten.
   - Fehler, die beim Portieren auffallen: in v2 beheben, wenn ein Specification-Vektor den
     Fehler eindeutig belegt und Herbert die Abweichung in Abschnitt 10 abgenommen hat; sonst
     reproduzieren und für nach 2.0 notieren. Nie stillschweigend „verbessern“.

## Freigabekriterien für v2 (geschärft, für Abschnitt 11)

v2 ist freigegeben, wenn alle Punkte erfüllt sind:
1. Paritäts-Checkliste (Abschnitt 9) vollständig, jede Zeile an v1 und v2 nebeneinander geprüft.
2. Alle Characterization-Vektoren grün, alle Specification-Vektoren grün, in TS und Python.
3. E2E grün: Render mit beiden Fixtures, Editor-Round-Trip v2 → v1, Zonen, Zeitleiste,
   Live-Update bei offenem Editor, `unavailable → available`, drei Breiten ohne Overflow.
4. `tsc --noEmit` und ESLint ohne Fehler.
5. Abschnitt 10 enthält keine unabgenommene Abweichung.
6. Companion-App hoch/quer und Tablet mit Sidebar von Herbert gesichtet (Safe Area, Bottom-Sheet).
7. Sieben Tage Alltag mit v2 als Hauptdashboard ohne offenen Befund.
8. Version `2.0.0`, `heidi.yaml` zeigt auf v2, v1 als `heidi-panel-v1.js` archiviert,
   HANDOFF/CLAUDE.md beschreiben v2.

## Entscheidungen, die ich Herbert stelle

1. Update-Gating: ChatGPTs Weg (erst Lit, dann messen), mein Mittelweg (memoisierte Selektoren
   ab Tag 1), oder ChatGPT nochmal fragen.
2. Umgang mit beim Portieren gefundenen v1-Fehlern: reproduzieren bis 2.0, oder mit
   Specification-Vektor und dokumentierter Abweichung in v2 beheben.
3. Umfang der Bauplan-Überarbeitung: alles jetzt einarbeiten (inkl. vier Felder je Aufgabe),
   oder nur die vier Kernänderungen und die Felder erst bei Bearbeitung der jeweiligen Aufgabe.
