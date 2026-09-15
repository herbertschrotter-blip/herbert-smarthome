// Geräteprofil (Stufe 2): Räume aus der Karte in App-Reihenfolge (2 … 20 Räume, versteckte weg), Kurznamen/Symbole nach
// Standardregel, Optionen aus den Selects (auch unbekannte Werte), Fähigkeiten aus dem Vorhandensein der Entitäten;
// Selektoren folgen der Raumliste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOM_TYPES, roomIcon, roomsFromMap, shortName } from '../../src/domain/rooms';
import { optionLabel, readProfile } from '../../src/ha/profile';
import { readAllRoomValues, readDiagnostics, readMap } from '../../src/ha/selectors';
import { discoverFromStates } from '../../src/ha/device';
import { roomEntity } from '../../src/ha/contract';
import type { States } from '../../src/ha/types';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const docked = JSON.parse(fs.readFileSync(path.join(FIX, 'states-docked.json'), 'utf8')) as States;
discoverFromStates(docked);
const clone = (s: States): States => JSON.parse(JSON.stringify(s)) as States;

/** Abzug mit anderer Raumliste: nur die genannten Räume in der Karte (mit Namen), Raum-Selects passend, Rest weg. */
function withRooms(states: States, rooms: Record<number, { name: string; order?: number; visibility?: string }>): States {
  const s = clone(states);
  const cam = s['camera.heidi_map']!;
  const src = cam.attributes.rooms as Record<string, Record<string, unknown>>;
  const template = src['1']!;
  const out: Record<string, Record<string, unknown>> = {};
  for (const [id, r] of Object.entries(rooms)) out[id] = { ...template, room_id: Number(id), name: r.name, custom_name: r.name, order: r.order ?? Number(id), visibility: r.visibility ?? 'Visible' };
  cam.attributes = { ...cam.attributes, rooms: out };
  for (const k of Object.keys(s)) if (/^select\.heidi_room_\d+_/.test(k)) delete s[k];
  for (const id of Object.keys(rooms)) for (const f of ['cleaning_mode', 'suction_level', 'cleaning_times', 'mop_pad_humidity', 'cleaning_route'] as const) {
    const ref = states[roomEntity(1, f)]!;
    s[roomEntity(Number(id), f)] = { ...ref, entity_id: roomEntity(Number(id), f) };
  }
  return s;
}

test('Kurzname und Symbol nach Standardregel', () => {
  assert.equal(shortName('Wohnzimmer'), 'Wohnz.'); assert.equal(shortName('Schlafzimmer'), 'Schlafz.'); assert.equal(shortName('Kinderzimmer'), 'Kinderz.');
  assert.equal(shortName('Küche'), 'Küche'); assert.equal(shortName('WC'), 'WC'); assert.equal(shortName('Bad'), 'Bad'); assert.equal(shortName('Büro'), 'Büro');
  assert.equal(shortName('Hauswirtschaftsraum'), 'Hauswi.'); assert.equal(shortName('Gäste-WC'), 'Gäste-.');
  assert.equal(roomIcon('Bad'), 'mdi:shower'); assert.equal(roomIcon('Gäste WC'), 'mdi:toilet'); assert.equal(roomIcon('Küche'), 'mdi:chef-hat');
  assert.equal(roomIcon('Living Room'), 'mdi:sofa-outline'); assert.equal(roomIcon('Kinderzimmer'), 'mdi:teddy-bear'); assert.equal(roomIcon('Balkon'), 'mdi:balcony');
  assert.equal(roomIcon('Raum 12'), 'mdi:floor-plan', 'unbekannt → Grundriss'); assert.equal(roomIcon('Raum 12', 'mdi:home-outline'), 'mdi:floor-plan', 'Standardsymbol der Integration zählt nicht');
  assert.equal(roomIcon('Raum 12', 'mdi:star'), 'mdi:star', 'eigenes Symbol der Integration bleibt');
});

test('Standardtypen der App (type 1..15): Name wie in der App, Symbol je Typ, Zählsuffix; Original = Name der Integration', () => {
  const rooms = { 1: { name: 'Living Room', type: 1, order: 1 }, 2: { name: 'Bathroom', type: 6, order: 2 }, 3: { name: 'Primary Bedroom 2', type: 2, order: 3 }, 4: { name: 'Meine Kammer', custom_name: 'Meine Kammer', type: 0, order: 4 }, 5: { name: 'Office', type: 12, order: 5 } } as unknown as Record<string, never>;
  assert.deepEqual(roomsFromMap(rooms, true).map((r) => [r.id, r.name, r.short, r.icon]), [
    [1, 'Wohnzimmer', 'Wohnz.', 'mdi:sofa-outline'], [2, 'Bad', 'Bad', 'mdi:shower'], [3, 'Schlafzimmer 2', 'Schlafz. 2', 'mdi:bed-king-outline'],
    [4, 'Meine Kammer', 'Meine.', 'mdi:wardrobe-outline'], [5, 'Büro', 'Büro', 'mdi:monitor'],
  ]);
  assert.deepEqual(roomsFromMap(rooms, false).map((r) => r.name), ['Living Room', 'Bathroom', 'Primary Bedroom 2', 'Meine Kammer', 'Office'], 'Original: Namen der Integration');
  assert.equal(Object.keys(ROOM_TYPES).length, 15, 'alle 15 Typen der App');
});

