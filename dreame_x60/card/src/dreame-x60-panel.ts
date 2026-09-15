// dreame-x60-panel – Shell der Heidi-Karte v2 (Bauplan 3.3 + 4.0): erzeugt Sichten über memoisierte Selektoren, reicht
// hass, Sichten und api an die Bausteine, rendert Gerüst (dx-nav + Inhalt), Kopfzeile und die Seite nach config.page,
// hält Overlay und Toast, hört auf dx-*-Ereignisse.
// Kein shouldUpdate in der Shell (Regel 10) – Ruhe entsteht durch gleiche View-Referenzen in den Kindern.
import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, PanelConfig } from './ha/types';
import { DxApi } from './ha/api';
import { readAllRoomValues, readAutomatik, readConsumables, readDiagnostics, readHistory, readLearn, readMap, readPlans, readPrognose, readRobot, readRobotSettings, readSettings, readStation } from './ha/selectors';
import type { RobotView } from './ha/selectors';
import { PAGES, PAGE_PARTS, PAGE_TITLE, START_SLOTS, startSlot, toPage } from './pages';
import type { Page, StartSlot } from './pages';
import { ROOMS } from './config';
import { EVENTS } from './shared/overlay';
import type { Overlay } from './shared/overlay';
import { navigate } from './shared/navigate';
import { tokens } from './styles/tokens';
import { base } from './styles/base';
import { shell } from './styles/shell';
import { VERSION } from './version';
import './components/dx-nav';
import './components/dx-hero';
import './components/dx-auftrag';

export const ELEMENT = 'dreame-x60-panel';
export { PAGES };
export type { Page };

