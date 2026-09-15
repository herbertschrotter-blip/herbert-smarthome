// render.js – jede der sechs Seiten rendert mit states-docked.json ohne Konsolenfehler; Version in der Seitenleiste (1.2/4.0);
// Bento-Übersicht mit zehn Flächen in Dokumentreihenfolge (4.0).
import * as H from './harness.js';

const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen'];
const SLOTS_IDLE = ['hero', 'map', 'automatik', 'heute', 'planer', 'consumables', 'station', 'stats', 'quickstart', 'history'];
const b = await H.launch();
console.log('render');
const slots = (page) => page.evaluate(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelectorAll('[data-slot]')].map((e) => e.dataset.slot));
for (const pg of PAGES) {
  const { page, errs } = await H.mount(b, { page: pg, viewport: { width: 1400, height: 1400 } });
  const version = await page.evaluate(() => { const n = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav'); const v = n && n.shadowRoot.querySelector('.version'); return v ? v.textContent.trim() : null; });
  const data = await H.shadowText(page, '.page');
  H.check(`${pg}: Version in der Seitenleiste "dreame_x60 v${H.VERSION}"`, version === `dreame_x60 v${H.VERSION}`, version);
  H.check(`${pg}: Seite markiert`, await page.evaluate((p) => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector(`.page[data-page="${p}"]`), pg));
  H.check(`${pg}: Zustandsdaten angebunden`, /\d+ Entitäten verbunden/.test(data || ''), data && data.slice(0, 120));
  H.check(`${pg}: Kopfzeile mit Titel`, !!(await H.shadowText(page, '.topbar h1')));
  H.check(`${pg}: keine Seiten-/Konsolenfehler`, errs.length === 0, errs);
  if (pg === 'start') {
    H.checkEqual('start: zehn Flächen in Dokumentreihenfolge (Leerlauf: automatik)', await slots(page), SLOTS_IDLE);
    H.check('start: Tagesgruß im Leerlauf', /^Guten (Morgen|Tag|Abend)!$/.test((await H.shadowText(page, '.topbar h1')) || ''), await H.shadowText(page, '.topbar h1'));
    await H.screenshot(page, 'render-start.png');
  }
  await page.close();
}
// Im Lauf: rechte Spalte zeigt „Aktueller Auftrag“ statt Automatik, Titel „Heidi ist unterwegs“; Gruß mit Benutzername
{
  const states = H.loadFixture();
  states['vacuum.heidi'] = { ...states['vacuum.heidi'], state: 'cleaning' };
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  H.checkEqual('start im Lauf: Fläche auftrag statt automatik', await slots(page), SLOTS_IDLE.map((s) => (s === 'automatik' ? 'auftrag' : s)));
  H.check('start im Lauf: Titel „Heidi ist unterwegs“', (await H.shadowText(page, '.topbar h1')) === 'Heidi ist unterwegs');
  await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); el.hass = { ...el.hass, states: { ...el.hass.states, 'vacuum.heidi': { ...el.hass.states['vacuum.heidi'], state: 'docked' } }, user: { name: 'Herbert' } }; });
  await page.waitForTimeout(60);
  H.check('Gruß mit Benutzername', /^Guten (Morgen|Tag|Abend), Herbert!$/.test((await H.shadowText(page, '.topbar h1')) || ''), await H.shadowText(page, '.topbar h1'));
  H.check('im Lauf: keine Fehler', errs.length === 0, errs);
  await page.close();
}
// Schmal (390): eine Spalte, kein waagrechter Überlauf, Meta der Kopfzeile ausgeblendet
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 390, height: 844 } });
  const r = await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); const meta = el.shadowRoot.querySelector('.topbar .meta'); return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, meta: getComputedStyle(meta).display }; });
  H.check('390: kein waagrechter Überlauf', !r.overflow, r);
  H.check('390: Meta ausgeblendet', r.meta === 'none', r);
  H.check('390: keine Fehler', errs.length === 0, errs);
  await H.screenshot(page, 'render-start-390.png');
  await page.close();
}
// Unbekannte Seite fällt auf start zurück; Konfiguration ohne page ebenso
{
  const { page, errs } = await H.mount(b, { config: { page: 'gibtsnicht' } });
  H.check('unbekannte page → start', await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('.page[data-page="start"]')));
  H.check('unbekannte page: keine Fehler', errs.length === 0, errs);
  await page.close();
}
// customCards-Eintrag genau einmal, auch wenn das Bundle zweimal geladen wird
{
  const { page } = await H.mount(b, { page: 'start' });
  const js = (await import('node:fs')).readFileSync(H.BUNDLE, 'utf8');
  await page.addScriptTag({ content: js, type: 'module' });
  await page.waitForTimeout(100);
  const n = await page.evaluate(() => window.customCards.filter((c) => c.type === 'dreame-x60-panel').length);
  H.check('customCards-Eintrag genau einmal nach doppeltem Laden', n === 1, n);
  await page.close();
}
await b.close();
H.summary();
