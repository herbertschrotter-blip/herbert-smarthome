// Kopf-Texte und -Knöpfe (Bauplan 2.5, Regeln Abschnitt 6): reine Funktion aus dem Roboterzustand, 1:1 wie v1 _hero.
// Texte aus src/i18n/de.ts (4.14): status.* (STATUS_DE), task.* (TASK), error.* (ERR_DE), head.*, button.*.
import { lookup, t } from '../i18n/t';

export interface HeroInput {
  /** vacuum.heidi state */
  vac: string;
  /** sensor.heidi_status */
  status: string;
  /** sensor.heidi_error */
  error: string;
  /** vacuum.heidi attribute has_error */
  hasError: boolean;
  /** sensor.heidi_task_status */
  task: string;
  /** sensor.heidi_phase */
  phase: string;
  /** input_boolean.heidi_auto_lauf an */
  autoLauf: boolean;
  /** input_text.heidi_auto_letzter_plan */
  autoLetzterPlan: string;
  /** time.heidi_dnd_start / _end („HH:MM[:SS]“ oder leer) */
  dndStart: string;
  dndEnd: string;
  /** sensor.heidi_current_room, schon in Anzeigesprache („–“ wenn unbekannt) */
  room: string;
}

export type VacuumService = 'start' | 'pause' | 'stop' | 'return_to_base' | 'locate';
export interface HeroButton { service: VacuumService; label: string; primary: boolean; icon: string }
export type DotLevel = 'accent' | 'warning' | 'danger' | 'positive';

export interface HeroModel {
  big: string;
  sub: string;
  /** Farbe des Statuspunkts: cleaning → accent, returning → warning, error → danger, sonst positive */
  dot: DotLevel;
  buttons: HeroButton[];
  /** Hinweis-/Fehler-Chip: `danger` bei has_error, sonst `warning`; null bei no_error/unavailable. `text` = Kurztext (höchstens zwei Wörter) */
  errorChip: { text: string; level: 'danger' | 'warning' } | null;
  /** Langtext zum Chip (Tooltip / Detail, PD-015); leer ohne Chip oder ohne Eintrag */
  errorLong: string;
  /** Raum-Chip nur beim Reinigen ohne gültige Phase */
  roomChip: string | null;
  /** „HH:MM–HH:MM“ */
  dnd: string;
  phaseOk: boolean;
}

const EMPTY = ['unknown', 'unavailable', ''];
const cap = (s: string): string => s.replace(/^./, (c) => c.toUpperCase());

const B = (service: VacuumService, icon: string, label: string, primary = false): HeroButton => ({ service, icon, label, primary });

/** Status des Roboters als Text (wie v1 STATUS_DE); unbekannte Werte lesbar gemacht. */
export const statusText = (status: string): string => lookup('status', status) ?? status.replace(/_/g, ' ');

/** Text zum Fehler-/Hinweiscode (wie v1 ERR_DE, ergänzt um alle Codes der Integration); unbekannte Codes lesbar gemacht. */
export const errorText = (code: string): string => lookup('error', code) ?? code.replace(/_/g, ' ');

/** Knöpfe je Zustand (Reihenfolge fest, Regel „Texte, Knopfreihenfolge nicht ändern“). */
export function heroButtons(vac: string): HeroButton[] {
  switch (vac) {
    case 'cleaning': return [B('pause', 'mdi:pause', t('button.pause'), true), B('stop', 'mdi:stop', t('button.stop')), B('return_to_base', 'mdi:home-import-outline', t('button.station'))];
    case 'paused': return [B('start', 'mdi:play', t('button.resume'), true), B('stop', 'mdi:stop', t('button.stop')), B('return_to_base', 'mdi:home-import-outline', t('button.station'))];
    case 'returning': return [B('pause', 'mdi:pause', t('button.pause'), true), B('stop', 'mdi:stop', t('button.stop')), B('locate', 'mdi:map-marker', t('button.locate'))];
    case 'docked': return [B('start', 'mdi:play', t('button.start'), true), B('locate', 'mdi:map-marker', t('button.locate'))];
    default: return [B('start', 'mdi:play', t('button.start'), true), B('return_to_base', 'mdi:home-import-outline', t('button.station')), B('locate', 'mdi:map-marker', t('button.locate'))];
  }
}

export function heroModel(i: HeroInput): HeroModel {
  const phaseOk = !EMPTY.includes(i.phase);
  const statusTxt = phaseOk ? i.phase : cap(statusText(i.status));
  const auto = i.autoLauf ? i.autoLetzterPlan : '';
  const job = auto && !EMPTY.includes(auto) ? auto : (lookup('task', i.task) ?? t('task.default'));
  let big = statusTxt, sub = '';
  if (i.vac === 'error') big = t('head.error');
  else if (i.vac === 'paused') { big = t('head.paused'); sub = job; }
  else if (i.vac === 'returning') { big = t('head.returning'); sub = phaseOk && i.phase !== big ? i.phase : ''; }
  else if (i.vac === 'cleaning') { big = job; sub = phaseOk ? i.phase : ''; }
  if (sub === big) sub = '';
  const dot: DotLevel = i.vac === 'cleaning' ? 'accent' : i.vac === 'returning' ? 'warning' : i.vac === 'error' ? 'danger' : 'positive';
  const errorChip = i.error !== 'no_error' && i.error !== 'unavailable'
    ? { text: errorText(i.error), level: i.hasError ? 'danger' as const : 'warning' as const }
    : null;
  const errorLong = errorChip ? (lookup('errorLong', i.error) ?? '') : '';
  const roomChip = i.room !== t('common.dash') && i.vac === 'cleaning' && !phaseOk ? i.room : null;
  const dnd = `${(i.dndStart || '').slice(0, 5)}–${(i.dndEnd || '').slice(0, 5)}`;
  return { big, sub, dot, buttons: heroButtons(i.vac), errorChip, errorLong, roomChip, dnd, phaseOk };
}
