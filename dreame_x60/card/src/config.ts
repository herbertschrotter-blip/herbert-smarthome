// Nur Anzeige (Bauplan Abschnitt 5): Kurznamen, Icons, deutsche Texte. Keine Entitäts-IDs (die stehen in ha/contract.ts).
// Werte 1:1 aus v1 (ROOMS, ROOMS_DE, STATUS_DE, ERR_DE, APP_SCENES, DAYS).
import type { RoomId } from './ha/contract';
import type { Page } from './pages';

/** Navigationseintrag (Bauplan 4.0): `page` = Ziel, `overlay` = öffnet ein Overlay statt zu navigieren; `tab` = auch in der Tab-Leiste. */
export interface NavEntry { key: string; label: string; icon: string; page?: Page; overlay?: 'rooms'; onlyWhen?: 'prognose'; tab: boolean }

/** Reihenfolge wie im Mockup bento.html; Prognose nur bei aktiver Prognose; „Räume“ nur in Seiten-/Symbolleiste. */
export const NAV: readonly NavEntry[] = [
  { key: 'start', label: 'Übersicht', icon: 'mdi:home-outline', page: 'start', tab: true },
  { key: 'reinigen', label: 'Karte', icon: 'mdi:map-outline', page: 'reinigen', tab: true },
  { key: 'rooms', label: 'Räume', icon: 'mdi:view-grid-outline', overlay: 'rooms', tab: false },
  { key: 'planer', label: 'Planer', icon: 'mdi:calendar-outline', page: 'planer', tab: true },
  { key: 'protokoll', label: 'Verlauf', icon: 'mdi:format-list-bulleted', page: 'protokoll', tab: true },
  { key: 'prognose', label: 'Prognose', icon: 'mdi:chart-line', page: 'prognose', onlyWhen: 'prognose', tab: true },
  { key: 'einstellungen', label: 'Einstellungen', icon: 'mdi:cog-outline', page: 'einstellungen', tab: true },
];

export interface RoomInfo { id: RoomId; short: string; name: string; icon: string }

/** Räume in Chip-Reihenfolge 7..1 (Anzeige); Kurzname wie v1, voller Name wie am Roboter. */
export const ROOMS: readonly RoomInfo[] = [
  { id: 7, short: 'Wohnz.', name: 'Wohnzimmer', icon: 'mdi:sofa-outline' },
  { id: 6, short: 'Küche', name: 'Küche', icon: 'mdi:chef-hat' },
  { id: 5, short: 'Büro', name: 'Büro', icon: 'mdi:desk' },
  { id: 4, short: 'Flur', name: 'Flur', icon: 'mdi:foot-print' },
  { id: 3, short: 'WC', name: 'WC', icon: 'mdi:toilet' },
  { id: 2, short: 'Schlafz.', name: 'Schlafzimmer', icon: 'mdi:bed-king-outline' },
  { id: 1, short: 'Bad', name: 'Bad', icon: 'mdi:shower' },
];
export const roomById = (id: number): RoomInfo | undefined => ROOMS.find((r) => r.id === id);

/** Englische Raumnamen aus dem Kartenbild → deutsch. */
export const ROOMS_DE: Record<string, string> = { Bathroom: 'Bad', 'Primary Bedroom': 'Schlafzimmer', WC: 'WC', Corridor: 'Flur', Study: 'Büro', Kitchen: 'Küche', 'Living Room': 'Wohnzimmer' };

export const STATUS_DE: Record<string, string> = {
  sleeping: 'schläft', charging: 'lädt', cleaning: 'reinigt', sweeping: 'saugt', mopping: 'wischt', sweeping_and_mopping: 'saugt und wischt',
  returning: 'fährt zur Station', paused: 'pausiert', idle: 'bereit', docked: 'angedockt', washing: 'Mopp-Wäsche', drying: 'trocknet',
  auto_emptying: 'saugt ab', error: 'Fehler', charging_completed: 'voll geladen', segment_cleaning: 'reinigt Räume', zone_cleaning: 'reinigt Zone',
  spot_cleaning: 'reinigt Punkt', cruising: 'fährt',
};

/** Hinweise/Fehler des Roboters (sensor.heidi_error); Hinweise sind keine echten Fehler (vacuum has_error = false). */
export const ERR_DE: Record<string, string> = {
  clean_mop_pad: 'Mopp reinigen', dust_bag_full: 'Staubbeutel voll', clean_water_tank_empty: 'Frischwasser leer', dirty_water_tank_full: 'Abwasser voll',
  dust_box_missing: 'Staubbox fehlt', mop_pad_stop_rotate: 'Mopp blockiert', wheels_stuck: 'Rad blockiert', brush_stuck: 'Bürste blockiert', low_battery: 'Akku leer',
  station_disconnected: 'Station getrennt', detergent_empty: 'Reinigungsmittel leer', water_tank_missing: 'Wassertank fehlt', clean_water_tank_missing: 'Frischwassertank fehlt',
  dirty_water_tank_missing: 'Abwassertank fehlt',
};

export const APP_SCENES = [
  { id: 32, name: 'Eingang reinigen', sub: 'Flur · Saugen + Wischen · 2×', icon: 'mdi:door-open' },
  { id: 33, name: 'Bad Saugen/Wischen', sub: 'Bad · 1×', icon: 'mdi:shower' },
  { id: 34, name: 'Wischen nach dem Saugen', sub: 'Ganze Wohnung · nur Wischen', icon: 'mdi:water' },
] as const;

export const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

/** Phasen, die keinen Lauf bedeuten (Zeitleiste, Kopf). */
export const PHASE_IDLE = ['Schläft', 'Lädt', 'Angedockt', 'Bereit', 'unknown', 'unavailable', ''] as const;
/** Roboter unterwegs = Lauf aktiv (vacuum.heidi). */
export const VAC_RUN = ['cleaning', 'paused', 'returning'] as const;
