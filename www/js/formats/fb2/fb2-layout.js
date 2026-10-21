// Pagination: blocks -> fixed-size pages of positioned text segments and images (1 page unit = 1 css px at 100% zoom).
import { toWords, breakLines, placeLine } from './fb2-lines.js';
export const PAGE = { w: 540, h: 780, mx: 48, my: 54 };
export const BASE = 18;
const LH = 1.42;
// per block kind: size, align, first-line indent (em), left margin (px), space before / after (px), forced bold / italic
const KIND = {
  p: { size: BASE, align: 'justify', indent: 1.4 },
  quote: { size: BASE - 1, align: 'justify', left: 34, i: true, after: 2 },
  verse: { size: BASE, align: 'left', left: 40 },
  author: { size: BASE - 1, align: 'right', i: true, before: 4, after: 10 },
  subtitle: { size: 20, align: 'center', b: true, before: 14, after: 10 },
  title1: { size: 28, align: 'center', b: true, before: 36, after: 22 },
  title2: { size: 23, align: 'center', b: true, before: 24, after: 14 },
  'cover-author': { size: 22, align: 'center', before: 150, after: 26 },
  'cover-title': { size: 34, align: 'center', b: true, after: 40 },
};
const kindOf = (b) => (b.t === 'title' ? (b.level <= 1 ? KIND.title1 : KIND.title2) : b.t === 'p' && b.quote ? KIND.quote : KIND[b.t]);
export function paginate(blocks, measure, imageSize = () => null) {
  const pages = [];
  const width = PAGE.w - 2 * PAGE.mx, bottom = PAGE.h - PAGE.my;
  let page, y;
  const fresh = () => { page = { items: [] }; pages.push(page); y = PAGE.my; };
  const room = (h) => y + h <= bottom;
  const top = () => y === PAGE.my;
  fresh();
  for (const b of blocks) {
    if (b.t === 'pagebreak') { if (page.items.length) fresh(); continue; }
    if (b.t === 'empty') { if (!top()) y += BASE * LH * 0.9; continue; }
    if (b.t === 'gap') { if (!top()) y += BASE * 0.7; continue; }
    if (b.t === 'image') {
      const s = imageSize(b.id);
      if (!s) continue;
      const f = Math.min(1, width / s.w, (bottom - PAGE.my) / s.h);
      const w = s.w * f, h = s.h * f;
      if (!room(h + 12)) fresh();
      page.items.push({ k: 'img', id: b.id, x: (PAGE.w - w) / 2, y, w, h });
      y += h + 12;
      continue;
    }
    const k = kindOf(b);
    if (!k) continue;
    const left = PAGE.mx + (k.left ?? 0);
    const lines = breakLines(toWords(b.runs, k, measure), k, width - (k.left ?? 0), measure);
    if (!lines.length) continue;
    const lh = k.size * LH;
    if (b.t === 'title' && b.level <= 1 && !top()) fresh();
    const before = top() ? 0 : k.before ?? 0;
    const keep = b.t === 'title' || b.t === 'subtitle' ? lines.length * lh + (k.after ?? 0) + 2 * BASE * LH : lines.length > 1 ? 2 * lh : lh;
    if (!room(before + keep) && !top()) fresh();
    else y += before;
    lines.forEach((ln, i) => {
      const left2 = lines.length - i === 2 && lines.length > 2 ? 2 * lh : lh; // never strand a single last line
      if (!room(left2)) fresh();
      page.items.push(placeLine(ln, k, left, y + k.size * 1.08));
      y += lh;
    });
    y += k.after ?? 0;
  }
  if (pages.length > 1 && !pages.at(-1).items.length) pages.pop();
  return pages;
}
