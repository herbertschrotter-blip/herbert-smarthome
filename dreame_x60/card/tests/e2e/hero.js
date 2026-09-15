// hero.js – dx-hero (4.1): Kopf-Tabelle aus 0.1 (status.v1.json, 85 Zustände) gegen das gerenderte Panel, Streifen-Fälle,
// Knöpfe → vacuum.*-Calls, more-info, Räume-Overlay, Render-Ruhe bei irrelevanten Ticks; dx-auftrag im Lauf.
import fs from 'node:fs';
import path from 'node:path';
import * as H from './harness.js';

const v1 = JSON.parse(fs.readFileSync(path.join(H.FIXTURES, 'status.v1.json'), 'utf8'));
const b = await H.launch();
console.log('hero');
const { page, errs, states: docked } = await H.mount(b, { page: 'start', viewport: { width: 1400, height: 1400 } });

/** Zustände wie das v1-Werkzeug: Fixture + Overrides. */
const statesFor = (v) => {
  const s = { ...docked };
  for (const [id, o] of Object.entries(v.input.overrides ?? {})) {
    const cur = s[id] ?? { entity_id: id, state: 'unknown', attributes: {} };
    s[id] = { ...cur, state: o.state ?? cur.state, attributes: { ...cur.attributes, ...(o.attributes ?? {}) } };
  }
  return s;
};
const setStates = async (s) => { await page.evaluate((st) => { const el = document.querySelector('dreame-x60-panel'); el.hass = { ...el.hass, states: st }; }, s); await page.waitForTimeout(40); };
const readHero = () => page.evaluate(() => {
  const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot;
  const t = (sel) => { const e = h.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
  return {
    big: t('.bigtext'), sub: t('.sub'), btns: [...h.querySelectorAll('.ctl .btn')].map((x) => x.textContent.trim()),
    chips: [...h.querySelectorAll('.chips .chip')].map((c) => ({ text: c.textContent.replace(/\s+/g, ' ').trim(), on: c.classList.contains('on') })),
    strip: t('.strip'), params: [...h.querySelectorAll('.param b')].map((x) => x.textContent.trim()),
  };
});
const norm = (s) => (s === null ? null : s.replace(/ · /g, ' ').replace(/\s+/g, ' ').trim());

// ── Kopf-Tabelle: alle v1-Vektoren ──
let bad = 0;
for (const v of v1.vektoren) {
  await setStates(statesFor(v));
  const got = await readHero();
  const want = { big: v.output.big, sub: v.output.sub, btns: v.output.btns, chips: v.output.chips.map((c) => ({ text: c.text, on: /\bon\b/.test(c.cls) })), strip: v.output.strip };
  const ok = got.big === want.big && got.sub === want.sub && JSON.stringify(got.btns) === JSON.stringify(want.btns)
    && JSON.stringify(got.chips) === JSON.stringify(want.chips) && norm(got.strip) === norm(want.strip);
  if (!ok) { bad++; H.check(`Kopf: ${v.name}`, false, { erwartet: want, bekommen: got }); }
}
H.check(`Kopf-Tabelle: ${v1.vektoren.length} v1-Zustände identisch (big, sub, Knöpfe, Chips, Streifen)`, bad === 0, `${bad} Abweichungen`);

// ── Streifen-Fall im Detail: Werte des aktuellen Raums in den drei Feldern, Auftrag-Kachel ──
const jetzt = v1.vektoren.find((v) => /Streifen · Jetzt/.test(v.name));
{
  // wie der v1-Vektor, zusätzlich Raum 5 (nächster Raum) mit Modus „Saugen“, damit die Auftrag-Kachel einen Modus-Tag zeigt
  const s = statesFor(jetzt);
  s['select.heidi_room_5_cleaning_mode'] = { ...s['select.heidi_room_5_cleaning_mode'], state: 'sweeping' };
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, docked: false } }; // Abzug „angedockt“ hat docked=true; unterwegs ist es false
  await setStates(s);
  const got = await readHero();
  H.checkEqual('im Lauf: Modus/Saug/Wasser des aktuellen Raums', got.params, ['Saugen + Wischen', 'Turbo', 'Mittel']);
  const a = await page.evaluate(() => {
    const el = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag');
    const sr = el && el.shadowRoot; const t = (sel) => { const e = sr.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return el ? { slot: el.dataset.slot, route: t('.route'), meter: t('.meter .p'), next: t('.row.next .t'), tag: t('.row.next .tag'), status: t('.st.pill') } : null;
  });
  H.check('dx-auftrag im Lauf vorhanden', !!a && a.slot === 'auftrag', a);
  H.checkEqual('Auftrag: Route in Laufreihenfolge', a && a.route, 'Wohnz. → Küche → Büro');
  H.checkEqual('Auftrag: Räume 1 / 3, nächster Raum Büro mit Modus', a && [a.meter, a.next, a.tag], ['1 / 3', 'Büro', 'Saugen']);
  H.checkEqual('Auftrag: Status-Pille = Kopftext', a && a.status, got.big);
}

// ── Startpunkt-Fall (Fläche 0): Auftrag zeigt 0 / n und den ersten Raum als Ziel ──
{
  const s = statesFor(v1.vektoren.find((v) => /Streifen · Fährt zum Startpunkt/.test(v.name)));
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, docked: false } };
  await setStates(s);
  const a = await page.evaluate(() => {
    const sr = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag').shadowRoot;
    const t = (sel) => { const e = sr.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return [t('.meter .p'), t('.row.next .s'), t('.row.next .t'), !!sr.querySelector('.route b')];
  });
  H.checkEqual('Auftrag am Startpunkt: 0 / 3, „Erster Raum“ Wohnz., kein Raum hervorgehoben', a, ['0 / 3', 'Erster Raum', 'Wohnz.', false]);
}

