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
import { askConfirm } from './shared/overlay';
import { controls } from './styles/controls';

export const ELEMENT = 'dreame-x60-panel';
export { PAGES };
export type { Page };

/** Anzeigedauer des Toasts in ms (wie v1). */
const TOAST_MS = 1900;
/** Tagesgruß der Übersicht: bis 11 Uhr Morgen, bis 18 Uhr Tag, danach Abend. */
const GREETING = (h: number): string => (h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend');

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
    }
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
    super.disconnectedCallback();
  }

  /** Nächster Tick zur vollen Minute (+50 ms), damit die Uhr nie eine Minute hinterherhinkt. */
  private tickClock(): void {
    this._now = Date.now();
    this.refreshSetup(false); // alle fünf Minuten neu (Cache im Lader)
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
      const robotName = deviceName() || 'Roboter';
      title = robot.running && !robot.docked ? `${robotName} ist unterwegs` : robot.running ? `${robotName} ist in der Station` : `${GREETING(now.getHours())}${name ? ', ' + name : ''}!`;
      sub = robot.hero.sub ? `${robot.hero.big} · ${robot.hero.sub}` : robot.hero.big;
    } else {
      ({ title, sub } = PAGE_TITLE[page]);
      title ||= deviceName() || 'Roboter';
    }
    const home = robot.persons.filter((p) => p.known && p.home).map((p) => p.name);
    return html`
      <div class="topbar">
        ${page !== 'start' ? html`<button class="back" @click=${() => navigate('start')}><ha-icon icon="mdi:chevron-left"></ha-icon>Übersicht</button>` : nothing}
        <div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="meta">
          ${this.renderSetupIcons(robot)}
          <div class="mi time"><ha-icon icon="mdi:clock-outline"></ha-icon><div><b>${now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}</b><small>${now.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</small></div></div>
          <div class="mi home"><ha-icon icon="mdi:home-outline"></ha-icon><div><b>${home.length ? 'Zu Hause' : 'Niemand zu Hause'}<span class="dot ${home.length ? 'on' : ''}"></span></b><small>${home.length ? home.join(' · ') + ' anwesend' : 'alle unterwegs'}</small></div></div>
          <div class="mi dnd"><ha-icon icon="mdi:weather-night"></ha-icon><div><b>${robot.hero.dnd}</b><small>Nicht stören</small></div></div>
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
    else if (a.kind === 'vacuum-areas') { void openVacuumSegmentMapping(this, a.entity).then((r) => { if (r === 'fallback') this.toast(`Im Dialog: ${a.hint}`); }); }
    else if (a.kind === 'page') navigate(a.page);
    else navigateHa(a.path);
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
      quickstart: [`Räume: ${map.roomOrder.map((r) => r.short).join(', ') || 'keine (Karte fehlt)'}`],
      history: [`${hist.entries.length} Einträge${hist.stale ? ' · letzter Stand' : ''}`],
    };
    const box = (sl: StartSlot): TemplateResult => html`
      <section class="b ${sl.span}" data-slot=${sl.slot}>
        <div class="hd"><h2>${sl.title || deviceName() || 'Roboter'}</h2><span class="r">${sl.part}</span></div>
        ${(lines[sl.slot] ?? []).map((l) => html`<div class="hint preview">${l}</div>`)}
        <div class="hint">Platzhalter – entsteht in Aufgabe ${sl.task}.</div>
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
            <div class="hd"><h2><ha-icon icon="mdi:flash-outline"></ha-icon>Dreame-App-Szenen</h2></div>
            <div class="plan">${APP_SCENES.map((sc) => html`<div class="pr"><div class="ic"><ha-icon icon=${sc.icon}></ha-icon></div><div><div class="n">${sc.name}</div><div class="s">${sc.sub}</div></div><span class="tag">App</span>
              <div class="acts"><button class="ib go" data-scene=${sc.id} aria-label="Starten" title="Starten" @click=${() => askConfirm(this, `„${sc.name}“ starten?`, () => { void this.api.runScene(sc.id); this.toast(`Gestartet: ${sc.name}`); })}><ha-icon icon="mdi:play"></ha-icon></button></div></div>`)}</div>
          </section>
          <section class="b" data-slot="chairs">
            <div class="crow"><div class="ic ${map.chairs ? 'on' : ''}"><ha-icon icon="mdi:chair-rolling"></ha-icon></div><div><div class="t">Stühle am Boden</div><div class="s">Setzt eine Sperrzone um den Esstisch</div></div>
              <button class="sw ${map.chairs ? 'on' : ''}" role="switch" aria-checked=${map.chairs ? 'true' : 'false'} aria-label="Stühle am Boden" data-toggle="chairs" @click=${() => void this.api.toggle(map.chairsId)}></button></div>
          </section>
          <section class="b" data-slot="rooms">
            <div class="hd"><h2><ha-icon icon="mdi:view-grid-outline"></ha-icon>Räume (Roboter-Werte)</h2></div>
            <div class="hint">Modus, Saugstufe, Wasser, Route und Wiederholungen je Raum, wie in der Dreame-App. Änderungen gelten sofort.</div>
            <button class="btn" data-open="rooms" style="align-self:flex-start" @click=${() => this.openOverlay({ kind: 'rooms', mode: 'robot' })}><ha-icon icon="mdi:view-grid-outline"></ha-icon>Räume einstellen …</button>
          </section>
        </div>
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

  /** Overlay im dx-dialog-Rahmen (4.2): confirm fertig; die Inhalte der übrigen Dialoge kommen mit ihren Bausteinen (4.5, 4.6, 4.8, 4.11, 4.12). */
  private renderOverlay(): TemplateResult | typeof nothing {
    const o = this._overlay;
    if (!o) return nothing;
    if (o.kind === 'confirm') {
      return html`<dx-dialog class="overlay" data-kind="confirm" variant="confirm" .text=${o.text} .subText=${o.sub ?? ''} .okLabel=${o.okLabel ?? 'OK'} ?danger=${!!o.danger}></dx-dialog>`;
    }
    const hasBack = 'back' in o && !!o.back;
    return html`<dx-dialog class="overlay" data-kind=${o.kind} heading=${'Overlay „' + o.kind + '“'} ?back=${hasBack}>
        <div class="hint">Platzhalter – der Inhalt dieses Dialogs entsteht mit seinem Baustein in Phase 4.</div>
        ${hasBack ? html`<button slot="foot" class="btn" @click=${() => this.backOverlay()}>Zurück</button>` : nothing}
        <button slot="foot" class="btn primary" @click=${() => this.closeOverlay()}>Schließen</button>
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
  window.customCards.push({ type: ELEMENT, name: 'Heidi (dreame_x60)', description: 'Heidi-Karte v2 – Übersicht und Unterseiten des Saugroboters', preview: false });
}

console.info(`%c dreame_x60 %c v${VERSION} `, 'background:#0b1015;color:#58b7f6;font-weight:600', 'background:#0b1015;color:#e7edf3');
