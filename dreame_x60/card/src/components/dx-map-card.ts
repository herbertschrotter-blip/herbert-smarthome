// dx-map-card – Karte (Bauplan 4.3, PD-004/PD-005): Variante `full` (Seite Reinigen: Kartenwahl, eingebettete Karte mit
// „Hinfahren“/„Sperrzonen“, Segment Räume/Zone/Punkt + „Alles“, Raumkacheln) und `compact` (Übersicht: Reiter, Live-Bild,
// Bildunterschrift, Antippen → Seite Reinigen). Das eingebettete Karten-Element kommt aus dem Modul-Cache je
// Darstellung|Dunkel|Modus und wird nur bei Wechsel neu erzeugt (Regel 12: loadCardHelpers().createCardElement).
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../ha/types';
import type { HistoryView, MapView, RobotView } from '../ha/selectors';
import type { DxApi } from '../ha/api';
import { MAP_MODES, buildMapConfig, hasModes, isHeidiKarte, pictureConfig } from '../ha/map-config';
import './dx-heidi-map';
import type { MapConfig, MapModeKey } from '../ha/map-config';
import { mapElements } from '../shared/caches';
import { runOrder } from '../domain/strip';
import { fmtDate } from '../domain/labels';
import { roomById } from '../config';
import { askConfirm, emit, EVENTS } from '../shared/overlay';
import type { Overlay } from '../shared/overlay';
import { confirmText, segmentsOf, selectionLabel, toggleRoom } from '../shared/rooms';
import { controls } from '../styles/controls';
import { deviceName } from '../ha/device';

export const MAP_ELEMENT = 'dx-map-card';
export type MapVariant = 'full' | 'compact';

declare global {
  interface Window { loadCardHelpers?: () => Promise<{ createCardElement: (cfg: MapConfig) => HTMLElement }> }
}
type CardEl = HTMLElement & { hass?: HomeAssistant };

