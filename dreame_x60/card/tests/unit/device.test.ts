// Geräteerkennung (PD-012): kein fester Gerätename – Roboter-IDs entstehen aus dem erkannten vacuum.<gerät>, Paket-IDs
// bleiben fest; Erkennung über Konfiguration, Entitäts-Register oder Zustände; Umbenennung wirkt auf Selektoren.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanName, device, deviceName, devicePrefix, discoverDevice, discoverFromStates, setDevice } from '../../src/ha/device';
import { ENTITIES, PACKAGE_PREFIX, ROBOT_FEATURES, allContractIds, robotEntity, robotIds, roomEntity } from '../../src/ha/contract';
import { readRobot, readConsumables, readDiagnostics, ALL_SELECTORS } from '../../src/ha/selectors';
import type { HomeAssistant, States } from '../../src/ha/types';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const docked = JSON.parse(fs.readFileSync(path.join(FIX, 'states-docked.json'), 'utf8')) as States;

/** Abzug mit umbenanntem Roboter: jede Roboter-ID heidi→berta (Paket-IDs bleiben), friendly_name „Berta“. */
function renamed(states: States, to: string): States {
  setDevice('heidi', 'Heidi'); // Roboter-IDs des Abzugs
  const robot = new Set(robotIds());
  const out: States = {};
  for (const [id, e] of Object.entries(states)) {
    if (!e) continue;
    if (robot.has(id)) {
      const nid = id.replace(`.heidi`, `.${to}`);
      out[nid] = { ...e, entity_id: nid, attributes: id === 'vacuum.heidi' ? { ...e.attributes, friendly_name: 'Berta' } : e.attributes };
    } else out[id] = e;
  }
  return out;
}

test('Erkennung aus den Zuständen: vacuum mit Dreame-Attributen → Präfix, Name aus friendly_name („Heidi  Heidi“ → „Heidi“)', () => {
  assert.equal(docked['vacuum.heidi']!.attributes.friendly_name, 'Heidi  Heidi', 'Integration verdoppelt den Namen');
  assert.equal(cleanName('Heidi  Heidi'), 'Heidi'); assert.equal(cleanName(' Berta Bot Bot '), 'Berta Bot'); assert.equal(cleanName(undefined), '');
  const d = discoverFromStates(docked);
  assert.deepEqual(d, { prefix: 'heidi', vac: 'vacuum.heidi', name: 'Heidi' });
  assert.equal(devicePrefix(), 'heidi'); assert.equal(deviceName(), 'Heidi');
  assert.equal(ENTITIES.vac, 'vacuum.heidi'); assert.equal(ENTITIES.map, 'camera.heidi_map'); assert.equal(roomEntity(3, 'suction_level'), 'select.heidi_room_3_suction_level');
  assert.equal(ENTITIES.phase, `sensor.${PACKAGE_PREFIX}_phase`, 'Paket-ID fest');
});

test('ohne Roboter: kein Gerät, Präfix leer, Diagnose meldet den Roboter-Block als fehlend', () => {
  const noRobot: States = Object.fromEntries(Object.entries(docked).filter(([id]) => !id.startsWith('vacuum.')));
  assert.equal(discoverFromStates(noRobot), null);
  assert.equal(devicePrefix(), '');
  assert.equal(ENTITIES.vac, 'vacuum.');
  const diag = readDiagnostics(noRobot);
  assert.ok(diag.groups[0]!.name.includes('nicht erkannt'), diag.groups[0]!.name);
  assert.ok(diag.groups[0]!.missing.length >= Object.keys(ROBOT_FEATURES).length, 'alle Roboter-IDs fehlen');
});

test('Erkennung über hass: Konfiguration vor Register vor Zuständen; Anzeigename aus dem Geräte-Register', () => {
  const states = renamed(docked, 'berta');
  states['vacuum.zweiter'] = { entity_id: 'vacuum.zweiter', state: 'docked', attributes: { friendly_name: 'Zweiter', segment_cleaning: false } };
  const hass = { states, callService: async () => undefined } as unknown as HomeAssistant;
  // Zustände: alphabetisch erste Dreame-vacuum → berta
  assert.equal(discoverDevice(hass)?.prefix, 'berta');
  assert.equal(deviceName(), 'Berta');
  // Register: Plattform entscheidet, Geräte-Register liefert den vom Benutzer vergebenen Namen
  const hass2 = { ...hass, entities: { 'vacuum.zweiter': { entity_id: 'vacuum.zweiter', platform: 'dreame_vacuum', device_id: 'd1' }, 'vacuum.berta': { entity_id: 'vacuum.berta', platform: 'roborock' } }, devices: { d1: { name: 'Dreame', name_by_user: 'Zwei' } } } as unknown as HomeAssistant;
  assert.deepEqual(discoverDevice(hass2), { prefix: 'zweiter', vac: 'vacuum.zweiter', name: 'Zwei' });
  // Konfiguration schlägt alles
  assert.equal(discoverDevice(hass2, 'vacuum.berta')?.prefix, 'berta');
  assert.equal(deviceName(), 'Berta');
  // Register ohne passende Plattform → Rückfall auf Zustände
  const hass3 = { ...hass, entities: { 'vacuum.berta': { entity_id: 'vacuum.berta', platform: 'roborock' } } } as unknown as HomeAssistant;
  assert.equal(discoverDevice(hass3)?.prefix, 'berta');
});

test('umbenannter Roboter: Selektoren lesen die neuen IDs, Ergebnisse gleich; Rückbenennung erzwingt Neuberechnung', () => {
  discoverFromStates(docked);
  const before = readRobot(docked);
  const cons = readConsumables(docked);
  const states = renamed(docked, 'berta');
  discoverFromStates(states);
  assert.equal(device()?.prefix, 'berta');
  assert.ok(readRobot.ids.includes('vacuum.berta') && !readRobot.ids.includes('vacuum.heidi'), 'ids folgen dem Gerät');
  const after = readRobot(states);
  assert.notEqual(after, before, 'neue Referenz nach Gerätewechsel');
  assert.equal(after.battery, before.battery); assert.equal(after.vac, before.vac); assert.equal(after.moreInfo.vac, 'vacuum.berta');
  assert.deepEqual(readConsumables(states).map((c) => [c.pct, c.resetEntity]), cons.map((c) => [c.pct, c.resetEntity.replace('.heidi', '.berta')]));
  for (const [name, sel] of Object.entries(ALL_SELECTORS)) assert.doesNotThrow(() => sel(states), name);
  assert.equal(readDiagnostics(states).missing.length, 0, 'im umbenannten Abzug fehlt nichts');
  // zurück
  discoverFromStates(docked);
  assert.equal(readRobot(docked).moreInfo.vac, 'vacuum.heidi');
});

test('robotIds/allContractIds: Roboter-IDs tragen das Präfix, Paket-IDs nie; robotEntity ohne Merkmal = vacuum', () => {
  setDevice('x60', 'X60');
  assert.equal(robotEntity('vacuum', ''), 'vacuum.x60');
  assert.ok(robotIds().every((id) => id.split('.')[1]!.startsWith('x60')), 'alle Roboter-IDs mit Präfix');
  const pkg = allContractIds().filter((id) => !robotIds().includes(id));
  assert.ok(pkg.every((id) => !id.includes('x60')), 'Paket-IDs ohne Gerätepräfix');
  assert.ok(pkg.includes('input_boolean.stuehle_am_boden') && pkg.includes('sensor.heidi_phase'));
  assert.equal(robotIds().length, Object.keys(ROBOT_FEATURES).length + 7 * 5);
  discoverFromStates(docked);
});
