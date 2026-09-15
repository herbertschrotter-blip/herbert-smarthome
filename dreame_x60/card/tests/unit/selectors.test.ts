// Selektoren: Werte aus states-docked.json (Plan 2 als Referenz), Proxy-Test (jede gelesene ID steht in ids),
// leeres states wirft nichts, Memo-Verhalten, Protokoll-Cache bei unavailable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SELECTORS, readAllRoomValues, readAutomatik, readConsumables, readDiagnostics, readHistory, readLearn, readMap, readPlan, readPlans, readPrognose, readRobot, readRobotSettings, readRoomValues, readSettings, readStation, resetHistoryCache } from '../../src/ha/selectors';
import type { States } from '../../src/ha/types';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const docked = JSON.parse(fs.readFileSync(path.join(FIX, 'states-docked.json'), 'utf8')) as States;
const clone = (s: States): States => JSON.parse(JSON.stringify(s)) as States;
const withState = (s: States, id: string, state: string, attributes?: Record<string, unknown>): States => {
  const c = clone(s); const cur = c[id] ?? { entity_id: id, state: 'unknown', attributes: {} };
  c[id] = { ...cur, state, attributes: { ...cur.attributes, ...(attributes ?? {}) }, last_updated: 'geändert-' + Math.random() };
  return c;
};
const resetAll = () => { for (const sel of Object.values(ALL_SELECTORS)) sel.reset(); resetHistoryCache(); };

test('Plan 2 aus states-docked.json (Referenz)', () => {
  resetAll();
  const p = readPlan(2)(docked);
  assert.equal(p.name, 'Saugen + Wischen');
  assert.deepEqual(p.raeume, [7, 6, 5, 4, 3, 2, 1]);
  assert.equal(p.modus, 'Saugen + Wischen'); assert.equal(p.saug, 'Standard'); assert.equal(p.wasser, 'Mittel'); assert.equal(p.route, 'Standard'); assert.equal(p.wdh, '1');
  assert.deepEqual(p.raum, { 1: { modus: 'Saugen + Wischen', saug: 'Standard', wasser: 'Wenig', route: null, wdh: '1' }, 2: { modus: 'Saugen + Wischen', saug: 'Standard', wasser: 'Viel', route: null, wdh: '1' }, 3: { modus: 'Saugen + Wischen', saug: 'Standard', wasser: 'Mittel', route: null, wdh: '1' } });
  assert.equal(p.tage.length, 7); assert.match(p.zeit, /^\d\d:\d\d$/);
  assert.equal(p.entities.raumwerte, 'input_text.heidi_plan2_raumwerte');
  const plans = readPlans(docked);
  assert.equal(plans.plans.length, 4); assert.equal(plans.plans[2]!.name, 'Küche nach dem Kochen'); assert.deepEqual(plans.plans[2]!.raeume, [6, 4]);
  assert.ok(plans.heute === null || [1, 2, 3, 4].includes(plans.heute));
});

test('Roboter-Sicht aus der Fixture', () => {
  const r = readRobot(docked);
  assert.equal(r.vac, 'docked'); assert.equal(r.running, false); assert.ok(r.battery >= 0 && r.battery <= 100);
  assert.deepEqual(r.hero.buttons.map((b) => b.label), ['Start', 'Orten']);
  assert.equal(r.persons.length, 3); assert.equal(r.persons[0]!.name, 'Herbert'); assert.equal(r.persons[2]!.key, 'nina');
  assert.deepEqual(r.laufReihenfolge, [], 'Helfer unknown → leer');
  assert.equal(r.deutsch, docked['input_select.heidi_raumnamen']!.state === 'Deutsch');
});

test('Raumwerte: Fixture (unavailable) → null, gesetzte Werte → deutsch', () => {
  assert.equal(readRoomValues(6)(docked), null);
  const all = readAllRoomValues(docked);
  assert.equal(all.anyUnavailable, true);
  let s = withState(docked, 'select.heidi_room_6_cleaning_mode', 'sweeping_and_mopping');
  s = withState(s, 'select.heidi_room_6_suction_level', 'turbo'); s = withState(s, 'select.heidi_room_6_mop_pad_humidity', 'moist'); s = withState(s, 'select.heidi_room_6_cleaning_route', 'standard'); s = withState(s, 'select.heidi_room_6_cleaning_times', '2x');
  assert.deepEqual(readRoomValues(6)(s), { modus: 'Saugen + Wischen', saug: 'Turbo', wasser: 'Mittel', route: 'Standard', wdh: '2' });
  const only = withState(docked, 'select.heidi_room_5_cleaning_mode', 'sweeping');
  assert.deepEqual(readRoomValues(5)(only), { modus: 'Saugen', saug: '–', wasser: null, route: null, wdh: '1' });
});

