// Stroke eraser: removes every annotation touched by the eraser segment (units: x 0..1, y 0..R) and reports it.
import { getItems, takeItems } from './annot-store.js';
import { nodeOf } from './annot-svg.js';
function pointSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
const cross = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
// Distance between two segments (0 when they cross): works for sparse strokes too, not only for their vertices.
export function segSeg(a, b, c, d) {
  const d1 = cross(a[0], a[1], b[0], b[1], c[0], c[1]), d2 = cross(a[0], a[1], b[0], b[1], d[0], d[1]);
  const d3 = cross(c[0], c[1], d[0], d[1], a[0], a[1]), d4 = cross(c[0], c[1], d[0], d[1], b[0], b[1]);
  if (d1 * d2 < 0 && d3 * d4 < 0) return 0;
  return Math.min(pointSeg(a[0], a[1], c[0], c[1], d[0], d[1]), pointSeg(b[0], b[1], c[0], c[1], d[0], d[1]),
    pointSeg(c[0], c[1], a[0], a[1], b[0], b[1]), pointSeg(d[0], d[1], a[0], a[1], b[0], b[1]));
}
export function touches(item, a, b, R, rad) {
  if (item.p) {
    const P = item.p.map(([x, y]) => [x, y * R]);
    const A = [a[0], a[1] * R], B = [b[0], b[1] * R], lim = rad + item.w / 2;
    if (P.length === 1) return pointSeg(P[0][0], P[0][1], A[0], A[1], B[0], B[1]) <= lim;
    return P.slice(1).some((q, i) => segSeg(A, B, P[i], q) <= lim);
  }
  return item.r.some(([x, y, w, h]) => [0, 0.25, 0.5, 0.75, 1].some((t) => {
    const px = a[0] + (b[0] - a[0]) * t, py = (a[1] + (b[1] - a[1]) * t) * R;
    return px >= x - rad && px <= x + w + rad && py >= y * R - rad && py <= (y + h) * R + rad;
  }));
}
export function eraseSegment(i, a, b, R, rad) {
  const hit = getItems(i).filter((it) => touches(it, a, b, R, rad));
  hit.forEach((it) => nodeOf(it)?.remove());
  return takeItems(i, hit);
}
