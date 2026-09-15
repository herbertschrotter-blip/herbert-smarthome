// Selektoren (Bauplan 3.1): aus hass.states typisierte Sichten, memoisiert je Sicht. Fehlende Entitäten und
// unknown/unavailable ergeben typisierte Leerwerte (Regel 9); nie eine Exception, nie undefined ins Template.
// Nur contract.ts kennt IDs; hier werden sie nur benutzt. Sichten dürfen IDs für Bedienelemente mitführen.
import { ENTITIES, PERSONS, PLAN_NUMBERS, ROOM_IDS, ROOM_SELECT_FIELDS, ROOM_VALUE_CODES, allContractIds, planEntity, roomEntity } from './contract';
import type { PlanNumber, RoomId, PersonKey } from './contract';
import { memoizeSelector, stateAndAttributes } from './memo-selector';
import type { Selector } from './memo-selector';
import type { HassEntity, States } from './types';
import { heroModel } from '../domain/status';
import type { HeroModel } from '../domain/status';
import { parseRaum } from '../domain/raumwerte';
import type { RaumMap, RoomValues } from '../domain/raumwerte';
import type { Lernwerte } from '../domain/estimate';
import { roomName } from '../domain/labels';
import { ROOMS } from '../config';

const EMPTY = ['unknown', 'unavailable'];
const E = ENTITIES;

// ───────── Lese-Helfer (wie v1 st/attr/on/num, aber ohne this) ─────────
const ent = (s: States, id: string): HassEntity | undefined => s[id];
/** Zustand oder 'unavailable', wenn die Entität fehlt (wie v1). */
export const st = (s: States, id: string): string => ent(s, id)?.state ?? 'unavailable';
/** Zustand oder '' bei fehlend/unknown/unavailable. */
export const txt = (s: States, id: string): string => { const v = st(s, id); return EMPTY.includes(v) ? '' : v; };
export const on = (s: States, id: string): boolean => st(s, id) === 'on';
export const num = (s: States, id: string, d = 0): number => { const v = parseFloat(st(s, id)); return isNaN(v) ? d : v; };
export const attr = <T = unknown>(s: States, id: string, a: string): T | undefined => ent(s, id)?.attributes?.[a] as T | undefined;
const opts = (s: States, id: string, fallback: readonly string[] = []): string[] => { const o = attr<unknown>(s, id, 'options'); return Array.isArray(o) ? o.map(String) : [...fallback]; };
const available = (s: States, id: string): boolean => { const e = ent(s, id); return !!e && !EMPTY.includes(e.state); };

// ───────── Roboter / Kopf ─────────
export interface PersonView { key: PersonKey; id: string; name: string; home: boolean; counts: boolean; known: boolean }
export interface RobotView {
  vac: string;
  running: boolean;
  hasError: boolean;
  battery: number;
  currentSegment: number | null;
  activeSegments: number[];
  cleaningSequence: number[];
  cleanedArea: number;
  cleaningTime: number;
  charging: boolean;
  phase: string;
  status: string;
  task: string;
  error: string;
  autoLauf: boolean;
  autoLetzterPlan: string;
  laufReihenfolge: number[];
  room: string;
  deutsch: boolean;
  persons: PersonView[];
  hero: HeroModel;
  /** Entitäten für more-info-Dialoge (Regel 1: IDs nur aus dem Vertrag, hier mitgeführt). */
  moreInfo: { vac: string; battery: string; error: string };
}

const VAC_ATTRS = ['has_error', 'current_segment', 'active_segments', 'cleaning_sequence', 'cleaned_area', 'charging', 'mop_pad', 'paused', 'washing', 'drying', 'returning_to_wash', 'mapping', 'cruising'] as const;
const ROBOT_IDS = [E.vac, E.status, E.error, E.taskStatus, E.battery, E.currentRoom, E.cleanedArea, E.cleaningTime, E.phase, E.autoLauf, E.autoLetzterPlan, E.laufReihenfolge, E.dndStart, E.dndEnd, E.raumnamen, E.ninaZaehlt, ...PERSONS.map((p) => p.id)];

const intList = (v: unknown): number[] => (Array.isArray(v) ? v.map((x) => parseInt(String(x), 10)).filter((x) => !isNaN(x)) : []);

