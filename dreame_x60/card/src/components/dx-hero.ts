// dx-hero – Roboter-Panel der Übersicht (Bauplan 4.1, Mockup bento.html): Name, Status, Station, Roboter-Bild, Akku,
// Chips (Personen, Raum, Hinweis/Fehler, Nicht stören), drei Werte Modus/Saugleistung/Wasser, Knöpfe, Streifen im Lauf.
// Texte und Knöpfe kommen aus domain/status.ts (hero), der Streifen aus domain/strip.ts. Schreiben nur über api.vacuum.
// Bekommt memoisierte Sichten; bei gleicher Referenz rendert Lit nicht neu (Regel 10).
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { RobotView, AllRoomValuesView } from '../ha/selectors';
import type { DxApi } from '../ha/api';
import type { RoomId } from '../ha/contract';
import type { DotLevel } from '../domain/status';
import { stripModel } from '../domain/strip';
import type { StripModel } from '../domain/strip';
import { STATUS_DE } from '../config';
import { EVENTS, emit, moreInfo } from '../shared/overlay';
import type { Overlay } from '../shared/overlay';
import { robotSvg } from '../shared/robot-svg';
import { controls } from '../styles/controls';

export const HERO_ELEMENT = 'dx-hero';

/** Akku-Farbe: rot ab 20 % (v1), gelb ab 30 % (Mockup). */
const BATT_BAD_PCT = 20;
const BATT_WARN_PCT = 30;
const DOT_CLASS: Record<DotLevel, string> = { accent: 'acc', warning: 'warn', danger: 'bad', positive: 'good' };

export class DxHero extends LitElement {
  static override styles = [controls, css`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .robot { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: start; }
    .name { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
    .st.big { margin-top: 6px; text-align: left; }
    .sub { margin-top: 2px; }
    .station { text-align: right; font-size: 13px; }
    .robotpic { grid-column: 1; width: 100%; height: auto; max-width: 230px; aspect-ratio: 1; justify-self: center; }
    .batt { grid-column: 2; grid-row: 2; align-self: center; display: grid; gap: 4px; justify-items: start; text-align: left; }
    .battbar { width: 18px; height: 34px; border: 2px solid var(--dx-text-muted); border-radius: 4px; position: relative; padding: 2px; margin-top: 4px; }
    .battbar::before { content: ''; position: absolute; top: -5px; left: 5px; width: 6px; height: 3px; border-radius: 1px; background: var(--dx-text-muted); }
    .battbar i { display: block; position: absolute; left: 2px; right: 2px; bottom: 2px; background: var(--dx-positive); border-radius: 2px; height: calc(var(--p) * 1%); }
    .battbar.warn i { background: var(--dx-warning); } .battbar.bad i { background: var(--dx-danger); }
    .battrow { display: flex; align-items: center; gap: 6px; }
    .battrow .bolt { --mdc-icon-size: 16px; width: 16px; height: 16px; color: var(--dx-positive); margin-top: 4px; }
    .params { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .param { background: var(--dx-surface-raised); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 10px; display: grid; gap: 2px; min-height: 44px; text-align: left; }
    .param:hover { background: var(--dx-surface-active); }
    .param b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .param span { font-size: 11px; color: var(--dx-text-muted); }
    .param ha-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; color: var(--dx-text-muted); margin-bottom: 2px; }
    .ctl { display: flex; gap: 8px; }
    .ctl .btn { flex: 1 1 0; min-width: 0; padding: 0 8px; } /* alle Knöpfe gleich breit (Herbert, 15.09.) */
    .strip small { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 2px; }
    .strip .chip { gap: 4px; }
    .strip > ha-icon:last-child { margin-left: auto; color: var(--dx-text-muted); align-self: center; }
    @container content (max-width: 640px) { .robotpic { max-width: 170px; } }
  `];

  static override properties = { robot: { attribute: false }, rooms: { attribute: false }, api: { attribute: false } };

  declare robot?: RobotView;
  declare rooms?: AllRoomValuesView;
  declare api?: DxApi;

  private openRooms(): void { emit<Overlay>(this, EVENTS.openOverlay, { kind: 'rooms', mode: 'robot' }); }

  /** Streifen aus Roboterzustand und Raumwerten (reine Funktion, billig). */
  get strip(): StripModel | null {
    const r = this.robot, rooms = this.rooms;
    return r && rooms ? stripModel(r, (id: RoomId) => rooms.rooms[id]) : null;
  }

  /** Drei Werte: im Lauf die des aktuellen Raums, sonst der gemeinsame Wert aller Räume („–“ bei Abweichung oder unavailable). */
  private params(strip: StripModel | null): [string, string, string] {
    const rooms = this.rooms;
    const cur = strip && rooms ? rooms.rooms[strip.roomId] : null;
    if (cur) return [cur.modus, cur.saug, cur.modus !== 'Saugen' && cur.wasser ? cur.wasser : '–'];
    const vals = rooms ? Object.values(rooms.rooms).filter((v) => v !== null) : [];
    const common = (pick: (v: NonNullable<typeof vals[number]>) => string | null): string => {
      if (!vals.length) return '–';
      const first = pick(vals[0]!);
      return first !== null && vals.every((v) => pick(v) === first) ? first : '–';
    };
    return [common((v) => v.modus), common((v) => v.saug), common((v) => (v.modus !== 'Saugen' && v.wasser ? v.wasser : null))];
  }

