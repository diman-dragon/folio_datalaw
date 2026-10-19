// Turns a char range of a page into a text highlight ('th') or underline ('tu') annotation.
import { lineBoxes, normRects } from './sel-chars.js';
import { addItem } from './annot-history.js';
import { addNode } from './annot-layers.js';
import { getDrawColor } from './draw-state.js';
const PALE = ['#1e293b', '#ffffff', '#6b7280', '#92400e']; // colours that would hide the text under a highlight
export function applyMark(kind, el, T, a, b) {
  const c = getDrawColor();
  const item = { k: kind, c: kind === 'th' && PALE.includes(c) ? '#facc15' : c, r: normRects(lineBoxes(T.chars, a, b), T) };
  addItem(Number(el.dataset.i), item);
  addNode(el, item);
}
