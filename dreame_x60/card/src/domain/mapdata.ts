// Kartenpaket der Datenkarte (Bauplan 4.3b, Heidi-Karte): Valetudo-Format v2 aus camera.heidi_map_data. Reine Funktionen:
// Segmente (Räume) als Lauflängen in Rasterpixeln, Umrechnung Raster ↔ Roboter-mm (Rasterursprung = Kartenmitte,
// y nach oben), Treffer-Suche je Raum, SVG-Pfade der Raumflächen in beliebigen Zielkoordinaten.

export interface MapSegment {
  id: number;
  name: string;
  /** Lauflängen [x, y, Anzahl] in Rasterpixeln (wie `compressedPixels`) */
  runs: [number, number, number][];
  pixelCount: number;
  /** Rastermitte (Beschriftung) */
  mid: { x: number; y: number };
  bbox: { x0: number; y0: number; x1: number; y1: number };
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
}

interface ValetudoLayer { type: string; metaData?: { segmentId?: number | string; name?: string }; compressedPixels?: number[]; pixels?: number[]; dimensions?: { x: { min: number; max: number; mid: number }; y: { min: number; max: number; mid: number }; pixelCount?: number } }
interface ValetudoEntity { type: string; points: number[]; metaData?: { angle?: number } }
interface ValetudoMap { size: { x: number; y: number }; pixelSize: number; layers: ValetudoLayer[]; entities?: ValetudoEntity[]; metaData?: { rotation?: number } }

/** Valetudo-JSON → MapData; wirft bei fremdem Format. */
export function parseValetudo(text: string): MapData {
  const j = JSON.parse(text) as ValetudoMap;
  if (!j || !j.size || !j.pixelSize || !Array.isArray(j.layers)) throw new Error('kein Valetudo-Kartenpaket');
  const md: MapData = { size: { x: j.size.x, y: j.size.y }, pixelSize: j.pixelSize, rotation: j.metaData?.rotation ?? 0, segments: [], robot: null, charger: null, paths: [] };
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
    md.segments.push({ id, name: String(l.metaData?.name ?? `Raum ${id}`), runs, pixelCount: d?.pixelCount ?? count, mid: { x: d?.x.mid ?? (bbox.x0 + bbox.x1) / 2, y: d?.y.mid ?? (bbox.y0 + bbox.y1) / 2 }, bbox });
  }
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
