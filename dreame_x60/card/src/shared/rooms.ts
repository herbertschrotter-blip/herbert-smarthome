// Raumauswahl für Karte (Modus Räume) und Schnellstart (Bauplan 4.3): dieselbe Logik an beiden Stellen, kein doppelter Code.
// Reine Hilfsfunktionen ohne Entitäten; die Reihenfolge der Räume kommt als Parameter (später dynamisch, Post-2.0).
import type { RoomInfo } from '../config';

/** Raum an/abwählen; liefert ein neues Set (Lit erkennt die Änderung an der neuen Referenz). */
export function toggleRoom(sel: ReadonlySet<number>, id: number): Set<number> {
  const next = new Set(sel);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}

/** „Alles“: alle Räume, oder leer, wenn schon alle gewählt sind. */
export function toggleAll(sel: ReadonlySet<number>, order: readonly RoomInfo[]): Set<number> {
  return sel.size === order.length ? new Set() : new Set(order.map((r) => r.id));
}

/** Räume der Auswahl in Anzeigereihenfolge (wie die Kacheln). */
export function selectedRooms(sel: ReadonlySet<number>, order: readonly RoomInfo[]): RoomInfo[] {
  return order.filter((r) => sel.has(r.id));
}

/** Beschriftung der Startleiste: „Ganze Wohnung“, „1 Raum“, „3 Räume“. */
export function selectionLabel(sel: ReadonlySet<number>, order: readonly RoomInfo[]): string {
  const n = sel.size;
  if (n && n === order.length) return 'Ganze Wohnung';
  return `${n} ${n === 1 ? 'Raum' : 'Räume'}`;
}

/** Text der Bestätigung: „Jetzt reinigen: Wohnz., Küche?“ */
export function confirmText(sel: ReadonlySet<number>, order: readonly RoomInfo[]): string {
  return `Jetzt reinigen: ${selectedRooms(sel, order).map((r) => r.short).join(', ')}?`;
}

/** Segmente für vacuum_clean_segment in Anzeigereihenfolge (der Roboter fährt in seiner eigenen Reihenfolge). */
export function segmentsOf(sel: ReadonlySet<number>, order: readonly RoomInfo[]): number[] {
  return selectedRooms(sel, order).map((r) => r.id);
}
