// Floating tool palette over the document: tools, colours, lock position, hide.
import { setDrawTool, setDrawColor } from './viewer-draw.js';
import { initPanelDrag } from './panel-drag.js';
import { toggleOcr } from './ocr-menu.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
import { emit } from '../core/bus.js';
import { getPref, setPref } from '../core/prefs.js';
const panel = document.getElementById('tools-panel');
const editBtn = document.getElementById('edit-btn');
const tools = [...panel.querySelectorAll('[data-tool]')];
const dots = panel.querySelectorAll('.color-dot[data-color]');
const custom = document.getElementById('tp-custom');
let pinned = getPref('panelpinned', false), tool = null;
const place = initPanelDrag(panel, () => pinned);
function pick(next) {
  tool = next;
  tools.forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
  setDrawTool(tool);
  if (tool === 'text-select' || tool === 'underline') toast(t('edit.hintMark'));
}
export const clearTool = () => { if (tool) pick(null); };
export const hasTool = () => tool !== null;
export function showPanel(open, { save = true } = {}) {
  panel.hidden = !open;
  editBtn.classList.toggle('active', open);
  if (save) setPref('panelopen', open);
  if (open) place(); else clearTool();
  emit('editbar', open);
}
export const restorePanel = () => showPanel(getPref('panelopen', false), { save: false });
export const suspendPanel = () => showPanel(false, { save: false });
editBtn.addEventListener('click', () => showPanel(panel.hidden));
document.getElementById('tp-ocr').addEventListener('click', () => toggleOcr());
document.getElementById('tp-hide').addEventListener('click', () => showPanel(false));
const pinBtn = document.getElementById('tp-pin');
const paintPin = () => { pinBtn.classList.toggle('on', pinned); panel.classList.toggle('pinned', pinned); };
pinBtn.addEventListener('click', () => { pinned = !pinned; setPref('panelpinned', pinned); paintPin(); });
tools.forEach((b) => b.addEventListener('click', () => pick(tool === b.dataset.tool ? null : b.dataset.tool)));
const customDot = custom.parentElement;
function setColor(c, from) {
  dots.forEach((x) => x.classList.toggle('active', x === from));
  customDot.classList.toggle('active', from === customDot);
  setDrawColor(c);
  setPref('color', c);
}
dots.forEach((d) => d.addEventListener('click', () => setColor(d.dataset.color, d)));
custom.addEventListener('input', () => { customDot.style.setProperty('--c', custom.value); setColor(custom.value, customDot); });
const saved = getPref('color', null);
const found = [...dots].find((d) => d.dataset.color === saved);
if (saved && found) setColor(saved, found);
else if (saved) { custom.value = saved; customDot.style.setProperty('--c', saved); setColor(saved, customDot); }
paintPin();
