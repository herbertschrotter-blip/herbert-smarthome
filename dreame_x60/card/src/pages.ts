// Seiten der Karte (config.page). Keine Fachlogik; die Texte kommen aus src/i18n/de.ts (4.14). Leerer Titel = Name des Roboters (deviceName(), PD-012).
import { t, tx } from './i18n/t';

export const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen', 'dev'] as const; // dev nur für Admin-Benutzer (F.2b, PD-018)
export type Page = (typeof PAGES)[number];

export const PAGE_TITLE: Record<Page, { title: string; sub: string }> = {
  start: { title: '', sub: t('page.start.sub') },
  reinigen: { title: t('page.reinigen.title'), sub: t('page.reinigen.sub') },
  planer: { title: t('page.planer.title'), sub: t('page.planer.sub') },
  protokoll: { title: t('page.protokoll.title'), sub: t('page.protokoll.sub') },
  prognose: { title: t('page.prognose.title'), sub: t('page.prognose.sub') },
  einstellungen: { title: t('page.einstellungen.title'), sub: t('page.einstellungen.sub') },
  dev: { title: t('page.dev.title'), sub: t('page.dev.sub') },
};

/** Platzhalter je Unterseite: welche Bausteine hier laut Bauplan Abschnitt 7 entstehen (Text `page.parts.<seite>`, mit `|` getrennt). */
export const PAGE_PARTS: Record<Exclude<Page, 'start' | 'dev'>, string[]> = Object.fromEntries(
  PAGES.filter((p) => p !== 'start' && p !== 'dev').map((p) => [p, tx(`page.parts.${p}`).split('|')]),
) as Record<Exclude<Page, 'start' | 'dev'>, string[]>;

/** Flächen der Bento-Übersicht (Bauplan 4.0) in Dokumentreihenfolge; `span` = Spalten im 12er-Raster (leer = in der rechten Spalte). */
export interface StartSlot { slot: string; title: string; span: string; part: string; task: string }
export const START_SLOTS: readonly StartSlot[] = [
  { slot: 'hero', title: '', span: 'span3', part: 'dx-hero', task: '4.1' },
  { slot: 'map', title: t('slot.map'), span: 'span6', part: 'dx-map-card compact', task: '4.3' },
  { slot: 'automatik', title: t('slot.automatik'), span: '', part: 'dx-automatik', task: '4.9' },
  { slot: 'auftrag', title: t('slot.auftrag'), span: '', part: 'dx-auftrag', task: '4.1' },
  { slot: 'heute', title: t('slot.heute'), span: '', part: 'dx-heute', task: '4.10' },
  { slot: 'planer', title: t('slot.planer'), span: 'span3', part: 'dx-planer compact', task: '4.4' },
  { slot: 'consumables', title: t('slot.consumables'), span: 'span3', part: 'dx-consumables', task: '4.9' },
  { slot: 'station', title: t('slot.station'), span: 'span3', part: 'dx-station', task: '4.9' },
  { slot: 'stats', title: t('slot.stats'), span: 'span3', part: 'dx-stats', task: '4.7' },
  { slot: 'quickstart', title: t('slot.quickstart'), span: 'span7', part: 'dx-quickstart', task: '4.3' },
  { slot: 'history', title: t('slot.history'), span: 'span5', part: 'dx-history compact', task: '4.7' },
];
export const startSlot = (slot: string): StartSlot => START_SLOTS.find((s) => s.slot === slot)!;

export function toPage(value: unknown): Page {
  return (PAGES as readonly string[]).includes(String(value)) ? (value as Page) : 'start';
}
