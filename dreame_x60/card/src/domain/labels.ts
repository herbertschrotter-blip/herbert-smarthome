// Beschriftungen (Bauplan 2.6): Tage, Räume, Minuten, Datum, Uhrzeit – Ausgabeformate 1:1 wie v1. Texte aus src/i18n (4.14).
import { lookup, t, tx } from '../i18n/t';
import { roomById } from './rooms';
import type { RoomInfo } from './rooms';

const LOCALE = 'de-AT';
const DASH = t('common.dash');

/** Wochentage-Maske (Mo..So) → „Täglich“, „Manuell“, „Mo–Fr“, „Sa + So“, sonst Kürzel (≤ 3 mit „ + “, sonst mit Leerzeichen). */
export function dayLabel(tage: readonly boolean[]): string {
  const n = tage.filter(Boolean).length;
  if (n === 7) return t('label.daily');
  if (n === 0) return t('label.manual');
  if (tage.every((v, i) => v === (i < 5))) return t('label.weekdays');
  if (tage.every((v, i) => v === (i >= 5))) return t('label.weekend');
  return tage.map((on, i) => (on ? tx(`day.${i}`) : null)).filter((d): d is string => d !== null).join(n > 3 ? ' ' : ' + ');
}

/** Raum-IDs (in gegebener Reihenfolge) → „Alle“, „keine Räume“ oder Kurznamen mit Komma; unbekannte IDs entfallen. `rooms` = Räume des Roboters (Profil). */
export function roomLabel(ids: Iterable<number>, rooms: readonly RoomInfo[]): string {
  const list = [...ids];
  if (rooms.length && list.length === rooms.length && new Set(list).size === rooms.length) return t('label.allRooms');
  if (!list.length) return t('label.noRooms');
  return list.map((id) => roomById(rooms, id)?.short).filter((s): s is string => !!s).join(', ');
}

/** Minuten → „N min“ oder „H h MM min“ (gerundet). */
export function fmtMin(m: number): string {
  const r = Math.round(m);
  return r < 60 ? t('label.min', { n: r }) : t('label.hmin', { h: Math.floor(r / 60), m: String(r % 60).padStart(2, '0') });
}

/** Dauer in der Zeitleiste: „< 1 min“, „N min“, „H h MM min“ (wie v1 _timelineHtml dur). */
export function fmtDur(m: number): string {
  return m < 1 ? t('label.lessMin') : m < 60 ? t('label.min', { n: Math.round(m) }) : t('label.hmin', { h: Math.floor(m / 60), m: String(Math.round(m % 60)).padStart(2, '0') });
}

/** Uhrzeit „HH:MM“ (de-AT) aus ms, ISO oder Date. */
export function fmtTime(t0: number | string | Date): string {
  const d = t0 instanceof Date ? t0 : new Date(t0);
  return isNaN(d.getTime()) ? DASH : d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** „heute HH:MM“ oder „DD.MM. HH:MM“; „–“ bei ungültigem Datum. `now` nur für Tests. */
export function fmtDate(iso: string | number | Date, now: Date = new Date()): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return DASH;
  const same = d.toDateString() === now.toDateString();
  return (same ? t('label.today') : d.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' })) + ' ' + d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Protokoll-Zeitstempel (Sekunden) → „Di 15.09. 06:24“ (wie v1 _history fmt). */
export function fmtHistTs(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Raumname der Integration → Anzeige; „–“ bei unbekannt; deutsch, wenn input_select.heidi_raumnamen = Deutsch (Texte room.*). */
export function roomName(raw: string | null | undefined, deutsch: boolean): string {
  if (!raw || ['unknown', 'unavailable'].includes(raw)) return DASH;
  return deutsch ? (lookup('room', raw) ?? raw) : raw;
}
