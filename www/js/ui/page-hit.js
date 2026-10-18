// Page text helpers for pointer gestures: fetch a page's char table and map screen points to page units.
import { getActive } from './active-doc.js';
import { hitChar } from './sel-hit.js';
export function pageText(el) {
  const a = getActive();
  if (!a) return Promise.resolve(null);
  return a.text.getText(Number(el.dataset.i)).catch(() => null);
}
// Screen point -> page units; k = page units per css px.
export function local(el, T, x, y) {
  const r = el.getBoundingClientRect(), k = T.w / r.width;
  return { x: (x - r.left) * k, y: (y - r.top) * k, k };
}
export const hit = (el, T, x, y) => { const p = local(el, T, x, y), h = hitChar(T.chars, p.x, p.y); return { i: h.i, css: h.dist / p.k }; };
