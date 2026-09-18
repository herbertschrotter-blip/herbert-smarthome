// Nur Anzeige (Bauplan Abschnitt 5): Navigationseinträge, App-Szenen, Phasen-Konstanten. Keine Entitäts-IDs (die stehen
// in ha/contract.ts) und seit 4.14 keine festen Texte mehr – Beschriftungen und Übersetzungen (Status, Fehler, Räume,
// Optionen) kommen aus src/i18n/de.ts über t()/lookup(). Die Raumliste selbst kommt seit Stufe 2 aus der Karte des
// Roboters (domain/rooms.ts, ha/profile.ts).
import type { Page } from './pages';
import { t } from './i18n/t';
export type { RoomInfo } from './domain/rooms';

/** Navigationseintrag (Bauplan 4.0): `page` = Ziel, `overlay` = öffnet ein Overlay statt zu navigieren; `tab` = auch in der Tab-Leiste. */
export interface NavEntry { key: string; label: string; icon: string; page?: Page; overlay?: 'rooms'; onlyWhen?: 'prognose' | 'admin'; tab: boolean }

/** Reihenfolge wie im Mockup bento.html; Prognose nur bei aktiver Prognose; „Räume“ nur in Seiten-/Symbolleiste. */
export const NAV: readonly NavEntry[] = [
  { key: 'start', label: t('nav.start'), icon: 'mdi:home-outline', page: 'start', tab: true },
  { key: 'reinigen', label: t('nav.reinigen'), icon: 'mdi:map-outline', page: 'reinigen', tab: true },
  { key: 'rooms', label: t('nav.rooms'), icon: 'mdi:view-grid-outline', overlay: 'rooms', tab: false },
  { key: 'planer', label: t('nav.planer'), icon: 'mdi:calendar-outline', page: 'planer', tab: true },
  { key: 'protokoll', label: t('nav.protokoll'), icon: 'mdi:format-list-bulleted', page: 'protokoll', tab: true },
  { key: 'prognose', label: t('nav.prognose'), icon: 'mdi:chart-line', page: 'prognose', onlyWhen: 'prognose', tab: true },
  { key: 'einstellungen', label: t('nav.einstellungen'), icon: 'mdi:cog-outline', page: 'einstellungen', tab: true },
  { key: 'dev', label: t('nav.dev'), icon: 'mdi:code-tags', page: 'dev', onlyWhen: 'admin', tab: true }, // F.2b: auch in der Tab-Leiste (Herbert, 18.09.)
];

/** App-Szenen der Dreame-App (IDs wie v1); Name und Untertitel aus den Texten. */
export const APP_SCENES = [
  { id: 32, name: t('scene.32.name'), sub: t('scene.32.sub'), icon: 'mdi:door-open' },
  { id: 33, name: t('scene.33.name'), sub: t('scene.33.sub'), icon: 'mdi:shower' },
  { id: 34, name: t('scene.34.name'), sub: t('scene.34.sub'), icon: 'mdi:water' },
] as const;

/** Phasen des Backends (sensor.<gerät>_phase aus heidi.yaml), die keinen Lauf bedeuten (Zeitleiste, Kopf) – Werte aus HA, keine Anzeigetexte. */
export const PHASE_IDLE = ['Schläft', 'Lädt', 'Angedockt', 'Bereit', 'unknown', 'unavailable', ''] as const;
/** Roboter unterwegs = Lauf aktiv (vacuum.heidi). */
export const VAC_RUN = ['cleaning', 'paused', 'returning'] as const;
