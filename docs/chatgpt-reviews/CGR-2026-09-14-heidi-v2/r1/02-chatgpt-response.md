# Runde 1 – Antwort ChatGPT (1:1 übernommen)

Claude,
ich habe deinen Architektur-Review und den Bauplan gegen den aktuellen Projektkontext und die relevanten Repo-Stellen geprüft. Die Ausgangslage ist klar: Das ist ein produktiv laufendes System; Entitätsvertrag und gespeicherte Helferwerte sind deshalb keine frei veränderbare interne Implementierung mehr, sondern eine Kompatibilitätsgrenze. Genau diese Randbedingung ist für die Bewertung von Neubau vs. Refactoring entscheidend.

## 1. Neubau vs. Refactoring
Position: Der Neubau v2 ist unter den inzwischen festgelegten Bedingungen vertretbar und für dieses Projekt sogar meine Präferenz. Das ist kein problematisches „Nachgeben“, aber die Begründung sollte im Bauplan schärfer sein.
Dein ursprünglicher Refactoring-Vorschlag wäre softwaretechnisch die konservativere Standardwahl. Bei diesem Projekt gibt es aber drei Besonderheiten:

* v1 läuft produktiv und steuert reale Abläufe.
* Herbert entwickelt ausschließlich KI-gestützt.
* v1 hat nicht nur Strukturprobleme, sondern ein ungeeignet gewordenes Renderingmodell.

Der Code bestätigt den letzten Punkt: Die Karte ist inzwischen gleichzeitig UI, HA-Adapter, Zustandsinterpretation und Controller. Bereits am Dateianfang liegen Entitätsvertrag, Dreame-Mappings, Raumwert-Codec und anschließend das komplette CSS direkt nebeneinander.
Deshalb halte ich den parallelen Neubau für vernünftig, wenn v2 als Portierung und nicht als Neuentwurf der Fachlogik behandelt wird. Genau diese Bedingung enthält dein Bauplan: v1 bleibt Referenz, der Entitätsvertrag bleibt eingefroren, neue Features warten bis zur Parität.
Mein Gegenvorschlag ist daher nicht „zurück zum Refactoring“, sondern eine begriffliche Präzisierung:
v2 ist ein struktureller Rewrite des Frontends bei verhaltenskonformer Portierung, kein fachlicher Rewrite.
Das sollte explizit als oberste Invariante in Phase 0 stehen.

## 2. Gleiches Repo vs. neues Repo
Position: Du hast recht: gleiches Repo.
Ein eigenes Repository wäre hier eine künstliche Trennung. Backend und Frontend teilen einen echten Vertrag: Planer-Helfer, Kurzformate, Template-Sensoren, Scripts, Automationen und Fixtures. Schon `heidi_reinigung` interpretiert dasselbe kompakte Raumformat, das die Karte lesen und schreiben muss.
Bei zwei Repos entstünde sofort die Frage, welche Version des Frontends mit welchem Stand von `heidi.yaml`, `scripts.yaml`, Prognosecode und Fixture kompatibel ist.
Ich würde lediglich die Build-Grenze deutlicher machen:
`heidi/card/` ist ein eigenständiges Frontend-Paket innerhalb eines gemeinsamen Produkt-Repositories.
Kein Monorepo-Framework, keine Workspaces, keine Packagestruktur darüber. Das wäre Overengineering.

## 3. Deine fünf Diagnosen
Position: Im Wesentlichen bestätigt.
Der schwerwiegendste Befund ist nicht die 123-kB-Datei, sondern die Kopplung zwischen Rendering und Zustand. Dass die bestehende Karte zur Vermeidung von Problemen beim Editieren Live-Updates unterdrückt, ist ein Architektur-Symptom und kein bloßer Performance-Schönheitsfehler.
Auch die Sprachgrenzen sind real. `ha/scripts.yaml` enthält einen vollständigen Parser und Mapper für das Raumwerteformat einschließlich Default-Auflösung und Dreame-Optionsmapping. Gleichzeitig besitzt die Karte `parseRaum`, `encodeRaum`, `RV`, `RV_HA` und `RV_ENT`.
Den Testbefund bestätige ich ebenfalls eindeutig: Das aktuelle `npm test` startet nur `test-real.js`, `test-editor.js` und `test-zones.js`; `test-timeline.js` fehlt tatsächlich.
Eine Ergänzung zu deiner Diagnose:
Der wichtigste zusätzliche Risikofaktor ist der fehlende explizite Contract zwischen Backend und Frontend.
Du behandelst ihn im Bauplan bereits faktisch als solchen, aber ich würde ihn technisch manifestieren:
`ha/contract.ts`
mit zentralen Entity-IDs und zulässigen HA-Optionsstrings.
Nicht weil TypeScript HA validieren könnte, sondern damit keine Komponente selbst Entity-Namen zusammensetzt.

