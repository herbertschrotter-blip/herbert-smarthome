// dialog.js – dx-dialog (4.2): Varianten modal/sheet/confirm, Ereignisse dx-close/dx-confirm/dx-back, Escape, Fokus im Dialog,
// Tab-Falle, Fokus-Rückgabe, Sheet unter 640 px, wide. Der Baustein wird direkt in die Testseite gesetzt (ohne Shell),
// zusätzlich einmal über die Shell (Overlay → Bestätigung → dx-confirm).
import * as H from './harness.js';

const b = await H.launch();
console.log('dialog');

/** dx-dialog mit Attributen und Inhalt in den Body setzen; Ereignisse werden in window._ev gezählt. */
async function open(page, attrs, inner = '') {
  await page.evaluate(({ attrs, inner }) => {
    document.querySelectorAll('dx-dialog').forEach((d) => d.remove());
    window._ev = { close: 0, confirm: 0, back: 0 };
    const d = document.createElement('dx-dialog');
    for (const [k, v] of Object.entries(attrs)) { if (v === true) d.setAttribute(k, ''); else if (v !== false) d.setAttribute(k, String(v)); }
    d.innerHTML = inner;
    for (const n of ['dx-close', 'dx-confirm', 'dx-back']) d.addEventListener(n, () => { window._ev[n.slice(3)]++; });
    document.body.appendChild(d);
  }, { attrs, inner });
  await page.waitForTimeout(80);
}
const ev = (page) => page.evaluate(() => window._ev);
const active = (page) => page.evaluate(() => { let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return a ? (a.id || a.className || a.tagName) : null; });
const rect = (page, sel) => page.evaluate((s) => { const e = document.querySelector('dx-dialog').shadowRoot.querySelector(s); const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, innerH: window.innerHeight, innerW: window.innerWidth }; }, sel);

