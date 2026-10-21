// Text per page for selection: the native text layer first, the recognized (OCR) layer for pages that have none.
import { getPageText } from './page-chars.js';
import { ocrText } from '../../core/ocr-geom.js';
export const TEXT_MIN = 20; // in a PDF fewer chars than this (page numbers, stamps) does not make a page "text"
// exact tables (FB2) are real text however short, so such pages never need OCR
export const hasEnough = (T) => T.chars.length >= TEXT_MIN || (T.exact === true && T.chars.length > 0);
const KEEP = 30; // native char tables kept in memory
// `native` turns a page into a char table: pdf.js pages through getPageText, FB2 pages know their own text (page.chars).
export function createTextSource(pdf, native = (page) => (page.chars ? page.chars() : getPageText(page))) {
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
      return hasEnough(T) || !ocr.has(i) ? T : ocrText(ocr.get(i));
    },
    hasText: async (i) => ocr.has(i) || hasEnough(await nativeText(i)),
    setOcr: (i, data) => ocr.set(i, data),
  };
}
