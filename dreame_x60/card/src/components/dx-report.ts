// dx-report – Inhalt des Dialogs „Fehler melden“ (Bauplan F.2b, PD-018): Schnellwahl + Text → DxApi.reportProblem →
// HA-Ereignis dreame_x60_meldung → das Backend legt ein Ticket HT-NNNN an. Bleibt bei Fehlern offen (Regel 20).
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { DxApi } from '../ha/api';
import { t } from '../i18n/t';
import { EVENTS, emit } from '../shared/overlay';
import { controls } from '../styles/controls';

export const REPORT_ELEMENT = 'dx-report';
/** So lange nach dem Senden wartet die Karte, bis sie die Ticketnummer nachschlägt (ms). */
export const REPORT_LOOKUP_MS = 1500;

export class DxReport extends LitElement {
  static override styles = [controls, css`
    :host { display: grid; gap: var(--dx-space-3); }
    textarea { width: 100%; min-height: 96px; resize: vertical; padding: 10px 12px; border-radius: var(--dx-radius-md); background: var(--dx-bg); border: 1px solid var(--dx-border); color: var(--dx-text); font: inherit; box-sizing: border-box; }
    .chip { cursor: pointer; height: 32px; font-size: 12px; }
    .chip[aria-pressed='true'] { border-color: rgba(88, 183, 246, 0.5); background: var(--dx-accent-soft); color: var(--dx-accent); }
    .foot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
    .err { color: var(--dx-danger); font-size: 13px; }
  `];

  static override properties = { api: { attribute: false }, kontext: { attribute: false }, _text: { state: true }, _wahl: { state: true }, _fehler: { state: true }, _busy: { state: true } };

  declare api?: DxApi;
  /** Seite, Version, Fenster und Anzeige-Schnappschuss – kommt von der Shell */
  declare kontext: Record<string, unknown>;
  declare private _text: string;
  declare private _wahl: string[];
  declare private _fehler: string;
  declare private _busy: boolean;

  constructor() { super(); this.kontext = {}; this._text = ''; this._wahl = []; this._fehler = ''; this._busy = false; }

  private toggle(w: string): void { this._wahl = this._wahl.includes(w) ? this._wahl.filter((x) => x !== w) : [...this._wahl, w]; }

  private async send(): Promise<void> {
    const text = this._text.trim();
    if (!text && !this._wahl.length) { this._fehler = t('report.empty'); return; }
    this._busy = true; this._fehler = '';
    const ok = await (this.api?.reportProblem(text, this._wahl, this.kontext) ?? Promise.resolve(false));
    if (!ok) { this._busy = false; this._fehler = t('report.failed'); return; }
    // Ticketnummer nachschlagen (das Ticket entsteht im Backend, kurz nach dem Ereignis)
    await new Promise((r) => setTimeout(r, REPORT_LOOKUP_MS));
    let nr = '';
    try { nr = (await this.api!.tickets('offen')).tickets.find((k) => k.quelle === 'meldung')?.nr ?? ''; } catch { nr = ''; }
    emit(this, EVENTS.toast, nr ? t('report.sentNr', { nr }) : t('report.sent'));
    emit(this, EVENTS.close);
  }

  override render(): TemplateResult {
    return html`
      <div class="hint">${t('report.intro')}</div>
      <div class="chips">${t('report.quick').split('|').map((w) => html`<button class="chip" data-q aria-pressed=${this._wahl.includes(w) ? 'true' : 'false'} @click=${() => this.toggle(w)}>${w}</button>`)}</div>
      <textarea .value=${this._text} placeholder=${t('report.placeholder')} aria-label=${t('report.placeholder')} @input=${(e: Event) => { this._text = (e.target as HTMLTextAreaElement).value; }}></textarea>
      <div class="hint">${t('report.sends')}</div>
      ${this._fehler ? html`<div class="err" role="alert">${this._fehler}</div>` : nothing}
      <div class="foot">
        <button class="btn" data-cancel @click=${() => emit(this, EVENTS.close)}>${t('common.cancel')}</button>
        <button class="btn primary" data-send ?disabled=${this._busy} @click=${() => void this.send()}>${t('report.send')}</button>
      </div>`;
  }
}

if (!customElements.get(REPORT_ELEMENT)) customElements.define(REPORT_ELEMENT, DxReport);
