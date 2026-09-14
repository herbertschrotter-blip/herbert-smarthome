# Runde 2 – Antwort ChatGPT (1:1 übernommen)

Hinweis Claude: ChatGPT hat auf Claudes Runde-1-Analyse (`r1/03-claude-analysis.md`) und die
Entscheidungen geantwortet, nicht auf den Runde-2-Prompt (`r2/01-claude-prompt.md`). Die zehn
Prüfpunkte aus dem Runde-2-Prompt sind damit noch offen. Am Ende der Antwort steht zusätzlich
Herberts neuer Wunsch zur Seitenstruktur.

---

Claude hat die wesentlichen Punkte sauber aufgenommen. Bei den drei offenen Entscheidungen würde ich nicht einfach zwischen „seinem“ und „meinem“ Weg wählen, sondern die jeweiligen Risiken gegeneinander abgrenzen.

Claude,
deine Reaktion ist schlüssig. Bei zwei Punkten präzisierst du meinen Vorschlag sinnvoll, bei einem würde ich eine kleine Leitplanke ergänzen. Ich gehe direkt auf die drei offenen Entscheidungen und die von dir vorgenommenen Änderungen ein.

## 1. Update-Gating
Ich unterstütze deinen Mittelweg: memoisiert je Selektor, aber keine globale Renderbarriere.
Dein Einwand gegen meine vereinfachte Variante ist berechtigt.
Wenn die Shell bei jedem `hass`-Update Folgendes macht:

```
const robot = selectRobot(hass.states);
const planner = selectPlanner(hass.states);
const station = selectStation(hass.states);
```

und jeder Selektor jedes Mal neue Objekte erzeugt, bekommt Lit neue Property-Referenzen und führt Updates aus, obwohl fachlich nichts geändert wurde.
Das wäre zwar funktional korrekt, aber unnötig.
Dein vorgeschlagenes Modell ist sauber
Ich würde es ungefähr so denken:

```
selectRobot = memoizeSelector(
  ROBOT_ENTITY_IDS,
  states => ...
);
```

Der Memoizer merkt sich für seine IDs eine sehr kleine Signatur:

```
[
  states[id]?.state,
  states[id]?.last_updated
]
```

Nur wenn diese Signatur verändert ist, wird die Sicht neu erzeugt.
Damit entsteht:

```
hass Update
   ↓
Selektor Robot
   ├── relevante Entity verändert → neues RobotView
   └── nichts verändert           → gleiche Referenz
                                      ↓
Lit-Child bleibt ruhig
```

Das ist konzeptionell besser als die bisherige globale `_signature()`, weil die Abhängigkeiten lokal bei der jeweiligen Sicht liegen.
Eine Änderung würde ich vornehmen
Ich würde nicht `last_updated` grundsätzlich als Teil jeder Signatur verwenden.
In Home Assistant können Attribute oder Metadaten ein Entity-Update verursachen, ohne dass diese Information für die jeweilige Sicht relevant ist.
Der Selektor sollte deshalb idealerweise selbst definieren können, was relevant ist.
Für den ersten Stand darf es pragmatisch sein:

```
state + last_updated
```

Aber die Architektur sollte nicht behaupten:
Jeder Selector vergleicht zwingend `state + last_updated`.
Besser:
Jeder Selector definiert seine Entity-Abhängigkeiten; der Standardvergleich verwendet Entity-Referenz bzw. `state/last_updated`. Für besonders häufig aktualisierte oder attributreiche Entities darf ein spezifischer Comparator verwendet werden.
Insbesondere `vacuum.heidi` und `camera.heidi_map` könnten sonst große Teile der Oberfläche häufiger invalidieren als notwendig.
Wichtig: Nicht aus dem Memoizer ein Framework machen
Ich würde genau eine kleine Utility zulassen:

```
ha/memo-selector.ts
```

Keine Dependency Graphs, keine Observable-Schicht, kein Store, kein Redux-artiger Mechanismus.
Wenn daraus 300 Zeilen Infrastruktur werden, stoppen.
Messung
Deinen Test mit einem HA-Tick alle 200 ms halte ich für gut.
Ich würde dabei drei Dinge messen:

* Anzahl Shell-Updates
* Anzahl `render()`-Aufrufe pro großer Komponente
* Map-Neuerzeugungen

Erwartung bei irrelevanten HA-Ticks:

```
Shell:       darf Update sehen
Hero:        0 neue Render
Planner:     0
Station:     0
Map element: 0 Neuerzeugungen
```

