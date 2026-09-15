// device.js – Geräteerkennung (PD-012): Abzug mit umbenanntem Roboter (heidi → berta, friendly_name „Berta“): Kopf, Seitenleiste
// und Karte zeigen den Namen aus HA, Dienste gehen an vacuum.berta; Konfiguration `robot:` wählt bei zwei Robotern; ohne
// Roboter bleibt die Seite fehlerfrei und die Diagnose zählt alle Roboter-IDs als fehlend.
import * as H from './harness.js';

const b = await H.launch();
console.log('device');
const docked = H.loadFixture();
const ROBOT_DOMAINS = ['vacuum', 'camera', 'sensor', 'button', 'switch', 'select', 'number', 'time'];
const PACKAGE_SENSORS = ['sensor.heidi_heutiger_plan', 'sensor.heidi_automatik_status', 'sensor.heidi_phase', 'sensor.heidi_prognose', 'sensor.heidi_lernwerte'];
function renamed(states, to, name) {
  const out = {};
  for (const [id, e] of Object.entries(states)) {
    const dom = id.split('.')[0];
    const robot = ROBOT_DOMAINS.includes(dom) && id.split('.')[1].startsWith('heidi') && !PACKAGE_SENSORS.includes(id);
    if (!robot) { out[id] = e; continue; }
    const nid = id.replace('.heidi', `.${to}`);
    out[nid] = { ...e, entity_id: nid, attributes: id === 'vacuum.heidi' ? { ...e.attributes, friendly_name: name } : e.attributes };
  }
  return out;
}
const hero = (page, fn) => page.evaluate((f) => { const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot; return new Function('h', 'return (' + f + ')(h)')(h); }, fn.toString());

// ── umbenannt: berta ──
{
  const states = renamed(docked, 'berta', 'Berta');
  states['vacuum.berta'] = { ...states['vacuum.berta'], state: 'cleaning', attributes: { ...states['vacuum.berta'].attributes, docked: false } };
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1200 } });
  H.checkEqual('Kopfzeile „Berta ist unterwegs“ (Name aus HA)', await H.shadowText(page, '.topbar h1'), 'Berta ist unterwegs');
  H.checkEqual('dx-hero zeigt den Namen aus HA', await hero(page, (h) => h.querySelector('.name').textContent.trim()), 'Berta');
  H.checkEqual('Seitenleiste zeigt den Namen aus HA', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot.querySelector('.brand .t').textContent.trim()), 'Berta');
  const batt = await hero(page, (h) => h.querySelector('.batt').textContent.replace(/\s+/g, ' ').trim());
  H.check('Akku wie im Original-Abzug (IDs wurden erkannt)', /\d+\s*%/.test(batt), batt);
  await page.evaluate(() => { window._calls.length = 0; document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('[data-svc="pause"]').click(); });
  await page.waitForTimeout(80);
  H.checkEqual('Pause → vacuum.pause an vacuum.berta', await page.evaluate(() => window._calls), [['vacuum', 'pause', { entity_id: 'vacuum.berta' }]]);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── zwei Roboter: Konfiguration robot: entscheidet ──
{
  const states = renamed(docked, 'berta', 'Berta');
  states['vacuum.anton'] = { entity_id: 'vacuum.anton', state: 'docked', attributes: { friendly_name: 'Anton', segment_cleaning: false, battery_level: 11 } };
  const { page, errs } = await H.mount(b, { page: 'start', states, config: { page: 'start', robot: 'vacuum.berta' }, viewport: { width: 1400, height: 1200 } });
  H.checkEqual('robot: vacuum.berta → Berta trotz alphabetisch erstem Anton', await hero(page, (h) => h.querySelector('.name').textContent.trim()), 'Berta');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── kein Roboter ──
{
  const states = Object.fromEntries(Object.entries(docked).filter(([id]) => !id.startsWith('vacuum.')));
  const { page, errs } = await H.mount(b, { page: 'einstellungen', states, viewport: { width: 1400, height: 1200 } });
  const text = await H.shadowText(page, '.page');
  const m = /Diagnose: (\d+) fehlend/.exec(text || '');
  H.check('ohne Roboter: Seite rendert, Diagnose zählt alle Roboter-Merkmale als fehlend (≥ 50)', !!m && parseInt(m[1], 10) >= 50, text && text.slice(0, 200));
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
