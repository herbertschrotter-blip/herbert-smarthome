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
  /** Standardtyp der App (type 1..15) – false = benutzerdefiniert */
  typed: boolean;
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

/**
 * Raumtypen der Dreame-App (Attribut `type` 1..15, 0 = benutzerdefiniert): deutscher Name wie in der App („Raum umbenennen“)
 * und Symbol. Das ist das Wörterbuch der App, keine Raumliste – welche Räume es gibt, sagt weiterhin die Karte.
 * Standardtypen erkennt auch die Sprachsteuerung (Herbert, 15.09.); benutzerdefinierte Namen nicht.
 */
export const ROOM_TYPES: Record<number, { name: string; en: string; icon: string }> = {
  1: { name: 'Wohnzimmer', en: 'Living Room', icon: 'mdi:sofa-outline' },
  2: { name: 'Schlafzimmer', en: 'Primary Bedroom', icon: 'mdi:bed-king-outline' },
  3: { name: 'Arbeitszimmer', en: 'Study', icon: 'mdi:bookshelf' },
  4: { name: 'Küche', en: 'Kitchen', icon: 'mdi:chef-hat' },
  5: { name: 'Esszimmer', en: 'Dining Hall', icon: 'mdi:silverware-fork-knife' },
  6: { name: 'Bad', en: 'Bathroom', icon: 'mdi:shower' },
  7: { name: 'Balkon', en: 'Balcony', icon: 'mdi:balcony' },
  8: { name: 'Flur', en: 'Corridor', icon: 'mdi:foot-print' },
  9: { name: 'Allzweckraum', en: 'Utility Room', icon: 'mdi:archive-outline' },
  10: { name: 'Garderobe', en: 'Closet', icon: 'mdi:hanger' },
  11: { name: 'Salon', en: 'Meeting Room', icon: 'mdi:presentation' },
  12: { name: 'Büro', en: 'Office', icon: 'mdi:monitor' },
  13: { name: 'Fitnessbereich', en: 'Fitness Area', icon: 'mdi:dumbbell' },
  14: { name: 'Freizeitbereich', en: 'Recreation Area', icon: 'mdi:gamepad-variant-outline' },
  15: { name: 'Nebenzimmer', en: 'Secondary Bedroom', icon: 'mdi:bed-single-outline' },
};

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
  const num = /^(.*\S)\s+(\d+)$/.exec(n); // Zählsuffix („Schlafzimmer 2“) bleibt hinter dem Kurznamen
  if (num) return `${shortName(num[1]!)} ${num[2]}`;
  const m = /^(.+?)zimmer$/i.exec(n);
  if (m && m[1]!.length <= 7) return `${m[1]}z.`;
  if (n.length <= 7) return n;
  return `${n.slice(0, 6).trimEnd()}.`;
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
    const typed = typeof r.type === 'number' && r.type > 0 ? ROOM_TYPES[r.type] : undefined;
    let name: string, icon: string;
    if (typed) {
      // Standardtyp der App: Name wie in der App (deutsch) bzw. wie die Integration (Original), mit Zählsuffix („Schlafzimmer 2“)
      const suffix = /\s(\d+)$/.exec(String(r.name ?? ''))?.[1];
      name = (deutsch ? typed.name : typed.en) + (suffix ? ` ${suffix}` : '');
      icon = typed.icon;
    } else {
      const raw = String(r.custom_name ?? r.name ?? '').trim() || `Raum ${id}`;
      name = deutsch ? (namesDe[raw] ?? raw) : raw;
      icon = roomIcon(name, r.icon);
    }
    out.push({ id, name, short: shortName(name), icon, order: typeof r.order === 'number' ? r.order : id, typed: !!typed });
  }
  return out.sort((a, b) => a.order - b.order || a.id - b.id);
}

export const roomById = (rooms: readonly RoomInfo[], id: number): RoomInfo | undefined => rooms.find((r) => r.id === id);
