// Diagnose-Protokoll in der Karte (Bauplan F.2b, PD-018): Typen der Protokollzeilen und Tickets, Lesbarmachen einer Zeile,
// Filter der Zeitleiste, Starts des Tages. Reine Funktionen; Texte kommen aus src/i18n/de.ts. Gegenstück: ha/prognose/diag*.py.
import { t } from '../i18n/t';

export interface DiagZeile {
  ts: string;
  art: 'zustand' | 'dienst' | 'automation' | 'skript' | 'anzeige' | 'meldung';
  quelle?: 'benutzer' | 'automation' | 'system' | 'extern';
  wer?: string; durch?: string;
  ent?: string; alt?: string | null; neu?: string | null; attr?: Record<string, [unknown, unknown]>;
  dienst?: string; daten?: Record<string, unknown>;
  name?: string; ausloeser?: string;
  seite?: string; client?: string; geaendert?: string[]; werte?: Record<string, unknown>; puls?: boolean; ende?: boolean;
  text?: string; ticket?: string;
}

export type TicketStatus = 'neu' | 'angenommen' | 'in_arbeit' | 'geloest' | 'geschlossen' | 'verworfen';
export interface TicketKurz { nr: string; status: TicketStatus; schwere: 'fehler' | 'hinweis' | 'info'; quelle: 'auswertung' | 'meldung'; regel: string; titel: string; anzahl: number; angelegt: string; zuletzt: string; wieder: number; dx: string; commit: string; version: string }
export interface Ticket extends TicketKurz { text: string; notizen: { ts: string; wer: string; text: string }[]; verlauf: { ts: string; status: string; wer: string; text?: string }[] }
export interface TicketZaehler { neu: number; in_arbeit: number; geloest: number }

export const TICKET_OFFEN: readonly TicketStatus[] = ['neu', 'angenommen', 'in_arbeit'];
/** Filter der Ticketliste → Status, die er zeigt (leer = alle). „Offen“ schließt „in Arbeit“ ein; verworfene stehen nur unter „Verworfen“ und „Alle“. */
export const TICKET_FILTER = {
  offen: TICKET_OFFEN,
  arbeit: ['angenommen', 'in_arbeit'],
  geloest: ['geloest', 'geschlossen'],
  verworfen: ['verworfen'],
  alle: [],
} as const satisfies Record<string, readonly TicketStatus[]>;
export type TicketFilter = keyof typeof TICKET_FILTER;
export const ticketPasst = (f: TicketFilter, s: TicketStatus): boolean => !TICKET_FILTER[f].length || (TICKET_FILTER[f] as readonly TicketStatus[]).includes(s);
export type ZeilenFilter = 'all' | 'robot' | 'call' | 'auto' | 'card' | 'report';

/** Gruppe einer Zeile für den Filter der Zeitleiste. */
export function zeilenGruppe(z: DiagZeile): Exclude<ZeilenFilter, 'all'> {
  if (z.art === 'dienst') return 'call';
  if (z.art === 'automation' || z.art === 'skript') return 'auto';
  if (z.art === 'anzeige') return 'card';
  if (z.art === 'meldung') return 'report';
  return 'robot';
}

/** Lebenszeichen der Karte ohne Änderung gehören nicht in die Zeitleiste. */
export const zeigbar = (z: DiagZeile): boolean => !(z.art === 'anzeige' && (z.puls || z.ende) && !(z.geaendert ?? []).length);

/** Wer hat es ausgelöst – kurzer Text für die Spalte „Quelle“. */
export function quelleText(z: DiagZeile): string {
  if (z.art === 'anzeige') return t('dev.src.card', { seite: z.seite ?? '' });
  if (z.art === 'meldung') return t('dev.src.report', { wer: z.wer ?? '' });
  if (z.quelle === 'benutzer') return t('dev.src.user', { wer: z.wer ?? '' });
  if (z.quelle === 'automation') return z.durch ? t('dev.src.auto', { name: z.durch }) : t('dev.src.autoPlain');
  return z.quelle === 'system' ? t('dev.src.system') : t('dev.src.extern');
}

/** Hauptteil (fett) und Rest einer Zeile. */
export function zeilenText(z: DiagZeile): { haupt: string; rest: string } {
  if (z.art === 'zustand') {
    const attr = Object.entries(z.attr ?? {}).map(([k, v]) => `${k}: ${String(v[0])} → ${String(v[1])}`).join('; ');
    const wechsel = z.alt === z.neu ? '' : `${z.alt ?? ''} → ${z.neu ?? ''}`;
    return { haupt: z.ent ?? '', rest: [wechsel, attr ? `{${attr}}` : ''].filter(Boolean).join('  ') };
  }
  if (z.art === 'dienst') return { haupt: t('dev.row.call', { dienst: z.dienst ?? '' }), rest: String(z.daten?.entity_id ?? '') };
  if (z.art === 'anzeige') {
    const w = z.werte ?? {};
    return { haupt: t('dev.row.shows'), rest: (z.geaendert ?? []).map((k) => `${k}: ${String(w[k] ?? '–')}`).join('; ') };
  }
  if (z.art === 'meldung') return { haupt: `${z.ticket ?? ''} „${z.text ?? ''}“`.trim(), rest: z.seite ? t('dev.row.page', { seite: z.seite }) : '' };
  return { haupt: z.name ?? z.ent ?? '', rest: z.ausloeser ?? '' };
}

const RUN = ['cleaning', 'paused', 'returning'];
/** Fenster, in dem ein HA-Dienstaufruf vor dem Start als Auslöser gilt (s) – gleiche Zahl wie START_FENSTER_S in diag_regeln.py. */
export const START_FENSTER_S = 90;
/** Kürzere Halte sind kein Laufende (Startfolge cleaning→docked→idle→cleaning) – gleiche Zahl wie GAP_S in diag_regeln.py und domain/timeline. */
export const START_GAP_S = 45;
const START_DIENST = /^(vacuum\.start|dreame_vacuum\.vacuum_clean_|script\.\w*(plan_starten|reinigung|app_szene))/;

export interface DiagStart { ts: string; quelle: string; wer: string; dienst: string }
/** Starts (Wechsel auf cleaning von außerhalb eines Laufs) mit Quelle – gleiche Regel wie tools/diag.js und diag.py. */
export function starts(zeilen: readonly DiagZeile[], tag: string): DiagStart[] {
  const out: DiagStart[] = [];
  let ende = 0;
  zeilen.forEach((z, i) => {
    if (z.art !== 'zustand' || !(z.ent ?? '').startsWith('vacuum.') || z.alt === z.neu) return;
    const t0 = Date.parse(z.ts);
    if (RUN.includes(z.alt ?? '') && !RUN.includes(z.neu ?? '')) ende = t0;
    if (z.neu !== 'cleaning' || RUN.includes(z.alt ?? '')) return;
    if (ende && t0 - ende <= START_GAP_S * 1000) return; // kurzer Halt: derselbe Lauf
    if (!z.ts.startsWith(tag)) return;
    let ruf: DiagZeile | undefined;
    for (let k = i - 1; k >= 0 && !ruf; k--) {
      const c = zeilen[k]!;
      if (t0 - Date.parse(c.ts) > START_FENSTER_S * 1000) break;
      if (c.art === 'dienst' && START_DIENST.test(c.dienst ?? '')) ruf = c;
    }
    const q = z.quelle !== 'extern' || !ruf ? z : ruf;
    out.push({ ts: z.ts, quelle: q.quelle ?? 'extern', wer: q.wer || q.durch || '', dienst: ruf?.dienst ?? '' });
  });
  return out;
}
