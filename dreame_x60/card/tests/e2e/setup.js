// setup.js – Einrichtungsprüfung (PD-014): zwischen Titel und Uhr nur die Symbole mit Befund (rot = Fehler, pulsiert; gelb =
// Hinweis), Tooltip = Klartext, Klick springt direkt zur Stelle (more-info-Dialog, HA-Seite, Seite Einstellungen).
// Bereichszuordnung aus dem Entitäts-Register (WS-Stub), Reparaturen.
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
const icons = (page) => page.evaluate(() => [...document.querySelector('dreame-x60-panel').shadowRoot.querySelectorAll('.topbar .setupicons .si')].map((b) => ({ key: b.dataset.check, level: b.className.replace('si ', ''), text: b.title, anim: getComputedStyle(b).animationName })));
const click = (page, key) => page.evaluate((k) => document.querySelector('dreame-x60-panel').shadowRoot.querySelector(`.topbar .si[data-check="${k}"]`).click(), key);
const listenMoreInfo = (page) => page.evaluate(() => { window._mi = []; document.querySelector('dreame-x60-panel').addEventListener('hass-more-info', (e) => window._mi.push(e.detail.entityId)); });
const tick = (page, ms = 250) => page.waitForTimeout(ms);

// ── alles eingerichtet → keine Symbole ──
{
  const { page, errs } = await H.mount(b, { page: 'start', states: withSwitch(docked, true), wsResponses: { 'config/entity_registry/get': fullMapping, 'vacuum/get_segments': segments, 'repairs/list_issues': { issues: [] } }, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  H.checkEqual('alles eingerichtet: keine Symbole in der Kopfzeile', await icons(page), []);
  H.checkEqual('WS-Abfragen: Register, Segmente, Reparaturen', await page.evaluate(() => window._ws.map((m) => m.type).sort()), ['config/entity_registry/get', 'repairs/list_issues', 'vacuum/get_segments']);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Schalter aus, fünf Räume ohne Bereich, eine Reparatur → drei Symbole, Klick springt ──
{
  const { page, errs } = await H.mount(b, { page: 'planer', states: withSwitch(docked, false), wsResponses: { 'config/entity_registry/get': partialMapping, 'vacuum/get_segments': segments, 'repairs/list_issues': { issues: [{ domain: 'vacuum', issue_id: 'segments_changed_x', translation_key: 'segments_changed' }, { domain: 'hacs', issue_id: 'y' }] } }, viewport: { width: 1400, height: 1200 } });
  await tick(page);
  const ic = await icons(page);
  H.checkEqual('nur Befunde als Symbole, auch auf Unterseiten (Planer)', ic.map((i) => i.key + ':' + i.level), ['customized:warn', 'areas:error', 'repairs:error']);
  H.check('Tooltip = Klartext; Bereiche nennen die offenen Räume', /Angepasste Reinigung ist aus/.test(ic[0].text) && /5 Räume sind keinem HA-Bereich zugeordnet: Raum 2, Raum 3, Raum 4, Raum 5, Raum 7/.test(ic[1].text) && /1 offene Reparatur/.test(ic[2].text), ic.map((i) => i.text));
  H.check('rote Symbole pulsieren, gelbe nicht', ic[1].anim === 'dx-setup-pulse' && ic[2].anim === 'dx-setup-pulse' && ic[0].anim === 'none', ic.map((i) => i.anim));
  await listenMoreInfo(page);
  await click(page, 'areas'); await click(page, 'customized'); await tick(page, 80);
  H.checkEqual('Bereiche → more-info vacuum.heidi (Tiefensprung ohne HA-Dialog = Rückfall); Schalter → more-info Schalter', await page.evaluate(() => window._mi), ['vacuum.heidi', 'switch.heidi_customized_cleaning']);
  await tick(page, 200);
  H.check('Rückfall: Toast mit dem Restweg im Dialog', /Im Dialog: Reinigung → Nach Bereich → Konfigurieren/.test((await H.shadowText(page, '.toast')) || ''), await H.shadowText(page, '.toast'));
  await click(page, 'repairs'); await tick(page, 80);
  H.checkEqual('Reparaturen → HA-Seite /config/repairs', await page.evaluate(() => location.pathname), '/config/repairs');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Zuordnung nachgeholt: neues hass.entities (Register geändert) → Symbol verschwindet ohne Neuladen ──
{
  const { page, errs } = await H.mount(b, { page: 'start', states: withSwitch(docked, true), wsResponses: { 'config/entity_registry/get': partialMapping, 'vacuum/get_segments': segments, 'repairs/list_issues': { issues: [] } }, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  H.checkEqual('vorher: rotes Bereiche-Symbol', (await icons(page)).map((i) => i.key), ['areas']);
  await page.evaluate((full) => { window._wsResponses['config/entity_registry/get'] = full; const el = document.querySelector('dreame-x60-panel'); el.hass = { ...el.hass, entities: { 'vacuum.heidi': { entity_id: 'vacuum.heidi' } } }; }, fullMapping);
  await tick(page, 400);
  H.checkEqual('nachher: kein Symbol (Register-Wechsel löst Neuladen aus)', (await icons(page)).map((i) => i.key), []);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── ohne WS (alte HA, Tests): Bereichs- und Reparaturprüfung entfallen; Datenkarte fehlt → ein gelbes Symbol ──
{
  const states = withSwitch(docked, true);
  delete states['camera.heidi_map_data'];
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  H.checkEqual('ohne WS: nur Datenkarte als Hinweis (zählt nicht doppelt bei den Roboter-Entitäten)', (await icons(page)).map((i) => i.key + ':' + i.level), ['mapdata:warn']);
  await click(page, 'mapdata'); await tick(page, 80);
  H.checkEqual('Datenkarte → Integrationsseite', await page.evaluate(() => location.pathname), '/config/integrations/integration/dreame_vacuum');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Raumtypen: Abzug unverändert (alle benutzerdefiniert) → Hinweis, WC nicht dabei ──
{
  const states = { ...docked, 'switch.heidi_customized_cleaning': { ...docked['switch.heidi_customized_cleaning'], state: 'on' } };
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const ic = await icons(page);
  H.check('Raumtypen: sechs benutzerdefinierte Räume mit App-Typ → Hinweis, WC fehlt in der Liste', ic.length === 1 && ic[0].key === 'roomtypes' && ic[0].level === 'warn' && /Bad, Küche, Wohnzimmer, Schlafzimmer, Flur, Büro: benutzerdefiniert/.test(ic[0].text) && !/WC/.test(ic[0].text), ic);
  await listenMoreInfo(page);
  await click(page, 'roomtypes'); await tick(page, 80);
  H.checkEqual('→ more-info der Namens-Entität des ersten Raums', await page.evaluate(() => window._mi), ['select.heidi_room_1_name']);
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

// ── Paket fehlt → rotes Symbol, Sprung zur Seite Einstellungen ──
{
  const states = withSwitch(docked, true);
  delete states['sensor.heidi_phase']; delete states['input_boolean.heidi_automatik'];
  const { page, errs } = await H.mount(b, { page: 'start', states, viewport: { width: 1400, height: 1400 } });
  await tick(page);
  const ic = await icons(page);
  H.check('Paket: 2 Helfer fehlen → rotes Symbol', ic.length === 1 && ic[0].key === 'package' && ic[0].level === 'error' && /2 Helfer des Pakets fehlen/.test(ic[0].text), ic);
  await click(page, 'package'); await tick(page);
  H.checkEqual('→ Seite Einstellungen (Pfad; HA baut die Karte je Ansicht neu)', await page.evaluate(() => location.pathname), '/dreame-x60/einstellungen');
  H.check('keine Konsolenfehler', errs.length === 0, errs);
  await page.close();
}

await b.close();
H.summary();