export const readRobot: Selector<RobotView> = memoizeSelector(ROBOT_IDS, (s) => {
  const vac = st(s, E.vac);
  const deutsch = st(s, E.raumnamen) === 'Deutsch';
  const seg = parseInt(String(attr(s, E.vac, 'current_segment') ?? ''), 10);
  const persons: PersonView[] = PERSONS.map((p) => {
    const e = ent(s, p.id);
    return { key: p.key, id: p.id, name: p.name, home: e?.state === 'home', counts: !('optional' in p) || on(s, p.optional), known: !!e };
  });
  const hero = heroModel({
    vac, status: st(s, E.status), error: st(s, E.error), hasError: !!attr(s, E.vac, 'has_error'), task: st(s, E.taskStatus), phase: st(s, E.phase),
    autoLauf: on(s, E.autoLauf), autoLetzterPlan: st(s, E.autoLetzterPlan), dndStart: st(s, E.dndStart), dndEnd: st(s, E.dndEnd),
    room: roomName(st(s, E.currentRoom), deutsch),
  });
  return {
    vac, running: ['cleaning', 'paused', 'returning'].includes(vac), hasError: !!attr(s, E.vac, 'has_error'), battery: num(s, E.battery, 0),
    currentSegment: isNaN(seg) ? null : seg, activeSegments: intList(attr(s, E.vac, 'active_segments')), cleaningSequence: intList(attr(s, E.vac, 'cleaning_sequence')),
    cleanedArea: parseFloat(String(attr(s, E.vac, 'cleaned_area') ?? '')) || 0, cleaningTime: num(s, E.cleaningTime, 0), charging: !!attr(s, E.vac, 'charging'),
    phase: st(s, E.phase), status: st(s, E.status), task: st(s, E.taskStatus), error: st(s, E.error),
    autoLauf: on(s, E.autoLauf), autoLetzterPlan: txt(s, E.autoLetzterPlan),
    laufReihenfolge: txt(s, E.laufReihenfolge).split(',').map((x) => parseInt(x, 10)).filter((x) => !isNaN(x)),
    room: roomName(st(s, E.currentRoom), deutsch), deutsch, persons, hero,
    moreInfo: { vac: E.vac, battery: E.battery, error: E.error },
  };
}, { [E.vac]: stateAndAttributes(VAC_ATTRS) });

// ───────── Planer ─────────
export interface PlanView {
  n: PlanNumber; name: string; aktiv: boolean; raeume: number[]; modus: string; saug: string; wasser: string; route: string; wdh: string;
  tage: boolean[]; zeit: string; personen: string[]; ho: string; hoSaug: string; hoWdh: string; schnell: boolean; spSaug: string; spWdh: string; raum: RaumMap;
  /** Vertragsentitäten dieses Eintrags (für Editor/API). */
  entities: Record<string, string>;
}
const PLAN_FIELDS = ['name', 'raeume', 'tage', 'personen', 'raumwerte', 'modus', 'saugstufe', 'wasser', 'route', 'wiederholungen', 'homeoffice', 'ho_saug', 'ho_wdh', 'sp_saug', 'sp_wdh', 'aktiv', 'schnell', 'zeit'] as const;
const planIds = (n: PlanNumber): string[] => PLAN_FIELDS.map((f) => planEntity(n, f));

function makeReadPlan(n: PlanNumber): Selector<PlanView> {
  const id = (f: (typeof PLAN_FIELDS)[number]) => planEntity(n, f);
  return memoizeSelector(planIds(n), (s) => {
    const sel = (f: (typeof PLAN_FIELDS)[number]) => st(s, id(f));
    const tx = (f: (typeof PLAN_FIELDS)[number]) => txt(s, id(f));
    const mask = tx('tage').padEnd(7, '0').slice(0, 7);
    return {
      n, name: tx('name'), aktiv: on(s, id('aktiv')),
      raeume: [...new Set(tx('raeume').split(',').map((x) => parseInt(x, 10)).filter((x) => x >= 1 && x <= 7))],
      modus: sel('modus'), saug: sel('saugstufe'), wasser: sel('wasser'), route: sel('route'), wdh: sel('wiederholungen'),
      tage: [...mask].map((c) => c === '1'), zeit: (txt(s, id('zeit')) || '09:30').slice(0, 5),
      personen: tx('personen').split(',').map((x) => x.trim()).filter(Boolean),
      ho: sel('homeoffice'), hoSaug: sel('ho_saug'), hoWdh: sel('ho_wdh'), schnell: on(s, id('schnell')), spSaug: sel('sp_saug'), spWdh: sel('sp_wdh'),
      raum: parseRaum(tx('raumwerte')),
      entities: Object.fromEntries(PLAN_FIELDS.map((f) => [f, id(f)])),
    };
  });
}
const PLAN_SELECTORS: Record<PlanNumber, Selector<PlanView>> = { 1: makeReadPlan(1), 2: makeReadPlan(2), 3: makeReadPlan(3), 4: makeReadPlan(4) };
export const readPlan = (n: PlanNumber): Selector<PlanView> => PLAN_SELECTORS[n];

