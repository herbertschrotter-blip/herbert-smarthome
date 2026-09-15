// Kartenpaket der Datenkarte (Bauplan 4.3b, Heidi-Karte): Valetudo-Format v2 aus camera.heidi_map_data. Reine Funktionen:
// Segmente (Räume) als Lauflängen in Rasterpixeln, Umrechnung Raster ↔ Roboter-mm (Rasterursprung = Kartenmitte,
// y nach oben), Treffer-Suche je Raum, SVG-Pfade der Raumflächen in beliebigen Zielkoordinaten.

/** Lauflänge im Raster: [x, y, Anzahl] */
export type Run = [x: number, y: number, n: number];

export interface MapSegment {
  id: number;
  name: string;
  /** Lauflängen [x, y, Anzahl] in Rasterpixeln (wie `compressedPixels`) */
  runs: [number, number, number][];
  pixelCount: number;
  /** Rastermitte der Bounding-Box (Valetudo `dimensions`) */
  mid: { x: number; y: number };
  /** Ankerpunkt für Nummern-Chips in Rasterpixeln: Flächenschwerpunkt – liegt der außerhalb (L-Form, Loch), die Mitte der nächstliegenden Lauflänge, die ihn überdeckt, sonst die längste Lauflänge der nächsten Zeile. */
  centroid: { x: number; y: number };
  bbox: { x0: number; y0: number; x1: number; y1: number };
  /** Valetudo `metaData.active`: Raum gehört zum laufenden/letzten Raumauftrag */
  active: boolean;
}
export interface MapPoint { x: number; y: number; angle?: number | undefined }
export interface MapData {
  /** Kantenlänge in cm (Valetudo `size`) */
  size: { x: number; y: number };
  /** cm je Rasterpixel */
  pixelSize: number;
  rotation: number;
  segments: MapSegment[];
  /** Roboter/Ladestation in Roboter-mm */
  robot: MapPoint | null;
  charger: MapPoint | null;
  /** Fahrpfade in Roboter-mm */
  paths: [number, number][][];
  /**
   * Unvollständig: Die Dreame-Integration liefert während und nach einem Raumauftrag nur die aktiven Räume als Segmente
   * (die übrigen werden zu Bodenpixeln, dreame/map.py `active_segments`). Dann fehlende Räume aus dem letzten
   * vollständigen Paket ergänzen (`mergeSegments`).
   */
  partial: boolean;
}

interface ValetudoLayer { type: string; metaData?: { segmentId?: number | string; name?: string; active?: boolean }; compressedPixels?: number[]; pixels?: number[]; dimensions?: { x: { min: number; max: number; mid: number }; y: { min: number; max: number; mid: number }; pixelCount?: number } }
interface ValetudoEntity { type: string; points: number[]; metaData?: { angle?: number } }
interface ValetudoMap { size: { x: number; y: number }; pixelSize: number; layers: ValetudoLayer[]; entities?: ValetudoEntity[]; metaData?: { rotation?: number } }

/** Valetudo-JSON → MapData; wirft bei fremdem Format. */
export function parseValetudo(text: string): MapData {
  const j = JSON.parse(text) as ValetudoMap;
  if (!j || !j.size || !j.pixelSize || !Array.isArray(j.layers)) throw new Error('kein Valetudo-Kartenpaket');
  const md: MapData = { size: { x: j.size.x, y: j.size.y }, pixelSize: j.pixelSize, rotation: j.metaData?.rotation ?? 0, segments: [], robot: null, charger: null, paths: [], partial: false };
  for (const l of j.layers) {
    if (l.type !== 'segment') continue;
    const id = parseInt(String(l.metaData?.segmentId ?? ''), 10);
    if (isNaN(id)) continue;
    const runs: [number, number, number][] = [];
    if (l.compressedPixels?.length) for (let i = 0; i + 2 < l.compressedPixels.length; i += 3) runs.push([l.compressedPixels[i]!, l.compressedPixels[i + 1]!, l.compressedPixels[i + 2]!]);
    else if (l.pixels?.length) for (let i = 0; i + 1 < l.pixels.length; i += 2) runs.push([l.pixels[i]!, l.pixels[i + 1]!, 1]);
    const count = runs.reduce((n, r) => n + r[2], 0);
    const xs = runs.flatMap((r) => [r[0], r[0] + r[2] - 1]), ys = runs.map((r) => r[1]);
    const bbox = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const d = l.dimensions;
    md.segments.push({ id, name: String(l.metaData?.name ?? `Raum ${id}`), runs, pixelCount: d?.pixelCount ?? count, mid: { x: d?.x.mid ?? (bbox.x0 + bbox.x1) / 2, y: d?.y.mid ?? (bbox.y0 + bbox.y1) / 2 }, centroid: anchorOf(runs, bbox), bbox, active: l.metaData?.active === true });
  }
  md.partial = md.segments.some((s) => s.active);
  const cm = (v: number): number => v; // Entitäten in cm
  for (const e of j.entities ?? []) {
    if (e.type === 'robot_position' && e.points.length >= 2) md.robot = { ...cmToVac(md, cm(e.points[0]!), cm(e.points[1]!)), angle: e.metaData?.angle };
    else if (e.type === 'charger_location' && e.points.length >= 2) md.charger = { ...cmToVac(md, cm(e.points[0]!), cm(e.points[1]!)), angle: e.metaData?.angle };
    else if (e.type === 'path') { const pts: [number, number][] = []; for (let i = 0; i + 1 < e.points.length; i += 2) { const v = cmToVac(md, e.points[i]!, e.points[i + 1]!); pts.push([v.x, v.y]); } md.paths.push(pts); }
  }
  return md;
}

