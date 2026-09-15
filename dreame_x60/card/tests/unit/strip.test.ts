// Streifen: Parität mit v1 (die fünf Streifen-Fälle in status.v1.json) und Spec-Grenzfälle der Reihenfolge-Regel
// (Helfer nur, wenn er genau die active_segments enthält; sonst cleaning_sequence ∩ active_segments; Regeln Abschnitt 6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOrder, stripModel, stripText } from '../../src/domain/strip';
import type { RunInput } from '../../src/domain/strip';
import { readAllRoomValues, readRobot } from '../../src/ha/selectors';
import type { States } from '../../src/ha/types';
import { setDevice } from '../../src/ha/device';
setDevice('heidi', 'Heidi'); // Vektoren und Erwartungen sind für das Gerät „heidi“ geschrieben
import type { RoomId } from '../../src/ha/contract';
import type { RoomValues } from '../../src/domain/raumwerte';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;
const docked = read<States>('states-docked.json');

interface V1Vector { name: string; input: { overrides?: Record<string, { state?: string; attributes?: Record<string, unknown> }> }; output: { strip: string | null } }
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('status.v1.json');

function statesFor(v: V1Vector): States {
  const s: States = { ...docked };
  delete s['camera.heidi_map']; // Parität: v1 kennt keinen Rückfall auf Kartendaten (PD-010, eigener Test in selectors.test.ts/hero.js)
  for (const [id, o] of Object.entries(v.input.overrides ?? {})) {
    const cur = s[id] ?? { entity_id: id, state: 'unknown', attributes: {} };
    s[id] = { entity_id: id, state: o.state ?? cur.state, attributes: { ...cur.attributes, ...(o.attributes ?? {}) } };
  }
  return s;
}

test(`Parität mit ${v1.quelle}: Streifen aller ${v1.vektoren.length} Kopf-Zustände`, () => {
  const stripCases = v1.vektoren.filter((v) => /Streifen/.test(v.name));
  assert.ok(stripCases.length >= 5, 'zu wenige Streifen-Vektoren');
  for (const v of v1.vektoren) {
    const s = statesFor(v);
    const robot = readRobot(s); const rooms = readAllRoomValues(s);
    const got = stripText(stripModel(robot, (id: RoomId) => rooms.rooms[id]));
    assert.equal(got, v.output.strip, `${v.name}: strip`);
  }
});

const base: RunInput = { vac: 'cleaning', currentSegment: 6, activeSegments: [7, 6, 5], cleaningSequence: [1, 6, 7, 2, 4, 3, 5], laufReihenfolge: [7, 6, 5], cleanedArea: 12 };
const vals: RoomValues = { modus: 'Saugen', saug: 'Standard', wasser: null, route: null, wdh: '1' };
const rv = (): RoomValues | null => vals;

test('Reihenfolge: Helfer gilt nur, wenn er genau die active_segments enthält', () => {
  assert.deepEqual(runOrder(base), { order: [7, 6, 5], idx: 1, rest: [5] });
  // Helfer enthält einen Raum zu wenig → Roboter-Reihenfolge, geschnitten mit active_segments
  assert.deepEqual(runOrder({ ...base, laufReihenfolge: [7, 6] }), { order: [6, 7, 5], idx: 0, rest: [7, 5] });
  // Helfer enthält fremde Räume → werden verworfen, Rest passt → Helfer gilt
  assert.deepEqual(runOrder({ ...base, laufReihenfolge: [3, 5, 7, 6] }), { order: [5, 7, 6], idx: 2, rest: [] });
  // Aktueller Raum nicht im Auftrag → rest = ganze Reihenfolge
  assert.deepEqual(runOrder({ ...base, currentSegment: 2 }), { order: [7, 6, 5], idx: -1, rest: [7, 6, 5] });
  // Kein aktueller Raum
  assert.deepEqual(runOrder({ ...base, currentSegment: null }), { order: [7, 6, 5], idx: -1, rest: [7, 6, 5] });
});

test('Streifen: Fälle und Reihenfolge der Prüfungen wie v1', () => {
  assert.equal(stripModel({ ...base, vac: 'docked' }, rv), null, 'nur cleaning/paused');
  assert.equal(stripModel({ ...base, vac: 'returning' }, rv), null, 'returning ohne Streifen');
  assert.equal(stripModel(base, () => null), null, 'ohne Raumwerte kein Streifen');
  assert.equal(stripModel({ ...base, currentSegment: 9 }, rv), null, 'Raum außerhalb 1..7');
  // Fläche 0 schlägt „Fährt durch“ (Prüfreihenfolge)
  assert.equal(stripText(stripModel({ ...base, currentSegment: 2, cleanedArea: 0 }, rv)), 'Fährt zum Startpunkt zu Wohnz.');
  // paused mit Fläche 0 → kein Startpunkt-Fall (nur cleaning)
  assert.equal(stripText(stripModel({ ...base, vac: 'paused', cleanedArea: 0 }, rv)), 'Jetzt: Küche danach Büro SaugenStandard1×');
  // Nur Wischen: Wasser und Route erscheinen
  const nass: RoomValues = { modus: 'Nur Wischen', saug: 'Leise', wasser: 'Viel', route: 'Intensiv', wdh: '3' };
  assert.equal(stripText(stripModel({ ...base, currentSegment: 5 }, () => nass)), 'Jetzt: Büro letzter Raum Nur WischenLeiseVielIntensiv3×');
  // Saugen: kein Wasser, keine Route, auch wenn gesetzt
  const trocken: RoomValues = { modus: 'Saugen', saug: 'Turbo', wasser: 'Viel', route: 'Intensiv', wdh: '2' };
  assert.equal(stripText(stripModel({ ...base, currentSegment: 5 }, () => trocken)), 'Jetzt: Büro letzter Raum SaugenTurbo2×');
  // Leere active_segments: „Fährt durch“ greift nicht, Reihenfolge leer → letzter Raum
  assert.equal(stripText(stripModel({ ...base, activeSegments: [], laufReihenfolge: [] }, rv)), 'Jetzt: Küche letzter Raum SaugenStandard1×');
});
