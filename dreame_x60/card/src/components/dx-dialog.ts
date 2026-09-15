// dx-dialog – Rahmen für Dialoge (Bauplan 4.2, Mockup bento.html): Varianten `modal` (mittig, 640 px, `wide` 900 px),
// `sheet` (unten angeschlagen) und `confirm` (Bestätigung mit zwei Knöpfen, Regel 13 statt window.confirm).
// Unter 640 px Breite wird `modal` automatisch zum Sheet; der Host ist position: fixed und damit sein eigener Container.
// Ereignisse: dx-close (Scrim, ✕, Escape, Abbrechen), dx-confirm (OK), dx-back (Zurück-Pfeil). Fokus wandert beim Öffnen
// in den Dialog, bleibt dort (Tab-Falle) und kehrt beim Schließen zum vorherigen Element zurück.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { EVENTS, emit } from '../shared/overlay';
import { controls } from '../styles/controls';

export const DIALOG_ELEMENT = 'dx-dialog';
export type DialogVariant = 'modal' | 'sheet' | 'confirm';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Aktives Element über Shadow-Grenzen hinweg. */
function deepActive(): Element | null {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

export class DxDialog extends LitElement {
  static override styles = [controls, css`
    :host { position: fixed; inset: 0; z-index: 30; display: block; container-type: inline-size; container-name: dialog; }
    .scrim { position: absolute; inset: 0; background: rgba(3, 6, 9, 0.62); animation: fade var(--dx-dur) both; }
    .dlg {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(640px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow: auto;
      background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-xl);
      padding: 18px 20px 20px; box-shadow: var(--dx-shadow-float); display: grid; gap: 14px; align-content: start; animation: fade var(--dx-dur) var(--dx-ease) both;
      outline: none;
    }
    .dlg.wide { width: min(900px, calc(100% - 32px)); }
    .dlg > h2 { font-size: 18px; display: flex; align-items: center; gap: 8px; position: sticky; top: -18px; background: var(--dx-bg-elevated); padding: 4px 0; z-index: 1; margin: 0; }
    .dlg > h2 .m { color: var(--dx-text-muted); font-weight: 500; font-size: 14px; }
    .dlg > h2 .close { margin-left: auto; }
    .iconbtn { width: 40px; height: 40px; border-radius: var(--dx-radius-md); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid transparent; flex: none; }
    .iconbtn:hover { background: var(--dx-surface-raised); color: var(--dx-text); }
    .body { display: grid; gap: 14px; min-width: 0; }
    .foot { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .foot.empty { display: none; }
    .alert {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(360px, calc(100% - 48px));
      background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-lg); box-shadow: var(--dx-shadow-float); overflow: hidden; animation: fade var(--dx-dur) var(--dx-ease) both;
      outline: none;
    }
    .alert .m { padding: 20px 18px 16px; font-weight: 600; font-size: 15px; text-align: center; }
    .alert .m small { display: block; font-weight: 400; color: var(--dx-text-muted); font-size: 13px; margin-top: 6px; }
    .alert .b { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--dx-border); }
    .alert .b button { height: 48px; font-weight: 600; color: var(--dx-text-muted); border-radius: 0; }
    .alert .b button:hover { background: var(--dx-surface-raised); }
    .alert .b button + button { border-left: 1px solid var(--dx-border); color: var(--dx-accent); }
    .alert .b button.danger { color: var(--dx-danger); }
    /* Sheet: erzwungen (variant="sheet") oder automatisch unter 640 px */
    .dlg.sheet, .alert.sheet { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); animation: up 220ms var(--dx-ease) both; }
    .dlg.sheet::before { content: ''; width: 38px; height: 4px; border-radius: 2px; background: var(--dx-border-strong); margin: -6px auto 0; }
    .alert.sheet { bottom: 16px; left: 16px; right: 16px; width: auto; border-radius: var(--dx-radius-lg); padding-bottom: 0; }
    @container dialog (max-width: 640px) {
      .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); animation: up 220ms var(--dx-ease) both; }
      .dlg::before { content: ''; width: 38px; height: 4px; border-radius: 2px; background: var(--dx-border-strong); margin: -6px auto 0; }
      .alert { top: auto; bottom: 16px; left: 16px; right: 16px; transform: none; width: auto; }
    }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
  `];

  static override properties = {
    variant: { type: String },
    heading: { type: String },
    sub: { type: String },
    text: { type: String },
    subText: { type: String, attribute: 'sub-text' },
    okLabel: { type: String, attribute: 'ok-label' },
    cancelLabel: { type: String, attribute: 'cancel-label' },
    danger: { type: Boolean },
    wide: { type: Boolean },
    back: { type: Boolean },
    _hasFoot: { state: true },
  };

  declare variant: DialogVariant;
  declare heading: string;
  declare sub: string;
  declare text: string;
  declare subText: string;
  declare okLabel: string;
  declare cancelLabel: string;
  declare danger: boolean;
  declare wide: boolean;
  declare back: boolean;
  declare private _hasFoot: boolean;

  private _prevFocus: Element | null = null;
  private readonly _onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') { e.stopPropagation(); this.close(); return; }
    if (e.key === 'Tab') this.trapTab(e);
  };

  constructor() {
    super();
    this.variant = 'modal';
    this.heading = '';
    this.sub = '';
    this.text = '';
    this.subText = '';
    this.okLabel = 'OK';
    this.cancelLabel = 'Abbrechen';
    this.danger = false;
    this.wide = false;
    this.back = false;
    this._hasFoot = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._prevFocus = deepActive();
    // Fuß schon vor dem ersten Rendern kennen, sonst ist er beim Setzen des Fokus noch ausgeblendet (slotchange kommt später)
    this._hasFoot = !!this.querySelector('[slot="foot"]');
    this.addEventListener('keydown', this._onKey);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('keydown', this._onKey);
    const p = this._prevFocus as HTMLElement | null;
    if (p && typeof p.focus === 'function' && p.isConnected) p.focus();
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    // Fokus in den Dialog: erstes bedienbare Element des Inhalts, sonst der Dialog selbst
    const first = this.focusables().find((el) => !el.classList.contains('close') && !el.classList.contains('backbtn')) ?? this.focusables()[0];
    (first ?? this.renderRoot.querySelector<HTMLElement>('[role]'))?.focus();
  }

  /** Bedienbare Elemente in Dokumentreihenfolge: Kopfzeile (Shadow), eingeschobener Inhalt (Light DOM), Bestätigungsknöpfe. */
  private focusables(): HTMLElement[] {
    const root = this.renderRoot as ShadowRoot;
    const head = [...root.querySelectorAll<HTMLElement>('h2 ' + FOCUSABLE.replace(/, /g, ', h2 '))];
    const body = [...this.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const alert = [...root.querySelectorAll<HTMLElement>('.alert ' + FOCUSABLE.replace(/, /g, ', .alert '))];
    return [...head, ...body, ...alert].filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
  }

  private trapTab(e: KeyboardEvent): void {
    const els = this.focusables();
    if (!els.length) { e.preventDefault(); return; }
    const cur = deepActive();
    const idx = els.findIndex((el) => el === cur);
    let next = e.shiftKey ? idx - 1 : idx + 1;
    if (idx === -1) next = e.shiftKey ? els.length - 1 : 0;
    if (next < 0) next = els.length - 1;
    if (next >= els.length) next = 0;
    e.preventDefault();
    els[next]!.focus();
  }

  close(): void { emit(this, EVENTS.close); }
  confirm(): void { emit(this, EVENTS.confirm); }
  goBack(): void { emit(this, EVENTS.back); }

  private onFootSlot(e: Event): void {
    this._hasFoot = (e.target as HTMLSlotElement).assignedElements().length > 0;
  }

  override render(): TemplateResult {
    const sheet = this.variant === 'sheet' ? 'sheet' : '';
    if (this.variant === 'confirm') {
      return html`<div class="scrim" @click=${this.close}></div>
        <div class="alert ${sheet}" role="alertdialog" aria-modal="true" aria-label=${this.text} tabindex="-1">
          <div class="m">${this.text}${this.subText ? html`<small>${this.subText}</small>` : nothing}</div>
          <div class="b"><button class="cancel" @click=${this.close}>${this.cancelLabel}</button><button class="ok ${this.danger ? 'danger' : ''}" @click=${this.confirm}>${this.okLabel}</button></div>
        </div>`;
    }
    return html`<div class="scrim" @click=${this.close}></div>
      <div class="dlg ${this.wide ? 'wide' : ''} ${sheet}" role="dialog" aria-modal="true" aria-labelledby="h" tabindex="-1">
        <h2 id="h">${this.back ? html`<button class="iconbtn backbtn" aria-label="Zurück" @click=${this.goBack}><ha-icon icon="mdi:chevron-left"></ha-icon></button>` : nothing}<span class="t">${this.heading}</span>${this.sub ? html`<span class="m">${this.sub}</span>` : nothing}<button class="iconbtn close" aria-label="Schließen" @click=${this.close}><ha-icon icon="mdi:close"></ha-icon></button></h2>
        <div class="body"><slot></slot></div>
        <div class="foot ${this._hasFoot ? '' : 'empty'}"><slot name="foot" @slotchange=${this.onFootSlot}></slot></div>
      </div>`;
  }
}

if (!customElements.get(DIALOG_ELEMENT)) customElements.define(DIALOG_ELEMENT, DxDialog);
