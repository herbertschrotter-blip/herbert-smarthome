// API (Bauplan 3.2): Call-Log-Tests – 18 Calls exakt wie v1 (heidi/tests/expected/editor-calls.json), setRoomValue
// mappt Optionen, setTime unterscheidet Domänen, runPlan verweigert bei inaktiv, Teilfehler werden benannt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DxApi, roundInterval } from '../../src/ha/api';
import type { PlanDraft } from '../../src/ha/api';
import type { HomeAssistant, States } from '../../src/ha/types';
import { setDevice } from '../../src/ha/device';
setDevice('heidi', 'Heidi'); // Erwartungen (editor-calls.json) sind für das Gerät „heidi“ geschrieben

const HERE = path.dirname(fileURLToPath(import.meta.url));
type Call = [string, string, Record<string, unknown>];

/** hass-Mock mit Call-Log und Fehlerinjektion (Aufruf-Index oder Entitäts-ID). */
function mockHass(states: States = {}, fail: { index?: number[]; entity?: string[] } = {}) {
  const calls: Call[] = [];
  const api: string[] = [];
  const hass: HomeAssistant = {
    states,
    callService: async (d, s, data) => {
      const i = calls.push([d, s, data ?? {}]) - 1;
      if (fail.index?.includes(i) || fail.entity?.includes(String(data?.entity_id))) throw new Error(`injiziert ${d}.${s} ${String(data?.entity_id)}`);
    },
    callApi: async <T,>(_m: 'GET' | 'POST', p: string) => { api.push(p); return [] as unknown as T; },
  };
  return { hass, calls, api };
}

const DRAFT: PlanDraft = {
  name: 'Saugen + Wischen', raeume: [7, 6, 4, 3, 2, 1], tage: [true, false, false, true, true, false, false], personen: ['nicole', 'herbert'],
  modus: 'Saugen + Wischen', saug: 'Turbo', wasser: 'Mittel', route: 'Standard', wdh: '1',
  ho: 'Leise starten', hoSaug: 'Leise', hoWdh: '1', schnell: true, spSaug: 'Standard', spWdh: '1', aktiv: true, zeit: '10:15', raum: {},
};

test('savePlan: genau die 18 Calls aus der v1-Klickfolge (Reihenfolge und Payloads)', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  const r = await api.savePlan(2, DRAFT);
  assert.deepEqual(r, { ok: true, fehlgeschlagen: [] });
  const want = JSON.parse(fs.readFileSync(path.resolve(HERE, '..', '..', '..', '..', 'heidi', 'tests', 'expected', 'editor-calls.json'), 'utf8')) as Call[];
  assert.equal(calls.length, 18);
  assert.deepEqual(calls, want);
});

test('savePlan: Raumwerte nur gewählter Räume, Zeit HH:MM:00, Schalter aus → turn_off', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  await api.savePlan(3, { ...DRAFT, raeume: [6, 4], aktiv: false, schnell: false, zeit: '19:30', raum: { 6: { modus: 'Saugen', saug: 'Turbo', wdh: '2' }, 1: { modus: 'Nur Wischen', saug: 'Leise', wasser: 'Viel', route: 'Tief', wdh: '3' } } });
  const byId = (id: string) => calls.find((c) => c[2].entity_id === id)!;
  assert.equal(byId('input_text.heidi_plan3_raumwerte')[2].value, '6:S/T/-/-/2', 'Raum 1 ist nicht gewählt und fällt weg');
  assert.equal(byId('input_text.heidi_plan3_raeume')[2].value, '6,4');
  assert.equal(byId('input_datetime.heidi_plan3_zeit')[2].time, '19:30:00');
  assert.equal(byId('input_boolean.heidi_plan3_aktiv')[1], 'turn_off');
  assert.equal(byId('input_boolean.heidi_plan3_schnell')[1], 'turn_off');
});

test('savePlan: Name leer oder keine Räume → kein Call, Grund benannt', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  assert.deepEqual(await api.savePlan(1, { ...DRAFT, name: '   ' }), { ok: false, fehlgeschlagen: [], grund: 'name' });
  assert.deepEqual(await api.savePlan(1, { ...DRAFT, raeume: [] }), { ok: false, fehlgeschlagen: [], grund: 'raeume' });
  assert.equal(calls.length, 0);
});

test('savePlan: Fehlerinjektion Call 5 → Ergebnis nennt genau diese Entität, übrige 17 Calls wurden abgesetzt', async () => {
  const { hass, calls } = mockHass({}, { index: [4] });
  const api = new DxApi(() => hass);
  const r = await api.savePlan(2, DRAFT);
  assert.equal(r.ok, false);
  assert.deepEqual(r.fehlgeschlagen, ['input_text.heidi_plan2_raumwerte']);
  assert.equal(calls.length, 18);
});