  /** Stationszeile aus den Attributen docked/washing/drying/charging – nicht aus dem Hauptzustand (der bleibt bei der Mopp-Wäsche „cleaning“). */
  private stationText(r: RobotView): string {
    if (r.docked) return [r.washing ? 'Mopp-Wäsche' : r.drying ? 'trocknet' : 'angedockt', r.charging ? 'lädt' : null].filter(Boolean).join(' · ');
    if (r.running) return 'unterwegs';
    return STATUS_DE[r.vac] ?? r.vac;
  }

  override render(): TemplateResult {
    const r = this.robot;
    if (!r) return html``;
    const h = r.hero;
    const strip = this.strip;
    const [modus, saug, wasser] = this.params(strip);
    const battCls = r.battery <= BATT_BAD_PCT ? 'bad' : r.battery <= BATT_WARN_PCT ? 'warn' : '';
    return html`
      <div class="robot">
        <div>
          <div class="name">Heidi</div>
          <button class="st big ${DOT_CLASS[h.dot]}" title="Status" @click=${() => moreInfo(this, r.moreInfo.vac)}><i></i><span class="bigtext">${h.big}</span></button>
          ${h.sub ? html`<div class="hint sub">${h.sub}</div>` : nothing}
        </div>
        <div class="station"><div class="lbl">Station</div><div>${this.stationText(r)}</div></div>
        ${robotSvg}
        <button class="batt" title="Akku" @click=${() => moreInfo(this, r.moreInfo.battery)}>
          <div class="kv"><span class="v">${r.battery}<span class="u"> %</span></span></div><div class="lbl">Akku</div>
          <div class="battrow"><div class="battbar ${battCls}" style="--p:${r.battery}"><i></i></div>${r.charging ? html`<ha-icon class="bolt" icon="mdi:flash" title="lädt"></ha-icon>` : nothing}</div>
        </button>
      </div>
      <div class="chips">${r.persons.filter((p) => p.known).map((p) => html`<button class="chip ${p.home ? 'on' : ''} ${p.counts ? '' : 'dim'}" title="${p.home ? 'zu Hause' : 'abwesend'}${p.counts ? '' : ' · zählt nicht'}" @click=${() => moreInfo(this, p.id)}><ha-icon icon=${p.home ? 'mdi:account' : 'mdi:account-outline'}></ha-icon>${p.name}</button>`)}${h.roomChip ? html`<span class="chip on"><ha-icon icon="mdi:floor-plan"></ha-icon>${h.roomChip}</span>` : nothing}${h.errorChip ? html`<button class="chip ${h.errorChip.level === 'danger' ? 'bad' : 'warn'}" @click=${() => moreInfo(this, r.moreInfo.error)}><ha-icon icon=${h.errorChip.level === 'danger' ? 'mdi:alert' : 'mdi:information-outline'}></ha-icon>${h.errorChip.text}</button>` : nothing}<span class="chip" title="Nicht stören"><ha-icon icon="mdi:sleep"></ha-icon>${h.dnd}</span></div>
      <div class="params">
        <button class="param" title="Reinigungsmodus" @click=${this.openRooms}><ha-icon icon="mdi:broom"></ha-icon><b>${modus}</b><span>Modus</span></button>
        <button class="param" title="Saugleistung" @click=${this.openRooms}><ha-icon icon="mdi:fan"></ha-icon><b>${saug}</b><span>Saugstufe</span></button>
        <button class="param" title="Wassermenge" @click=${this.openRooms}><ha-icon icon="mdi:water"></ha-icon><b>${wasser}</b><span>Wasser</span></button>
      </div>
      <div class="ctl">${h.buttons.map((b) => html`<button class="btn ${b.primary ? 'primary' : ''}" data-svc=${b.service} @click=${() => this.api?.vacuum(b.service)}><ha-icon icon=${b.icon}></ha-icon>${b.label}</button>`)}</div>
      ${strip ? html`<button class="note strip" title="Räume einstellen" @click=${this.openRooms}><ha-icon icon=${strip.icon}></ha-icon><div><b>${strip.head}</b> <small>${strip.right}${strip.chips.length ? html` · ` : nothing}${strip.chips.map((c) => html`<span class="chip k">${c.icons.map((i) => html`<ha-icon icon=${i}></ha-icon>`)}${c.text}</span>`)}</small></div><ha-icon icon="mdi:chevron-right"></ha-icon></button>` : nothing}
    `;
  }
}

if (!customElements.get(HERO_ELEMENT)) customElements.define(HERO_ELEMENT, DxHero);
