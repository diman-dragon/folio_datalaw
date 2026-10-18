// Library cover taken from the first page the viewer already rendered (saves a second pdf.js render).
import { getCover, setCover } from '../data/covers.js';
import { coverFromCanvas } from '../formats/pdf/cover-from-canvas.js';
import { emit } from '../core/bus.js';
export function coverFromView(meta, pageIndex, canvas) {
  if (pageIndex !== 0 || getCover(meta.id)) return;
  try {
    setCover(meta.id, coverFromCanvas(canvas));
    emit('libchange');
  } catch { /* a cover is optional */ }
}
