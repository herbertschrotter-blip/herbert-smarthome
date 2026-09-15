// dx-setup – Einrichtungsprüfung (PD-014): schmale Leiste über der Übersicht, nur sichtbar, wenn etwas nicht stimmt.
// Symbole je Prüfung (rot = Fehler, gelb = Hinweis), darunter Klartext je Befund mit Sprung zur Stelle: more-info-Dialog
// einer Entität, HA-Seite (Integration, Reparaturen) oder Seite der Karte. Reine Anzeige; die Prüfungen kommen als Liste.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { SetupCheck, SetupAction } from '../domain/setup';
import { setupProblems } from '../domain/setup';
import { EVENTS, emit, moreInfo } from '../shared/overlay';
import { navigateHa } from '../shared/navigate';
import { controls } from '../styles/controls';

export const SETUP_ELEMENT = 'dx-setup';

export class DxSetup extends LitElement {
  static override styles = [controls, css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    .bar { display: flex; flex-direction: column; gap: 10px; padding: 12px 16px; border: 1px solid var(--dx-border); border-left: 4px solid var(--dx-danger); border-radius: var(--dx-radius-md); background: var(--dx-surface); }
    .bar.warn { border-left-color: var(--dx-warning, #f0b35a); }
    .icons { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .icons .t { font-size: 13px; color: var(--dx-text-muted); margin-right: 4px; }
    .icons .sum { margin-left: auto; font-size: 13px; color: var(--dx-text-muted); }
    .ic { width: 32px; height: 32px; border-radius: 50%; display: inline-grid; place-items: center; border: 1px solid var(--dx-border); background: var(--dx-surface-raised); color: var(--dx-text-muted); }
    .ic ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; }
    .ic.error { background: color-mix(in srgb, var(--dx-danger) 22%, transparent); color: var(--dx-danger); border-color: var(--dx-danger); cursor: pointer; }
    .ic.warn { background: color-mix(in srgb, var(--dx-warning, #f0b35a) 22%, transparent); color: var(--dx-warning, #f0b35a); border-color: var(--dx-warning, #f0b35a); cursor: pointer; }
    .ic.ok { opacity: 0.55; }
    .rows { display: flex; flex-direction: column; gap: 8px; }
    .row { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; }
    .row .tx { font-size: 13px; line-height: 1.4; }
    .row .tx b { display: block; font-weight: 600; }
    .row .hint { font-size: 12px; color: var(--dx-text-muted); }
    @container content (max-width: 640px) { .row { grid-template-columns: auto 1fr; } .row .btn { grid-column: 2; justify-self: start; } }
  `];

  static override properties = { checks: { attribute: false } };
  declare checks: readonly SetupCheck[];

  constructor() { super(); this.checks = []; }

  private go(a: SetupAction | undefined): void {
    if (!a) return;
    if (a.kind === 'more-info') moreInfo(this, a.entity);
    else if (a.kind === 'page') emit(this, EVENTS.navigate, { page: a.page });
    else navigateHa(a.path);
  }

  override render(): TemplateResult {
    const problems = setupProblems(this.checks);
    if (!problems.length) return html``;
    const errors = problems.filter((p) => p.level === 'error').length, warns = problems.length - errors;
    const sum = [errors ? `${errors} ${errors === 1 ? 'Problem' : 'Probleme'}` : '', warns ? `${warns} ${warns === 1 ? 'Hinweis' : 'Hinweise'}` : ''].filter(Boolean).join(', ');
    return html`
      <div class="bar ${errors ? 'error' : 'warn'}" role="status">
        <div class="icons">
          <span class="t">Einrichtung</span>
          ${this.checks.map((c) => html`<button class="ic ${c.level}" data-check=${c.key} title=${c.text} aria-label=${c.text} @click=${() => this.go(c.action)}><ha-icon icon=${c.icon}></ha-icon></button>`)}
          <span class="sum">${sum}</span>
        </div>
        <div class="rows">
          ${problems.map((p) => html`
            <div class="row" data-problem=${p.key}>
              <span class="ic ${p.level}"><ha-icon icon=${p.icon}></ha-icon></span>
              <div class="tx"><b>${p.label}</b>${p.text}${p.action?.kind === 'more-info' && p.action.hint ? html`<div class="hint">Dort: ${p.action.hint}</div>` : nothing}</div>
              ${p.action ? html`<button class="btn sm" data-go=${p.key} @click=${() => this.go(p.action)}><ha-icon icon="mdi:arrow-right"></ha-icon>Öffnen</button>` : nothing}
            </div>`)}
        </div>
      </div>`;
  }
}

if (!customElements.get(SETUP_ELEMENT)) customElements.define(SETUP_ELEMENT, DxSetup);