export class DxMapCard extends LitElement {
  static override styles = [controls, css`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--dx-border); overflow-x: auto; }
    .tabs button { height: 40px; padding: 0 12px; color: var(--dx-text-muted); font-weight: 500; font-size: 13px; border-bottom: 2px solid transparent; margin-bottom: -1px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
    .tabs button.on { color: var(--dx-text); border-bottom-color: var(--dx-accent); }
    .tabs button ha-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; }
    .seg2 { display: inline-flex; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 3px; gap: 2px; max-width: 100%; flex-wrap: wrap; }
    .seg2 button { height: 34px; padding: 0 12px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--dx-text-muted); white-space: nowrap; }
    .seg2 button.on { background: var(--dx-surface-active); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.5); }
    .hd .seg2 { margin-left: auto; }
    .map { position: relative; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); overflow: hidden; flex: 1;
      background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px); background-size: 24px 24px; }
    .map.tap { cursor: pointer; }
    .slot { min-height: 220px; display: block;
      /* Heidi-Glas: die eingebettete Karte liest diese Variablen durch ihr Shadow DOM (dreame_x60/mockups/karte.html) */
      --ha-card-background: transparent; --card-background-color: transparent; --ha-card-border-width: 0; --ha-card-border-radius: 0; --ha-card-box-shadow: none;
      --primary-text-color: var(--dx-text); --secondary-text-color: var(--dx-text-muted); --primary-color: var(--dx-accent); --slider-color: var(--dx-accent);
      --map-card-primary-color: var(--dx-accent); --map-card-primary-text-color: var(--dx-on-accent); --map-card-big-radius: 16px; --map-card-small-radius: 10px; --map-card-disabled-text-color: var(--dx-text-muted);
      --map-card-room-label-color: var(--dx-text); --map-card-room-label-color-selected: var(--dx-on-accent); --map-card-room-label-font-size: 12px;
      --map-card-room-icon-color: var(--dx-text); --map-card-room-icon-color-selected: var(--dx-on-accent);
      --map-card-room-icon-background-color: rgba(12, 18, 30, 0.55); --map-card-room-icon-background-color-selected: var(--dx-accent); --map-card-room-icon-size: 18px; --map-card-room-icon-wrapper-size: 30px;
      --map-card-room-outline-fill-color: transparent; --map-card-room-outline-fill-color-selected: color-mix(in srgb, var(--dx-accent) 35%, transparent); --map-card-room-outline-line-color: rgba(255, 255, 255, 0.28); --map-card-room-outline-line-color-selected: var(--dx-accent); --map-card-room-outline-line-width: 1;
      --map-card-predefined-rectangle-fill-color: transparent; --map-card-predefined-rectangle-fill-color-selected: color-mix(in srgb, var(--dx-accent) 35%, transparent);
      --map-card-predefined-rectangle-line-color: transparent; --map-card-predefined-rectangle-line-color-selected: var(--dx-accent);
      --map-card-predefined-rectangle-label-color: var(--dx-text); --map-card-predefined-rectangle-label-color-selected: var(--dx-on-accent); --map-card-predefined-rectangle-label-font-size: 12px;
      --map-card-predefined-rectangle-icon-color: var(--dx-text); --map-card-predefined-rectangle-icon-color-selected: var(--dx-on-accent);
      --map-card-predefined-rectangle-icon-background-color: rgba(12, 18, 30, 0.55); --map-card-predefined-rectangle-icon-background-color-selected: var(--dx-accent); --map-card-predefined-rectangle-icon-size: 18px; --map-card-predefined-rectangle-icon-wrapper-size: 30px;
      --map-card-manual-rectangle-fill-color: color-mix(in srgb, var(--dx-danger) 28%, transparent); --map-card-manual-rectangle-line-color: var(--dx-danger); --map-card-manual-rectangle-fill-color-selected: color-mix(in srgb, var(--dx-danger) 40%, transparent); --map-card-manual-rectangle-line-color-selected: var(--dx-danger);
      --map-card-ripple-color: var(--dx-accent); --mdc-icon-size: 18px; }
    .catch { position: absolute; inset: 0; }
    .mtools { position: absolute; left: 10px; bottom: 10px; display: flex; gap: 6px; }
    .mtools .btn { box-shadow: var(--dx-shadow-float); background: var(--dx-surface-raised); }
    .mapcap { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--dx-text-muted); flex-wrap: wrap; }
    .mapcap b { color: var(--dx-text); font-weight: 600; }
    .mapcap .r { margin-left: auto; }
    .mapmodes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .mapmodes .hint { flex: 1; }
    .rooms { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
    .rooms button { display: grid; justify-items: center; gap: 6px; padding: 12px 6px 10px; min-height: 72px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text-muted); transition: background var(--dx-dur), border-color var(--dx-dur), color var(--dx-dur); }
    .rooms button ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
    .rooms button:hover { background: var(--dx-surface-active); color: var(--dx-text); }
    .rooms button.sel { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.35); }
    .rooms button.sel ha-icon { color: var(--dx-accent); }
    .runbar { display: flex; gap: 8px; align-items: center; }
    .runbar .btn.primary { flex: 1; }
    .err { color: var(--dx-danger); font-size: 12px; }
    @container content (max-width: 1099px) { .rooms { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  `];

  static override properties = {
    hass: { attribute: false }, map: { attribute: false }, robot: { attribute: false }, history: { attribute: false }, api: { attribute: false },
    variant: { type: String }, dark: { type: Boolean },
    _mode: { state: true }, _sel: { state: true }, _error: { state: true },
  };

  declare hass?: HomeAssistant;
  declare map?: MapView;
  declare robot?: RobotView;
  declare history?: HistoryView;
  declare api?: DxApi;
  declare variant: MapVariant;
  declare dark: boolean;
  declare private _mode: MapModeKey;
  declare private _sel: Set<number>;
  declare private _error: string | null;
  private _pending: string | null = null;

  constructor() {
    super();
    this.variant = 'full';
    this.dark = true;
    this._mode = 'raeume';
    this._sel = new Set();
    this._error = null;
  }

  get mode(): MapModeKey { return this._mode; }
  get selection(): ReadonlySet<number> { return this._sel; }

