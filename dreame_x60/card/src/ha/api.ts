// Schreibzugriffe (Bauplan 3.2): einzige Stelle, die hass.callService/callApi aufruft. Dienste und Payloads wie v1
// (Abschnitt 6). Mehrteilige Schreibvorgänge melden Teilfehler (Regel 20) statt still zu scheitern.
import { ENTITIES, HA_EVENTS, HA_OPTIONS, ROOM_VALUE_CODES, SERVICES, eventPath, historyPath, planEntity, roomEntity } from './contract';
import { readProfile } from './profile';
import type { PlanNumber, RoomId, RoomValueKey } from './contract';
import type { HomeAssistant } from './types';
import { t } from '../i18n/t';
import { encodeRaum } from '../domain/raumwerte';
import type { RoomValuesInput } from '../domain/raumwerte';
import type { VacuumService } from '../domain/status';
import type { Variante } from '../domain/estimate';
import type { HistoryResponse } from '../domain/timeline';
import type { DiagZeile, Ticket, TicketKurz, TicketZaehler } from '../domain/diag';

/** Ergebnis eines mehrteiligen Schreibvorgangs. */
export interface WriteResult { ok: boolean; fehlgeschlagen: string[]; grund?: string }

/** Entwurf eines Planer-Eintrags (Snapshot beim Öffnen, Regel 19). */
export interface PlanDraft {
  name: string;
  raeume: number[];
  tage: boolean[];
  personen: string[];
  modus: string; saug: string; wasser: string; route: string; wdh: string;
  ho: string; hoSaug: string; hoWdh: string;
  schnell: boolean; spSaug: string; spWdh: string;
  aktiv: boolean;
  /** „HH:MM“ */
  zeit: string;
  raum: Record<string | number, RoomValuesInput | undefined>;
}

export interface ZonePayload { zones: number[][]; no_mops: number[][]; walls?: number[][] }

/** Schrittwerte, auf die das Prognose-Intervall gerundet wird (Automation prüft minute % intervall). */
export const INTERVAL_STEPS = [5, 10, 15, 20, 30, 60] as const;
export const roundInterval = (v: number): number => INTERVAL_STEPS.reduce<number>((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), INTERVAL_STEPS[0]);

const inverse = (t: Record<string, string>): Record<string, string> => Object.fromEntries(Object.entries(t).map(([k, v]) => [v, k]));
const RV_HA_INV = { modus: inverse(ROOM_VALUE_CODES.RV_HA.modus), saug: inverse(ROOM_VALUE_CODES.RV_HA.saug), wasser: inverse(ROOM_VALUE_CODES.RV_HA.wasser), route: inverse(ROOM_VALUE_CODES.RV_HA.route) };

export class DxApi {
  constructor(private readonly getHass: () => HomeAssistant | undefined) {}

  private hass(): HomeAssistant {
    const h = this.getHass();
    if (!h) throw new Error('Keine Verbindung zu Home Assistant');
    return h;
  }

  /** Ein Dienstaufruf. */
  async call(domain: string, service: string, data: Record<string, unknown>): Promise<unknown> {
    return this.hass().callService(domain, service, data);
  }

  /** Mehrere Aufrufe parallel; liefert die fehlgeschlagenen Kennungen. */
  private async many(calls: { key: string; run: () => Promise<unknown> }[]): Promise<WriteResult> {
    const results = await Promise.allSettled(calls.map((c) => c.run()));
    const fehlgeschlagen = results.flatMap((r, i) => (r.status === 'rejected' ? [calls[i]!.key] : []));
    return { ok: fehlgeschlagen.length === 0, fehlgeschlagen };
  }

  // ───────── Roboter ─────────
  vacuum(service: VacuumService): Promise<unknown> {
    return this.call(SERVICES.vacuum.domain, service, { entity_id: ENTITIES.vac });
  }

  press(entityId: string): Promise<unknown> {
    return this.call(SERVICES.press.domain, SERVICES.press.service, { entity_id: entityId });
  }

