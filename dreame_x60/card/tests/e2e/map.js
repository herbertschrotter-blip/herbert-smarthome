// map.js – dx-map-card (4.3): Karten-Element aus dem Modul-Cache (über 20 Ticks identisch, 0 Neuerzeugungen), genau ein
// map_modes-Eintrag je Modus mit Umrissen aus der Fixture, „Hinfahren“ → vacuum_goto, Kartenwahl nur mit Entität,
// Raumkacheln → vacuum_clean_segment nach Bestätigung, „Alles“ → vacuum.start, App-Szene → script nach Bestätigung,
// Stühle → toggle, Räume-Knopf → Overlay; compact auf der Übersicht (Bild, Bildunterschrift, Antippen → reinigen);
// dx-quickstart (Alles, Auswahl, Bestätigung).
import * as H from './harness.js';

const b = await H.launch();
console.log('map');
const docked = H.loadFixture();
const withKarte = (kind, extra = {}) => ({ ...docked, 'input_select.heidi_kartendarstellung': { ...docked['input_select.heidi_kartendarstellung'], state: kind }, ...extra });
const q = (page, sel) => page.evaluate((s) => { const root = document.querySelector('dreame-x60-panel').shadowRoot; const mc = root.querySelector('dx-map-card'); return !!(mc && mc.shadowRoot.querySelector(s)); }, sel);
const click = (page, sel) => page.evaluate((s) => { document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector(s).click(); }, sel);
const cards = (page) => page.evaluate(() => window._cards.map((c) => ({ type: c.type, modes: c.map_modes ? c.map_modes.map((m) => m.template || m.name) : null, title: c.title, tiles: c.tiles, icons: c.icons, sel: c.map_modes && c.map_modes[0].predefined_selections })));
const slotEl = (page) => page.evaluate(() => { const s = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.slot'); const el = s.firstChild; if (!window._mapEls) window._mapEls = []; let i = window._mapEls.indexOf(el); if (i < 0) { window._mapEls.push(el); i = window._mapEls.length - 1; } return { idx: i, type: el && el.cfg && el.cfg.type }; });
const confirmOk = (page) => page.evaluate(() => { const d = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'); if (!d) return false; d.shadowRoot.querySelector('.alert .ok').click(); return true; });
const tick = (page, ms = 80) => page.waitForTimeout(ms);

// ── Seite Reinigen mit Xiaomi-Karte ──
{
  const { page, errs } = await H.mount(b, { page: 'reinigen', states: withKarte('Xiaomi-Karte'), viewport: { width: 1400, height: 1200 } });
  await tick(page, 200);
  let c = await cards(page);
  H.check('Xiaomi: genau eine Karte erzeugt, Typ xiaomi-vacuum-map-card', c.length === 1 && c[0].type === 'custom:xiaomi-vacuum-map-card', c);
  H.checkEqual('Xiaomi: genau ein map_modes-Eintrag (Räume)', c[0].modes, ['vacuum_clean_segment']);
  H.check('Xiaomi: kein Titel, tiles [], icons []', c[0].title === '' && Array.isArray(c[0].tiles) && c[0].tiles.length === 0 && Array.isArray(c[0].icons) && c[0].icons.length === 0, c[0]);
  const bad = c[0].sel.find((r) => r.id === 1);
  H.checkEqual('Umriss Bad aus camera.heidi_map (x0/y0/x1/y1)', bad && bad.outline, [[-5700, 3550], [-2750, 3550], [-2750, 6650], [-5700, 6650]]);
  H.check('Beschriftung und Symbol je Raum aus den Kartendaten', bad && bad.label.text === 'Bad' && bad.icon.name === 'mdi:shower' && bad.label.x === -4225 && c[0].sel.length === 7, bad);
  H.checkEqual('Räume in Anzeigereihenfolge 7..1', c[0].sel.map((r) => r.id), [7, 6, 5, 4, 3, 2, 1]);
  const first = await slotEl(page);
  // 20 irrelevante Ticks → dasselbe Element, keine Neuerzeugung
  for (let i = 0; i < 20; i++) {
    await page.evaluate((i) => { const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; el.hass = { ...el.hass, states: { ...s, 'input_boolean.stuehle_am_boden': { ...s['input_boolean.stuehle_am_boden'], last_updated: 'tick-' + i } } }; }, i);
  }
  await tick(page);
  const after = await slotEl(page);
  H.check('20 irrelevante Ticks → Karten-Element identisch, 0 Neuerzeugungen', after.idx === first.idx && (await cards(page)).length === 1, { first, after });
  // Modus Zone → neues Element mit genau einem Modus; zurück auf Räume → aus dem Cache (keine Neuerzeugung)
  await click(page, '[data-mode="zone"]'); await tick(page, 200);
  c = await cards(page);
  H.check('Modus Zone → zweite Karte mit genau vacuum_clean_zone', c.length === 2 && JSON.stringify(c[1].modes) === '["vacuum_clean_zone"]', c);
  H.check('Modus Zone: keine Raumkacheln, Hinweiszeile', !(await q(page, '.rooms')) && (await q(page, '.mapmodes .hint')));
  await click(page, '[data-mode="raeume"]'); await tick(page, 200);
  H.check('zurück auf Räume → Element aus dem Cache (weiter 2 Karten), identisch mit dem ersten', (await cards(page)).length === 2 && (await slotEl(page)).idx === first.idx);
  // Hinfahren → vacuum_goto
  await click(page, '[data-act="goto"]'); await tick(page, 200);
  c = await cards(page);
  H.check('„Hinfahren“ → Karte im Modus vacuum_goto, Knopf markiert', c.length === 3 && JSON.stringify(c[2].modes) === '["vacuum_goto"]' && (await q(page, '[data-act="goto"].on')), c);
  await click(page, '[data-act="goto"]'); await tick(page, 100);
  H.check('„Hinfahren“ erneut → zurück zu Räume', (await q(page, '[data-mode="raeume"].on')) && !(await q(page, '[data-act="goto"].on')));
  // Kartenwahl: Entität unavailable → keine Wahl; verfügbar → Umschalter; select_option
  H.check('Kartenwahl fehlt, solange select.heidi_selected_map unavailable ist', !(await q(page, '.maps')));
  await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); const s = el.hass.states; el.hass = { ...el.hass, states: { ...s, 'select.heidi_selected_map': { ...s['select.heidi_selected_map'], state: 'Map 1', attributes: { ...s['select.heidi_selected_map'].attributes, options: ['Map 1', 'Map 2'] } } } }; });
  await tick(page);
  H.check('Kartenwahl erscheint mit verfügbarer Entität', await q(page, '.maps [data-map="Map 2"]'));
  await page.evaluate(() => { window._calls.length = 0; });
  await click(page, '.maps [data-map="Map 2"]'); await tick(page);
  H.checkEqual('Kartenwahl → select.select_option', await page.evaluate(() => window._calls), [['select', 'select_option', { entity_id: 'select.heidi_selected_map', option: 'Map 2' }]]);
  // Raumkacheln → Bestätigung → vacuum_clean_segment
  await page.evaluate(() => { window._calls.length = 0; });
  await click(page, '.rooms [data-room="7"]'); await click(page, '.rooms [data-room="6"]'); await tick(page);
  H.check('zwei Räume gewählt → Leiste „2 Räume reinigen“', (await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.runbar .btn.primary').textContent.trim())) === '2 Räume reinigen');
  await click(page, '[data-act="run"]'); await tick(page);
  H.check('Bestätigung offen, noch kein Call', (await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'))) && (await page.evaluate(() => window._calls.length)) === 0);
  await confirmOk(page); await tick(page);
  H.checkEqual('OK → Reihenfolge merken + vacuum_clean_segment mit segments [7, 6] in Tipp-Reihenfolge', await page.evaluate(() => window._calls), [['input_text', 'set_value', { entity_id: 'input_text.heidi_lauf_reihenfolge', value: '7,6' }], ['dreame_vacuum', 'vacuum_clean_segment', { entity_id: 'vacuum.heidi', segments: [7, 6] }]]);
  H.check('Auswahl danach leer', !(await q(page, '.runbar')));
  // Alles → vacuum.start nach Bestätigung
  await page.evaluate(() => { window._calls.length = 0; });
  await click(page, '[data-act="all"]'); await tick(page); await confirmOk(page); await tick(page);
  H.checkEqual('„Alles“ → vacuum.start', await page.evaluate(() => window._calls), [['vacuum', 'start', { entity_id: 'vacuum.heidi' }]]);
  // Rechte Spalte: Szene, Stühle, Räume-Knopf
  await page.evaluate(() => { window._calls.length = 0; document.querySelector('dreame-x60-panel').shadowRoot.querySelector('[data-scene="32"]').click(); }); await tick(page);
  H.check('Szene: Bestätigung, kein Call', (await page.evaluate(() => window._calls.length)) === 0 && (await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'))));
  await confirmOk(page); await tick(page);
  H.checkEqual('Szene OK → script.heidi_app_szene {shortcut_id: 32}', await page.evaluate(() => window._calls), [['script', 'heidi_app_szene', { shortcut_id: 32 }]]);
  await page.evaluate(() => { window._calls.length = 0; document.querySelector('dreame-x60-panel').shadowRoot.querySelector('[data-toggle="chairs"]').click(); }); await tick(page);
  H.checkEqual('Stühle am Boden → input_boolean.toggle', await page.evaluate(() => window._calls), [['input_boolean', 'toggle', { entity_id: 'input_boolean.stuehle_am_boden' }]]);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('[data-open="rooms"]').click()); await tick(page);
  H.check('„Räume einstellen“ → Overlay rooms (Roboter)', await page.evaluate(() => { const el = document.querySelector('dreame-x60-panel'); return !!el.shadowRoot.querySelector('dx-dialog[data-kind="rooms"]') && el.overlay.mode === 'robot'; }));
  await page.evaluate(() => document.querySelector('dreame-x60-panel').closeOverlay());
  await click(page, '[data-open="zones"]'); await tick(page);
  H.check('„Sperrzonen“ → Overlay zones', await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind="zones"]')));
  H.check('Reinigen (Xiaomi): keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await H.screenshot(page, 'map-reinigen.png');
  await page.close();
}

// ── Heidi-Karte (4.3b): Bild + eigene Ebene aus dem Kartenpaket, Tipp auf die Raumfläche wählt, kein fremdes Karten-Element ──
{
  const states = withKarte('Heidi-Karte', { 'camera.heidi_map_data': { entity_id: 'camera.heidi_map_data', state: '2026-09-15 10:56:10', attributes: { entity_picture: '/api/camera_proxy/camera.heidi_map_data?token=x', map_id: 1 } } });
  const { page, errs } = await H.mount(b, { page: 'reinigen', states, viewport: { width: 1400, height: 1200 } });
  const hm = (fn) => page.evaluate(fn);
  const roomsReady = async () => { for (let i = 0; i < 40; i++) { const n = await hm(() => { const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map'); return h ? h.shadowRoot.querySelectorAll('path.room').length : -1; }); if (n === 7) return true; await page.waitForTimeout(100); } return false; };
  H.check('Heidi-Karte: sieben Raumflächen aus dem Kartenpaket gezeichnet', await roomsReady());
  H.check('Heidi-Karte: kein eingebettetes Karten-Element (createCardElement nie gerufen)', (await cards(page)).length === 0);
  const info = await hm(() => { const h = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot; const img = h.querySelector('img'); const svg = h.querySelector('svg'); const bad = h.querySelector('path.room[data-room="1"]'); const bb = bad.getBBox(); const ib = img.getBoundingClientRect(); return { natural: [img.naturalWidth, img.naturalHeight], viewBox: svg.getAttribute('viewBox'), labels: h.querySelectorAll('g.label').length, badges: h.querySelectorAll('.badge').length, loops: (bad.getAttribute('d').match(/M/g) || []).length, badBox: [Math.round(bb.x), Math.round(bb.y), Math.round(bb.width), Math.round(bb.height)], imgW: Math.round(ib.width), title: bad.querySelector('title').textContent }; });
  H.checkEqual('Heidi-Karte: viewBox = Bildgröße (map.png 1040×680)', info.viewBox, `0 0 ${info.natural[0]} ${info.natural[1]}`);
  H.check('Heidi-Karte: keine Namens-Chips, kein Nummern-Chip ohne Auswahl, Bad heißt „Bad“, Umriss als geschlossene Schleife(n)', info.labels === 0 && info.badges === 0 && info.title === 'Bad' && info.loops >= 1 && info.loops < 20, info);
  H.check('Heidi-Karte: Badfläche liegt links in der unteren Bildhälfte (Kalibrierung 90° gedreht), Bad ≈ 2,95 × 3,1 m', info.badBox[0] < 400 && info.badBox[1] > 300 && info.badBox[2] > 150 && info.badBox[3] > 150, info.badBox);
  await hm(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelector('path.room[data-room="1"]').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true })));
  await tick(page);
  H.check('Tipp auf die Badfläche → Bad gewählt (Fläche und Kachel)', (await q(page, '.rooms [data-room="1"].sel')) && (await hm(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelector('path.room[data-room="1"].sel'))));
  H.checkEqual('Leiste „1 Raum reinigen“', await hm(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.runbar .btn.primary').textContent.trim()), '1 Raum reinigen');
  await hm(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelector('path.room[data-room="6"]').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true })));
  await tick(page);
  H.checkEqual('zweiter Tipp Küche → Nummern-Chips 1 (Bad) und 2 (Küche) in Tipp-Reihenfolge', await hm(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelectorAll('.badge')].map((g) => g.dataset.room + ':' + g.textContent.trim())), ['6:2', '1:1']);
  await hm(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelector('path.room[data-room="6"]').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true })));
  await tick(page);
  await click(page, '.rooms [data-room="1"]'); await tick(page);
  H.check('Kachel Bad erneut → abgewählt, auch in der Karte', !(await q(page, '.rooms [data-room="1"].sel')) && !(await hm(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.querySelector('path.room.sel'))));
  H.check('Heidi-Karte: kein Modus-Umschalter, kein „Hinfahren“, „Sperrzonen“ und „Alles“ vorhanden', !(await q(page, '.modes')) && !(await q(page, '[data-act="goto"]')) && (await q(page, '[data-open="zones"]')) && (await q(page, '[data-act="all"]')));
  // Ohne Datenkarte: Hinweis statt Flächen
  await hm(() => { const el = document.querySelector('dreame-x60-panel'); const s = { ...el.hass.states }; delete s['camera.heidi_map_data']; el.hass = { ...el.hass, states: s }; }); await tick(page);
  H.check('ohne Datenkarte: Hinweis „Datenkarte fehlt“', await hm(() => /Datenkarte fehlt/.test(document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('dx-heidi-map').shadowRoot.textContent)));
  H.check('Heidi-Karte: keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await H.screenshot(page, 'map-heidi.png');
  await page.close();
}

// ── Seite Reinigen mit Dreame-App-Karte (Fixture-Standard): keine Modi, Raumkacheln bleiben ──
{
  const { page, errs } = await H.mount(b, { page: 'reinigen', viewport: { width: 1400, height: 1200 } });
  await tick(page, 200);
  const c = await cards(page);
  H.check('Dreame-App: Karte vom Typ dreame-vacuum-map-card, theme light (dark_mode aus)', c.length === 1 && c[0].type === 'custom:dreame-vacuum-map-card', c);
  H.check('Dreame-App: kein Modus-Umschalter, kein „Hinfahren“, Raumkacheln und „Alles“ vorhanden', !(await q(page, '.modes')) && !(await q(page, '[data-act="goto"]')) && (await q(page, '.rooms [data-room="1"]')) && (await q(page, '[data-act="all"]')));
  H.check('Reinigen (Dreame-App): keine Fehler', errs.length === 0, errs);
  await page.close();
}

// ── Übersicht: compact (Kamerabild), Bildunterschrift, Antippen → reinigen, Reiter, dx-quickstart ──
{
  const { page, errs } = await H.mount(b, { page: 'start', viewport: { width: 1400, height: 1400 } });
  await tick(page, 200);
  const c = await cards(page);
  H.check('compact: Kamerabild (picture-entity), genau eine Karte', c.length === 1 && c[0].type === 'picture-entity', c);
  const cap = await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.mapcap').textContent.replace(/\s+/g, ' ').trim());
  H.check('compact: Bildunterschrift „Karte · Heidi in der Station · letzter Lauf …“', /^Karte · Heidi in der Station · letzter Lauf /.test(cap), cap);
  const nav = await page.evaluate(() => new Promise((resolve) => {
    const onChange = () => { window.removeEventListener('location-changed', onChange); resolve(location.pathname); };
    window.addEventListener('location-changed', onChange);
    document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.catch').click();
    setTimeout(() => resolve('timeout'), 500);
  }));
  H.checkEqual('compact: Karte antippen → /dreame-x60/reinigen', nav, '/dreame-x60/reinigen');
  await page.evaluate(() => { document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.tabs [data-open="zones"]').click(); }); await tick(page);
  H.check('compact: Reiter „Sperrzonen“ → Overlay zones', await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind="zones"]')));
  await page.evaluate(() => document.querySelector('dreame-x60-panel').closeOverlay());
  // Bildunterschrift im Lauf (driving-Fixture): Live-Karte · Küche · 2 m² · noch Flur
  await page.evaluate((st) => { const el = document.querySelector('dreame-x60-panel'); el.hass = { ...el.hass, states: st }; }, H.loadFixture('states-driving.json'));
  await tick(page);
  const cap2 = await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('.mapcap').textContent.replace(/\s+/g, ' ').trim());
  H.check('compact im Lauf: „Live-Karte · Küche · 2 m² · noch Flur“', cap2.startsWith('Live-Karte · Küche · 2 m² · noch Flur'), cap2);
  await page.evaluate((st) => { const el = document.querySelector('dreame-x60-panel'); el.hass = { ...el.hass, states: st }; }, docked);
  await tick(page);
  // Schnellstart
  const qs = (sel) => page.evaluate((s) => { document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelector(s).click(); }, sel);
  const qsText = (sel) => page.evaluate((s) => { const e = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
  await qs('[data-room="6"]'); await qs('[data-room="4"]'); await tick(page);
  H.checkEqual('Schnellstart: zwei Räume → „2 Räume reinigen“', await qsText('.runbar .btn.primary'), '2 Räume reinigen');
  await qs('[data-room="all"]'); await tick(page);
  H.checkEqual('Schnellstart: „Alles“ → „Ganze Wohnung reinigen“', await qsText('.runbar .btn.primary'), 'Ganze Wohnung reinigen');
  await page.evaluate(() => { window._calls.length = 0; });
  await qs('.runbar .btn.primary'); await tick(page); await confirmOk(page); await tick(page);
  H.checkEqual('Schnellstart OK → Reihenfolge merken + vacuum_clean_segment mit allen sieben Räumen (7..1)', await page.evaluate(() => window._calls), [['input_text', 'set_value', { entity_id: 'input_text.heidi_lauf_reihenfolge', value: '7,6,5,4,3,2,1' }], ['dreame_vacuum', 'vacuum_clean_segment', { entity_id: 'vacuum.heidi', segments: [7, 6, 5, 4, 3, 2, 1] }]]);
  await qs('[data-room="all"]'); await qs('[data-room="all"]'); await tick(page);
  H.check('Schnellstart: „Alles“ zweimal → Auswahl leer', !(await page.evaluate(() => !!document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelector('.runbar'))));
  H.check('Übersicht: keine Seiten-/Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
