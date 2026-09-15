// memo-selector: gleiche Referenz bei unverändertem Input, neue bei Änderung einer genannten ID, gleiche bei fremder ID.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { memoizeSelector, sameValue, stateAndAttributes } from '../../src/ha/memo-selector';
import type { States } from '../../src/ha/types';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const mk = (over: Partial<Record<string, { state: string; last_updated?: string; attributes?: Record<string, unknown> }>> = {}): States => {
  const base: States = {
    'a.x': { entity_id: 'a.x', state: '1', last_updated: 't1', attributes: {} },
    'a.y': { entity_id: 'a.y', state: 'on', last_updated: 't1', attributes: { k: [1, 2] } },
    'z.fremd': { entity_id: 'z.fremd', state: '0', last_updated: 't1', attributes: {} },
  };
  for (const [id, o] of Object.entries(over)) base[id] = { entity_id: id, state: o!.state, last_updated: o!.last_updated ?? 't1', attributes: o!.attributes ?? {} };
  return base;
};

test('gleiche Referenz bei unverändertem Input, auch bei neuem states-Objekt', () => {
  let calls = 0;
  const sel = memoizeSelector(['a.x', 'a.y'], (s) => { calls++; return { x: s['a.x']?.state, y: s['a.y']?.state }; });
  const r1 = sel(mk()), r2 = sel(mk());
  assert.equal(r1, r2); assert.equal(calls, 1);
});

test('neue Referenz bei Änderung von state oder last_updated einer genannten ID', () => {
  const sel = memoizeSelector(['a.x'], (s) => ({ x: s['a.x']?.state }));
  const r1 = sel(mk());
  const r2 = sel(mk({ 'a.x': { state: '2' } }));
  assert.notEqual(r1, r2); assert.equal(r2.x, '2');
  const r3 = sel(mk({ 'a.x': { state: '2', last_updated: 't2' } }));
  assert.notEqual(r2, r3);
});

test('gleiche Referenz bei Änderung einer fremden ID', () => {
  const sel = memoizeSelector(['a.x'], (s) => ({ x: s['a.x']?.state }));
  const r1 = sel(mk());
  const r2 = sel(mk({ 'z.fremd': { state: '99', last_updated: 't9' } }));
  assert.equal(r1, r2);
});

test('fehlende Entität: kein Fehler, neue Referenz wenn sie erscheint oder verschwindet', () => {
  const sel = memoizeSelector(['nicht.da'], (s) => ({ v: s['nicht.da']?.state ?? null }));
  const r1 = sel({});
  assert.equal(r1.v, null);
  assert.equal(sel({}), r1, 'fehlend ↔ fehlend ist gleich');
  const r2 = sel(mk({ 'nicht.da': { state: 'x' } }));
  assert.notEqual(r1, r2);
  assert.notEqual(sel({}), r2);
});

test('eigener Vergleich: nur state + genannte Attribute; last_updated darf ticken', () => {
  const sel = memoizeSelector(['a.y'], (s) => ({ k: s['a.y']?.attributes.k }), { 'a.y': stateAndAttributes(['k']) });
  const r1 = sel(mk());
  assert.equal(sel(mk({ 'a.y': { state: 'on', last_updated: 't2', attributes: { k: [1, 2], other: 'egal' } } })), r1, 'nur last_updated/fremdes Attribut geändert');
  assert.notEqual(sel(mk({ 'a.y': { state: 'on', attributes: { k: [1, 3] } } })), r1, 'genanntes Attribut geändert');
  assert.notEqual(sel(mk({ 'a.y': { state: 'off', attributes: { k: [1, 3] } } })), r1, 'state geändert');
});

test('sameValue: Listen und Objekte flach', () => {
  assert.ok(sameValue([1, 2], [1, 2])); assert.ok(!sameValue([1, 2], [2, 1])); assert.ok(sameValue({ a: 1 }, { a: 1 })); assert.ok(!sameValue({ a: 1 }, { a: 1, b: 2 }));
  assert.ok(sameValue(undefined, undefined)); assert.ok(!sameValue(null, undefined));
});

test('reset leert den Cache; ids ist lesbar', () => {
  let calls = 0;
  const sel = memoizeSelector(['a.x'], () => ++calls);
  sel(mk()); sel(mk()); assert.equal(calls, 1);
  sel.reset(); sel(mk()); assert.equal(calls, 2);
  assert.deepEqual([...sel.ids], ['a.x']);
});

test('memo-selector.ts bleibt unter 100 Zeilen (Regel 10)', () => {
  const lines = fs.readFileSync(path.resolve(HERE, '..', '..', 'src', 'ha', 'memo-selector.ts'), 'utf8').split('\n').length;
  assert.ok(lines < 100, `${lines} Zeilen`);
});
