const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); else if (m.text().startsWith('svc')) errs.push(m.text()); });
  const js = fs.readFileSync('../../ha/www/heidi-panel.js', 'utf8'); const states = JSON.parse(fs.readFileSync('real_states.json', 'utf8'));
  await p.setContent(`<!doctype html><html><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText='height:200px;background:#1c2732'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await p.addScriptTag({ content: js });
  await p.evaluate((states) => { const el = document.querySelector('heidi-panel'); el.setConfig({}); el.hass = { states, callService: async (d,s,x) => console.log('svc ' + d + '.' + s + ' ' + JSON.stringify(x)) }; }, states);
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('[data-act="zones"]').click());
  await p.waitForTimeout(500);
  // Rechteck zeichnen: Pixel im svg
  const box = await p.evaluate(() => { const r = document.querySelector('heidi-panel').shadowRoot.querySelector('#zsvg').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await p.mouse.move(box.x + box.w * 0.62, box.y + box.h * 0.35); await p.mouse.down(); await p.mouse.move(box.x + box.w * 0.72, box.y + box.h * 0.5, { steps: 5 }); await p.mouse.up();
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'panel_zones.png' });
  await p.evaluate(() => document.querySelector('heidi-panel').shadowRoot.querySelector('[data-zact="save"]').click());
  await p.waitForTimeout(300);
  console.log(errs.join('\n')); await b.close();
})();
