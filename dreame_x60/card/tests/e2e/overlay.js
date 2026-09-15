// overlay.js – Overlay öffnen/schließen (Platzhalter), Bestätigung, Escape, Zurück, Toast, light-Klasse (3.3).
import * as H from './harness.js';

const b = await H.launch();
console.log('overlay');
const { page, errs } = await H.mount(b, { page: 'start' });
const sr = (fn, arg) => page.evaluate(fn, arg);
const has = (sel) => sr((s) => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector(s), sel);
const fire = (name, detail) => sr(({ name, detail }) => { document.querySelector('dreame-x60-panel').dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }, { name, detail });
const tick = () => page.waitForTimeout(60);

H.check('anfangs kein Overlay', !(await has('.overlay')));
await fire('dx-open-overlay', { kind: 'settings' }); await tick();
H.check('settings-Overlay offen', await has('.overlay[data-kind="settings"]'));
await fire('dx-close'); await tick();
H.check('dx-close schließt', !(await has('.overlay')));

await fire('dx-open-overlay', { kind: 'editor', n: 2 }); await tick();
await page.keyboard.press('Escape'); await tick();
H.check('Escape schließt', !(await has('.overlay')));

// Zurück: rooms mit back → editor
await sr(() => { const el = document.querySelector('dreame-x60-panel'); el.openOverlay({ kind: 'rooms', mode: 'plan', n: 2, back: { kind: 'editor', n: 2 } }); }); await tick();
H.check('rooms offen', await has('.overlay[data-kind="rooms"]'));
await fire('dx-back'); await tick();
H.check('dx-back → editor', await has('.overlay[data-kind="editor"]'));
await fire('dx-back'); await tick();
H.check('dx-back ohne back → zu', !(await has('.overlay')));

// Bestätigung: OK ruft onOk, Abbrechen nicht
await sr(() => { window._ok = 0; const el = document.querySelector('dreame-x60-panel'); el.openOverlay({ kind: 'confirm', text: 'Wirklich?', onOk: () => { window._ok++; } }); }); await tick();
const txt = await H.shadowText(page, '.alert .m');
H.check('Bestätigungstext sichtbar', txt === 'Wirklich?', txt);
await sr(() => { const bs = document.querySelector('dreame-x60-panel').shadowRoot.querySelectorAll('.alert .b button'); bs[0].click(); }); await tick();
H.check('Abbrechen: onOk nicht gerufen, Overlay zu', (await sr(() => window._ok)) === 0 && !(await has('.overlay')));
await sr(() => { const el = document.querySelector('dreame-x60-panel'); el.openOverlay({ kind: 'confirm', text: 'Wirklich?', onOk: () => { window._ok++; } }); }); await tick();
await sr(() => { const bs = document.querySelector('dreame-x60-panel').shadowRoot.querySelectorAll('.alert .b button'); bs[1].click(); }); await tick();
H.check('OK: onOk gerufen, Overlay zu', (await sr(() => window._ok)) === 1 && !(await has('.overlay')));

// Toast
await fire('dx-toast', 'Gespeichert'); await tick();
const toast = await H.shadowText(page, '.toast');
H.check('Toast sichtbar', toast === 'Gespeichert', toast);
await page.waitForTimeout(2100);
H.check('Toast verschwindet nach ~1,9 s', !(await has('.toast')));

// light-Klasse folgt input_boolean.heidi_dark_mode
const light = await sr(() => {
  const el = document.querySelector('dreame-x60-panel'); const s = { ...el.hass.states };
  s['input_boolean.heidi_dark_mode'] = { ...s['input_boolean.heidi_dark_mode'], state: 'off', last_updated: 'x' };
  el.hass = { ...el.hass, states: s }; return new Promise((r) => setTimeout(() => r(el.classList.contains('light')), 60));
});
H.check('dark_mode aus → Klasse light', light === true, light);
H.check('keine Seiten-/Konsolenfehler', errs.length === 0, errs);
await page.close();
await b.close();
H.summary();
