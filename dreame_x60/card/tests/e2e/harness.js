import zlib from 'node:zlib';
import { Buffer } from 'node:buffer';
// Gemeinsames Gerüst für die E2E-Tests der v2-Karte (Playwright, Chromium).
// - Serviert eine leere Seite unter http://dx.test/dreame-x60/<page> (echter Ursprung, damit history.pushState geht)
//   mit ha-icon- und loadCardHelpers-Stubs und lädt das gebaute Bundle ha/www/dreame_x60.js.
// - hass-Mock mit Call-Log (callService), callApi-Mock und Fehlerinjektion.
// - check/checkEqual setzen process.exitCode = 1 bei jeder Abweichung (Regel 7).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CARD_DIR = path.resolve(HERE, '..', '..');
export const BUNDLE = path.resolve(CARD_DIR, '..', '..', 'ha', 'www', 'dreame_x60.js');
export const FIXTURES = path.resolve(CARD_DIR, 'tests', 'fixtures');
export const OUT = path.resolve(CARD_DIR, 'tests', 'e2e', 'out');
export const VERSION = JSON.parse(fs.readFileSync(path.resolve(CARD_DIR, 'package.json'), 'utf8')).version;
export const ORIGIN = 'http://dx.test';

let failed = 0, passed = 0;
const fmt = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

export function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok      ${name}`); }
  else { failed++; process.exitCode = 1; console.log(`  FEHLER  ${name}${detail !== undefined ? '\n          ' + fmt(detail) : ''}`); }
  return !!cond;
}
export function checkEqual(name, got, want) {
  return check(name, JSON.stringify(got) === JSON.stringify(want), { erwartet: want, bekommen: got });
}
export function summary() {
  console.log(`  → ${passed} ok, ${failed} Fehler${failed ? '  (Exit-Code 1)' : ''}`);
}

export async function launch() {
  return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
}

export function loadFixture(name = 'states-docked.json') {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

const PAGE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>dx test</title></head><body style="margin:0;background:#06090c"><script>
  class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
  customElements.define('ha-icon', HaIcon);
  window._cards = []; // jede erzeugte Karten-Konfiguration (4.3: Modi, Umrisse, Anzahl der Neuerzeugungen)
  window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { window._cards.push(cfg); const d=document.createElement('div'); d.className='map-stub'; d.cfg=cfg; d.style.cssText='height:300px;background:#1c2732;color:#9ab;display:grid;place-items:center'; d.textContent='[Karte: '+cfg.type+']'; return d; } });
</script></body></html>`;

/**
 * Seite mit der Karte aufbauen.
 * opts: { fixture, states, page, viewport, config, failCalls: ['domain.service'], apiResponse, user }
 * Liefert { page, errs, states }. Im Browser: window._calls (Call-Log), window._api (callApi-Pfade),
 * window._events (gefeuerte HA-Ereignisse [Pfad, Daten], Diagnose PD-017).
 */
export async function mount(browser, opts = {}) {
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1200, height: 1400 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.route(`${ORIGIN}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: PAGE_HTML }));
  // Kamerabilder (4.3b Heidi-Karte): gerendertes Kartenbild und Datenkarte (PNG mit Kartenpaket) aus den Fixtures – zuletzt registriert = zuerst geprüft
  await page.route(`${ORIGIN}/api/camera_proxy/camera.heidi_map**`, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(FIXTURES, 'map.png')) }));
  await page.route(`${ORIGIN}/api/camera_proxy/camera.heidi_map_data**`, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(FIXTURES, 'map-data.png')) }));
  const pg = opts.config?.page ?? opts.page ?? 'start';
  await page.goto(`${ORIGIN}/dreame-x60/${pg}`);
  const js = fs.readFileSync(BUNDLE, 'utf8');
  const states = opts.states || loadFixture(opts.fixture);
  await page.addScriptTag({ content: js, type: 'module' });
  await page.waitForFunction(() => !!customElements.get('dreame-x60-panel'));
  await page.evaluate(({ states, config, failCalls, apiResponse, wsResponses, user }) => {
    window._calls = []; window._api = []; window._ws = []; window._events = []; window._wsResponses = wsResponses || null;
    const el = document.createElement('dreame-x60-panel');
    el.setConfig(config);
    el.hass = {
      states,
      callService: async (d, s, x) => { window._calls.push([d, s, x]); if ((failCalls || []).includes(d + '.' + s)) throw new Error('injiziert: ' + d + '.' + s); },
      callApi: async (m, p, d) => { window._api.push(p); if (m === 'POST' && p.startsWith('events/')) window._events.push([p, d]); return apiResponse ?? []; },
      user: user || undefined,
      callWS: async (msg) => { window._ws.push(msg); const all = window._wsResponses || {}; const byService = all[msg.type + ":" + msg.service]; const byCmd = byService && msg.service_data && msg.service_data.args ? byService[JSON.parse(decodeURIComponent(escape(window.atob(msg.service_data.args)))).cmd] : undefined; const r = byCmd !== undefined ? byCmd : byService !== undefined && !(byService && byService.liste) ? byService : all[msg.type]; if (r === undefined) throw new Error('kein WS-Stub für ' + msg.type); return r; },
      connection: { subscribeEvents: async (cb, type) => { (window._subs = window._subs || {})[type] = cb; return () => { delete window._subs[type]; }; } },
    };
    document.body.appendChild(el);
  }, { states, config: opts.config || { page: pg }, failCalls: opts.failCalls || [], apiResponse: opts.apiResponse ?? null, wsResponses: opts.wsResponses || null, user: opts.user || null });
  await page.waitForTimeout(150);
  return { page, errs, states };
}

/** Text im Shadow DOM der Karte lesen (querySelector auf shadowRoot). */
export function shadowText(page, selector) {
  return page.evaluate((sel) => { const el = document.querySelector('dreame-x60-panel'); const t = el && el.shadowRoot.querySelector(sel); return t ? t.textContent.replace(/\s+/g, ' ').trim() : null; }, selector);
}

export async function screenshot(page, name) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
}

/** Gültiges einfarbiges PNG in der gewünschten Größe (HT-0010: Bildformate der Karten-Kamera nachstellen). */
export function png(w, h) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0; // 8 Bit Graustufen
  const raw = Buffer.alloc((w + 1) * h, 0x40); for (let y = 0; y < h; y++) raw[y * (w + 1)] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
