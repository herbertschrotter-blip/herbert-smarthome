// Vertrag (Bauplan Abschnitt 4): jede ID ist über contract.ts erreichbar, Generatoren bilden die richtigen IDs,
// Optionsstrings stimmen mit ha/packages/heidi.yaml überein, der Abzug „angedockt“ enthält alle Vertrags-IDs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import { ENTITIES, HA_OPTIONS, PERSONS, PLAN_NUMBERS, ROOM_VALUE_CODES, allContractIds, historyPath, planEntity, roomEntity } from '../../src/ha/contract';
import { HEIDI_ROOM_IDS } from './helpers-rooms';
import { setDevice } from '../../src/ha/device';
setDevice('heidi', 'Heidi'); // Abschnitt 4 ist für das Gerät „heidi“ geschrieben

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');

// Abschnitt 4 als Liste (unabhängig von contract.ts geschrieben, damit ein Tippfehler dort auffällt)
const SECTION4: string[] = [
  'vacuum.heidi', 'camera.heidi_map', 'select.heidi_selected_map', 'camera.heidi_map_data', // Kartenwahl (4.3), Datenkarte (4.3b, 15.09.)
  ...['status', 'error', 'task_status', 'battery_level', 'current_room', 'cleaned_area', 'cleaning_time', 'cleaning_progress', 'cleaning_history', 'cleaning_count', 'total_cleaned_area', 'total_cleaning_time', 'first_cleaning_date'].map((s) => `sensor.heidi_${s}`),
  ...['main_brush_left', 'side_brush_left', 'filter_left', 'sensor_dirty_left', 'wheel_dirty_left'].map((s) => `sensor.heidi_${s}`),
  ...['reset_main_brush', 'reset_side_brush', 'reset_filter', 'reset_sensor', 'reset_wheel'].map((s) => `button.heidi_${s}`),
  ...['dust_bag_status', 'clean_water_tank_status', 'dirty_water_tank_status', 'detergent_status', 'low_water_warning', 'auto_empty_status', 'self_wash_base_status'].map((s) => `sensor.heidi_${s}`),
  ...['start_auto_empty', 'self_clean', 'manual_drying', 'base_station_cleaning'].map((s) => `button.heidi_${s}`),
  'button.heidi_clear_warning', // Warnung quittieren (PD-015, 17.09.)
  'switch.heidi_customized_cleaning',
  ...['cleaning_mode', 'suction_level', 'mop_pad_humidity', 'cleaning_route'].map((s) => `select.heidi_${s}`), // globale Selects (Optionslisten, Geräteprofil Stufe 2)
  ...['carpet_cleaning', 'water_temperature', 'drying_time', 'auto_empty_mode', 'self_clean_frequency', 'cleangenius', 'map_rotation'].map((s) => `select.heidi_${s}`),
  'number.heidi_self_clean_area', 'number.heidi_volume', 'time.heidi_dnd_start', 'time.heidi_dnd_end',
  'sensor.heidi_heutiger_plan', 'sensor.heidi_automatik_status', 'sensor.heidi_phase', 'sensor.heidi_prognose', 'sensor.heidi_lernwerte',
  'binary_sensor.heidi_jemand_zu_hause', 'binary_sensor.heidi_arbeitszeit', 'binary_sensor.heidi_nicht_storen',
  ...['automatik', 'dark_mode', 'planer_bereich', 'prognose_aktiv', 'abweichung_heute', 'nina_zaehlt', 'prog_herbert', 'prog_nicole', 'prog_nina', 'auto_lauf'].map((s) => `input_boolean.heidi_${s}`),
  'input_boolean.stuehle_am_boden',
  'input_text.heidi_auto_letzter_plan', 'input_text.heidi_raum_snapshot', 'input_text.heidi_lauf_reihenfolge',
  'input_datetime.heidi_letzte_auto_reinigung', 'input_datetime.heidi_arbeitszeit_start', 'input_datetime.heidi_arbeitszeit_ende', 'input_datetime.heidi_rueckkehr',
  'input_select.heidi_kartendarstellung', 'input_select.heidi_raumnamen', 'input_select.heidi_bei_heimkehr',
  ...['schnell_minuten', 'min_akku', 'prognose_intervall', 'prognose_aufloesung', 'prognose_wochen', 'prognose_halbwert', 'prognose_mindesttage'].map((s) => `input_number.heidi_${s}`),
  'person.herbert_schrotter', 'person.nicole_2', 'person.nina_2',
];
for (const n of [1, 2, 3, 4]) {
  for (const k of ['name', 'raeume', 'tage', 'personen', 'raumwerte']) SECTION4.push(`input_text.heidi_plan${n}_${k}`);
  for (const k of ['modus', 'saugstufe', 'wasser', 'route', 'wiederholungen', 'homeoffice', 'ho_saug', 'ho_wdh', 'sp_saug', 'sp_wdh']) SECTION4.push(`input_select.heidi_plan${n}_${k}`);
  SECTION4.push(`input_boolean.heidi_plan${n}_aktiv`, `input_boolean.heidi_plan${n}_schnell`, `input_datetime.heidi_plan${n}_zeit`);
}
for (const r of [1, 2, 3, 4, 5, 6, 7]) for (const k of ['cleaning_mode', 'suction_level', 'cleaning_times', 'mop_pad_humidity', 'cleaning_route']) SECTION4.push(`select.heidi_room_${r}_${k}`);

