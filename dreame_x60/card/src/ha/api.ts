// Schreibzugriffe (Bauplan 3.2): einzige Stelle, die hass.callService/callApi aufruft. Dienste und Payloads wie v1
// (Abschnitt 6). Mehrteilige Schreibvorgänge melden Teilfehler (Regel 20) statt still zu scheitern.
import { ENTITIES, HA_OPTIONS, ROOM_IDS, ROOM_VALUE_CODES, SERVICES, historyPath, planEntity, roomEntity } from './contract';
import type { PlanNumber, RoomId, RoomValueKey } from './contract';
import type { HomeAssistant } from './types';
import { encodeRaum } from '../domain/raumwerte';
import type { RoomValuesInput } from '../domain/raumwerte';
import type { VacuumService } from '../domain/status';
import type { Variante } from '../domain/estimate';
import type { HistoryResponse } from '../domain/timeline';

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

  /** Raumwert am Roboter sofort setzen; `'all'` = alle sieben Räume parallel. Wdh als „2x“, sonst HA-Option aus RV_HA. */
  setRoomValue(room: RoomId | 'all', key: RoomValueKey, value: string): Promise<WriteResult> {
    const ids: readonly RoomId[] = room === 'all' ? ROOM_IDS : [room];
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

  // ───────── Lesen über die REST-API ─────────
  /** Historie von sensor.heidi_phase und vacuum.heidi im Fenster (Sekunden). */
  history(startSec: number, endSec: number): Promise<HistoryResponse> {
    const h = this.hass();
    if (!h.callApi) return Promise.resolve([]);
    return h.callApi<HistoryResponse>('GET', historyPath(new Date(startSec * 1000).toISOString(), new Date(endSec * 1000).toISOString()));
  }
}

/** Optionsstrings, die die API akzeptiert (für Editor-Validierung). */
export const OPTIONS = HA_OPTIONS;