  cleanSegments(segments: number[]): Promise<unknown> {
    return this.call(SERVICES.cleanSegment.domain, SERVICES.cleanSegment.service, { entity_id: ENTITIES.vac, segments });
  }

  /**
   * Räume in der gewählten Reihenfolge reinigen (Karte/Schnellstart, 4.3b): merkt die Reihenfolge wie das Planer-Skript
   * in input_text.heidi_lauf_reihenfolge (Kopf-Streifen, Auftrag-Kachel) und ruft dann vacuum_clean_segment auf.
   */
  async startRooms(segments: number[]): Promise<unknown> {
    await this.call(SERVICES.inputText.domain, SERVICES.inputText.service, { entity_id: ENTITIES.laufReihenfolge, value: segments.join(',') });
    return this.cleanSegments(segments);
  }

  /** Raumwert am Roboter sofort setzen; `'all'` = alle Räume des Profils parallel. Wdh als „2x“, sonst HA-Option aus RV_HA. */
  setRoomValue(room: RoomId | 'all', key: RoomValueKey, value: string): Promise<WriteResult> {
    const ids: readonly RoomId[] = room === 'all' ? readProfile(this.hass().states).roomIds : [room];
    const option = key === 'wdh' ? `${value}x` : (RV_HA_INV[key][value] ?? value);
    const field = ROOM_VALUE_CODES.RV_ENT[key];
    return this.many(ids.map((id) => ({ key: roomEntity(id, field), run: () => this.call(SERVICES.selectOption.domain, SERVICES.selectOption.service, { entity_id: roomEntity(id, field), option }) })));
  }

  /** Sperrzonen: ersetzt alle Einträge der gesendeten Listen (ein Aufruf). */
  async setZones(z: ZonePayload): Promise<WriteResult> {
    const data: Record<string, unknown> = { entity_id: ENTITIES.vac, zones: z.zones, no_mops: z.no_mops };
    if (z.walls) data.walls = z.walls;
    return this.many([{ key: SERVICES.setRestrictedZone.service, run: () => this.call(SERVICES.setRestrictedZone.domain, SERVICES.setRestrictedZone.service, data) }]);
  }

  // ───────── Planer ─────────
  /** Eintrag starten; verweigert (ohne Aufruf), wenn der Eintrag inaktiv ist. */
  async runPlan(n: PlanNumber, variante: Variante = 'normal'): Promise<WriteResult> {
    const aktiv = this.hass().states[planEntity(n, 'aktiv')]?.state === 'on';
    if (!aktiv) return { ok: false, fehlgeschlagen: [], grund: 'inaktiv' };
    await this.call(SERVICES.planStarten.domain, SERVICES.planStarten.service, { plan: n, variante });
    return { ok: true, fehlgeschlagen: [] };
  }

  runScene(shortcutId: number): Promise<unknown> {
    return this.call(SERVICES.appSzene.domain, SERVICES.appSzene.service, { shortcut_id: shortcutId });
  }