test('setRoomValue: Optionen über RV_HA-Inverse, Wdh mit x, „all“ = 7 parallel, Teilfehler', async () => {
  const docked = JSON.parse(fs.readFileSync(path.resolve(HERE, '..', 'fixtures', 'states-docked.json'), 'utf8')) as States;
  const { hass, calls } = mockHass({ 'camera.heidi_map': docked['camera.heidi_map']! }, { entity: ['select.heidi_room_3_suction_level'] }); // „all“ = Räume der Karte
  const api = new DxApi(() => hass);
  await api.setRoomValue(6, 'modus', 'Saugen + Wischen');
  assert.deepEqual(calls[0], ['select', 'select_option', { entity_id: 'select.heidi_room_6_cleaning_mode', option: 'sweeping_and_mopping' }]);
  await api.setRoomValue(2, 'wasser', 'Viel');
  assert.deepEqual(calls[1], ['select', 'select_option', { entity_id: 'select.heidi_room_2_mop_pad_humidity', option: 'wet' }]);
  await api.setRoomValue(1, 'route', 'Tief');
  assert.equal(calls[2]![2].option, 'deep'); assert.equal(calls[2]![2].entity_id, 'select.heidi_room_1_cleaning_route');
  await api.setRoomValue(7, 'wdh', '2');
  assert.deepEqual(calls[3], ['select', 'select_option', { entity_id: 'select.heidi_room_7_cleaning_times', option: '2x' }]);
  const r = await api.setRoomValue('all', 'saug', 'Turbo');
  assert.equal(calls.length, 4 + 7);
  assert.deepEqual(calls.slice(4).map((c) => c[2].entity_id), [1, 6, 7, 2, 4, 3, 5].map((i) => `select.heidi_room_${i}_suction_level`), 'alle Räume der Karte in App-Reihenfolge');
  assert.ok(calls.slice(4).every((c) => c[2].option === 'turbo'));
  assert.deepEqual(r, { ok: false, fehlgeschlagen: ['select.heidi_room_3_suction_level'] });
});

test('setTime unterscheidet time.* und input_datetime.*; leerer Wert → kein Call', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  await api.setTime('time.heidi_dnd_start', '20:00');
  await api.setTime('input_datetime.heidi_rueckkehr', '17:30');
  await api.setTime('input_datetime.heidi_rueckkehr', '');
  assert.deepEqual(calls, [
    ['time', 'set_value', { entity_id: 'time.heidi_dnd_start', time: '20:00:00' }],
    ['input_datetime', 'set_datetime', { entity_id: 'input_datetime.heidi_rueckkehr', time: '17:30:00' }],
  ]);
});

test('setNumber: Domäne aus der ID, Intervall gerundet (v1-Regel)', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  assert.equal(await api.setNumber('input_number.heidi_prognose_intervall', 7), 5);
  assert.equal(await api.setNumber('input_number.heidi_prognose_intervall', 13), 15);
  assert.equal(await api.setNumber('input_number.heidi_prognose_intervall', 25), 20, 'bei Gleichstand gewinnt der kleinere (reduce wie v1)');
  assert.equal(await api.setNumber('input_number.heidi_schnell_minuten', 25), 25, 'andere Zahlen ungerundet');
  await api.setNumber('number.heidi_volume', 60);
  assert.deepEqual(calls[0], ['input_number', 'set_value', { entity_id: 'input_number.heidi_prognose_intervall', value: 5 }]);
  assert.deepEqual(calls[4], ['number', 'set_value', { entity_id: 'number.heidi_volume', value: 60 }]);
  assert.deepEqual([5, 10, 15, 20, 30, 60].map(roundInterval), [5, 10, 15, 20, 30, 60]);
  assert.equal(roundInterval(45), 30); assert.equal(roundInterval(50), 60);
});

test('runPlan: verweigert bei inaktiv ohne Call, sonst script.heidi_plan_starten {plan, variante}', async () => {
  const states: States = { 'input_boolean.heidi_plan2_aktiv': { entity_id: 'input_boolean.heidi_plan2_aktiv', state: 'off', attributes: {} }, 'input_boolean.heidi_plan1_aktiv': { entity_id: 'input_boolean.heidi_plan1_aktiv', state: 'on', attributes: {} } };
  const { hass, calls } = mockHass(states);
  const api = new DxApi(() => hass);
  assert.deepEqual(await api.runPlan(2), { ok: false, fehlgeschlagen: [], grund: 'inaktiv' });
  assert.equal(calls.length, 0);
  assert.deepEqual(await api.runPlan(1), { ok: true, fehlgeschlagen: [] });
  await api.runPlan(1, 'schnell');
  assert.deepEqual(calls, [['script', 'heidi_plan_starten', { plan: 1, variante: 'normal' }], ['script', 'heidi_plan_starten', { plan: 1, variante: 'schnell' }]]);
  assert.deepEqual(await api.runPlan(3), { ok: false, fehlgeschlagen: [], grund: 'inaktiv' }, 'fehlender Helfer gilt als inaktiv');
});