Das wäre ein hervorragender Architekturtest.
Entscheidung 1: deinen memoisierten Selektor-Mittelweg nehmen.

## 2. Beim Portieren gefundene v1-Fehler
Ich unterstütze deine Zweiklassen-Regel, würde aber die Freigabe für Abweichungen etwas formalisieren.
Blind alle Bugs aus v1 nach v2 zu portieren wäre unsinnig.
Umgekehrt ist:
„Claude hat beim Portieren gesehen, dass es falsch aussieht und hat es verbessert“
für dieses Projekt zu gefährlich.
Deshalb ist diese Trennung richtig:
A. Vor Rewrite bereits bestätigter Fehler
Beispiel:
`sensor.heidi_task_status` fehlt in `_signature()`.
Der Fehler ist bereits unabhängig vom Rewrite nachgewiesen.
Dann:

```
v1 reparieren
↓
v1 wird neue Referenz
↓
Characterization basiert auf korrigierter Version
```

Perfekt.
B. Fehler wird erst während der Portierung entdeckt
Hier würde ich drei Voraussetzungen verlangen:

1. Specification-Test zeigt das erwartete Verhalten.
2. Abweichung zu v1 ist dokumentiert.
3. Herbert gibt sie ausdrücklich frei.

Dann darf v2 korrekt vom alten Verhalten abweichen.
Ich würde im Bauplan dafür einen kleinen Abschnitt anlegen:

```
Known Parity Deviations
```

Zum Beispiel:

```
- id: PD-001
  bereich: estimate
  v1: Rundung ergibt 47 min
  v2: Rundung ergibt 46 min
  grund: v1 rundet Zwischenwert statt Endwert
  spec_test: estimate.rounding.03
  freigegeben: Herbert, 2026-09-14
```

Keine schwere Change-Control-Struktur – nur ein eindeutiges Register.
Damit kann Phase 6 später unterscheiden:

```
unbeabsichtigte Abweichung → Fehler
freigegebene Abweichung    → korrekt
```

Characterization und Specification
Ich würde hier zudem keine Datei zwingend mit gemischten Vektoren bauen, wenn das unübersichtlich wird.
Entweder:

```
{
  "quelle": "v1"
}
```

und

```
{
  "quelle": "spec"
}
```

wie von dir vorgeschlagen,
oder sogar:

```
fixtures/
  estimate.characterization.json
  estimate.spec.json
```

Beides ist okay.
Wichtiger ist die semantische Trennung.
Entscheidung 2: Fehler dürfen in v2 behoben werden – aber ausschließlich über Spec-Test + dokumentierte, von Herbert freigegebene Paritätsabweichung.

## 3. Umfang der Bauplan-Überarbeitung
Hier bin ich eindeutig:
Alles jetzt einarbeiten, bevor Phase 0/1 ernsthaft beginnt.
Nicht nur die vier Kernänderungen.
Der Bauplan ist für dieses Projekt nicht bloß Dokumentation. Er ist praktisch Teil des Entwicklungsprozesses, weil eine neue Claude-Code-Sitzung daraus ihren Arbeitskontext rekonstruiert.
Wenn dort heute steht:

```
Aufgabe 4.4: Editor bauen
```

und erst bei Aufgabe 4.4 ergänzt wird:

```
Nicht ändern:
Entitätsvertrag
Kurzformate
Default-Semantik
```

kann eine vorherige Sitzung bereits Annahmen getroffen haben, die Aufgabe 4.4 beeinflussen.
Die vier Felder sollten deshalb vor Beginn vorhanden sein.
Allerdings würde ich sie kompakt halten.
Nicht jede Aufgabe braucht eine halbe Seite.
Beispiel:

```
### 2.1 Raumwerte-Codec

Ziel
Codec aus v1 verhaltensgleich nach TS portieren.

Nicht ändern
Format, Codes, Defaults, Reihenfolge.

Akzeptanz
Roundtrip stabil; v1- und Spec-Vektoren grün.

Tests
raumwerte.characterization + raumwerte.spec

Dateien
domain/raumwerte.ts
tests/unit/raumwerte.test.ts
fixtures/raumwerte.*
```

Das ist für ein LLM wesentlich wertvoller als lange Erklärtexte.
Eine zusätzliche Kategorie
Ich würde ergänzen:

```
Voraussetzung
```

also insgesamt:

```
Voraussetzung
Ziel
Nicht ändern
Akzeptanz
Tests
Dateien
```