test('Lernwerte, Automatik, Prognose, Verschleiß, Station, Einstellungen, Karte aus der Fixture', () => {
  const lern = readLearn(docked); assert.ok(lern && lern.raten, 'Lernwerte vorhanden');
  assert.equal(readLearn(withState(docked, 'sensor.heidi_lernwerte', 'unavailable')), null);
  const a = readAutomatik(docked); assert.equal(typeof a.on, 'boolean'); assert.ok(a.beiHeimkehrOptions.length >= 3); assert.match(a.rueckkehr, /^\d\d:\d\d$/);
  const p = readPrognose(docked); assert.equal(p.schalter.length, 4); assert.equal(typeof p.tage, 'number');
  const c = readConsumables(docked); assert.equal(c.length, 5); assert.equal(c[0]!.name, 'Hauptbürste'); assert.equal(c[0]!.resetEntity, 'button.heidi_reset_main_brush');
  const st = readStation(docked); assert.equal(st.tiles.length, 4); assert.equal(st.buttons[3]!.confirm, 'Reinigung der Station starten?');
  const se = readSettings(docked); assert.equal(se.prognose.length, 5); assert.deepEqual(se.rotation.labels.slice(0, 2), ['0°', '90°']); assert.ok(se.karte.options.includes('Dreame-App'));
  const rs = readRobotSettings(docked); assert.equal(rs.selects.length, 6); assert.match(rs.dndStart, /^\d\d:\d\d$/);
  const m = readMap(docked); assert.ok(Array.isArray(m.calibrationPoints)); assert.equal(m.roomOrder.length, 7);
});

test('Protokoll: Einträge absteigend, Cache bei unavailable, count/total', () => {
  resetHistoryCache();
  const h = readHistory(docked);
  assert.ok(h.entries.length > 0, 'Fixture hat Protokoll-Einträge');
  for (let i = 1; i < h.entries.length; i++) assert.ok(h.entries[i - 1]!.ts >= h.entries[i]!.ts, 'absteigend');
  assert.ok(h.entries.length <= 30); assert.equal(h.stale, false);
  const gone = withState(docked, 'sensor.heidi_cleaning_history', 'unavailable');
  gone['sensor.heidi_cleaning_history']!.attributes = {};
  const h2 = readHistory(gone);
  assert.equal(h2.entries.length, h.entries.length, 'letzter Stand bleibt');
  assert.equal(h2.stale, true);
});

test('leeres states: kein Selektor wirft, typisierte Leerwerte', () => {
  resetAll();
  for (const [name, sel] of Object.entries(ALL_SELECTORS)) assert.doesNotThrow(() => sel({}), name);
  const r = readRobot({}); assert.equal(r.vac, 'unavailable'); assert.equal(r.battery, 0); assert.equal(r.persons.every((p) => !p.known), true);
  const p = readPlan(1)({}); assert.equal(p.name, ''); assert.deepEqual(p.raeume, []); assert.equal(p.zeit, '09:30'); assert.deepEqual(p.raum, {});
  assert.equal(readLearn({}), null);
  assert.equal(readHistory({}).entries.length >= 0, true);
  const d = readDiagnostics({}); assert.equal(d.missing.length, d.total);
});

test('Proxy: jede gelesene ID steht in den ids des Selektors', () => {
  resetAll();
  for (const [name, sel] of Object.entries(ALL_SELECTORS)) {
    const read = new Set<string>();
    const proxy = new Proxy(clone(docked), { get(t, k) { if (typeof k === 'string') read.add(k); return t[k as keyof typeof t]; } }) as States;
    sel(proxy);
    const ids = new Set(sel.ids);
    const fremd = [...read].filter((k) => !ids.has(k) && k.includes('.'));
    assert.deepEqual(fremd, [], `${name} liest IDs außerhalb seiner Liste`);
  }
});

test('Memo: gleiche Referenz bei unverändertem Input und bei fremder Änderung, neue bei eigener', () => {
  resetAll();
  const r1 = readRobot(docked);
  assert.equal(readRobot(clone(docked)), r1, 'neues Objekt, gleicher Inhalt');
  assert.equal(readRobot(withState(docked, 'input_number.heidi_prognose_wochen', '9')), r1, 'fremde ID');
  const ticked = clone(docked); ticked['vacuum.heidi']!.last_updated = 'tick';
  assert.equal(readRobot(ticked), r1, 'vacuum.heidi nur last_updated → gleich');
  assert.notEqual(readRobot(withState(docked, 'vacuum.heidi', 'cleaning')), r1, 'vacuum state geändert');
  assert.notEqual(readRobot(withState(docked, 'vacuum.heidi', 'docked', { active_segments: [1, 2] })), r1, 'genanntes Attribut geändert');
  const p1 = readPlan(3)(docked);
  assert.equal(readPlan(3)(withState(docked, 'input_text.heidi_plan2_name', 'x')), p1, 'anderer Plan');
  assert.notEqual(readPlan(3)(withState(docked, 'input_text.heidi_plan3_name', 'x')), p1);
});

test('Diagnose: Fixture ohne fehlende IDs; eine entfernte ID wird gemeldet', () => {
  const d = readDiagnostics(docked);
  assert.deepEqual(d.missing, []);
  assert.equal(d.groups.length, 2);
  assert.equal(d.groups[0]!.total + d.groups[1]!.total, d.total);
  const s = clone(docked); delete s['input_number.heidi_min_akku'];
  const d2 = readDiagnostics(s);
  assert.deepEqual(d2.missing, ['input_number.heidi_min_akku']);
  assert.ok(d2.groups[1]!.missing.includes('input_number.heidi_min_akku'), 'Paket-Gruppe');
});