test('Heidi-Abzug: sieben Räume in App-Reihenfolge, Kurznamen wie v1, Raum 8 (versteckt) fehlt', () => {
  const p = readProfile(docked);
  assert.deepEqual(p.rooms.map((r) => [r.id, r.short, r.icon]), [[1, 'Bad', 'mdi:shower'], [6, 'Küche', 'mdi:chef-hat'], [7, 'Wohnz.', 'mdi:sofa-outline'], [2, 'Schlafz.', 'mdi:bed-king-outline'], [4, 'Flur', 'mdi:foot-print'], [3, 'WC', 'mdi:toilet'], [5, 'Büro', 'mdi:desk']]);
  assert.deepEqual(p.roomIds, [1, 6, 7, 2, 4, 3, 5]);
  const hidden = roomsFromMap({ ...(docked['camera.heidi_map']!.attributes.rooms as Record<string, never>), 8: { name: 'Room 8', visibility: 'Hidden', order: 0 } as never });
  assert.ok(!hidden.some((r) => r.id === 8), 'versteckter Raum fehlt');
  assert.deepEqual(roomsFromMap(null), []); assert.deepEqual(roomsFromMap({ x: { name: 'kaputt' } as never }), []);
});

test('Optionen aus den Selects mit deutscher Beschriftung; unbekannte Werte bleiben lesbar', () => {
  const p = readProfile(docked);
  assert.deepEqual(p.options.modus.map((o) => o.value), ['sweeping', 'mopping', 'sweeping_and_mopping', 'mopping_after_sweeping']);
  assert.deepEqual(p.options.modus.map((o) => o.label), ['Saugen', 'Nur Wischen', 'Saugen + Wischen', 'Wischen nach Saugen']);
  assert.deepEqual(p.options.route.map((o) => o.label), ['Schnell', 'Standard', 'Intensiv', 'Tief']);
  assert.deepEqual(p.options.saug.map((o) => o.label), ['Leise', 'Standard', 'Stark', 'Turbo']);
  assert.deepEqual(p.options.wdh.map((o) => o.label), ['1', '2', '3']);
  assert.equal(optionLabel('modus', 'ultra_deep_clean'), 'Ultra deep clean');
  // globale Selects fehlen → Optionen des ersten Raums
  const s = clone(docked);
  for (const k of ['select.heidi_cleaning_mode', 'select.heidi_suction_level', 'select.heidi_mop_pad_humidity', 'select.heidi_cleaning_route']) delete s[k];
  const q = readProfile(s);
  assert.deepEqual(q.options.saug.map((o) => o.value), ['quiet', 'standard', 'strong', 'turbo']);
  assert.ok(q.options.modus.length >= 3);
});

test('Fähigkeiten: vorhanden = Entität existiert; fehlende Station', () => {
  const p = readProfile(docked);
  assert.ok(p.has('selfClean') && p.has('dryingTime') && p.has('vac'));
  const s = clone(docked);
  delete s['button.heidi_self_clean']; delete s['select.heidi_drying_time'];
  const q = readProfile(s);
  assert.ok(!q.has('selfClean') && !q.has('dryingTime') && q.has('vac'));
});

test('andere Raumliste: 3 Räume und 20 Räume – Selektoren, Karte und Diagnose folgen', () => {
  const drei = withRooms(docked, { 2: { name: 'Küche', order: 2 }, 5: { name: 'Wohnzimmer', order: 1 }, 9: { name: 'Bad', order: 3 } });
  const p3 = readProfile(drei);
  assert.deepEqual(p3.roomIds, [5, 2, 9]);
  assert.deepEqual(readMap(drei).roomOrder.map((r) => r.short), ['Wohnz.', 'Küche', 'Bad']);
  const all3 = readAllRoomValues(drei);
  assert.deepEqual(Object.keys(all3.rooms).map(Number).sort((a, b) => a - b), [2, 5, 9]);
  assert.equal(readDiagnostics(drei).missing.length, 0, 'Diagnose kennt nur die drei Räume');
  const zwanzig = withRooms(docked, Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, { name: `Raum ${i + 1}`, order: 20 - i }])));
  const p20 = readProfile(zwanzig);
  assert.equal(p20.rooms.length, 20);
  assert.deepEqual(p20.roomIds.slice(0, 3), [20, 19, 18], 'App-Reihenfolge');
  assert.equal(Object.keys(readAllRoomValues(zwanzig).rooms).length, 20);
  assert.equal(readDiagnostics(zwanzig).missing.length, 0);
  assert.ok(readAllRoomValues.ids.includes('select.heidi_room_20_cleaning_mode'), 'ids folgen der Raumliste');
  // ohne Karte: Rückfall auf die Raum-Selects (Name aus dem friendly_name der Integration), Werte dort unavailable → null
  const ohne = clone(docked); delete ohne['camera.heidi_map'];
  assert.deepEqual(readProfile(ohne).rooms.map((r) => [r.id, r.name]), [[1, 'Bad'], [2, 'Schlafzimmer'], [3, 'Wc'], [4, 'Flur'], [5, 'Büro'], [6, 'Küche'], [7, 'Wohnzimmer']]);
  assert.deepEqual(Object.values(readAllRoomValues(ohne).rooms), [null, null, null, null, null, null, null]);
  const nichts: States = { 'vacuum.heidi': docked['vacuum.heidi']! };
  assert.deepEqual(readProfile(nichts).rooms, [], 'ohne Karte und ohne Selects: keine Räume, nichts wirft');
  assert.deepEqual(readAllRoomValues(nichts).rooms, {});
});
