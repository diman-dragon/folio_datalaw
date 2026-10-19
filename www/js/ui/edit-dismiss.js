// Esc handling for transient editing state: closes the OCR sheet, a selection, a tool, then the OCR sheet / thumbnail overlay.
import { getSel, clearSel } from './text-select.js';
import { hasTool, clearTool } from './tool-select.js';
import { closeThumbs } from './thumbs-panel.js';
import { ocrSheetOpen, hideOcr } from './ocr-menu.js';
export function dismissTransient() {
  if (ocrSheetOpen()) { hideOcr(); return true; }
  if (getSel()) { clearSel(); return true; }
  if (hasTool()) { clearTool(); return true; }
  return closeThumbs();
}
