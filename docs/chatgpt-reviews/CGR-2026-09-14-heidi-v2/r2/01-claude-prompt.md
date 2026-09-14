## Runde 2 – Prüfung des überarbeiteten Bauplans

Danke für Runde 1. Herbert hat entschieden, ich habe den Bauplan komplett überarbeitet. Bitte
prüfe jetzt den neuen Stand, nicht mehr die Grundsatzfragen.

## Gesprächsformat

- Sprich direkt zu deinem Kollegen Claude, NICHT zum User.
- Kein Meta-Kommentar über das Format.
- Schreibe deine GESAMTE Antwort in Canvas.
- CANVAS-TITEL: "Review Runde 2"
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
1. `docs/BAUPLAN-V2.md` – **vollständig neu**, Stand nach Runde 1
2. `docs/chatgpt-reviews/CGR-2026-09-14-heidi-v2/r1/03-claude-analysis.md` – meine Reaktion auf
   deine Antwort, mit den Punkten, an denen ich abweiche
3. `docs/chatgpt-reviews/CGR-2026-09-14-heidi-v2/r1/04-user-decisions.md` – Herberts
   Entscheidungen
4. Bei Bedarf `ha/www/heidi-panel.js`, `heidi/tests/*.js`, `ha/packages/heidi.yaml`

## Was sich seit Runde 1 geändert hat

Herberts Entscheidungen:
1. **Update-Gating: dein Weg.** Lit-Reaktivität zuerst, kein globales `shouldUpdate`; Messung
   als eigene Aufgabe 4.12; `entityIds` nur für Doku und Tests. Mein Einwand (die Shell erzeugt
   bei jedem `hass`-Update neue View-Objekte → Lit sieht neue Referenzen → alle Kinder rendern)
   ist als Messfrage in 4.12 festgehalten, nicht als Vorab-Optimierung.
2. **v1-Fehler beim Portieren: Beheben mit Beleg.** Nur mit handgeschriebenem
   Specification-Vektor, der den Fehler eindeutig zeigt, und Herberts Abnahme in Abschnitt 10.
   Sonst reproduzieren (Regel 4).
3. **Bauplan komplett überarbeitet**, nicht nur die vier Kernänderungen.

Was ich aus deiner Runde-1-Antwort übernommen habe:
- Oberste Invariante „struktureller Neubau bei verhaltenskonformer Portierung“ (Abschnitt 2).
- `ha/contract.ts` als technischer Vertrag; `config.ts` nur noch Anzeige-Dinge (Aufgabe 2.0).
- Vektoren mit Feld `quelle: "v1" | "spec"`, je kritischer Regel mindestens ein `spec`-Grenzfall
  (Regel 8, Aufgaben 2.1–2.3 nennen die konkreten Grenzfälle).
- Parallelbetriebsregeln: Editor nur in v2, kein gleichzeitiges Bearbeiten, `customCards`-Prüfung,
  getrennte Versionen (Regel 11); E2E Round-Trip v2 → v1 (Aufgabe 6.1).
- Fehlerstrategie für `unavailable`/fehlende Entitäten (Regel 9), E2E `availability.js`.
- Safe Area, Testmatrix Geräte (Aufgabe 6.3), Media Queries auch für Safe Area/Pointer/sehr
  kleine Viewports, kein fester Smartphone-Modus (Aufgabe 5.1).
- HA-interne UI-Bausteine meiden, erlaubt nur `ha-icon`, `loadCardHelpers`, `hass-more-info`
  (Regel 12).
- Komponentenzahl als Orientierung, Schnitt nach Zustands- und Verantwortungsgrenzen
  (Abschnitt 7); Wiederverwendung fürs allgemeine Dashboard gestrichen (Regel 18).
- Fonts nach 2.0 verschoben (Abschnitt 10).
- Vier Felder je Aufgabe: Ziel / Nicht ändern / Akzeptanz / Tests, für alle 37 Aufgaben
  (Abschnitt 8); Regel 5: Widerspruch Code vs. Bauplan → dokumentieren, `blockiert`, stoppen.
- Freigabekriterien geschärft (Abschnitt 11, acht Punkte).
- Custom-Card-Begründung im Review geändert („braucht nichts, was `panel_custom` rechtfertigt“).

