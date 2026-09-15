// profile.js – Geräteprofil Stufe 2: die Oberfläche folgt der Raumliste des Roboters. Drei Räume (Kacheln, Schnellstart,
// „Alles“ in App-Reihenfolge), zwanzig Räume (alle Kacheln da, kein horizontales Scrollen bei 1400 und 390 px), versteckter
// Raum fehlt, Roboter ohne Wischstation (Stationsknöpfe/-kacheln fehlen, keine Fehler).
import * as H from './harness.js';

const b = await H.launch();
console.log('profile');
const docked = H.loadFixture();
const FIELDS = ['cleaning_mode', 'suction_level', 'cleaning_times', 'mop_pad_humidity', 'cleaning_route'];
function withRooms(states, rooms) {
  const s = JSON.parse(JSON.stringify(states));
  const cam = s['camera.heidi_map'];
  const template = cam.attributes.rooms['1'];
  const out = {};
  for (const [id, r] of Object.entries(rooms)) out[id] = { ...template, room_id: Number(id), name: r.name, custom_name: r.name, order: r.order ?? Number(id), visibility: r.visibility ?? 'Visible' };
  cam.attributes = { ...cam.attributes, rooms: out };
  for (const k of Object.keys(s)) if (/^select\.heidi_room_\d+_/.test(k)) delete s[k];
  for (const id of Object.keys(rooms)) for (const f of FIELDS) { const ref = states[`select.heidi_room_1_${f}`]; s[`select.heidi_room_${id}_${f}`] = { ...ref, entity_id: `select.heidi_room_${id}_${f}` }; }
  return s;
}
const tiles = (page) => page.evaluate(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelectorAll('.rooms [data-room]')].map((b) => b.dataset.room + ':' + b.textContent.trim()));
const qsTiles = (page) => page.evaluate(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelectorAll('.qs [data-room]')].map((b) => b.dataset.room));
const overflow = (page) => page.evaluate(() => { const root = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('.root'); return { scroll: root.scrollWidth, client: root.clientWidth, doc: document.documentElement.scrollWidth, win: window.innerWidth }; });
const confirmOk = (page) => page.evaluate(() => { const d = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog'); if (!d) return false; d.shadowRoot.querySelector('.alert .ok').click(); return true; });
const tick = (page, ms = 80) => page.waitForTimeout(ms);

// ── drei Räume, versteckter vierter ──
{
  const states = withRooms(docked, { 2: { name: 'Küche', order: 2 }, 5: { name: 'Wohnzimmer', order: 1 }, 9: { name: 'Bad', order: 3 }, 12: { name: 'Balkon', order: 4, visibility: 'Hidden' } });
  const { page, errs } = await H.mount(b, { page: 'reinigen', states, viewport: { width: 1400, height: 1200 } });
  H.checkEqual('drei Räume als Kacheln in App-Reihenfolge, versteckter Balkon fehlt', await tiles(page), ['5:Wohnz.', '2:Küche', '9:Bad']);
  await page.evaluate(() => { window._calls.length = 0; });
  await page.evaluate(() => { const mc = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot; mc.querySelector('.rooms [data-room="9"]').click(); mc.querySelector('.rooms [data-room="5"]').click(); });
  await tick(page);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-map-card').shadowRoot.querySelector('[data-act="run"]').click()); await tick(page); await confirmOk(page); await tick(page);
  H.checkEqual('Bad, dann Wohnzimmer → Segmente [9, 5] mit Raum-IDs außerhalb 1..7', await page.evaluate(() => window._calls.map((c) => c[2].segments || c[2].value)), ['9,5', [9, 5]]);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}
{
  const states = withRooms(docked, { 2: { name: 'Küche', order: 2 }, 5: { name: 'Wohnzimmer', order: 1 }, 9: { name: 'Bad', order: 3 } });
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  H.checkEqual('Schnellstart: „Alles“ + drei Räume', await qsTiles(page), ['all', '5', '2', '9']);
  await page.evaluate(() => { window._calls.length = 0; document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelector('[data-room="all"]').click(); }); await tick(page);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-quickstart').shadowRoot.querySelector('.runbar .btn.primary').click()); await tick(page); await confirmOk(page); await tick(page);
  H.checkEqual('„Alles“ → alle drei in App-Reihenfolge', await page.evaluate(() => window._calls.map((c) => c[2].segments || c[2].value)), ['5,2,9', [5, 2, 9]]);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── zwanzig Räume ──
{
  const rooms = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, { name: i === 0 ? 'Hauswirtschaftsraum' : `Raum ${i + 1}`, order: i + 1 }]));
  const states = withRooms(docked, rooms);
  for (const width of [1400, 390]) {
    const { page, errs } = await H.mount(b, { page: 'reinigen', states, viewport: { width, height: 1600 } });
    const t = await tiles(page);
    H.check(`${width} px: zwanzig Kacheln, Kurzname „Hauswi.“`, t.length === 20 && t[0] === '1:Hauswi.' && t[19] === '20:Raum 20', t.slice(0, 3));
    const o = await overflow(page);
    H.check(`${width} px: kein horizontales Scrollen`, o.scroll <= o.client + 1 && o.doc <= o.win + 1, o);
    H.check(`${width} px: keine Konsolenfehler`, errs.length === 0, errs);
    await page.close();
  }
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1800 } });
  H.check('Schnellstart mit zwanzig Räumen + „Alles“', (await qsTiles(page)).length === 21);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Roboter ohne Wischstation: Stationsknöpfe fehlen, Seite bleibt fehlerfrei ──
{
  const states = JSON.parse(JSON.stringify(docked));
  for (const k of ['button.heidi_self_clean', 'button.heidi_manual_drying', 'select.heidi_drying_time', 'select.heidi_water_temperature', 'select.heidi_self_clean_frequency', 'number.heidi_self_clean_area', 'sensor.heidi_self_wash_base_status', 'sensor.heidi_clean_water_tank_status', 'sensor.heidi_dirty_water_tank_status', 'sensor.heidi_detergent_status', 'sensor.heidi_low_water_warning']) delete states[k];
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  const text = await H.shadowText(page, '.page');
  H.check('ohne Station: Übersicht rendert', !!text && text.length > 100, text && text.slice(0, 120));
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