export interface PlansView { plans: PlanView[]; heute: PlanNumber | null; heuteName: string; heuteZeit: string; heuteErledigt: boolean; stoerer: string[]; planerBereich: boolean }
export const readPlans: Selector<PlansView> = memoizeSelector([...PLAN_NUMBERS.flatMap(planIds), E.heutePlan, E.planerBereich], (s) => {
  const slot = parseInt(st(s, E.heutePlan), 10);
  const heute = (PLAN_NUMBERS as readonly number[]).includes(slot) ? (slot as PlanNumber) : null;
  const stoerer = attr<unknown>(s, E.heutePlan, 'stoerer');
  return {
    plans: PLAN_NUMBERS.map((n) => PLAN_SELECTORS[n](s)), heute,
    heuteName: String(attr(s, E.heutePlan, 'name') ?? ''), heuteZeit: String(attr(s, E.heutePlan, 'zeit') ?? ''),
    heuteErledigt: attr(s, E.heutePlan, 'erledigt') === true, stoerer: Array.isArray(stoerer) ? stoerer.map(String) : [], planerBereich: on(s, E.planerBereich),
  };
});

// ───────── Raumwerte des Roboters ─────────
const { RV_HA, RV_ENT } = ROOM_VALUE_CODES;
const roomIds = (id: RoomId): string[] => ROOM_SELECT_FIELDS.map((f) => roomEntity(id, f));

/** Werte eines Raums vom Roboter (deutsch); null, wenn der Modus nicht verfügbar ist (wie v1 _roomVals). */
export function roomValuesOf(s: States, id: RoomId): RoomValues | null {
  const g = (k: keyof typeof RV_ENT): string | null => { const v = st(s, roomEntity(id, RV_ENT[k])); return EMPTY.includes(v) ? null : v; };
  const m = g('modus'); if (m === null) return null;
  const saugRaw = g('saug'), wasserRaw = g('wasser'), routeRaw = g('route');
  return {
    modus: (RV_HA.modus as Record<string, string>)[m] as RoomValues['modus'] ?? (m as RoomValues['modus']),
    saug: ((saugRaw && (RV_HA.saug as Record<string, string>)[saugRaw]) || '–') as RoomValues['saug'],
    wasser: wasserRaw ? (((RV_HA.wasser as Record<string, string>)[wasserRaw] ?? wasserRaw) as RoomValues['wasser']) : null,
    route: routeRaw ? (((RV_HA.route as Record<string, string>)[routeRaw] ?? routeRaw) as RoomValues['route']) : null,
    wdh: (g('wdh') ?? '1x').replace('x', '') as RoomValues['wdh'],
  };
}
const ROOM_SELECTORS = Object.fromEntries(ROOM_IDS.map((id) => [id, memoizeSelector(roomIds(id), (s) => roomValuesOf(s, id))])) as Record<RoomId, Selector<RoomValues | null>>;
export const readRoomValues = (id: RoomId): Selector<RoomValues | null> => ROOM_SELECTORS[id];

export interface AllRoomValuesView { rooms: Record<RoomId, RoomValues | null>; customized: boolean; anyUnavailable: boolean }
export const readAllRoomValues: Selector<AllRoomValuesView> = memoizeSelector([...ROOM_IDS.flatMap(roomIds), E.customizedCleaning], (s) => {
  const rooms = Object.fromEntries(ROOM_IDS.map((id) => [id, ROOM_SELECTORS[id](s)])) as Record<RoomId, RoomValues | null>;
  return { rooms, customized: on(s, E.customizedCleaning), anyUnavailable: ROOM_IDS.some((id) => rooms[id] === null) };
});

// ───────── Lernwerte ─────────
export const readLearn: Selector<Lernwerte | null> = memoizeSelector([E.lern], (s) => {
  const e = ent(s, E.lern);
  return e && !EMPTY.includes(e.state) && e.attributes?.raten ? (e.attributes as unknown as Lernwerte) : null;
});

