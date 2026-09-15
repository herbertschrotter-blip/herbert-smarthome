// v1-vectors.js – zieht Vergleichswerte (Characterization) aus der laufenden v1-Karte (ha/www/heidi-panel.js).
// Je Thema: Eingaben aus tools/v1-inputs/<thema>.json → alte Funktionen in Playwright aufrufen → tests/fixtures/<thema>.v1.json.
// Aufruf: node tools/v1-vectors.js raumwerte [estimate timeline calibration status labels]   (ohne Argument: alle)
// v1 wird nicht verändert (Regel 3); das Werkzeug liest nur.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CARD = path.resolve(HERE, '..');
const V1 = path.resolve(CARD, '..', '..', 'ha', 'www', 'heidi-panel.js');
const FIXTURES = path.resolve(CARD, 'tests', 'fixtures');
const INPUTS = path.resolve(HERE, 'v1-inputs');

const THEMES = ['raumwerte', 'estimate', 'timeline', 'calibration', 'status', 'labels'];
const wanted = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const themes = wanted.length ? wanted : THEMES;
for (const t of themes) if (!THEMES.includes(t)) { console.error(`unbekanntes Thema ${t}; möglich: ${THEMES.join(' ')}`); process.exit(2); }

const v1Version = (fs.readFileSync(V1, 'utf8').match(/HP_VERSION = "([^"]+)"/) || [])[1] || '?';
const baseStates = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'states-docked.json'), 'utf8'));

/** v1 in eine leere Seite laden (wie heidi/tests/harness.js) und Element mit hass anlegen. */
async function mountV1(browser, states, hooks = {}) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText='height:200px'; d.textContent='[Karte: '+cfg.type+']'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await page.addScriptTag({ content: fs.readFileSync(V1, 'utf8') });
  await page.evaluate(({ states, apiResponse }) => {
    window._api = []; window._calls = [];
    const el = document.querySelector('heidi-panel'); el.setConfig({});
    el.hass = { states, callService: async (d, s, x) => { window._calls.push([d, s, x]); }, callApi: async (m, p) => { window._api.push(p); return apiResponse ?? []; } };
  }, { states, apiResponse: hooks.apiResponse ?? null });
  await page.waitForTimeout(hooks.wait ?? 200);
  return { page, errs };
}

/** Zustände überschreiben: { 'entity.id': { state?, attributes? } } – Attribute werden gemischt. */
function withOverrides(states, overrides = {}) {
  const s = JSON.parse(JSON.stringify(states));
  for (const [id, o] of Object.entries(overrides)) {
    const cur = s[id] || { entity_id: id, state: 'unknown', attributes: {} };
    s[id] = { ...cur, state: o.state ?? cur.state, attributes: o.replaceAttributes ? (o.attributes || {}) : { ...cur.attributes, ...(o.attributes || {}) }, last_updated: 'override' };
  }
  return s;
}

