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
    const hist = [[
      { state: 'Schläft', last_changed: m(480) }, { state: 'Wäscht Mopps vor dem Start', last_changed: m(41) },
      { state: 'Saugt und wischt Wohnzimmer', last_changed: m(36) }, { state: 'Saugt und wischt Wohnzimmer', last_changed: m(30) },
      { state: 'Fährt zum Mopp-Waschen', last_changed: m(19) }, { state: 'Wäscht Mopps zwischendurch', last_changed: m(17) },
      { state: 'Saugt und wischt Wohnzimmer', last_changed: m(12) }, { state: 'Wischt Küche', last_changed: m(3) },
    ]];
    const el = document.querySelector('heidi-panel'); el.setConfig({});
    el.hass = { states, callService: async () => {}, callApi: async (meth, path) => { window._api.push(path); return hist; } };
    return 'ok';
  }, states);
  console.log(r); await p.waitForTimeout(500);
  const head = await p.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('.hero .big').textContent.trim());
  console.log('Kopf:', head, head === 'Wischt Küche' ? 'ok' : 'FEHLER');
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
