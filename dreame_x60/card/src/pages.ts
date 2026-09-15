// Seiten der Karte (config.page). Anzeige-Texte gehören nach hier, keine Fachlogik.
export const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen'] as const;
export type Page = (typeof PAGES)[number];

export const PAGE_TITLE: Record<Page, { title: string; sub: string }> = {
  start: { title: 'Heidi', sub: 'Übersicht' },
  reinigen: { title: 'Karte', sub: 'Räume, Zone oder Punkt reinigen · Hinfahren · Sperrzonen' },
  planer: { title: 'Planer', sub: 'Vier Einträge · Automatik' },
  protokoll: { title: 'Verlauf', sub: 'Reinigungsprotokoll · Zeitleiste · Lernwerte' },
  prognose: { title: 'Prognose', sub: 'Lernende Anwesenheit' },
  einstellungen: { title: 'Einstellungen', sub: 'Darstellung, Funktionen, Prognose, Roboter, Diagnose' },
};

/** Platzhalter je Seite: welche Bausteine hier laut Bauplan Abschnitt 7 entstehen. */
export const PAGE_PARTS: Record<Page, string[]> = {
  start: ['dx-hero (4.1)', 'dx-map-card compact (4.3)', 'dx-automatik (4.9)', 'dx-consumables (4.9)', 'dx-nav-tiles (4.0)', 'dx-station (4.9)'],
  reinigen: ['dx-map-card full (4.3)', 'App-Szenen', 'Stühle am Boden', 'Räume (Roboter-Werte) → dx-rooms-dialog (4.6)'],
  planer: ['dx-planer (4.4)', 'dx-planer-editor + dx-clock-picker (4.5)', 'Automatik-Regeln', 'dx-estimate-dialog (4.8)'],
  protokoll: ['dx-history (4.7)', 'Lernwerte-Tabelle'],
  prognose: ['dx-prognose-view (4.10)'],
  einstellungen: ['dx-settings-panel (4.11)', 'dx-robot-settings (4.7)', 'Diagnose', 'Version'],
};

export function toPage(value: unknown): Page {
  return (PAGES as readonly string[]).includes(String(value)) ? (value as Page) : 'start';
}