// ───────── Protokoll (Modul-Cache: letzter gültiger Stand bleibt) ─────────
export interface HistoryEntry { key: string; ts: number; area: number; min: number; raw: Record<string, unknown> }
export interface HistoryView { entries: HistoryEntry[]; count: number; totalArea: number; totalTime: number; stale: boolean }
let histCache: Record<string, unknown> = {};
const histOk = (e: HassEntity | undefined): boolean => !!e && !EMPTY.includes(e.state) && Object.values(e.attributes ?? {}).some((v) => v && typeof v === 'object' && 'timestamp' in (v as object));
export const readHistory: Selector<HistoryView> = memoizeSelector([E.cleaningHistory, E.cleaningCount, E.totalCleanedArea, E.totalCleaningTime], (s) => {
  const live = ent(s, E.cleaningHistory);
  const ok = histOk(live);
  if (ok && live) histCache = live.attributes;
  const a = ok && live ? live.attributes : histCache;
  const entries = Object.entries(a)
    .filter(([, v]) => v && typeof v === 'object' && 'timestamp' in (v as object))
    .map(([, v]) => v as Record<string, unknown>)
    .sort((x, y) => Number(y.timestamp) - Number(x.timestamp))
    .slice(0, 30)
    .map((v) => ({ key: String(Math.floor(Number(v.timestamp))), ts: Math.floor(Number(v.timestamp)), area: parseInt(String(v.cleaned_area ?? '').replace(/[^0-9]/g, ''), 10) || 0, min: parseInt(String(v.cleaning_time ?? '').replace(/[^0-9]/g, ''), 10) || 0, raw: v }));
  return { entries, count: num(s, E.cleaningCount, 0), totalArea: num(s, E.totalCleanedArea, 0), totalTime: num(s, E.totalCleaningTime, 0), stale: !ok };
});
/** Nur für Tests. */
export const resetHistoryCache = (): void => { histCache = {}; readHistory.reset(); };

// ───────── Prognose ─────────
export interface PrognoseView {
  aktiv: boolean; known: boolean; state: string; tage: number; sicherheit: number; freiesFenster: string; rueckkehr: string; rueckkehrWer: string; rueckkehrMin: number;
  homeoffice: string; empfehlung: string; aktualisiert: string; aufloesung: string; wochen: number; mindesttage: number;
  schalter: { id: string; label: string; sub: string; on: boolean }[];
}
export const readPrognose: Selector<PrognoseView> = memoizeSelector([E.prognose, E.prognoseAktiv, E.abweichungHeute, E.progHerbert, E.progNicole, E.progNina, E.prognoseWochen, E.prognoseMindesttage], (s) => {
  const p = ent(s, E.prognose); const a = (p?.attributes ?? {}) as Record<string, unknown>;
  const str = (k: string, d = '') => (a[k] === undefined || a[k] === null ? d : String(a[k]));
  return {
    aktiv: on(s, E.prognoseAktiv), known: !!p, state: p?.state ?? '–', tage: parseInt(str('tage', '0'), 10) || 0, sicherheit: parseInt(str('sicherheit', '0'), 10) || 0,
    freiesFenster: str('freies_fenster', '–'), rueckkehr: str('rueckkehr', '–'), rueckkehrWer: str('rueckkehr_wer', ''), rueckkehrMin: parseInt(str('rueckkehr_min', '0'), 10) || 0,
    homeoffice: str('homeoffice', '–'), empfehlung: str('empfehlung', '–'), aktualisiert: str('aktualisiert', '–'), aufloesung: str('aufloesung', '30'),
    wochen: num(s, E.prognoseWochen, 8), mindesttage: num(s, E.prognoseMindesttage, 14),
    schalter: [
      { id: E.abweichungHeute, label: 'Abweichung heute', sub: 'Urlaub, Feiertag', on: on(s, E.abweichungHeute) },
      { id: E.progHerbert, label: 'Herbert einbeziehen', sub: 'GPS + WLAN', on: on(s, E.progHerbert) },
      { id: E.progNicole, label: 'Nicole einbeziehen', sub: 'WLAN', on: on(s, E.progNicole) },
      { id: E.progNina, label: 'Nina einbeziehen', sub: 'WLAN', on: on(s, E.progNina) },
    ],
  };
});

