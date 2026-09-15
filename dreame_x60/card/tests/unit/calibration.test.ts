// Kalibrierung: Parität mit v1 (calibration.v1.json), Eigenschaften (Hin/Rück, null-Fälle) und die Zonen-Geste
// aus heidi/tests/test-zones.js (Pixel → mm) ohne Browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calibration, rectsFromAttr } from '../../src/domain/calibration';
import type { CalibPoint, RectAttr } from '../../src/domain/calibration';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.resolve(HERE, '..', 'fixtures');
const read = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;
const near = (a: number, b: number, msg: string, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} ≠ ${b}`);

interface States { [id: string]: { state: string; attributes: Record<string, unknown> } }
const docked = read<States>(path.join(FIX, 'states-docked.json'));
const fixturePoints = docked['camera.heidi_map']!.attributes.calibration_points as CalibPoint[];

interface V1Vector {
  name: string;
  input: { points?: CalibPoint[]; px?: [number, number][]; mm?: [number, number][]; rects?: RectAttr | RectAttr[] | null };
  output: { calibNull: boolean; toVac?: [number, number][]; toMap?: [number, number][]; rects?: number[][] };
}
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>(path.join(FIX, 'calibration.v1.json'));

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Vektoren`, () => {
  assert.ok(v1.vektoren.length >= 8);
  for (const v of v1.vektoren) {
    const c = calibration(v.input.points ?? fixturePoints);
    assert.equal(c === null, v.output.calibNull, `${v.name}: null`);
    if (c && v.input.px) v.input.px.forEach((p, i) => { const g = c.toVac(p[0], p[1]); near(g[0], v.output.toVac![i]![0], `${v.name}: toVac ${i} x`); near(g[1], v.output.toVac![i]![1], `${v.name}: toVac ${i} y`); });
    if (c && v.input.mm) v.input.mm.forEach((p, i) => { const g = c.toMap(p[0], p[1]); near(g[0], v.output.toMap![i]![0], `${v.name}: toMap ${i} x`, 1e-6); near(g[1], v.output.toMap![i]![1], `${v.name}: toMap ${i} y`, 1e-6); });
    if (v.input.rects !== undefined) assert.deepEqual(rectsFromAttr(v.input.rects), v.output.rects, `${v.name}: rects`);
  }
});

test('Fixture-Punkte: Hin und Rück innerhalb 1 mm bzw. 1 px, Kalibrierpunkte exakt', () => {
  const c = calibration(fixturePoints);
  assert.ok(c);
  for (const p of fixturePoints) {
    const v = c.toVac(p.map.x, p.map.y);
    near(v[0], p.vacuum.x, 'toVac x', 1e-9); near(v[1], p.vacuum.y, 'toVac y', 1e-9);
  }
  for (const [x, y] of [[0, 0], [-4200, -4775], [937, -643], [12345.6, -9876.5]] as [number, number][]) {
    const m = c.toMap(x, y), back = c.toVac(m[0], m[1]);
    near(back[0], x, 'Rück x', 1e-6); near(back[1], y, 'Rück y', 1e-6);
  }
});

test('null bei zwei Punkten, kollinear und ohne Attribut', () => {
  assert.equal(calibration(null), null);
  assert.equal(calibration(undefined), null);
  assert.equal(calibration([]), null);
  assert.equal(calibration(fixturePoints.slice(0, 2)), null);
  assert.equal(calibration([{ vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } }, { vacuum: { x: 1, y: 0 }, map: { x: 1, y: 1 } }, { vacuum: { x: 2, y: 0 }, map: { x: 2, y: 2 } }]), null, 'kollinear');
  assert.equal(calibration([{ vacuum: { x: 0, y: 0 }, map: { x: 5, y: 5 } }, { vacuum: { x: 1, y: 0 }, map: { x: 5, y: 5 } }, { vacuum: { x: 2, y: 0 }, map: { x: 5, y: 5 } }]), null, 'gleiche Punkte');
});

test('rectsFromAttr: Objekt, Liste, fehlende Ecken, leer', () => {
  assert.deepEqual(rectsFromAttr({ x0: 10, y0: 20, x1: 30, y1: 20, x2: 30, y2: 40, x3: 10, y3: 40 }), [[10, 20, 30, 40]]);
  assert.deepEqual(rectsFromAttr([{ x0: 30, y0: 40, x2: 10, y2: 20 }]), [[10, 20, 30, 40]]);
  assert.deepEqual(rectsFromAttr(null), []);
  assert.deepEqual(rectsFromAttr(undefined), []);
  assert.deepEqual(rectsFromAttr([]), []);
});

/** Breite/Höhe eines JPEG aus dem SOF-Marker (für die data:-URL des v1-Zustandsabzugs). */
function jpegSize(buf: Buffer): { w: number; h: number } | null {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1]!;
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

test('Zonen-Geste aus heidi/tests/test-zones.js ergibt dieselben mm-Koordinaten (±1 mm Pixelrundung)', () => {
  // v1-Test: real_states.json, Rechteck von 62 %/35 % nach 72 %/50 % des Kartenbilds → zones[1] = [-1550,-188,-643,937]
  const real = read<States>(path.resolve(HERE, '..', '..', '..', '..', 'heidi', 'tests', 'real_states.json'));
  const cam = real['camera.heidi_map']!.attributes;
  const pic = String(cam.entity_picture ?? '');
  const m = /^data:image\/jpeg;base64,(.+)$/.exec(pic);
  assert.ok(m, 'real_states.json hat kein data:-JPEG');
  const size = jpegSize(Buffer.from(m[1]!, 'base64')) ?? { w: 1332, h: 716 };
  const c = calibration(cam.calibration_points as CalibPoint[]);
  assert.ok(c, 'Kalibrierung aus real_states.json');
  const a = c.toVac(0.62 * size.w, 0.35 * size.h), b = c.toVac(0.72 * size.w, 0.5 * size.h);
  const rect = [Math.round(Math.min(a[0], b[0])), Math.round(Math.min(a[1], b[1])), Math.round(Math.max(a[0], b[0])), Math.round(Math.max(a[1], b[1]))];
  // Der Browser-Test rundet die Mausposition auf ganze Bildschirm-Pixel; daraus ergibt sich bis zu 1 mm Abweichung je Koordinate.
  const want = [-1550, -188, -643, 937];
  rect.forEach((v, i) => assert.ok(Math.abs(v - want[i]!) <= 1, `Koordinate ${i}: ${v} statt ${want[i]} (Bild ${size.w}×${size.h})`));
});