// ── modal bei 1200 px ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 1200, height: 900 } });
  await page.evaluate(() => { const bt = document.createElement('button'); bt.id = 'opener'; bt.textContent = 'öffnen'; document.body.appendChild(bt); bt.focus(); });
  await open(page, { heading: 'Eintrag 2', sub: 'Tägliches Saugen' }, '<input id="name" value="x"><button id="b1" slot="foot">Speichern</button>');
  H.checkEqual('modal: Titel und Untertitel', await page.evaluate(() => { const r = document.querySelector('dx-dialog').shadowRoot; return [r.querySelector('h2 .t').textContent, r.querySelector('h2 .m').textContent]; }), ['Eintrag 2', 'Tägliches Saugen']);
  H.checkEqual('Fokus liegt nach dem Öffnen im Dialog (erstes Eingabefeld)', await active(page), 'name');
  const r = await rect(page, '.dlg');
  H.check('modal: mittig, 640 px breit', Math.abs(r.width - 640) < 2 && r.top > 50 && r.bottom < r.innerH - 50, r);
  H.check('Fuß mit eingeschobenem Knopf sichtbar', await page.evaluate(() => !document.querySelector('dx-dialog').shadowRoot.querySelector('.foot').classList.contains('empty')));
  // Tab-Falle: name → Speichern → ✕ → name
  await page.keyboard.press('Tab'); H.checkEqual('Tab → Speichern (Fuß)', await active(page), 'b1');
  await page.keyboard.press('Tab'); H.checkEqual('Tab → Schließen-Knopf (Kopfzeile)', await active(page), 'iconbtn close');
  await page.keyboard.press('Tab'); H.checkEqual('Tab → zurück zum Eingabefeld (Falle)', await active(page), 'name');
  await page.keyboard.press('Shift+Tab'); H.checkEqual('Shift+Tab → Schließen-Knopf', await active(page), 'iconbtn close');
  // Escape → dx-close (Dialog bleibt bis der Besitzer ihn entfernt)
  await page.keyboard.press('Escape'); await page.waitForTimeout(40);
  H.checkEqual('Escape → dx-close', (await ev(page)).close, 1);
  await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('.scrim').click()); await page.waitForTimeout(40);
  H.checkEqual('Scrim → dx-close', (await ev(page)).close, 2);
  await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('h2 .close').click()); await page.waitForTimeout(40);
  H.checkEqual('✕ → dx-close', (await ev(page)).close, 3);
  await page.evaluate(() => document.querySelector('dx-dialog').remove()); await page.waitForTimeout(40);
  H.checkEqual('Fokus kehrt nach dem Schließen zum Öffner zurück', await active(page), 'opener');
  // back + wide
  await open(page, { heading: 'Räume', back: true, wide: true }, '<p>x</p>');
  await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('h2 .backbtn').click()); await page.waitForTimeout(40);
  H.checkEqual('Zurück-Pfeil → dx-back', (await ev(page)).back, 1);
  H.check('wide: 900 px breit', Math.abs((await rect(page, '.dlg')).width - 900) < 2);
  H.check('Fuß ohne Inhalt ausgeblendet', await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('.foot').classList.contains('empty')));
  // sheet erzwungen bei breiter Ansicht
  await open(page, { heading: 'Sheet', variant: 'sheet' }, '<p>x</p>');
  const s = await rect(page, '.dlg');
  H.check('variant=sheet: unten angeschlagen, volle Breite', Math.abs(s.bottom - s.innerH) < 2 && s.left === 0 && Math.abs(s.width - s.innerW) < 2, s);
  // confirm
  await open(page, { variant: 'confirm', text: 'Wirklich löschen?', 'sub-text': 'Kann nicht rückgängig gemacht werden', 'ok-label': 'Löschen', danger: true });
  H.checkEqual('confirm: Text, Untertext, Knopfbeschriftungen', await page.evaluate(() => { const r = document.querySelector('dx-dialog').shadowRoot; const m = r.querySelector('.alert .m'), sm = r.querySelector('.alert small'); return [m.textContent.replace(sm.textContent, '').trim(), sm.textContent, ...[...r.querySelectorAll('.alert .b button')].map((x) => x.textContent + (x.classList.contains('danger') ? '!' : ''))]; }), ['Wirklich löschen?', 'Kann nicht rückgängig gemacht werden', 'Abbrechen', 'Löschen!']);
  H.checkEqual('confirm: Fokus auf Abbrechen (nicht auf dem gefährlichen Knopf)', await active(page), 'cancel');
  await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('.alert .ok').click()); await page.waitForTimeout(40);
  H.checkEqual('OK → dx-confirm', (await ev(page)).confirm, 1);
  await page.evaluate(() => document.querySelector('dx-dialog').shadowRoot.querySelector('.alert .cancel').click()); await page.waitForTimeout(40);
  H.checkEqual('Abbrechen → dx-close', (await ev(page)).close, 1);
  H.check('1200: keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── 390 px: modal wird automatisch zum Sheet, Bestätigung unten ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 390, height: 844 } });
  await open(page, { heading: 'Eintrag' }, '<p>x</p>');
  const s = await rect(page, '.dlg');
  H.check('390: modal als Sheet unten, volle Breite', Math.abs(s.bottom - s.innerH) < 2 && Math.abs(s.width - 390) < 2, s);
  await open(page, { variant: 'confirm', text: 'Starten?' });
  const a = await rect(page, '.alert');
  H.check('390: Bestätigung unten (16 px Rand)', Math.abs(a.bottom - (a.innerH - 16)) < 2 && a.left === 16, a);
  await H.screenshot(page, 'dialog-390.png');
  H.check('390: keine Fehler', errs.length === 0, errs);
  await page.close();
}

// ── über die Shell: askConfirm-Overlay → OK → onOk, Escape schließt ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 1200, height: 900 } });
  await page.evaluate(() => { window._ok = 0; document.querySelector('dreame-x60-panel').openOverlay({ kind: 'confirm', text: 'Jetzt starten?', onOk: () => { window._ok++; } }); });
  await page.waitForTimeout(80);
  H.check('Shell: Bestätigung als dx-dialog', await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind="confirm"]')));
  await page.keyboard.press('Enter'); await page.waitForTimeout(40); // Fokus liegt auf Abbrechen → schließt
  H.check('Shell: Enter auf Abbrechen schließt ohne onOk', (await page.evaluate(() => window._ok)) === 0 && !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'))));
  await page.evaluate(() => { document.querySelector('dreame-x60-panel').openOverlay({ kind: 'confirm', text: 'Jetzt starten?', onOk: () => { window._ok++; } }); });
  await page.waitForTimeout(80);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog').shadowRoot.querySelector('.alert .ok').click()); await page.waitForTimeout(40);
  H.check('Shell: OK → onOk, Overlay zu', (await page.evaluate(() => window._ok)) === 1 && !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'))));
  await page.evaluate(() => { document.querySelector('dreame-x60-panel').openOverlay({ kind: 'rooms', mode: 'plan', n: 2, back: { kind: 'editor', n: 2 } }); });
  await page.waitForTimeout(80);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog').shadowRoot.querySelector('h2 .backbtn').click()); await page.waitForTimeout(60);
  H.check('Shell: Zurück-Pfeil im Räume-Dialog → Eintrag', await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind="editor"]')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(60);
  H.check('Shell: Escape schließt', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'))));
  H.check('Shell: keine Fehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
