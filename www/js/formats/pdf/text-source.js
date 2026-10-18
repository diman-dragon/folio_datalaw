// Text per page for selection: the native text layer first, the recognized (OCR) layer for pages that have none.
import { getPageText } from './page-chars.js';
import { ocrText } from '../../core/ocr-geom.js';
export const TEXT_MIN = 20; // fewer chars than this (page numbers, stamps) does not make a page "text"
const KEEP = 30; // native char tables kept in memory
export function createTextSource(pdf, native = getPageText) {
  const ocr = new Map();
  const cache = new Map();
  const nativeText = (i) => {
    if (!cache.has(i)) {
      cache.set(i, pdf.getPage(i + 1).then(native));
      if (cache.size > KEEP) cache.delete(cache.keys().next().value);
    }
    return cache.get(i);
  };
  return {
    getText: async (i) => {
      const T = await nativeText(i);
      return T.chars.length >= TEXT_MIN || !ocr.has(i) ? T : ocrText(ocr.get(i));
    },
    hasText: async (i) => ocr.has(i) || (await nativeText(i)).chars.length >= TEXT_MIN,
    setOcr: (i, data) => ocr.set(i, data),
  };
}
