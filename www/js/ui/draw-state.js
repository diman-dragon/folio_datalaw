// Active editing tool and colour (state only). Switching a tool announces 'toolchange'; gestures listen to it.
import { emit } from '../core/bus.js';
const root = document.getElementById('viewer');
const FREEHAND = ['pen', 'highlighter', 'eraser'];
let tool = null, color = '#2563eb';
export const getDrawTool = () => tool;
export const getDrawColor = () => color;
export function setDrawColor(c) {
  color = c;
  emit('colorchange', c);
}
export function setDrawTool(next) {
  tool = next;
  root.classList.toggle('draw-active', FREEHAND.includes(next));
  root.dataset.editTool = next ?? '';
  emit('toolchange', next);
}
