// Pointer drags on page text: selection handles, text tools (mark on release) and plain mouse selection.
import { lineBoxes } from './sel-chars.js';
import { wordAt } from './sel-hit.js';
import { pageText, hit } from './page-hit.js';
import { paintSel, removeSel } from './sel-view.js';
import { select, placeMenu, applyMark } from './text-select.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
const pages = document.getElementById('viewer-pages');
export const REACH = 30; // css px: how far from a char a pointer still counts as "on the text"
const SLOP = 4;
let drag = null;
export const dragging = () => drag !== null;
export function cancelDrag() {
  if (drag) cancelAnimationFrame(drag.raf);
  drag = null;
}
function step(d) {
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
// kind: 'handle' (extend selection, needs el/T/anchor), 'mark' (text tool), 'select' (plain mouse drag).
export function beginDrag(kind, e, init) {
  drag = { kind, pid: e.pointerId, pt: [e.clientX, e.clientY], start: [e.clientX, e.clientY], moved: false, raf: 0, anchor: -1, T: null, range: null, ended: false, ...init };
  const d = drag;
  try { (kind === 'handle' ? e.target : pages).setPointerCapture(e.pointerId); } catch { /* ignore */ }
  e.preventDefault();
  if (kind === 'handle') return;
  d.ready = pageText(d.el).then((T) => {
    d.T = T;
    if (!T) return;
    if (T.chars.length < 20) { toast(t('edit.noText')); return; }
    const h = hit(d.el, T, ...d.start);
    d.anchor = h.css <= REACH ? h.i : -1;
    if (!d.ended && (kind === 'mark' || d.moved)) step(d);
  });
}
pages.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.pid) return;
  drag.pt = [e.clientX, e.clientY];
  if (!drag.moved && Math.hypot(e.clientX - drag.start[0], e.clientY - drag.start[1]) > SLOP) drag.moved = true;
  if (drag.moved) drag.raf ||= requestAnimationFrame(() => step(drag));
});
async function end(e) {
  if (!drag || e.pointerId !== drag.pid) return;
  const d = drag;
  drag = null;
  d.ended = true;
  cancelAnimationFrame(d.raf);
  if (d.ready) await d.ready;
  if (d.kind === 'select' && !d.moved) return; // a plain click only clears the selection
  step(d);
  if (d.kind === 'mark') {
    removeSel();
    if (d.range) applyMark(d.tool === 'underline' ? 'tu' : 'th', d.el, d.T, ...d.range);
  } else if (d.kind === 'select') {
    if (d.range) select(d.el, d.T, ...d.range); else removeSel();
  } else placeMenu();
}
pages.addEventListener('pointerup', end);
pages.addEventListener('pointercancel', (e) => {
  if (!drag || e.pointerId !== drag.pid) return;
  if (drag.kind !== 'handle') removeSel();
  cancelDrag();
});
