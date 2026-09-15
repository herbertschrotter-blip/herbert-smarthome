# UX-Anforderung (Post-2.0): App-artige Übergänge zwischen Bento-Kacheln und Detailansichten

Status: **vorgemerkt, nicht im Scope des v2-Neubaus** (Herbert, 15.09.2026). Wird nach erreichter v1-Parität
(Bauplan 6.5) gezielt umgesetzt. Bis dahin gilt nur der Abschnitt „Leitplanken für den laufenden Bau“.
ClickUp: „Post-2.0: App-artige Übergänge Bento ↔ Detail“ (https://app.clickup.com/t/123ztrcv2wj).

## Grundidee

Heidi soll sich langfristig weniger wie ein klassisches Home-Assistant-Dashboard und mehr wie eine hochwertige
native Geräte-App bzw. ein Automotive-HMI anfühlen. Beim Öffnen einer Detailansicht soll deshalb nicht einfach
„alte Ansicht weg → neue Ansicht da“ passieren, sondern wichtige Navigationen bekommen fließende, räumlich
nachvollziehbare Übergänge.

## Wichtigster Übergang: Bento → Detail

Beispiel: Auf der Übersicht liegt die Kachel „Verschleiß“ (Hauptbürste 78 %, Filter 82 %). Beim Antippen erweitert
sich diese Kachel optisch zu ihrer Detailansicht:

```
Bento-Kachel  →  Expand / Morph  →  Detailansicht
Detailansicht →  Collapse / Morph →  ursprüngliche Bento-Kachel
```

Beim Zurücknavigieren wird die Bewegung logisch umgekehrt. So bleibt sichtbar, woher die Detailansicht kam.

## Bewegungssprache (spätere Designregel)

| Übergang | Bewegung |
|---|---|
| Bento → Detail | Expand / Morph |
| Detail → Bento | Collapse / Morph |
| Tabwechsel | kurzer Crossfade oder dezenter horizontaler Übergang |
| Einstellungen / sekundäres Panel | Slide-in |
| Mobile Detailaktionen | gegebenenfalls Bottom Sheet (heute schon: `dx-dialog` als Sheet) |
| Dialoge | Fade + dezentes Scale |
| Statusänderungen | kurze, ruhige Transition |
| Karte / Raumauswahl | dezente Highlight-/Fade-Transition |

Nicht jede Aktion braucht eine Animation. Animationen erklären funktional: Woher kommt etwas? Wohin geht etwas?
Was hat sich verändert?

## Designcharakter

Passend zum Automotive Dark Bento Design: ruhig, hochwertig, präzise, schnell, nicht verspielt. Keine übertriebenen
Bounce-Effekte, kein permanentes Glowing, keine Animation um der Animation willen. Normale UI-Transitions ca.
120–300 ms je nach Übergang (heute: `--dx-dur` 160 ms, `--dx-ease`); ein großer Bento→Detail-Morph darf etwas
länger dauern, solange sich die Oberfläche unmittelbar anfühlt.

## Technische Leitplanke (für die spätere Umsetzung)

- Innerhalb der eigenen Lit-/Web-Component-Struktur umsetzen; nicht von HA-internen UI-Bausteinen abhängig
  machen (Bauplan Regel 12).
- CSS-Transitions, Web Animations API und geeignete Web-Plattform-Techniken (z. B. View Transitions API, wenn
  verfügbar) bevorzugen. Keine große Animationsbibliothek einführen, solange CSS bzw. Browser-APIs ausreichen
  (Regel 14: keine externen Ressourcen zur Laufzeit).
- `prefers-reduced-motion` berücksichtigen: Morph/Slide stark reduzieren oder durch einfachen Fade bzw. sofortigen
  Zustandswechsel ersetzen. Animation ist nie Voraussetzung, um einen Zustand zu verstehen.

## Leitplanken für den laufenden Bau (gelten ab jetzt, ohne Scope-Erweiterung)

Heute nur architektonisch nicht verbauen; nach erfolgreicher v2-Parität gezielt implementieren. Konkret:

1. **Navigation innerhalb Heidi bleibt an einer Stelle** (`shared/navigate.ts`, Ereignis `dx-navigate`). Heute
   sind die sechs Seiten HA-Unteransichten (`/dreame-x60/<page>`, PD-000); HA baut die Karte beim Ansichtswechsel
   neu auf. Für Morph-Übergänge muss die Karte Detailseiten später **selbst** rendern (eine HA-Ansicht, interner
   `page`-Zustand, URL weiterhin per `pushState`). Dieser Wechsel darf nur `navigate.ts` und die Shell betreffen –
   deshalb: **keine Komponente hängt am HA-Ansichts-Lebenszyklus** (kein `connectedCallback`-Laden, das beim
   Seitenwechsel verloren geht; Modul-Caches wie heute).
2. **Übersicht und Detailansichten bleiben in einem Dashboard / einer Karte** – nicht auf getrennte HA-Dashboards
   verteilen, wenn sie fachlich zur Heidi-Oberfläche gehören.
3. **Kachel ↔ Detail semantisch verknüpfbar halten**: Die Flächen der Übersicht tragen stabile `data-slot`-Namen
   (`hero`, `map`, `automatik`/`auftrag`, `heute`, `planer`, `consumables`, `station`, `stats`, `quickstart`,
   `history`); die Bausteine der Detailseiten heißen entsprechend (`dx-consumables` ↔ Verschleiß auf
   Einstellungen/Verlauf usw.). Diese Namen sind später die Anker für Morph-Übergänge (z. B.
   `view-transition-name`) – nicht umbenennen, nicht doppelt vergeben.
4. **Komponentenidentitäten und Zustandsgrenzen** wie in Bauplan Abschnitt 7: eine Komponente je Verantwortung,
   Sichten aus memoisierten Selektoren. Ein Element, das auf Übersicht und Detailseite erscheint, bekommt eine
   `variant`-Eigenschaft (`compact`/`full`) statt zwei getrennter Elemente – so kann dieselbe Identität morphen.
5. **Keine Animations-Infrastruktur auf Vorrat**, keine Transition jetzt implementieren, wenn sie nicht Teil der
   aktuellen Aufgabe ist. Bestehende kleine Übergänge (`fade`, `up` im Dialog, Toast) bleiben bei `--dx-dur`.

## Weitere Ideen (Post-2.0, Herbert 15.09.2026): Kopfzeile als Einstieg, Seitenleiste optional

Alle vier Ideen sind Anzeige- und Navigationsfunktionen ohne neue Backend-Logik; die Daten gibt es schon.
ClickUp: „Post-2.0: Kopfzeile als Einstieg (Kalender, Zuhause, Nicht stören) + Seitenleiste optional“ (https://app.clickup.com/t/123ztrcv2wx).

1. **Seitenleiste weglassen, alles über die Kacheln öffnen.** Sobald der Bento→Detail-Morph existiert, sind die
   Kacheln der natürliche Einstieg (Karte → Reinigen, Planer → Planer, Letzte Läufe/Statistik → Verlauf, Heute →
   Prognose). Zwei Seiten haben keine Kachel und brauchen dann einen festen Einstieg in der Kopfzeile:
   Einstellungen (Zahnrad rechts) und Räume (über Karte oder Roboter-Panel). Am Handy gibt es heute schon keine
   Seitenleiste (Tab-Leiste). Einschätzung: sinnvoll, aber erst nach dem Morph entscheiden – ohne Übergang wirkt
   „Kachel antippen → Seite wechselt“ wie heute die Seitenleiste, nur mit weniger Orientierung.
2. **Uhrzeit antippen → Kalender** mit vergangenen und künftigen Fahrten: vergangene Läufe aus
   `sensor.heidi_cleaning_history`, künftige aus den vier Planer-Einträgen (Wochentage + Uhrzeit, nächste
   Vorkommen berechnen) und aus der Automatik (heutiger Eintrag, Prognose-Fenster). Rein clientseitig.
   **Variante „Familienkalender in HA“ (Herbert, 15.09.):** Ein HA-Kalender (Integration „Lokaler Kalender“ oder ein
   bestehender Google-/CalDAV-Familienkalender) als gemeinsame Ablage. Automationen tragen abgeschlossene Läufe per
   `calendar.create_event` ein, der Planer beim Speichern die geplanten; die Karte liest die Termine über die
   Kalender-REST-Schnittstelle von HA (`/api/calendars/<entity_id>?start=…&end=…`, stabil wie die History-API).
   Familientermine (Urlaub, Homeoffice, Besuch) könnten später „Abweichung heute“ und den Homeoffice-Modus speisen;
   die Prognose lernt weiter aus der echten Anwesenheit. Regel: Der Planer bleibt die Wahrheit für die Zeitpläne, der
   Kalender spiegelt sie nur. Backend-Arbeit (neue Entität, Automationen) → nach 6.5.
3. **„Zu Hause“ antippen → wer ist wann zu Hause**: heutiger Verlauf der drei Personen aus der HA-Historie
   (`person.*`, History-API wie die Zeitleiste), dazu die Prognose-Heatmaps (`/local/prognose_<name>.png`), die
   die Seite Prognose schon zeigt. Denkbar als Dialog mit Tagesbalken je Person + Link zur Prognose.
4. **„Nicht stören“ antippen → Fenster „Zeiten“**: Nicht-stören-Zeit (`time.heidi_dnd_start/_end`), Arbeitszeit/
   Homeoffice (`input_datetime.heidi_arbeitszeit_*`, Homeoffice-Verhalten der Einträge), übliche Rückkehr,
   Schnellprogramm-Minuten. Das sind heute Felder auf Einstellungen/Planer; hier nur neu gruppiert. Einschätzung:
   der einfachste der vier Punkte, kann direkt nach 4.11 (Einstellungen) als eigener Dialog kommen.

Leitplanke für heute: Die drei Meta-Felder der Kopfzeile bleiben eigene Elemente mit stabilen Klassen
(`.mi.time`, `.mi.home`, `.mi.dnd`), damit sie später anklickbar werden und als Morph-Anker dienen können.

## Zielbild

Heidi bekommt langfristig eine eigene, konsistente Bewegungssprache. Der wiederkehrende Übergang
Bento → Detail → Bento kann ein charakteristisches UX-Merkmal von Heidi werden.