/** Karten-cm (Ursprung oben links) → Roboter-mm (Ursprung Kartenmitte, y nach oben). */
export function cmToVac(md: MapData, cx: number, cy: number): { x: number; y: number } {
  return { x: (cx - md.size.x / 2) * 10, y: (md.size.y / 2 - cy) * 10 };
}
/** Rasterpixel → Roboter-mm (Pixelmitte). */
export function pxToVac(md: MapData, px: number, py: number): { x: number; y: number } {
  return cmToVac(md, (px + 0.5) * md.pixelSize, (py + 0.5) * md.pixelSize);
}
/** Roboter-mm → Rasterpixel (ganzzahlig). */
export function vacToPx(md: MapData, x: number, y: number): { px: number; py: number } {
  return { px: Math.floor((x / 10 + md.size.x / 2) / md.pixelSize), py: Math.floor((md.size.y / 2 - y / 10) / md.pixelSize) };
}

/** Zeilenindex für schnelle Treffer-Suche: y → [x0, x1 (exklusiv), segmentId]. */
export function rowIndex(md: MapData): Map<number, [number, number, number][]> {
  const rows = new Map<number, [number, number, number][]>();
  for (const s of md.segments) for (const [x, y, n] of s.runs) { let r = rows.get(y); if (!r) { r = []; rows.set(y, r); } r.push([x, x + n, s.id]); }
  return rows;
}
/** Segment-ID am Rasterpixel, null außerhalb aller Räume. */
export function segmentAt(rows: Map<number, [number, number, number][]>, px: number, py: number): number | null {
  const r = rows.get(py);
  if (!r) return null;
  for (const [x0, x1, id] of r) if (px >= x0 && px < x1) return id;
  return null;
}

/**
 * Unvollständiges Paket mit bekannten Räumen auffüllen: Räume des Pakets bleiben (Lage im laufenden Auftrag), fehlende
 * kommen aus `known` (letztes vollständiges Paket derselben Karte), Reihenfolge wie `known`. Vollständige Pakete
 * bleiben unverändert.
 */
export function mergeSegments(md: MapData, known: readonly MapSegment[] | null | undefined): MapData {
  if (!md.partial || !known?.length) return md;
  const own = new Map(md.segments.map((s) => [s.id, s]));
  const segments = known.map((k) => own.get(k.id) ?? k);
  for (const s of md.segments) if (!known.some((k) => k.id === s.id)) segments.push(s);
  return { ...md, segments };
}

