// check-fixture.js – prüft einen Zustandsabzug (tools/dump-states.ps1) gegen den Entitäts-Vertrag
// (Bauplan Abschnitt 4). Meldet fehlende IDs und IDs im Zustand unavailable/unknown.
// Exit-Code 1, wenn eine Vertrags-ID fehlt. Aufruf: node tools/check-fixture.js tests/fixtures/states-docked.json
//
// Die ID-Liste steht hier bis Aufgabe 2.0 (src/ha/contract.ts); danach importiert dieses Skript den Vertrag.
import fs from 'node:fs';

const ROOM_IDS = [1, 2, 3, 4, 5, 6, 7];
const PLAN_N = [1, 2, 3, 4];
const ids = [];
const add = (...x) => ids.push(...x);

// Roboter (Dreame-Integration)
add('vacuum.heidi', 'camera.heidi_map');
add(...['status', 'error', 'task_status', 'battery_level', 'current_room', 'cleaned_area', 'cleaning_time', 'cleaning_history',
  'cleaning_count', 'total_cleaned_area', 'total_cleaning_time', 'first_cleaning_date',
  'main_brush_left', 'side_brush_left', 'filter_left', 'sensor_dirty_left', 'wheel_dirty_left',
  'dust_bag_status', 'clean_water_tank_status', 'dirty_water_tank_status', 'detergent_status', 'low_water_warning',
  'auto_empty_status', 'self_wash_base_status'].map((s) => `sensor.heidi_${s}`));
add(...['reset_main_brush', 'reset_side_brush', 'reset_filter', 'reset_sensor', 'reset_wheel',
  'start_auto_empty', 'self_clean', 'manual_drying', 'base_station_cleaning'].map((s) => `button.heidi_${s}`));
for (const r of ROOM_IDS) add(...['cleaning_mode', 'suction_level', 'cleaning_times', 'mop_pad_humidity', 'cleaning_route'].map((k) => `select.heidi_room_${r}_${k}`));
add('switch.heidi_customized_cleaning');
add(...['carpet_cleaning', 'water_temperature', 'drying_time', 'auto_empty_mode', 'self_clean_frequency', 'cleangenius', 'map_rotation'].map((s) => `select.heidi_${s}`));
add('number.heidi_self_clean_area', 'number.heidi_volume', 'time.heidi_dnd_start', 'time.heidi_dnd_end');

// Paket (ha/packages/heidi.yaml)
for (const n of PLAN_N) {
  add(...['name', 'raeume', 'tage', 'personen', 'raumwerte'].map((k) => `input_text.heidi_plan${n}_${k}`));
  add(...['modus', 'saugstufe', 'wasser', 'route', 'wiederholungen', 'homeoffice', 'ho_saug', 'ho_wdh', 'sp_saug', 'sp_wdh'].map((k) => `input_select.heidi_plan${n}_${k}`));
  add(`input_boolean.heidi_plan${n}_aktiv`, `input_boolean.heidi_plan${n}_schnell`, `input_datetime.heidi_plan${n}_zeit`);
}
add('sensor.heidi_heutiger_plan', 'sensor.heidi_automatik_status', 'sensor.heidi_phase', 'sensor.heidi_prognose', 'sensor.heidi_lernwerte');
add('binary_sensor.heidi_jemand_zu_hause', 'binary_sensor.heidi_arbeitszeit', 'binary_sensor.heidi_nicht_storen');
add(...['automatik', 'dark_mode', 'planer_bereich', 'prognose_aktiv', 'abweichung_heute', 'nina_zaehlt', 'prog_herbert', 'prog_nicole', 'prog_nina', 'auto_lauf'].map((s) => `input_boolean.heidi_${s}`));
add('input_boolean.stuehle_am_boden');
add('input_text.heidi_auto_letzter_plan', 'input_text.heidi_raum_snapshot', 'input_text.heidi_lauf_reihenfolge');
add('input_datetime.heidi_letzte_auto_reinigung', 'input_datetime.heidi_arbeitszeit_start', 'input_datetime.heidi_arbeitszeit_ende', 'input_datetime.heidi_rueckkehr');
add('input_select.heidi_kartendarstellung', 'input_select.heidi_raumnamen', 'input_select.heidi_bei_heimkehr');
add(...['schnell_minuten', 'min_akku', 'prognose_intervall', 'prognose_aufloesung', 'prognose_wochen', 'prognose_halbwert', 'prognose_mindesttage'].map((s) => `input_number.heidi_${s}`));
add('person.herbert_schrotter', 'person.nicole_2', 'person.nina_2');

const file = process.argv[2];
if (!file) { console.error('Aufruf: node tools/check-fixture.js <states.json>'); process.exit(2); }
const states = JSON.parse(fs.readFileSync(file, 'utf8'));
const missing = ids.filter((id) => !states[id]);
const unavailable = ids.filter((id) => states[id] && ['unavailable', 'unknown'].includes(states[id].state));
const extra = Object.keys(states).filter((id) => !ids.includes(id));
const leaks = Object.entries(states).filter(([, s]) => s.attributes && ('latitude' in s.attributes || 'longitude' in s.attributes || /token=(?!ENTFERNT)/.test(String(s.attributes.entity_picture || '')))).map(([id]) => id);

console.log(`${file}: ${Object.keys(states).length} Entitäten, Vertrag ${ids.length} IDs, vacuum.heidi = ${states['vacuum.heidi']?.state ?? '–'}`);
console.log(`  fehlend (Vertrag gebrochen): ${missing.length}${missing.length ? '\n    ' + missing.join('\n    ') : ''}`);
console.log(`  unavailable/unknown (vorübergehend): ${unavailable.length}${unavailable.length ? '\n    ' + unavailable.join('\n    ') : ''}`);
console.log(`  zusätzlich im Abzug (nicht im Vertrag): ${extra.length}`);
if (leaks.length) console.log(`  ACHTUNG Geheimnisse/GPS in: ${leaks.join(', ')}`);
if (missing.length || leaks.length) process.exitCode = 1;
