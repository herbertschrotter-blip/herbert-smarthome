// Seite Dev (Bauplan F.2b, PD-018): Zeilen lesbar machen, Filtergruppen, Lebenszeichen ausblenden, Starts mit Quelle,
// DxApi-Dienste mit Antwort (base64-Argumente, Fehler werden geworfen) und „Fehler melden“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quelleText, starts, zeigbar, zeilenGruppe, zeilenText } from '../../src/domain/diag';
import type { DiagZeile } from '../../src/domain/diag';
import { DxApi, toBase64 } from '../../src/ha/api';
import type { HomeAssistant } from '../../src/ha/types';

const Z = (x: Partial<DiagZeile> & { ts: string; art: DiagZeile['art'] }): DiagZeile => x as DiagZeile;
const VAC = (ts: string, alt: string, neu: string, x: Partial<DiagZeile> = {}): DiagZeile => Z({ ts, art: 'zustand', ent: 'vacuum.heidi', alt, neu, quelle: 'extern', ...x });

test('zeilenGruppe, zeigbar, quelleText, zeilenText', () => {
  const dienst = Z({ ts: '2026-09-18T20:48:13.783', art: 'dienst', dienst: 'vacuum.start', daten: { entity_id: 'vacuum.heidi' }, quelle: 'benutzer', wer: 'Herbert' });
  assert.deepEqual([zeilenGruppe(dienst), quelleText(dienst), zeilenText(dienst)], ['call', 'Benutzer Herbert', { haupt: 'Dienst vacuum.start', rest: 'vacuum.heidi' }]);
  const zust = VAC('2026-09-18T20:48:13.894', 'docked', 'cleaning', { attr: { status: ['Idle', 'Cleaning'] } });
  assert.deepEqual([zeilenGruppe(zust), quelleText(zust), zeilenText(zust)], ['robot', 'extern', { haupt: 'vacuum.heidi', rest: 'docked → cleaning  {status: Idle → Cleaning}' }]);
  const auto = Z({ ts: 't', art: 'automation', name: 'Heidi: Planer', quelle: 'system', ausloeser: 'time pattern' });
  assert.deepEqual([zeilenGruppe(auto), quelleText(auto), zeilenText(auto).haupt], ['auto', 'System (Zeit)', 'Heidi: Planer']);
  const durch = Z({ ts: 't', art: 'dienst', dienst: 'x.y', quelle: 'automation', durch: 'Heidi: Planer' });
  assert.equal(quelleText(durch), 'Automation Heidi: Planer');
  const karte = Z({ ts: 't', art: 'anzeige', seite: 'start', client: 'ab12', geaendert: ['kopf', 'akku'], werte: { kopf: 'Bereit', akku: 99 } });
  assert.deepEqual([zeilenGruppe(karte), quelleText(karte), zeilenText(karte).rest, zeigbar(karte)], ['card', 'Karte · start', 'kopf: Bereit; akku: 99', true]);
  assert.equal(zeigbar(Z({ ts: 't', art: 'anzeige', puls: true, geaendert: [], werte: {} })), false);
  assert.equal(zeigbar(Z({ ts: 't', art: 'anzeige', ende: true, geaendert: [] })), false);
  const meld = Z({ ts: 't', art: 'meldung', text: 'Kopf zeigt Bereit', ticket: 'HT-0008', seite: 'dev', wer: 'Herbert' });
  assert.deepEqual([zeilenGruppe(meld), quelleText(meld), zeilenText(meld)], ['report', 'Meldung · Herbert', { haupt: 'HT-0008 „Kopf zeigt Bereit“', rest: 'Seite dev' }]);
});

test('starts: extern ohne HA-Aufruf, Benutzer aus dem Kontext, später Roboter → Quelle des Dienstaufrufs, nur der gewählte Tag', () => {
  const zeilen = [
    VAC('2026-09-17T09:00:00.000', 'docked', 'cleaning'),
    VAC('2026-09-18T20:39:07.848', 'idle', 'cleaning'),
    Z({ ts: '2026-09-18T20:48:13.783', art: 'dienst', dienst: 'vacuum.start', quelle: 'benutzer', wer: 'Herbert' }),
    VAC('2026-09-18T20:48:13.894', 'docked', 'cleaning', { quelle: 'benutzer', wer: 'Herbert' }),
    VAC('2026-09-18T20:50:00.000', 'cleaning', 'paused'), VAC('2026-09-18T20:51:00.000', 'paused', 'cleaning'), // Weiter ist kein Start
    Z({ ts: '2026-09-18T21:00:00.000', art: 'dienst', dienst: 'script.heidi_plan_starten', quelle: 'automation', durch: 'Heidi: Planer' }),
    VAC('2026-09-18T21:00:40.000', 'docked', 'cleaning'), // Roboter meldet 40 s später, Kontext weg
  ];
  assert.deepEqual(starts(zeilen, '2026-09-18').map((s) => [s.ts.slice(11, 16), s.quelle, s.wer, s.dienst]),
    [['20:39', 'extern', '', ''], ['20:48', 'benutzer', 'Herbert', 'vacuum.start'], ['21:00', 'automation', 'Heidi: Planer', 'script.heidi_plan_starten']]);
});