/** Ankerpunkt (siehe MapSegment.centroid). */
export function anchorOf(runs: Run[], bbox: { x0: number; y0: number; x1: number; y1: number }): { x: number; y: number } {
  const count = runs.reduce((n, r) => n + r[2], 0);
  if (!count) return { x: (bbox.x0 + bbox.x1) / 2, y: (bbox.y0 + bbox.y1) / 2 };
  const cx = runs.reduce((a, r) => a + r[2] * (r[0] + (r[2] - 1) / 2), 0) / count, cy = runs.reduce((a, r) => a + r[2] * r[1], 0) / count;
  const rx = Math.round(cx), ry = Math.round(cy);
  if (runs.some((r) => r[1] === ry && rx >= r[0] && rx < r[0] + r[2])) return { x: cx, y: cy };
  // außerhalb: Zeile mit kleinstem Abstand zu cy, darin die Lauflänge, die cx überdeckt, sonst die längste
  let best: Run | null = null, bestD = Infinity;
  for (const r of runs) {
    const dy = Math.abs(r[1] - cy), covers = rx >= r[0] && rx < r[0] + r[2];
    const d = dy * 1000 + (covers ? 0 : 500 - Math.min(r[2], 499));
    if (d < bestD) { bestD = d; best = r; }
  }
  const r = best!;
  return { x: r[0] + (r[2] - 1) / 2, y: r[1] };
}

/**
 * SVG-Pfad des Raum-Umrisses: Randkanten der Pixelmaske (Kanten zu Nachbarn außerhalb des Raums), zu geschlossenen
 * Schleifen verkettet, Löcher inklusive (mit `fill-rule: evenodd` füllen). Eckpunkte über `toTarget` (Roboter-mm → Ziel).
 */
export function segmentOutline(md: MapData, seg: MapSegment, toTarget: (x: number, y: number) => [number, number]): string {
  const K = 1 << 16;
  const inSeg = new Set<number>();
  for (const [x, y, n] of seg.runs) for (let i = 0; i < n; i++) inSeg.add(x + i + y * K);
  const has = (x: number, y: number): boolean => inSeg.has(x + y * K);
  // gerichtete Randkanten im Uhrzeigersinn (Raster: y nach unten), Schlüssel = Startpunkt
  const edges = new Map<number, number[]>();
  const add = (fx: number, fy: number, tx: number, ty: number): void => { const k = fx + fy * K; const l = edges.get(k); if (l) l.push(tx + ty * K); else edges.set(k, [tx + ty * K]); };
  for (const [x0, y, n] of seg.runs) for (let x = x0; x < x0 + n; x++) {
    if (!has(x, y - 1)) add(x, y, x + 1, y);
    if (!has(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!has(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!has(x - 1, y)) add(x, y + 1, x, y);
  }
  const ps = md.pixelSize;
  const pt = (k: number): [number, number] => { const v = cmToVac(md, (k % K) * ps, Math.floor(k / K) * ps); return toTarget(v.x, v.y); };
  const parts: string[] = [];
  while (edges.size) {
    const start = edges.keys().next().value as number;
    const loop: number[] = [start];
    let cur = start;
    for (let guard = 0; guard < 200000; guard++) {
      const outs = edges.get(cur);
      if (!outs || !outs.length) break;
      const next = outs.shift()!;
      if (!outs.length) edges.delete(cur);
      if (next === start) break;
      loop.push(next);
      cur = next;
    }
    if (loop.length < 3) continue;
    // Kollineare Zwischenpunkte weglassen (kürzerer Pfad)
    const keep: number[] = [];
    for (let i = 0; i < loop.length; i++) {
      const a = loop[(i + loop.length - 1) % loop.length]!, b = loop[i]!, c = loop[(i + 1) % loop.length]!;
      const ax = a % K, ay = Math.floor(a / K), bx = b % K, by = Math.floor(b / K), cx = c % K, cy = Math.floor(c / K);
      if ((bx - ax) * (cy - by) - (by - ay) * (cx - bx) !== 0) keep.push(b);
    }
    parts.push('M' + keep.map((k) => { const [u, v] = pt(k); return `${u.toFixed(1)} ${v.toFixed(1)}`; }).join('L') + 'Z');
  }
  return parts.join('');
}

/** SVG-Pfad der Raumfläche: jede Lauflänge als Viereck in Zielkoordinaten (`toTarget` bildet Roboter-mm ab, z. B. auf Bildpixel). */
export function segmentPath(md: MapData, seg: MapSegment, toTarget: (x: number, y: number) => [number, number]): string {
  const ps = md.pixelSize;
  const corner = (px: number, py: number): [number, number] => { const v = cmToVac(md, px * ps, py * ps); return toTarget(v.x, v.y); };
  const parts: string[] = [];
  for (const [x, y, n] of seg.runs) {
    const a = corner(x, y), b = corner(x + n, y), c = corner(x + n, y + 1), d = corner(x, y + 1);
    parts.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}L${d[0].toFixed(1)} ${d[1].toFixed(1)}Z`);
  }
  return parts.join('');
}