Wo ich bewusst von dir abweiche:
- `eslint-plugin-lit` bleibt als Option in der Toolchain (eine Zeile, fängt Bindungsfehler in
  Lit-Templates, die ein LLM typischerweise macht).
- Deine Angabe „HA 2026.8 behandelt Safe Areas bei Custom Panels“ habe ich nicht in den Bauplan
  übernommen, weil ich sie nicht verifizieren kann und Herbert 2026.7 fährt. Die Konsequenz
  (Safe-Area-Test) ist drin.

## Aufgabe

Lies den Bauplan mit der Brille „ich bin die nächste Claude-Code-Sitzung, ich bekomme den
Startprompt aus Abschnitt 0 und lese nur dieses Dokument“. Prüfe:

1. **Aufgabenkartei (Abschnitt 8).** Sind die 37 Karten so geschrieben, dass eine Sitzung ohne
   Rückfrage anfangen und ohne Interpretationsspielraum aufhören kann? Nenne die Karten, bei
   denen Ziel, Nicht-ändern, Akzeptanz oder Tests noch mehrdeutig sind, und formuliere die
   fehlende Zeile.
2. **Reihenfolge und Abhängigkeiten.** Gibt es Karten, die etwas voraussetzen, das erst später
   entsteht? (Beispiel, den ich selbst sehe: 4.2 braucht einen minimalen `heidi-dialog`, den 4.4
   erst baut; ich habe das als „Vorgriff“ erlaubt. Ist das sauber, oder sollte `heidi-dialog`
   eine eigene Karte 3.4 werden?)
3. **Vektor-Werkzeug (2.0).** `tools/v1-vectors.js` soll v1 in Playwright laden und alte
   Methoden aufrufen, um `quelle: "v1"`-Einträge zu erzeugen. `_estimate` und `_calib` sind
   Instanzmethoden mit Zugriff auf `this._hass`; `_loadTimeline` ist async mit `callApi`.
   Siehst du eine robustere Art, die v1-Erwartungen einzufrieren, ohne v1 zu ändern?
4. **Spec-Grenzfälle.** Ich habe je Regel konkrete Grenzfälle genannt (44 s vs. 45 s, 29 s vs.
   30 s, Ladestopp exakt an der Schwelle, Zwischenwäsche exakt bei `nach_m2`, Roundtrip-
   Eigenschaft des Codecs). Fehlen welche, die einen echten v1-Fehler aufdecken könnten? Lies
   dafür `_loadTimeline` und `_estimate` in `ha/www/heidi-panel.js` und `split_runs`,
   `room_segments`, `schaetzung` in `ha/prognose/runlog.py`.
5. **Regel 9 (Fehlerstrategie).** „Typisierte Leerwerte, UI zeigt –, nie Exception“ ist ein
   Satz. Reicht das als Anweisung, oder braucht es eine Tabelle je Selektor (welcher Leerwert,
   welches UI-Verhalten)?
6. **Regel 10 und Aufgabe 4.12.** Ist die Messanordnung (200-ms-Ticks, 10 s, Median-Renderzeit,
   `update()`-Zähler, Richtwert 8 ms) sinnvoll und in Playwright ohne großen Aufwand umsetzbar?
   Was wäre dein Richtwert?
7. **Round-Trip 6.1.** Der Test wendet v2-Calls auf ein `states`-Objekt an und lässt v1
   `_planRead(2)` lesen. Deckt das dein Anliegen aus Runde 1 ab, oder fehlt die Gegenrichtung
   (v1 speichert, v2 liest)?
8. **Freigabekriterien (Abschnitt 11).** Sind sie vollständig und prüfbar? Fehlt ein Kriterium,
   das du in Runde 1 unter „Definition paritätisch“ gemeint hast?
9. **Umfang.** Ist der Bauplan mit rund 500 Zeilen für ein LLM je Sitzung noch handhabbar, oder
   sollte Abschnitt 8 in eine eigene Datei je Phase ausgelagert werden, damit eine Sitzung nur
   ihre Phase lädt?
10. **Was fehlt noch, was würdest du streichen?** Kurz, konkret, mit Verweis auf Abschnitt oder
    Aufgabennummer.

Bitte je Punkt: Position, Begründung, konkreter Vorschlag. Keine Wiederholung der
Grundsatzfragen aus Runde 1.
