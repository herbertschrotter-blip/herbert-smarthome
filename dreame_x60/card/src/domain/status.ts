// Kopf-Texte und -Knöpfe (Bauplan 2.5, Regeln Abschnitt 6): reine Funktion aus dem Roboterzustand, 1:1 wie v1 _hero.
import { ERR_DE, STATUS_DE } from '../config';

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
  /** Hinweis-/Fehler-Chip: `danger` bei has_error, sonst `warning`; null bei no_error/unavailable */
  errorChip: { text: string; level: 'danger' | 'warning' } | null;
  /** Raum-Chip nur beim Reinigen ohne gültige Phase */
  roomChip: string | null;
  /** „HH:MM–HH:MM“ */
  dnd: string;
  phaseOk: boolean;
}

/** Auftragsart aus sensor.heidi_task_status (wie v1 TASK). */
export const TASK_DE: Record<string, string> = {
  room_cleaning: 'Reinigt Räume', zone_cleaning: 'Reinigt Zone', spot_cleaning: 'Reinigt Punkt', cleaning: 'Reinigt',
  cruising: 'Fährt', mapping: 'Erstellt Karte', fast_mapping: 'Erstellt Karte',
};

const EMPTY = ['unknown', 'unavailable', ''];
const cap = (s: string): string => s.replace(/^./, (c) => c.toUpperCase());

const B = (service: VacuumService, icon: string, label: string, primary = false): HeroButton => ({ service, icon, label, primary });

/** Knöpfe je Zustand (Reihenfolge fest, Regel „Texte, Knopfreihenfolge nicht ändern“). */
export function heroButtons(vac: string): HeroButton[] {
  switch (vac) {
    case 'cleaning': return [B('pause', 'mdi:pause', 'Pause', true), B('stop', 'mdi:stop', 'Stopp'), B('return_to_base', 'mdi:home-import-outline', 'Station')];
    case 'paused': return [B('start', 'mdi:play', 'Weiter', true), B('stop', 'mdi:stop', 'Stopp'), B('return_to_base', 'mdi:home-import-outline', 'Station')];
    case 'returning': return [B('pause', 'mdi:pause', 'Pause', true), B('stop', 'mdi:stop', 'Stopp'), B('locate', 'mdi:map-marker', 'Orten')];
    case 'docked': return [B('start', 'mdi:play', 'Start', true), B('locate', 'mdi:map-marker', 'Orten')];
    default: return [B('start', 'mdi:play', 'Start', true), B('return_to_base', 'mdi:home-import-outline', 'Station'), B('locate', 'mdi:map-marker', 'Orten')];
  }
}

export function heroModel(i: HeroInput): HeroModel {
  const phaseOk = !EMPTY.includes(i.phase);
  const statusTxt = phaseOk ? i.phase : cap((STATUS_DE[i.status] ?? i.status.replace(/_/g, ' ')));
  const auto = i.autoLauf ? i.autoLetzterPlan : '';
  const job = auto && !EMPTY.includes(auto) ? auto : (TASK_DE[i.task] ?? 'Reinigt');
  let big = statusTxt, sub = '';
  if (i.vac === 'error') big = 'Fehler';
  else if (i.vac === 'paused') { big = 'Pausiert'; sub = job; }
  else if (i.vac === 'returning') { big = 'Fährt zur Station'; sub = phaseOk && i.phase !== big ? i.phase : ''; }
  else if (i.vac === 'cleaning') { big = job; sub = phaseOk ? i.phase : ''; }
  if (sub === big) sub = '';
  const dot: DotLevel = i.vac === 'cleaning' ? 'accent' : i.vac === 'returning' ? 'warning' : i.vac === 'error' ? 'danger' : 'positive';
  const errorChip = i.error !== 'no_error' && i.error !== 'unavailable'
    ? { text: ERR_DE[i.error] ?? i.error.replace(/_/g, ' '), level: i.hasError ? 'danger' as const : 'warning' as const }
    : null;
  const roomChip = i.room !== '–' && i.vac === 'cleaning' && !phaseOk ? i.room : null;
  const dnd = `${(i.dndStart || '').slice(0, 5)}–${(i.dndEnd || '').slice(0, 5)}`;
  return { big, sub, dot, buttons: heroButtons(i.vac), errorChip, roomChip, dnd, phaseOk };
}
