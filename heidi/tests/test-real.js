const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1200, height: 1400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const js = fs.readFileSync('../../ha/www/heidi-panel.js', 'utf8'); const states = JSON.parse(fs.readFileSync('real_states.json', 'utf8'));
  await p.setContent(`<!doctype html><html><body style="margin:0"><script>
    class HaIcon extends HTMLElement { connectedCallback(){ this.innerHTML='<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.6"></span>'; } }
    customElements.define('ha-icon', HaIcon);
    window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d=document.createElement('div'); d.style.cssText='height:300px;background:#1c2732;color:#9ab;display:grid;place-items:center'; d.textContent='[Karte: '+cfg.type+']'; return d; } });
  </script><heidi-panel></heidi-panel></body></html>`);
  await p.addScriptTag({ content: js });
  const r = await p.evaluate((states) => { try { const el = document.querySelector('heidi-panel'); el.setConfig({}); el.hass = { states, callService: async () => {} }; return 'ok'; } catch (e) { return 'THROW: ' + e.stack; } }, states);
  console.log(r); await p.waitForTimeout(400); await p.screenshot({ path: 'panel_real.png' });
  console.log('errors:', errs); await b.close();
})();
