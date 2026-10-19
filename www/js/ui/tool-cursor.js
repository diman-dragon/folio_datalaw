// Sets the page-area mouse cursor to the chosen editing tool (and its colour); removed when no tool is active.
import { getDrawTool, getDrawColor } from './draw-state.js';
import { cursorCss } from './cursor-svg.js';
import { on } from '../core/bus.js';
const root = document.getElementById('viewer');
function apply() {
  const css = cursorCss(getDrawTool(), getDrawColor());
  if (css) root.style.setProperty('--tool-cursor', css); else root.style.removeProperty('--tool-cursor');
}
on('toolchange', apply);
on('colorchange', apply);