  /** Eintrag speichern: 18 Aufrufe in v1-Reihenfolge, Teilfehler benannt. Prüft Name und mindestens einen Raum. */
  async savePlan(n: PlanNumber, d: PlanDraft): Promise<WriteResult> {
    const name = d.name.trim();
    if (!name) return { ok: false, fehlgeschlagen: [], grund: 'name' };
    if (!d.raeume.length) return { ok: false, fehlgeschlagen: [], grund: 'raeume' };
    const calls: { key: string; run: () => Promise<unknown> }[] = [];
    const txt = (k: 'name' | 'raeume' | 'tage' | 'personen' | 'raumwerte', value: string) => { const id = planEntity(n, k); calls.push({ key: id, run: () => this.call(SERVICES.inputText.domain, SERVICES.inputText.service, { entity_id: id, value }) }); };
    const sel = (k: 'modus' | 'saugstufe' | 'wasser' | 'route' | 'wiederholungen' | 'homeoffice' | 'ho_saug' | 'ho_wdh' | 'sp_saug' | 'sp_wdh', option: string) => { const id = planEntity(n, k); calls.push({ key: id, run: () => this.call(SERVICES.inputSelectOption.domain, SERVICES.inputSelectOption.service, { entity_id: id, option }) }); };
    const bool = (k: 'aktiv' | 'schnell', v: boolean) => { const id = planEntity(n, k); calls.push({ key: id, run: () => this.call(SERVICES.inputBoolean.domain, v ? 'turn_on' : 'turn_off', { entity_id: id }) }); };
    const raum: Record<string, RoomValuesInput | undefined> = {};
    for (const [id, v] of Object.entries(d.raum)) if (d.raeume.includes(parseInt(id, 10))) raum[id] = v;
    txt('name', name); txt('raeume', d.raeume.join(',')); txt('tage', d.tage.map((b) => (b ? '1' : '0')).join('')); txt('personen', d.personen.join(','));
    txt('raumwerte', encodeRaum(raum));
    sel('modus', d.modus); sel('saugstufe', d.saug); sel('wasser', d.wasser); sel('route', d.route); sel('wiederholungen', d.wdh);
    sel('homeoffice', d.ho); sel('ho_saug', d.hoSaug); sel('ho_wdh', d.hoWdh);
    sel('sp_saug', d.spSaug); sel('sp_wdh', d.spWdh);
    bool('aktiv', d.aktiv); bool('schnell', d.schnell);
    const zeitId = planEntity(n, 'zeit');
    calls.push({ key: zeitId, run: () => this.call(SERVICES.inputDatetime.domain, SERVICES.inputDatetime.service, { entity_id: zeitId, time: `${d.zeit}:00` }) });
    return this.many(calls);
  }

  // ───────── Helfer und Einstellungen ─────────
  toggle(entityId: string): Promise<unknown> {
    return this.call(SERVICES.inputBoolean.domain, 'toggle', { entity_id: entityId });
  }

  /** Ein-/Ausschalten ausdrücklich (Dark-Mode-Segment: turn_on/turn_off statt toggle). */
  setBoolean(entityId: string, on: boolean): Promise<unknown> {
    return this.call(SERVICES.inputBoolean.domain, on ? 'turn_on' : 'turn_off', { entity_id: entityId });
  }

  /** select.* und input_select.*: Domäne aus der ID. */
  selectOption(entityId: string, option: string): Promise<unknown> {
    return this.call(entityId.split('.')[0]!, 'select_option', { entity_id: entityId, option });
  }

  /** number.* und input_number.*: Domäne aus der ID; Prognose-Intervall wird auf 5/10/15/20/30/60 gerundet. Liefert den gesetzten Wert. */
  async setNumber(entityId: string, value: number): Promise<number> {
    const v = entityId === ENTITIES.prognoseIntervall ? roundInterval(value) : value;
    await this.call(entityId.split('.')[0]!, 'set_value', { entity_id: entityId, value: v });
    return v;
  }

  /** time.* → time.set_value, input_datetime.* → input_datetime.set_datetime; Zeit „HH:MM“ → „HH:MM:00“. */
  setTime(entityId: string, hhmm: string): Promise<unknown> {
    if (!hhmm) return Promise.resolve();
    const time = `${hhmm.slice(0, 5)}:00`;
    return entityId.startsWith('time.')
      ? this.call(SERVICES.time.domain, SERVICES.time.service, { entity_id: entityId, time })
      : this.call(SERVICES.inputDatetime.domain, SERVICES.inputDatetime.service, { entity_id: entityId, time });
  }

  prognoseReset(): Promise<unknown> {
    return this.call(SERVICES.prognoseReset.domain, SERVICES.prognoseReset.service, {});
  }

  // ───────── Ereignisse ─────────
  /**
   * HA-Ereignis feuern (Diagnose-Protokoll Schicht 3, PD-017). HA erlaubt das nur Admin-Benutzern – bei allen anderen
   * (und ohne REST-Zugang) passiert nichts. Liefert, ob gesendet wurde; Fehler beim Senden stören die Karte nicht.
   */
  async fireEvent(type: string, data: Record<string, unknown>): Promise<boolean> {
    const h = this.getHass();
    if (!h?.callApi || !h.user?.is_admin) return false;
    try { await h.callApi('POST', eventPath(type), data); return true; } catch { return false; }
  }

