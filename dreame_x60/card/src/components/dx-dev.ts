// dx-dev – Seite „Dev“ (Bauplan F.2b, PD-018, Mockup dev.html): Zustand des Diagnose-Protokolls, Starts des Tages mit Quelle,
// Tickets (Zähler + Liste), Regelübersicht der Auswertung, Zeitleiste live. Nur für Admin-Benutzer (die Shell zeigt die Seite sonst nicht).
// Daten kommen über Dienste mit Antwort (DxApi.diagTail/tickets/diagStatus) – keine Entitäten, kein eigener Zustand in HA.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { DxApi } from '../ha/api';
import { TICKET_OFFEN, quelleText, starts, zeigbar, zeilenGruppe, zeilenText } from '../domain/diag';
import type { DiagZeile, TicketKurz, TicketZaehler, ZeilenFilter } from '../domain/diag';
import { t, tx } from '../i18n/t';
import { EVENTS, emit } from '../shared/overlay';
import type { Overlay } from '../shared/overlay';
import { controls } from '../styles/controls';

export const DEV_ELEMENT = 'dx-dev';
/** Zeilen je Abruf und Takt des Live-Abrufs (ms). */
export const DEV_TAIL = 200;
export const DEV_LIVE_MS = 10_000;

const FILTER: readonly ZeilenFilter[] = ['all', 'robot', 'call', 'auto', 'card', 'report'];
const TFILTER = ['offen', 'geloest', 'alle'] as const;
type TicketFilter = (typeof TFILTER)[number];
const SRC_CLASS = (z: DiagZeile): string => (z.art === 'anzeige' ? 'card' : z.art === 'meldung' ? 'rep' : z.quelle === 'benutzer' ? 'user' : z.quelle === 'automation' ? 'auto' : z.quelle === 'extern' ? 'ext' : 'sys');
const STATUS_CHIP: Record<string, string> = { neu: 'warn', angenommen: 'acc', in_arbeit: 'acc', geloest: 'on', geschlossen: 'on', verworfen: 'dim' };
/** Eindeutiger Schlüssel einer Zeile (Zeitstempel in Millisekunden + Art + Gegenstand). */
const zeilenKey = (z: DiagZeile): string => z.ts + z.art + (z.ent ?? z.dienst ?? z.client ?? '');
const heute = (): string => { const d = new Date(); const p = (n: number): string => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

export class DxDev extends LitElement {
  static override styles = [controls, css`
    :host { display: block; min-width: 0; }
    .grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--dx-space-4); }
    .b { background: var(--dx-surface); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-lg); padding: var(--dx-space-4); min-width: 0; display: flex; flex-direction: column; gap: var(--dx-space-3); }
    .c4 { grid-column: span 4; } .c12 { grid-column: span 12; }
    .lbl { display: flex; align-items: center; gap: 8px; } .lbl .r { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--dx-text-faint); }
    .live i { animation: pulse 1.6s var(--dx-ease) infinite; } @keyframes pulse { 50% { opacity: 0.35; } }
    .kv3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .kv3 div { background: var(--dx-surface-raised); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 8px 10px; }
    .kv3 b { display: block; font-size: 22px; font-weight: 600; line-height: 1.1; } .kv3 span { font-size: 11px; color: var(--dx-text-muted); }
    .flow { font-size: 11px; color: var(--dx-text-faint); }
    .row.link { cursor: pointer; } .row.link:hover .t { color: var(--dx-accent); }
    .row .s.wrap { white-space: normal; }
    .sev { width: 10px; height: 10px; border-radius: 50%; flex: none; background: var(--dx-accent); }
    .sev.fehler { background: var(--dx-danger); } .sev.hinweis { background: var(--dx-warning); }
    .row .sev + div { flex: 1; min-width: 0; }
    .nr { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--dx-accent); margin-right: 4px; }
    .seg2 { display: inline-flex; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 3px; gap: 2px; max-width: 100%; flex-wrap: wrap; }
    .seg2 button { height: 34px; padding: 0 12px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--dx-text-muted); white-space: nowrap; background: none; border: 0; cursor: pointer; }
    .seg2 button[aria-pressed='true'] { background: var(--dx-surface-active); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.5); }
    .tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .search { height: 40px; min-width: 160px; flex: 1; padding: 0 12px; border-radius: var(--dx-radius-md); background: var(--dx-bg); border: 1px solid var(--dx-border); color: var(--dx-text); font: inherit; }
    .btn.live[aria-pressed='true'] { border-color: rgba(57, 217, 138, 0.45); color: var(--dx-positive); }
    .tl { display: grid; font-variant-numeric: tabular-nums; }
    .ev { display: grid; grid-template-columns: 92px 170px minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 7px 8px; border-top: 1px solid var(--dx-border); border-radius: 6px; cursor: pointer; }
    .ev:hover { background: var(--dx-surface-raised); }
    .ev .ts { color: var(--dx-text-muted); font-size: 12px; } .ev .src { font-size: 11px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .src.user { color: var(--dx-accent); } .src.auto { color: var(--dx-positive); } .src.ext { color: var(--dx-warning); } .src.sys, .src.card { color: var(--dx-text-muted); }
    .ev .tx { font-size: 13px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ev .tx .k { color: var(--dx-text-muted); }
    .ev.open .tx { white-space: normal; } .ev.card .tx { color: var(--dx-text-muted); } .ev.card .tx b { color: var(--dx-text); }
    .ev .more { grid-column: 2 / -1; font-family: ui-monospace, Consolas, monospace; font-size: 11px; color: var(--dx-text-muted); background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-sm); padding: 8px; white-space: pre-wrap; word-break: break-all; }
    .ev.rep { background: var(--dx-warning-soft); border: 1px solid rgba(242, 181, 68, 0.5); margin: 4px 0; } .ev.rep .src, .ev.rep .tx b { color: var(--dx-warning); }
    .ev.flash { animation: flash 1.2s var(--dx-ease); } @keyframes flash { from { background: var(--dx-accent-soft); } }
    details { border-top: 1px solid var(--dx-border); padding-top: 10px; font-size: 12px; color: var(--dx-text-muted); }
    summary { cursor: pointer; font-weight: 600; color: var(--dx-text); min-height: 32px; display: flex; align-items: center; }
    .rgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 8px; }
    .rgrid b { color: var(--dx-text); } .rgrid ul { margin: 6px 0 0; padding-left: 18px; display: grid; gap: 4px; line-height: 1.4; }
    .err { color: var(--dx-danger); font-size: 13px; }
    @container content (max-width: 760px) {
      .c4 { grid-column: span 12; }
      .ev { grid-template-columns: 62px minmax(0, 1fr); row-gap: 2px; }
      .ev .src { grid-column: 2; grid-row: 1; } .ev .tx { grid-column: 2; white-space: normal; } .ev .more { grid-column: 1 / -1; }
      .row.find { flex-wrap: wrap; }
    }
  `];

  static override properties = {
    api: { attribute: false },
    _zeilen: { state: true }, _aelter: { state: true }, _tickets: { state: true }, _zaehler: { state: true }, _status: { state: true },
    _filter: { state: true }, _tfilter: { state: true }, _suche: { state: true }, _live: { state: true }, _offen: { state: true }, _fehler: { state: true }, _geladen: { state: true },
  };

  declare api?: DxApi;
  declare private _zeilen: DiagZeile[];
  declare private _aelter: boolean;
  declare private _tickets: TicketKurz[];
  declare private _zaehler: TicketZaehler;
  declare private _status: { bytes: number; zeilen: number };
  declare private _filter: ZeilenFilter;
  declare private _tfilter: TicketFilter;
  declare private _suche: string;
  declare private _live: boolean;
  declare private _offen: string;
  declare private _fehler: string;
  declare private _geladen: number;
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this._zeilen = []; this._aelter = false; this._tickets = []; this._zaehler = { neu: 0, in_arbeit: 0, geloest: 0 };
    this._status = { bytes: 0, zeilen: 0 }; this._filter = 'all'; this._tfilter = 'offen'; this._suche = ''; this._live = true; this._offen = ''; this._fehler = ''; this._geladen = 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
    this._timer = setInterval(() => { if (this._live) void this.load(); }, DEV_LIVE_MS);
  }

  override disconnectedCallback(): void {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    super.disconnectedCallback();
  }

  /** Alles neu holen (Zeitleiste, Tickets, Dateigrößen). Bereits nachgeladene ältere Zeilen bleiben erhalten. */
  async load(): Promise<void> {
    const api = this.api;
    if (!api) return;
    try {
      const [tail, tk, st] = await Promise.all([api.diagTail(DEV_TAIL), api.tickets('alle'), api.diagStatus()]);
      const first = tail.zeilen[0]?.ts ?? '';
      const alt = this._zeilen.filter((z) => z.ts < first);
      this._zeilen = [...alt, ...tail.zeilen];
      if (!alt.length) this._aelter = tail.aelter;
      this._tickets = tk.tickets; this._zaehler = tk.zaehler;
      const tag = heute();
      this._status = { bytes: st.dateien.find((d) => d.datei === `heidi_diag-${tag}.jsonl`)?.bytes ?? 0, zeilen: st.dateien.find((d) => d.zeilen_heute !== undefined)?.zeilen_heute ?? 0 };
      this._fehler = ''; this._geladen = Date.now();
    } catch (e) {
      this._fehler = e instanceof Error ? e.message : String(e);
    }
  }

  private async older(): Promise<void> {
    const api = this.api, first = this._zeilen[0]?.ts;
    if (!api || !first) return;
    try {
      const r = await api.diagTail(DEV_TAIL, first);
      const da = new Set(this._zeilen.map(zeilenKey));
      this._zeilen = [...r.zeilen.filter((z) => !da.has(zeilenKey(z))), ...this._zeilen]; this._aelter = r.aelter;
    } catch (e) { this._fehler = e instanceof Error ? e.message : String(e); }
  }

  /** Zur Zeile mit diesem Zeitstempel (oder der nächsten danach) springen und sie kurz hervorheben. */
  private jump(ts: string): void {
    this._filter = 'all'; this._suche = '';
    void this.updateComplete.then(() => {
      const rows = [...(this.renderRoot.querySelectorAll<HTMLElement>('.ev') ?? [])];
      const el = rows.reverse().find((r) => (r.dataset.ts ?? '') >= ts.slice(0, 19)) ?? rows[0];
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    });
  }

  private openTicket(nr: string): void { emit<Overlay>(this, EVENTS.openOverlay, { kind: 'ticket', nr }); }

  private sichtbar(): DiagZeile[] {
    const q = this._suche.trim().toLowerCase();
    return this._zeilen.filter((z) => zeigbar(z) && (this._filter === 'all' || zeilenGruppe(z) === this._filter)
      && (!q || JSON.stringify(z).toLowerCase().includes(q))).reverse();
  }

  override render(): TemplateResult {
    const tag = heute();
    const st = starts(this._zeilen, tag);
    const last = this._zeilen.at(-1);
    const sek = last ? Math.max(0, Math.round((Date.now() - Date.parse(last.ts)) / 1000)) : null;
    const tks = this._tickets.filter((k) => this._tfilter === 'alle' || (this._tfilter === 'offen') === TICKET_OFFEN.includes(k.status));
    const rows = this.sichtbar();
    return html`
      <div class="grid">
        <section class="b c4" data-tile="log">
          <div class="lbl">${t('dev.log.title')}</div>
          ${this._fehler ? html`<div class="err" role="alert">${t('dev.log.error', { text: this._fehler })}</div>`
            : html`<div class="st good ${this._live ? 'live' : ''}"><i></i>${sek === null ? t('dev.log.empty') : t('dev.log.running', { sek })}</div>`}
          <div class="kv"><span class="v">${this._status.zeilen}</span><span class="u">${t('dev.log.lines', { kb: Math.round(this._status.bytes / 1024) })}</span></div>
          <div class="chips"><span class="chip on">${t('dev.log.l1')}</span><span class="chip on">${t('dev.log.l2')}</span><span class="chip on">${t('dev.log.l3')}</span></div>
          <div class="hint">${t('dev.log.keep')}</div>
        </section>

        <section class="b c4" data-tile="starts">
          <div class="lbl">${t('dev.starts.title')} <span class="r">${st.length}</span></div>
          <div class="list">${st.length ? [...st].reverse().map((s) => html`
            <div class="row link" data-start=${s.ts} @click=${() => this.jump(s.ts)}>
              <div><div class="t">${t('dev.starts.row', { zeit: s.ts.slice(11, 16) })}</div><div class="s">${s.dienst || t('dev.starts.noCall')}</div></div>
              <span class="chip ${s.quelle === 'benutzer' ? 'acc' : s.quelle === 'automation' ? 'on' : 'warn'}">${s.quelle === 'extern' ? t('dev.src.extern') : s.wer || tx(`dev.quelle.${s.quelle}`)}</span>
            </div>`) : html`<div class="hint">${t('dev.starts.none')}</div>`}</div>
          <div class="hint">${t('dev.starts.hint')}</div>
        </section>

        <section class="b c4" data-tile="counts">
          <div class="lbl">${t('dev.tickets.title')}</div>
          <div class="kv3"><div><b data-count="neu">${this._zaehler.neu}</b><span>${t('dev.tickets.new')}</span></div><div><b>${this._zaehler.in_arbeit}</b><span>${t('dev.tickets.working')}</span></div><div><b>${this._zaehler.geloest}</b><span>${t('dev.tickets.solved')}</span></div></div>
          <div class="flow">${t('dev.tickets.flow')}</div>
          <div class="hint">${t('dev.tickets.hint')}</div>
        </section>

        <section class="b c12" data-tile="tickets">
          <div class="lbl">${t('dev.tickets.title')}
            <span class="seg2" role="group">${TFILTER.map((f) => html`<button data-tf=${f} aria-pressed=${this._tfilter === f ? 'true' : 'false'} @click=${() => { this._tfilter = f; }}>${tx(`dev.tfilter.${f}`)}</button>`)}</span>
          </div>
          <div class="list">${tks.length ? tks.map((k) => html`
            <div class="row link find" data-ticket=${k.nr} @click=${() => this.jump(k.zuletzt)}>
              <span class="sev ${k.schwere}"></span>
              <div><div class="t"><span class="nr">${k.nr}</span>${k.titel}</div>
                <div class="s wrap">${k.quelle === 'meldung' ? t('dev.tickets.fromReport') : t('dev.tickets.fromRule', { regel: k.regel })} · ${t('dev.tickets.count', { n: k.anzahl, zeit: k.zuletzt.slice(0, 16).replace('T', ' ') })}${k.wieder ? ' · ' + t('dev.tickets.again', { n: k.wieder }) : ''}${k.dx ? ' · ' + k.dx : ''}</div></div>
              <span class="chip ${STATUS_CHIP[k.status] ?? ''}">${tx(`dev.status.${k.status}`)}</span>
              <button class="btn sm" data-open=${k.nr} @click=${(e: Event) => { e.stopPropagation(); this.openTicket(k.nr); }}>${t('common.open')}</button>
            </div>`) : html`<div class="hint">${t('dev.tickets.none')}</div>`}</div>
          <details>
            <summary>${t('dev.rules.title')}</summary>
            <div class="rgrid">${(['a', 'b', 't'] as const).map((g) => html`<div><b>${tx(`dev.rules.${g}.title`)}</b><ul>${tx(`dev.rules.${g}.items`).split('|').map((r) => html`<li>${r}</li>`)}</ul></div>`)}</div>
            <div class="hint">${t('dev.rules.app')}</div>
          </details>
        </section>

        <section class="b c12" data-tile="timeline">
          <div class="lbl">${t('dev.tl.title')} <span class="r">${t('dev.tl.sub', { n: rows.length })}</span></div>
          <div class="tools">
            <span class="seg2" role="group">${FILTER.map((f) => html`<button data-f=${f} aria-pressed=${this._filter === f ? 'true' : 'false'} @click=${() => { this._filter = f; }}>${tx(`dev.filter.${f}`)}</button>`)}</span>
            <input class="search" type="search" .value=${this._suche} placeholder=${t('dev.tl.search')} aria-label=${t('dev.tl.search')} @input=${(e: Event) => { this._suche = (e.target as HTMLInputElement).value; }}>
            <button class="btn sm live" data-live aria-pressed=${this._live ? 'true' : 'false'} @click=${() => { this._live = !this._live; if (this._live) void this.load(); }}><ha-icon icon="mdi:access-point"></ha-icon>${t('dev.tl.live')}</button>
          </div>
          <div class="tl">${rows.map((z) => { const x = zeilenText(z); const key = zeilenKey(z); const open = this._offen === key; return html`
            <div class="ev ${SRC_CLASS(z)} ${open ? 'open' : ''}" data-ts=${z.ts.slice(0, 19)} data-k=${zeilenGruppe(z)} @click=${() => { this._offen = open ? '' : key; }}>
              <span class="ts">${z.ts.slice(11, 23)}</span><span class="src ${SRC_CLASS(z)}">${quelleText(z)}</span>
              <span class="tx"><b>${x.haupt}</b> <span class="k">${x.rest}</span></span>
              ${open ? html`<div class="more">${JSON.stringify(z)}</div>` : nothing}
            </div>`; })}</div>
          <div class="tools">${this._aelter ? html`<button class="btn sm" data-older @click=${() => void this.older()}>${t('dev.tl.older')}</button>` : nothing}<span class="hint">${t('dev.tl.hint', { n: DEV_TAIL })}</span></div>
        </section>
      </div>`;
  }
}

if (!customElements.get(DEV_ELEMENT)) customElements.define(DEV_ELEMENT, DxDev);
