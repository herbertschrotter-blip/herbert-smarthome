// Einrichtungsprüfung (PD-014): reine Prüflogik – jede Prüfung kippt genau bei ihrem Befund, Sprungziele stimmen,
// ohne nachgeladene Daten entfallen Bereichs- und Reparaturprüfung statt falsch zu warnen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupChecks, setupProblems } from '../../src/domain/setup';
import type { SetupInput } from '../../src/domain/setup';
import { HEIDI_ROOMS } from './helpers-rooms';

const base = (): SetupInput => ({
  robot: { vac: 'vacuum.heidi', name: 'Heidi' },
  rooms: HEIDI_ROOMS.map((r) => ({ ...r, typed: true })),
  hasMapData: true,
  missingRobot: [], missingPackage: [],
  customizedCleaning: 'on', running: false,
  ids: { customizedCleaning: 'switch.heidi_customized_cleaning', roomName: (id) => `select.heidi_room_${id}_name` },
  mapping: { segments: [{ id: '1_1', name: 'Bathroom' }, { id: '1_6', name: 'Kitchen' }], assigned: new Set(['1_1', '1_6']) },
  repairs: [],
});

test('alles eingerichtet → acht Prüfungen, keine Probleme', () => {
  const c = setupChecks(base());
  assert.deepEqual(c.map((x) => x.key), ['robot', 'package', 'entities', 'mapdata', 'customized', 'roomtypes', 'areas', 'repairs']);
  assert.deepEqual(setupProblems(c), []);
});

test('kein Roboter → nur Roboter- und Paketprüfung, Roboter = Fehler mit Sprung zu den Integrationen', () => {
  const c = setupChecks({ ...base(), robot: null, mapping: null, repairs: null });
  assert.deepEqual(c.map((x) => x.key), ['robot', 'package']);
  assert.equal(c[0]!.level, 'error'); assert.deepEqual(c[0]!.action, { kind: 'ha-path', path: '/config/integrations' });
});

test('Paket und Roboter-Entitäten fehlen → Fehler bzw. Hinweis mit Sprung zur Seite Einstellungen', () => {
  const c = setupChecks({ ...base(), missingPackage: ['sensor.heidi_phase', 'input_boolean.heidi_automatik'], missingRobot: ['sensor.heidi_error'] });
  const pkg = c.find((x) => x.key === 'package')!, ent = c.find((x) => x.key === 'entities')!;
  assert.equal(pkg.level, 'error'); assert.match(pkg.text, /^2 Helfer/); assert.deepEqual(pkg.action, { kind: 'page', page: 'einstellungen' });
  assert.equal(ent.level, 'warn'); assert.match(ent.text, /^1 Entitäten/);
});

test('Datenkarte aus, Angepasste Reinigung aus → Hinweise; im Lauf zählt der Schalter nicht', () => {
  const c = setupChecks({ ...base(), hasMapData: false, customizedCleaning: 'off' });
  assert.equal(c.find((x) => x.key === 'mapdata')!.level, 'warn');
  assert.deepEqual(c.find((x) => x.key === 'mapdata')!.action, { kind: 'ha-path', path: '/config/integrations/integration/dreame_vacuum' });
  const cc = c.find((x) => x.key === 'customized')!;
  assert.equal(cc.level, 'warn'); assert.deepEqual(cc.action, { kind: 'more-info', entity: 'switch.heidi_customized_cleaning' });
  assert.equal(setupChecks({ ...base(), customizedCleaning: 'off', running: true }).find((x) => x.key === 'customized')!.level, 'ok', 'im Lauf kein Befund');
  assert.equal(setupChecks({ ...base(), customizedCleaning: null }).some((x) => x.key === 'customized'), false, 'ohne Schalter keine Prüfung');
});

test('Raumtypen: benutzerdefiniert mit bekanntem Namen → Hinweis; WC (kein App-Typ) ist kein Befund', () => {
  const rooms = HEIDI_ROOMS.map((r) => ({ ...r, typed: r.name === 'WC' ? false : r.name !== 'Bad' && r.name !== 'Küche' }));
  const c = setupChecks({ ...base(), rooms });
  const rt = c.find((x) => x.key === 'roomtypes')!;
  assert.equal(rt.level, 'warn'); assert.match(rt.text, /^Bad, Küche: benutzerdefiniert/);
  assert.deepEqual(rt.action, { kind: 'more-info', entity: 'select.heidi_room_1_name' });
  const onlyWc = setupChecks({ ...base(), rooms: HEIDI_ROOMS.map((r) => ({ ...r, typed: r.name !== 'WC' })) });
  assert.equal(onlyWc.find((x) => x.key === 'roomtypes')!.level, 'ok');
});

test('Bereiche: nicht zugeordnete Räume → Fehler mit Namen und Sprung zum more-info des Roboters; ohne Daten keine Prüfung', () => {
  const c = setupChecks({ ...base(), mapping: { segments: [{ id: '1_1', name: 'Bathroom' }, { id: '1_3', name: 'WC' }, { id: '1_6', name: 'Kitchen' }], assigned: new Set(['1_6']) } });
  const a = c.find((x) => x.key === 'areas')!;
  assert.equal(a.level, 'error'); assert.equal(a.text, '2 Räume sind keinem HA-Bereich zugeordnet: Bathroom, WC');
  assert.deepEqual(a.action, { kind: 'vacuum-areas', entity: 'vacuum.heidi', hint: 'Reinigung → Nach Bereich → Konfigurieren' });
  assert.match(setupChecks({ ...base(), mapping: { segments: [{ id: '1_1', name: 'Bathroom' }], assigned: new Set() } }).find((x) => x.key === 'areas')!.text, /^Ein Raum ist/);
  assert.equal(setupChecks({ ...base(), mapping: null }).some((x) => x.key === 'areas'), false);
});

test('Reparaturen: nur die des Roboters zählen; Sprung zur Reparaturseite', () => {
  const c = setupChecks({ ...base(), repairs: [{ domain: 'hacs', issue_id: 'x' }, { domain: 'vacuum', issue_id: 'segments_changed_abc', translation_key: 'segments_changed' }] });
  const r = c.find((x) => x.key === 'repairs')!;
  assert.equal(r.level, 'error'); assert.match(r.text, /^1 offene Reparatur/); assert.deepEqual(r.action, { kind: 'ha-path', path: '/config/repairs' });
  assert.equal(setupChecks({ ...base(), repairs: [{ domain: 'hacs', issue_id: 'x' }] }).find((x) => x.key === 'repairs')!.level, 'ok');
  assert.equal(setupChecks({ ...base(), repairs: null }).some((x) => x.key === 'repairs'), false);
});
