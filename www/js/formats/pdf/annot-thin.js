// Thins a stroke: drops points closer than `min` (page units) to the last kept one; keeps first and last.
export function thin(pts, min = 0.0007) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const q = out.at(-1);
    if (Math.hypot(pts[i][0] - q[0], pts[i][1] - q[1]) >= min) out.push(pts[i]);
  }
  out.push(pts.at(-1));
  return out;
}
