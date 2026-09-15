// Einrichtungsprüfung (PD-014, Herbert 16.09.: „eine Statuszeile, rot wenn etwas nicht eingerichtet ist, Klick führt hin“).
// Reine Funktion: aus Gerät, Profil, Diagnose, Zuständen, Bereichszuordnung und Reparaturen wird eine Liste von Prüfungen.
// Jede Prüfung hat eine Stufe (ok / warn / error), einen Klartext und eine Sprungadresse. Keine Entitäts-IDs hier außer
// denen, die der Aufrufer mitgibt.
import type { Page } from '../pages';
import type { RoomInfo } from './rooms';
import { ROOM_TYPES } from './rooms';

export type SetupLevel = 'ok' | 'warn' | 'error';
export type SetupAction =
  | { kind: 'more-info'; entity: string; hint?: string }
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
    ? ok('robot', 'mdi:robot-vacuum', `Roboter erkannt: ${i.robot.name}`)
    : { key: 'robot', icon: 'mdi:robot-vacuum', label: 'Roboter', level: 'error', text: 'Kein Dreame-Roboter gefunden – Integration einrichten oder „robot:“ in der Kartenkonfiguration setzen', action: { kind: 'ha-path', path: '/config/integrations' } });
  // 2 Paket
  out.push(i.missingPackage.length
    ? { key: 'package', icon: 'mdi:package-variant', label: 'Paket', level: 'error', text: `${i.missingPackage.length} Helfer des Pakets fehlen – Paket heidi.yaml und Automationen prüfen`, action: { kind: 'page', page: 'einstellungen' } }
    : ok('package', 'mdi:package-variant', 'Paket vollständig'));
  // 3 Roboter-Entitäten
  if (i.robot) out.push(i.missingRobot.length
    ? { key: 'entities', icon: 'mdi:format-list-checks', label: 'Roboter-Entitäten', level: 'warn', text: `${i.missingRobot.length} Entitäten des Roboters fehlen oder sind deaktiviert`, action: { kind: 'page', page: 'einstellungen' } }
    : ok('entities', 'mdi:format-list-checks', 'Roboter-Entitäten vollständig'));
  // 4 Datenkarte
  if (i.robot) out.push(i.hasMapData
    ? ok('mapdata', 'mdi:map-check', 'Datenkarte aktiv')
    : { key: 'mapdata', icon: 'mdi:map-check', label: 'Datenkarte', level: 'warn', text: 'Datenkarte nicht aktiviert – Räume in der Heidi-Karte fehlen (Entität „Current Map Data“ in der Dreame-Integration einschalten)', action: { kind: 'ha-path', path: '/config/integrations/integration/dreame_vacuum' } });
  // 5 Angepasste Reinigung
  if (i.robot && i.customizedCleaning !== null) {
    const off = i.customizedCleaning === 'off' && !i.running;
    out.push(off
      ? { key: 'customized', icon: 'mdi:tune-variant', label: 'Angepasste Reinigung', level: 'warn', text: 'Angepasste Reinigung ist aus – Raumwerte je Raum wirken nicht', action: { kind: 'more-info', entity: i.ids.customizedCleaning } }
      : ok('customized', 'mdi:tune-variant', 'Angepasste Reinigung an'));
  }
  // 6 Raumtypen: benutzerdefinierter Raum, obwohl die App einen Standardtyp mit diesem Namen hat (Sprachsteuerung)
  if (i.robot && i.rooms.length) {
    const known = new Set(Object.values(ROOM_TYPES).flatMap((t) => [t.name.toLowerCase(), t.en.toLowerCase()]));
    const custom = i.rooms.filter((r) => !r.typed && known.has(r.name.trim().toLowerCase()));
    out.push(custom.length
      ? { key: 'roomtypes', icon: 'mdi:tag-outline', label: 'Raumtypen', level: 'warn', text: `${custom.map((r) => r.name).join(', ')}: benutzerdefiniert, obwohl die App den Standardtyp kennt – für die Sprachsteuerung in der App „Raum umbenennen“ den Typ wählen`, action: { kind: 'more-info', entity: i.ids.roomName(custom[0]!.id) } }
      : ok('roomtypes', 'mdi:tag-outline', 'Raumtypen passen'));
  }
  // 7 Räume ↔ HA-Bereiche
  if (i.robot && i.mapping) {
    const open = i.mapping.segments.filter((s) => !i.mapping!.assigned.has(s.id));
    out.push(open.length
      ? { key: 'areas', icon: 'mdi:home-map-marker', label: 'Räume ↔ Bereiche', level: 'error', text: `${open.length === 1 ? 'Ein Raum ist' : open.length + ' Räume sind'} keinem HA-Bereich zugeordnet: ${open.map((s) => s.name).join(', ')}`, action: { kind: 'more-info', entity: i.robot.vac, hint: 'Reinigung → Nach Bereich → Konfigurieren' } }
      : ok('areas', 'mdi:home-map-marker', 'Alle Räume einem HA-Bereich zugeordnet'));
  }
  // 8 Reparaturen von HA
  if (i.repairs) {
    const mine = i.repairs.filter((r) => r.domain === 'dreame_vacuum' || r.translation_key === 'segments_changed' || (r.domain === 'vacuum'));
    out.push(mine.length
      ? { key: 'repairs', icon: 'mdi:wrench-outline', label: 'Reparaturen', level: 'error', text: `${mine.length} offene ${mine.length === 1 ? 'Reparatur' : 'Reparaturen'} in HA (${mine.map((r) => r.translation_key ?? r.issue_id).join(', ')})`, action: { kind: 'ha-path', path: '/config/repairs' } }
      : ok('repairs', 'mdi:wrench-outline', 'Keine offenen Reparaturen'));
  }
  return out;
}

export const setupProblems = (checks: readonly SetupCheck[]): SetupCheck[] => checks.filter((c) => c.level !== 'ok');
