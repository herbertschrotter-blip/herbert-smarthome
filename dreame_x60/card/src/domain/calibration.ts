// Kartenkalibrierung (Bauplan 2.4): affine Abbildung Kartenbild (px) ↔ Roboter (mm) aus drei Kalibrierpunkten,
// gelöst per Cramer wie v1 _calib; Rechtecke aus den Kartenattributen wie v1 _rectsFromAttr.

export interface CalibPoint { vacuum: { x: number; y: number }; map: { x: number; y: number } }
export interface Calibration {
  /** Kartenbild-Pixel → Roboter-mm */
  toVac(mx: number, my: number): [number, number];
  /** Roboter-mm → Kartenbild-Pixel */
  toMap(x: number, y: number): [number, number];
}

type M3 = [[number, number, number], [number, number, number], [number, number, number]];
const det3 = (m: M3): number =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

/**
 * Kalibrierung aus den ersten drei Punkten. `null` bei weniger als drei Punkten oder wenn die Kartenpunkte
 * kollinear sind (Determinante 0). Die Rücktransformation nutzt die 2×2-Determinante ohne eigene Prüfung (wie v1).
 */
export function calibration(points: readonly CalibPoint[] | null | undefined): Calibration | null {
  if (!points || points.length < 3) return null;
  const [p0, p1, p2] = points as [CalibPoint, CalibPoint, CalibPoint];
  const A: M3 = [[p0.map.x, p0.map.y, 1], [p1.map.x, p1.map.y, 1], [p2.map.x, p2.map.y, 1]];
  const d = det3(A);
  if (!d) return null;
  const solve = (b: [number, number, number]): [number, number, number] =>
    [0, 1, 2].map((i) => det3(A.map((row, r) => row.map((v, c) => (c === i ? b[r] : v))) as M3) / d) as [number, number, number];
  const vx = solve([p0.vacuum.x, p1.vacuum.x, p2.vacuum.x]);
  const vy = solve([p0.vacuum.y, p1.vacuum.y, p2.vacuum.y]);
  const toVac = (mx: number, my: number): [number, number] => [vx[0] * mx + vx[1] * my + vx[2], vy[0] * mx + vy[1] * my + vy[2]];
  const dd = vx[0] * vy[1] - vx[1] * vy[0];
  const toMap = (x: number, y: number): [number, number] => {
    const rx = x - vx[2], ry = y - vy[2];
    return [(rx * vy[1] - ry * vx[1]) / dd, (ry * vx[0] - rx * vy[0]) / dd];
  };
  return { toVac, toMap };
}

/** Rechteck-Attribut der Karte (no_go_areas, no_mopping_areas): vier Ecken, einzelne dürfen fehlen. */
export interface RectAttr { x0?: number; y0?: number; x1?: number; y1?: number; x2?: number; y2?: number; x3?: number; y3?: number }
/** [x1, y1, x2, y2] in mm, min/max über die vorhandenen Ecken. */
export type Rect = [number, number, number, number];

/** Rechtecke aus Objekt oder Liste; `null`/`undefined` → leere Liste. */
export function rectsFromAttr(a: RectAttr | readonly RectAttr[] | null | undefined): Rect[] {
  if (!a) return [];
  const list = Array.isArray(a) ? (a as readonly RectAttr[]) : [a as RectAttr];
  return list.map((r) => {
    const xs = [r.x0, r.x1, r.x2, r.x3].filter((v): v is number => v !== undefined);
    const ys = [r.y0, r.y1, r.y2, r.y3].filter((v): v is number => v !== undefined);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
}
