# Runde 1 – Herberts Entscheidungen (2026-09-14)

| Frage | Entscheidung |
|---|---|
| Update-Gating in v2 | **ChatGPTs Weg**: zuerst reine Lit-Reaktivität, `hass` nach unten reichen, dann messen; nur Karte und Zeitleiste bekommen gezieltes Gating. `entityIds` in Selektoren nur für Doku und Tests. Claudes Einwand (neue View-Referenzen → alle Kinder rendern) wird als Messaufgabe in Phase 4 mitgenommen. |
| Beim Portieren gefundene v1-Fehler | **Beheben mit Beleg**: in v2 beheben, wenn ein handgeschriebener Specification-Vektor den Fehler eindeutig zeigt und Herbert die Abweichung in Abschnitt 10 abnimmt; sonst reproduzieren und für nach 2.0 notieren. |
| Umfang der Bauplan-Überarbeitung | **Alles jetzt**: vier Kernänderungen von ChatGPT plus `contract.ts`, Fehlerstrategie, Testmatrix, geschärfte Freigabekriterien und die vier Felder Ziel / Nicht ändern / Akzeptanz / Tests für jede Aufgabe. |

Ergebnis: `docs/BAUPLAN-V2.md` wird vollständig überarbeitet (Stand nach Runde 1),
`docs/ARCHITEKTUR-REVIEW.md` bekommt die geänderte Begründung für Custom Card vs. `panel_custom`.
Runde 2 prüft den überarbeiteten Bauplan.
