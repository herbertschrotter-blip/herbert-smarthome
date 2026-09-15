// Raumwerte-Codec: Parität mit v1 (raumwerte.v1.json) und fachliche Regeln (raumwerte.spec.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeRaum, parseRaum } from '../../src/domain/raumwerte';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8')) as T;

interface V1Vector { name: string; pd?: string; input: { s?: string; obj?: Record<string, never> }; output: { parsed?: unknown; encoded: string } }
const v1 = read<{ quelle: string; vektoren: V1Vector[] }>('raumwerte.v1.json');

test(`Parität mit ${v1.quelle}: ${v1.vektoren.length} Vektoren`, () => {
  assert.ok(v1.vektoren.length >= 10, 'zu wenige v1-Vektoren');
  for (const v of v1.vektoren) {
    if (v.pd) continue; // bewusste Abweichung von v1 (Abschnitt 10a), Verhalten in raumwerte.spec.json festgelegt
    if (v.input.s !== undefined) {
      const parsed = parseRaum(v.input.s);
      assert.deepEqual(parsed, v.output.parsed, `${v.name}: parseRaum`);
      assert.equal(encodeRaum(parsed), v.output.encoded, `${v.name}: encodeRaum(parseRaum)`);
    } else {
      assert.equal(encodeRaum(v.input.obj ?? {}), v.output.encoded, `${v.name}: encodeRaum(obj)`);
    }
  }
});

interface Spec {
  parse: { name: string; s: string | null; erwartet: unknown }[];
  encode: { name: string; obj: Record<string, never>; erwartet: string }[];
  roundtrip: { name: string; s: string; erwartet?: string }[];
  laenge: { name: string; s: string; max: number };
}
const spec = read<Spec>('raumwerte.spec.json');

test('spec: parseRaum-Regeln', () => {
  for (const c of spec.parse) assert.deepEqual(parseRaum(c.s), c.erwartet, c.name);
  assert.deepEqual(parseRaum(undefined), {}, 'undefined ergibt leer');
});

test('spec: encodeRaum-Regeln', () => {
  for (const c of spec.encode) assert.equal(encodeRaum(c.obj), c.erwartet, c.name);
});

test('spec: Roundtrip stabil', () => {
  for (const c of spec.roundtrip) {
    const once = encodeRaum(parseRaum(c.s));
    assert.equal(once, c.erwartet ?? c.s, c.name);
    assert.equal(encodeRaum(parseRaum(once)), once, `${c.name}: zweiter Durchlauf`);
  }
  // Eigenschaft: für jede v1-Eingabe ist encode(parse(x)) ein Fixpunkt
  for (const v of v1.vektoren) if (v.input.s !== undefined) {
    const once = encodeRaum(parseRaum(v.input.s));
    assert.equal(encodeRaum(parseRaum(once)), once, `${v.name}: Fixpunkt`);
  }
});

test('spec: sieben Räume passen in input_text (max 255)', () => {
  const parsed = parseRaum(spec.laenge.s);
  assert.equal(Object.keys(parsed).length, 7);
  const enc = encodeRaum(parsed);
  assert.ok(enc.length <= spec.laenge.max, `${enc.length} Zeichen`);
});
