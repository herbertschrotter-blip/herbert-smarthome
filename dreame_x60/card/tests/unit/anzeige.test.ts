// Diagnose-Protokoll Schicht 3 (Bauplan F.1, PD-017): Schnappschuss der Anzeige und Erkennen von Änderungen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anzeigeDiff, anzeigeSnapshot } from '../../src/domain/anzeige';
import type { AnzeigeInput } from '../../src/domain/anzeige';

const BASE: AnzeigeInput = { vac: 'cleaning', battery: 87, progress: 36.6, hero: { big: 'Tägliches Saugen', sub: 'Saugt Küche', errorChip: null } };

test('anzeigeSnapshot: sichtbare Kernwerte, Fortschritt gerundet, Chip-Kurztext', () => {
  assert.deepEqual(anzeigeSnapshot(BASE), { kopf: 'Tägliches Saugen', schritt: 'Saugt Küche', hinweis: '', akku: 87, fortschritt: 37, zustand: 'cleaning' });
  const s = anzeigeSnapshot({ ...BASE, vac: 'docked', progress: null, hero: { big: 'Bereit', sub: '', errorChip: { text: 'Staubbeutel voll' } } });
  assert.deepEqual([s.fortschritt, s.hinweis, s.zustand], [null, 'Staubbeutel voll', 'docked']);
});

test('anzeigeDiff: ohne Vorgänger alles, sonst nur geänderte Namen, gleiche Anzeige = leer', () => {
  const a = anzeigeSnapshot(BASE);
  assert.deepEqual(anzeigeDiff(null, a), ['kopf', 'schritt', 'hinweis', 'akku', 'fortschritt', 'zustand']);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE })), []);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE, battery: 86, hero: { ...BASE.hero, sub: 'Saugt Flur' } })), ['schritt', 'akku']);
  assert.deepEqual(anzeigeDiff(a, anzeigeSnapshot({ ...BASE, progress: 36.9 })), []); // gleiche gerundete Zahl = gleiche Anzeige
});