  // ───────── Diagnose und Tickets (F.2, PD-018) ─────────
  /** Dienst mit Antwort: shell_command liefert {stdout, returncode}; stdout ist JSON. Wirft bei Fehlern (Regel 20: die Oberfläche zeigt sie). */
  private async respond<T>(svc: { domain: string; service: string }, args?: Record<string, unknown>): Promise<T> {
    const h = this.hass();
    if (!h.callWS) throw new Error(t('api.noWs'));
    const data = args ? { args: toBase64(JSON.stringify(args)) } : {};
    const r = await h.callWS<{ response?: { stdout?: string; returncode?: number; stderr?: string } }>({ type: 'call_service', domain: svc.domain, service: svc.service, service_data: data, return_response: true });
    const out = r?.response?.stdout ?? '';
    if (r?.response?.returncode || !out) throw new Error(r?.response?.stderr || t('api.noAnswer'));
    return JSON.parse(out) as T;
  }

  /** Letzte Zeilen des Protokolls (neueste zuletzt); `vor` = nur Zeilen vor diesem Zeitstempel („Ältere laden“). */
  diagTail(n: number, vor?: string): Promise<{ zeilen: DiagZeile[]; aelter: boolean }> {
    return this.respond(SERVICES.diagTail, vor ? { n, vor } : { n });
  }

  diagStatus(): Promise<{ dateien: { datei?: string; bytes?: number; zeilen_heute?: number }[]; letzte: string }> {
    return this.respond(SERVICES.diagStatus);
  }

  private async ticketCmd<T>(args: Record<string, unknown>): Promise<T> {
    const r = await this.respond<{ ok: boolean; fehler?: string } & T>(SERVICES.ticket, args);
    if (!r.ok) throw new Error(r.fehler || t('api.ticketError'));
    return r;
  }

  tickets(welche: 'offen' | 'geloest' | 'alle' = 'alle'): Promise<{ tickets: TicketKurz[]; zaehler: TicketZaehler }> {
    return this.ticketCmd({ cmd: 'liste', welche });
  }

  ticket(nr: string): Promise<{ ticket: Ticket; text: string }> {
    return this.ticketCmd({ cmd: 'zeige', nr });
  }

  ticketVerwerfen(nr: string, grund: string): Promise<{ ticket: Ticket }> {
    return this.ticketCmd({ cmd: 'verwerfen', nr, grund, wer: this.getHass()?.user?.name ?? '' });
  }

  ticketNotiz(nr: string, text: string): Promise<{ ticket: Ticket }> {
    return this.ticketCmd({ cmd: 'notiz', nr, text, wer: this.getHass()?.user?.name ?? '' });
  }

  /** „Fehler melden“: Ereignis an HA, das Backend legt daraus ein Ticket an. Liefert false, wenn nicht gesendet (kein Admin, Fehler). */
  reportProblem(text: string, stichworte: string[], kontext: Record<string, unknown>): Promise<boolean> {
    return this.fireEvent(HA_EVENTS.meldung, { ...kontext, text, stichworte });
  }

  // ───────── Lesen über die REST-API ─────────
  /** Historie der Phase (Paket) und des Roboters im Fenster (Sekunden). */
  history(startSec: number, endSec: number): Promise<HistoryResponse> {
    const h = this.hass();
    if (!h.callApi) return Promise.resolve([]);
    return h.callApi<HistoryResponse>('GET', historyPath(new Date(startSec * 1000).toISOString(), new Date(endSec * 1000).toISOString()));
  }
}

/** UTF-8-sicheres base64 (Umlaute in Meldungen). */
export function toBase64(text: string): string {
  let bin = '';
  for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Optionsstrings, die die API akzeptiert (für Editor-Validierung). */
export const OPTIONS = HA_OPTIONS;