/** Anzeigedauer des Toasts in ms (wie v1). */
const TOAST_MS = 1900;
/** Tagesgruß der Übersicht: bis 11 Uhr Morgen, bis 18 Uhr Tag, danach Abend. */
const GREETING = (h: number): string => (h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend');

export class DreameX60Panel extends LitElement {
  static override styles = [tokens, base, shell];

  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _overlay: { state: true },
    _toast: { state: true },
    _now: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: PanelConfig;
  declare private _overlay: Overlay | null;
  declare private _toast: string | null;
  /** Uhrzeit der Kopfzeile, im Minutentakt. */
  declare private _now: number;

  /** Schreibzugriffe – eine Instanz je Shell, liest hass zur Laufzeit. */
  readonly api = new DxApi(() => this.hass);
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;
  private _clockTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape' && this._overlay) this.closeOverlay(); };

  constructor() {
    super();
    this._config = { page: 'start' };
    this._overlay = null;
    this._toast = null;
    this._now = Date.now();
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
    this.tickClock();
  }

  override disconnectedCallback(): void {
    window.removeEventListener('keydown', this._onKey);
    if (this._clockTimer) { clearTimeout(this._clockTimer); this._clockTimer = null; }
    super.disconnectedCallback();
  }

  /** Nächster Tick zur vollen Minute (+50 ms), damit die Uhr nie eine Minute hinterherhinkt. */
  private tickClock(): void {
    this._now = Date.now();
    this._clockTimer = setTimeout(() => this.tickClock(), 60_000 - (Date.now() % 60_000) + 50);
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
    const robot = readRobot(s);
    return html`
      <div class="root"><div class="app">
        <dx-nav .page=${page} .prognoseAktiv=${readPrognose(s).aktiv} .version=${VERSION}></dx-nav>
        <main class="content page" data-page=${page}>
          ${this.renderTopbar(page, robot)}
          ${page === 'start' ? this.renderStart(s, robot) : this.renderPage(page, s)}
        </main>
      </div></div>
      ${this.renderOverlay()}
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  /** Kopfzeile: Übersicht mit Tagesgruß bzw. „Heidi ist unterwegs“, Unterseiten mit Zurück-Knopf; rechts Uhr, Zuhause, Nicht stören. */
  private renderTopbar(page: Page, robot: RobotView): TemplateResult {
    const now = new Date(this._now);
    let title: string, sub: string;
    if (page === 'start') {
      const name = (this.hass?.user?.name ?? '').trim();
      title = robot.running ? 'Heidi ist unterwegs' : `${GREETING(now.getHours())}${name ? ', ' + name : ''}!`;
      sub = robot.hero.sub ? `${robot.hero.big} · ${robot.hero.sub}` : robot.hero.big;
    } else {
      ({ title, sub } = PAGE_TITLE[page]);
    }
    const home = robot.persons.filter((p) => p.known && p.home).map((p) => p.name);
    return html`
      <div class="topbar">
        ${page !== 'start' ? html`<button class="back" @click=${() => navigate('start')}><ha-icon icon="mdi:chevron-left"></ha-icon>Übersicht</button>` : nothing}
        <div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="meta">
          <div class="mi"><ha-icon icon="mdi:clock-outline"></ha-icon><div><b>${now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}</b><small>${now.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</small></div></div>
          <div class="mi"><ha-icon icon="mdi:home-outline"></ha-icon><div><b>${home.length ? 'Zu Hause' : 'Niemand zu Hause'}<span class="dot ${home.length ? 'on' : ''}"></span></b><small>${home.length ? home.join(' · ') + ' anwesend' : 'alle unterwegs'}</small></div></div>
          <div class="mi"><ha-icon icon="mdi:weather-night"></ha-icon><div><b>${robot.hero.dnd}</b><small>Nicht stören</small></div></div>
        </div>
      </div>`;
  }

  /** Bento-Übersicht (Bauplan 4.0): Bausteine, wo sie schon existieren (4.1 dx-hero, dx-auftrag), sonst Platzhalter mit einer Vorschau der Sichten. */
  private renderStart(s: HomeAssistant['states'], robot: RobotView): TemplateResult {
    const entities = Object.keys(s).length;
    const plans = readPlans(s); const prog = readPrognose(s); const hist = readHistory(s); const map = readMap(s); const rooms = readAllRoomValues(s);
    const lines: Record<string, string[]> = {
      map: [entities ? `${entities} Entitäten verbunden` : 'keine Zustandsdaten', `Kartendarstellung: ${map.karte} · Kalibrierung: ${Array.isArray(map.calibrationPoints) ? map.calibrationPoints.length + ' Punkte' : 'fehlt'}`],
      automatik: [`Automatik: ${readAutomatik(s).status || '–'}`],
      heute: [`Heutiger Eintrag: ${plans.heuteName || '–'}${plans.heuteZeit ? ' · ' + plans.heuteZeit : ''}`, prog.aktiv ? `Freies Fenster ${prog.freiesFenster} · Rückkehr ${prog.rueckkehr}` : 'Prognose aus'],
      planer: plans.plans.slice(0, 3).map((x) => `${x.n} ${x.name || '–'} · ${x.aktiv ? 'aktiv' : 'inaktiv'} · ${x.zeit}`),
      consumables: [readConsumables(s).map((c) => `${c.name} ${c.pct} %`).join(', ')],
      station: [readStation(s).tiles.map((x) => `${x.label} ${x.value}`).join(', ')],
      stats: [`${hist.count} Läufe · ${hist.totalArea} m² · ${hist.totalTime} min`],
      quickstart: [`Räume: ${ROOMS.map((r) => r.short).join(', ')}`],
      history: [`${hist.entries.length} Einträge${hist.stale ? ' · letzter Stand' : ''}`],
    };
    const box = (sl: StartSlot): TemplateResult => html`
      <section class="b ${sl.span}" data-slot=${sl.slot}>
        <div class="hd"><h2>${sl.title}</h2><span class="r">${sl.part}</span></div>
        ${(lines[sl.slot] ?? []).map((l) => html`<div class="hint preview">${l}</div>`)}
        <div class="hint">Platzhalter – entsteht in Aufgabe ${sl.task}.</div>
      </section>`;
    const rest = START_SLOTS.filter((sl) => !['hero', 'map', 'automatik', 'auftrag', 'heute'].includes(sl.slot));
    return html`
      <div class="bento">
        <dx-hero class="b span3" data-slot="hero" .robot=${robot} .rooms=${rooms} .api=${this.api}></dx-hero>
        ${box(startSlot('map'))}
        <div class="span3 stack rightstack">
          ${robot.vac === 'cleaning' || robot.vac === 'paused' ? html`<dx-auftrag class="b" data-slot="auftrag" .robot=${robot} .rooms=${rooms}></dx-auftrag>` : box(startSlot('automatik'))}
          ${box(startSlot('heute'))}
        </div>
        ${rest.map(box)}
      </div>`;
  }

  /** Unterseiten: bis zur jeweiligen Karte in Phase 4 ein Platzhalter mit einer Vorschau der Sichten, damit die Verdrahtung sichtbar ist. */
  private renderPage(page: Exclude<Page, 'start'>, s: HomeAssistant['states']): TemplateResult {
    const preview: string[] = [];
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
          <div class="hint">Platzhalter aus Aufgabe 3.3 – Optik nach Mockup <code>dreame_x60/mockups/bento.html</code>.</div>
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
