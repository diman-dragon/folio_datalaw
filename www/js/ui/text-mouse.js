// Mouse gestures on page text: drag selects, double-click selects a word, text tools mark by dragging.
import { wordAt } from './sel-hit.js';
import { pageText, hit } from './page-hit.js';
import { handleSide } from './sel-view.js';
import { getSel, select, clearSel, placeMenu } from './text-select.js';
import { beginDrag, cancelDrag, dragging, REACH } from './text-drag.js';
import { getDrawTool } from './viewer-draw.js';
import { hideMenu } from './text-menu.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
import { on } from '../core/bus.js';
const pages = document.getElementById('viewer-pages');
const scroller = document.getElementById('viewer-scroll');
pages.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || dragging()) return;
  const side = handleSide(e.target), s = getSel(), tool = getDrawTool();
  if (side && s) { hideMenu(); beginDrag('handle', e, { el: s.el, T: s.T, anchor: side === 'start' ? s.b : s.a }); return; }
  if (tool && tool !== 'text-select' && tool !== 'underline') return; // drawing tools own the pointer
  const el = e.target.closest?.('.pdf-page');
  if (!el) return;
  clearSel();
  beginDrag(tool ? 'mark' : 'select', e, { el, tool });
});
pages.addEventListener('dblclick', async (e) => {
  const el = e.target.closest?.('.pdf-page');
  if (!el || getDrawTool()) return;
  const T = await pageText(el);
  if (!T) return;
  if (T.chars.length < 20) { toast(t('edit.noText')); return; }
  const h = hit(el, T, e.clientX, e.clientY);
  if (h.i < 0 || h.css > REACH) return;
  const [a, b] = wordAt(T.chars, h.i);
  select(el, T, a, b);
});
pages.addEventListener('contextmenu', (e) => { if (getDrawTool()) e.preventDefault(); });
pages.addEventListener('pagehide', (e) => { if (getSel()?.el === e.target) clearSel(); });
scroller.addEventListener('scroll', () => { if (getSel() && !dragging()) requestAnimationFrame(placeMenu); }, { passive: true });
on('toolchange', () => { cancelDrag(); clearSel(); });
on('viewchange', () => { cancelDrag(); clearSel(); });
