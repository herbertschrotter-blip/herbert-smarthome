// Streifen im Kopf und Reihenfolge des laufenden Auftrags (Bauplan 4.1, Regeln Abschnitt 6 `_strip`): reine Funktionen,
// 1:1 wie v1 1.6.2. Nur cleaning/paused; Reihenfolge = input_text.heidi_lauf_reihenfolge, wenn sie genau die
// active_segments enthält, sonst cleaning_sequence ∩ active_segments.
import type { RoomId } from '../ha/contract';
import type { RoomValues } from './raumwerte';
import { roomById } from './rooms';
import type { RoomInfo } from './rooms';

export interface RunInput {
  vac: string;
  currentSegment: number | null;
  activeSegments: number[];
  cleaningSequence: number[];
  laufReihenfolge: number[];
  cleanedArea: number;
}

export interface RunOrder {
  /** Räume des Auftrags in Laufreihenfolge */
  order: number[];
  /** Position des aktuellen Raums in `order`, −1 wenn nicht enthalten */
  idx: number;
  /** Noch ausstehende Räume (nach dem aktuellen; alle, wenn der aktuelle nicht dazugehört) */
  rest: number[];
}

export function runOrder(r: RunInput): RunOrder {
  const active = r.activeSegments;
  const memo = r.laufReihenfolge.filter((x) => active.includes(x));
  const order = memo.length === active.length ? memo : r.cleaningSequence.filter((id) => active.includes(id));
  const idx = r.currentSegment === null ? -1 : order.indexOf(r.currentSegment);
  return { order, idx, rest: idx >= 0 ? order.slice(idx + 1) : order };
}

export interface StripChip { icons: string[]; text: string }
export interface StripModel {
  kind: 'startpunkt' | 'durchfahrt' | 'jetzt';
  roomId: RoomId;
  icon: string;
  /** „Jetzt: Küche“, „Fährt zum Startpunkt“, „Fährt durch Küche“ */
  head: string;
  /** „danach A → B“, „letzter Raum“, „zu A“ oder leer */
  right: string;
  chips: StripChip[];
}

const shortOf = (rooms: readonly RoomInfo[], id: number): string | undefined => roomById(rooms, id)?.short;
const FAN_ICON: Record<string, string> = { Leise: 'mdi:fan-speed-1', Standard: 'mdi:fan-speed-2', Stark: 'mdi:fan-speed-3', Turbo: 'mdi:fan' };
const modusIcons = (modus: string): string[] => (modus === 'Saugen' ? ['mdi:broom'] : modus === 'Nur Wischen' ? ['mdi:water'] : ['mdi:broom', 'mdi:water']);

/** Chips der Raumwerte wie im Streifen: Modus, Saugstufe, Wasser (nur nass), Route (nur „Nur Wischen“), Wiederholungen. */
export function roomValueChips(v: RoomValues): StripChip[] {
  const chips: StripChip[] = [{ icons: modusIcons(v.modus), text: v.modus }, { icons: [FAN_ICON[v.saug] ?? 'mdi:fan'], text: v.saug }];
  if (v.modus !== 'Saugen' && v.wasser) chips.push({ icons: ['mdi:water-percent'], text: v.wasser });
  if (v.modus === 'Nur Wischen' && v.route) chips.push({ icons: ['mdi:routes'], text: v.route });
  chips.push({ icons: ['mdi:repeat'], text: `${v.wdh}×` });
  return chips;
}

export function stripModel(r: RunInput, roomValues: (id: RoomId) => RoomValues | null, rooms: readonly RoomInfo[]): StripModel | null {
  if (!['cleaning', 'paused'].includes(r.vac)) return null;
  const seg = r.currentSegment;
  const room = seg === null ? undefined : roomById(rooms, seg);
  const v = room ? roomValues(room.id) : null;
  if (!room || !v) return null;
  const { order, rest } = runOrder(r);
  const restTxt = rest.map((id) => shortOf(rooms, id)).filter(Boolean).join(' → ');
  const first = order.length ? shortOf(rooms, order[0]!) : undefined;
  if (r.vac === 'cleaning' && r.cleanedArea === 0) {
    return { kind: 'startpunkt', roomId: room.id, icon: 'mdi:map-marker-path', head: 'Fährt zum Startpunkt', right: first ? `zu ${first}` : '', chips: [] };
  }
  if (r.activeSegments.length && !r.activeSegments.includes(room.id)) {
    return { kind: 'durchfahrt', roomId: room.id, icon: room.icon, head: `Fährt durch ${room.short}`, right: restTxt ? `zu ${restTxt}` : '', chips: [] };
  }
  return { kind: 'jetzt', roomId: room.id, icon: room.icon, head: `Jetzt: ${room.short}`, right: restTxt ? `danach ${restTxt}` : 'letzter Raum', chips: roomValueChips(v) };
}

/** Textform wie v1 (`.strip` textContent, Leerraum normalisiert) – für Paritätstests. */
export function stripText(m: StripModel | null): string | null {
  if (!m) return null;
  return `${[m.head, m.right].filter(Boolean).join(' ')} ${m.chips.map((c) => c.text).join('')}`.replace(/\s+/g, ' ').trim();
}
