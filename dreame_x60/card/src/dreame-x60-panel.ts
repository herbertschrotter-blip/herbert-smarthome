// dreame-x60-panel – Shell der Heidi-Karte v2 (Aufgabe 1.2: leere Shell).
// Rendert je nach config.page eine der sechs Seiten; die Komponenten entstehen in Phase 4.
// Keine Entitäts-IDs in dieser Datei (Regel 1) – Sichten kommen ab 3.1 aus den Selektoren.
import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, PanelConfig } from './ha/types';
import { tokens } from './styles/tokens';
import { base } from './styles/base';
import { VERSION } from './version';

export const ELEMENT = 'dreame-x60-panel';
export const PAGES = ['start', 'reinigen', 'planer', 'protokoll', 'prognose', 'einstellungen'] as const;
export type Page = (typeof PAGES)[number];

/** Anzeige-Texte der Seiten (nur Darstellung, keine Fachlogik). */
const PAGE_TITLE: Record<Page, { title: string; sub: string }> = {
  start: { title: 'Heidi', sub: 'Übersicht' },
  reinigen: { title: 'Karte', sub: 'Räume, Zone oder Punkt reinigen · Hinfahren · Sperrzonen' },
  planer: { title: 'Planer', sub: 'Vier Einträge · Automatik' },
  protokoll: { title: 'Verlauf', sub: 'Reinigungsprotokoll · Zeitleiste · Lernwerte' },
  prognose: { title: 'Prognose', sub: 'Lernende Anwesenheit' },
  einstellungen: { title: 'Einstellungen', sub: 'Darstellung, Funktionen, Prognose, Roboter, Diagnose' },
};

/** Platzhalter je Seite: welche Komponenten hier laut Bauplan Abschnitt 7 entstehen. */
const PAGE_PARTS: Record<Page, string[]> = {
  start: ['dx-hero (4.1)', 'dx-map-card compact (4.3)', 'dx-automatik (4.9)', 'dx-consumables (4.9)', 'dx-nav-tiles (4.0)', 'dx-station (4.9)'],
  reinigen: ['dx-map-card full (4.3)', 'App-Szenen', 'Stühle am Boden', 'Räume (Roboter-Werte) → dx-rooms-dialog (4.6)'],
  planer: ['dx-planer (4.4)', 'dx-planer-editor + dx-clock-picker (4.5)', 'Automatik-Regeln', 'dx-estimate-dialog (4.8)'],
  protokoll: ['dx-history (4.7)', 'Lernwerte-Tabelle'],
  prognose: ['dx-prognose-view (4.10)'],
  einstellungen: ['dx-settings-panel (4.11)', 'dx-robot-settings (4.7)', 'Diagnose', 'Version'],
};

function toPage(value: unknown): Page {
  return (PAGES as readonly string[]).includes(String(value)) ? (value as Page) : 'start';
}

export class DreameX60Panel extends LitElement {
  static override styles = [tokens, base];

  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: PanelConfig;

  constructor() {
    super();
    this._config = { page: 'start' };
  }

  /** Von HA beim Anlegen der Karte aufgerufen. */
  setConfig(config: PanelConfig | null | undefined): void {
    if (!config || typeof config !== 'object') throw new Error('dreame-x60-panel: Konfiguration fehlt');
    this._config = { ...config, page: toPage(config.page) };
  }

  /** Grobe Höhe in 50-px-Zeilen (HA nutzt sie für das Masonry-Layout; Panel-Views ignorieren sie). */
  getCardSize(): number {
    return 12;
  }

  static getStubConfig(): PanelConfig {
    return { page: 'start' };
  }

  get page(): Page {
    return toPage(this._config.page);
  }

  override render(): TemplateResult {
    const page = this.page;
    const t = PAGE_TITLE[page];
    const entities = this.hass ? Object.keys(this.hass.states).length : 0;
    return html`
      <div class="page" data-page=${page}>
        <div class="topbar">
          <div>
            <h1>${t.title}</h1>
            <div class="sub">${t.sub}</div>
          </div>
          <span class="version">dreame_x60 v${VERSION}</span>
        </div>
        <div class="bento">
          <section class="b span12">
            <div class="hd"><h2>Seite „${page}“</h2><span class="r">${entities ? `${entities} Entitäten verbunden` : 'keine Zustandsdaten'}</span></div>
            <div class="lbl">Hier entstehen</div>
            <ul class="hint" style="margin:0;padding-left:18px">
              ${PAGE_PARTS[page].map((p) => html`<li>${p}</li>`)}
            </ul>
            ${page === 'start' ? html`<div class="hint">Leere Shell aus Aufgabe 1.2 – Optik nach Mockup <code>dreame_x60/mockups/bento.html</code>.</div>` : nothing}
          </section>
        </div>
      </div>
    `;
  }
}

// Registrierung: nur einmal, auch wenn das Bundle doppelt geladen wird (Regel 11).
if (!customElements.get(ELEMENT)) customElements.define(ELEMENT, DreameX60Panel);

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description?: string; preview?: boolean }>;
  }
}
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === ELEMENT)) {
  window.customCards.push({ type: ELEMENT, name: 'Heidi (dreame_x60)', description: 'Heidi-Karte v2 – Übersicht und Unterseiten des Saugroboters', preview: false });
}

console.info(`%c dreame_x60 %c v${VERSION} `, 'background:#0b1015;color:#58b7f6;font-weight:600', 'background:#0b1015;color:#e7edf3');
