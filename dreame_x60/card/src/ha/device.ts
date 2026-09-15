// Geräteerkennung (Herbert, 15.09.: „so wenig wie möglich hardcoded“ – kein fester Gerätename im Code).
// Die Dreame-Integration bildet ihre IDs als `<domäne>.<gerät>_<merkmal>` und `select.<gerät>_room_<n>_<merkmal>`; der
// Roboter selbst ist `vacuum.<gerät>`. Dieses Modul findet den Roboter in HA und merkt sich Präfix und Anzeigenamen;
// `contract.ts` bildet daraus alle Roboter-IDs. Paket-Helfer (ha/packages/heidi.yaml) bleiben davon unberührt.
//
// Erkennung, in dieser Reihenfolge:
//  1. `robot:` in der Kartenkonfiguration (Dashboard-YAML) – für Haushalte mit mehreren Robotern.
//  2. Entitäts-Register des Frontends (`hass.entities`): erste `vacuum.*`-Entität der Plattform `dreame_vacuum`.
//  3. Zustände: erste `vacuum.*`-Entität mit den Dreame-Attributen `segment_cleaning`/`cleaning_sequence` (Tests, alte HA).
// Anzeigename: Gerät im Geräte-Register (vom Benutzer vergebener Name vor dem Integrationsnamen), sonst friendly_name.
import type { HomeAssistant, States } from './types';

export interface DeviceInfo {
  /** Teil der IDs vor dem Merkmal, z. B. „heidi“ */
  prefix: string;
  /** vacuum-Entität, z. B. „vacuum.heidi“ */
  vac: string;
  /** Anzeigename, z. B. „Heidi“ */
  name: string;
}

const DREAME_PLATFORM = 'dreame_vacuum';
const DREAME_ATTRS = ['segment_cleaning', 'cleaning_sequence'];

let current: DeviceInfo | null = null;
/** Zähler je Wechsel – Selektoren erkennen daran, dass ihre ID-Listen neu sind. */
let generation = 0;

/** Präfix der Roboter-IDs; leer, solange kein Roboter erkannt ist (IDs sind dann ungültig, Diagnose meldet es). */
export const devicePrefix = (): string => current?.prefix ?? '';
/** Anzeigename des Roboters; leer ohne Erkennung. */
export const deviceName = (): string => current?.name ?? '';
export const device = (): DeviceInfo | null => current;
export const deviceGeneration = (): number => generation;

/** Tests und Werkzeuge: Gerät direkt setzen. */
export function setDevice(prefix: string, name = prefix): DeviceInfo {
  return apply({ prefix, vac: `vacuum.${prefix}`, name })!;
}

function apply(next: DeviceInfo | null): DeviceInfo | null {
  if ((current?.vac ?? null) !== (next?.vac ?? null) || current?.name !== next?.name) generation++;
  current = next;
  return next;
}

const isVacuumId = (id: string): boolean => id.startsWith('vacuum.') && id.split('.').length === 2;

/** friendly_name der Integration ist „<Gerät> <Gerät>“ (Gerätename + gleichnamige Entität, z. B. „Heidi  Heidi“) → Wiederholungen weg. */
export function cleanName(raw: unknown): string {
  const words = String(raw ?? '').trim().split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const w of words) if (out[out.length - 1] !== w) out.push(w);
  return out.join(' ');
}

function fromStates(states: States, vacId: string): DeviceInfo | null {
  const e = states[vacId];
  if (!e || !isVacuumId(vacId)) return null;
  const prefix = vacId.slice('vacuum.'.length);
  const name = cleanName(e.attributes.friendly_name) || prefix;
  return { prefix, vac: vacId, name };
}

/** Roboter aus den Zuständen (Tests, Abzüge): erste vacuum-Entität mit Dreame-Attributen. */
export function discoverFromStates(states: States, override?: string): DeviceInfo | null {
  if (override && states[override]) return apply(fromStates(states, override));
  for (const id of Object.keys(states).sort()) {
    const e = states[id];
    if (e && isVacuumId(id) && DREAME_ATTRS.some((a) => a in e.attributes)) return apply(fromStates(states, id));
  }
  return apply(null);
}

/** Roboter aus hass: Konfiguration, Entitäts-Register, sonst Zustände. Liefert das erkannte Gerät (oder null). */
export function discoverDevice(hass: HomeAssistant, override?: string): DeviceInfo | null {
  const states = hass.states ?? {};
  let info: DeviceInfo | null = null;
  if (override && states[override]) info = fromStates(states, override);
  if (!info && hass.entities) {
    const reg = Object.values(hass.entities).find((e) => e && e.platform === DREAME_PLATFORM && isVacuumId(e.entity_id));
    if (reg) {
      info = fromStates(states, reg.entity_id) ?? { prefix: reg.entity_id.slice('vacuum.'.length), vac: reg.entity_id, name: reg.entity_id.slice('vacuum.'.length) };
      const dev = reg.device_id ? hass.devices?.[reg.device_id] : undefined;
      const devName = (dev?.name_by_user ?? dev?.name ?? '').trim();
      if (devName) info = { ...info, name: devName };
    }
  }
  if (!info) return discoverFromStates(states);
  return apply(info);
}
