# Runde 2 – Herberts Entscheidungen (2026-09-14)

Herbert: „ok. erstelle bauplan.md“ – damit gelten die Empfehlungen aus `03-claude-analysis.md`:

| Frage | Entscheidung |
|---|---|
| Update-Gating | **Memoisierte Selektoren ab Tag 1** (von Claude und ChatGPT empfohlen; ersetzt die Runde-1-Wahl „Lit zuerst“). Eine Utility `src/ha/memo-selector.ts`, Standardvergleich `state + last_updated`, je Selektor eigener Vergleich erlaubt, Abbruch bei > 100 Zeilen. Messung in 4.12 mit Erwartung 0/0/0 bei irrelevanten Ticks. |
| Seitenstruktur | **HA-Unteransichten jetzt**, Mockup vorab (`CLAUDE.md`: große Umbauten zuerst als Mockup). Startseite mit Status, Automatik-Einzeiler, Station, Verschleiß und Navigations-Kacheln; Unterseiten Reinigen, Planer, Protokoll, Prognose, Einstellungen. Eingetragen als Paritätsabweichung PD-000. |
| Serie | Runde 3 als Detailprüfung des fertigen Bauplans vorbereitet (`r3/01-claude-prompt.md`), Durchführung optional. Aufgabe 0.1 kann unabhängig davon beginnen. |

Zusätzlich übernommen (ChatGPT Runde 2, alle sieben Punkte): Register „Paritätsabweichungen“,
Vektoren in getrennten Dateien `.v1.json`/`.spec.json`, sechs Felder je Aufgabe, `src/ha/contract.ts`
mit Generatorfunktionen, Diagnose-Selektor, Regel 12 als begrenzte Abhängigkeit, Befundklassen,
Partial-Failure bei `savePlan`, `PlanDraft` als Snapshot mit Hinweis „außerhalb geändert“.
