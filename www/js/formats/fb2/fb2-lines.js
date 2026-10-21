// Text lines for FB2: runs -> styled words -> greedy line breaking -> positioned segments (page units).
import { fontOf, shiftOf } from './fb2-font.js';
// runs -> words (a word may consist of several styled segments, e.g. "visit[1]")
export function toWords(runs, k, measure) {
  const words = [];
  let cur = null;
  for (const r of runs) {
    const st = { b: r.b || k.b, i: r.i || k.i, sup: r.sup, sub: r.sub, code: r.code };
    const font = fontOf(st, k.size);
    for (const part of r.s.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { cur = null; continue; }
      if (!cur) words.push((cur = { segs: [], w: 0 }));
      const w = measure(part, font);
      cur.segs.push({ s: part, x: cur.w, w, font, link: r.link, strike: r.strike, dy: shiftOf(st, k.size) });
      cur.w += w;
    }
  }
  return words;
}
// greedy line breaking; a word wider than the line is cut by characters
export function breakLines(words, k, width, measure) {
  const space = measure(' ', fontOf({ b: k.b, i: k.i }, k.size));
  const lines = [];
  let cur = { words: [], w: 0 };
  const avail = () => width - (k.indent && !lines.length ? k.indent * k.size : 0);
  for (const wd of words) {
    if (wd.w > width) {
      const font = wd.segs[0].font;
      let piece = '';
      for (const ch of [...wd.segs.map((s) => s.s).join('')]) {
        if (piece && measure(piece + ch, font) > avail()) { lines.push({ words: [{ segs: [{ s: piece, x: 0, w: measure(piece, font), font, dy: 0 }], w: measure(piece, font) }], w: 0 }); piece = ''; }
        piece += ch;
      }
      wd.segs = [{ s: piece, x: 0, w: measure(piece, font), font, dy: 0 }];
      wd.w = wd.segs[0].w;
    }
    const need = cur.words.length ? cur.w + space + wd.w : wd.w;
    if (cur.words.length && need > avail()) { lines.push(cur); cur = { words: [], w: 0 }; }
    cur.w = cur.words.length ? cur.w + space + wd.w : wd.w;
    cur.words.push(wd);
  }
  if (cur.words.length) lines.push(cur);
  lines.forEach((l, i) => { l.indent = k.indent && i === 0 ? k.indent * k.size : 0; l.last = i === lines.length - 1; l.space = space; l.avail = width - l.indent; });
  return lines.filter((l) => l.words.length);
}
// positions a line's words and flattens them to absolute segments
export function placeLine(line, k, left, base) {
  const natural = line.words.reduce((s, w) => s + w.w, 0) + line.space * (line.words.length - 1);
  let gap = line.space;
  const slack = line.avail - natural;
  if (k.align === 'justify' && !line.last && line.words.length > 1 && slack > 0 && slack / (line.words.length - 1) < line.space * 3) gap += slack / (line.words.length - 1);
  const width = line.words.reduce((s, w) => s + w.w, 0) + gap * (line.words.length - 1);
  let x = left + line.indent;
  if (k.align === 'center') x = left + (line.avail - width) / 2 + line.indent;
  else if (k.align === 'right') x = left + line.avail - width;
  const segs = [];
  line.words.forEach((w, i) => {
    w.segs.forEach((s, j) => segs.push({ ...s, x: x + s.x, space: j === 0 && i > 0 }));
    x += w.w + gap; // the next word starts after this one and the (possibly stretched) space
  });
  return { k: 'line', base, size: k.size, segs };
}