// ───────── Automatik ─────────
export interface AutomatikView {
  on: boolean; status: string; detail: string; restMin: number | null; restQuelle: string; arbeitszeitStart: string; arbeitszeitEnde: string; rueckkehr: string;
  schnellMinuten: number; minAkku: number; beiHeimkehr: string; beiHeimkehrOptions: string[]; letzterPlan: string; letzteAutoReinigung: string;
}
export const readAutomatik: Selector<AutomatikView> = memoizeSelector([E.automatik, E.autoStatus, E.arbeitszeitStart, E.arbeitszeitEnde, E.rueckkehr, E.schnellMinuten, E.minAkku, E.beiHeimkehr, E.autoLetzterPlan, E.letzteAutoReinigung], (s) => {
  const rest = attr<unknown>(s, E.autoStatus, 'rest_min');
  const letzte = st(s, E.letzteAutoReinigung);
  return {
    on: on(s, E.automatik), status: txt(s, E.autoStatus), detail: String(attr(s, E.autoStatus, 'detail') ?? ''),
    restMin: typeof rest === 'number' ? rest : (rest !== undefined && !isNaN(parseInt(String(rest), 10)) ? parseInt(String(rest), 10) : null),
    restQuelle: String(attr(s, E.autoStatus, 'rest_quelle') ?? ''),
    arbeitszeitStart: txt(s, E.arbeitszeitStart).slice(0, 5), arbeitszeitEnde: txt(s, E.arbeitszeitEnde).slice(0, 5), rueckkehr: txt(s, E.rueckkehr).slice(0, 5),
    schnellMinuten: num(s, E.schnellMinuten, 90), minAkku: num(s, E.minAkku, 30), beiHeimkehr: txt(s, E.beiHeimkehr), beiHeimkehrOptions: opts(s, E.beiHeimkehr),
    letzterPlan: txt(s, E.autoLetzterPlan) || '–', letzteAutoReinigung: !letzte || EMPTY.includes(letzte) || letzte.startsWith('2000') ? 'noch nie' : letzte,
  };
});

// ───────── Verschleiß und Station ─────────
export interface ConsumableView { name: string; pct: number; level: 'danger' | 'warning' | 'ok'; resetEntity: string; known: boolean }
const CONSUMABLES = [
  ['Hauptbürste', E.mainBrushLeft, E.resetMainBrush], ['Seitenbürste', E.sideBrushLeft, E.resetSideBrush], ['Filter', E.filterLeft, E.resetFilter],
  ['Sensoren', E.sensorDirtyLeft, E.resetSensor], ['Räder', E.wheelDirtyLeft, E.resetWheel],
] as const;
export const readConsumables: Selector<ConsumableView[]> = memoizeSelector(CONSUMABLES.flatMap(([, s, b]) => [s, b]), (s) =>
  CONSUMABLES.map(([name, sensor, reset]) => { const pct = num(s, sensor, 0); return { name, pct, level: pct <= 10 ? 'danger' as const : pct <= 25 ? 'warning' as const : 'ok' as const, resetEntity: reset, known: available(s, sensor) }; }));

export interface StationView {
  tiles: { key: string; label: string; value: string; warn: boolean }[];
  buttons: { entity: string; label: string; confirm: string | null }[];
  ok: boolean;
}
export const readStation: Selector<StationView> = memoizeSelector([E.dustBagStatus, E.cleanWaterTankStatus, E.dirtyWaterTankStatus, E.detergentStatus, E.lowWaterWarning, E.startAutoEmpty, E.selfClean, E.manualDrying, E.baseStationCleaning], (s) => {
  const inst = (id: string) => st(s, id) === 'installed';
  const lowWater = st(s, E.lowWaterWarning) !== 'no_warning';
  const tiles = [
    { key: 'beutel', label: 'Beutel', value: inst(E.dustBagStatus) ? 'OK' : 'Prüfen', warn: !inst(E.dustBagStatus) },
    { key: 'frisch', label: 'Frisch', value: lowWater ? 'Leer' : inst(E.cleanWaterTankStatus) ? 'OK' : 'Fehlt', warn: lowWater || !inst(E.cleanWaterTankStatus) },
    { key: 'abwasser', label: 'Abwasser', value: inst(E.dirtyWaterTankStatus) ? 'OK' : 'Voll', warn: !inst(E.dirtyWaterTankStatus) },
    { key: 'mittel', label: 'Mittel', value: inst(E.detergentStatus) ? 'OK' : 'Leer', warn: !inst(E.detergentStatus) },
  ];
  return {
    tiles, ok: tiles.every((t) => !t.warn),
    buttons: [
      { entity: E.startAutoEmpty, label: 'Absaugen', confirm: null }, { entity: E.selfClean, label: 'Mopp', confirm: null },
      { entity: E.manualDrying, label: 'Trocknen', confirm: null }, { entity: E.baseStationCleaning, label: 'Station', confirm: 'Reinigung der Station starten?' },
    ],
  };
});

