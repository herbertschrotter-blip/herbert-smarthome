# Runde 2 – Claudes Einschätzung

## Zu ChatGPTs sieben Punkten: alle übernehmen

| Punkt | Bewertung | Umsetzung im Bauplan |
|---|---|---|
| 1. Memoisierte Selektoren je Sicht, kein globales Gating; Standardvergleich `state + last_updated`, je Selektor eigener Vergleich erlaubt (v. a. `vacuum.heidi`, `camera.heidi_map`); eine Utility `memo-selector.ts`, Abbruch bei > 100 Zeilen | Das ist mein Mittelweg aus Runde 1 mit einer sinnvollen Lockerung. **ChatGPT empfiehlt jetzt das Gegenteil von dem, was Herbert in Runde 1 gewählt hat** (Herbert: „ChatGPTs Weg“ = Lit zuerst). Beide Reviewer sind sich jetzt einig; Herbert entscheidet neu. | Regel 10 neu; Aufgabe 3.1 baut `memo-selector.ts`; Aufgabe 4.12 misst Shell-Updates, `render()` je Komponente, Karten-Neuerzeugungen mit der Erwartung 0/0/0 bei irrelevanten Ticks |
| 2. Zweiklassen-Regel für v1-Fehler plus Register `Known Parity Deviations` (PD-001 …) | Richtig, macht Abschnitt 10 eindeutig | Neuer Abschnitt 10a „Paritätsabweichungen“ mit Feldern id, bereich, v1, v2, grund, spec_test, freigegeben |
| Vektoren als getrennte Dateien statt gemischt mit `quelle` | Getrennte Dateien sind für ein LLM klarer | `fixtures/<thema>.v1.json` und `<thema>.spec.json` |
| 3. Sechs Felder je Aufgabe: Voraussetzung / Ziel / Nicht ändern / Akzeptanz / Tests / Dateien, kompakt | Voraussetzung und Dateien fehlten mir tatsächlich | Alle Karten in Abschnitt 8 bekommen die zwei Felder; Texte werden gekürzt |
| `src/ha/contract.ts` mit Generatorfunktionen statt 80 Konstanten; Regel „nur contract.ts erzeugt IDs“ | So war es in der Zielstruktur schon gemeint (`ha/contract.ts` war Kurzschreibweise für `src/ha/`) | Regel 1 präzisiert, Pfad überall `src/ha/contract.ts` |
| `EntityValue<T>` mit `availability` nur über einen zentralen Diagnose-Selektor | Guter Kompromiss: UI zeigt „–“, Debugging unterscheidet „unavailable“ von „fehlt“ | `readDiagnostics(states)` liefert je Vertragsgruppe fehlende/unavailable IDs; Anzeige in den Einstellungen unter der Versionszeile |
| `ha-icon`/`loadCardHelpers` als begrenzte Abhängigkeit, nicht als Stabilitätsgarantie | Formulierung war ungenau | Regel 12 umformuliert |
| Punkt 7 der Freigabe: „ohne freigabeblockierenden Befund“, Klassen Blocker / Functional / Cosmetic / Post-2.0 | Richtig, sonst blockiert Kosmetik das Release | Abschnitt 10 bekommt eine Schwere-Spalte; Abschnitt 11 Punkt 5 und 7 angepasst |
| Partial-Failure bei `savePlan` (16 Calls, keine Transaktion): sichtbare Meldung, Editor bleibt offen, Test „Call 5 wirft“ | Wichtig und billig | Aufgabe 3.2 und 4.4 ergänzt; `HeidiApi.savePlan` liefert `{ok, fehlgeschlagen: string[]}`; Editor zeigt Meldung und bleibt mit Draft offen |
| `PlanDraft` als Snapshot beim Öffnen; HA-Updates ersetzen den Draft nie; optionaler Hinweis „außerhalb geändert“ | Der Hinweis ist billig (Vergleich `last_updated` der Plan-Helfer beim Öffnen vs. jetzt) | Aufgabe 4.4 ergänzt; Hinweis als Zeile im Editor-Kopf |

Hinweis: ChatGPT hat auf meine Runde-1-Analyse geantwortet, nicht auf den Runde-2-Prompt. Die
zehn Detailfragen zum Bauplan (Aufgabenkarten, Vektor-Werkzeug, Spec-Grenzfälle, Messanordnung,
Round-Trip-Gegenrichtung, Umfang) sind noch offen. ChatGPT selbst schlägt vor, genau diese
Prüfung als nächsten und letzten Schritt zu machen.

## Zu Herberts Wunsch: mehrere Ebenen (Startseite + Unterseiten)