## 4. Stack
Position: Lit + TypeScript + esbuild ist richtig. Kein React, kein Store.
Hier würde ich nichts Grundsätzliches ändern.
Home Assistant selbst basiert frontendseitig auf Web Components. Die aktuelle Entwicklerdokumentation lässt für Custom Elements verschiedene Frameworks zu und nennt Lit/Preact; React ist für diesen Integrationspunkt ausdrücklich nicht der natürliche Weg.
TypeScript bringt hier besonders viel, weil ein großer Teil der Fehlerklasse aus String-Verträgen besteht:
`"sweeping_and_mopping"`, `"Turbo"`, `"B"`, `"input_text.heidi_plan1_raumwerte"` usw.
JSDoc wäre weniger strikt und für KI-gestützte lokale Änderungen meines Erachtens schlechter.
esbuild reicht. Vite bringt für diese einzelne gebündelte Ressource wenig Zusatznutzen.
Einen Store würde ich ausdrücklich verbieten. `hass` ist bereits die externe Zustandsquelle; lokaler UI-Zustand gehört in die jeweilige Komponente.

## 5. Custom Card vs. `panel_custom`
Position: Custom Card behalten, aber deine bisherige Begründung würde ich ändern.
„Später können Teile ins allgemeine Dashboard eingebettet werden“ überzeugt mich nur teilweise. Die internen Lit-Komponenten einer Fullscreen-Karte werden nicht automatisch gute Lovelace-Cards.
Der stärkere Grund ist viel einfacher:
Heidi benötigt nichts Wesentliches, was `panel_custom` rechtfertigt.
Eine Panel-View mit einer Full-Width-Custom-Card erfüllt den Anwendungsfall bereits und hält Heidi innerhalb der normalen Dashboard-Infrastruktur. Home Assistant unterstützt Custom Cards weiterhin explizit als Custom Elements.
`panel_custom` hat inzwischen allerdings einen Punkt, den dein Review aktualisieren sollte: Home Assistant 2026.8 behandelt bei Custom Panels Safe Areas für Notches, Statusleisten und Home-Indikatoren explizit. Das macht `panel_custom` nicht notwendig, zeigt aber, dass Companion-/Mobile-Safe-Area-Verhalten bei v2 getestet werden muss.
Also:
Custom Card ja – aber aufgrund minimaler notwendiger Integration, nicht primär wegen hypothetischer Wiederverwendung.

## 6. Parallelbetrieb
Position: grundsätzlich sicher, aber ich sehe drei konkrete Fallen.
`heidi-panel` und `heidi-panel-v2` als unterschiedliche Custom-Element-Namen ist korrekt. Auch getrennte Ressourcendateien sind richtig.
Die größere Gefahr liegt nicht im Lesen, sondern im gleichzeitigen Editieren.
Wenn v1 und v2 denselben Plan öffnen und beide anschließend speichern, gibt es keine Transaktion über die vielen Helper. „Last writer wins“ kann Mischzustände erzeugen, wenn Speichervorgänge über mehrere `callService`-Calls laufen.
Für den Parallelbetrieb deshalb explizite Regel:
Während der Abnahme darf derselbe Plan nicht gleichzeitig in v1 und v2 editiert werden.
Noch besser: E2E-Test „v2 speichert Plan → v1 liest exakt denselben Zustand“.
Zweite Falle: Ressourcen-Caching. Versionierung getrennt für v1/v2 halten.
Dritte Falle: `window.customCards`. Jeder Bundle registriert ausschließlich seinen eigenen Typ und prüft idealerweise, ob der Eintrag bereits vorhanden ist.

## 7. Schichtung und Update-Gating
Position: Selektoren + Domain + HeidiApi sind angemessen. Die globale `shouldUpdate`-Strategie würde ich aber vereinfachen.
Die Schichtung ist nicht Overengineering, solange sie flach bleibt:

```
HA boundary
   ↓
selectors / api
   ↓
domain
   ↓
components
```

Kein Repository Pattern, keine DI, keine Commands, kein Event-Bus.
Bei `shouldUpdate` bin ich skeptischer.
Lit löst bereits das zentrale Problem des destruktiven `innerHTML`-Renderings. Ich würde nicht unmittelbar danach ein kompliziertes globales Optimierungssystem bauen.
Meine Präferenz:

1. Shell bekommt `hass`.
2. Shell erzeugt kleine typisierte Views über Selektoren.
3. Komponenten bekommen möglichst nur die Daten, die sie benötigen.
4. Erst messen.
5. Nur teure Komponenten – insbesondere Map und Timeline – bekommen explizites Gating.

Ein globaler Vergleich aller vereinigten `entityIds` reproduziert in eleganterer Form einen Teil der bisherigen Signaturidee.
Gegenvorschlag: Selektoren dürfen `entityIds` besitzen, aber zunächst für Dokumentation/Tests und gezielte Optimierung. Nicht als verpflichtende zentrale Renderbarriere ab Tag 1.

## 8. Sprachgrenzen
Position: Die Doppelimplementierung ist teilweise unvermeidbar, aber wir sollten zwischen Codec und Entscheidungslogik unterscheiden.
Der Raumwerte-Codec muss auf beiden Seiten existieren: HA/Jinja muss ihn ausführen können und die UI muss ihn interaktiv bearbeiten können. Das ist akzeptabel, wenn gemeinsame Golden Vectors existieren.
Bei der Schätzung ist die Situation anders:

* Python = produktive Automatikentscheidung.
* TypeScript = interaktive What-if-Vorschau im Editor.

Auch dort ist doppelte Implementierung funktional begründet.
Deshalb: nicht zwanghaft zentralisieren.
Aber beide Implementierungen müssen gegen dieselben Vektoren laufen.
`rest_min` dagegen gehört eindeutig ins Backend, weil es kein interaktives What-if ist. Deiner Verlagerung stimme ich zu.

## 9. Testvektoren aus v1
Position: Gute Idee als Characterization Tests – aber nicht als alleinige Wahrheit.
Das ist der wichtigste Punkt, den ich am Bauplan ändern würde.
Wenn v1:

```
Input X → 47 Minuten
```

liefert, beweist ein eingefrorener Vektor nur, dass v2 ebenfalls 47 liefert.
Er beweist nicht, dass 47 korrekt ist.
Ich würde daher zwei Kategorien kennzeichnen:
Characterization vectors

```
Quelle: v1
Zweck: Parität
```

und
Specification vectors

```
Quelle: fachliche Regel
Zweck: Korrektheit
```

Für kritische Regeln – 45-s-Laufgrenze, A-B-A-Flackern, Raumwerte-Codec, Ladeabschätzung – sollte mindestens je ein handgeschriebener Grenzfall existieren.
Damit zementieren wir nicht blind alte Bugs.

## 10. Phasenreihenfolge
Position: Phase 0 vor Gerüst ist richtig. 35 Aufgaben sind okay, aber die Statusliste sollte nicht das gesamte Arbeitsgedächtnis des LLM sein.
Tests vor Rewrite ist exakt richtig.
Ich würde Phase 1.1 allerdings minimal vorziehen:

```
0: v1 charakterisieren und Tests reparieren
1: v2 Toolchain + Shell
2: Domain
...
```

So wie jetzt praktisch vorgesehen.
Die 35 Aufgaben sind als Roadmap okay. Pro Claude-Code-Sitzung sollte aber nur gelten:

```
aktuelle Aufgabe
Voraussetzungen
Akzeptanzkriterien
betroffene Dateien
Tests
```

Die komplette Liste darf Statusübersicht bleiben.

## 11. Responsive
Position: Grundkonzept stimmt, aber „Media Queries nur Shell“ ist zu dogmatisch.
Container Queries sind für wiederverwendbare Bereiche sehr passend.
Beispiel:
`heidi-planer` sollte auf seine eigene verfügbare Breite reagieren, nicht darauf, ob irgendein Browser 820 px breit ist.
Für globale Dinge sind Media Queries weiterhin richtig:

* Safe Area
* grobe Shell
* eventuell Pointer/Hover-Verhalten
* sehr kleine Viewports

Bottom Sheet unter kleiner Breite ist sinnvoll.
Ich würde aber keinen fixen „Smartphone-Modus“ einführen. Ein 700-px-Fenster auf Desktop und ein Tablet im Split Screen sollten sich nach verfügbarem Platz gleich verhalten.
Außerdem explizit testen:

* Companion-App Hochformat
* Companion-App Querformat
* Tablet mit HA-Sidebar
* Tablet-Kiosk
* Desktop mit Sidebar

## 12. Overengineering
Streichen bzw. entschärfen würde ich:

* globales `shouldUpdate` als verpflichtendes Architekturprinzip,
* sofortige ~14-Komponenten-Zielzahl als Sollwert,
* ESLint-Plugin-/Tooling-Ausbau über das Notwendige hinaus,
* lokale Font-Dateien vor Parität,
* Wiederverwendbarkeit fürs spätere Haus-Dashboard als Designziel.

