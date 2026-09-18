// Diagnose-Protokoll Schicht 3 (Bauplan F.1, PD-017; Umfang erweitert in F.2b): was die Karte gerade zeigt – als flacher
// Schnappschuss, damit die Shell Änderungen erkennt und als HA-Ereignis meldet. Reine Funktionen, keine Texte, kein HA-Zugriff.
// Die Auswertung (ha/prognose/diag_regeln.py) vergleicht diese Werte mit dem Roboter; Feldnamen sind Teil des Vertrags (Abschnitt 4).
import { runOrder, stripModel } from './strip';
import type { RunInput } from './strip';
import type { RoomValues } from './raumwerte';
import type { RoomInfo } from './rooms';

/** Sichtbare Kernwerte: Roboter-Panel (dx-hero), Streifen, Auftrag-Kachel (dx-auftrag). */
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
  /** Knöpfe des Panels als Dienste, in Anzeigereihenfolge */
  knoepfe: string[];
  /** Lade-Blitz sichtbar */
  laden: boolean;
  /** Im Lauf: Werte-Knöpfe als HA-Optionswerte (sweeping, turbo, moist); null = Karte zeigt „–“ */
  modus_ha: string | null;
  saug_ha: string | null;
  wasser_ha: string | null;
  /** Streifen „Jetzt: <Raum>“ – Raum-ID; null ohne Streifen oder beim Durchfahren/Hinweg */
  jetzt: number | null;
  /** Auftrag-Kachel: angekündigte Reihenfolge der Räume; leer außerhalb eines Laufs */
  reihenfolge: number[];
}

/** Eingabe: der Teil der Roboter-Sicht, den das Panel anzeigt (RobotView erfüllt das). */
export interface AnzeigeInput extends RunInput {
  battery: number;
  progress: number | null;
  charging: boolean;
  docked: boolean;
  hero: { big: string; sub: string; errorChip: { text: string } | null; buttons: { service: string }[] };
}

/** Übersetzung Anzeigetext → HA-Optionswert je Wertegruppe (aus dem Vertrag, RV_HA umgekehrt). */
export interface WerteTabellen { modus: Record<string, string>; saug: Record<string, string>; wasser: Record<string, string> }

const haWert = (tab: Record<string, string>, anzeige: string | null | undefined): string | null =>
  anzeige ? (Object.entries(tab).find(([, text]) => text === anzeige)?.[0] ?? null) : null;

export function anzeigeSnapshot(r: AnzeigeInput, roomValues: (id: number) => RoomValues | null = () => null, rooms: readonly RoomInfo[] = [], tab?: WerteTabellen): AnzeigeSnapshot {
  const unterwegs = ['cleaning', 'paused'].includes(r.vac) && !r.docked;
  const strip = unterwegs ? stripModel(r, roomValues, rooms) : null;
  const cur = strip ? roomValues(strip.roomId) : null;
  return {
    kopf: r.hero.big,
    schritt: r.hero.sub,
    hinweis: r.hero.errorChip?.text ?? '',
    akku: r.battery,
    fortschritt: r.progress === null ? null : Math.round(r.progress),
    zustand: r.vac,
    knoepfe: r.hero.buttons.map((b) => b.service),
    laden: r.charging,
    modus_ha: cur && tab ? haWert(tab.modus, cur.modus) : null,
    saug_ha: cur && tab ? haWert(tab.saug, cur.saug) : null,
    wasser_ha: cur && tab && cur.modus !== 'Saugen' ? haWert(tab.wasser, cur.wasser) : null,
    jetzt: strip?.kind === 'jetzt' ? strip.roomId : null,
    reihenfolge: unterwegs ? runOrder(r).order : [],
  };
}

const gleich = (a: unknown, b: unknown): boolean => (Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a) === JSON.stringify(b) : a === b);

/** Namen der geänderten Werte; ohne Vorgänger gilt alles als geändert (erste Meldung nach dem Laden). */
export function anzeigeDiff(prev: AnzeigeSnapshot | null, next: AnzeigeSnapshot): (keyof AnzeigeSnapshot)[] {
  const keys = Object.keys(next) as (keyof AnzeigeSnapshot)[];
  return prev ? keys.filter((k) => !gleich(prev[k], next[k])) : keys;
}

/** Für das Ereignis: Felder ohne Aussage (null, leere Liste) weglassen – die Auswertung lässt Regeln ohne Feld still. */
export function anzeigeWerte(s: AnzeigeSnapshot): Record<string, unknown> {
  return Object.fromEntries(Object.entries(s).filter(([k, v]) => k === 'fortschritt' || (v !== null && !(Array.isArray(v) && !v.length && k !== 'knoepfe'))));
}
