# CGR-2026-09-14-heidi-v2 — Architektur-Review und Bauplan der Heidi-Karte v2

**Thema:** Zweitmeinung zu `docs/ARCHITEKTUR-REVIEW.md` (Bewertung der bestehenden
`heidi-panel.js`) und `docs/BAUPLAN-V2.md` (Neubau der Oberfläche auf dem bestehenden Backend).
**Zeitraum:** 2026-09-14
**Branch:** `claude/heidi-panel-architecture-review-rd951p`
**Status:** Runde 2 abgeschlossen, Runde 3 (Detailprüfung) vorbereitet, optional

---

## Runden-Übersicht

### Runde 1 — Grundsatzentscheidungen und Bauplan
- **Artefakte:** [r1/](./r1/)
- **Fokus:** Neubau vs. Refactoring, gleiches Repo, Lit/TypeScript/esbuild, Custom Card vs.
  panel_custom, eingefrorener Entitäts-Vertrag mit Parallelbetrieb, Teststrategie mit
  v1-erzeugten Vektoren, Phasenreihenfolge, Überengineering-Check.
- **Kernergebnis:** Neubau freigegeben als „struktureller Neubau bei verhaltenskonformer
  Portierung“; gleiches Repo; Lit + TS + esbuild; Custom Card (Begründung: braucht nichts, was
  `panel_custom` rechtfertigt); Vektoren in `v1`/`spec` getrennt; `ha/contract.ts`;
  Parallelbetriebsregeln; Fehlerstrategie; Safe-Area-Test; vier Felder je Aufgabe.
  Herbert: Gating nach ChatGPT (Lit zuerst, messen in 4.12), v1-Fehler beheben mit Beleg,
  Bauplan komplett überarbeitet.

### Runde 2 — Prüfung des überarbeiteten Bauplans
- **Artefakte:** [r2/](./r2/)
- **Fokus:** ChatGPT antwortete auf Claudes Runde-1-Analyse (nicht auf den Runde-2-Prompt):
  Gating, v1-Fehler, Bauplan-Umfang, sieben Ergänzungen; dazu Herberts Wunsch nach Seitenstruktur.
- **Kernergebnis:** Memoisierte Selektoren ab Tag 1 (beide Reviewer, Herbert bestätigt);
  Register „Paritätsabweichungen“; Vektoren `.v1.json`/`.spec.json`; sechs Felder je Aufgabe;
  `src/ha/contract.ts` mit Generatoren; Diagnose-Selektor; Befundklassen; Teilfehler bei
  `savePlan`; `PlanDraft` als Snapshot. Seitenstruktur über HA-Unteransichten mit Mockup vorab
  (PD-000). Bauplan komplett neu geschrieben (41 Aufgaben).

### Runde 3 — Detailprüfung des fertigen Bauplans (optional)
- **Artefakte:** [r3/](./r3/)
- **Fokus:** Seitenstruktur-Mechanik, Aufgabenkarten, Voraussetzungen, Vektor-Werkzeug,
  Spec-Grenzfälle, Messanordnung, Round-Trip, Freigabekriterien, Umfang.
- **Kernergebnis:** (offen)
