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
  delete s['camera.heidi_map']; // Parität: v1 kennt keinen Rückfall auf Kartendaten (PD-010 wird unten mit states-driving.json geprüft)
  // Parität: v1 kennt keine „wirksamen Werte“ (PD-019, HT-0006 – unten eigens geprüft); die Fixture wurde mit ausgeschalteter
  // „Angepasster Reinigung“ aufgenommen, für den v1-Vergleich gilt sie als an
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, customized_cleaning: true } };
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
  // PD-009: Personen- und Nicht-stören-Chips sind nicht mehr im Panel (Kopfzeile / Kachel „Heute“) – aus der v1-Vorgabe herausfiltern
  const PERSONS = ['Herbert', 'Nicole', 'Nina'];
  const want = { big: v.output.big, sub: v.output.sub, btns: v.output.btns, chips: v.output.chips.filter((c) => !PERSONS.includes(c.text) && !/^\d\d:\d\d–/.test(c.text) && !/^–/.test(c.text)).map((c) => ({ text: c.text.replace('Mopps', 'Mopp') /* PD-008 */, on: /\bon\b/.test(c.cls) })), strip: v.output.strip };
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
  s['sensor.heidi_phase'] = { ...s['sensor.heidi_phase'], state: 'Wäscht Mopp nach dem Lauf' };
  await setStates(s);
  const st = await page.evaluate(() => { const root = document.querySelector('dreame-x60-panel').shadowRoot; const h = root.querySelector('dx-hero').shadowRoot; return [h.querySelector('.station div:last-child').textContent.trim(), root.querySelector('.topbar h1').textContent.trim(), !!root.querySelector('dx-auftrag'), !!h.querySelector('.batt .bolt')]; });
  H.checkEqual('Mopp-Wäsche in der Station: „Mopp-Wäsche · lädt“, Titel „Heidi ist in der Station“, keine Auftrag-Kachel, Blitz am Akku', st, ['Mopp-Wäsche · lädt', 'Heidi ist in der Station', false, true]);
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, washing: false, drying: true } };
  await setStates(s);
  H.checkEqual('Trocknen: „trocknet · lädt“', await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.station div:last-child').textContent.trim()), 'trocknet · lädt');
}

