// Sperrzonen-Editor: Rechteck auf das Kartenbild ziehen, Speichern → vacuum_set_restricted_zone mit
// bestehender Zone + neuer Zone in mm (Umrechnung über calibration_points).
const H = require('./harness');
const WANT = { entity_id: 'vacuum.heidi', zones: [[-4200, -4775, -1150, -2075], [-1550, -188, -643, 937]], no_mops: [] };
(async () => {
  console.log('test-zones');
  const b = await H.launch();
  const { page, errs, states } = await H.mount(b, { viewport: { width: 1200, height: 1000 }, mapStyle: 'height:200px;background:#1c2732' });
  await page.evaluate((states) => { const el = document.querySelector('heidi-panel'); el.setConfig({}); window._svc = []; el.hass = { states, callService: async (d, s, x) => { window._svc.push([d + '.' + s, x]); } }; }, states);
  await page.waitForTimeout(300);
  const q = H.clicker(page);
  const open = await q('[data-act="zones"]'); H.check('Sperrzonen-Editor öffnet', open === 'ok', open);
  await page.waitForTimeout(500);
  // Geste (unverändert): Rechteck von 62 %/35 % nach 72 %/50 % des Kartenbilds
  const box = await page.evaluate(() => { const r = document.querySelector('heidi-panel').shadowRoot.querySelector('#zsvg')?.getBoundingClientRect(); return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; });
  if (H.check('Kartenbild #zsvg vorhanden', !!box)) {
    await page.mouse.move(box.x + box.w * 0.62, box.y + box.h * 0.35); await page.mouse.down();
    await page.mouse.move(box.x + box.w * 0.72, box.y + box.h * 0.5, { steps: 5 }); await page.mouse.up();
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'panel_zones.png' });
  const save = await q('[data-zact="save"]'); H.check('Klick Speichern', save === 'ok', save);
  await page.waitForTimeout(300);
  const svc = await page.evaluate(() => window._svc);
  H.check('genau ein Service-Call', svc.length === 1, svc);
  H.checkEqual('vacuum_set_restricted_zone mit beiden Zonen', svc[0], ['dreame_vacuum.vacuum_set_restricted_zone', WANT]);
  await H.finish(b, errs);
})();
