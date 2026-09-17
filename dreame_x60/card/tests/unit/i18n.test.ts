// Texte zentral (Bauplan 4.14, i18n Stufe 1): Schlüssel eindeutig und gefüllt, t()/tx()/lookup() wie beschrieben,
// und kein fester deutscher Text mehr im Code außerhalb von src/i18n/ (Scan über Bausteine, Shell, Domäne, HA-Schicht).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { de } from '../../src/i18n/de';
import { lookup, t, textKeys, tx } from '../../src/i18n/t';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');

test('de.ts: jeder Schlüssel eindeutig, kein leerer Text, Form <bereich>.<name>', () => {
  const keys = textKeys();
  assert.ok(keys.length > 300, `nur ${keys.length} Schlüssel`);
  assert.equal(new Set(keys).size, keys.length);
  for (const k of keys) {
    assert.match(k, /^[a-z][a-zA-Z0-9]*\.[A-Za-z0-9_. ]+$/, `Schlüsselform: ${k}`);
    assert.equal(typeof de[k as keyof typeof de], 'string', k);
    assert.ok((de[k as keyof typeof de] as string).length > 0, `leer: ${k}`);
  }
});

test('t(): Text mit Platzhaltern; tx(): unbekannter Schlüssel kommt zurück; lookup(): undefined ohne Eintrag', () => {
  assert.equal(t('error.dust_bag_full'), 'Staubbeutel voll');
  assert.equal(t('strip.now', { room: 'Küche' }), 'Jetzt: Küche');
  assert.equal(t('estimate.charge', { from: 17, to: 80 }), 'Lädt 17 % → 80 %');
  assert.equal(t('label.min', { n: 5 }), '5 min');
  assert.equal(tx('gibt.es.nicht'), 'gibt.es.nicht');
  assert.equal(tx('strip.to', { rooms: 'Bad' }), 'zu Bad');
  assert.equal(lookup('status', 'charging'), 'lädt');
  assert.equal(lookup('status', 'fremd'), undefined);
  assert.equal(lookup('error', 'brush_stuck'), 'Bürste blockiert');
});

test('Warnungen der Integration: alle 22 Codes haben Kurztext (höchstens zwei Wörter) und Langtext', () => {
  const warn = ['no_tank_box', 'water_box_empty', 'battery_low', 'blocked', 'filter_blocked', 'laser', 'remove_mop', 'mop_removed', 'mop_pad_stop_rotate',
    'low_battery_turn_off', 'slippery_floor', 'check_mop_install', 'water_tank_dry', 'clean_mop_pad', 'station_disconnected', 'dust_bag_full', 'unknown',
    'self_test_failed', 'wash_failed', 'onboard_water_tank_empty', 'onboard_dirty_water_tank_full'];
  for (const code of warn) {
    const short = lookup('error', code), long = lookup('errorLong', code);
    assert.ok(short, `Kurztext fehlt: ${code}`);
    assert.ok(short!.split(/\s+/).length <= 2, `Kurztext zu lang: ${code} = ${short}`);
    assert.ok(long && long.length > short!.length, `Langtext fehlt: ${code}`);
  }
  // Jeder Kurztext hat einen Langtext und umgekehrt
  const shorts = textKeys().filter((k) => k.startsWith('error.')).map((k) => k.slice(6));
  const longs = new Set(textKeys().filter((k) => k.startsWith('errorLong.')).map((k) => k.slice(10)));
  assert.deepEqual(shorts.filter((c) => !longs.has(c)), []);
  assert.deepEqual([...longs].filter((c) => !shorts.includes(c)), []);
});

/** Kommentare entfernen (Zeilen- und Blockkommentare), damit nur Code geprüft wird. */
const stripComments = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
/** Feste Texte im Code: Zeichenketten in '…' / "…" und Textknoten in Templates (zwischen > und <). */
const literals = (src: string): string[] => {
  const out: string[] = [];
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) out.push(m[1] ?? m[2] ?? '');
  for (const m of src.matchAll(/>([^<>`${}]*[A-Za-zÄÖÜäöüß][^<>`${}]*)</g)) out.push(m[1]!);
  return out;
};
const GERMAN = /[äöüÄÖÜß]|\b(Station|Akku|Start|Stopp|Pause|Orten|Karte|Jetzt|Fehler|Hinweis|Einstellungen|Zuhause|Roboter|Wohnung|Planer|Verlauf|Prognose|Modus|Saugstufe|Wasser|Weiter|Abbrechen|Zurück|Öffnen|Schließen|Alle|Alles|Räume|Raum|Übersicht|Sperrzonen)\b/;
/** Textschlüssel (`bereich.name`) und Seiten-/Slot-Kennungen sind keine Texte. */
const KEY_LIKE = /^[a-z][a-zA-Z0-9]*(\.[A-Za-z0-9_]+)+$/;
/** Werte aus HA/Backend, die im Code verglichen werden (keine Anzeigetexte): Phasen aus heidi.yaml, Kartendarstellungen, Optionswerte der Selects. */
const ALLOW = new Set(['Schläft', 'Lädt', 'Angedockt', 'Bereit', 'Xiaomi-Karte', 'Heidi-Karte', 'Dreame-App', 'Deutsch', 'Original', 'Saugen', 'Nur Wischen', 'Standard', 'Leise', 'Stark', 'Turbo']);

test('kein fester deutscher Text im Code außerhalb von src/i18n/', () => {
  const dirs = ['components', 'domain', 'shared', 'ha', '.'];
  const files = dirs.flatMap((d) => fs.readdirSync(path.join(SRC, d)).filter((f) => f.endsWith('.ts')).map((f) => path.join(d, f)));
  const hits: string[] = [];
  for (const f of files) {
    if (f.startsWith('ha') && f.endsWith('contract.ts')) continue; // Vertrag: Optionswerte der Selects (deutsch, aus dem Paket)
    const src = stripComments(fs.readFileSync(path.join(SRC, f), 'utf8'));
    for (const lit of literals(src)) {
      const s = lit.trim();
      if (!s || ALLOW.has(s) || s.startsWith('mdi:') || KEY_LIKE.test(s)) continue;
      if (GERMAN.test(s)) hits.push(`${f}: ${s.slice(0, 60)}`);
    }
  }
  assert.deepEqual(hits, [], 'feste Texte gefunden – nach src/i18n/de.ts verschieben');
});