// ── Echter App-Lauf (states-driving.json, 15.09. 09:59, Küche+Flur, Saugen/Standard/1×): Modus-Select unavailable →
//    Werte aus den Kartendaten (PD-010): drei Felder, Streifen, Auftrag ──
{
  await setStates(H.loadFixture('states-driving.json'));
  const got = await readHero();
  H.checkEqual('App-Lauf: Werte des aktuellen Raums aus den Kartendaten', got.params, ['Saugen', 'Standard', '–']);
  H.checkEqual('App-Lauf: Streifen „Jetzt: Küche danach Flur“ mit Chips', norm(got.strip), 'Jetzt: Küche danach Flur SaugenStandard1×');
  const a = await page.evaluate(() => {
    const sr = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag').shadowRoot;
    const t = (sel) => { const e = sr.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return [t('.route'), t('.meter .p'), t('.row.next .t'), t('.row.next .tag')];
  });
  H.checkEqual('App-Lauf: Auftrag Küche → Flur, 0 / 2, nächster Raum Flur (Saugen)', a, ['Küche → Flur', '0 / 2', 'Flur', 'Saugen']);
}

// ── HT-0006 / PD-019: App-Lauf mit ausgeschalteter „Angepasster Reinigung“ (18.09. 22:02) → die Knöpfe zeigen die allgemeinen
//    Werte des Roboters (Leise), nicht die des Raums (Standard); Hinweis „Allgemeine Werte“; Bericht ans Protokoll ebenso ──
{
  const s = H.loadFixture('states-driving.json');
  const hint = () => page.evaluate(() => { const e = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('[data-global]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  H.checkEqual('Angepasste Reinigung an: kein Hinweis „Allgemeine Werte“', await hint(), null);
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, customized_cleaning: false } };
  for (const [id, state] of [['select.heidi_cleaning_mode', 'sweeping'], ['select.heidi_suction_level', 'quiet'], ['select.heidi_cleaning_route', 'standard']]) s[id] = { ...(s[id] ?? { entity_id: id, attributes: {} }), state };
  await setStates(s);
  const got = await readHero();
  H.checkEqual('Angepasste Reinigung aus: Knöpfe zeigen die allgemeinen Werte (Leise statt Standard)', got.params, ['Saugen', 'Leise', '–']);
  H.checkEqual('… Streifen-Chips ebenso', norm(got.strip), 'Jetzt: Küche danach Flur SaugenLeise1×');
  H.checkEqual('… Hinweis „Allgemeine Werte“', await hint(), 'Allgemeine Werte');
  const snap = await page.evaluate(() => document.querySelector('dreame-x60-panel').snapshot());
  H.checkEqual('… Bericht ans Protokoll: saug_ha quiet', [snap.modus_ha, snap.saug_ha], ['sweeping', 'quiet']);
}

// ── PD-016: Balken der Auftrag-Kachel = Prozent vom Roboter (sensor.heidi_cleaning_progress), sonst Raumzählung ──
{
  const s = statesFor(jetzt);
  s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, docked: false } };
  s['sensor.heidi_cleaning_progress'] = { ...(s['sensor.heidi_cleaning_progress'] ?? { entity_id: 'sensor.heidi_cleaning_progress', attributes: {} }), state: '37' };
  await setStates(s);
  const bar = () => page.evaluate(() => { const b = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag').shadowRoot.querySelector('.bar'); return b ? [b.dataset.pct, b.dataset.src, b.style.getPropertyValue('--p')] : null; });
  H.checkEqual('Fortschritt 37 % vom Roboter → Balken 37 (Quelle robot)', await bar(), ['37', 'robot', '37']);
  s['sensor.heidi_cleaning_progress'] = { ...s['sensor.heidi_cleaning_progress'], state: 'unavailable' };
  await setStates(s);
  H.checkEqual('Sensor unavailable → Balken aus der Raumzählung 1 / 3 = 33', await bar(), ['33', 'rooms', '33']);
}

// ── PD-020: Ortung (sensor.heidi_relocation_status) – „Sucht Position …“ als Arbeitsschritt, gelber Hinweis bei failed ──
{
  const s = statesFor(jetzt);
  const rel = (state) => { s['sensor.heidi_relocation_status'] = { ...(s['sensor.heidi_relocation_status'] ?? { entity_id: 'sensor.heidi_relocation_status', attributes: {} }), state }; return setStates(s); };
  const view = () => page.evaluate(() => { const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot; const c = h.querySelector('.chip.msg'); return [h.querySelector('.hint.sub')?.textContent.trim() ?? '', c ? c.textContent.replace(/\s+/g, ' ').trim() : null, c ? c.dataset.chip : null, !!h.querySelector('[data-ack]')]; });
  await rel('located');
  const vorher = await view();
  H.check('Ortung located: Arbeitsschritt wie bisher, kein Hinweis', vorher[0] !== 'Sucht Position …' && vorher[1] === null, vorher);
  await rel('locating');
  H.checkEqual('Ortung locating: Arbeitsschritt „Sucht Position …“, kein Hinweis', await view(), ['Sucht Position …', null, null, false]);
  H.checkEqual('… Bericht ans Protokoll: schritt', (await page.evaluate(() => document.querySelector('dreame-x60-panel').snapshot())).schritt, 'Sucht Position …');
  await rel('failed');
  H.checkEqual('Ortung failed: Arbeitsschritt wie vorher, gelber Hinweis „Position unbekannt“ ohne ✕', await view(), [vorher[0], 'Position unbekannt', 'relocation', false]);
  await page.evaluate(() => { window._moreInfo = null; document.querySelector('dreame-x60-panel').addEventListener('hass-more-info', (e) => { window._moreInfo = e.detail.entityId; }, { once: true }); document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.chip.msg').click(); });
  H.checkEqual('… Antippen öffnet more-info des Ortungs-Sensors', await page.evaluate(() => window._moreInfo), 'sensor.heidi_relocation_status');
  await rel('located');
}

// ── Leerlauf: gemeinsame Werte („–“ bei unavailable), kein Streifen, kein Auftrag ──
await setStates(docked);
{
  const got = await readHero();
  H.checkEqual('Leerlauf (Raum-Selects unavailable, Kartendaten vorhanden): gemeinsame Werte aller Räume', got.params, ['Saugen', 'Turbo', '–']);
  { const ohne = { ...docked }; delete ohne['camera.heidi_map']; await setStates(ohne); H.checkEqual('Leerlauf ohne Selects und ohne Karte: drei Felder „–“', (await readHero()).params, ['–', '–', '–']); await setStates(docked); }
  H.check('Leerlauf: kein Streifen', got.strip === null, got.strip);
  H.check('Leerlauf: kein dx-auftrag', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-auftrag'))));
  H.check('Leerlauf ohne Laden: kein Blitz am Akku', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.batt .bolt'))));
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
  H.check('Leerlauf ohne Hinweis: keine Chip-Zeile (Personen/DND nicht mehr im Panel, PD-009)', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.chips'))));
  const s = { ...docked }; s['sensor.heidi_error'] = { ...s['sensor.heidi_error'], state: 'clean_mop_pad' };
  await setStates(s);
  const more = await page.evaluate(() => new Promise((resolve) => {
    document.addEventListener('hass-more-info', (e) => resolve(e.detail.entityId), { once: true });
    document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.chips .chip').click();
    setTimeout(() => resolve(null), 300);
  }));
  H.checkEqual('Hinweis-Chip „Mopp reinigen“ → hass-more-info mit sensor.heidi_error', more, 'sensor.heidi_error');
  await setStates(docked);
}

// ── PD-015: Warnung = gelber Chip mit Kurztext, Langtext im Tooltip und ✕ (button.press auf clear_warning); Fehler rot ohne ✕ ──
{
  const readChip = () => page.evaluate(() => {
    const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot;
    const c = h.querySelector('.chips .chip.msg');
    return c ? { text: c.querySelector('.txt').textContent.replace(/\s+/g, ' ').trim(), warn: c.classList.contains('warn'), bad: c.classList.contains('bad'), x: !!c.querySelector('.x'), tip: c.closest('dx-tip')?.text ?? null } : null;
  });
  const withError = (code, hasError, buttonState) => {
    const s = { ...docked };
    s['sensor.heidi_error'] = { ...s['sensor.heidi_error'], state: code };
    s['vacuum.heidi'] = { ...s['vacuum.heidi'], attributes: { ...s['vacuum.heidi'].attributes, has_error: hasError } };
    s['button.heidi_clear_warning'] = { ...s['button.heidi_clear_warning'], state: buttonState };
    return s;
  };
  await setStates(withError('dust_bag_full', false, 'unknown')); // Warnung ansteht → Knopf verfügbar (Zustand = letzter Druck oder unknown)
  let c = await readChip();
  H.checkEqual('Warnung: gelber Chip mit Kurztext (zwei Wörter) und ✕', c && { text: c.text, warn: c.warn, x: c.x }, { text: 'Staubbeutel voll', warn: true, x: true });
  H.check('Langtext im Tooltip (dx-tip)', !!c && typeof c.tip === 'string' && c.tip.startsWith('Staubbeutel prüfen'), c && c.tip);
  await page.evaluate(() => { window._calls.length = 0; });
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.chips .chip.msg .x').click());
  await page.waitForTimeout(40);
  H.checkEqual('✕ → genau ein button.press auf button.heidi_clear_warning', await page.evaluate(() => window._calls), [['button', 'press', { entity_id: 'button.heidi_clear_warning' }]]);
  const hover = await page.evaluate(async () => {
    const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot;
    const tip = h.querySelector('dx-tip');
    tip.dispatchEvent(new Event('mouseenter'));
    await new Promise((r) => setTimeout(r, 30));
    const shown = tip.shadowRoot.querySelector('.tip')?.textContent ?? null;
    tip.dispatchEvent(new Event('mouseleave'));
    await new Promise((r) => setTimeout(r, 30));
    return { shown, hidden: !tip.shadowRoot.querySelector('.tip') };
  });
  H.check('Verweilen zeigt den Langtext, Verlassen blendet ihn aus', hover.shown && hover.shown.startsWith('Staubbeutel prüfen') && hover.hidden, hover);
  await setStates(withError('dust_bag_full', false, 'unavailable'));
  c = await readChip();
  H.check('Warnung, aber Knopf unavailable → kein ✕', !!c && c.warn && !c.x, c);
  await setStates(withError('robot_stuck_on_threshold', true, 'unavailable'));
  c = await readChip();
  H.checkEqual('Fehler: roter Chip mit Kurztext, kein ✕', c && { text: c.text, bad: c.bad, x: c.x }, { text: 'Steckt fest', bad: true, x: false });
  H.check('Fehler-Langtext im Tooltip', !!c && typeof c.tip === 'string' && c.tip.startsWith('Steckt an einer Stufe'), c && c.tip);
  await setStates(docked);
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
H.checkEqual('Diagnose: ohne diagnose: true feuert die Karte kein Ereignis', await page.evaluate(() => window._events.length), 0);
await page.close();

// ── Diagnose-Protokoll Schicht 3 (PD-017): Karte meldet ihre Anzeige als HA-Ereignis dreame_x60_anzeige ──
{
  const admin = { name: 'Herbert', is_admin: true };
  const m = await H.mount(b, { page: 'start', config: { page: 'start', diagnose: true }, user: admin });
  const events = () => m.page.evaluate(() => window._events);
  const setBatt = (v) => m.page.evaluate((val) => { const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; el.hass = { ...el.hass, states: { ...s, 'sensor.heidi_battery_level': { ...s['sensor.heidi_battery_level'], state: String(val) } } }; }, v);
  let ev = await events();
  H.checkEqual('Diagnose: erste Meldung nach dem Laden, Pfad events/dreame_x60_anzeige', ev.map((e) => e[0]), ['events/dreame_x60_anzeige']);
  H.checkEqual('Diagnose: Seite, Version und alle Werte als geändert', [ev[0][1].seite, ev[0][1].version, ev[0][1].geaendert], ['start', H.VERSION, ['kopf', 'schritt', 'hinweis', 'akku', 'fortschritt', 'zustand', 'knoepfe', 'laden', 'modus_ha', 'saug_ha', 'wasser_ha', 'jetzt', 'reihenfolge']]);
  const kopf = await m.page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-hero').shadowRoot.querySelector('.st.big').textContent.replace(/\s+/g, ' ').trim());
  H.check('Diagnose: gemeldeter Kopf steht im sichtbaren Kopf', kopf.includes(ev[0][1].werte.kopf) && ev[0][1].werte.kopf !== '', { sichtbar: kopf, gemeldet: ev[0][1].werte });
  const irrelevant = Object.keys(m.states).find((id) => !id.includes('heidi') && !id.startsWith('person.')) || 'sun.sun';
  for (let i = 0; i < 20; i++) {
    await m.page.evaluate(({ id, i }) => { const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; const cur = s[id] ?? { entity_id: id, state: '0', attributes: {} }; el.hass = { ...el.hass, states: { ...s, [id]: { ...cur, state: String(i) } } }; }, { id: irrelevant, i });
  }
  await m.page.waitForTimeout(1100);
  H.checkEqual('Diagnose: 20 irrelevante Ticks → kein weiteres Ereignis', (await events()).length, 1);
  await setBatt(41); await setBatt(40); // zwei schnelle Änderungen → jede Anzeige höchstens einmal je Sekunde, am Ende steht der letzte Wert
  await m.page.waitForTimeout(1300);
  ev = await events();
  H.check('Diagnose: Akkuwechsel → höchstens zwei weitere Meldungen, nur „akku“ geändert, letzter Wert 40', ev.length >= 2 && ev.length <= 3 && ev.slice(1).every((e) => JSON.stringify(e[1].geaendert) === '["akku"]') && ev.at(-1)[1].werte.akku === 40, ev.slice(1));
  H.check('Diagnose: keine Seiten-/Konsolenfehler', m.errs.length === 0, m.errs);
  await m.page.close();
  const gast = await H.mount(b, { page: 'start', config: { page: 'start', diagnose: true }, user: { name: 'Nicole', is_admin: false } });
  await gast.page.waitForTimeout(200);
  H.checkEqual('Diagnose: Benutzer ohne Admin-Recht → kein Ereignis, kein Fehler', [await gast.page.evaluate(() => window._events.length), gast.errs.length], [0, 0]);
  await gast.page.close();
}
await b.close();
H.summary();
