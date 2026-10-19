// Text selection state: owns the selection (page + char range), paints it and positions the bubble menu.
import { lineBoxes, textOf } from './sel-chars.js';
import { paintSel, removeSel } from './sel-view.js';
import { showMenu, hideMenu } from './text-menu.js';
const scroller = document.getElementById('viewer-scroll');
let S = null;
export const getSel = () => S;
export function clearSel() {
  S = null;
  removeSel();
  hideMenu();
}
export const selectedText = () => (S ? textOf(S.T.chars, S.a, S.b) : '');
export function placeMenu() {
  if (!S) return;
  const pr = S.el.getBoundingClientRect(), b = scroller.getBoundingClientRect(), k = pr.width / S.T.w;
  const f = S.lines[0], l = S.lines.at(-1);
  const anchor = { left: pr.left + k * Math.min(...S.lines.map((x) => x.x)), right: pr.left + k * Math.max(...S.lines.map((x) => x.x + x.w)), top: pr.top + k * f.y, bottom: pr.top + k * (l.y + l.h) };
  if (anchor.bottom < b.top || anchor.top > b.bottom) hideMenu(); else showMenu(anchor, b);
}
export function select(el, T, a, b, { menu = true } = {}) {
  S = { el, T, a, b, lines: lineBoxes(T.chars, a, b) };
  paintSel(el, T, S.lines);
  if (menu) placeMenu(); else hideMenu();
}
