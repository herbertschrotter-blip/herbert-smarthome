// Beschriftungen (Bauplan 2.6): Tage, Räume, Minuten, Datum, Uhrzeit – Ausgabeformate 1:1 wie v1.
import { DAYS, ROOMS, ROOMS_DE, roomById } from '../config';

const LOCALE = 'de-AT';

/** Wochentage-Maske (Mo..So) → „Täglich“, „Manuell“, „Mo–Fr“, „Sa + So“, sonst Kürzel (≤ 3 mit „ + “, sonst mit Leerzeichen). */
export function dayLabel(tage: readonly boolean[]): string {
  const n = tage.filter(Boolean).length;
  if (n === 7) return 'Täglich';
  if (n === 0) return 'Manuell';
  if (tage.every((v, i) => v === (i < 5))) return 'Mo–Fr';
  if (tage.every((v, i) => v === (i >= 5))) return 'Sa + So';
  return DAYS.filter((_, i) => tage[i]).join(n > 3 ? ' ' : ' + ');
}

/** Raum-IDs (in gegebener Reihenfolge) → „Alle“, „keine Räume“ oder Kurznamen mit Komma; unbekannte IDs entfallen. */
export function roomLabel(ids: Iterable<number>): string {
  const list = [...ids];
  if (list.length === ROOMS.length && new Set(list).size === ROOMS.length) return 'Alle';
  if (!list.length) return 'keine Räume';
  return list.map((id) => roomById(id)?.short).filter((s): s is string => !!s).join(', ');
}

/** Minuten → „N min“ oder „H h MM min“ (gerundet). */
export function fmtMin(m: number): string {
  const r = Math.round(m);
  return r < 60 ? `${r} min` : `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')} min`;
}

/** Dauer in der Zeitleiste: „< 1 min“, „N min“, „H h MM min“ (wie v1 _timelineHtml dur). */
export function fmtDur(m: number): string {
  return m < 1 ? '< 1 min' : m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`;
}

/** Uhrzeit „HH:MM“ (de-AT) aus ms, ISO oder Date. */
export function fmtTime(t: number | string | Date): string {
  const d = t instanceof Date ? t : new Date(t);
  return isNaN(d.getTime()) ? '–' : d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** „heute HH:MM“ oder „DD.MM. HH:MM“; „–“ bei ungültigem Datum. `now` nur für Tests. */
export function fmtDate(iso: string | number | Date, now: Date = new Date()): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return '–';
  const same = d.toDateString() === now.toDateString();
  return (same ? 'heute' : d.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' })) + ' ' + d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Protokoll-Zeitstempel (Sekunden) → „Di 15.09. 06:24“ (wie v1 _history fmt). */
export function fmtHistTs(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Raumname der Integration → Anzeige; „–“ bei unbekannt; deutsch, wenn input_select.heidi_raumnamen = Deutsch. */
export function roomName(raw: string | null | undefined, deutsch: boolean): string {
  if (!raw || ['unknown', 'unavailable'].includes(raw)) return '–';
  return deutsch ? (ROOMS_DE[raw] ?? raw) : raw;
}
