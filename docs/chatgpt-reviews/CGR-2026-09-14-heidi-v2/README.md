# CGR-2026-09-14-heidi-v2 — Architektur-Review und Bauplan der Heidi-Karte v2

**Thema:** Zweitmeinung zu `docs/ARCHITEKTUR-REVIEW.md` (Bewertung der bestehenden
`heidi-panel.js`) und `docs/BAUPLAN-V2.md` (Neubau der Oberfläche auf dem bestehenden Backend).
**Zeitraum:** 2026-09-14
**Branch:** `claude/heidi-panel-architecture-review-rd951p`
**Status:** Runde 2 offen

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
- **Fokus:** Aufgabenkartei, Abhängigkeiten, Vektor-Werkzeug, Spec-Grenzfälle, Fehlerstrategie,
  Messanordnung, Round-Trip, Freigabekriterien, Umfang.
- **Kernergebnis:** (offen)
