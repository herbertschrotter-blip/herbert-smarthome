// Raumwerte-Codec (Bauplan 2.1, Regeln Abschnitt 6): Kurzformat `1:B/T/V/-/2;6:S/L/-/-/1`
// = Raum:Modus/Saug/Wasser/Route/Wdh. Verhalten 1:1 wie v1 parseRaum/encodeRaum.
import { ROOM_VALUE_CODES } from '../ha/contract';
import type { RoomId } from '../ha/contract';

const { RV } = ROOM_VALUE_CODES;

export type Modus = (typeof RV.modus)[keyof typeof RV.modus];
export type Saug = (typeof RV.saug)[keyof typeof RV.saug];
export type Wasser = (typeof RV.wasser)[keyof typeof RV.wasser];
export type Route = (typeof RV.route)[keyof typeof RV.route];
export type Wdh = '1' | '2' | '3';

/** Werte eines Raums in deutscher Schreibweise (wie die Helfer-Optionen). */
export interface RoomValues {
  modus: Modus;
  saug: Saug;
  wasser: Wasser | null;
  route: Route | null;
  wdh: Wdh;
}

/** Raumwerte je Raum-ID (nur 1..7). */
export type RaumMap = Partial<Record<RoomId, RoomValues>>;

/** Eingabe für encodeRaum: darf unvollständig oder mit fremden Werten sein (Draft aus dem Editor). */
export interface RoomValuesInput {
  modus?: string | null;
  saug?: string | null;
  wasser?: string | null;
  route?: string | null;
  wdh?: string | null;
}

function lookup<T extends Record<string, string>>(table: T, code: string | undefined): T[keyof T] | undefined {
  return code !== undefined && Object.prototype.hasOwnProperty.call(table, code) ? (table[code] as T[keyof T]) : undefined;
}

function inverse(table: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(table).map(([k, v]) => [v, k]));
}
const INV = { modus: inverse(RV.modus), saug: inverse(RV.saug), wasser: inverse(RV.wasser), route: inverse(RV.route) };

/**
 * Kurzformat → Raumwerte. Unbekannter Modus → „Saugen“, unbekannte Saugstufe → „Standard“,
 * Wasser/Route nur, wenn der Code bekannt ist (sonst null), Wdh nur 1–3 (sonst „1“),
 * IDs außerhalb 1..7 und Einträge ohne Doppelpunkt werden ignoriert; spätere Einträge überschreiben frühere.
 */
export function parseRaum(s: string | null | undefined): RaumMap {
  const out: RaumMap = {};
  String(s ?? '').split(';').forEach((part) => {
    const [id, rest] = part.split(':');
    if (!id || !rest) return;
    const f = rest.split('/');
    const n = parseInt(id, 10);
    if (!(n >= 1 && n <= 7)) return;
    out[n as RoomId] = {
      modus: lookup(RV.modus, f[0]) ?? 'Saugen',
      saug: lookup(RV.saug, f[1]) ?? 'Standard',
      wasser: lookup(RV.wasser, f[2]) ?? null,
      route: lookup(RV.route, f[3]) ?? null,
      wdh: /^[123]$/.test(f[4] ?? '') ? (f[4] as Wdh) : '1',
    };
  });
  return out;
}

/**
 * Raumwerte → Kurzformat, nach Raum-ID aufsteigend. Unbekannte Werte werden „-“;
 * Wasser nur bei Modus ≠ „Saugen“, Route nur bei „Nur Wischen“, Wdh leer → „1“.
 */
export function encodeRaum(o: Record<string | number, RoomValuesInput | undefined>): string {
  return Object.keys(o)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b)
    .map((n) => {
      const v = o[n] ?? {};
      const code = (k: keyof typeof INV) => { const val = v[k]; return (val != null && INV[k][val]) || '-'; };
      return `${n}:${code('modus')}/${code('saug')}/${v.modus === 'Saugen' ? '-' : code('wasser')}/${v.modus === 'Nur Wischen' ? code('route') : '-'}/${v.wdh || '1'}`;
    })
    .join(';');
}
