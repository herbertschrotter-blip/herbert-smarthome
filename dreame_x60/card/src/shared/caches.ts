// Modul-Caches (Bauplan Abschnitt 3): überleben Seitenwechsel und Neuanlage der Karte (HA baut bei jedem
// Ansichtswechsel ein neues Element). Karten-Element je Darstellung, Zeitleisten je Lauf.
import type { Timeline } from '../domain/timeline';

/** Eingebettetes Karten-Element (Dreame-App / Xiaomi / Nur Bild) je `kind|dark`. */
export const mapElements = new Map<string, HTMLElement>();

export interface TimelineEntry { rows?: Timeline['rows']; end?: number | null; loading?: boolean; error?: string; lc?: string }
/** Zeitleisten je Lauf (Schlüssel = Startzeit in Sekunden bzw. "cur"). */
export const timelines = new Map<string, TimelineEntry>();

/** Nur für Tests. */
export function resetCaches(): void {
  mapElements.clear();
  timelines.clear();
}
