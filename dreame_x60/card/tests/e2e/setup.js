// setup.js – Einrichtungsprüfung (PD-014): Leiste über der Übersicht nur bei Befund; Bereichszuordnung aus dem Entitäts-
// Register (WS-Stub), Reparaturen; Symbol/Knopf springen zum more-info-Dialog, zur HA-Seite oder zur Seite Einstellungen.
import * as H from './harness.js';

const b = await H.launch();
console.log('setup');
const docked = H.loadFixture();
// Räume des Abzugs sind benutzerdefiniert (type 0) – hier als App-Standardtypen (Bad 6, Schlafzimmer 2, WC bleibt 0, Flur 8, Büro 12, Küche 4, Wohnzimmer 1)
const TYPES = { Bad: 6, Schlafzimmer: 2, WC: 0, Flur: 8, Büro: 12, Küche: 4, Wohnzimmer: 1 };
const typedRooms = (states) => { const cam = states['camera.heidi_map']; const rooms = Object.fromEntries(Object.entries(cam.attributes.rooms).map(([k, r]) => [k, { ...r, type: TYPES[r.name] ?? 0 }])); return { ...states, 'camera.heidi_map': { ...cam, attributes: { ...cam.attributes, rooms } } }; };
const withSwitch = (states, on) => ({ ...typedRooms(states), 'switch.heidi_customized_cleaning': { ...states['switch.heidi_customized_cleaning'], state: on ? 'on' : 'off' } });
const segments = { segments: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ id: `1_${n}`, name: `Raum ${n}`, group: 'Map 1' })) };
const fullMapping = { options: { vacuum: { area_mapping: { bad: ['1_1'], schlaf: ['1_2'], wc: ['1_3'], flur: ['1_4'], buero: ['1_5'], kueche: ['1_6'], wohn: ['1_7'] } } } };
const partialMapping = { options: { vacuum: { area_mapping: { bad: ['1_1'], kueche: ['1_6'] } } } };
const setup = (page) => page.evaluate(() => { const el = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup'); const bar = el && el.shadowRoot.querySelector('.bar'); return { visible: !!bar, cls: bar ? bar.className : null, icons: bar ? [...bar.querySelectorAll('.icons .ic')].map((i) => i.dataset.check + ':' + i.className.replace('ic ', '')) : [], problems: bar ? [...bar.querySelectorAll('[data-problem]')].map((p) => p.dataset.problem + ' | ' + p.querySelector('.tx').textContent.replace(/\s+/g, ' ').trim()) : [], sum: bar ? bar.querySelector('.sum').textContent : null }; });
const listenMoreInfo = (page) => page.evaluate(() => { window._mi = []; document.querySelector('dreame-x60-panel').addEventListener('hass-more-info', (e) => window._mi.push(e.detail.entityId)); });
const tick = (page, ms = 250) => page.waitForTimeout(ms);

// ── alles eingerichtet → keine Leiste ──
{
  const { page, errs } = await H.mount(b, { page: 'start', states: withSwitch(docked, true), wsResponses: { 'config/entity_registry/get': fullMapping, 'vacuum/get_segments': segments, 'repairs/list_issues': { issues: [] } }, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const s = await setup(page);
  H.check('alles eingerichtet: keine Leiste', !s.visible, s);
  H.checkEqual('WS-Abfragen: Register, Segmente, Reparaturen', await page.evaluate(() => window._ws.map((m) => m.type).sort()), ['config/entity_registry/get', 'repairs/list_issues', 'vacuum/get_segments']);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Schalter aus, zwei Räume ohne Bereich, eine Reparatur ──
{
  const { page, errs } = await H.mount(b, { page: 'start', states: withSwitch(docked, false), wsResponses: { 'config/entity_registry/get': partialMapping, 'vacuum/get_segments': segments, 'repairs/list_issues': { issues: [{ domain: 'vacuum', issue_id: 'segments_changed_x', translation_key: 'segments_changed' }, { domain: 'hacs', issue_id: 'y' }] } }, viewport: { width: 1400, height: 1600 } });
  await tick(page);
  const s = await setup(page);
  H.check('Leiste sichtbar, rot (Fehler)', s.visible && s.cls === 'bar error', s);
  H.checkEqual('Symbole: acht Prüfungen mit Stufen', s.icons, ['robot:ok', 'package:ok', 'entities:ok', 'mapdata:ok', 'customized:warn', 'roomtypes:ok', 'areas:error', 'repairs:error']);
  H.check('Befunde: Angepasste Reinigung, 5 Räume ohne Bereich (Namen), eine Reparatur', s.problems.length === 3 && /Angepasste Reinigung ist aus/.test(s.problems[0]) && /5 Räume sind keinem HA-Bereich zugeordnet: Raum 2, Raum 3, Raum 4, Raum 5, Raum 7/.test(s.problems[1]) && /Dort: Reinigung → Nach Bereich → Konfigurieren/.test(s.problems[1]) && /1 offene Reparatur/.test(s.problems[2]), s.problems);
  H.checkEqual('Zusammenfassung', s.sum, '2 Probleme, 1 Hinweis');
  await listenMoreInfo(page);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('.icons [data-check="areas"]').click());
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('[data-go="customized"]').click());
  await tick(page, 80);
  H.checkEqual('Symbol Bereiche → more-info vacuum.heidi; Knopf Schalter → more-info Schalter', await page.evaluate(() => window._mi), ['vacuum.heidi', 'switch.heidi_customized_cleaning']);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('[data-go="repairs"]').click());
  await tick(page, 80);
  H.checkEqual('Knopf Reparaturen → HA-Seite /config/repairs', await page.evaluate(() => location.pathname), '/config/repairs');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── ohne WS (alte HA, Tests): Bereichs- und Reparaturprüfung entfallen, Rest läuft ──
{
  const states = withSwitch(docked, true);
  delete states['camera.heidi_map_data'];
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const s = await setup(page);
  H.checkEqual('ohne WS: sechs Prüfungen, Datenkarte als Hinweis (zählt nicht doppelt bei den Roboter-Entitäten)', s.icons, ['robot:ok', 'package:ok', 'entities:ok', 'mapdata:warn', 'customized:ok', 'roomtypes:ok']);
  H.checkEqual('Zusammenfassung', s.sum, '1 Hinweis');
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('[data-go="mapdata"]').click());
  await tick(page, 80);
  H.checkEqual('Datenkarte → Integrationsseite', await page.evaluate(() => location.pathname), '/config/integrations/integration/dreame_vacuum');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Raumtypen: Abzug unverändert (alle benutzerdefiniert) → Hinweis, WC nicht dabei ──
{
  const states = { ...docked, 'switch.heidi_customized_cleaning': { ...docked['switch.heidi_customized_cleaning'], state: 'on' } };
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const s = await setup(page);
  H.check('Raumtypen: sechs benutzerdefinierte Räume mit App-Typ → Hinweis, WC fehlt in der Liste', s.icons.includes('roomtypes:warn') && /Bad, Küche, Wohnzimmer, Schlafzimmer, Flur, Büro: benutzerdefiniert/.test(s.problems[0]) && !/WC/.test(s.problems[0]), s.problems);
  await listenMoreInfo(page);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('[data-go="roomtypes"]').click());
  await tick(page, 80);
  H.checkEqual('→ more-info der Namens-Entität des ersten Raums', await page.evaluate(() => window._mi), ['select.heidi_room_1_name']);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Paket fehlt → Sprung zur Seite Einstellungen ──
{
  const states = withSwitch(docked, true);
  delete states['sensor.heidi_phase']; delete states['input_boolean.heidi_automatik'];
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const s = await setup(page);
  H.check('Paket: 2 Helfer fehlen → Fehler', s.icons.includes('package:error') && /2 Helfer des Pakets fehlen/.test(s.problems[0]), s);
  await page.evaluate(() => document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-setup').shadowRoot.querySelector('[data-go="package"]').click());
  await tick(page);
  H.checkEqual('→ Seite Einstellungen (Pfad; HA baut die Karte je Ansicht neu)', await page.evaluate(() => location.pathname), '/dreame-x60/einstellungen');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