function mockWs(antwort: (msg: Record<string, unknown>) => unknown, user: HomeAssistant['user'] = { name: 'Herbert', is_admin: true }) {
  const ws: Record<string, unknown>[] = [];
  const posts: [string, unknown][] = [];
  const hass: HomeAssistant = {
    states: {}, ...(user ? { user } : {}), callService: async () => undefined,
    callWS: async <T,>(msg: Record<string, unknown>) => { ws.push(msg); return antwort(msg) as T; },
    callApi: async <T,>(_m: 'GET' | 'POST', p: string, d?: Record<string, unknown>) => { posts.push([p, d]); return {} as T; },
  };
  return { api: new DxApi(() => hass), ws, posts };
}
const stdout = (obj: unknown) => ({ response: { stdout: JSON.stringify(obj), returncode: 0 } });
const args = (msg: Record<string, unknown>): unknown => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(String((msg.service_data as { args: string }).args)), (c) => c.charCodeAt(0))));

test('DxApi Diagnose: Dienste mit Antwort, Argumente als base64 (Umlaute), Fehler werden geworfen', async () => {
  const m = mockWs((msg) => (msg.service === 'heidi_diag_tail' ? stdout({ zeilen: [{ ts: 't', art: 'dienst' }], aelter: true }) : stdout({ ok: true, tickets: [], zaehler: { neu: 1, in_arbeit: 0, geloest: 0 }, ticket: { nr: 'HT-0001' }, text: 'x' })));
  assert.deepEqual(await m.api.diagTail(200, '2026-09-18T10:00:00.000'), { zeilen: [{ ts: 't', art: 'dienst' }], aelter: true });
  assert.deepEqual([m.ws[0]!.type, m.ws[0]!.domain, m.ws[0]!.service, m.ws[0]!.return_response, args(m.ws[0]!)], ['call_service', 'shell_command', 'heidi_diag_tail', true, { n: 200, vor: '2026-09-18T10:00:00.000' }]);
  assert.equal((await m.api.tickets('offen')).zaehler.neu, 1);
  assert.deepEqual(args(m.ws[1]!), { cmd: 'liste', welche: 'offen' });
  await m.api.ticketVerwerfen('HT-0002', 'nur ein Test – größer als nötig');
  assert.deepEqual(args(m.ws[2]!), { cmd: 'verwerfen', nr: 'HT-0002', grund: 'nur ein Test – größer als nötig', wer: 'Herbert' });
  await m.api.ticketNotiz('HT-0002', 'tritt nach App-Start auf');
  assert.deepEqual([(args(m.ws[3]!) as { cmd: string }).cmd, (await m.api.ticket('HT-0001')).ticket.nr], ['notiz', 'HT-0001']);
  assert.equal(toBase64('größer'), Buffer.from('größer', 'utf8').toString('base64'));
  await assert.rejects(mockWs(() => stdout({ ok: false, fehler: '„gelöst“ braucht den Commit' })).api.tickets(), /Commit/);
  await assert.rejects(mockWs(() => ({ response: { stdout: '', returncode: 1, stderr: 'kaputt' } })).api.diagTail(10), /kaputt/);
  await assert.rejects(new DxApi(() => ({ states: {}, callService: async () => undefined })).diagTail(10), /WebSocket/);
});

test('reportProblem: Ereignis dreame_x60_meldung mit Text, Stichworten und Kontext; ohne Admin-Recht false', async () => {
  const m = mockWs(() => ({}));
  assert.equal(await m.api.reportProblem('Kopf zeigt Bereit', ['Anzeige stimmt nicht'], { seite: 'start', version: 'v', client: 'ab12', werte: { kopf: 'Bereit' } }), true);
  assert.deepEqual(m.posts, [['events/dreame_x60_meldung', { seite: 'start', version: 'v', client: 'ab12', werte: { kopf: 'Bereit' }, text: 'Kopf zeigt Bereit', stichworte: ['Anzeige stimmt nicht'] }]]);
  const gast = mockWs(() => ({}), { name: 'Nicole', is_admin: false });
  assert.equal(await gast.api.reportProblem('x', [], {}), false);
  assert.equal(gast.posts.length, 0);
});
