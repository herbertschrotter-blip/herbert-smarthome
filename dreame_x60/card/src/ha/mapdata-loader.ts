// Laden des Kartenpakets (Bauplan 4.3b): holt das Platzhalter-PNG von camera.heidi_map_data über dessen entity_picture
// (Token in der URL, kein Header nötig), liest den zTXt-Chunk „ValetudoMap“ und parst ihn. Modul-Cache je Version
// (Zustand der Kamera = Zeitstempel), damit Seitenwechsel und Ticks nicht neu laden.
// Während/nach einem Raumauftrag enthält das Paket nur die aktiven Räume (siehe MapData.partial): dann werden die
// fehlenden Räume aus dem letzten vollständigen Paket derselben Karte ergänzt – gemerkt im Modul und in localStorage
// (überlebt Neuladen der Seite; Schlüssel je Karten-ID, ~20 KB).
import { pngText } from '../domain/png-text';
import { mergeSegments, parseValetudo } from '../domain/mapdata';
import type { MapData, MapSegment } from '../domain/mapdata';

const cache = new Map<string, Promise<MapData | null>>();
const known = new Map<string, MapSegment[]>();
const STORAGE_PREFIX = 'dreame_x60.mapdata.';

function loadKnown(mapKey: string): MapSegment[] | null {
  const m = known.get(mapKey);
  if (m) return m;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_PREFIX + mapKey);
    if (!raw) return null;
    const segs = JSON.parse(raw) as MapSegment[];
    if (!Array.isArray(segs) || !segs.length) return null;
    known.set(mapKey, segs);
    return segs;
  } catch { return null; }
}

function storeKnown(mapKey: string, segs: MapSegment[]): void {
  known.set(mapKey, segs);
  try { globalThis.localStorage?.setItem(STORAGE_PREFIX + mapKey, JSON.stringify(segs)); } catch { /* voll oder gesperrt: nur Modul-Cache */ }
}

/** Kartenpaket zu dieser Version; gleiche Version = gleiches Promise (kein zweiter Abruf). `mapKey` = Karten-ID für die Ergänzung fehlender Räume. */
export function loadMapData(pictureUrl: string, version: string, mapKey = '0'): Promise<MapData | null> {
  const key = `${version}|${pictureUrl.split('?')[0]}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(pictureUrl, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await pngText(await r.arrayBuffer(), 'ValetudoMap');
        if (!text) return null;
        const md = parseValetudo(text);
        if (!md.partial) { if (md.segments.length) storeKnown(mapKey, md.segments); return md; }
        return mergeSegments(md, loadKnown(mapKey));
      })
      .catch((e: unknown) => { console.warn('dreame_x60: Kartenpaket nicht ladbar', e); cache.delete(key); return null; });
    cache.set(key, p);
    if (cache.size > 4) { const first = cache.keys().next().value; if (first !== undefined && first !== key) cache.delete(first); }
  }
  return p;
}

/** Nur für Tests. */
export function resetMapDataCache(): void { cache.clear(); known.clear(); }
