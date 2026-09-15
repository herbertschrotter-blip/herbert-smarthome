// dreame-x60-panel – Shell der Heidi-Karte v2 (Bauplan 3.3): erzeugt Sichten über memoisierte Selektoren, reicht
// hass, Sichten und api an die Bausteine, rendert nach config.page, hält Overlay und Toast, hört auf dx-*-Ereignisse.
// Kein shouldUpdate in der Shell (Regel 10) – Ruhe entsteht durch gleiche View-Referenzen in den Kindern.
import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, PanelConfig } from './ha/types';
import { DxApi } from './ha/api';
import { readAutomatik, readConsumables, readDiagnostics, readHistory, readLearn, readMap, readPlans, readPrognose, readRobot, readRobotSettings, readSettings, readStation } from './ha/selectors';
import { PAGES, PAGE_PARTS, PAGE_TITLE, toPage } from './pages';
import type { Page } from './pages';
import { EVENTS } from './shared/overlay';
import type { Overlay } from './shared/overlay';
import { navigate } from './shared/navigate';
import { tokens } from './styles/tokens';
import { base } from './styles/base';
import { shell } from './styles/shell';
import { VERSION } from './version';

export const ELEMENT = 'dreame-x60-panel';
export { PAGES };
export type { Page };

/** Anzeigedauer des Toasts in ms (wie v1). */
const TOAST_MS = 1900;

export class DreameX60Panel extends LitElement {
  static override styles = [tokens, base, shell];

  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _overlay: { state: true },
    _toast: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: PanelConfig;
  declare private _overlay: Overlay | null;
  declare private _toast: string | null;

  /** Schreibzugriffe – eine Instanz je Shell, liest hass zur Laufzeit. */
  readonly api = new DxApi(() => this.hass);
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape' && this._overlay) this.closeOverlay(); };