  /** Schlüssel des Modul-Caches: die Übersicht zeigt immer das Kamerabild, die Seite Reinigen je Darstellung und Modus. */
  cacheKey(): string {
    if (this.variant === 'compact') return 'compact';
    const kind = this.map?.karte ?? '';
    return hasModes(kind) ? `${kind}|${this._mode}` : `${kind}|${this.dark}`;
  }

  override updated(): void { void this.mountMap(); }

  /** Karten-Element aus dem Cache in den Slot setzen (oder einmal erzeugen); `hass` bei jedem Tick durchreichen. */
  private async mountMap(): Promise<void> {
    const slot = this.renderRoot.querySelector<HTMLElement>('.slot');
    if (!slot || !this.map) return;
    const key = this.cacheKey();
    let el = mapElements.get(key) as CardEl | undefined;
    if (!el) {
      if (this._pending === key) return;
      this._pending = key;
      try {
        if (!window.loadCardHelpers) throw new Error('loadCardHelpers fehlt');
        const helpers = await window.loadCardHelpers();
        const cfg = this.variant === 'compact' ? pictureConfig() : buildMapConfig(this.map.karte, this.dark, this._mode, this.map.roomShapes);
        el = helpers.createCardElement(cfg) as CardEl;
        mapElements.set(key, el);
        this._error = null;
      } catch (e) {
        this._error = `Karte konnte nicht geladen werden: ${String((e as Error)?.message ?? e)}`;
        return;
      } finally {
        this._pending = null;
      }
      if (this.cacheKey() !== key) { void this.mountMap(); return; } // inzwischen umgeschaltet
    }
    if (this.hass) el.hass = this.hass;
    if (slot.firstChild !== el) slot.replaceChildren(el);
  }

  // ───────── Aktionen ─────────
  private setMode(mode: MapModeKey): void { this._mode = mode; }
  private openZones(): void { emit<Overlay>(this, EVENTS.openOverlay, { kind: 'zones', type: 'zones' }); }
  private goReinigen(): void { emit(this, EVENTS.navigate, { page: 'reinigen' }); }

  private runRooms(): void {
    const order = this.map?.roomOrder ?? [];
    const segments = segmentsOf(this._sel, order);
    if (!segments.length) return;
    askConfirm(this, confirmText(this._sel, order), () => {
      void this.api?.startRooms(segments).then(() => emit(this, EVENTS.toast, `Gestartet: ${selectionLabel(this._sel, order)}`), (e: unknown) => emit(this, EVENTS.toast, `Start fehlgeschlagen: ${String((e as Error)?.message ?? e)}`));
      this._sel = new Set();
    });
  }

  private runAll(): void {
    askConfirm(this, 'Ganze Wohnung reinigen?', () => { void this.api?.vacuum('start'); emit(this, EVENTS.toast, 'Gestartet: ganze Wohnung'); });
  }

  // ───────── Rendern ─────────
  /** Bildunterschrift (compact): im Lauf Raum, Fläche und Rest; sonst Station und letzter Lauf. */
  private caption(): TemplateResult {
    const r = this.robot;
    if (r && (r.vac === 'cleaning' || r.vac === 'paused') && !r.docked) {
      const rest = runOrder(r).rest.map((id) => roomById(id)?.short).filter(Boolean).join(', ');
      return html`<b>Live-Karte</b> · ${r.room !== '–' ? r.room : 'unterwegs'} · ${r.cleanedArea} m²${rest ? html` · noch ${rest}` : nothing}`;
    }
    const last = this.history?.entries[0];
    return html`<b>Karte</b> · ${deviceName() || 'Roboter'} in der Station${last ? html` · letzter Lauf ${fmtDate(last.ts * 1000)}` : nothing}`;
  }

