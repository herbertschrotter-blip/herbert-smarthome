// Memoisierte Selektoren (Bauplan 3.1, Regel 10): Ein Selektor nennt seine Entitäts-IDs und liefert dasselbe
// View-Objekt (gleiche Referenz), solange sich für keine dieser IDs `state` oder `last_updated` geändert hat.
// Ein Selektor darf einen eigenen Vergleich mitbringen (z. B. nur bestimmte Attribute). Kein Store, keine Observables.
import type { HassEntity, States } from './types';

/** true = für diese ID unverändert (Standard: state + last_updated; fehlend ↔ fehlend gilt als gleich). */
export type EntityCompare = (prev: HassEntity | undefined, next: HassEntity | undefined) => boolean;

export interface Selector<T> {
  (states: States): T;
  /** Entitäts-IDs, die dieser Selektor liest (für Tests und Diagnose). */
  readonly ids: readonly string[];
  /** Cache leeren (Tests). */
  reset(): void;
}

export const sameStateAndUpdated: EntityCompare = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.state === b.state && a.last_updated === b.last_updated;
};

/** Vergleich über `state` und ausgewählte Attribute – für Entitäten wie vacuum.heidi, deren last_updated ständig tickt. */
export function stateAndAttributes(attrs: readonly string[]): EntityCompare {
  return (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.state !== b.state) return false;
    for (const k of attrs) if (!sameValue(a.attributes[k], b.attributes[k])) return false;
    return true;
  };
}

/** Flacher Wertvergleich, Listen elementweise (für Attribute wie active_segments). */
export function sameValue(x: unknown, y: unknown): boolean {
  if (x === y) return true;
  if (Array.isArray(x) && Array.isArray(y)) return x.length === y.length && x.every((v, i) => sameValue(v, y[i]));
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    const kx = Object.keys(x as object), ky = Object.keys(y as object);
    return kx.length === ky.length && kx.every((k) => sameValue((x as Record<string, unknown>)[k], (y as Record<string, unknown>)[k]));
  }
  return false;
}

/**
 * Baut einen memoisierten Selektor.
 * @param ids Entitäts-IDs, von denen die Sicht abhängt
 * @param fn reine Funktion states → Sicht
 * @param compare je ID ein eigener Vergleich (Schlüssel = ID), sonst `sameStateAndUpdated`
 */
export function memoizeSelector<T>(ids: readonly string[], fn: (states: States) => T, compare: Record<string, EntityCompare> = {}): Selector<T> {
  let prev: States | null = null;
  let result: T;
  const sel = ((states: States): T => {
    if (prev !== null) {
      let same = true;
      for (const id of ids) {
        const cmp = compare[id] ?? sameStateAndUpdated;
        if (!cmp(prev[id], states[id])) { same = false; break; }
      }
      if (same) return result;
    }
    result = fn(states);
    prev = states;
    return result;
  }) as Selector<T>;
  Object.defineProperty(sel, 'ids', { value: ids, writable: false });
  sel.reset = () => { prev = null; };
  return sel;
}
