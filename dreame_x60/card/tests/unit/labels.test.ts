// Beschriftungen: Parität mit v1 (labels.v1.json) und feste Ausgabeformate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dayLabel, fmtDate, fmtDur, fmtHistTs, fmtMin, fmtTime, roomLabel, roomName } from '../../src/domain/labels';
import { HEIDI_ROOMS } from './helpers-rooms';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;

interface V1Vector { name: string; input: { fn: string; args: unknown[] }; output: { result: string; today: string } }
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('labels.v1.json');
const docked = read<Record<string, { state: string }>>('states-docked.json');
const deutsch = docked['input_select.heidi_raumnamen']?.state === 'Deutsch';

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Beschriftungen`, () => {
  assert.ok(v1.vektoren.length >= 20);
  for (const v of v1.vektoren) {
    const a = v.input.args[0] as never;
    const today = new Date(v.output.today);
    const got = v.input.fn === '_dayLabel' ? dayLabel(a)
      : v.input.fn === '_roomLabel' ? roomLabel((a as { __set: number[] }).__set, HEIDI_ROOMS)
      : v.input.fn === '_fmtMin' ? fmtMin(a)
      : v.input.fn === 'fmtDate' ? fmtDate(a === '__today__' ? v.output.today : a, today)
      : v.input.fn === 'roomName' ? roomName(a, deutsch)
      : `unbekannt: ${v.input.fn}`;
    assert.equal(got, v.output.result, v.name);
  }
});

test('fmtMin: 59/60/61/125', () => {
  assert.equal(fmtMin(59), '59 min');
  assert.equal(fmtMin(60), '1 h 00 min');
  assert.equal(fmtMin(61), '1 h 01 min');
  assert.equal(fmtMin(125), '2 h 05 min');
  assert.equal(fmtMin(59.4), '59 min');
  assert.equal(fmtMin(0), '0 min');
});

test('fmtDur (Zeitleiste): < 1 min, Minuten, Stunden', () => {
  assert.equal(fmtDur(0.5), '< 1 min');
  assert.equal(fmtDur(1), '1 min');
  assert.equal(fmtDur(2.99), '3 min');
  assert.equal(fmtDur(59.4), '59 min');
  assert.equal(fmtDur(60), '1 h 00 min');
  assert.equal(fmtDur(96), '1 h 36 min');
});

test('fmtDate: heute / anderer Tag / ungültig; fmtTime; fmtHistTs', () => {
  const now = new Date(2026, 8, 15, 9, 30);
  assert.equal(fmtDate(new Date(2026, 8, 15, 6, 24), now), 'heute 06:24');
  assert.equal(fmtDate(new Date(2026, 8, 14, 9, 31), now), '14.09. 09:31');
  assert.equal(fmtDate('nix', now), '–');
  assert.equal(fmtTime(new Date(2026, 8, 15, 6, 4)), '06:04');
  assert.equal(fmtTime('nix'), '–');
  assert.equal(fmtHistTs(new Date(2026, 8, 14, 9, 31).getTime() / 1000), 'Mo., 14.09. 09:31'); // 14.09.2026 ist ein Montag; de-AT kürzt „Mo.,“
});

test('dayLabel / roomLabel / roomName Grenzfälle', () => {
  assert.equal(dayLabel([true, true, true, true, true, false, false]), 'Mo–Fr');
  assert.equal(dayLabel([true, true, true, true, false, false, false]), 'Mo Di Mi Do');
  assert.equal(dayLabel([true, false, false, false, false, false, true]), 'Mo + So');
  assert.equal(roomLabel([7, 7, 7, 7, 7, 7, 7], HEIDI_ROOMS), 'Wohnz., Wohnz., Wohnz., Wohnz., Wohnz., Wohnz., Wohnz.', 'sieben gleiche IDs sind nicht „Alle“');
  assert.equal(roomLabel(new Set([2, 1]), HEIDI_ROOMS), 'Schlafz., Bad');
  assert.equal(roomLabel([1, 2], [{ id: 1, name: 'Bad', short: 'Bad', icon: '', order: 1 }, { id: 2, name: 'Küche', short: 'Küche', icon: '', order: 2 }]), 'Alle', '„Alle“ hängt an der Raumliste des Roboters');
  assert.equal(roomName('Kitchen', false), 'Kitchen');
  assert.equal(roomName(null, true), '–');
});