  private renderCompact(): TemplateResult {
    return html`
      <div class="tabs">
        <button class="on"><ha-icon icon="mdi:map-outline"></ha-icon>Live-Karte</button>
        <button data-nav="reinigen" @click=${this.goReinigen}><ha-icon icon="mdi:view-grid-outline"></ha-icon>Räume</button>
        <button data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>Sperrzonen</button>
        <button data-nav="protokoll" @click=${() => emit(this, EVENTS.navigate, { page: 'protokoll' })}><ha-icon icon="mdi:history"></ha-icon>Reinigungsverlauf</button>
      </div>
      <div class="map tap" title="Zur Karte">
        <div class="slot"></div>
        <div class="catch" @click=${this.goReinigen}></div>
        <div class="mtools"><button class="btn sm" @click=${this.goReinigen}><ha-icon icon="mdi:map-outline"></ha-icon>Karte öffnen</button></div>
      </div>
      ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
      <div class="mapcap">${this.caption()}<span class="r">antippen für Räume, Zone, Punkt, Sperrzonen</span></div>`;
  }

  private renderFull(): TemplateResult {
    const m = this.map;
    const kind = m?.karte ?? '';
    const modes = hasModes(kind);
    const heidi = isHeidiKarte(kind);
    const order = m?.roomOrder ?? [];
    const sel = this._sel;
    const sm = m?.selectedMap ?? null;
    return html`
      <div class="hd"><h2><ha-icon icon="mdi:map-outline"></ha-icon>Karte</h2>
        ${sm ? html`<span class="seg2 maps">${sm.options.map((o) => html`<button class=${o === sm.value ? 'on' : ''} data-map=${o} @click=${() => void this.api?.selectOption(sm.id, o)}>${o}</button>`)}</span>` : html`<span class="r">${kind}</span>`}
      </div>
      <div class="map">
        ${heidi
          ? html`<dx-heidi-map .map=${m} .robot=${this.robot} .selected=${sel} @dx-room-tap=${(e: CustomEvent<{ id: number }>) => { this._sel = toggleRoom(this._sel, e.detail.id); }}></dx-heidi-map>`
          : html`<div class="slot"></div>`}
        ${modes ? html`<div class="mtools">
          <button class="btn sm ${this._mode === 'goto' ? 'on' : ''}" data-act="goto" @click=${() => this.setMode(this._mode === 'goto' ? 'raeume' : 'goto')}><ha-icon icon="mdi:map-marker"></ha-icon>Hinfahren</button>
          <button class="btn sm" data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>Sperrzonen</button>
        </div>` : nothing}
      </div>
      ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
      <div class="mapmodes">
        ${modes
          ? html`<div class="seg2 modes">${(['raeume', 'zone', 'punkt'] as const).map((k) => html`<button data-mode=${k} class=${this._mode === k ? 'on' : ''} @click=${() => this.setMode(k)}>${MAP_MODES[k].label}</button>`)}</div>`
          : html`<button class="btn sm" data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>Sperrzonen</button>` /* Dreame-App/Nur Bild: die Karte hat eine eigene Knopfzeile, unser Knopf steht darunter */}
        <span class="hint">${modes ? MAP_MODES[this._mode].hint : heidi ? 'Räume in der Karte oder über die Kacheln antippen, dann „reinigen“' : 'Räume antippen, dann „reinigen“'}</span>
        <button class="btn primary sm" data-act="all" @click=${this.runAll}><ha-icon icon="mdi:play"></ha-icon>Alles</button>
      </div>
      ${!modes || this._mode === 'raeume' ? html`
        <div class="rooms">${order.map((r) => html`<button class=${sel.has(r.id) ? 'sel' : ''} data-room=${r.id} @click=${() => { this._sel = toggleRoom(sel, r.id); }}><ha-icon icon=${r.icon}></ha-icon>${r.short}</button>`)}</div>
        ${sel.size ? html`<div class="runbar"><button class="btn primary" data-act="run" @click=${this.runRooms}><ha-icon icon="mdi:play"></ha-icon>${selectionLabel(sel, order)} reinigen</button><button class="btn icon" aria-label="Auswahl aufheben" @click=${() => { this._sel = new Set(); }}><ha-icon icon="mdi:close"></ha-icon></button></div>` : nothing}
      ` : nothing}`;
  }

  override render(): TemplateResult {
    return this.variant === 'compact' ? this.renderCompact() : this.renderFull();
  }
}

if (!customElements.get(MAP_ELEMENT)) customElements.define(MAP_ELEMENT, DxMapCard);
