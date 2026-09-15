// nav.js – dx-nav (4.0): drei Formen nach Breite, jeder Eintrag navigiert (history.pushState + location-changed),
// „Räume“ öffnet das Overlay, Prognose nur bei aktiv, aria-current, Zurück-Knopf der Unterseiten (3.3 + 4.0).
import * as H from './harness.js';

const b = await H.launch();
console.log('nav');

/** Form der Navigation im Browser: Sichtbarkeit von Seitenleiste/Tab-Leiste, Breite der Seitenleiste, Sichtbarkeit der Beschriftung. */
const form = (page) => page.evaluate(() => {
  const nav = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot;
  const vis = (el) => !!el && getComputedStyle(el).display !== 'none';
  const side = nav.querySelector('.side'), tab = nav.querySelector('.tabbar'), label = nav.querySelector('.side .navlist button > span');
  return { side: vis(side), tab: vis(tab), sideWidth: side ? side.getBoundingClientRect().width : 0, labels: vis(label), tabButtons: tab ? tab.querySelectorAll('button').length : 0, tabRooms: !!tab?.querySelector('[data-nav="rooms"]') };
});
const navKeys = (page, where) => page.evaluate((w) => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot.querySelectorAll(`${w} [data-nav]`)].map((b) => b.dataset.nav), where);
/** Klick auf einen Eintrag; wartet auf location-changed. */
const clickNav = (page, where, key) => page.evaluate(({ w, k }) => new Promise((resolve) => {
  const nav = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot;
  const onChange = () => { window.removeEventListener('location-changed', onChange); resolve({ path: location.pathname }); };
  window.addEventListener('location-changed', onChange);
  nav.querySelector(`${w} [data-nav="${k}"]`).click();
  setTimeout(() => { window.removeEventListener('location-changed', onChange); resolve({ path: location.pathname, timeout: true }); }, 500);
}), { w: where, k: key });
const hasOverlay = (page, kind) => page.evaluate((k) => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector(`.overlay[data-kind="${k}"]`), kind);

// ── Seitenleiste bei 1400 px: alle Einträge, Navigation, Räume-Overlay, aria-current ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 1400, height: 1200 } });
  const f = await form(page);
  H.check('1400: Seitenleiste sichtbar, Tab-Leiste nicht', f.side && !f.tab && f.labels && f.sideWidth >= 200, f);
  H.checkEqual('1400: Einträge in Reihenfolge des Mockups', await navKeys(page, '.side'), ['start', 'reinigen', 'rooms', 'planer', 'protokoll', 'prognose', 'einstellungen']);
  H.check('Startpfad /dreame-x60/start', (await page.evaluate(() => location.pathname)) === '/dreame-x60/start');
  H.check('aktiver Eintrag start trägt aria-current', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot.querySelector('.side [data-nav="start"]').getAttribute('aria-current') === 'page'));
  for (const target of ['reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen', 'start']) {
    const r = await clickNav(page, '.side', target);
    H.check(`Seitenleiste ${target} → location-changed mit /dreame-x60/${target}`, !r.timeout && r.path === `/dreame-x60/${target}`, r);
  }
  await clickNav(page, '.side', 'rooms').catch(() => null);
  await page.waitForTimeout(60);
  H.check('„Räume“ öffnet Overlay rooms (keine Navigation)', (await hasOverlay(page, 'rooms')) && (await page.evaluate(() => location.pathname)) === '/dreame-x60/start');
  H.check('Version in der Seitenleiste', (await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot.querySelector('.version').textContent.trim())) === `dreame_x60 v${H.VERSION}`);
  H.check('1400: keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Symbolleiste bei 1000 px ──
{
  const { page, errs } = await H.mount(b, { page: 'planer', viewport: { width: 1000, height: 1200 } });
  const f = await form(page);
  H.check('1000: Symbolleiste (schmale Seitenleiste ohne Beschriftung), keine Tab-Leiste', f.side && !f.tab && !f.labels && f.sideWidth > 0 && f.sideWidth < 100, f);
  H.check('1000: aktiver Eintrag planer trägt aria-current', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-nav').shadowRoot.querySelector('.side [data-nav="planer"]').getAttribute('aria-current') === 'page'));
  H.check('1000: keine Fehler', errs.length === 0, errs);
  await page.close();
}

// ── Tab-Leiste bei 390 px ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 390, height: 844 } });
  const f = await form(page);
  H.check('390: Tab-Leiste sichtbar, Seitenleiste nicht', f.tab && !f.side, f);
  H.check('390: höchstens sechs Tabs, ohne „Räume“', f.tabButtons <= 6 && f.tabButtons >= 5 && !f.tabRooms, f);
  H.checkEqual('390: Tabs in Reihenfolge', await navKeys(page, '.tabbar'), ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen']);
  const r = await clickNav(page, '.tabbar', 'protokoll');
  H.check('Tab protokoll → /dreame-x60/protokoll', !r.timeout && r.path === '/dreame-x60/protokoll', r);
  H.check('390: keine Fehler', errs.length === 0, errs);
  await page.close();
}

// ── Prognose-Eintrag fehlt, wenn die Prognose aus ist ──
{
  const states = H.loadFixture();
  states['input_boolean.heidi_prognose_aktiv'] = { ...states['input_boolean.heidi_prognose_aktiv'], state: 'off' };
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1200 } });
  H.checkEqual('Prognose aus: kein Eintrag prognose (Seitenleiste)', await navKeys(page, '.side'), ['start', 'reinigen', 'rooms', 'planer', 'protokoll', 'einstellungen']);
  H.checkEqual('Prognose aus: Tab-Leiste ohne prognose', await navKeys(page, '.tabbar'), ['start', 'reinigen', 'planer', 'protokoll', 'einstellungen']);
  H.check('Prognose aus: keine Fehler', errs.length === 0, errs);
  await page.close();
}

// ── Zurück-Knopf der Unterseiten und Rückfall bei unbekannter Seite ──
{
  const { page, errs } = await H.mount(b, { page: 'einstellungen', viewport: { width: 1400, height: 1200 } });
  const r = await page.evaluate(() => new Promise((resolve) => {
    const el = document.querySelector('dreame-x60-panel');
    const onChange = () => { window.removeEventListener('location-changed', onChange); resolve({ path: location.pathname }); };
    window.addEventListener('location-changed', onChange);
    el.shadowRoot.querySelector('.topbar .back').click();
    setTimeout(() => resolve({ path: location.pathname, timeout: true }), 500);
  }));
  H.check('Zurück-Knopf → /dreame-x60/start', !r.timeout && r.path === '/dreame-x60/start', r);
  const p2 = await page.evaluate(() => { document.querySelector('dreame-x60-panel').dispatchEvent(new CustomEvent('dx-navigate', { detail: { page: 'nix' }, bubbles: true, composed: true })); return location.pathname; });
  H.check('unbekannte Seite navigiert zu start', p2 === '/dreame-x60/start', p2);
  H.check('Übersicht hat keinen Zurück-Knopf', !(await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); el.setConfig({ page: 'start' }); return new Promise((res) => setTimeout(() => res(!!el.shadowRoot.querySelector('.topbar .back')), 60)); })));
  H.check('keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
