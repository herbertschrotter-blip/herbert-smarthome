// dreame-x60-panel – Shell der Heidi-Karte v2 (Bauplan 3.3 + 4.0): erzeugt Sichten über memoisierte Selektoren, reicht
// hass, Sichten und api an die Bausteine, rendert Gerüst (dx-nav + Inhalt), Kopfzeile und die Seite nach config.page,
// hält Overlay und Toast, hört auf dx-*-Ereignisse.
// Kein shouldUpdate in der Shell (Regel 10) – Ruhe entsteht durch gleiche View-Referenzen in den Kindern.
import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { HomeAssistant, PanelConfig } from './ha/types';
import { DxApi } from './ha/api';
import { device, deviceName, discoverDevice } from './ha/device';
import { ENTITIES, robotEntity } from './ha/contract';
import { readProfile } from './ha/profile';
import { setupChecks, setupProblems } from './domain/setup';
import type { SetupAction, SetupCheck } from './domain/setup';
import { navigate, navigateHa } from './shared/navigate';
import { moreInfo } from './shared/overlay';
import { openVacuumSegmentMapping } from './shared/ha-deep';
import { loadSetupData } from './ha/setup-loader';
import type { SetupData } from './ha/setup-loader';
import { readAllRoomValues, readAutomatik, readConsumables, readDiagnostics, readHistory, readLearn, readMap, readPlans, readPrognose, readRobot, readRobotSettings, readSettings, readStation } from './ha/selectors';
import type { RobotView } from './ha/selectors';
import { PAGES, PAGE_PARTS, PAGE_TITLE, START_SLOTS, startSlot, toPage } from './pages';
import type { Page, StartSlot } from './pages';
import { EVENTS } from './shared/overlay';
import type { Overlay } from './shared/overlay';
import { tokens } from './styles/tokens';
import { base } from './styles/base';
import { shell } from './styles/shell';
import { VERSION } from './version';
import './components/dx-nav';
import './components/dx-hero';
import './components/dx-auftrag';
import './components/dx-dialog';
import './components/dx-map-card';
import './components/dx-quickstart';
import { APP_SCENES } from './config';
import { t, tx } from './i18n/t';
import { askConfirm } from './shared/overlay';
import { controls } from './styles/controls';

export const ELEMENT = 'dreame-x60-panel';
export { PAGES };
export type { Page };

/** Anzeigedauer des Toasts in ms (wie v1). */
const TOAST_MS = 1900;
/** Tagesgruß der Übersicht: bis 11 Uhr Morgen, bis 18 Uhr Tag, danach Abend. */
const GREETING = (h: number): string => (h < 11 ? t('topbar.morning') : h < 18 ? t('topbar.day') : t('topbar.evening'));

/** Marke „noch nie gesehen“ für den Vergleich von hass.entities (auch `undefined` ist ein gültiger erster Wert). */
const UNSET: unknown = Symbol('unset');

export class DreameX60Panel extends LitElement {
  static override styles = [tokens, base, controls, shell];

  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _overlay: { state: true },
    _toast: { state: true },
    _now: { state: true },
    _setupData: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: PanelConfig;
  declare private _overlay: Overlay | null;
  declare private _toast: string | null;
  /** Uhrzeit der Kopfzeile, im Minutentakt. */
  declare private _now: number;
  /** Einrichtungsprüfung (PD-014): nachgeladene Bereichszuordnung und Reparaturen, je Roboter */
  declare private _setupData: SetupData | null;
  private _setupVac = '';
  private _setupEntities: unknown = UNSET;
  /** Abo auf entity_registry_updated (Bereichszuordnung gespeichert → sofort neu laden), einmal je Verbindung */
  private _registryUnsub: (() => void) | null = null;
  private _registryConn: unknown = null;

  /** Schreibzugriffe – eine Instanz je Shell, liest hass zur Laufzeit. */
  readonly api = new DxApi(() => this.hass);
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;
  private _clockTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape' && this._overlay) this.closeOverlay(); };

  /** Geräteerkennung vor jedem Render: Roboter-IDs und Anzeigename folgen HA (PD-012). */
  override willUpdate(changed: PropertyValues): void {
    if ((changed.has('hass') || changed.has('_config')) && this.hass) {
      discoverDevice(this.hass, this._config.robot);
      const vac = device()?.vac ?? '';
      if (vac && vac !== this._setupVac) { this._setupVac = vac; this.refreshSetup(false); }
      // Entitäts-Register geändert (z. B. Bereichszuordnung gespeichert): HA tauscht hass.entities aus → sofort neu laden
      this.subscribeRegistry(this.hass);
      const ents = this.hass.entities;
      if (ents !== this._setupEntities) { const first = this._setupEntities === UNSET; this._setupEntities = ents; if (!first) this.refreshSetup(true); }
    }
  }

