// Dauer & Akku (Bauplan 2.2, Regeln Abschnitt 6): simuliert einen Planer-Eintrag Raum für Raum – Mopp-Wäschen,
// Ladestopps, Heimfahrt. Reine Funktionen, Verhalten 1:1 wie v1 _estimate/_rate/_chargeMin/_restMin.
import { roomById } from '../config';
import { CHARGE_EXTRA_MIN, CHARGE_FAST_LIMIT_PCT, DEFAULT_LADEN, DEFAULT_MINDESTTAGE, DEFAULT_RATES, DEFAULT_ROOM_AREA_M2, DEFAULT_RUECKKEHR, DEFAULT_WAESCHE, HOME_MIN, SUCT_F } from './constants';
import type { RoomValuesInput } from './raumwerte';

/** Lernwerte aus sensor.heidi_lernwerte (Attribute). Felder können fehlen. */
export interface LernRate { min_pro_m2: number; pct_pro_min: number; laeufe: number; minuten?: number; flaeche?: number }
export interface Lernwerte {
  raten?: Record<string, LernRate>;
  raeume?: Record<string, { flaeche?: number | null; belag?: string; laeufe?: number }>;
  laden?: { schnell_pct_min: number; langsam_pct_min: number; rueckkehr_pct: number; weiter_pct: number; gelernt?: boolean };
  waesche?: { vor_start_min: number; zwischen_min: number; nach_m2: number; gelernt?: boolean };
  laeufe_gesamt?: number;
}

/** Planer-Eintrag, wie ihn readPlan liefert (Raumliste in gespeicherter Reihenfolge). */
export interface PlanForEstimate {
  raeume: number[];
  modus: string;
  saug: string;
  wasser?: string | null;
  route?: string | null;
  wdh: string;
  spSaug: string;
  spWdh: string;
  hoSaug: string;
  hoWdh: string;
  raum: Record<string | number, RoomValuesInput | undefined>;
}

export type Variante = 'normal' | 'schnell' | 'leise';

export interface Rate { min_pro_m2: number; pct_pro_min: number; gelernt: boolean }

export type Step =
  | { typ: 'wasch'; text: string; min: number; batt: number }
  | { typ: 'laden'; text: string; min: number; batt: number }
  | { typ: 'raum'; id: number; text: string; sub: string; min: number; batt: number; area: number; gelernt: boolean }
  | { typ: 'heim'; text: string; min: number; batt: number };

export interface Estimate {
  steps: Step[];
  total: number;
  batt0: number;
  battEnd: number;
  charges: number;
  unlearned: number;
  used: number;
  order: number[];
}

export interface EstimateOptions {
  variante?: Variante;
  /** Feste Einstellung für alle Räume (Vergleichslinie im Diagramm). */
  uniform?: Partial<{ modus: string; saug: string; wdh: string; wasser: string }> | null;
  /** Akkustand zu Beginn in %. */
  batt0: number;
  /** number.heidi_self_clean_area – Standard für nach_m2, wenn die Lernwerte keine Wäsche kennen. */
  selfCleanArea?: number;
}

/** Rate für Modus/Saugstufe: gelernt, sonst gelernte Rate desselben Modus × Faktor, sonst Erfahrungswert. */
export function rate(lern: Lernwerte, modus: string, saug: string): Rate {
  const r = lern.raten?.[`${modus}/${saug}`];
  if (r && r.laeufe > 0) return { min_pro_m2: r.min_pro_m2, pct_pro_min: r.pct_pro_min, gelernt: true };
  const base = Object.entries(lern.raten ?? {})
    .filter(([k, v]) => k.startsWith(`${modus}/`) && v.laeufe > 0)
    .map(([k, v]) => ({ min_pro_m2: v.min_pro_m2, pct_pro_min: v.pct_pro_min, f: SUCT_F[k.split('/')[1] ?? ''] ?? 1 }))[0];
  const d = modus === 'Saugen' ? DEFAULT_RATES.Saugen : DEFAULT_RATES.nass;
  const b = base ?? { min_pro_m2: d.min_pro_m2, pct_pro_min: d.pct_pro_min, f: 1 };
  return { min_pro_m2: b.min_pro_m2, pct_pro_min: (b.pct_pro_min * (SUCT_F[saug] ?? 1)) / b.f, gelernt: false };
}

/** Ladezeit in Minuten von `from` auf `to` %: schnell bis 80 %, langsam darüber (Grenze fest 80, nicht weiter_pct). */
export function chargeMin(from: number, to: number, laden: { schnell_pct_min: number; langsam_pct_min: number }): number {
  let m = 0;
  if (from < CHARGE_FAST_LIMIT_PCT) m += (Math.min(to, CHARGE_FAST_LIMIT_PCT) - from) / laden.schnell_pct_min;
  if (to > CHARGE_FAST_LIMIT_PCT) m += (to - Math.max(from, CHARGE_FAST_LIMIT_PCT)) / laden.langsam_pct_min;
  return Math.max(0, m);
}

