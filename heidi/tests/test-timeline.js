// Prüft Phase im Kopf + Zeitleiste im Protokoll (Karte v1.4). Historie wird nachgebildet.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const js = fs.readFileSync('../../ha/www/heidi-panel.js', 'utf8'); const states = JSON.parse(fs.readFileSync('real_states.json', 'utf8'));
  await p.setContent(`<!doctype html><html><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText='height:300px;background:#1c2732;color:#9ab;display:grid;place-items:center'; d.textContent='[Karte: '+cfg.type+']'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await p.addScriptTag({ content: js });
  const r = await p.evaluate((states) => {
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
  console.log(r); await p.waitForTimeout(500);
  const head = await p.evaluate(() => { const sr = document.querySelector('heidi-panel').shadowRoot; return { big: sr.querySelector('.hero .big').textContent.trim(), sub: (sr.querySelector('.hero .sub') || {}).textContent?.trim(), btns: Array.from(sr.querySelectorAll('.hero .ctl .btn')).map(b => b.textContent.trim()), chairsInHero: !!sr.querySelector('.hero [data-toggle]'), chairsInMap: !!sr.querySelector('.tools [data-toggle]') }; });
  console.log('Kopf:', JSON.stringify(head), head.sub === 'Wischt Küche' && head.btns.join() === 'Pause,Stopp,Station' && !head.chairsInHero && head.chairsInMap ? 'ok' : 'FEHLER Kopf');
  // Zustände: pausiert → Weiter/Stopp/Station, angedockt → Start/Orten
  for (const [st, want] of [['paused', 'Weiter,Stopp,Station'], ['docked', 'Start,Orten']]) {
    const got = await p.evaluate((st) => { const el = document.querySelector('heidi-panel'); const s = { ...el._hass.states }; s['vacuum.heidi'] = { ...s['vacuum.heidi'], state: st, last_updated: st }; el.hass = { ...el._hass, states: s }; return Array.from(el.shadowRoot.querySelectorAll('.hero .ctl .btn')).map(b => b.textContent.trim()).join() + ' | ' + el.shadowRoot.querySelector('.hero .big').textContent.trim(); }, st);
    console.log(st + ':', got, got.startsWith(want) ? 'ok' : 'FEHLER');
  }
  await p.evaluate(() => { const el = document.querySelector('heidi-panel'); const s = { ...el._hass.states }; s['vacuum.heidi'] = { ...s['vacuum.heidi'], state: 'cleaning', last_updated: 'c' }; el.hass = { ...el._hass, states: s }; });
  await p.waitForTimeout(200);
  await p.locator('heidi-panel .hero').first().screenshot({ path: 'panel_hero.png' });
  const tl = await p.evaluate(() => Array.from(document.querySelector('heidi-panel').shadowRoot.querySelectorAll('.tl .tlr')).map(r => r.textContent.replace(/\s+/g, ' ').trim()));
  console.log('Zeitleiste:'); tl.forEach(x => console.log('  ' + x));
  const api = await p.evaluate(() => window._api); console.log('API-Aufrufe:', api);
  console.log(tl.length === 7 && /Wäscht Mopps vor dem Start\s*5 min/.test(tl[0]) && /läuft/.test(tl[6]) ? 'ok' : 'FEHLER Zeitleiste');
  // Protokoll-Eintrag aufklappen → zweiter API-Aufruf mit Zeitfenster des Laufs
  await p.evaluate(() => { const sr = document.querySelector('heidi-panel').shadowRoot; sr.querySelector('.hrow[data-tl]:not([data-tl=cur])').click(); });
  await p.waitForTimeout(300);
  const api2 = await p.evaluate(() => window._api); console.log(api2.length === 2 && /end_time=/.test(api2[1]) ? 'ok Klick' : 'FEHLER Klick ' + api2.length);
  const sr = await p.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('[data-key=protokoll]').scrollIntoView());
  await p.screenshot({ path: 'panel_timeline.png', fullPage: true });
  console.log('errors:', errs); await b.close();
})();
