// Floating tool palette over the document: show / hide / restore, drag position, edit and OCR buttons.
import { initPanelDrag } from './panel-drag.js';
import { clearTool } from './tool-select.js';
import { isPinned } from './panel-pin.js';
import { toggleOcr } from './ocr-menu.js';
import './color-palette.js';
import './tool-cursor.js';
import { getPref, setPref } from '../core/prefs.js';
const panel = document.getElementById('tools-panel');
const editBtn = document.getElementById('edit-btn');
const place = initPanelDrag(panel, isPinned);
export function showPanel(open, { save = true } = {}) {
  panel.hidden = !open;
  editBtn.classList.toggle('active', open);
  editBtn.setAttribute('aria-pressed', String(open));
  if (save) setPref('panelopen', open);
  if (open) place(); else clearTool();
}
export const restorePanel = () => showPanel(getPref('panelopen', false), { save: false });
export const suspendPanel = () => showPanel(false, { save: false });
editBtn.addEventListener('click', () => showPanel(panel.hidden));
document.getElementById('tp-ocr').addEventListener('click', () => toggleOcr());
document.getElementById('tp-hide').addEventListener('click', () => showPanel(false));
