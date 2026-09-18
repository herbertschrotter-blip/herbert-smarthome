// Diagnose-Protokoll Schicht 3 (Bauplan F.1, PD-017; Umfang F.2b): Schnappschuss der Anzeige, Erkennen von Änderungen,
// Felder für die Auswertung (Werte-Knöpfe als HA-Werte, „Jetzt“, Reihenfolge, Knöpfe, Laden).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anzeigeDiff, anzeigeSnapshot, anzeigeWerte } from '../../src/domain/anzeige';
import type { AnzeigeInput } from '../../src/domain/anzeige';
import type { RoomValues } from '../../src/domain/raumwerte';
import { ROOM_VALUE_CODES } from '../../src/ha/contract';
import { HEIDI_ROOMS } from './helpers-rooms';

const TAB = { modus: ROOM_VALUE_CODES.RV_HA.modus, saug: ROOM_VALUE_CODES.RV_HA.saug, wasser: ROOM_VALUE_CODES.RV_HA.wasser };
const BTN = (...s: string[]): { service: string }[] => s.map((service) => ({ service }));
const BASE: AnzeigeInput = {
  vac: 'cleaning', currentSegment: 6, activeSegments: [6, 4], cleaningSequence: [], laufReihenfolge: [6, 4], cleanedArea: 3,
  battery: 87, progress: 36.6, charging: false, docked: false,
  hero: { big: 'Tägliches Saugen', sub: 'Saugt Küche', errorChip: null, buttons: BTN('pause', 'stop', 'return_to_base') },
};
const WERTE: Record<number, RoomValues> = { 6: { modus: 'Saugen + Wischen', saug: 'Turbo', wasser: 'Mittel', route: null, wdh: '1' }, 4: { modus: 'Saugen', saug: 'Leise', wasser: 'Viel', route: null, wdh: '1' } };
const werte = (id: number): RoomValues | null => WERTE[id] ?? null;

test('anzeigeSnapshot: Kernwerte, Fortschritt gerundet, Chip-Kurztext, Knöpfe und Laden', () => {
  const s = anzeigeSnapshot(BASE);
  assert.deepEqual([s.kopf, s.schritt, s.hinweis, s.akku, s.fortschritt, s.zustand, s.knoepfe, s.laden], ['Tägliches Saugen', 'Saugt Küche', '', 87, 37, 'cleaning', ['pause', 'stop', 'return_to_base'], false]);
  const d = anzeigeSnapshot({ ...BASE, vac: 'docked', docked: true, charging: true, progress: null, hero: { big: 'Bereit', sub: '', errorChip: { text: 'Staubbeutel voll' }, buttons: BTN('start', 'locate') } });
  assert.deepEqual([d.fortschritt, d.hinweis, d.zustand, d.laden, d.knoepfe, d.reihenfolge, d.jetzt], [null, 'Staubbeutel voll', 'docked', true, ['start', 'locate'], [], null]);
});

test('anzeigeSnapshot im Lauf: Werte-Knöpfe als HA-Werte, „Jetzt“ und angekündigte Reihenfolge', () => {
  const s = anzeigeSnapshot(BASE, werte, HEIDI_ROOMS, TAB);
  assert.deepEqual([s.modus_ha, s.saug_ha, s.wasser_ha, s.jetzt, s.reihenfolge], ['sweeping_and_mopping', 'turbo', 'moist', 6, [6, 4]]);
  // nur Saugen → Karte zeigt beim Wasser „–“ → kein Wert
  const flur = anzeigeSnapshot({ ...BASE, currentSegment: 4 }, werte, HEIDI_ROOMS, TAB);
  assert.deepEqual([flur.modus_ha, flur.saug_ha, flur.wasser_ha, flur.jetzt], ['sweeping', 'quiet', null, 4]);
  // Durchfahrt (Raum gehört nicht zum Auftrag) und Hinweg: kein „Jetzt“
  assert.equal(anzeigeSnapshot({ ...BASE, currentSegment: 7 }, (id) => werte(id) ?? WERTE[4]!, HEIDI_ROOMS, TAB).jetzt, null);
  assert.equal(anzeigeSnapshot({ ...BASE, cleanedArea: 0 }, werte, HEIDI_ROOMS, TAB).jetzt, null);
  // ohne Raumwerte (weder Selects noch Kartendaten): Karte zeigt „–“
  assert.deepEqual([anzeigeSnapshot(BASE, () => null, HEIDI_ROOMS, TAB).modus_ha, anzeigeSnapshot(BASE, () => null, HEIDI_ROOMS, TAB).jetzt], [null, null]);
});

test('anzeigeDiff: ohne Vorgänger alles, sonst nur geänderte Namen, Listen nach Inhalt', () => {
  const a = anzeigeSnapshot(BASE, werte, HEIDI_ROOMS, TAB);
  assert.equal(anzeigeDiff(null, a).length, Object.keys(a).length);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE }, werte, HEIDI_ROOMS, TAB)), []);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE, battery: 86, hero: { ...BASE.hero, sub: 'Saugt Flur' } }, werte, HEIDI_ROOMS, TAB)), ['schritt', 'akku']);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE, progress: 36.9 }, werte, HEIDI_ROOMS, TAB)), []); // gleiche gerundete Zahl = gleiche Anzeige
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE, laufReihenfolge: [4, 6] }, werte, HEIDI_ROOMS, TAB)), ['reihenfolge']);
});

test('anzeigeWerte: Felder ohne Aussage fehlen im Ereignis (Regeln bleiben still), Fortschritt null bleibt', () => {
  const w = anzeigeWerte(anzeigeSnapshot({ ...BASE, vac: 'docked', docked: true, progress: null, hero: { ...BASE.hero, buttons: BTN('start', 'locate') } }));
  assert.deepEqual(Object.keys(w).sort(), ['akku', 'fortschritt', 'hinweis', 'knoepfe', 'kopf', 'laden', 'schritt', 'zustand']);
  assert.equal(w.fortschritt, null);
});
