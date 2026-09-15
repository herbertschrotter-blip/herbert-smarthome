// dx-heidi-map – Heidi-Karte (Bauplan 4.3b, PD-011): Kartenbild der Dreame-Integration (camera.heidi_map) plus eigene
// Ebene darüber – Raumflächen pixelgenau aus dem Kartenpaket der Datenkarte (camera.heidi_map_data, Valetudo-Format),
// Tipp auf eine Fläche wählt den Raum, gewählte Räume und der aktuelle Raum werden hervorgehoben. Die Flächen liegen
// als SVG-Pfade in Bildpixeln (Roboter-mm → Bild über die Kalibrierpunkte, domain/calibration.ts). Kein fremdes Bauteil.
import { LitElement, html, css, svg, nothing } from 'lit';
import type { TemplateResult, PropertyValues } from 'lit';
import type { MapView, RobotView } from '../ha/selectors';
import { calibration } from '../domain/calibration';
import type { CalibPoint, Calibration } from '../domain/calibration';
import { segmentPath } from '../domain/mapdata';
import type { MapData } from '../domain/mapdata';
import { loadMapData } from '../ha/mapdata-loader';
import { emit } from '../shared/overlay';

export const HEIDI_MAP_ELEMENT = 'dx-heidi-map';
/** Ereignis beim Tipp auf einen Raum: detail { id } */
export const ROOM_TAP_EVENT = 'dx-room-tap';

interface RoomPath { id: number; name: string; short: string; d: string; cx: number; cy: number }

export class DxHeidiMap extends LitElement {
  static override styles = css`
    :host { display: block; }
    .wrap { position: relative; width: 100%; line-height: 0; }
    img { display: block; width: 100%; height: auto; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .room { fill: transparent; stroke: transparent; cursor: pointer; transition: fill var(--dx-dur), stroke var(--dx-dur); }
    .room:hover { fill: color-mix(in srgb, var(--dx-accent) 14%, transparent); }
    .room.sel { fill: color-mix(in srgb, var(--dx-accent) 38%, transparent); stroke: var(--dx-accent); stroke-width: 1.5; paint-order: stroke; }
    .room.cur { stroke: var(--dx-positive); stroke-width: 1.5; stroke-dasharray: 4 3; }
    .room.cur.sel { stroke: var(--dx-accent); stroke-dasharray: none; }
    .label { pointer-events: none; }
    .label rect { fill: rgba(12, 18, 30, 0.72); stroke: rgba(255, 255, 255, 0.18); }
    .label.sel rect { fill: var(--dx-accent); stroke: transparent; }
    .label text { fill: var(--dx-text); font: 600 12px var(--dx-font); dominant-baseline: middle; text-anchor: middle; }
    .label.sel text { fill: var(--dx-on-accent); }
    .hint { position: absolute; left: 10px; top: 10px; font: 12px var(--dx-font); color: var(--dx-text-muted); background: rgba(12, 18, 30, 0.72); padding: 4px 8px; border-radius: 6px; line-height: 1.3; }
  `;

  static override properties = { map: { attribute: false }, robot: { attribute: false }, selected: { attribute: false }, _md: { state: true }, _size: { state: true } };

  declare map?: MapView;
  declare robot?: RobotView;
  declare selected: ReadonlySet<number>;
  declare private _md: MapData | null;
  declare private _size: { w: number; h: number } | null;
  private _loadedVersion = '';
  private _pathCache: { key: string; paths: RoomPath[] } | null = null;

  constructor() { super(); this.selected = new Set(); this._md = null; this._size = null; }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has('map')) {
      const src = this.map?.mapData;
      if (src && src.version !== this._loadedVersion) {
        this._loadedVersion = src.version;
        void loadMapData(src.picture, src.version).then((md) => { if (this._loadedVersion === src.version) this._md = md; });
      }
    }
  }

  private onImgLoad(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) this._size = { w: img.naturalWidth, h: img.naturalHeight };
  }

  /** Raumflächen in Bildpixeln; neu nur bei neuem Kartenpaket oder neuer Kalibrierung. */
  private paths(md: MapData, calib: Calibration): RoomPath[] {
    const key = `${this._loadedVersion}|${JSON.stringify(this.map?.calibrationPoints ?? null)}`;
    if (this._pathCache?.key === key) return this._pathCache.paths;
    const order = this.map?.roomOrder ?? [];
    const paths: RoomPath[] = [];
    for (const r of order) {
      const seg = md.segments.find((s) => s.id === r.id);
      if (!seg) continue;
      const c = pxCenter(md, seg.mid.x, seg.mid.y);
      const [cx, cy] = calib.toMap(c.x, c.y);
      paths.push({ id: r.id, name: seg.name, short: r.short, d: segmentPath(md, seg, (x, y) => calib.toMap(x, y)), cx, cy });
    }
    this._pathCache = { key, paths };
    return paths;
  }

  private tap(id: number): void { emit(this, ROOM_TAP_EVENT, { id }); }

  override render(): TemplateResult {
    const m = this.map;
    const calib = calibration((m?.calibrationPoints as CalibPoint[] | null) ?? null);
    const md = this._md, size = this._size;
    const cur = this.robot && (this.robot.vac === 'cleaning' || this.robot.vac === 'paused') ? this.robot.currentSegment : null;
    const ready = !!(md && size && calib);
    return html`
      <div class="wrap">
        <img src=${m?.entityPicture ?? ''} alt="Karte" @load=${this.onImgLoad}>
        ${ready ? svg`<svg viewBox="0 0 ${size!.w} ${size!.h}" preserveAspectRatio="none">
          ${this.paths(md!, calib!).map((p) => svg`<path class="room ${this.selected.has(p.id) ? 'sel' : ''} ${cur === p.id ? 'cur' : ''}" data-room=${p.id} d=${p.d} @click=${() => this.tap(p.id)}><title>${p.name}</title></path>`)}
          ${this.paths(md!, calib!).map((p) => { const w = p.short.length * 7.5 + 16; return svg`<g class="label ${this.selected.has(p.id) ? 'sel' : ''}" transform="translate(${p.cx.toFixed(1)} ${p.cy.toFixed(1)})"><rect x=${-w / 2} y="-10" width=${w} height="20" rx="10"></rect><text>${p.short}</text></g>`; })}
        </svg>` : nothing}
        ${!m?.mapData ? html`<div class="hint">Datenkarte fehlt – <code>camera.heidi_map_data</code> in der Dreame-Integration aktivieren</div>` : (!md && this._loadedVersion ? html`<div class="hint">Kartenpaket wird geladen …</div>` : nothing)}
        ${m?.mapData && !calib ? html`<div class="hint">Keine Kalibrierpunkte – Räume können nicht eingezeichnet werden</div>` : nothing}
      </div>`;
  }
}

/** Mitte eines Rasterpixels in Roboter-mm (für Beschriftungen). */
function pxCenter(md: MapData, px: number, py: number): { x: number; y: number } {
  return { x: ((px + 0.5) * md.pixelSize - md.size.x / 2) * 10, y: (md.size.y / 2 - (py + 0.5) * md.pixelSize) * 10 };
}

if (!customElements.get(HEIDI_MAP_ELEMENT)) customElements.define(HEIDI_MAP_ELEMENT, DxHeidiMap);