const HANDLERS = {
  // parseRaum / encodeRaum sind Modul-Konstanten von v1 (klassisches Skript → global erreichbar)
  async raumwerte(browser, input) {
    const { page, errs } = await mountV1(browser, baseStates);
    const out = await page.evaluate((inp) => {
      /* global parseRaum, encodeRaum */
      if (inp.s !== undefined) { const parsed = parseRaum(inp.s); return { parsed, encoded: encodeRaum(parsed) }; }
      return { encoded: encodeRaum(inp.obj) };
    }, input);
    await page.close();
    return { out, errs };
  },
  // _estimate(planRead(n), variante, uniform, batt) mit optional überschriebenen Lernwerten
  async estimate(browser, input) {
    const overrides = { ...(input.overrides || {}) };
    if (input.lern) overrides['sensor.heidi_lernwerte'] = { state: String(input.lern.laeufe_gesamt ?? 1), attributes: input.lern };
    if (input.batt !== undefined) overrides['sensor.heidi_battery_level'] = { state: String(input.batt) };
    const { page, errs } = await mountV1(browser, withOverrides(baseStates, overrides));
    const out = await page.evaluate((inp) => {
      const el = document.querySelector('heidi-panel');
      const p = el._planRead(inp.n);
      if (inp.plan) Object.assign(p, inp.plan, inp.plan.raeume ? { raeume: new Set(inp.plan.raeume) } : {});
      const e = el._estimate(p, inp.variante || 'normal', inp.uniform || null, inp.batt0 ?? null);
      return { plan: { ...p, raeume: [...p.raeume], personen: [...p.personen] }, estimate: e, restMin: el._restMin() };
    }, input);
    await page.close();
    return { out, errs };
  },
  // Historie relativ zu „jetzt“ (Minuten) → _loadTimeline über callApi → _tl[key].rows
  async timeline(browser, input) {
    const now = Date.now(), m = (min) => new Date(now - min * 60000).toISOString();
    const hist = [
      input.phase.map(([min, state], i) => (i === 0 ? { entity_id: 'sensor.heidi_phase', state, last_changed: m(min) } : { state, last_changed: m(min) })),
      input.vac.map(([min, state], i) => (i === 0 ? { entity_id: 'vacuum.heidi', state, last_changed: m(min) } : { state, last_changed: m(min) })),
    ];
    const overrides = {
      'sensor.heidi_phase': { state: input.phaseNow, attributes: {} },
      'vacuum.heidi': { state: input.vacState || 'cleaning' },
    };
    const states = withOverrides(baseStates, overrides);
    states['sensor.heidi_phase'].last_changed = m(input.phaseNowMin ?? 3);
    const { page, errs } = await mountV1(browser, states, { apiResponse: hist, wait: 600 });
    const out = await page.evaluate(() => {
      const el = document.querySelector('heidi-panel');
      const tl = el._tl.cur;
      return { rows: tl?.rows ?? null, end: tl?.end ?? null, error: tl?.error ?? null, api: window._api };
    });
    await page.close();
    return { out: { now, ...out }, errs };
  },
  // _calib() mit Punkten (aus Fixture oder Eingabe) → Hin- und Rücktransformation von Beispielpunkten; _rectsFromAttr
  async calibration(browser, input) {
    const overrides = {};
    if (input.points) overrides['camera.heidi_map'] = { attributes: { calibration_points: input.points } };
    const { page, errs } = await mountV1(browser, withOverrides(baseStates, overrides));
    const out = await page.evaluate((inp) => {
      const el = document.querySelector('heidi-panel');
      const c = el._calib();
      const res = { calibNull: c === null };
      if (c && inp.px) res.toVac = inp.px.map(([x, y]) => c.toVac(x, y));
      if (c && inp.mm) res.toMap = inp.mm.map(([x, y]) => c.toMap(x, y));
      if (inp.rects !== undefined) res.rects = el._rectsFromAttr(inp.rects);
      return res;
    }, input);
    await page.close();
    return { out, errs };
  },
  // Kopf: groß / klein / Knöpfe / Chips aus dem gerenderten Hero
  async status(browser, input) {
    const { page, errs } = await mountV1(browser, withOverrides(baseStates, input.overrides || {}));
    const out = await page.evaluate(() => {
      const sr = document.querySelector('heidi-panel').shadowRoot;
      const t = (sel) => sr.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim() ?? null;
      return { big: t('.hero .big'), sub: t('.hero .sub'), btns: [...sr.querySelectorAll('.hero .ctl .btn')].map((b) => b.textContent.trim()), chips: [...sr.querySelectorAll('.hero .chip')].map((c) => ({ text: c.textContent.replace(/\s+/g, ' ').trim(), cls: c.className })), strip: t('.strip') };
    });
    await page.close();
    return { out, errs };
  },
  // Beschriftungen: fn + args; Sets über input.set
  async labels(browser, input) {
    const { page, errs } = await mountV1(browser, baseStates);
    const out = await page.evaluate((inp) => {
      const el = document.querySelector('heidi-panel');
      const args = (inp.args || []).map((a) => (a && a.__set ? new Set(a.__set) : a));
      return { result: el[inp.fn](...args) };
    }, input);
    await page.close();
    return { out, errs };
  },
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let bad = 0;
for (const theme of themes) {
  const inputFile = path.join(INPUTS, `${theme}.json`);
  if (!fs.existsSync(inputFile)) { console.error(`Eingaben fehlen: ${inputFile}`); bad++; continue; }
  const inputs = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const vectors = [];
  for (const entry of inputs) {
    const { name, ...input } = entry;
    const { out, errs } = await HANDLERS[theme](browser, input);
    if (errs.length) { console.error(`  ${theme}/${name}: Fehler in v1: ${errs.join(' | ')}`); bad++; }
    vectors.push({ name, input, output: out });
  }
  const file = path.join(FIXTURES, `${theme}.v1.json`);
  fs.writeFileSync(file, JSON.stringify({ quelle: `ha/www/heidi-panel.js v${v1Version}`, erzeugt: new Date().toISOString(), vektoren: vectors }, null, 1) + '\n');
  console.log(`${theme}: ${vectors.length} Vektor(en) → ${path.relative(CARD, file)}`);
}
await browser.close();
process.exit(bad ? 1 : 0);