  constructor() {
    super();
    this._config = { page: 'start' };
    this._overlay = null;
    this._toast = null;
    this.addEventListener(EVENTS.openOverlay, (e) => this.openOverlay((e as CustomEvent<Overlay>).detail));
    this.addEventListener(EVENTS.close, () => this.closeOverlay());
    this.addEventListener(EVENTS.back, () => this.backOverlay());
    this.addEventListener(EVENTS.confirm, () => this.confirmOverlay());
    this.addEventListener(EVENTS.toast, (e) => this.toast(String((e as CustomEvent<string>).detail ?? '')));
    this.addEventListener(EVENTS.navigate, (e) => navigate(toPage((e as CustomEvent<{ page: string }>).detail?.page)));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this._onKey);
  }

  override disconnectedCallback(): void {
    window.removeEventListener('keydown', this._onKey);
    super.disconnectedCallback();
  }

  // ───────── HA-Schnittstelle der Karte ─────────
  setConfig(config: PanelConfig | null | undefined): void {
    if (!config || typeof config !== 'object') throw new Error('dreame-x60-panel: Konfiguration fehlt');
    this._config = { ...config, page: toPage(config.page) };
  }

  getCardSize(): number { return 12; }

  static getStubConfig(): PanelConfig { return { page: 'start' }; }

  get page(): Page { return toPage(this._config.page); }

  // ───────── Overlay und Toast ─────────
  get overlay(): Overlay | null { return this._overlay; }

  openOverlay(o: Overlay): void { this._overlay = o; }

  closeOverlay(): void { this._overlay = null; }

  /** Zurück zum vorherigen Overlay (Räume/Dauer → Eintrag), sonst schließen. */
  backOverlay(): void { this._overlay = this._overlay && 'back' in this._overlay && this._overlay.back ? this._overlay.back : null; }

  confirmOverlay(): void {
    const o = this._overlay;
    if (o?.kind === 'confirm') { this._overlay = o.back ?? null; o.onOk(); }
  }

  toast(msg: string): void {
    this._toast = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toast = null; this._toastTimer = null; }, TOAST_MS);
  }

  // ───────── Rendern ─────────
  override render(): TemplateResult {
    const s = this.hass?.states ?? {};
    const settings = readSettings(s);
    this.classList.toggle('light', !settings.dark);
    const page = this.page;
    const t = PAGE_TITLE[page];
    return html`
      <div class="page" data-page=${page}>
        <div class="topbar">
          <div><h1>${t.title}</h1><div class="sub">${t.sub}</div></div>
          <span class="version">dreame_x60 v${VERSION}</span>
        </div>
        ${this.renderPage(page, s)}
      </div>
      ${this.renderOverlay()}
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  /** Seiteninhalt: bis Phase 4 Platzhalter mit einer Vorschau der Sichten, damit die Verdrahtung sichtbar ist. */
  private renderPage(page: Page, s: HomeAssistant['states']): TemplateResult {
    const robot = readRobot(s);
    const preview: string[] = [];
    if (page === 'start') { preview.push(`Kopf: ${robot.hero.big}${robot.hero.sub ? ' · ' + robot.hero.sub : ''} · Akku ${robot.battery} %`); preview.push(`Automatik: ${readAutomatik(s).status || '–'}`); preview.push(`Verschleiß: ${readConsumables(s).map((c) => `${c.name} ${c.pct} %`).join(', ')}`); preview.push(`Station: ${readStation(s).tiles.map((x) => `${x.label} ${x.value}`).join(', ')}`); }
    if (page === 'reinigen') { const m = readMap(s); preview.push(`Kartendarstellung: ${m.karte} · Stühle am Boden: ${m.chairs ? 'an' : 'aus'} · Kalibrierung: ${Array.isArray(m.calibrationPoints) ? m.calibrationPoints.length + ' Punkte' : 'fehlt'}`); }
    if (page === 'planer') { const p = readPlans(s); preview.push(...p.plans.map((x) => `${x.n} ${x.name || '–'} · ${x.aktiv ? 'aktiv' : 'inaktiv'} · ${x.raeume.length} Räume · ${x.zeit}`)); preview.push(`Lernwerte: ${readLearn(s) ? 'vorhanden' : 'keine'}`); }
    if (page === 'protokoll') { const h = readHistory(s); preview.push(`${h.entries.length} Einträge · ${h.count} Läufe · ${h.totalArea} m² · ${h.totalTime} min${h.stale ? ' · letzter Stand' : ''}`); }
    if (page === 'prognose') { const p = readPrognose(s); preview.push(p.aktiv ? `${p.state} · ${p.tage} Tage · frei ${p.freiesFenster} · Rückkehr ${p.rueckkehr}` : 'Prognose aus'); }
    if (page === 'einstellungen') { const d = readDiagnostics(s); const r = readRobotSettings(s); preview.push(`Karte ${readSettings(s).karte.value} · Diagnose: ${d.missing.length} fehlend, ${d.unavailable.length} unavailable von ${d.total}`); preview.push(`Roboter: ${r.selects.map((x) => `${x.label} ${x.value}`).join(', ')} · DND ${r.dndStart}–${r.dndEnd}`); }
    const entities = Object.keys(s).length;
    return html`
      <div class="bento">
        <section class="b span12">
          <div class="hd"><h2>Seite „${page}“</h2><span class="r">${entities ? `${entities} Entitäten verbunden` : 'keine Zustandsdaten'}</span></div>
          <div class="lbl">Hier entstehen</div>
          <ul class="hint list">${PAGE_PARTS[page].map((p) => html`<li>${p}</li>`)}</ul>
          <div class="lbl">Sichten (Vorschau aus den Selektoren)</div>
          <ul class="hint list preview">${preview.map((p) => html`<li>${p}</li>`)}</ul>
          <div class="hint">Leere Shell aus Aufgabe 3.3 – Optik nach Mockup <code>dreame_x60/mockups/bento.html</code>.</div>
        </section>
      </div>`;
  }

  /** Overlay: bis 4.2 (dx-dialog) ein Platzhalter-Rahmen; confirm ist schon bedienbar. */
  private renderOverlay(): TemplateResult | typeof nothing {
    const o = this._overlay;
    if (!o) return nothing;
    if (o.kind === 'confirm') {
      return html`<div class="overlay" data-kind="confirm"><div class="scrim" @click=${() => this.closeOverlay()}></div>
        <div class="alert" role="alertdialog" aria-modal="true"><div class="m">${o.text}${o.sub ? html`<small>${o.sub}</small>` : nothing}</div>
          <div class="b"><button @click=${() => this.closeOverlay()}>Abbrechen</button><button class=${o.danger ? 'danger' : ''} @click=${() => this.confirmOverlay()}>${o.okLabel ?? 'OK'}</button></div></div></div>`;
    }
    return html`<div class="overlay" data-kind=${o.kind}><div class="scrim" @click=${() => this.closeOverlay()}></div>
      <div class="dlg" role="dialog" aria-modal="true"><h2>Overlay „${o.kind}“ <button class="iconbtn" aria-label="Schließen" @click=${() => this.closeOverlay()}>✕</button></h2>
        <div class="hint">Platzhalter – der Dialog entsteht in Phase 4 (dx-dialog 4.2).</div>
        <div class="foot">${'back' in o && o.back ? html`<button class="btn" @click=${() => this.backOverlay()}>Zurück</button>` : nothing}<button class="btn primary" @click=${() => this.closeOverlay()}>Schließen</button></div></div></div>`;
  }
}

// Registrierung: nur einmal, auch wenn das Bundle doppelt geladen wird (Regel 11).
if (!customElements.get(ELEMENT)) customElements.define(ELEMENT, DreameX60Panel);

declare global {
  interface Window { customCards?: Array<{ type: string; name: string; description?: string; preview?: boolean }> }
}
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === ELEMENT)) {
  window.customCards.push({ type: ELEMENT, name: 'Heidi (dreame_x60)', description: 'Heidi-Karte v2 – Übersicht und Unterseiten des Saugroboters', preview: false });
}

console.info(`%c dreame_x60 %c v${VERSION} `, 'background:#0b1015;color:#58b7f6;font-weight:600', 'background:#0b1015;color:#e7edf3');
