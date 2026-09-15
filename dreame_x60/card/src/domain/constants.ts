// Verhaltenszahlen (Regel 16): jede Zahl mit Bedeutung, 1:1 aus v1. Ändern nur mit Eintrag in Bauplan Abschnitt 10a.

/** Zeitleiste: ein Halt (idle/docked/error) kürzer als das unterbricht einen Lauf nicht. */
export const GAP_MS = 45_000;
/** Zeitleiste: erste Zeile eines Laufs entfällt, solange die zweite weniger als 30 s danach beginnt. */
export const STALE_ROOM_MS = 30_000;
/** Zeitleiste: Türschwellen-Flackern A-B-A mit B kürzer als das wird geglättet. */
export const FLICKER_MS = 45_000;
/** Zeitleiste: Fenster für den laufenden Auftrag = jetzt minus so viele Stunden. */
export const CUR_WINDOW_H = 8;
/** Zeitleiste: Fenster eines Protokoll-Eintrags = Start … Start + Dauer + so viele Minuten. */
export const HIST_TAIL_MIN = 90;
/** Schätzung: Heimfahrt am Ende in Minuten. */
export const HOME_MIN = 3;
/** Schätzung: Aufschlag je Ladestopp (Andocken, Anfahren) in Minuten. */
export const CHARGE_EXTRA_MIN = 4;
/** Schätzung: Ladekurve wechselt bei diesem Akkustand von schnell auf langsam (fest, unabhängig von weiter_pct). */
export const CHARGE_FAST_LIMIT_PCT = 80;
/** Schätzung: Raumfläche ohne Lernwert in m². */
export const DEFAULT_ROOM_AREA_M2 = 8;
/** Schätzung: Erfahrungswerte ohne jede gelernte Rate (min/m², %/min) – trocken (Saugen) und nass (alles andere). */
export const DEFAULT_RATES = {
  Saugen: { min_pro_m2: 0.9, pct_pro_min: 0.3 },
  nass: { min_pro_m2: 1.6, pct_pro_min: 0.42 },
} as const;
/** Schätzung: Akkufaktor je Saugstufe relativ zu Standard. */
export const SUCT_F: Record<string, number> = { Leise: 0.8, Standard: 1, Stark: 1.25, Turbo: 1.6 };
/** Schätzung: Ladekurve ohne Lernwert (%/min bis 80, %/min darüber, Rückkehr bei, weiter ab). */
export const DEFAULT_LADEN = { schnell_pct_min: 1.1, langsam_pct_min: 0.5, rueckkehr_pct: 15, weiter_pct: 80 } as const;
/** Schätzung: Mopp-Wäsche ohne Lernwert (Minuten vor Start, zwischendurch; alle nach_m2 m² – Standard aus number.heidi_self_clean_area). */
export const DEFAULT_WAESCHE = { vor_start_min: 4, zwischen_min: 5, nach_m2: 25 } as const;
/** Rückkehr: übliche Rückkehrzeit, wenn der Helfer keinen Wert hat. */
export const DEFAULT_RUECKKEHR = '17:00';
/** Rückkehr: Mindesttage der Prognose, wenn der Helfer keinen Wert hat. */
export const DEFAULT_MINDESTTAGE = 14;
