// dx-tip – Langtext beim Verweilen (PD-015): eigener kleiner Baustein statt HA-Tooltip (Regel 12). Zeigt `text` unter dem
// eingeschobenen Inhalt, solange die Maus darüber steht oder ein Element darin den Fokus hat. Am Handy gibt es keine Maus –
// dort öffnet das Antippen des Inhalts die Detailansicht mit demselben Text (Aufrufer). Reine Anzeige, keine Fachlogik.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';

export const TIP_ELEMENT = 'dx-tip';

export class DxTip extends LitElement {
  static override styles = css`
    :host { display: inline-block; position: relative; max-width: 100%; }
    .tip { position: absolute; left: 0; top: calc(100% + 6px); z-index: 5; width: max-content; max-width: min(280px, 80vw); padding: 8px 10px;
      border-radius: var(--dx-radius-sm); background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); color: var(--dx-text);
      font: 400 12px/1.4 var(--dx-font); white-space: normal; box-shadow: var(--dx-shadow-float); pointer-events: none; }
    .tip::before { content: ''; position: absolute; left: 14px; top: -11px; border: 5px solid transparent; border-bottom-color: var(--dx-border-strong); }
  `;

  static override properties = { text: { type: String }, _open: { state: true } };

  declare text: string;
  declare private _open: boolean;

  constructor() {
    super();
    this.text = '';
    this._open = false;
    this.addEventListener('mouseenter', () => { this._open = true; });
    this.addEventListener('mouseleave', () => { this._open = false; });
    this.addEventListener('focusin', () => { this._open = true; });
    this.addEventListener('focusout', () => { this._open = false; });
  }

  override render(): TemplateResult {
    return html`<slot></slot>${this._open && this.text ? html`<div class="tip" role="tooltip">${this.text}</div>` : nothing}`;
  }
}

if (!customElements.get(TIP_ELEMENT)) customElements.define(TIP_ELEMENT, DxTip);