  /** entity_registry_updated abonnieren: Änderung am Roboter-Eintrag (z. B. Bereichszuordnung) → Einrichtungsprüfung sofort neu. */
  private subscribeRegistry(hass: HomeAssistant): void {
    const conn = hass.connection;
    if (!conn || conn === this._registryConn) return;
    this._registryConn = conn;
    this._registryUnsub?.(); this._registryUnsub = null;
    void conn.subscribeEvents<{ data?: { entity_id?: string; action?: string } }>((ev) => {
      const id = ev?.data?.entity_id;
      if (!id || id === this._setupVac || id.startsWith('vacuum.')) this.refreshSetup(true);
    }, 'entity_registry_updated').then((unsub) => { this._registryUnsub = unsub; }, () => undefined);
  }

  /** Bereichszuordnung/Reparaturen nachladen (Cache 5 min); Ergebnis nur setzen, wenn es sich geändert hat. */
  private refreshSetup(force: boolean): void {
    const hass = this.hass, vac = this._setupVac;
    if (!hass || !vac) return;
    void loadSetupData(hass, vac, force).then((d) => { if (this._setupVac === vac && d !== this._setupData) this._setupData = d; }, () => undefined);
  }

  /** Prüfungen aus Zuständen, Profil, Diagnose und nachgeladenen Daten (reine Funktion in domain/setup.ts). */
  private setupChecks(s: HomeAssistant['states'], robot: RobotView): SetupCheck[] {
    const dev = device();
    const diag = readDiagnostics(s);
    const profile = readProfile(s);
    return setupChecks({
      robot: dev ? { vac: dev.vac, name: dev.name } : null,
      rooms: profile.rooms,
      hasMapData: profile.has('mapData'),
      missingRobot: (diag.groups[0]?.missing ?? []).filter((id) => id !== ENTITIES.mapData), missingPackage: diag.groups[1]?.missing ?? [], // Datenkarte hat eine eigene Prüfung
      customizedCleaning: s[ENTITIES.customizedCleaning]?.state ?? null,
      running: robot.running,
      ids: { customizedCleaning: ENTITIES.customizedCleaning, roomName: (id) => robotEntity('select', `room_${id}_name`) },
      mapping: this._setupData?.mapping ?? null,
      repairs: this._setupData?.repairs ?? null,
    });
  }

  constructor() {
    super();
    this._config = { page: 'start' };
    this._overlay = null;
    this._toast = null;
    this._now = Date.now();
    this._setupData = null;
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
    this._registryUnsub?.(); this._registryUnsub = null; this._registryConn = null;
    super.disconnectedCallback();
  }

  /** Nächster Tick zur vollen Minute (+50 ms), damit die Uhr nie eine Minute hinterherhinkt. */
  private tickClock(): void {
    this._now = Date.now();
    this.refreshSetup(true); // jede Minute neu (drei leichte WS-Abfragen), damit Befunde ohne F5 verschwinden
    this._clockTimer = setTimeout(() => this.tickClock(), 60_000 - (Date.now() % 60_000) + 50);
  }