test('vacuum, press, cleanSegments, runScene, toggle, setBoolean, selectOption, prognoseReset, setZones', async () => {
  const { hass, calls } = mockHass();
  const api = new DxApi(() => hass);
  await api.vacuum('return_to_base');
  await api.press('button.heidi_reset_filter');
  await api.cleanSegments([7, 6]);
  await api.runScene(32);
  await api.toggle('input_boolean.heidi_automatik');
  await api.setBoolean('input_boolean.heidi_dark_mode', false);
  await api.selectOption('input_select.heidi_kartendarstellung', 'Xiaomi-Karte');
  await api.selectOption('select.heidi_carpet_cleaning', 'avoid');
  await api.prognoseReset();
  assert.deepEqual(await api.setZones({ zones: [[-4200, -4775, -1150, -2075]], no_mops: [] }), { ok: true, fehlgeschlagen: [] });
  await api.setZones({ zones: [], no_mops: [], walls: [[0, 0, 100, 100]] });
  assert.deepEqual(calls, [
    ['vacuum', 'return_to_base', { entity_id: 'vacuum.heidi' }],
    ['button', 'press', { entity_id: 'button.heidi_reset_filter' }],
    ['dreame_vacuum', 'vacuum_clean_segment', { entity_id: 'vacuum.heidi', segments: [7, 6] }],
    ['script', 'heidi_app_szene', { shortcut_id: 32 }],
    ['input_boolean', 'toggle', { entity_id: 'input_boolean.heidi_automatik' }],
    ['input_boolean', 'turn_off', { entity_id: 'input_boolean.heidi_dark_mode' }],
    ['input_select', 'select_option', { entity_id: 'input_select.heidi_kartendarstellung', option: 'Xiaomi-Karte' }],
    ['select', 'select_option', { entity_id: 'select.heidi_carpet_cleaning', option: 'avoid' }],
    ['shell_command', 'heidi_prognose_reset', {}],
    ['dreame_vacuum', 'vacuum_set_restricted_zone', { entity_id: 'vacuum.heidi', zones: [[-4200, -4775, -1150, -2075]], no_mops: [] }],
    ['dreame_vacuum', 'vacuum_set_restricted_zone', { entity_id: 'vacuum.heidi', zones: [], no_mops: [], walls: [[0, 0, 100, 100]] }],
  ]);
});

test('setZones: Fehler wird benannt; history ruft den v1-Pfad; ohne hass wirft call', async () => {
  const { hass, calls, api: apiLog } = mockHass({}, { index: [0] });
  const api = new DxApi(() => hass);
  assert.deepEqual(await api.setZones({ zones: [], no_mops: [] }), { ok: false, fehlgeschlagen: ['vacuum_set_restricted_zone'] });
  assert.equal(calls.length, 1);
  await api.history(1_700_000_000, 1_700_003_600);
  assert.match(apiLog[0]!, /^history\/period\/2023-11-14T22:13:20\.000Z\?filter_entity_id=sensor\.heidi_phase,vacuum\.heidi&end_time=2023-11-14T23%3A13%3A20\.000Z&minimal_response&no_attributes$/);
  const none = new DxApi(() => undefined);
  await assert.rejects(() => none.vacuum('start'), /Keine Verbindung/);
});

test('fireEvent (PD-017): Admin → POST events/<typ>; ohne Admin-Recht, ohne REST oder bei Fehler kein Wurf', async () => {
  const posts: [string, string, unknown][] = [];
  const mk = (user: HomeAssistant['user'], fail = false): HomeAssistant => ({
    states: {}, ...(user ? { user } : {}), callService: async () => undefined,
    callApi: async <T,>(m: 'GET' | 'POST', p: string, d?: Record<string, unknown>) => { posts.push([m, p, d]); if (fail) throw new Error('403'); return {} as T; },
  });
  assert.equal(await new DxApi(() => mk({ name: 'Herbert', is_admin: true })).fireEvent('dreame_x60_anzeige', { seite: 'start' }), true);
  assert.deepEqual(posts, [['POST', 'events/dreame_x60_anzeige', { seite: 'start' }]]);
  assert.equal(await new DxApi(() => mk({ name: 'Nicole', is_admin: false })).fireEvent('dreame_x60_anzeige', {}), false);
  assert.equal(await new DxApi(() => mk(undefined)).fireEvent('dreame_x60_anzeige', {}), false);
  assert.equal(posts.length, 1);
  assert.equal(await new DxApi(() => mk({ is_admin: true }, true)).fireEvent('dreame_x60_anzeige', {}), false);
  assert.equal(await new DxApi(() => undefined).fireEvent('dreame_x60_anzeige', {}), false);
  assert.equal(await new DxApi(() => ({ states: {}, user: { is_admin: true }, callService: async () => undefined })).fireEvent('x', {}), false);
});
