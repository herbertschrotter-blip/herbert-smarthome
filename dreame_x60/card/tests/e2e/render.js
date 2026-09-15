// render.js – jede der sechs Seiten rendert mit states-docked.json ohne Konsolenfehler; Versionszeile vorhanden (1.2).
import * as H from './harness.js';

const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen'];
const b = await H.launch();
console.log('render');
for (const pg of PAGES) {
  const { page, errs } = await H.mount(b, { page: pg });
  const version = await H.shadowText(page, '.version');
  const data = await H.shadowText(page, '.page');
  H.check(`${pg}: Versionszeile "dreame_x60 v${H.VERSION}"`, version === `dreame_x60 v${H.VERSION}`, version);
  H.check(`${pg}: Seite markiert`, await page.evaluate((p) => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector(`.page[data-page="${p}"]`), pg));
  H.check(`${pg}: Zustandsdaten angebunden`, /\d+ Entitäten verbunden/.test(data || ''), data && data.slice(0, 120));
  H.check(`${pg}: keine Seiten-/Konsolenfehler`, errs.length === 0, errs);
  if (pg === 'start') await H.screenshot(page, 'render-start.png');
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
