// Generates and stores a library cover when the document has none yet.
import { getCover, setCover } from '../data/covers.js';
import { pdfCover } from '../formats/pdf/cover.js';
import { emit } from '../core/bus.js';
export async function ensureCover(meta, pdf) {
  if (getCover(meta.id)) return;
  try {
    setCover(meta.id, await pdfCover(pdf));
    emit('libchange');
  } catch { /* a cover is optional */ }
}
