// Zeitleiste: Parität mit v1 (timeline.v1.json) und fachliche Grenzfälle (timeline.spec.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { curWindow, entryWindow, historyPoints, runsFromVacuum, timelineRows, timelineTotalMin } from '../../src/domain/timeline';
import type { HistPoint, HistoryResponse } from '../../src/domain/timeline';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;
const near = (a: number, b: number, msg: string, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} ≠ ${b}`);

interface V1Vector {
  name: string;
  input: { key?: string; startMin?: number; endMin?: number; phase: [number, string][]; vac: [number, string][] };
  output: { now: number; rows: { t: number; state: string; dur: number }[] | null; end: number | null; error: string | null; api: string[] };
}
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('timeline.v1.json');

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Zeitleisten`, () => {
  assert.ok(v1.vektoren.length >= 2, 'zu wenige v1-Vektoren');
  for (const v of v1.vektoren) {
    const now = v.output.now;
    const m = (min: number) => now - min * 60_000;
    // dieselbe API-Antwort wie das Werkzeug an v1 gegeben hat
    const res: HistoryResponse = [
      v.input.phase.map(([min, state], i) => ({ ...(i === 0 ? { entity_id: 'sensor.heidi_phase' } : {}), state, last_changed: new Date(m(min)).toISOString() })),
      v.input.vac.map(([min, state], i) => ({ ...(i === 0 ? { entity_id: 'vacuum.heidi' } : {}), state, last_changed: new Date(m(min)).toISOString() })),
    ];
    const phase = historyPoints(res, 'sensor.heidi_phase'), vac = historyPoints(res, 'vacuum.heidi');
    const nowSec = Math.floor(now / 1000);
    const key = v.input.key && v.input.key !== 'cur' ? 'entry' : 'cur';
    const win = key === 'cur' ? curWindow(nowSec) : { startSec: Math.floor(m(v.input.startMin ?? 0) / 1000), endSec: Math.floor(m(v.input.endMin ?? 0) / 1000) };
    const got = timelineRows({ phase, vac, key, startMs: win.startSec * 1000, endMs: win.endSec * 1000, nowMs: now });
    assert.ok(v.output.rows, `${v.name}: v1 hat keine Zeilen geliefert (${v.output.error})`);
    assert.deepEqual(got.rows.map((r) => r.state), v.output.rows.map((r) => r.state), `${v.name}: Texte`);
    got.rows.forEach((r, i) => { assert.equal(r.t, v.output.rows![i]!.t, `${v.name}: Zeile ${i} t`); near(r.dur, v.output.rows![i]!.dur, `${v.name}: Zeile ${i} dur`); });
    assert.equal(got.end, v.output.end, `${v.name}: end`);
  }
});

interface Spec {
  runs: { name: string; vac: [number, string][]; erwartet: { s: number; e: number | null }[] }[];
  rows: { name: string; key: 'cur' | 'entry'; startSec?: number; endSec?: number; vac: [number, string][]; phase: [number, string][]; erwartet: { states: string[]; durs: number[]; end: number | null } }[];
  windows: { name: string; cur?: number; entry?: [number, number, number | null, number]; erwartet: { startSec: number; endSec: number } }[];
}
const spec = read<Spec>('timeline.spec.json');
const NOW = 100_000_000; // ms; Angaben im Spec sind Sekunden vor jetzt
const pts = (list: [number, string][]): HistPoint[] => list.map(([sec, state]) => ({ t: NOW - sec * 1000, state }));
const secAgo = (ms: number | null) => (ms === null ? null : (NOW - ms) / 1000);

test('spec: Laufabschnitte (45-s-Halt)', () => {
  for (const c of spec.runs) {
    const got = runsFromVacuum(pts(c.vac), NOW).map((p) => ({ s: secAgo(p.s), e: secAgo(p.e) }));
    assert.deepEqual(got, c.erwartet, c.name);
  }
});

test('spec: Zeilen (Flackern, erste Zeile, Ruhephasen, Eintrag-Fenster)', () => {
  for (const c of spec.rows) {
    const startMs = c.startSec !== undefined ? NOW - c.startSec * 1000 : NOW - 8 * 3600_000;
    const endMs = c.endSec !== undefined ? NOW - c.endSec * 1000 : NOW;
    const got = timelineRows({ phase: pts(c.phase), vac: pts(c.vac), key: c.key, startMs, endMs, nowMs: NOW });
    assert.deepEqual(got.rows.map((r) => r.state), c.erwartet.states, `${c.name}: Texte`);
    assert.deepEqual(got.rows.map((r) => Math.round(r.dur * 60)), c.erwartet.durs, `${c.name}: Dauern in s`);
    assert.equal(secAgo(got.end), c.erwartet.end, `${c.name}: end`);
  }
});

test('spec: Fenster', () => {
  for (const c of spec.windows) {
    if (c.cur !== undefined) assert.deepEqual(curWindow(c.cur), c.erwartet, c.name);
    if (c.entry) assert.deepEqual(entryWindow(...c.entry), c.erwartet, c.name);
  }
});

test('Gesamtdauer', () => {
  near(timelineTotalMin([{ t: 0, state: 'a', dur: 5 }, { t: 300_000, state: 'b', dur: 7 }]), 12, 'zwei Zeilen');
  assert.equal(timelineTotalMin([]), 0);
});
