// Format des Kartenbilds (HT-0010): HA gibt `picture-entity` im Live-Modus ohne `aspect_ratio` einen festen 16:9-Rahmen und
// schneidet ein quadratisches oder hohes Kartenbild unten ab. Die Karte misst deshalb einmal die echte Bildgröße über das
// entity_picture der Kamera (Token in der URL, kein Header nötig) und gibt das Format mit. Das letzte Ergebnis bleibt im
// Modul, damit die Kachel nach einem Seitenwechsel sofort im richtigen Format steht.
export interface PictureRatio { w: number; h: number }

let last: PictureRatio | null = null;

/** Zuletzt gemessenes Format (null, solange nichts gemessen ist). */
export const lastPictureRatio = (): PictureRatio | null => last;

/** Bildgröße messen; null, wenn das Bild nicht ladbar ist (dann bleibt es beim Rahmen von HA). */
export function loadPictureRatio(pictureUrl: string): Promise<PictureRatio | null> {
  if (!pictureUrl) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = (): void => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) last = { w: img.naturalWidth, h: img.naturalHeight };
      resolve(img.naturalWidth > 0 && img.naturalHeight > 0 ? last : null);
    };
    img.onerror = (): void => resolve(null);
    img.src = pictureUrl;
  });
}

export const sameRatio = (a: PictureRatio | null, b: PictureRatio | null): boolean => a?.w === b?.w && a?.h === b?.h;

/** Nur für Tests. */
export function resetPictureRatio(): void { last = null; }
