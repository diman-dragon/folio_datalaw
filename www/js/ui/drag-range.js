// Char range under a text drag: from the anchor char to the char under the pointer; paints the live selection.
import { lineBoxes } from './sel-chars.js';
import { wordAt } from './sel-hit.js';
import { hit } from './page-hit.js';
import { paintSel } from './sel-view.js';
import { select } from './text-select.js';
// d: { kind, el, T, anchor, pt:[x,y], range }. Handle drags re-select (keeping handles), the others paint a plain selection.
export function updateRange(d) {
  d.raf = 0;
  if (!d.T || d.anchor < 0) return;
  const h = hit(d.el, d.T, d.pt[0], d.pt[1]);
  if (h.i < 0) return;
  let a = Math.min(d.anchor, h.i), b = Math.max(d.anchor, h.i);
  if (d.kind === 'mark' && a === b) [a, b] = wordAt(d.T.chars, a);
  d.range = [a, b];
  if (d.kind === 'handle') select(d.el, d.T, a, b, { menu: false });
  else paintSel(d.el, d.T, lineBoxes(d.T.chars, a, b), { handles: false });
}