// ───────── Einstellungen (Dashboard + Roboter) ─────────
export interface SegView { id: string; value: string; options: string[]; labels: string[] }
export interface SwitchView { id: string; label: string; sub: string; on: boolean }
export interface RangeView { id: string; label: string; sub: string; unit: string; value: number; min: number; max: number; step: number }
export interface SettingsView {
  dark: boolean; darkId: string; karte: SegView; rotation: SegView; raumnamen: SegView; schalter: SwitchView[]; prognose: RangeView[]; version: string;
}
const rng = (s: States, id: string, label: string, unit: string, sub: string, dMin: number, dMax: number, dStep: number): RangeView => {
  const a = (ent(s, id)?.attributes ?? {}) as Record<string, unknown>;
  const n = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
  return { id, label, sub, unit, value: num(s, id, n(a.min, dMin)), min: n(a.min, dMin), max: n(a.max, dMax), step: n(a.step, dStep) };
};
const ROT_DEFAULT = ['0', '90', '180', '270'];
export const readSettings: Selector<SettingsView> = memoizeSelector([E.dark, E.karte, E.mapRotation, E.raumnamen, E.automatik, E.planerBereich, E.prognoseAktiv, E.ninaZaehlt, E.prognoseIntervall, E.prognoseAufloesung, E.prognoseWochen, E.prognoseHalbwert, E.prognoseMindesttage], (s) => {
  const rotOpts = opts(s, E.mapRotation, ROT_DEFAULT);
  return {
    dark: st(s, E.dark) !== 'off', darkId: E.dark,
    karte: { id: E.karte, value: st(s, E.karte), options: opts(s, E.karte), labels: opts(s, E.karte) },
    rotation: { id: E.mapRotation, value: st(s, E.mapRotation), options: rotOpts, labels: rotOpts.map((x) => x + '°') },
    raumnamen: { id: E.raumnamen, value: st(s, E.raumnamen), options: opts(s, E.raumnamen, ['Original', 'Deutsch']), labels: opts(s, E.raumnamen, ['Original', 'Deutsch']) },
    schalter: [
      { id: E.automatik, label: 'Automatik', sub: '', on: on(s, E.automatik) },
      { id: E.planerBereich, label: 'Planer anzeigen', sub: '', on: on(s, E.planerBereich) },
      { id: E.prognoseAktiv, label: 'Prognose', sub: 'Lernende Anwesenheit, eigene Seite', on: on(s, E.prognoseAktiv) },
      { id: E.ninaZaehlt, label: 'Nina zählt für Anwesenheit', sub: '', on: on(s, E.ninaZaehlt) },
    ],
    prognose: [
      rng(s, E.prognoseIntervall, 'Protokoll-Intervall', ' min', 'Wie oft die Anwesenheit gespeichert wird', 5, 60, 5),
      rng(s, E.prognoseAufloesung, 'Auflösung', ' min', 'Rasterbreite der Heatmap und Prognose', 15, 60, 15),
      rng(s, E.prognoseWochen, 'Lernzeitraum', ' Wochen', 'Ältere Daten werden verworfen', 2, 12, 1),
      rng(s, E.prognoseHalbwert, 'Gewichtung', ' Tage', 'Halbwertszeit – so alt zählt ein Tag nur noch halb', 7, 60, 1),
      rng(s, E.prognoseMindesttage, 'Aktiv ab', ' Tagen', 'Erst dann nutzt die Automatik die Prognose', 3, 28, 1),
    ],
    version: '',
  };
});

