// Header undo / redo buttons: step through the annotation history of all pages and repaint the affected pages.
import { undoOp, redoOp } from './annot-store.js';
import { repaintPage } from './annot-layers.js';
import { clearSel } from './text-select.js';
import { getActive } from './active-doc.js';
import { on } from '../core/bus.js';
const root = document.getElementById('viewer');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
function apply(pages) {
  if (!pages.length) return;
  clearSel();
  const area = document.getElementById('viewer-scroll').getBoundingClientRect();
  let visible = false;
  pages.forEach((i) => {
    const el = document.querySelector(`.pdf-page[data-i="${i}"]`);
    if (el?.classList.contains('ready')) repaintPage(el);
    const r = el?.getBoundingClientRect();
    if (r && r.width && r.bottom > area.top && r.top < area.bottom && r.right > area.left && r.left < area.right) visible = true;
  });
  if (!visible) getActive()?.list.goTo(pages[0] + 1); // show the page that changed
}
undoBtn.addEventListener('click', () => apply(undoOp()));
redoBtn.addEventListener('click', () => apply(redoOp()));
on('annotchange', ({ undo, redo }) => { undoBtn.disabled = !undo; redoBtn.disabled = !redo; });
on('editbar', (open) => root.classList.toggle('show-undo', open));
