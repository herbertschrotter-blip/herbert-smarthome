// Gemeinsames Gerüst für die v1-Tests (Bauplan 0.1).
// Startet Chromium, lädt heidi-panel.js mit real_states.json in eine leere Seite und stellt
// Prüf-Funktionen bereit. Jede Abweichung setzt process.exitCode = 1, damit `npm test` rot wird.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const PANEL = path.join(HERE, '..', '..', 'ha', 'www', 'heidi-panel.js');
const STATES = path.join(HERE, 'real_states.json');

let failed = 0, passed = 0;

/** Prüft eine Bedingung. Bei Abweichung: FEHLER-Zeile, Exit-Code 1. */
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok      ${name}`); }
  else { failed++; process.exitCode = 1; console.log(`  FEHLER  ${name}${detail !== undefined ? '\n          ' + fmt(detail) : ''}`); }
  return !!cond;
}

/** Vergleicht zwei Werte über JSON (Reihenfolge zählt). */
function checkEqual(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  return check(name, g === w, { erwartet: want, bekommen: got });
}

function fmt(v) { return typeof v === 'string' ? v : JSON.stringify(v, null, 0); }

/** Zusammenfassung am Ende eines Tests; schließt den Browser. */
async function finish(browser, errs) {
  if (errs) check('keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await browser.close();
  console.log(`  → ${passed} ok, ${failed} Fehler${failed ? '  (Exit-Code 1)' : ''}`);
}

/** Chromium starten: erst der feste Pfad der Web-Umgebung, sonst die Playwright-Installation. */
async function launch() {
  return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
}

/**
 * Seite mit der Karte aufbauen.
 * opts.viewport   – Fenstergröße
 * opts.mapCard    – Text/Style des Karten-Platzhalters (createCardElement)
 * opts.captureSvc – true: console-Zeilen, die mit "svc" beginnen, in errs sammeln (test-zones)
 * Liefert { page, errs, states } – die Karte ist noch NICHT mit hass versorgt (jeder Test setzt
 * seine eigene callService/callApi-Nachbildung).
 */
async function mount(browser, opts = {}) {
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1200, height: 1400 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push('console: ' + m.text());
    else if (opts.captureSvc && m.text().startsWith('svc')) errs.push(m.text());
  });
  const js = fs.readFileSync(PANEL, 'utf8');
  const states = JSON.parse(fs.readFileSync(STATES, 'utf8'));
  const mapStyle = opts.mapStyle || 'height:300px;background:#1c2732;color:#9ab;display:grid;place-items:center';
  await page.setContent(`<!doctype html><html><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText=${JSON.stringify(mapStyle)}; d.textContent='[Karte: '+cfg.type+']'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await page.addScriptTag({ content: js });
  return { page, errs, states };
}

/** Klickt ein Element im Shadow DOM der Karte; liefert 'ok' oder 'MISSING <selector>'. */
function clicker(page) {
  return (sel) => page.evaluate((sel) => {
    const el = document.querySelector('heidi-panel'); const t = el.shadowRoot.querySelector(sel);
    if (!t) return 'MISSING ' + sel; t.click(); return 'ok';
  }, sel);
}

/** Liest eine JSON-Erwartung aus heidi/tests/expected/. */
function expected(name) {
  return JSON.parse(fs.readFileSync(path.join(HERE, 'expected', name), 'utf8'));
}

module.exports = { check, checkEqual, finish, launch, mount, clicker, expected };
