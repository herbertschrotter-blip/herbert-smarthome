// Selektoren (Bauplan 3.1): aus hass.states typisierte Sichten, memoisiert je Sicht. Fehlende Entitäten und
// unknown/unavailable ergeben typisierte Leerwerte (Regel 9); nie eine Exception, nie undefined ins Template.
// Nur contract.ts kennt IDs; hier werden sie nur benutzt. Sichten dürfen IDs für Bedienelemente mitführen.
import { ENTITIES, PERSONS, PLAN_NUMBERS, ROOM_SELECT_FIELDS, ROOM_VALUE_CODES, allContractIds, planEntity, roomEntity, robotIds } from './contract';
import { profileIds, readProfile } from './profile';
import type { RoomInfo } from '../domain/rooms';
import { deviceName } from './device';
import type { PlanNumber, RoomId, PersonKey } from './contract';
import { memoizeSelector, sameValue, stateAndAttributes } from './memo-selector';
import type { Selector } from './memo-selector';
import type { HassEntity, States } from './types';
import { heroModel } from '../domain/status';
import type { HeroModel } from '../domain/status';
import { parseRaum } from '../domain/raumwerte';
import type { RaumMap, RoomValues } from '../domain/raumwerte';
import type { Lernwerte } from '../domain/estimate';
import { roomName } from '../domain/labels';
import { t } from '../i18n/t';

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
  /** Attribute docked/washing/drying von vacuum.heidi: in der Station kann der Hauptzustand noch „cleaning“ sein (Mopp-Wäsche nach dem Lauf). */
  docked: boolean;
  washing: boolean;
  drying: boolean;
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

