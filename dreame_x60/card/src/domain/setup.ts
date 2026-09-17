// Einrichtungsprüfung (PD-014, Herbert 16.09.: „eine Statuszeile, rot wenn etwas nicht eingerichtet ist, Klick führt hin“).
// Reine Funktion: aus Gerät, Profil, Diagnose, Zuständen, Bereichszuordnung und Reparaturen wird eine Liste von Prüfungen.
// Jede Prüfung hat eine Stufe (ok / warn / error), einen Klartext und eine Sprungadresse. Keine Entitäts-IDs hier außer
// denen, die der Aufrufer mitgibt. Texte aus src/i18n (setup.*).
import type { Page } from '../pages';
import { t } from '../i18n/t';
import type { RoomInfo } from './rooms';
import { ROOM_TYPES } from './rooms';

export type SetupLevel = 'ok' | 'warn' | 'error';
export type SetupAction =
  | { kind: 'more-info'; entity: string; hint?: string }
  | { kind: 'vacuum-areas'; entity: string; hint: string }
  | { kind: 'ha-path'; path: string }
  | { kind: 'page'; page: Page };
export interface SetupCheck { key: string; icon: string; label: string; level: SetupLevel; text: string; action?: SetupAction }

/** Bereichszuordnung von HA (Entitäts-Register, options.vacuum.area_mapping) gegen die Raumliste des Roboters. */
export interface AreaMapping { segments: { id: string; name: string }[]; assigned: Set<string> }
export interface RepairIssue { domain: string; issue_id: string; translation_key?: string; severity?: string }

export interface SetupInput {
  /** erkannter Roboter (null = keiner) */
  robot: { vac: string; name: string } | null;
  rooms: readonly RoomInfo[];
  hasMapData: boolean;
  /** fehlende Entitäten laut Diagnose */
  missingRobot: readonly string[];
  missingPackage: readonly string[];
  /** Zustand von switch.<gerät>_customized_cleaning (null = Entität fehlt) */
  customizedCleaning: string | null;
  /** Roboter unterwegs (dann ist der Schalter der Integration unavailable – kein Befund) */
  running: boolean;
  /** Entitäts-ID des Schalters und der Raumnamen-Selects (vom Aufrufer, Regel 1) */
  ids: { customizedCleaning: string; roomName: (id: number) => string };
  /** null = noch nicht geladen / nicht abfragbar → Prüfung entfällt */
  mapping: AreaMapping | null;
  repairs: readonly RepairIssue[] | null;
}

const ok = (key: string, icon: string, label: string): SetupCheck => ({ key, icon, label, level: 'ok', text: label });

/** Alle Prüfungen in fester Reihenfolge (Symbolleiste). */
export function setupChecks(i: SetupInput): SetupCheck[] {
  const out: SetupCheck[] = [];
  // 1 Roboter
  out.push(i.robot
    ? ok('robot', 'mdi:robot-vacuum', t('setup.robot.ok', { name: i.robot.name }))
    : { key: 'robot', icon: 'mdi:robot-vacuum', label: t('setup.robot.label'), level: 'error', text: t('setup.robot.error'), action: { kind: 'ha-path', path: '/config/integrations' } });
  // 2 Paket
  out.push(i.missingPackage.length
    ? { key: 'package', icon: 'mdi:package-variant', label: t('setup.package.label'), level: 'error', text: t('setup.package.error', { n: i.missingPackage.length }), action: { kind: 'page', page: 'einstellungen' } }
    : ok('package', 'mdi:package-variant', t('setup.package.ok')));
  // 3 Roboter-Entitäten
  if (i.robot) out.push(i.missingRobot.length
    ? { key: 'entities', icon: 'mdi:format-list-checks', label: t('setup.entities.label'), level: 'warn', text: t('setup.entities.warn', { n: i.missingRobot.length }), action: { kind: 'page', page: 'einstellungen' } }
    : ok('entities', 'mdi:format-list-checks', t('setup.entities.ok')));
  // 4 Datenkarte
  if (i.robot) out.push(i.hasMapData
    ? ok('mapdata', 'mdi:map-check', t('setup.mapdata.ok'))
    : { key: 'mapdata', icon: 'mdi:map-check', label: t('setup.mapdata.label'), level: 'warn', text: t('setup.mapdata.warn'), action: { kind: 'ha-path', path: '/config/integrations/integration/dreame_vacuum' } });
  // 5 Angepasste Reinigung
  if (i.robot && i.customizedCleaning !== null) {
    const off = i.customizedCleaning === 'off' && !i.running;
    out.push(off
      ? { key: 'customized', icon: 'mdi:tune-variant', label: t('setup.customized.label'), level: 'warn', text: t('setup.customized.warn'), action: { kind: 'more-info', entity: i.ids.customizedCleaning } }
      : ok('customized', 'mdi:tune-variant', t('setup.customized.ok')));
  }
  // 6 Raumtypen: benutzerdefinierter Raum, obwohl die App einen Standardtyp mit diesem Namen hat (Sprachsteuerung)
  if (i.robot && i.rooms.length) {
    const known = new Set(Object.values(ROOM_TYPES).flatMap((r) => [r.name.toLowerCase(), r.en.toLowerCase()]));
    const custom = i.rooms.filter((r) => !r.typed && known.has(r.name.trim().toLowerCase()));
    out.push(custom.length
      ? { key: 'roomtypes', icon: 'mdi:tag-outline', label: t('setup.roomtypes.label'), level: 'warn', text: t('setup.roomtypes.warn', { rooms: custom.map((r) => r.name).join(', ') }), action: { kind: 'more-info', entity: i.ids.roomName(custom[0]!.id) } }
      : ok('roomtypes', 'mdi:tag-outline', t('setup.roomtypes.ok')));
  }
  // 7 Räume ↔ HA-Bereiche
  if (i.robot && i.mapping) {
    const open = i.mapping.segments.filter((s) => !i.mapping!.assigned.has(s.id));
    out.push(open.length
      ? { key: 'areas', icon: 'mdi:home-map-marker', label: t('setup.areas.label'), level: 'error', text: t('setup.areas.error', { who: open.length === 1 ? t('setup.areas.one') : t('setup.areas.many', { n: open.length }), rooms: open.map((s) => s.name).join(', ') }), action: { kind: 'vacuum-areas', entity: i.robot.vac, hint: t('setup.areas.hint') } }
      : ok('areas', 'mdi:home-map-marker', t('setup.areas.ok')));
  }
  // 8 Reparaturen von HA
  if (i.repairs) {
    const mine = i.repairs.filter((r) => r.domain === 'dreame_vacuum' || r.translation_key === 'segments_changed' || (r.domain === 'vacuum'));
    out.push(mine.length
      ? { key: 'repairs', icon: 'mdi:wrench-outline', label: t('setup.repairs.label'), level: 'error', text: t('setup.repairs.error', { n: mine.length, what: mine.length === 1 ? t('setup.repairs.one') : t('setup.repairs.many'), list: mine.map((r) => r.translation_key ?? r.issue_id).join(', ') }), action: { kind: 'ha-path', path: '/config/repairs' } }
      : ok('repairs', 'mdi:wrench-outline', t('setup.repairs.ok')));
  }
  return out;
}

export const setupProblems = (checks: readonly SetupCheck[]): SetupCheck[] => checks.filter((c) => c.level !== 'ok');
