// Gemeinsames Gerüst für die E2E-Tests der v2-Karte (Playwright, Chromium).
// - Lädt das gebaute Bundle ha/www/dreame_x60.js in eine leere Seite mit ha-icon- und loadCardHelpers-Stubs.
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

/**
 * Seite mit der Karte aufbauen.
 * opts: { fixture, page, viewport, config, failCalls: [ 'domain.service' ], apiResponse }
 * Liefert { page, errs, states }. Im Browser: window._calls (Call-Log), window._api (callApi-Pfade).
 */
export async function mount(browser, opts = {}) {
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1200, height: 1400 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const js = fs.readFileSync(BUNDLE, 'utf8');
  const states = opts.states || loadFixture(opts.fixture);
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#06090c"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.className='map-stub'; d.style.cssText='height:300px;background:#1c2732;color:#9ab;display:grid;place-items:center'; d.textContent='[Karte: '+cfg.type+']'; return d; } });
  </script></body></html>`);
  await page.addScriptTag({ content: js, type: 'module' });
  await page.waitForFunction(() => !!customElements.get('dreame-x60-panel'));
  await page.evaluate(({ states, config, failCalls, apiResponse }) => {
    window._calls = []; window._api = [];
    const el = document.createElement('dreame-x60-panel');
    el.setConfig(config);
    el.hass = {
      states,
      callService: async (d, s, x) => { window._calls.push([d, s, x]); if ((failCalls || []).includes(d + '.' + s)) throw new Error('injiziert: ' + d + '.' + s); },
      callApi: async (m, p) => { window._api.push(p); return apiResponse ?? []; },
    };
    document.body.appendChild(el);
  }, { states, config: opts.config || { page: opts.page || 'start' }, failCalls: opts.failCalls || [], apiResponse: opts.apiResponse ?? null });
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
