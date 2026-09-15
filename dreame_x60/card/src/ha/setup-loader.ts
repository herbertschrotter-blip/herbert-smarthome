// Nachladen für die Einrichtungsprüfung (PD-014): Bereichszuordnung aus dem Entitäts-Register (options.vacuum.area_mapping,
// HA-Kern „Bereiche reinigen“), Raumliste über `vacuum/get_segments`, offene Reparaturen über `repairs/list_issues`.
// Alles über hass.callWS (erlaubte Frontend-Schnittstelle); ohne callWS (Tests, alte HA) bleibt es bei null → Prüfung
// entfällt. Ergebnis wird je Roboter gemerkt und höchstens alle fünf Minuten erneuert.
import type { HomeAssistant } from './types';
import type { AreaMapping, RepairIssue } from '../domain/setup';

export interface SetupData { mapping: AreaMapping | null; repairs: RepairIssue[] | null; at: number }

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { promise: Promise<SetupData>; at: number }>();

interface RegistryEntry { options?: { vacuum?: { area_mapping?: Record<string, string[]> } } }
interface SegmentsResult { segments?: { id: string; name: string; group?: string }[] }
interface IssuesResult { issues?: RepairIssue[] }

async function fetchSetup(hass: HomeAssistant, vac: string): Promise<SetupData> {
  if (!hass.callWS) return { mapping: null, repairs: null, at: Date.now() };
  const safe = async <T,>(msg: Record<string, unknown>): Promise<T | null> => { try { return await hass.callWS!<T>(msg); } catch { return null; } };
  const [entry, segs, issues] = await Promise.all([
    safe<RegistryEntry>({ type: 'config/entity_registry/get', entity_id: vac }),
    safe<SegmentsResult>({ type: 'vacuum/get_segments', entity_id: vac }),
    safe<IssuesResult>({ type: 'repairs/list_issues' }),
  ]);
  let mapping: AreaMapping | null = null;
  if (segs?.segments) {
    const assigned = new Set<string>();
    for (const list of Object.values(entry?.options?.vacuum?.area_mapping ?? {})) for (const id of list) assigned.add(id);
    mapping = { segments: segs.segments.map((s) => ({ id: s.id, name: s.name })), assigned };
  }
  return { mapping, repairs: issues?.issues ?? null, at: Date.now() };
}

/** Einrichtungsdaten für diesen Roboter; `force` erneuert sofort (z. B. nach Änderung der Raumliste). */
export function loadSetupData(hass: HomeAssistant, vac: string, force = false): Promise<SetupData> {
  const c = cache.get(vac);
  if (c && !force && Date.now() - c.at < TTL_MS) return c.promise;
  const promise = fetchSetup(hass, vac);
  cache.set(vac, { promise, at: Date.now() });
  return promise;
}

/** Nur für Tests. */
export function resetSetupCache(): void { cache.clear(); }