const VAC_ATTRS = ['has_error', 'current_segment', 'active_segments', 'cleaning_sequence', 'cleaned_area', 'charging', 'docked', 'mop_pad', 'paused', 'washing', 'drying', 'returning_to_wash', 'mapping', 'cruising'] as const;
const ROBOT_IDS = (): string[] => [E.vac, E.status, E.error, E.taskStatus, E.battery, E.currentRoom, E.cleanedArea, E.cleaningTime, E.phase, E.autoLauf, E.autoLetzterPlan, E.laufReihenfolge, E.dndStart, E.dndEnd, E.raumnamen, E.ninaZaehlt, ...PERSONS.map((p) => p.id)];

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
    docked: !!attr(s, E.vac, 'docked'), washing: !!attr(s, E.vac, 'washing'), drying: !!attr(s, E.vac, 'drying'),
    phase: st(s, E.phase), status: st(s, E.status), task: st(s, E.taskStatus), error: st(s, E.error),
    autoLauf: on(s, E.autoLauf), autoLetzterPlan: txt(s, E.autoLetzterPlan),
    laufReihenfolge: txt(s, E.laufReihenfolge).split(',').map((x) => parseInt(x, 10)).filter((x) => !isNaN(x)),
    room: roomName(st(s, E.currentRoom), deutsch), deutsch, persons, hero,
    moreInfo: { vac: E.vac, battery: E.battery, error: E.error },
  };
}, () => ({ [E.vac]: stateAndAttributes(VAC_ATTRS) }));

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
  return memoizeSelector(() => planIds(n), (s) => {
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
export const readPlans: Selector<PlansView> = memoizeSelector(() => [...PLAN_NUMBERS.flatMap(planIds), E.heutePlan, E.planerBereich], (s) => {
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
const roomSelectIds = (id: RoomId): string[] => ROOM_SELECT_FIELDS.map((f) => roomEntity(id, f));

/** Zahlencodes der Kartendaten (camera.heidi_map, Attribut rooms) → HA-Optionen der Selects (wie Automation heidi_laufprotokoll). */
const MAP_CODES = {
  modus: { 0: 'sweeping', 1: 'mopping', 2: 'sweeping_and_mopping', 3: 'mopping_after_sweeping' } as Record<number, string>,
  saug: { 0: 'quiet', 1: 'standard', 2: 'strong', 3: 'turbo' } as Record<number, string>,
  wasser: { 1: 'slightly_dry', 2: 'moist', 3: 'wet' } as Record<number, string>,
  route: { 1: 'standard', 2: 'intensive', 3: 'deep' } as Record<number, string>,
};
/** Nur das Attribut `rooms` der Karte zählt (der Kamerazustand ändert sich mit jedem Bild). */
const mapRoomsOnly = (a: HassEntity | undefined, b: HassEntity | undefined): boolean => sameValue(a?.attributes?.rooms, b?.attributes?.rooms);

/**
 * Rückfall (PD-010): Während eines Laufs sind Modus-Select und Schalter „angepasste Reinigung“ unavailable;
 * die Kartendaten des Roboters führen dieselben Werte je Raum als Zahlencodes.
 */
function roomValuesFromMap(s: States, id: RoomId): RoomValues | null {
  const rooms = attr<Record<string, Record<string, unknown>>>(s, E.map, 'rooms');
  const r = rooms && typeof rooms === 'object' ? rooms[String(id)] : undefined;
  if (!r || typeof r !== 'object') return null;
  const code = (k: keyof typeof MAP_CODES, field: string): string | null => { const v = r[field]; return typeof v === 'number' ? (MAP_CODES[k][v] ?? null) : null; };
  const m = code('modus', 'cleaning_mode'); if (m === null) return null;
  const saugRaw = code('saug', 'suction_level'), wasserRaw = code('wasser', 'water_volume'), routeRaw = code('route', 'cleaning_route');
  const times = r.cleaning_times;
  return {
    modus: ((RV_HA.modus as Record<string, string>)[m] ?? m) as RoomValues['modus'],
    saug: ((saugRaw && (RV_HA.saug as Record<string, string>)[saugRaw]) || '–') as RoomValues['saug'],
    wasser: wasserRaw ? (((RV_HA.wasser as Record<string, string>)[wasserRaw] ?? wasserRaw) as RoomValues['wasser']) : null,
    route: routeRaw ? (((RV_HA.route as Record<string, string>)[routeRaw] ?? routeRaw) as RoomValues['route']) : null,
    wdh: (typeof times === 'number' && times >= 1 && times <= 3 ? String(times) : '1') as RoomValues['wdh'],
  };
}

/** Werte eines Raums vom Roboter (deutsch); zuerst die Selects (wie v1 _roomVals), sonst die Kartendaten (PD-010); null ohne beides. */
export function roomValuesOf(s: States, id: RoomId): RoomValues | null {
  const g = (k: keyof typeof RV_ENT): string | null => { const v = st(s, roomEntity(id, RV_ENT[k])); return EMPTY.includes(v) ? null : v; };
  const m = g('modus'); if (m === null) return roomValuesFromMap(s, id);
  const saugRaw = g('saug'), wasserRaw = g('wasser'), routeRaw = g('route');
  return {
    modus: (RV_HA.modus as Record<string, string>)[m] as RoomValues['modus'] ?? (m as RoomValues['modus']),
    saug: ((saugRaw && (RV_HA.saug as Record<string, string>)[saugRaw]) || '–') as RoomValues['saug'],
    wasser: wasserRaw ? (((RV_HA.wasser as Record<string, string>)[wasserRaw] ?? wasserRaw) as RoomValues['wasser']) : null,
    route: routeRaw ? (((RV_HA.route as Record<string, string>)[routeRaw] ?? routeRaw) as RoomValues['route']) : null,
    wdh: (g('wdh') ?? '1x').replace('x', '') as RoomValues['wdh'],
  };
}
const ROOM_SELECTORS = new Map<number, Selector<RoomValues | null>>();
/** Raumwerte eines Raums; Selektor je ID wird beim ersten Zugriff angelegt (Räume kommen aus der Karte, beliebig viele). */
export const readRoomValues = (id: RoomId): Selector<RoomValues | null> => {
  let sel = ROOM_SELECTORS.get(id);
  if (!sel) { sel = memoizeSelector(() => [...roomSelectIds(id), E.map], (s) => roomValuesOf(s, id), () => ({ [E.map]: mapRoomsOnly })); ROOM_SELECTORS.set(id, sel); }
  return sel;
};

export interface AllRoomValuesView {
  rooms: Record<RoomId, RoomValues | null>;
  customized: boolean;
  /** Mindestens ein Raum ohne Werte (weder Selects noch Kartendaten) */
  anyUnavailable: boolean;
  /** Räume, deren Werte aus den Kartendaten kommen (Selects unavailable, PD-010) – dort ist Schreiben nicht möglich */
  vonKarte: RoomId[];
}
export const readAllRoomValues: Selector<AllRoomValuesView> = memoizeSelector((s) => [...profileIds(s), ...readProfile(s).roomIds.flatMap(roomSelectIds), E.customizedCleaning], (s) => {
  const ids = readProfile(s).roomIds;
  const rooms = Object.fromEntries(ids.map((id) => [id, readRoomValues(id)(s)])) as Record<RoomId, RoomValues | null>;
  const vonKarte = ids.filter((id) => rooms[id] !== null && EMPTY.includes(st(s, roomEntity(id, RV_ENT.modus))));
  return { rooms, customized: on(s, E.customizedCleaning), anyUnavailable: ids.some((id) => rooms[id] === null), vonKarte };
}, () => ({ [E.map]: mapRoomsOnly }));

// ───────── Lernwerte ─────────
export const readLearn: Selector<Lernwerte | null> = memoizeSelector(() => [E.lern], (s) => {
  const e = ent(s, E.lern);
  return e && !EMPTY.includes(e.state) && e.attributes?.raten ? (e.attributes as unknown as Lernwerte) : null;
});

// ───────── Protokoll (Modul-Cache: letzter gültiger Stand bleibt) ─────────
export interface HistoryEntry { key: string; ts: number; area: number; min: number; raw: Record<string, unknown> }
export interface HistoryView { entries: HistoryEntry[]; count: number; totalArea: number; totalTime: number; stale: boolean }
let histCache: Record<string, unknown> = {};
const histOk = (e: HassEntity | undefined): boolean => !!e && !EMPTY.includes(e.state) && Object.values(e.attributes ?? {}).some((v) => v && typeof v === 'object' && 'timestamp' in (v as object));
export const readHistory: Selector<HistoryView> = memoizeSelector(() => [E.cleaningHistory, E.cleaningCount, E.totalCleanedArea, E.totalCleaningTime], (s) => {
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
export const readPrognose: Selector<PrognoseView> = memoizeSelector(() => [E.prognose, E.prognoseAktiv, E.abweichungHeute, E.progHerbert, E.progNicole, E.progNina, E.prognoseWochen, E.prognoseMindesttage], (s) => {
  const p = ent(s, E.prognose); const a = (p?.attributes ?? {}) as Record<string, unknown>;
  const str = (k: string, d = '') => (a[k] === undefined || a[k] === null ? d : String(a[k]));
  return {
    aktiv: on(s, E.prognoseAktiv), known: !!p, state: p?.state ?? '–', tage: parseInt(str('tage', '0'), 10) || 0, sicherheit: parseInt(str('sicherheit', '0'), 10) || 0,
    freiesFenster: str('freies_fenster', '–'), rueckkehr: str('rueckkehr', '–'), rueckkehrWer: str('rueckkehr_wer', ''), rueckkehrMin: parseInt(str('rueckkehr_min', '0'), 10) || 0,
    homeoffice: str('homeoffice', '–'), empfehlung: str('empfehlung', '–'), aktualisiert: str('aktualisiert', '–'), aufloesung: str('aufloesung', '30'),
    wochen: num(s, E.prognoseWochen, 8), mindesttage: num(s, E.prognoseMindesttage, 14),
    schalter: [
      { id: E.abweichungHeute, label: t('prognose.deviation'), sub: t('prognose.deviationSub'), on: on(s, E.abweichungHeute) },
      { id: E.progHerbert, label: t('prognose.include', { name: PERSONS[0].name }), sub: t('prognose.gpsWlan'), on: on(s, E.progHerbert) },
      { id: E.progNicole, label: t('prognose.include', { name: PERSONS[1].name }), sub: t('prognose.wlan'), on: on(s, E.progNicole) },
      { id: E.progNina, label: t('prognose.include', { name: PERSONS[2].name }), sub: t('prognose.wlan'), on: on(s, E.progNina) },
    ],
  };
});

// ───────── Automatik ─────────
export interface AutomatikView {
  on: boolean; status: string; detail: string; restMin: number | null; restQuelle: string; arbeitszeitStart: string; arbeitszeitEnde: string; rueckkehr: string;
  schnellMinuten: number; minAkku: number; beiHeimkehr: string; beiHeimkehrOptions: string[]; letzterPlan: string; letzteAutoReinigung: string;
}
export const readAutomatik: Selector<AutomatikView> = memoizeSelector(() => [E.automatik, E.autoStatus, E.arbeitszeitStart, E.arbeitszeitEnde, E.rueckkehr, E.schnellMinuten, E.minAkku, E.beiHeimkehr, E.autoLetzterPlan, E.letzteAutoReinigung], (s) => {
  const rest = attr<unknown>(s, E.autoStatus, 'rest_min');
  const letzte = st(s, E.letzteAutoReinigung);
  return {
    on: on(s, E.automatik), status: txt(s, E.autoStatus), detail: String(attr(s, E.autoStatus, 'detail') ?? ''),
    restMin: typeof rest === 'number' ? rest : (rest !== undefined && !isNaN(parseInt(String(rest), 10)) ? parseInt(String(rest), 10) : null),
    restQuelle: String(attr(s, E.autoStatus, 'rest_quelle') ?? ''),
    arbeitszeitStart: txt(s, E.arbeitszeitStart).slice(0, 5), arbeitszeitEnde: txt(s, E.arbeitszeitEnde).slice(0, 5), rueckkehr: txt(s, E.rueckkehr).slice(0, 5),
    schnellMinuten: num(s, E.schnellMinuten, 90), minAkku: num(s, E.minAkku, 30), beiHeimkehr: txt(s, E.beiHeimkehr), beiHeimkehrOptions: opts(s, E.beiHeimkehr),
    letzterPlan: txt(s, E.autoLetzterPlan) || t('common.dash'), letzteAutoReinigung: !letzte || EMPTY.includes(letzte) || letzte.startsWith('2000') ? t('automatik.never') : letzte,
  };
});

// ───────── Verschleiß und Station ─────────
export interface ConsumableView { name: string; pct: number; level: 'danger' | 'warning' | 'ok'; resetEntity: string; known: boolean }
const CONSUMABLES = (): readonly (readonly [string, string, string])[] => [
  [t('consumable.mainBrush'), E.mainBrushLeft, E.resetMainBrush], [t('consumable.sideBrush'), E.sideBrushLeft, E.resetSideBrush], [t('consumable.filter'), E.filterLeft, E.resetFilter],
  [t('consumable.sensor'), E.sensorDirtyLeft, E.resetSensor], [t('consumable.wheel'), E.wheelDirtyLeft, E.resetWheel],
];
export const readConsumables: Selector<ConsumableView[]> = memoizeSelector(() => CONSUMABLES().flatMap(([, s, b]) => [s, b]), (s) =>
  CONSUMABLES().map(([name, sensor, reset]) => { const pct = num(s, sensor, 0); return { name, pct, level: pct <= 10 ? 'danger' as const : pct <= 25 ? 'warning' as const : 'ok' as const, resetEntity: reset, known: available(s, sensor) }; }));

export interface StationView {
  tiles: { key: string; label: string; value: string; warn: boolean }[];
  buttons: { entity: string; label: string; confirm: string | null }[];
  ok: boolean;
}
export const readStation: Selector<StationView> = memoizeSelector(() => [E.dustBagStatus, E.cleanWaterTankStatus, E.dirtyWaterTankStatus, E.detergentStatus, E.lowWaterWarning, E.startAutoEmpty, E.selfClean, E.manualDrying, E.baseStationCleaning], (s) => {
  const inst = (id: string) => st(s, id) === 'installed';
  const lowWater = st(s, E.lowWaterWarning) !== 'no_warning';
  const tiles = [
    { key: 'beutel', label: t('station.bag'), value: inst(E.dustBagStatus) ? t('station.ok') : t('station.check'), warn: !inst(E.dustBagStatus) },
    { key: 'frisch', label: t('station.fresh'), value: lowWater ? t('station.empty') : inst(E.cleanWaterTankStatus) ? t('station.ok') : t('station.missing'), warn: lowWater || !inst(E.cleanWaterTankStatus) },
    { key: 'abwasser', label: t('station.dirty'), value: inst(E.dirtyWaterTankStatus) ? t('station.ok') : t('station.full'), warn: !inst(E.dirtyWaterTankStatus) },
    { key: 'mittel', label: t('station.detergent'), value: inst(E.detergentStatus) ? t('station.ok') : t('station.empty'), warn: !inst(E.detergentStatus) },
  ];
  return {
    tiles, ok: tiles.every((x) => !x.warn),
    buttons: [
      { entity: E.startAutoEmpty, label: t('station.autoEmpty'), confirm: null }, { entity: E.selfClean, label: t('station.mop'), confirm: null },
      { entity: E.manualDrying, label: t('station.dry'), confirm: null }, { entity: E.baseStationCleaning, label: t('station.clean'), confirm: t('station.cleanConfirm') },
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
export const readSettings: Selector<SettingsView> = memoizeSelector(() => [E.dark, E.karte, E.mapRotation, E.raumnamen, E.automatik, E.planerBereich, E.prognoseAktiv, E.ninaZaehlt, E.prognoseIntervall, E.prognoseAufloesung, E.prognoseWochen, E.prognoseHalbwert, E.prognoseMindesttage], (s) => {
  const rotOpts = opts(s, E.mapRotation, ROT_DEFAULT);
  return {
    dark: st(s, E.dark) !== 'off', darkId: E.dark,
    karte: { id: E.karte, value: st(s, E.karte), options: opts(s, E.karte), labels: opts(s, E.karte) },
    rotation: { id: E.mapRotation, value: st(s, E.mapRotation), options: rotOpts, labels: rotOpts.map((x) => x + '°') },
    raumnamen: { id: E.raumnamen, value: st(s, E.raumnamen), options: opts(s, E.raumnamen, ['Original', 'Deutsch']), labels: opts(s, E.raumnamen, ['Original', 'Deutsch']) },
    schalter: [
      { id: E.automatik, label: t('settings.automatik'), sub: '', on: on(s, E.automatik) },
      { id: E.planerBereich, label: t('settings.planer'), sub: '', on: on(s, E.planerBereich) },
      { id: E.prognoseAktiv, label: t('settings.prognose'), sub: t('settings.prognoseSub'), on: on(s, E.prognoseAktiv) },
      { id: E.ninaZaehlt, label: t('settings.nina'), sub: '', on: on(s, E.ninaZaehlt) },
    ],
    prognose: [
      rng(s, E.prognoseIntervall, t('settings.interval'), t('settings.unitMin'), t('settings.intervalSub'), 5, 60, 5),
      rng(s, E.prognoseAufloesung, t('settings.resolution'), t('settings.unitMin'), t('settings.resolutionSub'), 15, 60, 15),
      rng(s, E.prognoseWochen, t('settings.weeks'), t('settings.unitWeeks'), t('settings.weeksSub'), 2, 12, 1),
      rng(s, E.prognoseHalbwert, t('settings.halflife'), t('settings.unitDays'), t('settings.halflifeSub'), 7, 60, 1),
      rng(s, E.prognoseMindesttage, t('settings.minDays'), t('settings.unitDaysFrom'), t('settings.minDaysSub'), 3, 28, 1),
    ],
    version: '',
  };
});

export interface RobotSettingsView { selects: { id: string; label: string; value: string; options: string[] }[]; numbers: RangeView[]; dndStart: string; dndEnd: string; dndStartId: string; dndEndId: string }
export const readRobotSettings: Selector<RobotSettingsView> = memoizeSelector(() => [E.carpetCleaning, E.waterTemperature, E.dryingTime, E.autoEmptyMode, E.selfCleanFrequency, E.cleangenius, E.selfCleanArea, E.volume, E.dndStart, E.dndEnd], (s) => {
  const sel = (id: string, label: string) => ({ id, label, value: st(s, id), options: opts(s, id) });
  return {
    selects: [sel(E.carpetCleaning, t('robotsettings.carpet')), sel(E.waterTemperature, t('robotsettings.waterTemp')), sel(E.dryingTime, t('robotsettings.drying')), sel(E.autoEmptyMode, t('robotsettings.autoEmpty')), sel(E.selfCleanFrequency, t('robotsettings.selfClean')), sel(E.cleangenius, t('robotsettings.cleangenius'))],
    numbers: [rng(s, E.selfCleanArea, t('robotsettings.selfCleanArea'), t('robotsettings.unitM2'), '', 0, 100, 1), rng(s, E.volume, t('robotsettings.volume'), t('robotsettings.unitPct'), '', 0, 100, 1)],
    dndStart: txt(s, E.dndStart).slice(0, 5), dndEnd: txt(s, E.dndEnd).slice(0, 5), dndStartId: E.dndStart, dndEndId: E.dndEnd,
  };
});

// ───────── Karte (Attribute für dx-map-card / Sperrzonen) ─────────
/** Raum mit Umriss aus den Kartendaten (Roboter-Koordinaten in mm) – für Marker und Umrisse der Xiaomi-Karte (4.3). */
export interface RoomShape { id: RoomId; name: string; short: string; icon: string; x: number; y: number; outline: [number, number][] }
export interface MapView {
  entityPicture: string; calibrationPoints: unknown; noGoAreas: unknown; noMoppingAreas: unknown; virtualWalls: unknown; rooms: unknown;
  karte: string; chairs: boolean; chairsId: string;
  /** Sichtbare Räume des Roboters in App-Reihenfolge (Geräteprofil) */
  roomOrder: RoomInfo[];
  /** Sichtbare Räume mit Koordinaten aus der Karten-Kamera (Reihenfolge wie `roomOrder`) */
  roomShapes: RoomShape[];
  /** Kartenwahl (`select.heidi_selected_map`), null wenn die Entität fehlt oder unavailable ist */
  selectedMap: { id: string; value: string; options: string[] } | null;
  /** Datenkarte (`camera.heidi_map_data`, 4.3b): Bild-URL mit Token, Version (= Zustand) und Karten-ID (saved_map_id, sonst map_id) für den Raum-Speicher; null wenn fehlend/unavailable */
  mapData: { picture: string; version: string; mapKey: string } | null;
}
const coord = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : null);
function roomShapes(s: States, order: readonly RoomInfo[]): RoomShape[] {
  const rooms = attr<Record<string, Record<string, unknown>>>(s, E.map, 'rooms');
  if (!rooms || typeof rooms !== 'object') return [];
  const out: RoomShape[] = [];
  for (const r of order) {
    const m = rooms[String(r.id)];
    if (!m || m.visibility === 'Hidden') continue;
    const x0 = coord(m.x0), y0 = coord(m.y0), x1 = coord(m.x1), y1 = coord(m.y1);
    if (x0 === null || y0 === null || x1 === null || y1 === null) continue;
    const cx = coord(m.x) ?? (x0 + x1) / 2, cy = coord(m.y) ?? (y0 + y1) / 2;
    out.push({ id: r.id, name: String(m.custom_name ?? m.name ?? r.name), short: r.short, icon: r.icon, x: cx, y: cy, outline: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] });
  }
  return out;
}
export const readMap: Selector<MapView> = memoizeSelector((s) => [...profileIds(s), E.karte, E.chairs, E.selectedMap, E.mapData], (s) => {
  const sm = ent(s, E.selectedMap);
  const roomOrder = readProfile(s).rooms;
  const mdEnt = ent(s, E.mapData);
  const mdPic = String(attr(s, E.mapData, 'entity_picture') ?? '');
  return {
    mapData: mdEnt && !EMPTY.includes(mdEnt.state) && mdPic ? { picture: mdPic, version: mdEnt.state, mapKey: String(attr(s, E.mapData, 'saved_map_id') ?? attr(s, E.mapData, 'map_id') ?? '0') } : null,
    entityPicture: String(attr(s, E.map, 'entity_picture') ?? ''), calibrationPoints: attr(s, E.map, 'calibration_points') ?? null,
    noGoAreas: attr(s, E.map, 'no_go_areas') ?? null, noMoppingAreas: attr(s, E.map, 'no_mopping_areas') ?? null, virtualWalls: attr(s, E.map, 'virtual_walls') ?? null,
    rooms: attr(s, E.map, 'rooms') ?? null, karte: st(s, E.karte), chairs: on(s, E.chairs), chairsId: E.chairs, roomOrder,
    roomShapes: roomShapes(s, roomOrder),
    selectedMap: sm && !EMPTY.includes(sm.state) ? { id: E.selectedMap, value: sm.state, options: opts(s, E.selectedMap) } : null,
  };
}, () => ({ [E.map]: stateAndAttributes(['entity_picture', 'calibration_points', 'no_go_areas', 'no_mopping_areas', 'virtual_walls', 'rooms']), [E.mapData]: stateAndAttributes(['entity_picture', 'saved_map_id', 'map_id']) }));

// ───────── Diagnose ─────────
export interface DiagnosticsView { total: number; missing: string[]; unavailable: string[]; groups: { name: string; total: number; missing: string[]; unavailable: string[] }[] }
export const readDiagnostics: Selector<DiagnosticsView> = memoizeSelector((s) => [...profileIds(s), ...allContractIds(readProfile(s).roomIds)], (s) => {
  const roomIds = readProfile(s).roomIds;
  const ids = allContractIds(roomIds);
  const group = (name: string, list: string[]) => ({ name, total: list.length, missing: list.filter((id) => !s[id]), unavailable: list.filter((id) => s[id] && EMPTY.includes(s[id]!.state)) });
  const robotSet = new Set(robotIds(roomIds));
  const robot = group(t('diag.robot', { name: deviceName() || t('diag.robotUnknown') }), ids.filter((id) => robotSet.has(id)));
  const paket = group(t('diag.package'), ids.filter((id) => !robotSet.has(id)));
  return { total: ids.length, missing: [...robot.missing, ...paket.missing], unavailable: [...robot.unavailable, ...paket.unavailable], groups: [robot, paket] };
});

/** Alle Selektoren (für Tests: ids-Abdeckung, reset). */
export const ALL_SELECTORS: Record<string, Selector<unknown>> = {
  readProfile, readRobot, readPlans, readAllRoomValues, readLearn, readHistory, readPrognose, readAutomatik, readConsumables, readStation, readSettings, readRobotSettings, readMap, readDiagnostics,
  ...Object.fromEntries(PLAN_NUMBERS.map((n) => [`readPlan(${n})`, PLAN_SELECTORS[n]])),
};
