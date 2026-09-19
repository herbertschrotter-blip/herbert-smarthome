// dx-auftrag – Kachel „Aktueller Auftrag“ in der rechten Spalte der Übersicht, nur im Lauf (Bauplan 4.1, PD-007):
// Route in Laufreihenfolge mit aktuellem Raum, Minuten · Fläche, Räume x / n mit Balken, nächster Raum mit Modus.
// Alles aus readRobot/readAllRoomValues (Attribute von vacuum.heidi); keine eigene Fachlogik außer domain/strip.runOrder.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { RobotView, AllRoomValuesView } from '../ha/selectors';
import type { DotLevel } from '../domain/status';
import { runOrder } from '../domain/strip';
import { wirksameWerte } from '../domain/raumwerte';
import { roomById } from '../domain/rooms';
import type { RoomInfo } from '../domain/rooms';
import { t } from '../i18n/t';
import { controls } from '../styles/controls';

export const AUFTRAG_ELEMENT = 'dx-auftrag';
const DOT_CLASS: Record<DotLevel, string> = { accent: 'acc', warning: 'warn', danger: 'bad', positive: 'good' };

export class DxAuftrag extends LitElement {
  static override styles = [controls, css`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .route { text-transform: none; letter-spacing: 0; font-size: 13px; }
    .route b { color: var(--dx-text); }
    .kv { margin-top: 6px; }
    .meter.two { grid-template-columns: 1fr auto; margin-bottom: 6px; }
    .row.next { border-top: 1px solid var(--dx-border); }
  `];

  static override properties = { robot: { attribute: false }, rooms: { attribute: false }, roomOrder: { attribute: false } };

  declare robot?: RobotView;
  declare rooms?: AllRoomValuesView;
  /** Räume des Roboters (Profil) für Namen */
  declare roomOrder: readonly RoomInfo[];

  override render(): TemplateResult {
    const r = this.robot;
    if (!r || !['cleaning', 'paused'].includes(r.vac) || r.docked) return html``; // wie der Streifen: nur cleaning/paused unterwegs, nicht returning, nicht Mopp-Wäsche in der Station
    const { order, idx, rest } = runOrder(r);
    const total = order.length;
    // Fläche 0 im Lauf = auf dem Weg zum Startpunkt (wie der Streifen): noch kein Raum fertig, Ziel ist der erste Raum
    const startpunkt = r.vac === 'cleaning' && r.cleanedArea === 0;
    const cur = startpunkt ? -1 : idx;
    const done = startpunkt || idx < 0 ? 0 : idx;
    // Balken (PD-016): Prozent vom Roboter, solange der Sensor im Lauf verfügbar ist; sonst Raumzählung (springt je Raum)
    const pct = r.progress !== null ? Math.round(r.progress) : total ? Math.round((done / total) * 100) : 0;
    const nextId = startpunkt ? order[0] : rest[0];
    const rl = this.roomOrder ?? [];
    const next = nextId !== undefined ? roomById(rl, nextId) : undefined;
    const nextVals = next && this.rooms ? wirksameWerte(this.rooms, next.id) : null;
    const short = (id: number): string => roomById(rl, id)?.short ?? String(id);
    const dash = t('common.dash');
    return html`
      <div class="hd"><h2>${t('auftrag.title')}</h2><span class="st pill ${DOT_CLASS[r.hero.dot]}"><i></i>${r.hero.big}</span></div>
      <div>
        <div class="lbl route">${total ? order.map((id, i) => html`${i ? ' → ' : ''}${i === cur ? html`<b>${short(id)}</b>` : short(id)}`) : (r.room !== dash ? html`<b>${r.room}</b>` : t('auftrag.noRooms'))}</div>
        <div class="kv"><span class="v">${r.cleaningTime}<span class="u"> ${t('unit.min')}</span></span><span class="u">· ${r.cleanedArea} ${t('unit.m2')}</span></div>
      </div>
      ${total || r.progress !== null ? html`<div>${total ? html`<div class="meter two"><span class="n">${t('auftrag.rooms')}</span><span class="p">${done} / ${total}</span></div>` : nothing}<div class="bar" data-pct=${pct} data-src=${r.progress !== null ? 'robot' : 'rooms'} style="--p:${pct}"><i></i></div></div>` : nothing}
      ${next
        ? html`<div class="row next"><div><div class="s">${startpunkt ? t('auftrag.first') : t('auftrag.next')}</div><div class="t">${next.short}</div></div>${nextVals ? html`<span class="tag">${nextVals.modus}</span>` : nothing}</div>`
        : (total ? html`<div class="row next"><div><div class="s">${t('auftrag.last')}</div><div class="t">${cur >= 0 ? short(order[cur]!) : dash}</div></div></div>` : nothing)}
    `;
  }
}

if (!customElements.get(AUFTRAG_ELEMENT)) customElements.define(AUFTRAG_ELEMENT, DxAuftrag);
