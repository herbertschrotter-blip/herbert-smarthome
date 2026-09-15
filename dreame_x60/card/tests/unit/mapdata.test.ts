// Kartenpaket (4.3b): PNG-Chunk lesen, Valetudo-JSON parsen, Raster ↔ Roboter-mm, Treffer je Raum, SVG-Pfade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pngText } from '../../src/domain/png-text';
import { parseValetudo, pxToVac, vacToPx, rowIndex, segmentAt, segmentPath } from '../../src/domain/mapdata';
import { calibration } from '../../src/domain/calibration';
import type { CalibPoint } from '../../src/domain/calibration';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const jsonText = fs.readFileSync(path.join(FIX, 'map-data.valetudo.json'), 'utf8');
const pngBuf = fs.readFileSync(path.join(FIX, 'map-data.png'));
const md = parseValetudo(jsonText);

test('PNG: zTXt-Chunk „ValetudoMap“ wird gelesen und entspricht dem JSON-Muster', async () => {
  const ab = pngBuf.buffer.slice(pngBuf.byteOffset, pngBuf.byteOffset + pngBuf.byteLength);
  const text = await pngText(ab, 'ValetudoMap');
  assert.ok(text, 'Chunk gefunden');
  assert.deepEqual(JSON.parse(text!), JSON.parse(jsonText));
  assert.equal(await pngText(ab, 'gibtsnicht'), null);
  assert.equal(await pngText(new Uint8Array([1, 2, 3]).buffer, 'ValetudoMap'), null, 'kein PNG → null');
});

test('Valetudo: 7 Räume mit Namen, Lauflängen decken pixelCount, Ursprung/Auflösung', () => {
  assert.equal(md.size.x, 6554); assert.equal(md.pixelSize, 5); assert.equal(md.rotation, 90);
  assert.deepEqual(md.segments.map((s) => [s.id, s.name]), [[7, 'Wohnzimmer'], [6, 'Küche'], [5, 'Büro'], [4, 'Flur'], [3, 'WC'], [2, 'Schlafzimmer'], [1, 'Bad']]);
  for (const s of md.segments) assert.equal(s.runs.reduce((n, r) => n + r[2], 0), s.pixelCount, `${s.name}: Lauflängen = pixelCount`);
  assert.ok(md.robot && Math.abs(md.robot.x - 490) < 1 && Math.abs(md.robot.y - 20) < 1, `Roboter nahe Ladestation (0,0): ${JSON.stringify(md.robot)}`);
  assert.equal(md.paths.length, 4);
});

test('Raster ↔ Roboter-mm: Hin und zurück, Bad-Ecke passt zur Karten-Bounding-Box', () => {
  const bad = md.segments.find((s) => s.id === 1)!;
  const v = pxToVac(md, bad.bbox.x0, bad.bbox.y1); // links unten im Raster = kleinstes x, kleinstes y in mm
  assert.ok(Math.abs(v.x - -5700) < 60 && Math.abs(v.y - 3550) < 60, `Bad-Ecke ≈ (-5700, 3550): ${JSON.stringify(v)}`);
  const back = vacToPx(md, v.x, v.y);
  assert.deepEqual(back, { px: bad.bbox.x0, py: bad.bbox.y1 });
});

test('Treffer: erster Rasterpixel jedes Raums liegt in seinem Raum, der Pixel davor nicht; außerhalb null', () => {
  const rows = rowIndex(md);
  for (const s of md.segments) {
    const [x, y, n] = s.runs[0]!;
    assert.equal(segmentAt(rows, x, y), s.id, s.name);
    assert.equal(segmentAt(rows, x + n - 1, y), s.id, `${s.name}: letzter Pixel der Lauflänge`);
    assert.notEqual(segmentAt(rows, x + n, y), s.id, `${s.name}: Pixel hinter der Lauflänge`);
  }
  assert.equal(segmentAt(rows, 10, 10), null);
});

test('SVG-Pfad: je Lauflänge ein Viereck, in Bildpixeln über die Kalibrierung', () => {
  const calib = calibration([{ vacuum: { x: 0, y: 0 }, map: { x: 633, y: 122 } }, { vacuum: { x: 1000, y: 0 }, map: { x: 633, y: 42 } }, { vacuum: { x: 0, y: 1000 }, map: { x: 553, y: 122 } }] as CalibPoint[])!;
  const wc = md.segments.find((s) => s.id === 3)!;
  const d = segmentPath(md, wc, (x, y) => calib.toMap(x, y));
  assert.equal((d.match(/M/g) ?? []).length, wc.runs.length);
  assert.equal((d.match(/L/g) ?? []).length, wc.runs.length * 3);
  // Alle Punkte innerhalb des Kartenbilds (1068×680)
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  assert.ok(nums.every((n) => n >= -5 && n <= 1075), 'Koordinaten im Bild');
});