export interface RobotSettingsView { selects: { id: string; label: string; value: string; options: string[] }[]; numbers: RangeView[]; dndStart: string; dndEnd: string; dndStartId: string; dndEndId: string }
export const readRobotSettings: Selector<RobotSettingsView> = memoizeSelector([E.carpetCleaning, E.waterTemperature, E.dryingTime, E.autoEmptyMode, E.selfCleanFrequency, E.cleangenius, E.selfCleanArea, E.volume, E.dndStart, E.dndEnd], (s) => {
  const sel = (id: string, label: string) => ({ id, label, value: st(s, id), options: opts(s, id) });
  return {
    selects: [sel(E.carpetCleaning, 'Teppich'), sel(E.waterTemperature, 'Wassertemperatur'), sel(E.dryingTime, 'Trocknung'), sel(E.autoEmptyMode, 'Absaugen'), sel(E.selfCleanFrequency, 'Mopp-Wäsche'), sel(E.cleangenius, 'CleanGenius')],
    numbers: [rng(s, E.selfCleanArea, 'Mopp-Wäsche nach', ' m²', '', 0, 100, 1), rng(s, E.volume, 'Lautstärke', ' %', '', 0, 100, 1)],
    dndStart: txt(s, E.dndStart).slice(0, 5), dndEnd: txt(s, E.dndEnd).slice(0, 5), dndStartId: E.dndStart, dndEndId: E.dndEnd,
  };
});

// ───────── Karte (Attribute für dx-map-card / Sperrzonen) ─────────
export interface MapView { entityPicture: string; calibrationPoints: unknown; noGoAreas: unknown; noMoppingAreas: unknown; virtualWalls: unknown; rooms: unknown; karte: string; chairs: boolean; roomOrder: typeof ROOMS }
export const readMap: Selector<MapView> = memoizeSelector([E.map, E.karte, E.chairs], (s) => ({
  entityPicture: String(attr(s, E.map, 'entity_picture') ?? ''), calibrationPoints: attr(s, E.map, 'calibration_points') ?? null,
  noGoAreas: attr(s, E.map, 'no_go_areas') ?? null, noMoppingAreas: attr(s, E.map, 'no_mopping_areas') ?? null, virtualWalls: attr(s, E.map, 'virtual_walls') ?? null,
  rooms: attr(s, E.map, 'rooms') ?? null, karte: st(s, E.karte), chairs: on(s, E.chairs), roomOrder: ROOMS,
}), { [E.map]: stateAndAttributes(['entity_picture', 'calibration_points', 'no_go_areas', 'no_mopping_areas', 'virtual_walls', 'rooms']) });

// ───────── Diagnose ─────────
export interface DiagnosticsView { total: number; missing: string[]; unavailable: string[]; groups: { name: string; total: number; missing: string[]; unavailable: string[] }[] }
const isRobotId = (id: string): boolean => /^(vacuum|camera|switch|button|select\.heidi_(room_|carpet|water|drying|auto_empty|self_clean|cleangenius|map_rotation)|number|time)\./.test(id) || /^sensor\.heidi_(status|error|task_status|battery_level|current_room|cleaned_area|cleaning_time|cleaning_history|cleaning_count|total_|first_cleaning|main_brush|side_brush|filter_left|sensor_dirty|wheel_dirty|dust_bag|clean_water|dirty_water|detergent|low_water|auto_empty|self_wash)/.test(id);
export const readDiagnostics: Selector<DiagnosticsView> = memoizeSelector(allContractIds(), (s) => {
  const ids = allContractIds();
  const group = (name: string, list: string[]) => ({ name, total: list.length, missing: list.filter((id) => !s[id]), unavailable: list.filter((id) => s[id] && EMPTY.includes(s[id]!.state)) });
  const robot = group('Roboter (Dreame)', ids.filter(isRobotId));
  const paket = group('Paket (Helfer, Sensoren)', ids.filter((id) => !isRobotId(id)));
  return { total: ids.length, missing: [...robot.missing, ...paket.missing], unavailable: [...robot.unavailable, ...paket.unavailable], groups: [robot, paket] };
});

/** Alle Selektoren (für Tests: ids-Abdeckung, reset). */
export const ALL_SELECTORS: Record<string, Selector<unknown>> = {
  readRobot, readPlans, readAllRoomValues, readLearn, readHistory, readPrognose, readAutomatik, readConsumables, readStation, readSettings, readRobotSettings, readMap, readDiagnostics,
  ...Object.fromEntries(PLAN_NUMBERS.map((n) => [`readPlan(${n})`, PLAN_SELECTORS[n]])),
  ...Object.fromEntries(ROOM_IDS.map((id) => [`readRoomValues(${id})`, ROOM_SELECTORS[id]])),
};