test('jede ID aus Abschnitt 4 ist über contract.ts erreichbar – und umgekehrt', () => {
  const ids = new Set(allContractIds(HEIDI_ROOM_IDS));
  const missing = SECTION4.filter((id) => !ids.has(id));
  assert.deepEqual(missing, [], 'fehlen in contract.ts');
  const extra = [...ids].filter((id) => !SECTION4.includes(id));
  assert.deepEqual(extra, [], 'in contract.ts, aber nicht in Abschnitt 4');
  assert.equal(ids.size, SECTION4.length);
});

test('Generatoren bilden die IDs wie v1', () => {
  assert.equal(planEntity(2, 'raumwerte'), 'input_text.heidi_plan2_raumwerte');
  assert.equal(planEntity(4, 'homeoffice'), 'input_select.heidi_plan4_homeoffice');
  assert.equal(planEntity(1, 'aktiv'), 'input_boolean.heidi_plan1_aktiv');
  assert.equal(planEntity(3, 'zeit'), 'input_datetime.heidi_plan3_zeit');
  assert.equal(roomEntity(5, 'suction_level'), 'select.heidi_room_5_suction_level');
  assert.equal(roomEntity(1, ROOM_VALUE_CODES.RV_ENT.wdh), 'select.heidi_room_1_cleaning_times');
  assert.deepEqual([...PLAN_NUMBERS], [1, 2, 3, 4]);
  assert.equal(roomEntity(20, 'cleaning_mode'), 'select.heidi_room_20_cleaning_mode', 'Raum-IDs sind nicht auf 1..7 begrenzt');
  assert.equal(ENTITIES.nichtStoeren, 'binary_sensor.heidi_nicht_storen');
  assert.equal(PERSONS[2].optional, 'input_boolean.heidi_nina_zaehlt');
  assert.match(historyPath('2026-09-15T00:00:00.000Z', '2026-09-15T08:00:00.000Z'), /^history\/period\/2026-09-15T00:00:00\.000Z\?filter_entity_id=sensor\.heidi_phase,vacuum\.heidi&end_time=2026-09-15T08%3A00%3A00\.000Z&minimal_response&no_attributes$/);
});

test('Optionsstrings entsprechen ha/packages/heidi.yaml', () => {
  const pkg = loadYaml(fs.readFileSync(path.join(ROOT, 'ha', 'packages', 'heidi.yaml'), 'utf8')) as { input_select: Record<string, { options: string[] }> };
  const opt = (name: string) => pkg.input_select[name]?.options.map(String);
  assert.deepEqual(opt('heidi_plan1_modus'), [...HA_OPTIONS.modus]);
  assert.deepEqual(opt('heidi_plan1_saugstufe'), [...HA_OPTIONS.saug]);
  assert.deepEqual(opt('heidi_plan1_wasser'), [...HA_OPTIONS.wasser]);
  assert.deepEqual(opt('heidi_plan1_route'), [...HA_OPTIONS.route]);
  assert.deepEqual(opt('heidi_plan1_wiederholungen'), [...HA_OPTIONS.wdh]);
  assert.deepEqual(opt('heidi_plan1_homeoffice'), [...HA_OPTIONS.ho]);
  assert.deepEqual(opt('heidi_plan1_ho_saug'), [...HA_OPTIONS.saug3]);
  assert.deepEqual(opt('heidi_plan1_ho_wdh'), [...HA_OPTIONS.wdh2]);
  assert.deepEqual(opt('heidi_kartendarstellung'), [...HA_OPTIONS.kartendarstellung]);
  assert.deepEqual(opt('heidi_raumnamen'), [...HA_OPTIONS.raumnamen]);
  assert.deepEqual(opt('heidi_bei_heimkehr'), [...HA_OPTIONS.beiHeimkehr]);
  // Kurzcodes decken genau die Optionen ab
  assert.deepEqual(Object.values(ROOM_VALUE_CODES.RV.modus).sort(), [...HA_OPTIONS.modus].sort());
  assert.deepEqual(Object.values(ROOM_VALUE_CODES.RV.saug).sort(), [...HA_OPTIONS.saug].sort());
  assert.deepEqual(Object.values(ROOM_VALUE_CODES.RV_HA.wasser).sort(), [...HA_OPTIONS.wasser].sort());
  assert.deepEqual(Object.values(ROOM_VALUE_CODES.RV_HA.route).sort(), [...HA_OPTIONS.route].sort());
});

test('Abzug „angedockt“ enthält jede Vertrags-ID', () => {
  const states = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'fixtures', 'states-docked.json'), 'utf8')) as Record<string, unknown>;
  const missing = allContractIds(HEIDI_ROOM_IDS).filter((id) => !(id in states));
  assert.deepEqual(missing, []);
});
