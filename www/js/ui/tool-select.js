// Tool buttons of the palette: picking / un-picking a tool (clicking the active one turns it off).
import { setDrawTool } from './draw-state.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
const buttons = [...document.querySelectorAll('#tools-panel [data-tool]')];
let tool = null;
function pick(next) {
  tool = next;
  buttons.forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
  setDrawTool(tool);
  if (tool === 'text-select' || tool === 'underline') toast(t('edit.hintMark'));
}
export const clearTool = () => { if (tool) pick(null); };
export const hasTool = () => tool !== null;
buttons.forEach((b) => b.addEventListener('click', () => pick(tool === b.dataset.tool ? null : b.dataset.tool)));
