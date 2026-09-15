// Seiten der Karte (config.page). Anzeige-Texte gehören nach hier, keine Fachlogik. Leerer Titel = Name des Roboters (deviceName(), PD-012).
export const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen'] as const;
export type Page = (typeof PAGES)[number];

export const PAGE_TITLE: Record<Page, { title: string; sub: string }> = {
  start: { title: '', sub: 'Übersicht' },
  reinigen: { title: 'Karte', sub: 'Räume, Zone oder Punkt reinigen · Hinfahren · Sperrzonen' },
  planer: { title: 'Planer', sub: 'Vier Einträge · Automatik entscheidet voll, schnell oder warten' },
  protokoll: { title: 'Verlauf', sub: 'Reinigungsprotokoll der App · Zeitleiste je Lauf · Lernwerte' },
  prognose: { title: 'Prognose', sub: 'Lernende Anwesenheit · Grundlage für Start, Schnellprogramm und Rückkehr' },
  einstellungen: { title: 'Einstellungen', sub: 'Darstellung, Funktionen, Prognose, Roboter, Diagnose' },
};

/** Platzhalter je Unterseite: welche Bausteine hier laut Bauplan Abschnitt 7 entstehen. */
export const PAGE_PARTS: Record<Exclude<Page, 'start'>, string[]> = {
  reinigen: ['dx-map-card full (4.3)', 'App-Szenen', 'Stühle am Boden', 'Räume (Roboter-Werte) → dx-rooms-dialog (4.6)'],
  planer: ['dx-planer (4.4)', 'dx-planer-editor + dx-clock-picker (4.5)', 'Automatik-Regeln', 'dx-estimate-dialog (4.8)'],
  protokoll: ['dx-history (4.7)', 'Lernwerte-Tabelle'],
  prognose: ['dx-prognose-view (4.10)'],
  einstellungen: ['dx-settings-panel (4.11)', 'dx-robot-settings (4.7)', 'Diagnose', 'Version'],
};

/** Flächen der Bento-Übersicht (Bauplan 4.0) in Dokumentreihenfolge; `span` = Spalten im 12er-Raster (leer = in der rechten Spalte). */
export interface StartSlot { slot: string; title: string; span: string; part: string; task: string }
export const START_SLOTS: readonly StartSlot[] = [
  { slot: 'hero', title: '', span: 'span3', part: 'dx-hero', task: '4.1' },
  { slot: 'map', title: 'Live-Karte', span: 'span6', part: 'dx-map-card compact', task: '4.3' },
  { slot: 'automatik', title: 'Automatik', span: '', part: 'dx-automatik', task: '4.9' },
  { slot: 'auftrag', title: 'Aktueller Auftrag', span: '', part: 'dx-auftrag', task: '4.1' },
  { slot: 'heute', title: 'Heute', span: '', part: 'dx-heute', task: '4.10' },
  { slot: 'planer', title: 'Planer', span: 'span3', part: 'dx-planer compact', task: '4.4' },
  { slot: 'consumables', title: 'Verschleiß', span: 'span3', part: 'dx-consumables', task: '4.9' },
  { slot: 'station', title: 'Station', span: 'span3', part: 'dx-station', task: '4.9' },
  { slot: 'stats', title: 'Statistik', span: 'span3', part: 'dx-stats', task: '4.7' },
  { slot: 'quickstart', title: 'Schnellstart – Räume auswählen', span: 'span7', part: 'dx-quickstart', task: '4.3' },
  { slot: 'history', title: 'Letzte Läufe', span: 'span5', part: 'dx-history compact', task: '4.7' },
];
export const startSlot = (slot: string): StartSlot => START_SLOTS.find((s) => s.slot === slot)!;

export function toPage(value: unknown): Page {
  return (PAGES as readonly string[]).includes(String(value)) ? (value as Page) : 'start';
}
