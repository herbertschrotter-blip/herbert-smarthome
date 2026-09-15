// dx-heidi-map – Heidi-Karte (Bauplan 4.3b, PD-011): Kartenbild der Dreame-Integration (camera.heidi_map) plus eigene
// Ebene darüber – Raum-Umrisse pixelgenau aus dem Kartenpaket der Datenkarte (camera.heidi_map_data, Valetudo-Format).
// Tipp auf eine Fläche wählt den Raum; gewählte Räume werden aufgehellt und umrandet und tragen einen Nummern-Chip in
// der Reihenfolge der Auswahl (Herbert, 15.09.); der aktuelle Raum im Lauf bekommt einen grünen Rand. Keine eigenen
// Namensbeschriftungen – die stehen schon im Kartenbild. Kein fremdes Bauteil. Während/nach einem Raumauftrag liefert die
// Integration nur die aktiven Räume; die übrigen ergänzt der Lader aus dem letzten vollständigen Paket.
import { LitElement, html, css, svg, nothing } from 'lit';
import type { TemplateResult, PropertyValues } from 'lit';
import type { MapView, RobotView } from '../ha/selectors';
import { calibration } from '../domain/calibration';
import type { CalibPoint, Calibration } from '../domain/calibration';
import { segmentOutline, pxToVac } from '../domain/mapdata';
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
    .room { fill: transparent; stroke: transparent; stroke-width: 2.5; stroke-linejoin: round; fill-rule: evenodd; cursor: pointer; transition: fill var(--dx-dur), stroke var(--dx-dur); }
    .room:hover { fill: rgba(255, 255, 255, 0.1); }
    .room.sel { fill: rgba(255, 255, 255, 0.24); stroke: var(--dx-accent); }
    .room.cur { stroke: var(--dx-positive); }
    .room.cur.sel { stroke: var(--dx-accent); }
    /* Nummern-Chip als HTML über dem Bild: feste Bildschirmgröße unabhängig vom Kartenmaßstab, leicht nach rechts oben
       versetzt, damit er nicht auf der Raumbeschriftung des Kartenbilds sitzt */
    .badge { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; transform: translate(18px, -18px); border-radius: 50%; background: var(--dx-accent); color: var(--dx-on-accent); font: 700 13px/24px var(--dx-font); text-align: center; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.85); pointer-events: none; }
    .hint { position: absolute; left: 10px; top: 10px; font: 12px var(--dx-font); color: var(--dx-text-muted); background: rgba(12, 18, 30, 0.72); padding: 4px 8px; border-radius: 6px; line-height: 1.3; }
  `;

  static override properties = { map: { attribute: false }, robot: { attribute: false }, selected: { attribute: false }, _md: { state: true }, _size: { state: true } };

  declare map?: MapView;
  declare robot?: RobotView;
  /** Auswahl in Reihenfolge des Antippens (Set behält die Einfügereihenfolge) */
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
        void loadMapData(src.picture, src.version, src.mapKey).then((md) => { if (this._loadedVersion === src.version) this._md = md; });
      }
    }
  }

  private onImgLoad(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) this._size = { w: img.naturalWidth, h: img.naturalHeight };
  }

  /** Raum-Umrisse in Bildpixeln; neu nur bei neuem Kartenpaket oder neuer Kalibrierung. */
  private paths(md: MapData, calib: Calibration): RoomPath[] {
    const key = `${this._loadedVersion}|${JSON.stringify(this.map?.calibrationPoints ?? null)}`;
    if (this._pathCache?.key === key) return this._pathCache.paths;
    const order = this.map?.roomOrder ?? [];
    const paths: RoomPath[] = [];
    for (const r of order) {
      const seg = md.segments.find((s) => s.id === r.id);
      if (!seg) continue;
      const c = pxToVac(md, seg.centroid.x, seg.centroid.y);
      const [cx, cy] = calib.toMap(c.x, c.y);
      paths.push({ id: r.id, name: seg.name, short: r.short, d: segmentOutline(md, seg, (x, y) => calib.toMap(x, y)), cx, cy });
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
    const order = [...this.selected];
    const paths = ready ? this.paths(md!, calib!) : [];
    return html`
      <div class="wrap">
        <img src=${m?.entityPicture ?? ''} alt="Karte" @load=${this.onImgLoad}>
        ${ready ? svg`<svg viewBox="0 0 ${size!.w} ${size!.h}" preserveAspectRatio="none">
          ${paths.map((p) => svg`<path class="room ${this.selected.has(p.id) ? 'sel' : ''} ${cur === p.id ? 'cur' : ''}" data-room=${p.id} d=${p.d} @click=${() => this.tap(p.id)}><title>${p.name}</title></path>`)}
        </svg>` : nothing}
        ${paths.filter((p) => this.selected.has(p.id)).map((p) => html`<span class="badge" data-room=${p.id} style="left:${((p.cx / size!.w) * 100).toFixed(2)}%;top:${((p.cy / size!.h) * 100).toFixed(2)}%">${order.indexOf(p.id) + 1}</span>`)}
        ${!m?.mapData ? html`<div class="hint">Datenkarte fehlt – <code>camera.heidi_map_data</code> in der Dreame-Integration aktivieren</div>` : (!md && this._loadedVersion ? html`<div class="hint">Kartenpaket wird geladen …</div>` : nothing)}
        ${m?.mapData && !calib ? html`<div class="hint">Keine Kalibrierpunkte – Räume können nicht eingezeichnet werden</div>` : nothing}
      </div>`;
  }
}

if (!customElements.get(HEIDI_MAP_ELEMENT)) customElements.define(HEIDI_MAP_ELEMENT, DxHeidiMap);
