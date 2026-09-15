// Zeitleiste eines Laufs (Bauplan 2.3, Regeln Abschnitt 6) aus der HA-Historie von sensor.heidi_phase und
// vacuum.heidi. Reine Funktionen, Verhalten 1:1 wie v1 _loadTimeline/_history.
import { PHASE_IDLE, VAC_RUN } from '../config';
import { CUR_WINDOW_H, FLICKER_MS, GAP_MS, HIST_TAIL_MIN, STALE_ROOM_MS } from './constants';

/** Ein Historien-Punkt: Zeit in ms, Zustand. */
export interface HistPoint { t: number; state: string }
/** Zeile der Zeitleiste: Beginn, Text, Dauer in Minuten. */
export interface TimelineRow extends HistPoint { dur: number }
/** Laufabschnitt: Start und Ende in ms (Ende null = läuft noch). */
export interface Period { s: number; e: number | null }

/** Rohantwort von history/period (minimal_response): je Entität eine Liste, erster Eintrag trägt entity_id. */
export type HistoryResponse = Array<Array<{ entity_id?: string; state: string; last_changed?: string; last_updated?: string }>> | null | undefined;

/** Punkte einer Entität aus der API-Antwort (wie v1 `pick`). */
export function historyPoints(res: HistoryResponse, entityId: string): HistPoint[] {
  const list = (res ?? []).find((l) => l && l[0] && l[0].entity_id === entityId) ?? [];
  return list.map((x) => ({ t: new Date(x.last_changed ?? x.last_updated ?? 0).getTime(), state: x.state }));
}

const isRun = (st: string): boolean => (VAC_RUN as readonly string[]).includes(st);

/**
 * Laufabschnitte aus den Roboterzuständen. Ein Lauf = cleaning/paused/returning; ein Halt (idle/docked/error)
 * kürzer als GAP_MS unterbricht ihn nicht, der erste Halt ≥ GAP_MS beendet ihn. Läuft der letzte Abschnitt noch
 * (oder dauert sein Halt bis `nowMs` noch keine GAP_MS), ist e = null.
 */
export function runsFromVacuum(vt: HistPoint[], nowMs: number): Period[] {
  const periods: Period[] = [];
  let ps: number | null = null, gap: number | null = null;
  for (const v of vt) {
    if (isRun(v.state)) {
      if (ps !== null && gap !== null && v.t - gap >= GAP_MS) { periods.push({ s: ps, e: gap }); ps = null; }
      if (ps === null) ps = v.t;
      gap = null;
    } else if (ps !== null && gap === null) {
      gap = v.t;
    }
  }
  if (ps !== null) periods.push({ s: ps, e: gap !== null && nowMs - gap >= GAP_MS ? gap : null });
  return periods;
}

export interface TimelineInput {
  /** Punkte von sensor.heidi_phase */
  phase: HistPoint[];
  /** Punkte von vacuum.heidi */
  vac: HistPoint[];
  /** 'cur' = laufender Auftrag (letzter Abschnitt), sonst Protokoll-Eintrag (Abschnitt zum Fenster). */
  key: 'cur' | 'entry';
  /** Fenster der Abfrage in ms. */
  startMs: number;
  endMs: number;
  nowMs: number;
}

export interface Timeline { rows: TimelineRow[]; end: number | null }

/** Zeilen der Zeitleiste für den Lauf im Fenster (Regeln: Abschnitt 6, Zeile timeline.ts). */
export function timelineRows(i: TimelineInput): Timeline {
  const periods = runsFromVacuum(i.vac, i.nowMs);
  const p: Period | null = i.key === 'cur'
    ? (periods.length ? periods[periods.length - 1]! : null)
    : (periods.find((x) => x.e === null || x.e > i.startMs - 60_000) ?? null);
  const start = p ? p.s : i.startMs;
  const stop = p && p.e !== null ? p.e : Math.min(i.endMs, i.nowMs);
  const end = p ? p.e : null;
  let rows: HistPoint[] = p ? i.phase.filter((r) => r.t >= start - 5_000 && r.t < stop && !(PHASE_IDLE as readonly string[]).includes(r.state)) : [];
  rows = rows.filter((r, idx) => idx === 0 || r.state !== rows[idx - 1]!.state);
  // Veralteter Raum in den ersten Sekunden (Roboter meldet noch den letzten Raum) ausblenden
  while (rows.length > 1 && rows[1]!.t - rows[0]!.t < STALE_ROOM_MS) rows.shift();
  // Flackern zwischen zwei Räumen an der Türschwelle (A B A, B < FLICKER_MS) glätten
  for (let k = 1; k + 1 < rows.length; k++) {
    if (rows[k - 1]!.state === rows[k + 1]!.state && rows[k + 1]!.t - rows[k]!.t < FLICKER_MS) { rows.splice(k, 2); k--; }
  }
  const out: TimelineRow[] = rows.map((r, idx) => ({ ...r, dur: ((idx + 1 < rows.length ? rows[idx + 1]!.t : stop) - r.t) / 60_000 }));
  return { rows: out, end };
}

/** Gesamtdauer der Zeitleiste in Minuten (erste Zeile bis Ende der letzten). */
export function timelineTotalMin(rows: TimelineRow[]): number {
  if (!rows.length) return 0;
  const last = rows[rows.length - 1]!;
  return (last.t + last.dur * 60_000 - rows[0]!.t) / 60_000;
}

/** Fenster für den laufenden Auftrag: jetzt − CUR_WINDOW_H … jetzt (Sekunden, wie v1). */
export function curWindow(nowSec: number): { startSec: number; endSec: number } {
  return { startSec: nowSec - CUR_WINDOW_H * 3600, endSec: nowSec };
}

/**
 * Fenster eines Protokoll-Eintrags: Start … min(Start + Dauer + HIST_TAIL_MIN, nächster Lauf, jetzt) in Sekunden.
 * `nextStartSec` = Start des zeitlich nächsten (jüngeren) Eintrags, sonst null.
 */
export function entryWindow(startSec: number, durMin: number, nextStartSec: number | null, nowSec: number): { startSec: number; endSec: number } {
  const ts = Math.floor(startSec);
  const end = Math.min(ts + durMin * 60 + HIST_TAIL_MIN * 60, nextStartSec !== null ? Math.floor(nextStartSec) : nowSec, nowSec);
  return { startSec: ts, endSec: end };
}