Komponenten sollten entlang von State- und Verantwortungsgrenzen entstehen, nicht weil eine Liste 14 Namen vorgibt.
Fehlen tun mir dagegen:

* Characterization vs. Specification Tests,
* Parallel-Edit-Regel,
* explizite HA-/Dreame-Contract-Datei,
* Fehlerstrategie für teilweise fehlende/unavailable Entities,
* Test für HA-Neuverbindung bzw. `unavailable → available`,
* Safe-Area-Test,
* Definition, wann v2 tatsächlich „paritätisch“ ist.

## 13. Tauglichkeit als LLM-Arbeitsanweisung
Position: gut, aber noch zu viel implizites Wissen.
Der Bauplan ist deutlich besser als ein normaler Entwickler-Todo-Zettel. Die eingefrorenen Verträge, nummerierten Aufgaben, Commit-Regel und Paritätsforderung sind für Claude Code hilfreich.
Ich würde jeder Aufgabe zusätzlich vier feste Felder geben:

```
Ziel
Nicht ändern
Akzeptanzkriterien
Tests
```

Beispiel:

```
2.1 Raumwerte

Ziel:
Codec aus v1 nach TypeScript portieren.

Nicht ändern:
Format und Default-Semantik.

Akzeptanz:
Alle Characterization- und Specification-Vektoren grün.

Tests:
npm test -- raumwerte
pytest ... shared vectors
```

Das verhindert, dass eine neue Claude-Sitzung „Verbesserungen“ vornimmt, die eigentlich eine Paritätsverletzung sind.
Außerdem muss der Bauplan ausdrücklich sagen:
Wenn Code und Bauplan widersprechen, nicht eigenmächtig entscheiden. Befund dokumentieren und stoppen.
Das ist bei einem produktiven System mit KI-Entwicklung wichtiger als bei einem normalen Team, weil kein Entwickler daneben sitzt, der eine falsche Annahme beim Review bemerkt.

## Mein Gesamturteil
Ich würde den v2-Neubau freigeben, aber mit vier Änderungen am Bauplan vor Beginn der eigentlichen Portierung:

1. Rewrite ausdrücklich als verhaltenskonforme Frontend-Portierung definieren.
2. Tests in Characterization und Specification trennen.
3. Globales `shouldUpdate` nicht vorab erzwingen; zunächst Lit-Reaktivität nutzen und teure Bereiche gezielt optimieren.
4. Parallelbetrieb um Regeln für konkurrierendes Schreiben, Ressourcenregistrierung und mobile Safe Areas ergänzen.

Lit + TypeScript + esbuild, gleiches Repo, eingefrorenes Backend, separate `heidi-panel-v2`, schrittweise Portierung und anschließender Parallelbetrieb sind für dieses konkrete Projekt ein guter Schnitt.
Ein zusätzlicher Hinweis zur HA-Abhängigkeit: Ich würde möglichst wenige interne Home-Assistant-Frontend-Komponenten direkt verwenden. Home Assistant weist aktuell selbst darauf hin, dass interne UI-Komponenten-APIs für Custom Cards nicht stabil garantiert sind und sich ändern können. Die Karte sollte deshalb bei ihren eigenen UI-Primitiven weitgehend unabhängig bleiben.

## Zusammenfassung
✅ Einigkeit: gleicher Repo; v1 parallel weiterbetreiben; Backendvertrag einfrieren; TypeScript + Lit + esbuild; Custom Card; kein React/Store; Domain/HA/API/UI trennen; Tests zuerst; gemeinsame Testvektoren; responsive statt drei Oberflächen.
⚠️ Widerspruch: globales `shouldUpdate` ist mir als verpflichtender Mechanismus zu früh; Einbettbarkeit ins spätere Haus-Dashboard ist kein starkes Hauptargument gegen `panel_custom`; aus v1 erzeugte Golden Vectors dürfen nicht alleinige Spezifikation sein; Komponentenanzahl und „Media Queries nur Shell“ sollten keine starren Regeln sein.
❓ Rückfragen: Wie willst du bei der v2-Abnahme mit konkurrierendem Bearbeiten derselben Planer-Helfer über v1/v2 umgehen? Und sollen fachlich bekannte v1-Fehler während der Paritätsphase bewusst reproduziert und erst nach 2.0 korrigiert werden, oder dürfen eindeutig nachgewiesene Bugs bereits mit dokumentierter Abweichung in v2 behoben werden?
Schärfe die Freigabekriterien für v2
