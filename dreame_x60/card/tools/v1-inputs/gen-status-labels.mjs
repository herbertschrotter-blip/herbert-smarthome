// Erzeugt tools/v1-inputs/status.json und labels.json (alle Kombinationen für 2.5, Beschriftungen für 2.6).
// Aufruf: node tools/v1-inputs/gen-status-labels.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ── Status: vac × phaseOk × autoLauf × Fehler (Tabelle aus test-timeline.js plus alle Kombinationen)
const vacs = ['docked', 'cleaning', 'paused', 'returning', 'error', 'idle'];
const phases = [['Phase gesetzt', 'Wischt Küche'], ['Phase unbekannt', 'unknown']];
const autos = [['Automatik-Lauf', 'on', 'Tägliches Saugen'], ['Hand-Lauf', 'off', 'Tägliches Saugen']];
const errs = [['kein Fehler', 'no_error', false], ['Hinweis clean_mop_pad', 'clean_mop_pad', false], ['Fehler brush_stuck', 'brush_stuck', true]];
const status = [];
for (const vac of vacs) for (const [pn, ph] of phases) for (const [an, al, plan] of autos) for (const [en, err, he] of errs) {
  status.push({
    name: `${vac} · ${pn} · ${an} · ${en}`,
    overrides: {
      'vacuum.heidi': { state: vac, attributes: { has_error: he } },
      'sensor.heidi_phase': { state: ph },
      'input_boolean.heidi_auto_lauf': { state: al },
      'input_text.heidi_auto_letzter_plan': { state: plan },
      'sensor.heidi_error': { state: err },
      'sensor.heidi_task_status': { state: vac === 'cleaning' || vac === 'paused' ? 'room_cleaning' : 'completed' },
      'sensor.heidi_current_room': { state: 'Kitchen' },
    },
  });
}
const ok = { 'sensor.heidi_error': { state: 'no_error' } };
status.push(
  { name: 'cleaning · zone_cleaning ohne Automatik', overrides: { ...ok, 'vacuum.heidi': { state: 'cleaning' }, 'sensor.heidi_phase': { state: 'unknown' }, 'input_boolean.heidi_auto_lauf': { state: 'off' }, 'sensor.heidi_task_status': { state: 'zone_cleaning' } } },
  { name: 'cleaning · Automatik an, aber Planname leer', overrides: { ...ok, 'vacuum.heidi': { state: 'cleaning' }, 'sensor.heidi_phase': { state: 'Saugt Bad' }, 'input_boolean.heidi_auto_lauf': { state: 'on' }, 'input_text.heidi_auto_letzter_plan': { state: '' }, 'sensor.heidi_task_status': { state: 'spot_cleaning' } } },
  { name: 'returning · Phase gleich Fährt zur Station → sub leer', overrides: { ...ok, 'vacuum.heidi': { state: 'returning' }, 'sensor.heidi_phase': { state: 'Fährt zur Station' } } },
  { name: 'docked · Phase leer, status charging_completed', overrides: { ...ok, 'vacuum.heidi': { state: 'docked' }, 'sensor.heidi_phase': { state: '' }, 'sensor.heidi_status': { state: 'charging_completed' } } },
  { name: 'docked · Phase unavailable, status unbekannt some_new_state', overrides: { ...ok, 'vacuum.heidi': { state: 'docked' }, 'sensor.heidi_phase': { state: 'unavailable' }, 'sensor.heidi_status': { state: 'some_new_state' } } },
  { name: 'Fehler unbekannt ohne Übersetzung', overrides: { 'vacuum.heidi': { state: 'docked', attributes: { has_error: false } }, 'sensor.heidi_error': { state: 'strange_thing_happened' } } },
  { name: 'Fehler unavailable → kein Chip', overrides: { 'vacuum.heidi': { state: 'docked' }, 'sensor.heidi_error': { state: 'unavailable' } } },
  { name: 'DND leer', overrides: { ...ok, 'time.heidi_dnd_start': { state: '' }, 'time.heidi_dnd_end': { state: 'unknown' } } },
);
// Streifen (für dx-hero 4.1): Raum 6 aktiv, Werte am Roboter gesetzt
const room6 = {
  'select.heidi_room_6_cleaning_mode': { state: 'sweeping_and_mopping' }, 'select.heidi_room_6_suction_level': { state: 'turbo' },
  'select.heidi_room_6_mop_pad_humidity': { state: 'moist' }, 'select.heidi_room_6_cleaning_route': { state: 'standard' }, 'select.heidi_room_6_cleaning_times': { state: '2x' },
};
const vacAttrs = (extra) => ({ current_segment: 6, cleaning_sequence: [1, 6, 7, 2, 4, 3, 5], ...extra });
status.push(
  { name: 'Streifen · Jetzt Küche, danach Büro (Reihenfolge aus Helfer)', overrides: { ...ok, ...room6, 'vacuum.heidi': { state: 'cleaning', attributes: vacAttrs({ active_segments: [7, 6, 5], cleaned_area: 12 }) }, 'input_text.heidi_lauf_reihenfolge': { state: '7,6,5' }, 'sensor.heidi_phase': { state: 'Saugt und wischt Küche' } } },
  { name: 'Streifen · Fährt zum Startpunkt (Fläche 0)', overrides: { ...ok, ...room6, 'vacuum.heidi': { state: 'cleaning', attributes: vacAttrs({ active_segments: [7, 6, 5], cleaned_area: 0 }) }, 'input_text.heidi_lauf_reihenfolge': { state: '7,6,5' }, 'sensor.heidi_phase': { state: 'Fährt zum Startpunkt' } } },
  { name: 'Streifen · Fährt durch Raum außerhalb des Auftrags', overrides: { ...ok, ...room6, 'vacuum.heidi': { state: 'cleaning', attributes: vacAttrs({ active_segments: [7, 5], cleaned_area: 12 }) }, 'input_text.heidi_lauf_reihenfolge': { state: '' }, 'sensor.heidi_phase': { state: 'Fährt durch Küche' } } },
  { name: 'Streifen · letzter Raum, Roboter-Reihenfolge (Helfer passt nicht)', overrides: { ...ok, ...room6, 'vacuum.heidi': { state: 'paused', attributes: vacAttrs({ active_segments: [7, 6], cleaned_area: 12 }) }, 'input_text.heidi_lauf_reihenfolge': { state: '7,6,5' }, 'sensor.heidi_phase': { state: 'Pausiert' } } },
  { name: 'Streifen · Raumwerte unavailable → kein Streifen', overrides: { ...ok, 'vacuum.heidi': { state: 'cleaning', attributes: vacAttrs({ active_segments: [7, 6], cleaned_area: 12 }) }, 'sensor.heidi_phase': { state: 'Saugt Küche' } } },
);
fs.writeFileSync(path.join(HERE, 'status.json'), JSON.stringify(status, null, 1) + '\n');
console.log('status:', status.length, 'Eingaben');

