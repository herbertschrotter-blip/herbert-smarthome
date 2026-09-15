// Kopf-Texte: Parität mit v1 (status.v1.json: vac × Phase × Automatik-Lauf × Fehler plus Sonderfälle) und die
// Tabelle aus heidi/tests/test-timeline.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heroButtons, heroModel } from '../../src/domain/status';
import type { HeroInput } from '../../src/domain/status';
import { roomName } from '../../src/domain/labels';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;

interface StateLike { state: string; attributes: Record<string, unknown> }
type States = Record<string, StateLike | undefined>;
const docked = read<States>('states-docked.json');

interface V1Vector {
  name: string;
  input: { overrides?: Record<string, { state?: string; attributes?: Record<string, unknown> }> };
  output: { big: string; sub: string | null; btns: string[]; chips: { text: string; cls: string }[]; strip: string | null };
}
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('status.v1.json');

/** Zustände wie das Werkzeug: Fixture + Overrides (Attribute gemischt). */
function statesFor(v: V1Vector): States {
  const s: States = { ...docked };
  for (const [id, o] of Object.entries(v.input.overrides ?? {})) {
    const cur = s[id] ?? { state: 'unknown', attributes: {} };
    s[id] = { state: o.state ?? cur.state, attributes: { ...cur.attributes, ...(o.attributes ?? {}) } };
  }
  return s;
}
const st = (s: States, id: string): string => s[id]?.state ?? 'unknown';

function inputFor(s: States): HeroInput {
  return {
    vac: st(s, 'vacuum.heidi'),
    status: st(s, 'sensor.heidi_status'),
    error: st(s, 'sensor.heidi_error'),
    hasError: !!s['vacuum.heidi']?.attributes.has_error,
    task: st(s, 'sensor.heidi_task_status'),
    phase: st(s, 'sensor.heidi_phase'),
    autoLauf: st(s, 'input_boolean.heidi_auto_lauf') === 'on',
    autoLetzterPlan: st(s, 'input_text.heidi_auto_letzter_plan'),
    dndStart: st(s, 'time.heidi_dnd_start'),
    dndEnd: st(s, 'time.heidi_dnd_end'),
    room: roomName(st(s, 'sensor.heidi_current_room'), st(s, 'input_select.heidi_raumnamen') === 'Deutsch'),
  };
}
const PERSONS = ['Herbert', 'Nicole', 'Nina'];

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Kopf-Zustände`, () => {
  assert.ok(v1.vektoren.length >= 80, 'zu wenige v1-Vektoren');
  for (const v of v1.vektoren) {
    const s = statesFor(v);
    const m = heroModel(inputFor(s));
    assert.equal(m.big, v.output.big, `${v.name}: big`);
    assert.equal(m.sub, v.output.sub ?? '', `${v.name}: sub`);
    assert.deepEqual(m.buttons.map((b) => b.label), v.output.btns, `${v.name}: Knöpfe`);
    const other = v.output.chips.filter((c) => !PERSONS.includes(c.text));
    const dnd = other[other.length - 1]!;
    assert.equal(m.dnd, dnd.text, `${v.name}: DND-Chip`);
    const err = other.find((c) => /\bbad\b|\bwarn\b/.test(c.cls));
    if (err) { assert.ok(m.errorChip, `${v.name}: Fehler-Chip erwartet`); assert.equal(m.errorChip.text, err.text, `${v.name}: Fehler-Text`); assert.equal(m.errorChip.level, /\bbad\b/.test(err.cls) ? 'danger' : 'warning', `${v.name}: Fehler-Stufe`); }
    else assert.equal(m.errorChip, null, `${v.name}: kein Fehler-Chip`);
    const room = other.find((c) => /\bon\b/.test(c.cls) && !/\bbad\b|\bwarn\b/.test(c.cls) && c !== dnd);
    assert.equal(m.roomChip, room ? room.text : null, `${v.name}: Raum-Chip`);
  }
});

test('Tabelle aus test-timeline.js', () => {
  const base: HeroInput = { vac: 'cleaning', status: 'cleaning', error: 'no_error', hasError: false, task: 'completed', phase: 'Wischt Küche', autoLauf: false, autoLetzterPlan: '', dndStart: '20:00:00', dndEnd: '07:00:00', room: '–' };
  const c = heroModel(base);
  assert.deepEqual([c.big, c.sub, c.buttons.map((b) => b.label).join()], ['Reinigt', 'Wischt Küche', 'Pause,Stopp,Station']);
  const p = heroModel({ ...base, vac: 'paused' });
  assert.deepEqual([p.big, p.sub, p.buttons.map((b) => b.label).join()], ['Pausiert', 'Reinigt', 'Weiter,Stopp,Station']);
  const d = heroModel({ ...base, vac: 'docked' });
  assert.deepEqual([d.big, d.sub, d.buttons.map((b) => b.label).join()], ['Wischt Küche', '', 'Start,Orten']);
  assert.equal(heroModel({ ...base, vac: 'returning', phase: 'Fährt zur Station' }).sub, '');
  assert.equal(heroModel({ ...base, vac: 'error' }).big, 'Fehler');
  assert.equal(heroModel({ ...base, vac: 'cleaning', autoLauf: true, autoLetzterPlan: 'Tägliches Saugen' }).big, 'Tägliches Saugen');
  assert.equal(heroModel({ ...base, vac: 'cleaning', phase: 'unknown', task: 'zone_cleaning' }).big, 'Reinigt Zone');
  assert.equal(heroModel({ ...base, vac: 'cleaning', phase: 'unknown', room: 'Küche' }).roomChip, 'Küche');
  assert.equal(heroModel({ ...base, vac: 'docked', phase: '', status: 'charging_completed' }).big, 'Voll geladen');
  assert.deepEqual(heroModel({ ...base, error: 'brush_stuck', hasError: true }).errorChip, { text: 'Bürste blockiert', level: 'danger' });
  assert.deepEqual(heroModel({ ...base, error: 'clean_mop_pad' }).errorChip, { text: 'Mopps reinigen', level: 'warning' });
  assert.equal(heroModel({ ...base, error: 'unavailable' }).errorChip, null);
  assert.equal(heroModel({ ...base, vac: 'cleaning' }).dot, 'accent');
  assert.equal(heroModel({ ...base, vac: 'returning' }).dot, 'warning');
  assert.equal(heroModel({ ...base, vac: 'error' }).dot, 'danger');
  assert.equal(heroModel({ ...base, vac: 'docked' }).dot, 'positive');
  assert.deepEqual(heroButtons('idle').map((b) => b.service), ['start', 'return_to_base', 'locate']);
  assert.ok(heroButtons('cleaning')[0]!.primary && !heroButtons('cleaning')[1]!.primary);
});
