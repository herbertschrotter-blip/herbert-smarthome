// Konfigurationen der eingebetteten Kartenkarten (Bauplan 4.3, Abschnitt 6 `_mountMap`): Dreame-App und Nur Bild 1:1 wie v1,
// Xiaomi-Karte mit genau einem `map_modes`-Eintrag je Modus (PD-004), Räume/Umrisse aus den Kartendaten (nicht von Hand).
// Liegt in der HA-Schicht, weil hier Entitäts-IDs aus dem Vertrag eingesetzt werden (Regel 1).
import { ENTITIES } from './contract';
import type { RoomShape } from './selectors';

export type MapModeKey = 'raeume' | 'zone' | 'punkt' | 'goto';
export type MapConfig = Record<string, unknown>;

/** Modi der Seite Reinigen: Beschriftung des Umschalters und Hinweiszeile. */
export const MAP_MODES: Record<MapModeKey, { label: string; hint: string }> = {
  raeume: { label: 'Räume', hint: 'Auswahl per Kachel oder Tipp in die Raumfläche' },
  zone: { label: 'Zone', hint: 'Rechteck auf der Karte aufziehen (bis zu 5), dann ▶ in der Karte' },
  punkt: { label: 'Punkt', hint: 'Punkt auf der Karte antippen, dann ▶ in der Karte' },
  goto: { label: 'Hinfahren', hint: 'Punkt auf der Karte antippen → Heidi fährt hin und wartet' },
};

/** Genau ein map_modes-Eintrag je Modus; Räume mit Umriss, Beschriftung und Symbol aus den Kartendaten. */
export function modeEntry(mode: MapModeKey, rooms: readonly RoomShape[]): MapConfig {
  switch (mode) {
    case 'raeume':
      return {
        template: 'vacuum_clean_segment', name: 'Räume', icon: 'mdi:floor-plan',
        predefined_selections: rooms.map((r) => ({ id: r.id, outline: r.outline, label: { text: r.name, x: r.x, y: r.y, offset_y: 35 }, icon: { name: r.icon, x: r.x, y: r.y } })),
      };
    case 'zone': return { template: 'vacuum_clean_zone', name: 'Zone', icon: 'mdi:select-drag', max_selections: 5 };
    case 'punkt': return { template: 'vacuum_clean_point', name: 'Punkt', icon: 'mdi:map-marker-radius' };
    case 'goto': return { template: 'vacuum_goto', name: 'Hinfahren', icon: 'mdi:map-marker' };
  }
}

/** Ob die Kartendarstellung eigene Modi (Räume/Zone/Punkt/Hinfahren) kennt – nur die Xiaomi-Karte. */
export const hasModes = (kind: string): boolean => kind === 'Xiaomi-Karte';

/** Konfiguration für die Seite Reinigen nach Kartendarstellung (input_select.heidi_kartendarstellung). */
export function buildMapConfig(kind: string, dark: boolean, mode: MapModeKey, rooms: readonly RoomShape[]): MapConfig {
  if (kind === 'Dreame-App') return { type: 'custom:dreame-vacuum-map-card', entity: ENTITIES.vac, title: 'Heidi', theme: dark ? 'dark' : 'light', language: 'de', default_mode: 'room' };
  if (kind === 'Xiaomi-Karte') {
    return {
      type: 'custom:xiaomi-vacuum-map-card', entity: ENTITIES.vac, vacuum_platform: 'Tasshack/dreame-vacuum', language: 'de',
      map_source: { camera: ENTITIES.map }, calibration_source: { camera: true }, map_locked: true, two_finger_pan: true,
      title: '', tiles: [], icons: [], map_modes: [modeEntry(mode, rooms)],
    };
  }
  return pictureConfig();
}

/** Nur Bild (wie v1) – auch die Variante `compact` der Übersicht (Live-Bild der Kamera, ohne Werkzeuge). */
export function pictureConfig(): MapConfig {
  return { type: 'picture-entity', entity: ENTITIES.map, camera_image: ENTITIES.map, show_name: false, show_state: false };
}