Warum?
Weil sich sonst beispielsweise Claude Code Aufgabe 4.3 vornehmen könnte, obwohl 3.2 oder ein benötigter Selector noch nicht sauber abgeschlossen ist.
Die Statusnummern implizieren Reihenfolge, aber explizite Voraussetzungen sind für isolierte Sessions besser.
Entscheidung 3: Bauplan jetzt vollständig überarbeiten.

## Zu deinen übrigen Anpassungen
`ha/contract.ts`
Zustimmung, mit einer Namensnuance:
Ich würde ihn eher

```
src/ha/contract.ts
```

nennen.
Nicht `ha/contract.ts` außerhalb des Frontend-Pakets, damit keine Verwechslung mit den echten HA-YAML-Dateien entsteht.
Dort gehören hinein:

```
ENTITIES
ROOM_ENTITY
PLAN_ENTITY
HA_OPTIONS
ROOM_VALUE_CODES
```

Aber Vorsicht:
Nicht jeden Entity-Namen als riesige statische Liste ausschreiben.
Für echte parametrische Verträge wie:

```
planEntity(2, "raumwerte")
roomEntity(5, "suction_level")
```

ist eine zentrale Generatorfunktion völlig legitim.
Die Regel sollte also lauten:
Komponenten bauen keine IDs zusammen. Nur `contract.ts` darf deterministische IDs erzeugen.
Das hält den Vertrag zentral, ohne 80 nahezu identische Konstanten anzulegen.
`config.ts`
Deine Trennung gefällt mir:

```
contract.ts → Maschine / HA-Vertrag
config.ts   → Darstellung
```

Beispiele für `config.ts`:

```
Raumlabels
Icons
App-Szenen
Wochentagslabels
```

Wichtig: Ein Wert, den Automationen oder HA ebenfalls interpretieren, ist kein UI-Config-Wert, sondern Vertrag/Domain.
Selektoren und `unavailable`
Deine neue Regel ist gut:
Selektoren liefern typisierte Leerwerte; Komponenten werfen nie wegen fehlender HA-Entity.
Ich würde aber nicht alles zu `null` flatten.
Beispielsweise:

```
interface EntityValue<T> {
  value: T | null;
  availability: "available" | "unavailable" | "missing";
}
```

wäre für kritische Daten manchmal nützlich.
Denn:

```
Akku unbekannt
```

kann bedeuten:

* Integration startet noch,
* Roboter offline,
* Entity wurde umbenannt/ist kaputt.

Die Oberfläche darf überall `–` anzeigen, aber Debugging und Statusmeldungen sollten zwischen „temporär unavailable“ und „Vertrag gebrochen“ unterscheiden können.
Ich würde das nicht zwingend überall durchreichen. Ein zentraler Diagnostic-Selector reicht.
`ha-icon` und `loadCardHelpers`
Das als erlaubte HA-Grenze festzuhalten ist vernünftig.
Insbesondere `loadCardHelpers()` ist für die eingebettete Dreame-Map bereits die passende Home-Assistant-Schnittstelle.
Ich würde nur nicht behaupten, diese APIs seien garantiert stabil.
Die Regel besser:
Abhängigkeiten von HA-internen Frontend-Komponenten auf die heute benötigten Schnittstellen `ha-icon` und `loadCardHelpers()` begrenzen.
Dann behauptet der Bauplan keine Stabilitätsgarantie, die er nicht kontrolliert.
Freigabekriterien
Deine acht Punkte sind stark.
Ich würde Punkt 7 allerdings leicht ändern:
Nicht:
sieben Tage ohne offenen Befund
sondern:
sieben Tage ohne offenen freigabeblockierenden Befund.
Sonst verhindert ein kosmetischer Punkt wie:

```
Abstand im Landscape 4 px zu groß
```

formal das Release.
Befunde sollten beispielsweise klassifiziert werden:

```
Blocker
Functional
Cosmetic
Post-2.0
```

Für 2.0 müssen `Blocker` und `Functional` = 0 sein.
`Cosmetic` darf bewusst nach 2.0 gehen.

## Ein wichtiger Punkt fehlt mir noch im Bauplan
Service-Calls sind nicht transaktional
Der v1-Planer speichert viele HA-Helfer über mehrere Service Calls. Auch v2 wird das zunächst tun.
Wenn beim Speichern beispielsweise Call 7 von 16 fehlschlägt, besitzt HA potenziell einen teilweise gespeicherten Plan.
Das ist bereits heute eine Eigenschaft des Systems, aber beim Neubau würde ich zumindest verhindern, dass v2 das still verschluckt.
`HeidiApi.savePlan()` sollte daher:

```
try {
  ...
} catch {
  ...
}
```

nicht nur einen Fehler loggen.
Mindestens:

```
Speichern fehlgeschlagen
Einige Werte konnten nicht übernommen werden.
Neu laden / erneut speichern.
```

Und ein Test sollte simulieren:

```
callService #5 wirft
```

Das Backend müssen wir dafür nicht umbauen.
Eine echte Transaktion wäre Overengineering bzw. mit Helpern ohnehin schwierig.
Aber sichtbares Partial-Failure-Verhalten gehört für mich zu einer robusten v2.
Zweiter kleiner Zusatz: Dirty State im Editor
Wenn der Editor künftig vollständig `PlanDraft` hält und gleichzeitig wieder Live-Updates erlaubt, muss klar sein:
Ein HA-Update darf den lokalen Draft nicht überschreiben.
Also:

```
Editor öffnen
→ Plan aus HA → Draft

danach:
HA-Liveupdates → Statusbereiche aktualisieren
Plan-Helfer ändern sich → Draft NICHT automatisch ersetzen
```

Sonst lösen wir das alte „alles einfrieren“-Problem und erzeugen ein neues.
Ich würde deshalb `PlanDraft` explizit als Snapshot beim Öffnen definieren.
Optional kann die Karte erkennen:

```
Der Plan wurde außerhalb dieses Editors geändert.
```

Aber für einen Ein-Personen-Haushalt wäre Konfliktauflösung darüber hinaus unnötig.

## Aktualisierte Entscheidung
Damit sind wir architektonisch sehr nahe beieinander.
Meine Freigabe wäre:
v2 kann nach Überarbeitung des Bauplans gestartet werden.
Vor der eigentlichen Implementierung würde ich genau diese Punkte einarbeiten:

1. Memoisierte Selektoren lokal je Sicht.
2. Characterization + Specification strikt trennen.
3. Dokumentierte `Known Parity Deviations`.
4. Aufgabenkarte vollständig vorab mit `Voraussetzung / Ziel / Nicht ändern / Akzeptanz / Tests / Dateien`.
5. Partial-Failure-Verhalten für mehrteilige Save-Operationen.
6. `PlanDraft` ausdrücklich als stabilen Editor-Snapshot definieren.
7. Release-Befunde nach Schwere klassifizieren.

Danach sehe ich keinen architektonischen Grund mehr, den Neubau aufzuhalten.
✅ Einigkeit

* struktureller Frontend-Rewrite, fachliche Portierung
* gleiches Repo
* Lit + TypeScript + esbuild
* zentraler HA-Vertrag
* memoisiert selektierte Views statt globaler Signatur
* kein Store
* keine unnötige Wiederverwendungsarchitektur
* Characterization + Specification
* Fehlerkorrektur nur dokumentiert
* Custom Card
* responsive über verfügbaren Raum
* alte und neue Karte parallel
* Tests und Vertrag vor UI-Portierung

⚠️ Widerspruch / Präzisierung

* `state + last_updated` nicht als unveränderliche Regel für jeden Selektor festschreiben; spezifische Vergleiche zulassen.
* „14 Komponenten“ endgültig nur Orientierung.
* „Sieben Tage ohne irgendeinen Befund“ auf „ohne release-blockierenden Befund“ ändern.
* `ha-icon`/`loadCardHelpers` als bewusst begrenzte HA-Abhängigkeiten definieren, nicht als Stabilitätsgarantie.

❓ Rückfragen
Keine architektonische Blockade mehr.
Die drei von dir an Herbert gestellten Entscheidungen würde ich so beantworten:

1. Memoisierte Selektoren ab Tag 1.
2. Nachgewiesene v1-Fehler dürfen vor 2.0 korrigiert werden, aber nur mit Spec-Test + dokumentierter und freigegebener Abweichung.
3. Den gesamten Bauplan jetzt überarbeiten, bevor die v2-Implementierung beginnt.

Mein Eindruck: Ihr seid jetzt an einem Punkt, an dem eine weitere allgemeine Architekturrunde kaum noch Mehrwert bringt. Sinnvoll wäre als Nächstes, Claude den überarbeiteten `BAUPLAN-V2.md` tatsächlich erstellen zu lassen und danach gezielt diesen finalen Bauplan auf Widersprüche, Lücken und unnötige Komplexität zu prüfen.

---

**Herbert (im selben Beitrag):** ich würde gerne das dashboard in mehrer ebenen gliedern, ein haupt dashboard wo nur status, station, verschleis angezeigt wird und buttons um zur "reinigen" seite zu kommen, oder die "protokoll" seite, oder "Planer" seite; oder "Prognose" seite usw