/** Simulation eines Eintrags. `null`, wenn keine Lernwerte vorliegen (wie v1). */
export function estimate(p: PlanForEstimate, lern: Lernwerte | null, opts: EstimateOptions): Estimate | null {
  if (!lern || !lern.raten) return null;
  const variante = opts.variante ?? 'normal';
  const batt0 = opts.batt0;
  const order = [...p.raeume]; // Heidi fährt in der Reihenfolge der Raumliste des Eintrags
  const std: RoomValuesInput = variante === 'schnell' ? { modus: 'Saugen', saug: p.spSaug, wdh: p.spWdh }
    : variante === 'leise' ? { modus: 'Saugen', saug: p.hoSaug, wdh: p.hoWdh }
    : { modus: p.modus, saug: p.saug, wdh: p.wdh };
  const L = lern.laden ?? DEFAULT_LADEN;
  const W = lern.waesche ?? { ...DEFAULT_WAESCHE, nach_m2: opts.selfCleanArea ?? DEFAULT_WAESCHE.nach_m2 };
  const setting = (id: number): RoomValuesInput => (opts.uniform ? { ...std, ...opts.uniform } : variante === 'normal' ? { ...std, ...(p.raum[id] ?? {}) } : std);

  const steps: Step[] = [];
  let t = 0, batt = batt0, since = 0, charges = 0, unlearned = 0, used = 0;
  const wet = order.some((id) => setting(id).modus !== 'Saugen');
  if (wet) { steps.push({ typ: 'wasch', text: 'Wäscht Mopp vor dem Start', min: W.vor_start_min, batt }); t += W.vor_start_min; }
  for (const id of order) {
    const s = setting(id), modus = s.modus ?? 'Saugen', saug = s.saug ?? 'Standard';
    const r = rate(lern, modus, saug);
    const area = lern.raeume?.[String(id)]?.flaeche || DEFAULT_ROOM_AREA_M2;
    const min = area * r.min_pro_m2 * (parseInt(s.wdh ?? '', 10) || 1), drain = min * r.pct_pro_min;
    if (!r.gelernt) unlearned++;
    if (batt - drain < L.rueckkehr_pct) {
      const cmin = chargeMin(batt, L.weiter_pct, L) + CHARGE_EXTRA_MIN;
      steps.push({ typ: 'laden', text: `Lädt ${Math.round(batt)} % → ${L.weiter_pct} %`, min: cmin, batt: L.weiter_pct });
      t += cmin; batt = L.weiter_pct; charges++;
    }
    batt -= drain; t += min; since += area; used += drain;
    steps.push({ typ: 'raum', id, text: roomById(id)?.short ?? String(id), sub: `${modus} · ${saug} · ${s.wdh}×${modus !== 'Saugen' && s.wasser ? ' · ' + s.wasser : ''}`, min, batt, area, gelernt: r.gelernt });
    if (modus !== 'Saugen' && since >= W.nach_m2) { steps.push({ typ: 'wasch', text: 'Wäscht Mopp zwischendurch', min: W.zwischen_min, batt }); t += W.zwischen_min; since = 0; }
  }
  steps.push({ typ: 'heim', text: 'Fährt zur Station', min: HOME_MIN, batt }); t += HOME_MIN;
  return { steps, total: t, batt0, battEnd: batt, charges, unlearned, used, order };
}

/** Eingaben für die Rückkehr-Rechnung (Fallback, wenn sensor.heidi_automatik_status kein rest_min liefert). */
export interface RestMinInput {
  prognoseAktiv: boolean;
  abweichungHeute: boolean;
  prognoseTage: number;
  mindesttage: number | null;
  rueckkehrMin: number;
  /** input_datetime.heidi_rueckkehr, „HH:MM[:SS]“ oder null */
  rueckkehr: string | null;
  now: Date;
}

/** Minuten bis zur erwarteten Rückkehr – wie v1 _restMin (JS-Fallback zu rest_min aus 0.4). */
export function restMinFallback(i: RestMinInput): { min: number; quelle: string } {
  const useProg = i.prognoseAktiv && !i.abweichungHeute && i.prognoseTage >= (i.mindesttage ?? DEFAULT_MINDESTTAGE) && i.rueckkehrMin > 0;
  if (useProg) return { min: i.rueckkehrMin, quelle: 'Prognose' };
  const rk = (i.rueckkehr || DEFAULT_RUECKKEHR).slice(0, 5);
  return { min: parseInt(rk.slice(0, 2), 10) * 60 + parseInt(rk.slice(3, 5), 10) - i.now.getHours() * 60 - i.now.getMinutes(), quelle: `übliche Rückkehr ${rk}` };
}
