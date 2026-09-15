// Laden des Kartenpakets (Bauplan 4.3b): holt das Platzhalter-PNG von camera.heidi_map_data über dessen entity_picture
// (Token in der URL, kein Header nötig), liest den zTXt-Chunk „ValetudoMap“ und parst ihn. Modul-Cache je Version
// (Zustand der Kamera = Zeitstempel), damit Seitenwechsel und Ticks nicht neu laden.
import { pngText } from '../domain/png-text';
import { parseValetudo } from '../domain/mapdata';
import type { MapData } from '../domain/mapdata';

const cache = new Map<string, Promise<MapData | null>>();

/** Kartenpaket zu dieser Version; gleiche Version = gleiches Promise (kein zweiter Abruf). */
export function loadMapData(pictureUrl: string, version: string): Promise<MapData | null> {
  const key = `${version}|${pictureUrl.split('?')[0]}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(pictureUrl, { cache: 'no-store' })
      .then(async (r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); const text = await pngText(await r.arrayBuffer(), 'ValetudoMap'); return text ? parseValetudo(text) : null; })
      .catch((e: unknown) => { console.warn('dreame_x60: Kartenpaket nicht ladbar', e); cache.delete(key); return null; });
    cache.set(key, p);
    if (cache.size > 4) { const first = cache.keys().next().value; if (first !== undefined && first !== key) cache.delete(first); }
  }
  return p;
}

/** Nur für Tests. */
export function resetMapDataCache(): void { cache.clear(); }
