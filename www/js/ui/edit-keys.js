// Editing shortcuts while the viewer is open: Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo, Ctrl+C copies the selection.
import { getSel } from './text-select.js';
import { copySelection } from './text-copy.js';
const root = document.getElementById('viewer');
const click = (id) => { const b = document.getElementById(id); if (!b.disabled) b.click(); };
document.addEventListener('keydown', (e) => {
  if (root.hidden || !(e.ctrlKey || e.metaKey) || e.target.closest?.('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) click('undo-btn');
  else if (k === 'y' || (k === 'z' && e.shiftKey)) click('redo-btn');
  else if (k === 'c' && getSel()) copySelection();
  else return;
  e.preventDefault();
});
