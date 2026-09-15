// dx-nav – Navigation der Karte (Bauplan 4.0, Mockup bento.html). Drei Formen nach Breite des Containers `app`
// (die Shell ist der Container): Seitenleiste > 1180 px, Symbolleiste 761–1180 px, Tab-Leiste ≤ 760 px.
// Sendet nur Ereignisse (dx-navigate, dx-open-overlay); kennt keine Entitäts-IDs.
import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { NAV } from '../config';
import type { NavEntry } from '../config';
import type { Page } from '../pages';
import { EVENTS, emit } from '../shared/overlay';
import type { Overlay } from '../shared/overlay';
import { robotSvg } from '../shared/robot-svg';
import { deviceName } from '../ha/device';

export const NAV_ELEMENT = 'dx-nav';
/** Höchstens so viele Einträge in der Tab-Leiste (Mockup). */
const TAB_MAX = 6;

export class DxNav extends LitElement {
  // Keine eigenen Tokens: die --dx-*-Variablen kommen von der Shell (auch :host(.light)).
  static override styles = [css`
    :host { display: contents; font-family: var(--dx-font); font-size: 14px; color: var(--dx-text); }
    button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    button:focus-visible { outline: 2px solid var(--dx-accent); outline-offset: 2px; }
    ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; display: inline-flex; flex: none; }

    /* Seitenleiste: Fläche füllt die Spalte, der Inhalt klebt unter HAs Kopfzeile */
    .side { grid-area: side; border-right: 1px solid var(--dx-border); background: var(--dx-bg-elevated); min-width: 0; }
    .inner { position: sticky; top: var(--header-height, 56px); box-sizing: border-box; min-height: calc(100vh - var(--header-height, 56px));
      display: flex; flex-direction: column; gap: var(--dx-space-5); padding: var(--dx-space-5) var(--dx-space-3); }
    .brand { display: flex; align-items: center; gap: 12px; padding: 0 8px; }
    .brand .logo { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--dx-accent); border-right-color: transparent; transform: rotate(-30deg); flex: none; }
    .brand .t { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
    .brand .s { font-size: 12px; color: var(--dx-text-muted); }
    .navlist { display: grid; gap: 4px; }
    .navlist button { display: flex; align-items: center; gap: 12px; height: var(--dx-touch); padding: 0 12px; border-radius: var(--dx-radius-md); border: 1px solid transparent;
      color: var(--dx-text-muted); font-size: 14px; font-weight: 500; text-align: left; white-space: nowrap; transition: background var(--dx-dur) var(--dx-ease), color var(--dx-dur); }
    .navlist button:hover { background: var(--dx-surface); color: var(--dx-text); }
    .navlist button[aria-current] { background: var(--dx-surface-active); color: var(--dx-text); border-color: rgba(88, 183, 246, 0.35); box-shadow: inset 3px 0 0 var(--dx-accent); }
    .foot { margin-top: auto; display: grid; justify-items: center; gap: 8px; color: var(--dx-text-muted); font-size: 12px; text-align: center; padding-bottom: 8px; }
    .foot .robotpic { width: 120px; height: 120px; }
    .foot .version { color: var(--dx-text-faint); font-size: 11px; font-variant-numeric: tabular-nums; }

    /* Tab-Leiste: nur schmal */
    .tabbar { display: none; }

    @container app (max-width: 1180px) {
      .inner { padding: 20px 10px; }
      .brand { justify-content: center; padding: 0; }
      .brand .t, .brand .s, .navlist button > span, .foot .robotpic, .foot .m, .foot .version { display: none; }
      .navlist button { justify-content: center; padding: 0; width: 52px; margin: 0 auto; }
      .navlist button[aria-current] { box-shadow: none; }
    }
    @container app (max-width: 760px) {
      .side { display: none; }
      .tabbar { grid-area: tab; display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); position: sticky; bottom: 0; z-index: 20;
        background: color-mix(in srgb, var(--dx-bg-elevated) 92%, transparent); backdrop-filter: blur(10px); border-top: 1px solid var(--dx-border);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); }
      .tabbar button { display: grid; justify-items: center; align-content: center; gap: 3px; height: 50px; border-radius: var(--dx-radius-sm); color: var(--dx-text-muted); font-size: 10px; font-weight: 500; }
      .tabbar button[aria-current] { color: var(--dx-accent); background: var(--dx-accent-soft); }
    }
    @media (hover: none) { .navlist button:hover { background: transparent; } }
  `];

  static override properties = {
    page: { type: String },
    prognoseAktiv: { type: Boolean, attribute: 'prognose-aktiv' },
    version: { type: String },
  };

  declare page: Page;
  declare prognoseAktiv: boolean;
  declare version: string;

  constructor() {
    super();
    this.page = 'start';
    this.prognoseAktiv = false;
    this.version = '';
  }

  /** Sichtbare Einträge: Prognose nur bei aktiver Prognose. */
  get entries(): NavEntry[] { return NAV.filter((e) => e.onlyWhen !== 'prognose' || this.prognoseAktiv); }

  private pick(e: NavEntry): void {
    if (e.overlay === 'rooms') emit<Overlay>(this, EVENTS.openOverlay, { kind: 'rooms', mode: 'robot' });
    else if (e.page) emit(this, EVENTS.navigate, { page: e.page });
  }

  private item(e: NavEntry): TemplateResult {
    const on = e.page !== undefined && e.page === this.page;
    return html`<button data-nav=${e.key} aria-current=${on ? 'page' : nothing} title=${e.label} aria-label=${e.label} @click=${() => this.pick(e)}>
      <ha-icon icon=${e.icon}></ha-icon><span>${e.label}</span></button>`;
  }

  override render(): TemplateResult {
    const es = this.entries;
    return html`
      <nav class="side" aria-label="Seitenleiste">
        <div class="inner">
          <div class="brand"><span class="logo"></span><div><div class="t">${deviceName() || 'Roboter'}</div><div class="s">Dein Saugroboter</div></div></div>
          <div class="navlist">${es.map((e) => this.item(e))}</div>
          <div class="foot">${robotSvg}<div class="m">Dreame X60 Ultra</div><div class="version">dreame_x60 v${this.version}</div></div>
        </div>
      </nav>
      <nav class="tabbar" aria-label="Tab-Leiste">${es.filter((e) => e.tab).slice(0, TAB_MAX).map((e) => this.item(e))}</nav>`;
  }
}

if (!customElements.get(NAV_ELEMENT)) customElements.define(NAV_ELEMENT, DxNav);
