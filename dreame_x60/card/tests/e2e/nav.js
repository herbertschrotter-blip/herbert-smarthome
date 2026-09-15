// nav.js – dx-navigate aus der Karte löst history.pushState + location-changed mit /dreame-x60/<page> aus (3.3).
import * as H from './harness.js';

const b = await H.launch();
console.log('nav');
const { page, errs } = await H.mount(b, { page: 'start' });
const before = await page.evaluate(() => location.pathname);
H.check('Startpfad /dreame-x60/start', before === '/dreame-x60/start', before);

for (const target of ['planer', 'protokoll', 'einstellungen']) {
  const r = await page.evaluate((pg) => new Promise((resolve) => {
    const el = document.querySelector('dreame-x60-panel');
    const onChange = (e) => { window.removeEventListener('location-changed', onChange); resolve({ path: location.pathname, detail: e.detail, len: history.length }); };
    window.addEventListener('location-changed', onChange);
    el.dispatchEvent(new CustomEvent('dx-navigate', { detail: { page: pg }, bubbles: true, composed: true }));
    setTimeout(() => resolve({ path: location.pathname, detail: null, timeout: true }), 500);
  }), target);
  H.check(`dx-navigate ${target} → location-changed`, !r.timeout, r);
  H.check(`Pfad /dreame-x60/${target}`, r.path === `/dreame-x60/${target}`, r.path);
}
// unbekannte Seite → start
const r = await page.evaluate(() => { document.querySelector('dreame-x60-panel').dispatchEvent(new CustomEvent('dx-navigate', { detail: { page: 'nix' }, bubbles: true, composed: true })); return location.pathname; });
H.check('unbekannte Seite navigiert zu start', r === '/dreame-x60/start', r);
H.check('keine Seiten-/Konsolenfehler', errs.length === 0, errs);
await page.close();
await b.close();
H.summary();