**Was gewünscht ist:** Eine Startseite mit Status, Station, Verschleiß und Schaltflächen zu den
Seiten „Reinigen“, „Protokoll“, „Planer“, „Prognose“ usw.

**Einordnung gegen Regel 2 (Parität vor neuen Funktionen):** Das ist keine neue Funktion,
sondern eine andere Anordnung derselben Bereiche. Die Paritäts-Checkliste prüft Funktionen,
nicht die Seitenaufteilung. Ich würde die Seitenstruktur deshalb **jetzt festlegen** und als
erste, bewusste Abweichung eintragen (PD-000 „Navigation“), statt erst die v1-Einseitenansicht
nachzubauen und danach umzubauen. Das wäre doppelte Arbeit ohne Nutzen. Voraussetzung nach
`CLAUDE.md`: großer Umbau zuerst als Mockup.

**Zwei technische Wege:**

| Weg | Wie | Vorteile | Nachteile |
|---|---|---|---|
| **A. HA-Unteransichten (Empfehlung)** | Das YAML-Dashboard bekommt mehrere Views: `start` (Hauptansicht) und `reinigen`, `planer`, `protokoll`, `prognose`, `einstellungen` als `subview: true` mit `back_path: /heidi-v2/start`, jede `type: panel` mit `custom:heidi-panel-v2` und Konfiguration `page: reinigen`. Die Schaltflächen auf der Startseite lösen HA-Navigation aus (`navigate`-Event). | Eigene URL je Seite, Zurück-Knopf im HA-Kopf und Browser-Zurück funktionieren, Companion-App-Verhalten wie überall in HA, keine eigene Router-Logik, Sidebar zeigt nur die Startseite. Jede Seite ist ein kleines Bundle-Stück derselben Datei. | Wechsel zwischen Seiten erzeugt die Karte neu; Caches (Zeitleiste, Karten-Element) müssen auf Modulebene liegen, nicht in der Instanz. Sechs Views im YAML statt einer. |
| B. Interne Navigation | Wie v1s Tabs: `view`-Zustand in der Shell, Schaltflächen setzen ihn. | Ein View im YAML, Zustand bleibt beim Seitenwechsel. | Kein Browser-Zurück, keine URL, in der Companion-App führt „Zurück“ aus dem Dashboard heraus; eigene Router-Logik; Escape/Overlay-Logik wird komplexer. |

Weg A nutzt genau das, was HA für diesen Fall vorsieht. Ich würde ihn nehmen.

**Vorschlag für den Seitenschnitt** (Grundlage für das Mockup, Herbert passt an):
- **Start**: Hero mit Streifen und Knöpfen, Automatik-Einzeiler mit Schalter, Station,
  Verschleiß, sechs Navigations-Kacheln (Reinigen, Planer, Protokoll, Prognose, Räume,
  Einstellungen). Prognose-Kachel zeigt die drei Werte von heute.
- **Reinigen**: Karte, Raum-Chips, Sperrzonen, Stühle, App-Szenen, Knopf „Räume (Roboter-Werte)“.
- **Planer**: Planer-Liste, Editor, Dauer & Akku, Automatik-Regeln.
- **Protokoll**: Letzter Lauf, Protokoll mit Zeitleiste, Lernwerte.
- **Prognose**: wie der heutige Tab.
- **Einstellungen**: Zahnrad-Panel plus Roboter-Einstellungen als Seite statt Seitenleiste.

**Auswirkung auf den Bauplan:** neue Aufgabe vor Phase 4 „Mockup Seitenstruktur“ (statisches
HTML unter `heidi/mockups/heidi-v2-seiten.html`, Herbert nimmt ab), Dashboard-YAML mit sechs
Views in 1.3, Shell rendert nach `config.page`, Navigations-Kacheln als kleine Komponente,
Caches auf Modulebene, Paritäts-Checkliste bleibt, plus Zeile „Navigation: jede Seite
erreichbar, Zurück führt zur Startseite“.

## Entscheidungen, die ich Herbert stelle

1. **Gating neu entscheiden**: memoisierte Selektoren ab Tag 1 (jetzt von beiden empfohlen)
   oder bei „Lit zuerst, messen“ bleiben.
2. **Seitenstruktur**: HA-Unteransichten jetzt mit Mockup vorab (Empfehlung), interne
   Navigation jetzt, oder erst nach 2.0.
3. **Serie**: Runde 3 als Detailprüfung des fertigen Bauplans (die zehn offenen Fragen), oder
   Serie abschließen und mit Aufgabe 0.1 beginnen.
