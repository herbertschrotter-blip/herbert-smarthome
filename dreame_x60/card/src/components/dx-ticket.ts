// dx-ticket – Ticket-Ansicht (Bauplan F.2b, PD-018): gesicherte Beweise als Text, Notiz, „Verwerfen – kein Fehler“, „Kopieren“.
// Statuswechsel der Bearbeitung (angenommen, in Arbeit, gelöst) macht Claude Code mit dem Skill ticket – nicht die Karte.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { DxApi } from '../ha/api';
import type { Ticket } from '../domain/diag';
import { t, tx } from '../i18n/t';
import { EVENTS, emit } from '../shared/overlay';
import { controls } from '../styles/controls';

export const TICKET_ELEMENT = 'dx-ticket';
const STATUS_CHIP: Record<string, string> = { neu: 'warn', angenommen: 'acc', in_arbeit: 'acc', geloest: 'on', geschlossen: 'on', verworfen: 'dim' };

export class DxTicket extends LitElement {
  static override styles = [controls, css`
    :host { display: grid; gap: var(--dx-space-3); min-width: 0; }
    h3 { margin: 0; font-size: 17px; line-height: 1.3; } .nr { color: var(--dx-accent); font-variant-numeric: tabular-nums; margin-right: 6px; }
    pre { font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; max-height: 380px; overflow: auto; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 12px; margin: 0; }
    textarea { width: 100%; min-height: 56px; resize: vertical; padding: 8px 12px; border-radius: var(--dx-radius-md); background: var(--dx-bg); border: 1px solid var(--dx-border); color: var(--dx-text); font: inherit; box-sizing: border-box; }
    .foot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; } .foot .btn:first-child { margin-right: auto; }
    .err { color: var(--dx-danger); font-size: 13px; }
    @container content (max-width: 640px) { .foot .btn { flex: 1 1 40%; margin-right: 0 !important; } pre { max-height: 280px; font-size: 10.5px; } }
  `];

  static override properties = { api: { attribute: false }, nr: { type: String }, _t: { state: true }, _text: { state: true }, _eingabe: { state: true }, _fehler: { state: true } };

  declare api?: DxApi;
  declare nr: string;
  declare private _t: Ticket | null;
  declare private _text: string;
  declare private _eingabe: string;
  declare private _fehler: string;

  constructor() { super(); this.nr = ''; this._t = null; this._text = ''; this._eingabe = ''; this._fehler = ''; }

  override connectedCallback(): void { super.connectedCallback(); void this.load(); }

  private async load(): Promise<void> {
    try { const r = await this.api!.ticket(this.nr); this._t = r.ticket; this._text = r.text; this._fehler = ''; } catch (e) { this._fehler = e instanceof Error ? e.message : String(e); }
  }

  private async act(fn: (api: DxApi, text: string) => Promise<unknown>, okText: string): Promise<void> {
    const text = this._eingabe.trim();
    if (!text) { this._fehler = t('ticket.needText'); return; }
    try { await fn(this.api!, text); this._eingabe = ''; emit(this, EVENTS.toast, okText); await this.load(); } catch (e) { this._fehler = e instanceof Error ? e.message : String(e); }
  }

  private async copy(): Promise<void> {
    try { await navigator.clipboard.writeText(this._text); emit(this, EVENTS.toast, t('ticket.copied', { nr: this.nr })); } catch { this._fehler = t('ticket.copyFailed'); }
  }

  override render(): TemplateResult {
    const k = this._t;
    if (!k) return html`${this._fehler ? html`<div class="err" role="alert">${this._fehler}</div>` : html`<div class="hint">${t('ticket.loading')}</div>`}`;
    const offen = ['neu', 'angenommen', 'in_arbeit'].includes(k.status);
    return html`
      <h3><span class="nr">${k.nr}</span>${k.titel}</h3>
      <div class="chips">
        <span class="chip ${STATUS_CHIP[k.status] ?? ''}" data-status>${tx(`dev.status.${k.status}`)}</span>
        <span class="chip">${k.quelle === 'meldung' ? t('dev.tickets.fromReport') : t('dev.tickets.fromRule', { regel: k.regel })}</span>
        <span class="chip">${t('dev.tickets.count', { n: k.anzahl, zeit: k.zuletzt.slice(0, 16).replace('T', ' ') })}</span>
        <span class="chip dim">${k.dx ? t('ticket.clickup', { dx: k.dx }) : t('ticket.noClickup')}</span>
      </div>
      <div class="hint">${t('ticket.intro', { nr: k.nr })}</div>
      <pre>${this._text}</pre>
      <textarea .value=${this._eingabe} placeholder=${t('ticket.input')} aria-label=${t('ticket.input')} @input=${(e: Event) => { this._eingabe = (e.target as HTMLTextAreaElement).value; }}></textarea>
      ${this._fehler ? html`<div class="err" role="alert">${this._fehler}</div>` : nothing}
      <div class="foot">
        ${offen ? html`<button class="btn" data-reject @click=${() => void this.act((a, x) => a.ticketVerwerfen(k.nr, x), t('ticket.rejected', { nr: k.nr }))}>${t('ticket.reject')}</button>` : html`<span></span>`}
        <button class="btn" data-note @click=${() => void this.act((a, x) => a.ticketNotiz(k.nr, x), t('ticket.noted'))}>${t('ticket.note')}</button>
        <button class="btn" data-copy @click=${() => void this.copy()}><ha-icon icon="mdi:content-copy"></ha-icon>${t('ticket.copy')}</button>
        <button class="btn primary" data-close @click=${() => emit(this, EVENTS.close)}>${t('common.close')}</button>
      </div>`;
  }
}

if (!customElements.get(TICKET_ELEMENT)) customElements.define(TICKET_ELEMENT, DxTicket);
