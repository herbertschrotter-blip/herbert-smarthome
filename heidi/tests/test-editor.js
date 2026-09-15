// Planer-Editor: feste Klickfolge für Eintrag 2, danach genau die Service-Calls aus expected/editor-calls.json (18, siehe unten).
const H = require('./harness');
(async () => {
  console.log('test-editor');
  const b = await H.launch();
  const { page, errs, states } = await H.mount(b, { viewport: { width: 1200, height: 1500 }, mapStyle: 'height:300px' });
  await page.evaluate((states) => { const el = document.querySelector('heidi-panel'); el.setConfig({}); el.hass = { states, callService: async (d, s, x) => { window._calls = (window._calls || []); window._calls.push([d, s, x]); } }; }, states);
  await page.waitForTimeout(300); await page.screenshot({ path: 'main3.png' });
  const q = H.clicker(page);
  // Klickfolge (unverändert seit v1.3): Eintrag 2 öffnen, Büro abwählen, Homeoffice „Leise starten“,
  // Herbert als störend, Freitag dazu, Uhr 10 → 15 → OK, Speichern.
  const steps = [
    ['[data-edit="2"]', 200],
    ['[data-ed="room"][data-val="5"]'], ['[data-ed="set"][data-key="ho"][data-val="Leise starten"]'], ['[data-ed="person"][data-val="herbert"]'], ['[data-ed="day"][data-val="4"]'],
    ['[data-ed="clock"]', 100], ['[data-ed="clockval"][data-val="10"]', 100],
    ['[data-ed="clockval"][data-val="15"]'], ['[data-ed="clockok"]', 100],
  ];
  for (const [sel, wait] of steps) { const r = await q(sel); H.check(`Klick ${sel}`, r === 'ok', r); if (wait) await page.waitForTimeout(wait); }
  await page.screenshot({ path: 'editor3.png', fullPage: true });
  const uhr = await page.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('[data-ed="clock"]')?.textContent.trim());
  H.check('Uhr zeigt 10:15', /10:15/.test(uhr || ''), uhr);
  const s = await q('[data-act="save"]'); H.check('Klick Speichern', s === 'ok', s);
  await page.waitForTimeout(300);
  const calls = await page.evaluate(() => window._calls || []);
  if (process.argv.includes('--dump')) console.log(JSON.stringify(calls, null, 1));
  // Festgeschrieben aus v1 (Characterization, 15.09.): 5 input_text, 10 input_select, 2 input_boolean, 1 input_datetime = 18 Calls.
  // Der Bauplan nannte 16 – Widerspruch in Abschnitt 10 eingetragen, v1 ist der Maßstab.
  const want = H.expected('editor-calls.json');
  H.check(`genau ${want.length} Service-Calls`, calls.length === want.length, calls.map((c) => c[2].entity_id));
  H.checkEqual('Service-Calls wie festgeschrieben', calls, want);
  await H.finish(b, errs);
})();
