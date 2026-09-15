// Geräteprofil (Stufe 2, docs/dreame_x60/GERAETEPROFIL.md): was dieser Roboter hat – Räume aus der Karte, Optionen aus den
// Select-Entitäten, Fähigkeiten aus dem Vorhandensein der Entitäten. Bauteile bekommen das Profil als Parameter (Sicht),
// nie eine feste Liste. Memoisiert wie alle Selektoren; abhängig vom erkannten Gerät (device.ts).
import { ENTITIES as E, ROBOT_FEATURES, ROOM_VALUE_CODES, roomEntity } from './contract';
import { cleanName, deviceName, devicePrefix } from './device';
import type { RobotKey } from './contract';
import type { HassEntity, States } from './types';
import { memoizeSelector, sameValue } from './memo-selector';
import type { Selector } from './memo-selector';
import { roomIcon, roomsFromMap, shortName } from '../domain/rooms';
import type { RoomInfo } from '../domain/rooms';
import { ROOMS_DE } from '../config';

export interface Option { value: string; label: string }
export type OptionKey = 'modus' | 'saug' | 'wasser' | 'route' | 'wdh';

export interface Profile {
  /** sichtbare Räume in App-Reihenfolge */
  rooms: RoomInfo[];
  roomIds: number[];
  /** Optionen der Roboter-Selects (HA-Wert + deutsche Beschriftung), leer wenn die Entität fehlt */
  options: Record<OptionKey, Option[]>;
  /** Merkmal vorhanden (Entität existiert in HA – auch wenn gerade unavailable) */
  has: (key: RobotKey) => boolean;
}

/** Deutsche Beschriftungen über die v1-Zuordnung hinaus (unbekannte Werte werden lesbar gemacht, nie verworfen). */
const OPTION_DE: Record<string, string> = { mopping_after_sweeping: 'Wischen nach Saugen', quick: 'Schnell', off: 'Aus', on: 'An' };
const humanize = (v: string): string => v.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export function optionLabel(key: OptionKey, value: string): string {
  if (key === 'wdh') return value.replace(/x$/i, '');
  const table = ROOM_VALUE_CODES.RV_HA[key] as Record<string, string>;
  return table[value] ?? OPTION_DE[value] ?? humanize(value);
}

const optionsOf = (s: States, id: string, key: OptionKey): Option[] => {
  const e = s[id];
  const list = Array.isArray(e?.attributes.options) ? (e!.attributes.options as unknown[]).map(String) : [];
  return list.map((value) => ({ value, label: optionLabel(key, value) }));
};

/** Nur das Attribut `rooms` der Karte zählt (der Kamerazustand ändert sich mit jedem Bild). */
const mapRoomsOnly = (a: HassEntity | undefined, b: HassEntity | undefined): boolean => sameValue(a?.attributes?.rooms, b?.attributes?.rooms);
/** Fähigkeiten: nur ob die Entität existiert (Zustand egal). */
const existsOnly = (a: HassEntity | undefined, b: HassEntity | undefined): boolean => !!a === !!b;
const FEATURE_IDS = (): string[] => (Object.keys(ROBOT_FEATURES) as RobotKey[]).map((k) => E[k]);
/** Selects: Zustand egal, nur die Optionsliste. */
const optionsOnly = (a: HassEntity | undefined, b: HassEntity | undefined): boolean => (a === b) || (!!a && !!b && sameValue(a.attributes.options, b.attributes.options));

const GLOBAL: Record<Exclude<OptionKey, 'wdh'>, RobotKey> = { modus: 'cleaningMode', saug: 'suctionLevel', wasser: 'mopPadHumidity', route: 'cleaningRoute' };
const { RV_ENT } = ROOM_VALUE_CODES;

/**
 * Rückfall ohne Karten-Kamera: Räume aus den Raum-Selects `select.<gerät>_room_<n>_cleaning_mode`; Name aus dem
 * friendly_name der Integration („<Gerät> Cleaning Mode <Raum>“), sonst „Raum n“.
 */
function roomsFromSelects(s: States): RoomInfo[] {
  const p = devicePrefix();
  if (!p) return [];
  const re = new RegExp(`^select\\.${p}_room_(\\d+)_cleaning_mode$`);
  const out: RoomInfo[] = [];
  for (const id of Object.keys(s)) {
    const m = re.exec(id); if (!m) continue;
    const n = parseInt(m[1]!, 10);
    const fn = cleanName(s[id]?.attributes.friendly_name);
    const name = fn.replace(new RegExp(`^${deviceName().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*`, 'i'), '').replace(/cleaning mode/i, '').trim() || `Raum ${n}`;
    out.push({ id: n, name, short: shortName(name), icon: roomIcon(name), order: n, typed: false });
  }
  return out.sort((a, b) => a.order - b.order || a.id - b.id);
}
const fallbackSelectIds = (s: States): string[] => { const p = devicePrefix(); if (!p) return []; const re = new RegExp(`^select\\.${p}_room_\\d+_cleaning_mode$`); return Object.keys(s).filter((id) => re.test(id)); };

function roomsOf(s: States): RoomInfo[] {
  const deutsch = s[E.raumnamen]?.state === 'Deutsch';
  const fromMap = roomsFromMap(s[E.map]?.attributes.rooms as Record<string, never> | undefined, deutsch, ROOMS_DE);
  return fromMap.length ? fromMap : roomsFromSelects(s);
}

/** Entitäten, die das Profil liest (für Selektoren, die das Profil nutzen). */
export function profileIds(s: States): string[] {
  const first = roomsOf(s)[0]?.id;
  const opt = Object.values(GLOBAL).map((k) => E[k]);
  const fb = s[E.map]?.attributes.rooms ? [] : fallbackSelectIds(s);
  return [...new Set([E.map, E.raumnamen, ...opt, ...FEATURE_IDS(), ...fb, ...(first === undefined ? [] : [roomEntity(first, RV_ENT.wdh), ...(Object.keys(GLOBAL) as Exclude<OptionKey, 'wdh'>[]).map((k) => roomEntity(first, RV_ENT[k]))])])];
}

export const readProfile: Selector<Profile> = memoizeSelector(
  profileIds,
  (s) => {
    const rooms = roomsOf(s);
    const first = rooms[0]?.id ?? null;
    const opt = (key: Exclude<OptionKey, 'wdh'>): Option[] => {
      const global = optionsOf(s, E[GLOBAL[key]], key);
      if (global.length || first === null) return global;
      return optionsOf(s, roomEntity(first, RV_ENT[key]), key);
    };
    const options: Record<OptionKey, Option[]> = {
      modus: opt('modus'), saug: opt('saug'), wasser: opt('wasser'), route: opt('route'),
      wdh: first === null ? [] : optionsOf(s, roomEntity(first, RV_ENT.wdh), 'wdh'),
    };
    return { rooms, roomIds: rooms.map((r) => r.id), options, has: (key: RobotKey) => !!s[E[key]] };
  },
  () => ({ ...Object.fromEntries(FEATURE_IDS().map((id) => [id, existsOnly])), [E.map]: mapRoomsOnly, ...Object.fromEntries(Object.values(GLOBAL).map((k) => [E[k], optionsOnly])) }),
);
