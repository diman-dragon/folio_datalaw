// Esc handling for transient editing state: closes a selection, then a tool, then the thumbnail overlay.
import { getSel, clearSel } from './text-select.js';
import { hasTool, clearTool } from './tools-panel.js';
import { closeThumbs } from './thumbs-panel.js';
export function dismissTransient() {
  if (getSel()) { clearSel(); return true; }
  if (hasTool()) { clearTool(); return true; }
  return closeThumbs();
}