  // ───────── HA-Schnittstelle der Karte ─────────
  setConfig(config: PanelConfig | null | undefined): void {
    if (!config || typeof config !== 'object') throw new Error(t('card.noConfig'));
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
          ${page === 'start' ? this.renderStart(s, robot) : page === 'reinigen' ? this.renderReinigen(s, robot) : this.renderPage(page, s)}
        </main>
      </div></div>
      ${this.renderOverlay()}
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  /** Kopfzeile: Übersicht mit Tagesgruß bzw. „Heidi ist unterwegs“, Unterseiten mit Zurück-Knopf; rechts Uhr, Zuhause, Nicht stören
   *  (stabile Klassen .mi.time/.home/.dnd – später antippbar: Kalender, Anwesenheit, Zeiten; docs/dreame_x60/UX-TRANSITIONS.md). */
  private renderTopbar(page: Page, robot: RobotView): TemplateResult {
    const now = new Date(this._now);
    let title: string, sub: string;
    if (page === 'start') {
      const name = (this.hass?.user?.name ?? '').trim();
      // In der Station (Mopp-Wäsche/Trocknen nach dem Lauf) ist der Hauptzustand noch „cleaning“ – dann nicht „unterwegs“
      const robotName = deviceName() || t('common.robot');
      title = robot.running && !robot.docked ? t('topbar.away', { name: robotName }) : robot.running ? t('topbar.inStation', { name: robotName }) : `${GREETING(now.getHours())}${name ? ', ' + name : ''}!`;
      sub = robot.hero.sub ? `${robot.hero.big} · ${robot.hero.sub}` : robot.hero.big;
    } else {
      ({ title, sub } = PAGE_TITLE[page]);
      title ||= deviceName() || t('common.robot');
    }
    const home = robot.persons.filter((p) => p.known && p.home).map((p) => p.name);
    return html`
      <div class="topbar">
        ${page !== 'start' ? html`<button class="back" @click=${() => navigate('start')}><ha-icon icon="mdi:chevron-left"></ha-icon>${t('topbar.back')}</button>` : nothing}
        <div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="meta">
          ${this.renderSetupIcons(robot)}
          <div class="mi time"><ha-icon icon="mdi:clock-outline"></ha-icon><div><b>${now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}</b><small>${now.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</small></div></div>
          <div class="mi home"><ha-icon icon="mdi:home-outline"></ha-icon><div><b>${home.length ? t('topbar.home') : t('topbar.nobody')}<span class="dot ${home.length ? 'on' : ''}"></span></b><small>${home.length ? t('topbar.present', { names: home.join(' · ') }) : t('topbar.allAway')}</small></div></div>
          <div class="mi dnd"><ha-icon icon="mdi:weather-night"></ha-icon><div><b>${robot.hero.dnd}</b><small>${t('topbar.dnd')}</small></div></div>
        </div>
      </div>`;
  }

  /** Einrichtungsprüfung (PD-014): zwischen Titel und Uhr nur die Symbole mit Befund (rot pulsiert, gelb = Hinweis); Klick springt direkt zur Stelle. */
  private renderSetupIcons(robot: RobotView): TemplateResult | typeof nothing {
    const problems = setupProblems(this.setupChecks(this.hass?.states ?? {}, robot));
    if (!problems.length) return nothing;
    return html`<div class="setupicons" role="status">${problems.map((p) => html`<button class="si ${p.level}" data-check=${p.key} title=${p.text} aria-label=${p.text} @click=${() => this.runSetupAction(p.action)}><ha-icon icon=${p.icon}></ha-icon></button>`)}</div>`;
  }

  private runSetupAction(a: SetupAction | undefined): void {
    if (!a) return;
    if (a.kind === 'more-info') moreInfo(this, a.entity);
    else if (a.kind === 'vacuum-areas') { void openVacuumSegmentMapping(this, a.entity).then((r) => { if (r === 'fallback') this.toast(t('topbar.inDialog', { hint: a.hint })); }); }
    else if (a.kind === 'page') navigate(a.page);
    else navigateHa(a.path);
  }

  /** Bento-Übersicht (Bauplan 4.0): Bausteine, wo sie schon existieren (4.1 dx-hero, dx-auftrag), sonst Platzhalter mit einer Vorschau der Sichten. */
  private renderStart(s: HomeAssistant['states'], robot: RobotView): TemplateResult {
    const entities = Object.keys(s).length;
    const dash = t('common.dash');
    const plans = readPlans(s); const prog = readPrognose(s); const hist = readHistory(s); const map = readMap(s); const rooms = readAllRoomValues(s);
    const lines: Record<string, string[]> = {
      map: [entities ? t('preview.entities', { n: entities }) : t('preview.noStates'), t('preview.map', { karte: map.karte, calib: Array.isArray(map.calibrationPoints) ? t('preview.calibPoints', { n: map.calibrationPoints.length }) : t('common.missing') })],
      automatik: [t('preview.automatik', { status: readAutomatik(s).status || dash })],
      heute: [t('preview.today', { name: (plans.heuteName || dash) + (plans.heuteZeit ? ' · ' + plans.heuteZeit : '') }), prog.aktiv ? t('preview.prognose', { window: prog.freiesFenster, back: prog.rueckkehr }) : t('preview.prognoseOff')],
      planer: plans.plans.slice(0, 3).map((x) => `${x.n} ${x.name || dash} · ${x.aktiv ? t('common.active') : t('common.inactive')} · ${x.zeit}`),
      consumables: [readConsumables(s).map((c) => `${c.name} ${c.pct} %`).join(', ')],
      station: [readStation(s).tiles.map((x) => `${x.label} ${x.value}`).join(', ')],
      stats: [t('preview.stats', { runs: hist.count, area: hist.totalArea, time: hist.totalTime })],
      quickstart: [t('preview.rooms', { list: map.roomOrder.map((r) => r.short).join(', ') || t('preview.noRooms') })],
      history: [t('preview.entries', { n: hist.entries.length }) + (hist.stale ? t('preview.stale') : '')],
    };
    const box = (sl: StartSlot): TemplateResult => html`
      <section class="b ${sl.span}" data-slot=${sl.slot}>
        <div class="hd"><h2>${sl.title || deviceName() || t('common.robot')}</h2><span class="r">${sl.part}</span></div>
        ${(lines[sl.slot] ?? []).map((l) => html`<div class="hint preview">${l}</div>`)}
        <div class="hint">${t('preview.placeholder', { task: sl.task })}</div>
      </section>`;
    const rest = START_SLOTS.filter((sl) => !['hero', 'map', 'automatik', 'auftrag', 'heute', 'quickstart'].includes(sl.slot));
    const dark = readSettings(s).dark;
    return html`
      <div class="bento">
        <dx-hero class="b span3" data-slot="hero" .robot=${robot} .rooms=${rooms} .roomOrder=${map.roomOrder} .api=${this.api}></dx-hero>
        <dx-map-card class="b span6" data-slot="map" variant="compact" .hass=${this.hass} .map=${map} .robot=${robot} .history=${hist} .api=${this.api} ?dark=${dark}></dx-map-card>
        <div class="span3 stack rightstack">
          ${(robot.vac === 'cleaning' || robot.vac === 'paused') && !robot.docked ? html`<dx-auftrag class="b" data-slot="auftrag" .robot=${robot} .rooms=${rooms} .roomOrder=${map.roomOrder}></dx-auftrag>` : box(startSlot('automatik'))}
          ${box(startSlot('heute'))}
        </div>
        ${rest.map((sl) => (sl.slot === 'history' ? html`<dx-quickstart class="b span7" data-slot="quickstart" .roomOrder=${map.roomOrder} .api=${this.api}></dx-quickstart>${box(sl)}` : box(sl)))}
      </div>`;
  }

  /** Seite Reinigen (4.3): Karte `full` links, rechts App-Szenen, Schalter „Stühle am Boden“ und Knopf „Räume (Roboter-Werte)“. */
  private renderReinigen(s: HomeAssistant['states'], robot: RobotView): TemplateResult {
    const map = readMap(s); const hist = readHistory(s); const dark = readSettings(s).dark;
    return html`
      <div class="bento">
        <dx-map-card class="b span8" data-slot="map-full" variant="full" .hass=${this.hass} .map=${map} .robot=${robot} .history=${hist} .api=${this.api} ?dark=${dark}></dx-map-card>
        <div class="span4 stack">
          <section class="b" data-slot="scenes">
            <div class="hd"><h2><ha-icon icon="mdi:flash-outline"></ha-icon>${t('reinigen.scenes')}</h2></div>
            <div class="plan">${APP_SCENES.map((sc) => html`<div class="pr"><div class="ic"><ha-icon icon=${sc.icon}></ha-icon></div><div><div class="n">${sc.name}</div><div class="s">${sc.sub}</div></div><span class="tag">${t('reinigen.app')}</span>
              <div class="acts"><button class="ib go" data-scene=${sc.id} aria-label=${t('common.start')} title=${t('common.start')} @click=${() => askConfirm(this, t('reinigen.sceneConfirm', { name: sc.name }), () => { void this.api.runScene(sc.id); this.toast(t('rooms.started', { what: sc.name })); })}><ha-icon icon="mdi:play"></ha-icon></button></div></div>`)}</div>
          </section>
          <section class="b" data-slot="chairs">
            <div class="crow"><div class="ic ${map.chairs ? 'on' : ''}"><ha-icon icon="mdi:chair-rolling"></ha-icon></div><div><div class="t">${t('reinigen.chairs')}</div><div class="s">${t('reinigen.chairsSub')}</div></div>
              <button class="sw ${map.chairs ? 'on' : ''}" role="switch" aria-checked=${map.chairs ? 'true' : 'false'} aria-label=${t('reinigen.chairs')} data-toggle="chairs" @click=${() => void this.api.toggle(map.chairsId)}></button></div>
          </section>
          <section class="b" data-slot="rooms">
            <div class="hd"><h2><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t('reinigen.roomsTitle')}</h2></div>
            <div class="hint">${t('reinigen.roomsHint')}</div>
            <button class="btn" data-open="rooms" style="align-self:flex-start" @click=${() => this.openOverlay({ kind: 'rooms', mode: 'robot' })}><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t('reinigen.roomsOpen')}</button>
          </section>
        </div>
      </div>`;
  }

  /** Unterseiten: bis zur jeweiligen Karte in Phase 4 ein Platzhalter mit einer Vorschau der Sichten, damit die Verdrahtung sichtbar ist. */
  private renderPage(page: Exclude<Page, 'start'>, s: HomeAssistant['states']): TemplateResult {
    const preview: string[] = [];
    const dash = t('common.dash');
    if (page === 'reinigen') { const m = readMap(s); preview.push(t('preview.mapPage', { karte: m.karte, chairs: m.chairs ? t('common.on') : t('common.off'), calib: Array.isArray(m.calibrationPoints) ? t('preview.calibPoints', { n: m.calibrationPoints.length }) : t('common.missing') })); }
    if (page === 'planer') { const p = readPlans(s); preview.push(...p.plans.map((x) => t('preview.plan', { n: x.n, name: x.name || dash, state: x.aktiv ? t('common.active') : t('common.inactive'), rooms: x.raeume.length, time: x.zeit }))); preview.push(t('preview.learn', { state: readLearn(s) ? t('common.present') : t('common.none') })); }
    if (page === 'protokoll') { const h = readHistory(s); preview.push(t('preview.history', { entries: h.entries.length, runs: h.count, area: h.totalArea, time: h.totalTime, stale: h.stale ? t('preview.stale') : '' })); }
    if (page === 'prognose') { const p = readPrognose(s); preview.push(p.aktiv ? t('preview.prognosePage', { state: p.state, days: p.tage, window: p.freiesFenster, back: p.rueckkehr }) : t('preview.prognoseOff')); }
    if (page === 'einstellungen') { const d = readDiagnostics(s); const r = readRobotSettings(s); preview.push(t('preview.settings', { karte: readSettings(s).karte.value, missing: d.missing.length, unavailable: d.unavailable.length, total: d.total })); preview.push(t('preview.robot', { list: r.selects.map((x) => `${x.label} ${x.value}`).join(', '), start: r.dndStart, end: r.dndEnd })); }
    const entities = Object.keys(s).length;
    return html`
      <div class="bento">
        <section class="b span12">
          <div class="hd"><h2>${t('preview.pageTitle', { page })}</h2><span class="r">${entities ? t('preview.entities', { n: entities }) : t('preview.noStates')}</span></div>
          <div class="lbl">${t('preview.parts')}</div>
          <ul class="hint list">${PAGE_PARTS[page].map((p) => html`<li>${p}</li>`)}</ul>
          <div class="lbl">${t('preview.views')}</div>
          <ul class="hint list preview">${preview.map((p) => html`<li>${p}</li>`)}</ul>
          <div class="hint">${t('preview.mockup')} <code>dreame_x60/mockups/bento.html</code>.</div>
        </section>
      </div>`;
  }

  /** Overlay im dx-dialog-Rahmen (4.2): confirm fertig; die Inhalte der übrigen Dialoge kommen mit ihren Bausteinen (4.5, 4.6, 4.8, 4.11, 4.12). */
  private renderOverlay(): TemplateResult | typeof nothing {
    const o = this._overlay;
    if (!o) return nothing;
    if (o.kind === 'confirm') {
      return html`<dx-dialog class="overlay" data-kind="confirm" variant="confirm" .text=${o.text} .subText=${o.sub ?? ''} .okLabel=${o.okLabel ?? t('common.ok')} ?danger=${!!o.danger}></dx-dialog>`;
    }
    const hasBack = 'back' in o && !!o.back;
    return html`<dx-dialog class="overlay" data-kind=${o.kind} heading=${tx('dialog.overlay', { kind: o.kind })} ?back=${hasBack}>
        <div class="hint">${t('dialog.placeholder')}</div>
        ${hasBack ? html`<button slot="foot" class="btn" @click=${() => this.backOverlay()}>${t('common.back')}</button>` : nothing}
        <button slot="foot" class="btn primary" @click=${() => this.closeOverlay()}>${t('common.close')}</button>
      </dx-dialog>`;
  }
}

// Registrierung: nur einmal, auch wenn das Bundle doppelt geladen wird (Regel 11).
if (!customElements.get(ELEMENT)) customElements.define(ELEMENT, DreameX60Panel);

declare global {
  interface Window { customCards?: Array<{ type: string; name: string; description?: string; preview?: boolean }> }
}
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === ELEMENT)) {
  window.customCards.push({ type: ELEMENT, name: t('card.name'), description: t('card.description'), preview: false });
}

console.info(`%c dreame_x60 %c v${VERSION} `, 'background:#0b1015;color:#58b7f6;font-weight:600', 'background:#0b1015;color:#e7edf3');
