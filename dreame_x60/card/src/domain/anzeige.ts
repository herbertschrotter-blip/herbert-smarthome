// Diagnose-Protokoll Schicht 3 (Bauplan F.1, PD-017): was das Roboter-Panel gerade zeigt – als flacher Schnappschuss,
// damit die Shell Änderungen erkennt und als HA-Ereignis meldet. Reine Funktionen, keine Texte, kein HA-Zugriff.

/** Sichtbare Kernwerte des Roboter-Panels (dx-hero + Balken der Auftrag-Kachel). */
export interface AnzeigeSnapshot {
  /** große Zeile (Gesamtauftrag / Status) */
  kopf: string;
  /** kleine Zeile (Arbeitsschritt) */
  schritt: string;
  /** Hinweis-/Fehler-Chip: Kurztext, leer ohne Chip */
  hinweis: string;
  /** Akku in % */
  akku: number;
  /** Fortschritt in % vom Roboter; null außerhalb eines Laufs */
  fortschritt: number | null;
  /** Zustand von vacuum.* (bestimmt Knöpfe und Statuspunkt) */
  zustand: string;
}

/** Eingabe: der Teil der Roboter-Sicht, den das Panel anzeigt (RobotView erfüllt das). */
export interface AnzeigeInput {
  vac: string;
  battery: number;
  progress: number | null;
  hero: { big: string; sub: string; errorChip: { text: string } | null };
}

export function anzeigeSnapshot(r: AnzeigeInput): AnzeigeSnapshot {
  return {
    kopf: r.hero.big,
    schritt: r.hero.sub,
    hinweis: r.hero.errorChip?.text ?? '',
    akku: r.battery,
    fortschritt: r.progress === null ? null : Math.round(r.progress),
    zustand: r.vac,
  };
}

/** Namen der geänderten Werte; ohne Vorgänger gilt alles als geändert (erste Meldung nach dem Laden). */
export function anzeigeDiff(prev: AnzeigeSnapshot | null, next: AnzeigeSnapshot): (keyof AnzeigeSnapshot)[] {
  const keys = Object.keys(next) as (keyof AnzeigeSnapshot)[];
  return prev ? keys.filter((k) => prev[k] !== next[k]) : keys;
}
