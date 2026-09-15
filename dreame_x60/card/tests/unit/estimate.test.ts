// Dauer & Akku: Parität mit v1 (estimate.v1.json) und fachliche Grenzfälle (estimate.spec.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargeMin, estimate, rate, restMinFallback } from '../../src/domain/estimate';
import type { Estimate, Lernwerte, PlanForEstimate, Variante } from '../../src/domain/estimate';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;
const near = (a: number, b: number, msg: string, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} ≠ ${b}`);

interface States { [id: string]: { state: string; attributes: Record<string, unknown> } }
const docked = read<States>('states-docked.json');
const fixtureLern = docked['sensor.heidi_lernwerte']?.attributes as unknown as Lernwerte;
const selfCleanArea = parseFloat(docked['number.heidi_self_clean_area']?.state ?? '25');

interface V1Vector {
  name: string;
  input: { n: number; variante?: Variante; uniform?: Record<string, string> | null; batt?: number; batt0?: number; lern?: Lernwerte; overrides?: Record<string, { state?: string }> };
  output: { plan: PlanForEstimate & { raeume: number[] }; estimate: Estimate | null };
}
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('estimate.v1.json');

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Schätzungen`, () => {
  assert.ok(v1.vektoren.length >= 15, 'zu wenige v1-Vektoren');
  for (const v of v1.vektoren) {
    const unavailable = v.input.overrides?.['sensor.heidi_lernwerte']?.state === 'unavailable';
    const lern = unavailable ? null : (v.input.lern ?? fixtureLern);
    const batt0 = v.input.batt0 ?? v.input.batt ?? 100;
    const got = estimate(v.output.plan, lern, { variante: v.input.variante ?? 'normal', uniform: v.input.uniform ?? null, batt0, selfCleanArea });
    const want = v.output.estimate;
    if (want === null) { assert.equal(got, null, `${v.name}: null erwartet`); continue; }
    assert.ok(got, `${v.name}: Ergebnis fehlt`);
    near(got.total, want.total, `${v.name}: total`);
    assert.equal(got.charges, want.charges, `${v.name}: charges`);
    near(got.battEnd, want.battEnd, `${v.name}: battEnd`);
    assert.equal(got.unlearned, want.unlearned, `${v.name}: unlearned`);
    near(got.used, want.used, `${v.name}: used`);
    assert.deepEqual(got.order, want.order, `${v.name}: order`);
    assert.deepEqual(got.steps.map((s) => s.typ), want.steps.map((s) => s.typ), `${v.name}: Schritt-Typen`);
    got.steps.forEach((s, i) => {
      const w = want.steps[i]!;
      near(s.min, w.min, `${v.name}: Schritt ${i} min`);
      near(s.batt, w.batt, `${v.name}: Schritt ${i} batt`);
      assert.equal(s.text, w.text, `${v.name}: Schritt ${i} text`);
      if (s.typ === 'raum' && w.typ === 'raum') { assert.equal(s.sub, w.sub, `${v.name}: Schritt ${i} sub`); assert.equal(s.area, w.area); assert.equal(s.gelernt, w.gelernt); assert.equal(s.id, w.id); }
    });
  }
});

interface Spec {
  lern: Lernwerte;
  plan: PlanForEstimate;
  faelle: { name: string; plan: Partial<PlanForEstimate>; variante?: Variante; uniform?: Record<string, string>; batt0: number; erwartet: { charges?: number; battEnd?: number; total?: number; typen?: string[]; area?: number; sub?: string } }[];
  rate: { name: string; lern?: Lernwerte; modus: string; saug: string; erwartet: { min_pro_m2: number; pct_pro_min: number; gelernt: boolean } }[];
  chargeMin: { name: string; from: number; to: number; erwartet: number }[];
  restMin: { name: string; in: { prognoseAktiv: boolean; abweichungHeute: boolean; prognoseTage: number; mindesttage: number | null; rueckkehrMin: number; rueckkehr: string | null; now: string }; erwartet: { min: number; quelle: string } }[];
}
const spec = read<Spec>('estimate.spec.json');

test('spec: Grenzfälle der Simulation', () => {
  for (const c of spec.faelle) {
    const plan = { ...spec.plan, ...c.plan } as PlanForEstimate;
    const e = estimate(plan, spec.lern, { variante: c.variante ?? 'normal', uniform: c.uniform ?? null, batt0: c.batt0 });
    assert.ok(e, c.name);
    if (c.erwartet.charges !== undefined) assert.equal(e.charges, c.erwartet.charges, `${c.name}: charges`);
    if (c.erwartet.battEnd !== undefined) near(e.battEnd, c.erwartet.battEnd, `${c.name}: battEnd`);
    if (c.erwartet.total !== undefined) near(e.total, c.erwartet.total, `${c.name}: total`);
    if (c.erwartet.typen) assert.deepEqual(e.steps.map((s) => s.typ), c.erwartet.typen, `${c.name}: Typen`);
    const room = e.steps.find((s) => s.typ === 'raum');
    if (c.erwartet.area !== undefined) assert.equal(room && room.typ === 'raum' ? room.area : undefined, c.erwartet.area, `${c.name}: area`);
    if (c.erwartet.sub !== undefined) assert.equal(room && room.typ === 'raum' ? room.sub : undefined, c.erwartet.sub, `${c.name}: sub`);
  }
  assert.equal(estimate(spec.plan, null, { batt0: 100 }), null, 'ohne Lernwerte null');
  assert.equal(estimate(spec.plan, { laeufe_gesamt: 0 }, { batt0: 100 }), null, 'ohne raten null');
});

test('spec: rate', () => {
  for (const c of spec.rate) {
    const r = rate(c.lern ?? spec.lern, c.modus, c.saug);
    near(r.min_pro_m2, c.erwartet.min_pro_m2, `${c.name}: min_pro_m2`);
    near(r.pct_pro_min, c.erwartet.pct_pro_min, `${c.name}: pct_pro_min`);
    assert.equal(r.gelernt, c.erwartet.gelernt, `${c.name}: gelernt`);
  }
});

test('spec: chargeMin', () => {
  for (const c of spec.chargeMin) near(chargeMin(c.from, c.to, spec.lern.laden!), c.erwartet, c.name);
});

test('spec: restMinFallback', () => {
  for (const c of spec.restMin) assert.deepEqual(restMinFallback({ ...c.in, now: new Date(c.in.now) }), c.erwartet, c.name);
});
