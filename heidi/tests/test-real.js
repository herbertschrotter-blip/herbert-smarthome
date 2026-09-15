// Karte mit echtem Zustandsabzug rendern: keine Exception, keine Konsolenfehler. Screenshot panel_real.png.
const H = require('./harness');
(async () => {
  console.log('test-real');
  const b = await H.launch();
  const { page, errs, states } = await H.mount(b);
  const r = await page.evaluate((states) => {
    try { const el = document.querySelector('heidi-panel'); el.setConfig({}); el.hass = { states, callService: async () => {} }; return 'ok'; }
    catch (e) { return 'THROW: ' + e.stack; }
  }, states);
  H.check('setConfig + hass ohne Exception', r === 'ok', r);
  await page.waitForTimeout(400);
  const parts = await page.evaluate(() => { const sr = document.querySelector('heidi-panel').shadowRoot; return { hero: !!sr.querySelector('.hero'), planer: sr.querySelectorAll('[data-edit]').length }; });
  H.check('Kopf gerendert', parts.hero, parts);
  H.check('Planer mit 4 Einträgen', parts.planer === 4, parts);
  await page.screenshot({ path: 'panel_real.png' });
  await H.finish(b, errs);
})();
