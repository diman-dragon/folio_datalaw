// Draws a laid-out FB2 page onto a canvas context in page units (the caller applies the zoom as a transform).
import { PAGE } from './fb2-layout.js';
export const PAPER = '#fdfaf2';
export const INK = '#1d1b18';
export const LINK = '#1a5fb4';
export function drawPage(ctx, page, images) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, PAGE.w, PAGE.h);
  ctx.textBaseline = 'alphabetic';
  for (const it of page.items) {
    if (it.k === 'img') {
      const bmp = images.get(it.id);
      if (bmp) ctx.drawImage(bmp, it.x, it.y, it.w, it.h);
      continue;
    }
    for (const seg of it.segs) {
      const y = it.base + seg.dy;
      ctx.font = seg.font;
      ctx.fillStyle = seg.link ? LINK : INK;
      ctx.fillText(seg.s, seg.x, y);
      if (seg.strike) ctx.fillRect(seg.x, y - it.size * 0.3, seg.w, 1);
    }
  }
}
