// Phase im Kopf + Zeitleiste im Protokoll (Karte v1.4). Historie wird nachgebildet (callApi).
const H = require('./harness');
const ROWS = [
  'Wäscht Mopps vor dem Start 5 min', 'Saugt und wischt Wohnzimmer 17 min', 'Fährt zum Mopp-Waschen 2 min',
  'Wäscht Mopps zwischendurch 5 min', 'Saugt und wischt Wohnzimmer 9 min', 'Wischt Küche 3 min', 'läuft … 41 min',
];
(async () => {
  console.log('test-timeline');
  const b = await H.launch();
  const { page, errs, states } = await H.mount(b, { viewport: { width: 1200, height: 1500 } });
  const r = await page.evaluate((states) => {
    // Laufender Auftrag: Phase-Sensor + nachgebildete Historie (Mopp-Wäsche → Räume → Zwischenwäsche → weiter)
    const now = Date.now(), m = (min) => new Date(now - min * 60000).toISOString();
    states['sensor.heidi_phase'] = { entity_id: 'sensor.heidi_phase', state: 'Wischt Küche', last_changed: m(3), attributes: {} };
    states['vacuum.heidi'].state = 'cleaning';
    window._api = [];
    // Historie: Phase + Roboterzustand. Vorheriger Lauf endete vor 60 min (Rückkehr → docked), danach
    // Absaugen/Trocknen in der Station (zählt nicht), neuer Start vor 41 min. Türschwellen-Flackern
    // Wohnzimmer/Küche/Wohnzimmer (20 s) wird geglättet.
    const hist = [
      [{ entity_id: 'sensor.heidi_phase', state: 'Saugt Bad', last_changed: m(90) }, { state: 'Fährt zur Station', last_changed: m(62) }, { state: 'Saugt Staub ab', last_changed: m(60) }, { state: 'Trocknet Mopps', last_changed: m(58) },
       { state: 'Wäscht Mopps vor dem Start', last_changed: m(41) }, { state: 'Saugt und wischt Wohnzimmer', last_changed: m(36) },
       { state: 'Saugt und wischt Küche', last_changed: m(30) }, { state: 'Saugt und wischt Wohnzimmer', last_changed: m(29.66) },
       { state: 'Fährt zum Mopp-Waschen', last_changed: m(19) }, { state: 'Wäscht Mopps zwischendurch', last_changed: m(17) },
       { state: 'Saugt und wischt Wohnzimmer', last_changed: m(12) }, { state: 'Wischt Küche', last_changed: m(3) }],
      // Startsequenz des Roboters: cleaning → docked → idle → cleaning innerhalb von 30 s = derselbe Lauf
      [{ entity_id: 'vacuum.heidi', state: 'cleaning', last_changed: m(90) }, { state: 'returning', last_changed: m(62) }, { state: 'docked', last_changed: m(60) },
       { state: 'cleaning', last_changed: m(41) }, { state: 'docked', last_changed: m(40.9) }, { state: 'idle', last_changed: m(40.8) }, { state: 'cleaning', last_changed: m(40.5) }],
    ];
    const el = document.querySelector('heidi-panel'); el.setConfig({});
    el.hass = { states, callService: async () => {}, callApi: async (meth, path) => { window._api.push(path); return hist; } };
    return 'ok';
  }, states);
  H.check('hass gesetzt', r === 'ok', r);
  await page.waitForTimeout(500);
  // Kopf-Tabelle: Zustand → groß / klein / Knöpfe (Bauplan Abschnitt 6, status.ts)
  const head = await page.evaluate(() => { const sr = document.querySelector('heidi-panel').shadowRoot; return { big: sr.querySelector('.hero .big').textContent.trim(), sub: (sr.querySelector('.hero .sub') || {}).textContent?.trim(), btns: Array.from(sr.querySelectorAll('.hero .ctl .btn')).map((b) => b.textContent.trim()), chairsInHero: !!sr.querySelector('.hero [data-toggle]'), chairsInMap: !!sr.querySelector('.tools [data-toggle]') }; });
  H.checkEqual('Kopf cleaning', [head.big, head.sub, head.btns.join()], ['Reinigt', 'Wischt Küche', 'Pause,Stopp,Station']);
  H.check('Stühle-Knopf auf der Karte, nicht im Kopf', !head.chairsInHero && head.chairsInMap, head);
  for (const [st, want] of [['paused', ['Pausiert', 'Weiter,Stopp,Station']], ['docked', ['Wischt Küche', 'Start,Orten']]]) {
    const got = await page.evaluate((st) => { const el = document.querySelector('heidi-panel'); const s = { ...el._hass.states }; s['vacuum.heidi'] = { ...s['vacuum.heidi'], state: st, last_updated: st }; el.hass = { ...el._hass, states: s }; return [el.shadowRoot.querySelector('.hero .big').textContent.trim(), Array.from(el.shadowRoot.querySelectorAll('.hero .ctl .btn')).map((b) => b.textContent.trim()).join()]; }, st);
    H.checkEqual(`Kopf ${st}`, got, want);
  }
  await page.evaluate(() => { const el = document.querySelector('heidi-panel'); const s = { ...el._hass.states }; s['vacuum.heidi'] = { ...s['vacuum.heidi'], state: 'cleaning', last_updated: 'c' }; el.hass = { ...el._hass, states: s }; });
  await page.waitForTimeout(200);
  await page.locator('heidi-panel .hero').first().screenshot({ path: 'panel_hero.png' });
  // Zeitleiste: 7 Zeilen; Uhrzeiten hängen von „jetzt“ ab und werden abgeschnitten
  const tl = await page.evaluate(() => Array.from(document.querySelector('heidi-panel').shadowRoot.querySelectorAll('.tl .tlr')).map((r) => Array.from(r.children).map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  const rows = tl.map((cells) => cells.slice(1).filter(Boolean).join(' '));
  H.checkEqual('Zeitleiste 7 Zeilen', rows, ROWS);
  const api = await page.evaluate(() => window._api);
  H.check('ein history-Aufruf mit Zeitfenster', api.length === 1 && /history\/period\/.*filter_entity_id=sensor\.heidi_phase,vacuum\.heidi&end_time=/.test(api[0]), api);
  // Protokoll-Sensor wird "unavailable" (wie im echten Lauf) → Protokoll bleibt mit Einträgen sichtbar
  const keep = await page.evaluate(() => { const el = document.querySelector('heidi-panel'); const s = { ...el._hass.states }; s['sensor.heidi_cleaning_history'] = { ...s['sensor.heidi_cleaning_history'], state: 'unavailable', attributes: {}, last_updated: 'u' }; el.hass = { ...el._hass, states: s }; const sr = el.shadowRoot; return { details: !!sr.querySelector('[data-key=protokoll]'), rows: sr.querySelectorAll('.hrow[data-tl]:not([data-tl=cur])').length }; });
  H.check('Protokoll bleibt bei unavailable', keep.details && keep.rows > 0, keep);
  // Protokoll-Eintrag aufklappen → zweiter API-Aufruf mit Zeitfenster des Laufs
  await page.evaluate(() => { const sr = document.querySelector('heidi-panel').shadowRoot; sr.querySelector('.hrow[data-tl]:not([data-tl=cur])').click(); });
  await page.waitForTimeout(300);
  const api2 = await page.evaluate(() => window._api);
  H.check('Klick auf Eintrag lädt genau einmal nach', api2.length === 2 && /end_time=/.test(api2[1]), api2);
  await page.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('[data-key=protokoll]').scrollIntoView());
  await page.screenshot({ path: 'panel_timeline.png', fullPage: true });
  await H.finish(b, errs);
})();