// ── Beschriftungen
const set = (ids) => ({ __set: ids });
const labels = [
  { name: 'dayLabel täglich', fn: '_dayLabel', args: [[true, true, true, true, true, true, true]] },
  { name: 'dayLabel manuell', fn: '_dayLabel', args: [[false, false, false, false, false, false, false]] },
  { name: 'dayLabel Mo–Fr', fn: '_dayLabel', args: [[true, true, true, true, true, false, false]] },
  { name: 'dayLabel Sa + So', fn: '_dayLabel', args: [[false, false, false, false, false, true, true]] },
  { name: 'dayLabel drei Tage', fn: '_dayLabel', args: [[true, false, true, false, true, false, false]] },
  { name: 'dayLabel vier Tage', fn: '_dayLabel', args: [[false, true, true, false, true, true, false]] },
  { name: 'dayLabel ein Tag', fn: '_dayLabel', args: [[false, false, false, false, false, false, true]] },
  { name: 'dayLabel Plan 1 (0110111)', fn: '_dayLabel', args: [[false, true, true, false, true, true, true]] },
  { name: 'roomLabel alle', fn: '_roomLabel', args: [set([7, 6, 5, 4, 3, 2, 1])] },
  { name: 'roomLabel leer', fn: '_roomLabel', args: [set([])] },
  { name: 'roomLabel zwei', fn: '_roomLabel', args: [set([7, 6])] },
  { name: 'roomLabel Reihenfolge wie gesetzt', fn: '_roomLabel', args: [set([1, 7, 4])] },
  { name: 'roomLabel unbekannte ID fällt weg', fn: '_roomLabel', args: [set([9, 3])] },
  { name: 'fmtMin 59', fn: '_fmtMin', args: [59] }, { name: 'fmtMin 60', fn: '_fmtMin', args: [60] }, { name: 'fmtMin 61', fn: '_fmtMin', args: [61] },
  { name: 'fmtMin 125', fn: '_fmtMin', args: [125] }, { name: 'fmtMin 59.6 rundet auf 60', fn: '_fmtMin', args: [59.6] }, { name: 'fmtMin 0.4', fn: '_fmtMin', args: [0.4] },
  { name: 'fmtDate heute', fn: 'fmtDate', args: ['__today__'] }, { name: 'fmtDate anderer Tag', fn: 'fmtDate', args: ['2026-01-05T07:08:00'] }, { name: 'fmtDate ungültig', fn: 'fmtDate', args: ['nix'] },
  { name: 'roomName Deutsch', fn: 'roomName', args: ['Kitchen'] }, { name: 'roomName unbekannt', fn: 'roomName', args: ['unknown'] }, { name: 'roomName fremd', fn: 'roomName', args: ['Garage'] },
];
fs.writeFileSync(path.join(HERE, 'labels.json'), JSON.stringify(labels, null, 1) + '\n');
console.log('labels:', labels.length, 'Eingaben');
