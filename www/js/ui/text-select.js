// Text selection controller: owns the selection (page + char range), paints it and runs the menu actions.
import { lineBoxes, normRects, textOf } from './sel-chars.js';
import { paintSel, removeSel } from './sel-view.js';
import { showMenu, hideMenu, onMenuAction } from './text-menu.js';
import { addItem } from './annot-store.js';
import { addNode } from './annot-layers.js';
import { getDrawColor } from './viewer-draw.js';
import { copyText } from './clipboard.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
const scroller = document.getElementById('viewer-scroll');
let S = null;
export const getSel = () => S;
export function clearSel() {
  S = null;
  removeSel();
  hideMenu();
}
export const selectedText = () => (S ? textOf(S.T.chars, S.a, S.b) : '');
export async function copySelection() {
  if (S && (await copyText(selectedText()))) toast(t('viewer.copied'));
}
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
// Marks a char range as highlight ('th') or underline ('tu') annotation.
export function applyMark(kind, el, T, a, b) {
  const c = getDrawColor();
  const item = { k: kind, c: kind === 'th' && ['#1e293b', '#ffffff', '#6b7280', '#92400e'].includes(c) ? '#facc15' : c, r: normRects(lineBoxes(T.chars, a, b), T) };
  addItem(Number(el.dataset.i), item);
  addNode(el, item);
}
onMenuAction(async (act) => {
  if (!S) return;
  const { el, T, a, b } = S;
  if (act === 'copy') await copySelection();
  else applyMark(act === 'hl' ? 'th' : 'tu', el, T, a, b);
  clearSel();
});
