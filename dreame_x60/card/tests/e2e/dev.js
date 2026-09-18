// E2E Bauplan F.2b (PD-018): Seite „Dev“ (nur Admin) mit Protokoll, Starts, Tickets, Zeitleiste; Ticket-Ansicht;
// Knopf „Fehler melden“ auf jeder Seite links neben der Uhr; Dev in der Tab-Leiste am Handy; Benutzer ohne Admin-Recht.
import * as H from './harness.js';

const d = new Date(); const p2 = (n) => String(n).padStart(2, '0');
const TAG = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const ts = (hms) => `${TAG}T${hms}`;
const ZEILEN = [
  { ts: ts('08:39:07.848'), art: 'zustand', ent: 'vacuum.heidi', alt: 'idle', neu: 'cleaning', quelle: 'extern', attr: { vacuum_state: ['leaving_dock', 'sweeping'] } },
  { ts: ts('08:41:30.512'), art: 'meldung', text: 'Akku zeigt 99 %', ticket: 'HT-0005', seite: 'start', wer: 'Herbert', quelle: 'benutzer' },
  { ts: ts('08:45:00.324'), art: 'automation', name: 'Heidi: Prognose', quelle: 'system', ausloeser: 'time pattern' },
  { ts: ts('08:48:13.783'), art: 'dienst', dienst: 'vacuum.start', daten: { entity_id: 'vacuum.heidi' }, quelle: 'benutzer', wer: 'Herbert' },
  { ts: ts('08:48:13.894'), art: 'zustand', ent: 'vacuum.heidi', alt: 'docked', neu: 'cleaning', quelle: 'benutzer', wer: 'Herbert' },
  { ts: ts('08:48:14.950'), art: 'anzeige', seite: 'start', client: 'ab12', geaendert: ['kopf', 'zustand'], werte: { kopf: 'Reinigt', zustand: 'cleaning' }, quelle: 'benutzer' },
  { ts: ts('08:48:44.000'), art: 'anzeige', seite: 'start', client: 'ab12', geaendert: [], puls: true, werte: { kopf: 'Reinigt' }, quelle: 'benutzer' },
  { ts: ts('08:48:50.000'), art: 'zustand', ent: 'sensor.heidi_phase', alt: 'Saugt Staub ab', neu: 'Fährt zum Startpunkt', quelle: 'extern' },
];
const TK = (nr, status, x = {}) => ({ nr, status, schwere: 'fehler', quelle: 'auswertung', regel: 'T4', titel: 'Integration meldet Fehler: map', anzahl: 104, angelegt: ts('07:54:40'), zuletzt: ts('08:39:12'), wieder: 0, dx: '', commit: '', version: '', ...x });
const TICKETS = [TK('HT-0005', 'neu', { quelle: 'meldung', regel: '', schwere: 'hinweis', titel: 'Meldung: „Akku zeigt 99 %“', anzahl: 1 }), TK('HT-0003', 'in_arbeit', { dx: 'DX-080' }), TK('HT-0002', 'geloest', { commit: 'abc1234' })];
const out = (o) => ({ response: { stdout: JSON.stringify(o), returncode: 0 } });
const WS = {
  'call_service:heidi_diag_tail': out({ zeilen: ZEILEN, aelter: true }),
  'call_service:heidi_diag_status': out({ dateien: [{ datei: `heidi_diag-${TAG}.jsonl`, bytes: 86016 }, { zeilen_heute: 286 }], letzte: '' }),
  'call_service:heidi_ticket': {
    liste: out({ ok: true, tickets: TICKETS, zaehler: { neu: 1, in_arbeit: 1, geloest: 1 } }),
    zeige: out({ ok: true, ticket: { ...TICKETS[1], text: 't', notizen: [], verlauf: [] }, text: 'TICKET   HT-0003 · in_arbeit\nZEITLEISTE\n08:39:12 Map render Failed' }),
    verwerfen: out({ ok: true, ticket: { ...TICKETS[1], status: 'verworfen' } }),
    notiz: out({ ok: true, ticket: TICKETS[1] }),
  },
  'config/entity_registry/get': {}, 'repairs/list_issues': { issues: [] }, 'vacuum/get_segments': { segments: [] },
};
const ADMIN = { name: 'Herbert', is_admin: true };
const b = await H.launch();
const dev = (page, fn, arg) => page.evaluate(({ fn, arg }) => { const root = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dev').shadowRoot; return new Function('root', 'arg', fn)(root, arg); }, { fn, arg });
const shell = (page, fn, arg) => page.evaluate(({ fn, arg }) => new Function('root', 'arg', fn)(document.querySelector('dreame-x60-panel').shadowRoot, arg), { fn, arg });
const wsArgs = (page, service) => page.evaluate((service) => window._ws.filter((m) => m.service === service).map((m) => JSON.parse(decodeURIComponent(escape(window.atob(m.service_data.args))))), service);

// ── Seite Dev (Admin, Desktop) ──
{
  const m = await H.mount(b, { page: 'dev', config: { page: 'dev' }, user: ADMIN, wsResponses: WS, viewport: { width: 1300, height: 1400 } });
  await m.page.waitForTimeout(250);
  H.checkEqual('Navigation: Eintrag „Dev“ ist da und aktiv', await shell(m.page, 'const n = root.querySelector("dx-nav").shadowRoot.querySelector(".side [data-nav=dev]"); return [!!n, n && n.getAttribute("aria-current")]'), [true, 'page']);
  H.checkEqual('Kacheln: Protokoll, Starts, Zähler, Tickets, Zeitleiste', await dev(m.page, 'return [...root.querySelectorAll("[data-tile]")].map((x) => x.dataset.tile)'), ['log', 'starts', 'counts', 'tickets', 'timeline']);
  H.checkEqual('Protokoll: 286 Zeilen heute, 84 KB', await dev(m.page, 'return [root.querySelector("[data-tile=log] .kv .v").textContent, root.querySelector("[data-tile=log] .kv .u").textContent]'), ['286', 'Zeilen heute · 84 KB']);
  H.checkEqual('Starts heute: Dashboard-Start „Herbert“, App-Start „extern“ (neuester oben)', await dev(m.page, 'return [...root.querySelectorAll("[data-start]")].map((r) => [r.querySelector(".t").textContent.trim().slice(0, 5), r.querySelector(".chip").textContent.trim()])'), [['08:48', 'Herbert'], ['08:39', 'extern']]);
  H.checkEqual('Ticket-Zähler neu 1', await dev(m.page, 'return root.querySelector("[data-count=neu]").textContent'), '1');
  H.checkEqual('Ticketliste: Filter Offen zeigt 2, Alle 3, Gelöst 1', [
    await dev(m.page, 'return root.querySelectorAll("[data-ticket]").length'),
    await dev(m.page, 'root.querySelector("[data-tf=alle]").click(); return new Promise((r) => setTimeout(() => r(root.querySelectorAll("[data-ticket]").length), 30))'),
    await dev(m.page, 'root.querySelector("[data-tf=geloest]").click(); return new Promise((r) => setTimeout(() => r(root.querySelectorAll("[data-ticket]").length), 30))'),
  ], [2, 3, 1]);
  await dev(m.page, 'root.querySelector("[data-tf=offen]").click()');
  H.checkEqual('Zeitleiste: neueste oben, Lebenszeichen ausgeblendet (7 von 8 Zeilen)', await dev(m.page, 'const r = [...root.querySelectorAll(".ev")]; return [r.length, r[0].querySelector(".ts").textContent, r[0].querySelector(".tx b").textContent]'), [7, '08:48:50.000', 'sensor.heidi_phase']);
  H.checkEqual('Filter „Dienste“ → nur Dienstaufrufe; Quelle „Benutzer Herbert“', await dev(m.page, 'root.querySelector("[data-f=call]").click(); return new Promise((r) => setTimeout(() => r([...root.querySelectorAll(".ev")].map((e) => [e.dataset.k, e.querySelector(".src").textContent, e.querySelector(".tx b").textContent])), 30))'), [['call', 'Benutzer Herbert', 'Dienst vacuum.start']]);
  H.checkEqual('Filter „Meldungen“ → gelbe Marke mit Ticketnummer', await dev(m.page, 'root.querySelector("[data-f=report]").click(); return new Promise((r) => setTimeout(() => r([...root.querySelectorAll(".ev")].map((e) => [e.classList.contains("rep"), e.querySelector(".tx b").textContent])), 30))'), [[true, 'HT-0005 „Akku zeigt 99 %“']]);
  H.checkEqual('Suche „phase“ über alle Zeilen', await dev(m.page, 'root.querySelector("[data-f=all]").click(); const i = root.querySelector(".search"); i.value = "phase"; i.dispatchEvent(new Event("input")); return new Promise((r) => setTimeout(() => r(root.querySelectorAll(".ev").length), 30))'), 1);
  H.checkEqual('Zeile antippen → Rohzeile (JSON)', await dev(m.page, 'root.querySelector(".ev").click(); return new Promise((r) => setTimeout(() => r(JSON.parse(root.querySelector(".ev .more").textContent).ent), 30))'), 'sensor.heidi_phase');
  H.checkEqual('„Ältere laden“ fragt mit dem ältesten Zeitstempel', await (async () => { await dev(m.page, 'const i = root.querySelector(".search"); i.value = ""; i.dispatchEvent(new Event("input")); root.querySelector("[data-older]").click()'); await m.page.waitForTimeout(80); return (await wsArgs(m.page, 'heidi_diag_tail')).at(-1); })(), { n: 200, vor: ZEILEN[0].ts });
  // Ticket öffnen, verwerfen braucht einen Grund
  await dev(m.page, 'root.querySelector("[data-open=\\"HT-0003\\"]").click()');
  await m.page.waitForTimeout(120);
  const tk = (fn) => m.page.evaluate((fn) => { const root = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind=ticket] dx-ticket').shadowRoot; return new Function('root', fn)(root); }, fn);
  H.checkEqual('Ticket-Ansicht: Nummer, Status, ClickUp, gesicherter Text', await tk('return [root.querySelector(".nr").textContent, root.querySelector("[data-status]").textContent, root.querySelector(".chip.dim").textContent, root.querySelector("pre").textContent.includes("Map render Failed")]'), ['HT-0003', 'in Arbeit', 'ClickUp DX-080', true]);
  // Kopieren: die Testseite läuft wie Herberts HA über http (kein navigator.clipboard) → der alte Weg muss greifen (echter Klick nötig)
  await m.page.evaluate(() => { window._copied = null; document.addEventListener('copy', () => { const a = document.activeElement; window._copied = a && 'value' in a ? a.value.substring(a.selectionStart, a.selectionEnd) : String(document.getSelection()); }); });
  await m.page.click('dx-ticket [data-copy]');
  await m.page.waitForTimeout(80);
  H.checkEqual('Kopieren über http: ganzer Ticket-Text in der Zwischenablage, Toast, keine Fehlermeldung', [await m.page.evaluate(() => [window.isSecureContext, window._copied]), await tk('return root.querySelector(".err") ? root.querySelector(".err").textContent : ""'), await shell(m.page, 'return root.querySelector(".toast") && root.querySelector(".toast").textContent')],
    [[false, 'TICKET   HT-0003 · in_arbeit\nZEITLEISTE\n08:39:12 Map render Failed'], '', 'Ticket HT-0003 kopiert – in Claude einfügen']);
  H.checkEqual('Verwerfen ohne Grund → Hinweis, kein Aufruf', [await tk('root.querySelector("[data-reject]").click(); return new Promise((r) => setTimeout(() => r(root.querySelector(".err").textContent), 30))'), (await wsArgs(m.page, 'heidi_ticket')).filter((a) => a.cmd === 'verwerfen').length], ['Bitte zuerst einen Text eingeben.', 0]);
  await tk('const x = root.querySelector("textarea"); x.value = "bekannter Fehler der Integration"; x.dispatchEvent(new Event("input")); root.querySelector("[data-reject]").click()');
  await m.page.waitForTimeout(120);
  H.checkEqual('Verwerfen mit Grund → ein Aufruf mit Nummer, Grund und Benutzer', (await wsArgs(m.page, 'heidi_ticket')).filter((a) => a.cmd === 'verwerfen'), [{ cmd: 'verwerfen', nr: 'HT-0003', grund: 'bekannter Fehler der Integration', wer: 'Herbert' }]);
  H.check('Seite Dev: keine Seiten-/Konsolenfehler', m.errs.length === 0, m.errs);
  await H.screenshot(m.page, 'dev.png');
  await m.page.close();
}

// ── „Fehler melden“ auf einer anderen Seite (Admin) ──
{
  const m = await H.mount(b, { page: 'start', config: { page: 'start', diagnose: true }, user: ADMIN, wsResponses: WS, viewport: { width: 1300, height: 1200 } });
  H.checkEqual('Knopf „Fehler melden“ steht direkt links neben der Uhr', await shell(m.page, 'const k = root.querySelector(".topbar [data-report]"); return [!!k, k.nextElementSibling.classList.contains("time"), k.textContent.trim()]'), [true, true, 'Fehler melden']);
  await shell(m.page, 'root.querySelector("[data-report]").click()');
  await m.page.waitForTimeout(80);
  const rp = (fn) => m.page.evaluate((fn) => { const root = document.querySelector('dreame-x60-panel').shadowRoot.querySelector('dx-dialog[data-kind=report] dx-report').shadowRoot; return new Function('root', fn)(root); }, fn);
  const meldungen = () => m.page.evaluate(() => window._events.filter((e) => e[0] === 'events/dreame_x60_meldung').map((e) => e[1]));
  H.checkEqual('Leere Meldung wird nicht gesendet', [await rp('root.querySelector("[data-send]").click(); return new Promise((r) => setTimeout(() => r(root.querySelector(".err").textContent), 30))'), (await meldungen()).length], ['Bitte kurz beschreiben oder ein Stichwort wählen.', 0]);
  await rp('root.querySelector("[data-q]").click(); const x = root.querySelector("textarea"); x.value = "Kopf zeigt Bereit, Heidi fährt aber"; x.dispatchEvent(new Event("input")); root.querySelector("[data-send]").click()');
  await m.page.waitForTimeout(1800);
  const ev = await meldungen();
  H.checkEqual('Senden → genau ein Ereignis mit Text, Stichwort, Seite, Version und Anzeige', [ev.length, ev[0]?.text, ev[0]?.stichworte, ev[0]?.seite, ev[0]?.version, typeof ev[0]?.werte?.kopf, ev[0]?.werte?.zustand], [1, 'Kopf zeigt Bereit, Heidi fährt aber', ['Anzeige stimmt nicht'], 'start', H.VERSION, 'string', 'docked']);
  H.checkEqual('Dialog zu, Toast nennt die Ticketnummer', await shell(m.page, 'return [!!root.querySelector("dx-dialog"), root.querySelector(".toast") && root.querySelector(".toast").textContent]'), [false, 'Ticket HT-0005 angelegt – Marke steht im Protokoll']);
  // Anzeige-Meldung trägt die neuen Felder; beim Entfernen der Karte kommt „ende“
  const anz = await m.page.evaluate(() => window._events.filter((e) => e[0] === 'events/dreame_x60_anzeige').map((e) => e[1]));
  H.checkEqual('Anzeige-Meldung: Knöpfe und Laden dabei, leere Felder fehlen', [anz[0].werte.knoepfe, 'laden' in anz[0].werte, 'reihenfolge' in anz[0].werte, 'modus_ha' in anz[0].werte], [['start', 'locate'], true, false, false]);
  await m.page.evaluate(() => document.querySelector('dreame-x60-panel').remove());
  await m.page.waitForTimeout(60);
  H.checkEqual('Karte entfernt → letzte Meldung mit ende: true', await m.page.evaluate(() => window._events.filter((e) => e[0] === 'events/dreame_x60_anzeige').at(-1)[1].ende), true);
  H.check('Fehler melden: keine Seiten-/Konsolenfehler', m.errs.length === 0, m.errs);
  await m.page.close();
}

// ── Handy 390 px (Admin): Dev in der Tab-Leiste, Knopf als Symbol, kein Überlauf ──
{
  const m = await H.mount(b, { page: 'dev', config: { page: 'dev' }, user: ADMIN, wsResponses: WS, viewport: { width: 390, height: 844 } });
  await m.page.waitForTimeout(250);
  H.checkEqual('390 px: Tab-Leiste enthält „Dev“ (aktiv), passt in die Breite', await shell(m.page, 'const bar = root.querySelector("dx-nav").shadowRoot.querySelector(".tabbar"); const t = bar.querySelector("[data-nav=dev]"); return [!!t, t.getAttribute("aria-current"), bar.scrollWidth <= bar.clientWidth + 1]'), [true, 'page', true]);
  H.checkEqual('390 px: Knopf sichtbar, Beschriftung ausgeblendet, Uhr ausgeblendet', await shell(m.page, 'const k = root.querySelector("[data-report]"); return [k.getBoundingClientRect().width > 0, getComputedStyle(k.querySelector(":scope > span")).display, getComputedStyle(root.querySelector(".mi.time")).display]'), [true, 'none', 'none']);
  H.checkEqual('390 px: kein waagrechter Überlauf', await m.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
  H.check('390 px: keine Fehler', m.errs.length === 0, m.errs);
  await H.screenshot(m.page, 'dev-390.png');
  await m.page.close();
}

// ── Benutzer ohne Admin-Recht ──
{
  const m = await H.mount(b, { page: 'dev', config: { page: 'dev' }, user: { name: 'Nicole', is_admin: false }, wsResponses: WS, viewport: { width: 1300, height: 1200 } });
  H.checkEqual('Ohne Admin-Recht: kein Eintrag Dev, kein Knopf, statt Dev die Übersicht, kein Dienstaufruf', await shell(m.page, 'return [!!root.querySelector("dx-nav").shadowRoot.querySelector("[data-nav=dev]"), !!root.querySelector("[data-report]"), !!root.querySelector("dx-dev"), !!root.querySelector("dx-hero")]').then(async (r) => [...r, (await m.page.evaluate(() => window._ws.filter((x) => x.type === 'call_service').length))]), [false, false, false, true, 0]);
  H.check('Ohne Admin-Recht: keine Fehler', m.errs.length === 0, m.errs);
  await m.page.close();
}

await b.close();
H.summary();
