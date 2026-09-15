// dx-auftrag – Kachel „Aktueller Auftrag“ in der rechten Spalte der Übersicht, nur im Lauf (Bauplan 4.1, PD-007):
// Route in Laufreihenfolge mit aktuellem Raum, Minuten · Fläche, Räume x / n mit Balken, nächster Raum mit Modus.
// Alles aus readRobot/readAllRoomValues (Attribute von vacuum.heidi); keine eigene Fachlogik außer domain/strip.runOrder.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { RobotView, AllRoomValuesView } from '../ha/selectors';
import type { DotLevel } from '../domain/status';
import { runOrder } from '../domain/strip';
import { roomById } from '../config';
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

  static override properties = { robot: { attribute: false }, rooms: { attribute: false } };

  declare robot?: RobotView;
  declare rooms?: AllRoomValuesView;

  override render(): TemplateResult {
    const r = this.robot;
    if (!r || !['cleaning', 'paused'].includes(r.vac)) return html``; // wie der Streifen: nur cleaning/paused, nicht returning
    const { order, idx, rest } = runOrder(r);
    const total = order.length;
    // Fläche 0 im Lauf = auf dem Weg zum Startpunkt (wie der Streifen): noch kein Raum fertig, Ziel ist der erste Raum
    const startpunkt = r.vac === 'cleaning' && r.cleanedArea === 0;
    const cur = startpunkt ? -1 : idx;
    const done = startpunkt || idx < 0 ? 0 : idx;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const nextId = startpunkt ? order[0] : rest[0];
    const next = nextId !== undefined ? roomById(nextId) : undefined;
    const nextVals = next && this.rooms ? this.rooms.rooms[next.id] : null;
    const short = (id: number): string => roomById(id)?.short ?? String(id);
    return html`
      <div class="hd"><h2>Aktueller Auftrag</h2><span class="st pill ${DOT_CLASS[r.hero.dot]}"><i></i>${r.hero.big}</span></div>
      <div>
        <div class="lbl route">${total ? order.map((id, i) => html`${i ? ' → ' : ''}${i === cur ? html`<b>${short(id)}</b>` : short(id)}`) : (r.room !== '–' ? html`<b>${r.room}</b>` : 'Räume –')}</div>
        <div class="kv"><span class="v">${r.cleaningTime}<span class="u"> min</span></span><span class="u">· ${r.cleanedArea} m²</span></div>
      </div>
      ${total ? html`<div><div class="meter two"><span class="n">Räume</span><span class="p">${done} / ${total}</span></div><div class="bar" style="--p:${pct}"><i></i></div></div>` : nothing}
      ${next
        ? html`<div class="row next"><div><div class="s">${startpunkt ? 'Erster Raum' : 'Nächster Raum'}</div><div class="t">${next.short}</div></div>${nextVals ? html`<span class="tag">${nextVals.modus}</span>` : nothing}</div>`
        : (total ? html`<div class="row next"><div><div class="s">Letzter Raum</div><div class="t">${cur >= 0 ? short(order[cur]!) : '–'}</div></div></div>` : nothing)}
    `;
  }
}

if (!customElements.get(AUFTRAG_ELEMENT)) customElements.define(AUFTRAG_ELEMENT, DxAuftrag);
