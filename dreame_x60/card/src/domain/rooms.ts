// Räume aus den Kartendaten des Roboters (Geräteprofil Stufe 2, Herbert 15.09.: „2, 6 oder 20 Räume, eine oder mehrere
// Karten – das Dashboard soll immer funktionieren“). Reine Funktionen: Attribut `rooms` der Karten-Kamera → Liste der
// sichtbaren Räume in App-Reihenfolge, Kurzname und Symbol nach Standardregel (später Menü, Post-2.0).
// Keine Entitäts-IDs, keine feste Raumliste mehr (v1: ROOMS 7..1).

export interface RoomInfo {
  id: number;
  /** voller Name (custom_name der App, sonst name) */
  name: string;
  /** Kurzname für Chips und Kacheln („Wohnz.“) */
  short: string;
  icon: string;
  /** Reihenfolge aus der App (Attribut `order`), sonst die ID */
  order: number;
}

/** Ein Eintrag aus `camera.<gerät>_map.rooms` (nur die Felder, die hier zählen). */
export interface MapRoomAttr {
  room_id?: number;
  name?: string;
  custom_name?: string;
  order?: number;
  visibility?: string;
  icon?: string;
  type?: number;
}

/** Symbol nach Stichwort im Namen (deutsch und englisch); sonst Symbol der Integration, sonst Grundriss. */
const ICON_BY_KEYWORD: [RegExp, string][] = [
  [/\b(wc|toilet|gäste-?wc|gaeste-?wc)\b/i, 'mdi:toilet'],
  [/bad|bath|dusche|shower/i, 'mdi:shower'],
  [/küche|kueche|kitchen|kochen/i, 'mdi:chef-hat'],
  [/schlaf|bed|nacht/i, 'mdi:bed-king-outline'],
  [/kinder|child|kid|baby|nursery/i, 'mdi:teddy-bear'],
  [/wohn|living|lounge|stube/i, 'mdi:sofa-outline'],
  [/büro|buero|office|study|arbeit|work/i, 'mdi:desk'],
  [/ess|dining|speise/i, 'mdi:silverware-fork-knife'],
  [/flur|gang|diele|corridor|hall|vorraum|vorzimmer|entry|entrance/i, 'mdi:foot-print'],
  [/balkon|terrasse|balcony|terrace|patio/i, 'mdi:balcony'],
  [/abstell|storage|utility|lager|kammer|speis/i, 'mdi:wardrobe-outline'],
  [/wasch|laundry|hauswirtschaft/i, 'mdi:washing-machine'],
  [/garage|carport/i, 'mdi:garage'],
  [/fitness|sport|gym/i, 'mdi:dumbbell'],
  [/spiel|play|hobby|game/i, 'mdi:gamepad-variant-outline'],
];
const GENERIC_ICONS = new Set(['mdi:home-outline', 'mdi:home', '']);

export function roomIcon(name: string, fallback?: string): string {
  for (const [re, icon] of ICON_BY_KEYWORD) if (re.test(name)) return icon;
  return fallback && !GENERIC_ICONS.has(fallback) ? fallback : 'mdi:floor-plan';
}

/**
 * Kurzname: „…zimmer“ → Stamm + „z.“ (Wohnzimmer → Wohnz., Schlafzimmer → Schlafz., Kinderzimmer → Kinderz.);
 * bis 7 Zeichen unverändert; sonst die ersten 6 Zeichen + „.“ (Hauswirtschaftsraum → Hauswi.).
 */
export function shortName(name: string): string {
  const n = name.trim();
  const m = /^(.+?)zimmer$/i.exec(n);
  if (m && m[1]!.length <= 7) return `${m[1]}z.`;
  if (n.length <= 7) return n;
  return `${n.slice(0, 6)}.`;
}

/**
 * Sichtbare Räume der Karte in App-Reihenfolge. `deutsch` + `namesDe` übersetzen englische Integrationsnamen
 * (input_select …_raumnamen = Deutsch, Tabelle ROOMS_DE). Räume ohne gültige ID oder mit visibility „Hidden“ entfallen.
 */
export function roomsFromMap(rooms: Record<string, MapRoomAttr | undefined> | null | undefined, deutsch = false, namesDe: Record<string, string> = {}): RoomInfo[] {
  if (!rooms || typeof rooms !== 'object') return [];
  const out: RoomInfo[] = [];
  for (const [key, r] of Object.entries(rooms)) {
    if (!r || typeof r !== 'object') continue;
    const id = typeof r.room_id === 'number' ? r.room_id : parseInt(key, 10);
    if (!Number.isInteger(id) || id <= 0) continue;
    if (String(r.visibility ?? '').toLowerCase() === 'hidden') continue;
    const raw = String(r.custom_name ?? r.name ?? '').trim() || `Raum ${id}`;
    const name = deutsch ? (namesDe[raw] ?? raw) : raw;
    out.push({ id, name, short: shortName(name), icon: roomIcon(name, r.icon), order: typeof r.order === 'number' ? r.order : id });
  }
  return out.sort((a, b) => a.order - b.order || a.id - b.id);
}

export const roomById = (rooms: readonly RoomInfo[], id: number): RoomInfo | undefined => rooms.find((r) => r.id === id);