// ── In der Station nach dem Lauf (Hauptzustand noch cleaning, docked + washing + charging): Stationszeile und Titel ──
{
  const s = { ...docked };
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], state: 'cleaning', attributes: { ...s['vacuum.heidi'].attributes, docked: true, charging: true, washing: true, drying: false, current_segment: 0, active_segments: [], cleaned_area: 1 } };
  s['sensor.heidi_phase'] = { ...s['sensor.heidi_phase'], state: 'Wäscht Mopps nach dem Lauf' };
  await setStates(s);
  const st = await page.evaluate(() => { const root = document.querySelector('dreame-x60-panel').shadowRoot; return [root.querySelector('dx-hero').shadowRoot.querySelector('.station div:last-child').textContent.trim(), root.querySelector('.topbar h1').textContent.trim(), !!root.querySelector('dx-auftrag')]; });
  H.checkEqual('Mopp-Wäsche in der Station: „wäscht Mopps · lädt“, Titel „Heidi ist in der Station“, keine Auftrag-Kachel', st, ['wäscht Mopps · lädt', 'Heidi ist in der Station', false]);
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, washing: false, drying: true } };
  await setStates(s);
  H.checkEqual('Trocknen: „trocknet · lädt“', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.station div:last-child').textContent.trim()), 'trocknet · lädt');
}

// ── Leerlauf: gemeinsame Werte („–“ bei unavailable), kein Streifen, kein Auftrag ──
await setStates(docked);
{
  const got = await readHero();
  H.checkEqual('Leerlauf (Raum-Selects unavailable): drei Felder „–“', got.params, ['–', '–', '–']);
  H.check('Leerlauf: kein Streifen', got.strip === null, got.strip);
  H.check('Leerlauf: kein dx-auftrag', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag'))));
}

// ── Knöpfe → vacuum.*-Calls; Räume-Overlay; more-info ──
{
  await page.evaluate(() => { window._calls.length = 0; });
  const svcs = await page.evaluate(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelectorAll('.ctl .btn')].map((b) => b.dataset.svc));
  for (const svc of svcs) await page.evaluate((s) => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector(`.ctl .btn[data-svc="${s}"]`).click(), svc);
  await page.waitForTimeout(40);
  const calls = await page.evaluate(() => window._calls);
  H.checkEqual('Knöpfe im Leerlauf (docked) → vacuum.start, vacuum.locate mit vacuum.heidi', calls, svcs.map((s) => ['vacuum', s, { entity_id: 'vacuum.heidi' }]));
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.param').click());
  await page.waitForTimeout(40);
  H.check('Wert antippen → Overlay rooms (Roboter)', await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); return !!el.shadowRoot.querySelector('.overlay[data-kind="rooms"]') && el.overlay.mode === 'robot'; }));
  await page.evaluate(() => document.querySelector('dreame-x60-panel').closeOverlay());
  const more = await page.evaluate(() => new Promise((resolve) => {
    document.addEventListener('hass-more-info', (e) => resolve(e.detail.entityId), { once: true });
    document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.chips .chip').click();
    setTimeout(() => resolve(null), 300);
  }));
  H.checkEqual('Personen-Chip → hass-more-info mit person-Entität', more, 'person.herbert_schrotter');
}

// ── Render-Ruhe: 20 irrelevante Ticks → 0 Renderaufrufe; relevanter Tick → 1 ──
{
  await page.evaluate(() => {
    const C = customElements.get('dx-hero'); const orig = C.prototype.render; window._heroRenders = 0;
    C.prototype.render = function () { window._heroRenders++; return orig.call(this); };
  });
  const irrelevant = Object.keys(docked).find((id) => !id.includes('heidi') && !id.startsWith('person.')) || 'sun.sun';
  for (let i = 0; i < 20; i++) {
    await page.evaluate(({ id, i }) => {
      const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; const cur = s[id] ?? { entity_id: id, state: '0', attributes: {} };
      el.hass = { ...el.hass, states: { ...s, [id]: { ...cur, state: String(i), last_updated: new Date(Date.now() + i).toISOString() } } };
    }, { id: irrelevant, i });
  }
  await page.waitForTimeout(60);
  const quiet = await page.evaluate(() => window._heroRenders);
  H.check(`20 irrelevante Ticks (${irrelevant}) → 0 Renderaufrufe von dx-hero`, quiet === 0, quiet);
  await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; el.hass = { ...el.hass, states: { ...s, 'sensor.heidi_battery_level': { ...s['sensor.heidi_battery_level'], state: '42' } } }; });
  await page.waitForTimeout(60);
  const after = await page.evaluate(() => window._heroRenders);
  H.check('Akkuwert ändert sich → genau 1 Renderaufruf', after === 1, after);
  H.checkEqual('Akku 42 % sichtbar', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.kv .v').textContent.replace(/\s+/g, ' ').trim()), '42 %');
}

H.check('keine Seiten-/Konsolenfehler', errs.length === 0, errs);
await H.screenshot(page, 'hero-idle.png');
await page.close();
await b.close();
H.summary();
