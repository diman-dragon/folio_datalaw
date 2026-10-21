// Char table of an FB2 page (same shape as the PDF one): a box for every character, spaces between words included.
import { PAGE } from './fb2-layout.js';
export function charTable(page, measure) {
  const chars = [];
  for (const line of page.items) {
    if (line.k !== 'line') continue;
    const y = line.base - line.size * 0.92, h = line.size * 1.22;
    let prev = null; // end of the previous segment on this line
    for (const seg of line.segs) {
      if (seg.space && prev) chars.push({ ch: ' ', x: prev, y, w: Math.max(0, seg.x - prev), h });
      const cs = [...seg.s], ws = cs.map((c) => measure(c, seg.font)), sum = ws.reduce((a, b) => a + b, 0) || 1;
      let x = seg.x;
      cs.forEach((ch, i) => { const w = (ws[i] / sum) * seg.w; chars.push({ ch, x, y, w, h }); x += w; });
      prev = seg.x + seg.w;
    }
  }
  return { w: PAGE.w, h: PAGE.h, chars, exact: true }; // real text, not a recognition guess
}
