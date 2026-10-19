// Bubble menu buttons: Copy / Highlight / Underline act on the current selection, then the selection is cleared.
import { onMenuAction } from './text-menu.js';
import { getSel, clearSel } from './text-select.js';
import { applyMark } from './text-marks.js';
import { copySelection } from './text-copy.js';
onMenuAction(async (act) => {
  const s = getSel();
  if (!s) return;
  if (act === 'copy') await copySelection();
  else applyMark(act === 'hl' ? 'th' : 'tu', s.el, s.T, s.a, s.b);
  clearSel();
});
