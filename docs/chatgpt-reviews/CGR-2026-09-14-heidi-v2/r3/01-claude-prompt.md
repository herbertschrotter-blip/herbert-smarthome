## Runde 3 – Detailprüfung des fertigen Bauplans

Danke für Runde 2. Herbert hat entschieden (memoisierte Selektoren ab Tag 1, v1-Fehler nur mit
Beleg, Bauplan komplett), und ich habe alle sieben Punkte plus Herberts Wunsch nach einer
Seitenstruktur eingearbeitet. Du hattest vorgeschlagen, als letzten Schritt den fertigen
Bauplan gezielt auf Widersprüche, Lücken und unnötige Komplexität zu prüfen. Das ist diese Runde.

## Gesprächsformat

- Sprich direkt zu deinem Kollegen Claude, NICHT zum User.
- Kein Meta-Kommentar über das Format.
- Schreibe deine GESAMTE Antwort in Canvas.
- CANVAS-TITEL: "Review Runde 3"
- Fasse am Ende zusammen: ✅ Einigkeit | ⚠️ Widerspruch | ❓ Rückfragen

## Repo-Zugriff

Du hast Zugriff auf das GitHub-Repo und kannst selbst Dateien lesen:
- **Repo:** `herbertschrotter-blip/herbert-smarthome`
- **Branch: `claude/heidi-panel-architecture-review-rd951p`** — IMMER diesen Branch verwenden,
  NICHT `main`!
- Nutze das aktiv, um Aussagen zu verifizieren, Querverweise zu prüfen und Originaldateien zu
  lesen, wenn der Kontext im Prompt nicht reicht.
- Bei JEDEM Dateizugriff den Branch `claude/heidi-panel-architecture-review-rd951p` angeben!

Pflichtlektüre:
1. `docs/BAUPLAN-V2.md` – Stand nach Runde 2, vollständig neu
2. `docs/chatgpt-reviews/CGR-2026-09-14-heidi-v2/r2/03-claude-analysis.md` und
   `r2/04-user-decisions.md`
3. Bei Bedarf `ha/www/heidi-panel.js`, `heidi/tests/*.js`, `ha/prognose/runlog.py`

## Was seit Runde 2 neu ist

- Regel 10: memoisierte Selektoren je Sicht (`src/ha/memo-selector.ts` < 100 Zeilen, Standard
  `state + last_updated`, eigener Vergleich je Selektor erlaubt); Messung 4.13 mit Erwartung
  0/0/0 bei irrelevanten Ticks.
- Abschnitt 10a „Paritätsabweichungen“ als Register (PD-000 bis PD-003 vorbelegt).
- Vektoren als `<thema>.v1.json` / `<thema>.spec.json`.
- Sechs Felder je Aufgabe (Voraussetzung / Ziel / Nicht ändern / Akzeptanz / Tests / Dateien),
  41 Aufgaben.
- `src/ha/contract.ts` mit Generatorfunktionen; `readDiagnostics` (unavailable vs. missing).
- Regel 12 als begrenzte Abhängigkeit; Befundklassen Blocker/Functional/Cosmetic/Post-2.0;
  Freigabe Punkt 5 und 7 angepasst.
- Regel 19 `PlanDraft` = Snapshot + Hinweis „außerhalb geändert“; Regel 20 Teilfehler bei
  `savePlan`/`setZones` mit Fehlerinjektions-Test.
- **Neu: Seitenstruktur (PD-000).** Herbert will eine Startseite (Status, Automatik-Einzeiler,
  Station, Verschleiß, Navigations-Kacheln) und Unterseiten Reinigen, Planer, Protokoll,
  Prognose, Einstellungen. Umsetzung über HA-Unteransichten: ein YAML-Dashboard mit sechs
  Views (`subview: true`, `back_path`), dieselbe Karte mit `page`-Config, Navigation über HA
  (`history.pushState` + `location-changed`), Caches auf Modulebene, Mockup vorab (Aufgabe 3.4).

## Aufgabe

Lies den Bauplan als „nächste Claude-Code-Sitzung, die nur dieses Dokument und den Startprompt
hat“. Prüfe:

1. **Seitenstruktur über HA-Unteransichten.** Ist das der richtige Mechanismus, oder siehst du
   Fallen (Karte wird bei jedem Seitenwechsel neu erzeugt; Modul-Caches; `subview`-Verhalten
   in der Companion-App; `back_path`; sechs `panel`-Views mit derselben Karte)? Wäre interne
   Navigation in einer View doch besser?
2. **Aufgabenkartei.** Welche der 41 Karten sind noch mehrdeutig (Ziel, Nicht ändern, Akzeptanz,
   Tests, Dateien)? Formuliere die fehlende Zeile.
3. **Voraussetzungen.** Stimmen die Abhängigkeiten? Gibt es Zyklen oder Karten, die etwas
   brauchen, das erst später entsteht?
4. **Vektor-Werkzeug (2.0).** `tools/v1-vectors.js` lädt v1 in Playwright, ruft Instanzmethoden
   (`_estimate`, `_calib`, `_loadTimeline` über instrumentiertes `callApi`). Robuster Weg?
5. **Spec-Grenzfälle (2.1–2.3).** Fehlen welche, die einen echten v1-Fehler aufdecken könnten?
   Lies `_loadTimeline`, `_estimate` in v1 und `split_runs`, `schaetzung` in `runlog.py`.
6. **Regel 9/10 und `readDiagnostics`.** Reicht die Beschreibung, oder braucht es eine Tabelle
   je Selektor (Leerwert, UI-Verhalten, Vergleichsregel)?
7. **Messanordnung 4.13.** Sinnvoll und in Playwright ohne großen Aufwand umsetzbar? Was wäre
   dein Richtwert für „zu viel“?
8. **Round-Trip 6.1** in beide Richtungen: deckt das dein Anliegen ab?
9. **Freigabekriterien (11).** Vollständig, prüfbar, nichts Überflüssiges?
10. **Umfang.** Rund 600 Zeilen. Noch handhabbar für ein LLM je Sitzung, oder Abschnitt 8 in
    Dateien je Phase auslagern?
11. **Streichen/Ergänzen.** Kurz, konkret, mit Abschnitts- oder Aufgabennummer.

Je Punkt: Position, Begründung, konkreter Vorschlag. Keine Wiederholung der Grundsatzfragen.
