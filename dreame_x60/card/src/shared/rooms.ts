// Raumauswahl für Karte (Modus Räume) und Schnellstart (Bauplan 4.3): dieselbe Logik an beiden Stellen, kein doppelter Code.
// Reine Hilfsfunktionen ohne Entitäten; die Reihenfolge der Räume kommt als Parameter (später dynamisch, Post-2.0). Texte aus src/i18n (rooms.*).
import type { RoomInfo } from '../config';
import { t } from '../i18n/t';

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

/** Räume der Auswahl in der Reihenfolge des Antippens (Set behält die Einfügereihenfolge) – so fährt Heidi sie auch ab (Herbert, 15.09.). */
export function selectedRooms(sel: ReadonlySet<number>, order: readonly RoomInfo[]): RoomInfo[] {
  const out: RoomInfo[] = [];
  for (const id of sel) { const r = order.find((x) => x.id === id); if (r) out.push(r); }
  return out;
}

/** Beschriftung der Startleiste: „Ganze Wohnung“, „1 Raum“, „3 Räume“. */
export function selectionLabel(sel: ReadonlySet<number>, order: readonly RoomInfo[]): string {
  const n = sel.size;
  if (n && n === order.length) return t('rooms.whole');
  return n === 1 ? t('rooms.one', { n }) : t('rooms.many', { n });
}

/** Text der Bestätigung: „Jetzt reinigen: Wohnz., Küche?“ */
export function confirmText(sel: ReadonlySet<number>, order: readonly RoomInfo[]): string {
  return t('rooms.confirm', { list: selectedRooms(sel, order).map((r) => r.short).join(', ') });
}

/** Segmente für vacuum_clean_segment in Reihenfolge der Auswahl. */
export function segmentsOf(sel: ReadonlySet<number>, order: readonly RoomInfo[]): number[] {
  return selectedRooms(sel, order).map((r) => r.id);
}
