const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const js = fs.readFileSync('../../ha/www/heidi-panel.js', 'utf8'); const states = JSON.parse(fs.readFileSync('real_states.json', 'utf8'));
  await p.setContent(`<!doctype html><html><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText='height:300px'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await p.addScriptTag({ content: js });
  await p.evaluate((states) => { const el = document.querySelector('heidi-panel'); el.setConfig({}); el.hass = { states, callService: async (d,s,x) => { window._calls=(window._calls||[]); window._calls.push([d,s,x]); } }; }, states);
  await p.waitForTimeout(300); await p.screenshot({ path: 'main3.png' });
  const q = (sel) => p.evaluate((sel) => { const el=document.querySelector('heidi-panel'); const t=el.shadowRoot.querySelector(sel); if(!t) return 'MISSING '+sel; t.click(); return 'ok'; }, sel);
  console.log(await q('[data-edit="2"]')); await p.waitForTimeout(200);
  console.log(await q('[data-ed="room"][data-val="5"]'), await q('[data-ed="set"][data-key="ho"][data-val="Leise starten"]'), await q('[data-ed="person"][data-val="herbert"]'), await q('[data-ed="day"][data-val="4"]'));
  console.log(await q('[data-ed="clock"]')); await p.waitForTimeout(100); console.log(await q('[data-ed="clockval"][data-val="10"]')); await p.waitForTimeout(100);
  await p.screenshot({ path: 'editor3.png', fullPage: true });
  console.log(await q('[data-ed="clockval"][data-val="15"]'), await q('[data-ed="clockok"]'));
  await p.waitForTimeout(100); console.log(await q('[data-act="save"]')); await p.waitForTimeout(300);
  const calls = await p.evaluate(()=>window._calls); console.log(JSON.stringify(calls.filter(c=>c[0]!=='input_select'||/plan2_(homeoffice|modus)/.test(c[2].entity_id))));
  console.log('errors:', errs); await b.close();
})();
