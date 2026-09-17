// dx-quickstart – Kachel „Schnellstart – Räume auswählen“ der Übersicht (Bauplan 4.3, PD-007): Raumkacheln + „Alles“,
// Leiste „N Räume reinigen“ → vacuum_clean_segment nach Bestätigung (dieselbe Auswahl-Logik wie der Modus Räume der Karte).
import { LitElement, html, css } from 'lit';
import type { TemplateResult } from 'lit';
import type { RoomInfo } from '../config';
import type { DxApi } from '../ha/api';
import { askConfirm, emit, EVENTS } from '../shared/overlay';
import { confirmText, segmentsOf, selectionLabel, toggleAll, toggleRoom } from '../shared/rooms';
import { controls } from '../styles/controls';
import { deviceName } from '../ha/device';
import { t } from '../i18n/t';

export const QUICKSTART_ELEMENT = 'dx-quickstart';

export class DxQuickstart extends LitElement {
  static override styles = [controls, css`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    /* „Alles“ + Räume des Roboters: Spalten nach Platz (2 … 20 Räume) */
    .qs { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
    .qs button { display: grid; justify-items: center; gap: 6px; padding: 12px 6px 10px; min-height: 72px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text-muted); transition: background var(--dx-dur), border-color var(--dx-dur), color var(--dx-dur); }
    .qs button ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
    .qs button:hover { background: var(--dx-surface-active); color: var(--dx-text); }
    .qs button.sel { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.35); }
    .qs button.sel ha-icon { color: var(--dx-accent); }
    .runbar { display: flex; gap: 8px; align-items: center; }
    .runbar .btn.primary { flex: 1; }
  `];

  static override properties = { roomOrder: { attribute: false }, api: { attribute: false }, _sel: { state: true } };

  declare roomOrder: readonly RoomInfo[];
  declare api?: DxApi;
  declare private _sel: Set<number>;

  constructor() { super(); this.roomOrder = []; this._sel = new Set(); }

  get selection(): ReadonlySet<number> { return this._sel; }

  private run(): void {
    const segments = segmentsOf(this._sel, this.roomOrder);
    if (!segments.length) return;
    askConfirm(this, confirmText(this._sel, this.roomOrder), () => {
      void this.api?.startRooms(segments).then(() => emit(this, EVENTS.toast, t('rooms.started', { what: selectionLabel(this._sel, this.roomOrder) })), (e: unknown) => emit(this, EVENTS.toast, t('rooms.failed', { error: String((e as Error)?.message ?? e) })));
      this._sel = new Set();
    });
  }

  override render(): TemplateResult {
    const sel = this._sel, order = this.roomOrder;
    return html`
      <div class="hd"><h2><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t('quickstart.title')}</h2><span class="r">${sel.size ? t('quickstart.selected', { n: sel.size }) : t('quickstart.multi')}</span></div>
      <div class="qs">
        <button class=${sel.size && sel.size === order.length ? 'sel' : ''} data-room="all" @click=${() => { this._sel = toggleAll(this._sel, order); }}><ha-icon icon="mdi:home-outline"></ha-icon>${t('quickstart.all')}</button>
        ${order.map((r) => html`<button class=${sel.has(r.id) ? 'sel' : ''} data-room=${r.id} @click=${() => { this._sel = toggleRoom(this._sel, r.id); }}><ha-icon icon=${r.icon}></ha-icon>${r.short}</button>`)}
      </div>
      ${sel.size
        ? html`<div class="runbar"><button class="btn primary" @click=${this.run}><ha-icon icon="mdi:play"></ha-icon>${t('rooms.run', { sel: selectionLabel(sel, order) })}</button><button class="btn icon" aria-label=${t('rooms.clear')} title=${t('rooms.clear')} @click=${() => { this._sel = new Set(); }}><ha-icon icon="mdi:close"></ha-icon></button></div>`
        : html`<div class="hint">${t('quickstart.hint', { name: deviceName() || t('quickstart.robotFallback') })}</div>`}
    `;
  }
}

if (!customElements.get(QUICKSTART_ELEMENT)) customElements.define(QUICKSTART_ELEMENT, DxQuickstart);
